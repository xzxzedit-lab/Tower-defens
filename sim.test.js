// Логический тест без браузера: загружает модули в vm с заглушками DOM и прогоняет бой.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const store = {};
const el = () => ({ style: {}, textContent: '', disabled: false, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 384 }), getContext: () => new Proxy({}, { get: () => () => {}, set: () => true }) });
const sandbox = { console, Math, Date, JSON, setTimeout, clearTimeout, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  document: { getElementById: () => el(), createElement: () => el(), addEventListener() {}, readyState: 'complete', hidden: false } };
sandbox.window = sandbox; vm.createContext(sandbox);
const order = ['pd', '../assets/sprites/atlas', 'data/maps', 'data/towers', 'data/enemies', 'data/i18n', 'save', 'economy', 'enemies', 'towers', 'waves', 'physics', 'game', 'sprites', 'vfx'];
for (const f of order) vm.runInContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), sandbox, { filename: f });
const PD = sandbox.PD; let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const run = (sec) => { for (let i = 0; i < sec * 60; i++) PD.Game.tick(1 / 60); };

PD.Save.load(); PD.Game.init(0); const s = PD.state;
ok(s.gold === 120 && s.lives === 15 && s.wave === 0, 'старт: 120 монет, 15 жизней, волна 0');
// 1) цели по дистанции
const e1 = PD.Enemies.spawn('slime', 1), e2 = PD.Enemies.spawn('slime', 1); e1.dist = 100; e2.dist = 300;
PD.Path.at(s.path, e1.dist, e1); PD.Path.at(s.path, e2.dist, e2);
const mid = { x: (e1.x + e2.x) / 2, y: (e1.y + e2.y) / 2 };
const tw = { type: 'mage', x: mid.x, y: mid.y, level: 3, cool: 0 }; s.towers.push(tw);
PD.Physics.step(1 / 60);
ok(s.shots.live.length === 1 && s.shots.live[0].tid === e2.id, 'башня выбирает врага с большей пройденной дистанцией (не по сегменту)');
s.towers.length = 0; PD.Game.init(0);
// 2) строительство во время волны
const b1 = PD.Towers.build('archer', 6, 4); ok(typeof b1 === 'object' && s.gold === 70, 'постройка до волны списывает 50');
PD.Game.startWave(); run(1);
const b2 = PD.Towers.build('archer', 7, 4); ok(typeof b2 === 'object' && s.phase === 'wave', 'постройка во время волны работает');
ok(PD.Towers.build('archer', 4, 3) === 'cantBuild', 'на дороге строить нельзя');
ok(PD.Towers.build('archer', 6, 4) === 'occupied', 'на занятой клетке строить нельзя');
s.gold = 20; ok(PD.Towers.upgrade(b1) === 'noGold' && b1.level === 1, 'улучшение без денег отклоняется');
s.gold = 100; const g0 = s.gold; ok(PD.Towers.upgrade(b1) === 'upgraded' && s.gold === g0 - 40 && b1.level === 2, 'улучшение во время волны работает (-40, уровень 2)');
const g1 = s.gold; PD.Towers.sell(b2); ok(s.gold === g1 + 35 && s.towers.length === 1, 'продажа возвращает 70%');
// 3) боссы: считаем появления за всю партию
PD.Game.init(0); s.gold = 99999; s.lives = 99999;
for (const [c, r] of [[6,4],[6,6],[7,3],[11,4],[11,6],[12,5],[2,3],[2,7]]) { const t = PD.Towers.build('mage', c, r); if (typeof t === 'object') { t.level = 3; } }
const bossWaves = [], spawned = {}; const origSpawn = PD.Enemies.spawn;
PD.Enemies.spawn = function (k, w) { spawned[w] = spawned[w] || { slime: 0, boss: 0 }; spawned[w][k]++; return origSpawn.call(PD.Enemies, k, w); };
let guard = 0;
while (s.phase !== 'won' && s.phase !== 'lost' && guard++ < 200000) {
  if (s.phase === 'ready') PD.Game.startWave();
  PD.Game.tick(1 / 20);
}
for (const w in spawned) if (spawned[w].boss) bossWaves.push(+w);
ok(JSON.stringify(bossWaves) === '[10,15]', 'боссы только на волнах 10 и 15: ' + JSON.stringify(bossWaves));
ok(Object.values(spawned).every(x => x.boss <= 1), 'на волне максимум один босс');
ok(spawned[5] && spawned[5].boss === 0 && spawned[5].slime === 16, 'волна 5 без босса (баг прототипа исправлен), 16 врагов');
ok(s.phase === 'won' && s.wave === 15, 'партия завершается победой на волне 15');
// 4) пул: объекты переиспользуются
const created = s.shots.free.length + s.shots.live.length; ok(created < 400, 'снаряды берутся из пула (создано объектов: ' + created + ')');
// 5) сохранение
const d = PD.Save.get(); ok(d.completedMaps.includes('green-valley') && d.bestWave['green-valley'] === 15, 'победа сохранена в localStorage');
PD.Save.load(); ok(PD.Save.get().completedMaps.length === 1, 'после «перезагрузки» прогресс на месте');
store.pixel_defenders_save = '{bad json'; PD.Save.load(); ok(PD.Save.get().completedMaps.length === 0, 'испорченное сохранение не ломает игру');
store.pixel_defenders_save = JSON.stringify({ settings: { speed: 99 }, completedMaps: 'x', bestWave: { a: 'q' } }); PD.Save.load();
ok(PD.Save.get().settings.speed === 1 && PD.Save.get().completedMaps.length === 0, 'некорректные поля сохранения отбрасываются');
// 6) скорость и пауза
PD.Game.init(0); PD.Game.startWave(); run(1); const t1 = s.time; PD.Game.togglePause(true); run(1); ok(s.time === t1, 'пауза замораживает время');
PD.Game.togglePause(false); PD.Game.setSpeed(3); const t2 = s.time; run(1); ok(Math.abs((s.time - t2) - 3) < 0.1, 'скорость 3x даёт ~3 секунды симуляции на 1 с');
// 7) поражение
PD.Game.init(0); s.lives = 1; PD.Game.startWave(); run(60); ok(s.phase === 'lost', 'без башен базу пробивают: поражение');
PD.Game.startWave(); ok(s.phase === 'ready' && s.wave === 0, 'после поражения «Играть снова» перезапускает игру');

