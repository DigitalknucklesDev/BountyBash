# Scraplords: Bounty Bash V2.0 — Combined-Action Multiplier (CAM)

## CAM Duel for Position
- Moving into an enemy-occupied tile costs **1 Move action** and starts a Duel for Position.
- Attacker may choose **0 through all remaining actions** as CAM during the Attack Response overlay. Each committed action adds **+1 Attack** to that duel only.
- The attacker may also choose any available Ammo cards; selected Ammo bonuses stack with CAM.
- Projected Attack and actions remaining are shown before commitment.
- **COMMIT AMMO + CAM** consumes only the selected Ammo and committed actions. **CONTINUE WITHOUT BUFFS** uses base Attack, spending no extra actions or Ammo.
- The defending player's existing Quick Fix / Victory Stance response follows, using the committed final Attack.
- CAM applies only to **Duel for Position**, not standard adjacent Attack. The initial Move action is never counted twice.
- If the attacker has no Ammo and no remaining actions, the duel resolves using the existing base Attack/Defense sequence.
- Ties favor the attacker, as before. All other V1.9 gameplay is preserved.

# SCRAPLORDS: BOUNTY BASH — V1 PLAYABLE PROTOTYPE

## Run
From this directory, start a local static web server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in a browser. Python 3 is sufficient; no npm, CDN, build tools, or internet connection required. VS Code Live Server is another option. Opening index.html directly as file:// will often block ES module imports.

## Play
Two players share one screen (hot-seat). New match shuffles two 64-card placeholder decks and draws five cards per player. The active player receives a free draw at the start of subsequent turns. Click a Rider in hand, then click a highlighted allied Gate to ACTIVATE. Select an allied board card to MOVE (click neighboring highlighted tile) or ATTACK (select ATTACK and click an adjacent enemy). Drag cards from hand to Gates or active units to tiles as an alternative. Draw costs one action; the end-turn button switches players. Each player wins by holding eight bounty-icon cards at end of turn.

Adjacent ATTACK: successful attack KOs target on tile. MOVE into KO tile to claim: enemy bounties enter Vault, enemy non-bounties are discarded, own KO returns to hand. MOVE into live enemy tile triggers a one-action Duel for Position; success captures immediately, failure returns attacker to origin. Bounty score shows number of captured qualifying cards, not printed bounty value.

## Rulebook mapping and V1 limits
Source: uploaded Rulebook v7.4, plus latest approved discussion. 6x8 board is 48 coordinate cells. Board layout uses 8 Gates, 16 Vaults, 4 deck/discard utility positions and **20 tan field cells**. The reference image's text saying "36 field tiles" is inconsistent with the actual 6x8 layout (8+16+4+20=48). The playable overlay follows the **visible tile layout**.

