(function () {
  var BASE = 'themes/ocean-of-souls/img/';
  var timer = null;
  var onResize = null;

  function load(name, cb) {
    var im = new Image();
    im.onload = function () { cb(im); };
    im.onerror = function () { cb(null); };
    im.src = (window.MM_IMG && window.MM_IMG[name]) || BASE + name;
  }

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function mix(stops, t) {
    for (var i = 0; i < stops.length - 1; i++) {
      var a = stops[i];
      var b = stops[i + 1];
      if (t >= a[0] && t <= b[0]) {
        var k = (t - a[0]) / (b[0] - a[0] || 1);
        return 'rgb(' + Math.round(lerp(a[1], b[1], k)) + ',' + Math.round(lerp(a[2], b[2], k)) + ',' + Math.round(lerp(a[3], b[3], k)) + ')';
      }
    }
    var l = stops[stops.length - 1];
    return 'rgb(' + l[1] + ',' + l[2] + ',' + l[3] + ')';
  }

  function mount(bg) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scale = 3;
    var ctx = bg.getContext('2d');
    var W;
    var H;
    var base;
    var stars;
    var wisps;
    var starImg = null;
    var wispImg = null;
    var alive = true;

    function build() {
      W = Math.max(80, Math.ceil(window.innerWidth / scale));
      H = Math.max(60, Math.ceil(window.innerHeight / scale));
      bg.width = W;
      bg.height = H;
      base = document.createElement('canvas');
      base.width = W;
      base.height = H;
      var bctx = base.getContext('2d');
      var stops = [[0, 10, 12, 42], [0.35, 34, 28, 92], [0.6, 30, 46, 112], [0.85, 20, 60, 118], [1, 8, 20, 62]];
      for (var y = 0; y < H; y += 2) {
        bctx.fillStyle = mix(stops, y / H);
        bctx.fillRect(0, y, W, 2);
      }
      var r = rng(5);
      stars = [];
      for (var i = 0; i < Math.floor(W * H / 420); i++) {
        stars.push({ x: Math.floor(r() * W), y: Math.floor(r() * H * 0.7), p: r() * 6.28, s: 0.4 + r() * 1.2, big: r() < 0.5 });
      }
      wisps = [];
      for (var j = 0; j < Math.max(6, Math.floor(W / 40)); j++) {
        wisps.push({ x: r() * W, y: r() * H, v: 0.05 + r() * 0.12, p: r() * 6.28, a: 0.35 + r() * 0.5 });
      }
    }

    function frame(t) {
      ctx.globalAlpha = 1;
      ctx.drawImage(base, 0, 0);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.0005 * s.s + s.p));
        ctx.globalAlpha = a;
        if (starImg && s.big) ctx.drawImage(starImg, s.x, s.y);
        else {
          ctx.fillStyle = '#e1e8ff';
          ctx.fillRect(s.x, s.y, 1, 1);
        }
      }
      for (var j = 0; j < wisps.length; j++) {
        var w = wisps[j];
        w.y -= w.v;
        if (w.y < -12) { w.y = H + 12; w.x = Math.random() * W; }
        var wx = Math.round(w.x + Math.sin(t * 0.0008 + w.p) * 2);
        ctx.globalAlpha = w.a;
        if (wispImg) ctx.drawImage(wispImg, wx, Math.round(w.y));
        else {
          ctx.fillStyle = '#bee1ff';
          ctx.fillRect(wx, Math.round(w.y), 1, 2);
        }
      }
      ctx.globalAlpha = 1;
    }

    build();
    frame(0);
    load('star.png', function (im) { starImg = im; });
    load('wisp.png', function (im) { wispImg = im; });
    if (!reduce) timer = setInterval(function () { if (alive) frame(performance.now()); }, 100);
    onResize = function () { build(); frame(performance.now()); };
    window.addEventListener('resize', onResize);
    bg._stop = function () { alive = false; };
  }

  function unmount() {
    clearInterval(timer);
    timer = null;
    if (onResize) window.removeEventListener('resize', onResize);
    onResize = null;
  }

  MM.themes.register({
    id: 'ocean-of-souls',
    name: { pt: 'Ocean of Souls', en: 'Ocean of Souls' },
    css: 'themes/ocean-of-souls/theme.css',
    subtitle: { pt: 'Ocean of Souls', en: 'Ocean of Souls' },
    banner: (window.MM_IMG && window.MM_IMG['banner.png']) || BASE + 'banner.png',
    mount: mount,
    unmount: unmount
  });
})();
