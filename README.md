# Cornhole Scorekeeper

Progressive Web App for keeping Red vs Blue cornhole score. Player names, in-progress games, and finished-game history live in `localStorage`.

## Stack

- Vite 8
- TypeScript 7
- React 19
- Bun (package manager and unit tests)
- Playwright (end-to-end)
- `vite-plugin-pwa` for installability and offline caching

## Scoring

Official-style cancellation scoring:

- Bag in the hole: 3 points
- Bag on the board: 1 point
- Only the net difference of a round is awarded
- First team to 21 wins

Each team has 1 or 2 players. Previously used names are stored and offered through a `<datalist>` on the setup form.

## Scripts

```bash
bun install
bun run dev
bun test
bun run test:e2e
bun run build
```
