# Farm List Daily Refresh

Rebuilds the USD/ETH farm-list spreadsheet
([original Google Sheet](https://docs.google.com/spreadsheets/d/1LiEDhK1PtCZH-au9BgNfwlN4_DrnrRSTO8rx4bO0SP4))
from the public DefiLlama API instead of manual CSV downloads from
defillama.com/yields (which sits behind a Cloudflare JS challenge).

## Usage

```bash
./scrape_yieldz.sh /tmp/yz_rows.json           # Looping tab data (optional)
python3 refresh_farm_list.py template.xlsx out.xlsx pool_names.json /tmp/yz_rows.json
python3 make_feed_csvs.py out.xlsx feed_usd.csv feed_eth.csv feed_loop.csv
```

Requires `openpyxl` (`pip install openpyxl`) and outbound access to
`yields.llama.fi` + `yieldz.io`. Farm build takes a few minutes
(~300 per-pool history calls, 10 threads); the yieldz scrape adds
~5 minutes (paginated headless-browser walk of both views).

## What it reproduces

- Site filters from the original defillama.com/yields URLs: 88-protocol
  whitelist, TVL >= $500k, APY <= 100%, stablecoin pools (USD tab) /
  ETH-family pools (ETH tab).
- Sheet rule: keep pools with APY >= 6% (USD) / >= 3% (ETH); rows with no
  current APY qualify on their trailing average, sorted to the bottom
  (same as the original sheet).
- Intrinsic APY: underlying LST / yield-token rate (weETH -> ether.fi,
  wstETH -> Lido, sUSDe -> Ethena, ...) added for single-asset pools of
  those tokens — mirrors the site's `apyComponents=reward,intrinsic`.
- 7d / 30d columns: trailing means of each pool's daily total APY from
  `yields.llama.fi/chart/<pool>`.
- Every row gets a DefiLlama pool hyperlink.
- Styling, merged headers, filters and frozen panes come from
  `template.xlsx` (the 27 Jul 2026 sheet).

## Verification layer

Every displayed row is checked daily; results land in the **Data Check**
tab and as APY-cell highlights (red = data wrong/stale, orange = caution),
with the flag text in hidden column S / as a cell note in Google Sheets.

- **History checks (all rows)**: `STALE` (last DefiLlama data point >= 2
  days old), `SELF-REPORTED` (perfectly flat 30d history — a protocol-
  reported number, not measured yield), `NEW` (< 14 days of history),
  `SPIKE` (current APY > 3x the 30d mean and > 10pp above it).
- **Cross-source (lending rows)**: matched against yieldz.io's
  protocol-sourced backend (Aave V3/V4, Morpho vaults by loan-asset
  address + TVL, Euler, Fluid, Lista, HyperLend). Every APY decomposition
  (base / +reward / +intrinsic / total) is compared so accounting
  differences don't false-alarm; `MISMATCH` only when nothing lines up.
- **On-chain realized yield (matched vaults)**: share price now vs ~7
  days ago via RPC (`convertToAssets`), annualized; `NOT-ACCRUING` /
  `REALIZED-LOW` when actual accrual is far below the quoted base APY.
- **Pendle** (largest unverified block): cross-check against
  `api-v2.pendle.finance` activates automatically once that domain is
  added to the egress allowlist.

Verdicts: `VERIFIED` (independent source agrees), `FLAGGED` (red flag),
`CAUTION` (advisory flags), `UNVERIFIED` (no independent source — mostly
AMM LP fee yields and non-EVM chains). Verification failures never block
the build; on any error the tab records what was skipped.

## Known deviations from the site's CSV export

- **Stability rating/score**: computed here as `score = 1 / (1 + 3·cv)`
  (cv = std/mean of the 30d daily series; stable >= 2/3 > mixed >= 1/3 >
  volatile). Approximates but does not equal DefiLlama's own metric.
- **Holders**: not in the public API; column left blank.
- **Token case**: the API upper-cases symbols (`WEETH` vs the site's
  `weETH`).
- **Looping tab**: scraped from the rendered yieldz.io/leverage pages
  (default view = USD, `?corr=eth` = ETH) via headless Chromium behind a
  local mitmproxy TLS shim (`scrape_yieldz.sh` + `yz_scrape.js`). Kept
  semantics: positive-carry loops only (Dep+Bor > 0), ETH block first,
  each block sorted by max leverage desc; max leverage derived from the
  displayed max ROE via the sheet's own formula. If the scrape fails or
  returns too few rows, the tab is carried over unchanged.

## Schedule & delivery

A Claude Code Routine runs this daily at ~09:00 Asia/Hong_Kong
(01:00 UTC):

1. builds the refreshed .xlsx and posts it in the Claude session;
2. regenerates `feed_usd.csv` / `feed_eth.csv` (via `make_feed_csvs.py`)
   and pushes them to this branch.

The original Google Sheet updates itself in place via `updater.gs`
(Apps Script installed in the sheet, daily trigger at 10:00 HKT): it
fetches the feed CSVs from this branch's raw GitHub URLs and rewrites
the USD/ETH tabs — values, title, DefiLlama links, rating colors.
Note: the repo is public, so the feed CSVs are publicly readable
(DefiLlama-derived public data).
