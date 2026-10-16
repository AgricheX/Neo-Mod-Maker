MM.themes = (function () {
  var registry = {};
  var current = null;

  function register(t) { registry[t.id] = t; }

  function list() { return Object.keys(registry).map(function (k) { return registry[k]; }); }

  function loadAll(ids, done) {
    var left = ids.length;
    if (!left) { done(); return; }
    ids.forEach(function (id) {
      if (registry[id]) { if (--left === 0) done(); return; }
      var s = document.createElement('script');
      s.src = 'themes/' + id + '/theme.js';
      s.onload = s.onerror = function () { if (--left === 0) done(); };
      document.head.appendChild(s);
    });
  }

  function apply(id) {
    var t = registry[id] || list()[0];
    if (!t) return null;
    if (current && registry[current] && registry[current].unmount) registry[current].unmount();
    var link = document.getElementById('theme-css');
    if (!t.inline && !link) {
      link = document.createElement('link');
      link.id = 'theme-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link) link.href = t.css;
    document.documentElement.setAttribute('data-theme', t.id);
    current = t.id;
    try { localStorage.setItem('mm_theme', t.id); } catch (e) {}
    var bg = document.getElementById('bg');
    if (bg && t.mount) t.mount(bg);
    return t;
  }

  function currentId() { return current; }

  function stored() {
    try { return localStorage.getItem('mm_theme'); } catch (e) { return null; }
  }

  return { register: register, list: list, loadAll: loadAll, apply: apply, currentId: currentId, stored: stored };
})();
