"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plane, Users, Battery, FileText } from "lucide-react";

const navItems = [
  { href: "/", label: "בית", icon: LayoutDashboard },
  { href: "/flights", label: "גיחות", icon: Plane },
  { href: "/pilots", label: "מטיסים", icon: Users },
  { href: "/batteries", label: "סוללות", icon: Battery },
  { href: "/procedures", label: "נהלים", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
