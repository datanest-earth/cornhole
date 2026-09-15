import { describe, expect, test } from 'bun:test'
import {
  loadCurrentGame,
  loadHistory,
  loadSavedNames,
  saveCurrentGame,
  saveHistory,
  saveSavedNames,
  STORAGE_KEYS,
  upsertHistory,
} from '../../src/lib/storage.ts'
import { applyRound, createGame } from '../../src/lib/scoring.ts'
import type { Game } from '../../src/lib/types.ts'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()

  get length() {
    return this.data.size
  }

  clear() {
    this.data.clear()
  }

  getItem(key: string) {
    return this.data.get(key) ?? null
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.data.delete(key)
  }

  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

const setup = (name: string) => ({
  playerCount: 1 as const,
  players: [name, ''] as [string, string],
})

describe('local storage persistence', () => {
  test('round-trips saved names, current game, and history', () => {
    const storage = new MemoryStorage()
    saveSavedNames(['Ada', 'Grace'], storage)
    expect(loadSavedNames(storage)).toEqual(['Ada', 'Grace'])

    let game = createGame(setup('Ada'), setup('Alan'))
    game = applyRound(game, { hole: 4, board: 0 }, { hole: 0, board: 0 }, 'r1')
    saveCurrentGame(game, storage)
    expect(loadCurrentGame(storage)?.score.red).toBe(12)

    saveHistory([game], storage)
    expect(loadHistory(storage)).toHaveLength(1)
    expect(storage.getItem(STORAGE_KEYS.history)).toContain('Ada')

    saveCurrentGame(null, storage)
    expect(loadCurrentGame(storage)).toBeNull()
  })

  test('recovers from corrupt JSON', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEYS.names, '{not json')
    expect(loadSavedNames(storage)).toEqual([])
  })

  test('upsertHistory replaces the same game id at the front', () => {
    const first = { id: 'a' } as Game
    const second = { id: 'b' } as Game
    const updated = { id: 'a', winner: 'red' } as Game
    expect(upsertHistory([first, second], updated).map((game) => game.id)).toEqual([
      'a',
      'b',
    ])
  })
})
