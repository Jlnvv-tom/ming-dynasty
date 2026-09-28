# 大明职官志

> 把一份平面的明朝史料表格，重编为**可读、可查、可图谱**的中文知识站。

以「明朝帝王世系 & 官职品级」原始资料为底本，梳理大明十六帝（含南明五帝）的继统脉络与宗室支系，
以及九品十八级官僚体系的官职、员额、隶属与职事，并提供交互式关系图谱，让血缘与品级两套体系连起来看。

## 功能亮点

| 模块 | 说明 |
| --- | --- |
| **帝王世系** | 21 位帝王档案（庙号 / 名讳 / 年号 / 谥号 / 在位始末 / **生卒年 / 陵寝 / 生平概述**），支持卡片、时间轴、继统链三种视图 |
| **皇子支系** | 107 位皇子的齿序、名讳与封号，其中 102 位补有**封国与事迹**，并标注后来即位者 |
| **官职品级** | 548 条官职，可按「品级」纵览或按「衙门」横向比较，含员额、隶属与职事全文 |
| **关系图谱** | AntV G6 驱动，采用「分类入口 + 逐层下钻」而非一张大图：世系按 **8 个历史分期** 分图并支持子嗣折叠；官制按 **体系 → 衙门 → 官职** 三级展开，每层节点控制在可读规模（平均 14 个，最大 52 个）。含面包屑、画布缩放控件、自动图例、一度邻居高亮、图上搜索定位与全屏查看 |
| **制度附录** | 宗室封爵序列、文武散阶、勋级、科举四级阶梯、皇室字辈二十三房，各附**术语释义与史料出处** |
| **全局检索** | 构建期生成倒排索引，跨帝王、皇子、官职、科举、字辈即时检索，支持空格多词 |

## 技术栈

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | **Next.js 15（App Router）+ React 19** | 目录页需要 SEO；`output: 'export'` 全静态导出，可托管到 Vercel / GitHub Pages / 任意静态服务器，零运维 |
| 语言 | **TypeScript 5（strict）** | 历史数据字段多、关系复杂，编译期类型 + 脚本期校验双保险 |
| 样式 | **Tailwind CSS 3.4 + 自定义设计令牌** | 宣纸底 / 朱红青黛 / 描金细边的古典配色，暗色「夜读」模式 |
| 图谱 | **AntV G6 v5** | 中文文档与示例完备，内置 dagre、d3-force、concentric 等布局；组件以 `next/dynamic({ ssr: false })` 懒加载 |
| 数据 | **JSON + 单向 ETL** | 原始表格 → `scripts/etl` → `src/data/*.json`，数据与代码分离，便于校正重跑 |
| 检索 | **构建期倒排索引** | 数据量仅数百条，`public/search-index.json` 体积可控，无需服务端 |
| 工程 | **pnpm + ESLint + Prettier + GitHub Actions** | CI 中执行 typecheck / lint / data:check / build |

## 快速开始

```bash
pnpm install

pnpm dev          # 本地开发 http://localhost:3000
pnpm build        # 静态导出到 out/
pnpm typecheck    # 类型检查
pnpm lint         # 代码检查

pnpm data:import  # 抽取 data/raw 并合并 data/supplement → src/data/*.json + public/search-index.json
pnpm data:check   # 数据一致性校验（悬空引用 / 品级 / 在位区间 / 序位 / 编者注完整性）
```

环境要求：**Node ≥ 22.13**、pnpm 11（版本由 `packageManager` 字段锁定，pnpm 11 依赖 Node 22 才有的 `node:sqlite`，Node 20 及以下无法运行）。

## 目录结构

```
ming-dynasty/
├── data/
│   ├── README.md              原始表格结构说明与字段对照
│   ├── raw/                   源表格（xlsx，结构唯一来源）
│   └── supplement/            编者注：生卒 / 陵寝 / 生平概述 / 制度释义（人工维护，含出处）
├── scripts/
│   ├── etl/
│   │   ├── sheet.ts           xlsx 读取（含合并单元格解析）
│   │   ├── parse-posts.ts     三大官职区块 → Post[]
│   │   ├── parse-emperors.ts  帝王 / 皇子 / 关系边
│   │   ├── parse-institutions.ts 封爵 / 散阶 / 勋级 / 科举 / 字辈
│   │   ├── util.ts            品级解析、中文数字
│   │   └── build.ts           组装并输出 JSON 与检索索引
│   └── check-data.ts          数据一致性校验
├── src/
│   ├── types/index.ts         领域模型（ETL 与前端共用）
│   ├── data/*.json            结构化数据产物
│   ├── lib/
│   │   ├── data.ts            只读数据访问层（查询 / 统计 / 解析节点）
│   │   ├── graph/             图谱领域层
│   │   │   ├── types.ts       G6 数据类型与层级定义
│   │   │   ├── families.ts    祖先 / 后代 / 父子映射
│   │   │   ├── periods.ts     8 个历史分期
│   │   │   ├── lineage.ts     分期世系图构建（含子嗣折叠）
│   │   │   └── posts.ts       衙门气泡图与品级阶梯图构建
│   │   ├── site.ts            站点与作者信息
│   │   ├── utils.ts / use-is-dark.ts / use-is-mobile.ts
│   ├── components/
│   │   ├── layout/            顶栏、页脚、作者弹窗、暗色切换
│   │   ├── emperor/           帝王卡片、目录浏览器
│   │   ├── officials/         官职浏览器、详情面板
│   │   ├── graph/             分层图谱：入口卡、舞台、侧栏、工具栏、图例、列表降级
│   │   ├── search/            检索视图
│   │   └── ui/                页面头部、统计卡
│   └── app/
│       ├── page.tsx           首页
│       ├── emperors/          帝王目录 + [id] 详情（SSG）
│       ├── officials/         官职品级目录
│       ├── graph/             关系图谱
│       ├── institutions/      制度附录
│       ├── search/            全局检索
│       └── about/             数据来源与校勘说明
└── public/search-index.json   检索索引（构建期生成）
```

