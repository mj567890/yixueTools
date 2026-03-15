/**
 * 测试脚本：验证 yinpan_paipan 排盘结果
 * 测试用例：2026年3月14日16时22分 → 阳7局
 */
const { yinpan_paipan, yinpan_paipan_data } = require('../src/lib/qimen/yinpanPaipan');

// 先输出结构化数据用于调试
const data = yinpan_paipan_data(2026, 3, 14, 16, 22);

console.log('=== 基本信息 ===');
console.log('四柱:', data.ganZhi);
console.log('局数:', data.dunType + data.juNumber + '局');
console.log('旬首:', data.xunShou + data.xunShouYin);
console.log('值符:', data.zhiFuStar);
console.log('值使:', data.zhiShiGate);
console.log('空亡:', data.voidPair);
console.log('马星宫:', data.horsePalace);

console.log('\n=== 九宫数据 ===');
for (let p = 1; p <= 9; p++) {
  const d = data.palaces[p];
  console.log(`宫${p}: 地盘=${d.earthStem} 天盘=${d.heavenStem} 星=${d.star} 门=${d.gate} 神=${d.spirit}`);
}

console.log('\n=== 十二建除 ===');
console.log(data.jianChuMap);

// 验证关键值
function assert(cond, msg) {
  if (!cond) console.log('  FAIL:', msg);
  else console.log('  PASS:', msg);
}

console.log('\n=== 验证 ===');
assert(data.dunType === '阳' && data.juNumber === 7, '应为阳7局');
assert(data.ganZhi.year === '丙午', '年柱丙午');
assert(data.ganZhi.month === '辛卯', '月柱辛卯');
assert(data.ganZhi.day === '丁亥', '日柱丁亥');
assert(data.ganZhi.time === '戊申', '时柱戊申');
assert(data.xunShou === '甲辰', '旬首甲辰');
assert(data.xunShouYin === '壬', '六仪壬');
assert(data.zhiFuStar === '天冲', '值符天冲');
assert(data.zhiShiGate === '伤门', '值使伤门');
assert(data.voidPair[0] === '午' && data.voidPair[1] === '未', '空亡午未');

// 验证地盘（阳7局逆飞 - 阴盘）
// 7=戊,6=己,5=庚,4=辛,3=壬,2=癸,1=丁,9=丙,8=乙
assert(data.palaces[7].earthStem === '戊', '地盘7宫=戊');
assert(data.palaces[1].earthStem === '丁', '地盘1宫=丁');
assert(data.palaces[3].earthStem === '壬', '地盘3宫=壬');
assert(data.palaces[9].earthStem === '丙', '地盘9宫=丙');

// 验证天盘九星（转盘）
// 期望：1=英,2=任,3=柱,4=心,6=辅,7=冲,8=芮,9=蓬
assert(data.palaces[1].star === '天英', '天盘1宫=天英');
assert(data.palaces[2].star === '天任', '天盘2宫=天任');
assert(data.palaces[3].star === '天柱', '天盘3宫=天柱');
assert(data.palaces[4].star === '天心', '天盘4宫=天心');
assert(data.palaces[6].star === '天辅', '天盘6宫=天辅');
assert(data.palaces[7].star === '天冲', '天盘7宫=天冲');
assert(data.palaces[8].star === '天芮', '天盘8宫=天芮');
assert(data.palaces[9].star === '天蓬', '天盘9宫=天蓬');

// 验证八门
// 期望：1=生,2=惊,3=杜,4=景,6=休,7=开,8=伤,9=死
assert(data.palaces[1].gate === '生门', '人盘1宫=生门');
assert(data.palaces[2].gate === '惊门', '人盘2宫=惊门');
assert(data.palaces[3].gate === '杜门', '人盘3宫=杜门');
assert(data.palaces[4].gate === '景门', '人盘4宫=景门');
assert(data.palaces[6].gate === '休门', '人盘6宫=休门');
assert(data.palaces[7].gate === '开门', '人盘7宫=开门');
assert(data.palaces[8].gate === '伤门', '人盘8宫=伤门');
assert(data.palaces[9].gate === '死门', '人盘9宫=死门');

// 验证八神
// 期望：7=直符,6=腾蛇,1=太阴,8=六合,3=白虎,4=玄武,9=九地,2=九天
assert(data.palaces[7].spirit === '直符', '神盘7宫=直符');
assert(data.palaces[6].spirit === '腾蛇', '神盘6宫=腾蛇');
assert(data.palaces[1].spirit === '太阴', '神盘1宫=太阴');
assert(data.palaces[8].spirit === '六合', '神盘8宫=六合');
assert(data.palaces[3].spirit === '白虎', '神盘3宫=白虎');
assert(data.palaces[4].spirit === '玄武', '神盘4宫=玄武');
assert(data.palaces[9].spirit === '九地', '神盘9宫=九地');
assert(data.palaces[2].spirit === '九天', '神盘2宫=九天');

// 验证天盘干（引干）
assert(data.palaces[1].heavenStem === '丙', '引干1宫=丙');
assert(data.palaces[4].heavenStem === '己', '引干4宫=己');
assert(data.palaces[7].heavenStem === '壬', '引干7宫=壬');

console.log('\n=== 完整排盘输出 ===\n');
console.log(yinpan_paipan(2026, 3, 14, 16, 22));
