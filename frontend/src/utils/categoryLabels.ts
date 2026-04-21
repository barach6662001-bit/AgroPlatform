// Utility to get a localized cost category label.
// Falls back to the key itself if no translation found.

const categoryMap: Record<string, string> = {
  Fuel: 'Пальне',
  fuel: 'Пальне',
  Seeds: 'Насіння',
  seeds: 'Насіння',
  Fertilizer: 'Добрива',
  fertilizer: 'Добрива',
  Fertilizers: 'Добрива',
  Pesticide: 'Пестициди',
  pesticide: 'Пестициди',
  Pesticides: 'Пестициди',
  Machinery: 'Техніка',
  machinery: 'Техніка',
  Equipment: 'Обладнання',
  equipment: 'Обладнання',
  Labor: 'Праця',
  labor: 'Праця',
  Other: 'Інше',
  other: 'Інше',
  Lease: 'Оренда',
  lease: 'Оренда',
  Rent: 'Оренда',
  rent: 'Оренда',
};

export function getCategoryLabel(key: string): string {
  return categoryMap[key] || key;
}
