(function () {
PD.Waves = {
  isBossWave: function (map, w) { return w === map.waves || w % map.bossEvery === 0; },
  normalCount: function (w) { return 6 + w * 2; },
  start: function (w) {
    var s = PD.state, boss = this.isBossWave(s.map, w);
    s.bossWave = boss; s.spawnLeft = this.normalCount(w) + (boss ? 1 : 0); s.spawnTimer = 0.1;
    if (boss) PD.bus.emit('toast', 'bossComing');
  },
  // Босс появляется ровно один раз — последним в волне
  update: function (dt) {
    var s = PD.state;
    if (s.spawnLeft <= 0) return;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      PD.Enemies.spawn(s.bossWave && s.spawnLeft === 1 ? 'boss' : 'slime', s.wave);
      s.spawnLeft--; s.spawnTimer = 0.85;
    }
  }
};
})();
