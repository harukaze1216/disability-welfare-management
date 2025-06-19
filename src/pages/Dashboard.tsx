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

  return (
    <ModernLayout>
        {/* ヘッダー */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}>
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              実績ダッシュボード
            </h2>
            <div style={{
              color: '#666',
              fontSize: '0.9rem',
            }}>
              2025年6月19日 (木) 14:30 JST
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#667eea',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              📊 レポート出力
            </button>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}>
              ➕ 日報入力
            </button>
          </div>
        </header>

        {/* タブ */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '0.5rem',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
          <button
            onClick={() => setSelectedPeriod('week')}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              border: 'none',
              background: selectedPeriod === 'week' 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: selectedPeriod === 'week' ? 'white' : '#1a1a1a',
              boxShadow: selectedPeriod === 'week' ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
            }}
          >
            全体
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              border: 'none',
              background: selectedPeriod === 'month' 
                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                : 'transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              color: selectedPeriod === 'month' ? 'white' : '#1a1a1a',
              boxShadow: selectedPeriod === 'month' ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
            }}
          >
            児童発達支援
          </button>
          <button style={{
            flex: 1,
            padding: '1rem 2rem',
            border: 'none',
            background: 'transparent',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#1a1a1a',
          }}>
            放課後デイ
          </button>
          <button style={{
            flex: 1,
            padding: '1rem 2rem',
            border: 'none',
            background: 'transparent',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#1a1a1a',
          }}>
            事業所別
          </button>
        </div>

        {/* KPIカード */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderTop: '4px solid #667eea',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                本日売上
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
              }}>
                💰
              </div>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ¥{kpis.totalRevenue.toLocaleString()}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#10b981',
            }}>
              ↗️ +12.5% 前日比
            </div>
            <div style={{
              height: '60px',
              marginTop: '1rem',
              background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '60%',
                width: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                opacity: 0.3,
              }} />
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderTop: '4px solid #4ecdc4',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                利用児童数
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(78, 205, 196, 0.1)',
                color: '#4ecdc4',
              }}>
                👥
              </div>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {kpis.totalAttendance}人
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#10b981',
            }}>
              ↗️ +{kpis.totalAbsence}人 前日比
            </div>
            <div style={{
              height: '60px',
              marginTop: '1rem',
              background: 'linear-gradient(90deg, rgba(78, 205, 196, 0.1), rgba(68, 160, 141, 0.1))',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '70%',
                width: '100%',
                background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
                opacity: 0.3,
              }} />
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderTop: '4px solid #ff6b6b',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                平均稼働率
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b',
              }}>
                📊
              </div>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {kpis.attendanceRate.toFixed(1)}%
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#10b981',
            }}>
              ↗️ +2.1% 前月比
            </div>
            <div style={{
              height: '60px',
              marginTop: '1rem',
              background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 111, 0.1))',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '80%',
                width: '100%',
                background: 'linear-gradient(90deg, #ff6b6b, #ee5a6f)',
                opacity: 0.3,
              }} />
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderTop: '4px solid #feca57',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                加算取得率
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(254, 202, 87, 0.1)',
                color: '#feca57',
              }}>
                ⭐
              </div>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              91.2%
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#ef4444',
            }}>
              ↘️ -0.8% 前日比
            </div>
            <div style={{
              height: '60px',
              marginTop: '1rem',
              background: 'linear-gradient(90deg, rgba(254, 202, 87, 0.1), rgba(255, 159, 243, 0.1))',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '90%',
                width: '100%',
                background: 'linear-gradient(90deg, #feca57, #ff9ff3)',
                opacity: 0.3,
              }} />
            </div>
          </div>
        </div>

        {/* チャートセクション */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
              }}>
                売上推移
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
              }}>
                <button style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  background: selectedPeriod === 'week' ? '#667eea' : 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: selectedPeriod === 'week' ? 'white' : '#667eea',
                  transition: 'all 0.3s ease',
                }} onClick={() => setSelectedPeriod('week')}>
                  7日間
                </button>
                <button style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  background: selectedPeriod === 'month' ? '#667eea' : 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: selectedPeriod === 'month' ? 'white' : '#667eea',
                  transition: 'all 0.3s ease',
                }} onClick={() => setSelectedPeriod('month')}>
                  30日間
                </button>
                <button style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#667eea',
                  transition: 'all 0.3s ease',
                }}>
                  3ヶ月
                </button>
              </div>
            </div>
            <div style={{
              height: '300px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <svg width="100%" height="100%" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#667eea', stopOpacity: 0.1}} />
                  </linearGradient>
                </defs>
                <path d="M0,150 L50,120 L100,100 L150,80 L200,70 L250,85 L300,65 L350,50 L400,45" 
                      stroke="#667eea" strokeWidth="3" fill="none"/>
                <path d="M0,150 L50,120 L100,100 L150,80 L200,70 L250,85 L300,65 L350,50 L400,45 L400,200 L0,200 Z" 
                      fill="url(#gradient)"/>
              </svg>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
              }}>
                事業所稼働状況
              </h3>
            </div>
            <div style={{
              height: '300px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'conic-gradient(#667eea 0deg 140deg, #4ecdc4 140deg 220deg, #ff6b6b 220deg 300deg, #f0f0f0 300deg 360deg)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#667eea',
                  }}>
                    {kpis.attendanceRate.toFixed(1)}%
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    marginTop: '0.25rem',
                  }}>
                    平均稼働率
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* データテーブル */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
            }}>
              事業所別実績
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    事業所名
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    業態
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    本日利用者
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    稼働率
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    本日売上
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    ステータス
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ transition: 'all 0.3s ease' }}>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <strong>さくら児童発達支援センター</strong>
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    児童発達支援
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    {Math.floor(kpis.totalAttendance * 0.4)}人
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    93.3%
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    ¥{Math.floor(kpis.totalRevenue * 0.3).toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                    }}>
                      稼働中
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      詳細
                    </button>
                  </td>
                </tr>
                <tr style={{ transition: 'all 0.3s ease' }}>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <strong>ひまわり放課後デイ</strong>
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    放課後等デイサービス
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    {Math.floor(kpis.totalAttendance * 0.6)}人
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    87.5%
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    ¥{Math.floor(kpis.totalRevenue * 0.7).toLocaleString()}
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                    }}>
                      稼働中
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'left',
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      詳細
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </ModernLayout>
  );
};