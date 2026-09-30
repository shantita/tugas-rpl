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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{Title}</span>
        <div className={`p-2.5 rounded-xl ${ColorClass}`}>
          {Icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {FormatRupiah(Amount)}
        </h3>
        {Description && (
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {Description}
          </p>
        )}
      </div>
    </div>
  );
};
