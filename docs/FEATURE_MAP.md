# Agent 功能地图

| 入口 / 模块 | 职责 | 验证 |
| --- | --- | --- |
| manifest.json | MV3、storage/activeTab、两个站点范围、按序注入 classic scripts | tests/manifest.test.js |
| src/lib/date-parse.js | 相对日期、reposted、申请数；未知为 null | tests/logic.test.js 日期测试 |
| src/lib/heuristics.js | 中文 reasons、评分封顶 100；低 <30、中 30–59、高 ≥60 | 启发式测试 |
| src/lib/license.js | GJD1 + SHA-256 固定 payload 校验和 | license 测试 |
| src/lib/quota.js | 可注入 storage/时钟、当地日期、每日 3 次、队列串行 | 限额与解锁测试 |
| src/background/service-worker.js | 唯一计次写入方、消息来源检查、打开设置 | 手动集成验证 |
| src/content/extractors.js | 可见详情 DOM 读取；Indeed TODO 钩子 | 手动页面验证 |
| src/content/content.js | Shadow DOM 浮动面板、点击分析、SPA observer/URL 检查 | 手动 SPA 验证 |
| src/popup/ | 剩余次数、解锁状态、当前页支持、设置入口 | manifest 引用验证 |
| src/options/ | 保存前校验与清除 license | 手动设置验证 |
| src/ui/ | 模板配色、共享状态与 CTA | 手动 UI 验证 |
| scripts/gen-license.mjs | 本地生成测试 license | license 测试使用同一算法 |

数据流：manifest 依序加载 lib → extractors → content。各 lib 将函数合并到隔离世界 globalThis.GhostJob，并通过 CommonJS 导出供 node:test 使用，无构建步骤。点击分析 → 读取可见职位 → 有标题才请求后台 quota-consume → 后台重新校验 license、串行写次数 → 前台计算分数并渲染。popup/options 读取 quota-status；storage.onChanged 同步 UI。自动挂载、换页、读状态不计次。

存储 key：chrome.storage.local 的 gjdQuota = {date: 'YYYY-MM-DD', count: integer}，gjdLicense = trimmed token string。日期按本机时区计算；跨天逻辑重置，下一次计次落盘。解锁分析不增加免费计数，清除 license 后恢复当天已有免费用量。保存 license 不保存额外 unlocked 布尔值，每次从 key 验证。

评分权重：超过 30 天 +25；重新发布 +20；申请 ≥100 +15；缺薪资 +10；描述少于 200 字符 +10；人才储备/未来机会措辞 +20；缺公司 +10。信息不足也会加分，面板明确提醒不能据此断言假岗。

已知限制：DOM 选择器可能随 LinkedIn 改版失效；LinkedIn 仅在 /jobs/* 注入，先从站外路由进入需刷新。日期/申请数从详情容器可见文本匹配，可能混入其他职位；Indeed 提取器仅简单占位。未展开描述、未加载数据或隐藏薪资会影响评分；不读取结构化私有接口。相对时间只支持列举的中英文格式。公开校验和可自行生成、存储可改动；无服务端防篡改。无 DOM 测试依赖，真实浏览器集成未自动覆盖。

手动验收：加载扩展 → 打开职位 → 分析 3 次 → 第 4 次应显示 CTA；在另一个标签页检查共享限额；设置保存脚本生成的 key 后应不限次；清除后恢复当天限额；同页切换职位后旧结果应清除；检查 popup 支持状态与 Indeed TODO 提示。

下一步：基于真实页面样本完善详情选择器、薪资定位和 Indeed 多地区布局；增加浏览器集成测试，再评估更可靠的可解释信号。保持只读 DOM，无外部网络请求。
