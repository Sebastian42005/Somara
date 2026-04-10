# 🤖 AGENTS.md – Codex Instructions for Yoga Studio Angular Project

## 🧘 Project Context
This is an Angular project for a **premium yoga studio**.

The application must feel:
- elegant
- calm
- modern
- high-quality

Avoid anything that looks:
- cheap
- overly generic
- cluttered

---

## 🎯 Core Responsibilities
When generating or modifying code, you MUST:

1. Follow all design and coding rules defined below
2. Prefer consistency over creativity
3. Reuse existing styles and patterns
4. Keep code clean, modular, and maintainable

---

## 🎨 Styling Rules

### Global First Strategy
- ALWAYS check `globals.scss` before adding new styles
- REUSE existing styles whenever possible

### Theme System
- All colors MUST be defined in `theme.scss`
- NEVER introduce raw colors directly in components

#### ❌ Forbidden:
- inline hex colors (`#fff`)
- Tailwind arbitrary colors (`bg-[#123456]`)
- color-mix or similar hacks

#### ✅ Required:
- define color in `theme.scss`
- then use it via Tailwind or classes

---

## 💨 Tailwind Usage

### Primary Styling Method
- Use **TailwindCSS as main styling approach**
- SCSS should be minimal

### Rules
- Prefer utility classes
- Keep class lists readable
- Avoid unnecessary abstraction

---

## 🎨 Color Usage

Allowed:
- `primary`
- `text`
- `secondary` (optional)

Avoid:
- random colors
- too many variations
- strong contrast unless intentional

---

## 🧱 Angular Component Rules (STRICT)

Each component MUST have:

- `.ts`
- `.html`
- optional `.scss`

### ❌ NEVER:
- inline HTML templates inside `.ts`

### ✅ ALWAYS:
- separate template and logic

---

## 🧼 Code Quality

- Use descriptive variable names
- Keep components small
- Separate logic from UI
- Avoid duplication

---

## 🧘 UI / UX Principles

- calm and balanced layout
- lots of whitespace
- smooth, subtle animations
- clear hierarchy

### ❌ Avoid:
- aggressive animations
- crowded UI
- inconsistent spacing

---

## 📌 Decision Rules

If unsure:

1. Reuse existing styles
2. Keep it minimal
3. Prefer elegance over complexity
4. Define new values centrally (`theme.scss`)

---

## ⚠️ Priority Order

1. This file (`AGENTS.md`)
2. Existing project structure
3. Angular best practices

---
