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
const assistButton = document.getElementById('assistButton');
const startButton = document.getElementById('startButton');
const trainingButton = document.getElementById('trainingButton');
const arcadeButton = document.getElementById('arcadeButton');
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
const frameReadoutEl = document.getElementById('frameReadout');
const resultPanel = document.getElementById('resultPanel');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultHits = document.getElementById('resultHits');
const resultCombo = document.getElementById('resultCombo');
const resultGrade = document.getElementById('resultGrade');
const resultShards = document.getElementById('resultShards');
const resultScore = document.getElementById('resultScore');
const resultLogSummaryEl = document.getElementById('resultLogSummary');
const matchLogPanel = document.getElementById('matchLogPanel');
const matchLogFilterEl = document.getElementById('matchLogFilter');
const matchLogTimelineEl = document.getElementById('matchLogTimeline');
const matchLogCountEl = document.getElementById('matchLogCount');
const matchLogHintEl = document.getElementById('matchLogHint');
const matchLogDetailEl = document.getElementById('matchLogDetail');
const shareResultButton = document.getElementById('shareResultButton');
const nextArcadeButton = document.getElementById('nextArcadeButton');
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
const frameLabButton = document.getElementById('frameLabButton');
const punishDrillButton = document.getElementById('punishDrillButton');
const mixupDrillButton = document.getElementById('mixupDrillButton');
const characterTrialButton = document.getElementById('characterTrialButton');
const difficultySelect = document.getElementById('difficultySelect');
const trainingNote = document.getElementById('trainingNote');
const inputReadoutEl = document.getElementById('inputReadout');
const routeReadoutEl = document.getElementById('routeReadout');
const threatReadoutEl = document.getElementById('threatReadout');
const hitDirectionReadoutEl = document.getElementById('hitDirectionReadout');
const frameAdvantageReadoutEl = document.getElementById('frameAdvantageReadout');
const trialReadoutEl = document.getElementById('trialReadout');

const WORLD = { width: 1200, height: 600, ground: 486, gravity: 1900, roundSeconds: 60 };
const MOVE_SPEED = 315;
const JUMP_SPEED = 780;
const MAX_HEALTH = 1000;
const MAX_METER = 1000;
const PARRY_WINDOW = 0.115;
const DRIVE_BURST_COST = 300;
const keys = new Set();
const justPressed = new Set();
const lastDirectionPress = { a: 0, d: 0 };
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
  low: { key: 'n', label: 'LOW', startup: 105, active: 105, recovery: 220, damage: 52, range: 104, height: 82, knockback: 95, hitstun: 300, meter: 28, color: '#8ff0bd', low: true },
  overhead: { key: 'm', label: 'OVERHEAD', startup: 230, active: 120, recovery: 310, damage: 86, range: 112, height: 184, knockback: 160, hitstun: 420, meter: 38, color: '#fff0a7', overhead: true },
  throw: { key: 'u', label: 'THROW', startup: 110, active: 100, recovery: 340, damage: 120, range: 92, height: 132, knockback: 300, hitstun: 550, meter: 20, color: '#ffe07a', throw: true, knockdown: .72 },
  special: { key: 'l', label: 'DAYBREAK', startup: 250, active: 90, recovery: 310, damage: 145, range: 155, height: 164, knockback: 280, hitstun: 520, meter: -250, projectile: true, color: '#ff668d' },
  super: { key: 'i', label: 'OVERDRIVE', startup: 380, active: 170, recovery: 540, damage: 330, range: 250, height: 250, knockback: 460, hitstun: 760, meter: -1000, super: true, knockdown: .95, color: '#63f2ce' },
  burst: { key: 'o', label: 'DRIVE BURST', startup: 70, active: 140, recovery: 310, damage: 82, range: 148, height: 176, knockback: 500, hitstun: 460, meter: -DRIVE_BURST_COST, burst: true, color: '#fff0a7' }
};

const CHARACTER_ROSTER = {
  luna: { id: 'luna', name: 'LUNA', title: 'THE DAYBREAK AGENT', role: 'BALANCED', assetKey: 'luna', cardAssetKey: 'luna-overdrive-luna', accent: '#ff9d52', health: 1000, speed: 315, jump: 780, stats: [3, 3, 3, 3], tip: 'LUNA TIP：中距離を保ち、DAYBREAK RUSHで触りにいく。', moveTuning: { j: { label: 'SUN PUNCH', signature: 'sun-punch', dash: 24, damage: 48, range: 102, startup: 70, color: '#ffb347' }, l: { label: 'DAYBREAK RUSH', projectile: false, dash: 150, damage: 135, range: 132, startup: 210, recovery: 260, color: '#ff6682' }, i: { label: 'LUNA OVERDRIVE' } } },
  neko: { id: 'neko', name: 'NEKOMUSICA', title: 'THE RULE BREAKER', role: 'TRICKSTER', assetKey: 'neko', cardAssetKey: 'nekomusica-overdrive', accent: '#a68cff', health: 940, speed: 340, jump: 810, stats: [2, 4, 4, 2], tip: 'NEKO TIP：GLITCH TRAPを置き、相手の動線を奪う。', moveTuning: { j: { label: 'GLITCH CLAW', signature: 'glitch-claw', dash: 18, damage: 44, range: 112, startup: 74, color: '#a68cff' }, l: { label: 'GLITCH TRAP', trap: true, projectile: true, projectileSpeed: 0, life: 2.8, damage: 118, range: 178, color: '#a68cff' }, i: { label: 'RULE OVERRIDE', color: '#b28cff' } } },
  kagari: { id: 'kagari', name: 'KAGARI', title: 'THE SOLAR RUNNER', role: 'RUSHDOWN', assetKey: 'kagari', accent: '#ffb347', health: 930, speed: 395, jump: 820, stats: [4, 5, 2, 2], tip: 'KAGARI TIP：近づいて、ソーラーラッシュで一気に畳みかける。', moveTuning: { j: { label: 'SOLAR STEP', signature: 'solar-step', damage: 40, startup: 62, dash: 38 }, k: { damage: 92, startup: 145 }, l: { label: 'SOLAR RUSH', damage: 190, range: 132, startup: 205, recovery: 250, color: '#ffb347' }, i: { label: 'SUNSET BREAK', damage: 360, startup: 320, color: '#ffcf69' } } },
  mizuki: { id: 'mizuki', name: 'MIZUKI', title: 'THE WAVE CONDUCTOR', role: 'ZONER', assetKey: 'mizuki', accent: '#72dcff', health: 960, speed: 285, jump: 745, stats: [3, 2, 5, 3], tip: 'MIZUKI TIP：音波パネルを置いて、相手の動線を支配する。', moveTuning: { j: { damage: 48, range: 106 }, k: { damage: 118, range: 150 }, n: { label: 'PHASE LOW', signature: 'phase-low', damage: 58, range: 130, projectile: true, projectileSpeed: 520, life: 1.15, color: '#72dcff' }, l: { label: 'PHASE NOTE', damage: 178, range: 270, startup: 220, color: '#72dcff' }, i: { label: 'CRESCENDO NULL', damage: 300, range: 280, color: '#63f2ce' } } },
  bolt9: { id: 'bolt9', name: 'BOLT-9', title: 'THE FRIENDLY MACHINE', role: 'TANK', assetKey: 'bolt9', accent: '#63f2ce', health: 1120, speed: 240, jump: 650, stats: [5, 1, 2, 5], tip: 'BOLT-9 TIP：アーマー付きMAGNET ARMORで攻めを通す。', moveTuning: { j: { damage: 58, range: 86 }, k: { label: 'MAGNET HEAVY', signature: 'magnet-heavy', damage: 142, range: 118, startup: 205, armor: true }, l: { label: 'MAGNET ARMOR', armor: true, projectile: false, damage: 170, range: 135, startup: 220, recovery: 360, color: '#63f2ce' }, i: { label: 'CORE OVERLOAD', damage: 410, color: '#fff0a7' } } },
  vanta: { id: 'vanta', name: 'VANTA', title: 'THE MAGENTA FIEND', role: 'POWER', assetKey: 'vanta', accent: '#ff4fc3', health: 980, speed: 300, jump: 760, stats: [5, 2, 3, 4], tip: 'VANTA TIP：魔力を溜めて、一撃で相手の計算を壊す。', moveTuning: { j: { label: 'HEX MARK', signature: 'hex-mark', damage: 54, range: 112, startup: 105, color: '#ff4fc3' }, k: { damage: 135, range: 132 }, l: { label: 'HEX BURST', damage: 210, range: 180, color: '#ff4fc3' }, i: { label: 'ABYSSAL SCRIPT', damage: 430, color: '#ff4fc3' } } },
  sylfa: { id: 'sylfa', name: 'SYLFA', title: 'THE FOREST VECTOR', role: 'WIND', assetKey: 'sylfa', accent: '#8ff0bd', health: 900, speed: 370, jump: 850, stats: [2, 4, 5, 2], tip: 'SYLFA TIP：風の射線を作って、相手を近づけさせない。', moveTuning: { j: { damage: 42, range: 110 }, k: { damage: 86, range: 148 }, n: { label: 'WIND SLICE', signature: 'wind-slice', damage: 58, range: 150, startup: 90, color: '#8ff0bd' }, l: { label: 'WIND VEIL', damage: 165, range: 300, color: '#8ff0bd' }, i: { label: 'VERDANT ARIA', damage: 320, range: 315, color: '#8ff0bd' } } },
  ryuga: { id: 'ryuga', name: 'RYUGA', title: 'THE DRAGON CORE', role: 'DRAGON', assetKey: 'ryuga', accent: '#ff7a35', health: 1080, speed: 275, jump: 720, stats: [5, 2, 3, 5], tip: 'RYUGA TIP：炎を纏い、正面から相手を押し切る。', moveTuning: { j: { damage: 55, range: 100 }, k: { label: 'DRAGON CRUSH', signature: 'dragon-crush', armor: true, damage: 142, range: 136, startup: 220, recovery: 330, color: '#ff7a35' }, l: { label: 'DRAGON FLARE', damage: 200, range: 205, color: '#ff7a35' }, i: { label: 'RED COMET', damage: 390, color: '#ff7a35' } } },
  piko: { id: 'piko', name: 'PIKO', title: 'THE BOUNCE SLIME', role: 'CHAOS', assetKey: 'piko', accent: '#64e6e4', health: 880, speed: 360, jump: 900, stats: [3, 4, 4, 1], tip: 'PIKO TIP：跳ねて、読めない角度からバブルを投げる。', moveTuning: { j: { damage: 44, range: 120 }, k: { damage: 78, range: 112 }, m: { label: 'BOUNCE OVERHEAD', signature: 'bounce-overhead', dash: 64, damage: 82, range: 118 }, l: { label: 'BOUNCE BLOB', damage: 150, range: 240, color: '#64e6e4' }, i: { label: 'JELLY JAM', damage: 290, range: 260, color: '#64e6e4' } } },
  orbis: { id: 'orbis', name: 'ORBIS', title: 'THE STAR DRIFTER', role: 'COSMIC', assetKey: 'orbis', accent: '#b99aff', health: 910, speed: 310, jump: 860, stats: [3, 3, 5, 2], tip: 'ORBIS TIP：軌道をずらして、星片の角度で詰ませる。', moveTuning: { j: { damage: 46, range: 105 }, k: { damage: 104, range: 145 }, m: { label: 'ORBIT SHIFT', signature: 'orbit-shift', teleport: true, damage: 90, range: 120, startup: 190, color: '#b99aff' }, l: { label: 'ORBIT LANCE', damage: 185, range: 310, color: '#b99aff' }, i: { label: 'ECLIPSE LOOP', damage: 350, range: 330, color: '#b99aff' } } }
};
const CHARACTER_COMBO_ROUTES = {
  luna: { j: ['k'], k: ['l'], n: ['l'], m: ['l'] },
  neko: { j: ['n'], n: ['l'], k: ['l'] },
  kagari: { j: ['j', 'k'], k: ['l'] },
  mizuki: { j: ['n'], n: ['l'], m: ['l'] },
  bolt9: { j: ['k'], k: ['l'] },
  vanta: { j: ['m'], m: ['l'], k: ['l'] },
  sylfa: { j: ['n'], n: ['l'], m: ['l'] },
  ryuga: { j: ['k'], k: ['l'] },
  piko: { j: ['m', 'n'], n: ['l'], m: ['l'] },
  orbis: { j: ['n'], n: ['l'], m: ['l'] }
};
const CHARACTER_TRIALS = {
  luna: { label: 'DAYBREAK ROUTE', tip: 'J→K→LでDAYBREAKの基本連携。', steps: ['j', 'k', 'l'] },
  neko: { label: 'GLITCH LOW ROUTE', tip: 'J→N→LでLOWから罠へ。', steps: ['j', 'n', 'l'] },
  kagari: { label: 'SOLAR STEP ROUTE', tip: 'Jで踏み込み、K→Lで畳みかける。', steps: ['j', 'k', 'l'] },
  mizuki: { label: 'PHASE LOW ROUTE', tip: 'Nの音波からLへつなぐ。', steps: ['n', 'l'] },
  bolt9: { label: 'MAGNET ARMOR ROUTE', tip: 'Kのアーマーで触り、Lへ。', steps: ['k', 'l'] },
  vanta: { label: 'HEX OVERHEAD ROUTE', tip: 'J→M→Lで立ちガードを崩す。', steps: ['j', 'm', 'l'] },
  sylfa: { label: 'WIND ROUTE', tip: 'J→N→Lで間合いを維持する。', steps: ['j', 'n', 'l'] },
  ryuga: { label: 'DRAGON ROUTE', tip: 'J→K→Lで正面突破。', steps: ['j', 'k', 'l'] },
  piko: { label: 'BOUNCE BRANCH', tip: 'J→M→Lで跳ねて攻める。', steps: ['j', 'm', 'l'] },
  orbis: { label: 'ORBIT SHIFT ROUTE', tip: 'Mで位置を変えてLへ。', steps: ['m', 'l'] }
};
const ROSTER_ORDER = Object.keys(CHARACTER_ROSTER);
globalThis.LUNA_ROSTER = CHARACTER_ROSTER;
const PROJECTILE_STYLES = { luna: 'sun', neko: 'glitch', kagari: 'rush', mizuki: 'wave', bolt9: 'magnet', vanta: 'hex', sylfa: 'wind', ryuga: 'flame', piko: 'blob', orbis: 'orbit' };
const ARCADE_ROUTE = ['neko', 'kagari', 'mizuki', 'bolt9', 'vanta', 'ryuga', 'sylfa', 'piko', 'orbis'];
const CPU_STYLES = {
  BALANCED: { preferred: 170, approach: .72, attack: .64, guard: .24, parry: .06, throw: .10, special: .22, super: .08 },
  TRICKSTER: { preferred: 260, approach: .48, attack: .48, guard: .18, parry: .08, throw: .15, special: .36, super: .10 },
  RUSHDOWN: { preferred: 105, approach: 1, attack: .78, guard: .12, parry: .04, throw: .2, special: .28, super: .12 },
  ZONER: { preferred: 330, approach: .36, attack: .38, guard: .32, parry: .08, throw: .03, special: .52, super: .13 },
  TANK: { preferred: 135, approach: .58, attack: .52, guard: .52, parry: .13, throw: .09, special: .2, super: .1 },
  POWER: { preferred: 145, approach: .58, attack: .57, guard: .2, parry: .08, throw: .12, special: .3, super: .16 },
  WIND: { preferred: 300, approach: .42, attack: .4, guard: .28, parry: .08, throw: .05, special: .5, super: .12 },
  DRAGON: { preferred: 155, approach: .74, attack: .67, guard: .2, parry: .1, throw: .11, special: .34, super: .14 },
  CHAOS: { preferred: 210, approach: .58, attack: .54, guard: .16, parry: .07, throw: .18, special: .34, super: .11 },
  COSMIC: { preferred: 285, approach: .44, attack: .42, guard: .24, parry: .1, throw: .06, special: .44, super: .12 }
};
const CPU_DIFFICULTIES = {
  easy: { label: 'EASY', attack: .52, guard: .42, parry: .15, counter: 0, antiAir: 0, damage: .72, reaction: .48, telegraph: .34, timerMin: .42, timerRandom: .42 },
  normal: { label: 'NORMAL', attack: 1, guard: 1, parry: 1, counter: .45, antiAir: .45, damage: 1, reaction: 1, telegraph: .20, timerMin: .18, timerRandom: .38 },
  hard: { label: 'HARD', attack: 1.18, guard: 1.18, parry: 1.28, counter: 1, antiAir: 1, damage: 1.1, reaction: 1.18, telegraph: .08, timerMin: .10, timerRandom: .24 }
};

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
let cpuBrain = makeCpuBrain();
let selectedPlayerId = 'luna';
let selectedCpuId = 'neko';
let selectionTarget = 'player';
let selectionMode = 'cpu';
let pausedState = 'playing';
let audioEnabled = false;
let audioContext;
let arcadeIndex = 0;
let arcadeScore = 0;
let arcadeBank = 0;
let roundKoTimer = 0;
let gamepadPrevious = {};
let assistMode = true;
let frameLab = false;
let cpuDifficulty = 'easy';
let trainingRecord = [];
let trainingRecording = false;
let trainingReplay = false;
let trainingReplayIndex = 0;
let trainingDrill = false;
let trainingDrillTimer = 0;
let trainingMixup = false;
let trainingMixupStep = 0;
let trainingMixupTimer = 0;
let trainingMixupLabel = 'STAND GUARD';
let characterTrial = false;
let characterTrialStep = 0;
let characterTrialResult = '';
let matchLog = [];
let lastMatchLog = [];
let selectedMatchLogIndex = null;
let routeFeedback = '';
let routeFeedbackTimer = 0;

