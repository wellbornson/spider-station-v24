'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useDebounce } from '../../lib/use-debounce';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface BrainRecord {
  name: string;
  cabinNumber: string;
  timeIn: string;
  timeOut: string;
  amount: number;
  date: string;
  dateKey: string;
  roughNote: string;
}

interface BrainResult {
  displayName: string;
  totalVisits: number;
  totalAmount: number;
  avgAmount: number;
  maxAmount: number;
  lastVisitDate: string;
  firstVisitDate: string;
  commonCabin: string;
  records: BrainRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Brain Search Engine — scans all localStorage keys in one synchronous pass
//  Sources: CLICK_CAFE_DB_V2 (masterData + archivedData) + MUNSHI_RECORDS_*
//
//  Two modes:
//    NAME  — partial match (case-insensitive): "Ali" → "Ali Khan", "M Ali"…
//    CABIN — exact cabin number: "5", "cabin 5", "#5" → all records for cabin 5
// ─────────────────────────────────────────────────────────────────────────────

// Shared date formatter
const _fmt = (year: number, month0: number, day: number) => {
  try {
    return new Date(year, month0, day).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return `${day}/${month0 + 1}/${year}`;
  }
};

// Collect all records matching a cabin number (string, e.g. "5")
function brainSearchByCabin(cabinTarget: string): BrainResult | null {
  if (typeof window === 'undefined') return null;

  const records: BrainRecord[] = [];
  const seen = new Set<string>();

  const push = (u: any, dateKey: string, displayDate: string, roughNote = '') => {
    if (!u?.name?.trim()) return;
    const cn = String(u.cabinNumber || '').trim();
    if (cn !== cabinTarget) return;
    if (!u.amount || Number(u.amount) === 0) return;
    const dedupeKey = `${dateKey}|${u.name}|${u.timeIn || ''}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    records.push({
      name: u.name,
      cabinNumber: cn,
      timeIn: u.timeIn || '',
      timeOut: u.timeOut || '',
      amount: Number(u.amount) || 0,
      date: displayDate,
      dateKey,
      roughNote,
    });
  };

  try {
    const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
    if (raw) {
      const parsed = JSON.parse(raw);
      const md: Record<string, any> = parsed.masterData || {};
      Object.keys(md).forEach(dateKey => {
        const day = md[dateKey];
        if (!day?.users) return;
        const parts = dateKey.split('-').map(Number);
        if (parts.length < 3) return;
        const [y, m0, d] = parts;
        const displayDate = _fmt(y, m0, d);
        const notes: any[] = day.notes || [];
        (day.users as any[]).forEach((u, idx) => {
          const noteEntry = notes[idx] || {};
          push(u, dateKey, displayDate, [noteEntry.a, noteEntry.b].filter(Boolean).join(' '));
        });
      });
      (parsed.archivedData || []).forEach((archive: any) => {
        const dateKey: string = archive.date || '';
        if (!dateKey) return;
        const parts = dateKey.split('-').map(Number);
        if (parts.length < 3) return;
        const [y, m0, d] = parts;
        (archive.users || []).forEach((u: any) => push(u, dateKey, _fmt(y, m0, d)));
      });
    }
  } catch { /* continue */ }

  try {
    Object.keys(localStorage).forEach(key => {
      if (!key.startsWith('MUNSHI_RECORDS_')) return;
      let month: any[] = [];
      try { month = JSON.parse(localStorage.getItem(key) || '[]'); } catch { return; }
      month.forEach(r => {
        if (!r?.name?.trim()) return;
        if (String(r.cabinNumber || '').trim() !== cabinTarget) return;
        if (!r.amount || Number(r.amount) === 0) return;
        const dedupeKey = `${r.dateKey}|${r.name}|${r.timeIn || ''}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        records.push({ ...r, roughNote: r.roughNote || '' });
      });
    });
  } catch { /* ignore */ }

  if (records.length === 0) return null;

  records.sort((a, b) => {
    const ts = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m, d).getTime(); };
    return ts(b.dateKey) - ts(a.dateKey);
  });

  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const maxAmount   = Math.max(...records.map(r => r.amount));

  return {
    displayName: `Cabin #${cabinTarget}`,
    totalVisits: records.length,
    totalAmount,
    avgAmount: Math.round(totalAmount / records.length),
    maxAmount,
    lastVisitDate: records[0].date,
    firstVisitDate: records[records.length - 1].date,
    commonCabin: cabinTarget,
    records,
  };
}

