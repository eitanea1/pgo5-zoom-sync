# Zoom Sync — Design System

A Figma-ready spec for the in-meeting Zoom Sync interface. Use this to extend the product with new features that stay visually consistent with what already ships.

**Vibe:** Dark, data-dense, decisive. Modern Zoom-blue brand layered with a subtle violet AI accent. Tight type scale, 4-pixel spacing grid, generous use of negative space, and motion that's fast enough to feel responsive but slow enough to track.

**Don't:** Bright/light surfaces, decorative gradients on chrome, drop shadows on cards, multi-tone gradient text, sentence-case "Zoom" wordmarks.

**Do:** Thin 1px borders at 8% white, three flat surface tiers, semibold typography, accent halos for AI moments, and chips/pills for any non-actionable status.

---

## 1. Identity

| | |
|---|---|
| **Brand color** | Zoom Blue `#2D8CFF` |
| **AI accent** | Violet `#8B5CF6` (used sparingly for AI moments — detection toast, "Powered by AI" chips, sparkle icon) |
| **Wordmark** | `zoom` (Inter 800) + `Sync` (Inter 600), both at the same `font-size`, both `#2D8CFF`, kerning `-0.03em` on `zoom`, `-0.01em` on `Sync` |
| **Primary surface** | `#0A0D12` (the meeting stage background) |
| **Default text** | `#F5F7FA` |

The interface lives on dark by default. There is no light mode.

---

## 2. Color

### 2.1 Surfaces — four-tier dark stack

| Token | Hex | Where it shows |
|---|---|---|
| `bg-0` | `#0A0D12` | Page / stage background — the meeting canvas |
| `bg-1` | `#10141B` | Panels (Tasks panel, Participants panel) |
| `bg-2` | `#161B23` | Elevated surface — modals, toasts, inputs |
| `bg-3` | `#1E242D` | Cards inside panels, dropdowns |
| `bg-4` | `#262D37` | Hover / pressed state on cards |

Lines/borders sit on top of these:

| Token | Value | Use |
|---|---|---|
| `line` | `rgba(255, 255, 255, 0.08)` | Default card/panel borders |
| `line-strong` | `rgba(255, 255, 255, 0.14)` | Hover-highlighted borders, modals |

### 2.2 Text

| Token | Hex | Use |
|---|---|---|
| `text-hi` | `#F5F7FA` | Primary body, headings, labels |
| `text-md` | `#B9C1CC` | Secondary text, captions, button labels |
| `text-lo` | `#7E8796` | Tertiary, metadata, "by Friday" |
| `text-dim` | `#525A68` | Disabled, placeholder |

### 2.3 Brand (Zoom blue)

| Token | Hex | Use |
|---|---|---|
| `blue-500` | `#2D8CFF` | Primary CTA fill, focus ring, brand wordmark |
| `blue-600` | `#0B5CFF` | Hover/pressed for primary CTAs |
| `blue-400` | `#5AA8FF` | Light accent on dark — chip text, hover icon |
| `blue-100` | `rgba(45,140,255,0.16)` | Active toolbar tint, info chip background |
| `blue-200` | `rgba(45,140,255,0.24)` | Selection background |

### 2.4 Semantic

| Token | Hex | Use |
|---|---|---|
| `green-500` | `#17B26A` | Success, "live" dot, accepted state, sent confirmation |
| `red-500` | `#F04438` | Destructive — End meeting, mute indicator, overdue |
| `red-600` | `#D92D20` | Hover for destructive |
| `amber-500` | `#F5A524` | Low confidence, "Review" chip, urgency 2-3 days |
| `violet-500` | `#8B5CF6` | AI accent — task badge, sparkle, detection halo |

### 2.5 Destination brand dots
For "send to" chips. Each is its own brand color:

| Token | Hex |
|---|---|
| `jira` | `#2684FF` |
| `asana` | `#F06A6A` |
| `monday` | `#FF3D57` |
| `linear` | `#5E6AD2` |

### 2.6 Soft-tinted chip backgrounds (tone variants)

