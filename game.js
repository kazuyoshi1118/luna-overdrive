const canvas = document.getElementById('fightCanvas');
const ctx = canvas.getContext('2d');

const titleOverlay = document.getElementById('titleOverlay');
const titleIntro = document.getElementById('titleIntro');
const characterSelectPanel = document.getElementById('characterSelectPanel');
const characterGrid = document.getElementById('characterGrid');
const playerSlotButton = document.getElementById('playerSlotButton');
const cpuSlotButton = document.getElementById('cpuSlotButton');
const selectedPlayerNameEl = document.getElementById('selectedPlayerName');
const selectedCpuNameEl = document.getElementById('selectedCpuName');
const selectionDetailNameEl = document.getElementById('selectionDetailName');
const selectionDetailTitleEl = document.getElementById('selectionDetailTitle');
const selectionDetailSpecialEl = document.getElementById('selectionDetailSpecial');
const selectionDetailSuperEl = document.getElementById('selectionDetailSuper');
const confirmCharacterButton = document.getElementById('confirmCharacterButton');
const backToTitleButton = document.getElementById('backToTitleButton');
const startButton = document.getElementById('startButton');
const trainingButton = document.getElementById('trainingButton');
const resetButton = document.getElementById('resetButton');
const rematchButton = document.getElementById('rematchButton');
const fightBanner = document.getElementById('fightBanner');
const hitConfirm = document.getElementById('hitConfirm');
const playerHealthEl = document.getElementById('playerHealth');
const cpuHealthEl = document.getElementById('cpuHealth');
const playerMeterEl = document.getElementById('playerMeter');
const cpuMeterEl = document.getElementById('cpuMeter');
const timerEl = document.getElementById('timer');
const roundNumberEl = document.getElementById('roundNumber');
const roundStateEl = document.getElementById('roundState');
const announcerEl = document.getElementById('announcer');
const comboReadoutEl = document.getElementById('comboReadout');
const tipReadoutEl = document.getElementById('tipReadout');
const resultPanel = document.getElementById('resultPanel');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultHits = document.getElementById('resultHits');
const resultCombo = document.getElementById('resultCombo');
const resultGrade = document.getElementById('resultGrade');
const shareResultButton = document.getElementById('shareResultButton');
const playerHudNameEl = document.getElementById('playerHudName');
const playerHudTitleEl = document.getElementById('playerHudTitle');
const cpuHudNameEl = document.getElementById('cpuHudName');
const cpuHudTitleEl = document.getElementById('cpuHudTitle');
const playerRoundEls = [document.getElementById('playerRound1'), document.getElementById('playerRound2')];
const cpuRoundEls = [document.getElementById('cpuRound1'), document.getElementById('cpuRound2')];
const pauseOverlay = document.getElementById('pauseOverlay');
const pauseButton = document.getElementById('pauseButton');
const mobilePauseButton = document.getElementById('mobilePauseButton');
const audioButton = document.getElementById('audioButton');

const WORLD = { width: 1200, height: 600, ground: 486, gravity: 1900, roundSeconds: 60 };
const MOVE_SPEED = 315;
const JUMP_SPEED = 780;
const MAX_HEALTH = 1000;
const MAX_METER = 1000;
const keys = new Set();
const justPressed = new Set();
const particles = [];
const projectiles = [];
const floatingText = [];
const visualAssets = {
  stage: new Image(),
  luna: new Image(),
  neko: new Image(),
  kagari: new Image(),
  mizuki: new Image(),
  bolt9: new Image(),
  vanta: new Image(),
  sylfa: new Image(),
  ryuga: new Image(),
  piko: new Image(),
  orbis: new Image()
};
visualAssets.stage.src = 'assets/overdrive-stage-bg.png';
visualAssets.luna.src = 'assets/luna-overdrive-luna.png';
visualAssets.neko.src = 'assets/nekomusica-overdrive.png';
visualAssets.kagari.src = 'assets/kagari.png';
visualAssets.mizuki.src = 'assets/mizuki.png';
visualAssets.bolt9.src = 'assets/bolt9.png';
visualAssets.vanta.src = 'assets/vanta.png';
visualAssets.sylfa.src = 'assets/sylfa.png';
visualAssets.ryuga.src = 'assets/ryuga.png';
visualAssets.piko.src = 'assets/piko.png';
visualAssets.orbis.src = 'assets/orbis.png';

const MOVES = {
  light: { key: 'j', label: 'LIGHT', startup: 80, active: 105, recovery: 180, damage: 45, range: 94, height: 132, knockback: 80, hitstun: 260, meter: 26, color: '#72dcff' },
  heavy: { key: 'k', label: 'HEAVY', startup: 180, active: 130, recovery: 300, damage: 100, range: 128, height: 120, knockback: 190, hitstun: 410, meter: 46, color: '#ff9d52' },
  special: { key: 'l', label: 'DAYBREAK', startup: 250, active: 90, recovery: 310, damage: 145, range: 155, height: 164, knockback: 280, hitstun: 520, meter: -250, projectile: true, color: '#ff668d' },
  super: { key: 'i', label: 'OVERDRIVE', startup: 380, active: 170, recovery: 540, damage: 330, range: 250, height: 250, knockback: 460, hitstun: 760, meter: -1000, super: true, color: '#63f2ce' }
};

