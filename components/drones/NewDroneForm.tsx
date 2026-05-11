"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DroneStatus } from "@/lib/types";

const knownModels = [
  { value: "avata",     label: "DJI Avata" },
  { value: "ivo",       label: "IVO (איבו)" },
  { value: "mavic3pro", label: "Mavic 3 Pro" },
  { value: "air3",      label: "Air 3" },
  { value: "mini4",     label: "Mini 4" },
  { value: "other",     label: "אחר..." },
];

export function NewDroneForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [modelKey, setModelKey] = useState("avata");
  const [customModel, setCustomModel] = useState("");
  const [type, setType] = useState<"military" | "civilian">("military");
  const [status, setStatus] = useState<DroneStatus>("active");
  const [serialNumber, setSerialNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const isOther = modelKey === "other";
  const modelToSave = isOther ? (customModel.trim() || "other") : modelKey;
  const canSave = !!name.trim() && (!isOther || !!customModel.trim());

  async function save() {
    if (!canSave) return;
    setSaving(true);
    await supabase.from("drones").insert({
      name: name.trim(),
      model: modelToSave,
      type,
      status,
      serial_number: serialNumber.trim() || null,
    });
    router.push("/drones");
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-5">
        <div>
          <Label className="text-sm font-semibold mb-1 block">שם *</Label>
          <input
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="לדוגמה: avata 3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir="rtl"
            autoFocus
          />
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">מודל</Label>
          <div className="grid grid-cols-2 gap-2">
            {knownModels.map((m) => (
              <button
                key={m.value}
                onClick={() => setModelKey(m.value)}
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
              placeholder="הקלד שם מודל..."
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              dir="rtl"
              autoFocus
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
          <Label className="text-sm font-semibold mb-1 block">מס׳ סריאלי (אופציונלי)</Label>
          <input
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="SN-..."
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            dir="ltr"
          />
        </div>

        <Button className="w-full" onClick={save} disabled={saving || !canSave}>
          {saving ? "שומר..." : "✓ הוסף רחפן"}
        </Button>
      </CardContent>
    </Card>
  );
}
