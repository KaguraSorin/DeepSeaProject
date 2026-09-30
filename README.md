# 深海学习航线

> 智能体：**汐**　·　梦幻海洋 / 深海紫潮 / 极光海域
> 一个把「学习目标」变成「可打卡的深海航线」的学习计划生成与跟踪应用。

基于 **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Zustand** 构建。

---

## 功能一览

- **AI 智能体「汐」**：温柔治愈的对话式规划。输入目标 / 水平 / 可用时间，汐会追问关键信息（最多 3 问），再生成计划。
- **Mock 兜底**：未配置任何 AI 密钥时全量走本地生成器，任何环境都可完整演示，绝不白屏。
- **航线图**：手写 SVG「岛屿节点 + 发光曲线 + 漂浮气泡」，节点按完成度显示未开始 / 进行中 / 完成三态。
- **阶段计划**：2–3 个阶段、每阶段 2 里程碑、逐日任务（每日时长不超限、每周 1 天休息/轻复习、1/3/7/15 复习节奏）。
- **打卡跟踪**：今日任务勾选、进度环、连续打卡（昨日连击 +1，今日重复不变）、完成气泡反馈。
- **多计划 & 持久化**：多条航线各具强调色，可切换 / 删除；数据保存在浏览器 localStorage，刷新不丢。
- **计划调整**：跟汐说「我每天只能学 30 分钟」，即重算任务时长。
- **导出**：Markdown 下载 / 复制、打印(打印样式) / PDF、`html-to-image` 分享海报。

---

## 目录结构

```
src/
├─ app/                # layout / page(Bento 装配) / api/xii(Route Handler)
├─ components/
│  ├─ ocean/           # 动态海洋底座（光斑/气泡/波浪/噪点）
│  ├─ ui/              # 玻璃卡片/渐变按钮/标签/进度条/折叠/磁吸/涟漪
│  ├─ layout/          # TopNav(校徽+校名显性) / BottomBar / BentoGrid
│  ├─ form/            # PlanForm
│  ├─ xii/             # 汐对话（打字机/思考波浪/情绪气泡）
│  ├─ route/           # 海洋航线图 / 节点 / 曲线
│  ├─ tasks/           # 今日任务 / 任务卡
│  ├─ progress/        # 进度环 / 连续打卡徽章
│  ├─ plans/           # 多计划切换
│  └─ export/          # 导出菜单 / 分享海报
├─ lib/
│  ├─ ai/              # Provider 抽象 + OpenAI 兼容调用 + prompt + parse + index
│  ├─ mock/generator.ts# Mock 计划生成器（确定性）
│  ├─ store/planStore.ts
│  ├─ export/          # markdown / poster
│  ├─ theme/tokens.ts  # 阶段主题色映射
│  ├─ config/site.ts   # 校名 / 校徽路径集中配置
│  ├─ hooks/useLowPerf.ts
│  └─ utils/           # cn / date / id
├─ types/              # plan / chat
```

---

## 运行

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build        # 静态导出 → out/（用于 Cloudflare / 纯静态托管）
npm run build:server # 服务端构建 → .next（用于 Vercel / 自托管，含 /api/xii）
npm run start:server # 服务端构建并启动
npm run lint         # 代码规范
npm test             # Mock 生成器单测（唯一核心单测）
```

首次访问会自动生成一条示例航线（雅思 7 分 · 每天 60 分钟 · 60 天）供直接体验。

---

## 环境变量与接入 AI

默认**不需要任何密钥**即可完整运行（走本地 Mock）。接入真实 AI 时，在 `.env.local` 配置（模板见 `.env.example`）：

```
AI_PROVIDER=openai       # none | openai | dashscope | zhipu | custom
AI_API_KEY=你的密钥
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

说明：
- 接口为 **OpenAI 兼容 `/chat/completions`**（`src/app/api/xii/route.ts` → `lib/ai/openai.ts`，原生 `fetch`，无 SDK）。
- 密钥只在服务端读取，不会下发到浏览器。
- 任一环节失败（无密钥 / 网络错 / JSON 解析错 / schema 校验错）→ **静默回退本地 Mock**，前端给出友好提示，不白屏。

### 更换为通义 / 智谱 / 自定义

仅需改 `AI_BASE_URL`（与 `AI_MODEL`）填入各自 OpenAI 兼容端点即可，例如：

```
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-plus
```

---

## 部署

### Cloudflare（推荐 · 国内访问友好 · 纯静态）

仓库已内置 `wrangler.jsonc`（声明为静态资源部署），Cloudflare 不会去套用 Next.js 适配器。

**方式一：Workers & Pages → 连接 Git**
| 配置项 | 值 |
|---|---|
| 根目录 Root directory | `/` |
| 构建命令 Build command | `npm run build` |
| 部署命令 Deploy command | `npx wrangler deploy` |

产物由 `wrangler.jsonc` 的 `assets.directory = ./out` 指定，无需填输出目录。纯静态部署下默认走浏览器本地生成器（无 `/api/xii`），功能完整可用。

**方式二：本地命令部署**
```bash
npm run build && npx wrangler deploy
```

### Vercel / Netlify（服务端，保留 `/api/xii` 真实 AI）

1. 在 Vercel / Netlify 导入仓库。
2. 将 **构建命令改为 `npm run build:server`**（默认的 `npm run build` 是静态导出，不含 API 路由）。
3. 如需 AI，配置环境变量 `AI_*`（见上）。

> 数据全部存储在用户浏览器 localStorage，无需数据库。

---

## 部署模式对照

| 模式 | 构建命令 | 产物 | `/api/xii` | 计划生成 |
|---|---|---|---|---|
| 纯静态（Cloudflare） | `npm run build` | `out/` | 无 | 浏览器本地 Mock |
| 服务端（Vercel / 自托管） | `npm run build:server` | `.next` | 有 | AI 或 Mock 兜底 |

---

## 更换校徽 / 校名

集中配置于 `src/lib/config/site.ts`：

```ts
SCHOOL_NAME        // 校名
SCHOOL_LOGO_SRC    // 校徽路径（当前指向 public/school-logo.svg 占位）
```

替换 `public/school-logo.svg` 为真实校徽 SVG 即可全站生效（顶部导航与分享海报）。

---

## 视觉与动效规范

详见 [`docs/视觉规范.md`](./docs/视觉规范.md)。

核心约束：主色严格三色（midnight / indigo / aurora），点缀仅 `cyan + mint` 两个；动画只用 `transform / opacity / stroke-dashoffset`；支持 `prefers-reduced-motion` 与低性能降级。

---

## 作品说明

比赛作品说明文档见 [`docs/作品说明.md`](./docs/作品说明.md)。