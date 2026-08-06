# Farm-List Risk Framework

Every farm gets a 1–10 safety score (higher = safer), a tier, and a full
derivation in the **Risk Note** (column P on farm tabs; hover note on the
Risk cell of the Looping tab). Nothing is hidden: every number in a note
maps to a rule below.

**Tiers:** score ≥ 8 → **Low** · 6–8 → **Med-Low** · 4–6 → **Med-High** ·
< 4 → **High**. Rows with no scorable leg at all show High or Med-High
from data-quality signals alone (`unrated: internal signals only`).

---

## 1. Asset scores — the shared foundation

Every symbol that appears anywhere (deposit asset, LP leg, collateral,
vault holding, loop side) is scored the same way:

| Source | Weight | Notes |
|---|---|---|
| TID Research | 0.40 | 1–10 as published |
| Pharos | 0.35 | numeric /10, or letter grades (A+ = 9.5 … F = 1.5) |
| Yearn curation | 0.25 | 1–5 lower-safer, mapped piecewise to our scale |

Weights renormalize over whichever sources cover the asset. Fallbacks, in
order: a **baseline table** for blue-chip volatile collateral the
stablecoin raters never cover (WETH 9.0, wstETH/cbBTC 8.5, SOL 8.5, … —
marked `*`); **PT resolution** (PT-x scores its underlying −0.5 wrapper
haircut, marked `→`); otherwise **unrated** — and sizable unrated exposure
(≥10 % of a book, or an LP/loop leg beside a rated one) scores **3.0**
rather than being ignored: *unknown is the risk*.

## 2. Per-category logic

### LP (DEX pools, incl. Convex / StakeDAO / Beefy wrappers)
- Score = **worst leg** of the pooled assets. Lending signals don't apply.
- **Pool balance ratio** (Curve family, live from Curve's API): heaviest
  coin ≥ 85 % of pool value or ≥ 2.2× equal weight → **−1.0**; ≥ 1.5×
  equal weight → **−0.5**. A lopsided stableswap means LPs effectively
  hold the weak side (`pool 95% in pmUSD`).

### Lending (pooled markets and lending vaults)
Aave, Morpho markets, Euler, Kamino, Curvance, Fluid, Lista, … and
lending vaults: TermMax, Gearbox, Scallop, Loopscale, Current, Project 0.
- **Collateral leg**: the debt-side assets, scored per §1, weighted by
  debt (isolated pairs directly; Aave pools by supply×LLTV capacity;
  Kamino by same-market reserves; Curvance from its on-chain reader).
  Overall = worst of (deposit-asset leg, collateral leg).
- **Utilization** > 92 % → −1.0 (withdrawals gated).
- **LLTV** ≥ 94.5 % → −0.5, ≥ 96.5 % → −1.0 (thin liquidation margin).
- **Oracle**: isolated market on an unrecognized oracle → −0.5.
- **Collateral not visible** → capped **5.9**
  (`capped 5.9: collateral not visible`).

### Strategy vaults (curated allocators)
IPOR, Lagoon, Yearn, Ember, Upshift, Concrete, Pareto, Yuzu, Veda,
Gauntlet, ether.fi Liquid, Makina, Steakhouse, ….
- **Allocation leg** from the vault's live book, weighted by position
  size. Books come from: IPOR's API (marketBalances), Lagoon's published
  composition, Yearn's ydaemon strategy lists, Morpho curated-vault
  allocations.
- **Each position resolves to its real risk, deepest identity first:**
  1. a position naming a **Morpho vault** scores that vault's actual
     collateral book (via Morpho's API, ~135 vaults indexed) —
     `[vault name]` in the note;
  2. **asset symbols parsed from the position label** ("Convex -
     PMUSD/CRVUSD", "Supply USDT + USDC") score the worst named asset,
     with the venue quality only as a floor — `~ASSET` in the note;
  3. a recognized **venue** alone scores venue quality (Aave 8.5, Spark
     8.2, Compound 8.5, Curve 7.5, Morpho-unresolved 6.5, … — `†`);
  4. idle/wallet scores as the vault's own asset; anything else is
     unrated (3.0 if ≥ 10 %).
- **Allocation not visible** → capped **5.9**
  (`capped 5.9: allocation not visible`). A vault that won't show its
  book cannot rate better than Med-High regardless of deposit asset.
- Exception: a vault token the sources rate **directly as a product**
  (yBOLD, syrupUSDC) keeps that product-level rating; a plain deposit
  currency (USDC, WETH…) never qualifies.

### Looping (leveraged positions, Looping tab)
- Score = **worst of three legs**: deposit asset (long, levered), borrow
  asset (liability — a depeg on either side liquidates), venue quality.
- **Leverage**: ≥ 3× −0.5, ≥ 5× −1.0, ≥ 10× −1.5.
- **LLTV** ≥ 94.5 % −0.5, ≥ 96.5 % −1.0 · **Utilization** > 92 % −1.0 ·
  **Exit liquidity** < $1 M −1.0.
- yieldz's own coarse label is kept in the note as a reference line.

### Pendle PT (fixed rate)
- Underlying asset score, **−0.5 PT wrapper**.
- **Tenor**: > 90 d −0.5, > 180 d −1.0, > 365 d −1.5.
- **Exit liquidity**: pool TVL < $5 M −0.5.

### Tranches (Strata)
- Score the **underlying**. Junior −1.5 (first loss); senior +0.5.

### Midas RWA
- Score the **mToken** itself (Pharos rates the strategy tokens), never
  the deposit asset. Unrated mTokens stay unrated.

## 3. Universal deductions and caps
- Red verification flags (MISMATCH / STALE / NOT-ACCRUING): **−2.0**.
- Self-reported APY (flat 30-day history): **−2.0**.
- TVL < $1 M: **−1.0**. Leveraged/looping strategy name: **−1.0**.
- Not VERIFIED by the cross-source/on-chain layer: capped at **7.9**.
- Floor 0.5, ceiling 10.

## 4. Deliberately *not* in the score
Chain identity and APY volatility (removed by design); curator
reputation; audit status. The REWARD-HEAVY flag lives in the
verification layer (orange tint), not the risk score: emissions > ⅔ of
APY that no independent source (yieldz, Curve gauges, Merkl campaigns,
protocol reward endpoints) has priced.

## 5. Reading a Risk Note
`score 3.7; USDC 9.0 (pharos 9.0, tid 9.0); collateral leg 4.7 (savUSD
4.7@100%); collateral leg governs; -1 tvl<1M` — deposit asset 9.0, but
the market lends against savUSD (4.7); worst leg governs; small TVL
deducts 1 → 3.7 High.
Markers: `*` baseline · `†` venue quality · `→` PT underlying ·
`[name]` resolved Morpho vault book · `~ASSET` asset parsed from a
position label.
