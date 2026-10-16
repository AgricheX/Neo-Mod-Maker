MM.kinds = (function () {
  var h = MM.h;
  var defs = [];
  var byKey = {};
  var seq = 0;

  function T(pt, en) { return MM.tr(pt, en); }
  function lab(l) { return MM.tr(l[0], l[1]); }

  function customIds(S, name) {
    var arr = S[name];
    if (!Array.isArray(arr)) return [];
    return arr.map(function (x) { return x.id; }).filter(Boolean);
  }

  function idsFor(S, names) {
    var out = [];
    names.forEach(function (n) {
      customIds(S, n).forEach(function (i) { if (out.indexOf(i) < 0) out.push(i); });
    });
    names.forEach(function (n) {
      ((MM.vanilla && MM.vanilla[n]) || []).forEach(function (i) { if (out.indexOf(i) < 0) out.push(i); });
    });
    return out;
  }

  function add(def) {
    defs.push(def);
    byKey[def.key] = def;
    MM.factories[def.key] = function () { return factory(def); };
  }

  function factory(def) {
    var e = { id: MM.store.uid(def.key, def.base || def.key) };
    def.fields.forEach(function (f) {
      if (f.t === 'h' || f.t === 'note') return;
      var d = f.d;
      if (f.t === 'tx') e[f.k] = { en: d || '' };
      else if (f.t === 'ids' || f.t === 'pick') e[f.k] = d ? d.slice() : [];
      else if (f.t === 'stats') e[f.k] = {};
      else if (f.t === 'bool') e[f.k] = !!d;
      else if (f.t === 'num') e[f.k] = d === undefined ? 0 : d;
      else e[f.k] = d === undefined ? '' : d;
    });
    return e;
  }

  function dlist(S, names, label, obj, key, ph) {
    var uid = 'dl' + (++seq);
    var dl = h('datalist', { id: uid });
    idsFor(S, names).forEach(function (i) { dl.appendChild(h('option', { value: i })); });
    var inp = h('input', { type: 'text', list: uid, value: obj[key] || '', placeholder: ph || '' });
    inp.addEventListener('input', function () { obj[key] = inp.value.trim(); MM.store.save(); });
    return MM.ui.F.row(label, h('span', { class: 'dl-wrap' }, inp, dl));
  }

  function idChips(S, names, label, arr) {
    var F = MM.ui.F;
    var uid = 'dl' + (++seq);
    var dl = h('datalist', { id: uid });
    idsFor(S, names).forEach(function (i) { dl.appendChild(h('option', { value: i })); });
    var chips = h('div', { class: 'chips' });
    var inp = h('input', { type: 'text', list: uid, placeholder: T('Escolha ou digite um ID', 'Pick or type an ID') });
    var addBtn = h('button', { type: 'button', class: 'btn tiny', text: T('Adicionar', 'Add') });
    function paint() {
      chips.innerHTML = '';
      arr.forEach(function (v, i) {
        var b = h('button', { type: 'button', class: 'chip on', text: v + '  x' });
        b.addEventListener('click', function () { arr.splice(i, 1); MM.store.save(); paint(); });
        chips.appendChild(b);
      });
    }
    function commit() {
      var v = inp.value.trim();
      if (v && arr.indexOf(v) < 0) arr.push(v);
      inp.value = '';
      MM.store.save();
      paint();
    }
    addBtn.addEventListener('click', commit);
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); commit(); } });
    paint();
    return h('div', { class: 'f-block' }, h('span', { class: 'f-label', text: label }), chips, h('div', { class: 'row-line' }, inp, addBtn, dl));
  }

  function render(def, e, S, host, refresh) {
    var F = MM.ui.F;
    function paint() {
      host.innerHTML = '';
      def.fields.forEach(function (f) {
        if (f.when && !f.when(e, S)) return;
        var label = f.l ? lab(f.l) : '';
        if (f.t === 'h') { host.appendChild(h('h3', { text: label })); return; }
        if (f.t === 'tx') host.appendChild(F.i18n(label, e, f.k, { onchange: f.k === 'name' ? refresh : null }));
        else if (f.t === 'text') host.appendChild(F.text(label, e, f.k, { placeholder: f.ph, hint: f.hint ? lab(f.hint) : '', onchange: f.rerender ? function () { paint(); } : null }));
        else if (f.t === 'note') host.appendChild(h('p', { class: 'note', text: label }));
        else if (f.t === 'area') host.appendChild(F.area(label, e, f.k));
        else if (f.t === 'num') host.appendChild(F.number(label, e, f.k, { step: f.step, min: f.min, max: f.max, hint: f.hint ? lab(f.hint) : '' }));
        else if (f.t === 'bool') host.appendChild(F.check(label, e, f.k, f.rerender ? function () { paint(); } : null));
        else if (f.t === 'sel') host.appendChild(F.select(label, e, f.k, f.o.map(function (o) { return { v: o[0], l: typeof o[1] === 'string' ? o[1] : lab(o[1]) }; }), f.rerender ? function () { paint(); } : null));
        else if (f.t === 'color') host.appendChild(F.color(label, e, f.k));
        else if (f.t === 'img') host.appendChild(F.image(label, e, f.k, f.size || '', f.anim));
        else if (f.t === 'stats') host.appendChild(F.stats(e[f.k]));
        else if (f.t === 'ids') host.appendChild(idChips(S, f.src, label, e[f.k]));
        else if (f.t === 'pick') host.appendChild(F.chips(label, e[f.k], f.opts));
        else if (f.t === 'id') host.appendChild(dlist(S, f.src, label, e, f.k, f.ph));
        else if (f.t === 'act') host.appendChild(F.actionPick(label, S, e, f.k, f.hook));
        else if (f.t === 'law') host.appendChild(dlist(S, ['laws'], label, e, f.k, ''));
        if (f.note) host.appendChild(h('p', { class: 'note', text: lab(f.note) }));
      });
    }
    paint();
    return paint;
  }

  function randomize(def, e, S) {
    var R = MM.random;
    def.fields.forEach(function (f) {
      if (f.t === 'h' || f.t === 'note' || f.norandom) return;
      if (f.when && !f.when(e, S)) return;
      if (f.t === 'tx') {
        if (f.desc) e[f.k] = R.desc(def.nm);
        else R.fill(e, f.k, f.nm || def.nm || 'trait');
      } else if (f.t === 'num') {
        if (f.rnd) e[f.k] = R.num(f.rnd[0], f.rnd[1], f.step || 1);
      } else if (f.t === 'bool') {
        if (f.rb) e[f.k] = R.chance(f.rb === true ? 0.5 : f.rb);
      } else if (f.t === 'sel') {
        if (!f.fixed) e[f.k] = R.pick(f.o)[0];
      } else if (f.t === 'color') {
        e[f.k] = R.color();
      } else if (f.t === 'ids') {
        if (f.rn) e[f.k] = R.sample(idsFor(S, f.src), R.int(f.rmin || 0, f.rn));
      } else if (f.t === 'stats') {
        R.stats(e[f.k], 2, 4, f.neg);
      } else if (f.t === 'act') {
        var list = S.actions.filter(function (a) { return a.hook === f.hook; });
        e[f.k] = list.length && R.chance(f.rp === undefined ? 0.5 : f.rp) ? R.pick(list).id : '';
      } else if (f.t === 'img') {
        if (f.anim) MM.libraryUI.fill(e, f.k, f.size, true);
        else e[f.k] = R.sprite(f.px || 16, f.shape, f.k, f.size);
      } else if (f.t === 'id') {
        if (f.rsrc) e[f.k] = R.pick(idsFor(S, f.rsrc));
      }
    });
    if (def.afterRandom) def.afterRandom(e, S);
  }

  function screen(def) {
    return function () {
      var S = MM.store.get();
      return MM.ui.listScreen({
        key: def.key, factory: def.key, newLabel: lab(def.newLabel), heading: lab(def.label1), empty: lab(def.empty),
        title: function (x) { return (x.name ? MM.nm(x.name) : '') || x.id; },
        sub: function (x) { return x.id; },
        editor: function (e, S2, refresh, host) {
          var bar = h('div', { class: 'btn-row' });
          var rnd = h('button', { type: 'button', class: 'btn tiny', text: T('Aleatorizar este item', 'Randomize this item') });
          var body = h('div');
          var repaint = render(def, e, S2, body, refresh);
          rnd.addEventListener('click', function () {
            randomize(def, e, S2);
            MM.store.save();
            repaint();
            refresh();
          });
          bar.appendChild(rnd);
          host.appendChild(bar);
          if (def.intro) host.appendChild(h('p', { class: 'note', text: lab(def.intro) }));
          host.appendChild(body);
        }
      });
    };
  }

  function cx(S, ns) {
    return {
      ns: ns,
      cs: MM.csv,
      num: MM.num,
      int: MM.int,
      act: function (id) {
        for (var i = 0; i < S.actions.length; i++) if (S.actions[i].id === id) return 'Actions.A_' + id;
        return null;
      },
      actOf: function (id) {
        for (var i = 0; i < S.actions.length; i++) if (S.actions[i].id === id) return S.actions[i];
        return null;
      },
      stats: function (v, stats) {
        var out = [];
        Object.keys(stats || {}).forEach(function (k) {
          var x = stats[k];
          if (x === '' || x === null || x === undefined || isNaN(Number(x))) return;
          out.push(v + '.base_stats[' + MM.csv(k) + '] = ' + MM.num(x) + ';');
        });
        return out;
      },
      list: function (arr) { return arr.map(function (x) { return MM.csv(x); }).join(', '); }
    };
  }

  function genClass(def, S, ns) {
    var c = cx(S, ns);
    var out = ['namespace ' + ns, '{', '\tpublic static class ' + def.cls, '\t{', '\t\tpublic static void Init()', '\t\t{'];
    S[def.key].forEach(function (e) {
      var w = [];
      def.gen(e, S, w, c);
      out.push('\t\t\t{');
      w.forEach(function (l) { out.push('\t\t\t\t' + l); });
      out.push('\t\t\t}');
    });
    out.push('\t\t}', '\t}', '}');
    return out.join('\n') + '\n';
  }

  function extend(S, ns, code, parts) {
    defs.forEach(function (def) {
      if (def.raw) return;
      if (!S[def.key] || !S[def.key].length) return;
      code[def.file] = genClass(def, S, ns);
      parts.push({ name: def.cls, late: !!def.late });
    });
    defs.forEach(function (def) {
      if (!def.genFile || !S[def.key]) return;
      S[def.key].forEach(function (e) {
        var out = def.genFile(e, S, ns, cx(S, ns));
        if (out) {
          code[out.file] = out.text;
          if (out.init) parts.push({ name: out.init, late: true });
        }
      });
    });
  }

  function locale(S, lang, put) {
    defs.forEach(function (def) {
      if (!def.loc || !S[def.key]) return;
      S[def.key].forEach(function (e) { def.loc(e, put, S); });
    });
  }

  function slots(S) {
    var out = [];
    defs.forEach(function (def) {
      if (!def.imgs || !S[def.key]) return;
      S[def.key].forEach(function (e) {
        def.imgs(e, S).forEach(function (x) { out.push(x); });
      });
    });
    return out;
  }

  function validate(S, errs) {
    defs.forEach(function (def) {
      if (!S[def.key]) return;
      var seen = {};
      S[def.key].forEach(function (e) {
        if (!e.id) errs.push(def.key + ': id vazio / empty id');
        if (seen[e.id]) errs.push(def.key + ': id duplicado / duplicate id ' + e.id);
        seen[e.id] = true;
        if (def.validate) def.validate(e, S, function (m) { errs.push(def.key + ' ' + e.id + ': ' + m); });
      });
    });
  }

  function register(ui) {
    defs.forEach(function (d) {
      ui.screens[d.key] = screen(d);
      ui.order.splice(ui.order.length - 1, 0, { id: d.key, pt: d.label[0], en: d.label[1], group: d.group });
      ui.counts[d.key] = d.key;
    });
  }

  return { idChips: idChips, add: add, defs: defs, byKey: byKey, idsFor: idsFor, customIds: customIds, extend: extend, locale: locale, slots: slots, validate: validate, register: register, randomize: randomize, factory: factory, cx: cx, lab: lab };
})();
