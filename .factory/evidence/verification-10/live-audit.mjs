import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const BASE = 'https://last-lap-breakout.sociobot.in';
const OUT = '.factory/evidence/verification-10';
const report = { base: BASE, startedAt: new Date().toISOString() };

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function visibleText(page, selector) {
  return (await page.locator(selector).innerText()).trim();
}

async function routeAudit(browser, viewport, label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: label === 'mobile' ? 2 : 1,
    isMobile: label === 'mobile',
    hasTouch: label === 'mobile'
  });
  const page = await context.newPage();
  const routes = ['/', '/demo', '/play', '/privacy', '/terms', '/definitely-missing-verification-10'];
  const results = [];
  for (const route of routes) {
    const consoleErrors = [];
    const pageErrors = [];
    const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
    const onPageError = error => pageErrors.push(error.message);
    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(120);
    const structure = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      h1: document.querySelector('h1')?.textContent?.trim(),
      mainCount: document.querySelectorAll('main').length,
      missingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      description: document.querySelector('meta[name="description"]')?.content,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content
    }));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const severe = axe.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''));
    const targets = await page.locator('a:visible, button:visible, input:visible, select:visible').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();
      return { text: node.getAttribute('aria-label') || node.textContent?.trim() || node.tagName, width: box.width, height: box.height };
    }));
    const undersized = targets.filter(target => target.width < 44 || target.height < 44);
    const expectedStatus = route.startsWith('/definitely-') ? 404 : 200;
    check(response?.status() === expectedStatus, `${label} ${route}: HTTP ${response?.status()} not ${expectedStatus}`);
    check(structure.lang === 'en', `${label} ${route}: missing lang`);
    check(structure.h1Count === 1 && structure.mainCount === 1, `${label} ${route}: landmark or h1 count`);
    check(structure.missingAlt === 0, `${label} ${route}: missing image alt`);
    check(!structure.overflow, `${label} ${route}: horizontal overflow`);
    check(severe.length === 0, `${label} ${route}: severe Axe finding`);
    check(undersized.length === 0, `${label} ${route}: undersized visible target ${JSON.stringify(undersized)}`);
    check(pageErrors.length === 0, `${label} ${route}: page error ${pageErrors.join('; ')}`);
    const unexpectedConsole = route.startsWith('/definitely-')
      ? consoleErrors.filter(text => !/404|failed to load resource/i.test(text))
      : consoleErrors;
    check(unexpectedConsole.length === 0, `${label} ${route}: console error ${unexpectedConsole.join('; ')}`);
    results.push({ route, status: response?.status(), structure, seriousCriticalAxe: severe.length, undersizedTargets: undersized, consoleErrors, pageErrors });
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
  await context.close();
  return results;
}

async function firstScreen(browser, viewport, label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: label === 'mobile' ? 2 : 1,
    isMobile: label === 'mobile',
    hasTouch: label === 'mobile'
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  check(await page.evaluate(() => scrollY) === 0, `${label}: page was scrolled`);
  const h1 = await visibleText(page, 'h1');
  const audience = await visibleText(page, '.hero-intro');
  const action = await visibleText(page, '.hero-actions .button');
  const helper = await visibleText(page, '.hero-actions span');
  const facts = await page.locator('.plain-facts li').allInnerTexts();
  const board = await page.locator('#preview-game canvas').boundingBox();
  const actionBox = await page.locator('.hero-actions .button').boundingBox();
  check(h1 === 'Finish a Breakout run in eight minutes', `${label}: job headline changed`);
  check(audience.startsWith('For short breaks:'), `${label}: audience missing`);
  check(action === 'Try it with sample data', `${label}: sample action missing`);
  check(helper === 'A sample run starts immediately.', `${label}: action outcome missing`);
  check(board && board.y + board.height <= viewport.height, `${label}: board is not on first screen`);
  check(actionBox && actionBox.y + actionBox.height <= viewport.height, `${label}: sample action is not on first screen`);
  await page.screenshot({ path: `${OUT}/first-screen-${label}.png`, fullPage: false });
  const result = { h1, audience, action, helper, facts, board, actionBox, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) };
  await context.close();
  return result;
}

