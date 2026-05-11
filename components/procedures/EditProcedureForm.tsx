"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { Procedure, ProcedureStep, ProcedureType } from "@/lib/types";

const procedureTypes: { value: ProcedureType; label: string }[] = [
  { value: "preflight_normal",    label: "טרום-טיסה רגיל" },
  { value: "preflight_emergency", label: "טרום-טיסה חירום" },
  { value: "postflight",          label: "אחרי הטיסה" },
  { value: "landing",             label: "נחיתה" },
];

const droneModelOptions = [
  { value: "",      label: "כללי (כל הרחפנים)" },
  { value: "avata", label: "DJI Avata" },
  { value: "ivo",   label: "IVO (איבו)" },
];

const categoryOptions = ["בטיחות", "ציוד", "תקשורת", "עוגנים", "מגלה", "הגנה", "סיום", "כללי"];

type StepDraft = { category: string; text: string };

function toStepsWithOrder(drafts: StepDraft[]): ProcedureStep[] {
  return drafts
    .filter((s) => s.text.trim())
    .map((s, i) => ({ order: i + 1, category: s.category || "כללי", text: s.text.trim() }));
}

export function EditProcedureForm({ procedure }: { procedure: Procedure | null }) {
  const isNew = !procedure;
  const router = useRouter();

  const [title, setTitle]         = useState(procedure?.title ?? "");
  const [procType, setProcType]   = useState<ProcedureType>(procedure?.procedure_type ?? "preflight_normal");
  const [droneModel, setDroneModel] = useState(procedure?.drone_model ?? "");
  const [isActive, setIsActive]   = useState(procedure?.is_active ?? true);
  const [steps, setSteps]         = useState<StepDraft[]>(
    procedure?.steps.map((s) => ({ category: s.category, text: s.text })) ?? []
  );
  const [saving, setSaving]       = useState(false);

  function addStep() {
    const lastCat = steps.length > 0 ? steps[steps.length - 1].category : "כללי";
    setSteps((s) => [...s, { category: lastCat, text: "" }]);
  }

  function removeStep(idx: number) {
    setSteps((s) => s.filter((_, i) => i !== idx));
  }

  function updateStep(idx: number, field: keyof StepDraft, val: string) {
    setSteps((s) => s.map((step, i) => (i === idx ? { ...step, [field]: val } : step)));
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      procedure_type: procType,
      drone_model: droneModel || null,
      is_active: isActive,
      steps: toStepsWithOrder(steps),
    };
    if (isNew) {
      await supabase.from("procedures").insert(payload);
    } else {
      await supabase.from("procedures").update(payload).eq("id", procedure!.id);
    }
    setSaving(false);
    router.push("/procedures");
  }

  async function deleteProcedure() {
    if (!procedure || !confirm("למחוק נוהל זה?")) return;
    await supabase.from("procedures").delete().eq("id", procedure.id);
    router.push("/procedures");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-5">
          <div>
            <Label className="text-sm font-semibold mb-1 block">כותרת</Label>
            <input
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              dir="rtl"
              autoFocus
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">סוג נוהל</Label>
            <div className="grid grid-cols-2 gap-2">
              {procedureTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setProcType(t.value)}
                  className={`py-2 rounded-xl border-2 text-sm transition-all ${
                    procType === t.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">רחפן</Label>
            <div className="space-y-1.5">
              {droneModelOptions.map((m) => (
                <button
                  key={m.value}
                  dir="rtl"
                  onClick={() => setDroneModel(m.value)}
                  className={`w-full py-2 rounded-xl border-2 text-sm text-right px-3 transition-all ${
                    droneModel === m.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div dir="rtl" className="flex items-center gap-3">
            <button
              onClick={() => setIsActive((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-all ${isActive ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  isActive ? "right-1" : "left-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">{isActive ? "נוהל פעיל" : "נוהל לא פעיל"}</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <div dir="rtl" className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">
            שלבים ({steps.filter((s) => s.text.trim()).length})
          </h2>
          <button
            onClick={addStep}
            className="flex items-center gap-1 text-xs text-blue-600 font-medium"
          >
            <Plus size={14} /> הוסף שלב
          </button>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="text-gray-300 text-xs pt-3 w-5 text-center shrink-0" dir="ltr">
                {idx + 1}.
              </span>
              <div className="flex-1 space-y-1">
                <input
                  list="proc-categories"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 focus:border-blue-400 focus:outline-none"
                  placeholder="קטגוריה..."
                  value={step.category}
                  onChange={(e) => updateStep(idx, "category", e.target.value)}
                  dir="rtl"
                />
                <input
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="טקסט השלב..."
                  value={step.text}
                  onChange={(e) => updateStep(idx, "text", e.target.value)}
                  dir="rtl"
                />
              </div>
              <button
                onClick={() => removeStep(idx)}
                className="text-gray-300 hover:text-red-400 transition-colors mt-2.5 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <datalist id="proc-categories">
          {categoryOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {steps.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            אין שלבים. לחץ "הוסף שלב" להוספה.
          </p>
        )}

        <button
          onClick={addStep}
          className="mt-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={14} /> הוסף שלב
        </button>
      </div>

      <Button className="w-full" onClick={save} disabled={saving || !title.trim()}>
        {saving ? "שומר..." : isNew ? "✓ צור נוהל" : "✓ שמור שינויים"}
      </Button>

      {!isNew && (
        <button
          onClick={deleteProcedure}
          className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-2"
        >
          מחק נוהל
        </button>
      )}
    </div>
  );
}
