import Link from "next/link";
import { Button } from "@/components/ui/button";

const drones = [
  {
    model: "avata",
    label: "DJI Avata",
    description: "רחפן FPV קרבי — משקפי FPV, בקר תנועה",
    emoji: "🥽",
    from: "from-indigo-600",
    to: "to-blue-700",
    textColor: "text-indigo-100",
    badge: "FPV",
  },
  {
    model: "ivo",
    label: "IVO",
    description: "רחפן מעקב צבאי — GPS, מגלה אוטומטי",
    emoji: "🛡️",
    from: "from-emerald-600",
    to: "to-teal-700",
    textColor: "text-emerald-100",
    badge: "MILITARY",
  },
];

export default function ChecklistsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">נהלי הטסה</h1>
      <p className="text-sm text-gray-500" dir="rtl">בחר רחפן לצ׳קליסט אינטראקטיבי</p>

      <div className="space-y-3">
        {drones.map((d) => (
          <Link key={d.model} href={`/checklists/${d.model}`} className="block">
            <div className={`bg-gradient-to-br ${d.from} ${d.to} rounded-3xl p-5 shadow-md active:scale-[0.99] transition-transform`}>
              <div className="flex items-center justify-between" dir="rtl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="text-white font-bold text-lg">{d.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white/20 ${d.textColor} font-mono`}>
                      {d.badge}
                    </span>
                  </div>
                  <p className={`text-sm ${d.textColor} opacity-90`}>{d.description}</p>
                </div>
                <div className="text-white/60 text-2xl">←</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/procedures">
          <Button variant="outline" size="sm" className="w-full">
            כל הנהלים ←
          </Button>
        </Link>
      </div>
    </div>
  );
}
