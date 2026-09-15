export type TeamColor = 'red' | 'blue'

export type BagCounts = {
  hole: number
  board: number
}

export type RoundAward = {
  red: number
  blue: number
}

export type Round = {
  id: string
  red: BagCounts
  blue: BagCounts
  awarded: RoundAward
}

export type Team = {
  color: TeamColor
  players: string[]
}

export type Game = {
  id: string
  startedAt: string
  finishedAt: string | null
  winner: TeamColor | null
  red: Team
  blue: Team
  score: RoundAward
  rounds: Round[]
}

export type TeamSetup = {
  playerCount: 1 | 2
  players: [string, string]
}
