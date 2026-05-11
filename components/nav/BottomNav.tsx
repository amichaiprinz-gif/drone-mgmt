"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plane, Users, Cpu, BatteryCharging, StickyNote } from "lucide-react";

const navItems = [
  { href: "/", label: "בית", icon: LayoutDashboard },
  { href: "/flights", label: "גיחות", icon: Plane },
  { href: "/pilots", label: "מטיסים", icon: Users },
  { href: "/drones", label: "רחפנים", icon: Cpu },
  { href: "/batteries", label: "סוללות", icon: BatteryCharging },
  { href: "/notes", label: "פתקים", icon: StickyNote },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-6 h-14">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full" />
              )}
              <Icon size={18} aria-hidden="true" />
              <span className={`text-[10px] ${active ? "font-semibold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
