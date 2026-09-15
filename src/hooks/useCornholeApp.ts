import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  applyRound,
  canStartTeam,
  createGame,
  rememberPlayerNames,
  undoRound,
} from '../lib/scoring.ts'
import {
  loadCurrentGame,
  loadHistory,
  loadSavedNames,
  saveCurrentGame,
  saveHistory,
  saveSavedNames,
  upsertHistory,
} from '../lib/storage.ts'
import type { BagCounts, Game, TeamSetup } from '../lib/types.ts'

export type View = 'play' | 'history'

const emptySetup = (): TeamSetup => ({
  playerCount: 1,
  players: ['', ''],
})

export function useCornholeApp() {
  const [savedNames, setSavedNames] = useState<string[]>(() => loadSavedNames())
  const [history, setHistory] = useState<Game[]>(() => loadHistory())
  const [current, setCurrent] = useState<Game | null>(() => loadCurrentGame())
  const [view, setView] = useState<View>('play')
  const [redSetup, setRedSetup] = useState<TeamSetup>(emptySetup)
  const [blueSetup, setBlueSetup] = useState<TeamSetup>(emptySetup)

  useEffect(() => {
    saveSavedNames(savedNames)
  }, [savedNames])

  useEffect(() => {
    saveHistory(history)
  }, [history])

  useEffect(() => {
    saveCurrentGame(current)
  }, [current])

  const canStart = useMemo(
    () => canStartTeam(redSetup) && canStartTeam(blueSetup),
    [redSetup, blueSetup],
  )

  const startGame = useCallback(() => {
    if (!canStart) return
    const game = createGame(redSetup, blueSetup)
    const names = rememberPlayerNames(savedNames, [
      ...game.red.players,
      ...game.blue.players,
    ])
    setSavedNames(names)
    setCurrent(game)
    setView('play')
  }, [blueSetup, canStart, redSetup, savedNames])

  const recordRound = useCallback((red: BagCounts, blue: BagCounts) => {
    setCurrent((game) => {
      if (!game) return game
      const next = applyRound(game, red, blue)
      if (next.winner) {
        setHistory((items) => upsertHistory(items, next))
      }
      return next
    })
  }, [])

  const undo = useCallback(() => {
    setCurrent((game) => (game ? undoRound(game) : game))
  }, [])

  const playAgain = useCallback(() => {
    if (!current) return
    setRedSetup({
      playerCount: current.red.players.length === 2 ? 2 : 1,
      players: [current.red.players[0] ?? '', current.red.players[1] ?? ''],
    })
    setBlueSetup({
      playerCount: current.blue.players.length === 2 ? 2 : 1,
      players: [current.blue.players[0] ?? '', current.blue.players[1] ?? ''],
    })
    setCurrent(null)
  }, [current])

  const newGame = useCallback(() => {
    setCurrent(null)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    savedNames,
    history,
    current,
    view,
    setView,
    redSetup,
    blueSetup,
    setRedSetup,
    setBlueSetup,
    canStart,
    startGame,
    recordRound,
    undo,
    playAgain,
    newGame,
    clearHistory,
  }
}
