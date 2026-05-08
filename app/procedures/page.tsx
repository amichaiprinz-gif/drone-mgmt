import { supabase } from "@/lib/supabase";
import { ProcedureCard } from "@/components/procedures/ProcedureCard";

export const dynamic = "force-dynamic";

export default async function ProceduresPage() {
  const { data: procedures } = await supabase
    .from("procedures")
    .select("*")
    .eq("is_active", true)
    .order("drone_model")
    .order("procedure_type");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">נהלי הטסה</h1>
      {procedures?.map((p) => (
        <ProcedureCard key={p.id} procedure={p} />
      ))}
    </div>
  );
}