async function demoSandbox(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const realSettings = JSON.stringify({ assist: true, muted: true, shake: false, keys: { left: 'h', right: 'k', pause: 'Escape' } });
  await page.evaluate(value => localStorage.setItem('last-lap-breakout:settings:v1', value), realSettings);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  check(page.url() === `${BASE}/?demo=1`, `demo entered at unexpected URL ${page.url()}`);
  check(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'demo label missing');
  const initialTime = Number(await page.locator('[data-time]').innerText());
  await page.waitForTimeout(1300);
  const laterTime = Number(await page.locator('[data-time]').innerText());
  check(laterTime < initialTime, 'sample game did not enter active play');
  await page.screenshot({ path: `${OUT}/demo-mobile-active.png`, fullPage: false });

  await page.getByRole('button', { name: 'Game settings' }).click();
  await page.getByLabel('Mute sound').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await page.waitForTimeout(1100);
  const duringDemo = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  check(duringDemo.local['last-lap-breakout:settings:v1'] === realSettings, 'demo changed real settings');
  check(Object.keys(duringDemo.local).length === 1, `demo wrote real keys ${Object.keys(duringDemo.local).join(',')}`);
  check(Object.keys(duringDemo.session).every(key => key.startsWith('demo:')), 'demo wrote a non-demo session key');
  check(duringDemo.session['demo:last-lap-breakout:v1'], 'demo run was not saved');
  check(duringDemo.session['demo:last-lap-breakout:settings:v1'], 'demo settings were not saved');

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForTimeout(1150);
  const afterReset = await page.evaluate(() => ({
    settings: sessionStorage.getItem('demo:last-lap-breakout:settings:v1'),
    run: JSON.parse(sessionStorage.getItem('demo:last-lap-breakout:v1') || '{}'),
    realSettings: localStorage.getItem('last-lap-breakout:settings:v1')
  }));
  check(afterReset.settings === null, 'reset did not clear demo settings');
  check(afterReset.run.seed === 0x1a57d3a0 && afterReset.run.lap === 1, 'reset did not restore sample seed and lap');
  check(afterReset.realSettings === realSettings, 'reset changed real settings');
  check(await page.getByText('Demo — sample data, nothing is saved').isVisible(), 'demo label did not persist after reset');

  await page.getByRole('link', { name: 'Start for real' }).click();
  check(page.url() === `${BASE}/play`, 'Start for real did not open /play');
  const afterReal = await page.evaluate(() => ({
    demoRun: sessionStorage.getItem('demo:last-lap-breakout:v1'),
    demoSettings: sessionStorage.getItem('demo:last-lap-breakout:settings:v1'),
    realSettings: localStorage.getItem('last-lap-breakout:settings:v1')
  }));
  check(afterReal.demoRun === null && afterReal.demoSettings === null, 'Start for real retained demo keys');
  check(afterReal.realSettings === realSettings, 'Start for real changed pre-existing real settings');
  check(new Set(requests.map(url => new URL(url).origin)).size === 1 && new URL(requests[0]).origin === BASE, 'demo made a cross-origin request');
  check(pageErrors.length === 0 && consoleErrors.length === 0, 'demo produced browser errors');
  const result = { initialTime, laterTime, duringDemo, afterReset, afterReal, requestOrigins: [...new Set(requests.map(url => new URL(url).origin))], requestCount: requests.length, consoleErrors, pageErrors };
  await context.close();
  return result;
}

