"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic_import from 'next/dynamic';
import { syncService } from '../lib/sync-service';
import { backgroundSyncWorker } from '../lib/background-sync-worker';
import { useGlobalData } from './contexts/GlobalDataContext';
import { backupService } from '../lib/backup-service';
import SettingsModal from './components/SettingsModal';
import { appendMunshiRecord, searchHistory, MunshiSearchResult } from '../lib/munshi-search';
import { Wand2 } from 'lucide-react';
import BrightnessControl from './components/BrightnessControl';
import { THEMES } from './lib/themes';

const ThreeDAnalytics = dynamic_import(() => import('../components/ThreeDAnalytics'), { ssr: false });

// ─── AI LOGO — Futuristic Neural Node SVG ──────────────────────────────
// Sleek digital icon with glowing cyan lines and a neural network pattern.
function AiLogo({ size = 42, active = false, searching = false }: { size?: number; active?: boolean; searching?: boolean }) {
  const accent = '#22d3ee'; // Cyan-400
  return (
    <div className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${active ? 'bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-slate-900/40'} ${searching ? 'animate-pulse' : ''}`} style={{ width: size + 8, height: size + 8 }}>
      <svg
        width={size} height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${searching ? 'animate-ai-glow' : ''}`}
      >
        {/* Futuristic Hexagonal Frame */}
        <path d="M24 4L40.45 13.5V34.5L24 44L7.55 34.5V13.5L24 4Z" stroke={accent} strokeWidth="2" strokeOpacity={active ? "0.8" : "0.4"} />
        
        {/* Central Brain/Chip Pattern */}
        <rect x="20" y="20" width="8" height="8" rx="1.5" fill={accent} fillOpacity={active ? "0.9" : "0.5"} className={active ? 'animate-pulse' : ''} />
        <path d="M24 12V20M24 28V36M12 24H20M28 24H36" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
        
        {/* Neural Nodes */}
        <circle cx="24" cy="12" r="2.5" fill={accent} fillOpacity="0.8" />
        <circle cx="24" cy="36" r="2.5" fill={accent} fillOpacity="0.8" />
        <circle cx="12" cy="24" r="2.5" fill={accent} fillOpacity="0.8" />
        <circle cx="36" cy="24" r="2.5" fill={accent} fillOpacity="0.8" />
        
        {/* Abstract Connections */}
        <path d="M16 16L21 21M27 27L32 32M16 32L21 27M27 21L32 16" stroke={accent} strokeWidth="1" strokeOpacity="0.4" />
      </svg>
      {active && (
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
      )}
    </div>
  );
}

// --- CSS FOR ANIMATIONS ---
const styles = `
  @keyframes gentle-sway {
    0%, 100% { transform: translateX(-8px) translateZ(0); }
    50%       { transform: translateX(8px)  translateZ(0); }
  }
  .animate-sway {
    animation: gentle-sway 4s ease-in-out infinite;
    will-change: transform;
  }
  @keyframes ai-glow {
    0%, 100% { filter: drop-shadow(0 0 2px #22d3ee) drop-shadow(0 0 5px rgba(34,211,238,0.4)); }
    50%       { filter: drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 12px rgba(34,211,238,0.6)); }
  }
  .animate-ai-glow { animation: ai-glow 1.2s ease-in-out infinite; }
  @keyframes munshi-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(34,211,238,0.5); transform: scale(1) translateZ(0); }
    50% { box-shadow: 0 0 22px rgba(34,211,238,0.9), 0 0 38px rgba(34,211,238,0.5); transform: scale(1.1) translateZ(0); }
  }
  .animate-munshi-pulse {
    animation: munshi-pulse 0.8s ease-in-out infinite;
  }
  @keyframes spin-ring {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .animate-spin-ring {
    animation: spin-ring 3s linear infinite;
    will-change: transform;
  }
  @keyframes jadugar-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(0,255,255,0.5), 0 0 24px rgba(139,0,255,0.3); }
    50%       { box-shadow: 0 0 22px rgba(0,255,255,0.9), 0 0 44px rgba(139,0,255,0.6); }
  }
  .animate-jadugar-glow {
    animation: jadugar-glow 2.5s ease-in-out infinite;
  }
  @keyframes pulse-slow {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); transform: scale(1) translateZ(0); }
    50% { box-shadow: 0 0 15px rgba(100, 200, 255, 0.6), 0 0 25px rgba(100, 150, 255, 0.4); transform: scale(1.05) translateZ(0); }
  }
  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
    will-change: transform, box-shadow;
  }
  @keyframes gradient-move {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-bg {
    background-size: 400% 400%;
    animation: gradient-move 15s ease infinite;
    will-change: background-position;
  }
  @keyframes police-flash {
    0% { background-color: rgba(220, 38, 38, 0.9); }
    50% { background-color: rgba(30, 58, 138, 0.9); }
    100% { background-color: rgba(220, 38, 38, 0.9); }
  }
  .police-alert { animation: police-flash 0.5s infinite; will-change: background-color; }
  @keyframes warning-blink {
    0%, 100% { background-color: rgba(255, 107, 0, 0.1); border-color: rgba(255, 107, 0, 0.3); box-shadow: 0 0 5px rgba(255, 107, 0, 0.3); }
    50% { background-color: rgba(255, 107, 0, 0.4); border-color: rgba(255, 107, 0, 1); box-shadow: 0 0 20px rgba(255, 107, 0, 0.8), 0 0 30px rgba(255, 107, 0, 0.6); }
  }
  .animate-warning { animation: warning-blink 1s infinite; will-change: box-shadow, background-color; }
  @keyframes neon-orange-pulse {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 0, 0.5), 0 0 10px rgba(255, 107, 0, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.8), 0 0 30px rgba(255, 107, 0, 0.9), 0 0 40px rgba(255, 107, 0, 0.6); }
  }
  .animate-neon-warning { animation: neon-orange-pulse 1.5s ease-in-out infinite alternate; will-change: box-shadow; }
  @keyframes alertPulse {
    0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 0, 0.5), 0 0 10px rgba(255, 107, 0, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.8), 0 0 30px rgba(255, 107, 0, 0.9), 0 0 40px rgba(255, 107, 0, 0.6); }
  }
  .animate-alert-pulse { animation: alertPulse 1.5s ease-in-out infinite alternate; will-change: box-shadow; }
  @keyframes neon-blink {
    0% { box-shadow: 0 0 5px #ff9900; }
    50% { box-shadow: 0 0 20px #ff0000; }
    100% { box-shadow: 0 0 5px #ff9900; }
  }
  .neon-blink { animation: neon-blink 1.5s ease-in-out infinite alternate; will-change: box-shadow; }
  @keyframes breathing-glow {
    0%, 100% { filter: drop-shadow(0 0 5px var(--accent, #22d3ee)) opacity(0.8); transform: scale(1); }
    50% { filter: drop-shadow(0 0 15px var(--accent, #22d3ee)) opacity(1); transform: scale(1.05); }
  }
  .animate-breathing { animation: breathing-glow 3s ease-in-out infinite; }
  .bar-grow { animation: grow-up 1s ease-out forwards; }
  @keyframes grow-up { from { height: 0; opacity: 0; } to { opacity: 1; } }
  .perspective-container { perspective: 1000px; }
  .glass-panel { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  .writing-vertical { writing-mode: vertical-rl; }
  .custom-scrollbar-no-display::-webkit-scrollbar { display: none; }
  .custom-scrollbar-no-display { -ms-overflow-style: none; scrollbar-width: none; }
  /* scrollbar styles defined in TURBO ENGINE block below */
  .name-input-wrapper { position: relative; display: inline-block; width: 100%; }
  .amount-cell-wrapper { position: relative; display: inline-block; width: 100%; overflow: hidden; }
  @keyframes pulse {
    0%, 100% { transform: scale(1) translateZ(0); }
    50% { transform: scale(1.1) translateZ(0); }
  }
  .rotation-icon { font-size: 60px; margin-bottom: 20px; animation: pulse 1.5s infinite; will-change: transform; }
  /* Position suggestions directly under the name input */
  .name-suggestions-dropdown { position: absolute; top: 100%; left: 0; width: 100%; z-index: 50; margin-top: 2px; }
  /* Mobile Landscape Detection */
  .rotation-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: #000; display: flex; flex-direction: column;
    justify-content: center; align-items: center; z-index: 9999; text-align: center; padding: 20px;
  }
  .rotation-message { color: white; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
  /* Mobile-specific styles */
  @media (max-width: 768px) {
    .mobile-landscape { transform: rotate(0deg); min-height: 100vh; min-width: 100vw; }
    .mobile-landscape.landscape-mode { transform: rotate(0deg); }
    .mobile-landscape.portrait-mode { transform: rotate(0deg); }
  }
  .mobile-scaler { width: 100%; transform-origin: top left; }
  @media (max-width: 1024px) and (orientation: landscape) {
    .mobile-landscape-scaler { transform: scale(0.85); transform-origin: top left; width: 117.65%; height: 117.65%; }
  }
  @media (max-width: 768px) and (orientation: landscape) {
    .mobile-landscape-scaler { transform: scale(0.75); transform-origin: top left; width: 133.33%; height: 133.33%; }
  }
  @media (max-width: 600px) and (orientation: landscape) {
    .mobile-landscape-scaler { transform: scale(0.65); transform-origin: top left; width: 153.85%; height: 153.85%; }
  }
  input:focus { font-size: 16px !important; }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .shimmer {
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);
    background-size: 1000px 100%;
    animation: shimmer 4s infinite linear;
    will-change: background-position;
    pointer-events: none;
    /* Keep shimmer BELOW text layers — never blurs content */
    z-index: 0;
    isolation: isolate;
  }
  /* HD text utilities */
  .hd-text {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  /* Crisp data values — solid color, no transparency fade */
  .data-value {
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 1px 3px rgba(0,0,0,0.7);
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  /* ── TURBO ENGINE: GPU-accelerated row rendering ───────────────────────── */
  .cv-row {
    content-visibility: auto;
    contain-intrinsic-size: 0 40px; /* h-10 (40px), no my margins */
    min-height: 40px; /* enforce consistent row height for virtual window accuracy */
    background-color: var(--bg-row);
    color: var(--text-main);
  }
  /* Neon focus: theme-aware glow via --accent CSS variable */
  .cv-row input:focus {
    outline: none;
    box-shadow: 0 0 0 1px var(--accent), 0 0 8px var(--accent);
    border-radius: 4px;
    transition: box-shadow 0.15s ease;
  }
  /* Polished scrollbar — main data area */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; opacity: 0.8; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #059669; }
  /* Side-panel slim scrollbar — theme-accent tinted, minimal footprint */
  .panel-scroll::-webkit-scrollbar { width: 3px; }
  .panel-scroll::-webkit-scrollbar-track { background: transparent; }
  .panel-scroll::-webkit-scrollbar-thumb { background: var(--theme-accent, #475569); opacity: 0.5; border-radius: 99px; }
  .panel-scroll::-webkit-scrollbar-thumb:hover { background: var(--theme-accent, #60a5fa); opacity: 0.9; }
  .panel-scroll { scrollbar-width: thin; scrollbar-color: var(--theme-accent, #475569) transparent; }
  /* GPU spring for locked/finalized rows */
  @keyframes row-lock-spring {
    0%   { transform: scaleX(1)   translateZ(0); }
    30%  { transform: scaleX(1.02) translateZ(0); }
    60%  { transform: scaleX(0.99) translateZ(0); }
    100% { transform: scaleX(1)   translateZ(0); }
  }
  .row-spring { animation: row-lock-spring 0.35s cubic-bezier(0.34,1.56,0.64,1) both; will-change: transform; }

  /* ── Task 1: 10-Minute Amber Blink ──────────────────────────────────── */
  @keyframes amber-blink {
    0%, 100% { opacity: 1;    box-shadow: 0 0 0 1.5px rgba(251,191,36,0.75), 0 0 18px rgba(251,191,36,0.45); background-color: rgba(120,80,0,0.18); }
    50%       { opacity: 0.38; box-shadow: 0 0 0 1px   rgba(251,191,36,0.2),  0 0 4px  rgba(251,191,36,0.1);  background-color: rgba(0,0,0,0); }
  }
  .animate-blink-amber {
    animation: amber-blink 0.95s ease-in-out infinite;
    will-change: opacity, box-shadow, background-color;
    border: 1.5px solid rgba(251,191,36,0.55) !important;
    border-radius: 12px;
  }

  /* ── Quick Entry Row — blinking amber border on cabin input ──────────── */
  @keyframes qe-border-blink {
    0%, 100% { border-color: rgba(251,191,36,0.9); box-shadow: 0 0 0 2px rgba(251,191,36,0.2), 0 0 8px rgba(251,191,36,0.3); }
    50%       { border-color: rgba(251,191,36,0.25); box-shadow: none; }
  }
  .qe-cabin-blink {
    animation: qe-border-blink 1s ease-in-out infinite;
    will-change: border-color, box-shadow;
  }

  /* ── P0 Ready Row — first empty slot in each section, amber border pulse ── */
  @keyframes ready-row-pulse {
    0%, 100% { border-color: rgba(251,191,36,0.65); box-shadow: 0 0 0 1px rgba(251,191,36,0.12); }
    50%       { border-color: rgba(251,191,36,0.15); box-shadow: none; }
  }
  .row-ready-blink {
    animation: ready-row-pulse 1.4s ease-in-out infinite !important;
    border: 1px solid rgba(251,191,36,0.65) !important;
    background: rgba(20,16,5,0.9) !important;
    will-change: border-color, box-shadow;
  }

  /* ── Draft row: subtle visibility so all 240 slots are clearly seen ── */
  .draft-row {
    background: rgba(8, 14, 26, 0.6) !important;
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  }
  .draft-row:hover {
    background: rgba(15, 25, 45, 0.7) !important;
    border-bottom-color: rgba(255,255,255,0.08) !important;
  }
  /* ── Task 3: Frozen Row (Dark Steel Zinc) ──────────────────────────── */
  .frozen-row {
    background: rgba(24,24,27,0.88) !important;  /* zinc-900/88 */
    border: 1px solid rgba(63,63,70,0.4) !important;  /* zinc-700/40 */
    opacity: 0.82;
  }
  .frozen-row input { cursor: not-allowed !important; color: rgba(161,161,170,0.55) !important; }

  /* ── Premium Footer ──────────────────────────────────────────────────── */
  .footer-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; height: 100%; border: none; background: transparent;
    cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.12s;
    position: relative; text-decoration: none; user-select: none;
    border-right: 1px solid rgba(255,255,255,0.04);
    padding: 0 4px;
  }
  .footer-btn:last-child { border-right: none; }
  .footer-btn:hover { background: rgba(255,255,255,0.04); transform: translateY(-1px); }
  .footer-btn:active { transform: translateY(0px) scale(0.97); }
  .footer-btn .fb-icon { font-size: 17px; line-height: 1; }
  .footer-btn .fb-label {
    font-size: 8.5px; font-weight: 800; letter-spacing: 0.07em;
    text-transform: uppercase; line-height: 1; white-space: nowrap;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  /* ── Live Score (Hisab) Special Styling ────────────────────────────── */
  .live-score-btn {
    border-radius: 0 !important;
    animation: live-score-pulse 2s infinite ease-in-out;
    background: rgba(0, 242, 255, 0.05) !important;
    border-right: 1px solid rgba(0, 242, 255, 0.2) !important;
    overflow: hidden;
  }
  .live-score-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
    transform: skewX(-25deg);
    transition: 0s;
  }
  .live-score-btn:hover::before {
    left: 150%;
    transition: 0.6s ease-in-out;
  }
  .live-score-btn:hover {
    transform: translateY(-2px) scale(1.08) !important;
    background: rgba(0, 242, 255, 0.15) !important;
    box-shadow: 0 0 20px rgba(0, 242, 255, 0.4) !important;
  }
  @keyframes live-score-pulse {
    0% { transform: scale(1); box-shadow: 0 0 5px rgba(0, 242, 255, 0.2); }
    50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(0, 242, 255, 0.5); }
    100% { transform: scale(1); box-shadow: 0 0 5px rgba(0, 242, 255, 0.2); }
  }
  /* ─────────────────────────────────────────────────────────────────────── */

  /* Active state inset glow bar at bottom */
  .footer-btn.fb-active::after {
    content: ''; position: absolute; bottom: 0; left: 15%; right: 15%;
    height: 2px; border-radius: 2px 2px 0 0;
  }
  /* ─────────────────────────────────────────────────────────────────────── */
`;

// THEMES — 20 premium themes, imported from ./lib/themes
// Tailwind safelist anchor — scanner must see these class strings in a .tsx file:
// bg-gradient-to-br from-slate-900 via-blue-900 to-black bg-black bg-neutral-900
// from-yellow-950 via-black to-yellow-900 from-purple-900 to-pink-900
// from-red-950 to-orange-950 from-green-950 to-emerald-900
// from-indigo-950 via-purple-900 from-blue-950 via-cyan-900 via-purple-950
// bg-slate-900/90 bg-black/90 bg-black/80 bg-sky-950/80 bg-indigo-950/80
// border-cyan-500/50 border-white/40 border-yellow-500/60 border-pink-500/60
// border-red-600/60 border-green-500/50 border-purple-400/50 border-sky-400/50
// border-white/30 border-violet-500/50 border-red-600/60 border-emerald-400/40
// border-orange-500/50 border-pink-500/55 border-blue-700/50
// text-white text-yellow-50 text-red-50 text-green-50 text-purple-50 text-sky-50
// text-cyan-400 text-gray-300 text-yellow-400 text-cyan-400 text-red-500
// text-green-400 text-fuchsia-400 text-sky-400 text-indigo-200
// text-emerald-400 text-violet-100 text-violet-400 text-slate-200 text-slate-300
// text-orange-50 text-amber-400 text-emerald-400 text-pink-400 text-slate-100
// bg-cyan-600 hover:bg-cyan-500 bg-white bg-yellow-600 hover:bg-yellow-500
// bg-gradient-to-r from-purple-600 to-pink-600 bg-red-700 bg-green-700
// bg-purple-600 bg-sky-600 bg-white/20 hover:bg-white/30
// shadow-[0_0_20px_rgba(34,211,238,0.3)] shadow-[0_0_25px_rgba(234,179,8,0.4)]
// shadow-[0_0_20px_rgba(74,222,128,0.3)] shadow-[0_0_20px_rgba(192,38,211,0.4)]
// shadow-[0_0_28px_rgba(139,92,246,0.5)] shadow-[0_0_28px_rgba(212,175,55,0.45)]
// from-slate-950 to-slate-950 bg-emerald-950/80 bg-[#0d0020]/95 bg-[#111111]/95
// text-violet-100 text-[#f5e6c0] text-emerald-50 text-orange-50 text-pink-50

type ViewState = 'users' | 'workers' | 'expenses' | 'financials' | 'analytics';
type ModalType = 'generator' | 'tea' | null;
type StatPeriod = 'daily' | 'monthly' | 'yearly';
type ChatMessage = { sender: 'user' | 'ai'; text: string; isSecure?: boolean };
type AuthAction = { type: 'ACCESS_HQ' } | { type: 'UNLOCK_ROW', id: number } | { type: 'RATE_WORKER', workerId: number, rating: number } | { type: 'DELETE_WORKER', id: number } | { type: 'DELETE_EXPENSE', id: number } | { type: 'OPEN_SETTINGS' };
type AiContextType = { status: 'IDLE' | 'WAITING_FOR_TYPE' | 'WAITING_FOR_DATE' | 'WAITING_FOR_TOP_PERIOD' | 'WAITING_FOR_FINANCIAL_PERIOD'; targetName: string; intent: 'DETAIL' | 'TOP_USER' | 'TOP_3' | 'FINANCIAL_REPORT' | 'PROFIT_LOSS'; };

