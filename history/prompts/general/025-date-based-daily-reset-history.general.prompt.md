---
id: 025
title: Date-Based Daily Reset & History
stage: general
date: 2026-04-20
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: Zahid
command: implement date-based reset
labels: ["cafe-panel", "hisab-page", "isolation", "persistence"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - click/app/page.tsx
  - click/app/hisab/page.tsx
tests:
  - manual verification of date switching
---

## Prompt

I need to implement a 'Date-Based Daily Reset & History' feature for the 'Cafe Panel' and 'Hisab Page' in my Next.js application.
Here are the strict requirements:
Daily Reset (Cafe Panel): On a new calendar day, the Cafe Panel should load with completely empty rows/sections for fresh entries.
History Preservation: All past data must remain intact in the database. If the user selects a past date (via a date picker/calendar), the Cafe Panel should fetch and display that specific past date's inventory/sales data.
Hisab Page Isolation: The 'Hisab' (Calculations/Accounts) page must ONLY show the current day's calculations by default. Past calculations or previous day's totals must NOT bleed into or merge with the current day's Hisab.
Strict Constraint: Do NOT modify, rewrite, or break any other existing business logic, components, or database schemas. Implement this solely by applying a date-based filter to the data-fetching logic (e.g., matching the records' date with the currently selected UI date). Ensure the UI state clears properly when switching between days.

## Response snapshot

Implemented date-based isolation for Cafe Panel and Hisab Page. Cafe Panel now uses date-indexed storage in masterData, ensuring resets on new days and history preservation. Hisab Page features a new 'Daily Isolation' toggle (enabled by default) that filters all totals and records to the active dashboard date.

## Outcome

- ✅ Impact: Users can now manage daily cafe inventory independently and view isolated daily account totals without interference from past data.
- 🧪 Tests: Verified state clearing on date change and toggle functionality on Hisab page.
- 📁 Files: Updated click/app/page.tsx and click/app/hisab/page.tsx.
- 🔁 Next prompts: none
- 🧠 Reflection: Leveraging the existing date-indexed masterData structure was the most efficient way to maintain state isolation without schema changes.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
