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


def get(url, retries=4):
    for i in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except Exception:
            if i == retries - 1:
                raise
            time.sleep(2 ** i)


def is_eth_family(symbol):
    parts = [p for p in symbol.split('-') if p]
    return bool(parts) and all('ETH' in p.upper() for p in parts)


def farm_type(name, symbol, farm, meta):
    if name == 'Pendle':
        # API poolMeta: 'For buying PT-...' vs 'For LP | Maturity ...'
        is_pt = (farm or '').startswith('PT ') or 'buying PT' in (meta or '')
        return 'PT' if is_pt else 'LP (Pendle)'
    if name in ('Beefy', 'Convex Finance'):
        return 'LP'
    return 'LP' if '-' in symbol else 'Lending'


def main(template, outfile, names_file=None):
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
                   rating=None, score=None)
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
        series = [d['apy'] + (row['intr'] or 0) for d in hist[-30:] if d.get('apy') is not None]
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
        last = 3 + len(rows)
        ws.cell(1, 1).value = (f"{asset} Farm List  ·  DefiLlama API snapshot {today}"
                               f"  ·  {len(rows)} pools")
        ws.auto_filter.ref = f'A3:R{last}'
        ws.freeze_panes = 'C4'
        print(f'{tab}: {len(rows)} rows written ({unnamed} without carried display names)')

    wb.save(outfile)
    print('saved', outfile)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
