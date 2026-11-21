const g = document.getElementById('g');
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
}
window.addEventListener('resize', resize);
resize();
function clearInputKeys() {
  [keysP1, keysP2].forEach(k => k.left = k.right = k.up = k.down = false);
} 
window.addEventListener('blur', clearInputKeys);
const m = document.getElementById('m');
const t = document.getElementById('t');
const b1 = document.getElementById('b1');
const b2 = document.getElementById('b2');
const hpV = document.getElementById('hp-v');
const hp2V = document.getElementById('hp2-v');
const hp1Bar = document.getElementById('hp1-bar');
const hp2Bar = document.getElementById('hp2-bar');
const hp2Container = document.getElementById('hp2-container');
const hudSgk = document.getElementById('hud-sgk');
const hudEk = document.getElementById('hud-ek');
const hudSgs = document.getElementById('hud-sgs');
const hudEs = document.getElementById('hud-es');
const hudDc = document.getElementById('hud-dc');
const goEl = document.getElementById('go');
const goSc = document.getElementById('go-sc');
const chiBanner = document.getElementById('chi-banner');
let hp = 100, hp2 = 100, isGameOver = false, isPaused = false, pauseStartTime = 0, gameStarted = false, enemiesActive = false, introOpen = false, enemyInterval = null, sgk = 0, ek = 0, dist = 0, prevScore = -1, prevDist = -1, b = 0;
const lw = 1800;
const hasSnake = c => !!(c.activeTalismans && c.activeTalismans.snake);
const SNAKE_ALPHA = 0.12;
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let isSplit = false;
let isGuest = false, remoteP2 = false, gAimX = 0, gAimY = 0;
function aimPt(chr) {
    if (isGuest) return chr === character2 ? {x: mx + camX, y: my} : {x: gAimX, y: gAimY};
    return (remoteP2 && chr === character2) ? {x: gAimX, y: gAimY} : {x: mx + camX, y: my};
}
let ems = [];
let arws = [];
let fbs = [];
let magicBeams = [];
let particles = [];
let floatTexts = [];
const keysP1 = { left: false, right: false, up: false, down: false };
const keysP2 = { left: false, right: false, up: false, down: false };
const MOVE_SCHEMES = {
    arrows: { left: 'arrowleft', right: 'arrowright', up: 'arrowup', down: 'arrowdown' },
    wasd: { left: 'a', right: 'd', up: 'w', down: 's' }
};
let controlScheme = 'arrows';
function moveKey(e) {
    const k = (e.key || '').toLowerCase();
    const s = MOVE_SCHEMES[controlScheme];
    if (k === s.left) return 'left';
    if (k === s.right) return 'right';
    if (k === s.up) return 'up';
    if (k === s.down) return 'down';
    return null;
}
const character = {
    playerNum: 1, name: "P1 (Blue)", x: 120, y: 0, vx: 0, vy: 0, speed: 7, baseSpeed: 7, acceleration: 2.5, friction: 0.80, gravity: 0.65, jumpForce: 14, isJumping: false, facing: 1, walkCycle: 0, 
    strideFrequency: 0.16, bodyTilt: 0, squish: 1, shirtColor: '#5d7da4', pantsColor: '#c09e56', activeTalisman: null, talismanTimer: null, talismanTimeLeft: 0, isDogImmortal: false, isDragonShooting: false,
    isShadowGuard: false, isRatActive: false, isPigLaserActive: false, giant: false, isFlying: false, isAstral: false, invisible: false, light: false
};
const character2 = { 
    playerNum: 2, name: "P2 (Red)", x: 220, y: 0, vx: 0, vy: 0, speed: 7, baseSpeed: 7, acceleration: 2.5, friction: 0.80, gravity: 0.65, jumpForce: 14, isJumping: false, facing: 1, walkCycle: 0, 
    strideFrequency: 0.16, bodyTilt: 0, squish: 1, shirtColor: '#dc2626', pantsColor: '#1e3a8a', activeTalisman: null, talismanTimer: null, talismanTimeLeft: 0, isDogImmortal: false, isDragonShooting: false,
    isShadowGuard: false, isRatActive: false, isPigLaserActive: false, giant: false, isFlying: false, isAstral: false, invisible: false, light: false
};
let dt = 1;
let lastFrameTime = performance.now();
let camX = 0;
character.cam = 0;  character.viewW = canvas.width;
character2.cam = 0; character2.viewW = canvas.width;
function initBg() {
    m.innerHTML = '';
    t.innerHTML = '';
    const cnt = Math.ceil(window.innerWidth / 600) + 4;
    for (let i = 0; i < cnt; i++) {
        const mItem = document.createElement('div');
        mItem.className = 'm-item';
        m.appendChild(mItem);
    }
    for (let i = 0; i < cnt; i++) {
        const tGrp = document.createElement('div');
        tGrp.className = 'tree-group';
        tGrp.innerHTML = `
            <div class="tree" style="left: 100px;"></div>
            <div class="tree" style="left: 300px;"></div>
            <div class="tree" style="left: 500px;"></div>
        `;
        t.appendChild(tGrp);
    }
}
initBg();
function buildWater() {
    const old = document.getElementById('water');
    if (old) old.remove();
    const w = document.createElement('div');
    w.id = 'water';
    const shapes = ['wl-flat', 'wl-lens', 'wl-dash', 'wl-wave'];
    const cnt = Math.ceil(window.innerWidth / 35);
    for (let i = 0; i < cnt; i++) {
        const l = document.createElement('div');
        l.className = 'wl ' + shapes[Math.floor(Math.random() * shapes.length)] + (Math.random() < 0.5 ? ' wl-left' : '');
        l.style.top = (Math.random() * 94) + '%';
        l.style.width = (30 + Math.random() * 110) + 'px';
        l.style.height = (2 + Math.random() * 2) + 'px';
        l.style.opacity = 0.35 + Math.random() * 0.55;
        l.style.animationDuration = (10 + Math.random() * 25) + 's';
        l.style.animationDelay = (-Math.random() * 35) + 's';
        w.appendChild(l);
    }
    m.parentNode.insertBefore(w, m);
}
buildWater();
const BANISH = [
    { e: '🗡️', n: 'Shendu',     m: 100 },
    { e: '🪭', n: 'Xiao Fung',  m: 200 },
    { e: '🍐', n: 'Bai Tza',    m: 400 },
    { e: '🌸', n: 'Dai Gui',    m: 800 },
    { e: '🪷', n: 'Tso Lan',    m: 1600 },
    { e: '🪈', n: 'Hsi Wu',     m: 3200 },
    { e: '🥟', n: 'Tchang Zu',  m: 6400 },
    { e: '🪘', n: 'Po Kong',    m: 12800 }
].map((o, i) => ({ ...o, x: o.m * 20 + 450, y: [150, 400, 30, 30, 630, 550, 550, 300][i], got: false }));
function buildBanishUI() {
    const grid = document.getElementById('bo-grid');
    grid.innerHTML = '';
    BANISH.forEach((o, i) => {
        const d = document.createElement('div');
        d.className = 'bo-cell';
        d.title = `${o.n} - ${o.m} m`;
        d.innerHTML = `<span>${o.e}</span><span id="bo-s${i}">🟡</span>`;
        grid.appendChild(d);
    });
}
function updateBanishUI() {
    BANISH.forEach((o, i) => {
        const s = document.getElementById('bo-s' + i);
        if (s) s.textContent = o.got ? '🟢' : '🟡';
    });
}
buildBanishUI();
const maskLayer = document.getElementById('mask-layer');
const MASK_Y = 30, MASK_SCALE = 0.2, MASK_POINTS = 100;
const MASKS = [1000, 6400, 12000, 24000, 45000, 90000, 110000, 180000, 220000, 330000]
    .map((x, i) => ({ id: i + 1, x, y: MASK_Y, got: false, el: null }));