async function inputRecoveryAndFocus(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('last-lap-breakout:v1', JSON.stringify({ lap: 1, bricks: [] })));
  await page.goto(`${BASE}/play`, { waitUntil: 'networkidle' });
  check(await page.locator('[data-lap]').innerText() === '1 / 8', 'invalid save did not recover to lap 1');
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  check(firstFocus.href === '#main', 'skip link was not first keyboard target');
  const canvas = page.locator('canvas');
  await canvas.focus();
  const focusStyle = await canvas.evaluate(element => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
  });
  check(focusStyle.width === '3px' && focusStyle.style === 'solid', 'canvas focus ring is not 3px solid');
  const before = Number(await canvas.getAttribute('data-paddle'));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(180);
  await page.keyboard.up('ArrowRight');
  const afterRight = Number(await canvas.getAttribute('data-paddle'));
  check(afterRight > before, 'keyboard did not move paddle');
  await page.keyboard.press('p');
  check(await page.getByRole('heading', { name: 'Your lap is saved' }).isVisible(), 'P did not pause');
  const pausedTick = await canvas.getAttribute('data-tick');
  await page.waitForTimeout(300);
  check(await canvas.getAttribute('data-tick') === pausedTick, 'paused simulation continued');
  await page.keyboard.press('p');
  check(!(await page.getByRole('heading', { name: 'Your lap is saved' }).isVisible()), 'P did not resume');

  const settingsButton = page.getByRole('button', { name: 'Game settings' });
  await settingsButton.focus();
  await page.keyboard.press('Enter');
  check(await page.locator('#settings-dialog').evaluate(dialog => dialog.open), 'settings did not open by keyboard');
  const dialogFocus = await page.evaluate(() => document.activeElement?.getAttribute('name'));
  check(dialogFocus === 'assist', `dialog focus started on ${dialogFocus}`);
  await page.keyboard.press('Escape');
  check(!(await page.locator('#settings-dialog').evaluate(dialog => dialog.open)), 'Escape did not close settings');
  check(await settingsButton.evaluate(element => element === document.activeElement), 'focus did not return to settings button');

  await page.goto(`${BASE}/privacy`);
  await page.getByRole('link', { name: 'Last Lap Breakout home' }).click();
  check(await page.locator('h1').evaluate(element => element === document.activeElement), 'SPA route did not focus h1');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.goBack();
  check(await page.title() === 'Last Lap Breakout — finish eight arcade laps', 'Back did not restore route title');
  check(await page.locator('h1').evaluate(element => element === document.activeElement), 'Back did not focus restored h1');
  check(errors.length === 0, `input/recovery page errors: ${errors.join('; ')}`);
  const result = { invalidSaveRecovered: true, firstFocus, focusStyle, paddle: { before, afterRight }, pausedTick, dialogFocus, focusReturned: true, historyRestored: true, errors };
  await context.close();
  return result;
}

async function touchAndScale(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(`${BASE}/play`, { waitUntil: 'networkidle' });
  const canvas = page.locator('canvas');
  const start = Number(await canvas.getAttribute('data-paddle'));
  const right = page.getByRole('button', { name: 'Move paddle right' });
  await right.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: 1 });
  await page.waitForTimeout(180);
  await right.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: 0 });
  const afterTouch = Number(await canvas.getAttribute('data-paddle'));
  check(afterTouch > start, 'touch control did not move paddle');
  const box = await canvas.boundingBox();
  const y = box.y + box.height * 0.75;
  await page.mouse.move(box.x + box.width * 0.25, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, y, { steps: 8 });
  await page.mouse.up();
  const afterDrag = Number(await canvas.getAttribute('data-paddle'));
  check(afterDrag >= 0.74, 'canvas drag did not move paddle');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
  const scaleState = await page.evaluate(() => ({ scale: visualViewport?.scale, h1: !!document.querySelector('h1'), canvas: !!document.querySelector('canvas'), pause: !!document.querySelector('[data-pause]'), settings: !!document.querySelector('[data-settings]') }));
  check(scaleState.scale === 2 && scaleState.h1 && scaleState.canvas && scaleState.pause && scaleState.settings, '200% page scale lost game controls');
  await page.screenshot({ path: `${OUT}/mobile-200-percent.png`, fullPage: false });
  const result = { start, afterTouch, afterDrag, scaleState };
  await context.close();
  return result;
}

