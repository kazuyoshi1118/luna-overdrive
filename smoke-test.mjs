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
vm.runInContext(`${source}\n;globalThis.__test = { order: ROSTER_ORDER, chooseCharacter, showCharacterSelect, makeFighter, getMoveFor, triggerAction, triggerAssistCombo, triggerDriveBurst, applyHit, updateFighter, startMatch, tick, togglePause, toggleFrameLab, getState: () => state, getMode: () => mode, getArcadeOpponent: () => selectedCpuId, getCpuX: () => cpu?.x, getFrameLab: () => frameLab };`, context);
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
test.chooseCharacter('bolt9');
const bolt = test.makeFighter('player', 'bolt9');
assert(bolt.health === 1120, 'BOLT-9 health tuning missing');
assert(test.getMoveFor(bolt, 'l').label === 'MAGNET PUNCH', 'BOLT-9 special missing');
assert(test.getMoveFor(bolt, 'l').visual === 'magnet', 'BOLT-9 projectile visual missing');
bolt.meter = 1000;
assert(test.triggerAction(bolt, 'i'), 'OVERDRIVE should start with full meter');

const bufferFighter = test.makeFighter('player', 'luna');
const bufferOpponent = test.makeFighter('cpu', 'neko');
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
cancelFighter.attack.elapsed = 220;
cancelFighter.inputBuffer = { key: 'k', ttl: .2 };
test.updateFighter(cancelFighter, cancelOpponent, { left: false, right: false, jump: false, guard: false }, .01);
assert(cancelFighter.attack?.move.label === 'HEAVY', 'confirmed hit should cancel into the buffered attack');

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

const throwAttacker = test.makeFighter('player', 'luna');
const throwDefender = test.makeFighter('cpu', 'neko');
throwDefender.guard = true;
test.applyHit(throwAttacker, throwDefender, 120, 300, 500, '#ffe07a', 'THROW');
assert(throwDefender.health < throwDefender.character.health, 'throw should beat a standing guard');

const burstFighter = test.makeFighter('player', 'luna');
burstFighter.meter = 300;
burstFighter.hitstun = 240;
assert(test.triggerDriveBurst(burstFighter), 'drive burst should escape hitstun with meter');
assert(burstFighter.attack?.move.label === 'DRIVE BURST' && burstFighter.driveInvuln > 0, 'drive burst should grant a brief invulnerable reversal');

test.startMatch('training');
timers.at(-1)?.();
assert(test.getState() === 'playing', 'training match should enter playing state');
test.togglePause();
assert(test.getState() === 'paused', 'pause should freeze a live match');
test.togglePause();
assert(test.getState() === 'playing', 'pause should resume a live match');

test.startMatch('cpu');
timers.at(-1)?.();
test.tick(.5);
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
assert(indexHtml.includes('showroom3d.js?v=35'), '3D runtime cache version missing');
assert(showroomSource.includes("getContext('webgl'") && showroomSource.includes('drawArena') && showroomSource.includes('LUNA_SHOWROOM'), 'WebGL showroom runtime missing');

console.log('LUNA OVERDRIVE smoke test passed: roster, selection, tuning, projectile visual, super, pause, dash, arcade route, frame lab');
