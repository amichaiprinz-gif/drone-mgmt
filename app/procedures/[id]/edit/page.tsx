import { supabase } from "@/lib/supabase";
import { EditProcedureForm } from "@/components/procedures/EditProcedureForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Procedure } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProcedurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: procedure } = await supabase
    .from("procedures")
    .select("*")
    .eq("id", id)
    .single();

  if (!procedure) notFound();

  return (
    <div>
      <div dir="rtl" className="flex items-center gap-3 mb-4">
        <Link href="/procedures">
          <Button variant="ghost" size="sm">חזרה ←</Button>
        </Link>
        <h1 className="text-xl font-bold">עריכת נוהל</h1>
      </div>
      <EditProcedureForm procedure={procedure as Procedure} />
    </div>
  );
}
