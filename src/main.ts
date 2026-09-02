import './style.css';
import { hasSavedRun, mountGame, resetDemo, wireSettings } from './game/runtime';

const app = document.querySelector<HTMLDivElement>('#app')!;
let disposeGame: (() => void) | undefined;

const routeData: Record<string, { title: string; description: string }> = {
  '/': { title: 'Last Lap Breakout — finish eight arcade laps', description: 'Play eight fixed Breakout laps, choose modifiers after the first seven, and finish with a build code.' },
  '/play': { title: 'Play — Last Lap Breakout', description: 'Play a complete eight-lap Breakout run and finish with a build code.' },
  '/demo': { title: 'Demo — Last Lap Breakout', description: 'Try a sample Last Lap Breakout run without saving real progress.' },
  '/privacy': { title: 'Privacy — Last Lap Breakout', description: 'How Last Lap Breakout stores game progress on your device.' },
  '/terms': { title: 'Terms — Last Lap Breakout', description: 'Terms for playing Last Lap Breakout.' },
  '/404': { title: 'Page not found — Last Lap Breakout', description: 'The requested Last Lap Breakout page was not found.' }
};

function header(): string {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Last Lap Breakout home"><span class="wordmark-orb" aria-hidden="true"></span><span>LAST LAP<br>BREAKOUT</span></a>
    <nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#how">How it works</a><a href="/privacy" data-link>Privacy</a></nav>
  </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
    <p>Eight fixed Breakout laps for a short break.</p>
    <div><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></div>
    <p>Original generated scene · v1.0.0</p>
  </footer>`;
}

function settingsDialog(): string {
  return `<dialog id="settings-dialog" aria-labelledby="settings-title">
    <form method="dialog" class="settings-panel">
      <p class="eyebrow">Game settings</p><h2 id="settings-title">Change how the run feels</h2>
      <label class="switch-row"><span><strong>Assist mode</strong><small>Wider paddle, slower orb, and one more hull point. Starts next run.</small></span><input type="checkbox" name="assist" /></label>
      <label class="switch-row"><span><strong>Mute sound</strong></span><input type="checkbox" name="muted" /></label>
      <label class="switch-row"><span><strong>Screen movement</strong></span><input type="checkbox" name="shake" /></label>
      <fieldset class="key-bindings"><legend>Keyboard mapping</legend>
        <p>Choose extra keys for movement and pause. Arrow keys and A/D remain available.</p>
        <label>Left movement <select name="left-key"><option value="ArrowLeft">Left Arrow</option><option value="j">J</option><option value="h">H</option></select></label>
        <label>Right movement <select name="right-key"><option value="ArrowRight">Right Arrow</option><option value="l">L</option><option value="k">K</option></select></label>
        <label>Pause run <select name="pause-key"><option value="p">P</option><option value="Escape">Escape</option></select></label>
      </fieldset>
      <button class="button" type="button" data-close>Save settings</button>
    </form>
  </dialog>`;
}

function homePage(): string {
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">One run · Eight laps</p>
        <h1 tabindex="-1">Finish a Breakout run in eight minutes</h1>
        <p class="hero-intro">For short breaks: clear eight fixed laps, choose modifiers after the first seven, and finish with a build code.</p>
        <div class="hero-actions">
          <a class="button" href="/demo" data-link>Try it with sample data</a>
          <span>A sample run starts immediately.</span>
        </div>
        <a class="text-action" href="/play" data-link>${hasSavedRun() ? 'Resume your saved run' : 'Start a new run'}</a>
        <ul class="plain-facts" aria-label="Game facts">
          <li><strong>8 × 60 seconds</strong><span>Then the run ends.</span></li>
          <li><strong>Free. No account.</strong><span>No purchases or ads.</span></li>
          <li><strong>Keyboard and touch.</strong><span>Assist mode included.</span></li>
        </ul>
      </div>
      <div class="hero-stage">
        <picture class="hero-art" aria-hidden="true"><source srcset="/assets/orbital-breakout.avif" type="image/avif"><img src="/assets/orbital-breakout.webp" width="960" height="640" alt="" fetchpriority="high"></picture>
        <div id="preview-game"></div>
        <p class="preview-label"><span aria-hidden="true"></span> Sample board</p>
      </div>
    </section>

    <section class="run-strip" aria-label="Run structure"><span class="current">01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span class="boss">08 CORE</span></section>

    <section class="how-section" id="how">
      <div><p class="eyebrow">How it works</p><h2>Every run reaches a clear ending</h2></div>
      <ol class="steps">
        <li><span>01</span><div><h3>Keep the orb alive</h3><p>Move the paddle. Break formations for 60 seconds. A miss costs one hull point.</p></div></li>
        <li><span>02</span><div><h3>Choose one modifier</h3><p>After each of the first seven laps, choose one of three modifiers. Your choices form the build code.</p></div></li>
        <li><span>03</span><div><h3>Face the final core</h3><p>Lap eight has a guarded core. Survive it to get your score and build code.</p></div></li>
      </ol>
    </section>

    <section class="limits-section">
      <div><p class="eyebrow">A finite game</p><h2>What this game does not do</h2></div>
      <p>Your run and settings stay in this browser. The game reloads offline after your first visit.</p>
      <a class="button" href="/play" data-link>Start a new run</a>
    </section>
  </main>${footer()}${settingsDialog()}`;
}

