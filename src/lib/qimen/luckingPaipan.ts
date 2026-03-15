/**
 * 阴盘奇门遁甲 —— 鹿鼎官网排盘
 *
 * 核心规则：
 * 1. 拆补法定局（节气+符头确定三元局数）
 * 2. 地盘飞布（阳遁顺飞、阴遁逆飞）
 * 3. 天盘九星转盘（后天八卦环旋转）
 * 4. 人盘八门转盘（阳遁递增、阴遁递减）
 * 5. 神盘八神转盘（后天八卦环旋转）
 * 6. 暗干=地盘干，引干=天盘干（星从原宫带来的地盘干）
 * 7. 空亡取时柱旬首
 *
 * 参考：鹿鼎官网排盘程序
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar: SolarLK } = require('lunar-javascript');

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

/** 马星映射（时支→马星宫位） */
const MA_SHICHEN_MAP: Record<string, number> = {
  '申': 8, '子': 8, '辰': 8,  // 申子辰时 → 艮宫(8)
  '寅': 2, '午': 2, '戌': 2,  // 寅午戌时 → 坤宫(2)
  '巳': 6, '酉': 6, '丑': 6,  // 巳酉丑时 → 乾宫(6)
  '亥': 4, '卯': 4, '未': 4,  // 亥卯未时 → 巽宫(4)
};

/** 地支→宫位映射 */
const ZHI_TO_PALACE: Record<string, number> = {
  '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4,
  '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6,
};

/** 十二建除固定序 */
const JIAN_CHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

/** 月将映射（中气→月将地支） */
const YUE_JIANG_MAP: Record<string, string> = {
  '雨水': '亥', '春分': '戌', '谷雨': '酉', '小满': '申',
  '夏至': '未', '大暑': '午', '处暑': '巳', '秋分': '辰',
  '霜降': '卯', '小雪': '寅', '冬至': '丑', '大寒': '子',
};

/** 九宫外圈12地支标准方位序（顺时针，从巽4宫上方起） */
const PERIMETER_ZHI = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];

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

interface LuckingPaiPanResult {
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
  // 建星宫位数据（palace→{地支, 建星名}[]）
  jianChuPalaceData: Record<number, Array<{ zhi: string; jianChu: string }>>;
  // 隐干（palace→天干）
  yinGanMap: Record<number, string>;
  // 月将地支
  yueJiang: string;
  // 隐支外圈12地支（顺时针排列，从巽4宫上方起）
  yinZhiRing: string[];
  // 隐支宫位映射（palace→地支，角宫含两个地支）
  yinZhiMap: Record<number, string>;
}

// ==================== 第一步：四柱 + 节气定局 ====================