// 8) графика: декор, атлас, эффекты, направление врагов
PD.Game.init(0);
ok(PD.Towers.build('archer', 0, 0) === 'cantBuild' && PD.Towers.build('archer', 8, 0) === 'cantBuild', 'на деревьях и камнях строить нельзя');
ok(Object.values(PD.atlas.anims).every(a => a.frames.every(f => PD.atlas.frames[f])), 'каждый кадр каждой анимации есть в атласе (' + Object.keys(PD.atlas.anims).length + ' анимаций)');
const need = ['slime', 'goblin', 'skeleton', 'orc', 'wolf', 'knight', 'darkmage', 'golem', 'demon', 'boss'];
ok(need.every(k => PD.atlas.anims[k + '_walk'] && PD.atlas.anims[k + '_walk_l']), 'у всех 10 врагов есть анимации ходьбы в обе стороны');
ok(['archer', 'ice', 'mage', 'cannon', 'lightning', 'poison'].every(k => [1, 2, 3].every(l => PD.atlas.anims['tower_' + k + '_' + l + '_idle'] && PD.atlas.anims['tower_' + k + '_' + l + '_attack'])), 'у 6 башен × 3 уровней есть анимации покоя и атаки');
PD.Game.init(0); const calls = {}; const sp = PD.VFX.spawn; PD.VFX.spawn = function (n, x, y) { calls[n] = (calls[n] || 0) + 1; return sp.call(PD.VFX, n, x, y); };
PD.Towers.build('archer', 6, 4); PD.Game.startWave(); run(25); PD.VFX.spawn = sp;
ok(calls.fx_hit > 0 && calls.fx_puff > 0, 'эффекты реально создаются: попаданий ' + calls.fx_hit + ', смертей ' + calls.fx_puff);
ok(PD.VFX.live.length <= 60, 'эффекты ограничены пулом (сейчас активных: ' + PD.VFX.live.length + ')');
const t0 = s.towers[0]; ok(t0.fired > 0, 'башня запомнила время выстрела для анимации атаки');
const en = PD.Enemies.spawn('slime', 1); en.dist = 130; PD.Physics.step(1 / 60); ok(en.face === 1 || en.face === -1, 'враг получил направление взгляда');
console.log(fails ? '\nПРОВАЛЕНО: ' + fails : '\nВСЕ ПРОВЕРКИ ПРОШЛИ'); process.exit(fails ? 1 : 0);
