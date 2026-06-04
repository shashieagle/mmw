---
name: FireOrb cursor
description: Canvas comet tail cursor effect — how to enable/disable it
---

The FireOrb is a canvas-based comet tail cursor effect in `artifacts/portfolio/src/components/FireOrb.tsx`.

**Current state:** Disabled on all devices.

**To re-enable:** In `artifacts/portfolio/src/App.tsx`, change:
```tsx
{false && <FireOrb />}
```
back to:
```tsx
<FireOrb />
```

**Why disabled:** User removed it from desktop (it was already disabled on touch/mobile devices via `window.matchMedia("(pointer: coarse)")`).

**How to apply:** When the user says "bring back FireOrb", make the above change in App.tsx.
