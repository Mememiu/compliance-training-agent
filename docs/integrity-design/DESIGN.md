---
name: "第三课局部设计：多停一秒 · 廉洁有度"
description: "以完整现成 2.5D 插画配合业务讨论的独立互动微课；仅限 integrity surface。"
colors:
  ink: "#192c48"
  muted: "#52647b"
  primary: "#4f46e5"
  primary-dark: "#3931b8"
  line: "#dce3ee"
  paper: "#f5f7fc"
  surface: "#fff"
  green: "#14745d"
  warning: "#916000"
  teal: "#137696"
typography:
  headline:
    fontFamily: '"Songti SC","STSong","Noto Serif CJK SC",serif'
    fontSize: "clamp(26px,2.8vw,43px)"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-.025em"
  body:
    fontFamily: '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif'
    fontSize: "16px"
    lineHeight: 1.7
  dialogue:
    fontSize: "clamp(19px,1.65vw,24px)"
    fontWeight: 500
    lineHeight: 1.9
    letterSpacing: ".01em"
rounded:
  workbench: "14px"
  scene: "10px"
  action: "9px"
  person: "8px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.action}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "12px 22px"
---

# Design System: 第三课局部设计

## Overview

**Creative North Star: "完整业务场景旁的学习桌"**

本文件只记录 `src/integrity/` 与 `src/data/integrity-scenes.mjs` 实现的第三课独立预览，不是培训室的全局设计规范。冷白阅读底、墨蓝文字和靛蓝操作件让完整现成 2.5D 业务插画居于视觉中心；讨论、业务记录、决定和复盘放在图外。方向来自已批准的页面 contract；不复用第二课办公室、人物或三聊天布局。

视觉值的权威是 `src/integrity/course.css`；frontmatter 是当前源码的局部摘录，不另建全局 token 层。字体、材质与交互记录均只描述已实现内容。PRODUCT.md 提供员工学习、中文可读性和明确下一步的约束，不为本页提供企业品牌资产。

**Key Characteristics:**

- 完整插画与图外业务讨论并列，移动端上下堆叠。
- 三个情境顺序解锁，每段沿四个可见学习步骤推进。
- 靛蓝强调当前步骤与主要行动，状态同时使用文字和图标。

验收记录（2026-09-09）：已完成独立源码／原图复核；`tests/integrity-stories.test.ts` 的 13 项 jsdom／结构测试全部通过，覆盖分支、顺序门禁、回看、刷新重置和素材哈希。尚无实际页面桌面／手机截图；浏览器工具拒绝访问后未绕过限制。此记录不代表视觉发布已验收，也不代表完整可访问性认证。

## Colors

### Primary

靛蓝 `primary` 用于主要行动、当前步骤、选中人物与键盘焦点；`primary-dark` 用于主按钮悬停。

### Secondary

青蓝 `teal` 是与部分原图底色衔接的场景展示底，不用于重涂插画。CSS 最后的同名变量覆盖初始声明，frontmatter 记录最终生效值。

### Neutral

冷白 `paper` 承载页面，白色 `surface` 承载学习桌；墨蓝 `ink` 用于主文字，`muted` 用于说明，`line` 用于边界。绿色 `green` 表示核对／完成，褐金 `warning` 配合“再想一步”提示；状态不只靠颜色表达。

## Typography

正文采用系统中文无衬线候选栈，标题采用系统中文衬线候选栈，均无内嵌字库或 `@font-face`。字体是否存在取决于设备，不能把候选字体名称当作实际加载证明。

主标题与对话字号随视口变化；步骤／辅助信息较小，发言者姓名与逐句正文构成讨论面板的重点。二级标题桌面为 26px、移动为 24px；移动对话为 20px。数字进度使用等宽数字特性。

## Layout

主内容最大宽度为 1640px，常规水平内边距为 40px。顶部三段导航之后是情境标题，再进入左图右讨论的双栏学习桌；常规列定义为 `minmax(0,1.2fr) minmax(360px,.9fr)`。左图容器与热点共用原始宽高比平面，图片始终为 `width:100%; height:auto; object-fit:contain`，不裁人物、鞋子或桌椅。

1000px 以下缩减边距与栏宽；760px 以下改为上图下讨论、讨论面板分隔线移到顶部、主要行动铺满可用宽度。1600px 以上增加留白和展示区域。当前断点是实现事实，未经实际手机／桌面截图验证。

## Elevation & Depth

立体人物、家具、地面与投影来自原素材，不由 CSS 拼造。UI 只在学习桌使用一层柔和阴影；其准确值存于 sidecar。讨论区通过白底和细线分隔，不声称存在纸纹、玻璃或额外材质。

场景换图时执行一次 0.85s 的轻微上移淡入，不随每句对话重复。减少动态效果偏好关闭该动画与平滑滚动。

## Shapes

学习桌、场景底和操作件使用 frontmatter 所列圆角。人物热点是透明圆角按钮，仅悬停或聚焦时显示边界；最小命中区为 44px。普通行动按钮最小高度为 48px。段导航和记录列表以细线组织，不复制成三个聊天卡片。

## Components

- **场景与人物入口：** 三幅业务图分别服务可疑费用、利益冲突、礼品处置；图内透明热点与图外姓名按钮调用同一受保护操作。画外人物通过姓名按钮或“听下一句”继续，标签和对话不覆盖人物。
- **段导航与进度：** 当前段有靛蓝下划线与 `aria-current`；锁定、已完成和回看状态有文字／图标。进行中的段落不能借导航跳离门禁；总进度只在复盘后的“完成本段”增加。
- **讨论面板：** 介绍后逐句阅读，显示发言者、句数和已读对话回看。核对全部记录后才开放选择；未获接受的决定要求重试，获接受后进入复盘再完成。
- **按钮与记录：** 主行动靛蓝实底，次行动白底细边；禁用状态减弱。记录使用可切换的 `aria-pressed` 按钮，选项使用整行按钮。全局键盘焦点为靛蓝 3px 外框、5px 偏移；热点另有专用焦点样式。
- **复盘与结尾：** 第一段获接受的反馈之后才展示拒贿解析原图，不把解析图当成业务证据。三段完成后生成学习回顾，允许回看；V1 使用本地存储提供断点续学，不接培训室成绩或正式测验。重开时先显示继续学习入口，重新开始需要确认，保存不可用时说明本次无法保留进度，不阻断学习。续学控件沿用现有字体与配色，未变更场景与排版结构。

素材 provenance 位于 `public/microcourses/integrity-preview/assets/`，每张 WebP 有 `.webp.provenance.json` 和配套 `.webp.json`。费用／礼品图从用户给的素材集合中矩形取出完整工位后缩放编码；会议／拒贿图保留整幅构图后缩放编码。没有重绘人物、拆身体或重新拼家具；“完整展示”指这些记录过来源处理的展示图，不声称从未裁过素材集合。授权未被独立核验，不声称新生成或已获得商业授权。

## Do's and Don'ts

- Do 保留展示图完整构图，并让热点坐标跟随同一原始比例平面。
- Do 在本页范围内保持冷白、墨蓝、靛蓝 UI 与图外讨论。
- Do 保留三段顺序门禁、文字状态和键盘替代入口。
- Don't 重绘、拆分人物身体，或用 cover、蒙版、缩放裁掉人物与家具。
- Don't 复用第二课办公室、人物或三聊天布局。
- Don't 把本页构图提升为全培训室规范，或把源码／jsdom 通过写成视觉发布已验收。
