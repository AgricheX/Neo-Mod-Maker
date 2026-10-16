MM.store = (function () {
  var KEY = 'mm_project_v2';
  var OLD_KEY = 'mm_project_v1';
  var listeners = [];
  var timer = null;
  var warned = false;

  function blank() {
    return {
      v: 2,
      meta: { name: 'My Mod', id: 'MyMod', author: '', version: '1.0.0', description: '', img: '', deps: [], optional: [], incompatible: [] },
      locales: [],
      settingGroups: [{ id: 'general', name: { en: 'General' } }],
      settings: [],
      groups: [],
      traits: [],
      items: [],
      actions: [],
      projectiles: [],
      kingdoms: [],
      units: [],
      disasters: [],
      status: [],
      drops: [],
      ages: [],
      buildings: [],
      biomes: [],
      resources: [],
      spells: [],
      clouds: [],
      species: [],
      laws: [],
      achievements: [],
      powers: [],
      events: [],
      codes: [],
      tab: { id: 'mymod_tab', name: { en: 'My Mod' }, desc: { en: '' }, img: '' },
      buttons: []
    };
  }

  var state = blank();

  function tx(en, pt) {
    var o = { en: en || '' };
    if (pt) o.br = pt;
    return o;
  }

  function migrate(s) {
    function conv(o, from, to, ptKey) {
      if (o[to] === undefined || typeof o[to] !== 'object') o[to] = tx(o[from], o[ptKey]);
      delete o[from];
      delete o[ptKey];
    }
    (s.groups || []).forEach(function (g) { if (g.en !== undefined) conv(g, 'en', 'name', 'pt'); });
    (s.traits || []).forEach(function (t) {
      if (t.en !== undefined) { conv(t, 'en', 'name', 'pt'); conv(t, 'descEn', 'desc', 'descPt'); }
    });
    (s.items || []).forEach(function (t) {
      if (t.en !== undefined) { conv(t, 'en', 'name', 'pt'); conv(t, 'descEn', 'desc', 'descPt'); }
    });
    (s.units || []).forEach(function (t) { if (t.en !== undefined) conv(t, 'en', 'name', 'pt'); });
    (s.disasters || []).forEach(function (t) {
      if (t.en !== undefined) { conv(t, 'en', 'name', 'pt'); conv(t, 'logEn', 'log', 'logPt'); }
    });
    (s.buttons || []).forEach(function (t) {
      if (t.en !== undefined) { conv(t, 'en', 'name', 'pt'); conv(t, 'descEn', 'desc', 'descPt'); }
    });
    if (s.tab && s.tab.en !== undefined) {
      s.tab.name = tx(s.tab.en, s.tab.pt);
      s.tab.desc = tx('');
      delete s.tab.en;
      delete s.tab.pt;
    }
    return s;
  }

  function normalize(s) {
    s = migrate(s);
    var b = blank();
    for (var k in b) if (s[k] === undefined) s[k] = b[k];
    for (var m in b.meta) if (s.meta[m] === undefined) s.meta[m] = b.meta[m];
    s.groups.forEach(function (g) { if (!g.cat) g.cat = 'actor'; });
    s.traits.forEach(function (t) { if (!t.cat) t.cat = 'actor'; if (!t.opposites) t.opposites = []; });
    s.actions.forEach(function (a) { if (a.chanceSetting === undefined) a.chanceSetting = ''; if (a.needLaw === undefined) a.needLaw = ''; });
    s.units.forEach(function (u) { if (!u.spells) u.spells = []; });
    for (var t in b.tab) if (s.tab[t] === undefined) s.tab[t] = b.tab[t];
    return s;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
      if (raw) state = normalize(JSON.parse(raw));
    } catch (e) {}
    snap();
  }

  function save() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e) {
        if (!warned) {
          warned = true;
          MM.toast(MM.tr('O navegador não tem espaço para salvar. Exporte o projeto para não perder o trabalho.', 'The browser has no room to save. Export the project to keep your work.'));
        }
      }
    }, 250);
    queueSnap();
    listeners.forEach(function (fn) { fn(); });
  }

  var hist = [];
  var pos = -1;
  var snapTimer = null;
  var HIST_LIMIT = 30;
  var HIST_BYTES = 60 * 1024 * 1024;

  function snap() {
    clearTimeout(snapTimer);
    snapTimer = null;
    var j = JSON.stringify(state);
    if (pos >= 0 && hist[pos] === j) return;
    hist = hist.slice(0, pos + 1);
    hist.push(j);
    pos = hist.length - 1;
    var total = hist.reduce(function (a, x) { return a + x.length; }, 0);
    while (hist.length > 1 && (hist.length > HIST_LIMIT || total > HIST_BYTES)) {
      total -= hist[0].length;
      hist.shift();
      pos--;
    }
  }

  function queueSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, 600);
  }

  function restore(index) {
    state = normalize(JSON.parse(hist[index]));
    pos = index;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    listeners.forEach(function (fn) { fn(); });
  }

  function undo() {
    if (snapTimer) snap();
    if (pos <= 0) return false;
    restore(pos - 1);
    return true;
  }

  function redo() {
    if (snapTimer) snap();
    if (pos >= hist.length - 1) return false;
    restore(pos + 1);
    return true;
  }

  function use(s) { state = s; }

  function replace(s) {
    if (snapTimer) snap();
    state = normalize(s);
    save();
    snap();
  }

  function reset() {
    if (snapTimer) snap();
    state = blank();
    save();
    snap();
  }

  var SLOTS = 'mm_slots';

  function slotList() {
    try { return JSON.parse(localStorage.getItem(SLOTS) || '[]'); } catch (e) { return []; }
  }

  function slotSave(name) {
    var list = slotList();
    var id = 's' + Date.now().toString(36);
    try {
      localStorage.setItem('mm_slot_' + id, JSON.stringify(state));
      list.push({ id: id, name: name || state.meta.name, time: Date.now() });
      localStorage.setItem(SLOTS, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function slotLoad(id) {
    try {
      var raw = localStorage.getItem('mm_slot_' + id);
      if (!raw) return false;
      replace(JSON.parse(raw));
      return true;
    } catch (e) {
      return false;
    }
  }

  function slotDelete(id) {
    var list = slotList().filter(function (x) { return x.id !== id; });
    try {
      localStorage.removeItem('mm_slot_' + id);
      localStorage.setItem(SLOTS, JSON.stringify(list));
    } catch (e) {}
  }

  function uid(listName, base) {
    var list = state[listName];
    var b = MM.slug(base) || 'item';
    var id = b;
    var n = 2;
    while (list.some(function (x) { return x.id === id; })) id = b + '_' + n++;
    return id;
  }

  function exportJson(withImages) {
    return JSON.stringify(state, function (k, v) {
      if (!withImages && typeof v === 'string' && v.indexOf('data:image') === 0) return undefined;
      return v;
    }, 2);
  }

  return {
    get: function () { return state; },
    load: load,
    save: save,
    replace: replace,
    reset: reset,
    uid: uid,
    blank: blank,
    normalize: normalize,
    onChange: function (fn) { listeners.push(fn); },
    exportJson: exportJson,
    use: use,
    undo: undo,
    redo: redo,
    canUndo: function () { return pos > 0 || !!snapTimer; },
    canRedo: function () { return pos < hist.length - 1; },
    slotList: slotList,
    slotSave: slotSave,
    slotLoad: slotLoad,
    slotDelete: slotDelete
  };
})();

MM.factories = {
  group: function () {
    return { id: MM.store.uid('groups', 'group'), cat: 'actor', name: { en: 'Group' }, color: '#6fa8ff' };
  },
  trait: function () {
    return {
      id: MM.store.uid('traits', 'trait'), cat: 'actor', opposites: [], name: { en: 'Trait' }, desc: { en: '' }, group: '', type: 'Positive', rarity: 'R1_Rare',
      icon: '', img: '', stats: {}, rateBirth: 0, rateGrow: 0, rateInherit: 0, randomAllowed: true, interval: 1,
      act: { attack: '', hit: '', death: '', special: '', growth: '', birth: '' }
    };
  },
  item: function () {
    return {
      id: MM.store.uid('items', 'item'), name: { en: 'Item' }, desc: { en: '' }, kind: 'sword', value: 20, metallic: true, rigidity: 3,
      quality: 'R1_Rare', durability: 100, costGold: 0, costRes: 'common_metals', costAmount: 2, stats: {},
      projectile: '', slash: '', actAttack: '', actSpecial: '', imgIcon: '', imgSprite: ''
    };
  },
  action: function () {
    return { id: MM.store.uid('actions', 'action'), name: 'Action', preset: 'drop', hook: 'attack', chance: 30, chanceSetting: '', needLaw: '', p: { drop: 'bomb', status: 'burning', duration: 10, radius: 10, force: 1.5, intensity: 2, unit: '', count: 1 } };
  },
  projectile: function () {
    return {
      id: MM.store.uid('projectiles', 'projectile'), texture: '', img: '', speed: 20, lookAtTarget: true, trail: false, trailEffect: 'fx_fire_smoke', endEffect: '',
      terraform: '', terraformRange: 0, hitShake: false, hitFreeze: false, animated: false, scaleStart: 0.1, scaleTarget: 0.1,
      soundLaunch: '', soundImpact: ''
    };
  },
  kingdom: function () {
    return { id: MM.store.uid('kingdoms', 'kingdom'), template: '$TEMPLATE_MOB$', icon: '', img: '', color: '#aa44cc', tags: [], friendly: [], enemy: [] };
  },
  unit: function () {
    return {
      id: MM.store.uid('units', 'creature'), name: { en: 'Creature' }, template: '$mob_no_genes$', kingdom: '', size: 'S13_Human', color: '#7a5cff', icon: '', img: '',
      stats: { health: 100, damage: 10, speed: 30, armor: 0, attack_speed: 1, lifespan: 60 },
      traits: '', noBaby: true, actHit: '', spells: []
    };
  },
  disaster: function () {
    return {
      id: MM.store.uid('disasters', 'disaster'), name: { en: 'Disaster' }, log: { en: 'A disaster begins!' }, unit: '', rate: 1, chance: 0.5,
      minPop: 0, minCities: 0, maxExisting: 20, unitsMin: 3, unitsMax: 10, type: 'Other', premium: false, allow: [], forbid: []
    };
  },
  setting: function () {
    return { id: MM.store.uid('settings', 'option'), type: 'SWITCH', group: 'general', name: { en: 'Option' }, desc: { en: '' }, bool: true, int: 50, imin: 0, imax: 100, float: 1, fmin: 0, fmax: 5, text: '' };
  },
  settingGroup: function () {
    return { id: MM.store.uid('settingGroups', 'group'), name: { en: 'Group' } };
  },
  button: function () {
    return { id: MM.store.uid('buttons', 'button'), name: { en: 'Button' }, desc: { en: '' }, unit: '', img: '', rank: 'Rank0_free' };
  }
};

MM.store.load();
