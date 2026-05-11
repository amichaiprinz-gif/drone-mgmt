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
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">סוללות</h1>
      </div>
      <BatteryGrid batteries={batteries ?? []} />
    </div>
  );
}
