MM.random = (function () {
  function r() { return Math.random(); }
  function int(a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(list) { return list[Math.floor(r() * list.length)]; }
  function chance(p) { return r() < p; }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  function sample(list, n) { return shuffle(list).slice(0, n); }

  var DATA = MM.randdata;
  var themeById = {};
  DATA.themes.forEach(function (t) { themeById[t.id] = t; });
  var lockIds = null;
  var cur = { theme: null, noun: null };

  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  function low(w) { return w.charAt(0).toLowerCase() + w.slice(1); }
  function adjPt(a, g) { return g === 'f' ? a[2] : a[1]; }
  function article(n) { return n[2] === 'f' ? 'a ' : 'o '; }
  function de(n) { return n[2] === 'f' ? 'da ' : 'do '; }

  function pickTheme() {
    if (lockIds && lockIds.length) {
      var id = lockIds.length > 1 && !chance(0.75) ? lockIds[1] : lockIds[0];
      return themeById[id];
    }
    return pick(DATA.themes);
  }

  function setTheme(id) { cur.theme = id ? themeById[id] : null; cur.noun = null; }

  function lock(ids) {
    lockIds = ids && ids.length ? ids : null;
    if (!(ids && ids.length)) used = {};
    cur.theme = null;
    cur.noun = null;
  }

  function theme() {
    if (!cur.theme) cur.theme = pickTheme();
    return cur.theme;
  }

  function startItem() {
    cur.theme = pickTheme();
    cur.noun = pick(cur.theme.nouns);
    return cur.theme;
  }

  function syllables(th, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(pick(th.s) + pick(th.e));
    return out;
  }

  function personName(th) {
    var base = pick(th.s) + pick(th.e);
    if (chance(0.25)) base += pick(['a', 'ia', 'us', 'eth', 'on']);
    return cap(base);
  }

  var used = {};

  function name(cat, extra) {
    var res = null;
    for (var i = 0; i < 16; i++) {
      res = nameOnce(cat, extra);
      if (!lockIds) return res;
      var key = cat + ':' + res.en;
      if (!used[key]) { used[key] = 1; return res; }
    }
    return res;
  }

  function nameOnce(cat, extra) {
    var th = startItem();
    var n = cur.noun;
    var adj = pick(th.adj);
    if (cat === 'creature' || cat === 'species') {
      var c = personName(th);
      return { en: c, pt: c };
    }
    if (cat === 'item') {
      var k = DATA.kinds[extra] || ['Relic', 'Relíquia', 'f'];
      if (chance(0.5)) return { en: n[0] + ' ' + k[0], pt: k[1] + ' de ' + n[1] };
      return { en: adj[0] + ' ' + k[0], pt: k[1] + ' ' + low(adjPt(adj, k[2])) };
    }
    var list = DATA.cat[cat] || DATA.cat.trait;
    var cn = pick(list);
    if (cat === 'age') return { en: cn[0] + ' of ' + n[0], pt: cn[1] + ' ' + de(n) + n[1] };
    if (cat === 'group') return { en: cn[0] + ' of ' + n[0], pt: cn[1] + ' ' + de(n) + n[1] };
    if (cat === 'button') return { en: cn[0] + ' ' + n[0], pt: cn[1] + ' ' + de(n) + n[1] };
    var p = r();
    if (p < 0.34) return { en: n[0] + ' ' + cn[0], pt: cn[1] + ' de ' + n[1] };
    if (p < 0.67) return { en: adj[0] + ' ' + cn[0], pt: cn[1] + ' ' + low(adjPt(adj, cn[2])) };
    return { en: cn[0] + ' of ' + n[0], pt: cn[1] + ' ' + de(n) + n[1] };
  }

  function themeFor(nameObj) {
    var txt = (typeof nameObj === 'string' ? nameObj : (nameObj && nameObj.en) || '').toLowerCase();
    if (!txt) return null;
    for (var i = 0; i < DATA.themes.length; i++) {
      var th = DATA.themes[i];
      var hit = null;
      th.nouns.forEach(function (n) { if (txt.indexOf(n[0].toLowerCase()) >= 0) hit = n; });
      if (!hit) th.adj.forEach(function (a) { if (txt.indexOf(a[0].toLowerCase()) >= 0) hit = pick(th.nouns); });
      if (hit) { cur.theme = th; cur.noun = hit; return th; }
    }
    return null;
  }

  function fill(obj, key, cat, extra) {
    var S = MM.store.get();
    var nm = name(cat, extra);
    var o = { en: nm.en };
    (S.locales || []).forEach(function (l) {
      if (l === 'br') o.br = nm.pt;
    });
    obj[key] = o;
    return nm;
  }

  function fillTpl(tpl, n) {
    return {
      en: tpl[0].replace(/\{n\}/g, low(n[0])),
      pt: tpl[1].replace(/\{pde\}/g, de(n) + low(n[1])).replace(/\{pa\}/g, article(n) + low(n[1])).replace(/\{pb\}/g, low(n[1]))
    };
  }

  function descText(cat) {
    var th = theme();
    var n = cur.noun || (cur.noun = pick(th.nouns));
    var pool = (DATA.desc[cat] || []).concat(DATA.desc.any);
    var o = fillTpl(pick(pool), n);
    return o;
  }

  function desc(cat) {
    var d = descText(cat);
    var S = MM.store.get();
    var o = { en: d.en };
    if ((S.locales || []).indexOf('br') >= 0) o.br = d.pt;
    return o;
  }

  var STAT_RANGE = {
    health: [30, 400, 10], damage: [1, 35, 1], armor: [1, 12, 1], speed: [3, 40, 1], attack_speed: [0.2, 2, 0.1], range: [1, 12, 1],
    accuracy: [2, 25, 1], critical_chance: [0.02, 0.35, 0.01], critical_damage_multiplier: [0.2, 1.5, 0.1], lifespan: [5, 120, 5], stamina: [10, 100, 5],
    mana: [10, 100, 5], size: [0.1, 0.8, 0.1], scale: [0.02, 0.1, 0.01], area_of_effect: [1, 8, 1], knockback: [0.1, 1.5, 0.1], targets: [1, 4, 1],
    projectiles: [1, 3, 1], mass: [5, 80, 5], recoil: [0.1, 1, 0.1], throwing_range: [2, 12, 1], offspring: [1, 4, 1], birth_rate: [1, 15, 1],
    maturation: [1, 40, 1], mutation: [1, 12, 1], experience: [1, 30, 1], happiness: [1, 20, 1], opinion: [1, 15, 1], intelligence: [1, 12, 1],
    diplomacy: [1, 12, 1], warfare: [1, 12, 1], stewardship: [1, 12, 1], army: [1, 20, 1], cities: [1, 3, 1], bonus_towers: [1, 3, 1], loyalty_traits: [1, 15, 1]
  };

  function statValue(id, negative) {
    var rg = STAT_RANGE[id];
    var meta = MM.data.statById[id] || { step: 1 };
    var lo;
    var hi;
    var st;
    if (rg) { lo = rg[0]; hi = rg[1]; st = rg[2]; } else { lo = meta.step; hi = meta.step * 10; st = meta.step; }
    var v = lo + r() * (hi - lo);
    v = Math.max(st, Math.round(v / st) * st);
    v = Number(v.toFixed(3));
    return negative ? -v : v;
  }

  function stats(target, min, max, allowNeg) {
    Object.keys(target).forEach(function (k) { delete target[k]; });
    var all = MM.data.stats.map(function (s) { return s.id; });
    var n = int(min || 2, max || 4);
    var th = theme();
    var aff = (th.stats || []).filter(function (x) { return all.indexOf(x) >= 0; });
    var ids = sample(aff, Math.min(aff.length, Math.max(1, Math.round(n * 0.6))));
    sample(all.filter(function (x) { return ids.indexOf(x) < 0; }), Math.max(0, n - ids.length)).forEach(function (x) { ids.push(x); });
    ids.forEach(function (id) {
      var neg = allowNeg && chance(0.2);
      target[id] = statValue(id, neg);
    });
    return target;
  }

  function color() {
    var th = theme();
    var h = Math.floor(th.hue[0] + r() * (th.hue[1] - th.hue[0]));
    h = ((h % 360) + 360) % 360;
    var s = 0.55 + r() * 0.35;
    var l = 0.5 + r() * 0.2;
    var a = s * Math.min(l, 1 - l);
    function f(n) {
      var k = (n + h / 30) % 12;
      var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(c * 255).toString(16).padStart(2, '0');
    }
    return '#' + f(0) + f(8) + f(4);
  }

  function hex(c) {
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }

  function sprite(size, shape, key, dim) {
    if (MM.libraryUI) {
      var lib = MM.libraryUI.random(key || 'icon', dim || '', r);
      if (lib) return lib;
    }
    var n = size || 16;
    var cv = document.createElement('canvas');
    cv.width = n;
    cv.height = n;
    var ctx = cv.getContext('2d');
    var base = hex(color());
    var half = Math.ceil(n / 2);
    var grid = [];
    var y;
    var x;
    for (y = 0; y < n; y++) {
      grid.push([]);
      for (x = 0; x < n; x++) grid[y].push(0);
    }
    var cx = (n - 1) / 2;
    var cy = (n - 1) / 2;
    for (y = 1; y < n - 1; y++) {
      for (x = 1; x < half; x++) {
        var dx = (cx - x) / (n / 2);
        var dy = (cy - y) / (n / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        var p = Math.max(0, 0.95 - d * 1.05);
        if (shape === 'tall') p = Math.max(0, 0.95 - Math.sqrt(dx * dx * 2.6 + dy * dy * 0.7) * 1.05);
        if (r() < p) {
          grid[y][x] = 1;
          grid[y][n - 1 - x] = 1;
        }
      }
    }
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        if (!grid[y][x]) continue;
        var up = y > 0 && grid[y - 1][x] ? 0 : 1;
        var dn = y < n - 1 && grid[y + 1][x] ? 0 : 1;
        var lf = x > 0 && grid[y][x - 1] ? 0 : 1;
        var rt = x < n - 1 && grid[y][x + 1] ? 0 : 1;
        var edge = up + dn + lf + rt > 0;
        var shade = edge ? 0.55 : (up ? 1.18 : (dn ? 0.85 : 1));
        var cr = Math.max(0, Math.min(255, Math.round(base[0] * shade)));
        var cg = Math.max(0, Math.min(255, Math.round(base[1] * shade)));
        var cb = Math.max(0, Math.min(255, Math.round(base[2] * shade)));
        ctx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    var eyeY = Math.floor(n * 0.42);
    var ex = Math.floor(n * 0.33);
    if (grid[eyeY][ex] && grid[eyeY][n - 1 - ex] && chance(0.7)) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ex, eyeY, 1, 1);
      ctx.fillRect(n - 1 - ex, eyeY, 1, 1);
    }
    return cv.toDataURL('image/png');
  }

  return { int: int, pick: pick, chance: chance, shuffle: shuffle, sample: sample, name: name, fill: fill, desc: desc, lock: lock, themeFor: themeFor, theme: theme, startItem: startItem, setTheme: setTheme, themes: function () { return DATA.themes; }, themeById: themeById, syllables: syllables, personName: personName, noun: function () { return cur.noun; }, adj: function () { return pick(theme().adj); }, stats: stats, statValue: statValue, color: color, sprite: sprite, num: function (a, b, step) { var v = a + r() * (b - a); step = step || 1; return Number((Math.round(v / step) * step).toFixed(4)); } };
})();
