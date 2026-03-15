/**
 * 道家阴盘奇门遁甲 —— 纯文本排盘函数
 *
 * 核心规则：
 * 1. 拆补法定局（节气+符头确定三元局数）
 * 2. 地盘飞布（阳遁顺飞、阴遁逆飞）
 * 3. 天盘九星转盘（后天八卦环旋转）
 * 4. 人盘八门转盘（后天八卦环旋转）
 * 5. 神盘八神转盘（后天八卦环旋转）
 * 6. 暗干=地盘干，引干=天盘干（星从原宫带来的地盘干）
 *
 * 参考：王凤麟道家奇门
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar: SolarPP } = require('lunar-javascript');

// ==================== 常量 ====================

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 三奇六仪固定序列（甲隐于六仪之下） */
const STEM_SEQ = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

/** 后天八卦环序（跳过5宫）—— 转盘旋转用 */
const RING = [1, 8, 3, 4, 9, 2, 7, 6];

/** 九星固定序（本宫1-9） */
const STAR_NAMES = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
/** 星简称 */
const STAR_SHORT: Record<string, string> = {
  '天蓬': '蓬', '天芮': '芮', '天冲': '冲', '天辅': '辅',
  '天禽': '禽', '天心': '心', '天柱': '柱', '天任': '任', '天英': '英',
};

/** 八门固定序（本宫，5宫无门） */
const GATE_NAMES: Record<number, string> = {
  1: '休门', 2: '死门', 3: '伤门', 4: '杜门',
  6: '开门', 7: '惊门', 8: '生门', 9: '景门',
};
/** 门简称 */
const GATE_SHORT: Record<string, string> = {
  '休门': '休', '死门': '死', '伤门': '伤', '杜门': '杜',
  '开门': '开', '惊门': '惊', '生门': '生', '景门': '景',
};

