(function () {
// Короткие спрайтовые эффекты. Время берётся из игрового (пауза замораживает, ускорение ускоряет).
var pool = new PD.Pool(function () { return { name: '', x: 0, y: 0, t0: 0, dur: 0, dead: true }; }), MAX = 60;
PD.VFX = {
  live: pool.live,
  spawn: function (name, x, y) {
    var a = PD.atlas && PD.atlas.anims[name]; if (!a) return;
    if (pool.live.length >= MAX) pool.live[0].dead = true;
    var o = pool.get(); o.name = name; o.x = x; o.y = y; o.t0 = PD.state.time; o.dur = a.frames.length / a.fps; o.dead = false;
  },
  update: function () { var t = PD.state.time, L = pool.live; for (var i = 0; i < L.length; i++) if (t - L[i].t0 >= L[i].dur) L[i].dead = true; pool.sweep(); },
  clear: function () { pool.clear(); }
};
})();
