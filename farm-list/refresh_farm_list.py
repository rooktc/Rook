#!/usr/bin/env python3
"""Daily refresh of the USD/ETH farm-list spreadsheet from the DefiLlama API.

Reproduces the sheet at
https://docs.google.com/spreadsheets/d/1LiEDhK1PtCZH-au9BgNfwlN4_DrnrRSTO8rx4bO0SP4
originally built from defillama.com/yields CSV exports:
  - filters: protocol whitelist, TVL >= $500k, APY <= 100%,
    stablecoin pools (USD tab) / ETH-family pools (ETH tab)
  - sheet rule: keep pools with APY >= 6% (USD) / >= 3% (ETH)
  - "intrinsic" APY (underlying LST/yield-token rate) added the same way the
    site's apyComponents=reward,intrinsic toggle does
  - 7d / 30d columns are trailing averages computed from each pool's daily
    APY history (yields.llama.fi/chart/<pool>)
  - stability rating/score are computed here (coefficient of variation over
    the 30d series) — approximates, but does not equal, the site's metric
  - Holders is not available via the public API and is left blank
  - the Looping tab is carried over from the template unchanged

Usage: python3 refresh_farm_list.py <template.xlsx> <out.xlsx>
"""
import collections
import copy
import datetime
import json
import statistics
import sys
import time
import urllib.request

import openpyxl

API = 'https://yields.llama.fi'
MIN_TVL = 500_000
MAX_APY = 100.0
CUTOFF = {'USD': 6.0, 'ETH': 3.0}

# display name -> DefiLlama project slug, from the user's defillama.com URLs
PROTOCOLS = {
    'Uniswap V2': 'uniswap-v2', 'Uniswap V3': 'uniswap-v3', 'Raydium AMM': 'raydium-amm',
    'Uniswap V4': 'uniswap-v4', 'Orca DEX': 'orca-dex', 'Curve DEX': 'curve-dex',
    'Beefy': 'beefy', 'Aerodrome Slipstream': 'aerodrome-slipstream', 'Morpho Blue': 'morpho-blue',
    'Aave V3': 'aave-v3', 'Convex Finance': 'convex-finance', 'Pendle': 'pendle',
    'Stake DAO': 'stake-dao', 'Balancer V3': 'balancer-v3', 'Aerodrome V1': 'aerodrome-v1',
    'Kamino Lend': 'kamino-lend', 'Euler V2': 'euler-v2', 'Yearn Finance': 'yearn-finance',
    'Kamino Liquidity': 'kamino-liquidity', 'Balancer V2': 'balancer-v2',
    'Velodrome V2': 'velodrome-v2', 'Project X': 'project-x', 'Project 0': 'project-0',
    'Dolomite': 'dolomite', 'Fusion by IPOR': 'fusion-by-ipor', 'PancakeSwap AMM': 'pancakeswap-amm',
    'Velodrome V3': 'velodrome-v3', 'Fluid DEX': 'fluid-dex', 'Camelot V3': 'camelot-v3',
    'Camelot V2': 'camelot-v2', 'Moonwell Lending': 'moonwell-lending',
    'Curve LlamaLend': 'curve-llamalend', 'Curvance': 'curvance', 'fx Protocol': 'fx-protocol',
    'Concrete': 'concrete', 'Fluid Lending': 'fluid-lending', 'Ember Protocol': 'ember-protocol',
    'Silo V2': 'silo-v2', 'Midas RWA': 'midas-rwa', 'Loopscale': 'loopscale',
    'JustLend V1': 'justlend-v1', 'Royco V2': 'royco-v2', 'Scallop Lend': 'scallop-lend',
    'Lista Lending': 'lista-lending', 'Fraxlend': 'fraxlend', 'Compound V3': 'compound-v3',
    'Mento V3': 'mento-v3', 'Compound V2': 'compound-v2', 'HyperLend Pooled': 'hyperlend-pooled',
    'HypurrFi Pooled': 'hypurrfi-pooled', 'Neverland': 'neverland', 'SparkLend': 'sparklend',
    'TermMax': 'termmax', 'Current': 'current', 'Strata Markets': 'strata-markets',
    'Gearbox': 'gearbox', 'Nest Credit': 'nest-credit', 'Tydro': 'tydro', 'YieldNest': 'yieldnest',
    'D2 Finance': 'd2-finance', 'Gains Network': 'gains-network', 'Superform': 'superform',
    'Reserve Protocol': 'reserve-protocol', 'Sky Lending': 'sky-lending',
    'Spark Savings': 'spark-savings', 'Upshift': 'upshift', 'Yuzu Money': 'yuzu-money',
    'Makina': 'makina', 'Kai Finance': 'kai-finance', 'Pareto Credit': 'pareto-credit',
    'Yuzu Finance': 'yuzu-finance', 'ether.fi Stake': 'ether.fi-stake',
    'Multipli.fi': 'multipli-fi', 'Clearpool Lending': 'clearpool-lending',
    'ether.fi Liquid': 'ether.fi-liquid', 'Gauntlet': 'gauntlet', 'Veda': 'veda',
    'Liquity V2': 'liquity-v2', 'Maple': 'maple', 'Mystic Finance Lending': 'mystic-finance-lending',
    'Steakhouse Financial': 'steakhouse-financial', '3Jane Lending': '3jane-lending',
    'Falcon Finance': 'falcon-finance', 'Re': 're', 'Aave V4': 'aave-v4',
    'Fluid Lite': 'fluid-lite', 'Lagoon': 'lagoon', 'Joe V2.1': 'joe-v2.1', 'Joe V2.2': 'joe-v2.2',
}
SLUG2NAME = {v: k for k, v in PROTOCOLS.items()}

