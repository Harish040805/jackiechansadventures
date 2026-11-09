(function () {
  'use strict';
  const PREFIX = 'jca-';
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rid = () => Array.from({ length: 6 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const GUEST_TALISMANS = ['dog', 'dragon', 'horse', 'monkey', 'rat', 'rabbit', 'pig', 'ox', 'rooster', 'sheep', 'snake'];
  const HK = { '1': 'dog', '2': 'dragon', '3': 'horse', '4': 'monkey', '5': 'rat', '6': 'rabbit', '7': 'pig', '8': 'ox', '9': 'rooster', '0': 'sheep', '-': 'snake' };
  const DIR = { left: 'l', right: 'r', up: 'u', down: 'd' };
  const TURN_URLS = [];
  const TURN_USERNAME = '';
  const TURN_CREDENTIAL = '';
  const ICE_SERVERS = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  if (TURN_URLS.length) ICE_SERVERS.push({ urls: TURN_URLS, username: TURN_USERNAME, credential: TURN_CREDENTIAL });
  const PEER_OPTS = { debug: 0, config: { iceServers: ICE_SERVERS } };
  let sessionId = '';
  let hostPeer = null, hostReady = false;
  let joinPeer = null;
  let guestConn = null;
  let hostConn = null;
  let currentHost = '';
  let joinTimer = null, lastSplit = false, lostShown = false;
  let snapTimer = null, inTimer = null;
  let entId = 1;       
  let hostW = 0, hostH = 0;
  const ents = { e: new Map(), a: new Map(), f: new Map() };
  const fxQ = [];
  const gk = { l: false, r: false, u: false, d: false };
  const style = document.createElement('style');
  style.textContent = `
  #mp-panel{position:fixed;left:20px;top:150px;z-index:10;background:rgba(0,0,0,.8);color:#fff;font:13px 'Segoe UI',sans-serif;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.25);width:260px;line-height:1.5}
  #mp-panel .mp-h{font-weight:bold;font-size:14px;margin-top:4px;user-select:none}
  #mp-panel b#mp-id{color:#ffd700;font-family:monospace;font-size:16px;letter-spacing:2px}
  #mp-panel button{background:#2e86de;color:#fff;border:0;border-radius:6px;padding:3px 9px;cursor:pointer;font-weight:bold}
  #mp-panel button.sel{background:#16a34a}
  #mp-panel input{width:150px;padding:3px 6px;border-radius:6px;border:1px solid #888;text-transform:uppercase}
  #mp-state,#mp-msg{font-size:12px;color:#cfe8ff;margin-top:3px}
  #mp-host{margin-top:6px}
  #mp-join{margin-top:8px;border-top:1px solid rgba(255,255,255,.2);padding-top:6px}
  body.remote-p2 #b2{display:none !important}
  #mp-lost{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.9);color:#fff;display:flex;flex-direction:column;gap:16px;justify-content:center;align-items:center;font:22px 'Segoe UI',sans-serif}
  #mp-lost button{font-size:20px;padding:10px 24px;border:0;border-radius:8px;background:#2e86de;color:#fff;cursor:pointer;font-weight:bold}`;
  document.head.appendChild(style);
  const panel = document.createElement('div');
  panel.id = 'mp-panel';
  panel.innerHTML = `
    <div id="mp-ctrl">Controls: <button id="mp-arrows" tabindex="-1">Arrows</button> <button id="mp-wasd" tabindex="-1">WASD</button></div>
    <div class="mp-h" id="mp-toggle" style="cursor:pointer">🌐 Online Co-Op <span id="mp-arrow">▸</span></div>
    <div id="mp-body" style="display:none">
      <div id="mp-host" style="display:none">
        <div>Session ID: <b id="mp-id"></b> <button id="mp-copy" tabindex="-1">Copy link</button></div>
        <div id="mp-state"></div>
      </div>
      <div id="mp-join">
        <div id="mp-row"><input id="mp-in" maxlength="80" placeholder="Friend's session ID"> <button id="mp-go" tabindex="-1">Join</button></div>
        <div id="mp-msg"></div>
      </div>
    </div>`;
  document.getElementById('g').appendChild(panel);
  const $ = id => document.getElementById(id);
  function setOpen(o) {
    $('mp-body').style.display = o ? 'block' : 'none';
    $('mp-arrow').textContent = o ? '▾' : '▸';
  }
  $('mp-toggle').addEventListener('click', () => setOpen($('mp-body').style.display === 'none'));
  const setMsg = s => { $('mp-msg').textContent = s; if (!isGuest) setOpen(true); };
  const inputEl = $('mp-in');
  inputEl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') joinSession(inputEl.value); });
  inputEl.addEventListener('keyup', e => e.stopPropagation());
  $('mp-go').addEventListener('click', () => joinSession(inputEl.value));
  $('mp-copy').addEventListener('click', () => {
    const link = location.href.split('?')[0].split('#')[0] + '?join=' + sessionId;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(
      () => setMsg('Link copied!'), () => setMsg(link));
  });
  function setScheme(s) {
    controlScheme = s;
    $('mp-arrows').classList.toggle('sel', s === 'arrows');
    $('mp-wasd').classList.toggle('sel', s === 'wasd');
    clearInputKeys();
    gk.l = gk.r = gk.u = gk.d = false;
    if (isGuest) sendIn();
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  $('mp-arrows').addEventListener('click', () => setScheme('arrows'));
  $('mp-wasd').addEventListener('click', () => setScheme('wasd'));
  function refresh() {
    const hosting = !!hostPeer && !isGuest;
    $('mp-host').style.display = hosting ? 'block' : 'none';
    $('mp-id').textContent = sessionId;
    let s = '';
    if (hosting) {
      if (!hostReady) s = 'Connecting to network...';
      else if (guestConn) s = 'Player connected (2/2)';
      else s = 'Open. Share the ID or link and wait for the other player.';
    }
    $('mp-state').textContent = s;
    if (isGuest) {
      setMsg('Connected to ' + currentHost + '. You are the blue Jackie.');
      $('mp-row').style.display = 'none';
    }
  }
  function startHosting() {
    if (hostPeer || isGuest) return;
    if (typeof Peer === 'undefined') { setMsg('PeerJS failed to load (online play unavailable).'); return; }
    sessionId = rid();
    openHostPeer();
    refresh();
    setOpen(true);
  }
  function openHostPeer() {
    hostReady = false;
    const p = new Peer(PREFIX + sessionId, PEER_OPTS);
    hostPeer = p;
    p.on('open', () => { if (hostPeer !== p) return; hostReady = true; refresh(); });
    p.on('error', err => {
      if (hostPeer !== p) return;
      if (err.type === 'unavailable-id') {
        sessionId = rid();
        try { p.destroy(); } catch (e) {}
        openHostPeer();
        refresh();
        return;
      }
      $('mp-state').textContent = 'Network problem: ' + err.type;
    });
    p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
    p.on('connection', onIncoming);
  }
  function stopHosting() {
    if (guestConn) kickGuest('Host switched back to single player');
    const p = hostPeer;
    hostPeer = null; hostReady = false; sessionId = '';
    if (p) setTimeout(() => { try { p.destroy(); } catch (e) {} }, 600);
    refresh();
  }
  function onIncoming(conn) {
    conn.on('open', () => {
      let reason = null;
      if (isGuest) reason = 'This player is a guest in another session.';
      else if (!gameStarted || !isSplit) reason = 'Session is locked. The host must activate the Tiger talisman.';
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
      hp2 = 100;
      hp2V.textContent = '100';
      updateHpBar(hp2Bar, 100);
      hp2Container.style.display = 'block';
      character2.x = character.x + 80;
      character2.y = character.y;
      character2.vx = 0;
      character2.vy = 0;
      character2.invisible = false;
      conn.send({ t: 'accepted' });
      showChiBanner('Player 2 (Red) joined online!');
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
    hp2 = 0;
    hp2V.textContent = '0';
    updateHpBar(hp2Bar, 0);
    hp2Container.style.display = 'none';
    clearTalismanForPlayer(character2);
    if (msg) showChiBanner(msg);
    if (gameStarted && !isGameOver && isSplit && hp <= 0) triggerGameOver();
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
      if (+d.vw > 300 && +d.vw < 10000) { 
        character2.viewW = +d.vw; 
      }
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
      sq: Math.round(c.squish * 100) / 100, act, en,
      sp: (c.isAstral && c.spirit) ? [r1(c.spirit.x), r1(c.spirit.y)] : null   // sheep spirit position
    };
  }
  function sendSnap() {
    if (!guestConn || !guestConn.open) return;
    try {
      guestConn.send({
        t: 'snap', W: canvas.width, H: canvas.height,
        hp, hp2, sgk, ek, dist: Math.round(dist * 100) / 100, b: r1(b),
        c1: packChar(character), c2: packChar(character2),
        e: ems.map(e => [e.id || (e.id = entId++), r1(e.x), r1(e.y), e.fly ? 1 : 0, Math.round(e.anim * 100) / 100]),
        a: arws.map(a => [a.id || (a.id = entId++), r1(a.x), r1(a.y), Math.round(a.ang * 100) / 100]),
        f: fbs.map(f => [f.id || (f.id = entId++), r1(f.x), r1(f.y)]),
        mb: magicBeams, ax: Math.round(mx + camX), ay: Math.round(my),
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
    if (isGuest) return;
    let id = (raw || '').trim();
    const mm = id.match(/join=([A-Za-z0-9-]+)/); if (mm) id = mm[1];
    id = id.toUpperCase().replace(/^JCA-/, '');
    if (!/^[A-Z0-9]{6}$/.test(id)) { setMsg('Invalid session ID.'); return; }
    if (id === sessionId) { setMsg("That's your own session ID."); return; }
    if (guestConn) { setMsg('Someone is already connected to you.'); return; }
    if (typeof Peer === 'undefined') { setMsg('PeerJS failed to load (online play unavailable).'); return; }
    setMsg('Joining ' + id + '...');
    clearTimeout(joinTimer);
    if (joinPeer) { try { joinPeer.destroy(); } catch (e) {} joinPeer = null; }
    const jp = new Peer(PEER_OPTS);
    joinPeer = jp;
    let done = false;
    joinTimer = setTimeout(() => {
      if (!done) { setMsg('No response from host. Check the ID / network (a TURN server may be needed).'); try { jp.destroy(); } catch (e) {} }
    }, 15000);
    jp.on('error', err => {
      if (done) return;
      clearTimeout(joinTimer);
      setMsg(err.type === 'peer-unavailable' ? 'Session not found. The host must activate the Tiger talisman first.' : 'Network problem: ' + err.type);
    });
    jp.on('open', () => {
      const conn = jp.connect(PREFIX + id, { serialization: 'json', reliable: true });
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
    });
  }
  function becomeGuest() {
    stopHosting();
    isGuest = true; gameStarted = true; isSplit = true; isGameOver = false; introOpen = false; enemiesActive = false; remoteP2 = false;
    document.body.classList.add('guest');
    ['start-overlay', 'intro-dialog', 'instructions-dialog', 'go'].forEach(i => { const el = $(i); if (el) el.style.display = 'none'; });
    try { window.speechSynthesis.cancel(); } catch (e) {}
    clearTalismanForPlayer(character);
    clearTalismanForPlayer(character2);
    character.shirtColor = '#dc2626'; character.pantsColor = '#1e3a8a';
    character2.shirtColor = '#2563eb'; character2.pantsColor = '#78350f';
    character.invisible = false; character2.invisible = false;
    keysP1.left = keysP1.right = keysP1.up = keysP1.down = false;
    $('hp1-label').firstChild.nodeValue = '\u2764\uFE0F Partner (Red) \u00a0 \u00a0';
    $('hp2-label').firstChild.nodeValue = '\u2764\uFE0F Me (Blue) \u00a0 \u00a0';
    hp2Container.style.display = 'block';
    b2.style.display = 'none';
    refresh();
    setOpen(false);
    inTimer = setInterval(sendIn, 33);
  }
  function showLost(msg) {
    if (lostShown) return; lostShown = true;
    clearInterval(inTimer);
    const d = document.createElement('div');
    d.id = 'mp-lost';
    const txt = document.createElement('div');
    txt.textContent = String(msg == null ? 'Disconnected' : msg);
    const btn = document.createElement('button');
    btn.textContent = 'Back to menu';
    btn.onclick = () => { location.href = location.href.split('?')[0]; };
    d.appendChild(txt);
    d.appendChild(btn);
    document.body.appendChild(d);
  }
  function applyChar(c, s, kx) {
    const tx = s.x * kx;
    c.tx = tx; c.ty = s.y;
    if (!c._seen || Math.hypot(c.x - tx, c.y - s.y) > 250) { c.x = tx; c.y = s.y; c._seen = true; }
    c.vx = s.vx; c.facing = s.f; c.walkCycle = s.w; c.isJumping = s.j;
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
  function syncList(map, rows, build) {
    const seen = new Set();
    const out = [];
    for (const r of rows) {
      const fresh = build(r);
      seen.add(fresh.id);
      let o = map.get(fresh.id);
      if (o) Object.assign(o, fresh);
      else { o = fresh; o.x = fresh.tx; o.y = fresh.ty; map.set(fresh.id, o); }
      out.push(o);
    }
    for (const k of Array.from(map.keys())) if (!seen.has(k)) map.delete(k);
    return out;
  }
  function applySnap(s) {
    hostW = s.W; hostH = s.H;
    const kx = 1;
    const gx = x => x * kx;
    const gy = y => canvas.height - (s.H - y);
    hp = s.hp; hp2 = s.hp2; sgk = s.sgk; ek = s.ek; dist = s.dist;
    hpV.textContent = Math.round(hp); hp2V.textContent = Math.round(hp2);
    updateHpBar(hp1Bar, hp); updateHpBar(hp2Bar, hp2);
    updateScoreUI();
    applyChar(character, s.c1, kx); applyChar(character2, s.c2, kx);
    [[character, s.c1], [character2, s.c2]].forEach(([c, sc]) => {
      if (sc.sp) {
        c.spTx = gx(sc.sp[0]); c.spTy = gy(sc.sp[1]);
        if (!c.spirit) c.spirit = { x: c.spTx, y: c.spTy };
      } else { c.spirit = null; }
    });
    ems = syncList(ents.e, s.e, r => ({ id: r[0], tx: gx(r[1]), ty: r[2], fly: !!r[3], anim: r[4] }));
    arws = syncList(ents.a, s.a, r => ({ id: r[0], tx: gx(r[1]), ty: gy(r[2]), ang: r[3] }));
    fbs = syncList(ents.f, s.f, r => ({ id: r[0], tx: gx(r[1]), ty: gy(r[2]), radius: 10 }));
    magicBeams = s.mb.map(bm => Object.assign({}, bm, { startX: gx(bm.startX), endX: gx(bm.endX), startY: gy(bm.startY), endY: gy(bm.endY) }));
    gAimX = gx(s.ax); gAimY = gy(s.ay);
    s.fx.forEach(f => {
      if (f[0] === 's') _sp(gx(f[1]), gy(f[2]), f[3] || undefined, f[4] || undefined);
      else if (f[0] === 'f') _ft(f[1], gx(f[2]), gy(f[3]), f[4] || undefined, f[5] || undefined);
      else if (f[0] === 'b') _bn(f[1]);
    });
    if (s.over && !isGameOver) triggerGameOver();
  }
  let lastSm = performance.now();
  (function smoothLoop(now) {
    const dtm = Math.min(now - lastSm, 100);
    lastSm = now;
    if (isGuest) {
      const k = 1 - Math.exp(-dtm / 45);
      [character, character2].forEach(c => {
        if (c.tx !== undefined) { c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; }
        if (c.spirit && c.spTx !== undefined) { c.spirit.x += (c.spTx - c.spirit.x) * k; c.spirit.y += (c.spTy - c.spirit.y) * k; }
      });
      [ems, arws, fbs].forEach(list => list.forEach(o => {
        if (o.tx !== undefined) { o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; }
      }));
    }
    requestAnimationFrame(smoothLoop);
  })(performance.now());
  function hostAim() {
    const hh = hostH || canvas.height;
    return { ax: Math.round(mx + camX), ay: Math.round(hh - (canvas.height - my)) };
  }
  function sendIn() {
    if (!hostConn || !hostConn.open) return;
    try { hostConn.send(Object.assign({ t: 'in', l: gk.l, r: gk.r, u: gk.u, d: gk.d, vw: canvas.width }, hostAim())); } catch (e) {}
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
  window.addEventListener('keydown', e => {
    if (!isGuest) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    const dir = moveKey(e);
    if (dir) {
      const k = DIR[dir];
      if (k === 'u' && !e.repeat && !gk.u && hp2 > 0 && !character2.isFlying && !character2.isJumping) sayHip();
      if (!gk[k]) { gk[k] = true; sendIn(); }
      e.preventDefault();
    } else if ((e.key === 'e' || e.key === 'E' || e.key === 'q' || e.key === 'Q') && !e.repeat) {
      guestLaser();
    } else if (HK[e.key] && !e.repeat) {
      if (hostConn && hostConn.open && !isGameOver) hostConn.send({ t: 'tal', name: HK[e.key] });
    }
    e.stopImmediatePropagation();
  }, true);
  window.addEventListener('keyup', e => {
    if (!isGuest) return;
    if (e.target && e.target.tagName === 'INPUT') return;
    const dir = moveKey(e);
    if (dir) {
      const k = DIR[dir];
      if (gk[k]) { gk[k] = false; sendIn(); }
    }
    e.stopImmediatePropagation();
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
    hostConn.send(Object.assign({ t: 'click' }, hostAim()));
  }, true);
  setInterval(() => {
    if (!isGuest && isSplit !== lastSplit) {
      lastSplit = isSplit;
      if (isSplit) startHosting(); else stopHosting();
    }
    $('mp-join').style.display = guestConn ? 'none' : 'block';
  }, 200);
  setScheme('arrows');
  refresh();
  const qp = (location.search.match(/[?&]join=([A-Za-z0-9-]+)/) || [])[1];
  if (qp) { inputEl.value = qp.toUpperCase().replace(/^JCA-/, ''); joinSession(inputEl.value); }
})();
