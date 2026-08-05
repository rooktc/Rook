#!/usr/bin/env python3
"""Harvest vault contract addresses from newly allowlisted protocol APIs and
merge them into vault_registry.json, keyed by DefiLlama pool id.

Each registry entry enables the pipeline's on-chain realized-yield check
(share-price growth via RPC) — the only genuine verification for closed
vaults. Matching to DefiLlama pools is conservative: exact
(chain, symbol) when unique, else unique TVL-nearest within 0.5-2x.

Usage: registry_harvest.py <pools.json> <vault_registry.json>
"""
import gzip
import json
import sys
import urllib.request

UA = 'Mozilla/5.0 (X11; Linux x86_64) farm-list-verifier'
CHAIN_IDS = {1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 10: 'OP Mainnet',
             137: 'Polygon', 56: 'BSC', 100: 'Gnosis', 59144: 'Linea',
             143: 'Monad', 999: 'Hyperliquid L1', 43114: 'Avalanche',
             5000: 'Mantle', 9745: 'Plasma', 480: 'World Chain', 146: 'Sonic'}
BEEFY_CHAINS = {'ethereum': 1, 'base': 8453, 'arbitrum': 42161, 'optimism': 10,
                'polygon': 137, 'bsc': 56, 'gnosis': 100, 'linea': 59144,
                'avax': 43114, 'mantle': 5000, 'fraxtal': 252}


def fetch(url, payload=None):
    headers = {'User-Agent': UA, 'Accept-Encoding': 'gzip'}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode()
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read()
        if raw[:2] == b'\x1f\x8b':
            raw = gzip.decompress(raw)
        return json.loads(raw)


def harvest_ipor():
    out = []
    d = fetch('https://api.ipor.io/fusion/vaults')
    for v in d.get('vaults', d if isinstance(d, list) else []):
        cid = int(v.get('chainId') or 0)
        if cid in CHAIN_IDS and v.get('address'):
            out.append(('fusion-by-ipor', CHAIN_IDS[cid], (v.get('symbol') or v.get('name') or '').upper(),
                        v['address'], cid, float(v.get('tvl') or v.get('totalAssetsUsd') or 0)))
    return out


def harvest_lagoon():
    out = []
    q = '''query GetVaultsData($chainId: Int!, $skip: Int!) {
      vaults(first: 100, skip: $skip, where: {chainId_in: [$chainId], isVisible_eq: true}) {
        pageInfo { hasNextPage }
        items { address symbol chain { id } state { totalAssetsUsd } } } }'''
    for cid in (1, 8453, 42161, 59144, 9745, 43114, 143):
        skip = 0
        while True:
            try:
                d = fetch('https://api.lagoon.finance/query',
                          {'query': q, 'variables': {'chainId': cid, 'skip': skip}})
            except Exception:
                break
            v = (d.get('data') or {}).get('vaults') or {}
            for it in v.get('items', []):
                tvl = float(((it.get('state') or {}).get('totalAssetsUsd')) or 0)
                out.append(('lagoon', CHAIN_IDS.get(cid), (it.get('symbol') or '').upper(),
                            it['address'], cid, tvl))
            if not (v.get('pageInfo') or {}).get('hasNextPage'):
                break
            skip += 100
    return out


def harvest_morpho():
    out = []
    q = '''query V($chainId: Int!, $skip: Int!) {
      vaults(first: 100, skip: $skip,
             where: {chainId_in: [$chainId], totalAssetsUsd_gte: 100000}) {
        pageInfo { countTotal }
        items { address symbol chain { id } state { totalAssetsUsd } } } }'''
    for cid in (1, 8453, 42161, 10, 137, 143, 999):
        skip = 0
        while True:
            try:
                d = fetch('https://api.morpho.org/graphql',
                          {'query': q, 'variables': {'chainId': cid, 'skip': skip}})
            except Exception:
                break
            items = ((d.get('data') or {}).get('vaults') or {}).get('items') or []
            for it in items:
                tvl = float(((it.get('state') or {}).get('totalAssetsUsd')) or 0)
                out.append(('morpho-blue', CHAIN_IDS.get(cid), (it.get('symbol') or '').upper(),
                            it['address'], cid, tvl))
            if len(items) < 100:
                break
            skip += 100
    return out


