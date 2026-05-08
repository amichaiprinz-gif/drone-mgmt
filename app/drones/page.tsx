import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const modelLabels: Record<string, string> = {
  avata: "DJI Avata", ivo: "IVO (איבו)", mavic3pro: "Mavic 3 Pro",
  air3: "Air 3", mini4: "Mini 4", other: "אחר",
};

const statusConfig: Record<string, { label: string; classes: string }> = {
  active:      { label: "מבצעי",       classes: "bg-green-100 text-green-800" },
  maintenance: { label: "בתחזוקה",     classes: "bg-yellow-100 text-yellow-800" },
  inactive:    { label: "לא מבצעי",   classes: "bg-gray-100 text-gray-500" },
};

export default async function DronesPage() {
  const { data: drones } = await supabase
    .from("drones")
    .select("*")
    .order("type")
    .order("name");

  const military = drones?.filter((d) => d.type === "military") ?? [];
  const civilian = drones?.filter((d) => d.type === "civilian") ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">רחפנים</h1>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">צהליים</h2>
        <div className="space-y-2">
          {military.map((d) => {
            const s = statusConfig[d.status];
            return (
              <Card key={d.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-gray-500">{modelLabels[d.model] ?? d.model}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.classes}`}>
                    {s.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">אזרחיים (תרומות)</h2>
        <div className="space-y-2">
          {civilian.map((d) => {
            const s = statusConfig[d.status];
            return (
              <Card key={d.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-gray-500">{modelLabels[d.model] ?? d.model}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.classes}`}>
                    {s.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
