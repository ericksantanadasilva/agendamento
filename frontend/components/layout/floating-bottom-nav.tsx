"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Agenda", href: "#agenda", icon: Calendar },
  { label: "Novo", href: "#novo", icon: Plus, isAction: true },
  { label: "Horários", href: "#horarios", icon: Clock },
  { label: "Mais", href: "#menu", icon: MoreHorizontal },
];

export function FloatingBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 bg-card border border-border px-2.5 py-1.5 rounded-full shadow-md shadow-black/20">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95"
                aria-label={item.label}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-11 h-9 rounded-full text-3xs font-medium transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
