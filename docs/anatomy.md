# Анатомія та API

Блок розкроєний на **три компоненти** плюс один примітив. Причина розкрою: у
продукті верх і графік приходять різними запитами, а слот не вміє слухатися осі
обгортки — тому вісь `State` живе в кожному компоненті, а обгортка лишається
чистим контейнером.

| Компонент | Figma | Роль |
|---|---|---|
| Stats Chart | `18360:92367` | обгортка на двох слотах |
| Stats Header | `18360:92366` | верхній текстовий блок, вісь State |
| Chart Plot | `18360:88565` | полотно графіка, Range × State |
| _Pill | `18442:93992` | піл значення під пальцем |

---

## 1 · Stats Chart — обгортка

Чотири блоки у стовпчик, ширина **408**, гап **space/24**. Картки немає — блок
живе прямо на `bg/default`.

```
Header      слот (default: Stats Header / State=Default)
Range Switch  три Button / Small
Period Nav    дві Icon Button / Ghost + підпис періоду
Chart       слот (default: Chart Plot / Range=Week, State=Default)
```

**Драбина відступів:** `space/24` між зонами обгортки, `space/16` усередині
текстового блоку, `space/8` усередині рядків, `space/2` у парах лейбл-значення.
`space/20` виведено з обігу.

**API**

| Тип | Проп | Нотатки |
|---|---|---|
| Slot | `Header` | приймає будь-який свій верх, головне — ширина fill |
| Slot | `Chart` | приймає будь-який інший графік |
| Text | `Period` | «Last 7 days» · «This month» · «All time» |
| Boolean | `Show range switch` | |
| Boolean | `Show period nav` | в All time = false, крокувати нікуди |

Варіантів немає: власної осі `State` в обгортці не існує. Стан екрана
збирається з двох інстансів — `State` на Stats Header плюс `State` на Chart Plot.

**Окремих компонентів під контроли не заводимо.** Сегменти — це `Button / Small`
(вибраний `Type=Primary`, решта `Type=Secondary` на склі), стрілки — `Icon Button
/ Ghost` із модом `Sizing = Small`. Мод ставиться на самі кнопки: майстер Icon
Button має вшитий explicit `Sizing = Medium`, і він перебиває мод із батьківського
фрейму.

---

## 2 · Stats Header — верх

Вісь **State: Default · Loading · Empty**. Гап у корені `space/16` — метрика й
речення читаються як один блок.

```
Header (row, gap space/16)
├ Metric (gap space/2)
│  ├ Value          Display/Medium/Medium, залито brand-градієнтом
│  └ Metric Label   Body/Small/Medium, text/tertiary, капс
└ Second Metric (gap space/2, вирівняна праворуч)
   ├ Second Label   Body/Small/Medium, text/tertiary, капс
   └ Second Value   Heading/Large, text/default
Insight             Body/Medium/Regular, text/default; число — Semibold
```

**API**

| Тип | Проп |
|---|---|
| Text | `Value` · `Metric label` · `Second label` · `Second value` |
| Boolean | `Show second metric` · `Show insight` |
| Variant | `State` |

**Insight не винесений у text-проп** — у ньому діапазони стилів (число
Semibold), а text-проп їх затирає. Редагується на місці.

**Перемикача метрики немає.** Шеврон стояв біля числа, тому «+8% ⌄» читалося як
падіння показника, а не як вибір. Плюс продуктово ми між показниками не
перемикаємось. Якщо колись знадобиться — чіпляти шеврон до **лейбла**
(«IN CONTROL ⌄»), не до числа.

---

## 3 · Chart Plot — полотно

Осі **Range (Week · Month · All time) × State (Default · Loading · Empty)** = 9
варіантів, плюс boolean `Show pointer`. Розмір 408 × 226: полотно 408 × 200,
гап `space/8`, рядок X-підписів 360 × 18.

| Шар | Що це |
|---|---|
| Gridline ×4 | 360 × 1, `border/divider`, `border-width/1` |
| Y Label ×4 | `Body/Small/Regular`, `text/tertiary`, права колонка 36, по лініях |
| Area | вертикальний градієнт `bg/brand-subtle → bg/default` + `opacity/40` |
| Glow | дубль лінії ПІД нею: той самий градієнт, `border-width/3`, layer blur 16, `opacity/80` |
| Line | горизонтальний градієнт `brand/from → brand/to`, `border-width/2`, круглі кінці |
| Pointer | вмикається `Show pointer` — див. нижче |

Крапок на точках немає: крапка зʼявляється тільки під пальцем.

**Ось Y масштабується під період:** Week 0–9 % · Month 0–12 % · All time 0–15 %.
0–12 % на тижні давало мертву смугу зверху.

**Pointer** — фрейм над кривою:

```
Pointer Line   вертикаль 182 (border/strong, border-width/1) від верхньої гридлайни до бейзлайну
Dot Glow       еліпс 18 на brand-градієнті, layer blur 6, opacity/40
Dot            еліпс 9 на тому ж градієнті
Value Pill     інстанс _Pill на space/8 над точкою
```

У доксах позначка стоїть на одній точці, у продукті — на найближчій до пальця.

**API**

| Тип | Проп |
|---|---|
| Variant | `Range` · `State` |
| Boolean | `Show pointer` |

Text-пропів немає: підписи в продукті дає дата-шар. Ширина fill, висота
фіксована 226.

---

## 4 · _Pill — піл значення

Три шари під текстом, як у Button: `Tint` (`bg/inverse` на `opacity/90`) і
`Glass` (стиль `Glass/Glass`) — обидва absolute + stretch, щоб прозорість не
гасила текст. `radius/full`, падінги `space/8` / `space/2`, інтервал `space/4`.

| Тип | Проп | Стиль |
|---|---|---|
| Text | `Label` | `Body/Small/Regular`, `text/inverse` |
| Text | `Value` | `Body/Small/Medium`, `text/inverse` |

Інтерпункт «·» зашитий окремим текст-нодом: мішані ваги в одному text-пропі
неможливі. Два пропи замість одного — саме тому.

Чому не `_Badge`: бейдж — це тег-оверлей на медіа (`radius/8`, `bg/overlay-50`,
темний в обох темах). Піл — скло, що інвертується під тему, і повна округлість.
