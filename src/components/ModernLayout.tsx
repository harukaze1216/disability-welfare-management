import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/design-system.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: '📊', label: 'ダッシュボード', path: '/dashboard' },
    { icon: '📝', label: '日報入力', path: '/daily-reports' },
    { icon: '🏢', label: '事業所管理', path: '/organizations' },
    { icon: '👤', label: 'ユーザー管理', path: '/users' },
    { icon: '👥', label: '利用者管理', path: '/children' },
    { icon: '💰', label: '加算設定', path: '/addon-master' },
    { icon: '📈', label: 'レポート', path: '/reports' },
    { icon: '⚙️', label: '設定', path: '/settings' },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: '#1a1a1a',
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backdropFilter: 'blur(10px)',
      }}>
        {/* サイドバー */}
        <aside style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '2rem 0',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* グラデーションボーダー */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
            backgroundSize: '300% 100%',
            animation: 'gradientShift 6s ease-in-out infinite',
          }} />

          <div style={{
            padding: '0 2rem 2rem 2rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
            }}>
              FranchiseHQ
            </h1>
            <div style={{
              color: '#666',
              fontSize: '0.9rem',
              marginTop: '0.25rem',
            }}>
              実績管理システム
            </div>
          </div>

          <nav style={{ padding: '0 1rem' }}>
            {menuItems.map((item) => (
              <div key={item.path} style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '1rem 1.5rem',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? '#667eea' : '#555',
                    border: 'none',
                    borderRadius: '12px',
                    background: location.pathname === item.path 
                      ? 'rgba(102, 126, 234, 0.1)' 
                      : 'transparent',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: location.pathname === item.path ? 'translateX(8px)' : 'translateX(0)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#555';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '1rem',
                    fontSize: '1rem',
                    transition: 'transform 0.3s ease',
                  }}>
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              </div>
            ))}
          </nav>

          {/* ユーザー情報 */}
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '1rem',
            right: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '0.25rem',
            }}>
              {userData?.email}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#666',
              marginBottom: '1rem',
            }}>
              {userData?.role === 'HQ' ? 'HQ管理者' : 'FC管理者'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
              }}
            >
              ログアウト
            </button>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main style={{
          flex: 1,
          padding: '2rem 3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          minHeight: '100vh',
          overflowY: 'auto',
        }}>
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};