const PROFILE_KEY = 'luna-overdrive-profile-v3';
const DEFAULT_PROFILE = { wins: 0, losses: 0, bestCombo: 0, arcadeClears: 0, shards: 0, favorite: 'luna' };
let profile = loadProfile();

function makeCpuBrain() { return { timer: 0, move: 0, guard: false, crouch: false, jump: false, action: null, telegraph: 0, intent: 'NEUTRAL', punishTarget: null, okiState: null, okiOption: null }; }

function getAttackFrameSnapshot(fighter) {
  const attack = fighter?.attack;
  const move = attack?.move;
  if (!attack || !move) return { attackFrame: null, phase: fighter?.guard ? 'BLOCK' : 'NEUTRAL' };
  const elapsed = Math.max(0, attack.elapsed || 0);
  const frame = Math.floor(elapsed / 16.67);
  const phase = elapsed < move.startup ? 'STARTUP' : elapsed <= move.startup + move.active ? 'ACTIVE' : 'RECOVERY';
  return {
    attackFrame: frame,
    phase,
    startupFrames: Math.ceil(move.startup / 16.67),
    activeFrames: Math.ceil(move.active / 16.67),
    recoveryFrames: Math.ceil(move.recovery / 16.67)
  };
}

function recordMatchEvent(type, details = {}) {
  const { frameSnapshot = {}, ...eventDetails } = details;
  matchLog.push({ type, round, clock: Math.round(roundClock * 10) / 10, ...frameSnapshot, ...eventDetails });
  if (matchLog.length > 180) matchLog.shift();
}

function setCpuDecision(action, reason) {
  const changed = cpuBrain.action !== action || cpuBrain.reason !== reason;
  cpuBrain.action = action;
  cpuBrain.reason = reason;
  if (changed && action && cpu && state === 'playing') recordMatchEvent('CPU_DECISION', { actor: cpu.name, action, move: getMoveFor(cpu, action)?.label || action.toUpperCase(), reason });
}

function summarizeMatchLog() {
  const decisions = matchLog.filter((event) => event.type === 'CPU_DECISION');
  const decisionCounts = new Map();
  decisions.forEach((event) => decisionCounts.set(event.reason, (decisionCounts.get(event.reason) || 0) + 1));
  const topReasons = [...decisionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([reason, count]) => `${reason}×${count}`);
  const hits = matchLog.filter((event) => event.type === 'COMBAT' && ['HIT', 'COUNTER', 'PUNISH'].includes(event.result)).length;
  const blocks = matchLog.filter((event) => event.type === 'COMBAT' && event.result === 'BLOCK').length;
  const techs = matchLog.filter((event) => event.type === 'THROW_TECH').length;
  const okiReads = matchLog.filter((event) => event.type === 'OKI_READ').length;
  const rounds = matchLog.filter((event) => event.type === 'ROUND_RESULT').length;
  return `CPU READS：${topReasons.length ? topReasons.join(' / ') : '記録なし'}　・　OKI ${okiReads}　HIT ${hits}　BLOCK ${blocks}　TECH ${techs}　ROUND ${rounds}`;
}

function escapeLogText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function getMatchLogMessage(event) {
  if (event.type === 'ROUND_START') return `ROUND ${String(event.round).padStart(2, '0')} START / ${event.player} VS ${event.cpu}`;
  if (event.type === 'ROUND_RESULT') return `ROUND RESULT / ${event.winner} / SCORE ${event.playerRounds}-${event.cpuRounds}`;
  if (event.type === 'WAKEUP_OPTION') return `WAKEUP / ${event.actor} / ${event.option}`;
  if (event.type === 'OKI_READ') return `OKI READ / ${event.option} → ${event.reason}`;
  if (event.type === 'CPU_DECISION') return `CPU READ / ${event.reason} → ${event.move || event.action}`;
  if (event.type === 'THROW_TECH') return `THROW TECH / ${event.actor} ↔ ${event.target}${getMatchLogFrameEvidence(event)}`;
  if (event.type === 'COMBAT') return `${event.actor} → ${event.target} / ${event.move} / ${event.result}${event.damage ? ` / -${event.damage}` : ''}${getMatchLogFrameEvidence(event)}`;
  return event.type;
}

function getMatchLogFrameEvidence(event) {
  const evidence = [];
  if (Number.isFinite(event.attackFrame)) evidence.push(`F${event.attackFrame}`);
  if (event.phase && event.phase !== 'NEUTRAL') evidence.push(event.phase);
  if (Number.isFinite(event.playerAdvantage)) {
    const sign = event.playerAdvantage > 0 ? '+' : '';
    evidence.push(`YOU ${sign}${event.playerAdvantage}F`);
  }
  return evidence.length ? ` / ${evidence.join(' / ')}` : '';
}

function renderMatchLogDetail(event = null) {
  if (!matchLogDetailEl) return;
  if (!event) {
    matchLogDetailEl.textContent = 'SELECT AN EVENT TO INSPECT FRAME DATA';
    return;
  }
  const timing = Number.isFinite(event.startupFrames)
    ? `TIMING ${event.startupFrames}/${event.activeFrames}/${event.recoveryFrames}F`
    : 'TIMING --';
  const advantage = Number.isFinite(event.playerAdvantage)
    ? `YOU ${event.playerAdvantage > 0 ? '+' : ''}${event.playerAdvantage}F`
    : 'ADVANTAGE --';
  const frame = Number.isFinite(event.attackFrame) ? `F${event.attackFrame}` : 'FRAME --';
  const phase = event.phase || 'NEUTRAL';
  const reason = event.reason ? ` / ${event.reason}` : '';
  matchLogDetailEl.textContent = `${frame} / ${phase} / ${timing} / ${advantage}${reason}`;
}

function matchLogFilterMatches(event, filter) {
  if (filter === 'cpu') return event.type === 'CPU_DECISION' || event.type === 'OKI_READ';
  if (filter === 'combat') return event.type === 'COMBAT' || event.type === 'THROW_TECH';
  if (filter === 'round') return event.type === 'ROUND_START' || event.type === 'ROUND_RESULT';
  return true;
}

function renderMatchLogTimeline() {
  if (!matchLogTimelineEl) return;
  const source = lastMatchLog.length ? lastMatchLog : matchLog;
  const filter = matchLogFilterEl?.value || 'all';
  const visible = source.map((event, index) => ({ event, index })).filter(({ event }) => matchLogFilterMatches(event, filter));
  const recent = visible.slice(-40);
  if (selectedMatchLogIndex !== null && !visible.some(({ index }) => index === selectedMatchLogIndex)) selectedMatchLogIndex = null;
  if (matchLogCountEl) matchLogCountEl.textContent = `${visible.length} / ${source.length} EVENTS`;
  if (matchLogHintEl) matchLogHintEl.textContent = `LOCAL ONLY / click an event for frame data / newest ${Math.min(40, visible.length)}`;
  matchLogTimelineEl.innerHTML = recent.length
    ? recent.map(({ event, index }) => {
      const result = String(event.result || '').toLowerCase();
      const eventClass = ['CPU_DECISION', 'OKI_READ'].includes(event.type) ? 'is-read' : result === 'punish' ? 'is-punish' : result === 'counter' ? 'is-counter' : result === 'hit' ? 'is-hit' : ['block', 'parry'].includes(result) ? 'is-block' : '';
      const clock = Number.isFinite(event.clock) ? `${event.clock.toFixed(1)}s` : '--';
      const selectedClass = selectedMatchLogIndex === index ? ' is-selected' : '';
      return `<li class="${eventClass}${selectedClass}"><button class="match-log-event" type="button" data-log-index="${index}"><time>${escapeLogText(clock)}</time>${escapeLogText(getMatchLogMessage(event))}</button></li>`;
    }).join('')
    : '<li class="match-log-empty">このフィルターに該当するイベントはありません。</li>';
  const selectedEvent = selectedMatchLogIndex === null ? null : source[selectedMatchLogIndex];
  renderMatchLogDetail(selectedEvent || null);
}

