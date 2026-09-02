import { buildString, choosePerk, createRun, LAP_SECONDS, paddleWidth, PERKS, RunState, STEP, stepRun, TOTAL_LAPS } from './core';

const REAL_KEY = 'last-lap-breakout:v1';
const DEMO_KEY = 'demo:last-lap-breakout:v1';
const SETTINGS_KEY = 'last-lap-breakout:settings:v1';
const DEMO_SETTINGS_KEY = 'demo:last-lap-breakout:settings:v1';
const BEST_RESULT_KEY = 'last-lap-breakout:best:v1';
const AUTOSAVE_INTERVAL_MS = 1000;
// This is a pixel-art game, so a capped backing store preserves the intended
// chunky rendering while avoiding an unnecessary 960 × 1080 repaint on a
// narrow phone. The canvas still tracks the viewport and DPR up to this cap.
const MAX_RENDER_SCALE = 1;

type KeyBindings = { left: string; right: string; pause: string };
type Settings = { assist: boolean; muted: boolean; shake: boolean; keys: KeyBindings };
type BestResult = { score: number; build: string; completed: true };
type MountOptions = { demo?: boolean; preview?: boolean; reset?: boolean };

const DEFAULT_KEYS: KeyBindings = { left: 'ArrowLeft', right: 'ArrowRight', pause: 'p' };
const PERK_IDS = new Set(PERKS.map(perk => perk.id));
const STATUSES = new Set<RunState['status']>(['playing', 'paused', 'draft', 'won', 'lost']);

function settingsStorage(demo: boolean): Storage { return demo ? sessionStorage : localStorage; }

function settingsKey(demo: boolean): string { return demo ? DEMO_SETTINGS_KEY : SETTINGS_KEY; }

function readSettings(demo = false): Settings {
  const fallback = { assist: false, muted: false, shake: true, keys: { ...DEFAULT_KEYS } };
  try {
    const saved = JSON.parse(settingsStorage(demo).getItem(settingsKey(demo)) || '{}') as Partial<Settings>;
    return {
      assist: typeof saved.assist === 'boolean' ? saved.assist : fallback.assist,
      muted: typeof saved.muted === 'boolean' ? saved.muted : fallback.muted,
      shake: typeof saved.shake === 'boolean' ? saved.shake : fallback.shake,
      keys: {
        left: typeof saved.keys?.left === 'string' ? saved.keys.left : fallback.keys.left,
        right: typeof saved.keys?.right === 'string' ? saved.keys.right : fallback.keys.right,
        pause: typeof saved.keys?.pause === 'string' ? saved.keys.pause : fallback.keys.pause
      }
    };
  } catch { return fallback; }
}

function saveSettings(settings: Settings, demo = false): void {
  try { settingsStorage(demo).setItem(settingsKey(demo), JSON.stringify(settings)); } catch { /* the game still runs */ }
}

function isFiniteNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }

