"use client";

import { useRef } from "react";
import { LogOut } from "lucide-react";
import { useConfirmations } from "@/contexts/confirmations-provider";

/** Sign-out control that asks for confirmation before running the server action. */
export default function SignOutButton({ action, label, iconOnly = false, className = "ds-btn ds-btn-block", formClassName }: { action: () => Promise<void>; label: string; iconOnly?: boolean; className?: string; formClassName?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { openConfirmModal } = useConfirmations();
  return (
    <form ref={formRef} action={action} className={formClassName}>
      <button
        type="button"
        className={className}
        aria-label={iconOnly ? label : undefined}
        onClick={() => openConfirmModal(
          "You will need to sign in again to see your private health space.",
          () => new Promise<void>(() => formRef.current?.requestSubmit()),
          { title: "Sign out?", confirmText: label, cancelText: "Stay signed in" }
        )}
      >
        <LogOut size={iconOnly ? 18 : 16} aria-hidden="true" />{!iconOnly && <> {label}</>}
      </button>
    </form>
  );
}
