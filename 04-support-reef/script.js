// SUPPORT REEF — a 2D underwater ecosystem of fish-as-tickets.

const SYSTEM_PROMPT = `You are a gentle, calm support agent who lives in a small coral reef. A
visitor has come with a technical trouble. You reply quietly, briefly, kindly — never more than
80 words. You speak in plain English with a soft, slightly poetic register, but the diagnosis
underneath is real and useful. Suggest one likely cause and one or two simple things to try.
No markdown, no emoji, no lists, no headings. Just two or three short sentences.`;

const cvs = document.getElementById('reef');
const ctx = cvs.getContext('2d');
const $speeches = document.getElementById('speeches');
const $msg = document.getElementById('msg');
const $send = document.getElementById('send');
const $newkey = document.getElementById('newkey');
const $ticketsOpen = document.getElementById('ticketsOpen');
const $ticketsResolved = document.getElementById('ticketsResolved');
$newkey.addEventListener('click', (e) => { e.preventDefault(); window.ApiKey.resetApiKey(); });

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = cvs.clientWidth = window.innerWidth;
  H = cvs.clientHeight = window.innerHeight;
  cvs.width = W * DPR; cvs.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

// ---------- ENTITIES ----------
const fishes = [];         // all swimming fish (agent + issue fish + ambient)
const bubbles = [];        // rising bubbles
const kelps = [];          // background kelp
const corals = [];         // foreground coral silhouettes

// Agent fish (the one in the center)
const AGENT = {
  type: 'agent',
  x: 0, y: 0,            // set after resize
  targetX: 0, targetY: 0,
  vx: 0, vy: 0,
  size: 56,
  color1: '#ffd089',
  color2: '#ff8a7a',
  bob: 0,
  facing: -1,
  phase: Math.random() * Math.PI * 2,
};

function placeAgent() {
  AGENT.x = W * 0.5;
  AGENT.y = H * 0.5;
  AGENT.targetX = AGENT.x; AGENT.targetY = AGENT.y;
}
placeAgent();

// Issue-fish factory
let fishId = 0;
function spawnIssueFish(text) {
  const id = ++fishId;
  const f = {
    id,
    type: 'user',
    text,
    x: -40, y: H * 0.4 + Math.random() * H * 0.2,
    targetX: AGENT.x - 100, targetY: AGENT.y + 10 + (Math.random()-.5)*40,
    vx: 0, vy: 0,
    size: 36,
    color1: '#f6c2b4', color2: '#ff8a7a',
    bob: 0, facing: 1,
    phase: Math.random() * Math.PI * 2,
    state: 'swim-in',  // swim-in → near → fading
    born: performance.now(),
    bubbleEl: null,
    agentBubbleEl: null,
  };
  fishes.push(f);
  return f;
}

// Ambient fish (just for atmosphere)
function spawnAmbient(side) {
  const fromLeft = side === 'l';
  const y = H * 0.15 + Math.random() * H * 0.7;
  fishes.push({
    type: 'ambient',
    x: fromLeft ? -30 : W + 30,
    y, targetX: fromLeft ? W + 60 : -60, targetY: y + (Math.random()-.5)*120,
    vx: 0, vy: 0,
    size: 16 + Math.random()*14,
    color1: pickColor(), color2: pickColor(),
    bob: 0, facing: fromLeft ? 1 : -1,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.5,
    state: 'ambient',
  });
}
function pickColor() {
  const c = ['#9be0d0','#f6c2b4','#ffd089','#cfe7f1','#e9c8f0','#a8d8c5','#ffb39a'];
  return c[Math.floor(Math.random()*c.length)];
}

// Initial ambient population
for (let i = 0; i < 6; i++) spawnAmbient(Math.random() > .5 ? 'l' : 'r');
setInterval(() => spawnAmbient(Math.random() > .5 ? 'l' : 'r'), 9000);

// Kelp on the bottom corners
function initKelp() {
  kelps.length = 0;
  for (let i = 0; i < 6; i++) {
    const left = i < 3;
    const x = left ? 60 + i * 40 : W - 60 - (i - 3) * 40;
    kelps.push({
      x, baseY: H, height: 200 + Math.random() * 180,
      width: 12 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
      hue: 130 + Math.random() * 60,
      sat: 28 + Math.random() * 14,
      lig: 22 + Math.random() * 18,
    });
  }
  corals.length = 0;
  for (let i = 0; i < 18; i++) {
    corals.push({
      x: Math.random() * W,
      y: H - Math.random() * 28,
      r: 8 + Math.random() * 24,
      color: ['#ff8a7a','#f6c2b4','#ffd089','#e8b4d8'][Math.floor(Math.random()*4)],
      opacity: 0.5 + Math.random() * 0.4,
    });
  }
}
initKelp();
window.addEventListener('resize', () => { placeAgent(); initKelp(); });

