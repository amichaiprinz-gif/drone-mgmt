import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineBatteries } from "@/components/drones/InlineBatteries";
import { SwapPrimaryButton } from "@/components/drones/SwapPrimaryButton";
import { Pencil } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const modelLabels: Record<string, string> = {
  avata: "DJI Avata", ivo: "IVO (איבו)", mavic3pro: "Mavic 3 Pro",
  air3: "Air 3", mini4: "Mini 4",
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  active:      { label: "מבצעי",     cls: "bg-green-100 text-green-800" },
  maintenance: { label: "בתחזוקה",   cls: "bg-yellow-100 text-yellow-800" },
  inactive:    { label: "לא מבצעי", cls: "bg-gray-100 text-gray-500" },
};

export default async function DronesPage() {
  const [{ data: drones }, { data: batteries }] = await Promise.all([
    supabase.from("drones").select("*").order("type").order("model").order("name"),
    supabase.from("batteries").select("*").order("label"),
  ]);

  type DroneRow = NonNullable<typeof drones>[number];
  type BattRow = NonNullable<typeof batteries>[number];

  const grouped = (drones ?? []).reduce<Record<string, { type: string; drones: DroneRow[]; batteries: BattRow[] }>>((acc, d) => {
    if (!acc[d.model]) {
      acc[d.model] = {
        type: d.type,
        drones: [],
        batteries: (batteries ?? []).filter((b) => b.drone_model === d.model),
      };
    }
    acc[d.model].drones.push(d);
    return acc;
  }, {});

  const military = Object.entries(grouped).filter(([, g]) => g.type === "military");
  const civilian = Object.entries(grouped).filter(([, g]) => g.type === "civilian");

  function ModelGroup({ model, group }: { model: string; group: { drones: DroneRow[]; batteries: BattRow[] } }) {
    // Separate primary/secondary (handle missing is_primary column gracefully)
    const hasPrimaryCol = group.drones.some((d) => "is_primary" in d);
    const primaryDrone  = hasPrimaryCol ? group.drones.find((d) => d.is_primary) : group.drones[0];
    const secondaryDrones = hasPrimaryCol ? group.drones.filter((d) => !d.is_primary) : group.drones.slice(1);
    const canSwap = hasPrimaryCol && !!primaryDrone && secondaryDrones.length === 1;

    return (
      <Card>
        <CardContent className="pt-4">
          <div dir="rtl" className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            {modelLabels[model] ?? model}
          </div>
          <div className="space-y-2">
            {group.drones.map((d) => {
              const s = statusConfig[d.status] ?? statusConfig.inactive;
              const isPrimary = hasPrimaryCol ? !!d.is_primary : d === primaryDrone;
              const showBadge = group.drones.length > 1;

              return (
                <div key={d.id} dir="rtl" className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {showBadge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isPrimary
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}>
                        {isPrimary ? "ראשי" : "משני"}
                      </span>
                    )}
                    <div>
                      <span className="font-medium text-sm">{d.name}</span>
                      {d.serial_number && (
                        <span className="text-xs text-gray-400 mr-1.5">{d.serial_number}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                      {s.label}
                    </span>
                    <Link href={`/drones/${d.id}/edit`}>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors p-1">
                        <Pencil size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {canSwap && primaryDrone && (
            <div dir="rtl">
              <SwapPrimaryButton
                primaryId={primaryDrone.id}
                secondaryId={secondaryDrones[0].id}
              />
            </div>
          )}

          <InlineBatteries batteries={group.batteries} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div dir="rtl" className="flex items-center justify-between">
        <h1 className="text-xl font-bold">רחפנים</h1>
        <div className="flex gap-2">
          <Link href="/checklists">
            <Button size="sm" variant="outline">נהלים</Button>
          </Link>
          <Link href="/drones/new">
            <Button size="sm">+ רחפן</Button>
          </Link>
        </div>
      </div>

      {military.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">צהליים</h2>
          {military.map(([model, group]) => (
            <ModelGroup key={model} model={model} group={group} />
          ))}
        </section>
      )}

      {civilian.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">אזרחיים</h2>
          {civilian.map(([model, group]) => (
            <ModelGroup key={model} model={model} group={group} />
          ))}
        </section>
      )}

      {!drones?.length && (
        <p className="text-sm text-gray-400 text-center py-12">אין רחפנים</p>
      )}
    </div>
  );
}
