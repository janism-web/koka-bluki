'use strict';
(() => {
const GRID_SIZE = 8;
const FINGER_OFFSET_Y = 76;
const TAP_THRESHOLD_PX = 14;
const TAP_THRESHOLD_MS = 280;
const MAGNETIC_SNAP_RATIO = 0.44;
const STORAGE_BEST_KEY = "koka_bloki_best";
const STORAGE_STATE_KEY = "koka_bloki_saved_state_v6";
const STORAGE_THEME_KEY = "koka_bloki_theme_v1";

const THEMES = [
  {
    id: "oak",
    name: "Klasiskais ozols",
    shortName: "Ozols",
    unlockScore: 0,
    themeColor: "#7b4a26",
    bgRadial: "radial-gradient(circle at 50% 25%, #c9884c 0%, #874f26 65%, #562f12 100%)",
    grainColor: "rgba(45, 22, 6, 0.045)",
    surfaceRecessed: "rgba(46, 22, 6, 0.78)",
    surfaceRecessedBorder: "rgba(235, 186, 122, 0.36)",
    surfaceElevated: "rgba(62, 31, 10, 0.72)",
    surfaceElevatedBorder: "rgba(235, 186, 122, 0.34)",
    accentPrimary: "#ffd859",
    accentContrast: "#3b1c04",
    modalSurface: "#693b18",
    modalSurfaceAlt: "#4d290f",
    boardFrame: "#48240b",
    boardBorder: "#d99e62",
    dockFrame: "rgba(52, 25, 7, 0.65)",
    dockSlot: "rgba(32, 14, 3, 0.55)",
    cellEven: "#381b07",
    cellOdd: "#321706",
    blockTop: "#f5cf6b",
    blockMid: "#e2ae44",
    blockBot: "#c48826",
    blockBevel: "rgba(255, 248, 210, 0.75)",
    blockGrain: "rgba(130, 74, 14, 0.14)",
    blockBorder: "#5c330d",
    particles: ["#ffe47a", "#f2b84b", "#d98b2b", "#fff5c0"]
  },
  {
    id: "walnut",
    name: "Tumšais riekstkoks",
    shortName: "Riekstkoks",
    unlockScore: 800,
    themeColor: "#4a2716",
    bgRadial: "radial-gradient(circle at 50% 25%, #8c4f32 0%, #592e1a 65%, #36190c 100%)",
    grainColor: "rgba(25, 10, 4, 0.06)",
    surfaceRecessed: "rgba(32, 13, 5, 0.82)",
    surfaceRecessedBorder: "rgba(232, 168, 132, 0.36)",
    surfaceElevated: "rgba(46, 20, 8, 0.76)",
    surfaceElevatedBorder: "rgba(232, 168, 132, 0.34)",
    accentPrimary: "#ffbe85",
    accentContrast: "#331405",
    modalSurface: "#5c2f1a",
    modalSurfaceAlt: "#401e0f",
    boardFrame: "#2b1207",
    boardBorder: "#b87452",
    dockFrame: "rgba(36, 15, 6, 0.68)",
    dockSlot: "rgba(20, 8, 3, 0.58)",
    cellEven: "#210d04",
    cellOdd: "#1c0b03",
    blockTop: "#d98a5b",
    blockMid: "#b8683b",
    blockBot: "#8f4822",
    blockBevel: "rgba(255, 226, 204, 0.65)",
    blockGrain: "rgba(55, 22, 8, 0.18)",
    blockBorder: "#3b1807",
    particles: ["#ffbe94", "#e08955", "#b86332", "#ffe6d4"]
  },
  {
    id: "jade",
    name: "Bambuss un nefrīts",
    shortName: "Nefrīts",
    unlockScore: 2000,
    themeColor: "#285943",
    bgRadial: "radial-gradient(circle at 50% 25%, #5a9e7c 0%, #336b50 65%, #1c4230 100%)",
    grainColor: "rgba(12, 36, 24, 0.05)",
    surfaceRecessed: "rgba(15, 42, 29, 0.8)",
    surfaceRecessedBorder: "rgba(158, 232, 194, 0.36)",
    surfaceElevated: "rgba(22, 56, 40, 0.75)",
    surfaceElevatedBorder: "rgba(158, 232, 194, 0.34)",
    accentPrimary: "#9cf5c7",
    accentContrast: "#0d3320",
    modalSurface: "#2d6148",
    modalSurfaceAlt: "#1d4532",
    boardFrame: "#163626",
    boardBorder: "#82cca7",
    dockFrame: "rgba(18, 46, 32, 0.65)",
    dockSlot: "rgba(10, 28, 19, 0.55)",
    cellEven: "#112b1e",
    cellOdd: "#0e2419",
    blockTop: "#8be8b8",
    blockMid: "#52c48b",
    blockBot: "#2e9662",
    blockBevel: "rgba(230, 255, 242, 0.78)",
    blockGrain: "rgba(14, 66, 40, 0.14)",
    blockBorder: "#13472d",
    particles: ["#b8ffda", "#6ee0a5", "#3eb578", "#e8fff3"]
  },
  {
    id: "midnight",
    name: "Nakts melnkoks",
    shortName: "Melnkoks",
    unlockScore: 4000,
    themeColor: "#1f2436",
    bgRadial: "radial-gradient(circle at 50% 25%, #3d4663 0%, #222738 65%, #121521 100%)",
    grainColor: "rgba(0, 0, 0, 0.08)",
    surfaceRecessed: "rgba(14, 17, 28, 0.84)",
    surfaceRecessedBorder: "rgba(154, 174, 224, 0.34)",
    surfaceElevated: "rgba(24, 29, 46, 0.78)",
    surfaceElevatedBorder: "rgba(154, 174, 224, 0.32)",
    accentPrimary: "#ffd966",
    accentContrast: "#291a03",
    modalSurface: "#2a3045",
    modalSurfaceAlt: "#1b1f2e",
    boardFrame: "#10131f",
    boardBorder: "#6e7eab",
    dockFrame: "rgba(15, 18, 30, 0.7)",
    dockSlot: "rgba(9, 11, 20, 0.62)",
    cellEven: "#171b2b",
    cellOdd: "#131724",
    blockTop: "#ffd66b",
    blockMid: "#e6a82e",
    blockBot: "#b87a14",
    blockBevel: "rgba(255, 250, 220, 0.8)",
    blockGrain: "rgba(90, 52, 6, 0.15)",
    blockBorder: "#452804",
    particles: ["#ffe999", "#ffbe3b", "#8fb2ff", "#ffffff"]
  }
];

let currentThemeId = SK.get(STORAGE_THEME_KEY) || "oak";
function getActiveTheme() {
  return THEMES.find(t => t.id === currentThemeId) || THEMES[0];
}

function updateDynamicFavicon(t) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${t.themeColor}"/><rect x="108" y="108" width="296" height="296" rx="36" fill="${t.boardFrame}" stroke="${t.boardBorder}" stroke-width="6"/><rect x="134" y="134" width="114" height="114" rx="22" fill="${t.blockTop}" stroke="${t.blockBorder}" stroke-width="7"/><rect x="134" y="264" width="114" height="114" rx="22" fill="${t.blockMid}" stroke="${t.blockBorder}" stroke-width="7"/><rect x="264" y="264" width="114" height="114" rx="22" fill="${t.blockTop}" stroke="${t.blockBorder}" stroke-width="7"/><path d="M321 154 L331 179 L356 189 L331 199 L321 224 L311 199 L286 189 L311 179 Z" fill="#ffe66d"/></svg>`;
  const link = document.querySelector("link[rel='icon']");
  if (link) link.href = "data:image/svg+xml," + encodeURIComponent(svg);
}

function applyTheme(themeId) {
  const t = THEMES.find(x => x.id === themeId) || THEMES[0];
  currentThemeId = t.id;
  SK.set(STORAGE_THEME_KEY, t.id);

  const root = document.documentElement.style;
  root.setProperty("--bg-radial", t.bgRadial);
  root.setProperty("--grain-color", t.grainColor);
  root.setProperty("--surface-recessed", t.surfaceRecessed);
  root.setProperty("--surface-recessed-border", t.surfaceRecessedBorder);
  root.setProperty("--surface-elevated", t.surfaceElevated);
  root.setProperty("--surface-elevated-border", t.surfaceElevatedBorder);
  root.setProperty("--accent-primary", t.accentPrimary);
  root.setProperty("--accent-contrast", t.accentContrast);
  root.setProperty("--modal-surface", t.modalSurface);
  root.setProperty("--modal-surface-alt", t.modalSurfaceAlt);
  document.getElementById("meta-theme-color").setAttribute("content", t.themeColor);
  document.getElementById("menu-theme-name").textContent = t.shortName;
  updateDynamicFavicon(t);
  if (typeof invalidateBgCache === "function") invalidateBgCache();
}

const BASE_SHAPES = [
  [[1]],
  [[1, 1]],
  [[1, 1, 1]],
  [[1, 1, 1, 1]],
  [[1, 1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 1]],
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  [[1, 1, 1], [0, 1, 0], [0, 1, 0]]
];

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}