MASKS.forEach(o => {
    const mk = document.getElementById('m' + o.id);
    if (!mk) return;
    const slot = document.createElement('div');
    slot.className = 'mask-slot';
    slot.style.left = o.x + 'px';
    slot.style.bottom = o.y + 'px';
    slot.style.transform = `translate(-50%, 50%) scale(${MASK_SCALE})`;
    slot.appendChild(mk);
    maskLayer.appendChild(slot);
    o.el = slot;
});
const mkCount = () => MASKS.filter(o => o.got).length;
function buildMaskUI() {
    const grid = document.getElementById('mk-grid');
    grid.innerHTML = '';
    MASKS.forEach((o, i) => {
        const d = document.createElement('div');
        d.className = 'bo-cell mk-cell';
        d.title = `Mask ${o.id} - ${Math.round(o.x / 20)} m`;
        d.innerHTML = `<span>🎭</span><span id="mk-s${i}">🟡</span>`;
        grid.appendChild(d);
    });
}
function updateMaskUI() {
    MASKS.forEach((o, i) => {
        const s = document.getElementById('mk-s' + i);
        if (s) s.textContent = o.got ? '🟢' : '🟡';
        if (o.el) o.el.style.display = o.got ? 'none' : '';
    });
}
buildMaskUI();
function checkMaskCollect() {
    const chars = aliveChars();
    for (const o of MASKS) {
        if (o.got) continue;
        const box = { cx: o.x, cy: canvas.height - o.y, hw: 18, hh: 20 };
        for (const c of chars) {
            if (boxesOverlap(box, playerBox(c))) {
                o.got = true;
                updateMaskUI();
                updateScoreUI(true);
                addFloatText(`+${MASK_POINTS}`, o.x, box.cy - 55, '#ffd700', 18);
                addSparks(o.x, box.cy, '#ffd700', 20);
                addFloatText(`🎭 Mask ${o.id}`, o.x, box.cy - 30, '#2ed573', 20);
                showChiBanner(`🎭 Mask ${o.id} collected!`);
                break;
            }
        }
    }
}
const WATER = (() => {
    let s = 20240805;
    const rnd = () => {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const wet = [BANISH[2], BANISH[4]];
    const dry = [BANISH[0], BANISH[3], BANISH[7], ...MASKS];
    const list = [];
    let x = 1500;
    const end = BANISH[7].x + 2000;
    while (x < end) {
        x += (40 + rnd() * 80) * 20;
        const w = (20 + rnd() * 10) * 20;
        if (wet.concat(dry).some(o => x + w > o.x - 900 && x < o.x + 900)) continue;
        list.push({ x1: x, x2: x + w });
        x += w;
    }
    wet.forEach(o => list.push({ x1: o.x - 300, x2: o.x + 300 }));
    list.sort((a, b) => a.x1 - b.x1);
    return list;
})();
const WATER_DPS = 3;
const grdEl = document.getElementById('grd');
const GROUND = (() => {
    let s = 777;
    const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const forced = WATER.map(w => ({ x1: w.x1 - 200, x2: w.x2 + 200, t: 'G', w: true }));
    forced.push({ x1: BANISH[3].x - 500, x2: BANISH[3].x + 500, t: 'BN' });
    forced.sort((a, b) => a.x1 - b.x1);
    const LEN = { G: [600, 2400], BN: [400, 900], BZ: [300, 700] };
    const out = [];
    let x = 0, prev = 'G';
    const fill = to => {
        while (x < to) {
            const t = prev === 'G' && rnd() < 0.3 ? (rnd() < 0.6 ? 'BN' : 'BZ') : 'G';
            const [a, b] = LEN[t];
            let x2 = Math.min(to, x + a + rnd() * (b - a));
            if (to - x2 < LEN.G[0]) x2 = to;
            const tt = x2 - x < a ? 'G' : t;
            out.push({ x1: x, x2, t: tt });
            x = x2; prev = tt;
        }
    };
    for (const z of forced) {
        if (z.x2 <= x) continue;
        fill(Math.max(x, z.x1));
        out.push({ x1: x, x2: z.x2, t: z.t, w: z.w });
        x = z.x2; prev = z.t;
    }
    fill(400000);
    return out;
})();
const GCOL = { G: ['#466929', '#2e9e4f'], BN: ['#6b4423', '#8b5a2b'], BZ: ['#a67c4a', '#c9a066'] };
let gStart = 0, lastGX = null;
function groundGradient() {
    if (lastGX === camX) return null;
    lastGX = camX;
    const lo = camX - 2500, hi = camX + canvas.width + 2500, st = [];
    while (gStart > 0 && GROUND[gStart].x1 > lo) gStart--;
    while (gStart < GROUND.length - 1 && GROUND[gStart].x2 < lo) gStart++;
    for (let i = gStart; i < GROUND.length; i++) {
        const z = GROUND[i];
        if (z.x1 > hi) break;
        const [base, hl] = GCOL[z.t], L = z.x2 - z.x1;
        const a = z.w ? 0 : (z.t === 'G' ? 0.15 : 0.25);
        st.push(`${base} ${(z.x1 + L * a - camX).toFixed(1)}px`,
                `${hl} ${(z.x1 + L * 0.5 - camX).toFixed(1)}px`,
                `${base} ${(z.x1 + L * (1 - a) - camX).toFixed(1)}px`);
    }
    return `linear-gradient(90deg, ${st.join(',')})`;
}
function inWater(chr) {
    if (chr.y > 2) return false;
    for (const w of WATER) {
        if (chr.x > w.x1 && chr.x < w.x2) return true;
        if (w.x1 > chr.x) break;
    }
    return false;
}
function waterDamage(chr) {
    if (chr.isDogImmortal) return;
    const amt = WATER_DPS * dt * 16.667 / 1000;
    if (chr === character && hp > 0) {
        hp = Math.max(0, hp - amt);
        hpV.textContent = Math.round(hp);
        updateHpBar(hp1Bar, hp);
        if (hp <= 0) character.invisible = true;
    } else if (chr === character2 && hp2 > 0) {
        hp2 = Math.max(0, hp2 - amt);
        hp2V.textContent = Math.round(hp2);
        updateHpBar(hp2Bar, hp2);
        if (hp2 <= 0) character2.invisible = true;
    }
    if (Math.random() < 0.08 * dt) addSparks(chr.x + (Math.random() - 0.5) * 30, canvas.height - 10, '#7dd3fc', 2);
    if (isSplit ? (hp <= 0 && hp2 <= 0) : hp <= 0) triggerGameOver();
}
function drawWater(alpha) {
    const now = performance.now();
    const h = 3, top = canvas.height - h;
    for (const w of WATER) {
        if (w.x2 < camX - 50) continue;
        if (w.x1 > camX + canvas.width + 50) break;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grad = ctx.createLinearGradient(0, top, 0, canvas.height);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad;
        ctx.fillRect(w.x1, top, w.x2 - w.x1, h);
        ctx.strokeStyle = '#e0f7ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const a = Math.max(w.x1, camX - 10), z = Math.min(w.x2, camX + canvas.width + 10);
        for (let xx = a; xx <= z; xx += 12) {
            const yy = top + Math.sin(xx / 18 + now / 250) * 2;
            if (xx === a) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        ctx.restore();
    }
}
function checkBanishCollect() {
    const chars = aliveChars();
    for (const o of BANISH) {
        if (o.got) continue;
        const box = { cx: o.x, cy: canvas.height - o.y, hw: 18, hh: 20 };
        for (const c of chars) {
            if (boxesOverlap(box, playerBox(c))) {
                o.got = true;
                updateBanishUI();
                updateScoreUI(true);
                addFloatText(`+${BO_POINTS}`, o.x, box.cy - 55, '#ffd700', 18);
                addSparks(o.x, box.cy, '#ffd700', 20);
                addFloatText(`${o.e} ${o.n}`, o.x, box.cy - 30, '#2ed573', 20);
                showChiBanner(`${o.e} ${o.n}'s Banishment Object collected!`);
                break;
            }
        }
    }
}
function drawBanishObjects() {
    const now = performance.now();
    ctx.save();
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd700';
    for (const o of BANISH) {
        if (o.got || o.x < camX - 60 || o.x > camX + canvas.width + 60) continue;
        ctx.fillText(o.e, o.x, canvas.height - o.y + Math.sin(now / 300 + o.m) * 4);
    }
    ctx.restore();
}
const BO_POINTS = 100;
const boCount = () => BANISH.filter(o => o.got).length;
const calcScore = () => sgk * 10 + ek * 15 + Math.floor(dist) + boCount() * BO_POINTS + mkCount() * MASK_POINTS;
function updateScoreUI(force = false) {
    const currentScore = calcScore();
    const currentDist = Math.floor(dist);
    const hudBo = document.getElementById('hud-bo');
    const hudBos = document.getElementById('hud-bos');
    const hudMk = document.getElementById('hud-mk');
    const hudMks = document.getElementById('hud-mks');
    if (!force && currentScore === prevScore && currentDist === prevDist) return;
    prevScore = currentScore;
    prevDist = currentDist;
    if (hudSgk) hudSgk.textContent = sgk;
    if (hudEk) hudEk.textContent = ek;
    if (hudSgs) hudSgs.textContent = sgk * 10;
    if (hudEs) hudEs.textContent = ek * 15;
    if (hudDc) hudDc.textContent = currentDist;
    if (hudBo) hudBo.textContent = boCount();
    if (hudBos) hudBos.textContent = boCount() * BO_POINTS;
    if (hudMk) hudMk.textContent = mkCount();
    if (hudMks) hudMks.textContent = mkCount() * MASK_POINTS;
}
function registerKill(e, ey, sparkColor, sparkCount = 12) {
    addSparks(e.x, ey, sparkColor, sparkCount);
    if (e.fly) {
        ek++;
        addFloatText("+15", e.x, ey - 15, '#ffd700', 18);
    } else {
        sgk++;
        addFloatText("+10", e.x, ey - 15, '#ffd700', 18);
    }
    updateScoreUI(true);
}
function updateHpBar(barEl, val) {
    if (!barEl) return;
    const clamped = Math.max(0, Math.min(100, val));
    barEl.style.width = clamped + '%';
    if (clamped > 50) {
        barEl.style.backgroundColor = '#2ed573';
    } else if (clamped > 20) {
        barEl.style.backgroundColor = '#e1b12c';
    } else {
        barEl.style.backgroundColor = '#e84118';
    }
}
function showChiBanner(msg) {
    chiBanner.textContent = msg;
    chiBanner.style.opacity = '1';
    setTimeout(() => {
        chiBanner.style.opacity = '0';
    }, 1400);
}
function addFloatText(text, x, y, color = '#2ed573', size = 18) {
    floatTexts.push({ text: text, x: x, y: y, vy: -1.8, opacity: 1.0, color: color, size: size });
}
function addSparks(x, y, color = '#ffcc00', count = 8) {
    for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 1.5;
        particles.push({ x: x, y: y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, radius: Math.random() * 3 + 2, color: color, alpha: 1.0, decay: Math.random() * 0.04 + 0.03 });
    }
}
function addHealingParticles(targetChr) {
    for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 40;
        particles.push({ x: targetChr.x + offsetX, y: canvas.height - targetChr.y - 10, vx: (Math.random() - 0.5) * 1.5, vy: -(Math.random() * 2.5 + 2.0), radius: Math.random() * 3.5 + 2, color: '#2ed573',
            alpha: 1.0, decay: 0.03, isSparkle: true });
    }
}
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-overlay').style.display = 'none';
    startGame();
});
let gt = 0;
let nextSpawnAt = 0;
function resetGameState() {
  hp = 100; hp2 = 100; isGameOver = false; isPaused = false; pauseStartTime = 0; sgk = 0; ek = 0; dist = 0; prevScore = -1; prevDist = -1; ems = []; arws = []; fbs = []; magicBeams = []; particles = [];
  floatTexts = []; [keysP1, keysP2].forEach(k => k.left = k.right = k.up = k.down = false);
}
function startGame() {
    resetGameState();
    gameStarted = true;
    enemiesActive = false;
    introOpen = true;
    document.getElementById('intro-dialog').style.display = 'flex';
    const startBtn = document.getElementById('intro-start-btn');
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(document.getElementById('intro-speech-text').textContent);
    const enableNext = () => {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    };
    utter.onend = enableNext;
    utter.onerror = enableNext;
    window.speechSynthesis.speak(utter);
}
const HTP_SPEECH = "Aiyaa! Jackie! Captain black have informed me for your safety! Take the talismans, my pufferfish and lizard for your protection. One more thing! Bring all of them back safely and correctly! Don't lose anything! Here is how to play. " +
  "For movement, choose arrow keys or W A S D in the Controls box on the left. Left and right move you. Up or W jumps, or flies up with the Rooster talisman. Down or S flies down. " +
  "One more thing! Defeat Shadow Guards for ten points and Bats for fifteen points. Press Q for the Pufferfish Chi Laser, or E for the Lizard Magic Laser. Both fire straight in the direction you face. With the Dragon talisman, click to shoot fireballs at your mouse. With the Pig talisman, an eye laser follows your mouse and destroys enemies it touches. " +
  "One more thing! To use the talismans, press the number keys, the minus key or click the buttons at the bottom. Press again to turn one off. Several can be active at once and each has a timer. One more thing! Dragon and Ox, alone stay on until you turn them off. " +
  "Dog makes you invulnerable. Dragon shoots fireballs. Horse heals twenty health. Monkey transforms you into a ninja. Rat summons Super Moose. Rabbit gives super speed. Pig fires an eye laser. Ox makes you a giant and halves the damage you take. Rooster gives flight. Sheep sends out an astral spirit. Snake makes you invisible. Lizard and Pufferfish fire a one shot magic laser with Chi magic. " +
  "One more thing! Find and collect the banishment objects of the demons Shendu, Xiao Fung, Bai Tza, Dai Gui, Tso Lan, Hsi Wu, Tchang Zu, and Po Kong. For Shendu, it's the sword, Xiao Fung, it's the fan, Bai Tza, its the gourd fruit. For Dai Gui, it's the flower and for Tsa Lan, its the lotus flower. For Hsi Wu, it's the flute. For Tchang Zu, it's the castanets. Atlast, for the mountain demon Po Kong, its the drums. Check the board under your health bar. Yellow means not collected yet, and green means collected. Once collected, an object can never be lost to Shadow Guards or bats. " +
  "One more thing! Don't forget to collect the Oni Masks of all the 10 ancient war heads. Dont forget! It's not 9! It's 10! Including Tarakudo's shadow mask. " +
  "One more thing! Press the equals key for the Tiger talisman to open an online session and share the Session I D. Or paste a friend's Session I D in the Online Co-Op box to join. Press equals again to return to single player. " +
  "One more thing! Beware of the water gaps in the ground. Standing in water drains your health, so jump or fly over them. One more thing! Press P or Escape to pause the game. " +
  "One more thing! Dodge the silver blades and avoid touching enemies. The game ends when your health reaches zero. The longer you survive, the faster enemies spawn. All the best!";

