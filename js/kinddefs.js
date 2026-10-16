(function () {
  var K = MM.kinds;
  var V = MM.vanilla;

  function O(list) { return list.map(function (x) { return [x, x]; }); }
  function B(v) { return v ? 'true' : 'false'; }
  function pascal(s) { return MM.pascal(s); }
  var TXN = { l: ['Nome', 'Name'], k: 'name', t: 'tx' };
  var TXD = { l: ['Descrição', 'Description'], k: 'desc', t: 'tx', desc: true };

  function iconOpts(list, prefix) {
    return (list || []).map(function (x) { return [x, x]; });
  }

  K.add({
    key: 'status', cls: 'StatusContent', file: 'StatusContent.cs', group: 'creatures', base: 'status', nm: 'status',
    label: ['Status', 'Status effects'], label1: ['Status', 'Status effect'], newLabel: ['Novo status', 'New status effect'],
    empty: ['Nenhum status ainda. Status são efeitos temporários como queimando ou congelado.', 'No status effects yet. Status effects are temporary conditions like burning or frozen.'],
    fields: [
      TXN, TXD,
      { t: 'h', l: ['Comportamento', 'Behavior'] },
      { k: 'duration', t: 'num', l: ['Duração (s)', 'Duration (s)'], d: 10, min: 0, rnd: [5, 120], step: 5 },
      { k: 'tier', t: 'sel', l: ['Nível', 'Tier'], o: O(['Basic', 'None', 'Advanced']), d: 'Basic', fixed: true },
      { k: 'canCure', t: 'bool', l: ['Pode ser curado', 'Can be cured'], d: false, rb: true },
      { k: 'removedOnDamage', t: 'bool', l: ['Some ao tomar dano', 'Removed on damage'], d: false, rb: 0.15 },
      { k: 'cancelJob', t: 'bool', l: ['Cancela a tarefa da unidade', 'Cancels unit job'], d: false },
      { k: 'interval', t: 'num', l: ['Intervalo da ação contínua (s)', 'Tick interval (s)'], d: 0, min: 0, step: 0.5, rnd: [0, 3], hint: [' 0 = sem ação contínua', ' 0 = no tick action'] },
      { k: 'actTick', t: 'act', hook: 'world', l: ['Ação a cada intervalo', 'Action every tick'] },
      { k: 'actFinish', t: 'act', hook: 'world', l: ['Ação ao terminar', 'Action when it ends'], rp: 0.2 },
      { k: 'actDeath', t: 'act', hook: 'world', l: ['Ação ao morrer com o status', 'Action on death'], rp: 0.1 },
      { k: 'actReceive', t: 'act', hook: 'world', l: ['Ação ao receber', 'Action on receive'], rp: 0.2 },
      { k: 'actHit', t: 'act', hook: 'hit', l: ['Ação ao ser atacado', 'Action when hit'], rp: 0.2 },
      { t: 'h', l: ['Atributos', 'Stats'] },
      { k: 'stats', t: 'stats', neg: true },
      { t: 'h', l: ['Relações', 'Relations'] },
      { k: 'remove', t: 'ids', src: ['status'], l: ['Remove estes status', 'Removes these statuses'], rn: 1 },
      { k: 'opposite', t: 'ids', src: ['status'], l: ['Bloqueado por estes status', 'Blocked by these statuses'], rn: 1 },
      { k: 'oppositeTraits', t: 'ids', src: ['traits'], l: ['Bloqueado por estes traços', 'Blocked by these traits'] },
      { t: 'h', l: ['Visual', 'Visual'] },
      { k: 'img', t: 'img', l: ['Ícone', 'Icon'], size: '32x32', px: 16 },
      { k: 'iconVan', t: 'text', l: ['...ou ícone do jogo', '...or vanilla icon'], d: 'ui/Icons/iconHungry', ph: 'ui/Icons/iconHungry', norandom: true },
      { k: 'texture', t: 'text', l: ['Efeito sobre a unidade (do jogo)', 'Effect over the unit (vanilla)'], ph: 'fx_status_sleeping_t', norandom: true, hint: ['Nome de textura de effects/ do jogo. Vazio = sem efeito visual.', 'A texture name from the game effects/ folder. Empty = no visual effect.'] },
      { k: 'fxImg', t: 'img', anim: true, l: ['...ou desenhe o efeito (animado)', '...or draw the effect (animated)'], size: '', px: 16 },
      { k: 'animated', t: 'bool', l: ['Animado', 'Animated'], d: true },
      { k: 'scale', t: 'num', l: ['Escala do efeito', 'Effect scale'], d: 1, step: 0.1, min: 0.1 }
    ],
    gen: function (e, S, w, c) {
      w.push('StatusAsset s = new StatusAsset();');
      w.push('s.id = ' + c.cs(e.id) + ';');
      w.push('s.locale_id = ' + c.cs('status_title_' + e.id) + ';');
      w.push('s.locale_description = ' + c.cs('status_description_' + e.id) + ';');
      w.push('s.duration = ' + c.num(e.duration) + ';');
      w.push('s.tier = StatusTier.' + e.tier + ';');
      w.push('s.can_be_cured = ' + B(e.canCure) + ';');
      w.push('s.path_icon = ' + c.cs(e.img ? 'ui/Icons/status_' + e.id : e.iconVan || 'ui/Icons/iconHungry') + ';');
      if (e.removedOnDamage) w.push('s.removed_on_damage = true;');
      if (e.cancelJob) w.push('s.cancel_actor_job = true;');
      if (Number(e.interval) > 0) w.push('s.action_interval = ' + c.num(e.interval) + ';');
      var map = { actTick: 'action', actFinish: 'action_finish', actDeath: 'action_death', actReceive: 'action_on_receive', actHit: 'action_get_hit' };
      Object.keys(map).forEach(function (k) {
        var r = e[k] && c.act(e[k]);
        if (r) w.push('s.' + map[k] + ' = ' + r + ';');
      });
      c.stats('s', e.stats).forEach(function (l) { w.push(l); });
      if (e.remove.length) w.push('s.remove_status = new string[] { ' + c.list(e.remove) + ' };');
      if (e.opposite.length) w.push('s.opposite_status = new string[] { ' + c.list(e.opposite) + ' };');
      if (e.oppositeTraits.length) w.push('s.opposite_traits = new string[] { ' + c.list(e.oppositeTraits) + ' };');
      var fxTex = MM.anim.count(e, 'fxImg') ? e.id + '_fx' : e.texture;
      if (fxTex) {
        w.push('s.texture = ' + c.cs(fxTex) + ';');
        w.push('s.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + s.texture);');
        w.push('s.need_visual_render = true;');
        w.push('s.animated = ' + B(e.animated || MM.anim.count(e, 'fxImg') > 1) + ';');
        w.push('s.scale = ' + c.num(e.scale) + ';');
      }
      w.push('AssetManager.status.add(s);');
    },
    loc: function (e, put) {
      put('status_title_' + e.id, e.name);
      put('status_description_' + e.id, e.desc);
    },
    imgs: function (e) {
      var ff = MM.img.frameFn('GameResources/effects/' + e.id + '_fx');
      return [
        { obj: e, key: 'img', path: 'GameResources/ui/Icons/status_' + e.id + '.png', label: 'Status icon ' + e.id, size: '32x32' },
        { obj: e, key: 'fxImg', path: ff(0), fr: ff, label: 'Status effect ' + e.id, size: '' }
      ];
    },
    validate: function (e, S, bad) {
      if (e.texture && !MM.anim.count(e, 'fxImg') && V.statusTextures.indexOf(e.texture) < 0) bad('textura de efeito não é do jogo (ok se você enviar uma) / effect texture is not vanilla (fine if you ship one)');
    }
  });

  K.add({
    key: 'drops', cls: 'DropContent', file: 'DropContent.cs', group: 'world', base: 'drop', nm: 'drop',
    label: ['Drops', 'Drops'], label1: ['Drop', 'Drop'], newLabel: ['Novo drop', 'New drop'],
    empty: ['Nenhum drop ainda. Drops são coisas que caem do céu quando você usa um poder.', 'No drops yet. Drops are things that fall from the sky when a power is used.'],
    intro: ['Para usar um drop, crie um poder do tipo Drop na aba Poderes.', 'To use a drop, create a Drop power in the Powers tab.'],
    fields: [
      { t: 'h', l: ['Queda', 'Falling'] },
      { k: 'type', t: 'sel', l: ['Tipo', 'Type'], o: O(['DropGeneric', 'DropMagic', 'DropStatus', 'DropBomb', 'DropBuilding', 'DropTrait', 'DropSeed', 'DropCreep']), d: 'DropGeneric', rerender: true },
      { k: 'scale', t: 'num', l: ['Escala', 'Scale'], d: 0.1, step: 0.05, min: 0.02, rnd: [0.05, 0.3], step2: 0.05 },
      { k: 'fallSpeed', t: 'num', l: ['Velocidade de queda', 'Fall speed'], d: 3.2, step: 0.1, min: 0.1, rnd: [1, 6] },
      { k: 'heightMin', t: 'num', l: ['Altura inicial mínima', 'Min start height'], d: 15, rnd: [10, 25] },
      { k: 'heightMax', t: 'num', l: ['Altura inicial máxima', 'Max start height'], d: 20, rnd: [25, 45] },
      { k: 'lit', t: 'bool', l: ['Brilha no escuro', 'Glows'], d: false, rb: true },
      { k: 'surprises', t: 'bool', l: ['Assusta unidades', 'Surprises units'], d: false },
      { t: 'h', l: ['Efeito ao cair', 'Landing effect'] },
      { k: 'effect', t: 'sel', l: ['Efeito', 'Effect'], o: [['none', ['Nenhum', 'None']], ['status', ['Aplicar status em unidades próximas', 'Apply status to nearby units']], ['action', ['Rodar uma ação', 'Run an action']], ['spawn', ['Invocar criatura', 'Summon creature']]], d: 'none', rerender: true },
      { k: 'status', t: 'id', src: ['status'], l: ['Status', 'Status'], when: function (e) { return e.effect === 'status'; }, rsrc: ['status'], ph: 'burning' },
      { k: 'duration', t: 'num', l: ['Duração (s, 0 = padrão)', 'Duration (s, 0 = default)'], d: 0, min: 0, when: function (e) { return e.effect === 'status'; }, rnd: [0, 30] },
      { k: 'action', t: 'act', hook: 'world', l: ['Ação', 'Action'], when: function (e) { return e.effect === 'action'; } },
      { k: 'unit', t: 'id', src: ['units'], l: ['Criatura', 'Creature'], when: function (e) { return e.effect === 'spawn'; }, ph: 'sheep' },
      { k: 'count', t: 'num', l: ['Quantidade', 'Amount'], d: 1, min: 1, when: function (e) { return e.effect === 'spawn'; }, rnd: [1, 4] },
      { k: 'building', t: 'id', src: ['buildings'], l: ['Construção criada', 'Building spawned'], when: function (e) { return e.type === 'DropBuilding'; }, ph: 'tree_green_1', rsrc: ['buildings'] },
      { t: 'h', l: ['Visual', 'Visual'] },
      { k: 'img', t: 'img', anim: true, l: ['Imagem do drop', 'Drop image'], size: '8x8', px: 8 },
      { k: 'textureVan', t: 'text', l: ['...ou textura do jogo', '...or vanilla texture'], d: 'drops/drop_pixel', ph: 'drops/drop_pixel', norandom: true },
      { k: 'randomFrame', t: 'bool', l: ['Quadro aleatório', 'Random frame'], d: false },
      { k: 'animated', t: 'bool', l: ['Animado', 'Animated'], d: false },
      { k: 'randomFlip', t: 'bool', l: ['Inverter aleatoriamente', 'Random flip'], d: false }
    ],
    gen: function (e, S, w, c) {
      w.push('DropAsset d = new DropAsset();');
      w.push('d.id = ' + c.cs(e.id) + ';');
      w.push('d.type = DropType.' + e.type + ';');
      w.push('d.path_texture = ' + c.cs(e.img ? 'drops/' + e.id : e.textureVan || 'drops/drop_pixel') + ';');
      w.push('d.default_scale = ' + c.num(e.scale) + ';');
      w.push('d.falling_speed = ' + c.num(e.fallSpeed) + ';');
      w.push('d.falling_height = new UnityEngine.Vector3(' + c.num(e.heightMin) + ', ' + c.num(e.heightMax) + ', 0f);');
      if (e.lit) w.push('d.material = "mat_world_object_lit";');
      if (e.surprises) w.push('d.surprises_units = true;');
      if (e.randomFrame) w.push('d.random_frame = true;');
      if (e.animated || MM.anim.count(e, 'img') > 1) w.push('d.animated = true;');
      if (e.randomFlip) w.push('d.random_flip = true;');
      if (e.type === 'DropBuilding' && e.building) w.push('d.building_asset = ' + c.cs(e.building) + ';');
      if (e.effect === 'status' && e.status) {
        var dur = Number(e.duration) > 0 ? ', ' + c.num(e.duration) : '';
        w.push('d.action_landed = (WorldTile pTile, string pDropID) =>');
        w.push('{');
        w.push('\tforeach (Actor unit in Finder.getUnitsFromChunk(pTile, 1, 3f))');
        w.push('\t{');
        w.push('\t\tunit.addStatusEffect(' + c.cs(e.status) + dur + ');');
        w.push('\t}');
        w.push('};');
      } else if (e.effect === 'action' && e.action && c.act(e.action)) {
        w.push('d.action_landed = (WorldTile pTile, string pDropID) =>');
        w.push('{');
        w.push('\t' + c.act(e.action) + '(null, pTile);');
        w.push('};');
      } else if (e.effect === 'spawn' && e.unit) {
        w.push('d.action_landed = (WorldTile pTile, string pDropID) =>');
        w.push('{');
        w.push('\tfor (int i = 0; i < ' + c.int(Math.max(1, e.count)) + '; i++)');
        w.push('\t{');
        w.push('\t\tWorld.world.units.spawnNewUnit(' + c.cs(e.unit) + ', pTile, true, true, 3f);');
        w.push('\t}');
        w.push('};');
      }
      w.push('AssetManager.drops.add(d);');
    },
    imgs: function (e) {
      var df = MM.img.frameFn('GameResources/drops/' + e.id);
      return [{ obj: e, key: 'img', path: df(0), fr: df, label: 'Drop ' + e.id, size: '8x8' }];
    },
    validate: function (e, S, bad) {
      if (e.effect === 'status' && !e.status) bad('sem status / no status');
      if (e.effect === 'action' && !e.action) bad('sem ação / no action');
      if (e.effect === 'spawn' && !e.unit) bad('sem criatura / no creature');
    }
  });

  var AGE_OVERLAYS = ['none', 'darkness', 'magic', 'rain_darkness', 'winter', 'chaos', 'moon', 'sun', 'ash', 'night', 'rain'];
  var AGE_PARTICLES = ['none', 'snow', 'rain', 'magic', 'ash', 'sun'];

  K.add({
    key: 'ages', cls: 'AgeContent', file: 'AgeContent.cs', group: 'world', base: 'age', nm: 'age', late: true,
    label: ['Eras', 'Ages'], label1: ['Era', 'Age'], newLabel: ['Nova era', 'New age'],
    empty: ['Nenhuma era ainda. Eras mudam o clima, a luz e os efeitos do mundo por alguns anos.', 'No ages yet. Ages change weather, light and effects of the world for some years.'],
    fields: [
      TXN, TXD,
      { t: 'h', l: ['Duração e frequência', 'Length and frequency'] },
      { k: 'yearsMin', t: 'num', l: ['Duração mínima (anos)', 'Min length (years)'], d: 35, min: 1, rnd: [10, 40] },
      { k: 'yearsMax', t: 'num', l: ['Duração máxima (anos)', 'Max length (years)'], d: 55, min: 1, rnd: [45, 90] },
      { k: 'rate', t: 'num', l: ['Frequência (peso)', 'Frequency (weight)'], d: 3, min: 1, rnd: [1, 8] },
      { k: 'slots', t: 'pick', opts: ['1', '2', '3', '4', '5', '6', '7', '8'], l: ['Posições da roda', 'Wheel slots'], d: [] },
      { t: 'h', l: ['Visual', 'Look'] },
      { k: 'overlay', t: 'sel', l: ['Camada sobre o mundo', 'World overlay'], o: O(AGE_OVERLAYS), d: 'none' },
      { k: 'overlayAlpha', t: 'num', l: ['Força da camada', 'Overlay strength'], d: 0.2, step: 0.05, min: 0, max: 1, rnd: [0.1, 0.5], step2: 0.05 },
      { k: 'particles', t: 'sel', l: ['Partículas', 'Particles'], o: O(AGE_PARTICLES), d: 'none' },
      { k: 'titleColor', t: 'color', l: ['Cor do título', 'Title color'] },
      { k: 'lightColor', t: 'color', l: ['Cor da luz', 'Light color'] },
      { k: 'img', t: 'img', l: ['Ícone', 'Icon'], size: '32x32', px: 16 },
      { k: 'iconVan', t: 'text', l: ['...ou ícone do jogo', '...or vanilla icon'], d: 'ui/Icons/ages/iconAgeHope', norandom: true },
      { t: 'h', l: ['Efeitos no mundo', 'World effects'] },
      { k: 'biomes', t: 'ids', src: ['biomes'], l: ['Biomas que crescem', 'Biomes that grow'], rn: 2 },
      { k: 'clouds', t: 'ids', src: ['clouds'], l: ['Nuvens', 'Clouds'], rn: 2 },
      { k: 'cloudInterval', t: 'num', l: ['Intervalo das nuvens (s)', 'Cloud interval (s)'], d: 15, min: 1, rnd: [8, 40] },
      { k: 'tempDamage', t: 'num', l: ['Bônus de dano de temperatura', 'Temperature damage bonus'], d: 1, rnd: [-5, 15] },
      { k: 'rangeMult', t: 'num', l: ['Multiplicador de armas à distância', 'Ranged weapon multiplier'], d: 1, step: 0.1, rnd: [0.5, 1.5], step2: 0.1 },
      { k: 'fireSpread', t: 'num', l: ['Propagação do fogo', 'Fire spread'], d: 1, step: 0.1, rnd: [0.5, 2.5], step2: 0.1 },
      { k: 'bonusLoyalty', t: 'num', l: ['Bônus de lealdade', 'Loyalty bonus'], d: 0, rnd: [-10, 15] },
      { k: 'bonusOpinion', t: 'num', l: ['Bônus de opinião', 'Opinion bonus'], d: 0, rnd: [-10, 15] },
      { k: 'bonusBiomes', t: 'num', l: ['Bônus de crescimento de biomas', 'Biome growth bonus'], d: 0, rnd: [-3, 5] },
      { k: 'cropsGrow', t: 'bool', l: ['Plantações crescem', 'Crops grow'], d: true, rb: 0.8 },
      { k: 'vegetation', t: 'bool', l: ['Vegetação cresce', 'Vegetation grows'], d: true, rb: 0.8 },
      { k: 'freeze', t: 'bool', l: ['Congela o mundo', 'Freezes the world'], d: false, rb: 0.1 },
      { k: 'unfreeze', t: 'bool', l: ['Descongela o mundo', 'Unfreezes the world'], d: false, rb: 0.2 },
      { k: 'special', t: 'act', hook: 'world', l: ['Ação especial periódica', 'Periodic special action'], rp: 0.3 },
      { k: 'specialInterval', t: 'num', l: ['Intervalo da ação especial (s)', 'Special action interval (s)'], d: 10, min: 1, rnd: [5, 30] }
    ],
    afterRandom: function (e) {
      e.slots = MM.random.sample(['1', '2', '3', '4', '5', '6', '7', '8'], MM.random.int(1, 3));
      e.yearsMax = Math.max(Number(e.yearsMax), Number(e.yearsMin) + 5);
    },
    gen: function (e, S, w, c) {
      var G = 'System.Collections.Generic.';
      w.push('WorldAgeAsset a = new WorldAgeAsset();');
      w.push('a.id = ' + c.cs(e.id) + ';');
      w.push('a.years_min = ' + c.int(e.yearsMin) + ';');
      w.push('a.years_max = ' + c.int(Math.max(Number(e.yearsMax), Number(e.yearsMin))) + ';');
      w.push('a.rate = ' + c.int(Math.max(1, e.rate)) + ';');
      w.push('a.path_icon = ' + c.cs(e.img ? 'ui/Icons/ages/' + e.id : e.iconVan || 'ui/Icons/ages/iconAgeHope') + ';');
      w.push('a.path_background = "ui/AgeWheel/backgrounds/age_hope_background";');
      w.push('a.title_color = Toolbox.makeColor(' + c.cs(e.titleColor || '#ffffff') + ');');
      w.push('a.light_color = Toolbox.makeColor(' + c.cs(e.lightColor || '#ffce61') + ');');
      w.push('a.era_effect_overlay_alpha = ' + c.num(e.overlayAlpha) + ';');
      if (e.overlay && e.overlay !== 'none') w.push('a.overlay_' + e.overlay + ' = true;');
      if (e.particles && e.particles !== 'none') w.push('a.particles_' + e.particles + ' = true;');
      if (e.biomes.length) w.push('a.biomes = new ' + G + 'HashSet<string> { ' + c.list(e.biomes) + ' };');
      w.push('a.clouds = new ' + G + 'List<string> { ' + c.list(e.clouds) + ' };');
      w.push('a.cloud_interval = ' + c.num(e.cloudInterval) + ';');
      w.push('a.temperature_damage_bonus = ' + c.int(e.tempDamage) + ';');
      w.push('a.range_weapons_multiplier = ' + c.num(e.rangeMult) + ';');
      w.push('a.fire_spread_rate_bonus = ' + c.num(e.fireSpread) + ';');
      w.push('a.bonus_loyalty = ' + c.int(e.bonusLoyalty) + ';');
      w.push('a.bonus_opinion = ' + c.int(e.bonusOpinion) + ';');
      w.push('a.bonus_biomes_growth = ' + c.int(e.bonusBiomes) + ';');
      w.push('a.flag_crops_grow = ' + B(e.cropsGrow) + ';');
      w.push('a.grow_vegetation = ' + B(e.vegetation) + ';');
      if (e.freeze) w.push('a.global_freeze_world = true;');
      if (e.unfreeze) w.push('a.global_unfreeze_world = true;');
      var sl = (e.slots || []).map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 1 && x <= 8; });
      w.push('a.default_slots = new ' + G + 'List<int> { ' + sl.join(', ') + ' };');
      var sp = e.special && c.act(e.special);
      if (sp) {
        w.push('a.special_effect_action = () => { ' + sp + '(null, null); };');
        w.push('a.special_effect_interval = ' + c.num(e.specialInterval) + ';');
      }
      w.push('AssetManager.era_library.add(a);');
      w.push('foreach (int slot in a.default_slots)');
      w.push('{');
      w.push('\tif (!AssetManager.era_library.pool_by_slots.ContainsKey(slot)) AssetManager.era_library.pool_by_slots.Add(slot, new ' + G + 'List<WorldAgeAsset>());');
      w.push('\tAssetManager.era_library.pool_by_slots[slot].Add(a);');
      w.push('}');
      w.push('if (AssetManager.era_library.list_only_normal != null) AssetManager.era_library.list_only_normal.Add(a);');
    },
    loc: function (e, put) {
      put(e.id + '_title', e.name);
      put(e.id + '_description', e.desc);
    },
    imgs: function (e) {
      return [{ obj: e, key: 'img', path: 'GameResources/ui/Icons/ages/' + e.id + '.png', label: 'Age icon ' + e.id, size: '32x32' }];
    },
    validate: function (e, S, bad) {
      if (Number(e.yearsMax) < Number(e.yearsMin)) bad('duração máxima menor que a mínima / max length smaller than min');
      if (e.special && !K.cx(S, '').act(e.special)) bad('ação inexistente / unknown action');
    }
  });
  K.byKey.ages.fields.forEach(function (f) { if (f.k === 'titleColor') f.d = '#ffffff'; if (f.k === 'lightColor') f.d = '#ffce61'; });

  K.add({
    key: 'buildings', cls: 'BuildingContent', file: 'BuildingContent.cs', group: 'world', base: 'building', nm: 'building', late: true,
    label: ['Construções', 'Buildings'], label1: ['Construção', 'Building'], newLabel: ['Nova construção', 'New building'],
    empty: ['Nenhuma construção ainda. Elas são cópias de uma construção do jogo com comportamento novo.', 'No buildings yet. They are copies of a vanilla building with new behavior.'],
    intro: ['A construção usa o visual da construção base do jogo. Sprites próprios ainda não são suportados.', 'The building uses the look of its vanilla base. Custom sprites are not supported yet.'],
    fields: [
      TXN,
      { k: 'baseId', t: 'id', src: ['buildings'], l: ['Construção base do jogo', 'Vanilla base building'], d: 'bonfire', ph: 'bonfire', rsrc: ['buildings'] },
      { t: 'h', l: ['Atributos', 'Stats'] },
      { k: 'stats', t: 'stats' },
      { t: 'h', l: ['Comportamento', 'Behavior'] },
      { k: 'burnable', t: 'bool', l: ['Pode pegar fogo', 'Burnable'], d: true, rb: true },
      { k: 'demolish', t: 'bool', l: ['Pode ser demolida', 'Can be demolished'], d: true },
      { k: 'light', t: 'bool', l: ['Emite luz', 'Emits light'], d: false, rb: true },
      { k: 'smoke', t: 'bool', l: ['Solta fumaça', 'Emits smoke'], d: false, rb: 0.2 },
      { k: 'spawnDrop', t: 'id', src: ['drops'], l: ['Solta este drop periodicamente', 'Periodically spawns this drop'], ph: 'rain', rsrc: ['drops'] },
      { k: 'dropInterval', t: 'num', l: ['Intervalo do drop (s)', 'Drop interval (s)'], d: 5, min: 0.5, rnd: [2, 20], step: 0.5 },
      { k: 'spawnUnit', t: 'id', src: ['units'], l: ['Gera esta criatura', 'Spawns this creature'], ph: 'sheep' },
      { k: 'towerProj', t: 'id', src: ['projectiles'], l: ['Atira este projétil (torre)', 'Shoots this projectile (tower)'], ph: 'arrow' },
      { k: 'towerReload', t: 'num', l: ['Recarga da torre (s)', 'Tower reload (s)'], d: 3, min: 0.2, rnd: [1, 6], step: 0.5 }
    ],
    gen: function (e, S, w, c) {
      w.push('BuildingAsset b = AssetManager.buildings.clone(' + c.cs(e.id) + ', ' + c.cs(e.baseId || 'bonfire') + ');');
      w.push('BuildingAsset src = AssetManager.buildings.get(' + c.cs(e.baseId || 'bonfire') + ');');
      w.push('b.sprite_path = string.IsNullOrEmpty(src.sprite_path) ? src.main_path + src.id : src.sprite_path;');
      w.push('b.sprites_are_initiated = false;');
      w.push('b.building_sprites = null;');
      w.push('if (b.base_stats == null) b.base_stats = new BaseStats();');
      c.stats('b', e.stats).forEach(function (l) { w.push(l); });
      w.push('b.burnable = ' + B(e.burnable) + ';');
      w.push('b.can_be_demolished = ' + B(e.demolish) + ';');
      if (e.light) w.push('b.draw_light_area = true;');
      if (e.smoke) w.push('b.smoke = true;');
      if (e.spawnDrop) {
        w.push('b.spawn_drops = true;');
        w.push('b.spawn_drop_id = ' + c.cs(e.spawnDrop) + ';');
        w.push('b.spawn_drop_interval = ' + c.num(e.dropInterval) + ';');
        w.push('b.spawn_drop_start_height = 15f;');
        w.push('b.spawn_drop_min_height = 10f;');
        w.push('b.spawn_drop_max_height = 20f;');
        w.push('b.spawn_drop_min_radius = 0f;');
        w.push('b.spawn_drop_max_radius = 6f;');
      }
      if (e.spawnUnit) {
        w.push('b.spawn_units = true;');
        w.push('b.spawn_units_asset = ' + c.cs(e.spawnUnit) + ';');
      }
      if (e.towerProj) {
        w.push('b.tower = true;');
        w.push('b.tower_projectile = ' + c.cs(e.towerProj) + ';');
        w.push('b.tower_projectile_reload = ' + c.num(e.towerReload) + ';');
      }
      w.push('b.atlas_asset = AssetManager.dynamic_sprites_library.get(b.atlas_id) ?? AssetManager.dynamic_sprites_library.get("buildings");');
    },
    loc: function (e, put) { put(e.id, e.name); },
    validate: function (e, S, bad) {
      if (!e.baseId) bad('sem construção base / no base building');
    }
  });

  K.add({
    key: 'biomes', cls: 'BiomeContent', file: 'BiomeContent.cs', group: 'world', base: 'biome', nm: 'biome', late: true,
    label: ['Biomas', 'Biomes'], label1: ['Bioma', 'Biome'], newLabel: ['Novo bioma', 'New biome'],
    empty: ['Nenhum bioma ainda. Um bioma é uma cópia de um bioma do jogo com outras criaturas e plantas.', 'No biomes yet. A biome is a copy of a vanilla biome with other creatures and plants.'],
    intro: ['O bioma usa os tiles do bioma base. Listas vazias mantêm as do bioma base.', 'The biome uses the base biome tiles. Empty lists keep the base biome ones.'],
    fields: [
      TXN, TXD,
      { k: 'baseId', t: 'id', src: ['biomes'], l: ['Bioma base do jogo', 'Vanilla base biome'], d: 'biome_grass', ph: 'biome_grass', rsrc: ['biomes'] },
      { k: 'tileLow', t: 'id', src: ['topTiles'], l: ['Tile baixo (opcional)', 'Low tile (optional)'], ph: 'grass_low', norandom: true },
      { k: 'tileHigh', t: 'id', src: ['topTiles'], l: ['Tile alto (opcional)', 'High tile (optional)'], ph: 'grass_high', norandom: true },
      { t: 'h', l: ['Mundo', 'World'] },
      { k: 'pot', t: 'num', l: ['Peso na geração de mundo', 'World generation weight'], d: 4, min: 0, rnd: [2, 8] },
      { k: 'grow', t: 'num', l: ['Força de crescimento', 'Growth strength'], d: 5, min: 1, rnd: [3, 9] },
      { k: 'spread', t: 'bool', l: ['Espalha por conta própria', 'Spreads on its own'], d: true, rb: 0.8 },
      { k: 'cold', t: 'bool', l: ['Bioma frio', 'Cold biome'], d: false, rb: 0.2 },
      { k: 'dark', t: 'bool', l: ['Bioma escuro', 'Dark biome'], d: false, rb: 0.2 },
      { k: 'dropWater', t: 'bool', l: ['Espalha com chuva', 'Spreads with water drops'], d: true },
      { k: 'dropCurse', t: 'bool', l: ['Espalha com maldição', 'Spreads with curse drops'], d: false },
      { k: 'dropBless', t: 'bool', l: ['Espalha com bênção', 'Spreads with blessing drops'], d: false },
      { t: 'h', l: ['O que nasce aqui', 'What lives here'] },
      { k: 'units', t: 'ids', src: ['units'], l: ['Animais', 'Animals'], rn: 4 },
      { k: 'sapient', t: 'ids', src: ['units'], l: ['Povos', 'Peoples'], rn: 3 },
      { k: 'trees', t: 'ids', src: ['buildings'], l: ['Árvores', 'Trees'] },
      { k: 'plants', t: 'ids', src: ['buildings'], l: ['Plantas', 'Plants'] },
      { k: 'bushes', t: 'ids', src: ['buildings'], l: ['Arbustos', 'Bushes'] },
      { k: 'minerals', t: 'ids', src: ['buildings'], l: ['Minerais', 'Minerals'] }
    ],
    gen: function (e, S, w, c) {
      var G = 'System.Collections.Generic.';
      w.push('BiomeAsset b = AssetManager.biome_library.clone(' + c.cs(e.id) + ', ' + c.cs(e.baseId || 'biome_grass') + ');');
      w.push('b.localized_key = ' + c.cs(e.id) + ';');
      if (e.tileLow) w.push('b.tile_low = ' + c.cs(e.tileLow) + ';');
      if (e.tileHigh) w.push('b.tile_high = ' + c.cs(e.tileHigh) + ';');
      w.push('b.generator_pot_amount = ' + c.int(e.pot) + ';');
      w.push('b.grow_strength = ' + c.int(e.grow) + ';');
      w.push('b.spread_biome = ' + B(e.spread) + ';');
      w.push('b.cold_biome = ' + B(e.cold) + ';');
      w.push('b.dark_biome = ' + B(e.dark) + ';');
      w.push('b.spread_by_drops_water = ' + B(e.dropWater) + ';');
      w.push('b.spread_by_drops_curse = ' + B(e.dropCurse) + ';');
      w.push('b.spread_by_drops_blessing = ' + B(e.dropBless) + ';');
      [['units', 'pot_units_spawn', 'addUnit'], ['sapient', 'pot_sapient_units_spawn', 'addSapientUnit'], ['trees', 'pot_trees_spawn', 'addTree'], ['plants', 'pot_plants_spawn', 'addPlant'], ['bushes', 'pot_bushes_spawn', 'addBush'], ['minerals', 'pot_minerals_spawn', 'addMineral']].forEach(function (m) {
        if (!e[m[0]].length) return;
        w.push('b.' + m[1] + ' = new ' + G + 'List<string>();');
        e[m[0]].forEach(function (id) { w.push('b.' + m[2] + '(' + c.cs(id) + ');'); });
      });
      w.push('for (int i = 0; i < b.generator_pot_amount; i++)');
      w.push('{');
      w.push('\tBiomeLibrary.pool_biomes.Add(b);');
      w.push('}');
    },
    loc: function (e, put) {
      put(e.id, e.name);
      put(e.id + '_description', e.desc);
    },
    validate: function (e, S, bad) {
      if (!e.baseId) bad('sem bioma base / no base biome');
    }
  });

  K.add({
    key: 'resources', cls: 'ResourceContent', file: 'ResourceContent.cs', group: 'world', base: 'resource', nm: 'resource', late: true,
    label: ['Recursos', 'Resources'], label1: ['Recurso', 'Resource'], newLabel: ['Novo recurso', 'New resource'],
    empty: ['Nenhum recurso ainda. Recursos são metais, comidas e itens que as cidades guardam.', 'No resources yet. Resources are metals, foods and items that cities store.'],
    fields: [
      TXN,
      { k: 'type', t: 'sel', l: ['Tipo', 'Type'], o: O(['Ingredient', 'Strategic', 'Currency', 'Ingredient_Food', 'Food']), d: 'Ingredient' },
      { k: 'food', t: 'bool', l: ['É comida', 'Is food'], d: false, rb: 0.4 },
      { k: 'nutrition', t: 'num', l: ['Restaura fome', 'Restores nutrition'], d: 0, min: 0, rnd: [0, 60], step: 5 },
      { k: 'health', t: 'num', l: ['Restaura vida (0 a 1)', 'Restores health (0 to 1)'], d: 0, min: 0, step: 0.05, rnd: [0, 0.6], step2: 0.05 },
      { k: 'happiness', t: 'num', l: ['Restaura felicidade', 'Restores happiness'], d: 0, min: 0, rnd: [0, 15] },
      { k: 'tastiness', t: 'num', l: ['Sabor', 'Tastiness'], d: 1, step: 0.1, min: 0, rnd: [0.2, 2], step2: 0.1 },
      { k: 'cost', t: 'num', l: ['Valor em ouro', 'Gold value'], d: 2, min: 0, rnd: [1, 20] },
      { k: 'stack', t: 'num', l: ['Tamanho da pilha', 'Stack size'], d: 15, min: 1, rnd: [5, 40] },
      { k: 'max', t: 'num', l: ['Máximo guardado', 'Max stored'], d: 999, min: 1, rnd: [100, 999] },
      { k: 'img', t: 'img', l: ['Ícone', 'Icon'], size: '32x32', px: 16 },
      { k: 'iconVan', t: 'text', l: ['...ou ícone do jogo', '...or vanilla icon'], d: 'iconResGold', ph: 'iconResGold', norandom: true },
      { k: 'spriteVan', t: 'text', l: ['Sprite no mundo (do jogo)', 'World sprite (vanilla)'], d: 'bag_default', ph: 'bag_default', norandom: true }
    ],
    gen: function (e, S, w, c) {
      w.push('ResourceAsset r = new ResourceAsset();');
      w.push('r.id = ' + c.cs(e.id) + ';');
      w.push('r.path_icon = ' + c.cs(e.img ? 'resource_' + e.id : e.iconVan || 'iconResGold') + ';');
      w.push('r.type = ResType.' + e.type + ';');
      w.push('r.food = ' + B(e.food) + ';');
      w.push('r.restore_nutrition = ' + c.int(e.nutrition) + ';');
      w.push('r.restore_health = ' + c.num(e.health) + ';');
      w.push('r.restore_happiness = ' + c.int(e.happiness) + ';');
      w.push('r.tastiness = ' + c.num(e.tastiness) + ';');
      w.push('r.money_cost = ' + c.int(e.cost) + ';');
      w.push('r.stack_size = ' + c.int(e.stack) + ';');
      w.push('r.maximum = ' + c.int(e.max) + ';');
      w.push('r.path_gameplay_sprite = ' + c.cs(e.spriteVan || 'bag_default') + ';');
      w.push('AssetManager.resources.add(r);');
      w.push('r.order = AssetManager.resources.list.Count - 1;');
      w.push('r.full_sprite_path = "items/resources/" + r.path_gameplay_sprite;');
      w.push('r.gameplay_sprites = SpriteTextureLoader.getSpriteList(r.full_sprite_path);');
      w.push('if (r.type == ResType.Strategic) AssetManager.resources.strategic_resource_assets.Add(r);');
    },
    loc: function (e, put) { put(e.id, e.name); },
    imgs: function (e) {
      return [{ obj: e, key: 'img', path: 'GameResources/ui/Icons/resource_' + e.id + '.png', label: 'Resource icon ' + e.id, size: '32x32' }];
    }
  });

  K.add({
    key: 'spells', cls: 'SpellContent', file: 'SpellContent.cs', group: 'creatures', base: 'spell', nm: 'spell', late: true,
    label: ['Magias', 'Spells'], label1: ['Magia', 'Spell'], newLabel: ['Nova magia', 'New spell'],
    empty: ['Nenhuma magia ainda. Para uma criatura usar a magia, adicione-a na lista de magias da criatura.', 'No spells yet. To make a creature use it, add it to the creature spell list.'],
    fields: [
      TXN,
      { k: 'action', t: 'act', hook: 'attack', l: ['Efeito (ação de ataque)', 'Effect (attack action)'], rp: 1 },
      { k: 'chance', t: 'num', l: ['Chance de uso (0 a 1)', 'Cast chance (0 to 1)'], d: 0.2, step: 0.05, min: 0, max: 1, rnd: [0.05, 0.5], step2: 0.05 },
      { k: 'mana', t: 'num', l: ['Custo de mana', 'Mana cost'], d: 5, min: 0, rnd: [2, 25] },
      { k: 'health', t: 'num', l: ['Só usa com vida abaixo de (0 a 1)', 'Only below health ratio (0 to 1)'], d: 0, step: 0.1, min: 0, max: 1, rnd: [0, 0.8], step2: 0.1 },
      { k: 'minDistance', t: 'num', l: ['Distância mínima', 'Min distance'], d: 0, min: 0, rnd: [0, 8] },
      { k: 'target', t: 'sel', l: ['Alvo', 'Target'], o: O(['Enemy', 'Himself', 'Region', 'Friendly']), d: 'Enemy' },
      { k: 'entity', t: 'sel', l: ['Afeta', 'Affects'], o: O(['Both', 'UnitsOnly', 'BuildingsOnly', 'Tile']), d: 'Both' },
      { k: 'combat', t: 'bool', l: ['Pode usar em combate', 'Can be used in combat'], d: true, rb: 0.7 }
    ],
    gen: function (e, S, w, c) {
      w.push('SpellAsset s = new SpellAsset();');
      w.push('s.id = ' + c.cs(e.id) + ';');
      w.push('s.chance = ' + c.num(e.chance) + ';');
      w.push('s.cost_mana = ' + c.int(e.mana) + ';');
      w.push('s.health_ratio = ' + c.num(e.health) + ';');
      w.push('s.min_distance = ' + c.num(e.minDistance) + ';');
      w.push('s.cast_target = CastTarget.' + e.target + ';');
      w.push('s.cast_entity = CastEntity.' + e.entity + ';');
      w.push('s.can_be_used_in_combat = ' + B(e.combat) + ';');
      var r = e.action && c.act(e.action);
      if (r) w.push('s.action = ' + r + ';');
      w.push('AssetManager.spells.add(s);');
    },
    validate: function (e, S, bad) {
      if (!e.action) bad('sem ação de ataque / no attack action');
    }
  });

  K.add({
    key: 'clouds', cls: 'CloudContent', file: 'CloudContent.cs', group: 'world', base: 'cloud', nm: 'cloud', late: true,
    label: ['Nuvens', 'Clouds'], label1: ['Nuvem', 'Cloud'], newLabel: ['Nova nuvem', 'New cloud'],
    empty: ['Nenhuma nuvem ainda. Use nuvens em eras ou desastres para soltar drops do céu.', 'No clouds yet. Use clouds in ages to drop things from the sky.'],
    fields: [
      { k: 'color', t: 'color', l: ['Cor', 'Color'], d: '#8899bb' },
      { k: 'drop', t: 'id', src: ['drops'], l: ['Drop que cai', 'Drop that falls'], d: 'rain', ph: 'rain', rsrc: ['drops'] },
      { k: 'lightning', t: 'bool', l: ['Solta relâmpagos', 'Spawns lightning'], d: false, rb: 0.3 },
      { k: 'size', t: 'sel', l: ['Tamanho das nuvens', 'Cloud size'], o: [['big', ['Grandes', 'Big']], ['small', ['Pequenas', 'Small']], ['all', ['Todas', 'All']]], d: 'big' },
      { k: 'speedMin', t: 'num', l: ['Velocidade mínima', 'Min speed'], d: 1, min: 0.1, rnd: [0.5, 2], step: 0.5 },
      { k: 'speedMax', t: 'num', l: ['Velocidade máxima', 'Max speed'], d: 4, min: 0.1, rnd: [3, 7], step: 0.5 },
      { k: 'alpha', t: 'num', l: ['Opacidade máxima', 'Max opacity'], d: 0.8, step: 0.1, min: 0.1, max: 1, rnd: [0.5, 1], step2: 0.1 },
      { k: 'disaster', t: 'bool', l: ['Conta como desastre', 'Counts as disaster'], d: false },
      { k: 'light', t: 'bool', l: ['Emite luz', 'Emits light'], d: false }
    ],
    gen: function (e, S, w, c) {
      var sprites = {
        big: ['effects/clouds/cloud_big_1', 'effects/clouds/cloud_big_2', 'effects/clouds/cloud_big_3'],
        small: ['effects/clouds/cloud_small_1', 'effects/clouds/cloud_small_2'],
        all: ['effects/clouds/cloud_small_1', 'effects/clouds/cloud_small_2', 'effects/clouds/cloud_big_1', 'effects/clouds/cloud_big_2', 'effects/clouds/cloud_big_3']
      }[e.size || 'big'];
      w.push('CloudAsset c = new CloudAsset();');
      w.push('c.id = ' + c.cs(e.id) + ';');
      w.push('c.color_hex = ' + c.cs(e.color || '#8899bb') + ';');
      w.push('c.drop_id = ' + c.cs(e.drop || 'rain') + ';');
      w.push('c.speed_min = ' + c.num(e.speedMin) + ';');
      w.push('c.speed_max = ' + c.num(Math.max(Number(e.speedMax), Number(e.speedMin))) + ';');
      w.push('c.max_alpha = ' + c.num(e.alpha) + ';');
      w.push('c.path_sprites = new string[] { ' + c.list(sprites) + ' };');
      w.push('c.cloud_action_1 = AssetManager.clouds.get("cloud_rain").cloud_action_1;');
      if (e.lightning) w.push('c.cloud_action_2 = AssetManager.clouds.get("cloud_lightning").cloud_action_2;');
      if (e.disaster) w.push('c.considered_disaster = true;');
      if (e.light) w.push('c.draw_light_area = true;');
      w.push('AssetManager.clouds.add(c);');
      w.push('AssetManager.clouds.linkAssets();');
    }
  });

  K.add({
    key: 'laws', cls: 'LawContent', file: 'LawContent.cs', group: 'world', base: 'law', nm: 'law', late: true,
    label: ['Leis do mundo', 'World laws'], label1: ['Lei do mundo', 'World law'], newLabel: ['Nova lei', 'New law'],
    empty: ['Nenhuma lei ainda. Leis aparecem na janela de leis do mundo e podem condicionar ações.', 'No laws yet. Laws show up in the world laws window and can gate actions.'],
    fields: [
      TXN, TXD,
      { k: 'group', t: 'id', src: ['lawGroups'], l: ['Grupo da lei', 'Law group'], d: 'units', ph: 'units', rsrc: ['lawGroups'] },
      { k: 'def', t: 'bool', l: ['Ligada por padrão', 'On by default'], d: false, rb: true },
      { k: 'canOff', t: 'bool', l: ['Pode ser desligada', 'Can be turned off'], d: true },
      { k: 'onChange', t: 'act', hook: 'world', l: ['Ação ao ligar', 'Action when turned on'], rp: 0.3 },
      { k: 'img', t: 'img', l: ['Ícone', 'Icon'], size: '32x32', px: 16 },
      { k: 'iconVan', t: 'text', l: ['...ou ícone do jogo', '...or vanilla icon'], d: 'ui/Icons/worldrules/icon_mutant_box', norandom: true }
    ],
    gen: function (e, S, w, c) {
      w.push('WorldLawAsset l = new WorldLawAsset();');
      w.push('l.id = ' + c.cs(e.id) + ';');
      w.push('l.group_id = ' + c.cs(e.group || 'units') + ';');
      w.push('l.icon_path = ' + c.cs(e.img ? 'ui/Icons/worldrules/' + e.id : e.iconVan || 'ui/Icons/worldrules/icon_mutant_box') + ';');
      w.push('l.default_state = ' + B(e.def) + ';');
      w.push('l.can_turn_off = ' + B(e.canOff) + ';');
      var r = e.onChange && c.act(e.onChange);
      if (r) w.push('l.on_state_change = (PlayerOptionData option) => { if (option.boolVal) ' + r + '(null, null); };');
      w.push('AssetManager.world_laws_library.add(l);');
    },
    loc: function (e, put) {
      put(e.id + '_title', e.name);
      put(e.id + '_description', e.desc);
    },
    imgs: function (e) {
      return [{ obj: e, key: 'img', path: 'GameResources/ui/Icons/worldrules/' + e.id + '.png', label: 'Law icon ' + e.id, size: '32x32' }];
    }
  });

  K.add({
    key: 'achievements', cls: 'AchievementContent', file: 'AchievementContent.cs', group: 'world', base: 'achievement', nm: 'achievement', late: true,
    label: ['Conquistas', 'Achievements'], label1: ['Conquista', 'Achievement'], newLabel: ['Nova conquista', 'New achievement'],
    empty: ['Nenhuma conquista ainda. Conquistas são liberadas por uma ação do tipo Liberar conquista.', 'No achievements yet. They are unlocked by an action of the Unlock achievement type.'],
    intro: ['Experimental: a conquista só é liberada quando uma ação "Liberar conquista" roda.', 'Experimental: the achievement only unlocks when an "Unlock achievement" action runs.'],
    fields: [
      TXN, TXD,
      { k: 'group', t: 'id', src: ['achGroups'], l: ['Grupo', 'Group'], d: 'creatures', ph: 'creatures', rsrc: ['achGroups'] },
      { k: 'hidden', t: 'bool', l: ['Escondida até liberar', 'Hidden until unlocked'], d: false, rb: 0.3 },
      { k: 'img', t: 'img', l: ['Ícone', 'Icon'], size: '64x64', px: 16 },
      { k: 'iconVan', t: 'text', l: ['...ou ícone do jogo', '...or vanilla icon'], d: 'ui/Icons/achievements/achievements_theKing', norandom: true }
    ],
    gen: function (e, S, w, c) {
      w.push('Achievement a = new Achievement();');
      w.push('a.id = ' + c.cs(e.id) + ';');
      w.push('a.locale_key = ' + c.cs('achievement_' + e.id) + ';');
      w.push('a.group = ' + c.cs(e.group || 'creatures') + ';');
      w.push('a.hidden = ' + B(e.hidden) + ';');
      w.push('a.icon = ' + c.cs(e.img ? 'ui/Icons/achievements/' + e.id : e.iconVan || 'ui/Icons/achievements/achievements_theKing') + ';');
      w.push('a.action = (object checkData) => true;');
      w.push('AssetManager.achievements.add(a);');
    },
    loc: function (e, put) {
      put('achievement_' + e.id, e.name);
      put('achievement_' + e.id + '_description', e.desc);
    },
    imgs: function (e) {
      return [{ obj: e, key: 'img', path: 'GameResources/ui/Icons/achievements/' + e.id + '.png', label: 'Achievement icon ' + e.id, size: '64x64' }];
    }
  });

  K.add({
    key: 'powers', cls: 'CustomPowers', file: 'CustomPowers.cs', group: 'interface', base: 'power', nm: 'power', late: true,
    label: ['Poderes', 'Powers'], label1: ['Poder', 'Power'], newLabel: ['Novo poder', 'New power'],
    empty: ['Nenhum poder ainda. Poderes viram botões na aba do mod.', 'No powers yet. Powers become buttons in the mod tab.'],
    fields: [
      TXN, TXD,
      { k: 'kind', t: 'sel', l: ['Tipo', 'Kind'], o: [['drop', ['Soltar drop (pincel)', 'Spawn drop (brush)']], ['dropBuilding', ['Soltar construção', 'Drop a building']], ['click', ['Clique roda uma ação', 'Click runs an action']]], d: 'drop', rerender: true, fixed: true },
      { k: 'drop', t: 'id', src: ['drops'], l: ['Drop', 'Drop'], when: function (e) { return e.kind !== 'click'; }, rsrc: ['drops'], ph: 'acid' },
      { k: 'action', t: 'act', hook: 'world', l: ['Ação ao clicar', 'Action on click'], when: function (e) { return e.kind === 'click'; }, rp: 1 },
      { k: 'rank', t: 'sel', l: ['Posição de desbloqueio', 'Unlock rank'], o: O(['Rank0_free', 'Rank1_common', 'Rank2_normal', 'Rank3_good', 'Rank4_awesome']), d: 'Rank0_free', fixed: true },
      { k: 'img', t: 'img', l: ['Ícone do botão', 'Button icon'], size: '64x64', px: 16 }
    ],
    gen: function (e, S, w, c) {
      if (e.kind === 'click') {
        w.push('GodPower p = new GodPower();');
        w.push('p.id = ' + c.cs(e.id) + ';');
        w.push('p.name = ' + c.cs(e.id) + ';');
        w.push('p.unselect_when_window = true;');
        w.push('p.set_used_camera_drag_on_long_move = true;');
        w.push('p.rank = PowerRank.' + e.rank + ';');
        w.push('p.path_icon = ' + c.cs('button/' + e.id) + ';');
        var r = e.action && c.act(e.action);
        if (r) w.push('p.click_action = (WorldTile pTile, string pPower) => ' + r + '(null, pTile);');
        w.push('AssetManager.powers.add(p);');
        return;
      }
      w.push('GodPower p = AssetManager.powers.clone(' + c.cs(e.id) + ', ' + c.cs(e.kind === 'dropBuilding' ? '$template_drop_building$' : '$template_drops$') + ');');
      w.push('p.name = ' + c.cs(e.id) + ';');
      w.push('p.drop_id = ' + c.cs(e.drop) + ';');
      w.push('p.cached_drop_asset = AssetManager.drops.get(p.drop_id);');
      w.push('p.rank = PowerRank.' + e.rank + ';');
      w.push('p.path_icon = ' + c.cs('button/' + e.id) + ';');
    },
    loc: function (e, put) {
      put(e.id, e.name);
      put(e.id + ' Description', e.desc);
      put(e.id + '_description', e.desc);
    },
    imgs: function (e) {
      return [{ obj: e, key: 'img', path: 'GameResources/button/' + e.id + '.png', label: 'Power button ' + e.id, size: '64x64' }];
    },
    validate: function (e, S, bad) {
      if (e.kind === 'click' && !e.action) bad('sem ação / no action');
      if (e.kind !== 'click' && !e.drop) bad('sem drop / no drop');
    }
  });

  var EVENTS = [
    ['unit_created', ['Quando uma criatura é criada', 'When a creature is created'], 'Actor', 'newCreature', 'Actor __instance', '__instance'],
    ['baby_born', ['Quando um filhote nasce', 'When a baby is born'], 'BabyMaker', 'makeBaby', 'Actor __result', '__result'],
    ['unit_levelup', ['Quando sobe de nível', 'When a creature levels up'], 'Actor', 'levelUp', 'Actor __instance', '__instance'],
    ['unit_killed', ['Quando mata algo', 'When it kills something'], 'Actor', 'newKillAction', 'Actor __instance', '__instance'],
    ['unit_died', ['Quando uma criatura morre', 'When a creature dies'], 'Actor', 'die', 'Actor __instance', '__instance']
  ];

  K.add({
    key: 'events', cls: 'EventContent', file: 'EventContent.cs', group: 'logic', base: 'event', nm: 'event', raw: true,
    label: ['Eventos', 'Events'], label1: ['Evento', 'Event'], newLabel: ['Novo evento', 'New event'],
    empty: ['Nenhum evento ainda. Eventos rodam uma ação quando algo acontece no jogo.', 'No events yet. Events run an action when something happens in the game.'],
    fields: [
      { k: 'event', t: 'sel', l: ['Quando', 'When'], o: EVENTS.map(function (x) { return [x[0], x[1]]; }), d: 'unit_created' },
      { k: 'action', t: 'act', hook: 'world', l: ['Ação', 'Action'], rp: 1 },
      { k: 'chance', t: 'num', l: ['Chance (%)', 'Chance (%)'], d: 100, min: 0, max: 100, rnd: [10, 100], step: 5 },
      { k: 'unit', t: 'id', src: ['units'], l: ['Só para esta criatura (opcional)', 'Only for this creature (optional)'], ph: 'human', norandom: true }
    ],
    genFile: function (e, S, ns, c) {
      var ev = EVENTS.filter(function (x) { return x[0] === e.event; })[0] || EVENTS[0];
      var act = e.action && c.act(e.action);
      if (!act) return null;
      var cls = 'Event' + pascal(e.id);
      var v = ev[5];
      var body = [];
      body.push('if (' + v + ' == null) return;');
      if (e.unit) body.push('if (' + v + '.asset == null || ' + v + '.asset.id != ' + c.cs(e.unit) + ') return;');
      if (Number(e.chance) < 100) body.push('if (!Randy.randomChance(' + c.num(Math.max(0, Number(e.chance)) / 100) + ')) return;');
      body.push('if (_busy) return;');
      body.push('_busy = true;');
      body.push('try');
      body.push('{');
      body.push('\t' + act + '(' + v + ', ' + v + '.current_tile);');
      body.push('}');
      body.push('finally');
      body.push('{');
      body.push('\t_busy = false;');
      body.push('}');
      var lines = [
        'using HarmonyLib;',
        '',
        'namespace ' + ns,
        '{',
        '\tinternal static class ' + cls,
        '\t{',
        '\t\tprivate static bool _busy;',
        '',
        '\t\t[HarmonyPostfix]',
        '\t\t[HarmonyPatch(typeof(' + ev[2] + '), ' + c.cs(ev[3]) + ')]',
        '\t\tprivate static void Run(' + ev[4] + ')',
        '\t\t{'
      ];
      body.forEach(function (l) { lines.push('\t\t\t' + l); });
      lines.push('\t\t}', '\t}', '}');
      return { file: 'Event_' + e.id + '.cs', text: lines.join('\n') + '\n' };
    },
    validate: function (e, S, bad) {
      if (!e.action) bad('sem ação / no action');
    }
  });

  var BASE_ICON = { human: 'ui/Icons/iconHumans', elf: 'ui/Icons/iconElves', orc: 'ui/Icons/iconOrcs', dwarf: 'ui/Icons/iconDwarf' };
  var GENOME = [
    ['health', ['Vida', 'Health'], 100, [60, 220], 10],
    ['damage', ['Dano', 'Damage'], 15, [8, 40], 1],
    ['speed', ['Velocidade', 'Speed'], 15, [8, 30], 1],
    ['stamina', ['Estamina', 'Stamina'], 100, [60, 160], 10],
    ['lifespan', ['Expectativa de vida', 'Lifespan'], 70, [40, 300], 10],
    ['armor', ['Armadura', 'Armor'], 0, [0, 8], 1],
    ['offspring', ['Filhotes', 'Offspring'], 5, [2, 9], 1],
    ['mutation', ['Mutação', 'Mutation'], 1, [0, 4], 1],
    ['diplomacy', ['Diplomacia', 'Diplomacy'], 3, [1, 8], 1],
    ['warfare', ['Guerra', 'Warfare'], 3, [1, 8], 1],
    ['stewardship', ['Administração', 'Stewardship'], 3, [1, 8], 1],
    ['intelligence', ['Inteligência', 'Intelligence'], 3, [1, 8], 1]
  ];

  var BUILD_SLOTS = [
    ['house', 'order_house_0', ['Casa', 'House'], 'house_{x}_0'],
    ['hall', 'order_hall_0', ['Salão (prédio principal)', 'Hall (main building)'], 'hall_{x}_0'],
    ['windmill', 'order_windmill_0', ['Moinho', 'Windmill'], 'windmill_{x}_0'],
    ['fdocks', 'order_docks_0', ['Doca de pesca', 'Fishing dock'], 'fishing_docks_{x}'],
    ['docks', 'order_docks_1', ['Porto', 'Harbor'], 'docks_{x}'],
    ['tower', 'order_watch_tower', ['Torre de vigia', 'Watch tower'], 'watch_tower_{x}'],
    ['temple', 'order_temple', ['Templo', 'Temple'], 'temple_{x}'],
    ['library', 'order_library', ['Biblioteca', 'Library'], 'library_{x}'],
    ['barracks', 'order_barracks', ['Quartel', 'Barracks'], 'barracks_{x}']
  ];

  function csv(txt) {
    return String(txt || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  }

  var speciesFields = [
    TXN, TXD,
    { t: 'h', l: ['Base', 'Base'] },
    { k: 'base', t: 'sel', l: ['Espécie base (sprites, construções e animações)', 'Base species (sprites, buildings and animations)'], o: [['human', ['Humano', 'Human']], ['elf', ['Elfo', 'Elf']], ['orc', ['Orc', 'Orc']], ['dwarf', ['Anão', 'Dwarf']]], d: 'human', hint: ['A nova espécie usa a aparência e o estilo de construção da base. O resto você muda aqui.', 'The new species uses the base look and building style. Everything else you change here.'] },
    { k: 'color', t: 'color', l: ['Cor da espécie', 'Species color'], d: '#5a7fd6' },
    { k: 'kingdomColor', t: 'color', l: ['Cor padrão do reino', 'Default kingdom color'], d: '#5a7fd6' },
    { k: 'img', t: 'img', l: ['Ícone da espécie', 'Species icon'], size: '32x32', px: 16 },
    { t: 'h', l: ['Genoma', 'Genome'] }
  ].concat(GENOME.map(function (g) {
    return { k: 'g_' + g[0], t: 'num', l: g[1], d: g[2], min: 0, rnd: g[3], step: g[4] };
  })).concat([
    { t: 'h', l: ['Civilização', 'Civilization'] },
    { k: 'cities', t: 'num', l: ['Cidades iniciais do reino', 'Base number of cities'], d: 4, min: 1, rnd: [2, 6], step: 1 },
    { k: 'family', t: 'num', l: ['Limite de família', 'Family limit'], d: 30, min: 2, rnd: [10, 40], step: 1 },
    { k: 'nameSets', t: 'ids', src: ['nameSets'], l: ['Conjuntos de nomes (do jogo)', 'Name sets (vanilla)'], hint: ['Vazio = usa os da espécie base.', 'Empty = use the base species ones.'], rn: 1, rmin: 0 },
    { k: 'production', t: 'ids', src: ['foods'], l: ['Comidas que a espécie produz', 'Foods the species makes'], rn: 2 },
    { k: 'friendly', t: 'ids', src: ['kingdomTags'], l: ['Amigável com (tags de reino)', 'Friendly with (kingdom tags)'], rn: 2 },
    { k: 'enemy', t: 'ids', src: ['kingdomTags'], l: ['Inimigo de (tags de reino)', 'Enemy of (kingdom tags)'], rn: 1 },
    { t: 'h', l: ['Nomes próprios', 'Own names'] },
    { k: 'nameNote', t: 'note', l: ['Se você preencher, a espécie ganha nomes só dela, montados juntando um começo e um fim. Separe com vírgula. Deixe vazio para usar os conjuntos de nomes do jogo.', 'If you fill these in, the species gets its own names, built by joining a start and an end. Separate with commas. Leave empty to use the game name sets.'] },
    { k: 'pStart', t: 'text', l: ['Pessoas: começos', 'People: starts'], ph: 'Ka, Ro, Zar', norandom: true },
    { k: 'pEnd', t: 'text', l: ['Pessoas: finais', 'People: ends'], ph: 'rak, dun, gor', norandom: true },
    { k: 'cStart', t: 'text', l: ['Cidades e reinos: começos', 'Cities and kingdoms: starts'], ph: 'Ash, Dun, Stone', norandom: true },
    { k: 'cEnd', t: 'text', l: ['Cidades e reinos: finais', 'Cities and kingdoms: ends'], ph: 'hold, mere, fall', norandom: true },
    { k: 'mStart', t: 'text', l: ['Culturas, idiomas e religiões: começos', 'Cultures, languages and religions: starts'], ph: 'Ae, Ly, Sil', norandom: true },
    { k: 'mEnd', t: 'text', l: ['Culturas, idiomas e religiões: finais', 'Cultures, languages and religions: ends'], ph: 'wen, riel, thil', norandom: true },
    { t: 'h', l: ['Estilo próprio de construção e bandeira', 'Own building style and banner'] },
    { k: 'styleNote', t: 'note', l: ['Ligue para a espécie ter prédios e bandeira só dela. Cada prédio que você não desenhar usa o da espécie base. Desenhos de prédio: sugestão 32x32.', 'Turn on so the species has its own buildings and banner. Any building you do not draw uses the base species one. Building drawings: suggested 32x32.'] },
    { k: 'ownStyle', t: 'bool', l: ['Usar estilo próprio de construção', 'Use own building style'], d: false, rerender: true, rb: 0.3 }
  ].concat(BUILD_SLOTS.map(function (b) {
    return { k: 'b_' + b[0], t: 'img', anim: true, l: b[2], size: '32x32', px: 24, when: function (e) { return e.ownStyle; } };
  })).concat([
    { k: 'banBg', t: 'img', l: ['Bandeira: fundo', 'Banner: background'], size: '32x32', px: 16 },
    { k: 'banIcon', t: 'img', l: ['Bandeira: símbolo', 'Banner: symbol'], size: '32x32', px: 16 },
    { t: 'h', l: ['Traços padrão (somados aos da espécie base)', 'Default traits (added on top of the base species ones)'] },
    { k: 'traits', t: 'ids', src: ['traits'], l: ['Traços de criatura', 'Creature traits'], rn: 3 },
    { k: 'subTraits', t: 'ids', src: ['subTraits'], l: ['Traços de subespécie extras', 'Extra subspecies traits'], rn: 3 },
    { k: 'cultureTraits', t: 'ids', src: ['cultureTraits'], l: ['Traços de cultura extras', 'Extra culture traits'], rn: 3 },
    { k: 'langTraits', t: 'ids', src: ['langTraits'], l: ['Traços de idioma extras', 'Extra language traits'], rn: 2 },
    { k: 'clanTraits', t: 'ids', src: ['clanTraits'], l: ['Traços de clã extras', 'Extra clan traits'], rn: 2 },
    { k: 'relTraits', t: 'ids', src: ['relTraits'], l: ['Traços de religião extras', 'Extra religion traits'], rn: 2 },
    { t: 'h', l: ['Atributos extras', 'Extra stats'] },
    { k: 'stats', t: 'stats' }
  ]));

  K.add({
    key: 'species', cls: 'SpeciesContent', file: 'SpeciesContent.cs', group: 'creatures', base: 'species', nm: 'species', late: true,
    label: ['Espécies', 'Species'], label1: ['Espécie', 'Species'], newLabel: ['Nova espécie', 'New species'],
    empty: ['Nenhuma espécie ainda. Uma espécie é uma civilização completa: cria cidades, reino, cultura, religião e idioma.', 'No species yet. A species is a full civilization: it founds cities, a kingdom, culture, religion and language.'],
    intro: ['Cada espécie ganha um reino nômade e um reino civilizado próprios. A aparência e as construções vêm da espécie base escolhida.', 'Each species gets its own nomad and civilized kingdoms. The look and buildings come from the chosen base species.'],
    fields: speciesFields,
    gen: function (e, S, w, c) {
      var base = e.base || 'human';
      var id = e.id;
      var cs = c.cs;
      var ownNames = csv(e.pStart).length && csv(e.pEnd).length;
      var placeNames = csv(e.cStart).length && csv(e.cEnd).length;
      var metaNames = csv(e.mStart).length && csv(e.mEnd).length;
      function gen(suffix, starts, ends, tpls) {
        w.push('{');
        w.push('NameGeneratorAsset g = new NameGeneratorAsset();');
        w.push('g.id = ' + cs(id + '_' + suffix) + ';');
        w.push('g.special1 = new string[] { ' + c.list(csv(starts).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); })) + ' };');
        w.push('g.parts = new string[] { ' + c.list(csv(ends).map(function (x) { return x.toLowerCase(); })) + ' };');
        w.push('g.vowels = NameGeneratorAsset.vowels_all;');
        w.push('g.consonants = NameGeneratorAsset.consonants_all;');
        tpls.forEach(function (t) { w.push('g.addTemplate(' + cs(t) + ');'); });
        w.push('AssetManager.name_generator.add(g);');
        w.push('}');
      }
      var person = id + '_person';
      var place = placeNames ? id + '_place' : person;
      var meta = metaNames ? id + '_meta' : person;
      if (ownNames) gen('person', e.pStart, e.pEnd, ['special1,part', 'special1,part', 'special1,part,part']);
      if (placeNames) gen('place', e.cStart, e.cEnd, ['special1,part', 'special1,part', 'special1, ,special1,part']);
      if (metaNames) gen('meta', e.mStart, e.mEnd, ['special1,part', 'special1,part,part']);
      if (ownNames || placeNames || metaNames) {
        w.push('{');
        w.push('NameSetAsset ns = new NameSetAsset();');
        w.push('ns.id = ' + cs(id + '_set') + ';');
        w.push('ns.unit = ' + cs(ownNames ? person : 'default_name') + ';');
        w.push('ns.family = ' + cs(ownNames ? person : 'default_name') + ';');
        w.push('ns.clan = ' + cs(ownNames ? person : 'default_name') + ';');
        w.push('ns.city = ' + cs(placeNames ? place : (ownNames ? person : 'default_name')) + ';');
        w.push('ns.kingdom = ' + cs(placeNames ? place : (ownNames ? person : 'default_name')) + ';');
        w.push('ns.culture = ' + cs(metaNames ? meta : (ownNames ? person : 'default_name')) + ';');
        w.push('ns.language = ' + cs(metaNames ? meta : (ownNames ? person : 'default_name')) + ';');
        w.push('ns.religion = ' + cs(metaNames ? meta : (ownNames ? person : 'default_name')) + ';');
        w.push('AssetManager.name_sets.add(ns);');
        w.push('}');
      }
      var own = e.ownStyle ? BUILD_SLOTS.filter(function (b) { return e['b_' + b[0]]; }) : [];
      if (e.ownStyle) {
        w.push('ArchitectureAsset a = AssetManager.architecture_library.clone(' + cs(id) + ', "$template_with_generated_buildings$");');
        w.push('a.generation_target = ' + cs(base) + ';');
        w.push('a.actor_asset_id_trading = ' + cs('boat_trading_' + base) + ';');
        w.push('a.actor_asset_id_transport = ' + cs('boat_transport_' + base) + ';');
        BUILD_SLOTS.forEach(function (b) {
          w.push('a.addBuildingOrderKey(' + cs(b[1]) + ', ' + cs(b[3].replace('{x}', id)) + ');');
        });
        w.push('foreach ((string, string) shared in a.shared_building_orders) a.addBuildingOrderKey(shared.Item1, shared.Item2);');
        w.push('System.Collections.Generic.HashSet<string> drawn = new System.Collections.Generic.HashSet<string> { ' + c.list(own.map(function (b) { return b[1]; })) + ' };');
        w.push('foreach (string order in a.styled_building_orders)');
        w.push('{');
        w.push('BuildingAsset src = AssetManager.architecture_library.get(a.generation_target).getBuilding(order);');
        w.push('BuildingAsset b = AssetManager.buildings.clone(a.building_ids_for_construction[order], src.id);');
        w.push('b.group = "civ_building";');
        w.push('b.mini_civ_auto_load = true;');
        w.push('b.civ_kingdom = a.id;');
        w.push('b.main_path = "buildings/civ_main/" + a.id + "/";');
        w.push('b.can_be_upgraded = false;');
        w.push('b.has_sprite_construction = true;');
        w.push('b.material = a.material;');
        w.push('b.shadow = a.has_shadows;');
        w.push('b.burnable = a.burnable_buildings;');
        w.push('b.affected_by_acid = a.acid_affected_buildings;');
        w.push('if (!string.IsNullOrEmpty(b.upgrade_to)) b.upgrade_to = b.upgrade_to.Replace("_" + a.generation_target, "_" + a.id);');
        w.push('if (!string.IsNullOrEmpty(b.upgraded_from)) b.upgraded_from = b.upgraded_from.Replace("_" + a.generation_target, "_" + a.id);');
        w.push('switch (order)');
        w.push('{');
        w.push('case "order_hall_0": b.fundament = new BuildingFundament(3, 3, 4, 0); break;');
        w.push('case "order_temple": b.fundament = new BuildingFundament(2, 2, 3, 0); break;');
        w.push('case "order_watch_tower": b.fundament = new BuildingFundament(1, 1, 1, 0); break;');
        w.push('case "order_library": b.fundament = new BuildingFundament(2, 2, 2, 0); break;');
        w.push('case "order_windmill_0": b.fundament = new BuildingFundament(2, 2, 2, 0); break;');
        w.push('case "order_docks_0": b.upgrade_to = ' + cs('docks_' + id) + '; b.can_be_upgraded = true; break;');
        w.push('case "order_docks_1": b.upgraded_from = ' + cs('fishing_docks_' + id) + '; b.upgrade_to = string.Empty; b.can_be_upgraded = false; b.has_sprites_main_disabled = false; break;');
        w.push('}');
        w.push('if (b.upgrade_to == b.id) { b.upgrade_to = string.Empty; b.can_be_upgraded = false; }');
        w.push('if (drawn.Contains(order)) b.sprite_path = string.Empty;');
        w.push('else b.sprite_path = string.IsNullOrEmpty(src.sprite_path) ? src.main_path + src.id : src.sprite_path;');
        w.push('b.atlas_asset = AssetManager.dynamic_sprites_library.get(b.atlas_id) ?? AssetManager.dynamic_sprites_library.get("buildings");');
        w.push('}');
        w.push('foreach (string order in a.styled_building_orders)');
        w.push('{');
        w.push('BuildingAsset bb = AssetManager.buildings.get(a.building_ids_for_construction[order]);');
        w.push('if (bb == null) continue;');
        w.push('if (!string.IsNullOrEmpty(bb.upgrade_to) && !AssetManager.buildings.has(bb.upgrade_to)) { bb.upgrade_to = string.Empty; bb.can_be_upgraded = false; }');
        w.push('if (!string.IsNullOrEmpty(bb.upgraded_from) && !AssetManager.buildings.has(bb.upgraded_from)) bb.upgraded_from = string.Empty;');
        w.push('}');
      }
      var banner = e.banBg && e.banIcon;
      w.push('ActorAsset t = AssetManager.actor_library.clone(' + cs(id) + ', ' + cs(base) + ');');
      w.push('t.name_locale = ' + cs(id) + ';');
      w.push('t.shadow = false;');
      w.push('t.use_phenotypes = false;');
      w.push('t.kingdom_id_wild = ' + cs('nomads_' + id) + ';');
      w.push('t.kingdom_id_civilization = ' + cs(id) + ';');
      if (e.ownStyle) {
        w.push('t.architecture_id = ' + cs(id) + ';');
        w.push('t.build_order_template_id = "build_order_basic_2";');
      }
      if (banner) w.push('t.banner_id = ' + cs(id) + ';');
      if (ownNames || placeNames || metaNames) w.push('t.name_template_sets = new string[] { ' + cs(id + '_set') + ' };');
      if (e.color) w.push('t.color_hex = ' + cs(e.color) + ';');
      w.push('t.icon = ' + cs(e.img ? 'species_' + id : BASE_ICON[base].replace('ui/Icons/', '')) + ';');
      w.push('t.civ_base_cities = ' + c.int(e.cities) + ';');
      w.push('t.family_limit = ' + c.int(e.family) + ';');
      w.push('t.genome_parts.Clear();');
      var parts = GENOME.map(function (g) { return '(' + cs(g[0]) + ', ' + c.num(e['g_' + g[0]]) + ')'; });
      w.push('t.addGenome(' + parts.join(', ') + ');');
      c.stats('t', e.stats).forEach(function (l) { w.push(l); });
      if (!(ownNames || placeNames || metaNames) && e.nameSets.length) w.push('t.name_template_sets = new string[] { ' + c.list(e.nameSets) + ' };');
      if (e.production.length) w.push('t.production = new string[] { ' + c.list(e.production) + ' };');
      var lists = [['traits', 'addTrait'], ['subTraits', 'addSubspeciesTrait'], ['cultureTraits', 'addCultureTrait'], ['langTraits', 'addLanguageTrait'], ['clanTraits', 'addClanTrait'], ['relTraits', 'addReligionTrait']];
      lists.forEach(function (l) {
        e[l[0]].forEach(function (x) { w.push('t.' + l[1] + '(' + cs(x) + ');'); });
      });
      w.push('KingdomAsset k = AssetManager.kingdoms.clone(' + cs('nomads_' + id) + ', "$TEMPLATE_NOMAD$");');
      w.push('k.group_main = true;');
      w.push('k.default_kingdom_color = ColorAsset.tryMakeNewColorAsset(' + cs(e.kingdomColor || '#5a7fd6') + ');');
      w.push('k.setIcon(' + cs(e.img ? 'ui/Icons/species_' + id : BASE_ICON[base]) + ');');
      w.push('k.addTag(' + cs(id) + ');');
      w.push('k.addTag("sliceable");');
      w.push('k.addFriendlyTag(' + cs(id) + ');');
      e.friendly.forEach(function (x) { w.push('k.addFriendlyTag(' + cs(x) + ');'); });
      e.enemy.forEach(function (x) { w.push('k.addEnemyTag(' + cs(x) + ');'); });
      w.push('k = AssetManager.kingdoms.clone(' + cs(id) + ', ' + cs('nomads_' + id) + ');');
      w.push('k.group_main = true;');
            w.push('k.civ = true;');
      w.push('k.mobs = false;');
    },
    loc: function (e, put) {
      put(e.id, e.name);
      put(e.id + '_description', e.desc);
    },
    imgs: function (e) {
      var out = [{ obj: e, key: 'img', path: 'GameResources/ui/Icons/species_' + e.id + '.png', label: 'Species icon ' + e.id, size: '32x32' }];
      if (e.ownStyle) {
        BUILD_SLOTS.forEach(function (b) {
          var folder = 'GameResources/buildings/civ_main/' + e.id + '/' + b[3].replace('{x}', e.id) + '/';
          out.push({ obj: e, key: 'b_' + b[0], path: folder + 'main_0.png', fr: function (i, n) { return n < 2 ? folder + 'main_0.png' : folder + 'main_0_' + MM.img.pad(i) + '.png'; }, label: 'Building ' + b[0] + ' main', size: '32x32' });
          ['construction_0', 'ruin_0'].forEach(function (nm) {
            out.push({ obj: e, key: 'b_' + b[0], path: folder + nm + '.png', fixed: true, label: 'Building ' + b[0] + ' ' + nm, size: '32x32' });
          });
        });
      }
      out.push({ obj: e, key: 'banBg', path: 'GameResources/banners_kingdoms/' + e.id + '/background/0.png', label: 'Banner background ' + e.id, size: '32x32' });
      out.push({ obj: e, key: 'banIcon', path: 'GameResources/banners_kingdoms/' + e.id + '/icon/0.png', label: 'Banner icon ' + e.id, size: '32x32' });
      return out;
    },
    afterRandom: function (e) {
      var R = MM.random;
      var th = R.theme();
      function words(list, n) { return R.sample(list, n).join(', '); }
      e.pStart = words(th.s, 5);
      e.pEnd = words(th.e, 5);
      e.cStart = words(th.s, 4);
      e.cEnd = words(['hold', 'mere', 'fall', 'reach', 'gard', 'haven', 'spire', 'dale', 'wick', 'stead'], 4);
      e.mStart = words(th.s, 4);
      e.mEnd = words(th.e, 4);
    },
    validate: function (e, S, bad) {
      if (!e.base) bad('sem espécie base / no base species');
      if ((e.banBg && !e.banIcon) || (!e.banBg && e.banIcon)) bad('a bandeira precisa de fundo e símbolo juntos / banner needs both background and symbol');
      if ((csv(e.pStart).length === 0) !== (csv(e.pEnd).length === 0)) bad('nomes de pessoas precisam de começos e finais / people names need starts and ends');
      if ((csv(e.cStart).length === 0) !== (csv(e.cEnd).length === 0)) bad('nomes de cidades precisam de começos e finais / city names need starts and ends');
      if ((csv(e.mStart).length === 0) !== (csv(e.mEnd).length === 0)) bad('nomes de culturas precisam de começos e finais / culture names need starts and ends');
    }
  });

  K.add({
    key: 'codes', cls: 'CustomCode', file: 'CustomCode.cs', group: 'advanced', base: 'code', nm: 'trait', raw: true,
    label: ['Código livre', 'Custom code'], label1: ['Arquivo de código', 'Code file'], newLabel: ['Novo código', 'New code'],
    empty: ['Nenhum código ainda. Para quem sabe C#: cole um arquivo, um bloco de inicialização ou um patch Harmony.', 'No code yet. For people who know C#: paste a file, an init block or a Harmony patch.'],
    intro: ['O Neo Mod Maker não verifica este código. Erros de compilação aparecem no log do jogo.', 'Neo Mod Maker does not check this code. Compile errors show up in the game log.'],
    fields: [
      { k: 'mode', t: 'sel', l: ['Modo', 'Mode'], o: [['init', ['Bloco de inicialização (roda ao carregar o mod)', 'Init block (runs when the mod loads)']], ['harmony', ['Patch Harmony', 'Harmony patch']], ['raw', ['Arquivo C# completo', 'Full C# file']]], d: 'init', rerender: true, fixed: true },
      { k: 'target', t: 'text', l: ['Classe alvo', 'Target class'], ph: 'Actor', d: 'Actor', when: function (e) { return e.mode === 'harmony'; }, norandom: true },
      { k: 'method', t: 'text', l: ['Método alvo', 'Target method'], ph: 'die', d: '', when: function (e) { return e.mode === 'harmony'; }, norandom: true },
      { k: 'patch', t: 'sel', l: ['Tipo de patch', 'Patch kind'], o: O(['Postfix', 'Prefix']), d: 'Postfix', when: function (e) { return e.mode === 'harmony'; }, fixed: true },
      { k: 'params', t: 'text', l: ['Parâmetros', 'Parameters'], ph: 'Actor __instance', d: 'Actor __instance', when: function (e) { return e.mode === 'harmony'; }, norandom: true },
      { k: 'body', t: 'area', l: ['Código', 'Code'], norandom: true }
    ],
    genFile: function (e, S, ns, c) {
      var body = String(e.body || '').replace(/\r/g, '');
      if (e.mode === 'raw') return body.trim() ? { file: 'Custom_' + e.id + '.cs', text: body + '\n' } : null;
      var ind = function (n) { return body.split('\n').map(function (l) { return l.length ? n + l : l; }).join('\n'); };
      if (e.mode === 'harmony') {
        if (!e.target || !e.method) return null;
        var cls = 'Patch' + pascal(e.id);
        var text = [
          'using HarmonyLib;',
          '',
          'namespace ' + ns,
          '{',
          '\tinternal static class ' + cls,
          '\t{',
          '\t\t[Harmony' + (e.patch === 'Prefix' ? 'Prefix' : 'Postfix') + ']',
          '\t\t[HarmonyPatch(typeof(' + e.target + '), ' + c.cs(e.method) + ')]',
          '\t\tprivate static ' + (e.patch === 'Prefix' ? 'bool' : 'void') + ' Run(' + (e.params || '') + ')',
          '\t\t{',
          ind('\t\t\t'),
          e.patch === 'Prefix' ? '\t\t\treturn true;' : '',
          '\t\t}',
          '\t}',
          '}'
        ].filter(function (l) { return l !== ''; }).join('\n') + '\n';
        return { file: 'Patch_' + e.id + '.cs', text: text };
      }
      var name = 'Custom' + pascal(e.id);
      var t2 = ['namespace ' + ns, '{', '\tpublic static class ' + name, '\t{', '\t\tpublic static void Init()', '\t\t{', ind('\t\t\t'), '\t\t}', '\t}', '}'].join('\n') + '\n';
      return { file: 'Custom_' + e.id + '.cs', text: t2, init: name };
    },
    validate: function (e, S, bad) {
      if (e.mode === 'harmony' && (!e.target || !e.method)) bad('faltam classe e método / target class and method required');
    }
  });
})();
