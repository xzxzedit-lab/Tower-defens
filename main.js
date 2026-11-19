(function () {
function boot() {
  var canvas = document.getElementById('game');
  PD.Save.load(); PD.Game.init(0); PD.Renderer.init(canvas); PD.Input.init(canvas); PD.UI.init(); PD.Sprites.load(function () { PD.Renderer.rebuild(); });
  var last = 0;
  function loop(ts) { var dt = (ts - last) / 1000 || 0; last = ts; PD.Game.tick(dt); PD.Renderer.draw(); requestAnimationFrame(loop); }
  document.addEventListener('visibilitychange', function () { if (document.hidden && PD.state.phase === 'wave') PD.Game.togglePause(true); });
  requestAnimationFrame(loop);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
