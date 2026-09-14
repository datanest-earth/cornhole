import { useState } from 'react'
import {
  adjustBags,
  emptyBags,
  formatTeamName,
  remainingBags,
  WIN_SCORE,
} from '../lib/scoring.ts'
import type { BagCounts, Game } from '../lib/types.ts'

type Props = {
  game: Game
  onApplyRound: (red: BagCounts, blue: BagCounts) => void
  onUndo: () => void
  onPlayAgain: () => void
  onNewGame: () => void
}

function BagStepper({
  color,
  bags,
  onChange,
}: {
  color: 'red' | 'blue'
  bags: BagCounts
  onChange: (bags: BagCounts) => void
}) {
  const remaining = remainingBags(bags)
  return (
    <div className={`bag-stepper team-${color}`} data-testid={`${color}-bags`}>
      <h3>{color === 'red' ? 'Red' : 'Blue'} bags</h3>
      {(['hole', 'board'] as const).map((field) => (
        <div key={field} className="stepper-row">
          <span>{field === 'hole' ? 'In the hole (3)' : 'On the board (1)'}</span>
          <div className="stepper-controls">
            <button
              type="button"
              data-testid={`${color}-${field}-dec`}
              aria-label={`Decrease ${color} ${field}`}
              onClick={() => onChange(adjustBags(bags, field, -1))}
              disabled={bags[field] === 0}
            >
              −
            </button>
            <strong data-testid={`${color}-${field}-count`}>{bags[field]}</strong>
            <button
              type="button"
              data-testid={`${color}-${field}-inc`}
              aria-label={`Increase ${color} ${field}`}
              onClick={() => onChange(adjustBags(bags, field, 1))}
              disabled={remaining === 0}
            >
              +
            </button>
          </div>
        </div>
      ))}
      <p className="remaining" data-testid={`${color}-remaining`}>
        {remaining} bag{remaining === 1 ? '' : 's'} left
      </p>
    </div>
  )
}

export function GameScreen({
  game,
  onApplyRound,
  onUndo,
  onPlayAgain,
  onNewGame,
}: Props) {
  const [redBags, setRedBags] = useState<BagCounts>(emptyBags)
  const [blueBags, setBlueBags] = useState<BagCounts>(emptyBags)
  const over = Boolean(game.winner)

  return (
    <section className="game-screen" data-testid="game-screen">
      <div className="scoreboard">
        <article className="score-card team-red">
          <h2>{formatTeamName(game.red.players)}</h2>
          <p className="score" data-testid="red-score">
            {game.score.red}
          </p>
        </article>
        <p className="to-win">First to {WIN_SCORE}</p>
        <article className="score-card team-blue">
          <h2>{formatTeamName(game.blue.players)}</h2>
          <p className="score" data-testid="blue-score">
            {game.score.blue}
          </p>
        </article>
      </div>

      {over ? (
        <div className="winner-banner" data-testid="winner-banner">
          {game.winner === 'red' ? formatTeamName(game.red.players) : formatTeamName(game.blue.players)}{' '}
          win{game.winner === 'red' && game.red.players.length === 1 ? 's' : ''}!
        </div>
      ) : (
        <div className="round-input">
          <BagStepper color="red" bags={redBags} onChange={setRedBags} />
          <BagStepper color="blue" bags={blueBags} onChange={setBlueBags} />
          <button
            type="button"
            className="primary"
            data-testid="apply-round"
            onClick={() => {
              onApplyRound(redBags, blueBags)
              setRedBags(emptyBags())
              setBlueBags(emptyBags())
            }}
          >
            Apply round
          </button>
        </div>
      )}

      <ol className="round-log" data-testid="round-log">
        {game.rounds.map((round, index) => (
          <li key={round.id} data-testid={`round-${index + 1}`}>
            Round {index + 1}: Red {round.awarded.red}, Blue {round.awarded.blue}
          </li>
        ))}
      </ol>

      <div className="game-actions">
        <button
          type="button"
          data-testid="undo-round"
          onClick={onUndo}
          disabled={game.rounds.length === 0}
        >
          Undo round
        </button>
        {over ? (
          <button type="button" data-testid="play-again" onClick={onPlayAgain}>
            Play again
          </button>
        ) : (
          <button type="button" data-testid="new-game" onClick={onNewGame}>
            New game
          </button>
        )}
      </div>
    </section>
  )
}
