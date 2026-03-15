/**
 * 时辰顺逆推局数验证
 * 2026-03-14 (丁亥日, 惊蛰, 旬首甲申→中元, 基础局阳7局)
 * 阳遁顺推：不同时辰应产生不同局数
 */
const { yinpan_lucking_data } = require('../src/lib/qimen/luckingPaipan');
const { yinpan_paipan_data } = require('../src/lib/qimen/yinpanPaipan');

function assert(cond, msg) {
  if (!cond) {
    console.log('  FAIL:', msg);
    process.exitCode = 1;
  } else {
    console.log('  PASS:', msg);
  }
}

console.log('=== 鹿鼎版 时辰局数验证 ===');

// 辰时 (07:27) → 阳3局
const lk_chen = yinpan_lucking_data(2026, 3, 14, 7, 27);
console.log(`辰时(07:27): ${lk_chen.dunType}${lk_chen.juNumber}局`);
assert(lk_chen.dunType === '阳' && lk_chen.juNumber === 3, '辰时应为阳3局');

// 午时 (11:27) → 阳5局
const lk_wu = yinpan_lucking_data(2026, 3, 14, 11, 27);
console.log(`午时(11:27): ${lk_wu.dunType}${lk_wu.juNumber}局`);
assert(lk_wu.dunType === '阳' && lk_wu.juNumber === 5, '午时应为阳5局');

// 申时 (15:27) → 阳7局
const lk_shen = yinpan_lucking_data(2026, 3, 14, 15, 27);
console.log(`申时(15:27): ${lk_shen.dunType}${lk_shen.juNumber}局`);
assert(lk_shen.dunType === '阳' && lk_shen.juNumber === 7, '申时应为阳7局');

// 申时另一个时间点 (16:22)
const lk_shen2 = yinpan_lucking_data(2026, 3, 14, 16, 22);
console.log(`申时(16:22): ${lk_shen2.dunType}${lk_shen2.juNumber}局`);
assert(lk_shen2.dunType === '阳' && lk_shen2.juNumber === 7, '申时16:22应为阳7局');

console.log('\n=== 王凤麟版 时辰局数验证 ===');

// 辰时 (07:27) → 阳3局
const pp_chen = yinpan_paipan_data(2026, 3, 14, 7, 27);
console.log(`辰时(07:27): ${pp_chen.dunType}${pp_chen.juNumber}局`);
assert(pp_chen.dunType === '阳' && pp_chen.juNumber === 3, '辰时应为阳3局');

// 午时 (11:27) → 阳5局
const pp_wu = yinpan_paipan_data(2026, 3, 14, 11, 27);
console.log(`午时(11:27): ${pp_wu.dunType}${pp_wu.juNumber}局`);
assert(pp_wu.dunType === '阳' && pp_wu.juNumber === 5, '午时应为阳5局');

// 申时 (15:27) → 阳7局
const pp_shen = yinpan_paipan_data(2026, 3, 14, 15, 27);
console.log(`申时(15:27): ${pp_shen.dunType}${pp_shen.juNumber}局`);
assert(pp_shen.dunType === '阳' && pp_shen.juNumber === 7, '申时应为阳7局');

console.log('\n=== 全12时辰局数列表 (鹿鼎版 2026-03-14) ===');
const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
for (let i = 0; i < hours.length; i++) {
  const d = yinpan_lucking_data(2026, 3, 14, hours[i], 0);
  console.log(`${shichenNames[i]}时(${String(hours[i]).padStart(2,'0')}:00): ${d.dunType}${d.juNumber}局`);
}