/** 阴盘八神固定序 */
const SPIRIT_NAMES = ['直符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
/** 八神简称 */
const SPIRIT_SHORT: Record<string, string> = {
  '直符': '符', '腾蛇': '蛇', '太阴': '阴', '六合': '六',
  '白虎': '白', '玄武': '玄', '九地': '地', '九天': '天',
};

/** 节气定局表 */
const JU_TABLE: Record<string, { dun: '阳' | '阴'; s: number; z: number; x: number }> = {
  '冬至': { dun: '阳', s: 1, z: 7, x: 4 }, '小寒': { dun: '阳', s: 2, z: 8, x: 5 },
  '大寒': { dun: '阳', s: 3, z: 9, x: 6 }, '立春': { dun: '阳', s: 8, z: 5, x: 2 },
  '雨水': { dun: '阳', s: 9, z: 6, x: 3 }, '惊蛰': { dun: '阳', s: 1, z: 7, x: 4 },
  '春分': { dun: '阳', s: 3, z: 9, x: 6 }, '清明': { dun: '阳', s: 4, z: 1, x: 7 },
  '谷雨': { dun: '阳', s: 5, z: 2, x: 8 }, '立夏': { dun: '阳', s: 4, z: 1, x: 7 },
  '小满': { dun: '阳', s: 5, z: 2, x: 8 }, '芒种': { dun: '阳', s: 6, z: 3, x: 9 },
  '夏至': { dun: '阴', s: 9, z: 3, x: 6 }, '小暑': { dun: '阴', s: 8, z: 2, x: 5 },
  '大暑': { dun: '阴', s: 7, z: 1, x: 4 }, '立秋': { dun: '阴', s: 7, z: 1, x: 4 },
  '处暑': { dun: '阴', s: 1, z: 4, x: 7 }, '白露': { dun: '阴', s: 9, z: 3, x: 6 },
  '秋分': { dun: '阴', s: 7, z: 1, x: 4 }, '寒露': { dun: '阴', s: 6, z: 9, x: 3 },
  '霜降': { dun: '阴', s: 5, z: 8, x: 2 }, '立冬': { dun: '阴', s: 6, z: 9, x: 3 },
  '小雪': { dun: '阴', s: 5, z: 8, x: 2 }, '大雪': { dun: '阴', s: 4, z: 7, x: 1 },
};

/** 马星映射（日支→马星地支） */
const MA_MAP: Record<string, string> = {
  '寅': '申', '午': '申', '戌': '申', '申': '寅', '子': '寅', '辰': '寅',
  '巳': '亥', '酉': '亥', '丑': '亥', '亥': '巳', '卯': '巳', '未': '巳',
};

/** 地支→宫位映射 */
const ZHI_TO_PALACE: Record<string, number> = {
  '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4,
  '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6,
};

/** 十二建除固定序 */
const JIAN_CHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

// ==================== 六十甲子旬首表 ====================

interface XunInfo {
  xunShou: string;  // 旬首如"甲子"
  yinStem: string;  // 六仪如"戊"
  voidPair: [string, string]; // 空亡地支对
}

function buildXunMap(): Record<string, XunInfo> {
  const map: Record<string, XunInfo> = {};
  const xuns: Array<{ head: string; yin: string; vp: [string, string] }> = [
    { head: '甲子', yin: '戊', vp: ['戌', '亥'] },
    { head: '甲戌', yin: '己', vp: ['申', '酉'] },
    { head: '甲申', yin: '庚', vp: ['午', '未'] },
    { head: '甲午', yin: '辛', vp: ['辰', '巳'] },
    { head: '甲辰', yin: '壬', vp: ['寅', '卯'] },
    { head: '甲寅', yin: '癸', vp: ['子', '丑'] },
  ];
  for (const x of xuns) {
    const g0 = TIAN_GAN.indexOf(x.head[0]);
    const z0 = DI_ZHI.indexOf(x.head[1]);
    for (let i = 0; i < 10; i++) {
      const gz = TIAN_GAN[(g0 + i) % 10] + DI_ZHI[(z0 + i) % 12];
      map[gz] = { xunShou: x.head, yinStem: x.yin, voidPair: x.vp };
    }
  }
  return map;
}

const XUN_MAP = buildXunMap();

// ==================== 排盘结果类型 ====================

interface PalaceData {
  star: string;      // 天盘九星名
  gate: string;      // 人盘八门名
  spirit: string;    // 八神名
  earthStem: string; // 地盘干（暗干）
  heavenStem: string; // 天盘干（引干，星从原宫带来的地盘干）
}

interface PaiPanResult {
  // 头部信息
  year: number; month: number; day: number; hour: number; minute: number;
  lunarDesc: string;
  dunType: '阳' | '阴';
  juNumber: number;
  ganZhi: { year: string; month: string; day: string; time: string };
  voidPair: [string, string];
  zhiFuStar: string;
  zhiShiGate: string;
  xunShou: string;
  xunShouYin: string;
  // 九宫数据（1-9）
  palaces: Record<number, PalaceData>;
  // 马星宫位
  horsePalace: number;
  // 空亡宫位列表
  voidPalaces: number[];
  // 十二建除（按地支映射到宫位周围）
  jianChuMap: Record<string, string>;
}

// ==================== 第一步：四柱 + 节气定局 ====================

function extractFourPillars(year: number, month: number, day: number, hour: number) {
  const solar = SolarPP.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  ec.setSect(2);

  // 晚子时处理：23时属于次日子时，日柱取次日
  let dayGan: string, dayZhi: string;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    const nextSolar = SolarPP.fromYmdHms(
      nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), 0, 0, 0,
    );
    const nextEc = nextSolar.getLunar().getEightChar();
    nextEc.setSect(2);
    dayGan = nextEc.getDayGan();
    dayZhi = nextEc.getDayZhi();
  } else {
    dayGan = ec.getDayGan();
    dayZhi = ec.getDayZhi();
  }

  return {
    yearGZ: ec.getYearGan() + ec.getYearZhi(),
    monthGZ: ec.getMonthGan() + ec.getMonthZhi(),
    dayGZ: dayGan + dayZhi,
    timeGZ: ec.getTimeGan() + ec.getTimeZhi(),
    timeGan: ec.getTimeGan() as string,
    timeZhi: ec.getTimeZhi() as string,
    dayGan: dayGan as string,
    dayZhi: dayZhi as string,
    lunar,
  };
}

