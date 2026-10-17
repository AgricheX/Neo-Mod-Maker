MM.app = (function () {
  var h = MM.h;
  var T = MM.ui.T;
  var page = 'mod';
  try { page = localStorage.getItem('mm_page') || 'mod'; } catch (e) {}

  function buildShell() {
    var root = document.getElementById('app');
    root.innerHTML = '';
    if (!MM.uiLangs.some(function (o) { return o.v === MM.lang; })) MM.lang = 'en';
    MM.applyDir();
    var theme = MM.themes.list().filter(function (t) { return t.id === MM.themes.currentId(); })[0];

    var banner = theme && theme.banner ? h('img', { id: 'banner', src: theme.banner, alt: '' }) : h('canvas', { id: 'banner' });
    var langSel = h('select');
    MM.uiLangs.forEach(function (o) {
      var opt = h('option', { value: o.v, text: o.l });
      if (o.v === MM.lang) opt.selected = true;
      langSel.appendChild(opt);
    });
    langSel.addEventListener('change', function () {
      MM.lang = langSel.value;
      try { localStorage.setItem('mm_lang2', MM.lang); } catch (e) {}
      MM.applyDir();
      render();
    });
    var themeSel = h('select');
    MM.themes.list().forEach(function (t) {
      var opt = h('option', { value: t.id, text: MM.L(t.name) });
      if (t.id === MM.themes.currentId()) opt.selected = true;
      themeSel.appendChild(opt);
    });
    themeSel.addEventListener('change', function () {
      MM.themes.apply(themeSel.value);
      render();
    });

    function hist(fn) {
      return function () {
        if (fn()) render();
      };
    }
    var undoBtn = h('button', { class: 'btn tiny', type: 'button', 'data-nosound': '1', text: T('Desfazer', 'Undo'), title: 'Ctrl+Z' });
    undoBtn.addEventListener('click', function () { MM.sound.play('undo'); hist(MM.store.undo)(); });
    var redoBtn = h('button', { class: 'btn tiny', type: 'button', 'data-nosound': '1', text: T('Refazer', 'Redo'), title: 'Ctrl+Y' });
    redoBtn.addEventListener('click', function () { MM.sound.play('redo'); hist(MM.store.redo)(); });
    var soundBtn = h('button', { class: 'btn tiny', type: 'button' });
    function paintSound() { soundBtn.textContent = MM.sound.enabled() ? T('Som: ligado', 'Sound: on') : T('Som: desligado', 'Sound: off'); }
    paintSound();
    soundBtn.addEventListener('click', function () { MM.sound.set(!MM.sound.enabled()); paintSound(); });
    var titlebar = h('div', { class: 'titlebar' },
      h('div', null,
        h('h1', { text: 'Neo Mod Maker' }),
        h('div', { class: 'sub', text: theme ? MM.L(theme.subtitle) + ' - ' + T('criador de mods para WorldBox (NML)', 'WorldBox mod creator (NML)') : '' })
      ),
      h('div', { class: 'tools' },
        soundBtn,
        undoBtn,
        redoBtn,
        h('label', null, T('Idioma', 'Language'), langSel),
        h('label', null, T('Visual', 'Theme'), themeSel)
      )
    );
    root.appendChild(h('header', { class: 'banner' }, banner, titlebar));
    var nav = h('nav', { id: 'nav' });
    var main = h('main', { id: 'main' });
    root.appendChild(h('div', { class: 'wrap' }, nav, main));
    root.appendChild(h('footer', { class: 'foot', text: T('Neo Mod Maker - Agriche, Dona e Fundadora - co-criado com Claude', 'Neo Mod Maker - Agriche, Owner and Founder - co-created with Claude') }));
    if (theme && theme.paintBanner && !theme.banner) theme.paintBanner(banner);
    paintHud();
  }

  var EYE = '<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" fill="currentColor"><path d="M1 8h1V7h1V6h2V5h6v1h2v1h1v1h1v1h-1v1h-1v1h-2v1H5v-1H3v-1H2V9H1z M6 7h4v4H6z" fill-rule="evenodd"/><path d="M7 8h2v2H7z"/></svg>';
  var EYE_OFF = EYE.replace('</svg>', '<path d="M2 13h2v-1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h1V3h-2v1h-1v1h-1v1h-1v1H9v1H8v1H7v1H6v1H5v1H4v1H3v1H2z" fill="currentColor" stroke="none"/></svg>');
  var hudBtn = null;

  function hudHidden() { return document.documentElement.classList.contains('nohud'); }

  function paintHud() {
    if (!hudBtn) return;
    var hid = hudHidden();
    hudBtn.innerHTML = hid ? EYE : EYE_OFF;
    var label = hid ? T('Mostrar interface', 'Show interface') : T('Ocultar interface', 'Hide interface');
    hudBtn.title = label;
    hudBtn.setAttribute('aria-label', label);
  }

  function initHud() {
    hudBtn = h('button', { type: 'button', id: 'hudbtn' });
    hudBtn.addEventListener('click', function () {
      document.documentElement.classList.toggle('nohud');
      paintHud();
    });
    document.body.appendChild(hudBtn);
    paintHud();
  }

  function renderNav() {
    var nav = document.getElementById('nav');
    nav.innerHTML = '';
    var S = MM.store.get();
    var lastGroup = null;
    var chips = h('div', { class: 'nav-groups' });
    var items = [];
    var chipEls = {};
    var totals = {};
    var curGroup = '';
    MM.ui.order.forEach(function (p) { if (p.id === page) curGroup = MM.ui.groups.filter(function (g) { return g.id === p.group && MM.L(g); }).length ? p.group : ''; });

    function setActive(g) {
      items.forEach(function (it) { it.el.classList.toggle('m-off', it.g !== g); });
      Object.keys(chipEls).forEach(function (k) { chipEls[k].classList.toggle('on', k === g); });
    }

    var modItem = null;
    MM.ui.order.forEach(function (p) {
      var gd = MM.ui.groups.filter(function (g) { return g.id === p.group; })[0];
      var named = !!(gd && MM.L(gd));
      if (p.group !== lastGroup) {
        lastGroup = p.group;
        if (named) {
          nav.appendChild(h('div', { class: 'nav-head', text: MM.L(gd) }));
          var chip = h('button', { type: 'button', class: 'nav-chip' });
          chip.addEventListener('click', function () { setActive(p.group); });
          chipEls[p.group] = chip;
          chip.textContent = MM.L(gd);
          chips.appendChild(chip);
        }
      }
      var b = h('button', { class: 'nav-item' + (p.id === page ? ' on' : ''), type: 'button' }, MM.icons.el(p.id), h('span', { class: 'nav-label', text: MM.L(p) }));
      var key = MM.ui.counts[p.id];
      var cnt = typeof key === 'function' ? key(S) : (key && S[key] ? S[key].length : 0);
      if (cnt) b.appendChild(h('span', { class: 'count', text: String(cnt) }));
      b.addEventListener('click', function () {
        if (p.id === 'forum') MM.forum.open(page);
        go(p.id);
      });
      if (named) {
        totals[p.group] = (totals[p.group] || 0) + cnt;
        items.push({ el: b, g: p.group });
      } else {
        items.push({ el: b, g: '__mod' });
        b.classList.add('nav-solo');
        modItem = b;
      }
      nav.appendChild(b);
    });
    Object.keys(chipEls).forEach(function (k) {
      if (totals[k]) chipEls[k].appendChild(h('span', { class: 'count', text: String(totals[k]) }));
    });
    if (modItem) {
      var modChip = h('button', { type: 'button', class: 'nav-chip' + (page === 'mod' || !MM.ui.screens[page] ? ' on' : ''), text: modItem.textContent.replace(/\d+$/, '') });
      modChip.addEventListener('click', function () { go('mod'); });
      chips.insertBefore(modChip, chips.firstChild);
    }
    nav.insertBefore(chips, nav.firstChild);
    setActive(curGroup);
    if (page === 'mod' || !curGroup) Object.keys(chipEls).forEach(function (k) { chipEls[k].classList.remove('on'); });
  }

  function renderMain() {
    var main = document.getElementById('main');
    main.innerHTML = '';
    var screen = MM.ui.screens[page] || MM.ui.screens.mod;
    main.appendChild(screen());
  }

  function render() {
    buildShell();
    renderNav();
    renderMain();
  }

  function keys() {
    document.addEventListener('keydown', function (ev) {
      if (!(ev.ctrlKey || ev.metaKey)) return;
      var tag = ev.target && ev.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      var k = ev.key.toLowerCase();
      if (k === 'z' && !ev.shiftKey) {
        ev.preventDefault();
        if (MM.store.undo()) render();
      } else if (k === 'y' || (k === 'z' && ev.shiftKey)) {
        ev.preventDefault();
        if (MM.store.redo()) render();
      }
    });
  }

  function boot() {
    keys();
    initHud();
    MM.sound.init();
    MM.kinds.register(MM.ui);
    MM.ui.combineSpecies();
    if (page === 'units') { MM.ui.setSpeciesTab('solo'); page = 'species'; }
    MM.ui.sortOrder();
    MM.themes.loadAll(MM.themeManifest || [], function () {
      var saved = MM.themes.stored();
      MM.themes.apply(saved || 'ocean-of-souls');
      render();
      var timer = null;
      MM.store.onChange(function () {
        clearTimeout(timer);
        timer = setTimeout(renderNav, 200);
      });
    });
  }

  function go(id) {
    if (id === 'units') { MM.ui.setSpeciesTab('solo'); id = 'species'; }
    else if (id === 'species' && arguments[1] === 'civ') MM.ui.setSpeciesTab('civ');
    page = id;
    try { localStorage.setItem('mm_page', page); } catch (e) {}
    renderMain();
    renderNav();
    window.scrollTo(0, 0);
  }

  return { boot: boot, render: render, go: go };
})();

MM.app.boot();
