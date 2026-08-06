# Farm-List Risk Framework

Every farm gets a 1–10 safety score (higher = safer), a tier, and a full
derivation in the **Risk Note** (column P on farm tabs; hover note on the
Risk cell of the Looping tab). Nothing is hidden: every number in a note
maps to a rule in this document.

**Tiers:** score ≥ 8 → **Low** · 6–8 → **Med-Low** · 4–6 → **Med-High** ·
< 4 → **High**. Rows with no scorable leg at all show High or Med-High
from data-quality signals alone (`unrated: internal signals only`).

**Design principles** (independently validated against Steakhouse, Yearn
Curation, and KPK's frameworks):
1. **Worst leg governs, never the average** — one critical exposure sets
   the profile (KPK's "single critical finding" rule).
2. **Unknown counts against** — sizable exposure nothing rates scores 3.0;
   an invisible book caps at Med-High. Thin evidence is a risk, not a pass.
3. **Score the real exposure, not the wrapper** — look through vaults to
   books, books to positions, positions to collateral, PTs to underlyings.
4. **Every score is auditable** — the Risk Note reproduces the arithmetic.

---

## 1. Asset scores — the shared foundation

Every symbol that appears anywhere (deposit asset, LP leg, collateral,
vault holding, loop side) is scored by the same weighted composite:

| Source | Weight | Scale | What it rates |
|---|---|---|---|
| TID Research | 0.30 | 1–10 | stablecoins / yield assets |
| Pharos | 0.25 | /10 or letters (A+ = 9.5 … F = 1.5) | stablecoins, yield-bearing wrappers |
| Credora (RedStone) | 0.25 | PD-curve letters A+…D (A+ = 9.5, A 9.0, A- 8.4, B+ 7.4, B 6.6, B- 5.8, C+ 4.8, C 4.0, C- 3.2, D 1.5) | tokens incl. LST/LRT derivatives, calibrated to S&P/Moody's/Fitch default history |
| Yearn curation | 0.20 | 1–5 lower-safer, mapped piecewise | assets/strategies they curate |

Weights renormalize over whichever sources cover the asset. Fallbacks, in
order: the **baseline table** for blue-chip volatile collateral the
stablecoin raters never cover (WETH 9.0, wstETH/cbBTC 8.5, SOL 8.5, … —
marked `*`); **PT resolution** (PT-x scores its underlying −0.5 wrapper
haircut, `→`); otherwise **unrated** — sizable unrated exposure (≥10 % of
a book, or an LP/loop leg beside a rated one) scores **3.0**.

## 2. Per-category logic

### LP (DEX pools, incl. Convex / StakeDAO / Beefy wrappers)
- Score = **worst leg** of the pooled assets. Lending signals don't apply.
- **Pool balance ratio** (Curve family, live from Curve's API): heaviest
  coin ≥ 85 % of pool value or ≥ 2.2× equal weight → **−1.0**; ≥ 1.5×
  equal weight → **−0.5** (`pool 95% in pmUSD` — LPs in a lopsided
  stableswap effectively hold the weak side).

### Lending (pooled markets and lending vaults)
Aave, Morpho markets, Euler, Kamino, Curvance, Fluid, Lista, … and
lending vaults: TermMax, Gearbox, Scallop, Loopscale, Current, Project 0.
- **Collateral leg**: debt-side assets scored per §1, weighted by debt
  (isolated pairs directly; Aave pools by supply×LLTV capacity; Kamino by
  same-market reserves; Curvance from its on-chain reader). Overall =
  worst of (deposit-asset leg, collateral leg).
- **Utilization** > 92 % → −1.0 · **LLTV** ≥ 94.5 % → −0.5, ≥ 96.5 % →
  −1.0 · unrecognized **oracle** on an isolated market → −0.5.
- **Collateral not visible** → capped **5.9**.

### Strategy vaults (curated allocators)
IPOR, Lagoon, Yearn, Ember, Upshift, Concrete, Pareto, Yuzu, Veda,
Gauntlet, ether.fi Liquid, Makina, Steakhouse, ….
- **Allocation leg** from the vault's live book (IPOR API, Lagoon
  composition, Yearn ydaemon strategies, Morpho vault allocations),
  weighted by position size. Positions resolve deepest-first:
  1. named **Morpho vault** → that vault's actual collateral book
     (`[name]`);
  2. **assets parsed from the position label** → worst named asset, venue
     as floor (`~ASSET`);
  3. recognized **venue** alone → venue quality (`†`);
  4. idle/wallet → the vault's own asset; else unrated (3.0 if ≥ 10 %).
- **Credora vault rating** (23 vaults: Spark, Steakhouse, Gauntlet, …):
  enters as its own leg (`credora vault A- (psl 0.41%)`) — a product-level
  PSL rating that already prices the book, curator record, and
  governance/timelock quality — and exempts the vault from the opacity
  cap.
- **Concentration** (Yearn curation rule — their allocator caps any
  single market at 95 %): a book with ≥ 90 % in one position → **−0.5**.
- **Allocation not visible** → capped **5.9**. Exception: a vault token
  the sources rate directly as a product (yBOLD, syrupUSDC) keeps that
  rating; plain deposit currencies (USDC, WETH…) never qualify.

### Looping (leveraged positions, Looping tab)
- Score = **worst of three legs**: deposit asset (long, levered), borrow
  asset (a depeg on either side liquidates), venue quality.
- **Leverage** ≥ 3× −0.5, ≥ 5× −1.0, ≥ 10× −1.5 · **LLTV** as in lending
  · **Utilization** > 92 % −1.0 · **Exit liquidity** < $1 M −1.0.
- yieldz's own label stays in the note as a reference.

### Pendle PT (fixed rate)
- Underlying score, **−0.5 PT wrapper** · **tenor** > 90 d −0.5, > 180 d
  −1.0, > 365 d −1.5 · pool TVL < $5 M −0.5 (exit is AMM-dependent).

### Tranches (Strata)
- Underlying score. Junior −1.5 (first loss); senior +0.5.

### Midas RWA
- Score the **mToken** itself (Pharos rates the strategy tokens), never
  the deposit asset.

## 3. Universal deductions and caps
- Red verification flags (MISMATCH / STALE / NOT-ACCRUING): **−2.0**.
- Self-reported APY (flat 30-day history): **−2.0**.
- TVL < $1 M: **−1.0** · leveraged/looping strategy name: **−1.0**.
- Not VERIFIED by the verification layer: capped **7.9**.
- Floor 0.5, ceiling 10.

## 4. Data sources inventory
Ratings: TID Research (staging site), Pharos API, Credora app API
(assets + vaults + rating-changes; per-market Morpho ratings available
but not yet consumed), Yearn curation reports.
Books/exposure: yieldz markets & vaults, Morpho GraphQL, Euler via
yieldz, IPOR fusion API, Lagoon GraphQL, ydaemon, Kamino metrics,
Curvance on-chain reader, Curve API (pools, balances, gauges).
Verification (feeds the flag deductions): yieldz, Pendle API, Curve
API + virtual price, Merkl campaigns, protocol APIs, on-chain
realized-yield via RPC registry (172 vaults).

## 5. Known gaps — the development backlog
- **Credora per-market ratings** for Morpho markets could replace our
  computed collateral legs where rated (their PSL Monte-Carlo beats our
  static weighting).
- **Exit-liquidity simulation** (Yearn/KPK do DEX-depth slippage
  modeling; we proxy with TVL/utilization thresholds).
- **Oracle depth**: we flag unrecognized providers; no staleness or
  manipulation-vector analysis.
- **Governance/upgradeability** (KPK's timelock/guardian checks): no
  structured source wired; Credora vault ratings carry it implicitly.
- **Books inside unrated managers** (Termstructure, Reenlever, Zyfai…)
  stay at the 3.0 floor until they publish anything.
- **Velodrome/Aerodrome gauge emissions** remain unverifiable (no API);
  affects the REWARD-HEAVY flag, not risk scores.

## 6. Deliberately excluded
Chain identity, APY volatility (both removed by request), curator
reputation as a standalone factor (subjective; Credora's curator modifier
covers it where they rate), audit status (no reliable feed). Reward
emissions live in the verification layer (orange REWARD-HEAVY flag), not
the risk score.

## 7. Reading a Risk Note
`score 3.7; USDC 9.0 (pharos 9.0, tid 9.0); collateral leg 4.7 (savUSD
4.7@100%); collateral leg governs; -1 tvl<1M` — deposit asset 9.0, but
the market lends against savUSD (4.7); worst leg governs; small TVL −1 →
3.7 High.
Markers: `*` baseline · `†` venue quality · `→` PT underlying ·
`[name]` resolved Morpho vault book · `~ASSET` parsed from a position
label · `credora vault X (psl Y%)` product-level rating leg.
