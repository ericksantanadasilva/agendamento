"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import type { ApiStudio } from "@/lib/agenda";
import { useToast } from "@/lib/toast-context";

const FORM_ID = "studio-form";

export interface StudioFormDialogProps {
  studio: ApiStudio | null;
  onClose: () => void;
  onSaved: () => void;
}

export function StudioFormDialog({
  studio,
  onClose,
  onSaved,
}: StudioFormDialogProps) {
  const { showToast } = useToast();
  const [name, setName] = React.useState(studio?.name ?? "");
  const [description, setDescription] = React.useState(
    studio?.description ?? "",
  );
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setNameError("Informe o nome do estúdio");
      return;
    }

    setSubmitting(true);
    try {
      if (studio) {
        const body: Record<string, string> = {};
        if (trimmedName !== studio.name) body.name = trimmedName;
        if (trimmedDescription !== (studio.description ?? "")) {
          body.description = trimmedDescription;
        }

        if (Object.keys(body).length === 0) {
          onClose();
          return;
        }

        await apiClient(`/studios/${studio.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        showToast("Estúdio atualizado.");
      } else {
        await apiClient("/studios", {
          method: "POST",
          body: JSON.stringify({
            name: trimmedName,
            ...(trimmedDescription ? { description: trimmedDescription } : {}),
          }),
        });
        showToast("Estúdio criado.");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Não foi possível salvar o estúdio.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      eyebrow="Configuração"
      title={studio ? "Editar estúdio" : "Novo estúdio"}
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
            {submitting ? "Salvando..." : studio ? "Salvar alterações" : "Criar estúdio"}
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
          id="studio-name"
          label="Nome"
          placeholder="Ex: Estúdio A"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          error={nameError ?? undefined}
        />
        <Input
          id="studio-description"
          label="Descrição (opcional)"
          placeholder="Ex: Sala principal de gravação"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Dialog>
  );
}