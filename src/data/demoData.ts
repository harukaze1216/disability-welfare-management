import type { Organization, User, AddOnMaster, Child, DailyReport } from '../types';

// デモ用組織データ
export const demoOrganizations: Organization[] = [
  {
    id: 'hq-org',
    orgId: 'hq-org',
    name: '本部',
    prefecture: '東京都',
    address: '東京都渋谷区○○1-2-3',
    facilityType: '児発',
    startDate: '2020-04-01'
  },
  {
    id: 'demo-fc-org',
    orgId: 'demo-fc-org', 
    name: 'デモFC事業所',
    prefecture: '神奈川県',
    address: '神奈川県横浜市○○2-3-4',
    facilityType: '放デイ',
    startDate: '2021-04-01'
  },
  {
    id: 'fc-org-2',
    orgId: 'fc-org-2',
    name: 'サンプルFC事業所',
    prefecture: '埼玉県',
    address: '埼玉県さいたま市○○3-4-5',
    facilityType: '就労B',
    startDate: '2022-04-01'
  }
];

// デモ用ユーザーデータ
export const demoUsers: User[] = [
  {
    uid: 'demo-hq-user',
    email: 'demo@hq.com',
    role: 'HQ',
    orgId: 'hq-org',
    isActive: true
  },
  {
    uid: 'demo-fc-user',
    email: 'demo@fc.com',
    role: 'FC',
    orgId: 'demo-fc-org',
    isActive: true
  }
];

// デモ用加算マスタデータ
export const demoAddOnMasters: AddOnMaster[] = [
  {
    id: 'addon-1',
    addOnId: 'addon-1',
    name: '専門的支援加算',
    unitValue: 41,
    isBasic: true
  },
  {
    id: 'addon-2', 
    addOnId: 'addon-2',
    name: '個別サポート加算Ⅰ',
    unitValue: 108,
    isBasic: false
  },
  {
    id: 'addon-3',
    addOnId: 'addon-3',
    name: '送迎加算',
    unitValue: 54,
    isBasic: false
  },
  {
    id: 'addon-4',
    addOnId: 'addon-4',
    name: '延長支援加算',
    unitValue: 61,
    isBasic: false
  },
  {
    id: 'addon-5',
    addOnId: 'addon-5',
    name: '関係機関連携加算',
    unitValue: 200,
    isBasic: false
  }
];

// デモ用在籍児童データ
export const demoChildren: Child[] = [
  {
    id: 'child-1',
    childId: 'child-1',
    orgId: 'demo-fc-org',
    name: '田中 太郎',
    defaultPickup: true,
    defaultDrop: true
  },
  {
    id: 'child-2',
    childId: 'child-2',
    orgId: 'demo-fc-org',
    name: '佐藤 花音',
    defaultPickup: false,
    defaultDrop: true
  },
  {
    id: 'child-3',
    childId: 'child-3',
    orgId: 'demo-fc-org',
    name: '鈴木 健一',
    defaultPickup: true,
    defaultDrop: true
  }
];

// デモ用日次実績データ
export const demoDailyReports: DailyReport[] = [
  {
    id: 'report-1',
    reportId: 'report-1',
    orgId: 'demo-fc-org',
    date: '2024-12-18',
    children: [
      {
        childId: 'child-1',
        arrival: '09:00',
        departure: '15:00',
        pickup: true,
        drop: true,
        addOns: ['addon-1', 'addon-3']
      },
      {
        childId: 'child-2',
        arrival: '10:00',
        departure: '14:30',
        pickup: false,
        drop: true,
        addOns: ['addon-2']
      },
      {
        childId: 'child-3',
        pickup: false,
        drop: false,
        addOns: []
      }
    ]
  },
  {
    id: 'report-2',
    reportId: 'report-2',
    orgId: 'demo-fc-org',
    date: '2024-12-17',
    children: [
      {
        childId: 'child-1',
        arrival: '09:30',
        departure: '15:30',
        pickup: true,
        drop: true,
        addOns: ['addon-1', 'addon-3', 'addon-4']
      },
      {
        childId: 'child-2',
        arrival: '09:00',
        departure: '15:00',
        pickup: true,
        drop: true,
        addOns: ['addon-2', 'addon-3']
      },
      {
        childId: 'child-3',
        arrival: '10:00',
        departure: '16:00',
        pickup: true,
        drop: true,
        addOns: ['addon-1', 'addon-3', 'addon-4']
      }
    ]
  }
];