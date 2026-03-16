# 阴盘奇门遁甲排盘算法教程

基于王凤麟道家阴盘体系的完整排盘算法教程。本文结合实际源码，从类型系统、数据常量、排盘九步流程、暗干隐干计算、格局分析引擎到移星换斗，逐层讲解全部实现细节。

参考书目：王凤麟《道家阴盘奇门遁甲》

---

## 一、类型系统：排盘的骨架

排盘系统采用 TypeScript 严格类型定义，确保每个环节的数据结构可追踪。以下是核心类型（`types.ts`）：

### 1.1 基础元素类型

```typescript
/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 九宫编号（洛书数 1-9） */
export type PalaceId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 九星 */
export interface NineStar {
  name: string;                          // 如 "天蓬"
  originalPalace: PalaceId;              // 本宫编号
  element: WuXing;                       // 五行属性
  auspice: '吉' | '凶' | '中';          // 吉凶
}

/** 八门 */
export interface EightGate {
  name: string;                          // 如 "开门"
  originalPalace: PalaceId;              // 本宫编号
  element: WuXing;
  auspice: '吉' | '凶' | '中';
}

/** 八神 */
export interface Spirit {
  name: string;                          // 如 "值符"
}
```

### 1.2 单宫完整状态

排盘最终产出的核心数据单元——每个宫位的完整状态：

```typescript
/** 排盘后单宫的完整状态 */
export interface PalaceState {
  palaceId: PalaceId;
  earthStem: string;          // 地盘天干（元旦盘固定）
  heavenStem: string;         // 天盘天干（排盘计算）
  star: NineStar | null;      // 九星（5宫为null）
  gate: EightGate | null;     // 八门（5宫为null）
  spirit: Spirit | null;      // 八神（5宫为null）
  isVoid: boolean;            // 是否空亡
  isHorseStar: boolean;       // 是否马星
  yinPanDarkStem?: string;    // 阴盘暗干（王凤麟专属）
  yinPanHiddenStem?: string;  // 阴盘隐干（王凤麟专属）
}
```

### 1.3 排盘输入与输出

```typescript
/** 排盘输入配置 */
export interface QimenConfig {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;                              // 默认0，真太阳时需精确到分
  panType: 'yinPan' | 'zhuanPan' | 'feiPan';
  question: string;                             // 问事内容
  yearMing?: string;                            // 年命干支（阴盘体用分析）
  longitude?: number;                           // 问事地东经度（真太阳时修正）
  useTrueSolarTime?: boolean;                   // 阴盘默认 true
}

/** 排盘完整结果 */
export interface QimenResult {
  config: QimenConfig;
  timeElements: TimeElements;                   // 四柱+节气+农历
  zhiFuInfo: ZhiFuInfo;                         // 值符值使
  palaces: Record<PalaceId, PalaceState>;       // 九宫状态（核心产出）
  voidBranches: [string, string];               // 空亡地支对
  horseBranch: string;                          // 马星地支
  timestamp: string;
}
```

> 阴盘不使用 `JuInfo`（定局信息），这是与阳盘最根本的区别之一。

---

## 二、数据常量表：排盘的基石

所有排盘计算依赖的静态数据均定义在 `constants.ts` 中。这些常量构成了阴盘奇门的完整知识体系。

### 2.1 九宫基础信息

洛书九宫是奇门遁甲的空间坐标系，每个宫位有固定的方位、五行、对应地支：

```typescript
export const PALACE_INFO: Record<PalaceId, PalaceInfo> = {
  1: { id: 1, name: '坎一宫', direction: '正北', element: '水', branches: ['子'] },
  2: { id: 2, name: '坤二宫', direction: '西南', element: '土', branches: ['未', '申'] },
  3: { id: 3, name: '震三宫', direction: '正东', element: '木', branches: ['卯'] },
  4: { id: 4, name: '巽四宫', direction: '东南', element: '木', branches: ['辰', '巳'] },
  5: { id: 5, name: '中五宫', direction: '中央', element: '土', branches: [] },
  6: { id: 6, name: '乾六宫', direction: '西北', element: '金', branches: ['戌', '亥'] },
  7: { id: 7, name: '兑七宫', direction: '正西', element: '金', branches: ['酉'] },
  8: { id: 8, name: '艮八宫', direction: '东北', element: '土', branches: ['丑', '寅'] },
  9: { id: 9, name: '离九宫', direction: '正南', element: '火', branches: ['午'] },
};
```

洛书九宫的物理布局（对应九宫格展示）：

```
┌─────┬─────┬─────┐
│ 巽4  │ 离9  │ 坤2  │
│ 东南  │ 正南  │ 西南  │
├─────┼─────┼─────┤
│ 震3  │ 中5  │ 兑7  │
│ 正东  │ 中央  │ 正西  │
├─────┼─────┼─────┤
│ 艮8  │ 坎1  │ 乾6  │
│ 东北  │ 正北  │ 西北  │
└─────┴─────┴─────┘
```

### 2.2 九宫遍历序列

这是排盘旋转计算的核心数据结构。九星顺行、天盘干飞布、八神排布都依赖顺行序；八门排布依赖逆行序：

```typescript
/** 九宫顺行序（跳过5宫）：1→8→3→4→9→2→7→6 */
export const FORWARD_PALACE_ORDER: PalaceId[] = [1, 8, 3, 4, 9, 2, 7, 6];

/** 九宫逆行序（跳过5宫）：9→4→3→8→1→6→7→2 */
export const BACKWARD_PALACE_ORDER: PalaceId[] = [9, 4, 3, 8, 1, 6, 7, 2];
```

这两个序列是洛书数在环形排列中的两种遍历方向。所有的"旋转"计算本质上都是在这个环形数组上做模运算。

### 2.3 九星、八门、八神

```typescript
/** 九星（按本宫序排列） */
export const NINE_STARS: NineStar[] = [
  { name: '天蓬', originalPalace: 1, element: '水', auspice: '凶' },
  { name: '天芮', originalPalace: 2, element: '土', auspice: '凶' },
  { name: '天冲', originalPalace: 3, element: '木', auspice: '吉' },
  { name: '天辅', originalPalace: 4, element: '木', auspice: '吉' },
  { name: '天禽', originalPalace: 5, element: '土', auspice: '中' },
  { name: '天心', originalPalace: 6, element: '金', auspice: '吉' },
  { name: '天柱', originalPalace: 7, element: '金', auspice: '凶' },
  { name: '天任', originalPalace: 8, element: '土', auspice: '吉' },
  { name: '天英', originalPalace: 9, element: '火', auspice: '凶' },
];

/** 八门（按本宫序排列，5宫无门） */
export const EIGHT_GATES: EightGate[] = [
  { name: '休门', originalPalace: 1, element: '水', auspice: '吉' },
  { name: '死门', originalPalace: 2, element: '土', auspice: '凶' },
  { name: '伤门', originalPalace: 3, element: '木', auspice: '凶' },
  { name: '杜门', originalPalace: 4, element: '木', auspice: '中' },
  { name: '开门', originalPalace: 6, element: '金', auspice: '吉' },
  { name: '惊门', originalPalace: 7, element: '金', auspice: '凶' },
  { name: '生门', originalPalace: 8, element: '土', auspice: '吉' },
  { name: '景门', originalPalace: 9, element: '火', auspice: '中' },
];

/** 阴盘八神顺序（王凤麟体系） */
export const SPIRITS_YINPAN: Spirit[] = [
  { name: '值符' }, { name: '螣蛇' }, { name: '太阴' }, { name: '六合' },
  { name: '白虎' }, { name: '玄武' }, { name: '九地' }, { name: '九天' },
];
```

