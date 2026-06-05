# CLAUDE.md

## 项目名称
**网文新手导航站（webnovel-nav）**

## 项目简介
面向中文网文创作者的**结构化信息导航与投稿决策辅助站**。  
通过纯静态页面和声明式数据，帮助新手快速理解平台差异、投稿流程、收入模式和写作基础。  

> **核心定位：不替你做决定，只帮你做分析。**

---

## 设计哲学：技能驱动、数据与展示解耦
本项目遵循 **Skills-based Architecture**（参考 `mattpocock/skills`）：
- **每个功能模块都是一个独立的“技能”**：数据读取、过滤、搜索、格式化、UI 渲染等都被视为**可组合、可替换的纯函数/组件**。
- **类型即接口**：所有技能通过 TypeScript 类型定义输入输出，保证组合安全。
- **配置驱动 UI**：页面仅负责组合技能和渲染数据，不包含业务逻辑或硬编码数据。
- **核心数据资产独立于展示层**：`data/` 是永久性资产，前端框架（Astro）只是当前展示实现，可随时替换。

---

## 一、项目目标（不变）
解决网文新手的核心问题：
1. 平台太多，不知道如何筛选了解。
2. 投稿、签约、收入规则看不懂。
3. 缺少各平台具体投稿流程。
4. 缺少基础写作方法论。
5. 信息分散、过时、难以对比。

**本项目不做“平台推荐决策”，只做结构化信息整理、横向对比和风险提示。**

---

## 二、技术栈
- **静态站生成**：Astro（当前），但技能层与框架无关
- **语言**：TypeScript（严格模式）
- **样式**：Tailwind CSS
- **数据**：JSON（声明式配置）
- **数据校验**：JSON Schema
- **文章**：Markdown / MDX
- **搜索**：Fuse.js
- **自动化脚本**：Node.js / Python（仅数据维护）
- **测试**：Node Test Runner
- **部署**：GitHub Pages
- **CI/CD**：GitHub Actions

---

