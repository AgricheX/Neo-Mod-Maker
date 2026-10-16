MM.randdata = {
  themes: [
    {
      id: 'fire', hue: [0, 38], opp: 'ice', drop: 'fire', cloud: 'cloud_fire', biome: 'biome_infernal', counter: 'frozen',
      stats: ['damage', 'critical_chance', 'speed', 'area_of_effect', 'range', 'multiplier_damage'],
      adj: [['Burning', 'Ardente', 'Ardente'], ['Scorched', 'Chamuscado', 'Chamuscada'], ['Blazing', 'Flamejante', 'Flamejante'], ['Smoldering', 'Fumegante', 'Fumegante'], ['Molten', 'Fundido', 'Fundida'], ['Infernal', 'Infernal', 'Infernal']],
      nouns: [['Flame', 'Chama', 'f'], ['Ember', 'Brasa', 'f'], ['Ash', 'Cinza', 'f'], ['Fire', 'Fogo', 'm'], ['Magma', 'Magma', 'm'], ['Smoke', 'Fumaça', 'f']],
      s: ['Ka', 'Ro', 'Ig', 'Zar', 'Bra', 'Sol', 'Pyr', 'Em', 'Ur', 'Tha'], e: ['rak', 'dun', 'gor', 'thar', 'mos', 'ix', 'ron', 'kar', 'zul', 'bax']
    },
    {
      id: 'ice', hue: [185, 225], opp: 'fire', drop: 'snow', cloud: 'cloud_snow', biome: 'biome_permafrost', counter: 'burning',
      stats: ['armor', 'health', 'mass', 'stamina', 'multiplier_health'],
      adj: [['Frozen', 'Congelado', 'Congelada'], ['Icy', 'Gélido', 'Gélida'], ['Glacial', 'Glacial', 'Glacial'], ['Pale', 'Pálido', 'Pálida'], ['Silent', 'Silencioso', 'Silenciosa'], ['Bitter', 'Amargo', 'Amarga']],
      nouns: [['Frost', 'Geada', 'f'], ['Ice', 'Gelo', 'm'], ['Snow', 'Neve', 'f'], ['Winter', 'Inverno', 'm'], ['Glacier', 'Geleira', 'f'], ['Blizzard', 'Nevasca', 'f']],
      s: ['Il', 'Fri', 'Ny', 'Ol', 'Vel', 'Sky', 'Hri', 'Is', 'Ku', 'Eir'], e: ['dra', 'nir', 'wynn', 'sen', 'mir', 'la', 'vik', 'ris', 'dal', 'ske']
    },
    {
      id: 'shadow', hue: [255, 290], opp: 'light', drop: 'curse', cloud: 'cloud_magic', biome: 'biome_corrupted', counter: 'inspired',
      stats: ['critical_chance', 'accuracy', 'speed', 'skill_spell', 'multiplier_crit'],
      adj: [['Hollow', 'Oco', 'Oca'], ['Veiled', 'Velado', 'Velada'], ['Whispering', 'Sussurrante', 'Sussurrante'], ['Dark', 'Sombrio', 'Sombria'], ['Forgotten', 'Esquecido', 'Esquecida'], ['Nameless', 'Anônimo', 'Anônima']],
      nouns: [['Shadow', 'Sombra', 'f'], ['Night', 'Noite', 'f'], ['Void', 'Vazio', 'm'], ['Dusk', 'Crepúsculo', 'm'], ['Whisper', 'Sussurro', 'm'], ['Veil', 'Véu', 'm']],
      s: ['Nox', 'Ve', 'Mor', 'Zy', 'Ul', 'Sha', 'Dra', 'Ny', 'Mal', 'Ob'], e: ['vyr', 'zul', 'thos', 'leth', 'mir', 'xis', 'ris', 'gar', 'nyx', 'dren']
    },
    {
      id: 'nature', hue: [85, 150], opp: 'bone', drop: 'life_seed', cloud: 'cloud_rain', biome: 'biome_jungle', counter: 'poisoned',
      stats: ['health', 'offspring', 'lifespan', 'maturation', 'multiplier_lifespan'],
      adj: [['Verdant', 'Verdejante', 'Verdejante'], ['Wild', 'Selvagem', 'Selvagem'], ['Gentle', 'Gentil', 'Gentil'], ['Blooming', 'Florescente', 'Florescente'], ['Mossy', 'Musgoso', 'Musgosa'], ['Ancient', 'Antigo', 'Antiga']],
      nouns: [['Bloom', 'Flor', 'f'], ['Root', 'Raiz', 'f'], ['Leaf', 'Folha', 'f'], ['Forest', 'Floresta', 'f'], ['Moss', 'Musgo', 'm'], ['Seed', 'Semente', 'f']],
      s: ['Ly', 'Fae', 'Ae', 'Sil', 'Wyn', 'Ori', 'Thal', 'Elu', 'Bri', 'Ren'], e: ['wen', 'riel', 'thil', 'ora', 'mir', 'lith', 'ael', 'ven', 'ia', 'dis']
    },
    {
      id: 'sea', hue: [195, 235], opp: 'fire', drop: 'rain', cloud: 'cloud_rain', biome: 'biome_swamp', counter: 'burning',
      stats: ['health', 'speed', 'stamina', 'mana', 'multiplier_stamina'],
      adj: [['Drowned', 'Afogado', 'Afogada'], ['Deep', 'Profundo', 'Profunda'], ['Briny', 'Salobro', 'Salobra'], ['Sunken', 'Submerso', 'Submersa'], ['Misty', 'Nebuloso', 'Nebulosa'], ['Azure', 'Azul', 'Azul']],
      nouns: [['Tide', 'Maré', 'f'], ['Reef', 'Recife', 'm'], ['Wave', 'Onda', 'f'], ['Coral', 'Coral', 'm'], ['Abyss', 'Abismo', 'm'], ['Brine', 'Salmoura', 'f']],
      s: ['Mar', 'Nei', 'Oc', 'Thal', 'Ky', 'Lor', 'Pel', 'Aqu', 'Sir', 'Nau'], e: ['ael', 'ion', 'dros', 'lis', 'thys', 'nara', 'mere', 'vel', 'ris', 'tia']
    },
    {
      id: 'storm', hue: [215, 255], opp: 'light', drop: 'rain', cloud: 'cloud_lightning', biome: 'biome_rocklands', counter: 'slowness',
      stats: ['speed', 'attack_speed', 'range', 'accuracy', 'knockback', 'multiplier_attack_speed'],
      adj: [['Thundering', 'Trovejante', 'Trovejante'], ['Crackling', 'Estalante', 'Estalante'], ['Howling', 'Uivante', 'Uivante'], ['Stormy', 'Tempestuoso', 'Tempestuosa'], ['Charged', 'Carregado', 'Carregada'], ['Roaring', 'Rugente', 'Rugente']],
      nouns: [['Storm', 'Tempestade', 'f'], ['Thunder', 'Trovão', 'm'], ['Lightning', 'Relâmpago', 'm'], ['Gale', 'Vendaval', 'm'], ['Tempest', 'Procela', 'f'], ['Bolt', 'Raio', 'm']],
      s: ['Zeph', 'Bro', 'Ras', 'Tem', 'Kra', 'Vol', 'Tor', 'Ysg', 'Gha', 'Eld'], e: ['ark', 'ndor', 'gale', 'zix', 'rok', 'var', 'ion', 'thun', 'aur', 'vok']
    },
    {
      id: 'blood', hue: [345, 360], opp: 'light', drop: 'blood_rain', cloud: 'cloud_rage', biome: 'biome_wasteland', counter: 'shield',
      stats: ['damage', 'health', 'warfare', 'critical_damage_multiplier', 'multiplier_damage'],
      adj: [['Crimson', 'Carmesim', 'Carmesim'], ['Bloodied', 'Ensanguentado', 'Ensanguentada'], ['Savage', 'Selvagem', 'Selvagem'], ['Ravenous', 'Voraz', 'Voraz'], ['Cruel', 'Cruel', 'Cruel'], ['Scarlet', 'Escarlate', 'Escarlate']],
      nouns: [['Blood', 'Sangue', 'm'], ['Fang', 'Presa', 'f'], ['Hunger', 'Fome', 'f'], ['Claw', 'Garra', 'f'], ['Hunt', 'Caça', 'f'], ['Rage', 'Fúria', 'f']],
      s: ['Gor', 'Vak', 'Kru', 'Mor', 'Bru', 'Thra', 'Zul', 'Rak', 'Dro', 'Ghu'], e: ['nash', 'gar', 'tusk', 'dak', 'mog', 'rok', 'gash', 'uk', 'maw', 'rend']
    },
    {
      id: 'light', hue: [40, 55], opp: 'shadow', drop: 'blessing', cloud: 'cloud_normal', biome: 'biome_celestial', counter: 'cursed',
      stats: ['health', 'stewardship', 'diplomacy', 'happiness', 'multiplier_diplomacy'],
      adj: [['Radiant', 'Radiante', 'Radiante'], ['Sacred', 'Sagrado', 'Sagrada'], ['Gilded', 'Dourado', 'Dourada'], ['Blessed', 'Abençoado', 'Abençoada'], ['Pure', 'Puro', 'Pura'], ['Luminous', 'Luminoso', 'Luminosa']],
      nouns: [['Light', 'Luz', 'f'], ['Dawn', 'Aurora', 'f'], ['Halo', 'Halo', 'm'], ['Grace', 'Graça', 'f'], ['Sun', 'Sol', 'm'], ['Oath', 'Juramento', 'm']],
      s: ['Aur', 'Sol', 'Ser', 'Lum', 'Ael', 'Cae', 'Ila', 'Eos', 'Ath', 'Mir'], e: ['iel', 'ora', 'aris', 'ael', 'ia', 'lis', 'ion', 'eth', 'ana', 'ius']
    },
    {
      id: 'bone', hue: [30, 70], opp: 'nature', drop: 'ash', cloud: 'cloud_ash', biome: 'biome_wasteland', counter: 'inspired',
      stats: ['lifespan', 'health', 'armor', 'mass', 'multiplier_health'],
      adj: [['Bleached', 'Branqueado', 'Branqueada'], ['Skeletal', 'Esquelético', 'Esquelética'], ['Restless', 'Inquieto', 'Inquieta'], ['Withered', 'Murcho', 'Murcha'], ['Undying', 'Imortal', 'Imortal'], ['Grim', 'Sinistro', 'Sinistra']],
      nouns: [['Bone', 'Osso', 'm'], ['Grave', 'Túmulo', 'm'], ['Skull', 'Crânio', 'm'], ['Dust', 'Pó', 'm'], ['Tomb', 'Tumba', 'f'], ['Marrow', 'Tutano', 'm']],
      s: ['Mor', 'Skel', 'Ghul', 'Ner', 'Vor', 'Mal', 'Cry', 'Tho', 'Ras', 'Bel'], e: ['moth', 'ghast', 'rus', 'cull', 'bane', 'rot', 'mourn', 'thul', 'wight', 'mar']
    },
    {
      id: 'crystal', hue: [290, 330], opp: 'storm', drop: 'magic_rain', cloud: 'cloud_magic', biome: 'biome_crystal', counter: 'confused',
      stats: ['armor', 'mana', 'skill_spell', 'area_of_effect', 'mass', 'multiplier_mana'],
      adj: [['Shining', 'Reluzente', 'Reluzente'], ['Prismatic', 'Prismático', 'Prismática'], ['Faceted', 'Facetado', 'Facetada'], ['Brittle', 'Quebradiço', 'Quebradiça'], ['Gleaming', 'Brilhante', 'Brilhante'], ['Cut', 'Lapidado', 'Lapidada']],
      nouns: [['Crystal', 'Cristal', 'm'], ['Shard', 'Fragmento', 'm'], ['Gem', 'Gema', 'f'], ['Geode', 'Geodo', 'm'], ['Prism', 'Prisma', 'm'], ['Glass', 'Vidro', 'm']],
      s: ['Cry', 'Qua', 'Ixi', 'Pri', 'Ze', 'Ame', 'Opa', 'Ber', 'Ona', 'Kyr'], e: ['lith', 'zite', 'quar', 'lix', 'mere', 'tal', 'yst', 'gem', 'rine', 'dael']
    }
  ],

  cat: {
    mod: [['Realm', 'Reino', 'm'], ['Legacy', 'Legado', 'm'], ['Dominion', 'Domínio', 'm'], ['Saga', 'Saga', 'f'], ['Awakening', 'Despertar', 'm'], ['Chronicles', 'Crônicas', 'f']],
    status: [['Fever', 'Febre', 'f'], ['Curse', 'Maldição', 'f'], ['Mark', 'Marca', 'f'], ['Veil', 'Véu', 'm'], ['Trance', 'Transe', 'm'], ['Blessing', 'Bênção', 'f'], ['Fury', 'Fúria', 'f']],
    trait: [['Heart', 'Coração', 'm'], ['Blood', 'Sangue', 'm'], ['Skin', 'Pele', 'f'], ['Eyes', 'Olhos', 'm'], ['Soul', 'Alma', 'f'], ['Touch', 'Toque', 'm'], ['Gaze', 'Olhar', 'm'], ['Breath', 'Sopro', 'm'], ['Mark', 'Marca', 'f']],
    group: [['Children', 'Filhos', 'm'], ['Heirs', 'Herdeiros', 'm'], ['Sworn', 'Juramentados', 'm'], ['Wardens', 'Guardiões', 'm'], ['Disciples', 'Discípulos', 'm']],
    action: [['Strike', 'Golpe', 'm'], ['Burst', 'Explosão', 'f'], ['Surge', 'Surto', 'm'], ['Pulse', 'Pulso', 'm'], ['Wave', 'Onda', 'f'], ['Spark', 'Faísca', 'f']],
    drop: [['Rain', 'Chuva', 'f'], ['Dust', 'Poeira', 'f'], ['Bomb', 'Bomba', 'f'], ['Spores', 'Esporos', 'm'], ['Orb', 'Orbe', 'm']],
    age: [['Age', 'Era', 'f'], ['Epoch', 'Época', 'f'], ['Time', 'Tempo', 'm']],
    building: [['Shrine', 'Santuário', 'm'], ['Forge', 'Forja', 'f'], ['Hall', 'Salão', 'm'], ['Tower', 'Torre', 'f'], ['Altar', 'Altar', 'm'], ['Lodge', 'Cabana', 'f']],
    biome: [['Wastes', 'Ermos', 'm'], ['Fields', 'Campos', 'm'], ['Marsh', 'Pântano', 'm'], ['Woods', 'Bosque', 'm'], ['Dunes', 'Dunas', 'f'], ['Highlands', 'Planalto', 'm']],
    resource: [['Ore', 'Minério', 'm'], ['Shard', 'Fragmento', 'm'], ['Resin', 'Resina', 'f'], ['Essence', 'Essência', 'f'], ['Salt', 'Sal', 'm']],
    law: [['Law', 'Lei', 'f'], ['Pact', 'Pacto', 'm'], ['Decree', 'Decreto', 'm'], ['Rule', 'Regra', 'f']],
    achievement: [['Heir', 'Herdeiro', 'm'], ['Bearer', 'Portador', 'm'], ['Walker', 'Andarilho', 'm'], ['Slayer', 'Caçador', 'm'], ['Keeper', 'Guardião', 'm']],
    power: [['Touch', 'Toque', 'm'], ['Call', 'Chamado', 'm'], ['Wrath', 'Ira', 'f'], ['Gift', 'Dádiva', 'f'], ['Blessing', 'Bênção', 'f']],
    spell: [['Bolt', 'Raio', 'm'], ['Nova', 'Nova', 'f'], ['Lance', 'Lança', 'f'], ['Chain', 'Corrente', 'f'], ['Wave', 'Onda', 'f']],
    disaster: [['Plague', 'Praga', 'f'], ['Swarm', 'Enxame', 'm'], ['Storm', 'Tormenta', 'f'], ['Invasion', 'Invasão', 'f'], ['Wrath', 'Ira', 'f']],
    cloud: [['Cloud', 'Nuvem', 'f'], ['Mist', 'Névoa', 'f'], ['Storm', 'Tormenta', 'f'], ['Pall', 'Manto', 'm']],
    event: [['Omen', 'Presságio', 'm'], ['Vision', 'Visão', 'f'], ['Rite', 'Rito', 'm'], ['Echo', 'Eco', 'm']],
    kingdom: [['Clan', 'Clã', 'm'], ['Host', 'Horda', 'f'], ['Court', 'Corte', 'f'], ['Legion', 'Legião', 'f'], ['Pack', 'Matilha', 'f']],
    setting: [['Intensity', 'Intensidade', 'f'], ['Frequency', 'Frequência', 'f'], ['Strength', 'Força', 'f'], ['Chance', 'Chance', 'f']],
    button: [['Summon', 'Invocar', 'm']],
    projectile: [['Orb', 'Orbe', 'm'], ['Bolt', 'Raio', 'm'], ['Shard', 'Fragmento', 'm'], ['Spark', 'Faísca', 'f']]
  },

  kinds: {
    sword: ['Blade', 'Lâmina', 'f'], axe: ['Axe', 'Machado', 'm'], hammer: ['Hammer', 'Martelo', 'm'], spear: ['Spear', 'Lança', 'f'], bow: ['Bow', 'Arco', 'm'],
    armor: ['Armor', 'Armadura', 'f'], helmet: ['Helm', 'Elmo', 'm'], boots: ['Boots', 'Botas', 'f'], ring: ['Ring', 'Anel', 'm'], amulet: ['Amulet', 'Amuleto', 'm']
  },

  desc: {
    any: [
      ['Carries the mark of {n}.', 'Traz a marca {pde}.'],
      ['Old stories say it was born from {n}.', 'Contam as lendas que nasceu {pde}.'],
      ['Its power comes from {n}.', 'Seu poder vem {pde}.'],
      ['Where {n} gathers, legends follow.', 'Onde há {pb}, as lendas seguem.'],
      ['A quiet gift of {n}, or a curse.', 'Uma dádiva calada {pde}, ou uma maldição.'],
      ['Few survive their brush with {n}.', 'Poucos sobrevivem ao encontro com {pa}.']
    ],
    status: [['While it lasts, {n} clings to its host.', 'Enquanto dura, {pa} se agarra ao hospedeiro.'], ['The body remembers {n} long after.', 'O corpo lembra {pa} por muito tempo.']],
    trait: [['Those born with it speak of {n} in their sleep.', 'Quem nasce com isso fala {pde} dormindo.'], ['A mark of {n} that never fades.', 'Uma marca {pde} que nunca some.']],
    building: [['A place where {n} never fades.', 'Um lugar onde {pa} nunca desaparece.'], ['Built close to {n}.', 'Construção erguida perto {pde}.']],
    age: [['An age ruled by {n}.', 'Uma era regida por {pa}.'], ['The world remembers {n} in this age.', 'O mundo lembra {pa} nesta era.']],
    law: [['Lets {n} bend the rules of the world.', 'Deixa {pa} dobrar as regras do mundo.']],
    spell: [['Calls upon {n}.', 'Evoca {pa}.']],
    disaster: [['When {n} rises, nothing stays calm.', 'Quando {pa} se ergue, nada fica calmo.']],
    power: [['Gives the world a taste of {n}.', 'Dá ao mundo um gosto {pde}.']],
    drop: [['Falls carrying {n}.', 'Cai carregando {pa}.']],
    cloud: [['Drifts across the sky, heavy with {n}.', 'Cruza o céu, carregada {pde}.']],
    biome: [['Land shaped by {n}.', 'Terra moldada por {pa}.']],
    resource: [['Matter born of {n}.', 'Matéria nascida {pde}.']],
    achievement: [['Earned by those who walk with {n}.', 'Conquistada por quem caminha com {pa}.']],
    item: [['Marked by the sign of {n}.', 'Peça marcada pelo signo {pde}.']],
    creature: [['A creature of {n}, it roams where {n} is strongest.', 'Criatura {pde}, ronda onde {pa} é mais forte.']],
    species: [['A people shaped by {n}.', 'Um povo moldado por {pa}.']],
    mod: [['A mod about {n}.', 'Um mod sobre {pa}.']]
  }
};
