(function () {
PD.Economy = {
  canAfford: function (n) { return PD.state.gold >= n; },
  spend: function (n) { if (PD.state.gold < n) return false; PD.state.gold -= n; PD.bus.emit('hud'); return true; },
  earn: function (n) { PD.state.gold += n; PD.bus.emit('hud'); },
  sellValue: function (t) { return Math.floor(t.invested * PD.data.economy.sellRate); }
};
})();
