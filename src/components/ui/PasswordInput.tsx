"use client";

import React, { useState } from "react";
import { MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  disabled = false,
  required = false,
  autoComplete,
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon ?? <MdLockOutline size={17} />}
        </span>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-fce-maroon focus:ring-2 focus:ring-fce-gold/40 transition-all disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fce-maroon transition-colors cursor-pointer"
          aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          tabIndex={-1}
        >
          {showPassword ? (
            <MdVisibilityOff size={18} />
          ) : (
            <MdVisibility size={18} />
          )}
        </button>
      </div>
    </div>
  );
};
