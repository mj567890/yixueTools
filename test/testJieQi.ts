import { Solar as SolarLK } from 'lunar-javascript';
const solar = SolarLK.fromYmdHms(2024, 1, 1, 0, 0, 0);
const lunar = solar.getLunar();
const prevJie = lunar.getPrevJie();
const prevQi = lunar.getPrevQi();
const prevJieQi = lunar.getPrevJieQi();
console.log('getPrevJie:', prevJie ? prevJie.getName() : 'null');
console.log('getPrevQi:', prevQi ? prevQi.getName() : 'null');
console.log('getPrevJieQi:', prevJieQi ? prevJieQi.getName() : 'null');
