(function () {
PD.Input = {
  init: function (canvas) {
    canvas.addEventListener('pointerdown', function (ev) {
      var s = PD.state, r = canvas.getBoundingClientRect();
      var x = (ev.clientX - r.left) * PD.W / r.width, y = (ev.clientY - r.top) * PD.H / r.height;
      var c = Math.floor(x / PD.TILE), row = Math.floor(y / PD.TILE);
      if (s.phase === 'won' || s.phase === 'lost' || s.paused) return;
      var hit = PD.Towers.at(c, row);
      if (hit) { s.selected = hit; PD.bus.emit('hud'); return; }
      var res = PD.Towers.build(s.buildType, c, row);
      if (typeof res === 'string') { s.selected = null; PD.bus.emit('toast', res); PD.bus.emit('hud'); }
    });
  }
};
})();
