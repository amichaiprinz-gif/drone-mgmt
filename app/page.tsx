import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const missionLabels: Record<string, string> = {
  recon: "סיור", training: "אימון", emergency: "חירום", other: "אחר",
};

export default async function DashboardPage() {
  const [{ data: drones }, { data: flights }, { data: batteries }, { data: pilots }] =
    await Promise.all([
      supabase.from("drones").select("*").eq("status", "active"),
      supabase
        .from("flights")
        .select("*, drone:drones(name), pilot:pilots!flights_pilot_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("batteries").select("status"),
      supabase.from("pilots").select("*").eq("is_active", true),
    ]);

  const chargedCount = batteries?.filter((b) => b.status === "charged").length ?? 0;
  const totalBatteries = batteries?.length ?? 0;
  const pendingExam = pilots?.filter((p) => !p.exam_passed) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מערך רחפנים</h1>
        <Link href="/flights/new">
          <Button size="sm">+ גיחה חדשה</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{drones?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">רחפנים פעילים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-green-600">{chargedCount}</div>
            <div className="text-xs text-gray-500 mt-1">סוללות טעונות</div>
            <div className="text-xs text-gray-400">מתוך {totalBatteries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{pilots?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">מטיסים פעילים</div>
          </CardContent>
        </Card>
      </div>

      {pendingExam.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-orange-800 mb-1">⚠️ ממתינים למבחן הסמכה:</p>
            {pendingExam.map((p) => (
              <p key={p.id} className="text-sm text-orange-700">{p.name}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">גיחות אחרונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {!flights?.length && (
            <p className="text-sm text-gray-400 text-center py-6">אין גיחות עדיין</p>
          )}
          {flights?.map((f) => (
            <div key={f.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div className="text-sm font-medium">{(f.drone as { name: string } | null)?.name ?? "—"}</div>
                <div className="text-xs text-gray-500">
                  {(f.pilot as { name: string } | null)?.name ?? "—"} · {f.flight_date}
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant={f.flight_mode === "emergency" ? "destructive" : "secondary"}>
                  {f.flight_mode === "emergency" ? "חירום" : "רגיל"}
                </Badge>
                {f.mission_type && (
                  <Badge variant="outline" className="text-xs">{missionLabels[f.mission_type]}</Badge>
                )}
              </div>
            </div>
          ))}
          <Link href="/flights">
            <Button variant="ghost" size="sm" className="w-full mt-2">כל הגיחות →</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
