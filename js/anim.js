MM.anim = (function () {
  function frames(obj, key) {
    var a = [];
    if (obj[key]) a.push(obj[key]);
    var x = obj[key + '_x'];
    if (Array.isArray(x)) x.forEach(function (u) { if (u) a.push(u); });
    return a;
  }

  function count(obj, key) { return frames(obj, key).length; }

  function fpsOf(obj, key) {
    var v = Number(obj[key + '_fps']);
    return v > 0 ? v : 6;
  }

  function set(obj, key, url, extra, fps) {
    obj[key] = url || '';
    obj[key + '_x'] = (extra || []).filter(Boolean);
    if (fps > 0) obj[key + '_fps'] = fps;
  }

  function clear(obj, key) {
    obj[key] = '';
    obj[key + '_x'] = [];
  }

  function attach(img, urls, fps) {
    img.src = urls[0] || '';
    if (!urls || urls.length < 2) return;
    var i = 0;
    var t = setInterval(function () {
      if (!img.isConnected) { clearInterval(t); return; }
      i = (i + 1) % urls.length;
      img.src = urls[i];
    }, Math.max(40, Math.round(1000 / (fps || 6))));
  }

  function mk(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  }

  function copy(src) {
    var c = mk(src.width, src.height);
    c.getContext('2d').drawImage(src, 0, 0);
    return c;
  }

  function shift(src, dx, dy) {
    var c = mk(src.width, src.height);
    c.getContext('2d').drawImage(src, dx, dy);
    return c;
  }

  function bright(src, f) {
    var c = copy(src);
    var x = c.getContext('2d');
    var d = x.getImageData(0, 0, c.width, c.height);
    for (var i = 0; i < d.data.length; i += 4) {
      if (!d.data[i + 3]) continue;
      d.data[i] = Math.min(255, d.data[i] * f);
      d.data[i + 1] = Math.min(255, d.data[i + 1] * f);
      d.data[i + 2] = Math.min(255, d.data[i + 2] * f);
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  function whiten(src, a) {
    var c = copy(src);
    var x = c.getContext('2d');
    var d = x.getImageData(0, 0, c.width, c.height);
    for (var i = 0; i < d.data.length; i += 4) {
      if (!d.data[i + 3]) continue;
      d.data[i] = d.data[i] + (255 - d.data[i]) * a;
      d.data[i + 1] = d.data[i + 1] + (255 - d.data[i + 1]) * a;
      d.data[i + 2] = d.data[i + 2] + (255 - d.data[i + 2]) * a;
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  function scaleY(src, sx, sy) {
    var w = src.width;
    var h = src.height;
    var nw = Math.max(1, Math.round(w * sx));
    var nh = Math.max(1, Math.round(h * sy));
    var c = mk(w, h);
    c.getContext('2d').drawImage(src, 0, 0, w, h, Math.round((w - nw) / 2), h - nh, nw, nh);
    return c;
  }

  function rot(src, deg) {
    var c = mk(src.width, src.height);
    var x = c.getContext('2d');
    x.translate(c.width / 2, c.height / 2);
    x.rotate(deg * Math.PI / 180);
    x.drawImage(src, -src.width / 2, -src.height / 2);
    return c;
  }

  function legs(src, dx) {
    var h = src.height;
    var cut = Math.floor(h * 0.7);
    var c = mk(src.width, h);
    var x = c.getContext('2d');
    x.drawImage(src, 0, 0, src.width, cut, 0, 0, src.width, cut);
    x.drawImage(src, 0, cut, src.width, h - cut, dx, cut, src.width, h - cut);
    return c;
  }

  var KINDS = [
    ['walk', ['Andar', 'Walk']],
    ['bob', ['Balançar', 'Bob']],
    ['breathe', ['Respirar', 'Breathe']],
    ['squash', ['Esticar e achatar', 'Squash and stretch']],
    ['float', ['Flutuar', 'Float']],
    ['shake', ['Tremer', 'Shake']],
    ['pulse', ['Pulsar', 'Pulse']],
    ['flash', ['Piscar branco', 'White flash']],
    ['spin', ['Girar', 'Spin']]
  ];

  function gen(kind, src, n) {
    n = Math.max(2, Math.min(12, n || 4));
    var out = [];
    var amp = Math.max(1, Math.round(Math.max(src.width, src.height) / 24));
    for (var i = 0; i < n; i++) {
      var t = i / n;
      var s = Math.sin(t * Math.PI * 2);
      if (kind === 'walk') out.push(shift(legs(src, (i % 2 ? 0 : (i % 4 === 0 ? -amp : amp))), 0, i % 2 ? -amp : 0));
      else if (kind === 'bob') out.push(shift(src, 0, Math.round(-Math.abs(s) * amp)));
      else if (kind === 'breathe') out.push(scaleY(src, 1, 1 + 0.07 * (s + 1) / 2));
      else if (kind === 'squash') out.push(scaleY(src, 1 - 0.12 * s, 1 + 0.12 * s));
      else if (kind === 'float') out.push(shift(src, 0, Math.round(s * amp * 1.5)));
      else if (kind === 'shake') out.push(shift(src, Math.round(s * amp), 0));
      else if (kind === 'pulse') out.push(bright(src, 1 + 0.35 * (s + 1) / 2));
      else if (kind === 'flash') out.push(i === 1 ? whiten(src, 0.85) : copy(src));
      else if (kind === 'spin') out.push(rot(src, i * 360 / n));
      else out.push(copy(src));
    }
    return out;
  }

  function fromUrl(url, cb) {
    var im = new Image();
    im.onload = function () {
      var c = mk(im.naturalWidth, im.naturalHeight);
      c.getContext('2d').drawImage(im, 0, 0);
      cb(c);
    };
    im.onerror = function () { cb(null); };
    im.src = url;
  }

  function urls(canvases) {
    return canvases.map(function (c) { return c.toDataURL('image/png'); });
  }

  return { frames: frames, count: count, fpsOf: fpsOf, set: set, clear: clear, attach: attach, gen: gen, kinds: KINDS, fromUrl: fromUrl, urls: urls };
})();
