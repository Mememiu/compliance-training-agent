# 实施计划

1. `tests/respect-progress.test.ts` 先定义前置阅读、三段认可回应、旧成绩、持久完成及隔离回归；实现 `src/utils/respectProgress.ts` 和类型。
2. `src/utils/courseMicrocourses.ts` 提供两门微课的配置、状态分发、续学路径与消息校验，保留第一课原数据及算法。
3. `useTraining.ts` 分发两门微课专用保存，阻止通用更新与旧测验绕过；LessonView/CourseDetailPage/App/微课承载页复用入口和文案配置。
4. 按 Superpowers 分工，独立子任务完成 respect 静态导入、桥接、原微课保存恢复和测试。只改宿主仓库。
5. 桌面/手机真实完成两文字课与三情境；错误回应、刷新、重播、非法消息、保存失败；第一课完整流程和反腐败考核回归。生产构建与独立规格/代码审查。
6. 检查源文件无变动及提交范围；提交推送 main，按既有方式更新 gh-pages；核对远端 SHA 和发布资源并报告。