# yield-bearing tokens whose underlying rate the site adds as "intrinsic":
# symbol -> (issuer project slug, issuer pool symbol)
ISSUERS = {
    'WEETH': ('ether.fi-stake', 'WEETH'), 'WSTETH': ('lido', 'STETH'), 'STETH': ('lido', 'STETH'),
    'CBETH': ('coinbase-wrapped-staked-eth', 'CBETH'), 'RETH': ('rocket-pool', 'RETH'),
    'OSETH': ('stakewise-v2', 'OSETH'), 'EZETH': ('renzo', 'EZETH'), 'RSETH': ('kelp', 'RSETH'),
    'METH': ('meth-protocol', 'METH'), 'SUSDE': ('ethena-usde', 'SUSDE'),
    'SDAI': ('sdai', 'SDAI'), 'SUSDS': ('sky-lending', 'SUSDS'), 'SYRUPUSDC': ('maple', 'SYRUPUSDC'),
    'SFRXETH': ('frax-ether', 'SFRXETH'),
}

RATING_COLOR = {'stable': 'FF1E7145', 'mixed': 'FFB45F06', 'volatile': 'FFC00000'}
RISK_COLOR = {'Low': 'FF1E7145', 'Med.': 'FFB45F06', 'High': 'FFC00000'}


UA = 'Mozilla/5.0 (X11; Linux x86_64) farm-list-verifier'


def get(url, retries=4):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception:
            if i == retries - 1:
                raise
            time.sleep(2 ** i)


import re

_ETH_PART = re.compile(r'ETH([+XYSB2]|\.[EB])?$')  # ETH, wstETH, ETHx, ETH+, weETHs, WETH.e ...


def is_eth_family(symbol):
    # every hyphen-separated leg must be an ETH-denominated token; rejects
    # tickers that merely contain "ETH" (ETHFI, ETHENA, ...)
    parts = [p for p in symbol.split('-') if p]
    return bool(parts) and all(_ETH_PART.search(p.upper()) for p in parts)


def farm_type(name, symbol, farm, meta):
    if name == 'Pendle':
        # API poolMeta: 'For buying PT-...' vs 'For LP | Maturity ...'
        is_pt = (farm or '').startswith('PT ') or 'buying PT' in (meta or '')
        return 'PT' if is_pt else 'LP (Pendle)'
    if name in ('Beefy', 'Convex Finance'):
        return 'LP'
    return 'LP' if '-' in symbol else 'Lending'


