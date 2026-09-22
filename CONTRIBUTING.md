# 贡献指南

本站的价值在**数据准确**。欢迎两类贡献：校正数据、改进代码。

## 一、校正数据（推荐从这里开始）

所有内容来自 `data/raw/` 下的原始表格，请**改表格而不是改 JSON**——JSON 是生成产物，直接修改会在下次 `pnpm data:import` 时被覆盖。

```bash
# 1. 修改 data/raw/明朝帝王世系&官职品级.xlsx
#    保持各区块的列位置与表头不变（结构见 data/README.md）

# 2. 重新抽取
pnpm data:import

# 3. 校验
pnpm data:check

# 4. 本地确认
pnpm dev
```

提交时请在 PR 中说明：

- 修改了哪一格、依据是什么（《明史》《明会典》或其他史料）。
- 是否新增了此前未收录的官职 / 皇子 / 帝王。

### 常见校勘点

- 源表中的生僻造字（如部分皇子名讳）请保留原字符，不要替换为形近字。
- 品级若出现新的取值（如「视正三品」），需要同步更新 `scripts/etl/util.ts` 的 `parseRank`。
- 新增帝王需在 `scripts/etl/parse-emperors.ts` 的 `TEMPLE_ID` 与 `SUCCESSION` 中登记 id 与继统关系。

## 二、改进代码

```bash
pnpm install
pnpm dev          # 开发
pnpm typecheck    # 类型检查
pnpm lint         # 代码检查
pnpm build        # 静态导出
```

约定：

- 组件默认 Server Component；仅在需要状态、浏览器 API 或图谱时加 `'use client'`。
- 数据一律通过 `src/lib/data.ts` 的只读函数访问，页面不直接读 JSON。
- 图谱相关逻辑放在 `src/lib/graph.ts`（领域 → 图数据）与 `src/components/graph/`（G6 API），便于替换可视化库。
- 样式优先使用 Tailwind 工具类与 `globals.css` 中定义的语义类（`.surface`、`.chip`、`.seal`）。
- 单个文件不超过 300 行，超出请拆分。

## 三、提交信息

使用 Conventional Commits 风格：

```
feat(emperors): 增加南明五帝世系
fix(etl): 修正从六品品级解析
docs(readme): 补充数据流水线说明
data(officials): 校正锦衣卫员额
```

## 四、免责说明

本站为静态知识整理项目，内容仅供学习与研究参考，史料异文以 `/about` 页面的校勘说明为准。
