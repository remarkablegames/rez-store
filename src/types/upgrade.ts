export type UpgradeId = 'inspect' | 'inspect-grime' | 'inspect-abrasion';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  trait: string;
  description: string;
  price: number;
}
