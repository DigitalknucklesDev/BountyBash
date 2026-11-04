Scraplords V2.7.2 — Adjacent Combat Response Fix

Fixes:
- All adjacent attacks open the Attack Response overlay, even with no Ammo.
- All adjacent attacks open the Defense Response overlay, even with no Quick Fix / Victory Stance.
- Combat resolves only after the player confirms or passes both stages.
- Attack lower than Defense fails; ties count as attacker hits, as before.
- Existing Duel for Position, CAM, NPC, cinematic hand and modal layering retained.

Deployment: replace index.html and src/ files in your GitHub Pages repository. Keep existing assets/ unchanged.

Test: select a Rider, click ATTACK, choose an adjacent enemy; Attack Response should appear. Continue without buffs, then pass Defense; KO occurs only when final ATK >= final DEF.


V2.7.4: KO recovery correction: moving an active allied Rider onto a friendly KO tile returns that KO card to its original owner's hand (clears KO status and board position). Moving onto an enemy KO tile captures it to the active player's Backlot under existing bounty rules. Both use standard movement costs. NPC scoring now distinguishes recovery from capture.
