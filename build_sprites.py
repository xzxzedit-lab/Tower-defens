"""Генератор оригинальных пиксель-арт спрайтов PIXEL DEFENDERS -> assets/sprites/atlas.png + atlas.js
Запуск: python3 tools/build_sprites.py   (нужен Pillow). Всё рисуется кодом, референс-картинка не используется как ассет."""
import json, random, os
from PIL import Image, ImageDraw, ImageOps
ROOT = os.path.join(os.path.dirname(__file__), '..')
PAL = dict(out='#12141f', stone='#8791a3', stone_d='#5d6678', stone_l='#b4bccb', steel='#aab4c4', steel_d='#6b7689', wood='#a86c3a', wood_d='#6e4325',
  skin='#f0c08a', green='#3fa14a', green_d='#2a7035', gold='#f4c430', blue='#4aa3e8', ice='#9fe3ff', purple='#8a5ad6', purple_d='#5a3699', violet='#c9a6ff',
  red='#d63a3a', red_d='#8f2222', bone='#ece8d4', orange='#f08a24', yellow='#ffe066', white='#ffffff', cyan='#6ee7ff', slime='#79d34a', slime_d='#3f9a2e',
  poison='#9be22e', dark='#2b2540', iron='#3b4252', brown='#7a4a2a', gray='#8a8f99', gray_d='#5b606b', orc='#5e8f3a', orc_d='#3d6226', wolf='#8d8f99',
  navy='#2e4a9c', blue_d='#2c6fb0', grass='#4a9a4a', grass_d='#3f8a44', grass_l='#62b45a', sand='#c9a468', sand_d='#a98450', leaf='#2f7d45', leaf_d='#1f5a33', leaf_l='#58a85b')
def C(n): h = PAL.get(n, n); return tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) + (255,)
def mix(c, t, a): return tuple(int(c[i] * (1 - a) + t[i] * a) for i in range(3)) + (255,)
class S:
    def __init__(s, w, h): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); s.d = ImageDraw.Draw(s.im); s.w, s.h = w, h
    def r(s, x0, y0, x1, y1, c): s.d.rectangle([x0, y0, max(x0, x1 - 1), max(y0, y1 - 1)], fill=C(c))
    def e(s, x0, y0, x1, y1, c): s.d.ellipse([x0, y0, max(x0 + 1, x1 - 1), max(y0 + 1, y1 - 1)], fill=C(c))
    def p(s, pts, c): s.d.polygon(pts, fill=C(c))
    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.im.putpixel((x, y), C(c))
    def line(s, a, b, c, w=1): s.d.line([a, b], fill=C(c), width=w)
    def done(s, outline=True):  # подсветка сверху-слева, тень снизу-справа, затем контур
        px = s.im.load(); w, h = s.w, s.h; out = s.im.copy(); o = out.load()
        for y in range(h):
            for x in range(w):
                if px[x, y][3] == 0: continue
                up = y == 0 or px[x, y - 1][3] == 0; lf = x == 0 or px[x - 1, y][3] == 0
                dn = y == h - 1 or px[x, y + 1][3] == 0; rt = x == w - 1 or px[x + 1, y] [3] == 0
                if up or lf: o[x, y] = mix(px[x, y], (255, 255, 255), .28)
                elif dn or rt: o[x, y] = mix(px[x, y], (0, 0, 0), .28)
        if outline:
            f = out.copy(); fo = f.load(); oc = C('out')
            for y in range(h):
                for x in range(w):
                    if px[x, y][3]: continue
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3]: fo[x, y] = oc; break
            out = f
        return out
FR = {}; AN = {}
def add(name, im): FR[name] = im
def anim(name, frames, fps): AN[name] = {'frames': frames, 'fps': fps}

# ---------- БАШНИ 32x40 (низ спрайта = низ башни) ----------
def tbase(s, lv):
    s.r(5, 30, 27, 39, 'stone'); s.r(5, 30, 27, 32, 'stone_l'); s.r(5, 34, 27, 35, 'stone_d'); s.r(13, 32, 14, 34, 'stone_d'); s.r(20, 35, 21, 39, 'stone_d')
    s.r(5, 36, 27, 39, ['stone_d', 'steel', 'gold'][lv - 1])
    if lv >= 2: s.r(14, 31, 18, 34, 'blue' if lv == 2 else 'gold')
    if lv == 3: s.px(6, 37, 'yellow'); s.px(25, 37, 'yellow')