- Baseline movement is orthogonal only, pending final diagonal ruling. Standard attacks target orthogonally adjacent tiles.
- Unit HP shown as 1/1 is a V1 state indicator; attack vs defense uses printed base 1/1 and attack >= defense knocks out or captures. A persistent multi-hit health/damage model is not specified in the rulebook, so V1 does not invent one.
- Mascot Defense bonus is implemented for other active allied Mascots; placeholder Riders all have the printed Mascot ability.
- Ammo and Quick Fix are opt-in *auto-play* toggles (OFF by default) because a full reactive defense prompt/priority window is not yet implemented. Both are consumed when used in a duel; they cost no additional action.
- Team support is automatically combined from other active allied units orthogonally adjacent to defender.
- An optional **test movement perk** toggle is included, but its bonus tile is not automatically executed; V1 logs its trigger. Perks are not in placeholder decks.
- The 64-card per-player decks contain 48 Rider cards (alternating Binge-er Joe / Splice'n Dice), 8 Ammo and 8 Quick Fix. These are **temporary prototype decks**, not the finalized category allocation. A full 2-player draft and the complete historical starter composition are not implemented.
- The two supplied Riders have the lower-right bounty icon; Ammo and Quick Fix do not.
- Only 8 Vault slots per player are supported. If a vault is already full, the player wins at the end of their turn. Further captures use a temporary discard fallback.
- Enemy Gate rescue triggers upon entry when a captured card owned by the intruder is available; it exchanges the rescuer for the recovered card. Non-bounty rescuer case is unresolved.
- Field Traps, special Gate Keeper bonuses, co-ops, upgrades, ranged attack expansion cards, face-down placement, specialty ammo/shields, and robust deck exhaustion are not yet fully implemented. Face-down card-back asset is included for upcoming interactions.
- The original rulebook has no defined persistent damage pool; V1 uses a KO state and 1/1 HP indicator. No additional hidden health rules are assumed.
- No online matchmaking, backend, authentication or blockchain features in V1.

## Modular structure
- `src/rules.js`: tile classification, coordinate system, range geometry.
- `src/cards.js`: card catalog, placeholders, deck creation and shuffle.
- `src/engine.js`: deterministic state transitions except randomized shuffle; turn actions, combat, claims, Gate rescues, score.
- `src/main.js`: DOM UI, controls, hand/board drag and drop, render.
- `src/styles.css`: responsive layout, presentation, highlighting.
- `assets/`: supplied cards and generated board image.

## Next engineering iteration
Add interactive duel reaction windows (defender decides Quick Fix / Trap), effect registry for card abilities, complete draft/deck rules, co-op and trap layers, move-perk movement points, formal game phase finite state machine, explicit turn events/replay, undo and deterministic seeded shuffle, unit tests, AI or online multiplayer, accessibility and mobile touch drag support.


## V1.2 — Manual Quick Fix defense response
When a Duel for Position challenges a unit whose owner has Quick Fix cards in hand, play pauses for a defense overlay. The defending player can select multiple green-highlighted Quick Fix cards. Since Attack >= Defense is a hit, blocking requires Defense > Attack. Only selected cards are consumed on confirmation. If the total held Quick Fix defense is insufficient, the overlay reports NO DEFENSE AVAILABLE and allows continuing without consuming cards. The defender may also pass. The original movement action is spent before the prompt; movement and capture resolve after the response. This hot-seat implementation displays the defending hand's Quick Fix cards to both people sharing the screen. Standard adjacent attacks retain their prior behavior.

## V1.3 — Attacker Ammo → Defender Quick Fix duel sequence
When a Duel for Position begins, if the attacker holds Ammo, an attack overlay appears first. It displays the attacker's base Attack (including adjacent ally support), the target's current Defense, and the minimum Ammo bonus required to meet Defense. Eligible Ammo cards glow green and can be selected in any quantity. Confirming consumes only selected Ammo, then advances to the existing defender Quick Fix response overlay; passing consumes none. If all held Ammo cannot overcome Defense, the overlay warns INSUFFICIENT AMMO AVAILABLE, but allows a partial buff or passing (a duel can still be attempted). The defending player then selects Quick Fix cards, which must raise Defense strictly above final Attack to block. Both stages are action-free card responses to the single already-paid Move action. All other movement, capture, scoring and end-turn rules remain unchanged. This is a local hot-seat UI; each player's reaction cards are visible while their overlay is open.


## V1.5: Victory Stance, visible discards, victory announcement
- Each 64-card placeholder deck now includes four Victory Stance cards (replacing four Rider placeholders).
- Select Victory Stance in hand and press **SCORE VICTORY STANCE · FREE** to add it to your own Bounty Vault (1 bounty / 1 point; no action).
- Victory Stance also appears in the defender's Duel for Position response overlay as +2 Defense. If selected and committed successfully, it moves from hand to its owner's Bounty Vault rather than Scrap Pit, even if the duel ultimately resolves as a hit. Quick Fix moves to Scrap Pit; Ammo moves to Scrap Pit.
- Each player's Scrap Pit is shown as an overlapping pile of used card images with stable individual rotation. Discard totals still count every card.
- Reaching eight bounties immediately displays a full-screen victory announcement with restart button. The printed point total is displayed separately; eight bounty cards, not points, triggers victory.
- If a Victory Stance defense card scores the eighth bounty during a duel, the duel itself finishes resolving before the victory overlay appears.


## V1.6: Weighted draws and card dealing animation
- Weighted random draws sample **without replacement** from the remaining 64-card deck. This is deliberately a prototype rarity model, not an established rulebook probability.
- Draw weights per remaining card: **Binge-er Joe 10**, **Splice’n Dice 10**, **Ammo 4**, **Quick Fix 4**, **Victory Stance 1**. A card with weight 10 is ten times as likely to be selected as a particular remaining card with weight 1; aggregate category probability also depends on how many of each remain. Every card can eventually be drawn.
- Weights are editable in `src/cards.js` under `DRAW_WEIGHTS`. Deck composition remains unchanged; no cards are duplicated or created by weighting.
- A successful manual draw and the automatic beginning-of-turn draw display a card flying from the current player's physical Deck tile to the new hand card, with a small flip and arc. The initial opening five-card deal is instant to avoid a long startup sequence. Animation is skipped for reduced-motion preferences.
- Drawing checks deck and draw limits before spending an action; at most three paid draws are allowed on a normal turn in addition to its free draw. The first turn retains its previous no-free-draw behavior.

## V1.7 — Duel pass clarification and regression tests
The defender's **PASS DEFENSE · RESOLVE DUEL** button applies zero additional defense and resolves the committed Attack against the existing Defense. The attacker's Ammo committed in the previous stage remains counted. A tie counts as a hit; the attacker pays exactly one MOVE action for the Duel for Position. The battle log now explicitly records both response decisions. Note: Rider Mascot abilities and allied Team-Attack support are included in the totals shown on screen, and can change the apparent base-card comparison. The attacker-side **CONTINUE WITHOUT AMMO** is distinct: it intentionally declines all Ammo, even if cards were selected.

Run regression tests with `node test-duel.mjs` (Node.js 22 or newer). Tests cover defender pass, attack Ammo, defense response, unsuccessful duels, and action consumption.


## V1.8 — Draw actions and base-defense clarification
- Any remaining action may be spent on DRAW (one card per action), subject to having cards left in the Deck. There is no separate paid-draw limit. With three actions, a normal turn can draw one free card plus up to three paid cards. The initial turn still has no free draw, consistent with the existing prototype.
- Printed Rider DEF remains **1** in `src/cards.js`. The effective DEF in duels can exceed 1 due to the printed **Mascot** ability: +1 for each other allied Mascot in play. Thus DEF 4 is possible when three other allied Mascots are present. This build preserves that printed ability and the existing Team-Attack rule.
- Test using `node test-v18.mjs`.

## V1.9 — New common/uncommon Riders and rare Mascots
- Added supplied art for **Bullet Badger: Bash** (common, ATK 1 / DEF 1, Quip flavor text) and **G.E.N.T. Tech** (uncommon, ATK 1 / DEF 2, Rally: +1 DEF to each orthogonally adjacent allied unit). Both are bounty-icon Riders worth one bounty point.
- Preserved the Mascot pairing effect for **Binge-er Joe** and **Splice’n Dice**: each gains +1 DEF per *other* active allied Mascot. Non-Mascots no longer incorrectly count as Mascots.
- Prototype deck remains 64 cards: 6 Joe, 6 Splice, 18 G.E.N.T. Tech, 18 Bullet Badger, 6 Ammo, 6 Quick Fix, 4 Victory Stance.
- Per-card draw weights: Joe 1 (super rare), Splice 1 (super rare), G.E.N.T. Tech 6 (uncommon), Bullet Badger 10 (common), Ammo 4, Quick Fix 4, Victory Stance 1. Rarity is a playtest designation and not printed on the supplied cards.
- Rally is interpreted as applying to orthogonally adjacent allied defenders, consistent with current prototype movement/adjacency. G.E.N.T. Tech does not buff itself; multiple adjacent G.E.N.T. Tech cards can each contribute +1 DEF.