async function reducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' });
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    canvas.dataset.auditSteer = 'on';
    const steer = () => {
      if (canvas.dataset.auditSteer !== 'on') return;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: rect.left + Number(canvas.dataset.ballX || 0.5) * rect.width, clientY: rect.top + rect.height * 0.5 }));
      requestAnimationFrame(steer);
    };
    steer();
  });
  await page.waitForFunction(() => Number(document.querySelector('canvas')?.dataset.hits || 0) > 0, null, { timeout: 20_000 });
  const state = await page.evaluate(async () => {
    const values = [];
    for (let index = 0; index < 30; index += 1) {
      values.push(document.querySelector('canvas')?.dataset.starOffset);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    const button = document.querySelector('.button');
    return {
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transitionSeconds: Number.parseFloat(getComputedStyle(button).transitionDuration),
      starOffsets: [...new Set(values)],
      hits: Number(document.querySelector('canvas')?.dataset.hits),
      shakeCount: Number(document.querySelector('.game-shell')?.dataset.shakeCount || 0),
      shaking: document.querySelector('.game-shell')?.classList.contains('is-shaking')
    };
  });
  check(state.media && state.transitionSeconds <= 0.00001, 'reduced UI motion did not apply');
  check(JSON.stringify(state.starOffsets) === JSON.stringify(['0.000']), 'stars moved under reduced motion');
  check(state.hits > 0 && state.shakeCount === 0 && !state.shaking, 'a real hit shook the reduced-motion game');
  await canvas.evaluate(element => { element.dataset.auditSteer = 'off'; });
  await page.mouse.up();
  await context.close();
  return state;
}

async function offlineAndUpdate(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await page.reload({ waitUntil: 'networkidle' });
  const online = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return { active: registration.active?.state, waiting: registration.waiting?.state || null, installing: registration.installing?.state || null, caches: await caches.keys() };
  });
  check(online.active === 'activated' && !online.waiting && !online.installing, 'service worker update is not settled');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const offline = { title: await page.title(), h1: await visibleText(page, 'h1'), canvas: await page.locator('canvas').count(), url: page.url() };
  check(offline.title === 'Demo — Last Lap Breakout' && offline.h1 === 'Play an eight-lap Breakout run' && offline.canvas === 1, 'offline reload did not restore demo');
  await context.close();
  return { online, offline };
}

