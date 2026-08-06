# Farm-List Risk Framework

Every farm gets a 1–10 safety score (higher = safer), a tier, and a full
derivation in the **Risk Note** column (P). Nothing is hidden: every number
in the note maps to a rule below.

**Tiers:** score ≥ 8 → **Low** · 6–8 → **Med-Low** · 4–6 → **Med-High** ·
< 4 → **High**. Unrated rows (no scorable leg at all) show High or Med-High
from data-quality signals alone.

---

## 1. Asset scores — the shared foundation

Every symbol that appears anywhere (deposit asset, LP leg, collateral,
vault holding) is scored the same way:

| Source | Weight | Notes |
|---|---|---|
| TID Research | 0.40 | 1–10 as published |
| Pharos | 0.35 | numeric /10, or letter grades (A+ = 9.5 … F = 1.5) |
| Yearn curation | 0.25 | 1–5 lower-safer, mapped piecewise to our scale |

Weights renormalize over whichever sources cover the asset. Fallbacks, in
order: a **baseline table** for blue-chip volatile collateral the
stablecoin raters never cover (WETH 9.0, wstETH/cbBTC 8.5, SOL 8.5, … —
marked `*` in notes); **PT resolution** (PT-x scores its underlying with a
−0.5 wrapper haircut); otherwise the asset is **unrated** — and sizable
unrated exposure (≥10 % of a book or an LP leg beside a rated one) scores
**3.0** rather than being ignored: *unknown is the risk*.

## 2. Per-category logic

### LP (DEX pools, incl. Convex / StakeDAO / Beefy wrappers)
- Score = **worst leg** of the pooled assets. Nothing else from the
  lending world applies.
- **Pool balance ratio** (Curve-family, from Curve's API): if the heaviest
  coin holds ≥ 85 % of pool value (or ≥ 2.2× equal weight) → **−1.0**;
  ≥ 1.5× equal weight → **−0.5**. A lopsided stableswap means LPs
  effectively hold the weak side. Note shows e.g. `pool 95% in pmUSD`.

### Lending (pooled markets and lending vaults)
Aave/Morpho/Euler/Kamino/Curvance/Fluid/Lista/… and lending vaults
(TermMax, Gearbox, Scallop, Loopscale, Current, Project 0).
- **Collateral leg**: the debt-side assets, scored per §1 and weighted by
  debt (isolated pairs directly; Aave pools by supply×LLTV capacity;
  Kamino by same-market reserves; Curvance from its on-chain reader).
  Overall score = worst of (deposit-asset leg, collateral leg).
- **Utilization** > 92 % → −1.0 (withdrawals gated).
- **LLTV** ≥ 94.5 % → −0.5, ≥ 96.5 % → −1.0 (thin liquidation margin).
- **Oracle**: isolated market on an unrecognized oracle → −0.5
  (Chainlink/Redstone/Chronicle/Pyth/Pendle/… are trusted).
- **Collateral not visible** (no source exposes the book): score capped at
  **5.9** — `capped 5.9: collateral not visible`.

### Strategy vaults (curated allocators)
IPOR, Lagoon, Yearn, Ember, Upshift, Concrete, Pareto, Yuzu, Veda,
Gauntlet, ether.fi Liquid, Makina, Steakhouse, ….
- **Allocation leg** from the vault's published book, weighted by position
  size: IPOR (API marketBalances, resolved through Morpho/Euler market
  data), Lagoon (GraphQL composition), Yearn (ydaemon strategy list,
  debt-weighted), Morpho curated vaults (market allocations → collateral).
- Positions resolve to: the actual collateral where identifiable → §1
  score; a recognized venue → venue-quality score (Aave 8.5, Spark 8.2,
  Compound 8.5, Curve 7.5, Morpho-unresolved 6.5, … marked `†`); idle/
  wallet → the vault's own asset; anything else → unrated (3.0 if ≥10 %).
- **Allocation not visible** → capped at **5.9** —
  `capped 5.9: allocation not visible`. A vault that won't show its book
  cannot rate better than Med-High, whatever the deposit asset is.

### Pendle PT (fixed rate)
- Base = underlying asset score, **−0.5 PT wrapper**.
- **Tenor**: > 90 d → −0.5, > 180 d → −1.0, > 365 d → −1.5.
- **Exit liquidity**: pool TVL < $5 M → −0.5 (early exit is AMM-dependent).

### Tranches (Strata)
- Score the tranche's **underlying** asset. Junior: **−1.5** (first loss).
  Senior: **+0.5** (junior buffer beneath it).

### Midas RWA
- Score the **mToken** itself (Pharos rates the strategy tokens), never
  the deposit asset. Unrated mTokens stay unrated — honestly.

## 3. Universal deductions and caps (all categories)
- **Red verification flags** (MISMATCH / STALE / NOT-ACCRUING): −2.0.
- **Self-reported APY** (flat 30-day history): −2.0.
- **TVL < $1 M**: −1.0.
- **Leveraged/looping strategy** (by name): −1.0.
- **Not VERIFIED** by the cross-source/on-chain layer: score capped at
  7.9 — an unverified farm can never show Low.
- Floor 0.5, ceiling 10.

## 4. What is deliberately *not* in the score
Chain identity and 30-day APY volatility (removed by design); curator
reputation (no objective source); audit status (no reliable feed). The
REWARD-HEAVY flag lives in the verification layer (orange tint), not the
risk score: emissions >⅔ of APY that no independent source (yieldz, Curve
gauges, Merkl campaigns, protocol reward endpoints) has priced.

## 5. Reading a Risk Note
`score 3.7; USDC 9.0 (pharos 9.0, tid 9.0); collateral leg 4.7 (savUSD
4.7@100%); collateral leg governs; -1 tvl<1M` — deposit asset scored 9.0,
but the market lends against savUSD (4.7), the worst leg governs, small
TVL deducts 1, final 3.7 → High. `*` = baseline score, `†` = venue-quality
score, `→` = PT resolved to its underlying.