function findJieQiAndJu(year: number, month: number, day: number, hour: number, yearZhi: string, timeZhi: string) {
  // 晚子时处理：23时归属次日
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  const solar = SolarPP.fromYmdHms(effYear, effMonth, effDay, 0, 0, 0);
  const lunar = solar.getLunar();

  // 获取上一个节（用于确定阳遁/阴遁和显示）
  const prevJie = lunar.getPrevJie();
  if (!prevJie) throw new Error('无法获取节气信息');
  const jieQiName: string = prevJie.getName();
  const juEntry = JU_TABLE[jieQiName];
  if (!juEntry) throw new Error(`节气 "${jieQiName}" 不在定局表中`);

  // 阳/阴遁：冬至后夏至前=阳遁，夏至后冬至前=阴遁
  const dunType = juEntry.dun;

  // 定局公式：(年支序数 + 农历月 + 农历日 + 时支序数) % 9
  const yearZhiIdx = DI_ZHI.indexOf(yearZhi) + 1;   // 子=1,...,亥=12
  const lunarMonth = Math.abs(lunar.getMonth());      // 农历月（闰月取绝对值）
  const lunarDay = lunar.getDay();                     // 农历日
  const timeZhiIdx = DI_ZHI.indexOf(timeZhi) + 1;     // 子=1,...,亥=12

  const sum = yearZhiIdx + lunarMonth + lunarDay + timeZhiIdx;
  const juNumber = sum % 9 === 0 ? 9 : sum % 9;

  return { jieQiName, dunType, juNumber, yuan: '' };
}

// ==================== 第三步：地盘飞布 ====================

function layoutEarthPlate(juNumber: number, dunType: '阳' | '阴'): Record<number, string> {
  const earth: Record<number, string> = {};

  // 王凤麟版：阳遁逆飞、阴遁顺飞
  if (dunType === '阳') {
    // 逆飞：从局数宫开始，宫号递减
    for (let i = 0; i < 9; i++) {
      let palace = juNumber - i;
      while (palace < 1) palace += 9;
      earth[palace] = STEM_SEQ[i];
    }
  } else {
    // 顺飞：从局数宫开始，宫号递增
    for (let i = 0; i < 9; i++) {
      const palace = ((juNumber - 1 + i) % 9) + 1;
      earth[palace] = STEM_SEQ[i];
    }
  }

  // 中5宫的干寄入坤2宫：2宫显示为"原2宫干+5宫干"
  // earth[5] 保持不变（记录原始值），显示层处理寄宫合并

  return earth;
}

/** 获取地盘显示干（2宫需合并5宫寄干） */
function getEarthDisplay(earth: Record<number, string>, palace: number): string {
  if (palace === 2) {
    const s2 = earth[2] || '';
    const s5 = earth[5] || '';
    if (s5 && s5 !== s2) return s2 + s5;
    return s2;
  }
  if (palace === 5) return '';
  return earth[palace] || '';
}

// ==================== 第四步：值符值使 ====================

function findZhiFuZhiShi(timeGZ: string, earth: Record<number, string>) {
  const xunInfo = XUN_MAP[timeGZ];
  if (!xunInfo) throw new Error(`无法找到 "${timeGZ}" 的旬首信息`);

  const { xunShou, yinStem, voidPair } = xunInfo;

  // 旬首六仪在地盘的落宫
  let xunShouPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === yinStem) {
      xunShouPalace = p;
      break;
    }
  }
  // 中5宫寄2宫
  if (xunShouPalace === 5) xunShouPalace = 2;

  // 值符星 = 旬首落宫的本位九星
  const zhiFuStar = STAR_NAMES[xunShouPalace - 1]; // palace 1→天蓬, 2→天芮, ...

  // 值使门 = 旬首落宫的本位八门
  const zhiShiGate = GATE_NAMES[xunShouPalace] || '死门'; // 5宫寄2宫用死门

  return {
    xunShou, yinStem, voidPair,
    zhiFuStar, zhiShiGate,
    xunShouPalace,
  };
}