def harvest_ember():
    out = []
    for v in fetch('https://vaults.api.prod.ember.so/api/v2/vaults'):
        addr = v.get('address') or v.get('vaultAddress')
        cid = int(v.get('chainId') or 0)
        if addr and cid in CHAIN_IDS:
            out.append(('ember-protocol', CHAIN_IDS[cid],
                        (v.get('symbol') or v.get('name') or '').upper(),
                        addr, cid, float(v.get('tvlUsd') or v.get('tvl') or 0)))
    return out


def harvest_beefy():
    out = []
    for v in fetch('https://api.beefy.finance/vaults'):
        if v.get('status') != 'active':
            continue
        cid = BEEFY_CHAINS.get(v.get('chain'))
        addr = v.get('earnContractAddress')
        if cid and addr:
            assets = frozenset((a or '').upper() for a in v.get('assets') or [])
            out.append(('beefy', CHAIN_IDS.get(cid, v['chain']),
                        '-'.join(sorted(assets)), addr, cid, 0, assets))
    return out


def harvest_midas():
    """Midas mToken oracle feeds from DefiLlama's public adapter source:
    the dataFeed's latestAnswer growth is the token's realized NAV yield."""
    import re
    req = urllib.request.Request(
        'https://raw.githubusercontent.com/DefiLlama/yield-server/master/'
        'src/adaptors/midas-rwa/addresses.js', headers={'User-Agent': UA})
    body = urllib.request.urlopen(req, timeout=45).read().decode()
    chain_map = {'ethereum': 1, 'base': 8453, 'arbitrum': 42161, 'optimism': 10,
                 'bsc': 56, 'monad': 143, 'hyperevm': 999, 'plasma': 9745}
    out, chain = [], None
    for line in body.splitlines():
        m = re.match(r'^  (\w+): \{', line)
        if m:
            chain = m.group(1)
        m = re.match(r"^    (\w+): \{", line)
        if m:
            token = m.group(1)
        m = re.search(r"dataFeed: getAddress\('(0x[0-9a-fA-F]{40})'\)", line)
        if m and chain in chain_map:
            out.append(('midas-rwa', CHAIN_IDS.get(chain_map[chain]),
                        token.upper(), m.group(1), chain_map[chain], 0))
    return out


def main(pools_file, registry_file):
    pools = json.load(open(pools_file))['data']
    try:
        registry = json.load(open(registry_file))
    except Exception:
        registry = {}
    harvests = []
    for name, fn in [('ipor', harvest_ipor), ('lagoon', harvest_lagoon),
                     ('morpho', harvest_morpho), ('ember', harvest_ember),
                     ('beefy', harvest_beefy), ('midas', harvest_midas)]:
        try:
            h = fn()
            harvests.extend(h)
            print(f'{name}: {len(h)} vaults')
        except Exception as e:
            print(f'{name} failed: {type(e).__name__}: {e}')

    by_proj = {}
    for h in harvests:
        by_proj.setdefault(h[0], []).append(h)

    added = 0
    for p in pools:
        if p['pool'] in registry or (p['tvlUsd'] or 0) < 400_000:
            continue
        cands = by_proj.get(p['project'], [])
        if not cands:
            continue
        chain, sym = p['chain'], p['symbol'].upper()
        if p['project'] == 'beefy':
            coins = frozenset(s.upper() for s in sym.split('-') if s)
            hits = [c for c in cands if c[1] == chain and c[6] == coins]
            if len(hits) != 1:
                continue
            hit = hits[0]
        else:
            hits = [c for c in cands if c[1] == chain and c[2] == sym]
            if len(hits) != 1:
                tvl = p['tvlUsd'] or 0
                near = [c for c in cands if c[1] == chain and c[5]
                        and 0.5 <= c[5] / max(tvl, 1) <= 2]
                if len(near) != 1:
                    continue
                hit = near[0]
            else:
                hit = hits[0]
        entry = dict(chain_id=hit[4], address=hit[3],
                     note=f'{p["project"]} {p["symbol"]} ({hit[2] or "coin-set"}) — harvested')
        if p['project'] == 'midas-rwa':
            entry['selector'] = '0x50d25bcd'  # chainlink-style latestAnswer()
            entry['note'] += ' (NAV oracle feed)'
        registry[p['pool']] = entry
        added += 1

    json.dump(registry, open(registry_file, 'w'), indent=1)
    print(f'registry: +{added} new, {len(registry)} total -> {registry_file}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
