'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { syncService } from '../../lib/sync-service';

interface GlobalDataContextType {
  masterData: { [key: string]: any };
  setMasterData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
  refreshData: () => Promise<void>;
  /** Load a specific month's keys into memory on demand (Task 5 lazy loading). */
  loadMonthData: (year: number, month: number) => void;
  isSyncing: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [masterData, setMasterData] = useState<{ [key: string]: any }>({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load initial data from localStorage
  useEffect(() => {
    // ── Factory Reset (FINAL CLIENT HANDOVER - PRODUCTION READY) ──────────────
    // This block ensures the client receives a 100% clean system.
    // To trigger a fresh wipe on any machine, increment the version flag below.
    if (!localStorage.getItem('CLICK_HANDOVER_PRODUCTION_READY_V2')) {
      const keysToWipe = [
        // Main Database & Inventory
        'CLICK_CAFE_DB_V2',
        'cafe_inventory_data',
        'CLICK_CAFE_DB_V1',
        
        // Transaction & Sales History
        'CLICK_NET_SALES',
        'CLICK_SELECTED_DATE',
        'CLICK_CAFE_USERS',
        'CLICK_CAFE_WORKERS',
        'CLICK_CAFE_EXPENSES',
        'CLICK_CAFE_DASHBOARD',
        
        // Migration & Logic Flags
        'CLICK_CAFE_WIPED_V1',
        'CLICK_CAFE_WIPED_V2',
        'CLICK_CAFE_WIPED_V3',
        'CLICK_CAFE_WIPED_V4',
        'CLICK_CAFE_WIPED_V5',
        'CLICK_CAFE_WIPED_V6',
        'CLICK_CAFE_WIPED_V7',
        'CLICK_HANDOVER_RESET_V1',
        'CLICK_HANDOVER_RESET_V2',
        'CLICK_HANDOVER_PRODUCTION_READY_V1',
        
        // Auth & Security (Force fresh admin setup)
        'spider_station_auth',
        'spider_station_auth_v2',
        'admin_pin',
        'CLICK_ADMIN_PIN',
      ];
      
      // Wipe all HISAB/UDHAR monthly records and any other CLICK-prefixed keys
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('HISAB_DATA_') || k.startsWith('UDHAR_DATA_') || k.startsWith('CLICK_')) {
          keysToWipe.push(k);
        }
      });
      
      // Execute Nuclear Wipe
      keysToWipe.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      
      // Set the final production flag
      localStorage.setItem('CLICK_HANDOVER_PRODUCTION_READY_V2', '1');
      
      // Reset state immediately
      setMasterData({});
    }
    // ─────────────────────────────────────────────────────────────────────────

    // One-time wipe: strip blank auto-filled rows from all saved days (migration v2)
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V2')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            Object.keys(parsed.masterData).forEach(key => {
              const day = parsed.masterData[key];
              if (Array.isArray(day.users)) {
                day.users = day.users.filter((u: any) =>
                  u.name?.trim() || u.timeIn?.trim() || u.timeOut?.trim() || String(u.amount ?? '').trim()
                );
              }
              if (Array.isArray(day.workers)) {
                day.workers = day.workers.filter((w: any) =>
                  w.name && w.name !== 'New Worker' && (w.salary || w.advance || w.bonus)
                );
              }
            });
          }
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V2', '1');
    }

    // ── Migration v3: strict ghost-row purge ─────────────────────────────
    // V2 kept rows where amount===0 (number) because String(0)==='0' is truthy.
    // V3 uses the same stricter rule as the runtime filter in getCurrentData:
    // a row must have a real name, a real cabin number, OR a real non-zero amount.
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V3')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            Object.keys(parsed.masterData).forEach(key => {
              const day = parsed.masterData[key];
              if (Array.isArray(day.users)) {
                day.users = day.users.filter((u: any) => {
                  const hasName   = u.name        && String(u.name).trim()        !== '';
                  const hasCabin  = u.cabinNumber && String(u.cabinNumber).trim() !== '';
                  const hasAmount = u.amount      && String(u.amount).trim()      !== '' && String(u.amount).trim() !== '0';
                  return hasName || hasCabin || hasAmount;
                });
              }
            });
          }
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V3', '1');
    }

    // ── Migration v4: NUCLEAR PURGE — name-only filter ───────────────────
    // V3 kept rows with a cabin number or amount but no name.
    // V4 enforces the strictest rule: a row MUST have a non-empty name.
    // This matches the save-time sanitizer in page.tsx so the two are in sync.
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V4')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            Object.keys(parsed.masterData).forEach(key => {
              const day = parsed.masterData[key];
              if (Array.isArray(day.users)) {
                day.users = day.users.filter(
                  (u: any) => u.name && String(u.name).trim() !== ''
                );
              }
            });
          }
          // Also purge archived data of nameless rows
          if (Array.isArray(parsed.archivedData)) {
            parsed.archivedData = parsed.archivedData.map((archive: any) => ({
              ...archive,
              users: Array.isArray(archive.users)
                ? archive.users.filter((u: any) => u.name && String(u.name).trim() !== '')
                : [],
            })).filter((archive: any) => archive.users.length > 0);
          }
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V4', '1');
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Migration v5: clear auto-numbered cabinNumbers from blank draft rows ──
    // Previously draft rows were initialized with cabinNumber = String(serialNo).
    // That value caused them to be persisted as if the user had entered something.
    // We now treat any draft row with an empty name + empty amount + a cabinNumber
    // that matches its auto-generated serial position as "never touched" and wipe
    // the cabinNumber so the field appears blank on screen.
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V5')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            Object.keys(parsed.masterData).forEach(key => {
              const day = parsed.masterData[key];
              if (!Array.isArray(day.users)) return;
              day.users = day.users.map((u: any) => {
                // Only touch rows that were never manually edited
                const blankName   = !u.name   || String(u.name).trim()   === '';
                const blankTime   = !u.timeIn  && !u.timeOut;
                const blankAmount = !u.amount  || String(u.amount).trim() === '' || String(u.amount).trim() === '0';
                if (blankName && blankTime && blankAmount && u.cabinNumber) {
                  return { ...u, cabinNumber: '' };
                }
                return u;
              });
            });
          }
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V5', '1');
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Migration v6: clear cabin numbers from today's saved records ──────────
    // User requirement: 300 blank-cabin rows per day; cabin# entered manually.
    // This one-time pass strips any persisted cabinNumber from today's named rows
    // so the field appears blank and ready for fresh manual entry.
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V6')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            const t = new Date();
            const todayKey = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
            if (parsed.masterData[todayKey]?.users) {
              parsed.masterData[todayKey].users = parsed.masterData[todayKey].users.map(
                (u: any) => ({ ...u, cabinNumber: '' })
              );
              localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
            }
          }
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V6', '1');
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Migration v7: assign valid `no` (1-300) to rows missing it ──────────
    // Old data may have rows with no `no` field, or `no` > 300.
    // The grid placer in getCurrentData silently drops these rows.
    // This migration patches them so no session data is lost after a reload.
    if (!localStorage.getItem('CLICK_CAFE_WIPED_V7')) {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.masterData) {
            Object.keys(parsed.masterData).forEach(key => {
              const day = parsed.masterData[key];
              if (!Array.isArray(day.users) || day.users.length === 0) return;
              const usedNos = new Set<number>();
              // First pass: collect valid `no` values already in use
              day.users.forEach((u: any) => {
                if (typeof u.no === 'number' && u.no >= 1 && u.no <= 300) {
                  usedNos.add(u.no);
                }
              });
              // Second pass: assign next free slot to rows with missing/invalid `no`
              let nextSlot = 1;
              day.users = day.users.map((u: any) => {
                const valid = typeof u.no === 'number' && u.no >= 1 && u.no <= 300;
                if (valid) return u;
                while (usedNos.has(nextSlot) && nextSlot <= 300) nextSlot++;
                if (nextSlot > 300) return u; // grid full — leave as-is
                usedNos.add(nextSlot);
                return { ...u, no: nextSlot++ };
              });
            });
          }
          localStorage.setItem('CLICK_CAFE_DB_V2', JSON.stringify(parsed));
        } catch (_) { /* ignore */ }
      }
      localStorage.setItem('CLICK_CAFE_WIPED_V7', '1');
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Task 5: Date-indexed loading ─────────────────────────────────────────
    // Parse the raw JSON once, then load ONLY the current month's keys into
    // memory. Historical months are kept in localStorage and pulled on demand
    // (when the user navigates to that date). This prevents 100 K+ rows from
    // ever landing in JS heap on startup.
    const savedData = localStorage.getItem('CLICK_CAFE_DB_V2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.masterData) {
          const today = new Date();
          // Build prefix for current month: "YYYY-M" (month is 0-indexed in key)
          const currentMonthPrefix = `${today.getFullYear()}-${today.getMonth()}-`;
          const initialLoad: { [key: string]: any } = {};
          Object.keys(parsed.masterData).forEach(key => {
            // Always load current month; skip older months (lazy-load on nav)
            if (key.startsWith(currentMonthPrefix)) {
              initialLoad[key] = parsed.masterData[key];
            }
          });
          setMasterData(initialLoad);
          // Store the full dataset in a ref so navigating to old dates still works
          // The page.tsx loadMonthData function reads from localStorage directly
        }
      } catch (e) {
        // Error parsing saved data
      }
    }
    // ─────────────────────────────────────────────────────────────────────────
  }, []);

  // Function to refresh data from backend — date-indexed, same strategy as init
  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const savedData = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.masterData) {
          const today = new Date();
          const currentMonthPrefix = `${today.getFullYear()}-${today.getMonth()}-`;
          setMasterData(prev => {
            const next: { [key: string]: any } = { ...prev };
            Object.keys(parsed.masterData).forEach(key => {
              if (key.startsWith(currentMonthPrefix)) next[key] = parsed.masterData[key];
            });
            return next;
          });
        }
      }
    } catch (_) {
      // Error refreshing data
    } finally {
      setIsSyncing(false);
    }
  };

  // Task 5: On-demand month loader — called by page.tsx when user navigates to
  // a different month. Merges only that month's keys into state, leaving all
  // other months untouched. Never re-parses the entire JSON blob on every tick.
  const loadMonthData = (year: number, month: number) => {
    try {
      const raw = localStorage.getItem('CLICK_CAFE_DB_V2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed.masterData) return;
      const prefix = `${year}-${month}-`;
      const patch: { [key: string]: any } = {};
      Object.keys(parsed.masterData).forEach(key => {
        if (key.startsWith(prefix)) patch[key] = parsed.masterData[key];
      });
      if (Object.keys(patch).length > 0) {
        setMasterData(prev => ({ ...prev, ...patch }));
      }
    } catch (_) { /* ignore */ }
  };

  // Listen for storage events to sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'CLICK_CAFE_DB_V2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.masterData) {
            setMasterData(parsed.masterData);
          }
        } catch (error) {
          // Error parsing storage change
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <GlobalDataContext.Provider value={{ masterData, setMasterData, refreshData, loadMonthData, isSyncing }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}