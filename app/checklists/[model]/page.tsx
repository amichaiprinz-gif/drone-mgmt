import { supabase } from "@/lib/supabase";
import { DroneChecklist } from "@/components/checklists/DroneChecklist";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Procedure } from "@/lib/types";

export const dynamic = "force-dynamic";

const modelConfig: Record<string, {
  label: string; name: string; emoji: string;
  accentFrom: string; accentTo: string;
}> = {
  avata: {
    label: "DJI Avata",
    name: "avata",
    emoji: "🥽",
    accentFrom: "from-indigo-600",
    accentTo: "to-blue-700",
  },
  ivo: {
    label: "IVO",
    name: "ivo",
    emoji: "🛡️",
    accentFrom: "from-emerald-600",
    accentTo: "to-teal-700",
  },
};

export default async function ModelChecklistPage({ params }: { params: { model: string } }) {
  const cfg = modelConfig[params.model];
  if (!cfg) notFound();

  const { data: specific } = await supabase
    .from("procedures")
    .select("*")
    .eq("drone_model", params.model)
    .eq("procedure_type", "preflight_normal")
    .eq("is_active", true)
    .order("created_at");

  const { data: general } = await supabase
    .from("procedures")
    .select("*")
    .eq("drone_model", "")
    .eq("procedure_type", "preflight_normal")
    .eq("is_active", true)
    .order("created_at");

  const procedures: Procedure[] =
    specific && specific.length > 0
      ? (specific as Procedure[])
      : ((general ?? []) as Procedure[]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/checklists">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
      </div>
      <DroneChecklist
        droneName={cfg.name}
        droneLabel={cfg.label}
        procedures={procedures}
        accentFrom={cfg.accentFrom}
        accentTo={cfg.accentTo}
        emoji={cfg.emoji}
      />
    </div>
  );
}
