MM.data = {
  gameVersion: 'WorldBox (Assembly atual)',

  stats: [
    { id: 'health', pt: 'Vida', en: 'Health', step: 10 },
    { id: 'damage', pt: 'Dano', en: 'Damage', step: 1 },
    { id: 'armor', pt: 'Armadura', en: 'Armor', step: 1 },
    { id: 'speed', pt: 'Velocidade', en: 'Speed', step: 1 },
    { id: 'attack_speed', pt: 'Velocidade de ataque', en: 'Attack speed', step: 0.5 },
    { id: 'range', pt: 'Alcance', en: 'Range', step: 1 },
    { id: 'accuracy', pt: 'Precisão', en: 'Accuracy', step: 1 },
    { id: 'critical_chance', pt: 'Chance de crítico', en: 'Critical chance', step: 0.05 },
    { id: 'critical_damage_multiplier', pt: 'Multiplicador de crítico', en: 'Critical multiplier', step: 0.1 },
    { id: 'lifespan', pt: 'Vida útil', en: 'Lifespan', step: 5 },
    { id: 'stamina', pt: 'Stamina', en: 'Stamina', step: 5 },
    { id: 'mana', pt: 'Mana', en: 'Mana', step: 5 },
    { id: 'size', pt: 'Tamanho', en: 'Size', step: 0.1 },
    { id: 'scale', pt: 'Escala', en: 'Scale', step: 0.01 },
    { id: 'area_of_effect', pt: 'Área de efeito', en: 'Area of effect', step: 1 },
    { id: 'knockback', pt: 'Repulsão', en: 'Knockback', step: 0.1 },
    { id: 'targets', pt: 'Alvos', en: 'Targets', step: 1 },
    { id: 'projectiles', pt: 'Projéteis', en: 'Projectiles', step: 1 },
    { id: 'mass', pt: 'Massa', en: 'Mass', step: 1 },
    { id: 'recoil', pt: 'Recuo', en: 'Recoil', step: 0.1 },
    { id: 'throwing_range', pt: 'Alcance de arremesso', en: 'Throwing range', step: 1 },
    { id: 'offspring', pt: 'Filhos', en: 'Offspring', step: 1 },
    { id: 'birth_rate', pt: 'Taxa de nascimento', en: 'Birth rate', step: 1 },
    { id: 'maturation', pt: 'Maturação', en: 'Maturation', step: 1 },
    { id: 'mutation', pt: 'Mutação', en: 'Mutation', step: 1 },
    { id: 'experience', pt: 'Experiência', en: 'Experience', step: 1 },
    { id: 'happiness', pt: 'Felicidade', en: 'Happiness', step: 1 },
    { id: 'opinion', pt: 'Opinião', en: 'Opinion', step: 1 },
    { id: 'intelligence', pt: 'Inteligência', en: 'Intelligence', step: 1 },
    { id: 'diplomacy', pt: 'Diplomacia', en: 'Diplomacy', step: 1 },
    { id: 'warfare', pt: 'Guerra', en: 'Warfare', step: 1 },
    { id: 'stewardship', pt: 'Administração', en: 'Stewardship', step: 1 },
    { id: 'army', pt: 'Exército', en: 'Army', step: 1 },
    { id: 'cities', pt: 'Cidades', en: 'Cities', step: 1 },
    { id: 'bonus_towers', pt: 'Torres bônus', en: 'Bonus towers', step: 1 },
    { id: 'loyalty_traits', pt: 'Lealdade (traços)', en: 'Loyalty (traits)', step: 1 },
    { id: 'construction_speed', pt: 'Velocidade de construção', en: 'Construction speed', step: 1 },
    { id: 'skill_combat', pt: 'Habilidade de combate', en: 'Combat skill', step: 0.05 },
    { id: 'skill_spell', pt: 'Habilidade de magia', en: 'Spell skill', step: 0.05 },
    { id: 'multiplier_health', pt: 'Multiplicador de vida', en: 'Health multiplier', step: 0.05 },
    { id: 'multiplier_damage', pt: 'Multiplicador de dano', en: 'Damage multiplier', step: 0.05 },
    { id: 'multiplier_speed', pt: 'Multiplicador de velocidade', en: 'Speed multiplier', step: 0.05 },
    { id: 'multiplier_attack_speed', pt: 'Multiplicador de vel. de ataque', en: 'Attack speed multiplier', step: 0.05 },
    { id: 'multiplier_lifespan', pt: 'Multiplicador de vida útil', en: 'Lifespan multiplier', step: 0.05 },
    { id: 'multiplier_crit', pt: 'Multiplicador de crítico (%)', en: 'Crit multiplier (%)', step: 0.05 },
    { id: 'multiplier_stamina', pt: 'Multiplicador de stamina', en: 'Stamina multiplier', step: 0.05 },
    { id: 'multiplier_mana', pt: 'Multiplicador de mana', en: 'Mana multiplier', step: 0.05 },
    { id: 'multiplier_diplomacy', pt: 'Multiplicador de diplomacia', en: 'Diplomacy multiplier', step: 0.05 },
    { id: 'multiplier_offspring', pt: 'Multiplicador de filhos', en: 'Offspring multiplier', step: 0.05 },
    { id: 'multiplier_mass', pt: 'Multiplicador de massa', en: 'Mass multiplier', step: 0.05 }
  ],

  traitTypes: [
    { id: 'Positive', pt: 'Positivo', en: 'Positive' },
    { id: 'Negative', pt: 'Negativo', en: 'Negative' },
    { id: 'Other', pt: 'Outro', en: 'Other' }
  ],

  rarities: [
    { id: 'R0_Normal', pt: 'Normal', en: 'Normal' },
    { id: 'R1_Rare', pt: 'Raro', en: 'Rare' },
    { id: 'R2_Epic', pt: 'Épico', en: 'Epic' },
    { id: 'R3_Legendary', pt: 'Lendário', en: 'Legendary' }
  ],

  itemTemplates: [
    { id: 'sword', tpl: '$sword', weapon: true, melee: true, prefix: 'sword', pt: 'Espada', en: 'Sword', slash: 'slash_sword' },
    { id: 'axe', tpl: '$axe', weapon: true, melee: true, prefix: 'axe', pt: 'Machado', en: 'Axe', slash: 'slash_axe' },
    { id: 'hammer', tpl: '$hammer', weapon: true, melee: true, prefix: 'hammer', pt: 'Martelo', en: 'Hammer', slash: 'slash_hammer' },
    { id: 'spear', tpl: '$spear', weapon: true, melee: true, prefix: 'spear', pt: 'Lança', en: 'Spear', slash: 'slash_spear' },
    { id: 'bow', tpl: '$bow', weapon: true, melee: false, prefix: 'bow', pt: 'Arco', en: 'Bow', slash: 'slash_bow' },
    { id: 'armor', tpl: '$armor', weapon: false, prefix: 'armor', pt: 'Armadura', en: 'Armor' },
    { id: 'helmet', tpl: '$helmet', weapon: false, prefix: 'helmet', pt: 'Capacete', en: 'Helmet' },
    { id: 'boots', tpl: '$boots', weapon: false, prefix: 'boots', pt: 'Botas', en: 'Boots' },
    { id: 'ring', tpl: '$ring', weapon: false, prefix: 'ring', pt: 'Anel', en: 'Ring' },
    { id: 'amulet', tpl: '$amulet', weapon: false, prefix: 'amulet', pt: 'Amuleto', en: 'Amulet' }
  ],

  costResources: ['none', 'wood', 'stone', 'leather', 'common_metals', 'silver', 'mythril', 'adamantine', 'bones', 'dragon_scales'],

  slashes: ['slash_base', 'slash_sword', 'slash_axe', 'slash_hammer', 'slash_spear', 'slash_punch', 'slash_jaws', 'slash_claws', 'slash_bow', 'slash_snowball'],

  vanillaProjectiles: ['arrow', 'snowball', 'firebomb', 'rock'],

  drops: [
    'bomb', 'grenade', 'tnt', 'tnt_timed', 'landmine', 'napalm_bomb', 'atomic_bomb', 'antimatter_bomb', 'czar_bomba',
    'santa_bomb', 'crab_bomb', 'water_bomb', 'fireworks', 'rain', 'blood_rain', 'magic_rain', 'clone_rain', 'fire',
    'acid', 'lava', 'snow', 'ash', 'life_seed', 'curse', 'spell_silence', 'cure', 'plague', 'zombie_infection',
    'mush_spores', 'madness', 'rage', 'blessing', 'shield', 'powerup', 'inspiration', 'friendship', 'discord',
    'spite', 'sleep', 'dispel', 'coffee', 'jazz', 'gamma_rain', 'delta_rain', 'omega_rain', 'loot_rain'
  ],

  statuses: [
    'burning', 'frozen', 'poisoned', 'slowness', 'shield', 'invincible', 'cursed', 'stunned', 'confused',
    'rage', 'powerup', 'caffeinated', 'enchanted', 'spell_boost', 'spell_silence', 'sleeping', 'inspired',
    'motivated', 'angry', 'laughing', 'crying', 'singing', 'dodge', 'dash', 'afterglow', 'magnetized',
    'possessed', 'strange_urge', 'tantrum', 'ash_fever', 'cough', 'drowning', 'starving'
  ],

  actionPresets: [
    { id: 'drop', pt: 'Soltar efeito do mundo', en: 'Spawn world drop', params: ['drop'] },
    { id: 'status', pt: 'Aplicar status', en: 'Apply status', params: ['status', 'duration'] },
    { id: 'lightning', pt: 'Relâmpago', en: 'Lightning', params: [] },
    { id: 'fire', pt: 'Chamas', en: 'Fire', params: [] },
    { id: 'tornado', pt: 'Tornado', en: 'Tornado', params: [] },
    { id: 'teleport', pt: 'Teleporte aleatório', en: 'Random teleport', params: [] },
    { id: 'force', pt: 'Onda de força', en: 'Force wave', params: ['radius', 'force'] },
    { id: 'shake', pt: 'Tremor de tela', en: 'Screen shake', params: ['intensity'] },
    { id: 'spawn', pt: 'Invocar unidade', en: 'Summon unit', params: ['unit', 'count'] },
    { id: 'unlock', pt: 'Liberar conquista', en: 'Unlock achievement', params: ['achievement'] }
  ],

  actionHooks: [
    { id: 'attack', pt: 'Ao atacar', en: 'On attack' },
    { id: 'hit', pt: 'Ao ser atacado', en: 'When hit' },
    { id: 'world', pt: 'Evento (morte, nascimento, efeito contínuo)', en: 'Event (death, birth, continuous effect)' }
  ],

  unitTemplates: [
    { id: '$mob_no_genes$', pt: 'Criatura simples', en: 'Simple creature' },
    { id: '$mob$', pt: 'Criatura com genoma', en: 'Creature with genome' },
    { id: '$animal$', pt: 'Animal', en: 'Animal' }
  ],

  actorSizes: ['S0_Bug', 'S1_Egg', 'S2_Crab', 'S3_Rat', 'S4_Piranha', 'S5_Snake', 'S6_Chicken', 'S7_Cat', 'S8_Fox', 'S9_Monkey', 'S10_Dog', 'S11_Sheep', 'S12_Wolf', 'S13_Human', 'S14_Cow', 'S15_Bear', 'S16_Buffalo', 'S17_Dragon'],

  kingdomTemplates: [
    { id: '$TEMPLATE_MOB$', pt: 'Criatura (neutra)', en: 'Mob (neutral)' },
    { id: '$TEMPLATE_MOB_GOOD$', pt: 'Criatura boa', en: 'Good mob' },
    { id: '$TEMPLATE_MOB_VERY_GOOD$', pt: 'Criatura muito boa', en: 'Very good mob' },
    { id: '$TEMPLATE_ANIMAL$', pt: 'Animal', en: 'Animal' },
    { id: '$TEMPLATE_ANIMAL_NEUTRAL$', pt: 'Animal neutro', en: 'Neutral animal' },
    { id: '$TEMPLATE_ANIMAL_PEACEFUL$', pt: 'Animal pacífico', en: 'Peaceful animal' }
  ],

  kingdomTags: [
    'good', 'evil', 'neutral', 'civ', 'undead', 'nature_creature', 'sliceable', 'small', 'snow', 'garlic',
    'orc', 'human', 'elf', 'dwarf', 'bandit', 'wolf', 'bear', 'snake', 'demon', 'dragons', 'necromancer',
    'living_houses', 'living_plants', 'snowman', 'fire_elemental', 'crab', 'everyone'
  ],

  ages: ['age_ash', 'age_chaos', 'age_dark', 'age_despair', 'age_hope', 'age_ice', 'age_moon', 'age_sun', 'age_tears', 'age_unknown', 'age_wonders'],

  disasterTypes: ['Nature', 'Other'],

  powerRanks: ['Rank0_free', 'Rank1_common', 'Rank2_normal', 'Rank3_good', 'Rank4_awesome', 'Rank5_noAwards'],

  vanillaIcons: [
    'ui/Icons/iconSteam', 'ui/Icons/iconAttack', 'ui/Icons/iconArmor', 'ui/Icons/iconBandit', 'ui/Icons/iconGreg',
    'ui/Icons/iconDragon', 'ui/Icons/iconWolf', 'ui/Icons/iconBear', 'ui/Icons/iconSnowMan', 'ui/Icons/iconFireElemental'
  ]
};