## 数据流水线

```
data/raw/*.xlsx ─────┐
                     ├──(scripts/etl + 校验)──▶ src/data/*.json ──▶ src/lib/data.ts（只读访问层）
data/supplement/*.json┘                            │
                                                   ├──▶ 目录页 / 详情页（静态预渲染）
                                                   ├──▶ src/lib/graph/ ──▶ G6 分层图谱
                                                   └──▶ public/search-index.json ──▶ 检索
```

- **结构与描述分离**：`data/raw` 的表格决定结构，`data/supplement` 的人工编者注提供生卒、陵寝、生平概述与制度释义，按 id 合并；编者注文件缺失时静默跳过，站点照常构建。
- **关系是一等公民**：`relations.json` 独立存储边表 `{source, target, type, label}`，同一份数据可同时驱动树图、力导向图与祖孙路径计算，避免树形结构无法表达兄弟、叔侄、复辟等关系。
- **校验左移**：`pnpm data:check` 会拦截关系边悬空引用、无法解析的品级、倒置的在位区间、不连续的帝王序位，以及编者注的 id 悬空、概述字数越界、有补注却无出处、链接格式非法。
- **不臆造史实**：史料有异说者并列「一说」；无明确记载者留白，页面显示「原表未载」。出处以书名 + 卷次为准，外链仅在实测可访问时提供。

## 设计说明

- 视觉方向：宣纸质感底纹 + 朱红（`#9E2B25`）与青黛（`#2E4A62`）点缀 + 描金细边，宋体标题承载历史厚重感；暗色模式切换为「夜读」墨蓝底。
- 响应式：桌面端双栏信息密度高，平板降为单栏卡片流，移动端图谱降级为可折叠树 / 引导至目录页。
- 动效克制：渐显、卡片微抬升、导航下划线展开、图谱节点悬停高亮。

## 部署

`pnpm build` 产出 `out/`，**无任何服务端依赖**，可直接上传至任意静态托管（对象存储、Nginx、Vercel、GitHub Pages 均可）。

### GitHub Pages（仓库已配置好）

推送到 `master`（或 `main`）后，`.github/workflows/deploy.yml` 会自动执行：

```
安装依赖 → 构建原生依赖 → typecheck → lint → data:import（从源表重建数据）→ data:check → build → 发布 Pages
```

> **pnpm 构建脚本说明**：pnpm 11 在 CI 下默认开启 `strict-dep-builds`，会因 `esbuild`、`unrs-resolver`
> 的构建脚本未获批准而中断安装。该策略**不信任项目内的 `.npmrc` / `pnpm-workspace.yaml`**
> （实测均被忽略），因此工作流中使用命令行参数 `--config.strict-dep-builds=false` 放宽，
> 再用 `pnpm rebuild` 显式构建这两个包。若你本地也遇到同类报错，用同一参数即可。

站点地址：**https://jlnvv-tom.github.io/ming-dynasty/**

**一次性手动设置**（只需做一次）：仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

### 部署前缀（重要）

GitHub Pages 的**项目站**带 `/<仓库名>` 路径，因此 `next.config.ts` 中设置了：

```ts
const BASE_PATH = process.env.BASE_PATH ?? '/ming-dynasty';
// → basePath / assetPrefix / NEXT_PUBLIC_BASE_PATH 三者同步
```

它影响四类路径，缺一都会白屏或 404：

| 位置 | 处理方式 |
| --- | --- |
| `/_next/*` 资源、`<Link>` 站内链接 | Next 依据 `basePath` 自动加前缀 |
| `public/*` 静态资源（如二维码图片） | `next/image` 在 `unoptimized` 模式下**不加前缀**，由 `src/lib/site.ts` 的 `ASSET_BASE` 手动拼接 |
| 客户端 `fetch` 的 `search-index.json` | 检索页用 `NEXT_PUBLIC_BASE_PATH` 拼接 |
| `_next` 等下划线目录 | 由 `public/.nojekyll` 阻止 Jekyll 过滤 |

**改为根路径部署**（绑自定义域名，或用 `<user>.github.io` 用户站）时：

```bash
BASE_PATH= pnpm build
```

前缀随即为空，上述四类路径会自动回到根路径，无需改代码。

## 相关文档

- [ROADMAP.md](./ROADMAP.md) —— 分阶段开发计划与验收标准
- [CONTRIBUTING.md](./CONTRIBUTING.md) —— 数据校正与代码贡献流程
- [data/README.md](./data/README.md) —— 原始表格结构与字段口径
