"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { apiClient } from "@/lib/api";
import type { ApiDuration } from "@/lib/agenda";
import { useToast } from "@/lib/toast-context";

const FORM_ID = "duration-form";

export interface DurationFormDialogProps {
    duration: ApiDuration | null;
    onClose: () => void;
    onSaved: () => void;
}

export function DurationFormDialog({
    duration,
    onClose,
    onSaved,
}: DurationFormDialogProps) {
    const { showToast } = useToast();
    const [name, setName] = React.useState(duration?.name ?? "");
    const [minutes, setMinutes] = React.useState(
        duration ? String(duration.minutes) : "",
    );
    const [errors, setErrors] = React.useState<{
        name?: string;
        minutes?: string;
    }>({});
    const [submitting, setSubmitting] = React.useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        const parsedMinutes = Number(minutes);

        const nextErrors: typeof errors = {};
        if (!trimmedName) nextErrors.name = "Informe o nome da duração";
        if (!Number.isInteger(parsedMinutes) || parsedMinutes < 1) {
            nextErrors.minutes = "Informe um número inteiro de minutos, maior que zero";
        }
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setSubmitting(true);
        try {
            if (duration) {
                const body: Record<string, string | number> = {};
                if (trimmedName !== duration.name) body.name = trimmedName;
                if (parsedMinutes !== duration.minutes) body.minutes = parsedMinutes;

                if (Object.keys(body).length === 0) {
                    onClose();
                    return;
                }

                await apiClient(`/durations/${duration.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                });
                showToast("Duração atualizada.");
            } else {
                await apiClient("/durations", {
                    method: "POST",
                    body: JSON.stringify({ name: trimmedName, minutes: parsedMinutes }),
                });
                showToast("Duração criada.");
            }
            onSaved();
            onClose();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Não foi possível salvar a duração.",
                "error",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
         eyebrow="Configuração"
         title={duration ? "Edita duração" : "Nova duração"}
         onClose={onClose}
         footer={
            <>
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Fechar
                </Button>
                <Button
                 type="submit"
                 form={FORM_ID}
                 variant="primary"
                 size="sm"
                 className="gap-1.5"
                 disabled={submitting}
                >
                    <Check className="h-3.5 w-3.5" />
                    {submitting ? "Salvando..." : duration ? "Salvar alterações" : "Criar duração"}
                </Button>
            </>
         }
        >
            <form
             id={FORM_ID}
             onSubmit={handleSubmit}
             className="space-y-4 p-5 text-xs"
            >
                <Input
                 id="duration-name"
                 label="Nome"
                 placeholder="Ex: Meia hora"
                 autoFocus
                 value={name}
                 onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                 }}
                 error={errors.name}
                />
                <Input
                 id="duration-minutes"
                 label="Minutos"
                 type="number"
                 inputMode="numeric"
                 min={1}
                 step={1}
                 placeholder="Ex: 30"
                 value={minutes}
                 onChange={(e) => {
                    setMinutes(e.target.value);
                    setErrors((prev) => ({ ...prev, minutes: undefined }));
                 }}
                 error={errors.minutes}
                />
            </form>
        </Dialog>
    )
}