function gamePage(demo: boolean): string {
  return `${demo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button type="button" data-reset-demo>Reset demo</button><a href="/play" data-real data-link>Start for real</a></div></aside>` : ''}
    ${header()}<main id="main" class="play-main">
      <section class="play-heading"><div><p class="eyebrow">${demo ? 'Sample run' : 'Your local run'}</p><h1 tabindex="-1">Play an eight-lap Breakout run</h1></div><p>Move the paddle, protect your hull, and choose a modifier after the first seven laps.</p></section>
      <div class="game-layout"><div id="game-root"></div><aside class="run-guide"><p class="eyebrow">Run route</p><ol>${Array.from({ length: 8 }, (_, i) => `<li${i === 7 ? ' class="boss"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${i === 7 ? 'Final core' : '60-second lap'}</li>`).join('')}</ol><p>Progress saves after each second. Refresh to return to the same lap.</p></aside></div>
    </main>${footer()}${settingsDialog()}`;
}

function privacyPage(): string {
  return `${header()}<main id="main" class="text-page"><p class="eyebrow">Privacy</p><h1 tabindex="-1">Your game stays in this browser</h1><p>Last Lap Breakout has no account and sends no personal data.</p><h2>What this browser stores</h2><p>A real run stores its current state, settings, and highest completed score in local storage. Demo runs and settings use separate session storage keys.</p><h2>What leaves your device</h2><p>The static site makes no analytics or advertising requests. Your browser only requests game files from this site.</p><h2>Delete your data</h2><p>Clear this site's browser storage to remove every saved run, setting, and best result.</p><p>Effective: September 1, 2026.</p></main>${footer()}`;
}

function termsPage(): string {
  return `${header()}<main id="main" class="text-page"><p class="eyebrow">Terms</p><h1 tabindex="-1">Play for free</h1><p>Last Lap Breakout is a free browser game for personal use.</p><h2>Fair use</h2><p>Do not interfere with the site or use it to harm another person.</p><h2>No purchases</h2><p>The game has no purchases.</p><h2>Availability</h2><p>The game is provided as available.</p><p>Effective: September 1, 2026.</p></main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="not-found"><div class="lost-orb" aria-hidden="true"><span></span></div><p class="eyebrow">Error 404</p><h1 tabindex="-1">This lap does not exist</h1><p>The address is not part of the eight-lap route.</p><a class="button" href="/" data-link>Return to the game</a></main>${footer()}`;
}

function currentPath(): string {
  const path = location.pathname.replace(/\/$/, '') || '/';
  return routeData[path] ? path : '/404';
}

function render(announce = false): void {
  disposeGame?.(); disposeGame = undefined;
  const path = currentPath();
  const data = routeData[path];
  document.title = data.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = data.description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://last-lap-breakout.sociobot.in${path === '/' ? '/' : path}`;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = data.title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = data.description;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = data.title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = data.description;
  app.innerHTML = path === '/' ? homePage() : path === '/play' ? gamePage(false) : path === '/demo' ? gamePage(true) : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : notFoundPage();

  if (path === '/') disposeGame = mountGame(document.querySelector<HTMLElement>('#preview-game')!, { preview: true });
  if (path === '/play' || path === '/demo') {
    disposeGame = mountGame(document.querySelector<HTMLElement>('#game-root')!, { demo: path === '/demo' });
    const dialog = document.querySelector<HTMLDialogElement>('#settings-dialog'); if (dialog) wireSettings(dialog, path === '/demo');
    const discardDemo = () => { disposeGame?.(); disposeGame = undefined; resetDemo(); };
    document.querySelector('[data-reset-demo]')?.addEventListener('click', () => { discardDemo(); render(); });
    document.querySelector('[data-real]')?.addEventListener('click', discardDemo);
  }
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach(link => link.addEventListener('click', navigate));
  if (announce) {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const h1 = document.querySelector<HTMLHeadingElement>('h1'); h1?.focus();
    const live = document.querySelector<HTMLElement>('#route-live'); if (live) live.textContent = data.title;
  }
}

function navigate(event: MouseEvent): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.currentTarget as HTMLAnchorElement;
  if (link.origin !== location.origin || link.hash) return;
  const keepTestMode = ['127.0.0.1', 'localhost'].includes(location.hostname) && new URLSearchParams(location.search).has('test');
  const search = keepTestMode && !link.search && (link.pathname === '/demo' || link.pathname === '/play') ? location.search : link.search;
  event.preventDefault(); history.pushState({}, '', link.pathname + search); render(true);
}

window.addEventListener('popstate', () => render(true));
app.insertAdjacentHTML('beforebegin', '<div id="route-live" class="sr-only" aria-live="polite"></div>');
render();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
