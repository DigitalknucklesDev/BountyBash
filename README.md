Scraplords V2.8.1 — Animated launch menu. Includes V2.8 source, three new splash assets, mode and difficulty selection, first player P1/P2/random selector. New Match returns to launch menu. Install by merging contents into repository; preserve other assets. First player is applied after reset, before NPC turn scheduling. Browser visual testing not performed.


## V2.8.2 — Session persistence and Best of 3
- Session saved in browser sessionStorage on render; refresh restores current match, selected mode, difficulty, first player, series scores, and game board. Persists through reloads in the same browser tab, not guaranteed after tab/browser closure.
- NEW MATCH / SHUFFLE restarts the current round without leaving the selected game mode or resetting series wins.
- Menu supports Single Match or Best of 3. Best of 3 shows a round-result overlay after each match, with Next Round; final series victory overlay appears only when a player has 2 wins.
- Main Menu and Exit / Close controls require confirmation. Browser security generally prevents JavaScript from closing tabs opened by the user, so an exit screen explains how to close the tab manually.
- Existing gameplay and card assets unchanged.

## V2.8.3: Draw directly from gameboard decks
- Click/tap P1 deck H4 on P1's turn or P2 deck A3 on P2's turn to use the same `g.draw(active)` action as DRAW in the command center.
- Each manual draw costs one action, uses the existing weighted draw, updates the hand/deck counter, and triggers the existing draw animation and session persistence.
- Opponent deck clicks do not draw. Empty decks, no actions, completed games, and unresolved combat/selection overlays cannot spend a draw action.
- Deck card backs retain P2's 180-degree orientation. Discard tiles A4/H3 and existing controls are unchanged.
