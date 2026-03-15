/**
 * 隐干算法测试：验证伏吟/非伏吟判定修复
 */
import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

function assert(cond, msg) {
  if (!cond) console.log('  FAIL:', msg);
  else console.log('  PASS:', msg);
}

// 测试1: 2024-07-31 11:53 甲午时 阴8局 → 应使用伏吟算法
console.log('=== 测试1: 2024-07-31 11:53 甲午时 阴8局 (伏吟) ===');
const d1 = yinpan_lucking_data(2024, 7, 31, 11, 53);
console.log('遁类型:', d1.dunType, '局数:', d1.juNumber);
console.log('隐干:');
for (let p = 1; p <= 9; p++) {
  console.log(`  P${p}: ${d1.yinGanMap[p] || '(空)'}`);
}
// 期望: P1=己, P2=戊, P3=乙, P4=丙, P5=丁, P6=癸, P7=壬, P8=辛, P9=庚
assert(d1.yinGanMap[1] === '己', 'P1=己');
assert(d1.yinGanMap[2] === '戊', 'P2=戊');
assert(d1.yinGanMap[3] === '乙', 'P3=乙');
assert(d1.yinGanMap[4] === '丙', 'P4=丙');
assert(d1.yinGanMap[5] === '丁', 'P5=丁');
assert(d1.yinGanMap[6] === '癸', 'P6=癸');
assert(d1.yinGanMap[7] === '壬', 'P7=壬');
assert(d1.yinGanMap[8] === '辛', 'P8=辛');
assert(d1.yinGanMap[9] === '庚', 'P9=庚');

// 测试2: 2024-07-27 01:53 辛丑时 阴8局 → 应使用非伏吟算法
console.log('\n=== 测试2: 2024-07-27 01:53 辛丑时 阴8局 (非伏吟) ===');
const d2 = yinpan_lucking_data(2024, 7, 27, 1, 53);
console.log('遁类型:', d2.dunType, '局数:', d2.juNumber);
console.log('隐干:');
for (let p = 1; p <= 9; p++) {
  console.log(`  P${p}: ${d2.yinGanMap[p] || '(空)'}`);
}
// 验证非伏吟算法被正确选择（不是伏吟结果）
// 伏吟结果应该是: P1=己, P2=戊, P3=乙, P4=丙, P5=丁, P6=癸, P7=壬, P8=辛, P9=庚
// 非伏吟结果应该不同
assert(d2.yinGanMap[1] !== '己' || d2.yinGanMap[9] !== '庚', '非伏吟：结果与伏吟不同');
console.log('值符:', d2.zhiFuStar, '值使:', d2.zhiShiGate);
console.log('旬首:', d2.xunShou, '旬首六仪:', d2.xunShouYin);
console.log('干支:', JSON.stringify(d2.ganZhi));
for (let p = 1; p <= 9; p++) {
  console.log(`  地盘P${p}: ${d2.palaces[p].earthStem}, 天盘: ${d2.palaces[p].heavenStem}, 门: ${d2.palaces[p].gate}`);
}

// 测试3: 之前已验证的非伏吟用例 2026-03-15 09:16 阳5局
console.log('\n=== 测试3: 2026-03-15 09:16 阳5局 (非伏吟回归) ===');
const d3 = yinpan_lucking_data(2026, 3, 15, 9, 16);
console.log('遁类型:', d3.dunType, '局数:', d3.juNumber);
console.log('隐干:');
for (let p = 1; p <= 9; p++) {
  console.log(`  P${p}: ${d3.yinGanMap[p] || '(空)'}`);
}
