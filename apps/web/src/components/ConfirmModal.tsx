import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  IsOpen: boolean;
  Title: string;
  Message: string;
  ConfirmText?: string;
  CancelText?: string;
  OnConfirm: () => void;
  OnCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  IsOpen,
  Title,
  Message,
  ConfirmText = "Hapus",
  CancelText = "Batal",
  OnConfirm,
  OnCancel,
}) => {
  if (!IsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{Title}</h3>
        </div>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{Message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={OnCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {CancelText}
          </button>
          <button
            type="button"
            onClick={OnConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
          >
            {ConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
