"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";

interface ClickableDateTimePickerProps {
  value: string; // ISO string or "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

/**
 * Clean & Minimalist Date-Time Picker Component
 * Modern native date and time controls without cluttered quick-chips.
 */
export default function ClickableDateTimePicker({
  value,
  onChange,
  label = "Tanggal & Waktu Pelaksanaan",
  required = false,
}: ClickableDateTimePickerProps) {
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

  const getReadablePreview = () => {
    if (!selectedDate) return "Belum ada tanggal dipilih";
    try {
      const d = new Date(`${selectedDate}T${selectedTime || "10:00"}`);
      return (
        d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }) + ` pukul ${selectedTime} WIB`
      );
    } catch {
      return `${selectedDate} ${selectedTime}`;
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-[#061f1d] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-teal-800/40 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 dark:text-teal-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
          <span>
            {label} {required && "*"}
          </span>
        </label>
        <span className="text-[10px] text-slate-400">Pilih tanggal & jam</span>
      </div>

      {/* Minimalist Grid: Date and Time Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
            Tanggal
          </label>
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
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/60 text-slate-800 dark:text-white font-medium text-xs focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 cursor-pointer shadow-2xs transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
            Jam Waktu (WIB)
          </label>
          <div className="relative">
            <input
              type="time"
              required={required}
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              onClick={(e) => {
                try {
                  if ("showPicker" in e.currentTarget) {
                    (e.currentTarget as any).showPicker();
                  }
                } catch {}
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200 dark:border-teal-800/60 text-slate-800 dark:text-white font-medium text-xs focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 cursor-pointer shadow-2xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Clean Live Schedule Preview Banner */}
      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c2b29] border border-slate-200/80 dark:border-teal-800/60 flex items-center gap-2">
        <Check className="w-4 h-4 text-[#0F766E] dark:text-teal-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold uppercase">
            Jadwal Terpilih:
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-teal-300 truncate">
            {getReadablePreview()}
          </p>
        </div>
      </div>
    </div>
  );
}
