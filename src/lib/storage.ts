import type { Game } from './types.ts'

export const STORAGE_KEYS = {
  names: 'cornhole.playerNames',
  history: 'cornhole.history',
  current: 'cornhole.currentGame',
} as const

export function loadJson<T>(
  key: string,
  fallback: T,
  storage: Storage = localStorage,
): T {
  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown, storage: Storage = localStorage) {
  storage.setItem(key, JSON.stringify(value))
}

export function loadSavedNames(storage: Storage = localStorage): string[] {
  const names = loadJson<unknown>(STORAGE_KEYS.names, [], storage)
  if (!Array.isArray(names)) return []
  return names.filter((name): name is string => typeof name === 'string')
}

export function saveSavedNames(names: string[], storage: Storage = localStorage) {
  saveJson(STORAGE_KEYS.names, names, storage)
}

export function loadHistory(storage: Storage = localStorage): Game[] {
  const history = loadJson<unknown>(STORAGE_KEYS.history, [], storage)
  if (!Array.isArray(history)) return []
  return history as Game[]
}

export function saveHistory(history: Game[], storage: Storage = localStorage) {
  saveJson(STORAGE_KEYS.history, history, storage)
}

export function loadCurrentGame(storage: Storage = localStorage): Game | null {
  return loadJson<Game | null>(STORAGE_KEYS.current, null, storage)
}

export function saveCurrentGame(
  game: Game | null,
  storage: Storage = localStorage,
) {
  if (!game) {
    storage.removeItem(STORAGE_KEYS.current)
    return
  }
  saveJson(STORAGE_KEYS.current, game, storage)
}

export function upsertHistory(history: Game[], game: Game): Game[] {
  const without = history.filter((item) => item.id !== game.id)
  return [game, ...without]
}
