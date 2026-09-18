import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type DateRangePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface DateRangeValue {
  preset: DateRangePreset;
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
}

export const DEFAULT_DATE_RANGE: DateRangeValue = {
  preset: 'all',
  startDate: '',
  endDate: '',
};

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRangeBounds(value: DateRangeValue): {
  start: Date | null;
  end: Date | null;
  startIso: string | null;
  endIso: string | null;
  startDateStr: string | null;
  endDateStr: string | null;
} {
  const now = new Date();

  if (value.preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
    const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'last_7_days') {
    const s = new Date(now);
    s.setDate(s.getDate() - 6);
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'last_30_days') {
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return {
      start,
      end,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      startDateStr: toLocalDateStr(start),
      endDateStr: toLocalDateStr(end),
    };
  }

  if (value.preset === 'custom') {
    let start: Date | null = null;
    let end: Date | null = null;
    if (value.startDate) {
      const [year, month, day] = value.startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    if (value.endDate) {
      const [year, month, day] = value.endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    return {
      start,
      end,
      startIso: start ? start.toISOString() : null,
      endIso: end ? end.toISOString() : null,
      startDateStr: value.startDate || null,
      endDateStr: value.endDate || null,
    };
  }

  return {
    start: null,
    end: null,
    startIso: null,
    endIso: null,
    startDateStr: null,
    endDateStr: null,
  };
}

export function isDateInRange(
  dateInput: string | Date | null | undefined,
  filter: DateRangeValue
): boolean {
  if (!dateInput) return false;
  if (filter.preset === 'all' && !filter.startDate && !filter.endDate) return true;

  let d: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, day] = dateInput.split('-').map(Number);
    d = new Date(y, m - 1, day, 12, 0, 0);
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return false;

  const { start, end } = getDateRangeBounds(filter);
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export function getDateRangeLabel(value: DateRangeValue): string {
  switch (value.preset) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'last_7_days':
      return 'Past 7 Days';
    case 'last_30_days':
      return 'Past 30 Days';
    case 'this_month':
      return 'This Month';
    case 'last_month':
      return 'Last Month';
    case 'custom': {
      if (value.startDate && value.endDate) {
        if (value.startDate === value.endDate) return value.startDate;
        return `${value.startDate} → ${value.endDate}`;
      }
      if (value.startDate) return `From ${value.startDate}`;
      if (value.endDate) return `Until ${value.endDate}`;
      return 'Custom Range';
    }
    case 'all':
    default:
      return 'All Time';
  }
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  align?: 'left' | 'right';
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  align = 'right',
  className = '',
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tempStart, setTempStart] = useState(value.startDate || '');
  const [tempEnd, setTempEnd] = useState(value.endDate || '');

  useEffect(() => {
    setTempStart(value.startDate || '');
    setTempEnd(value.endDate || '');
  }, [value.startDate, value.endDate, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last_7_days', label: 'Past 7 Days' },
    { id: 'last_30_days', label: 'Past 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  function handleSelectPreset(preset: DateRangePreset) {
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: tempStart,
        endDate: tempEnd,
      });
      return;
    }

    onChange({
      preset,
      startDate: '',
      endDate: '',
    });
    setIsOpen(false);
  }

  function handleApplyCustom() {
    onChange({
      preset: 'custom',
      startDate: tempStart,
      endDate: tempEnd,
    });
    setIsOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(DEFAULT_DATE_RANGE);
    setIsOpen(false);
  }

  const isFiltered = value.preset !== 'all';
  const label = getDateRangeLabel(value);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
          isFiltered
            ? 'bg-[#fb7a90]/10 border-[#fb7a90]/40 text-white shadow-sm shadow-[#fb7a90]/10'
            : 'bg-[#0f1117] border-white/10 text-white/80 hover:text-white hover:border-white/20'
        }`}
      >
        <CalendarIcon
          className={`w-4 h-4 ${isFiltered ? 'text-[#fb7a90]' : 'text-white/40'}`}
        />
        <span>{label}</span>

        {isFiltered ? (
          <span
            onClick={handleClear}
            className="p-0.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors ml-0.5"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-72 sm:w-80 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3.5 backdrop-blur-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#fb7a90]" /> Filter Date Range
              </span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-[#fb7a90] hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map(p => {
                const isSelected = value.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#fb7a90] text-white font-semibold shadow-sm'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Picker Section */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-3 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                Custom Dates
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={e => setTempStart(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={e => setTempEnd(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!tempStart && !tempEnd}
                className="w-full py-1.5 mt-1 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white font-semibold text-xs rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Apply Custom Range
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
