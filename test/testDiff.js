/**
 * 逐字对比测试：验证输出与范例完全一致
 */
const { yinpan_paipan } = require('../src/lib/qimen/yinpanPaipan');

const actual = yinpan_paipan(2026, 3, 14, 16, 22);

// 范例预期输出（逐字复制）
const expected = `公元：2026年3月14日16时22分 阳7局
农历：马年01月26日16时22分 时盘
干支：丙午 辛卯 丁亥 戊申 (午未空)
直符：天冲 直使：伤门 旬首：甲辰壬

　　　申　收　　酉　开　　戌　闭
　　　　　　 丁　 　　　　　　
　　┌────┬────┬────┐
未　│玄　　　│地　　　│天　　　│　亥
己　│己　心│丁　蓬│乙　任│　乙
成　│辛　景│丙　死│癸庚　惊│　建
　　├────┼────┼────┤
午　│白　　　│　　　　│符　　　│　子
戊　│戊　柱│　　　　│壬　冲│　壬
危　│壬　杜│　　　　│戊　开│　除
　　├────┼────┼────┤
巳　│六　　　│阴　　　│蛇　　　│　丑
癸庚　│癸庚　芮│丙　英│辛　辅│　辛
破　│乙　伤│丁　生│己　休│　满
　　└────┴────┴────┘
马　　　　　　 丙　 　　　　　　
　　　辰　执　　卯　定　　寅　平

　　　　　 《王凤麟道家奇门》`;

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
    // 找出第一个不同的字符位置
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
  console.log('\n✓ 输出与范例完全一致！');
}
