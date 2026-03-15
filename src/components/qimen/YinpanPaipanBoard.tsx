'use client';

// ==================== 共享类型 ====================

export interface PaipanPalace {
  star: string;
  gate: string;
  spirit: string;
  earthStem: string;
  heavenStem: string;
}

export interface JianChuItem {
  zhi: string;
  jianChu: string;
}

export interface PaipanData {
  year: number; month: number; day: number; hour: number; minute: number;
  lunarDesc: string;
  dunType: '阳' | '阴';
  juNumber: number;
  ganZhi: { year: string; month: string; day: string; time: string };
  voidPair: [string, string];
  zhiFuStar: string;
  zhiShiGate: string;
  xunShou: string;
  xunShouYin: string;
  palaces: Record<number, PaipanPalace>;
  horsePalace: number;
  voidPalaces: number[];
  jianChuMap: Record<string, string>;
  jianChuPalaceData: Record<number, JianChuItem[]>;
  yinGanMap: Record<number, string>;
  yueJiang: string;
  yinZhiRing: string[];
  yinZhiMap: Record<number, string>;
}

// ==================== 九宫信息 ====================

const PALACE_NAMES: Record<number, string> = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫',
};

/** 天干五行配色 */
const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const WX_COLOR: Record<string, string> = {
  '木': '#1B5E20', '火': '#C23B22', '土': '#BF360C', '金': '#E65100', '水': '#0D47A1',
};

function stemColor(stem: string): string {
  if (!stem) return '#333';
  const wx = GAN_WX[stem.charAt(0)];
  return wx ? (WX_COLOR[wx] || '#333') : '#333';
}

// ==================== 子组件 ====================

const infoFontSize = '18px';