function showInstructions() {
    window.speechSynthesis.cancel();
    document.getElementById('intro-dialog').style.display = 'none';
    document.getElementById('instructions-dialog').style.display = 'flex';

    const startBtn = document.getElementById('instructions-start-btn');
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
    const enableStart = () => {
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    };
    const utter = new SpeechSynthesisUtterance(HTP_SPEECH);
    utter.onend = enableStart;
    utter.onerror = enableStart;
    window.speechSynthesis.speak(utter);
}
document.getElementById('intro-start-btn').addEventListener('click', showInstructions);
document.getElementById('intro-skip-btn').addEventListener('click', showInstructions);
function beginPlay() {
    window.speechSynthesis.cancel();
    document.getElementById('instructions-dialog').style.display = 'none';
    pauseBtn.style.display = 'block';
    introOpen = false;
    enemiesActive = true;
    gt = Date.now();
    nextSpawnAt = Date.now() + 1500;
}
document.getElementById('instructions-start-btn').addEventListener('click', beginPlay);
document.getElementById('instructions-skip-btn').addEventListener('click', beginPlay);
const getSpawnDelay = () => Math.max(250, 3000 * 0.5 ** ((Date.now() - gt) / 60000));
function spawnTick() {
    if (!enemiesActive) return;
    const now = Date.now();
    if (now < nextSpawnAt) return;
    nextSpawnAt = now + getSpawnDelay();
    aliveChars().forEach(spawnE);
}
function triggerGameOver() {
    isGameOver = true;
    if (enemyInterval) {
        clearTimeout(enemyInterval);
        enemyInterval = null;
    }
    [keysP1, keysP2].forEach(k => k.left = k.right = k.up = k.down = false);
    document.getElementById('go-sgk').textContent = sgk;
    document.getElementById('go-ek').textContent = ek;
    document.getElementById('go-sgs').textContent = sgk * 10;
    document.getElementById('go-es').textContent = ek * 15;
    document.getElementById('go-dc').textContent = Math.floor(dist);
    document.getElementById('go-bos').textContent = boCount() * BO_POINTS;
    document.getElementById('go-mk').textContent = mkCount();
    document.getElementById('go-mks').textContent = mkCount() * MASK_POINTS;
    goSc.textContent = calcScore();
    pauseBtn.style.display = 'none';
    pauseOverlay.style.display = 'none';
    const boList = document.getElementById('go-bo-list');
    boList.innerHTML = '';
    let boGot = 0;
    BANISH.forEach(o => {
        const s = document.createElement('span');
        s.textContent = o.e;
        s.title = o.n;
        if (o.got) {
            boGot++;
        } else {
            s.style.color = 'transparent';
            s.style.textShadow = '0 0 0 #000000';
        }
        boList.appendChild(s);
    });
    document.getElementById('go-bo').textContent = boGot;
    goEl.style.display = 'flex';
}
function dmg(amount, targetP) {
    if (!gameStarted || isGameOver || isPaused) return;
    if (targetP.isDogImmortal) return;
    const finalDmg = targetP.giant ? Math.ceil(amount * 0.5) : amount;
    addSparks(targetP.x, canvas.height - targetP.y - 35, '#ff4757', 6);
    addFloatText(`-${finalDmg}`, targetP.x, canvas.height - targetP.y - 50, '#ff4757', 16);
    if (targetP === character && hp > 0) {
        hp = Math.max(0, hp - finalDmg);
        hpV.textContent = Math.round(hp);
        updateHpBar(hp1Bar, hp);
        if (hp <= 0) character.invisible = true;
    } else if (targetP === character2 && hp2 > 0) {
        hp2 = Math.max(0, hp2 - finalDmg);
        hp2V.textContent = Math.round(hp2);
        updateHpBar(hp2Bar, hp2);
        if (hp2 <= 0) character2.invisible = true;
    }
    if (isSplit) {
        if (hp <= 0 && hp2 <= 0) {
            triggerGameOver();
        }
    } else {
        if (hp <= 0) {
            triggerGameOver();
        }
    }
}
function healPlayer(chr, amount) {
    if (chr.playerNum === 1) {
        if (hp < 100) {
            hp = Math.min(100, hp + amount);
            hpV.textContent = Math.round(hp);
            updateHpBar(hp1Bar, hp);
        }
    } else {
        if (hp2 < 100) {
            hp2 = Math.min(100, hp2 + amount);
            hp2V.textContent = Math.round(hp2);
            updateHpBar(hp2Bar, hp2);
        }
    }
    addHealingParticles(chr);
    addFloatText(`+${amount} HP`, chr.x, canvas.height - chr.y - 65, '#2ed573', 20);
    chr.light = true;
    setTimeout(() => { chr.light = false; }, 400);
}
const GUARD_SCALE = 0.34, GUARD_W = 20, GUARD_H = 32;
function enemyBox(e) {
    const h = e.height || GUARD_H, w = e.width || GUARD_W;
    return {
        cx: e.x,
        cy: e.fly ? canvas.height - (e.y + 35) : canvas.height - e.y - h / 2,
        hw: w / 2,
        hh: h / 2
    };
}
const enemyCY = e => enemyBox(e).cy;
function playerBox(chr) {
    const g = chr.giant ? 1.5 : 1;
    return { cx: chr.x, cy: canvas.height - chr.y - 24 * g, hw: 12 * g, hh: 24 * g };
}
function boxesOverlap(a, b) {
    return Math.abs(a.cx - b.cx) < a.hw + b.hw && Math.abs(a.cy - b.cy) < a.hh + b.hh;
}
function spawnE(owner) {
    if (!gameStarted || isGameOver || isPaused) return;
    const isFly = Math.random() > 0.45;
    const startX = isFly
        ? owner.cam + owner.viewW + 80 + Math.random() * 160
        : owner.cam + owner.viewW * (0.55 + Math.random() * 0.35);
    const startY = isFly ? Math.random() * 180 + 130 : 0;
    const baseSpeed = Math.random() * 1.2 + 2.4;
    ems.push({
        x: startX,
        y: startY,
        fly: isFly,
        baseSpd: baseSpeed,
        spd: baseSpeed,
        lt: Date.now(),
        hitCooldown: 0,
        hits: 0,
        width: isFly ? 40 : GUARD_W,
        height: isFly ? 34 : GUARD_H,
        facing: owner.x > startX ? 1 : -1,
        attacking: false,
        rise: isFly ? 1 : 0,
        anim: Math.random() * 10
    });
    if (!isFly) addSparks(startX, canvas.height - 3, '#4a3b6b', 12);
}
function getTalismanDisplayName(name) {
    switch (name) {
        case 'dog': return '🐕 Dog (Invulnerable)';
        case 'dragon': return '🐉 Dragon (Fireblast)';
        case 'horse': return '🐴 Horse (Noble Healing)';
        case 'monkey': return '🐒 Monkey (Ninja Disguise)';
        case 'rat': return '🐀 Rat (Super Moose)';
        case 'rabbit': return '🐇 Rabbit (Super Speed)';
        case 'pig': return '🐷 Pig (Thermal Eye Laser)';
        case 'ox': return '🐂 Ox (Giant Strength)';
        case 'rooster': return '🐓 Rooster (Flight)';
        case 'sheep': return '🐑 Sheep (Astral Spirit)';
        case 'snake': return '🐍 Snake (Invisibility)';
        case 'tiger': return '🐅 Tiger (2-Player Co-Op)';
        case 'pufferfish': return '🐡 Pufferfish Chi Laser';
        case 'lizard': return '🦎 Counter Magic Laser';
        default: return 'Active';
    }
}
function updatePlayerTalismanUI(chr) {
    const pN = chr.playerNum;
    const bI = (pN === 1) !== isGuest ? 'b1' : 'b2';
    const bE = document.getElementById(pN === 1 ? 'p1-power-badge' : 'p2-power-badge');
    const tE = document.getElementById(pN === 1 ? 'p1-power-text' : 'p2-power-text');
    document.querySelectorAll(`#${bI} .o, #${bI} .pf, #${bI} .sl`).forEach(e => {
        const t = e.getAttribute('data-t');
        if (chr.activeTalismans && chr.activeTalismans[t]) {
            e.classList.add('active-talisman');
        } else {
            e.classList.remove('active-talisman');
        }
    });
    const activeList = Object.keys(chr.activeTalismans || {});
    if (activeList.length > 0) {
        if (bE && tE) {
            bE.style.display = 'flex';
            tE.textContent = activeList.map(t => getTalismanDisplayName(t).split(' ')[0]).join(' + ');
        }
    } else {
        if (bE) bE.style.display = 'none';
    }
}
function clearTalismanForPlayer(chr) {
    if (chr.activeTalismans) {
        Object.keys(chr.activeTalismans).forEach(t => {
            if (typeof chr.activeTalismans[t] !== 'boolean') clearInterval(chr.activeTalismans[t]);
        });
    }
    chr.activeTalismans = {};
    chr.activeTalisman = null;
    chr.talismanTimeLeft = 0;
    chr.isDogImmortal = false;
    chr.isDragonShooting = false;
    chr.isShadowGuard = false;
    chr.isRatActive = false;
    chr.moose = null;
    chr.isPigLaserActive = false;
    chr.giant = false;
    chr.isFlying = false;
    chr.isAstral = false;
    chr.invisible = false;
    chr.speed = chr.baseSpeed;
    chr.light = false;
    updatePlayerTalismanUI(chr);
}
function startPlayerTimer(chr, tName, sec, onExpire) {
    if (!chr.activeTalismans) chr.activeTalismans = {};
    if (!chr.talismanEnds) chr.talismanEnds = {};
    if (!chr.talismanCbs) chr.talismanCbs = {};
    chr.talismanCbs[tName] = onExpire;
    if (chr.activeTalismans[tName]) clearInterval(chr.activeTalismans[tName]);
    chr.talismanEnds[tName] = Date.now() + sec * 1000;
    updatePlayerTalismanUI(chr);
    chr.activeTalismans[tName] = setTimeout(() => {
        delete chr.activeTalismans[tName];
        delete chr.talismanEnds[tName];
        if (onExpire) onExpire();
        updatePlayerTalismanUI(chr);
    }, sec * 1000);
}
function updateTalismanTimers(chr) {
    const bI = (chr.playerNum === 1) !== isGuest ? 'b1' : 'b2';
    const tE = document.getElementById(chr.playerNum === 1 ? 'p1-power-text' : 'p2-power-text');
    const now = Date.now();
    const ends = chr.talismanEnds || {};
    const active = chr.activeTalismans || {};
    document.querySelectorAll(`#${bI} .timer-tag`).forEach(tag => {
        const t = tag.parentElement.getAttribute('data-t');
        if (active[t] && ends[t]) {
            tag.textContent = Math.max(0, Math.ceil((ends[t] - now) / 1000)) + 's';
            tag.style.display = 'block';
        } else {
            tag.style.display = 'none';
        }
    });
    const list = Object.keys(active);
    if (tE && list.length > 0) {
        tE.textContent = list.map(t => {
            const icon = getTalismanDisplayName(t).split(' ')[0];
            return ends[t] ? icon + ' ' + Math.max(0, Math.ceil((ends[t] - now) / 1000)) + 's' : icon;
        }).join(' + ');
    }
}
function fireStraightLaser(caster, incantation, beamColor = '#00ff66') {
    if (isPaused) return;
    const alive = caster.playerNum === 1 ? hp > 0 : hp2 > 0;
    if (!alive || isGameOver) return;
    const now = Date.now();
    if (now - (caster.lastLaserTime || 0) < 400) return;
    caster.lastLaserTime = now;
    showChiBanner(incantation);
    addFloatText(incantation, caster.x, canvas.height - caster.y - 75, beamColor, 18);
    const startX = caster.x;
    const startY = canvas.height - caster.y - 35;
    const facing = caster.facing >= 0 ? 1 : -1;
    const endX = facing > 0 ? caster.cam + caster.viewW + 120 : caster.cam - 120;
    const endY = startY;
    magicBeams.push({
        startX, startY, endX, endY,
        color: beamColor,
        glowColor: '#00ff66',
        duration: 20,
        maxDuration: 20
    });
    addSparks(startX, startY, beamColor, 12);
    for (let j = ems.length - 1; j >= 0; j--) {
        const e = ems[j];
        const ey = enemyCY(e)
        const inFront = facing > 0 ? (e.x >= startX - 25 && e.x <= endX) : (e.x <= startX + 25 && e.x >= endX);
        if (inFront && Math.abs(ey - startY) < (e.height * 0.5 + 24)) {
            registerKill(e, ey, beamColor, 15);
            ems.splice(j, 1);
        }
    }
    for (let j = arws.length - 1; j >= 0; j--) {
        const a = arws[j];
        const inFront = facing > 0 ? (a.x >= startX - 25 && a.x <= endX) : (a.x <= startX + 25 && a.x >= endX);
        if (inFront && Math.abs(a.y - startY) < 25) {
            addSparks(a.x, a.y, beamColor, 6);
            arws.splice(j, 1);
        }
    }
}
function switchTalismanForPlayer(chr, name) {
    if (!gameStarted || isGameOver || isPaused) return;
    const pNum = chr.playerNum;
    if (pNum === 1 && hp <= 0) return;
    if (pNum === 2 && hp2 <= 0) return;
    if (name === 'horse') {
        healPlayer(chr, 20);
        return;
    }
    if (name === 'pufferfish') {
        const s = new SpeechSynthesisUtterance("Yoo Mo Guaai Guaai Fai Dee Zaa!");
        window.speechSynthesis.speak(s);
        fireStraightLaser(chr, "Yoo Mo Guaai Guaai Fai Dee Zaa!", '#00ff66');
        return;
    }
    if (name === 'lizard') {
        const s = new SpeechSynthesisUtterance("Magic must defeat magic!");
        window.speechSynthesis.speak(s);
        fireStraightLaser(chr, "Magic must defeat magic!", '#00ff88');
        return;
    }
    if (name === 'tiger') {
        toggleTigerSplit();
        return;
    }
if (!chr.activeTalismans) chr.activeTalismans = {};
    if (chr.activeTalismans[name]) {
        if (typeof chr.activeTalismans[name] !== 'boolean') clearInterval(chr.activeTalismans[name]);
        delete chr.activeTalismans[name];
        if (name === 'dog') chr.isDogImmortal = false;
        if (name === 'dragon') chr.isDragonShooting = false;
        if (name === 'monkey') chr.isShadowGuard = false;
        if (name === 'rat') chr.isRatActive = false;
        if (name === 'rabbit') chr.speed = chr.baseSpeed;
        if (name === 'pig') chr.isPigLaserActive = false;
        if (name === 'ox') chr.giant = false;
        if (name === 'rooster') chr.isFlying = false;
        if (name === 'sheep') chr.isAstral = false;
        if (name === 'snake') chr.invisible = false;
        addFloatText("Talisman Off", chr.x, canvas.height - chr.y - 60, '#ddd', 16);
        updatePlayerTalismanUI(chr);
        return;
    }
    addSparks(chr.x, canvas.height - chr.y - 35, '#ffd700', 12);
    addFloatText(`${getTalismanDisplayName(name).split(' ')[0]} Active!`, chr.x, canvas.height - chr.y - 65, '#ffd700', 18);
    switch (name) {
        case 'dog':
            chr.isDogImmortal = true;
            chr.activeTalismans['dog'] = true;
            startPlayerTimer(chr, 'dog', 10, () => { chr.isDogImmortal = false; });
            break;
        case 'dragon':
            chr.isDragonShooting = true;
            chr.activeTalismans['dragon'] = true;
            updatePlayerTalismanUI(chr);
            break;
        case 'monkey':
            chr.isShadowGuard = true;
            chr.activeTalismans['monkey'] = true;
            startPlayerTimer(chr, 'monkey', 10, () => { chr.isShadowGuard = false; });
            break;
        case 'rat':
            chr.isRatActive = true;
            chr.activeTalismans['rat'] = true;
            startPlayerTimer(chr, 'rat', 10, () => { chr.isRatActive = false; });
            if (!(remoteP2 && chr === character2)) {
                const s = new SpeechSynthesisUtterance("It's action time!");
                window.speechSynthesis.speak(s);
            }
            break;
        case 'rabbit':
            chr.speed = 20;
            chr.activeTalismans['rabbit'] = true;
            startPlayerTimer(chr, 'rabbit', 10, () => { chr.speed = chr.baseSpeed; });
            break;
        case 'pig':
            chr.isPigLaserActive = true;
            chr.activeTalismans['pig'] = true;
            startPlayerTimer(chr, 'pig', 10, () => { chr.isPigLaserActive = false; });
            break;
        case 'ox':
            chr.giant = true;
            chr.activeTalismans['ox'] = true;
            updatePlayerTalismanUI(chr);
            break;
        case 'rooster':
            chr.isFlying = true;
            chr.activeTalismans['rooster'] = true;
            startPlayerTimer(chr, 'rooster', 10, () => {
                chr.isFlying = false;
            });
            break;
        case 'sheep':
            chr.isAstral = true;
            chr.activeTalismans['sheep'] = true;
            startPlayerTimer(chr, 'sheep', 10, () => { chr.isAstral = false; });
            break;
        case 'snake':
            chr.invisible = true;
            chr.activeTalismans['snake'] = true;
            startPlayerTimer(chr, 'snake', 10, () => { chr.invisible = false; });
            break;
    }
}
function toggleTigerSplit() {
    if (!isSplit) {
        isSplit = true;
        hp2 = 0;
        hp2V.textContent = '0';
        updateHpBar(hp2Bar, 0);
        hp2Container.style.display = 'none';
        b2.style.display = 'none';
        character2.invisible = false;
        showChiBanner("Multiplayer ON. Share the Session ID from the Online Co-Op panel.");
        addSparks(character.x, canvas.height - character.y - 35, '#dc2626', 15);
    } else {
        isSplit = false;
        hp2 = 0;
        hp2V.textContent = '0';
        updateHpBar(hp2Bar, 0);
        hp2Container.style.display = 'none';
        b2.style.display = 'none';
        clearTalismanForPlayer(character2);
        addSparks(character.x, canvas.height - character.y - 35, '#2563eb', 15);
        addFloatText("Single Player Mode", character.x, canvas.height - character.y - 65, '#2563eb', 18);
    }
}
let hipCount = 0;
let hipTimer = null;
function sayHip() {
    hipCount++;
    clearTimeout(hipTimer);
    hipTimer = setTimeout(() => { hipCount = 0; }, 2000);
    let text = "hip!";
    if (hipCount >= 4) {
        text = "hip hip! hip hip!";
        hipCount = 0;
    }
    window.speechSynthesis.cancel();
    const s = new SpeechSynthesisUtterance(text);
    s.rate = 1.4;
    s.pitch = 1.6;
    s.volume = 1;
    window.speechSynthesis.speak(s);
}
window.addEventListener('keydown', (e) => {
    if (!gameStarted || isGameOver || introOpen) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (!e.repeat) setPaused(!isPaused);
        return;
    }
    if (isPaused) return;
    const dir = moveKey(e);
    if (dir) {
        keysP1[dir] = true;
        if (dir === 'up' && hp > 0 && !character.isFlying && !character.isJumping) {
            character.vy = character.jumpForce;
            character.isJumping = true;
            if (!e.repeat) sayHip();
        }
        e.preventDefault();
    }
    if (e.key === 'q' || e.key === 'Q') {
        fireStraightLaser(character, "Yu-Mo-Gui-Gwai-Fai-Di-Zao!", '#00ff66');
    }
    if (e.key === 'e' || e.key === 'E') {
        fireStraightLaser(character, "Magic must defeat magic!", '#00ff88');
    }
    const hotkeyMapP1 = {
        '1': 'dog', '2': 'dragon', '3': 'horse', '4': 'monkey', '5': 'rat', '6': 'rabbit', '7': 'pig', '8': 'ox', '9': 'rooster', '0': 'sheep', '-': 'snake', '=': 'tiger'
    };
    if (hotkeyMapP1[e.key]) {
        switchTalismanForPlayer(character, hotkeyMapP1[e.key]);
    }
});
window.addEventListener('keyup', (e) => {
    const dir = moveKey(e);
    if (dir) keysP1[dir] = false;
});
window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
});
window.addEventListener('click', (e) => {
    if (!gameStarted || isGameOver || introOpen || isPaused) return;
    if (e.target.closest('#pause-btn') || e.target.closest('#pause-overlay') || e.target.closest('.ui-c') || e.target.closest('#start-overlay') || e.target.closest('#go') || e.target.closest('#intro-dialog') || e.target.closest('#instructions-dialog') || e.target.closest('#mp-panel') || e.target.closest('#mp-lost')) return;
    if (character.isDragonShooting && hp > 0) {
        shootDragonFireball(character);
    }
    if (isSplit && character2.isDragonShooting && hp2 > 0 && !remoteP2) {
        shootDragonFireball(character2);
    }
});
function shootDragonFireball(chr) {
    if (isPaused) return;
    const mx = aimPt(chr).x, my = aimPt(chr).y;
    const sx = chr.x;
    const sy = canvas.height - chr.y - 35;
    const dx = mx - sx;
    const dy = my - sy;
    const len = Math.hypot(dx, dy) || 1;
    const spd = 14;
    fbs.push({
        x: sx,
        y: sy,
        vx: (dx / len) * spd,
        vy: (dy / len) * spd,
        radius: 10
    });
    addSparks(sx, sy, '#ff9f43', 6);
}
function setupButtonHandlers() {
    document.querySelectorAll('.o, .pf, .sl').forEach(btn => {
        const timerTag = document.createElement('span');
        timerTag.className = 'timer-tag';
        btn.appendChild(timerTag);
        btn.addEventListener('click', () => {
            const talismanType = btn.getAttribute('data-t');
            const playerNum = btn.getAttribute('data-p');
            const targetChr = (playerNum === '2' && isSplit) ? character2 : character;
            if (talismanType) {
                switchTalismanForPlayer(targetChr, talismanType);
            }
        });
    });
}
setupButtonHandlers();
function updatePlayer(chr, keysState, playerNum) {
    if (isGameOver || !gameStarted) return;
    if (playerNum === 1 && hp <= 0) return;
    if (playerNum === 2 && hp2 <= 0) return;
        if (keysState.left) {
        chr.vx -= chr.acceleration * dt;
        if (chr.vx < -chr.speed) chr.vx = -chr.speed;
        chr.facing = -1;
    } else if (keysState.right) {
        chr.vx += chr.acceleration * dt;
        if (chr.vx > chr.speed) chr.vx = chr.speed;
        chr.facing = 1;
    } else {
        chr.vx *= Math.pow(chr.friction, dt);
        if (Math.abs(chr.vx) < 0.05) chr.vx = 0;
    }
    chr.x += chr.vx * dt;
    const groundLevel = 0;
    if (chr.isFlying) {
        if (keysState.up) chr.y += 8 * dt;
        if (keysState.down) chr.y -= 8 * dt;
        if (chr.y < groundLevel) chr.y = groundLevel;
        if (chr.y > canvas.height - 110) chr.y = canvas.height - 110;
        chr.vy = 0;
        chr.isJumping = false;
    } else {
        chr.y += chr.vy * dt;
        if (chr.y > groundLevel || chr.vy > 0) {
            chr.vy -= chr.gravity * dt;
        }
        if (chr.y <= groundLevel) {
            chr.y = groundLevel;
            chr.vy = 0;
            chr.isJumping = false;
        }
    }
    chr.squish += (1 - chr.squish) * 0.15;
    if (Math.abs(chr.vx) > 0.2 && !chr.isJumping && !chr.isFlying) {
        chr.walkCycle += Math.abs(chr.vx) * chr.strideFrequency * dt;
    } else {
        chr.walkCycle = 0;
    }
}
let smoothLeftLegAngle = 0, smoothRightLegAngle = 0;
let smoothLeftArmAngle = 0, smoothRightArmAngle = 0;
let smoothLeftLegAngle2 = 0, smoothRightLegAngle2 = 0;
let smoothLeftArmAngle2 = 0, smoothRightArmAngle2 = 0;
const ARROW_SPEED = 7.5;
const AIM_ERROR = 0;
function throwBlade(e, targetChr) {
    const sx = e.x;
    const sy = enemyCY(e);
    const aim = aimArrow(sx, sy, targetChr, ARROW_SPEED);
    arws.push({ x: sx, y: sy, vx: aim.vx, vy: aim.vy, ang: aim.ang, owner: e });
}
function futureY(chr, keys, t) {
    if (chr.isFlying) {
        const vyFly = (keys.up ? 8 : 0) - (keys.down ? 8 : 0);
        return Math.max(0, Math.min(canvas.height - 110, chr.y + vyFly * t));
    }
    if (chr.y <= 0 && chr.vy <= 0) return 0;
    return Math.max(0, chr.y + chr.vy * t - 0.5 * chr.gravity * t * t);
}
function aimArrow(sx, sy, chr, spd) {
    const keys = chr.playerNum === 1 ? keysP1 : keysP2;
    const cx = chr.x;
    const cy = canvas.height - chr.y - 35;
    let ax = cx - sx, ay = cy - sy;
    let T = Math.hypot(ax, ay) / spd;
    for (let i = 0; i < 5; i++) {
        const t = Math.min(T, 90);
        ax = (cx + chr.vx * t) - sx;
        ay = (canvas.height - futureY(chr, keys, t) - 35) - sy;
        T = Math.hypot(ax, ay) / spd;
    }
    let ang = Math.atan2(ay, ax);
    if (AIM_ERROR > 0) ang += (Math.random() - 0.5) * 2 * AIM_ERROR;
    return { vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, ang: ang };
}
const MOOSE_VB = { x: 88, y: 8, w: 262, h: 402 };
const MOOSE_H = 70;
const MOOSE_W = MOOSE_H * MOOSE_VB.w / MOOSE_VB.h;
const MOOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MOOSE_VB.x} ${MOOSE_VB.y} ${MOOSE_VB.w} ${MOOSE_VB.h}" width="${MOOSE_VB.w}" height="${MOOSE_VB.h}">
<style>
.outline{stroke:#36260d;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.seam{fill:none;stroke:#36260d;stroke-width:1.5;stroke-linecap:round;opacity:.75}
.yellow-fill{fill:#f9d857}.yellow-shade{fill:#d6ad2d}
.blue-fill{fill:#467399}.blue-dark{fill:#2c4c68}
.red-fill{fill:#be2a33}.red-dark{fill:#85181e}
.antler-fill{fill:#94762e}.antler-dark{fill:#6b531b}
.buckle-fill{fill:#99b8ce}.buckle-shade{fill:#7495ad}
</style>
<defs>
<clipPath id="clip-snout"><path d="M 118,142 C 110,122 135,105 168,108 C 198,110 218,124 214,146 C 210,168 182,178 152,174 C 126,170 123,156 118,142 Z"/></clipPath>
<clipPath id="clip-head"><path d="M 148,125 C 145,82 162,55 198,56 C 232,57 250,82 248,122 L 245,152 C 242,168 220,178 192,176 L 155,155 Z"/></clipPath>
<clipPath id="clip-torso"><path d="M 138,178 C 165,164 215,162 248,175 C 266,212 278,256 274,290 C 272,308 248,316 208,316 C 164,316 126,308 128,286 C 129,252 130,210 138,178 Z"/></clipPath>
<clipPath id="clip-cape"><path d="M 222,165 C 262,162 296,188 312,238 C 326,282 329,332 326,362 C 308,368 282,365 260,358 L 244,295 Z"/></clipPath>
</defs>
<g id="cape">
<path class="red-fill outline" d="M 222,165 C 262,162 296,188 312,238 C 326,282 329,332 326,362 C 308,368 282,365 260,358 L 244,295 Z"/>
<g clip-path="url(#clip-cape)">
<path class="red-dark" d="M 249,250 C 272,262 286,315 284,368 L 249,365 Z"/>
<path class="seam" d="M 256,258 C 276,275 284,320 282,365"/>
<path class="red-dark" d="M 289,175 C 316,215 326,290 319,365 L 334,365 L 329,180 Z"/>
</g>
<path class="outline" fill="none" d="M 222,165 C 262,162 296,188 312,238 C 326,282 329,332 326,362 C 308,368 282,365 260,358 L 244,295 Z"/>
</g>
<g id="antler-left">
<path class="antler-dark outline" d="M 118,22 C 134,20 146,35 145,56 C 145,62 152,65 156,58 C 164,56 170,68 164,84 C 158,98 150,104 158,112 L 146,120 C 134,110 112,102 104,88 Z"/>
<path class="antler-fill outline" d="M 148,116 C 135,105 112,104 102,88 C 92,72 95,42 108,28 C 118,17 132,20 136,36 C 138,48 136,60 142,62 C 148,64 152,52 158,56 C 164,60 162,78 152,92 C 146,100 152,106 158,110 Z"/>
</g>
<g id="arm-left">
<path class="yellow-fill outline" d="M 116,226 C 104,234 100,252 110,262 C 120,271 136,265 142,252 Z"/>
<path class="yellow-shade" d="M 128,235 C 136,244 132,260 118,264 C 130,265 140,258 142,248 Z"/>
<path class="blue-fill outline" d="M 142,184 C 123,192 112,208 108,226 C 120,233 134,236 144,234 Z"/>
</g>
<g id="legs">
<path class="yellow-fill outline" d="M 142,298 L 143,368 C 144,388 160,398 180,396 C 196,394 203,382 203,365 L 203,302 Z"/>
<path class="yellow-shade" d="M 190,304 L 190,372 C 190,386 182,394 172,396 C 190,397 202,386 202,368 L 202,304 Z"/>
<path class="outline" fill="none" d="M 142,298 L 143,368 C 144,388 160,398 180,396 C 196,394 203,382 203,365 L 203,302 Z"/>
<path class="yellow-fill outline" d="M 198,304 L 199,375 C 200,396 218,406 238,402 C 254,398 260,384 260,365 L 258,298 Z"/>
<path class="yellow-shade" d="M 244,300 L 245,372 C 245,388 236,398 224,402 C 244,403 259,390 259,368 L 258,300 Z"/>
<path class="seam" d="M 242,307 C 244,335 244,372 238,400"/>
<path class="outline" fill="none" d="M 198,304 L 199,375 C 200,396 218,406 238,402 C 254,398 260,384 260,365 L 258,298 Z"/>
</g>
<g id="torso">
<path class="blue-fill outline" d="M 138,178 C 165,164 215,162 248,175 C 266,212 278,256 274,290 C 272,308 248,316 208,316 C 164,316 126,308 128,286 C 129,252 130,210 138,178 Z"/>
<g clip-path="url(#clip-torso)">
<path class="blue-dark" d="M 236,170 C 250,215 256,268 248,318 L 282,318 L 270,170 Z"/>
<path class="red-fill outline" d="M 124,250 C 168,263 228,263 276,248 L 278,267 C 228,282 168,282 123,269 Z"/>
<path class="red-dark" d="M 243,253 L 278,246 L 279,269 L 245,274 Z"/>
<rect class="red-fill outline" x="144" y="253" width="7" height="20" rx="1"/>
<rect class="red-fill outline" x="216" y="255" width="7" height="20" rx="1"/>
<rect class="red-dark outline" x="252" y="251" width="7" height="20" rx="1"/>
</g>
<path class="outline" fill="none" d="M 138,178 C 165,164 215,162 248,175 C 266,212 278,256 274,290 C 272,308 248,316 208,316 C 164,316 126,308 128,286 C 129,252 130,210 138,178 Z"/>
<ellipse class="buckle-fill outline" cx="184" cy="267" rx="17" ry="12.5"/>
<path class="buckle-shade" d="M 193,257 C 200,261 200,273 191,277 C 196,274 198,263 193,257 Z"/>
<path class="red-fill outline" d="M 147,204 C 151,193 168,192 180,199 L 185,203 L 191,199 C 204,192 221,194 225,206 C 215,204 204,206 197,211 L 185,206 L 174,211 C 166,205 155,203 147,204 Z"/>
</g>
<g id="collar"><path class="red-fill outline" d="M 198,169 C 215,156 244,158 262,172 C 254,180 232,180 212,174 Z"/></g>
<g id="arm-right">
<path class="yellow-fill outline" d="M 252,238 C 248,254 256,272 272,274 C 288,276 298,262 294,242 L 288,230 Z"/>
<path class="yellow-shade" d="M 280,232 C 286,248 282,266 268,272 C 284,275 296,262 293,242 L 288,230 Z"/>
<path class="outline" fill="none" d="M 252,238 C 248,254 256,272 272,274 C 288,276 298,262 294,242 L 288,230 Z"/>
<path class="blue-fill outline" d="M 238,182 C 258,180 276,194 292,232 C 278,242 258,244 244,238 C 238,218 235,198 238,182 Z"/>
<path class="blue-dark" d="M 262,190 C 274,204 282,220 286,234 L 292,231 C 280,202 270,192 262,190 Z"/>
<path class="outline" fill="none" d="M 238,182 C 258,180 276,194 292,232 C 278,242 258,244 244,238 C 238,218 235,198 238,182 Z"/>
</g>
<g id="head-group">
<path class="yellow-fill outline" d="M 148,125 C 145,82 162,55 198,56 C 232,57 250,82 248,122 L 245,152 C 242,168 220,178 192,176 L 155,155 Z"/>
<g clip-path="url(#clip-head)">
<path class="yellow-shade" d="M 225,58 C 242,78 242,135 224,175 L 254,175 L 254,58 Z"/>
<path class="seam" d="M 192,56 C 189,68 188,78 188,88"/>
<path class="outline" fill="none" d="M 168,77 Q 175,73 182,76"/>
<path class="outline" fill="none" d="M 198,75 Q 205,72 212,76"/>
<path class="blue-fill outline" d="M 142,92 C 172,82 218,82 252,94 L 250,122 C 216,130 172,128 142,120 Z"/>
<path class="blue-dark" d="M 228,86 L 228,128 L 254,126 L 254,88 Z"/>
<path class="outline" fill="none" d="M 142,92 C 172,82 218,82 252,94 L 250,122 C 216,130 172,128 142,120 Z"/>
</g>
<ellipse fill="#ffffff" class="outline" cx="173" cy="105" rx="4.2" ry="6.5" transform="rotate(-8 173 105)"/>
<ellipse fill="#ffffff" class="outline" cx="203" cy="105" rx="4.2" ry="6.5" transform="rotate(6 203 105)"/>
<path class="outline" fill="none" d="M 148,125 C 145,82 162,55 198,56 C 232,57 250,82 248,122 L 245,152 C 242,168 220,178 192,176 L 155,155 Z"/>
<path class="outline" fill="none" d="M 205,158 C 218,162 228,156 232,145"/>
<path class="outline" fill="none" d="M 228,143 Q 233,144 235,148"/>
<path class="yellow-fill outline" d="M 118,142 C 110,122 135,105 168,108 C 198,110 218,124 214,146 C 210,168 182,178 152,174 C 126,170 123,156 118,142 Z"/>
<g clip-path="url(#clip-snout)">
<path class="yellow-shade" d="M 196,112 C 208,128 204,158 172,174 L 218,176 L 218,112 Z"/>
<path class="seam" d="M 164,108 C 156,128 156,154 162,175"/>
</g>
<path class="outline" fill="none" d="M 118,142 C 110,122 135,105 168,108 C 198,110 218,124 214,146 C 210,168 182,178 152,174 C 126,170 123,156 118,142 Z"/>
<ellipse fill="#36260d" cx="144" cy="133" rx="2.8" ry="4.5" transform="rotate(12 144 133)"/>
<ellipse fill="#36260d" cx="174" cy="132" rx="2.8" ry="4.5" transform="rotate(-10 174 132)"/>
</g>
<g id="ear-right">
<path class="yellow-fill outline" d="M 244,104 C 256,105 268,116 272,130 C 262,136 250,136 242,130 Z"/>
<path class="yellow-shade" d="M 244,124 C 254,128 264,128 271,126 L 272,130 C 262,136 250,136 242,130 Z"/>
<path class="outline" fill="none" d="M 244,104 C 256,105 268,116 272,130 C 262,136 250,136 242,130 Z"/>
</g>
<g id="antler-right">
<path class="antler-dark outline" d="M 294,18 C 314,15 338,34 342,60 C 345,84 332,104 304,112 C 288,116 274,114 265,122 L 254,112 C 264,100 274,92 268,78 C 262,64 266,50 275,50 C 282,50 284,60 290,58 C 296,56 286,36 294,18 Z"/>
<path class="antler-fill outline" d="M 252,110 C 262,98 272,92 264,76 C 256,60 262,46 270,48 C 276,50 278,60 285,58 C 292,56 282,36 290,22 C 298,10 322,22 332,46 C 340,68 332,94 304,104 C 286,110 272,108 262,118 Z"/>
</g>
</svg>`;
const mooseImg = new Image();
mooseImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(MOOSE_SVG);
function nearestTwo(chr) {
    const cy = canvas.height - chr.y - 35;
    return ems
        .map(e => ({ e, d: Math.hypot(e.x - chr.x, enemyCY(e) - cy) }))
        .filter(o => o.d < 520)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .map(o => o.e);
}
function updateMoose(chr, alive) {
    if (!chr.isRatActive || !alive) { chr.moose = null; return; }
    const homeX = chr.x - chr.facing * 55;
    const homeY = canvas.height - chr.y - 60;
    if (!chr.moose) chr.moose = { x: homeX, y: homeY, face: chr.facing };
    const mo = chr.moose;
    const targets = nearestTwo(chr);
    const target = targets[0] || null;
    const tx = target ? target.x : homeX;
    const ty = target ? enemyCY(target) : homeY;
    const dx = tx - mo.x, dy = ty - mo.y;
    const len = Math.hypot(dx, dy) || 1;
    const step = Math.min(len, (target ? 16 : 6) * (chr.speed / chr.baseSpeed) * dt);
    if (Math.abs(dx) > 2) mo.face = dx > 0 ? 1 : -1;
    mo.x += (dx / len) * step;
    mo.y += (dy / len) * step;
    mo.y = Math.min(mo.y, canvas.height - MOOSE_H / 2 - 3);
    if (target &&
        Math.abs(mo.x - target.x) < MOOSE_W / 2 + target.width * 0.5 + 8 &&
        Math.abs(mo.y - enemyCY(target)) < MOOSE_H / 2 + target.height * 0.5 + 8) {
        targets.forEach(e => {                       // closest 2 fall together
            const i = ems.indexOf(e);
            if (i >= 0) {
                registerKill(e, enemyCY(e), '#f9d857', 14);
                ems.splice(i, 1);
            }
        });
    }
    for (let j = arws.length - 1; j >= 0; j--) {
        const a = arws[j];
        if (Math.abs(a.x - mo.x) < MOOSE_W / 2 + 10 && Math.abs(a.y - mo.y) < MOOSE_H / 2 + 10) {
            addSparks(a.x, a.y, '#f9d857', 5);
            arws.splice(j, 1);
        }
    }
}
function drawMoose(mo) {
    if (!mooseImg.complete || !mooseImg.naturalWidth) return;
    const bob = Math.sin(performance.now() / 180) * 3;
    ctx.save();
    ctx.translate(mo.x, mo.y + bob);
    ctx.scale(mo.face === 1 ? -1 : 1, 1);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#f9d857';
    ctx.drawImage(mooseImg, -MOOSE_W / 2, -MOOSE_H / 2, MOOSE_W, MOOSE_H);
    ctx.restore();
}
function updateSpirit(chr, alive) {
    if (!chr.isAstral || !alive) { chr.spirit = null; return; }
    const homeX = chr.x + chr.facing * 50;
    const homeY = canvas.height - chr.y - 100;
    if (!chr.spirit) chr.spirit = { x: homeX, y: homeY };
    const sp = chr.spirit;
    const cy = canvas.height - chr.y - 35;
    const teamMode = chr.isRatActive && chr.moose;   // Moose + Spirit together
    let target = null;
    if (teamMode) {
        // Moose owns the 2 closest enemies, so the Spirit takes the FARTHEST visible one
        const skip = nearestTwo(chr);
        let far = -1;
        for (const e of ems) {
            if (skip.includes(e)) continue;
            if (e.x < chr.cam - 40 || e.x > chr.cam + chr.viewW + 40) continue;
            const d = Math.hypot(e.x - chr.x, enemyCY(e) - cy);
            if (d > far) { far = d; target = e; }
        }
    } else {
        let best = 520;
        for (const e of ems) {
            const d = Math.hypot(e.x - chr.x, enemyCY(e) - cy);
            if (d < best) { best = d; target = e; }
        }
    }
    const tx = target ? target.x : homeX;
    const ty = target ? enemyCY(target) : homeY;
    const dx = tx - sp.x, dy = ty - sp.y;
    const len = Math.hypot(dx, dy) || 1;
    const step = Math.min(len, (target ? 11 : 6) * (chr.speed / chr.baseSpeed) * dt);
    sp.x += (dx / len) * step;
    sp.y += (dy / len) * step;
    for (let j = ems.length - 1; j >= 0; j--) {
        const e = ems[j];
        if (teamMode && e !== target) continue;   // in team mode it only kills its own target
        const ey = enemyCY(e);
        if (Math.hypot(sp.x - e.x, sp.y - ey) < 30 + e.width * 0.5) {
            registerKill(e, ey, '#a29bfe', 14);
            ems.splice(j, 1);
        }
    }
}
function aliveChars() {
    const a = [];
    if (hp > 0) a.push(character);
    if (isSplit && hp2 > 0) a.push(character2);
    return a;
}
function viewBounds() {
    const a = aliveChars();
    const l = a.length ? a : [character];
    return {
        lo: Math.min(...l.map(c => c.cam)),
        hi: Math.max(...l.map(c => c.cam + c.viewW))
    };
}
function updateCam(chr) {
    chr.cam = Math.max(chr.cam, chr.x - chr.viewW * 0.30);
    if (chr.x < chr.cam + 35) chr.x = chr.cam + 35;
}
function updateViewCam() {
    if (isGuest) {
        [character, character2].forEach(c => {
            c.viewW = canvas.width;
            c.cam = Math.max(c.cam, c.x - c.viewW * 0.30);
        });
    }
    const me = isGuest ? character2 : character;
    const other = isGuest ? character : character2;
    const meAlive = isGuest ? hp2 > 0 : hp > 0;
    const otherAlive = isGuest ? hp > 0 : (isSplit && hp2 > 0);
    camX = (!meAlive && otherAlive) ? other.cam : me.cam;
    b = -camX;
    const gg = groundGradient();
    if (gg) grdEl.style.backgroundImage = gg;
    m.style.transform = `translate3d(${(b * 0.2) % lw}px, 0, 0)`;
    t.style.transform = `translate3d(${(b * 0.6) % lw}px, 0, 0)`;
    maskLayer.style.transform = `translate3d(${b}px, 0, 0)`;
}
function eyePos(chr) {
    const S = 0.42 * (chr.giant ? 1.5 : 1);
    const lean = chr.leanNow || 0;
    const hx = 13, hy = -83;
    const rx = hx * Math.cos(lean) - hy * Math.sin(lean);
    const ry = hx * Math.sin(lean) + hy * Math.cos(lean);
    return {
        x: chr.x + chr.facing * rx * S,
        y: canvas.height - chr.y + (-68 + ry) * S
    };
}
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');

function freezeTalismans(chr) {
    chr.pausedTimers = {};
    const now = Date.now();
    const ends = chr.talismanEnds || {};
    const act = chr.activeTalismans || {};
    Object.keys(act).forEach(k => {
        if (typeof act[k] !== 'boolean' && ends[k]) {
            clearTimeout(act[k]);
            chr.pausedTimers[k] = Math.max(0, ends[k] - now);
            act[k] = true;
        }
    });
}
function thawTalismans(chr, delta) {
    const left = chr.pausedTimers || {};
    Object.keys(left).forEach(k => {
        if (chr.activeTalismans && chr.activeTalismans[k]) {
            startPlayerTimer(chr, k, left[k] / 1000, chr.talismanCbs && chr.talismanCbs[k]);
        }
    });
    chr.pausedTimers = {};
    if (chr.lastLaserTime) chr.lastLaserTime += delta;
}
function setPaused(p) {
    if (p === isPaused || isGuest || !enemiesActive || isGameOver || introOpen) return;
    if (p) {
        isPaused = true;
        pauseStartTime = Date.now();
        clearInputKeys();
        freezeTalismans(character);
        freezeTalismans(character2);
        try { window.speechSynthesis.pause(); } catch (e) {}
        document.body.classList.add('paused');
        pauseOverlay.style.display = 'flex';
    } else {
        const delta = Date.now() - pauseStartTime;
        gt += delta;
        nextSpawnAt += delta;
        ems.forEach(e => { e.lt += delta; });
        thawTalismans(character, delta);
        thawTalismans(character2, delta);
        isPaused = false;
        try { window.speechSynthesis.resume(); } catch (e) {}
        document.body.classList.remove('paused');
        pauseOverlay.style.display = 'none';
    }
}
pauseBtn.addEventListener('click', () => { pauseBtn.blur(); setPaused(true); });
document.getElementById('resume-btn').addEventListener('click', () => setPaused(false));
document.getElementById('pause-restart-btn').addEventListener('click', () => location.reload());
function u() {
    if (isPaused) {
        lastFrameTime = performance.now();
        requestAnimationFrame(u);
        return;
    }
    const frameNow = performance.now();
    dt = Math.min((frameNow - lastFrameTime) / 16.667, 3);
    lastFrameTime = frameNow;
    if (gameStarted && !isGameOver && !isGuest) {
        spawnTick();
        updateTalismanTimers(character);
        if (isSplit) updateTalismanTimers(character2);
        updatePlayer(character, keysP1, 1);
        if (isSplit) {
            updatePlayer(character2, keysP2, 2);
        }
        if (character.x < 35) character.x = 35;
        if (isSplit && character2.x < 35) character2.x = 35;
        character.viewW = canvas.width;
        updateCam(character);
        if (isSplit) updateCam(character2);
        const lead = Math.max(0, ...aliveChars().map(c => c.cam));
        if (lead * 0.05 > dist) { dist = lead * 0.05; updateScoreUI(); }
        const vb = viewBounds();
        checkBanishCollect();
        checkMaskCollect();
        if (!introOpen) {
            aliveChars().forEach(c => { if (inWater(c)) waterDamage(c); });
        }
        const now = Date.now();
        updateMoose(character, hp > 0);
        updateSpirit(character, hp > 0);
        if (isSplit) {
            updateMoose(character2, hp2 > 0);
            updateSpirit(character2, hp2 > 0);
        } else {
            character2.spirit = null;
            character2.moose = null;
        }
        for (let i = ems.length - 1; i >= 0; i--) {
            const e = ems[i];
            e.spd = e.baseSpd;
            if (e.hitCooldown > 0) e.hitCooldown -= dt;
            if (!e.fly && e.rise < 1) {
                e.rise = Math.min(1, e.rise + dt / 50);
                if (Math.random() < 0.3 * dt) {
                    addSparks(e.x + (Math.random() - 0.5) * 26, canvas.height - 3, '#4a3b6b', 3);
                }
                if (e.x < vb.lo - 150) ems.splice(i, 1);
                continue;
            }
            const validTargets = [];
            if (!character.invisible && !character.isShadowGuard && hp > 0) validTargets.push(character);
            if (isSplit && !character2.invisible && !character2.isShadowGuard && hp2 > 0) validTargets.push(character2);

            if (e.fly) {
                e.x -= e.spd * dt;
                e.anim += 0.1 * dt;
            } else {
                const prey = validTargets.length
                    ? validTargets.reduce((best, c) => Math.abs(c.x - e.x) < Math.abs(best.x - e.x) ? c : best)
                    : null;
                let moving = false;
                e.attacking = false;
                if (prey) {
                    const gap = prey.x - e.x;
                    e.attacking = boxesOverlap(enemyBox(e), playerBox(prey));
                    if (Math.abs(gap) > 8) {
                        e.facing = gap > 0 ? 1 : -1;
                        moving = !e.attacking && !(prey.y > 0 && Math.abs(gap) < 40);
                    }
                } else {
                    const bump = aliveChars().find(c => !c.isShadowGuard && boxesOverlap(enemyBox(e), playerBox(c)));
                    e.attacking = !!bump;
                    e.facing = bump ? (bump.x > e.x ? 1 : -1) : -1;
                    moving = !bump;
                }
                if (moving) e.x += e.facing * e.spd * dt;
                e.moving = moving;
                if (moving || e.attacking) e.anim += 0.12 * dt;
            }

            if (e.hitCooldown <= 0) {
                const gb = enemyBox(e);
                const hitP1 = !character.isShadowGuard && hp > 0 &&
                              boxesOverlap(gb, playerBox(character));
                const hitP2 = isSplit && !character2.isShadowGuard && hp2 > 0 &&
                              boxesOverlap(gb, playerBox(character2));
                if (hitP1) {
                    dmg(6, character);
                    e.hitCooldown = 50;
                } else if (hitP2) {
                    dmg(6, character2);
                    e.hitCooldown = 50;
                }
            }

            const bladeTarget = validTargets.length > 0
                ? validTargets.reduce((best, c) => Math.abs(c.x - e.x) < Math.abs(best.x - e.x) ? c : best)
                : null;
            if (e.burstLeft > 0) {
                e.burstT -= dt * 16.667;
                if (e.burstT <= 0) {
                    if (bladeTarget) throwBlade(e, bladeTarget);
                    e.burstLeft--;
                    e.burstT = 140;
                }
            }
            if (bladeTarget && !e.attacking && !(e.burstLeft > 0) && now - e.lt > 1400) {
                if (e.x > bladeTarget.cam + 320 && e.x < bladeTarget.cam + bladeTarget.viewW + 20) {
                    e.lt = now;
                    throwBlade(e, bladeTarget);
                    e.burstLeft = e.fly ? 0 : 2;
                    e.burstT = 140;
                }
            }
            if (e.x < vb.lo - 150 || (!e.fly && e.x > vb.hi + 400)) {
                ems.splice(i, 1);
            }
        }
        for (let i = arws.length - 1; i >= 0; i--) {
            const a = arws[i];
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            const hit1 = !character.isShadowGuard && hp > 0 &&
                         Math.abs(character.x - a.x) < 22 &&
                         Math.abs((canvas.height - character.y - 35) - a.y) < 25;
            const hit2 = isSplit && !character2.isShadowGuard && hp2 > 0 &&
                         Math.abs(character2.x - a.x) < 22 &&
                         Math.abs((canvas.height - character2.y - 35) - a.y) < 25;
            if (hit1) {
                dmg(5, character);
                arws.splice(i, 1);
                continue;
            } else if (hit2) {
                dmg(5, character2);
                arws.splice(i, 1);
                continue;
            }
            let bladeHit = false;
            for (let j = ems.length - 1; j >= 0; j--) {
                const en = ems[j];
                if (en === a.owner || (!en.fly && en.rise < 1)) continue;
                const eb = enemyBox(en);
                if (Math.abs(a.x - eb.cx) < eb.hw + 10 && Math.abs(a.y - eb.cy) < eb.hh + 10) {
                    en.hits = (en.hits || 0) + 1;
                    addSparks(a.x, a.y, '#b0bec5', 6);
                    if (en.hits >= (en.fly ? 6 : 9)) {
                        addSparks(en.x, eb.cy, '#ff9f43', 14);
                        ems.splice(j, 1);
                    }
                    bladeHit = true;
                    break;
                }
            }
            if (bladeHit) {
                arws.splice(i, 1);
                continue;
            }
            if (a.x < vb.lo - 30 || a.x > vb.hi + 30 || a.y < -30 || a.y > canvas.height + 30) {
                arws.splice(i, 1);
            }
        }
        for (let i = fbs.length - 1; i >= 0; i--) {
            const f = fbs[i];
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            let hitEnemy = false;
            for (let j = ems.length - 1; j >= 0; j--) {
                const e = ems[j];
                const ey = enemyCY(e);
                if (Math.abs(f.x - e.x) < e.width * 0.5 + f.radius && Math.abs(f.y - ey) < e.height * 0.5 + f.radius) {
                    registerKill(e, ey, '#ff9f43', 14);
                    ems.splice(j, 1);
                    hitEnemy = true;
                    break;
                }
            }
            if (hitEnemy || f.x < vb.lo || f.x > vb.hi || f.y < 0 || f.y > canvas.height) {
                fbs.splice(i, 1);
            }
        }
        const checkLaserHits = (chr) => {
            const mx = aimPt(chr).x, my = aimPt(chr).y;
            const eye = eyePos(chr);
            const ex = eye.x;
            const ey = eye.y;
            const dx = mx - ex;
            const dy = my - ey;
            const lineLen = Math.hypot(dx, dy) || 1;
            for (let j = ems.length - 1; j >= 0; j--) {
                const e = ems[j];
                const eyPos = enemyCY(e);
                const u = Math.max(0, Math.min(1, ((e.x - ex) * dx + (eyPos - ey) * dy) / (lineLen * lineLen)));
                const px = ex + u * dx;
                const py = ey + u * dy;
                const distToLine = Math.hypot(e.x - px, eyPos - py);
                if (distToLine < Math.max(e.width, e.height) * 0.6) {
                    registerKill(e, eyPos, '#ff4757', 10);
                    ems.splice(j, 1);
                }
            }
        };
        if (character.isPigLaserActive && hp > 0) {
            checkLaserHits(character);
        }
        if (isSplit && character2.isPigLaserActive && hp2 > 0) {
            checkLaserHits(character2);
        }
    }
    updateViewCam();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camX, 0);
    for (const chr of [character, character2]) {
    if (chr === character2 && !isSplit) continue;
    const alive = chr === character ? hp > 0 : hp2 > 0;
    if (!alive) continue;
    if (chr.isRatActive && chr.moose) drawMoose(chr.moose);
    if (chr.isAstral && chr.spirit) {
        ctx.save();
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.85;
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#a29bfe';
        ctx.fillText('👻', chr.spirit.x, chr.spirit.y);
        ctx.restore();
    }
}
    const drawPigLaser = (chr) => {
        const mx = aimPt(chr).x, my = aimPt(chr).y;
        const eye = eyePos(chr);
        const ex = eye.x;
        const ey = eye.y;
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ff4757';
        ctx.strokeStyle = '#ff3838';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fff';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.restore();
    };
    if (character.isPigLaserActive && hp > 0) {
        drawPigLaser(character);
    }
    if (isSplit && character2.isPigLaserActive && hp2 > 0) {
        drawPigLaser(character2);
    }
    for (let i = magicBeams.length - 1; i >= 0; i--) {
        const b = magicBeams[i];
        const progress = b.duration / b.maxDuration;
        const alpha = Math.min(1, progress * 1.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 24;
        ctx.shadowColor = b.glowColor;
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.45)';
        ctx.lineWidth = 16 * progress;
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.stroke();
        ctx.shadowBlur = 14;
        ctx.shadowColor = b.color;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 7 * progress;
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.stroke();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 * progress;
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00ff66';
        ctx.beginPath();
        ctx.arc(b.startX, b.startY, 8 * progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        b.duration -= dt;
        if (b.duration <= 0) {
            magicBeams.splice(i, 1);
        }
    }
    for (const a of arws) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(performance.now() / 45 + a.x * 0.02);
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#e0f2f7';
        const grad = ctx.createLinearGradient(-13, -13, 13, 13);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#b0bec5');
        grad.addColorStop(1, '#78909c');
        ctx.fillStyle = grad;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
            const r = k % 2 === 0 ? 13 : 4.5;
            const ang = k * Math.PI / 4;
            const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#546e7a';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#37474f';
        ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    for (const f of fbs) {
        ctx.save();
        ctx.translate(f.x, f.y);
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, f.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fffa65');
        grad.addColorStop(0.7, '#ff4757');
        grad.addColorStop(1, 'rgba(194, 54, 22, 0)');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff4757';
        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    drawWater(0.9);
    drawBanishObjects();
    for (const e of ems) {
        ctx.save();
        if (e.fly) {
            ctx.translate(e.x, canvas.height - e.y - 20);
            const wingFlap = Math.sin(e.anim * 6) * 4;
            ctx.font = '34px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦇', 0, wingFlap);
        } else {
            const rise = e.rise === undefined ? 1 : e.rise;
            const gy = canvas.height - e.y;
            if (rise < 1) {
                ctx.save();
                ctx.globalAlpha = 0.9 - 0.5 * rise;
                ctx.fillStyle = '#120d22';
                ctx.beginPath();
                ctx.ellipse(e.x, gy + 3, 22, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                ctx.beginPath();
                ctx.rect(e.x - 60, gy + 3 - 150, 120, 150);
                ctx.clip();
                ctx.translate(e.x, gy + (1 - rise) * 62);
                drawShadowGuardBody(e.anim * 5, GUARD_SCALE, e.facing || -1, 'idle');
            } else {
                ctx.translate(e.x, gy);
                drawShadowGuardBody(e.anim * 5, GUARD_SCALE, e.facing || -1, e.attacking ? 'attack' : (e.moving ? 'run' : 'idle'));
            }
        }
        ctx.restore();
    }
    if ((!character.invisible || hasSnake(character)) && hp > 0) {
        drawHuman(character, isGuest ? "Partner" : "Me");
    }
    if (isSplit && (!character2.invisible || hasSnake(character2)) && hp2 > 0) {
        drawHuman(character2, isGuest ? "Me" : "Partner");
    }
    drawWater(0.3);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.isSparkle) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#2ed573';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y += ft.vy * dt;
        ft.opacity -= 0.022 * dt;
        if (ft.opacity <= 0) {
            floatTexts.splice(i, 1);
            continue;
        }        
        ctx.save();
        ctx.globalAlpha = ft.opacity;
        ctx.font = `${ft.size + 6}px Bangers, 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineJoin = 'round';
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
    ctx.restore();
    requestAnimationFrame(u);
}
requestAnimationFrame(u);
const INK = '#1b1410';
function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const k = f >= 0 ? 255 : 0, a = Math.abs(f);
    r = Math.round(r + (k - r) * a); g = Math.round(g + (k - g) * a); b = Math.round(b + (k - b) * a);
    return `rgb(${r},${g},${b})`;
}
function hg(hex, half) {
    const g = ctx.createLinearGradient(-half, 0, half, 0);
    g.addColorStop(0, shade(hex, 0.3));
    g.addColorStop(0.5, hex);
    g.addColorStop(1, shade(hex, -0.35));
    return g;
}
function drawJointLimb(x, y, len1, len2, w1, w2, a1, a2, c1, c2, endType, endColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 1;
    ctx.rotate(a1);
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.roundRect(-w1 / 2, -4, w1, len1 + 8, w1 / 2.5); ctx.fill(); ctx.stroke();
    ctx.translate(0, len1);
    ctx.rotate(a2);
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.roundRect(-w2 / 2, -4, w2, len2 + 4, w2 / 2.5); ctx.fill(); ctx.stroke();
    ctx.translate(0, len2);
    if (endType === 'shoe') {
        ctx.fillStyle = endColor || '#1c1917';
        ctx.beginPath(); ctx.roundRect(-w2 / 2 - 1, -3, w2 + 11, 12, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = endColor || '#e7e5e4';
        ctx.fillRect(-w2 / 2 - 1, 6, w2 + 11, 3);
    } else {
        ctx.fillStyle = endColor || '#f0c08a';
        ctx.beginPath(); ctx.arc(0, 2, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
}
function drawJackieHead(cx, cy, s, skin, skinShade) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const ink = '#31313b';
    const hairCol = '#0b0b12';
    ctx.fillStyle = skin;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.bezierCurveTo(-16, 6, -10, 18, 0, 22);
    ctx.lineTo(8, 24);
    ctx.lineTo(15, 20);
    ctx.bezierCurveTo(19, 14, 20, 6, 19, 0);
    ctx.bezierCurveTo(19, -8, 14, -16, 4, -18);
    ctx.bezierCurveTo(-6, -18, -13, -14, -14, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = skinShade;
    ctx.beginPath();
    ctx.ellipse(-13, 4, 3.6, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(17, -3);
    ctx.quadraticCurveTo(26, 5, 19, 9);
    ctx.quadraticCurveTo(16, 9, 16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(19.5, 8, 0.9, 0, Math.PI * 2); ctx.fill();
        [[4, -0.5, 5.2, 3.1, 5.7, 2.4], [14.5, -0.5, 3.6, 2.8, 15.6, 1.9]].forEach(([ex, ey, rx, ry, ix, ir]) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ex, ey, rx, ry, 0.05, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
        ctx.fillStyle = '#7a4a22';
        ctx.beginPath(); ctx.arc(ix, ey + 0.2, ir, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0f08';
        ctx.beginPath(); ctx.arc(ix + 0.2, ey + 0.2, ir * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = skin;
        ctx.fillRect(ex - rx, ey - ry, rx * 2, ry * 0.8);
        ctx.restore();
        ctx.strokeStyle = ink;
        ctx.lineCap = 'round';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ex - rx - 0.5, ey - ry * 0.1);
        ctx.quadraticCurveTo(ex, ey - ry * 0.55, ex + rx + 0.5, ey - ry * 0.1);
        ctx.stroke();
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0.05, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    });
    ctx.strokeStyle = hairCol;
    ctx.lineCap = 'round';
    ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(-1.5, -6); ctx.quadraticCurveTo(4, -9.5, 10.5, -6.8); ctx.stroke();
    ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(11.5, -6.5); ctx.quadraticCurveTo(15, -8.2, 19, -5.5); ctx.stroke();
    ctx.strokeStyle = skinShade;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(15.5, -2.5); ctx.quadraticCurveTo(17.5, 2, 16.5, 6); ctx.stroke();
    ctx.strokeStyle = '#7a3322';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(7, 13.5); ctx.quadraticCurveTo(12.5, 16, 18, 10.5); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(18, 10.5); ctx.quadraticCurveTo(20, 10.5, 19.6, 8.6); ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(10, 16.8); ctx.quadraticCurveTo(13, 18, 15.5, 16.2); ctx.stroke();
    ctx.fillStyle = hairCol;
    ctx.beginPath();
    ctx.moveTo(-15, 10);
    ctx.lineTo(-25, 6);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-28, -8);
    ctx.lineTo(-16, -10);
    ctx.lineTo(-23, -20);
    ctx.lineTo(-11, -16);
    ctx.quadraticCurveTo(-4, -30, 14, -25);
    ctx.lineTo(2, -18);
    ctx.quadraticCurveTo(10, -32, 26, -22);
    ctx.lineTo(11, -15);
    ctx.quadraticCurveTo(18, -27, 33, -15);
    ctx.lineTo(19, -11);
    ctx.quadraticCurveTo(24, -15, 30, -7);
    ctx.lineTo(13, -9);
    ctx.lineTo(10, -10);
    ctx.lineTo(5, -12.5);
    ctx.lineTo(1, -9.5);
    ctx.lineTo(-5, -9);
    ctx.lineTo(-9, -4);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, -3); ctx.lineTo(-5, -3); ctx.lineTo(-5, 7); ctx.lineTo(-9, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#31313b';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-7, -20);  ctx.quadraticCurveTo(0, -27, 11, -24);
    ctx.moveTo(5, -19);   ctx.quadraticCurveTo(13, -27, 23, -21);
    ctx.moveTo(13, -15);  ctx.quadraticCurveTo(20, -23, 30, -15);
    ctx.moveTo(19, -11.5); ctx.quadraticCurveTo(24, -13, 28, -8.5);
    ctx.moveTo(-21, -16); ctx.lineTo(-15, -13);
    ctx.stroke();
    ctx.restore();
}
function drawHuman(chr, label) {
    ctx.save();
    ctx.translate(chr.x, canvas.height - chr.y);
    if (isSplit) {
        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = chr.shirtColor;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#fff';
        ctx.fillText(label, 0, chr.giant ? -135 : -95);
        ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0.12, 0.35 - chr.y / 900);
    ctx.fillStyle = '#0b2a14';
    ctx.beginPath();
    ctx.ellipse(0, chr.y + 2, (chr.giant ? 40 : 26) * Math.max(0.5, 1 - chr.y / 500), 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (chr.isDogImmortal) {
        ctx.save();
        ctx.strokeStyle = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -40, chr.giant ? 80 : 55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.fill();
        ctx.restore();
    }
    if (chr.invisible && hasSnake(chr)) ctx.globalAlpha = SNAKE_ALPHA;
    if (chr.isShadowGuard) {
        const moving = Math.abs(chr.vx) > 0.2;
        const state = (chr.isJumping || chr.isFlying || chr.y > 0) ? 'air' : (moving ? 'run' : 'idle');
        drawShadowGuardBody(chr.walkCycle, 0.42 * (chr.giant ? 1.5 : 1), chr.facing, state);
        ctx.restore();
        return;
    }
    const S = 0.42;
    ctx.scale(chr.facing * S, S * chr.squish);
    if (chr.giant) ctx.scale(1.5, 1.5);
    const baseFilter = chr.light ? 'brightness(1.5) saturate(1.8)' : 'none';
    if (chr.light) ctx.filter = baseFilter;
    const skinShade = '#c98f5a';
    const skinHead = hg('#ddbd99', 18), skinArm = hg('#ddbd99', 6);
    const shirtBody = hg(chr.shirtColor, 19), shirtArm = hg(chr.shirtColor, 7);
    const pantsBody = hg(chr.pantsColor, 17), pantsLeg = hg(chr.pantsColor, 9);
    const target = Math.abs(chr.vx) > 0.2 ? 1 : 0;
    chr.moveBlend = (chr.moveBlend || 0) + (target - (chr.moveBlend || 0)) * 0.2;
    const mb = chr.moveBlend;
    const air = chr.isJumping || chr.isFlying || chr.y > 0;
    const t = chr.walkCycle;
    const breathe = Math.sin(performance.now() / 500 + chr.playerNum * 2) * 1.2 * (1 - mb);
    const bob = -Math.abs(Math.sin(t)) * 4 * mb;
    let lean = 0.10 * mb;
    let hipF, kneeF, hipB, kneeB, shF, elF, shB, elB;
    if (chr.isFlying) {
        lean = 0.5;
        hipF = -0.3; kneeF = 0.4; hipB = 0.2; kneeB = 0.3;
        shF = -1.3; elF = -0.1; shB = -1.1; elB = -0.1;
    } else if (air) {
        lean = 0.06;
        hipF = -0.8; kneeF = 1.3; hipB = 0.35; kneeB = 0.6;
        shF = -1.2; elF = -0.6; shB = 0.6; elB = -0.4;
    } else {
        hipF = -Math.sin(t) * 0.65 * mb;
        kneeF = Math.max(0, Math.cos(t)) * 0.9 * mb + 0.05;
        hipB = Math.sin(t) * 0.65 * mb;
        kneeB = Math.max(0, -Math.cos(t)) * 0.9 * mb + 0.05;
        shF = Math.sin(t) * 0.7 * mb;
        shB = -Math.sin(t) * 0.7 * mb;
        elF = -(0.25 + 0.35 * mb);
        elB = -(0.25 + 0.35 * mb);
    }
    const hipY = -68 + bob;
    chr.leanNow = lean;
    const shoulderY = -46 + breathe;
    drawJointLimb(-3, hipY, 34, 34, 17, 14, hipB, kneeB, pantsLeg, pantsLeg, 'shoe');
    ctx.filter = baseFilter;
    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(lean);
    drawJointLimb(0, shoulderY, 22, 20, 12, 10, shB, elB, shirtArm, skinArm, 'hand');
    ctx.filter = baseFilter;
    ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
    ctx.fillStyle = pantsBody;
    ctx.beginPath(); ctx.roundRect(-17, -2, 34, 18, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shirtBody;
    ctx.beginPath(); ctx.roundRect(-19, -54 + breathe, 38, 56, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(10,20,50,0.22)';
    ctx.beginPath(); ctx.roundRect(6, -54 + breathe, 13, 56, [0, 9, 9, 0]); ctx.fill();
    ctx.fillStyle = '#292524'; ctx.fillRect(-18, -2, 36, 5);
    ctx.fillStyle = '#d4a017'; ctx.fillRect(-3, -2, 6, 5);
    ctx.fillStyle = skinShade;
    ctx.beginPath();
    ctx.moveTo(-9, -54 + breathe); ctx.lineTo(9, -54 + breathe); ctx.lineTo(0, -38 + breathe);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, -54 + breathe); ctx.lineTo(0, -38 + breathe); ctx.lineTo(9, -54 + breathe);
    ctx.stroke();
    drawJackieHead(1, -82 + breathe, 1.15, skinHead, skinShade);
    drawJointLimb(0, shoulderY, 22, 20, 13, 11, shF, elF, shirtArm, skinArm, 'hand');
    ctx.restore();
    drawJointLimb(3, hipY, 34, 34, 18, 15, hipF, kneeF, pantsLeg, pantsLeg, 'shoe');
    ctx.filter = 'none';
    ctx.restore();
}
function drawShadowGuardBody(walk, scale, facing, state) {
    const suit = hg('#16161a', 19), suitLimb = hg('#16161a', 7), gear = '#0f0e18';
    const sash = hg('#c81e1e', 19), skin = '#f0c08a';
    const sw = Math.sin(walk), cw = Math.cos(walk);
    let hipF, kneeF, hipB, kneeB, shF, elF, shB, elB, lean, bob = 0;

    if (state === 'run') {
        lean = 0.24;
        bob = -Math.abs(sw) * 5;
        hipF = -sw * 0.95;  kneeF = Math.max(0, cw) * 1.3 + 0.1;
        hipB =  sw * 0.95;  kneeB = Math.max(0, -cw) * 1.3 + 0.1;
        shF =  sw * 1.0;    elF = -1.2;
        shB = -sw * 1.0;    elB = -1.2;
    } else if (state === 'attack') {
        const punch = Math.sin(walk * 1.5);
        lean = 0.18;
        hipF = -0.45; kneeF = 0.35; hipB = 0.4; kneeB = 0.3;
        shF = -1.45 + punch * 0.25; elF = -0.15;
        shB = -0.5 - punch * 0.25;  elB = -1.0;
    } else if (state === 'air') {
        lean = 0.06;
        hipF = -0.8; kneeF = 1.3; hipB = 0.35; kneeB = 0.6;
        shF = -1.2; elF = -0.6; shB = 0.6; elB = -0.4;
    } else {
        const br = Math.sin(performance.now() / 500) * 0.04;
        lean = 0.04;
        hipF = 0.05; kneeF = 0.05; hipB = -0.05; kneeB = 0.05;
        shF = 0.1 + br; elF = -0.4; shB = -0.1 - br; elB = -0.4;
    }
    const hipY = -68 + bob, shoulderY = -46;
    const flap = Math.sin(walk * 1.3) * 5;
    ctx.save();
    ctx.scale(facing * scale, scale);
    drawJointLimb(-3, hipY, 34, 34, 16, 13, hipB, kneeB, suitLimb, suitLimb, 'shoe', gear);
    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(lean);
    drawJointLimb(0, shoulderY, 22, 20, 11, 9, shB, elB, suitLimb, suitLimb, 'hand', gear);
    ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
    ctx.fillStyle = suit;
    ctx.beginPath(); ctx.roundRect(-17, -2, 34, 18, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-19, -54, 38, 56, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = sash;
    ctx.fillRect(-19, -4, 38, 8);
    ctx.beginPath();
    ctx.moveTo(-17, -2); ctx.lineTo(-36, 4 + flap); ctx.lineTo(-33, 11 + flap); ctx.lineTo(-15, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = suit;
    ctx.beginPath(); ctx.arc(2, -72, 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = sash;
    ctx.fillRect(-17, -84, 38, 6);
    ctx.beginPath();
    ctx.moveTo(-16, -83); ctx.lineTo(-34, -79 + flap); ctx.lineTo(-30, -73 + flap); ctx.lineTo(-15, -78);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0a0a12';
    ctx.beginPath(); ctx.roundRect(2, -75, 19, 10, 4); ctx.fill();
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff1a1a';
    ctx.beginPath(); ctx.ellipse(9, -70, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16.5, -70, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffb3b3';
    ctx.beginPath(); ctx.arc(9.8, -70.6, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(17.3, -70.6, 1, 0, Math.PI * 2); ctx.fill();
    drawJointLimb(0, shoulderY, 22, 20, 12, 10, shF, elF, suitLimb, suitLimb, 'hand', gear);
    ctx.restore();
    drawJointLimb(3, hipY, 34, 34, 17, 14, hipF, kneeF, suitLimb, suitLimb, 'shoe', gear);
    ctx.restore();
}