function matricesEqual(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) return false;
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[0].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function isRotatable(matrix) {
  return !matricesEqual(matrix, rotateMatrix(matrix));
}

let audioCtx = null;
const STORAGE_SOUND_KEY = "koka_bloki_sound";
let soundEnabled = SK.get(STORAGE_SOUND_KEY, "1") !== "0";

function ensureAudio() {
  if (!audioCtx && soundEnabled) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playWoodSound(type) {
  if (!soundEnabled) return;
  ensureAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "rotate") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.start(now);
    osc.stop(now + 0.07);
  } else if (type === "undo") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.11);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === "pickup") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.05);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (type === "place") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.09);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === "hammer") {
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.14);
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === "bump") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === "clear") {
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "triangle";
      o.connect(g);
      g.connect(audioCtx.destination);
      const start = now + idx * 0.045;
      o.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0.2, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      o.start(start);
      o.stop(start + 0.29);
    });
  } else if (type === "boardclear" || type === "record") {
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    freqs.forEach((f, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.connect(g);
      g.connect(audioCtx.destination);
      const start = now + idx * 0.055;
      o.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0.22, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
      o.start(start);
      o.stop(start + 0.39);
    });
  } else if (type === "gameover") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.45);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

function vibrate(ms) {
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch (e) {}
  }
}

let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
let tray = [null, null, null];
let score = 0;
let displayedScore = 0;
let committedBest = parseInt(SK.get(STORAGE_BEST_KEY, "0"), 10) || 0;

function getBest() { return Math.max(committedBest, score); }
function commitBest() {
  if (score > committedBest) {
    committedBest = score;
    SK.set(STORAGE_BEST_KEY, String(committedBest));
  }
}
let newRecordCelebrated = false;
let isGameOver = false;
let combo = 0;

let hammers = 1;
let rerolls = 1;
let undos = 1;
let undoSnapshot = null;
let hammerArmed = false;
let boardShakeTimer = 0;

let particles = [];
let floatingTexts = [];
let flashCells = [];
let dragState = null;
let dragPointerId = null;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgCanvas = document.createElement("canvas");
const bgCtx = bgCanvas.getContext("2d");
let bgCacheValid = false;
let rafPending = false;

function invalidateBgCache() {
  bgCacheValid = false;
  scheduleDraw();
}

function scheduleDraw() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(draw);
  }
}

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
let boardX = 0;
let boardY = 0;
let boardSize = 0;
let cellSize = 0;
let trayY = 0;
let trayHeight = 0;

function createSnapshot() {
  return {
    grid: grid.map(r => [...r]),
    tray: tray.map(p => p ? { shape: p.shape.map(row => [...row]), rotatable: p.rotatable } : null),
    score,
    combo,
    hammers,
    rerolls
  };
}

