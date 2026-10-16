MM.pixel = (function () {
  var h = MM.h;
  var PALETTE = ['#000000', '#ffffff', '#6b6b7b', '#b9b9c9', '#7a2a2a', '#d84a4a', '#f08a3c', '#ffd84a', '#3f7a2f', '#7ad65a', '#1f4f8f', '#4aa3ff', '#4a2a8f', '#9a6cff', '#8a5a3a', '#e6b98a'];

  function T(pt, en) { return MM.tr(pt, en); }

  function open(initial, size, done, opts) {
    opts = opts || {};
    var animOn = !!opts.anim;
    var fps = opts.fps > 0 ? opts.fps : 6;
    var onion = false;
    var playing = true;
    var playTimer = null;
    var MAXF = opts.maxFrames || 24;
    var dims = String(size || '32x32').split('x').map(Number);
    var W = dims[0] > 0 ? dims[0] : 32;
    var H = dims[1] > 0 ? dims[1] : W;
    var cur = '#ffffff';
    var tool = 'pen';
    var mirror = false;
    var grid = true;
    var cell = 16;
    var zoom = 1;
    var ZOOMS = [1, 1.5, 2, 3, 4, 6, 8];
    var frames = [document.createElement('canvas')];
    var fi = 0;
    var data = frames[0];
    var dctx = data.getContext('2d');
    var history = [];
    var down = false;

    function useFrame(i) {
      fi = Math.max(0, Math.min(frames.length - 1, i));
      data = frames[fi];
      dctx = data.getContext('2d');
    }

    function resize(w, hh) {
      W = Math.max(1, Math.min(256, w));
      H = Math.max(1, Math.min(256, hh));
      frames.forEach(function (fc) {
        var old = document.createElement('canvas');
        old.width = fc.width;
        old.height = fc.height;
        if (fc.width) old.getContext('2d').drawImage(fc, 0, 0);
        fc.width = W;
        fc.height = H;
        var cx = fc.getContext('2d');
        cx.clearRect(0, 0, W, H);
        if (old.width) cx.drawImage(old, 0, 0);
      });
      cell = Math.max(2, Math.min(24, Math.floor(560 / Math.max(W, H)))) * zoom;
      cell = Math.max(2, Math.round(cell));
      view.width = W * cell;
      view.height = H * cell;
      draw();
      if (typeof paintStrip === 'function') paintStrip();
    }

    var overlay = h('div', { class: 'modal-bg' });
    var win = h('div', { class: 'modal panel' });
    var view = h('canvas', { class: 'px-view' });
    var vctx = view.getContext('2d');
    var wIn = h('input', { type: 'number', min: 1, max: 256, value: W });
    var hIn = h('input', { type: 'number', min: 1, max: 256, value: H });

    function draw() {
      vctx.clearRect(0, 0, view.width, view.height);
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          vctx.fillStyle = (x + y) % 2 ? '#2a2f66' : '#232859';
          vctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
      vctx.imageSmoothingEnabled = false;
      if (animOn && onion && fi > 0) {
        vctx.globalAlpha = 0.3;
        vctx.drawImage(frames[fi - 1], 0, 0, W * cell, H * cell);
        vctx.globalAlpha = 1;
      }
      vctx.drawImage(data, 0, 0, W * cell, H * cell);
      if (grid && cell >= 6) {
        vctx.strokeStyle = 'rgba(255,255,255,0.08)';
        vctx.lineWidth = 1;
        vctx.beginPath();
        for (var gx = 0; gx <= W; gx++) { vctx.moveTo(gx * cell + 0.5, 0); vctx.lineTo(gx * cell + 0.5, H * cell); }
        for (var gy = 0; gy <= H; gy++) { vctx.moveTo(0, gy * cell + 0.5); vctx.lineTo(W * cell, gy * cell + 0.5); }
        vctx.stroke();
      }
    }

    function snapshot() {
      history.push({ f: fi, img: dctx.getImageData(0, 0, W, H) });
      if (history.length > 60) history.shift();
    }

    function put(x, y, erase) {
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      if (erase) dctx.clearRect(x, y, 1, 1);
      else { dctx.fillStyle = cur; dctx.fillRect(x, y, 1, 1); }
    }

    function stroke(x, y) {
      var erase = tool === 'erase';
      put(x, y, erase);
      if (mirror) put(W - 1 - x, y, erase);
    }

    function fill(x, y) {
      var img = dctx.getImageData(0, 0, W, H);
      var d = img.data;
      var idx = (y * W + x) * 4;
      var target = [d[idx], d[idx + 1], d[idx + 2], d[idx + 3]];
      var c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      var cc = c.getContext('2d');
      cc.fillStyle = cur;
      cc.fillRect(0, 0, 1, 1);
      var nc = cc.getImageData(0, 0, 1, 1).data;
      if (target[0] === nc[0] && target[1] === nc[1] && target[2] === nc[2] && target[3] === 255) return;
      var stack = [[x, y]];
      while (stack.length) {
        var p = stack.pop();
        var px = p[0];
        var py = p[1];
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        var i = (py * W + px) * 4;
        if (d[i] !== target[0] || d[i + 1] !== target[1] || d[i + 2] !== target[2] || d[i + 3] !== target[3]) continue;
        d[i] = nc[0]; d[i + 1] = nc[1]; d[i + 2] = nc[2]; d[i + 3] = 255;
        stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
      }
      dctx.putImageData(img, 0, 0);
    }

    function pick(x, y) {
      var d = dctx.getImageData(x, y, 1, 1).data;
      if (d[3] === 0) return;
      cur = '#' + [d[0], d[1], d[2]].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
      colorIn.value = cur;
      paintPal();
    }

    function pos(e) {
      var r = view.getBoundingClientRect();
      var sx = view.width / r.width;
      var sy = view.height / r.height;
      return [Math.floor((e.clientX - r.left) * sx / cell), Math.floor((e.clientY - r.top) * sy / cell)];
    }

    view.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var p = pos(e);
      if (p[0] < 0 || p[1] < 0 || p[0] >= W || p[1] >= H) return;
      snapshot();
      if (tool === 'fill') { fill(p[0], p[1]); draw(); return; }
      if (tool === 'pick') { pick(p[0], p[1]); history.pop(); return; }
      down = true;
      view.setPointerCapture(e.pointerId);
      stroke(p[0], p[1]);
      draw();
    });
    view.addEventListener('pointermove', function (e) {
      if (!down) return;
      var p = pos(e);
      stroke(p[0], p[1]);
      draw();
    });
    view.addEventListener('pointerup', function () { down = false; });
    view.addEventListener('pointercancel', function () { down = false; });

    var palWrap = h('div', { class: 'px-pal' });
    var colorIn = h('input', { type: 'color', value: cur });
    colorIn.addEventListener('input', function () { cur = colorIn.value; if (tool === 'erase' || tool === 'pick') { tool = 'pen'; paintTools(); } paintPal(); });
    function paintPal() {
      palWrap.innerHTML = '';
      PALETTE.forEach(function (c) {
        var b = h('button', { type: 'button', class: 'px-sw' + (c === cur ? ' on' : ''), title: c });
        b.style.background = c;
        b.addEventListener('click', function () { cur = c; colorIn.value = c; if (tool === 'erase' || tool === 'pick') { tool = 'pen'; paintTools(); } paintPal(); });
        palWrap.appendChild(b);
      });
    }

    var toolWrap = h('div', { class: 'btn-row' });
    var tools = [['pen', T('Lápis', 'Pen')], ['erase', T('Borracha', 'Eraser')], ['fill', T('Balde', 'Fill')], ['pick', T('Conta-gotas', 'Picker')]];
    function paintTools() {
      toolWrap.innerHTML = '';
      tools.forEach(function (t) {
        var b = h('button', { type: 'button', class: 'btn tiny' + (tool === t[0] ? ' on' : ''), text: t[1] });
        b.addEventListener('click', function () { tool = t[0]; paintTools(); });
        toolWrap.appendChild(b);
      });
    }

    var mirrorBtn = h('button', { type: 'button', class: 'btn tiny', text: T('Espelho', 'Mirror') });
    mirrorBtn.addEventListener('click', function () { mirror = !mirror; mirrorBtn.classList.toggle('on', mirror); });
    var gridBtn = h('button', { type: 'button', class: 'btn tiny on', text: T('Grade', 'Grid') });
    gridBtn.addEventListener('click', function () { grid = !grid; gridBtn.classList.toggle('on', grid); draw(); });
    var undoBtn = h('button', { type: 'button', class: 'btn tiny', text: T('Desfazer', 'Undo') });
    undoBtn.addEventListener('click', function () {
      var s = history.pop();
      if (s) { useFrame(s.f); dctx.clearRect(0, 0, W, H); dctx.putImageData(s.img, 0, 0); draw(); paintStrip(); }
    });
    var clearBtn = h('button', { type: 'button', class: 'btn tiny danger', text: T('Limpar', 'Clear') });
    clearBtn.addEventListener('click', function () { snapshot(); dctx.clearRect(0, 0, W, H); draw(); });
    var applySize = h('button', { type: 'button', class: 'btn tiny', text: T('Aplicar tamanho', 'Apply size') });
    applySize.addEventListener('click', function () { snapshot(); resize(Number(wIn.value) || W, Number(hIn.value) || H); history.pop(); });
    var stage = h('div', { class: 'px-stage' }, view);
    var zoomLabel = h('span', { class: 'px-zoom-label', text: '100%' });
    function lens(sign) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.innerHTML = '<circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 10l4.5 4.5" stroke="currentColor" stroke-width="2"/><path d="M4.3 6.5h4.4' + (sign > 0 ? 'M6.5 4.3v4.4' : '') + '" stroke="currentColor" stroke-width="1.4"/>';
      return svg;
    }
    function setZoom(dir) {
      var i = ZOOMS.indexOf(zoom);
      var n = Math.max(0, Math.min(ZOOMS.length - 1, i + dir));
      if (n === i) return;
      var cx = (stage.scrollLeft + stage.clientWidth / 2) / (view.width || 1);
      var cy = (stage.scrollTop + stage.clientHeight / 2) / (view.height || 1);
      zoom = ZOOMS[n];
      resize(W, H);
      stage.scrollLeft = cx * view.width - stage.clientWidth / 2;
      stage.scrollTop = cy * view.height - stage.clientHeight / 2;
      zoomLabel.textContent = Math.round(zoom * 100) + '%';
    }
    var zoomIn = h('button', { type: 'button', class: 'btn tiny px-icon', title: T('Aproximar', 'Zoom in') }, lens(1));
    var zoomOut = h('button', { type: 'button', class: 'btn tiny px-icon', title: T('Afastar', 'Zoom out') }, lens(-1));
    zoomIn.addEventListener('click', function () { setZoom(1); });
    zoomOut.addEventListener('click', function () { setZoom(-1); });
    stage.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });
    function panBtn(label, title, dx, dy) {
      var b = h('button', { type: 'button', class: 'btn tiny px-icon', title: title, text: label });
      b.addEventListener('click', function () { stage.scrollBy(dx * 80, dy * 80); });
      return b;
    }
    var panBox = h('div', { class: 'px-pan' },
      h('span'), panBtn('\u2191', T('Subir', 'Up'), 0, -1), h('span'),
      panBtn('\u2190', T('Esquerda', 'Left'), -1, 0), h('span', { class: 'px-pan-mid' }), panBtn('\u2192', T('Direita', 'Right'), 1, 0),
      h('span'), panBtn('\u2193', T('Descer', 'Down'), 0, 1), h('span'));
    var saveBtn = h('button', { type: 'button', class: 'btn primary', text: T('Usar este desenho', 'Use this drawing') });
    var cancelBtn = h('button', { type: 'button', class: 'btn', text: T('Cancelar', 'Cancel') });

    function close() { clearInterval(playTimer); overlay.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    saveBtn.addEventListener('click', function () {
      var urls = frames.map(function (fc) { return fc.toDataURL('image/png'); });
      done(urls[0], urls.slice(1), fps);
      close();
    });
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('pointerdown', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);

    win.appendChild(h('h2', { text: T('Editor de pixel', 'Pixel editor') }));
    var body = h('div', { class: 'px-body' });
    var side = h('div', { class: 'px-side' });
    side.appendChild(h('span', { class: 'f-label', text: T('Ferramentas', 'Tools') }));
    side.appendChild(toolWrap);
    side.appendChild(h('div', { class: 'btn-row' }, mirrorBtn, gridBtn, undoBtn, clearBtn));
    side.appendChild(h('span', { class: 'f-label', text: T('Zoom', 'Zoom') }));
    side.appendChild(h('div', { class: 'btn-row px-zoom' }, zoomOut, zoomLabel, zoomIn));
    side.appendChild(panBox);
    side.appendChild(h('span', { class: 'f-label', text: T('Cor', 'Color') }));
    side.appendChild(palWrap);
    side.appendChild(colorIn);
    side.appendChild(h('span', { class: 'f-label', text: T('Tamanho (px)', 'Size (px)') }));
    side.appendChild(h('div', { class: 'px-size' }, wIn, h('span', { text: 'x' }), hIn, applySize));
    body.appendChild(stage);
    body.appendChild(side);
    win.appendChild(body);
    var strip = h('div', { class: 'px-strip' });
    var stripBar = h('div', { class: 'btn-row' });
    var prevBox = h('canvas', { class: 'px-prev-anim' });
    var pctx = prevBox.getContext('2d');
    var pi = 0;
    function paintPrev() {
      if (!animOn) return;
      var f = frames[playing ? pi % frames.length : fi];
      prevBox.width = W;
      prevBox.height = H;
      pctx.clearRect(0, 0, W, H);
      pctx.drawImage(f, 0, 0);
    }
    function restartTimer() {
      clearInterval(playTimer);
      playTimer = setInterval(function () { pi++; paintPrev(); }, Math.max(40, Math.round(1000 / fps)));
    }
    function paintStrip() {
      if (!animOn) return;
      strip.innerHTML = '';
      frames.forEach(function (fc, i) {
        var t = h('canvas', { class: 'px-th' + (i === fi ? ' on' : '') });
        t.width = W;
        t.height = H;
        t.getContext('2d').drawImage(fc, 0, 0);
        t.title = String(i + 1);
        t.addEventListener('click', function () { useFrame(i); draw(); paintStrip(); paintPrev(); });
        strip.appendChild(h('div', { class: 'px-th-wrap' }, t, h('span', { class: 'px-th-n', text: String(i + 1) })));
      });
      paintPrev();
    }
    function mkCanvas() {
      var c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      return c;
    }
    function fbtn(label, fn) {
      var b = h('button', { type: 'button', class: 'btn tiny', text: label });
      b.addEventListener('click', fn);
      return b;
    }
    if (animOn) {
      var fpsIn = h('input', { type: 'number', min: 1, max: 30, value: fps, class: 'px-fps' });
      fpsIn.addEventListener('input', function () { fps = Math.max(1, Math.min(30, Number(fpsIn.value) || 6)); restartTimer(); });
      var onionBtn = fbtn(T('Papel vegetal', 'Onion skin'), function () { onion = !onion; onionBtn.classList.toggle('on', onion); draw(); });
      var playBtn = fbtn(T('Pausar', 'Pause'), function () { playing = !playing; playBtn.textContent = playing ? T('Pausar', 'Pause') : T('Tocar', 'Play'); paintPrev(); });
      stripBar.appendChild(fbtn(T('+ Quadro', '+ Frame'), function () {
        if (frames.length >= MAXF) return;
        frames.splice(fi + 1, 0, mkCanvas());
        history = [];
        useFrame(fi + 1); draw(); paintStrip();
      }));
      stripBar.appendChild(fbtn(T('Duplicar', 'Duplicate'), function () {
        if (frames.length >= MAXF) return;
        var c = mkCanvas();
        c.getContext('2d').drawImage(data, 0, 0);
        frames.splice(fi + 1, 0, c);
        history = [];
        useFrame(fi + 1); draw(); paintStrip();
      }));
      stripBar.appendChild(fbtn(T('Apagar quadro', 'Delete frame'), function () {
        if (frames.length <= 1) return;
        frames.splice(fi, 1);
        history = [];
        useFrame(fi); draw(); paintStrip();
      }));
      stripBar.appendChild(fbtn('\u2190', function () {
        if (fi < 1) return;
        var t = frames[fi]; frames[fi] = frames[fi - 1]; frames[fi - 1] = t;
        history = [];
        useFrame(fi - 1); draw(); paintStrip();
      }));
      stripBar.appendChild(fbtn('\u2192', function () {
        if (fi >= frames.length - 1) return;
        var t = frames[fi]; frames[fi] = frames[fi + 1]; frames[fi + 1] = t;
        history = [];
        useFrame(fi + 1); draw(); paintStrip();
      }));
      stripBar.appendChild(onionBtn);
      stripBar.appendChild(playBtn);
      stripBar.appendChild(h('span', { class: 'f-label', text: 'FPS' }));
      stripBar.appendChild(fpsIn);
      var genSel = h('select', { class: 'px-gen' });
      MM.anim.kinds.forEach(function (k) { genSel.appendChild(h('option', { value: k[0], text: T(k[1][0], k[1][1]) })); });
      var genN = h('input', { type: 'number', min: 2, max: 12, value: 4, class: 'px-fps' });
      var genBtn = fbtn(T('Gerar quadros', 'Generate frames'), function () {
        var n = Math.max(2, Math.min(MAXF, Number(genN.value) || 4));
        frames = MM.anim.gen(genSel.value, data, n);
        history = [];
        useFrame(0); draw(); paintStrip();
      });
      stripBar.appendChild(h('span', { class: 'px-gen-box' }, genSel, genN, genBtn));
      win.appendChild(h('div', { class: 'px-anim' }, h('div', { class: 'px-anim-main' }, stripBar, strip), prevBox));
      restartTimer();
    }
    win.appendChild(h('div', { class: 'btn-row px-foot' }, saveBtn, cancelBtn));
    overlay.appendChild(win);
    document.body.appendChild(overlay);

    paintTools();
    paintPal();
    resize(W, H);
    var srcs = Array.isArray(initial) ? initial.filter(Boolean) : (initial ? [initial] : []);
    if (srcs.length) {
      var imgs = [];
      var left = srcs.length;
      srcs.forEach(function (u, i) {
        var im = new Image();
        im.onload = im.onerror = function () {
          imgs[i] = im;
          if (--left) return;
          var first = imgs[0];
          if (first.naturalWidth && (first.naturalWidth !== W || first.naturalHeight !== H)) {
            wIn.value = first.naturalWidth;
            hIn.value = first.naturalHeight;
            resize(first.naturalWidth, first.naturalHeight);
          }
          frames = imgs.slice(0, animOn ? MAXF : 1).map(function (m) {
            var c = mkCanvas();
            if (m.naturalWidth) c.getContext('2d').drawImage(m, 0, 0);
            return c;
          });
          useFrame(0);
          draw();
          paintStrip();
        };
        im.src = u;
      });
    } else {
      paintStrip();
    }
  }

  return { open: open };
})();
