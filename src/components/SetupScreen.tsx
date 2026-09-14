import type { TeamColor, TeamSetup } from '../lib/types.ts'

type Props = {
  color: TeamColor
  setup: TeamSetup
  onChange: (setup: TeamSetup) => void
}

export function TeamSetupCard({ color, setup, onChange }: Props) {
  const label = color === 'red' ? 'Red team' : 'Blue team'
  const listId = 'player-names'

  return (
    <section className={`team-card team-${color}`} data-testid={`${color}-setup`}>
      <header>
        <h2>{label}</h2>
        <fieldset>
          <legend className="sr-only">Players</legend>
          <label>
            <input
              type="radio"
              name={`${color}-player-count`}
              data-testid={`${color}-count-1`}
              checked={setup.playerCount === 1}
              onChange={() => onChange({ ...setup, playerCount: 1 })}
            />
            1 player
          </label>
          <label>
            <input
              type="radio"
              name={`${color}-player-count`}
              data-testid={`${color}-count-2`}
              checked={setup.playerCount === 2}
              onChange={() => onChange({ ...setup, playerCount: 2 })}
            />
            2 players
          </label>
        </fieldset>
      </header>
      <div className="player-fields">
        {Array.from({ length: setup.playerCount }, (_, index) => (
          <label key={index}>
            Player {index + 1}
            <input
              type="text"
              name={`${color}-player-${index + 1}`}
              autoComplete="off"
              list={listId}
              data-testid={`${color}-player-${index + 1}`}
              value={setup.players[index] ?? ''}
              onChange={(event) => {
                const players: [string, string] = [...setup.players]
                players[index] = event.target.value
                onChange({ ...setup, players })
              }}
              placeholder="Name"
              required
            />
          </label>
        ))}
      </div>
    </section>
  )
}

type FormProps = {
  savedNames: string[]
  red: TeamSetup
  blue: TeamSetup
  canStart: boolean
  onRedChange: (setup: TeamSetup) => void
  onBlueChange: (setup: TeamSetup) => void
  onStart: () => void
}

export function SetupScreen({
  savedNames,
  red,
  blue,
  canStart,
  onRedChange,
  onBlueChange,
  onStart,
}: FormProps) {
  return (
    <form
      className="setup-screen"
      data-testid="setup-form"
      onSubmit={(event) => {
        event.preventDefault()
        onStart()
      }}
    >
      <p className="lede">Name your teams, then toss bags to 21.</p>
      <div className="setup-grid">
        <TeamSetupCard color="red" setup={red} onChange={onRedChange} />
        <TeamSetupCard color="blue" setup={blue} onChange={onBlueChange} />
      </div>
      <datalist id="player-names" data-testid="player-names">
        {savedNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <button type="submit" data-testid="start-game" disabled={!canStart}>
        Start game
      </button>
    </form>
  )
}