function saveGameState() {
  try {
    if (isGameOver) {
      SK.remove(STORAGE_STATE_KEY);
      return;
    }
    const state = {
      grid,
      tray: tray.map(p => p ? { shape: p.shape, rotatable: p.rotatable } : null),
      score,
      combo,
      hammers,
      rerolls,
      undos,
      undoSnapshot,
      newRecordCelebrated
    };
    SK.set(STORAGE_STATE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function loadGameState() {
  try {
    const raw = SK.get(STORAGE_STATE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.grid) || parsed.grid.length !== GRID_SIZE) return false;
    grid = parsed.grid;
    tray = parsed.tray.map(p => p ? {
      shape: p.shape,
      rotatable: typeof p.rotatable === "boolean" ? p.rotatable : isRotatable(p.shape),
      animScale: 1
    } : null);
    score = parsed.score || 0;
    displayedScore = score;
    combo = parsed.combo || 0;
    hammers = typeof parsed.hammers === "number" ? parsed.hammers : 1;
    rerolls = typeof parsed.rerolls === "number" ? parsed.rerolls : 1;
    undos = typeof parsed.undos === "number" ? parsed.undos : 1;
    undoSnapshot = parsed.undoSnapshot || null;
    newRecordCelebrated = !!parsed.newRecordCelebrated;
    isGameOver = false;
    refillTrayIfEmpty();
    return true;
  } catch (e) {
    return false;
  }
}

let lastRectW = 0;
let lastRectH = 0;
let lastDpr = 0;

function resize(force) {
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width < 50 || rect.height < 50) return;
  const curDpr = Math.min(window.devicePixelRatio || 1, 2);
  if (!force && Math.abs(rect.width - lastRectW) < 0.5 && Math.abs(rect.height - lastRectH) < 0.5 && curDpr === lastDpr) return;
  lastRectW = rect.width;
  lastRectH = rect.height;
  lastDpr = curDpr;
  width = rect.width;
  height = rect.height;
  dpr = curDpr;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const maxBoardW = width - 24;
  const minTopMargin = 10;
  const minBottomMargin = 10;
  const minGap = 16;
  const maxBoardH = (height - (minTopMargin + minBottomMargin + minGap)) / (1 + 3.45 / GRID_SIZE);

  boardSize = Math.floor(Math.min(maxBoardW, maxBoardH));
  cellSize = boardSize / GRID_SIZE;
  trayHeight = Math.round(cellSize * 3.45);

  const freeVertical = Math.max(0, height - boardSize - trayHeight);
  const topMargin = Math.max(8, Math.round(freeVertical * 0.22));
  const gapBetween = Math.max(14, Math.min(38, Math.round(freeVertical * 0.44)));
  const remainingBottom = height - topMargin - boardSize - gapBetween - trayHeight;
  const extraOffset = remainingBottom > 34 ? Math.round((remainingBottom - 22) * 0.35) : 0;

  boardX = Math.floor((width - boardSize) / 2);
  boardY = topMargin + extraOffset;
  trayY = boardY + boardSize + gapBetween;
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bgCacheValid = false;
  spriteCache.clear();
  scheduleDraw();
}

new ResizeObserver(() => resize(false)).observe(canvas.parentElement);

function randomPiece() {
  const base = BASE_SHAPES[Math.floor(Math.random() * BASE_SHAPES.length)];
  let shape = base.map(row => [...row]);
  const rots = Math.floor(Math.random() * 4);
  for (let i = 0; i < rots; i++) shape = rotateMatrix(shape);
  return {
    shape,
    rotatable: isRotatable(shape),
    animScale: 1
  };
}

function generateTray() {
  for (let attempt = 0; attempt < 40; attempt++) {
    const t = [randomPiece(), randomPiece(), randomPiece()];
    if (t.some(p => canPieceFitAnyRotation(p))) return t;
  }
  const t = [randomPiece(), randomPiece(), randomPiece()];
  t[0] = { shape: [[1]], rotatable: false, animScale: 1 };
  return t;
}

function refillTrayIfEmpty() {
  if (tray.every(p => p === null)) {
    tray = generateTray();
  }
}

const DEFAULT_STATUS = "Pieskaries figūrai apakšā, lai pagrieztu";
let statusTimer = null;
function setStatusMessage(msg) {
  document.getElementById("status-text").textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = null;
  if (msg !== DEFAULT_STATUS) {
    statusTimer = setTimeout(() => setStatusMessage(DEFAULT_STATUS), 2800);
  }
}

function celebrateNewRecord() {
  newRecordCelebrated = true;
  playWoodSound("record");
  vibrate([30, 40, 60]);
  const bestPill = document.getElementById("best-pill");
  bestPill.classList.add("record-broken");
  setTimeout(() => bestPill.classList.remove("record-broken"), 1400);

  if (boardSize > 0) {
    addFloatingText(boardX + boardSize / 2, boardY + boardSize * 0.32, "Jauns rekords!");
    spawnParticles(boardX + boardSize / 2, boardY + boardSize * 0.32, 24);
  }
}

function updateUI() {
  const hadPreviousBest = committedBest > 0;
  if (score > committedBest) {
    if (hadPreviousBest && !newRecordCelebrated) {
      celebrateNewRecord();
    } else if (!hadPreviousBest && score > 0) {
      newRecordCelebrated = true;
    }
  }
  document.getElementById("best-val").textContent = getBest();
  document.getElementById("combo-val").textContent = combo;

  const comboBox = document.getElementById("combo-box");
  if (combo > 0) comboBox.classList.add("combo-active");
  else comboBox.classList.remove("combo-active");

  document.getElementById("undo-count").textContent = undos;
  document.getElementById("hammer-count").textContent = hammers;
  document.getElementById("reroll-count").textContent = rerolls;

  const undoBtn = document.getElementById("undo-btn");
  undoBtn.classList.toggle("empty", undos <= 0 || !undoSnapshot);

  const hammerBtn = document.getElementById("hammer-btn");
  hammerBtn.classList.toggle("empty", hammers <= 0);
  hammerBtn.classList.toggle("armed", hammerArmed);

  const rerollBtn = document.getElementById("reroll-btn");
  rerollBtn.classList.toggle("empty", rerolls <= 0);

  const statusBanner = document.getElementById("status-banner");
  const cancelHammerBtn = document.getElementById("cancel-hammer-btn");
  if (hammerArmed) {
    statusBanner.style.display = "none";
    cancelHammerBtn.classList.add("show");
  } else {
    statusBanner.style.display = "inline-flex";
    cancelHammerBtn.classList.remove("show");
    if (!statusTimer) {
      document.getElementById("status-text").textContent = DEFAULT_STATUS;
    }
  }
}

function canPlace(shape, startR, startC) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const gr = startR + r;
        const gc = startC + c;
        if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
        if (grid[gr][gc] !== 0) return false;
      }
    }
  }
  return true;
}

function canPieceFitAnyRotation(piece) {
  if (!piece) return false;
  let testShape = piece.shape;
  for (let rot = 0; rot < 4; rot++) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlace(testShape, r, c)) return true;
      }
    }
    testShape = rotateMatrix(testShape);
  }
  return false;
}

function isBoardCompletelyEmpty() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) return false;
    }
  }
  return true;
}

function showGameOverModal() {
  document.getElementById("final-score").textContent = score;
  document.getElementById("final-best").textContent = getBest();
  const badge = document.getElementById("modal-record-badge");
  const bestBox = document.getElementById("modal-best-box");
  if (newRecordCelebrated && score > 0) {
    badge.classList.add("show");
    bestBox.classList.add("highlight");
  } else {
    badge.classList.remove("show");
    bestBox.classList.remove("highlight");
  }
  const modal = document.getElementById("gameover-modal");
  modal.classList.remove("peeking");
  modal.classList.add("show");
}

function checkGameOver() {
  if (hammers > 0 || rerolls > 0 || (undos > 0 && undoSnapshot)) return;

  const remaining = tray.filter(p => p !== null);
  if (remaining.length === 0) return;
  const anyFits = remaining.some(p => canPieceFitAnyRotation(p));
  if (!anyFits) {
    isGameOver = true;
    commitBest();
    SK.remove(STORAGE_STATE_KEY);
    playWoodSound("gameover");
    vibrate([60, 50, 100]);
    showGameOverModal();
  }
}

function spawnParticles(cx, cy, count = 10) {
  const theme = getActiveTheme();
  const colors = theme.particles;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.5;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      size: 3 + Math.random() * 4.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0
    });
  }
}

