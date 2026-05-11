import { EditProcedureForm } from "@/components/procedures/EditProcedureForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProcedurePage() {
  return (
    <div>
      <div dir="rtl" className="flex items-center gap-3 mb-4">
        <Link href="/procedures">
          <Button variant="ghost" size="sm">חזרה ←</Button>
        </Link>
        <h1 className="text-xl font-bold">נוהל חדש</h1>
      </div>
      <EditProcedureForm procedure={null} />
    </div>
  );
}
