import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

// 已知官网验证过的案例
const cases = [
  { y:2024, m:8, d:25, h:17, min:39, label:'阴8局 丁酉时', expectFuyin: true },
  { y:2024, m:1, d:7,  h:5,  min:46, label:'阳9局 己卯时', expectFuyin: false },
  { y:2026, m:3, d:14, h:16, min:22, label:'阳7局 戊申时', expectFuyin: false },
  { y:2026, m:3, d:15, h:9,  min:16, label:'阳5局 丁巳时', expectFuyin: false },
];

const STEM_SEQ = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];

for (const c of cases) {
  const d = yinpan_lucking_data(c.y, c.m, c.d, c.h, c.min);
  
  // 找effectiveTimeGan
  const timeGan = d.ganZhi.time[0];
  let effectiveTimeGan = timeGan;
  if (timeGan === '甲') effectiveTimeGan = d.xunShouYin;
  
  // 找effectiveTimeGan在地盘的原始宫位(不做5→2调整)
  // 重建地盘
  const earth: Record<number, string> = {};
  if (d.dunType === '阴') {
    for (let i = 0; i < 9; i++) {
      let palace = d.juNumber - i;
      while (palace < 1) palace += 9;
      earth[palace] = STEM_SEQ[i];
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const palace = ((d.juNumber - 1 + i) % 9) + 1;
      earth[palace] = STEM_SEQ[i];
    }
  }
  
  // 找旬首六仪原始宫位
  let xunShouRawPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === d.xunShouYin) { xunShouRawPalace = p; break; }
  }
  
  // 找effectiveTimeGan原始宫位
  let timeGanRawPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === effectiveTimeGan) { timeGanRawPalace = p; break; }
  }
  
  console.log(`--- ${c.y}-${c.m}-${c.d} ${c.h}:${c.min} ${c.label} ---`);
  console.log(`  时干=${timeGan}, effectiveTimeGan=${effectiveTimeGan}`);
  console.log(`  旬首=${d.xunShou}${d.xunShouYin}, 六仪原始落宫=P${xunShouRawPalace}`);
  console.log(`  effectiveTimeGan原始落宫=P${timeGanRawPalace}`);
  console.log(`  值符=${d.zhiFuStar} (天禽=${d.zhiFuStar==='天禽'})`);
  console.log(`  旬首在中宫=${xunShouRawPalace===5}, 时干在中宫=${timeGanRawPalace===5}`);
  console.log(`  天盘=地盘: ${(() => { for(let p=1;p<=9;p++){if(p===5)continue;if(d.palaces[p].earthStem!==d.palaces[p].heavenStem)return false;} return true; })()}`);
  console.log(`  期望伏吟=${c.expectFuyin}`);
  console.log('');
}