// ==================== 第五步：天盘九星转盘 ====================

function rotateStar(
  xunShouPalace: number,
  timeGan: string,
  earth: Record<number, string>,
): Record<number, string> {
  const starPlate: Record<number, string> = {};

  // 时干对应的地盘落宫
  let timeGanPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === timeGan) {
      timeGanPalace = p;
      break;
    }
  }
  if (timeGanPalace === 5) timeGanPalace = 2;

  // 在RING上计算旋转偏移
  let fromPalace = xunShouPalace;
  if (fromPalace === 5) fromPalace = 2;
  const fromIdx = RING.indexOf(fromPalace);
  const toIdx = RING.indexOf(timeGanPalace);
  const offset = (toIdx - fromIdx + 8) % 8;

  // 所有外宫星旋转
  for (let i = 0; i < 8; i++) {
    const nativePalace = RING[i];
    const star = STAR_NAMES[nativePalace - 1];
    const newIdx = (i + offset) % 8;
    const newPalace = RING[newIdx];
    starPlate[newPalace] = star;
  }

  // 中5宫：天禽寄于天芮所在宫
  starPlate[5] = '天禽';

  return starPlate;
}

// ==================== 第六步：人盘八门转盘 ====================

function rotateGate(
  zhiShiGate: string,
  xunShouPalace: number,
  timeGZ: string,
  xunShou: string,
  dunType: '阳' | '阴',
): Record<number, string> {
  const gatePlate: Record<number, string> = {};

  // 值使门原始宫位
  let shiGatePalace = 0;
  for (const [p, g] of Object.entries(GATE_NAMES)) {
    if (g === zhiShiGate) { shiGatePalace = Number(p); break; }
  }
  if (shiGatePalace === 0) shiGatePalace = xunShouPalace;

  // 计算从旬首到时柱的步数
  const xunGanIdx = TIAN_GAN.indexOf(xunShou[0]);
  const timeGanIdx = TIAN_GAN.indexOf(timeGZ[0]);
  const steps = ((timeGanIdx - xunGanIdx) % 10 + 10) % 10;

  // 王凤麟版：阳遁递减(--)、阴遁递增(++)
  const shouldDecrement = dunType === '阳';

  let targetPalace = shiGatePalace;
  for (let i = 0; i < steps; i++) {
    if (shouldDecrement) {
      targetPalace--;
      if (targetPalace < 1) targetPalace = 9;
    } else {
      targetPalace++;
      if (targetPalace > 9) targetPalace = 1;
    }
  }
  if (targetPalace === 5) targetPalace = 2; // 中宫寄坤二

  // 在RING上计算偏移
  let fromP = shiGatePalace;
  if (fromP === 5) fromP = 2;
  const fromIdx = RING.indexOf(fromP);
  const toIdx = RING.indexOf(targetPalace);
  const offset = (toIdx - fromIdx + 8) % 8;

  // 所有八门旋转
  for (let i = 0; i < 8; i++) {
    const nativePalace = RING[i];
    const gate = GATE_NAMES[nativePalace];
    if (!gate) continue;
    const newIdx = (i + offset) % 8;
    const newPalace = RING[newIdx];
    gatePlate[newPalace] = gate;
  }

  gatePlate[5] = '';
  return gatePlate;
}

// ==================== 第七步：神盘八神转盘 ====================

function rotateSpirit(
  starPlate: Record<number, string>,
  zhiFuStar: string,
): Record<number, string> {
  const spiritPlate: Record<number, string> = {};

  // 直符跟随值符星，找天盘中值符星所在宫
  let zhiFuPalace = 1;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    if (starPlate[p] === zhiFuStar) { zhiFuPalace = p; break; }
  }

  // 从值符星所在宫起，沿RING顺行布八神
  const startIdx = RING.indexOf(zhiFuPalace);
  for (let i = 0; i < 8; i++) {
    const palace = RING[(startIdx + i) % 8];
    spiritPlate[palace] = SPIRIT_NAMES[i];
  }

  spiritPlate[5] = '';
  return spiritPlate;
}

