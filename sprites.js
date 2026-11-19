(function () {
// Атлас: PD.atlas (assets/sprites/atlas.js) + картинка atlas.png. Без картинки игра рисует запасные прямоугольники.
PD.Sprites = {
  ready: false, img: null,
  load: function (cb) {
    var im = new Image(), self = this;
    im.onload = function () { self.img = im; self.ready = true; if (cb) cb(); };
    im.src = 'assets/sprites/atlas.png';
  },
  size: function (name) { var f = PD.atlas && PD.atlas.frames[name]; return f ? f : null; },
  draw: function (c, name, x, y) {
    var f = PD.atlas.frames[name]; if (!f || !this.ready) return false;
    c.drawImage(this.img, f[0], f[1], f[2], f[3], Math.round(x), Math.round(y), f[2], f[3]); return true;
  },
  drawRot: function (c, name, x, y, ang) {
    var f = PD.atlas.frames[name]; if (!f || !this.ready) return false;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang);
    c.drawImage(this.img, f[0], f[1], f[2], f[3], -(f[2] >> 1), -(f[3] >> 1), f[2], f[3]); c.restore(); return true;
  },
  // имя кадра анимации по времени (секунды игрового времени)
  frame: function (anim, t) { var a = PD.atlas.anims[anim]; return a.frames[Math.floor(t * a.fps) % a.frames.length]; }
};
})();
