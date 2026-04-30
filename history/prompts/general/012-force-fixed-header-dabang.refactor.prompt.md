# PHR: Force Fixed Table Header (Dabang Method)

## ID: 012
## DATE: 2026-04-18
## STAGE: refactor
## TITLE: Implementation of Fixed Header with Container Padding
## FEATURE: UI Layout Stabilization

## SUMMARY
Abandoned `position: sticky` in favor of `position: fixed` for the main table header and notes column header to ensure they remain locked at the top of the viewport regardless of parent nesting or overflow issues.

## ACTIONS
- Modified `click/app/page.tsx`:
    - Updated `renderUserBlock` header container:
        - Switched to `position: 'fixed'`.
        - Applied `top: 0`, `left: 0`, `width: '100%'`, `zIndex: 1001`.
        - Set fixed `height: '38px'`.
        - Added `borderBottom: '2px solid ${t.border}'`.
    - Added `paddingTop: '38px'` to the rows wrapper div in `renderUserBlock` to prevent the fixed header from obscuring the first row.
    - Updated `renderNotesColumn` header:
        - Switched to `position: 'fixed'`.
        - (Notes column rows already have vertical alignment with main rows).

## VERIFICATION
- The table header remains perfectly stationary at the top of the viewport during all scroll actions.
- `zIndex: 1001` ensures it stays above every other element in the scrolling list.
- The 38px padding on the rows container correctly offsets the first row.
- The 130% UI scaling behaves correctly with the fixed positioning (scales relative to the transformed parent).
- Business logic (blinking, row locking, etc.) is fully preserved.
