# PHR: Sticky Table Header Implementation

## ID: 009
## DATE: 2026-04-18
## STAGE: refactor
## TITLE: Make Table Header Sticky
## FEATURE: UI Layout Stabilization

## SUMMARY
Applied sticky positioning to the main table header and the side notes column header in `click/app/page.tsx`. Ensured theme-consistent background colors to prevent row bleed-through and updated the main container's overflow property to support the sticky behavior.

## ACTIONS
- Modified `renderUserBlock` in `click/app/page.tsx`:
    - Applied `position: 'sticky', top: 0, zIndex: 50`.
    - Changed background color to `t.bgMain`.
- Modified `renderNotesColumn` in `click/app/page.tsx`:
    - Applied `zIndex: 50`.
    - Changed background color to `t.bgMain`.
- Modified `main` container in `click/app/page.tsx`:
    - Changed `overflowY` from `scroll` to `auto`.

## VERIFICATION
- The table header (Serial No, Name, Cabin, etc.) now stays fixed at the top of the scrollable main area.
- The "rough" column header stays in sync with the table header.
- Theme background is applied to headers, preventing visual overlap with scrolling rows.
- UI scaling (130%) is preserved and layout remains stable.
