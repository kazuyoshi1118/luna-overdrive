(() => {
  const canvas = document.getElementById('showroomCanvas');
  if (!canvas) return;

  const panel = document.getElementById('showroomPanel');
  const openButton = document.getElementById('showroomButton');
  const backButton = document.getElementById('showroomBackButton');
  const resetButton = document.getElementById('showroomResetButton');
  const rosterEl = document.getElementById('showroomRoster');
  const captionEl = document.getElementById('showroomCaption');
  const statusEl = document.getElementById('showroomStatus');
  const playerHpEl = document.getElementById('showroomPlayerHp');
  const cpuHpEl = document.getElementById('showroomCpuHp');
  const cameraReadoutEl = document.getElementById('showroomCameraReadout');
  const roster = window.LUNA_ROSTER || {};
  const rosterOrder = Object.keys(roster);
  const input = new Set();
  const duel = { open: false, playerId: 'luna', cpuId: 'neko', playerX: -1.7, cpuX: 1.7, playerHp: 100, cpuHp: 100, cooldown: 0, cpuCooldown: 0, playerAction: 0, cpuAction: 0, angle: 0.35, dragging: false, lastPointerX: 0, paused: false, last: 0 };

  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) { statusEl.textContent = 'WEBGL UNAVAILABLE / 2D READY'; return; }

  const vertexShader = `attribute vec3 aPosition; attribute vec3 aNormal; uniform mat4 uModel; uniform mat4 uViewProjection; varying vec3 vNormal; void main(){ vNormal=aNormal; gl_Position=uViewProjection*uModel*vec4(aPosition,1.0); }`;
  const fragmentShader = `precision mediump float; uniform vec3 uColor; uniform float uGlow; varying vec3 vNormal; void main(){ vec3 light=normalize(vec3(-0.35,0.9,0.8)); float diffuse=max(dot(normalize(vNormal),light),0.0); float shade=0.36+diffuse*0.72; gl_FragColor=vec4(uColor*shade+uColor*uGlow,1.0); }`;

  function compile(type, source) { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)); return shader; }
  const program = gl.createProgram(); gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader)); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)); gl.useProgram(program);
  const locations = { position: gl.getAttribLocation(program, 'aPosition'), normal: gl.getAttribLocation(program, 'aNormal'), model: gl.getUniformLocation(program, 'uModel'), viewProjection: gl.getUniformLocation(program, 'uViewProjection'), color: gl.getUniformLocation(program, 'uColor'), glow: gl.getUniformLocation(program, 'uGlow') };

  const positions = []; const normals = [];
  const faces = [[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]], [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]], [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]], [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]], [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]], [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]];
  for (const face of faces) { const [a,b,c,d,n] = face; for (const tri of [[a,b,c],[a,c,d]]) for (const point of tri) { positions.push(...point); normals.push(...n); } }
  const positionBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); gl.enableVertexAttribArray(locations.position); gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
  const normalBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW); gl.enableVertexAttribArray(locations.normal); gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);

  const hex = (value) => { const n = parseInt(String(value || '#72dcff').replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const identity = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const multiply = (a, b) => { const out = Array(16).fill(0); for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) for (let k = 0; k < 4; k++) out[col + row * 4] += a[k + row * 4] * b[col + k * 4]; return out; };
  const perspective = (fov, aspect, near, far) => { const f = 1 / Math.tan(fov / 2); return [f / aspect,0,0,0, 0,f,0,0, 0,0,(far + near) / (near - far),-1, 0,0,(2 * far * near) / (near - far),0]; };
  const lookAt = (eye, target, up) => { const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map(n => n / l); }; const sub = (a,b) => a.map((n,i) => n-b[i]); const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; const z = norm(sub(eye,target)); const x = norm(cross(up,z)); const y = cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2], -y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2], -z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2],1]; };
  const model = (x, y, z, sx, sy, sz) => { const m = identity(); m[0] = sx; m[5] = sy; m[10] = sz; m[12] = x; m[13] = y; m[14] = z; return m; };
  const drawBox = (x, y, z, sx, sy, sz, color, glow = 0) => { gl.uniformMatrix4fv(locations.model, false, new Float32Array(model(x,y,z,sx,sy,sz))); gl.uniform3fv(locations.color, new Float32Array(hex(color))); gl.uniform1f(locations.glow, glow); gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3); };

  function drawAgent(id, x, t, facing, action) {
    const agent = roster[id] || roster.luna || { name: 'LUNA', accent: '#ff9d52', role: 'BALANCED' }; const accent = agent.accent || '#ff9d52'; const dark = '#10152e'; const white = '#eaf5ff';
    const bob = Math.sin(t * 4 + (x < 0 ? 0 : 1)) * .045; const attack = action > 0 ? Math.sin(action * 18) * .32 : 0; const front = .28;
    drawBox(x, .45 + bob, 0, .24, .55, .25, dark); drawBox(x - .22, .44 + bob, 0, .16, .52, .2, accent); drawBox(x + .22, .44 + bob, 0, .16, .52, .2, accent);
    drawBox(x, 1.42 + bob, 0, .47, .72, .34, dark); drawBox(x, 1.46 + bob, .02, .37, .55, .28, accent, action > 0 ? .15 : .02); drawBox(x, 2.38 + bob, 0, .42, .42, .38, white); drawBox(x, 2.39 + bob, front, .23, .10, .04, accent, .25);
    drawBox(x - .58, 1.44 + bob, front * .3, .13, .55, .14, accent); drawBox(x + .58, 1.44 + bob, front * .3, .13, .55, .14, accent); drawBox(x + facing * (.53 + Math.abs(attack)), 1.42 + bob, front * .5, .16, .14, .17, action > 0 ? '#fff0a7' : accent, action > 0 ? .4 : .03);
    if (agent.role === 'DRAGON' || agent.role === 'POWER') { drawBox(x - .27, 2.77 + bob, 0, .10, .22, .12, accent, .15); drawBox(x + .27, 2.77 + bob, 0, .10, .22, .12, accent, .15); }
    if (agent.role === 'TANK') { drawBox(x - .52, 1.86 + bob, 0, .20, .20, .35, '#6e7fa5'); drawBox(x + .52, 1.86 + bob, 0, .20, .20, .35, '#6e7fa5'); }
    if (agent.role === 'WIND') { drawBox(x - .76, 1.85 + bob, -.05, .08, .62, .08, '#8ff0bd', .2); drawBox(x + .76, 1.85 + bob, -.05, .08, .62, .08, '#8ff0bd', .2); }
    if (agent.role === 'COSMIC') { drawBox(x, 3.00 + bob, 0, .12, .12, .12, '#b99aff', .55); drawBox(x, 1.95 + bob, -.40, .08, .08, .08, '#b99aff', .35); }
    if (agent.role === 'CHAOS') { drawBox(x - .34, 2.92 + bob, 0, .08, .08, .08, '#64e6e4', .55); drawBox(x + .34, 2.92 + bob, 0, .08, .08, .08, '#64e6e4', .55); }
  }

  function drawArena(t) {
    const aspect = Math.max(1, canvas.width / Math.max(1, canvas.height)); const eye = [Math.sin(duel.angle) * 8.2, 4.2, Math.cos(duel.angle) * 8.2]; const vp = multiply(perspective(Math.PI / 3.3, aspect, .1, 100), lookAt(eye, [0,1.35,0], [0,1,0]));
    gl.uniformMatrix4fv(locations.viewProjection, false, new Float32Array(vp)); gl.clearColor(.035, .055, .14, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawBox(0, -.22, 0, 5.4, .22, 3.2, '#17224a'); for (let x = -5; x <= 5; x++) drawBox(x, .015, 0, .012, .015, 3, '#2b5d88', .05); for (let z = -3; z <= 3; z++) drawBox(0, .02, z, 5.3, .015, .012, '#2b5d88', .05);
    drawBox(0, 2.7, -2.9, 5.2, 2.7, .12, '#141a3a'); drawBox(0, .9, -2.72, 5.0, .04, .04, '#72dcff', .32); drawBox(-3.9, 1.35, -2.48, .52, 1.35, .18, '#ff9d52', .12); drawBox(3.9, 1.35, -2.48, .52, 1.35, .18, '#a68cff', .12); drawBox(0, 3.55, -2.55, 1.0, .12, .12, '#ffe07a', .3);
    drawAgent(duel.playerId, duel.playerX, t, 1, duel.playerAction); drawAgent(duel.cpuId, duel.cpuX, t + .7, -1, duel.cpuAction);
  }

  function resize() { const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(320, Math.floor(rect.width * dpr)); canvas.height = Math.max(240, Math.floor(rect.height * dpr)); gl.viewport(0, 0, canvas.width, canvas.height); }
  function updateHud() { playerHpEl.textContent = String(Math.round(duel.playerHp)); cpuHpEl.textContent = String(Math.round(duel.cpuHp)); const player = roster[duel.playerId] || {}; captionEl.textContent = `${player.name || duel.playerId} / ${player.title || '3D AGENT'} VS ${(roster[duel.cpuId] || {}).name || duel.cpuId}`; cameraReadoutEl.textContent = `ORBIT ${Math.round((duel.angle * 180 / Math.PI + 360) % 360)}°`; }
  function reset() { duel.playerX = -1.7; duel.cpuX = 1.7; duel.playerHp = 100; duel.cpuHp = 100; duel.cooldown = 0; duel.cpuCooldown = 0; duel.playerAction = 0; duel.cpuAction = 0; duel.paused = false; statusEl.textContent = 'WEBGL ONLINE / DUEL READY'; updateHud(); }
  function attack(side, power) { const distance = Math.abs(duel.playerX - duel.cpuX); if (side === 'player' && duel.cooldown <= 0) { duel.playerAction = 1; duel.cooldown = .38; if (distance < 2.35) duel.cpuHp = Math.max(0, duel.cpuHp - power); } if (side === 'cpu' && duel.cpuCooldown <= 0) { duel.cpuAction = 1; duel.cpuCooldown = .7; if (distance < 2.35) duel.playerHp = Math.max(0, duel.playerHp - power * .65); } updateHud(); }
  function tick(dt, now) { if (!duel.open || duel.paused) return; duel.cooldown -= dt; duel.cpuCooldown -= dt; duel.playerAction = Math.max(0, duel.playerAction - dt * 3.5); duel.cpuAction = Math.max(0, duel.cpuAction - dt * 3.5); if (input.has('a')) duel.playerX = Math.max(-3.7, duel.playerX - dt * 2.6); if (input.has('d')) duel.playerX = Math.min(3.7, duel.playerX + dt * 2.6); if (Math.random() < dt * .72) { if (duel.cpuX > duel.playerX + 1.55) duel.cpuX -= dt * 1.4; else if (duel.cpuX < duel.playerX - 1.2) duel.cpuX += dt * 1.4; else attack('cpu', 6); } if (duel.playerHp <= 0 || duel.cpuHp <= 0) statusEl.textContent = duel.cpuHp <= 0 ? 'LUNA WINS / 3D CLEAR' : 'NEKOMUSICA WINS / RETRY'; updateHud(); drawArena(now / 1000); }
  function frame(now) { const dt = Math.min(.04, (now - duel.last) / 1000 || 0); duel.last = now; tick(dt, now); requestAnimationFrame(frame); }
  function open() { duel.open = true; panel.hidden = false; document.getElementById('titleOverlay').hidden = true; document.body.classList.add('showroom-open'); resize(); reset(); }
  function close() { duel.open = false; panel.hidden = true; document.getElementById('titleOverlay').hidden = false; document.body.classList.remove('showroom-open'); }

  rosterOrder.forEach((id) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'showroom-agent'; button.dataset.agent = id; button.textContent = roster[id].name; button.addEventListener('click', () => { duel.playerId = id; if (id === duel.cpuId) duel.cpuId = id === 'neko' ? 'luna' : 'neko'; rosterEl.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item.dataset.agent === id)); reset(); }); rosterEl.appendChild(button); });
  rosterEl.querySelector('[data-agent="luna"]')?.classList.add('is-active'); openButton.addEventListener('click', open); backButton.addEventListener('click', close); resetButton.addEventListener('click', reset);
  canvas.addEventListener('pointerdown', (event) => { duel.dragging = true; duel.lastPointerX = event.clientX; canvas.setPointerCapture?.(event.pointerId); }); canvas.addEventListener('pointermove', (event) => { if (!duel.dragging) return; duel.angle += (event.clientX - duel.lastPointerX) * .01; duel.lastPointerX = event.clientX; updateHud(); }); canvas.addEventListener('pointerup', () => { duel.dragging = false; }); canvas.addEventListener('pointercancel', () => { duel.dragging = false; });
  window.addEventListener('keydown', (event) => { if (!duel.open) return; const key = event.key.toLowerCase(); if (['a','d','j','k','l','i','p'].includes(key)) event.preventDefault(); if (key === 'p') duel.paused = !duel.paused; else if (key === 'j') attack('player', 8); else if (key === 'k') attack('player', 13); else if (key === 'l') attack('player', 20); else input.add(key); statusEl.textContent = duel.paused ? 'WEBGL ONLINE / PAUSED' : duel.cpuHp <= 0 || duel.playerHp <= 0 ? statusEl.textContent : 'WEBGL ONLINE / DUEL LIVE'; });
  window.addEventListener('keyup', (event) => input.delete(event.key.toLowerCase())); window.addEventListener('resize', resize);
  window.LUNA_SHOWROOM = { open, close, reset, getState: () => ({ open: duel.open, playerId: duel.playerId, cpuId: duel.cpuId, playerHp: duel.playerHp, cpuHp: duel.cpuHp, webgl: true }) };
  resize(); reset(); requestAnimationFrame(frame);
})();
