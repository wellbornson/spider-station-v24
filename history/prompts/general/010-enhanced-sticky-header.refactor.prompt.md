# PHR: Enhanced Sticky Table Header

## ID: 010
## DATE: 2026-04-18
## STAGE: refactor
## TITLE: Enhanced Sticky Table Header with Box Shadow and High Z-Index
## FEATURE: UI Layout Stabilization

## SUMMARY
Improved the sticky table header implementation in `click/app/page.tsx` to prevent it from disappearing or appearing transparent during scrolling. Increased the z-index to 100 and added a subtle box shadow for better depth and visibility.

## ACTIONS
- Modified `renderUserBlock` in `click/app/page.tsx`:
    - Increased `zIndex` to `100`.
    - Added `boxShadow: '0 2px 4px rgba(0,0,0,0.1)'`.
- Modified `renderNotesColumn` in `click/app/page.tsx`:
    - Increased `zIndex` to `100`.
    - (Already using `t.bgMain` for solid background).

## VERIFICATION
- The table header remains visible and opaque while scrolling through 300 rows.
- The `zIndex: 100` ensures it stays above all row content.
- The `boxShadow` provides a clear visual break between the fixed header and moving rows.
- Theme-consistent background prevents "bleeding" of row text through the header.
- UI scaling (130%) and business logic (Sort, Blinking, Lock) are unaffected.
