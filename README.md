Scraplords V2.8.1 — Animated launch menu. Includes V2.8 source, three new splash assets, mode and difficulty selection, first player P1/P2/random selector. New Match returns to launch menu. Install by merging contents into repository; preserve other assets. First player is applied after reset, before NPC turn scheduling. Browser visual testing not performed.


## V2.8.2 — Session persistence and Best of 3
- Session saved in browser sessionStorage on render; refresh restores current match, selected mode, difficulty, first player, series scores, and game board. Persists through reloads in the same browser tab, not guaranteed after tab/browser closure.
- NEW MATCH / SHUFFLE restarts the current round without leaving the selected game mode or resetting series wins.
- Menu supports Single Match or Best of 3. Best of 3 shows a round-result overlay after each match, with Next Round; final series victory overlay appears only when a player has 2 wins.
- Main Menu and Exit / Close controls require confirmation. Browser security generally prevents JavaScript from closing tabs opened by the user, so an exit screen explains how to close the tab manually.
- Existing gameplay and card assets unchanged.
