"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  placeholder?: string;
  describedBy?: string;
};

export default function PasswordField({ id, value, onChange, autoComplete, minLength, placeholder, describedBy }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="ds-password">
      <input
        className="ds-input"
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={describedBy}
      />
      <button type="button" onClick={() => setVisible(current => !current)} aria-pressed={visible} aria-controls={id}>
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        <span className="ds-visually-hidden">{visible ? "Hide password" : "Show password"}</span>
      </button>
    </div>
  );
}
