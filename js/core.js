window.MM = window.MM || {};

MM.lang = 'en';
MM.i18n = {};
MM.uiLangs = [{ v: 'en', l: 'English' }, { v: 'br', l: 'Português (Brasil)' }];
try {
  var storedLang = localStorage.getItem('mm_lang2');
  if (!storedLang) {
    storedLang = localStorage.getItem('mm_lang');
    if (storedLang === 'pt') storedLang = 'br';
  }
  if (storedLang) MM.lang = storedLang;
} catch (e) {}

MM.applyDir = function () {
  try { document.documentElement.dir = (MM.lang === 'fa' || MM.lang === 'ar' || MM.lang === 'he') ? 'rtl' : 'ltr'; } catch (e) {}
};

MM.tr = function (pt, en) {
  var l = MM.lang;
  if (l === 'br') return pt;
  if (l === 'en') return en;
  var p = MM.i18n[l];
  return (p && p[en]) || en;
};

MM.dict = { pt: {}, en: {} };

MM.t = function (key) {
  var d = MM.dict[MM.lang];
  if (d && d[key] !== undefined) return d[key];
  var f = MM.dict.en[key];
  return f !== undefined ? f : key;
};

MM.L = function (o) {
  if (o === null || o === undefined) return '';
  if (typeof o === 'string') return o;
  var v = MM.lang === 'br' ? o.pt : o[MM.lang];
  if (v) return v;
  var p = MM.i18n[MM.lang];
  if (p && o.en && p[o.en]) return p[o.en];
  if (MM.lang !== 'br' && MM.lang !== 'en' && o.en) return o.en;
  return o.en || '';
};

MM.addDict = function (lang, obj) {
  for (var k in obj) MM.dict[lang][k] = obj[k];
};

MM.h = function (tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) {
      for (var j = 0; j < c.length; j++) if (c[j]) el.appendChild(typeof c[j] === 'string' ? document.createTextNode(c[j]) : c[j]);
    } else el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
};

MM.slug = function (s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
};

MM.ident = function (s) {
  var r = String(s || '').replace(/[^A-Za-z0-9_]+/g, '');
  if (!r || /^[0-9]/.test(r)) r = 'Mod' + r;
  return r;
};

MM.csv = function (s) {
  return JSON.stringify(String(s === undefined || s === null ? '' : s));
};

MM.num = function (n) {
  var v = Number(n);
  if (!isFinite(v)) v = 0;
  var s = String(v);
  return s + 'f';
};

MM.int = function (n) {
  var v = Math.round(Number(n));
  if (!isFinite(v)) v = 0;
  return String(v);
};

MM.download = function (name, blob) {
  function fallback() {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  if (window.claude && window.claude.use) {
    window.claude.use('downloads').then(function (d) {
      if (!d) { fallback(); return; }
      d.save({ filename: name, data: blob }).then(function () {
        if (MM.sound) MM.sound.play('success');
        MM.toast(MM.tr('Arquivo salvo.', 'File saved.'));
      }, function (e) {
        if (!e || e.code !== 'declined') MM.toast(MM.tr('Não foi possível salvar o arquivo.', 'Could not save the file.'));
      });
    }, fallback);
  } else fallback();
};

MM.confirm = function (msg, yes) {
  var host = document.getElementById('toasts');
  var box = MM.h('div', { class: 'toast ask' });
  var ok = MM.h('button', { class: 'btn tiny', type: 'button', text: MM.tr('Sim', 'Yes') });
  var no = MM.h('button', { class: 'btn tiny primary', type: 'button', text: MM.tr('Não', 'No') });
  ok.addEventListener('click', function () { box.remove(); yes(); });
  no.addEventListener('click', function () { box.remove(); });
  box.appendChild(MM.h('span', { text: msg + ' ' }));
  box.appendChild(no);
  box.appendChild(ok);
  host.appendChild(box);
  no.focus();
};

MM.toast = function (msg) {
  var host = document.getElementById('toasts');
  if (!host) return;
  var el = MM.h('div', { class: 'toast', text: msg });
  if (MM.sound) MM.sound.play('pop');
  host.appendChild(el);
  setTimeout(function () { el.classList.add('out'); }, 2400);
  setTimeout(function () { el.remove(); }, 3000);
};

MM.nm = function (o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  return o.en || '';
};

MM.pascal = function (s) {
  var r = String(s || '').split(/[^A-Za-z0-9]+/).filter(Boolean).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
  if (!r || /^[0-9]/.test(r)) r = 'V' + r;
  return r;
};
