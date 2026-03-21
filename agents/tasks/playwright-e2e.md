# Task: Playwright E2E Tests

## Objective
Write minimal but meaningful Playwright end-to-end tests that verify the app loads, renders, and all UI controls work. Desktop-only for now.

## Files to Create/Modify
- `playwright.config.ts` — Create Playwright configuration
- `tests/e2e/app.spec.ts` — Main E2E test file

## DO NOT MODIFY
- `src/` — no source code changes
- Any existing test files in `tests/unit/` or `tests/integration/`

## Setup

### playwright.config.ts
Create at project root:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 10000,
  },
})
```

## Tests to Write

### 1. Page Load
```typescript
test('page loads without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto('/')
  // Wait for canvas to appear
  await page.waitForSelector('canvas', { timeout: 5000 })
  expect(errors).toHaveLength(0)
})
```

### 2. Sound Overlay
```typescript
test('sound overlay appears and can be dismissed', async ({ page }) => {
  await page.goto('/')
  // Sound overlay should be visible
  const overlay = page.locator('.sound-overlay')
  await expect(overlay).toBeVisible()
  // Click the sound button or "no sound" link
  const noSound = page.locator('.no-sound-link')
  await noSound.click()
  // Overlay should disappear
  await expect(overlay).not.toBeVisible()
})
```

### 3. Controls Panel
```typescript
test('controls panel opens and closes', async ({ page }) => {
  await page.goto('/')
  // Dismiss sound overlay first
  await page.locator('.no-sound-link').click()
  // Dismiss onboarding if visible
  const onboarding = page.locator('.modal-backdrop.open')
  if (await onboarding.isVisible()) {
    await page.locator('.close-btn').click()
  }

  // Controls panel should be closed initially
  const panel = page.locator('.controls-panel')
  await expect(panel).not.toHaveClass(/open/)

  // Click toggle to open
  await page.locator('.controls-toggle').click()
  await expect(panel).toHaveClass(/open/)

  // Click toggle again to close
  await page.locator('.controls-toggle').click()
  await expect(panel).not.toHaveClass(/open/)
})
```

### 4. Keyboard Shortcuts
```typescript
test('keyboard shortcuts work', async ({ page }) => {
  await page.goto('/')
  await page.locator('.no-sound-link').click()
  // Close onboarding if present
  const onboarding = page.locator('.modal-backdrop.open')
  if (await onboarding.isVisible()) {
    await page.locator('.close-btn').click()
  }

  // Space pauses/resumes (check stats update or button state)
  // 'C' opens controls
  await page.keyboard.press('c')
  await expect(page.locator('.controls-panel')).toHaveClass(/open/)

  // '?' opens help
  await page.keyboard.press('?')
  await expect(page.locator('.modal-backdrop')).toHaveClass(/open/)

  // Escape closes help
  await page.keyboard.press('Escape')
})
```

### 5. Stats Bar Visible
```typescript
test('stats bar shows and updates', async ({ page }) => {
  await page.goto('/')
  await page.locator('.no-sound-link').click()

  const statsBar = page.locator('.stats-bar')
  await expect(statsBar).toBeVisible()

  // Should have stats items
  const items = page.locator('.stats-item')
  expect(await items.count()).toBeGreaterThan(0)
})
```

### 6. Event Log Panel
```typescript
test('event log opens and shows events', async ({ page }) => {
  await page.goto('/')
  await page.locator('.no-sound-link').click()
  // Close onboarding if present
  const onboarding = page.locator('.modal-backdrop.open')
  if (await onboarding.isVisible()) {
    await page.locator('.close-btn').click()
  }

  // Open event log with 'L' or click
  await page.keyboard.press('l')
  const log = page.locator('.event-log')
  await expect(log).toHaveClass(/open/)

  // Wait a moment for events to accumulate
  await page.waitForTimeout(3000)

  // Should have some events
  const events = page.locator('.event-entry')
  expect(await events.count()).toBeGreaterThan(0)
})
```

### 7. Canvas Renders
```typescript
test('canvas renders content (not blank)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.no-sound-link').click()

  // Wait for simulation to run a bit
  await page.waitForTimeout(2000)

  // Take screenshot and verify canvas isn't blank
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  // Check canvas has non-zero dimensions
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThan(100)
  expect(box!.height).toBeGreaterThan(100)
})
```

## Important Notes
- Use `page.locator('.no-sound-link').click()` at the start of each test to dismiss the sound overlay (it blocks interaction)
- The onboarding modal may also appear on first load — dismiss it if visible
- The app uses localStorage for onboarding state, so each test in a fresh context may see onboarding
- Keep tests simple and resilient — don't assert exact pixel values or specific event messages
- Run tests with: `npx playwright test`
- The existing `npm run check` does NOT include Playwright tests — that's fine, E2E is separate
- Run `npx playwright install chromium` first if browsers aren't installed (check if the worktree has them)

## Acceptance Criteria
- [ ] `playwright.config.ts` created with dev server integration
- [ ] 7+ E2E tests covering: load, sound overlay, controls, keyboard, stats, event log, canvas
- [ ] All tests pass with `npx playwright test`
- [ ] Tests are resilient (handle overlays, timeouts appropriately)
- [ ] No source code modifications
- [ ] `npm run check` still passes (existing tests unaffected)
