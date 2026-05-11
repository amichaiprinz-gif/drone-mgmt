"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Battery, BatteryStatus } from "@/lib/types";

const cfg: Record<BatteryStatus, { label: string; cls: string; next: BatteryStatus }> = {
  charged: { label: "✓", cls: "bg-green-100 text-green-800 border-green-300", next: "empty" },
  empty:   { label: "×", cls: "bg-red-100 text-red-700 border-red-300",       next: "charged" },
  storage: { label: "S", cls: "bg-blue-100 text-blue-700 border-blue-300",    next: "charged" },
  damaged: { label: "!", cls: "bg-gray-200 text-gray-400 border-gray-300",    next: "damaged" },
};

export function InlineBatteries({ batteries }: { batteries: Battery[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(b: Battery) {
    if (b.status === "damaged") return;
    setLoading(b.id);
    await supabase.from("batteries").update({
      status: cfg[b.status].next,
      last_charged_at: cfg[b.status].next === "charged" ? new Date().toISOString() : b.last_charged_at,
    }).eq("id", b.id);
    setLoading(null);
    router.refresh();
  }

  if (!batteries.length) return null;

  const charged = batteries.filter((b) => b.status === "charged").length;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div dir="rtl" className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">סוללות</span>
        <span className="text-xs text-gray-400">{charged}/{batteries.length} טעונות</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {batteries.map((b) => {
          const c = cfg[b.status];
          return (
            <button
              key={b.id}
              onClick={() => toggle(b)}
              disabled={loading === b.id || b.status === "damaged"}
              title={b.status === "charged" ? "טעונה — לחץ לסמן ריקה" : b.status === "empty" ? "ריקה — לחץ לסמן טעונה" : b.status === "storage" ? "אחסון" : "פגומה"}
              className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all active:scale-95 ${c.cls} ${loading === b.id ? "opacity-40" : ""}`}
            >
              {b.label} <span className="font-normal opacity-70">{c.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-300 mt-1.5">לחיצה מחליפה סטטוס</p>
    </div>
  );
}
