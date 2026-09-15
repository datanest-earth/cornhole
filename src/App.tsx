import { GameScreen } from './components/GameScreen.tsx'
import { HistoryScreen } from './components/HistoryScreen.tsx'
import { SetupScreen } from './components/SetupScreen.tsx'
import { useCornholeApp } from './hooks/useCornholeApp.ts'
import './App.css'

function App() {
  const app = useCornholeApp()

  return (
    <div className="app" data-testid="app">
      <header className="app-header">
        <p className="eyebrow">Backyard classic</p>
        <h1>Cornhole</h1>
        <nav className="tabs">
          <button
            type="button"
            data-testid="nav-play"
            className={app.view === 'play' ? 'active' : ''}
            onClick={() => app.setView('play')}
          >
            Play
          </button>
          <button
            type="button"
            data-testid="nav-history"
            className={app.view === 'history' ? 'active' : ''}
            onClick={() => app.setView('history')}
          >
            History
          </button>
        </nav>
      </header>
      <main>
        {app.view === 'history' ? (
          <HistoryScreen history={app.history} onClear={app.clearHistory} />
        ) : app.current ? (
          <GameScreen
            game={app.current}
            onApplyRound={app.recordRound}
            onUndo={app.undo}
            onPlayAgain={app.playAgain}
            onNewGame={app.newGame}
          />
        ) : (
          <SetupScreen
            savedNames={app.savedNames}
            red={app.redSetup}
            blue={app.blueSetup}
            canStart={app.canStart}
            onRedChange={app.setRedSetup}
            onBlueChange={app.setBlueSetup}
            onStart={app.startGame}
          />
        )}
      </main>
    </div>
  )
}

export default App
