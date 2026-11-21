export type UpgradeId = 'inspect';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  trait: string;
  description: string;
  price: number;
}
