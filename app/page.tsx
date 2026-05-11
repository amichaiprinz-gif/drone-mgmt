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
      supabase.from("drones").select("*").neq("status", "inactive"),
      supabase
        .from("flights")
        .select("*, drone:drones(name), pilot:pilots!flights_pilot_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("batteries").select("*"),
      supabase.from("pilots").select("*").eq("is_active", true),
    ]);

  const activeDrones = drones?.filter((d) => d.status === "active") ?? [];
  const maintenanceDrones = drones?.filter((d) => d.status === "maintenance") ?? [];
  const chargedBatteries = batteries?.filter((b) => b.status === "charged") ?? [];
  const pendingExam = pilots?.filter((p) => !p.exam_passed) ?? [];
  const qualifiedPilots = pilots?.filter((p) => p.exam_passed) ?? [];

  // Maintenance overdue — drones not inspected in 30+ days or never
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const overdueInspection = (drones ?? []).filter((d) => {
    if (!d.last_inspection_date) return true;
    return new Date(d.last_inspection_date) < thirtyDaysAgo;
  });

  // Ready to fly = has active drone + qualified pilot + charged battery
  const isReadyToFly =
    activeDrones.length > 0 && qualifiedPilots.length > 0 && chargedBatteries.length > 0;

  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מערך רחפנים</h1>
        <Link href="/flights/new">
          <Button size="sm">+ גיחה חדשה</Button>
        </Link>
      </div>

      {/* Ready to fly status */}
      <Card className={isReadyToFly ? "border-green-300 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="pt-4">
          <div dir="rtl" className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-sm ${isReadyToFly ? "text-green-800" : "text-red-700"}`}>
                {isReadyToFly ? "✅ מוכן לגיחה" : "❌ לא מוכן לגיחה"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeDrones.length} רחפן · {qualifiedPilots.length} מטיס כשיר · {chargedBatteries.length} סוללה טעונה
              </p>
            </div>
            <Link href="/flights/new">
              <Button size="sm" disabled={!isReadyToFly}>יצא לגיחה</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{activeDrones.length}</div>
            <div className="text-xs text-gray-500 mt-1">רחפנים מבצעיים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-green-600">{chargedBatteries.length}</div>
            <div className="text-xs text-gray-500 mt-1">סוללות טעונות</div>
            <div className="text-xs text-gray-400">מתוך {batteries?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{pilots?.length ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">מטיסים פעילים</div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency procedure quick access */}
      <Link href="/checklists/avata">
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-4 flex items-center justify-between active:scale-[0.99] transition-transform">
          <div dir="rtl">
            <p className="text-white font-bold">🔴 נוהל חירום מהיר</p>
            <p className="text-red-200 text-xs mt-0.5">גישה מיידית לצ׳קליסט חירום</p>
          </div>
          <span className="text-white/60 text-2xl">←</span>
        </div>
      </Link>

      {/* Maintenance overdue warning */}
      {overdueInspection.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-amber-800 mb-2" dir="rtl">
              🔧 בדיקה תקופתית נדרשת:
            </p>
            <div dir="rtl" className="flex flex-wrap gap-2">
              {overdueInspection.map((d) => (
                <Link key={d.id} href={`/drones/${d.id}/edit`}>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                    {d.name} {d.last_inspection_date ? `(${d.last_inspection_date})` : "(אף פעם)"}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance drones */}
      {maintenanceDrones.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-yellow-800 mb-1">🔧 בתחזוקה:</p>
            <div dir="rtl" className="flex flex-wrap gap-2">
              {maintenanceDrones.map((d) => (
                <span key={d.id} className="text-sm text-yellow-700">{d.name}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pilots pending exam */}
      {pendingExam.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-orange-800 mb-1" dir="rtl">⚠️ ממתינים למבחן הסמכה:</p>
            {pendingExam.map((p) => (
              <p key={p.id} className="text-sm text-orange-700" dir="rtl">{p.name}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent flights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">גיחות אחרונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {!flights?.length && (
            <p className="text-sm text-gray-400 text-center py-6">אין גיחות עדיין</p>
          )}
          {flights?.map((f) => (
            <div key={f.id} dir="rtl" className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div className="text-sm font-medium">{(f.drone as { name: string } | null)?.name ?? "—"}</div>
                <div className="text-xs text-gray-500">
                  {(f.pilot as { name: string } | null)?.name ?? "—"} · {f.flight_date}
                  {f.duration_minutes ? ` · ${f.duration_minutes} דק׳` : ""}
                </div>
              </div>
              <div dir="rtl" className="flex gap-1">
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
