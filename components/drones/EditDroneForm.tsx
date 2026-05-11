"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Drone, DroneStatus } from "@/lib/types";

const knownModels = [
  { value: "avata",     label: "DJI Avata" },
  { value: "ivo",       label: "IVO (איבו)" },
  { value: "mavic3pro", label: "Mavic 3 Pro" },
  { value: "air3",      label: "Air 3" },
  { value: "mini4",     label: "Mini 4" },
  { value: "other",     label: "אחר..." },
];

const knownModelValues = knownModels.map((m) => m.value).filter((v) => v !== "other");

export function EditDroneForm({ drone }: { drone: Drone }) {
  const router = useRouter();

  const isKnownModel = knownModelValues.includes(drone.model);
  const [name, setName] = useState(drone.name);
  const [modelKey, setModelKey] = useState<"avata" | "ivo" | "mavic3pro" | "air3" | "mini4" | "other">(
    isKnownModel ? (drone.model as "avata" | "ivo" | "mavic3pro" | "air3" | "mini4") : "other"
  );
  const [customModel, setCustomModel] = useState(isKnownModel ? "" : drone.model);
  const [type, setType] = useState<"military" | "civilian">(drone.type as "military" | "civilian");
  const [status, setStatus] = useState<DroneStatus>(drone.status as DroneStatus);
  const [serialNumber, setSerialNumber] = useState(drone.serial_number ?? "");
  const [notes, setNotes] = useState(drone.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOther = modelKey === "other";
  const modelToSave = isOther ? (customModel.trim() || "other") : modelKey;
  const canSave = !!name.trim() && (!isOther || !!customModel.trim());

  async function save() {
    if (!canSave) return;
    setSaving(true);
    await supabase.from("drones").update({
      name: name.trim(),
      model: modelToSave,
      type,
      status,
      serial_number: serialNumber.trim() || null,
      notes: notes.trim() || null,
    }).eq("id", drone.id);
    router.push("/drones");
  }

  async function setInactive() {
    setDeleting(true);
    await supabase.from("drones").update({ status: "inactive" }).eq("id", drone.id);
    router.push("/drones");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-5">
          <div>
            <Label className="text-sm font-semibold mb-1 block">שם *</Label>
            <input
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              dir="rtl"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">מודל</Label>
            <div className="grid grid-cols-2 gap-2">
              {knownModels.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setModelKey(m.value as "avata" | "ivo" | "mavic3pro" | "air3" | "mini4" | "other")}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    modelKey === m.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {isOther && (
              <input
                className="mt-2 w-full rounded-xl border-2 border-blue-300 bg-blue-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="שם המודל..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                dir="rtl"
              />
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">סוג</Label>
            <div className="grid grid-cols-2 gap-2">
              {([["military", "🎖️ צהלי"], ["civilian", "🤝 תרומה"]] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    type === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">סטטוס</Label>
            <div className="grid grid-cols-3 gap-2">
              {([["active", "מבצעי"], ["maintenance", "תחזוקה"], ["inactive", "לא פעיל"]] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    status === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">מס׳ סריאלי</Label>
            <input
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="SN-..."
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              dir="ltr"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">הערות</Label>
            <textarea
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none resize-none"
              placeholder="הערות חופשיות על הרחפן..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              dir="rtl"
            />
          </div>

          <Button className="w-full" onClick={save} disabled={saving || !canSave}>
            {saving ? "שומר..." : "✓ שמור שינויים"}
          </Button>
        </CardContent>
      </Card>

      <button
        onClick={setInactive}
        disabled={deleting}
        className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-2"
      >
        {deleting ? "..." : "סמן כלא פעיל"}
      </button>
    </div>
  );
}
