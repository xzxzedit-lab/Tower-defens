(function () {
var acc = 0;
PD.Game = {
  init: function (mapIdx) {
    var map = PD.data.maps[mapIdx || 0], s = PD.state;
    if (!s) s = PD.state = { enemies: PD.Enemies.newPool(), shots: new PD.Pool(function () { return { x: 0, y: 0, tx: 0, ty: 0, target: null, tid: 0, damage: 0, color: '', kind: '', dead: true }; }), towers: [] };
    s.mapIdx = mapIdx || 0; s.map = map; s.path = PD.Path.build(map.path);
    s.gold = map.startGold; s.lives = map.lives; s.wave = 0; s.phase = 'ready'; s.paused = false; s.time = 0;
    s.spawnLeft = 0; s.spawnTimer = 0; s.bossWave = false; s.selected = null; s.buildType = s.buildType || 'archer';
    s.speed = PD.Save.get().settings.speed; s.kills = 0;
    s.enemies.clear(); s.shots.clear(); s.towers.length = 0; acc = 0; if (PD.VFX) PD.VFX.clear();
    s.blocked = new Uint8Array(PD.COLS * PD.ROWS); (map.decor || []).forEach(function (d) { s.blocked[d[2] * PD.COLS + d[1]] = 1; });
    PD.bus.emit('hud'); return s;
  },
  startWave: function () {
    var s = PD.state;
    if (s.phase === 'lost' || s.phase === 'won') return this.restart();
    if (s.phase !== 'ready') return;
    s.wave++; s.phase = 'wave'; PD.Waves.start(s.wave); PD.bus.emit('hud');
  },
  restart: function () { this.init(PD.state.mapIdx); },
  setSpeed: function (v) { PD.state.speed = v; PD.Save.setSpeed(v); PD.bus.emit('hud'); },
  cycleSpeed: function () { var s = PD.state; this.setSpeed(s.speed >= 3 ? 1 : s.speed + 1); },
  togglePause: function (force) { var s = PD.state; s.paused = typeof force === 'boolean' ? force : !s.paused; PD.bus.emit('hud'); },
  baseHit: function () {
    var s = PD.state; s.lives--; PD.bus.emit('hud');
    if (s.lives <= 0 && s.phase === 'wave') this.finish('lost');
  },
  kill: function (e) { var s = PD.state; e.dead = true; s.kills++; if (PD.VFX) PD.VFX.spawn('fx_puff', e.x, e.y); PD.Economy.earn(e.reward); },
  finish: function (phase) {
    var s = PD.state; s.phase = phase; s.spawnLeft = 0;
    PD.Save.addKills(s.kills); s.kills = 0; PD.Save.recordWave(s.map.id, phase === 'won' ? s.wave : s.wave - 1);
    if (phase === 'won') PD.Save.markComplete(s.map.id);
    PD.bus.emit('toast', phase); PD.bus.emit('hud');
  },
  waveCleared: function () {
    var s = PD.state, bonus = PD.data.economy.waveBonus;
    PD.Economy.earn(bonus); PD.Save.recordWave(s.map.id, s.wave);
    if (s.wave >= s.map.waves) { this.finish('won'); return; }
    s.phase = 'ready'; PD.bus.emit('toast', 'waveDone', bonus); PD.bus.emit('hud');
  },
  step: function () {
    var s = PD.state;
    PD.Waves.update(PD.STEP); PD.Physics.step(PD.STEP); s.time += PD.STEP; if (PD.VFX) PD.VFX.update();
    if (s.phase === 'wave' && s.spawnLeft === 0 && s.enemies.live.length === 0) this.waveCleared();
  },
  // Фиксированный шаг 1/60; ускорение = больше шагов за кадр, а не больший dt
  tick: function (dt) {
    var s = PD.state;
    if (s.paused || s.phase === 'won' || s.phase === 'lost') return;
    acc += Math.min(dt, 0.1) * s.speed; if (acc > 0.3) acc = 0.3;
    while (acc >= PD.STEP) { acc -= PD.STEP; this.step(); if (s.phase !== 'wave' && s.phase !== 'ready') break; }
  }
};
})();
