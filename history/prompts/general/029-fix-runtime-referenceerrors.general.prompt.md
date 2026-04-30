---
id: 029
title: Fix Runtime ReferenceErrors in Dashboard and Hisab
stage: general
date: 2026-04-20
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: Zahid
command: fix runtime errors
labels: ["bug-fix", "hoisting", "state-management", "ui-stability"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - click/app/page.tsx
  - click/app/hisab/page.tsx
tests:
  - manual verification of app launch and panel toggles
---

## Prompt

I have two runtime errors after the recent changes. Please fix them immediately:
Error 1: app\page.tsx
Error: ReferenceError: showReportsPanel is not defined at line 2763.
Fix: I am using setShowReportsPanel in the onClick, so the state variable should likely be showReportsPanel. Please ensure const [showReportsPanel, setShowReportsPanel] = useState(false); is defined at the top of the component.
Error 2: app\hisab\page.tsx
Error: ReferenceError: Cannot access 'viewingActiveMonth' before initialization at line 290.
Fix: This is a hoisting issue. You are using viewingActiveMonth inside a useMemo dependency array (line 290) before the variable is actually declared or initialized. Move the declaration of viewingActiveMonth and activeDay above the useMemo blocks that depend on them.
Important: Do not change the logic, just fix the variable definitions and their order so the app can compile and run.

## Response snapshot

Fixed ReferenceErrors in `click/app/page.tsx` and `click/app/hisab/page.tsx` by correcting state placement and resolving hoisting issues. Moved `showReportsPanel` to the top of the dashboard component and moved `viewingActiveMonth` above the `useMemo` blocks in the Hisab page.

## Outcome

- ✅ Impact: Restored application stability and fixed critical runtime crashes.
- 🧪 Tests: Confirmed the app compiles and the reported lines no longer throw ReferenceErrors.
- 📁 Files: Updated click/app/page.tsx and click/app/hisab/page.tsx.
- 🧠 Reflection: Proper ordering of variable declarations relative to hooks (useMemo, useEffect) is essential for avoiding "access before initialization" errors in React functional components.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
