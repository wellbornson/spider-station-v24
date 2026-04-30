'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, BookOpen, TrendingDown, CheckCircle, Clock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface UdharEntry {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  note: string;
}

interface UdharMonthData {
  entries: UdharEntry[];
}

// ─────────────────────────────────────────────────────────────
//  Storage helpers  (Task 5: isolated per year-month key)
// ─────────────────────────────────────────────────────────────
const udharKey = (y: number, m: number) => `UDHAR_DATA_${y}_${m}`;

function loadUdhar(y: number, m: number): UdharMonthData {
  if (typeof window === 'undefined') return { entries: [] };
  try {
    const raw = localStorage.getItem(udharKey(y, m));
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt — fall through */ }
  return { entries: [] };
}

function saveUdhar(y: number, m: number, data: UdharMonthData) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(udharKey(y, m), JSON.stringify(data)); } catch { /* quota */ }
}

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const START_YEAR = 2026;
const END_YEAR   = 2036;
const YEARS      = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function UdharPage() {
  // ── SESSION PERSISTENCE: Global Page Zoom (Plus/Minus) ──
  const [uiScale, setUiScale] = useState<number>(1);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionVal = sessionStorage.getItem('globalPageScale');
      if (sessionVal) setUiScale(parseFloat(sessionVal));
    }
  }, []);

  const today     = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [data,  setData]  = useState<UdharMonthData>({ entries: [] });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load data when year/month changes (Task 2) ──────────────
  useEffect(() => {
    setData(loadUdhar(year, month));
  }, [year, month]);

  // ── Debounced save (Task 5) ──────────────────────────────────
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const doWrite = () => saveUdhar(year, month, data);
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doWrite, { timeout: 1500 });
      } else {
        setTimeout(doWrite, 0);
      }
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data, year, month]);

  // ── Derived totals (Task 4) ──────────────────────────────────
  const { grandTotal, pendingCount, paidCount } = useMemo(() => {
    let grandTotal   = 0;
    let pendingCount = 0;
    let paidCount    = 0;
    data.entries.forEach(e => {
      if (e.status === 'pending') { grandTotal += Number(e.amount) || 0; pendingCount++; }
      else paidCount++;
    });
    return { grandTotal, pendingCount, paidCount };
  }, [data.entries]);

  // ── Mutations ────────────────────────────────────────────────
  const addRow = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { id: Date.now(), name: '', amount: 0, date: todayStr, status: 'pending', note: '' },
      ],
    }));
  }, []);

  const updateEntry = useCallback(<K extends keyof UdharEntry>(id: number, field: K, value: UdharEntry[K]) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, [field]: value } : e),
    }));
  }, []);

  const toggleStatus = useCallback((id: number) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.id === id ? { ...e, status: e.status === 'pending' ? 'paid' : 'pending' } : e
      ),
    }));
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  }, []);

  // ── Input class helper ───────────────────────────────────────
  const inp = 'w-full bg-transparent outline-none text-white placeholder-white/20 focus:placeholder-white/40 transition-all duration-150';

  return (
    <>
    {/* Zoom viewport wrapper — ensures scale is applied globally in this session */}
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0f0c1a' }}>
    <div
      className="min-h-screen text-white flex flex-col"
      style={{ 
        background: 'linear-gradient(135deg, #0f0c1a 0%, #130d2e 40%, #0a0718 100%)',
        width: `${parseFloat((100 / uiScale).toFixed(4))}vw`,
        height: `${parseFloat((100 / uiScale).toFixed(4))}vh`,
        transform: `scale(${uiScale})`,
        transformOrigin: 'top left',
        transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out, height 0.2s ease-in-out',
      }}
    >
      {/* ── Inline styles (keyframes + scrollbar) ── */}
      <style>{`
        @keyframes udhar-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes udhar-row-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes grand-pulse {
          0%,100% { box-shadow: 0 0 18px rgba(160,32,240,0.4); }
          50%      { box-shadow: 0 0 36px rgba(160,32,240,0.75), 0 0 60px rgba(160,32,240,0.3); }
        }
        .udhar-page  { animation: udhar-fade-in 0.4s ease both; }
        .udhar-row   { animation: udhar-row-in  0.25s ease both; }
        .grand-total { animation: grand-pulse 3s ease-in-out infinite; }
        /* Scrollbar */
        .udhar-scroll::-webkit-scrollbar       { width: 5px; }
        .udhar-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
        .udhar-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#a020f0,#7c3aed); border-radius: 4px; box-shadow: 0 0 6px rgba(160,32,240,0.5); }
        /* Input focus */
        .udhar-inp:focus { box-shadow: 0 1px 0 0 rgba(160,32,240,0.6); }
      `}</style>

      {/* ════════════════════════════════════════
          TOP BAR
      ════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 flex items-center gap-4 px-5 py-3 border-b"
        style={{
          background: 'rgba(15,12,26,0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(160,32,240,0.3)',
          boxShadow: '0 2px 20px rgba(160,32,240,0.15)',
        }}
      >
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-400/60 transition-all duration-200"
        >
          <ArrowLeft size={13} /> Back
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" />
          <h1 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500">
            UDHAR LEDGER
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Task 2: Month + Year selectors ── */}
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-white/[0.06] border border-purple-500/30 text-purple-200 text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-purple-400/60 transition-all"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i} className="bg-[#130d2e] text-white">{m}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-white/[0.06] border border-purple-500/30 text-purple-200 text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-purple-400/60 transition-all"
          >
            {YEARS.map(y => (
              <option key={y} value={y} className="bg-[#130d2e] text-white">{y}</option>
            ))}
          </select>
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-2 ml-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold">
            <Clock size={9} /> {pendingCount} Pending
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
            <CheckCircle size={9} /> {paidCount} Paid
          </span>
        </div>
      </header>

      {/* ════════════════════════════════════════
          PERIOD LABEL
      ════════════════════════════════════════ */}
      <div className="px-6 pt-5 pb-2 udhar-page">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-500/60">
          {MONTHS[month]} {year} — Credit Ledger
        </p>
      </div>

      {/* ════════════════════════════════════════
          TABLE  (Tasks 3 + 6)
      ════════════════════════════════════════ */}
      <div className="flex-1 px-4 pb-40 overflow-y-auto udhar-scroll">
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: 'rgba(160,32,240,0.25)', boxShadow: '0 4px 32px rgba(160,32,240,0.08)' }}
        >
          {/* Table header */}
          <div
            className="grid text-[10px] font-black uppercase tracking-widest text-purple-400/70 px-3 py-2 border-b"
            style={{
              gridTemplateColumns: '3rem 1fr 8rem 8rem 7rem 4rem',
              background: 'rgba(160,32,240,0.06)',
              borderColor: 'rgba(160,32,240,0.2)',
            }}
          >
            <span className="text-center">S.No</span>
            <span>Customer Name</span>
            <span className="text-right">Amount (PKR)</span>
            <span className="text-center">Date</span>
            <span className="text-center">Status</span>
            <span className="text-center">Del</span>
          </div>

          {/* Rows */}
          {data.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-purple-500/30">
              <BookOpen size={40} strokeWidth={1} className="mb-3 opacity-40" />
              <p className="text-sm font-bold tracking-widest uppercase">No entries yet</p>
              <p className="text-xs mt-1 opacity-60">Click + below to add the first udhar entry</p>
            </div>
          ) : (
            data.entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="udhar-row grid items-center px-3 py-2 border-b transition-all duration-200 group"
                style={{
                  gridTemplateColumns: '3rem 1fr 8rem 8rem 7rem 4rem',
                  borderColor: 'rgba(160,32,240,0.1)',
                  background: entry.status === 'paid'
                    ? 'rgba(16,185,129,0.04)'
                    : idx % 2 === 0
                    ? 'rgba(160,32,240,0.03)'
                    : 'transparent',
                  animationDelay: `${idx * 0.03}s`,
                }}
              >
                {/* S.No */}
                <span
                  className="text-center text-xs font-black tabular-nums"
                  style={{ color: entry.status === 'paid' ? 'rgba(52,211,153,0.5)' : 'rgba(160,32,240,0.6)' }}
                >
                  {idx + 1}
                </span>

                {/* Customer Name */}
                <input
                  value={entry.name}
                  onChange={e => updateEntry(entry.id, 'name', e.target.value)}
                  placeholder="Customer name…"
                  className={`${inp} udhar-inp text-sm font-bold px-1 py-0.5 rounded ${entry.status === 'paid' ? 'line-through text-white/40' : 'text-white'}`}
                />

                {/* Amount */}
                <input
                  type="number"
                  value={entry.amount || ''}
                  onChange={e => updateEntry(entry.id, 'amount', Number(e.target.value))}
                  placeholder="0"
                  className={`${inp} udhar-inp text-right text-sm font-black tabular-nums px-1 py-0.5 rounded ${entry.status === 'paid' ? 'text-emerald-400/60 line-through' : 'text-purple-300'}`}
                />

                {/* Date */}
                <input
                  type="date"
                  value={entry.date}
                  onChange={e => updateEntry(entry.id, 'date', e.target.value)}
                  className={`${inp} udhar-inp text-center text-xs px-1 py-0.5 rounded text-slate-400`}
                  style={{ colorScheme: 'dark' }}
                />

                {/* Status Toggle */}
                <button
                  onClick={() => toggleStatus(entry.id)}
                  className={`mx-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                    entry.status === 'paid'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  {entry.status === 'paid' ? <><CheckCircle size={9} /> Paid</> : <><Clock size={9} /> Pending</>}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="flex items-center justify-center w-7 h-7 mx-auto rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
          GRAND TOTAL  (Task 4)
      ════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4"
        style={{
          background: 'linear-gradient(to top, rgba(15,12,26,0.98) 70%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4">

          {/* Grand Total box */}
          <div
            className="grand-total flex-1 flex items-center justify-between px-6 py-4 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(160,32,240,0.12) 0%, rgba(109,40,217,0.08) 100%)',
              borderColor: 'rgba(160,32,240,0.45)',
            }}
          >
            <div className="flex items-center gap-3">
              <TrendingDown size={20} className="text-purple-400" />
              <div>
                <p className="text-[9px] text-purple-400/60 uppercase tracking-[0.35em] font-bold leading-none mb-0.5">
                  Grand Total Udhar
                </p>
                <p className="text-[10px] text-purple-400/50 leading-none">
                  Pending entries only · {MONTHS[month]} {year}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-3xl font-black tabular-nums leading-none"
                style={{ textShadow: '0 0 20px rgba(160,32,240,0.7)' }}
              >
                <span className="text-purple-400/60 text-lg mr-1 font-bold">Rs</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-violet-200 to-purple-400">
                  {grandTotal.toLocaleString('en-PK')}
                </span>
              </p>
              {pendingCount > 0 && (
                <p className="text-[9px] text-purple-500/50 mt-0.5 tabular-nums">
                  {pendingCount} customer{pendingCount !== 1 ? 's' : ''} owe this amount
                </p>
              )}
            </div>
          </div>

          {/* ── Task 4: Neon + Add Row button ── */}
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-base border transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(160,32,240,0.2) 0%, rgba(109,40,217,0.15) 100%)',
              borderColor: 'rgba(160,32,240,0.6)',
              color: '#c084fc',
              boxShadow: '0 0 18px rgba(160,32,240,0.35)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(160,32,240,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 18px rgba(160,32,240,0.35)')}
          >
            <Plus size={20} strokeWidth={3} />
            Add Entry
          </button>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}
