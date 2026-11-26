'use strict';
(() => {
  const STATE_KEY = 'spele15_saved_state_v1';
  SK.applyDark(SK.isDark());

  const GAP = 8;
  let size = 4;
  let board = [];
  let tileElements = new Map();
  let moves = 0;
  let seconds = 0;
  let timerId = null;
  let elapsedMs = 0;
  let lastTick = 0;
  let isPaused = false;
  let isWon = false;
  let backupState = null;
  let snackbarTimeout = null;
  let cellStep = 0;
  let tileSize = 0;

  const movesEl = document.getElementById('moves-val');
  const timerEl = document.getElementById('timer-val');
  const bestChip = document.getElementById('best-chip');
  const bestChipVal = document.getElementById('best-chip-val');
  const gridSlotsEl = document.getElementById('grid-slots');
  const tilesLayerEl = document.getElementById('tiles-layer');
  const pauseBtn = document.getElementById('pause-btn');
  const pauseVeil = document.getElementById('pause-veil');
  const resumeBtn = document.getElementById('resume-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const sizeBtns = document.querySelectorAll('.size-btn');
  const snackbarEl = document.getElementById('snackbar');
  const undoBtn = document.getElementById('undo-btn');
  const winModal = document.getElementById('win-modal');
  const winBadge = document.getElementById('win-badge');
  const winMovesEl = document.getElementById('win-moves');
  const winTimeEl = document.getElementById('win-time');
  const playAgainBtn = document.getElementById('play-again-btn');

  const formatTime = SK.formatTime;
  const srStatusEl = document.getElementById('sr-status');
  const VALID_SIZES = [3, 4, 5];

  function saveGameState() {
    if (isWon || moves === 0) {
      SK.remove(STATE_KEY);
      return;
    }
    SK.setJSON(STATE_KEY, { size, board, moves, seconds });
  }

  function isValidSavedBoard(st) {
    if (!st || !VALID_SIZES.includes(st.size) || !Array.isArray(st.board)) return false;
    const total = st.size * st.size;
    if (st.board.length !== total) return false;
    const seen = new Set(st.board);
    if (seen.size !== total) return false;
    for (let v = 0; v < total; v++) if (!seen.has(v)) return false;
    return isSolvable(st.board, st.size) && !isSolved(st.board);
  }

  function loadGameState() {
    const st = SK.getJSON(STATE_KEY);
    if (!isValidSavedBoard(st)) {
      if (st) SK.remove(STATE_KEY);
      return false;
    }
    size = st.size;
    board = st.board.map(Number);
    moves = Math.max(0, Math.floor(Number(st.moves)) || 0);
    seconds = Math.max(0, Math.floor(Number(st.seconds)) || 0);
    elapsedMs = seconds * 1000;
    isWon = false;
    isPaused = false;
    return true;
  }

  function getBestRecord(n) {
    const rec = SK.getJSON(`spele15_best_${n}`);
    return rec && Number.isFinite(rec.seconds) && Number.isFinite(rec.moves) ? rec : null;
  }

  function saveBestRecord(n, m, s) {
    const prev = getBestRecord(n);
    let isNew = false;
    if (!prev || s < prev.seconds || (s === prev.seconds && m < prev.moves)) {
      isNew = true;
      SK.setJSON(`spele15_best_${n}`, { moves: m, seconds: s });
    }
    updateBestChip();
    return isNew;
  }

  function updateBestChip() {
    const best = getBestRecord(size);
    if (best) {
      bestChip.style.display = 'inline-flex';
      bestChipVal.textContent = `${formatTime(best.seconds)} · ${best.moves}`;
    } else {
      bestChip.style.display = 'none';
    }
  }

  function updateStatsUI() {
    movesEl.textContent = moves;
    timerEl.textContent = formatTime(seconds);
  }

  function tick() {
    const now = performance.now();
    if (!isPaused && !isWon) {
      elapsedMs += now - lastTick;
      const s = Math.floor(elapsedMs / 1000);
      if (s !== seconds) {
        seconds = s;
        timerEl.textContent = formatTime(seconds);
      }
    }
    lastTick = now;
  }

  function startTimer() {
    if (timerId || isWon) return;
    lastTick = performance.now();
    timerId = setInterval(tick, 250);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function setPaused(paused) {
    if (isWon) return;
    tick();
    isPaused = paused;
    pauseVeil.classList.toggle('active', isPaused);
    pauseVeil.setAttribute('aria-hidden', String(!isPaused));
    if (isPaused) {
      saveGameState();
      resumeBtn.focus({ preventScroll: true });
    }
  }

  function isSolvable(arr, n) {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 0) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] === 0) continue;
        if (arr[i] > arr[j]) inversions++;
      }
    }
    if (n % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyIndex = arr.indexOf(0);
      const emptyRowFromBottom = n - Math.floor(emptyIndex / n);
      if (emptyRowFromBottom % 2 === 0) {
        return inversions % 2 === 1;
      } else {
        return inversions % 2 === 0;
      }
    }
  }

  function isSolved(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[arr.length - 1] === 0;
  }

  function generateSolvableBoard(n) {
    const total = n * n;
    const arr = Array.from({ length: total }, (_, i) => (i + 1) % total);
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!isSolvable(arr, n) || isSolved(arr));
    return arr;
  }

  function computeMetrics() {
    const width = tilesLayerEl.clientWidth > 0 ? tilesLayerEl.clientWidth : 290;
    tileSize = (width - GAP * (size - 1)) / size;
    cellStep = tileSize + GAP;
  }

  function applyTileSizes() {
    const fontSize = Math.round(tileSize * (size === 5 ? 0.42 : 0.46));
    tileElements.forEach((tile) => {
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
      tile.style.fontSize = `${fontSize}px`;
    });
  }

  function buildBoardDOM() {
    gridSlotsEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridSlotsEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    gridSlotsEl.innerHTML = '';

    const total = size * size;
    for (let i = 0; i < total; i++) {
      const hole = document.createElement('div');
      hole.className = 'slot-hole';
      gridSlotsEl.appendChild(hole);
    }

    tilesLayerEl.innerHTML = '';
    tileElements.clear();
    computeMetrics();

    for (let val = 1; val < total; val++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (val % 3 === 0) tile.classList.add('alt');

      tile.setAttribute('role', 'button');
      tile.tabIndex = 0;
      tile.setAttribute('aria-label', `Flīze ${val}`);

      const star = document.createElement('span');
      star.className = 'tile-star';
      star.textContent = '★';

      const num = document.createElement('span');
      num.className = 'tile-num';
      num.textContent = val;

      tile.appendChild(star);
      tile.appendChild(num);
      tilesLayerEl.appendChild(tile);
      tileElements.set(val, tile);

      attachTilePointer(tile, val);
    }

    applyTileSizes();
    renderTiles();
  }

  function renderTiles() {
    for (let idx = 0; idx < board.length; idx++) {
      const val = board[idx];
      if (val === 0) continue;
      const tile = tileElements.get(val);
      if (!tile) continue;

      const row = Math.floor(idx / size);
      const col = idx % size;
      const x = col * cellStep;
      const y = row * cellStep;

      tile.classList.remove('dragging');
      tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      tile.classList.toggle('correct', val === idx + 1);
    }
  }

  function getMovableGroup(tileVal) {
    const tileIdx = board.indexOf(tileVal);
    const emptyIdx = board.indexOf(0);
    const tRow = Math.floor(tileIdx / size);
    const tCol = tileIdx % size;
    const eRow = Math.floor(emptyIdx / size);
    const eCol = emptyIdx % size;

    if (tRow !== eRow && tCol !== eCol) return null;

    const indices = [];
    let dirX = 0;
    let dirY = 0;

    if (tRow === eRow) {
      dirX = eCol > tCol ? 1 : -1;
      for (let c = tCol; c !== eCol; c += dirX) {
        indices.push(tRow * size + c);
      }
    } else {
      dirY = eRow > tRow ? 1 : -1;
      for (let r = tRow; r !== eRow; r += dirY) {
        indices.push(r * size + tCol);
      }
    }

    return { indices, emptyIdx, dirX, dirY };
  }

  function executeMove(group) {
    const { indices, emptyIdx } = group;
    let targetIdx = emptyIdx;

    for (let i = indices.length - 1; i >= 0; i--) {
      const fromIdx = indices[i];
      board[targetIdx] = board[fromIdx];
      targetIdx = fromIdx;
    }
    board[targetIdx] = 0;

    moves++;
    if (moves === 1) startTimer();
    updateStatsUI();
    renderTiles();
    saveGameState();

    if (isSolved(board)) {
      handleWin();
    }
  }

  function attachTilePointer(tile, tileVal) {
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (isPaused || isWon) return;
        e.preventDefault();
        const group = getMovableGroup(tileVal);
        if (group) executeMove(group);
      }
    });

    tile.addEventListener('pointerdown', (e) => {
      if (isPaused || isWon) return;
      const group = getMovableGroup(tileVal);
      if (!group) return;

      e.preventDefault();
      try { tile.setPointerCapture(e.pointerId); } catch (err) {}

      const startX = e.clientX;
      const startY = e.clientY;
      let currentOffset = 0;
      let moved = false;

      const groupTiles = group.indices.map((idx) => {
        const val = board[idx];
        const el = tileElements.get(val);
        const r = Math.floor(idx / size);
        const c = idx % size;
        el.classList.add('dragging');
        return { el, baseX: c * cellStep, baseY: r * cellStep };
      });

      const cleanup = () => {
        tile.removeEventListener('pointermove', onPointerMove);
        tile.removeEventListener('pointerup', onPointerUp);
        tile.removeEventListener('pointercancel', onPointerCancel);
        window.removeEventListener('blur', onPointerCancel);
        groupTiles.forEach(({ el }) => el.classList.remove('dragging'));
      };

      const onPointerMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;

        let raw = group.dirX !== 0 ? dx * group.dirX : dy * group.dirY;
        currentOffset = Math.max(0, Math.min(cellStep, raw));

        groupTiles.forEach(({ el, baseX, baseY }) => {
          const nx = baseX + group.dirX * currentOffset;
          const ny = baseY + group.dirY * currentOffset;
          el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
        });
      };

      const onPointerCancel = () => {
        cleanup();
        renderTiles();
      };

      const onPointerUp = () => {
        cleanup();
        if (!moved || currentOffset > cellStep * 0.3) {
          executeMove(group);
        } else {
          renderTiles();
        }
      };

      tile.addEventListener('pointermove', onPointerMove);
      tile.addEventListener('pointerup', onPointerUp);
      tile.addEventListener('pointercancel', onPointerCancel);
      window.addEventListener('blur', onPointerCancel);
    });
  }

  function handleWin() {
    tick();
    isWon = true;
    stopTimer();
    SK.remove(STATE_KEY);
    const isNewBest = saveBestRecord(size, moves, seconds);

    for (let val = 1; val < size * size; val++) {
      const el = tileElements.get(val);
      if (el) {
        setTimeout(() => el.classList.add('win-pop'), val * 30);
      }
    }

    if (!SK.reducedMotion()) launchConfetti();

    setTimeout(() => {
      winBadge.textContent = isNewBest ? `★ Jauns ${size}×${size} rekords!` : '★ Lieliski paveikts!';
      winMovesEl.textContent = moves;
      winTimeEl.textContent = formatTime(seconds);
      winModal.classList.add('open');
      srStatusEl.textContent = `Uzvara! ${moves} gājieni, laiks ${formatTime(seconds)}.`;
      playAgainBtn.focus({ preventScroll: true });
    }, SK.reducedMotion() ? 0 : 750);
  }

  function showUndoSnackbar() {
    snackbarEl.classList.add('show');
    clearTimeout(snackbarTimeout);
    snackbarTimeout = setTimeout(() => {
      snackbarEl.classList.remove('show');
    }, 4200);
  }

  function syncSizeButtons() {
    sizeBtns.forEach((btn) => {
      const bSize = Number(btn.dataset.size);
      const active = bSize === size;
      btn.classList.toggle('active', active);
      btn.textContent = active ? `★ ${bSize}×${bSize}` : `${bSize}×${bSize}`;
    });
  }

  function startNewGame(newSize = size, allowUndo = false) {
    if (allowUndo && moves > 5 && !isWon) {
      backupState = {
        size,
        board: [...board],
        moves,
        seconds
      };
      showUndoSnackbar();
    } else {
      snackbarEl.classList.remove('show');
    }

    stopTimer();
    size = newSize;
    board = generateSolvableBoard(size);
    moves = 0;
    seconds = 0;
    elapsedMs = 0;
    isWon = false;
    isPaused = false;
    pauseVeil.classList.remove('active');
    pauseVeil.setAttribute('aria-hidden', 'true');
    winModal.classList.remove('open');
    SK.remove(STATE_KEY);

    syncSizeButtons();
    updateBestChip();
    updateStatsUI();
    buildBoardDOM();
  }

  undoBtn.addEventListener('click', () => {
    if (!backupState) return;
    stopTimer();
    size = backupState.size;
    board = [...backupState.board];
    moves = backupState.moves;
    seconds = backupState.seconds;
    elapsedMs = seconds * 1000;
    isWon = false;
    isPaused = false;
    backupState = null;
    snackbarEl.classList.remove('show');

    syncSizeButtons();
    updateBestChip();
    updateStatsUI();
    buildBoardDOM();
    saveGameState();
    if (moves > 0) startTimer();
  });

  pauseBtn.addEventListener('click', () => setPaused(!isPaused));
  resumeBtn.addEventListener('click', () => setPaused(false));
  shuffleBtn.addEventListener('click', () => startNewGame(size, true));
  playAgainBtn.addEventListener('click', () => startNewGame(size, false));

  winModal.addEventListener('click', (e) => {
    if (e.target === winModal) {
      winModal.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (winModal.classList.contains('open')) { winModal.classList.remove('open'); return; }
      if (moves > 0 && !isWon) setPaused(!isPaused);
      return;
    }
    if (isPaused || isWon || winModal.classList.contains('open')) return;
    const dirs = { ArrowLeft: [0, 1], ArrowRight: [0, -1], ArrowUp: [1, 0], ArrowDown: [-1, 0] };
    const d = dirs[e.key];
    if (!d) return;
    const emptyIdx = board.indexOf(0);
    const r = Math.floor(emptyIdx / size) + d[0];
    const c = (emptyIdx % size) + d[1];
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    e.preventDefault();
    const group = getMovableGroup(board[r * size + c]);
    if (group) executeMove(group);
  });

  sizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextSize = Number(btn.dataset.size);
      if (nextSize !== size) {
        startNewGame(nextSize, true);
      }
    });
  });

  window.addEventListener('pagehide', saveGameState);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && moves > 0 && !isWon) {
      renderTiles();
      saveGameState();
      setPaused(true);
    }
  });

  const ro = new ResizeObserver(() => {
    if (tileElements.size > 0) {
      computeMetrics();
      applyTileSizes();
      renderTiles();
    }
  });
  ro.observe(tilesLayerEl);

  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD13B', '#34D399', '#5BC0EB', '#FF9F87', '#C4B5FD'];
    const pieces = Array.from({ length: 70 }, () => ({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: -6 - Math.random() * 10,
      w: 8 + Math.random() * 6,
      h: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.25
    }));

    let frames = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rot += p.vrot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1E1B18';
        ctx.lineWidth = 2;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frames++;
      if (frames < 110) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(tick);
  }

  if (loadGameState()) {
    syncSizeButtons();
    updateBestChip();
    updateStatsUI();
    buildBoardDOM();
    if (moves > 0) startTimer();
  } else {
    startNewGame(4, false);
  }
  requestAnimationFrame(() => {
    computeMetrics();
    applyTileSizes();
    renderTiles();
  });
})();
