import { supabase } from "@/lib/supabase";

function needsReverse(text: string): boolean {
  // Hebrew chars are U+05D0–U+05EA. If first non-space char is Hebrew, check if reversed.
  const firstHebrew = [...text].find((c) => c >= "א" && c <= "ת");
  if (!firstHebrew) return false;
  // Heuristic: if reversed version starts with a "nicer" first-word, it was stored reversed.
  // Simpler: just reverse all strings that contain Hebrew.
  return true;
}

export async function GET() {
  const results: Record<string, { before: string; after: string; ok: boolean }[]> = {
    drones: [],
    batteries: [],
  };

  const [{ data: drones }, { data: batteries }] = await Promise.all([
    supabase.from("drones").select("id, name"),
    supabase.from("batteries").select("id, label"),
  ]);

  for (const d of drones ?? []) {
    if (!needsReverse(d.name)) continue;
    const fixed = [...d.name].reverse().join("");
    const { error } = await supabase.from("drones").update({ name: fixed }).eq("id", d.id);
    results.drones.push({ before: d.name, after: fixed, ok: !error });
  }

  for (const b of batteries ?? []) {
    if (!needsReverse(b.label)) continue;
    const fixed = [...b.label].reverse().join("");
    const { error } = await supabase.from("batteries").update({ label: fixed }).eq("id", b.id);
    results.batteries.push({ before: b.label, after: fixed, ok: !error });
  }

  return Response.json(results);
}