function extractFourPillars(year: number, month: number, day: number, hour: number) {
  const solar = SolarLK.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  ec.setSect(2);

  // 晚子时处理：23时属于次日子时，日柱取次日
  let dayGan: string, dayZhi: string;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    const nextSolar = SolarLK.fromYmdHms(
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

  const solar = SolarLK.fromYmdHms(effYear, effMonth, effDay, 0, 0, 0);
  const lunar = solar.getLunar();

  // 获取上一个节气（节+气，用于确定阳遁/阴遁和显示）
  const prevJieQi = lunar.getPrevJieQi();
  if (!prevJieQi) throw new Error('无法获取节气信息');
  const jieQiName: string = prevJieQi.getName();
  const juEntry = JU_TABLE[jieQiName];
  if (!juEntry) throw new Error(`节气 "${jieQiName}" 不在定局表中`);

  // 阳/阴遁：冬至后夏至前=阳遁，夏至后冬至前=阴遁
  const dunType = juEntry.dun;

  // 定局公式：(年支序数 + 农历月 + 农历日 + 时支序数) % 9
  const yearZhiIdx = DI_ZHI.indexOf(yearZhi) + 1;
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const timeZhiIdx = DI_ZHI.indexOf(timeZhi) + 1;

  const sum = yearZhiIdx + lunarMonth + lunarDay + timeZhiIdx;
  const juNumber = sum % 9 === 0 ? 9 : sum % 9;

  return { jieQiName, dunType, juNumber, yuan: '' };
}

// ==================== 第三步：地盘飞布 ====================
// 鹿鼎官网版：阳遁顺飞、阴遁逆飞

function layoutEarthPlate(juNumber: number, dunType: '阳' | '阴'): Record<number, string> {
  const earth: Record<number, string> = {};

  if (dunType === '阴') {
    // 阴遁逆飞：从局数宫开始，宫号递减
    for (let i = 0; i < 9; i++) {
      let palace = juNumber - i;
      while (palace < 1) palace += 9;
      earth[palace] = STEM_SEQ[i];
    }
  } else {
    // 阳遁顺飞：从局数宫开始，宫号递增
    for (let i = 0; i < 9; i++) {
      const palace = ((juNumber - 1 + i) % 9) + 1;
      earth[palace] = STEM_SEQ[i];
    }
  }

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

  // 值符星 = 旬首落宫的本位九星（中五宫为天禽）
  const zhiFuStar = STAR_NAMES[xunShouPalace - 1];

  // 天禽寄坤：中五宫实际操作位在坤二宫
  if (xunShouPalace === 5) xunShouPalace = 2;

  // 值使门 = 操作位宫的本位八门
  const zhiShiGate = GATE_NAMES[xunShouPalace] || '死门';

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

  let timeGanPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === timeGan) {
      timeGanPalace = p;
      break;
    }
  }
  if (timeGanPalace === 5) timeGanPalace = 2;

  let fromPalace = xunShouPalace;
  if (fromPalace === 5) fromPalace = 2;
  const fromIdx = RING.indexOf(fromPalace);
  const toIdx = RING.indexOf(timeGanPalace);
  const offset = (toIdx - fromIdx + 8) % 8;

  for (let i = 0; i < 8; i++) {
    const nativePalace = RING[i];
    const star = STAR_NAMES[nativePalace - 1];
    const newIdx = (i + offset) % 8;
    const newPalace = RING[newIdx];
    starPlate[newPalace] = star;
  }

  starPlate[5] = '天禽';

  return starPlate;
}

// ==================== 第六步：人盘八门转盘 ====================
// 鹿鼎官网版：阳遁递增、阴遁递减

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

  // 鹿鼎官网版：阴遁递减、阳遁递增
  const shouldDecrement = dunType === '阴';

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
  if (targetPalace === 5) targetPalace = 2;

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

  let zhiFuPalace = 1;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    if (starPlate[p] === zhiFuStar) { zhiFuPalace = p; break; }
  }

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
    const nativePalace = STAR_NAMES.indexOf(starName) + 1;
    let stem = earth[nativePalace] || '';
    if (starName === '天芮') {
      const stem5 = earth[5] || '';
      if (stem5 && stem5 !== stem) {
        stem = stem + stem5;
      }
    }
    heavenStems[p] = stem;
  }

  return heavenStems;
}

// ==================== 第九步：空亡与马星 ====================

function computeVoidAndHorse(
  voidPair: [string, string],
  timeZhi: string,
): { voidPalaces: number[]; horsePalace: number } {
  const voidPalaces: number[] = [];
  for (const z of voidPair) {
    const p = ZHI_TO_PALACE[z];
    if (p && !voidPalaces.includes(p)) voidPalaces.push(p);
  }

  const horsePalace = MA_SHICHEN_MAP[timeZhi] || 0;

  return { voidPalaces, horsePalace };
}

// ==================== 十二建除 ====================

function computeJianChu(dayZhi: string): Record<string, string> {
  const map: Record<string, string> = {};
  const dayZhiIdx = DI_ZHI.indexOf(dayZhi);
  for (let i = 0; i < 12; i++) {
    const zhi = DI_ZHI[(dayZhiIdx + i) % 12];
    map[zhi] = JIAN_CHU[i];
  }
  return map;
}

// ==================== 隐干/暗干 ====================

/**
 * 非伏吟局隐干算法 —— 地盘追踪法
 *
 * 1. 时干放在值使门所在宫位作暗干
 * 2. 找哪个宫的地盘包含该时干 → earthPalace
 * 3. 如果 earthPalace 有寄干（如P2含P5的天干），一并标记
 * 4. 两个指针同步顺时针移动：
 *    - 显示宫位（displayPalace）沿 RING 顺时针
 *    - 追踪宫位（tracePalace）沿 RING 顺时针
 * 5. 每步：result[displayPalace] = earth[tracePalace] 的所有天干
 */
