(() => {
  const canvas = document.getElementById('showroomCanvas');
  if (!canvas) return;

  const panel = document.getElementById('showroomPanel');
  const openButton = document.getElementById('showroomButton');
  const backButton = document.getElementById('showroomBackButton');
  const resetButton = document.getElementById('showroomResetButton');
  const soundButton = document.getElementById('showroomSoundButton');
  const trainingButton = document.getElementById('showroomTrainingButton');
  const dummyGuardButton = document.getElementById('showroomDummyGuardButton');
  const dummyCrouchButton = document.getElementById('showroomDummyCrouchButton');
  const punishDrillButton = document.getElementById('showroomPunishDrillButton');
  const mixupDrillButton = document.getElementById('showroomMixupDrillButton');
  const frameLabButton = document.getElementById('showroomFrameLabButton');
  const rosterEl = document.getElementById('showroomRoster');
  const captionEl = document.getElementById('showroomCaption');
  const statusEl = document.getElementById('showroomStatus');
  const playerHpEl = document.getElementById('showroomPlayerHp');
  const cpuHpEl = document.getElementById('showroomCpuHp');
  const playerHealthBarEl = document.getElementById('showroomPlayerHealthBar');
  const cpuHealthBarEl = document.getElementById('showroomCpuHealthBar');
  const playerMeterEl = document.getElementById('showroomPlayerMeter');
  const cpuMeterEl = document.getElementById('showroomCpuMeter');
  const playerMeterValueEl = document.getElementById('showroomPlayerMeterValue');
  const cpuMeterValueEl = document.getElementById('showroomCpuMeterValue');
  const playerComboEl = document.getElementById('showroomPlayerCombo');
  const cpuComboEl = document.getElementById('showroomCpuCombo');
  const fightBannerEl = document.getElementById('showroomFightBanner');
  const resultCardEl = document.getElementById('showroomResultCard');
  const resultTitleEl = document.getElementById('showroomResultTitle');
  const resultMessageEl = document.getElementById('showroomResultMessage');
  const resultRematchButton = document.getElementById('showroomResultRematchButton');
  const resultBackButton = document.getElementById('showroomResultBackButton');
  const cameraReadoutEl = document.getElementById('showroomCameraReadout');
  const roundReadoutEl = document.getElementById('showroomRoundReadout');
  const frameReadoutEl = document.getElementById('showroomFrameReadout');
  const logReadoutEl = document.getElementById('showroomLogReadout');
  const logSummaryEl = document.getElementById('showroomLogSummary');
  const logTimelineEl = document.getElementById('showroomLogTimeline');
  const difficultySelect = document.getElementById('difficultySelect');
  const roster = window.LUNA_ROSTER || {};
  const rosterOrder = Object.keys(roster);
  const input = new Set();
  const pressed = new Set();
  const duel = { open: false, playerId: 'luna', cpuId: 'neko', playerX: -1.7, cpuX: 1.7, playerAir: 0, cpuAir: 0, playerAirVy: 0, cpuAirVy: 0, playerHp: 100, cpuHp: 100, playerMeter: 0, cpuMeter: 0, playerAttack: null, cpuAttack: null, cpuTelegraph: null, playerInputBuffer: null, cpuInputBuffer: null, playerGuard: false, cpuGuard: false, playerCrouch: false, cpuCrouch: false, cpuGuardTimer: 0, cpuGuardMode: 'STAND', cpuPunishTarget: null, playerStun: 0, cpuStun: 0, playerBlockstun: 0, cpuBlockstun: 0, playerGuardRecovery: 0, cpuGuardRecovery: 0, playerKnockdown: 0, cpuKnockdown: 0, playerWakeup: 0, cpuWakeup: 0, playerWakeupOption: 'AUTO', cpuWakeupOption: 'AUTO', cpuOkiReason: '', playerThrowInvuln: 0, cpuThrowInvuln: 0, playerHitFlash: 0, cpuHitFlash: 0, playerCombo: 0, cpuCombo: 0, playerComboTimer: 0, cpuComboTimer: 0, playerComboScale: 1, cpuComboScale: 1, playerFrameAdvantage: null, cpuFrameAdvantage: null, last3DContact: '', playerRounds: 0, cpuRounds: 0, round: 1, roundClock: 60, roundPause: 0, roundResult: '', cooldown: 0, cpuCooldown: 0, playerAction: 0, cpuAction: 0, roundIntro: 0, angle: 0.35, cameraAngle: 0.35, cameraLocked: false, dragging: false, lastPointerX: 0, paused: false, last: 0, cameraShake: 0, hitstop: 0, soundEnabled: false, effects: [], result: '', lastImpact: '' };
  duel.training = false;
  duel.trainingGuard = false;
  duel.trainingCrouch = false;
  duel.trainingDrill = '';
  duel.trainingDrillTimer = 0;
  duel.trainingMixupStep = 0;
  duel.trainingMixupTimer = 0;
  duel.frameLab = false;
  duel.fightLog = [];
  const DUEL_DIFFICULTIES = {
    easy: { defenseRead: .28, guardHold: .24, mixup: .58, punish: 0, cooldown: 1.25, approach: 1.15, telegraph: .52 },
    normal: { defenseRead: .55, guardHold: .34, mixup: 1, punish: .38, cooldown: 1, approach: 1.4, telegraph: .34 },
    hard: { defenseRead: .88, guardHold: .42, mixup: 1.22, punish: 1, cooldown: .72, approach: 1.65, telegraph: .19 }
  };
  function getDuelDifficulty() { return DUEL_DIFFICULTIES[difficultySelect?.value] || DUEL_DIFFICULTIES.normal; }
  function getDuelDifficultyName() { return difficultySelect?.value || 'normal'; }
  const JUMP_SPEED = 5.6;
  const AIR_GRAVITY = 15.5;
  const MOVE_DATA = {
    j: { label: 'LIGHT', startup: .12, active: .10, recovery: .22, damage: 8, reach: 2.30, stun: .34, knockback: .14, color: '#72dcff' },
    k: { label: 'HEAVY', startup: .22, active: .12, recovery: .38, damage: 14, reach: 2.55, stun: .48, knockback: .34, knockdown: .52, color: '#ff9d52', antiAir: true },
    n: { label: 'LOW', startup: .15, active: .10, recovery: .28, damage: 9, reach: 2.25, stun: .38, knockback: .18, color: '#8ff0bd', low: true },
    m: { label: 'OVERHEAD', startup: .27, active: .12, recovery: .42, damage: 13, reach: 2.42, stun: .52, knockback: .26, color: '#fff0a7', overhead: true },
    u: { label: 'THROW', startup: .16, active: .10, recovery: .46, damage: 18, reach: 1.65, stun: .60, knockback: .78, knockdown: .72, color: '#ffe07a', throw: true },
    l: { label: 'SPECIAL', startup: .32, active: .14, recovery: .50, damage: 20, reach: 2.85, stun: .64, knockback: .52, knockdown: .58, color: '#ff668d', meterCost: 25 }
  };
  function getDuelMove(side, key) {
    const base = MOVE_DATA[key];
    if (!base) return null;
    const id = duel[`${side}Id`];
    const tuning = {
      luna: { label: 'DAYBREAK RUSH', specialKind: 'rush', dash: .62, damage: 22, reach: 2.65, color: '#ff6682', comboRoutes: { j: ['k'], k: ['l'], n: ['l'], m: ['l'] } },
      neko: { label: 'GLITCH TRAP', specialKind: 'trap', trap: true, active: .24, damage: 18, reach: 3.15, color: '#a68cff', comboRoutes: { j: ['n'], n: ['l'], k: ['l'] } },
      kagari: { label: 'SOLAR RUSH', specialKind: 'rush', dash: .74, startup: .24, recovery: .38, damage: 24, reach: 2.72, color: '#ffb347', comboRoutes: { j: ['j', 'k'], k: ['l'] } },
      mizuki: { label: 'PHASE NOTE', specialKind: 'wave', active: .22, damage: 18, reach: 3.55, stun: .72, color: '#72dcff', comboRoutes: { j: ['n'], n: ['l'], m: ['l'] } },
      bolt9: { label: 'MAGNET ARMOR', specialKind: 'armor', armor: true, startup: .28, recovery: .62, damage: 25, reach: 2.72, color: '#63f2ce', comboRoutes: { j: ['k'], k: ['l'] } },
      vanta: { label: 'HEX BURST', specialKind: 'burst', active: .20, damage: 27, reach: 3.12, stun: .78, color: '#ff4fc3', comboRoutes: { j: ['m'], m: ['l'], k: ['l'] } },
      sylfa: { label: 'WIND VEIL', specialKind: 'wave', dash: .24, active: .22, damage: 17, reach: 3.62, stun: .70, color: '#8ff0bd', comboRoutes: { j: ['n'], n: ['l'], m: ['l'] } },
      ryuga: { label: 'DRAGON FLARE', specialKind: 'armor', armor: true, dash: .28, damage: 30, reach: 2.82, color: '#ff7a35', comboRoutes: { j: ['k'], k: ['l'] } },
      piko: { label: 'SLIME BOUNCE', specialKind: 'bounce', dash: .56, startup: .18, recovery: .30, damage: 20, reach: 2.52, stun: .70, color: '#ff8fca', comboRoutes: { j: ['m', 'n'], n: ['l'], m: ['l'] } },
      orbis: { label: 'ORBIT BREAK', specialKind: 'orbit', teleport: true, active: .18, damage: 22, reach: 3.20, stun: .74, color: '#b99aff', comboRoutes: { j: ['n'], n: ['l'], m: ['l'] } }
    };
    const normalTuning = {
      luna: { j: { normalKind: 'sun-punch', dash: .16, damage: 9, reach: 2.45, startup: .10, color: '#ffb347' } },
      neko: { j: { normalKind: 'glitch-claw', dash: .10, damage: 8, reach: 2.55, startup: .10, color: '#a68cff' } },
      kagari: { j: { normalKind: 'solar-step', dash: .38, startup: .10, damage: 7, reach: 2.40, color: '#ffb347' } },
      mizuki: { n: { normalKind: 'phase-low', pulse: true, damage: 10, reach: 3.05, stun: .44, color: '#72dcff' } },
      bolt9: { k: { normalKind: 'magnet-heavy', armor: true, damage: 17, startup: .25, recovery: .46, reach: 2.60, color: '#63f2ce' } },
      vanta: { j: { normalKind: 'hex-mark', damage: 10, reach: 2.70, startup: .14, color: '#ff4fc3' } },
      sylfa: { n: { normalKind: 'wind-slice', dash: .22, damage: 10, reach: 3.05, startup: .12, color: '#8ff0bd' } },
      ryuga: { k: { normalKind: 'dragon-crush', armor: true, damage: 18, reach: 2.78, startup: .27, recovery: .50, color: '#ff7a35' } },
      piko: { m: { normalKind: 'bounce-overhead', dash: .42, damage: 12, reach: 2.56, color: '#64e6e4' } },
      orbis: { m: { normalKind: 'orbit-shift', teleport: true, damage: 12, startup: .22, reach: 2.75, color: '#b99aff' } }
    };
    return key === 'l' ? { ...base, ...(tuning[id] || {}) } : { ...base, ...(normalTuning[id]?.[key] || {}) };
  }

  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) { statusEl.textContent = 'WEBGL UNAVAILABLE / 2D READY'; return; }

  const vertexShader = `attribute vec3 aPosition; attribute vec3 aNormal; uniform mat4 uModel; uniform mat4 uViewProjection; varying vec3 vNormal; void main(){ vNormal=aNormal; gl_Position=uViewProjection*uModel*vec4(aPosition,1.0); }`;
  const fragmentShader = `precision mediump float; uniform vec3 uColor; uniform float uGlow; varying vec3 vNormal; void main(){ vec3 light=normalize(vec3(-0.35,0.9,0.8)); float diffuse=max(dot(normalize(vNormal),light),0.0); float shade=0.36+diffuse*0.72; gl_FragColor=vec4(uColor*shade+uColor*uGlow,1.0); }`;

  function compile(type, source) { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)); return shader; }
  const program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader)); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)); gl.useProgram(program); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  const locations = { position: gl.getAttribLocation(program, 'aPosition'), normal: gl.getAttribLocation(program, 'aNormal'), model: gl.getUniformLocation(program, 'uModel'), viewProjection: gl.getUniformLocation(program, 'uViewProjection'), color: gl.getUniformLocation(program, 'uColor'), glow: gl.getUniformLocation(program, 'uGlow') };

  const positions = []; const normals = [];
  const faces = [[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]], [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]], [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]], [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]], [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]], [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]];
  for (const face of faces) { const [a,b,c,d,n] = face; for (const tri of [[a,b,c],[a,c,d]]) for (const point of tri) { positions.push(...point); normals.push(...n); } }
  const positionBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); gl.enableVertexAttribArray(locations.position); gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
  const normalBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW); gl.enableVertexAttribArray(locations.normal); gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);

  const hex = (value) => { const n = parseInt(String(value || '#72dcff').replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const identity = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  // WebGL matrices are column-major. Row-major multiplication pushed every vertex outside the clip volume.
  const multiply = (a, b) => { const out = Array(16).fill(0); for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k]; return out; };
  const perspective = (fov, aspect, near, far) => { const f = 1 / Math.tan(fov / 2); return [f / aspect,0,0,0, 0,f,0,0, 0,0,(far + near) / (near - far),-1, 0,0,(2 * far * near) / (near - far),0]; };
  const lookAt = (eye, target, up) => { const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map(n => n / l); }; const sub = (a,b) => a.map((n,i) => n-b[i]); const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; const z = norm(sub(eye,target)); const x = norm(cross(up,z)); const y = cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2], -y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2], -z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2],1]; };
  const model = (x, y, z, sx, sy, sz) => { const m = identity(); m[0] = sx; m[5] = sy; m[10] = sz; m[12] = x; m[13] = y; m[14] = z; return m; };
  const drawBox = (x, y, z, sx, sy, sz, color, glow = 0) => { gl.uniformMatrix4fv(locations.model, false, new Float32Array(model(x,y,z,sx,sy,sz))); gl.uniform3fv(locations.color, new Float32Array(hex(color))); gl.uniform1f(locations.glow, glow); gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3); };
  const addEffect = (x, color, power = 1) => duel.effects.push({ x, color, power, life: .42, maxLife: .42 });
  let duelAudioContext = null;
  function unlockDuelAudio() {
    if (!duel.soundEnabled) return null;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!duelAudioContext) duelAudioContext = new AudioContextCtor();
    if (duelAudioContext.state === 'suspended') duelAudioContext.resume();
    return duelAudioContext;
  }
  function playDuelSfx(kind) {
    const context = unlockDuelAudio();
    if (!context) return;
    const profiles = { light: [330, 0.045, 'square'], heavy: [150, 0.09, 'sawtooth'], special: [520, 0.12, 'triangle'], throw: [250, 0.08, 'triangle'], hit: [180, 0.07, 'square'], block: [90, 0.055, 'square'], counter: [660, 0.11, 'sawtooth'], punish: [780, 0.15, 'sawtooth'], tech: [440, 0.10, 'triangle'], ko: [70, 0.28, 'sawtooth'] };
    const [frequency, duration, type] = profiles[kind] || profiles.hit;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * .62), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.055, now + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(now); oscillator.stop(now + duration + .02);
  }
  function toggleDuelSound() {
    duel.soundEnabled = !duel.soundEnabled;
    if (soundButton) { soundButton.textContent = `SOUND: ${duel.soundEnabled ? 'ON' : 'OFF'}`; soundButton.setAttribute('aria-pressed', String(duel.soundEnabled)); }
    if (duel.soundEnabled) playDuelSfx('special');
  }
  function toggleDuelFrameLab() {
    duel.frameLab = !duel.frameLab;
    if (frameLabButton) { frameLabButton.textContent = `3D FRAME LAB: ${duel.frameLab ? 'ON' : 'OFF'}`; frameLabButton.setAttribute('aria-pressed', String(duel.frameLab)); }
    statusEl.textContent = duel.frameLab ? 'WEBGL ONLINE / FRAME LAB / HITBOXES ON' : duel.training ? 'WEBGL ONLINE / TRAINING DUMMY' : 'WEBGL ONLINE / DUEL LIVE';
    setShowroomBanner(duel.frameLab ? 'FRAME LAB ON' : 'FRAME LAB OFF', 520);
  }
  function queueCpuTelegraph(key) {
    if (duel.cpuTelegraph || duel.cpuAttack || duel.cpuHp <= 0) return false;
    const move = getDuelMove('cpu', key);
    if (!move) return false;
    duel.cpuTelegraph = { key, ttl: getDuelDifficulty().telegraph };
    statusEl.textContent = `WEBGL ONLINE / CPU TELEGRAPH / ${move.label}`;
    recordDuelEvent('CPU READ', `TELEGRAPH / ${move.label}`);
    setShowroomBanner(`CPU ${move.label}`, 360);
    return true;
  }
  function isDummyGuardActive() {
    return duel.training && duel.trainingGuard && duel.cpuHp > 0 && duel.cpuAir <= 0 && duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && duel.cpuKnockdown <= 0 && duel.cpuWakeup <= 0;
  }
  function updateTrainingControls() {
    if (trainingButton) { trainingButton.textContent = `3D TRAINING: ${duel.training ? 'ON' : 'OFF'}`; trainingButton.setAttribute('aria-pressed', String(duel.training)); }
    const drillActive = Boolean(duel.trainingDrill);
    if (dummyGuardButton) { dummyGuardButton.textContent = `DUMMY GUARD: ${duel.trainingGuard ? 'ON' : 'OFF'}`; dummyGuardButton.setAttribute('aria-pressed', String(duel.trainingGuard)); dummyGuardButton.disabled = !duel.training || drillActive; }
    if (dummyCrouchButton) { dummyCrouchButton.textContent = `DUMMY CROUCH: ${duel.trainingCrouch ? 'ON' : 'OFF'}`; dummyCrouchButton.setAttribute('aria-pressed', String(duel.trainingCrouch)); dummyCrouchButton.disabled = !duel.training || !duel.trainingGuard || drillActive; }
    if (punishDrillButton) { punishDrillButton.textContent = `3D PUNISH DRILL: ${duel.trainingDrill === 'punish' ? 'ON' : 'OFF'}`; punishDrillButton.setAttribute('aria-pressed', String(duel.trainingDrill === 'punish')); punishDrillButton.disabled = !duel.training; }
    if (mixupDrillButton) { mixupDrillButton.textContent = `3D MIXUP DRILL: ${duel.trainingDrill === 'mixup' ? 'ON' : 'OFF'}`; mixupDrillButton.setAttribute('aria-pressed', String(duel.trainingDrill === 'mixup')); mixupDrillButton.disabled = !duel.training; }
  }
  function arm3DPunishDrill() {
    if (!duel.training || duel.trainingDrill !== 'punish' || duel.cpuAttack || duel.cpuHp <= 0 || duel.cpuStun > 0 || duel.cpuBlockstun > 0 || duel.cpuGuardRecovery > 0 || duel.cpuKnockdown > 0 || duel.cpuWakeup > 0) return false;
    const move = getDuelMove('cpu', 'k');
    duel.cpuGuard = false;
    duel.cpuCrouch = false;
    duel.cpuAttack = { ...move, key: 'k', elapsed: move.startup + move.active + .02, hitDone: false, dashed: false, teleported: false, result: 'WHIFF', drill: true, recovery: 2.9 };
    duel.cpuAction = 1;
    duel.trainingDrillTimer = 2.9;
    statusEl.textContent = 'WEBGL ONLINE / 3D PUNISH DRILL / HEAVY RECOVERY';
    setShowroomBanner('PUNISH DRILL', 560);
    return true;
  }
  function set3DMixupPhase(step) {
    const phases = [
      { guard: true, crouch: false, label: 'STAND GUARD' },
      { guard: true, crouch: true, label: 'CROUCH GUARD' },
      { guard: false, crouch: false, label: 'OPEN / THROW' }
    ];
    const phase = phases[step % phases.length];
    duel.trainingMixupStep = step % phases.length;
    duel.trainingGuard = phase.guard;
    duel.trainingCrouch = phase.crouch;
    duel.trainingMixupTimer = 2.25;
    statusEl.textContent = `WEBGL ONLINE / 3D MIXUP / ${phase.label}`;
    setShowroomBanner(phase.label, 500);
  }
  function arm3DMixupDrill() {
    if (!duel.training || duel.trainingDrill !== 'mixup') return false;
    duel.cpuAttack = null;
    duel.cpuStun = 0;
    duel.cpuBlockstun = 0;
    duel.cpuGuardRecovery = 0;
    set3DMixupPhase(duel.trainingMixupStep);
    return true;
  }
  function toggle3DTrainingDrill(kind) {
    if (!duel.training) { statusEl.textContent = 'WEBGL ONLINE / ENABLE 3D TRAINING'; return; }
    duel.trainingDrill = duel.trainingDrill === kind ? '' : kind;
    duel.trainingDrillTimer = 0;
    duel.trainingMixupTimer = 0;
    duel.trainingMixupStep = 0;
    duel.trainingGuard = false;
    duel.trainingCrouch = false;
    resetDuelFightLog();
    reset();
    duel.cpuTelegraph = null;
    duel.roundIntro = 0;
    duel.playerX = -.85;
    duel.cpuX = .85;
    if (duel.trainingDrill === 'punish') arm3DPunishDrill();
    if (duel.trainingDrill === 'mixup') arm3DMixupDrill();
    updateTrainingControls();
    if (!duel.trainingDrill) statusEl.textContent = 'WEBGL ONLINE / TRAINING DUMMY';
  }
  function toggleDuelTraining() {
    duel.training = !duel.training;
    if (!duel.training) { duel.trainingGuard = false; duel.trainingCrouch = false; duel.trainingDrill = ''; }
    else { duel.trainingDrill = ''; }
    resetDuelFightLog();
    reset();
    duel.cpuTelegraph = null;
    duel.roundIntro = 0;
    updateTrainingControls();
    statusEl.textContent = duel.training ? 'WEBGL ONLINE / TRAINING DUMMY' : 'WEBGL ONLINE / DUEL LIVE';
  }
  function toggleDummyGuard() {
    if (!duel.training) { statusEl.textContent = 'WEBGL ONLINE / ENABLE 3D TRAINING'; return; }
    duel.trainingGuard = !duel.trainingGuard;
    if (!duel.trainingGuard) duel.trainingCrouch = false;
    updateTrainingControls();
    statusEl.textContent = `WEBGL ONLINE / TRAINING / ${duel.trainingGuard ? duel.trainingCrouch ? 'CROUCH GUARD' : 'STAND GUARD' : 'DUMMY IDLE'}`;
  }
  function toggleDummyCrouch() {
    if (!duel.training || !duel.trainingGuard) { statusEl.textContent = 'WEBGL ONLINE / ENABLE DUMMY GUARD'; return; }
    duel.trainingCrouch = !duel.trainingCrouch;
    updateTrainingControls();
    statusEl.textContent = `WEBGL ONLINE / TRAINING / ${duel.trainingCrouch ? 'CROUCH GUARD' : 'STAND GUARD'}`;
  }

  function drawAgent(id, x, t, facing, action, attackData, guarding, crouching, hitFlash, stunned, hp, knockedDown = 0, wakeup = 0, airLift = 0) {
    const agent = roster[id] || roster.luna || { name: 'LUNA', accent: '#ff9d52', role: 'BALANCED' }; const accent = agent.accent || '#ff9d52'; const dark = '#10152e'; const white = '#eaf5ff';
    const drawAgentBox = (boxX, boxY, ...args) => drawBox(boxX, boxY + airLift, ...args);
    const attackKey = attackData?.key || ''; const specialKind = attackData?.specialKind || ''; const normalKind = attackData?.normalKind || ''; const attackPhase = attackData ? Math.min(1, attackData.elapsed / Math.max(.01, attackData.startup + attackData.active + attackData.recovery)) : 0; const attackReach = attackKey === 'l' ? .52 : attackKey === 'k' ? .42 : attackKey === 'm' ? .34 : attackKey === 'n' ? .28 : attackKey === 'u' ? .20 : .31; const attackLift = attackKey === 'm' ? .24 : attackKey === 'n' ? -.18 : attackKey === 'u' ? .08 : 0;
    const bob = hp <= 0 ? -.18 : Math.sin(t * 4 + (x < 0 ? 0 : 1)) * .045; const stance = crouching || attackKey === 'n' ? -.22 : 0; const attack = action > 0 ? Math.sin(action * 18) * .32 : 0; const front = .28; const recoil = hitFlash > 0 ? -facing * .20 : 0;
    const glow = guarding ? .24 : hitFlash > 0 ? .44 : action > 0 ? .24 : .02;
    x += recoil;
    if (knockedDown > 0 || hp <= 0) {
      const downGlow = hp <= 0 ? .24 : wakeup > 0 ? .48 : .12;
      drawAgentBox(x, .34 + bob, 0, .66, .16, .30, dark, downGlow);
      drawAgentBox(x + facing * .34, .52 + bob, .02, .34, .16, .25, accent, downGlow + .08);
      drawAgentBox(x - facing * .38, .48 + bob, .01, .22, .20, .22, white, hitFlash > 0 ? .35 : .06);
      drawAgentBox(x + facing * .68, .34 + bob, .02, .16, .10, .18, accent, .2);
      if (wakeup > 0) drawAgentBox(x, .78 + bob, .48, .06, .06, .06, '#fff0a7', .72);
      return;
    }
    drawAgentBox(x, .45 + bob + stance, 0, .24, .55, .25, dark, glow); drawAgentBox(x - .22, .44 + bob + stance, 0, .16, .52, .2, accent, glow); drawAgentBox(x + .22, .44 + bob + stance, 0, .16, .52, .2, accent, glow);
    drawAgentBox(x, 1.42 + bob + stance, 0, .47, .72, .34, dark, glow); drawAgentBox(x, 1.46 + bob + stance, .02, .37, .55, .28, accent, action > 0 ? .15 : glow); drawAgentBox(x, 2.38 + bob + stance, 0, .48, .48, .44, '#050817', .08); drawAgentBox(x, 2.38 + bob + stance, .01, .40, .40, .37, white, hitFlash > 0 ? .35 : .02); drawAgentBox(x, 2.39 + bob + stance, front, .23, .10, .04, accent, .25);
    drawAgentBox(x - .58, 1.44 + bob + stance, front * .3, .13, .55, .14, accent, glow); drawAgentBox(x + .58, 1.44 + bob + stance, front * .3, .13, .55, .14, accent, glow); drawAgentBox(x + facing * (.53 + attackReach * attackPhase + Math.abs(attack)), 1.42 + bob + stance + attackLift, front * .5, .16 + attackPhase * .08, .14 + attackPhase * .12, .17, action > 0 ? '#fff0a7' : accent, action > 0 ? .4 : .03);
    if (attackKey === 'm' && attackPhase > .18) drawAgentBox(x + facing * .35, 2.04 + bob + stance, front * .45, .12, .38, .14, '#fff0a7', .42);
    if (attackKey === 'n' && attackPhase > .18) drawAgentBox(x + facing * .38, 1.02 + bob + stance, front * .45, .14, .12, .18, '#8ff0bd', .42);
    if (attackKey === 'u' && attackPhase > .12) drawAgentBox(x + facing * .42, 1.70 + bob + stance, front * .48, .20, .10, .18, '#ffe07a', .48);
    if (normalKind === 'solar-step' && attackPhase > .12) {
      drawAgentBox(x + facing * .86, 1.10 + bob + stance, front * .62, .46, .06, .06, '#ffb347', .76);
      drawAgentBox(x + facing * .62, .72 + bob, front * .62, .28, .04, .04, '#fff0a7', .58);
    }
    if (normalKind === 'phase-low' && attackPhase > .16) {
      drawAgentBox(x + facing * .92, .58 + bob + stance, front * .62, .52, .05, .05, '#72dcff', .72);
      drawAgentBox(x + facing * 1.18, .66 + bob + stance, front * .62, .30, .04, .04, '#eaf5ff', .56);
    }
    if (normalKind === 'magnet-heavy' && attackPhase > .12) {
      drawAgentBox(x + facing * .82, 1.45 + bob + stance, front * .62, .12, .45, .12, '#63f2ce', .76);
      drawAgentBox(x + facing * .84, 1.45 + bob + stance, front * .62, .45, .06, .06, '#fff0a7', .54);
      if (attackData.armor) drawAgentBox(x, 1.45 + bob + stance, -.05, .70, .82, .05, '#fff0a7', .30);
    }
    if (normalKind === 'bounce-overhead' && attackPhase > .14) {
      drawAgentBox(x + facing * .78, 2.18 + bob + stance, front * .62, .15, .36, .10, '#64e6e4', .72);
      drawAgentBox(x + facing * .98, 2.62 + bob + stance, front * .62, .14, .14, .08, '#fff0a7', .58);
    }
    if (normalKind === 'orbit-shift' && attackPhase > .14) {
      drawAgentBox(x + facing * .52, 1.46 + bob + stance, -.12, .08, .62, .04, '#b99aff', .72);
      drawAgentBox(x + facing * .52, 1.46 + bob + stance, .48, .08, .62, .04, '#b99aff', .72);
    }
    if (normalKind === 'sun-punch' && attackPhase > .12) {
      drawAgentBox(x + facing * .92, 1.44 + bob + stance, front * .62, .26, .26, .12, '#ffb347', .82);
      drawAgentBox(x + facing * 1.18, 1.44 + bob + stance, front * .62, .08, .48, .05, '#fff0a7', .62);
    }
    if (normalKind === 'glitch-claw' && attackPhase > .12) {
      for (let i = 0; i < 3; i += 1) drawAgentBox(x + facing * (.72 + i * .12), 1.18 + bob + stance + (i - 1) * .22, front * (.62 + i * .02), .44, .05, .04, i % 2 ? '#e6d8ff' : '#a68cff', .74);
      drawAgentBox(x + facing * 1.10, 1.74 + bob + stance, front * .62, .08, .08, .08, '#fff0a7', .55);
    }
    if (normalKind === 'hex-mark' && attackPhase > .14) {
      drawAgentBox(x + facing * .92, 1.54 + bob + stance, front * .62, .06, .42, .06, '#ff4fc3', .78);
      drawAgentBox(x + facing * .92, 1.54 + bob + stance, front * .62, .42, .06, .06, '#ff4fc3', .78);
      drawAgentBox(x + facing * 1.08, 1.54 + bob + stance, front * .62, .18, .18, .04, '#fff0a7', .58);
    }
    if (normalKind === 'wind-slice' && attackPhase > .14) {
      drawAgentBox(x + facing * .98, .78 + bob + stance, front * .62, .72, .04, .04, '#8ff0bd', .76);
      drawAgentBox(x + facing * 1.28, .98 + bob + stance, front * .62, .42, .03, .03, '#eafff4', .58);
      drawAgentBox(x + facing * 1.48, 1.18 + bob + stance, front * .62, .22, .03, .03, '#8ff0bd', .48);
    }
    if (normalKind === 'dragon-crush' && attackPhase > .12) {
      drawAgentBox(x + facing * .82, 1.46 + bob + stance, front * .62, .18, .58, .16, '#ff7a35', .82);
      drawAgentBox(x + facing * 1.02, 1.44 + bob + stance, front * .62, .52, .08, .06, '#fff0a7', .58);
      if (attackData.armor) drawAgentBox(x, 1.45 + bob + stance, -.05, .76, .88, .05, '#ffb347', .34);
    }
    if (attackKey === 'l' && attackPhase > .18) {
      const glyphX = x + facing * (.74 + attackPhase * .35);
      if (specialKind === 'wave') { drawAgentBox(glyphX, 1.34 + bob, .58, .10, .52, .08, accent, .72); drawAgentBox(glyphX + facing * .28, 1.34 + bob, .58, .08, .34, .08, accent, .52); drawAgentBox(glyphX + facing * .54, 1.34 + bob, .58, .06, .22, .08, accent, .40); }
      else if (specialKind === 'trap') { drawAgentBox(glyphX, .78 + bob, .58, .32, .06, .06, '#a68cff', .84); drawAgentBox(glyphX, .78 + bob, .58, .06, .32, .06, '#a68cff', .84); }
      else if (specialKind === 'orbit') { drawAgentBox(glyphX, 1.42 + bob, .58, .24, .06, .06, '#b99aff', .84); drawAgentBox(glyphX, 1.42 + bob, .58, .06, .24, .06, '#b99aff', .84); }
      else if (specialKind === 'burst' || specialKind === 'armor') { drawAgentBox(glyphX, 1.42 + bob, .58, .28, .28, .08, accent, .76); }
      else { drawAgentBox(glyphX, 1.42 + bob, .58, .20, .20, .12, accent, .64); }
    }
    if (guarding) { drawAgentBox(x + facing * .72, 1.55 + bob + stance, .34, .06, .72, .06, '#b8c6ff', .72); drawAgentBox(x + facing * .72, 1.55 + bob + stance, .34, .72, .06, .06, '#b8c6ff', .72); }
    if (stunned > 0) drawAgentBox(x, 3.10 + bob + stance, .08, .08, .08, .08, '#fff0a7', .8);
    if (agent.role === 'DRAGON' || agent.role === 'POWER') { drawAgentBox(x - .27, 2.77 + bob, 0, .10, .22, .12, accent, .15); drawAgentBox(x + .27, 2.77 + bob, 0, .10, .22, .12, accent, .15); }
    if (agent.role === 'TANK') { drawAgentBox(x - .52, 1.86 + bob, 0, .20, .20, .35, '#6e7fa5'); drawAgentBox(x + .52, 1.86 + bob, 0, .20, .20, .35, '#6e7fa5'); }
    if (agent.role === 'WIND') { drawAgentBox(x - .76, 1.85 + bob, -.05, .08, .62, .08, '#8ff0bd', .2); drawAgentBox(x + .76, 1.85 + bob, -.05, .08, .62, .08, '#8ff0bd', .2); }
    if (agent.role === 'COSMIC') { drawAgentBox(x, 3.00 + bob, 0, .12, .12, .12, '#b99aff', .55); drawAgentBox(x, 1.95 + bob, -.40, .08, .08, .08, '#b99aff', .35); }
    if (agent.role === 'CHAOS') { drawAgentBox(x - .34, 2.92 + bob, 0, .08, .08, .08, '#64e6e4', .55); drawAgentBox(x + .34, 2.92 + bob, 0, .08, .08, .08, '#64e6e4', .55); }
  }

  function isBattleCameraLocked() {
    return Boolean(duel.playerAttack || duel.cpuAttack || duel.playerStun > 0 || duel.cpuStun > 0 || duel.playerBlockstun > 0 || duel.cpuBlockstun > 0 || duel.playerGuardRecovery > 0 || duel.cpuGuardRecovery > 0 || duel.playerKnockdown > 0 || duel.cpuKnockdown > 0 || duel.playerWakeup > 0 || duel.cpuWakeup > 0 || duel.roundResult || duel.result);
  }
  function drawDuelFrameLab() {
    const drawFighterBoxes = (side, facing, color) => {
      const x = duel[`${side}X`];
      const air = duel[`${side}Air`];
      const crouch = duel[`${side}Crouch`];
      const lift = air > 0 ? air : 0;
      const stance = crouch ? -.22 : 0;
      const attack = duel[`${side}Attack`];
      const hurtHeight = crouch ? 1.05 : 1.42;
      drawBox(x, 1.38 + lift + stance, .72, .50, hurtHeight, .025, color, .22);
      drawBox(x + facing * .58, 1.42 + lift + stance, .74, .06, .72, .035, '#ff6d8e', .58);
      if (attack) {
        const phase = attack.elapsed < attack.startup ? 'STARTUP' : attack.elapsed <= attack.startup + attack.active ? 'ACTIVE' : 'RECOVERY';
        const reach = attack.reach || 0;
        const boxWidth = Math.max(.08, reach * .5);
        const boxCenter = x + facing * (reach * .5 + .36);
        const boxY = attack.key === 'n' ? .92 + lift + stance : attack.key === 'm' ? 2.05 + lift + stance : 1.48 + lift + stance;
        const attackColor = phase === 'ACTIVE' ? '#ffcf66' : phase === 'STARTUP' ? '#72dcff' : '#a68cff';
        drawBox(boxCenter, boxY, .78, boxWidth, attack.key === 'u' ? .24 : .15, .04, attackColor, .65);
      }
    };
    drawFighterBoxes('player', 1, '#72dcff');
    drawFighterBoxes('cpu', -1, '#ff668d');
  }
  function drawArena(t) {
    const aspect = Math.max(1, canvas.width / Math.max(1, canvas.height));
    duel.cameraLocked = isBattleCameraLocked();
    const targetAngle = duel.cameraLocked ? 0 : duel.angle;
    duel.cameraAngle += (targetAngle - duel.cameraAngle) * .12;
    const shake = duel.cameraShake > 0 ? duel.cameraShake * 0.22 : 0;
    const center = (duel.playerX + duel.cpuX) * .5;
    const separation = Math.abs(duel.cpuX - duel.playerX);
    const cameraDistance = 8.2 + Math.min(2.2, Math.max(0, separation - 3) * .75);
    const eye = [Math.sin(duel.cameraAngle) * cameraDistance + Math.sin(t * 70) * shake, 4.2 + Math.cos(t * 63) * shake, Math.cos(duel.cameraAngle) * cameraDistance];
    const vp = multiply(perspective(Math.PI / 3.3, aspect, .1, 100), lookAt(eye, [center,1.35,0], [0,1,0]));
    cameraReadoutEl.textContent = duel.cameraLocked ? 'BATTLE LOCK / SIDE VIEW' : `SHOWROOM ORBIT ${Math.round((duel.angle * 180 / Math.PI + 360) % 360)}°`;
    gl.uniformMatrix4fv(locations.viewProjection, false, new Float32Array(vp)); gl.clearColor(.035, .055, .14, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawBox(0, -.22, 0, 5.4, .22, 3.2, '#17224a'); for (let x = -5; x <= 5; x++) drawBox(x, .015, 0, .012, .015, 3, '#2b5d88', .05); for (let z = -3; z <= 3; z++) drawBox(0, .02, z, 5.3, .015, .012, '#2b5d88', .05);
    drawBox(0, 2.7, -2.9, 5.2, 2.7, .12, '#141a3a'); drawBox(0, .9, -2.72, 5.0, .04, .04, '#72dcff', .32); drawBox(-3.9, 1.35, -2.48, .52, 1.35, .18, '#ff9d52', .12); drawBox(3.9, 1.35, -2.48, .52, 1.35, .18, '#a68cff', .12); drawBox(0, 3.55, -2.55, 1.0, .12, .12, '#ffe07a', .3);
    if (duel.playerAir > 0) drawBox(duel.playerX, .035, .18, Math.max(.18, .46 - duel.playerAir * .06), .018, Math.max(.08, .22 - duel.playerAir * .025), '#10152e', .12);
    if (duel.cpuAir > 0) drawBox(duel.cpuX, .035, .18, Math.max(.18, .46 - duel.cpuAir * .06), .018, Math.max(.08, .22 - duel.cpuAir * .025), '#10152e', .12);
    drawAgent(duel.playerId, duel.playerX, t, 1, duel.playerAction, duel.playerAttack, duel.playerGuard, duel.playerCrouch, duel.playerHitFlash, Math.max(duel.playerStun, duel.playerBlockstun, duel.playerGuardRecovery), duel.playerHp, duel.playerKnockdown, duel.playerWakeup, duel.playerAir); drawAgent(duel.cpuId, duel.cpuX, t + .7, -1, duel.cpuAction, duel.cpuAttack, duel.cpuGuard, duel.cpuCrouch, duel.cpuHitFlash, Math.max(duel.cpuStun, duel.cpuBlockstun, duel.cpuGuardRecovery), duel.cpuHp, duel.cpuKnockdown, duel.cpuWakeup, duel.cpuAir);
    if (duel.frameLab) drawDuelFrameLab();
    if (duel.cpuTelegraph) { const pulse = .12 + Math.sin(t * 18) * .04; drawBox(duel.cpuX, 3.26, .72, pulse, .05, .05, '#fff0a7', .82); }
    for (const effect of duel.effects) { const p = 1 - effect.life / effect.maxLife; const span = .22 + p * .62; drawBox(effect.x, 1.3 + Math.sin(p * Math.PI) * .45, .55, span, .08, .08, effect.color, .8); drawBox(effect.x, 1.3 + Math.sin(p * Math.PI) * .45, .55, .08, span, .08, effect.color, .8); drawBox(effect.x, 1.3, .55, .08, .08, span, effect.color, .8); }
  }

  function resize() { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(320, Math.floor(rect.width * dpr)); canvas.height = Math.max(240, Math.floor(rect.height * dpr)); gl.viewport(0, 0, canvas.width, canvas.height); }
  let bannerTimer = 0;
  function setShowroomBanner(message, duration = 900) { if (!fightBannerEl) return; window.clearTimeout(bannerTimer); fightBannerEl.textContent = message; fightBannerEl.classList.remove('is-showing'); if (!message) return; void fightBannerEl.offsetWidth; fightBannerEl.classList.add('is-showing'); bannerTimer = window.setTimeout(() => fightBannerEl.classList.remove('is-showing'), duration); }
  function getDuelAgentName(side) { return roster[duel[`${side}Id`]]?.name || (side === 'player' ? 'YOU' : 'CPU'); }
  function hideDuelResult() { if (resultCardEl) resultCardEl.hidden = true; }
  function showDuelResult() { const playerWon = duel.playerRounds > duel.cpuRounds; if (resultTitleEl) resultTitleEl.textContent = playerWon ? `${getDuelAgentName('player')} WINS / 3D CLEAR` : `${getDuelAgentName('cpu')} WINS / RETRY`; if (resultMessageEl) resultMessageEl.textContent = `${duel.fightLog.length} EVENTS SAVED / LOCAL ONLY`; if (resultCardEl) resultCardEl.hidden = false; }
  const comboDamageScale = (comboCount) => Math.max(.55, 1 - Math.max(0, comboCount) * .08);
  const formatFrameAdvantage = (value) => value === null || value === undefined ? '--' : `${value > 0 ? '+' : ''}${value}F`;
  function renderDuelFightLog() {
    const count = duel.fightLog.length;
    if (logReadoutEl) logReadoutEl.textContent = `${count} EVENTS / LOCAL`;
    if (logSummaryEl) logSummaryEl.textContent = `LOCAL ONLY / ${count} EVENTS`;
    if (!logTimelineEl) return;
    logTimelineEl.replaceChildren();
    duel.fightLog.slice(-8).reverse().forEach((event) => {
      const item = document.createElement('li');
      item.textContent = `F${String(event.frame).padStart(4, '0')} / ${event.kind} / ${event.label}`;
      logTimelineEl.appendChild(item);
    });
  }
  function resetDuelFightLog() {
    hideDuelResult();
    duel.fightLog.length = 0;
    renderDuelFightLog();
    recordDuelEvent('ROUND', 'ROUND 01 / READY', 0);
  }
  function recordDuelEvent(kind, label, frameOverride = null) {
    const frame = frameOverride === null ? Math.max(0, Math.round((60 - duel.roundClock) * 60)) : frameOverride;
    duel.fightLog.push({ frame, kind, label });
    if (duel.fightLog.length > 40) duel.fightLog.shift();
    renderDuelFightLog();
  }
  function updateHud() { playerHpEl.textContent = String(Math.round(duel.playerHp)); cpuHpEl.textContent = String(Math.round(duel.cpuHp)); playerHealthBarEl.style.width = `${duel.playerHp}%`; cpuHealthBarEl.style.width = `${duel.cpuHp}%`; if (playerMeterEl) playerMeterEl.style.width = `${duel.playerMeter}%`; if (cpuMeterEl) cpuMeterEl.style.width = `${duel.cpuMeter}%`; if (playerMeterValueEl) playerMeterValueEl.textContent = String(Math.round(duel.playerMeter)); if (cpuMeterValueEl) cpuMeterValueEl.textContent = String(Math.round(duel.cpuMeter)); if (playerComboEl) playerComboEl.textContent = duel.playerCombo > 1 ? `${duel.playerCombo} HIT COMBO / ${Math.round(duel.playerComboScale * 100)}% DMG` : ''; if (cpuComboEl) cpuComboEl.textContent = duel.cpuCombo > 1 ? `${duel.cpuCombo} HIT COMBO / ${Math.round(duel.cpuComboScale * 100)}% DMG` : ''; if (frameReadoutEl) frameReadoutEl.textContent = duel.frameLab ? `FRAME LAB / P:${duel.playerAttack ? duel.playerAttack.key.toUpperCase() : '--'} / C:${duel.cpuAttack ? duel.cpuAttack.key.toUpperCase() : '--'}` : duel.last3DContact ? `${duel.last3DContact} / YOU ${formatFrameAdvantage(duel.playerFrameAdvantage)} / CPU ${formatFrameAdvantage(duel.cpuFrameAdvantage)}` : 'LAST CONTACT / --'; const player = roster[duel.playerId] || {}; captionEl.textContent = `${player.name || duel.playerId} / ${player.title || '3D AGENT'} VS ${(roster[duel.cpuId] || {}).name || duel.cpuId}`; cameraReadoutEl.textContent = `BATTLE ORBIT ${Math.round((duel.angle * 180 / Math.PI + 360) % 360)}°`; roundReadoutEl.textContent = `${String(duel.round).padStart(2, '0')} / ${duel.playerRounds}-${duel.cpuRounds} / FIRST TO TWO`; }
  function resetRound() { duel.playerX = -1.7; duel.cpuX = 1.7; duel.playerAir = 0; duel.cpuAir = 0; duel.playerAirVy = 0; duel.cpuAirVy = 0; duel.playerHp = 100; duel.cpuHp = 100; duel.playerAttack = null; duel.cpuAttack = null; duel.playerInputBuffer = null; duel.cpuInputBuffer = null; duel.playerGuard = false; duel.cpuGuard = false; duel.playerCrouch = false; duel.cpuCrouch = false; duel.cpuGuardTimer = 0; duel.cpuGuardMode = 'STAND'; duel.cpuPunishTarget = null; duel.playerStun = 0; duel.cpuStun = 0; duel.playerBlockstun = 0; duel.cpuBlockstun = 0; duel.playerGuardRecovery = 0; duel.cpuGuardRecovery = 0; duel.playerKnockdown = 0; duel.cpuKnockdown = 0; duel.playerWakeup = 0; duel.cpuWakeup = 0; duel.playerWakeupOption = 'AUTO'; duel.cpuWakeupOption = 'AUTO'; duel.cpuOkiReason = ''; duel.playerThrowInvuln = 0; duel.cpuThrowInvuln = 0; duel.playerHitFlash = 0; duel.cpuHitFlash = 0; duel.playerCombo = 0; duel.cpuCombo = 0; duel.playerComboTimer = 0; duel.cpuComboTimer = 0; duel.playerComboScale = 1; duel.cpuComboScale = 1; duel.playerFrameAdvantage = null; duel.cpuFrameAdvantage = null; duel.last3DContact = ''; duel.roundClock = 60; duel.roundPause = 0; duel.roundResult = ''; duel.cooldown = 0; duel.cpuCooldown = 0; duel.roundIntro = .98; duel.cooldown = 0; duel.cpuCooldown = 0; duel.hitstop = 0; duel.lastImpact = ''; }
  function reset() { duel.playerRounds = 0; duel.cpuRounds = 0; duel.round = 1; duel.playerMeter = 0; duel.cpuMeter = 0; duel.playerAction = 0; duel.cpuAction = 0; duel.cameraShake = 0; duel.effects.length = 0; duel.paused = false; duel.result = ''; resetRound(); if (duel.training) { duel.playerX = -.85; duel.cpuX = .85; duel.roundIntro = 0; if (duel.trainingDrill === 'punish') arm3DPunishDrill(); else if (duel.trainingDrill === 'mixup') arm3DMixupDrill(); } updateTrainingControls(); statusEl.textContent = duel.training ? duel.trainingDrill === 'punish' ? 'WEBGL ONLINE / 3D PUNISH DRILL / HEAVY RECOVERY' : duel.trainingDrill === 'mixup' ? 'WEBGL ONLINE / 3D MIXUP / STAND GUARD' : 'WEBGL ONLINE / TRAINING DUMMY' : 'WEBGL ONLINE / ROUND 01 / READY'; setShowroomBanner(duel.training ? duel.trainingDrill ? duel.trainingDrill === 'punish' ? 'PUNISH DRILL' : 'MIXUP DRILL' : 'TRAINING' : 'ROUND 01', 700); updateHud(); }
  function endDuelRound(winner) { if (duel.roundResult || duel.result) return; duel.roundResult = winner; if (winner === 'player') duel.playerRounds += 1; else duel.cpuRounds += 1; const label = `${getDuelAgentName(winner)} WINS / ROUND ${duel.round}`; recordDuelEvent('ROUND', label); statusEl.textContent = label; setShowroomBanner(label, 1200); playDuelSfx('ko'); duel.roundPause = 1.2; duel.playerGuard = false; duel.cpuGuard = false; }
  function advanceDuelRound() { if (duel.playerRounds >= 2 || duel.cpuRounds >= 2) { duel.result = duel.playerRounds > duel.cpuRounds ? `${getDuelAgentName('player')} WINS / 3D CLEAR` : `${getDuelAgentName('cpu')} WINS / RETRY`; recordDuelEvent('MATCH', duel.result); statusEl.textContent = duel.result; setShowroomBanner(duel.result, 1800); showDuelResult(); return; } duel.round += 1; resetRound(); recordDuelEvent('ROUND', `ROUND ${duel.round} / FIGHT`); statusEl.textContent = `ROUND ${duel.round} / FIGHT`; setShowroomBanner(`ROUND ${String(duel.round).padStart(2, '0')} / FIGHT`, 850); }
  function applyDuelHit(attacker, defender, move, distance) {
    const defenderAttack = duel[`${defender}Attack`];
    const defenderCrouch = duel[`${defender}Crouch`];
    const defenderAir = duel[`${defender}Air`] > .05;
    if (defenderAir && (move.low || move.throw)) {
      statusEl.textContent = 'WEBGL ONLINE / AIR EVADE';
      addEffect(duel[`${defender}X`], '#fff0a7', .48);
      return;
    }
    const antiAir = defenderAir && move.antiAir;
    const armorActive = defenderAttack?.armor && defenderAttack.elapsed >= defenderAttack.startup * .55 && defenderAttack.elapsed <= defenderAttack.startup + defenderAttack.active;
    if (armorActive) {
      duel[`${attacker}Meter`] = Math.min(100, duel[`${attacker}Meter`] + 2);
      duel.cameraShake = .10;
      duel.hitstop = .08;
      addEffect(duel[`${defender}X`], '#fff0a7', .72);
      playDuelSfx('block');
      statusEl.textContent = 'WEBGL ONLINE / ARMOR';
      return;
    }
    const defenderThrow = defenderAttack?.throw;
    const defenderThrowActive = defenderThrow && defenderAttack.elapsed >= defenderAttack.startup * .55 && defenderAttack.elapsed <= defenderAttack.startup + defenderAttack.active;
    if (move.throw && duel[`${defender}ThrowInvuln`] > 0) {
      statusEl.textContent = 'WEBGL ONLINE / THROW WHIFF';
      return;
    }
    if (move.throw && defenderThrowActive) {
      duel[`${attacker}Attack`] = null;
      duel[`${defender}Attack`] = null;
      duel[`${attacker}Stun`] = .28;
      duel[`${defender}Stun`] = .28;
      duel[`${attacker}Combo`] = 0;
      duel[`${defender}Combo`] = 0;
      duel.cameraShake = .12;
      duel.hitstop = .10;
      addEffect((duel[`${attacker}X`] + duel[`${defender}X`]) * .5, '#ffe07a', .85);
      playDuelSfx('tech');
      recordDuelEvent('THROW TECH', `${attacker.toUpperCase()} / ${defender.toUpperCase()}`);
      statusEl.textContent = 'WEBGL ONLINE / THROW TECH';
      setShowroomBanner('THROW TECH', 600);
      return;
    }
    const guardHeightValid = move.low ? defenderCrouch : !move.overhead || !defenderCrouch;
    const defenderGuard = !move.throw && duel[`${defender}Guard`] && guardHeightValid && duel[`${defender}GuardRecovery`] <= 0;
    const defenderAttackEnd = defenderAttack ? defenderAttack.startup + defenderAttack.active : 0;
    const impactType = defenderAttack && defenderAttack.elapsed > defenderAttackEnd
      ? 'PUNISH'
      : defenderAttack && defenderAttack.elapsed < defenderAttack.startup
        ? 'COUNTER'
        : 'HIT';
    const impactMultiplier = impactType === 'PUNISH' ? 1.18 : impactType === 'COUNTER' ? 1.08 : 1;
    const comboScale = defenderGuard ? 1 : comboDamageScale(duel[`${attacker}Combo`]);
    const rawDamage = defenderGuard ? move.damage * .14 : move.damage * impactMultiplier * comboScale * (antiAir ? 1.28 : defenderAir ? 1.10 : 1);
    const chip = Math.max(1, Math.round(rawDamage));
    const defenderStun = defenderGuard ? 0 : move.stun + (impactType === 'PUNISH' ? .12 : impactType === 'COUNTER' ? .06 : 0);
    const defenderBlockstun = defenderGuard ? .25 : 0;
    const defenderGuardRecovery = defenderGuard ? .12 : 0;
    const attackerRecoveryRemaining = Math.max(0, move.startup + move.active + move.recovery - move.elapsed);
    const contactFrameAdvantage = move.throw ? null : Math.round(((defenderGuard ? defenderBlockstun + defenderGuardRecovery : defenderStun) - attackerRecoveryRemaining) * 60);
    if (duel[`${attacker}Attack`]) duel[`${attacker}Attack`].result = defenderGuard ? 'BLOCK' : impactType;
    if (defender === 'cpu') duel.cpuTelegraph = null;
    duel[`${defender}Attack`] = null;
    duel[`${defender}InputBuffer`] = null;
    if (defenderAir) { duel[`${defender}Air`] = 0; duel[`${defender}AirVy`] = 0; }
    duel[`${defender}Hp`] = Math.max(0, duel[`${defender}Hp`] - chip);
    const knockdown = defenderGuard ? 0 : antiAir ? (move.knockdown || .52) : (move.knockdown || 0);
    const direction = attacker === 'player' ? 1 : -1;
    const pushDistance = defenderGuard ? Math.max(.04, (move.knockback || .14) * .14) : (move.knockback || .18);
    duel[`${defender}X`] = Math.max(-3.7, Math.min(3.7, duel[`${defender}X`] + direction * pushDistance));
    duel[`${defender}Stun`] = defenderGuard || knockdown ? 0 : defenderStun;
    duel[`${defender}Blockstun`] = defenderBlockstun;
    duel[`${defender}GuardRecovery`] = defenderGuardRecovery;
    duel[`${defender}HitFlash`] = .16;
    duel[`${attacker}Meter`] = Math.min(100, duel[`${attacker}Meter`] + (defenderGuard ? 4 : 8));
    duel[`${attacker}ComboScale`] = comboScale;
    duel[`${attacker}Combo`] = defenderGuard ? 0 : duel[`${attacker}Combo`] + 1;
    duel[`${attacker}ComboTimer`] = defenderGuard ? 0 : .92;
    duel[`${attacker}FrameAdvantage`] = contactFrameAdvantage;
    duel[`${defender}FrameAdvantage`] = contactFrameAdvantage === null ? null : -contactFrameAdvantage;
    duel.last3DContact = move.throw ? 'THROW / OKI' : `${antiAir ? 'ANTI-AIR' : defenderAir ? 'AIR HIT' : defenderGuard ? 'BLOCK' : impactType} / ${move.label}`;
    duel.lastImpact = defenderGuard ? 'BLOCK' : impactType;
    recordDuelEvent('COMBAT', `${duel.last3DContact} / ${Math.round(chip)} / YOU ${formatFrameAdvantage(contactFrameAdvantage)}`);
    if (knockdown) {
      duel[`${defender}Knockdown`] = knockdown;
      duel[`${defender}Stun`] = 0;
      duel[`${defender}Wakeup`] = 0;
      duel[`${defender}ThrowInvuln`] = .26;
      duel[`${defender}GuardRecovery`] = 0;
      duel[`${defender}Guard`] = false;
      duel[`${defender}Crouch`] = false;
      duel.last3DContact = move.throw ? 'THROW / OKI' : `${antiAir ? 'ANTI-AIR' : impactType} / ${move.label} / KNOCKDOWN`;
      setShowroomBanner('KNOCKDOWN', 520);
    }
    duel.cameraShake = defenderGuard ? .08 : antiAir ? .34 : impactType === 'PUNISH' ? .30 : impactType === 'COUNTER' ? .24 : .18;
    duel.hitstop = defenderGuard ? .035 : impactType === 'PUNISH' ? .11 : impactType === 'COUNTER' ? .085 : move.label === 'OVERDRIVE' ? .13 : .065;
    addEffect(duel[`${defender}X`], defenderGuard ? '#b8c6ff' : move.color, defenderGuard ? .55 : antiAir ? 1.45 : impactType === 'PUNISH' ? 1.35 : impactType === 'COUNTER' ? 1.15 : 1);
    playDuelSfx(defenderGuard ? 'block' : impactType === 'PUNISH' ? 'punish' : impactType === 'COUNTER' ? 'counter' : move.throw ? 'throw' : move.label === 'SPECIAL' || move.key === 'l' ? 'special' : move.key === 'k' ? 'heavy' : 'hit');
    if (antiAir) {
      statusEl.textContent = `WEBGL ONLINE / ANTI-AIR / ${Math.round(chip)} / ${formatFrameAdvantage(contactFrameAdvantage)} / HITSTOP`;
      setShowroomBanner('ANTI-AIR', 720);
    } else if (defenderGuard) {
      statusEl.textContent = `WEBGL ONLINE / ${defenderCrouch ? 'CROUCH ' : ''}BLOCKED ${move.label} / BLOCKSTUN / ${formatFrameAdvantage(contactFrameAdvantage)} / HITSTOP`;
    } else if (impactType === 'PUNISH') {
      statusEl.textContent = `WEBGL ONLINE / PUNISH COUNTER / ${Math.round(chip)} / ${formatFrameAdvantage(contactFrameAdvantage)} / HITSTOP`;
      setShowroomBanner('PUNISH COUNTER', 720);
    } else if (impactType === 'COUNTER') {
      statusEl.textContent = `WEBGL ONLINE / COUNTER HIT / ${Math.round(chip)} / ${formatFrameAdvantage(contactFrameAdvantage)} / HITSTOP`;
      setShowroomBanner('COUNTER HIT', 620);
    } else {
      statusEl.textContent = `WEBGL ONLINE / ${move.label} HIT / ${Math.round(chip)} / ${formatFrameAdvantage(contactFrameAdvantage)} / HITSTOP`;
    }
  }
  function resolveDuelAttack(side) { const attack = duel[`${side}Attack`]; if (!attack || attack.hitDone) return; const active = attack.elapsed >= attack.startup && attack.elapsed <= attack.startup + attack.active; if (!active) return; const defender = side === 'player' ? 'cpu' : 'player'; const distance = Math.abs(duel.playerX - duel.cpuX); if (distance <= attack.reach) { attack.hitDone = true; applyDuelHit(side, defender, attack, distance); } }
  function resolveDuelPushbox() { if (duel.playerHp <= 0 || duel.cpuHp <= 0) return; const distance = duel.cpuX - duel.playerX; const minimum = .92; if (distance >= minimum) return; const shift = (minimum - distance) / 2; duel.playerX = Math.max(-3.7, duel.playerX - shift); duel.cpuX = Math.min(3.7, duel.cpuX + shift); }
  const isBufferableKey = (key) => ['j', 'k', 'n', 'm', 'u', 'l'].includes(key);
  function canFollowAttack(side, attackData, bufferedKey) {
    if (!attackData) return false;
    const specialMove = getDuelMove(side, 'l');
    if (bufferedKey === 'l' && duel[`${side}Meter`] < (specialMove?.meterCost || 0)) return false;
    const route = specialMove?.comboRoutes?.[attackData.key];
    if (route) return ['HIT', 'COUNTER', 'PUNISH'].includes(attackData.result) && route.includes(bufferedKey);
    return ['HIT', 'BLOCK', 'COUNTER', 'PUNISH'].includes(attackData.result) && ['j', 'k', 'n', 'm'].includes(attackData.key) && bufferedKey === 'l';
  }
  function jump(side) {
    const airKey = `${side}Air`;
    const airVyKey = `${side}AirVy`;
    if (duel.roundIntro > 0 || duel[`${side}Hp`] <= 0 || duel[`${side}Attack`] || duel[`${side}Stun`] > 0 || duel[`${side}Blockstun`] > 0 || duel[`${side}GuardRecovery`] > 0 || duel[`${side}Knockdown`] > 0 || duel[`${side}Wakeup`] > 0 || duel[`${side}Guard`] || duel[airKey] > .05) return false;
    duel[airKey] = .02;
    duel[airVyKey] = JUMP_SPEED;
    duel[`${side}Guard`] = false;
    duel[`${side}Crouch`] = false;
    duel[`${side}Action`] = .45;
    addEffect(duel[`${side}X`], roster[duel[`${side}Id`]]?.accent || '#72dcff', .42);
    if (side === 'player') statusEl.textContent = 'WEBGL ONLINE / JUMP';
    return true;
  }
  function attack(side, key) {
    const baseMove = getDuelMove(side, key);
    if (!baseMove) return false;
    if (duel.roundIntro > 0) { if (side === 'player') statusEl.textContent = `WEBGL ONLINE / ROUND ${String(duel.round).padStart(2, '0')} / READY`; return false; }
    const airborne = duel[`${side}Air`] > .05;
    if (airborne && !['j', 'k'].includes(key)) return false;
    const move = airborne ? { ...baseMove, label: `AIR ${baseMove.label}`, air: true, damage: Math.round(baseMove.damage * .92), stun: baseMove.stun + .08, knockdown: key === 'k' ? (baseMove.knockdown || .38) : 0 } : baseMove;
    const meterKey = `${side}Meter`;
    const meterCost = move.meterCost || 0;
    if (meterCost > 0 && duel[meterKey] < meterCost) { if (side === 'player') statusEl.textContent = `WEBGL ONLINE / NEED DRIVE / ${meterCost}`; return false; }
    const attackKey = `${side}Attack`;
    const inputBufferKey = `${side}InputBuffer`;
    if (duel[attackKey]) {
      if (!isBufferableKey(key)) return false;
      duel[inputBufferKey] = { key, ttl: .24 };
      statusEl.textContent = `WEBGL ONLINE / INPUT BUFFER / ${move.label}`;
      return true;
    }
    if (duel[`${side}Hp`] <= 0 || duel[`${side}Stun`] > 0 || duel[`${side}Blockstun`] > 0 || duel[`${side}GuardRecovery`] > 0 || duel[`${side}Knockdown`] > 0 || duel[`${side}Wakeup`] > 0 || duel[`${side}Guard`]) return false;
    duel[inputBufferKey] = null;
    if (meterCost > 0) duel[meterKey] = Math.max(0, duel[meterKey] - meterCost);
    duel[attackKey] = { ...move, key, elapsed: 0, hitDone: false, dashed: false, teleported: false, result: null };
    duel[`${side}Action`] = 1;
    addEffect(duel[`${side}X`] + (side === 'player' ? 1 : -1) * 1.15, move.color, key === 'l' ? 1 : .55);
    playDuelSfx(key === 'l' ? 'special' : key === 'k' ? 'heavy' : key === 'u' ? 'throw' : 'light');
    if (side === 'player' && move.air) { statusEl.textContent = `WEBGL ONLINE / ${move.label}`; setShowroomBanner(move.label, 420); }
    updateHud();
    return true;
  }
  function updateDuelFighter(side, dt, wakeupInput = {}) {
    const inputBufferKey = `${side}InputBuffer`;
    const airKey = `${side}Air`;
    const airVyKey = `${side}AirVy`;
    const bufferedInput = duel[inputBufferKey];
    if (bufferedInput) { bufferedInput.ttl -= dt; if (bufferedInput.ttl <= 0) duel[inputBufferKey] = null; }
    let activeAttack = duel[`${side}Attack`];
    const knockdownKey = `${side}Knockdown`;
    const wakeupKey = `${side}Wakeup`;
    const throwInvulnKey = `${side}ThrowInvuln`;
    duel[`${side}Stun`] = Math.max(0, duel[`${side}Stun`] - dt);
    duel[`${side}Blockstun`] = Math.max(0, duel[`${side}Blockstun`] - dt);
    duel[`${side}GuardRecovery`] = Math.max(0, duel[`${side}GuardRecovery`] - dt);
    duel[`${side}HitFlash`] = Math.max(0, duel[`${side}HitFlash`] - dt);
    duel[throwInvulnKey] = Math.max(0, duel[throwInvulnKey] - dt);
    if (duel[airKey] > 0 || duel[airVyKey] > 0) {
      duel[airKey] = Math.max(0, duel[airKey] + duel[airVyKey] * dt);
      duel[airVyKey] -= AIR_GRAVITY * dt;
      if (duel[airKey] === 0) duel[airVyKey] = 0;
    }
    if (duel[knockdownKey] > 0) {
      duel[airKey] = 0;
      duel[airVyKey] = 0;
      duel[knockdownKey] = Math.max(0, duel[knockdownKey] - dt);
      duel[`${side}Attack`] = null;
      duel[`${side}Action`] = 0;
      if (side === 'player' && duel[knockdownKey] > .12 && (wakeupInput.quickRise || wakeupInput.rollLeft || wakeupInput.rollRight)) {
        const rollDirection = wakeupInput.rollLeft ? -1 : wakeupInput.rollRight ? 1 : 0;
        const option = rollDirection ? (rollDirection === 1 ? 'FORWARD ROLL' : 'BACK ROLL') : 'QUICK RISE';
        duel[knockdownKey] = 0;
        duel[wakeupKey] = rollDirection ? .24 : .18;
        duel[throwInvulnKey] = rollDirection ? .52 : .46;
        duel.playerWakeupOption = option;
        if (rollDirection) duel.playerX = Math.max(-3.7, Math.min(3.7, duel.playerX + rollDirection * .72));
        duel.playerGuard = false;
        duel.playerCrouch = false;
        setShowroomBanner(option, 520);
        statusEl.textContent = `WEBGL ONLINE / ${option}`;
        addEffect(duel.playerX, roster[duel.playerId]?.accent || '#72dcff', rollDirection ? .8 : .58);
        return;
      }
      if (duel[knockdownKey] === 0) { duel[wakeupKey] = .30; duel[throwInvulnKey] = .42; if (side === 'player') duel.playerWakeupOption = 'AUTO'; }
      return;
    }
    if (duel[wakeupKey] > 0) {
      duel[wakeupKey] = Math.max(0, duel[wakeupKey] - dt);
      duel[`${side}Action`] = 0;
      return;
    }
    if (side === 'player' && wakeupInput.quickRise && jump(side)) return;
    if (activeAttack) {
      activeAttack.elapsed += dt;
      if (activeAttack.dash && !activeAttack.dashed && activeAttack.elapsed >= activeAttack.startup) { activeAttack.dashed = true; const direction = side === 'player' ? 1 : -1; duel[`${side}X`] = Math.max(-3.7, Math.min(3.7, duel[`${side}X`] + direction * activeAttack.dash)); addEffect(duel[`${side}X`], activeAttack.color, .8); }
      if (activeAttack.teleport && !activeAttack.teleported && activeAttack.elapsed >= activeAttack.startup) { activeAttack.teleported = true; const direction = side === 'player' ? 1 : -1; const targetSide = side === 'player' ? 'cpu' : 'player'; duel[`${side}X`] = Math.max(-3.7, Math.min(3.7, duel[`${targetSide}X`] - direction * 1.35)); addEffect(duel[`${side}X`], activeAttack.color, 1.05); setShowroomBanner('ORBIT SHIFT', 420); }
      resolveDuelAttack(side);
      if (activeAttack.elapsed >= activeAttack.startup + activeAttack.active + activeAttack.recovery) {
        const nextInput = duel[inputBufferKey];
        if (nextInput && canFollowAttack(side, activeAttack, nextInput.key)) {
          const nextKey = nextInput.key;
          duel[inputBufferKey] = null;
          duel[`${side}Attack`] = null;
          if (attack(side, nextKey)) statusEl.textContent = `WEBGL ONLINE / CHAIN / ${getDuelMove(side, nextKey)?.label || nextKey.toUpperCase()}`;
        } else {
          if (!activeAttack.result) activeAttack.result = 'WHIFF';
          duel[`${side}Attack`] = null;
          duel[inputBufferKey] = null;
        }
      }
    }
  }
  function updateDuelCpu(distance, dt) {
    const difficulty = getDuelDifficulty();
    const direction = duel.playerX >= duel.cpuX ? 1 : -1;
    if (duel.cpuTelegraph) {
      if (duel.playerAttack || duel.cpuHp <= 0 || duel.cpuStun > 0 || duel.cpuBlockstun > 0 || duel.cpuGuardRecovery > 0 || duel.cpuKnockdown > 0 || duel.cpuWakeup > 0) { duel.cpuTelegraph = null; return; }
      duel.cpuTelegraph.ttl -= dt;
      const telegraphMove = getDuelMove('cpu', duel.cpuTelegraph.key);
      if (duel.cpuTelegraph.ttl > 0) { statusEl.textContent = `WEBGL ONLINE / CPU TELEGRAPH / ${telegraphMove?.label || duel.cpuTelegraph.key.toUpperCase()}`; return; }
      const telegraphKey = duel.cpuTelegraph.key;
      duel.cpuTelegraph = null;
      attack('cpu', telegraphKey);
      return;
    }
    const playerOki = duel.playerKnockdown > 0 || duel.playerWakeup > 0;
    if (playerOki) {
      duel.cpuGuard = false;
      duel.cpuCrouch = false;
      const okiOption = duel.playerKnockdown > 0 ? 'KNOCKDOWN' : duel.playerWakeupOption || 'AUTO';
      if (duel.cpuWakeupOption !== okiOption) {
        duel.cpuWakeupOption = okiOption;
        duel.cpuOkiReason = okiOption === 'QUICK RISE' ? 'QUICK RISE READ' : okiOption === 'BACK ROLL' ? 'ROLL CHASE' : okiOption === 'FORWARD ROLL' ? 'ROLL CHECK' : okiOption === 'KNOCKDOWN' ? 'SETUP' : 'AUTO TIMING';
      }
      const chaseDistance = ['BACK ROLL', 'FORWARD ROLL'].includes(okiOption) ? 1.88 : 1.55;
      if (!duel.cpuAttack && distance > chaseDistance) {
        duel.cpuX = Math.max(-3.7, Math.min(3.7, duel.cpuX + direction * dt * 1.5));
        if (okiOption === 'BACK ROLL') duel.cpuOkiReason = 'ROLL CHASE';
      }
      else if (duel.playerWakeup > 0 && duel.playerWakeup <= .22 && duel.cpuCooldown <= 0 && !duel.cpuAttack && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0) {
        duel.cpuCooldown = .34;
        const cpuMove = okiOption === 'QUICK RISE' ? (duel.playerWakeup <= .11 ? 'm' : 'k') : okiOption === 'BACK ROLL' ? 'm' : okiOption === 'FORWARD ROLL' ? 'k' : duel.playerThrowInvuln > 0 ? (Math.random() < .5 ? 'n' : 'm') : (Math.random() < .5 ? 'k' : 'u');
        duel.cpuOkiReason = okiOption === 'QUICK RISE' ? 'MEATY / QUICK RISE' : okiOption === 'BACK ROLL' ? 'MEATY / BACK ROLL' : okiOption === 'FORWARD ROLL' ? 'CHECK / FORWARD ROLL' : duel.playerThrowInvuln > 0 ? 'MEATY / THROW INVULN' : 'WAKEUP READ';
        statusEl.textContent = `WEBGL ONLINE / CPU OKI / ${duel.cpuOkiReason}`;
        attack('cpu', cpuMove);
      }
      return;
    }
    if (!duel.playerAttack) duel.cpuPunishTarget = null;
    const playerAttack = duel.playerAttack;
    const playerAttackEnd = playerAttack ? playerAttack.startup + playerAttack.active : 0;
    const playerWhiffing = playerAttack && !playerAttack.hitDone && playerAttack.elapsed > playerAttackEnd && distance <= 2.85;
    const playerBlockPunishable = playerAttack && playerAttack.result === 'BLOCK' && playerAttack.elapsed > playerAttackEnd && playerAttack.elapsed < playerAttackEnd + playerAttack.recovery && distance <= 2.85;
    const punishReason = playerWhiffing ? 'CPU WHIFF PUNISH' : playerBlockPunishable ? 'CPU BLOCK PUNISH' : '';
    if (difficulty.punish > 0 && punishReason && duel.cpuPunishTarget !== playerAttack && !duel.cpuAttack && duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && !duel.cpuKnockdown && !duel.cpuWakeup && duel.cpuHp > 0 && duel.cpuCooldown <= 0) {
      duel.cpuPunishTarget = playerAttack;
      duel.cpuCooldown = .36 * difficulty.cooldown;
      const specialReady = duel.cpuMeter >= (getDuelMove('cpu', 'l')?.meterCost || 0);
      const punishMove = specialReady && distance > 2.25 ? 'l' : 'k';
      statusEl.textContent = `WEBGL ONLINE / ${punishReason}`;
      setShowroomBanner(punishReason.replace('CPU ', ''), 560);
      if (attack('cpu', punishMove)) return;
    }
    if (duel.playerAir > .05 && !duel.cpuAttack && duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && !duel.cpuKnockdown && !duel.cpuWakeup && duel.cpuHp > 0 && distance <= 2.8 && duel.cpuCooldown <= 0) {
      duel.cpuCooldown = .42;
      statusEl.textContent = 'WEBGL ONLINE / CPU ANTI-AIR';
      setShowroomBanner('CPU ANTI-AIR', 520);
      attack('cpu', 'k');
      return;
    }
    if (!duel.cpuAttack && duel.cpuAir <= .05 && distance > 2.8 && Math.random() < .012) jump('cpu');
    if (duel.cpuAir > .05 && !duel.cpuAttack && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && distance <= 2.7 && duel.cpuCooldown <= 0 && Math.random() < .18) { duel.cpuCooldown = .30; attack('cpu', 'j'); }
    // 通常攻撃はプレイヤーの攻撃中に割り込ませない。
    // 空振り／ガード後だけは上の専用パニッシュ分岐で反撃するため、
    // 「たまたま同時に出してCPUが勝った」状態を避けられる。
    if (duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && !duel.cpuKnockdown && !duel.cpuWakeup && !duel.cpuAttack && !duel.playerAttack && duel.cpuHp > 0) {
      if (duel.cpuAir > .05) return;
      if (distance > 2.35) duel.cpuX = Math.max(-3.7, Math.min(3.7, duel.cpuX + direction * dt * 1.4));
      else if (duel.cpuCooldown <= 0) {
        duel.cpuCooldown = (.22 + Math.random() * .35) * difficulty.cooldown;
        const mixup = distance <= 2.55;
        let cpuMove = Math.random() < .14 * difficulty.mixup ? 'l' : Math.random() < .68 ? 'j' : 'k';
        if (mixup && duel.playerGuard && Math.random() < .28 * difficulty.mixup) cpuMove = 'u';
        else if (mixup && duel.playerCrouch && Math.random() < .24 * difficulty.mixup) cpuMove = 'm';
        else if (mixup && !duel.playerCrouch && Math.random() < .18 * difficulty.mixup) cpuMove = 'n';
        queueCpuTelegraph(cpuMove);
      }
    }
  }
  function tick(dt, now) {
    if (!duel.open || duel.paused) return;
    const wakeupInput = { quickRise: pressed.has('w'), rollLeft: pressed.has('a'), rollRight: pressed.has('d') };
    pressed.clear();
    if (duel.hitstop > 0) {
      duel.hitstop = Math.max(0, duel.hitstop - dt);
      updateHud();
      drawArena(now / 1000);
      return;
    }
    if (duel.roundIntro > 0) {
      duel.cpuTelegraph = null;
      duel.roundIntro = Math.max(0, duel.roundIntro - dt);
      statusEl.textContent = `WEBGL ONLINE / ROUND ${String(duel.round).padStart(2, '0')} / ${duel.roundIntro > 0 ? 'READY' : 'FIGHT'}`;
      if (duel.roundIntro === 0) setShowroomBanner('FIGHT!', 650);
      updateHud();
      drawArena(now / 1000);
      return;
    }
    duel.cameraShake = Math.max(0, duel.cameraShake - dt);
    duel.playerAction = Math.max(0, duel.playerAction - dt * 3.5);
    duel.cpuAction = Math.max(0, duel.cpuAction - dt * 3.5);
    duel.cpuCooldown = Math.max(0, duel.cpuCooldown - dt);
    duel.effects = duel.effects.filter((effect) => { effect.life -= dt; return effect.life > 0; });
    duel.playerComboTimer = Math.max(0, duel.playerComboTimer - dt); if (duel.playerComboTimer === 0) { duel.playerCombo = 0; duel.playerComboScale = 1; }
    duel.cpuComboTimer = Math.max(0, duel.cpuComboTimer - dt); if (duel.cpuComboTimer === 0) { duel.cpuCombo = 0; duel.cpuComboScale = 1; }
    if (duel.result) { updateHud(); drawArena(now / 1000); return; }
    if (duel.roundResult) { duel.roundPause = Math.max(0, duel.roundPause - dt); if (duel.roundPause <= 0) advanceDuelRound(); updateHud(); drawArena(now / 1000); return; }
    duel.roundClock = Math.max(0, duel.roundClock - dt);
    duel.playerGuard = input.has('s') && duel.playerAir <= 0 && !duel.playerAttack && duel.playerStun <= 0 && duel.playerBlockstun <= 0 && duel.playerGuardRecovery <= 0 && duel.playerKnockdown <= 0 && duel.playerWakeup <= 0 && duel.playerHp > 0;
    duel.playerCrouch = input.has('c') && duel.playerAir <= 0 && !duel.playerAttack && duel.playerStun <= 0 && duel.playerBlockstun <= 0 && duel.playerGuardRecovery <= 0 && duel.playerKnockdown <= 0 && duel.playerWakeup <= 0 && duel.playerHp > 0;
    if (duel.playerHp > 0 && !duel.playerGuard && duel.playerStun <= 0 && duel.playerBlockstun <= 0 && duel.playerGuardRecovery <= 0 && duel.playerKnockdown <= 0 && duel.playerWakeup <= 0 && !duel.playerAttack) { if (input.has('a')) duel.playerX = Math.max(-3.7, duel.playerX - dt * 2.6); if (input.has('d')) duel.playerX = Math.min(3.7, duel.playerX + dt * 2.6); }
    if (duel.training) { duel.cpuGuard = isDummyGuardActive(); duel.cpuCrouch = duel.cpuGuard && duel.trainingCrouch; }
    updateDuelFighter('player', dt, wakeupInput); updateDuelFighter('cpu', dt);
    const distance = Math.abs(duel.playerX - duel.cpuX);
    duel.cpuGuardTimer = Math.max(0, duel.cpuGuardTimer - dt);
    if (!duel.training) {
      const defenseWindow = duel.playerAttack && duel.playerAttack.elapsed >= duel.playerAttack.startup * .6 && duel.playerAttack.elapsed <= duel.playerAttack.startup + duel.playerAttack.active + .16;
      const canReadDefense = !duel.cpuAttack && duel.cpuAir <= 0 && duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && duel.cpuKnockdown <= 0 && duel.cpuWakeup <= 0 && duel.cpuHp > 0;
      const difficulty = getDuelDifficulty();
      if (canReadDefense && defenseWindow && duel.cpuGuardTimer <= 0 && Math.random() < difficulty.defenseRead) {
        duel.cpuGuardTimer = difficulty.guardHold;
        duel.cpuGuardMode = duel.playerAttack.low ? 'CROUCH' : 'STAND';
        statusEl.textContent = `WEBGL ONLINE / CPU READ / ${duel.cpuGuardMode} GUARD`;
      }
      duel.cpuGuard = canReadDefense && duel.cpuGuardTimer > 0;
      duel.cpuCrouch = duel.cpuGuard && duel.cpuGuardMode === 'CROUCH';
      updateDuelCpu(distance, dt);
    } else {
      duel.cpuGuard = isDummyGuardActive();
      duel.cpuCrouch = duel.cpuGuard && duel.trainingCrouch;
      if (duel.trainingDrill === 'punish') {
        duel.cpuGuard = false;
        duel.cpuCrouch = false;
        if (!duel.cpuAttack && !duel.playerAttack && duel.cpuHp > 0 && duel.cpuStun <= 0 && duel.cpuBlockstun <= 0 && duel.cpuGuardRecovery <= 0 && duel.cpuKnockdown <= 0 && duel.cpuWakeup <= 0) arm3DPunishDrill();
      } else if (duel.trainingDrill === 'mixup') {
        duel.trainingMixupTimer -= dt;
        if (duel.trainingMixupTimer <= 0 && !duel.playerAttack && !duel.cpuAttack) set3DMixupPhase(duel.trainingMixupStep + 1);
        duel.cpuGuard = isDummyGuardActive();
        duel.cpuCrouch = duel.cpuGuard && duel.trainingCrouch;
      }
      if (!duel.playerAttack && !duel.cpuAttack) {
        const drillLabel = duel.trainingDrill === 'punish' ? '3D PUNISH DRILL / READY' : duel.trainingDrill === 'mixup' ? `3D MIXUP / ${duel.cpuGuard ? duel.cpuCrouch ? 'CROUCH GUARD' : 'STAND GUARD' : 'OPEN / THROW'}` : `TRAINING / ${duel.cpuGuard ? duel.cpuCrouch ? 'CROUCH GUARD' : 'STAND GUARD' : 'DUMMY IDLE'}`;
        statusEl.textContent = `WEBGL ONLINE / ${drillLabel}`;
      }
    }
    resolveDuelPushbox();
    if (duel.training && duel.cpuHp <= 0) { duel.cpuHp = 100; duel.cpuKnockdown = 0; duel.cpuStun = 0; duel.cpuBlockstun = 0; duel.cpuGuardRecovery = 0; duel.cpuWakeup = 0; duel.cpuThrowInvuln = 0; duel.cpuX = Math.max(-3.7, Math.min(3.7, duel.playerX + 1.35)); setShowroomBanner('DUMMY RESET', 520); statusEl.textContent = 'WEBGL ONLINE / TRAINING / DUMMY RESET'; }
    else if (duel.playerHp <= 0 || duel.cpuHp <= 0) endDuelRound(duel.cpuHp <= 0 ? 'player' : 'cpu');
    else if (duel.roundClock <= 0) endDuelRound(duel.playerHp >= duel.cpuHp ? 'player' : 'cpu');
    else if (!duel.training && !duel.playerAttack && !duel.cpuAttack && !duel.cpuTelegraph) statusEl.textContent = duel.playerAir > 0 || duel.cpuAir > 0 ? 'WEBGL ONLINE / AIRBORNE' : duel.playerBlockstun > 0 ? 'WEBGL ONLINE / BLOCKSTUN' : duel.playerGuardRecovery > 0 ? 'WEBGL ONLINE / GUARD RECOVERY' : duel.playerKnockdown > 0 || duel.playerWakeup > 0 ? `WEBGL ONLINE / CPU OKI / ${duel.cpuOkiReason || 'SETUP'}` : duel.cpuBlockstun > 0 ? 'WEBGL ONLINE / CPU BLOCKSTUN' : duel.cpuGuardRecovery > 0 ? 'WEBGL ONLINE / CPU GUARD RECOVERY' : duel.cpuKnockdown > 0 || duel.cpuWakeup > 0 ? 'WEBGL ONLINE / CPU DOWN / PRESSURE WINDOW' : 'WEBGL ONLINE / DUEL LIVE';
    updateHud(); drawArena(now / 1000);
  }
  function frame(now) { const dt = Math.min(.04, (now - duel.last) / 1000 || 0); duel.last = now; tick(dt, now); requestAnimationFrame(frame); }
  function open() { duel.open = true; panel.hidden = false; document.getElementById('titleOverlay').hidden = true; document.body.classList.add('showroom-open'); resize(); resetDuelFightLog(); reset(); }
  function close() { duel.open = false; panel.hidden = true; document.getElementById('titleOverlay').hidden = false; document.body.classList.remove('showroom-open'); }

  rosterOrder.forEach((id) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'showroom-agent'; button.dataset.agent = id; button.textContent = roster[id].name; button.addEventListener('click', () => { duel.playerId = id; if (id === duel.cpuId) duel.cpuId = id === 'neko' ? 'luna' : 'neko'; rosterEl.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item.dataset.agent === id)); resetDuelFightLog(); reset(); }); rosterEl.appendChild(button); });
  rosterEl.querySelector('[data-agent="luna"]')?.classList.add('is-active'); openButton.addEventListener('click', open); backButton.addEventListener('click', close); resetButton.addEventListener('click', () => { resetDuelFightLog(); reset(); }); resultRematchButton?.addEventListener('click', () => { resetDuelFightLog(); reset(); }); resultBackButton?.addEventListener('click', close); soundButton?.addEventListener('click', toggleDuelSound); frameLabButton?.addEventListener('click', toggleDuelFrameLab); trainingButton?.addEventListener('click', toggleDuelTraining); dummyGuardButton?.addEventListener('click', toggleDummyGuard); dummyCrouchButton?.addEventListener('click', toggleDummyCrouch); punishDrillButton?.addEventListener('click', () => toggle3DTrainingDrill('punish')); mixupDrillButton?.addEventListener('click', () => toggle3DTrainingDrill('mixup'));
  canvas.addEventListener('pointerdown', (event) => { duel.dragging = true; duel.lastPointerX = event.clientX; canvas.setPointerCapture?.(event.pointerId); }); canvas.addEventListener('pointermove', (event) => { if (!duel.dragging) return; duel.angle += (event.clientX - duel.lastPointerX) * .01; duel.lastPointerX = event.clientX; updateHud(); }); canvas.addEventListener('pointerup', () => { duel.dragging = false; }); canvas.addEventListener('pointercancel', () => { duel.dragging = false; });
  const queueInput = (key) => { if (!input.has(key)) pressed.add(key); input.add(key); };
  document.querySelectorAll('[data-3d-key]').forEach((button) => { const key = button.dataset['3dKey']; const press = (event) => { event.preventDefault(); if (MOVE_DATA[key]) attack('player', key); else queueInput(key); }; const release = (event) => { event.preventDefault(); input.delete(key); }; button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release); button.addEventListener('pointerleave', release); button.addEventListener('pointercancel', release); });
  window.addEventListener('keydown', (event) => {
    if (!duel.open) return;
    const key = event.key.toLowerCase();
    if (['a','d','s','c','w','j','k','l','n','m','u','p','f'].includes(key)) event.preventDefault();
    if (key === 'p') {
      duel.paused = !duel.paused;
      statusEl.textContent = duel.paused ? 'WEBGL ONLINE / PAUSED' : duel.cpuHp <= 0 || duel.playerHp <= 0 ? statusEl.textContent : 'WEBGL ONLINE / DUEL LIVE';
      return;
    }
    if (key === 'f') { toggleDuelFrameLab(); return; }
    if (MOVE_DATA[key]) attack('player', key);
    else queueInput(key);
  });
  window.addEventListener('keyup', (event) => input.delete(event.key.toLowerCase())); window.addEventListener('resize', resize);
  window.LUNA_SHOWROOM = { open, close, reset, toggleDuelFrameLab, getState: () => ({ open: duel.open, playerId: duel.playerId, cpuId: duel.cpuId, difficulty: getDuelDifficultyName(), training: duel.training, trainingGuard: duel.trainingGuard, trainingCrouch: duel.trainingCrouch, trainingDrill: duel.trainingDrill, trainingDrillTimer: duel.trainingDrillTimer, trainingMixupStep: duel.trainingMixupStep, trainingMixupTimer: duel.trainingMixupTimer, frameLab: duel.frameLab, playerX: duel.playerX, cpuX: duel.cpuX, playerAir: duel.playerAir, cpuAir: duel.cpuAir, playerHp: duel.playerHp, cpuHp: duel.cpuHp, playerMeter: duel.playerMeter, cpuMeter: duel.cpuMeter, playerAttack: duel.playerAttack?.key || null, cpuAttack: duel.cpuAttack?.key || null, playerInputBuffer: duel.playerInputBuffer?.key || null, cpuInputBuffer: duel.cpuInputBuffer?.key || null, playerGuard: duel.playerGuard, cpuGuard: duel.cpuGuard, cpuGuardTimer: duel.cpuGuardTimer, cpuGuardMode: duel.cpuGuardMode, roundIntro: duel.roundIntro, playerCrouch: duel.playerCrouch, cpuCrouch: duel.cpuCrouch, playerStun: duel.playerStun, cpuStun: duel.cpuStun, playerBlockstun: duel.playerBlockstun, cpuBlockstun: duel.cpuBlockstun, playerGuardRecovery: duel.playerGuardRecovery, cpuGuardRecovery: duel.cpuGuardRecovery, playerKnockdown: duel.playerKnockdown, cpuKnockdown: duel.cpuKnockdown, playerWakeup: duel.playerWakeup, cpuWakeup: duel.cpuWakeup, playerWakeupOption: duel.playerWakeupOption, cpuWakeupOption: duel.cpuWakeupOption, cpuOkiReason: duel.cpuOkiReason, hitstop: duel.hitstop, playerCombo: duel.playerCombo, cpuCombo: duel.cpuCombo, playerComboScale: duel.playerComboScale, cpuComboScale: duel.cpuComboScale, playerFrameAdvantage: duel.playerFrameAdvantage, cpuFrameAdvantage: duel.cpuFrameAdvantage, last3DContact: duel.last3DContact, lastImpact: duel.lastImpact, round: duel.round, playerRounds: duel.playerRounds, cpuRounds: duel.cpuRounds, roundResult: duel.roundResult, result: duel.result, webgl: true }) };
  window.LUNA_SHOWROOM.getCameraState = () => ({ angle: duel.cameraAngle, locked: duel.cameraLocked });
  window.LUNA_SHOWROOM.getAttackState = () => ({ playerKey: duel.playerAttack?.key || null, playerNormalKind: duel.playerAttack?.normalKind || null, cpuKey: duel.cpuAttack?.key || null });
  window.LUNA_SHOWROOM.getTelegraphState = () => ({ key: duel.cpuTelegraph?.key || null, ttl: duel.cpuTelegraph?.ttl || 0 });
  window.LUNA_SHOWROOM.getFightLog = () => duel.fightLog.map((event) => ({ ...event }));
  resize(); reset(); requestAnimationFrame(frame);
})();
