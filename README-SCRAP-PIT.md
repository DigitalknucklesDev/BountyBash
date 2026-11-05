# Scraplords V2.8.9 — Scrap-Pit Express Duel (V1)

## GitHub Pages installation

Extract the ZIP and copy the contents into the root of the existing `BountyBash` repository, keeping the existing folders and files. Commit changes and wait for GitHub Pages. Open `index.html` and select **SCRAP-PIT · EXPRESS DUEL** from the main menu. `scrap-pit.html` can also be opened directly.

This package includes the previous V2.8.8 source and audio, and includes the original game artwork from the older asset packages (without replacing existing GitHub files unless you choose to overwrite them). It does not require an external API, build step, or backend. Test via a local server: `python -m http.server 8000` then visit `http://localhost:8000/scrap-pit.html`.

## Scrap-Pit rules implemented

- Four combat cells D3, E3, D4, E4; P2 deck C3 and discard C4; P1 discard F3 and deck F4.
- 64-card decks per player, filtered to Riders, Ammo, Ultimates, Quick Fix. Each card identity occurs at most four times. Initial five-card hands; weighted draws using main game's draw weighting.
- Three actions per turn, draw, Rider activation onto any empty field cell, orthogonal move, adjacent attack, Duel for Position, turn-end automatic draw, and seven-card End Phase hand cap.
- Uses the existing `Game.duel`, attack response, CAM, Ammo/Ultimate, defense response, Quick Fix, and KO logic from the Bounty Bash engine. Ties count as attacker hits. Attacks KO, whereas a successful Duel for Position immediately discards the defender.
- KO claims: stepping onto allied KO returns that card to its owner's hand; stepping onto enemy KO sends it to its owner's Scrap Pit.
- Losing a Rider to a combat capture or position duel reduces its owner's total HP by its **printed defense**. Both players begin with 30 HP. Zero HP loses the round. No Gates, Backlots, bounty scoring or bounty steals.
- PvP, PvC and CvC, with basic Easy/Normal/Hard NPC heuristics; single match and Best of 3. Saves state in sessionStorage, including series score.
- Sound effects and one soundtrack per series use the existing audio manager; browser audio requires a user gesture.

## V1 limitations and items to test

- Scrap-Pit's NPC logic is a **new compact heuristic controller**, not the full Monte Carlo planner from Bounty Bash. Difficulty changes timing and some tactical preferences; advanced AI parity is a future iteration.
- Abilities tied to Gates, Backlots, and bounty scoring have no effect in Scrap-Pit. Rider-specific abilities inherited from the shared duel code (mascot defense, Heavy Cover, rally, etc.) remain active when applicable. Some movement-only specialty abilities are not yet adapted.
- Decks are reconstructed from eligible card types to exactly 64 cards; this differs from the original Bounty Bash card composition, which includes noncombat items/perks.
- Browser playtesting and full NPC-vs-NPC balance tests are not completed. Unit smoke tests are in `test-scrap-pit.mjs`.
- This release does not change Bounty Bash's normal game mechanics.

## Files added

- `scrap-pit.html`: new mini-game page
- `src/scrap-pit.js`: mini-game game state and combat rule adaptations
- `src/scrap-pit-main.js`: UI, turn control, modes, series, NPC and audio hooks
- `src/scrap-pit.css`: responsive four-tile arena
- `test-scrap-pit.mjs`: Node smoke tests
- `src/main.js`: adds a menu link to Scrap-Pit
