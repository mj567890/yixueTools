# 嘉嘉易学工具箱 — 项目开发归档文档

> **归档版本：V6.0**
> **归档时间：2026-03-17**
> **覆盖开发阶段：八字排盘核心 + 大运流年 + 四维分析与五行力量图 + 十维度命局解读 + 流年联动详解 + 玉匣择吉 + 穿衣指南 + 梅花易数 + 奇门遁甲(阴盘+阳盘) + 六爻纳甲 + 太乙神数 + 起名测名 + API v1 系统 + AI Skills 基础设施**

---

## 一、项目核心定位与目标

### 1.1 项目简介

**项目名称**：嘉嘉易学工具箱（yixue-tools）
**核心定位**：专业易学工具集合 Web 应用，传承国学经典，融合现代前端技术。提供公农历查询、八字排盘、梅花易数、奇门遁甲、六爻、太乙等专业易学工具。

### 1.2 核心目标

- **全本地计算**：所有运算在浏览器完成，数据不上传服务器，保护用户隐私
- **学术严谨**：遵循子平八字、梅花易数等古籍原典，所有算法基于正统理论
- **现代体验**：新中式视觉风格 + 响应式布局，适配桌面/平板/移动端
- **模块化可扩展**：各易学工具独立模块，便于后续逐步开发

### 后续补充区

待更新

---

## 二、技术栈选型

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | React 全栈框架，App Router + Turbopack |
| React | 19.2.4 | UI 渲染库 |
| TypeScript | 5.9.3 | 类型安全 |
| Tailwind CSS | 4.2.1 | 原子化样式（含 @tailwindcss/postcss） |

### 2.2 核心依赖库

| 库 | 用途 |
|----|------|
| **lunar-javascript** 1.7.7 | 农历/公历转换、八字排盘、大运计算的底层引擎 |
| axios | HTTP 请求（预留后端接口） |

### 2.3 开发工具链

- **ESLint** 9.x + eslint-config-next：代码规范
- **PostCSS** 8.x + autoprefixer：CSS 后处理
- **tsconfig 路径别名**：`@/*` → `./src/*`
- **编译目标**：ES2017，JSX 模式 react-jsx，严格模式开启

### 后续补充区

待更新

---

## 三、视觉风格与设计规范

### 3.1 主题色系（新中式）

| 变量名 | 色值 | 语义 |
|--------|------|------|
| `--color-cream` | #FFF8F0 | 页面背景（宣纸底） |
| `--color-parchment` | #F5E6D3 | 卡片/面板浅底色 |
| `--color-primary` | #8B4513 | 暖棕主色 |
| `--color-cinnabar` | #C23B22 | 朱砂红（按钮/强调） |
| `--color-gold` | #B8860B | 古金（高亮/重点） |
| `--color-ink` | #2C1810 | 墨黑（正文） |
| `--color-ink-light` | #4A3728 | 浅墨（次要文字） |
| `--color-border-warm` | #D4B896 | 暖棕边框 |

### 3.2 五行配色体系

| 五行 | 文字色 | 背景色 | CSS 类 |
|------|--------|--------|--------|
| 木 | #2E8B57 | #E8F5E9 | `.tag-wood` |
| 火 | #C23B22 | #FFEBEE | `.tag-fire` |
| 土 | #FF8C00 | #FFF3E0 | `.tag-earth` |
| 金 | #B8860B | #FFF8E1 | `.tag-metal` |
| 水 | #1E90FF | #E3F2FD | `.tag-water` |

### 3.3 字体方案

- **正文/宋体**：`"Noto Serif SC"` → Google Fonts 加载
- **标题/楷体**：`"LXGW WenKai"` → 用于八字干支、标题等装饰性文字
- **行高**：全局 1.8

### 3.4 组件样式类

| 类名 | 用途 |
|------|------|
| `.card-chinese` | 卡片容器（白底、暖棕边框、悬浮阴影+上移） |
| `.btn-primary` | 主按钮（朱砂红渐变） |
| `.btn-outline` | 描边按钮 |
| `.section-title` | 章节标题（楷体+底部朱砂装饰线） |
| `.divider-chinese` | 中式分割线（金色+菱形装饰） |

### 后续补充区

待更新

---

