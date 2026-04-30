import React from 'react';
import { cn } from '@/lib/utils';

export interface User {
  id: string | number;
  no: number;
  name: string;
  timeIn: string;
  timeOut: string;
  amount: number;
}

interface TableBlockProps {
  data: User[];
  startIndex: number;
  selectedIds: Set<string | number>;
  onRowClick: (user: User) => void;
}

export function TableBlock({ data, startIndex, selectedIds, onRowClick }: TableBlockProps) {
  // Ensure we always render 15 rows to maintain layout stability
  const rowsToRender = Array.from({ length: 15 }).map((_, i) => {
    const user = data[i];
    return {
      user,
      displayIndex: startIndex + i
    };
  });

  return (
    <div className="border border-slate-800 bg-[#020617] rounded overflow-hidden flex flex-col h-full">
      <div className="grid grid-cols-[3rem_1fr_4rem_4rem_5rem] bg-slate-950 text-cyan-500 text-xs uppercase font-bold tracking-wider border-b border-slate-800 sticky top-0">
        <div className="p-2 border-r border-slate-900 text-center">No.</div>
        <div className="p-2 border-r border-slate-900">Name</div>
        <div className="p-2 border-r border-slate-900 text-center">In</div>
        <div className="p-2 border-r border-slate-900 text-center">Out</div>
        <div className="p-2 text-right">Amount</div>
      </div>
      
      <div className="flex-1">
        {rowsToRender.map(({ user, displayIndex }) => (
          <div 
            key={user ? user.id : `empty-${displayIndex}`}
            onClick={() => user && onRowClick(user)}
            className={cn(
              "grid grid-cols-[3rem_1fr_4rem_4rem_5rem] border-b border-slate-800/50 text-sm h-10 items-center transition-colors",
              user ? "cursor-pointer hover:bg-cyan-950/30" : "opacity-50",
              user && selectedIds.has(user.id) ? "bg-cyan-900/40 text-cyan-100" : "text-slate-400"
            )}
          >
            <div className="px-2 font-mono text-center text-slate-500">{displayIndex}</div>
            <div className="px-2 truncate font-medium">{user?.name || '-'}</div>
            <div className="px-2 text-center font-mono text-xs">{user?.timeIn || '--:--'}</div>
            <div className="px-2 text-center font-mono text-xs">{user?.timeOut || '--:--'}</div>
            <div className={cn("px-2 text-right font-mono", user ? "text-cyan-300" : "")}>
              {user ? user.amount.toFixed(2) : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