| Tone | Background | Border | Text |
|---|---|---|---|
| AI / violet | `rgba(139,92,246,0.14)` | `rgba(139,92,246,0.28)` | `#C7B3FF` |
| Live / green | `rgba(23,178,106,0.14)` | `rgba(23,178,106,0.28)` | `#6EE0A8` |
| Warn / amber | `rgba(245,165,36,0.14)` | `rgba(245,165,36,0.30)` | `#FCCB6D` |
| Brand / blue | `rgba(45,140,255,0.16)` | `rgba(45,140,255,0.28)` | `#5AA8FF` |
| Neutral | `bg-3` (`#1E242D`) | `line` | `text-md` |

### 2.7 Color usage rules

- **Only one accent per moment.** Violet for AI, blue for brand, green for success — never overlap on the same element.
- **Never put bright colors on `bg-0`.** They look unanchored. Always wrap them in a `bg-2` or `bg-3` container first.
- **Destination dots are 8px circles** at brand color. They never sit alone — always paired with a destination logo.
- **`text-dim` is disabled-only.** Don't use it for "less important" text — use `text-lo` instead.

---

## 3. Typography

### 3.1 Families

| Family | Stack |
|---|---|
| **Sans** (default) | `Inter, "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica Neue, Arial, sans-serif` |
| **Display** (titles, wordmark) | `Inter, "SF Pro Display", -apple-system, ...` |
| **Mono** (kbd, timestamps) | `JetBrains Mono, "SF Mono", ui-monospace, Menlo, Consolas, monospace` |

Inter at all weights (400 / 500 / 600 / 700 / 800).

### 3.2 Scale

| Token | Size | Use |
|---|---|---|
| 11px | `fs-11` | Micro tags, kbd, overline labels (uppercase) |
| 12px | `fs-12` | Captions, metadata, tab labels, chips |
| 13px | `fs-13` | Body small / UI default |
| 14px | `fs-14` | Body, button labels |
| 15px | `fs-15` | Emphasized body, task titles |
| 17px | `fs-17` | Subhead |
| 20px | `fs-20` | Section titles |
| 24px | `fs-24` | H2 |
| 32px | `fs-32` | H1 / meeting timer |
| 44px | `fs-44` | Display / hero |

### 3.3 Line heights

| Token | Value | Use |
|---|---|---|
| `lh-tight` | 1.15 | Display headings |
| `lh-snug` | 1.30 | Subheads, titles |
| `lh-normal` | 1.45 | Body |
| `lh-loose` | 1.60 | Long-form quote text |

### 3.4 Working type styles

| Style | Spec |
|---|---|
| **Display** | Inter 700, 44/1.15, letter-spacing `-0.02em` |
| **H1** | Inter 700, 32/1.15, letter-spacing `-0.015em` |
| **H2** | Inter 600, 24/1.30, letter-spacing `-0.010em` |
| **Title** | Inter 600, 20/1.30, letter-spacing `-0.005em` |
| **Subhead** | Inter 600, 17/1.30 |
| **Body** | Inter 400, 14/1.45 |
| **Body small** | Inter 400, 13/1.45 |
| **Caption** | Inter 400, 12/1.45, color `text-md` |
| **Overline** | Inter 600, 11/1.30, **uppercase**, letter-spacing `0.10em`, color `text-lo` |
| **Mono** | JetBrains Mono 500, 12px, letter-spacing `-0.01em` |

### 3.5 Type rules

- **Headings: 600 or 700, never 800+.** 800 is reserved for the `zoom` half of the wordmark.
- **Body weight is 400.** Bump to 500 only for inline emphasis. 600 for any "label" role (button text, chip text, card titles).
- **Use the overline style sparingly** — context labels above a value (e.g., `MAYA ASKED`, `DUE TODAY`, `SENT TO JIRA`).
- **Never tighten letter-spacing on body text.** Negative spacing is for display sizes only.

---

## 4. Spacing

4-pixel base scale.

| Token | Value | Use |
|---|---|---|
| `s-1` | 4px | Icon-to-text gap, chip internal gap |
| `s-2` | 8px | Default inline gap, button-icon gap |
| `s-3` | 12px | Card padding, panel section gap |
| `s-4` | 16px | Panel padding, input padding |
| `s-5` | 20px | Panel header padding |
| `s-6` | 24px | Modal padding |
| `s-8` | 32px | Section spacing in long content |
| `s-10` | 40px | Empty-state padding |
| `s-12` | 48px | Hero padding |
| `s-16` | 64px | Page-level vertical rhythm |

