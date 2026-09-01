import { buildString, choosePerk, createRun, LAP_SECONDS, PERKS, RunState, STEP, stepRun, TOTAL_LAPS } from './core';

const REAL_KEY = 'last-lap-breakout:v1';
const DEMO_KEY = 'demo:last-lap-breakout:v1';
const SETTINGS_KEY = 'last-lap-breakout:settings:v1';
const DEMO_SETTINGS_KEY = 'demo:last-lap-breakout:settings:v1';

type Settings = { assist: boolean; muted: boolean; shake: boolean };
type MountOptions = { demo?: boolean; preview?: boolean; reset?: boolean };

function settingsStorage(demo: boolean): Storage { return demo ? sessionStorage : localStorage; }

function settingsKey(demo: boolean): string { return demo ? DEMO_SETTINGS_KEY : SETTINGS_KEY; }

function readSettings(demo = false): Settings {
  try { return { assist: false, muted: false, shake: true, ...JSON.parse(settingsStorage(demo).getItem(settingsKey(demo)) || '{}') }; }
  catch { return { assist: false, muted: false, shake: true }; }
}

function saveSettings(settings: Settings, demo = false): void {
  try { settingsStorage(demo).setItem(settingsKey(demo), JSON.stringify(settings)); } catch { /* the game still runs */ }
}

function readRun(key: string, demo: boolean): RunState | null {
  try {
    const raw = (demo ? sessionStorage : localStorage).getItem(key);
    if (!raw) return null;
    const state = JSON.parse(raw) as RunState;
    state.tick ??= 0; state.replay ??= []; state.lastInput ??= 0;
    return state.lap >= 1 && state.lap <= TOTAL_LAPS && Array.isArray(state.bricks) ? state : null;
  } catch { return null; }
}

function saveRun(key: string, state: RunState, demo: boolean): void {
  try { (demo ? sessionStorage : localStorage).setItem(key, JSON.stringify(state)); } catch { /* non-fatal */ }
}

function eraseRun(key: string, demo: boolean): void {
  try { (demo ? sessionStorage : localStorage).removeItem(key); } catch { /* non-fatal */ }
}

export function resetDemo(): void {
  eraseRun(DEMO_KEY, true);
  try { sessionStorage.removeItem(DEMO_SETTINGS_KEY); } catch { /* the game still runs */ }
}

