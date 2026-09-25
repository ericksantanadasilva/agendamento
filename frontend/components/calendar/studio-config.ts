import { StudioResource } from "@/types/calendar";

export interface StudioStyleConfig {
  id: string;
  name: string;
  shortName: string;
  borderClass: string;
  dotClass: string;
  badgeClass: string;
  textClass: string;
  accentHex: string;
}

/**
 * Mapeamento de cores padronizadas e semânticas para cada estúdio/recurso.
 * Respeita a paleta dark e neutra do DESIGN_SYSTEM.md com acentos funcionais:
 * - Estúdio 01: Primário / Esmeralda (#00d084)
 * - Estúdio 02: Info / Sky (#38bdf8)
 * - Estúdio 03: Alerta / Âmbar (#f59e0b)
 */
export const STUDIO_CONFIGS: Record<string, StudioStyleConfig> = {
  "studio-1": {
    id: "studio-1",
    name: "Estúdio 01",
    shortName: "E1",
    borderClass: "border-l-primary",
    dotClass: "bg-primary",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    textClass: "text-primary",
    accentHex: "#00d084",
  },
  "studio-2": {
    id: "studio-2",
    name: "Estúdio 02",
    shortName: "E2",
    borderClass: "border-l-info",
    dotClass: "bg-info",
    badgeClass: "bg-info/10 text-info border-info/20",
    textClass: "text-info",
    accentHex: "#38bdf8",
  },
  "studio-3": {
    id: "studio-3",
    name: "Estúdio 03",
    shortName: "E3",
    borderClass: "border-l-warning",
    dotClass: "bg-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    textClass: "text-warning",
    accentHex: "#f59e0b",
  },
  "studio-4": {
    id: "studio-4",
    name: "Estúdio 04",
    shortName: "E4",
    borderClass: "border-l-purple-500",
    dotClass: "bg-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    textClass: "text-purple-400",
    accentHex: "#a855f7",
  },
};

const FALLBACK_CONFIGS: Omit<StudioStyleConfig, "id" | "name" | "shortName">[] = [
  {
    borderClass: "border-l-accent",
    dotClass: "bg-accent",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    textClass: "text-accent",
    accentHex: "#a855f7",
  },
  {
    borderClass: "border-l-rose-500",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    textClass: "text-rose-400",
    accentHex: "#f43f5e",
  },
];

export function getStudioConfig(
  studioId: string,
  resources?: StudioResource[],
): StudioStyleConfig {
  if (STUDIO_CONFIGS[studioId]) {
    return STUDIO_CONFIGS[studioId];
  }

  const res = resources?.find((r) => r.id === studioId);
  const name = res?.name || "Estúdio";
  const shortName = name.replace(/[^0-9a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "ES";

  // Gera fallback determinístico a partir do ID
  const hash = studioId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallback = FALLBACK_CONFIGS[hash % FALLBACK_CONFIGS.length];

  return {
    id: studioId,
    name,
    shortName,
    ...fallback,
  };
}
