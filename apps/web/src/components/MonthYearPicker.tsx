import React from "react";
import { MonthNames } from "../utils/formatters";
import { Calendar } from "lucide-react";

interface MonthYearPickerProps {
  Month: number;
  Year: number;
  OnChange: (month: number, year: number) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ Month, Year, OnChange }) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 shadow-xs max-w-full">
      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
      <select
        value={Month}
        onChange={(e) => OnChange(Number(e.target.value), Year)}
        aria-label="Pilih Bulan"
        className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer py-0.5"
      >
        {MonthNames.map((name, idx) => (
          <option key={name} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>
      <span className="text-slate-300 text-xs sm:text-sm">/</span>
      <select
        value={Year}
        onChange={(e) => OnChange(Month, Number(e.target.value))}
        aria-label="Pilih Tahun"
        className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer py-0.5"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};
