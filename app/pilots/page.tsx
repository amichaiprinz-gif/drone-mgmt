import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const certLabels: Record<string, string> = {
  avata: "אווטה", ivo: "איבו", matrice30: "מטריס 30",
  mavic3pro: "מאביק 3 פרו", air3: "Air 3", mini4: "Mini 4",
};

export default async function PilotsPage() {
  const { data: pilots } = await supabase
    .from("pilots")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">מטיסים</h1>
      {pilots?.map((p) => (
        <Card key={p.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                {p.role && <div className="text-xs text-gray-500">{p.role}</div>}
              </div>
              {!p.exam_passed && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                  ממתין למבחן
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(p.certifications as string[]).map((c) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {certLabels[c] ?? c}
                </Badge>
              ))}
            </div>
            {p.last_flight_date && (
              <div className="text-xs text-gray-400 mt-2">
                טיסה אחרונה: {p.last_flight_date}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