const CHARACTER_ROSTER = {
  luna: { id: 'luna', name: 'LUNA', title: 'THE DAYBREAK AGENT', role: 'BALANCED', assetKey: 'luna', accent: '#ff9d52', health: 1000, speed: 315, jump: 780, stats: [3, 3, 3, 3], tip: 'LUNA TIP：ゲージを溜めて、Lで昼の必殺技。', moveTuning: { l: { label: 'DAYBREAK', color: '#ff668d' }, i: { label: 'LUNA OVERDRIVE' } } },
  neko: { id: 'neko', name: 'NEKOMUSICA', title: 'THE RULE BREAKER', role: 'TRICKSTER', assetKey: 'neko', accent: '#a68cff', health: 940, speed: 340, jump: 810, stats: [2, 4, 4, 2], tip: 'NEKO TIP：距離を壊して、音波でルールを書き換える。', moveTuning: { l: { label: 'GLITCH WAVE', damage: 158, range: 178, color: '#a68cff' }, i: { label: 'RULE OVERRIDE', color: '#b28cff' } } },
  kagari: { id: 'kagari', name: 'KAGARI', title: 'THE SOLAR RUNNER', role: 'RUSHDOWN', assetKey: 'kagari', accent: '#ffb347', health: 930, speed: 395, jump: 820, stats: [4, 5, 2, 2], tip: 'KAGARI TIP：近づいて、ソーラーラッシュで一気に畳みかける。', moveTuning: { j: { damage: 40, startup: 62 }, k: { damage: 92, startup: 145 }, l: { label: 'SOLAR RUSH', damage: 190, range: 132, startup: 205, recovery: 250, color: '#ffb347' }, i: { label: 'SUNSET BREAK', damage: 360, startup: 320, color: '#ffcf69' } } },
  mizuki: { id: 'mizuki', name: 'MIZUKI', title: 'THE WAVE CONDUCTOR', role: 'ZONER', assetKey: 'mizuki', accent: '#72dcff', health: 960, speed: 285, jump: 745, stats: [3, 2, 5, 3], tip: 'MIZUKI TIP：音波パネルを置いて、相手の動線を支配する。', moveTuning: { j: { damage: 48, range: 106 }, k: { damage: 118, range: 150 }, l: { label: 'PHASE NOTE', damage: 178, range: 270, startup: 220, color: '#72dcff' }, i: { label: 'CRESCENDO NULL', damage: 300, range: 280, color: '#63f2ce' } } },
  bolt9: { id: 'bolt9', name: 'BOLT-9', title: 'THE FRIENDLY MACHINE', role: 'TANK', assetKey: 'bolt9', accent: '#63f2ce', health: 1120, speed: 240, jump: 650, stats: [5, 1, 2, 5], tip: 'BOLT-9 TIP：耐えて、マグネットパンチで流れを止める。', moveTuning: { j: { damage: 58, range: 86 }, k: { damage: 142, range: 118, startup: 205 }, l: { label: 'MAGNET PUNCH', damage: 170, range: 135, color: '#63f2ce' }, i: { label: 'CORE OVERLOAD', damage: 410, color: '#fff0a7' } } },
  vanta: { id: 'vanta', name: 'VANTA', title: 'THE MAGENTA FIEND', role: 'POWER', assetKey: 'vanta', accent: '#ff4fc3', health: 980, speed: 300, jump: 760, stats: [5, 2, 3, 4], tip: 'VANTA TIP：魔力を溜めて、一撃で相手の計算を壊す。', moveTuning: { j: { damage: 52, range: 98 }, k: { damage: 135, range: 132 }, l: { label: 'HEX BURST', damage: 210, range: 180, color: '#ff4fc3' }, i: { label: 'ABYSSAL SCRIPT', damage: 430, color: '#ff4fc3' } } },
  sylfa: { id: 'sylfa', name: 'SYLFA', title: 'THE FOREST VECTOR', role: 'WIND', assetKey: 'sylfa', accent: '#8ff0bd', health: 900, speed: 370, jump: 850, stats: [2, 4, 5, 2], tip: 'SYLFA TIP：風の射線を作って、相手を近づけさせない。', moveTuning: { j: { damage: 42, range: 110 }, k: { damage: 86, range: 148 }, l: { label: 'WIND VEIL', damage: 165, range: 300, color: '#8ff0bd' }, i: { label: 'VERDANT ARIA', damage: 320, range: 315, color: '#8ff0bd' } } },
  ryuga: { id: 'ryuga', name: 'RYUGA', title: 'THE DRAGON CORE', role: 'DRAGON', assetKey: 'ryuga', accent: '#ff7a35', health: 1080, speed: 275, jump: 720, stats: [5, 2, 3, 5], tip: 'RYUGA TIP：炎を纏い、正面から相手を押し切る。', moveTuning: { j: { damage: 55, range: 100 }, k: { damage: 130, range: 135 }, l: { label: 'DRAGON FLARE', damage: 200, range: 205, color: '#ff7a35' }, i: { label: 'RED COMET', damage: 390, color: '#ff7a35' } } },
  piko: { id: 'piko', name: 'PIKO', title: 'THE BOUNCE SLIME', role: 'CHAOS', assetKey: 'piko', accent: '#64e6e4', health: 880, speed: 360, jump: 900, stats: [3, 4, 4, 1], tip: 'PIKO TIP：跳ねて、読めない角度からバブルを投げる。', moveTuning: { j: { damage: 44, range: 120 }, k: { damage: 78, range: 112 }, l: { label: 'BOUNCE BLOB', damage: 150, range: 240, color: '#64e6e4' }, i: { label: 'JELLY JAM', damage: 290, range: 260, color: '#64e6e4' } } },
  orbis: { id: 'orbis', name: 'ORBIS', title: 'THE STAR DRIFTER', role: 'COSMIC', assetKey: 'orbis', accent: '#b99aff', health: 910, speed: 310, jump: 860, stats: [3, 3, 5, 2], tip: 'ORBIS TIP：軌道をずらして、星片の角度で詰ませる。', moveTuning: { j: { damage: 46, range: 105 }, k: { damage: 104, range: 145 }, l: { label: 'ORBIT LANCE', damage: 185, range: 310, color: '#b99aff' }, i: { label: 'ECLIPSE LOOP', damage: 350, range: 330, color: '#b99aff' } } }
};
const ROSTER_ORDER = Object.keys(CHARACTER_ROSTER);
const PROJECTILE_STYLES = { luna: 'sun', neko: 'glitch', kagari: 'rush', mizuki: 'wave', bolt9: 'magnet', vanta: 'hex', sylfa: 'wind', ryuga: 'flame', piko: 'blob', orbis: 'orbit' };

let canvasWidth = WORLD.width;
let canvasHeight = WORLD.height;
let scale = 1;
let state = 'menu';
let mode = 'cpu';
let round = 1;
let roundClock = WORLD.roundSeconds;
let roundStartedAt = 0;
let lastFrame = 0;
let hitstop = 0;
let bannerTimeout = 0;
let roundTimer = 0;
let playerRounds = 0;
let cpuRounds = 0;
let totalHits = 0;
let maxCombo = 0;
let player;
let cpu;
let cpuBrain = { timer: 0, move: 0, guard: false, action: null };
let selectedPlayerId = 'luna';
let selectedCpuId = 'neko';
let selectionTarget = 'player';
let selectionMode = 'cpu';
let pausedState = 'playing';
let audioEnabled = false;
let audioContext;

function ensureAudio() {
  if (!audioEnabled) return null;
  if (!audioContext) { const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return null; audioContext = new AudioContextClass(); }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration = .08, type = 'sine', volume = .035, delay = 0) {
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * .72), start + duration);
  gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .008); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(start); oscillator.stop(start + duration + .02);
}

function playSfx(kind) {
  if (!audioEnabled) return;
  const sounds = { select: [440, .06, 'triangle', .022], hit: [130, .09, 'square', .032], block: [270, .08, 'triangle', .025], special: [240, .16, 'sawtooth', .028], super: [180, .25, 'sawtooth', .04], round: [330, .13, 'triangle', .03], win: [523, .18, 'triangle', .035], lose: [220, .22, 'sine', .03] };
  const sound = sounds[kind] || sounds.select;
  playTone(...sound);
  if (kind === 'super' || kind === 'win') playTone(kind === 'win' ? 659 : 360, .18, 'triangle', .026, .08);
  if (kind === 'win') playTone(784, .22, 'triangle', .024, .17);
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  audioButton.textContent = audioEnabled ? 'SOUND: ON' : 'SOUND: OFF';
  audioButton.classList.toggle('is-on', audioEnabled);
  audioButton.setAttribute('aria-pressed', String(audioEnabled));
  if (audioEnabled) playSfx('select');
}

