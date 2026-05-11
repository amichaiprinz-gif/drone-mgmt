"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function DronePrimaryToggle({
  droneId,
  isPrimary,
  siblingIds,
}: {
  droneId: string;
  isPrimary: boolean;
  siblingIds: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    if (!isPrimary) {
      // הפוך זה לראשי וכל השאר למשניים
      await Promise.all([
        supabase.from("drones").update({ is_primary: true }).eq("id", droneId),
        ...siblingIds.map((id) =>
          supabase.from("drones").update({ is_primary: false }).eq("id", id)
        ),
      ]);
    } else {
      // הפוך זה למשני (רק אם קיים אח)
      if (siblingIds.length > 0) {
        await supabase.from("drones").update({ is_primary: false }).eq("id", droneId);
      }
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isPrimary ? "לחץ להגדרה כמשני" : "לחץ להגדרה כראשי"}
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-all active:scale-95 ${
        isPrimary
          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600"
      } ${loading ? "opacity-40" : ""}`}
    >
      {loading ? "..." : isPrimary ? "ראשי" : "משני"}
    </button>
  );
}
