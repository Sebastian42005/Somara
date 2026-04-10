# 🧠 SKILLS.md – Reusable Codex Skills

## 🎨 Skill: Premium UI Design

### Goal
Create elegant, modern, and calm UI components.

### Rules
- Use whitespace intentionally
- Prefer soft layouts
- Keep visual hierarchy clear
- Avoid clutter

---

## 💨 Skill: Tailwind Best Practices

### Use:
- utility-first approach
- consistent spacing (`p-`, `m-`, `gap-`)
- flex/grid layouts

### Avoid:
- arbitrary values
- inline styles
- overly long class chains

---

## 🎨 Skill: Theme-Driven Styling

### Rules
- colors come ONLY from `theme.scss`
- no direct color usage in components

### Workflow
1. Define color in `theme.scss`
2. Use it via Tailwind or classes

---

## 🧱 Skill: Angular Component Architecture

### Structure
Each component:
- `.ts` → logic
- `.html` → template
- `.scss` → optional styling

### Principles
- separation of concerns
- reusable components
- no inline templates

---

## 🧼 Skill: Clean Code

- descriptive naming
- small functions
- readable structure
- no unnecessary complexity

---

## 🧘 Skill: UX Calmness

### Focus
- smooth transitions
- balanced layout
- minimal distractions

### Avoid
- harsh animations
- too many elements
- inconsistent spacing

---

## 🔁 Skill: Reuse First

Before creating anything new:
1. Check existing components
2. Check `globals.scss`
3. Check `theme.scss`

Only create new if necessary.

---