async function shareResult() {
  const winner = playerRounds > cpuRounds ? player : cpu;
  const message = `${winner.name}がLUNA OVERDRIVEで昼を奪った。GRADE ${resultGrade.textContent} / MAX COMBO ${resultCombo.textContent}`;
  const shareData = { title: 'LUNA OVERDRIVE｜DAYBREAK DUEL', text: message, url: window.location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else if (navigator.clipboard) await navigator.clipboard.writeText(`${message}\n${window.location.href}`);
    else throw new Error('share unavailable');
    shareResultButton.textContent = 'COPIED / SHARED ✓';
    window.setTimeout(() => { shareResultButton.textContent = 'SHARE RESULT ↗'; }, 1800);
  } catch (error) {
    if (error?.name !== 'AbortError') showHitConfirm('SHARE UNAVAILABLE');
  }
}

function makeFighter(side, characterId) {
  const character = CHARACTER_ROSTER[characterId] || CHARACTER_ROSTER.luna;
  return {
    side, name: character.name, characterId: character.id, character, x: side === 'player' ? 320 : 880, y: WORLD.ground, vx: 0, vy: 0, facing: side === 'player' ? 1 : -1,
    health: character.health, meter: 0, state: 'idle', attack: null, hitstun: 0, blockstun: 0, combo: 0, comboTimer: 0,
    maxCombo: 0, hits: 0, hurtFlash: 0, guard: false, grounded: true, aiPulse: 0, inputBuffer: null
  };
}

function getMoveFor(fighter, key) {
  const base = Object.values(MOVES).find((candidate) => candidate.key === key);
  if (!base) return null;
  return { ...base, visual: PROJECTILE_STYLES[fighter?.character?.id] || 'energy', ...(fighter?.character?.moveTuning?.[key] || {}) };
}

function renderCharacterSelect() {
  characterGrid.innerHTML = ROSTER_ORDER.map((id) => {
    const character = CHARACTER_ROSTER[id];
    const statBars = character.stats.map((value) => `<i class="${value >= 1 ? 'is-on' : ''}"></i>`).join('');
    const selectedClass = `${selectedPlayerId === id ? ' is-player' : ''}${selectedCpuId === id ? ' is-cpu' : ''}${selectionTarget === 'player' && selectedPlayerId === id || selectionTarget === 'cpu' && selectedCpuId === id ? ' is-target' : ''}`;
    return `<button class="character-card${selectedClass}" data-character="${id}" type="button" aria-label="${character.name} / ${character.role} / 攻撃${character.stats[0]} 速度${character.stats[1]} 射程${character.stats[2]} 防御${character.stats[3]}"><img src="assets/${character.assetKey}.png" alt="${character.name}"><span class="character-card-copy"><small>${character.title}</small><strong>${character.name}</strong><em>${character.role}</em><span class="mini-stats" aria-label="攻撃・速度・射程・防御">${statBars}</span></span></button>`;
  }).join('');
  characterGrid.querySelectorAll('[data-character]').forEach((card) => card.addEventListener('click', () => chooseCharacter(card.dataset.character)));
  selectedPlayerNameEl.textContent = CHARACTER_ROSTER[selectedPlayerId].name;
  selectedCpuNameEl.textContent = CHARACTER_ROSTER[selectedCpuId].name;
  const selectedId = selectionTarget === 'player' ? selectedPlayerId : selectedCpuId;
  const selected = CHARACTER_ROSTER[selectedId];
  const selectedFighter = { character: selected };
  selectionDetailNameEl.textContent = selected.name;
  selectionDetailTitleEl.textContent = `${selected.title} / ${selected.role}`;
  selectionDetailSpecialEl.textContent = getMoveFor(selectedFighter, 'l').label;
  selectionDetailSuperEl.textContent = getMoveFor(selectedFighter, 'i').label;
  playerSlotButton.classList.toggle('is-active', selectionTarget === 'player');
  cpuSlotButton.classList.toggle('is-active', selectionTarget === 'cpu');
}

function chooseCharacter(characterId) {
  if (selectionTarget === 'player') selectedPlayerId = characterId;
  else selectedCpuId = characterId;
  playSfx('select');
  renderCharacterSelect();
}

function showCharacterSelect(selectedMode) {
  selectionMode = selectedMode;
  titleIntro.hidden = true;
  characterSelectPanel.hidden = false;
  renderCharacterSelect();
}

function showTitleScreen() {
  state = 'menu';
  titleIntro.hidden = false;
  characterSelectPanel.hidden = true;
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
  document.body.classList.remove('is-playing', 'is-finished');
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  scale = Math.min(rect.width / WORLD.width, rect.height / WORLD.height);
  canvasWidth = Math.max(320, rect.width);
  canvasHeight = Math.max(260, rect.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, (canvasWidth - WORLD.width * scale) / 2 * dpr, (canvasHeight - WORLD.height * scale) / 2 * dpr);
}

function resetMatch() {
  state = 'menu';
  pausedState = 'playing';
  cpuBrain = { timer: 0, move: 0, guard: false, action: null };
  player = makeFighter('player', selectedPlayerId);
  cpu = makeFighter('cpu', selectedCpuId);
  round = 1;
  playerRounds = 0;
  cpuRounds = 0;
  totalHits = 0;
  maxCombo = 0;
  roundClock = WORLD.roundSeconds;
  roundStateEl.textContent = 'READY';
  roundNumberEl.textContent = '01';
  timerEl.textContent = '60';
  announcerEl.textContent = 'THE SUN IS ONLINE';
  comboReadoutEl.textContent = 'NO COMBO';
  tipReadoutEl.textContent = player.character.tip;
  resultPanel.hidden = true;
  shareResultButton.textContent = 'SHARE RESULT ↗';
  titleOverlay.hidden = false;
  titleIntro.hidden = false;
  characterSelectPanel.hidden = true;
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
  document.body.classList.remove('is-playing', 'is-finished');
  particles.length = 0;
  projectiles.length = 0;
  floatingText.length = 0;
  renderCharacterSelect();
  updateHud();
}

function startMatch(selectedMode) {
  mode = selectedMode;
  resetMatch();
  titleOverlay.hidden = true;
  document.body.classList.add('is-playing');
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
  startRound();
}

function startRound() {
  state = 'countdown';
  cpuBrain = { timer: 0, move: 0, guard: false, action: null };
  player = makeFighter('player', selectedPlayerId);
  cpu = makeFighter('cpu', selectedCpuId);
  roundClock = WORLD.roundSeconds;
  roundStartedAt = performance.now();
  roundNumberEl.textContent = String(round).padStart(2, '0');
  roundStateEl.textContent = 'ROUND ' + round;
  announcerEl.textContent = mode === 'training' ? `TRAINING / ${player.name} VS ${cpu.name}` : 'FIRST TO TWO ROUNDS';
  projectiles.length = 0;
  playSfx('round');
  showBanner('ROUND ' + round, 900);
  setTimeout(() => { if (state === 'countdown') { state = 'playing'; roundStateEl.textContent = 'FIGHT'; showBanner('FIGHT!', 760); } }, 980);
}

function showBanner(message, duration = 800) {
  window.clearTimeout(bannerTimeout);
  fightBanner.textContent = message;
  fightBanner.classList.remove('is-showing');
  void fightBanner.offsetWidth;
  fightBanner.classList.add('is-showing');
  bannerTimeout = window.setTimeout(() => fightBanner.classList.remove('is-showing'), duration);
}

