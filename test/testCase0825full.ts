import { yinpan_lucking, yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

// 运行完整文本输出
const text = yinpan_lucking(2024, 8, 25, 17, 39);
console.log('=== 程序输出 ===');
console.log(text);

console.log('\n=== 期望输出 ===');
const expected = `公元：2024年8月25日17时39分 阴8局
农历：龙年07月22日17时39分 时盘
干支：甲辰 壬申 辛酉 丁酉 (辰巳空)
直符：天禽  直使：死门  旬首：甲午辛

　　　丑　成　　寅　收　　卯　开
　　　　　 ○　　 庚　 　　　　　　
　　┌────┬────┬────┐
子　│阴　　　│蛇　　　│符　　　│　辰
丙　│壬　　辅│乙　　英│丁辛　芮│　戊
危○│壬　　杜│乙　　景│丁辛　死│　闭
　　├────┼────┼────┤
亥　│六　　　│　　　　│天　　　│　巳
乙　│癸　　冲│　　　　│己　　柱│　壬
破　│癸　　伤│　　　丁│己　　惊│　建
　　├────┼────┼────┤
戌　│白　　　│玄　　　│地　　　│　午
辛　│戊　　任│丙　　蓬│庚　　心│　癸
执　│戊　　生│丙　　休│庚　　开│　除
　　└────┴────┴────┘
　　　　　 　　　 己　 　　　　　　　 马
　　　酉　定　　申　平　　未　满`;
console.log(expected);

// 逐行对比
console.log('\n=== 逐行对比 ===');
const actualLines = text.split('\n');
const expectedLines = expected.split('\n');
const maxLines = Math.max(actualLines.length, expectedLines.length);
let diffCount = 0;
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
  }
}
console.log(`\n差异行数: ${diffCount}/${maxLines}`);
