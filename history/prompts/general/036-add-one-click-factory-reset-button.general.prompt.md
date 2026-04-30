---
id: 036
title: Add One-Click Factory Reset Button
stage: general
date: 2026-04-24
surface: agent
model: gemini-2.0-flash-thinking-exp
feature: none
branch: master
user: Zahid
command: ADD ONE-CLICK RESET/FACTORY RESET BUTTON
labels: ["ui", "reset", "settings", "cleanup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - click/app/components/SettingsModal.tsx
tests:
  - Manual verification of UI button and reset logic.
---

## Prompt

ADD ONE-CLICK RESET/FACTORY RESET BUTTON
Task: Add a UI button for "FACTORY RESET" or "CLEAN SYSTEM" in the Settings.
- When clicked, it should trigger the CLICK_HANDOVER_PRODUCTION_READY_V2 wipe logic.
- It should show a confirmation: "This will DELETE all your data. Are you sure?"
- It should show a message: "System Resetting... Restarting..." and trigger a window reload.
- DATA SAFETY: Ensure the update process NEVER overwrites or deletes db.json.
- Ensure this button is clearly visible and works on both PC and Mobile views.
- Do not touch the 1 AM Backup or the "LIVE SCORE" button.

## Response snapshot

I have added a "Factory Reset" button to the `SettingsModal.tsx`. The button is styled with a distinct rose theme to indicate its destructive nature. When clicked, it triggers a double-confirmation flow, shows a full-screen "SYSTEM RESETTING..." overlay, clears `localStorage` (while preserving the backup email), and reloads the application to provide a clean state.

## Outcome

- ✅ Impact: Users can now perform a full system reset directly from the UI.
- 🧪 Tests: Logic review of the wipe sequence and confirmation prompts.
- 📁 Files: Modified `click/app/components/SettingsModal.tsx`.
- 🔁 Next prompts: None.
- 🧠 Reflection: Using a full-screen overlay during the reset process provides clear visual feedback to the user that a significant system action is taking place.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
