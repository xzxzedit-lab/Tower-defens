# SKILLS — команда разработки PIXEL DEFENDERS

12 навыков для Claude Code лежат в `.claude/skills/<имя>/SKILL.md`. Claude Code подхватывает их из папки проекта автоматически: запускайте его из корня `pixel-defenders/`.

Общие технические соглашения (скрипты через `PD`-неймспейс, структура файлов, 640×384, фиксированный шаг) описаны один раз в `game-architect`. Остальные навыки ссылаются на него.

## Навыки

| Skill | За что отвечает |
|---|---|
| `game-architect` | Структура файлов, модули, порядок загрузки, решения, план этапов, аудит кода |
| `tower-defense-designer` | Механики, башни, враги, волны, боссы, 10 карт, испытания |
| `javascript-game-developer` | Код: цикл, ввод, системы, сцены, исправление багов |
| `game-physics` | Движение, выбор цели, снаряды, урон, эффекты статусов, шаг времени |
| `pixel-art-artist` | Палитра, спрайты, тайлы, иконки, сборка атласов |
| `sprite-animation` | Кадры, состояния, формат `atlas.json`, проигрыватель анимаций |
| `game-ui-designer` | Меню, HUD, окна, касания, тексты ru/en |
| `game-vfx-designer` | Огонь, лёд, яд, молнии, взрывы, частицы, победа |
| `game-economy` | Цены, награды, прогрессия, ежедневные награды, баланс, лимиты рекламы |
| `yandex-games-integration` | SDK, сохранения, реклама, покупки, лидерборды, релизный архив |
| `game-qa-tester` | Проверки, баг-репорты, регрессия, готовность функций |
| `game-performance` | FPS, память, пулы, предрендер, загрузка, размер архива |

## Какой skill для какой задачи

| Задача | Skills (в порядке работы) |
|---|---|
| Начать этап / разобрать код | `game-architect` → профильные → `game-qa-tester` |
| Перенести прототип в модули | `game-architect` → `javascript-game-developer` → `game-qa-tester` |
| Новая башня | `tower-defense-designer` → `game-economy` → `pixel-art-artist` → `sprite-animation` → `game-vfx-designer` → `javascript-game-developer` → `game-qa-tester` |
| Новый враг или босс | `tower-defense-designer` → `game-economy` → `pixel-art-artist` → `sprite-animation` → `javascript-game-developer` → `game-qa-tester` |
| Новая карта | `tower-defense-designer` → `pixel-art-artist` → `game-ui-designer` → `game-economy` → `game-qa-tester` |
| Баланс «слишком легко/тяжело» | `game-economy` → `tower-defense-designer` → `game-qa-tester` |
| Снаряды, урон, замедление, цепная молния | `game-physics` → `javascript-game-developer` → `game-qa-tester` |
| Новый экран или кнопка | `game-ui-designer` → `javascript-game-developer` → `game-qa-tester` |
| Эффекты | `game-vfx-designer` → `sprite-animation` → `game-performance` → `game-qa-tester` |
| Сохранения | `game-architect` (формат) → `javascript-game-developer` → `yandex-games-integration` → `game-qa-tester` |
| Реклама и покупки | `yandex-games-integration` → `game-economy` → `game-ui-designer` → `game-qa-tester` |
| Тормоза на телефоне | `game-performance` → профильный по узкому месту → `game-qa-tester` |
| Подготовка релиза | `game-qa-tester` → `game-performance` → `yandex-games-integration` |

## Правила работы
1. Для каждой задачи выбирается подходящий skill; для сложных — цепочка из таблицы.
2. Существующий рабочий код не меняется без причины; файлы проекта не удаляются.
3. Каждая функция проверяется `game-qa-tester` до слов «готово».
4. После этапа даётся отчёт: созданные и изменённые файлы, что работает, что не проверено.
5. Числа баланса живут только в `js/data/*`; технические решения — в `docs/ARCHITECTURE.md`.

## Как проверить, что Claude Code видит skills
1. Откройте терминал в `pixel-defenders/` и запустите `claude`.
2. Спросите: «какие skills доступны в этом проекте?» — в ответе должны быть 12 имён из таблицы.
3. Для проверки срабатывания дайте задачу, например «добавь Ice Tower»: должны подключиться `tower-defense-designer` и связанные skills.
4. Если skill не виден: проверьте, что файл называется именно `SKILL.md`, начинается с блока `---` с полями `name` и `description`, а имя папки совпадает с `name`.

## Дальше
Следующий шаг по мастер-промпту (этап 1): `game-architect` фиксирует архитектуру, затем этап 2 — миграция прототипа в модули. Открытые вопросы к автору: босс каждые 10 волн при 15-волновых картах; смысл иконки сердца у башен в референсе; разрешать ли постройку во время волны.
