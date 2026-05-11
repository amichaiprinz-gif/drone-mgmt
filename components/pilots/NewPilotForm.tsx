"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const droneOptions = [
  { value: "avata",    label: "DJI Avata" },
  { value: "ivo",      label: "IVO (איבו)" },
  { value: "mavic3pro",label: "Mavic 3 Pro" },
  { value: "air3",     label: "Air 3" },
  { value: "mini4",    label: "Mini 4" },
];

export function NewPilotForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const [examPassed, setExamPassed] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleCert(value: string) {
    setCerts((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("pilots").insert({
      name: name.trim(),
      role: role.trim() || null,
      certifications: certs,
      exam_passed: examPassed,
      is_active: true,
    });
    router.push("/pilots");
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-5">
        <div>
          <Label className="text-sm font-semibold mb-1 block">שם *</Label>
          <input
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir="rtl"
            autoFocus
          />
        </div>

        <div>
          <Label className="text-sm font-semibold mb-1 block">תפקיד</Label>
          <input
            className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            placeholder={'מטיס / אחמ"ש / מ"פ...'}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            dir="rtl"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">הסמכות (ניתן לבחור כמה)</Label>
          <div className="grid grid-cols-2 gap-2">
            {droneOptions.map((d) => (
              <button
                key={d.value}
                onClick={() => toggleCert(d.value)}
                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  certs.includes(d.value)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {certs.includes(d.value) && <span className="ml-1">✓</span>}
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">מבחן</Label>
          <div className="grid grid-cols-2 gap-2">
            {([true, false] as const).map((v) => (
              <button
                key={String(v)}
                onClick={() => setExamPassed(v)}
                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  examPassed === v
                    ? v ? "border-green-500 bg-green-50 text-green-700" : "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {v ? "✓ עבר מבחן" : "⏳ ממתין למבחן"}
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={save} disabled={saving || !name.trim()}>
          {saving ? "שומר..." : "✓ הוסף מטיס"}
        </Button>
      </CardContent>
    </Card>
  );
}
