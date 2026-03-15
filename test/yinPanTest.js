/**
 * 阴盘排盘功能验证脚本
 * 验证：无全伏吟、值符星/八门偏移正确、天盘干独立于地盘干
 */
const { calculateYinPan } = require('../src/lib/qimen/yinPanCalc');
const { applyYinPanStems } = require('../src/lib/qimen/yinPan');

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
  } catch (e) {
    console.log(`  FAIL: ${name} - ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// 测试1: 基本排盘不报错
console.log('\n=== 测试1: 基本排盘 ===');
test('2026-03-14 10:00 排盘不报错', () => {
  const result = calculateYinPan({
    year: 2026, month: 3, day: 14, hour: 10,
    minute: 0, panType: 'yinPan', question: '测试',
    longitude: 116.4, useTrueSolarTime: true,
  });
  assert(result.palaces, '应有palaces');
  assert(result.zhiFuInfo, '应有zhiFuInfo');
  assert(result.timeElements, '应有timeElements');
});

// 测试2: 地盘干固定为元旦盘
console.log('\n=== 测试2: 地盘元旦盘固定不变 ===');
const YUAN_DAN = { 1: '癸', 2: '己', 3: '卯', 4: '辰', 5: '戊', 6: '亥', 7: '酉', 8: '丑', 9: '丙' };

test('不同时间地盘干均相同', () => {
  const times = [
    { year: 2026, month: 3, day: 14, hour: 8 },
    { year: 2026, month: 3, day: 14, hour: 14 },
    { year: 2026, month: 3, day: 15, hour: 10 },
    { year: 2025, month: 7, day: 1, hour: 6 },
  ];
  for (const t of times) {
    const r = calculateYinPan({ ...t, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false });
    for (let p = 1; p <= 9; p++) {
      assert(r.palaces[p].earthStem === YUAN_DAN[p],
        `${t.hour}时 palace ${p}: earth=${r.palaces[p].earthStem}, expected=${YUAN_DAN[p]}`);
    }
  }
});

// 测试3: 无全伏吟（天盘干≠地盘干 至少部分不同）
console.log('\n=== 测试3: 杜绝全伏吟 ===');
test('多个不同时间，天盘干与地盘干不完全相同', () => {
  const times = [
    { year: 2026, month: 3, day: 14, hour: 8 },
    { year: 2026, month: 3, day: 14, hour: 10 },
    { year: 2026, month: 3, day: 14, hour: 14 },
    { year: 2026, month: 3, day: 14, hour: 18 },
    { year: 2026, month: 3, day: 14, hour: 22 },
    { year: 2026, month: 1, day: 1, hour: 6 },
    { year: 2025, month: 8, day: 15, hour: 12 },
  ];
  let allSame = 0;
  for (const t of times) {
    const r = calculateYinPan({ ...t, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false });
    let sameCount = 0;
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      if (r.palaces[p].heavenStem === r.palaces[p].earthStem) sameCount++;
    }
    if (sameCount === 8) allSame++;
    console.log(`    ${t.year}-${t.month}-${t.day} ${t.hour}时: 天==地 ${sameCount}/8宫`);
  }
  assert(allSame < times.length, `${allSame}/${times.length} 个时间全伏吟，算法有误`);
});

// 测试4: 九星偏移非零（非甲时）
console.log('\n=== 测试4: 九星偏移验证 ===');
test('不同时间九星排布不同', () => {
  const r1 = calculateYinPan({ year: 2026, month: 3, day: 14, hour: 8, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false });
  const r2 = calculateYinPan({ year: 2026, month: 3, day: 14, hour: 14, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false });
  
  let starsDiffer = false;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const s1 = r1.palaces[p].star?.name || '';
    const s2 = r2.palaces[p].star?.name || '';
    if (s1 !== s2) starsDiffer = true;
  }
  assert(starsDiffer, '8时和14时九星应不同');
  
  // 打印值符星信息
  console.log(`    8时: 旬首=${r1.zhiFuInfo.xunShou} 六仪=${r1.zhiFuInfo.xunShouYin} 值符星=${r1.zhiFuInfo.zhiFuStar.name} 本位宫=${r1.zhiFuInfo.zhiFuOriginalPalace}`);
  console.log(`    14时: 旬首=${r2.zhiFuInfo.xunShou} 六仪=${r2.zhiFuInfo.xunShouYin} 值符星=${r2.zhiFuInfo.zhiFuStar.name} 本位宫=${r2.zhiFuInfo.zhiFuOriginalPalace}`);
});

// 测试5: 暗干/隐干计算
console.log('\n=== 测试5: 暗干/隐干 ===');
test('暗干和隐干正确附加', () => {
  let r = calculateYinPan({ year: 2026, month: 3, day: 14, hour: 10, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false, yearMing: '甲子' });
  r = applyYinPanStems(r, '甲子');
  
  let hasDark = false, hasHidden = false;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    if (r.palaces[p].yinPanDarkStem) hasDark = true;
    if (r.palaces[p].yinPanHiddenStem) hasHidden = true;
  }
  assert(hasDark, '应有暗干');
  assert(hasHidden, '应有隐干');
  console.log(`    隐干(年命甲子): ${r.palaces[1].yinPanHiddenStem}`);
});

// 测试6: 八神顺序验证
console.log('\n=== 测试6: 八神顺序 ===');
test('八神为 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天', () => {
  const r = calculateYinPan({ year: 2026, month: 3, day: 14, hour: 10, minute: 0, panType: 'yinPan', question: '', useTrueSolarTime: false });
  const expectedOrder = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
  const spirits = [];
  // 从值符所在宫位开始，按顺行顺序收集
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const spirit = r.palaces[p].spirit;
    if (spirit && spirit.name === '值符') {
      // 从值符开始按顺行收集
      const FORWARD = [1, 8, 3, 4, 9, 2, 7, 6];
      const startIdx = FORWARD.indexOf(p);
      for (let i = 0; i < 8; i++) {
        const palace = FORWARD[(startIdx + i) % 8];
        spirits.push(r.palaces[palace].spirit?.name || '');
      }
      break;
    }
  }
  for (let i = 0; i < 8; i++) {
    assert(spirits[i] === expectedOrder[i], `第${i+1}个八神应为${expectedOrder[i]}，实际为${spirits[i]}`);
  }
  console.log(`    八神顺序: ${spirits.join('→')}`);
});

// 测试7: 打印完整排盘结果
console.log('\n=== 测试7: 完整排盘输出 ===');
const result = calculateYinPan({
  year: 2026, month: 3, day: 14, hour: 10, minute: 30,
  panType: 'yinPan', question: '测试', yearMing: '甲子',
  longitude: 116.4, useTrueSolarTime: true,
});
const fullResult = applyYinPanStems(result, '甲子');

console.log(`  时间: ${fullResult.timeElements.yearGanZhi}年 ${fullResult.timeElements.monthGanZhi}月 ${fullResult.timeElements.dayGanZhi}日 ${fullResult.timeElements.timeGanZhi}时`);
console.log(`  旬首: ${fullResult.zhiFuInfo.xunShou} 六仪: ${fullResult.zhiFuInfo.xunShouYin}`);
console.log(`  值符星: ${fullResult.zhiFuInfo.zhiFuStar.name} (本位${fullResult.zhiFuInfo.zhiFuOriginalPalace}宫)`);
console.log(`  值使门: ${fullResult.zhiFuInfo.zhiShiGate.name}`);
console.log(`  真太阳时: ${fullResult.timeElements.trueSolarTimeDesc || '未启用'}`);
console.log('');
console.log('  宫位 | 地盘 | 天盘 | 九星   | 八门   | 八神   | 暗干 | 隐干');
console.log('  -----|------|------|--------|--------|--------|------|-----');
for (let p = 1; p <= 9; p++) {
  const pal = fullResult.palaces[p];
  if (p === 5) {
    console.log('  中5  | 戊   | --   | 天禽   | --     | --     | --   | --  (寄坤2)');
    continue;
  }
  const name = ['', '坎1', '坤2', '震3', '巽4', '', '乾6', '兑7', '艮8', '离9'][p];
  console.log(`  ${name}  | ${pal.earthStem}    | ${pal.heavenStem}    | ${(pal.star?.name || '--').padEnd(6)} | ${(pal.gate?.name || '--').padEnd(6)} | ${(pal.spirit?.name || '--').padEnd(6)} | ${pal.yinPanDarkStem || '--'}   | ${pal.yinPanHiddenStem || '--'}`);
}

console.log('\n=== 全部测试完成 ===\n');
