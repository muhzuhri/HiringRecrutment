"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Check, Sparkles } from "lucide-react";

interface ClickableDateTimePickerProps {
  value: string; // ISO string or "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const PRESET_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "13:30",
  "14:00",
  "15:30",
  "16:30",
  "19:30",
];

export default function ClickableDateTimePicker({
  value,
  onChange,
  label = "Tanggal & Waktu Pelaksanaan",
  required = false,
}: ClickableDateTimePickerProps) {
  // Parse initial date & time parts
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("10:00");

  useEffect(() => {
    if (value) {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const hours = String(d.getHours()).padStart(2, "0");
          const mins = String(d.getMinutes()).padStart(2, "0");
          setSelectedDate(`${year}-${month}-${day}`);
          setSelectedTime(`${hours}:${mins}`);
        }
      } catch {}
    } else {
      // Default to tomorrow 10:00 if empty
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      setSelectedDate(dateStr);
      setSelectedTime("10:00");
      onChange(`${dateStr}T10:00:00.000Z`);
    }
  }, [value]);

  const updateCombinedValue = (dateStr: string, timeStr: string) => {
    if (!dateStr) return;
    const combined = `${dateStr}T${timeStr || "10:00"}`;
    try {
      const d = new Date(combined);
      onChange(d.toISOString());
    } catch {
      onChange(combined);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    updateCombinedValue(newDate, selectedTime);
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    updateCombinedValue(selectedDate, newTime);
  };

  // Helper for quick date chips
  const setQuickDate = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const str = `${year}-${month}-${day}`;
    handleDateChange(str);
  };

  const getDayFormatted = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  };

  // Format readable display
  const getReadablePreview = () => {
    if (!selectedDate) return "Belum ada tanggal dipilih";
    try {
      const d = new Date(`${selectedDate}T${selectedTime || "10:00"}`);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }) + ` pukul ${selectedTime} WIB`;
    } catch {
      return `${selectedDate} ${selectedTime}`;
    }
  };

  return (
    <div className="space-y-3.5 bg-slate-50 dark:bg-[#061f1d] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-emerald-800/60 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-500 dark:text-emerald-400" />
          <span>{label} {required && "*"}</span>
        </label>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Klik untuk memilih</span>
      </div>

      {/* 1. Quick Date Selection Chips (1-Click) */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Pilihan Cepat Tanggal:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#0c2b29] hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Hari Ini ({getDayFormatted(0)})
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(1)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#0c2b29] hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Besok ({getDayFormatted(1)})
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(2)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#0c2b29] hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Lusa ({getDayFormatted(2)})
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(3)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#0c2b29] hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            +3 Hari ({getDayFormatted(3)})
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(7)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#0c2b29] hover:bg-slate-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Minggu Depan ({getDayFormatted(7)})
          </button>
        </div>
      </div>

      {/* 2. Interactive Calendar Date Picker Input */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Atau Pilih Tanggal Melalui Kalender:
        </p>
        <div className="relative">
          <input
            type="date"
            required={required}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            onClick={(e) => {
              try {
                if ("showPicker" in e.currentTarget) {
                  (e.currentTarget as any).showPicker();
                }
              } catch {}
            }}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-800 text-slate-800 dark:text-white font-medium text-xs focus:outline-none focus:border-slate-800 dark:focus:border-emerald-500 cursor-pointer shadow-sm transition-all"
          />
        </div>
      </div>

      {/* 3. Clickable Quick Time Slot Pills */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500 dark:text-emerald-400" />
          <span>Pilih Jam Pelaksanaan (1 Klik):</span>
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_TIMES.map((t) => {
            const isSelected = selectedTime === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTimeChange(t)}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer text-center ${
                  isSelected
                    ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm ring-2 ring-slate-900/20 dark:ring-emerald-400/30"
                    : "bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950"
                }`}
              >
                {t} WIB
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Custom Time picker input (if outside preset hours) */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-emerald-950">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Jam Kustom:</span>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => handleTimeChange(e.target.value)}
          onClick={(e) => {
            try {
              if ("showPicker" in e.currentTarget) {
                (e.currentTarget as any).showPicker();
              }
            } catch {}
          }}
          className="px-3 py-1 rounded-lg bg-white dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-800 text-slate-800 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
        />
      </div>

      {/* 5. Live Summary Preview Card */}
      <div className="p-2.5 rounded-xl bg-slate-200/60 dark:bg-[#0c2b29] border border-slate-300 dark:border-emerald-700/60 flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Jadwal yang Ditentukan:</p>
          <p className="text-xs font-bold text-slate-900 dark:text-emerald-300 truncate">
            {getReadablePreview()}
          </p>
        </div>
      </div>
    </div>
  );
}

