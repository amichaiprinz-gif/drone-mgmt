import { supabase } from "@/lib/supabase";
import { ProcedureCard } from "@/components/procedures/ProcedureCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const typeOrder: Record<string, number> = {
  preflight_normal: 0,
  preflight_emergency: 1,
  postflight: 2,
};

const droneLabels: Record<string, string> = {
  avata: "DJI Avata",
  ivo: "IVO (איבו)",
};

export default async function ProceduresPage() {
  const { data: procedures } = await supabase
    .from("procedures")
    .select("*")
    .eq("is_active", true)
    .order("drone_model")
    .order("procedure_type");

  const grouped = (procedures ?? []).reduce<Record<string, typeof procedures>>((acc, p) => {
    if (!acc[p.drone_model]) acc[p.drone_model] = [];
    acc[p.drone_model]!.push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">נהלי הטסה</h1>
        <Link href="/procedures/new">
          <Button size="sm">+ נוהל</Button>
        </Link>
      </div>

      {Object.entries(grouped).map(([model, procs]) => (
        <section key={model}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {droneLabels[model] ?? model}
          </h2>
          <div className="space-y-2">
            {[...procs!]
              .sort((a, b) => (typeOrder[a.procedure_type] ?? 9) - (typeOrder[b.procedure_type] ?? 9))
              .map((p) => (
                <ProcedureCard key={p.id} procedure={p} />
              ))}
          </div>
        </section>
      ))}

      {!procedures?.length && (
        <p className="text-sm text-gray-400 text-center py-12">אין נהלים</p>
      )}
    </div>
  );
}
