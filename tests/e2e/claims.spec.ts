import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  brickDamage,
  choosePerk,
  createRun,
  hitScore,
  LAP_SECONDS,
  lapClearScore,
  launchSpeed,
  makeBricks,
  paddleAngleMultiplier,
  paddleSpeed,
  paddleWidth,
  PERKS,
  RunState,
  splitHitBonus,
  STEP,
  stepRun,
  TOTAL_LAPS
} from '../../src/game/core';

async function finishAcceleratedRun(page: import('@playwright/test').Page): Promise<void> {
  for (let lap = 1; lap < TOTAL_LAPS; lap++) {
    await expect(page.getByRole('heading', { name: 'Choose one modifier' })).toBeVisible();
    await expect(page.locator('[data-perk]')).toHaveCount(3);
    if (lap === 1) await page.keyboard.press('1');
    else await page.locator('[data-perk]').first().click();
  }
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
}

function advanceExactlyOneLap(run: RunState): void {
  expect(run.lapTime).toBe(LAP_SECONDS);
  // Keep the orb inert so this test proves the fixed timer rather than paddle skill.
  run.ball.y = 0.5; run.ball.vx = 0; run.ball.vy = 0;
  for (let tick = 0; tick < LAP_SECONDS / STEP; tick++) stepRun(run, STEP, 0);
  expect(run.lapTime).toBe(0);
}

test('@claim:finite-run a title-screen sample reaches the eighth-lap result', async ({ page }) => {
  const simulation = createRun(0x1a57d3a0);
  for (let lap = 1; lap <= TOTAL_LAPS; lap++) {
    advanceExactlyOneLap(simulation);
    if (lap < TOTAL_LAPS) {
      expect(simulation.status).toBe('draft');
      choosePerk(simulation, simulation.draft[0]);
    }
  }
  expect(simulation.elapsed).toBeCloseTo(TOTAL_LAPS * LAP_SECONDS, 8);
  expect(simulation.status).toBe('won');
  const finalCore = makeBricks(TOTAL_LAPS);
  expect(finalCore.filter(brick => brick.boss)).toHaveLength(1);
  expect(finalCore.filter(brick => !brick.boss && brick.hp === 2)).toHaveLength(10);

  await page.goto('/?test=1');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\?test=1$/);
  await finishAcceleratedRun(page);
  await expect(page.getByLabel('Build code')).toHaveValue('LLB-7B4T5S-CEBQHDW-0SBRZTA');
});

test('@claim:demo-sandbox demo is marked and uses a separate namespace', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('last-lap-breakout:settings:v1', JSON.stringify({ assist: true, muted: true, shake: false })));
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('/demo');
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
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/play');
  await expect.poll(() => page.evaluate(() => ({
    demoRun: sessionStorage.getItem('demo:last-lap-breakout:v1'),
    demoSettings: sessionStorage.getItem('demo:last-lap-breakout:settings:v1'),
    realSettings: localStorage.getItem('last-lap-breakout:settings:v1')
  }))).toEqual({
    demoRun: null,
    demoSettings: null,
    realSettings: JSON.stringify({ assist: true, muted: true, shake: false })
  });
});

test('@claim:assist-mode assist mode widens the next paddle, slows the orb, and adds one hull point', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('Assist mode').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(sessionStorage.getItem('demo:last-lap-breakout:settings:v1') || '{}').assist)).toBe(true);

  const normal = createRun(88, false);
  const assisted = createRun(88, true);
  expect(assisted.hull).toBe(normal.hull + 1);
  expect(paddleWidth(assisted)).toBeGreaterThan(paddleWidth(normal));
  expect(launchSpeed({ ...normal, lap: 2 })).toBeGreaterThan(launchSpeed({ ...assisted, lap: 2 }));
});

