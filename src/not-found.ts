import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `<header class="site-header">
  <a class="wordmark" href="/" aria-label="Last Lap Breakout home"><span class="wordmark-orb" aria-hidden="true"></span><span>LAST LAP<br>BREAKOUT</span></a>
  <nav aria-label="Main navigation"><a href="/demo">Demo</a><a href="/#how">How it works</a><a href="/privacy">Privacy</a></nav>
</header><main id="main" class="not-found"><div class="lost-orb" aria-hidden="true"><span></span></div><p class="eyebrow">Error 404</p><h1 tabindex="-1">This lap does not exist</h1><p>The address is not part of the eight-lap route.</p><a class="button" href="/">Return to the game</a></main><footer class="site-footer"><p>Eight fixed Breakout laps for a short break.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></div><p>Original generated scene · v1.0.0</p></footer>`;
