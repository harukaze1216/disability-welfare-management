import React, { useState, useEffect } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import type { DailyReport, Child, AddOnMaster, ChildReport } from '../types';
import '../styles/design-system.css';

export const DailyReports: React.FC = () => {
  const { userData } = useAuth();
  const { data: reports, loading, addData, updateData } = useFirestore<DailyReport>('dailyReports');
  const { data: children } = useFirestore<Child>('children');
  const { data: addOns } = useFirestore<AddOnMaster>('addOnMaster');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ChildReport[]>([]);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childReportData, setChildReportData] = useState<ChildReport>({
    childId: '',
    arrival: '',
    departure: '',
    pickup: false,
    drop: false,
    addOns: []
  });

  // Filter children and reports based on user role
  const filteredChildren = userData?.role === 'HQ' 
    ? children 
    : children.filter(child => child.orgId === userData?.orgId);

  const currentReport = reports.find(report => 
    report.date === selectedDate && 
    (userData?.role === 'HQ' || report.orgId === userData?.orgId)
  );

  useEffect(() => {
    if (currentReport) {
      setReportData(currentReport.children);
    } else {
      // Initialize with all children for the date
      setReportData(filteredChildren.map(child => ({
        childId: child.childId,
        arrival: '',
        departure: '',
        pickup: child.defaultPickup,
        drop: child.defaultDrop,
        addOns: []
      })));
    }
  }, [selectedDate, currentReport, filteredChildren]);

  const handleChildClick = (child: Child) => {
    const existingReport = reportData.find(r => r.childId === child.childId);
    setSelectedChild(child);
    setChildReportData(existingReport || {
      childId: child.childId,
      arrival: '',
      departure: '',
      pickup: child.defaultPickup,
      drop: child.defaultDrop,
      addOns: []
    });
    setIsChildModalOpen(true);
  };

  const handleSaveChildReport = () => {
    setReportData(prev => {
      const filtered = prev.filter(r => r.childId !== childReportData.childId);
      return [...filtered, childReportData];
    });
    setIsChildModalOpen(false);
  };

  const handleSaveReport = async () => {
    try {
      const reportId = `${userData?.orgId}_${selectedDate}`;
      const report: DailyReport = {
        reportId,
        orgId: userData?.orgId || '',
        date: selectedDate,
        children: reportData.filter(r => r.arrival || r.departure) // Only save children with attendance
      };

      if (currentReport) {
        await updateData(currentReport.reportId, report);
      } else {
        await addData(report);
      }

      alert('日次実績を保存しました！');
    } catch (error) {
      console.error('日次実績の保存に失敗しました:', error);
      alert('保存に失敗しました。');
    }
  };

  const calculateSupportTime = (arrival?: string, departure?: string) => {
    if (!arrival || !departure) return 0;
    const arrivalTime = new Date(`2000-01-01T${arrival}`);
    const departureTime = new Date(`2000-01-01T${departure}`);
    const diff = departureTime.getTime() - arrivalTime.getTime();
    return Math.max(0, diff / (1000 * 60 * 60)); // Convert to hours
  };

  const getChildReport = (childId: string) => {
    return reportData.find(r => r.childId === childId);
  };


  const totalAttendance = reportData.filter(r => r.arrival || r.departure).length;
  const totalSupportTime = reportData.reduce((sum, r) => 
    sum + calculateSupportTime(r.arrival, r.departure), 0
  );
  const averageSupportTime = totalAttendance > 0 ? totalSupportTime / totalAttendance : 0;

  if (loading) {
    return (
      <ModernLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <div className="loading-spinner"></div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="slide-in">
        {/* Page Header */}
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
              日次実績入力
            </h1>
            <p style={{
              color: 'var(--neutral-600)',
              fontSize: 'var(--font-size-lg)',
            }}>
              児童の出欠・到着退室時刻・加算の管理を行います
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
              style={{ width: 'auto', padding: 'var(--space-3) var(--space-4)' }}
            />
            <button
              onClick={handleSaveReport}
              className="btn btn-primary"
              style={{
                padding: 'var(--space-4) var(--space-6)',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
              }}
            >
              💾 実績保存
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}>
          <div className="card-glass fade-in" style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-2xl)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-400))',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                👥
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {totalAttendance}名
                </h3>
                <p style={{
                  color: 'var(--neutral-600)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  今日の利用者数
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass fade-in" style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-2xl)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--success-500), var(--success-400))',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                ⏰
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {averageSupportTime.toFixed(1)}h
                </h3>
                <p style={{
                  color: 'var(--neutral-600)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  平均支援時間
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Children Attendance Grid */}
        <div className="card-glass slide-in" style={{ 
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-3xl)',
        }}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '700',
              color: 'var(--neutral-800)',
              marginBottom: 'var(--space-2)',
            }}>
              児童出欠管理
            </h2>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, var(--primary-500), var(--primary-300))',
              borderRadius: '2px',
            }}></div>
          </div>

          {filteredChildren.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              color: 'var(--neutral-500)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>👶</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>在籍児童がいません</h3>
              <p>先に児童管理から児童を登録してください。</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              {filteredChildren.map((child) => {
                const childReport = getChildReport(child.childId);
                const supportTime = calculateSupportTime(childReport?.arrival, childReport?.departure);
                const hasAttendance = !!(childReport?.arrival || childReport?.departure);
                
                return (
                  <div 
                    key={child.childId} 
                    className="card fade-in" 
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      border: hasAttendance 
                        ? '2px solid var(--success-300)'
                        : '2px solid var(--neutral-200)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-normal)',
                      background: hasAttendance 
                        ? 'linear-gradient(135deg, var(--success-50), white)'
                        : 'white',
                    }}
                    onClick={() => handleChildClick(child)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                  >
                    {/* Child Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-4)',
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: hasAttendance
                          ? 'linear-gradient(135deg, var(--success-400), var(--success-300))'
                          : 'linear-gradient(135deg, var(--neutral-300), var(--neutral-200))',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {hasAttendance ? '✅' : '👶'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: 'var(--font-size-lg)',
                          fontWeight: '700',
                          color: 'var(--neutral-900)',
                          marginBottom: 'var(--space-1)',
                        }}>
                          {child.name}
                        </h3>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: hasAttendance ? 'var(--success-600)' : 'var(--neutral-500)',
                          fontWeight: '600',
                        }}>
                          {hasAttendance ? '出席' : '未入力'}
                        </div>
                      </div>
                    </div>

                    {/* Time Display */}
                    {hasAttendance && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-4)',
                      }}>
                        <div style={{
                          padding: 'var(--space-2)',
                          background: 'var(--primary-50)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--primary-600)',
                            fontWeight: '600',
                            marginBottom: 'var(--space-1)',
                          }}>
                            到着
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '700',
                            color: 'var(--primary-700)',
                          }}>
                            {childReport?.arrival || '--:--'}
                          </div>
                        </div>
                        <div style={{
                          padding: 'var(--space-2)',
                          background: 'var(--warning-50)',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--warning-600)',
                            fontWeight: '600',
                            marginBottom: 'var(--space-1)',
                          }}>
                            退室
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: '700',
                            color: 'var(--warning-700)',
                          }}>
                            {childReport?.departure || '--:--'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Support Time */}
                    {supportTime > 0 && (
                      <div style={{
                        padding: 'var(--space-3)',
                        background: 'var(--success-100)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                        marginBottom: 'var(--space-4)',
                      }}>
                        <div style={{
                          fontSize: 'var(--font-size-lg)',
                          fontWeight: '700',
                          color: 'var(--success-700)',
                        }}>
                          {supportTime.toFixed(1)}時間
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--success-600)',
                        }}>
                          支援時間
                        </div>
                      </div>
                    )}

                    {/* Transport Status */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--space-2)',
                    }}>
                      <div style={{
                        padding: 'var(--space-2)',
                        background: childReport?.pickup ? 'var(--primary-50)' : 'var(--neutral-50)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: `1px solid ${childReport?.pickup ? 'var(--primary-200)' : 'var(--neutral-200)'}`,
                      }}>
                        <div style={{ fontSize: '1rem', marginBottom: 'var(--space-1)' }}>
                          {childReport?.pickup ? '🚐' : '🚫'}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600',
                          color: childReport?.pickup ? 'var(--primary-600)' : 'var(--neutral-500)',
                        }}>
                          行き
                        </div>
                      </div>
                      <div style={{
                        padding: 'var(--space-2)',
                        background: childReport?.drop ? 'var(--primary-50)' : 'var(--neutral-50)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: `1px solid ${childReport?.drop ? 'var(--primary-200)' : 'var(--neutral-200)'}`,
                      }}>
                        <div style={{ fontSize: '1rem', marginBottom: 'var(--space-1)' }}>
                          {childReport?.drop ? '🏠' : '🚫'}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600',
                          color: childReport?.drop ? 'var(--primary-600)' : 'var(--neutral-500)',
                        }}>
                          帰り
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Child Detail Modal */}
        {isChildModalOpen && selectedChild && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: 'var(--space-4)',
          }}>
            <div className="card bounce-in" style={{
              width: '100%',
              maxWidth: '600px',
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-3xl)',
              background: 'white',
              boxShadow: 'var(--shadow-2xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {selectedChild.name} - 実績入力
                </h2>
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--primary-500), var(--primary-300))',
                  borderRadius: '2px',
                }}></div>
              </div>

              {/* Time Inputs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                  }}>
                    到着時刻
                  </label>
                  <input
                    type="time"
                    value={childReportData.arrival}
                    onChange={(e) => setChildReportData({ ...childReportData, arrival: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                  }}>
                    退室時刻
                  </label>
                  <input
                    type="time"
                    value={childReportData.departure}
                    onChange={(e) => setChildReportData({ ...childReportData, departure: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Transport Checkboxes */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  color: 'var(--neutral-700)',
                  marginBottom: 'var(--space-4)',
                }}>
                  送迎設定
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    padding: 'var(--space-4)',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <input
                      type="checkbox"
                      checked={childReportData.pickup}
                      onChange={(e) => setChildReportData({ ...childReportData, pickup: e.target.checked })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: 'var(--primary-500)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '1.25rem' }}>🚐</div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--neutral-700)',
                      }}>
                        行き送迎
                      </div>
                    </div>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                    padding: 'var(--space-4)',
                    border: '2px solid var(--neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <input
                      type="checkbox"
                      checked={childReportData.drop}
                      onChange={(e) => setChildReportData({ ...childReportData, drop: e.target.checked })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: 'var(--primary-500)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '1.25rem' }}>🏠</div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--neutral-700)',
                      }}>
                        帰り送迎
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Add-ons */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  color: 'var(--neutral-700)',
                  marginBottom: 'var(--space-4)',
                }}>
                  随時加算
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}>
                  {addOns.filter(addon => !addon.isBasic).map((addon) => (
                    <label key={addon.addOnId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      cursor: 'pointer',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-lg)',
                    }}>
                      <input
                        type="checkbox"
                        checked={childReportData.addOns.includes(addon.addOnId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setChildReportData({
                              ...childReportData,
                              addOns: [...childReportData.addOns, addon.addOnId]
                            });
                          } else {
                            setChildReportData({
                              ...childReportData,
                              addOns: childReportData.addOns.filter(id => id !== addon.addOnId)
                            });
                          }
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: 'var(--success-500)',
                        }}
                      />
                      <div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          color: 'var(--neutral-700)',
                        }}>
                          {addon.name}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--neutral-500)',
                        }}>
                          {addon.unitValue}単位
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-4)',
              }}>
                <button
                  onClick={() => setIsChildModalOpen(false)}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveChildReport}
                  className="btn btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
};