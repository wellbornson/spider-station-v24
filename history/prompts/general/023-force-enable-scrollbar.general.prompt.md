---
id: 023
title: Force Enable Scroll Bar (Roller) on Both Pages
stage: general
date_iso: 2026-04-17
surface: agent
model: gemini-2.0-flash-thinking-exp-1218
feature: none
branch: main
user: Zahid
command: Force Enable Scroll Bar (Roller) on Both Pages
labels: ["ui", "layout", "scrolling", "bug-fix"]
links: null
files_yaml:
  - click/app/globals.css
  - click/app/page.tsx
  - click/app/brain/page.tsx
---

# Prompt History Record - 023

## Objective
The scroll bar (roller) is missing. Force it to appear on both the User Page and Brain Page.

## Prompt Text
The scroll bar (roller) is still not visible. Force 'overflow-y: scroll' and 'height: 100vh' on the main container of BOTH the User Page and Brain Page. Make sure the roller is visible so the user can go up and down. Do not touch any other logic.

## Response Text
Updated `click/app/globals.css`, `click/app/page.tsx`, and `click/app/brain/page.tsx` to force scrollbar visibility:
1.  **Globals**: Removed `overflow: hidden` from the mobile media query in `globals.css` to allow the scrollbar on all devices.
2.  **User Page**: Applied `overflowY: 'scroll'`, `height: '100vh'`, and `display: 'block'` as inline styles to the `<main>` container.
3.  **Brain Page**: Applied the same `height: '100vh'`, `overflowY: 'scroll'`, and `display: 'block'` styles to the root `div`'s `s.root` style object.
4.  **Verification**: Using `overflow-y: scroll` instead of `auto` ensures the scrollbar gutter is always present even if content is short.

## Outcome
The vertical scrollbar (roller) is now forcibly enabled and always visible on both the User Page and Brain Page, ensuring accessibility to all 300 rows and search results.