function addFloatingText(x, y, text) {
  floatingTexts.push({ x, y, text, life: 1.0 });
}

function placePiece(piece, startR, startC, preMoveSnapshot) {
  undoSnapshot = preMoveSnapshot;

  let placedBlocks = 0;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[0].length; c++) {
      if (piece.shape[r][c]) {
        grid[startR + r][startC + c] = 1;
        placedBlocks++;
      }
    }
  }

  score += placedBlocks * 2;
  playWoodSound("place");
  vibrate(18);

  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(val => val === 1)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) { full = false; break; }
    }
    if (full) fullCols.push(c);
  }

  const linesCleared = fullRows.length + fullCols.length;

  if (linesCleared > 0) {
    combo++;
    const clearedSet = new Set();
    fullRows.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) clearedSet.add(`${r},${c}`);
    });
    fullCols.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) clearedSet.add(`${r},${c}`);
    });

    clearedSet.forEach(key => {
      const [r, c] = key.split(",").map(Number);
      grid[r][c] = 0;
      const px = boardX + (c + 0.5) * cellSize;
      const py = boardY + (r + 0.5) * cellSize;
      spawnParticles(px, py, 7);
      flashCells.push({ r, c, life: 1.0 });
    });

    const gained = linesCleared * 20 * combo + (linesCleared > 1 ? linesCleared * 15 : 0);
    score += gained;

    let bonusText = "";
    if (combo >= 3 && combo % 3 === 0) {
      if (hammers <= rerolls && hammers <= undos) {
        hammers = Math.min(3, hammers + 1);
        bonusText = " (+1 Āmurs)";
      } else if (rerolls <= undos) {
        rerolls = Math.min(3, rerolls + 1);
        bonusText = " (+1 Maiņa)";
      } else {
        undos = Math.min(3, undos + 1);
        bonusText = " (+1 Atsaukt)";
      }
    }

    if (isBoardCompletelyEmpty()) {
      const boardClearBonus = 300;
      score += boardClearBonus;
      playWoodSound("boardclear");
      vibrate([40, 30, 50, 30, 70]);
      for (let i = 0; i < 6; i++) {
        spawnParticles(
          boardX + Math.random() * boardSize,
          boardY + Math.random() * boardSize,
          10
        );
      }
      addFloatingText(boardX + boardSize / 2, boardY + boardSize * 0.45, `TĪRS LAUKUMS! +${boardClearBonus}`);
      addFloatingText(boardX + boardSize / 2, boardY + boardSize * 0.62, `+${gained}${bonusText}`);
    } else {
      playWoodSound("clear");
      vibrate([25, 30, 40]);
      const centerMsg = combo > 1 ? `Sērija x${combo}! +${gained}${bonusText}` : `+${gained}`;
      addFloatingText(boardX + boardSize / 2, boardY + boardSize / 2, centerMsg);
    }
  } else {
    combo = 0;
  }

  refillTrayIfEmpty();
  updateUI();
  scheduleDraw();
  saveGameState();
  checkGameOver();
}

function getDropGridPos() {
  if (!dragState) return null;
  const piece = tray[dragState.index];
  if (!piece) return null;

  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const pieceW = cols * cellSize;
  const pieceH = rows * cellSize;

  const topLeftX = dragState.currentX - pieceW / 2;
  const topLeftY = dragState.currentY - pieceH / 2;

  const exactCol = (topLeftX - boardX) / cellSize;
  const exactRow = (topLeftY - boardY) / cellSize;

  const roundCol = Math.round(exactCol);
  const roundRow = Math.round(exactRow);

  if (canPlace(piece.shape, roundRow, roundCol)) {
    return { row: roundRow, col: roundCol };
  }

  let bestCandidate = null;
  let bestDist = MAGNETIC_SNAP_RATIO;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const candR = roundRow + dr;
      const candC = roundCol + dc;
      if (canPlace(piece.shape, candR, candC)) {
        const dist = Math.hypot(exactRow - candR, exactCol - candC);
        if (dist <= bestDist) {
          bestDist = dist;
          bestCandidate = { row: candR, col: candC };
        }
      }
    }
  }

  return bestCandidate;
}

function getPreviewClearedLines(piece, dropPos) {
  if (!piece || !dropPos) return { rows: new Set(), cols: new Set() };

  const tempGrid = grid.map(r => [...r]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[0].length; c++) {
      if (piece.shape[r][c]) {
        tempGrid[dropPos.row + r][dropPos.col + c] = 1;
      }
    }
  }

  const previewRows = new Set();
  const previewCols = new Set();

  for (let r = 0; r < GRID_SIZE; r++) {
    if (tempGrid[r].every(v => v === 1)) previewRows.add(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (tempGrid[r][c] === 0) { full = false; break; }
    }
    if (full) previewCols.add(c);
  }

  return { rows: previewRows, cols: previewCols };
}

const spriteCache = new Map();

function paintBlock(g, x, y, size, t) {
  const pad = Math.max(1.5, size * 0.045);
  const bx = x + pad;
  const by = y + pad;
  const bw = size - pad * 2;
  const bh = size - pad * 2;
  const radius = Math.max(4, size * 0.14);

  const grad = g.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, t.blockTop);
  grad.addColorStop(0.5, t.blockMid);
  grad.addColorStop(1, t.blockBot);
  g.fillStyle = grad;
  roundRect(g, bx, by, bw, bh, radius);
  g.fill();

  g.strokeStyle = t.blockBevel;
  g.lineWidth = Math.max(1.2, size * 0.04);
  roundRect(g, bx + 1, by + 1, bw - 2, bh - 2, radius);
  g.stroke();

  g.fillStyle = t.blockGrain;
  g.fillRect(bx + bw * 0.18, by + bh * 0.28, bw * 0.64, Math.max(1.5, bh * 0.06));
  g.fillRect(bx + bw * 0.25, by + bh * 0.64, bw * 0.5, Math.max(1.5, bh * 0.05));

  g.strokeStyle = t.blockBorder;
  g.lineWidth = 1.2;
  roundRect(g, bx, by, bw, bh, radius);
  g.stroke();
}

function getBlockSprite(baseSize, t) {
  const px = Math.max(1, Math.round(baseSize * dpr));
  const key = t.id + ":" + px;
  let sprite = spriteCache.get(key);
  if (sprite) return sprite;
  if (spriteCache.size > 32) spriteCache.clear();
  sprite = document.createElement("canvas");
  sprite.width = px;
  sprite.height = px;
  const g = sprite.getContext("2d");
  g.scale(px / baseSize, px / baseSize);
  paintBlock(g, 0, 0, baseSize, t);
  spriteCache.set(key, sprite);
  return sprite;
}

