MM.stats = (function () {
  var h = MM.h;
  var T = function (pt, en) { return MM.tr(pt, en); };
  var SITE = 'https://agriche.goatcounter.com';
  var LIVE = /(^|\.)agrichex\.github\.io$/.test(location.hostname);
  var timer = null;
  var KEY = 'mm_rand_sig';
  var memo = null;

  function sig() {
    var s = MM.store.exportJson(true);
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) {
      x ^= s.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return (x >>> 0).toString(16) + ':' + s.length;
  }

  function markRandom() {
    memo = sig();
    try { localStorage.setItem(KEY, memo); } catch (e) {}
  }

  function isPure() {
    var ref = memo;
    if (!ref) { try { ref = localStorage.getItem(KEY); } catch (e) {} }
    return !!ref && ref === sig();
  }

  function exported() {
    event('export', 'Export mod');
    if (isPure()) event('export-random', 'Export random mod');
  }

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
      { id: 'visitors', label: T('Visitantes Únicos', 'Unique Visitors') },
      { id: 'visits', label: T('Acessos Totais Ao Site', 'Total Site Visits') },
      { id: 'export', label: T('Mods Exportados', 'Mods Exported') },
      { id: 'manual', label: T('Mods Manuais', 'Manual Mods') },
      { id: 'random', label: T('Mods 100% Aleatórios', '100% Random Mods') }
    ];
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
      Promise.all([fetchCount('TOTAL'), fetchCount('export'), fetchCount('export-random')]).then(function (r) {
        var total = num(r[1].count);
        var random = Math.min(num(r[2].count), total);
        vals.visitors.textContent = fmt(num(r[0].count_unique));
        vals.visits.textContent = fmt(num(r[0].count));
        vals.export.textContent = fmt(total);
        vals.manual.textContent = fmt(total - random);
        vals.random.textContent = fmt(random);
        status.textContent = T('Atualizado às ', 'Updated at ') + new Date().toLocaleTimeString(MM.lang === 'br' ? 'pt-BR' : MM.lang);
      }).catch(function () {
        Object.keys(vals).forEach(function (k) { if (vals[k].textContent === '...') vals[k].textContent = '-'; });
        status.textContent = T('Não foi possível carregar as estatísticas agora.', 'Could not load the statistics right now.');
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
  return { event: event, load: load, markRandom: markRandom, exported: exported };
})();