function isRunState(value: unknown): value is RunState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  const ball = state.ball as Record<string, unknown> | undefined;
  if (!ball || !Array.isArray(state.bricks) || !Array.isArray(state.perks) || !Array.isArray(state.draft) || !Array.isArray(state.replay)) return false;
  const validBrick = (brick: unknown): boolean => {
    if (!brick || typeof brick !== 'object') return false;
    const item = brick as Record<string, unknown>;
    return ['x', 'y', 'w', 'h', 'hp', 'maxHp'].every(key => isFiniteNumber(item[key])) &&
      (item.boss === undefined || typeof item.boss === 'boolean');
  };
  const validReplay = (entry: unknown): boolean => Array.isArray(entry) && entry.length === 2 &&
    Number.isInteger(entry[0]) && Number(entry[0]) >= 0 && [-1, 0, 1].includes(entry[1] as number);
  return Number.isInteger(state.seed) && Number.isInteger(state.rng) && Number.isInteger(state.lap) && Number(state.lap) >= 1 && Number(state.lap) <= TOTAL_LAPS &&
    isFiniteNumber(state.lapTime) && Number(state.lapTime) >= 0 && Number(state.lapTime) <= LAP_SECONDS &&
    isFiniteNumber(state.elapsed) && Number(state.elapsed) >= 0 && isFiniteNumber(state.score) && Number(state.score) >= 0 &&
    Number.isInteger(state.hull) && Number(state.hull) >= 0 && Number(state.hull) <= 5 && typeof state.status === 'string' && STATUSES.has(state.status as RunState['status']) &&
    isFiniteNumber(state.paddleX) && Number(state.paddleX) >= 0 && Number(state.paddleX) <= 1 &&
    ['x', 'y', 'vx', 'vy', 'r'].every(key => isFiniteNumber(ball[key])) && Number(ball.r) > 0 &&
    state.bricks.every(validBrick) && state.perks.every(id => typeof id === 'string' && PERK_IDS.has(id as RunState['perks'][number])) &&
    state.draft.every(id => typeof id === 'string' && PERK_IDS.has(id as RunState['draft'][number])) &&
    Number.isInteger(state.hits) && Number(state.hits) >= 0 && typeof state.assist === 'boolean' &&
    Number.isInteger(state.tick) && Number(state.tick) >= 0 && state.replay.every(validReplay) && [-1, 0, 1].includes(state.lastInput as number);
}

function readRun(key: string, demo: boolean): RunState | null {
  try {
    const raw = (demo ? sessionStorage : localStorage).getItem(key);
    if (!raw) return null;
    const state = JSON.parse(raw) as Partial<RunState>;
    // These fields were added in v1 and can be reconstructed for complete
    // older records. Every other field must be present before mounting.
    state.tick ??= 0; state.replay ??= []; state.lastInput ??= 0;
    return isRunState(state) ? state : null;
  } catch { return null; }
}

function saveRun(key: string, state: RunState, demo: boolean): void {
  try { (demo ? sessionStorage : localStorage).setItem(key, JSON.stringify(state)); } catch { /* non-fatal */ }
}

function eraseRun(key: string, demo: boolean): void {
  try { (demo ? sessionStorage : localStorage).removeItem(key); } catch { /* non-fatal */ }
}

function readBestResult(): BestResult | null {
  try {
    const value = JSON.parse(localStorage.getItem(BEST_RESULT_KEY) || 'null') as Partial<BestResult> | null;
    return value && value.completed === true && isFiniteNumber(value.score) && value.score >= 0 && typeof value.build === 'string' ? value as BestResult : null;
  } catch { return null; }
}

