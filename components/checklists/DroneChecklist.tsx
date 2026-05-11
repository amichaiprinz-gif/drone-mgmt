"use client";
import { useState } from "react";
import type { Procedure } from "@/lib/types";

const phaseColors: Record<string, { from: string; to: string; text: string; dot: string }> = {
  "בטיחות":    { from: "from-blue-600",   to: "to-blue-800",   text: "text-blue-100",  dot: "bg-blue-400" },
  "ציוד":      { from: "from-violet-600", to: "to-violet-800", text: "text-violet-100",dot: "bg-violet-400" },
  "תקשורת":   { from: "from-sky-600",    to: "to-sky-800",    text: "text-sky-100",   dot: "bg-sky-400" },
  "עוגנים":   { from: "from-amber-500",  to: "to-amber-700",  text: "text-amber-100", dot: "bg-amber-400" },
  "מגלה":     { from: "from-emerald-600",to: "to-emerald-800",text: "text-emerald-100",dot: "bg-emerald-400" },
  "הגנה":      { from: "from-red-600",    to: "to-red-800",    text: "text-red-100",   dot: "bg-red-400" },
  "סיום":      { from: "from-gray-600",   to: "to-gray-800",   text: "text-gray-100",  dot: "bg-gray-400" },
  "default":   { from: "from-slate-600",  to: "to-slate-800",  text: "text-slate-100", dot: "bg-slate-400" },
};

function getPhaseColor(cat: string) {
  for (const key of Object.keys(phaseColors)) {
    if (key !== "default" && cat.includes(key)) return phaseColors[key];
  }
  return phaseColors["default"];
}

type Item = { order: number; category: string; text: string; checked: boolean };

function buildItems(procedures: Procedure[]): Item[] {
  let order = 1;
  return procedures.flatMap((proc) =>
    [...proc.steps]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ order: order++, category: s.category, text: s.text, checked: false }))
  );
}

function groupByCategory(items: Item[]): [string, Item[]][] {
  const seen = new Set<string>();
  const groups: [string, Item[]][] = [];
  for (const item of items) {
    if (!seen.has(item.category)) {
      seen.add(item.category);
      groups.push([item.category, items.filter((i) => i.category === item.category)]);
    }
  }
  return groups;
}

export function DroneChecklist({
  droneName,
  droneLabel,
  procedures,
  accentFrom,
  accentTo,
  emoji,
}: {
  droneName: string;
  droneLabel: string;
  procedures: Procedure[];
  accentFrom: string;
  accentTo: string;
  emoji: string;
}) {
  const [items, setItems] = useState<Item[]>(() => buildItems(procedures));

  function toggle(order: number) {
    setItems((prev) =>
      prev.map((i) => (i.order === order ? { ...i, checked: !i.checked } : i))
    );
  }

  function resetAll() {
    setItems((prev) => prev.map((i) => ({ ...i, checked: false })));
  }

  const checked = items.filter((i) => i.checked).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const complete = checked === total && total > 0;

  const groups = groupByCategory(items);

  return (
    <div className="space-y-4 pb-8">
      {/* Hero header */}
      <div className={`bg-gradient-to-br ${accentFrom} ${accentTo} rounded-3xl p-5 text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-0.5">
              Checklist
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{emoji} {droneLabel}</h1>
            <p className="text-white/70 text-xs mt-0.5">{droneName}</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {pct}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-white/80" dir="rtl">
          <span>{checked} / {total} פריטים</span>
          {complete && <span className="font-semibold text-white">✓ מוכן להטסה</span>}
        </div>
      </div>

      {/* Category sections */}
      {groups.map(([cat, catItems]) => {
        const colors = getPhaseColor(cat);
        const catChecked = catItems.filter((i) => i.checked).length;
        const catDone = catChecked === catItems.length;

        return (
          <div key={cat} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Section header */}
            <div className={`bg-gradient-to-r ${colors.from} ${colors.to} px-4 py-2.5 flex items-center justify-between`} dir="rtl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className={`font-bold text-sm tracking-wide ${colors.text}`}>{cat}</span>
              </div>
              <span className={`text-xs ${colors.text} opacity-80`}>
                {catDone ? "✓ הושלם" : `${catChecked}/${catItems.length}`}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50 bg-white">
              {catItems.map((item) => (
                <button
                  key={item.order}
                  dir="rtl"
                  onClick={() => toggle(item.order)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all active:scale-[0.99] text-right ${
                    item.checked ? "bg-green-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      item.checked
                        ? "bg-green-500 border-green-500 shadow-sm shadow-green-200"
                        : "border-gray-300"
                    }`}
                  >
                    {item.checked && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <span
                    className={`text-sm flex-1 leading-snug transition-all duration-200 ${
                      item.checked ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {item.text}
                  </span>

                  <span className="text-gray-300 text-xs shrink-0 w-5 text-center" dir="ltr">
                    {item.order}.
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Reset button */}
      {checked > 0 && (
        <button
          onClick={resetAll}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-sm font-medium hover:border-gray-400 hover:text-gray-500 transition-all"
        >
          אפס צ׳קליסט
        </button>
      )}

      {complete && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center space-y-1">
          <p className="text-2xl">✅</p>
          <p className="font-bold text-green-800">כל הפריטים הושלמו!</p>
          <p className="text-sm text-green-600">{droneLabel} מוכן להטסה</p>
        </div>
      )}
    </div>
  );
}
