import { StudioResource } from '@/types/calendar';

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

type StudioPalette = Omit<StudioStyleConfig, 'id' | 'name' | 'shortName'>;

// As classes precisam estar escritas por extenso: o Tailwind só gera o CSS do que encontra no código.
const STUDIO_PALETTE: StudioPalette[] = [
  {
    borderClass: 'border-l-primary',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    textClass: 'text-primary',
    accentHex: '#00d084',
  },
  {
    borderClass: 'border-l-info',
    dotClass: 'bg-info',
    badgeClass: 'bg-info/10 text-info border-info/20',
    textClass: 'text-info',
    accentHex: '#38bdf8',
  },
  {
    borderClass: 'border-l-warning',
    dotClass: 'bg-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
    textClass: 'text-warning',
    accentHex: '#f59e0b',
  },
  {
    borderClass: 'border-l-purple-500',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    textClass: 'text-purple-400',
    accentHex: '#a855f7',
  },
  {
    borderClass: 'border-l-rose-500',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    textClass: 'text-rose-400',
    accentHex: '#f43f5e',
  },
  {
    borderClass: 'border-l-indigo-500',
    dotClass: 'bg-indigo-500',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    textClass: 'text-indigo-400',
    accentHex: '#6366f1',
  },
  {
    borderClass: 'border-l-orange-500',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    textClass: 'text-orange-400',
    accentHex: '#f97316',
  },
  {
    borderClass: 'border-l-teal-500',
    dotClass: 'bg-teal-500',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    textClass: 'text-teal-400',
    accentHex: '#14b8a6',
  },
];

function hashId(id: string): number {
  return id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

// "Estúdio A" → "EA", "Estúdio 01" → "E1", "Sala" → "SA"
function getShortName(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0] ?? '';
  const second = words[1]?.replace(/^0+(?=\d)/, '') ?? '';
  const letters = second
    ? `${first[0] ?? ''}${/^\d{1,2}$/.test(second) ? second : second[0]}`
    : first.slice(0, 2);
  return letters.toUpperCase() || 'ES';
}

export function getStudioConfig(
  studioId: string,
  resources?: StudioResource[],
): StudioStyleConfig {
  const index = resources?.findIndex((r) => r.id === studioId) ?? -1;
  const resource = index >= 0 ? resources?.[index] : undefined;
  const name = resource?.name ?? 'Estúdio';
  const slot = index >= 0 ? index : hashId(studioId);

  return {
    id: studioId,
    name,
    shortName: getShortName(name),
    ...STUDIO_PALETTE[slot % STUDIO_PALETTE.length],
  };
}
