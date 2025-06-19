import React, { useState, useMemo } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import type { DailyReport, AddOnMaster } from '../types';
import '../styles/design-system.css';
import '../styles/glassmorphism-dashboard.css';

export const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const { data: reports } = useFirestore<DailyReport>('dailyReports');
  const { data: addOns } = useFirestore<AddOnMaster>('addOnMasters');
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');
  
  // 自分の事業所のデータのみフィルタ
  const orgReports = useMemo(() => {
    if (!userData?.orgId) return [];
    return reports.filter(report => report.orgId === userData.orgId);
  }, [reports, userData?.orgId]);

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
      <div className="dashboard-container">
        <div className="slide-in-up" style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          {/* ヘッダー */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
          }}>
            <div>
              <h1 className="glass-title" style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                📊 ダッシュボード
              </h1>
              <p className="glass-subtitle" style={{
                fontSize: '1.125rem',
              }}>
                事業所の運営状況とKPIを確認
              </p>
            </div>

            <div className="period-selector">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              >
                📅 過去1週間
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              >
                📅 過去1ヶ月
              </button>
            </div>
          </div>

          {/* KPIカードエリア - 2x2グリッド */}
          <div className="kpi-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            {/* 出席状況 */}
            <div className="kpi-card success glass-enhanced fade-in-scale">
              <div className="kpi-icon success">
                👥
              </div>
              <h3 className="glass-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                出席状況
              </h3>
              <p className="kpi-label" style={{ marginBottom: '1.5rem' }}>
                {selectedPeriod === 'week' ? '過去1週間' : '過去1ヶ月'}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div className="kpi-value" style={{ color: '#4ade80' }}>
                    {kpis.totalAttendance}
                  </div>
                  <div className="kpi-label">出席数</div>
                </div>
                <div>
                  <div className="kpi-value" style={{ color: '#f87171' }}>
                    {kpis.totalAbsence}
                  </div>
                  <div className="kpi-label">欠席数</div>
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(74, 222, 128, 0.1)', 
                borderRadius: '12px',
                border: '1px solid rgba(74, 222, 128, 0.2)'
              }}>
                <div className="kpi-value" style={{ fontSize: '1.75rem', color: '#4ade80' }}>
                  {kpis.attendanceRate.toFixed(1)}%
                </div>
                <div className="kpi-label">出席率</div>
              </div>
            </div>

            {/* 収益情報 */}
            <div className="kpi-card primary glass-enhanced fade-in-scale">
              <div className="kpi-icon primary">
                💰
              </div>
              <h3 className="glass-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                収益状況
              </h3>
              <p className="kpi-label" style={{ marginBottom: '1.5rem' }}>
                推定売上
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="kpi-value" style={{ color: '#60a5fa' }}>
                  ¥{kpis.totalRevenue.toLocaleString()}
                </div>
                <div className="kpi-label">総売上</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {kpis.totalUnits.toFixed(1)}
                  </div>
                  <div className="kpi-label">総単位数</div>
                </div>
                <div>
                  <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {kpis.averageSupportTime.toFixed(1)}h
                  </div>
                  <div className="kpi-label">平均支援時間</div>
                </div>
              </div>
            </div>

            {/* 稼働状況 */}
            <div className="kpi-card warning glass-enhanced fade-in-scale">
              <div className="kpi-icon warning">
                📈
              </div>
              <h3 className="glass-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                稼働状況
              </h3>
              <p className="kpi-label" style={{ marginBottom: '1.5rem' }}>
                運営効率
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="kpi-value" style={{ color: '#34d399' }}>
                  {kpis.averageAttendancePerDay.toFixed(1)}
                </div>
                <div className="kpi-label">日平均出席数</div>
              </div>
              
              <div>
                <div className="kpi-value" style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  {kpis.totalDays}日
                </div>
                <div className="kpi-label">営業日数</div>
              </div>
            </div>

            {/* 人気アドオン */}
            <div className="kpi-card info glass-enhanced fade-in-scale">
              <div className="kpi-icon info">
                🏆
              </div>
              <h3 className="glass-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                人気アドオン
              </h3>
              <p className="kpi-label" style={{ marginBottom: '1.5rem' }}>
                利用頻度TOP3
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {kpis.topAddOns.map((addOn, index) => (
                  <div key={addOn.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: index === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
                        {addOn.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#60a5fa' }}>
                      {addOn.count}回
                    </span>
                  </div>
                ))}
                {kpis.topAddOns.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                    データがありません
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メインコンテンツエリア - サイドバイサイド */}
          <div className="content-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            {/* トレンドグラフ */}
            <div className="chart-container glass-enhanced">
              <h3 className="glass-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                📊 トレンド分析
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '240px',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                marginTop: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {trendData.slice(-10).map((data) => {
                  const maxAttendance = Math.max(...trendData.map(d => d.attendance + d.absence));
                  const attendanceHeight = maxAttendance > 0 ? (data.attendance / maxAttendance) * 160 + 20 : 20;
                  const absenceHeight = maxAttendance > 0 ? (data.absence / maxAttendance) * 160 + 10 : 10;
                  const maxRevenue = Math.max(...trendData.map(d => d.revenue));
                  const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 180 + 20 : 20;
                  
                  return (
                    <div key={data.date} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '28px',
                        height: '180px',
                        marginBottom: '0.75rem',
                      }}>
                        {/* 収益バー（背景） */}
                        <div className="chart-bar" style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          width: '28px',
                          height: `${revenueHeight}px`,
                          background: 'linear-gradient(to top, rgba(96, 165, 250, 0.4), rgba(96, 165, 250, 0.2))',
                          borderRadius: '6px',
                          opacity: '0.7',
                        }} />
                        
                        {/* 出席バー */}
                        <div className="chart-bar" style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '6px',
                          width: '16px',
                          height: `${attendanceHeight}px`,
                          background: 'linear-gradient(to top, #4ade80, #22c55e)',
                          borderRadius: '4px',
                          zIndex: 2,
                          boxShadow: '0 4px 12px rgba(74, 222, 128, 0.4)',
                        }} />
                        
                        {/* 欠席バー */}
                        {data.absence > 0 && (
                          <div className="chart-bar" style={{
                            position: 'absolute',
                            bottom: `${attendanceHeight}px`,
                            left: '6px',
                            width: '16px',
                            height: `${absenceHeight}px`,
                            background: 'linear-gradient(to top, #f87171, #ef4444)',
                            borderRadius: '4px',
                            zIndex: 2,
                            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.4)',
                          }} />
                        )}
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '0.25rem',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        {new Date(data.date).toLocaleDateString('ja-JP', { 
                          month: 'numeric', 
                          day: 'numeric' 
                        })}
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#4ade80',
                        fontWeight: '700'
                      }}>
                        ✓{data.attendance}
                      </div>
                      
                      {data.absence > 0 && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#f87171',
                          fontWeight: '700'
                        }}>
                          ✗{data.absence}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                marginTop: '1.5rem',
                fontSize: '0.875rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(74, 222, 128, 0.4)',
                  }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>出席数</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #f87171, #ef4444)',
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(248, 113, 113, 0.4)',
                  }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>欠席数</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(96, 165, 250, 0.2))',
                    borderRadius: '2px',
                    boxShadow: '0 2px 4px rgba(96, 165, 250, 0.4)',
                  }} />
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>収益トレンド</span>
                </div>
              </div>
            </div>

            {/* アラート・通知 */}
            <div className="chart-container glass-enhanced">
              <h3 className="glass-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                🔔 アラート・通知
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {kpis.attendanceRate < 80 && (
                  <div className="alert-card warning">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>出席率が低下しています</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          現在の出席率: {kpis.attendanceRate.toFixed(1)}% (目標: 80%以上)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {kpis.averageAttendancePerDay < 2 && (
                  <div className="alert-card error">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚨</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>稼働率が非常に低いです</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          日平均出席数: {kpis.averageAttendancePerDay.toFixed(1)}人
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {kpis.attendanceRate >= 90 && (
                  <div className="alert-card success">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎉</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>素晴らしい出席率です！</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          出席率: {kpis.attendanceRate.toFixed(1)}% - 目標を大幅に上回っています
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {kpis.attendanceRate >= 80 && kpis.attendanceRate < 90 && kpis.averageAttendancePerDay >= 2 && (
                  <div className="alert-card info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>✅</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>運営状況は良好です</div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          全ての指標が目標値を満たしています
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 収益情報カード */}
                <div className="alert-card info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                    <div style={{ fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)' }}>今月の予測</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.25rem' }}>
                    月末予測売上: ¥{Math.round((kpis.totalRevenue / kpis.totalDays) * 22).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    予測出席数: {Math.round((kpis.totalAttendance / kpis.totalDays) * 22)}人
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};