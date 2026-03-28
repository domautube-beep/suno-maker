"use client";

import { useState, KeyboardEvent } from "react";

interface TextInputProps {
  placeholder?: string;
  required?: boolean;
  skipLabel?: string;
  onSubmit: (value: string) => void;
  onSkip?: () => void;
}

export default function TextInput({ placeholder, required, skipLabel, onSubmit, onSkip }: TextInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (required && !value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 bg-white border border-border rounded-full px-5 py-2.5 text-sm text-text-primary placeholder-text-disabled focus:outline-none focus:border-foreground transition-colors"
          placeholder={placeholder || "입력하세요..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {skipLabel && onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2.5 rounded-full text-sm font-medium border border-border text-text-secondary hover:border-foreground hover:text-text-primary transition-all flex-shrink-0"
          >
            {skipLabel}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={required && !value.trim()}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            required && !value.trim()
              ? "bg-surface-alt text-text-disabled cursor-not-allowed"
              : "bg-foreground text-white hover:bg-gray-800"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