test('@claim:modifier-effects every modifier card has the exact effect it states', async ({ page }) => {
  await page.goto('/demo');
  expect(PERKS.map(perk => [perk.id, perk.detail])).toEqual([
    ['wide', 'Paddle grows 18%.'],
    ['quick', 'Paddle moves 16% faster.'],
    ['heavy', 'Hits score 40% more.'],
    ['split', 'Every fifth hit scores twice.'],
    ['guard', 'Restore one hull point.'],
    ['magnet', 'Paddle angles are easier.'],
    ['pierce', 'Boss hits deal two damage.'],
    ['bonus', 'Lap clears add 300 points.'],
    ['steady', 'Orb speed rises less each lap.']
  ]);

  const base = createRun(19);
  const withPerk = (id: RunState['perks'][number]): RunState => ({ ...createRun(19), perks: [id] });
  expect(paddleWidth(withPerk('wide')) / paddleWidth(base)).toBeCloseTo(1.18, 8);
  expect(paddleSpeed(withPerk('quick')) / paddleSpeed(base)).toBeCloseTo(1.16, 8);
  expect(hitScore(withPerk('heavy'), false) / hitScore(base, false)).toBeCloseTo(1.4, 8);
  expect(splitHitBonus({ ...withPerk('split'), hits: 5 })).toBe(hitScore(base, false));
  const guard = { ...createRun(19), hull: 3, status: 'draft' as const, draft: ['guard', 'wide', 'quick'] as RunState['draft'] };
  choosePerk(guard, 'guard');
  expect(guard.hull).toBe(4);
  expect(paddleAngleMultiplier(withPerk('magnet'))).toBe(0.7);
  expect(brickDamage(withPerk('pierce'), { boss: true })).toBe(2);
  expect(lapClearScore(withPerk('bonus')) - lapClearScore(base)).toBe(300);
  expect(launchSpeed({ ...withPerk('steady'), lap: 4 })).toBeLessThan(launchSpeed({ ...base, lap: 4 }));
});

test('@claim:key-remapping keyboard settings add J/L and H/K movement plus Escape pause', async ({ page }) => {
  await page.goto('/play');
  await page.getByRole('button', { name: 'Game settings' }).click();
  const mappings = [page.getByLabel('Left movement'), page.getByLabel('Right movement'), page.getByLabel('Pause run')];
  for (const mapping of mappings) {
    await mapping.focus();
    expect(await mapping.evaluate(element => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
    })).toEqual({ width: '3px', style: 'solid', color: 'rgb(255, 209, 102)' });
  }
  await mappings[0].selectOption('j');
  await mappings[1].selectOption('l');
  await mappings[2].selectOption('Escape');
  await page.getByRole('button', { name: 'Save settings' }).click();

  const canvas = page.locator('canvas');
  await canvas.focus();
  const start = Number(await canvas.getAttribute('data-paddle'));
  await page.keyboard.down('j'); await page.waitForTimeout(140); await page.keyboard.up('j');
  const afterJ = Number(await canvas.getAttribute('data-paddle'));
  expect(afterJ).toBeLessThan(start);
  await page.keyboard.down('l'); await page.waitForTimeout(140); await page.keyboard.up('l');
  const afterL = Number(await canvas.getAttribute('data-paddle'));
  expect(afterL).toBeGreaterThan(afterJ);
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(140); await page.keyboard.up('ArrowLeft');
  expect(Number(await canvas.getAttribute('data-paddle'))).toBeLessThan(afterL);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Your lap is saved' })).toBeVisible();

  await page.getByRole('button', { name: 'Game settings' }).click();
  await mappings[0].selectOption('h');
  await mappings[1].selectOption('k');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.locator('[data-resume]').click();
  await canvas.focus();
  const afterResume = Number(await canvas.getAttribute('data-paddle'));
  await page.keyboard.down('h'); await page.waitForTimeout(140); await page.keyboard.up('h');
  const afterH = Number(await canvas.getAttribute('data-paddle'));
  expect(afterH).toBeLessThan(afterResume);
  await page.keyboard.down('k'); await page.waitForTimeout(140); await page.keyboard.up('k');
  expect(Number(await canvas.getAttribute('data-paddle'))).toBeGreaterThan(afterH);
});

