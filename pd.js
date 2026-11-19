(function () {
'use strict';
var PD = window.PD = window.PD || {};
PD.TILE = 32; PD.COLS = 20; PD.ROWS = 12; PD.W = 640; PD.H = 384; PD.STEP = 1 / 60;
PD.data = {}; PD.state = null; PD.lang = 'ru';
var h = {};
PD.bus = {
  on: function (e, f) { (h[e] || (h[e] = [])).push(f); },
  emit: function (e, a, b) { var l = h[e]; if (l) for (var i = 0; i < l.length; i++) l[i](a, b); }
};
// Пул объектов: get() берёт из свободных, sweep() возвращает отмеченные dead
PD.Pool = function (make) { this.make = make; this.free = []; this.live = []; };
PD.Pool.prototype.get = function () { var o = this.free.pop() || this.make(); this.live.push(o); return o; };
PD.Pool.prototype.sweep = function () {
  var l = this.live, n = 0;
  for (var i = 0; i < l.length; i++) { var o = l[i]; if (o.dead) this.free.push(o); else l[n++] = o; }
  l.length = n;
};
PD.Pool.prototype.clear = function () {
  for (var i = 0; i < this.live.length; i++) { this.live[i].dead = true; this.free.push(this.live[i]); }
  this.live.length = 0;
};
PD.t = function (k) { var d = PD.i18n && (PD.i18n[PD.lang] || PD.i18n.ru); return d && d[k] !== undefined ? d[k] : k; };
})();