function drawWoodBlock(x, y, size, alpha = 1, isGhost = false, isHammerTarget = false, isLineHighlight = false, baseSize = size) {
  if (!Number.isFinite(size) || !Number.isFinite(x) || !Number.isFinite(y) || size < 0.5) return;
  const t = getActiveTheme();
  ctx.save();
  ctx.globalAlpha = alpha;

  if (isGhost) {
    const pad = Math.max(1.5, size * 0.045);
    const radius = Math.max(4, size * 0.14);
    ctx.fillStyle = isLineHighlight ? "rgba(255, 232, 95, 0.45)" : "rgba(255, 224, 115, 0.28)";
    ctx.strokeStyle = isLineHighlight ? "#fff394" : "rgba(255, 232, 145, 0.85)";
    ctx.lineWidth = isLineHighlight ? 2.5 : 2;
    roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.drawImage(getBlockSprite(baseSize, t), x, y, size, size);

  if (isHammerTarget || isLineHighlight) {
    const pad = Math.max(1.5, size * 0.045);
    const radius = Math.max(4, size * 0.14);
    const bx = x + pad, by = y + pad, bw = size - pad * 2;
    ctx.strokeStyle = isHammerTarget ? "#ff4d4d" : "#fff078";
    ctx.lineWidth = 2.5;
    roundRect(ctx, bx, by, bw, bw, radius);
    ctx.stroke();
    if (isHammerTarget) {
      ctx.fillStyle = "rgba(255, 60, 60, 0.22)";
    } else {
      const pulse = 0.22 + 0.12 * Math.sin(performance.now() * 0.012);
      ctx.fillStyle = `rgba(255, 242, 130, ${pulse})`;
    }
    roundRect(ctx, bx, by, bw, bw, radius);
    ctx.fill();
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function getTraySlotCenter(index) {
  const innerX = boardX - 8;
  const innerW = boardSize + 16;
  const slotW = innerW / 3;
  return {
    x: innerX + slotW * index + slotW / 2,
    y: trayY + trayHeight * 0.5
  };
}

function getAdaptiveDockCellSize(piece, slotInnerW, slotInnerH) {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const maxDim = Math.max(rows, cols);

  let targetRatio = 0.60;
  if (maxDim === 1) targetRatio = 0.88;
  else if (maxDim === 2) targetRatio = 0.78;
  else if (maxDim === 3) targetRatio = 0.68;
  else if (maxDim === 4) targetRatio = 0.60;
  else targetRatio = 0.54;

  const desiredSize = cellSize * targetRatio;
  const padX = piece.rotatable ? 28 : 18;
  const padY = 18;
  const maxFitW = (slotInnerW - padX) / cols;
  const maxFitH = (slotInnerH - padY) / rows;

  return Math.min(desiredSize, maxFitW, maxFitH);
}

function drawRotateBadge(cx, cy, t) {
  ctx.save();
  ctx.fillStyle = t.surfaceRecessed;
  ctx.strokeStyle = t.surfaceRecessedBorder;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = t.accentPrimary;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 5, -Math.PI * 0.75, Math.PI * 0.65);
  ctx.stroke();

  const tipX = cx + 5 * Math.cos(-Math.PI * 0.75);
  const tipY = cy + 5 * Math.sin(-Math.PI * 0.75);
  ctx.beginPath();
  ctx.moveTo(tipX - 2.5, tipY - 0.5);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(tipX + 0.5, tipY + 2.8);
  ctx.stroke();
  ctx.restore();
}

function renderStaticBackground(t) {
  bgCtx.clearRect(0, 0, width, height);
  const framePad = 8;
  bgCtx.save();
  bgCtx.fillStyle = t.boardFrame;
  bgCtx.strokeStyle = t.boardBorder;
  bgCtx.lineWidth = 2.5;
  roundRect(bgCtx, boardX - framePad, boardY - framePad, boardSize + framePad * 2, boardSize + framePad * 2, 18);
  bgCtx.fill();
  bgCtx.stroke();
  bgCtx.restore();

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cx = boardX + c * cellSize;
      const cy = boardY + r * cellSize;
      const pad = 2;
      bgCtx.fillStyle = (r + c) % 2 === 0 ? t.cellEven : t.cellOdd;
      roundRect(bgCtx, cx + pad, cy + pad, cellSize - pad * 2, cellSize - pad * 2, 5);
      bgCtx.fill();
      bgCtx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      bgCtx.lineWidth = 1;
      bgCtx.stroke();
    }
  }

  const dockX = boardX - framePad;
  const dockW = boardSize + framePad * 2;
  bgCtx.save();
  bgCtx.fillStyle = t.dockFrame;
  bgCtx.strokeStyle = t.surfaceRecessedBorder;
  bgCtx.lineWidth = 1.5;
  roundRect(bgCtx, dockX, trayY, dockW, trayHeight, 18);
  bgCtx.fill();
  bgCtx.stroke();
  bgCtx.restore();

  const slotGap = 8;
  const slotInnerW = (dockW - slotGap * 4) / 3;
  const slotInnerH = trayHeight - slotGap * 2;
  for (let i = 0; i < 3; i++) {
    const sx = dockX + slotGap + i * (slotInnerW + slotGap);
    const sy = trayY + slotGap;
    bgCtx.save();
    bgCtx.fillStyle = t.dockSlot;
    roundRect(bgCtx, sx, sy, slotInnerW, slotInnerH, 13);
    bgCtx.fill();
    bgCtx.restore();
  }
  bgCacheValid = true;
}

let lastFrameT = 0;
let drawErrors = 0;

function draw() {
  try {
    drawFrame();
    drawErrors = 0;
  } catch (err) {
    console.error("draw error", err);
    lastFrameT = 0;
    try {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } catch (e2) {}
    if (++drawErrors < 5) scheduleDraw();
  }
}

