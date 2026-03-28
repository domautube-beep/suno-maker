"use client";

import { useState } from "react";

interface MultiSelectGridProps {
  options: { label: string; value: string }[];
  maxSelect?: number;
  onSubmit: (values: string[]) => void;
}

export default function MultiSelectGrid({ options, maxSelect = 4, onSubmit }: MultiSelectGridProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= maxSelect) return prev;
      return [...prev, value];
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selected.includes(opt.value)
                ? "bg-accent/20 text-accent border border-accent/40"
                : "bg-card border border-border text-muted hover:text-foreground hover:border-accent/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          onClick={() => onSubmit(selected)}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent-dim transition-all"
        >
          선택 완료 ({selected.length}/{maxSelect})
        </button>
      )}
    </div>
  );
}
