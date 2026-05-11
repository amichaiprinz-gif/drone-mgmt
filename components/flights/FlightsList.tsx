"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown } from "lucide-react";
import Link from "next/link";

type FlightRow = {
  id: string;
  drone_id: string | null;
  pilot_id: string | null;
  flight_date: string;
  duration_minutes: number | null;
  flight_mode: string;
  mission_type: string | null;
  area: string | null;
  notes: string | null;
  issues: string | null;
  checklist_completed: { checked?: boolean }[];
  drone: { name: string } | null;
  pilot: { name: string } | null;
  observer: { name: string } | null;
};

const missionLabels: Record<string, string> = {
  recon: "סיור", training: "אימון", emergency: "חירום", other: "אחר",
};

export function FlightsList({
  initialFlights,
  drones,
  pilots,
}: {
  initialFlights: FlightRow[];
  drones: { id: string; name: string }[];
  pilots: { id: string; name: string }[];
}) {
  const [flights, setFlights] = useState(initialFlights);
  const [filterDrone, setFilterDrone] = useState("");
  const [filterPilot, setFilterPilot] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteFlight(id: string) {
    if (!confirm("למחוק גיחה זו?")) return;
    setDeleting(id);
    await supabase.from("flights").delete().eq("id", id);
    setFlights((prev) => prev.filter((f) => f.id !== id));
    setDeleting(null);
  }

  let visible = flights;
  if (filterDrone) visible = visible.filter((f) => f.drone_id === filterDrone);
  if (filterPilot) visible = visible.filter((f) => f.pilot_id === filterPilot);
  if (sortAsc) visible = [...visible].reverse();

  const hasFilter = !!(filterDrone || filterPilot);

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div dir="rtl" className="flex flex-wrap gap-2">
        <select
          value={filterDrone}
          onChange={(e) => setFilterDrone(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-400 focus:outline-none"
        >
          <option value="">כל הרחפנים</option>
          {drones.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filterPilot}
          onChange={(e) => setFilterPilot(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-400 focus:outline-none"
        >
          <option value="">כל המטיסים</option>
          {pilots.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button
          onClick={() => setSortAsc((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-blue-300 transition-colors shrink-0"
        >
          <ArrowUpDown size={14} />
          {sortAsc ? "ישן→חדש" : "חדש→ישן"}
        </button>

        {hasFilter && (
          <button
            onClick={() => { setFilterDrone(""); setFilterPilot(""); }}
            className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      {hasFilter && (
        <p className="text-xs text-gray-400 text-right">
          מציג {visible.length} מתוך {flights.length} גיחות
        </p>
      )}

      {visible.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">✈️</div>
          <p className="text-sm">{hasFilter ? "אין גיחות לפי הסינון" : "אין גיחות עדיין"}</p>
          {!hasFilter && (
            <Link href="/flights/new">
              <Button className="mt-3" size="sm">צור גיחה ראשונה</Button>
            </Link>
          )}
        </div>
      )}

      {visible.map((f) => {
        const checklist = f.checklist_completed ?? [];
        const checked = checklist.filter((i) => i.checked).length;
        const hasIssues = !!f.issues;

        return (
          <Card key={f.id} className={hasIssues ? "border-orange-200" : ""}>
            <CardContent className="pt-4">
              <div dir="rtl" className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">
                    {f.drone?.name ?? "רחפן לא ידוע"}
                  </div>
                  <div className="text-xs text-gray-500">{f.flight_date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div dir="rtl" className="flex gap-1 flex-wrap">
                    <Badge variant={f.flight_mode === "emergency" ? "destructive" : "secondary"}>
                      {f.flight_mode === "emergency" ? "חירום" : "רגיל"}
                    </Badge>
                    {f.mission_type && (
                      <Badge variant="outline" className="text-xs">
                        {missionLabels[f.mission_type] ?? f.mission_type}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFlight(f.id)}
                    disabled={deleting === f.id}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0"
                    title="מחק גיחה"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div dir="rtl" className="text-xs text-gray-500 space-y-0.5">
                <div className="flex flex-wrap gap-x-2">
                  <span>מטיס: {f.pilot?.name ?? "—"}</span>
                  {f.observer?.name && <span>· צופה: {f.observer.name}</span>}
                  {f.duration_minutes && <span>· {f.duration_minutes} דק׳</span>}
                </div>
                {f.area && <div>אזור: {f.area}</div>}
                {checklist.length > 0 && (
                  <div className={checked === checklist.length ? "text-green-600" : ""}>
                    צ׳קליסט: {checked}/{checklist.length}{checked === checklist.length ? " ✓" : ""}
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
