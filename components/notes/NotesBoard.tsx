"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/types";

export function NotesBoard({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!newContent.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("notes")
      .insert({ content: newContent.trim() })
      .select()
      .single();
    if (data) setNotes([data as Note, ...notes]);
    setNewContent("");
    setAdding(false);
    setSaving(false);
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-3">
      {!adding ? (
        <Button className="w-full" variant="outline" onClick={() => setAdding(true)}>
          + פתק חדש
        </Button>
      ) : (
        <Card className="border-blue-200">
          <CardContent className="pt-4 space-y-3">
            <Textarea
              autoFocus
              rows={3}
              placeholder="כתוב פתק חופשי... הסמכות, משימות, תזכורות"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              dir="rtl"
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setAdding(false); setNewContent(""); }}>
                ביטול
              </Button>
              <Button className="flex-1" onClick={addNote} disabled={saving || !newContent.trim()}>
                {saving ? "שומר..." : "שמור"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && !adding && (
        <div className="text-center py-12 text-gray-400 text-sm">
          אין פתקים עדיין
        </div>
      )}

      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <p className="text-sm whitespace-pre-wrap flex-1 leading-relaxed">{note.content}</p>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none shrink-0 mt-0.5"
                aria-label="מחק פתק"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(note.created_at).toLocaleDateString("he-IL", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