// ==================== 第八步：暗干与引干 ====================

function computeHeavenStems(
  starPlate: Record<number, string>,
  earth: Record<number, string>,
): Record<number, string> {
  const heavenStems: Record<number, string> = {};

  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      heavenStems[5] = '';
      continue;
    }
    const starName = starPlate[p];
    // 星的本宫编号
    const nativePalace = STAR_NAMES.indexOf(starName) + 1;
    // 引干 = 星从原宫带来的地盘干
    let stem = earth[nativePalace] || '';
    // 天芮(2)所在宫同时携带天禽(5)的地盘干
    if (starName === '天芮') {
      const stem5 = earth[5] || '';
      if (stem5 && stem5 !== stem) {
        stem = stem + stem5; // 如"壬丙"
      }
    }
    heavenStems[p] = stem;
  }

  return heavenStems;
}

// ==================== 第九步：空亡与马星 ====================

function computeVoidAndHorse(
  voidPair: [string, string],
  dayZhi: string,
): { voidPalaces: number[]; horsePalace: number } {
  const voidPalaces: number[] = [];
  for (const z of voidPair) {
    const p = ZHI_TO_PALACE[z];
    if (p && !voidPalaces.includes(p)) voidPalaces.push(p);
  }

  const maZhi = MA_MAP[dayZhi] || '';
  const horsePalace = ZHI_TO_PALACE[maZhi] || 0;

  return { voidPalaces, horsePalace };
}

// ==================== 十二建除 ====================

function computeJianChu(dayZhi: string): Record<string, string> {
  // 十二建除起于月建，建日=月建地支
  // 简化：从日支开始，建在日支对应的地支位置
  // 实际：建除起于"建"在当月月建地支，然后顺序排列
  // 标准算法：月建（节气对应地支），该地支为"建"，然后子→丑→...顺序排
  // 但从范例来看，我们需要用日支来确定建除分布
  // 范例：丁亥日，亥→建在右侧亥位

  // 标准十二建除：以月建（月支）为"建"，然后沿地支顺序分配
  // 但范例显示 亥=建, 子=除, 丑=满, 寅=平, 卯=定, 辰=执, 巳=破, 午=危, 未=成, 申=收, 酉=开, 戌=闭
  // 这说明"建"在亥（月建=亥？卯月月建=卯才对）
  // 再看：如果月建=卯（辛卯月），建=卯位，但范例卯=定
  // 实际上，十二建除是日支为基准：日支所临的是"建"
  // 不对。让我重新分析范例：
  // 亥=建，这意味着从"亥"开始建。但标准算法是月建=月支所临为建
  // 辛卯月，月支=卯，卯位应为"建"
  // 但范例 卯=定 ≠ 建
  // 所以范例用的是另一种算法：日支为建！
  // 丁亥日，亥=建 ✓

  const map: Record<string, string> = {};
  const dayZhiIdx = DI_ZHI.indexOf(dayZhi);
  for (let i = 0; i < 12; i++) {
    const zhi = DI_ZHI[(dayZhiIdx + i) % 12];
    map[zhi] = JIAN_CHU[i];
  }
  return map;
}

// ==================== 主排盘函数 ====================

