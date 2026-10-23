"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { getNavItems } from "./nav-items";

export function FloatingBottomNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const items = getNavItems(user?.role);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 md:hidden">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-md shadow-black/20">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 w-16 flex-col items-center justify-center rounded-full text-3xs font-medium transition-colors",
                isActive
                  ? "font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="h-9 w-16 flex-col gap-0 rounded-full text-3xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="mt-0.5">Sair</span>
        </Button>
      </nav>
    </div>
  );
}