**Rule:** never use values that aren't multiples of 4. The only documented exception is `2px` for tab strip inner padding (mechanical visual fit, not a content rhythm).

---

## 5. Radii

| Token | Value | Use |
|---|---|---|
| `r-xs` | 4px | Kbd, tiny chips |
| `r-sm` | 6px | Chips, secondary buttons, tab buttons |
| `r-md` | 10px | Default buttons, inputs, toasts, cards-on-panels |
| `r-lg` | 14px | Modals, panels, participant tiles |
| `r-xl` | 20px | Special hero containers |
| `r-pill` | 999px | Avatars, danger CTA on toolbar |

Avatars are always pills. Cards never go bigger than `r-md`. Modals use `r-lg`.

---

## 6. Elevation

Surface stacking is done with **background tier + border**, not shadows. Shadows are reserved for floating elements (toasts, dropdowns, modals).

| Token | Spec |
|---|---|
| `shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.4)` |
| `shadow-md` | `0 6px 18px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.3)` |
| `shadow-lg` | `0 20px 50px rgba(0, 0, 0, 0.55), 0 4px 10px rgba(0, 0, 0, 0.3)` |
| `ring` | `0 0 0 2px #2D8CFF` (focus-visible) |
| `ring-ai` | `0 0 0 2px #8B5CF6` (AI moment, e.g., detection card mounting) |

| Floating element | Use |
|---|---|
| Toasts | `shadow-md` + 1px `line` |
| Modals | `shadow-lg` + 1px `line-strong` |
| Dropdowns | `shadow-lg` + 1px `line-strong` |

---

## 7. Motion

### 7.1 Durations

| Token | Value | Use |
|---|---|---|
| `dur-1` | 120ms | Micro-state (hover bg, color tween) |
| `dur-2` | 200ms | Modal/dialog enter |
| `dur-3` | 320ms | Toast slide-in, panel slide-in, list re-mount |
| `dur-4` | 520ms | New-task highlight, slow-mount halo |

### 7.2 Easings

