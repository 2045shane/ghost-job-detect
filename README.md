# 假职位 / Ghost job 检测
Chrome MV3 MVP：只读 LinkedIn 职位详情及 Indeed 可见 DOM，中文启发式评分，每个本地自然日免费分析 3 次。点击浮动面板「分析」才计次；支持离线 license 解锁。

## 使用 / Load
1. 打开 `chrome://extensions`，开启「开发者模式」。
2. 点击「加载已解压的扩展程序」，选择本目录 `/workspace/ghost-job-detect`。
3. 打开 `https://www.linkedin.com/jobs/` 的职位详情，或 `https://*.indeed.com/`；等待详情加载，在浮动面板点击「分析」。安装前已打开的标签页需刷新。
4. 点击插件图标查看剩余次数，打开设置保存或清除 license。

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this folder. Open a supported job detail page and click the floating panel's Analyze button. Popup shows usage; Options manages the offline license.

## 测试与本地 license / Test & local license
无需安装依赖，推荐 Node.js 22+（使用内置 Web Crypto）：
```sh
npm test
node scripts/gen-license.mjs
```
把脚本输出完整复制到设置页并保存。格式 `GJD1.<SHA-256 checksum>`；公开固定 payload 的离线校验，沿用模板的本地校验思路，不是防伪授权或付费安全边界，无 API key、无服务端、无支付 SDK。Local checksum only; anyone with source can generate a key.

超限提示：今日 3 次免费分析已用完。有问题请联系我：小红书私信「珊哥爱读书」。可在设置页输入 license 解锁。

分数不是虚假职位结论；重新发布、申请多或缺薪资都可能合理。只分析已加载内容，不自动滚动、不访问接口，不读取 cookie 或登录 token。Indeed 为 TODO 占位提取器。月份按 30 天、年按 365 天估算；未识别时间显示未知。图标复制自只读参考模板。实现与测试地图见 [docs/FEATURE_MAP.md](docs/FEATURE_MAP.md)。