def main(template, outfile, names_file=None, loops_file=None):
    pools = get(f'{API}/pools')['data']
    print(f'{len(pools)} pools fetched')
    names = {}
    if names_file:
        try:
            names = json.load(open(names_file))
        except Exception as e:
            print('pool names file not loaded:', e)

    # intrinsic rates: issuer pool's current APY (largest instance)
    intr_rate = {}
    for sym, (proj, psym) in ISSUERS.items():
        cands = [p for p in pools if p['project'] == proj and p['symbol'].upper() == psym
                 and p.get('exposure') == 'single']
        if cands:
            intr_rate[sym] = max(cands, key=lambda p: p['tvlUsd'])['apy'] or 0
    print('intrinsic rates:', {k: round(v, 3) for k, v in intr_rate.items()})

    tabs = {'USD Farms': [], 'ETH Farms': []}
    charts_needed = []
    for p in pools:
        name = SLUG2NAME.get(p['project'])
        if not name or (p['tvlUsd'] or 0) < MIN_TVL:
            continue
        sym = p['symbol']
        if p.get('stablecoin'):
            tab = 'USD Farms'
        elif is_eth_family(sym):
            tab = 'ETH Farms'
        else:
            continue
        intr = None
        if sym.upper() in intr_rate and p.get('exposure') == 'single' \
                and p['project'] != ISSUERS[sym.upper()][0]:
            intr = intr_rate[sym.upper()]
        base, rew = p.get('apyBase'), p.get('apyReward')
        now = None
        if base is not None or rew is not None or intr is not None:
            now = (base or 0) + (rew or 0) + (intr or 0)
        elif p.get('apy') is not None:
            now = p['apy']
        mean30 = (p.get('apyMean30d') or 0) + (intr or 0)
        cut = CUTOFF[tab.split()[0]]
        # candidates: current APY qualifies, or no current APY but the 30d
        # trailing average qualifies (matches the old sheet's coalesce rule)
        if now is not None and cut <= now <= MAX_APY:
            pass
        elif now in (None, 0) and cut <= mean30 <= MAX_APY:
            pass
        else:
            continue
        row = dict(tab=tab, name=name, chain=p['chain'], symbol=sym, meta=p.get('poolMeta'),
                   tvl=p['tvlUsd'], now=now, base=base, rew=rew, intr=intr,
                   pool_id=p['pool'], d7=None, d30=round(mean30, 5) if mean30 else None,
                   rating=None, score=None,
                   _underlying=(p.get('underlyingTokens') or [None])[0])
        tabs[tab].append(row)
        charts_needed.append(row)

    print(f"candidates: USD {len(tabs['USD Farms'])}, ETH {len(tabs['ETH Farms'])};"
          f" fetching {len(charts_needed)} charts")
    def enrich(row):
        try:
            hist = get(f"{API}/chart/{row['pool_id']}")['data']
        except Exception as e:
            print('  chart failed', row['pool_id'], e)
            return
        raw = [d['apy'] for d in hist[-30:] if d.get('apy') is not None]
        row['_raw'] = raw
        row['_last_ts'] = hist[-1]['timestamp'] if hist else None
        series = [x + (row['intr'] or 0) for x in raw]
        if len(series) >= 7:
            row['d7'] = round(statistics.mean(series[-7:]), 5)
            row['d30'] = round(statistics.mean(series), 5)
        if len(series) >= 10:
            m = statistics.mean(series)
            cv = statistics.pstdev(series) / m if m > 0 else 1.0
            score = 1 / (1 + 3 * cv)
            row['score'] = round(score, 5)
            row['rating'] = 'stable' if score >= 2 / 3 else ('mixed' if score >= 1 / 3 else 'volatile')

    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        done = 0
        for _ in ex.map(enrich, charts_needed):
            done += 1
            if done % 100 == 0:
                print(f'  {done}/{len(charts_needed)} charts')

    # final filter + ordering (current APY desc, then blank-now rows by 7d/30d)
    for tab, cut in [('USD Farms', 6.0), ('ETH Farms', 3.0)]:
        rows = [r for r in tabs[tab]
                if (r['now'] is not None and cut <= r['now'] <= MAX_APY)
                or (not r['now'] and cut <= (r['d7'] or r['d30'] or 0) <= MAX_APY)]
        rows.sort(key=lambda r: (0 if r['now'] else 1,
                                 -(r['now'] if r['now'] else (r['d7'] or r['d30'] or 0))))
        tabs[tab] = rows

    registry = {}
    if names_file:
        try:
            import os
            registry = json.load(open(os.path.join(os.path.dirname(os.path.abspath(names_file)),
                                                   'vault_registry.json')))
            print(f'vault registry: {len(registry)} entries')
        except Exception:
            pass
    try:
        run_verification(tabs, registry)
    except Exception as e:
        print('verification skipped entirely:', e)
        for rows in tabs.values():
            for r in rows:
                r.setdefault('flags', [])
                r.setdefault('verdict', 'UNVERIFIED')
                r.setdefault('src_val', None)
                r.setdefault('src_name', None)

    # ---- write workbook, preserving the template's styling ----
    wb = openpyxl.load_workbook(template)
    today = datetime.date.today().strftime('%-d %b %Y')
    for tab, rows in tabs.items():
        ws = wb[tab]
        old_last = max(r for r in range(4, ws.max_row + 1)
                       if ws.cell(r, 1).value not in (None, '')) if ws.max_row >= 4 else 3
        tmpl = {c: copy.copy(ws.cell(4, c)._style) for c in range(1, 19)}
        base_font = copy.copy(ws.cell(4, 1).font)
        for r in range(4, old_last + 1):
            for c in range(1, 19):
                cell = ws.cell(r, c)
                cell.value = None
                cell.hyperlink = None
                cell.style = 'Normal'
            if r in ws.row_dimensions:
                del ws.row_dimensions[r]
        asset = tab.split()[0]
        unnamed = 0
        for i, d in enumerate(rows):
            r = 4 + i
            ws.row_dimensions[r].height = 15.0
            nm = names.get(d['pool_id'], {})
            if not nm:
                unnamed += 1
            ref = nm.get('ref') or d['symbol']
            farm = nm.get('farm') or d['meta'] or nm.get('pool') or d['symbol']
            pool_name = nm.get('pool') or d['symbol']
            vals = [asset, d['name'], d['chain'],
                    farm_type(d['name'], ref, farm, d['meta']),
                    farm, 'DefiLlama', ref,
                    round(d['tvl']), round(d['now'], 5) if d['now'] is not None else None,
                    d['d7'], d['d30'],
                    round(d['base'], 5) if d['base'] is not None else None,
                    round(d['rew'], 5) if d['rew'] is not None else None,
                    round(d['intr'], 5) if d['intr'] is not None else None,
                    d['rating'], d['score'], pool_name, None]
            for c, v in enumerate(vals, start=1):
                cell = ws.cell(r, c)
                cell._style = copy.copy(tmpl[c])
                cell.value = v
            link = ws.cell(r, 6)
            link.hyperlink = f"https://defillama.com/yields/pool/{d['pool_id']}"
            f = copy.copy(link.font)
            f.color = openpyxl.styles.Color(rgb='FF0563C1')
            f.underline = 'single'
            link.font = f
            link.alignment = openpyxl.styles.Alignment(horizontal='center', vertical='bottom')
            if d['rating'] in RATING_COLOR:
                f = copy.copy(ws.cell(r, 15).font)
                f.color = openpyxl.styles.Color(rgb=RATING_COLOR[d['rating']])
                ws.cell(r, 15).font = f
            d['farm_disp'] = farm
            # verification flags: highlight the APY cell, stash detail in hidden col S
            flags = d.get('flags') or []
            if flags:
                shade = FLAG_FILL['red' if any(x.startswith(RED_FLAGS) for x in flags) else 'orange']
                ws.cell(r, 9).fill = openpyxl.styles.PatternFill('solid', fgColor=shade)
                ws.cell(r, 19).value = '; '.join(flags)
        ws.column_dimensions['S'].hidden = True
        last = 3 + len(rows)
        ws.cell(1, 1).value = (f"{asset} Farm List  ·  DefiLlama API snapshot {today}"
                               f"  ·  {len(rows)} pools")
        ws.auto_filter.ref = f'A3:R{last}'
        ws.freeze_panes = 'C4'
        print(f'{tab}: {len(rows)} rows written ({unnamed} without carried display names)')

    try:
        build_check_tab(wb, tabs, today)
    except Exception as e:
        print('Data Check tab skipped:', e)

    if loops_file:
        try:
            loops = json.load(open(loops_file))
        except Exception as e:
            print('looping feed not loaded, tab carried over unchanged:', e)
            loops = None
        if loops is not None:
            if len(loops) < 50:
                print(f'looping feed too small ({len(loops)} rows), tab carried over unchanged')
            else:
                build_looping(wb, loops, today)

    wb.save(outfile)
    print('saved', outfile)