function brainSearch(query: string): BrainResult | null {
  if (typeof window === 'undefined') return null;
  const raw = query.trim();
  if (raw.length < 1) return null;

  // ── Cabin search detection ────────────────────────────────────────────────
  // Patterns: "5", "05", "cabin 5", "cabin#5", "#5", "no 5", "no.5"
  const cabinRx = /^(?:cabin\s*#?|no\.?\s*#?|#)?(\d{1,2})$/i;
  const cm = raw.match(cabinRx);
  if (cm) {
    const n = parseInt(cm[1]);
    if (n >= 1 && n <= 30) return brainSearchByCabin(String(n));
  }

  // ── Name search (existing behaviour) ─────────────────────────────────────
  const q = raw.toLowerCase();
  if (q.length < 2) return null;

  const records: BrainRecord[] = [];
  const seen = new Set<string>();

  const push = (u: any, dateKey: string, displayDate: string, roughNote = '') => {
    if (!u?.name?.trim()) return;
    if (!u.name.trim().toLowerCase().includes(q)) return;
    if (!u.amount || Number(u.amount) === 0) return;
    const dedupeKey = `${dateKey}|${u.name}|${u.timeIn || ''}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    records.push({
      name: u.name,
      cabinNumber: u.cabinNumber || '',
      timeIn: u.timeIn || '',
      timeOut: u.timeOut || '',
      amount: Number(u.amount) || 0,
      date: displayDate,
      dateKey,
      roughNote,
    });
  };

  // ── Primary source: CLICK_CAFE_DB_V2 ──────────────────────────────────────
  try {
    const rawDb = localStorage.getItem('CLICK_CAFE_DB_V2');
    if (rawDb) {
      const parsed = JSON.parse(rawDb);

      const md: Record<string, any> = parsed.masterData || {};
      Object.keys(md).forEach(dateKey => {
        const day = md[dateKey];
        if (!day?.users) return;
        const parts = dateKey.split('-').map(Number);
        if (parts.length < 3) return;
        const [y, m0, d] = parts;
        const displayDate = _fmt(y, m0, d);
        const notes: any[] = day.notes || [];
        (day.users as any[]).forEach((u, idx) => {
          const noteEntry = notes[idx] || {};
          const roughNote = [noteEntry.a, noteEntry.b].filter(Boolean).join(' ');
          push(u, dateKey, displayDate, roughNote);
        });
      });

      (parsed.archivedData || []).forEach((archive: any) => {
        const dateKey: string = archive.date || '';
        if (!dateKey) return;
        const parts = dateKey.split('-').map(Number);
        if (parts.length < 3) return;
        const [y, m0, d] = parts;
        (archive.users || []).forEach((u: any) => push(u, dateKey, _fmt(y, m0, d)));
      });
    }
  } catch { /* continue to secondary */ }

  // ── Secondary source: MUNSHI_RECORDS_* monthly index ──────────────────────
  try {
    Object.keys(localStorage).forEach(key => {
      if (!key.startsWith('MUNSHI_RECORDS_')) return;
      let month: any[] = [];
      try { month = JSON.parse(localStorage.getItem(key) || '[]'); } catch { return; }
      month.forEach(r => {
        if (!r?.name?.trim()) return;
        if (!r.name.trim().toLowerCase().includes(q)) return;
        if (!r.amount || Number(r.amount) === 0) return;
        const dedupeKey = `${r.dateKey}|${r.name}|${r.timeIn || ''}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);
        records.push({ ...r, roughNote: r.roughNote || '' });
      });
    });
  } catch { /* ignore */ }

  if (records.length === 0) return null;

  records.sort((a, b) => {
    const ts = (k: string) => {
      const [y, m, d] = k.split('-').map(Number);
      return new Date(y, m, d).getTime();
    };
    return ts(b.dateKey) - ts(a.dateKey);
  });

  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const maxAmount   = Math.max(...records.map(r => r.amount));
  const cabinCounts: Record<string, number> = {};
  records.forEach(r => {
    if (r.cabinNumber?.trim())
      cabinCounts[r.cabinNumber] = (cabinCounts[r.cabinNumber] || 0) + 1;
  });
  const commonCabin =
    Object.keys(cabinCounts).sort((a, b) => cabinCounts[b] - cabinCounts[a])[0] || '--';

  return {
    displayName: records[0].name,
    totalVisits: records.length,
    totalAmount,
    avgAmount: Math.round(totalAmount / records.length),
    maxAmount,
    lastVisitDate: records[0].date,
    firstVisitDate: records[records.length - 1].date,
    commonCabin,
    records,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Neural Network Background (pure CSS animated particles)
// ─────────────────────────────────────────────────────────────────────────────
const NEURONS = [
  { x: 12, y: 18, d: 6.2, delay: 0 },
  { x: 35, y: 8,  d: 7.1, delay: 1.2 },
  { x: 60, y: 22, d: 5.8, delay: 0.6 },
  { x: 82, y: 12, d: 6.5, delay: 2.1 },
  { x: 20, y: 48, d: 8.0, delay: 1.7 },
  { x: 48, y: 55, d: 6.0, delay: 0.3 },
  { x: 75, y: 42, d: 7.4, delay: 2.8 },
  { x: 92, y: 65, d: 5.5, delay: 1.0 },
  { x: 8,  y: 72, d: 6.8, delay: 3.2 },
  { x: 30, y: 80, d: 7.0, delay: 0.9 },
  { x: 55, y: 78, d: 5.2, delay: 2.4 },
  { x: 78, y: 85, d: 6.3, delay: 1.5 },
  { x: 42, y: 35, d: 4.8, delay: 3.7 },
  { x: 67, y: 60, d: 7.6, delay: 0.4 },
  { x: 18, y: 92, d: 5.0, delay: 2.0 },
];

// SVG connection pairs
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[6,7],[4,8],[8,9],[9,10],[10,11],
  [1,12],[12,13],[5,13],[6,13],[9,14],[10,14],[2,12],[7,11],
];

