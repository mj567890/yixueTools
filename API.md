# 嘉嘉易学工具箱 API v1 手册

## 概述

- 基础路径：`/api/v1/`
- 计算端点均为 **POST**，请求体为 JSON
- Content-Type：`application/json`
- 支持 **CORS 跨域调用**
- 统一响应格式：

```json
// 成功
{ "ok": true, "data": { ... } }

// 失败
{ "ok": false, "error": "错误描述" }
```

---

## 1. 玉匣通书 — 公农历查询

**`POST /api/v1/calendar`**

查询指定日期的公农历信息、四柱干支、纳音五行、节气，以及可选的称骨论命。

### 请求参数

| 参数   | 类型   | 必填 | 说明                  |
|--------|--------|------|-----------------------|
| year   | number | 是   | 公历年份              |
| month  | number | 是   | 公历月份 (1-12)       |
| day    | number | 是   | 公历日 (1-31)         |
| hour   | number | 否   | 小时 (0-23)，提供后可计算称骨 |

### 示例

```bash
curl -X POST http://localhost:3000/api/v1/calendar \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 6, "day": 15, "hour": 8}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "yearGanZhi": "甲辰",
    "lunarMonth": "五月",
    "lunarDay": "初十",
    "jieQi": "...",
    "naYin": "...",
    "chengGu": { "totalWeight": "...", "poem": "..." }
  }
}
```

---

## 2. 八字排盘

**`POST /api/v1/bazi`**

四柱八字排盘，返回八字、大运、十维度分析、综合解读。

### 请求参数

| 参数   | 类型   | 必填 | 说明                      |
|--------|--------|------|---------------------------|
| year   | number | 是   | 公历年份                  |
| month  | number | 是   | 公历月份 (1-12)           |
| day    | number | 是   | 公历日 (1-31)             |
| hour   | number | 是   | 小时 (0-23)               |
| gender | number | 否   | 性别：1=男，0=女（默认 1）|

### 示例

```bash
curl -X POST http://localhost:3000/api/v1/bazi \
  -H "Content-Type: application/json" \
  -d '{"year": 1990, "month": 3, "day": 15, "hour": 10, "gender": 1}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "bazi": { "四柱信息、十神、五行统计等" },
    "daYun": { "大运列表、起运年龄等" },
    "fourDimensions": { "十维度分析结果" },
    "interpretation": { "综合解读文本" }
  }
}
```

---

## 3. 梅花易数

**`POST /api/v1/meihua`**

梅花易数起卦，支持时间、数字、文字三种起卦方式，返回卦象与体用分析。

### 请求参数

#### 方式一：时间起卦

| 参数     | 类型   | 必填 | 说明            |
|----------|--------|------|-----------------|
| method   | string | 是   | 固定值 `"time"` |
| year     | number | 是   | 公历年份        |
| month    | number | 是   | 公历月份        |
| day      | number | 是   | 公历日          |
| hour     | number | 是   | 小时 (0-23)     |
| question | string | 否   | 所测之事        |

#### 方式二：数字起卦

| 参数     | 类型   | 必填 | 说明              |
|----------|--------|------|-------------------|
| method   | string | 是   | 固定值 `"number"` |
| upper    | number | 是   | 上卦数            |
| lower    | number | 是   | 下卦数            |
| moving   | number | 是   | 动爻数            |
| question | string | 否   | 所测之事          |

#### 方式三：文字起卦

| 参数     | 类型   | 必填 | 说明            |
|----------|--------|------|-----------------|
| method   | string | 是   | 固定值 `"text"` |
| text     | string | 是   | 输入的文字      |
| question | string | 否   | 所测之事        |

### 示例

```bash
# 时间起卦
curl -X POST http://localhost:3000/api/v1/meihua \
  -H "Content-Type: application/json" \
  -d '{"method": "time", "year": 2024, "month": 6, "day": 15, "hour": 10, "question": "今日运势"}'

# 数字起卦
curl -X POST http://localhost:3000/api/v1/meihua \
  -H "Content-Type: application/json" \
  -d '{"method": "number", "upper": 3, "lower": 5, "moving": 2, "question": "求财"}'

# 文字起卦
curl -X POST http://localhost:3000/api/v1/meihua \
  -H "Content-Type: application/json" \
  -d '{"method": "text", "text": "天地人", "question": "前程"}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "result": { "本卦、互卦、变卦、体用等" },
    "analysis": { "体用分析、五行生克等" }
  }
}
```

---

## 4. 六爻纳甲

**`POST /api/v1/liuyao`**

六爻纳甲排盘，支持四种起卦方式和十大场景分析。

### 请求参数