def build_looping(wb, loops, today):
    """Rewrite the Looping tab from scraped yieldz.io/leverage rows.

    Keeps the old sheet's semantics: positive-carry loops only
    (deposit APY + borrow APY > 0), ETH block first then USD, each sorted
    by max leverage desc. Max leverage is derived from the displayed max
    ROE via the sheet's own formula: ROE = (H+I)*(F-1)+H  =>  F.
    """
    seen, rows = set(), []
    for r in loops:
        k = json.dumps(r, sort_keys=True)
        if k in seen:
            continue
        seen.add(k)
        dep, bor = r.get('depApy'), r.get('borApy')
        if dep is None or bor is None or (dep + bor) <= 0:
            continue
        if r.get('maxRoe') is None:
            continue
        lev = round((r['maxRoe'] - dep) / (dep + bor) + 1, 2)
        rows.append(dict(r, lev=lev))
    rows.sort(key=lambda r: (0 if r['asset'] == 'ETH' else 1, -r['lev']))

    ws = wb['Looping']
    old_last = max((r for r in range(4, ws.max_row + 1)
                    if ws.cell(r, 1).value not in (None, '')), default=3)
    tmpl = {c: copy.copy(ws.cell(4, c)._style) for c in range(1, 15)}
    for r in range(4, old_last + 1):
        for c in range(1, 15):
            cell = ws.cell(r, c)
            cell.value = None
            cell.style = 'Normal'
        if r in ws.row_dimensions:
            del ws.row_dimensions[r]
    for i, d in enumerate(rows):
        r = 4 + i
        ws.row_dimensions[r].height = 15.0
        vals = [d['asset'], d['protocol'], d['chain'], d['depositAsset'], d['borrowAsset'],
                d['lev'], f'=(H{r}+I{r})*(F{r}-1)+H{r}', d['depApy'], d['borApy'],
                d['risk'], d['liquidity'], d['toTarget'], d['utilization'], d['lltv']]
        for c, v in enumerate(vals, start=1):
            cell = ws.cell(r, c)
            cell._style = copy.copy(tmpl[c])
            cell.value = v
        if d['risk'] in RISK_COLOR:
            f = copy.copy(ws.cell(r, 10).font)
            f.color = openpyxl.styles.Color(rgb=RISK_COLOR[d['risk']])
            ws.cell(r, 10).font = f
    last = 3 + len(rows)
    ws.cell(1, 1).value = (f'Looping Opportunities  ·  yieldz.io/leverage, {today}'
                           f'  ·  {len(rows)} positive-carry loops')
    ws.auto_filter.ref = f'A3:N{last}'
    ws.freeze_panes = 'C4'
    print(f'Looping: {len(rows)} rows written '
          f'({sum(1 for d in rows if d["asset"] == "ETH")} ETH, '
          f'{sum(1 for d in rows if d["asset"] == "USD")} USD)')