function showHitConfirm(label) {
  hitConfirm.textContent = label;
  hitConfirm.classList.remove('is-showing');
  void hitConfirm.offsetWidth;
  hitConfirm.classList.add('is-showing');
}

function updateHud() {
  const playerHealth = Math.max(0, player ? player.health : MAX_HEALTH);
  const cpuHealth = Math.max(0, cpu ? cpu.health : MAX_HEALTH);
  playerHealthEl.style.width = `${(playerHealth / (player?.character.health || MAX_HEALTH)) * 100}%`;
  cpuHealthEl.style.width = `${(cpuHealth / (cpu?.character.health || MAX_HEALTH)) * 100}%`;
  if (player) { playerHudNameEl.textContent = player.name; playerHudTitleEl.textContent = player.character.title; }
  if (cpu) { cpuHudNameEl.textContent = cpu.name; cpuHudTitleEl.textContent = cpu.character.title; }
  const playerAccent = player?.character.accent || CHARACTER_ROSTER[selectedPlayerId].accent;
  const cpuAccent = cpu?.character.accent || CHARACTER_ROSTER[selectedCpuId].accent;
  document.documentElement.style.setProperty('--player-accent', playerAccent);
  document.documentElement.style.setProperty('--cpu-accent', cpuAccent);
  playerHudNameEl.style.color = playerAccent;
  cpuHudNameEl.style.color = cpuAccent;
  playerMeterEl.style.width = `${Math.min(100, (player?.meter || 0) / MAX_METER * 100)}%`;
  cpuMeterEl.style.width = `${Math.min(100, (cpu?.meter || 0) / MAX_METER * 100)}%`;
  timerEl.textContent = String(Math.max(0, Math.ceil(roundClock))).padStart(2, '0');
  if (player && player.combo > 1) comboReadoutEl.textContent = `${player.combo} HIT COMBO / ${Math.round(player.comboTimer * 10) / 10}s`;
  playerRoundEls.forEach((pip, index) => pip.classList.toggle('is-won', index < playerRounds));
  cpuRoundEls.forEach((pip, index) => pip.classList.toggle('is-won', index < cpuRounds));
}

function togglePause() {
  if (state === 'playing') {
    pausedState = state;
    state = 'paused';
    pauseOverlay.hidden = false;
    pauseButton.textContent = 'RESUME';
    showBanner('PAUSED', 700);
  } else if (state === 'paused') {
    state = pausedState;
    pauseOverlay.hidden = true;
    pauseButton.textContent = 'PAUSE';
    showBanner('FIGHT!', 520);
  }
}

function readPlayerInput() {
  return { left: keys.has('a') ? 1 : 0, right: keys.has('d') ? 1 : 0, jump: justPressed.has('w'), guard: keys.has('s') };
}

function consumeActions(fighter) {
  if (fighter.side !== 'player') return;
  ['j', 'k', 'l', 'i'].forEach((key) => {
    if (!justPressed.has(key)) return;
    if (fighter.attack || fighter.hitstun > 0 || fighter.blockstun > 0) fighter.inputBuffer = { key, ttl: .2 };
    else triggerAction(fighter, key);
  });
}

function triggerAction(fighter, key) {
  if (!fighter || fighter.health <= 0 || fighter.attack || fighter.hitstun > 0 || fighter.blockstun > 0 || !fighter.grounded) return false;
  const move = getMoveFor(fighter, key);
  if (!move) return false;
  if (fighter.meter < Math.max(0, -move.meter)) {
    if (fighter.side === 'player') { showHitConfirm('NEED MORE DAYLIGHT'); addFloatingText(fighter.x, fighter.y - 170, 'NEED ' + Math.abs(move.meter) + ''); }
    return false;
  }
  fighter.attack = { move, elapsed: 0, hitDone: false, spawned: false };
  fighter.state = move.super ? 'super' : 'attack';
  fighter.meter = Math.max(0, fighter.meter + move.meter);
  fighter.vx = 0;
  if (move.super) { showBanner(`${fighter.name} OVERDRIVE`, 820); playSfx('super'); addBurst(fighter.x, fighter.y - 130, move.color, 16); }
  else if (move.projectile) playSfx('special');
  return true;
}

function updateFighter(fighter, opponent, input, dt) {
  if (!fighter || fighter.health <= 0) return;
  if (fighter.inputBuffer) { fighter.inputBuffer.ttl -= dt; if (fighter.inputBuffer.ttl <= 0) fighter.inputBuffer = null; }
  fighter.hurtFlash = Math.max(0, fighter.hurtFlash - dt);
  fighter.hitstun = Math.max(0, fighter.hitstun - dt * 1000);
  fighter.blockstun = Math.max(0, fighter.blockstun - dt * 1000);
  fighter.comboTimer = Math.max(0, fighter.comboTimer - dt);
  if (fighter.comboTimer === 0) fighter.combo = 0;
  if (fighter.hitstun > 0 || fighter.blockstun > 0) {
    fighter.vx *= Math.pow(.02, dt);
    fighter.state = fighter.blockstun > 0 ? 'block' : 'hit';
  } else if (fighter.attack) {
    updateAttack(fighter, opponent, dt);
  } else {
    let bufferedStarted = false;
    if (fighter.inputBuffer && fighter.grounded) {
      const bufferedKey = fighter.inputBuffer.key;
      fighter.inputBuffer = null;
      bufferedStarted = triggerAction(fighter, bufferedKey);
    }
    if (!bufferedStarted) {
      fighter.guard = !!input.guard && fighter.grounded;
      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      if (!fighter.guard) {
        fighter.vx = direction * fighter.character.speed;
        if (input.jump && fighter.grounded) { fighter.vy = -fighter.character.jump; fighter.grounded = false; }
      } else {
        fighter.vx = 0;
      }
      fighter.state = fighter.guard ? 'block' : (fighter.grounded ? (direction ? 'walk' : 'idle') : 'jump');
      fighter.facing = opponent.x >= fighter.x ? 1 : -1;
    } else {
      fighter.guard = false;
    }
  }
  fighter.x += fighter.vx * dt;
  fighter.vy += WORLD.gravity * dt;
  fighter.y += fighter.vy * dt;
  if (fighter.y >= WORLD.ground) { fighter.y = WORLD.ground; fighter.vy = 0; fighter.grounded = true; }
  fighter.x = Math.max(70, Math.min(WORLD.width - 70, fighter.x));
  if (fighter.side === 'cpu') fighter.guard = fighter.state === 'block';
}

function updateAttack(fighter, opponent, dt) {
  const attack = fighter.attack;
  attack.elapsed += dt * 1000;
  const move = attack.move;
  const activeStart = move.startup;
  const activeEnd = move.startup + move.active;
  if (move.projectile && !attack.spawned && attack.elapsed >= activeStart) {
    attack.spawned = true;
    projectiles.push({ owner: fighter, move, x: fighter.x + fighter.facing * 70, y: fighter.y - 120, vx: fighter.facing * 520, radius: move.super ? 62 : 29, damage: move.damage, life: 1.9, color: move.color, super: move.super });
    addBurst(fighter.x + fighter.facing * 58, fighter.y - 120, move.color, move.super ? 18 : 8);
  }
  if (!attack.hitDone && attack.elapsed >= activeStart && attack.elapsed <= activeEnd) {
    if (move.super) addBurst(fighter.x + fighter.facing * 120, fighter.y - 128, move.color, 2);
    if (!move.projectile) resolveMeleeHit(fighter, opponent, move);
  }
  if (attack.elapsed >= activeEnd + move.recovery) { fighter.attack = null; fighter.state = 'idle'; }
}

