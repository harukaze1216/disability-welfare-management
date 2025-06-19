import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ModernLayout } from '../components/ModernLayout';
import '../styles/design-system.css';

export const Dashboard: React.FC = () => {
  const { userData } = useAuth();

  return (
    <ModernLayout>
      <div className="slide-in">
        {/* Page Header */}
        <div style={{
          marginBottom: 'var(--space-8)',
        }}>
          <h1 className="text-gradient" style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '800',
            marginBottom: 'var(--space-2)',
          }}>
            🏥 ダッシュボード
          </h1>
          <p style={{
            color: 'var(--neutral-600)',
            fontSize: 'var(--font-size-lg)',
          }}>
            {userData?.role === 'HQ' ? 'HQ管理者' : 'FC管理者'}として福祉管理システムにアクセスしています
          </p>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)',
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
                    12名
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
                  💰
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: '700',
                    color: 'var(--neutral-900)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    ¥45,600
                  </h3>
                  <p style={{
                    color: 'var(--neutral-600)',
                    fontSize: 'var(--font-size-sm)',
                  }}>
                    今日の売上
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
                  background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
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
                    4.2h
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
        </div>
      </div>
    </ModernLayout>
  );
};