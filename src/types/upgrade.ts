export type UpgradeId = 'lamp';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  trait: string;
  description: string;
  price: number;
}
