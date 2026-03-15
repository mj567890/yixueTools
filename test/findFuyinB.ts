import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

const results: string[] = [];
let found = false;

outer:
for (let y = 2024; y <= 2027 && !found; y++) {
  for (let m = 1; m <= 12 && !found; m++) {
    for (let d = 1; d <= 28 && !found; d++) {
      for (let h = 1; h <= 23; h += 2) {
        try {
          const data = yinpan_lucking_data(y, m, d, h, 0);
          const timeGan = data.ganZhi.time[0];
          // 甲X时 → effectiveTimeGan=旬首六仪 → 落宫=xunShouPalace → 伏吟
          // 值符不是天禽 → 旬首不在中宫
          if (timeGan === '甲' && data.zhiFuStar !== '天禽') {
            results.push(
              `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ` +
              `${String(h).padStart(2,'0')}:00  ` +
              `${data.dunType}${data.juNumber}局  ` +
              `值符:${data.zhiFuStar}  旬首:${data.xunShou}${data.xunShouYin}  ` +
              `时柱:${data.ganZhi.time}`
            );
            if (results.length >= 8) {
              found = true;
              break;
            }
          }
        } catch(e) {
          // skip invalid dates
        }
      }
    }
  }
}

console.log(`找到 ${results.length} 个案例：`);
results.forEach(r => console.log(r));
