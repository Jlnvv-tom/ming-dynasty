# 编者注（Supplement）

`data/raw/` 的原始表格是**结构**的唯一来源；本目录是**描述性内容**的人工维护层。

两者职责分离的好处：原始资料保持不动，补注可以随时增删，且 `pnpm data:import` 不会覆盖任何人工内容。

## 文件

| 文件 | 对象 | 说明 |
| --- | --- | --- |
| `emperors.json` | 21 位帝王 | 生卒年、陵寝、生平概述、出处 |
| `princes.json` | 宗室皇子 | 生卒、封国、事迹补注、出处 |
| `institutions.json` | 制度附录 | 封爵 / 散阶 / 勋级 / 科举 / 字辈 的术语释义 |

文件缺失或为空时，`pnpm data:import` 会**静默跳过**，站点照常构建 —— 可以先补一部分。

## 字段

### emperors.json

```json
[
  {
    "emperorId": "taizu",
    "birthYear": 1328,
    "deathYear": 1398,
    "birthDate": "九月十八日",
    "mausoleum": "明孝陵",
    "mausoleumNote": "位于南京紫金山南麓，与马皇后合葬",
    "summary": "……80–260 字的生平概述……",
    "sources": [
      { "book": "明史", "chapter": "卷一·太祖本纪", "url": "https://…" }
    ]
  }
]
```

- `emperorId` 必须与 `src/data/emperors.json` 中的 `id` 一致（如 `taizu`、`yingzong`、`zhaozong`）。
- `summary` 会被 `pnpm data:check` 校验为 **80–260 字**（去空白计）。
- 只要填写了 `summary` 或 `mausoleum`，`sources` 就**不能为空**。

### princes.json

```json
[{ "princeId": "taizu-s1", "life": "1355 — 1392", "fief": "懿文太子", "detail": "……", "sources": [] }]
```

- `princeId` 规则为 `{帝王id}-s{齿序}`，齿序取源表数字（如 `taizu-s1` 即太祖长子）。
- **无明确记载者不要写入**，页面会显示「原表未载」，比编造更可信。

### institutions.json

```json
{
  "notes": [
    {
      "id": "san-chujia",
      "section": "san",
      "title": "初授 / 升授 / 加授",
      "body": "……",
      "sources": [{ "book": "明史", "chapter": "卷七十二·职官志一" }]
    }
  ]
}
```

`section` 取值限定为 `jue`（封爵）/ `san`（散阶）/ `xun`（勋级）/ `keju`（科举）/ `zibei`（字辈）。

## 出处规范

1. **以书名 + 卷次为准**，例如 `{ "book": "明史", "chapter": "卷一·太祖本纪" }`。
2. `url` **只在可核验时填写**。核验方式是实际访问该链接并确认内容对得上；打不开、需登录、或内容是 JS 渲染取不到正文的，**留空即可**，不要凭印象拼 URL。
3. 同一本书的链接尽量指向同一平台，便于读者交叉核对。

## 校勘原则

- 史料有异说的，在正文里写「一说……」并列，不取单一说法冒充定论。
- 南明诸帝陵寝记载零散，多处无考，此类情况用 `mausoleumNote` 注明「葬处无考」，不要省略字段也不要编造。
- `pnpm data:check` 会拦截：引用不存在的 id、id 重复、概述字数越界、有补注却无出处、链接格式非法、生卒年倒置。
