/* ═══════════════════════════════════════════════════════════════
   utils.js — Música Karaoke App
   Funciones compartidas para todas las páginas
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. FIX DE ORIENTACIÓN ─────────────────────────────────────
   Desbloquea la orientación al cargar y fuerza re-render al rotar. */
document.addEventListener('DOMContentLoaded', () => {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
});

window.addEventListener('orientationchange', () => {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  }, 300);
});

/* ── 2. PÉTALOS ANIMADOS ──────────────────────────────────────── */
const MusicUtils = {

  initPetals(count = 10) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.cssText = [
        `left:${Math.random() * 100}%`,
        `animation-duration:${7 + Math.random() * 10}s`,
        `animation-delay:${Math.random() * 8}s`,
        `width:${5 + Math.random() * 5}px`,
        `height:${5 + Math.random() * 5}px`,
        `opacity:${0.15 + Math.random() * 0.3}`
      ].join(';');
      document.body.appendChild(p);
    }
  },

  /* ── 3. FORMATO DE TIEMPO mm:ss ──────────────────────────── */
  fmt(s) {
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  },

  /* ── 4. VISUALIZADOR DE BARRAS ─────────────────────────────── */
  initVisualizer(containerId, barCount = 28) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.innerHTML = '';
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const maxH = 8 + Math.random() * 38;
      const spd  = 0.4 + Math.random() * 0.8;
      const delay = (i / barCount) * spd * -1;
      bar.style.setProperty('--max-h', maxH + 'px');
      bar.style.setProperty('--spd',   spd + 's');
      bar.style.setProperty('--delay', delay + 's');
      wrap.appendChild(bar);
    }
  },

  /* ── 5. MOTOR DE KARAOKE ─────────────────────────────────────
     MusicUtils.initKaraoke({
       lyrics: LYRICS,
       audioId: 'audio',
       vizId: 'vizV', containerId: 'lyricsV',
       progressBarId: 'pbV', progressFillId: 'pfV',
       timeNowId: 'tnV', timeTotalId: 'ttV',
       playBtnId: 'playV', resetBtnId: 'resetV',
       volId: 'volV', scrollBtnId: 'scrollBtn',
       vizId_L: 'vizL', containerId_L: 'lyricsL',
       progressBarId_L: 'pbL', progressFillId_L: 'pfL',
       timeNowId_L: 'tnL', timeTotalId_L: 'ttL',
       playBtnId_L: 'playL', resetBtnId_L: 'resetL', volId_L: 'volL',
     });
  */
  initKaraoke(cfg) {
    const audio = document.getElementById(cfg.audioId || 'audio');
    if (!audio) return;

    const fmt = this.fmt;
    let activeIdx = -1;
    let autoScroll = true;

    // ── Media Session API ──────────────────────────────────────
    if ('mediaSession' in navigator && typeof CANCIONES !== 'undefined') {
      const match = location.pathname.match(/\/([^/]+)-letras\.html/);
      if (match) {
        const cancion = CANCIONES.find(c => c.id === match[1]);
        if (cancion) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title:  cancion.titulo,
            artist: cancion.artista,
            artwork: [
              { src: cancion.img, sizes: '512x512', type: 'image/png'  },
              { src: cancion.img, sizes: '256x256', type: 'image/png'  },
              { src: cancion.img, sizes: '128x128', type: 'image/jpeg' },
            ]
          });
          navigator.mediaSession.setActionHandler('play',  () => audio.play());
          navigator.mediaSession.setActionHandler('pause', () => audio.pause());
          navigator.mediaSession.setActionHandler('stop',  () => {
            audio.pause();
            audio.currentTime = 0;
          });
        }
      }
    }

    // ── Construir letras en un contenedor ──
    function buildLyrics(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      cfg.lyrics.forEach((line, i) => {
        const b = document.createElement('div');
        b.className = 'lyric-block';
        b.dataset.idx = i;
        let h = '';
        if (line.section) {
          const prev = cfg.lyrics[i - 1];
          if (!prev || prev.section !== line.section) {
            const lbl = document.createElement('div');
            lbl.className = 'section-label';
            lbl.textContent = line.section;
            container.appendChild(lbl);
          }
        }
        if (line.es) h += `<div class="lyric-es">${line.es}</div>`;
        if (line.ro) h += `<div class="lyric-romaji">${line.ro}</div>`;
        if (line.kj) h += `<div class="lyric-kanji">${line.kj}</div>`;
        b.innerHTML = h;
        b.addEventListener('click', () => { audio.currentTime = line.t; });
        container.appendChild(b);
      });
    }

    buildLyrics(cfg.containerId   || 'lyricsV');
    buildLyrics(cfg.containerId_L || 'lyricsL');

    this.initVisualizer(cfg.vizId   || 'vizV');
    this.initVisualizer(cfg.vizId_L || 'vizL');

    const el = id => document.getElementById(id);

    const pfV    = el(cfg.progressFillId   || 'pfV');
    const pfL    = el(cfg.progressFillId_L || 'pfL');
    const tnV    = el(cfg.timeNowId        || 'tnV');
    const tnL    = el(cfg.timeNowId_L      || 'tnL');
    const ttV    = el(cfg.timeTotalId      || 'ttV');
    const ttL    = el(cfg.timeTotalId_L    || 'ttL');
    const pbV    = el(cfg.progressBarId    || 'pbV');
    const pbL    = el(cfg.progressBarId_L  || 'pbL');
    const playV  = el(cfg.playBtnId        || 'playV');
    const playL  = el(cfg.playBtnId_L      || 'playL');
    const resetV = el(cfg.resetBtnId       || 'resetV');
    const resetL = el(cfg.resetBtnId_L     || 'resetL');
    const volV   = el(cfg.volId            || 'volV');
    const volL   = el(cfg.volId_L          || 'volL');
    const scrollBtn = el(cfg.scrollBtnId   || 'scrollBtn');

    const landTitle  = el(cfg.landTitleId  || 'landTitle');
    const landArtist = el(cfg.landArtistId || 'landArtist');
    if (landTitle) {
      const src = document.querySelector('.song-title');
      if (src) landTitle.textContent = src.textContent;
    }
    if (landArtist) {
      const src = document.querySelector('.artist-name');
      if (src) landArtist.textContent = src.textContent;
    }

    function updateProgress() {
      if (!audio.duration) return;
      const p = (audio.currentTime / audio.duration) * 100 + '%';
      const t = fmt(audio.currentTime);
      if (pfV) pfV.style.width = p;
      if (pfL) pfL.style.width = p;
      if (tnV) tnV.textContent = t;
      if (tnL) tnL.textContent = t;
      // Actualizar posición en Media Session
      if ('mediaSession' in navigator && audio.duration) {
        navigator.mediaSession.setPositionState({
          duration:     audio.duration,
          playbackRate: audio.playbackRate,
          position:     audio.currentTime,
        });
      }
    }

    function updateActive() {
      const now = audio.currentTime;
      let idx = -1;
      for (let i = 0; i < cfg.lyrics.length; i++) {
        if (cfg.lyrics[i].t <= now) idx = i; else break;
      }
      if (idx === activeIdx) return;
      activeIdx = idx;

      ['lyricsV', 'lyricsL', cfg.containerId, cfg.containerId_L]
        .filter(Boolean)
        .forEach(cid => {
          const c = document.getElementById(cid);
          if (!c) return;
          c.querySelectorAll('.lyric-block').forEach((b, i) => {
            b.classList.toggle('active', i === idx);
            b.classList.toggle('past',   i < idx);
          });
          if (autoScroll && idx >= 0) {
            const active = c.querySelector('.lyric-block.active');
            if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

      if (scrollBtn) scrollBtn.classList.toggle('active', idx >= 0);
    }

    function setPlayState(playing) {
      const label  = playing ? '⏸ Pausa' : '▶ Play';
      const labelL = playing ? '⏸' : '▶';
      if (playV) playV.textContent = label;
      if (playL) playL.textContent = labelL;
      [cfg.vizId || 'vizV', cfg.vizId_L || 'vizL'].forEach(id => {
        const viz = document.getElementById(id);
        if (viz) viz.classList.toggle('playing', playing);
      });
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      }
    }

    if (playV) playV.addEventListener('click', () => {
      audio.paused ? audio.play() : audio.pause();
    });
    if (playL) playL.addEventListener('click', () => {
      audio.paused ? audio.play() : audio.pause();
    });

    audio.addEventListener('play',  () => setPlayState(true));
    audio.addEventListener('pause', () => setPlayState(false));
    audio.addEventListener('ended', () => setPlayState(false));

    function doReset() {
      audio.pause();
      audio.currentTime = 0;
      setPlayState(false);
      updateProgress();
    }
    if (resetV) resetV.addEventListener('click', doReset);
    if (resetL) resetL.addEventListener('click', doReset);

    if (volV) {
      audio.volume = parseFloat(volV.value);
      volV.addEventListener('input', () => {
        audio.volume = parseFloat(volV.value);
        if (volL) volL.value = volV.value;
      });
    }
    if (volL) {
      volL.addEventListener('input', () => {
        audio.volume = parseFloat(volL.value);
        if (volV) volV.value = volL.value;
      });
    }

    function seekClick(e, bar) {
      if (!audio.duration) return;
      const r = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    }
    if (pbV) pbV.addEventListener('click', e => seekClick(e, pbV));
    if (pbL) pbL.addEventListener('click', e => seekClick(e, pbL));

    audio.addEventListener('loadedmetadata', () => {
      const d = fmt(audio.duration);
      if (ttV) ttV.textContent = d;
      if (ttL) ttL.textContent = d;
    });
    audio.addEventListener('timeupdate', () => {
      updateProgress();
      updateActive();
    });

    const views = ['all', 'es', 'romaji', 'kanji'];
    function applyView(view) {
      views.forEach(v => document.body.classList.remove('view-' + v));
      if (view !== 'all') document.body.classList.add('view-' + view);
      document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
      });
      document.querySelectorAll('.land-toggle').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
      });
    }
    document.querySelectorAll('.toggle-btn, .land-toggle').forEach(btn => {
      btn.addEventListener('click', () => applyView(btn.dataset.view));
    });

    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        autoScroll = !autoScroll;
        scrollBtn.style.opacity = autoScroll ? '1' : '0.4';
        if (autoScroll && activeIdx >= 0) {
          const active = document.querySelector('#' + (cfg.containerId || 'lyricsV') + ' .lyric-block.active');
          if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }
};

