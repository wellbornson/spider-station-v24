"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming standard utils, or I can inline helper

// Types for User Data
export interface User {
  id: string | number;
  no: number;
  name: string;
  timeIn: string;
  timeOut: string;
  amount: number;
}

interface UserGridProps {
  users: User[];
  onSelectionTotalChange?: (total: number) => void;
}

export function UserGrid({ users, onSelectionTotalChange }: UserGridProps) {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());

  // Helper to toggle selection
  const toggleSelection = (user: User) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(user.id)) {
      newSelected.delete(user.id);
    } else {
      newSelected.add(user.id);
    }
    setSelectedRowIds(newSelected);
    
    // Calculate total
    const total = users
      .filter(u => newSelected.has(u.id))
      .reduce((sum, u) => sum + u.amount, 0);
    
    if (onSelectionTotalChange) {
      onSelectionTotalChange(total);
    }
  };

  // Render a single table block
  const renderTable = (rows: User[]) => (
    <div className="border border-slate-700 rounded-md overflow-hidden bg-slate-900/50">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase bg-slate-950 text-cyan-400">
          <tr>
            <th className="px-2 py-2">No</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">In</th>
            <th className="px-2 py-2">Out</th>
            <th className="px-2 py-2 text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr 
              key={user.id} 
              onClick={() => toggleSelection(user)}
              className={cn(
                "border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors",
                selectedRowIds.has(user.id) ? "bg-cyan-900/20" : ""
              )}
            >
              <td className="px-2 py-3 md:py-1 font-mono">{user.no}</td>
              <td className="px-2 py-3 md:py-1 font-medium text-white">{user.name}</td>
              <td className="px-2 py-3 md:py-1 text-slate-400">{user.timeIn}</td>
              <td className="px-2 py-3 md:py-1 text-slate-400">{user.timeOut}</td>
              <td className="px-2 py-3 md:py-1 text-right font-mono text-cyan-200">
                {user.amount.toFixed(2)}
              </td>
            </tr>
          ))}
          {/* Fill empty rows to ensure 15 rows height if needed, or rely on CSS */}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-4 overflow-y-auto pb-20 md:pb-4">
      {/* Block 1: Rows 0-14 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-widest px-1">Section 1 (1-15)</h3>
        {renderTable(users.slice(0, 15))}
      </div>
      
      {/* Block 2: Rows 15-29 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-widest px-1">Section 2 (16-30)</h3>
        {renderTable(users.slice(15, 30))}
      </div>
      
      {/* Block 3: Rows 30-44 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-widest px-1">History / Archives</h3>
        {renderTable(users.slice(30, 45))}
      </div>
    </div>
  );
}
