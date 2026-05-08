"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Procedure } from "@/lib/types";

export function ProcedureCard({ procedure }: { procedure: Procedure }) {
  const [open, setOpen] = useState(false);

  const byCategory = procedure.steps.reduce<Record<string, typeof procedure.steps>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const isEmergency = procedure.procedure_type.includes("emergency");

  return (
    <Card className={isEmergency ? "border-red-200" : ""}>
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {isEmergency && <span className="text-red-500">🔴</span>}
            {procedure.title}
          </CardTitle>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
        <div className="text-xs text-gray-400">{procedure.steps.length} פריטים</div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 pt-0">
          {Object.entries(byCategory).map(([cat, steps]) => (
            <div key={cat}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat}</div>
              <ol className="space-y-1.5">
                {steps.map((s) => (
                  <li key={s.order} className="text-sm flex gap-2 items-start">
                    <span className="text-gray-300 w-5 shrink-0 text-left">{s.order}.</span>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
