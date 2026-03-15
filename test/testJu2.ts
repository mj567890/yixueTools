import { yinpan_lucking_data } from '../src/lib/qimen/luckingPaipan';
const d = yinpan_lucking_data(2024, 1, 1, 7, 22);
console.log(d.dunType + d.juNumber + '局');
console.log('干支:', JSON.stringify(d.ganZhi));
