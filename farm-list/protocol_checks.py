#!/usr/bin/env python3
"""Direct protocol-API cross-checks for farms the aggregate sources miss.

Each source joins on an exact identity (vault name or address), so
disagreement is meaningful. Note: several of these APIs are the same
origin DefiLlama's adapter reads, so agreement mainly proves freshness —
still valuable (the biggest observed failure mode is stale adapters).
On-chain realized checks stay the independent layer; where a source
exposes a vault address, it is offered for the registry.

Sources (all on already-allowlisted domains):
- api.ipor.io          Fusion by IPOR (join: vault name == poolMeta)
- api.beefy.finance    Beefy (join: chain + coin-set, unique only)
- vaults.api.prod.ember.so  Ember (join: vault name == poolMeta)
- yieldz.io euler_vault list  Euler EVK (join: chain + asset + TVL)
"""
import gzip
import json
import urllib.request

UA = 'Mozilla/5.0 (X11; Linux x86_64) farm-list-verifier'
CHAIN_BY_ID = {1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 10: 'OP Mainnet',
               137: 'Polygon', 56: 'BSC', 100: 'Gnosis', 59144: 'Linea',
               143: 'Monad', 999: 'Hyperliquid L1', 43114: 'Avalanche',
               5000: 'Mantle', 9745: 'Plasma', 130: 'Unichain', 146: 'Sonic'}
BEEFY_CHAINS = {'ethereum': 'Ethereum', 'base': 'Base', 'arbitrum': 'Arbitrum',
                'optimism': 'OP Mainnet', 'polygon': 'Polygon', 'bsc': 'BSC',
                'gnosis': 'Gnosis', 'linea': 'Linea', 'avax': 'Avalanche',
                'mantle': 'Mantle', 'fraxtal': 'Fraxtal', 'monad': 'Monad'}
EMBER_CHAINS = {'ethereum': 'Ethereum', 'base': 'Base', 'arbitrum': 'Arbitrum'}


def _fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA,
                                               'Accept-Encoding': 'gzip'})
    raw = urllib.request.urlopen(req, timeout=60).read()
    if raw[:2] == b'\x1f\x8b':
        raw = gzip.decompress(raw)
    return json.loads(raw)


def load_protocol_sources():
    src = {}
    try:
        d = _fetch('https://api.ipor.io/fusion/vaults')
        src['ipor'] = {(v.get('name') or '').strip().lower(): v
                       for v in (d.get('vaults') or d)}
        print(f"protocol-checks: ipor {len(src['ipor'])} vaults")
    except Exception as e:
        print('protocol-checks: ipor failed:', type(e).__name__)
    try:
        vaults = _fetch('https://api.beefy.finance/vaults')
        apys = _fetch('https://api.beefy.finance/apy/breakdown')
        idx = {}
        for v in vaults:
            if v.get('status') != 'active':
                continue
            chain = BEEFY_CHAINS.get(v.get('chain'))
            coins = frozenset((a or '').upper() for a in v.get('assets') or [])
            apy = (apys.get(v['id']) or {}).get('totalApy')
            if chain and coins and apy is not None:
                idx.setdefault((chain, coins), []).append(
                    dict(apy=apy * 100, address=v.get('earnContractAddress')))
        src['beefy'] = idx
        print(f"protocol-checks: beefy {len(idx)} coin-set keys")
    except Exception as e:
        print('protocol-checks: beefy failed:', type(e).__name__)
    try:
        d = _fetch('https://vaults.api.prod.ember.so/api/v2/vaults')
        idx = {}
        for v in d:
            name = (v.get('name') or '').strip().lower()
            for ch, det in (v.get('detailsByChain') or {}).items():
                chain = EMBER_CHAINS.get(ch)
                if name and chain and det.get('address'):
                    idx[(name, chain)] = dict(address=det['address'])
        src['ember'] = idx
        print(f"protocol-checks: ember {len(idx)} vault-chain entries")
    except Exception as e:
        print('protocol-checks: ember failed:', type(e).__name__)
    try:
        idx, sym_idx = {}, {}
        for cid, chain in [(1, 'Ethereum'), (8453, 'Base'), (42161, 'Arbitrum'),
                           (10, 'OP Mainnet'), (137, 'Polygon'), (747474, 'Katana')]:
            try:
                for v in _fetch(f'https://ydaemon.yearn.fi/{cid}/vaults/all'):
                    name = (v.get('name') or '').strip().lower()
                    apr = ((v.get('apr') or {}).get('netAPR'))
                    if apr is None or not -0.05 <= apr <= 3:  # drop broken feeds
                        continue
                    ent = dict(apy=apr * 100, address=v.get('address'),
                               tvl=((v.get('tvl') or {}).get('tvl')) or 0)
                    if name:
                        idx[(chain, name)] = ent
                    sym = (v.get('symbol') or '').strip().upper()
                    if sym:
                        sym_idx.setdefault((chain, sym), []).append(ent)
            except Exception:
                continue
        src['yearn'] = idx
        src['yearn_sym'] = sym_idx
        print(f"protocol-checks: yearn {len(idx)} vaults")
    except Exception as e:
        print('protocol-checks: yearn failed:', type(e).__name__)
    try:
        d = _fetch('https://yieldz.io/api/vaults?include_unwhitelisted=true&protocol=euler_vault')
        idx = {}
        for v in d.get('data', []):
            chain = CHAIN_BY_ID.get(v.get('chain_id'))
            sym = ((v.get('loan_asset') or {}).get('symbol') or '').upper()
            if chain:
                idx.setdefault((chain, sym), []).append(
                    dict(apy=v.get('supply_apy'), address=v.get('id'),
                         tvl=v.get('total_supply_usd') or 0,
                         chain_id=v.get('chain_id')))
        src['euler'] = idx
        print(f"protocol-checks: euler {sum(len(v) for v in idx.values())} vaults")
    except Exception as e:
        print('protocol-checks: euler failed:', type(e).__name__)
    return src


