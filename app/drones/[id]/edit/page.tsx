import { supabase } from "@/lib/supabase";
import { EditDroneForm } from "@/components/drones/EditDroneForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditDronePage({ params }: { params: { id: string } }) {
  const { data: drone } = await supabase
    .from("drones")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!drone) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/drones">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
        <h1 className="text-xl font-bold">עריכת רחפן</h1>
      </div>
      <EditDroneForm drone={drone} />
    </div>
  );
}
