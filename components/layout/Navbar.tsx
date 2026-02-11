"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  ShieldAlert,
  Clock,
  Shield,
  Package,
  Globe,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "./ConnectionStatus";

const NAV_ITEMS = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/logs", label: "Registros", icon: ScrollText },
  { href: "/alerts", label: "Alertas", icon: ShieldAlert },
  { href: "/timeline", label: "Cronología", icon: Clock },
  { href: "/network", label: "Red", icon: Network },
  // { href: "/map", label: "Mapa", icon: Globe },
  { href: "/evidence", label: "Evidencias", icon: Package },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            DVWA Monitor Forense
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <ConnectionStatus />
    </header>
  );
}
