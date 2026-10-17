MM.img = (function () {
  var MAX = 3 * 1024 * 1024;

  function pick(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('type')); return; }
      if (file.size > MAX) { reject(new Error('size')); return; }
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () {
        var c = document.createElement('canvas');
        c.width = im.naturalWidth;
        c.height = im.naturalHeight;
        c.getContext('2d').drawImage(im, 0, 0);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/png'));
      };
      im.onerror = function () { URL.revokeObjectURL(url); reject(new Error('load')); };
      im.src = url;
    });
  }

  function bytes(dataUrl) {
    var b = atob(dataUrl.split(',')[1]);
    var out = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
    return out;
  }

  function toDataUrl(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return 'data:image/png;base64,' + btoa(s);
  }

  function fullId(it) { return MM.gen.itemFullId(MM.store.get(), it); }

  function pad(i) { return (i < 10 ? '0' : '') + i; }

  function frameFn(folder) {
    return function (i) { return folder + '/' + pad(i) + '.png'; };
  }

  function seqFn(folder, prefix) {
    return function (i) { return folder + '/' + prefix + i + '.png'; };
  }

  function writeSlots(S, out, folder) {
    slots(S).forEach(function (sl) {
      if (!sl.obj[sl.key]) return;
      if (!sl.fr) { out[folder + '/' + sl.path] = bytes(sl.obj[sl.key]); return; }
      var f = sl.frames ? sl.frames() : MM.anim.frames(sl.obj, sl.key);
      f.forEach(function (u, i) { out[folder + '/' + sl.fr(i, f.length)] = bytes(u); });
    });
  }

  function readSlots(S, files, root) {
    slots(S).forEach(function (sl) {
      if (sl.mirror || sl.fixed) return;
      if (!sl.fr) {
        var data = files[root + sl.path];
        if (data) sl.obj[sl.key] = toDataUrl(data);
        return;
      }
      for (var n = 24; n >= 1; n--) {
        var ok = true;
        for (var i = 0; i < n; i++) if (!files[root + sl.fr(i, n)]) { ok = false; break; }
        if (ok && !files[root + sl.fr(n, n + 1)]) {
          var urls = [];
          for (var j = 0; j < n; j++) urls.push(toDataUrl(files[root + sl.fr(j, n)]));
          MM.anim.set(sl.obj, sl.key, urls[0], urls.slice(1));
          return;
        }
      }
    });
  }

  function slots(S) {
    var list = [];
    function add(obj, key, path, label, size) { list.push({ obj: obj, key: key, path: path, label: label, size: size }); }
    add(S.meta, 'img', 'icon.png', 'Mod icon', '200x200');
    if (S.buttons.length || S.powers.length) add(S.tab, 'img', 'GameResources/tab/' + S.tab.id + '.png', 'Tab icon', '66x22');
    S.traits.forEach(function (t) { add(t, 'img', 'GameResources/' + (MM.data.traitCatById[t.cat] || MM.data.traitCatById.actor).folder + '/' + t.id + '.png', 'Trait ' + t.id, '64x64'); });
    S.items.forEach(function (it) {
      var full = fullId(it);
      add(it, 'imgIcon', 'GameResources/item/' + full + '.png', 'Item icon ' + full, '32x32');
      if (MM.gen.tplOf(it.kind).weapon) {
        var wf = frameFn('GameResources/items/weapons/w_' + full);
        list.push({ obj: it, key: 'imgSprite', path: wf(0), fr: wf, label: 'Weapon sprite ' + full, size: '' });
        var sf = frameFn('GameResources/effects/slashes/' + full);
        list.push({ obj: it, key: 'slashImg', path: sf(0), fr: sf, label: 'Slash animation ' + full, size: '' });
      }
    });
    S.projectiles.forEach(function (p) {
      var pf = frameFn('GameResources/effects/projectiles/' + p.id);
      list.push({ obj: p, key: 'img', path: pf(0), fr: pf, label: 'Projectile ' + p.id, size: '' });
    });
    S.kingdoms.forEach(function (k) { add(k, 'img', 'GameResources/kingdom/' + k.id + '.png', 'Kingdom ' + k.id, '32x32'); });
    S.units.forEach(function (u) {
      add(u, 'img', 'GameResources/ui/Icons/unit_' + u.id + '.png', 'Creature icon ' + u.id, '32x32');
      var base = 'GameResources/actors/species/' + MM.gen.unitFolder(u) + '/' + u.id;
      var wk = seqFn(base + '/main', 'walk_');
      var sw = seqFn(base + '/main', 'swim_');
      var ck = seqFn(base + '/child', 'walk_');
      var cs = seqFn(base + '/child', 'swim_');
      list.push({ obj: u, key: 'body', path: wk(0), fr: wk, label: 'Creature body ' + u.id, size: '' });
      list.push({ obj: u, key: 'body', path: ck(0), fr: ck, label: 'Creature baby body ' + u.id, size: '', mirror: true });
      list.push({ obj: u, key: 'bodySwim', path: sw(0), fr: sw, label: 'Creature swim ' + u.id, size: '' });
      list.push({ obj: u, key: 'bodySwim', path: cs(0), fr: cs, label: 'Creature baby swim ' + u.id, size: '', mirror: true });
    });
    S.buttons.forEach(function (b) { add(b, 'img', 'GameResources/button/' + b.id + '.png', 'Button ' + b.id, '64x64'); });
    MM.kinds.slots(S).forEach(function (x) { list.push(x); });
    return list;
  }

  function control(obj, key, hint, onChange, size, anim) {
    var wrap = MM.h('div', { class: 'img-ctl' });
    var prev = MM.h('div', { class: 'img-prev' });
    var info = MM.h('div', { class: 'img-info' });
    var inp = MM.h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    if (anim) inp.multiple = true;
    var pickBtn = MM.h('button', { type: 'button', class: 'btn tiny', text: MM.tr('Escolher imagem', 'Choose image') });
    var rmBtn = MM.h('button', { type: 'button', class: 'btn tiny danger', text: MM.tr('Remover', 'Remove') });

    function paint() {
      prev.innerHTML = '';
      if (obj[key]) {
        var pim = MM.h('img', { alt: '', class: anim ? 'anim' : '' });
        MM.anim.attach(pim, anim ? MM.anim.frames(obj, key) : [obj[key]], MM.anim.fpsOf(obj, key));
        prev.appendChild(pim);
        rmBtn.hidden = false;
      } else {
        prev.appendChild(MM.h('span', { text: MM.tr('Solte aqui', 'Drop here') }));
        rmBtn.hidden = true;
      }
    }

    function take(file) {
      var files = Array.isArray(file) ? file : [file];
      if (anim && files.length > 1) {
        files.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });
        Promise.all(files.slice(0, 24).map(function (f) { return MM.img.pick(f); })).then(function (urls) {
          MM.anim.set(obj, key, urls[0], urls.slice(1), MM.anim.fpsOf(obj, key));
          MM.store.save();
          paint();
          if (onChange) onChange();
        }, function () {
          MM.toast(MM.tr('Não foi possível ler as imagens.', 'Could not read the images.'));
        });
        return;
      }
      MM.img.pick(files[0]).then(function (url) {
        if (anim) MM.anim.set(obj, key, url, [], MM.anim.fpsOf(obj, key));
        else obj[key] = url;
        MM.store.save();
        paint();
        if (onChange) onChange();
      }, function (e) {
        MM.toast(e && e.message === 'size' ? (MM.tr('Imagem maior que 3 MB.', 'Image is larger than 3 MB.')) : (MM.tr('Não foi possível ler a imagem.', 'Could not read the image.')));
      });
    }

    pickBtn.addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () { if (inp.files[0]) take(anim ? Array.prototype.slice.call(inp.files) : inp.files[0]); inp.value = ''; });
    rmBtn.addEventListener('click', function () { if (anim) MM.anim.clear(obj, key); else obj[key] = ''; MM.store.save(); paint(); if (onChange) onChange(); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      prev.addEventListener(ev, function (e) { e.preventDefault(); prev.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      prev.addEventListener(ev, function (e) { e.preventDefault(); prev.classList.remove('over'); });
    });
    prev.addEventListener('drop', function (e) {
      var fl = e.dataTransfer && e.dataTransfer.files;
      if (fl && fl.length) take(anim ? Array.prototype.slice.call(fl) : fl[0]);
    });
    prev.addEventListener('click', function () { inp.click(); });
    var drawBtn = MM.h('button', { type: 'button', class: 'btn tiny', text: MM.tr('Desenhar', 'Draw') });
    drawBtn.addEventListener('click', function () {
      MM.pixel.open(anim ? MM.anim.frames(obj, key) : obj[key], size, function (url, extra, fps) {
        if (anim) MM.anim.set(obj, key, url, extra, fps);
        else obj[key] = url;
        MM.store.save();
        paint();
        if (onChange) onChange();
      }, { anim: !!anim, fps: MM.anim.fpsOf(obj, key) });
    });
    var libBtn = MM.h('button', { type: 'button', class: 'btn tiny', text: MM.tr('Biblioteca', 'Library') });
    libBtn.addEventListener('click', function () {
      MM.libraryUI.open(key, size, function (url, extra, fps) {
        if (anim) MM.anim.set(obj, key, url, extra || [], fps || 6);
        else obj[key] = url;
        MM.store.save();
        paint();
        if (onChange) onChange();
      }, { anim: !!anim });
    });
    var rndBtn = MM.h('button', { type: 'button', class: 'btn tiny', text: MM.tr('Aleatório', 'Random') });
    rndBtn.addEventListener('click', function () {
      var m = /^(\d+)x(\d+)$/.exec(size || '');
      var n = m ? Math.min(32, Math.max(8, Math.min(Number(m[1]), Number(m[2])))) : 16;
      if (anim) MM.libraryUI.fill(obj, key, size, true);
      else obj[key] = MM.random.sprite(n, undefined, key, size);
      MM.store.save();
      paint();
      if (onChange) onChange();
    });
    wrap.appendChild(inp);
    info.appendChild(MM.h('div', { class: 'btn-row' }, pickBtn, libBtn, drawBtn, rndBtn, rmBtn));
    if (hint) info.appendChild(MM.h('span', { class: 'f-hint2', text: hint }));
    wrap.appendChild(prev);
    wrap.appendChild(info);
    paint();
    return wrap;
  }

  return { pick: pick, bytes: bytes, toDataUrl: toDataUrl, slots: slots, control: control, frameFn: frameFn, seqFn: seqFn, writeSlots: writeSlots, readSlots: readSlots, pad: pad };
})();

