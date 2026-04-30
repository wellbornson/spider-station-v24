# PHR: Expand Rows to 120 per Section

## ID: 013
## DATE: 2026-04-18
## STAGE: refactor
## TITLE: Expand Row Count to 240 (120 per Section)
## FEATURE: UI Layout Stabilization

## SUMMARY
Increased the total row count from 300 to 240, split into two equal sections of 120 rows (Front and Back). Updated all background logic, data initialization, slicing, and UI components to reflect this new capacity while preserving existing features and scaling.

## ACTIONS
- Modified `click/app/page.tsx`:
    - Updated `TOTAL_SLOTS` and `TOTAL_ROW_CAPACITY` to `240`.
    - Updated `getCurrentData` to initialize `notes` and `users` grid with 240 slots.
    - Updated `renderUserBlock` and `renderNotesColumn` to handle 240 rows.
    - Reconfigured section splitting logic to 120 rows per block (Front: 1-120, Back: 121-240).
    - Updated `addUserRow` and total calculation slicing logic to use the 120/240 boundaries.
    - Updated UI labels (e.g., "Max 240 Rows") and code comments.
    - Increased `zIndex` for `renderPoliceModal` (1200), Cafe Panel (1100), and Reports Panel (1100) to ensure they remain interactive over the fixed table header (1001).

## VERIFICATION
- Front Section correctly displays rows 1 through 120.
- Back Section correctly displays rows 121 through 240.
- Scroll behavior handles 240 rows smoothly.
- Data persistence (notes, user entries) is maintained across the new 240-row structure.
- All UI elements (modals, side panels) remain visible and functional over the fixed header.
- 130% UI scaling and all business logic (Timers, Blinking, Amounts) are preserved.
