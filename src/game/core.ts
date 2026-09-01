export const LAP_SECONDS = 60;
export const TOTAL_LAPS = 8;
export const STEP = 1 / 60;

export type RunStatus = 'playing' | 'paused' | 'draft' | 'won' | 'lost';
export type Brick = { x: number; y: number; w: number; h: number; hp: number; maxHp: number; boss?: boolean };
export type PerkId = 'wide' | 'quick' | 'heavy' | 'split' | 'guard' | 'magnet' | 'pierce' | 'bonus' | 'steady';
export type Perk = { id: PerkId; name: string; detail: string; code: string };

export const PERKS: Perk[] = [
  { id: 'wide', name: 'Wide line', detail: 'Paddle grows 18%.', code: 'W' },
  { id: 'quick', name: 'Quick return', detail: 'Paddle moves 16% faster.', code: 'Q' },
  { id: 'heavy', name: 'Heavy orb', detail: 'Hits score 40% more.', code: 'H' },
  { id: 'split', name: 'Echo orb', detail: 'Every fifth hit scores twice.', code: 'E' },
  { id: 'guard', name: 'Hull patch', detail: 'Restore one hull point.', code: 'G' },
  { id: 'magnet', name: 'Soft catch', detail: 'Paddle angles are easier.', code: 'M' },
  { id: 'pierce', name: 'Core drill', detail: 'Boss hits deal two damage.', code: 'D' },
  { id: 'bonus', name: 'Gold circuit', detail: 'Lap clears add 300 points.', code: 'B' },
  { id: 'steady', name: 'Cool drive', detail: 'Orb speed rises less each lap.', code: 'C' }
];

export type RunState = {
  seed: number;
  rng: number;
  lap: number;
  lapTime: number;
  elapsed: number;
  score: number;
  hull: number;
  status: RunStatus;
  paddleX: number;
  ball: { x: number; y: number; vx: number; vy: number; r: number };
  bricks: Brick[];
  perks: PerkId[];
  draft: PerkId[];
  hits: number;
  assist: boolean;
  tick: number;
  replay: Array<[number, -1 | 0 | 1]>;
  lastInput: -1 | 0 | 1;
};

function nextRandom(state: RunState): number {
  let x = state.rng | 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  state.rng = x >>> 0;
  return state.rng / 4294967296;
}

export function makeBricks(lap: number): Brick[] {
  const bricks: Brick[] = [];
  if (lap === TOTAL_LAPS) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      bricks.push({ x: 0.5 + Math.cos(angle) * 0.28 - 0.04, y: 0.31 + Math.sin(angle) * 0.16, w: 0.08, h: 0.045, hp: 2, maxHp: 2 });
    }
    bricks.push({ x: 0.41, y: 0.24, w: 0.18, h: 0.13, hp: 12, maxHp: 12, boss: true });
    return bricks;
  }
  const rows = Math.min(3 + Math.floor(lap / 2), 6);
  const cols = 8;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((row + col + lap) % 7 === 0) continue;
      const armored = lap > 3 && (row * cols + col + lap) % 5 === 0;
      bricks.push({ x: 0.07 + col * 0.11, y: 0.12 + row * 0.065, w: 0.09, h: 0.042, hp: armored ? 2 : 1, maxHp: armored ? 2 : 1 });
    }
  }
  return bricks;
}

export function createRun(seed = 0x1a2b3c4d, assist = false): RunState {
  const state: RunState = {
    seed: seed >>> 0, rng: seed >>> 0, lap: 1, lapTime: LAP_SECONDS, elapsed: 0,
    score: 0, hull: assist ? 5 : 4, status: 'playing', paddleX: 0.5,
    ball: { x: 0.5, y: 0.68, vx: 0.28, vy: -0.38, r: 0.014 },
    bricks: makeBricks(1), perks: [], draft: [], hits: 0, assist,
    tick: 0, replay: [], lastInput: 0
  };
  return state;
}

export function draftOptions(state: RunState): PerkId[] {
  const pool = PERKS.map(p => p.id).filter(id => !state.perks.includes(id));
  const choices: PerkId[] = [];
  while (choices.length < 3 && pool.length) {
    choices.push(pool.splice(Math.floor(nextRandom(state) * pool.length), 1)[0]);
  }
  while (choices.length < 3) choices.push(PERKS[Math.floor(nextRandom(state) * PERKS.length)].id);
  return choices;
}

