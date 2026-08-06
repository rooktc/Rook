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


def _fetch(url, payload=None):
    headers = {'User-Agent': UA, 'Accept-Encoding': 'gzip'}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode()
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=headers)
    raw = urllib.request.urlopen(req, timeout=60).read()
    if raw[:2] == b'\x1f\x8b':
        raw = gzip.decompress(raw)
    return json.loads(raw)


def _rpc_call(chain_id, to, data):
    d = _fetch(f'https://yieldz.io/api/rpc/{chain_id}',
               {'jsonrpc': '2.0', 'id': 1, 'method': 'eth_call',
                'params': [{'to': to, 'data': data}, 'latest']})
    return d.get('result')


CURVANCE_READER = '0x878cDfc2F3D96a49A5CbD805FAF4F3080768a6d2'  # Monad


def _load_curvance():
    """Live supply rates from Curvance's protocol reader on Monad.

    getDynamicMarketData() returns per-manager token tuples whose supplyRate
    is per-second WAD; DL's poolMeta is the manager's underlying-symbol list,
    so (symbol-set, symbol) is an exact join. Same method as DL's adapter but
    executed fresh on-chain — catches stale adapter runs.
    """
    raw = _rpc_call(143, CURVANCE_READER, '0xa1c93f35')  # getDynamicMarketData()
    data = bytes.fromhex(raw[2:])
    word = lambda i: int.from_bytes(data[i:i + 32], 'big')
    arr = word(0)
    managers = []
    for i in range(word(arr)):
        mpos = arr + 32 + word(arr + 32 + 32 * i)
        tpos = mpos + word(mpos + 32)
        toks = []
        for j in range(word(tpos)):
            base = tpos + 32 + j * 13 * 32
            addr = '0x' + data[base + 12:base + 32].hex()
            toks.append((addr, word(base + 11 * 32) / 1e18 * 31_536_000 * 100))
        managers.append(toks)

    def batch_call(targets, selector):
        import time
        out = []
        for i in range(0, len(targets), 10):   # proxy rejects batches >~25;
            chunk = targets[i:i + 10]          # upstream rate-limits bursts
            batch = [{'jsonrpc': '2.0', 'id': j, 'method': 'eth_call',
                      'params': [{'to': t, 'data': selector}, 'latest']}
                     for j, t in enumerate(chunk)]
            by_id = {}
            for attempt in range(5):
                try:
                    res = _fetch('https://yieldz.io/api/rpc/143', batch)
                    by_id = {r.get('id'): r.get('result') for r in res
                             if isinstance(r, dict) and r.get('result')}
                    if len(by_id) == len(chunk):
                        break
                except Exception:
                    pass
                time.sleep(1.5 * (attempt + 1))
            out.extend(by_id.get(j) for j in range(len(chunk)))
            time.sleep(0.5)
        return out

    tokens = [t for toks in managers for t, _ in toks]
    assets = ['0x' + (a or '0' * 64)[-40:]
              for a in batch_call(tokens, '0x38d52e0f')]        # asset()
    syms = []
    for s in batch_call(assets, '0x95d89b41'):                  # symbol()
        try:
            b = bytes.fromhex(s[2:])
            ln = int.from_bytes(b[32:64], 'big')
            syms.append(b[64:64 + ln].decode())
        except Exception:
            syms.append(None)
    sym_by_token = dict(zip(tokens, syms))

    idx = {}
    for toks in managers:
        s_list = [sym_by_token.get(t) for t, _ in toks]
        if any(s is None for s in s_list):
            continue
        sym_set = frozenset(s.upper() for s in s_list)
        for (t, apy), s in zip(toks, s_list):
            key = (sym_set, s.upper())
            # collisions (two managers with identical symbol pairs) are dropped
            idx[key] = None if key in idx else dict(apy=apy, addr=t)
    return {k: v for k, v in idx.items() if v is not None}