function InfoTag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1">
      <span style={{ fontSize: '15px', color: 'var(--color-ink-light)' }}>{label}</span>
      <span
        className="font-medium"
        style={{
          fontSize: infoFontSize,
          fontFamily: 'var(--font-family-kai)',
          color: highlight ? 'var(--color-cinnabar)' : 'var(--color-ink)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PaipanPalaceCell({ palace, palaceId, isVoid, isHorse }: {
  palace: PaipanPalace;
  palaceId: number;
  isVoid: boolean;
  isHorse: boolean;
}) {
  const cellFontSize = '22px';

  if (palaceId === 5) {
    return (
      <div
        className="p-2 flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]"
        style={{ background: 'var(--color-bg-card)' }}
      />
    );
  }

  return (
    <div
      className="p-1.5 md:p-2 flex flex-col justify-between min-h-[140px] md:min-h-[160px]"
      style={{ background: 'var(--color-bg-card)' }}
    >
      {/* 顶行：左=八神 右=空亡/马星 */}
      <div className="flex justify-between items-start">
        <span style={{ fontSize: cellFontSize, color: '#8B4513', lineHeight: 1.2 }}>
          {palace.spirit}
        </span>
        {(isVoid || isHorse) && (
          <div className="flex flex-col items-end">
            {isVoid && (
              <span style={{ fontSize: cellFontSize, color: '#666', lineHeight: 1.2 }}>空</span>
            )}
            {isHorse && (
              <span style={{ fontSize: cellFontSize, color: '#E65100', lineHeight: 1.2 }}>马</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* 底行：左=天地盘干 右=九星(上)+八门(下) */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col" style={{ lineHeight: 1.3 }}>
          <span style={{ fontSize: cellFontSize, fontWeight: 600, color: stemColor(palace.heavenStem) }}>
            {palace.heavenStem}
          </span>
          <span style={{ fontSize: cellFontSize, color: stemColor(palace.earthStem) }}>
            {palace.earthStem}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span style={{ fontSize: cellFontSize, color: '#B8860B', lineHeight: 1.2 }}>
            {palace.star}
          </span>
          <span style={{ fontSize: cellFontSize, color: '#C23B22', lineHeight: 1.2 }}>
            {palace.gate}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== 外围布局常量 ====================

// 左侧对应宫位（行从上到下：巽4、震3、艮8）
const LEFT_PALACES = [4, 3, 8];
// 右侧对应宫位（行从上到下：坤2、兑7、乾6）
const RIGHT_PALACES = [2, 7, 6];

// 固定方位地支（建星用，不随隐支旋转）
const FIXED_TOP = ['巳', '午', '未'];
const FIXED_LEFT = ['辰', '卯', '寅'];
const FIXED_RIGHT = ['申', '酉', '戌'];
const FIXED_BOTTOM = ['丑', '子', '亥'];

// 月将十二神名
const YUE_JIANG_NAMES: Record<string, string> = {
  '亥': '登明', '戌': '河魁', '酉': '从魁', '申': '传送',
  '未': '小吉', '午': '胜光', '巳': '太乙', '辰': '天罡',
  '卯': '太冲', '寅': '功曹', '丑': '大吉', '子': '神后',
};

// 外围标注字号（与宫格内部一致）
const annoFontSize = '22px';

/** 顶部/底部标注：月将(红) + 隐干(黑) + 建星(蓝)，横排一行 */
function ZhiLabel({ zhi, jianChu, yinGan }: { zhi: string; jianChu: string; yinGan?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      style={{ fontSize: annoFontSize, fontFamily: 'var(--font-family-kai)', lineHeight: 1.4 }}
    >
      <span style={{ color: '#C23B22', fontWeight: 500 }}>{zhi}</span>
      {yinGan && <span style={{ color: '#333', fontWeight: 500 }}>{yinGan}</span>}
      <span style={{ color: '#1565C0', fontWeight: 500 }}>{jianChu}</span>
    </div>
  );
}

/** 侧边注解：月将(红) + 隐干(黑) + 建星(蓝)，竖排 */
function SideAnnotation({ zhi, jianChu, yinGan, align }: {
  zhi: string;
  jianChu: string;
  yinGan: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`flex flex-col ${align === 'left' ? 'items-end' : 'items-start'} justify-center`}
      style={{ fontSize: annoFontSize, fontFamily: 'var(--font-family-kai)', lineHeight: 1.5 }}
    >
      <span style={{ color: '#C23B22', fontWeight: 500 }}>{zhi}</span>
      <span style={{ color: '#333', fontWeight: 500 }}>{yinGan}</span>
      <span style={{ color: '#1565C0', fontWeight: 500 }}>{jianChu}</span>
    </div>
  );
}

// ==================== 主组件 ====================

interface YinpanPaipanBoardProps {
  data: PaipanData;
  schoolName: string;
}

export default function YinpanPaipanBoard({ data, schoolName }: YinpanPaipanBoardProps) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const jc = data.jianChuMap || {};
  const palaceGrid = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  // 从 yinZhiRing 动态计算外圈四边地支
  const ring = data.yinZhiRing || ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];
  const topZhi = [ring[0], ring[1], ring[2]];
  const rightZhi = [ring[3], ring[4], ring[5]];
  const bottomZhi = [ring[8], ring[7], ring[6]];
  const leftZhi = [ring[11], ring[10], ring[9]];

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="card-chinese p-4 space-y-4">
        {/* 四柱 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: '年柱', gz: data.ganZhi.year },
            { label: '月柱', gz: data.ganZhi.month },
            { label: '日柱', gz: data.ganZhi.day },
            { label: '时柱', gz: data.ganZhi.time },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '16px', color: 'var(--color-ink-light)', fontFamily: 'var(--font-family-kai)' }}>{item.label}</div>
              <div className="ganzhi-char mt-1" style={{ fontSize: '32px', fontWeight: 600 }}>{item.gz}</div>
            </div>
          ))}
        </div>

        {/* 排盘信息 3列 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <InfoTag label="公元" value={`${data.year}年${data.month}月${data.day}日${data.hour}时${pad(data.minute)}分`} />
          <InfoTag label="农历" value={data.lunarDesc} />
          <InfoTag label="遁局" value={`${data.dunType}${data.juNumber}局`} highlight />
          <InfoTag label="值符" value={data.zhiFuStar} />
          <InfoTag label="值使" value={data.zhiShiGate} />
          <InfoTag label="旬首" value={`${data.xunShou}${data.xunShouYin}`} />
          <InfoTag label="空亡" value={`${data.voidPair[0]}${data.voidPair[1]}`} />
          <InfoTag label="马星" value={data.horsePalace > 0 ? `${data.horsePalace}宫` : '无'} />
          {data.yueJiang && (
            <InfoTag label="月将" value={`${data.yueJiang}（${YUE_JIANG_NAMES[data.yueJiang] || ''}）`} />
          )}
        </div>
      </div>

      {/* 九宫格 + 外围注解 */}
      <div className="card-chinese p-3 md:p-4">
        {/* 图例 */}
        <div className="flex items-center justify-center gap-4 mb-3" style={{ fontSize: '13px' }}>
          <span className="flex items-center gap-1">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C23B22' }} />
            <span style={{ color: '#666' }}>月将</span>
          </span>
          <span className="flex items-center gap-1">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#333' }} />
            <span style={{ color: '#666' }}>隐干</span>
          </span>
          <span className="flex items-center gap-1">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1565C0' }} />
            <span style={{ color: '#666' }}>建星</span>
          </span>
        </div>

        {/* 布局：上标注 → 左标注+九宫格+右标注 → 下标注 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(70px, 100px) 1fr minmax(70px, 100px)',
            gap: '4px',
            alignItems: 'stretch',
          }}
        >
          {/* ===== Row 0: 顶部月将+隐干+建星 ===== */}
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {topZhi.map((z, i) => (
              <ZhiLabel
                key={`top-${i}`}
                zhi={z}
                jianChu={jc[FIXED_TOP[i]] || ''}
                yinGan={i === 1 ? (data.yinGanMap?.[9] || '') : undefined}
              />
            ))}
          </div>
          <div />

          {/* ===== Row 1: 左标注 + 九宫格(封闭边框) + 右标注 ===== */}
          {/* 左侧三行标注 */}
          <div className="flex flex-col justify-around">
            {[0, 1, 2].map(rowIdx => (
              <SideAnnotation
                key={`left-${rowIdx}`}
                zhi={leftZhi[rowIdx]}
                jianChu={jc[FIXED_LEFT[rowIdx]] || ''}
                yinGan={data.yinGanMap?.[LEFT_PALACES[rowIdx]] || ''}
                align="left"
              />
            ))}
          </div>

          {/* 九宫格：封闭边框 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              border: '2px solid var(--color-border-warm)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {palaceGrid.flat().map((p, idx) => {
              const col = idx % 3;
              const row = Math.floor(idx / 3);
              const borderRight = col < 2 ? '1px solid var(--color-border-warm)' : 'none';
              const borderBottom = row < 2 ? '1px solid var(--color-border-warm)' : 'none';

              return (
                <div key={`cell-${p}`} style={{ borderRight, borderBottom }}>
                  <PaipanPalaceCell
                    palace={data.palaces[p]}
                    palaceId={p}
                    isVoid={data.voidPalaces.includes(p)}
                    isHorse={data.horsePalace === p}
                  />
                </div>
              );
            })}
          </div>

          {/* 右侧三行标注 */}
          <div className="flex flex-col justify-around">
            {[0, 1, 2].map(rowIdx => (
              <SideAnnotation
                key={`right-${rowIdx}`}
                zhi={rightZhi[rowIdx]}
                jianChu={jc[FIXED_RIGHT[rowIdx]] || ''}
                yinGan={data.yinGanMap?.[RIGHT_PALACES[rowIdx]] || ''}
                align="right"
              />
            ))}
          </div>

          {/* ===== Row 2: 底部月将+隐干+建星 ===== */}
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {bottomZhi.map((z, i) => (
              <ZhiLabel
                key={`bot-${i}`}
                zhi={z}
                jianChu={jc[FIXED_BOTTOM[i]] || ''}
                yinGan={i === 1 ? (data.yinGanMap?.[1] || '') : undefined}
              />
            ))}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
