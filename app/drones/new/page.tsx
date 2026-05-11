import { NewDroneForm } from "@/components/drones/NewDroneForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewDronePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/drones">
          <Button variant="ghost" size="sm">← חזרה</Button>
        </Link>
        <h1 className="text-xl font-bold">רחפן חדש</h1>
      </div>
      <NewDroneForm />
    </div>
  );
}
