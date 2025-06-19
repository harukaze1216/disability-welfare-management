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

// デモ用日次実績データ（月次データ生成）
const generateDemoReports = () => {
  const reports: DailyReport[] = [];
  const today = new Date();
  
  // 過去30日分のデータを生成
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 平日のみ生成（土日をスキップ）
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // ランダムな出席状況を生成
    const attendanceRate = 0.75 + Math.random() * 0.25; // 75-100%の出席率
    const children = ['child-1', 'child-2', 'child-3'];
    
    const reportChildren = children.map(childId => {
      const isPresent = Math.random() < attendanceRate;
      
      if (!isPresent) {
        return {
          childId,
          pickup: false,
          drop: false,
          addOns: []
        };
      }
      
      // 出席時の時間とアドオンをランダム生成
      const arrivalHour = 9 + Math.floor(Math.random() * 2); // 9-10時
      const arrivalMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45分
      const departureHour = 14 + Math.floor(Math.random() * 3); // 14-16時
      const departureMinute = Math.floor(Math.random() * 4) * 15;
      
      const arrival = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}`;
      const departure = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
      
      const possibleAddOns = ['addon-1', 'addon-2', 'addon-3', 'addon-4', 'addon-5'];
      const addOns = possibleAddOns.filter(() => Math.random() < 0.4); // 40%の確率で各アドオン
      
      return {
        childId,
        arrival,
        departure,
        pickup: Math.random() < 0.8,
        drop: Math.random() < 0.9,
        addOns
      };
    });
    
    reports.push({
      id: `report-${dateStr}`,
      reportId: `report-${dateStr}`,
      orgId: 'demo-fc-org',
      date: dateStr,
      children: reportChildren
    });
  }
  
  return reports.reverse(); // 古い順にソート
};

export const demoDailyReports: DailyReport[] = generateDemoReports();