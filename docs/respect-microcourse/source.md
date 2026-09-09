# 《多停一秒 · 尊重有界》来源与接入协议

- 导入日期：2026-09-09。
- 用户已有终版：`/Users/skyris/Documents/培训/recruiting-dashboard/exports/多停一秒_尊重有界_V1.html`。
- 原始 SHA-256：`3bde6eef970e1c91cc253b18fa5aed76062e3f84e3465b2232f3dddb42369f74`。
- 复现命令：`node scripts/import-respect-microcourse.mjs`，可追加明确的原始 HTML 路径。
- 发布文件：`public/microcourses/respect/index.html` 与独立 `bridge.js`。
- 只读核对原工程的 `src/respect-course-engine.js`、`src/respect-stories.js`；原工程及导出文件不做修改。
- 保留原始插画、布局、对话、动画、锁定顺序和反馈。仅注入独立 bridge、恢复初始化、render 保存及原有反馈确认钩子。

## 固定场景与完成条件

| 场景 ID | 对话句数 | 可接受回应 ID | 完成操作 |
| --- | --- | --- | --- |
| `joke` | 6 | `direct`、`support` | 选择后点击原版“记住这次回应” |
| `opportunity` | 8 | `direct`、`support` | 同上，要求前一段完成 |
| `support` | 9 | `direct`、`support` | 同上，要求前两段完成 |

`dismiss` 不通过。显示接受反馈、翻完对话、回办公室或加载网页不算完成。

## iframe 消息

- channel：`training-room/respect-v1`。
- 子页初始化完成发 `{type:'ready', channel}`。
- 父页回 `{type:'init', channel, token}`，token 是本次挂载产生的非空字符串，最长 160。
- 子页回 `{type:'state', channel, token, snapshot:{completedStories:string[], acceptedResponses:Record<string,string>}}`。
- 保存失败回 `{type:'error', channel, token, message}`；init 之前出现的错误暂存，认证后发送。
- 双方校验同源与消息来源窗口；父页还须验证 token、已读文字课时、已知场景 ID、顺序及回应 ID。
- bridge 只上报已经成功写入 localStorage 的进度，失败的可变运行态不冒充已保存状态。

## 保存与重学

- 独立键 `training-room-respect-game-v1`，与第一课及原版页面隔离。
- 保存版本、当前场景、办公室/对话视图、每段 phase/line/choice/completed，以及已经完成的 acceptedResponses。
- 刷新恢复对话位置与反馈阶段。完成确认写入失败时留在反馈页，可重试，不解锁下一段。
- 读取异常、非法 JSON、不支持的版本或非法顶层记录结构会锁存恢复失败：阻止首次 render 保存、完成确认和 state 回传，保留原键值，认证后报告恢复错误；只有明确重新恢复成功或刷新成功才解除。正常写入失败仍支持原地重试。
- 重播保持已获完成记录和下一段解锁；重新作答不删除已经完成的成绩。
- 属于浏览器本地学习进度，不是服务器认证或防篡改考试凭证。

## 子任务验证

- TDD：先运行缺失 bridge/importer 的 8 项失败测试，再实现。复核追加 2 项恢复失败保护测试，先确认两项失败再修复；`npx tsx --test tests/respect-bridge.test.ts` 共 10 项全部通过。
- 原版导入页面在临时同源 HTTP 服务中运行真实 Chrome：对话中途刷新、完成后刷新、错误回应重选、保存被阻断时不完成且恢复后可重试、三段完整通过、重播保留完成记录，均通过。
- 1440×1000 桌面与 390×844 手机视口验证；手机无页面横向溢出，过程无 pageerror。
- iframe 宿主的文字门禁、token 接收校验和全站发布由主集成任务验证。
