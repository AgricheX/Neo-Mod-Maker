MM.gen = (function () {
  var cs = MM.csv;
  var D = MM.data;

  function actionById(S, id) {
    for (var i = 0; i < S.actions.length; i++) if (S.actions[i].id === id) return S.actions[i];
    return null;
  }

  function settingById(S, id) {
    for (var i = 0; i < S.settings.length; i++) if (S.settings[i].id === id) return S.settings[i];
    return null;
  }

  function actionRef(S, id) {
    return actionById(S, id) ? 'Actions.A_' + id : null;
  }

  function statLines(varName, stats, indent) {
    var out = [];
    Object.keys(stats || {}).forEach(function (k) {
      var v = stats[k];
      if (v === '' || v === null || v === undefined || isNaN(Number(v))) return;
      out.push(indent + varName + '.base_stats[' + cs(k) + '] = ' + MM.num(v) + ';');
    });
    return out;
  }

  function actionMethod(a, S) {
    var sig;
    var head;
    if (a.hook === 'attack') {
      sig = 'public static bool A_' + a.id + '(BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile = null)';
      head = ['BaseSimObject o = pTarget;', 'WorldTile t = pTarget != null ? pTarget.current_tile : pTile;'];
    } else if (a.hook === 'hit') {
      sig = 'public static bool A_' + a.id + '(BaseSimObject pSelf, BaseSimObject pAttackedBy = null, WorldTile pTile = null)';
      head = ['BaseSimObject o = pSelf;', 'WorldTile t = pSelf != null ? pSelf.current_tile : pTile;'];
    } else {
      sig = 'public static bool A_' + a.id + '(BaseSimObject pTarget = null, WorldTile pTile = null)';
      head = ['BaseSimObject o = pTarget;', 'WorldTile t = pTarget != null ? pTarget.current_tile : pTile;'];
    }
    var p = a.p || {};
    var body = [];
    if (a.preset !== 'unlock') body.push('if (t == null) return false;');
    if (a.needLaw) body.push('if (AssetManager.world_laws_library.get(' + cs(a.needLaw) + ') == null || !AssetManager.world_laws_library.get(' + cs(a.needLaw) + ').isEnabled()) return false;');
    var chance = Number(a.chance);
    var linked = a.chanceSetting ? settingById(S, a.chanceSetting) : null;
    if (linked && linked.type === 'INT_SLIDER') body.push('if (!Randy.randomChance(ModSettings.' + MM.pascal(linked.id) + ' / 100f)) return false;');
    else if (chance < 100) body.push('if (!Randy.randomChance(' + MM.num(Math.max(0, chance) / 100) + ')) return false;');
    switch (a.preset) {
      case 'drop':
        body.push('World.world.drop_manager.spawn(t, ' + cs(p.drop) + ', 15f, -1f, -1L);');
        break;
      case 'status':
        body.push('if (o == null || !o.isActor() || !o.isAlive()) return false;');
        body.push('o.addStatusEffect(' + cs(p.status) + ', ' + MM.num(p.duration) + ');');
        break;
      case 'lightning':
        body.push('MapBox.spawnLightningMedium(t);');
        break;
      case 'fire':
        body.push('ActionLibrary.castFire(o, o, t);');
        break;
      case 'tornado':
        body.push('ActionLibrary.castTornado(o, o, t);');
        break;
      case 'teleport':
        body.push('if (o == null || !o.isActor() || !o.isAlive()) return false;');
        body.push('ActionLibrary.teleportRandom(o, o, t);');
        break;
      case 'force':
        body.push('World.world.applyForceOnTile(t, ' + MM.int(p.radius) + ', ' + MM.num(p.force) + ', true, 0, null, o, null, false);');
        break;
      case 'shake':
        body.push('World.world.startShake(0.3f, 0.01f, ' + MM.num(p.intensity) + ', false, true);');
        break;
      case 'unlock':
        if (!p.achievement) body.push('return false;');
        else body.push('AssetManager.achievements.get(' + cs(p.achievement) + ')?.check();');
        break;
      case 'spawn':
        if (!p.unit) {
          body.push('return false;');
        } else {
          body.push('for (int i = 0; i < ' + MM.int(Math.max(1, p.count)) + '; i++)');
          body.push('{');
          body.push('\tWorld.world.units.spawnNewUnit(' + cs(p.unit) + ', t, true, true, 3f);');
          body.push('}');
        }
        break;
    }
    body.push('return true;');
    var lines = ['\t' + sig, '\t{'];
    head.concat(body).forEach(function (l) { lines.push('\t\t' + l.replace(/\n/g, '\n\t\t')); });
    lines.push('\t}');
    return lines.join('\n');
  }

  function genActions(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Actions', '\t{'];
    S.actions.forEach(function (a, i) {
      out.push(actionMethod(a, S).replace(/^/gm, '\t'));
      if (i < S.actions.length - 1) out.push('');
    });
    out.push('\t}', '}');
    return out.join('\n') + '\n';
  }

  function catOf(id) { return D.traitCatById[id] || D.traitCatById.actor; }

  function genGroups(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class TraitGroups', '\t{', '\t\tpublic static void Init()', '\t\t{'];
    S.groups.forEach(function (g) {
      var c = catOf(g.cat);
      out.push('\t\t\tAssetManager.' + c.glib + '.add(new ' + c.gcls);
      out.push('\t\t\t{');
      out.push('\t\t\t\tid = ' + cs(g.id) + ',');
      out.push('\t\t\t\tname = ' + cs('trait_group_' + g.id) + ',');
      out.push('\t\t\t\tcolor = ' + cs(g.color));
      out.push('\t\t\t});');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function traitIconPath(tr) {
    var c = catOf(tr.cat);
    return c.folder + '/' + tr.id;
  }

  function traitGroupOf(tr) {
    var g = String(tr.group || '').trim();
    if (g === 'misc') g = 'miscellaneous';
    return g || D.traitGroupDefault[tr.cat] || 'miscellaneous';
  }

  function genTraits(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Traits', '\t{', '\t\tpublic static void Init()', '\t\t{'];
    S.traits.forEach(function (tr, idx) {
      var c = catOf(tr.cat);
      var actor = c.id === 'actor';
      if (idx) out.push('');
      out.push('\t\t\t{');
      out.push('\t\t\t\t' + c.cls + ' t = new ' + c.cls + '();');
      out.push('\t\t\t\tt.id = ' + cs(tr.id) + ';');
      out.push('\t\t\t\tt.path_icon = ' + cs(tr.img ? traitIconPath(tr) : (tr.icon || traitIconPath(tr))) + ';');
      out.push('\t\t\t\tt.group_id = ' + cs(traitGroupOf(tr)) + ';');
      out.push('\t\t\t\tt.rarity = Rarity.' + tr.rarity + ';');
      if (actor) {
        out.push('\t\t\t\tt.type = TraitType.' + tr.type + ';');
        if (Number(tr.rateBirth) > 0) out.push('\t\t\t\tt.rate_birth = ' + MM.int(tr.rateBirth) + ';');
        if (Number(tr.rateGrow) > 0) out.push('\t\t\t\tt.rate_acquire_grow_up = ' + MM.int(tr.rateGrow) + ';');
        if (Number(tr.rateInherit) > 0) out.push('\t\t\t\tt.rate_inherit = ' + MM.int(tr.rateInherit) + ';');
      }
      if (!tr.randomAllowed) out.push('\t\t\t\tt.spawn_random_trait_allowed = false;');
      out.push('\t\t\t\tAssetManager.' + c.lib + '.add(t);');
      statLines('t', tr.stats, '\t\t\t\t').forEach(function (l) { out.push(l); });
      (tr.opposites || []).forEach(function (o) { out.push('\t\t\t\tt.addOpposite(' + cs(o) + ');'); });
      if (actor) {
        var act = tr.act || {};
        var map = { attack: 'action_attack_target', hit: 'action_get_hit', death: 'action_death', special: 'action_special_effect', growth: 'action_growth', birth: 'action_birth' };
        Object.keys(map).forEach(function (k) {
          var ref = act[k] ? actionRef(S, act[k]) : null;
          if (ref) out.push('\t\t\t\tt.' + map[k] + ' = ' + ref + ';');
        });
        if (act.special && actionRef(S, act.special)) out.push('\t\t\t\tt.special_effect_interval = ' + MM.num(tr.interval || 1) + ';');
      }
      out.push('\t\t\t}');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function itemFullId(S, it) {
    var tpl = tplOf(it.kind);
    return tpl.prefix + '_' + it.id;
  }

  function tplOf(kind) {
    for (var i = 0; i < D.itemTemplates.length; i++) if (D.itemTemplates[i].id === kind) return D.itemTemplates[i];
    return D.itemTemplates[0];
  }

  function genItems(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Items', '\t{', '\t\tpublic static void Init()', '\t\t{', '\t\t\tEquipmentAsset t;'];
    S.items.forEach(function (it) {
      var tpl = tplOf(it.kind);
      var full = itemFullId(S, it);
      out.push('');
      out.push('\t\t\tt = AssetManager.items.clone(' + cs(full) + ', ' + cs(tpl.tpl) + ');');
      out.push('\t\t\tt.material = ' + cs(it.id) + ';');
      out.push('\t\t\tt.translation_key = ' + cs('item_' + full) + ';');
      out.push('\t\t\tt.path_icon = ' + cs('item/' + full) + ';');
      out.push('\t\t\tt.equipment_value = ' + MM.int(it.value) + ';');
      out.push('\t\t\tt.rigidity_rating = ' + MM.int(it.rigidity) + ';');
      if (it.metallic) out.push('\t\t\tt.metallic = true;');
      out.push('\t\t\tt.quality = Rarity.' + it.quality + ';');
      out.push('\t\t\tt.durability = ' + MM.int(it.durability) + ';');
      if (it.costRes && it.costRes !== 'none') out.push('\t\t\tt.setCost(' + MM.int(it.costGold) + ', ' + cs(it.costRes) + ', ' + MM.int(it.costAmount) + ');');
      else if (Number(it.costGold) > 0) out.push('\t\t\tt.setCost(' + MM.int(it.costGold) + ');');
      if (tpl.weapon) {
        out.push('\t\t\tt.path_gameplay_sprite = ' + cs('items/weapons/w_' + full) + ';');
        out.push('\t\t\tt.gameplay_sprites = SpriteTextureLoader.getSpriteList(t.path_gameplay_sprite);');
        if (MM.anim.count(it, 'slashImg')) out.push('\t\t\tt.path_slash_animation = ' + cs('effects/slashes/' + full) + ';');
        else if (it.slash) out.push('\t\t\tt.path_slash_animation = ' + cs('effects/slashes/' + it.slash) + ';');
        if (!tpl.melee && it.projectile) out.push('\t\t\tt.projectile = ' + cs(it.projectile) + ';');
      }
      statLines('t', it.stats, '\t\t\t').forEach(function (l) { out.push(l); });
      var a1 = it.actAttack ? actionRef(S, it.actAttack) : null;
      var a2 = it.actSpecial ? actionRef(S, it.actSpecial) : null;
      if (a1) out.push('\t\t\tt.action_attack_target = ' + a1 + ';');
      if (a2) out.push('\t\t\tt.action_special_effect = ' + a2 + ';');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function genProjectiles(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Projectiles', '\t{', '\t\tpublic static void Init()', '\t\t{'];
    S.projectiles.forEach(function (p) {
      out.push('\t\t\tAssetManager.projectiles.add(new ProjectileAsset');
      out.push('\t\t\t{');
      out.push('\t\t\t\tid = ' + cs(p.id) + ',');
      out.push('\t\t\t\ttexture = ' + cs(p.img ? p.id : (String(p.texture || '').trim() || p.id)) + ',');
      out.push('\t\t\t\tspeed = ' + MM.num(p.speed) + ',');
      var pframes = MM.anim.count(p, 'img');
      out.push('\t\t\t\tanimated = ' + (p.animated || pframes > 1 ? 'true' : 'false') + ',');
      if (pframes > 1) out.push('\t\t\t\tanimation_speed = ' + MM.num(MM.anim.fpsOf(p, 'img')) + ',');
      out.push('\t\t\t\tlook_at_target = ' + (p.lookAtTarget ? 'true' : 'false') + ',');
      out.push('\t\t\t\tscale_start = ' + MM.num(p.scaleStart) + ',');
      out.push('\t\t\t\tscale_target = ' + MM.num(p.scaleTarget) + ',');
      if (p.trail) {
        out.push('\t\t\t\ttrail_effect_enabled = true,');
        out.push('\t\t\t\ttrail_effect_id = ' + cs(p.trailEffect || 'fx_fire_smoke') + ',');
      }
      if (p.endEffect) out.push('\t\t\t\tend_effect = ' + cs(p.endEffect) + ',');
      if (p.terraform) {
        out.push('\t\t\t\tterraform_option = ' + cs(p.terraform) + ',');
        out.push('\t\t\t\tterraform_range = ' + MM.int(p.terraformRange) + ',');
      }
      if (p.hitShake) out.push('\t\t\t\thit_shake = true,');
      if (p.hitFreeze) out.push('\t\t\t\thit_freeze = true,');
      if (p.soundLaunch) out.push('\t\t\t\tsound_launch = ' + cs(p.soundLaunch) + ',');
      if (p.soundImpact) out.push('\t\t\t\tsound_impact = ' + cs(p.soundImpact) + ',');
      out.push('\t\t\t});');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function genKingdoms(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Kingdoms', '\t{', '\t\tpublic static void Init()', '\t\t{', '\t\t\tKingdomAsset t;'];
    S.kingdoms.forEach(function (k) {
      out.push('');
      out.push('\t\t\tt = AssetManager.kingdoms.clone(' + cs(k.id) + ', ' + cs(k.template) + ');');
      if (k.img || k.icon) out.push('\t\t\tt.setIcon(' + cs(k.img ? 'kingdom/' + k.id : k.icon) + ');');
      if (k.color) out.push('\t\t\tt.default_kingdom_color = ColorAsset.tryMakeNewColorAsset(' + cs(k.color) + ');');
      k.tags.forEach(function (x) { out.push('\t\t\tt.addTag(' + cs(x) + ');'); });
      k.friendly.forEach(function (x) { out.push('\t\t\tt.addFriendlyTag(' + cs(x) + ');'); });
      k.enemy.forEach(function (x) { out.push('\t\t\tt.addEnemyTag(' + cs(x) + ');'); });
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function unitFolder(u) { return u.template === '$animal$' ? 'animals' : 'other'; }

  function seqNames(prefix, n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(cs(prefix + i));
    return a.join(', ');
  }

  function genUnits(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Units', '\t{', '\t\tpublic static void Init()', '\t\t{', '\t\t\tActorAsset t;'];
    S.units.forEach(function (u) {
      out.push('');
      out.push('\t\t\tt = AssetManager.actor_library.clone(' + cs(u.id) + ', ' + cs(u.template) + ');');
      out.push('\t\t\tt.name_locale = ' + cs(u.id) + ';');
      out.push('\t\t\tt.actor_size = ActorSize.' + u.size + ';');
      out.push('\t\t\tt.shadow = false;');
      out.push('\t\t\tt.use_phenotypes = false;');
      if (u.color) out.push('\t\t\tt.color_hex = ' + cs(u.color) + ';');
      if (u.img) out.push('\t\t\tt.icon = ' + cs('unit_' + u.id) + ';');
      else if (u.icon) out.push('\t\t\tt.icon = ' + cs(u.icon) + ';');
      if (u.kingdom) out.push('\t\t\tt.kingdom_id_wild = ' + cs(u.kingdom) + ';');
      if (u.noBaby) out.push('\t\t\tt.has_baby_form = false;');
      out.push('\t\t\tif (t.can_turn_into_zombie) t.setCanTurnIntoZombieAsset("zombie", false);');
      var nb = MM.anim.count(u, 'body');
      if (nb) {
        out.push('\t\t\tt.texture_id = ' + cs(u.id) + ';');
        if (unitFolder(u) === 'other') out.push('\t\t\tt.unit_other = true;');
        out.push('\t\t\tt.animation_walk = new string[] { ' + seqNames('walk_', nb) + ' };');
        var ns2 = MM.anim.count(u, 'bodySwim');
        out.push('\t\t\tt.animation_swim = new string[] { ' + (ns2 ? seqNames('swim_', ns2) : seqNames('walk_', nb)) + ' };');
        out.push('\t\t\tt.animation_walk_speed = ' + MM.num(MM.anim.fpsOf(u, 'body')) + ';');
        out.push('\t\t\tt.has_advanced_textures = false;');
        out.push('\t\t\tt.texture_asset = null;');
        out.push('\t\t\tAssetManager.actor_library.loadTexturesAndSprites(t);');
      } else {
        out.push('\t\t\tLook(t, ' + cs(String(u.look || '').trim() || 'wolf') + ');');
      }
      statLines('t', u.stats, '\t\t\t').forEach(function (l) { out.push(l); });
      String(u.traits || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (x) {
        out.push('\t\t\tt.addTrait(' + cs(x) + ');');
      });
      if (u.actHit && actionRef(S, u.actHit)) out.push('\t\t\tt.action_get_hit = ' + actionRef(S, u.actHit) + ';');
      if (u.spells && u.spells.length) {
        u.spells.forEach(function (x) { out.push('\t\t\tt.addSpell(' + cs(x) + ');'); });
        out.push('\t\t\tif (t.spells == null) t.spells = new SpellHolder();');
        out.push('\t\t\tt.spells.mergeWith(t.spell_ids);');
      }
    });
    out.push('\t\t}');
    out.push('', '\t\tstatic void Look(ActorAsset t, string pFrom)', '\t\t{',
      '\t\t\tActorAsset f = AssetManager.actor_library.get(pFrom);',
      '\t\t\tif (f == null || f.texture_asset == null) f = AssetManager.actor_library.get("wolf");',
      '\t\t\tt.texture_asset = f.texture_asset;',
      '\t\t\tt.has_advanced_textures = f.has_advanced_textures;',
      '\t\t\tt.animation_walk = f.animation_walk;',
      '\t\t\tt.animation_swim = f.animation_swim;',
      '\t\t\tt.animation_idle = f.animation_idle;',
      '\t\t\tt.animation_walk_speed = f.animation_walk_speed;',
      '\t\t\tt.animation_swim_speed = f.animation_swim_speed;',
      '\t\t}');
    out.push('\t}', '}');
    return out.join('\n') + '\n';
  }

  function genDisasters(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class Disasters', '\t{', '\t\tpublic static void Init()', '\t\t{', '\t\t\tDisasterAsset t;'];
    S.disasters.forEach(function (d) {
      out.push('');
      out.push('\t\t\tif (!AssetManager.world_log_library.has(' + cs('disaster_' + d.id) + '))');
      out.push('\t\t\t{');
      out.push('\t\t\t\tWorldLogAsset lg = AssetManager.world_log_library.clone(' + cs('disaster_' + d.id) + ', "$basic_disaster$");');
      out.push('\t\t\t\tlg.locale_id = ' + cs('disaster_' + d.id) + ';');
      out.push('\t\t\t\tlg.path_icon = "ui/Icons/iconTornado";');
      out.push('\t\t\t}');
      out.push('\t\t\tt = new DisasterAsset();');
      out.push('\t\t\tt.id = ' + cs(d.id) + ';');
      out.push('\t\t\tt.rate = ' + MM.int(d.rate) + ';');
      out.push('\t\t\tt.chance = ' + MM.num(d.chance) + ';');
      out.push('\t\t\tt.world_log = ' + cs('disaster_' + d.id) + ';');
      out.push('\t\t\tt.min_world_population = ' + MM.int(d.minPop) + ';');
      out.push('\t\t\tt.min_world_cities = ' + MM.int(d.minCities) + ';');
      out.push('\t\t\tt.type = DisasterType.' + d.type + ';');
      if (d.premium) out.push('\t\t\tt.premium_only = true;');
      out.push('\t\t\tt.spawn_asset_unit = ' + cs(d.unit) + ';');
      out.push('\t\t\tt.max_existing_units = ' + MM.int(d.maxExisting) + ';');
      out.push('\t\t\tt.units_min = ' + MM.int(d.unitsMin) + ';');
      out.push('\t\t\tt.units_max = ' + MM.int(d.unitsMax) + ';');
      d.allow.forEach(function (x) { out.push('\t\t\tt.ages_allow.Add(' + cs(x) + ');'); });
      d.forbid.forEach(function (x) { out.push('\t\t\tt.ages_forbid.Add(' + cs(x) + ');'); });
      out.push('\t\t\tt.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;');
      out.push('\t\t\tAssetManager.disasters.add(t);');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function genTab(S, ns) {
    var tab = S.tab;
    var out = [
      'using System;',
      'using System.IO;',
      'using NeoModLoader.General;',
      'using NeoModLoader.General.UI.Tab;',
      'using NeoModLoader.utils;',
      'using UnityEngine;',
      '',
      'namespace ' + ns,
      '{',
      '\tpublic static class ModTab',
      '\t{',
      '\t\tpublic static PowersTab tab;',
      '',
      '\t\tprivate static Sprite Load(string folder, string file)',
      '\t\t{',
      '\t\t\tstring path = Path.Combine(folder, file);',
      '\t\t\treturn File.Exists(path) ? SpriteLoadUtils.LoadSingleSprite(path) : null;',
      '\t\t}',
      '',
      '\t\tpublic static void Init(string folder)',
      '\t\t{',
      '\t\t\tPowerLibrarySetup.Init();',
      '\t\t\tSprite fallback = SpriteTextureLoader.getSprite("ui/icons/iconSteam");',
      '\t\t\tSprite tabIcon = Load(folder, ' + cs('GameResources/tab/' + tab.id + '.png') + ') ?? fallback;',
      '\t\t\ttry',
      '\t\t\t{',
      '\t\t\t\ttab = TabManager.CreateTab(' + cs(tab.id) + ', ' + cs(tab.id) + ', ' + cs(tab.id + ' Description') + ', tabIcon);',
      '\t\t\t}',
      '\t\t\tcatch (Exception)',
      '\t\t\t{',
      '\t\t\t\ttab = PowerButtonCreator.GetTab(PowerTabNames.Other);',
      '\t\t\t}',
      '\t\t\tif (tab == null) return;'
    ];
    S.buttons.concat(S.powers).forEach(function (b) {
      out.push('\t\t\tPowerButtonCreator.AddButtonToTab(PowerButtonCreator.CreateGodPowerButton(' + cs(b.id) + ', Load(folder, ' + cs('GameResources/button/' + b.id + '.png') + ') ?? fallback), tab);');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function genPowers(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class PowerLibrarySetup', '\t{', '\t\tpublic static void Init()', '\t\t{', '\t\t\tGodPower t;'];
    S.buttons.forEach(function (b) {
      out.push('');
      out.push('\t\t\tt = AssetManager.powers.clone(' + cs(b.id) + ', "$template_spawn_actor$");');
      out.push('\t\t\tt.name = ' + cs(b.id) + ';');
      out.push('\t\t\tt.actor_asset_id = ' + cs(b.unit) + ';');
      out.push('\t\t\tt.rank = PowerRank.' + b.rank + ';');
      out.push('\t\t\tt.path_icon = ' + cs('button/' + b.id) + ';');
      out.push('\t\t\tif (!AssetManager.powers.has(' + cs(b.unit) + ') && AssetManager.actor_library.has(' + cs(b.unit) + ')) AssetManager.actor_library.get(' + cs(b.unit) + ').power_id = ' + cs(b.id) + ';');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function genMain(S, ns, parts) {
    var out = ['using NeoModLoader.api;', '', 'namespace ' + ns, '{', '\tpublic class Main : BasicMod<Main>', '\t{', '\t\tprotected override void OnModLoad()', '\t\t{'];
    parts.forEach(function (p) { out.push('\t\t\t' + p + (p === 'ModTab' ? '.Init(GetDeclaration().FolderPath);' : '.Init();')); });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function prefix(S) { return MM.slug(S.meta.id) || 'mod'; }

  function settingKey(S, st) { return prefix(S) + '_cfg_' + st.id; }

  function settingGroupKey(S, gid) { return prefix(S) + '_group_' + gid; }

  function genSettings(S, ns) {
    var out = ['namespace ' + ns, '{', '\tpublic static class ModSettings', '\t{'];
    S.settings.forEach(function (st) {
      var n = MM.pascal(st.id);
      if (st.type === 'SWITCH') out.push('\t\tpublic static bool ' + n + ' = ' + (st.bool ? 'true' : 'false') + ';');
      else if (st.type === 'INT_SLIDER') out.push('\t\tpublic static int ' + n + ' = ' + MM.int(st.int) + ';');
      else if (st.type === 'SLIDER') out.push('\t\tpublic static float ' + n + ' = ' + MM.num(st.float) + ';');
      else out.push('\t\tpublic static string ' + n + ' = ' + cs(st.text) + ';');
    });
    S.settings.forEach(function (st) {
      var n = MM.pascal(st.id);
      var t = st.type === 'SWITCH' ? 'bool' : st.type === 'INT_SLIDER' ? 'int' : st.type === 'SLIDER' ? 'float' : 'string';
      out.push('');
      out.push('\t\tinternal static void ' + n + 'CallBack(' + t + ' value)');
      out.push('\t\t{');
      out.push('\t\t\t' + n + ' = value;');
      out.push('\t\t}');
    });
    out.push('\t}', '}');
    return out.join('\n') + '\n';
  }

  function configJson(S, ns) {
    var cfg = {};
    S.settingGroups.forEach(function (g) {
      var items = S.settings.filter(function (st) { return st.group === g.id; });
      if (!items.length) return;
      cfg[settingGroupKey(S, g.id)] = items.map(function (st) {
        var e = { Id: settingKey(S, st), Type: st.type };
        if (st.type === 'SWITCH') e.BoolVal = !!st.bool;
        else if (st.type === 'INT_SLIDER') { e.IntVal = Math.round(Number(st.int)); e.MinIntVal = Math.round(Number(st.imin)); e.MaxIntVal = Math.round(Number(st.imax)); }
        else if (st.type === 'SLIDER') { e.FloatVal = Number(st.float); e.MinFloatVal = Number(st.fmin); e.MaxFloatVal = Number(st.fmax); }
        else e.TextVal = st.text || '';
        e.Callback = ns + '.ModSettings:' + MM.pascal(st.id) + 'CallBack';
        return e;
      });
    });
    return JSON.stringify(cfg, null, 2);
  }

  function localeFiles(S) {
    var langs = ['en'].concat((S.locales || []).filter(function (l) { return l !== 'en'; }));
    var files = {};
    langs.forEach(function (lang) {
      var d = {};
      function put(key, textObj, fallbackEmpty) {
        var v = textObj && textObj[lang];
        if (v === undefined || v === null || v === '') {
          if (lang !== 'en') return;
          v = '';
        }
        d[key] = v;
      }
      S.groups.forEach(function (g) { put('trait_group_' + g.id, g.name); });
      S.traits.forEach(function (t) {
        var typed = catOf(t.cat).typed;
        put(typed + '_' + t.id, t.name);
        put(typed + '_' + t.id + '_info', t.desc);
      });
      S.settingGroups.forEach(function (g) {
        if (S.settings.some(function (st) { return st.group === g.id; })) put(settingGroupKey(S, g.id), g.name);
      });
      S.settings.forEach(function (st) {
        put(settingKey(S, st), st.name);
        put(settingKey(S, st) + ' Description', st.desc);
      });
      S.items.forEach(function (it) {
        var full = itemFullId(S, it);
        put('item_' + full, it.name);
        put('item_mat_' + it.id, it.name);
        put(full + '_description', it.desc);
      });
      S.units.forEach(function (u) { put(u.id, u.name); });
      MM.kinds.locale(S, lang, put);
      S.disasters.forEach(function (x) { put('disaster_' + x.id, x.log); });
      S.buttons.forEach(function (b) {
        put(b.id, b.name);
        put(b.id + ' Description', b.desc);
        put(b.id + '_description', b.desc);
      });
      if (S.buttons.length || S.powers.length) {
        put(S.tab.id, S.tab.name);
        put(S.tab.id + ' Description', S.tab.desc);
      }
      files['Locales/' + lang + '.json'] = JSON.stringify(d, null, 2);
    });
    return files;
  }

  function spriteList(S) {
    var lines = [];
    MM.img.slots(S).forEach(function (sl) {
      if (!sl.obj[sl.key]) lines.push(sl.path + (sl.size ? '  (' + sl.size + ')' : '') + '  - ' + sl.label);
    });
    if (S.units.length) lines.push('GameResources/actors/species/<creature id>/  - creature body sprites (walk frames), see the game files');
    return lines.length ? lines.join('\n') + '\n' : 'All images were provided.\n';
  }

  function validate(S) {
    var errs = [];
    var seen = {};
    function dup(kind, list) {
      var ids = {};
      list.forEach(function (x) {
        if (!x.id) errs.push(kind + ': id vazio / empty id');
        if (ids[x.id]) errs.push(kind + ': id duplicado / duplicate id ' + x.id);
        ids[x.id] = true;
      });
    }
    dup('trait', S.traits);
    dup('item', S.items);
    dup('action', S.actions);
    dup('unit', S.units);
    dup('kingdom', S.kingdoms);
    dup('projectile', S.projectiles);
    dup('disaster', S.disasters);
    dup('button', S.buttons);
    dup('group', S.groups);
    dup('setting', S.settings);
    S.traits.forEach(function (t) {
      if (t.group && !S.groups.some(function (g) { return g.id === t.group && g.cat === t.cat; }) && (D.traitGroupsVanilla[t.cat] || []).indexOf(traitGroupOf(t)) < 0) {
        errs.push('trait ' + t.id + ': grupo inexistente / unknown group ' + t.group);
      }
    });
    S.disasters.forEach(function (d) {
      if (!d.unit) errs.push('disaster ' + d.id + ': sem unidade / no unit');
    });
    S.traits.forEach(function (t) {
      Object.keys(t.act || {}).forEach(function (k) {
        if (t.act[k] && !actionById(S, t.act[k])) errs.push('trait ' + t.id + ': ação inexistente / unknown action ' + t.act[k]);
      });
      (t.opposites || []).forEach(function (o) {
        if (!S.traits.some(function (x) { return x.id === o && x.cat === t.cat; })) errs.push('trait ' + t.id + ': oposto não criado aqui (ok se for do jogo) / opposite not defined here (fine if vanilla) ' + o);
      });
    });
    S.items.forEach(function (it) {
      [it.actAttack, it.actSpecial].forEach(function (a) { if (a && !actionById(S, a)) errs.push('item ' + it.id + ': ação inexistente / unknown action ' + a); });
    });
    S.actions.forEach(function (a) {
      if (a.preset === 'spawn' && !a.p.unit) errs.push('action ' + a.id + ': sem unidade / no unit');
      if (a.chanceSetting && !settingById(S, a.chanceSetting)) errs.push('action ' + a.id + ': configuração inexistente / unknown setting ' + a.chanceSetting);
    });
    S.settings.forEach(function (st) {
      if (!S.settingGroups.some(function (g) { return g.id === st.group; })) errs.push('setting ' + st.id + ': grupo inexistente / unknown group');
    });
    S.buttons.forEach(function (b) {
      if (!b.unit) errs.push('button ' + b.id + ': sem unidade / no unit');
    });
    MM.kinds.validate(S, errs);
    return errs;
  }

  function genKingdomSync(S, ns, ids, guard) {
    var out = ['using System.Collections.Generic;', 'using HarmonyLib;', '', 'namespace ' + ns, '{', '\tinternal static class KingdomSync', '\t{',
      '\t\tprivate static readonly string[] ids = new string[] { ' + ids.map(cs).join(', ') + ' };', '',
      '\t\tpublic static void Init()', '\t\t{',
      (guard ? '\t\t\tGuard();' : '\t\t\t'),
      '\t\t\tforeach (string id in ids)', '\t\t\t{',
      '\t\t\t\tKingdomAsset a = AssetManager.kingdoms.get(id);',
      '\t\t\t\tif (a == null) continue;',
      '\t\t\t\ta.addTag("everyone");',
      '\t\t\t\tif (a.friendship_for_everyone && !a.brain)',
      '\t\t\t\t{',
      '\t\t\t\t\tforeach (KingdomAsset o in AssetManager.kingdoms.list) o.addFriendlyTag(a.id);',
      '\t\t\t\t}',
      '\t\t\t\tif (a.default_kingdom_color == null) a.default_kingdom_color = ColorAsset.tryMakeNewColorAsset("#8C8C8C");',
      '\t\t\t\tif (a.default_kingdom_color.id == "ASSET_ID") a.default_kingdom_color.id = "kingdom_library_color_" + a.id;',
      '\t\t\t\tforeach (KingdomAsset f in AssetManager.kingdoms.list)', '\t\t\t\t{',
      '\t\t\t\t\tif (f.friendship_for_everyone && !f.brain) a.addFriendlyTag(f.id);',
      '\t\t\t\t}', '\t\t\t}',
      '\t\t\tif (World.world == null || World.world.kingdoms_wild == null) return;',
      '\t\t\tDictionary<string, Kingdom> dict = Traverse.Create(World.world.kingdoms_wild).Field("_dict").GetValue<Dictionary<string, Kingdom>>();',
      '\t\t\tif (dict == null) return;',
      '\t\t\tSystem.Reflection.MethodInfo make = AccessTools.Method(typeof(WildKingdomsManager), "newWildKingdom");',
      '\t\t\tif (make == null) return;',
      '\t\t\tforeach (string id in ids)', '\t\t\t{',
      '\t\t\t\tKingdomAsset a = AssetManager.kingdoms.get(id);',
      '\t\t\t\tif (a == null || dict.ContainsKey(id)) continue;',
      '\t\t\t\tmake.Invoke(World.world.kingdoms_wild, new object[] { a });',
      '\t\t\t}', '\t\t}'];
    if (guard) {
      out.push('',
        '\t\tprivate static bool guarded;', '',
        '\t\tpublic static void Guard()', '\t\t{',
        '\t\t\tif (guarded) return;', '\t\t\tguarded = true;',
        '\t\t\ttry', '\t\t\t{',
        '\t\t\t\tHarmony harmony = new Harmony(' + cs(ns + '.buildguard') + ');',
        '\t\t\t\tHarmonyMethod fin = new HarmonyMethod(typeof(KingdomSync), nameof(Finalizer));',
        '\t\t\t\tharmony.Patch(AccessTools.Method(typeof(ai.behaviours.CityBehBuild), "canUseBuildAsset"), finalizer: fin);',
        '\t\t\t\tharmony.Patch(AccessTools.Method(typeof(ai.behaviours.CityBehBuild), "hasResourcesForBuildAsset"), finalizer: fin);',
        '\t\t\t}', '\t\t\tcatch (System.Exception e)', '\t\t\t{',
        '\t\t\t\tUnityEngine.Debug.LogWarning("[' + ns + '] build guard: " + e.Message);', '\t\t\t}', '\t\t}', '',
        '\t\tprivate static System.Exception Finalizer(System.Exception __exception, ref bool __result)', '\t\t{',
        '\t\t\tif (__exception is KeyNotFoundException || __exception is System.NullReferenceException)', '\t\t\t{',
        '\t\t\t\t__result = false;', '\t\t\t\treturn null;', '\t\t\t}',
        '\t\t\treturn __exception;', '\t\t}');
    }
    out.push('\t}', '}');
    return out.join('\n') + '\n';
  }

  function genFinish(code, ns) {
    var map = { actor_library: 'actors', traits: 'actor_traits', subspecies_traits: 'subspecies_traits', culture_traits: 'culture_traits', clan_traits: 'clan_traits', religion_traits: 'religion_traits', language_traits: 'language_traits', kingdoms_traits: 'kingdom_traits', items: 'items', powers: 'powers', drops: 'drops', status: 'statuses', spells: 'spells', buildings: 'buildings', biome_library: 'biomes', clouds: 'clouds', era_library: 'ages', resources: 'resources', achievements: 'achievements' };
    var ids = {};
    Object.keys(map).forEach(function (k) { ids[map[k]] = []; });
    function put(lib, id) { var n = map[lib]; if (n && ids[n].indexOf(id) < 0) ids[n].push(id); }
    Object.keys(code).forEach(function (f) {
      var s = code[f], m, re;
      re = /AssetManager\.(\w+)\.clone\("([^"]+)"/g;
      while ((m = re.exec(s))) put(m[1], m[2]);
      re = /AssetManager\.(\w+)\.add\((\w+)\)/g;
      while ((m = re.exec(s))) {
        var before = s.slice(0, m.index), r2 = new RegExp('\\b' + m[2] + '\\.id = "([^"]+)"', 'g'), mm, last = null;
        while ((mm = r2.exec(before))) last = mm[1];
        if (last) put(m[1], last);
      }
    });
    var lines = Object.keys(ids).map(function (n) { return '\t\tprivate static readonly string[] ' + n + ' = new string[] { ' + ids[n].map(cs).join(', ') + ' };'; });
    return MM.finishTpl.split('__NS__').join(ns).replace('__IDS__', lines.join('\n'));
  }

  function build(S) {
    var ns = MM.ident(S.meta.id);
    var files = {};
    var code = {};
    var parts = [];
    if (S.actions.length) { code['Actions.cs'] = genActions(S, ns); }
    if (S.groups.length) { code['TraitGroups.cs'] = genGroups(S, ns); parts.push('TraitGroups'); }
    if (S.traits.length) { code['Traits.cs'] = genTraits(S, ns); parts.push('Traits'); }
    if (S.projectiles.length) { code['Projectiles.cs'] = genProjectiles(S, ns); parts.push('Projectiles'); }
    if (S.items.length) { code['Items.cs'] = genItems(S, ns); parts.push('Items'); }
    if (S.kingdoms.length) { code['Kingdoms.cs'] = genKingdoms(S, ns); parts.push('Kingdoms'); }
    if (S.units.length) { code['Units.cs'] = genUnits(S, ns); parts.push('Units'); }
    if (S.disasters.length) { code['Disasters.cs'] = genDisasters(S, ns); parts.push('Disasters'); }
    var kparts = [];
    MM.kinds.extend(S, ns, code, kparts);
    var early = kparts.filter(function (x) { return !x.late; }).map(function (x) { return x.name; });
    var late = kparts.filter(function (x) { return x.late; }).map(function (x) { return x.name; });
    parts = early.concat(parts, late);
    var kids = [];
    S.kingdoms.forEach(function (k) { if (k.id) kids.push(k.id); });
    (S.species || []).forEach(function (e) { var id = e.id; if (id) kids.push('nomads_' + id, id); });
    if (kids.length) { code['KingdomSync.cs'] = genKingdomSync(S, ns, kids, (S.species || []).length > 0); parts.push('KingdomSync'); }
    if (S.buttons.length || S.powers.length) {
      code['Powers.cs'] = genPowers(S, ns);
      code['ModTab.cs'] = genTab(S, ns);
      parts.push('ModTab');
    }
    if (S.settings.length) { code['ModSettings.cs'] = genSettings(S, ns); }
    code['ModFinish.cs'] = genFinish(code, ns);
    parts.push('ModFinish');
    code['Main.cs'] = genMain(S, ns, parts);
    Object.keys(code).forEach(function (k) { files['code/' + k] = code[k]; });
    var loc = localeFiles(S);
    Object.keys(loc).forEach(function (k) { files[k] = loc[k]; });
    files['mod.json'] = JSON.stringify({
      name: S.meta.name,
      author: S.meta.author,
      version: S.meta.version,
      description: S.meta.description,
      iconPath: 'icon.png',
      GUID: ns,
      Dependencies: S.meta.deps || [],
      OptionalDependencies: S.meta.optional || [],
      IncompatibleWith: S.meta.incompatible || []
    }, null, 4);
    files['default_config.json'] = S.settings.length ? configJson(S, ns) : '{}';
    files['SPRITES.txt'] = spriteList(S);
    return files;
  }

  return { build: build, validate: validate, itemFullId: itemFullId, tplOf: tplOf, unitFolder: unitFolder };
})();
