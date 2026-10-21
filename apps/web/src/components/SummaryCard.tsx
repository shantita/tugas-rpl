import React, { ReactNode } from "react";
import { FormatRupiah } from "../utils/formatters";

interface SummaryCardProps {
  Title: string;
  Amount: number;
  Icon: ReactNode;
  ColorClass: string;
  Description?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  Title,
  Amount,
  Icon,
  ColorClass,
  Description,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{Title}</span>
        <div className={`p-2.5 rounded-xl ${ColorClass}`}>
          {Icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">
          {FormatRupiah(Amount)}
        </h3>
        {Description && (
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            {Description}
          </p>
        )}
      </div>
    </div>
  );
};
