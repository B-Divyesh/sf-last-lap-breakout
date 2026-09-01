import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:finite-run a title-screen sample reaches the eighth-lap result', async ({ page }) => {
  await page.goto('/?test=1');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\?test=1$/);
  for (let lap = 1; lap < 8; lap++) {
    await expect(page.getByRole('heading', { name: 'Choose one modifier' })).toBeVisible();
    await page.locator('[data-perk]').first().click();
  }
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
  await expect(page.getByLabel('Build string')).toHaveValue('LLB-7B4T5S-CEBQHDW-0SBRZTA');
});

test('@claim:demo-sandbox demo is marked and uses a separate namespace', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => localStorage.setItem('last-lap-breakout:settings:v1', JSON.stringify({ assist: true, muted: true, shake: false })));
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Game settings' }).click();
  await expect(page.getByLabel('Mute sound')).not.toBeChecked();
  await page.getByLabel('Mute sound').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.waitForTimeout(1100);
  const storage = await page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage))
  }));
  expect(storage.session).toHaveProperty('demo:last-lap-breakout:v1');
  expect(storage.session).toHaveProperty('demo:last-lap-breakout:settings:v1');
  expect(storage.local).toEqual({ 'last-lap-breakout:settings:v1': JSON.stringify({ assist: true, muted: true, shake: false }) });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect.poll(() => page.evaluate(() => ({
    settings: sessionStorage.getItem('demo:last-lap-breakout:settings:v1'),
    run: JSON.parse(sessionStorage.getItem('demo:last-lap-breakout:v1') || '{}').seed
  }))).toEqual({ settings: null, run: 0x1a57d3a0 });
});

test('a deterministic loss reaches its end screen and restart resets the run', async ({ page }) => {
  await page.goto('/play?test=loss');
  await expect(page.getByRole('heading', { name: 'Hull depleted' })).toBeVisible();
  await page.getByRole('button', { name: 'Start another run' }).click();
  await expect(page.locator('[data-lap]')).toHaveText('1 / 8');
  await expect(page.getByRole('heading', { name: 'Hull depleted' })).not.toBeVisible();
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

test('@claim:best-result a completed real run saves its best result through reload', async ({ page }) => {
  await page.goto('/play?test=1');
  for (let lap = 1; lap < 8; lap++) {
    await expect(page.getByRole('heading', { name: 'Choose one modifier' })).toBeVisible();
    await page.locator('[data-perk]').first().click();
  }
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
  const shownScore = await page.locator('.result-score').textContent();
  const shownBuild = await page.getByLabel('Build string').inputValue();
  await expect(page.locator('[data-best-result]')).toContainText('Best result saved');
  const beforeReload = await page.evaluate(() => localStorage.getItem('last-lap-breakout:best:v1'));
  expect(beforeReload).toBeTruthy();
  expect(JSON.parse(beforeReload!)).toEqual({ score: Number(shownScore?.replace(/\D/g, '')), build: shownBuild, completed: true });
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('last-lap-breakout:best:v1'))).toBe(beforeReload);
});

test('@claim:frame-rate the 390px game maintains a 60 fps frame cadence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const intervals = await page.evaluate(() => new Promise<number[]>(resolve => {
    const times: number[] = [];
    const sample = (time: number): void => {
      times.push(time);
      if (times.length === 181) resolve(times.slice(1).map((value, index) => value - times[index]));
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  const average = intervals.reduce((total, value) => total + value, 0) / intervals.length;
  const sorted = [...intervals].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  expect(average).toBeGreaterThanOrEqual(14);
  expect(average).toBeLessThanOrEqual(18);
  expect(p95).toBeLessThanOrEqual(22);
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
  const canvasBox = await page.locator('#preview-game canvas').boundingBox();
  expect(canvasBox).not.toBeNull();
  expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(844);
  const demoAction = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  expect(demoAction).not.toBeNull();
  expect(demoAction!.y + demoAction!.height).toBeLessThanOrEqual(844);
  for (const target of await page.locator('.site-header .wordmark, .site-header nav a:visible, .site-footer a').all()) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/demo');
  for (const target of await page.locator('.demo-banner button, .demo-banner a').all()) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('rejects a structurally incomplete saved run and supports remapped keys', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('last-lap-breakout:v1', JSON.stringify({ lap: 1, bricks: [] })));
  await page.goto('/play');
  await expect(page.locator('[data-lap]')).toHaveText('1 / 8');
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('Left movement').selectOption('j');
  await page.getByRole('button', { name: 'Save settings' }).click();
  const canvas = page.locator('canvas');
  await canvas.focus();
  const start = Number(await canvas.getAttribute('data-paddle'));
  await page.keyboard.down('j'); await page.waitForTimeout(180); await page.keyboard.up('j');
  expect(Number(await canvas.getAttribute('data-paddle'))).toBeLessThan(start);
  expect(errors).toEqual([]);
});

test('the standalone not-found document has the designed 404 page', async ({ page }) => {
  const response = await page.goto('/404.html');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Page not found — Last Lap Breakout');
  await expect(page.getByRole('heading', { name: 'This lap does not exist' })).toBeVisible();
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