function bodyBox(fighter) { return { x: fighter.x - 35, y: fighter.y - 158, w: 70, h: 158 }; }

function meleeBox(fighter, move) {
  const x = fighter.facing === 1 ? fighter.x + 20 : fighter.x - 20 - move.range;
  return { x, y: fighter.y - move.height, w: move.range, h: move.height - 20 };
}

function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function resolveMeleeHit(attacker, defender, move) {
  if (overlaps(meleeBox(attacker, move), bodyBox(defender))) {
    attacker.attack.hitDone = true;
    applyHit(attacker, defender, move.damage, move.knockback, move.hitstun, move.color, move.label);
  }
}

function applyHit(attacker, defender, rawDamage, knockback, hitstun, color, label) {
  const guarding = defender.guard && defender.grounded && defender.facing === -attacker.facing;
  const damage = guarding ? Math.round(rawDamage * .14) : rawDamage;
  defender.health = Math.max(0, defender.health - damage);
  defender.vx = attacker.facing * (guarding ? knockback * .18 : knockback);
  defender.vy = guarding ? -40 : -Math.min(390, rawDamage * 2.3);
  defender.grounded = false;
  defender.hitstun = guarding ? 180 : hitstun;
  defender.blockstun = guarding ? 250 : 0;
  defender.hurtFlash = .14;
  attacker.hits += 1;
  attacker.combo = attacker.combo + 1;
  attacker.comboTimer = 1.25;
  attacker.maxCombo = Math.max(attacker.maxCombo, attacker.combo);
  maxCombo = Math.max(maxCombo, attacker.maxCombo);
  totalHits += 1;
  attacker.meter = Math.min(MAX_METER, attacker.meter + (guarding ? 10 : 18));
  hitstop = guarding ? .035 : (label === 'OVERDRIVE' ? .13 : .065);
  addBurst(defender.x, defender.y - 95, guarding ? '#b8c6ff' : color, guarding ? 5 : 11);
  playSfx(guarding ? 'block' : 'hit');
  addFloatingText(defender.x, defender.y - 185, guarding ? 'GUARD' : String(damage));
  showHitConfirm(guarding ? 'BLOCKED' : `${label} / ${damage}`);
  document.body.classList.toggle('screen-shake', !guarding && rawDamage >= 90);
  window.setTimeout(() => document.body.classList.remove('screen-shake'), 160);
  tipReadoutEl.textContent = guarding ? 'GUARD CRUSHではない。距離を作って、次の一手。' : (attacker.side === 'player' ? `GOOD HIT：${attacker.name}の昼が一段明るくなった。` : `${attacker.name}がルールを書き換えようとしている。`);
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    shot.life -= dt;
    shot.x += shot.vx * dt;
    if (shot.life <= 0 || shot.x < -90 || shot.x > WORLD.width + 90) { projectiles.splice(i, 1); continue; }
    const defender = shot.owner === player ? cpu : player;
    if (defender.health <= 0) continue;
    const box = bodyBox(defender);
    const hit = shot.x + shot.radius > box.x && shot.x - shot.radius < box.x + box.w && shot.y + shot.radius > box.y && shot.y - shot.radius < box.y + box.h;
    if (hit) {
      applyHit(shot.owner, defender, shot.damage, shot.move.knockback, shot.move.hitstun, shot.color, shot.move.label);
      projectiles.splice(i, 1);
    }
  }
}

function updateCpu(dt) {
  if (mode === 'training' || state !== 'playing' || cpu.health <= 0) return;
  const distance = player.x - cpu.x;
  const absDistance = Math.abs(distance);
  cpu.facing = distance >= 0 ? 1 : -1;
  cpuBrain.timer -= dt;
  if (cpuBrain.timer <= 0 && !cpu.attack && cpu.hitstun <= 0 && cpu.blockstun <= 0) {
    cpuBrain.timer = .22 + Math.random() * .5;
    cpuBrain.move = absDistance > 190 ? Math.sign(distance) : (Math.random() < .33 ? -Math.sign(distance) : 0);
    cpuBrain.guard = absDistance < 150 && Math.random() < .28;
    cpuBrain.action = null;
    if (absDistance < 150 && Math.random() < .63) cpuBrain.action = Math.random() < .58 ? 'j' : 'k';
    else if (absDistance < 360 && cpu.meter >= Math.abs(getMoveFor(cpu, 'l').meter) && Math.random() < .22) cpuBrain.action = 'l';
    else if (cpu.meter >= Math.abs(getMoveFor(cpu, 'i').meter) && Math.random() < .08) cpuBrain.action = 'i';
    if (cpuBrain.action) triggerAction(cpu, cpuBrain.action);
  }
  if (!cpu.attack) { cpu.guard = cpuBrain.guard; cpu.vx = cpuBrain.move * cpu.character.speed * .72; cpu.state = cpu.guard ? 'block' : (cpuBrain.move ? 'walk' : 'idle'); }
}

