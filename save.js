(function () {
var KEY = 'pixel_defenders_save', VERSION = 1, data = null;
function defaults() { return { schemaVersion: VERSION, savedAt: 0, completedMaps: [], bestWave: {}, totalKills: 0, settings: { speed: 1 } }; }
function num(v, d) { return typeof v === 'number' && isFinite(v) ? v : d; }
function sanitize(raw) {
  var d = defaults();
  if (!raw || typeof raw !== 'object') return d;
  if (Array.isArray(raw.completedMaps)) d.completedMaps = raw.completedMaps.filter(function (x) { return typeof x === 'string'; });
  if (raw.bestWave && typeof raw.bestWave === 'object') for (var k in raw.bestWave) d.bestWave[k] = num(raw.bestWave[k], 0);
  d.totalKills = num(raw.totalKills, 0); d.savedAt = num(raw.savedAt, 0);
  if (raw.settings) { var sp = num(raw.settings.speed, 1); d.settings.speed = (sp === 1 || sp === 2 || sp === 3) ? sp : 1; }
  return d;
}
PD.Save = {
  load: function () {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
    data = sanitize(raw); return data;
  },
  get: function () { return data || this.load(); },
  flush: function () {
    var d = this.get(); d.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
  },
  recordWave: function (mapId, wave) { var d = this.get(); if (wave > (d.bestWave[mapId] || 0)) d.bestWave[mapId] = wave; this.flush(); },
  markComplete: function (mapId) { var d = this.get(); if (d.completedMaps.indexOf(mapId) < 0) d.completedMaps.push(mapId); this.flush(); },
  addKills: function (n) { this.get().totalKills += n; },
  setSpeed: function (s) { this.get().settings.speed = s; this.flush(); },
  reset: function () { data = defaults(); this.flush(); }
};
})();
