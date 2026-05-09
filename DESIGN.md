# Design System: Visual Product Search SPA (alt.it)
**Project ID:** 3270885382127867718

---

## 1. Visual Theme & Atmosphere

**alt.it** is a refined, editorial-feeling product discovery tool for interior design enthusiasts. The overall aesthetic is **airy and curated** — the UI steps back to showcase product photography, never competing with it. A signature **dot-grid background** (radial-gradient dots at 24px intervals) gives the canvas a subtle hand-drawn sketchbook quality, grounding the page without weight.

The header is **frosted glass** — white at 80% opacity with backdrop blur — reinforcing a sense of layered depth without hard dividers. The layout is wide and generous, capped at a 7xl container (≈1280px) with 24px horizontal gutters.

The app supports **three interchangeable color themes**, all sharing the same structural skeleton. Each theme substitutes only the primary and accent colors, allowing for mood variation without rewriting layout or typography. A theme switcher lives unobtrusively in the top-right navigation area.

---

## 2. Color Palette & Roles

### Shared / Structural Colors (All Themes)
| Descriptive Name | Hex | Role |
|---|---|---|
| Clean Canvas White | `#ffffff` | Card backgrounds, header background base |
| Warm Off-White | `#fdfbf9` | Page background base (light mode) |
| Charcoal Ink | `#0f172a` (slate-900) | Primary body text, headings |
| Soft Dove Gray | `#f1f5f9` (slate-100) | Secondary card backgrounds, icon button resting state |
| Muted Stone Divider | `#e2e8f0` (slate-200) | Borders, horizontal rules, separator lines |
| Faded Slate Caption | `#64748b` (slate-500) | Secondary text, labels, "Sort by:" prompts |
| Warm Amber Star | `#f59e0b` (amber-500) | Rating star icons across all themes |
| Near-Black Abyss | `#1c1815` | Dark mode page background |

---

### Theme A — Lavender & Sunflower
*Mood: Dreamy, soft-luxury editorial*

| Descriptive Name | Hex | Role |
|---|---|---|
| Soft Misted Lavender | `#E6E6FA` | Lavender light tint; dot-grid dot color used as soft `lavender-light` |
| Mid Violet Lavender | `#B57EDC` | **Primary brand color.** Logo badge fill, primary CTA buttons, active filter chips, hover states, brand-label text on cards, dot-grid dots |
| Deep Plum Lavender | `#9370DB` | `lavender-dark`; used in darker hover shadow or deeper focus rings |
| Vivid Sunflower Yellow | `#FFDA03` | **Accent color.** Decorative underline on the hero headline word "instantly"; star rating icons in this theme |
| Sunflower Hover Deep | `#E5C402` | Sunflower on hover state |

**Dot grid:** dots are `#B57EDC` (Mid Violet Lavender) on an `#fcfaff` (barely-there violet white) base — the very lightest possible tint of lavender.

---

### Theme B — Terracotta & Sage
*Mood: Warm, earthy, artisan-organic. Supports dark mode.*

| Descriptive Name | Hex | Role |
|---|---|---|
| Burnt Terracotta | `#e37059` | **Primary brand color.** Logo badge, buttons, active chips, hover states, brand-label text on cards |
| Muted Herb Sage | `#8a9a5b` | Named `sage` in the config; available as a secondary complementary accent |
| Warm Linen Off-White | `#fdfbf9` | Light mode page canvas |
| Smoked Espresso Dark | `#1c1815` | Dark mode page canvas |
| Parchment Dot | `#e8e4e1` | Dot-grid dots on light backgrounds; warm beige-gray |
| Charcoal Grid Dot | `#2d2d2d` | Dot-grid dots in dark mode |
| Amber Accent Underline | `#fbbf24` (amber-400) | Decorative underline on hero headline "instantly" |

---

### Theme C — Deep Teal & Coral
*Mood: Bold, confident, modern contrast. Also supports dark mode.*

| Descriptive Name | Hex | Role |
|---|---|---|
| Deep Ocean Teal | `#008080` | **Primary brand color.** Logo badge, buttons, active chips, hover states, brand-label text on cards, nav hover |
| Warm Living Coral | `#FF7F50` | **Secondary accent.** Upload zone dashed border and its hover state; hero headline underline decoration at 40% opacity |
| Warm Linen Off-White | `#fdfbf9` | Light mode page canvas (shared with Theme B) |
| Smoked Espresso Dark | `#1c1815` | Dark mode page canvas (shared with Theme B) |
| Parchment Dot | `#e8e4e1` | Dot-grid dots on light backgrounds |
| Charcoal Grid Dot | `#2d2d2d` | Dot-grid dots in dark mode |

---

## 3. Typography Rules

**Font Family:** `Epilogue` (Google Fonts), weights 300–800. Applied as a single `font-display` family via Tailwind config. No secondary typeface — all text uses Epilogue.

| Usage | Weight | Notes |
|---|---|---|
| Hero headline ("Find your aesthetic") | `font-extrabold` (800) | 4xl mobile → 5xl desktop, tight tracking (`tracking-tight`) |
| Hero keyword ("instantly") | `font-extrabold` (800) | Colored in primary + decorative underline in the accent color, 4px thick, 8px underline offset |
| Section headings (e.g. "Similar Matches") | `font-bold` (700) | 2xl |
| Brand logotype ("alt.it") | `font-extrabold` (800) | Lowercase only, `tracking-tighter` — intentional design choice |
| Nav links & filter labels | `font-semibold` (600) | Small (sm), muted slate |
| Brand label on cards (e.g. "Nordic Living") | `font-bold` (700) | `text-xs`, ALL CAPS, widely letter-spaced (`tracking-wider`), primary color |
| Card product name | `font-bold` (700) | `text-lg`, single-line clamped |
| Card price | `font-extrabold` (800) | `text-xl` |
| Body / descriptive copy | Regular (400) | `text-gray-600` / `slate-600`, `text-lg` in hero, `text-sm` in upload zone |

