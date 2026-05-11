import { supabase } from "@/lib/supabase";
import { NewFlightWizard } from "@/components/flights/NewFlightWizard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewFlightPage() {
  const [{ data: drones }, { data: pilots }, { data: procedures }, { data: batteries }] =
    await Promise.all([
      supabase.from("drones").select("id, name, model").eq("status", "active").order("name"),
      supabase.from("pilots").select("id, name, certifications, exam_passed").eq("is_active", true).order("name"),
      supabase.from("procedures").select("*").eq("is_active", true),
      supabase.from("batteries").select("id, label, drone_model, status").order("label"),
    ]);

  return (
    <div>
      <div dir="rtl" className="flex items-center gap-3 mb-4">
        <Link href="/flights">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
        <h1 className="text-xl font-bold">גיחה חדשה</h1>
      </div>
      <NewFlightWizard
        drones={drones ?? []}
        pilots={pilots ?? []}
        procedures={procedures ?? []}
        batteries={batteries ?? []}
      />
    </div>
  );
}
