"use client";

import Modal from "./Modal";
import { AlertTriangle, Loader2 } from "lucide-react";

/** نافذة تأكيد مخصصة (بديل راقٍ لـ confirm) */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = true,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            danger
              ? "bg-rose-100 text-rose-600"
              : "bg-brand-100 text-brand-700"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </span>
        <p className="pt-2 text-sm leading-7 text-ink-700">{message}</p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="btn-outline !px-6 !py-2.5 text-sm !text-ink-600 !border-ink-200 hover:!bg-ink-50 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${
            danger
              ? "bg-gradient-to-l from-rose-600 to-rose-500 shadow-lg shadow-rose-500/30 hover:from-rose-700 hover:to-rose-600"
              : "btn-primary !px-6 !py-2.5 text-sm"
          }`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
