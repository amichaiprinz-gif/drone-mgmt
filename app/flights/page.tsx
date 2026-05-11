import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const missionLabels: Record<string, string> = {
  recon: "סיור", training: "אימון", emergency: "חירום", other: "אחר",
};

export default async function FlightsPage() {
  const { data: flights } = await supabase
    .from("flights")
    .select(`
      *,
      drone:drones(name),
      pilot:pilots!flights_pilot_id_fkey(name),
      observer:pilots!flights_observer_id_fkey(name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">לוג גיחות</h1>
        <Link href="/flights/new">
          <Button size="sm">+ גיחה</Button>
        </Link>
      </div>

      {!flights?.length && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">✈️</div>
          <p className="text-sm">אין גיחות עדיין</p>
          <Link href="/flights/new">
            <Button className="mt-3" size="sm">צור גיחה ראשונה</Button>
          </Link>
        </div>
      )}

      {flights?.map((f) => {
        const checklist = (f.checklist_completed as { checked?: boolean }[]) ?? [];
        const checked = checklist.filter((i) => i.checked).length;
        const hasIssues = !!f.issues;

        return (
          <Card key={f.id} className={hasIssues ? "border-orange-200" : ""}>
            <CardContent className="pt-4">
              <div dir="rtl" className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">
                    {(f.drone as { name: string } | null)?.name ?? "רחפן לא ידוע"}
                  </div>
                  <div className="text-xs text-gray-500">{f.flight_date}</div>
                </div>
                <div dir="rtl" className="flex gap-1 flex-wrap justify-end">
                  <Badge variant={f.flight_mode === "emergency" ? "destructive" : "secondary"}>
                    {f.flight_mode === "emergency" ? "חירום" : "רגיל"}
                  </Badge>
                  {f.mission_type && (
                    <Badge variant="outline" className="text-xs">
                      {missionLabels[f.mission_type] ?? f.mission_type}
                    </Badge>
                  )}
                </div>
              </div>

              <div dir="rtl" className="text-xs text-gray-500 space-y-0.5">
                <div className="flex flex-wrap gap-x-2">
                  <span>מטיס: {(f.pilot as { name: string } | null)?.name ?? "—"}</span>
                  {(f.observer as { name: string } | null)?.name && (
                    <span>· צופה: {(f.observer as { name: string }).name}</span>
                  )}
                  {f.duration_minutes && (
                    <span>· {f.duration_minutes} דק׳</span>
                  )}
                </div>
                {f.area && <div>אזור: {f.area}</div>}
                {checklist.length > 0 && (
                  <div className={checked === checklist.length ? "text-green-600" : ""}>
                    צ׳קליסט: {checked}/{checklist.length} {checked === checklist.length ? "✓" : ""}
                  </div>
                )}
                {f.notes && <div className="text-gray-400 italic">{f.notes}</div>}
                {hasIssues && (
                  <div className="text-orange-600 font-medium">⚠️ {f.issues}</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