# ---------------------------------------------------------------------------
# Verification layer
# ---------------------------------------------------------------------------

YZ = 'https://yieldz.io/api'
CHAIN_IDS = {1: 'Ethereum', 8453: 'Base', 42161: 'Arbitrum', 10: 'OP Mainnet',
             137: 'Polygon', 56: 'BSC', 100: 'Gnosis', 59144: 'Linea',
             143: 'Monad', 999: 'Hyperliquid L1', 43114: 'Avalanche',
             5000: 'Mantle', 9745: 'Plasma', 480: 'World Chain', 146: 'Sonic'}
BLOCK_SECONDS = {1: 12, 8453: 2, 42161: 0.25, 10: 2, 137: 2.1, 56: 3,
                 100: 5, 59144: 2, 143: 0.5, 999: 1, 9745: 1}
YZ_PROTO = {'Aave V3': 'aave', 'Aave V4': 'aave', 'HyperLend Pooled': 'hyperlend',
            'Fluid Lending': 'fluid', 'Euler V2': 'euler', 'Lista Lending': 'lista'}
RED_FLAGS = ('MISMATCH', 'STALE', 'NOT-ACCRUING')
FLAG_FILL = {'red': 'FFF4CCCC', 'orange': 'FFFCE5CD'}


def post_json(url, payload, timeout=30):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def rpc(chain_id, method, params):
    return post_json(f'{YZ}/rpc/{chain_id}', dict(jsonrpc='2.0', id=1, method=method,
                                                  params=params))['result']


