# 实施交付（2026-09-08）

已实现已确认路径：六个文字课时 → 《多停一秒》V2 → 六区隐患探索和自测 → 本模块完成。原十题数据保留，不再作为本课程必修环节；另两门课继续原测验。

## 改动

- 版本化阅读／微课状态，文本阶段占 50%，每区自测计入余下进度；只有六区全部通过为 100%。历史成绩保存在 `privacy_learning.legacy`，不伪造微课分数。
- 课程目录展示两阶段、解锁条件与续学入口；文字页底部显式确认，直达后续课时会回到首个未读课时。
- 独立 iframe 页面承载终版，保留原素材和动画；六区自测单独持久化，已排查但未答自测可回到原自测弹窗。
- 按 origin／iframe source／channel／nonce／已知区域和隐患校验消息；保存失败可见并可重试。
- 原微课导出只读；来源 SHA 与可复现导入脚本见 `source.md`。

## 验证命令

```sh
npm test
npm run build
node scripts/qa-privacy-integration.mjs
node scripts/qa-privacy-recovery.mjs
```

浏览器脚本需要 Playwright 和 Chrome；支持 `PLAYWRIGHT_MODULE`、`CHROME_PATH`、`QA_URL` 环境变量。默认为本机已有测试依赖，未增加生产依赖。生产静态预览也按 GitHub Pages 相同的 `/compliance-training-agent/` 子路径复验。

结果：21/21 单元测试通过；TypeScript 与 Vite 生产构建通过；开发环境与生产静态预览的 1440／390 双尺寸完整六区通关通过；生产静态预览的六组恢复与其他课程回归检查通过。浏览器完整通关过程中未捕获页面脚本异常，两个尺寸均无横向溢出。

截图存放于 `/tmp/training-room-privacy-qa/` 和 `/tmp/training-room-privacy-production-qa/`，不纳入发布文件。

## 交付状态

保留在当前工作区，未提交、未推送、未部署。需要用户新指令后再更新 GitHub 和线上站点。

2026-09-09 更新：用户要求第二课按相同逻辑接入并推送，本次将两课接入一并发布；劳动合规课程改为第二课互动流程，反腐败保留原测验。最新整体验证与交付见 `../respect-microcourse/final_report.md`。