async function liveFrameRate(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await navigator.serviceWorker.ready;
    await Promise.all([...document.images].map(image => image.complete ? Promise.resolve() : image.decode()));
    await new Promise(resolve => requestIdleCallback(resolve, { timeout: 2000 }));
  });
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.88);
  await page.mouse.down();
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    canvas.dataset.auditSteer = 'on';
    const steer = () => {
      if (canvas.dataset.auditSteer !== 'on') return;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: rect.left + Number(canvas.dataset.ballX || 0.5) * rect.width, clientY: rect.top + rect.height * 0.88 }));
      requestAnimationFrame(steer);
    };
    steer();
  });
  const times = await page.evaluate(() => new Promise(resolve => {
    const values = [];
    const sample = time => {
      values.push(time);
      if (values.length === 1081) resolve(values);
      else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  const intervals = times.slice(181).map((time, index) => time - times[180 + index]).sort((a, b) => a - b);
  const percentile = fraction => intervals[Math.ceil(intervals.length * fraction) - 1];
  const result = { samples: intervals.length, median: percentile(0.5), p90: percentile(0.9), p95: percentile(0.95), max: intervals.at(-1), over34: intervals.filter(value => value > 34).length, status: await canvas.getAttribute('data-status') };
  check(result.samples === 900 && result.median >= 14 && result.median <= 18 && result.p90 <= 34 && result.status === 'playing', `live frame claim failed ${JSON.stringify(result)}`);
  await canvas.evaluate(element => { element.dataset.auditSteer = 'off'; });
  await page.mouse.up();
  await context.close();
  return result;
}

async function normalSpeedWin(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  check(page.url() === `${BASE}/?demo=1` && !page.url().includes('test='), 'normal run used a test flag');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    canvas.dataset.auditSteer = 'on';
    const steer = () => {
      if (canvas.dataset.auditSteer !== 'on') return;
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: rect.left + Number(canvas.dataset.ballX || 0.5) * rect.width, clientY: rect.top + rect.height * 0.5 }));
      requestAnimationFrame(steer);
    };
    steer();
  });
  const started = Date.now();
  const timeline = [];
  let chosen = 0;
  let lastMark = '';
  while (Date.now() - started < 560_000) {
    const state = await page.evaluate(() => ({
      status: document.querySelector('canvas')?.dataset.status,
      lap: document.querySelector('[data-lap]')?.textContent,
      time: document.querySelector('[data-time]')?.textContent,
      score: document.querySelector('[data-score]')?.textContent,
      hull: document.querySelector('[data-hull]')?.textContent,
      heading: document.querySelector('.game-overlay h2')?.textContent || null
    }));
    if (state.status === 'draft') {
      await page.keyboard.press('1');
      chosen += 1;
      timeline.push({ elapsedSeconds: Math.round((Date.now() - started) / 1000), event: `modifier ${chosen}`, state });
      console.log(`LIVE RUN modifier ${chosen} after ${state.lap}`);
      await page.waitForTimeout(300);
      continue;
    }
    if (state.status === 'won' || state.status === 'lost') {
      timeline.push({ elapsedSeconds: Math.round((Date.now() - started) / 1000), event: state.status, state });
      break;
    }
    const mark = `${state.lap}:${Math.ceil(Number(state.time) / 15)}`;
    if (mark !== lastMark) {
      lastMark = mark;
      console.log(`LIVE RUN ${state.lap} time ${state.time} score ${state.score} hull ${state.hull}`);
    }
    await page.waitForTimeout(500);
  }
  const finalState = await page.evaluate(() => ({
    status: document.querySelector('canvas')?.dataset.status,
    lap: document.querySelector('[data-lap]')?.textContent,
    time: document.querySelector('[data-time]')?.textContent,
    score: document.querySelector('.result-score')?.textContent,
    heading: document.querySelector('.game-overlay h2')?.textContent,
    build: document.querySelector('#build-code')?.value,
    banner: document.querySelector('.demo-banner strong')?.textContent
  }));
  const durationSeconds = (Date.now() - started) / 1000;
  check(finalState.status === 'won' && finalState.heading === 'Run complete', `normal run did not win: ${JSON.stringify(finalState)}`);
  check(finalState.lap === '8 / 8' && chosen === 7, `normal run did not cover eight laps and seven choices: ${chosen}`);
  check(durationSeconds >= 475, `normal run was faster than eight normal laps: ${durationSeconds}`);
  check(finalState.build?.startsWith('LLB-'), 'normal run has no build code');
  check(finalState.banner === 'Demo — sample data, nothing is saved', 'demo label missing at result');
  check(new Set(requests.map(url => new URL(url).origin)).size === 1 && new URL(requests[0]).origin === BASE, 'normal run made a cross-origin request');
  check(consoleErrors.length === 0 && pageErrors.length === 0, `normal run browser errors: ${consoleErrors.join('; ')} ${pageErrors.join('; ')}`);
  await page.screenshot({ path: `${OUT}/normal-speed-win.png`, fullPage: false });
  await canvas.evaluate(element => { element.dataset.auditSteer = 'off'; });
  await page.mouse.up();
  const result = { durationSeconds, choices: chosen, timeline, finalState, requestOrigins: [...new Set(requests.map(url => new URL(url).origin))], requestCount: requests.length, consoleErrors, pageErrors };
  await context.close();
  return result;
}

const browser = await chromium.launch();
try {
  report.firstScreenDesktop = await firstScreen(browser, { width: 1440, height: 900 }, 'desktop');
  report.firstScreenMobile = await firstScreen(browser, { width: 390, height: 844 }, 'mobile');
  report.routesDesktop = await routeAudit(browser, { width: 1366, height: 900 }, 'desktop');
  report.routesMobile = await routeAudit(browser, { width: 390, height: 844 }, 'mobile');
  report.demoSandbox = await demoSandbox(browser);
  report.inputRecoveryAndFocus = await inputRecoveryAndFocus(browser);
  report.touchAndScale = await touchAndScale(browser);
  report.reducedMotion = await reducedMotion(browser);
  report.offlineAndUpdate = await offlineAndUpdate(browser);
  report.liveFrameRate = await liveFrameRate(browser);
  fs.writeFileSync(`${OUT}/live-audit-partial.json`, JSON.stringify(report, null, 2));
  report.normalSpeedWin = await normalSpeedWin(browser);
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(`${OUT}/live-audit.json`, JSON.stringify(report, null, 2));
  console.log('LIVE AUDIT PASS');
  console.log(JSON.stringify({ frameRate: report.liveFrameRate, normalSpeedWin: report.normalSpeedWin.finalState, durationSeconds: report.normalSpeedWin.durationSeconds }, null, 2));
} catch (error) {
  report.error = error instanceof Error ? { message: error.message, stack: error.stack } : String(error);
  fs.writeFileSync(`${OUT}/live-audit-failure.json`, JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