function computeYinGanNonFuyin(
  earth: Record<number, string>,
  startStem: string,
  startPalace: number,
): Record<number, string> {
  const result: Record<number, string> = {};

  // 获取宫位的所有地盘天干（P2含P5寄干）
  function getEarthStems(palace: number): string[] {
    if (palace === 2) {
      const stems: string[] = [];
      if (earth[2]) stems.push(earth[2]);
      if (earth[5] && earth[5] !== earth[2]) stems.push(earth[5]);
      return stems;
    }
    return earth[palace] ? [earth[palace]] : [];
  }

  // 在地盘中查找包含指定天干的宫位（P5寄居P2）
  function findEarthPalace(stem: string): number {
    if (earth[5] === stem) return 2;  // P5天干寄居在P2
    for (const p of RING) {
      if (earth[p] === stem) return p;
    }
    return 0;
  }

  const earthPalace = findEarthPalace(startStem);
  if (earthPalace === 0) return result;

  let dp = startPalace;
  if (dp === 5) dp = 2;

  const displayStart = RING.indexOf(dp);
  const earthStart = RING.indexOf(earthPalace);
  if (displayStart < 0 || earthStart < 0) return result;

  for (let i = 0; i < 8; i++) {
    const displayPalace = RING[(displayStart + i) % 8];
    const tracePalace = RING[(earthStart + i) % 8];
    const stems = getEarthStems(tracePalace);

    if (i === 0) {
      // 第一宫：时干排在前面，其余寄干跟在后面
      const ordered = [startStem, ...stems.filter(s => s !== startStem)];
      result[displayPalace] = ordered.join('');
    } else {
      result[displayPalace] = stems.join('');
    }
  }

  return result;
}

/**
 * 伏吟局隐干算法 —— 顺序法
 *
 * 从中5宫起，按阳顺/阴逆的宫号顺序排列9个天干
 *   阳遁（顺排）：5→6→7→8→9→1→2→3→4
 *   阴遁（逆排）：5→4→3→2→1→9→8→7→6
 *
 * 分支A（旬首落中5宫）：startStem = earth[2]（坤2宫本位六仪）
 * 分支B（旬首未落中5宫）：startStem = 旬首六仪
 */
const FUYIN_SEQ_YANG = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // 阳遁顺排
const FUYIN_SEQ_YIN  = [5, 4, 3, 2, 1, 9, 8, 7, 6]; // 阴遁逆排

function computeYinGanFuyin(
  startStem: string,
  dunType: '阳' | '阴',
): Record<number, string> {
  const result: Record<number, string> = {};

  const stemIdx = STEM_SEQ.indexOf(startStem);
  if (stemIdx < 0) return result;

  const path = dunType === '阳' ? FUYIN_SEQ_YANG : FUYIN_SEQ_YIN;

  for (let i = 0; i < 9; i++) {
    const palace = path[i];
    const stem = STEM_SEQ[(stemIdx + i) % 9];
    result[palace] = stem;
  }

  return result;
}

// ==================== 建星宫位映射 ====================

function buildJianChuPalaceData(
  jianChuMap: Record<string, string>,
): Record<number, Array<{ zhi: string; jianChu: string }>> {
  const result: Record<number, Array<{ zhi: string; jianChu: string }>> = {};

  for (let i = 0; i < DI_ZHI.length; i++) {
    const zhi = DI_ZHI[i];
    const palace = ZHI_TO_PALACE[zhi];
    if (!palace) continue;
    if (!result[palace]) result[palace] = [];
    result[palace].push({ zhi, jianChu: jianChuMap[zhi] || '' });
  }

  return result;
}

// ==================== 月将与隐支 ====================

/** 计算月将：根据上一个中气（气）查表得月将地支 */
function computeYueJiang(year: number, month: number, day: number, hour: number): string {
  // 晚子时处理：23时归属次日
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }
  const solar = SolarLK.fromYmdHms(effYear, effMonth, effDay, 0, 0, 0);
  const lunar = solar.getLunar();
  const prevQi = lunar.getPrevQi();
  if (!prevQi) throw new Error('无法获取中气信息');
  const qiName: string = prevQi.getName();
  const yueJiang = YUE_JIANG_MAP[qiName];
  if (!yueJiang) throw new Error(`中气 "${qiName}" 不在月将表中`);
  return yueJiang;
}

/**
 * 计算隐支外圈：月将安在时支方位，其余地支顺时针依次排列
 * 返回12个地支的数组，顺时针从巽4宫上方起
 */
