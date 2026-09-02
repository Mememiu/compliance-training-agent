---
name: Learning Score Training Room
description: A calm, notation-led learning space for employee training across company topics.
colors:
  score-ink: "#182126"
  score-ink-deep: "#0F1518"
  score-ink-soft: "#34434A"
  steel-note: "#B9C6CC"
  steel-mist: "#E4EAEC"
  paper-ground: "#F5F2EA"
  paper-bright: "#FCFBF7"
  signal-lime: "#D9E45F"
  signal-lime-deep: "#AAB52F"
  signal-lime-wash: "#F0F4BE"
  complete-green: "#4F8F71"
  attention-amber: "#B68128"
  action-red: "#B94B43"
  info-blue: "#4E7FA3"
  rule: "#D4DDDF"
  paper-soft-rule: "#E8E7DF"
  paper-muted: "#C9D0D1"
  paper-label: "#6D7E83"
  paper-copy: "#5D6C71"
  paper-toolbar: "#C2CBCA"
  paper-secondary: "#899598"
  paper-wash: "#EDF0DF"
  paper-border: "#C6CECC"
  card-coral: "#F6D5D0"
  card-coral-ink: "#7E302B"
  card-lavender: "#DCD5FA"
  card-lavender-ink: "#4A397A"
  card-mint: "#DCEFD8"
  card-mint-ink: "#2D684A"
  card-butter: "#F8E9A8"
  card-butter-ink: "#765D16"
  shape-lavender: "#D4C8F3"
  shape-yellow: "#F3DE8B"
  shape-blue: "#AECFE0"
  assistant-wash: "#E5EDCF"
  assistant-wash-hover: "#DBE8BA"
  assistant-copy: "#60716D"
  note-copy: "#728186"
  code-copy: "#8A989A"
  metadata-copy: "#77878B"
typography:
  display:
    fontFamily: "Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "48px / 36px mobile"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "0"
  body:
    fontFamily: "Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  data:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  serif-display:
    fontFamily: "Noto Serif SC, Songti SC, STSong, serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.15
  scale:
    micro: "10px"
    metadata: "11px"
    label: "13px"
    copy-small: "14px"
    copy-mobile: "15px"
    action: "17px"
    title-small: "20px"
    title-card: "21px"
    title-card-large: "22px"
    stat: "27px"
    section: "28px"
    scene-title: "31px"
    headline-mobile: "38px"
    headline-compact: "42px"
    headline: "46px"
    headline-display: "58px"
    headline-wide: "78px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  soft: "7px"
  brand: "9px"
  panel: "15px"
  card: "16px"
  card-compact: "17px"
  scene: "22px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.score-ink}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  button-signal:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.score-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  field:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.score-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  surface:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.score-ink}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Learning Score Training Room

## Overview

**Creative North Star: “The Learning Score”**

This system treats training as a readable score rather than a stack of generic cards. Warm paper is the quiet reading ground; deep score ink carries hierarchy; stepped notation blocks show sequence and dependency; one fluorescent lime marker identifies the current action. The visual world should feel authored and operational, with enough character to be remembered but enough restraint for sensitive policy topics and long-form lessons.

The current employee home extends that score into a paper workspace inspired by editorial productivity tools: a quiet canvas, a floating document preview, soft color-coded course sheets, large serif wayfinding, and motion that explains what changed. The reference is a compositional cue, not a copied brand or content system. The course cards stay factual and task-led so the page still works as a recurring employee tool rather than a marketing landing page.

The product name is intentionally not embedded in the mark. The identity survives a future rename and can stretch from compliance into security, policy, business, culture, and other company learning topics.

**Key Characteristics:**
- Notation is functional: it encodes order, progress, version, focus, or dependency.
- One high-signal lime state is rarer than the ink and paper field.
- Dense information is organized by staff lines, margin notes, and stepped rhythm rather than nested card stacks.
- Paper workspace surfaces use restrained coral, lavender, mint, and butter sheets to distinguish course domains without turning status into decoration.
- Serif display type carries orientation and memory; sans-serif copy carries instructions; IBM Plex Mono carries dates, durations, and progress data.
- Motion is reserved for the next action, course preview changes, and card lift so the employee can understand state at a glance.

## Colors

The palette is paper, ink, steel annotation, and a single signal marker. Semantic colors remain quiet and are never allowed to compete with the current-step lime.

