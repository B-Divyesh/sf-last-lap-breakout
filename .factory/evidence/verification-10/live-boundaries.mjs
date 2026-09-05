import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = 'https://last-lap-breakout.sociobot.in';
const out = '.factory/evidence/verification-10';
const browser = await chromium.launch();
const report = {};

try {
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${base}/play`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const canvas = page.locator('canvas');
    const before = { time: await page.locator('[data-time]').innerText(), tick: await canvas.getAttribute('data-tick') };
    await page.getByRole('button', { name: 'Game settings' }).click();
    const opened = { time: await page.locator('[data-time]').innerText(), tick: await canvas.getAttribute('data-tick'), open: await page.locator('#settings-dialog').evaluate(dialog => dialog.open) };
    await page.waitForTimeout(1600);
    const during = { time: await page.locator('[data-time]').innerText(), tick: await canvas.getAttribute('data-tick'), open: await page.locator('#settings-dialog').evaluate(dialog => dialog.open) };
    if (during.time !== opened.time || during.tick !== opened.tick || !opened.open || !during.open) throw new Error(`settings did not freeze play: ${JSON.stringify({ before, opened, during })}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const after = { tick: await canvas.getAttribute('data-tick'), focusReturned: await page.getByRole('button', { name: 'Game settings' }).evaluate(element => element === document.activeElement) };
    if (Number(after.tick) <= Number(opened.tick) || !after.focusReturned || errors.length) throw new Error(`settings recovery failed: ${JSON.stringify({ after, errors })}`);
    report.settingsFreeze = { before, opened, during, after, errors };
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const started = Date.now();
    await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Hull depleted' }).waitFor({ timeout: 90_000 });
    const loss = {
      durationSeconds: (Date.now() - started) / 1000,
      status: await page.locator('canvas').getAttribute('data-status'),
      lap: await page.locator('[data-lap]').innerText(),
      score: await page.locator('.result-score').innerText(),
      build: await page.getByLabel('Build code').inputValue(),
      pauseHidden: await page.getByRole('button', { name: 'Pause run' }).isHidden(),
      banner: await page.locator('.demo-banner strong').innerText()
    };
    if (loss.status !== 'lost' || loss.lap !== '1 / 8' || !loss.pauseHidden || !loss.build.startsWith('LLB-')) throw new Error(`loss boundary failed: ${JSON.stringify(loss)}`);
    await page.screenshot({ path: `${out}/normal-speed-loss.png`, fullPage: false });
    await page.getByRole('button', { name: 'Start another run' }).click();
    const restart = {
      status: await page.locator('canvas').getAttribute('data-status'),
      lap: await page.locator('[data-lap]').innerText(),
      time: await page.locator('[data-time]').innerText(),
      score: await page.locator('[data-score]').innerText(),
      hull: await page.locator('[data-hull]').innerText(),
      pauseVisible: await page.getByRole('button', { name: 'Pause run' }).isVisible(),
      terminalHidden: await page.getByRole('heading', { name: 'Hull depleted' }).isHidden()
    };
    if (restart.status !== 'playing' || restart.lap !== '1 / 8' || restart.time !== '60' || restart.score !== '000000' || !restart.pauseVisible || !restart.terminalHidden || errors.length) throw new Error(`restart boundary failed: ${JSON.stringify({ restart, errors })}`);
    report.lossAndRestart = { loss, restart, errors };
    await context.close();
  }

  fs.writeFileSync(`${out}/live-boundaries.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
