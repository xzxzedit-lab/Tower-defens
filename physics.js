(function () {
PD.Path = {
  build: function (tiles) {
    var T = PD.TILE, pts = [], cum = [0], i;
    for (i = 0; i < tiles.length; i++) pts.push({ x: tiles[i][0] * T + T / 2, y: tiles[i][1] * T + T / 2 });
    for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return { pts: pts, cum: cum, total: cum[cum.length - 1] };
  },
  // Позиция по пройденной дистанции, пишет в out.x/out.y (без новых объектов)
  at: function (p, d, out) {
    var n = p.pts.length, i = 1;
    if (d <= 0) { out.x = p.pts[0].x; out.y = p.pts[0].y; return out; }
    if (d >= p.total) { out.x = p.pts[n - 1].x; out.y = p.pts[n - 1].y; return out; }
    while (i < n - 1 && p.cum[i] < d) i++;
    var a = p.pts[i - 1], b = p.pts[i], t = (d - p.cum[i - 1]) / (p.cum[i] - p.cum[i - 1]);
    out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t; return out;
  },
  onCell: function (path, c, r) {
    for (var i = 0; i < path.length - 1; i++) {
      var ax = path[i][0], ay = path[i][1], bx = path[i + 1][0], by = path[i + 1][1];
      if (ax === bx && c === ax && r >= Math.min(ay, by) && r <= Math.max(ay, by)) return true;
      if (ay === by && r === ay && c >= Math.min(ax, bx) && c <= Math.max(ax, bx)) return true;
    }
    return false;
  }
};

PD.Physics = {
  step: function (dt) {
    var s = PD.state, E = s.enemies.live, S = s.shots.live, i, j, e, t, sh;
    // движение врагов по пройденной дистанции
    for (i = 0; i < E.length; i++) {
      e = E[i]; if (e.dead) continue;
      var ox = e.x; e.dist += e.speed * dt;
      if (e.dist >= s.path.total) { e.dead = true; PD.Game.baseHit(); } else { PD.Path.at(s.path, e.dist, e); if (e.x !== ox) e.face = e.x < ox ? -1 : 1; }
    }
    // башни: цель = враг в радиусе с наибольшей пройденной дистанцией
    for (j = 0; j < s.towers.length; j++) {
      t = s.towers[j]; t.cool -= dt; if (t.cool > 0) continue;
      var st = PD.Towers.stats(t), r2 = st.range * st.range, best = null, bd = -1;
      for (i = 0; i < E.length; i++) {
        e = E[i]; if (e.dead) continue;
        var dx = e.x - t.x, dy = e.y - t.y;
        if (dx * dx + dy * dy <= r2 && e.dist > bd) { best = e; bd = e.dist; }
      }
      if (best) {
        sh = s.shots.get(); sh.x = t.x; sh.y = t.y; sh.tx = best.x; sh.ty = best.y; sh.target = best; sh.tid = best.id;
        sh.damage = st.damage; sh.kind = t.type; t.fired = s.time; sh.color = PD.data.towers[t.type].shot; sh.dead = false; t.cool = st.rate;
      }
    }
    // снаряды: летят к цели; если цель погибла — к последней точке и исчезают
    for (i = 0; i < S.length; i++) {
      sh = S[i]; if (sh.dead) continue;
      var tg = sh.target, alive = tg && tg.id === sh.tid && !tg.dead;
      if (alive) { sh.tx = tg.x; sh.ty = tg.y; }
      var ddx = sh.tx - sh.x, ddy = sh.ty - sh.y, d = Math.hypot(ddx, ddy) || 1, stp = PD.data.shotSpeed * dt;
      if (d < stp + 4) {
        sh.dead = true;
        if (alive) { tg.hp -= sh.damage; if (PD.VFX) PD.VFX.spawn('fx_hit', tg.x, tg.y - 4); if (tg.hp <= 0) PD.Game.kill(tg); }
      } else { sh.x += ddx / d * stp; sh.y += ddy / d * stp; }
    }
    s.enemies.sweep(); s.shots.sweep();
  }
};
})();
