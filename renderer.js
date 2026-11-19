(function () {
var ctx, bg, bgCtx, T = 32, S;
function buildBackground() {
  var s = PD.state, c = bgCtx, p = s.map.path, r, k, i, on;
  if (!S.ready) { // запасной вариант без спрайтов
    for (r = 0; r < PD.ROWS; r++) for (k = 0; k < PD.COLS; k++) { c.fillStyle = PD.Path.onCell(p, k, r) ? '#b08a55' : ((r + k) % 2 ? '#397b48' : '#347344'); c.fillRect(k * T, r * T, T, T); }
    return;
  }
  var dirs = [['n', 0, -1], ['s', 0, 1], ['w', -1, 0], ['e', 1, 0]];
  for (r = 0; r < PD.ROWS; r++) for (k = 0; k < PD.COLS; k++) {
    on = PD.Path.onCell(p, k, r);
    if (on) { S.draw(c, 'tile_path', k * T, r * T); for (i = 0; i < 4; i++) if (!PD.Path.onCell(p, k + dirs[i][1], r + dirs[i][2])) S.draw(c, 'edge_' + dirs[i][0], k * T, r * T); }
    else {
      S.draw(c, 'tile_grass_' + ((k * 7 + r * 13) % 3), k * T, r * T); var h = (k * 31 + r * 17) % 23;
      if (!s.blocked[r * PD.COLS + k]) { if (h === 0) S.draw(c, 'decor_tuft', k * T + 8, r * T + 12); else if (h === 1) S.draw(c, 'decor_flower', k * T + 10, r * T + 10); }
    }
  }
  var dec = (s.map.decor || []).slice().sort(function (a, b) { return a[2] - b[2]; });
  for (i = 0; i < dec.length; i++) { var d = dec[i], f = S.size('decor_' + d[0]); S.draw(c, 'decor_' + d[0], d[1] * T, d[2] * T + T - f[3]); }
}
function banner(text, sub, color) {
  ctx.fillStyle = '#0f172add'; ctx.fillRect(0, 0, PD.W, PD.H); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = 'bold 30px monospace'; ctx.fillText(text, PD.W / 2, PD.H / 2 - 8);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '15px monospace'; ctx.fillText(sub, PD.W / 2, PD.H / 2 + 24);
}
PD.Renderer = {
  init: function (canvas) {
    S = PD.Sprites; ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    bg = document.createElement('canvas'); bg.width = PD.W; bg.height = PD.H; bgCtx = bg.getContext('2d'); bgCtx.imageSmoothingEnabled = false; buildBackground();
  },
  rebuild: function () { buildBackground(); },
  draw: function () {
    var s = PD.state, i, t, e, E = s.enemies.live, sh, name, a, f;
    ctx.drawImage(bg, 0, 0);
    if (s.selected) { var st = PD.Towers.stats(s.selected); ctx.strokeStyle = '#fef08a99'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.selected.x, s.selected.y, st.range, 0, 6.2832); ctx.stroke(); }
    for (i = 0; i < s.towers.length; i++) {
      t = s.towers[i];
      if (t === s.selected) { ctx.fillStyle = '#fef08a66'; ctx.fillRect(t.x - 15, t.y + 8, 30, 7); }
      if (S.ready) {
        a = s.time - t.fired < 0.22; name = S.frame('tower_' + t.type + '_' + t.level + (a ? '_attack' : '_idle'), a ? s.time - t.fired : s.time + t.c * 0.3);
        S.draw(ctx, name, t.x - 16, t.y + 14 - 40);
      } else { ctx.fillStyle = PD.data.towers[t.type].color; ctx.fillRect(t.x - 10, t.y - 10, 20, 20); }
    }
    for (i = 0; i < E.length; i++) {
      e = E[i]; if (e.dead) continue;
      var top = e.y - e.size - 4, base = e.y + e.size - 1;
      if (S.ready) {
        name = S.frame(e.key + '_walk' + (e.face < 0 ? '_l' : ''), s.time + e.id * 0.37); f = S.size(name); base = e.y + (f[3] >> 1) - 2; top = base - f[3];
        ctx.fillStyle = '#0000004d'; ctx.fillRect(e.x - (f[2] >> 2), base - 1, f[2] >> 1, 3); S.draw(ctx, name, e.x - (f[2] >> 1), top);
      } else { ctx.fillStyle = e.color; ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2); }
      var bw = e.boss ? 30 : 18; ctx.fillStyle = '#111827'; ctx.fillRect(e.x - bw / 2, top - 5, bw, 3); ctx.fillStyle = e.hp / e.maxHp > 0.4 ? '#4ade80' : '#ef4444'; ctx.fillRect(e.x - bw / 2, top - 5, bw * Math.max(0, e.hp / e.maxHp), 3);
    }
    var Sh = s.shots.live;
    for (i = 0; i < Sh.length; i++) {
      sh = Sh[i];
      if (!S.ready) { ctx.fillStyle = sh.color; ctx.fillRect(sh.x - 3, sh.y - 3, 6, 6); continue; }
      if (sh.kind === 'archer') S.drawRot(ctx, 'shot_archer', sh.x, sh.y, Math.atan2(sh.ty - sh.y, sh.tx - sh.x)); else S.draw(ctx, 'shot_' + sh.kind, sh.x - 4, sh.y - 4);
    }
    if (S.ready && PD.VFX) { var V = PD.VFX.live; for (i = 0; i < V.length; i++) { name = S.frame(V[i].name, s.time - V[i].t0); f = S.size(name); S.draw(ctx, name, V[i].x - (f[2] >> 1), V[i].y - (f[3] >> 1)); } }
    if (s.phase === 'ready' && s.wave === 0) { ctx.fillStyle = '#0f172acc'; ctx.fillRect(0, 6, PD.W, 26); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 14px monospace'; ctx.fillText('PIXEL DEFENDERS — ' + s.map.name, PD.W / 2, 24); }
    if (s.phase === 'lost') banner('ИГРА ОКОНЧЕНА', 'Нажми «Играть снова»', '#fecaca');
    else if (s.phase === 'won') banner('ПОБЕДА!', 'Карта пройдена. Нажми «Играть снова»', '#bbf7d0');
    else if (s.paused) banner('ПАУЗА', 'Нажми «Продолжить»', '#fde68a');
  }
};
})();