def flag(s, lv, x=6):
    if lv >= 2: s.r(x, 2, x + 1, 16, 'wood_d'); s.p([(x + 1, 2), (x + 8, 4), (x + 1, 8)], 'red' if lv == 2 else 'gold')
def t_archer(lv, fr):
    s = S(32, 40); tbase(s, lv); s.r(9, 19, 23, 31, 'wood'); s.r(9, 23, 23, 24, 'wood_d'); s.r(9, 28, 23, 29, 'wood_d'); s.r(7, 16, 25, 19, 'wood_d')
    for x in (7, 23): s.r(x, 12, x + 2, 16, 'wood')
    b = 1 if fr == 0 else 0; s.r(12, 13 + b, 20, 17, 'green_d'); s.e(12, 5 + b, 20, 14 + b, 'skin')
    s.p([(11, 10 + b), (16, 2 + b), (21, 10 + b), (19, 11 + b), (13, 11 + b)], 'green'); s.px(15, 8 + b, 'out'); s.px(18, 8 + b, 'out')
    s.d.arc([18, 3 + b, 29, 18 + b], 270, 90, fill=C('wood_d'), width=2); s.r(24, 5 + b, 25, 17 + b, 'white') if fr == 0 else s.r(27, 8, 28, 14, 'white')
    s.r(13, 9 + b, 27, 10 + b, 'bone') if fr == 0 else None; flag(s, lv); return s
def t_ice(lv, fr):
    s = S(32, 40); tbase(s, lv); main = 'ice' if fr == 0 else 'cyan'
    s.p([(9, 12), (12, 19), (11, 31), (5, 31)], 'blue'); s.p([(23, 13), (27, 21), (27, 31), (21, 31)], 'blue')
    s.p([(16, 1), (22, 11), (20, 31), (12, 31), (10, 11)], main); s.p([(16, 4), (18, 12), (16, 30), (14, 12)], 'white') if fr else s.r(15, 8, 17, 22, 'white')
    flag(s, lv, 25); return s
def t_mage(lv, fr):
    s = S(32, 40); tbase(s, lv); s.r(10, 17, 22, 31, 'stone'); s.r(10, 22, 22, 23, 'stone_d'); s.r(14, 24, 18, 29, 'dark')
    s.p([(16, 0), (23, 13), (9, 13)], 'purple'); s.r(7, 12, 25, 15, 'purple_d'); s.r(13, 6, 15, 8, 'gold')
    s.e(12, 15, 20, 23, 'violet' if fr == 0 else 'white'); s.px(14, 17, 'white'); flag(s, lv, 25); return s
def t_cannon(lv, fr):
    s = S(32, 40); tbase(s, lv); k = 2 if fr else 0
    s.r(8, 24, 26, 31, 'wood'); s.r(8, 29, 26, 31, 'wood_d'); s.e(6, 26, 15, 35, 'wood_d'); s.e(9, 29, 12, 32, 'steel')
    s.r(6 - k, 13, 24 - k, 23, 'steel_d'); s.r(6 - k, 13, 24 - k, 15, 'steel'); s.r(22 - k, 11, 27 - k, 25, 'steel')
    if fr: s.e(26, 10, 32, 24, 'orange'); s.e(28, 13, 32, 21, 'yellow')
    flag(s, lv, 4); return s
def t_lightning(lv, fr):
    s = S(32, 40); tbase(s, lv); s.r(11, 14, 21, 31, 'stone'); s.r(11, 19, 21, 20, 'stone_d'); s.r(15, 4, 17, 14, 'steel'); s.r(13, 22, 19, 28, 'dark')
    s.e(11, 0, 21, 9, 'cyan'); s.e(14, 2, 18, 6, 'white')
    pts = [(6, 6), (10, 3), (7, 10)] if fr == 0 else [(24, 8), (21, 2), (26, 12)]
    for a in pts: s.px(a[0], a[1], 'yellow'); s.px(a[0] + 1, a[1], 'white')
    if fr: s.line((8, 14), (12, 9), 'cyan'); s.line((24, 14), (20, 9), 'cyan')
    flag(s, lv, 25); return s
