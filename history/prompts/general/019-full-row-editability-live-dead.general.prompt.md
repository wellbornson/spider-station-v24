---
id: 019
title: Full Row Editability (Live = Open | Dead = Locked)
stage: general
date_iso: 2026-04-17
surface: agent
model: gemini-2.0-flash-thinking-exp-1218
feature: none
branch: main
user: Zahid
command: Full Row Editability (Live = Open | Dead = Locked)
labels: ["ui", "editability", "conditional-locking", "table-rows"]
links: null
files_yaml:
  - click/app/page.tsx
tests_yaml:
  - Verified that rows remain editable when name and amount are filled but time is not up.
  - Verified that rows freeze (readOnly/disabled) instantly when time expires and isLocked is true.
---

# Prompt History Record - 019

## Objective
Ensure that every field in a row is fully editable during its LIVE state and instantly freezes once the task time is completed (DEAD state).

## Prompt Text
Modify the table rows so that all fields (Name, Cabin, Rough, Amount) are 100% editable while the row is LIVE. The entire row must freeze (read-only) the moment the task time expires and the row becomes DEAD. Do not touch any other application logic or scaling features.

## Response Text
Updated `click/app/page.tsx` to implement conditional row locking:
1.  **Input Locking**: Updated `Name`, `Cabin Number`, `Time In`, `Time Out`, `Amount`, and `Rough Note` inputs to use `disabled={isLockedByTimeout}` and `readOnly={isLockedByTimeout}`.
2.  **Bypass Commitment Lock**: Removed `isEntryLocked` (which was triggered by filling Name and Amount) from the `disabled` and `readOnly` conditions to ensure 100% editability while the row is LIVE.
3.  **Visual Cleanup**: Updated `rowClass` and input `className` logic to remove "locked" visual styles (backgrounds, dimmed text, `cursor-not-allowed`) unless `isLockedByTimeout` is true.
4.  **Preservation**: Maintained all existing logic for Timeouts, Row Blinking, UI Scaling, and AI Munshi positioning.

## Outcome
Rows are now fully interactive while time is remaining and correctly transition to a frozen state the moment time expires.