// Bubbles
function emitBubble(x, y, count = 1) {
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: x + (Math.random()-.5)*10,
      y, r: 2 + Math.random()*4,
      vy: -0.5 - Math.random()*0.7,
      vx: (Math.random()-.5)*0.3,
      life: 0,
      max: 220 + Math.random()*120,
    });
  }
}
setInterval(() => emitBubble(Math.random() * W, H - 20, 1), 600);

// ---------- DRAW ----------
function drawSandFloor() {
  const grad = ctx.createLinearGradient(0, H - 90, 0, H);
  grad.addColorStop(0, 'rgba(236,217,181,0)');
  grad.addColorStop(1, 'rgba(236,217,181,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, H - 90, W, 90);

  for (const c of corals) {
    ctx.beginPath();
    ctx.fillStyle = c.color;
    ctx.globalAlpha = c.opacity;
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawKelp(t) {
  for (const k of kelps) {
    ctx.save();
    ctx.translate(k.x, k.baseY);
    const segs = 12;
    const segH = k.height / segs;
    let px = 0, py = 0;
    ctx.beginPath();
    ctx.moveTo(-k.width/2, 0);
    for (let i = 0; i < segs; i++) {
      const sway = Math.sin(t * 0.0008 + k.phase + i * 0.3) * 6 * (i / segs);
      px = sway;
      py = -segH * (i + 1);
      ctx.lineTo(-k.width/2 + sway, py);
    }
    for (let i = segs - 1; i >= 0; i--) {
      const sway = Math.sin(t * 0.0008 + k.phase + i * 0.3) * 6 * (i / segs);
      const py2 = -segH * (i + 1);
      ctx.lineTo(k.width/2 + sway, py2);
    }
    ctx.closePath();
    ctx.fillStyle = `hsla(${k.hue},${k.sat}%,${k.lig}%,0.5)`;
    ctx.fill();
    ctx.restore();
  }
}

function drawFish(f, t) {
  ctx.save();
  ctx.translate(f.x, f.y + Math.sin((t + f.phase * 1000) * 0.003) * 3);
  ctx.scale(f.facing < 0 ? 1 : -1, 1);

  const s = f.size;
  // body
  const grad = ctx.createLinearGradient(0, -s/2, 0, s/2);
  grad.addColorStop(0, f.color1); grad.addColorStop(1, f.color2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.55, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  const ts = Math.sin(t * 0.012 + f.phase) * 0.5;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, 0);
  ctx.quadraticCurveTo(s * 0.8 + ts * 4, -s * 0.25, s * 0.95, -s * 0.18);
  ctx.lineTo(s * 0.95, s * 0.18);
  ctx.quadraticCurveTo(s * 0.8 + ts * 4, s * 0.25, s * 0.5, 0);
  ctx.fillStyle = f.color2;
  ctx.fill();

  // fin
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, -s * 0.18);
  ctx.quadraticCurveTo(0, -s * 0.5, s * 0.18, -s * 0.18);
  ctx.fillStyle = f.color1; ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-s * 0.28, -s * 0.06, s * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c4f5a';
  ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.06, s * 0.03, 0, Math.PI * 2); ctx.fill();

  // a tiny "agent" crown for the agent
  if (f.type === 'agent') {
    ctx.strokeStyle = '#ff8a7a'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.4);
    ctx.lineTo(-s * 0.0, -s * 0.55);
    ctx.lineTo(s * 0.1, -s * 0.4);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1;
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // highlight
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- UPDATE ----------
function updateFish(f, dt, t) {
  // steer toward target
  const dx = f.targetX - f.x;
  const dy = f.targetY - f.y;
  const ax = dx * 0.0015;
  const ay = dy * 0.0015;
  f.vx += ax * dt;
  f.vy += ay * dt;
  f.vx *= 0.94; f.vy *= 0.94;

  const speedCap = f.type === 'ambient' ? f.speed : 4;
  const sp = Math.hypot(f.vx, f.vy);
  if (sp > speedCap) { f.vx = (f.vx/sp)*speedCap; f.vy = (f.vy/sp)*speedCap; }

  f.x += f.vx; f.y += f.vy;
  if (Math.abs(f.vx) > 0.1) f.facing = f.vx > 0 ? 1 : -1;

  // states
  if (f.type === 'user' && f.state === 'swim-in') {
    if (Math.hypot(dx, dy) < 30) { f.state = 'near'; }
  }
  if (f.type === 'ambient') {
    // gentle target drift
    if ((f.facing > 0 && f.x > W + 40) || (f.facing < 0 && f.x < -40)) {
      f.dead = true;
    }
  }
}

function updateAgent(t) {
  const a = AGENT;
  a.targetX = W * 0.5 + Math.sin(t * 0.0006) * 30;
  a.targetY = H * 0.5 + Math.cos(t * 0.0008) * 20;
  const dx = a.targetX - a.x; const dy = a.targetY - a.y;
  a.vx += dx * 0.0006; a.vy += dy * 0.0006;
  a.vx *= 0.92; a.vy *= 0.92;
  a.x += a.vx; a.y += a.vy;
  if (Math.abs(a.vx) > 0.05) a.facing = a.vx > 0 ? 1 : -1;
}

function updateBubbles(dt) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life += dt;
    if (b.y < -10 || b.life > b.max) bubbles.splice(i, 1);
  }
}