def t_poison(lv, fr):
    s = S(32, 40); tbase(s, lv); s.r(7, 28, 10, 31, 'iron'); s.r(22, 28, 25, 31, 'iron'); s.e(5, 15, 27, 32, 'dark'); s.e(5, 13, 27, 22, 'iron'); s.e(7, 14, 25, 21, 'poison')
    o = 0 if fr == 0 else 2; s.e(10, 9 - o, 14, 13 - o, 'slime'); s.e(18, 6 + o, 23, 11 + o, 'slime'); s.px(16, 4 + o, 'poison'); s.px(11, 16, 'white'); s.r(9, 22, 12, 25, 'gold') if lv > 1 else None
    flag(s, lv, 25); return s
TOWERS = dict(archer=t_archer, ice=t_ice, mage=t_mage, cannon=t_cannon, lightning=t_lightning, poison=t_poison)
for k, f in TOWERS.items():
    for lv in (1, 2, 3):
        for fr in (0, 1): add(f'tower_{k}_{lv}_{fr}', f(lv, fr).done())
        anim(f'tower_{k}_{lv}_idle', [f'tower_{k}_{lv}_0', f'tower_{k}_{lv}_0', f'tower_{k}_{lv}_1'][:2], 3)
        anim(f'tower_{k}_{lv}_attack', [f'tower_{k}_{lv}_1', f'tower_{k}_{lv}_0'], 14)

# ---------- ВРАГИ 24x24 (босс 40x40), 4 кадра ходьбы, лицом вправо ----------
def legs(s, f, x, y, c, n=2, gap=5):
    for i in range(n):
        ph = (f + i * 2) % 4; lift = 2 if ph in (1, 2) else 0; s.r(x + i * gap, y - lift, x + i * gap + 3, 23 - lift, c)