def history_checks(row, cut):
    """Checks that need only DefiLlama's own daily history."""
    flags = []
    raw, now = row.get('_raw') or [], row.get('now')
    ts = row.get('_last_ts')
    if ts:
        age = (datetime.datetime.now(datetime.timezone.utc)
               - datetime.datetime.fromisoformat(ts.replace('Z', '+00:00'))).days
        if age >= 2:
            flags.append(f'STALE({age}d old)')
    if len(raw) >= 10 and max(raw) == min(raw):
        flags.append('SELF-REPORTED(flat 30d history)')
    if len(raw) < 14:
        flags.append(f'NEW({len(raw)}d history)')
    if now and raw:
        m30 = statistics.mean(raw) + (row['intr'] or 0)
        if m30 > 0 and now > 3 * m30 and now - m30 > 10:
            flags.append(f'SPIKE(30d avg {m30:.1f})')
    return flags


def load_yieldz_sources():
    m = get(f'{YZ}/markets')['data']
    v = get(f'{YZ}/vaults')['data']
    lend, vaults = {}, {}
    for x in m:
        if x['protocol'].split('_')[0] in ('aave', 'hyperlend', 'fluid', 'euler', 'lista'):
            ch = CHAIN_IDS.get(x['chain_id'])
            key = (x['protocol'].split('_')[0], ch, x['loan_asset']['symbol'].upper())
            lend.setdefault(key, []).append(x)
    for x in v:
        ch = CHAIN_IDS.get(x['chain_id'])
        vaults.setdefault((ch, x['loan_asset']['address'].lower()), []).append(x)
    return lend, vaults


def cross_source(row, lend, vaults):
    """Match a lending row to yieldz's protocol-sourced data and compare.

    Compares every APY decomposition (base, base+reward, base+intrinsic, total)
    so accounting differences between the two pipelines don't raise false
    alarms; flags only when nothing lines up.
    """
    m = None
    if row['name'] in YZ_PROTO:
        cands = lend.get((YZ_PROTO[row['name']], row['chain'], row['symbol'].upper()), [])
        if cands:
            m = max(cands, key=lambda x: x['total_supply_usd'])
    elif row['name'] == 'Morpho Blue' and row.get('_underlying'):
        cands = vaults.get((row['chain'], row['_underlying'].lower()), [])
        if cands:
            m = min(cands, key=lambda x: abs(x['total_supply_usd'] - row['tvl']))
            if not (0.5 <= (m['total_supply_usd'] + 1) / (row['tvl'] + 1) <= 2):
                m = None
    if m is None:
        return None, None, None
    src = m['supply_apy']
    base, rew, intr = row['base'] or 0, row['rew'] or 0, row['intr'] or 0
    # 0.6pp / 25% tolerance absorbs the intraday skew between DefiLlama's
    # snapshot and yieldz's live on-chain read
    tol = lambda a, b: abs(a - b) <= max(0.6, 0.25 * max(abs(a), abs(b)))
    comps = [('base', base), ('base+reward', base + rew),
             ('base+intrinsic', base + intr), ('total', base + rew + intr)]
    matched = next((lbl for lbl, v in comps if tol(v, src)), None)
    if matched is None:
        # only accuse when the pairing is certain: with many same-asset vaults,
        # a loose TVL match may simply be the wrong vault
        ratio = (m['total_supply_usd'] + 1) / (row['tvl'] + 1)
        if not (0.85 <= ratio <= 1.18):
            return None, None, None
    return src, matched, m


# share-price read cascade: ERC4626, Yearn, Beefy, Curve, custom
SHARE_SELECTORS = ['0x07a2d13a' + hex(10 ** 18)[2:].rjust(64, '0'),  # convertToAssets(1e18)
                   '0x99530b06', '0x77c7b8fc', '0xbb7b8b80']


