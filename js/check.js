MM.check = (function () {
  var NAME = ['Nome', 'Name'];
  var ICON = ['Ícone (imagem ou ícone do jogo)', 'Icon (image or vanilla icon)'];
  var IMG = ['Imagem', 'Image'];

  function has(v) {
    if (v === undefined || v === null) return false;
    if (typeof v === 'object') return Object.keys(v).some(function (k) { return has(v[k]); });
    return String(v).trim() !== '';
  }

  function run(S) {
    var out = [];
    function miss(page, key, idx, title, field) { out.push({ page: page, key: key, idx: idx, title: title, field: field }); }
    function each(page, key, fn) {
      (S[key] || []).forEach(function (e, i) {
        var nm = MM.nm(e.name);
        var title = nm && e.id && nm !== e.id ? nm + ' (' + e.id + ')' : (nm || e.id || '#' + (i + 1));
        fn(e, function (field) { miss(page, key, i, title, field); });
      });
    }

    if (!has(S.meta.name)) miss('mod', null, -1, 'Mod', ['Nome do mod', 'Mod name']);
    if (!has(S.meta.id)) miss('mod', null, -1, 'Mod', ['ID / namespace (sem espaços)', 'ID / namespace (no spaces)']);

    if (!has(S.meta.author)) miss('mod', null, -1, 'Mod', ['Autor', 'Author']);
    if (!has(S.meta.version)) miss('mod', null, -1, 'Mod', ['Versão', 'Version']);

    each('traits', 'traits', function (e, m) {
      if (!has(e.name)) m(NAME);
      if (!has(e.img) && !has(e.icon)) m(ICON);
    });
    each('units', 'units', function (e, m) {
      if (!has(e.name)) m(NAME);
      if (!has(e.img) && !has(e.icon)) m(ICON);
      if (!has(e.body) && !has(e.look)) m(['Corpo andando ou aparência de criatura do jogo', 'Walking body or look of a vanilla creature']);
    });
    each('kingdoms', 'kingdoms', function (e, m) {
      if (!has(e.img) && !has(e.icon)) m(ICON);
    });
    each('items', 'items', function (e, m) {
      if (!has(e.name)) m(NAME);
      if (!has(e.imgIcon)) m(['Ícone do item', 'Item icon']);
      if (MM.gen.tplOf(e.kind).weapon && !has(e.imgSprite)) m(['Sprite da arma na mão', 'Weapon sprite in hand']);
    });
    each('projectiles', 'projectiles', function (e, m) {
      if (!has(e.img) && !has(e.texture)) m(['Imagem ou textura de projétil do jogo', 'Image or vanilla projectile texture']);
    });
    each('disasters', 'disasters', function (e, m) {
      if (!has(e.name)) m(NAME);
      if (!has(e.log)) m(['Mensagem no log', 'World log message']);
      if (!has(e.unit)) m(['Unidade que aparece', 'Spawned unit']);
    });
    each('tab', 'buttons', function (e, m) {
      if (!has(e.name)) m(NAME);
      if (!has(e.img)) m(['Ícone', 'Icon']);
      if (!has(e.unit)) m(['Criatura criada', 'Spawned creature']);
    });
    if ((S.buttons.length || S.powers.length)) {
      if (!has(S.tab.name)) miss('tab', null, -1, MM.tr('Aba', 'Tab'), NAME);
      if (!has(S.tab.img)) miss('tab', null, -1, MM.tr('Aba', 'Tab'), ['Ícone da aba', 'Tab icon']);
    }

    var named = { status: 1, ages: 1, buildings: 1, biomes: 1, resources: 1, spells: 1, laws: 1, achievements: 1, powers: 1, species: 1 };
    var iconed = { status: 'iconVan', ages: 'iconVan', resources: 'iconVan', laws: 'iconVan', achievements: 'iconVan', powers: '', species: '' };
    MM.kinds.defs.forEach(function (d) {
      each(d.key, d.key, function (e, m) {
        if (named[d.key] && !has(e.name)) m(NAME);
        if (d.key in iconed) {
          var alt = iconed[d.key];
          if (!has(e.img) && !(alt && has(e[alt]))) m(alt ? ICON : ['Ícone', 'Icon']);
        }
        if (d.key === 'drops' && !has(e.img) && !has(e.textureVan)) m(IMG);
        if ((d.key === 'buildings' || d.key === 'biomes') && !has(e.baseId)) m(['Base', 'Base']);
        if ((d.key === 'spells' || d.key === 'events') && !has(e.action)) m(['Ação', 'Action']);
        if (d.key === 'clouds' && !has(e.drop)) m(['Drop', 'Drop']);
        if (d.key === 'codes' && !has(e.body)) m(['Código', 'Code']);
      });
    });

    MM.gen.validate(S).forEach(function (msg) {
      if (/ok se for do jogo/.test(msg)) return;
      out.push({ page: null, key: null, idx: -1, title: msg, field: null });
    });
    return out;
  }

  function label(x) {
    if (!x.field) return x.title;
    return x.title + ': ' + MM.tr(x.field[0], x.field[1]);
  }

  function pageOf(x) {
    if (x.page) return x.page;
    var m = /^([a-z]+)/.exec(x.title || '');
    var map = { trait: 'traits', item: 'items', action: 'actions', unit: 'units', kingdom: 'kingdoms', projectile: 'projectiles', disaster: 'disasters', button: 'tab', group: 'groups', setting: 'settings' };
    if (!m) return null;
    if (map[m[1]]) return map[m[1]];
    if (MM.kinds.byKey && MM.kinds.byKey[m[1]]) return m[1];
    return null;
  }

  function autofill(S, seed) {
    var s = seed || 7;
    function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    var done = {};
    MM.img.slots(S).forEach(function (sl) {
      if (sl.fixed || sl.mirror || sl.obj === S.meta) return;
      if (sl.key === 'bodySwim' || sl.key === 'slashImg') return;
      if (has(sl.obj[sl.key])) return;
      var tag = sl.key + '|' + (sl.obj.id || '');
      if (done[tag]) return;
      done[tag] = true;
      MM.libraryUI.fill(sl.obj, sl.key, sl.size, !!sl.fr, rnd);
    });
    return S;
  }

  return { has: has, run: run, label: label, pageOf: pageOf, autofill: autofill };
})();