function computeYinZhiRing(yueJiang: string, timeZhi: string): string[] {
  const ring: string[] = new Array(12);
  const timeZhiPosIdx = PERIMETER_ZHI.indexOf(timeZhi);
  const yueJiangIdx = DI_ZHI.indexOf(yueJiang);
  for (let i = 0; i < 12; i++) {
    const posIdx = (timeZhiPosIdx + i) % 12;
    ring[posIdx] = DI_ZHI[(yueJiangIdx + i) % 12];
  }
  return ring;
}

// ==================== 主排盘函数 ====================

function doPaiPan(
  year: number, month: number, day: number, hour: number, minute: number,
): LuckingPaiPanResult {
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

  // Step 3: 地盘（阳遁顺飞、阴遁逆飞）
  const earth = layoutEarthPlate(ju.juNumber, ju.dunType);

  // Step 4: 值符值使
  const zf = findZhiFuZhiShi(fp.timeGZ, earth);

  // Step 5: 天盘九星
  const starPlate = rotateStar(zf.xunShouPalace, effectiveTimeGan, earth);

  // Step 6: 人盘八门（阳遁递增、阴遁递减）
  const gatePlate = rotateGate(
    zf.zhiShiGate, zf.xunShouPalace, fp.timeGZ, zf.xunShou, ju.dunType,
  );

  // Step 7: 神盘八神
  const spiritPlate = rotateSpirit(starPlate, zf.zhiFuStar);

  // Step 8: 引干（天盘干）
  const heavenStems = computeHeavenStems(starPlate, earth);

  // Step 9: 空亡与马星（马星按时辰定位）
  const { voidPalaces, horsePalace } = computeVoidAndHorse(zf.voidPair, fp.timeZhi);

  // 十二建除（以时支为建起点）
  const jianChuMap = computeJianChu(fp.timeZhi);

  // 建星宫位数据
  const jianChuPalaceData = buildJianChuPalaceData(jianChuMap);

  // 隐干/暗干
  // 1) 值使门当前所在宫位
  let zhiShiGatePalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (gatePlate[p] === zf.zhiShiGate) { zhiShiGatePalace = p; break; }
  }

  // 2) 隐干伏吟检测：旬首六仪落在中5宫（值符=天禽）
  const isFuYin = (zf.zhiFuStar === '天禽');

  let yinGanMap: Record<number, string>;
  if (isFuYin) {
    // 伏吟：旬首在中5宫 → 坤2宫本位干起排，阳顺阴逆
    yinGanMap = computeYinGanFuyin(earth[2], ju.dunType);
  } else {
    // 非伏吟局：地盘追踪法
    yinGanMap = computeYinGanNonFuyin(earth, effectiveTimeGan, zhiShiGatePalace);
  }

  // 隐支：月将安在时支方位，顺时针排12地支
  const yueJiang = computeYueJiang(year, month, day, hour);
  const yinZhiRing = computeYinZhiRing(yueJiang, fp.timeZhi);
  const yinZhiMap: Record<number, string> = {
    4: yinZhiRing[0] + yinZhiRing[11],   // 巽: top + left
    9: yinZhiRing[1],                      // 离: top center
    2: yinZhiRing[2] + yinZhiRing[3],     // 坤: top + right
    7: yinZhiRing[4],                      // 兑: right center
    6: yinZhiRing[5] + yinZhiRing[6],     // 乾: right + bottom
    1: yinZhiRing[7],                      // 坎: bottom center
    8: yinZhiRing[8] + yinZhiRing[9],     // 艮: bottom + left
    3: yinZhiRing[10],                     // 震: left center
  };

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
    voidPair: zf.voidPair,
    zhiFuStar: zf.zhiFuStar,
    zhiShiGate: zf.zhiShiGate,
    xunShou: zf.xunShou,
    xunShouYin: zf.yinStem,
    palaces,
    horsePalace,
    voidPalaces,
    jianChuMap,
    jianChuPalaceData,
    yinGanMap,
    yueJiang,
    yinZhiRing,
    yinZhiMap,
  };
}

// ==================== ASCII格式化输出 ====================

