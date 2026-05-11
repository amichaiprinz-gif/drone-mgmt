import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FlightsList } from "@/components/flights/FlightsList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FlightsPage() {
  const [{ data: flights }, { data: drones }, { data: pilots }] = await Promise.all([
    supabase
      .from("flights")
      .select(`
        *,
        drone:drones(name),
        pilot:pilots!flights_pilot_id_fkey(name),
        observer:pilots!flights_observer_id_fkey(name)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("drones").select("id, name").neq("status", "inactive").order("name"),
    supabase.from("pilots").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="space-y-4">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">לוג גיחות</h1>
        <Link href="/flights/new">
          <Button size="sm">+ גיחה</Button>
        </Link>
      </div>

      <FlightsList
        initialFlights={(flights ?? []) as Parameters<typeof FlightsList>[0]["initialFlights"]}
        drones={drones ?? []}
        pilots={pilots ?? []}
      />
    </div>
  );
}
