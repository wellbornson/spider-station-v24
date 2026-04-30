<!--
Sync Impact Report:
- Version change: 2.0.0 → 2.1.0 (Minor: Explicit rejection of Documentation/Docusaurus, refinement of functional inputs)
- Modified Principles:
  - V. Code-Only Mandate (Replaces Functionality First to explicitly forbid Docusaurus)
- Templates requiring updates:
  - specs/master/plan.md (✅ updated)
  - app/page.tsx (✅ updated)
-->

# Click-Cafe-OS Constitution

## Core Principles

### I. High-Density Layout (The 3-Block Rule)
The screen MUST be divided into **3 equal vertical columns**. The layout MUST display exactly 45 rows total, split into 3 sets of 15 rows. Each row must strictly follow the column structure: **[ No. | Name | Time In | Time Out | Amount ]**.

### II. Visual Efficiency
The interface utilizes a "Deep Dark Blue" (#020617) background with "Neon Cyan" accents ("Yammy" UI). The top-left header MUST display "CLICK SYSTEM".

### III. Logic-Driven
Single Source of Truth: Data exists as a single array sliced into 3 views. Interaction includes **Manual Entry** inputs directly in the grid and **Click-to-Highlight** functionality where selected rows sum up in the header.

### IV. Integrated Intelligence
AI is a first-class citizen, embedded via the "Click Intelligence" agent to assist operations.

### V. Code-Only Mandate
**DO NOT INSTALL DOCUSAURUS.** The project is a pure Next.js 14 application. No external documentation sites or landing pages.

## Technology Stack

- **Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS.
- **Theme**: Dark Mode (#020617 Background, Cyan Text).
- **Platform**: Windows 10 PWA.

## Governance

This constitution supersedes all other practices. Amendments require documentation and approval. All code changes must verify compliance with High-Density 3-Block Layout and Visual Efficiency principles.

**Version**: 2.1.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01