(function () {
var $ = function (id) { return document.getElementById(id); }, toastT;
function toast(key, n) {
  var el = $('toast'); el.textContent = PD.t(key) + (n !== undefined ? n : ''); el.style.display = 'block';
  clearTimeout(toastT); toastT = setTimeout(function () { el.style.display = 'none'; }, 1600);
}
function refresh() {
  var s = PD.state, U = PD.data.towerUpgrade, sel = s.selected, over = s.phase === 'won' || s.phase === 'lost';
  $('gold').textContent = s.gold; $('lives').textContent = s.lives; $('wave').textContent = s.wave + '/' + s.map.waves;
  $('archer').style.outline = s.buildType === 'archer' ? '3px solid #fff' : 'none'; $('mage').style.outline = s.buildType === 'mage' ? '3px solid #fff' : 'none';
  $('archer').disabled = $('mage').disabled = over;
  $('upgrade').textContent = PD.t('upgrade') + ' (' + U.cost + ')';
  $('upgrade').disabled = !sel || over || sel.level >= U.maxLevel || s.gold < U.cost;
  $('sell').textContent = PD.t('sell') + (sel ? ' (+' + PD.Economy.sellValue(sel) + ')' : ''); $('sell').disabled = !sel || over;
  $('start').textContent = over ? PD.t('playAgain') : s.phase === 'wave' ? PD.t('waveRunning') : s.wave === 0 ? PD.t('startWave') : PD.t('nextWave');
  $('start').disabled = s.phase === 'wave';
  $('pause').textContent = s.paused ? PD.t('resume') : PD.t('pause'); $('pause').disabled = over;
  $('speed').textContent = s.speed + 'x';
}
PD.UI = {
  init: function () {
    $('archer').onclick = function () { PD.state.buildType = 'archer'; toast('archerSel'); refresh(); };
    $('mage').onclick = function () { PD.state.buildType = 'mage'; toast('mageSel'); refresh(); };
    $('start').onclick = function () { PD.Game.startWave(); };
    $('upgrade').onclick = function () { var r = PD.Towers.upgrade(PD.state.selected); if (r) toast(r); };
    $('sell').onclick = function () { var r = PD.Towers.sell(PD.state.selected); if (r) toast(r); };
    $('pause').onclick = function () { PD.Game.togglePause(); };
    $('speed').onclick = function () { PD.Game.cycleSpeed(); };
    $('restart').onclick = function () { PD.Game.restart(); };
    $('hint').textContent = PD.t('hint');
    PD.bus.on('hud', refresh);
    PD.bus.on('toast', function (k, n) { toast(k, n); });
    refresh();
  }
};
})();
