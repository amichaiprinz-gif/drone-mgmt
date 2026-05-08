"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Drone, Pilot, Procedure, ChecklistItem, MissionType, FlightMode } from "@/lib/types";

type Props = {
  drones: Pick<Drone, "id" | "name" | "model">[];
  pilots: Pick<Pilot, "id" | "name" | "certifications" | "exam_passed">[];
  procedures: Procedure[];
};

export function NewFlightWizard({ drones, pilots, procedures }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [flightMode, setFlightMode] = useState<FlightMode>("normal");
  const [selectedDrone, setSelectedDrone] = useState("");
  const [selectedPilot, setSelectedPilot] = useState("");
  const [selectedObserver, setSelectedObserver] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [area, setArea] = useState("");
  const [missionType, setMissionType] = useState<MissionType>("recon");
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState("");
  const [saving, setSaving] = useState(false);

  const drone = drones.find((d) => d.id === selectedDrone);
  const pilot = pilots.find((p) => p.id === selectedPilot);

  function loadChecklist(droneId: string, mode: FlightMode) {
    const d = drones.find((x) => x.id === droneId);
    if (!d) return;
    const procType = mode === "emergency" ? "preflight_emergency" : "preflight_normal";
    const proc = procedures.find((p) => p.drone_model === d.model && p.procedure_type === procType);
    setChecklistItems(proc ? proc.steps.map((s) => ({ ...s, checked: false })) : []);
  }

  function selectDroneAndMode(droneId: string, mode: FlightMode) {
    setSelectedDrone(droneId);
    loadChecklist(droneId, mode);
  }

  function toggleCheck(order: number) {
    setChecklistItems((items) =>
      items.map((i) => (i.order === order ? { ...i, checked: !i.checked } : i))
    );
  }

  async function save() {
    setSaving(true);
    await supabase.from("flights").insert({
      drone_id: selectedDrone || null,
      pilot_id: selectedPilot || null,
      observer_id: selectedObserver || null,
      flight_date: new Date().toISOString().split("T")[0],
      flight_mode: flightMode,
      mission_type: missionType,
      area: area || null,
      notes: notes || null,
      issues: issues || null,
      checklist_completed: checklistItems,
    });
    setSaving(false);
    router.push("/flights");
    router.refresh();
  }

  const checked = checklistItems.filter((i) => i.checked).length;
  const byCategory = checklistItems.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? "bg-blue-500" : "bg-gray-200"}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="pt-4 space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">מצב טיסה</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["normal", "emergency"] as FlightMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setFlightMode(m); if (selectedDrone) loadChecklist(selectedDrone, m); }}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      flightMode === m
                        ? m === "emergency" ? "border-red-500 bg-red-50 text-red-700" : "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {m === "normal" ? "🟢 רגיל" : "🔴 חירום"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">רחפן</Label>
              <div className="space-y-2">
                {drones.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => selectDroneAndMode(d.id, flightMode)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedDrone === d.id ? "border-blue-500 bg-blue-50 font-medium" : "border-gray-200"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">מטיס</Label>
              <div className="space-y-2">
                {pilots.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPilot(p.id)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedPilot === p.id ? "border-blue-500 bg-blue-50 font-medium" : "border-gray-200"
                    } ${!p.exam_passed ? "border-orange-200" : ""}`}
                  >
                    {p.name} {!p.exam_passed && <span className="text-orange-500 text-xs">⚠️ ללא מבחן</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">צופה (אופציונלי)</Label>
              <div className="space-y-2">
                {pilots.filter((p) => p.id !== selectedPilot).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedObserver((prev) => (prev === p.id ? "" : p.id))}
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedObserver === p.id ? "border-green-500 bg-green-50 font-medium" : "border-gray-200"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => setStep(2)} disabled={!selectedDrone || !selectedPilot}>
              הבא — צ׳קליסט
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{checked}/{checklistItems.length} פריטים</span>
              <span className="text-xs text-gray-500">{drone?.name} · {flightMode === "emergency" ? "חירום" : "רגיל"}</span>
            </div>

            {checklistItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">אין צ׳קליסט לרחפן זה</p>
            )}

            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat}</div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.order}
                      onClick={() => toggleCheck(item.order)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all active:scale-98 ${
                        item.checked ? "bg-green-50 border-green-400" : "border-gray-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.checked ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}>
                        {item.checked && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>חזרה</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>הבא — פרטי גיחה</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">סוג משימה</Label>
              <div className="grid grid-cols-2 gap-2">
                {([["recon","סיור"],["training","אימון"],["emergency","חירום"],["other","אחר"]] as [MissionType, string][]).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setMissionType(v)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      missionType === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1 block">אזור / מיקום</Label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="תיאור האזור..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                dir="rtl"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1 block">הערות</Label>
              <Textarea
                className="resize-none"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות כלליות..."
                dir="rtl"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1 block">בעיות / חריגות</Label>
              <Textarea
                className="resize-none border-orange-200 focus:border-orange-400"
                rows={2}
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="אם הייתה תקלה, תאר אותה..."
                dir="rtl"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <div>רחפן: <span className="font-medium text-gray-700">{drone?.name}</span></div>
              <div>מטיס: <span className="font-medium text-gray-700">{pilot?.name}</span></div>
              <div>צ׳קליסט: <span className="font-medium text-gray-700">{checked}/{checklistItems.length}</span></div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>חזרה</Button>
              <Button className="flex-1" onClick={save} disabled={saving}>
                {saving ? "שומר..." : "✓ שמור גיחה"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
