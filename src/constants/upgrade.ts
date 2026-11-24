import type { Upgrade } from '../types';

export const INSPECT_TIERS: Upgrade[] = [
  {
    id: 'inspect-grime',
    name: 'Inspect',
    trait: 'INSPECTION MAP',
    description: 'Highlight remaining grime on the photo.',
    price: 65,
  },

  {
    id: 'inspect-abrasion',
    name: 'Abrasion',
    trait: 'INSPECTION MAP',
    description: 'Highlight where the print was over-scrubbed.',
    price: 110,
  },
] as const;
