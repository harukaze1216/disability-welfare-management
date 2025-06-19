export interface Organization {
  orgId: string;
  name: string;
  prefecture: string;
  address: string;
  facilityType: '児発' | '放デイ' | '就労B';
  startDate: Date;
  endDate?: Date;
}

export interface User {
  uid: string;
  orgId: string;
  role: 'HQ' | 'FC';
  email: string;
  isActive: boolean;
}

export interface Child {
  childId: string;
  orgId: string;
  name: string;
  defaultPickup: boolean;
  defaultDrop: boolean;
}

export interface AddOnMaster {
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
  reportId: string;
  orgId: string;
  date: string;
  children: ChildReport[];
}

export interface Revenue {
  revenueId: string;
  orgId: string;
  date: string;
  totalUnits: number;
  totalRevenue: number;
  userCount: number;
  averageSupportTime: number;
}