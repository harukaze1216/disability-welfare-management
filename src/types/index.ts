export interface Organization {
  id?: string;
  orgId?: string;
  name: string;
  prefecture: string;
  address: string;
  facilityType: '児発' | '放デイ' | '就労B';
  startDate: Date | string;
  endDate?: Date | string;
}

export interface User {
  id?: string;
  uid: string;
  orgId: string;
  role: 'HQ' | 'FC';
  email: string;
  isActive: boolean;
}

export interface Child {
  id?: string;
  childId: string;
  orgId: string;
  name: string;
  defaultPickup: boolean;
  defaultDrop: boolean;
}

export interface AddOnMaster {
  id?: string;
  addOnId: string;
  name: string;
  unitValue: number;
  isBasic: boolean;
}

export interface ChildReport {
  childId: string;
  arrival?: string;
  departure?: string;
  pickup: boolean;
  drop: boolean;
  addOns: string[];
}

export interface DailyReport {
  id?: string;
  reportId: string;
  orgId: string;
  date: string;
  children: ChildReport[];
}

export interface Revenue {
  id?: string;
  revenueId: string;
  orgId: string;
  date: string;
  totalUnits: number;
  totalRevenue: number;
  userCount: number;
  averageSupportTime: number;
}