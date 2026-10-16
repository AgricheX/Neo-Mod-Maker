MM.sound = (function () {
  var ctx = null;
  var on = true;
  try { on = localStorage.getItem('mm_sound') !== 'off'; } catch (e) {}
  var last = 0;

  function ac() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { ctx = new C(); } catch (e) { ctx = null; }
    return ctx;
  }

  function tone(freq, start, dur, type, vol, slide) {
    var a = ac();
    if (!a) return;
    var t0 = a.currentTime + start;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  var sounds = {
    click: function () { tone(660, 0, 0.06, 'square', 0.04); tone(990, 0.03, 0.05, 'square', 0.03); },
    primary: function () { tone(523, 0, 0.07, 'square', 0.05); tone(784, 0.06, 0.09, 'square', 0.05); },
    nav: function () { tone(440, 0, 0.05, 'triangle', 0.07); tone(587, 0.04, 0.07, 'triangle', 0.06); },
    tick: function () { tone(880, 0, 0.035, 'square', 0.03); },
    danger: function () { tone(220, 0, 0.12, 'sawtooth', 0.05, 110); },
    random: function () { tone(500, 0, 0.04, 'square', 0.04); tone(750, 0.04, 0.04, 'square', 0.04); tone(620, 0.08, 0.04, 'square', 0.04); tone(940, 0.12, 0.07, 'square', 0.045); },
    success: function () { tone(523, 0, 0.09, 'square', 0.05); tone(659, 0.09, 0.09, 'square', 0.05); tone(784, 0.18, 0.09, 'square', 0.05); tone(1047, 0.27, 0.16, 'square', 0.05); },
    undo: function () { tone(700, 0, 0.07, 'triangle', 0.07, 400); },
    redo: function () { tone(400, 0, 0.07, 'triangle', 0.07, 700); },
    pop: function () { tone(300, 0, 0.08, 'sine', 0.09, 700); }
  };

  function play(name) {
    if (!on) return;
    var now = Date.now();
    if (now - last < 35) return;
    last = now;
    var a = ac();
    if (a && a.state === 'suspended') a.resume();
    var fn = sounds[name] || sounds.click;
    try { fn(); } catch (e) {}
  }

  function classify(el) {
    if (el.closest('.nav-item')) return 'nav';
    var b = el.closest('button');
    if (b) {
      if (b.getAttribute('data-nosound')) return null;
      var txt = (b.textContent || '').toLowerCase();
      if (b.classList.contains('danger')) return 'danger';
      if (/random|aleat/.test(txt)) return 'random';
      if (b.classList.contains('primary')) return 'primary';
      if (b.classList.contains('chip')) return 'tick';
      return 'click';
    }
    if (el.closest('.card')) return 'tick';
    return null;
  }

  function init() {
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var k = classify(t);
      if (k) play(k);
    }, true);
    document.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t && (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && (t.type === 'checkbox' || t.type === 'color')))) play('tick');
    }, true);
  }

  function set(v) {
    on = !!v;
    try { localStorage.setItem('mm_sound', on ? 'on' : 'off'); } catch (e) {}
    if (on) play('pop');
  }

  return { play: play, init: init, set: set, enabled: function () { return on; } };
})();