| Token | Value | Use |
|---|---|---|
| `ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default — soft overshoot for entrances |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits / dismissals (acceleration into nothing) |

### 7.3 Signature animations

- **Detection toast slide-in** (`zs-toast-in`): translateY(8px → 0) + opacity(0 → 1), 320ms `ease`. Used for any toast.
- **New task halo** (`zs-task-in`): 520ms three-phase motion. 0% — opacity 0, translateY -6px, scale 0.98, violet ring. 60% — fully present, soft violet glow. 100% — ring fades to transparent.
- **Slide out on accept**: translateX(0 → 120%) + opacity(1 → 0), 380ms `cubic-bezier(0.4, 0, 1, 1)`.
- **Live dot pulse** (`zs-pulse`): box-shadow ripple 0 → 10px → 0, 1.6s loop. Color matches the dot — green for live, violet for AI capturing.
- **AI ripple** (`zs-ripple`): 4px outward halo on AI badges, 1.6s loop.
- **Wave bars** (`zs-wave`): 4 × 2px vertical bars, height 4px ↔ 14px, 1.1s loop staggered 0/150/300/450ms — used to indicate active speaker or capturing audio.

### 7.4 Motion rules

- Hover transitions: 120ms.
- Modal enter: 200ms. Modal exit: snap (no animation needed).
- Anything that crosses a list boundary (task moving from "My tasks" to "Accepted"): 380ms slide-out, then 520ms slide-in at the destination.
- Reduce motion: respect `prefers-reduced-motion` — collapse all durations to ~80ms, disable infinite pulses.

---

## 8. Iconography

- **Style:** Outline icons at `1.75` stroke width, on a 24×24 viewBox.
- **Stroke caps:** round.
- **Stroke joins:** round.
- **Default size:** 22×22 in toolbars, 16×16 in chips, 14×14 in buttons, 11–12 in inline labels.
- **Color:** matches surrounding text — inherit `currentColor`.
- **Library:** the prototype uses inline custom SVGs that match Lucide's style. In Figma, use Lucide icons or hand-author to the same stroke spec.

For brand logos (Jira, Asana, monday, Linear), use the official monochrome marks at the destination color from §2.5.

---

## 9. Components

### 9.1 Button

Four variants. Default height 36px.

| Variant | Background | Text | Border |
|---|---|---|---|
| **Primary** | `blue-500` → hover `blue-600` | white | none |
| **Secondary** | `bg-3` → hover `bg-4` | `text-hi` | 1px `line` |
| **Ghost** | transparent → hover `bg-3` | `text-md` → hover `text-hi` | none |
| **Danger** | `red-500` → hover `red-600` | white | none |

| Spec | All variants |
|---|---|
| Padding | `0 16px` |
| Font | Inter 600, 13px, letter-spacing `-0.005em` |
| Gap (icon-to-text) | 8px |
| Border radius | `r-md` (10px) |
| Active state | `translateY(0.5px)` |
| Disabled | `opacity: 0.45`, `cursor: not-allowed` |

**Sizes**

| Size | Height | Padding | Font | Radius |
|---|---|---|---|---|
| Small | 28px | `0 12px` | 12px | `r-sm` (6) |
| Default | 36px | `0 16px` | 13px | `r-md` (10) |
| Large | 44px | `0 20px` | 14px | `r-md` (10) |

### 9.2 Icon button (toolbar style)

Stacked icon + label, used in the meeting toolbar.

| Spec | Value |
|---|---|
| Min width | 56px |
| Height | 52px |
| Padding | `6px 10px` |
| Layout | column, gap 2px |
| Icon | 22×22 `text-hi` |
| Label | 11px Inter 500, color `text-md` |
| Hover | bg → `bg-3` |
| Active (`data-active`) | bg → `bg-4` |

### 9.3 Chip / Pill

Single-line status indicator. 22px tall.

| Spec | Value |
|---|---|
| Height | 22px |
| Padding | `0 8px` |
| Gap (icon-to-text) | 4px |
| Font | 11px Inter 600, letter-spacing `0.02em` |
| Radius | `r-sm` (6px) |
| Border | 1px (uses tone-specific color) |

**Tone variants:** see §2.6. Always tinted bg + matching border + bright text.

**When to use:** AI status (`AI Companion`), live indicator (`LIVE`), warning (`Review`), info (`Sent`), brand (`Host`).

### 9.4 Avatar

Circular, photo-optional. Three sizes.

| Size | Diameter | Initials font | Use |
|---|---|---|---|
| `sm` | 24px | 10px | Compact rows, dropdowns |
| `md` (default) | 32px | 12px | Participant lists |
| `lg` | 48px | 16px | Modal headers |

| Spec | Value |
|---|---|
| Background (no photo) | Person's brand color from data, or `bg-4` |
| Initials | white, 600, lowercased to first/last initial |
| Photo | object-fit: cover, fills the circle |
| Border-radius | `r-pill` |

### 9.5 Input

| Spec | Value |
|---|---|
| Height | 36px |
| Padding | `0 12px` |
| Background | `bg-2` |
| Border | 1px `line` → focus `blue-500` |
| Background on focus | `bg-1` (sinks under) |
| Font | 13px Inter 400 |
| Radius | `r-md` |

Placeholder uses `text-dim`. Focus transition: 120ms.

### 9.6 Tabs (segmented)

| Spec | Value |
|---|---|
| Container | inline-flex, `bg-2`, 1px `line`, `r-md`, padding 2px, gap 2px |
| Tab button | 6px 12px, 12px Inter 600, `text-md` → hover `text-hi` |
| Tab radius | `r-sm` |
| Active tab | bg `blue-500`, color white |

Tabs are always horizontal. Use 2-4 tabs per group. More than 4 → use a dropdown.

### 9.7 Card (task style)

| Spec | Value |
|---|---|
| Background | `bg-2` |
| Border | 1px `line` → hover `line-strong` |
| Radius | `r-md` (10px) |
| Padding | `12px 16px` (s-3 / s-4) |
| Layout | flex column, gap `s-2` (8px) |
| Hover bg | `bg-3` |
| Transition | 120ms `ease` on bg + border |

**State variants:**
- `--lowconf` (low-confidence): border `rgba(245,165,36,0.35)`, bg `rgba(245,165,36,0.05)`
- `--new` (just landed): 520ms three-phase mount halo (violet ring → soft glow → transparent)
- `--departing` (slide-out on accept): inline transform `translateX(120%)` + opacity 0 over 380ms

### 9.8 Toast

Floating notification. Lives outside content flow.

| Spec | Value |
|---|---|
| Background | `bg-2` (opaque) OR gradient `rgba(45,140,255,0.12) → rgba(139,92,246,0.12)` for AI moments |
| Border | 1px `line` (or `rgba(139,92,246,0.35)` for AI moments) |
| Radius | `r-md` |
| Padding | `12px 16px` |
| Shadow | `shadow-md` |
| Backdrop filter | `blur(12px)` for AI / glassy variant |
| Min width | 320px |
| Max width | 520px (clamp) |
| Animation | 320ms slide-in (translateY 8px → 0 + opacity 0 → 1) |

**Position conventions:**
- **Detection toast** — bottom-center of stage
- **Sent confirmation** — top-center of stage
- **Resolution toast** (accept/decline result) — top-center
- **Team activity** — top-left
- **Out-of-meeting notification** — bottom-right

Each corner serves one toast at a time. Auto-dismiss: 2.4s for confirmations, 4.5s for activity, 4.2s for default.

**Toast accent strip pattern:** 3px-wide vertical bar on the left edge, in the relevant tone color (green for accepted, amber for declined, blue for info). Inset, no border-radius — bleeds into the toast's left edge.

### 9.9 Modal

| Spec | Value |
|---|---|
| Width | min(420px, 100vw - 32px) for dialogs; min(560px, 100vw - 32px) for content modals |
| Max height | `100vh - 64px`, scrollable body |
| Background | `bg-2` |
| Border | 1px `line-strong` |
| Radius | `r-lg` (14px) |
| Shadow | `shadow-lg` |
| Backdrop | `rgba(0, 0, 0, 0.55)` for dialogs, `0.6` for content modals |
| Sections | header (`s-5` padding) → body (scrollable) → footer (`s-5` padding) |
| Section dividers | 1px `line` |

**Click outside to dismiss** — by default. Override only for destructive flows.

**Enter animation:** 200ms ease-out (slight scale 0.98 → 1 + opacity).

### 9.10 Panel

A persistent sidebar. Used for Tasks, Participants, etc.

| Spec | Value |
|---|---|
| Width | 360px (token `panel-w`) |
| Background | `bg-1` |
| Border | 1px `line` (full perimeter or just the border-left depending on layout) |
| Radius | `r-lg` |
| Sections | header (border-bottom) → body (scrollable) → footer (border-top) |
| Header padding | 16px 20px |
| Body padding | 4px 16px 16px |
| Footer padding | 10px 16px |

### 9.11 Dropdown / Select

| Spec | Value |
|---|---|
| Trigger button | inline-flex, 24-30px tall, `bg-3`, 1px `line`, `r-sm`, 11px Inter 600 |
| Trigger gap | 6px |
| Trigger chevron | 12px outline at right |
| Menu | `bg-2`, 1px `line-strong`, `r-md`, padding 4px, `shadow-lg`, min-width 200px |
| Menu item | 8px 10px, `r-sm`, 12px Inter 600, hover bg `bg-3`, selected bg `bg-4` |
| Menu item layout | optional avatar/logo (left) + label (flex 1) + check indicator (right) |
| Menu max-height | 260px scrollable |

### 9.12 Notification (team activity / out-of-meeting)

A persistent or semi-persistent card pinned to a screen corner.

| Spec | Value |
|---|---|
| Width | 320–380px |
| Background | `bg-2` |
| Border | 1px `line` |
| Radius | `r-md` (10px) |
| Padding | 14px |
| Shadow | `shadow-lg` |
| Layout | optional 22px square AI/brand icon block (top) + title + body + actions |
| Header strip | 1px bottom border, used to mock "from another app" framing |

---

## 10. Patterns

### 10.1 The "Show quote" toggle

A subtle inline disclosure that hides supporting context until the user wants it.

```
▶ Show quote · Maya asked          (collapsed)
▼ Hide quote · Maya asked          (expanded)
   "Maya, can you draft three onboarding copy variants?"   ← italic blockquote