test('@claim:deterministic-build identical sample choices produce an identical build code', async ({ page }) => {
  await page.goto('/demo?test=1');
  await finishAcceleratedRun(page);
  const first = await page.getByLabel('Build code').inputValue();
  await page.getByRole('button', { name: 'Start another run' }).click();
  await finishAcceleratedRun(page);
  expect(await page.getByLabel('Build code').inputValue()).toBe(first);
});

test('@claim:copy-build a result build code can be copied', async ({ page, browser }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/demo?test=1');
  await finishAcceleratedRun(page);
  const displayedCode = await page.getByLabel('Build code').inputValue();
  await page.getByRole('button', { name: 'Copy build code' }).click();
  await expect(page.locator('[data-copy-status]')).toHaveText('Build code copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(displayedCode);

  const deniedContext = await browser.newContext();
  const deniedPage = await deniedContext.newPage();
  await deniedPage.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
    });
  });
  await deniedPage.goto('/demo?test=1');
  await finishAcceleratedRun(deniedPage);
  await deniedPage.getByRole('button', { name: 'Copy build code' }).click();
  await expect(deniedPage.locator('[data-copy-status]')).toHaveText('Copy failed. Select the build code instead.');
  await deniedContext.close();
});

test('a deterministic loss reaches its end screen and restart resets the run', async ({ page }) => {
  await page.goto('/play?test=loss');
  await expect(page.getByRole('heading', { name: 'Hull depleted' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause run' })).toBeHidden();
  await page.getByRole('button', { name: 'Start another run' }).click();
  await expect(page.locator('[data-lap]')).toHaveText('1 / 8');
  await expect(page.getByRole('heading', { name: 'Hull depleted' })).not.toBeVisible();
});

test('@claim:hull-loss each missed orb costs one hull point and zero hull ends the run', async ({ page }) => {
  await page.goto('/demo');
  const run = createRun(404);
  for (let miss = 1; miss <= 4; miss++) {
    run.ball.y = 1.02;
    run.ball.vy = 0.4;
    stepRun(run, STEP, 0);
    expect(run.hull).toBe(4 - miss);
  }
  expect(run.status).toBe('lost');
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

test('@claim:canvas-drag dragging across the playfield moves the paddle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/play');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const y = box!.y + box!.height * 0.75;
  await page.mouse.move(box!.x + box!.width * 0.25, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.75, y, { steps: 8 });
  await page.mouse.up();
  expect(Number(await canvas.getAttribute('data-paddle'))).toBeGreaterThanOrEqual(0.74);
});

test('@claim:default-pause P pauses and resumes a run with the default controls', async ({ page }) => {
  await page.goto('/play');
  const canvas = page.locator('canvas');
  await canvas.focus();
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Your lap is saved' })).toBeVisible();
  const pausedTick = Number(await canvas.getAttribute('data-tick'));
  await page.waitForTimeout(250);
  expect(Number(await canvas.getAttribute('data-tick'))).toBe(pausedTick);
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Your lap is saved' })).toBeHidden();
  await expect.poll(async () => Number(await canvas.getAttribute('data-tick'))).toBeGreaterThan(pausedTick);
});

test('@claim:local-recovery progress and settings survive reload', async ({ page }) => {
  await page.goto('/play');
  await page.waitForTimeout(1100);
  await page.locator('canvas').focus();
  await page.keyboard.press('p');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('last-lap-breakout:v1') || 'null'));
  expect(saved).not.toBeNull();
  expect(saved.tick).toBeGreaterThan(0);
  expect(saved.lapTime).toBeLessThan(LAP_SECONDS);
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('Mute sound').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your lap is saved' })).toBeVisible();
  await expect(page.locator('[data-lap]')).toHaveText(`${saved.lap} / ${TOTAL_LAPS}`);
  await expect(page.locator('[data-score]')).toHaveText(String(saved.score).padStart(6, '0'));
  await expect(page.locator('[data-hull]')).toHaveText(`${'◆'.repeat(saved.hull)}${'◇'.repeat(Math.max(0, 5 - saved.hull))}`);
  await expect(page.locator('canvas')).toHaveAttribute('data-tick', String(saved.tick));
  await expect(page.locator('[data-time]')).toHaveText(String(Math.ceil(saved.lapTime)).padStart(2, '0'));
  await page.locator('canvas').focus();
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Your lap is saved' })).toBeHidden();
  await expect.poll(() => page.locator('canvas').getAttribute('data-tick')).not.toBe(String(saved.tick));
  await page.getByRole('button', { name: 'Game settings' }).click();
  await expect(page.getByLabel('Mute sound')).toBeChecked();
});

test('@claim:autosave-cadence active progress automatically saves once per second without pausing', async ({ page }) => {
  await page.addInitScript(() => {
    const checkpoints: Array<{ at: number; tick: number; status: string }> = [];
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string): void {
      if (this === localStorage && key === 'last-lap-breakout:v1') {
        const run = JSON.parse(value) as { tick: number; status: string };
        checkpoints.push({ at: performance.now(), tick: run.tick, status: run.status });
      }
      originalSetItem.call(this, key, value);
    };
    Object.defineProperty(window, '__llbAutosaves', { value: checkpoints });
  });
  await page.goto('/play');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __llbAutosaves: unknown[] }).__llbAutosaves.length), { timeout: 3_500 }).toBeGreaterThanOrEqual(2);
  const checkpoints = await page.evaluate(() => (window as unknown as { __llbAutosaves: Array<{ at: number; tick: number; status: string }> }).__llbAutosaves.slice(0, 2));
  expect(checkpoints).toHaveLength(2);
  expect(checkpoints[0].status).toBe('playing');
  expect(checkpoints[1].status).toBe('playing');
  expect(checkpoints[0].tick).toBeGreaterThan(0);
  expect(checkpoints[1].tick).toBeGreaterThan(checkpoints[0].tick);
  expect(checkpoints[0].at).toBeGreaterThanOrEqual(950);
  expect(checkpoints[0].at).toBeLessThanOrEqual(1_300);
  expect(checkpoints[1].at - checkpoints[0].at).toBeGreaterThanOrEqual(950);
  expect(checkpoints[1].at - checkpoints[0].at).toBeLessThanOrEqual(1_300);
});

