MM.randomMod = function (keepLocales) {
  var R = MM.random;
  var D = MM.data;
  var V = MM.vanilla;
  var S = MM.store.blank();
  var prev = MM.store.get();
  S.locales = (keepLocales ? prev.locales : []).slice();
  var save = MM.store.get();
  MM.store.use(S);
  var mainTheme = R.pick(R.themes());
  R.lock([mainTheme.id, mainTheme.opp]);
  var TH = mainTheme;

  function nameOf(cat, extra) { var o = {}; R.fill({ x: 0 }, 'x', cat, extra); var t = {}; R.fill(t, 'x', cat, extra); return t.x; }
  function setName(obj, key, cat, extra) { R.fill(obj, key, cat, extra); }
  function many(n, fn) { for (var i = 0; i < n; i++) fn(i); }
  function slugOf(txt) { return MM.slug(txt && txt.en) || 'item'; }
  function uidFor(list, txt, fallback) { return MM.store.uid(list, slugOf(txt) || fallback); }
  function rid(list, ids) { return ids.length ? R.pick(ids) : ''; }

  var DUAL = [TH.id, TH.opp];
  R.lock([TH.id]);
  var modName = R.name('mod');
  S.meta.name = modName.en;
  S.meta.id = MM.ident(modName.en);
  S.meta.author = R.name('creature').en;
  S.meta.description = R.desc('mod').en;
  S.meta.img = R.sprite(32, undefined, 'img', '200x200');
  R.lock(DUAL);
  function themeOf(e) { R.themeFor(e.name); return R.theme(); }
  S.meta.img = R.sprite(32, undefined, 'img', '200x200');

  S.settings = [];
  var gen = { id: 'general', name: { en: 'General' } };
  var GENERAL = { de: 'Allgemein', pl: 'Ogólne', cz: '常规', ch: '一般', ko: '일반', ja: '一般', th: 'ทั่วไป', vn: 'Chung', ru: 'Общие', ua: 'Загальні', by: 'Агульныя', es: 'General', br: 'Geral', pt: 'Geral', fr: 'Général', it: 'Generale', ro: 'General', hr: 'Općenito', tr: 'Genel', gr: 'Γενικά', ka: 'ზოგადი', sk: 'Všeobecné', cs: 'Obecné', hu: 'Általános', nl: 'Algemeen', id: 'Umum', sv: 'Allmänt', no: 'Generelt', da: 'Generelt', fa: 'عمومی', ar: 'عام', he: 'כללי', fn: 'Yleiset', ph: 'Pangkalahatan', hi: 'सामान्य', lb: 'Allgemeng', lt: 'Bendra' };
  (S.locales || []).forEach(function (l) { if (l !== 'en') gen.name[l] = GENERAL[l] || gen.name.en; });
  S.settingGroups = [gen];
  var stypes = ['SWITCH', 'INT_SLIDER', 'SLIDER', 'TEXT'];
  many(stypes.length + R.int(0, 1), function (i) {
    var st = MM.factories.setting();
    setName(st, 'name', 'setting');
    st.id = uidFor('settings', st.name, 'option');
    st.desc = R.desc('mod');
    st.type = i < stypes.length ? stypes[i] : 'INT_SLIDER';
    st.text = MM.nm(st.name);
    st.bool = R.chance(0.5);
    st.int = R.int(10, 90);
    st.imin = 0;
    st.imax = 100;
    st.float = Number((1 + R.int(0, 8) * 0.5).toFixed(1));
    st.fmin = 0;
    st.fmax = 5;
    S.settings.push(st);
  });
  var intSettings = S.settings.filter(function (x) { return x.type === 'INT_SLIDER'; });

  function addKind(key, n, before) {
    var def = MM.kinds.byKey[key];
    many(n, function () {
      var e = MM.factories[key]();
      var title = null;
      var hasName = def.fields.some(function (f) { return f.k === 'name'; });
      if (!hasName) title = R.name(def.nm);
      MM.kinds.randomize(def, e, S);
      if (before) before(e, S[key].length);
      if (hasName) title = e.name;
      e.id = MM.store.uid(key, (title ? slugOf(title) : '') || def.base);
      S[key].push(e);
      if (def.imgs) {
        var filled = {};
        def.imgs(e, S).forEach(function (x) {
          if (x.fixed || x.mirror || filled[x.key]) return;
          filled[x.key] = true;
          if (x.fr) MM.libraryUI.fill(x.obj, x.key, x.size, true);
          else x.obj[x.key] = R.sprite(parseInt(x.size, 10) >= 24 ? 24 : 16, undefined, x.key, x.size);
        });
      }
    });
  }

  addKind('status', R.int(2, 3));
  S.status.forEach(function (s) {
    var th = themeOf(s);
    s.remove = R.chance(0.7) ? [th.counter] : [];
    s.opposite = [];
    s.oppositeTraits = [];
  });
  S.status.forEach(function (s, i) {
    var o = S.status[(i + 1) % S.status.length];
    if (o && o !== s) s.opposite = [o.id];
  });
  addKind('drops', 3);
  S.drops.forEach(function (d) {
    d.effect = R.pick(['status', 'status', 'none']);
    if (d.effect === 'status') d.status = rid(null, S.status.map(function (x) { return x.id; }).concat(['burning', 'frozen', 'cursed']));
    if (d.type === 'DropBuilding') d.type = 'DropMagic';
  });

  var hooks = ['attack', 'hit', 'world'];
  var presets = D.actionPresets.map(function (p) { return p.id; }).filter(function (p) { return p !== 'unlock' && p !== 'spawn'; });
  var plist = R.sample(presets, presets.length);
  many(Math.max(plist.length, 6) + R.int(0, 2), function (i) {
    var a = MM.factories.action();
    a.hook = i < 3 ? hooks[i] : R.pick(hooks);
    a.preset = i < plist.length ? plist[i] : R.pick(presets);
    var nm = R.name('action');
    a.name = nm.en;
    a.id = MM.store.uid('actions', MM.slug(nm.en));
    a.chance = R.int(5, 60);
    if (intSettings.length && (i === 0 || R.chance(0.3))) a.chanceSetting = R.pick(intSettings).id;
    a.p.drop = R.chance(0.6) ? R.theme().drop : R.pick(D.drops);
    a.p.status = S.status.length && R.chance(0.6) ? R.pick(S.status).id : R.pick(D.statuses);
    a.p.duration = R.pick([0, 5, 10, 20]);
    a.p.radius = R.int(5, 20);
    a.p.force = R.num(0.5, 4, 0.5);
    a.p.intensity = R.num(1, 4, 0.5);
    S.actions.push(a);
  });
  function actOf(hook) {
    var l = S.actions.filter(function (a) { return a.hook === hook; });
    return l.length ? R.pick(l).id : '';
  }

  many(R.int(2, 3), function () {
    var g = MM.factories.group();
    setName(g, 'name', 'group');
    g.color = R.color();
    g.id = uidFor('groups', g.name, 'group');
    g.cat = 'actor';
    g.color = R.color();
    S.groups.push(g);
  });
  var cats = D.traitCats.map(function (c) { return c.id; });
  many(cats.length + 4 + R.int(0, 2), function (i) {
    var t = MM.factories.trait();
    t.cat = i < 4 ? 'actor' : (i < cats.length + 4 ? cats[i - 4] : R.pick(cats));
    setName(t, 'name', 'trait');
    t.id = uidFor('traits', t.name, 'trait');
    t.desc = R.desc('trait');
    var gs = S.groups.filter(function (g) { return g.cat === t.cat; });
    t.group = gs.length && R.chance(0.7) ? R.pick(gs).id : R.pick(D.traitGroupsVanilla[t.cat] || ['miscellaneous']);
    t.type = R.pick(['Positive', 'Positive', 'Negative', 'Other']);
    t.rarity = R.pick(D.rarities).id;
    R.stats(t.stats, 1, 4, t.type === 'Negative');
    if (t.cat === 'actor') {
      if (R.chance(0.4)) t.act.attack = actOf('attack');
      if (R.chance(0.3)) t.act.hit = actOf('hit');
      if (R.chance(0.3)) t.act.death = actOf('world');
    }
    t.img = R.sprite(16, undefined, 'icon');
    S.traits.push(t);
  });
  S.traits.forEach(function (t) {
    var peers = S.traits.filter(function (x) { return x.cat === t.cat && x.id !== t.id; });
    if (peers.length && R.chance(0.25)) t.opposites = [R.pick(peers).id];
  });
  var actorTraits = S.traits.filter(function (t) { return t.cat === 'actor'; });
  if (actorTraits.length > 1 && !actorTraits[0].opposites.length) actorTraits[0].opposites = [actorTraits[1].id];
  [['attack', 'attack'], ['hit', 'hit'], ['death', 'world'], ['special', 'world'], ['growth', 'world'], ['birth', 'world']].forEach(function (k, i) {
    if (actorTraits.some(function (t) { return t.act[k[0]]; })) return;
    var t = actorTraits[i % actorTraits.length];
    if (t) t.act[k[0]] = actOf(k[1]);
  });
  S.groups.forEach(function (g, i) {
    if (S.traits.some(function (t) { return t.group === g.id; })) return;
    var t = actorTraits[i % actorTraits.length];
    if (t) t.group = g.id;
  });

  var launch = ['event:/SFX/WEAPONS/WeaponFireballStart', 'event:/SFX/WEAPONS/WeaponGreenOrbStart', 'event:/SFX/WEAPONS/WeaponRedOrbStart', 'event:/SFX/WEAPONS/WeaponFreezeOrbStart', 'event:/SFX/WEAPONS/WeaponPlasmaBallStart'];
  var impact = ['event:/SFX/WEAPONS/WeaponFireballLand', 'event:/SFX/WEAPONS/WeaponGreenOrbLand', 'event:/SFX/WEAPONS/WeaponRedOrbLand', 'event:/SFX/WEAPONS/WeaponFreezeOrbLand', 'event:/SFX/WEAPONS/WeaponPlasmaBallLand'];
  many(R.int(2, 3), function (i) {
    var p = MM.factories.projectile();
    R.startItem();
    p.id = MM.store.uid('projectiles', MM.slug(R.noun()[0]) + '_' + R.pick(['orb', 'shard', 'bolt', 'spark', 'wisp']));
    p.speed = R.int(10, 30);
    p.trail = i === 0 || R.chance(0.5);
    p.hitShake = i === 1 || R.chance(0.3);
    p.hitFreeze = i === 2;
    p.endEffect = R.pick(['fx_explosion_small', 'fx_firebomb_explosion']);
    p.soundLaunch = R.pick(launch);
    p.soundImpact = R.pick(impact);
    if (i === 0) { p.terraform = 'plasma_ball'; p.terraformRange = 1; }
    p.scaleStart = R.num(0.08, 0.15, 0.01);
    p.scaleTarget = R.num(0.1, 0.25, 0.01);
    if (!MM.libraryUI.fill(p, 'img', '', true)) p.img = R.sprite(8, undefined, 'proj');
    S.projectiles.push(p);
  });

  var kinds = D.itemTemplates.map(function (x) { return x.id; });
  var bows = [];
  many(kinds.length + R.int(0, 2), function (i) {
    var it = MM.factories.item();
    it.kind = i < kinds.length ? kinds[i] : R.pick(kinds);
    setName(it, 'name', 'item', it.kind);
    it.id = uidFor('items', it.name, 'item');
    it.desc = R.desc('item');
    it.value = R.int(10, 80);
    it.rigidity = R.int(1, 8);
    it.metallic = R.chance(0.5);
    it.costRes = R.pick(D.costResources.filter(function (x) { return x !== 'none'; }));
    it.costAmount = R.int(1, 4);
    it.quality = R.pick(D.rarities).id;
    R.stats(it.stats, 1, 3, false);
    var tpl = MM.gen.tplOf(it.kind);
    if (tpl.weapon) {
      it.actAttack = actOf('attack');
      if (!tpl.melee && S.projectiles.length) { it.projectile = S.projectiles[bows.length % S.projectiles.length].id; bows.push(it); }
      it.imgSprite = R.sprite(16, undefined, 'imgSprite');
      MM.libraryUI.fill(it, 'slashImg', '', true);
    }
    if (i === 0 || R.chance(0.4)) it.actSpecial = actOf('world');
    it.imgIcon = R.sprite(16, undefined, 'imgIcon');
    S.items.push(it);
  });
  var seen = {};
  S.items.forEach(function (it) {
    var full = MM.gen.itemFullId(S, it);
    if (seen[full]) it.id = MM.store.uid('items', it.id + '_x');
    seen[full] = true;
  });

  var tags = D.kingdomTags;
  many(R.int(2, 3), function () {
    var k = MM.factories.kingdom();
    var kn = R.name('kingdom');
    k.id = MM.store.uid('kingdoms', MM.slug(kn.en) || 'kingdom');
    k.template = R.pick(D.kingdomTemplates).id;
    k.color = R.color();
    k.tags = R.sample(tags, R.int(1, 2));
    k.friendly = [k.id];
    k.enemy = R.sample(['civ', 'good', 'evil', 'everyone'], R.int(0, 2));
    k.img = R.sprite(16, undefined, 'icon');
    S.kingdoms.push(k);
  });

  addKind('spells', R.int(1, 2));
  addKind('species', R.int(1, 2), function (e) { e.ownStyle = true; });
  S.spells.forEach(function (sp) { sp.action = actOf('attack'); });

  many(Math.max(3, S.kingdoms.length) + R.int(0, 2), function (i) {
    var u = MM.factories.unit();
    setName(u, 'name', 'creature');
    u.id = uidFor('units', u.name, 'creature');
    u.kingdom = S.kingdoms[i % S.kingdoms.length].id;
    u.template = R.pick(D.unitTemplates).id;
    u.size = R.pick(D.actorSizes.slice(3, 15));
    u.color = R.color();
    u.stats = {};
    R.stats(u.stats, 3, 5, false);
    if (!u.stats.health) u.stats.health = R.int(60, 300);
    if (!u.stats.damage) u.stats.damage = R.int(5, 25);
    if (!u.stats.speed) u.stats.speed = R.int(15, 40);
    var ts = S.traits.filter(function (t) { return t.cat === 'actor'; });
    u.traits = R.sample(ts, R.int(1, 2)).map(function (t) { return t.id; }).join(',');
    if (S.spells.length) u.spells = [R.pick(S.spells).id];
    u.actHit = actOf('hit');
    u.img = R.sprite(16, undefined, 'unit');
    MM.libraryUI.fill(u, 'body', '', true);
    MM.libraryUI.fill(u, 'bodySwim', '', true);
    S.units.push(u);
  });

  var spawnAct = MM.factories.action();
  spawnAct.name = 'Summon ' + MM.nm(S.units[0].name);
  spawnAct.id = MM.store.uid('actions', 'summon_' + S.units[0].id);
  spawnAct.hook = 'attack';
  spawnAct.preset = 'spawn';
  spawnAct.chance = R.int(5, 15);
  spawnAct.p.unit = S.units[0].id;
  spawnAct.p.count = R.int(1, 2);
  S.actions.push(spawnAct);
  var sword = S.items.filter(function (it) { return it.kind === 'sword'; })[0];
  if (sword) sword.actAttack = spawnAct.id;
  many(R.int(1, 2), function () {
    var d = MM.factories.disaster();
    setName(d, 'name', 'disaster');
    d.id = uidFor('disasters', d.name, 'disaster');
    d.log = { en: d.name.en + ' arrives!' };
    (S.locales || []).forEach(function (l) { if (l !== 'en') d.log[l] = R.tr(l, 'log', d.name[l] || d.name.en) || d.log.en; });
    d.unit = R.pick(S.units.concat(S.species || [])).id;
    d.chance = R.num(0.1, 0.8, 0.05);
    d.minPop = R.pick([0, 100, 300, 600]);
    d.minCities = R.int(0, 4);
    d.unitsMin = R.int(2, 5);
    d.unitsMax = d.unitsMin + R.int(2, 6);
    d.allow = R.sample(D.ages, R.int(1, 2));
    S.disasters.push(d);
  });

  addKind('clouds', 1);
  S.clouds.forEach(function (c) {
    var th = themeOf(c);
    var own = S.drops.filter(function (d) { return R.themeFor(d.name) === th; });
    c.drop = own.length && R.chance(0.6) ? own[0].id : th.drop;
    c.lightning = th.id === 'storm';
    c.color = R.color();
  });
  addKind('ages', 1);
  S.ages.forEach(function (a) {
    var th = themeOf(a);
    var own = S.clouds.filter(function (c) { return R.themeFor(c.name) === th; }).map(function (x) { return x.id; });
    a.clouds = own.concat([th.cloud]);
    a.biomes = [];
    if (S.actions.length && R.chance(0.5)) a.special = actOf('world');
  });
  addKind('biomes', 1);
  S.biomes.forEach(function (b) {
    b.units = R.sample(S.units.map(function (u) { return u.id; }), 2).concat(R.sample(['wolf', 'fox', 'sheep', 'rabbit'], 2));
    b.baseId = themeOf(b).biome;
  });
  S.ages.forEach(function (a) { if (S.biomes.length) a.biomes = [S.biomes[0].id]; });
  S.disasters.forEach(function (d) { S.ages.forEach(function (a) { if (d.allow.indexOf(a.id) < 0) d.allow.push(a.id); }); });
  var freeProj = S.projectiles.filter(function (p) { return !S.items.some(function (it) { return it.projectile === p.id; }); });
  addKind('buildings', Math.max(R.int(1, 2), freeProj.length));
  S.buildings.forEach(function (b, bi) {
    b.baseId = R.pick(['bonfire', 'tent_human', 'house_human_0', 'watch_tower_human']);
    if (S.drops.length) b.spawnDrop = R.pick(S.drops).id;
    b.spawnUnit = R.pick(S.units.concat(S.species || [])).id;
    if (S.projectiles.length) b.towerProj = (freeProj[bi] || R.pick(S.projectiles)).id;
  });
  addKind('resources', R.int(1, 2));
  addKind('laws', 1);
  S.laws.forEach(function (l) { l.onChange = actOf('world'); });
  addKind('achievements', 1);
  if (S.achievements.length) {
    var ua = MM.factories.action();
    ua.name = 'Unlock ' + S.achievements[0].id;
    ua.id = MM.store.uid('actions', 'unlock_' + S.achievements[0].id);
    ua.hook = 'world';
    ua.preset = 'unlock';
    ua.chance = 100;
    ua.p.achievement = S.achievements[0].id;
    S.actions.push(ua);
    var tr = S.traits.filter(function (t) { return t.cat === 'actor'; })[0];
    if (tr && !tr.act.birth) tr.act.birth = ua.id;
  }
  addKind('powers', R.int(2, 3));
  S.powers.forEach(function (p, i) {
    p.kind = i === 0 ? 'drop' : (i === 1 ? 'click' : R.pick(['drop', 'click']));
    var th = themeOf(p);
    var own = S.drops.filter(function (d) { return R.themeFor(d.name) === th; });
    p.drop = own.length ? own[0].id : th.drop;
    p.action = actOf('world');
    if (p.kind === 'click' && !p.action) p.kind = 'drop';
    p.rank = 'Rank0_free';
  });
  var evDef = MM.kinds.byKey.events.fields.filter(function (f) { return f.k === 'event'; })[0];
  addKind('events', evDef.o.length, function (e, i) { e.event = evDef.o[i % evDef.o.length][0]; });
  var SAFE = { shake: 1, status: 1, teleport: 1 };
  function safeWorld() {
    var l = S.actions.filter(function (a) { return a.hook === 'world' && SAFE[a.preset]; });
    if (!l.length) {
      var a = MM.factories.action();
      a.hook = 'world';
      a.preset = 'shake';
      var nm = R.name('action');
      a.name = nm.en;
      a.id = MM.store.uid('actions', MM.slug(nm.en));
      a.chance = R.int(10, 40);
      a.p.intensity = R.num(1, 3, 0.5);
      S.actions.push(a);
      return a.id;
    }
    return R.pick(l).id;
  }
  S.events.forEach(function (e, i) {
    var any = actOf('world');
    var act = S.actions.filter(function (a) { return a.id === any; })[0];
    if (act && !SAFE[act.preset]) {
      e.action = any;
      e.unit = R.pick(S.units.concat(S.species || [])).id;
    } else {
      e.action = act ? any : safeWorld();
      if (R.chance(0.4)) e.unit = R.pick(S.units.concat(S.species || [])).id;
    }
    e.chance = R.pick([20, 40, 100]);
  });
  S.events = S.events.filter(function (e) { return e.action; });

  S.drops.forEach(function (d, i) {
    if (i === 0) { d.effect = 'status'; d.status = S.status.length ? S.status[0].id : 'burning'; d.duration = R.pick([5, 10]); }
    else if (i === 1) { d.effect = 'spawn'; d.unit = R.pick(S.units.concat(S.species || [])).id; d.count = R.int(1, 3); }
    else if (i === 2) { d.effect = 'action'; d.action = actOf('world'); if (!d.action) d.effect = 'none'; }
  });

  MM.kinds.defs.forEach(function (def) {
    (S[def.key] || []).forEach(function (e) {
      def.fields.forEach(function (f) {
        if (f.t !== 'act' || e[f.k]) return;
        if (f.when && !f.when(e, S)) return;
        e[f.k] = actOf(f.hook);
      });
    });
  });

  addKind('codes', 1, function (e) {
    e.mode = 'init';
    e.body = 'UnityEngine.Debug.Log("' + String(S.meta.name).replace(/["\\]/g, '') + ' loaded");';
  });

  R.lock([TH.id]);
  S.tab.id = MM.slug(S.meta.id) + '_tab';
  setName(S.tab, 'name', 'mod');
  S.tab.desc = R.desc('mod');
  S.tab.img = R.sprite(22, undefined, 'img', '66x22');
  S.units.concat(S.species).forEach(function (u) {
    var b = MM.factories.button();
    b.id = MM.store.uid('buttons', 'spawn_' + u.id);
    b.name = { en: MM.nm(u.name) };
    (S.locales || []).forEach(function (l) { if (l !== 'en') b.name[l] = u.name[l] || b.name.en; });
    b.desc = R.desc('creature');
    b.unit = u.id;
    b.img = R.sprite(24, undefined, 'icon');
    S.buttons.push(b);
  });

  var out = JSON.parse(JSON.stringify(S));
  MM.store.use(save);
  R.lock(null);
  return out;
};