function resetBall(state: RunState): void {
  state.ball.x = state.paddleX;
  state.ball.y = 0.76;
  const speed = (state.assist ? 0.39 : 0.44) + state.lap * (state.perks.includes('steady') ? 0.012 : 0.02);
  state.ball.vx = (nextRandom(state) > 0.5 ? 1 : -1) * speed * 0.55;
  state.ball.vy = -speed;
}

function finishLap(state: RunState): void {
  state.score += 500 + (state.perks.includes('bonus') ? 300 : 0);
  if (state.lap >= TOTAL_LAPS) {
    state.status = 'won';
  } else {
    state.status = 'draft';
    state.draft = draftOptions(state);
  }
}

export function choosePerk(state: RunState, id: PerkId): void {
  if (state.status !== 'draft' || !state.draft.includes(id)) return;
  state.perks.push(id);
  if (id === 'guard') state.hull = Math.min(5, state.hull + 1);
  state.lap += 1;
  state.lapTime = LAP_SECONDS;
  state.bricks = makeBricks(state.lap);
  state.status = 'playing';
  state.draft = [];
  resetBall(state);
}

export function stepRun(state: RunState, dt: number, direction: -1 | 0 | 1): void {
  if (state.status !== 'playing') return;
  if (direction !== state.lastInput) {
    state.replay.push([state.tick, direction]);
    state.lastInput = direction;
  }
  state.tick += 1;
  const paddleSpeed = (state.assist ? 0.7 : 0.62) * (state.perks.includes('quick') ? 1.16 : 1);
  state.paddleX = Math.max(0.11, Math.min(0.89, state.paddleX + direction * paddleSpeed * dt));
  state.elapsed += dt;
  state.lapTime = Math.max(0, state.lapTime - dt);
  if (state.lapTime <= 0) { finishLap(state); return; }

  const b = state.ball;
  b.x += b.vx * dt; b.y += b.vy * dt;
  if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
  if (b.x + b.r > 1) { b.x = 1 - b.r; b.vx = -Math.abs(b.vx); }
  if (b.y - b.r < 0.06) { b.y = 0.06 + b.r; b.vy = Math.abs(b.vy); }

  const paddleWidth = (state.assist ? 0.25 : 0.19) * (state.perks.includes('wide') ? 1.18 : 1);
  if (b.vy > 0 && b.y + b.r >= 0.88 && b.y < 0.94 && Math.abs(b.x - state.paddleX) <= paddleWidth / 2 + b.r) {
    b.y = 0.88 - b.r;
    const angle = (b.x - state.paddleX) / (paddleWidth / 2);
    const easyAngle = state.perks.includes('magnet') ? angle * 0.7 : angle;
    b.vx = Math.max(-0.58, Math.min(0.58, easyAngle * 0.52));
    b.vy = -Math.abs(b.vy);
  }

  for (let i = state.bricks.length - 1; i >= 0; i--) {
    const brick = state.bricks[i];
    if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w && b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
      brick.hp -= brick.boss && state.perks.includes('pierce') ? 2 : 1;
      state.hits += 1;
      state.score += Math.round((brick.boss ? 80 : 35) * (state.perks.includes('heavy') ? 1.4 : 1));
      if (state.perks.includes('split') && state.hits % 5 === 0) state.score += 35;
      b.vy *= -1;
      if (brick.hp <= 0) state.bricks.splice(i, 1);
      break;
    }
  }

  if (b.y - b.r > 1) {
    state.hull -= 1;
    if (state.hull <= 0) state.status = 'lost'; else resetBall(state);
  }

  if (!state.bricks.length && state.lap < TOTAL_LAPS) {
    state.score += 200;
    state.bricks = makeBricks(state.lap);
    resetBall(state);
  }
  if (state.lap === TOTAL_LAPS && !state.bricks.length) {
    state.score += 1000;
    state.bricks = makeBricks(state.lap);
    resetBall(state);
  }
}

export function runHash(state: Pick<RunState, 'seed' | 'perks' | 'score' | 'lap' | 'replay'>): string {
  const text = `${state.seed}|${state.perks.join(',')}|${state.score}|${state.lap}|${state.replay.map(entry => entry.join(':')).join(',')}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0');
}

export function buildString(state: RunState): string {
  const codes = state.perks.map(id => PERKS.find(p => p.id === id)?.code).join('') || 'BASE';
  return `LLB-${state.seed.toString(36).toUpperCase()}-${codes}-${runHash(state)}`;
}
