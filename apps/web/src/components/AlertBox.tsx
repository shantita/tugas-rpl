import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertBoxProps {
  Type?: "info" | "warning" | "error" | "success";
  Message: string;
}

export const AlertBox: React.FC<AlertBoxProps> = ({ Type = "warning", Message }) => {
  const styles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-rose-50 text-rose-800 border-rose-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[Type]}`}>
      {icons[Type]}
      <div className="text-sm font-medium leading-relaxed">{Message}</div>
    </div>
  );
};