export default function ClickDashboard() {
  const [currentView, setCurrentView] = useState<ViewState>('users');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // --- SIDE PANEL STATE VARIABLES ---
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [showCafePanel, setShowCafePanel] = useState(false);
  const [hisabDotActive, setHisabDotActive] = useState(false);

  // Lazy-init from localStorage so the correct theme/scale is used on the very
  // first render — before any auto-save effect can fire and overwrite the value.
  // Also injects CSS variables immediately (synchronous) so globals.css rules
  // that use var(--theme-accent) are correct on the very first paint.
  const [themeIndex, setThemeIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      const parsed = raw ? JSON.parse(raw) : {};
      const idx = typeof parsed.themeIndex === 'number' ? parsed.themeIndex : 0;
      // Synchronous CSS variable injection — fires before first paint
      const theme = THEMES[idx] ?? THEMES[0];
      const root = document.documentElement;
      root.style.setProperty('--theme-accent', theme.previewAccent);
      root.style.setProperty('--theme-bg', theme.previewBg);
      if (theme.accentRgb) root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
      // Row system vars — derived from theme colors, no extra data in Theme type needed
      const rgb = theme.accentRgb ?? '34,211,238';
      const hex = theme.previewBg.replace('#', '');
      const pr = parseInt(hex.slice(0, 2), 16), pg = parseInt(hex.slice(2, 4), 16), pb = parseInt(hex.slice(4, 6), 16);
      root.style.setProperty('--row-bg', `rgba(${pr},${pg},${pb},0.82)`);
      root.style.setProperty('--row-bg-alt', `rgba(${rgb},0.05)`);
      root.style.setProperty('--row-bg-active', `rgba(${rgb},0.16)`);
      root.style.setProperty('--row-bg-selected', `rgba(${rgb},0.11)`);
      root.style.setProperty('--row-border', `rgba(${rgb},0.13)`);
      root.style.setProperty('--row-glow', `0 0 10px rgba(${rgb},0.22)`);
      return idx;
    } catch { return 0; }
  });
  const t = THEMES[themeIndex] ?? THEMES[0];

  // ── Theme CSS variable injection ─────────────────────────────────────────
  // Injects --theme-accent / --theme-bg / --theme-accent-rgb onto <html> whenever
  // the theme changes so any CSS rule can consume them without re-render.
  useEffect(() => {
    const theme = THEMES[themeIndex] ?? THEMES[0];
    const root = document.documentElement;
    // Strict CSS Variable Isolation as requested
    root.style.setProperty('--bg-main', theme.bgMain);
    root.style.setProperty('--bg-row', theme.bgRow);
    root.style.setProperty('--text-main', theme.textMainHex);
    root.style.setProperty('--accent', theme.accentHex);
    
    // Legacy support for other components
    root.style.setProperty('--theme-accent', theme.previewAccent);
    root.style.setProperty('--theme-bg', theme.previewBg);
    if (theme.accentRgb) root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
    
    // Row system vars — re-injected on every theme change
    const rgb = theme.accentRgb ?? '34,211,238';
    root.style.setProperty('--row-bg-alt', `rgba(${rgb},0.05)`);
    root.style.setProperty('--row-bg-active', `rgba(${rgb},0.16)`);
    root.style.setProperty('--row-bg-selected', `rgba(${rgb},0.11)`);
    root.style.setProperty('--row-border', `rgba(${rgb},0.13)`);
    root.style.setProperty('--row-glow', `0 0 10px rgba(${rgb},0.22)`);
  }, [themeIndex]);

  // ── Cross-page theme broadcast listener ─────────────────────────────────
  // The themes page dispatches 'spider_theme_change' via window.dispatchEvent.
  // Because Next.js can serve this page from the router cache without remounting,
  // the lazy-init above won't re-run. This listener catches the live event and
  // updates themeIndex immediately — no manual refresh needed.
  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<{ index: number }>).detail?.index;
      if (typeof idx === 'number' && idx !== themeIndex) setThemeIndex(idx);
    };
    window.addEventListener('spider_theme_change', handler);
    return () => window.removeEventListener('spider_theme_change', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — handler captures setThemeIndex which is stable

  const [uiScale, setUiScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.3;
    try {
      // Priority 1: Check sessionStorage for current browser session persistence
      const sessionVal = sessionStorage.getItem('globalPageScale');
      if (sessionVal) return parseFloat(sessionVal);

      // Priority 2: Check main DB (localStorage) for historical persistence
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed.uiScale === 'number' ? parsed.uiScale : 1.3;
    } catch { return 1.3; }
  });

  const [serialSize, setSerialSize] = useState<number>(() => {
    if (typeof window === 'undefined') return 10;
    try {
      const saved = localStorage.getItem('serialSize');
      if (saved) return parseInt(saved, 10);
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed.serialSize === 'number' ? parsed.serialSize : 10;
    } catch { return 10; }
  });

  // --- PERSISTENCE SYNC ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serialSize', serialSize.toString());
      sessionStorage.setItem('serialFontSize', serialSize.toString());
    }
  }, [serialSize]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('globalPageScale', uiScale.toString());
    }
  }, [uiScale]);

  const [adminPin, setAdminPin] = useState("7860");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>({ type: 'ACCESS_HQ' });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPassInput, setNewPassInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ sender: 'ai', text: 'Assalam-o-Alaikum Boss! ❤️\nMain CLICK Cafe ka AI hun.\n\n📌 Meri scope: sirf aaj ki screen.\nHistory ke liye "Brain" button use karein.' }]);
  const [awaitingAiAuth, setAwaitingAiAuth] = useState(false);
  const [aiContext, setAiContext] = useState<AiContextType>({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Per-row debounce timers & visual indicators (Tasks 2-4)
  const rowSaveTimersRef = useRef<Map<string | number, ReturnType<typeof setTimeout>>>(new Map());
  const [savingRowIds, setSavingRowIds] = useState<Set<string | number>>(new Set());

  // ── Expiry tracking — prevent double-firing visual transitions ─────────────
  const warnedRowIds  = useRef<Set<string | number>>(new Set()); // flagged at 10-min mark
  const alertedRowIds = useRef<Set<string | number>>(new Set()); // flagged at time-over
  // ── Smart Munshi Search ──
  const [showMunshi, setShowMunshi] = useState(false);
  const [munshiQuery, setMunshiQuery] = useState('');
  const [munshiResult, setMunshiResult] = useState<MunshiSearchResult | null>(null);
  const [munshiSearching, setMunshiSearching] = useState(false);
  const munshiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [blockList, setBlockList] = useState<string[]>([]);
  const [blockInput, setBlockInput] = useState("");
  const [policeAlert, setPoliceAlert] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [statPeriod, setStatPeriod] = useState<StatPeriod>('daily');
  const [now, setNow] = useState(new Date());
  const [graphDate, setGraphDate] = useState(new Date().toISOString().split('T')[0]);
  const { masterData, setMasterData, loadMonthData } = useGlobalData();
  const [generatorLogs, setGeneratorLogs] = useState<{id:number;date:string;desc:string;amount:number}[]>([]);
  const [teaLogs, setTeaLogs] = useState<{id:number;date:string;desc:string;amount:number}[]>([]);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showRotationOverlay, setShowRotationOverlay] = useState(false);

  // Shimmer is always-on via CSS animation for Crystal Glass theme (no state needed)

  // --- ARCHIVE LOGIC: Store previous day's data when date changes ---
  const [archivedData, setArchivedData] = useState<any[]>([]);

  // Ref so the archive effect always reads latest masterData without depending on it
  const masterDataRef = useRef<{ [key: string]: any }>({});
  // Tracks which row (by id) currently has keyboard focus — suppresses sort reorder
  // while the user is actively typing so inputs don't jump mid-keystroke.
  const focusedRowIdRef = useRef<number | null>(null);
  // Quick Entry form removed — the P0 blinking row (first empty slot per section) serves as the live entry point.

  // Tracks which cabin input is showing the over-limit red flash (clears after 800ms)
  const [cabinOverLimitId, setCabinOverLimitId] = useState<number | null>(null);
  const cabinOverLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks which cabin input is showing the duplicate red flash (clears after 1200ms)
  const [cabinDuplicateId, setCabinDuplicateId] = useState<number | null>(null);
  const cabinDuplicateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Master Password Gate ──────────────────────────────────────────────────
  // To change the password, edit MASTER_KEY below (source code only, no UI).
  const MASTER_KEY = 'ZAHID-CLICK-786';
  const AUTH_STORAGE_KEY = 'spider_station_auth_v2';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [lockInput, setLockInput] = useState('');
  const [lockError, setLockError] = useState(false);
  const handleUnlock = () => {
    if (lockInput === MASTER_KEY) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setLockError(false);
    } else {
      setLockError(true);
      setLockInput('');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => { masterDataRef.current = masterData; }, [masterData]);

  // Stable archive function — wrapped in useCallback so its reference never changes,
  // preventing it from re-triggering the effect on every render.
  const archiveCurrentDayData = useCallback((currentDayData: any, dateKey: string) => {
    if (!currentDayData?.users?.length) return;
    const frozenUsers = currentDayData.users.filter((user: any) =>
      user.timeOut && user.timeOut.trim() !== '' && user.amount && user.amount !== ''
    );
    if (frozenUsers.length === 0) return;
    setArchivedData(prev => {
      // ── Dedup guard: never add a second archive entry for the same date ──
      if (prev.some((a: any) => a.date === dateKey)) return prev;
      return [...prev, { date: dateKey, users: frozenUsers, timestamp: new Date().toISOString() }];
    });
  }, []); // stable — no deps needed; reads state only via setArchivedData updater form

  // --- TODAY'S NAME SUGGESTION SYSTEM ---
  const [todayNames, setTodayNames] = useState<string[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeInputId, setActiveInputId] = useState<number | null>(null); // Track which input is active

  // Archive data when the date changes.
  // IMPORTANT: masterData is intentionally read via masterDataRef (not listed in deps)
  // to prevent this effect from re-firing every time masterData updates, which caused
  // an infinite loop: setArchivedData → re-render → masterData ref changes → effect fires → repeat.
  useEffect(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const currentKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

    if (todayKey !== currentKey) {
      const currentDayKey = getStorageKey(currentDate, selectedDay);
      const currentDayData = masterDataRef.current[currentDayKey]; // ref — no dep needed
      if (currentDayData) {
        archiveCurrentDayData(currentDayData, currentDayKey);
      }
      setTodayNames([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedDay]); // masterData excluded intentionally — use ref above

  // Handle clicks outside of name inputs to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        // Check if the click is outside of any name input wrapper
        const nameInputWrapper = event.target.closest('.name-input-wrapper');
        if (!nameInputWrapper) {
          setSuggestionsVisible(false);
          setActiveInputId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Orientation detection for mobile devices
  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is mobile/tablet
      const isMobile = window.innerWidth <= 768;

      // Check orientation - if height > width, it's portrait
      const currentIsPortrait = window.innerHeight > window.innerWidth;

      setIsPortrait(currentIsPortrait);

      // Show rotation overlay only on mobile devices in portrait mode
      if (isMobile && currentIsPortrait) {
        setShowRotationOverlay(true);
      } else {
        setShowRotationOverlay(false);
      }
    };

    // Initial check
    checkOrientation();

    // Add event listeners
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // ── Scroll tracking for virtualization ──────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────

  // --- AUTO-SAVE STATE VARIABLES ---
  const [lastSavedData, setLastSavedData] = useState<{ [key: string]: any }>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const [cafeItems, setCafeItems] = useState<{ id: number; name: string; price: number }[]>([]);

  // ── Sync cafeItems from masterData when the selected date changes ──
  useEffect(() => {
    const key = getStorageKey(currentDate, selectedDay);
    const dayData = masterData[key];
    if (dayData && Array.isArray(dayData.cafeItems)) {
      setCafeItems(dayData.cafeItems);
    } else {
      // If no date-specific data, check legacy storage for migration once, or default to empty
      const isInitialLoad = !Object.keys(masterDataRef.current).some(k => k.startsWith(`${currentDate.getFullYear()}-${currentDate.getMonth()}-`));
      if (isInitialLoad) {
        const strictRaw = localStorage.getItem('cafe_inventory_data');
        if (strictRaw) {
          try {
            const parsed = JSON.parse(strictRaw);
            if (Array.isArray(parsed)) {
              setCafeItems(parsed);
              updateMasterData('cafeItems', parsed); // Persist to current date
              return;
            }
          } catch (_) {}
        }
      }
      setCafeItems([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedDay, masterData]);

  // --- PERSISTENCE: Sync cafeItems to current date's masterData on change ---
  const handleSetCafeItems = useCallback((newItems: any[]) => {
    setCafeItems(newItems);
    updateMasterData('cafeItems', newItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedDay]);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [inventoryToast, setInventoryToast] = useState<'saved' | 'reset' | null>(null);

  // --- AUTO-SAVE & LOAD SYSTEM (DATABASE SIMULATION) ---
  useEffect(() => {
    // Purge any stale light-mode keys that could cause a white-screen
    const staleKeys = ['theme', 'colorMode', 'chakra-ui-color-mode', 'color-mode'];
    staleKeys.forEach(k => { if (localStorage.getItem(k)) localStorage.removeItem(k); });

    // Load non-masterData fields on startup (masterData is handled by GlobalDataContext)
    const savedData = localStorage.getItem('CLICK_CAFE_DB_V2');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed.archivedData) setArchivedData(parsed.archivedData);
            if(parsed.blockList) setBlockList(parsed.blockList);
            if(parsed.adminPin) setAdminPin(parsed.adminPin);
            if(parsed.generatorLogs) setGeneratorLogs(parsed.generatorLogs);
            if(parsed.teaLogs) setTeaLogs(parsed.teaLogs);
            if(parsed.cafeItems) setCafeItems(parsed.cafeItems);
        } catch (e) {
            // Error handled silently to avoid console noise in production
        }
    }
  }, []);

  // ── Ghost-row sanitizer: strip nameless rows before ANY write to localStorage ──
  // A row without a name is never worth persisting — it's either a blank shell
  // the user never filled in, or junk from a previous session.
  const sanitizeMasterData = useCallback((md: { [key: string]: any }) => {
    const clean: { [key: string]: any } = {};
    Object.keys(md).forEach(dateKey => {
      const day = md[dateKey];
      if (!day) return;
      clean[dateKey] = {
        ...day,
        users: Array.isArray(day.users)
          ? day.users.filter((u: any) => u.name && String(u.name).trim() !== '')
          : [],
      };
    });
    return clean;
  }, []);

  useEffect(() => {
    // Stealth debounced auto-save — 800ms idle, then deferred to browser idle time
    // Guard removed: ensure cafeItems and settings save even if masterData is empty
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const dataToSave = {
        masterData: sanitizeMasterData(masterData),
        blockList, adminPin, themeIndex, uiScale, serialSize, generatorLogs, teaLogs, cafeItems,
      };
      // Task 4: push write to browser idle time — zero main-thread blocking
      const doWrite = () => localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(dataToSave));
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doWrite, { timeout: 2000 });
      } else {
        setTimeout(doWrite, 0);
      }
    }, 800);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [masterData, blockList, adminPin, themeIndex, uiScale, serialSize, generatorLogs, teaLogs, cafeItems, sanitizeMasterData]);

  // ── Task 2: saveSingleRow — debounced per-row async save ────────────────────
  // Only the modified row's data is written; the rest of localStorage is untouched.
  // Runs in browser idle time so typing and scrolling stay perfectly smooth.
  const saveSingleRow = useCallback((rowId: string | number) => {
    // Reset this row's debounce timer
    if (rowSaveTimersRef.current.has(rowId)) {
      clearTimeout(rowSaveTimersRef.current.get(rowId)!);
    }
    // Task 3: show "saving" dot immediately when user starts typing
    setSavingRowIds(prev => new Set([...prev, rowId]));

    const timer = setTimeout(() => {
      const doWrite = () => {
        try {
          const dateKey = getStorageKey(currentDate, selectedDay);
          const currentDayData = masterDataRef.current[dateKey];
          if (!currentDayData) return;
          const updatedRow = (currentDayData.users || []).find((u: any) => u.id === rowId);
          // Only persist rows that have a name (same rule as sanitizeMasterData)
          if (!updatedRow || !updatedRow.name?.trim()) return;

          const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
          if (!raw) return;
          const db = JSON.parse(raw);
          if (!db.masterData) db.masterData = {};
          const storedDay = db.masterData[dateKey] || { users: [], workers: [], expenses: [] };
          const storedUsers: any[] = Array.isArray(storedDay.users) ? storedDay.users : [];
          const idx = storedUsers.findIndex((u: any) => u.id === rowId);
          if (idx >= 0) storedUsers[idx] = updatedRow;
          else storedUsers.push(updatedRow);
          db.masterData[dateKey] = { ...storedDay, users: storedUsers };
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(db));
        } catch (_) { /* silent — global save is the safety net */ }

        // Task 3: hide dot after save completes
        setSavingRowIds(prev => { const n = new Set(prev); n.delete(rowId); return n; });
        rowSaveTimersRef.current.delete(rowId);
      };

      // Task 4: defer to browser idle time — main thread stays free
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doWrite, { timeout: 1500 });
      } else {
        setTimeout(doWrite, 0);
      }
    }, 1000); // 1 s debounce per row

    rowSaveTimersRef.current.set(rowId, timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, selectedDay]);

  // ── Task 1: handleManualSave — neon-gold Save button handler ────────────────
  const handleManualSave = useCallback(() => {
    const dataToSave = {
      masterData: sanitizeMasterData(masterDataRef.current),
      blockList, adminPin, themeIndex, generatorLogs, teaLogs, cafeItems,
    };
    const doWrite = () => {
      localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(dataToSave));
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(doWrite, { timeout: 1000 });
    } else {
      setTimeout(doWrite, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockList, adminPin, themeIndex, generatorLogs, teaLogs, cafeItems, sanitizeMasterData]);
  // ────────────────────────────────────────────────────────────────────────────

  // --- AUTO-SAVE EFFECT WITH CHANGE TRACKING ---
  useEffect(() => {
    // Initialize last saved data when component mounts
    const savedData = localStorage.getItem('CLICK_CAFE_DB_V2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setLastSavedData({
          masterData: parsed.masterData || {},
          archivedData: parsed.archivedData || [], // Load archived data
          blockList: parsed.blockList || [],
          adminPin: parsed.adminPin || "7860",
          themeIndex: parsed.themeIndex !== undefined ? parsed.themeIndex : 0,
          generatorLogs: parsed.generatorLogs || [],
          teaLogs: parsed.teaLogs || [],
          cafeItems: parsed.cafeItems || []
        });
      } catch (e) {
        // Error handled silently to avoid console noise in production
      }
    }

    // Set up 1-minute auto-save interval
    const autoSaveInterval = setInterval(() => {
      handleIncrementalSave();
    }, 60000); // 1 minute = 60,000 milliseconds

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [masterData, archivedData, blockList, adminPin, themeIndex, generatorLogs, teaLogs, cafeItems]);

  // Function to handle incremental save
  const handleIncrementalSave = async () => {
    setIsAutoSaving(true);

    // Prepare data to save — sanitize masterData to strip nameless ghost rows
    const currentDataToSave = {
      masterData: sanitizeMasterData(masterData), // ← sanitize before write
      archivedData,
      blockList,
      adminPin,
      themeIndex,
      generatorLogs,
      teaLogs,
      cafeItems,
    };

    // Compare with last saved data to determine what changed
    const hasChanges =
      JSON.stringify(currentDataToSave.masterData) !== JSON.stringify(lastSavedData.masterData) ||
      JSON.stringify(currentDataToSave.archivedData) !== JSON.stringify(lastSavedData.archivedData) ||
      JSON.stringify(currentDataToSave.blockList) !== JSON.stringify(lastSavedData.blockList) ||
      currentDataToSave.adminPin !== lastSavedData.adminPin ||
      currentDataToSave.themeIndex !== lastSavedData.themeIndex ||
      JSON.stringify(currentDataToSave.generatorLogs) !== JSON.stringify(lastSavedData.generatorLogs) ||
      JSON.stringify(currentDataToSave.teaLogs) !== JSON.stringify(lastSavedData.teaLogs) ||
      JSON.stringify(currentDataToSave.cafeItems) !== JSON.stringify(lastSavedData.cafeItems);

    if (hasChanges) {
      // Update last saved data
      setLastSavedData(JSON.parse(JSON.stringify(currentDataToSave)));

      // Save only the changed data locally first (offline-first)
      localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(currentDataToSave));

      // Show save indicator
      setShowSaveIndicator(true);
      setTimeout(() => {
        setShowSaveIndicator(false);
      }, 1000); // Hide after 1 second

      // Sync to cloud if online
      if (navigator.onLine) {
        try {
          // Prepare dashboard data for sync
          const dashboardData = {
            date: new Date().toISOString().split('T')[0],
            data: currentDataToSave,
            sync_status: 'pending' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Queue the data for sync
          await syncService.queueDashboardRecord(dashboardData);
        } catch (error) {
          // Still consider the local save successful even if sync fails
        }
      }
    }

    setIsAutoSaving(false);
  };


  // Single consolidated timer at 30s — row time-checks use new Date() directly,
  // so this only triggers the minimal re-renders needed for warning animations.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio and speech synthesis removed — system operates silently via visual-only alerts.

  // Initialize background sync worker and backup service when component mounts
  useEffect(() => {
    // Start background sync worker after a delay to allow app to initialize
    const initSyncWorker = setTimeout(() => {
      backgroundSyncWorker.start();
    }, 2000);

    // Initialize backup service
    const initBackupService = setTimeout(() => {
      backupService.checkAndImportLegacyBackup();
    }, 1000);

    // Cleanup function to stop the worker when component unmounts
    return () => {
      clearTimeout(initSyncWorker);
      clearTimeout(initBackupService);
      backgroundSyncWorker.stop();
    };
  }, []);

  const getStorageKey = (date: Date, day: number) => `${date.getFullYear()}-${date.getMonth()}-${day}`;
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  // Task 5: When the user navigates to a different month, lazy-load that month's
  // keys from localStorage without re-parsing the entire blob.
  useEffect(() => {
    loadMonthData(currentDate.getFullYear(), currentDate.getMonth());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);
  const formatMonthYear = (date: Date) => date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    // Keep the selected day if it exists in the new month, otherwise use the last day of the month
    const daysInNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const newSelectedDay = Math.min(selectedDay, daysInNewMonth);
    setSelectedDay(newSelectedDay);
  };
  
  const getFullDateDisplay = () => { 
    const activeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay); 
    return activeDate.toLocaleString('default', { weekday: 'short', day:'2-digit', month: 'short', year: 'numeric' }).toUpperCase(); 
  };
  
  const cycleTheme = () => { setThemeIndex((prev) => (prev + 1) % THEMES.length); };
  // No `now` state dep — reads live time directly so this function never causes
  // a cascade re-render when the timer ticks. Still accurate per render.
  // Minute-precise LIVE/DEAD: parses times with AM/PM into absolute minutes-from-midnight,
  // then compares elapsed vs total session duration against the real clock.
  // Positive return = overdue (DEAD), negative = still live.
  const getOverdueMinutes = useCallback((timeInStr: string, timeOutStr: string, inPeriod: 'AM'|'PM' = 'AM', outPeriod: 'AM'|'PM' = 'AM', nowDate: Date = new Date()) => {
    const startMins = parseTimeToMinutes(timeInStr, inPeriod);
    const endMins   = parseTimeToMinutes(timeOutStr, outPeriod);
    if (startMins === null || endMins === null) return -9999;

    // Total session duration; only negative diffs wrap (overnight). 0 stays 0.
    let totalMins = endMins - startMins;
    if (totalMins < 0) totalMins += 720;
    if (totalMins === 0) return -9999; // same in/out = no real session, treat as LIVE

    // Real clock in minutes from midnight
    const nowMins = nowDate.getHours() * 60 + nowDate.getMinutes();

    // Elapsed since session start; wrap around midnight if needed
    let elapsed = nowMins - startMins;
    if (elapsed < 0) elapsed += 1440;

    return elapsed - totalMins;
  }, []);

  // Returns minutes remaining in session — same logic inverted.
  const getTimeRemainingMinutes = (timeInStr: string, timeOutStr: string, inPeriod: 'AM'|'PM' = 'AM', outPeriod: 'AM'|'PM' = 'AM', nowDate: Date = new Date()) => {
    const startMins = parseTimeToMinutes(timeInStr, inPeriod);
    const endMins   = parseTimeToMinutes(timeOutStr, outPeriod);
    if (startMins === null || endMins === null) return 9999;

    let totalMins = endMins - startMins;
    if (totalMins < 0) totalMins += 720;
    if (totalMins === 0) return 9999; // no session duration

    const nowMins = nowDate.getHours() * 60 + nowDate.getMinutes();

    let elapsed = nowMins - startMins;
    if (elapsed < 0) elapsed += 1440;

    return totalMins - elapsed;
  };

  // Returns 'AM' or 'PM' based on current real clock — used as smart default
  // so sessions entered without explicit AM/PM match the current half of the day.
  const getSystemPeriod = (): 'AM' | 'PM' => new Date().getHours() >= 12 ? 'PM' : 'AM';

  // Parses "H", "H.M" (legacy decimal), or "H:MM" into total minutes from midnight.
  // Applies AM/PM offset so results are directly comparable with each other and real clock.
  const parseTimeToMinutes = (timeStr: string, period: 'AM' | 'PM'): number | null => {
    if (!timeStr || !timeStr.trim()) return null;
    let h: number, m: number;
    if (timeStr.includes(':')) {
      const [hPart, mPart] = timeStr.split(':');
      h = parseInt(hPart, 10);
      m = parseInt(mPart, 10) || 0;
    } else {
      h = parseFloat(timeStr);
      m = 0;
    }
    if (isNaN(h)) return null;
    // 12-hour → 24-hour conversion: 12 AM = 0h, 12 PM = 12h
    if (period === 'AM' && h === 12) h = 0;
    else if (period === 'PM' && h !== 12) h += 12;
    return h * 60 + (isNaN(m) ? 0 : m);
  };

  // Minute-precise duration in "Xh Ym" / "Xm" format.
  // Accepts optional AM/PM periods; defaults to AM/AM for backward compat.
  const calculateHours = (timeIn: string, timeOut: string, inPeriod: 'AM'|'PM' = 'AM', outPeriod: 'AM'|'PM' = 'AM') => {
    const startMins = parseTimeToMinutes(timeIn, inPeriod);
    const endMins   = parseTimeToMinutes(timeOut, outPeriod);
    if (startMins === null || endMins === null) return null;
    let diffMins = endMins - startMins;
    if (diffMins < 0) diffMins += 720; // 12-hour wrap for overnight; 0 stays 0
    if (diffMins === 0) return null;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}.${m.toString().padStart(2, '0')}`;
  };

  const calculateTotalTime = (timeIn: string, timeOut: string, inPeriod: 'AM'|'PM' = 'AM', outPeriod: 'AM'|'PM' = 'AM'): string | null => {
    const startMins = parseTimeToMinutes(timeIn, inPeriod);
    const endMins   = parseTimeToMinutes(timeOut, outPeriod);
    if (startMins === null || endMins === null) return null;
    let diffMins = endMins - startMins;
    if (diffMins < 0) diffMins += 720; // 12-hour wrap for overnight; 0 stays 0
    if (diffMins === 0) return null;   // same in/out = no duration
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getCurrentData = (date = currentDate, day = selectedDay) => {
    const key = getStorageKey(date, day);
    const defaultData = {
        users: [] as any[],  // Empty — rows are added manually only
        workers: [] as any[], // Empty — workers are added manually only
        cafeItems: [] as any[], // Empty — each day has its own cafe inventory
        expenses: [ { id: 1, item: 'Shop Rent (Main)', cost: 0, date: '', isSpecial: false }, { id: 2, item: 'Shop Rent (Shop 2)', cost: 0, date: '', isSpecial: false }, { id: 3, item: 'KE Electric Bill', cost: 0, date: '', isSpecial: false }, { id: 4, item: 'Internet Bill', cost: 0, date: '', isSpecial: false }, { id: 5, item: 'Generator Maintenance', cost: 0, date: '', isSpecial: true, type: 'generator' }, { id: 6, item: 'Tea & Refreshment', cost: 0, date: '', isSpecial: true, type: 'tea' } ],
        notes: Array.from({ length: 240 }, (_, i) => ({ id: i + 1, a: '', b: '' }))
    };

    // Get current day's data — only use saved data, never auto-fill
    let currentDayData = { ...defaultData };
    if (masterData[key]) {
      currentDayData = { ...masterData[key] };
      // ── Ghost-row filter runs ONLY at save-time (sanitizeMasterData).
      // Filtering here resets draft-row IDs every render, which causes the
      // input in Section 2 to be unmounted mid-keystroke (focus lost, char
      // never renders). Keeping all rows in-memory preserves stable positions.
    }

    // ── Archived rows (prepended for display, kept separate from the main grid) ──
    const archivedForDate = archivedData.filter((archive: any) => archive.date === key);
    const archivedRows: any[] = [];
    archivedForDate.forEach((archive: any) => {
      archive.users.forEach((user: any) => {
        archivedRows.push({ ...user, isArchived: true, isLocked: true });
      });
    });

    // ── Build a fixed 240-slot grid for current-day rows ─────────────────────
    // Each saved row carries its original `no` (1-based position). Placing it at
    // index (no - 1) guarantees it never jumps sections across reloads.
    const TOTAL_SLOTS = 240;
    const grid: (any | null)[] = new Array(TOTAL_SLOTS).fill(null);
    const usedIds = new Set<number>();

    (currentDayData.users || []).forEach((u: any) => {
      const rawId = u.id || 0;
      usedIds.add(rawId);
      const pos = typeof u.no === 'number' && u.no >= 1 && u.no <= TOTAL_SLOTS
        ? u.no - 1  // restore to exact original position
        : null;
      if (pos !== null && grid[pos] === null) {
        grid[pos] = { ...u, id: rawId };
      }
    });

    // Fill empty slots with fresh draft rows
    let nextId = -1;
    const fullGrid = grid.map((u, i) => {
      if (u) return u;
      while (usedIds.has(nextId)) nextId--;
      const draft = {
        id: nextId,
        no: i + 1,
        cabinNumber: '',
        name: '', timeIn: '', timeOut: '', timeInPeriod: getSystemPeriod(), timeOutPeriod: getSystemPeriod(), amount: '',
        isManualAmount: false, isLocked: false, isDraft: true,
      };
      usedIds.add(nextId);
      nextId--;
      return draft;
    });
    // ── Hard assertion: fullGrid must be exactly TOTAL_SLOTS items ───────────
    // If somehow the grid came up short (e.g. corrupted TOTAL_SLOTS), pad with
    // extra draft rows until we hit 240. This is the "no more excuses" guarantee.
    while (fullGrid.length < TOTAL_SLOTS) {
      const safetyId = nextId--;
      fullGrid.push({
        id: safetyId, no: fullGrid.length + 1,
        cabinNumber: '', name: '', timeIn: '', timeOut: '',
        timeInPeriod: getSystemPeriod(), timeOutPeriod: getSystemPeriod(),
        amount: '', isManualAmount: false, isLocked: false, isDraft: true,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Archived rows sit above the grid (display-only); they don't shift grid indices
    const resultData = {
      ...currentDayData,
      users: [...archivedRows, ...fullGrid],
    };

    const safeExpenses = resultData.expenses || defaultData.expenses;
    resultData.expenses = safeExpenses.map((e: any) => {
      if(e.type === 'generator') return {...e, cost: generatorLogs.reduce((s,i)=>s+i.amount,0)};
      if(e.type === 'tea') return {...e, cost: teaLogs.reduce((s,i)=>s+i.amount,0)};
      return e;
    });

    return resultData;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentData = useMemo(() => getCurrentData(), [masterData, archivedData, currentDate, selectedDay, generatorLogs, teaLogs]);

  // Memoized cabin availability — recalculates on record change OR every 30-second tick.
  // A cabin is only occupied if its row has NOT expired yet.
  const occupiedCabinNumbers = useMemo(() => {
    const occupied = new Set<number>();
    for (const u of currentData.users) {
      const raw = String(u.cabinNumber ?? '').trim();
      if (!raw) continue;
      const num = Number(raw); // handles "05" → 5, "5" → 5
      if (isNaN(num) || num < 1) continue; // any positive cabin number is valid
      // If the row has a timeOut and it has already expired, release the cabin
      if (u.timeOut && u.timeOut.trim() !== '') {
        const overdue = getOverdueMinutes(u.timeIn, u.timeOut, u.timeInPeriod || getSystemPeriod(), u.timeOutPeriod || getSystemPeriod());
        if (overdue >= 0) continue; // expired — cabin is free
      }
      occupied.add(num);
    }
    return occupied;
  }, [currentData.users, now]); // `now` ticks every 30s → instant UI sync on expiry

  // Count how many of the 240 row-slots are currently holding an active named session
  const occupiedRowCount = useMemo(() => occupiedCabinNumbers.size, [occupiedCabinNumbers]);
  const TOTAL_ROW_CAPACITY = 240;

  // Derives the 1-30 occupied set from occupiedCabinNumbers (which already handles expiry).
  // A cabin chip disappears from the bar only while the row is LIVE.
  // When the session hits 00:00 (DEAD), occupiedCabinNumbers drops that number
  // and the chip reappears in the bar automatically on the next 30s tick.
  const usedCabinNumbers1to30 = useMemo(() => {
    const used = new Set<number>();
    for (const num of occupiedCabinNumbers) {
      if (num >= 1 && num <= 30) used.add(num);
    }
    return used;
  }, [occupiedCabinNumbers]); // re-runs whenever occupiedCabinNumbers updates (every 30s tick)

  const availableCabins1to30 = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= 30; i++) {
      if (!usedCabinNumbers1to30.has(i)) list.push(i);
    }
    return list;
  }, [usedCabinNumbers1to30]);

  // Fires whenever the 30-second timer ticks (or currentData changes)
  // — checks each named row and triggers the correct alert exactly once
  // Placed AFTER currentData declaration to satisfy block-scope rules
  useEffect(() => {
    if (typeof window === 'undefined') return;
    currentData.users.forEach((u: any) => {
      if (!u.name || u.isDraft) return;
      const rem     = getTimeRemainingMinutes(u.timeIn, u.timeOut, u.timeInPeriod || getSystemPeriod(), u.timeOutPeriod || getSystemPeriod());
      const overdue = getOverdueMinutes(u.timeIn, u.timeOut, u.timeInPeriod || getSystemPeriod(), u.timeOutPeriod || getSystemPeriod());
      const id      = u.id;

      // 10-minute threshold — flag once so sort can promote to P1 exactly once
      if (rem > 0 && rem <= 10 && !warnedRowIds.current.has(id)) {
        warnedRowIds.current.add(id);
      }

      // Time-over threshold — flag once (visual DEAD state + P3 sort handled by render)
      if (overdue >= 0 && !alertedRowIds.current.has(id)) {
        alertedRowIds.current.add(id);
      }

      // Reset flags if row is cleared so thresholds fire again on next session
      if (!u.timeOut || u.timeOut.trim() === '') {
        warnedRowIds.current.delete(id);
        alertedRowIds.current.delete(id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, currentData.users]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const updateMasterData = (field: string, newData: any) => { const key = getStorageKey(currentDate, selectedDay); setMasterData(prev => { const base = prev[key] ?? getCurrentData(); return { ...prev, [key]: { ...base, [field]: newData } }; }); };

  // Helper function to update today's names when a name is entered
  const updateTodayNames = (name: string) => {
    if (name.trim() !== '') {
      // Auto-capitalize the name
      const capitalized = name.replace(/\b\w/g, l => l.toUpperCase());

      // Add to today's names if it's not already there
      setTodayNames(prev => {
        if (!prev.includes(capitalized)) {
          return [...prev, capitalized];
        }
        return prev;
      });
    }
  };

  // Function to filter suggestions based on input with performance optimization
  const filterSuggestions = (inputValue: string, inputId: number) => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
      setSuggestionsVisible(false);
      setActiveInputId(null);
      return;
    }

    // Only show suggestions for the active input
    setActiveInputId(inputId);

    const lowerInput = inputValue.toLowerCase();
    // Use a more efficient filtering algorithm with debouncing
    const suggestions = todayNames
      .filter(name => {
        const lowerName = name.toLowerCase();
        return lowerName.includes(lowerInput) && lowerName !== lowerInput;
      })
      .slice(0, 10); // Limit to 10 suggestions for performance

    setFilteredSuggestions(suggestions);
    setSuggestionsVisible(suggestions.length > 0);
    setCurrentSuggestionIndex(0);
  };

  // Function to select a suggestion
  const selectSuggestion = (suggestion: string, id: number) => {
    // Update the user's name field
    updateUser(id, 'name', suggestion);

    // Move focus to the next field (Time In)
    const nextField = 'timeIn';
    const el = document.getElementById(`${nextField}-${id}`);
    if (el) (el as HTMLInputElement).focus();

    // Hide suggestions
    setSuggestionsVisible(false);
    setActiveInputId(null);
  };

  const handleUniversalKeyDown = (e: React.KeyboardEvent, id: number, field: string, dataList: any[], type: 'users' | 'workers' | 'expenses') => {
    const fieldOrder: {[key: string]: string[]} = { 'users': ['cabinNumber', 'name', 'timeIn', 'timeOut', 'amount'], 'workers': ['name', 'salary', 'advance', 'bonus'], 'expenses': ['item', 'date', 'cost'] };
    const currentFields = fieldOrder[type]; const currentIndex = currentFields.indexOf(field); const rowIdx = dataList.findIndex(item => item.id === id);

    // Handle suggestion navigation if suggestions are visible and we're on the name field for the active input
    if (field === 'name' && suggestionsVisible && activeInputId === id) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentSuggestionIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSuggestionIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredSuggestions.length > 0 && currentSuggestionIndex >= 0) {
          selectSuggestion(filteredSuggestions[currentSuggestionIndex], id);
          return;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestionsVisible(false);
        setActiveInputId(null);
        return;
      }
    }

    if (e.key === 'Enter' || e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); if (currentIndex < currentFields.length - 1) { const nextField = currentFields[currentIndex + 1]; const el = document.getElementById(`${nextField}-${id}`); if (el) (el as HTMLInputElement).focus(); } else { if (rowIdx < dataList.length - 1) { const nextId = dataList[rowIdx + 1].id; const nextField = currentFields[0]; const el = document.getElementById(`${nextField}-${nextId}`); if (el) (el as HTMLInputElement).focus(); } } }
    else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); if (currentIndex > 0) { const prevField = currentFields[currentIndex - 1]; const el = document.getElementById(`${prevField}-${id}`); if (el) (el as HTMLInputElement).focus(); } else { if (rowIdx > 0) { const prevId = dataList[rowIdx - 1].id; const prevField = currentFields[currentFields.length - 1]; const el = document.getElementById(`${prevField}-${prevId}`); if (el) (el as HTMLInputElement).focus(); } } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (rowIdx < dataList.length - 1) { const nextId = dataList[rowIdx + 1].id; const el = document.getElementById(`${field}-${nextId}`); if (el) (el as HTMLInputElement).focus(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (rowIdx > 0) { const prevId = dataList[rowIdx - 1].id; const el = document.getElementById(`${field}-${prevId}`); if (el) (el as HTMLInputElement).focus(); } }
    // Handle backspace: if current field is empty, move to previous field
    else if (e.key === 'Backspace') {
      const input = e.target as HTMLInputElement;
      if (input.selectionStart === 0 && input.value === '') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevField = currentFields[currentIndex - 1];
          const el = document.getElementById(`${prevField}-${id}`);
          if (el) (el as HTMLInputElement).focus();
        } else {
          if (rowIdx > 0) {
            const prevId = dataList[rowIdx - 1].id;
            const prevField = currentFields[currentFields.length - 1];
            const el = document.getElementById(`${prevField}-${prevId}`);
            if (el) (el as HTMLInputElement).focus();
          }
        }
      }
    }
  };
  const updateUser = useCallback((id: any, field: string, value: any) => {
    if (field === 'name' && value.trim() !== '') {
      const isBlocked = blockList.some(badName => value.toLowerCase() === badName.toLowerCase());
      if (isBlocked) { setPoliceAlert(true); return; }
      updateTodayNames(value);
    }
    const user = currentData.users.find((u:any) => u.id === id);
    if (!user) return;

    // Determine if the session is still "live" (not expired).
    const sysPeriod = getSystemPeriod();
    const isOverdue = getOverdueMinutes(user.timeIn, user.timeOut, user.timeInPeriod || sysPeriod, user.timeOutPeriod || sysPeriod) >= 0;

    // Entry lock: once name + amount are both filled, most fields are frozen.
    // CRITICAL FIX: Allow editing as long as the row remains "live" (isOverdue is false).
    // cabinNumber is explicitly exempt — the operator must be able to reassign
    // a physical cabin at any time without unlocking the entire row.
    if (user.isLocked && isOverdue && field !== 'cabinNumber') return;

    const newUsers = currentData.users.map((u: any) => {
      if (u.id === id) {
        const updatedUser = { ...u, [field]: value };
        if (field === 'amount' && value !== '') updatedUser.isManualAmount = true;
        if (field === 'amount' && value === '') updatedUser.isManualAmount = false;
        return updatedUser;
      }
      return u;
    });
    updateMasterData('users', newUsers);
    saveSingleRow(id); // Task 2: per-row async save + Task 3: visual indicator
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockList, currentData.users, saveSingleRow]);

  // Partial-lock row — ONLY callable from the Amount field (onBlur / Enter)
  const checkAndLockRow = useCallback((id: any, fieldName?: string) => {
    // Hard guard: this function must only execute when triggered by the amount field
    if (fieldName !== 'amount') return;
    const user = currentData.users.find((u: any) => u.id === id);
    if (!user) return;
    // Require BOTH name and amount to trigger entry lock
    const hasName   = user.name   && String(user.name).trim()   !== '';
    const hasAmount = user.amount && String(user.amount).trim() !== '';
    if (!hasName || !hasAmount) return;

    let didLock = false;
    const newUsers = currentData.users.map((u: any) => {
      if (u.id === id) {
        if (!u.isLocked && u.name && u.name.trim()) {
          appendMunshiRecord(u, getStorageKey(currentDate, selectedDay));
          didLock = true;
        }
        return { ...u, isLocked: true };
      }
      return u;
    });
    updateMasterData('users', newUsers);
    // Task 4: immediate save the moment the row locks
    if (didLock) saveSingleRow(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData.users, currentDate, selectedDay, saveSingleRow]);

  const toggleSelect = (id: any) => { const newSelected = new Set(selectedIds); if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id); setSelectedIds(newSelected); };
  const updateWorker = (id: any, field: string, value: any) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, [field]: value === '' ? 0 : Number(value) } : w); updateMasterData('workers', newWorkers); };
  const updateWorkerRating = (id: any, newRating: number) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, rating: newRating } : w); updateMasterData('workers', newWorkers); };
  const updateWorkerName = (id: any, value: string) => { const newWorkers = currentData.workers.map((w: any) => w.id === id ? { ...w, name: value } : w); updateMasterData('workers', newWorkers); };
  const updateExpense = (id: any, field: string, value: any) => { const newExpenses = currentData.expenses.map((e: any) => e.id === id ? { ...e, [field]: value } : e); updateMasterData('expenses', newExpenses); };
  // noteIndex = 0-based grid position (0-239). Direct positional write — no id search.
  const updateNote = (noteIndex: number, field: 'a' | 'b', value: string) => {
    const existing = currentData.notes || [];
    // Ensure array covers at least noteIndex + 1 slots, preserving saved data
    const base: any[] = Array.from(
      { length: Math.max(240, noteIndex + 1) },
      (_, i) => existing[i] || { id: i + 1, a: '', b: '' }
    );
    base[noteIndex] = { ...base[noteIndex], [field]: value };
    updateMasterData('notes', base);
  };
  const addUserRow = useCallback(() => {
    const existing = currentData.users || [];
    const activeCount = existing.filter((u: any) => !u.isArchived).length;
    if (activeCount >= 240) return;
    const newNo = existing.length + 1;
    const newRow = { id: Date.now(), no: newNo, cabinNumber: '', name: '', timeIn: '', timeOut: '', timeInPeriod: getSystemPeriod(), timeOutPeriod: getSystemPeriod(), amount: '', isManualAmount: false, isLocked: false };
    updateMasterData('users', [...existing, newRow]);
  }, [currentData.users, updateMasterData]);
  const addWorker = () => updateMasterData('workers', [...currentData.workers, { id: Date.now(), name: 'New Worker', salary: 0, advance: 0, bonus: 0, rating: 0 }]);
  const addExpense = () => updateMasterData('expenses', [...currentData.expenses, { id: Date.now(), item: 'New Expense', cost: 0, date: '', isSpecial: false }]);
  const addSubLog = (type: 'generator' | 'tea') => { const newItem = { id: Date.now(), date: new Date().toISOString().split('T')[0], desc: '', amount: 0 }; if (type === 'generator') setGeneratorLogs([...generatorLogs, newItem]); if (type === 'tea') setTeaLogs([...teaLogs, newItem]); };
  const updateSubLog = (type: 'generator' | 'tea', id: number, field: string, value: any) => { const setter = type === 'generator' ? setGeneratorLogs : setTeaLogs; const current = type === 'generator' ? generatorLogs : teaLogs; setter(current.map(item => item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item)); };
  const addToBlockList = () => { if(blockInput.trim()) { setBlockList([...blockList, blockInput.trim()]); setBlockInput(""); } };
  const removeFromBlockList = (name: string) => { setBlockList(blockList.filter(b => b !== name)); };
  const initiateRating = (workerId: number, rating: number) => { setAuthAction({ type: 'RATE_WORKER', workerId, rating }); setShowAuthModal(true); };
  const initiateDeleteWorker = (id: number) => { setAuthAction({ type: 'DELETE_WORKER', id }); setShowAuthModal(true); };
  const initiateDeleteExpense = (id: number) => { setAuthAction({ type: 'DELETE_EXPENSE', id }); setShowAuthModal(true); };
  const handleLogin = () => { if (passwordInput === "CLICK2026" || passwordInput === adminPin) { performAuthAction(); } else { setAuthError(true); } };
  const performAuthAction = () => {
    setShowAuthModal(false);
    setPasswordInput('');
    setAuthError(false);
    if (authAction.type === 'ACCESS_HQ') {
      setCurrentView('financials');
    } else if (authAction.type === 'UNLOCK_ROW') {
      const newUsers = currentData.users.map((u: any) => u.id === authAction.id ? { ...u, isLocked: false } : u);
      updateMasterData('users', newUsers);
    } else if (authAction.type === 'RATE_WORKER') {
      const currentWorker = currentData.workers.find((w:any) => w.id === authAction.workerId);
      const finalRating = (currentWorker && currentWorker.rating === authAction.rating) ? 0 : authAction.rating;
      updateWorkerRating(authAction.workerId, finalRating);
    } else if (authAction.type === 'DELETE_WORKER') {
      const newWorkers = currentData.workers.filter((w: any) => w.id !== authAction.id);
      updateMasterData('workers', newWorkers);
    } else if (authAction.type === 'DELETE_EXPENSE') {
      const newExpenses = currentData.expenses.filter((e: any) => e.id !== authAction.id);
      updateMasterData('expenses', newExpenses);
    } else if (authAction.type === 'OPEN_SETTINGS') {
      setShowSettingsModal(true);
    }
  };
  const handleChangePassword = () => { if(newPassInput.length >= 4) { setAdminPin(newPassInput); setNewPassInput(""); setShowChangePassModal(false); alert("✅ Password Changed!"); } else { alert("❌ Too short!"); } };

  const allUsersTotal = currentData.users.reduce((sum: number, user: any) => sum + (Number(user.amount) || 0), 0);
  const selectedUserTotal = currentData.users.reduce((sum: number, user: any) => sum + (selectedIds.has(user.id) ? (Number(user.amount) || 0) : 0), 0);
  const displayTotal = selectedIds.size > 0 ? selectedUserTotal : allUsersTotal;
  const displayLabel = selectedIds.size > 0 ? "Selection Total" : "Today's Income";
  const totalExpenses = currentData.expenses.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0), 0);
  const totalPayable = currentData.workers.reduce((sum: number, w: any) => sum + ((w.salary + w.bonus) - w.advance), 0);
  const calculateFinancials = () => { let income = 0; let expense = 0; const processDay = (data: any) => { income += data.users.reduce((s:any, u:any) => s + (Number(u.amount) || 0), 0); expense += data.expenses.reduce((s:any, e:any) => s + (Number(e.cost) || 0), 0); expense += data.workers.reduce((s:any, w:any) => s + (w.salary + w.bonus - w.advance), 0); }; if (statPeriod === 'daily') processDay(currentData); else if (statPeriod === 'monthly') { const days = daysInMonth(currentDate); for(let d=1; d<=days; d++) { const key = getStorageKey(currentDate, d); if(masterData[key]) processDay(masterData[key]); } if (Object.keys(masterData).length === 0) processDay(currentData); } else if (statPeriod === 'yearly') { Object.keys(masterData).forEach(key => { if(key.startsWith(currentDate.getFullYear().toString())) processDay(masterData[key]); }); if (Object.keys(masterData).length === 0) processDay(currentData); } return { income, expense, profit: income - expense }; };
  const stats = calculateFinancials();

  // Calculate section totals — skip prepended archived rows so indices match the grid
  const archivedRowCount = currentData.users.filter((u: any) => u.isArchived).length;
  const section1Total = currentData.users
    .slice(archivedRowCount, archivedRowCount + 120)
    .reduce((sum: number, user: any) => sum + (Number(user.amount) || 0), 0);

  const section2Total = currentData.users
    .slice(archivedRowCount + 120, archivedRowCount + 240)
    .reduce((sum: number, user: any) => sum + (Number(user.amount) || 0), 0);

  const grandTotal = (Number(section1Total) || 0) + (Number(section2Total) || 0);
  const totalInventoryCost = Array.isArray(cafeItems) ? cafeItems.reduce((sum, item) => sum + (Number(item?.price) || 0), 0) : 0;
  const netBalance = (Number(grandTotal) || 0) - (Number(totalInventoryCost) || 0);

  // ── Sync net balance → CLICK_NET_SALES (feeds HISAB "Daily Sale" column) ──
  // Also writes CLICK_SELECTED_DATE so HISAB knows which date is active.
  useEffect(() => {
    const dateKey = getStorageKey(currentDate, selectedDay); // format: year-month0-day
    try {
      const store: Record<string, number> = JSON.parse(localStorage.getItem('CLICK_NET_SALES') || '{}');
      store[dateKey] = netBalance;
      localStorage.setItem('CLICK_NET_SALES', JSON.stringify(store));
      // Write currently selected date so HISAB can auto-navigate to it
      localStorage.setItem('CLICK_SELECTED_DATE', dateKey);
      window.dispatchEvent(new CustomEvent('click-net-sales-updated', { detail: { dateKey, value: netBalance } }));
      window.dispatchEvent(new CustomEvent('click-selected-date-changed', { detail: { dateKey } }));
    } catch { /* quota */ }
    setHisabDotActive(true);
    const timer = setTimeout(() => setHisabDotActive(false), 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netBalance, selectedDay, currentDate]);

  // Cafe inventory functions
  const addCafeItem = () => {
    if (itemName.trim() && itemPrice.trim()) {
      const newItem = {
        id: Date.now(),
        name: itemName.trim(),
        price: parseFloat(itemPrice) || 0
      };
      handleSetCafeItems([...cafeItems, newItem]);
      setItemName("");
      setItemPrice("");
      setInventoryToast('saved');
      setTimeout(() => setInventoryToast(null), 1500);
    }
  };

  const totalCafeSale = cafeItems.reduce((sum, item) => sum + item.price, 0);

  const forceSyncNow = async () => {
    try { await syncService.forceSyncAllRecords(); } catch (_) {}
  };

  // Backup functionality
  const [showBackupNotification, setShowBackupNotification] = useState(false);
  const [backupNotificationMessage, setBackupNotificationMessage] = useState('');
  const [backupNotificationType, setBackupNotificationType] = useState<'success' | 'error'>('success');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleManualBackup = async () => {
    try {
      await backupService.manualBackup();
      // Show success notification
      setBackupNotificationMessage('✅ Backup sent to muhammad.zahid.imam@gmail.com');
      setBackupNotificationType('success');
      setShowBackupNotification(true);

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowBackupNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Manual backup failed:', error);
      setBackupNotificationMessage('Backup failed. Please try again.');
      setBackupNotificationType('error');
      setShowBackupNotification(true);

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setShowBackupNotification(false);
      }, 3000);
    }
  };

  const scanHistory = (targetName: string, dateFilter: 'today' | 'monthly' | 'yearly' | 'custom', customDate?: string) => {
      let count = 0; let totalAmount = 0; let historyDetails: string[] = []; const lowerName = targetName.toLowerCase();
      const processData = (data: any, dateLabel: string) => { if (!data || !data.users) return; data.users.forEach((u: any) => { if (u.name && u.name.toLowerCase() === lowerName) { count++; const amt = Number(u.amount) || 0; totalAmount += amt; if (u.timeIn && u.timeOut) { historyDetails.push(`• ${dateLabel} | In: ${u.timeIn} - Out: ${u.timeOut} | 💰 ${amt}`); } else { historyDetails.push(`• ${dateLabel} | 💰 ${amt}`); } } }); };
      if (dateFilter === 'today') { processData(currentData, 'Aaj'); } else if (dateFilter === 'monthly') { const days = daysInMonth(currentDate); for(let d=1; d<=days; d++) { const key = getStorageKey(currentDate, d); if(masterData[key]) processData(masterData[key], `${d} Tareekh`); } if (Object.keys(masterData).length === 0) processData(currentData, 'Aaj'); } else if (dateFilter === 'yearly') { Object.keys(masterData).forEach(key => { if(key.startsWith(currentDate.getFullYear().toString())) processData(masterData[key], key); }); }
      return { count, totalAmount, historyDetails };
  };

  const handleAiSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput; const lowerMsg = userMsg.toLowerCase();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]); setChatInput("");
    if (awaitingAiAuth) { if (userMsg === adminPin) { setAwaitingAiAuth(false); setMessages(prev => [...prev, { sender: 'ai', text: `✅ Verified.\n\nJanab, ab Date batayein (e.g., 4 1 2026)`, isSecure: true }]); setAiContext({ status: 'WAITING_FOR_DATE', targetName: '', intent: aiContext.intent }); } else { setMessages(prev => [...prev, { sender: 'ai', text: `❌ Ghalat Password.` }]); setAwaitingAiAuth(false); } return; }
    if (lowerMsg.includes('profit') || lowerMsg.includes('kamai') || lowerMsg.includes('hq') || lowerMsg.includes('loss') || lowerMsg.includes('lose') || lowerMsg.includes('nuksan') || lowerMsg.includes('bachat')) { setAiContext({ status: 'IDLE', targetName: '', intent: 'PROFIT_LOSS' }); setMessages(prev => [...prev, { sender: 'ai', text: `🔒 Financial Data ke liye Password darj karein:` }]); setAwaitingAiAuth(true); return; }
    if (lowerMsg.includes('graph')) { setMessages(prev => [...prev, { sender: 'ai', text: `📊 **Graph Analysis:**\nGraph Tab dekhein.` }]); return; }

    const workerMatch = currentData.workers.find((w: any) => w.name && lowerMsg.includes(w.name.toLowerCase()));

    // Scope: current page ONLY — no history scan
    const userMatch = [...currentData.users].find(u => u.name && u.name.trim() !== "" && lowerMsg.includes(u.name.toLowerCase()));

    if (aiContext.status === 'WAITING_FOR_DATE') {
        let d: number | undefined, m: number | undefined, y: number | undefined;
        let isDateInput = false;

        if (lowerMsg.includes('today') || lowerMsg.includes('aaj') || lowerMsg.includes('abhi') || lowerMsg.includes('now')) {
            const nowObj = new Date();
            d = nowObj.getDate();
            m = nowObj.getMonth();
            y = nowObj.getFullYear();
            isDateInput = true;
        } else {
            const specificDateMatch = userMsg.match(/(\d{1,2})[\s\/\-\.]+(\d{1,2})[\s\/\-\.]+(\d{4})/);
            if (specificDateMatch) {
                d = parseInt(specificDateMatch[1]);
                m = parseInt(specificDateMatch[2]) - 1;
                y = parseInt(specificDateMatch[3]);
                isDateInput = true;
            }
        }

        if (isDateInput && d !== undefined && m !== undefined && y !== undefined) {
            if (new Date(y, m, d) > new Date()) { setMessages(prev => [...prev, { sender: 'ai', text: `❌ **${d}/${m+1}/${y}** abhi aayi nahi.` }]); return; }
            const key = `${y}-${m}-${d}`;
            if (aiContext.intent === 'PROFIT_LOSS') {
                 let dayIncome = 0; let dayExpense = 0;
                 if (masterData[key]) { dayIncome = masterData[key].users.reduce((s:any, u:any) => s + (Number(u.amount) || 0), 0); dayExpense = masterData[key].expenses.reduce((s:any, e:any) => s + (Number(e.cost) || 0), 0) + masterData[key].workers.reduce((s:any, w:any) => s + (w.salary + w.bonus - w.advance), 0); } else if (y === now.getFullYear() && m === now.getMonth() && d === now.getDate()) { const res = calculateFinancials(); dayIncome = res.income; dayExpense = res.expense; }
                 setMessages(prev => [...prev, { sender: 'ai', text: `💰 **Report (${d}/${m+1}/${y}):**\n\n🟢 Income: ${dayIncome}\n🔴 Expense: ${dayExpense}\n🏁 **Profit: ${dayIncome - dayExpense}**` }]);
            } else if (aiContext.intent === 'DETAIL' && aiContext.targetName) {
                 // Scope limited to current page — redirect historical queries to Brain
                 setMessages(prev => [...prev, { sender: 'ai', text: `❌ Ye naam aaj ki list mein nahi hai.\nPurani detail ke liye 'Brain' button use karein.` }]);
            }
            setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
            return;
        } else {
             if (workerMatch || userMatch) {
                 setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
             } else {
                 setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Date samajh nahi aayi. Format: 4 12 2025` }]); 
                 return;
             }
        }
    }

    if (workerMatch && userMatch && lowerMsg.includes(workerMatch.name.toLowerCase())) { setAiContext({ status: 'WAITING_FOR_TYPE', targetName: workerMatch.name, intent: 'DETAIL' }); setMessages(prev => [...prev, { sender: 'ai', text: `🤔 **"${workerMatch.name}"** Worker ya User?` }]); }
    else if (workerMatch) { const balance = workerMatch.salary + workerMatch.bonus - workerMatch.advance; setMessages(prev => [...prev, { sender: 'ai', text: `👷 **${workerMatch.name}:**\nSalary: ${workerMatch.salary}\nBalance: ${balance}` }]); }
    else if (userMatch) {
      // Current-page scope only — show today's record immediately, no history lookup
      const allMatches = currentData.users.filter((u: any) => u.name && u.name.trim().toLowerCase() === userMatch.name.trim().toLowerCase());
      const totalPaid = allMatches.reduce((s: number, u: any) => s + (Number(u.amount) || 0), 0);
      const rows = allMatches.map((u: any) => `• Cabin ${u.cabinNumber || '-'} | In: ${u.timeIn || '-'} → Out: ${u.timeOut || '-'} | Rs ${u.amount || 0}`).join('\n');
      setMessages(prev => [...prev, { sender: 'ai', text: `👤 **${userMatch.name}** (Aaj):\nTotal Paid: Rs ${totalPaid}\n${rows}` }]);
    }
    else if (aiContext.status === 'WAITING_FOR_TYPE') {
      if (lowerMsg.includes('worker')) {
        const wm = currentData.workers.find((w: any) => w.name === aiContext.targetName);
        if (wm) { const bal = wm.salary + wm.bonus - wm.advance; setMessages(prev => [...prev, { sender: 'ai', text: `👷 **${wm.name}:**\nSalary: ${wm.salary}\nBalance: ${bal}` }]); }
        setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
      } else {
        // User path — show current-page record immediately
        const um = currentData.users.find((u: any) => u.name === aiContext.targetName);
        if (um) {
          const allMatches = currentData.users.filter((u: any) => u.name && u.name.trim().toLowerCase() === aiContext.targetName.trim().toLowerCase());
          const totalPaid = allMatches.reduce((s: number, u: any) => s + (Number(u.amount) || 0), 0);
          const rows = allMatches.map((u: any) => `• Cabin ${u.cabinNumber || '-'} | In: ${u.timeIn || '-'} → Out: ${u.timeOut || '-'} | Rs ${u.amount || 0}`).join('\n');
          setMessages(prev => [...prev, { sender: 'ai', text: `👤 **${aiContext.targetName}** (Aaj):\nTotal Paid: Rs ${totalPaid}\n${rows}` }]);
        } else {
          setMessages(prev => [...prev, { sender: 'ai', text: `❌ Ye naam aaj ki list mein nahi hai.\nPurani detail ke liye 'Brain' button use karein.` }]);
        }
        setAiContext({ status: 'IDLE', targetName: '', intent: 'DETAIL' });
      }
    }
    else { setMessages(prev => [...prev, { sender: 'ai', text: `❌ Ye naam aaj ki list mein nahi hai.\nPurani detail ke liye 'Brain' button use karein.` }]); }
  };
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Smart Munshi: today-only instant search ──
  useEffect(() => {
    if (!munshiQuery.trim()) { setMunshiResult(null); setMunshiSearching(false); return; }
    setMunshiSearching(true);
    if (munshiDebounceRef.current) clearTimeout(munshiDebounceRef.current);
    munshiDebounceRef.current = setTimeout(() => {
      const target = munshiQuery.trim().toLowerCase();
      const todayKey = getStorageKey(currentDate, selectedDay);
      const todayDisplay = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay)
        .toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

      // Strictly filter only today's rows from live state — no history scan
      const matches: any[] = currentData.users.filter(
        (u: any) => u.name && u.name.trim().toLowerCase().includes(target)
      );

      if (matches.length === 0) {
        setMunshiResult(null);
      } else {
        const totalAmount = matches.reduce((s: number, u: any) => s + (Number(u.amount) || 0), 0);
        const totalVisits = matches.length;
        const avgAmount = totalVisits > 0 ? Math.round(totalAmount / totalVisits) : 0;

        const cabinCounts: { [k: string]: number } = {};
        matches.forEach((u: any) => {
          if (u.cabinNumber?.trim()) cabinCounts[u.cabinNumber] = (cabinCounts[u.cabinNumber] || 0) + 1;
        });
        const commonCabin =
          Object.keys(cabinCounts).sort((a, b) => cabinCounts[b] - cabinCounts[a])[0] || '--';

        const recentVisits = matches.map((u: any) => ({
          name: u.name,
          cabinNumber: u.cabinNumber || '',
          timeIn: u.timeIn || '',
          timeOut: u.timeOut || '',
          amount: Number(u.amount) || 0,
          date: todayDisplay,
          dateKey: todayKey,
          monthKey: '',
        }));

        setMunshiResult({
          name: matches[0].name,
          totalVisits,
          totalAmount,
          avgAmount,
          lastVisitDate: todayDisplay,
          firstVisitDate: todayDisplay,
          commonCabin,
          recentVisits,
        });
      }
      setMunshiSearching(false);
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [munshiQuery]);

  const renderPoliceModal = () => { if (!policeAlert) return null; return (<div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300"><div className="w-full max-w-2xl bg-red-950/90 border-4 border-red-500 rounded-3xl p-10 text-center animate-siren shadow-[0_0_100px_rgba(220,38,38,0.5)]"><h1 className="text-8xl mb-6">🚨</h1><h2 className="text-5xl font-black text-white uppercase mb-6 drop-shadow-lg tracking-widest">WARNING!</h2><p className="text-2xl font-bold text-white bg-black/50 p-6 rounded-xl border-2 border-red-400/50 mb-8 leading-relaxed">Admin ki taraf se ye user Allow nh hai foran police ko call karo</p><button onClick={() => setPoliceAlert(false)} className="bg-white text-red-900 font-black px-12 py-4 rounded-full text-2xl hover:scale-110 transition-transform shadow-xl uppercase">OK BOSS</button></div></div>); }
  const renderAuthModal = () => { if (!showAuthModal) return null; let modalTitle = "Security Check"; if (authAction.type === 'UNLOCK_ROW') modalTitle = "Unlock Row"; if (authAction.type === 'RATE_WORKER') modalTitle = "Admin Rating Access"; if (authAction.type === 'DELETE_WORKER' || authAction.type === 'DELETE_EXPENSE') modalTitle = "Confirm Delete"; return (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"><div className={`bg-slate-900 border-2 ${authError ? 'border-red-500 animate-pulse' : t.border} p-8 rounded-3xl w-full max-w-sm flex flex-col items-center text-center ${t.glow}`}><div className="mb-6 bg-slate-800 p-4 rounded-full">{authError ? <span className="text-4xl">⛔</span> : <span className="text-4xl">🔒</span>}</div><h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">{modalTitle}</h2><input type="password" autoFocus value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="PIN CODE" className="bg-black/50 border border-slate-600 text-center text-3xl text-white font-mono tracking-[0.5em] w-full p-4 rounded-xl focus:outline-none focus:border-cyan-500 mb-6 placeholder-slate-700" maxLength={9}/><button onClick={handleLogin} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${t.button}`}>CONFIRM</button><button onClick={() => { setShowAuthModal(false); setAuthError(false); setPasswordInput(''); }} className="mt-4 text-slate-500 text-xs hover:text-white">Cancel</button></div></div>); };
  const renderChangePassModal = () => { if (!showChangePassModal) return null; return (<div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"><div className="bg-slate-900 border border-purple-500 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl"><h2 className="text-xl font-bold text-purple-400 mb-4 uppercase">Change Password</h2><input type="text" value={newPassInput} onChange={(e) => setNewPassInput(e.target.value)} placeholder="New PIN Code" className="bg-black/50 border border-slate-700 text-white text-center text-xl p-3 rounded-lg w-full mb-4 focus:border-purple-500 outline-none"/><div className="flex gap-2"><button onClick={handleChangePassword} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold">Save</button><button onClick={() => setShowChangePassModal(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">Cancel</button></div></div></div>); };

  const renderAnalytics = () => {
    return (
      <ThreeDAnalytics theme={t} />
    );
  };

  const renderFinancials = () => (
    <div className={`p-4 h-full flex flex-col items-center justify-center animate-in fade-in duration-500 relative ${t.textMain}`}>
      <button onClick={() => setShowChangePassModal(true)} className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600 flex items-center gap-1 z-50">⚙️ Pass</button>
      <div className="text-center mb-8 animate-in zoom-in duration-1000">
        <h1 className="text-3xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-500 to-purple-600 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter">FINANCIAL HQ</h1>
        <p className={`text-sm font-bold tracking-[0.2em] uppercase text-orange-400`}>Welcome, <span className="text-white font-black">Owner</span></p>
      </div>
      <div className="mb-4 flex flex-col items-center gap-3">
        <button
          onClick={forceSyncNow}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-full font-bold shadow-lg border border-white/20 flex items-center gap-2 animate-pulse"
        >
          🔄 SYNC NOW
        </button>
        <button
          onClick={forceSyncNow}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-full font-bold shadow-lg border border-white/20 flex items-center gap-2"
        >
          🚀 FORCE SYNC ALL
        </button>
      </div>
      
      <div className="flex w-full max-w-6xl gap-6 mb-8 items-stretch h-full">
          <div className={`w-1/4 max-w-[200px] ${t.panelBg} p-3 rounded-xl border ${t.border} flex flex-col shadow-lg`}>
            <h3 className="text-red-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs"><span className="text-lg">🚫</span> Blacklist</h3>
            <div className="flex gap-1 mb-2">
                <input value={blockInput} onChange={(e)=>setBlockInput(e.target.value)} placeholder="Name..." className="flex-1 bg-black/50 border border-slate-600 rounded px-2 py-1 outline-none text-[10px] text-white"/>
                <button onClick={addToBlockList} className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded font-bold text-[10px] text-white">+</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {blockList.map((name, i) => (<div key={i} className="bg-red-900/40 border border-red-500/50 p-1.5 rounded flex justify-between items-center hover:bg-red-900/60"><span className="text-red-200 font-bold text-xs truncate w-20">{name}</span><button onClick={()=>removeFromBlockList(name)} className="hover:text-white text-red-400 font-bold text-xs px-1">✕</button></div>))}
                {blockList.length === 0 && <span className="text-slate-500 italic text-[10px] text-center mt-4">No Data</span>}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
             <div className="flex justify-center gap-2">{(['daily', 'monthly', 'yearly'] as StatPeriod[]).map(period => (<button key={period} onClick={() => setStatPeriod(period)} className={`px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest transition-all duration-300 ${statPeriod === period ? t.button + ' text-white scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>{period}</button>))}</div>
             
             <div className="grid grid-cols-2 gap-4 flex-1">
                <div className={`group relative ${t.panelBg} border ${t.border} rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg hover:bg-white/5 transition-all`}>
                    <h3 className={`font-bold uppercase tracking-widest text-xs mb-1 ${t.textAccent}`}>Revenue</h3>
                    <div className={`text-2xl md:text-3xl font-mono font-black ${t.textMain}`}>{stats.income.toLocaleString()}</div>
                </div>
                <div className={`group relative ${t.panelBg} border ${t.border} rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg hover:bg-white/5 transition-all`}>
                    <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Expenses</h3>
                    <div className={`text-2xl md:text-3xl font-mono font-black ${t.textMain}`}>{stats.expense.toLocaleString()}</div>
                </div>
                <div className={`col-span-2 group relative ${t.panelBg} border-2 ${t.border} rounded-2xl p-6 flex flex-col justify-center items-center shadow-2xl hover:scale-[1.02] transition-transform bg-gradient-to-r from-black/40 via-transparent to-black/40`}>
                    <h3 className={`font-black uppercase tracking-widest text-sm mb-2 ${t.textHighlight}`}>NET PROFIT</h3>
                    <div className={`text-5xl md:text-6xl font-mono font-black ${t.textMain} drop-shadow-lg`}>{stats.profit.toLocaleString()} <span className="text-lg text-slate-500">PKR</span></div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );

  // --- RENDER EXPENSES (FIXED & SAFE) ---
  const renderExpenses = () => (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className={`text-xl ${t.textAccent} mb-4 font-bold border-b ${t.border} pb-2`}>Expenses ({selectedDay} {formatMonthYear(currentDate)})</h2>
      <div className={`${t.panelBg} shadow-lg`}>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className={`bg-black/50 ${t.textAccent} uppercase text-xs`} style={{paddingBottom: '8px'}}><tr><th className="p-4">Expense Item</th><th className="p-4">Date</th><th className="p-4 text-right">Cost (PKR)</th><th className="p-4 text-center">Action</th></tr></thead>
          <tbody>
            {currentData.expenses.map((e: any) => {
               if (e.isSpecial) {
                 const icon = e.type === 'generator' ? '⚡' : '☕';
                 return (
                    <tr key={e.id} onClick={() => setActiveModal(e.type)} className={`group cursor-pointer hover:bg-white/5 relative`}>
                      <td className={`p-4 font-bold ${t.textMain} flex items-center gap-3`}><span className="text-2xl">{icon}</span><span className={`uppercase tracking-widest text-xl font-bold ${t.textAccent}`}>{e.item}</span><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">DETAILS</span></td>
                      <td className="p-4 text-slate-500 text-sm italic">Auto-calculated</td>
                      <td className="p-4 text-right"><div className={`font-mono font-black text-2xl ${t.textHighlight}`}>{e.cost.toLocaleString()}</div></td>
                      <td className="p-4 text-center"><span className="text-slate-600">🔒</span></td>
                    </tr>
                 );
               }
               return (
                  <tr key={e.id} className="hover:bg-white/5">
                    <td className="p-4"><input id={`item-${e.id}`} value={e.item} onChange={(ev)=>updateExpense(e.id, 'item', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'item', currentData.expenses, 'expenses')} className={`bg-transparent outline-none w-full text-xl font-bold ${t.textMain} placeholder-slate-700`}/></td>
                    <td className="p-4"><input id={`date-${e.id}`} type="date" value={e.date} onChange={(ev)=>updateExpense(e.id, 'date', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'date', currentData.expenses, 'expenses')} className="bg-transparent outline-none text-slate-400 font-bold"/></td>
                    <td className="p-4 text-right"><input id={`cost-${e.id}`} type="number" value={e.cost === 0 ? '' : e.cost} placeholder="0" onChange={(ev)=>updateExpense(e.id, 'cost', ev.target.value)} onKeyDown={(ev) => handleUniversalKeyDown(ev, e.id, 'cost', currentData.expenses, 'expenses')} className={`bg-transparent text-right outline-none w-40 text-2xl font-black ${t.textHighlight} placeholder-slate-700`}/></td>
                    <td className="p-4 text-center"><button onClick={() => initiateDeleteExpense(e.id)} className="text-slate-500 hover:text-red-500 transition-colors text-xl">🗑️</button></td>
                  </tr>
               );
            })}
            <tr className="bg-black/30"><td className={`p-6 font-bold ${t.textAccent} uppercase tracking-wider text-xl`}>Total</td><td></td><td className={`p-6 text-right font-mono font-black text-4xl ${t.textHighlight}`}>{totalExpenses.toLocaleString()}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <button onClick={addExpense} className={`mt-4 px-6 py-3 ${t.button} text-white rounded-lg text-sm font-bold border border-white/20 flex items-center gap-2 shadow-lg`}><span className="text-xl">+</span> Add New Expense</button>
    </div>
  );

  const renderDetailsModal = () => { if (!activeModal) return null; const isGen = activeModal === 'generator'; const logs = isGen ? generatorLogs : teaLogs; const modalTotal = logs.reduce((s, i) => s + i.amount, 0); return (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"><div className={`relative w-full max-w-4xl ${t.panelBg} border-2 ${t.border} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}><div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20"><div><h2 className={`text-3xl font-black italic tracking-tighter ${t.textAccent} drop-shadow-md`}>{isGen ? "GENERATOR" : "TEA"}</h2></div><button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center">✕</button></div><div className="p-6 overflow-y-auto custom-scrollbar flex-1"><table className="w-full text-left text-sm text-white/80"><thead className={`uppercase text-xs font-bold ${t.textAccent} border-b border-white/10`}><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3 text-right">Cost</th></tr></thead><tbody className="divide-y divide-white/10">{logs.map((log) => (<tr key={log.id} className="hover:bg-white/5 transition-colors"><td className="p-3"><input type="date" value={log.date} onChange={(e)=>updateSubLog(activeModal, log.id, 'date', e.target.value)} className="bg-transparent outline-none text-white/70"/></td><td className="p-3"><input value={log.desc} placeholder="Item details..." onChange={(e)=>updateSubLog(activeModal, log.id, 'desc', e.target.value)} className="bg-transparent outline-none w-full placeholder-white/20"/></td><td className="p-3 text-right"><input type="number" value={log.amount} onChange={(e)=>updateSubLog(activeModal, log.id, 'amount', e.target.value)} className={`bg-transparent outline-none text-right font-bold text-xl ${t.textAccent} w-32`}/></td></tr>))}</tbody></table><button onClick={() => addSubLog(activeModal)} className={`mt-6 w-full py-3 rounded-xl border border-dashed border-white/30 text-white/50 hover:bg-white/5 hover:text-white transition-all uppercase font-bold tracking-widest`}>+ Add Entry</button></div><div className="p-6 bg-black/40 border-t border-white/10 flex justify-between items-center"><span className="text-white/50 uppercase tracking-widest font-bold">Total Cost</span><span className={`text-4xl font-black ${t.textAccent}`}>{modalTotal.toLocaleString()}</span></div></div></div>); };

  const goToToday = () => {
    const t2 = new Date();
    setCurrentDate(new Date(t2.getFullYear(), t2.getMonth(), 1));
    setSelectedDay(t2.getDate());
    setSelectedIds(new Set());
  };

  const renderMonthNavigator = () => {
    // Build the date string in LOCAL time (avoids UTC-offset shift bug)
    const y  = currentDate.getFullYear();
    const m  = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d  = String(selectedDay).padStart(2, '0');
    const dateValue = `${y}-${m}-${d}`;

    return (
    <div className="flex items-center gap-2 rounded-lg p-1 border border-slate-700/50 min-w-[200px]" style={{ background: '#111827' }}>
      <button onClick={() => changeMonth(-1)} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 hover:text-white transition-colors ${t.textAccent}`}>◀</button>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => {
          const val = e.target.value; // "YYYY-MM-DD"
          if (!val) return;
          // Parse manually — new Date(string) treats it as UTC and shifts the day
          const [ny, nm, nd] = val.split('-').map(Number);
          setCurrentDate(new Date(ny, nm - 1, 1)); // month is 0-indexed
          setSelectedDay(nd);
          setSelectedIds(new Set());
        }}
        className={`bg-transparent text-sm font-bold ${t.textMain} uppercase tracking-widest w-full text-center select-none truncate px-2 py-1 border-none outline-none cursor-pointer`}
      />
      <button onClick={() => changeMonth(1)} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 hover:text-white transition-colors ${t.textAccent}`}>▶</button>
      {/* Go to Today */}
      <button
        onClick={goToToday}
        title="Go to Today"
        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/10 text-slate-500 hover:text-white hover:border-white/30 transition-colors whitespace-nowrap ml-1"
      >Today</button>
    </div>
  )};
  const renderCabinsLeftCounter = () => {
    const occupied = occupiedRowCount;
    const available = TOTAL_ROW_CAPACITY - occupied;
    const freeCount = availableCabins1to30.length;
    const usedCount = 30 - freeCount;

    return (
      <>
        {/* CABIN BAR — numbers only, black/white, zero labels, minimum height */}
        {currentView === 'users' && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: '#000000',
            borderBottom: '1px solid rgba(var(--theme-accent-rgb, 34,211,238), 0.22)',
            padding: '3px 8px',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3,
            minHeight: 0,
          }}>
            {availableCabins1to30.length === 0 ? (
              <span style={{
                fontSize: 8, color: '#666666', fontFamily: 'monospace',
                fontWeight: 900, letterSpacing: '0.2em', padding: '2px 0',
              }}>FULL</span>
            ) : (
              availableCabins1to30.map((n) => {
                // Box size scales with font: padding = 0.5em each side, min-width = 2.2em
                const boxSize = Math.round(serialSize * 2.2);
                return (
                  <div key={n} style={{
                    minWidth: boxSize, height: boxSize,
                    padding: '0 3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#111111',
                    border: '1px solid #3a3a3a',
                    borderRadius: Math.max(2, Math.round(serialSize * 0.2)),
                    fontSize: serialSize, fontWeight: 900,
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    lineHeight: 1,
                  }}>
                    {n}
                  </div>
                );
              })
            )}
            {/* Font-size controls — right-aligned */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => setSerialSize(s => Math.max(8, s - 2))}
                disabled={serialSize <= 8}
                style={{
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: serialSize <= 8 ? '#1a1a1a' : '#1a1a2e',
                  border: `1px solid ${serialSize <= 8 ? '#333' : '#2563eb'}`,
                  borderRadius: 4,
                  color: serialSize <= 8 ? '#444' : '#60a5fa',
                  fontSize: 11, fontWeight: 900,
                  fontFamily: 'monospace',
                  cursor: serialSize <= 8 ? 'not-allowed' : 'pointer',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
                title="Decrease cabin font size"
              >a-</button>
              <button
                onClick={() => setSerialSize(s => Math.min(32, s + 2))}
                disabled={serialSize >= 32}
                style={{
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: serialSize >= 32 ? '#1a1a1a' : '#1a1a2e',
                  border: `1px solid ${serialSize >= 32 ? '#333' : '#2563eb'}`,
                  borderRadius: 4,
                  color: serialSize >= 32 ? '#444' : '#60a5fa',
                  fontSize: 11, fontWeight: 900,
                  fontFamily: 'monospace',
                  cursor: serialSize >= 32 ? 'not-allowed' : 'pointer',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
                title="Increase cabin font size"
              >A+</button>
            </div>
          </div>
        )}

        {/* ── Row stats strip (non-users views) ── */}
        {currentView !== 'users' && (
          <div className={`shrink-0 border-b ${t.border}`} style={{ background: '#000000' }}>
            <div className="flex items-center gap-4 px-4 py-1.5 flex-wrap">
              <span style={{ fontSize: 12, fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                {available}
                <span style={{ fontWeight: 400, color: '#555555' }}>/{TOTAL_ROW_CAPACITY}</span>{' '}
                <span style={{ fontWeight: 400, color: '#888888' }}>rows free</span>
              </span>
              {occupied > 0 && (
                <span style={{ fontSize: 10, color: '#aaaaaa', fontWeight: 700, fontFamily: 'monospace' }}>
                  {occupied} active
                </span>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderNotesColumn = () => {
    const notes = currentData.notes || Array.from({ length: 240 }, (_: any, i: number) => ({ id: i + 1, a: '', b: '' }));
    const inputCls = "w-full h-7 bg-black/20 border border-dotted border-yellow-700/40 text-yellow-400/80 text-[9px] text-center focus:outline-none focus:border-yellow-500 rounded-sm placeholder-yellow-900/30 font-mono";
    return (
      <div className="flex flex-col">
        {/* Header spacer — matches renderUserBlock header height */}
        <div className="sticky top-0 z-50 flex items-center justify-center" style={{ height: '38px', paddingBottom: '8px', background: t.bgMain }}>
          <span className="text-[7px] text-yellow-700/60 uppercase tracking-widest font-bold">rough</span>
        </div>
        {notes.map((note: any, noteIdx: number) => (
          <div key={noteIdx} className="h-10 mx-0.5 my-1 flex items-center gap-0.5">
            <input type="text" value={note.a ?? ''} onChange={(e) => updateNote(noteIdx, 'a', e.target.value)} className={inputCls} placeholder="·" maxLength={12} />
            <input type="text" value={note.b ?? ''} onChange={(e) => updateNote(noteIdx, 'b', e.target.value)} className={inputCls} placeholder="·" maxLength={12} />
          </div>
        ))}
      </div>
    );
  };

  const renderUserBlock = (start: number, end: number, noteField: 'a' | 'b' = 'a', scrollTop: number = 0, viewportH: number = 800) => {
    const GRID = "grid grid-cols-[5%_8%_25%_12%_12%_10%_15%_13%] items-center w-full";
    const totalUsers = currentData.users.length || 240;
    const notes = (currentData as any).notes || Array.from({ length: 240 }, (_: any, i: number) => ({ id: i + 1, a: '', b: '' }));
    const allRows = currentData.users.slice(start, end);

    // ── 4-Tier Live-First Sort ────────────────────────────────────────────────
    // P0 — READY:     the single first-empty slot — always pinned at top of section
    // P1 — ALERT:     live session, timeLeft > 0 and <= 10 min  (blinking urgency)
    // P2 — LIVE:      live session, timeLeft > 10 min
    // P3 — DEAD:      named row whose session has expired / invalid duration
    // P4 — EMPTY:     all remaining empty/draft rows (below dead)
    // Sorts display order only — underlying data array is never mutated.
    // Focus-freeze: the row currently being typed into keeps its current position.
    const _sp = getSystemPeriod();
    const _getRowPriority = (u: any): number => {
      if (!u.name || !u.name.trim()) return 4;          // empty row (further classified below)
      const hasIn  = u.timeIn  && u.timeIn.trim();
      const hasOut = u.timeOut && u.timeOut.trim();
      if (hasIn && hasOut) {
        const ip2 = u.timeInPeriod  || _sp;
        const op2 = u.timeOutPeriod || _sp;
        const sM  = parseTimeToMinutes(u.timeIn,  ip2);
        const eM  = parseTimeToMinutes(u.timeOut, op2);
        const diff = (sM !== null && eM !== null) ? eM - sM : null;
        const dur  = diff === null ? 0 : (diff < 0 ? diff + 720 : diff);
        if (dur <= 0) return 3;                         // zero-duration = dead
        const rem = getTimeRemainingMinutes(u.timeIn, u.timeOut, ip2, op2);
        if (rem > 0 && rem <= 10) return 1;             // P1 — blinking alert ≤10 min
        if (rem > 0)              return 2;             // P2 — standard live >10 min
        return 3;                                       // P3 — expired/dead
      }
      return 3;                                         // named but incomplete times = dead
    };

    // P0 identity: the empty row with the lowest `user.no` in this section.
    // Exactly one row per section gets priority 0 — the natural first empty slot.
    const firstEmptyNo: number = allRows.reduce((min: number, u: any) => {
      if (u.name && u.name.trim()) return min;          // skip named rows
      return u.no < min ? u.no : min;
    }, Infinity);

    const focusedId = focusedRowIdRef.current;
    const sortedRows = [...allRows].sort((a: any, b: any) => {
      // Focused row stays frozen in place during typing
      if (a.id === focusedId && b.id !== focusedId) return -1;
      if (b.id === focusedId && a.id !== focusedId) return 1;

      const isAEmpty = !a.name || !a.name.trim();
      const isBEmpty = !b.name || !b.name.trim();

      // P0: only the first-empty row gets priority 0; all others keep P4
      const pa = (isAEmpty && a.no === firstEmptyNo) ? 0 : (isAEmpty ? 4 : _getRowPriority(a));
      const pb = (isBEmpty && b.no === firstEmptyNo) ? 0 : (isBEmpty ? 4 : _getRowPriority(b));

      if (pa !== pb) return pa - pb;

      // Tier-internal Sort: If both are LIVE/ALERT (P1 or P2), sort by Remaining Time ASC
      if (pa === 1 || pa === 2) {
        const remA = getTimeRemainingMinutes(a.timeIn, a.timeOut, a.timeInPeriod || _sp, a.timeOutPeriod || _sp, now);
        const remB = getTimeRemainingMinutes(b.timeIn, b.timeOut, b.timeInPeriod || _sp, b.timeOutPeriod || _sp, now);
        // Compare remaining minutes; smallest first (urgent)
        if (remA !== remB) return remA - remB;
      }

      return a.no - b.no; // stable tie-break by original slot number
    });
    // ─────────────────────────────────────────────────────────────────────────

    const rowCount = sortedRows.length;
    const isSection1 = noteField === 'a';
    // ─────────────────────────────────────────────────────────────────────────
    return (
    <div className="max-w-full overflow-x-hidden relative z-[10]" style={{ background: '#020617', paddingTop: '38px' }}>
      {/* Fixed column headers */}
      <div
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0,
          width: '100%',
          zIndex: 1001, 
          background: t.bgMain,
          backgroundColor: 'var(--bg-main)',
          display: 'block',
          height: '38px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderBottom: `2px solid ${t.border}`
        }}
      >
        <div
          className={`${GRID} font-black text-[9px] uppercase py-1.5`}
          style={{ borderBottom: '1px solid rgba(var(--theme-accent-rgb, 251,191,36), 0.18)', letterSpacing: '0.12em' }}
        >
          <div className="text-center" style={{ color: '#fbbf24', fontFamily: 'monospace' }}>S.No</div>
          <div className="text-center" style={{ color: '#fbbf24', fontFamily: 'monospace' }}>Cabin</div>
          <div className="px-1" style={{ color: '#94a3b8' }}>NAME</div>
          <div className="text-center" style={{ color: '#fb923c' }}>In</div>
          <div className="text-center" style={{ color: '#fb923c' }}>Out</div>
          <div className="text-center" style={{ color: '#22d3ee' }}>DUR</div>
          <div className="text-right pr-1" style={{ color: '#94a3b8' }}>Amt</div>
          <div className="hidden sm:block text-center" style={{ color: 'rgba(161,161,170,0.3)' }}>~</div>
        </div>
      </div>
      {/* Force render all 120 rows — virtual windowing removed */}
      {sortedRows.map((user: any, idx: number) => {
        // noteIndex uses user.no (stable slot position 1-240) so notes survive sort reordering
        const noteIndex = user.no !== undefined ? user.no - 1 : ((isSection1 ? 0 : 120) + idx);
        const rowNote = notes[noteIndex] || { id: noteIndex + 1, a: '', b: '' };
        const isSelected = selectedIds.has(user.id);
        const sysPeriod = getSystemPeriod();
        const ip = user.timeInPeriod || sysPeriod;
        const op = user.timeOutPeriod || sysPeriod;
        const overdueMinutes = getOverdueMinutes(user.timeIn, user.timeOut, ip, op);
        const timeRemainingMinutes = getTimeRemainingMinutes(user.timeIn, user.timeOut, ip, op);
        // totalSessionMins: raw minute difference, negative wraps +720 (12h).
        // Strictly 0 when times are identical (same-in-same-out = zero session).
        const sMins = parseTimeToMinutes(user.timeIn, ip);
        const eMins = parseTimeToMinutes(user.timeOut, op);
        const _rawDiff = (sMins !== null && eMins !== null) ? eMins - sMins : null;
        const totalSessionMins = _rawDiff === null ? 0 : (_rawDiff < 0 ? _rawDiff + 720 : _rawDiff);

        // ** BLINK LOGIC **
        const hasName = user.name && user.name.trim() !== '';
        const hasTime = user.timeOut && user.timeOut.trim() !== '';
        let isTimeUp = false; let isWarning = false;
        if (hasName && hasTime) { isTimeUp = overdueMinutes >= 0; isWarning = overdueMinutes >= -10 && overdueMinutes < 0; }

        // ** NEW 10-MINUTE WARNING LOGIC ** - Blink when 10 minutes or less remaining for active (unlocked) rows
        // Show warning for rows that have a name, timeOut, and have 10 or fewer minutes remaining (regardless of lock status)
        const isTenMinuteWarning = hasName && hasTime && timeRemainingMinutes <= 10 && timeRemainingMinutes > 0;

        // For the 10-minute warning, we want to show it regardless of whether the row is locked/frozen
        // The warning should continue until timeout is reached, even if the row is frozen
        const showTenMinuteWarning = isTenMinuteWarning;

        // ** CABIN COLOR LOGIC **
        let cabinColor = '#fbbf24'; // Default amber/gold
        if (hasName && hasTime && totalSessionMins > 0) {
          const remPercent = (timeRemainingMinutes / totalSessionMins) * 100;
          if (remPercent > 70) cabinColor = '#22c55e';        // Full Green
          else if (remPercent >= 40) cabinColor = '#84cc16';   // Light Green/Lime
          else if (remPercent >= 15) cabinColor = '#eab308';   // Yellow
          else if (remPercent > 0) cabinColor = '#f97316';    // Orange
          else cabinColor = '#ef4444';                        // Bright Red
        }

        // For the row class, we distinguish between locked due to timeout and locked due to both fields filled
        // Timeout-lock only applies to rows that were explicitly committed (user.isLocked === true).
        // An uncommitted row (still being filled) must stay fully editable regardless of clock time.
        const isLockedByTimeout = isTimeUp && user.isLocked;
        // isLockedByFields: row visually styled as locked (bg, row-spring, etc.)
        const isLockedByFields = user.isLocked && user.name && user.name.trim() !== '' && user.amount && String(user.amount).trim() !== '';
        // isEntryLocked: partial lock — only Name + Amount inputs are disabled
        const isEntryLocked = isLockedByFields;
        const isLocked = isLockedByTimeout || isLockedByFields;

        const isDraft = !!user.isDraft;
        const isArchived = user.isArchived || false;
        const isConflict = !isLocked && currentData.users.some((u: any) => u.id !== user.id && u.name && u.name.toLowerCase().trim() === user.name.toLowerCase().trim());
        const cabinNum = Number(user.cabinNumber);
        const isCabinInvalid = cabinOverLimitId === user.id || cabinDuplicateId === user.id; // flashes red when over 30 or duplicate

        // Determine if this is an active/live session - NEW LOGIC: Name is not empty AND Time Out is empty
        const isActiveSession = user.name && user.name.trim() !== '' && (!user.timeOut || user.timeOut.trim() === '');

        // P0 — Ready row: the single first-empty slot in this section (blinking amber)
        const isReadyRow = (!user.name || !user.name.trim()) && user.no === firstEmptyNo;

        let rowClass = `${GRID} text-sm h-10 cursor-pointer transition-all duration-200 overflow-hidden border-b border-white/[0.04] `;

        // Apply warning/lock states in priority order
        if (isArchived) {
            // Archived rows — muted, no animation
            rowClass += 'bg-slate-800/70 text-slate-400 font-normal opacity-80';
        }
        else if (isLockedByTimeout) {
            // FULL FREEZE — stable dark steel, no blink, lock icon
            rowClass += 'frozen-row text-zinc-500 font-bold';
        }
        else if (showTenMinuteWarning) {
            // P1 — ≤10 min amber (static text, no blink)
            rowClass += 'text-amber-200 font-bold';
        }
        else if (isWarning) {
            // ~0-2 min remaining — orange neon (static text, no pulse)
            rowClass += 'text-orange-300';
            if (isLockedByFields) rowClass += ' font-bold';
        }
        else if (isSelected) {
            rowClass += 'bg-cyan-900/40';
        }
        else if (isActiveSession) {
            rowClass += 'bg-emerald-900/30';
        }
        else if (isReadyRow) {
            // P0 — first empty slot: blinking amber border, dark navy bg, ready for input
            rowClass += 'row-ready-blink';
        }
        else if (isDraft) {
            rowClass += 'draft-row focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-inset focus-within:ring-cyan-500/20';
        }
        else {
            rowClass += 'bg-slate-900/50 hover:bg-slate-800/60';
        }

        // Always show shimmer for Crystal Glass Edition (pure CSS, no state)
        if (themeIndex === 8) {
            rowClass += ' relative overflow-hidden';
        }

        return (
          <div
            key={isDraft ? `draft-${user.id}` : user.id}
            className={`${rowClass} group relative cv-row${isLockedByFields ? ' row-spring' : ''}`}
            onFocus={() => { focusedRowIdRef.current = user.id; }}
            onBlur={() => { focusedRowIdRef.current = null; }}
          >
            {/* Task 3: per-row saving indicator — green pulse dot */}
            {savingRowIds.has(user.id) && (
              <span
                title="Saving…"
                className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400 z-20 pointer-events-none"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.9)', animation: 'pulse 1s ease-in-out infinite' }}
              />
            )}
            {/* Shimmer overlay — Crystal Glass Edition only, CSS-driven */}
            {themeIndex === 8 && (
              <div className="absolute inset-0 shimmer pointer-events-none"></div>
            )}

            {/* Tooltip for active sessions - NEW LOGIC: Show only when Time Out is empty */}
            {isActiveSession && (
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                ONLINE
              </div>
            )}
            {/* S.No — fixed, non-editable serial number 1-240 */}
            <div
              onClick={() => !isLockedByFields && !isDraft && toggleSelect(user.id)}
              className="relative text-center select-none"
              style={{
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: 10,
                letterSpacing: '0.05em',
                WebkitFontSmoothing: 'antialiased',
                color: isDraft
                  ? 'rgba(100,116,139,0.45)'
                  : isLockedByTimeout
                    ? 'rgba(113,113,122,0.5)'
                    : isSelected
                      ? '#fbbf24'
                      : 'rgba(251,191,36,0.55)',
                textShadow: isDraft ? 'none' : isSelected ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
                cursor: isDraft ? 'default' : 'pointer',
              }}
            >
              {user.no}
              {isArchived && <span className="ml-1 text-[9px]">📋</span>}
              {isEntryLocked && !isLockedByTimeout && (
                <button
                  title="Admin Unlock (Zahid ImAm)"
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity z-30 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40"
                  onClick={(e) => { e.stopPropagation(); setAuthAction({ type: 'UNLOCK_ROW', id: user.id }); setShowAuthModal(true); }}
                >🔓</button>
              )}
            </div>
            {/* Cabin number cell — editable for all non-expired rows */}
            <div className="relative group/c" style={{ minWidth: 0 }}>
              {/* Pencil hint — visible on hover when not expired */}
              {!isLockedByTimeout && (
                <span
                  className="absolute -top-1 right-0 opacity-0 group-hover/c:opacity-80 transition-opacity pointer-events-none select-none"
                  style={{ fontSize: 9, color: '#60a5fa', lineHeight: 1, textShadow: '0 0 6px rgba(96,165,250,0.7)' }}
                  title="Click to edit cabin number"
                >✏</span>
              )}
            <input
              id={`cabinNumber-${user.id}`}
              disabled={isLockedByTimeout}
              readOnly={isLockedByTimeout}
              tabIndex={0}
              title={isLockedByTimeout ? 'Session expired — cabin locked' : 'Click to change cabin number'}
              className={`bg-transparent text-center font-black focus:outline-none placeholder-slate-700/50 w-full border-b ${isLockedByTimeout ? 'text-zinc-600 border-transparent' : isCabinInvalid ? 'border-red-500 text-red-400 animate-pulse' : 'border-white/5 hover:border-white/25 focus:border-white/30'}`}
              style={{ 
                cursor: isLockedByTimeout ? 'not-allowed' : 'text',
                fontSize: `${serialSize}px`,
                color: isLockedByTimeout ? '#52525b' : cabinColor,
                textShadow: !isLockedByTimeout ? `0 0 8px ${cabinColor}44` : 'none'
              }}
              placeholder="#"
              value={user.cabinNumber}
              autoComplete="one-time-code"
              spellCheck={false}
              data-lpignore="true"
              name={`cabin-${user.id}`}
              onClick={(e) => (e.target as HTMLInputElement).focus()}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') { updateUser(user.id, 'cabinNumber', ''); return; }
                if (!/^\d+$/.test(raw)) return; // digits only
                const num = parseInt(raw, 10);
                if (num > 30) {
                  // Flash red border and block the update
                  if (cabinOverLimitTimerRef.current) clearTimeout(cabinOverLimitTimerRef.current);
                  setCabinOverLimitId(user.id);
                  cabinOverLimitTimerRef.current = setTimeout(() => setCabinOverLimitId(null), 800);
                  return;
                }

                // Smart Duplicate Check: 
                // We only block if the final typed string exactly matches another active cabin.
                // This allows typing '1' then '11' even if cabin 1 is active, 
                // because '1' (while typing) is treated as a partial intent.
                const isDuplicate = currentData.users.some((u: any) => {
                  if (u.id === user.id) return false;
                  // Numeric comparison so "05" and 5 are treated as the same cabin
                  // Important: we compare the parsed num to the parsed cabinNumber of others
                  if (Number(u.cabinNumber ?? 0) !== num) return false;

                  // Only check live rows (not expired)
                  if (u.timeOut && u.timeOut.trim() !== '') {
                    const overdue = getOverdueMinutes(u.timeIn, u.timeOut, u.timeInPeriod || getSystemPeriod(), u.timeOutPeriod || getSystemPeriod());
                    if (overdue >= 0) return false; // expired — cabin is free
                  }
                  return true;
                });

                // If it's a duplicate, we show the alert but DON'T block the keystroke if it's potentially 
                // a partial number (less than 2 digits and could become a non-duplicate).
                // Actually, the user wants to "not block the user while they are typing".
                // So we update the state REGARDLESS, but maybe show the error if it IS a duplicate.

                if (isDuplicate) {
                  if (cabinDuplicateTimerRef.current) clearTimeout(cabinDuplicateTimerRef.current);
                  setCabinDuplicateId(user.id);
                  cabinDuplicateTimerRef.current = setTimeout(() => setCabinDuplicateId(null), 1200);
                  // Do not return; allow the value to be set so they can keep typing to 11, 12 etc.
                }

                updateUser(user.id, 'cabinNumber', raw);
              }}              onBlur={() => {}}
              onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'cabinNumber', currentData.users, 'users')}
            />
            </div>{/* end group/c cabin wrapper */}
            <div className="relative name-input-wrapper min-w-0">
              <input
                disabled={isLockedByTimeout}
                readOnly={isLockedByTimeout}
                tabIndex={0}
                id={`name-${user.id}`}
                className={`w-full px-1 text-sm font-bold focus:outline-none border-b ${isLockedByTimeout ? 'cursor-not-allowed bg-transparent text-zinc-600 border-transparent' : 'bg-transparent border-white/5 focus:border-white/20 ' + (isConflict ? 'text-white' : isActiveSession ? 'text-emerald-400' : t.textMain)} ${isActiveSession ? t.glow : ''} ${showTenMinuteWarning ? 'animate-pulse' : ''}`}
                placeholder="Name"
                value={user.name}
                autoComplete="one-time-code"
                spellCheck={false}
                data-lpignore="true"
                name={`name-${user.id}`}
                onClick={(e) => (e.target as HTMLInputElement).focus()}
                onChange={(e) => {
                  // Auto-capitalize first letter of each word
                  let value = e.target.value;
                  if (value.trim() !== '') {
                    value = value.replace(/\b\w/g, l => l.toUpperCase());
                  }
                  updateUser(user.id, 'name', value);

                  // Filter suggestions as the user types with the specific input ID
                  filterSuggestions(value, user.id);
                }}
                onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'name', currentData.users, 'users')}
                onFocus={() => filterSuggestions(user.name, user.id)}
                onBlur={() => { setSuggestionsVisible(false); setActiveInputId(null); }}
              />

              {/* Live / Dead status badge — requires name + timeIn + timeOut all filled.
                   LIVE = any positive duration (even 1 min). DEAD = zero/invalid duration.
                   Row background/color (not this badge) handles elapsed-time warnings. */}
              {user.name && user.name.trim() !== '' && user.timeIn && user.timeIn.trim() !== '' && user.timeOut && user.timeOut.trim() !== '' && (
                // LIVE: valid duration AND session has not yet expired (overdueMinutes < 0 means time remaining)
                // DEAD: zero/invalid duration OR session expired (overdueMinutes >= 0)
                (totalSessionMins > 0 && overdueMinutes < 0) ? (
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-sm font-mono font-bold leading-none pointer-events-none select-none px-1.5 py-0.5 rounded border bg-black/40 flex items-center justify-center"
                    style={{
                      color: cabinColor,
                      borderColor: `${cabinColor}33`,
                      opacity: 1,
                      textShadow: `0 0 8px ${cabinColor}66`,
                      WebkitFontSmoothing: 'antialiased',
                      textRendering: 'optimizeLegibility',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateY(-50%) translateZ(0)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 99,
                      minWidth: '68px',
                      textAlign: 'center'
                    }}
                  >{formatCountdown((timeRemainingMinutes * 60) - now.getSeconds())}</span>
                ) : (
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-sm font-mono font-bold leading-none pointer-events-none select-none px-1.5 py-0.5 rounded border bg-black/40 flex items-center justify-center"
                    style={{
                      color: overdueMinutes >= 0 && totalSessionMins > 0 ? '#ef4444' : '#dc2626',
                      borderColor: overdueMinutes >= 0 && totalSessionMins > 0 ? '#ef444433' : '#dc262633',
                      opacity: 1,
                      textShadow: overdueMinutes >= 0 && totalSessionMins > 0 ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
                      WebkitFontSmoothing: 'antialiased',
                      textRendering: 'optimizeLegibility',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateY(-50%) translateZ(0)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 99,
                      minWidth: '68px',
                      textAlign: 'center'
                    }}
                  >{overdueMinutes >= 0 && totalSessionMins > 0 ? 'TIME UP' : 'DEAD'}</span>
                )
              )}

              {/* Suggestions dropdown - only show for the active input */}
              {suggestionsVisible && activeInputId === user.id && (
                <div className={`name-suggestions-dropdown rounded-lg shadow-lg max-h-60 overflow-auto ${t.panelBg} border ${t.border} ${t.glow} backdrop-blur-md`}>
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-4 py-3 cursor-pointer text-sm hover:bg-white/10 transition-colors ${
                        index === currentSuggestionIndex
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-cyan-400'
                          : 'border-l-4 border-transparent'
                      } ${t.textMain}`}
                      onMouseDown={() => selectSuggestion(suggestion, user.id)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Time In: input + AM/PM toggle */}
            <div className="flex flex-col items-center w-full">
              <input
                disabled={isLockedByTimeout}
                readOnly={isLockedByTimeout}
                tabIndex={0}
                id={`timeIn-${user.id}`}
                className={`bg-transparent w-full text-center text-xs font-mono font-bold focus:outline-none border-b placeholder-slate-700/50 ${isLockedByTimeout ? 'text-zinc-600 border-transparent cursor-not-allowed' : 'text-orange-400/80 border-white/5 focus:border-orange-400/40'}`}
                placeholder="--:--"
                value={user.timeIn}
                autoComplete="one-time-code"
                spellCheck={false}
                data-lpignore="true"
                name={`timein-${user.id}`}
                onClick={(e) => (e.target as HTMLInputElement).focus()}
                onChange={(e) => updateUser(user.id, 'timeIn', e.target.value)}
                onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'timeIn', currentData.users, 'users')}
              />
              {!isLockedByTimeout && (
                <div className="flex gap-px mt-px">
                  <button
                    tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); updateUser(user.id, 'timeInPeriod', 'AM'); }}
                    className={`text-[7px] font-black px-0.5 leading-none rounded-sm select-none ${(user.timeInPeriod || sysPeriod) === 'AM' ? 'text-orange-400 bg-orange-400/25' : 'text-slate-600 hover:text-slate-400'}`}
                    style={{ WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0)' }}
                  >AM</button>
                  <button
                    tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); updateUser(user.id, 'timeInPeriod', 'PM'); }}
                    className={`text-[7px] font-black px-0.5 leading-none rounded-sm select-none ${(user.timeInPeriod || 'AM') === 'PM' ? 'text-orange-400 bg-orange-400/25' : 'text-slate-600 hover:text-slate-400'}`}
                    style={{ WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0)' }}
                  >PM</button>
                </div>
              )}
            </div>
            {/* Time Out: input + AM/PM toggle */}
            <div className="flex flex-col items-center w-full">
              <input
                disabled={isLockedByTimeout}
                readOnly={isLockedByTimeout}
                tabIndex={0}
                id={`timeOut-${user.id}`}
                className={`bg-transparent w-full text-center text-xs font-mono font-bold focus:outline-none border-b placeholder-slate-700/50 ${isLockedByTimeout ? 'text-zinc-600 border-transparent cursor-not-allowed' : isWarning ? 'text-red-400 border-red-500/40' : 'text-orange-400/80 border-white/5 focus:border-orange-400/40'}`}
                placeholder="--:--"
                value={user.timeOut}
                autoComplete="one-time-code"
                spellCheck={false}
                data-lpignore="true"
                name={`timeout-${user.id}`}
                onClick={(e) => (e.target as HTMLInputElement).focus()}
                onChange={(e) => updateUser(user.id, 'timeOut', e.target.value)}
                onKeyDown={(e) => handleUniversalKeyDown(e, user.id, 'timeOut', currentData.users, 'users')}
              />
              {!isLockedByTimeout && (
                <div className="flex gap-px mt-px">
                  <button
                    tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); updateUser(user.id, 'timeOutPeriod', 'AM'); }}
                    className={`text-[7px] font-black px-0.5 leading-none rounded-sm select-none ${(user.timeOutPeriod || sysPeriod) === 'AM' ? 'text-orange-400 bg-orange-400/25' : 'text-slate-600 hover:text-slate-400'}`}
                    style={{ WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0)' }}
                  >AM</button>
                  <button
                    tabIndex={-1}
                    onMouseDown={(e) => { e.preventDefault(); updateUser(user.id, 'timeOutPeriod', 'PM'); }}
                    className={`text-[7px] font-black px-0.5 leading-none rounded-sm select-none ${(user.timeOutPeriod || sysPeriod) === 'PM' ? 'text-orange-400 bg-orange-400/25' : 'text-slate-600 hover:text-slate-400'}`}
                    style={{ WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0)' }}
                  >PM</button>
                </div>
              )}
            </div>
            {/* DUR — Dedicated duration display column */}
            {(() => { const dur = calculateTotalTime(user.timeIn, user.timeOut, user.timeInPeriod || sysPeriod, user.timeOutPeriod || sysPeriod); return (
            <div className="flex items-center justify-center">
              {dur ? (
                <span className="text-cyan-400 text-xs font-black tracking-wide bg-cyan-500/10 border border-cyan-500/30 rounded px-1.5 py-0.5 leading-none">{dur}</span>
              ) : (
                <span className="text-slate-700 text-xs">—</span>
              )}
            </div>
            );})()}
            <div className="amount-cell-wrapper relative px-1">
              <input
                disabled={isLockedByTimeout}
                readOnly={isLockedByTimeout}
                tabIndex={0}
                id={`amount-${user.id}`}
                type="number"
                className={`w-full text-center text-sm font-mono font-black focus:outline-none border-b placeholder-slate-700/50 ${isLockedByTimeout ? 'bg-transparent text-zinc-600 border-transparent cursor-not-allowed' : 'bg-transparent border-white/5 focus:border-orange-400/40 ' + (showTenMinuteWarning || isWarning ? '' : 'text-orange-400')}`}
                placeholder="0"
                value={user.amount}
                autoComplete="one-time-code"
                spellCheck={false}
                data-lpignore="true"
                name={`amount-${user.id}`}
                onClick={(e) => (e.target as HTMLInputElement).focus()}
                onChange={(e) => updateUser(user.id, 'amount', e.target.value)}
                onBlur={() => checkAndLockRow(user.id, 'amount')}
                onKeyDown={(e) => { if (e.key === 'Enter') checkAndLockRow(user.id, 'amount'); handleUniversalKeyDown(e, user.id, 'amount', currentData.users, 'users') }}
              />
            </div>
            {/* Rough Note box — manual scratch pad, no effect on calculations */}
            <div className="hidden sm:flex items-center gap-1 px-1">
              {isLockedByTimeout ? (
                /* Task 3: lock icon replaces rough note when row is frozen */
                <span
                  title="Time Over — Row Frozen"
                  className="w-full flex items-center justify-center text-base select-none"
                  style={{ filter: 'grayscale(0.3) drop-shadow(0 0 4px rgba(161,161,170,0.4))' }}
                >🔒</span>
              ) : (
                <input
                  type="text"
                  disabled={isLockedByTimeout}
                  readOnly={isLockedByTimeout}
                  value={rowNote[noteField] ?? ''}
                  onChange={(e) => updateNote(noteIndex, noteField, e.target.value)}
                  className="w-full bg-black/20 border border-dotted border-yellow-700/40 text-yellow-400/80 text-center focus:outline-none focus:border-yellow-500 rounded-sm placeholder-yellow-900/40 font-mono"
                  placeholder="~"
                  maxLength={6}
                  style={{
                    fontSize: '12px',
                    lineHeight: '1',
                    height: '28px',
                    paddingTop: '0',
                    paddingBottom: '0',
                  }}
                />
              )}
            </div>

          </div>
        );
      })}
    </div>
  )};

  if (!mounted) return null;

  // Full-screen lock gate — all data stays hidden until authenticated
  if (!isAuthenticated) return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'radial-gradient(ellipse at 50% 40%, #0d1528 0%, #020617 60%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes lock-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes lock-amber-pulse {
          0%, 100% { text-shadow: 0 0 8px rgba(251,191,36,0.5), 0 0 20px rgba(251,191,36,0.3); }
          50% { text-shadow: 0 0 16px rgba(251,191,36,0.9), 0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2); }
        }
        @keyframes lock-border-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(251,191,36,0.15), inset 0 0 40px rgba(251,191,36,0.03); }
          50% { box-shadow: 0 0 0 1px rgba(251,191,36,0.3), 0 0 30px rgba(251,191,36,0.08), inset 0 0 40px rgba(251,191,36,0.06); }
        }
        @keyframes lock-icon-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.5)) drop-shadow(0 0 20px rgba(251,191,36,0.2)); }
          50% { filter: drop-shadow(0 0 18px rgba(251,191,36,0.9)) drop-shadow(0 0 40px rgba(251,191,36,0.4)); }
        }
        @keyframes lock-corner-blink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .lock-amber-pulse { animation: lock-amber-pulse 3s ease-in-out infinite; }
        .lock-border-pulse { animation: lock-border-pulse 3s ease-in-out infinite; }
        .lock-icon-glow { animation: lock-icon-glow 2.5s ease-in-out infinite; }
        .lock-corner { animation: lock-corner-blink 2s ease-in-out infinite; }
      `}</style>

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.15) 20%, rgba(251,191,36,0.4) 50%, rgba(251,191,36,0.15) 80%, transparent 100%)',
        animation: 'lock-scan 6s linear infinite',
        zIndex: 1,
      }} />

      {/* Corner decorations */}
      {[
        { top: 24, left: 24, borderTop: '2px solid rgba(251,191,36,0.5)', borderLeft: '2px solid rgba(251,191,36,0.5)' },
        { top: 24, right: 24, borderTop: '2px solid rgba(251,191,36,0.5)', borderRight: '2px solid rgba(251,191,36,0.5)' },
        { bottom: 24, left: 24, borderBottom: '2px solid rgba(251,191,36,0.5)', borderLeft: '2px solid rgba(251,191,36,0.5)' },
        { bottom: 24, right: 24, borderBottom: '2px solid rgba(251,191,36,0.5)', borderRight: '2px solid rgba(251,191,36,0.5)' },
      ].map((s, i) => (
        <div key={i} className="lock-corner" style={{ position: 'absolute', width: 20, height: 20, ...s }} />
      ))}

      {/* Glassmorphism card */}
      <div className="lock-border-pulse" style={{
        position: 'relative', zIndex: 2,
        width: 360, maxWidth: '92vw',
        background: 'rgba(10,15,30,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 16,
        padding: '40px 36px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Top bracket lines on card */}
        <div style={{ position: 'absolute', top: -1, left: 32, right: 32, height: 2, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)' }} />
        <div style={{ position: 'absolute', bottom: -1, left: 32, right: 32, height: 2, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />

        {/* Lock icon */}
        <div className="lock-icon-glow" style={{ fontSize: 52, lineHeight: 1, marginBottom: 20 }}>🔐</div>

        {/* Status chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)',
          borderRadius: 4, padding: '3px 10px', marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', display: 'inline-block', boxShadow: '0 0 6px #dc2626' }} />
          <span style={{ color: '#fca5a5', fontSize: 9, fontWeight: 900, letterSpacing: '0.25em' }}>SYSTEM LOCKED</span>
        </div>

        {/* Headline */}
        <div className="lock-amber-pulse" style={{
          fontSize: 10, fontWeight: 900, letterSpacing: '0.22em',
          color: '#fbbf24', textTransform: 'uppercase',
          textAlign: 'center', lineHeight: 1.7, marginBottom: 28,
        }}>
          ENTER MASTER KEY TO PROCEED
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)', marginBottom: 24 }} />

        {/* Input */}
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 8, color: '#64748b', letterSpacing: '0.25em', marginBottom: 6, fontWeight: 700 }}>
            AUTH KEY
          </div>
          <input
            autoFocus
            type="password"
            value={lockInput}
            onChange={(e) => { setLockInput(e.target.value); setLockError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
            placeholder="••••••••••••••"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(2,6,23,0.8)',
              border: lockError ? '1px solid rgba(220,38,38,0.8)' : '1px solid rgba(251,191,36,0.35)',
              borderRadius: 8, padding: '13px 16px',
              color: '#f1f5f9', fontSize: 14, fontFamily: 'monospace', fontWeight: 700,
              outline: 'none', letterSpacing: '0.2em',
              boxShadow: lockError
                ? '0 0 0 3px rgba(220,38,38,0.15), inset 0 1px 4px rgba(0,0,0,0.6)'
                : '0 0 0 0px transparent, inset 0 1px 4px rgba(0,0,0,0.6)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              WebkitFontSmoothing: 'antialiased',
            }}
          />

          {/* Error */}
          {lockError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 10, padding: '7px 12px',
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6,
            }}>
              <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 900 }}>✕</span>
              <span style={{
                color: '#ef4444', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em',
                textShadow: '1px 1px 0 rgba(0,0,0,0.9)', WebkitFontSmoothing: 'antialiased',
              }}>ACCESS DENIED — INVALID KEY</span>
            </div>
          )}

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            style={{
              marginTop: 16, width: '100%',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.08) 100%)',
              border: '1px solid rgba(251,191,36,0.55)',
              borderRadius: 8, padding: '13px 0',
              color: '#fbbf24', fontSize: 11, fontWeight: 900,
              letterSpacing: '0.35em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'monospace',
              boxShadow: '0 0 16px rgba(251,191,36,0.1)',
              WebkitFontSmoothing: 'antialiased',
              transition: 'background 0.15s, box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.28) 0%, rgba(251,191,36,0.16) 100%)';
              el.style.boxShadow = '0 0 28px rgba(251,191,36,0.25)';
              el.style.borderColor = 'rgba(251,191,36,0.8)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.08) 100%)';
              el.style.boxShadow = '0 0 16px rgba(251,191,36,0.1)';
              el.style.borderColor = 'rgba(251,191,36,0.55)';
            }}
          >
            ⬡ &nbsp;UNLOCK SYSTEM
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 20, zIndex: 2,
        fontSize: 8, color: '#1e293b', letterSpacing: '0.3em', fontWeight: 700,
        textTransform: 'uppercase',
      }}>
        SPIDER STATION v06 · AUTHORIZED ACCESS ONLY
      </div>
    </div>
  );

  return (
    <>
    <style jsx global>{styles}</style>

    {/* Rotation Overlay for Portrait Mode */}
    {showRotationOverlay && (
      <div className="rotation-overlay">
        <div className="rotation-icon">🔄</div>
        <div className="rotation-message">Please rotate your phone for the best experience</div>
        <div className="text-white text-center text-sm">Hold your phone horizontally<br/>(Landscape mode) to view the dashboard</div>
      </div>
    )}

    {/* ── Zoom viewport wrapper — transparent so inner div's t.appBg gradient is visible ── */}
    <div style={{ width: '100vw', height: '100vh', overflowX: 'hidden', overflowY: 'visible', position: 'relative', display: 'flex', justifyContent: 'center' }}>
    <div
      className={`flex flex-col font-sans relative ${t.appBg} ${showRotationOverlay ? 'hidden' : ''}`}
      style={{
        color: '#ffffff',
        touchAction: 'pan-y',
        '--accent-rgb': (t as any).accentRgb ?? '34,211,238',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        /* ── FORCE DEFAULT SCALE 1.3 ── */
        transform: `scale(${uiScale})`,
        transformOrigin: 'top center',
        width: `${parseFloat((100 / uiScale).toFixed(4))}%`,
        margin: '0 auto',
        minHeight: 'auto',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out, height 0.2s ease-in-out',
      } as React.CSSProperties}
      onClick={(e) => {
        // Close both panels when clicking on main content area (but not on child elements)
        if (e.target === e.currentTarget) {
          setShowCafePanel(false);
          setShowReportsPanel(false);
        }

      }}
    >
      <div className={`flex flex-col h-full ${isPortrait ? '' : 'mobile-landscape-scaler'}`}>
        {renderDetailsModal()} {renderAuthModal()} {renderChangePassModal()} {renderPoliceModal()}

        <header className={`flex justify-between items-center px-4 py-2 border-b ${t.border} shadow-2xl shrink-0 z-50 relative h-[70px]`} style={{ background: '#0a0f1a', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 shrink-0 z-20">
            {renderMonthNavigator()}
            {/* Panel toggle buttons — compact, header-integrated */}
            <button
              onClick={() => { setShowCafePanel(v => !v); setShowReportsPanel(false); }}
              title="Toggle Cafe Inventory panel"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all duration-150 ${showCafePanel ? `${t.button} border-transparent text-white shadow-[0_0_10px_var(--theme-accent,#22d3ee)44]` : `border-white/10 text-slate-400 hover:text-white hover:border-white/25`}`}
              style={{ letterSpacing: '0.1em' }}
            >
              🛒 CAFE
            </button>
            <button
              onClick={() => { setShowReportsPanel(v => !v); setShowCafePanel(false); }}
              title="Toggle Reports panel"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all duration-150 ${showReportsPanel ? `${t.button} border-transparent text-white shadow-[0_0_10px_var(--theme-accent,#22d3ee)44]` : `border-white/10 text-slate-400 hover:text-white hover:border-white/25`}`}
              style={{ letterSpacing: '0.1em' }}
            >
              📊 REPORT
            </button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="animate-sway flex items-center">
              <h1
                className="text-3xl md:text-5xl font-black tracking-tightest italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 transform skew-x-[-10deg] px-4 opacity-80 select-none"
                style={{ textShadow: '0 0 18px rgba(255,140,0,0.55), 0 0 38px rgba(255,140,0,0.25)', filter: 'drop-shadow(0 0 10px rgba(255,140,0,0.5))' }}
              >⚡ WELCOME SPIDER STATION ⚡</h1>
            </div>
          </div>
          <div className="flex items-center gap-6 z-20 pl-6 pr-2 rounded-l-2xl border-l border-white/10 py-1 shadow-2xl backdrop-blur-md bg-white/5">
             <BrightnessControl />
             {/* Theme toggle removed — dark mode locked for production */}             <div className="flex items-center gap-3">
               {/* Theme Switcher Button — Cycles through the 7 premium themes */}
               <button
                 onClick={() => {
                   try {
                     setThemeIndex(prev => {
                       const next = (prev + 1) % THEMES.length;
                       const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
                       const parsed = raw ? JSON.parse(raw) : {};
                       parsed.themeIndex = next;
                       localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
                       return next;
                     });
                   } catch (e) {
                     console.error("Theme switch failed", e);
                   }
                 }}
                 title="Switch Theme"
                 className="flex items-center justify-center p-2 rounded-lg border border-slate-700/50 hover:border-slate-500/50 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-200 active:scale-95 shadow-sm"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.886 6.188.001-5.006 3.638 1.912 5.886L12 14.773l-5.006 3.638 1.912-5.886L3.9 8.887l6.188-.001L12 3z"/><circle cx="12" cy="12" r="3"/></svg>
               </button>
               {/* Neon-Gold Manual Save button */}               <button
                 onClick={handleManualSave}
                 title="Save Now"
                 className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-500/70 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-200 shadow-[0_0_8px_rgba(234,179,8,0.3)] hover:shadow-[0_0_16px_rgba(234,179,8,0.7)] active:scale-95"
               >
                 💾 <span className="hidden sm:inline">Save</span>
               </button>
               <div className="flex flex-col items-end justify-center border-r border-slate-600 pr-4 mr-0">
                 <span className="text-[10px] text-slate-400 uppercase tracking-[0.4em] leading-none mb-1">Owner</span>
                 <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 drop-shadow-[0_2px_8px_rgba(255,120,0,0.7)] font-sans leading-none tracking-widest filter contrast-125">Zahid ImAm</span>
               </div>
             </div>
             {currentView === 'workers' && <div className="text-right"><p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Payable</p><p className={`text-xl font-mono font-black leading-none ${t.textAccent}`}>{totalPayable.toLocaleString()} <span className="text-[10px] text-slate-500">PKR</span></p></div>}
             {currentView === 'expenses' && <div className="text-right"><p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">Total Exp</p><p className="text-xl font-mono font-black leading-none text-red-400">{totalExpenses.toLocaleString()} <span className="text-[10px] text-slate-500">PKR</span></p></div>}
          </div>
        </header>

        {(currentView !== 'financials' && currentView !== 'analytics') && renderCabinsLeftCounter()}

        <main
          className="flex-1 custom-scrollbar p-2 relative"
          style={{
            minHeight: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'block',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {currentView === 'users' && (
            <>
              {(() => {
                // Grid is always 240 slots; archived rows sit before the grid and must not shift section indices
                const arcCount = (currentData.users || []).filter((u: any) => u.isArchived).length;
                const gridStart = arcCount;
                const gridMid = arcCount + 120;
                const gridEnd = arcCount + 240;
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" style={{ width: '100%' }}>
                    <div style={{ width: '100%' }}>{renderUserBlock(gridStart, gridMid, 'a')}</div>
                    <div key={`section2-${arcCount}`} style={{ width: '100%' }}>{renderUserBlock(gridMid, gridEnd, 'b')}</div>
                  </div>
                );
              })()}
              <div className="flex justify-center pb-32 pt-4">
                {(() => {
                  const activeCount = (currentData.users || []).filter((u: any) => !u.isArchived).length;
                  const atCap = activeCount >= 240;
                  return (
                    <button
                      onClick={addUserRow}
                      disabled={atCap}
                      className={`px-6 py-3 ${t.button} text-white rounded-lg font-bold border border-white/20 flex items-center gap-2 transition-opacity ${atCap ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      <span className="text-lg">+</span> {atCap ? 'Max 240 Rows' : 'Add Row'}
                    </button>
                  );
                })()}
              </div>
            </>
          )}
          {currentView === 'workers' && (
            <div className="pb-32 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="p-4 max-w-4xl mx-auto">
                <h2 className={`text-xl ${t.textAccent} mb-4 font-bold border-b ${t.border} pb-2`}>Worker Salary Sheet</h2>
                <div className={`${t.panelBg} shadow-lg`}>
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className={`bg-black/50 ${t.textAccent} uppercase text-xs`} style={{paddingBottom: '8px'}}>
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3 text-center">Reputation</th>
                        <th className="p-3 text-right">Salary</th>
                        <th className="p-3 text-right text-red-400">Advance</th>
                        <th className="p-3 text-right text-green-400">Bonus</th>
                        <th className="p-3 text-right text-white">Remaining</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.workers.map((w: any) => {
                        const balance = w.salary + w.bonus - w.advance;
                        return (
                          <tr key={w.id} className="hover:bg-white/5">
                            <td className="p-3">
                              <input
                                id={`name-${w.id}`}
                                value={w.name}
                                onChange={(e)=>updateWorkerName(w.id, e.target.value)}
                                onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'name', currentData.workers, 'workers')}
                                className={`bg-transparent font-black text-xl ${t.textMain} outline-none w-full`}
                              />
                            </td>
                            <td className="p-3 flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => initiateRating(w.id, star)}
                                  className={`text-lg transition-transform hover:scale-125 ${star <= w.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </td>
                            <td className="p-3 text-right">
                              <input
                                id={`salary-${w.id}`}
                                type="number"
                                value={w.salary}
                                onChange={(e)=>updateWorker(w.id, 'salary', e.target.value)}
                                onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'salary', currentData.workers, 'workers')}
                                className="bg-transparent text-right outline-none w-24 font-black text-xl"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <input
                                id={`advance-${w.id}`}
                                type="number"
                                value={w.advance}
                                onChange={(e)=>updateWorker(w.id, 'advance', e.target.value)}
                                onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'advance', currentData.workers, 'workers')}
                                className="bg-transparent text-right outline-none w-20 font-bold text-lg text-red-400"
                              />
                            </td>
                            <td className="p-3 text-right">
                              <input
                                id={`bonus-${w.id}`}
                                type="number"
                                value={w.bonus}
                                onChange={(e)=>updateWorker(w.id, 'bonus', e.target.value)}
                                onKeyDown={(e) => handleUniversalKeyDown(e, w.id, 'bonus', currentData.workers, 'workers')}
                                className="bg-transparent text-right outline-none w-20 font-bold text-lg text-green-400"
                              />
                            </td>
                            <td className={`p-3 text-right font-black text-2xl ${t.textHighlight}`}>{balance.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <button onClick={() => initiateDeleteWorker(w.id)} className="text-slate-500 hover:text-red-500 transition-colors text-xl">🗑️</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={addWorker} className={`mt-4 px-4 py-2 ${t.button} text-white rounded-lg text-sm font-bold border border-white/20 flex items-center gap-2 shadow-lg`}>
                  <span className="text-lg font-bold">+</span> Add New Worker
                </button>
              </div>
            </div>
          )}
          {currentView === 'expenses' && (
            <div className="pb-32 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {renderExpenses()}
            </div>
          )}
          {currentView === 'financials' && renderFinancials()}
          {currentView === 'analytics' && renderAnalytics()}
        </main>

        {/* Footer spacer — reserves 58px at the bottom so the fixed nav doesn't cover scroll content */}
        <div style={{ height: 58, flexShrink: 0 }} />

        {/* BACKUP NOTIFICATION */}
        {showBackupNotification && (
          <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${
            backupNotificationType === 'success'
              ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100'
              : 'bg-red-900/90 border-red-500/50 text-red-100'
          } animate-in slide-in-from-top-5 fade-in duration-300`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {backupNotificationType === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-bold">{backupNotificationMessage}</span>
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentData={{
            masterData,
            blockList,
            adminPin,
            themeIndex,
            uiScale,
            serialSize,
            generatorLogs,
            teaLogs,
            cafeItems
          }}
        />

        {/* ── AI PANEL (FIXED BOTTOM RIGHT) ── */}
        {showMunshi && (
          <div className="fixed bottom-[76px] right-4 z-[61] w-80 max-h-[78vh] flex flex-col bg-black/60 backdrop-blur-2xl border border-cyan-700/40 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Header */}
            <div className="p-3 border-b border-cyan-800/30 flex justify-between items-center bg-gradient-to-r from-cyan-950/60 to-slate-950/30 shrink-0">
              <div className="flex items-center gap-2">
                <AiLogo size={24} active={true} searching={munshiSearching} />
                <div>
                  <div className="font-black text-cyan-300 text-sm leading-none tracking-wide">AI</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center gap-0.5 bg-cyan-900/60 border border-cyan-500/40 text-cyan-400 text-[8px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse inline-block" />
                      Live Analysis
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowMunshi(false); setMunshiQuery(''); setMunshiResult(null); }} className="text-cyan-800 hover:text-cyan-300 transition-colors text-sm font-bold">✕</button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-cyan-900/20 shrink-0">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Ask anything or type name..."
                  value={munshiQuery}
                  onChange={(e) => setMunshiQuery(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-cyan-950 focus:outline-none focus:border-cyan-500/70 font-mono tracking-wide"
                />
                {munshiSearching ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : munshiQuery ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-700 text-xs">🔍</span>
                ) : null}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
              {/* Empty state */}
              {!munshiQuery && (
                <div className="text-center py-8 text-slate-600">
                  <div className="text-5xl mb-3 opacity-60">🧠</div>
                  <div className="text-xs text-cyan-900/80 font-mono italic">How can I help you today?</div>
                  <div className="text-[10px] text-slate-700 mt-1 uppercase tracking-widest">Today's Data Analysis Mode</div>
                </div>
              )}

              {/* No result */}
              {munshiQuery && !munshiSearching && !munshiResult && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2 opacity-50">🫤</div>
                  <div className="text-xs text-slate-600 font-mono">"{munshiQuery}" ka koi record nahi mila</div>
                </div>
              )}

              {/* Digital Receipt */}
              {munshiResult && (
                <>
                  {/* Receipt Card */}
                  <div className="bg-gradient-to-b from-amber-950/40 to-black/40 border border-amber-800/30 rounded-xl p-4 relative overflow-hidden">
                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
                    {/* Receipt dots */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between px-2">
                      {Array.from({length: 20}).map((_, i) => <div key={i} className="w-0.5 h-1 bg-amber-900/40" />)}
                    </div>

                    <div className="text-center mb-3 mt-1">
                      <div className="text-[9px] text-amber-800/60 uppercase tracking-[0.3em] font-mono">Guest Record</div>
                      <div className="text-lg font-black text-amber-300 mt-0.5 tracking-wide">{munshiResult.name}</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-black/40 rounded-lg p-2 text-center border border-amber-900/20">
                        <div className="text-amber-400 text-xl font-black">{munshiResult.totalVisits}</div>
                        <div className="text-[8px] text-emerald-600/80 uppercase tracking-wider">Today&apos;s Rows</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 text-center border border-emerald-900/20">
                        <div className="text-emerald-400 text-base font-black">Rs {munshiResult.totalAmount.toLocaleString()}</div>
                        <div className="text-[8px] text-emerald-600/80 uppercase tracking-wider">Today&apos;s Total</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 text-center border border-cyan-900/20">
                        <div className="text-cyan-400 text-sm font-black">
                          {munshiResult.commonCabin !== '--' ? `Cabin ${munshiResult.commonCabin}` : '--'}
                        </div>
                        <div className="text-[8px] text-slate-600 uppercase tracking-wider">Fav. Cabin</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 text-center border border-purple-900/20">
                        <div className="text-purple-400 text-[10px] font-bold leading-tight">Rs {munshiResult.avgAmount.toLocaleString()}</div>
                        <div className="text-[8px] text-slate-600 uppercase tracking-wider">Avg / Visit</div>
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="mt-2.5 flex justify-between text-[8px] font-mono text-amber-900/60 border-t border-amber-900/20 pt-2">
                      <span>First: {munshiResult.firstVisitDate}</span>
                      <span>Last: {munshiResult.lastVisitDate}</span>
                    </div>

                    {/* Bottom dots */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                      {Array.from({length: 20}).map((_, i) => <div key={i} className="w-0.5 h-1 bg-amber-900/40" />)}
                    </div>
                  </div>

                  {/* Today's Entries List */}
                  <div>
                    <div className="text-[8px] text-emerald-700/70 uppercase tracking-[0.25em] mb-1.5 pl-0.5 font-mono">Today&apos;s Entries</div>
                    <div className="space-y-1">
                      {munshiResult.recentVisits.map((v, i) => (
                        <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg px-2.5 py-1.5 border border-white/[0.04] text-[10px] font-mono">
                          <div className="text-slate-500">{v.date}</div>
                          <div className="flex items-center gap-2">
                            {v.cabinNumber && <span className="text-cyan-800">#{v.cabinNumber}</span>}
                            <span className="text-emerald-500 font-bold">Rs {v.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
    </div>{/* ── /zoom viewport wrapper ── */}

    {/* ══════════════════════════════════════════════════════════════════════════════
        PANELS + TAB BUTTONS — outside the CSS transform wrapper.
        Reason: position:fixed inside a CSS transform resolves relative to the
        transformed ancestor, not the viewport. Panels must always span from the
        top of the viewport to just above the footer (58px), regardless of uiScale.
        Height = calc(100vh - 58px) ensures the sticky bottom totals are always
        visible and never hidden behind the footer nav.
        ══════════════════════════════════════════════════════════════════════════════ */}


    {/* ── LEFT PANEL — CAFE INVENTORY ─────────────────────────────────────────── */}
    <AnimatePresence>
      {showCafePanel && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`${t.panelBg} border-r ${t.border} shadow-2xl flex flex-col`}
          style={{ position: 'fixed', left: 0, top: 0, width: 320, height: 'calc(100vh - 58px)', zIndex: 1100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-4 border-b ${t.border} flex justify-between items-center shrink-0`}>
            <h2 className={`text-xl font-bold ${t.textAccent}`}>Cafe Inventory</h2>
            <button onClick={() => setShowCafePanel(false)} className={`w-8 h-8 rounded-full ${t.button} flex items-center justify-center`}>✕</button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto min-h-0 panel-scroll pb-10">
            {/* Add item form */}
            <div className="mb-4">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCafeItem()}
                placeholder="Item Name (e.g. Tea, Biscuits)"
                className={`w-full p-2 mb-2 rounded ${t.panelBg} border ${t.border} text-white`}
              />
              <input
                type="number"
                min="0"
                step="any"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCafeItem()}
                placeholder="Amount (Rs)"
                className={`w-full p-2 mb-2 rounded ${t.panelBg} border ${t.border} text-white`}
              />
              <button
                onClick={addCafeItem}
                className={`w-full py-2 rounded font-bold transition-all duration-150 ${t.button} text-white`}
                style={inventoryToast === 'saved' ? { boxShadow: '0 0 0 2px #22c55e, 0 0 14px rgba(34,197,94,0.5)' } : undefined}
              >
                {inventoryToast === 'saved' ? '✅ SAVED' : '+ Add Item'}
              </button>
            </div>

            {/* Item list */}
            <div className="mb-4">
              <h3 className={`font-bold ${t.textAccent} mb-2`} style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Items ({cafeItems.length})
              </h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {cafeItems.map(item => (
                  <div key={item.id} className={`px-2 py-1.5 rounded ${t.panelBg} border ${t.border} flex justify-between items-center`} style={{ fontSize: 12 }}>
                    <span className="truncate flex-1 mr-2">{item.name}</span>
                    <span className="font-bold shrink-0 mr-2" style={{ color: '#fbbf24' }}>Rs {item.price}</span>
                    <button
                      onClick={() => handleSetCafeItems(cafeItems.filter(i => i.id !== item.id))}
                      style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 2px' }}
                      title="Remove item"
                    >✕</button>                  </div>
                ))}
                {cafeItems.length === 0 && (
                  <p className="text-slate-500 text-center py-4" style={{ fontSize: 12 }}>No items — data persists after close</p>
                )}
              </div>
            </div>

            {/* Reset button */}
            {cafeItems.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all inventory items? This cannot be undone.')) {
                    handleSetCafeItems([]);
                    setInventoryToast('reset');
                    setTimeout(() => setInventoryToast(null), 1500);
                  }
                }}
                style={{ width: '100%', padding: '6px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                {inventoryToast === 'reset' ? '✅ Cleared' : '🗑 Reset Inventory'}
              </button>
            )}
          </div>

          <div className={`p-4 border-t ${t.border} font-bold text-lg ${t.textHighlight} shrink-0`}>
            Total: Rs {totalCafeSale.toFixed(2)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── RIGHT PANEL — REPORTS ───────────────────────────────────────────────── */}
    <AnimatePresence>
      {showReportsPanel && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`${t.panelBg} border-l ${t.border} shadow-2xl flex flex-col`}
          style={{ position: 'fixed', right: 0, top: 0, width: 320, height: 'calc(100vh - 58px)', zIndex: 1100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-4 border-b ${t.border} flex justify-between items-center shrink-0`}>
            <h2 className={`text-xl font-bold ${t.textAccent}`}>Reports</h2>
            <button onClick={() => setShowReportsPanel(false)} className={`w-8 h-8 rounded-full ${t.button} flex items-center justify-center`}>✕</button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto min-h-0 panel-scroll pb-10">
            <div className={`p-4 rounded-lg ${t.panelBg} border ${t.border} mb-4`}>
              <h3 className={`font-bold ${t.textMain} mb-2`}>Section 1 Total</h3>
              <p className={`text-2xl font-black ${t.textHighlight}`}>Rs {section1Total.toFixed(2)}</p>
            </div>

            <div className={`p-4 rounded-lg ${t.panelBg} border ${t.border} mb-4`}>
              <h3 className={`font-bold ${t.textMain} mb-2`}>Section 2 Total</h3>
              <p className={`text-2xl font-black ${t.textHighlight}`}>Rs {section2Total.toFixed(2)}</p>
            </div>
          </div>

          <div className={`p-6 bg-gradient-to-r from-black/40 to-transparent border-t ${t.border} font-bold text-center relative shrink-0`}>
            {/* Gross Sale */}
            <div className="mb-3">
              <p className={`text-xs uppercase tracking-widest ${t.textAccent} opacity-70 mb-0.5`}>Gross Sale</p>
              <p className={`text-2xl font-black ${t.textHighlight}`}>Rs {grandTotal.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            {/* Inventory Expense */}
            <div className="mb-3">
              <p className="text-xs uppercase tracking-widest text-red-400 opacity-80 mb-0.5">Inventory Expense</p>
              <p className="text-2xl font-black text-red-400 drop-shadow">- Rs {totalInventoryCost.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            {/* Divider */}
            <div className={`border-t ${t.border} my-2`} />
            {/* Net Balance */}
            <div>
              <p className={`text-xs uppercase tracking-widest mb-0.5 ${netBalance < 0 ? 'text-red-400' : 'text-yellow-400'} opacity-80`}>Net Balance</p>
              <p className={`text-4xl font-black drop-shadow-lg ${netBalance < 0 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                Rs {netBalance.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            {/* Auto-save indicator */}
            {showSaveIndicator && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                  <span className="text-xs">✓</span> Saved
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ══════════════════════════════════════════════════════════════════════
        FIXED FOOTER NAV — outside zoom wrapper (CSS transform breaks fixed).
        Grid of 12 equal columns spans 100vw at scale-1 always.
        ══════════════════════════════════════════════════════════════════════ */}
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      height: 58,
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      background: 'rgba(4,6,16,0.97)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 -6px 32px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.04)',
    } as React.CSSProperties}>

      {/* 1 — USERS */}
      <button className={`footer-btn${currentView === 'users' ? ' fb-active' : ''}`}
        onClick={() => setCurrentView('users')}
        style={{
          color: currentView === 'users' ? '#22d3ee' : '#475569',
          background: currentView === 'users' ? 'rgba(34,211,238,0.07)' : undefined,
          boxShadow: currentView === 'users' ? 'inset 0 -2px 0 #22d3ee, 0 0 18px rgba(34,211,238,0.18)' : undefined,
        }}
      >
        <span className="fb-icon">👥</span>
        <span className="fb-label">Users</span>
      </button>

      {/* 2 — LIVE SCORE (Previously HISAB) */}
      <Link href="/hisab" prefetch={true} className="footer-btn live-score-btn"
        style={{ color: '#00f2ff', position: 'relative' }}
        title="Live Score & Monthly Accounts"
      >
        <span className="fb-icon">📈</span>
        <span className="fb-label" style={{ fontWeight: 900 }}>Live Score</span>
        {hisabDotActive && <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', zIndex: 10 }} />}
      </Link>

      {/* 3 — UDHAR */}
      <Link href="/udhar" prefetch={true} className="footer-btn"
        style={{ color: '#c084fc' }}
        title="Udhar Ledger"
      >
        <span className="fb-icon">📒</span>
        <span className="fb-label">Udhar</span>
      </Link>

      {/* 4 — BRAIN */}
      <Link href="/brain" prefetch={true} className="footer-btn"
        style={{ color: '#818cf8' }}
        title="Brain — 10-Year Record Finder"
      >
        <span className="fb-icon">🧠</span>
        <span className="fb-label">Brain</span>
      </Link>

      {/* 5 — WORKERS */}
      <button className={`footer-btn${currentView === 'workers' ? ' fb-active' : ''}`}
        onClick={() => setCurrentView('workers')}
        style={{
          color: currentView === 'workers' ? '#94a3b8' : '#475569',
          background: currentView === 'workers' ? 'rgba(148,163,184,0.07)' : undefined,
          boxShadow: currentView === 'workers' ? 'inset 0 -2px 0 #94a3b8' : undefined,
        }}
      >
        <span className="fb-icon">👷</span>
        <span className="fb-label">Workers</span>
      </button>

      {/* 6 — EXPENSES */}
      <button className={`footer-btn${currentView === 'expenses' ? ' fb-active' : ''}`}
        onClick={() => setCurrentView('expenses')}
        style={{
          color: currentView === 'expenses' ? '#f87171' : '#475569',
          background: currentView === 'expenses' ? 'rgba(248,113,113,0.07)' : undefined,
          boxShadow: currentView === 'expenses' ? 'inset 0 -2px 0 #f87171' : undefined,
        }}
      >
        <span className="fb-icon">📉</span>
        <span className="fb-label">Expenses</span>
      </button>

      {/* 7 — GRAPH */}
      <button className={`footer-btn${currentView === 'analytics' ? ' fb-active' : ''}`}
        onClick={() => setCurrentView('analytics')}
        style={{
          color: currentView === 'analytics' ? '#34d399' : '#475569',
          background: currentView === 'analytics' ? 'rgba(52,211,153,0.07)' : undefined,
          boxShadow: currentView === 'analytics' ? 'inset 0 -2px 0 #34d399' : undefined,
        }}
      >
        <span className="fb-icon">📊</span>
        <span className="fb-label">Graph</span>
      </button>

      {/* 8 — FINANCIALS */}
      <button className="footer-btn"
        onClick={() => { setAuthAction({ type: 'ACCESS_HQ' }); setShowAuthModal(true); }}
        style={{ color: '#a78bfa' }}
      >
        <span className="fb-icon">🔒</span>
        <span className="fb-label">Finance</span>
      </button>

      {/* 9 — BACKUP */}
      <button className="footer-btn"
        onClick={handleManualBackup}
        style={{ color: '#38bdf8' }}
        title="Create Manual Backup"
      >
        <span className="fb-icon">☁️</span>
        <span className="fb-label">Backup</span>
      </button>

      {/* 11 — SETTINGS */}
      <button className="footer-btn min-h-[50px] md:min-h-0 px-4"
        onClick={() => {
          setAuthAction({ type: 'OPEN_SETTINGS' });
          setShowAuthModal(true);
        }}
        style={{ color: '#64748b' }}
        title="Settings"
      >
        <span className="fb-icon text-xl md:text-base">⚙️</span>
        <span className="fb-label text-[10px] md:text-[9px]">Settings</span>
      </button>

      {/* 12 — ZOOM */}
      <div className="footer-btn" style={{ flexDirection: 'row', gap: 0, padding: 0, cursor: 'default' }}>
        <button
          onClick={() => setUiScale(s => Math.max(0.6, parseFloat((s - 0.05).toFixed(2))))}
          disabled={uiScale <= 0.6}
          title="Zoom Out"
          style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: uiScale <= 0.6 ? 'not-allowed' : 'pointer', color: uiScale <= 0.6 ? '#1e293b' : '#22d3ee', fontSize: 16, fontWeight: 900, transition: 'all 0.15s' }}
        >－</button>
        <button
          onClick={() => setUiScale(1.3)}
          title="Reset zoom"
          style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: uiScale === 1.3 ? '#334155' : '#22d3ee', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'monospace', transition: 'all 0.15s', gap: 2 }}
        >          <span style={{ fontSize: 10 }}>🔍</span>
          {Math.round(uiScale * 100)}%
        </button>
        <button
          onClick={() => setUiScale(s => Math.min(2.2, parseFloat((s + 0.05).toFixed(2))))}
          disabled={uiScale >= 2.2}
          title="Zoom In"
          style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: uiScale >= 2.2 ? 'not-allowed' : 'pointer', color: uiScale >= 2.2 ? '#1e293b' : '#22d3ee', fontSize: 16, fontWeight: 900, transition: 'all 0.15s' }}
        >＋</button>
      </div>

    </nav>

    {/* ── RELOCATED AI (FIXED BOTTOM RIGHT) ── */}
    <div className="fixed bottom-[74px] right-6 z-[100] pointer-events-none">
      <button
        onClick={() => setShowMunshi(v => !v)}
        title="AI — Smart Analysis"
        className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-110 active:scale-95 group relative overflow-hidden"
        style={{ cursor: 'pointer' }}
      >
        {/* Breathing Neon Glow Background */}
        <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl animate-breathing pointer-events-none" />
        
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 animate-sway">
          <AiLogo size={32} active={showMunshi} searching={munshiSearching} />
        </div>
        
        <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:text-cyan-200 transition-colors">
          Ai
        </span>

        {/* Neural Pulse Line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      </button>
    </div>
</>
  );
}