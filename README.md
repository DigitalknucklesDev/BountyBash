# Scraplords V2.8 — Advanced Tactical NPC

Install: upload `index.html`, `src/`, and bundled `assets/` into the existing BountyBash GitHub Pages repository. Keep all existing assets, including the board and card art. This is an incremental code update on V2.7.9.

## AI improvements
- Easy: existing lightweight rule-based AI.
- Normal: 5 candidate actions × up to 4 Monte Carlo rollouts, 2-action follow-through.
- Hard: 9 candidate actions × up to 12 Monte Carlo rollouts, 3-action follow-through and sampled opponent response.
- Every simulation clones the game, shuffles the opposing hidden hand/deck partition, and uses existing Game methods. Real game state is never altered by planning.
- Modular files: ai-evaluator.js, ai-planner.js, ai-abilities.js, ai-memory.js, ai-debug.js; ai.js remains the legal action controller.
- NPC tactical feed reports planned move, sample count, candidate count and estimated value. Target highlight and action delays are retained.

## Limitations
This is an information-set Monte Carlo beam-rollout planner, not full MCTS. It does not perform exhaustive multi-turn minimax. The hidden-card sampling is an approximation; it preserves the opposing hand size but cannot reconstruct all public draw-history constraints. Card-specific heuristics cover selected synergies; the Game engine remains authoritative. No full browser UI test has been run. The planner may need performance tuning on slow mobile devices.