function formatOutput(r: LuckingPaiPanResult): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  // 头部
  const header1 = `公元：${r.year}年${r.month}月${r.day}日${r.hour}时${pad(r.minute)}分 ${r.dunType}${r.juNumber}局`;
  const header2 = `农历：${r.lunarDesc}${r.hour}时${pad(r.minute)}分 时盘`;
  const header3 = `干支：${r.ganZhi.year} ${r.ganZhi.month} ${r.ganZhi.day} ${r.ganZhi.time} (${r.voidPair[0]}${r.voidPair[1]}空)`;
  const header4 = `直符：${r.zhiFuStar}  直使：${r.zhiShiGate}  旬首：${r.xunShou}${r.xunShouYin}`;

  // 九宫格布局：[4,9,2] / [3,5,7] / [8,1,6]
  const grid = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const ring = r.yinZhiRing;
  const topZhi = [ring[0], ring[1], ring[2]];
  const leftZhi = [ring[11], ring[10], ring[9]];
  const rightZhi = [ring[3], ring[4], ring[5]];
  const bottomZhi = [ring[8], ring[7], ring[6]];
  // 建星用固定方位地支查找，不随隐支旋转
  const FIXED_TOP = ['巳', '午', '未'];
  const FIXED_LEFT = ['辰', '卯', '寅'];
  const FIXED_RIGHT = ['申', '酉', '戌'];
  const FIXED_BOTTOM = ['丑', '子', '亥'];
  const jc = r.jianChuMap;

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

  const lines: string[] = [];

  lines.push(header1);
  lines.push(header2);
  lines.push(header3);
  lines.push(header4);
  lines.push('');

  // 上方标注：隐支 + 固定建星
  lines.push(`　　　${topZhi[0]}　${jc[FIXED_TOP[0]]}　　${topZhi[1]}　${jc[FIXED_TOP[1]]}　　${topZhi[2]}　${jc[FIXED_TOP[2]]}`);
  const topStem = r.yinGanMap[9] || '';
  lines.push(`　　　　　　 ${topStem}　 　　　　　　`);
  lines.push('　　┌────┬────┬────┐');

  for (let row = 0; row < 3; row++) {
    const pIds = grid[row];
    const cells = pIds.map(p => cellLines(p));

    const lz = leftZhi[row];
    const rz = rightZhi[row];
    const lfixed = FIXED_LEFT[row];
    const rfixed = FIXED_RIGHT[row];
    const leftPalace = pIds[0];
    const rightPalace = pIds[2];
    const leftStem = r.yinGanMap[leftPalace] || '';
    const rightStem = r.yinGanMap[rightPalace] || '';
    const leftIsVoid = r.voidPalaces.includes(leftPalace);

    const rsPrefix = (Array.from(rightStem).length > 1) ? '' : '　';

    lines.push(`${lz}　│${cells[0][0]}│${cells[1][0]}│${cells[2][0]}│　${rz}`);
    lines.push(`${leftStem}　│${cells[0][1]}│${cells[1][1]}│${cells[2][1]}│${rsPrefix}${rightStem}`);
    lines.push(`${jc[lfixed] || ''}${leftIsVoid ? '○' : '　'}│${cells[0][2]}│${cells[1][2]}│${cells[2][2]}│　${jc[rfixed] || ''}`);

    if (row < 2) {
      lines.push('　　├────┼────┼────┤');
    }
  }

  lines.push('　　└────┴────┴────┘');

  const horseLabel = r.horsePalace > 0 ? '马' : '　';
  const bottomStem = r.yinGanMap[1] || '';
  lines.push(`${horseLabel}　　　　　　 ${bottomStem}　 　　　　　　`);

  lines.push(`　　　${bottomZhi[0]}　${jc[FIXED_BOTTOM[0]]}　　${bottomZhi[1]}　${jc[FIXED_BOTTOM[1]]}　　${bottomZhi[2]}　${jc[FIXED_BOTTOM[2]]}`);
  lines.push('');
  lines.push('　　　　　 《鹿鼎官网排盘》');

  return lines.join('\n');
}

// ==================== 公开API ====================

export function yinpan_lucking(
  year: number, month: number, day: number,
  hour: number, minute: number = 0,
): string {
  const result = doPaiPan(year, month, day, hour, minute);
  return formatOutput(result);
}

/** 导出内部结果（供调试） */
export function yinpan_lucking_data(
  year: number, month: number, day: number,
  hour: number, minute: number = 0,
): LuckingPaiPanResult {
  return doPaiPan(year, month, day, hour, minute);
}
