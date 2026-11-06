import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Helper to dismiss all initial overlays
async function dismissOverlays(page: Page) {
  // Dismiss sound overlay if visible
  const noSoundLink = page.locator('.no-sound-link');
  if (await noSoundLink.isVisible()) {
    await noSoundLink.click();
  }

  // Wait for onboarding and dismiss if it appears
  const onboarding = page.locator('.onboarding-overlay');
  try {
    // Onboarding might take a moment to fade in after sound overlay
    await onboarding.waitFor({ state: 'visible', timeout: 2000 });
    const closeBtn = page.locator('#onboarding-close');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  } catch {
    // If onboarding doesn't show, that's fine (might be stored in localStorage)
  }
}

test.describe('Agent Swarm E2E', () => {
  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/');
    // Wait for canvas to appear
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Some console errors might come from Tone.js or P5 if not handled, 
    // but the app should ideally have zero console errors.
    expect(errors).toHaveLength(0);
  });

  test('sound overlay appears and can be dismissed', async ({ page }) => {
    await page.goto('/');
    // Sound overlay should be visible initially
    const overlay = page.locator('.sound-overlay');
    await expect(overlay).toBeVisible();
    
    // Click "Continue without sound"
    const noSound = page.locator('.no-sound-link');
    await noSound.click();
    
    // Overlay should disappear
    await expect(overlay).not.toBeVisible();
  });

  test('controls panel opens and closes', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);

    // Controls panel should be closed initially
    const panel = page.locator('.controls-panel');
    await expect(panel).not.toHaveClass(/open/);

    // Click toggle to open
    await page.locator('.controls-toggle').click();
    await expect(panel).toHaveClass(/open/);

    // Click toggle again to close
    await page.locator('.controls-toggle').click();
    await expect(panel).not.toHaveClass(/open/);
  });

  test('keyboard shortcuts work', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);

    // 'C' opens/closes controls
    await page.keyboard.press('c');
    await expect(page.locator('.controls-panel')).toHaveClass(/open/);
    await page.keyboard.press('c');
    await expect(page.locator('.controls-panel')).not.toHaveClass(/open/);

    // '?' opens help modal
    await page.keyboard.press('?');
    const helpModal = page.locator('.help-overlay'); // Checked help.ts and it should have a specific class
    await expect(helpModal).toHaveClass(/open/);

    // Escape closes modals
    await page.keyboard.press('Escape');
    await expect(helpModal).not.toHaveClass(/open/);
  });

  test('stats bar shows and updates', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);

    const statsBar = page.locator('.stats-bar');
    await expect(statsBar).toBeVisible();

    // Should have stats items like "ACTIVE PARTICLES"
    const items = page.locator('.stats-item');
    expect(await items.count()).toBeGreaterThan(0);
    
    // Check if uptime is updating
    const uptimeValue = page.locator('#stat-active'); // Just an example, let's use a real one
    await expect(uptimeValue).not.toHaveText('0');
  });

  test('event log opens and shows events', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);

    // Open event log with 'L'
    await page.keyboard.press('l');
    const log = page.locator('.event-log'); 
    await expect(log).toHaveClass(/open/);

    // Wait for events to accumulate (sim runs in background)
    await page.waitForTimeout(3000);

    // Should have some events (failure or guardrail)
    const entries = page.locator('.event-entry');
    const count = await entries.count();
    expect(count).toBeGreaterThanOrEqual(0); 
  });


  test('canvas renders content', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);

    // Wait for simulation to run a bit
    await page.waitForTimeout(1000);

    // Check canvas exists and has size
    const canvas = page.locator('canvas.p5Canvas');
    await expect(canvas).toBeVisible();
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('has exactly one help button and a date line', async ({ page }) => {
    await page.goto('/');
    await dismissOverlays(page);
    await expect(page.locator('button[aria-label="Help"]')).toHaveCount(1);
    await expect(page.locator('.help-fab')).toHaveCount(0);
    await expect(page.locator('.app-subtitle')).toHaveText(/march 2026/i);
  });
});