def onchain_realized(chain_id, addr, selector=None):
    """Annualized ~7d realized yield from on-chain share-price growth."""
    if chain_id not in BLOCK_SECONDS:
        return None
    datas = [selector] if selector else SHARE_SELECTORS
    now_block = int(rpc(chain_id, 'eth_blockNumber', []), 16)
    then_est = now_block - int(7 * 86400 / BLOCK_SECONDS[chain_id])
    hdr_now = rpc(chain_id, 'eth_getBlockByNumber', [hex(now_block), False])
    hdr_then = rpc(chain_id, 'eth_getBlockByNumber', [hex(then_est), False])
    dt = int(hdr_now['timestamp'], 16) - int(hdr_then['timestamp'], 16)
    if dt < 3 * 86400:
        return None
    for data in datas:
        try:
            pps_now = int(rpc(chain_id, 'eth_call', [{'to': addr, 'data': data}, hex(now_block)]), 16)
            pps_then = int(rpc(chain_id, 'eth_call', [{'to': addr, 'data': data}, hex(then_est)]), 16)
        except Exception:
            continue
        if pps_then > 0 and pps_now > 0:
            return (pps_now / pps_then - 1) * (365 * 86400 / dt) * 100
    return None


def realized_flag(realized, quoted):
    if realized is None:
        return None
    if quoted > 1 and realized < 0.05:
        return f'NOT-ACCRUING(realized {realized:.2f} vs quoted {quoted:.2f})'
    if quoted > 2 and realized < 0.35 * quoted:
        return f'REALIZED-LOW({realized:.2f} vs quoted {quoted:.2f})'
    return None


def realized_check(row, m):
    """Realized-yield spot check for a yieldz-matched vault."""
    if not m or m.get('protocol') not in ('morpho_vault', 'lista_vault'):
        return None
    realized = onchain_realized(m['chain_id'], m['id'])
    if realized is None:
        return None
    return dict(realized=round(realized, 3), flag=realized_flag(realized, row['base'] or 0))


def pendle_check(row):
    """Cross-check Pendle PT rows against the official Pendle API (activates
    only once api-v2.pendle.finance is reachable from this environment)."""
    meta = (row['meta'] or '').upper().replace(' ', '')
    if row['name'] != 'Pendle' or 'BUYINGPT' not in meta:
        return None, None
    for mk in getattr(pendle_check, 'markets', []) or []:
        if mk['expiry'] in meta and row['symbol'].upper() in mk['sym']:
            src = mk['implied']
            ok = abs(src - (row['now'] or 0)) <= max(0.75, 0.25 * src)
            return src, ok
    return None, None


def init_pendle():
    pendle_check.markets = []
    for cid in (1, 42161, 56, 143, 9745, 8453, 5000):
        try:
            skip = 0
            while True:
                res = get(f'https://api-v2.pendle.finance/core/v1/{cid}/markets'
                          f'?limit=100&skip={skip}', retries=1)
                batch = res.get('results', [])
                for mk in batch:
                    exp = (mk.get('expiry') or '')[:10]
                    if not exp:
                        continue
                    d = datetime.date.fromisoformat(exp)
                    pendle_check.markets.append(dict(
                        sym=((mk.get('pt') or {}).get('symbol') or mk.get('name') or '').upper(),
                        expiry=d.strftime('%d%b%Y').upper(),
                        implied=(mk.get('impliedApy') or 0) * 100))
                if len(batch) < 100:
                    break
                skip += 100
        except Exception as e:
            print(f'pendle chain {cid} skipped: {type(e).__name__}')
    if pendle_check.markets:
        print(f'pendle API reachable: {len(pendle_check.markets)} markets')
    else:
        print('pendle API not reachable (allowlist api-v2.pendle.finance to enable)')


