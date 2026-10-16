MM.forum = (function () {
  var h = MM.h;
  function T(pt, en) { return MM.tr(pt, en); }
  function L(x) { return MM.tr(x[0], x[1]); }

  var topics = [
    {
      id: 'start', page: 'mod', sec: ['Começo', 'Getting started'], t: ['Como tudo funciona', 'How everything works'],
      intro: ['O Neo Mod Maker monta um mod para o NML (Neo Mod Loader). Você preenche páginas, ele gera os arquivos C#, as traduções e as imagens, e entrega um .zip pronto.', 'Neo Mod Maker builds a mod for NML (Neo Mod Loader). You fill in pages, it generates the C# files, the translations and the images, and hands you a ready .zip.'],
      f: [
        [['Instalar', 'Installing'], ['Extraia o .zip dentro da pasta Mods do WorldBox (a mesma onde ficam os outros mods do NML). O NML compila o código ao abrir o jogo.', 'Extract the .zip into the WorldBox Mods folder (the same one your other NML mods use). NML compiles the code when the game starts.']],
        [['IDs', 'IDs'], ['Todo item tem um ID: letras minúsculas, números e underline, sem espaços. Ele é o nome interno que outros itens usam para se referir a ele. Mudar um ID depois exige mudar onde ele é usado.', 'Every item has an ID: lowercase letters, digits and underscores, no spaces. It is the internal name other items use to refer to it. Changing an ID later means changing where it is used.']],
        [['Campos com asterisco', 'Items marked with *'], ['Em listas de escolha, itens com * são criados por você neste mod; os outros são do jogo.', 'In pick lists, entries marked * are made by you in this mod; the others are from the game.']],
        [['Salvamento', 'Saving'], ['Tudo é salvo sozinho neste navegador. Exporte o .zip para guardar de verdade. O .zip contém o projeto e pode ser aberto de novo na página Mod.', 'Everything saves by itself in this browser. Export the .zip to keep it for real. The .zip contains the project and can be reopened on the Mod page.']],
        [['Gratuito', 'Free'], ['O Neo Mod Maker é totalmente gratuito, feito de fã para fã. Se alguém ou algum site pedir dinheiro para usá-lo, é golpe.', 'Neo Mod Maker is completely free, made by fans for fans. If anyone or any website asks for money to use it, it is a scam.']],
        [['Desfazer', 'Undo'], ['Ctrl+Z e Ctrl+Y (ou os botões no topo) voltam e avançam as últimas alterações.', 'Ctrl+Z and Ctrl+Y (or the top buttons) step back and forward through recent changes.']],
        [['Aleatório', 'Random'], ['Cada item tem o botão Aleatorizar este item, e a página Mod tem o botão que gera um mod inteiro aleatório. É ótimo para ver como cada coisa é preenchida.', 'Every item has a Randomize this item button, and the Mod page has a button that makes a whole random mod. Great for seeing how each thing is filled in.']]
      ],
      tips: [['Comece pelo exemplo Wraith Hunt na página Mod para ver um mod completo funcionando.', 'Start with the Wraith Hunt example on the Mod page to see a complete working mod.']]
    },
    {
      id: 'mod', page: 'mod', sec: ['Começo', 'Getting started'], t: ['Dados do mod', 'Mod details'],
      intro: ['Informações que aparecem na lista de mods e que definem o nome do código.', 'Information shown in the mod list that also sets the code name.'],
      f: [
        [['ID / namespace', 'ID / namespace'], ['Sem espaços nem acentos. Vira o namespace do C# e o nome da pasta dentro do .zip.', 'No spaces or accents. Becomes the C# namespace and the folder name inside the .zip.']],
        [['Versão', 'Version'], ['Qualquer texto, como 1.0.0.', 'Any text, such as 1.0.0.']],
        [['Dependências', 'Dependencies'], ['IDs de outros mods que precisam estar instalados. Separe por vírgula. Opcionais carregam se existirem. Incompatível com impede carregar junto.', 'IDs of other mods that must be installed. Separate with commas. Optional ones load if present. Incompatible with prevents loading together.']],
        [['Cópias do projeto', 'Project copies'], ['Guardam versões do projeto no navegador para alternar entre ideias.', 'Store versions of the project in the browser so you can switch between ideas.']],
        [['Idiomas', 'Languages'], ['Inglês é obrigatório. Marque outros idiomas só se quiser escrever as traduções dos textos do jogo; o resto cai no inglês.', 'English is required. Tick other languages only if you want to write translations of the game text; everything else falls back to English.']]
      ]
    },
    {
      id: 'library', page: 'items', sec: ['Começo', 'Getting started'], t: ['Biblioteca de sprites e editor de pixel', 'Sprite library and pixel editor'],
      intro: ['Todo campo de imagem tem os botões Escolher imagem, Biblioteca, Desenhar e Aleatório. Você usa o que preferir.', 'Every image field has the buttons Choose image, Library, Draw and Random. Use whichever you prefer.'],
      f: [
        [['Biblioteca', 'Library'], ['Abre os sprites dos mods originais: ícones, criaturas, prédios, bandeiras, armas, efeitos, barcos, ícones de mod e de aba. São livres para usar nos seus mods, de graça.', 'Opens the sprites from the original mods: icons, creatures, buildings, banners, weapons, effects, boats, mod icons and tab icons. They are free to use in your mods.']],
        [['Filtro automático', 'Automatic filter'], ['A biblioteca abre já na categoria do campo: o campo Moinho mostra moinhos, Bandeira: fundo mostra fundos de bandeira, Sprite da arma mostra armas.', 'The library opens already on the right category: the Windmill field shows windmills, Banner: background shows banner backgrounds, Weapon sprite shows weapons.']],
        [['Feitos para o Neo Mod Maker', 'Made for Neo Mod Maker'], ['Onde os mods originais não tinham sprites, foram criados ícones, bibliotecas, docas de pesca e ícones de aba no estilo deles.', 'Where the original mods had no sprites, icons, libraries, fishing docks and tab icons were made in their style.']],
        [['Ajuste de tamanho', 'Size fitting'], ['Ícones pequenos são ampliados em número inteiro de vezes para caber no tamanho sugerido do campo, sem borrar.', 'Small icons are enlarged by a whole number of times to fit the suggested size of the field, without blurring.']],
        [['Editor de pixel', 'Pixel editor'], ['Lápis, borracha, balde, conta-gotas, espelho e grade. A lupa aproxima e afasta (Ctrl e a roda do mouse também), e as setas movem o desenho quando há zoom.', 'Pen, eraser, fill, picker, mirror and grid. The magnifier zooms in and out (Ctrl and the mouse wheel work too), and the arrows move the drawing when zoomed.']]
      ],
      tips: [['Use a imagem original sem borrar: o jogo desenha em pixel art, então prefira tamanhos pequenos.', 'Keep the original image unblurred: the game draws pixel art, so prefer small sizes.']]
    },
    {
      id: 'animations', page: 'items', sec: ['Começo', 'Getting started'], t: ['Animações', 'Animations'],
      intro: ['Criaturas, armas, projéteis, efeitos e prédios podem ter vários quadros. Você usa os da biblioteca, desenha os seus ou gera automaticamente.', 'Creatures, weapons, projectiles, effects and buildings can have several frames. Use the ones from the library, draw your own or generate them automatically.'],
      f: [
        [['Biblioteca animada', 'Animated library'], ['Os itens com o selo de quadros se mexem na grade. O filtro Só animados mostra apenas esses. Ao escolher um, todos os quadros e a velocidade vêm junto.', 'Items with the frames badge move in the grid. The Animated only filter shows just those. Picking one brings all the frames and the speed along.']],
        [['Quadros no editor', 'Frames in the editor'], ['No Desenhar, use + Quadro para adicionar, Duplicar para copiar e Excluir quadro para remover. Pele de cebola mostra o quadro anterior, e Reproduzir mostra o resultado na velocidade (FPS) escolhida.', 'In Draw, use + Frame to add, Duplicate to copy and Delete frame to remove. Onion skin shows the previous frame, and Play shows the result at the chosen speed (FPS).']],
        [['Gerar quadros', 'Generate frames'], ['Faltou animação? Desenhe um quadro e use Gerar quadros: andar, balançar, respirar, esmagar e esticar, flutuar, tremer, pulsar, flash branco ou girar.', 'No animation yet? Draw one frame and use Generate frames: walk, bob, breathe, squash and stretch, float, shake, pulse, white flash or spin.']],
        [['Onde vale', 'Where it applies'], ['Corpo andando e nadando das criaturas, golpes de arma, projéteis, efeitos de status, drops e prédios de espécies. Os campos que aceitam animação avisam isso.', 'Walking and swimming creature bodies, weapon slashes, projectiles, status effects, drops and species buildings. Fields that accept animation say so.']],
        [['Aleatório', 'Random'], ['A geração aleatória usa as animações da biblioteca quando existem.', 'Random generation uses the library animations when they exist.']]
      ],
      tips: [['Poucos quadros bastam: de 2 a 6 já dão vida. Mantenha todos do mesmo tamanho.', 'A few frames are enough: 2 to 6 already bring things to life. Keep all of them the same size.']]
    },
    {
      id: 'themes', page: 'mod', sec: ['Começo', 'Getting started'], t: ['Visuais e idiomas', 'Themes and languages'],
      intro: ['O site muda de visual e de idioma sem perder nada do seu projeto.', 'The site changes look and language without losing anything from your project.'],
      f: [
        [['Visual', 'Theme'], ['No topo, o seletor Visual troca cores, banner e fundo animado. Há doze: Ocean of Souls, Mod Maker 1 e 2, Monster Mod, FlagBox, Invasions, Nomes Brasileiros, One Piece, Magic Races, Naval Battles, Isekai e Family Christmas. O botão com um olho, no canto inferior esquerdo, oculta a interface para você ver o fundo.', 'At the top, the Theme selector changes colors, banner and animated background. There are twelve: Ocean of Souls, Mod Maker 1 and 2, Monster Mod, FlagBox, Invasions, Nomes Brasileiros, One Piece, Magic Races, Naval Battles, Isekai and Family Christmas. The eye button in the bottom left corner hides the interface so you can see the background.']],
        [['Idioma', 'Language'], ['O site fala os 38 idiomas do WorldBox. As traduções foram feitas por IA e podem ter erros; textos novos podem aparecer em inglês até serem traduzidos.', 'The site speaks the 38 WorldBox languages. Translations were made by AI and may contain mistakes; new texts may show in English until translated.']],
        [['Sons', 'Sounds'], ['O botão Som liga e desliga os sons de clique.', 'The Sound button turns the click sounds on and off.']]
      ]
    },
    {
      id: 'map', page: 'actions', sec: ['Receitas', 'Recipes'], t: ['O que precisa de quê', 'What needs what'],
      intro: ['Muita coisa aponta para outra. Crie sempre a coisa apontada primeiro. Quando você ainda não criou, o campo avisa e oferece um botão para criar na hora.', 'Many things point to others. Always make the pointed-to thing first. When you have not made it yet, the field says so and offers a button to create it on the spot.'],
      f: [
        [['Ações são a peça central', 'Actions are the central piece'], ['Traços, itens, status, eras, magias, leis, eventos, poderes e criaturas escolhem uma ação. Ela é criada na página Ações. O campo "Quando dispara" da ação decide onde ela pode ser usada: Ao atacar vale para armas e traços de ataque, Ao ser atacado para defesa, e Evento para o resto, como lei, morte, nascimento e era.', 'Traits, items, statuses, ages, spells, laws, events, powers and creatures pick an action. It is made on the Actions page. The action "Trigger" field decides where it can be used: On attack works for weapons and attack traits, When hit for defense, and Event for the rest, like laws, death, birth and ages.'], 'actions'],
        [['Lei do mundo', 'World law'], ['Ação ao ligar: ação do tipo Evento. Outras ações podem exigir a lei no campo "Exige lei".', 'Action when turned on: an Event type action. Other actions can require the law in the "Requires law" field.'], 'laws'],
        [['Traço', 'Trait'], ['Ações de ataque, ataque recebido, morte, efeito contínuo, crescer e nascer. Grupo vem da página Grupos de traços.', 'Attack, hit, death, continuous, growth and birth actions. The group comes from the Trait groups page.'], 'traits'],
        [['Item', 'Item'], ['Projétil (página Projéteis) e ações de ataque ou efeito contínuo.', 'Projectile (Projectiles page) and attack or continuous actions.'], 'items'],
        [['Magia', 'Spell'], ['Uma ação de ataque. A criatura usa a magia pelo campo Magias.', 'An attack action. The creature uses the spell through the Spells field.'], 'spells'],
        [['Criatura', 'Creature'], ['Reino (página Reinos), traços, magias e ação ao ser atacado.', 'Kingdom (Kingdoms page), traits, spells and when-hit action.'], 'units'],
        [['Nuvem', 'Cloud'], ['Um drop (página Drops).', 'A drop (Drops page).'], 'clouds'],
        [['Era', 'Age'], ['Nuvens (página Nuvens) e uma ação especial.', 'Clouds (Clouds page) and a special action.'], 'ages'],
        [['Desastre', 'Disaster'], ['Uma criatura ou espécie que ele faz aparecer e eras permitidas.', 'A creature or species it spawns and allowed ages.'], 'disasters'],
        [['Botão da aba', 'Tab button'], ['Uma criatura ou espécie para criar.', 'A creature or species to spawn.'], 'tab'],
        [['Poder', 'Power'], ['Um drop ou uma ação, e a aba onde aparece.', 'A drop or an action, and the tab where it shows.'], 'powers'],
        [['Conquista', 'Achievement'], ['Quem a concede é uma ação do tipo conquista, na página Ações.', 'What grants it is an achievement type action on the Actions page.'], 'achievements'],
        [['Ação com chance ajustável', 'Action with adjustable chance'], ['Crie uma configuração do tipo número inteiro com a chance e escolha-a em "Chance vinda de uma configuração".', 'Make an integer setting for the chance and pick it in "Chance from a setting".'], 'settings']
      ]
    },
    {
      id: 'recipe_law', page: 'actions', sec: ['Receitas', 'Recipes'], t: ['Receita: lei do mundo com efeito', 'Recipe: world law with an effect'],
      intro: ['Exemplo: uma lei que, ao ser ligada, faz chover algo sobre o mundo.', 'Example: a law that, when turned on, rains something over the world.'],
      f: [
        [['1. Crie o drop (opcional)', '1. Make the drop (optional)'], ['Se quiser algo novo para cair, crie em Drops. Se não, use um do jogo, como rain ou fire.', 'If you want something new to fall, make it in Drops. Otherwise use a game one, like rain or fire.'], 'drops'],
        [['2. Crie a ação', '2. Make the action'], ['Em Ações: Quando dispara = Evento, Efeito = soltar um drop, e escolha o drop. Dê um nome claro, como Chuva divina.', 'In Actions: Trigger = Event, Effect = drop something, and pick the drop. Give it a clear name, like Divine rain.'], 'actions'],
        [['3. Crie a lei', '3. Make the law'], ['Em Leis do mundo: nome, grupo, e em "Ação ao ligar" escolha a ação do passo 2.', 'In World laws: name, group, and in "Action when turned on" pick the action from step 2.'], 'laws'],
        [['4. Exporte e teste', '4. Export and test'], ['No jogo, abra a janela de leis do mundo e ligue a lei.', 'In game, open the world laws window and turn the law on.'], 'export']
      ]
    },
    {
      id: 'recipe_weapon', page: 'projectiles', sec: ['Receitas', 'Recipes'], t: ['Receita: arma que dispara algo', 'Recipe: weapon that shoots something'],
      intro: ['Exemplo: um arco com flechas próprias que causam queimadura.', 'Example: a bow with its own arrows that cause burning.'],
      f: [
        [['1. Projétil', '1. Projectile'], ['Em Projéteis: imagem, velocidade e efeito ao acertar.', 'In Projectiles: image, speed and impact effect.'], 'projectiles'],
        [['2. Ação de ataque', '2. Attack action'], ['Em Ações: Quando dispara = Ao atacar, Efeito = aplicar status, e escolha burning. Defina a chance.', 'In Actions: Trigger = On attack, Effect = apply status, and pick burning. Set the chance.'], 'actions'],
        [['3. Item', '3. Item'], ['Em Itens: tipo arco, escolha o projétil do passo 1 e a ação do passo 2 em "Ao atacar".', 'In Items: kind bow, pick the projectile from step 1 and the action from step 2 in "On attack".'], 'items']
      ]
    },
    {
      id: 'recipe_creature', page: 'actions', sec: ['Receitas', 'Recipes'], t: ['Receita: criatura com magia e botão', 'Recipe: creature with a spell and a button'],
      intro: ['Exemplo: um mago que solta bolas de fogo e pode ser criado pela sua aba.', 'Example: a mage that throws fireballs and can be spawned from your tab.'],
      f: [
        [['1. Ação de ataque', '1. Attack action'], ['Em Ações: Quando dispara = Ao atacar, Efeito à sua escolha.', 'In Actions: Trigger = On attack, any effect you like.'], 'actions'],
        [['2. Magia', '2. Spell'], ['Em Magias: escolha a ação do passo 1, ajuste chance e mana.', 'In Spells: pick the action from step 1, set chance and mana.'], 'spells'],
        [['3. Criatura', '3. Creature'], ['Em Criaturas: escolha a magia na lista Magias. Se quiser um reino próprio, crie em Reinos antes.', 'In Creatures: pick the spell in the Spells list. If you want your own kingdom, make it in Kingdoms first.'], 'units'],
        [['4. Aba e botão', '4. Tab and button'], ['Em Aba e botões: crie um botão e escolha a criatura em "Criatura criada".', 'In Tab and buttons: make a button and pick the creature in "Spawned creature".'], 'tab']
      ]
    },
    {
      id: 'recipe_age', page: 'drops', sec: ['Receitas', 'Recipes'], t: ['Receita: era com nuvens e desastre', 'Recipe: age with clouds and a disaster'],
      intro: ['Exemplo: uma era em que chovem sementes e surgem criaturas selvagens.', 'Example: an age where seeds rain and wild creatures appear.'],
      f: [
        [['1. Drop', '1. Drop'], ['Em Drops: crie ou use um do jogo, como seeds_grass.', 'In Drops: make one or use a game one, like seeds_grass.'], 'drops'],
        [['2. Nuvem', '2. Cloud'], ['Em Nuvens: escolha o drop do passo 1.', 'In Clouds: pick the drop from step 1.'], 'clouds'],
        [['3. Criatura', '3. Creature'], ['Em Criaturas ou Espécies: o que vai aparecer.', 'In Creatures or Species: what will appear.'], 'units'],
        [['4. Desastre', '4. Disaster'], ['Em Desastres: escolha a criatura e, em "Eras permitidas", a era que você vai criar no próximo passo (pode voltar depois).', 'In Disasters: pick the creature and, in "Allowed ages", the age you will make in the next step (you can come back later).'], 'disasters'],
        [['5. Era', '5. Age'], ['Em Eras: escolha as nuvens do passo 2.', 'In Ages: pick the clouds from step 2.'], 'ages']
      ]
    },
    {
      id: 'recipe_species', page: 'species', sec: ['Receitas', 'Recipes'], t: ['Receita: civilização própria', 'Recipe: your own civilization'],
      intro: ['Exemplo: uma espécie com construções, bandeira e cultura próprias.', 'Example: a species with its own buildings, banner and culture.'],
      f: [
        [['1. Pense no visual', '1. Plan the look'], ['Prepare as imagens: um símbolo e um fundo de bandeira e, se quiser, os prédios (todos opcionais).', 'Prepare the images: a banner symbol and background and, if you want, the buildings (all optional).']],
        [['2. Traços (opcional)', '2. Traits (optional)'], ['Em Traços: traços de criatura, cultura, religião, clã ou idioma exclusivos.', 'In Traits: exclusive creature, culture, religion, clan or language traits.'], 'traits'],
        [['3. Espécie', '3. Species'], ['Em Espécies: escolha a base, os nomes próprios, ligue o estilo próprio de construção e envie os desenhos e a bandeira, e escolha os traços.', 'In Species: pick the base, own names, turn on the own building style and upload the drawings and banner, and pick the traits.'], 'species'],
        [['4. Botão para criar', '4. Spawn button'], ['Em Aba e botões: escolha a espécie para poder criá-la no mapa.', 'In Tab and buttons: pick the species so you can spawn it on the map.'], 'tab']
      ]
    },
    {
      id: 'traits', page: 'traits', sec: ['Criaturas', 'Creatures'], t: ['Traços', 'Traits'],
      intro: ['Traços dão atributos e comportamentos a criaturas, ou a reinos, culturas e outros grupos, conforme o tipo escolhido.', 'Traits give stats and behavior to creatures, or to kingdoms, cultures and other groups depending on the chosen kind.'],
      f: [
        [['Tipo de traço', 'Trait kind'], ['Define onde o traço vale: criatura, subespécie, cultura, idioma, clã, religião, reino... Os grupos e as opções mudam conforme o tipo.', 'Sets where the trait applies: creature, subspecies, culture, language, clan, religion, kingdom... Groups and options change with the kind.']],
        [['Grupo', 'Group'], ['Pasta onde o traço aparece na janela do jogo. Crie os seus na página Grupos.', 'The folder the trait appears in inside the game window. Make your own on the Groups page.']],
        [['Raridade', 'Rarity'], ['Define a cor da moldura e o quão raro o traço é de sortear.', 'Sets the frame color and how rare the trait is to roll.']],
        [['Atributos', 'Stats'], ['Valores somados à criatura. Negativos são penalidades. Em porcentagem, 0.1 vale 10%.', 'Values added to the creature. Negatives are penalties. For percent stats, 0.1 means 10%.']],
        [['Ao nascer / crescer / herdar', 'At birth / growing / inherit'], ['Chance de o traço aparecer nesses momentos. 0 significa nunca.', 'Chance the trait shows up at those moments. 0 means never.']],
        [['Opostos', 'Opposites'], ['Traços que não podem coexistir com este.', 'Traits that cannot coexist with this one.']],
        [['Ações', 'Actions'], ['Ligam o traço a ações criadas na página Ações: ao atacar, ao ser atacado, ao morrer, efeito contínuo, ao crescer, ao nascer.', 'Link the trait to actions made on the Actions page: on attack, when hit, on death, continuous effect, growing up, birth.']]
      ]
    },
    {
      id: 'groups', page: 'groups', sec: ['Criaturas', 'Creatures'], t: ['Grupos de traços', 'Trait groups'],
      intro: ['Pastas para organizar seus traços na janela do jogo.', 'Folders to organize your traits in the game window.'],
      f: [[['Tipo e cor', 'Kind and color'], ['O tipo precisa ser o mesmo dos traços que ficarão dentro. A cor pinta o cabeçalho da pasta.', 'The kind must match the traits that go inside. The color paints the folder header.']]]
    },
    {
      id: 'units', page: 'units', sec: ['Criaturas', 'Creatures'], t: ['Criaturas', 'Creatures'],
      intro: ['Criaturas solo, na aba Criaturas da página Espécies. Não constroem civilização e copiam o corpo e a animação de uma base do jogo.', 'Solo creatures, on the Creatures tab of the Species page. They do not build a civilization and copy the body and animation of a game base.'],
      f: [
        [['Base', 'Template'], ['Modelo do jogo usado como ponto de partida. Define o sprite e o comportamento geral.', 'Game model used as the starting point. Sets the sprite and general behavior.']],
        [['Reino selvagem', 'Wild kingdom'], ['Decide com quem a criatura é amiga ou inimiga. Escolha de um reino seu ou do jogo, como wolf ou sheep.', 'Decides who the creature is friendly or hostile with. Pick one of yours or a game one, like wolf or sheep.']],
        [['Tamanho', 'Size'], ['Tamanho da hitbox e do desenho.', 'Size of hitbox and drawing.']],
        [['Atributos', 'Stats'], ['Vida, dano, velocidade, armadura, ataque por segundo e tempo de vida.', 'Health, damage, speed, armor, attacks per second and lifespan.']],
        [['Traços', 'Traits'], ['IDs separados por vírgula, de traços seus ou do jogo.', 'Comma-separated IDs, from your traits or game ones.']],
        [['Magias', 'Spells'], ['Magias da página Magias que a criatura pode lançar.', 'Spells from the Spells page the creature can cast.']]
      ],
      tips: [['A animação vem da base. O ícone você escolhe: envie, desenhe ou pegue um da Biblioteca.', 'The animation comes from the base. You pick the icon: upload, draw or take one from the Library.']]
    },
    {
      id: 'species', page: 'species', sec: ['Criaturas', 'Creatures'], t: ['Espécies', 'Species'],
      intro: ['Uma espécie é uma civilização completa: tem reino nômade, reino civilizado, cultura, religião, idioma e clãs. Ela herda aparência e construções de uma espécie base.', 'A species is a full civilization: nomad kingdom, civilized kingdom, culture, religion, language and clans. It inherits looks and buildings from a base species.'],
      f: [
        [['Duas abas', 'Two tabs'], ['A página Espécies tem a aba Criaturas, para criaturas solo simples, e a aba Civilizações, para povos completos com cidades, reino, cultura, religião e idioma. Esta página fala da aba Civilizações.', 'The Species page has the Creatures tab, for simple solo creatures, and the Civilizations tab, for full peoples with cities, kingdom, culture, religion and language. This page covers the Civilizations tab.']],
        [['Espécie base', 'Base species'], ['Humano, elfo, orc ou anão. Define sprites, animações, estilo de construção e barcos.', 'Human, elf, orc or dwarf. Sets sprites, animations, building style and boats.']],
        [['Cor e cor do reino', 'Color and kingdom color'], ['A cor identifica a espécie na interface. A cor do reino é a padrão usada no mapa.', 'The color identifies the species in the interface. The kingdom color is the default one on the map.']],
        [['Genoma', 'Genome'], ['Valores de partida da espécie. Vida, dano, velocidade, tempo de vida e as aptidões sociais: diplomacia, guerra, administração e inteligência.', 'Starting values of the species. Health, damage, speed, lifespan and the social aptitudes: diplomacy, warfare, stewardship and intelligence.']],
        [['Cidades iniciais', 'Base cities'], ['Quantas cidades o reino consegue sustentar no começo.', 'How many cities the kingdom can sustain at the start.']],
        [['Conjuntos de nomes', 'Name sets'], ['Listas de nomes do jogo. Vazio mantém as da espécie base.', 'Game name lists. Empty keeps the base species ones.']],
        [['Comidas', 'Foods'], ['O que os moradores produzem nas casas.', 'What residents produce at home.']],
        [['Amigável com / Inimigo de', 'Friendly with / Enemy of'], ['Etiquetas de reino. Etiquetas são rótulos como good, evil, undead, human. O reino da espécie ganha uma etiqueta com o próprio ID.', 'Kingdom tags. Tags are labels like good, evil, undead, human. The species kingdom gets a tag with its own ID.']],
        [['Reino próprio', 'Own kingdom'], ['Cada espécie já cria sozinha dois reinos: um nômade, para quem ainda não tem cidade, e um civilizado. Os dois levam o nome e o ícone da espécie. Para reinos de criaturas selvagens, use a página Reinos.', 'Each species already makes two kingdoms by itself: a nomad one for those without a city yet, and a civilized one. Both carry the species name and icon. For wild creature kingdoms, use the Kingdoms page.']],
        [['Nomes próprios', 'Own names'], ['Preencha começos e finais separados por vírgula (por exemplo Ka, Ro e rak, dun) e a espécie passa a nomear pessoas, cidades, reinos, culturas, idiomas e religiões só com eles. Vazio usa os nomes do jogo.', 'Fill in starts and ends separated by commas (for example Ka, Ro and rak, dun) and the species names people, cities, kingdoms, cultures, languages and religions only with them. Empty uses the game names.']],
        [['Estilo próprio de construção', 'Own building style'], ['Ligue e desenhe os prédios: casa, salão, moinho, doca de pesca, porto, torre, templo, biblioteca e quartel. O que você não desenhar usa o prédio da espécie base. O mesmo desenho serve para o prédio em obra e em ruínas.', 'Turn on and draw the buildings: house, hall, windmill, fishing dock, harbor, tower, temple, library and barracks. Anything you do not draw uses the base species building. The same drawing is used while under construction and as ruins.']],
        [['Bandeira', 'Banner'], ['Envie um fundo e um símbolo para a bandeira do reino, ou pegue da Biblioteca. Os dois precisam estar juntos.', 'Upload a background and a symbol for the kingdom banner, or take them from the Library. Both must be given together.']],
        [['Traços de subespécie', 'Subspecies traits'], ['Corpo e biologia. São somados aos da espécie base, que já traz reprodução, dieta e cérebro.', 'Body and biology. They are added on top of the base species ones, which already bring reproduction, diet and brain.']],
        [['Cultura, idioma, clã, religião', 'Culture, language, clan, religion'], ['Traços extras, somados aos da base, que a primeira cultura, idioma, clã e religião da espécie vão ter. Cultura define estilo de cidade, armas favoritas e leis sociais.', 'Extra traits, added on top of the base ones, that the first culture, language, clan and religion of the species will have. Culture sets city style, favorite weapons and social rules.']]
      ],
      tips: [
        ['Para um resultado seguro, mude primeiro genoma, cores e nomes; os traços extras são opcionais e a base já traz o necessário para a civilização funcionar.', 'For a safe result, change genome, colors and names first; the extra traits are optional and the base already brings what the civilization needs.'],
        ['Teste no jogo: crie a espécie com o botão da aba e deixe o tempo correr até ela fundar uma cidade.', 'Test in game: spawn the species with a tab button and let time pass until it founds a city.']
      ]
    },
    {
      id: 'kingdoms', page: 'kingdoms', sec: ['Criaturas', 'Creatures'], t: ['Reinos', 'Kingdoms'],
      intro: ['Reinos definem quem ataca quem. Criaturas selvagens apontam para um reino.', 'Kingdoms decide who attacks whom. Wild creatures point to a kingdom.'],
      f: [
        [['Base', 'Template'], ['Modelo com as regras comuns, como mob selvagem ou civilização.', 'Model with the common rules, like wild mob or civilization.']],
        [['Etiquetas do reino', 'Tags of this kingdom'], ['Rótulos que este reino carrega.', 'Labels this kingdom carries.']],
        [['Etiquetas amigas / inimigas', 'Friendly / enemy tags'], ['Qualquer reino com uma etiqueta amiga não é atacado; com uma inimiga é atacado.', 'Any kingdom with a friendly tag is not attacked; with an enemy tag it is attacked.']]
      ]
    },
    {
      id: 'items', page: 'items', sec: ['Criaturas', 'Creatures'], t: ['Itens', 'Items'],
      intro: ['Armas, armaduras e acessórios que os ferreiros fazem e as criaturas equipam.', 'Weapons, armor and accessories that smiths craft and creatures equip.'],
      f: [
        [['Tipo', 'Kind'], ['Espada, arco, lança, armadura, anel... Define o espaço e as regras do equipamento.', 'Sword, bow, spear, armor, ring... Sets the slot and rules of the equipment.']],
        [['Raridade base, valor, durabilidade, rigidez', 'Base rarity, value, durability, rigidity'], ['Valor mexe no preço e na força geral. Durabilidade é quantos usos antes de quebrar.', 'Value affects price and overall power. Durability is how many uses before it breaks.']],
        [['Custo', 'Cost'], ['Ouro e recurso gastos para fazer o item.', 'Gold and resource spent to craft the item.']],
        [['Projétil e golpe', 'Projectile and slash'], ['Armas à distância usam um projétil criado na página Projéteis. A animação do golpe é só visual.', 'Ranged weapons use a projectile from the Projectiles page. The slash animation is visual only.']],
        [['Sprite na mão', 'Hand sprite'], ['Desenho da arma sendo segurada. O ícone aparece nos menus.', 'Drawing of the weapon being held. The icon shows in menus.']]
      ]
    },
    {
      id: 'status', page: 'status', sec: ['Criaturas', 'Creatures'], t: ['Status', 'Statuses'],
      intro: ['Efeitos temporários em uma criatura, como queimando ou congelado.', 'Temporary effects on a creature, like burning or frozen.'],
      f: [
        [['Duração', 'Duration'], ['Quantos segundos o efeito dura.', 'How many seconds the effect lasts.']],
        [['Intervalo e ação contínua', 'Interval and tick action'], ['A ação roda a cada intervalo. 0 desliga.', 'The action runs every interval. 0 turns it off.']],
        [['Ações de fim, morte, receber e ser atacado', 'End, death, receive and hit actions'], ['Ligam o status a ações da página Ações.', 'Link the status to actions from the Actions page.']],
        [['Atributos', 'Stats'], ['Mudam os atributos enquanto o status durar.', 'Change stats while the status lasts.']],
        [['Remove / bloqueado por', 'Removes / blocked by'], ['Status que este remove ao entrar e status que impedem este de entrar.', 'Statuses this removes on entry and statuses that stop this from entering.']],
        [['Efeito visual', 'Visual effect'], ['Nome de uma textura de efeitos do jogo mostrada sobre a criatura. Vazio não mostra nada.', 'Name of a game effects texture shown over the creature. Empty shows nothing.']]
      ]
    },
    {
      id: 'spells', page: 'spells', sec: ['Criaturas', 'Creatures'], t: ['Magias', 'Spells'],
      intro: ['Habilidades que uma criatura lança em combate.', 'Abilities a creature casts in combat.'],
      f: [
        [['Chance e mana', 'Chance and mana'], ['Chance de lançar quando possível e custo em mana.', 'Chance to cast when possible and mana cost.']],
        [['Alvo e entidade', 'Target and entity'], ['Em quem a magia mira e que tipo de coisa conta como alvo.', 'Who the spell aims at and what kind of thing counts as a target.']],
        [['Ação', 'Action'], ['Efeito da magia: crie antes uma ação de ataque na página Ações.', 'The spell effect: make an attack action on the Actions page first.']]
      ],
      tips: [['Depois de criar a magia, adicione-a às criaturas na página Criaturas.', 'After making the spell, add it to creatures on the Creatures page.']]
    },
    {
      id: 'actions', page: 'actions', sec: ['Lógica', 'Logic'], t: ['Ações', 'Actions'],
      intro: ['Pequenos efeitos reutilizáveis. Traços, itens, status, eras, magias e eventos escolhem ações daqui.', 'Small reusable effects. Traits, items, statuses, ages, spells and events pick actions from here.'],
      f: [
        [['Quando dispara', 'Trigger'], ['O tipo da ação precisa combinar com onde ela será usada: ao atacar, ao ser atacado ou no mundo.', 'The action type must match where it will be used: on attack, when hit or in the world.']],
        [['Efeito', 'Effect type'], ['Receita pronta: soltar um drop, aplicar status, curar, explodir, criar criatura, dar conquista, trocar de lado e outras. Os campos abaixo mudam conforme a receita.', 'Ready recipe: drop something, apply a status, heal, explode, spawn a creature, unlock an achievement, switch sides and more. The fields below change with the recipe.']],
        [['Chance', 'Chance'], ['Porcentagem de a ação acontecer. Pode vir de uma configuração que o jogador ajusta.', 'Percent chance the action happens. It can come from a setting the player adjusts.']],
        [['Exige lei', 'Requires law'], ['A ação só roda se uma lei do mundo sua estiver ligada.', 'The action only runs if one of your world laws is on.']]
      ]
    },
    {
      id: 'projectiles', page: 'projectiles', sec: ['Lógica', 'Logic'], t: ['Projéteis', 'Projectiles'],
      intro: ['Objetos lançados por armas e magias à distância.', 'Objects thrown by ranged weapons and spells.'],
      f: [
        [['Imagem e textura', 'Image and texture'], ['Seu desenho ou o nome de uma textura do jogo.', 'Your drawing or the name of a game texture.']],
        [['Velocidade e escalas', 'Speed and scales'], ['Rapidez do voo e tamanho no começo e no fim.', 'Flight speed and size at start and end.']],
        [['Efeitos', 'Effects'], ['Rastro, efeito ao acertar, terraform, tremor e congelamento na batida. Sons são nomes de eventos do jogo.', 'Trail, impact effect, terraform, shake and freeze on hit. Sounds are names of game events.']]
      ]
    },
    {
      id: 'events', page: 'events', sec: ['Lógica', 'Logic'], t: ['Eventos', 'Events'],
      intro: ['Ligam uma ação a um momento do jogo, como nascimento, subida de nível ou morte.', 'Tie an action to a moment in the game, like birth, level up or death.'],
      f: [
        [['Momento', 'Moment'], ['Quando o evento dispara.', 'When the event fires.']],
        [['Ação', 'Action'], ['O que acontece. Crie antes na página Ações.', 'What happens. Make it first on the Actions page.']],
        [['Chance', 'Chance'], ['Porcentagem de rodar a cada vez.', 'Percent chance to run each time.']]
      ]
    },
    {
      id: 'disasters', page: 'disasters', sec: ['Mundo', 'World'], t: ['Desastres', 'Disasters'],
      intro: ['Eventos naturais que o jogo sorteia sozinho e que fazem criaturas aparecerem.', 'Natural events the game rolls by itself that make creatures appear.'],
      f: [
        [['Unidade que aparece', 'Spawned unit'], ['Criatura criada pelo desastre.', 'Creature the disaster spawns.']],
        [['Taxa e chance', 'Rate and chance'], ['Taxa é a frequência com que o jogo testa; chance é a probabilidade de acontecer no teste.', 'Rate is how often the game tests; chance is the probability it happens on the test.']],
        [['Mínimos do mundo', 'World minimums'], ['População e cidades mínimas para o desastre poder ocorrer.', 'Minimum population and cities for the disaster to occur.']],
        [['Quantidades', 'Amounts'], ['Mínimo e máximo de criaturas por vez e o máximo existente.', 'Minimum and maximum creatures at a time and the maximum alive.']],
        [['Eras permitidas e proibidas', 'Allowed and forbidden ages'], ['Limitam em quais eras ele pode acontecer.', 'Limit in which ages it can happen.']]
      ]
    },
    {
      id: 'drops', page: 'drops', sec: ['Mundo', 'World'], t: ['Drops', 'Drops'],
      intro: ['Coisas que caem do céu ou são soltas pelos poderes: chuva, bombas, sementes, bênçãos.', 'Things that fall from the sky or are released by powers: rain, bombs, seeds, blessings.'],
      f: [
        [['Efeito', 'Effect'], ['Aplicar status, executar uma ação, criar criatura ou mudar o terreno, conforme a opção.', 'Apply a status, run an action, spawn a creature or change terrain, depending on the option.']],
        [['Imagem', 'Image'], ['Sprite pequeno que cai.', 'Small sprite that falls.']],
        [['Raio e quantidade', 'Radius and amount'], ['Quanto da área é atingida.', 'How much area is hit.']]
      ]
    },
    {
      id: 'ages', page: 'ages', sec: ['Mundo', 'World'], t: ['Eras', 'Ages'],
      intro: ['Períodos do mundo que mudam clima, nuvens e regras por alguns anos.', 'World periods that change weather, clouds and rules for some years.'],
      f: [
        [['Duração', 'Length'], ['Mínimo e máximo de anos.', 'Minimum and maximum years.']],
        [['Nuvens e desastres', 'Clouds and disasters'], ['Nuvens que aparecem na era e desastres ligados a ela.', 'Clouds that show up in the age and disasters tied to it.']],
        [['Atributos', 'Stats'], ['Modificam o mundo ou as criaturas durante a era.', 'Modify the world or creatures during the age.']],
        [['Ação especial', 'Special action'], ['Roda ao longo da era.', 'Runs during the age.']]
      ]
    },
    {
      id: 'buildings', page: 'buildings', sec: ['Mundo', 'World'], t: ['Construções', 'Buildings'],
      intro: ['Prédios novos. Cada um é copiado de uma construção do jogo, então o desenho vem da base.', 'New buildings. Each is copied from a game building, so the drawing comes from the base.'],
      f: [
        [['Base', 'Base'], ['Construção do jogo usada como modelo.', 'Game building used as the model.']],
        [['Vida, tamanho e custos', 'Health, size and costs'], ['Resistência, espaço ocupado e recursos para construir.', 'Toughness, space used and resources to build.']],
        [['Ações', 'Actions'], ['Podem rodar quando algo acontece no prédio.', 'Can run when something happens at the building.']]
      ]
    },
    {
      id: 'biomes', page: 'biomes', sec: ['Mundo', 'World'], t: ['Biomas', 'Biomes'],
      intro: ['Biomas novos copiados de um bioma do jogo.', 'New biomes copied from a game biome.'],
      f: [
        [['Base', 'Base'], ['Bioma usado como modelo para terreno e plantas.', 'Biome used as a model for terrain and plants.']],
        [['Cor e propriedades', 'Color and properties'], ['Aparência no mapa e regras como espalhar ou queimar.', 'Look on the map and rules like spreading or burning.']]
      ]
    },
    {
      id: 'resources', page: 'resources', sec: ['Mundo', 'World'], t: ['Recursos', 'Resources'],
      intro: ['Materiais que cidades coletam, produzem e usam.', 'Materials cities gather, produce and use.'],
      f: [
        [['Tipo', 'Kind'], ['Material, comida ou item de comércio.', 'Material, food or trade item.']],
        [['Valor e ícone', 'Value and icon'], ['Quanto vale no comércio e o desenho mostrado.', 'How much it is worth in trade and the drawing shown.']]
      ]
    },
    {
      id: 'clouds', page: 'clouds', sec: ['Mundo', 'World'], t: ['Nuvens', 'Clouds'],
      intro: ['Nuvens que soltam um drop. Use em eras e desastres.', 'Clouds that release a drop. Use in ages and disasters.'],
      f: [
        [['Drop que cai', 'Drop that falls'], ['O que sai da nuvem.', 'What comes out of the cloud.']],
        [['Relâmpagos', 'Lightning'], ['A nuvem solta raios também.', 'The cloud also throws bolts.']],
        [['Tamanho, velocidade e opacidade', 'Size, speed and opacity'], ['Aparência e movimento.', 'Look and movement.']]
      ]
    },
    {
      id: 'laws', page: 'laws', sec: ['Mundo', 'World'], t: ['Leis do mundo', 'World laws'],
      intro: ['Interruptores que o jogador liga na janela de leis do mundo.', 'Switches the player flips in the world laws window.'],
      f: [
        [['Grupo', 'Group'], ['Aba da janela onde a lei fica.', 'Window tab where the law sits.']],
        [['Ligada por padrão e pode desligar', 'On by default and can turn off'], ['Estado inicial e se o jogador pode mudar.', 'Initial state and whether the player may change it.']],
        [['Ação ao ligar', 'Action when turned on'], ['Roda quando a lei é ligada. Outras ações podem exigir esta lei.', 'Runs when the law is turned on. Other actions can require this law.']]
      ]
    },
    {
      id: 'achievements', page: 'achievements', sec: ['Mundo', 'World'], t: ['Conquistas', 'Achievements'],
      intro: ['Marcos que o jogador desbloqueia. Normalmente uma ação do tipo conquista as dá.', 'Milestones the player unlocks. Usually an achievement-type action grants them.'],
      f: [
        [['Grupo', 'Group'], ['Categoria da conquista.', 'Achievement category.']],
        [['Texto e ícone', 'Text and icon'], ['Nome, descrição e desenho mostrados na lista.', 'Name, description and drawing shown in the list.']]
      ]
    },
    {
      id: 'tab', page: 'tab', sec: ['Interface', 'Interface'], t: ['Aba e botões', 'Tab and buttons'],
      intro: ['Sua aba de poderes dentro do jogo, com botões que criam criaturas.', 'Your power tab inside the game, with buttons that spawn creatures.'],
      f: [
        [['ID e ícone da aba', 'Tab ID and icon'], ['Identificam a aba. O ícone é largo, com 66 por 22 pixels.', 'Identify the tab. The icon is wide, 66 by 22 pixels.']],
        [['Botão', 'Button'], ['Cada botão cria uma criatura ou espécie sua ou do jogo, com nome, descrição e ícone próprios.', 'Each button spawns a creature or species of yours or from the game, with its own name, description and icon.']],
        [['Nível do poder', 'Power rank'], ['Define se é gratuito ou exige conta premium.', 'Sets whether it is free or needs premium.']]
      ]
    },
    {
      id: 'settings', page: 'settings', sec: ['Interface', 'Interface'], t: ['Configurações', 'Settings'],
      intro: ['Opções que o jogador ajusta na janela do mod.', 'Options the player adjusts in the mod window.'],
      f: [
        [['Tipo', 'Type'], ['Interruptor, número inteiro, decimal ou texto.', 'Switch, integer, decimal or text.']],
        [['Grupo', 'Group'], ['Seção da janela onde a opção aparece.', 'Window section where the option shows.']],
        [['Uso', 'Use'], ['Em Ações, a chance pode vir de uma configuração numérica; assim o jogador regula a força do efeito.', 'In Actions, the chance can come from a numeric setting so the player tunes how strong the effect is.']]
      ]
    },
    {
      id: 'powers', page: 'powers', sec: ['Interface', 'Interface'], t: ['Poderes', 'Powers'],
      intro: ['Poderes divinos que o jogador usa no mapa, como soltar um drop ou clicar para criar algo.', 'God powers the player uses on the map, like releasing a drop or clicking to create something.'],
      f: [
        [['Modelo', 'Template'], ['Soltar drop, construir ou criar criatura, ou ação personalizada.', 'Release a drop, build or spawn a creature, or a custom action.']],
        [['Ícone e aba', 'Icon and tab'], ['Os poderes aparecem na sua aba.', 'Powers show on your tab.']]
      ]
    },
    {
      id: 'codes', page: 'codes', sec: ['Avançado', 'Advanced'], t: ['Código livre', 'Custom code'],
      intro: ['Para quem sabe C#. O Neo Mod Maker não verifica nada aqui.', 'For people who know C#. Neo Mod Maker checks nothing here.'],
      f: [
        [['Bloco de inicialização', 'Init block'], ['Linhas soltas que rodam quando o mod carrega.', 'Loose lines that run when the mod loads.']],
        [['Patch Harmony', 'Harmony patch'], ['Informe classe, método, tipo (Prefix ou Postfix) e parâmetros. O corpo é o que você escrever.', 'Give class, method, kind (Prefix or Postfix) and parameters. The body is whatever you write.']],
        [['Arquivo completo', 'Full file'], ['Um arquivo C# inteiro, copiado como está.', 'A whole C# file, copied as is.']]
      ],
      tips: [['Erros de compilação aparecem no log do jogo ao abrir.', 'Compile errors show in the game log when it starts.']]
    },
    {
      id: 'export', page: 'export', sec: ['Avançado', 'Advanced'], t: ['Exportar e reabrir', 'Exporting and reopening'],
      intro: ['Gera o mod final.', 'Builds the final mod.'],
      f: [
        [['Avisos', 'Warnings'], ['O número ao lado de Exportar conta problemas, como IDs repetidos ou campos obrigatórios vazios.', 'The number next to Export counts problems, like repeated IDs or empty required fields.']],
        [['Reabrir', 'Reopening'], ['Na página Mod, solte o .zip exportado para continuar editando.', 'On the Mod page, drop the exported .zip to keep editing.']],
        [['Limites', 'Limits'], ['Não cria sons, efeitos visuais novos, tipos de guerra, atributos novos, janelas nem sprites animados de criaturas.', 'Does not create sounds, new visual effects, war types, new stats, windows or animated creature sprites.']]
      ]
    }
  ];

  var selected = 'start';
  var query = '';

  function topicText(tp) {
    var parts = [L(tp.t), L(tp.intro || ['', ''])];
    (tp.f || []).forEach(function (x) { parts.push(L(x[0]), L(x[1])); });
    (tp.tips || []).forEach(function (x) { parts.push(L(x)); });
    return parts.join(' ').toLowerCase();
  }

  function screen() {
    var root = h('div', { class: 'split' });
    var side = h('div', { class: 'list panel' });
    var body = h('div', { class: 'editor panel' });
    root.appendChild(side);
    root.appendChild(body);

    function paintBody() {
      body.innerHTML = '';
      var tp = topics.filter(function (x) { return x.id === selected; })[0] || topics[0];
      body.appendChild(h('h2', { text: L(tp.t) }));
      body.appendChild(h('p', { text: L(tp.intro || ['', '']) }));
      (tp.f || []).forEach(function (x) {
        var item = h('div', { class: 'forum-item' }, h('h3', { text: L(x[0]) }), h('p', { text: L(x[1]) }));
        if (x[2] && MM.ui.screens[x[2]]) {
          var jump = h('button', { class: 'btn tiny', type: 'button', text: T('Ir para ', 'Go to ') + L(MM.ui.order.filter(function (o) { return o.id === x[2]; }).map(function (o) { return [o.pt, o.en]; })[0] || ['', '']) });
          jump.addEventListener('click', function () { MM.app.go(x[2]); });
          item.appendChild(jump);
        }
        body.appendChild(item);
      });
      (tp.tips || []).forEach(function (x) {
        body.appendChild(h('p', { class: 'note', text: L(x) }));
      });
      var screens = MM.ui.screens;
      if (tp.page && screens[tp.page] && tp.page !== 'forum') {
        var go = h('button', { class: 'btn primary', type: 'button', text: T('Abrir esta página', 'Open this page') });
        go.addEventListener('click', function () { MM.app.go(tp.page); });
        body.appendChild(go);
      }
    }

    function paintSide() {
      side.innerHTML = '';
      var q = h('input', { type: 'text', class: 'search', placeholder: T('Buscar no fórum...', 'Search the forum...'), value: query });
      q.addEventListener('input', function () {
        query = q.value;
        var pos = q.selectionStart;
        paintSide();
        var again = side.querySelector('.search');
        if (again) { again.focus(); again.setSelectionRange(pos, pos); }
      });
      side.appendChild(q);
      var needle = query.toLowerCase().trim();
      var last = null;
      topics.forEach(function (tp) {
        if (needle && topicText(tp).indexOf(needle) < 0) return;
        var sec = L(tp.sec);
        if (sec !== last) {
          last = sec;
          side.appendChild(h('div', { class: 'nav-head', text: sec }));
        }
        var card = h('div', { class: 'card' + (tp.id === selected ? ' sel' : '') }, h('div', { class: 'card-main' }, h('strong', { text: L(tp.t) })));
        card.addEventListener('click', function () {
          selected = tp.id;
          paintSide();
          paintBody();
        });
        side.appendChild(card);
      });
    }

    paintSide();
    paintBody();
    return root;
  }

  function open(page) {
    var hit = topics.filter(function (x) { return x.page === page; })[0];
    if (hit) selected = hit.id;
  }

  return { screen: screen, topics: topics, open: open };
})();