| 参数        | 类型     | 必填 | 说明                                               |
|-------------|----------|------|----------------------------------------------------|
| method      | string   | 是   | 起卦方式：`"time"` / `"coin"` / `"number"` / `"manual"` |
| year        | number   | 是   | 公历年份                                           |
| month       | number   | 是   | 公历月份                                           |
| day         | number   | 是   | 公历日                                             |
| hour        | number   | 是   | 小时 (0-23)                                        |
| school      | string   | 否   | 流派：`"jingfang"`（京房，默认）/ `"cangshanbu"`（藏山卜）|
| question    | string   | 否   | 所测之事                                           |
| scenario    | string   | 否   | 场景（见下表）                                     |
| coinResults | array    | 条件 | 摇币起卦时必填，6 个铜币结果                       |
| numberInput | number   | 条件 | 数字起卦时必填                                     |
| rawYaoTypes | string[] | 条件 | 手动起卦时必填，6 个爻的类型                       |

#### scenario 可选值

| 值         | 含义 |
|------------|------|
| `qiucai`   | 求财 |
| `wenbing`  | 问病 |
| `kaoshi`   | 考试 |
| `hunlian`  | 婚恋 |
| `shiye`    | 事业 |
| `shiwu`    | 失物 |
| `guansi`   | 官司 |
| `chuxing`  | 出行 |
| `zhaizang` | 宅葬 |
| `qiuqian`  | 求签/杂占 |

#### rawYaoTypes 爻类型值

| 值         | 含义   |
|------------|--------|
| `laoYang`  | 老阳（动） |
| `shaoYang` | 少阳（静） |
| `shaoYin`  | 少阴（静） |
| `laoYin`   | 老阴（动） |

### 示例

```bash
# 时间自动起卦
curl -X POST http://localhost:3000/api/v1/liuyao \
  -H "Content-Type: application/json" \
  -d '{"method": "time", "year": 2024, "month": 6, "day": 15, "hour": 10, "question": "求财", "scenario": "qiucai"}'

# 手动指定六爻
curl -X POST http://localhost:3000/api/v1/liuyao \
  -H "Content-Type: application/json" \
  -d '{"method": "manual", "year": 2024, "month": 6, "day": 15, "hour": 10, "rawYaoTypes": ["shaoYang", "shaoYin", "laoYang", "shaoYin", "shaoYang", "shaoYin"]}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "result": { "卦名、六爻纳甲、世应、六亲、六神等" },
    "analysis": { "场景化分析结果（如有）" }
  }
}
```

---

## 5. 奇门遁甲

**`POST /api/v1/qimen`**

奇门遁甲排盘，支持阴盘（王凤麟派）和阳盘（传统三种定局法）。

### 请求参数

| 参数     | 类型   | 必填 | 说明                                              |
|----------|--------|------|---------------------------------------------------|
| pan      | string | 否   | `"yin"`（阴盘，默认）/ `"yang"`（阳盘）           |
| year     | number | 是   | 公历年份                                          |
| month    | number | 是   | 公历月份                                          |
| day      | number | 是   | 公历日                                            |
| hour     | number | 是   | 小时 (0-23)                                       |
| minute   | number | 否   | 分钟 (0-59)，默认 0                               |
| method   | string | 否   | 阳盘定局法：`"chaiBu"`（拆补，默认）/ `"zhiRun"`（置闰）/ `"maoShan"`（茅山）|
| jiGong   | number | 否   | 阳盘寄宫：`2`（寄坤二宫，默认）/ `8`（寄艮八宫） |
| scenario | string | 否   | 阳盘问事场景（见下表）                            |

#### scenario 可选值（阳盘）

| 值         | 含义 |
|------------|------|
| `career`   | 事业 |
| `wealth`   | 财运 |
| `love`     | 感情 |
| `health`   | 健康 |
| `lawsuit`  | 官讼 |
| `travel`   | 出行 |

### 示例

```bash
# 阴盘排盘
curl -X POST http://localhost:3000/api/v1/qimen \
  -H "Content-Type: application/json" \
  -d '{"pan": "yin", "year": 2024, "month": 6, "day": 15, "hour": 10}'

# 阳盘排盘（茅山定局法）
curl -X POST http://localhost:3000/api/v1/qimen \
  -H "Content-Type: application/json" \
  -d '{"pan": "yang", "year": 2024, "month": 6, "day": 15, "hour": 10, "method": "maoShan", "scenario": "career"}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "pan": "yin",
    "result": { "九宫盘面、天盘、地盘、九星、八门、八神等" },
    "analysis": { "格局分析（如有）" }
  }
}
```

---

## 6. 太乙神数

**`POST /api/v1/taiyi`**

太乙神数排盘，支持统宗宝鉴/金镜式经两个流派，年/月/日/时四种计算类型。

### 请求参数

| 参数     | 类型   | 必填 | 说明                                            |
|----------|--------|------|-------------------------------------------------|
| year     | number | 是   | 公历年份                                        |
| month    | number | 是   | 公历月份                                        |
| day      | number | 是   | 公历日                                          |
| hour     | number | 是   | 小时 (0-23)                                     |
| minute   | number | 否   | 分钟 (0-59)，默认 0                             |
| school   | string | 否   | 流派：`"tongzong"`（统宗宝鉴，默认）/ `"jinjing"`（金镜式经）|
| calcType | string | 否   | 四计类型：`"year"` / `"month"` / `"day"` / `"hour"`，默认 `"year"` |
| scenario | string | 否   | 问事场景（见下表）                              |