function doPaiPan(
  year: number, month: number, day: number, hour: number, minute: number,
): PaiPanResult {
  // Step 1: 四柱
  const fp = extractFourPillars(year, month, day, hour);

  // Step 1b: 节气定局
  const ju = findJieQiAndJu(year, month, day, hour, fp.yearGZ[1], fp.timeZhi);

  // 农历描述
  const lunarYear = fp.lunar.getYearShengXiao();
  const lunarMonth = fp.lunar.getMonth();
  const lunarDay = fp.lunar.getDay();
  const lunarMonthStr = String(Math.abs(lunarMonth)).padStart(2, '0');
  const lunarDayStr = String(lunarDay).padStart(2, '0');
  const lunarDesc = `${lunarYear}年${lunarMonthStr}月${lunarDayStr}日`;

  // Step 2: 时干处理（甲时用旬首六仪替代）
  const timeXunInfo = XUN_MAP[fp.timeGZ];
  if (!timeXunInfo) throw new Error(`无法找到 "${fp.timeGZ}" 的旬首信息`);
  let effectiveTimeGan = fp.timeGan;
  if (effectiveTimeGan === '甲') {
    effectiveTimeGan = timeXunInfo.yinStem;
  }

  // Step 3: 地盘（阳遁逆飞、阴遁顺飞）
  const earth = layoutEarthPlate(ju.juNumber, ju.dunType);

  // Step 4: 值符值使
  const zf = findZhiFuZhiShi(fp.timeGZ, earth);

  // Step 5: 天盘九星
  const starPlate = rotateStar(zf.xunShouPalace, effectiveTimeGan, earth);

  // Step 6: 人盘八门（阳遁递减、阴遁递增）
  const gatePlate = rotateGate(
    zf.zhiShiGate, zf.xunShouPalace, fp.timeGZ, zf.xunShou, ju.dunType,
  );

  // Step 7: 神盘八神
  const spiritPlate = rotateSpirit(starPlate, zf.zhiFuStar);

  // Step 8: 引干（天盘干）
  const heavenStems = computeHeavenStems(starPlate, earth);

  // Step 9: 空亡与马星（王凤麟版：空亡取日柱旬首）
  const dayXunInfo = XUN_MAP[fp.dayGZ];
  if (!dayXunInfo) throw new Error(`无法找到 "${fp.dayGZ}" 的旬首信息`);
  const { voidPalaces, horsePalace } = computeVoidAndHorse(dayXunInfo.voidPair, fp.dayZhi);

  // 十二建除
  const jianChuMap = computeJianChu(fp.dayZhi);

  // 组装九宫数据
  const palaces: Record<number, PalaceData> = {};
  for (let p = 1; p <= 9; p++) {
    palaces[p] = {
      star: starPlate[p] || '',
      gate: gatePlate[p] || '',
      spirit: spiritPlate[p] || '',
      earthStem: getEarthDisplay(earth, p),
      heavenStem: heavenStems[p] || '',
    };
  }

  return {
    year, month, day, hour, minute,
    lunarDesc,
    dunType: ju.dunType,
    juNumber: ju.juNumber,
    ganZhi: { year: fp.yearGZ, month: fp.monthGZ, day: fp.dayGZ, time: fp.timeGZ },
    voidPair: dayXunInfo.voidPair,
    zhiFuStar: zf.zhiFuStar,
    zhiShiGate: zf.zhiShiGate,
    xunShou: zf.xunShou,
    xunShouYin: zf.yinStem,
    palaces,
    horsePalace,
    voidPalaces,
    jianChuMap,
  };
}

// ==================== ASCII格式化输出 ====================