export function mountGame(host: HTMLElement, options: MountOptions = {}): () => void {
  const demo = Boolean(options.demo);
  const preview = Boolean(options.preview);
  const storageKey = demo ? DEMO_KEY : REAL_KEY;
  // The landing preview is stateless: it does not inspect real settings just
  // to animate the board.
  const settings = preview ? { assist: false, muted: false, shake: true } : readSettings(demo);
  if (options.reset) eraseRun(storageKey, demo);
  let state = preview ? createRun(0x8badf00d, false) : readRun(storageKey, demo) || createRun(demo ? 0x1a57d3a0 : Date.now(), settings.assist);
  if (!preview && state.status === 'paused') state.status = 'playing';
  let direction: -1 | 0 | 1 = 0;
  let raf = 0;
  let last = performance.now();
  let accumulator = 0;
  let lastSave = 0;
  let disposed = false;
  let audio: AudioContext | null = null;
  let lastHits = state.hits;
  let overlayKey = '';
  let userActivated = false;
  const testParams = new URLSearchParams(location.search);
  const isLocalTest = ['127.0.0.1', 'localhost'].includes(location.hostname) && testParams.has('test');
  const lossTest = isLocalTest && testParams.get('test') === 'loss';
  const testSpeed = isLocalTest && !lossTest ? 1200 : 1;
  let lossScenarioComplete = false;

  host.innerHTML = `
    <section class="game-shell ${preview ? 'game-preview' : ''}" aria-label="Last Lap Breakout game">
      <div class="game-hud" aria-live="polite">
        <span><b>LAP</b> <strong data-lap>1 / 8</strong></span>
        <span><b>TIME</b> <strong data-time>60</strong></span>
        <span><b>SCORE</b> <strong data-score>000000</strong></span>
        <span><b>HULL</b> <strong data-hull>◆◆◆◆</strong></span>
      </div>
      <div class="canvas-wrap">
        <canvas class="game-canvas" width="960" height="1080" tabindex="0" aria-label="Breakout playfield. Move the paddle with left and right arrow keys or A and D."></canvas>
        <div class="game-overlay" data-overlay hidden></div>
        <p class="canvas-help">Move: ← → or A D <span aria-hidden="true">·</span> Pause: P</p>
      </div>
      ${preview ? '' : `<div class="game-actions"><button class="button button-small" data-pause type="button">Pause run</button><button class="button button-small button-quiet" data-settings type="button">Game settings</button></div>`}
      <div class="touch-controls" aria-label="Touch paddle controls">
        <button type="button" data-move="-1" aria-label="Move paddle left">◀ <span>Left</span></button>
        <button type="button" data-move="1" aria-label="Move paddle right"><span>Right</span> ▶</button>
      </div>
      <p class="sr-only" data-game-status aria-live="assertive"></p>
    </section>`;

  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const shell = host.querySelector<HTMLElement>('.game-shell')!;
  const context = canvas.getContext('2d', { alpha: false })!;
  const overlay = host.querySelector<HTMLElement>('[data-overlay]')!;
  const status = host.querySelector<HTMLElement>('[data-game-status]')!;
  const lapNode = host.querySelector<HTMLElement>('[data-lap]')!;
  const timeNode = host.querySelector<HTMLElement>('[data-time]')!;
  const scoreNode = host.querySelector<HTMLElement>('[data-score]')!;
  const hullNode = host.querySelector<HTMLElement>('[data-hull]')!;
  const pauseButton = host.querySelector<HTMLButtonElement>('[data-pause]');

  function tone(frequency: number, duration = 0.035): void {
    if (settings.muted || preview || !userActivated) return;
    try {
      audio ||= new AudioContext();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'square'; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
    } catch { /* audio is optional */ }
  }

  function syncHud(): void {
    lapNode.textContent = `${state.lap} / ${TOTAL_LAPS}`;
    timeNode.textContent = String(Math.ceil(state.lapTime)).padStart(2, '0');
    scoreNode.textContent = String(state.score).padStart(6, '0');
    hullNode.textContent = `${'◆'.repeat(state.hull)}${'◇'.repeat(Math.max(0, 5 - state.hull))}`;
    timeNode.closest('span')?.classList.toggle('is-urgent', state.lapTime <= 10);
  }

  function perkButton(id: string, index: number): string {
    const perk = PERKS.find(item => item.id === id)!;
    return `<button class="perk-card" type="button" data-perk="${perk.id}"><span class="perk-key">${index + 1}</span><strong>${perk.name}</strong><small>${perk.detail}</small></button>`;
  }

  function showOverlay(): void {
    const nextKey = `${state.status}:${state.lap}:${state.status === 'won' || state.status === 'lost' ? state.score : ''}`;
    if (nextKey === overlayKey) return;
    overlayKey = nextKey;
    if (state.status === 'playing') { overlay.hidden = true; overlay.innerHTML = ''; return; }
    overlay.hidden = false;
    if (state.status === 'draft') {
      overlay.innerHTML = `<div class="overlay-panel"><p class="eyebrow">Lap ${state.lap} clear</p><h2>Choose one modifier</h2><p>Keys 1–3 also choose.</p><div class="perk-grid">${state.draft.map(perkButton).join('')}</div></div>`;
      status.textContent = `Lap ${state.lap} clear. Choose one of three modifiers.`;
    } else if (state.status === 'paused') {
      overlay.innerHTML = `<div class="overlay-panel"><p class="eyebrow">Run paused</p><h2>Your lap is saved</h2><button class="button" type="button" data-resume>Resume run</button></div>`;
      status.textContent = 'Run paused.';
    } else {
      const won = state.status === 'won';
      const share = buildString(state);
      overlay.innerHTML = `<div class="overlay-panel result-panel"><p class="eyebrow">${won ? 'Eight laps complete' : `Run ended on lap ${state.lap}`}</p><h2>${won ? 'Run complete' : 'Hull depleted'}</h2><p class="result-score">${state.score.toLocaleString()} points</p><label for="build-code">Build string</label><input id="build-code" readonly value="${share}" /><div class="result-actions"><button class="button" type="button" data-copy>Copy build string</button><button class="button button-quiet" type="button" data-restart>Start another run</button></div><p data-copy-status aria-live="polite"></p></div>`;
      status.textContent = won ? `Run complete with ${state.score} points.` : `Run ended on lap ${state.lap}.`;
      eraseRun(storageKey, demo);
    }
  }

  function draw(): void {
    const w = canvas.width, h = canvas.height;
    context.fillStyle = '#080a16'; context.fillRect(0, 0, w, h);
    context.fillStyle = '#10152a';
    for (let i = 0; i < 55; i++) {
      const x = ((i * 173 + state.elapsed * (preview ? 8 : 2)) % w);
      const y = (i * 251) % h;
      context.fillRect(x, y, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
    }
    context.strokeStyle = '#293052'; context.lineWidth = 3; context.setLineDash([12, 18]);
    context.beginPath(); context.moveTo(0, h * 0.055); context.lineTo(w, h * 0.055); context.stroke(); context.setLineDash([]);

    for (const brick of state.bricks) {
      const x = brick.x * w, y = brick.y * h, bw = brick.w * w, bh = brick.h * h;
      context.fillStyle = brick.boss ? '#ff5c77' : brick.hp > 1 ? '#ffd166' : (Math.floor(brick.y * 100) % 2 ? '#64f4c2' : '#ff7f6f');
      context.fillRect(x, y, bw, bh);
      context.fillStyle = '#080a16'; context.fillRect(x + 5, y + 5, bw - 10, 4);
      if (brick.boss) {
        context.fillStyle = '#f4f1df'; context.fillRect(x + bw * 0.35, y + bh * 0.35, bw * 0.3, bh * 0.3);
      }
    }
    const paddleWidth = (state.assist ? 0.25 : 0.19) * (state.perks.includes('wide') ? 1.18 : 1);
    const px = (state.paddleX - paddleWidth / 2) * w, py = h * 0.88;
    context.fillStyle = '#293052'; context.fillRect(px - 8, py + 10, paddleWidth * w + 16, 25);
    context.fillStyle = '#64f4c2'; context.fillRect(px, py, paddleWidth * w, 25);
    context.fillStyle = '#f4f1df';
    context.beginPath(); context.arc(state.ball.x * w, state.ball.y * h, state.ball.r * w, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#64f4c2'; context.fillRect(state.ball.x * w - 4, state.ball.y * h - 4, 8, 8);
    if (state.lap === TOTAL_LAPS) {
      context.fillStyle = '#f4f1df'; context.font = 'bold 28px monospace'; context.textAlign = 'center'; context.fillText('FINAL CORE', w / 2, 55);
    }
    canvas.dataset.paddle = state.paddleX.toFixed(3);
  }

  function setPaused(paused: boolean): void {
    if (paused && state.status === 'playing') state.status = 'paused';
    else if (!paused && state.status === 'paused') state.status = 'playing';
    if (pauseButton) pauseButton.textContent = state.status === 'paused' ? 'Resume run' : 'Pause run';
    showOverlay();
    saveRun(storageKey, state, demo);
  }

  function loop(now: number): void {
    if (disposed) return;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (state.status === 'playing') {
      accumulator += delta;
      while (accumulator >= STEP) {
        if (preview) direction = state.ball.x > state.paddleX + 0.015 ? 1 : state.ball.x < state.paddleX - 0.015 ? -1 : 0;
        // This local-only regression route still uses the real fixed-step
        // core. It simply advances it without paddle input.
        const lossMultiplier = lossTest && !lossScenarioComplete ? 120 : 1;
        for (let step = 0; step < lossMultiplier && state.status === 'playing'; step++) stepRun(state, STEP, lossTest ? 0 : direction);
        if (state.hull <= 0) lossScenarioComplete = true;
        if (testSpeed > 1 && state.status === 'playing') state.lapTime = Math.max(0, state.lapTime - (testSpeed - 1) * STEP);
        accumulator -= STEP;
      }
      if (state.hits !== lastHits) {
        tone(180 + (state.hits % 5) * 45);
        if (settings.shake && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          shell.classList.remove('is-shaking');
          requestAnimationFrame(() => shell.classList.add('is-shaking'));
          setTimeout(() => shell.classList.remove('is-shaking'), 130);
        }
        lastHits = state.hits;
      }
      if (!preview && now - lastSave > 1000) { saveRun(storageKey, state, demo); lastSave = now; }
    }
    syncHud(); showOverlay(); draw();
    raf = requestAnimationFrame(loop);
  }

  function onKey(event: KeyboardEvent): void {
    userActivated = true;
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { direction = -1; event.preventDefault(); }
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { direction = 1; event.preventDefault(); }
    if (!preview && event.key.toLowerCase() === 'p') { setPaused(state.status !== 'paused'); event.preventDefault(); }
    if (state.status === 'paused' && (event.key === 'Enter' || event.key === ' ')) setPaused(false);
    if (state.status === 'draft' && ['1', '2', '3'].includes(event.key)) {
      choosePerk(state, state.draft[Number(event.key) - 1]); tone(440, 0.08); showOverlay();
    }
  }
  function onKeyUp(event: KeyboardEvent): void {
    if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) direction = 0;
  }
  function onVisibility(): void { if (document.hidden && state.status === 'playing' && !preview) setPaused(true); }
  function onPointer(event: PointerEvent): void {
    userActivated = true;
    const rect = canvas.getBoundingClientRect();
    state.paddleX = Math.max(0.11, Math.min(0.89, (event.clientX - rect.left) / rect.width));
  }

  host.addEventListener('click', async event => {
    userActivated = true;
    const target = (event.target as HTMLElement).closest<HTMLElement>('button');
    if (!target) return;
    if (target.dataset.pause !== undefined || target.dataset.resume !== undefined) setPaused(state.status !== 'paused');
    if (target.dataset.perk) { choosePerk(state, target.dataset.perk as RunState['draft'][number]); tone(440, 0.08); }
    if (target.dataset.restart !== undefined) {
      state = createRun(demo ? 0x1a57d3a0 : Date.now(), settings.assist); showOverlay(); canvas.focus();
    }
    if (target.dataset.copy !== undefined) {
      try { await navigator.clipboard.writeText(buildString(state)); host.querySelector<HTMLElement>('[data-copy-status]')!.textContent = 'Build string copied.'; }
      catch { host.querySelector<HTMLElement>('[data-copy-status]')!.textContent = 'Copy failed. Select the build string instead.'; }
    }
    if (target.dataset.settings !== undefined) {
      const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog'); dialog?.showModal();
    }
  });

  for (const button of host.querySelectorAll<HTMLButtonElement>('[data-move]')) {
    const value = Number(button.dataset.move) as -1 | 1;
    button.addEventListener('pointerdown', event => { userActivated = true; button.setPointerCapture(event.pointerId); direction = value; });
    button.addEventListener('pointerup', () => { direction = 0; });
    button.addEventListener('pointercancel', () => { direction = 0; });
  }
  canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); onPointer(event); });
  canvas.addEventListener('pointermove', event => { if (canvas.hasPointerCapture(event.pointerId)) onPointer(event); });
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('visibilitychange', onVisibility);
  const onSettings = (event: Event): void => { Object.assign(settings, (event as CustomEvent<Settings>).detail); };
  document.addEventListener('llb-settings', onSettings);
  syncHud(); draw(); raf = requestAnimationFrame(loop);

  return () => {
    disposed = true; cancelAnimationFrame(raf);
    if (!preview && state.status !== 'won' && state.status !== 'lost') saveRun(storageKey, state, demo);
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('llb-settings', onSettings);
    audio?.close();
  };
}

export function wireSettings(dialog: HTMLDialogElement, demo = false): void {
  const settings = readSettings(demo);
  const assist = dialog.querySelector<HTMLInputElement>('[name="assist"]')!;
  const muted = dialog.querySelector<HTMLInputElement>('[name="muted"]')!;
  const shake = dialog.querySelector<HTMLInputElement>('[name="shake"]')!;
  assist.checked = settings.assist; muted.checked = settings.muted; shake.checked = settings.shake;
  dialog.addEventListener('change', () => {
    const next = { assist: assist.checked, muted: muted.checked, shake: shake.checked };
    saveSettings(next, demo);
    document.dispatchEvent(new CustomEvent('llb-settings', { detail: next }));
  });
  dialog.querySelector<HTMLElement>('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

export function hasSavedRun(): boolean { return readRun(REAL_KEY, false) !== null; }