---

## 4. Component Stylings

### Logo / Brand Mark
A distinctive mirrored-icon badge: two `chair` Material Symbols icons face each other symmetrically, divided by a thin white line (`w-[1px] h-6`), inside a `w-10 h-10 rounded-lg` square filled with the current primary color. The wordmark "alt.it" sits alongside in `font-extrabold tracking-tighter lowercase`.

### Navigation Header
- **Position:** Sticky, `z-50`, sits above all content
- **Background:** `bg-white/80 backdrop-blur-md` — frosted glass panel
- **Height:** `h-20` (80px)
- **Border:** Single bottom border in `border-gray-200` / `border-slate-200`
- **Shadow:** Whisper-soft (`shadow-sm`)

### Buttons
- **Primary CTA** ("Upload Image"): Solid primary color fill, white text, `font-bold`, `px-8 py-3 rounded-lg`. On hover: a soft-diffused colored shadow (`hover:shadow-lg hover:shadow-primary/20`).
- **Secondary / Ghost** ("Paste Link"): `bg-primary/10 text-primary` — 10% tint of the primary color as background, full primary as text. On hover: `bg-primary/20`.
- **Pagination / Load More**: White background, `border border-gray-200`, `rounded-lg`, `px-10 py-4`. On hover: softly tinted in primary at 10%.
- **Filter Chip (active)**: Solid primary fill, white text, close icon, no border — clearly selected state.
- **Filter Chip (inactive)**: White background, `border border-gray-200`, `rounded-lg`.
- **Icon Buttons** (notification bell, cart bag): Square `rounded-lg` or circular `rounded-full`, `w-9 h-9` or `w-10 h-10`, resting in `bg-gray-100`. On hover: fills solid with primary color + white icon.

### Upload Drop Zone
- **Shape:** `rounded-2xl` — generously rounded, friendlier than product cards
- **Border:** 2px dashed, primary color at 30% opacity (`border-primary/30`). On hover/drag: full primary opacity border
- **Background:** `bg-white/60 backdrop-blur-sm` — semi-transparent frosted glass
- **Icon:** Large `add_photo_alternate` symbol in a pill-shaped `rounded-full` container at 10% primary tint. On hover, scales up 110% (`group-hover:scale-110`)
- **Internal padding:** `py-20 px-10` — extremely spacious, inviting interaction

### Product Cards
- **Shape:** `rounded-lg` — subtly rounded corners (0.75rem / 12px)
- **Background:** Pure white (`bg-white`)
- **Border:** `border border-gray-100` / `border-slate-200` — barely-there hairline
- **Shadow on hover:** Large diffused cloud shadow (`hover:shadow-xl`) — lifts the card dramatically on interaction
- **Image container:** `aspect-[4/5]` portrait ratio with `overflow-hidden`; image scales to 105% on group hover (`group-hover:scale-105`) with a smooth 500ms ease
- **Favorite button:** Appears only on hover (`opacity-0 group-hover:opacity-100 transition-opacity`), floating over the image at `top-4 right-4`. Circular `rounded-full` pill, white/90 glass background, fills primary on hover.
- **Card body padding:** `p-5`

### Filters / Sort Bar
Separated from results by a `border-b border-gray-200` divider. Filter chips are displayed in a responsive flex-wrap row. A thin `w-[1px] h-6` vertical divider of `bg-gray-300` serves as a visual separator between the "All Filters" button and active filter chips.

### Theme Switcher
- **Lavender theme:** A native `<select>` dropdown in the header right zone, with an inline `palette` icon. Visually minimal, borderless, transparent background.
- **Terracotta & Teal themes:** A more polished hover-reveal dropdown (`group-hover:opacity-100`) with a small color swatch dot beside each theme name. Renders as a glassy card with `bg-white/90 backdrop-blur-sm`, `rounded-lg shadow-lg`.

### Footer
- **Background:** `bg-white/50` — 50% transparent white layered over the dot grid
- **Top border:** `border-t border-gray-200`
- **Padding:** `py-12`
- **Layout:** Flexbox, stacked on mobile, three-column (logo / nav links / social icons) on desktop

---

## 5. Layout Principles

- **Max width:** `max-w-7xl` (≈1280px) centered with `mx-auto`, horizontal padding `px-6` (24px per side) at all breakpoints.
- **Vertical rhythm:** Generous sectional spacing throughout. Hero section has `mb-16` (64px) below it. Filter bar is `pb-8`, separated from results. Product grid uses `gap-8` (32px) gutters.
- **Results grid:** Responsive columns via `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. 32px gap between cards.
- **Upload zone max-width:** Constrained to `max-w-4xl` (≈896px) — narrower than the full page, centering focus on the interaction.
- **Hero copy max-width:** `max-w-2xl` — prevents overly long subtitle lines, maintains readable measure.
- **Whitespace philosophy:** Breathe-first. Content sections use large top margins (footer has `mt-24` = 96px). The app trusts whitespace to communicate premium quality. Nothing feels crowded.
- **Dark mode:** Themes B and C include complete dark mode support via the `dark:` class prefix. The dot grid transitions to dark charcoal dots, backgrounds shift to deep espresso, and card surfaces become `slate-900`. Theme A (Lavender) is light-mode only.
