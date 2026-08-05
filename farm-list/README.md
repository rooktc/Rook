# Farm List Daily Refresh

Rebuilds the USD/ETH farm-list spreadsheet
([original Google Sheet](https://docs.google.com/spreadsheets/d/1LiEDhK1PtCZH-au9BgNfwlN4_DrnrRSTO8rx4bO0SP4))
from the public DefiLlama API instead of manual CSV downloads from
defillama.com/yields (which sits behind a Cloudflare JS challenge).

## Usage

```bash
python3 refresh_farm_list.py template.xlsx farm_list_update_$(date +%F).xlsx
```

Requires `openpyxl` (`pip install openpyxl`) and outbound access to
`yields.llama.fi`. Runtime is a few minutes (~300 per-pool history calls,
10 threads).

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

## Known deviations from the site's CSV export

- **Stability rating/score**: computed here as `score = 1 / (1 + 3·cv)`
  (cv = std/mean of the 30d daily series; stable >= 2/3 > mixed >= 1/3 >
  volatile). Approximates but does not equal DefiLlama's own metric.
- **Holders**: not in the public API; column left blank.
- **Token case**: the API upper-cases symbols (`WEETH` vs the site's
  `weETH`).
- **Looping tab**: carried over from the template unchanged — yieldz.io
  is a client-side app with no data feed; refresh that tab manually.

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
