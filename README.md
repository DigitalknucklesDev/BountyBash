# Scraplords: Bounty Bash V2.3 — Resource Perks and Ultimates

## Added cards
- **Zap Factory** — Resource Perk, 1 bounty / point, provisional draw weight 2, one copy per 64-card deck. Activate into your Backlot for one action to enable a once-per-own-turn, end-of-turn free movement of one allied active unit by one orthogonally adjacent, unoccupied legal tile. An overlay allows selecting an eligible unit, choosing a tile, or skipping. This movement can score normally upon entering an opposing Gate. Perk is effective while the Zap Factory card is in the owner's current Backlot, and transfers with the card if claimed.
- **D.B. Calldown** — Ultimate, +3 Attack, provisional draw weight 2, one copy per 64-card deck. Offered alongside Ammo during the attack buff selection for both Duel for Position and ordinary adjacent attacks. It stacks with Ammo and CAM (CAM remains Duel for Position only), and is consumed to the Scrap Pit on use.

## Resource Perk field-play interpretation
The user specified Resource Perks can initiate Duels for Position and score at Gates, in addition to Backlot activation. To support this, Zap Factory may also be activated as a board piece onto an allied Gate (one action), with **provisional** 0 Attack / 0 Defense because the card art does not print those stats. From the field it moves and initiates duels using standard rules, and scores normally on an enemy Gate. **Its end-turn free-move perk is only enabled while Zap Factory is in the Backlot.** The field-play interpretation and provisional stats should be confirmed in future playtests.

## Existing features retained
64-card placeholder decks, weighted draw without replacement, draw animation, 3 actions per turn, Mascot defense, Rally and Repair Relay, CAM, attack and defense responses, RCee ownership-dependent control, Gate scoring, Backlot vault, Scrap Pit and victory overlay.

## Notes
- Resource Perk free movement is restricted to an empty, adjacent legal tile. It does not initiate a free duel or KO claim; this is a conservative interpretation of 'move for one position'.
- End-of-turn free movement occurs before the turn changes, and can trigger normal Gate scoring and Gate bonus selection.
- If no eligible active unit can move, the turn ends normally.
- The V2.2 RCee Controller duration and Steel Yeti reactive Heavy Cover remain provisional / unimplemented as documented previously.

## Local run
From this folder run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Tests
Run `node --experimental-default-type=module test-v23.mjs` to test deck composition, Zap Factory Backlot activation and end-turn movement, D.B. Calldown adjacent attack and Scrap Pit consumption, and Zap Factory field deployment.

## V2.3.1 — Field Warden Gate-scoring hotfix
- Corrects Bounty Plow movement onto an enemy Gate: after capturing an enemy bounty, Field Warden now also scores itself through the normal Gate-scoring mechanism.
- Field Warden still requires an active RCee Controller source in its current player's field or Backlot to move and use Bounty Plow.
- Bounty Plow captures an enemy bounty on the destination tile; it does not automatically claim cards in adjacent tiles or the opponent's Backlot.
- Includes `test-warden-fix.mjs` regression tests.

## V2.3.2 — Hand selection and manual discard
- Click an already selected hand card to deselect it.
- Click a blank battlefield/hand area or CLEAR SELECTION to deselect.
- DISCARD SELECTED · FREE moves the selected hand card to its owner's Scrap Pit without consuming an action; no bounty is scored.
- These interactions are blocked while a duel, Gate claim, or Resource Perk response is pending.

## V2.4 NPC mode (code-only update)
Replace `index.html` and `src/` in the existing V2.3.2 GitHub Pages repository; keep the existing `assets/` folder. A new `src/ai.js` implements local rule-based NPCs. Choose Human vs Human, Human vs Computer (P2), or Computer vs Computer in Command Center. Changing mode restarts the match. Difficulty adjusts move selection randomness. This is a first-pass heuristic AI, not a trained model; browser playtesting is recommended, especially around special cards and pending interactions. All AI decisions run locally.

## V2.5 — Eight new cards

New Riders: Bot Squad, Binge’er Babe, Crab Cannon, Gun Rat, Katank, Steel Tooth Willy, Snare Bear. New Ultimate: Space Tazer (+3 Attack). All eight have original supplied PNG artwork in the separate V2.5 artwork package.

The decks remain 64 cards each by replacing eight copies of existing Rider cards; all new cards appear once per deck with weighted draws. Snare Bear is rare.

**Implemented provisional timing rules:**
- Bot Squad gets two action-free orthogonal moves per turn while the player controls an RCee source; remaining normal moves still cost actions.
- Crab Cannon automatically Swerves to an unoccupied legal adjacent tile when a controlled Field Warden would Bounty Plow it. If none exists, normal capture proceeds. No separate player choice overlay yet.
- Gun Rat has a new GUN RAT · DISCARD & DRAW 2 button when selected in hand. The action is free, draws up to two cards and puts Gun Rat in Scrap Pit. Ordinary DISCARD SELECTED does not activate this ability.
- Katank and existing Steel Yeti Heavy Cover automatically intercept an adjacent ally's attack by swapping positions. If multiple protectors exist, the first in the field list is used; no choice overlay yet.
- Steel Tooth Willy draws one card when scoring itself on an opposing Gate (including Gate score following a position duel). The ordinary Gate bounty claim remains intact.
- Space Tazer is an Ultimate and works in the existing Attack/CAM overlay. Snare Bear uses the existing Mascot defense logic.

To install: merge V2.5 code ZIP and V2.5 artwork ZIP into the existing site root, keeping your older assets. Do not delete the old assets folder. Keep the existing GitHub Pages workflow unchanged.

## V2.7 — Edition cap and cinematic hand
- Deck construction now enforces a hard maximum of four copies of each card kind.
- G.E.N.T. Tech reduced from five to four copies; Bullet Badger increased from three to four, retaining 64 cards per player.
- Hand is now a fixed bottom-screen fan. Hover or tap the hand header to expand; tap a card to select and collapse the hand for board placement. Swipe horizontally to navigate large hands on touchscreens.
- Existing card actions and NPC modes are unchanged.

## V2.7 Monte Carlo tactical NPC
- Hard mode scores up to 8 candidate actions with 8 sampled hidden-information rollouts per action, looking ahead up to 5 NPC steps. Easy and Normal retain faster priority-based decision logic.
- A sampled copy of the game is used for simulations; the real board is changed only by the selected legal action.
- Opponent hidden hand/deck are reshuffled in each simulated world. This is a lightweight Monte Carlo rollout planner, not full MCTS.
- NPC tactical feed shows chosen action, simulation count, and recent decisions; intended destination is highlighted on the board. Animations honor reduced-motion preference.
- Keep all existing assets; code-only update. No API or server required.
- Caveat: this is a prototype and full browser QA is recommended. It does not guarantee perfect opponent modeling or optimal play.
