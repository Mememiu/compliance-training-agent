# 培训室 Brand Guidelines v0.1

## Quick Reference

| Item | Value |
|------|-------|
| Theme | Learning Score / 学习谱 |
| Primary Color | #182126 |
| Secondary Color | #B9C6CC |
| Accent Color | #D9E45F |
| Primary Font | Noto Sans SC |
| Voice | clear, steady, useful |

## Brand Concept

“培训室”是一个可扩展的企业学习空间。它不把培训表现成一次性的合规检查，而是把每门课程组织成员工可以读懂、跟随和完成的学习谱面。名称只是工作名，标志和视觉系统不依赖具体字标，方便未来替换产品名称。

视觉上，系统把谱纸、墨色、节拍块和校准记号转译成数字界面：课程有顺序，进度有节拍，当前任务有明确的记号，版本和编辑状态有可追溯的边注。表达要克制但不冷漠，专业但不官僚。

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Score Ink | #182126 | rgb(24,33,38) | Main text, navigation, primary dark surfaces, mark |
| Score Ink Deep | #0F1518 | rgb(15,21,24) | Dark surface hover and high-contrast headings |
| Score Ink Soft | #34434A | rgb(52,67,74) | Secondary text on paper surfaces |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Steel Note | #B9C6CC | rgb(185,198,204) | Quiet metadata, inactive notation, dividers |
| Steel Mist | #E4EAEC | rgb(228,234,236) | Input fills, selected-row wash, neutral surfaces |
| Paper Ground | #F5F2EA | rgb(245,242,234) | Primary page background and reading canvas |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Signal Lime | #D9E45F | rgb(217,228,95) | Current step, primary action emphasis, focus cue |
| Signal Lime Deep | #AAB52F | rgb(170,181,47) | Hover, active, and lime text on light surfaces |
| Signal Lime Wash | #F0F4BE | rgb(240,244,190) | Progress track and selected-state background |

### Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Complete Green | #4F8F71 | rgb(79,143,113) | Completed learning states and success feedback |
| Attention Amber | #B68128 | rgb(182,129,40) | Due soon, review required, caution |
| Action Red | #B94B43 | rgb(185,75,67) | Errors, destructive actions, overdue states |
| Info Blue | #4E7FA3 | rgb(78,127,163) | Explanatory information and links |

### Neutral

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Paper | #F5F2EA | rgb(245,242,234) | App background |
| Paper Bright | #FCFBF7 | rgb(252,251,247) | Reading surfaces and cards |
| Ink | #182126 | rgb(24,33,38) | Primary text |
| Ink Muted | #617078 | rgb(97,112,120) | Secondary text; verify contrast per context |
| Rule | #D4DDDF | rgb(212,221,223) | 1px dividers and field borders |

### Accessibility

- Normal text and background combinations must meet WCAG 2.1 AA at 4.5:1.
- Large text must meet 3:1; controls and focus indicators must meet 3:1 against adjacent colors.
- Signal Lime is a state and emphasis color, not a standalone color for long text. Pair it with Score Ink.
- Status is always communicated with a label or icon in addition to color.

## 2. Typography

### Font Stack

```css
--font-heading: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-mono: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
```

The Chinese sans is calm and highly legible for long lesson content. The mono face is reserved for course IDs, versions, dates, timers, and other measurable notation. Do not use mono as a general “technical” costume.

### Type Scale

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| Display | Noto Sans SC | 700 | 48px / 36px mobile | 1.12 |
| H1 | Noto Sans SC | 700 | 36px / 30px mobile | 1.2 |
| H2 | Noto Sans SC | 650 | 28px / 24px mobile | 1.25 |
| H3 | Noto Sans SC | 600 | 20px / 18px mobile | 1.35 |
| Body | Noto Sans SC | 400 | 16px | 1.65 |
| Label | Noto Sans SC | 600 | 13px | 1.4 |
| Data | IBM Plex Mono | 500 | 12px | 1.4 |

### Type Rules

- Headings are sentence case and left aligned.
- Keep lesson prose at 65–75ch where the viewport allows.
- Letter spacing is `0`; hierarchy comes from size, weight, and placement.
- Avoid all-caps labels for user-facing Chinese copy.

## 3. Logo Usage

### Mark

The learning-score mark is a vertical staff with stepped notation blocks and one Signal Lime current-step marker. The mark may stand alone in app chrome or pair with a replaceable wordmark.

### Correct Usage

- Use `public/brand/learning-score-mark.svg` on Paper Bright or Score Ink surfaces.
- Keep clear space equal to the mark’s staff width on every side.
- Use the dark mark on light surfaces and the light variant (to be added) on dark surfaces.
- Keep the mark at or above 20px in UI and 32px in product headers.