function formatOutput(r: PaiPanResult): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  // 头部
  const header1 = `公元：${r.year}年${r.month}月${r.day}日${r.hour}时${pad(r.minute)}分 ${r.dunType}${r.juNumber}局`;
  const header2 = `农历：${r.lunarDesc}${r.hour}时${pad(r.minute)}分 时盘`;
  const header3 = `干支：${r.ganZhi.year} ${r.ganZhi.month} ${r.ganZhi.day} ${r.ganZhi.time} (${r.voidPair[0]}${r.voidPair[1]}空)`;
  const header4 = `直符：${r.zhiFuStar} 直使：${r.zhiShiGate} 旬首：${r.xunShou}${r.xunShouYin}`;

  // 九宫格布局：[4,9,2] / [3,5,7] / [8,1,6]
  const grid = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const topZhi = ['申', '酉', '戌'];
  const leftZhi = ['未', '午', '巳'];
  const rightZhi = ['亥', '子', '丑'];
  const bottomZhi = ['辰', '卯', '寅'];
  const jc = r.jianChuMap;

  // 宫格内容：3行（范例格式：spirit行4CJK宽，干+星行不定宽）
  function cellLines(p: number): [string, string, string] {
    if (p === 5) {
      return ['　　　　', '　　　　', '　　　　'];
    }
    const d = r.palaces[p];
    const sp = SPIRIT_SHORT[d.spirit] || '　';
    const hs = d.heavenStem;
    const starShort = STAR_SHORT[d.star] || '　';
    const es = d.earthStem;
    const gateShort = GATE_SHORT[d.gate] || '　';

    const line1 = `${sp}　　　`;
    const line2 = `${hs}　${starShort}`;
    const line3 = `${es}　${gateShort}`;

    return [line1, line2, line3];
  }

  /** 引干标注用：双字引干(如壬丙)反转为(丙壬) */
  function annotStem(stem: string): string {
    const chars = Array.from(stem);
    if (chars.length === 2) return chars[1] + chars[0];
    return stem;
  }

  const lines: string[] = [];

  lines.push(header1);
  lines.push(header2);
  lines.push(header3);
  lines.push(header4);
  lines.push('');

  // 上方标注
  lines.push(`　　　${topZhi[0]}　${jc[topZhi[0]]}　　${topZhi[1]}　${jc[topZhi[1]]}　　${topZhi[2]}　${jc[topZhi[2]]}`);
  // 上方引干（离9宫的引干居中）
  const topStem = r.palaces[9].heavenStem || '';
  lines.push(`　　　　　　 ${topStem}　 　　　　　　`);
  // 上边框
  lines.push('　　┌────┬────┬────┐');

  for (let row = 0; row < 3; row++) {
    const pIds = grid[row];
    const cells = pIds.map(p => cellLines(p));

    const lz = leftZhi[row];
    const rz = rightZhi[row];
    const leftPalace = pIds[0];
    const rightPalace = pIds[2];
    const leftStem = r.palaces[leftPalace].heavenStem || '';
    const rightStem = annotStem(r.palaces[rightPalace].heavenStem || '');
    const leftIsVoid = r.voidPalaces.includes(leftPalace);

    // 右侧引干：双字不加前导空格
    const rsPrefix = (Array.from(rightStem).length > 1) ? '' : '　';

    lines.push(`${lz}　│${cells[0][0]}│${cells[1][0]}│${cells[2][0]}│　${rz}`);
    lines.push(`${leftStem}　│${cells[0][1]}│${cells[1][1]}│${cells[2][1]}│${rsPrefix}${rightStem}`);
    lines.push(`${jc[lz] || ''}${leftIsVoid ? '○' : '　'}│${cells[0][2]}│${cells[1][2]}│${cells[2][2]}│　${jc[rz] || ''}`);

    if (row < 2) {
      lines.push('　　├────┼────┼────┤');
    }
  }

  // 下边框
  lines.push('　　└────┴────┴────┘');

  // 马星 + 下方引干
  const horseLabel = r.horsePalace > 0 ? '马' : '　';
  const bottomStem = r.palaces[1].heavenStem || '';
  lines.push(`${horseLabel}　　　　　　 ${bottomStem}　 　　　　　　`);

  // 下方标注
  lines.push(`　　　${bottomZhi[0]}　${jc[bottomZhi[0]]}　　${bottomZhi[1]}　${jc[bottomZhi[1]]}　　${bottomZhi[2]}　${jc[bottomZhi[2]]}`);
  lines.push('');
  lines.push('　　　　　 《王凤麟道家奇门》');

  return lines.join('\n');
}

// ==================== 公开API ====================

export function yinpan_paipan(
  year: number, month: number, day: number,
  hour: number, minute: number = 0,
): string {
  const result = doPaiPan(year, month, day, hour, minute);
  return formatOutput(result);
}

/** 导出内部结果（供调试） */
export function yinpan_paipan_data(
  year: number, month: number, day: number,
  hour: number, minute: number = 0,
): PaiPanResult {
  return doPaiPan(year, month, day, hour, minute);
}
