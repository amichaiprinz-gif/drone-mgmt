"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import type { Procedure } from "@/lib/types";

const typeLabels: Record<string, { label: string; color: string }> = {
  preflight_normal:    { label: "טרום-טיסה רגיל",  color: "text-blue-600" },
  preflight_emergency: { label: "טרום-טיסה חירום", color: "text-red-600" },
  postflight:          { label: "אחרי הטיסה",       color: "text-gray-500" },
  landing:             { label: "נחיתה",             color: "text-yellow-600" },
};

export function ProcedureCard({ procedure }: { procedure: Procedure }) {
  const [open, setOpen] = useState(false);

  const byCategory = procedure.steps.reduce<Record<string, typeof procedure.steps>>(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {}
  );

  const isEmergency = procedure.procedure_type.includes("emergency");
  const typeInfo = typeLabels[procedure.procedure_type];

  return (
    <Card className={isEmergency ? "border-red-200" : ""}>
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div dir="rtl" className="flex items-center justify-between">
          <div dir="rtl" className="flex items-center gap-2 font-semibold text-sm flex-1">
            {isEmergency && <span className="text-red-500">🔴</span>}
            <span>{procedure.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/procedures/${procedure.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-blue-500 transition-colors p-1"
            >
              <Pencil size={14} />
            </Link>
            {open
              ? <ChevronUp size={16} className="text-gray-400" />
              : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>
        <div dir="rtl" className="flex gap-2 text-xs mt-0.5">
          {typeInfo && <span className={typeInfo.color}>{typeInfo.label}</span>}
          <span className="text-gray-400">{procedure.steps.length} פריטים</span>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          {Object.entries(byCategory).map(([cat, steps]) => (
            <div key={cat}>
              <p className="text-xs font-bold text-gray-400 tracking-wide mb-2 text-right">
                {cat}
              </p>
              <ol className="space-y-2">
                {steps.map((s) => (
                  <li
                    key={s.order}
                    dir="rtl"
                    className="text-sm flex gap-2 items-start"
                  >
                    <span className="text-gray-300 shrink-0 w-5 text-center" dir="ltr">
                      {s.order}.
                    </span>
                    <span className="flex-1 leading-snug">{s.text}</span>
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
