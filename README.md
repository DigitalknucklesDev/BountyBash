# Scraplords: Bounty Bash V2.4 — Resource Perks and Ultimates

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
