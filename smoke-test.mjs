import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./game.js', import.meta.url), 'utf8');
const listeners = new Map();
const elements = new Map();
const makeElement = (id) => ({
  id,
  hidden: false,
  textContent: '',
  innerHTML: '',
  style: { setProperty() {} },
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener(type, handler) { listeners.set(`${id}:${type}`, handler); },
  setAttribute() {},
  querySelectorAll() { return []; },
  getBoundingClientRect() { return { width: 1200, height: 600 }; },
  offsetWidth: 0
});

for (const match of source.matchAll(/getElementById\('([^']+)'\)/g)) elements.set(match[1], makeElement(match[1]));

const rosterIds = ['luna', 'neko', 'kagari', 'mizuki', 'bolt9', 'vanta', 'sylfa', 'ryuga', 'piko', 'orbis'];
const grid = elements.get('characterGrid');
grid.querySelectorAll = (selector) => selector === '[data-character]'
  ? rosterIds.map((id) => ({ dataset: { character: id }, addEventListener() {}, classList: { toggle() {} } }))
  : [];
Object.defineProperty(grid, 'innerHTML', { set(value) { this._html = value; }, get() { return this._html || ''; } });

const canvasContext = new Proxy({}, {
  get(target, property) {
    if (!(property in target)) target[property] = property === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {};
    return target[property];
  },
  set(target, property, value) { target[property] = value; return true; }
});
elements.get('fightCanvas').getContext = () => canvasContext;

class FakeImage {
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
  set src(value) { this._src = value; this.complete = true; this.naturalWidth = 426; this.naturalHeight = 640; }
}

const timers = [];
const setTimer = (handler) => { timers.push(handler); return timers.length; };
const context = {
  console,
  document: {
    getElementById: (id) => elements.get(id),
    documentElement: { style: { setProperty() {} } },
    body: { classList: { add() {}, remove() {}, toggle() {} } },
    querySelectorAll: () => []
  },
  window: { addEventListener(type, handler) { listeners.set(`window:${type}`, handler); }, clearTimeout() {}, setTimeout: setTimer },
  navigator: { getGamepads: () => [] },
  Image: FakeImage,
  performance: { now: () => 1000 },
  requestAnimationFrame() {},
  setTimeout: setTimer,
  clearTimeout() {},
  Math,
  Date
};

vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.__test = { order: ROSTER_ORDER, chooseCharacter, showCharacterSelect, makeFighter, getMoveFor, getComboRoute, getCharacterTrial, startCharacterTrial, getCharacterTrialState: () => ({ active: characterTrial, step: characterTrialStep, result: characterTrialResult }), triggerAction, triggerAssistCombo, triggerDriveBurst, applyHit, resolveMeleeHit, resolveThrow, resolvePushbox, updateFighter, updateCpu, startMatch, resetTrainingDummy, startPunishDrill, startMixupDrill, toggleTrainingRecord, toggleTrainingReplay, tick, togglePause, toggleFrameLab, renderMatchLogTimeline, renderMatchLogDetail, getMatchLogMessage, getState: () => state, getMode: () => mode, getArcadeOpponent: () => selectedCpuId, getCpuX: () => cpu?.x, getCpuHealth: () => cpu?.health, getCpuDifficulty: () => cpuDifficulty, getCpuIntent: () => cpuBrain.intent, getCpuReason: () => cpuBrain.reason, getPlayer: () => player, getCpu: () => cpu, getTrainingRecordLength: () => trainingRecord.length, getTrainingRecording: () => trainingRecording, getTrainingReplay: () => trainingReplay, getFrameLab: () => frameLab, getTrainingDrill: () => trainingDrill, getTrainingMixup: () => trainingMixup, getTrainingMixupLabel: () => trainingMixupLabel, getMatchLog: () => matchLog, getLastMatchLog: () => lastMatchLog, summarizeMatchLog };`, context);
const test = context.__test;

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(test.order.length === 10, 'roster must contain 10 fighters');
test.showCharacterSelect('cpu');
assert((grid.innerHTML.match(/data-character=/g) || []).length === 10, 'selection must render 10 cards');
for (const id of test.order) {
  const rosterFighter = test.makeFighter('player', id);
  assert(test.getMoveFor(rosterFighter, 'l').label, `${id} special label missing`);
  assert(test.getMoveFor(rosterFighter, 'i').label, `${id} overdrive label missing`);
  assert(test.getMoveFor(rosterFighter, 'u').label === 'THROW', `${id} throw missing`);
  assert(test.getMoveFor(rosterFighter, 'l').visual !== 'energy', `${id} projectile visual missing`);
}
assert(test.getMoveFor(test.makeFighter('player', 'kagari'), 'j').signature === 'solar-step', 'KAGARI signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'mizuki'), 'n').signature === 'phase-low', 'MIZUKI signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'bolt9'), 'k').signature === 'magnet-heavy', 'BOLT-9 signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'piko'), 'm').signature === 'bounce-overhead', 'PIKO signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'orbis'), 'm').signature === 'orbit-shift', 'ORBIS signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'luna'), 'j').signature === 'sun-punch', 'LUNA signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'neko'), 'j').signature === 'glitch-claw', 'NEKOMUSICA signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'vanta'), 'j').signature === 'hex-mark', 'VANTA signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'sylfa'), 'n').signature === 'wind-slice', 'SYLFA signature move visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'ryuga'), 'k').signature === 'dragon-crush', 'RYUGA signature move visual missing');
test.chooseCharacter('bolt9');
const bolt = test.makeFighter('player', 'bolt9');
assert(bolt.health === 1120, 'BOLT-9 health tuning missing');
assert(test.getMoveFor(bolt, 'l').label === 'MAGNET ARMOR', 'BOLT-9 special missing');
assert(test.getMoveFor(bolt, 'l').visual === 'magnet', 'BOLT-9 projectile visual missing');
assert(test.getMoveFor(test.makeFighter('player', 'luna'), 'l').dash && !test.getMoveFor(test.makeFighter('player', 'luna'), 'l').projectile, 'LUNA special should be a close-range rush');
assert(test.getMoveFor(test.makeFighter('player', 'neko'), 'l').trap && test.getMoveFor(test.makeFighter('player', 'neko'), 'l').projectileSpeed === 0, 'NEKOMUSICA special should be a stationary trap');
assert(test.getMoveFor(bolt, 'l').armor && !test.getMoveFor(bolt, 'l').projectile, 'BOLT-9 special should have armor and be melee');
assert(test.getMoveFor(bolt, 'n').low && test.getMoveFor(bolt, 'm').overhead, 'low and overhead moves missing');
assert(test.getComboRoute(test.makeFighter('player', 'luna'), 'j').includes('k'), 'LUNA should route LIGHT into HEAVY');
assert(test.getComboRoute(test.makeFighter('player', 'neko'), 'j').includes('n') && !test.getComboRoute(test.makeFighter('player', 'neko'), 'j').includes('k'), 'NEKOMUSICA should route LIGHT into LOW instead of the universal HEAVY route');
assert(test.getComboRoute(test.makeFighter('player', 'vanta'), 'j').includes('m'), 'VANTA should route LIGHT into OVERHEAD');
assert(test.getComboRoute(test.makeFighter('player', 'piko'), 'j').includes('n') && test.getComboRoute(test.makeFighter('player', 'piko'), 'j').includes('m'), 'PIKO should have a branching LIGHT route');
assert(test.getMoveFor(test.makeFighter('player', 'kagari'), 'j').dash > 0, 'KAGARI LIGHT should step forward');
assert(test.getMoveFor(test.makeFighter('player', 'mizuki'), 'n').projectile && test.getMoveFor(test.makeFighter('player', 'mizuki'), 'n').low, 'MIZUKI LOW should become a wave projectile');
assert(test.getMoveFor(test.makeFighter('player', 'bolt9'), 'k').armor, 'BOLT-9 HEAVY should have armor');
assert(test.getMoveFor(test.makeFighter('player', 'piko'), 'm').dash > 0, 'PIKO OVERHEAD should bounce forward');
assert(test.getMoveFor(test.makeFighter('player', 'orbis'), 'm').teleport, 'ORBIS OVERHEAD should shift position');
bolt.meter = 1000;
assert(test.triggerAction(bolt, 'i'), 'OVERDRIVE should start with full meter');

const bufferFighter = test.makeFighter('player', 'luna');
const bufferOpponent = test.makeFighter('cpu', 'neko');
const orbitFighter = test.makeFighter('player', 'orbis');
const orbitOpponent = test.makeFighter('cpu', 'neko');
orbitFighter.x = 500; orbitFighter.facing = 1; orbitOpponent.x = 620;
assert(test.triggerAction(orbitFighter, 'm'), 'ORBIS position-shift attack should start');
orbitFighter.attack.elapsed = 190;
test.updateFighter(orbitFighter, orbitOpponent, { left: false, right: false, jump: false, guard: false }, .01);
assert(orbitFighter.x > orbitOpponent.x && orbitFighter.attack?.move.teleport, 'ORBIS attack should shift behind the opponent');
assert(test.triggerAction(bufferFighter, 'j'), 'buffer test light should start');
bufferFighter.attack.elapsed = 360;
bufferFighter.inputBuffer = { key: 'k', ttl: .2 };
test.updateFighter(bufferFighter, bufferOpponent, { left: false, right: false, jump: false, guard: false }, .01);
test.updateFighter(bufferFighter, bufferOpponent, { left: false, right: false, jump: false, guard: false }, .01);
assert(bufferFighter.attack?.move.label === 'HEAVY', 'input buffer should chain the next attack');

const cancelFighter = test.makeFighter('player', 'luna');
const cancelOpponent = test.makeFighter('cpu', 'neko');
assert(test.triggerAction(cancelFighter, 'j'), 'cancel test light should start');
cancelFighter.attack.hitDone = true;
cancelFighter.attack.result = 'hit';
cancelFighter.attack.elapsed = 220;
cancelFighter.inputBuffer = { key: 'k', ttl: .2 };
test.updateFighter(cancelFighter, cancelOpponent, { left: false, right: false, jump: false, guard: false }, .01);
assert(cancelFighter.attack?.move.label === 'HEAVY', 'confirmed hit should cancel into the buffered attack');

const whiffCancelFighter = test.makeFighter('player', 'luna');
const whiffCancelOpponent = test.makeFighter('cpu', 'neko');
assert(test.triggerAction(whiffCancelFighter, 'j'), 'whiff cancel light should start');
whiffCancelFighter.meter = 250;
whiffCancelFighter.attack.elapsed = 180;
whiffCancelFighter.inputBuffer = { key: 'l', ttl: .2 };
test.updateFighter(whiffCancelFighter, whiffCancelOpponent, { left: false, right: false, jump: false, crouch: false, guard: false, parry: false }, .01);
assert(whiffCancelFighter.attack?.move.key === 'j', 'a whiff should not special-cancel during its recovery');

const assistFighter = test.makeFighter('player', 'luna');
assert(test.triggerAssistCombo(assistFighter), 'assist combo should start for beginners');
assistFighter.attack.hitDone = true;
assistFighter.attack.elapsed = 220;
test.updateFighter(assistFighter, test.makeFighter('cpu', 'neko'), { left: false, right: false, jump: false, guard: false }, .01);
assert(assistFighter.attack?.move.label === 'HEAVY', 'assist combo should chain into heavy');

const parryDefender = test.makeFighter('player', 'luna');
const parryAttacker = test.makeFighter('cpu', 'neko');
parryDefender.guard = true;
parryDefender.parryTimer = .1;
const parryHealth = parryDefender.health;
test.applyHit(parryAttacker, parryDefender, 100, 160, 300, '#fff0a7', 'HEAVY');
assert(parryDefender.health === parryHealth && parryAttacker.blockstun > 0, 'parry should steal the attacker turn without taking damage');
assert(test.getMatchLog().some((event) => event.type === 'COMBAT' && event.result === 'PARRY'), 'combat log should record parry');

const throwAttacker = test.makeFighter('player', 'luna');
const throwDefender = test.makeFighter('cpu', 'neko');
throwDefender.guard = true;
test.applyHit(throwAttacker, throwDefender, 120, 300, 500, '#ffe07a', 'THROW');
assert(throwDefender.health < throwDefender.character.health, 'throw should beat a standing guard');
assert(test.getMatchLog().some((event) => event.type === 'COMBAT' && event.result === 'HIT' && event.move === 'THROW'), 'combat log should record throw hit');
assert(test.getMoveFor(test.makeFighter('player', 'luna'), 'j').key === 'j', 'log test fighter should be available');
assert(test.getMatchLogMessage({ type: 'CPU_DECISION', reason: 'WHIFF PUNISH', move: 'HEAVY' }).includes('WHIFF PUNISH'), 'CPU decision log message should be readable');
assert(test.getMatchLogMessage({ type: 'COMBAT', actor: 'LUNA', target: 'NEKOMUSICA', move: 'LIGHT', result: 'HIT', attackFrame: 5, phase: 'ACTIVE', playerAdvantage: 3 }).includes('F5 / ACTIVE / YOU +3F'), 'combat log message should expose frame evidence');
const frameLogAttacker = test.makeFighter('player', 'luna');
const frameLogDefender = test.makeFighter('cpu', 'neko');
frameLogAttacker.x = 300;
frameLogDefender.x = 360;
assert(test.triggerAction(frameLogAttacker, 'j'), 'frame log attack should start');
frameLogAttacker.attack.elapsed = 96;
test.resolveMeleeHit(frameLogAttacker, frameLogDefender, test.getMoveFor(frameLogAttacker, 'j'));
const frameEvent = test.getMatchLog().find((event) => event.actor === frameLogAttacker.name && event.move === test.getMoveFor(frameLogAttacker, 'j').label && event.result === 'HIT');
assert(frameEvent && frameEvent.phase === 'ACTIVE' && Number.isFinite(frameEvent.attackFrame), 'combat log should capture active frame snapshot');
test.renderMatchLogTimeline();
assert(elements.get('matchLogTimeline').innerHTML.includes('PARRY'), 'fight log timeline should render combat events');

const burstFighter = test.makeFighter('player', 'luna');
burstFighter.meter = 300;
burstFighter.hitstun = 240;
assert(test.triggerDriveBurst(burstFighter), 'drive burst should escape hitstun with meter');
assert(burstFighter.attack?.move.label === 'DRIVE BURST' && burstFighter.driveInvuln > 0, 'drive burst should grant a brief invulnerable reversal');

const bufferedBurstFighter = test.makeFighter('player', 'luna');
const bufferedBurstOpponent = test.makeFighter('cpu', 'neko');
bufferedBurstFighter.meter = 300;
bufferedBurstFighter.inputBuffer = { key: 'o', ttl: .2 };
test.updateFighter(bufferedBurstFighter, bufferedBurstOpponent, { left: false, right: false, jump: false, guard: false }, .01);
assert(bufferedBurstFighter.attack?.move.label === 'DRIVE BURST', 'buffered DRIVE BURST should use the burst state machine');

const feedbackAttacker = test.makeFighter('player', 'luna');
const feedbackDefender = test.makeFighter('cpu', 'neko');
test.applyHit(feedbackAttacker, feedbackDefender, 45, 80, 260, '#72dcff', 'LIGHT');
assert(feedbackAttacker.combo === 1 && feedbackDefender.hitstun === 260, 'confirmed hit should start combo and hitstun');

const prorationAttacker = test.makeFighter('player', 'luna');
const prorationDefender = test.makeFighter('cpu', 'neko');
test.applyHit(prorationAttacker, prorationDefender, 100, 80, 260, '#72dcff', 'LIGHT');
const firstComboDamage = prorationDefender.character.health - prorationDefender.health;
const healthAfterFirstComboHit = prorationDefender.health;
prorationDefender.hitstun = 0;
test.applyHit(prorationAttacker, prorationDefender, 100, 80, 260, '#72dcff', 'LIGHT');
const secondComboDamage = healthAfterFirstComboHit - prorationDefender.health;
assert(firstComboDamage === 100 && secondComboDamage === 92 && prorationAttacker.comboDamageScale === .92, '2D combo proration should reduce the second hit and expose its scale');
const blockResetDefender = test.makeFighter('cpu', 'neko');
blockResetDefender.guard = true;
test.applyHit(prorationAttacker, blockResetDefender, 100, 80, 260, '#72dcff', 'LIGHT');
assert(prorationAttacker.comboDamageScale === 1 && prorationAttacker.combo === 0, 'a blocked hit should reset combo proration');

const punishAttacker = test.makeFighter('player', 'luna');
const punishDefender = test.makeFighter('cpu', 'neko');
assert(test.triggerAction(punishDefender, 'k'), 'punish defender attack should start');
punishDefender.attack.elapsed = punishDefender.attack.move.startup + punishDefender.attack.move.active + 30;
const punishHealth = punishDefender.health;
test.applyHit(punishAttacker, punishDefender, 45, 80, 260, '#72dcff', 'LIGHT');
const punishEvent = test.getMatchLog().find((event) => event.actor === punishAttacker.name && event.result === 'PUNISH');
assert(punishEvent && punishDefender.health < punishHealth && punishDefender.hitstun === 380, 'whiff punish should amplify damage and hitstun');
assert(elements.get('tipReadout').textContent.includes('PUNISH COUNTER'), 'punish should explain the follow-up route');
const counterAttacker = test.makeFighter('player', 'luna');
const counterDefender = test.makeFighter('cpu', 'neko');
assert(test.triggerAction(counterDefender, 'k'), 'counter defender attack should start');
counterDefender.attack.elapsed = 40;
test.applyHit(counterAttacker, counterDefender, 45, 80, 260, '#72dcff', 'LIGHT');
assert(test.getMatchLog().some((event) => event.actor === counterAttacker.name && event.result === 'COUNTER') && counterDefender.hitstun === 320, 'startup counter should amplify hitstun');
assert(elements.get('tipReadout').textContent.includes('COUNTER HIT'), 'counter should explain the combo route');
assert(feedbackDefender.lastHitDirection === 'RIGHT', 'confirmed hit should record hit direction');

const pushLeft = test.makeFighter('player', 'luna');
const pushRight = test.makeFighter('cpu', 'neko');
pushLeft.x = 500; pushRight.x = 510;
test.resolvePushbox(pushLeft, pushRight);
assert(pushRight.x - pushLeft.x >= 75, 'fighters should be separated by a pushbox');

const guardAttacker = test.makeFighter('player', 'luna');
const guardDefender = test.makeFighter('cpu', 'neko');
guardDefender.guard = true;
const guardHealth = guardDefender.health;
test.applyHit(guardAttacker, guardDefender, 100, 190, 410, '#ff9d52', 'HEAVY');
assert(guardDefender.grounded && guardDefender.blockstun > 0 && guardDefender.health < guardHealth, 'guard should chip, stay grounded, and enter blockstun');
assert(!test.triggerAction(guardDefender, 'j'), 'guard recovery should prevent immediate counterattack');

const lowAttacker = test.makeFighter('player', 'luna');
const lowGuardStanding = test.makeFighter('cpu', 'neko');
lowGuardStanding.guard = true;
const standingLowHealth = lowGuardStanding.health;
test.applyHit(lowAttacker, lowGuardStanding, 52, 95, 300, '#8ff0bd', 'LOW', test.getMoveFor(lowAttacker, 'n'));
assert(lowGuardStanding.health < standingLowHealth, 'standing guard should not block a low attack');

const lowGuardCrouching = test.makeFighter('cpu', 'neko');
lowGuardCrouching.guard = true;
lowGuardCrouching.crouching = true;
const crouchingLowHealth = lowGuardCrouching.health;
test.applyHit(lowAttacker, lowGuardCrouching, 52, 95, 300, '#8ff0bd', 'LOW', test.getMoveFor(lowAttacker, 'n'));
assert(crouchingLowHealth > lowGuardCrouching.health && lowGuardCrouching.blockstun > 0, 'crouching guard should block a low attack with chip');

const lowGuardInput = test.makeFighter('cpu', 'neko');
test.updateFighter(lowGuardInput, lowAttacker, { left: false, right: false, jump: false, crouch: true, guard: true, parry: false }, .01);
assert(lowGuardInput.guard && lowGuardInput.crouching && lowGuardInput.state === 'block', 'guard plus crouch input should create a crouching guard');

const overheadAttacker = test.makeFighter('player', 'luna');
const overheadDefender = test.makeFighter('cpu', 'neko');
overheadDefender.guard = true;
overheadDefender.crouching = true;
const crouchingOverheadHealth = overheadDefender.health;
test.applyHit(overheadAttacker, overheadDefender, 86, 160, 420, '#fff0a7', 'OVERHEAD', test.getMoveFor(overheadAttacker, 'm'));
assert(overheadDefender.health < crouchingOverheadHealth, 'crouching guard should be opened by an overhead');

const knockdownAttacker = test.makeFighter('player', 'luna');
const knockdownDefender = test.makeFighter('cpu', 'neko');
knockdownDefender.x = 390;
knockdownAttacker.x = 300;
knockdownAttacker.facing = 1;
assert(test.triggerAction(knockdownAttacker, 'u'), 'knockdown throw should start');
knockdownAttacker.attack.elapsed = 130;
test.resolveMeleeHit(knockdownAttacker, knockdownDefender, test.getMoveFor(knockdownAttacker, 'u'));
assert(knockdownDefender.state === 'knockdown' && knockdownDefender.knockdownTimer > 0, 'successful throw should cause a knockdown state');
assert(!test.triggerAction(knockdownDefender, 'j'), 'knocked-down fighter should not attack before wakeup');
test.updateFighter(knockdownDefender, knockdownAttacker, { left: false, right: false, jump: false, crouch: false, guard: false, parry: false }, .8);
assert(knockdownDefender.state === 'wakeup' && knockdownDefender.throwInvuln > 0, 'knockdown should transition into throw-invulnerable wakeup');

const quickRiseAttacker = test.makeFighter('cpu', 'neko');
const quickRiseDefender = test.makeFighter('player', 'luna');
quickRiseAttacker.x = 400; quickRiseDefender.x = 500; quickRiseAttacker.facing = 1;
assert(test.triggerAction(quickRiseAttacker, 'u'), 'quick rise setup should start CPU throw');
quickRiseAttacker.attack.elapsed = 130;
test.resolveMeleeHit(quickRiseAttacker, quickRiseDefender, test.getMoveFor(quickRiseAttacker, 'u'));
assert(quickRiseDefender.state === 'knockdown', 'quick rise setup should knock the player down');
test.updateFighter(quickRiseDefender, quickRiseAttacker, { left: false, right: false, jump: true, crouch: false, guard: false, parry: false, wakeupLeft: false, wakeupRight: false }, .016);
assert(quickRiseDefender.state === 'wakeup' && quickRiseDefender.lastWakeupOption === 'QUICK RISE' && quickRiseDefender.wakeupTimer > 0, 'jump input should choose quick rise');

const rollAttacker = test.makeFighter('cpu', 'neko');
const rollDefender = test.makeFighter('player', 'luna');
rollAttacker.x = 400; rollDefender.x = 500; rollAttacker.facing = 1;
assert(test.triggerAction(rollAttacker, 'u'), 'back roll setup should start CPU throw');
rollAttacker.attack.elapsed = 130;
test.resolveMeleeHit(rollAttacker, rollDefender, test.getMoveFor(rollAttacker, 'u'));
const rollStartX = rollDefender.x;
test.updateFighter(rollDefender, rollAttacker, { left: false, right: false, jump: false, crouch: false, guard: false, parry: false, wakeupLeft: true, wakeupRight: false }, .016);
assert(rollDefender.state === 'wakeup' && rollDefender.lastWakeupOption === 'BACK ROLL' && rollDefender.x < rollStartX, 'back input should choose a backward roll');

const crouchingThrowAttacker = test.makeFighter('player', 'luna');
const crouchingThrowDefender = test.makeFighter('cpu', 'neko');
crouchingThrowDefender.x = 360;
crouchingThrowDefender.crouching = true;
crouchingThrowDefender.guard = true;
const crouchingThrowHealth = crouchingThrowDefender.health;
assert(test.triggerAction(crouchingThrowAttacker, 'u'), 'throw should start');
crouchingThrowAttacker.attack.elapsed = 120;
test.resolveMeleeHit(crouchingThrowAttacker, crouchingThrowDefender, test.getMoveFor(crouchingThrowAttacker, 'u'));
assert(crouchingThrowDefender.health < crouchingThrowHealth && crouchingThrowDefender.state === 'knockdown', 'throw should beat crouching guard and cause knockdown');

const techLeft = test.makeFighter('player', 'luna');
const techRight = test.makeFighter('cpu', 'neko');
techLeft.x = 500; techRight.x = 560;
assert(test.triggerAction(techLeft, 'u') && test.triggerAction(techRight, 'u'), 'both fighters should be able to attempt a throw');
techLeft.attack.elapsed = 120; techRight.attack.elapsed = 120;
test.resolveMeleeHit(techLeft, techRight, test.getMoveFor(techLeft, 'u'));
assert(techRight.health === techRight.character.health && techLeft.blockstun > 0 && techRight.blockstun > 0, 'simultaneous throws should tech instead of dealing damage');

const aiTechAttacker = test.makeFighter('player', 'luna');
const aiTechDefender = test.makeFighter('cpu', 'neko');
aiTechAttacker.x = 500; aiTechDefender.x = 560;
assert(test.triggerAction(aiTechAttacker, 'u'), 'AI throw tech setup should start player throw');
aiTechAttacker.attack.elapsed = 120;
aiTechDefender.throwTechWindow = 120;
const aiTechHealth = aiTechDefender.health;
test.resolveMeleeHit(aiTechAttacker, aiTechDefender, test.getMoveFor(aiTechAttacker, 'u'));
assert(aiTechDefender.health === aiTechHealth && aiTechAttacker.blockstun > 0 && aiTechDefender.blockstun > 0 && aiTechDefender.throwTechWindow === 0, 'AI throw tech window should stop a player throw');

const interruptAttacker = test.makeFighter('player', 'luna');
const interruptDefender = test.makeFighter('cpu', 'neko');
test.triggerAction(interruptDefender, 'j');
test.applyHit(interruptAttacker, interruptDefender, 45, 80, 260, '#72dcff', 'LIGHT');
assert(interruptDefender.attack === null && interruptDefender.hitstun > 0, 'a confirmed hit should interrupt the defender attack');

const guardRecoveryAttacker = test.makeFighter('player', 'luna');
const guardRecoveryDefender = test.makeFighter('cpu', 'neko');
guardRecoveryAttacker.facing = 1;
guardRecoveryDefender.facing = -1;
guardRecoveryDefender.guard = true;
const blockedHealth = guardRecoveryDefender.health;
test.applyHit(guardRecoveryAttacker, guardRecoveryDefender, 45, 80, 260, '#72dcff', 'LIGHT');
assert(guardRecoveryDefender.health === blockedHealth - 6 && guardRecoveryDefender.blockstun > 0 && guardRecoveryDefender.guardRecovery > 0, 'guard should create blockstun and a post-block recovery window');
guardRecoveryDefender.blockstun = 0;
const punishableAfterBlockHealth = guardRecoveryDefender.health;
test.applyHit(guardRecoveryAttacker, guardRecoveryDefender, 45, 80, 260, '#72dcff', 'LIGHT');
assert(guardRecoveryDefender.health === punishableAfterBlockHealth - 45 && guardRecoveryDefender.hitstun > 0, 'guard recovery should not auto-block the next attack');

const airFighter = test.makeFighter('player', 'luna');
airFighter.grounded = false; airFighter.y = 300;
assert(test.triggerAction(airFighter, 'j'), 'air light should be available while airborne');

const downAttacker = test.makeFighter('player', 'luna');
const downDefender = test.makeFighter('cpu', 'neko');
test.applyHit(downAttacker, downDefender, 1200, 300, 500, '#ff9d52', 'HEAVY');
assert(downDefender.health === 0 && downDefender.state === 'down', 'KO should enter down state');

test.startMatch('training');
timers.at(-1)?.();
assert(test.getState() === 'playing', 'training match should enter playing state');
assert(test.getCpuDifficulty() === 'easy', 'CPU should default to EASY');
assert(test.getCharacterTrial(test.getPlayer()).steps.length >= 2, 'selected character trial should have a route');
assert(test.startCharacterTrial(), 'character trial should arm in training mode');
assert(test.getCharacterTrialState().active && test.getCharacterTrialState().step === 0, 'character trial should begin at step zero');
const trialPlayer = test.getPlayer();
const trialCpu = test.getCpu();
const trialFirstKey = test.getCharacterTrial(trialPlayer).steps[0];
assert(test.triggerAction(trialPlayer, trialFirstKey), 'character trial first move should be actionable');
test.applyHit(trialPlayer, trialCpu, 45, 80, 260, '#72dcff', 'TRIAL', test.getMoveFor(trialPlayer, trialFirstKey));
assert(test.getCharacterTrialState().step === 1, 'character trial should advance after a confirmed hit');
test.resetTrainingDummy();
assert(!test.getCharacterTrialState().active && test.getCharacterTrialState().step === 0, 'dummy reset should clear character trial progress');
assert(test.startMixupDrill() && test.getTrainingMixup(), 'mixup drill should arm in training mode');
assert(test.getCpu()?.guard && !test.getCpu()?.crouching && test.getTrainingMixupLabel() === 'STAND GUARD', 'mixup drill should begin with a standing guard pattern');
test.tick(4.05);
assert(test.getCpu()?.guard && test.getCpu()?.crouching && test.getTrainingMixupLabel() === 'CROUCH GUARD', 'mixup drill should rotate to a crouching guard pattern');
test.resetTrainingDummy();
assert(!test.getTrainingMixup(), 'training dummy reset should stop the mixup drill');
assert(test.startPunishDrill() && test.getTrainingDrill(), 'punish drill should arm in training mode');
assert(test.getCpu()?.attack?.move.label === 'HEAVY' && test.getCpu()?.attack?.move.recovery === 4000 && test.getCpu()?.attack?.hitDone && test.getCpu()?.attack?.result === 'whiff' && test.getCpu()?.attack?.elapsed > test.getCpu()?.attack?.move.startup + test.getCpu()?.attack?.move.active && test.getCpu()?.x - test.getPlayer()?.x === 150, 'punish drill should create a guaranteed recovery punish setup');
test.resetTrainingDummy();
assert(test.getCpuHealth() === 940 && !test.getTrainingDrill(), 'training dummy should reset to selected CPU max health and stop the drill');
assert(test.toggleTrainingRecord() && test.getTrainingRecording(), 'training record should start');
test.tick(.1);
test.tick(.1);
test.toggleTrainingRecord();
assert(test.getTrainingRecordLength() >= 0 && !test.getTrainingRecording(), 'training record should stop');
assert(test.toggleTrainingReplay() && test.getTrainingReplay(), 'training replay should start when a record exists');
test.resetTrainingDummy();
assert(!test.getTrainingReplay(), 'training dummy reset should stop replay mode');
test.togglePause();
assert(test.getState() === 'paused', 'pause should freeze a live match');
test.togglePause();
assert(test.getState() === 'playing', 'pause should resume a live match');

elements.get('difficultySelect').value = 'hard';
test.startMatch('cpu');
timers.at(-1)?.();
test.tick(.5);
test.getPlayer().state = 'knockdown';
test.getPlayer().knockdownTimer = 320;
test.updateCpu(.016);
assert(test.getCpuIntent() === 'OKI', 'CPU should recognize a knocked-down opponent and enter OKI intent');
assert(test.getCpuReason() === 'APPROACH' || test.getCpuReason() === 'NEUTRAL', 'CPU should expose an OKI setup reason');

test.startMatch('cpu');
timers.at(-1)?.();
const quickOkiPlayer = test.getPlayer();
const quickOkiCpu = test.getCpu();
quickOkiPlayer.x = 500; quickOkiCpu.x = 680;
quickOkiPlayer.state = 'wakeup';
quickOkiPlayer.wakeupTimer = 180;
quickOkiPlayer.lastWakeupOption = 'QUICK RISE';
test.updateCpu(.016);
assert(test.getCpuIntent() === 'OKI' && test.getCpuReason() === 'MEATY / QUICK RISE', 'CPU should read quick rise as a meaty timing setup');
assert(test.getMatchLog().some((event) => event.type === 'OKI_READ' && event.option === 'QUICK RISE'), 'quick rise OKI read should be logged');

test.startMatch('cpu');
timers.at(-1)?.();
const rollOkiPlayer = test.getPlayer();
const rollOkiCpu = test.getCpu();
rollOkiPlayer.x = 500; rollOkiCpu.x = 820;
rollOkiPlayer.state = 'wakeup';
rollOkiPlayer.wakeupTimer = 240;
rollOkiPlayer.lastWakeupOption = 'BACK ROLL';
test.updateCpu(.016);
assert(test.getCpuIntent() === 'OKI' && test.getCpuReason() === 'ROLL CHASE', 'CPU should chase a back roll before attacking');
assert(test.getMatchLog().some((event) => event.type === 'OKI_READ' && event.option === 'BACK ROLL'), 'back roll OKI read should be logged');
test.startMatch('cpu');
timers.at(-1)?.();
const punishPlayerLive = test.getPlayer();
const punishCpuLive = test.getCpu();
punishPlayerLive.x = 500; punishCpuLive.x = 600;
assert(test.triggerAction(punishPlayerLive, 'k'), 'live whiff punish setup should start player heavy');
punishPlayerLive.attack.elapsed = punishPlayerLive.attack.move.startup + punishPlayerLive.attack.move.active + 1;
test.updateCpu(.016);
assert(test.getCpuDifficulty() === 'hard' && test.getCpuIntent() === 'PUNISH' && test.getCpuReason() === 'WHIFF PUNISH', 'HARD CPU should prioritize a whiff punish');
test.startMatch('cpu');
timers.at(-1)?.();
const defenseReadPlayer = test.getPlayer();
const defenseReadCpu = test.getCpu();
defenseReadPlayer.x = 500; defenseReadCpu.x = 600;
assert(test.triggerAction(defenseReadPlayer, 'n'), 'defense read setup should start player low');
test.tick(.016);
assert(defenseReadCpu.guard && defenseReadCpu.crouching && test.getCpuReason() === 'LOW GUARD', 'HARD CPU should crouch guard an incoming low');
test.startMatch('cpu');
timers.at(-1)?.();
const throwReadPlayer = test.getPlayer();
const throwReadCpu = test.getCpu();
throwReadPlayer.x = 500; throwReadCpu.x = 560;
assert(test.triggerAction(throwReadPlayer, 'u'), 'throw tech read setup should start player throw');
test.tick(.016);
assert(throwReadCpu.throwTechWindow > 0 && test.getCpuReason() === 'THROW TECH', 'HARD CPU should open a throw tech window');
test.startMatch('cpu');
timers.at(-1)?.();
const blockPunishPlayer = test.getPlayer();
const blockPunishCpu = test.getCpu();
blockPunishPlayer.x = 500; blockPunishCpu.x = 600; blockPunishCpu.guard = true;
assert(test.triggerAction(blockPunishPlayer, 'k'), 'block punish setup should start player heavy');
blockPunishPlayer.attack.elapsed = 200;
test.applyHit(blockPunishPlayer, blockPunishCpu, 100, 190, 410, '#ff9d52', 'HEAVY', test.getMoveFor(blockPunishPlayer, 'k'));
blockPunishPlayer.attack.hitDone = true;
blockPunishPlayer.attack.elapsed = 350;
blockPunishCpu.blockstun = 0;
blockPunishCpu.guardRecovery = 0;
test.updateCpu(.016);
assert(test.getCpuReason() === 'BLOCK PUNISH' && test.getCpuIntent() === 'PUNISH', 'HARD CPU should punish an unsafe blocked heavy');
test.startMatch('training');
timers.at(-1)?.();
test.tick(.5);
const trainingCpuX = test.getCpuX();
assert(trainingCpuX === 880, 'training CPU should begin at the right-side anchor');

const dashFighter = test.makeFighter('player', 'kagari');
test.updateFighter(dashFighter, test.makeFighter('cpu', 'neko'), { left: false, right: false, jump: false, guard: false, dashRight: true }, .01);
assert(dashFighter.state === 'dash' && dashFighter.vx > 700, 'double-tap dash should accelerate the fighter');

test.startMatch('arcade');
timers.at(-1)?.();
assert(test.getMode() === 'arcade', 'arcade mode should be selectable');
assert(test.getArcadeOpponent() === 'neko', 'arcade route should begin with NEKOMUSICA');

assert(test.getFrameLab() === false, 'frame lab should begin disabled');
test.toggleFrameLab();
assert(test.getFrameLab() === true, 'frame lab should toggle on');
test.toggleFrameLab();
assert(test.getFrameLab() === false, 'frame lab should toggle off');

const indexHtml = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const showroomSource = fs.readFileSync(new URL('./showroom3d.js', import.meta.url), 'utf8');
assert(indexHtml.includes('id="showroomCanvas"') && indexHtml.includes('id="showroomButton"'), '3D showroom shell missing');
assert(indexHtml.includes('data-3d-key="a"') && indexHtml.includes('showroomPlayerHealthBar'), '3D mobile controls or health HUD missing');
assert(indexHtml.includes('id="difficultySelect"') && indexHtml.includes('id="inputReadout"') && indexHtml.includes('id="hitDirectionReadout"'), 'P0 combat feedback UI missing');
assert(indexHtml.includes('id="punishDrillButton"'), 'training punish drill control missing');
assert(indexHtml.includes('id="mixupDrillButton"'), 'training mixup drill control missing');
assert(indexHtml.includes('id="characterTrialButton"') && indexHtml.includes('id="trialReadout"'), 'character trial UI missing');
assert(indexHtml.includes('id="frameAdvantageReadout"') && indexHtml.includes('data-key="n"') && indexHtml.includes('data-key="m"'), 'frame advantage or mobile mixup controls missing');
assert(indexHtml.includes('id="showroomRoundReadout"') && indexHtml.includes('data-3d-key="s"') && indexHtml.includes('data-3d-key="c"'), '3D round or guard controls missing');
assert(indexHtml.includes('data-3d-key="n"') && indexHtml.includes('data-3d-key="m"') && indexHtml.includes('data-3d-key="u"'), '3D mixup controls missing');
assert(indexHtml.includes('JUMP / RISE') && indexHtml.includes('LIGHT / AIR') && indexHtml.includes('HEAVY / AIR'), '3D jump and air controls missing');
assert(indexHtml.includes('showroom3d.js?v=64') && indexHtml.includes('style.css?v=46'), '3D runtime cache version missing');
assert(indexHtml.includes('id="showroomSoundButton"'), '3D sound control missing');
assert(indexHtml.includes('game.js?v=63'), '2D runtime cache version missing');
assert(showroomSource.includes("getContext('webgl'") && showroomSource.includes('drawArena') && showroomSource.includes('LUNA_SHOWROOM'), 'WebGL showroom runtime missing');
assert(showroomSource.includes('column-major') && showroomSource.includes('cameraShake') && showroomSource.includes('addEffect'), '3D render and battle feedback fix missing');
assert(showroomSource.includes('isBattleCameraLocked') && showroomSource.includes('BATTLE LOCK / SIDE VIEW') && showroomSource.includes('cameraDistance'), '3D battle camera lock missing');
assert(showroomSource.includes('MOVE_DATA') && showroomSource.includes('applyDuelHit') && showroomSource.includes('playerGuard'), '3D combat state model missing');
assert(showroomSource.includes("meterCost: 25") && showroomSource.includes('NEED DRIVE') && showroomSource.includes('duel[meterKey] = Math.max(0, duel[meterKey] - meterCost)'), '3D SPECIAL DRIVE economy missing');
assert(showroomSource.includes('DAYBREAK RUSH') && showroomSource.includes('GLITCH TRAP') && showroomSource.includes('MAGNET ARMOR'), '3D fighter-specific specials missing');
assert(showroomSource.includes('resolveDuelPushbox') && showroomSource.includes('duel[`${defender}Attack`] = null'), '3D pushbox or hit interruption missing');
assert(showroomSource.includes('endDuelRound') && showroomSource.includes('advanceDuelRound') && showroomSource.includes('FIRST TO TWO'), '3D round flow missing');
assert(showroomSource.includes('roundIntro') && showroomSource.includes('ROUND ${String(duel.round).padStart(2, \'0\')} / READY') && showroomSource.includes("setShowroomBanner('FIGHT!"), '3D round intro input lock missing');
assert(showroomSource.includes("statusEl.textContent = duel.paused ? 'WEBGL ONLINE / PAUSED'") && showroomSource.includes("if (MOVE_DATA[key]) attack('player', key);\n    else queueInput(key);"), '3D keyboard feedback overwrite missing');
assert(showroomSource.includes('guardHeightValid') && showroomSource.includes('THROW TECH') && showroomSource.includes('playerCrouch'), '3D mixup and crouch rules missing');
assert(showroomSource.includes('JUMP_SPEED') && showroomSource.includes('function jump(side)') && showroomSource.includes('AIR EVADE') && showroomSource.includes('ANTI-AIR') && showroomSource.includes('playerAir'), '3D jump and air hit rules missing');
assert(showroomSource.includes('antiAir: true') && showroomSource.includes('CPU ANTI-AIR'), '3D anti-air response missing');
assert(showroomSource.includes('move.air') && showroomSource.includes('setShowroomBanner(move.label'), '3D air attack feedback missing');
assert(showroomSource.includes("const defenderCrouch = duel[`${defender}Crouch`]") && !showroomSource.includes('if (move.throw && defenderCrouch)'), '3D throw should beat crouching guard');
assert(showroomSource.includes('showroomFightBanner') && showroomSource.includes('playerComboTimer'), '3D fight result or combo HUD missing');
assert(showroomSource.includes('showDuelResult') && showroomSource.includes('showroomResultCard'), '3D match report missing');
assert(showroomSource.includes('getDuelAgentName') && showroomSource.includes('WINS / 3D CLEAR'), '3D match report should use selected agent names');
assert(showroomSource.includes('playerKnockdown') && showroomSource.includes('playerWakeup') && showroomSource.includes('ThrowInvuln'), '3D knockdown and wakeup rules missing');
assert(showroomSource.includes('playerWakeupOption') && showroomSource.includes('QUICK RISE') && showroomSource.includes('BACK ROLL') && showroomSource.includes('FORWARD ROLL'), '3D wakeup option rules missing');
assert(showroomSource.includes('cpuOkiReason') && showroomSource.includes('QUICK RISE READ') && showroomSource.includes('ROLL CHASE') && showroomSource.includes('ROLL CHECK'), '3D CPU wakeup reads missing');
assert(showroomSource.includes('updateDuelCpu') && showroomSource.includes('CPU OKI') && showroomSource.includes('cpuCooldown = Math.max'), '3D CPU pressure or cooldown logic missing');
assert(showroomSource.includes('impactMultiplier') && showroomSource.includes('PUNISH COUNTER') && showroomSource.includes('COUNTER HIT') && showroomSource.includes('lastImpact'), '3D counter and punish feedback missing');
assert(showroomSource.includes('hitstop') && showroomSource.includes('/ HITSTOP') && showroomSource.includes('duel.hitstop > 0'), '3D hitstop feedback missing');
assert(showroomSource.includes('playDuelSfx') && showroomSource.includes('toggleDuelSound') && showroomSource.includes('attackKey'), '3D audio or attack pose feedback missing');
assert(showroomSource.includes('playerInputBuffer') && showroomSource.includes('canFollowAttack') && showroomSource.includes('CHAIN /'), '3D combo input buffer missing');
assert(showroomSource.includes('comboDamageScale') && showroomSource.includes('playerComboScale') && showroomSource.includes('/ ${Math.round(duel.playerComboScale * 100)}% DMG'), '3D combo proration missing');
assert(showroomSource.includes('formatFrameAdvantage') && showroomSource.includes('playerFrameAdvantage') && showroomSource.includes('last3DContact'), '3D frame advantage readout missing');
assert(showroomSource.includes('playerGuardRecovery') && showroomSource.includes('defenderGuardRecovery') && showroomSource.includes('cpuGuardRecovery <= 0') && showroomSource.includes('cpuGuardTimer') && showroomSource.includes('cpuGuardMode'), '3D guard recovery or readable defense rules missing');
assert(showroomSource.includes('playerBlockstun') && showroomSource.includes('defenderBlockstun') && showroomSource.includes('BLOCKSTUN'), '3D blockstun phase missing');
assert(showroomSource.includes('DUEL_DIFFICULTIES') && showroomSource.includes('CPU WHIFF PUNISH') && showroomSource.includes('CPU BLOCK PUNISH'), '3D CPU difficulty and punish reads missing');
assert(indexHtml.includes('showroomTrainingButton') && indexHtml.includes('showroomDummyGuardButton') && indexHtml.includes('showroomDummyCrouchButton'), '3D training dummy controls missing');
assert(indexHtml.includes('showroomPunishDrillButton') && indexHtml.includes('showroomMixupDrillButton'), '3D training drill controls missing');
assert(indexHtml.includes('showroomFrameLabButton'), '3D frame lab control missing');
assert(showroomSource.includes('toggleDuelTraining') && showroomSource.includes('isDummyGuardActive') && showroomSource.includes('DUMMY RESET'), '3D training dummy runtime missing');
assert(showroomSource.includes('arm3DPunishDrill') && showroomSource.includes('3D PUNISH DRILL') && showroomSource.includes('PUNISH COUNTER'), '3D punish drill runtime missing');
assert(showroomSource.includes('duel.cpuKnockdown > 0 || duel.cpuWakeup > 0'), '3D punish drill should respect dummy knockdown and wakeup');
assert(showroomSource.includes('arm3DMixupDrill') && showroomSource.includes('set3DMixupPhase') && showroomSource.includes('OPEN / THROW'), '3D mixup drill runtime missing');
assert(showroomSource.includes('toggleDuelFrameLab') && showroomSource.includes('drawDuelFrameLab') && showroomSource.includes('HITBOXES ON'), '3D frame lab runtime missing');
assert(showroomSource.includes('queueCpuTelegraph') && showroomSource.includes('CPU TELEGRAPH') && showroomSource.includes('getTelegraphState'), '3D CPU telegraph runtime missing');
assert(indexHtml.includes('showroomLogTimeline') && indexHtml.includes('showroomLogReadout'), '3D fight log UI missing');
assert(showroomSource.includes('recordDuelEvent') && showroomSource.includes('frameOverride = null') && showroomSource.includes('getFightLog') && showroomSource.includes('THROW TECH'), '3D fight log runtime missing');
assert(['SOLAR RUSH', 'PHASE NOTE', 'HEX BURST', 'WIND VEIL', 'DRAGON FLARE', 'SLIME BOUNCE', 'ORBIT BREAK'].every((label) => showroomSource.includes(label)), '3D roster special labels missing');
assert(showroomSource.includes('teleport') && showroomSource.includes('ORBIT SHIFT') && showroomSource.includes('specialKind'), '3D special behavior differentiation missing');
assert(showroomSource.includes('knockdown: .52') && showroomSource.includes('KNOCKDOWN') && showroomSource.includes('PRESSURE WINDOW'), '3D heavy-hit knockdown and pressure state missing');
assert(showroomSource.includes('comboRoutes') && showroomSource.includes('canFollowAttack(side') && showroomSource.includes("comboRoutes: { j: ['n']"), '3D character-specific combo routes missing');
assert(['solar-step', 'phase-low', 'magnet-heavy', 'bounce-overhead', 'orbit-shift', 'sun-punch', 'glitch-claw', 'hex-mark', 'wind-slice', 'dragon-crush'].every((kind) => showroomSource.includes(kind)), '3D signature normal moves missing');
assert(source.includes('CPU_DIFFICULTIES') && source.includes('telegraph') && source.includes('resetTrainingDummy'), 'P0 difficulty, telegraph, or training dummy logic missing');
assert(source.includes('resolvePushbox') && source.includes('MAGNET ARMOR') && source.includes('GLITCH TRAP'), 'P1 fighter-specific behavior missing');
assert(source.includes('SOLAR STEP') && source.includes('PHASE LOW') && source.includes('MAGNET HEAVY') && source.includes('BOUNCE OVERHEAD') && source.includes('ORBIT SHIFT'), '2D signature normal moves missing');
assert(source.includes('function drawSignatureMoveEffect') && ['solar-step', 'phase-low', 'magnet-heavy', 'bounce-overhead', 'orbit-shift', 'sun-punch', 'glitch-claw', 'hex-mark', 'wind-slice', 'dragon-crush'].every((kind) => source.includes(`signature: '${kind}'`)), '2D signature move visual effects missing');
assert(source.includes('move.teleport') && source.includes('attack.teleported') && source.includes('opponent.x + fighter.facing * 92'), '2D position-shift attack logic missing');
assert(source.includes('specialCancelReady') && source.includes('toggleTrainingReplay') && source.includes('guardRecovery'), 'P1 cancel, recovery, or training replay logic missing');
assert(source.includes('CHARACTER_COMBO_ROUTES') && source.includes('getComboRoute') && source.includes('ROUTE ${bufferedKey.toUpperCase()}'), '2D character-specific combo route logic missing');
assert(source.includes("player.state === 'knockdown'") && source.includes("cpuBrain.intent = 'OKI'"), 'CPU wakeup pressure logic missing');
assert(source.includes('resetTrainingDummy(preserveReplay') && source.includes("bufferedKey === 'o' ? triggerDriveBurst"), 'training reset or burst replay logic missing');
assert(source.includes('setCpuDecision') && source.includes('WHIFF PUNISH') && source.includes('GUARD READ'), 'CPU decision reason logic missing');
assert(source.includes('punishTarget') && source.includes('const punishReady') && source.includes("cpuBrain.intent = 'PUNISH'"), 'CPU whiff punish priority missing');
assert(source.includes("punish: [88") && source.includes("counter: [205") && source.includes('burstPower'), 'counter and punish impact feedback missing');
assert(source.includes('function startPunishDrill') && source.includes('function armPunishDrill') && source.includes('trainingDrillTimer'), 'training punish drill runtime missing');
assert(source.includes('function startMixupDrill') && source.includes('function armMixupDrill') && source.includes('MIXUP_DRILL_PATTERNS'), 'training mixup drill runtime missing');
assert(source.includes('CHARACTER_TRIALS') && source.includes('function startCharacterTrial') && source.includes('TRIAL CLEAR'), 'character trial runtime missing');
assert(source.includes('DEFENSE READ') && source.includes('LOW GUARD') && source.includes('THROW AVOID'), 'CPU defensive mixup read missing');
assert(source.includes('throwTechWindow') && source.includes("THROW TECH"), 'CPU throw tech window missing');
assert(source.includes('playerBlockPunishable') && source.includes('BLOCK PUNISH'), 'CPU block punish logic missing');
assert(showroomSource.includes('!duel.playerAttack && duel.cpuHp > 0'), '3D CPU neutral attack should wait during player attack');
assert(source.includes('WAKEUP_OPTION') && source.includes('QUICK RISE') && source.includes('BACK ROLL'), 'wakeup option logic missing');
assert(source.includes('lastAttackResult') && source.includes(' / ${result}'), 'frame lab attack result display missing');

console.log('LUNA OVERDRIVE smoke test passed: roster, selection, tuning, projectile visual, super, pause, dash, arcade route, frame lab');
