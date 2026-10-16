MM.zip = (function () {
  var table = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function u16(v) { return [v & 255, (v >>> 8) & 255]; }
  function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }

  function dosTime(d) {
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { time: time, date: date };
  }

  function build(files) {
    var enc = new TextEncoder();
    var parts = [];
    var central = [];
    var offset = 0;
    var dt = dosTime(new Date());
    var names = Object.keys(files);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      var data = files[name];
      if (typeof data === 'string') data = enc.encode(data);
      var nameBytes = enc.encode(name);
      var crc = crc32(data);
      var header = [].concat(
        [0x50, 0x4b, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0)
      );
      var h = new Uint8Array(header);
      parts.push(h, nameBytes, data);
      var cen = [].concat(
        [0x50, 0x4b, 0x01, 0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
        u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0),
        u32(0), u32(offset)
      );
      central.push(new Uint8Array(cen), nameBytes);
      offset += h.length + nameBytes.length + data.length;
    }
    var centralSize = 0;
    for (var j = 0; j < central.length; j++) centralSize += central[j].length;
    var end = new Uint8Array([].concat(
      [0x50, 0x4b, 0x05, 0x06], u16(0), u16(0), u16(names.length), u16(names.length),
      u32(centralSize), u32(offset), u16(0)
    ));
    return new Blob(parts.concat(central, [end]), { type: 'application/zip' });
  }

  return { build: build };
})();
