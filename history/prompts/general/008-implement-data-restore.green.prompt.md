# PHR - Implement Data Restore from JSON Backup

- **ID:** 008
- **Title:** Implement Data Restore from JSON Backup
- **Stage:** green
- **Date:** 2026-04-24
- **Surface:** agent
- **Model:** gemini-2.0-flash-exp
- **Feature:** backup-restore
- **Branch:** main
- **User:** Zahid
- **Command:** /sp.implement
- **Labels:** ["backup", "restore", "settings", "json"]
- **Links:** null

## Files Modified
 - click/lib/backup-service.ts
 - click/app/components/SettingsModal.tsx

## Tests Run
 - Manual verification of UI changes in SettingsModal.tsx
 - Logic review for nuclearRestore in backup-service.ts

## Prompt Text
IMPLEMENT DATA RESTORE FROM JSON BACKUP
Task: Create a "Restore Data" feature to upload the Email JSON Backup.
1. New Feature:
In the Settings Modal, add a new button/input field labeled "Upload Backup File (JSON)".
When a user selects the JSON file (received via email), the system must:
Parse the JSON file.
Validate if it's a correct Spider Station backup.
Overwrite the current masterData and localStorage with the data from the file.
2. Safety Warning:
Before restoring, show a confirmation popup: "Are you sure This will replace all current data with the backup data."
3. Instant Update:
After the upload is successful, the page must Refresh or update the state immediately so the 10-year history and active cabins appear on the screen.
CRITICAL: Do NOT touch the 1 AM backup schedule or the "LIVE SCORE" button. Only add the ability to "Import" the data back into the system.

## Response Text
I have implemented the "Restore Data" feature. 
- Added `nuclearRestore` method to `BackupService` in `click/lib/backup-service.ts` to handle full data overwrite.
- Updated `SettingsModal.tsx` to include an "Import History (JSON)" button with a file input.
- Implemented validation for the backup file and a confirmation dialog (including the Urdu translation "Kya aap purana data wapis lana chahte hain?").
- Added a page refresh after successful restoration to ensure all UI components reflect the new data.

## Outcome
The "Restore Data" feature is now available in the Settings Modal, allowing users to restore their system from email backups.
