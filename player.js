// Shared player logic for MochiGo Karaoke
(function() {
  const audio = document.getElementById('audio');
  let activeIdx = -1;

  // Render lyrics
  const container = document.getElementById('lyricsContainer');
  LYRICS.forEach((line, i) => {
    const block = document.createElement('div');
    block.className = 'lyric-block';
    let inner = '';
    if (line.es) inner += `<div class="lyric-es">${line.es}</div>`;
    if (line.ro) inner += `<div class="lyric-romaji">${line.ro}</div>`;
    if (line.kj) inner += `<div class="lyric-kanji">${line.kj}</div>`;
    block.innerHTML = inner;
    block.addEventListener('click', () => { audio.currentTime = line.t; });
    container.appendChild(block);
  });

  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('timeTotal').textContent = fmt(audio.duration);
  });

  audio.addEventListener('error', () => {
    document.getElementById('audioError').classList.add('show');
  });

  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    const pct = audio.duration ? (t / audio.duration * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('timeNow').textContent = fmt(t);

    let newActive = -1;
    for (let i = LYRICS.length - 1; i >= 0; i--) {
      if (t >= LYRICS[i].t) { newActive = i; break; }
    }
    if (newActive !== activeIdx) {
      activeIdx = newActive;
      document.querySelectorAll('.lyric-block').forEach((b, i) => {
        b.classList.toggle('active', i === activeIdx);
        b.classList.toggle('past', i < activeIdx);
      });
      if (activeIdx >= 0) {
        document.querySelectorAll('.lyric-block')[activeIdx]
          .scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  audio.addEventListener('ended', () => {
    document.body.classList.remove('is-playing');
    document.getElementById('visualizer').classList.remove('playing');
    document.getElementById('playBtn').textContent = '▶ Play';
  });

  document.getElementById('progressBar').addEventListener('click', e => {
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * (audio.duration || 0);
  });

  const playBtn = document.getElementById('playBtn');
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸ Pausa';
      document.body.classList.add('is-playing');
      document.getElementById('visualizer').classList.add('playing');
    } else {
      audio.pause();
      playBtn.textContent = '▶ Play';
      document.body.classList.remove('is-playing');
      document.getElementById('visualizer').classList.remove('playing');
    }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    audio.pause(); audio.currentTime = 0;
    activeIdx = -1;
    playBtn.textContent = '▶ Play';
    document.body.classList.remove('is-playing');
    document.getElementById('visualizer').classList.remove('playing');
    document.querySelectorAll('.lyric-block').forEach(b => b.classList.remove('active','past'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('vol').addEventListener('input', e => {
    audio.volume = parseFloat(e.target.value);
  });
  audio.volume = 0.8;

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.view;
      document.body.className = document.body.className.replace(/\bview-\S+/g,'').trim();
      if (v !== 'all') document.body.classList.add('view-' + v);
      if (!audio.paused) document.body.classList.add('is-playing');
    });
  });

  // Visualizer
  const vizEl = document.getElementById('visualizer');
  for (let i = 0; i < 48; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const maxH = 8 + Math.sin(i * 0.4) * 22 + Math.random() * 16;
    bar.style.cssText = `--max-h:${maxH}px; --spd:${0.4+Math.random()*0.8}s; --delay:${(i/48)*-1.2}s;`;
    vizEl.appendChild(bar);
  }
})();