MM.data.statById = {};
MM.data.stats.forEach(function (s) { MM.data.statById[s.id] = s; });

MM.data.languages = [{ id: 'en', name: 'English' }, { id: 'de', name: 'Deutsch' }, { id: 'pl', name: 'Polski' }, { id: 'cz', name: '中文(简体)' }, { id: 'ch', name: '中文(繁體)' }, { id: 'ko', name: '한국어' }, { id: 'ja', name: '日本語' }, { id: 'th', name: 'ภาษาไทย' }, { id: 'vn', name: 'Tiếng Việt' }, { id: 'ru', name: 'Русский' }, { id: 'ua', name: 'Українська' }, { id: 'by', name: 'Беларуская' }, { id: 'es', name: 'Español' }, { id: 'br', name: 'Português do Brasil' }, { id: 'pt', name: 'Português de Portugal' }, { id: 'fr', name: 'Français' }, { id: 'it', name: 'Italiano' }, { id: 'ro', name: 'Română' }, { id: 'hr', name: 'Hrvatski' }, { id: 'tr', name: 'Türkçe' }, { id: 'gr', name: 'Ελληνικά' }, { id: 'ka', name: 'ქართული' }, { id: 'sk', name: 'Slovenčina' }, { id: 'cs', name: 'Čeština' }, { id: 'hu', name: 'Magyar' }, { id: 'nl', name: 'Nederlands' }, { id: 'id', name: 'Bahasa Indonesia' }, { id: 'sv', name: 'Svenska' }, { id: 'no', name: 'Norsk' }, { id: 'da', name: 'Dansk' }, { id: 'fa', name: 'فارسی' }, { id: 'ar', name: 'العربية' }, { id: 'he', name: 'עברית' }, { id: 'fn', name: 'Suomi' }, { id: 'ph', name: 'Tagalog' }, { id: 'hi', name: 'हिन्दी' }, { id: 'lb', name: 'Lëtzebuergesch' }, { id: 'lt', name: 'Lithuanian' }];