### Primary
- **Score Ink** (#182126): Navigation, primary text, dark surfaces, and the independent mark.
- **Score Ink Deep** (#0F1518): Pressed states and the highest-contrast headings.

### Secondary
- **Steel Note** (#B9C6CC): Inactive notation, metadata, dividers, and low-priority structure.
- **Steel Mist** (#E4EAEC): Neutral input and selected-row surfaces.

### Tertiary
- **Signal Lime** (#D9E45F): Current step, primary action emphasis, and focus cue.
- **Complete Green** (#4F8F71): Completed state only.
- **Attention Amber** (#B68128): Due soon and review-required state.
- **Action Red** (#B94B43): Error, destructive, or overdue state.

### Neutral
- **Paper Ground** (#F5F2EA): App background and reading canvas.
- **Paper Bright** (#FCFBF7): Elevated reading surfaces and fields.
- **Rule** (#D4DDDF): 1px boundaries and separators.

**The One Marker Rule.** Signal Lime is the only color allowed to announce “this is the next thing.” Use semantic colors for status, never for primary action.

## Typography

**Display Font:** Noto Sans SC (with PingFang SC, Microsoft YaHei fallbacks)

**Body Font:** Noto Sans SC (with PingFang SC, Microsoft YaHei fallbacks)

**Label/Mono Font:** IBM Plex Mono (with SFMono-Regular, Consolas fallbacks)

**Character:** Noto Sans SC keeps Chinese lesson content calm and legible. IBM Plex Mono makes measurable data feel like notation without turning the entire interface into a developer tool.

### Hierarchy
- **Display** (700, 48px / 36px mobile, 1.12): Product-level welcome and major learning milestone.
- **Headline** (700, 36px / 30px mobile, 1.2): Page title and course title.
- **Title** (650, 28px / 24px mobile, 1.25): Section and module title.
- **Body** (400, 16px, 1.65): Lesson copy, descriptions, and instructions; target 65–75ch.
- **Label** (600, 13px, 1.4): Button and metadata label; sentence case for Chinese.
- **Data** (500, 12px, 1.4): IDs, version labels, dates, timers, and score values.

**The Two Voices Rule.** Sans carries meaning; mono carries measurement. Do not use mono for general copy.

## Layout

Use a 12-column desktop grid with a 1120px maximum reading width. The employee home surface leads with a single learning path and a visible next action, then opens into the course catalog and progress details. Course and lesson surfaces keep a readable central measure and place metadata in a margin or rail. Editor surfaces may increase density, but preserve the same staff-and-margin logic.

Use a 4px base spacing unit with 8, 16, 24, 32, and 48px rhythm steps. At mobile widths, reduce the grid to one column, keep the current-step marker visible before secondary metadata, and linearize tabs or rails into an ordered list. Avoid nested containers that make the score structure disappear.

## Elevation & Depth

Depth is primarily tonal: Paper Bright sits on Paper Ground, while ink and rule lines define structure. Use one soft ambient shadow for a surface that must separate from the reading canvas and a stronger shadow only for an active dialog or drag state. Never use hard offset shadows or colored glow as decoration.

### Shadow Vocabulary
- **Surface lift** (`0 8px 24px rgb(24 33 38 / 0.08)`): A reading surface over the paper ground.
- **Dialog lift** (`0 16px 40px rgb(15 21 24 / 0.16)`): Modal or protected focus state.

**The Flat-by-Default Rule.** A surface starts flat. Elevation appears only when a state needs separation.

## Shapes

Corners are squared enough to feel like paper and software documentation: 4px for actions and fields, 8px for standard surfaces, and 12px only for larger reading panels. Borders are 1px Rule color and disappear where tonal layering already provides sufficient separation. Pills are reserved for compact filters or status tags.

The signature geometry is the stepped notation block: short rectangular marks with consistent baseline alignment and a single lime current-step mark. Do not turn every container into a rectangle with an accent strip; notation must carry information.

## Components

### Buttons
- **Shape:** 4px radius; 44px minimum interactive height.
- **Primary:** Score Ink background and Paper Bright text; 12px 18px padding.
- **Signal:** Signal Lime background and Score Ink text for the one primary learning action.
- **Hover / Focus:** Deepen the ink or lime value; add a 2px visible focus ring using Signal Lime Deep with 2px offset.
- **Secondary:** Paper Bright or transparent with a Rule border; never compete with the signal button.

### Chips
- **Style:** Small status tags use Steel Mist or a semantic wash, 4px radius, and a text label.
- **State:** Selected filters use Signal Lime Wash with Score Ink text; status chips always include text, not color alone.

### Cards / Containers
- **Corner Style:** 8px standard, 12px for a major reading panel.
- **Background:** Paper Bright on Paper Ground.
- **Shadow Strategy:** Surface lift only when a panel needs separation; otherwise use a 1px Rule border.
- **Border:** Rule color, 1px.
- **Internal Padding:** 24px standard, 16px compact, 32px for a hero reading panel.

### Inputs / Fields
- **Style:** Paper Bright fill, 1px Rule border, 4px radius, 12px 14px padding.
- **Focus:** Signal Lime Deep border plus a 2px offset focus ring.
- **Error / Disabled:** Action Red label and border for errors; Steel Mist fill and muted text for disabled fields.

### Navigation

Navigation is a score rail: stable section labels, a stepped active marker, and short metadata. The active item uses Score Ink text plus a Signal Lime block or underline; do not fill the entire rail with saturated color. On mobile, collapse into a labelled menu while keeping the current section and course context visible.

### Learning Path

The learning path is the signature component. It uses an aligned staff line, stepped module blocks, a lime current-step marker, and mono metadata for duration or version. Completed modules become ink outline plus Complete Green status; locked modules stay Steel Note; the path remains readable without animation.

## Do's and Don'ts

### Do:
- **Do** use the current-step marker to make the next learning action obvious within seconds.
- **Do** let real course titles, durations, quiz states, and version notes become the visual content.
- **Do** preserve a quiet paper reading surface for long lessons.
- **Do** use diagrams and annotated examples before stock photography.
- **Do** keep the mark independent from the replaceable product name.

### Don't:
- **Don't** default to blue SaaS gradients, glass panels, or generic metric-card dashboards.
- **Don't** use Signal Lime for paragraphs or large areas; its rarity creates focus.
- **Don't** turn every module into an identical icon card; encode sequence with the learning path.
- **Don't** use decorative grid overlays or notation marks that have no product meaning.
- **Don't** make sensitive training feel playful, alarmist, or punitive.