/* ── Auto-init pétalos ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('has-petals')) {
    MusicUtils.initPetals();
  }
});

/* ═══════════════════════════════════════════════════════════════
   AUTO-NAVEGACIÓN
   · [id].html        → debajo de .main-wrap (afterend)
   · [id]-letras.html → barra fija inferior portrait + landscape
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof CANCIONES === 'undefined') return;

  const path = location.pathname;

  const letrasMatch = path.match(/\/([^/]+)-letras\.html/);
  const coverMatch  = path.match(/\/([^/]+)\.html/);

  const isLetras  = !!letrasMatch;
  const currentId = isLetras
    ? letrasMatch[1]
    : (coverMatch ? coverMatch[1] : null);

  if (!currentId) return;

  const idx = CANCIONES.findIndex(c => c.id === currentId);
  if (idx === -1) return;

  const prev = idx > 0                    ? CANCIONES[idx - 1] : null;
  const next = idx < CANCIONES.length - 1 ? CANCIONES[idx + 1] : null;

  if (!document.getElementById('nav-styles')) {
    const style = document.createElement('style');
    style.id = 'nav-styles';
    style.textContent = `
      /* ── Portrait: barra fija inferior ── */
      .portrait-nav-row {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        display: flex;
        justify-content: space-between;
        gap: 0.6rem;
        padding: 0.6rem 1rem;
        z-index: 150;
        background: rgba(5,8,16,0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-top: 1px solid rgba(255,255,255,0.07);
      }
      @media (orientation: landscape) and (max-height: 600px) {
        .portrait-nav-row { display: none !important; }
      }
      .portrait-nav-btn {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 12px;
        padding: 0.45rem 0.75rem;
        flex: 1;
        min-width: 0;
        max-width: 48%;
        transition: background 0.2s, border-color 0.2s;
      }
      .portrait-nav-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
      .portrait-nav-next { justify-content: flex-end; text-align: right; }
      .portrait-nav-img { width: 34px; height: 34px; border-radius: 7px; object-fit: cover; flex-shrink: 0; }
      .portrait-nav-fallback { width: 34px; height: 34px; border-radius: 7px; background: rgba(255,255,255,0.06); display: none; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
      .portrait-nav-label { display: flex; flex-direction: column; min-width: 0; }
      .portrait-nav-dir  { font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.4; color: inherit; }
      .portrait-nav-name { font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; }
      .portrait-nav-arrow { font-size: 0.95rem; opacity: 0.45; flex-shrink: 0; }
      .scroll-btn { bottom: 5rem !important; }

      /* ── Cover ([id].html): debajo del main-wrap ── */
      .cover-nav-row {
        display: flex;
        justify-content: space-between;
        gap: 0.6rem;
        padding: 0.5rem 1.2rem 2rem;
        max-width: 500px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
      }
      @media (min-width: 768px) {
        .cover-nav-row { max-width: 860px; padding: 0.5rem 2rem 2rem; }
      }
      .cover-nav-btn {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 0.6rem 0.9rem;
        flex: 1;
        min-width: 0;
        transition: background 0.2s, border-color 0.2s, transform 0.2s;
      }
      .cover-nav-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
      .cover-nav-next { justify-content: flex-end; text-align: right; }
      .cover-nav-img { width: 42px; height: 42px; border-radius: 9px; object-fit: cover; flex-shrink: 0; }
      .cover-nav-fallback { width: 42px; height: 42px; border-radius: 9px; background: rgba(255,255,255,0.06); display: none; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
      .cover-nav-label { display: flex; flex-direction: column; min-width: 0; }
      .cover-nav-dir   { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.45; color: inherit; }
      .cover-nav-name  { font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; }
      .cover-nav-arrow { font-size: 1.1rem; opacity: 0.5; flex-shrink: 0; }

      /* ── Landscape ── */
      .land-nav-row {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin-top: auto;
        padding-top: 0.3rem;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .land-nav-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 8px;
        padding: 0.25rem 0.45rem;
        transition: background 0.2s;
        min-width: 0;
        overflow: hidden;
      }
      .land-nav-btn:hover { background: rgba(255,255,255,0.08); }
      .land-nav-arrow { font-size: 0.65rem; opacity: 0.5; flex-shrink: 0; }
      .land-nav-img { width: 22px; height: 22px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
      .land-nav-fallback { width: 22px; height: 22px; border-radius: 4px; background: rgba(255,255,255,0.06); display: none; align-items: center; justify-content: center; font-size: 0.65rem; flex-shrink: 0; }
      .land-nav-label { display: flex; flex-direction: column; min-width: 0; }
      .land-nav-dir   { font-size: 0.48rem; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.4; }
      .land-nav-name  { font-size: 0.58rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    `;
    document.head.appendChild(style);
  }

  function makeBtn(cancion, dir, variant) {
    const isPrev = dir === 'prev';
    const prefix = variant === 'land' ? 'land-nav' : `${variant}-nav`;
    const href   = isLetras ? `${cancion.id}-letras.html` : `${cancion.id}.html`;

    const a = document.createElement('a');
    a.className = `${prefix}-btn ${prefix}-${dir}`;
    a.href = href;

    const arrow = document.createElement('div');
    arrow.className = `${prefix}-arrow`;
    arrow.textContent = isPrev ? '←' : '→';

    const img = document.createElement('img');
    img.className = `${prefix}-img`;
    img.src = cancion.img;
    img.alt = '';

    const fallback = document.createElement('div');
    fallback.className = `${prefix}-fallback`;
    fallback.textContent = '♪';
    img.onerror = () => {
      img.style.display = 'none';
      fallback.style.display = 'flex';
    };

    const label = document.createElement('div');
    label.className = `${prefix}-label`;

    const dirSpan = document.createElement('span');
    dirSpan.className = `${prefix}-dir`;
    dirSpan.textContent = isPrev ? 'Anterior' : 'Siguiente';

    const nameSpan = document.createElement('span');
    nameSpan.className = `${prefix}-name`;
    nameSpan.textContent = cancion.titulo;

    label.appendChild(dirSpan);
    label.appendChild(nameSpan);

    if (isPrev) {
      a.appendChild(arrow);
      a.appendChild(img);
      a.appendChild(fallback);
      a.appendChild(label);
    } else {
      a.appendChild(label);
      a.appendChild(img);
      a.appendChild(fallback);
      a.appendChild(arrow);
    }

    return a;
  }

  /* ── 1. Landscape ── */
  let navRow = document.querySelector('.land-nav-row');
  if (!navRow && isLetras) {
    const landLeft = document.querySelector('.land-left');
    if (landLeft) {
      navRow = document.createElement('div');
      navRow.className = 'land-nav-row';
      landLeft.appendChild(navRow);
    }
  }
  if (navRow) {
    navRow.innerHTML = '';
    if (prev) navRow.appendChild(makeBtn(prev, 'prev', 'land'));
    if (next) navRow.appendChild(makeBtn(next, 'next', 'land'));
  }

  /* ── 2. Portrait letras: barra fija inferior ── */
  if (isLetras) {
    const row = document.createElement('div');
    row.className = 'portrait-nav-row';
    if (prev) row.appendChild(makeBtn(prev, 'prev', 'portrait'));
    if (next) row.appendChild(makeBtn(next, 'next', 'portrait'));
    document.body.appendChild(row);
  }

  /* ── 3. Cover: inyectar DESPUÉS de .main-wrap ── */
  if (!isLetras) {
    const mainWrap = document.querySelector('.main-wrap');
    if (mainWrap) {
      const row = document.createElement('div');
      row.className = 'cover-nav-row';
      if (prev) row.appendChild(makeBtn(prev, 'prev', 'cover'));
      if (next) row.appendChild(makeBtn(next, 'next', 'cover'));
      mainWrap.insertAdjacentElement('afterend', row);
    }
  }
});