test('@claim:best-result a completed real run saves its best result through reload', async ({ page }) => {
  await page.goto('/play?test=1');
  for (let lap = 1; lap < 8; lap++) {
    await expect(page.getByRole('heading', { name: 'Choose one modifier' })).toBeVisible();
    await page.locator('[data-perk]').first().click();
  }
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
  const shownScore = await page.locator('.result-score').textContent();
  const shownBuild = await page.getByLabel('Build code').inputValue();
  await expect(page.locator('[data-best-result]')).toContainText('Best result saved');
  const beforeReload = await page.evaluate(() => localStorage.getItem('last-lap-breakout:best:v1'));
  expect(beforeReload).toBeTruthy();
  expect(JSON.parse(beforeReload!)).toEqual({ score: Number(shownScore?.replace(/\D/g, '')), build: shownBuild, completed: true });
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('last-lap-breakout:best:v1'))).toBe(beforeReload);
});

test('@claim:frame-rate the 390px touch game maintains a smooth frame cadence under 4x CPU throttling', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  const intervals = await page.evaluate(() => new Promise<number[]>(resolve => {
    const times: number[] = [];
    const sample = (time: number): void => {
      times.push(time);
      if (times.length === 361) resolve(times.slice(61).map((value, index) => value - times[index + 60]));
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  const sorted = [...intervals].sort((a, b) => a - b);
  const percentile = (fraction: number): number => sorted[Math.ceil(sorted.length * fraction) - 1];
  const median = percentile(0.5);
  const p90 = percentile(0.9);
  await testInfo.attach('frame-budget.json', {
    body: JSON.stringify({ samples: intervals.length, median, p90 }, null, 2),
    contentType: 'application/json'
  });
  // The median resists unrelated worker scheduling stalls while still
  // requiring the normal game frame to hit a 60 Hz display. The tail budget
  // permits at most one skipped refresh for 90% of measured frames.
  expect(median).toBeGreaterThanOrEqual(14);
  expect(median).toBeLessThanOrEqual(18);
  expect(p90).toBeLessThanOrEqual(34);
  await context.close();
});

test('@claim:local-privacy the demo has no account, purchases, ads, analytics, or personal-data requests', async ({ page }) => {
  const origins = new Set<string>();
  const requests: string[] = [];
  page.on('request', request => origins.add(new URL(request.url()).origin));
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  await page.goto('/demo');
  await page.waitForTimeout(500);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(requests.every(path => path === '/' || path === '/demo' || path === '/index.html' || path === '/sw.js' || path.startsWith('/assets/') || path.startsWith('/build/') || path === '/favicon.svg')).toBe(true);
  expect(await page.locator('iframe, input[type="email"], input[type="password"], form[action], [href*="login" i], [href*="checkout" i], [href*="payment" i]').count()).toBe(0);
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

test('@claim:reduced-motion the game stops star drift and screen shake with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play?test=hit');
  expect(await page.locator('.button').first().evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.00001);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  const canvas = page.locator('canvas');
  await expect.poll(async () => Number(await canvas.getAttribute('data-hits'))).toBeGreaterThan(0);
  const starOffsets = await page.evaluate(async () => {
    const values: string[] = [];
    for (let frame = 0; frame < 30; frame++) {
      values.push(document.querySelector('canvas')?.dataset.starOffset || '');
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    return values;
  });
  expect(new Set(starOffsets)).toEqual(new Set(['0.000']));
  await expect(page.locator('.game-shell')).not.toHaveClass(/is-shaking/);
  await expect(page.locator('.game-shell')).toHaveAttribute('data-shake-count', '0');
});

test('opening Game settings freezes active play until the dialog closes', async ({ page }) => {
  await page.goto('/play');
  const before = await page.locator('[data-time]').textContent();
  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.waitForTimeout(1600);
  await expect(page.locator('#settings-dialog')).toHaveJSProperty('open', true);
  await expect(page.locator('[data-time]')).toHaveText(before || '');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect.poll(() => page.locator('[data-time]').textContent()).not.toBe(before);
});

test('the landing sample board stays static after its first render', async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    const native = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      calls += 1;
      return native(callback);
    };
    Object.defineProperty(window, '__llbRafCalls', { get: () => calls });
  });
  await page.goto('/');
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __llbRafCalls: number }).__llbRafCalls)).toBe(0);
});

