# Design Brief

**Theme:** Light mode (white background, institutional professional). Dark mode uses slate foundation with purple/cyan accents.

**Tone:** Institutional professional. Trustworthy, purposeful, efficient admin tool. Think education tech (Canvas) meets clean SaaS (Stripe).

**Primary Palette:**
| Token | Light OKLCH | Dark OKLCH | Usage |
|-------|-------------|-----------|-------|
| Primary | 0.52 0.08 261 | 0.68 0.12 261 | CTA buttons, navigation, links |
| Secondary | 0.93 0.02 261 | 0.24 0.01 261 | Dividers, subtle backgrounds |
| Accent | 0.72 0.13 142 | 0.78 0.15 142 | Highlights, status indicators |
| Success | 0.65 0.12 145 | 0.72 0.14 145 | Attendance present, fee paid |
| Warning | 0.75 0.15 65 | 0.78 0.16 65 | Pending actions, alerts |
| Destructive | 0.55 0.22 25 | 0.65 0.19 22 | Danger, delete, overdue fees |

**Typography:** DM Sans 400/700 (display/headers), General Sans 400/700 (body), Geist Mono 400/700 (codes/IDs). Hierarchy via size and weight.

**Structural Zones:**
| Zone | Treatment | Purpose |
|------|-----------|---------|
| Header | `bg-card` + `border-b` | Top navigation, school branding, user menu |
| Sidebar | `bg-sidebar` + `border-r` | Navigation menu, persistent across pages |
| Main content | `bg-background` | Full page width, scrollable |
| Stat cards | `bg-card` + `border` + `shadow-card` | Dashboard overview, KPI display |
| Data tables | Alternating `bg-background/muted`, row hover | Scannability, class/student data |
| Forms | `bg-card` + `border` | Student edit, fee setup, settings |
| Print layout | White background, no nav chrome, `max-w-4xl` center | Fee receipts, attendance reports |

**Spacing:** 8px base unit. Cards `p-6`, form `gap-4`, section `space-y-6`. Print media max-width 4xl centered.

**Components:** Table-first design. Cards use soft shadows and left border accent (primary). Buttons: primary solid purple, secondary outline, success green, warning yellow, destructive red. Status badges with colored background + foreground. Admin controls consistently accessible.

**Print:** `.no-print` class hides navigation, footer, buttons. `@media print` sets white background, black text, removes margins/padding from nav elements.

**Special states:** Attendance toggles (present/absent) use success/destructive badges. Fee status shows paid (green), pending (yellow), overdue (red). Student cards highlight by class color.

**Differentiation:** Minimal institutional aesthetic focused on data clarity. Subtle shadows and borders create visual layers without decoration. Consistent use of status colors (green/yellow/red) across attendance, fees, and student status. Print-friendly design preserves all data without chrome.
