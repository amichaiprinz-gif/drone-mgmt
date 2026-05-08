import { supabase } from "@/lib/supabase";
import { BatteryGrid } from "@/components/batteries/BatteryGrid";

export const dynamic = "force-dynamic";

export default async function BatteriesPage() {
  const { data: batteries } = await supabase
    .from("batteries")
    .select("*")
    .order("label");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">סוללות</h1>
      <BatteryGrid batteries={batteries ?? []} />
    </div>
  );
}