MM.unzip = function (buffer) {
  var u8 = new Uint8Array(buffer);
  var dv = new DataView(buffer);
  var eocd = -1;
  for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return Promise.reject(new Error('zip'));
  var count = dv.getUint16(eocd + 10, true);
  var pos = dv.getUint32(eocd + 16, true);
  var dec = new TextDecoder();
  var jobs = [];
  var out = {};
  for (var n = 0; n < count; n++) {
    if (dv.getUint32(pos, true) !== 0x02014b50) break;
    var method = dv.getUint16(pos + 10, true);
    var csize = dv.getUint32(pos + 20, true);
    var nlen = dv.getUint16(pos + 28, true);
    var elen = dv.getUint16(pos + 30, true);
    var clen = dv.getUint16(pos + 32, true);
    var off = dv.getUint32(pos + 42, true);
    var name = dec.decode(u8.subarray(pos + 46, pos + 46 + nlen));
    pos += 46 + nlen + elen + clen;
    if (name.slice(-1) === '/') continue;
    var lnlen = dv.getUint16(off + 26, true);
    var lelen = dv.getUint16(off + 28, true);
    var start = off + 30 + lnlen + lelen;
    var data = u8.subarray(start, start + csize);
    (function (nm, m, d) {
      if (m === 0) { out[nm] = d.slice(); return; }
      if (m === 8 && typeof DecompressionStream !== 'undefined') {
        var ds = new DecompressionStream('deflate-raw');
        var stream = new Blob([d]).stream().pipeThrough(ds);
        jobs.push(new Response(stream).arrayBuffer().then(function (ab) { out[nm] = new Uint8Array(ab); }));
      }
    })(name, method, data);
  }
  return Promise.all(jobs).then(function () { return out; });
};
