/* =========================================================
   main.js — interações do portfólio
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ====== SEUS DADOS (troque aqui) ====== */
  var EMAIL = 'gabrielteixeira2615@gmail.com';
  /* ====================================== */

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------------------------------------------------
     Idioma PT / EN
     --------------------------------------------------------- */
  var T = {
    pt: {
      title: 'Gabriel Carvalho | Portfólio · Engenharia da Computação',
      desc: 'Portfólio de Gabriel Carvalho, estudante de Engenharia da Computação: projetos, certificados e tecnologias.',
      photoAlt: 'Foto de Gabriel Carvalho',
      qrAlt: 'QR code para abrir o LinkedIn de Gabriel Carvalho',
      segAlt: 'Display de sete segmentos com dois dígitos',
      subject: 'Contato pelo portfólio',
      copied: 'E-mail copiado',
      copyFail: 'Não foi possível copiar. Selecione o e-mail manualmente.'
    },
    en: {
      title: 'Gabriel Carvalho | Portfolio · Computer Engineering',
      desc: 'Portfolio of Gabriel Carvalho, Computer Engineering student: projects, certificates and technologies.',
      photoAlt: 'Photo of Gabriel Carvalho',
      qrAlt: 'QR code to open Gabriel Carvalho\'s LinkedIn',
      segAlt: 'Two-digit seven-segment display',
      subject: 'Contact from your portfolio',
      copied: 'Email copied',
      copyFail: 'Could not copy. Please select the email manually.'
    }
  };
  var lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'pt';
  var metaDesc = $('meta[name="description"]');

  function setLang(l, save) {
    lang = l;
    root.setAttribute('data-lang', l);
    root.lang = l === 'pt' ? 'pt-BR' : 'en';
    document.title = T[l].title;
    if (metaDesc) metaDesc.setAttribute('content', T[l].desc);
    $$('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l));
    });
    $$('[data-ph-pt]').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-ph-' + l));
    });
    var photo = $('#photo'); if (photo) photo.alt = T[l].photoAlt;
    var qr = $('#qrImg'); if (qr) qr.alt = T[l].qrAlt;
    var seg = $('#segSvg'); if (seg) seg.setAttribute('aria-label', T[l].segAlt);
    if (save) { try { localStorage.setItem('lang', l); } catch (e) {} }
    placeIndicator();
    layoutRail();
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------------------------------------------------------
     Nome: "decodifica" uma vez ao carregar
     --------------------------------------------------------- */
  function scramble(el, text, duration, delay) {
    var glyphs = '01<>/\\|[]{}=+*#%&';
    var start = performance.now() + delay;
    function tick(now) {
      var t = clamp((now - start) / duration, 0, 1);
      var done = Math.floor(t * text.length);
      var out = text.slice(0, done);
      for (var i = done; i < text.length; i++) {
        out += text.charAt(i) === ' ' ? ' ' : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      }
      el.textContent = t >= 1 ? text : out;
      if (t < 1) requestAnimationFrame(tick);
    }
    el.textContent = text.replace(/[^ ]/g, '0');
    requestAnimationFrame(tick);
  }

  function intro() {
    root.classList.add('go');
    if (reduce) return;
    $$('#name .ln').forEach(function (ln, i) {
      scramble(ln, ln.textContent, 750, 150 + i * 220);
    });
  }
  if (root.classList.contains('js')) {
    var started = false;
    var begin = function () { if (!started) { started = true; intro(); } };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(begin);
      setTimeout(begin, 1200);
    } else {
      begin();
    }
  }

  /* ---------------------------------------------------------
     Painéis: a borda acende perto do cursor
     --------------------------------------------------------- */
  if (finePointer) {
    $$('.panel').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        p.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
      p.addEventListener('pointerleave', function () {
        p.style.removeProperty('--mx');
        p.style.removeProperty('--my');
      });
    });
  }

  /* ---------------------------------------------------------
     Abas do portfólio
     --------------------------------------------------------- */
  var tabs = $$('[role="tab"]');
  var ind = $('.tab-ind');
  function placeIndicator() {
    if (!ind) return;
    var cur = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
    if (!cur) return;
    ind.style.width = cur.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + cur.offsetLeft + 'px)';
  }
  function selectTab(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    placeIndicator();
    if (focus) t.focus();
    layoutRail();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t, false); });
    t.addEventListener('keydown', function (e) {
      var nx = null;
      if (e.key === 'ArrowRight') nx = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') nx = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') nx = tabs[0];
      else if (e.key === 'End') nx = tabs[tabs.length - 1];
      if (nx) { e.preventDefault(); selectTab(nx, true); }
    });
  });

  /* ---------------------------------------------------------
     Demo: display de 7 segmentos (clique nos segmentos)
     --------------------------------------------------------- */
  var segSvg = $('#segSvg');
  if (segSvg) {
    var NS = 'http://www.w3.org/2000/svg';
    var MAP = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
    var TH = 10, LEN = 46;

    function hex(cx, cy, horizontal) {
      var a = LEN / 2, b = TH / 2, p;
      if (horizontal) {
        p = [[cx - a, cy], [cx - a + b, cy - b], [cx + a - b, cy - b], [cx + a, cy], [cx + a - b, cy + b], [cx - a + b, cy + b]];
      } else {
        p = [[cx, cy - a], [cx + b, cy - a + b], [cx + b, cy + a - b], [cx, cy + a], [cx - b, cy + a - b], [cx - b, cy - a + b]];
      }
      return p.map(function (q) { return q[0] + ',' + q[1]; }).join(' ');
    }
    var SEGS = {
      a: hex(32, 6, true), g: hex(32, 56, true), d: hex(32, 106, true),
      f: hex(6, 31, false), b: hex(58, 31, false), e: hex(6, 81, false), c: hex(58, 81, false)
    };

    var digits = [];   // cada dígito: { a: <polygon>, b: ..., ... }
    [18, 98].forEach(function (x0, di) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', 'translate(' + x0 + ',6) skewX(-5)');
      var d = {};
      Object.keys(SEGS).forEach(function (k) {
        var poly = document.createElementNS(NS, 'polygon');
        poly.setAttribute('points', SEGS[k]);
        poly.setAttribute('class', 'seg');
        poly.addEventListener('click', function () {
          poly.classList.toggle('on');
          readout();
        });
        d[k] = poly;
        g.appendChild(poly);
      });
      digits.push(d);
      segSvg.appendChild(g);
    });

    var value = 42;
    function lit(d) {
      return 'abcdefg'.split('').filter(function (k) { return d[k].classList.contains('on'); }).join(' ') || '—';
    }
    function readout() {
      var r0 = $('#rd0'), r1 = $('#rd1');
      if (r0) r0.textContent = lit(digits[0]);
      if (r1) r1.textContent = lit(digits[1]);
    }
    function show(n) {
      value = ((n % 100) + 100) % 100;
      [Math.floor(value / 10), value % 10].forEach(function (num, i) {
        var on = MAP[num];
        Object.keys(digits[i]).forEach(function (k) {
          digits[i][k].classList.toggle('on', on.indexOf(k) !== -1);
        });
      });
      readout();
    }
    show(value);

    var timer = null, auto = $('#segAuto');
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
      if (auto) auto.setAttribute('aria-pressed', 'false');
    }
    $$('[data-seg]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-seg');
        if (act === 'inc') { stopAuto(); show(value + 1); }
        else if (act === 'dec') { stopAuto(); show(value - 1); }
        else if (act === 'reset') { stopAuto(); show(0); }
      });
    });
    if (auto) {
      auto.addEventListener('click', function () {
        if (timer) { stopAuto(); return; }
        auto.setAttribute('aria-pressed', 'true');
        timer = setInterval(function () { show(value + 1); }, 650);
      });
    }
  }

  /* ---------------------------------------------------------
     Copiar e-mail + aviso
     --------------------------------------------------------- */
  var toast = $('#toast'), toastT;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
    return new Promise(function (ok, fail) {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done ? ok() : fail();
    });
  }
  var copyBtn = $('#copyMail');
  if (copyBtn) {
    $('#mailText').textContent = EMAIL;
    copyBtn.addEventListener('click', function () {
      copyText(EMAIL).then(function () { say(T[lang].copied); }, function () { say(T[lang].copyFail); });
    });
  }

  /* ---------------------------------------------------------
     Formulário: abre o app de e-mail com a mensagem pronta
     --------------------------------------------------------- */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var from = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();
      var body = msg + '\n\n' + name + (from ? ' (' + from + ')' : '');
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(T[lang].subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  var toTopBtn = $('#toTop');
  if (toTopBtn) toTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------------------------------------------------------
     Rolagem: cabeçalho, trilho lateral, trajetória
     --------------------------------------------------------- */
  var nav = $('#nav');
  var rail = $('#rail');
  var railLinks = $$('#rail a');
  var navLinks = $$('.nav-links a');
  var secs = ['topo', 'sobre', 'portfolio', 'contato'].map(function (id) { return document.getElementById(id); });

  function layoutRail() {
    if (!rail) return;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    railLinks.forEach(function (a) {
      var s = document.getElementById(a.getAttribute('data-sec'));
      if (!s) return;
      a.style.setProperty('--y', (clamp(s.offsetTop / max, 0, 1) * 100).toFixed(2) + '%');
    });
    update();
  }

  function update() {
    var y = window.pageYOffset || 0;
    var vh = window.innerHeight;
    var max = Math.max(1, root.scrollHeight - vh);
    var prog = clamp(y / max, 0, 1);

    nav.classList.toggle('solid', y > 12);
    if (rail) rail.style.setProperty('--prog', (prog * 100).toFixed(2) + '%');

    var probe = y + vh * 0.35, current = 0, i;
    for (i = 0; i < secs.length; i++) if (secs[i] && secs[i].offsetTop <= probe) current = i;
    if (y >= max - 4) current = secs.length - 1;

    railLinks.forEach(function (a, idx) {
      a.classList.toggle('on', idx === current);
      var s = document.getElementById(a.getAttribute('data-sec'));
      a.classList.toggle('done', !!s && s.offsetTop / max < prog && idx !== current);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + (secs[current] && secs[current].id));
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }
  }, { passive: true });
  window.addEventListener('resize', function () { placeIndicator(); layoutRail(); });
  window.addEventListener('load', function () { placeIndicator(); layoutRail(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeIndicator(); layoutRail(); });

  /* ---------------------------------------------------------
     Rolagem suave (inércia) com a roda do mouse / touchpad.
     - Só age na roda; teclado, barra de rolagem, toque e links
       continuam nativos (e já são suaves via CSS).
     - Desligada com "reduzir movimento".
     --------------------------------------------------------- */
  if (!reduce) {
    var cur = window.pageYOffset, goal = cur, raf = 0, lastT = 0;
    var maxY = function () { return Math.max(0, root.scrollHeight - window.innerHeight); };

    var innerCanScroll = function (el, dy) {
      for (; el && el !== document.body && el !== root; el = el.parentElement) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
          if (dy < 0 && el.scrollTop > 0) return true;
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        }
      }
      return false;
    };

    var step = function (now) {
      var dt = Math.min(50, now - lastT);
      lastT = now;
      goal = clamp(goal, 0, maxY());
      cur += (goal - cur) * (1 - Math.pow(1 - 0.11, dt / 16.67));
      if (Math.abs(goal - cur) < 0.5) { cur = goal; raf = 0; }
      window.scrollTo({ top: cur, behavior: 'instant' });
      if (raf) raf = requestAnimationFrame(step);
    };

    window.addEventListener('wheel', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;   // zoom / rolagem lateral
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (innerCanScroll(e.target, e.deltaY)) return;
      var dy = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (!dy) return;
      e.preventDefault();
      if (!raf) { cur = goal = window.pageYOffset; }
      goal = clamp(goal + dy, 0, maxY());
      if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(step); }
    }, { passive: false });

    // se algo mais rolou a página (teclado, barra, link âncora), acompanha
    window.addEventListener('scroll', function () {
      if (!raf) { cur = goal = window.pageYOffset; }
    }, { passive: true });
  }

  /* início */
  setLang(lang, false);
  placeIndicator();
  if (ind) requestAnimationFrame(function () { ind.classList.add('ready'); });
  layoutRail();
})();