```

**Spec:**
- Button: ghost-style — no border, no background. Inline-flex, padding 2px 4px, gap 5px.
- Font: 11px Inter 500, color `text-lo` → hover `text-hi`.
- Chevron: 11px outline, 2.5 stroke.
- Quote: italic, 11px, color `text-lo`, line-height 1.4. Left border 2px `bg-4`, padding-left 10px.

### 10.2 Source quote with highlight

When the AI extracts a deadline from the spoken quote:

```
"Maya, can you pull the Q2 launch timeline into a one-pager [BY FRIDAY]?"
```

The bracketed phrase is rendered as an inline pill: 1px amber border, amber text, 10.5px Inter 700, padding `0 5px`, radius 3px, **not italic** (breaks out of the surrounding blockquote style).

### 10.3 Attribution overline

Above a quote (when expanded for assigned cards):

```
MAYA ASKED                               ← overline (11px, uppercase, 0.10em letter-spacing, text-lo)
"Maya, can you draft …?"
```

Verb maps to trigger:
- `name_spoken` → `{Name} asked`
- `volunteered` → `{Name} volunteered`
- `role_specific` → `{Name} asked the room`
- `unattributed` → `{Name} raised it`

### 10.4 Deadline urgency line

Inline 11px Inter 600 colored text under a card title. Format: clock icon (11px, 2.2 stroke) + label.

| Tier | Color | Label format |
|---|---|---|
| Overdue | `red-500` | `Overdue · {date}` |
| Today | `red-500` | `Due today` |
| Tomorrow | `amber-500` | `Due tomorrow` |
| Within 3 days | `amber-500` | `Due {date}` |
| Within a week | `#FCCB6D` | `Due {date}` |
| Later | `text-md` | `Due {date}` |
| No deadline | — | render nothing |

