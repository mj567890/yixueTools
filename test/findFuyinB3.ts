import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';

const results: string[] = [];
let found = false;

for (let y = 2024; y <= 2027 && !found; y++) {
  for (let m = 1; m <= 12 && !found; m++) {
    for (let d = 1; d <= 28 && !found; d++) {
      for (let h = 1; h <= 23; h += 2) {
        try {
          const data = yinpan_lucking_data(y, m, d, h, 0);
          const timeGan = data.ganZhi.time[0];
          if (timeGan === '甲') continue;
          if (data.zhiFuStar === '天禽') continue;

          let allSame = true;
          for (let p = 1; p <= 9; p++) {
            if (p === 5) continue;
            if (data.palaces[p].earthStem !== data.palaces[p].heavenStem) {
              allSame = false;
              break;
            }
          }
          if (!allSame) continue;

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
        } catch(e) {}
      }
    }
  }
}

console.log(`找到 ${results.length} 个案例：`);
results.forEach(r => console.log(r));