def run_verification(tabs, registry=None):
    try:
        lend, vaults = load_yieldz_sources()
    except Exception as e:
        print('yieldz sources unavailable, cross-source skipped:', e)
        lend, vaults = {}, {}
    init_pendle()
    registry = registry or {}
    counts = collections.Counter()
    for tab, rows in tabs.items():
        cut = CUTOFF[tab.split()[0]]
        for row in rows:
            flags = history_checks(row, cut)
            src_val = src_name = None
            try:
                src, matched, m = cross_source(row, lend, vaults)
                if src is not None:
                    src_val = round(src, 3)
                    src_name = f'yieldz ({matched})' if matched else 'yieldz'
                    if not matched:
                        flags.append(f'MISMATCH(source {src:.2f})')
                    else:
                        r = realized_check(row, m)
                        if r and r['flag']:
                            flags.append(r['flag'])
            except Exception:
                pass
            if src_val is None:
                try:
                    src, ok = pendle_check(row)
                    if src is not None:
                        src_val, src_name = round(src, 3), 'pendle-api'
                        if not ok:
                            flags.append(f'MISMATCH(source {src:.2f})')
                except Exception:
                    pass
            if src_val is None and row['pool_id'] in registry:
                try:
                    ent = registry[row['pool_id']]
                    realized = onchain_realized(ent['chain_id'], ent['address'],
                                                ent.get('selector'))
                    if realized is not None:
                        src_val = round(realized, 3)
                        src_name = 'on-chain (7d realized)'
                        fl = realized_flag(realized, row['base'] or 0)
                        if fl:
                            flags.append(fl)
                except Exception:
                    pass
            row['flags'] = flags
            row['src_val'], row['src_name'] = src_val, src_name
            if any(f.startswith(RED_FLAGS) for f in flags):
                row['verdict'] = 'FLAGGED'
            elif flags:
                row['verdict'] = 'CAUTION'
            elif src_val is not None:
                row['verdict'] = 'VERIFIED'
            else:
                row['verdict'] = 'UNVERIFIED'
            counts[row['verdict']] += 1
    print('verification:', dict(counts))


def build_check_tab(wb, tabs, today):
    if 'Data Check' in wb.sheetnames:
        del wb['Data Check']
    ws = wb.create_sheet('Data Check')
    header = ['Tab', 'Farm', 'Chain', 'Protocol', 'APY Now', '7d', 'Verdict',
              'Cross-Source APY', 'Source', 'Flags']
    ws.cell(1, 1).value = (f'Data Check  ·  {today}  ·  history checks: all rows; '
                           f'cross-source: yieldz protocol data + on-chain reads')
    ws.cell(1, 1).font = openpyxl.styles.Font(bold=True, size=12, color='FF1F3552', name='Arial')
    for c, h in enumerate(header, start=1):
        cell = ws.cell(2, c)
        cell.value = h
        cell.font = openpyxl.styles.Font(bold=True, color='FFFFFFFF', size=10, name='Arial')
        cell.fill = openpyxl.styles.PatternFill('solid', fgColor='FF1F3552')
    order = {'FLAGGED': 0, 'CAUTION': 1, 'UNVERIFIED': 2, 'VERIFIED': 3}
    allrows = [(tab, r) for tab, rows in tabs.items() for r in rows]
    allrows.sort(key=lambda x: (order.get(x[1].get('verdict'), 9), -(x[1].get('now') or 0)))
    for i, (tab, r) in enumerate(allrows):
        vals = [tab, (r.get('farm_disp') or r.get('meta') or r['symbol']), r['chain'], r['name'],
                r.get('now'), r.get('d7'), r['verdict'], r.get('src_val'),
                r.get('src_name'), '; '.join(r.get('flags') or [])]
        for c, v in enumerate(vals, start=1):
            cell = ws.cell(3 + i, c)
            cell.value = v
            cell.font = openpyxl.styles.Font(size=10, name='Arial')
        col = ('FFC00000' if r['verdict'] == 'FLAGGED' else
               'FFB45F06' if r['verdict'] == 'CAUTION' else
               'FF1E7145' if r['verdict'] == 'VERIFIED' else 'FF7F7F7F')
        ws.cell(3 + i, 7).font = openpyxl.styles.Font(size=10, name='Arial', bold=True, color=col)
    for col, w in zip('ABCDEFGHIJ', [10, 38, 12, 18, 9, 9, 12, 15, 14, 60]):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = 'A3'
    print(f'Data Check: {len(allrows)} rows')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2],
         sys.argv[3] if len(sys.argv) > 3 else None,
         sys.argv[4] if len(sys.argv) > 4 else None)
