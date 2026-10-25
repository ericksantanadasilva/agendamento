"use client";

import * as React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function ManagedList({ children }: { children: React.ReactNode }) {
    return (
        <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border bg-card">
            {children}
        </ul>
    );
}

export function ManagedListSkeleton() {
    return (
        <div className="animate-pulse divide-y divide-border/60 rounded-[var(--radius)] border border-border/60">
            {[0, 1, 2].map((row) => (
                <div key={row} className="flex items-center justify-between p-4">
                    <div className="space-y-2">
                        <div className="h-3 w-40 rounded bg-muted/50" />
                        <div className="h-2.5 w-56 rounded bg-muted/30" />
                    </div>
                    <div className="h-5 w-16 rounded bg-muted/40" />
                </div>
            ))}
        </div>
    )
}

export interface ManagedItemRowProps {
    title: string;
    subtitle?: React.ReactNode;
    monoTitle?: boolean;
    active: boolean;
    labels?: { active: string; inactive: string };
    onEdit: () => void;
    onSetActive: (active: boolean) => void;
}

const DEFAULT_LABELS = { active: "Ativo", inactive: "Desativado" };

export function ManagedItemRow({
    title,
    subtitle,
    monoTitle = false,
    active,
    labels = DEFAULT_LABELS,
    onEdit,
    onSetActive,
}: ManagedItemRowProps) {
    const [confirming, setConfirming] = React.useState(false);

    React.useEffect(() => {
        if (!confirming) return;
        const timer = window.setTimeout(() => setConfirming(false), 4000);
        return () => window.clearTimeout(timer);
    }, [confirming]);

    function handleDeactivate() {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        setConfirming(false);
        onSetActive(false);
    }

    return (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
                <p
                    className={cn(
                        "truncate text-sm text-foreground",
                        monoTitle ? "font-mono" : "font-medium",
                    )}
                >
                    {title}
                </p>
                {subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Badge
                    className="w-28 justify-center"
                    dotClassName={active ? "bg-primary" : "bg-muted-foreground/50"}
                >
                    {active ? labels.active : labels.inactive}
                </Badge>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    Editar
                </Button>
                {active ? (
                    <Button
                        variant={confirming ? "destructive" : "ghost"}
                        size="sm"
                        className="min-w-24"
                        onClick={handleDeactivate}
                    >
                        {confirming ? "Confirmar desativação?" : "Desativar"}
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="min-w-24"
                        onClick={() => onSetActive(true)}
                    >
                        Ativar
                    </Button>
                )}
            </div>
        </li>
    );
}