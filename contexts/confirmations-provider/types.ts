import type { ReactElement } from "react";

export type Confirmation = confirmOptions & {
  id: string | number;
  message: string | ReactElement;
  open: boolean;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
};

export interface confirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => Promise<void> | void;
  /** Styles the confirm button as destructive. */
  isDelete?: boolean;
  shouldCloseOnConfirm?: boolean;
  /** Preggy Mom Aid addition: the user must type this exact text before confirming (e.g. "DELETE"). */
  requireText?: string;
}

export interface ConfirmationsContextValue {
  openConfirmModal: (message: string | ReactElement, onConfirm: () => Promise<void> | void, options?: confirmOptions) => void;
  closeConfirmModal: () => void;
  setLoading: (loading: boolean) => void;
}