快速查找表由数组构建而成：

```typescript
/** 按本宫编号快速查找九星 */
export const STAR_BY_PALACE: Record<PalaceId, NineStar> = {} as Record<PalaceId, NineStar>;
for (const star of NINE_STARS) {
  STAR_BY_PALACE[star.originalPalace] = star;
}

/** 按本宫编号快速查找八门 */
export const GATE_BY_PALACE: Record<number, EightGate> = {};
for (const gate of EIGHT_GATES) {
  GATE_BY_PALACE[gate.originalPalace] = gate;
}
```

### 2.4 元旦盘与天干寄宫

元旦盘是阴盘体系的核心基准，地盘干固定不变，永不随时间旋转：

```typescript
/** 地盘元旦盘 —— 固定不变的核心基准 */
export const YUAN_DAN_EARTH: Record<PalaceId, string> = {
  1: '癸',  // 坎一宫 正北
  2: '己',  // 坤二宫 西南
  3: '卯',  // 震三宫 正东（注意：3宫为地支卯，非天干）
  4: '辰',  // 巽四宫 东南
  5: '戊',  // 中五宫 中央（天禽寄坤二）
  6: '亥',  // 乾六宫 西北
  7: '酉',  // 兑七宫 正西
  8: '丑',  // 艮八宫 东北
  9: '丙',  // 离九宫 正南
};

/**
 * 天干寄宫映射：每个天干在元旦盘中对应的固定宫位
 * 甲隐于六仪，不在此表中，调用方需先替换为旬首六仪
 */
export const STEM_TO_PALACE: Record<string, PalaceId> = {
  '乙': 3,  // 震三宫
  '丙': 9,  // 离九宫
  '丁': 4,  // 巽四宫
  '戊': 2,  // 中五宫寄坤二
  '己': 2,  // 坤二宫
  '庚': 8,  // 艮八宫
  '辛': 7,  // 兑七宫
  '壬': 6,  // 乾六宫
  '癸': 1,  // 坎一宫
};
```

### 2.5 三奇六仪序列

奇门遁甲中，甲隐于六仪之下（甲为统帅，不直接出现），排盘使用 9 个干而非 10 个：

```typescript
/** 天干布局序列：甲隐于六仪，排盘用9个干 */
export const STEM_SEQUENCE = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
```

其中乙、丙、丁为"三奇"（乙奇=日奇, 丙奇=月奇, 丁奇=星奇），戊己庚辛壬癸为"六仪"。

### 2.6 旬首映射表（60甲子→旬首信息）

10天干配12地支，每10个一旬，共6旬。每旬首为甲，甲隐于该旬对应的六仪下。同时每旬有2个地支"空亡"（配不到天干的2个地支）：

```typescript
/** 构建60甲子旬首映射表 */
function buildXunShouMap(): Record<string, XunShouInfo> {
  const map: Record<string, XunShouInfo> = {};
  const xunList = [
    { head: '甲子', yinStem: '戊', voidPair: ['戌', '亥'] },
    { head: '甲戌', yinStem: '己', voidPair: ['申', '酉'] },
    { head: '甲申', yinStem: '庚', voidPair: ['午', '未'] },
    { head: '甲午', yinStem: '辛', voidPair: ['辰', '巳'] },
    { head: '甲辰', yinStem: '壬', voidPair: ['寅', '卯'] },
    { head: '甲寅', yinStem: '癸', voidPair: ['子', '丑'] },
  ];

  for (const xun of xunList) {
    const ganStart = TIAN_GAN.indexOf(xun.head[0]);
    const zhiStart = DI_ZHI.indexOf(xun.head[1]);
    for (let i = 0; i < 10; i++) {
      const gan = TIAN_GAN[(ganStart + i) % 10];
      const zhi = DI_ZHI[(zhiStart + i) % 12];
      map[gan + zhi] = { xunShou: xun.head, yinStem: xun.yinStem, voidPair: xun.voidPair };
    }
  }
  return map;
}

export const XUN_SHOU_MAP = buildXunShouMap();
```

此函数动态生成60甲子到旬首的完整映射，例如：
- "乙丑" → `{ xunShou: "甲子", yinStem: "戊", voidPair: ["戌", "亥"] }`
- "丙午" → `{ xunShou: "甲辰", yinStem: "壬", voidPair: ["寅", "卯"] }`

### 2.7 马星与地支宫位映射

```typescript
/** 日支→马星地支（三合局冲法） */
export const MA_STAR_MAP: Record<string, string> = {
  '寅': '申', '午': '申', '戌': '申',   // 寅午戌三合→冲申
  '申': '寅', '子': '寅', '辰': '寅',   // 申子辰三合→冲寅
  '巳': '亥', '酉': '亥', '丑': '亥',   // 巳酉丑三合→冲亥
  '亥': '巳', '卯': '巳', '未': '巳',   // 亥卯未三合→冲巳
};

/** 地支到宫位映射 */
export const BRANCH_TO_PALACE: Record<string, PalaceId> = {
  '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4,
  '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6,
};
```

### 2.8 五行生克与对冲宫

```typescript
/** 五行相生：木→火→土→金→水→木 */
export const WX_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克：木→土→水→火→金→木 */
export const WX_KE: Record<WuXing, WuXing> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

/** 洛书对冲宫 */
export const OPPOSITE_PALACE: Record<PalaceId, PalaceId> = {
  1: 9, 9: 1,  // 坎↔离
  2: 8, 8: 2,  // 坤↔艮
  3: 7, 7: 3,  // 震↔兑
  4: 6, 6: 4,  // 巽↔乾
  5: 5,        // 中宫无对冲
};
```

---

## 三、九宫坐标系工具函数

`jiuGong.ts` 提供了在洛书九宫上进行方向遍历和偏移计算的基础工具。所有"旋转"操作的数学核心就在这里：

