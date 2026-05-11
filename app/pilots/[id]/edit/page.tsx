import { supabase } from "@/lib/supabase";
import { EditPilotForm } from "@/components/pilots/EditPilotForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPilotPage({ params }: { params: { id: string } }) {
  const { data: pilot } = await supabase
    .from("pilots")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!pilot) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/pilots">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
        <h1 className="text-xl font-bold">עריכת מטיס</h1>
      </div>
      <EditPilotForm pilot={pilot} />
    </div>
  );
}