function drawFrame() {
  rafPending = false;
  const t = getActiveTheme();

  const nowT = performance.now();
  const dt = lastFrameT ? Math.min(3, Math.max(0.25, (nowT - lastFrameT) / 16.667)) : 1;
  lastFrameT = nowT;

  if (displayedScore !== score) {
    const diff = score - displayedScore;
    const step = Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) * Math.min(1, 0.22 * dt)));
    displayedScore += step;
    document.getElementById("score-val").textContent = displayedScore;
  }

  ctx.clearRect(0, 0, width, height);

  const dropPos = (dragState && dragState.isDragging) ? getDropGridPos() : null;
  const activePiece = (dragState && dragState.isDragging) ? tray[dragState.index] : null;
  const previewLines = getPreviewClearedLines(activePiece, dropPos);
  const hasLineHighlight = previewLines.rows.size > 0 || previewLines.cols.size > 0;

  let shakeOffsetX = 0;
  if (boardShakeTimer > 0) {
    shakeOffsetX = Math.sin(boardShakeTimer * 45) * 6 * boardShakeTimer;
    boardShakeTimer = Math.max(0, boardShakeTimer - 0.06 * dt);
  }

  if (!bgCacheValid) renderStaticBackground(t);
  const bxBase = boardX + shakeOffsetX;
  const framePad = 8;

  if (bgCanvas.width > 0 && bgCanvas.height > 0) {
    ctx.drawImage(bgCanvas, 0, 0, width * dpr, height * dpr, shakeOffsetX, 0, width, height);
  }

  if (hammerArmed) {
    ctx.save();
    ctx.strokeStyle = t.accentPrimary;
    ctx.lineWidth = 3;
    roundRect(ctx, bxBase - framePad, boardY - framePad, boardSize + framePad * 2, boardSize + framePad * 2, 18);
    ctx.stroke();
    ctx.restore();
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 1) {
        const cx = bxBase + c * cellSize;
        const cy = boardY + r * cellSize;
        const highlightCell = previewLines.rows.has(r) || previewLines.cols.has(c);
        drawWoodBlock(cx, cy, cellSize, 1, false, hammerArmed, highlightCell, cellSize);
      }
    }
  }

  if (dragState && dropPos && activePiece) {
    for (let r = 0; r < activePiece.shape.length; r++) {
      for (let c = 0; c < activePiece.shape[0].length; c++) {
        if (activePiece.shape[r][c]) {
          const gr = dropPos.row + r;
          const gc = dropPos.col + c;
          const highlightGhost = previewLines.rows.has(gr) || previewLines.cols.has(gc);
          drawWoodBlock(
            bxBase + gc * cellSize,
            boardY + gr * cellSize,
            cellSize,
            1,
            true,
            false,
            highlightGhost,
            cellSize
          );
        }
      }
    }
  }

  for (let i = flashCells.length - 1; i >= 0; i--) {
    const fc = flashCells[i];
    ctx.save();
    ctx.globalAlpha = fc.life * 0.75;
    ctx.fillStyle = "#fff6bd";
    roundRect(
      ctx,
      bxBase + fc.c * cellSize + 2,
      boardY + fc.r * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
      6
    );
    ctx.fill();
    ctx.restore();
    fc.life -= 0.06 * dt;
    if (fc.life <= 0) flashCells.splice(i, 1);
  }

  const dockW = boardSize + framePad * 2;
  const dockX = boardX - framePad;
  const slotGap = 8;
  const slotInnerW = (dockW - slotGap * 4) / 3;
  const slotInnerH = trayHeight - slotGap * 2;

  for (let i = 0; i < 3; i++) {
    const piece = tray[i];
    if (!piece) continue;
    if (dragState && dragState.index === i && dragState.isDragging) continue;

    const center = getTraySlotCenter(i);
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const dynCell = getAdaptiveDockCellSize(piece, slotInnerW, slotInnerH);

    if (piece.animScale < 1) {
      piece.animScale = Math.min(1, piece.animScale + 0.12 * dt);
    }

    const scale = piece.animScale;
    const pw = cols * dynCell * scale;
    const ph = rows * dynCell * scale;
    const startX = center.x - pw / 2;
    const startY = center.y - ph / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c]) {
          drawWoodBlock(
            startX + c * dynCell * scale,
            startY + r * dynCell * scale,
            dynCell * scale,
            hammerArmed ? 0.45 : 1,
            false,
            false,
            false,
            dynCell
          );
        }
      }
    }

    if (piece.rotatable && !hammerArmed) {
      const sx = dockX + slotGap + i * (slotInnerW + slotGap);
      const sy = trayY + slotGap;
      drawRotateBadge(sx + slotInnerW - 15, sy + 15, t);
    }
  }

  if (dragState && dragState.isDragging && activePiece) {
    const rows = activePiece.shape.length;
    const cols = activePiece.shape[0].length;
    const pw = cols * cellSize;
    const ph = rows * cellSize;
    const startX = dragState.currentX - pw / 2;
    const startY = dragState.currentY - ph / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (activePiece.shape[r][c]) {
          drawWoodBlock(
            startX + c * cellSize,
            startY + r * cellSize,
            cellSize,
            0.95,
            false,
            false,
            hasLineHighlight,
            cellSize
          );
        }
      }
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.18 * dt;
    p.life -= 0.03 * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.life);
    ctx.font = "900 22px 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#261003";
    ctx.lineWidth = 5;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = t.accentPrimary;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();

    ft.y -= 1.15 * dt;
    ft.life -= 0.02 * dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  const hasTrayAnim = tray.some(p => p && p.animScale < 1);
  if (
    displayedScore !== score ||
    dragState !== null ||
    particles.length > 0 ||
    floatingTexts.length > 0 ||
    flashCells.length > 0 ||
    boardShakeTimer > 0 ||
    hasLineHighlight ||
    hasTrayAnim
  ) {
    scheduleDraw();
  } else {
    lastFrameT = 0;
  }
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function handleHammerClick(pos) {
  if (!hammerArmed || hammers <= 0) return false;
  if (
    pos.x >= boardX &&
    pos.x <= boardX + boardSize &&
    pos.y >= boardY &&
    pos.y <= boardY + boardSize
  ) {
    const col = Math.floor((pos.x - boardX) / cellSize);
    const row = Math.floor((pos.y - boardY) / cellSize);
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      if (grid[row][col] === 1) {
        undoSnapshot = createSnapshot();
        grid[row][col] = 0;
        hammers--;
        hammerArmed = false;
        playWoodSound("hammer");
        vibrate([35, 25, 35]);

        const px = boardX + (col + 0.5) * cellSize;
        const py = boardY + (row + 0.5) * cellSize;
        spawnParticles(px, py, 16);
        flashCells.push({ r: row, c: col, life: 1.0 });

        updateUI();
        scheduleDraw();
        saveGameState();
        checkGameOver();
        return true;
      } else {
        boardShakeTimer = 1.0;
        playWoodSound("bump");
        vibrate([25, 35, 25]);
        addFloatingText(pos.x, pos.y - 12, "Izvēlies koka bloku!");
        return true;
      }
    }
  }
  return false;
}

function getSlotAtX(x) {
  const dockLeft = boardX - 8;
  const dockWidth = boardSize + 16;
  if (x < dockLeft - 14 || x > dockLeft + dockWidth + 14) return -1;
  const rel = (x - dockLeft) / (dockWidth / 3);
  return Math.max(0, Math.min(2, Math.floor(rel)));
}

function getFingerOffset() {
  return Math.max(FINGER_OFFSET_Y, Math.round(cellSize * 1.85));
}