// ─────────────────────────────────────────────────────────────────────────────
//  Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BrainPage() {
  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [visibleRows, setVisibleRows] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 180);

  const result = useMemo<BrainResult | null>(
    () => brainSearch(debouncedQuery),
    [debouncedQuery]
  );

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Reset visible rows when query changes
  useEffect(() => { setVisibleRows(50); }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const isEmpty   = debouncedQuery.trim().length >= 1 && !result;
  const hasResult = !!result;
  const searching = query !== debouncedQuery && query.trim().length >= 1;

  return (
    <div style={s.root} className="custom-scrollbar">
      <style>{css}</style>

      {/* ── Neural Network Background ── */}
      <div style={s.networkBg} aria-hidden="true">
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="nglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Connection lines */}
          {CONNECTIONS.map(([i, j], idx) => (
            <line
              key={idx}
              x1={`${NEURONS[i].x}%`} y1={`${NEURONS[i].y}%`}
              x2={`${NEURONS[j].x}%`} y2={`${NEURONS[j].y}%`}
              stroke="rgba(99,102,241,0.12)"
              strokeWidth="1"
              className="nn-line"
              style={{ animationDelay: `${idx * 0.3}s` }}
            />
          ))}
          {/* Neuron dots */}
          {NEURONS.map((n, i) => (
            <circle
              key={i}
              cx={`${n.x}%`} cy={`${n.y}%`}
              r={n.d / 2}
              fill="rgba(99,102,241,0.5)"
              className="nn-dot"
              style={{ animationDelay: `${n.delay}s` }}
            />
          ))}
        </svg>
      </div>

      {/* ── Back Button ── */}
      <Link href="/" style={s.backBtn} className="brain-back-btn">
        ← Dashboard
      </Link>

      {/* ── Main Content ── */}
      <div style={s.content}>

        {/* Title */}
        <div style={s.titleBlock}>
          <div style={s.titleGlow} aria-hidden="true" />
          <h1 style={s.title} className="brain-title">THE SMART FINDER BRAIN</h1>
          <p style={s.titleSub}>10-Year History Engine &nbsp;·&nbsp; Spider Station</p>
        </div>

        {/* Search Box */}
        <div style={s.searchWrap} className={focused ? 'brain-search-wrap-focused' : 'brain-search-wrap'}>
          <div style={s.searchInner}>
            <span style={s.searchIcon} aria-hidden="true">🧠</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Type a Name or Cabin# (1-30) to Activate The Brain..."
              style={s.searchInput}
              className="brain-input"
              spellCheck={false}
              autoComplete="off"
            />
            {searching && <span style={s.spinner} className="brain-spinner">⟳</span>}
            {query && !searching && (
              <button onClick={clearSearch} style={s.clearBtn} className="brain-clear-btn" title="Clear">✕</button>
            )}
          </div>
          {/* Energy flow border */}
          {focused && <div style={s.energyBorder} className="brain-energy" aria-hidden="true" />}
        </div>

        {/* Idle state */}
        {!query && (
          <div style={s.idleState}>
            <div style={s.idleIcon} className="brain-idle-icon">🧠</div>
            <p style={s.idleText}>The Brain is ready.</p>
            <p style={s.idleSub}>Type a name (2+ chars) or cabin number (1–30) to scan 10 years of records.</p>
          </div>
        )}

        {/* No results */}
        {isEmpty && (
          <div style={s.emptyState}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={s.emptyTitle}>No past records found</p>
            <p style={s.emptySub}>for &ldquo;{debouncedQuery}&rdquo;</p>
          </div>
        )}

        {/* Results */}
        {hasResult && result && (
          <div style={s.resultsWrap}>

            {/* Stats Block */}
            <div style={s.statsGrid}>
              <StatCard icon="📊" label="Total Transactions" value={result.totalVisits.toString()} color="#6366f1" />
              <StatCard icon="💰" label="Total Volume" value={`Rs ${result.totalAmount.toLocaleString()}`} color="#fbbf24" />
              <StatCard icon="📈" label="Avg Per Visit" value={`Rs ${result.avgAmount.toLocaleString()}`} color="#22d3ee" />
              <StatCard icon="🏆" label="Highest" value={`Rs ${result.maxAmount.toLocaleString()}`} color="#34d399" />
              <StatCard icon="🏠" label="Fav Cabin" value={`#${result.commonCabin}`} color="#f472b6" />
              <StatCard icon="📅" label="Last Visit" value={result.lastVisitDate} color="#a78bfa" />
              <StatCard icon="🗓️" label="First Visit" value={result.firstVisitDate} color="#94a3b8" />
              <StatCard icon="👤" label="Name" value={result.displayName} color="#6366f1" wide />
            </div>

            {/* Records Table */}
            <div style={s.tableWrap}>
              <div style={s.tableHeader}>
                <span style={s.thTotal}>{result.records.length} records found for &ldquo;{debouncedQuery}&rdquo;</span>
                {result.records.length > visibleRows && (
                  <button
                    onClick={() => setVisibleRows(v => v + 100)}
                    style={s.loadMoreBtn}
                    className="brain-load-more"
                  >
                    Show more ({result.records.length - visibleRows} remaining)
                  </button>
                )}
              </div>

              <div style={s.tableScroll}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['#', 'Date', 'Name', 'Cabin', 'Time In', 'Time Out', 'Amount', 'Rough Note'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.slice(0, visibleRows).map((r, i) => (
                      <tr key={`${r.dateKey}-${r.name}-${r.timeIn}-${i}`}
                          style={s.tr}
                          className="brain-row">
                        <td style={{ ...s.td, color: '#6366f1', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ ...s.td, color: '#a78bfa', whiteSpace: 'nowrap' }}>{r.date}</td>
                        <td style={{ ...s.td, color: '#e2e8f0', fontWeight: 600 }}>{r.name}</td>
                        <td style={{ ...s.td, color: '#22d3ee', textAlign: 'center' }}>
                          {r.cabinNumber ? `#${r.cabinNumber}` : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td style={{ ...s.td, color: '#94a3b8', fontFamily: 'monospace' }}>{r.timeIn || '—'}</td>
                        <td style={{ ...s.td, color: '#94a3b8', fontFamily: 'monospace' }}>{r.timeOut || '—'}</td>
                        <td style={{ ...s.td, color: '#fbbf24', fontWeight: 800, textAlign: 'right' }}>
                          Rs {r.amount.toLocaleString()}
                        </td>
                        <td style={{ ...s.td, color: '#6b7280', fontStyle: 'italic', fontSize: 11 }}>
                          {r.roughNote || <span style={{ color: '#1e293b' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.records.length > visibleRows && (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <button onClick={() => setVisibleRows(v => v + 100)} style={s.loadMoreBtn} className="brain-load-more">
                    + Load 100 more ({result.records.length - visibleRows} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Stat Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, wide }: {
  icon: string; label: string; value: string; color: string; wide?: boolean;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}0a 0%, #0f0f1e 100%)`,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        gridColumn: wide ? 'span 2' : undefined,
        boxShadow: `0 0 18px ${color}18`,
      }}
      className="brain-stat-card"
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ color: `${color}bb`, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color, fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Inline Styles
// ─────────────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 20% 30%, #0d0625 0%, #060412 40%, #020108 70%, #000000 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#e2e8f0',
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'scroll',
    display: 'block',
  },
  networkBg: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  backBtn: {
    position: 'fixed',
    top: 16,
    left: 20,
    zIndex: 10,
    color: '#6366f1',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1,
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid rgba(99,102,241,0.3)',
    background: 'rgba(99,102,241,0.08)',
    transition: 'all 0.2s',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '80px 24px 60px',
  },
  titleBlock: {
    textAlign: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  titleGlow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    width: 500,
    height: 120,
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  title: {
    fontSize: 'clamp(22px, 4vw, 38px)',
    fontWeight: 900,
    letterSpacing: 6,
    margin: 0,
    textShadow: '0 0 30px rgba(99,102,241,0.7), 0 0 60px rgba(99,102,241,0.3)',
  },
  titleSub: {
    color: 'rgba(99,102,241,0.55)',
    fontSize: 12,
    letterSpacing: 3,
    margin: '8px 0 0',
    textTransform: 'uppercase',
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 32,
  },
  searchInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(6,4,20,0.9)',
    border: '1.5px solid rgba(99,102,241,0.35)',
    borderRadius: 16,
    padding: '14px 20px',
    backdropFilter: 'blur(12px)',
  },
  searchIcon: { fontSize: 24, flexShrink: 0 },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: 0.5,
    caretColor: '#6366f1',
  },
  spinner: {
    fontSize: 18,
    color: '#6366f1',
    flexShrink: 0,
  },
  clearBtn: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 6,
    color: '#6366f1',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  energyBorder: {
    position: 'absolute',
    inset: -1,
    borderRadius: 17,
    pointerEvents: 'none',
  },
  idleState: {
    textAlign: 'center',
    marginTop: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  idleIcon: { fontSize: 64, lineHeight: 1 },
  idleText: {
    color: 'rgba(99,102,241,0.7)',
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 2,
    margin: 0,
  },
  idleSub: {
    color: 'rgba(99,102,241,0.35)',
    fontSize: 13,
    letterSpacing: 1,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  emptySub: {
    color: '#475569',
    fontSize: 14,
    margin: 0,
  },
  resultsWrap: { display: 'flex', flexDirection: 'column', gap: 24 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },
  tableWrap: {
    background: 'rgba(6,4,20,0.7)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 14,
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(99,102,241,0.15)',
    flexWrap: 'wrap',
    gap: 8,
  },
  thTotal: {
    color: 'rgba(99,102,241,0.7)',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  loadMoreBtn: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.35)',
    borderRadius: 8,
    color: '#818cf8',
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  tableScroll: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    color: 'rgba(99,102,241,0.6)',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: 700,
    borderBottom: '1px solid rgba(99,102,241,0.12)',
    background: 'rgba(99,102,241,0.04)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid rgba(99,102,241,0.06)',
    cursor: 'default',
    transition: 'background 0.15s',
  },
  td: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  CSS (keyframes, hover states, animations)
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  /* Title glow pulse */
  @keyframes brain-title-glow {
    0%,100% { text-shadow: 0 0 30px rgba(99,102,241,0.7), 0 0 60px rgba(99,102,241,0.3); }
    50%      { text-shadow: 0 0 50px rgba(99,102,241,1),   0 0 100px rgba(99,102,241,0.5), 0 0 160px rgba(99,102,241,0.2); }
  }
  .brain-title { animation: brain-title-glow 3s ease-in-out infinite; }

  /* Idle brain pulse */
  @keyframes brain-idle-pulse {
    0%,100% { transform: scale(1);    filter: drop-shadow(0 0 12px rgba(99,102,241,0.4)); }
    50%      { transform: scale(1.08); filter: drop-shadow(0 0 28px rgba(99,102,241,0.9)); }
  }
  .brain-idle-icon { animation: brain-idle-pulse 2.5s ease-in-out infinite; }

  /* Neural network line pulse */
  @keyframes nn-line-pulse {
    0%,100% { stroke-opacity: 0.08; }
    50%      { stroke-opacity: 0.3; }
  }
  .nn-line { animation: nn-line-pulse 4s ease-in-out infinite; }

  /* Neuron dot pulse */
  @keyframes nn-dot-pulse {
    0%,100% { r: 3; opacity: 0.4; }
    50%      { r: 5; opacity: 0.9; }
  }
  .nn-dot { animation: nn-dot-pulse 3s ease-in-out infinite; }

  /* Search wrap focus state — glowing border */
  .brain-search-wrap-focused > div:first-child {
    border-color: rgba(99,102,241,0.8) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 30px rgba(99,102,241,0.25);
  }

  /* Energy flow border animation */
  @keyframes brain-energy-flow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .brain-energy {
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(99,102,241,0.6) 20%,
      rgba(34,211,238,0.8) 50%,
      rgba(251,191,36,0.6) 80%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: brain-energy-flow 1.5s linear infinite;
    height: 2px;
    border-radius: 2px;
    bottom: -2px;
    top: auto !important;
    inset: auto !important;
    left: 10% !important;
    right: 10% !important;
    width: 80% !important;
  }

  /* Spinner spin */
  @keyframes brain-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .brain-spinner { animation: brain-spin 0.7s linear infinite; display: inline-block; color: #6366f1; }

  /* Input placeholder */
  .brain-input::placeholder { color: rgba(99,102,241,0.35); }

  /* Row fade-in */
  @keyframes brain-row-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .brain-row {
    animation: brain-row-in 0.25s ease-out both;
  }
  .brain-row:hover { background: rgba(99,102,241,0.07) !important; transform: scaleX(1.002); }

  /* Stat card hover */
  .brain-stat-card { transition: transform 0.18s, box-shadow 0.18s; }
  .brain-stat-card:hover { transform: translateY(-2px) scale(1.02); }

  /* Back button hover */
  .brain-back-btn:hover {
    background: rgba(99,102,241,0.18) !important;
    box-shadow: 0 0 16px rgba(99,102,241,0.4);
    color: #818cf8 !important;
  }

  /* Clear button hover */
  .brain-clear-btn:hover {
    background: rgba(99,102,241,0.3) !important;
    box-shadow: 0 0 10px rgba(99,102,241,0.4);
  }

  /* Load more hover */
  .brain-load-more:hover {
    background: rgba(99,102,241,0.28) !important;
    box-shadow: 0 0 12px rgba(99,102,241,0.35);
  }

  /* Scrollbar */
  .brain-row::-webkit-scrollbar { height: 4px; }
  * { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.3) transparent; }

  /* Custom Scrollbar Styling */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { 
    background: #10b981; 
    border-radius: 10px; 
    opacity: 0.8;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
    background: #059669; 
  }
`;