function saveBestResult(state: RunState): void {
  if (state.status !== 'won') return;
  try {
    const next: BestResult = { score: state.score, build: buildString(state), completed: true };
    const previous = readBestResult();
    if (!previous || next.score >= previous.score) localStorage.setItem(BEST_RESULT_KEY, JSON.stringify(next));
  } catch { /* a full or unavailable store must not prevent the end screen */ }
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
  const settings = preview ? { assist: false, muted: false, shake: true, keys: { ...DEFAULT_KEYS } } : readSettings(demo);
  if (options.reset) eraseRun(storageKey, demo);
  let state = preview ? createRun(0x8badf00d, false) : readRun(storageKey, demo) || createRun(demo ? 0x1a57d3a0 : Date.now(), settings.assist);
  let direction: -1 | 0 | 1 = 0;
  let raf = 0;
  let last = performance.now();
  let accumulator = 0;
  // A restored paused run must remain an exact snapshot until the player
  // chooses Resume. Active runs checkpoint on this same one-second cadence.
  let lastSave = last;
  let disposed = false;
  let audio: AudioContext | null = null;
  let lastHits = state.hits;
  let overlayKey = '';
  let userActivated = false;
  const testParams = new URLSearchParams(location.search);
  const isLocalTest = ['127.0.0.1', 'localhost'].includes(location.hostname) && testParams.has('test');
  const lossTest = isLocalTest && testParams.get('test') === 'loss';
  const hitTest = isLocalTest && testParams.get('test') === 'hit';
  const testSpeed = isLocalTest && !lossTest && !hitTest ? 1200 : 1;
  let lossScenarioComplete = false;

  // This local-only check starts the ordinary fixed-step simulation one
  // frame before a brick collision. It makes the reduced-motion regression
  // test observe a real hit without changing a deployed run.
  if (hitTest) {
    const target = state.bricks[0];
    state.ball = { x: target.x + target.w / 2, y: target.y + target.h + 0.016, vx: 0, vy: -0.4, r: 0.014 };
  }

  host.innerHTML = `
    <section class="game-shell ${preview ? 'game-preview' : ''}" aria-label="Last Lap Breakout game">
      <div class="game-hud" aria-live="polite">
        <span><b>LAP</b> <strong data-lap>1 / 8</strong></span>
        <span><b>TIME</b> <strong data-time>60</strong></span>
        <span><b>SCORE</b> <strong data-score>000000</strong></span>
        <span><b>HULL</b> <strong data-hull>◆◆◆◆</strong></span>
      </div>
      <div class="canvas-wrap">
        <canvas class="game-canvas" width="960" height="1080" tabindex="${preview ? '-1' : '0'}" aria-label="${preview ? 'Sample Breakout board.' : 'Breakout playfield. Move the paddle with left and right arrow keys, A and D, or drag across the playfield.'}"></canvas>
        <div class="game-overlay" data-overlay hidden></div>
        ${preview ? '' : '<p class="canvas-help">Move: ← → or A D <span aria-hidden="true">·</span> Pause: P</p>'}
      </div>
      ${preview ? '' : `<div class="game-actions"><button class="button button-small" data-pause type="button">Pause run</button><button class="button button-small button-quiet" data-settings type="button">Game settings</button></div>`}
      ${preview ? '' : `<div class="touch-controls" aria-label="Touch paddle controls">
        <button type="button" data-move="-1" aria-label="Move paddle left">◀ <span>Left</span></button>
        <button type="button" data-move="1" aria-label="Move paddle right"><span>Right</span> ▶</button>
      </div>`}
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
  const settingsDialog = preview ? null : document.querySelector<HTMLDialogElement>('#settings-dialog');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let resumeAfterSettings = false;
  let hudKey = '';

  function sizeCanvas(): void {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, MAX_RENDER_SCALE);
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    sizeCanvas();
    draw();
  });

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
    const seconds = Math.ceil(state.lapTime);
    const terminal = state.status === 'won' || state.status === 'lost';
    const nextKey = `${state.lap}:${seconds}:${state.score}:${state.hull}:${state.status}`;
    if (nextKey === hudKey) return;
    hudKey = nextKey;
    lapNode.textContent = `${state.lap} / ${TOTAL_LAPS}`;
    timeNode.textContent = String(seconds).padStart(2, '0');
    scoreNode.textContent = String(state.score).padStart(6, '0');
    hullNode.textContent = `${'◆'.repeat(state.hull)}${'◇'.repeat(Math.max(0, 5 - state.hull))}`;
    timeNode.closest('span')?.classList.toggle('is-urgent', seconds <= 10);
    if (pauseButton) {
      pauseButton.hidden = terminal;
      pauseButton.disabled = terminal;
      pauseButton.textContent = state.status === 'paused' ? 'Resume run' : 'Pause run';
    }
  }

  function perkButton(id: string, index: number): string {
    const perk = PERKS.find(item => item.id === id)!;
    return `<button class="perk-card" type="button" data-perk="${perk.id}"><span class="perk-key">${index + 1}</span><strong>${perk.name}</strong><small>${perk.detail}</small></button>`;
  }

  function showOverlay(): void {
    const nextKey = `${state.status}:${state.lap}:${state.status === 'won' || state.status === 'lost' ? state.score : ''}`;
    if (nextKey === overlayKey) return;
    overlayKey = nextKey;
    if (state.status === 'playing') { overlayKey = ''; overlay.hidden = true; overlay.innerHTML = ''; return; }
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
      if (!demo && won) saveBestResult(state);
      const best = !demo ? readBestResult() : null;
      const bestText = best ? `<p class="best-result" data-best-result>Best result saved: ${best.score.toLocaleString()} points</p>` : '';
      overlay.innerHTML = `<div class="overlay-panel result-panel"><p class="eyebrow">${won ? 'Eight laps complete' : `Run ended on lap ${state.lap}`}</p><h2>${won ? 'Run complete' : 'Hull depleted'}</h2><p class="result-score">${state.score.toLocaleString()} points</p>${bestText}<label for="build-code">Build code</label><input id="build-code" readonly value="${share}" /><div class="result-actions"><button class="button" type="button" data-copy>Copy build code</button><button class="button button-quiet" type="button" data-restart>Start another run</button></div><p data-copy-status aria-live="polite"></p></div>`;
      status.textContent = won ? `Run complete with ${state.score} points.` : `Run ended on lap ${state.lap}.`;
      eraseRun(storageKey, demo);
    }
  }

  function draw(): void {
    const w = canvas.width, h = canvas.height;
    context.fillStyle = '#080a16'; context.fillRect(0, 0, w, h);
    context.fillStyle = '#10152a';
    const reduceMotion = motionQuery.matches;
    const starOffset = reduceMotion ? 0 : state.elapsed * (preview ? 8 : 2);
    for (let i = 0; i < 55; i++) {
      const x = ((i * 173 + starOffset) % w);
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
    const width = paddleWidth(state);
    const px = (state.paddleX - width / 2) * w, py = h * 0.88;
    context.fillStyle = '#293052'; context.fillRect(px - 8, py + 10, width * w + 16, 25);
    context.fillStyle = '#64f4c2'; context.fillRect(px, py, width * w, 25);
    context.fillStyle = '#f4f1df';
    context.beginPath(); context.arc(state.ball.x * w, state.ball.y * h, state.ball.r * w, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#64f4c2'; context.fillRect(state.ball.x * w - 4, state.ball.y * h - 4, 8, 8);
    if (state.lap === TOTAL_LAPS) {
      context.fillStyle = '#f4f1df'; context.font = 'bold 28px monospace'; context.textAlign = 'center'; context.fillText('FINAL CORE', w / 2, 55);
    }
    canvas.dataset.paddle = state.paddleX.toFixed(3);
    canvas.dataset.ballX = state.ball.x.toFixed(3);
    canvas.dataset.status = state.status;
    canvas.dataset.tick = String(state.tick);
    canvas.dataset.hits = String(state.hits);
    canvas.dataset.starOffset = starOffset.toFixed(3);
  }

  function setPaused(paused: boolean): void {
    if (state.status !== 'playing' && state.status !== 'paused') return;
    if (paused && state.status === 'playing') state.status = 'paused';
    else if (!paused && state.status === 'paused') state.status = 'playing';
    showOverlay();
    saveRun(storageKey, state, demo);
  }

  function openSettings(): void {
    if (!settingsDialog) return;
    resumeAfterSettings = state.status === 'playing';
    if (resumeAfterSettings) setPaused(true);
    settingsDialog.showModal();
  }

  function onSettingsClose(): void {
    if (resumeAfterSettings && state.status === 'paused') setPaused(false);
    resumeAfterSettings = false;
  }

  function loop(now: number): void {
    raf = 0;
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
        if (settings.shake && !motionQuery.matches) {
          shell.classList.remove('is-shaking');
          requestAnimationFrame(() => shell.classList.add('is-shaking'));
          setTimeout(() => shell.classList.remove('is-shaking'), 130);
          shell.dataset.shakeCount = String(Number(shell.dataset.shakeCount || '0') + 1);
        }
        lastHits = state.hits;
      }
      if (!preview && now - lastSave >= AUTOSAVE_INTERVAL_MS) { saveRun(storageKey, state, demo); lastSave = now; }
    }
    syncHud(); showOverlay(); draw();
    // There is no changing game state after a win or loss. Stopping the
    // animation here prevents a finished unattended run from consuming a
    // phone's frame budget until the player explicitly starts another one.
    if (state.status !== 'won' && state.status !== 'lost') raf = requestAnimationFrame(loop);
  }

  function onKey(event: KeyboardEvent): void {
    userActivated = true;
    const key = event.key.toLowerCase();
    if (event.key === 'ArrowLeft' || key === 'a' || key === settings.keys.left.toLowerCase()) { direction = -1; event.preventDefault(); }
    if (event.key === 'ArrowRight' || key === 'd' || key === settings.keys.right.toLowerCase()) { direction = 1; event.preventDefault(); }
    if (!preview && key === settings.keys.pause.toLowerCase() && (state.status === 'playing' || state.status === 'paused')) { setPaused(state.status !== 'paused'); event.preventDefault(); }
    if (state.status === 'paused' && (event.key === 'Enter' || event.key === ' ')) setPaused(false);
    if (state.status === 'draft' && ['1', '2', '3'].includes(event.key)) {
      choosePerk(state, state.draft[Number(event.key) - 1]); tone(440, 0.08); showOverlay();
    }
  }
  function onKeyUp(event: KeyboardEvent): void {
    if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D', settings.keys.left, settings.keys.right].includes(event.key)) direction = 0;
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
      state = createRun(demo ? 0x1a57d3a0 : Date.now(), settings.assist);
      last = performance.now(); accumulator = 0; lastSave = last; hudKey = '';
      syncHud(); showOverlay(); draw();
      if (!raf) raf = requestAnimationFrame(loop);
      canvas.focus();
    }
    if (target.dataset.copy !== undefined) {
      try { await navigator.clipboard.writeText(buildString(state)); host.querySelector<HTMLElement>('[data-copy-status]')!.textContent = 'Build code copied.'; }
      catch { host.querySelector<HTMLElement>('[data-copy-status]')!.textContent = 'Copy failed. Select the build code instead.'; }
    }
    if (target.dataset.settings !== undefined) openSettings();
  });

  // The landing board is a static sample. A full 960×1080 canvas simulation
  // here consumed main-thread time on phones without helping anyone play.
  sizeCanvas();
  resizeObserver.observe(canvas);

  if (preview) {
    syncHud(); draw();
    return () => { disposed = true; resizeObserver.disconnect(); cancelAnimationFrame(raf); };
  }

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
  settingsDialog?.addEventListener('close', onSettingsClose);
  shell.dataset.shakeCount = '0';
  syncHud(); draw(); raf = requestAnimationFrame(loop);

  return () => {
    disposed = true; resizeObserver.disconnect(); cancelAnimationFrame(raf);
    if (!preview && state.status !== 'won' && state.status !== 'lost') saveRun(storageKey, state, demo);
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('llb-settings', onSettings);
    settingsDialog?.removeEventListener('close', onSettingsClose);
    audio?.close();
  };
}

export function wireSettings(dialog: HTMLDialogElement, demo = false): void {
  const settings = readSettings(demo);
  const assist = dialog.querySelector<HTMLInputElement>('[name="assist"]')!;
  const muted = dialog.querySelector<HTMLInputElement>('[name="muted"]')!;
  const shake = dialog.querySelector<HTMLInputElement>('[name="shake"]')!;
  const left = dialog.querySelector<HTMLSelectElement>('[name="left-key"]')!;
  const right = dialog.querySelector<HTMLSelectElement>('[name="right-key"]')!;
  const pause = dialog.querySelector<HTMLSelectElement>('[name="pause-key"]')!;
  assist.checked = settings.assist; muted.checked = settings.muted; shake.checked = settings.shake;
  left.value = settings.keys.left; right.value = settings.keys.right; pause.value = settings.keys.pause;
  dialog.addEventListener('change', () => {
    const next = { assist: assist.checked, muted: muted.checked, shake: shake.checked, keys: { left: left.value, right: right.value, pause: pause.value } };
    saveSettings(next, demo);
    document.dispatchEvent(new CustomEvent('llb-settings', { detail: next }));
  });
  dialog.querySelector<HTMLElement>('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

export function hasSavedRun(): boolean { return readRun(REAL_KEY, false) !== null; }
