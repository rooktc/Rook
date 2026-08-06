#!/usr/bin/env python3
"""Harvest asset risk scores from TID Research and Yearn curation reports
into risk_scores.json, keyed by normalized asset symbol.

- TID (staging.tidresearch.com/reports/): overall score 1-10, higher = safer
- Yearn curation (curation.yearn.fi/reports/): score 1-5, lower = safer,
  with the label in the page ("Low Risk", "Elevated Risk", ...)
- Pharos (api.pharos.watch): safety letter grades, X-API-Key auth. Key comes
  from $PHAROS_API_KEY or the git-ignored .pharos_key file next to this
  script; requires api.pharos.watch on the egress allowlist. 30 rpm limit.

Usage: risk_harvest.py <risk_scores.json>
"""
import json
import os
import re
import sys
import time
import urllib.request

UA = 'Mozilla/5.0 (X11; Linux x86_64) farm-list-verifier'
TID = 'https://staging.tidresearch.com'
YEARN = 'https://curation.yearn.fi'
PHAROS = 'https://api.pharos.watch'


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode(errors='replace')


def pharos_key():
    key = os.environ.get('PHAROS_API_KEY')
    if key:
        return key.strip()
    try:
        return open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 '.pharos_key')).read().strip()
    except Exception:
        return None


def norm(sym):
    return re.sub(r'[^A-Z0-9]', '', (sym or '').upper())


def harvest_tid(scores):
    listing = fetch(f'{TID}/reports/')
    slugs = sorted(set(re.findall(r'href="/reports/([a-z0-9-]+)"', listing)))
    print(f'tid: {len(slugs)} reports')
    for slug in slugs:
        try:
            page = fetch(f'{TID}/reports/{slug}/')
        except Exception:
            continue
        # the score badge follows the "Overall Score" eyebrow inside a span;
        # a summary table row (<strong>Overall</strong> ... <strong>6.5</strong>)
        # is the fallback
        m = (re.search(r'Overall Score</div>\s*<span[^>]*>\s*(\d{1,2}(?:\.\d)?)\s*</span>', page, re.S)
             or re.search(r'<strong>Overall</strong></td><td><strong>(\d{1,2}(?:\.\d)?)</strong>', page))
        if not m:
            continue
        score = float(m.group(1))
        if not 0 <= score <= 10:
            continue
        # asset symbol: displayed title is more reliable than the slug
        t = re.search(r'<title>([^<|—-]+)', page)
        sym = norm((t.group(1).split()[0] if t else slug.split('-')[0]))
        key = sym or norm(slug.split('-')[0])
        entry = dict(source='tid', score=score, scale='1-10 higher=safer',
                     url=f'{TID}/reports/{slug}/')
        scores.setdefault(key, []).append(entry)
    return scores


def harvest_yearn(scores):
    listing = fetch(f'{YEARN}/reports/')
    slugs = sorted(set(re.findall(r'href="/report/([a-z0-9-]+)/"', listing)))
    print(f'yearn: {len(slugs)} reports')
    for slug in slugs:
        try:
            page = fetch(f'{YEARN}/report/{slug}/')
        except Exception:
            continue
        m = re.search(r'Score:\s*([0-9.]+)/5\.0\s*\(([^)]+)\)', page)
        if not m:
            continue
        score, label = float(m.group(1)), m.group(2).strip()
        # asset symbol = slug tail (e.g. kerneldao-hgeth -> HGETH); reports
        # about whole protocols (across-protocol, fluid) keyed by tail too —
        # they simply won't match any asset leg
        key = norm(slug.split('-')[-1])
        entry = dict(source='yearn', score=score, scale='1-5 lower=safer',
                     label=label, url=f'{YEARN}/report/{slug}/')
        scores.setdefault(key, []).append(entry)
    return scores


def harvest_pharos(scores):
    key = pharos_key()
    if not key:
        print('pharos: no API key, skipped')
        return scores
    hdr = {'X-API-Key': key}
    coins = json.loads(fetch(f'{PHAROS}/api/stablecoins', hdr))
    id2sym = {c['id']: norm(c.get('symbol') or '')
              for c in coins.get('peggedAssets', []) if c.get('id')}
    cards = json.loads(fetch(f'{PHAROS}/api/report-cards/v9', hdr)).get('cards', [])
    print(f'pharos: {len(id2sym)} coins, {len(cards)} report cards')
    found = 0
    for c in cards:
        sym = id2sym.get(c.get('id'))
        grade = c.get('grade')
        if not sym or not grade or grade == 'NR':
            continue
        scores.setdefault(sym, []).append(dict(
            source='pharos', score=grade, scale='letter grade (v9)',
            label=grade, num=c.get('score'),
            url=f"https://pharos.watch/stablecoin/{c['id']}/"))
        found += 1
    print(f'pharos: {found} grades')
    return scores


def harvest_credora(scores):
    """Credora (RedStone) DeFi risk ratings — PD/PSL-based letter ratings on
    assets, plus product-level vault ratings keyed by (chain_id, address).
    Served publicly by their app's API. Blurred (paywalled) entries carry no
    rating and are skipped."""
    import re as _re
    import urllib.request as _rq

    def _get(path):
        req = _rq.Request(f'https://app.credora.network/api/{path}',
                          headers={'User-Agent': 'Mozilla/5.0 farm-list-verifier'})
        return json.load(_rq.urlopen(req, timeout=60))

    n = 0
    for a in _get('assets'):
        sym = _re.sub(r'[^A-Z0-9]', '', (a.get('asset_name') or '').upper())
        rating, psl = a.get('metrics_rating'), a.get('metrics_psl')
        if not sym or not rating or a.get('blurred'):
            continue
        scores.setdefault(sym, []).append(dict(
            source='credora', score=rating, scale='PD letter (A+..D)',
            label=rating, psl=psl, url='https://app.credora.network/'))
        n += 1
    vaults = {}
    for v in _get('vaults'):
        rating = v.get('metrics_rating')
        addr, cid = (v.get('address') or '').lower(), v.get('chain_id')
        if rating and addr and cid and not v.get('blurred'):
            vaults[f'{cid}:{addr}'] = dict(
                rating=rating, psl=v.get('metrics_psl'), name=v.get('name'),
                curator=v.get('curator'), protocol=v.get('protocol'))
    scores['_credora_vaults'] = vaults
    print(f'credora: {n} asset ratings, {len(vaults)} vault ratings')
    return scores


def main(outfile):
    scores = {}
    for name, fn in [('tid', harvest_tid), ('yearn', harvest_yearn),
                     ('pharos', harvest_pharos), ('credora', harvest_credora)]:
        try:
            fn(scores)
        except Exception as e:
            print(f'{name} failed: {type(e).__name__}: {e}')
    json.dump(scores, open(outfile, 'w'), indent=1)
    print(f'{sum(len(v) for v in scores.values())} scores across {len(scores)} assets -> {outfile}')


if __name__ == '__main__':
    main(sys.argv[1])
