import { describe, expect, test } from 'bun:test'
import {
  adjustBags,
  applyRound,
  cancellationAward,
  canStartTeam,
  createGame,
  emptyBags,
  formatTeamName,
  isValidBagCounts,
  rawPoints,
  rememberPlayerNames,
  remainingBags,
  undoRound,
  WIN_SCORE,
} from '../../src/lib/scoring.ts'
import type { TeamSetup } from '../../src/lib/types.ts'

const team = (names: [string, string], count: 1 | 2 = 1): TeamSetup => ({
  playerCount: count,
  players: names,
})

describe('bag validation', () => {
  test('allows up to four bags split between hole and board', () => {
    expect(isValidBagCounts({ hole: 4, board: 0 })).toBe(true)
    expect(isValidBagCounts({ hole: 2, board: 2 })).toBe(true)
    expect(isValidBagCounts({ hole: 3, board: 2 })).toBe(false)
    expect(isValidBagCounts({ hole: -1, board: 0 })).toBe(false)
  })

  test('adjustBags never exceeds four bags', () => {
    let bags = emptyBags()
    bags = adjustBags(bags, 'hole', 1)
    bags = adjustBags(bags, 'hole', 1)
    bags = adjustBags(bags, 'board', 1)
    bags = adjustBags(bags, 'board', 1)
    bags = adjustBags(bags, 'hole', 1)
    expect(bags).toEqual({ hole: 2, board: 2 })
    expect(remainingBags(bags)).toBe(0)
  })
})

describe('cancellation scoring', () => {
  test('four in the hole is 12 raw points', () => {
    expect(rawPoints({ hole: 4, board: 0 })).toBe(12)
  })

  test('cancels matching points and awards the difference', () => {
    expect(cancellationAward({ hole: 1, board: 1 }, { hole: 0, board: 2 })).toEqual({
      red: 2,
      blue: 0,
    })
    expect(cancellationAward({ hole: 0, board: 1 }, { hole: 1, board: 0 })).toEqual({
      red: 0,
      blue: 2,
    })
    expect(cancellationAward({ hole: 2, board: 0 }, { hole: 2, board: 0 })).toEqual({
      red: 0,
      blue: 0,
    })
  })

  test('rejects invalid bags', () => {
    expect(() => cancellationAward({ hole: 5, board: 0 }, emptyBags())).toThrow()
  })
})

describe('game flow', () => {
  test('requires the selected number of player names', () => {
    expect(canStartTeam(team(['Ada', ''], 1))).toBe(true)
    expect(canStartTeam(team(['', ''], 1))).toBe(false)
    expect(canStartTeam(team(['Ada', 'Grace'], 2))).toBe(true)
    expect(canStartTeam(team(['Ada', ''], 2))).toBe(false)
  })

  test('formats one or two player names', () => {
    expect(formatTeamName(['Ada'])).toBe('Ada')
    expect(formatTeamName(['Ada', 'Grace'])).toBe('Ada & Grace')
  })

  test('applies rounds until a team reaches 21', () => {
    let game = createGame(team(['Ada', '']), team(['Alan', '']))
    game = applyRound(game, { hole: 4, board: 0 }, emptyBags(), 'r1')
    expect(game.score).toEqual({ red: 12, blue: 0 })
    expect(game.winner).toBeNull()
    game = applyRound(game, { hole: 4, board: 0 }, emptyBags(), 'r2')
    expect(game.score.red).toBe(24)
    expect(game.score.red).toBeGreaterThanOrEqual(WIN_SCORE)
    expect(game.winner).toBe('red')
    expect(game.finishedAt).toBeTruthy()

    const ignored = applyRound(game, { hole: 4, board: 0 }, emptyBags(), 'r3')
    expect(ignored.rounds).toHaveLength(2)
  })

  test('undo restores the previous score and clears a winner', () => {
    let game = createGame(team(['Ada', '']), team(['Alan', '']))
    game = applyRound(game, { hole: 4, board: 0 }, emptyBags(), 'r1')
    game = applyRound(game, { hole: 4, board: 0 }, emptyBags(), 'r2')
    game = undoRound(game)
    expect(game.score).toEqual({ red: 12, blue: 0 })
    expect(game.winner).toBeNull()
    expect(game.rounds).toHaveLength(1)
  })
})

describe('remembered names', () => {
  test('keeps newest unique names first without changing earlier casing', () => {
    expect(rememberPlayerNames(['Ada', 'Alan'], ['ada', 'Grace', 'Alan'])).toEqual([
      'ada',
      'Grace',
      'Alan',
    ])
  })
})