MM.data.traitCats = [
  { id: 'actor', pt: 'Criatura', en: 'Creature', lib: 'traits', cls: 'ActorTrait', glib: 'trait_groups', gcls: 'ActorTraitGroupAsset', typed: 'trait', folder: 'trait' },
  { id: 'subspecies', pt: 'Subespécie', en: 'Subspecies', lib: 'subspecies_traits', cls: 'SubspeciesTrait', glib: 'subspecies_trait_groups', gcls: 'SubspeciesTraitGroupAsset', typed: 'subspecies_trait', folder: 'subspecies_trait' },
  { id: 'clan', pt: 'Clã', en: 'Clan', lib: 'clan_traits', cls: 'ClanTrait', glib: 'clan_trait_groups', gcls: 'ClanTraitGroupAsset', typed: 'clan_trait', folder: 'clan_trait' },
  { id: 'culture', pt: 'Cultura', en: 'Culture', lib: 'culture_traits', cls: 'CultureTrait', glib: 'culture_trait_groups', gcls: 'CultureTraitGroupAsset', typed: 'culture_trait', folder: 'culture_trait' },
  { id: 'religion', pt: 'Religião', en: 'Religion', lib: 'religion_traits', cls: 'ReligionTrait', glib: 'religion_trait_groups', gcls: 'ReligionTraitGroupAsset', typed: 'religion_trait', folder: 'religion_trait' },
  { id: 'kingdom', pt: 'Reino', en: 'Kingdom', lib: 'kingdoms_traits', cls: 'KingdomTrait', glib: 'kingdoms_traits_groups', gcls: 'KingdomTraitGroupAsset', typed: 'kingdom_trait', folder: 'kingdom_trait' },
  { id: 'language', pt: 'Idioma', en: 'Language', lib: 'language_traits', cls: 'LanguageTrait', glib: 'language_trait_groups', gcls: 'LanguageTraitGroupAsset', typed: 'language_trait', folder: 'language_trait' }
];
MM.data.traitGroupsVanilla = {
  actor: ['cognitive', 'mind', 'spirit', 'physique', 'health', 'body', 'appearance', 'protection', 'skills', 'merits', 'acquired', 'fun', 'fate', 'miscellaneous', 'special'],
  subspecies: ['harmony', 'advanced_brain', 'mind', 'body', 'diet', 'rebirth', 'growth', 'bioproducts', 'chaos', 'talents', 'sleep_cycles', 'hibernation', 'reproduction_strategy', 'reproductive_methods', 'gestation', 'eggs', 'mutations', 'adaptations', 'fate', 'phenotypes'],
  clan: ['spirit', 'mind', 'body', 'chaos', 'harmony', 'fate', 'special'],
  culture: ['harmony', 'architecture', 'town_plan', 'kingdom', 'buildings', 'succession', 'knowledge', 'warfare', 'weapons', 'craft', 'happiness', 'worldview', 'miscellaneous', 'fate', 'special'],
  religion: ['harmony', 'creation', 'destruction', 'restoration', 'necromancy', 'protection', 'the_void', 'transformation', 'fate', 'special'],
  kingdom: ['tribute', 'local_tax', 'miscellaneous', 'fate'],
  language: ['knowledge', 'spirit', 'harmony', 'chaos', 'miscellaneous', 'fate', 'special']
};
MM.data.traitGroupDefault = { actor: 'miscellaneous', subspecies: 'mutations', clan: 'special', culture: 'miscellaneous', religion: 'special', kingdom: 'miscellaneous', language: 'miscellaneous' };
MM.data.traitCatById = {};
MM.data.traitCats.forEach(function (c) { MM.data.traitCatById[c.id] = c; });

MM.data.settingTypes = [
  { id: 'SWITCH', pt: 'Liga/desliga', en: 'Switch' },
  { id: 'INT_SLIDER', pt: 'Controle inteiro', en: 'Integer slider' },
  { id: 'SLIDER', pt: 'Controle decimal', en: 'Decimal slider' },
  { id: 'TEXT', pt: 'Texto', en: 'Text' }
];

MM.supporters = ['Lenne Batunks'];
