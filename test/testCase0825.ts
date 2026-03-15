import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

const d = yinpan_lucking_data(2024, 8, 25, 17, 39);
console.log('遁类型:', d.dunType, '局数:', d.juNumber);
console.log('干支:', JSON.stringify(d.ganZhi));
console.log('值符:', d.zhiFuStar, '值使:', d.zhiShiGate);
console.log('旬首:', d.xunShou, '旬首六仪:', d.xunShouYin);
console.log('空亡:', d.voidPair);
console.log('');
console.log('=== 各宫详细 ===');
for (let p = 1; p <= 9; p++) {
  console.log(`P${p}: 地盘=${d.palaces[p].earthStem}, 天盘=${d.palaces[p].heavenStem}, 星=${d.palaces[p].star}, 门=${d.palaces[p].gate}, 神=${d.palaces[p].spirit}, 隐干=${(d as any).yinGanMap[p] || '(空)'}`);
}

console.log('');
console.log('=== 隐干对比 ===');
// 期望隐干 (从正确盘面读取):
// P1=庚, P2=丁辛, P3=乙, P4=壬, P5=丁, P6=癸, P7=戊, P8=丙, P9=己 (不确定)
// 让我从盘面仔细读取
// 正确盘面第三行(隐干行):
// P4(左上)=壬, P9(上中)=乙, P2(右上)=丁辛
// P3(左中)=癸, P5(中)=丁, P7(右中)=己
// P8(左下)=戊, P1(下中)=丙, P6(右下)=庚
const expected: Record<number, string> = {
  4: '壬', 9: '乙', 2: '丁辛',
  3: '癸', 5: '丁', 7: '己',
  8: '戊', 1: '丙', 6: '庚'
};

for (let p = 1; p <= 9; p++) {
  const actual = (d as any).yinGanMap[p] || '(空)';
  const exp = expected[p] || '?';
  const match = actual === exp ? 'OK' : 'DIFF';
  console.log(`  P${p}: 实际=${actual}, 期望=${exp}, ${match}`);
}
