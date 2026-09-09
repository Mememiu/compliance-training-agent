# 实施计划

1. 用单元测试定义 `src/utils/privacyProgress.ts` 的阅读确认、微课校验、进度计算及旧记录迁移。新完成条件只适用于数据隐私课程；保留旧成绩为历史信息。
2. 在 `src/hooks/useTraining.ts` 加入显式文字完成与微课完成接口；普通 updateProgress 和旧 submitQuiz 不能产生微课完成状态。
3. 复用终版 HTML 到 `public/microcourses/privacy/`，以独立 bridge 捕获探索及自测状态，不改源项目素材和动画；建立可复现导入脚本和来源记录。通过固定 origin、iframe source、会话 token 的消息传递同步状态。
4. 改 `LessonView.tsx`、`CourseDetailPage.tsx` 和 `App.tsx`，添加独立 `PrivacyMicrocourse.tsx` 页面。未读完不能进入微课；旧测验链接重定向到微课；错误时停留并允许重试，不伪报保存成功。
5. 单元测试、桥接测试、TypeScript/生产构建；本地浏览器端到端覆盖文字—微课—完成、错误答案、中断续学、重置、错误消息、旧链接、其他课程、桌面和手机。
6. 独立代码审查，解决阻塞问题，保留本地改动并报告；本轮不推送、不部署。

实现由主任务负责课程状态和界面，独立子任务负责只读素材导入和 bridge（Superpowers 要求的任务拆分）；边界协议先约定再并行。