## 四、项目文件结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局（Noto Serif SC 字体、Header+Footer）
│   ├── globals.css             # 全局主题变量 + 组件样式类
│   ├── page.tsx                # 首页（工具导航卡片网格）
│   ├── bazi/page.tsx           # 八字排盘页面（表单+标签页切换）
│   ├── calendar/page.tsx       # 玉匣通书页面（公农历+择吉+穿衣指南）
│   ├── meihua/page.tsx         # 梅花易数页面
│   ├── liuyao/page.tsx         # 六爻纳甲排盘页面
│   ├── taiyi/page.tsx          # 太乙神数排盘页面
│   ├── naming/page.tsx         # 起名测名页面
│   ├── docs/page.tsx           # 开发文档页面（API手册+AI Skills接入指南）
│   ├── about/page.tsx          # 关于页面
│   ├── qimen/
│   │   ├── lucking/page.tsx    # 阴盘奇门排盘页
│   │   └── yangpan/page.tsx    # 阳盘奇门排盘页
│   ├── .well-known/
│   │   └── ai-plugin.json/route.ts  # AI 平台发现清单
│   ├── api/v1/
│   │   ├── _shared.ts          # API 公共工具函数（响应封装、参数校验）
│   │   ├── health/route.ts     # 健康检查端点
│   │   ├── openapi.json/route.ts # OpenAPI 3.1 规范（动态适配域名）
│   │   ├── calendar/route.ts   # 公农历 API
│   │   ├── bazi/route.ts       # 八字排盘 API
│   │   ├── meihua/route.ts     # 梅花易数 API
│   │   ├── liuyao/route.ts     # 六爻纳甲 API
│   │   ├── qimen/route.ts      # 奇门遁甲 API
│   │   ├── taiyi/route.ts      # 太乙神数 API
│   │   └── naming/route.ts     # 起名测名 API
│   ├── blog/page.tsx           # 易学博客
│   ├── notes/page.tsx          # 我的笔记
│   └── resources/page.tsx      # 免费资源
├── middleware.ts                # CORS 中间件（/api/* 跨域支持）
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # 顶部导航栏（响应式导航）
│   │   └── Footer.tsx          # 底部页脚
│   ├── bazi/
│   │   ├── BaziPanel.tsx       # 四柱八字主面板
│   │   ├── ElementAnalysis.tsx # 五行平衡分析
│   │   ├── DaYunTimeline.tsx   # 大运时间轴（可点击选中）
│   │   ├── LiuNianGrid.tsx     # 流年网格（5×2 布局 + 点击交互 + 简洁断语）
│   │   ├── LiuNianDetailPanel.tsx # 流年联动详情面板（点击触发）
│   │   ├── WuXingChart.tsx     # 五行力量 SVG 雷达图
│   │   ├── AnalysisPanel.tsx   # 四维分析面板（事业/财运/婚姻/健康）
│   │   ├── DimensionCard.tsx   # 解读维度折叠卡片（通用）
│   │   └── InterpretationPanel.tsx # 十维度解读面板
│   ├── calendar/
│   │   ├── CompactBazi.tsx        # 紧凑四柱八字展示
│   │   ├── DayDetail.tsx          # 日期详情面板
│   │   ├── ZejiSection.tsx        # 玉匣择吉容器组件
│   │   ├── ZhuShenPanel.tsx       # 诸神所在+六甲旬空面板
│   │   ├── ShenShaPanel.tsx       # 神煞值日+建除+二十八宿
│   │   ├── DailyLesson.tsx        # 国学小课堂（关键词+问答）
│   │   ├── DressColor.tsx         # 穿衣颜色推荐
│   │   ├── LuckyDirection.tsx     # 吉祥方位
│   │   └── WeekDressTable.tsx     # 7日穿衣预测
│   ├── meihua/                # 梅花易数组件
│   ├── liuyao/                # 六爻纳甲组件
│   │   ├── DivinationTab.tsx       # 四种起卦UI
│   │   ├── PaipanBoard.tsx         # 排盘展示板
│   │   ├── AnalysisPanel.tsx       # 分析面板
│   │   └── CoinTossAnimation.tsx   # 铜钱3D翻转动画
│   ├── qimen/                 # 奇门遁甲组件
│   │   ├── YinpanPaipanBoard.tsx    # 阴盘九宫可视化面板
│   │   ├── LuckingAnalysisPanel.tsx # 阴盘格局分析解读面板
│   │   ├── YangpanBoard.tsx         # 阳盘九宫面板
│   │   ├── YangpanAnalysisPanel.tsx # 阳盘格局分析面板
│   │   ├── QimenConfig.tsx          # 排盘参数配置组件
│   │   ├── QimenInfo.tsx            # 排盘基本信息展示
│   │   ├── PalaceCell.tsx           # 九宫单元格
│   │   ├── StarSwapPanel.tsx        # 星门转盘面板
│   │   ├── QimenBoard.tsx           # 盘面容器
│   │   └── QimenAnalysis.tsx        # 分析容器
│   ├── taiyi/                 # 太乙神数组件
│   │   ├── InputPanel.tsx           # 排盘参数输入面板
│   │   ├── TaiyiBoard.tsx           # 太乙九宫盘（支持compact模式）
│   │   ├── PalaceCell.tsx           # 九宫单元格（支持compact模式）
│   │   ├── AnalysisPanel.tsx        # 分析面板
│   │   ├── CaseLibrary.tsx          # 经典案例库（含排盘图）
│   │   └── KnowledgeBase.tsx        # 太乙知识库
│   ├── naming/                # 起名测名组件
│   │   ├── InputPanel.tsx          # 测名/起名输入面板
│   │   ├── AnalysisPanel.tsx       # 测名分析结果面板
│   │   ├── WuGeDisplay.tsx         # 五格数理展示
│   │   ├── NameList.tsx            # 起名推荐列表
│   │   ├── CharLookup.tsx          # 汉字查询工具
│   │   └── KnowledgePanel.tsx      # 姓名学小常识
│   └── ui/                    # 通用 UI 组件（预留）
└── lib/
    ├── lunar.ts                # 核心历法计算层
    ├── bazi-interpretation.ts  # 八字十维度解读引擎
    ├── yuxia.ts                # 玉匣择吉算法库（诸神/神煞/建除/旬空/天赦/问答）
    ├── zeji.ts                 # 穿衣颜色/方位算法（通用+八字个人定制）
    ├── meihua/                 # 梅花易数计算库
    │   ├── types.ts / constants.ts / hexagrams.ts / kangxiStrokes.ts
    │   ├── divination.ts       # 三种起卦算法
    │   ├── analysis.ts         # 体用分析引擎
    │   └── index.ts
    ├── liuyao/                 # 六爻纳甲计算库
    │   ├── types.ts / constants.ts / hexagramData.ts / naJia.ts
    │   ├── divination.ts       # 四种起卦算法
    │   ├── paipan.ts           # 10步排盘管线
    │   ├── analysis.ts         # 6层分析引擎
    │   ├── analysisRules.ts    # 10场景断卦规则
    │   └── index.ts
    ├── qimen/                  # 奇门遁甲计算库
    │   ├── types.ts / constants.ts / index.ts
    │   ├── timeCalc.ts / trueSolarTime.ts / cityDatabase.ts / jiuGong.ts
    │   ├── yinPan.ts / yinPanCalc.ts / yinpanPaipan.ts  # 阴盘核心
    │   ├── luckingPaipan.ts / luckingAnalysis.ts          # 阴盘完整排盘+分析
    │   ├── yangpanJuCalc.ts / yangpanPipeline.ts / yangpanAnalysis.ts  # 阳盘
    │   └── panCalc.ts / analysis.ts
    ├── taiyi/                  # 太乙神数计算库
    │   ├── types.ts / constants.ts / index.ts
    │   ├── timeCalc.ts / jiNian.ts / schools.ts
    │   ├── paipan.ts           # 排盘核心管线
    │   ├── analysis.ts / analysisRules.ts
    │   └── caseLibrary.ts      # 经典案例库（40+历史案例）
    └── naming/                 # 起名测名计算库
        ├── types.ts / constants.ts / charDatabase.ts
        ├── wugeCalc.ts / sancaiCalc.ts / charAnalysis.ts / baziMatch.ts
        ├── scoring.ts / nameGenerator.ts / analysis.ts
        └── index.ts