function tick(dt) {
  if (state === 'playing') {
    if (hitstop > 0) { hitstop -= dt; return; }
    roundClock = Math.max(0, WORLD.roundSeconds - (performance.now() - roundStartedAt) / 1000);
    const playerInput = readPlayerInput();
    consumeActions(player);
    updateCpu(dt);
    updateFighter(player, cpu, playerInput, dt);
    const cpuInput = mode === 'training' ? { left: false, right: false, jump: false, guard: false } : { left: cpuBrain.move < 0, right: cpuBrain.move > 0, jump: false, guard: cpuBrain.guard };
    updateFighter(cpu, player, cpuInput, dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateFloatingText(dt);
    updateHud();
    if (player.health <= 0 || cpu.health <= 0 || roundClock <= 0) endRound(player.health >= cpu.health ? 'player' : 'cpu');
  } else if (state === 'round_end') {
    roundTimer -= dt;
    updateParticles(dt);
    updateFloatingText(dt);
    if (roundTimer <= 0) {
      if (playerRounds >= 2 || cpuRounds >= 2 || mode === 'training') finishMatch();
      else { round += 1; startRound(); }
    }
  } else if (state === 'paused') {
    updateHud();
  } else {
    updateParticles(dt);
    updateFloatingText(dt);
  }
}

function endRound(winner) {
  if (state !== 'playing') return;
  state = 'round_end';
  const winnerFighter = winner === 'player' ? player : cpu;
  roundStateEl.textContent = `${winnerFighter.name} WINS`;
  if (winner === 'player') playerRounds += 1; else cpuRounds += 1;
  showBanner(`${winnerFighter.name} WINS`, 1100);
  playSfx(winner === 'player' ? 'win' : 'lose');
  announcerEl.textContent = winner === 'player' ? `${winnerFighter.character.role} CONFIRMED` : `${winnerFighter.character.role} HAS SHIFTED THE RULES`;
  roundTimer = 1.55;
  if (mode === 'training') roundTimer = 0;
}

function finishMatch() {
  state = 'finished';
  document.body.classList.remove('is-playing');
  document.body.classList.add('is-finished');
  const won = playerRounds > cpuRounds;
  const winner = won ? player : cpu;
  const loser = won ? cpu : player;
  resultPanel.hidden = false;
  resultTitle.textContent = won ? `${winner.name} WINS THE DAY` : `${winner.name} REWRITES THE RULES`;
  resultTitle.style.color = winner.character.accent;
  resultMessage.textContent = won ? `${winner.character.tip} 次の指令を受け付けます。` : `${loser.name}も、ここから進化する。もう一度、昼を取り戻そう。`;
  resultHits.textContent = String(totalHits);
  resultCombo.textContent = String(maxCombo);
  resultGrade.textContent = won && maxCombo >= 8 ? 'SS' : won ? 'A' : maxCombo >= 5 ? 'B' : 'C';
  roundStateEl.textContent = won ? 'CLEAR' : 'RETRY';
  announcerEl.textContent = 'MATCH REPORT READY';
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
}

function addBurst(x, y, color, count = 8) {
  for (let i = 0; i < count; i += 1) particles.push({ x, y, vx: (Math.random() - .5) * 360, vy: (Math.random() - .5) * 360, life: .32 + Math.random() * .5, size: 3 + Math.random() * 7, color, shape: Math.random() > .6 ? 'square' : 'dot' });
}

function addFloatingText(x, y, text) { floatingText.push({ x, y, text, life: .78, color: text === 'GUARD' ? '#b8c6ff' : '#fff3af' }); }
function updateParticles(dt) { for (let i = particles.length - 1; i >= 0; i -= 1) { const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; if (p.life <= 0) particles.splice(i, 1); } }
function updateFloatingText(dt) { for (let i = floatingText.length - 1; i >= 0; i -= 1) { const t = floatingText[i]; t.life -= dt; t.y -= 54 * dt; if (t.life <= 0) floatingText.splice(i, 1); } }

function drawScene(now) {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  if (visualAssets.stage.complete && visualAssets.stage.naturalWidth) {
    drawCoverImage(visualAssets.stage, 0, 0, WORLD.width, WORLD.height);
    const readability = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    readability.addColorStop(0, 'rgba(13,16,39,.16)'); readability.addColorStop(.66, 'rgba(13,16,39,.03)'); readability.addColorStop(1, 'rgba(13,16,39,.28)');
    ctx.fillStyle = readability; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = 'rgba(114,220,255,.22)'; ctx.fillRect(0, 478, WORLD.width, 4);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    sky.addColorStop(0, '#8bdcff'); sky.addColorStop(.55, '#d4fbf0'); sky.addColorStop(1, '#ffcf78');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    drawCloud(160 + Math.sin(now * .00013) * 30, 126, 1.2, .66); drawCloud(695 + Math.sin(now * .0001 + 2) * 25, 180, .86, .42);
    drawSkyline(); drawStageFloor(now);
  }
  drawSuperFlash(now);
  drawProjectiles();
  drawFighter(player, now); drawFighter(cpu, now);
  drawParticles(); drawFloatingText();
}

function drawCoverImage(image, x, y, width, height) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0; let sy = 0; let sw = image.naturalWidth; let sh = image.naturalHeight;
  if (sourceRatio > targetRatio) { sw = image.naturalHeight * targetRatio; sx = (image.naturalWidth - sw) / 2; }
  else { sh = image.naturalWidth / targetRatio; sy = (image.naturalHeight - sh) / 2; }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawCloud(x, y, s, alpha) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 25 * s, Math.PI, 0); ctx.arc(x + 28 * s, y - 15 * s, 32 * s, Math.PI, 0); ctx.arc(x + 65 * s, y, 24 * s, Math.PI, 0); ctx.lineTo(x + 89 * s, y + 20 * s); ctx.lineTo(x, y + 20 * s); ctx.closePath(); ctx.fill(); ctx.restore(); }