function loadProfile() {
  try {
    const saved = JSON.parse(window.localStorage?.getItem(PROFILE_KEY) || 'null');
    return { ...DEFAULT_PROFILE, ...(saved || {}) };
  } catch (error) {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile() {
  try { window.localStorage?.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (error) { /* private browsing can disable storage */ }
}

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
  const sounds = { select: [440, .06, 'triangle', .022], hit: [130, .09, 'square', .032], counter: [205, .12, 'square', .038], punish: [88, .19, 'sawtooth', .046], block: [270, .08, 'triangle', .025], throw: [188, .12, 'square', .036], tech: [520, .10, 'triangle', .034], whiff: [92, .06, 'sine', .018], ko: [72, .32, 'sawtooth', .042], special: [240, .16, 'sawtooth', .028], super: [180, .25, 'sawtooth', .04], round: [330, .13, 'triangle', .03], win: [523, .18, 'triangle', .035], lose: [220, .22, 'sine', .03] };
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
  const message = `${winner.name}がLUNA OVERDRIVE 3.22で昼を奪った。GRADE ${resultGrade.textContent} / MAX COMBO ${resultCombo.textContent} / SHARDS ${resultShards.textContent}`;
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
    maxCombo: 0, hits: 0, comboDamageScale: 1, hurtFlash: 0, guard: false, crouching: false, grounded: true, downTimer: 0, knockdownTimer: 0, wakeupTimer: 0, throwInvuln: 0, throwTechWindow: 0, lastWakeupOption: 'AUTO', guardRecovery: 0, aiPulse: 0, inputBuffer: null, assistSequence: null, lastAttackResult: '--', lastHitDirection: '--', lastAdvantage: null,
    dashTimer: 0, dashDir: 0, dashCooldown: 0, parryTimer: 0, driveInvuln: 0, motionTime: 0
  };
}

function getMoveFor(fighter, key) {
  const base = Object.values(MOVES).find((candidate) => candidate.key === key);
  if (!base) return null;
  return { ...base, visual: PROJECTILE_STYLES[fighter?.character?.id] || 'energy', ...(fighter?.character?.moveTuning?.[key] || {}) };
}

function getComboRoute(fighter, key) {
  return CHARACTER_COMBO_ROUTES[fighter?.character?.id]?.[key] || null;
}

function getCharacterTrial(fighter = player) {
  return CHARACTER_TRIALS[fighter?.character?.id] || CHARACTER_TRIALS.luna;
}

function setInputReadout(key, label) {
  const names = { j: 'LIGHT', k: 'HEAVY', n: 'LOW', m: 'OVERHEAD', l: 'SPECIAL', i: 'OVERDRIVE', u: 'THROW', o: 'BURST', e: 'ASSIST' };
  inputReadoutEl.textContent = `INPUT: ${String(key).toUpperCase()} / ${label || names[key] || 'MOVE'}`;
}

function setRouteFeedback(message, duration = .9) {
  routeFeedback = message;
  routeFeedbackTimer = duration;
}

function routeKeys(keysToShow = []) {
  return keysToShow.map((key) => String(key).toUpperCase()).join('→');
}

function updateRouteReadout() {
  if (!routeReadoutEl) return;
  const trial = getCharacterTrial(player);
  const attack = player?.attack;
  const moveKey = attack?.move?.key;
  const nextKeys = moveKey ? getComboRoute(player, moveKey) : trial.steps;
  const route = routeKeys(nextKeys?.length ? nextKeys : trial.steps);
  const status = routeFeedbackTimer > 0 && routeFeedback ? routeFeedback : moveKey ? `NEXT ${route}` : `READY ${routeKeys(trial.steps)}`;
  routeReadoutEl.textContent = `ROUTE: ${status}`;
}

function resetTrainingDummy(preserveReplay = false) {
  if (mode !== 'training' || !cpu) return false;
  hitstop = 0;
  roundKoTimer = 0;
  projectiles.length = 0;
  trainingDrill = false;
  trainingDrillTimer = 0;
  trainingMixup = false;
  trainingMixupTimer = 0;
  characterTrial = false;
  characterTrialStep = 0;
  characterTrialResult = '';
  cpu = makeFighter('cpu', selectedCpuId);
  cpu.x = 880;
  cpu.facing = -1;
  state = 'playing';
  roundClock = WORLD.roundSeconds;
  if (!preserveReplay) { trainingReplay = false; trainingReplayIndex = 0; }
  showBanner('DUMMY RESET', 650);
  routeFeedback = '';
  routeFeedbackTimer = 0;
  threatReadoutEl.textContent = 'CPU: DUMMY / NO INPUT';
  updateHud();
  return true;
}

function armPunishDrill() {
  if (mode !== 'training' || !player || !cpu) return false;
  player.x = 500;
  player.facing = 1;
  cpu = makeFighter('cpu', selectedCpuId);
  cpu.x = 650;
  cpu.facing = -1;
  triggerAction(cpu, 'k');
  if (cpu.attack) {
    cpu.attack.move = { ...cpu.attack.move, recovery: 4000 };
    cpu.attack.hitDone = true;
    cpu.attack.result = 'whiff';
    cpu.attack.elapsed = cpu.attack.move.startup + cpu.attack.move.active + 80;
  }
  trainingDrillTimer = 4.0;
  threatReadoutEl.textContent = 'CPU: DRILL / HEAVY RECOVERY';
  return true;
}

function startPunishDrill() {
  if (mode !== 'training' || !player || !cpu) return false;
  trainingRecording = false;
  trainingReplay = false;
  trainingReplayIndex = 0;
  trainingDrill = true;
  trainingMixup = false;
  trainingMixupTimer = 0;
  characterTrial = false;
  characterTrialStep = 0;
  characterTrialResult = '';
  state = 'playing';
  roundClock = WORLD.roundSeconds;
  trainingNote.textContent = 'PUNISH DRILL：HEAVY空振り後。今すぐK／Lで咎め、成立後は追撃。';
  showBanner('PUNISH DRILL', 700);
  return armPunishDrill();
}

const MIXUP_DRILL_PATTERNS = [
  { label: 'STAND GUARD', crouching: false, tip: 'LOWかTHROWで崩す。OVERHEADは立ちガードに止まる。' },
  { label: 'CROUCH GUARD', crouching: true, tip: 'OVERHEADまたはTHROWで崩す。LOWはしゃがみガードに止まる。' },
  { label: 'STAND GUARD', crouching: false, tip: 'THROWで立ち／しゃがみガードを崩す。空中と起き上がり無敵には空振りする。' }
];

function armMixupDrill() {
  if (mode !== 'training' || !player || !cpu) return false;
  const pattern = MIXUP_DRILL_PATTERNS[trainingMixupStep % MIXUP_DRILL_PATTERNS.length];
  player.x = 500;
  player.facing = 1;
  cpu = makeFighter('cpu', selectedCpuId);
  cpu.x = 650;
  cpu.facing = -1;
  cpu.guard = true;
  cpu.crouching = pattern.crouching;
  cpu.state = 'block';
  trainingMixupLabel = pattern.label;
  trainingMixupTimer = 4.0;
  threatReadoutEl.textContent = `CPU: MIXUP / ${pattern.label}`;
  trainingNote.textContent = `MIXUP DRILL：${pattern.tip} 次のパターンまで約4秒。`;
  return true;
}

function startMixupDrill() {
  if (mode !== 'training' || !player || !cpu) return false;
  trainingRecording = false;
  trainingReplay = false;
  trainingReplayIndex = 0;
  trainingDrill = false;
  trainingDrillTimer = 0;
  trainingMixup = true;
  trainingMixupStep = 0;
  characterTrial = false;
  characterTrialStep = 0;
  characterTrialResult = '';
  state = 'playing';
  roundClock = WORLD.roundSeconds;
  showBanner('MIXUP DRILL', 700);
  return armMixupDrill();
}

function startCharacterTrial() {
  if (mode !== 'training' || !player || !cpu) return false;
  trainingRecording = false;
  trainingReplay = false;
  trainingReplayIndex = 0;
  trainingDrill = false;
  trainingDrillTimer = 0;
  trainingMixup = false;
  trainingMixupTimer = 0;
  characterTrial = true;
  characterTrialStep = 0;
  characterTrialResult = '';
  player.x = 500;
  player.facing = 1;
  cpu = makeFighter('cpu', selectedCpuId);
  cpu.x = 650;
  cpu.facing = -1;
  state = 'playing';
  roundClock = WORLD.roundSeconds;
  const trial = getCharacterTrial();
  trainingNote.textContent = `CHARACTER TRIAL：${trial.tip} 期待順：${trial.steps.map((key) => key.toUpperCase()).join('→')}`;
  showBanner(`${player.name} TRIAL`, 700);
  updateHud();
  return true;
}

function updateCharacterTrial(attacker, move, impactType, guarding) {
  if (mode !== 'training' || !characterTrial || attacker?.side !== 'player' || guarding) return;
  const trial = getCharacterTrial(attacker);
  const expected = trial.steps[characterTrialStep];
  if (!expected) return;
  if (move?.key === expected && ['HIT', 'COUNTER', 'PUNISH'].includes(impactType)) {
    characterTrialStep += 1;
    if (characterTrialStep >= trial.steps.length) {
      characterTrial = false;
      characterTrialResult = `${trial.label} / CLEAR`;
      trainingNote.textContent = `TRIAL CLEAR：${trial.label}。Rで再挑戦。`;
      showBanner('TRIAL CLEAR', 900);
      showHitConfirm('TRIAL CLEAR');
    } else {
      const next = trial.steps[characterTrialStep];
      trainingNote.textContent = `TRIAL ${characterTrialStep}/${trial.steps.length}：次は${next.toUpperCase()}。`;
      showHitConfirm(`TRIAL ${characterTrialStep}/${trial.steps.length}`);
    }
  } else if (move?.key && move.key !== expected) {
    characterTrialStep = 0;
    trainingNote.textContent = `TRIAL MISS：${expected.toUpperCase()}から再開。`;
    showHitConfirm('TRIAL MISS');
  }
  updateHud();
}

function toggleTrainingRecord() {
  if (mode !== 'training') return false;
  trainingRecording = !trainingRecording;
  if (trainingRecording) { trainingRecord = []; trainingReplay = false; trainingReplayIndex = 0; showBanner('RECORD START', 650); }
  else showBanner(`RECORD SAVED / ${trainingRecord.length}f`, 800);
  trainingNote.textContent = trainingRecording ? 'RECORDING：Tで停止・Yで再生' : `TRAINING：${trainingRecord.length}フレーム保存済み／T記録・Y再生・Rリセット`;
  return true;
}

function toggleTrainingReplay() {
  if (mode !== 'training' || !trainingRecord.length) { if (mode === 'training') showHitConfirm('NO RECORD'); return false; }
  trainingDrill = false;
  trainingDrillTimer = 0;
  trainingMixup = false;
  trainingMixupTimer = 0;
  trainingReplay = !trainingReplay;
  trainingRecording = false;
  trainingReplayIndex = 0;
  if (trainingReplay) { resetTrainingDummy(true); trainingReplay = true; trainingReplayIndex = 0; showBanner('REPLAY START', 700); }
  else showBanner('REPLAY STOP', 600);
  trainingNote.textContent = trainingReplay ? 'REPLAYING：Yで停止・Rでダミーリセット' : `TRAINING：${trainingRecord.length}フレーム保存済み／T記録・Y再生・Rリセット`;
  return true;
}

function renderCharacterSelect() {
  characterGrid.innerHTML = ROSTER_ORDER.map((id) => {
    const character = CHARACTER_ROSTER[id];
    const statBars = character.stats.map((value) => `<i class="${value >= 1 ? 'is-on' : ''}"></i>`).join('');
    const selectedClass = `${selectedPlayerId === id ? ' is-player' : ''}${selectedCpuId === id ? ' is-cpu' : ''}${selectionTarget === 'player' && selectedPlayerId === id || selectionTarget === 'cpu' && selectedCpuId === id ? ' is-target' : ''}`;
    return `<button class="character-card${selectedClass}" data-character="${id}" type="button" aria-label="${character.name} / ${character.role} / 攻撃${character.stats[0]} 速度${character.stats[1]} 射程${character.stats[2]} 防御${character.stats[3]}"><img src="assets/${character.cardAssetKey || character.assetKey}.png" alt="${character.name}"><span class="character-card-copy"><small>${character.title}</small><strong>${character.name}</strong><em>${character.role}</em><span class="mini-stats" aria-label="攻撃・速度・射程・防御">${statBars}</span></span></button>`;
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
  difficultySelect.disabled = selectionMode === 'training';
  trainingNote.textContent = selectionMode === 'training' ? 'TRAINING：CPU停止・T記録・Y再生・F判定表示・Rダミーリセット' : 'EASYは攻撃予兆つき。NORMAL／HARDは反応と圧力が上がる。';
}

function chooseCharacter(characterId) {
  if (selectionTarget === 'player') selectedPlayerId = characterId;
  else selectedCpuId = characterId;
  playSfx('select');
  renderCharacterSelect();
}

function showCharacterSelect(selectedMode) {
  selectionMode = selectedMode;
  cpuDifficulty = difficultySelect.value || cpuDifficulty;
  titleIntro.hidden = true;
  characterSelectPanel.hidden = false;
  renderCharacterSelect();
}

function readGamepad() {
  const pad = navigator.getGamepads?.()[0];
  if (!pad) { gamepadPrevious = {}; return { left: false, right: false, pausePressed: false }; }
  const buttons = {};
  const mapping = { jump: 0, guard: 1, j: 2, k: 3, l: 4, i: 5, u: 6, o: 7, pause: 9 };
  Object.entries(mapping).forEach(([name, index]) => { buttons[name] = !!pad.buttons[index]?.pressed; });
  const pressed = (name) => buttons[name] && !gamepadPrevious[name];
  if (pressed('jump')) justPressed.add('w');
  ['j', 'k', 'l', 'i', 'u', 'o'].forEach((key) => { if (pressed(key)) justPressed.add(key); });
  const result = { left: (pad.axes?.[0] || 0) < -.28, right: (pad.axes?.[0] || 0) > .28, guard: buttons.guard, parry: !!pressed('guard'), pausePressed: !!pressed('pause') };
  gamepadPrevious = buttons;
  return result;
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
  matchLog = [];
  lastMatchLog = [];
  selectedMatchLogIndex = null;
  characterTrial = false;
  characterTrialStep = 0;
  characterTrialResult = '';
  pausedState = 'playing';
  cpuBrain = makeCpuBrain();
  player = makeFighter('player', selectedPlayerId);
  cpu = makeFighter('cpu', selectedCpuId);
  roundKoTimer = 0;
  frameAdvantageReadoutEl.textContent = 'FRAME ADVANTAGE: --';
  routeFeedback = '';
  routeFeedbackTimer = 0;
  if (trialReadoutEl) trialReadoutEl.textContent = 'TRIAL: OFF';
  round = 1;
  playerRounds = 0;
  cpuRounds = 0;
  totalHits = 0;
  maxCombo = 0;
  arcadeScore = 0;
  arcadeBank = 0;
  roundClock = WORLD.roundSeconds;
  roundStateEl.textContent = 'READY';
  roundNumberEl.textContent = '01';
  timerEl.textContent = '60';
  announcerEl.textContent = 'THE SUN IS ONLINE';
  comboReadoutEl.textContent = 'NO COMBO';
  inputReadoutEl.textContent = 'INPUT: --';
  if (routeReadoutEl) routeReadoutEl.textContent = 'ROUTE: READY J→K→L';
  threatReadoutEl.textContent = 'CPU: READY';
  hitDirectionReadoutEl.textContent = 'HIT DIRECTION: --';
  frameAdvantageReadoutEl.textContent = 'FRAME ADVANTAGE: --';
  tipReadoutEl.textContent = player.character.tip;
  frameReadoutEl.textContent = `FRAME LAB: ${frameLab ? 'ON' : 'OFF'}`;
  frameLabButton.textContent = `FRAME LAB: ${frameLab ? 'ON' : 'OFF'}`;
  frameLabButton.classList.toggle('is-on', frameLab);
  frameLabButton.setAttribute('aria-pressed', String(frameLab));
  resultPanel.hidden = true;
  shareResultButton.textContent = 'SHARE RESULT ↗';
  nextArcadeButton.hidden = true;
  resultShards.textContent = '0';
  resultScore.textContent = '0';
  if (resultLogSummaryEl) resultLogSummaryEl.textContent = 'FIGHT LOG：まだ記録なし';
  if (matchLogPanel) matchLogPanel.open = false;
  renderMatchLogTimeline();
  rematchButton.textContent = 'REMATCH →';
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
  cpuDifficulty = difficultySelect.value || cpuDifficulty;
  trainingRecording = false;
  trainingReplay = false;
  trainingReplayIndex = 0;
  trainingDrill = false;
  trainingDrillTimer = 0;
  trainingMixup = false;
  trainingMixupTimer = 0;
  characterTrial = false;
  characterTrialStep = 0;
  characterTrialResult = '';
  if (mode !== 'training') trainingRecord = [];
  if (mode === 'arcade') { arcadeIndex = 0; selectedCpuId = ARCADE_ROUTE[arcadeIndex]; }
  profile.favorite = selectedPlayerId;
  saveProfile();
  resetMatch();
  titleOverlay.hidden = true;
  document.body.classList.add('is-playing');
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
  startRound();
}

function startRound() {
  state = 'countdown';
  cpuBrain = makeCpuBrain();
  player = makeFighter('player', selectedPlayerId);
  cpu = makeFighter('cpu', selectedCpuId);
  roundKoTimer = 0;
  if (mode === 'arcade' && arcadeIndex > 0 && round === 1) player.meter = arcadeBank;
  roundClock = WORLD.roundSeconds;
  recordMatchEvent('ROUND_START', { player: player.name, cpu: cpu.name });
  roundStartedAt = performance.now();
  roundNumberEl.textContent = String(round).padStart(2, '0');
  roundStateEl.textContent = 'ROUND ' + round;
  announcerEl.textContent = mode === 'training' ? `TRAINING / ${player.name} VS ${cpu.name}` : mode === 'arcade' ? `ARCADE ${arcadeIndex + 1} / ${ARCADE_ROUTE.length}・NEXT ${cpu.name}` : 'FIRST TO TWO ROUNDS';
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

function toggleFrameLab() {
  frameLab = !frameLab;
  frameReadoutEl.textContent = `FRAME LAB: ${frameLab ? 'ON' : 'OFF'}`;
  frameLabButton.textContent = `FRAME LAB: ${frameLab ? 'ON' : 'OFF'}`;
  frameLabButton.classList.toggle('is-on', frameLab);
  frameLabButton.setAttribute('aria-pressed', String(frameLab));
  if (frameLab && mode !== 'training') showHitConfirm('FRAME LAB / TRAINING推奨');
  else showHitConfirm(frameLab ? 'FRAME DATA ON' : 'FRAME DATA OFF');
}

function updateHud() {
  routeFeedbackTimer = Math.max(0, routeFeedbackTimer - (1 / 60));
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
  comboReadoutEl.textContent = player?.combo > 0 ? `${player.combo} HIT COMBO / ${Math.round((player.comboDamageScale || 1) * 100)}% DMG / ${Math.round(player.comboTimer * 10) / 10}s` : 'NO COMBO';
  updateRouteReadout();
  if (player?.lastAdvantage !== null && player?.lastAdvantage !== undefined) {
    const sign = player.lastAdvantage > 0 ? '+' : '';
    frameAdvantageReadoutEl.textContent = `FRAME ADVANTAGE: ${sign}${player.lastAdvantage}F`;
  }
  if (mode === 'training' && trainingDrill) threatReadoutEl.textContent = cpu?.attack ? 'CPU: DRILL / HEAVY RECOVERY' : 'CPU: DRILL / RESETTING';
  else if (mode === 'training' && trainingMixup) threatReadoutEl.textContent = `CPU: MIXUP / ${trainingMixupLabel}`;
  else if (mode === 'training') threatReadoutEl.textContent = 'CPU: DUMMY / NO INPUT';
  else if (cpuBrain.intent === 'OKI') threatReadoutEl.textContent = `CPU: OKI / ${cpuBrain.action ? getMoveFor(cpu, cpuBrain.action)?.label || 'MEATY' : 'APPROACH'} / ${cpuBrain.reason || 'SETUP'}`;
  else if (cpu?.state === 'telegraph') threatReadoutEl.textContent = `CPU: ${cpuBrain.action ? getMoveFor(cpu, cpuBrain.action)?.label || 'ATTACK' : 'ATTACK'} INCOMING / ${cpuBrain.reason || 'READ'}`;
  else threatReadoutEl.textContent = `CPU: ${CPU_DIFFICULTIES[cpuDifficulty]?.label || 'EASY'} / ${cpuBrain.reason || 'NEUTRAL'}`;
  if (punishDrillButton) punishDrillButton.hidden = mode !== 'training';
  if (mixupDrillButton) mixupDrillButton.hidden = mode !== 'training';
  if (characterTrialButton) characterTrialButton.hidden = mode !== 'training';
  if (trialReadoutEl) {
    const trial = getCharacterTrial();
    trialReadoutEl.textContent = characterTrial
      ? `TRIAL: ${trial.label} / ${characterTrialStep}/${trial.steps.length}`
      : characterTrialResult || 'TRIAL: OFF';
  }
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

function readPlayerInput(gamepad = {}) {
  return { left: keys.has('a') || gamepad.left ? 1 : 0, right: keys.has('d') || gamepad.right ? 1 : 0, jump: justPressed.has('w'), crouch: keys.has('c'), guard: keys.has('s') || gamepad.guard, parry: justPressed.has('s') || gamepad.parry, assist: justPressed.has('e') };
}

function consumeActions(fighter) {
  if (fighter.side !== 'player') return;
  if (justPressed.has('o')) triggerDriveBurst(fighter);
  if (justPressed.has('e') && assistMode) triggerAssistCombo(fighter);
  ['j', 'k', 'n', 'm', 'l', 'i', 'u'].forEach((key) => {
    if (!justPressed.has(key)) return;
    setInputReadout(key);
    if (fighter.attack || fighter.hitstun > 0 || fighter.blockstun > 0) {
      fighter.inputBuffer = { key, ttl: .2 };
      setRouteFeedback(`${key.toUpperCase()} / QUEUED`, .34);
    }
    else triggerAction(fighter, key);
  });
}

function triggerAssistCombo(fighter) {
  if (!fighter || fighter.attack || fighter.health <= 0 || fighter.hitstun > 0 || fighter.blockstun > 0 || !fighter.grounded) return false;
  const finalKey = fighter.meter >= 250 ? 'l' : 'k';
  fighter.assistSequence = ['j', 'k', finalKey];
  if (!triggerAction(fighter, fighter.assistSequence.shift())) {
    fighter.assistSequence = null;
    return false;
  }
  showHitConfirm('ASSIST COMBO');
  return true;
}

function triggerDriveBurst(fighter) {
  if (!fighter || fighter.health <= 0 || fighter.attack || fighter.knockdownTimer > 0 || fighter.wakeupTimer > 0 || fighter.meter < DRIVE_BURST_COST) {
    if (fighter?.side === 'player' && fighter?.meter < DRIVE_BURST_COST) showHitConfirm('NEED 300 DRIVE');
    return false;
  }
  const move = getMoveFor(fighter, 'o');
  fighter.meter -= DRIVE_BURST_COST;
  fighter.hitstun = 0;
  fighter.blockstun = 0;
  fighter.parryTimer = 0;
  fighter.driveInvuln = .24;
  fighter.assistSequence = null;
  fighter.attack = { move, elapsed: 0, hitDone: false, spawned: false, teleported: false, result: null };
  fighter.state = 'burst';
  fighter.vx = 0;
  showBanner(`${fighter.name} DRIVE BURST`, 650);
  addBurst(fighter.x, fighter.y - 110, move.color, 18);
  playSfx('super');
  return true;
}

function triggerAction(fighter, key) {
  const airAttack = !fighter?.grounded && ['j', 'k'].includes(key);
  if (!fighter || fighter.health <= 0 || fighter.attack || fighter.knockdownTimer > 0 || fighter.wakeupTimer > 0 || fighter.hitstun > 0 || fighter.blockstun > 0 || fighter.guardRecovery > 0 || (!fighter.grounded && !airAttack)) return false;
  const baseMove = getMoveFor(fighter, key);
  const move = airAttack ? { ...baseMove, label: `AIR ${baseMove.label}`, damage: Math.round(baseMove.damage * .9), hitstun: baseMove.hitstun + 40, air: true } : fighter.side === 'cpu' && baseMove && !baseMove.super ? { ...baseMove, damage: Math.round(baseMove.damage * (CPU_DIFFICULTIES[cpuDifficulty]?.damage || 1)) } : baseMove;
  if (!move) return false;
  if (fighter.meter < Math.max(0, -move.meter)) {
    if (fighter.side === 'player') { showHitConfirm('NEED MORE DAYLIGHT'); addFloatingText(fighter.x, fighter.y - 170, 'NEED ' + Math.abs(move.meter) + ''); }
    return false;
  }
  fighter.attack = { move, elapsed: 0, hitDone: false, spawned: false, teleported: false, result: null };
  fighter.lastAttackResult = 'STARTUP';
  if (fighter.side === 'player') setInputReadout(key, move.label);
  fighter.state = move.super ? 'super' : 'attack';
  fighter.meter = Math.max(0, fighter.meter + move.meter);
  fighter.vx = 0;
  if (move.super) { showBanner(`${fighter.name} OVERDRIVE`, 820); playSfx('super'); addBurst(fighter.x, fighter.y - 130, move.color, 16); }
  else if (move.projectile) playSfx('special');
  return true;
}

function setAttackResult(attacker, result) {
  if (!attacker) return;
  if (attacker.attack) attacker.attack.result = result;
  attacker.lastAttackResult = result.toUpperCase();
}

function updateFighter(fighter, opponent, input, dt) {
  if (!fighter) return;
  if (fighter.health <= 0) {
    fighter.downTimer = Math.max(0, fighter.downTimer - dt);
    fighter.state = 'down';
    fighter.vx = 0;
    fighter.vy = 0;
    return;
  }
  fighter.motionTime += dt;
  if (fighter.inputBuffer) { fighter.inputBuffer.ttl -= dt; if (fighter.inputBuffer.ttl <= 0) fighter.inputBuffer = null; }
  fighter.hurtFlash = Math.max(0, fighter.hurtFlash - dt);
  fighter.dashTimer = Math.max(0, fighter.dashTimer - dt);
  fighter.dashCooldown = Math.max(0, fighter.dashCooldown - dt);
  fighter.parryTimer = Math.max(0, fighter.parryTimer - dt);
  fighter.driveInvuln = Math.max(0, fighter.driveInvuln - dt);
  fighter.throwInvuln = Math.max(0, fighter.throwInvuln - dt * 1000);
  fighter.throwTechWindow = Math.max(0, fighter.throwTechWindow - dt * 1000);
  fighter.wakeupTimer = Math.max(0, fighter.wakeupTimer - dt * 1000);
  fighter.guardRecovery = Math.max(0, fighter.guardRecovery - dt * 1000);
  fighter.hitstun = Math.max(0, fighter.hitstun - dt * 1000);
  fighter.blockstun = Math.max(0, fighter.blockstun - dt * 1000);
  fighter.comboTimer = Math.max(0, fighter.comboTimer - dt);
  if (fighter.comboTimer === 0) { fighter.combo = 0; fighter.comboDamageScale = 1; }
  if (fighter.state === 'knockdown') {
    fighter.knockdownTimer = Math.max(0, fighter.knockdownTimer - dt * 1000);
    fighter.grounded = true;
    fighter.vx *= Math.pow(.02, dt);
    fighter.vy = 0;
    const wakeupRoll = fighter.side === 'player' && (input.wakeupLeft || input.wakeupRight);
    const wakeupQuick = fighter.side === 'player' && input.jump;
    if (fighter.side === 'player' && fighter.knockdownTimer > 120 && (wakeupRoll || wakeupQuick)) {
      const rollDirection = input.wakeupLeft ? -1 : input.wakeupRight ? 1 : 0;
      const option = rollDirection ? (rollDirection === fighter.facing ? 'FORWARD ROLL' : 'BACK ROLL') : 'QUICK RISE';
      fighter.knockdownTimer = 0;
      fighter.state = 'wakeup';
      fighter.wakeupTimer = rollDirection ? 240 : 180;
      fighter.throwInvuln = rollDirection ? 520 : 460;
      fighter.grounded = true;
      fighter.guard = false;
      fighter.crouching = false;
      fighter.vx = 0;
      if (rollDirection) fighter.x = Math.max(70, Math.min(WORLD.width - 70, fighter.x + rollDirection * 120));
      fighter.lastWakeupOption = option;
      recordMatchEvent('WAKEUP_OPTION', { actor: fighter.name, option, reason: rollDirection ? 'ROLL' : 'QUICK RISE' });
      addBurst(fighter.x, fighter.y - 92, fighter.character.accent, rollDirection ? 9 : 6);
      addFloatingText(fighter.x, fighter.y - 180, option);
      showHitConfirm(option);
      showBanner(option, 520);
      return;
    }
    if (fighter.knockdownTimer <= 0) {
      fighter.state = 'wakeup';
      fighter.wakeupTimer = 300;
      fighter.throwInvuln = 420;
      fighter.lastWakeupOption = 'AUTO';
      fighter.guard = false;
      fighter.crouching = false;
      addFloatingText(fighter.x, fighter.y - 180, 'WAKE UP');
    } else return;
  }
  if (fighter.wakeupTimer > 0) {
    fighter.state = 'wakeup';
    fighter.grounded = true;
    fighter.vx = 0;
    fighter.vy = 0;
    return;
  }
  const armorActive = fighter.attack?.move.armor && fighter.attack.elapsed >= fighter.attack.move.startup * .55 && fighter.attack.elapsed <= fighter.attack.move.startup + fighter.attack.move.active;
  if (armorActive && fighter.hitstun > 0) {
    fighter.hitstun = 0;
    fighter.hurtFlash = .05;
    addFloatingText(fighter.x, fighter.y - 185, 'ARMOR');
  }
  if (fighter.hitstun > 0 || fighter.blockstun > 0 || fighter.guardRecovery > 0) {
    fighter.vx *= Math.pow(.02, dt);
    fighter.state = fighter.guardRecovery > 0 ? 'guard-recovery' : fighter.blockstun > 0 ? 'block' : 'hit';
  } else if (fighter.attack) {
    updateAttack(fighter, opponent, dt);
  } else {
    let bufferedStarted = false;
    if (fighter.inputBuffer && fighter.grounded) {
      const bufferedKey = fighter.inputBuffer.key;
      fighter.inputBuffer = null;
      bufferedStarted = bufferedKey === 'o' ? triggerDriveBurst(fighter) : triggerAction(fighter, bufferedKey);
      if (bufferedStarted) setRouteFeedback(`START ${bufferedKey.toUpperCase()}`, .45);
    }
    if (!bufferedStarted) {
      fighter.guard = !!input.guard && fighter.grounded;
      fighter.crouching = !!input.crouch && fighter.grounded;
      if (fighter.guard && input.parry) {
        fighter.parryTimer = PARRY_WINDOW;
        fighter.state = 'parry';
        addBurst(fighter.x + fighter.facing * 34, fighter.y - 100, '#fff0a7', 5);
      }
      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const dashDirection = input.dashLeft ? -1 : input.dashRight ? 1 : 0;
      if (!fighter.guard && fighter.dashTimer <= 0 && dashDirection && fighter.dashCooldown <= 0) {
        fighter.dashDir = dashDirection;
        fighter.dashTimer = .12;
        fighter.dashCooldown = .32;
        fighter.vx = fighter.dashDir * 900;
        fighter.state = 'dash';
      } else if (!fighter.guard && fighter.dashTimer > 0) {
        fighter.vx = fighter.dashDir * 900;
        fighter.state = 'dash';
      } else if (!fighter.guard) {
        fighter.vx = direction * fighter.character.speed;
        if (input.jump && fighter.grounded) { fighter.vy = -fighter.character.jump; fighter.grounded = false; }
      } else {
        fighter.vx = 0;
      }
      fighter.state = fighter.dashTimer > 0 ? 'dash' : fighter.parryTimer > 0 ? 'parry' : fighter.guard ? 'block' : fighter.crouching ? 'crouch' : (fighter.grounded ? (direction ? 'walk' : 'idle') : 'jump');
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
  if (fighter.side === 'cpu') {
    fighter.guard = fighter.state === 'block';
    if (cpuBrain.telegraph > 0 && !fighter.attack) fighter.state = 'telegraph';
  }
}

function updateAttack(fighter, opponent, dt) {
  const attack = fighter.attack;
  attack.elapsed += dt * 1000;
  const move = attack.move;
  const activeStart = move.startup;
  const activeEnd = move.startup + move.active;
  if (move.projectile && !attack.spawned && attack.elapsed >= activeStart) {
    attack.spawned = true;
    projectiles.push({ owner: fighter, move, x: fighter.x + fighter.facing * 70, y: fighter.y - 120, vx: fighter.facing * (move.projectileSpeed ?? 520), radius: move.super ? 62 : (move.trap ? 34 : 29), damage: move.damage, life: move.life || 1.9, color: move.color, super: move.super, trap: move.trap });
    addBurst(fighter.x + fighter.facing * 58, fighter.y - 120, move.color, move.super ? 18 : 8);
  }
  if (move.dash && !attack.dashed && attack.elapsed >= activeStart) {
    attack.dashed = true;
    fighter.x = Math.max(70, Math.min(WORLD.width - 70, fighter.x + fighter.facing * move.dash));
    addBurst(fighter.x - fighter.facing * 42, fighter.y - 110, move.color, 8);
  }
  if (move.teleport && !attack.teleported && attack.elapsed >= activeStart) {
    attack.teleported = true;
    const previousX = fighter.x;
    fighter.x = Math.max(70, Math.min(WORLD.width - 70, opponent.x + fighter.facing * 92));
    fighter.facing = opponent.x >= fighter.x ? 1 : -1;
    addBurst(previousX, fighter.y - 110, move.color, 7);
    addBurst(fighter.x, fighter.y - 110, move.color, 10);
    addFloatingText(fighter.x, fighter.y - 180, 'ORBIT SHIFT');
  }
  if (!attack.hitDone && attack.elapsed >= activeStart && attack.elapsed <= activeEnd) {
    if (move.super) addBurst(fighter.x + fighter.facing * 120, fighter.y - 128, move.color, 2);
    if (!move.projectile) resolveMeleeHit(fighter, opponent, move);
  }
  if (fighter.assistSequence && attack.hitDone && attack.elapsed >= activeEnd + 24 && !move.super) {
    const bufferedKey = fighter.assistSequence.shift();
    fighter.attack = null;
    if (bufferedKey && triggerAction(fighter, bufferedKey)) {
      addFloatingText(fighter.x, fighter.y - 182, 'ASSIST');
      if (!fighter.assistSequence.length) fighter.assistSequence = null;
      return;
    }
    fighter.assistSequence = null;
  }
  const confirmed = attack.result === 'hit' || attack.result === 'block';
  const normalMove = ['j', 'k', 'n', 'm'].includes(move.key);
  const bufferedComboKey = fighter.inputBuffer?.key;
  const bufferedNormal = ['j', 'k', 'n', 'm'].includes(bufferedComboKey);
  const comboRoute = getComboRoute(fighter, move.key);
  const chainReady = attack.result === 'hit' && normalMove && bufferedNormal && (!comboRoute || comboRoute.includes(bufferedComboKey)) && attack.elapsed >= activeEnd + 24 && attack.elapsed <= activeEnd + 120;
  const specialCancelReady = fighter.inputBuffer?.key === 'l' && normalMove && confirmed && attack.elapsed >= activeEnd - 20 && attack.elapsed <= activeEnd + 120;
  if (fighter.inputBuffer && (chainReady || specialCancelReady) && !move.super) {
    const bufferedKey = fighter.inputBuffer.key;
    const previousAttack = fighter.attack;
    fighter.inputBuffer = null;
    fighter.attack = null;
    if (triggerAction(fighter, bufferedKey)) {
      addFloatingText(fighter.x, fighter.y - 182, bufferedKey === 'l' ? 'SPECIAL CANCEL' : `ROUTE ${bufferedKey.toUpperCase()}`);
      setRouteFeedback(bufferedKey === 'l' ? 'SPECIAL CANCEL ✓' : `CHAIN ${bufferedKey.toUpperCase()} ✓`, 1.05);
      return;
    }
    fighter.attack = previousAttack;
  }
  if (attack.elapsed >= activeEnd + move.recovery) {
    if (!attack.result) {
      setAttackResult(fighter, 'whiff');
      if (['j', 'k', 'n', 'm', 'u'].includes(move.key)) addFloatingText(fighter.x + fighter.facing * 58, fighter.y - 174, 'WHIFF');
    }
    fighter.attack = null;
    fighter.assistSequence = null;
    fighter.state = 'idle';
  }
}

function bodyBox(fighter) {
  if (fighter.crouching && fighter.grounded) return { x: fighter.x - 35, y: fighter.y - 112, w: 70, h: 112 };
  return { x: fighter.x - 35, y: fighter.y - 158, w: 70, h: 158 };
}

function meleeBox(fighter, move) {
  const x = fighter.facing === 1 ? fighter.x + 20 : fighter.x - 20 - move.range;
  return { x, y: fighter.y - move.height, w: move.range, h: move.height - 20 };
}

function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function resolvePushbox(leftFighter, rightFighter) {
  if (!leftFighter || !rightFighter || !leftFighter.grounded || !rightFighter.grounded) return;
  if (leftFighter.health <= 0 || rightFighter.health <= 0) return;
  if (leftFighter.x > rightFighter.x) [leftFighter, rightFighter] = [rightFighter, leftFighter];
  const minimumDistance = 76;
  const distance = rightFighter.x - leftFighter.x;
  const overlap = minimumDistance - distance;
  if (overlap <= 0) return;
  const shift = overlap / 2;
  leftFighter.x -= shift;
  rightFighter.x += shift;
  leftFighter.x = Math.max(70, Math.min(WORLD.width - 70, leftFighter.x));
  rightFighter.x = Math.max(70, Math.min(WORLD.width - 70, rightFighter.x));
  leftFighter.vx = Math.min(0, leftFighter.vx);
  rightFighter.vx = Math.max(0, rightFighter.vx);
}

function resolveMeleeHit(attacker, defender, move) {
  if (!overlaps(meleeBox(attacker, move), bodyBox(defender))) return;
  if (move.throw) return resolveThrow(attacker, defender, move);
  attacker.attack.hitDone = true;
  applyHit(attacker, defender, move.damage, move.knockback, move.hitstun, move.color, move.label, move);
}

function resolveThrow(attacker, defender, move) {
  // Throws beat standing and crouching guard alike. Only airborne and wake-up
  // throw-invulnerable states should make a grounded throw whiff.
  if (!defender.grounded || defender.throwInvuln > 0) {
    attacker.attack.hitDone = true;
    setAttackResult(attacker, 'whiff');
    recordMatchEvent('COMBAT', { actor: attacker.name, target: defender.name, result: 'WHIFF', move: move.label || 'THROW', reason: 'THROW AVOIDED', frameSnapshot: getAttackFrameSnapshot(attacker) });
    addFloatingText(attacker.x + attacker.facing * 58, attacker.y - 174, 'THROW WHIFF');
    showHitConfirm('THROW WHIFF');
    playSfx('whiff');
    return;
  }
  const defenderThrow = defender.attack?.move?.throw;
  const defenderThrowActive = (defenderThrow && defender.attack.elapsed >= defender.attack.move.startup * .55 && defender.attack.elapsed <= defender.attack.move.startup + defender.attack.move.active) || defender.throwTechWindow > 0;
  if (defenderThrowActive) {
    attacker.attack.hitDone = true;
    if (defender.attack) defender.attack.hitDone = true;
    defender.throwTechWindow = 0;
    setAttackResult(attacker, 'tech');
    setAttackResult(defender, 'tech');
    recordMatchEvent('THROW_TECH', { actor: attacker.name, target: defender.name, result: 'TECH', frameSnapshot: getAttackFrameSnapshot(attacker) });
    attacker.vx = attacker.facing * -240;
    defender.vx = attacker.facing * 240;
    attacker.blockstun = 280;
    defender.blockstun = 280;
    attacker.state = 'guard-recovery';
    defender.state = 'guard-recovery';
    hitstop = .08;
    addBurst(defender.x, defender.y - 100, '#ffe07a', 12);
    addFloatingText(defender.x, defender.y - 180, 'THROW TECH');
    showHitConfirm('THROW TECH');
    playSfx('tech');
    return;
  }
  attacker.attack.hitDone = true;
  applyHit(attacker, defender, move.damage, move.knockback, move.hitstun, move.color, move.label, move);
}

function applyHit(attacker, defender, rawDamage, knockback, hitstun, color, label, moveOverride = null) {
  if (defender.driveInvuln > 0) {
    if (attacker.attack) attacker.attack.hitDone = true;
    setAttackResult(attacker, 'invuln');
    recordMatchEvent('COMBAT', { actor: attacker.name, target: defender.name, result: 'INVULN', move: label || 'ATTACK', reason: 'DRIVE ESCAPE', frameSnapshot: getAttackFrameSnapshot(attacker) });
    defender.vx = attacker.facing * -120;
    addBurst(defender.x, defender.y - 95, '#fff0a7', 9);
    addFloatingText(defender.x, defender.y - 185, 'INVULN');
    showHitConfirm('DRIVE ESCAPE');
    return;
  }
  if (defender.parryTimer > 0 && defender.grounded && defender.facing === -attacker.facing && !attacker.attack?.move.throw) {
    if (attacker.attack) attacker.attack.hitDone = true;
    setAttackResult(attacker, 'parried');
    recordMatchEvent('COMBAT', { actor: attacker.name, target: defender.name, result: 'PARRY', move: label || 'ATTACK', reason: 'PARRY', frameSnapshot: getAttackFrameSnapshot(attacker) });
    defender.parryTimer = 0;
    defender.guard = false;
    defender.meter = Math.min(MAX_METER, defender.meter + 90);
    attacker.blockstun = 380;
    attacker.vx = attacker.facing * -220;
    hitstop = .11;
    addBurst(defender.x + defender.facing * 28, defender.y - 105, '#fff0a7', 16);
    addFloatingText(defender.x, defender.y - 185, 'PARRY');
    showHitConfirm('PARRY / TURN STEAL');
    playSfx('block');
    tipReadoutEl.textContent = defender.side === 'player' ? 'PARRY成功：攻めのターンを奪い返した。' : `${defender.name}がタイミングを読んだ。`;
    return;
  }
  const move = moveOverride || attacker.attack?.move || { throw: label === 'THROW' };
  if (!move.throw) defender.throwTechWindow = 0;
  const defenderAttack = defender.attack;
  const defenderAttackActiveEnd = defenderAttack ? defenderAttack.move.startup + defenderAttack.move.active : 0;
  const impactType = defenderAttack && defenderAttack.elapsed > defenderAttackActiveEnd
    ? 'PUNISH'
    : defenderAttack && defenderAttack.elapsed < defenderAttack.move.startup
      ? 'COUNTER'
      : 'HIT';
  const impactMultiplier = impactType === 'PUNISH' ? 1.18 : impactType === 'COUNTER' ? 1.08 : 1;
  const guardHeightValid = move.low ? defender.crouching : !move.overhead || !defender.crouching;
  const guarding = !move.throw && defender.guard && defender.grounded && defender.facing === -attacker.facing && guardHeightValid && defender.guardRecovery <= 0;
  const comboDamageScale = guarding ? 1 : attacker.combo > 0 ? Math.max(.55, 1 - attacker.combo * .08) : 1;
  const damage = guarding ? Math.round(rawDamage * .14) : Math.round(rawDamage * impactMultiplier * comboDamageScale);
  const wasCrouching = defender.crouching;
  const attackerRemaining = attacker.attack ? Math.max(0, attacker.attack.move.startup + attacker.attack.move.active + attacker.attack.move.recovery - attacker.attack.elapsed) : 0;
  const defenderStun = guarding ? 250 : Math.round(hitstun + (impactType === 'PUNISH' ? 120 : impactType === 'COUNTER' ? 60 : 0));
  const advantageFrames = Math.round((defenderStun - attackerRemaining) / 16.67);
  if (player) player.lastAdvantage = attacker.side === 'player' ? advantageFrames : -advantageFrames;
  defender.lastHitDirection = attacker.facing > 0 ? 'RIGHT' : 'LEFT';
  defender.health = Math.max(0, defender.health - damage);
  defender.vx = attacker.facing * (guarding ? knockback * .18 : knockback);
  defender.vy = guarding ? 0 : -Math.min(390, damage * 2.3);
  defender.grounded = guarding ? true : false;
  defender.hitstun = guarding ? 0 : defenderStun;
  defender.blockstun = guarding ? 250 : 0;
  defender.guardRecovery = guarding ? 120 : 0;
  defender.attack = null;
  defender.assistSequence = null;
  defender.inputBuffer = null;
  defender.guard = guarding;
  defender.crouching = guarding && wasCrouching;
  defender.hurtFlash = .14;
  setAttackResult(attacker, guarding ? 'block' : impactType.toLowerCase());
  recordMatchEvent('COMBAT', {
    actor: attacker.name,
    target: defender.name,
    result: guarding ? 'BLOCK' : impactType,
    move: label || move.label || 'ATTACK',
    damage,
    counterType: guarding ? null : impactType,
    playerAdvantage: attacker.side === 'player' ? advantageFrames : -advantageFrames,
    reason: guarding ? 'GUARD' : impactType === 'PUNISH' ? 'PUNISH COUNTER' : impactType === 'COUNTER' ? 'COUNTER HIT' : attacker.side === 'cpu' ? (cpuBrain.reason || 'CPU CONFIRM') : 'PLAYER CONFIRM',
    frameSnapshot: getAttackFrameSnapshot(attacker)
  });
  updateCharacterTrial(attacker, move, impactType, guarding);
  if (!guarding && move.knockdown && defender.health > 0) {
    defender.state = 'knockdown';
    defender.knockdownTimer = move.knockdown * 1000;
    defender.grounded = true;
    defender.vy = 0;
    defender.hitstun = 0;
    defender.blockstun = 0;
    defender.guardRecovery = 0;
    defender.guard = false;
    defender.crouching = false;
    defender.vx = attacker.facing * knockback * .55;
    defender.throwInvuln = 260;
  }
  if (defender.health <= 0) { defender.state = 'down'; defender.downTimer = 1.2; defender.vx = attacker.facing * knockback * .4; roundKoTimer = 1.0; }
  if (guarding) {
    attacker.combo = 0;
    attacker.comboTimer = 0;
    attacker.comboDamageScale = 1;
  } else {
    attacker.hits += 1;
    attacker.combo = attacker.combo + 1;
    attacker.comboTimer = 1.25;
    attacker.maxCombo = Math.max(attacker.maxCombo, attacker.combo);
    attacker.comboDamageScale = comboDamageScale;
    maxCombo = Math.max(maxCombo, attacker.maxCombo);
    totalHits += 1;
  }
  arcadeScore += Math.max(1, Math.round(damage + attacker.combo * 3));
  attacker.meter = Math.min(MAX_METER, attacker.meter + (guarding ? 10 : 18));
  hitstop = guarding ? .035 : impactType === 'PUNISH' ? .11 : impactType === 'COUNTER' ? .085 : (label === 'OVERDRIVE' ? .13 : .065);
  const burstPower = guarding ? 9 : impactType === 'PUNISH' ? 24 : impactType === 'COUNTER' ? 19 : 15;
  addBurst(defender.x, defender.y - 95, guarding ? '#b8c6ff' : color, burstPower);
  playSfx(defender.health <= 0 ? 'ko' : guarding ? 'block' : move.throw ? 'throw' : impactType === 'PUNISH' ? 'punish' : impactType === 'COUNTER' ? 'counter' : 'hit');
  addFloatingText(defender.x, defender.y - 185, guarding ? 'GUARD' : impactType === 'HIT' ? String(damage) : impactType);
  showHitConfirm(guarding ? 'BLOCKED' : impactType === 'HIT' ? label === 'THROW' ? `THROW / ${damage}` : `${label} / ${damage}` : `${impactType} / ${damage}`);
  hitDirectionReadoutEl.textContent = `${guarding ? 'GUARD DIRECTION' : 'HIT DIRECTION'}: ${defender.lastHitDirection}`;
  document.body.classList.toggle('screen-shake', !guarding && (rawDamage >= 90 || impactType !== 'HIT'));
  window.setTimeout(() => document.body.classList.remove('screen-shake'), 160);
  tipReadoutEl.textContent = guarding
    ? 'BLOCKED：投げで崩すか、距離を作って次の一手。'
    : impactType === 'PUNISH'
      ? 'PUNISH COUNTER：空振りの隙を咎めた。今なら追撃から起き攻めへ。'
      : impactType === 'COUNTER'
        ? 'COUNTER HIT：発生前を潰した。続けてコンボを伸ばせる。'
        : label === 'THROW'
          ? 'THROW成功：ガードを読んで、攻めのターンを延長。'
          : (attacker.side === 'player' ? `GOOD HIT：${attacker.name}の昼が一段明るくなった。` : `${attacker.name}がルールを書き換えようとしている。`);
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
      applyHit(shot.owner, defender, shot.damage, shot.move.knockback, shot.move.hitstun, shot.color, shot.move.label, shot.move);
      projectiles.splice(i, 1);
    }
  }
}

function updateCpu(dt) {
  if (mode === 'training' || state !== 'playing' || cpu.health <= 0) return;
  const difficulty = CPU_DIFFICULTIES[cpuDifficulty] || CPU_DIFFICULTIES.easy;
  if (cpuBrain.telegraph > 0) {
    cpuBrain.telegraph -= dt;
    cpuBrain.move = 0;
    cpuBrain.guard = false;
    if (cpuBrain.telegraph <= 0 && !cpu.attack && cpu.hitstun <= 0 && cpu.blockstun <= 0) {
      const telegraphedAction = cpuBrain.action;
      cpuBrain.action = null;
      if (telegraphedAction) triggerAction(cpu, telegraphedAction);
    }
    return;
  }
  if ((cpu.hitstun > 0 || cpu.blockstun > 0) && cpu.meter >= DRIVE_BURST_COST && Math.random() < .035) {
    triggerDriveBurst(cpu);
    return;
  }
  const distance = player.x - cpu.x;
  const absDistance = Math.abs(distance);
  cpu.facing = distance >= 0 ? 1 : -1;
  cpuBrain.timer -= dt;
  if (player.state === 'knockdown' || player.state === 'wakeup') {
    cpuBrain.intent = 'OKI';
    cpuBrain.guard = false;
    cpuBrain.crouch = false;
    cpuBrain.parry = false;
    cpuBrain.jump = false;
    const okiState = player.state;
    const okiOption = player.state === 'knockdown' ? 'KNOCKDOWN' : player.lastWakeupOption || 'AUTO';
    const newOkiRead = cpuBrain.okiState !== okiState || cpuBrain.okiOption !== okiOption;
    if (newOkiRead) {
      cpuBrain.okiState = okiState;
      cpuBrain.okiOption = okiOption;
      const readReason = okiState === 'knockdown'
        ? 'SETUP'
        : okiOption === 'QUICK RISE'
          ? 'MEATY TIMING'
          : okiOption === 'BACK ROLL'
            ? 'ROLL CHASE'
            : okiOption === 'FORWARD ROLL'
              ? 'ROLL CHECK'
              : 'AUTO TIMING';
      recordMatchEvent('OKI_READ', { actor: cpu.name, target: player.name, option: okiOption, reason: readReason });
    }
    const chaseDistance = ['BACK ROLL', 'FORWARD ROLL'].includes(okiOption) ? 188 : 132;
    cpuBrain.move = absDistance > chaseDistance ? Math.sign(distance) : 0;
    const setupReason = okiState === 'knockdown'
      ? (cpuBrain.move ? 'APPROACH' : 'MEATY SETUP')
      : okiOption === 'BACK ROLL'
        ? (cpuBrain.move ? 'ROLL CHASE' : 'ROLL CHECK')
        : okiOption === 'FORWARD ROLL'
          ? 'ROLL CHECK'
          : okiOption === 'QUICK RISE'
            ? 'QUICK RISE READ'
            : 'AUTO TIMING';
    setCpuDecision(null, setupReason);
    if (player.state === 'wakeup' && player.wakeupTimer <= 220 && cpuBrain.timer <= 0 && !cpu.attack && cpu.hitstun <= 0 && cpu.blockstun <= 0 && absDistance <= 205) {
      cpuBrain.timer = .34;
      const okiAction = okiOption === 'QUICK RISE'
        ? (player.wakeupTimer <= 110 ? 'm' : 'k')
        : okiOption === 'FORWARD ROLL'
          ? 'k'
          : okiOption === 'BACK ROLL'
            ? 'm'
            : player.throwInvuln > 0 ? (Math.random() < .5 ? 'n' : 'm') : (Math.random() < .5 ? 'k' : 'u');
      const okiReason = okiOption === 'QUICK RISE'
        ? 'MEATY / QUICK RISE'
        : okiOption === 'BACK ROLL'
          ? 'MEATY / BACK ROLL'
          : okiOption === 'FORWARD ROLL'
            ? 'CHECK / FORWARD ROLL'
            : player.throwInvuln > 0 ? 'MEATY / THROW INVULN' : 'WAKEUP READ';
      setCpuDecision(okiAction, okiReason);
      cpuBrain.telegraph = (CPU_DIFFICULTIES[cpuDifficulty]?.telegraph || .2) * (cpuBrain.action === 'u' ? .88 : 1.12);
      if (cpuBrain.telegraph <= .01) { const action = cpuBrain.action; setCpuDecision(null, cpuBrain.reason); triggerAction(cpu, action); }
    }
    if (!cpu.attack && cpuBrain.telegraph <= 0) {
      cpu.guard = false;
      cpu.vx = cpuBrain.move * cpu.character.speed * .72;
      cpu.state = cpu.grounded ? (cpuBrain.move ? 'walk' : 'idle') : 'jump';
    }
    return;
  }
  if (!player.attack) cpuBrain.punishTarget = null;
  const playerWhiffing = player.attack && !player.attack.hitDone && player.attack.elapsed > player.attack.move.startup + player.attack.move.active && absDistance < 260;
  const punishReady = difficulty.counter > 0 && playerWhiffing && cpuBrain.punishTarget !== player.attack && !cpu.attack && cpu.hitstun <= 0 && cpu.blockstun <= 0 && cpu.guardRecovery <= 0;
  if (punishReady) {
    cpuBrain.punishTarget = player.attack;
    cpuBrain.intent = 'PUNISH';
    cpuBrain.timer = 0;
    cpuBrain.move = 0;
    cpuBrain.guard = false;
    cpuBrain.crouch = false;
    cpuBrain.parry = false;
    cpuBrain.jump = false;
    const specialReady = cpu.meter >= Math.abs(getMoveFor(cpu, 'l').meter);
    const punishAction = absDistance < 175 ? 'k' : specialReady ? 'l' : 'k';
    setCpuDecision(punishAction, 'WHIFF PUNISH');
    cpuBrain.telegraph = difficulty.telegraph * (punishAction === 'l' ? 1.1 : 1);
    if (cpuBrain.telegraph <= .01) { const action = cpuBrain.action; setCpuDecision(null, cpuBrain.reason); triggerAction(cpu, action); }
    return;
  }
  const playerBlockRecoveryRemaining = player.attack
    ? player.attack.move.startup + player.attack.move.active + player.attack.move.recovery - player.attack.elapsed
    : 0;
  const playerBlockPunishable = player.attack
    && player.attack.result === 'block'
    && player.attack.elapsed > player.attack.move.startup + player.attack.move.active
    && playerBlockRecoveryRemaining > 0
    && absDistance < 260;
  const blockPunishReady = difficulty.counter > 0
    && playerBlockPunishable
    && cpuBrain.punishTarget !== player.attack
    && !cpu.attack
    && cpu.hitstun <= 0
    && cpu.blockstun <= 0
    && cpu.guardRecovery <= 0;
  if (blockPunishReady) {
    cpuBrain.punishTarget = player.attack;
    cpuBrain.intent = 'PUNISH';
    cpuBrain.timer = 0;
    cpuBrain.move = 0;
    cpuBrain.guard = false;
    cpuBrain.crouch = false;
    cpuBrain.parry = false;
    cpuBrain.jump = false;
    const specialReady = cpu.meter >= Math.abs(getMoveFor(cpu, 'l').meter);
    const punishAction = absDistance < 175 ? 'k' : specialReady ? 'l' : 'k';
    setCpuDecision(punishAction, 'BLOCK PUNISH');
    cpuBrain.telegraph = difficulty.telegraph * (punishAction === 'l' ? 1.05 : .72);
    if (cpuBrain.telegraph <= .01) { const action = cpuBrain.action; setCpuDecision(null, cpuBrain.reason); triggerAction(cpu, action); }
    return;
  }
  const playerThrowThreat = player.attack?.move?.throw
    && !player.attack.hitDone
    && player.attack.elapsed <= player.attack.move.startup + player.attack.move.active
    && absDistance <= 185;
  const throwTechReady = cpuDifficulty !== 'easy'
    && playerThrowThreat
    && cpuBrain.timer <= 0
    && !cpu.attack
    && cpu.hitstun <= 0
    && cpu.blockstun <= 0
    && cpu.guardRecovery <= 0
    && (cpuDifficulty === 'hard' || Math.random() < .48 * difficulty.reaction);
  if (throwTechReady) {
    cpuBrain.intent = 'DEFENSE READ';
    cpuBrain.timer = .18;
    cpuBrain.move = 0;
    cpuBrain.guard = false;
    cpuBrain.crouch = false;
    cpuBrain.parry = false;
    cpuBrain.jump = false;
    cpu.throwTechWindow = 140;
    setCpuDecision(null, 'THROW TECH');
    return;
  }
  const playerAttackThreat = player.attack
    && !player.attack.hitDone
    && player.attack.elapsed <= player.attack.move.startup + player.attack.move.active
    && absDistance <= 225;
  const defensiveReadReady = cpuDifficulty !== 'easy'
    && playerAttackThreat
    && cpuBrain.timer <= 0
    && !cpu.attack
    && cpu.hitstun <= 0
    && cpu.blockstun <= 0
    && cpu.guardRecovery <= 0
    && (cpuDifficulty === 'hard' || Math.random() < .56 * difficulty.reaction);
  if (defensiveReadReady) {
    const threat = player.attack.move;
    cpuBrain.intent = 'DEFENSE READ';
    cpuBrain.timer = .2;
    cpuBrain.move = 0;
    cpuBrain.parry = false;
    cpuBrain.jump = false;
    if (threat.throw) {
      cpuBrain.guard = false;
      cpuBrain.crouch = true;
      setCpuDecision(null, 'THROW AVOID');
    } else {
      cpuBrain.guard = true;
      cpuBrain.crouch = !!threat.low;
      setCpuDecision(null, threat.low ? 'LOW GUARD' : threat.overhead ? 'OVERHEAD GUARD' : 'GUARD READ');
    }
    return;
  }
  cpuBrain.intent = 'NEUTRAL';
  if (cpuBrain.timer <= 0 && !cpu.attack && cpu.hitstun <= 0 && cpu.blockstun <= 0) {
    const style = CPU_STYLES[cpu.character.role] || CPU_STYLES.BALANCED;
    const distanceError = absDistance - style.preferred;
    const approaching = distanceError < -32;
    const tooFar = distanceError > 42;
    cpuBrain.timer = difficulty.timerMin + Math.random() * difficulty.timerRandom;
    cpuBrain.move = tooFar ? Math.sign(distance) : approaching ? -Math.sign(distance) * (Math.random() < .22 ? 1 : 0) : 0;
    if (style.approach >= .8 && absDistance > style.preferred) cpuBrain.move = Math.sign(distance);
    if (style.approach <= .45 && absDistance < style.preferred - 34) cpuBrain.move = -Math.sign(distance);
    cpuBrain.guard = absDistance < 175 && Math.random() < style.guard * difficulty.guard;
    cpuBrain.crouch = cpuBrain.guard && player.attack?.move.low && Math.random() < .78;
    cpuBrain.parry = cpuBrain.guard && Math.random() < style.parry * difficulty.parry && player.attack;
    cpuBrain.jump = cpu.character.role === 'CHAOS' && Math.random() < .14;
    setCpuDecision(null, cpuBrain.move ? (cpuBrain.move === Math.sign(distance) ? 'APPROACH' : 'RETREAT') : cpuBrain.guard ? (cpuBrain.crouch ? 'CROUCH GUARD' : 'GUARD') : 'NEUTRAL');
    const closeEnough = absDistance <= Math.max(165, style.preferred + 26);
    const specialReady = cpu.meter >= Math.abs(getMoveFor(cpu, 'l').meter);
    const superReady = cpu.meter >= Math.abs(getMoveFor(cpu, 'i').meter);
    const playerAirborne = !player.grounded && absDistance < 220;
    if (difficulty.antiAir > 0 && playerAirborne && Math.random() < difficulty.antiAir) setCpuDecision('k', 'ANTI-AIR');
    else if (difficulty.counter > 0 && playerWhiffing && Math.random() < difficulty.counter) setCpuDecision(absDistance < 175 ? 'k' : 'l', 'WHIFF PUNISH');
    else if (superReady && Math.random() < style.super * difficulty.reaction) setCpuDecision('i', 'METER PUNISH');
    else if (specialReady && Math.random() < style.special * difficulty.reaction && (closeEnough || style.preferred > 220)) setCpuDecision('l', 'SPACE CONTROL');
    else if (closeEnough && player.guard && Math.random() < style.throw * difficulty.reaction) setCpuDecision('u', 'GUARD READ');
    else if (closeEnough && player.crouching && difficulty.reaction >= .8 && Math.random() < .22 * difficulty.reaction) setCpuDecision('m', 'LOW READ');
    else if (closeEnough && !player.crouching && difficulty.reaction >= .8 && Math.random() < .16 * difficulty.reaction) setCpuDecision('n', 'STAND READ');
    else if (closeEnough && Math.random() < style.attack * difficulty.attack) setCpuDecision(Math.random() < (cpu.character.role === 'POWER' || cpu.character.role === 'TANK' ? .7 : .55) ? 'k' : 'j', 'PRESSURE');
    if (cpuBrain.action) {
      cpuBrain.telegraph = difficulty.telegraph * (cpuBrain.action === 'i' ? 1.25 : cpuBrain.action === 'l' ? 1.1 : 1);
      if (cpuBrain.telegraph <= .01) { const action = cpuBrain.action; setCpuDecision(null, cpuBrain.reason); triggerAction(cpu, action); }
    }
  }
  if (!cpu.attack && cpuBrain.telegraph <= 0) {
    cpu.guard = cpuBrain.guard;
    cpu.vx = cpuBrain.move * cpu.character.speed * .72;
    cpu.state = cpu.guard ? 'block' : (cpu.grounded ? (cpuBrain.move ? 'walk' : 'idle') : 'jump');
  }
}

function tick(dt) {
  const gamepad = readGamepad();
  if (gamepad.pausePressed) togglePause();
  if (state === 'playing') {
    if (hitstop > 0) { hitstop -= dt; return; }
    roundClock = Math.max(0, WORLD.roundSeconds - (performance.now() - roundStartedAt) / 1000);
    const playerInput = readPlayerInput(gamepad);
    playerInput.dashLeft = justPressed.has('dashLeft');
    playerInput.dashRight = justPressed.has('dashRight');
    playerInput.wakeupLeft = justPressed.has('a');
    playerInput.wakeupRight = justPressed.has('d');
    if (mode === 'training' && trainingRecording) {
      trainingRecord.push({ ...playerInput, actions: Array.from(justPressed).filter((key) => ['j', 'k', 'n', 'm', 'l', 'i', 'u', 'o'].includes(key)), cpuReason: cpuBrain.reason || null });
    }
    consumeActions(player);
    updateCpu(dt);
    updateFighter(player, cpu, playerInput, dt);
    let cpuInput = mode === 'training'
      ? { left: false, right: false, jump: false, crouch: trainingMixup ? cpu.crouching : false, guard: trainingMixup ? cpu.guard : false, parry: false }
      : { left: cpuBrain.move < 0, right: cpuBrain.move > 0, jump: cpuBrain.jump, crouch: cpuBrain.crouch, guard: cpuBrain.guard, parry: cpuBrain.parry };
    if (mode === 'training' && trainingReplay) {
      const replayFrame = trainingRecord[trainingReplayIndex++];
      if (replayFrame) {
        cpuInput = { left: replayFrame.left, right: replayFrame.right, jump: replayFrame.jump, crouch: replayFrame.crouch, guard: replayFrame.guard, parry: replayFrame.parry };
        replayFrame.actions.forEach((key) => { if (cpu.attack || cpu.hitstun > 0 || cpu.blockstun > 0) cpu.inputBuffer = { key, ttl: .2 }; else if (key === 'o') triggerDriveBurst(cpu); else triggerAction(cpu, key); });
      } else {
        trainingReplay = false;
        showBanner('REPLAY END', 650);
        trainingNote.textContent = `TRAINING：${trainingRecord.length}フレーム保存済み／T記録・Y再生・Rリセット`;
      }
    }
    updateFighter(cpu, player, cpuInput, dt);
    if (mode === 'training' && trainingDrill) {
      trainingDrillTimer = Math.max(0, trainingDrillTimer - dt);
      if (!cpu.attack && !player.attack && trainingDrillTimer <= 0) armPunishDrill();
    }
    if (mode === 'training' && trainingMixup) {
      trainingMixupTimer = Math.max(0, trainingMixupTimer - dt);
      if (!cpu.attack && !player.attack && trainingMixupTimer <= 0) {
        trainingMixupStep = (trainingMixupStep + 1) % MIXUP_DRILL_PATTERNS.length;
        armMixupDrill();
      }
    }
    resolvePushbox(player, cpu);
    updateProjectiles(dt);
    updateParticles(dt);
    updateFloatingText(dt);
    updateHud();
    if (mode === 'training' && cpu.health <= 0) resetTrainingDummy();
    else if (player.health <= 0 || cpu.health <= 0) {
      roundKoTimer = Math.max(0, roundKoTimer - dt);
      if (roundKoTimer <= 0) endRound(player.health >= cpu.health ? 'player' : 'cpu');
    } else if (roundClock <= 0) endRound(player.health >= cpu.health ? 'player' : 'cpu');
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
  recordMatchEvent('ROUND_RESULT', { winner: winnerFighter.name, winnerSide: winner, playerRounds, cpuRounds });
  showBanner(`${winnerFighter.name} WINS`, 1100);
  playSfx(winner === 'player' ? 'win' : 'lose');
  announcerEl.textContent = winner === 'player' ? `${winnerFighter.character.role} CONFIRMED` : `${winnerFighter.character.role} HAS SHIFTED THE RULES`;
  roundTimer = 1.55;
  if (mode === 'training') roundTimer = 0;
}

const VICTORY_LINES = {
  luna: 'ルナは昼を、勝利ではなく次の創作へ変換した。',
  neko: 'ネコムシカは勝敗の境界線に、音符を一つ置いた。',
  kagari: 'カガリの太陽拳が、次のステージへの道を開いた。',
  mizuki: 'ミズキは静かに波形を閉じ、勝利ログを保存した。',
  bolt9: 'BOLT-9は勝利を、今日も安全に保管した。',
  vanta: 'VANTAはルールの余白に、紫の署名を残した。',
  sylfa: 'SYLFAの風が、敗北の文字を遠くへ飛ばした。',
  ryuga: 'RYUGAの炎が、昼のコアを再起動した。',
  piko: 'PIKOは跳ねた。勝利も跳ねた。次はどこへ？',
  orbis: 'ORBISは軌道を一周し、勝利の座標を記録した。'
};

function finishMatch() {
  state = 'finished';
  lastMatchLog = matchLog.slice();
  selectedMatchLogIndex = null;
  document.body.classList.remove('is-playing');
  document.body.classList.add('is-finished');
  const won = playerRounds > cpuRounds;
  const winner = won ? player : cpu;
  const loser = won ? cpu : player;
  const earnedShards = won ? (mode === 'arcade' ? 12 + arcadeIndex * 4 : 3) : 0;
  if (won) {
    profile.wins += 1;
    profile.shards += earnedShards;
    profile.bestCombo = Math.max(profile.bestCombo, maxCombo);
    if (mode === 'arcade' && arcadeIndex === ARCADE_ROUTE.length - 1) profile.arcadeClears += 1;
    arcadeBank = mode === 'arcade' ? Math.min(500, Math.floor(player.meter * .35) + 80) : 0;
  } else profile.losses += 1;
  saveProfile();
  resultPanel.hidden = false;
  nextArcadeButton.hidden = !(mode === 'arcade' && won && arcadeIndex < ARCADE_ROUTE.length - 1);
  resultTitle.textContent = won ? `${winner.name} WINS THE DAY` : `${winner.name} REWRITES THE RULES`;
  resultMessage.textContent = won ? `${VICTORY_LINES[winner.characterId] || winner.character.tip} SHARDS +${earnedShards}` : `${loser.name}も、ここから進化する。もう一度、昼を取り戻そう。`;
  if (mode === 'arcade' && won && arcadeIndex < ARCADE_ROUTE.length - 1) {
    resultTitle.textContent = `${winner.name} CLEARS THE SECTOR`;
    resultMessage.textContent = `NEXT OPPONENT：${CHARACTER_ROSTER[ARCADE_ROUTE[arcadeIndex + 1]].name}。DAY SHARD BANK +${arcadeBank}。`;
    rematchButton.textContent = 'RESTART RUN →';
  } else if (mode === 'arcade' && won) {
    resultTitle.textContent = 'ARCADE RUN CLEAR';
    resultMessage.textContent = `${winner.name}が全ルートを制覇した。次の指令を受け付けます。`;
    rematchButton.textContent = 'RUN AGAIN →';
  } else {
    rematchButton.textContent = 'REMATCH →';
  }
  resultTitle.style.color = winner.character.accent;
  resultHits.textContent = String(totalHits);
  resultCombo.textContent = String(maxCombo);
  resultGrade.textContent = won && maxCombo >= 8 ? 'SS' : won ? 'A' : maxCombo >= 5 ? 'B' : 'C';
  resultShards.textContent = String(profile.shards);
  resultScore.textContent = String(arcadeScore);
  if (resultLogSummaryEl) resultLogSummaryEl.textContent = summarizeMatchLog();
  renderMatchLogTimeline();
  roundStateEl.textContent = won ? 'CLEAR' : 'RETRY';
  announcerEl.textContent = 'MATCH REPORT READY';
  pauseOverlay.hidden = true;
  pauseButton.textContent = 'PAUSE';
}

function nextArcadeFight() {
  if (mode !== 'arcade' || arcadeIndex >= ARCADE_ROUTE.length - 1) return;
  arcadeIndex += 1;
  selectedCpuId = ARCADE_ROUTE[arcadeIndex];
  matchLog = [];
  lastMatchLog = [];
  selectedMatchLogIndex = null;
  round = 1;
  playerRounds = 0;
  cpuRounds = 0;
  totalHits = 0;
  maxCombo = 0;
  resultPanel.hidden = true;
  document.body.classList.add('is-playing');
  startRound();
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
  if (frameLab) drawFrameLabOverlay();
  if (state === 'finished') drawVictorySeal(now);
  drawParticles(); drawFloatingText();
}

function drawFrameLabOverlay() {
  ctx.save();
  ctx.font = '900 13px Inter, sans-serif';
  ctx.lineWidth = 3;
  [player, cpu].forEach((fighter) => {
    if (!fighter) return;
    const hurt = bodyBox(fighter);
    ctx.strokeStyle = fighter.side === 'player' ? '#72dcff' : '#ff668d';
    ctx.strokeRect(hurt.x, hurt.y, hurt.w, hurt.h);
    let phase = fighter.attack ? 'RECOVERY' : fighter.guard ? 'BLOCK' : 'NEUTRAL';
    let frame = 0;
    if (fighter.attack) {
      const move = fighter.attack.move;
      const elapsed = fighter.attack.elapsed;
      frame = Math.floor(elapsed / 16.67);
      phase = elapsed < move.startup ? 'STARTUP' : elapsed <= move.startup + move.active ? 'ACTIVE' : 'RECOVERY';
      if (!move.projectile) {
        const hit = meleeBox(fighter, move);
        ctx.strokeStyle = phase === 'ACTIVE' ? '#fff0a7' : fighter.character.accent;
        ctx.globalAlpha = phase === 'ACTIVE' ? .95 : .48;
        ctx.strokeRect(hit.x, hit.y, hit.w, hit.h);
        ctx.globalAlpha = 1;
      }
    }
    const result = fighter.attack?.result || fighter.lastAttackResult || '--';
    ctx.fillStyle = fighter.side === 'player' ? '#d9f8ff' : '#ffe2ed';
    ctx.textAlign = fighter.side === 'player' ? 'left' : 'right';
    ctx.fillText(`${fighter.name} / ${phase} / ${frame}f / ${result}`, fighter.side === 'player' ? hurt.x : hurt.x + hurt.w, hurt.y - 10);
  });
  ctx.restore();
}

function drawVictorySeal(now) {
  const winner = playerRounds > cpuRounds ? player : cpu;
  if (!winner) return;
  ctx.save();
  ctx.translate(winner.x, winner.y - 245);
  ctx.globalAlpha = .72 + Math.sin(now * .006) * .12;
  ctx.strokeStyle = winner.character.accent;
  ctx.shadowColor = winner.character.accent;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, 35 + Math.sin(now * .008) * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '950 13px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DAY CLEAR', 0, 5);
  ctx.restore();
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
  if (fighter.attack?.move?.signature) drawSignatureMoveEffect(fighter, now);
  if (fighter.attack) drawAttackArc(fighter, now);
  ctx.restore();
}

function drawCharacterArt(fighter, portrait) {
  const height = 350 * (fighter.character.id === 'neko' ? .93 : 1);
  const width = height * (portrait.naturalWidth / portrait.naturalHeight);
  const now = performance.now();
  const lift = fighter.grounded ? 0 : Math.sin(now * .01) * 4;
  const attackProgress = fighter.attack ? fighter.attack.elapsed / (fighter.attack.move.startup + fighter.attack.move.active + fighter.attack.move.recovery) : 0;
  const active = fighter.attack && fighter.attack.elapsed >= fighter.attack.move.startup && fighter.attack.elapsed <= fighter.attack.move.startup + fighter.attack.move.active;
  const motion = getMotionTransform(fighter, now, attackProgress, active);
  ctx.save();
  drawMotionTrail(fighter, portrait, width, height, motion);
  ctx.translate(motion.x, motion.y);
  ctx.rotate(motion.rotation);
  ctx.scale(motion.scaleX, motion.scaleY);
  ctx.globalAlpha = fighter.state === 'hit' ? .76 : 1;
  ctx.shadowColor = fighter.side === 'player' ? 'rgba(255,157,82,.55)' : 'rgba(166,140,255,.55)';
  ctx.shadowBlur = fighter.attack?.move.super ? 34 : 14;
  ctx.drawImage(portrait, -width / 2, -height + lift, width, height);
  if (fighter.state === 'parry') {
    ctx.globalAlpha = .86;
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = '#fff0a7';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#fff0a7';
    ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(0, -110, 92 + Math.sin(now * .03) * 6, -1.1, 1.1); ctx.stroke();
  }
  if (fighter.state === 'telegraph') {
    ctx.globalAlpha = .82;
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = '#ffe07a';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#ffe07a';
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, -112, 92 + Math.sin(now * .035) * 8, 0, Math.PI * 2); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffe07a';
    ctx.font = '950 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INCOMING', 0, -218);
  }
  if (fighter.driveInvuln > 0) {
    ctx.globalAlpha = .62;
    ctx.strokeStyle = '#fff0a7';
    ctx.lineWidth = 9;
    ctx.shadowColor = '#fff0a7';
    ctx.shadowBlur = 28;
    ctx.beginPath(); ctx.arc(0, -110, 88 + Math.sin(now * .05) * 10, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function getMotionTransform(fighter, now, attackProgress, active) {
  const phase = now * .001;
  const motion = { x: 0, y: 0, rotation: Math.sin(phase * 2 + fighter.x * .01) * .008, scaleX: 1, scaleY: 1 };
  if (fighter.state === 'idle') {
    motion.y = Math.sin(phase * 3.2 + fighter.x * .01) * 2.5;
    motion.scaleX = 1 + Math.sin(phase * 3.2) * .006;
    motion.scaleY = 1 - Math.sin(phase * 3.2) * .006;
  } else if (fighter.state === 'walk') {
    const step = Math.sin(phase * 13);
    motion.y = Math.abs(step) * -3;
    motion.x = step * 2;
    motion.rotation = step * .025;
    motion.scaleX = 1 + Math.abs(step) * .018;
    motion.scaleY = 1 - Math.abs(step) * .018;
  } else if (fighter.state === 'dash') {
    const localDirection = (fighter.dashDir || 1) * fighter.facing;
    motion.x = localDirection * 14;
    motion.rotation = localDirection * -.035;
    motion.scaleX = 1.13;
    motion.scaleY = .91;
  } else if (fighter.state === 'jump') {
    motion.y = Math.sin(phase * 8) * 2;
    motion.rotation = Math.sin(phase * 5) * .035;
    motion.scaleX = .96;
    motion.scaleY = 1.04;
  } else if (fighter.state === 'hit') {
    motion.x = -10;
    motion.rotation = .11;
    motion.scaleX = .92;
    motion.scaleY = 1.07;
  } else if (fighter.state === 'down') {
    motion.y = 18;
    motion.rotation = fighter.facing * -.32;
    motion.scaleX = 1.08;
    motion.scaleY = .82;
  } else if (fighter.state === 'block') {
    motion.x = -6;
    motion.rotation = .055;
    motion.scaleX = .96;
    motion.scaleY = 1.03;
  } else if (fighter.state === 'guard-recovery') {
    motion.x = -3;
    motion.rotation = .02;
    motion.scaleX = .98;
    motion.scaleY = 1.02;
  } else if (fighter.state === 'parry') {
    motion.scaleX = .97;
    motion.scaleY = 1.06;
  } else if (fighter.state === 'telegraph') {
    motion.y = Math.sin(phase * 18) * 2;
    motion.rotation = Math.sin(phase * 18) * .018;
    motion.scaleX = 1.04;
    motion.scaleY = .96;
  } else if (fighter.state === 'burst') {
    motion.x = 14;
    motion.y = -4;
    motion.rotation = -.06;
    motion.scaleX = 1.12;
    motion.scaleY = .90;
  } else if (fighter.attack) {
    if (attackProgress < .35) {
      motion.x = -7;
      motion.rotation = .055;
      motion.scaleX = .94;
      motion.scaleY = 1.05;
    } else if (active) {
      motion.x = 13;
      motion.y = -5;
      motion.rotation = -.08;
      motion.scaleX = fighter.attack.move.super ? 1.10 : 1.06;
      motion.scaleY = fighter.attack.move.super ? .90 : .95;
    } else {
      motion.x = 5;
      motion.rotation = .025;
      motion.scaleX = 1.02;
      motion.scaleY = .98;
    }
  }
  return motion;
}

function drawMotionTrail(fighter, portrait, width, height, motion) {
  if (fighter.state !== 'dash' && !fighter.attack?.move?.burst) return;
  const localDirection = (fighter.dashDir || fighter.facing || 1) * fighter.facing;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 3; i >= 1; i -= 1) {
    ctx.globalAlpha = .045 * (4 - i);
    ctx.translate(-localDirection * i * 19, i * 2);
    ctx.drawImage(portrait, -width / 2, -height, width, height);
    ctx.translate(localDirection * i * 19, -i * 2);
  }
  ctx.restore();
}

function drawCharacterAura(fighter, now) {
  const intensity = fighter.attack ? (fighter.attack.move.super ? .62 : .32) : fighter.state === 'parry' ? .8 : fighter.guard ? .28 : fighter.state === 'walk' ? .16 : .09;
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
  if (fighter.state === 'parry') {
    ctx.globalAlpha = .72;
    ctx.strokeStyle = '#fff0a7';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, -112, 91 + Math.sin(now * .03) * 7, -1.3, 1.3); ctx.stroke();
  }
  ctx.restore();
}

function drawSignatureMoveEffect(fighter, now) {
  const move = fighter.attack?.move;
  if (!move?.signature) return;
  const active = fighter.attack.elapsed >= move.startup && fighter.attack.elapsed <= move.startup + move.active;
  const progress = Math.min(1, fighter.attack.elapsed / (move.startup + move.active + move.recovery));
  const pulse = 1 + Math.sin(now * .018) * .08;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = move.color || fighter.character.accent;
  ctx.fillStyle = move.color || fighter.character.accent;
  ctx.shadowColor = move.color || fighter.character.accent;
  ctx.shadowBlur = active ? 22 : 10;
  if (move.signature === 'solar-step') {
    ctx.globalAlpha = active ? .9 : .42;
    ctx.lineWidth = active ? 7 : 4;
    ctx.beginPath(); ctx.arc(34, -108, 42 + progress * 22, -1.15, 1.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, -36); ctx.lineTo(90, -22); ctx.lineTo(56, -6); ctx.stroke();
    for (let i = 0; i < 3; i += 1) { ctx.globalAlpha *= .72; ctx.beginPath(); ctx.moveTo(28 - i * 12, -42 + i * 7); ctx.lineTo(72 - i * 18, -29 + i * 8); ctx.stroke(); }
  } else if (move.signature === 'phase-low') {
    ctx.globalAlpha = active ? .92 : .45;
    ctx.lineWidth = active ? 6 : 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(62 + i * 18, -42, 20 + i * 7 + Math.sin(now * .014 + i) * 3, Math.PI * .95, Math.PI * 1.95);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(20, -20); ctx.lineTo(110, -20); ctx.stroke();
  } else if (move.signature === 'magnet-heavy') {
    ctx.globalAlpha = active ? .95 : .5;
    ctx.lineWidth = active ? 8 : 4;
    ctx.beginPath(); ctx.arc(56, -98, 34 * pulse, -.9, 2.1); ctx.stroke();
    ctx.fillRect(70, -122, 18, 28); ctx.fillRect(70, -77, 18, 28);
    if (move.armor && active) {
      ctx.globalAlpha = .55;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, -105, 94 + Math.sin(now * .03) * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '950 12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ARMOR', 0, -210);
    }
  } else if (move.signature === 'bounce-overhead') {
    ctx.globalAlpha = active ? .9 : .42;
    ctx.lineWidth = active ? 7 : 3;
    ctx.beginPath(); ctx.arc(34, -126, 54 * pulse, Math.PI * 1.03, Math.PI * 1.92); ctx.stroke();
    ctx.beginPath(); ctx.arc(66, -174, 13 + Math.sin(now * .02) * 3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(20, -24, 18 + Math.sin(now * .025) * 3, 0, Math.PI * 2); ctx.stroke();
  } else if (move.signature === 'orbit-shift') {
    ctx.globalAlpha = active ? .95 : .45;
    ctx.lineWidth = active ? 6 : 3;
    ctx.beginPath(); ctx.ellipse(8, -108, 72 * pulse, 28 * pulse, -.35, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(76, -110, 10 + Math.sin(now * .02) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(78, -112, 4, 0, Math.PI * 2); ctx.fill();
    if (active) { ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(-36, -112); ctx.lineTo(42, -112); ctx.stroke(); }
  } else if (move.signature === 'sun-punch') {
    ctx.globalAlpha = active ? .96 : .46;
    ctx.lineWidth = active ? 7 : 3;
    ctx.beginPath(); ctx.arc(74, -112, 25 + progress * 28, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(78, -112, 10 + Math.sin(now * .03) * 3, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i += 1) {
      const angle = i * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(78 + Math.cos(angle) * 18, -112 + Math.sin(angle) * 18); ctx.lineTo(78 + Math.cos(angle) * 48, -112 + Math.sin(angle) * 48); ctx.stroke();
    }
  } else if (move.signature === 'glitch-claw') {
    ctx.globalAlpha = active ? .94 : .44;
    ctx.lineWidth = active ? 6 : 3;
    for (let i = 0; i < 3; i += 1) {
      const y = -140 + i * 25;
      ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(112 + i * 8, y + (i - 1) * 9); ctx.stroke();
    }
    ctx.globalAlpha = active ? .72 : .32;
    for (let i = 0; i < 5; i += 1) ctx.fillRect(44 + i * 18, -178 + (i % 2) * 10, 10, 6);
  } else if (move.signature === 'hex-mark') {
    ctx.globalAlpha = active ? .96 : .46;
    ctx.lineWidth = active ? 6 : 3;
    ctx.beginPath(); ctx.moveTo(52, -137); ctx.lineTo(76, -151); ctx.lineTo(100, -137); ctx.lineTo(100, -109); ctx.lineTo(76, -95); ctx.lineTo(52, -109); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(76, -123, 13 + Math.sin(now * .025) * 3, 0, Math.PI * 2); ctx.stroke();
    if (active) { ctx.globalAlpha = .6; ctx.fillRect(66, -127, 20, 8); }
  } else if (move.signature === 'wind-slice') {
    ctx.globalAlpha = active ? .94 : .44;
    ctx.lineWidth = active ? 6 : 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath(); ctx.arc(74 + i * 18, -44 - i * 13, 34 + i * 8, Math.PI * .94, Math.PI * 1.94); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(24, -24); ctx.lineTo(122, -24); ctx.stroke();
  } else if (move.signature === 'dragon-crush') {
    ctx.globalAlpha = active ? .98 : .48;
    ctx.lineWidth = active ? 9 : 4;
    ctx.beginPath(); ctx.arc(65, -119, 43 * pulse, -.95, .95); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(58, -168); ctx.lineTo(88, -70); ctx.stroke();
    ctx.globalAlpha = active ? .7 : .32;
    ctx.beginPath(); ctx.arc(0, -108, 94 + Math.sin(now * .03) * 5, 0, Math.PI * 2); ctx.stroke();
    if (move.armor && active) { ctx.font = '950 12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ARMOR', 0, -210); }
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
  if (key === 'f') { event.preventDefault(); toggleFrameLab(); return; }
  if (key === 'r' && mode === 'training') { event.preventDefault(); resetTrainingDummy(); return; }
  if (key === 't' && mode === 'training') { event.preventDefault(); toggleTrainingRecord(); return; }
  if (key === 'y' && mode === 'training') { event.preventDefault(); toggleTrainingReplay(); return; }
  if (key === 'p') { event.preventDefault(); togglePause(); return; }
  if (['a', 'd', 'w', 's', 'c', 'e', 'j', 'k', 'n', 'm', 'l', 'i', 'u', 'o'].includes(key)) { event.preventDefault(); if (!keys.has(key)) { justPressed.add(key); if ((key === 'a' || key === 'd') && performance.now() - lastDirectionPress[key] < 240) justPressed.add(key === 'a' ? 'dashLeft' : 'dashRight'); if (key === 'a' || key === 'd') lastDirectionPress[key] = performance.now(); } keys.add(key); }
  if (key === 'enter' && state === 'menu') showCharacterSelect('cpu');
}
function handleKeyUp(event) { const key = event.key.toLowerCase(); keys.delete(key); }

function wireControls() {
  window.addEventListener('keydown', handleKeyDown, { passive: false }); window.addEventListener('keyup', handleKeyUp);
  startButton.addEventListener('click', () => showCharacterSelect('cpu')); trainingButton.addEventListener('click', () => showCharacterSelect('training')); arcadeButton.addEventListener('click', () => showCharacterSelect('arcade')); confirmCharacterButton.addEventListener('click', () => startMatch(selectionMode));
  playerSlotButton.addEventListener('click', () => { selectionTarget = 'player'; renderCharacterSelect(); }); cpuSlotButton.addEventListener('click', () => { selectionTarget = 'cpu'; renderCharacterSelect(); });
  assistButton.addEventListener('click', () => {
    assistMode = !assistMode;
    assistButton.textContent = `ASSIST: ${assistMode ? 'ON' : 'OFF'}`;
    assistButton.classList.toggle('is-on', assistMode);
    assistButton.setAttribute('aria-pressed', String(assistMode));
  });
  backToTitleButton.addEventListener('click', showTitleScreen);
  audioButton.addEventListener('click', toggleAudio);
  difficultySelect.addEventListener('change', () => { cpuDifficulty = difficultySelect.value; trainingNote.textContent = `CPU ${CPU_DIFFICULTIES[cpuDifficulty].label}：${cpuDifficulty === 'easy' ? '攻撃予兆あり・被ダメージ軽減' : cpuDifficulty === 'hard' ? '予兆短め・攻撃圧力高め' : '標準ルール'}。`; });
  frameLabButton.addEventListener('click', toggleFrameLab);
  punishDrillButton?.addEventListener('click', startPunishDrill);
  mixupDrillButton?.addEventListener('click', startMixupDrill);
  characterTrialButton?.addEventListener('click', startCharacterTrial);
  matchLogFilterEl?.addEventListener('change', renderMatchLogTimeline);
  matchLogTimelineEl?.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-log-index]');
    if (!button) return;
    const index = Number(button.dataset.logIndex);
    const source = lastMatchLog.length ? lastMatchLog : matchLog;
    if (!Number.isInteger(index) || !source[index]) return;
    selectedMatchLogIndex = index;
    renderMatchLogTimeline();
  });
  pauseButton.addEventListener('click', togglePause);
  mobilePauseButton.addEventListener('click', togglePause);
  shareResultButton.addEventListener('click', shareResult); nextArcadeButton.addEventListener('click', nextArcadeFight);
  resetButton.addEventListener('click', resetMatch); rematchButton.addEventListener('click', () => startMatch(mode));
  document.querySelectorAll('[data-key]').forEach((button) => {
    const key = button.dataset.key;
    const press = (event) => { event.preventDefault(); if (!keys.has(key)) justPressed.add(key); keys.add(key); };
    const release = (event) => { event.preventDefault(); keys.delete(key); };
    button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release); button.addEventListener('pointerleave', release); button.addEventListener('pointercancel', release);
  });
}

resetMatch(); wireControls(); resizeCanvas(); window.addEventListener('resize', resizeCanvas); requestAnimationFrame(loop);
