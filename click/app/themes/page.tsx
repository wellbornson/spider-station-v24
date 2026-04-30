'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES, THEME_CATEGORIES, type Theme } from '../lib/themes';

const DB_KEY = 'CLICK_CAFE_DB_V2';

function readThemeIndex(): number {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed.themeIndex === 'number' ? parsed.themeIndex : 0;
  } catch {
    return 0;
  }
}

function saveThemeIndex(index: number) {
  try {
    const raw = localStorage.getItem(DB_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data.themeIndex = index;
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch {
    // silent
  }
}

/** Injects all CSS custom properties — theme accent + row system vars */
function injectThemeCSSVars(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--theme-accent', theme.previewAccent);
  root.style.setProperty('--theme-bg', theme.previewBg);
  if (theme.accentRgb) root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
  // Row system vars — derived from theme colors
  const rgb = theme.accentRgb ?? '34,211,238';
  const hex = theme.previewBg.replace('#', '');
  const pr = parseInt(hex.slice(0, 2), 16), pg = parseInt(hex.slice(2, 4), 16), pb = parseInt(hex.slice(4, 6), 16);
  root.style.setProperty('--row-bg', `rgba(${pr},${pg},${pb},0.82)`);
  root.style.setProperty('--row-bg-alt', `rgba(${rgb},0.05)`);
  root.style.setProperty('--row-bg-active', `rgba(${rgb},0.16)`);
  root.style.setProperty('--row-bg-selected', `rgba(${rgb},0.11)`);
  root.style.setProperty('--row-border', `rgba(${rgb},0.13)`);
  root.style.setProperty('--row-glow', `0 0 10px rgba(${rgb},0.22)`);
}

function MiniPreview({ theme, active }: { theme: Theme; active: boolean }) {
  // Derive row colors exactly as injectThemeCSSVars does — preview matches reality
  const hex = theme.previewBg.replace('#', '');
  const pr = parseInt(hex.slice(0, 2), 16), pg = parseInt(hex.slice(2, 4), 16), pb = parseInt(hex.slice(4, 6), 16);
  const rowBg = `rgba(${pr},${pg},${pb},0.82)`;
  const rgb = theme.accentRgb ?? '34,211,238';
  const rowBgActive = `rgba(${rgb},0.16)`;

  const mockRows = [
    { name: 'ARJUN SHARMA', amount: '120', cabin: '5', isActive: false, isLocked: true },
    { name: 'PRIYA MEHTA',  amount: '85',  cabin: '2', isActive: true,  isLocked: false },
    { name: 'KABIR SINGH',  amount: '200', cabin: '8', isActive: false, isLocked: true },
    { name: '',             amount: '',    cabin: '3', isActive: false, isLocked: false },
  ];

  return (
    <div style={{
      background: theme.previewBg,
      borderRadius: 8,
      overflow: 'hidden',
      border: active ? `2px solid ${theme.previewAccent}` : '2px solid rgba(255,255,255,0.08)',
      boxShadow: active ? `0 0 18px ${theme.previewAccent}55` : 'none',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: `1px solid ${theme.previewAccent}30`, padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 6, fontWeight: 900, color: theme.previewAccent, letterSpacing: '0.08em', fontFamily: 'monospace' }}>SPIDER STATION</div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ width: 9, height: 7, background: n <= 2 ? theme.previewAccent : 'rgba(255,255,255,0.06)', border: `1px solid ${theme.previewAccent}40`, borderRadius: 1, fontSize: 5, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n <= 2 ? '#000' : '#444', fontFamily: 'monospace' }}>{n}</div>
          ))}
        </div>
      </div>

      {/* Column header */}
      <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr 28px 22px', gap: 2, padding: '2px 5px', borderBottom: `1px solid ${theme.previewAccent}18`, background: 'rgba(0,0,0,0.3)' }}>
        {['#', 'NAME', 'AMT', 'CBN'].map(h => (
          <div key={h} style={{ fontSize: 5, fontWeight: 800, color: theme.previewAccent, opacity: 0.7, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{h}</div>
        ))}
      </div>

      {/* Live rows — using real derived row colors */}
      {mockRows.map((row, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '14px 1fr 28px 22px', gap: 2,
          padding: '2.5px 5px',
          background: row.isActive ? rowBgActive : rowBg,
          borderBottom: `1px solid ${theme.previewAccent}10`,
          boxShadow: row.isActive ? `0 0 6px rgba(${rgb},0.15)` : 'none',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textAlign: 'center' }}>{i + 1}</div>
          <div style={{ fontSize: 6, fontWeight: row.isLocked ? 800 : 400, color: row.isActive ? theme.previewAccent : row.name ? '#e2e8f0' : 'rgba(255,255,255,0.18)', fontFamily: 'monospace', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {row.name || '—'}
          </div>
          <div style={{ fontSize: 5, fontWeight: 800, color: row.amount ? '#fbbf24' : 'rgba(255,255,255,0.1)', fontFamily: 'monospace', textAlign: 'right' }}>
            {row.amount ? `₹${row.amount}` : '—'}
          </div>
          <div style={{ fontSize: 5, color: row.isActive ? theme.previewAccent : 'rgba(255,255,255,0.25)', fontFamily: 'monospace', textAlign: 'center' }}>
            {row.cabin}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ background: 'rgba(0,0,0,0.5)', borderTop: `1px solid ${theme.previewAccent}20`, padding: '2px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 5, color: theme.previewAccent, fontFamily: 'monospace', fontWeight: 700, opacity: 0.8 }}>2 ACTIVE</div>
        <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>ZOOM 100%</div>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);

  useEffect(() => {
    const idx = readThemeIndex();
    setActiveIndex(idx);
    // Inject CSS vars for the currently active theme immediately
    injectThemeCSSVars(THEMES[idx] ?? THEMES[0]);
  }, []);

  /** Select a card (highlights it) without redirecting */
  const selectTheme = (index: number) => {
    saveThemeIndex(index);
    setActiveIndex(index);
    injectThemeCSSVars(THEMES[index] ?? THEMES[0]);
    // Broadcast to dashboard (same-tab via CustomEvent)
    window.dispatchEvent(new CustomEvent('spider_theme_change', { detail: { index } }));
  };

  /** Apply + redirect to dashboard with a short "Applying…" animation */
  const applyAndGo = (index: number) => {
    if (applyingIndex !== null) return; // prevent double-tap
    saveThemeIndex(index);
    setActiveIndex(index);
    setApplyingIndex(index);
    injectThemeCSSVars(THEMES[index] ?? THEMES[0]);
    window.dispatchEvent(new CustomEvent('spider_theme_change', { detail: { index } }));
    setTimeout(() => router.push('/'), 520);
  };

  const filteredThemes = selectedCategory === 'All'
    ? THEMES
    : THEMES.filter(t => t.category === selectedCategory);

  const currentTheme = THEMES[activeIndex] ?? THEMES[0];

  return (
    <>
      {/* Cyberpunk dark scrollbar — scoped to this page only */}
      <style>{`
        .themes-scroll::-webkit-scrollbar { width: 5px; }
        .themes-scroll::-webkit-scrollbar-track { background: #000; }
        .themes-scroll::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
        .themes-scroll::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        .themes-scroll { scrollbar-width: thin; scrollbar-color: #1e3a5f #000; }

        @keyframes applying-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes apply-pulse {
          0%, 100% { box-shadow: var(--btn-glow-base); }
          50%       { box-shadow: var(--btn-glow-peak); }
        }
        .apply-btn {
          transition: background 0.15s, box-shadow 0.15s, transform 0.12s;
        }
        .apply-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          animation: apply-pulse 1.2s ease-in-out infinite;
        }
        .apply-btn:active:not(:disabled) {
          transform: scale(0.96);
          animation: none;
        }
        .theme-card {
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .theme-card:hover {
          transform: translateY(-4px) scale(1.015) !important;
        }
      `}</style>

      <div
        ref={scrollRef}
        className="themes-scroll"
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'linear-gradient(135deg, #020817 0%, #0a0f1a 50%, #020817 100%)',
          color: '#e2e8f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >

        {/* ── Sticky header ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(2,8,23,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 9,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
          >
            ← Back
          </button>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <h1 style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.1em', margin: 0, color: '#fff' }}>🎨 THEME SELECTOR</h1>
            <p style={{ margin: 0, fontSize: 10, color: '#475569', letterSpacing: '0.07em' }}>{THEMES.length} PREMIUM THEMES</p>
          </div>

          {/* Default Dark reset + active badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Default Dark button */}
            <button
              onClick={() => applyAndGo(0)}
              title="Reset to Default Dark (Cyberverse)"
              style={{
                padding: '5px 11px', borderRadius: 9,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', fontSize: 10, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
            >
              ↩ Default
            </button>

            {/* Active theme badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 9,
              background: `${currentTheme.previewAccent}14`,
              border: `1px solid ${currentTheme.previewAccent}38`,
              fontSize: 11, fontWeight: 700,
              color: currentTheme.previewAccent,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentTheme.previewAccent, boxShadow: `0 0 7px ${currentTheme.previewAccent}` }} />
              {currentTheme.name}
            </div>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div style={{ padding: '12px 16px 6px', display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {THEME_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 14px', borderRadius: 20,
                border: selectedCategory === cat ? '1px solid rgba(99,179,237,0.55)' : '1px solid rgba(255,255,255,0.09)',
                background: selectedCategory === cat ? 'rgba(99,179,237,0.12)' : 'rgba(255,255,255,0.03)',
                color: selectedCategory === cat ? '#63b3ed' : '#475569',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s', letterSpacing: '0.04em',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* ── Theme grid ── */}
        <div style={{
          padding: '12px 16px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          maxWidth: 1300,
          margin: '0 auto',
        }}>
          {filteredThemes.map(theme => {
            const isActive = theme.id === activeIndex;
            const isApplying = theme.id === applyingIndex;

            return (
              <div
                key={theme.id}
                className="theme-card"
                onClick={() => selectTheme(theme.id)}
                style={{
                  borderRadius: 13,
                  border: isActive ? `2px solid ${theme.previewAccent}` : '2px solid rgba(255,255,255,0.06)',
                  background: isActive ? theme.previewBg : 'rgba(10,16,32,0.9)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isActive ? `0 8px 32px ${theme.previewAccent}30, 0 0 0 1px ${theme.previewAccent}20` : '0 2px 12px rgba(0,0,0,0.5)',
                  position: 'relative',
                }}
              >
                {/* Active badge */}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 10,
                    background: theme.previewAccent, color: '#000',
                    fontSize: 8, fontWeight: 900, padding: '3px 8px',
                    borderRadius: 10, letterSpacing: '0.08em',
                    boxShadow: `0 0 10px ${theme.previewAccent}80`,
                  }}>● ACTIVE</div>
                )}

                {/* Applying overlay */}
                {isApplying && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 20,
                    background: `${theme.previewBg}ee`,
                    borderRadius: 11,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, border: `3px solid ${theme.previewAccent}33`,
                      borderTopColor: theme.previewAccent, borderRadius: '50%',
                      animation: 'applying-spin 0.7s linear infinite',
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: theme.previewAccent, letterSpacing: '0.1em' }}>
                      APPLYING…
                    </span>
                  </div>
                )}

                {/* Mini preview — shows real row colors */}
                <div style={{ padding: '10px 10px 6px' }}>
                  <MiniPreview theme={theme} active={isActive} />
                </div>

                {/* Info row */}
                <div style={{ padding: '5px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? theme.previewAccent : '#e2e8f0', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                      {theme.name}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#334155', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.previewAccent, opacity: 0.6 }} />
                      {theme.category}
                    </div>
                  </div>
                  {/* Accent color swatch */}
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: theme.previewAccent, boxShadow: `0 0 10px ${theme.previewAccent}66`, flexShrink: 0 }} />
                </div>

                {/* BIG APPLY button */}
                <div style={{ padding: '4px 10px 10px' }} onClick={e => e.stopPropagation()}>
                  <button
                    className="apply-btn"
                    disabled={isApplying}
                    onClick={() => applyAndGo(theme.id)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 9,
                      border: `1.5px solid ${theme.previewAccent}${isActive ? 'cc' : '55'}`,
                      background: isActive ? theme.previewAccent : `${theme.previewAccent}14`,
                      color: isActive ? '#000' : theme.previewAccent,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: isApplying ? 'wait' : 'pointer',
                      boxShadow: isActive ? `0 0 18px ${theme.previewAccent}55` : 'none',
                      // Pulse animation vars — picked up by apply-pulse keyframe
                      ['--btn-glow-base' as string]: `0 0 10px ${theme.previewAccent}33`,
                      ['--btn-glow-peak' as string]: `0 0 28px ${theme.previewAccent}88, 0 0 50px ${theme.previewAccent}33`,
                    }}
                  >
                    {isApplying ? '⟳ APPLYING…' : isActive ? '✓ APPLIED' : '▶ APPLY THEME'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Safety note */}
        <div style={{ textAlign: 'center', padding: '0 16px 28px', fontSize: 10, color: '#1e293b', letterSpacing: '0.05em' }}>
          ■ Cabin bar always black/white &nbsp;|&nbsp; ■ Amber priority blink preserved
        </div>

      </div>
    </>
  );
}
