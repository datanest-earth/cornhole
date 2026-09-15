import { formatTeamName } from '../lib/scoring.ts'
import type { Game } from '../lib/types.ts'

type Props = {
  history: Game[]
  onClear: () => void
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}

export function HistoryScreen({ history, onClear }: Props) {
  if (history.length === 0) {
    return (
      <section className="history-screen" data-testid="history-screen">
        <p data-testid="history-empty">No finished games yet.</p>
      </section>
    )
  }

  return (
    <section className="history-screen" data-testid="history-screen">
      <div className="history-header">
        <h2>Game history</h2>
        <button type="button" data-testid="clear-history" onClick={onClear}>
          Clear history
        </button>
      </div>
      <ol className="history-list" data-testid="history-list">
        {history.map((game) => (
          <li key={game.id} data-testid="history-item">
            <div className="history-teams">
              <span className="team-red">{formatTeamName(game.red.players)}</span>
              <span data-testid="history-score">
                {game.score.red} – {game.score.blue}
              </span>
              <span className="team-blue">{formatTeamName(game.blue.players)}</span>
            </div>
            <p className="history-meta">
              {game.winner
                ? `${formatTeamName(game.winner === 'red' ? game.red.players : game.blue.players)} won`
                : 'Unfinished'}
              {' · '}
              {formatWhen(game.finishedAt ?? game.startedAt)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
