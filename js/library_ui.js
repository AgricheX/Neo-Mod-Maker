MM.libraryUI = (function () {
  var h = MM.h;

  function T(pt, en) { return MM.tr(pt, en); }

  var CATS = [
    ['made', ['Feitos para o Neo Mod Maker', 'Made for Neo Mod Maker']],
    ['icons', ['Ícones', 'Icons']],
    ['creatures', ['Criaturas', 'Creatures']],
    ['buildings', ['Prédios', 'Buildings']],
    ['banners', ['Bandeiras', 'Banners']],
    ['weapons', ['Armas', 'Weapons']],
    ['effects', ['Efeitos e projéteis', 'Effects and projectiles']],
    ['boats', ['Barcos', 'Boats']],
    ['tabs', ['Ícones de aba', 'Tab icons']],
    ['ui', ['Interface', 'Interface']],
    ['mods', ['Ícones de mod', 'Mod icons']]
  ];

  var SLOT_GROUP = { b_house: 'house', b_hall: 'hall', b_windmill: 'windmill', b_fdocks: 'fishing_docks', b_docks: 'docks', b_tower: 'watch_tower', b_temple: 'temple', b_library: 'library', b_barracks: 'barracks' };

  function startCat(key, size) {
    if (SLOT_GROUP[key]) return ['buildings', SLOT_GROUP[key]];
    if (key === 'banBg') return ['banners', 'Banner backgrounds'];
    if (key === 'banIcon') return ['banners', 'Banner symbols'];
    if (key === 'imgSprite') return ['weapons', ''];
    if (key === 'body' || key === 'bodySwim') return ['creatures', ''];
    if (key === 'slashImg') return ['effects', 'slashes'];
    if (key === 'fxImg') return ['effects', 'Effects'];
    if (size === '200x200') return ['mods', ''];
    if (size === '66x22') return ['tabs', ''];
    if (key === 'proj' || (key === 'img' && !size)) return ['effects', ''];
    if (key === 'unit') return ['creatures', ''];
    return ['made', ''];
  }

  function src(it) { return 'data:image/png;base64,' + it[5]; }

  function isAnim(it) { return !!(it[7] && it[7].length); }

  function allFrames(it) {
    var a = [src(it)];
    if (isAnim(it)) it[7].forEach(function (b) { a.push('data:image/png;base64,' + b); });
    return a;
  }

  function fill(obj, key, size, anim, rnd) {
    var list = pool(key, size);
    if (!list.length) return false;
    var pick = list;
    if (anim) {
      var an = list.filter(isAnim);
      if (an.length) pick = an;
    }
    var it = pick[Math.floor((rnd ? rnd() : Math.random()) * pick.length)];
    var fr = allFrames(it);
    if (anim) MM.anim.set(obj, key, fr[0], fr.slice(1), it[6] || 6);
    else obj[key] = fr[0];
    return true;
  }

  function fit(it, size, done) {
    var m = /^(\d+)x(\d+)$/.exec(size || '');
    var url = src(it);
    if (!m || (it[0] !== 'made' && it[0] !== 'icons')) { done(url); return; }
    var f = Math.floor(Math.min(Number(m[1]) / it[3], Number(m[2]) / it[4]));
    if (f < 2) { done(url); return; }
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas');
      c.width = it[3] * f;
      c.height = it[4] * f;
      var x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(im, 0, 0, c.width, c.height);
      done(c.toDataURL('image/png'));
    };
    im.src = url;
  }

  function pool(key, size) {
    var lib = MM.library && MM.library.items ? MM.library.items : [];
    var st = startCat(key, size);
    var list = lib.filter(function (it) { return it[0] === st[0] || (st[0] === 'made' && it[0] === 'icons'); });
    if (st[1]) {
      var g = list.filter(function (it) { return it[1] === st[1]; });
      if (g.length) list = g;
    }
    return list;
  }

  function random(key, size, rnd) {
    var list = pool(key, size);
    if (!list.length) return '';
    var it = list[Math.floor((rnd ? rnd() : Math.random()) * list.length)];
    return src(it);
  }

  function open(key, size, done, opts) {
    opts = opts || {};
    var animSlot = !!opts.anim;
    var onlyAnim = animSlot;
    var lib = MM.library && MM.library.items ? MM.library.items : [];
    var start = startCat(key, size);
    var cat = start[0];
    var group = start[1];
    var query = '';
    var overlay = h('div', { class: 'modal-bg' });
    var win = h('div', { class: 'modal panel lib-modal' });
    var tabs = h('div', { class: 'subtabs lib-tabs' });
    var groupSel = h('select', { class: 'lib-group' });
    var search = h('input', { type: 'text', class: 'lib-search', placeholder: T('Buscar por nome', 'Search by name') });
    var grid = h('div', { class: 'lib-grid' });
    var info = h('div', { class: 'lib-info' });
    var onlyBox = h('input', { type: 'checkbox' });
    onlyBox.checked = onlyAnim;
    onlyBox.addEventListener('change', function () { onlyAnim = onlyBox.checked; paintGrid(); });
    var onlyLab = h('label', { class: 'lib-only' }, onlyBox, h('span', { text: T('Só animados', 'Animated only') }));

    function close() { overlay.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('pointerdown', function (e) { if (e.target === overlay) close(); });

    function inCat() { return lib.filter(function (it) { return it[0] === cat; }); }

    function paintGroups() {
      var gs = [];
      inCat().forEach(function (it) { if (gs.indexOf(it[1]) < 0) gs.push(it[1]); });
      groupSel.innerHTML = '';
      groupSel.appendChild(h('option', { value: '', text: T('Todos os grupos', 'All groups') }));
      gs.forEach(function (g) { groupSel.appendChild(h('option', { value: g, text: g })); });
      if (gs.indexOf(group) < 0) group = '';
      groupSel.value = group;
    }

    function paintGrid() {
      grid.innerHTML = '';
      var list = inCat().filter(function (it) {
        return (!group || it[1] === group) && (!onlyAnim || isAnim(it)) && (!query || it[2].toLowerCase().indexOf(query) >= 0 || it[1].toLowerCase().indexOf(query) >= 0);
      });
      list.sort(function (a, b) { return (isAnim(b) ? 1 : 0) - (isAnim(a) ? 1 : 0); });
      info.textContent = list.length + ' ' + T('sprites', 'sprites');
      list.slice(0, 400).forEach(function (it) {
        var b = h('button', { type: 'button', class: 'lib-item', title: it[2] + ' (' + it[3] + 'x' + it[4] + ')' });
        var timg = h('img', { alt: '' });
        MM.anim.attach(timg, allFrames(it), it[6] || 6);
        var box = h('span', { class: 'lib-thumb' }, timg);
        if (isAnim(it)) b.appendChild(h('span', { class: 'lib-badge', text: it[7].length + 1 + 'f' }));
        var big = Math.max(it[3], it[4]);
        var sc = big >= 64 ? 1 : Math.max(1, Math.floor(64 / big));
        box.firstChild.style.width = it[3] * sc + 'px';
        box.firstChild.style.height = it[4] * sc + 'px';
        b.appendChild(box);
        b.appendChild(h('span', { class: 'lib-name', text: it[2] }));
        b.addEventListener('click', function () {
          if (isAnim(it)) {
            var fr = allFrames(it);
            done(fr[0], animSlot ? fr.slice(1) : [], it[6] || 6);
            close();
            return;
          }
          fit(it, size, function (url) { done(url, [], 6); close(); });
        });
        grid.appendChild(b);
      });
      if (inCat().length && list.length > 400) grid.appendChild(h('div', { class: 'f-hint2', text: T('Mostrando os 400 primeiros. Use a busca para filtrar.', 'Showing the first 400. Use search to filter.') }));
    }

    function paintTabs() {
      tabs.innerHTML = '';
      CATS.forEach(function (c) {
        var n = lib.filter(function (it) { return it[0] === c[0]; }).length;
        if (!n) return;
        var b = h('button', { type: 'button', class: 'subtab' + (c[0] === cat ? ' on' : ''), text: T(c[1][0], c[1][1]) });
        b.addEventListener('click', function () { cat = c[0]; group = ''; paintTabs(); paintGroups(); paintGrid(); });
        tabs.appendChild(b);
      });
    }

    groupSel.addEventListener('change', function () { group = groupSel.value; paintGrid(); });
    search.addEventListener('input', function () { query = search.value.trim().toLowerCase(); paintGrid(); });
    var closeBtn = h('button', { type: 'button', class: 'btn', text: T('Fechar', 'Close') });
    closeBtn.addEventListener('click', close);

    win.appendChild(h('h2', { text: T('Biblioteca de sprites', 'Sprite library') }));
    win.appendChild(h('p', { class: 'f-hint2', text: T('Sprites dos mods originais, livres para usar nos seus mods. Os marcados como feitos para o Neo Mod Maker foram criados com base no estilo deles.', 'Sprites from the original mods, free to use in your mods. The ones made for Neo Mod Maker were created based on their style.') }));
    win.appendChild(tabs);
    win.appendChild(h('div', { class: 'lib-bar' }, groupSel, search, onlyLab, info));
    win.appendChild(grid);
    win.appendChild(h('div', { class: 'btn-row px-foot' }, closeBtn));
    overlay.appendChild(win);
    document.body.appendChild(overlay);
    paintTabs();
    paintGroups();
    paintGrid();
  }

  return { open: open, pool: pool, random: random, fill: fill, isAnim: isAnim, frames: allFrames };
})();