```

### 后续补充区

待更新

---

## 五、核心功能模块

### 5.1 模块一：公农历查询（calendar）

**文件**：`src/app/calendar/page.tsx` + `src/components/calendar/*`

**功能**：
- 公历→农历双向转换，展示干支、纳音、节气、宜忌、冲煞、胎神
- 月历网格视图（标注节气/节日/农历日）
- 称骨论命：根据年柱+农历月+农历日+时辰查表计算总重量，匹配批语

**关键 API**：
- `getCalendarInfo(year, month, day, hour)` → `CalendarResult`
- `getChengGu(yearGanZhi, lunarMonth, lunarDay, hourZhi)` → `ChengGuResult`
- `getMonthCalendar(year, month)` → 月历日期数组

### 后续补充区

待更新

---

### 5.2 模块二：八字排盘核心（bazi - 阶段一基础）

**文件**：`src/lib/lunar.ts`（getBaziResult）+ `src/components/bazi/BaziPanel.tsx`

#### 排盘输入

- 支持**公历/农历**切换输入（农历闰月用负数月份）
- 支持**立春换年**开关（默认开启，八字标准以立春为年界）
- 支持**晚子时流派**（sect=2，默认晚子时日柱按明天）
- 年份范围：1900-2100，时辰精确到两小时制

#### 四柱计算逻辑

1. **日期创建**：`Solar.fromYmdHms()` 携带小时确保时柱准确
2. **八字获取**：`lunar.getEightChar()` + `setSect(sect)` 设置流派
3. **年柱处理**：`useLiChun=true` 时取 `eightChar.getYearGan/Zhi`（立春分年），`false` 时取 `lunar.getYearInGanZhi()`（正月初一分年）
4. **逐柱构建**：每柱包含天干、地支、五行、纳音、十神、藏干及其十神

#### 十神计算规则（`getShiShen`）

**核心逻辑：日干五行 vs 目标干五行 + 阴阳异同**

| 关系 | 同阴阳 | 异阴阳 |
|------|--------|--------|
| 同我（同五行） | 比肩 | 劫财 |
| 我生 | 食神 | 伤官 |
| 我克 | 偏财 | 正财 |
| 生我 | 偏印 | 正印 |
| 克我 | 七杀 | 正官 |

#### 五行平衡分析（`computeWuxingAnalysis`）

- **统计范围**：天干 4 字 + 地支 4 字 = 8 字
- **缺失**：计数为 0 的五行
- **偏旺**：计数 ≥ 3 的五行
- **日主强弱粗略评估**：统计"同我（比劫）+ 生我（印星）"数量 → ≥5 偏强，≤2 偏弱，其余中和
- **用神建议**：偏弱宜补同我+生我五行，偏强宜泄耗（我生+我克+克我）

#### 胎元与命宫

- **胎元**：月干进一位 + 月支进三位
- **命宫**：地支 = `(14 - 月支寅序 - 时支寅序) % 12` → 转回子=0 序列；天干用五虎遁月法推算

#### 地支藏干（`ZHI_CANG_GAN`）

按传统典籍定义本气/中气/余气，如：寅藏甲丙戊，丑藏己癸辛，子藏癸……

### 后续补充区

待更新

---

### 5.3 模块三：大运系统（bazi - 阶段一扩展）

**文件**：`src/lib/lunar.ts`（buildDaYunResult）+ `src/components/bazi/DaYunTimeline.tsx`

#### 大运计算流程

1. 利用 lunar-javascript 的 `eightChar.getYun(gender)` 获取 Yun 对象
2. 读取 **起运岁数/月/天**，生成描述（如"5岁3个月"）
3. **顺逆判定**：`yun.isForward()` → 阳男阴女顺排，阴男阳女逆排
4. 获取 `yun.getDaYun(9)` 共 9 步（index 0 为过渡期，1-8 为正式大运）
5. 每步大运取干支 → 计算十神、藏干、纳音

#### 大运评分算法（`scoreDaYun`）

**基准分 2.5（满分 5）**，四维评估：

1. **天干五行适配**（±0.8）：天干五行属用神 +0.8，属忌神 -0.6
2. **地支五行适配**（±0.6）：地支五行属用神 +0.6，属忌神 -0.4
3. **补缺五行**（+0.3）：干支五行补充原局缺失的五行
4. **合冲关系**：与原局四柱的**地支六冲 -0.2**、**地支六合 +0.15**、**天干五合 +0.1**

**等级划分**：≥4.0 上吉 / ≥3.0 小吉 / ≥2.0 平 / ≥1.0 小凶 / <1.0 凶

#### 六冲/六合/五合关系表

- **地支六冲**：子午、丑未、寅申、卯酉、辰戌、巳亥
- **地支六合**：子丑、寅亥、卯戌、辰酉、巳申、午未
- **天干五合**：甲己、乙庚、丙辛、丁壬、戊癸

#### UI 交互

- 横向可滚动卡片列表，每张卡片显示：等级标签 → 天干/地支（五行配色）→ 十神 → 年龄范围 → 年份范围 → 纳音
- **当前大运**（包含今年的运期）朱砂红高亮
- **点击选中**大运卡片 → 触发流年计算
- 排盘时**自动选中当前大运**

### 后续补充区

待更新

---

### 5.4 模块四：流年系统（bazi - 阶段二）

**文件**：`src/lib/lunar.ts`（buildLiuNianList, getYearGanZhi, detectRelations, scoreLiuNian）+ `src/components/bazi/LiuNianGrid.tsx`

#### 流年干支计算

**`getYearGanZhi(year)`**：基于六十甲子循环，甲子年 = 公元 4 年起算

```
ganIndex = (year - 4) % 10
zhiIndex = (year - 4) % 12
```

> 年界以公历 1 月 1 日为准（非立春），用于流年运势展示足够精确。

#### 合冲关系检测（`detectRelations`）

检测维度（生成关系标签如"甲己合·运""子午冲·日"）：

1. 流年天干 vs 大运天干 → 天干五合
2. 流年地支 vs 大运地支 → 六冲、六合
3. 流年天干 vs 原局各柱天干 → 天干五合
4. 流年地支 vs 原局各柱地支 → 六冲、六合

#### 流年评分算法（`scoreLiuNian`）

与大运评分类似，**基准分 2.5**：

1. 天干五行适配（±0.7）
2. 地支五行适配（±0.5）
3. 补缺五行（+0.2）
4. 合冲关系影响：冲 -0.15，合 +0.1

#### UI 交互

- **5×2 网格**展示选定大运的 10 年流年
- 每格：年份 → 天干/地支 → 十神 → 年龄 → 等级标签 → **金色简洁断语（桌面端）** → 关系标签（合绿/冲红）
- 当前年份朱砂红高亮标记"今年"
- **点击流年格子**：金色边框高亮 + 微放大，下方展开联动详情面板
- **hover 效果**：背景变宣纸色，边框变金色
- 底部纳音一览（金色小标签）
- **点击大运卡片切换**不同十年的流年视图

#### 流年格子简洁断语（`SHISHEN_BRIEF`）

每个十神对应一句不超 15 字的简要结论，金色文字显示在格子底部（桌面端）：

| 十神 | 断语 |
|------|------|
| 比肩 | 竞争增多，宜守不宜攻 |
| 劫财 | 社交活跃，防破财之象 |
| 食神 | 才华外显，创作好时机 |
| 伤官 | 创新突破，但防口舌 |
| 正财 | 正财入库，收入稳增 |
| 偏财 | 偏财可期，适度投资 |
| 正官 | 贵人提携，利升迁 |
| 七杀 | 压力并存，锻炼成长 |
| 正印 | 学业有利，贵人助力 |
| 偏印 | 沉淀期，宜思考钻研 |

### 后续补充区

待更新

---

### 5.5 模块五：四维分析与五行力量图（bazi - 阶段三）

#### 5.5.1 四维分析（`analyzeFourDimensions`）

**文件**：`src/lib/lunar.ts` + `src/components/bazi/AnalysisPanel.tsx`

四个维度各输出：评分(0-100) + 等级 + 关键词 + 简要解读

**事业分析规则**：
- 官杀 1-2 个 +15 分（"官星得力"），≥3 -5 分（"官杀混杂"），0 -5 分
- 印星 ≥1 +10 分（"印星扶持"）
- 食伤 1-2 +5 分，≥3 -5 分（"伤官过旺"）
- 日主中和 +10，身强任官 +5，身弱官重 -10

**财运分析规则**：
- 财星 1-2 +15，≥3 且身强 +10，≥3 且身弱 -5，0 -10
- 食伤生财 +10，比劫争财 -8
- 身强担财 +8，身弱财重 -8

**婚姻分析规则**：
- 男看正财、女看正官；1-1.5 个 +15，≥2 -5，<0.5 -8
- **日支逢冲** -8，**日支逢合** +5
- 女命伤官 ≥1.5 -10（"伤官克夫"），男命劫财 ≥1.5 -8

**健康分析规则**：
- 每个缺失五行 -10 分，每个过旺(≥4)五行 -8 分
- 五行俱全 +10，日主中和 +8，偏弱 -5

**等级划分**：≥85 上吉 / ≥70 吉 / ≥55 中 / ≥40 平 / <40 不利

#### 5.5.2 动态五行力量图（`computeDynamicWuxing`）

**文件**：`src/lib/lunar.ts` + `src/components/bazi/WuXingChart.tsx`

**权重体系**：

| 来源 | 天干权重 | 地支权重 | 藏干权重 |
|------|----------|----------|----------|
| 原局 | 1.0 | 0.8 | 本气0.5 / 中气0.3 / 余气0.15 |
| 大运 | 0.6 | 0.4 | — |
| 流年 | 0.4 | 0.3 | — |

**三层叠加**：原局 → +大运 → +大运+流年，用户可切换对比

**SVG 雷达图实现**：
- 五角形网格（5 层），角度配置：木(-90°) → 火(-18°) → 土(54°) → 金(126°) → 水(198°)
- 数据区域半透明朱砂红填充 + 朱砂描边
- 数据点用对应五行色
- 右侧数值列表带差值对比（+大运/+流年时显示与原局的增减）

### 后续补充区

待更新

---

### 5.6 模块六：十维度命局解读（bazi - 阶段四）

**文件**：`src/lib/bazi-interpretation.ts` + `src/components/bazi/InterpretationPanel.tsx` + `DimensionCard.tsx`

#### 总体架构

- **入口函数**：`getBaziInterpretation(baziResult, daYunResult, gender)` → `BaziInterpretation`
- **十神分组统计**：天干权重 1.0，藏干本气 0.4、中气 0.25、余气 0.15
- 分组：比劫（比肩+劫财）、食伤（食神+伤官）、财星（正财+偏财）、官杀（正官+七杀）、印星（正印+偏印）
- **dominant 计算**：五组中权重最大者为命局主导特征
- **大运时间参考**：扫描大运列表匹配特定十神或分数区间，自动标注关键运期

#### 十个维度判断规则

**① 性格与天赋**（colorElement=木）
- 日主天干 → 十干性格表（甲=刚正坚韧、乙=温柔灵活、丙=热情开朗…）
- 日主阴阳 → 外向/内敛倾向
- 十神 dominant 组 → 天赋方向：比劫=独立创业、食伤=文学艺术技术、财星=商业经营、官杀=行政管理、印星=教育科研
- 各组 ≥1.5 时追加性格描述段落

**② 学业与智慧**（colorElement=水）
- **食神**=踏实理解力，**伤官**=创新思维，**正印**=学历考试运，**偏印**=研究能力
- **文昌贵人检测**：基于年干查表（甲→巳、乙→午…），判断该地支是否出现在四柱中
- 大运走印星/食伤期 → 标注学业关键期
- 伤官 > 食神 → 偏理工创新型；反之偏文理兼修型

**③ 事业与方向**（colorElement=金）
- 正官透出 → 体制内/管理岗；七杀得制 → 创业/军警
- 食伤旺+有财 → 自由职业/自主创业
- **用神五行→行业**：木=教育出版环保、火=科技互联网娱乐、土=房地产建筑、金=金融法律制造、水=贸易物流旅游
- 身强→能承受高压、身弱→宜团队合作

**④ 财运与赚钱模式**（colorElement=土）
- 正财 → 稳定薪资积累型；偏财 → 投资收益型
- **身强+财星=守财型**；**身弱+财旺=来去型**
- 食伤生财格 → "凭才华赚钱"
- 比劫夺财 → 合作破财风险
- 大运走财星期 → 旺财期，走劫财期 → 破财风险期

**⑤ 感情与婚姻**（colorElement=火）
- **男命**：正财=妻星，偏财=多情指标；**女命**：正官=夫星，七杀=感情波折
- 日支=配偶宫，五行推断配偶性格（木=温和上进、火=热情直爽…）
- 日支冲 → 婚姻波动建议晚婚；日支合 → 和睦
- **桃花星检测**：基于年支/日支查三合局（寅午戌→卯、巳酉丑→午、申子辰→酉、亥卯未→子），判断是否出现在四柱地支中
- 女命伤官旺 → "伤官克夫"，需包容理解

**⑥ 家庭与父母**（colorElement=土）
- 年柱 → 祖上/家庭背景；月柱 → 父母宫
- **偏财=父亲缘**，**正印=母亲缘**（男女通用）
- 月柱十神 → 父母教育风格描述（正官=管教严、正印=慈爱、伤官=观念分歧…）

**⑦ 子女**（colorElement=木）
- 时柱=子女宫
- **男命**：正官=女儿、七杀=儿子；**女命**：食神=女儿、伤官=儿子
- 时柱五行 → 子女性格预测
- 时柱地支逢冲 → 与子女可能有距离感

**⑧ 健康与隐患**（colorElement=水）
- **五行→脏腑对应**：木=肝胆、火=心脏/小肠、土=脾胃、金=肺/大肠、水=肾/膀胱
- 缺失五行 → 对应脏腑风险 + 养生建议
- 过旺五行(≥4) → 系统过度活跃风险
- **扫描大运**：大运五行如果克制命局缺失五行 → 标注为健康风险运期

**⑨ 贵人与小人**（colorElement=金）
- 正印=师长贵人、正官=领导贵人、食神=才华引贵
- **天乙贵人检测**：基于日干查表（甲戊→丑未、乙己→子申…），判断是否出现在四柱地支中
- 比劫旺(≥2) → 同辈竞争/小人；七杀旺(≥1.5) → 强势压制者
- 大运走印星/正官 → 贵人运旺期；走劫财/七杀+低分 → 防小人期

**⑩ 人生大运节奏**（colorElement=火）
- 遍历全部大运，每步基于十神输出主题：
  比肩=独立发展、劫财=社交花销、食神=才华安逸、伤官=创新突破、正财=稳定聚财、偏财=意外收获、正官=事业上升、七杀=压力挑战、正印=贵人学习、偏印=思考沉淀
- 找出**黄金期**（score≥3.5）和**低谷期**（score≤1.5）高亮标注
- 判断运势整体走向（末尾分数>开头 → "越老越顺"）
- 检测大运地支与原局的冲合关系

#### UI 交互规范

- **折叠面板**：10 个维度默认收起（第一个默认展开），点击展开
- **标题配色**：每个维度使用对应 `colorElement` 的五行色
- **核心结论区**：左侧色条 + 楷体文字
- **关键结论**：金色/绿色/红色高亮卡片（★正面 / ▲负面 / ◆中性）
- **大运时间参考**：底部小标签列表，机遇=绿色、风险=红色、中性=灰色

### 后续补充区

待更新

---

### 5.7 模块七：流年联动详解系统（bazi - 阶段五）

**文件**：`src/lib/lunar.ts`（getLiuNianAnalysis）+ `src/components/bazi/LiuNianDetailPanel.tsx` + `LiuNianGrid.tsx`（增强）

#### 总体架构

- **入口函数**：`getLiuNianAnalysis(baziResult, daYun, liuNian)` → `LiuNianAnalysis`
- **触发方式**：点击流年格子 → `useMemo` 实时计算 → 下方展开详情面板
- **三层联动**：原局八字 + 当前大运 + 流年干支

#### 联动分析逻辑

**① 原局联动（`yuanJuRelations`）**

逐柱扫描流年与四柱的关系：

| 对比维度 | 检测内容 | 输出 |
|----------|----------|------|
| 流年天干 vs 各柱天干 | 五行生克关系 + 天干五合 | ganRelation + clashOrHarmony |
| 流年地支 vs 各柱地支 | 五行生克关系 + 地支冲/合 | zhiRelation + clashOrHarmony |

- **五行关系判定**（`getWxRelation`）：以流年为主体视角 → 同类/相生/相克/被生/被克
- **影响维度映射**：年柱→家庭/长辈、月柱→事业/工作、日柱→自身/婚姻、时柱→子女/下属
- **原局总结**：综合冲合状态 + 是否补缺五行，生成一句概括

**② 大运联动（`daYunInteraction`）**

- 流年天干 vs 大运天干 → 五行互动描述
- 流年地支 vs 大运地支 → 五行互动描述
- 检测流年与大运的天干合、地支冲/合
- **综合倾向判定**：基于日主用神/忌神，评估流年+大运五行组合的利弊
  - 流年大运皆利 → positive："运势上行"
  - 流年利大运不利 → positive："缓解大运不利"
  - 流年不利大运利 → neutral："大运底子好仍可支撑"
  - 流年大运皆不利 → negative："需谨慎行事"

**③ 核心断语（`verdicts`）**

基于**十神流年主题表**（`SHISHEN_LIUNIAN_THEME`），每个十神预设四维度断语：

| 十神 | 事业 | 财运 | 感情 | 健康 |
|------|------|------|------|------|
| 比肩 | 竞争加剧 | 防分财 | 平淡 | 精力旺盛 |
| 劫财 | 防被抢功 | 破财风险 | 异性缘多有争端 | 控制脾气 |
| 食神 | 创意爆发 | 才华变现 | 甜蜜惬意 | 注意饮食 |
| 伤官 | 突破但易得罪人 | 投机风险 | 口舌是非 | 口腔消化 |
| 正财 | 稳定加薪 | 正财入库 | 男利婚姻 | 注意休息 |
| 偏财 | 意外机遇 | 偏财可期 | 桃花旺 | 注意肝胃 |
| 正官 | 升迁贵人 | 稳中有升 | 女利婚姻 | 注意心血管 |
| 七杀 | 压力考验期 | 险中求财 | 波折磨合 | 注意睡眠 |
| 正印 | 贵人助力 | 稳守为主 | 平和温馨 | 利养生 |
| 偏印 | 钻研技术 | 财运平淡 | 冷淡需经营 | 消化和情绪 |

断语类型判定规则：
- **事业 positive**：官印类十神 + 流年合用神或评分 ≥3.0
- **财运 positive**：财星/食神 + 身不弱
- **感情 positive**：正财/正官 + 评分 ≥2.5
- **健康 negative**：流年五行克制命局缺失五行脏腑，或身弱逢七杀

**④ 关键提示（`tips`）**

自动扫描生成风险和机会提示：

| 条件 | 类型 | 示例提示 |
|------|------|----------|
| 流年与原局有冲 | risk | "子午地支冲：自身/婚姻方面有变动或冲突风险" |
| 流年+大运五行皆非用神 | risk | "大事宜缓不宜急" |
| 流年劫财当令 | risk | "注意财务安全，不宜借贷担保" |
| 身弱逢七杀 | risk | "工作压力大，注意健康和情绪管理" |
| 流年与原局有合 | opportunity | "卯戌地支合：事业/工作方面有合作或贵人机缘" |
| 流年补缺五行 | opportunity | "利于改善对应方面短板" |
| 流年+大运五行皆利 | opportunity | "适合积极进取、把握大机会" |
| 官印相生+高分 | opportunity | "升职加薪、考试晋升的好时机" |

#### UI 组件结构（`LiuNianDetailPanel`）

面板五段式布局，新中式风格：

1. **标题栏**：宣纸底色，朱砂红标题"XXXX年 XX 流年详解"，右侧关闭按钮
2. **基础信息**：4 列网格 — 干支（五行色标签）、天干十神、地支主气十神、纳音
3. **原局联动**：总结文字 + 逐柱关系列表（每行：柱名、干支、天干关系、地支关系、冲合标签）
4. **大运联动**：天干/地支互动描述 + 综合倾向（正面绿/负面红/中性黄底色）
5. **核心断语**：2×2 卡片网格（事业💼/财运💰/感情💑/健康🏥），每张卡片带类型底色
6. **关键提示**：风险(红底 ▲) / 机会(绿底 ★) 条目列表
7. **底部声明**：灰色小字提示仅供参考

#### 交互细节

- 面板展开时自动 `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`
- 点击同一格子收起面板（toggle 逻辑）
- 点击不同格子自动切换内容
- 移动端面板占满宽度，桌面端与流年模块宽度一致（继承父容器宽度）

### 后续补充区

待更新

---

### 5.8 模块八：页面标签页系统

**文件**：`src/app/bazi/page.tsx`

#### 标签页设计

排盘完成后顶部出现标签页切换器（圆角容器 + 内嵌按钮）：

| 标签页 | 内容 |
|--------|------|
| **排盘分析** | BaziPanel → ElementAnalysis → DaYunTimeline → LiuNianGrid → WuXingChart + AnalysisPanel |
| **命局解读** | InterpretationPanel（10 维度折叠面板） |

#### 数据流

```
handlePaiPan() 按钮点击：
  → getBaziResult()           → result (BaziResult)
  → buildDaYunResult()        → daYunResult (DaYunResult)
  → analyzeFourDimensions()   → fourDimAnalysis (FourDimensionAnalysis)
  → getBaziInterpretation()   → interpretation (BaziInterpretation)
  → 自动选中当前大运 index

选中大运时 (useMemo)：
  → buildLiuNianList()        → liuNianData
  → computeDynamicWuxing()    → dynamicWuxing

点击流年格子时 (LiuNianGrid 内部 useMemo)：
  → getLiuNianAnalysis()      → selectedAnalysis (LiuNianAnalysis)
  → 渲染 LiuNianDetailPanel
```

### 后续补充区

待更新

---

## 六、关键数据接口汇总

### 6.1 核心类型

| 接口 | 文件 | 说明 |
|------|------|------|
| `CalendarResult` | lunar.ts | 公历/农历/干支/纳音/节气/宜忌完整日历信息 |
| `ChengGuResult` | lunar.ts | 称骨论命结果（年月日时重量+批语） |
| `BaziPillar` | lunar.ts | 单柱数据（干支+五行+十神+藏干） |
| `BaziResult` | lunar.ts | 八字排盘完整结果（四柱+日主+五行分析+胎元+命宫） |
| `WuxingAnalysis` | lunar.ts | 五行平衡分析（计数/缺失/偏旺/日主强弱/摘要） |
| `DaYunItem` | lunar.ts | 大运单柱（干支+年龄+年份+十神+评分+纳音） |
| `DaYunResult` | lunar.ts | 大运排盘结果（起运岁数+顺逆+大运列表） |
| `LiuNianItem` | lunar.ts | 流年单年（干支+年龄+十神+评分+关系标签） |
| `FourDimensionAnalysis` | lunar.ts | 四维分析（事业/财运/婚姻/健康各有评分+解读） |
| `DynamicWuxingData` | lunar.ts | 动态五行（原局/+大运/+流年三层力量值） |
| `LiuNianAnalysis` | lunar.ts | 流年联动分析完整结果（原局联动+大运联动+断语+提示） |
| `LiuNianYuanJuRelation` | lunar.ts | 流年与单柱的关系（五行生克+冲合+影响维度） |
| `LiuNianDaYunInteraction` | lunar.ts | 流年与大运的五行互动+吉凶倾向 |
| `LiuNianVerdict` | lunar.ts | 流年单维度断语（事业/财运/感情/健康） |
| `LiuNianTip` | lunar.ts | 流年关键提示（风险/机会） |
| `DimensionInterpretation` | bazi-interpretation.ts | 单维度解读（结论+详情+高亮+运期） |
| `BaziInterpretation` | bazi-interpretation.ts | 十维度解读完整结果 |

### 6.2 导出函数

| 函数 | 入参 | 出参 | 说明 |
|------|------|------|------|
| `getCalendarInfo` | year, month, day, hour | CalendarResult | 完整历法信息 |
| `getChengGu` | yearGanZhi, lunarMonth, lunarDay, hourZhi | ChengGuResult | 称骨论命 |
| `getBaziResult` | year, month, day, hour, options | BaziResult | 八字排盘 |
| `buildDaYunResult` | year, month, day, hour, gender, baziResult, options | DaYunResult | 大运排盘 |
| `buildLiuNianList` | daYunItem, baziResult | LiuNianItem[] | 流年列表 |
| `analyzeFourDimensions` | baziResult, gender | FourDimensionAnalysis | 四维分析 |
| `computeDynamicWuxing` | baziResult, daYun?, liuNian? | DynamicWuxingData | 动态五行 |
| `getBaziInterpretation` | baziResult, daYunResult, gender | BaziInterpretation | 十维度解读 |
| `getShiShen` | dayGan, targetGan | string | 十神计算 |
| `getYearGanZhi` | year | string | 年份干支 |
| `getNaYin` | ganZhi | string | 纳音查表 |
| `getLiuNianAnalysis` | baziResult, daYun, liuNian | LiuNianAnalysis | 流年联动分析 |

### 6.3 梅花易数导出函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `divinateByTime` | meihua/divination.ts | 时间起卦 |
| `divinateByNumber` | meihua/divination.ts | 数字起卦 |
| `divinateByText` | meihua/divination.ts | 文字起卦 |
| `performAnalysis` | meihua/analysis.ts | 体用五行生克分析 |

### 6.4 六爻纳甲导出函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `paipan` | liuyao/paipan.ts | 10步排盘管线（起卦→识卦→定宫→纳甲→六亲→六神→世应→伏神→旺衰→变卦） |
| `performAnalysis` | liuyao/analysis.ts | 6层分析引擎（定用神→查原忌仇→评旺衰→动爻分析→综合判断→文案输出） |

### 6.5 奇门遁甲导出函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `yinpan_lucking_data` | qimen/luckingPaipan.ts | 阴盘完整排盘（含隐干/月将/建除） |
| `analyzeQimen` | qimen/luckingAnalysis.ts | 阴盘格局分析 |
| `calculateYangpan` | qimen/yangpanPipeline.ts | 阳盘排盘（拆补/置闰/茅山） |
| `analyzeYangpan` | qimen/yangpanAnalysis.ts | 阳盘格局分析 |

### 6.6 太乙神数导出函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `calculateTaiyi` | taiyi/paipan.ts | 太乙排盘（统宗/金镜，年/月/日/时四计） |
| `analyzeTaiyi` | taiyi/analysis.ts | 太乙分析引擎 |

### 6.7 起名测名导出函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `analyzeNaming` | naming/analysis.ts | 姓名五格数理综合分析 |
| `generateNames` | naming/nameGenerator.ts | 三阶段智能起名引擎 |

### 后续补充区

待更新

---

## 七、开发过程关键决策记录

### 7.1 技术决策

1. **lunar-javascript 集成方式**：因无 TypeScript 类型定义，使用 `require` 方式引入 + eslint-disable 注释
2. **年干支计算简化**：流年干支使用 `(year-4)%60` 简化计算（以公历 1 月 1 日为年界），不走立春分年，对于流年展示足够精确
3. **文件拆分**：解读引擎独立为 `bazi-interpretation.ts`，通过 `lunar.ts` 的 re-export 保持对外 API 统一
4. **组件共享**：10 个解读维度使用通用 `DimensionCard` 折叠卡片组件，避免 10 个几乎相同的独立组件文件
5. **SVG 雷达图**：使用纯 SVG 实现五行力量图，不引入第三方图表库，减少依赖
6. **流年分析内聚**：`getLiuNianAnalysis` 放在 `lunar.ts` 而非独立文件，因其强依赖原局/大运数据结构和五行/十神工具函数，保持内聚性
7. **流年详情面板内嵌**：`LiuNianDetailPanel` 由 `LiuNianGrid` 内部按需渲染，不在 `page.tsx` 层面管理状态，降低页面组件复杂度
8. **模块化计算库**：梅花/六爻/奇门/太乙/起名各自独立 lib 目录，内部再拆分 types/constants/核心算法/分析引擎/index 导出，保持关注点分离
9. **Strategy 模式**：六爻纳甲策略用 Strategy 模式支持京房/藏山卜双流派切换；奇门遁甲阳盘定局法支持拆补/置闰/茅山三种算法
10. **API 纯增量设计**：API 系统零修改现有页面代码，仅在 `src/app/api/v1/` 下新增路由文件，直接调用 `src/lib/` 现有计算函数
11. **CORS 中间件**：使用 Next.js middleware 统一处理跨域，仅匹配 `/api/*` 路径，不影响前端页面
12. **OpenAPI 动态生成**：`/api/v1/openapi.json` 为动态路由而非静态文件，自动检测当前域名填入 servers 字段
13. **AI 语义化描述**：OpenAPI spec 和 ai-plugin.json 中的描述针对 AI 理解优化，说明"何时使用"而非"如何实现"

### 7.2 开发过程问题与解决

1. **文件修改冲突**：编辑 `page.tsx` 时反复遇到 "File has been modified since read" 错误（linter/formatter 在 read 和 write 之间自动运行）。**解决方案**：改为读取完整文件后一次性完整重写，而非多次增量 Edit
2. **大运过渡期处理**：`yun.getDaYun(9)` 返回的 index 0 为出生到起运的过渡期，正式大运从 index 1 开始，循环时需 `for (let i = 1; ...)`

### 7.3 开发阶段划分

| 阶段 | 内容 | 状态 |
|------|------|------|
| 阶段一 | 大运核心数据层 + UI 组件 + 性别选择 + 页面集成 | ✅ 完成 |
| 阶段二 | 流年数据层 + 关系检测 + UI 组件 + 大运联动 | ✅ 完成 |
| 阶段三 | 四维分析 + 动态五行力量图 + SVG 雷达图 | ✅ 完成 |
| 阶段四 | 十维度命局解读引擎 + 折叠面板 + 标签页系统 | ✅ 完成 |
| 阶段五 | 流年联动详解（getLiuNianAnalysis + LiuNianDetailPanel + LiuNianGrid 增强） | ✅ 完成 |
| 阶段六 | 玉匣择吉（诸神/神煞/建除/旬空/天赦/问答）+ 穿衣指南（双模式+评分算法） | ✅ 完成 |
| 阶段七 | 梅花易数（三种起卦+体用分析）| ✅ 完成 |
| 阶段八 | 阴盘奇门遁甲（九宫可视化+隐干/月将/建除+格局分析）| ✅ 完成 |
| 阶段九 | 阳盘奇门遁甲（拆补/置闰/茅山定局+格局分析）| ✅ 完成 |
| 阶段十 | 六爻纳甲（四种起卦+双流派+10步排盘管线+6层分析+10场景）| ✅ 完成 |
| 阶段十一 | 太乙神数（统宗/金镜双流派+年月日时四计+经典案例库40+例）| ✅ 完成 |
| 阶段十二 | 起名测名（五格数理+三才配置+八字匹配+智能起名+汉字查询）| ✅ 完成 |
| 阶段十三 | API v1 系统（7个计算端点+CORS+OpenAPI 3.1+AI Plugin清单+健康检查）| ✅ 完成 |
| 阶段十四 | 开发文档页面（/docs，API手册+AI Skills接入指南两大板块）| ✅ 完成 |

### 后续补充区

待更新

---

## 八、模块清单

### 已完成模块

| 模块 | 页面路由 | 完成版本 |
|------|----------|----------|
| 玉匣通书（公农历+择吉+穿衣） | /calendar | v1.0 |
| 八字排盘（四柱+大运+流年+十维度） | /bazi | v1.0 |
| 梅花易数 | /meihua | v3.0 |
| 阴盘奇门遁甲 | /qimen/lucking | v3.0 |
| 阳盘奇门遁甲 | /qimen/yangpan | v4.0 |
| 六爻纳甲 | /liuyao | v4.0 |
| 太乙神数 | /taiyi | v5.0 |
| 起名测名 | /naming | v5.0 |
| API v1 系统（7个计算端点） | /api/v1/* | v6.0 |
| AI Skills 基础设施 | /.well-known + /api/v1/openapi.json | v6.0 |
| 开发文档页面 | /docs | v6.0 |

### 待开发模块

| 模块 | 页面路由 | 当前状态 |
|------|----------|----------|
| 易学博客 | /blog | 占位页面 |
| 我的笔记 | /notes | 占位页面 |
| 免费资源 | /resources | 占位页面 |

### 后续补充区

待更新

---

## 九、部署与构建

- **构建命令**：`npm run build`（Next.js 16 + Turbopack）
- **页面类型**：静态页面（○ Static）+ API 动态路由（ƒ Dynamic）+ CORS 中间件（ƒ Proxy）
- **编译验证**：每个开发阶段完成后均执行 `npm run build` 确认零错误
- **API 路由**：8 个动态端点（7个计算 + health），通过 middleware 统一添加 CORS 头
- **AI 平台接入**：部署后 AI 平台填入域名即可自动发现并注册全部技能

### 后续补充区

待更新

---

> **文档维护说明**：后续开发新功能后，在对应章节的「后续补充区」追加内容，或新增章节。版本号递增更新，归档时间同步更新。
