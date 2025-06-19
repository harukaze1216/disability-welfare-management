import React, { useState, useMemo } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import type { DailyReport, AddOnMaster } from '../types';
import '../styles/design-system.css';

export const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const { data: reports } = useFirestore<DailyReport>('dailyReports');
  // const { data: children } = useFirestore<Child>('children');
  const { data: addOns } = useFirestore<AddOnMaster>('addOnMasters');
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');
  
  // 自分の事業所のデータのみフィルタ
  const orgReports = useMemo(() => {
    if (!userData?.orgId) return [];
    return reports.filter(report => report.orgId === userData.orgId);
  }, [reports, userData?.orgId]);
  
  // 将来の機能拡張用（現在は未使用）
  // const orgChildren = useMemo(() => {
  //   if (!userData?.orgId) return [];
  //   return children.filter(child => child.orgId === userData.orgId);
  // }, [children, userData?.orgId]);

  // 期間フィルタ
  const periodReports = useMemo(() => {
    const today = new Date();
    const filterDate = new Date(today);
    
    if (selectedPeriod === 'week') {
      filterDate.setDate(today.getDate() - 7);
    } else {
      filterDate.setDate(today.getDate() - 30);
    }
    
    return orgReports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate >= filterDate;
    });
  }, [orgReports, selectedPeriod]);

  // KPI計算
  const kpis = useMemo(() => {
    if (periodReports.length === 0) {
      return {
        totalDays: 0,
        totalAttendance: 0,
        totalAbsence: 0,
        attendanceRate: 0,
        averageAttendancePerDay: 0,
        totalRevenue: 0,
        totalUnits: 0,
        averageSupportTime: 0,
        topAddOns: []
      };
    }

    let totalAttendance = 0;
    let totalAbsence = 0;
    let totalSupportTime = 0;
    let totalRevenue = 0;
    let totalUnits = 0;
    const addOnUsage: Record<string, number> = {};

    periodReports.forEach(report => {
      report.children.forEach(childReport => {
        if (childReport.arrival && childReport.departure) {
          totalAttendance++;
          
          // 支援時間計算
          const arrivalTime = new Date(`2000-01-01T${childReport.arrival}`);
          const departureTime = new Date(`2000-01-01T${childReport.departure}`);
          const supportHours = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
          totalSupportTime += supportHours;
          
          // 基本単価（仮で1時間あたり800円）
          totalRevenue += supportHours * 800;
          totalUnits += supportHours;
          
          // アドオン収益
          childReport.addOns.forEach(addOnId => {
            const addOn = addOns.find(a => a.addOnId === addOnId);
            if (addOn) {
              totalRevenue += addOn.unitValue;
              totalUnits += addOn.unitValue / 100; // 単位換算
              addOnUsage[addOnId] = (addOnUsage[addOnId] || 0) + 1;
            }
          });
        } else {
          totalAbsence++;
        }
      });
    });

    const attendanceRate = totalAttendance + totalAbsence > 0 
      ? (totalAttendance / (totalAttendance + totalAbsence)) * 100 
      : 0;

    const averageAttendancePerDay = periodReports.length > 0 
      ? totalAttendance / periodReports.length 
      : 0;

    const averageSupportTime = totalAttendance > 0 
      ? totalSupportTime / totalAttendance 
      : 0;

    // 人気アドオントップ3
    const topAddOns = Object.entries(addOnUsage)
      .map(([addOnId, count]) => {
        const addOn = addOns.find(a => a.addOnId === addOnId);
        return { name: addOn?.name || addOnId, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalDays: periodReports.length,
      totalAttendance,
      totalAbsence,
      attendanceRate,
      averageAttendancePerDay,
      totalRevenue,
      totalUnits,
      averageSupportTime,
      topAddOns
    };
  }, [periodReports, addOns]);

  // 週別・月別トレンド
  const trendData = useMemo(() => {
    const groups: Record<string, { attendance: number; absence: number; revenue: number }> = {};
    
    periodReports.forEach(report => {
      const date = new Date(report.date);
      let groupKey: string;
      
      if (selectedPeriod === 'week') {
        // 週別（日付）
        groupKey = date.toISOString().split('T')[0];
      } else {
        // 月別（週単位）
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = weekStart.toISOString().split('T')[0];
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = { attendance: 0, absence: 0, revenue: 0 };
      }
      
      report.children.forEach(childReport => {
        if (childReport.arrival && childReport.departure) {
          groups[groupKey].attendance++;
          
          // 収益計算
          const arrivalTime = new Date(`2000-01-01T${childReport.arrival}`);
          const departureTime = new Date(`2000-01-01T${childReport.departure}`);
          const supportHours = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
          groups[groupKey].revenue += supportHours * 800;
          
          childReport.addOns.forEach(addOnId => {
            const addOn = addOns.find(a => a.addOnId === addOnId);
            if (addOn) {
              groups[groupKey].revenue += addOn.unitValue;
            }
          });
        } else {
          groups[groupKey].absence++;
        }
      });
    });
    
    return Object.entries(groups)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [periodReports, selectedPeriod, addOns]);

  return (
    <ModernLayout>
      <div className="slide-in">
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          <div>
            <h1 className="text-gradient" style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: '800',
              marginBottom: 'var(--space-2)',
            }}>
              📊 ダッシュボード
            </h1>
            <p style={{
              color: 'var(--neutral-600)',
              fontSize: 'var(--font-size-lg)',
            }}>
              事業所の運営状況とKPIを確認
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: 'var(--space-3) var(--space-4)' }}
            >
              📅 過去1週間
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: 'var(--space-3) var(--space-4)' }}
            >
              📅 過去1ヶ月
            </button>
          </div>
        </div>

        {/* KPIカード */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}>
          {/* 出席状況 */}
          <div className="card-glass bounce-in" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, var(--success-500), var(--success-400))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: 'var(--space-4)',
              }}>
                👥
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>出席状況</h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-size-sm)' }}>
                  {selectedPeriod === 'week' ? '過去1週間' : '過去1ヶ月'}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--success-600)' }}>
                  {kpis.totalAttendance}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>出席数</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--error-600)' }}>
                  {kpis.totalAbsence}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>欠席数</div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--success-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--success-700)' }}>
                {kpis.attendanceRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--success-600)' }}>出席率</div>
            </div>
          </div>

          {/* 収益情報 */}
          <div className="card-glass bounce-in" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: 'var(--space-4)',
              }}>
                💰
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>収益状況</h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-size-sm)' }}>
                  推定売上
                </p>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--primary-600)' }}>
                ¥{kpis.totalRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: 'var(--space-3)' }}>
                総売上
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>
                  {kpis.totalUnits.toFixed(1)}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>総単位数</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>
                  {kpis.averageSupportTime.toFixed(1)}h
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>平均支援時間</div>
              </div>
            </div>
          </div>

          {/* 稼働状況 */}
          <div className="card-glass bounce-in" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: 'var(--space-4)',
              }}>
                📈
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>稼働状況</h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-size-sm)' }}>
                  運営効率
                </p>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', color: 'var(--warning-600)' }}>
                {kpis.averageAttendancePerDay.toFixed(1)}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)', marginBottom: 'var(--space-3)' }}>
                日平均出席数
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>
                {kpis.totalDays}日
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>営業日数</div>
            </div>
          </div>

          {/* 人気アドオン */}
          <div className="card-glass bounce-in" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, var(--purple-500), var(--purple-400))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: 'var(--space-4)',
              }}>
                🏆
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>人気アドオン</h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-size-sm)' }}>
                  利用頻度TOP3
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {kpis.topAddOns.map((addOn, index) => (
                <div key={addOn.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-2)',
                  background: index === 0 ? 'var(--warning-50)' : 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                      {addOn.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--primary-600)' }}>
                    {addOn.count}回
                  </span>
                </div>
              ))}
              {kpis.topAddOns.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--neutral-500)', fontSize: 'var(--font-size-sm)' }}>
                  データがありません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* トレンドグラフ */}
        <div className="card-glass" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
            📊 トレンド分析
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(trendData.length, 7)}, 1fr)`,
            gap: 'var(--space-4)',
            marginTop: 'var(--space-4)',
          }}>
            {trendData.slice(-7).map((data) => {
              const total = data.attendance + data.absence;
              const attendanceHeight = total > 0 ? (data.attendance / total) * 100 : 0;
              const maxRevenue = Math.max(...trendData.map(d => d.revenue));
              const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 60 + 20 : 20;
              
              return (
                <div key={data.date} style={{ textAlign: 'center' }}>
                  <div style={{
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    marginBottom: 'var(--space-2)',
                    position: 'relative',
                  }}>
                    {/* 出席率バー */}
                    <div style={{
                      height: `${attendanceHeight}px`,
                      background: 'linear-gradient(to top, var(--success-500), var(--success-300))',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 'var(--space-1)',
                      minHeight: '2px',
                    }} />
                    {/* 収益バー */}
                    <div style={{
                      height: `${revenueHeight}px`,
                      background: 'linear-gradient(to top, var(--primary-500), var(--primary-300))',
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '2px',
                    }} />
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--neutral-600)' }}>
                    {new Date(data.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success-600)' }}>
                    {data.attendance}人
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary-600)' }}>
                    ¥{Math.round(data.revenue / 1000)}K
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: 'linear-gradient(135deg, var(--success-500), var(--success-300))',
                borderRadius: '2px',
              }} />
              <span>出席数</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-300))',
                borderRadius: '2px',
              }} />
              <span>収益 (千円)</span>
            </div>
          </div>
        </div>

        {/* アラート・通知 */}
        <div className="card-glass" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
            🔔 アラート・通知
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {kpis.attendanceRate < 80 && (
              <div style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, var(--warning-50), var(--warning-100))',
                border: '1px solid var(--warning-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--warning-700)' }}>出席率が低下しています</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--warning-600)' }}>
                    現在の出席率: {kpis.attendanceRate.toFixed(1)}% (目標: 80%以上)
                  </div>
                </div>
              </div>
            )}
            
            {kpis.averageAttendancePerDay < 2 && (
              <div style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, var(--error-50), var(--error-100))',
                border: '1px solid var(--error-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>🚨</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--error-700)' }}>稼働率が非常に低いです</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--error-600)' }}>
                    日平均出席数: {kpis.averageAttendancePerDay.toFixed(1)}人
                  </div>
                </div>
              </div>
            )}
            
            {kpis.attendanceRate >= 90 && (
              <div style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, var(--success-50), var(--success-100))',
                border: '1px solid var(--success-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--success-700)' }}>素晴らしい出席率です！</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--success-600)' }}>
                    出席率: {kpis.attendanceRate.toFixed(1)}% - 目標を大幅に上回っています
                  </div>
                </div>
              </div>
            )}
            
            {kpis.attendanceRate >= 80 && kpis.attendanceRate < 90 && kpis.averageAttendancePerDay >= 2 && (
              <div style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, var(--neutral-50), var(--neutral-100))',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--neutral-700)' }}>運営状況は良好です</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-600)' }}>
                    全ての指標が目標値を満たしています
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};