"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Drone, Pilot, Procedure, ChecklistItem, MissionType, FlightMode } from "@/lib/types";

type Battery = { id: string; label: string; drone_model: string; status: string };

type Props = {
  drones: Pick<Drone, "id" | "name" | "model">[];
  pilots: Pick<Pilot, "id" | "name" | "certifications" | "exam_passed">[];
  procedures: Procedure[];
  batteries: Battery[];
};

function buildChecklist(procs: Procedure[]): ChecklistItem[] {
  let order = 1;
  return procs.flatMap((proc) =>
    [...proc.steps]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ order: order++, category: s.category, text: s.text, checked: false }))
  );
}

function getMatchingProcs(procedures: Procedure[], model: string, type: string): Procedure[] {
  const specific = procedures.filter((p) => p.drone_model === model && p.procedure_type === type);
  if (specific.length > 0) return specific;
  return procedures.filter((p) => (!p.drone_model || p.drone_model === "") && p.procedure_type === type);
}

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function ChecklistSection({ items, toggle }: { items: ChecklistItem[]; toggle: (o: number) => void }) {
  const byCategory = items.reduce<Record<string, ChecklistItem[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {});
  const checked = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex items-center justify-between text-sm">
        <span className="font-semibold">{checked}/{items.length} פריטים</span>
        {items.length > 0 && checked === items.length && (
          <span className="text-green-600 font-semibold text-xs">✓ הושלם</span>
        )}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">אין פריטים</p>
      )}
      {Object.entries(byCategory).map(([cat, catItems]) => (
        <div key={cat}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2" dir="rtl">{cat}</div>
          <div className="space-y-2">
            {catItems.map((item) => (
              <button
                key={item.order}
                dir="rtl"
                onClick={() => toggle(item.order)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-98 ${
                  item.checked ? "bg-green-50 border-green-400" : "border-gray-200"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.checked ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {item.checked && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="text-sm flex-1 text-right">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewFlightWizard({ drones, pilots, procedures, batteries }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1 — setup
  const [flightMode, setFlightMode] = useState<FlightMode>("normal");
  const [selectedDrone, setSelectedDrone] = useState("");
  const [selectedPilot, setSelectedPilot] = useState("");
  const [selectedObserver, setSelectedObserver] = useState("");
  const [selectedBattery, setSelectedBattery] = useState("");

  // Step 2 — preflight checklist
  const [preflightItems, setPreflightItems] = useState<ChecklistItem[]>([]);

  // Step 3 — timer
  const [timerState, setTimerState] = useState<"idle" | "running" | "stopped">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 4 — mission details
  const [missionType, setMissionType] = useState<MissionType>("recon");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState("");

  // Step 5 — postflight
  const [postflightItems, setPostflightItems] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);

  const drone = drones.find((d) => d.id === selectedDrone);
  const pilot = pilots.find((p) => p.id === selectedPilot);
  const droneBatteries = batteries.filter(
    (b) => b.drone_model === drone?.model
  );
  const chargedCount = droneBatteries.filter((b) => b.status === "charged").length;

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState]);

  function loadChecklists(droneId: string, mode: FlightMode) {
    const d = drones.find((x) => x.id === droneId);
    if (!d) return;
    const procType = mode === "emergency" ? "preflight_emergency" : "preflight_normal";
    setPreflightItems(buildChecklist(getMatchingProcs(procedures, d.model, procType)));
    setPostflightItems(buildChecklist(getMatchingProcs(procedures, d.model, "postflight")));
  }

  function selectDrone(droneId: string) {
    setSelectedDrone(droneId);
    setSelectedBattery("");
    loadChecklists(droneId, flightMode);
  }

  function changeMode(mode: FlightMode) {
    setFlightMode(mode);
    if (selectedDrone) loadChecklists(selectedDrone, mode);
  }

  function startTimer() {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    setStartTime(timeStr);
    setTimerState("running");
  }

  function stopTimer() {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    setEndTime(timeStr);
    setTimerState("stopped");
  }

  async function save() {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    const durationMinutes = elapsed > 0 ? Math.round(elapsed / 60) : null;

    await supabase.from("flights").insert({
      drone_id: selectedDrone || null,
      pilot_id: selectedPilot || null,
      observer_id: selectedObserver || null,
      flight_date: today,
      flight_mode: flightMode,
      mission_type: missionType,
      area: area || null,
      notes: notes || null,
      issues: issues || null,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      checklist_completed: [...preflightItems, ...postflightItems],
    });

    if (selectedPilot) {
      await supabase.from("pilots").update({ last_flight_date: today }).eq("id", selectedPilot);
    }
    if (selectedBattery) {
      await supabase.from("batteries").update({ status: "empty" }).eq("id", selectedBattery);
    }

    setSaving(false);
    router.push("/flights");
    router.refresh();
  }

  const preChecked = preflightItems.filter((i) => i.checked).length;
  const postChecked = postflightItems.filter((i) => i.checked).length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div dir="rtl" className="flex gap-1 mb-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">שלב {step} מתוך {TOTAL_STEPS}</p>

      {/* ── Step 1: Setup ── */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-4 space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">מצב טיסה</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["normal", "emergency"] as FlightMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => changeMode(m)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      flightMode === m
                        ? m === "emergency"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-blue-500 bg-blue-50 text-blue-700"
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
                    onClick={() => selectDrone(d.id)}
                    dir="rtl"
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedDrone === d.id
                        ? "border-blue-500 bg-blue-50 font-medium"
                        : "border-gray-200"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery selection — shown after drone selected */}
            {selectedDrone && (
              <div>
                <div dir="rtl" className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">סוללה</Label>
                  <span className={`text-xs font-medium ${chargedCount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {chargedCount} טעונות
                  </span>
                </div>
                <div className="space-y-2">
                  {droneBatteries.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">אין סוללות רשומות למודל זה</p>
                  )}
                  {droneBatteries.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBattery((prev) => prev === b.id ? "" : b.id)}
                      dir="rtl"
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                        selectedBattery === b.id
                          ? "border-green-500 bg-green-50 font-medium"
                          : "border-gray-200"
                      }`}
                    >
                      <span>{b.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === "charged" ? "bg-green-100 text-green-700" :
                        b.status === "empty" ? "bg-gray-100 text-gray-500" :
                        b.status === "storage" ? "bg-blue-100 text-blue-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {b.status === "charged" ? "טעון" :
                         b.status === "empty" ? "ריק" :
                         b.status === "storage" ? "אחסון" : "פגום"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold mb-2 block">מטיס</Label>
              <div className="space-y-2">
                {pilots.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPilot(p.id)}
                    dir="rtl"
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedPilot === p.id
                        ? "border-blue-500 bg-blue-50 font-medium"
                        : !p.exam_passed
                        ? "border-orange-200"
                        : "border-gray-200"
                    }`}
                  >
                    {p.name}{" "}
                    {!p.exam_passed && <span className="text-orange-500 text-xs">⚠️ ללא מבחן</span>}
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
                    onClick={() => setSelectedObserver((prev) => prev === p.id ? "" : p.id)}
                    dir="rtl"
                    className={`w-full text-right px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                      selectedObserver === p.id
                        ? "border-green-500 bg-green-50 font-medium"
                        : "border-gray-200"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => setStep(2)} disabled={!selectedDrone || !selectedPilot}>
              הבא — צ׳קליסט טרום הטסה
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Preflight checklist ── */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="text-xs text-gray-500 text-center" dir="rtl">
              {drone?.name} · {flightMode === "emergency" ? "חירום" : "רגיל"}
            </div>
            <ChecklistSection
              items={preflightItems}
              toggle={(o) => setPreflightItems((items) =>
                items.map((i) => (i.order === o ? { ...i, checked: !i.checked } : i))
              )}
            />
            <div dir="rtl" className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>חזרה</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>הבא — המראה</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Flight timer ── */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-4 space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">{drone?.name} · {pilot?.name}</p>
              <p className="text-4xl font-mono font-bold tracking-widest text-gray-800">
                {formatTime(elapsed)}
              </p>
              <p className="text-xs text-gray-400">
                {timerState === "idle" && "לחץ התחל טיסה להפעלת שעון"}
                {timerState === "running" && "⏱ טיסה בביצוע"}
                {timerState === "stopped" && `✓ נחיתה · ${Math.round(elapsed / 60)} דקות`}
              </p>
            </div>

            {timerState === "idle" && (
              <button
                onClick={startTimer}
                className="w-full py-5 rounded-2xl bg-green-500 text-white text-lg font-bold shadow-lg active:scale-95 transition-transform"
              >
                🛫 התחל טיסה
              </button>
            )}

            {timerState === "running" && (
              <button
                onClick={stopTimer}
                className="w-full py-5 rounded-2xl bg-red-500 text-white text-lg font-bold shadow-lg active:scale-95 transition-transform"
              >
                🛬 נחיתה
              </button>
            )}

            {startTime && (
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1" dir="rtl">
                {startTime && <div>המראה: <span className="font-medium text-gray-700">{startTime}</span></div>}
                {endTime && <div>נחיתה: <span className="font-medium text-gray-700">{endTime}</span></div>}
              </div>
            )}

            <div dir="rtl" className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>חזרה</Button>
              <Button
                className="flex-1"
                variant={timerState === "running" ? "outline" : "default"}
                onClick={() => setStep(4)}
                disabled={timerState === "running"}
              >
                {timerState === "idle" ? "דלג על טיימר" : "הבא — פרטי גיחה"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Mission details ── */}
      {step === 4 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">סוג משימה</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [["recon", "סיור"], ["training", "אימון"], ["emergency", "חירום"], ["other", "אחר"]] as [MissionType, string][]
                ).map(([v, l]) => (
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

            <div dir="rtl" className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>חזרה</Button>
              <Button className="flex-1" onClick={() => setStep(5)}>הבא — בדיקות לאחר הטסה</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: Postflight + save ── */}
      {step === 5 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="text-xs text-gray-500 text-center">בדיקות לאחר הטסה</div>
            <ChecklistSection
              items={postflightItems}
              toggle={(o) => setPostflightItems((items) =>
                items.map((i) => (i.order === o ? { ...i, checked: !i.checked } : i))
              )}
            />

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1" dir="rtl">
              <div>רחפן: <span className="font-medium text-gray-700">{drone?.name}</span></div>
              <div>מטיס: <span className="font-medium text-gray-700">{pilot?.name}</span></div>
              {elapsed > 0 && (
                <div>זמן טיסה: <span className="font-medium text-gray-700">{Math.round(elapsed / 60)} דקות</span></div>
              )}
              {selectedBattery && (
                <div>סוללה: <span className="font-medium text-gray-700">
                  {batteries.find(b => b.id === selectedBattery)?.label} → תסומן ריקה
                </span></div>
              )}
              <div>טרום: <span className="font-medium text-gray-700">{preChecked}/{preflightItems.length}</span></div>
              <div>אחרי: <span className="font-medium text-gray-700">{postChecked}/{postflightItems.length}</span></div>
            </div>

            <div dir="rtl" className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>חזרה</Button>
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
