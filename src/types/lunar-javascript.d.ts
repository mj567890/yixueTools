declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getWeekInChinese(): string;
    getXingZuo(): string;
    getFestivals(): string[];
    getLunar(): Lunar;
    toYmd(): string;
    toYmdHms(): string;
    next(days: number, onlyWorkday?: boolean): Solar;
    subtract(solar: Solar): number;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearShengXiao(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayPositionTai(): string;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getCurrentJieQi(): JieQi | null;
    getNextJieQi(wholeDay?: boolean): JieQi | null;
    getPrevJie(): JieQi | null;
    getNextJie(): JieQi | null;
    getPrevQi(): JieQi | null;
    getNextQi(): JieQi | null;
    getPrevJieQi(): JieQi | null;
    getNextJieQi(): JieQi | null;
    getJieQiTable(): Record<string, Solar>;
  }

  export class EightChar {
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDay(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    setSect(sect: number): void;
  }

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
    setName(name: string): void;
    setJieQi(jieQi: string): void;
  }

  export class HolidayUtil {
    static getHoliday(year: number, month: number, day: number): unknown;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    isForward(): boolean;
    getDaYun(n?: number): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getGanZhi(): string;
    getLiuNian(n?: number): LiuNian[];
  }

  export class LiuNian {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
  }
}
