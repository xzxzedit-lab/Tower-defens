"""Смоук-тест в настоящем Chromium: открывает index.html с file://, жмёт кнопки, строит башни, ловит ошибки консоли."""
import sys, pathlib
from playwright.sync_api import sync_playwright
url = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri()
errors, fails = [], 0
def ok(c, m):
    global fails; print(('PASS ' if c else 'FAIL ') + m); fails += (not c)
def txt(pg, i): return pg.inner_text('#' + i)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, ctxargs in [('десктоп 1280x720', dict(viewport={'width':1280,'height':720})),
                          ('телефон 360x640 (touch)', dict(viewport={'width':360,'height':640}, has_touch=True, is_mobile=True))]:
        print('==', name)
        c = b.new_context(**ctxargs); pg = c.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        pg.goto(url); pg.wait_for_timeout(300)
        ok(txt(pg,'gold') == '120' and txt(pg,'lives') == '15' and txt(pg,'wave') == '0/15', 'HUD при старте: 120 / 15 / 0/15')
        box = pg.locator('#game').bounding_box(); sx, sy = box['width']/640, box['height']/384
        def tap(col, row):
            x, y = box['x'] + (col*32+16)*sx, box['y'] + (row*32+16)*sy
            pg.touchscreen.tap(x, y) if 'телефон' in name else pg.mouse.click(x, y); pg.wait_for_timeout(60)
        ok(pg.evaluate('PD.Sprites.ready && PD.Sprites.img.naturalWidth > 0'), 'атлас спрайтов загружен с file://')
        tap(6, 4); ok(txt(pg,'gold') == '70', 'тап по траве строит лучницу (-50)')
        tap(0, 0); ok(txt(pg,'gold') == '70', 'тап по дереву ничего не строит')
        tap(4, 3); ok(txt(pg,'gold') == '70', 'тап по дороге ничего не строит')
        pg.click('#mage'); tap(7, 4); ok(txt(pg,'gold') == '70' and 'Недостаточно' in txt(pg,'toast'), 'маг (75) при 70 монетах отклоняется с сообщением')
        pg.click('#start'); pg.wait_for_timeout(200)
        ok(txt(pg,'wave') == '1/15' and pg.is_disabled('#start'), 'старт волны: 1/15, кнопка заблокирована')
        pg.click('#speed'); ok(txt(pg,'speed') == '2x', 'кнопка скорости: 2x')
        pg.click('#pause'); ok(txt(pg,'pause') == 'Продолжить', 'пауза включается')
        pg.click('#pause'); pg.wait_for_timeout(3500)
        ok(pg.evaluate('PD.state.time') > 0.5 and pg.evaluate('PD.state.enemies.live.length') > 0, 'симуляция идёт после снятия паузы (есть время и враги)')
        pg.evaluate("(function(){PD.state.gold=500;PD.Towers.build('archer',5,6);PD.Towers.build('mage',10,6);PD.Towers.build('archer',8,4);PD.Towers.build('mage',13,6);PD.Towers.upgrade(PD.state.towers[1]);})()"); pg.wait_for_timeout(3500)
        pg.screenshot(path=f'/home/claude/battle_{"phone" if "телефон" in name else "desktop"}.png')
        pg.click('#restart'); ok(txt(pg,'gold') == '120' and txt(pg,'wave') == '0/15', 'Заново сбрасывает игру')
        tap(6, 4); pg.reload(); pg.wait_for_timeout(300)
        ok(txt(pg,'speed') == '2x', 'скорость 2x сохранилась после перезагрузки страницы')
        pg.screenshot(path=f'/home/claude/shot_{"phone" if "телефон" in name else "desktop"}.png'); c.close()
    b.close()
ok(not errors, 'ошибок консоли нет' + ('' if not errors else ': ' + '; '.join(errors[:3])))
print('\nПРОВАЛЕНО: %d' % fails if fails else '\nВСЕ ПРОВЕРКИ ПРОШЛИ'); sys.exit(1 if fails else 0)
