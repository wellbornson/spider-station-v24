# Implementation Plan

## 1. Setup
- **Framework**: Next.js 14 (App Router) + Tailwind CSS.
- **Cleanup**: Delete default homepage content.
- **Theme**: Enforce Global Dark Mode (#020617).

## 2. Core Dashboard (`app/page.tsx`)
- **State**: `users` array (45 objects).
- **Layout**: CSS Grid `grid-cols-3` with `gap-2`.
- **Components**:
  - `Header`: "CLICK SYSTEM" + "Selected Total".
  - `GridBlock`: Renders a slice of 15 users.
  - `RowInput`: Manual entry fields for Name, In, Out, Amount.

## 3. Interaction Logic
- **Manual Entry**: Inputs update the `users` state directly.
- **Highlighting**: Clicking a row toggles selection style.
- **Summation**: Selected rows' amounts are summed in the Header.

## 4. PWA Integration
- **Manifest**: Configuration for Windows Desktop experience.
