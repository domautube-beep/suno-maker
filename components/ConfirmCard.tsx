"use client";

import { SunoInput } from "@/lib/types";
import { STEPS } from "@/lib/steps";

interface ConfirmCardProps {
  inputs: SunoInput;
  onConfirm: () => void;
  onReset: () => void;
}

function getLabel(stepId: string, value: string): string {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step?.options) return value;
  return step.options.find((o) => o.value === value)?.label || value;
}

export default function ConfirmCard({ inputs, onConfirm, onReset }: ConfirmCardProps) {
  const rows = [
    { label: "핵심", value: inputs.oneLiner },
    { label: "느낌", value: inputs.vibe || "(AI 추론)" },
    { label: "장르", value: inputs.genre || "(AI 추론)" },
    { label: "악기", value: inputs.instruments ? inputs.instruments.split(",").slice(0, 3).map((i: string) => i.split(",")[0].trim()).join(", ") : "(AI 추론)" },
    { label: "BPM", value: inputs.tempo ? getLabel("tempo", inputs.tempo) : "(AI 추론)" },
    { label: "박자", value: inputs.timeSignature ? getLabel("timeSignature", inputs.timeSignature) : "(AI 추론)" },
    { label: "시대", value: inputs.era ? getLabel("era", inputs.era) : "(AI 추론)" },
    { label: "텍스처", value: inputs.texture ? getLabel("texture", inputs.texture) : "(AI 추론)" },
    { label: "보컬", value: inputs.vocal || "(AI 추론)" },
    { label: "리버브", value: inputs.reverb ? getLabel("reverb", inputs.reverb) : "(AI 추론)" },
    { label: "언어", value: getLabel("language", inputs.language) },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-sm font-medium text-text-primary">이걸로 만들까요?</p>
      </div>
      <div className="px-5 py-4 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 text-sm">
            <span style={{ color: "#a3a3a3", width: "48px", flexShrink: 0, fontSize: "12px" }}>{row.label}</span>
            <span style={{ color: row.value.includes("AI") ? "#d4d4d4" : "#0a0a0a", fontSize: "12px" }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-border flex gap-2">
        <button
          onClick={onConfirm}
          style={{ backgroundColor: "#f97316" }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
        >
          만들어줘
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl text-sm text-text-muted border border-border hover:text-text-primary transition-all"
        >
          다시
        </button>
      </div>
    </div>
  );
}
