import { expect, test, type Page } from '@playwright/test'

async function startSinglesGame(page: Page, red: string, blue: string) {
  await page.getByTestId('red-player-1').fill(red)
  await page.getByTestId('blue-player-1').fill(blue)
  await expect(page.getByTestId('start-game')).toBeEnabled()
  await page.getByTestId('start-game').click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function fourInTheHole(page: Page, color: 'red' | 'blue') {
  for (let i = 0; i < 4; i += 1) {
    await page.getByTestId(`${color}-hole-inc`).click()
  }
}

test.describe('cornhole scorekeeper', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('blocks starting until each team has the required names', async ({ page }) => {
    await expect(page.getByTestId('setup-form')).toBeVisible()
    await expect(page.getByTestId('start-game')).toBeDisabled()
    await page.getByTestId('red-player-1').fill('Ada')
    await expect(page.getByTestId('start-game')).toBeDisabled()
    await page.getByTestId('blue-player-1').fill('Alan')
    await expect(page.getByTestId('start-game')).toBeEnabled()
  })

  test('supports two players per team', async ({ page }) => {
    await page.getByTestId('red-count-2').check()
    await page.getByTestId('blue-count-2').check()
    await expect(page.getByTestId('red-player-2')).toBeVisible()
    await page.getByTestId('red-player-1').fill('Ada')
    await page.getByTestId('red-player-2').fill('Grace')
    await page.getByTestId('blue-player-1').fill('Alan')
    await page.getByTestId('blue-player-2').fill('Linus')
    await page.getByTestId('start-game').click()
    await expect(page.getByTestId('game-screen')).toContainText('Ada & Grace')
    await expect(page.getByTestId('game-screen')).toContainText('Alan & Linus')
  })

  test('applies cancellation scoring and undo', async ({ page }) => {
    await startSinglesGame(page, 'Ada', 'Alan')
    await fourInTheHole(page, 'red')
    await page.getByTestId('blue-board-inc').click()
    await page.getByTestId('apply-round').click()
    await expect(page.getByTestId('red-score')).toHaveText('11')
    await expect(page.getByTestId('blue-score')).toHaveText('0')
    await expect(page.getByTestId('round-1')).toContainText('Red 11, Blue 0')
    await page.getByTestId('undo-round').click()
    await expect(page.getByTestId('red-score')).toHaveText('0')
  })

  test('saves a finished game to history in local storage', async ({ page }) => {
    await startSinglesGame(page, 'Ada', 'Alan')
    await fourInTheHole(page, 'red')
    await page.getByTestId('apply-round').click()
    await fourInTheHole(page, 'red')
    await page.getByTestId('apply-round').click()
    await expect(page.getByTestId('winner-banner')).toContainText('Ada')
    await expect(page.getByTestId('red-score')).toHaveText('24')

    await page.getByTestId('nav-history').click()
    await expect(page.getByTestId('history-item')).toHaveCount(1)
    await expect(page.getByTestId('history-score')).toHaveText('24 – 0')

    const stored = await page.evaluate(() => ({
      history: localStorage.getItem('cornhole.history'),
      names: localStorage.getItem('cornhole.playerNames'),
    }))
    expect(stored.history).toContain('Ada')
    expect(stored.names).toContain('Alan')
  })

  test('remembers player names for datalist autocomplete', async ({ page }) => {
    await startSinglesGame(page, 'Ada Lovelace', 'Alan Turing')
    await page.getByTestId('new-game').click()
    await expect(page.getByTestId('setup-form')).toBeVisible()
    await expect(page.locator('#player-names option[value="Ada Lovelace"]')).toHaveCount(1)
    await expect(page.locator('#player-names option[value="Alan Turing"]')).toHaveCount(1)
    await page.getByTestId('red-player-1').fill('Ada')
    await expect(page.getByTestId('red-player-1')).toHaveAttribute('list', 'player-names')
  })

  test('restores an in-progress game after reload', async ({ page }) => {
    await startSinglesGame(page, 'Ada', 'Alan')
    await fourInTheHole(page, 'blue')
    await page.getByTestId('apply-round').click()
    await page.reload()
    await expect(page.getByTestId('game-screen')).toBeVisible()
    await expect(page.getByTestId('blue-score')).toHaveText('12')
  })

  test('clears history', async ({ page }) => {
    await startSinglesGame(page, 'Ada', 'Alan')
    await fourInTheHole(page, 'red')
    await page.getByTestId('apply-round').click()
    await fourInTheHole(page, 'red')
    await page.getByTestId('apply-round').click()
    await page.getByTestId('nav-history').click()
    await page.getByTestId('clear-history').click()
    await expect(page.getByTestId('history-empty')).toBeVisible()
  })
})
