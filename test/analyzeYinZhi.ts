// 分析三个官网盘的外圈地支排列规律
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 标准（程序当前）：巳午未申酉戌亥子丑寅卯辰（南上，固定不变）
const standard = ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'];

// 三个官网盘的实际排列（顺时针从左上角读取）
const cases = [
  {
    label: '2026-03-14 阳7局 戊申时 (非伏吟)',
    timeZhi: '申',
    ring: ['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
    ganZhi: { time:'戊申', day:'丁亥', month:'辛卯' },
    xunShou: '甲辰壬',
  },
  {
    label: '2024-01-07 阳9局 己卯时 (非伏吟)',
    timeZhi: '卯',
    ring: ['卯','辰','巳','午','未','申','酉','戌','亥','子','丑','寅'],
    ganZhi: { time:'己卯', day:'庚午', month:'乙丑' },
    xunShou: '甲戌己',
  },
  {
    label: '2024-08-25 阴8局 丁酉时 (伏吟)',
    timeZhi: '酉',
    ring: ['丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子'],
    ganZhi: { time:'丁酉', day:'辛酉', month:'壬申' },
    xunShou: '甲午辛',
  },
];

for (const c of cases) {
  const ringStart = c.ring[0];
  const startIdx = DI_ZHI.indexOf(ringStart);
  const timeZhiIdx = DI_ZHI.indexOf(c.timeZhi);
  
  console.log(`--- ${c.label} ---`);
  console.log(`  时支=${c.timeZhi}(${timeZhiIdx}), 环起始=${ringStart}(${startIdx})`);
  console.log(`  时支=环起始: ${c.timeZhi === ringStart}`);
  console.log(`  干支: 时=${c.ganZhi.time} 日=${c.ganZhi.day} 月=${c.ganZhi.month}`);
  console.log(`  旬首: ${c.xunShou}`);
  console.log('');
}

// 甲午旬对应：甲午 乙未 丙申 丁酉 戊戌 己亥 庚子 辛丑 壬寅 癸卯
// 旬首六仪=辛, 辛对应地支=丑
console.log('--- 伏吟案例分析 ---');
console.log('旬首甲午辛, 辛在甲午旬中对应: 辛丑');
console.log('环起始=丑, 恰好是旬首六仪辛的配对地支');
