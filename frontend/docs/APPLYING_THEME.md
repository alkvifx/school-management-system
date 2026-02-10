# Applying the Design System to Remaining Pages

Follow these patterns to make any page match the unified Soft Academic Campus theme.

---

## 1. Page Background

Replace any plain white or gray background with the textured background:

```jsx
<div className="app-bg-texture min-h-screen">
  {/* content */}
</div>
```

---

## 2. Typography

- **Headings (h1, h2, section titles):** Use the display font:
  ```jsx
  <h1 style={{ fontFamily: 'var(--app-display)' }} className="text-[hsl(var(--app-text))]">
    Title
  </h1>
  ```

- **Body text:** Inherits `var(--app-body)` from body, or use:
  ```jsx
  <p className="text-[hsl(var(--app-text))]">...</p>
  <p className="text-[hsl(var(--app-text-muted))]">Secondary text</p>
  ```

---

## 3. Cards & Surfaces

Use the shared `Card` component, or manually:

```jsx
<div
  className="rounded-[var(--app-radius-lg)] p-4 shadow-[var(--app-shadow)]"
  style={{
    backgroundColor: 'hsl(var(--app-surface))',
    border: '1px solid hsl(var(--app-border))',
  }}
>
  ...
</div>
```

---

## 4. Buttons & Links

- **Primary:** `Button` uses `--app-accent` automatically.
- **Links:** `text-[hsl(var(--app-accent))] hover:underline`

---

## 5. Hero / Accent Blocks

Replace blue/indigo/purple gradients with the accent color:

```jsx
<div
  className="rounded-[var(--app-radius-lg)] p-6 text-white shadow-[var(--app-shadow-lg)]"
  style={{ backgroundColor: 'hsl(var(--app-accent))' }}
>
  ...
</div>
```

---

## 6. Motion

Use shared variants from `@/src/lib/motion`:

```jsx
import { containerVariants, itemVariants, tapScale } from '@/src/lib/motion';

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.section variants={itemVariants}>...</motion.section>
</motion.div>

// For buttons/cards:
<motion.button whileTap={tapScale}>...</motion.button>
```

---

## 7. Color Replacements Checklist

| Old                         | New                               |
|-----------------------------|-----------------------------------|
| `bg-white`                  | `bg-[hsl(var(--app-surface))]`    |
| `bg-gray-50`                | `app-bg-texture` on wrapper       |
| `text-gray-900`             | `text-[hsl(var(--app-text))]`     |
| `text-gray-500`             | `text-[hsl(var(--app-text-muted))]` |
| `text-blue-600`             | `text-[hsl(var(--app-accent))]`   |
| `border-gray-200`           | `border-[hsl(var(--app-border))]` |
| `rounded-2xl`               | `rounded-[var(--app-radius-lg)]`  |
| `rounded-xl`                | `rounded-[var(--app-radius)]`     |
| `rounded-lg`                | `rounded-[var(--app-radius-sm)]`  |
| Blue/purple gradients       | `backgroundColor: 'hsl(var(--app-accent))'` |

---

## 8. Components to Update

- **DashboardCard, StatCard:** Use `--app-*` tokens instead of hardcoded blue/gray.
- **Dialog, Sheet, Modal:** Ensure `--app-surface`, `--app-border`, `--app-shadow`.
- **Chat (MessageBubble, ChatLayout):** Use `--app-surface`, `--app-accent-muted` for bubbles.
- **Gallery:** Use `app-bg-texture` and card styles.
- **Settings page:** Same card/input patterns as Login.

---

## 9. Quick Refactor Order

1. Auth pages: forgot-password, reset-password, verify-email  
2. Principal notices create modal  
3. Chat UI components  
4. Gallery page  
5. Super-admin dashboard  
6. Remaining list/detail pages