### Incorrect Usage

- Do not attach the mark permanently to the temporary name “培训室”.
- Do not rotate, stretch, outline, bevel, gradient-fill, or add a drop shadow.
- Do not use the mark as a decorative bullet for every list item.

## 4. Voice & Tone

### Brand Personality

| Trait | We Are | We Are Not |
|------|--------|------------|
| **Clear** | Direct about the next action and the reason it matters | Vague, legalistic, or padded |
| **Steady** | Calm when a topic is sensitive or a deadline is near | Alarmist or playful about risk |
| **Useful** | Turns policy into a decision someone can apply at work | A library of abstract rules |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Home | Inviting and directional | “继续你的下一节学习” |
| Lesson | Precise and conversational | “先记住这三个判断点” |
| Quiz | Neutral and focused | “选择最符合实际工作场景的做法” |
| Error | Specific and recoverable | “暂时无法保存进度，请重试；你的答案已保留” |
| Completion | Quietly affirming | “本门课程已完成，成绩已记录” |

### Prohibited

| Avoid | Reason |
|------|--------|
| 一键掌握 / 百分百合规 | 不可验证的承诺 |
| 被培训对象 | 用员工、学习者或具体角色称呼用户 |
| 警告 / 处罚作为默认引导语 | 除非正在描述真实制度后果，否则会制造不必要的压力 |

## 5. Imagery & Graphic Language

### Graphic System

- Use a vertical staff, short stepped bars, crop marks, registration dots, and margin notes as functional notation.
- Every mark must encode something: order, progress, current focus, version, or dependency.
- Prefer flat ink and paper surfaces with one high-signal lime state; avoid generic mesh gradients and decorative blobs.
- Use diagrams, annotated examples, and real course artifacts before stock photography.

### Photography

Photography is optional and secondary. When needed, show real work contexts with documentary light, visible hands or documents, and enough negative space for readable copy. Do not use staged boardroom handshakes, anonymous “corporate people”, or darkened stock imagery.

### Icons

- Use Lucide icons at a 1.75px stroke on a 24px grid.
- Icons are outline-first, with filled state only for the active marker or status.
- Pair unfamiliar icons with labels; never use emoji or Unicode symbols as UI icons.

## 6. Banner Direction

For website heroes, GitHub covers, and course campaign banners, use a wide score-paper composition: the product name is set on the left, a real course or learning path is visualized as stepped notation on the right, and one Signal Lime marker identifies the next action. Keep critical copy in the central 70–80% safe zone. Use no more than one CTA and no more than two typefaces.

### Base Prompt Template

```
editorial learning score on warm paper, deep charcoal ink, one fluorescent lime current-step marker, stepped notation blocks, margin annotations, crisp documentary flat-lay, no text, no logos, no gradients, no people posing
```

### Style Keywords

| **Material** | warm paper, score ink, steel annotation, registration marks |
| **Composition** | aligned staff, stepped rhythm, generous reading space, one focal marker |
| **Subject** | real course module, lesson page, quiz result, learning path |

### Visual Mood Descriptors

- calm, precise, authored, quietly optimistic
- documentary rather than staged
- functional notation over decoration

### Visual Don'ts

| Avoid | Reason |
|------|--------|
| generic blue gradients | collapses the product into a template SaaS look |
| decorative blobs and glass panels | adds surface noise without product meaning |
| posed corporate stock photography | makes the learning space feel impersonal |

### Example Prompts

**Website hero:**
```text
wide editorial learning score for an employee training room, warm paper ground, deep charcoal staff lines, stepped modules for data privacy and information security, one fluorescent lime current-step marker on the right, clear negative space on the left for a replaceable product name, no text, no logos, no gradients
```

**Course cover:**
```text
vertical course score sheet for a workplace learning module, paper and ink, three aligned lesson blocks, lime marker on the current lesson, steel blue margin annotations, precise flat-lay, no text, no logos, no people posing
```

## 7. Asset Rules

- Keep master brand assets in `public/brand/` and campaign exports in `public/brand/banners/<campaign>/`.
- Use kebab-case names and include dimensions for exported raster assets.
- Every generated raster must carry a prompt sidecar; every sourced image must carry its origin.
- Do not introduce an asset whose palette cannot be mapped to this system without a documented campaign exception.

### Current Reference Export

- `assets/banners/training-room/banner_training-room_learning-score_20260902.png` — 1920 × 640 website hero banner.
- `assets/banners/training-room/banner_training-room_learning-score_20260902.prompt.txt` — composition and production sidecar.