def load_protocol_sources():
    src = {}
    try:
        d = _fetch('https://api.ipor.io/fusion/vaults')
        idx = {}
        for v in (d.get('vaults') or d):
            key = (v.get('name') or '').strip().lower()
            # names repeat across deprecated instances — keep the live one
            if key not in idx or float(v.get('tvl') or 0) > float(idx[key].get('tvl') or 0):
                idx[key] = v
        src['ipor'] = idx
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
                    strats = []
                    for st in v.get('strategies') or []:
                        det = st.get('details') or {}
                        try:
                            debt = float(det.get('totalDebt') or 0)
                        except (TypeError, ValueError):
                            debt = 0
                        if st.get('name') and debt > 0:
                            strats.append((st['name'], debt))
                    ent = dict(apy=apr * 100, address=v.get('address'),
                               tvl=((v.get('tvl') or {}).get('tvl')) or 0,
                               strats=strats)
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
        idx, mkts = {}, {}
        for m in _fetch('https://api.kamino.finance/v2/kamino-market'):
            try:
                res = _fetch(f"https://api.kamino.finance/kamino-market/"
                             f"{m['lendingMarket']}/reserves/metrics?env=mainnet-beta")
            except Exception:
                continue
            name = (m.get('name') or '').strip().lower()
            for r in res:
                mint = r.get('liquidityTokenMint')
                if mint and r.get('supplyApy') is not None:
                    supply = float(r.get('totalSupplyUsd') or 0)
                    borrow = float(r.get('totalBorrowUsd') or 0)
                    # markets can hold several reserves of the same mint
                    idx.setdefault((name, mint), []).append(dict(
                        apy=float(r['supplyApy']) * 100, tvl=supply - borrow,
                        util=(borrow / supply) if supply > 0 else None))
                    mkts.setdefault(name, []).append(
                        (r.get('liquidityToken'), mint, supply))
        src['kamino'] = idx
        src['kamino_markets'] = mkts
        print(f"protocol-checks: kamino {len(idx)} reserves")
    except Exception as e:
        print('protocol-checks: kamino failed:', type(e).__name__)
    try:
        d = _fetch('https://tars.loopscale.com/v1/markets/lending_vaults/stats',
                   {'page': 0, 'pageSize': 100})
        idx = {}
        for v in d:
            mint = v.get('principalMint')
            if mint and v.get('apy') is not None:
                idx.setdefault(mint, []).append(dict(
                    base=float(v['apy']), rew=float(v.get('rewardsApy') or 0),
                    tvl=float(v.get('principalDepositsUsd') or 0)
                        - float(v.get('principalDeployedUsd') or 0)))
        src['loopscale'] = idx
        print(f"protocol-checks: loopscale {sum(len(v) for v in idx.values())} vaults")
    except Exception as e:
        print('protocol-checks: loopscale failed:', type(e).__name__)
    try:
        rewmap = {}
        try:
            cfg = _fetch('https://api.current.finance/pebbleWeb3Config/getAllMarketConfig')
            for m in cfg.get('data') or []:
                for sm in m.get('summaries') or []:
                    if sm.get('rewardType') == 0:   # supply-side rewards
                        key = (m.get('marketID'), sm.get('reserveCoinType'))
                        rewmap[key] = rewmap.get(key, 0) + sum(
                            (r.get('apr') or 0) for r in sm.get('rewards') or []) * 100
        except Exception:
            pass
        idx = {}
        for mt in ('MainMarket', 'AltCoinMarket', 'EmberMarket',
                   'MatrixGoldMarket', 'EthenaMarket'):
            d = _fetch(f'https://api.current.finance/market/getMarketList'
                       f'?marketType={mt}&page=1&size=100')
            for p in (d.get('data') or {}).get('content') or []:
                key = ((p.get('name') or '').strip().lower(),
                       ('0x' + p['token']).lower())
                idx[key] = dict(apy=float(p.get('supplyAPY') or 0) * 100
                                + float(p.get('apy') or 0),
                                rew=rewmap.get((p.get('marketID'), p.get('token'))))
        src['current'] = idx
        print(f"protocol-checks: current {len(idx)} markets")
    except Exception as e:
        print('protocol-checks: current failed:', type(e).__name__)
    try:
        d = _fetch('https://api.0.xyz/v0/bankMetrics')
        idx = {}
        for b in d.get('banks') or []:
            mint = b.get('mint')
            if mint and b.get('depositApy') is not None:
                # DL's tvl for lending pools is idle liquidity, not deposits
                idx.setdefault(mint, []).append(dict(
                    apy=float(b['depositApy']) * 100,
                    tvl=max(float(b.get('totalDepositsUsd') or 0)
                            - float(b.get('totalBorrowsUsd') or 0), 0)))
        src['project0'] = idx
        print(f"protocol-checks: project-0 {sum(len(v) for v in idx.values())} banks")
    except Exception as e:
        print('protocol-checks: project-0 failed:', type(e).__name__)
    try:
        src['curvance'] = _load_curvance()
        print(f"protocol-checks: curvance {len(src['curvance'])} markets (on-chain)")
    except Exception as e:
        print('protocol-checks: curvance failed:', type(e).__name__)
    try:
        d = _fetch('https://yieldz.io/api/vaults?include_unwhitelisted=true&protocol=euler_vault')
        idx = {}
        for v in d.get('data', []):
            chain = CHAIN_BY_ID.get(v.get('chain_id'))
            sym = ((v.get('loan_asset') or {}).get('symbol') or '').upper()
            if chain:
                pd = v.get('protocol_data') or {}
                collat = [(c.get('symbol'), float(c.get('allocationPercentage') or 0))
                          for c in pd.get('currentCollateralAllocations') or []
                          if c.get('symbol')]
                idx.setdefault((chain, sym), []).append(
                    dict(apy=v.get('supply_apy'), address=v.get('id'),
                         tvl=v.get('total_supply_usd') or 0,
                         chain_id=v.get('chain_id'),
                         collat=collat, util=v.get('utilization')))
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
        v, weak = None, False
        for key in (row.get('meta'), row.get('farm_disp')):
            v = src['yearn'].get((row['chain'], (key or '').strip().lower()))
            if v:
                break
        if not v:
            cands = (src.get('yearn_sym') or {}).get((row['chain'], row['symbol'].upper()), [])
            cands = [c for c in cands if c['tvl']
                     and 0.5 <= (c['tvl'] + 1) / ((row.get('tvl') or 0) + 1) <= 2]
            if len(cands) == 1:
                v, weak = cands[0], True
        if v:
            base = row.get('base') if row.get('base') is not None else total
            ok = tol(base or 0, v['apy']) or tol(total or 0, v['apy'])
            if weak and not ok:
                # a ticker+TVL pairing is too loose to accuse (yBOLD's 0%
                # twin vault can pass the gate) — treat as no match
                v = None
            else:
                if v.get('strats') and not row.get('collat'):
                    row['_strategy_book'] = v['strats']
                return round(v['apy'], 3), ok, 'ydaemon', v.get('address')

    # base-only sources: comparing a ~0 base against a ~0 source says nothing
    # about a farm whose displayed APY is all emissions — skip those
    def base_check(src_apy, label, tvl=None):
        base = row.get('base') if row.get('base') is not None else total
        if abs(src_apy) < 0.05 and abs(base or 0) < 0.05 and (total or 0) > 1:
            return None
        if tvl is not None:
            ratio = (tvl + 1) / ((row.get('tvl') or 0) + 1)
            if not 0.5 <= ratio <= 2:
                return None
        ok = tol(base or 0, src_apy) or tol(total or 0, src_apy)
        return round(src_apy, 3), ok, label, None

    def tvl_nearest(cands, lo=0.5, hi=2):
        rtvl = (row.get('tvl') or 0) + 1
        cands = [c for c in cands if c['tvl'] and lo <= (c['tvl'] + 1) / rtvl <= hi]
        if not cands:
            return None
        return min(cands, key=lambda c: abs(c['tvl'] + 1 - rtvl))

    if row['name'] == 'Kamino Lend' and 'kamino' in src:
        mkt = (row.get('meta') or '').strip().lower()
        cands = src['kamino'].get((mkt, row.get('_underlying') or ''), [])
        v = tvl_nearest(cands)
        if v:
            # pool-level isolation: the market's other reserves are the
            # collateral this deposit is exposed to (supply-weighted proxy)
            if not row.get('collat'):
                others = [(sym, sup) for sym, mint, sup
                          in src.get('kamino_markets', {}).get(mkt, [])
                          if mint != row.get('_underlying') and sup > 0]
                if others:
                    row['collat'] = others
                    row['collat_kind'] = 'market reserves'
            if row.get('util') is None and v.get('util') is not None:
                row['util'] = v['util']
            r = base_check(v['apy'], 'kamino-api')
            if r:
                return r

    if row['name'] == 'Loopscale' and 'loopscale' in src:
        c = tvl_nearest(src['loopscale'].get(row.get('_underlying') or '', []))
        if c:
            ok = (tol(row.get('base') or 0, c['base'])
                  or tol(total or 0, c['base'] + c['rew']))
            if ok and c['rew'] > 0:
                row['_rew_confirmed'] = 'loopscale'
            return round(c['base'] + c['rew'], 3), ok, 'loopscale-api', None

    if row['name'] == 'Current' and 'current' in src:
        v = src['current'].get(((row.get('meta') or '').strip().lower(),
                                (row.get('_underlying') or '').lower()))
        if v:
            vr, rw = v.get('rew'), row.get('rew') or 0
            if vr is not None and rw > 0 and abs(vr - rw) <= max(1.0, 0.35 * max(vr, rw)):
                row['_rew_confirmed'] = 'current-api'
            r = base_check(v['apy'], 'current-api')
            if r:
                return r

    if row['name'] == 'Project 0' and 'project0' in src:
        cands = src['project0'].get(row.get('_underlying') or '', [])
        v = cands[0] if len(cands) == 1 else tvl_nearest(cands, 0.3, 3)
        if v:
            r = base_check(v['apy'], 'p0-api')
            if r:
                return r

    if row['name'] == 'Curvance' and 'curvance' in src:
        meta = (row.get('meta') or '')
        if '/' in meta:
            key = (frozenset(s.upper() for s in meta.split('/')),
                   row['symbol'].upper())
            ent = src['curvance'].get(key)
            if ent is not None:
                row.setdefault('_pool_addrs', []).append(ent['addr'])
                r = base_check(ent['apy'], 'curvance on-chain')
                if r:
                    return r

    if row['name'] == 'Euler V2' and 'euler' in src:
        cands = src['euler'].get((row['chain'], row['symbol'].upper()), [])
        if cands:
            m = min(cands, key=lambda c: abs(c['tvl'] - (row.get('tvl') or 0)))
            ratio = (m['tvl'] + 1) / ((row.get('tvl') or 0) + 1)
            if 0.5 <= ratio <= 2 and m.get('apy') is not None:
                if m.get('collat') and not row.get('collat'):
                    row['collat'] = m['collat']
                    row['collat_kind'] = 'collateral'
                if row.get('util') is None and m.get('util') is not None:
                    row['util'] = m['util']
                base = row.get('base') or 0
                ok = tol(base, m['apy']) or tol(total, m['apy'])
                return round(m['apy'], 3), ok, 'euler/yieldz', m.get('address')
    return None, None, None, None
