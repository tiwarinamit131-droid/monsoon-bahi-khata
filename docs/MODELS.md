# The maths

Every model here is small enough to read in one sitting and is covered by tests in [`tests/`](../tests).

> **Data note.** Season totals, areas, irrigation shares and prices are synthetic and illustrative. The IMD departure bands and the all-India long-period average (868.6 mm, 1971–2020) are real.

## 1. Descriptive: building the season

Each state has a season total $R$ (from its normal and its departure). It is spread over 17 weeks using the normal weekly share $s_w$, an all-India anomaly shape $A_w$ (late onset, July surge, August break, September revival), a regional shift $S_{r,w}$ and seeded noise:

$$\tilde r_w = N s_w \cdot \max\!\left(0.05,\ 1 + \frac{0.7A_w + S_{r,w} + 12\,\varepsilon_w}{100}\right), \qquad \varepsilon_w \sim \mathcal N(0,1)$$

Then the weeks are rescaled so they add up **exactly** to the season total: $r_w = \tilde r_w \cdot R / \sum \tilde r$. A test checks this for every state.

Departures are filed into IMD bands after rounding to a whole percent, as IMD reports them: −19.4 % is _Normal_, −19.6 % is _Deficient_.

## 2. Diagnostic: why it happened

A state's departure $d$ is split into four global drivers (onset delay, El Niño, the Indian Ocean Dipole, the August break), each scaled by its region's sensitivity, plus a local residual:

$$d = \underbrace{\sum_k 1.5\, e_k\, \sigma_{r,k}}_{\text{global}} + \underbrace{\ell}_{\text{local weather}}$$

The residual is defined so the parts always sum to $d$, which the waterfall chart relies on.

The "closest twin" is the state whose weekly departures have the highest Pearson correlation with this one's.

### The yield model

Rain alone correlates only weakly with yield across states, because irrigated land barely notices the rain. Weighting by the rainfed share fixes that:

$$\Delta y = a + b \cdot d \cdot \left(1 - \tfrac{\text{irrigated}}{100}\right)$$

$a$ and $b$ come from closed-form ordinary least squares over the 26 states. The page reports both $r$ for rain alone and $R^2$ for the weighted model, and a test asserts the weighted model wins.

## 3. Predictive: 10,000 harvests

For a scenario (state, October rain $o$, pest pressure $p$), each run draws

$$d' = d + w_o\, o + 3\,\varepsilon_1$$
$$\Delta y = a + b\, d' (1 - \text{irr}) + \sigma\,\varepsilon_2 + \mu_p + s_p\,\varepsilon_3$$

where $\sigma$ is the model's residual standard error, $(\mu_p, s_p)$ is the pest effect, and $w_o$ is how much October rain matters there (0.6 for Tamil Nadu, which gets most of its rain from the north-east monsoon; 0.35 elsewhere in the south; 0.08 in the rest). Very wet seasons take an extra waterlogging penalty.

Output is $\text{baseline} \times (1 + \Delta y / 100)$. The page shows the p10, p50 and p90 and the probability of a loss deeper than 10 %. A test checks the simulated median against the analytic expectation to within 0.5 %.

## 4. Prescriptive: spending the relief budget

Seven actions (seed kits, protective irrigation, pest control, drainage, fodder banks, tank desilting, insurance fast-track) each have a capacity $c_i$ (the most value they could ever protect, scaled by the state's situation) and a first-rupee return $r_i$. Returns diminish:

$$b_i(x) = c_i\left(1 - e^{-r_i x / c_i}\right), \qquad b_i'(x) = r_i\, e^{-r_i x / c_i}$$

We maximise $\sum_i b_i(x_i)$ subject to $\sum_i x_i \le B$ and $x_i \ge 0$. Each $b_i$ is concave, so the KKT conditions are sufficient: every funded action has the same marginal return $\lambda$, and unfunded ones have $r_i \le \lambda$. Solving $b_i'(x_i) = \lambda$:

$$x_i^*(\lambda) = \frac{c_i}{r_i}\,\ln\frac{r_i}{\lambda} \quad \text{for } r_i > \lambda, \text{ else } 0$$

$\sum_i x_i^*(\lambda)$ falls monotonically in $\lambda$, so $\lambda$ is found by bisection. Because $\lambda$ can span several orders of magnitude, the bisection is geometric ($\sqrt{\text{lo}\cdot\text{hi}}$).

**Hurdle rate.** Spending ₹1 to protect ₹0.30 is a bad trade even if the money is available. With a hurdle $h$ (default 1), the solver first checks $\sum_i x_i^*(h)$. If that is already within budget, it funds everything up to $h$ and leaves the rest unspent, flagged for another state.

**Verification.** Tests check that spend equals budget (or budget minus the reported unspent), that marginal returns are equal across funded actions, and that 25 random instances are never beaten by a 4,000-step greedy reference.

## 5. The palette's fuzzy search

A query matches a target if its characters appear in order. A greedy left-to-right scan takes the earliest occurrence of each character, which often lands mid-word when a better alignment exists on word starts. The matcher instead uses dynamic programming over (query index, target index) and scores every alignment:

- +10 per matched character
- +8 at a word start, +4 at the very first character
- +6 when consecutive with the previous match, −gap otherwise

It then backtracks the best path to return the highlight indices.
