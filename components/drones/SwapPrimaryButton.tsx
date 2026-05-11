"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeftRight } from "lucide-react";

export function SwapPrimaryButton({
  primaryId,
  secondaryId,
}: {
  primaryId: string;
  secondaryId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function swap() {
    setLoading(true);
    await Promise.all([
      supabase.from("drones").update({ is_primary: false }).eq("id", primaryId),
      supabase.from("drones").update({ is_primary: true }).eq("id", secondaryId),
    ]);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={swap}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors disabled:opacity-40 mt-2"
    >
      <ArrowLeftRight size={12} />
      {loading ? "מחליף..." : "החלף ראשי"}
    </button>
  );
}