### 3.1 计算两宫之间的步数偏移

这是排盘中最关键的数学运算。九星、八门的旋转都依赖它来计算"转了几步"：

```typescript
/**
 * 计算两个宫位在给定方向上的步数偏移
 * @returns 从 fromPalace 到 toPalace 的步数（0-7）
 */
export function getOffsetBetween(
  fromPalace: PalaceId,
  toPalace: PalaceId,
  direction: 'forward' | 'backward',
): number {
  const order = direction === 'forward' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  const fromIdx = order.indexOf(fromPalace);
  const toIdx = order.indexOf(toPalace);
  if (fromIdx === -1 || toIdx === -1) return 0;
  return (toIdx - fromIdx + 8) % 8;
}
```

**原理**：将8个外宫排成一个环形数组（长度8），用模8运算求出从起点到终点经过多少步。例如：
- 顺行序 `[1, 8, 3, 4, 9, 2, 7, 6]`
- 从 2宫（索引5）到 3宫（索引2）：`(2 - 5 + 8) % 8 = 5`，即顺行5步

### 3.2 地支→宫位映射

```typescript
/** 地支→宫位映射（5宫寄2宫处理内置） */
export function branchToPalace(branch: string): PalaceId {
  return BRANCH_TO_PALACE[branch] || (1 as PalaceId);
}
```

---

## 四、排盘九步流程（核心算法）

以下是 `yinPanCalc.ts` 中排盘主函数的完整实现，逐步拆解。

### 主入口函数

```typescript
/**
 * 王凤麟阴盘奇门排盘主入口
 */
export function calculateYinPan(config: QimenConfig): QimenResult {
  const {
    year, month, day, hour, question, yearMing,
    minute = 0, longitude = 120, useTrueSolarTime = true,
  } = config;

  // Step 0: 真太阳时修正
  // Step 1: 提取时间四柱
  // Step 2: 确定旬首信息
  // Step 3: 确定值符星、值使门
  // Step 4: 九星排布
  // Step 5: 天盘干排布
  // Step 6: 八门排布
  // Step 7: 八神排布
  // Step 8: 空亡与马星
  // Step 9: 组装九宫完整状态
}
```

### Step 0：真太阳时修正

王凤麟阴盘体系要求将北京标准时间转为问事地的真太阳时。`trueSolarTime.ts` 实现：

```typescript
/**
 * 公式：真太阳时 = 北京时间 + 4×(当地经度 - 120) 分钟
 * 120度为东八区（北京时间）标准经度
 */
export function toTrueSolarTime(
  year: number, month: number, day: number,
  hour: number, minute: number, longitude: number,
): TrueSolarTimeResult {
  // 经度差修正：每差1度 = 4分钟
  const longitudeCorrection = 4 * (longitude - 120);

  // 应用到时间
  let totalMinutes = hour * 60 + minute + longitudeCorrection;

  // 处理跨日（修正后可能到前一天或后一天）
  let dayOffset = 0;
  while (totalMinutes >= 1440) { totalMinutes -= 1440; dayOffset++; }
  while (totalMinutes < 0)     { totalMinutes += 1440; dayOffset--; }

  const correctedHour = Math.floor(totalMinutes / 60);
  const correctedMinute = Math.round(totalMinutes % 60);
  const d = new Date(year, month - 1, day + dayOffset);

  return {
    year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
    hour: correctedHour, minute: correctedMinute,
    longitudeCorrection: Math.round(longitudeCorrection * 10) / 10,
    totalCorrection: Math.round(longitudeCorrection * 10) / 10,
  };
}
```

**示例**：
- 北京（东经116.4°）：修正 = 4 × (116.4 - 120) = **-14.4分钟**（比标准时慢14分钟）
- 乌鲁木齐（东经87.6°）：修正 = 4 × (87.6 - 120) = **-129.6分钟**（慢2小时多，可能跨时辰）

排盘主函数中的调用：

```typescript
  if (useTrueSolarTime) {
    const tst = toTrueSolarTime(year, month, day, hour, minute, longitude);
    effectiveYear = tst.year;
    effectiveMonth = tst.month;
    effectiveDay = tst.day;
    effectiveHour = tst.hour;
    // ...生成修正描述文字
  }
```

### Step 1：提取时间四柱

使用修正后的时间，通过 `lunar-javascript` 库提取年月日时四柱干支：

```typescript
function extractYinPanTime(
  year: number, month: number, day: number, hour: number,
): TimeElements {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  // setSect(2): 子时换日 —— 23:00起算新一天的日柱
  eightChar.setSect(2);

  const yearGan = eightChar.getYearGan();    // 年干
  const yearZhi = eightChar.getYearZhi();    // 年支
  const monthGan = eightChar.getMonthGan();  // 月干
  const monthZhi = eightChar.getMonthZhi();  // 月支
  const dayGan = eightChar.getDayGan();      // 日干
  const dayZhi = eightChar.getDayZhi();      // 日支
  const timeGan = eightChar.getTimeGan();    // 时干
  const timeZhi = eightChar.getTimeZhi();    // 时支

  return {
    yearGanZhi: yearGan + yearZhi,     // 如 "癸卯"
    monthGanZhi: monthGan + monthZhi,  // 如 "甲寅"
    dayGanZhi: dayGan + dayZhi,        // 如 "丁未"
    timeGanZhi: timeGan + timeZhi,     // 如 "乙丑"
    yearGan, yearZhi, monthGan, monthZhi,
    dayGan, dayZhi, timeGan, timeZhi,
    // ...节气、农历信息
  };
}
```

**关键点**：`setSect(2)` 表示子时换日规则 —— 23:00之后（晚子时）属于次日，日柱取次日干支。这是传统命理中的主流处理方式。

### Step 2：确定旬首信息

从 60 甲子查表中获取时干支所属的旬首、甲所隐的六仪、空亡地支对：

```typescript
  // Step 2: 确定旬首信息
  const timeXunInfo = XUN_SHOU_MAP[timeElements.timeGanZhi];
  // timeXunInfo = { xunShou: "甲子", yinStem: "戊", voidPair: ["戌", "亥"] }
```

### Step 3：确定值符星与值使门

这是阴盘排盘最核心的定位步骤。值符星和值使门是整个盘面旋转的锚点：

