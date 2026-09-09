# 第二课接入交付（2026-09-09）

本版本包含此前未推送的第一课接入，以及本次第二课接入。

- 数据隐私与信息安全：六个文字课时 →《多停一秒》V2 六区探索与自测 → 模块完成。
- 劳动合规与职场行为：两个文字课时 →《多停一秒·尊重有界》V1 三段回应练习 → 模块完成。
- 第二课文字阶段占 50%，三段完成依次达到 67%、83%、100%。只有认可回应并确认保存后计入，旧测验成绩保留为历史，不虚构微课分数。
- 课程目录、文字底部入口、旧测验链接和续学跳转统一适配；原微课视觉动画保持不变。刷新恢复对话、选项及已完成场景，重温不撤销模块完成。
- 反腐败课程原测验保留。所有保存失败都有错误反馈，第二课读取失败保护原始记录不被空进度覆盖。

验证命令：

```sh
npm test
npm run build
QA_URL=http://127.0.0.1:4173/compliance-training-agent/ node scripts/qa-privacy-integration.mjs
QA_URL=http://127.0.0.1:4173/compliance-training-agent/ node scripts/qa-privacy-recovery.mjs
node scripts/qa-respect-integration.mjs
```

单元测试 37/37，生产构建通过，完整双尺寸学习流程及恢复回归通过，独立审查通过。脚本支持 QA_URL、PLAYWRIGHT_MODULE、CHROME_PATH 环境变量，未增加生产运行依赖。

发布目标为现有 origin/main 及 Pages 的 gh-pages 分支，不强推、不重写旧提交历史。交付后的远端提交和实际 Pages 构建状态以任务最终回复为准。学习记录仍只保存在当前浏览器，清除站点数据会清除进度。
