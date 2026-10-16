MM.themeFactory = function (cfg) {
  var timer = null;
  var token = 0;
  var onResize = null;

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function color(t) {
    var st = cfg.sky;
    for (var i = 0; i < st.length - 1; i++) {
      var a = st[i];
      var b = st[i + 1];
      if (t >= a[0] && t <= b[0]) {
        var k = (t - a[0]) / (b[0] - a[0] || 1);
        return 'rgb(' + Math.round(lerp(a[1][0], b[1][0], k)) + ',' + Math.round(lerp(a[1][1], b[1][1], k)) + ',' + Math.round(lerp(a[1][2], b[1][2], k)) + ')';
      }
    }
    var l = st[st.length - 1][1];
    return 'rgb(' + l[0] + ',' + l[1] + ',' + l[2] + ')';
  }

  function mount(bg) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scale = cfg.scale || 3;
    var pic = null;
    var mine = ++token;
    var ctx = bg.getContext('2d');
    var W;
    var H;
    var base;
    var parts;
    var alive = true;
    var r;

    function spawn(f, p, init) {
      var c = f.c[Math.floor(r() * f.c.length)];
      p.c = c;
      p.t = f.t;
      p.x = r() * W;
      p.ph = r() * 6.28;
      if (f.t === 'embers') { p.y = init ? r() * H : H + 4; p.vy = -(0.25 + r() * 0.5); p.vx = (r() - 0.5) * 0.15; p.a = 0.5 + r() * 0.5; }
      else if (f.t === 'bubbles') { p.y = init ? r() * H : H + 4; p.vy = -(0.06 + r() * 0.14); p.vx = 0; p.a = 0.3 + r() * 0.5; }
      else if (f.t === 'leaves') { p.y = init ? r() * H : -4; p.vy = 0.08 + r() * 0.16; p.vx = 0.05 + r() * 0.12; p.a = 0.5 + r() * 0.4; }
      else if (f.t === 'snow') { p.y = init ? r() * H : -4; p.vy = 0.12 + r() * 0.22; p.vx = (r() - 0.5) * 0.08; p.a = 0.45 + r() * 0.5; p.big = r() < 0.25; }
      else if (f.t === 'confetti') { p.y = init ? r() * H : -4; p.vy = 0.1 + r() * 0.22; p.vx = (r() - 0.5) * 0.12; p.a = 0.55 + r() * 0.4; }
      else { p.y = r() * H * 0.9; p.vy = 0; p.vx = 0; p.a = 1; p.s = 0.4 + r() * 1.2; }
    }

    function build() {
      W = Math.max(80, Math.ceil(window.innerWidth / scale));
      H = Math.max(60, Math.ceil(window.innerHeight / scale));
      bg.width = W;
      bg.height = H;
      r = rng(5);
      base = document.createElement('canvas');
      base.width = W;
      base.height = H;
      var bctx = base.getContext('2d');
      for (var y = 0; y < H; y += 2) {
        bctx.fillStyle = color(y / H);
        bctx.fillRect(0, y, W, 2);
      }
      if (pic) {
        var k = Math.max(W / pic.width, H / pic.height);
        var pw = pic.width * k;
        var ph = pic.height * k;
        bctx.imageSmoothingEnabled = !cfg.pixel;
        bctx.drawImage(pic, (W - pw) / 2, (H - ph) * (cfg.bgY == null ? 0.5 : cfg.bgY), pw, ph);
        bctx.fillStyle = cfg.bgShade || 'rgba(0,0,0,0.5)';
        bctx.fillRect(0, 0, W, H);
      }
      parts = [];
      var wv = null;
      (cfg.fx || []).forEach(function (f) {
        if (f.t === 'waves') { wv = f; return; }
        var n = Math.max(4, Math.floor(W * H / 700 * (f.n || 1) * (f.t === 'sparkle' ? 1.2 : 0.8)));
        for (var i = 0; i < n; i++) {
          var p = {};
          spawn(f, p, true);
          p.f = f;
          parts.push(p);
        }
      });
      base._waves = wv;
    }

    function plus(x, y, c, a) {
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
      if (a > 0.55) {
        ctx.fillRect(x - 1, y, 1, 1);
        ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1);
        ctx.fillRect(x, y + 1, 1, 1);
      }
    }

    function frame(t) {
      ctx.globalAlpha = 1;
      ctx.drawImage(base, 0, 0);
      var wv = base._waves;
      if (wv) {
        for (var b = 0; b < wv.c.length; b++) {
          var yb = Math.floor(H * 0.78) + b * 7;
          ctx.fillStyle = wv.c[b];
          ctx.globalAlpha = 0.55;
          for (var x = 0; x < W; x += 2) {
            var yy = yb + Math.round(Math.sin(x / 14 + t * 0.0012 * (b % 2 ? -1 : 1) + b) * 2);
            ctx.fillRect(x, yy, 2, H - yy);
          }
        }
      }
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.t === 'sparkle') {
          plus(p.x | 0, p.y | 0, p.c, 0.15 + 0.85 * Math.abs(Math.sin(t * 0.0006 * p.s + p.ph)));
          continue;
        }
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * 0.001 + p.ph) * 0.05;
        if (p.y < -6 || p.y > H + 6 || p.x > W + 6 || p.x < -6) spawn(p.f, p, false);
        ctx.globalAlpha = p.a * (p.t === 'embers' ? 0.6 + 0.4 * Math.sin(t * 0.01 + p.ph) : 1);
        ctx.fillStyle = p.c;
        if (p.t === 'bubbles') {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
          ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, 1, 1);
        } else if (p.t === 'snow') {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.big ? 2 : 1, p.big ? 2 : 1);
        } else if (p.t === 'confetti') {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 1);
        } else {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    build();
    frame(0);
    if (cfg.bg) {
      var im = new Image();
      im.onload = function () { if (!alive || mine !== token) return; pic = im; build(); frame(performance.now()); };
      im.src = (window.MM_IMG && window.MM_IMG[cfg.id + '/' + cfg.bg]) || 'themes/' + cfg.id + '/img/' + cfg.bg;
    }
    if (!reduce) timer = setInterval(function () { if (alive) frame(performance.now()); }, 100);
    onResize = function () { build(); frame(performance.now()); };
    window.addEventListener('resize', onResize);
    bg._stop = function () { alive = false; };
  }

  function unmount() {
    token++;
    clearInterval(timer);
    timer = null;
    if (onResize) window.removeEventListener('resize', onResize);
    onResize = null;
  }

  MM.themes.register({
    id: cfg.id,
    name: cfg.name,
    css: 'themes/' + cfg.id + '/theme.css',
    subtitle: cfg.subtitle,
    banner: (window.MM_IMG && window.MM_IMG[cfg.id + '/' + (cfg.banner || 'banner.png')]) || 'themes/' + cfg.id + '/img/' + (cfg.banner || 'banner.png'),
    mount: mount,
    unmount: unmount
  });
};
