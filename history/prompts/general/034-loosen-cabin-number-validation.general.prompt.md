---
id: 034
title: loosen-cabin-number-validation
stage: general
date_iso: 2026-04-24
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: Zahid
command: /sp.implement
labels: ["bug-fix", "validation", "ux-improvement"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - click/app/page.tsx
tests_yaml:
  - manual verification of multi-digit input
---

# Prompt History Record - Loosen Cabin Number Validation

## Prompt Text
🚨 PROMPT: FIX CABIN NUMBER INPUT VALIDATION
Problem: In both Section 1 and Section 2, the system prevents me from typing cabin numbers like 11, 12, 13, 15 if cabin 1 is already live. Similarly, I can't type 22 if cabin 2 is live. This is because the validation triggers immediately on the first digit.
Task:
Loosen Input Validation: Modify the onChange logic for the Cabin Number input field. Do NOT block the user while they are typing.
Allow Partial Matches: Allow the user to type digits like '1' even if '1' is already active, so they can complete the number to '15' or '11'.
Smart Duplicate Check: Only show the "Cabin already active" error if the final full number (e.g., 1) matches an active cabin. Do NOT block the initial keystroke.
Apply to Both Sections: Implement this fix for the input fields in both Section 1 and Section 2.
Logic Update: > - Instead of if (activeCabins.includes(inputValue)) return; inside the input, move the duplicate check to the Submit/Add button function OR only trigger it if the length of the input matches exactly.
STRICT CONSTRAINT: Do NOT change the UI layout, colors, or any other financial logic. Only fix the cabin number input validation to allow typing multi-digit numbers.

## Response Text
I have loosened the Cabin Number input validation in `click/app/page.tsx`. The duplicate check now triggers a visual alert (red flashing border) but no longer returns early or blocks the keystroke. This allows users to type multi-digit numbers like '11' or '15' even if a cabin with a matching first digit (like '1') is currently active.

## Outcome
Users can now type multi-digit cabin numbers without being blocked by partial matches of active cabins. The duplicate validation remains as a visual warning without interrupting the input flow.