```typescript
/**
 * 确定值符星、值使门
 * 规则：旬首六仪 → 在元旦盘中找到对应宫位 → 该宫本位九星 = 值符星
 */
function findYinPanZhiFu(
  timeGanZhi: string,
  xunShouYinStem: string,
): ZhiFuInfo {
  const xunInfo = XUN_SHOU_MAP[timeGanZhi];
  const { xunShou, yinStem } = xunInfo;

  // 旬首六仪在元旦盘中的宫位
  let zhiFuPalace = STEM_TO_PALACE[xunShouYinStem];
  if (zhiFuPalace === 5) zhiFuPalace = 2 as PalaceId;  // 5宫寄2宫

  // 值符星 = 该宫本位九星
  const zhiFuStar = STAR_BY_PALACE[zhiFuPalace];

  // 值使门 = 该宫本位八门
  const zhiShiGate = GATE_BY_PALACE[zhiFuPalace];

  return {
    xunShou,
    xunShouYin: yinStem,
    zhiFuStar,              // 如 天芮
    zhiShiGate,             // 如 死门
    zhiFuOriginalPalace: zhiFuPalace,  // 如 2
  };
}
```

**具体推演示例**（时干支="乙丑"）：
1. 查旬首表：`乙丑` → 旬首`甲子`，隐仪`戊`
2. 查天干寄宫：`戊` → 宫位 `2`（坤二宫）
3. 查本位星：`STAR_BY_PALACE[2]` → `天芮`（值符星）
4. 查本位门：`GATE_BY_PALACE[2]` → `死门`（值使门）

### Step 4：九星排布（顺行旋转）

九星排布的规则：值符星从本位宫飞到**时干**在元旦盘的落宫，其余8颗星保持相对位置整体**顺行**旋转。

```typescript
function rotateYinPanStars(
  zhiFuInfo: ZhiFuInfo,
  effectiveTimeGan: string,
): Record<PalaceId, NineStar | null> {
  const starPlate: Record<number, NineStar | null> = {};

  // 时干在元旦盘的落宫（目标宫位）
  let targetPalace = STEM_TO_PALACE[effectiveTimeGan];
  if (targetPalace === 5) targetPalace = 2 as PalaceId;

  // 值符星从本位宫到目标宫位的顺行偏移
  const zhiFuOriginal = zhiFuInfo.zhiFuOriginalPalace;
  const offset = getOffsetBetween(zhiFuOriginal, targetPalace, 'forward');

  // 所有外宫星按同一偏移顺行旋转
  const order = FORWARD_PALACE_ORDER;  // [1, 8, 3, 4, 9, 2, 7, 6]
  for (let i = 0; i < 8; i++) {
    const originalPalace = order[i];
    const star = STAR_BY_PALACE[originalPalace];
    const newPalace = order[(i + offset) % 8];
    starPlate[newPalace] = star;
  }

  starPlate[5] = null;  // 5宫无星
  return starPlate as Record<PalaceId, NineStar | null>;
}
```

注意时干为"甲"时的特殊处理（在主函数中）：

```typescript
  // 甲隐于六仪：时干为甲时，用旬首六仪替代
  const effectiveTimeGan = timeElements.timeGan === '甲'
    ? timeXunInfo.yinStem
    : timeElements.timeGan;
```

**推演示例**（续前例，时干"乙"，值符星天芮在2宫）：
1. 时干"乙" → `STEM_TO_PALACE["乙"]` = 3（震三宫）
2. 偏移 = `getOffsetBetween(2, 3, 'forward')`
   - 顺行序 `[1, 8, 3, 4, 9, 2, 7, 6]`
   - 2宫索引=5，3宫索引=2
   - offset = `(2 - 5 + 8) % 8 = 5`
3. 每颗星向顺行方向旋转5步：
   - 天蓬(1宫,索引0) → `order[(0+5)%8]` = `order[5]` = 2宫
   - 天芮(2宫,索引5) → `order[(5+5)%8]` = `order[2]` = 3宫 ✓（值符星确实到了3宫）
   - 天冲(3宫,索引2) → `order[(2+5)%8]` = `order[7]` = 6宫
   - ...以此类推

### Step 5：天盘干排布（分段飞布）

天盘干的排布独立于九星旋转，有自己的飞布规则：

```typescript
/**
 * 天盘干排布
 * 以旬首六仪为起始干，从值符星最终落宫起，沿九宫顺行飞布
 * STEM_SEQUENCE = [戊, 己, 庚, 辛, 壬, 癸, 丁, 丙, 乙]
 */
function layoutYinPanHeavenStems(
  xunShouYinStem: string,
  effectiveTimeGan: string,
  zhiFuInfo: ZhiFuInfo,
): Record<PalaceId, string> {
  const heavenPlate: Record<number, string> = {};

  // 旬首六仪在 STEM_SEQUENCE 中的起始索引
  const startStemIdx = STEM_SEQUENCE.indexOf(xunShouYinStem);

  // 值符星最终落宫（即时干在元旦盘的落宫）
  let startPalace = STEM_TO_PALACE[effectiveTimeGan];
  if (startPalace === 5) startPalace = 2 as PalaceId;

  const order = FORWARD_PALACE_ORDER;
  const startPalaceIdx = order.indexOf(startPalace);

  let stemIdx = startStemIdx;
  let palaceIdx = startPalaceIdx;

  // 前4个干排入前4个外宫
  for (let i = 0; i < 4; i++) {
    heavenPlate[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx % 9];
    stemIdx++;
    palaceIdx++;
  }

  // 第5个干归中5宫
  heavenPlate[5] = STEM_SEQUENCE[stemIdx % 9];
  stemIdx++;

  // 后4个干排入后4个外宫
  for (let i = 0; i < 4; i++) {
    heavenPlate[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx % 9];
    stemIdx++;
    palaceIdx++;
  }

  return heavenPlate as Record<PalaceId, string>;
}
```

**关键理解**：天盘干总共9个（STEM_SEQUENCE长度为9），按"前4外宫 → 中5宫 → 后4外宫"的结构飞布，中5宫单独安排一个干，不跟随外宫的顺行序列。

### Step 6：八门排布（逆行旋转）

八门的旋转方向与九星**相反**——使用**逆行**序。且八门看的是**时支**（非时干）：

```typescript
/**
 * 八门排布
 * 值使门从本位宫→时支在元旦盘的落宫，其余门逆行偏移
 */
function rotateYinPanGates(
  zhiFuInfo: ZhiFuInfo,
  timeZhi: string,
): Record<PalaceId, EightGate | null> {
  const gatePlate: Record<number, EightGate | null> = {};

  const zhiShiOriginal = zhiFuInfo.zhiShiGate.originalPalace;

  // 时支对应的宫位
  let targetPalace = branchToPalace(timeZhi);
  if (targetPalace === 5) targetPalace = 2 as PalaceId;

  // 逆行偏移
  const offset = getOffsetBetween(zhiShiOriginal, targetPalace, 'backward');

  const order = BACKWARD_PALACE_ORDER;  // [9, 4, 3, 8, 1, 6, 7, 2]
  for (const gate of EIGHT_GATES) {
    const originalIdx = order.indexOf(gate.originalPalace);
    if (originalIdx === -1) continue;
    const newPalace = order[(originalIdx + offset) % 8];
    gatePlate[newPalace] = gate;
  }

  gatePlate[5] = null;  // 5宫无门
  return gatePlate as Record<PalaceId, EightGate | null>;
}
```

