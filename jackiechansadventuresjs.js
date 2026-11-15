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
let hp = 100;
let hp2 = 100;
let isGameOver = false;
let gameStarted = false;
let enemiesActive = false;
let introOpen = false;
let enemyInterval = null;
let sgk = 0;
let ek = 0;
let dist = 0;
let prevScore = -1, prevDist = -1;
let b = 0;
const lw = 1800;
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
    playerNum: 1, name: "P1 (Blue)", x: 120, y: 0, vx: 0, vy: 0, speed: 4.4, baseSpeed: 4.4, acceleration: 2.5, friction: 0.80, gravity: 0.65, jumpForce: 14, isJumping: false, facing: 1, walkCycle: 0, 
    strideFrequency: 0.16, bodyTilt: 0, squish: 1, shirtColor: '#2563eb', pantsColor: '#78350f', activeTalisman: null, talismanTimer: null, talismanTimeLeft: 0, isDogImmortal: false, isDragonShooting: false,
    isShadowGuard: false, isRatActive: false, isPigLaserActive: false, giant: false, isFlying: false, isAstral: false, invisible: false, light: false
};
const character2 = { 
    playerNum: 2, name: "P2 (Red)", x: 220, y: 0, vx: 0, vy: 0, speed: 4.4, baseSpeed: 4.4, acceleration: 2.5, friction: 0.80, gravity: 0.65, jumpForce: 14, isJumping: false, facing: 1, walkCycle: 0, 
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
    for (let i = 0; i < 5; i++) {
        const mItem = document.createElement('div');
        mItem.className = 'm-item';
        m.appendChild(mItem);
    }
    for (let i = 0; i < 5; i++) {
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
const BANISH = [
    { e: '🗡️', n: 'Shendu',     m: 100 },
    { e: '🪭', n: 'Xiao Fung',  m: 200 },
    { e: '🍐', n: 'Bai Tza',    m: 400 },
    { e: '🌸', n: 'Dai Gui',    m: 800 },
    { e: '🪷', n: 'Tso Lan',    m: 1600 },
    { e: '🪈', n: 'Hsi Wu',     m: 3200 },
    { e: '🥟', n: 'Tchang Zu',  m: 6400 },
    { e: '🪘', n: 'Po Kong',    m: 12800 }
].map(o => ({ ...o, x: o.m * 20 + 450, got: false }));
const BANISH_Y = 150;   // height above ground

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

function checkBanishCollect() {
    const chars = aliveChars();
    for (const o of BANISH) {
        if (o.got) continue;
        const box = { cx: o.x, cy: canvas.height - BANISH_Y, hw: 18, hh: 20 };
        for (const c of chars) {
            if (boxesOverlap(box, playerBox(c))) {
                o.got = true;
                updateBanishUI();
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
        ctx.fillText(o.e, o.x, canvas.height - BANISH_Y + Math.sin(now / 300 + o.m) * 4);
    }
    ctx.restore();
}
const calcScore = () => sgk * 100 + ek * 150 ;
function updateScoreUI(force = false) {
    const currentScore = calcScore();
    const currentDist = Math.floor(dist);
    if (!force && currentScore === prevScore && currentDist === prevDist) return;
    prevScore = currentScore;
    prevDist = currentDist;
    if (hudSgk) hudSgk.textContent = sgk;
    if (hudEk) hudEk.textContent = ek;
    if (hudSgs) hudSgs.textContent = sgk * 100;
    if (hudEs) hudEs.textContent = ek * 150;
    if (hudDc) hudDc.textContent = currentDist;
}
function registerKill(e, ey, sparkColor, sparkCount = 12) {
    addSparks(e.x, ey, sparkColor, sparkCount);
    if (e.fly) {
        ek++;
        addFloatText("+150", e.x, ey - 15, '#ffd700', 18);
    } else {
        sgk++;
        addFloatText("+100", e.x, ey - 15, '#ffd700', 18);
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
  hp = 100; hp2 = 100; isGameOver = false; sgk = 0; ek = 0; dist = 0; prevScore = -1; prevDist = -1; ems = []; arws = []; fbs = []; magicBeams = []; particles = []; floatTexts = [];
  [keysP1, keysP2].forEach(k => k.left = k.right = k.up = k.down = false);
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
function showInstructions() {
    window.speechSynthesis.cancel();
    document.getElementById('intro-dialog').style.display = 'none';
    document.getElementById('instructions-dialog').style.display = 'flex';
}
document.getElementById('intro-start-btn').addEventListener('click', showInstructions);
document.getElementById('intro-skip-btn').addEventListener('click', showInstructions);
document.getElementById('instructions-start-btn').addEventListener('click', () => {
    document.getElementById('instructions-dialog').style.display = 'none';
    introOpen = false;
    enemiesActive = true;
    gt = Date.now();
    nextSpawnAt = Date.now() + 1500;
});
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
    document.getElementById('go-sgs').textContent = sgk * 100;
    document.getElementById('go-es').textContent = ek * 150;
    document.getElementById('go-dc').textContent = Math.floor(dist);
    goSc.textContent = calcScore();
    goEl.style.display = 'flex';
}
function dmg(amount, targetP) {
    if (!gameStarted || isGameOver) return;
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
            if (hp > 0) character.invisible = false;
        }
    } else {
        if (hp2 < 100) {
            hp2 = Math.min(100, hp2 + amount);
            hp2V.textContent = Math.round(hp2);
            updateHpBar(hp2Bar, hp2);
            if (hp2 > 0) character2.invisible = false;
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
    if (!gameStarted || isGameOver) return;
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
        width: isFly ? 40 : GUARD_W,
        height: isFly ? 34 : GUARD_H,
        facing: owner.x > startX ? 1 : -1,
        attacking: false,
        rise: isFly ? 1 : 0,          // 0 = underground, 1 = fully out
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
        case 'rat': return '🐀 Rat (Tree Guardians)';
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
    const alive = caster.playerNum === 1 ? hp > 0 : hp2 > 0;
    if (!alive || isGameOver) return;
    const now = Date.now();
    if (now - (caster.lastLaserTime || 0) < 400) return;   // per-player cooldown
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
    if (!gameStarted || isGameOver) return;
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
            break;
        case 'rabbit':
            chr.speed = 9.0;
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
    if (!gameStarted || isGameOver || introOpen) return;
    if (e.target.closest('.ui-c') || e.target.closest('#start-overlay') || e.target.closest('#go') || e.target.closest('#intro-dialog') || e.target.closest('#instructions-dialog') || e.target.closest('#mp-panel') || e.target.closest('#mp-lost')) return;
    if (character.isDragonShooting && hp > 0) {
        shootDragonFireball(character);
    }
    if (isSplit && character2.isDragonShooting && hp2 > 0 && !remoteP2) {
        shootDragonFireball(character2);
    }
});
function shootDragonFireball(chr) {
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
function treeGuardPts(chr) {
    const y = canvas.height - chr.y - 35;
    return [{ x: chr.x - 65, y }, { x: chr.x + 65, y }];
}
function updateGuardians(chr, alive) {
    if (!chr.isRatActive || !alive) return;
    for (const p of treeGuardPts(chr)) {
        for (let j = ems.length - 1; j >= 0; j--) {
            const e = ems[j];
            const ey = enemyCY(e);
            if (Math.abs(e.x - p.x) < 32 + e.width * 0.5 && Math.abs(ey - p.y) < 50) {
                registerKill(e, ey, '#2ed573', 12);
                ems.splice(j, 1);
            }
        }
        for (let j = arws.length - 1; j >= 0; j--) {
            const a = arws[j];
            if (Math.abs(a.x - p.x) < 28 && Math.abs(a.y - p.y) < 50) {
                addSparks(a.x, a.y, '#2ed573', 5);
                arws.splice(j, 1);
            }
        }
    }
}
function updateSpirit(chr, alive) {
    if (!chr.isAstral || !alive) { chr.spirit = null; return; }
    const homeX = chr.x + chr.facing * 50;
    const homeY = canvas.height - chr.y - 100;
    if (!chr.spirit) chr.spirit = { x: homeX, y: homeY };
    const sp = chr.spirit;
    const cy = canvas.height - chr.y - 35;
    let target = null, best = 520;
    for (const e of ems) {
        const d = Math.hypot(e.x - chr.x, (enemyCY(e)) - cy);
        if (d < best) { best = d; target = e; }
    }
    const tx = target ? target.x : homeX;
    const ty = target ? enemyCY(target) : homeY;
    const dx = tx - sp.x, dy = ty - sp.y;
    const len = Math.hypot(dx, dy) || 1;
    const step = Math.min(len, (target ? 11 : 6) * dt);
    sp.x += (dx / len) * step;
    sp.y += (dy / len) * step;
    for (let j = ems.length - 1; j >= 0; j--) {
        const e = ems[j];
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
    camX = (!meAlive && otherAlive) ? other.cam : me.cam;   // dead player watches the partner
    b = -camX;
    m.style.transform = `translate3d(${(b * 0.2) % lw}px, 0, 0)`;
    t.style.transform = `translate3d(${(b * 0.6) % lw}px, 0, 0)`;
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
function u() {
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
        const now = Date.now();
        updateGuardians(character, hp > 0);
        updateSpirit(character, hp > 0);
        if (isSplit) {
            updateGuardians(character2, hp2 > 0);
            updateSpirit(character2, hp2 > 0);
        } else {
            character2.spirit = null;
        }
        for (let i = ems.length - 1; i >= 0; i--) {
            const e = ems[i];
            e.spd = e.baseSpd;
            if (e.hitCooldown > 0) e.hitCooldown -= dt;
            if (!e.fly && e.rise < 1) {
                e.rise = Math.min(1, e.rise + dt / 50);     // about 0.8 s
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
                // bats: unchanged
                e.x -= e.spd * dt;
                e.anim += 0.1 * dt;
            } else {
                // guards run toward the nearest visible player, stop and punch on contact
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
                        moving = !e.attacking;
                    }
                } else {
                    e.facing = -1;      // nobody to chase: keep running left
                    moving = true;
                }
                if (moving) e.x += e.facing * e.spd * dt;
                if (moving || e.attacking) e.anim += 0.12 * dt;
            }

            if (e.hitCooldown <= 0) {
                const gb = enemyBox(e);
                const hitP1 = !character.invisible && !character.isShadowGuard && hp > 0 &&
                              boxesOverlap(gb, playerBox(character));
                const hitP2 = isSplit && !character2.invisible && !character2.isShadowGuard && hp2 > 0 &&
                              boxesOverlap(gb, playerBox(character2));
                if (hitP1) {
                    dmg(6, character);
                    e.hitCooldown = 50;
                } else if (hitP2) {
                    dmg(6, character2);
                    e.hitCooldown = 50;
                }
            }

            if (validTargets.length > 0 && !e.attacking && now - e.lt > 2600) {
                const targetChr = validTargets.reduce((best, c) =>
                    Math.abs(c.x - e.x) < Math.abs(best.x - e.x) ? c : best);
                if (e.x > targetChr.cam + 320 && e.x < targetChr.cam + targetChr.viewW + 20) {
                    e.lt = now;
                    const sx = e.x;
                    const sy = enemyCY(e);
                    const aim = aimArrow(sx, sy, targetChr, ARROW_SPEED);
                    arws.push({ x: sx, y: sy, vx: aim.vx, vy: aim.vy, ang: aim.ang });
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
            const hit1 = !character.invisible && !character.isShadowGuard && hp > 0 &&
                         Math.abs(character.x - a.x) < 22 &&
                         Math.abs((canvas.height - character.y - 35) - a.y) < 25;
            const hit2 = isSplit && !character2.invisible && !character2.isShadowGuard && hp2 > 0 &&
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
    if (chr.isRatActive) {
        ctx.save();
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const p of treeGuardPts(chr)) ctx.fillText('🌳', p.x, p.y);
        ctx.restore();
    }
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
        ctx.rotate(performance.now() / 45 + a.x * 0.02);   // spinning
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
                // dark hole in the ground
                ctx.save();
                ctx.globalAlpha = 0.9 - 0.5 * rise;
                ctx.fillStyle = '#120d22';
                ctx.beginPath();
                ctx.ellipse(e.x, gy + 3, 22, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                // only show the part of the guard above the ground line
                ctx.beginPath();
                ctx.rect(e.x - 60, gy + 3 - 150, 120, 150);
                ctx.clip();
                ctx.translate(e.x, gy + (1 - rise) * 62);
                drawShadowGuardBody(e.anim * 5, GUARD_SCALE, e.facing || -1, 'idle');
            } else {
                ctx.translate(e.x, gy);
                drawShadowGuardBody(e.anim * 5, GUARD_SCALE, e.facing || -1, e.attacking ? 'attack' : 'run');
            }
        }
        ctx.restore();
    }
    if ((!character.invisible || character.activeTalisman === 'snake') && hp > 0) {
        drawHuman(character, isGuest ? "Partner" : "Me");
    }
    if (isSplit && (!character2.invisible || character2.activeTalisman === 'snake') && hp2 > 0) {
        drawHuman(character2, isGuest ? "Me" : "Partner");
    }
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
        ctx.font = `bold ${ft.size}px 'Segoe UI', sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
    ctx.restore();
    requestAnimationFrame(u);
}
requestAnimationFrame(u);
function drawJointLimb(x, y, len1, len2, w1, w2, a1, a2, c1, c2, endType, endColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a1);
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.roundRect(-w1 / 2, -4, w1, len1 + 8, w1 / 2.5);
    ctx.fill();
    ctx.translate(0, len1);
    ctx.rotate(a2);
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.roundRect(-w2 / 2, -4, w2, len2 + 4, w2 / 2.5);
    ctx.fill();
    ctx.translate(0, len2);
    if (endType === 'shoe') {
        ctx.fillStyle = endColor || '#1c1917';
        ctx.beginPath();
        ctx.roundRect(-w2 / 2 - 1, -3, w2 + 11, 12, 5);
        ctx.fill();
        ctx.fillStyle = endColor || '#e7e5e4';
        ctx.fillRect(-w2 / 2 - 1, 6, w2 + 11, 3);
    } else {
        ctx.fillStyle = endColor || '#f0c08a';
        ctx.beginPath();
        ctx.arc(0, 2, 5.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
function drawJackieHead(cx, cy, s, skin, skinShade) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const ink = '#4a2a14';
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
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(4, -1, 5.2, 3.4, 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath(); ctx.arc(5.8, -0.8, 2.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(6.5, -1.6, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(14.5, -1, 3.6, 3, 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath(); ctx.arc(15.7, -0.8, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hairCol;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-1.5, -2.5); ctx.quadraticCurveTo(4, -5, 10, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, -2.5); ctx.quadraticCurveTo(14.5, -4.5, 18.5, -2); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-2, -5.5); ctx.lineTo(5, -8.5); ctx.lineTo(11, -8); ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(12.5, -8); ctx.lineTo(19, -6.2); ctx.stroke();
    ctx.strokeStyle = '#6b2f22';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(6, 13); ctx.quadraticCurveTo(12, 16.5, 18, 10.5); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(18, 10.5); ctx.lineTo(19.2, 8.8); ctx.stroke();
    ctx.fillStyle = hairCol;
    ctx.beginPath();
    ctx.moveTo(-15, 8);
    ctx.lineTo(-24, 5);
    ctx.lineTo(-17, 0);
    ctx.lineTo(-26, -8);
    ctx.lineTo(-15, -10);
    ctx.lineTo(-21, -19);
    ctx.lineTo(-11, -15);
    ctx.lineTo(0, -27);
    ctx.lineTo(-2, -18);
    ctx.lineTo(10, -28);
    ctx.lineTo(6, -17);
    ctx.lineTo(22, -23);
    ctx.lineTo(12, -14);
    ctx.lineTo(28, -12);
    ctx.lineTo(18, -10);
    ctx.lineTo(8, -12);
    ctx.lineTo(0, -9);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, -3); ctx.lineTo(-5, -3); ctx.lineTo(-5, 7); ctx.lineTo(-9, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2f4fb0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, -19);  ctx.lineTo(-1, -24);
    ctx.moveTo(3, -20);   ctx.lineTo(8, -25);
    ctx.moveTo(11, -17);  ctx.lineTo(19, -21);
    ctx.moveTo(-20, -10); ctx.lineTo(-15, -9);
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
    if (chr.invisible && chr.activeTalisman === 'snake') ctx.globalAlpha = 0.35;
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
    ctx.filter = baseFilter;
    const skin = '#f0c08a', skinShade = '#d9a06a';
    const shirt = chr.shirtColor, pants = chr.pantsColor;
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
    ctx.filter = 'brightness(0.75)';
    drawJointLimb(-3, hipY, 34, 34, 17, 14, hipB, kneeB, pants, pants, 'shoe');
    ctx.filter = baseFilter;
    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(lean);
    ctx.filter = 'brightness(0.75)';
    drawJointLimb(0, shoulderY, 22, 20, 12, 10, shB, elB, shirt, skin, 'hand');
    ctx.filter = baseFilter;
    ctx.fillStyle = pants;
    ctx.beginPath(); ctx.roundRect(-17, -2, 34, 18, 5); ctx.fill();
    ctx.fillStyle = shirt;
    ctx.beginPath(); ctx.roundRect(-19, -54 + breathe, 38, 56, 9); ctx.fill();
    ctx.fillStyle = '#292524'; ctx.fillRect(-18, -2, 36, 5);
    ctx.fillStyle = '#d4a017'; ctx.fillRect(-3, -2, 6, 5);
    ctx.fillStyle = skinShade;
    ctx.beginPath();
    ctx.moveTo(-9, -54 + breathe); ctx.lineTo(9, -54 + breathe); ctx.lineTo(0, -38 + breathe);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 40, 0.5)';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, -54 + breathe); ctx.lineTo(0, -38 + breathe); ctx.lineTo(9, -54 + breathe);
    ctx.stroke();
    drawJackieHead(1, -82 + breathe, 1.15, skin, skinShade);
    drawJointLimb(0, shoulderY, 22, 20, 13, 11, shF, elF, shirt, skin, 'hand');
    ctx.restore();
    drawJointLimb(3, hipY, 34, 34, 18, 15, hipF, kneeF, pants, pants, 'shoe');
    ctx.filter = 'none';
    ctx.restore();
}
function drawShadowGuardBody(walk, scale, facing, state) {
    const suit = '#2b2840', suitDark = '#1a182b', gear = '#0f0e18';
    const sash = '#b91c1c', skin = '#f0c08a';
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
    } else { // idle
        const br = Math.sin(performance.now() / 500) * 0.04;
        lean = 0.04;
        hipF = 0.05; kneeF = 0.05; hipB = -0.05; kneeB = 0.05;
        shF = 0.1 + br; elF = -0.4; shB = -0.1 - br; elB = -0.4;
    }

    const hipY = -68 + bob, shoulderY = -46;
    const flap = Math.sin(walk * 1.3) * 5;

    ctx.save();
    ctx.scale(facing * scale, scale);

    // back leg
    drawJointLimb(-3, hipY, 34, 34, 16, 13, hipB, kneeB, suitDark, suitDark, 'shoe', gear);

    ctx.save();
    ctx.translate(0, hipY);
    ctx.rotate(lean);

    // back arm
    drawJointLimb(0, shoulderY, 22, 20, 11, 9, shB, elB, suitDark, suitDark, 'hand', gear);

    // hips + torso
    ctx.fillStyle = suit;
    ctx.beginPath(); ctx.roundRect(-17, -2, 34, 18, 5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-19, -54, 38, 56, 9); ctx.fill();

    // sash + flapping tail
    ctx.fillStyle = sash;
    ctx.fillRect(-19, -4, 38, 8);
    ctx.beginPath();
    ctx.moveTo(-17, -2); ctx.lineTo(-36, 4 + flap); ctx.lineTo(-33, 11 + flap); ctx.lineTo(-15, 4);
    ctx.closePath(); ctx.fill();

    // hood
    ctx.fillStyle = suit;
    ctx.beginPath(); ctx.arc(2, -72, 19, 0, Math.PI * 2); ctx.fill();

    // headband + tail
    ctx.fillStyle = sash;
    ctx.fillRect(-17, -84, 38, 6);
    ctx.beginPath();
    ctx.moveTo(-16, -83); ctx.lineTo(-34, -79 + flap); ctx.lineTo(-30, -73 + flap); ctx.lineTo(-15, -78);
    ctx.closePath(); ctx.fill();

    // eye slit + eyes
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

    // front arm
    drawJointLimb(0, shoulderY, 22, 20, 12, 10, shF, elF, suit, suit, 'hand', gear);
    ctx.restore();

    // front leg
    drawJointLimb(3, hipY, 34, 34, 17, 14, hipF, kneeF, suit, suit, 'shoe', gear);
    ctx.restore();
}
