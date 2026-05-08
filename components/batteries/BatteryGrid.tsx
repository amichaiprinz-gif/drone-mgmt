"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Battery, BatteryStatus } from "@/lib/types";

const statusConfig: Record<BatteryStatus, { label: string; color: string; next: BatteryStatus }> = {
  charged:  { label: "טעונה ✓", color: "bg-green-100 text-green-800 border-green-200",  next: "empty" },
  empty:    { label: "ריקה",    color: "bg-red-100 text-red-700 border-red-200",        next: "charged" },
  storage:  { label: "אחסון",   color: "bg-blue-100 text-blue-700 border-blue-200",     next: "charged" },
  damaged:  { label: "פגומה",   color: "bg-gray-200 text-gray-500 border-gray-300",     next: "damaged" },
};

const modelLabels: Record<string, string> = {
  avata: "DJI Avata",
  ivo: "IVO (איבו)",
};

export function BatteryGrid({ batteries }: { batteries: Battery[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const grouped = batteries.reduce<Record<string, Battery[]>>((acc, b) => {
    if (!acc[b.drone_model]) acc[b.drone_model] = [];
    acc[b.drone_model].push(b);
    return acc;
  }, {});

  async function toggle(battery: Battery) {
    if (battery.status === "damaged") return;
    setLoading(battery.id);
    const next = statusConfig[battery.status].next;
    await supabase.from("batteries").update({
      status: next,
      last_charged_at: next === "charged" ? new Date().toISOString() : battery.last_charged_at,
    }).eq("id", battery.id);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([model, batts]) => (
        <div key={model}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            {modelLabels[model] ?? model}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {batts.map((b) => {
              const cfg = statusConfig[b.status];
              return (
                <button
                  key={b.id}
                  onClick={() => toggle(b)}
                  disabled={loading === b.id || b.status === "damaged"}
                  className={`rounded-xl border-2 p-3 text-center font-medium text-sm transition-all active:scale-95 ${cfg.color} ${loading === b.id ? "opacity-50" : ""}`}
                >
                  <div className="font-bold text-base">{b.label}</div>
                  <div className="text-xs mt-0.5 opacity-80">{cfg.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center pt-2">לחיצה על סוללה מחליפה סטטוס</p>
    </div>
  );
}