### 10.5 "Sent to {destination}" confirmation

When a task ships to its tracker:

```
[3px green strip]  [40px destination logo tile]  SENT TO JIRA   (11px overline, green-500)
                                                 Task title here  (13px 600, text-hi)
                                                 [DUE FRI, MAY 1]  Q2 Roadmap
                                                 ↑ amber pill      ↑ project name
```

Toast structure: 12px 14px padding, `bg-2`, 1px `line`, `r-md`, `shadow-lg`, 320ms slide-in. Auto-dismiss 2.4s.

### 10.6 Empty state

```
   [24px icon, text-dim]
   Title                ← 13px Inter 600, text-md
   Sub-message          ← 11px, text-lo
```

Container: padding 40px 16px, dashed 1px border `line`, `r-md`, centered text. No background fill.

### 10.7 Live indicators

- **Live dot** — 6px green circle with infinite 1.6s ripple halo, used in meeting header and panel footer ("Capturing live").
- **Wave bars** — 4 vertical bars, 2px wide, 4–14px tall, 1.1s loop, staggered. Used next to "is speaking" labels and on toast headers.

---

## 11. Layout primitives

| Token | Value | Use |
|---|---|---|
| `header-h` | 56px | Meeting header bar |
| `toolbar-h` | 72px | Bottom meeting toolbar |
| `panel-w` | 360px | Right-rail panels |

### Meeting page skeleton

```
┌──────────────────────────────────────────────────────────────┐
│  Header  56px tall                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Stage (gallery / spotlight)              Panel (360px)    │
│                                              [if open]       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Toolbar  72px tall                                          │
└──────────────────────────────────────────────────────────────┘
```

Stage padding: 16px. Stage-to-panel gap: 16px.

---

## 12. Accessibility

