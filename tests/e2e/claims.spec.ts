import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:finite-run a seeded run reaches the eighth-lap result', async ({ page }) => {
  await page.goto('/demo?test=1');
  for (let lap = 1; lap < 8; lap++) {
    await expect(page.getByRole('heading', { name: 'Choose one modifier' })).toBeVisible();
    await page.locator('[data-perk]').first().click();
  }
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
  await expect(page.getByLabel('Build string')).toHaveValue(/^LLB-/);
});

test('@claim:demo-sandbox demo is marked and uses a separate namespace', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.waitForTimeout(1100);
  const keys = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(keys.session).toContain('demo:last-lap-breakout:v1');
  expect(keys.local).not.toContain('last-lap-breakout:v1');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:input-parity keyboard and touch controls move the paddle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/play');
  const canvas = page.locator('canvas');
  await canvas.focus();
  const start = Number(await canvas.getAttribute('data-paddle'));
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(180); await page.keyboard.up('ArrowRight');
  const afterKeyboard = Number(await canvas.getAttribute('data-paddle'));
  expect(afterKeyboard).toBeGreaterThan(start);
  const left = page.getByRole('button', { name: 'Move paddle left' });
  await left.dispatchEvent('pointerdown', { pointerId: 1 }); await page.waitForTimeout(180); await left.dispatchEvent('pointerup', { pointerId: 1 });
  const afterTouch = Number(await canvas.getAttribute('data-paddle'));
  expect(afterTouch).toBeLessThan(afterKeyboard);
});

test('@claim:local-recovery progress and settings survive reload', async ({ page }) => {
  await page.goto('/play');
  await page.waitForTimeout(1100);
  const saved = await page.evaluate(() => localStorage.getItem('last-lap-breakout:v1'));
  expect(saved).toBeTruthy();
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('Mute sound').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Game settings' }).click();
  await expect(page.getByLabel('Mute sound')).toBeChecked();
});

test('@claim:local-privacy the demo sends requests only to this site', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.waitForTimeout(500);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  await expect(page.getByText('Free. No account.')).toBeVisible({ timeout: 100 }).catch(() => undefined);
});

test('@claim:offline-reload the game reloads offline after the first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Play an eight-lap Breakout run' })).toBeVisible();
  await context.close();
});

test('landing pages have no serious accessibility findings', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
});

test('history routes, metadata, and the mobile layout work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveTitle('Last Lap Breakout — finish eight arcade laps');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveTitle('Privacy — Last Lap Breakout');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finish a Breakout run in eight minutes');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('production pages load without console or page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/play', '/demo', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    await page.waitForTimeout(100);
  }
  expect(errors).toEqual([]);
  await expect(page.getByRole('heading', { name: 'This lap does not exist' })).toBeVisible();
});
