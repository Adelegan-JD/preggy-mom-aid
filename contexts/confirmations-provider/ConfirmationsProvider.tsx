"use client";

/**
 * Confirmation dialogs — ported from rapkids-frontend `contexts/confirmations-provider`
 * (same API), rebuilt on the native <dialog> element with the design system so it
 * needs no extra dependencies and keeps focus, Escape and screen-reader semantics.
 */

import { type PropsWithChildren, useEffect, useId, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import context from "./context";
import type { Confirmation, confirmOptions } from "./types";

const generateId = (() => { let id = 0; return () => ++id; })();

function ConfirmDialog({ confirmation, onConfirm, onCancel }: { confirmation: Confirmation; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    // Safer default focus: Cancel for destructive actions.
    if (!confirmation.requireText) cancelRef.current?.focus();
  }, [confirmation.requireText]);

  const blocked = confirmation.loading || (confirmation.requireText !== undefined && typed !== confirmation.requireText);

  return (
    <dialog
      ref={ref}
      className="ds-dialog"
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-message`}
      onCancel={(event) => { event.preventDefault(); if (!confirmation.loading) onCancel(); }}
      onClick={(event) => { if (event.target === ref.current && !confirmation.loading) onCancel(); }}
    >
      <form method="dialog" className="ds-dialog-body" onSubmit={(event) => { event.preventDefault(); if (!blocked) onConfirm(); }}>
        {confirmation.isDelete && <span className="ds-dialog-icon" aria-hidden="true"><AlertTriangle size={20} /></span>}
        <h2 className="ds-h2" id={`${uid}-title`}>{confirmation.title}</h2>
        <div className="ds-dialog-message" id={`${uid}-message`}>{confirmation.message}</div>
        {confirmation.requireText && (
          <div className="ds-field">
            <label className="ds-label" htmlFor={`${uid}-typed`}>Type <b>{confirmation.requireText}</b> to confirm</label>
            <input className="ds-input" id={`${uid}-typed`} autoComplete="off" autoFocus value={typed} onChange={(event) => setTyped(event.target.value)} />
          </div>
        )}
        <div className="ds-dialog-actions">
          <button ref={cancelRef} type="button" className="ds-btn" onClick={onCancel} disabled={confirmation.loading}>{confirmation.cancelText}</button>
          <button type="submit" className={confirmation.isDelete ? "ds-btn ds-btn-danger-solid" : "ds-btn ds-btn-primary"} disabled={blocked} aria-busy={confirmation.loading}>
            {confirmation.loading ? "Please wait…" : confirmation.confirmText}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function ConfirmationsProvider({ children }: PropsWithChildren) {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const returnFocus = useRef<Map<string | number, HTMLElement | null>>(new Map());

  const remove = (id: string | number) => {
    setConfirmations((prev) => prev.filter((c) => c.id !== id));
    const target = returnFocus.current.get(id);
    returnFocus.current.delete(id);
    setTimeout(() => target?.focus?.(), 0);
  };

  const openConfirmModal = (message: Confirmation["message"], onConfirm: Confirmation["onConfirm"], options?: confirmOptions) => {
    const id = generateId();
    returnFocus.current.set(id, document.activeElement as HTMLElement | null);
    setConfirmations((prev) => [...prev, {
      id, message, onConfirm, open: true, loading: false,
      title: options?.title || "Are you sure?",
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      onCancel: options?.onCancel,
      isDelete: options?.isDelete || false,
      shouldCloseOnConfirm: options?.shouldCloseOnConfirm ?? true,
      requireText: options?.requireText,
    }]);
  };

  const closeConfirmModal = () => setConfirmations((prev) => {
    const last = prev[prev.length - 1];
    if (last) setTimeout(() => remove(last.id), 0);
    return prev;
  });

  const setLoading = (loading: boolean) => setConfirmations((prev) => prev.map((c, i) => (i === prev.length - 1 ? { ...c, loading } : c)));

  const handleConfirm = async (confirmation: Confirmation) => {
    setConfirmations((prev) => prev.map((c) => (c.id === confirmation.id ? { ...c, loading: true } : c)));
    try {
      await confirmation.onConfirm();
      if (confirmation.shouldCloseOnConfirm) remove(confirmation.id);
      else setConfirmations((prev) => prev.map((c) => (c.id === confirmation.id ? { ...c, loading: false } : c)));
    } catch {
      // Errors are reported by the caller; keep the dialog open so the user can retry or cancel.
      setConfirmations((prev) => prev.map((c) => (c.id === confirmation.id ? { ...c, loading: false } : c)));
    }
  };

  const handleCancel = async (confirmation: Confirmation) => {
    remove(confirmation.id);
    await confirmation.onCancel?.();
  };

  return (
    <context.Provider value={{ openConfirmModal, closeConfirmModal, setLoading }}>
      {children}
      {confirmations.map((confirmation) => (
        <ConfirmDialog key={confirmation.id} confirmation={confirmation} onConfirm={() => void handleConfirm(confirmation)} onCancel={() => void handleCancel(confirmation)} />
      ))}
    </context.Provider>
  );
}
