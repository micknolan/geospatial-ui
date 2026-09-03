/**
 * Fixed categorical order — colors are assigned by category identity, never
 * cycled or reassigned based on rank/filter state. Reused for every chart,
 * badge and dot across the app so "Land" (for example) is always the same
 * color whether it's counting datasets or queries.
 */
export const CATEGORY_ORDER = ['Land', 'Forestry', 'Water', 'Boundaries', 'Livestock'] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Land: '#2a78d6',
  Forestry: '#eb6834',
  Water: '#1baf7a',
  Boundaries: '#eda100',
  Livestock: '#e87ba4',
};

export const CATEGORY_OTHER_COLOR = '#a9b0ac';

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_OTHER_COLOR;
}
