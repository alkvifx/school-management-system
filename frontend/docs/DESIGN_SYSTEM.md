# School Management System — Design System

**Aesthetic:** Soft Academic Campus — warm, trustworthy, paper-like, premium.

---

## 1. Color Palette

All colors use HSL with space-separated values: `H S% L%`.

| Token | Value | Usage |
|-------|-------|--------|
| `--app-bg` | `42 25% 97%` | Page background (cream) |
| `--app-bg-paper` | `45 30% 99%` | Lighter paper areas |
| `--app-surface` | `0 0% 100%` | Cards, panels |
| `--app-text` | `220 25% 18%` | Primary text |
| `--app-text-muted` | `220 12% 45%` | Secondary text |
| `--app-accent` | `24 70% 45%` | Primary accent (terracotta) |
| `--app-accent-muted` | `24 40% 92%` | Accent backgrounds |
| `--app-sage` | `155 25% 35%` | Secondary accent (sage) |
| `--app-sage-muted` | `155 20% 93%` | Sage backgrounds |
| `--app-border` | `40 15% 90%` | Borders |
| `--app-destructive` | `0 65% 50%` | Errors, destructive actions |

---

## 2. Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Crimson Pro | Headings (h1, h2, section titles) |
| Body | DM Sans | Body text, labels, buttons |

**Scale:**
- `text-xs` — 12px
- `text-sm` — 14px  
- `text-base` — 16px
- `text-lg` — 18px
- `text-xl` — 20px
- `text-2xl` — 24px
- `text-3xl` — 30px

---

## 3. Border Radius & Shadows

| Token | Value | Usage |
|-------|-------|--------|
| `--app-radius` | `0.75rem` | Cards, modals |
| `--app-radius-sm` | `0.5rem` | Buttons, inputs, badges |
| `--app-radius-lg` | `1rem` | Large cards, sections |
| `--app-shadow` | `0 1px 3px hsl(220 20% 85% / 0.4)` | Default cards |
| `--app-shadow-lg` | `0 4px 12px hsl(220 20% 75% / 0.25)` | Elevated panels |

---

## 4. Motion Patterns

**Page Load:** One staggered container — `staggerChildren: 0.06`, `delayChildren: 0.1`  
**Item:** `opacity 0→1`, `y 12→0`  
**Tap:** `scale: 0.98` (buttons, cards)  
**Hover:** Subtle — avoid heavy transforms; prefer color/shadow transitions  

```js
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};
```

---

## 5. Background Treatment

- Never use plain white (`#fff`) for page background.
- Use `app-bg-texture` class: cream gradient + subtle SVG noise overlay.
- Cards use `--app-surface` with `--app-shadow`.

---

## 6. Card Style

- `rounded-[var(--app-radius-lg)]` or `rounded-app-lg`
- `bg-[hsl(var(--app-surface))]`
- `shadow-[var(--app-shadow)]`
- Min tap target: 44px height

---

## 7. Accessibility

- Contrast: Text on background ≥ 4.5:1.
- Tap targets: Min 44×44px on mobile.
- Focus: `ring-2` with `--app-accent` color.
- Font sizes: Body ≥ 14px, labels ≥ 12px.

---

## 8. Applying the Theme

See [APPLYING_THEME.md](./APPLYING_THEME.md) for step-by-step instructions to refactor remaining pages.
