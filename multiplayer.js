(function () {
  'use strict';
  const PREFIX = 'jca-';
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rid = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const GUEST_TALISMANS = ['dog', 'dragon', 'horse', 'monkey', 'rat', 'rabbit', 'pig', 'ox', 'rooster', 'sheep', 'snake'];
  let sessionId = rid();
  let peer = null, peerReady = false;
  let guestConn = null;
  let hostConn = null;
  let currentHost = '';
  let pendingJoin = null, joinTimer = null, lastSplit = false, lostShown = false;
  let snapTimer = null, inTimer = null;
  const fxQ = [];
  const gk = { l: false, r: false, u: false, d: false };
  const style = document.createElement('style');
  style.textContent = `
  #mp-panel{position:fixed;left:20px;top:150px;z-index:200;background:rgba(0,0,0,.8);color:#fff;font:13px 'Segoe UI',sans-serif;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.25);width:260px;line-height:1.5}
  #mp-panel .mp-h{font-weight:bold;font-size:14px;margin-bottom:4px}
  #mp-panel b#mp-id{color:#ffd700;font-family:monospace;font-size:16px;letter-spacing:2px}
  #mp-panel button{background:#2e86de;color:#fff;border:0;border-radius:6px;padding:3px 9px;cursor:pointer;font-weight:bold}
  #mp-panel input{width:150px;padding:3px 6px;border-radius:6px;border:1px solid #888;text-transform:uppercase}
  #mp-state,#mp-msg{font-size:12px;color:#cfe8ff;margin-top:3px}
  #mp-join{margin-top:8px;border-top:1px solid rgba(255,255,255,.2);padding-top:6px}
  body.remote-p2 #b2{display:none !important}
  body.guest #b1{display:none !important}
  body.guest #mp-host{display:none}
  #mp-lost{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.9);color:#fff;display:flex;flex-direction:column;gap:16px;justify-content:center;align-items:center;font:22px 'Segoe UI',sans-serif}
  #mp-lost button{font-size:20px;padding:10px 24px;border:0;border-radius:8px;background:#2e86de;color:#fff;cursor:pointer;font-weight:bold}`;
  document.head.appendChild(style);
  const panel = document.createElement('div');
  panel.id = 'mp-panel';
  panel.innerHTML = `
    <div class="mp-h">🌐 Online Co-Op</div>
    <div id="mp-host">
      <div>Session ID: <b id="mp-id"></b> <button id="mp-copy">Copy link</button></div>
      <div id="mp-state"></div>
    </div>
    <div id="mp-join">
      <div id="mp-row"><input id="mp-in" maxlength="80" placeholder="Friend's session ID"> <button id="mp-go">Join</button></div>
      <div id="mp-msg"></div>
    </div>`;
  document.body.appendChild(panel);
  const $ = id => document.getElementById(id);
  const setMsg = s => { $('mp-msg').textContent = s; };
  const inputEl = $('mp-in');
  inputEl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') joinSession(inputEl.value); });
  inputEl.addEventListener('keyup', e => e.stopPropagation());
  $('mp-go').addEventListener('click', () => joinSession(inputEl.value));
  $('mp-copy').addEventListener('click', () => {
    const link = location.href.split('?')[0].split('#')[0] + '?join=' + sessionId;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(
      () => setMsg('Link copied!'), () => setMsg(link));
  });
  function refresh() {
    $('mp-id').textContent = sessionId;
    let s;
    if (isGuest) { s = ''; setMsg('🎮 Connected to ' + currentHost + ' — you are Player 2 (Red)'); $('mp-row').style.display = 'none'; }
    else if (!peerReady) s = '⏳ Connecting to network…';
    else if (guestConn) s = '✅ Player 2 connected (2/2)';
    else if (isSplit) s = '🔓 Open — share the ID/link. Waiting for Player 2…';
    else s = '🔒 Locked — activate the 🐅 Tiger talisman to let a friend join.';
    $('mp-state').textContent = s;
  }
  function createPeer() {
    if (typeof Peer === 'undefined') { $('mp-state').textContent = '⚠️ PeerJS failed to load (online play unavailable)'; return; }
    peer = new Peer(PREFIX + sessionId, { debug: 0 });
    peer.on('open', () => {
      peerReady = true; refresh();
      if (pendingJoin) { const p = pendingJoin; pendingJoin = null; joinSession(p); }
    });
    peer.on('error', err => {
      if (err.type === 'unavailable-id') { sessionId = rid(); try { peer.destroy(); } catch (e) {} peerReady = false; createPeer(); return; }
      if (err.type === 'peer-unavailable') { clearTimeout(joinTimer); setMsg('Session not found. Check the ID.'); return; }
      $('mp-state').textContent = '⚠️ Network problem: ' + err.type;
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
    peer.on('connection', onIncoming);
  }
  function onIncoming(conn) {
    conn.on('open', () => {
      let reason = null;
      if (isGuest) reason = 'This player is a guest in another session.';
      else if (!gameStarted || !isSplit) reason = '🔒 Session is locked. The host must activate the 🐅 Tiger talisman first.';
      else if (isGameOver) reason = 'The game is over.';
      else if (guestConn && guestConn.open) reason = 'Session is full (2/2 players).';
      if (reason) {
        try { conn.send({ t: 'denied', reason }); } catch (e) {}
        setTimeout(() => { try { conn.close(); } catch (e) {} }, 600);
        return;
      }
      guestConn = conn; remoteP2 = true;
      document.body.classList.add('remote-p2');
      keysP2.left = keysP2.right = keysP2.up = keysP2.down = false;
      conn.send({ t: 'accepted' });
      showChiBanner('🐅 Player 2 (Red) joined online!');
      snapTimer = setInterval(sendSnap, 33);
      refresh();
    });
    conn.on('data', d => { if (conn === guestConn) onGuestMsg(d); });
    conn.on('close', () => { if (conn === guestConn) dropGuest('Player 2 left the game'); });
    conn.on('error', () => { if (conn === guestConn) dropGuest('Player 2 connection lost'); });
  }
  function dropGuest(msg) {
    guestConn = null; remoteP2 = false;
    document.body.classList.remove('remote-p2');
    keysP2.left = keysP2.right = keysP2.up = keysP2.down = false;
    clearInterval(snapTimer); snapTimer = null; fxQ.length = 0;
    if (msg) showChiBanner(msg);
    refresh();
  }
  function kickGuest(reason) {
    const c = guestConn;
    try { c.send({ t: 'kicked', reason }); } catch (e) {}
    dropGuest(reason);
    setTimeout(() => { try { c.close(); } catch (e) {} }, 400);
  }
  function onGuestMsg(d) {
    if (!d || isGameOver) return;
    if (d.t === 'in') {
      const wasUp = keysP2.up;
      keysP2.left = !!d.l; keysP2.right = !!d.r; keysP2.up = !!d.u; keysP2.down = !!d.d;
      gAimX = +d.ax || 0; gAimY = +d.ay || 0;
      if (d.u && !wasUp && isSplit && hp2 > 0 && !character2.isFlying && !character2.isJumping) {
        character2.vy = character2.jumpForce; character2.isJumping = true;
      }
    } else if (d.t === 'tal') {
      if (GUEST_TALISMANS.indexOf(d.name) >= 0) switchTalismanForPlayer(character2, d.name);
    } else if (d.t === 'laser') {
      if (hp2 > 0) fireStraightLaser(character2, 'Magic must defeat magic!', '#00ff88');
    } else if (d.t === 'click') {
      gAimX = +d.ax || 0; gAimY = +d.ay || 0;
      if (isSplit && character2.isDragonShooting && hp2 > 0) shootDragonFireball(character2);
    }
  }
  const r1 = n => Math.round(n * 10) / 10;
  function packChar(c) {
    const now = Date.now(), act = Object.keys(c.activeTalismans || {}), en = {};
    act.forEach(k => { if (c.talismanEnds && c.talismanEnds[k]) en[k] = c.talismanEnds[k] - now; });
    return {
      x: r1(c.x), y: r1(c.y), vx: Math.round(c.vx * 100) / 100, f: c.facing, w: Math.round(c.walkCycle * 100) / 100,
      j: c.isJumping, fl: c.isFlying, g: c.giant, d: c.isDogImmortal, a: c.isAstral, inv: c.invisible,
      sg: c.isShadowGuard, l: c.light, r: c.isRatActive, p: c.isPigLaserActive, dr: c.isDragonShooting,
      sq: Math.round(c.squish * 100) / 100, act, en
    };
  }
  function sendSnap() {
    if (!guestConn || !guestConn.open) return;
    try {
      guestConn.send({
        t: 'snap', W: canvas.width, H: canvas.height,
        hp, hp2, sgk, ek, dist: Math.round(dist * 100) / 100, b: r1(b),
        c1: packChar(character), c2: packChar(character2),
        e: ems.map(e => [r1(e.x), r1(e.y), e.fly ? 1 : 0, Math.round(e.anim * 100) / 100]),
        a: arws.map(a => [r1(a.x), r1(a.y), Math.round(a.ang * 100) / 100]),
        f: fbs.map(f => [r1(f.x), r1(f.y)]),
        mb: magicBeams, ax: Math.round(mx), ay: Math.round(my),
        fx: fxQ.splice(0, 80), over: isGameOver
      });
    } catch (e) {}
  }
  const _sp = addSparks, _ft = addFloatText, _bn = showChiBanner;
  const fxOn = () => guestConn && guestConn.open && !isGuest && fxQ.length < 150;
  addSparks = function (x, y, c, n) { _sp(x, y, c, n); if (fxOn()) fxQ.push(['s', r1(x), r1(y), c, n]); };
  addFloatText = function (tx, x, y, c, s) { _ft(tx, x, y, c, s); if (fxOn()) fxQ.push(['f', tx, r1(x), r1(y), c, s]); };
  showChiBanner = function (msg) { _bn(msg); if (fxOn()) fxQ.push(['b', msg]); };
  function joinSession(raw) {
    if (isGuest || (gameStarted && !isGuest)) return;
    let id = (raw || '').trim();
    const mm = id.match(/join=([A-Za-z0-9-]+)/); if (mm) id = mm[1];
    id = id.toUpperCase().replace(/^JCA-/, '');
    if (!/^[A-Z0-9]{6}$/.test(id)) { setMsg('Invalid session ID.'); return; }
    if (id === sessionId) { setMsg("That's your own session ID."); return; }
    if (!peerReady) { pendingJoin = id; setMsg('Connecting to network…'); return; }
    setMsg('Joining ' + id + '…');
    const conn = peer.connect(PREFIX + id, { serialization: 'json', reliable: true });
    let done = false;
    clearTimeout(joinTimer);
    joinTimer = setTimeout(() => { if (!done) { setMsg('No response from host. Check the ID / network.'); try { conn.close(); } catch (e) {} } }, 12000);
    conn.on('data', d => {
      if (!d) return;
      if (d.t === 'denied') { done = true; clearTimeout(joinTimer); setMsg(d.reason); try { conn.close(); } catch (e) {} }
      else if (d.t === 'accepted') { done = true; clearTimeout(joinTimer); hostConn = conn; currentHost = id; becomeGuest(); }
      else if (d.t === 'snap' && isGuest) applySnap(d);
      else if (d.t === 'kicked') showLost(d.reason);
    });
    conn.on('close', () => {
      if (isGuest) showLost('Host disconnected');
      else if (!done) { done = true; clearTimeout(joinTimer); setMsg('Connection closed.'); }
    });
    conn.on('error', () => { if (isGuest) showLost('Connection lost'); });
  }
  function becomeGuest() {
    isGuest = true; gameStarted = true; isSplit = true; introOpen = false; enemiesActive = false;
    document.body.classList.add('guest');
    ['start-overlay', 'intro-dialog', 'instructions-dialog'].forEach(i => { const el = $(i); if (el) el.style.display = 'none'; });
    try { window.speechSynthesis.cancel(); } catch (e) {}
    hp2Container.style.display = 'block';
    b2.style.display = 'flex';
    refresh();
    inTimer = setInterval(sendIn, 33);
  }
  function showLost(msg) {
    if (lostShown) return; lostShown = true;
    clearInterval(inTimer);
    const d = document.createElement('div');
    d.id = 'mp-lost';
    d.innerHTML = '<div>🔌 ' + msg + '</div><button>Back to menu</button>';
    d.querySelector('button').onclick = () => { location.href = location.href.split('?')[0]; };
    document.body.appendChild(d);
  }
  function applyChar(c, s) {
    c.x = s.x; c.y = s.y; c.vx = s.vx; c.facing = s.f; c.walkCycle = s.w; c.isJumping = s.j;
    c.isFlying = s.fl; c.giant = s.g; c.isDogImmortal = s.d; c.isAstral = s.a; c.invisible = s.inv;
    c.isShadowGuard = s.sg; c.light = s.l; c.isRatActive = s.r; c.isPigLaserActive = s.p;
    c.isDragonShooting = s.dr; c.squish = s.sq;
    const key = s.act.join(',');
    if (c._k !== key) {
      c.activeTalismans = {}; s.act.forEach(k => { c.activeTalismans[k] = true; });
      c._k = key; updatePlayerTalismanUI(c);
    }
    c.talismanEnds = {};
    const now = Date.now();
    s.act.forEach(k => { if (s.en[k] != null) c.talismanEnds[k] = now + s.en[k]; });
    updateTalismanTimers(c);
  }
  function applySnap(s) {
    if (canvas.width !== s.W) canvas.width = s.W;
    if (canvas.height !== s.H) canvas.height = s.H;
    hp = s.hp; hp2 = s.hp2; sgk = s.sgk; ek = s.ek; dist = s.dist; b = s.b;
    hpV.textContent = Math.round(hp); hp2V.textContent = Math.round(hp2);
    updateHpBar(hp1Bar, hp); updateHpBar(hp2Bar, hp2);
    updateScoreUI();
    m.style.transform = `translate3d(${(b * 0.2) % lw}px, 0, 0)`;
    t.style.transform = `translate3d(${(b * 0.6) % lw}px, 0, 0)`;
    applyChar(character, s.c1); applyChar(character2, s.c2);
    ems = s.e.map(a => ({ x: a[0], y: a[1], fly: !!a[2], anim: a[3] }));
    arws = s.a.map(a => ({ x: a[0], y: a[1], ang: a[2] }));
    fbs = s.f.map(a => ({ x: a[0], y: a[1], radius: 10 }));
    magicBeams = s.mb;
    gAimX = s.ax; gAimY = s.ay;
    s.fx.forEach(f => {
      if (f[0] === 's') _sp(f[1], f[2], f[3] || undefined, f[4] || undefined);
      else if (f[0] === 'f') _ft(f[1], f[2], f[3], f[4] || undefined, f[5] || undefined);
      else if (f[0] === 'b') _bn(f[1]);
    });
    if (s.over && !isGameOver) triggerGameOver();
  }
  function sendIn() {
    if (!hostConn || !hostConn.open) return;
    try { hostConn.send({ t: 'in', l: gk.l, r: gk.r, u: gk.u, d: gk.d, ax: Math.round(mx), ay: Math.round(my) }); } catch (e) {}
  }
  function guestLaser() {
    if (!hostConn || !hostConn.open || isGameOver || hp2 <= 0) return;
    try { const s = new SpeechSynthesisUtterance('Magic must defeat magic!'); window.speechSynthesis.speak(s); } catch (e) {}
    hostConn.send({ t: 'laser' });
  }
  const toBuf = e => {
    mx = e.clientX * canvas.width / Math.max(1, window.innerWidth);
    my = e.clientY * canvas.height / Math.max(1, window.innerHeight - 100);
  };
  const KM = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' };
  const hostBlocked = k => k.length === 1 && 'adwseADWSE'.indexOf(k) >= 0;
  window.addEventListener('keydown', e => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (isGuest) {
      const k = KM[e.key];
      if (k) {
        if (k === 'u' && !e.repeat && !gk.u && hp2 > 0 && !character2.isFlying && !character2.isJumping) sayHip();
        if (!gk[k]) { gk[k] = true; sendIn(); }
        e.preventDefault();
      } else if ((e.key === 'e' || e.key === 'E') && !e.repeat) guestLaser();
      e.stopImmediatePropagation();
    } else if (remoteP2 && hostBlocked(e.key)) e.stopImmediatePropagation();
  }, true);
  window.addEventListener('keyup', e => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (isGuest) {
      const k = KM[e.key];
      if (k && gk[k]) { gk[k] = false; sendIn(); }
      e.stopImmediatePropagation();
    } else if (remoteP2 && hostBlocked(e.key)) e.stopImmediatePropagation();
  }, true);
  window.addEventListener('blur', () => {
    if (isGuest) { gk.l = gk.r = gk.u = gk.d = false; sendIn(); }
  });
  window.addEventListener('mousemove', e => {
    if (!isGuest) return;
    toBuf(e); e.stopImmediatePropagation();
  }, true);
  window.addEventListener('click', e => {
    if (!isGuest) return;
    if (e.target.closest('#go,#mp-panel,#mp-lost')) return;
    e.stopImmediatePropagation();
    if (!hostConn || !hostConn.open || isGameOver) return;
    const btn = e.target.closest('.o,.pf,.sl');
    if (btn) {
      const name = btn.getAttribute('data-t');
      if (!name || name === 'tiger') return;
      if (name === 'lizard' || name === 'pufferfish') guestLaser();
      else hostConn.send({ t: 'tal', name });
      return;
    }
    if (e.target.closest('.ui-c')) return;
    toBuf(e);
    hostConn.send({ t: 'click', ax: Math.round(mx), ay: Math.round(my) });
  }, true);
  setInterval(() => {
    if (!isGuest && isSplit !== lastSplit) {
      lastSplit = isSplit;
      if (!isSplit && guestConn) kickGuest('Host switched back to single player');
      refresh();
    }
    $('mp-join').style.display = (gameStarted && !isGuest) ? 'none' : 'block';
  }, 200);
  createPeer();
  refresh();
  const qp = (location.search.match(/[?&]join=([A-Za-z0-9-]+)/) || [])[1];
  if (qp) { inputEl.value = qp.toUpperCase().replace(/^JCA-/, ''); pendingJoin = inputEl.value; setMsg('Connecting to network…'); }
})();
