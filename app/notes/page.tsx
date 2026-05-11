import { supabase } from "@/lib/supabase";
import { NotesBoard } from "@/components/notes/NotesBoard";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">פתקים</h1>
      <NotesBoard initialNotes={notes ?? []} />
    </div>
  );
}
