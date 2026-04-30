# PHR: Forced 240 Row Rendering

## ID: 014
## DATE: 2026-04-18
## STAGE: refactor
## TITLE: Forced Rendering of 240 Rows (Virtualization Removed)
## FEATURE: UI Layout Stabilization

## SUMMARY
Removed the virtual windowing (scroll-based rendering) logic from `renderUserBlock` to ensure all 240 rows are consistently rendered and displayed in the UI. Verified that 120 rows are assigned to the Front section and 120 rows to the Back section.

## ACTIONS
- Modified `click/app/page.tsx`:
    - Removed `ROW_H`, `HEADER_H`, `BUFFER`, `firstVis`, `lastVis`, `visStart`, and `visEnd` calculations from `renderUserBlock`.
    - Replaced `sortedRows.slice(visStart, visEnd).map(...)` with `sortedRows.map(...)` to force render all items.
    - Updated `noteIndex` calculation to use `idx` directly (`(isSection1 ? 0 : 120) + idx`).
    - Removed the conditional "Top spacer" and "Bottom spacer" divs that were used for virtualization.
    - Ensured `totalUsers` and `notes` array defaults are set to `240`.

## VERIFICATION
- The Front section now renders exactly 120 rows (S.No 1-120) regardless of scroll position.
- The Back section now renders exactly 120 rows (S.No 121-240) regardless of scroll position.
- Fixed header and column alignment remain intact.
- Business logic (Timers, Locking, Blinking) and 130% UI scaling are fully preserved.
- No rows are "skipped" or "invisible" during scrolling.