def e_slime(f):
    s = S(24, 24); sq = (0, 2, 0, -1)[f]; s.e(3 - sq // 2, 9 + sq, 21 + sq // 2, 23, 'slime'); s.e(6, 11 + sq, 12, 15 + sq, 'white') if False else None
    s.e(6, 11 + sq, 11, 15 + sq, 'white'); s.px(9, 13 + sq, 'out'); s.e(13, 11 + sq, 18, 15 + sq, 'white'); s.px(16, 13 + sq, 'out'); s.r(9, 18 + sq, 16, 19 + sq, 'slime_d'); return s
def e_goblin(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; legs(s, f, 8, 18, 'green_d'); s.r(7, 11 + b, 17, 19 + b, 'brown'); s.e(6, 2 + b, 18, 12 + b, 'green')
    s.p([(6, 6 + b), (1, 4 + b), (6, 9 + b)], 'green'); s.p([(18, 6 + b), (23, 4 + b), (18, 9 + b)], 'green'); s.px(10, 6 + b, 'yellow'); s.px(14, 6 + b, 'yellow'); s.r(19, 10 + b, 22, 18 + b, 'wood'); return s
def e_skeleton(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; legs(s, f, 8, 18, 'bone'); s.r(8, 11 + b, 16, 19 + b, 'bone'); s.r(9, 13 + b, 15, 14 + b, 'gray_d'); s.r(9, 16 + b, 15, 17 + b, 'gray_d')
    s.e(7, 1 + b, 17, 11 + b, 'bone'); s.r(9, 5 + b, 11, 8 + b, 'out'); s.r(13, 5 + b, 15, 8 + b, 'out'); s.r(18, 8 + b, 20, 20 + b, 'steel'); return s
def e_orc(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; legs(s, f, 6, 18, 'orc_d', 2, 7); s.r(5, 10 + b, 19, 19 + b, 'brown'); s.r(5, 10 + b, 19, 12 + b, 'steel_d'); s.e(6, 1 + b, 18, 12 + b, 'orc')
    s.px(9, 5 + b, 'red'); s.px(14, 5 + b, 'red'); s.r(8, 9 + b, 9, 12 + b, 'bone'); s.r(15, 9 + b, 16, 12 + b, 'bone'); s.r(19, 6 + b, 23, 8 + b, 'steel'); s.r(21, 8 + b, 22, 18 + b, 'wood'); return s
def e_wolf(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; s.e(3, 10 + b, 18, 19 + b, 'wolf'); s.e(14, 6 + b, 23, 15 + b, 'wolf'); s.p([(15, 7 + b), (16, 3 + b), (18, 7 + b)], 'gray_d'); s.px(20, 9 + b, 'yellow'); s.px(23, 12 + b, 'out')
    s.line((4, 12 + b), (0, 8 + b), 'wolf', 2)
    for i, x in enumerate((5, 8, 13, 16)): ph = (f + i) % 4; s.r(x, 18 + b - (2 if ph in (1, 2) else 0), x + 2, 23 - (2 if ph in (1, 2) else 0), 'gray_d')
    return s
def e_knight(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; legs(s, f, 8, 18, 'steel_d'); s.r(6, 10 + b, 18, 19 + b, 'steel'); s.e(7, 1 + b, 17, 11 + b, 'steel'); s.r(9, 5 + b, 17, 7 + b, 'out'); s.r(11, 0 + b, 13, 3 + b, 'red')
    s.p([(15, 11 + b), (23, 11 + b), (23, 17 + b), (19, 21 + b), (15, 17 + b)], 'blue'); s.r(18, 13 + b, 20, 18 + b, 'gold'); return s
def e_mage(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; s.p([(12, 9 + b), (20, 23), (4, 23)], 'purple_d'); s.e(8, 4 + b, 16, 12 + b, 'skin'); s.p([(12, 0 + b), (18, 7 + b), (6, 7 + b)], 'purple')
    s.px(10, 8 + b, 'cyan'); s.px(13, 8 + b, 'cyan'); s.r(19, 9 + b, 20, 20 + b, 'wood'); s.e(18, 6 + b, 22, 10 + b, 'cyan' if f % 2 == 0 else 'white'); return s
def e_golem(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; legs(s, f, 6, 18, 'gray_d', 2, 8); s.r(4, 8 + b, 20, 19 + b, 'gray'); s.r(7, 10 + b, 12, 14 + b, 'gray_d'); s.r(8, 1 + b, 16, 9 + b, 'gray')
    s.px(10, 4 + b, 'orange'); s.px(13, 4 + b, 'orange'); s.r(1, 9 + b, 5, 17 + b, 'gray_d'); s.r(19, 9 + b, 23, 17 + b, 'gray_d'); s.r(14, 11 + b, 17, 13 + b, 'leaf'); return s
def e_demon(f):
    s = S(24, 24); b = (0, 1, 0, 1)[f]; w = (0, 2, 0, -2)[f]
    s.p([(5, 10 + b), (0, 3 + b + w), (6, 5 + b)], 'red_d'); s.p([(19, 10 + b), (24, 3 + b + w), (18, 5 + b)], 'red_d'); legs(s, f, 8, 18, 'red_d')
    s.r(7, 10 + b, 17, 19 + b, 'red'); s.e(7, 2 + b, 17, 11 + b, 'red'); s.p([(7, 4 + b), (5, 0 + b), (10, 3 + b)], 'bone'); s.p([(17, 4 + b), (19, 0 + b), (14, 3 + b)], 'bone'); s.px(10, 6 + b, 'yellow'); s.px(14, 6 + b, 'yellow'); return s
def e_boss(f):
    s = S(40, 40); b = (0, 1, 0, 1)[f]; w = (0, 4, 0, -3)[f]
    s.p([(12, 18 + b), (2, 4 + b + w), (10, 8 + b), (20, 15 + b)], 'red_d'); s.p([(28, 18 + b), (38, 4 + b + w), (30, 8 + b), (20, 15 + b)], 'red_d')
    s.e(6, 14 + b, 30, 34 + b, 'red'); s.e(10, 22 + b, 26, 34 + b, 'orange'); s.line((6, 28 + b), (0, 34 + b), 'red', 3)
    s.e(24, 6 + b, 38, 19 + b, 'red'); s.p([(26, 7 + b), (25, 1 + b), (29, 6 + b)], 'bone'); s.p([(33, 6 + b), (35, 1 + b), (36, 8 + b)], 'bone'); s.px(33, 11 + b, 'yellow'); s.px(35, 11 + b, 'yellow')
    for i, x in enumerate((12, 22)): ph = (f + i * 2) % 4; s.r(x, 33 + b - (2 if ph in (1, 2) else 0), x + 4, 39 - (2 if ph in (1, 2) else 0), 'red_d')
    return s
ENEMIES = dict(slime=e_slime, goblin=e_goblin, skeleton=e_skeleton, orc=e_orc, wolf=e_wolf, knight=e_knight, darkmage=e_mage, golem=e_golem, demon=e_demon, boss=e_boss)
for k, f in ENEMIES.items():
    names, namesl = [], []
    for i in range(4):
        im = f(i).done(); add(f'{k}_walk_{i}', im); add(f'{k}_walk_{i}_l', ImageOps.mirror(im)); names.append(f'{k}_walk_{i}'); namesl.append(f'{k}_walk_{i}_l')
    anim(f'{k}_walk', names, 8); anim(f'{k}_walk_l', namesl, 8)

# ---------- СНАРЯДЫ И ЭФФЕКТЫ ----------
def shot(name, w, h, fn): s = S(w, h); fn(s); add(name, s.done())
shot('shot_archer', 12, 5, lambda s: (s.r(1, 2, 10, 3, 'wood'), s.p([(9, 0), (11, 2), (9, 4)], 'steel'), s.r(0, 1, 2, 4, 'bone')))
shot('shot_mage', 9, 9, lambda s: (s.e(1, 1, 8, 8, 'violet'), s.e(3, 3, 6, 6, 'white')))
shot('shot_cannon', 9, 9, lambda s: (s.e(1, 1, 8, 8, 'iron'), s.px(3, 3, 'steel')))
shot('shot_ice', 9, 9, lambda s: (s.p([(4, 0), (8, 4), (4, 8), (0, 4)], 'ice'), s.px(4, 4, 'white')))
shot('shot_poison', 9, 9, lambda s: (s.e(1, 1, 8, 8, 'poison'), s.px(3, 3, 'white')))
shot('shot_lightning', 9, 9, lambda s: (s.e(1, 1, 8, 8, 'cyan'), s.e(3, 3, 6, 6, 'white')))
def fx_hit(i):
    s = S(16, 16); r = (3, 5, 7)[i]; c = ('white', 'yellow', 'orange')[i]
    s.p([(8, 8 - r), (8 + r // 3, 8 - r // 3), (8 + r, 8), (8 + r // 3, 8 + r // 3), (8, 8 + r), (8 - r // 3, 8 + r // 3), (8 - r, 8), (8 - r // 3, 8 - r // 3)], c); return s
def fx_boom(i):
    s = S(32, 32); r = (6, 10, 14, 15)[i]; s.e(16 - r, 16 - r, 16 + r, 16 + r, ('yellow', 'orange', 'red', 'red_d')[i])
    if i < 3: q = r // 2; s.e(16 - q, 16 - q, 16 + q, 16 + q, 'white' if i == 0 else 'yellow')
    return s
def fx_puff(i):
    s = S(24, 24); r = (4, 7, 9, 10)[i]; c = ('white', 'steel', 'stone', 'stone_d')[i]
    for dx, dy in ((-4, 2), (4, 2), (0, -3), (0, 4)): s.e(12 + dx - r // 2, 12 + dy - r // 2, 12 + dx + r // 2, 12 + dy + r // 2, c)
    return s
for nm, fn, n in (('fx_hit', fx_hit, 3), ('fx_boom', fx_boom, 4), ('fx_puff', fx_puff, 4)):
    for i in range(n): add(f'{nm}_{i}', fn(i).done(outline=False))
    anim(nm, [f'{nm}_{i}' for i in range(n)], 16 if nm != 'fx_puff' else 10)

# ---------- ТАЙЛЫ И ДЕКОР ----------
rnd = random.Random(7)
def grass(v):
    s = S(32, 32); s.r(0, 0, 32, 32, 'grass')
    for _ in range(14): x, y = rnd.randrange(30), rnd.randrange(30); s.px(x, y, 'grass_l'); s.px(x + 1, y + 1, 'grass_d')
    for _ in range(v + 1): x, y = rnd.randrange(4, 28), rnd.randrange(4, 28); s.r(x, y - 2, x + 1, y + 1, 'grass_l'); s.px(x - 1, y - 1, 'grass_l')
    return s.im
for v in range(3): add(f'tile_grass_{v}', grass(v))
s = S(32, 32); s.r(0, 0, 32, 32, 'sand')
for _ in range(16): x, y = rnd.randrange(1, 30), rnd.randrange(1, 30); s.r(x, y, x + 2, y + 1, 'sand_d')
for _ in range(5): x, y = rnd.randrange(2, 28), rnd.randrange(2, 28); s.r(x, y, x + 2, y + 2, 'stone')
add('tile_path', s.im)
for nm, box in (('n', (0, 0, 32, 3)), ('s', (0, 29, 32, 32)), ('w', (0, 0, 3, 32)), ('e', (29, 0, 32, 32))):
    s = S(32, 32); s.r(*box, 'sand_d'); s.r(box[0], box[1], box[0] + (1 if nm in 'ns' and False else 0) or box[0] + 0, box[1] + 0, 'sand_d') if False else None; add(f'edge_{nm}', s.im)
s = S(32, 40); s.r(13, 24, 19, 38, 'wood'); s.r(13, 24, 15, 38, 'wood_d'); s.e(3, 10, 29, 32, 'leaf'); s.e(7, 3, 25, 22, 'leaf'); s.e(11, 0, 22, 12, 'leaf_l'); s.e(5, 16, 14, 26, 'leaf_l'); add('decor_tree', s.done())
s = S(32, 24); s.e(3, 7, 29, 23, 'gray'); s.e(8, 3, 24, 16, 'stone_l'); s.r(11, 8, 15, 10, 'white'); add('decor_rock', s.done())
s = S(16, 16); s.r(7, 6, 9, 15, 'leaf_d'); s.r(3, 8, 5, 15, 'leaf'); s.r(11, 9, 13, 15, 'leaf'); add('decor_tuft', s.done(False))
s = S(16, 16); s.r(7, 8, 9, 15, 'leaf'); s.e(5, 3, 11, 9, 'yellow'); s.e(7, 5, 9, 7, 'orange'); add('decor_flower', s.done(False))

# ---------- УПАКОВКА ----------
names = list(FR); W = 512; x = y = rowh = 0; pos = {}
order = sorted(names, key=lambda n: -FR[n].size[1])
for n in order:
    w, h = FR[n].size
    if x + w > W: x = 0; y += rowh; rowh = 0
    pos[n] = [x, y, w, h]; x += w; rowh = max(rowh, h)
H = y + rowh; atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for n, (px_, py_, w, h) in pos.items(): atlas.paste(FR[n], (px_, py_))
out = os.path.join(ROOT, 'assets', 'sprites'); os.makedirs(out, exist_ok=True)
atlas.save(os.path.join(out, 'atlas.png'))
open(os.path.join(out, 'atlas.js'), 'w', encoding='utf-8').write('/* Сгенерировано tools/build_sprites.py — не править вручную */\nPD.atlas = ' + json.dumps({'frames': pos, 'anims': AN}, separators=(',', ':')) + ';\n')
# контактный лист для просмотра (x3)
sheet = Image.new('RGBA', (W * 3, H * 3), (36, 44, 66, 255)); sheet.alpha_composite(atlas.resize((W * 3, H * 3), Image.NEAREST))
os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True); sheet.save(os.path.join(ROOT, 'docs', 'sprite_sheet_preview.png'))
print('кадров:', len(FR), 'анимаций:', len(AN), 'атлас:', atlas.size)