function onPointerDown(e) {
  if (e.cancelable) e.preventDefault();
  const pos = getCanvasCoords(e);

  if (hammerArmed) {
    handleHammerClick(pos);
    return;
  }

  if (pos.y >= trayY - 28 && pos.y <= trayY + trayHeight + 28) {
    let slotIndex = getSlotAtX(pos.x);
    if (slotIndex !== -1 && tray[slotIndex] === null) {
      const altLeft = getSlotAtX(pos.x - 24);
      const altRight = getSlotAtX(pos.x + 24);
      if (altLeft !== -1 && tray[altLeft] !== null) slotIndex = altLeft;
      else if (altRight !== -1 && tray[altRight] !== null) slotIndex = altRight;
    }

    if (slotIndex !== -1 && tray[slotIndex] !== null) {
      dragState = {
        index: slotIndex,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y - getFingerOffset(),
        startTime: performance.now(),
        isDragging: false,
        lastSnapKey: null
      };
      scheduleDraw();
    }
  }
}

function onPointerMove(e) {
  if (!dragState) return;
  if (e.cancelable) e.preventDefault();
  const pos = getCanvasCoords(e);
  const dx = pos.x - dragState.startX;
  const dy = pos.y - dragState.startY;
  const dist = Math.hypot(dx, dy);

  if (!dragState.isDragging && dist > TAP_THRESHOLD_PX) {
    dragState.isDragging = true;
    playWoodSound("pickup");
    vibrate(10);
  }

  if (dragState.isDragging) {
    dragState.currentX = pos.x;
    dragState.currentY = pos.y - getFingerOffset();
    scheduleDraw();

    const dropPos = getDropGridPos();
    const snapKey = dropPos ? `${dropPos.row},${dropPos.col}` : null;
    if (snapKey !== dragState.lastSnapKey) {
      dragState.lastSnapKey = snapKey;
    }
  }
}

function onPointerUp(e) {
  if (!dragState) return;
  if (e.cancelable) e.preventDefault();

  const elapsed = performance.now() - dragState.startTime;
  const piece = tray[dragState.index];

  if (!dragState.isDragging && elapsed < TAP_THRESHOLD_MS + 150 && piece) {
    if (piece.rotatable) {
      piece.shape = rotateMatrix(piece.shape);
      piece.animScale = 0.78;
      scheduleDraw();
      playWoodSound("rotate");
      vibrate(12);
      saveGameState();
    }
  } else if (dragState.isDragging && piece) {
    const dropPos = getDropGridPos();
    if (dropPos) {
      const preMoveSnapshot = createSnapshot();
      tray[dragState.index] = null;
      placePiece(piece, dropPos.row, dropPos.col, preMoveSnapshot);
    }
  }

  dragState = null;
  scheduleDraw();
}

function resetDrag() {
  dragPointerId = null;
  if (dragState) {
    dragState = null;
    scheduleDraw();
  }
}

canvas.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (dragPointerId !== null) return;
  onPointerDown(e);
  if (dragState) {
    dragPointerId = e.pointerId;
  }
}, { passive: false });

window.addEventListener("pointermove", (e) => {
  if (e.pointerId !== dragPointerId) return;
  onPointerMove(e);
}, { passive: false });

window.addEventListener("pointerup", (e) => {
  ensureAudio();
  if (e.pointerId !== dragPointerId) return;
  dragPointerId = null;
  onPointerUp(e);
}, { passive: false });

window.addEventListener("pointercancel", (e) => {
  if (e.pointerId !== dragPointerId) return;
  resetDrag();
});

window.addEventListener("blur", resetDrag);
document.addEventListener("visibilitychange", () => { if (document.hidden) resetDrag(); });

document.getElementById("undo-btn").addEventListener("click", () => {
  ensureAudio();
  if (undos <= 0 || !undoSnapshot) {
    setStatusMessage("Nav pieejama gājiena atsaukšana");
    vibrate(30);
    return;
  }
  hammerArmed = false;
  undos--;
  grid = undoSnapshot.grid.map(r => [...r]);
  tray = undoSnapshot.tray.map(p => p ? {
    shape: p.shape.map(row => [...row]),
    rotatable: p.rotatable,
    animScale: 0.82
  } : null);
  score = undoSnapshot.score;
  displayedScore = score;
  document.getElementById("score-val").textContent = displayedScore;
  combo = undoSnapshot.combo;
  hammers = undoSnapshot.hammers;
  rerolls = undoSnapshot.rerolls;
  undoSnapshot = null;

  playWoodSound("undo");
  vibrate([15, 25, 15]);
  addFloatingText(boardX + boardSize / 2, boardY + boardSize * 0.5, "Gājiens atsaukts");
  updateUI();
  scheduleDraw();
  saveGameState();
});

document.getElementById("hammer-btn").addEventListener("click", () => {
  ensureAudio();
  if (hammers <= 0) {
    setStatusMessage("Nav āmuru! Savāc sēriju x3, lai nopelnītu");
    vibrate(30);
    return;
  }
  const hasBlocks = grid.some(row => row.some(cell => cell === 1));
  if (!hasBlocks) {
    setStatusMessage("Laukums jau ir tukšs");
    return;
  }
  hammerArmed = !hammerArmed;
  playWoodSound("pickup");
  updateUI();
  scheduleDraw();
});

document.getElementById("cancel-hammer-btn").addEventListener("click", () => {
  hammerArmed = false;
  playWoodSound("rotate");
  updateUI();
  scheduleDraw();
});

document.getElementById("reroll-btn").addEventListener("click", () => {
  ensureAudio();
  if (rerolls <= 0) {
    setStatusMessage("Nav maiņu! Savāc sēriju x3, lai nopelnītu");
    vibrate(30);
    return;
  }
  undoSnapshot = createSnapshot();
  hammerArmed = false;
  rerolls--;
  tray = generateTray();
  tray.forEach(p => { if (p) p.animScale = 0.65; });
  playWoodSound("rotate");
  vibrate([15, 20, 15]);
  updateUI();
  scheduleDraw();
  saveGameState();
  checkGameOver();
});

let resetConfirmTimeout = null;
let resetConfirmArmed = false;

function disarmResetConfirm() {
  resetConfirmArmed = false;
  if (resetConfirmTimeout) {
    clearTimeout(resetConfirmTimeout);
    resetConfirmTimeout = null;
  }
  const btn = document.getElementById("menu-reset-btn");
  btn.classList.remove("confirm-danger");
  document.getElementById("menu-reset-label").textContent = "Sākt jaunu spēli";
  document.getElementById("menu-reset-pill").textContent = "No nulles";
}

document.getElementById("settings-btn").addEventListener("click", () => {
  ensureAudio();
  hammerArmed = false;
  updateUI();
  scheduleDraw();
  disarmResetConfirm();
  document.getElementById("menu-sound-state").textContent = soundEnabled ? "Ieslēgta" : "Izslēgta";
  document.getElementById("settings-modal").classList.add("show");
});