- **Contrast:** all body text passes WCAG AA on dark surfaces. Buttons in semantic colors (green Accept, red End) pass AA Large. Don't drop button text below 13px on these.
- **Focus:** every interactive element gets a `0 0 0 2px blue-500` ring on `focus-visible`. AI moments (sparkle button, AI dropdown) use the violet ring `0 0 0 2px violet-500`.
- **Reduced motion:** respect `prefers-reduced-motion: reduce` — collapse all durations to ~80ms, kill infinite pulses, keep the position changes (don't break layout).
- **Click targets:** 36px min height for any tappable target. Icon buttons stretch to 52px tall for toolbar use.
- **Color-only signals:** never rely on color alone. The amber "Review" chip pairs color with a warning icon and the word "Review". The green "Accepted" chip pairs color with a check icon. The red overdue label pairs color with the word "Overdue".

---

## 13. Naming convention

CSS tokens use the prefix `--zs-` (Zoom Sync). For Figma:

- **Colors** → variable names like `Surface/bg-2`, `Text/hi`, `Brand/blue-500`, `Semantic/green-500`, `Tone/AI/violet-500`.
- **Type styles** → `Display`, `H1`, `H2`, `Title`, `Subhead`, `Body`, `Body Small`, `Caption`, `Overline`, `Mono`.
- **Component variants** → `Button / Primary / Default`, `Button / Primary / Small`, `Chip / AI`, `Toast / Detection`, etc.

---

## 14. Adding a new feature — checklist

When designing a new screen or feature:

1. **Surface tier:** what `bg-N` does the new container live on? (Don't invent a new tier.)
2. **Type style:** map every text element to one of the 11 documented styles. (Don't invent a new size.)
3. **Spacing:** every gap / padding is a multiple of 4. (Don't introduce 5px or 7px.)
4. **Color:** if you need a new color, ask whether one of the 5 semantic / 4 brand / 4 destination already covers it. If yes, use it. If no, propose a new token before using a one-off hex.
5. **Components:** can you compose from § 9? If you need a brand-new component shape, write it up here first and add a `--zs-*` variable for any new token.
6. **Motion:** every animation should map to one of the 4 durations and 2 easings.
7. **Accessibility:** focus ring + reduced-motion handled.
8. **Dark by default:** no light-mode design exists. If you sketch on white, throw it out.

---

## 15. Quick Figma starter

**Variables to create (matches CSS tokens):**

```
Surface
  bg-0  #0A0D12
  bg-1  #10141B
  bg-2  #161B23
  bg-3  #1E242D
  bg-4  #262D37
Line
  default      rgba(255,255,255,0.08)
  strong       rgba(255,255,255,0.14)
Text
  hi   #F5F7FA
  md   #B9C1CC
  lo   #7E8796
  dim  #525A68
Brand
  blue-500  #2D8CFF
  blue-600  #0B5CFF
  blue-400  #5AA8FF
Semantic
  red-500     #F04438
  amber-500   #F5A524
  green-500   #17B26A
  violet-500  #8B5CF6
Destination
  jira    #2684FF
  asana   #F06A6A
  monday  #FF3D57
  linear  #5E6AD2
```

**Effects:**
```
Shadow / sm    0 1px 2px rgba(0,0,0,0.4)
Shadow / md    0 6px 18px rgba(0,0,0,0.45) + 0 2px 4px rgba(0,0,0,0.3)
Shadow / lg    0 20px 50px rgba(0,0,0,0.55) + 0 4px 10px rgba(0,0,0,0.3)
Ring           0 0 0 2px #2D8CFF
Ring AI        0 0 0 2px #8B5CF6
```

**Auto-layout primitives:**
- Card → vertical stack, gap 8, padding 12 16, fill bg-2, stroke 1px line, radius 10
- Button → horizontal stack, gap 8, padding 0 16, height 36, fill blue-500, radius 10
- Chip → horizontal stack, gap 4, padding 0 8, height 22, fill bg-3, stroke 1px line, radius 6
- Avatar → 32×32 frame, radius full, fill `text-md`, image fill on top, clip
- Toast → horizontal stack, gap 12, padding 12 16, fill bg-2, stroke 1px line, radius 10, shadow-md

---

*This document mirrors the running prototype at `claude-design/project/Zoom Sync.html`. The CSS source of truth is `claude-design/project/styles/tokens.css` + `components.css`. Keep this doc in sync with those files when tokens change.*
