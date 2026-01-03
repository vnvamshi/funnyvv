import type { ApiModel } from '../types/catalog';

// Build a pseudo-random but deterministic marketing name + original product name
export const getDisplayName = (product: ApiModel): string => {
  const prefixes = [
    'Aurora',
    'Vista',
    'Horizon',
    'Nova',
    'Vertex',
    'Summit',
    'Prism',
    'Atlas',
    'Zenith',
    'Echo',
  ];

  const hash = product.model_id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const prefix = prefixes[hash % prefixes.length];
  const baseName = product.model_name || product.model_id;

  return `${prefix} ${baseName}`;
};

// Generate a pseudo-random but stable price per product based on its data (in USD)
export const getDisplayPrice = (product: ApiModel): string => {
  const baseNumber = product.model_base_number || product.texture_count || 1;
  const hashFromId = product.model_id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const seed = baseNumber + hashFromId;
  // Price between $150 and ~$950
  const price = 150 + (seed % 80) * 10;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};



