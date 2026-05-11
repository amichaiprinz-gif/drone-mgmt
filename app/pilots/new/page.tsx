import { NewPilotForm } from "@/components/pilots/NewPilotForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewPilotPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/pilots">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
        <h1 className="text-xl font-bold">מטיס חדש</h1>
      </div>
      <NewPilotForm />
    </div>
  );
}
