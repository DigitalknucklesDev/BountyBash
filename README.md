# Scraplords Bounty Bash V2.7.5 — New Cards & Bounty Keeper

Upload `index.html` and `src/` to your existing GitHub Pages repository, preserving your existing `assets/`. Upload the **separate artwork ZIP** into your repository's `assets/` folder. `crab.png` replaces the prior Crab Cannon image.

New cards: Fetch, Dark Gestal, Gama Pool, Chewy & Dunn. Crab Cannon artwork refreshed.

Chewy & Dunn: only while in its controlling player's Backlot, it may challenge an opposing Rider scoring on a Gate. The defending player selects a Chewy & Dunn copy or PASS. PASS sends the scoring Rider to its owner's Backlot and skips bonus bounty selection. If selected, standard Attack and Defense response overlays open (Ammo, Ultimate, CAM, Quick Fix, Victory Stance). Chewy gains +1 DEF while defending. If attack wins, the scoring Rider scores and Chewy is captured when space permits; if defense wins, the scoring Rider is captured into the defender's Backlot. An existing eight-card Backlot capacity applies.

The provided 31 draw-weight values have been applied verbatim. New card weights default to 2 each, pending user preference. Deck composition still has a maximum of four copies per kind; one copy of each new card was added (deck 68 cards). Draw weights are not the same as deck counts.

Tests: `node test-v275.mjs`, `node test-combat.mjs`, `node test-ko.mjs`. Browser UI not visually verified.
