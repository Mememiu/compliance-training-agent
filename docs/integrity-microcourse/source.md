# 第三课来源与接入边界

接入日期：2026-09-09。

## 已审阅终版

- 用户已完成、原样保留的单文件预览：`public/microcourses/integrity-preview/index.html`。
- SHA-256：`b9da38167a9e5b3ad1a5e746428ad4e5a2023968de86e315b2fe59cbd028157e`。
- 原课程数据、引擎与模板：`src/data/integrity-stories.mjs`、`src/integrity/course.js`、`src/integrity/course.html`，均未由本接入适配器修改。
- 正式嵌入版：`public/microcourses/integrity/index.html`；从已校验终版生成，不从可变化的源文件重新构建。
- 可复现命令：`node scripts/import-integrity-microcourse.mjs`。输入散列变化或替换锚点不唯一时终止，要求重新审阅。

## 唯一修改范围

保留原数据、插画、内嵌资源、CSS、人物点击行为、对话顺序、四项记录核对、选择反馈、复盘和场景动画。只加入外部 `bridge.js`，替换本地存储接口，在原“完成本段”动作加入保存成功门槛，将独立预览结束语改为准确的培训室同步说明。没有修改法律或企业制度内容；原教学与核验提示保留。

## 记录与完成契约

- 三段按顺序为 `fees`、`conflict`、`gifts`；每段 `direct`、`support` 是可接受回应，`dismiss` 不可通过。
- 听完全部对话、核对四项记录、作出可接受回应、进入复盘并点击原“完成本段”，且本地存储写入成功，才能获得该段完成记录。仅进入可接受反馈或复盘都不完成。
- 独立存储键：`training-room-integrity-game-v1`。保留完整 `progress`、`index`、`summary`、`acceptedResponses`，继续原版续学确认界面。原预览键 `duoting-integrity-v1-progress` 不读写、不清除。
- 重新练习保留已赚得回应，与当前练习选择分离。发布快照只取成功保存的数据，不能取尚未保存的运行时状态。
- 存储读取失败或内容损坏时保留原记录，初次渲染不会覆盖；提示刷新重试或明确确认“重新开始”。写入错误可以直接重试。重置经原确认框后一次性写入空记录，失败不清除旧记录或当前完成界面；培训室层已获得的模块完成状态不因重练撤销。
- 协议频道：`training-room/integrity-v1`。子页面发送 `ready`；父页面发送带本次 iframe token 的 `init`；子页面发送 `{type:'state',token,snapshot:{completedStories,acceptedResponses}}` 或 `{type:'error',token,message}`。检查精确父窗口、同源和非空 token；重复 init 可重发已持久化状态，供宿主保存失败后同步。
- 当前浏览器本地学习状态，不是服务器或跨设备认证，亦不构成防篡改考核成绩。

## 适配器验证

先添加 6 项测试并观察缺失正式文件的 RED，再实现适配器，补充重置和伪造运行时回归测试。`npx tsx --test tests/integrity-bridge.test.ts` 覆盖真实引擎的顺序完成门槛、错误回应、续学和已核对记录、重练、存储读写失败、确认重置、消息来源、重复同步以及 SHA/CSS/数据/动画保真。宿主及浏览器全链路验收另记于主任务报告。
