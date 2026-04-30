'use client';

// Orange Tech Theme — SPIDER STATION loading screen
// Pure CSS animations, zero JS timers. Fades out at ~2.1s for smooth dashboard reveal.

import React from 'react';

export default function Loading() {
  return (
    <div className="ld-root" style={s.root}>
      <style>{css}</style>

      {/* Subtle dot-grid background */}
      <div style={s.gridBg} aria-hidden="true" />

      {/* Glowing orange border frame */}
      <div className="ld-frame" style={s.frame} aria-hidden="true" />

      {/* Center card */}
      <div style={s.card}>

        {/* BrainCircuit / Neural icon — SVG, no external dep */}
        <div className="ld-icon-pulse" style={s.iconWrap} aria-hidden="true">
          <svg viewBox="0 0 24 24" style={s.icon} fill="none"
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
            <path d="M9 13a4.5 4.5 0 0 0 3-4"/>
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
            <path d="M6 18a4 4 0 0 1-1.967-.516"/>
            <path d="M12 13h4"/>
            <path d="M12 18h6a2 2 0 0 1 2 2v1"/>
            <path d="M12 8h8"/>
            <path d="M16 8V5a2 2 0 0 1 2-2"/>
            <circle cx="16" cy="13" r=".5" fill="currentColor"/>
            <circle cx="18" cy="3"  r=".5" fill="currentColor"/>
            <circle cx="20" cy="21" r=".5" fill="currentColor"/>
            <circle cx="20" cy="8"  r=".5" fill="currentColor"/>
          </svg>
        </div>

        {/* Main title — gradient orange→amber */}
        <h1 className="ld-title" style={s.title}>SYSTEM INITIALIZING</h1>
        <p style={s.edition}>[Zahid ImAm Edition]</p>

        {/* Divider */}
        <div style={s.divider} />

        {/* Progress bar — fills in 2s */}
        <div style={s.barTrack} role="progressbar" aria-label="System initializing">
          <div className="ld-bar-fill" style={s.barFill} />
          <div className="ld-bar-glow" style={s.barGlow} />
        </div>

        {/* Step label + percentage */}
        <div style={s.metaRow}>
          <span className="ld-step" style={s.stepText} />
          <span className="ld-pct"  style={s.pct} />
        </div>

        {/* "READY" fades in after bar completes */}
        <p className="ld-ready" style={s.ready}>&#9646; READY &#9646;</p>
      </div>

      {/* Bottom brand */}
      <p style={s.brand}>CLICK CAFE OS &nbsp;·&nbsp; SPIDER STATION &nbsp;·&nbsp; v1.0</p>
    </div>
  );
}

