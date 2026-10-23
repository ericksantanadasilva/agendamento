import { Calendar, Clock, Layers, type LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
    { label: "Calendário", href: "/", icon: Calendar },
    { label: "Estúdios", href: "/estudios", icon: Layers, roles: ["ADMIN"] },
    { label: "Durações", href: "/duracoes", icon: Clock, roles: ["ADMIN"]},
];

export function getNavItems(role: UserRole | undefined): NavItem[] {
    return NAV_ITEMS.filter(
        (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
    );
}