**阴盘八门排布的要点**：
- 九星看**时干**（天干），八门看**时支**（地支）—— 这是阴盘的独特规则
- 九星**顺行**旋转，八门**逆行**旋转

### Step 7：八神排布（顺行）

八神从值符星当前所在宫位起，按固定顺序顺行排布：

```typescript
function layoutYinPanSpirits(
  zhiFuInfo: ZhiFuInfo,
  starPlate: Record<PalaceId, NineStar | null>,
): Record<PalaceId, Spirit | null> {
  const spiritPlate: Record<number, Spirit | null> = {};

  // 找到值符星当前所在的宫位（在第4步旋转后的位置）
  let zhiFuCurrentPalace: PalaceId = 1;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const star = starPlate[p as PalaceId];
    if (star && star.name === zhiFuInfo.zhiFuStar.name) {
      zhiFuCurrentPalace = p as PalaceId;
      break;
    }
  }

  // 从值符星落宫起，顺行排布8神
  const order = FORWARD_PALACE_ORDER;
  const startIdx = order.indexOf(zhiFuCurrentPalace);
  const effectiveStartIdx = startIdx === -1 ? order.indexOf(2 as PalaceId) : startIdx;

  for (let i = 0; i < 8; i++) {
    spiritPlate[order[(effectiveStartIdx + i) % 8]] = SPIRITS_YINPAN[i];
    // SPIRITS_YINPAN = [值符, 螣蛇, 太阴, 六合, 白虎, 玄武, 九地, 九天]
  }

  spiritPlate[5] = null;
  return spiritPlate as Record<PalaceId, Spirit | null>;
}
```

**注意**：八神总是从值符星**当前**落宫（而非本宫）起排，值符永远排在第一位。

### Step 8：空亡与马星

```typescript
  // 空亡取日干支旬空，马星取时支定马
  const dayXunInfo = XUN_SHOU_MAP[timeElements.dayGanZhi];
  const voidBranches: [string, string] = dayXunInfo?.voidPair || ['', ''];
  const horseBranch = MA_STAR_MAP[timeElements.timeZhi] || '';
```

**注意区分**：
- **空亡**用**日柱**旬首的空亡地支对（非时柱）
- **马星**用**时支**查 `MA_STAR_MAP`

### Step 9：组装九宫

将所有计算结果组装为9个完整的宫位状态：

```typescript
function assembleYinPanPalaces(
  heavenPlate, starPlate, gatePlate, spiritPlate,
  voidBranches, horseBranch,
): Record<PalaceId, PalaceState> {
  const palaces: Record<number, PalaceState> = {};

  for (let p = 1; p <= 9; p++) {
    const pid = p as PalaceId;
    const info = PALACE_INFO[pid];

    // 空亡判断：该宫对应的地支是否在空亡对中
    const isVoid = info.branches.some(b => voidBranches.includes(b));
    // 马星判断：该宫对应的地支是否包含马星地支
    const isHorseStar = info.branches.includes(horseBranch);

    palaces[pid] = {
      palaceId: pid,
      earthStem: YUAN_DAN_EARTH[pid],     // 地盘干：固定元旦盘
      heavenStem: heavenPlate[pid] || '',  // 天盘干：Step 5 计算
      star: starPlate[pid] || null,        // 九星：Step 4 旋转
      gate: gatePlate[pid] || null,        // 八门：Step 6 旋转
      spirit: spiritPlate[pid] || null,    // 八神：Step 7 排布
      isVoid,
      isHorseStar,
    };
  }

  return palaces as Record<PalaceId, PalaceState>;
}
```

---

## 五、暗干与隐干（阴盘专属）

暗干和隐干是王凤麟阴盘体系独有的概念，定义在 `yinPan.ts` 中。

### 5.1 暗干计算

**规则**：某宫天盘干 → 找该干在元旦盘的落宫（STEM_TO_PALACE）→ 取该落宫的天盘干 = 暗干

本质上是天盘干之间的**交叉引用**：

```typescript
export function calculateDarkStems(result: QimenResult): Record<PalaceId, string> {
  const darkStems: Record<number, string> = {};
  const { palaces } = result;

  for (let p = 1; p <= 9; p++) {
    if (p === 5) { darkStems[p] = ''; continue; }
    const pid = p as PalaceId;
    const heavenStem = palaces[pid].heavenStem;

    // 天盘干在元旦盘的落宫
    let refPalace = STEM_TO_PALACE[heavenStem];
    if (!refPalace) { darkStems[p] = ''; continue; }
    if (refPalace === 5) refPalace = 2 as PalaceId;

    // 取该落宫的天盘干 = 暗干
    darkStems[p] = palaces[refPalace]?.heavenStem || '';
  }

  return darkStems as Record<PalaceId, string>;
}
```

**推演示例**：若3宫天盘干为"丙"：
1. `STEM_TO_PALACE["丙"]` = 9（离九宫）
2. 取9宫的天盘干 = 假设为"庚"
3. 则3宫暗干 = "庚"

### 5.2 隐干计算

**规则**：年命干 → 在元旦盘的落宫 → 取该落宫的天盘干 = 全局隐干（所有宫位共享）

```typescript
export function calculateHiddenStems(
  result: QimenResult, yearMing?: string,
): Record<PalaceId, string> {
  const hiddenStems: Record<number, string> = {};
  const { palaces } = result;

  if (!yearMing) { /* 全部为空 */ return ...; }

  const yearMingGan = yearMing[0];

  // 甲隐于六仪：年命干为甲时用对应六仪替代
  let effectiveYearGan = yearMingGan;
  if (yearMingGan === '甲') {
    const xunInfo = XUN_SHOU_MAP[yearMing];
    if (xunInfo) effectiveYearGan = xunInfo.yinStem;
  }

  // 在元旦盘找年命干所对应的宫位
  let yearMingPalace = STEM_TO_PALACE[effectiveYearGan];
  if (yearMingPalace === 5) yearMingPalace = 2 as PalaceId;

  // 年命干落宫的天盘干 = 全局隐干（所有外宫共享同一值）
  const hiddenStemValue = palaces[yearMingPalace]?.heavenStem || '';

  for (let p = 1; p <= 9; p++) {
    hiddenStems[p] = p === 5 ? '' : hiddenStemValue;
  }
  return hiddenStems as Record<PalaceId, string>;
}
```

### 5.3 移星换斗

交换两个宫位的星和天盘干（门、神、地盘干不动），然后重新计算暗干和隐干：