## 三、项目结构（技能驱动视角）
```text
webnovel-nav/
├── data/                         # 核心数据资产（配置源）
│   ├── platforms/                # 平台信息 JSON
│   ├── events/                   # 征稿活动 JSON
│   ├── guides/                   # 投稿指南 JSON
│   └── schema/                   # JSON Schema (类型约束)
│
├── content/                      # Markdown / MDX 内容
│   ├── writing/                  # 写作技巧
│   ├── guides/                   # 投稿指南文章
│   └── faq/                      # FAQ
│
├── site/                         # Astro 展示层（组合技能为页面）
│   ├── src/
│   │   ├── pages/                # 页面路由（仅组合技能）
│   │   ├── components/           # UI 技能（纯展示，接收 props）
│   │   ├── layouts/              # 布局
│   │   ├── lib/                  # 核心技能库（纯函数，框架无关）
│   │   └── styles/               # 全局样式
│   ├── public/
│   ├── package.json
│   └── astro.config.mjs
│
├── scripts/                      # 自动化维护技能（数据校验、导出等）
│   ├── validate-data.mjs
│   ├── export-api.mjs
│   ├── build-search-index.mjs
│   └── check-updates.mjs
│
├── public-api/                   # 构建导出的静态 API（技能输出物）
│   ├── platforms.json
│   ├── events.json
│   ├── guides.json
│   └── search-index.json
│
├── tests/                        # 技能单元测试
├── .github/workflows/            # CI 技能
├── README.md
└── CLAUDE.md
四、核心数据模型（配置规范）
所有数据均为声明式配置，必须严格遵循 JSON Schema。

4.1 平台数据 data/platforms/*.json
typescript
interface Platform {
  id: string;                    // 稳定英文 ID，如 "qidian"
  name: string;
  shortName: string;
  status: "active" | "archived" | "unknown" | "draft";
  operator: string;
  url: string;
  authorUrl?: string;
  helpUrl?: string;
  type: string[];                // 如 ["男频", "综合"]
  suitableGenres: string[];
  incomeModels: string[];
  beginnerFriendlyScore: 1 | 2 | 3 | 4 | 5;
  contractDifficultyScore: 1 | 2 | 3 | 4 | 5;
  competitionScore: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  recommendedFor: string[];
  notRecommendedFor: string[];
  submissionSteps: SubmissionStep[];
  officialSources: OfficialSource[];
  riskNotes: string[];           // 必须包含通用免责声明
  lastChecked: string;           // YYYY-MM-DD
  lastUpdated: string;
  schemaVersion: number;
}
4.2 征稿活动 data/events/*.json
typescript
interface Event {
  id: string;                    // 如 "2026-06-fanqie-new-author"
  title: string;
  platformId: string;
  status: "active" | "expired" | "draft";
  eventType: string;
  startDate: string;
  endDate: string;
  summary: string;
  tags: string[];
  sourceUrl: string;
  sourceType: "official" | "community";
  lastChecked: string;
  riskNotes: string[];
  schemaVersion: number;
}
4.3 文章 frontmatter
yaml
---
id: outline-basics
title: 新手如何写网文大纲
category: writing
tags: [大纲, 新手入门]
level: beginner
updatedAt: 2026-06-05
schemaVersion: 1
---
五、页面规划（技能组合示例）
页面本身是无状态的技能组合层，仅做两件事：调用数据技能 → 交给 UI 技能渲染。

页面	说明
/	新手导航仪表盘，组合搜索、平台入口、活动卡片等技能
/platforms	平台列表，调用过滤技能 + PlatformCard 组件
/platforms/[id]	平台详情，调用 getPlatformById 技能 + 多个展示组件
/compare	横向对比表，调用对比技能 + PlatformTable 组件
/guides	投稿指南列表
/guides/[id]	单个平台投稿流程
/events	征稿活动列表，调用时间过滤技能
/writing	写作技巧文章列表
/changelog	更新日志
/feedback	外部反馈表单入口
首页必须包含：搜索框、新手三步走、平台快速入口、平台对比入口、最新活动、新手必看文章、更新日志入口、免责声明。

六、技能开发约束（Skills Constraints）
6.1 总体原则
数据与展示严格解耦：data/ 中的 JSON 绝不包含 HTML、前端逻辑或样式。

技能必须是纯函数或可控副作用：数据读取技能返回承诺的数据对象，不直接操作 DOM。

每个技能有明确的类型定义：lib/ 下的每个函数都需导出 TypeScript 类型。

组合优于继承：页面通过组合多个小而专注的技能来构建，避免巨型组件。

配置驱动：所有可变行为（如排序、筛选、评分颜色）通过配置对象控制，不硬编码。

6.2 技能分类
数据技能（site/src/lib/）
typescript
// lib/platforms.ts
export async function getAllPlatforms(): Promise<Platform[]>;
export async function getPlatformById(id: string): Promise<Platform | undefined>;
export function filterPlatforms(platforms: Platform[], criteria: FilterCriteria): Platform[];
export function sortPlatforms(platforms: Platform[], sortBy: SortOption): Platform[];
// ... 其他纯函数
约束：

只读取 data/ 或预构建的 JSON，不做 HTTP 请求。

同一数据源只读取一次（必要时可缓存，但必须显式声明）。

过滤、排序技能不修改原数组，返回新数组。

UI 技能（site/src/components/）
每个组件是纯展示单元，接收 props，不发起数据请求。

命名规则：PascalCase，职责单一。

示例：PlatformCard.astro、PlatformTable.astro、RiskNote.astro、SearchBox.astro、Disclaimer.astro。

禁止在组件内定义硬编码的平台信息。

样式使用 Tailwind，移动端优先，表格必须可横向滚动。

自动化维护技能（scripts/）
只做数据校验、导出、搜索索引构建、官方页面变化检测。

禁止：自动修改数据内容、自动生成推荐结论、自动爬取并发布未经确认的信息。

所有官方规则变化必须人工确认后方可更新。

6.3 数据 ID 与 URL 约束
所有实体 ID 必须稳定、英文、可预测：qidian、fanqie、2026-06-fanqie-new-author。

禁止使用中文或可能变化的标题作为 ID。

URL 设计必须简短、可迁移：/platforms/qidian、/guides/qidian-submit、/writing/outline-basics。

6.4 类型安全与校验
每次提交前必须通过：

bash
npm run validate   # JSON Schema 校验
npm test           # 数据完整性 + 技能单元测试
npm run build      # 站点构建成功
数据修改时必须同步更新对应的 JSON Schema（data/schema/）。

新增字段必须先添加 Schema 约束，再填充数据。

测试至少覆盖：Schema 符合性、ID 唯一性、必要字段完整性、平台-活动关联有效性、构建成功。

6.5 内容合规与风险提示
所有平台规则以官方来源为准，社区经验仅可作为补充参考，且需明确标注。

不复制合同条款全文，不承诺收入，不鼓励违规行为。

敏感信息（签约、分成、版权）必须附加风险提示，例如：

“本站信息仅供分析参考，具体规则以官方最新公告和合同为准。”

数据中必须保留 officialSources 和 riskNotes 字段，不可省略。

七、测试驱动开发（TDD）约束
所有技能函数（site/src/lib/ 下的纯函数）必须采用 TDD 方式开发。

7.1 TDD 流程
红灯（Red）：先编写一个失败的功能测试，描述期望行为。

绿灯（Green）：编写最少量的代码使测试通过。

重构（Refactor）：在测试保护下优化代码结构，消除重复，提高可读性。

循环上述步骤，直到功能完整。

7.2 测试要求
技能函数的测试必须独立、快速、可重复。

使用 node:test 作为测试运行器，不引入重型测试框架。

每个技能模块对应一个测试文件，命名规则：module-name.test.ts。

测试必须覆盖：

正常输入输出

边界条件（空数组、缺失字段、null/undefined）

错误输入（类型错误、无效 ID）

数据技能不得依赖网络或文件系统，应使用预定义的测试数据或 mock。

7.3 重构保护
在修改或重构现有技能时，必须确保所有已有测试依然通过。

如果发现实现有误，先补上测试复现问题，再修复代码。

7.4 自动化测试执行
每次提交前运行 npm test 必须全部通过。

CI 流程（GitHub Actions）中自动执行测试，失败则阻止合并。

八、Claude 参与本项目的工作规则
当 Claude 协助开发时，必须：

优先保护 data/ 的长期稳定，不随意更改字段含义。

修改数据结构前先检查 Schema，确保向后兼容。

新增功能时优先提取为可复用的技能（纯函数 / 无状态组件）。

绝不将示例数据硬编码到页面或组件中。

涉及平台政策、收入、签约等内容时，必须基于已有来源字段，不凭记忆编造；信息不确定时标注 unknown 并添加风险提示。

每次代码修改后，提醒运行验证和测试命令。

不引入当前阶段之外的复杂架构（无数据库、无后端、无认证），但允许为后续社区功能预留接口，前提是不破坏现有纯静态约束。

所有输出保持“分析辅助”口径：

✅ “适合优先了解”、“需要重点注意”、“以官方公告为准”

❌ “你就去这个平台”、“这个平台最赚钱”、“保证有收入”

遵循 TDD 原则：在编写或修改技能函数时，先要求提供测试用例，再生成实现代码。

九、开发优先级与演进路径
第一阶段：核心导航站（当前）
必须完成以下功能，并保持纯静态架构：

补全数据校验脚本与 CI。

升级为 npm workspaces 管理。

完善平台 Schema 与风险提示。

重构首页为技能组合仪表盘。

实现 /compare 筛选对比页。

新增活动数据模型与页面。

新增投稿指南模块。

实现基础搜索与静态 API 导出。

增加官方页面变化检测（仅提醒，不自动更新）。

完成标志：所有页面可访问，搜索可用，数据完整且有维护流程。

第二阶段：轻量级互动（核心功能完成后引入）
当第一阶段完成并稳定运行后，逐步添加社区/讨论功能，必须遵循以下原则：

不与现有纯静态架构冲突，优先使用外部服务嵌入。

示例实现：

文章底部评论：使用 Giscus（GitHub Discussions 驱动）或 Utterances，无需自建数据库。

社区/论坛入口：链接到外部 Discord、GitHub Discussions，或在站内嵌入静态讨论组件。

反馈/纠错：保留外部表单（如 Google Forms、GitHub Issues）。

数据层必须保持独立：平台信息 JSON 仍由 Git 管理，不可迁移到数据库。

如果未来需要自建后端（如用户发帖、收藏），必须制定独立的架构设计文档，确保：

用户系统与导航数据完全分离。

导航数据继续支持静态导出为 JSON 文件，不受后端影响。

前端技能层可同时消费静态 JSON 和 API，无需大规模重写。

第三阶段（远期）
在社区活跃、有持续维护能力时，可评估自建轻量级后端（如 Supabase、Cloudflare D1 + Auth），但仍需保留 data/ 的静态导出能力，保持数据可迁移性。

十、当前阶段禁止事项（第一阶段有效）
在第一阶段（核心导航站完成前），严格禁止以下内容，以保证快速交付和高稳定性：

❌ 用户系统、评论、论坛、付费课程。

❌ 数据库、后端服务、自动爬取发布。

❌ AI 自动推荐唯一平台。

❌ 收入排名、绝对化表述。

❌ 未经授权转载、抄袭、承诺收益。

❌ 在数据层存储 HTML 或前端逻辑。

这些禁止事项会在进入第二阶段时重新评估，并更新 CLAUDE.md。

十一、最终愿景
建成一个数据驱动、技能可组合、长期可维护的网文新手信息库与决策辅助系统，并逐步演化为带有社区讨论的创作者助手平台。数据是永恒的资产，展示和互动只是不断进化的呈现方式。