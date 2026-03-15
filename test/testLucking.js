/**
 * 鹿鼎官网版排盘测试：逐字对比 + 关键值断言
 * 测试用例：2026年3月14日16时22分 → 阳7局
 */
const { yinpan_lucking, yinpan_lucking_data } = require('../src/lib/qimen/luckingPaipan');

// ========== 关键值断言 ==========

const data = yinpan_lucking_data(2026, 3, 14, 16, 22);

function assert(cond, msg) {
  if (!cond) console.log('  FAIL:', msg);
  else console.log('  PASS:', msg);
}

console.log('=== 鹿鼎官网版 关键值验证 ===');
assert(data.dunType === '阳' && data.juNumber === 7, '应为阳7局');
assert(data.zhiFuStar === '天芮', '值符天芮');
assert(data.zhiShiGate === '死门', '值使死门');
assert(data.voidPair[0] === '寅' && data.voidPair[1] === '卯', '空亡寅卯(时柱)');

// 地盘（阳7局顺飞 - 鹿鼎版）
// 7=戊,8=己,9=庚,1=辛,2=壬,3=癸,4=丁,5=丙,6=乙
assert(data.palaces[7].earthStem === '戊', '地盘7宫=戊');
assert(data.palaces[1].earthStem === '辛', '地盘1宫=辛');
assert(data.palaces[3].earthStem === '癸', '地盘3宫=癸');
assert(data.palaces[9].earthStem === '庚', '地盘9宫=庚');

// 天盘九星
assert(data.palaces[1].star === '天心', '天盘1宫=天心');
assert(data.palaces[4].star === '天冲', '天盘4宫=天冲');
assert(data.palaces[7].star === '天芮', '天盘7宫=天芮');
assert(data.palaces[9].star === '天辅', '天盘9宫=天辅');

// 八门
assert(data.palaces[1].gate === '惊门', '人盘1宫=惊门');
assert(data.palaces[4].gate === '生门', '人盘4宫=生门');
assert(data.palaces[7].gate === '景门', '人盘7宫=景门');
assert(data.palaces[9].gate === '伤门', '人盘9宫=伤门');

// 八神
assert(data.palaces[7].spirit === '直符', '神盘7宫=直符');
assert(data.palaces[6].spirit === '腾蛇', '神盘6宫=腾蛇');

// ========== 逐字对比 ==========

console.log('\n=== 鹿鼎官网版 逐字对比 ===\n');

const actual = yinpan_lucking(2026, 3, 14, 16, 22);

// 范例预期输出（逐字复制自官网源码）
const expected = `公元：2026年3月14日16时22分 阳7局
农历：马年01月26日16时22分 时盘
干支：丙午 辛卯 丁亥 戊申 (寅卯空)
直符：天芮  直使：死门  旬首：甲辰壬

　　　申　收　　酉　开　　戌　闭
　　　　　　 丁　 　　　　　　
　　┌────┬────┬────┐
未　│玄　　　│地　　　│天　　　│　亥
癸　│癸　冲│丁　辅│庚　英│　庚
成　│丁　生│庚　伤│壬丙　杜│　建
　　├────┼────┼────┤
午　│白　　　│　　　　│符　　　│　子
己　│己　任│　　　　│壬丙　芮│丙壬
危○│癸　休│　　　　│戊　景│　除
　　├────┼────┼────┤
巳　│六　　　│阴　　　│蛇　　　│　丑
辛　│辛　蓬│乙　心│戊　柱│　戊
破○│己　开│辛　惊│乙　死│　满
　　└────┴────┴────┘
马　　　　　　 乙　 　　　　　　
　　　辰　执　　卯　定　　寅　平

　　　　　 《鹿鼎官网排盘》`;

const actualLines = actual.split('\n');
const expectedLines = expected.split('\n');

console.log(`实际行数: ${actualLines.length}, 期望行数: ${expectedLines.length}\n`);

let diffCount = 0;
const maxLines = Math.max(actualLines.length, expectedLines.length);
for (let i = 0; i < maxLines; i++) {
  const a = actualLines[i] || '';
  const e = expectedLines[i] || '';
  if (a === e) {
    console.log(`  OK L${String(i+1).padStart(2)}: ${e}`);
  } else {
    diffCount++;
    console.log(`DIFF L${String(i+1).padStart(2)}:`);
    console.log(`  实际: [${a}]`);
    console.log(`  期望: [${e}]`);
    for (let j = 0; j < Math.max(a.length, e.length); j++) {
      if (a[j] !== e[j]) {
        console.log(`  差异位置: ${j}, 实际='${a[j]||'EOF'}' (${a.charCodeAt(j)||'N/A'}), 期望='${e[j]||'EOF'}' (${e.charCodeAt(j)||'N/A'})`);
        break;
      }
    }
  }
}

console.log(`\n总差异行数: ${diffCount}/${maxLines}`);
if (diffCount === 0) {
  console.log('\n✓ 鹿鼎官网版输出与范例完全一致！');
}
