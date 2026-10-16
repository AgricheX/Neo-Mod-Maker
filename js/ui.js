MM.ui = (function () {
  var h = MM.h;
  var D = MM.data;

  function T(pt, en) { return MM.tr(pt, en); }

  var F = {};

  F.row = function (label, control, hint) {
    return h('label', { class: 'f-row' }, h('span', { class: 'f-label', text: label }), control, hint ? h('span', { class: 'f-hint', text: hint }) : null);
  };

  F.text = function (label, obj, key, opts) {
    opts = opts || {};
    var inp = h('input', { type: 'text', value: obj[key] === undefined ? '' : obj[key], placeholder: opts.placeholder || '' });
    inp.addEventListener('input', function () {
      var v = inp.value;
      if (opts.slug) {
        var s = MM.slug(v);
        if (s !== v) { inp.value = s; v = s; }
      }
      var old = obj[key];
      obj[key] = v;
      if (opts.onchange) opts.onchange(v, old);
      MM.store.save();
    });
    return F.row(label, inp, opts.hint);
  };

  F.area = function (label, obj, key) {
    var inp = h('textarea', { rows: 3 });
    inp.value = obj[key] || '';
    inp.addEventListener('input', function () { obj[key] = inp.value; MM.store.save(); });
    return F.row(label, inp);
  };

  F.number = function (label, obj, key, opts) {
    opts = opts || {};
    var inp = h('input', { type: 'number', step: opts.step || 1, value: obj[key] });
    if (opts.min !== undefined) inp.min = opts.min;
    if (opts.max !== undefined) inp.max = opts.max;
    inp.addEventListener('input', function () {
      obj[key] = inp.value === '' ? 0 : Number(inp.value);
      MM.store.save();
    });
    return F.row(label, inp, opts.hint);
  };

  F.select = function (label, obj, key, options, onchange) {
    var sel = h('select');
    options.forEach(function (o) {
      var opt = h('option', { value: o.v, text: o.l });
      if (String(obj[key]) === String(o.v)) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () {
      obj[key] = sel.value;
      MM.store.save();
      if (onchange) onchange(sel.value);
    });
    return F.row(label, sel);
  };

  F.check = function (label, obj, key, onchange) {
    var inp = h('input', { type: 'checkbox', checked: !!obj[key] });
    inp.addEventListener('change', function () {
      obj[key] = inp.checked;
      MM.store.save();
      if (onchange) onchange(inp.checked);
    });
    return h('label', { class: 'f-check' }, inp, h('span', { text: label }));
  };

  F.color = function (label, obj, key) {
    var inp = h('input', { type: 'color', value: obj[key] || '#ffffff' });
    inp.addEventListener('input', function () { obj[key] = inp.value; MM.store.save(); });
    return F.row(label, inp);
  };

  F.image = function (label, obj, key, size, anim) {
    var hintText = size ? (T('Tamanho sugerido: ', 'Suggested size: ') + size) : '';
    if (anim) hintText += (hintText ? ' - ' : '') + T('aceita animação (vários quadros)', 'supports animation (several frames)');
    return F.row(label, MM.img.control(obj, key, hintText, null, size, anim));
  };

  F.i18n = function (label, obj, key, opts) {
    opts = opts || {};
    if (!obj[key] || typeof obj[key] !== 'object') obj[key] = { en: obj[key] || '' };
    var box = h('div', { class: 'i18n' });
    function mk(lang, name) {
      var inp = h('input', { type: 'text', value: obj[key][lang] || '' });
      inp.addEventListener('input', function () {
        obj[key][lang] = inp.value;
        MM.store.save();
        if (lang === 'en' && opts.onchange) opts.onchange(inp.value);
      });
      return h('label', { class: 'i18n-row' }, h('span', { class: 'i18n-lang', text: name }), inp);
    }
    box.appendChild(mk('en', 'English'));
    var S = MM.store.get();
    if (opts.random) {
      var rb = h('button', { type: 'button', class: 'btn tiny', text: T('Aleatório', 'Random') });
      rb.addEventListener('click', function () {
        if (opts.random === 'desc') {
          MM.random.themeFor(obj.name);
          obj[key] = MM.random.desc(opts.cat);
        } else {
          var spec = typeof opts.random === 'function' ? opts.random() : opts.random;
          var cat = Array.isArray(spec) ? spec[0] : spec;
          var extra = Array.isArray(spec) ? spec[1] : undefined;
          MM.random.fill(obj, key, cat, extra);
        }
        MM.store.save();
        if (opts.onchange) opts.onchange(obj[key].en);
        if (opts.repaint) opts.repaint();
        else {
          var holder = box.parentNode.parentNode;
          var fresh = F.i18n(label, obj, key, opts);
          holder.parentNode.replaceChild(fresh, holder);
        }
      });
      box.appendChild(h('div', { class: 'btn-row' }, rb));
    }
    var extra = (S.locales || []).filter(function (l) { return l !== 'en'; });
    if (extra.length) {
      var det = h('details', { class: 'i18n-more' }, h('summary', { text: T('Traduções', 'Translations') + ' (' + extra.length + ')' }));
      extra.forEach(function (code) {
        var info = D.languages.filter(function (x) { return x.id === code; })[0];
        det.appendChild(mk(code, info ? info.name : code));
      });
      box.appendChild(det);
    }
    return h('div', { class: 'f-row f-i18n' }, h('span', { class: 'f-label', text: label }), box);
  };

  F.opts = function (list) {
    return list.map(function (x) {
      if (typeof x === 'string') return { v: x, l: x };
      return { v: x.id, l: MM.L(x) };
    });
  };

  F.chips = function (label, arr, options) {
    var wrap = h('div', { class: 'chips' });
    function paint() {
      wrap.innerHTML = '';
      options.forEach(function (o) {
        var on = arr.indexOf(o) >= 0;
        var b = h('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), text: o });
        b.addEventListener('click', function () {
          var i = arr.indexOf(o);
          if (i >= 0) arr.splice(i, 1); else arr.push(o);
          MM.store.save();
          paint();
        });
        wrap.appendChild(b);
      });
    }
    paint();
    return h('div', { class: 'f-block' }, h('span', { class: 'f-label', text: label }), wrap);
  };

  F.stats = function (stats, sopts) {
    sopts = sopts || {};
    var wrap = h('div', { class: 'stats' });
    function paint() {
      wrap.innerHTML = '';
      var keys = Object.keys(stats);
      keys.forEach(function (k) {
        var meta = D.statById[k] || { step: 1 };
        var inp = h('input', { type: 'number', step: meta.step, value: stats[k] });
        inp.addEventListener('input', function () { stats[k] = inp.value === '' ? 0 : Number(inp.value); MM.store.save(); });
        var rm = h('button', { type: 'button', class: 'btn tiny danger', text: 'x', title: T('Remover', 'Remove') });
        rm.addEventListener('click', function () { delete stats[k]; MM.store.save(); paint(); });
        wrap.appendChild(h('div', { class: 'stat-row' }, h('span', { class: 'stat-name', text: MM.L(D.statById[k]) || k }), h('code', { text: k }), inp, rm));
      });
      var sel = h('select');
      sel.appendChild(h('option', { value: '', text: T('Adicionar stat...', 'Add stat...') }));
      D.stats.forEach(function (s) {
        if (stats[s.id] === undefined) sel.appendChild(h('option', { value: s.id, text: MM.L(s) + ' (' + s.id + ')' }));
      });
      sel.addEventListener('change', function () {
        if (!sel.value) return;
        stats[sel.value] = 0;
        MM.store.save();
        paint();
      });
      wrap.appendChild(sel);
      var rnd = h('button', { type: 'button', class: 'btn tiny', text: T('Aleatorizar atributos', 'Randomize stats') });
      rnd.addEventListener('click', function () {
        MM.random.stats(stats, sopts.min || 2, sopts.max || 4, sopts.neg);
        MM.store.save();
        paint();
      });
      wrap.appendChild(h('div', { class: 'btn-row' }, rnd));
    }
    paint();
    return h('div', { class: 'f-block' }, h('span', { class: 'f-label', text: T('Atributos', 'Stats') }), wrap);
  };

  F.actionPick = function (label, S, obj, key, hook) {
    var list = S.actions.filter(function (a) { return a.hook === hook; });
    var options = [{ v: '', l: T('(nenhuma)', '(none)') }].concat(list.map(function (a) { return { v: a.id, l: a.name + ' [' + a.id + ']' }; }));
    var row = F.select(label, obj, key, options);
    if (!list.length) {
      var hk = MM.data.actionHooks.filter(function (x) { return x.id === hook; })[0];
      var box = h('div', { class: 'note' }, h('span', { text: T('Você ainda não criou nenhuma ação deste tipo. As ações ficam na página Ações; escolha ali "Quando dispara" = ', 'You have not made an action of this kind yet. Actions live on the Actions page; pick "Trigger" = ') + (hk ? MM.L(hk) : hook) + '. ' }));
      var mk = h('button', { class: 'btn tiny primary', type: 'button', text: T('Criar essa ação agora', 'Create that action now') });
      mk.addEventListener('click', function () {
        var a = MM.factories.action(S);
        a.hook = hook;
        S.actions.push(a);
        selected.actions = S.actions.length - 1;
        MM.store.save();
        MM.app.go('actions');
      });
      box.appendChild(mk);
      return h('div', null, row, box);
    }
    return row;
  };

  function renameRefs(kind, oldId, newId) {
    var S = MM.store.get();
    if (kind === 'groups') S.traits.forEach(function (t) { if (t.group === oldId) t.group = newId; });
    if (kind === 'actions') {
      S.traits.forEach(function (t) { Object.keys(t.act).forEach(function (k) { if (t.act[k] === oldId) t.act[k] = newId; }); });
      S.items.forEach(function (i) { if (i.actAttack === oldId) i.actAttack = newId; if (i.actSpecial === oldId) i.actSpecial = newId; });
      S.units.forEach(function (u) { if (u.actHit === oldId) u.actHit = newId; });
    }
    if (kind === 'units') {
      S.disasters.forEach(function (d) { if (d.unit === oldId) d.unit = newId; });
      S.buttons.forEach(function (b) { if (b.unit === oldId) b.unit = newId; });
      S.actions.forEach(function (a) { if (a.p && a.p.unit === oldId) a.p.unit = newId; });
    }
    if (kind === 'kingdoms') S.units.forEach(function (u) { if (u.kingdom === oldId) u.kingdom = newId; });
    if (kind === 'projectiles') S.items.forEach(function (i) { if (i.projectile === oldId) i.projectile = newId; });
  }

  function dlistLaw(S, a) {
    var uid = 'dlaw' + Math.floor(Math.random() * 1e6);
    var dl = h('datalist', { id: uid });
    MM.kinds.idsFor(S, ['laws']).forEach(function (i) { dl.appendChild(h('option', { value: i })); });
    var inp = h('input', { type: 'text', list: uid, value: a.needLaw || '', placeholder: T('(sem condição)', '(no condition)') });
    inp.addEventListener('input', function () { a.needLaw = inp.value.trim(); MM.store.save(); });
    return F.row(T('Só roda com esta lei ligada', 'Only runs while this law is on'), h('span', { class: 'dl-wrap' }, inp, dl));
  }

  var selected = {};
  var query = {};

  function listScreen(cfg) {
    var S = MM.store.get();
    var list = S[cfg.key];
    var root = h('div', { class: 'split' });
    var side = h('div', { class: 'list panel' });
    var edit = h('div', { class: 'editor panel' });
    root.appendChild(side);
    root.appendChild(edit);

    if (selected[cfg.key] === undefined || selected[cfg.key] >= list.length) selected[cfg.key] = list.length ? 0 : -1;

    function paintList() {
      side.innerHTML = '';
      var add = h('button', { class: 'btn primary wide', text: '+ ' + cfg.newLabel });
      add.addEventListener('click', function () {
        var item = MM.factories[cfg.factory](S);
        if (cfg.afterCreate) cfg.afterCreate(item, S);
        list.push(item);
        selected[cfg.key] = list.length - 1;
        MM.store.save();
        paintList();
        paintEdit();
      });
      side.appendChild(add);
      if (list.length > 4) {
        var q = h('input', { type: 'text', class: 'search', placeholder: T('Buscar...', 'Search...'), value: query[cfg.key] || '' });
        q.addEventListener('input', function () {
          query[cfg.key] = q.value;
          var pos = q.selectionStart;
          paintList();
          var again = side.querySelector('.search');
          if (again) { again.focus(); again.setSelectionRange(pos, pos); }
        });
        side.appendChild(q);
      }
      if (!list.length) side.appendChild(h('p', { class: 'empty', text: cfg.empty }));
      list.forEach(function (item, i) {
        var needle = (query[cfg.key] || '').toLowerCase();
        if (needle && (cfg.title(item) + ' ' + item.id).toLowerCase().indexOf(needle) < 0) return;
        var card = h('div', { class: 'card' + (i === selected[cfg.key] ? ' sel' : '') });
        card.appendChild(h('div', { class: 'card-main' }, h('strong', { text: cfg.title(item) }), h('small', { text: cfg.sub ? cfg.sub(item) : item.id })));
        function mover(dir, label) {
          var b = h('button', { class: 'btn tiny', type: 'button', text: label });
          b.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var j = i + dir;
            if (j < 0 || j >= list.length) return;
            var t = list[i]; list[i] = list[j]; list[j] = t;
            selected[cfg.key] = j;
            MM.store.save();
            paintList();
          });
          return b;
        }
        var dup = h('button', { class: 'btn tiny', type: 'button', text: T('Duplicar', 'Copy') });
        dup.addEventListener('click', function (ev) {
          ev.stopPropagation();
          var c = JSON.parse(JSON.stringify(item));
          c.id = MM.store.uid(cfg.key, item.id);
          list.splice(i + 1, 0, c);
          selected[cfg.key] = i + 1;
          MM.store.save();
          paintList();
          paintEdit();
        });
        var del = h('button', { class: 'btn tiny danger', type: 'button', text: T('Apagar', 'Delete') });
        del.addEventListener('click', function (ev) {
          ev.stopPropagation();
          MM.confirm(T('Apagar este item?', 'Delete this item?'), function () {
            list.splice(i, 1);
            selected[cfg.key] = Math.min(selected[cfg.key], list.length - 1);
            MM.store.save();
            paintList();
            paintEdit();
          });
        });
        card.appendChild(h('div', { class: 'card-btns' }, mover(-1, '\u2191'), mover(1, '\u2193'), dup, del));
        card.addEventListener('click', function () {
          selected[cfg.key] = i;
          paintList();
          paintEdit();
        });
        side.appendChild(card);
      });
    }

    function paintEdit() {
      edit.innerHTML = '';
      var i = selected[cfg.key];
      if (i < 0 || !list[i]) {
        edit.appendChild(h('p', { class: 'empty', text: cfg.empty }));
        return;
      }
      var item = list[i];
      var idField = F.text('ID', item, 'id', {
        slug: true,
        onchange: function (v, old) {
          if (!v) return;
          renameRefs(cfg.key, old, v);
          var cards = side.querySelectorAll('.card');
          if (cards[i]) {
            cards[i].querySelector('strong').textContent = cfg.title(item);
            cards[i].querySelector('small').textContent = cfg.sub ? cfg.sub(item) : item.id;
          }
        }
      });
      edit.appendChild(h('h2', { text: cfg.heading }));
      edit.appendChild(idField);
      cfg.editor(item, S, function () {
        var cards = side.querySelectorAll('.card');
        if (cards[i]) {
          cards[i].querySelector('strong').textContent = cfg.title(item);
          cards[i].querySelector('small').textContent = cfg.sub ? cfg.sub(item) : item.id;
        }
      }, edit);
    }

    paintList();
    paintEdit();
    return root;
  }

  function hint(text) { return h('p', { class: 'note', text: text }); }

  var screens = {};

  function langPanel() {
    var S = MM.store.get();
    var panel = h('div', { class: 'panel form' });
    panel.appendChild(h('h2', { text: T('Idiomas do jogo', 'Game languages') }));
    panel.appendChild(hint(T('O inglês é obrigatório e sempre incluído. Marque os idiomas em que você quer traduzir os textos do mod; cada campo de texto ganha uma entrada por idioma.', 'English is required and always included. Pick the languages you want to translate the mod texts into; every text field gets one entry per language.')));
    var wrap = h('div', { class: 'chips' });
    function paint() {
      wrap.innerHTML = '';
      D.languages.forEach(function (l) {
        var on = l.id === 'en' || S.locales.indexOf(l.id) >= 0;
        var b = h('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), text: l.name + ' (' + l.id + ')' });
        if (l.id === 'en') b.disabled = true;
        b.addEventListener('click', function () {
          var i = S.locales.indexOf(l.id);
          if (i >= 0) S.locales.splice(i, 1); else S.locales.push(l.id);
          MM.store.save();
          paint();
        });
        wrap.appendChild(b);
      });
    }
    paint();
    panel.appendChild(wrap);
    return panel;
  }

  function openControl() {
    var inp = h('input', { type: 'file', accept: '.zip,.json,application/zip,application/json', class: 'hidden' });
    inp.addEventListener('change', function () {
      var f = inp.files[0];
      inp.value = '';
      if (f) MM.openFile(f);
    });
    var btn = h('button', { class: 'btn', type: 'button', text: T('Abrir mod ou projeto (.zip / .json)', 'Open mod or project (.zip / .json)') });
    btn.addEventListener('click', function () { inp.click(); });
    var wrap = h('span', null, btn, inp);
    return wrap;
  }

  MM.openFile = function (f) {
    var bad = function () { MM.toast(T('Não foi possível ler este arquivo. Use um .zip exportado por este Neo Mod Maker ou um projeto .json.', 'Could not read this file. Use a .zip exported by this Neo Mod Maker or a project .json.')); };
    if (/\.json$/i.test(f.name)) {
      var r = new FileReader();
      r.onload = function () {
        try { MM.store.replace(JSON.parse(r.result)); MM.toast(T('Projeto carregado.', 'Project loaded.')); MM.app.render(); } catch (e) { bad(); }
      };
      r.readAsText(f);
      return;
    }
    f.arrayBuffer().then(function (buf) { return MM.unzip(buf); }).then(function (files) {
      var names = Object.keys(files);
      var projName = names.filter(function (n) { return /(^|\/)\.modmaker\/project\.json$/.test(n); })[0];
      if (!projName) { MM.toast(T('Este .zip não foi exportado pelo Neo Mod Maker (falta .modmaker/project.json).', 'This .zip was not exported by Mod Maker (.modmaker/project.json is missing).')); return; }
      var root = projName.slice(0, projName.length - '.modmaker/project.json'.length);
      var proj = JSON.parse(new TextDecoder().decode(files[projName]));
      MM.store.replace(proj);
      var S = MM.store.get();
      MM.img.readSlots(S, files, root);
      MM.store.save();
      MM.toast(T('Mod carregado para edição.', 'Mod loaded for editing.'));
      MM.app.render();
    }).catch(bad);
  };

  function slotsBox() {
    var box = h('div', { class: 'examples' });
    function paint() {
      box.innerHTML = '';
      var save = h('button', { class: 'btn', type: 'button', text: T('Guardar cópia do projeto', 'Save a project copy') });
      save.addEventListener('click', function () {
        var ok = MM.store.slotSave(MM.store.get().meta.name);
        MM.toast(ok ? T('Cópia guardada neste navegador.', 'Copy saved in this browser.') : T('Sem espaço para guardar a cópia.', 'No room to save the copy.'));
        paint();
      });
      box.appendChild(save);
      MM.store.slotList().forEach(function (sl) {
        var row = h('div', { class: 'btn-row' }, h('strong', { text: sl.name + ' - ' + new Date(sl.time).toLocaleString() }));
        var load = h('button', { class: 'btn tiny', type: 'button', text: T('Carregar', 'Load') });
        load.addEventListener('click', function () {
          MM.confirm(T('Isto substitui o projeto atual. Continuar?', 'This replaces the current project. Continue?'), function () {
            MM.store.slotLoad(sl.id);
            MM.app.render();
          });
        });
        var del = h('button', { class: 'btn tiny danger', type: 'button', text: T('Apagar', 'Delete') });
        del.addEventListener('click', function () {
          MM.store.slotDelete(sl.id);
          paint();
        });
        row.appendChild(load);
        row.appendChild(del);
        box.appendChild(row);
      });
    }
    paint();
    return box;
  }

  screens.mod = function () {
    var S = MM.store.get();
    var root = h('div', { class: 'stack' });
    var panel = h('div', { class: 'panel form' });
    panel.appendChild(h('h2', { text: T('Dados do mod', 'Mod details') }));
    panel.appendChild(h('div', { class: 'btn-row' }, openControl()));
    panel.appendChild(F.text(T('Nome do mod', 'Mod name'), S.meta, 'name'));
    panel.appendChild(F.text(T('ID / namespace (sem espaços)', 'ID / namespace (no spaces)'), S.meta, 'id', { hint: T('Vira o namespace do código e o nome da pasta do .zip.', 'Becomes the code namespace and the .zip folder name.') }));
    panel.appendChild(F.text(T('Autor', 'Author'), S.meta, 'author'));
    panel.appendChild(F.text(T('Versão', 'Version'), S.meta, 'version'));
    panel.appendChild(F.area(T('Descrição', 'Description'), S.meta, 'description'));
    panel.appendChild(F.image(T('Ícone do mod', 'Mod icon'), S.meta, 'img', '200x200'));
    var exBox = h('div', { class: 'examples' });
    MM.examples.forEach(function (ex) {
      var b = h('button', { class: 'btn', type: 'button', text: T('Carregar exemplo: ', 'Load example: ') + MM.L(ex.name) });
      b.addEventListener('click', function () {
        MM.confirm(T('Isto substitui o projeto atual. Continuar?', 'This replaces the current project. Continue?'), function () {
          MM.store.replace(ex.build());
          MM.toast(T('Exemplo carregado.', 'Example loaded.'));
          MM.app.render();
        });
      });
      exBox.appendChild(b);
      exBox.appendChild(h('span', { class: 'f-hint2', text: MM.L(ex.desc) }));
    });
    panel.appendChild(exBox);
    var rnd = h('button', { class: 'btn primary', type: 'button', text: T('Gerar mod 100% aleatório', 'Generate 100% random mod') });
    rnd.addEventListener('click', function () {
      MM.confirm(T('Isto substitui o projeto atual por um mod totalmente aleatório. Continuar?', 'This replaces the current project with a fully random mod. Continue?'), function () {
        MM.store.replace(MM.randomMod(true));
        MM.toast(T('Mod aleatório gerado.', 'Random mod generated.'));
        MM.app.render();
      });
    });
    panel.appendChild(h('div', { class: 'btn-row' }, rnd, h('span', { class: 'f-hint2', text: T('Preenche todas as páginas com conteúdo aleatório. Dá para desfazer com Ctrl+Z.', 'Fills every page with random content. You can undo with Ctrl+Z.') })));
    [['deps', T('Dependências (IDs de mods, separados por vírgula)', 'Dependencies (mod IDs, comma separated)')], ['optional', T('Dependências opcionais', 'Optional dependencies')], ['incompatible', T('Incompatível com', 'Incompatible with')]].forEach(function (d) {
      var wrap = h('label', { class: 'field' }, h('span', { class: 'f-label', text: d[1] }));
      var inp = h('input', { type: 'text', value: (S.meta[d[0]] || []).join(', ') });
      inp.addEventListener('input', function () {
        S.meta[d[0]] = inp.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        MM.store.save();
      });
      wrap.appendChild(inp);
      panel.appendChild(wrap);
    });
    panel.appendChild(slotsBox());
    panel.appendChild(hint(T('O projeto é salvo automaticamente neste navegador. Para editar um mod que você já exportou, use Abrir mod ou projeto e solte o .zip dele.', 'The project is saved automatically in this browser. To edit a mod you already exported, use Open mod or project and drop its .zip.')));
    root.appendChild(panel);
    root.appendChild(langPanel());
    return root;
  };

  function catOptions() {
    return D.traitCats.map(function (c) { return { v: c.id, l: MM.L(c) }; });
  }

  screens.groups = function () {
    return listScreen({
      key: 'groups', factory: 'group', newLabel: T('Novo grupo', 'New group'), heading: T('Grupo de traços', 'Trait group'),
      empty: T('Nenhum grupo ainda. Grupos organizam seus traços nas janelas de traços do jogo.', 'No groups yet. Groups organize your traits in the game trait windows.'),
      title: function (g) { return MM.nm(g.name) || g.id; },
      sub: function (g) { return MM.L(D.traitCatById[g.cat] || D.traitCatById.actor) + ' - ' + g.id; },
      editor: function (g, S, refresh, host) {
        host.appendChild(F.i18n(T('Nome', 'Name'), g, 'name', { onchange: refresh, random: 'group' }));
        host.appendChild(F.select(T('Tipo de traço', 'Trait type'), g, 'cat', catOptions(), refresh));
        host.appendChild(F.color(T('Cor', 'Color'), g, 'color'));
      }
    });
  };

  function groupOptions(S, cat) {
    var vanilla = D.traitGroupsVanilla;
    var out = [{ v: '', l: T('Padrão do jogo: ', 'Game default: ') + (D.traitGroupDefault[cat] || 'miscellaneous') }];
    S.groups.filter(function (g) { return g.cat === cat; }).forEach(function (g) { out.push({ v: g.id, l: MM.nm(g.name) + ' [' + g.id + ']' }); });
    (vanilla[cat] || []).forEach(function (b) { out.push({ v: b, l: T('Do jogo: ', 'Vanilla: ') + b }); });
    return out;
  }

  screens.traits = function () {
    return listScreen({
      key: 'traits', factory: 'trait', newLabel: T('Novo traço', 'New trait'), heading: T('Traço', 'Trait'),
      empty: T('Nenhum traço ainda.', 'No traits yet.'),
      title: function (t) { return MM.nm(t.name) || t.id; },
      sub: function (t) { return MM.L(D.traitCatById[t.cat] || D.traitCatById.actor) + ' - ' + t.id; },
      editor: function (t, S, refresh, host) {
        var dyn = h('div');
        function paintDyn() {
          dyn.innerHTML = '';
          var actor = t.cat === 'actor';
          dyn.appendChild(F.select(T('Grupo', 'Group'), t, 'group', groupOptions(S, t.cat)));
          if (actor) dyn.appendChild(F.select(T('Tipo', 'Type'), t, 'type', F.opts(D.traitTypes)));
          dyn.appendChild(F.select(T('Raridade', 'Rarity'), t, 'rarity', F.opts(D.rarities)));
          dyn.appendChild(F.image(T('Ícone', 'Icon'), t, 'img', '64x64'));
          dyn.appendChild(F.text(T('...ou ícone do jogo', '...or vanilla icon'), t, 'icon', { placeholder: 'ui/Icons/skills/iconSkillDash', hint: T('Usado só se nenhuma imagem for enviada.', 'Used only when no image is uploaded.') }));
          dyn.appendChild(F.stats(t.stats, { neg: true }));
          var peers = S.traits.filter(function (x) { return x.cat === t.cat && x.id !== t.id; }).map(function (x) { return x.id; });
          if (peers.length) dyn.appendChild(F.chips(T('Traços opostos (deste mod)', 'Opposite traits (from this mod)'), t.opposites, peers));
          dyn.appendChild(F.text(T('Opostos do jogo (IDs separados por vírgula)', 'Vanilla opposites (comma-separated IDs)'), { v: (t.opposites || []).filter(function (o) { return peers.indexOf(o) < 0; }).join(', ') }, 'v', {
            onchange: function (val) {
              var keep = (t.opposites || []).filter(function (o) { return peers.indexOf(o) >= 0; });
              var extra = String(val).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
              t.opposites = keep.concat(extra);
            }
          }));
          if (actor) {
            dyn.appendChild(h('h3', { text: T('Chances', 'Rates') }));
            dyn.appendChild(F.number(T('Ao nascer (0 = nunca)', 'At birth (0 = never)'), t, 'rateBirth', { min: 0 }));
            dyn.appendChild(F.number(T('Ao crescer (0 = nunca)', 'On growing up (0 = never)'), t, 'rateGrow', { min: 0 }));
            dyn.appendChild(F.number(T('Herdar dos pais (0 = nunca)', 'Inherit from parents (0 = never)'), t, 'rateInherit', { min: 0 }));
            dyn.appendChild(F.check(T('Pode ser sorteado aleatoriamente', 'Can be randomly assigned'), t, 'randomAllowed'));
            dyn.appendChild(h('h3', { text: T('Ações', 'Actions') }));
            dyn.appendChild(F.actionPick(T('Ao atacar', 'On attack'), S, t.act, 'attack', 'attack'));
            dyn.appendChild(F.actionPick(T('Ao ser atacado', 'When hit'), S, t.act, 'hit', 'hit'));
            dyn.appendChild(F.actionPick(T('Ao morrer', 'On death'), S, t.act, 'death', 'world'));
            dyn.appendChild(F.actionPick(T('Efeito contínuo', 'Continuous effect'), S, t.act, 'special', 'world'));
            dyn.appendChild(F.number(T('Intervalo do efeito contínuo (s)', 'Continuous effect interval (s)'), t, 'interval', { min: 0.1, step: 0.1 }));
            dyn.appendChild(F.actionPick(T('Ao crescer', 'On growing up'), S, t.act, 'growth', 'world'));
            dyn.appendChild(F.actionPick(T('Ao nascer', 'On birth'), S, t.act, 'birth', 'world'));
            if (!S.actions.length) dyn.appendChild(hint(T('Crie ações na aba Ações para escolhê-las aqui.', 'Create actions in the Actions tab to pick them here.')));
          } else {
            dyn.appendChild(hint(T('Traços deste tipo pertencem a um clã, cultura, religião, reino, idioma ou subespécie. Ações de combate só existem em traços de criatura.', 'Traits of this kind belong to a clan, culture, religion, kingdom, language or subspecies. Combat actions only exist on creature traits.')));
          }
        }
        host.appendChild(F.i18n(T('Nome', 'Name'), t, 'name', { onchange: refresh, random: 'trait' }));
        host.appendChild(F.i18n(T('Descrição', 'Description'), t, 'desc', { random: 'desc', cat: 'trait' }));
        host.appendChild(F.select(T('Tipo de traço', 'Trait kind'), t, 'cat', catOptions(), function () { t.group = ''; t.opposites = []; paintDyn(); refresh(); }));
        host.appendChild(dyn);
        paintDyn();
      }
    });
  };

  screens.items = function () {
    return listScreen({
      key: 'items', factory: 'item', newLabel: T('Novo equipamento', 'New equipment'), heading: T('Equipamento', 'Equipment'),
      empty: T('Nenhum equipamento ainda. Cada item é um material novo de espada, arco, armadura etc.', 'No equipment yet. Each item is a new material of sword, bow, armor, etc.'),
      title: function (i) { return MM.nm(i.name) || i.id; },
      sub: function (i) { return MM.gen.itemFullId(MM.store.get(), i); },
      editor: function (it, S, refresh, host) {
        var dyn = h('div');
        var imgSprite = h('div');
        function paintDyn() {
          dyn.innerHTML = '';
          imgSprite.innerHTML = '';
          var tpl = MM.gen.tplOf(it.kind);
          if (tpl.weapon) {
            imgSprite.appendChild(F.image(T('Sprite da arma na mão', 'Weapon sprite in hand'), it, 'imgSprite', ''));
            dyn.appendChild(F.select(T('Animação do golpe', 'Slash animation'), it, 'slash', [{ v: '', l: T('(padrão do tipo)', '(type default)') }].concat(F.opts(D.slashes))));
            dyn.appendChild(F.image(T('...ou desenhe o golpe (animado)', '...or draw the slash (animated)'), it, 'slashImg', '', true));
            if (!tpl.melee) {
              var projs = [{ v: '', l: T('(padrão: flecha)', '(default: arrow)') }].concat(D.vanillaProjectiles.map(function (p) { return { v: p, l: p }; })).concat(S.projectiles.map(function (p) { return { v: p.id, l: p.id + ' *' }; }));
              dyn.appendChild(F.select(T('Projétil', 'Projectile'), it, 'projectile', projs));
            }
            dyn.appendChild(F.actionPick(T('Ao atacar', 'On attack'), S, it, 'actAttack', 'attack'));
          }
          dyn.appendChild(F.actionPick(T('Efeito contínuo', 'Continuous effect'), S, it, 'actSpecial', 'world'));
        }
        host.appendChild(F.i18n(T('Nome', 'Name'), it, 'name', { onchange: refresh, random: function () { return ['item', it.kind]; } }));
        host.appendChild(F.i18n(T('Descrição', 'Description'), it, 'desc', { random: 'desc', cat: 'item' }));
        host.appendChild(F.select(T('Tipo', 'Kind'), it, 'kind', F.opts(D.itemTemplates), function () { paintDyn(); refresh(); }));
        host.appendChild(F.select(T('Raridade base', 'Base rarity'), it, 'quality', F.opts(D.rarities)));
        host.appendChild(F.number(T('Valor do equipamento', 'Equipment value'), it, 'value', { min: 0 }));
        host.appendChild(F.number(T('Durabilidade', 'Durability'), it, 'durability', { min: 1 }));
        host.appendChild(F.number(T('Rigidez', 'Rigidity'), it, 'rigidity', { min: 1 }));
        host.appendChild(F.check(T('Metálico', 'Metallic'), it, 'metallic'));
        host.appendChild(F.number(T('Custo em ouro', 'Gold cost'), it, 'costGold', { min: 0 }));
        host.appendChild(F.select(T('Recurso de custo', 'Cost resource'), it, 'costRes', F.opts(D.costResources)));
        host.appendChild(F.number(T('Quantidade do recurso', 'Resource amount'), it, 'costAmount', { min: 0 }));
        host.appendChild(F.image(T('Ícone do item', 'Item icon'), it, 'imgIcon', '32x32'));
        host.appendChild(imgSprite);
        host.appendChild(F.stats(it.stats));
        host.appendChild(dyn);
        paintDyn();
      }
    });
  };

  screens.actions = function () {
    return listScreen({
      key: 'actions', factory: 'action', newLabel: T('Nova ação', 'New action'), heading: T('Ação', 'Action'),
      empty: T('Nenhuma ação ainda. Ações são efeitos que você liga a traços, equipamentos e criaturas.', 'No actions yet. Actions are effects you attach to traits, equipment and creatures.'),
      title: function (a) { return a.name || a.id; },
      sub: function (a) { return a.id + ' - ' + MM.L(D.actionHooks.filter(function (x) { return x.id === a.hook; })[0]); },
      editor: function (a, S, refresh, host) {
        var dyn = h('div');
        function paintDyn() {
          dyn.innerHTML = '';
          var preset = D.actionPresets.filter(function (x) { return x.id === a.preset; })[0];
          preset.params.forEach(function (p) {
            if (p === 'drop') dyn.appendChild(F.select(T('Efeito', 'Effect'), a.p, 'drop', F.opts(D.drops).concat(S.drops.map(function (x) { return { v: x.id, l: x.id + ' *' }; }))));
            if (p === 'achievement') dyn.appendChild(F.select(T('Conquista', 'Achievement'), a.p, 'achievement', [{ v: '', l: T('(escolha)', '(pick)') }].concat(S.achievements.map(function (x) { return { v: x.id, l: x.id + ' *' }; }))));
            if (p === 'status') dyn.appendChild(F.select('Status', a.p, 'status', F.opts(D.statuses).concat(S.status.map(function (x) { return { v: x.id, l: x.id + ' *' }; }))));
            if (p === 'duration') dyn.appendChild(F.number(T('Duração (s, 0 = padrão)', 'Duration (s, 0 = default)'), a.p, 'duration', { min: 0 }));
            if (p === 'radius') dyn.appendChild(F.number(T('Raio', 'Radius'), a.p, 'radius', { min: 1 }));
            if (p === 'force') dyn.appendChild(F.number(T('Força', 'Force'), a.p, 'force', { step: 0.1 }));
            if (p === 'intensity') dyn.appendChild(F.number(T('Intensidade', 'Intensity'), a.p, 'intensity', { step: 0.5 }));
            if (p === 'unit') {
              var units = [{ v: '', l: T('(escolha)', '(pick)') }].concat(S.units.map(function (u) { return { v: u.id, l: u.id + ' *' }; }));
              dyn.appendChild(F.select(T('Unidade criada por você', 'Your unit'), a.p, 'unit', units));
              dyn.appendChild(F.text(T('...ou ID de unidade do jogo', '...or vanilla unit ID'), a.p, 'unit', { placeholder: 'sheep' }));
            }
            if (p === 'count') dyn.appendChild(F.number(T('Quantidade', 'Amount'), a.p, 'count', { min: 1 }));
          });
        }
        host.appendChild(F.text(T('Nome', 'Name'), a, 'name', { onchange: refresh }));
        host.appendChild(F.select(T('Quando dispara', 'Trigger'), a, 'hook', F.opts(D.actionHooks), function () { }));
        host.appendChild(F.select(T('Efeito', 'Effect type'), a, 'preset', F.opts(D.actionPresets), paintDyn));
        host.appendChild(dlistLaw(S, a));
        host.appendChild(F.number(T('Chance (%)', 'Chance (%)'), a, 'chance', { min: 0, max: 100 }));
        var ints = [{ v: '', l: T('(usar a chance fixa)', '(use the fixed chance)') }].concat(S.settings.filter(function (x) { return x.type === 'INT_SLIDER'; }).map(function (x) { return { v: x.id, l: MM.nm(x.name) + ' [' + x.id + ']' }; }));
        host.appendChild(F.select(T('Chance vinda de uma configuração', 'Chance from a setting'), a, 'chanceSetting', ints));
        host.appendChild(dyn);
        host.appendChild(hint(T('Ao atacar e Ao ser atacado só podem ser ligadas a slots do mesmo tipo. Evento serve para morte, nascimento, crescimento e efeito contínuo.', 'On attack and When hit only attach to slots of the same kind. Event is for death, birth, growing up and continuous effects.')));
        paintDyn();
      }
    });
  };

  screens.projectiles = function () {
    return listScreen({
      key: 'projectiles', factory: 'projectile', newLabel: T('Novo projétil', 'New projectile'), heading: T('Projétil', 'Projectile'),
      empty: T('Nenhum projétil ainda.', 'No projectiles yet.'),
      title: function (p) { return p.id; },
      sub: function (p) { return 'speed ' + p.speed; },
      editor: function (p, S, refresh, host) {
        host.appendChild(F.image(T('Imagem', 'Image'), p, 'img', '', true));
        host.appendChild(F.text(T('...ou textura de projétil do jogo', '...or vanilla projectile texture'), p, 'texture', { placeholder: 'fireball' }));
        host.appendChild(F.number(T('Velocidade', 'Speed'), p, 'speed', { min: 1 }));
        host.appendChild(F.check(T('Animado', 'Animated'), p, 'animated'));
        host.appendChild(F.check(T('Olhar para o alvo', 'Look at target'), p, 'lookAtTarget'));
        host.appendChild(F.number(T('Escala inicial', 'Start scale'), p, 'scaleStart', { step: 0.05 }));
        host.appendChild(F.number(T('Escala final', 'End scale'), p, 'scaleTarget', { step: 0.05 }));
        host.appendChild(F.check(T('Rastro', 'Trail'), p, 'trail'));
        host.appendChild(F.text(T('Efeito do rastro', 'Trail effect'), p, 'trailEffect'));
        host.appendChild(F.text(T('Efeito ao acertar', 'End effect'), p, 'endEffect', { placeholder: 'fx_explosion_small' }));
        host.appendChild(F.text(T('Opção de terraform', 'Terraform option'), p, 'terraform', { placeholder: 'demon_fireball' }));
        host.appendChild(F.number(T('Alcance do terraform', 'Terraform range'), p, 'terraformRange', { min: 0 }));
        host.appendChild(F.check(T('Tremer ao acertar', 'Shake on hit'), p, 'hitShake'));
        host.appendChild(F.check(T('Congelar ao acertar', 'Freeze on hit'), p, 'hitFreeze'));
        host.appendChild(F.text(T('Som de disparo', 'Launch sound'), p, 'soundLaunch', { placeholder: 'event:/SFX/WEAPONS/WeaponStartArrow' }));
        host.appendChild(F.text(T('Som de impacto', 'Impact sound'), p, 'soundImpact', { placeholder: 'event:/SFX/HIT/HitGeneric' }));
      }
    });
  };

  screens.kingdoms = function () {
    return listScreen({
      key: 'kingdoms', factory: 'kingdom', newLabel: T('Novo reino', 'New kingdom'), heading: T('Reino de criaturas', 'Creature kingdom'),
      empty: T('Nenhum reino ainda. Reinos definem quem é amigo ou inimigo de quem.', 'No kingdoms yet. Kingdoms define who is friend or foe.'),
      title: function (k) { return k.id; },
      sub: function (k) { return k.template; },
      editor: function (k, S, refresh, host) {
        host.appendChild(F.select(T('Base', 'Template'), k, 'template', F.opts(D.kingdomTemplates)));
        host.appendChild(F.image(T('Ícone', 'Icon'), k, 'img', '32x32'));
        host.appendChild(F.text(T('...ou ícone do jogo', '...or vanilla icon'), k, 'icon', { placeholder: 'ui/Icons/iconWolf' }));
        host.appendChild(F.color(T('Cor', 'Color'), k, 'color'));
        var custom = S.kingdoms.map(function (x) { return x.id; });
        var tags = D.kingdomTags.concat(custom.filter(function (x) { return D.kingdomTags.indexOf(x) < 0; }));
        host.appendChild(F.chips(T('Etiquetas deste reino', 'Tags of this kingdom'), k.tags, tags));
        host.appendChild(F.chips(T('Etiquetas amigas', 'Friendly tags'), k.friendly, tags));
        host.appendChild(F.chips(T('Etiquetas inimigas', 'Enemy tags'), k.enemy, tags));
      }
    });
  };

  screens.units = function () {
    return listScreen({
      key: 'units', factory: 'unit', newLabel: T('Nova criatura', 'New creature'), heading: T('Criatura', 'Creature'),
      empty: T('Nenhuma criatura ainda.', 'No creatures yet.'),
      title: function (u) { return MM.nm(u.name) || u.id; },
      editor: function (u, S, refresh, host) {
        host.appendChild(F.i18n(T('Nome', 'Name'), u, 'name', { onchange: refresh, random: 'creature' }));
        host.appendChild(F.select(T('Base', 'Template'), u, 'template', F.opts(D.unitTemplates)));
        var kopts = [{ v: '', l: T('(padrão da base)', '(template default)') }].concat(S.kingdoms.map(function (k) { return { v: k.id, l: k.id + ' *' }; }));
        host.appendChild(F.select(T('Reino selvagem', 'Wild kingdom'), u, 'kingdom', kopts));
        host.appendChild(F.text(T('...ou ID de reino do jogo', '...or vanilla kingdom ID'), u, 'kingdom', { placeholder: 'wolf' }));
        host.appendChild(F.select(T('Tamanho', 'Size'), u, 'size', F.opts(D.actorSizes)));
        host.appendChild(F.color(T('Cor', 'Color'), u, 'color'));
        host.appendChild(F.image(T('Ícone', 'Icon'), u, 'img', '32x32'));
        host.appendChild(F.text(T('...ou ícone do jogo', '...or vanilla icon'), u, 'icon', { placeholder: 'iconWolf' }));
        host.appendChild(F.image(T('Corpo andando (animado)', 'Walking body (animated)'), u, 'body', '', true));
        host.appendChild(F.image(T('Corpo nadando (opcional, animado)', 'Swimming body (optional, animated)'), u, 'bodySwim', '', true));
        host.appendChild(F.text(T('...ou aparência de criatura do jogo', '...or look of a vanilla creature'), u, 'look', { placeholder: 'wolf' }));
        host.appendChild(F.check(T('Sem forma de filhote', 'No baby form'), u, 'noBaby'));
        host.appendChild(F.text(T('Traços (IDs separados por vírgula)', 'Traits (comma-separated IDs)'), u, 'traits'));
        if (!u.spells) u.spells = [];
        host.appendChild(MM.kinds.idChips(S, ['spells'], T('Magias', 'Spells'), u.spells));
        host.appendChild(F.stats(u.stats, { neg: false }));
        host.appendChild(F.actionPick(T('Ao ser atacado', 'When hit'), S, u, 'actHit', 'hit'));
        host.appendChild(hint(T('Criaturas simples a partir dos modelos do jogo: sem cidades, reino próprio nem cultura. Para um povo completo, use a aba Civilizações.', 'Simple creatures built from the game templates: no cities, own kingdom or culture. For a full people, use the Civilizations tab.')));
      }
    });
  };

  screens.disasters = function () {
    return listScreen({
      key: 'disasters', factory: 'disaster', newLabel: T('Novo desastre', 'New disaster'), heading: T('Desastre / invasão', 'Disaster / invasion'),
      empty: T('Nenhum desastre ainda.', 'No disasters yet.'),
      title: function (d) { return MM.nm(d.name) || d.id; },
      editor: function (d, S, refresh, host) {
        host.appendChild(F.i18n(T('Nome', 'Name'), d, 'name', { onchange: refresh, random: 'disaster' }));
        host.appendChild(F.i18n(T('Mensagem no log', 'World log message'), d, 'log'));
        var uopts = [{ v: '', l: T('(escolha)', '(pick)') }].concat(S.units.map(function (u) { return { v: u.id, l: u.id + ' *' }; }));
        host.appendChild(F.select(T('Unidade que aparece', 'Spawned unit'), d, 'unit', uopts));
        host.appendChild(F.text(T('...ou ID de unidade do jogo', '...or vanilla unit ID'), d, 'unit', { placeholder: 'bandit' }));
        host.appendChild(F.select(T('Tipo', 'Type'), d, 'type', F.opts(D.disasterTypes)));
        host.appendChild(F.number(T('Taxa', 'Rate'), d, 'rate', { min: 1 }));
        host.appendChild(F.number(T('Chance (0 a 1)', 'Chance (0 to 1)'), d, 'chance', { min: 0, max: 1, step: 0.05 }));
        host.appendChild(F.number(T('População mínima do mundo', 'Min world population'), d, 'minPop', { min: 0 }));
        host.appendChild(F.number(T('Cidades mínimas do mundo', 'Min world cities'), d, 'minCities', { min: 0 }));
        host.appendChild(F.number(T('Máximo de unidades existentes', 'Max existing units'), d, 'maxExisting', { min: 1 }));
        host.appendChild(F.number(T('Unidades (mín.)', 'Units (min)'), d, 'unitsMin', { min: 1 }));
        host.appendChild(F.number(T('Unidades (máx.)', 'Units (max)'), d, 'unitsMax', { min: 1 }));
        host.appendChild(F.check(T('Somente premium', 'Premium only'), d, 'premium'));
        host.appendChild(F.chips(T('Eras permitidas', 'Allowed ages'), d.allow, D.ages.concat(S.ages.map(function (x) { return x.id; }))));
        host.appendChild(F.chips(T('Eras proibidas', 'Forbidden ages'), d.forbid, D.ages.concat(S.ages.map(function (x) { return x.id; }))));
      }
    });
  };

  screens.tab = function () {
    var S = MM.store.get();
    var root = h('div', { class: 'stack' });
    var tabPanel = h('div', { class: 'panel form' });
    tabPanel.appendChild(h('h2', { text: T('Aba do mod', 'Mod tab') }));
    tabPanel.appendChild(F.text(T('ID da aba', 'Tab ID'), S.tab, 'id', { slug: true }));
    tabPanel.appendChild(F.i18n(T('Nome', 'Name'), S.tab, 'name', { random: 'mod' }));
    tabPanel.appendChild(F.i18n(T('Descrição', 'Description'), S.tab, 'desc'));
    tabPanel.appendChild(F.image(T('Ícone da aba', 'Tab icon'), S.tab, 'img', '66x22'));
    tabPanel.appendChild(hint(T('A aba aparece no jogo quando existir ao menos um botão.', 'The tab appears in game when at least one button exists.')));
    root.appendChild(tabPanel);
    var btns = listScreen({
      key: 'buttons', factory: 'button', newLabel: T('Novo botão', 'New button'), heading: T('Botão de poder (criar criatura)', 'Power button (spawn creature)'),
      empty: T('Nenhum botão ainda.', 'No buttons yet.'),
      title: function (b) { return MM.nm(b.name) || b.id; },
      editor: function (b, S2, refresh, host) {
        host.appendChild(F.i18n(T('Nome', 'Name'), b, 'name', { onchange: refresh, random: 'button' }));
        host.appendChild(F.i18n(T('Descrição', 'Description'), b, 'desc', { random: 'desc' }));
        var uopts = [{ v: '', l: T('(escolha)', '(pick)') }].concat(S2.units.map(function (u) { return { v: u.id, l: u.id + ' *' }; }));
        host.appendChild(F.select(T('Criatura criada', 'Spawned creature'), b, 'unit', uopts));
        host.appendChild(F.text(T('...ou ID de unidade do jogo', '...or vanilla unit ID'), b, 'unit', { placeholder: 'sheep' }));
        host.appendChild(F.select(T('Nível do poder', 'Power rank'), b, 'rank', F.opts(D.powerRanks)));
        host.appendChild(F.image(T('Ícone', 'Icon'), b, 'img', '64x64'));
      }
    });
    root.appendChild(btns);
    return root;
  };

  screens.export = function () {
    var S = MM.store.get();
    var root = h('div', { class: 'stack' });
    var panel = h('div', { class: 'panel form' });
    panel.appendChild(h('h2', { text: T('Exportar', 'Export') }));
    var gaps = MM.check.run(S);
    var warns = MM.gen.validate(S).filter(function (e) { return /ok se for do jogo/.test(e); });
    if (gaps.length) {
      var ul = h('ul', { class: 'errs gaps' });
      gaps.forEach(function (g) {
        var li = h('li', null, h('span', { text: MM.check.label(g) }));
        var pg = MM.check.pageOf(g);
        if (pg) {
          var go = h('button', { type: 'button', class: 'btn tiny', text: T('Abrir', 'Open') });
          go.addEventListener('click', function () {
            if (g.key && g.idx >= 0) selected[g.key] = g.idx;
            MM.app.go(pg);
          });
          li.appendChild(go);
        }
        ul.appendChild(li);
      });
      panel.appendChild(h('p', { class: 'note warn', text: T('Preencha estes campos para poder baixar o mod:', 'Fill in these fields to be able to download the mod:') }));
      panel.appendChild(ul);
    }
    if (warns.length) {
      var wl = h('ul', { class: 'errs' });
      warns.forEach(function (e) { wl.appendChild(h('li', { text: e })); });
      panel.appendChild(h('p', { class: 'note', text: T('Avisos (não impedem o download):', 'Warnings (do not block the download):') }));
      panel.appendChild(wl);
    }
    var row = h('div', { class: 'btn-row' });
    var zipBtn = h('button', { class: 'btn primary', type: 'button', text: T('Baixar mod (.zip)', 'Download mod (.zip)') });
    if (gaps.length) {
      zipBtn.disabled = true;
      zipBtn.title = T('Preencha os campos da lista acima.', 'Fill in the fields listed above.');
    }
    zipBtn.addEventListener('click', function () {
      if (MM.check.run(MM.store.get()).length) { MM.toast(T('Preencha os campos da lista acima.', 'Fill in the fields listed above.')); return; }
      var files = MM.gen.build(S);
      var folder = MM.ident(S.meta.id);
      var out = {};
      Object.keys(files).forEach(function (k) { out[folder + '/' + k] = files[k]; });
      out[folder + '/.modmaker/project.json'] = MM.store.exportJson(false);
      MM.img.writeSlots(S, out, folder);
      if (!S.meta.img) out[folder + '/icon.png'] = MM.img.bytes(placeholderIcon());
      MM.download(folder + '.zip', MM.zip.build(out));
    });
    var saveBtn = h('button', { class: 'btn', type: 'button', text: T('Salvar projeto (.json)', 'Save project (.json)') });
    saveBtn.addEventListener('click', function () {
      MM.download(MM.ident(S.meta.id) + '.modmaker.json', new Blob([MM.store.exportJson(true)], { type: 'application/json' }));
    });
    var resetBtn = h('button', { class: 'btn danger', type: 'button', text: T('Novo projeto vazio', 'New empty project') });
    resetBtn.addEventListener('click', function () {
      MM.confirm(T('Apagar tudo e começar do zero?', 'Erase everything and start over?'), function () {
        MM.store.reset();
        MM.app.render();
      });
    });
    row.appendChild(zipBtn);
    row.appendChild(saveBtn);
    row.appendChild(openControl());
    row.appendChild(resetBtn);
    panel.appendChild(row);
    panel.appendChild(hint(T('Descompacte a pasta do .zip em Mods dentro da pasta do WorldBox (o NML compila o código ao abrir o jogo). As imagens que faltam estão em SPRITES.txt e vão em GameResources. O .zip guarda o projeto dentro dele, então você pode reabri-lo aqui para editar valores.', 'Unzip the folder into the WorldBox Mods folder (NML compiles the code when the game starts). Missing images are listed in SPRITES.txt and go in GameResources. The .zip carries the project inside, so you can reopen it here to edit values.')));
    root.appendChild(panel);

    var files = MM.gen.build(S);
    var names = Object.keys(files);
    var prev = h('div', { class: 'panel' });
    var sel = h('select');
    names.forEach(function (n) { sel.appendChild(h('option', { value: n, text: n })); });
    var pre = h('pre', { class: 'code' });
    function show() { pre.textContent = files[sel.value] || ''; }
    sel.addEventListener('change', show);
    prev.appendChild(h('h3', { text: T('Prévia dos arquivos', 'File preview') }));
    prev.appendChild(sel);
    prev.appendChild(pre);
    show();
    root.appendChild(prev);
    return root;
  };

  function placeholderIcon() {
    var c = document.createElement('canvas');
    c.width = 200;
    c.height = 200;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, '#281e60');
    g.addColorStop(1, '#0a1034');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#cdbfff';
    ctx.fillRect(120, 40, 40, 40);
    return c.toDataURL('image/png');
  }

  screens.settings = function () {
    var S = MM.store.get();
    var root = h('div', { class: 'stack' });
    var gp = h('div', { class: 'panel form' });
    gp.appendChild(h('h2', { text: T('Grupos de configurações', 'Settings groups') }));
    gp.appendChild(hint(T('As configurações aparecem na janela de configuração do NML do seu mod. Elas também podem controlar a chance das ações.', 'Settings appear in the NML configuration window of your mod. They can also drive action chances.')));
    var listBox = h('div', { class: 'stack-s' });
    function paintGroups() {
      listBox.innerHTML = '';
      S.settingGroups.forEach(function (g, i) {
        var row = h('div', { class: 'row-line' });
        row.appendChild(F.text('ID', g, 'id', { slug: true, onchange: function (v, old) { S.settings.forEach(function (st) { if (st.group === old) st.group = v; }); } }));
        row.appendChild(F.i18n(T('Nome', 'Name'), g, 'name'));
        var del = h('button', { type: 'button', class: 'btn tiny danger', text: T('Apagar', 'Delete') });
        del.addEventListener('click', function () {
          if (S.settingGroups.length < 2) { MM.toast(T('Mantenha ao menos um grupo.', 'Keep at least one group.')); return; }
          var fallback = S.settingGroups[i === 0 ? 1 : 0].id;
          S.settings.forEach(function (st) { if (st.group === g.id) st.group = fallback; });
          S.settingGroups.splice(i, 1);
          MM.store.save();
          paintGroups();
        });
        row.appendChild(del);
        listBox.appendChild(row);
      });
      var add = h('button', { type: 'button', class: 'btn', text: '+ ' + T('Novo grupo', 'New group') });
      add.addEventListener('click', function () { S.settingGroups.push(MM.factories.settingGroup()); MM.store.save(); paintGroups(); });
      listBox.appendChild(add);
    }
    paintGroups();
    gp.appendChild(listBox);
    root.appendChild(gp);
    root.appendChild(listScreen({
      key: 'settings', factory: 'setting', newLabel: T('Nova configuração', 'New setting'), heading: T('Configuração', 'Setting'),
      empty: T('Nenhuma configuração ainda.', 'No settings yet.'),
      title: function (x) { return MM.nm(x.name) || x.id; },
      sub: function (x) { return x.type + ' - ' + x.id; },
      editor: function (x, S2, refresh, host) {
        var dyn = h('div');
        function paintDyn() {
          dyn.innerHTML = '';
          if (x.type === 'SWITCH') dyn.appendChild(F.check(T('Ligado por padrão', 'On by default'), x, 'bool'));
          if (x.type === 'INT_SLIDER') {
            dyn.appendChild(F.number(T('Valor padrão', 'Default value'), x, 'int'));
            dyn.appendChild(F.number(T('Mínimo', 'Minimum'), x, 'imin'));
            dyn.appendChild(F.number(T('Máximo', 'Maximum'), x, 'imax'));
          }
          if (x.type === 'SLIDER') {
            dyn.appendChild(F.number(T('Valor padrão', 'Default value'), x, 'float', { step: 0.1 }));
            dyn.appendChild(F.number(T('Mínimo', 'Minimum'), x, 'fmin', { step: 0.1 }));
            dyn.appendChild(F.number(T('Máximo', 'Maximum'), x, 'fmax', { step: 0.1 }));
          }
          if (x.type === 'TEXT') dyn.appendChild(F.text(T('Texto padrão', 'Default text'), x, 'text'));
        }
        host.appendChild(F.i18n(T('Nome', 'Name'), x, 'name', { onchange: refresh, random: 'setting' }));
        host.appendChild(F.i18n(T('Descrição', 'Description'), x, 'desc', { random: 'desc' }));
        host.appendChild(F.select(T('Grupo', 'Group'), x, 'group', S2.settingGroups.map(function (g) { return { v: g.id, l: MM.nm(g.name) + ' [' + g.id + ']' }; })));
        host.appendChild(F.select(T('Tipo', 'Type'), x, 'type', F.opts(D.settingTypes), function () { paintDyn(); refresh(); }));
        host.appendChild(dyn);
        host.appendChild(hint(T('No código, o valor fica em ModSettings.', 'In code, the value lives in ModSettings.') + ' ' + MM.pascal(x.id)));
        paintDyn();
      }
    }));
    return root;
  };

  var order = [
    { id: 'mod', pt: 'Mod', en: 'Mod', group: 'main' },
    { id: 'traits', pt: 'Traços', en: 'Traits', group: 'creatures' },
    { id: 'groups', pt: 'Grupos de traços', en: 'Trait groups', group: 'creatures' },
    { id: 'units', pt: 'Criaturas', en: 'Creatures', group: 'creatures' },
    { id: 'kingdoms', pt: 'Reinos', en: 'Kingdoms', group: 'creatures' },
    { id: 'items', pt: 'Equipamentos', en: 'Equipment', group: 'creatures' },
    { id: 'actions', pt: 'Ações', en: 'Actions', group: 'logic' },
    { id: 'projectiles', pt: 'Projéteis', en: 'Projectiles', group: 'logic' },
    { id: 'disasters', pt: 'Desastres', en: 'Disasters', group: 'world' },
    { id: 'tab', pt: 'Aba e botões', en: 'Tab and buttons', group: 'interface' },
    { id: 'settings', pt: 'Configurações', en: 'Settings', group: 'interface' },
    { id: 'forum', pt: 'Fórum', en: 'Forum', group: 'advanced' },
    { id: 'export', pt: 'Exportar', en: 'Export', group: 'export' },
    { id: 'credits', pt: 'Créditos', en: 'Credits', group: 'export' }
  ];

  var groupOrder = [
    { id: 'main', pt: '', en: '' },
    { id: 'creatures', pt: 'Criaturas', en: 'Creatures' },
    { id: 'logic', pt: 'Lógica', en: 'Logic' },
    { id: 'world', pt: 'Mundo', en: 'World' },
    { id: 'interface', pt: 'Interface', en: 'Interface' },
    { id: 'advanced', pt: 'Avançado', en: 'Advanced' },
    { id: 'export', pt: '', en: '' }
  ];

  function sortOrder() {
    var idx = {};
    groupOrder.forEach(function (g, i) { idx[g.id] = i; });
    var tagged = order.map(function (o, i) { return { o: o, i: i }; });
    tagged.sort(function (a, b) {
      var d = idx[a.o.group] - idx[b.o.group];
      return d || a.i - b.i;
    });
    var out = tagged.map(function (x) { return x.o; });
    order.length = 0;
    out.forEach(function (x) { order.push(x); });
  }

  screens.credits = function () {
    var root = h('div', { class: 'stack' });
    var panel = h('div', { class: 'panel credits' });
    panel.appendChild(h('h2', { text: T('Créditos', 'Credits') }));
    panel.appendChild(h('h3', { class: 'credit-title', text: 'Neo Mod Maker' }));
    panel.appendChild(h('p', { text: T('Criador de mods para WorldBox (NML) que roda direto no navegador, sem instalar nada.', 'WorldBox (NML) mod creator that runs right in the browser, with nothing to install.') }));
    function person(name, role, lines) {
      var box = h('div', { class: 'credit-box' }, h('strong', { class: 'credit-name', text: name }), h('span', { class: 'credit-role', text: role }));
      lines.forEach(function (l) { box.appendChild(h('p', { text: l })); });
      return box;
    }
    panel.appendChild(person('Agriche (AgricheX)', T('Dona e Fundadora do projeto', 'Owner and Founder of the project'), [
      T('Ideia original do Neo Mod Maker e direção de todas as decisões do projeto.', 'Original idea of Neo Mod Maker and direction of every decision of the project.'),
      T('Referência dos principais códigos usados aqui: a base do ModMaker e dos mods originais serviu de modelo para o que este site gera.', 'Reference for the main code used here: the base of ModMaker and of the original mods served as the model for what this site generates.')
    ]));
    panel.appendChild(person('Claude (Anthropic)', T('Co-criador', 'Co-creator'), [
      T('Atualização e melhoria dos códigos originais e construção das páginas, dos geradores de C# e das ferramentas deste site, em parceria com a fundadora (Claude Sonnet 5.5 e Claude Opus 5.5).', 'Updating and improving the original code and building the pages, the C# generators and the tools of this site, in partnership with the founder (Claude Sonnet 5.5 and Claude Opus 5.5).')
    ]));
    panel.appendChild(h('h3', { text: T('Agradecimentos', 'Thanks') }));
    panel.appendChild(person('Loctusz Ofc', T('Artista dos sprites', 'Sprite artist'), [
      T('Agradecimento ao Loctusz Ofc por todo o trabalho com os sprites: ele fez a maior parte da arte dos mods originais, que agora está na biblioteca de sprites deste site.', 'Thanks to Loctusz Ofc for all his work on the sprites: he made most of the art of the original mods, which is now in the sprite library of this site.')
    ]));
    panel.appendChild(h('p', { text: T('Obrigado também a todas as outras pessoas que fizeram arte para os mods originais. Sem vocês, a biblioteca não existiria.', 'Thanks also to everyone else who made art for the original mods. Without you, the library would not exist.') }));
    panel.appendChild(h('p', { text: T('Os sprites da biblioteca são livres: use nos seus mods, de graça. Os marcados como feitos para o Neo Mod Maker foram criados por Claude com base no estilo deles.', 'The library sprites are free: use them in your mods at no cost. The ones marked as made for Neo Mod Maker were created by Claude based on their style.') }));
    panel.appendChild(h('p', { text: T('Os visuais do site homenageiam os mods originais: Mod Maker 1 e 2, Monster Mod, FlagBox, Invasions, Nomes Brasileiros, One Piece, Magic Races, Naval Battles e Isekai.', 'The site themes pay tribute to the original mods: Mod Maker 1 and 2, Monster Mod, FlagBox, Invasions, Nomes Brasileiros, One Piece, Magic Races, Naval Battles and Isekai.') }));
    panel.appendChild(h('h3', { text: T('Apoiadores oficiais', 'Official supporters') }));
    panel.appendChild(h('p', { text: T('Pessoas que apoiam o Neo Mod Maker. Obrigado por acreditarem no projeto.', 'People who support Neo Mod Maker. Thank you for believing in the project.') }));
    var sup = h('ul', { class: 'supporters' });
    (MM.supporters || []).forEach(function (n) { sup.appendChild(h('li', { text: n })); });
    panel.appendChild(sup);
    var free = h('div', { class: 'credit-box credit-free' }, h('strong', { class: 'credit-name', text: T('Projeto 100% gratuito', '100% free project') }));
    free.appendChild(h('p', { text: T('O Neo Mod Maker é totalmente gratuito, feito de fã para fã. Se alguém ou algum site pedir dinheiro para usá-lo, é golpe: não pague e não passe seus dados.', 'Neo Mod Maker is completely free, made by fans for fans. If anyone or any website asks for money to use it, it is a scam: do not pay and do not share your details.') }));
    panel.appendChild(free);
    panel.appendChild(h('h3', { text: T('Ferramentas e fontes', 'Tools and fonts') }));
    var ul = h('ul', { class: 'credit-list' });
    [
      T('NML (Neo Mod Loader): carrega os mods gerados no WorldBox.', 'NML (Neo Mod Loader): loads the generated mods into WorldBox.'),
      T('WorldBox é de seus criadores. Este projeto é de fãs e não tem ligação oficial com o jogo.', 'WorldBox belongs to its creators. This is a fan project with no official link to the game.'),
      T('Fontes: Atkinson Hyperlegible, IBM Plex Mono e Pixelify Sans, via Google Fonts.', 'Fonts: Atkinson Hyperlegible, IBM Plex Mono and Pixelify Sans, via Google Fonts.')
    ].forEach(function (t) { ul.appendChild(h('li', { text: t })); });
    panel.appendChild(ul);
    var help = h('div', { class: 'credit-box credit-free' }, h('strong', { class: 'credit-name', text: T('Bugs, dúvidas e sugestões', 'Bugs, questions and suggestions') }));
    help.appendChild(h('p', { text: T('Para reportar qualquer bug, tirar dúvidas ou falar com a gente, entre no nosso Discord.', 'To report any bug, ask questions or talk to us, join our Discord.') }));
    help.appendChild(h('p', {}, h('a', { href: 'https://discord.gg/s3EbgNSsJW', target: '_blank', rel: 'noopener noreferrer', text: 'discord.gg/s3EbgNSsJW' })));
    panel.appendChild(help);
    root.appendChild(panel);
    return root;
  };

  screens.forum = function () { return MM.forum.screen(); };

  var counts = { settings: 'settings', groups: 'groups', traits: 'traits', items: 'items', actions: 'actions', projectiles: 'projectiles', kingdoms: 'kingdoms', units: 'units', disasters: 'disasters', tab: 'buttons' };

  var speciesTab = 'solo';
  try { speciesTab = localStorage.getItem('mm_sptab') === 'civ' ? 'civ' : 'solo'; } catch (e) {}

  function setSpeciesTab(t) {
    speciesTab = t === 'civ' ? 'civ' : 'solo';
    try { localStorage.setItem('mm_sptab', speciesTab); } catch (e) {}
  }

  function combineSpecies() {
    var solo = screens.units;
    var civ = screens.species;
    if (!solo || !civ || solo._combined) return;
    var ui = order.filter(function (o) { return o.id === 'units'; })[0];
    var at = order.indexOf(ui);
    for (var i = order.length - 1; i >= 0; i--) if (order[i].id === 'species') order.splice(i, 1);
    at = order.indexOf(ui);
    order[at] = { id: 'species', pt: 'Espécies', en: 'Species', group: 'creatures' };
    delete counts.units;
    counts.species = function (S) { return (S.species ? S.species.length : 0) + (S.units ? S.units.length : 0); };
    screens.species = function () {
      var root = h('div', { class: 'stack' });
      var bar = h('div', { class: 'subtabs', role: 'tablist' });
      var body = h('div', { class: 'stack' });
      function paint() {
        body.innerHTML = '';
        body.appendChild(speciesTab === 'civ' ? civ() : solo());
        Array.prototype.forEach.call(bar.children, function (b) { b.classList.toggle('on', b.getAttribute('data-t') === speciesTab); });
      }
      [['solo', T('Criaturas', 'Creatures'), (MM.store.get().units || []).length], ['civ', T('Civilizações', 'Civilizations'), (MM.store.get().species || []).length]].forEach(function (d) {
        var b = h('button', { type: 'button', class: 'subtab', role: 'tab', 'data-t': d[0] }, h('span', { text: d[1] }));
        if (d[2]) b.appendChild(h('span', { class: 'count', text: String(d[2]) }));
        b.addEventListener('click', function () {
          if (speciesTab === d[0]) return;
          setSpeciesTab(d[0]);
          MM.app.render();
        });
        bar.appendChild(b);
      });
      root.appendChild(bar);
      root.appendChild(body);
      paint();
      return root;
    };
    screens.species._combined = true;
    solo._combined = true;
  }

  return { screens: screens, order: order, groups: groupOrder, sortOrder: sortOrder, counts: counts, T: T, F: F, listScreen: listScreen, hint: hint, combineSpecies: combineSpecies, setSpeciesTab: setSpeciesTab };
})();
