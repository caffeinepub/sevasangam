export const CATEGORY_IDS = {
  PLUMBER: 'plumber',
  ELECTRICIAN: 'electrician',
  MASON: 'mason',
  HOUSE_CLEANER: 'house-cleaner',
  GARDEN_CLEANER: 'garden-cleaner',
  CARPENTER: 'carpenter',
  PAINTER: 'painter',
  MECHANIC: 'mechanic',
  OTHER: 'other',
} as const;

export const CATEGORY_NAMES: Record<string, string> = {
  [CATEGORY_IDS.PLUMBER]: 'Plumber',
  [CATEGORY_IDS.ELECTRICIAN]: 'Electrician',
  [CATEGORY_IDS.MASON]: 'Mason',
  [CATEGORY_IDS.HOUSE_CLEANER]: 'House Cleaner',
  [CATEGORY_IDS.GARDEN_CLEANER]: 'Garden / Backyard Cleaner',
  [CATEGORY_IDS.CARPENTER]: 'Carpenter',
  [CATEGORY_IDS.PAINTER]: 'Painter',
  [CATEGORY_IDS.MECHANIC]: 'Mechanic',
  [CATEGORY_IDS.OTHER]: 'Other Services',
};

export function getCategoryIcon(categoryId: string): number {
  const iconMap: Record<string, number> = {
    [CATEGORY_IDS.PLUMBER]: 0,
    [CATEGORY_IDS.ELECTRICIAN]: 1,
    [CATEGORY_IDS.MASON]: 2,
    [CATEGORY_IDS.HOUSE_CLEANER]: 3,
    [CATEGORY_IDS.GARDEN_CLEANER]: 4,
    [CATEGORY_IDS.CARPENTER]: 5,
    [CATEGORY_IDS.PAINTER]: 6,
    [CATEGORY_IDS.MECHANIC]: 7,
    [CATEGORY_IDS.OTHER]: 8,
  };
  return iconMap[categoryId] ?? 8;
}

export function getCategoryImagePath(categoryId: string): string {
  const imageMap: Record<string, string> = {
    [CATEGORY_IDS.PLUMBER]: '/assets/generated/sevasangam-category-plumber.dim_512x512.png',
    [CATEGORY_IDS.ELECTRICIAN]: '/assets/generated/sevasangam-category-electrician.dim_512x512.png',
    [CATEGORY_IDS.MASON]: '/assets/generated/sevasangam-category-mason.dim_512x512.png',
    [CATEGORY_IDS.HOUSE_CLEANER]: '/assets/generated/sevasangam-category-house-cleaner.dim_512x512.png',
    [CATEGORY_IDS.GARDEN_CLEANER]: '/assets/generated/sevasangam-category-garden-cleaner.dim_512x512.png',
    [CATEGORY_IDS.CARPENTER]: '/assets/generated/sevasangam-category-carpenter.dim_512x512.png',
    [CATEGORY_IDS.PAINTER]: '/assets/generated/sevasangam-category-painter.dim_512x512.png',
    [CATEGORY_IDS.MECHANIC]: '/assets/generated/sevasangam-category-mechanic.dim_512x512.png',
    [CATEGORY_IDS.OTHER]: '/assets/generated/sevasangam-category-other.dim_512x512.png',
  };
  return imageMap[categoryId] ?? '/assets/generated/sevasangam-category-other.dim_512x512.png';
}