test('the immutable cache route targets only Vite hashed build files', async ({ page }) => {
  await page.goto('/');
  const raw = await (await page.request.get('/staticwebapp.config.json')).text();
  const config = JSON.parse(raw) as { routes: Array<{ route: string; headers?: Record<string, string> }> };
  expect((raw.match(/"routes"/g) || [])).toHaveLength(1);
  expect(config.routes[0]).toEqual({ route: '/build/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  const hashedFiles = await page.locator('link[rel="stylesheet"], script[type="module"]').evaluateAll(nodes => nodes.map(node => {
    const value = node instanceof HTMLLinkElement ? node.href : (node as HTMLScriptElement).src;
    return new URL(value).pathname;
  }));
  expect(hashedFiles).toHaveLength(3);
  expect(hashedFiles.every(path => /^\/build\/(?:main|style)-[A-Za-z0-9_-]+\.(?:js|css)$/.test(path))).toBe(true);
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
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Privacy — Last Lap Breakout');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Privacy — Last Lap Breakout');
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
  for (const [path, title] of [
    ['/demo/index.html', 'Demo — Last Lap Breakout'],
    ['/play/index.html', 'Play — Last Lap Breakout'],
    ['/privacy/index.html', 'Privacy — Last Lap Breakout'],
    ['/terms/index.html', 'Terms — Last Lap Breakout']
  ]) {
    const html = await (await page.request.get(path)).text();
    expect(html).toContain(`<meta property="og:title" content="${title}"`);
    expect(html).toContain(`<meta name="twitter:title" content="${title}"`);
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
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Last Lap Breakout');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', 'The requested Last Lap Breakout page was not found.');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Page not found — Last Lap Breakout');
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', 'The requested Last Lap Breakout page was not found.');
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
