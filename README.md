# kirkyang · Kirk 个人网站

- 上线：2026-08-09（纸感初版）；2026-09-16 整站替换为「白色现代风」新站，初版作废（Kirk 拍板："老版不要了"）
- 线上：https://yhd475084203-oss.github.io/kirkyang/ ；公开仓 `yhd475084203-oss/kirkyang`，Pages 跟 main 根目录，**push 即发布**
- 本地预览：launch.json 配置 `kirkyang-site`，端口 **4173**（verify.mjs 固定用这个端口）
- 唯一工作目录：本目录。旧目录 `20_AI/22_应用开发/kirk-personal-site/` 已迁出，不要在那里继续改

## 红线（改版不许删）

- **边界声明**：只代表个人、无机构关联、不出现具体项目 / 客户 / 数据。初版在 about.html，新站在首页「此刻与会客室」段末尾，由 `tools/build.mjs` 生成
- **身份**：署名 Kirk Yang / kirkyang，半笔名，不挂中文实名
- ~~与公众号「万古鸿鼎」站内不互挂，要打通先问本人~~ ← **2026-09-16 Kirk 拍板打通，此条作废**：两篇文章正文保留「鸿鼎」署名（`pages/reading.html`、`pages/ai-documents.html`，共 4 处）
- 已被 2026-09-16 替换推翻的旧条款：「纸感 + 宋体 + 朱砂印『不器』；沿用现有 HTML/CSS，别引入构建工具」

## 怎么改

内容与媒体唯一配置：`content/site.json`；结构生成器：`tools/build.mjs`；样式 `styles.css`；交互 `script.js`。

`index.html`、`pages/`、`downloads/` 是生成结果，**不逐页手改**。改完重新生成：

```bash
node tools/build.mjs && node tools/verify.mjs
```

只用 Node 自带模块，无需安装依赖。样式和脚本地址自动带内容版本标记；`index.html` 本身没有版本标记，本地预览看不到改动时强制刷新或加 `?nocache=` 参数。

图片替换：图片放 `assets/`（建议英文名），改 `content/site.json` 的 `portrait.src`、`heroBackground`、`projects[].asset`、`travels[].asset`、`travels[].photos`，再跑生成器。JPG / PNG 不套 SVG 占位的灰度滤镜。

## 当前状态 · 2026-09-16

- 内容：2 篇归档全文（135 段）、3 个项目说明页、3 个方法页 + 3 份可下载清单、3 个旅行框架页，共 11 个内页
- **待补**：肖像与 6 张项目 / 旅行配图仍是 SVG 占位（首屏印着"替换为 Kirk 肖像"）；旅行游记只有提纲；Email 未公开；域名未绑
- 验收：12 页全 200、无远程脚本、无本机路径泄漏、控制台零报错、375px 无横向溢出
- `screenshots/` 是本地验收记录，已 gitignore，不随公开站发布

证据：`00_收件箱/09_对话存档/Claude/Claude Code/20260809/20260809_1229_我需要搭建一个自己的网站吗_需要付出.md`
替换前基线：`_archive/20260916_2208_kirkyang线上老版_替换前基线.zip`、`_archive/20260916_2208_个人网站_迁库前基线.zip`
