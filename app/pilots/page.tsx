import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PilotNoteEditor } from "@/components/pilots/PilotNoteEditor";
import Link from "next/link";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

const certLabels: Record<string, string> = {
  avata: "אווטה", ivo: "איבו", matrice30: "מטריס 30",
  mavic3pro: "מאביק 3 פרו", air3: "Air 3", mini4: "Mini 4",
};

export default async function PilotsPage() {
  const [{ data: pilots }, { data: pilotFlights }] = await Promise.all([
    supabase.from("pilots").select("*").eq("is_active", true).order("name"),
    supabase.from("flights").select("pilot_id").not("pilot_id", "is", null),
  ]);

  const flightCounts = (pilotFlights ?? []).reduce<Record<string, number>>((acc, f) => {
    if (f.pilot_id) acc[f.pilot_id] = (acc[f.pilot_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">מטיסים</h1>
        <Link href="/pilots/new">
          <Button size="sm">+ מטיס</Button>
        </Link>
      </div>

      {pilots?.map((p) => {
        const totalFlights = flightCounts[p.id] ?? 0;
        return (
          <Card key={p.id}>
            <CardContent className="pt-4">
              <div dir="rtl" className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  {p.role && <div className="text-xs text-gray-500">{p.role}</div>}
                  <div className="text-xs text-gray-400 mt-0.5">
                    {totalFlights} גיחות
                    {p.last_flight_date ? ` · אחרונה: ${p.last_flight_date}` : ""}
                  </div>
                </div>
                <div dir="rtl" className="flex items-center gap-2">
                  {!p.exam_passed && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs shrink-0">
                      ממתין למבחן
                    </Badge>
                  )}
                  <Link href={`/pilots/${p.id}/edit`}>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors p-1">
                      <Pencil size={14} />
                    </button>
                  </Link>
                </div>
              </div>

              <div dir="rtl" className="flex flex-wrap gap-1 mt-2">
                {(p.certifications as string[]).map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {certLabels[c] ?? c}
                  </Badge>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-3 pt-2">
                <PilotNoteEditor pilotId={p.id} initialNotes={p.notes} />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {!pilots?.length && (
        <div className="text-center py-12 text-gray-400 text-sm">
          אין מטיסים עדיין
        </div>
      )}
    </div>
  );
}
