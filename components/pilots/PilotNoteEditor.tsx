"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function PilotNoteEditor({ pilotId, initialNotes }: { pilotId: string; initialNotes: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from("pilots").update({ notes }).eq("id", pilotId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div
        className="text-xs mt-2 cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-gray-50 transition-colors"
        onClick={() => setEditing(true)}
      >
        {notes
          ? <span className="text-gray-600 whitespace-pre-wrap">{notes}</span>
          : <span className="text-gray-300 italic">הוסף הערה...</span>
        }
      </div>
    );
  }

  return (
    <div className="mt-2">
      <textarea
        className="w-full text-xs rounded-lg border-2 border-blue-300 p-2 focus:outline-none resize-none bg-blue-50"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        dir="rtl"
        autoFocus
        placeholder="הערות, הסמכות ממתינות, תאריכים חשובים..."
      />
      <div className="flex gap-3 mt-1">
        <button onClick={save} disabled={saving} className="text-xs text-blue-600 font-semibold">
          {saving ? "שומר..." : "שמור"}
        </button>
        <button onClick={() => { setNotes(initialNotes ?? ""); setEditing(false); }} className="text-xs text-gray-400">
          ביטול
        </button>
      </div>
    </div>
  );
}
