import type { BagCounts, Game, Round, RoundAward, TeamSetup } from './types.ts'

export const BAGS_PER_ROUND = 4
export const POINTS_HOLE = 3
export const POINTS_BOARD = 1
export const WIN_SCORE = 21
export const MAX_SAVED_NAMES = 50

export const emptyBags = (): BagCounts => ({ hole: 0, board: 0 })

export function rawPoints(bags: BagCounts): number {
  return bags.hole * POINTS_HOLE + bags.board * POINTS_BOARD
}

export function isValidBagCounts(bags: BagCounts): boolean {
  return (
    Number.isInteger(bags.hole) &&
    Number.isInteger(bags.board) &&
    bags.hole >= 0 &&
    bags.board >= 0 &&
    bags.hole + bags.board <= BAGS_PER_ROUND
  )
}

export function remainingBags(bags: BagCounts): number {
  return BAGS_PER_ROUND - bags.hole - bags.board
}

export function cancellationAward(red: BagCounts, blue: BagCounts): RoundAward {
  if (!isValidBagCounts(red) || !isValidBagCounts(blue)) {
    throw new Error('Invalid bag counts')
  }
  const redPoints = rawPoints(red)
  const bluePoints = rawPoints(blue)
  if (redPoints === bluePoints) {
    return { red: 0, blue: 0 }
  }
  return redPoints > bluePoints
    ? { red: redPoints - bluePoints, blue: 0 }
    : { red: 0, blue: bluePoints - redPoints }
}

export function winnerFromScore(score: RoundAward): Game['winner'] {
  if (score.red >= WIN_SCORE && score.red > score.blue) return 'red'
  if (score.blue >= WIN_SCORE && score.blue > score.red) return 'blue'
  return null
}

export function cleanPlayers(setup: TeamSetup): string[] {
  const names = setup.players
    .slice(0, setup.playerCount)
    .map((name) => name.trim())
    .filter(Boolean)
  return names
}

export function canStartTeam(setup: TeamSetup): boolean {
  const names = cleanPlayers(setup)
  return names.length === setup.playerCount
}

export function formatTeamName(players: string[]): string {
  if (players.length === 0) return 'Unnamed'
  if (players.length === 1) return players[0]!
  return `${players[0]} & ${players[1]}`
}

export function rememberPlayerNames(
  existing: string[],
  incoming: string[],
): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const name of [...incoming, ...existing]) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result.slice(0, MAX_SAVED_NAMES)
}

export function createGame(red: TeamSetup, blue: TeamSetup, now = new Date()): Game {
  return {
    id: crypto.randomUUID(),
    startedAt: now.toISOString(),
    finishedAt: null,
    winner: null,
    red: { color: 'red', players: cleanPlayers(red) },
    blue: { color: 'blue', players: cleanPlayers(blue) },
    score: { red: 0, blue: 0 },
    rounds: [],
  }
}

export function applyRound(
  game: Game,
  red: BagCounts,
  blue: BagCounts,
  id = crypto.randomUUID(),
): Game {
  if (game.winner) {
    return game
  }
  const awarded = cancellationAward(red, blue)
  const score = {
    red: game.score.red + awarded.red,
    blue: game.score.blue + awarded.blue,
  }
  const winner = winnerFromScore(score)
  const round: Round = { id, red, blue, awarded }
  return {
    ...game,
    score,
    rounds: [...game.rounds, round],
    winner,
    finishedAt: winner ? new Date().toISOString() : null,
  }
}

export function undoRound(game: Game): Game {
  if (game.rounds.length === 0) return game
  const rounds = game.rounds.slice(0, -1)
  const score = rounds.reduce(
    (total, round) => ({
      red: total.red + round.awarded.red,
      blue: total.blue + round.awarded.blue,
    }),
    { red: 0, blue: 0 },
  )
  return {
    ...game,
    rounds,
    score,
    winner: null,
    finishedAt: null,
  }
}

export function adjustBags(
  bags: BagCounts,
  field: keyof BagCounts,
  delta: number,
): BagCounts {
  const next = { ...bags, [field]: bags[field] + delta }
  if (!isValidBagCounts(next)) return bags
  return next
}
