# 实施计划

1. 先在 tests/integrity-progress.test.ts 与 tests/course-microcourses.test.ts 添加失败用例：文字顺序、三情境快照、旧成绩、跨课程隔离。
2. 在 src/types.ts 添加 integrity_learning；src/utils/integrityProgress.ts 实现独立纯状态转换；src/utils/courseMicrocourses.ts 注册课程；src/hooks/useTraining.ts 加载时迁移。执行测试与构建。
3. 由独立适配任务在 tests/integrity-bridge.test.ts 先验证持久化与协议，再新增 scripts/import-integrity-microcourse.mjs 和 public/microcourses/integrity/。固定原终版哈希，记录 source.md。
4. 在 scripts/qa-integrity-integration.mjs 实现真实浏览器全流程与恢复测试；更新已过时的反腐败旧测验回归断言。运行此前两课 QA。
5. 独立规格与质量审查，修复阻断项，记录 review.md 和 final_report.md。
6. 检查仅纳入本次第三课源文件与集成文件；提交推送 main，生成产物更新 gh-pages；验证 Pages 构建及线上资源哈希。

用户已要求沿用第一、第二课逻辑并直接推送，因此不新增设计确认关卡。保留原课设计，无视觉重建。
