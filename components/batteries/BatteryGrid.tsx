"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
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

const modelOptions = [
  { value: "avata", label: "DJI Avata" },
  { value: "ivo",   label: "IVO (איבו)" },
];

type EditState = { label: string; drone_model: string; status: BatteryStatus };

export function BatteryGrid({ batteries }: { batteries: Battery[] }) {
  const router = useRouter();
  const [toggling, setToggling] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // battery id being edited
  const [editState, setEditState] = useState<EditState>({ label: "", drone_model: "avata", status: "charged" });
  const [showAdd, setShowAdd] = useState(false);
  const [newBattery, setNewBattery] = useState<EditState>({ label: "", drone_model: "avata", status: "charged" });
  const [saving, setSaving] = useState(false);

  const grouped = batteries.reduce<Record<string, Battery[]>>((acc, b) => {
    if (!acc[b.drone_model]) acc[b.drone_model] = [];
    acc[b.drone_model].push(b);
    return acc;
  }, {});

  async function toggle(battery: Battery) {
    if (battery.status === "damaged") return;
    setToggling(battery.id);
    const next = statusConfig[battery.status].next;
    await supabase.from("batteries").update({
      status: next,
      last_charged_at: next === "charged" ? new Date().toISOString() : battery.last_charged_at,
    }).eq("id", battery.id);
    setToggling(null);
    router.refresh();
  }

  function startEdit(b: Battery) {
    setEditing(b.id);
    setEditState({ label: b.label, drone_model: b.drone_model, status: b.status as BatteryStatus });
  }

  async function saveEdit(id: string) {
    if (!editState.label.trim()) return;
    setSaving(true);
    await supabase.from("batteries").update({
      label: editState.label.trim(),
      drone_model: editState.drone_model,
      status: editState.status,
    }).eq("id", id);
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  async function deleteBattery(id: string) {
    if (!confirm("למחוק סוללה זו?")) return;
    await supabase.from("batteries").delete().eq("id", id);
    router.refresh();
  }

  async function addBattery() {
    if (!newBattery.label.trim()) return;
    setSaving(true);
    await supabase.from("batteries").insert({
      label: newBattery.label.trim(),
      drone_model: newBattery.drone_model,
      status: newBattery.status,
    });
    setSaving(false);
    setShowAdd(false);
    setNewBattery({ label: "", drone_model: "avata", status: "charged" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add battery form */}
      {showAdd ? (
        <div className="border-2 border-blue-300 rounded-2xl p-4 bg-blue-50 space-y-3">
          <p className="text-sm font-semibold text-blue-800" dir="rtl">סוללה חדשה</p>
          <input
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="שם סוללה (למשל: A1, סוללה 3...)"
            value={newBattery.label}
            onChange={(e) => setNewBattery((s) => ({ ...s, label: e.target.value }))}
            dir="rtl"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            {modelOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setNewBattery((s) => ({ ...s, drone_model: m.value }))}
                className={`py-2 rounded-xl border-2 text-sm transition-all ${
                  newBattery.drone_model === m.value
                    ? "border-blue-500 bg-blue-100 text-blue-700 font-medium"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(statusConfig) as BatteryStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setNewBattery((st) => ({ ...st, status: s }))}
                className={`py-2 rounded-xl border-2 text-xs transition-all ${
                  newBattery.status === s
                    ? "border-blue-500 bg-white font-medium"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
          <div dir="rtl" className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600"
            >
              ביטול
            </button>
            <button
              onClick={addBattery}
              disabled={saving || !newBattery.label.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? "שומר..." : "הוסף"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus size={16} /> הוסף סוללה
        </button>
      )}

      {Object.entries(grouped).map(([model, batts]) => (
        <div key={model}>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            {modelLabels[model] ?? model}
          </h2>
          <div className="space-y-2">
            {batts.map((b) => {
              const cfg = statusConfig[b.status as BatteryStatus];
              const isEditing = editing === b.id;

              if (isEditing) {
                return (
                  <div key={b.id} className="border-2 border-blue-300 rounded-xl p-3 bg-blue-50 space-y-2">
                    <input
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                      value={editState.label}
                      onChange={(e) => setEditState((s) => ({ ...s, label: e.target.value }))}
                      dir="rtl"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      {modelOptions.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setEditState((s) => ({ ...s, drone_model: m.value }))}
                          className={`py-1.5 rounded-lg border text-xs transition-all ${
                            editState.drone_model === m.value
                              ? "border-blue-500 bg-blue-100 text-blue-700 font-medium"
                              : "border-gray-200 text-gray-600"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(statusConfig) as BatteryStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditState((st) => ({ ...st, status: s }))}
                          className={`py-1.5 rounded-lg border text-xs transition-all ${
                            editState.status === s
                              ? "border-blue-500 bg-white font-medium"
                              : "border-gray-200 text-gray-500"
                          }`}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>
                    <div dir="rtl" className="flex gap-2 pt-1">
                      <button
                        onClick={() => setEditing(null)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => saveEdit(b.id)}
                        disabled={saving}
                        className="flex-1 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Check size={14} /> שמור
                      </button>
                      <button
                        onClick={() => deleteBattery(b.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={b.id} dir="rtl" className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(b)}
                    disabled={toggling === b.id || b.status === "damaged"}
                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-right font-medium text-sm transition-all active:scale-95 ${cfg.color} ${toggling === b.id ? "opacity-50" : ""}`}
                  >
                    <span className="font-bold">{b.label}</span>
                    <span className="text-xs opacity-80 mr-2">{cfg.label}</span>
                  </button>
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {batteries.length === 0 && !showAdd && (
        <p className="text-sm text-gray-400 text-center py-8">אין סוללות. לחץ "הוסף סוללה" להוספה.</p>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">לחיצה על סוללה מחליפה סטטוס · ✏️ לעריכה</p>
    </div>
  );
}