// ── Palette ───────────────────────────────────────────────────────────────────
const O400  = '#fb923c';          // orange-400
const O500  = '#f97316';          // orange-500
const O600  = '#ea580c';          // orange-600
const AMBER = '#fbbf24';          // amber-400
const GLOW  = 'rgba(249,115,22,0.35)';
const GLOW2 = 'rgba(249,115,22,0.12)';

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed', inset: 0,
    background: '#09090b',          // zinc-950
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    overflow: 'hidden', zIndex: 9999,
  },
  gridBg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
  },
  frame: {
    position: 'absolute', inset: 12, borderRadius: 8,
    border: `1px solid ${O500}`,
    pointerEvents: 'none',
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '100%', maxWidth: 440, padding: '0 32px', zIndex: 1,
  },
  iconWrap: {
    width: 72, height: 72, marginBottom: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: O400,
    filter: `drop-shadow(0 0 16px ${GLOW})`,
  },
  icon: { width: 72, height: 72 },
  title: {
    margin: 0,
    fontSize: 'clamp(20px, 3.5vw, 30px)',
    fontWeight: 900,
    letterSpacing: '0.18em',
    // gradient via className — see CSS block
    textShadow: 'none',
    lineHeight: 1.1,
    textAlign: 'center',
  },
  edition: {
    color: `rgba(251,146,60,0.55)`,
    fontSize: 11, letterSpacing: '0.25em',
    margin: '7px 0 0', fontWeight: 500,
    textTransform: 'uppercase',
  },
  divider: {
    width: 80, height: 1,
    background: `linear-gradient(90deg, transparent, ${O500}, transparent)`,
    margin: '20px 0 22px', opacity: 0.7,
  },
  barTrack: {
    position: 'relative', width: '100%', height: 6,
    background: 'rgba(249,115,22,0.1)',
    borderRadius: 4, overflow: 'visible',
    marginBottom: 10,
    border: `1px solid rgba(249,115,22,0.2)`,
  },
  barFill: {
    position: 'absolute', left: 0, top: 0,
    height: '100%', width: 0, borderRadius: 4,
    background: `linear-gradient(90deg, ${O600}, ${O400}, ${AMBER})`,
  },
  barGlow: {
    position: 'absolute', left: 0, top: -4,
    height: 14, width: 0, borderRadius: 4,
    background: `linear-gradient(90deg, transparent 60%, ${GLOW})`,
    filter: 'blur(4px)', pointerEvents: 'none',
  },
  metaRow: {
    display: 'flex', justifyContent: 'space-between',
    width: '100%', marginBottom: 18,
  },
  stepText: {
    color: 'rgba(251,146,60,0.6)',
    fontSize: 10, letterSpacing: '0.1em', fontWeight: 500,
  },
  pct: {
    color: O400, fontSize: 11,
    fontWeight: 700, letterSpacing: '0.05em',
    fontVariantNumeric: 'tabular-nums',
  },
  ready: {
    color: AMBER,
    fontSize: 11, letterSpacing: '0.35em',
    fontWeight: 700, margin: 0, opacity: 0,
    textTransform: 'uppercase',
  },
  brand: {
    position: 'absolute', bottom: 22,
    color: 'rgba(249,115,22,0.2)',
    fontSize: 9, letterSpacing: '0.25em', margin: 0,
    fontWeight: 500, textTransform: 'uppercase',
  },
};

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const css = `
/* ── Title gradient ── */
.ld-title {
  background: linear-gradient(90deg, #fb923c, #fbbf24, #fb923c);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ld-shimmer 3s linear infinite;
}

/* ── Frame glow pulse ── */
@keyframes ld-frame-glow {
  0%, 100% { box-shadow: 0 0 18px rgba(249,115,22,0.25), inset 0 0 18px rgba(249,115,22,0.04); }
  50%       { box-shadow: 0 0 32px rgba(249,115,22,0.5),  inset 0 0 28px rgba(249,115,22,0.08); }
}
.ld-frame { animation: ld-frame-glow 2.5s ease-in-out infinite; }

/* ── Icon pulse ── */
@keyframes ld-pulse {
  0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 12px rgba(249,115,22,0.4)); }
  50%       { transform: scale(1.08); filter: drop-shadow(0 0 24px rgba(249,115,22,0.75)); }
}
.ld-icon-pulse { animation: ld-pulse 1.8s ease-in-out infinite; }

/* ── Title shimmer ── */
@keyframes ld-shimmer { to { background-position: 200% center; } }

/* ── Bar fills 0→99% in 2s ── */
@keyframes ld-fill { from { width: 0% } to { width: 99% } }
.ld-bar-fill { animation: ld-fill 2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
.ld-bar-glow { animation: ld-fill 2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }

/* ── Step text ── */
.ld-step::after {
  content: "Booting core modules...";
  animation: ld-steps 2s steps(1, end) forwards;
}
@keyframes ld-steps {
  0%   { content: "Booting core modules..."; }
  25%  { content: "Mounting workspace..."; }
  50%  { content: "Calibrating display..."; }
  75%  { content: "Syncing data layers..."; }
  100% { content: "All systems nominal."; }
}

/* ── Percentage counter 0→99% ── */
.ld-pct::after {
  content: "0%";
  animation: ld-count 2s steps(10, end) forwards;
}
@keyframes ld-count {
  0%   { content: "0%";  }
  10%  { content: "10%"; }
  20%  { content: "22%"; }
  30%  { content: "35%"; }
  40%  { content: "48%"; }
  50%  { content: "61%"; }
  60%  { content: "72%"; }
  70%  { content: "80%"; }
  80%  { content: "88%"; }
  90%  { content: "94%"; }
  100% { content: "99%"; }
}

/* ── READY fades in after bar completes ── */
@keyframes ld-appear { to { opacity: 1; } }
.ld-ready { animation: ld-appear 0.4s ease forwards 2.05s; }

/* ── Full screen fades out → smooth dashboard reveal ── */
@keyframes ld-exit { to { opacity: 0; pointer-events: none; } }
.ld-root { animation: ld-exit 0.3s ease forwards 2.4s; }
`;
