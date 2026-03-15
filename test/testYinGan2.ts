import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

function assert(cond: boolean, msg: string) {
  if (!cond) console.log('  FAIL:', msg);
  else console.log('  PASS:', msg);
}

// 伏吟隐干期望值 (阴8局, 旬首甲午辛, 分支A)
// earth[2]=丁 放 P5, 阴逆: P5=丁,P4=丙,P3=乙,P2=戊,P1=己,P9=庚,P8=辛,P7=壬,P6=癸
const fuyinExpected: Record<number, string> = {
  1: '己', 2: '戊', 3: '乙', 4: '丙', 5: '丁', 6: '癸', 7: '壬', 8: '辛', 9: '庚'
};

// 测试1: 2024-08-25 17:39 丁酉时 阴8局 (伏吟 + 旬首在中宫)
console.log('=== 测试1: 2024-08-25 17:39 丁酉时 阴8局 ===');
const d1 = yinpan_lucking_data(2024, 8, 25, 17, 39);
console.log('  遁:', d1.dunType, '局:', d1.juNumber, '值符:', d1.zhiFuStar);
console.log('  干支:', JSON.stringify(d1.ganZhi));
for (let p = 1; p <= 9; p++) {
  const actual = (d1 as any).yinGanMap[p] || '(空)';
  const exp = fuyinExpected[p];
  console.log(`  P${p}: ${actual} ${actual === exp ? 'OK' : 'DIFF(期望' + exp + ')'}`);
}

// 测试2: 2024-07-31 11:53 甲午时 阴8局 (伏吟 + 旬首在中宫)
console.log('\n=== 测试2: 2024-07-31 11:53 甲午时 阴8局 ===');
const d2 = yinpan_lucking_data(2024, 7, 31, 11, 53);
console.log('  遁:', d2.dunType, '局:', d2.juNumber, '值符:', d2.zhiFuStar);
for (let p = 1; p <= 9; p++) {
  const actual = (d2 as any).yinGanMap[p] || '(空)';
  const exp = fuyinExpected[p];
  console.log(`  P${p}: ${actual} ${actual === exp ? 'OK' : 'DIFF(期望' + exp + ')'}`);
}

// 测试3: 2024-07-27 01:53 辛丑时 阴8局 (同旬首甲午辛)
console.log('\n=== 测试3: 2024-07-27 01:53 辛丑时 阴8局 ===');
const d3 = yinpan_lucking_data(2024, 7, 27, 1, 53);
console.log('  遁:', d3.dunType, '局:', d3.juNumber, '值符:', d3.zhiFuStar);
console.log('  干支:', JSON.stringify(d3.ganZhi));
for (let p = 1; p <= 9; p++) {
  const actual = (d3 as any).yinGanMap[p] || '(空)';
  console.log(`  P${p}: ${actual}`);
}

// 测试4: 2026-03-15 09:16 阳5局 (非伏吟回归)
console.log('\n=== 测试4: 2026-03-15 09:16 阳5局 (非伏吟) ===');
const d4 = yinpan_lucking_data(2026, 3, 15, 9, 16);
console.log('  遁:', d4.dunType, '局:', d4.juNumber, '值符:', d4.zhiFuStar);
for (let p = 1; p <= 9; p++) {
  const actual = (d4 as any).yinGanMap[p] || '(空)';
  console.log(`  P${p}: ${actual}`);
}