#### scenario 可选值

| 值           | 含义 |
|--------------|------|
| `guoyun`     | 国运 |
| `zhanzheng`  | 战争 |
| `tianshi`    | 天时 |
| `renshi`     | 人事 |
| `jibing`     | 疾病 |
| `zayi`       | 灾异 |

### 示例

```bash
curl -X POST http://localhost:3000/api/v1/taiyi \
  -H "Content-Type: application/json" \
  -d '{"year": 2024, "month": 6, "day": 15, "hour": 10, "school": "tongzong", "calcType": "year", "scenario": "guoyun"}'
```

### 响应

```json
{
  "ok": true,
  "data": {
    "result": { "太乙数、计神、文昌、始击、客主等盘面信息" },
    "analysis": { "场景化分析结果" }
  }
}
```

---

## 7. 起名测名

**`POST /api/v1/naming`**

姓名学系统，支持姓名分析和智能起名两种操作。

### 操作一：测名分析

| 参数       | 类型   | 必填 | 说明                  |
|------------|--------|------|-----------------------|
| action     | string | 是   | 固定值 `"analyze"`    |
| name       | string | 是   | 待分析的姓名          |
| birthYear  | number | 否   | 出生年（可提升八字匹配）|
| birthMonth | number | 否   | 出生月                |
| birthDay   | number | 否   | 出生日                |
| birthHour  | number | 否   | 出生时 (0-23)         |

#### 示例

```bash
curl -X POST http://localhost:3000/api/v1/naming \
  -H "Content-Type: application/json" \
  -d '{"action": "analyze", "name": "张三丰", "birthYear": 1990, "birthMonth": 3, "birthDay": 15, "birthHour": 10}'
```

#### 响应

```json
{
  "ok": true,
  "data": {
    "五格数理评分、三才配置、笔画拆解、吉凶判定等"
  }
}
```

### 操作二：智能起名

| 参数           | 类型     | 必填 | 说明                       |
|----------------|----------|------|----------------------------|
| action         | string   | 是   | 固定值 `"generate"`        |
| surname        | string   | 是   | 姓氏                       |
| gender         | string   | 否   | `"male"`（默认）/ `"female"` |
| birthYear      | number   | 否   | 出生年                     |
| birthMonth     | number   | 否   | 出生月                     |
| birthDay       | number   | 否   | 出生日                     |
| birthHour      | number   | 否   | 出生时 (0-23)              |
| nameLength     | number   | 否   | 名字字数：`1` 或 `2`（默认 2）|
| fixedFirstChar | string   | 否   | 指定名字第一个字           |
| fixedSecondChar| string   | 否   | 指定名字第二个字           |
| avoidChars     | string[] | 否   | 需要避开的字               |
| limit          | number   | 否   | 返回候选数量（默认 20，上限 50）|

#### 示例

```bash
curl -X POST http://localhost:3000/api/v1/naming \
  -H "Content-Type: application/json" \
  -d '{"action": "generate", "surname": "张", "gender": "male", "birthYear": 2024, "birthMonth": 6, "birthDay": 15, "nameLength": 2, "limit": 10}'
```

#### 响应

```json
{
  "ok": true,
  "data": [
    { "name": "张...", "score": 95, "wuGe": { ... }, "sanCai": { ... } },
    ...
  ]
}
```

---

## 错误处理

所有接口在出错时返回统一格式：

```json
{
  "ok": false,
  "error": "缺少必填参数: year"
}
```

常见 HTTP 状态码：

| 状态码 | 含义             |
|--------|------------------|
| 200    | 成功             |
| 400    | 参数错误         |
| 500    | 服务端计算异常   |

---

## 注意事项

1. 所有时间参数均基于**公历**
2. `hour` 为 24 小时制 (0-23)，系统内部自动转换为十二时辰
3. 分析类字段（`analysis`、`interpretation`）采用宽容策略：计算失败时返回 `null`，不影响主结果
4. 返回数据结构与前端页面共用同一套计算引擎，结果完全一致

---

## AI 平台接入

本 API 提供标准的 AI 平台发现协议，支持 OpenClaw / Coze / Dify / ChatGPT Plugins 等平台一键接入。

### 自动发现

| 端点 | 用途 |
|------|------|
| `GET /.well-known/ai-plugin.json` | AI 插件清单（平台自动扫描此路径） |
| `GET /api/v1/openapi.json` | OpenAPI 3.1 完整规范 |
| `GET /api/v1/health` | 健康检查（平台探活） |

### 接入步骤

1. 将本服务部署到公网可访问的域名（如 `https://yixue.example.com`）
2. 在 AI 平台中填入域名，平台会自动拉取 `/.well-known/ai-plugin.json`
3. 平台读取 `openapi.json` 后，自动注册所有 7 个计算技能
4. 完成 — AI 助手即可调用全部易学计算能力