```typescript
export function applyStarSwap(result: QimenResult, action: SwapAction): QimenResult {
  const { sourcePalace, targetPalace } = action;
  if (sourcePalace === 5 || targetPalace === 5) {
    throw new Error('中五宫不能参与移星换斗');
  }

  const newPalaces = { ...result.palaces };
  const source = { ...newPalaces[sourcePalace] };
  const target = { ...newPalaces[targetPalace] };

  // 交换星
  const tempStar = source.star;
  source.star = target.star;
  target.star = tempStar;

  // 交换天盘干
  const tempHeavenStem = source.heavenStem;
  source.heavenStem = target.heavenStem;
  target.heavenStem = tempHeavenStem;

  newPalaces[sourcePalace] = source;
  newPalaces[targetPalace] = target;

  const newResult = { ...result, palaces: newPalaces };

  // 重新计算暗干和隐干（因为天盘干变了）
  return applyYinPanStems(newResult, newResult.config.yearMing);
}
```

---

## 六、格局分析引擎

`luckingAnalysis.ts` 实现了基于排盘结果的规则化格局识别与综合判断系统。

### 6.1 五行生克工具函数

所有分析的数学基础：

```typescript
function wxSheng(a: WuXing, b: WuXing): boolean {
  const map = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  return map[a] === b;  // a 生 b
}

function wxKe(a: WuXing, b: WuXing): boolean {
  const map = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  return map[a] === b;  // a 克 b
}

function wxRelation(a: WuXing, b: WuXing): string {
  if (a === b) return '比和';
  if (wxSheng(a, b)) return '生';
  if (wxSheng(b, a)) return '被生';
  if (wxKe(a, b)) return '克';
  if (wxKe(b, a)) return '被克';
  return '';
}
```

### 6.2 旺相休囚死判断

根据月支定季节当令五行，判断其他五行的旺衰状态：

```typescript
/** 根据月支判断当令五行 */
function getSeasonWX(monthGZ: string): WuXing {
  const monthZhi = monthGZ[1];
  const zhiMap: Record<string, WuXing> = {
    '寅': '木', '卯': '木',                     // 春季
    '巳': '火', '午': '火',                     // 夏季
    '申': '金', '酉': '金',                     // 秋季
    '亥': '水', '子': '水',                     // 冬季
    '辰': '土', '未': '土', '戌': '土', '丑': '土', // 季月
  };
  return zhiMap[monthZhi] || '土';
}

/** 五行旺衰：当令→旺，生当令→相，被当令克→休，克当令→囚，被当令生→死 */
function getStrength(wx: WuXing, seasonWX: WuXing): Strength {
  if (wx === seasonWX) return '旺';          // 同五行
  if (wxSheng(seasonWX, wx)) return '相';    // 当令生我
  if (wxSheng(wx, seasonWX)) return '休';    // 我生当令（泄气）
  if (wxKe(wx, seasonWX)) return '囚';       // 我克当令（耗力）
  return '死';                                // 当令克我
}
```

### 6.3 五大格局检测

#### 伏吟检测

6颗以上星/门回到本宫即为伏吟，主事情拖延反复：

```typescript
function detectFuyin(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];
  let starFuyinCount = 0;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const star = data.palaces[p].star;
    if (star && STAR_HOME[star] === p) starFuyinCount++;
  }
  if (starFuyinCount >= 6) {
    patterns.push({
      name: '星盘伏吟', type: '凶格', palace: 0, target: '九星',
      description: '九星多数回归本宫，主事情拖延、反复难决、进退两难，宜守不宜攻',
    });
  }
  // ...八门伏吟同理
  return patterns;
}
```

#### 反吟检测

6颗以上星/门落入对冲宫位即为反吟：

```typescript
function detectFanyin(data: PaipanData): PatternInfo[] {
  // ...
  const star = data.palaces[p].star;
  if (star) {
    const home = STAR_HOME[star];
    if (home !== 5 && OPPOSITE_PALACE[home] === p) starFanyinCount++;
  }
  // 6颗以上 → '主事情反复无常、变动剧烈、动荡不安'
}
```

#### 六仪击刑检测

六仪（戊己庚辛壬癸）落在特定宫位形成地支相刑：

```typescript
/** 六仪→被刑宫位 */
const JIXING_MAP: Record<string, number> = {
  '戊': 3,  // 甲子戊→子刑卯→震3
  '己': 2,  // 甲戌己→戌刑未→坤2
  '庚': 8,  // 甲申庚→申刑寅→艮8
  '辛': 9,  // 甲午辛→午午自刑→离9
  '壬': 4,  // 甲辰壬→辰辰自刑→巽4
  '癸': 4,  // 甲寅癸→寅刑巳→巽4
};

function detectJiXing(data: PaipanData): PatternInfo[] {
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const es = data.palaces[p].earthStem;
    for (const ch of es) {
      if (JIXING_MAP[ch] === p) {
        // 命中击刑！
      }
    }
  }
}
```

#### 入墓检测

五行的墓库对应固定宫位，星/门/天干落入对应墓库即为入墓：

```typescript
/** 五行墓库所在宫位 */
const WX_TOMB: Record<WuXing, number> = {
  '木': 2,  // 木墓在未→坤2
  '火': 6,  // 火墓在戌→乾6
  '土': 6,  // 土墓在戌→乾6
  '金': 8,  // 金墓在丑→艮8
  '水': 4,  // 水墓在辰→巽4
};

// 检测：若星的五行对应的墓库宫位 === 星当前所在宫位 → 星入墓
if (STAR_WX[palace.star] && WX_TOMB[STAR_WX[palace.star]] === p) {
  // 星入墓！
}
```

#### 门迫检测

宫位五行克门的五行，称为门迫：

```typescript
function detectMenPo(data: PaipanData): PatternInfo[] {
  for (let p = 1; p <= 9; p++) {
    const gate = data.palaces[p].gate;
    const gateWx = GATE_WX[gate];
    const palaceWx = PALACE_WX[p];
    if (wxKe(palaceWx, gateWx)) {
      // 门迫！宫克门
    }
  }
}
```

### 6.4 宫位综合评分

每个宫位的总评分由多个维度叠加，范围 -10 ~ +10：