// ---------- LOOP ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(50, now - last);
  last = now;

  ctx.clearRect(0, 0, W, H);

  // backdrop light
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  drawKelp(now);

  // update + draw
  updateAgent(now);
  for (const f of fishes) updateFish(f, dt, now);
  updateBubbles(dt);

  // remove dead
  for (let i = fishes.length - 1; i >= 0; i--) if (fishes[i].dead) fishes.splice(i, 1);

  for (const f of fishes) drawFish(f, now);
  drawFish(AGENT, now);

  for (const b of bubbles) drawBubble(b);

  drawSandFloor();

  // update bubble DOM positions
  for (const f of fishes) {
    if (f.bubbleEl) positionBubble(f.bubbleEl, f.x, f.y - f.size * 0.6);
    if (f.agentBubbleEl) positionBubble(f.agentBubbleEl, AGENT.x, AGENT.y - AGENT.size * 0.65);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- BUBBLE DOM ----------
function positionBubble(el, x, y) {
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}
function makeBubble(text, cls, x, y) {
  const b = document.createElement('div');
  b.className = 'bubble ' + cls;
  b.textContent = text;
  positionBubble(b, x, y);
  $speeches.appendChild(b);
  return b;
}
function fadeOut(el, after = 6000) {
  setTimeout(() => {
    if (!el) return;
    el.classList.add('fading');
    setTimeout(() => el.remove(), 700);
  }, after);
}

// ---------- CONVERSATION ----------
let openCount = 0, resolvedCount = 0;
function refreshStats() {
  $ticketsOpen.textContent = openCount;
  $ticketsResolved.textContent = resolvedCount;
}
refreshStats();

const history = [];

async function send() {
  const text = $msg.value.trim();
  if (!text) return;
  $send.disabled = true;
  $msg.value = '';

  const fish = spawnIssueFish(text);
  openCount++; refreshStats();
  fish.bubbleEl = makeBubble(text, 'user', fish.x, fish.y - fish.size * 0.6);

  // wait for fish to arrive near agent
  await new Promise(r => {
    const i = setInterval(() => {
      if (fish.state === 'near') { clearInterval(i); r(); }
    }, 50);
  });

  // emit bubbles around agent
  for (let i = 0; i < 4; i++) {
    setTimeout(() => emitBubble(AGENT.x + (Math.random()-.5)*30, AGENT.y - 10, 1), i * 60);
  }

  fish.agentBubbleEl = makeBubble('…', 'agent thinking', AGENT.x, AGENT.y - AGENT.size * 0.65);

  try {
    let full = '';
    await window.LLM.chat({
      system: SYSTEM_PROMPT,
      user: text,
      history,
      onToken: (_, total) => {
        full = total;
        fish.agentBubbleEl.classList.remove('thinking');
        fish.agentBubbleEl.textContent = total;
      },
    });
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: full });
    while (history.length > 12) history.shift();
  } catch (err) {
    fish.agentBubbleEl.classList.remove('thinking');
    fish.agentBubbleEl.textContent = 'the current is rough: ' + err.message;
  }

  // fade out bubbles after a beat, send the fish upward to be "released"
  fadeOut(fish.bubbleEl, 4500);
  fadeOut(fish.agentBubbleEl, 8500);

  setTimeout(() => {
    fish.targetX = fish.x + (Math.random()-.5)*120;
    fish.targetY = -80;
    fish.state = 'leaving';
    // burst bubbles as it leaves
    emitBubble(fish.x, fish.y, 6);
    setTimeout(() => {
      fish.dead = true;
      openCount = Math.max(0, openCount - 1);
      resolvedCount++;
      refreshStats();
    }, 4000);
  }, 9000);

  $send.disabled = false;
  $msg.focus();
}

$send.addEventListener('click', send);
$msg.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
