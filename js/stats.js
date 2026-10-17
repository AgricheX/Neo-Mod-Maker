MM.stats = (function () {
  var h = MM.h;
  var T = function (pt, en) { return MM.tr(pt, en); };
  var SITE = 'https://agriche.goatcounter.com';
  var LIVE = /(^|\.)agrichex\.github\.io$/.test(location.hostname);
  var EVENTS = [
    { path: 'export', pt: 'Mods exportados', en: 'Mods exported' },
    { path: 'random-mod', pt: 'Mods 100% aleatórios', en: '100% random mods' }
  ];
  var timer = null;

  function load() {
    if (!LIVE || document.getElementById('gc-count')) return;
    window.goatcounter = { no_onload: false };
    var s = document.createElement('script');
    s.id = 'gc-count';
    s.async = true;
    s.setAttribute('data-goatcounter', SITE + '/count');
    s.src = 'https://gc.zgo.at/count.js';
    document.head.appendChild(s);
  }

  function event(path, title) {
    if (!LIVE) return;
    try {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: title || path, event: true });
    } catch (e) {}
  }

  function fetchCount(path) {
    return fetch(SITE + '/counter/' + encodeURIComponent(path) + '.json', { cache: 'no-store' }).then(function (r) {
      if (r.status === 404) return { count: '0', count_unique: '0' };
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    });
  }

  function num(v) {
    var n = parseInt(String(v === undefined ? '0' : v).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }

  function fmt(n) {
    try { return n.toLocaleString(MM.lang === 'br' ? 'pt-BR' : MM.lang); } catch (e) { return String(n); }
  }

  function screen() {
    var root = h('div', { class: 'stack' });
    var panel = h('div', { class: 'panel stats' });
    panel.appendChild(h('h2', { text: T('Estatísticas', 'Statistics') }));
    panel.appendChild(h('p', { text: T('Números públicos do Neo Mod Maker, atualizados quase em tempo real. A contagem é anônima e aproximada: o site só conta visitas e cliques em botões, e o conteúdo dos seus mods nunca sai do navegador.', 'Public Neo Mod Maker numbers, updated almost in real time. The count is anonymous and approximate: the site only counts visits and button clicks, and the content of your mods never leaves the browser.') }));
    var cards = [
      { id: 'visitors', label: T('Visitantes', 'Visitors') },
      { id: 'visits', label: T('Visitas', 'Visits') }
    ].concat(EVENTS.map(function (e) { return { id: e.path, label: T(e.pt, e.en) }; }));
    var grid = h('div', { class: 'stat-grid' });
    var vals = {};
    cards.forEach(function (c) {
      var v = h('strong', { class: 'stat-value', text: '...' });
      vals[c.id] = v;
      grid.appendChild(h('div', { class: 'stat-card' }, v, h('span', { class: 'stat-label', text: c.label })));
    });
    panel.appendChild(grid);
    var status = h('p', { class: 'f-hint2', text: T('Carregando...', 'Loading...') });
    panel.appendChild(status);
    var refresh = h('button', { class: 'btn', type: 'button', text: T('Atualizar', 'Refresh') });
    panel.appendChild(h('div', { class: 'btn-row' }, refresh));
    root.appendChild(panel);

    function run() {
      if (!document.body.contains(panel)) { clearInterval(timer); timer = null; return; }
      var jobs = [fetchCount('TOTAL')].concat(EVENTS.map(function (e) { return fetchCount(e.path); }));
      Promise.all(jobs).then(function (r) {
        vals.visitors.textContent = fmt(num(r[0].count_unique));
        vals.visits.textContent = fmt(num(r[0].count));
        EVENTS.forEach(function (e, i) { vals[e.path].textContent = fmt(num(r[i + 1].count)); });
        status.textContent = T('Atualizado às ', 'Updated at ') + new Date().toLocaleTimeString(MM.lang === 'br' ? 'pt-BR' : MM.lang);
      }).catch(function (err) {
        Object.keys(vals).forEach(function (k) { if (vals[k].textContent === '...') vals[k].textContent = '-'; });
        status.textContent = T('Não foi possível carregar agora. Um bloqueador de anúncios, ou o painel ainda não estar público, pode causar isso.', 'Could not load right now. An ad blocker, or a dashboard that is not public yet, can cause this.') + ' [' + String(err && err.message || err) + ']';
      });
    }
    refresh.addEventListener('click', run);
    setTimeout(run, 0);
    clearInterval(timer);
    timer = setInterval(run, 30000);
    return root;
  }

  MM.ui.screens.stats = screen;
  load();
  return { event: event, load: load };
})();
