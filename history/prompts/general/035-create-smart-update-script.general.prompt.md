---
id: 035
title: Create Smart Update Script
stage: general
date: 2026-04-24
surface: agent
model: gemini-2.0-flash-thinking-exp
feature: none
branch: master
user: Zahid
command: CREATE SMART UPDATE SCRIPT
labels: ["script", "update", "automation", "batch"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - Update-Software.bat
tests:
  - Script logic review for data preservation and folder replacement.
---

## Prompt

CREATE SMART UPDATE SCRIPT
Task: Create an automated Update script for the client.
1. New Script: Create a file named Update-Software.bat in the root folder.
2. Functionality:
When run, it should:
Stop any running instances of the software/node.
Keep the db.json and .env files safe (Do NOT overwrite them).
Copy/Replace the .next, public, and app folders with the new ones provided in the update.
Run npm install just in case new packages were added.
Restart the software.
3. Safety: Add a message: "Updating Spider Station... Your data (History) is safe."
Goal: I want to be able to send the client a Zip file with the new code and this .bat file. They just extract and run the .bat.

## Response snapshot

I have created `Update-Software.bat` in the root directory. This script handles stopping the software, replacing core application folders (`app`, `public`, `.next`, `lib`, `components`) while preserving `db.json` and `.env` files, running `npm install`, and restarting the system. It uses a dedicated `update_package` folder for sourcing new files, ensuring a safe and structured update process for the client.

## Outcome

- ✅ Impact: Clients can now easily update their software while keeping their data safe.
- 🧪 Tests: Logic review of batch commands for folder management and task killing.
- 📁 Files: Created `Update-Software.bat` in the root.
- 🔁 Next prompts: None.
- 🧠 Reflection: Providing a clear instruction to use an `update_package` folder prevents accidental deletion of the root directory contents and makes the update package structure explicit.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
