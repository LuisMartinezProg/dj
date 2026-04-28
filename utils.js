/* ═══════════════════════════════════════════════════════════════
   utils.js — Música Karaoke App
   Funciones compartidas para todas las páginas
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. FIX DE ORIENTACIÓN ─────────────────────────────────────
   Fuerza re-render al rotar el dispositivo para que el layout
   landscape/portrait se aplique correctamente sin recargar. */
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
    document.body.style.display = 'none';
    document.body.offsetHeight; // fuerza reflow
    document.body.style.display = '';
  }, 300);
});

/* ── 2. PÉTALOS ANIMADOS ────────────────────────────────────────
   Agrega pétalos decorativos al body.
   Solo se activan si la página tiene la clase "has-petals" en <body>,
   o si llamas MusicUtils.initPetals() manualmente. */
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

  /* ── 4. VISUALIZADOR DE BARRAS ───────────────────────────────
     Recibe el ID del contenedor y genera las barras animadas.
     Llama a MusicUtils.initVisualizer('vizV') en cada página. */
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
     Inicializa toda la lógica de una página de letras.

     Uso en cada -letras.html:
       MusicUtils.initKaraoke({
         lyrics: LYRICS,           // array de líneas
         audioId: 'audio',         // id del <audio>
         // IDs de elementos verticales (modo portrait)
         containerId: 'lyricsV',
         progressBarId: 'pbV',
         progressFillId: 'pfV',
         timeNowId: 'tnV',
         timeTotalId: 'ttV',
         playBtnId: 'playV',
         resetBtnId: 'resetV',
         volId: 'volV',
         vizId: 'vizV',
         // IDs de elementos landscape
         containerId_L: 'lyricsL',
         progressBarId_L: 'pbL',
         progressFillId_L: 'pfL',
         timeNowId_L: 'tnL',
         timeTotalId_L: 'ttL',
         playBtnId_L: 'playL',
         resetBtnId_L: 'resetL',
         volId_L: 'volL',
         vizId_L: 'vizL',
         scrollBtnId: 'scrollBtn',
       });
  */
  initKaraoke(cfg) {
    const audio = document.getElementById(cfg.audioId || 'audio');
    if (!audio) return;

    const fmt = this.fmt;
    let activeIdx = -1;
    let autoScroll = true;

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
          // Insertar section-label antes del primer bloque de esa sección
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

    buildLyrics(cfg.containerId    || 'lyricsV');
    buildLyrics(cfg.containerId_L  || 'lyricsL');

    // ── Visualizadores ──
    this.initVisualizer(cfg.vizId   || 'vizV');
    this.initVisualizer(cfg.vizId_L || 'vizL');

    // ── Helpers de DOM ──
    const el = id => document.getElementById(id);

    const pfV  = el(cfg.progressFillId   || 'pfV');
    const pfL  = el(cfg.progressFillId_L || 'pfL');
    const tnV  = el(cfg.timeNowId        || 'tnV');
    const tnL  = el(cfg.timeNowId_L      || 'tnL');
    const ttV  = el(cfg.timeTotalId      || 'ttV');
    const ttL  = el(cfg.timeTotalId_L    || 'ttL');
    const pbV  = el(cfg.progressBarId    || 'pbV');
    const pbL  = el(cfg.progressBarId_L  || 'pbL');
    const playV  = el(cfg.playBtnId      || 'playV');
    const playL  = el(cfg.playBtnId_L    || 'playL');
    const resetV = el(cfg.resetBtnId     || 'resetV');
    const resetL = el(cfg.resetBtnId_L   || 'resetL');
    const volV   = el(cfg.volId          || 'volV');
    const volL   = el(cfg.volId_L        || 'volL');
    const scrollBtn = el(cfg.scrollBtnId || 'scrollBtn');

    // ── Actualizar progreso ──
    function updateProgress() {
      if (!audio.duration) return;
      const p = (audio.currentTime / audio.duration) * 100 + '%';
      const t = fmt(audio.currentTime);
      if (pfV)  pfV.style.width  = p;
      if (pfL)  pfL.style.width  = p;
      if (tnV)  tnV.textContent  = t;
      if (tnL)  tnL.textContent  = t;
    }

    // ── Actualizar línea activa ──
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

    // ── Play / Pause ──
    function setPlayState(playing) {
      const label = playing ? '⏸ Pausa' : '▶ Play';
      const labelL = playing ? '⏸' : '▶';
      if (playV) playV.textContent = label;
      if (playL) playL.textContent = labelL;

      // Visualizador
      [cfg.vizId || 'vizV', cfg.vizId_L || 'vizL'].forEach(id => {
        const viz = document.getElementById(id);
        if (viz) viz.classList.toggle('playing', playing);
      });
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

    // ── Reset ──
    function doReset() {
      audio.pause();
      audio.currentTime = 0;
      setPlayState(false);
      updateProgress();
    }
    if (resetV) resetV.addEventListener('click', doReset);
    if (resetL) resetL.addEventListener('click', doReset);

    // ── Volumen ──
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

    // ── Progress bar click ──
    function seekClick(e, bar) {
      if (!audio.duration) return;
      const r = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    }
    if (pbV) pbV.addEventListener('click', e => seekClick(e, pbV));
    if (pbL) pbL.addEventListener('click', e => seekClick(e, pbL));

    // ── Time update ──
    audio.addEventListener('loadedmetadata', () => {
      const d = fmt(audio.duration);
      if (ttV) ttV.textContent = d;
      if (ttL) ttL.textContent = d;
    });
    audio.addEventListener('timeupdate', () => {
      updateProgress();
      updateActive();
    });

    // ── View toggles (Todo / ES / Romaji / JP) ──
    const views = ['all', 'es', 'romaji', 'kanji'];
    function applyView(view) {
      views.forEach(v => document.body.classList.remove('view-' + v));
      if (view !== 'all') document.body.classList.add('view-' + view);
      // Portrait
      document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
      });
      // Landscape
      document.querySelectorAll('.land-toggle').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
      });
    }
    document.querySelectorAll('.toggle-btn, .land-toggle').forEach(btn => {
      btn.addEventListener('click', () => applyView(btn.dataset.view));
    });

    // ── Scroll button ──
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

/* ── Auto-init pétalos si el body tiene clase "has-petals" ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('has-petals')) {
    MusicUtils.initPetals();
  }
});
