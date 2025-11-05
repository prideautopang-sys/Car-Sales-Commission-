export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Executive = 'Executive',
}

export interface User {
  id: number;
  name: string;
  role: Role;
}

export type Page = 'dataEntry' | 'settings' | 'summary';

export type Branch = 'Mahasarakham' | 'Kalasin';
export type FilmType = 'XUD MAX II' | 'Lamina CM-one' | 'X-tra cole' | 'None';
export type FilmStatus = 'ติดตั้งแล้ว' | 'รอติด';
export type PaymentMethod = 'Cash' | 'TTB' | 'KL' | 'AY';
export type SaleStatus = 'Pending Admin' | 'Pending Manager Approval' | 'Pending Executive Finalization' | 'Finalized';

export interface Accessory {
  id: number;
  name: string;
}

export interface SelectedAccessory {
  accessoryId: number;
  price: number;
}

export interface SalesRecord {
  id: number;
  salespersonMonthlyCarCount: number;
  deliveryDate: string; // ISO string format
  branch: Branch;
  salespersonName: string;
  customerName: string;
  carModel: string;
  carColor: string;
  stockLocation: Branch;
  filmType: FilmType;
  filmStatus: FilmStatus;
  freebies: string;
  paymentMethod: PaymentMethod;
  notes: string;
  accessories: SelectedAccessory[];
  status: SaleStatus;
  isPaid: boolean;
  paymentDate: string | null;
  carCommission: number;
  processingFeeDeduction: number;
  netCommission: number; // Total commission for this single sale
}

export interface StepBonus {
  carCount: number;
  bonusAmount: number;
}

export interface CommissionableAccessory {
  id: number;
  name: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
}

export interface CarModelCommission {
  modelName: string;
  commission: number;
}

export interface CommissionSettings {
  carModelCommissions: CarModelCommission[];
  processingFeePercentage: number;
  stepBonuses: StepBonus[];
  accessories: CommissionableAccessory[];
  salespeople: string[];
}