function drawSkyline() {
  const buildings = [[0, 330, 110, 155], [125, 292, 105, 193], [242, 352, 120, 133], [375, 270, 140, 215], [530, 325, 114, 160], [656, 284, 130, 201], [798, 338, 106, 147], [915, 256, 144, 229], [1072, 314, 128, 171]];
  buildings.forEach(([x, y, w, h], i) => { ctx.fillStyle = i % 2 ? 'rgba(75,133,179,.52)' : 'rgba(63,116,169,.42)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,214,.55)'; for (let wx = x + 16; wx < x + w - 10; wx += 27) for (let wy = y + 18; wy < y + h - 12; wy += 31) if ((wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 7, 9); });
  ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.fillRect(0, 444, WORLD.width, 3);
}

function drawStageFloor(now) {
  ctx.fillStyle = '#263963'; ctx.fillRect(0, 447, WORLD.width, 153);
  ctx.fillStyle = '#1a274b'; ctx.fillRect(0, 494, WORLD.width, 106);
  ctx.strokeStyle = 'rgba(114,220,255,.24)'; ctx.lineWidth = 2;
  for (let y = 500; y < 620; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke(); }
  const offset = (now * .08) % 90; for (let x = -200 + offset; x < WORLD.width + 300; x += 90) { ctx.beginPath(); ctx.moveTo(600, 447); ctx.lineTo(x, 600); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,157,82,.15)'; ctx.fillRect(0, 478, WORLD.width, 9);
}

function drawProjectiles() {
  projectiles.forEach((shot) => {
    ctx.save();
    ctx.translate(shot.x, shot.y);
    const pulse = 1 + Math.sin(performance.now() * .012 + shot.x * .01) * .08;
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = .18;
    ctx.fillStyle = shot.color;
    ctx.beginPath(); ctx.arc(0, 0, shot.radius * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .95;
    ctx.strokeStyle = shot.color;
    ctx.fillStyle = shot.color;
    ctx.shadowColor = shot.color;
    ctx.shadowBlur = shot.super ? 30 : 18;
    drawProjectileGlyph(shot.move.visual, shot.radius, shot.color, shot.super);
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

function drawProjectileGlyph(style, radius, color, superMove) {
  const r = radius * (superMove ? 1.08 : 1);
  ctx.lineWidth = Math.max(2, radius * .12);
  ctx.strokeStyle = '#fff';
  if (style === 'sun') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .78, -.8, 1.8); ctx.stroke();
  } else if (style === 'glitch') {
    ctx.fillStyle = color; ctx.fillRect(-r * .62, -r * .42, r * 1.18, r * .68);
    ctx.globalAlpha = .8; ctx.strokeRect(-r * .95, -r * .1, r * .7, r * .7); ctx.strokeRect(r * .18, -r * .7, r * .7, r * .45);
  } else if (style === 'rush') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * .78, -r * .68); ctx.lineTo(-r * .4, 0); ctx.lineTo(-r * .78, r * .68); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * .75, 0); ctx.lineTo(-r * 1.25, -r * .42); ctx.moveTo(-r * .75, 0); ctx.lineTo(-r * 1.25, r * .42); ctx.stroke();
  } else if (style === 'wave') {
    for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(-r * .35, 0, r * (.55 + i * .32), -1.1, 1.1); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * .25, 0, r * .2, 0, Math.PI * 2); ctx.fill();
  } else if (style === 'magnet') {
    ctx.beginPath(); ctx.arc(0, 0, r * .68, .25, Math.PI - .25); ctx.stroke();
    ctx.fillStyle = color; ctx.fillRect(-r * .82, -r * .76, r * .35, r * .48); ctx.fillRect(r * .47, -r * .76, r * .35, r * .48);
    ctx.beginPath(); ctx.moveTo(-r * .2, 0); ctx.lineTo(r * .2, 0); ctx.moveTo(0, -r * .2); ctx.lineTo(0, r * .2); ctx.stroke();
  } else if (style === 'hex') {
    drawPolygon(6, r * .78, Math.PI / 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .35, 0, Math.PI * 2); ctx.stroke();
  } else if (style === 'wind') {
    for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(-r * .25, r * (.18 - i * .18), r * (.42 + i * .26), -.9, .9); ctx.stroke(); }
  } else if (style === 'flame') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(r, 0); ctx.quadraticCurveTo(r * .15, -r * .9, -r * .55, -r * .25); ctx.quadraticCurveTo(-r * .2, 0, -r * .55, r * .25); ctx.quadraticCurveTo(r * .15, r * .9, r, 0); ctx.fill();
    ctx.fillStyle = '#fff0a7'; ctx.beginPath(); ctx.arc(r * .12, 0, r * .22, 0, Math.PI * 2); ctx.fill();
  } else if (style === 'blob') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(-r * .25, 0, r * .58, 0, Math.PI * 2); ctx.arc(r * .34, -r * .14, r * .42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * .12, -r * .14, r * .1, 0, Math.PI * 2); ctx.fill();
  } else if (style === 'orbit') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r * .42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * .42, -.35, 0, Math.PI * 2); ctx.stroke();
    drawStar(0, 0, r * .72, r * .28, 6); ctx.stroke();
  } else {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r * .65, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawPolygon(sides, radius, rotation = 0) { ctx.beginPath(); for (let i = 0; i < sides; i += 1) { const angle = rotation + (Math.PI * 2 * i) / sides; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath(); }
function drawStar(x, y, outer, inner, points) { ctx.beginPath(); for (let i = 0; i < points * 2; i += 1) { const angle = -Math.PI / 2 + (Math.PI * i) / points; const radius = i % 2 ? inner : outer; const px = x + Math.cos(angle) * radius; const py = y + Math.sin(angle) * radius; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); }

function drawParticles() { particles.forEach((p) => { ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 3); ctx.fillStyle = p.color; if (p.shape === 'square') { ctx.translate(p.x, p.y); ctx.rotate(p.life * 6); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }); }
function drawFloatingText() { floatingText.forEach((t) => { ctx.save(); ctx.globalAlpha = Math.min(1, t.life * 2); ctx.fillStyle = t.color; ctx.font = '900 17px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(14,18,50,.65)'; ctx.shadowBlur = 5; ctx.fillText(t.text, t.x, t.y); ctx.restore(); }); }

function drawFighter(fighter, now) {
  if (!fighter) return;
  ctx.save(); ctx.translate(fighter.x, fighter.y); ctx.scale(fighter.facing, 1);
  const blink = fighter.hurtFlash > 0 && Math.floor(now / 35) % 2 === 0; if (blink) ctx.globalAlpha = .38;
  ctx.fillStyle = 'rgba(7,10,32,.35)'; ctx.beginPath(); ctx.ellipse(0, 5, 66, 13, 0, 0, Math.PI * 2); ctx.fill();
  drawCharacterAura(fighter, now);
  const portrait = visualAssets[fighter.character.assetKey];
  if (portrait.complete && portrait.naturalWidth) drawCharacterArt(fighter, portrait);
  else if (fighter.side === 'player') drawLuna(fighter, now); else drawNekomusica(fighter, now);
  if (fighter.attack) drawAttackArc(fighter, now);
  ctx.restore();
}

function drawCharacterArt(fighter, portrait) {
  const height = 350 * (fighter.character.id === 'neko' ? .93 : 1);
  const width = height * (portrait.naturalWidth / portrait.naturalHeight);
  const lift = fighter.grounded ? 0 : Math.sin(performance.now() * .01) * 4;
  const attackProgress = fighter.attack ? fighter.attack.elapsed / (fighter.attack.move.startup + fighter.attack.move.active + fighter.attack.move.recovery) : 0;
  const active = fighter.attack && fighter.attack.elapsed >= fighter.attack.move.startup && fighter.attack.elapsed <= fighter.attack.move.startup + fighter.attack.move.active;
  ctx.save();
  ctx.translate(active ? 10 : fighter.state === 'walk' ? 3 : 0, active ? -4 : 0);
  ctx.rotate(active ? -.045 : Math.sin(performance.now() * .002 + attackProgress) * .008);
  ctx.scale(active ? 1.035 : 1, active ? .97 : 1);
  ctx.globalAlpha = fighter.state === 'hit' ? .76 : 1;
  ctx.shadowColor = fighter.side === 'player' ? 'rgba(255,157,82,.55)' : 'rgba(166,140,255,.55)';
  ctx.shadowBlur = fighter.attack?.move.super ? 34 : 14;
  ctx.drawImage(portrait, -width / 2, -height + lift, width, height);
  ctx.restore();
}

function drawCharacterAura(fighter, now) {
  const intensity = fighter.attack ? (fighter.attack.move.super ? .62 : .32) : fighter.guard ? .28 : fighter.state === 'walk' ? .16 : .09;
  const pulse = 1 + Math.sin(now * .004 + fighter.x * .01) * .06;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = intensity;
  ctx.strokeStyle = fighter.character.accent;
  ctx.shadowColor = fighter.character.accent;
  ctx.shadowBlur = fighter.attack?.move.super ? 30 : 12;
  ctx.lineWidth = fighter.attack?.move.super ? 5 : 2;
  ctx.beginPath();
  ctx.arc(0, -102, (72 + fighter.character.stats[2] * 7) * pulse, fighter.side === 'player' ? -2.6 : -.55, fighter.side === 'player' ? -.55 : 2.6);
  ctx.stroke();
  if (fighter.attack?.move.projectile) {
    ctx.globalAlpha = intensity * .7;
    ctx.beginPath();
    ctx.arc(0, -112, 50 + Math.sin(now * .008) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLuna(fighter, now) {
  const attack = fighter.attack; const moving = fighter.state === 'walk'; const bob = moving ? Math.sin(now * .022) * 3 : 0;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = '#16152e'; ctx.beginPath(); ctx.moveTo(-31, -16); ctx.lineTo(-24, -91); ctx.lineTo(-45, -126); ctx.lineTo(-17, -121); ctx.lineTo(0, -145); ctx.lineTo(19, -121); ctx.lineTo(48, -126); ctx.lineTo(28, -88); ctx.lineTo(38, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#20153e'; ctx.beginPath(); ctx.moveTo(-37, -112); ctx.lineTo(-24, -157); ctx.lineTo(-6, -173); ctx.lineTo(25, -158); ctx.lineTo(36, -108); ctx.lineTo(22, -131); ctx.lineTo(-14, -130); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffe0ce'; ctx.beginPath(); ctx.ellipse(0, -125, 30, 36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff5f86'; ctx.beginPath(); ctx.moveTo(-20, -139); ctx.lineTo(-7, -158); ctx.lineTo(5, -140); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3edff'; ctx.fillRect(-27, -86, 54, 75); ctx.fillStyle = '#ff668d'; ctx.fillRect(-4, -84, 8, 70);
  ctx.fillStyle = '#1a1738'; ctx.fillRect(-38, -17, 26, 18); ctx.fillRect(12, -17, 26, 18);
  ctx.fillStyle = '#ff9d52'; ctx.beginPath(); ctx.arc(0, -74, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b35bff'; ctx.lineWidth = 4; ctx.strokeRect(-24, -132, 21, 14); ctx.strokeRect(3, -132, 21, 14); ctx.beginPath(); ctx.moveTo(-3, -125); ctx.lineTo(3, -125); ctx.stroke();
  ctx.fillStyle = '#d43d75'; ctx.beginPath(); ctx.moveTo(20, -91); ctx.lineTo(63, -60); ctx.lineTo(31, -45); ctx.closePath(); ctx.fill();
  if (fighter.guard) { ctx.strokeStyle = 'rgba(114,220,255,.75)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(33, -85, 61, -1.25, 1.25); ctx.stroke(); }
  ctx.restore();
}

function drawNekomusica(fighter, now) {
  const attack = fighter.attack; const moving = fighter.state === 'walk'; const bob = moving ? Math.sin(now * .025) * 4 : 0;
  ctx.save(); ctx.translate(0, bob);
  ctx.fillStyle = '#14152b'; ctx.beginPath(); ctx.moveTo(-40, -25); ctx.lineTo(-30, -108); ctx.lineTo(-55, -146); ctx.lineTo(-19, -133); ctx.lineTo(0, -165); ctx.lineTo(20, -133); ctx.lineTo(55, -146); ctx.lineTo(31, -105); ctx.lineTo(42, -24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#24284f'; ctx.beginPath(); ctx.ellipse(0, -119, 38, 31, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffcf69'; ctx.beginPath(); ctx.arc(-15, -122, 9, 0, Math.PI * 2); ctx.arc(15, -122, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#16152e'; ctx.beginPath(); ctx.arc(-15, -122, 3, 0, Math.PI * 2); ctx.arc(15, -122, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#58d7ce'; ctx.fillRect(-29, -92, 58, 67); ctx.fillStyle = '#a68cff'; ctx.fillRect(-5, -88, 10, 62);
  ctx.fillStyle = '#11132c'; ctx.fillRect(-40, -28, 29, 19); ctx.fillRect(11, -28, 29, 19);
  ctx.fillStyle = '#ff668d'; ctx.beginPath(); ctx.arc(0, -62, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♪', 0, -58);
  if (fighter.guard) { ctx.strokeStyle = 'rgba(166,140,255,.75)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-33, -86, 61, 1.9, 4.4); ctx.stroke(); }
  ctx.restore();
}

function drawAttackArc(fighter, now) {
  const move = fighter.attack.move; const progress = fighter.attack.elapsed / (move.startup + move.active + move.recovery); const active = fighter.attack.elapsed >= move.startup && fighter.attack.elapsed <= move.startup + move.active;
  ctx.save(); ctx.globalAlpha = active ? .85 : .30; ctx.strokeStyle = move.color; ctx.lineWidth = move.super ? 20 : move.label === 'HEAVY' ? 14 : 9; ctx.shadowColor = move.color; ctx.shadowBlur = active ? 24 : 8; ctx.beginPath(); const start = -1.1 + Math.min(1, progress) * .3; ctx.arc(28, -102, move.range * .68, start, start + (move.super ? 3.1 : 1.55)); ctx.stroke(); ctx.restore();
}

function drawSuperFlash(now) {
  const superFighter = [player, cpu].find((fighter) => fighter?.attack?.move.super);
  if (!superFighter) return;
  const progress = superFighter.attack.elapsed / (superFighter.attack.move.startup + superFighter.attack.move.active + superFighter.attack.move.recovery);
  const pulse = 1 + Math.sin(now * .035) * .12;
  ctx.save();
  ctx.globalAlpha = Math.max(.08, .30 - progress * .18);
  ctx.fillStyle = superFighter.character.accent;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.globalAlpha = .48;
  ctx.strokeStyle = superFighter.side === 'player' ? '#fff0a7' : '#eadcff';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(superFighter.x, superFighter.y - 125, 120 * pulse, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI * 2 * i) / 16 + now * .001;
    ctx.beginPath(); ctx.moveTo(superFighter.x + Math.cos(angle) * 90, superFighter.y - 125 + Math.sin(angle) * 90); ctx.lineTo(superFighter.x + Math.cos(angle) * 210, superFighter.y - 125 + Math.sin(angle) * 210); ctx.stroke();
  }
  ctx.restore();
}

function loop(now) {
  const rawDt = lastFrame ? (now - lastFrame) / 1000 : 1 / 60;
  const dt = Math.min(.034, Math.max(.001, rawDt));
  lastFrame = now;
  tick(dt);
  drawScene(now);
  justPressed.clear();
  requestAnimationFrame(loop);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (audioEnabled) ensureAudio();
  if (key === 'p') { event.preventDefault(); togglePause(); return; }
  if (['a', 'd', 'w', 's', 'j', 'k', 'l', 'i'].includes(key)) { event.preventDefault(); if (!keys.has(key)) justPressed.add(key); keys.add(key); }
  if (key === 'enter' && state === 'menu') showCharacterSelect('cpu');
}
function handleKeyUp(event) { const key = event.key.toLowerCase(); keys.delete(key); }

function wireControls() {
  window.addEventListener('keydown', handleKeyDown, { passive: false }); window.addEventListener('keyup', handleKeyUp);
  startButton.addEventListener('click', () => showCharacterSelect('cpu')); trainingButton.addEventListener('click', () => showCharacterSelect('training')); confirmCharacterButton.addEventListener('click', () => startMatch(selectionMode));
  playerSlotButton.addEventListener('click', () => { selectionTarget = 'player'; renderCharacterSelect(); }); cpuSlotButton.addEventListener('click', () => { selectionTarget = 'cpu'; renderCharacterSelect(); });
  backToTitleButton.addEventListener('click', showTitleScreen);
  audioButton.addEventListener('click', toggleAudio);
  pauseButton.addEventListener('click', togglePause);
  mobilePauseButton.addEventListener('click', togglePause);
  shareResultButton.addEventListener('click', shareResult);
  resetButton.addEventListener('click', resetMatch); rematchButton.addEventListener('click', () => startMatch(mode));
  document.querySelectorAll('[data-key]').forEach((button) => {
    const key = button.dataset.key;
    const press = (event) => { event.preventDefault(); if (!keys.has(key)) justPressed.add(key); keys.add(key); };
    const release = (event) => { event.preventDefault(); keys.delete(key); };
    button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release); button.addEventListener('pointerleave', release); button.addEventListener('pointercancel', release);
  });
}

resetMatch(); wireControls(); resizeCanvas(); window.addEventListener('resize', resizeCanvas); requestAnimationFrame(loop);
