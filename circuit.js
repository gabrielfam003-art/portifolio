/* =========================================================
   circuit.js — fundo animado em forma de placa de circuito.
   - Trilhas discretas ocupam a tela inteira (cinza claro sobre fundo branco).
   - Perto do cursor as trilhas acendem em dourado e sinais cinza/dourados
     correm por elas.
   Respeita "reduzir movimento" (sem sinais, sem luz que segue o cursor).
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('circuit');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var STEEL = '128,132,140';       // cinza (trilhas)
  var GRAY = '120,123,130';         // cinza escuro (sinais)
  var GOLD = '196,148,46';         // dourado (brilho e alguns sinais)
  var PAD_FILL = 'rgb(255,255,255)';
  var REACH = 170;                 // raio de influência do cursor (px)
  var MAX_LIVE = coarse ? 7 : 13;  // máximo de sinais ao mesmo tempo

  var W = 0, H = 0, DPR = 1, G = 44;
  var ambient = [];
  var mouse = { x: -9999, y: -9999 };
  var live = 0;
  var startAt = performance.now() + 250;
  var last = performance.now();

  function rnd(n) { return Math.random() * n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- geometria das trilhas ---------- */
  function makeTrace(pts, extra) {
    var cum = [0], total = 0;
    for (var i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      cum.push(total);
    }
    var t = { pts: pts, cum: cum, total: total, glow: 0, sig: null, next: 0, active: true };
    for (var k in extra) t[k] = extra[k];
    return t;
  }

  function pointAt(tr, d) {
    var c = tr.cum, p = tr.pts;
    if (d <= 0) return p[0];
    if (d >= tr.total) return p[p.length - 1];
    for (var i = 1; i < c.length; i++) {
      if (d <= c[i]) {
        var k = (d - c[i - 1]) / (c[i] - c[i - 1] || 1);
        return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k };
      }
    }
    return p[p.length - 1];
  }

  // adiciona ao caminho atual o trecho da trilha entre as distâncias d0 e d1
  function tracePath(tr, d0, d1) {
    var c = tr.cum, p = tr.pts, s = pointAt(tr, d0);
    ctx.moveTo(s.x, s.y);
    for (var i = 1; i < p.length; i++) {
      if (c[i] <= d0) continue;
      if (c[i - 1] >= d1) break;
      if (c[i] < d1) ctx.lineTo(p[i].x, p[i].y);
    }
    var e = pointAt(tr, d1);
    ctx.lineTo(e.x, e.y);
  }

  function distTo(tr, mx, my) {
    var p = tr.pts, best = 1e9;
    for (var i = 1; i < p.length; i++) {
      var ax = p[i - 1].x, ay = p[i - 1].y, dx = p[i].x - ax, dy = p[i].y - ay;
      var l2 = dx * dx + dy * dy || 1;
      var t = clamp(((mx - ax) * dx + (my - ay) * dy) / l2, 0, 1);
      var d = Math.hypot(mx - (ax + t * dx), my - (ay + t * dy));
      if (d < best) best = d;
    }
    return best;
  }

  /* ---------- construção ---------- */
  // caminho de placa: retas ortogonais com curvas chanfradas de 45°
  function walk(x, y, dir, steps) {
    var pts = [{ x: x, y: y }], dx = dir[0], dy = dir[1];
    for (var i = 0; i < steps; i++) {
      var seg = G * (1 + Math.floor(rnd(4)));
      x += dx * seg; y += dy * seg;
      pts.push({ x: x, y: y });
      if (Math.random() < 0.65) {
        var turn = Math.random() < 0.5 ? 1 : -1;
        var ndx = -dy * turn, ndy = dx * turn, c = G * 0.5;
        x += (dx + ndx) * c; y += (dy + ndy) * c;
        pts.push({ x: x, y: y });
        dx = ndx; dy = ndy;
      }
    }
    return pts;
  }

  function buildAmbient() {
    ambient = [];
    var n = Math.round(clamp((W * H) / 24000, 16, 62));
    if (coarse) n = Math.round(n * 0.7);
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var i = 0; i < n; i++) {
      var x = Math.round(rnd(W) / G) * G, y = Math.round(rnd(H) / G) * G;
      var pts = walk(x, y, dirs[Math.floor(rnd(4))], 2 + Math.floor(rnd(4)));
      ambient.push(makeTrace(pts, { active: Math.random() < 0.45, next: 600 + rnd(5000) }));
    }
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    var rebuild = w !== W || Math.abs(h - H) > 140;
    W = w; H = h;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (rebuild) buildAmbient();
  }

  /* ---------- desenho ---------- */
  function pad(tr, a) {
    var e = tr.pts[tr.pts.length - 1];
    ctx.beginPath();
    ctx.arc(e.x, e.y, 3, 0, 6.2832);
    ctx.fillStyle = PAD_FILL;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(' + (tr.glow > 0.05 ? GOLD : STEEL) + ',' + (a + 0.1).toFixed(3) + ')';
    ctx.stroke();
  }

  function drawSignal(tr, s) {
    var third = s.tail / 3;
    var alphas = [0.1, 0.34, 0.85];
    ctx.lineWidth = 2;
    for (var i = 0; i < 3; i++) {
      var t0 = s.d - s.tail + i * third, t1 = t0 + third;
      var a0 = clamp(t0, 0, tr.total), a1 = clamp(t1, 0, tr.total);
      if (a1 - a0 < 0.5) continue;
      var p0 = s.dir > 0 ? a0 : tr.total - a1;
      var p1 = s.dir > 0 ? a1 : tr.total - a0;
      ctx.strokeStyle = 'rgba(' + s.c + ',' + alphas[i] + ')';
      ctx.beginPath();
      tracePath(tr, p0, p1);
      ctx.stroke();
    }
    if (s.d >= 0 && s.d <= tr.total) {
      var h = pointAt(tr, s.dir > 0 ? s.d : tr.total - s.d);
      ctx.fillStyle = 'rgba(' + s.c + ',.14)';
      ctx.beginPath(); ctx.arc(h.x, h.y, 7, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(' + s.c + ',1)';
      ctx.beginPath(); ctx.arc(h.x, h.y, 2, 0, 6.2832); ctx.fill();
    }
  }

  function stepSignal(tr, now, dt) {
    var s = tr.sig;
    if (!s) {
      if (reduce || !tr.active || live >= MAX_LIVE) return;
      var nearby = tr.glow > 0.3 && Math.random() < 0.03;
      if (now >= tr.next || nearby) {
        tr.sig = {
          d: -10,
          v: (150 + rnd(130)) * (nearby ? 1.4 : 1),
          dir: Math.random() < 0.5 ? 1 : -1,
          tail: 70 + rnd(50),
          c: Math.random() < 0.45 ? GOLD : GRAY
        };
        live++;
      }
      return;
    }
    s.d += s.v * dt / 1000;
    if (s.d - s.tail > tr.total) {
      tr.sig = null; live--;
      tr.next = now + 2500 + rnd(7000);
      return;
    }
    drawSignal(tr, s);
  }

  function drawTrace(tr, mx, my, now, dt, base) {
    var dist = distTo(tr, mx, my);
    var target = dist < REACH ? 1 - dist / REACH : 0;
    tr.glow += (target - tr.glow) * 0.14;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(' + STEEL + ',' + base.toFixed(3) + ')';
    ctx.beginPath(); tracePath(tr, 0, tr.total); ctx.stroke();

    if (tr.glow > 0.02) {
      ctx.lineWidth = 1 + tr.glow * 0.9;
      ctx.strokeStyle = 'rgba(' + GOLD + ',' + (tr.glow * 0.42).toFixed(3) + ')';
      ctx.beginPath(); tracePath(tr, 0, tr.total); ctx.stroke();
    }
    pad(tr, base + tr.glow * 0.28);
    stepSignal(tr, now, dt);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(48, now - last);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // luz suave sob o cursor
    if (mouse.x > -999 && !reduce) {
      var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
      g.addColorStop(0, 'rgba(212,166,74,.12)');
      g.addColorStop(1, 'rgba(212,166,74,0)');
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - 260, mouse.y - 260, 520, 520);
    }

    ctx.globalAlpha = reduce ? 1 : clamp((now - startAt + 500) / 1300, 0, 1);
    for (var i = 0; i < ambient.length; i++) {
      drawTrace(ambient[i], mouse.x, mouse.y, now, dt, 0.14);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- eventos ---------- */
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  function away() { mouse.x = -9999; mouse.y = -9999; }
  document.documentElement.addEventListener('mouseleave', away);
  window.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') setTimeout(away, 700); });
  window.addEventListener('pointercancel', away);

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });

  resize();
  requestAnimationFrame(function (t) { last = t; frame(t); });
})();