```typescript
function analyzePalace(data, palace, seasonWX): PalaceAnalysis {
  let score = 0;

  // 门吉凶基础分（权重最高）
  if (gateInfo.auspice === '吉') score += 3;
  else if (gateInfo.auspice === '凶') score -= 3;

  // 星旺衰分
  if (starStrength === '旺') score += 2;
  else if (starStrength === '相') score += 1;
  else if (starStrength === '囚') score -= 1;
  else if (starStrength === '死') score -= 2;

  // 星性质分
  if (starInfo.nature === '吉星') score += 1;
  else if (starInfo.nature === '凶星') score -= 1;

  // 神吉凶分
  if (spiritInfo.nature === '吉神') score += 1;
  else if (spiritInfo.nature === '凶神') score -= 1;

  // 格局减分
  if (isMenPo) score -= 2;      // 门迫
  if (isStarRuMu) score -= 2;   // 星入墓
  if (isGateRuMu) score -= 2;   // 门入墓
  if (isVoid) score -= 2;       // 空亡

  // 星与宫的五行关系
  if (starRelation === '生') score += 1;       // 星生宫
  else if (starRelation === '被克') score -= 1; // 星被宫克

  return { ...各项数据, score };
}
```

### 6.5 综合判断

以日干宫和时干宫为核心，汇总所有分析得出整体吉凶：

```typescript
function buildOverallAssessment(stemPalaces, dayPA, timePA, patterns, dayTimeRelation) {
  let score = 0;

  // 日干宫评分权重 ×3（代表求测人）
  if (dayPA) score += dayPA.score * 3;

  // 时干宫评分权重 ×2（代表事体）
  if (timePA) score += timePA.score * 2;

  // 日干-时干宫位关系
  if (dayTimeRelation.palaceRelation === '生' || '被生') score += 5;
  else if (dayTimeRelation.palaceRelation === '被克')     score -= 5;
  else if (dayTimeRelation.palaceRelation === '克')       score -= 3;
  else if (dayTimeRelation.palaceRelation === '同宫')     score += 2;

  // 凶格每个 -5
  for (const p of patterns) {
    if (p.type === '凶格') score -= 5;
  }

  // 归一化到 -100 ~ 100
  const normalized = Math.max(-100, Math.min(100, score * 2));
  let tendency: '吉' | '凶' | '平';
  if (normalized >= 15) tendency = '吉';
  else if (normalized <= -15) tendency = '凶';
  else tendency = '平';

  return { tendency, score: normalized, summary, keyPoints, advice, warnings };
}
```

### 6.6 分析主函数调用链

```typescript
export function analyzeQimen(data: PaipanData): AnalysisResult {
  // 一、季节五行
  const seasonWX = getSeasonWX(data.ganZhi.month);

  // 二、干落宫定位（日干、时干、年干、月干）
  const stemPalaces = {
    dayGan:   buildStemPalaceInfo('日干',  dayGan,   data.ganZhi.day,   data),
    timeGan:  buildStemPalaceInfo('时干',  timeGan,  data.ganZhi.time,  data),
    yearGan:  buildStemPalaceInfo('年干',  yearGan,  data.ganZhi.year,  data),
    monthGan: buildStemPalaceInfo('月干',  monthGan, data.ganZhi.month, data),
  };

  // 三、日干-时干关系
  const dayTimeRelation = analyzeStemRelation(stemPalaces.dayGan, stemPalaces.timeGan);

  // 四、各宫综合分析
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    palaceAnalyses[p] = analyzePalace(data, p, seasonWX);
  }

  // 五、格局检测（五大类）
  const patterns = [
    ...detectFuyin(data),    // 伏吟
    ...detectFanyin(data),   // 反吟
    ...detectJiXing(data),   // 击刑
    ...detectRuMu(data),     // 入墓
    ...detectMenPo(data),    // 门迫
  ];

  // 六、综合判断
  const overall = buildOverallAssessment(stemPalaces, dayPA, timePA, patterns, dayTimeRelation);

  return { seasonWX, stemPalaces, dayTimeRelation, palaceAnalyses, patterns, overall };
}
```

---

## 七、格局定义表（吉格与凶格）

`constants.ts` 中定义了完整的格局检测规则，每条规则包含名称、类型、描述和检测函数：

### 7.1 吉格

```typescript
// 三奇得使
{ name: '乙奇得使', type: '吉格',
  description: '天盘乙奇配合开门，万事可为',
  check: (h, _e, _s, g) => h === '乙' && g === '开门' },

{ name: '丙奇得使', type: '吉格',
  description: '天盘丙奇配合开门或休门，威权显赫',
  check: (h, _e, _s, g) => h === '丙' && (g === '开门' || g === '休门') },

{ name: '丁奇得使', type: '吉格',
  description: '天盘丁奇配合开门或景门，文书有喜',
  check: (h, _e, _s, g) => h === '丁' && (g === '开门' || g === '景门') },

// 三遁
{ name: '天遁', type: '吉格',
  description: '天盘丙加地盘戊配合生门，天助神佑',
  check: (h, e, _s, g) => h === '丙' && e === '戊' && g === '生门' },

{ name: '地遁', type: '吉格',
  description: '天盘乙加地盘己配合开门，稳如泰山',
  check: (h, e, _s, g) => h === '乙' && e === '己' && g === '开门' },

{ name: '人遁', type: '吉格',
  description: '天盘丁加地盘己配合休门，贵人扶持',
  check: (h, e, _s, g) => h === '丁' && e === '己' && g === '休门' },

{ name: '神遁', type: '吉格',
  description: '天盘丙配合九天和生门，神助得利',
  check: (h, _e, _s, g, sp) => h === '丙' && sp === '九天' && g === '生门' },
```

### 7.2 凶格

```typescript
{ name: '大格',   check: (h, e) => h === '庚' && e === '癸' },  // 庚加癸
{ name: '小格',   check: (h, e) => h === '庚' && e === '壬' },  // 庚加壬
{ name: '刑格',   check: (h, e) => h === '庚' && e === '庚' },  // 庚加庚
{ name: '悖格',   check: (h, e) => (h==='辛' && e==='壬') || (h==='壬' && e==='辛') },

{ name: '青龙逃走',   check: (h, e) => h === '丙' && e === '辛' },  // 丙加辛
{ name: '白虎猖狂',   check: (h, e) => h === '辛' && e === '丙' },  // 辛加丙
{ name: '螣蛇夭矫',   check: (h, e) => h === '丁' && e === '癸' },  // 丁加癸
{ name: '朱雀投江',   check: (h, e) => h === '丁' && e === '壬' },  // 丁加壬
{ name: '太白入荧',   check: (h, e) => h === '庚' && e === '丙' },  // 庚加丙
{ name: '荧入太白',   check: (h, e) => h === '丙' && e === '庚' },  // 丙加庚
```

---

## 八、象意系统

排盘不仅是数学计算，更需要一套完整的"语义系统"来支撑解读。以下象意数据定义在 `constants.ts` 和 `luckingAnalysis.ts` 中：

### 8.1 九星象意

