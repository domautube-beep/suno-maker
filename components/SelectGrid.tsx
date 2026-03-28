"use client";

interface SelectGridProps {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}

export default function SelectGrid({ options, onSelect }: SelectGridProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-foreground transition-all"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
