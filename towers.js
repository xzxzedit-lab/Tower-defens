// Башни. Числа перенесены из прототипа (масштаб 40px -> 32px = x0.8). Уровни считаются из base.
(function () {
var T = {
  archer: { id: 'archer', name: 'Лучница', cost: 50, color: '#d6a56a', shot: '#fde68a', base: { damage: 10, range: 84, rate: 0.55 } },
  mage:   { id: 'mage',   name: 'Маг',      cost: 75, color: '#a78bfa', shot: '#c4b5fd', base: { damage: 18, range: 100, rate: 0.95 } }
};
var UP = { cost: 40, damage: 1.55, range: 10, rate: 0.88, maxLevel: 3 };
Object.keys(T).forEach(function (k) {
  var t = T[k], d = t.base.damage, r = t.base.range, s = t.base.rate; t.levels = [];
  for (var i = 0; i < UP.maxLevel; i++) { t.levels.push({ damage: d, range: r, rate: s }); d *= UP.damage; r += UP.range; s *= UP.rate; }
});
PD.data.towers = T; PD.data.towerOrder = ['archer', 'mage']; PD.data.towerUpgrade = UP;
})();