```typescript
export const STAR_MEANINGS: Record<string, string> = {
  '天蓬': '盗贼、暗昧、智谋、水灾、私密',
  '天芮': '疾病、阴暗、小人、寡妇、田宅',
  '天冲': '勇猛、急躁、战斗、出行、变动',
  '天辅': '文昌、文书、学业、温和、策划',
  '天禽': '中正、居中、调和、统领、大地',
  '天心': '医药、长者、领导、正直、宗教',
  '天柱': '口舌、破坏、言语、惊恐、毁折',
  '天任': '稳重、土地、慈善、艮止、果敢',
  '天英': '文明、光彩、血光、急躁、虚荣',
};
```

### 8.2 八门象意

```typescript
export const GATE_MEANINGS: Record<string, string> = {
  '休门': '休养生息、贵人、求财、安逸',
  '生门': '生发、求财、营生、土地、房产',
  '伤门': '伤灾、官司、竞争、运动、破财',
  '杜门': '阻隔、隐藏、防守、逃避、封闭',
  '景门': '光明、文书、血光、口舌、策划',
  '死门': '死亡、断绝、凶险、丧事、吊丧',
  '惊门': '惊恐、口舌、官司、是非、怪异',
  '开门': '开创、事业、领导、权威、出行',
};
```

### 8.3 八神象意

```typescript
export const SPIRIT_MEANINGS: Record<string, string> = {
  '值符': '领导、权威、贵人、天助、尊贵',
  '腾蛇': '虚惊、怪异、缠绕、变化、梦寐',
  '太阴': '阴私、暗助、女性、策划、隐秘',
  '六合': '合作、婚姻、媒介、中间人、和合',
  '白虎': '凶猛、血光、丧事、道路、武力',
  '玄武': '盗贼、暗昧、欺骗、失物、阴私',
  '九地': '坤顺、稳定、藏匿、母亲、大地',
  '九天': '刚健、向上、张扬、天空、远行',
};
```

### 8.4 天干象意

```typescript
export const GAN_MEANINGS: Record<string, string> = {
  '甲': '首领、大树、头部、胆、栋梁',
  '乙': '花草、妻财、肝、曲折、乙奇',
  '丙': '太阳、光明、权威、心、丙奇',
  '丁': '星光、文书、智慧、血脉、丁奇',
  '戊': '大地、城墙、资本、胃、六仪',
  '己': '田园、坟墓、脾、妻、六仪',
  '庚': '道路、阻隔、仇敌、肺、六仪',
  '辛': '错误、变革、过失、骨、六仪',
  '壬': '江河、流动、膀胱、盗、六仪',
  '癸': '暗流、地网、肾、女阴、六仪',
};
```

---

## 九、阴盘与阳盘的根本区别

| 维度 | 阴盘（王凤麟体系） | 阳盘（传统体系） |
|------|-------------------|----------------|
| 阴阳遁 | **无**阴阳遁之分 | 冬至后阳遁、夏至后阴遁 |
| 定局 | **无需定局** | 需按节气定1-18局 |
| 地盘 | 元旦盘**固定不变** | 按局数排布，每局不同 |
| 九星驱动 | 值符星→**时干**落宫，**顺行** | 值符星→时干落宫，阳顺阴逆 |
| 八门驱动 | 值使门→**时支**落宫，**逆行** | 值使门→时干落宫，阳顺阴逆 |
| 暗干/隐干 | **有**，基于元旦盘交叉引用 | 无此概念 |
| 移星换斗 | **支持** | 无此操作 |
| 真太阳时 | **默认启用** | 可选 |

这些差异使得阴盘的排盘逻辑更为简洁（无需节气定局），但解读体系有自己的独特技法（暗干、隐干、移星换斗）。

---

## 十、完整数据流

```
用户输入 (QimenConfig)
│  year, month, day, hour, minute, longitude, yearMing
│
├─ Step 0: toTrueSolarTime()
│  └─ 经度差×4分钟修正 → 修正后时间
│
├─ Step 1: extractYinPanTime()
│  └─ lunar-javascript → 年月日时四柱干支
│
├─ Step 2: XUN_SHOU_MAP[timeGanZhi]
│  └─ 旬首、隐仪、空亡对
│
├─ Step 3: findYinPanZhiFu()
│  ├─ 隐仪 → STEM_TO_PALACE → 落宫
│  ├─ STAR_BY_PALACE → 值符星
│  └─ GATE_BY_PALACE → 值使门
│
├─ Step 4: rotateYinPanStars()
│  ├─ 时干 → STEM_TO_PALACE → 目标宫
│  ├─ getOffsetBetween(本宫, 目标宫, forward)
│  └─ 8星按offset顺行旋转
│
├─ Step 5: layoutYinPanHeavenStems()
│  ├─ 起始干 = 隐仪在STEM_SEQUENCE的索引
│  ├─ 起始宫 = 值符星落宫
│  └─ 前4外宫 → 中5宫 → 后4外宫 分段飞布
│
├─ Step 6: rotateYinPanGates()
│  ├─ 时支 → branchToPalace → 目标宫
│  ├─ getOffsetBetween(本宫, 目标宫, backward)
│  └─ 8门按offset逆行旋转
│
├─ Step 7: layoutYinPanSpirits()
│  ├─ 找值符星当前宫位
│  └─ 从该宫起顺行排8神
│
├─ Step 8: 空亡(日柱旬首) + 马星(时支)
│
├─ Step 9: assembleYinPanPalaces()
│  └─ 9宫 × (地盘干+天盘干+星+门+神+空亡+马星)
│
├─ applyYinPanStems()
│  ├─ calculateDarkStems()   → 暗干
│  └─ calculateHiddenStems() → 隐干
│
└─ 输出 QimenResult
    │
    └─ analyzeQimen()
        ├─ 季节五行 → 旺相休囚
        ├─ 干落宫定位 → 日干/时干/年干/月干
        ├─ 各宫综合评分 (-10~10)
        ├─ 格局检测 → 伏吟/反吟/击刑/入墓/门迫
        └─ 综合判断 → 吉/凶/平 (-100~100)
```

---

## 十一、源文件索引

| 文件 | 行数 | 职责 |
|------|------|------|
| `types.ts` | 179 | 全量TypeScript类型定义 |
| `constants.ts` | 525 | 九宫/九星/八门/八神/元旦盘/旬首/马星/格局等常量 |
| `jiuGong.ts` | 85 | 九宫遍历、偏移计算、地支→宫位工具函数 |
| `trueSolarTime.ts` | 83 | 真太阳时修正（经度差法） |
| `yinPanCalc.ts` | 416 | **核心排盘引擎**：9步流程完整实现 |
| `yinPan.ts` | 163 | 暗干/隐干计算、移星换斗 |
| `luckingAnalysis.ts` | 812 | **格局分析引擎**：五行分析、格局检测、综合评判 |
| `cityDatabase.ts` | 346 | 327个城市经纬度（真太阳时辅助） |
| **合计** | **~2600** | |