def check_row(row, src):
    """Return (src_val, matched, label, address_for_registry) or Nones."""
    tol = lambda a, b: abs(a - b) <= max(0.75, 0.25 * max(abs(a), abs(b)))
    # some adapters report only a headline APY with no component split
    total = row.get('now')
    if total is None:
        total = (row.get('base') or 0) + (row.get('rew') or 0) + (row.get('intr') or 0)

    if row['name'] == 'Fusion by IPOR' and 'ipor' in src:
        v = src['ipor'].get((row.get('meta') or '').strip().lower())
        if v:
            cands = [float(v.get(k) or 0) for k in ('apy', 'grossApy', 'netApy', 'apr30d')
                     if v.get(k) is not None]
            ok = any(tol(total, c) for c in cands)
            best = min(cands, key=lambda c: abs(c - total)) if cands else None
            return (round(best, 3) if best is not None else None, ok,
                    'ipor-api', v.get('address'))

    if row['name'] == 'Beefy' and 'beefy' in src:
        coins = frozenset(s.upper() for s in row['symbol'].split('-') if s)
        cands = src['beefy'].get((row['chain'], coins), [])
        if len(cands) == 1:
            ok = tol(total, cands[0]['apy'])
            return round(cands[0]['apy'], 3), ok, 'beefy-api', cands[0].get('address')

    if row['name'] == 'Ember Protocol' and 'ember' in src:
        v = src['ember'].get(((row.get('meta') or '').strip().lower(), row['chain']))
        if v:
            # no reliable APY field — offer the address for on-chain checks
            return None, None, None, v.get('address')

    if row['name'] == 'Yearn Finance' and 'yearn' in src:
        # DL poolMeta is usually empty for Yearn; the carried display name or
        # the vault symbol (TVL-gated: yBOLD vs ysyBOLD share a prefix) works
        v = None
        for key in (row.get('meta'), row.get('farm_disp')):
            v = src['yearn'].get((row['chain'], (key or '').strip().lower()))
            if v:
                break
        if not v:
            cands = (src.get('yearn_sym') or {}).get((row['chain'], row['symbol'].upper()), [])
            cands = [c for c in cands if c['tvl']
                     and 0.5 <= (c['tvl'] + 1) / ((row.get('tvl') or 0) + 1) <= 2]
            if len(cands) == 1:
                v = cands[0]
        if v:
            base = row.get('base') if row.get('base') is not None else total
            ok = tol(base or 0, v['apy']) or tol(total or 0, v['apy'])
            return round(v['apy'], 3), ok, 'ydaemon', v.get('address')

    if row['name'] == 'Euler V2' and 'euler' in src:
        cands = src['euler'].get((row['chain'], row['symbol'].upper()), [])
        if cands:
            m = min(cands, key=lambda c: abs(c['tvl'] - (row.get('tvl') or 0)))
            ratio = (m['tvl'] + 1) / ((row.get('tvl') or 0) + 1)
            if 0.5 <= ratio <= 2 and m.get('apy') is not None:
                base = row.get('base') or 0
                ok = tol(base, m['apy']) or tol(total, m['apy'])
                return round(m['apy'], 3), ok, 'euler/yieldz', m.get('address')
    return None, None, None, None