document.getElementById("close-settings-btn").addEventListener("click", () => {
  disarmResetConfirm();
  document.getElementById("settings-modal").classList.remove("show");
});

document.getElementById("menu-hub-btn").addEventListener("click", () => {
  commitBest();
  saveGameState();
  window.location.href = "./index.html";
});

document.getElementById("menu-sound-btn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  SK.set(STORAGE_SOUND_KEY, soundEnabled ? "1" : "0");
  document.getElementById("menu-sound-state").textContent = soundEnabled ? "Ieslēgta" : "Izslēgta";
  if (soundEnabled) playWoodSound("rotate");
});

document.getElementById("menu-reset-btn").addEventListener("click", () => {
  if (score === 0) {
    disarmResetConfirm();
    document.getElementById("settings-modal").classList.remove("show");
    startNewGame();
    return;
  }

  if (!resetConfirmArmed) {
    resetConfirmArmed = true;
    vibrate(25);
    const btn = document.getElementById("menu-reset-btn");
    btn.classList.add("confirm-danger");
    document.getElementById("menu-reset-label").textContent = "Vai tiešām dzēst?";
    document.getElementById("menu-reset-pill").textContent = "Spied vēlreiz";
    resetConfirmTimeout = setTimeout(disarmResetConfirm, 3500);
  } else {
    disarmResetConfirm();
    document.getElementById("settings-modal").classList.remove("show");
    startNewGame();
  }
});

function renderThemesList() {
  const list = document.getElementById("theme-list");
  list.innerHTML = "";
  THEMES.forEach(theme => {
    const unlocked = getBest() >= theme.unlockScore;
    const isSelected = theme.id === currentThemeId;
    const pct = theme.unlockScore > 0 ? Math.min(100, Math.round((getBest() / theme.unlockScore) * 100)) : 100;

    const item = document.createElement("div");
    item.className = "theme-item" + (isSelected ? " selected" : "") + (!unlocked ? " locked" : "");
    if (unlocked) {
      item.setAttribute("role", "button");
      item.tabIndex = 0;
    }

    const swatchGrad = `linear-gradient(135deg, ${theme.blockTop}, ${theme.blockBot})`;
    const statusHtml = isSelected
      ? `<svg class="m-icon m-icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><span>Aktīva</span>`
      : (unlocked
          ? `<span>Izvēlēties</span>`
          : `<svg class="m-icon m-icon-sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>${theme.unlockScore}</span>`);

    const progressHtml = !unlocked
      ? `<div class="theme-progress-track"><div class="theme-progress-fill" style="width: ${pct}%;"></div></div>`
      : "";

    item.innerHTML = `
      <div class="theme-top-row">
        <div class="theme-left">
          <div class="theme-swatch" style="background: ${swatchGrad};"></div>
          <div>
            <div class="theme-name">${theme.name}</div>
            <div class="theme-req">${unlocked ? "Atbloķēts" : `Rekords: ${getBest()} / ${theme.unlockScore} p. (${pct}%)`}</div>
          </div>
        </div>
        <div class="theme-status">${statusHtml}</div>
      </div>
      ${progressHtml}
    `;

    if (unlocked) {
      const selectHandler = () => {
        applyTheme(theme.id);
        playWoodSound("rotate");
        renderThemesList();
      };
      item.addEventListener("click", selectHandler);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectHandler();
        }
      });
    }

    list.appendChild(item);
  });
}

function openThemesModal() {
  hammerArmed = false;
  updateUI();
  scheduleDraw();
  renderThemesList();
  document.getElementById("settings-modal").classList.remove("show");
  document.getElementById("themes-modal").classList.add("show");
}

document.getElementById("menu-themes-btn").addEventListener("click", () => {
  disarmResetConfirm();
  openThemesModal();
});

document.getElementById("close-themes-btn").addEventListener("click", () => {
  document.getElementById("themes-modal").classList.remove("show");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const themesModal = document.getElementById("themes-modal");
    const settingsModal = document.getElementById("settings-modal");
    if (themesModal.classList.contains("show")) {
      themesModal.classList.remove("show");
    } else if (settingsModal.classList.contains("show")) {
      disarmResetConfirm();
      settingsModal.classList.remove("show");
    }
  }
});

const peekBtn = document.getElementById("peek-board-btn");
const gameOverModal = document.getElementById("gameover-modal");

function startPeek(e) {
  if (e.cancelable) e.preventDefault();
  gameOverModal.classList.add("peeking");
}
function stopPeek() {
  gameOverModal.classList.remove("peeking");
}

peekBtn.addEventListener("pointerdown", startPeek);
peekBtn.addEventListener("pointerup", stopPeek);
peekBtn.addEventListener("pointercancel", stopPeek);
peekBtn.addEventListener("pointerleave", stopPeek);

document.getElementById("share-score-btn").addEventListener("click", async () => {
  const shareText = `Es savācu ${score} punktus spēlē Koka bloki! (Mans rekords: ${getBest()} p.) Vari pārspēt?`;
  const shareUrl = window.location.href.split("?")[0];
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Koka bloki",
        text: shareText,
        url: shareUrl
      });
    } catch (e) {}
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      const lbl = document.getElementById("share-btn-label");
      lbl.textContent = "Nokopēts";
      setTimeout(() => { lbl.textContent = "Dalīties"; }, 2000);
    } catch (e) {}
  }
});

function startNewGame() {
  commitBest();
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  tray = generateTray();
  score = 0;
  displayedScore = 0;
  document.getElementById("score-val").textContent = "0";
  combo = 0;
  hammers = 1;
  rerolls = 1;
  undos = 1;
  undoSnapshot = null;
  hammerArmed = false;
  newRecordCelebrated = false;
  isGameOver = false;
  particles = [];
  floatingTexts = [];
  flashCells = [];
  dragState = null;
  document.getElementById("gameover-modal").classList.remove("show");
  document.getElementById("gameover-modal").classList.remove("peeking");
  updateUI();
  scheduleDraw();
  saveGameState();
}

document.getElementById("modal-restart-btn").addEventListener("click", startNewGame);

window.addEventListener("pagehide", () => { commitBest(); saveGameState(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { commitBest(); saveGameState(); }
});

applyTheme(currentThemeId);
resize(true);

const urlParams = new URLSearchParams(window.location.search);
const shortcutAction = urlParams.get("action");

if (shortcutAction === "new") {
  startNewGame();
  window.history.replaceState({}, document.title, "./koka-bloki.html");
} else {
  if (loadGameState()) {
    document.getElementById("score-val").textContent = displayedScore;
    commitBest();
    updateUI();
    scheduleDraw();
    checkGameOver();
  } else {
    startNewGame();
  }
  if (shortcutAction === "themes") {
    openThemesModal();
    window.history.replaceState({}, document.title, "./koka-bloki.html");
  }
}

requestAnimationFrame(draw);
})();
