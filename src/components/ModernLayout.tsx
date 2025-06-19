import React, { useState } from 'react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = userData?.role === 'HQ' ? [
    { icon: '📊', label: 'ダッシュボード', path: '/dashboard' },
    { icon: '🏢', label: '事業所管理', path: '/organizations' },
    { icon: '👥', label: 'ユーザー管理', path: '/users' },
    { icon: '💰', label: '加算マスタ', path: '/addon-master' },
    { icon: '👶', label: '在籍児童', path: '/children' },
    { icon: '📝', label: '日次実績', path: '/daily-reports' },
    { icon: '📈', label: 'レポート', path: '/reports' },
  ] : [
    { icon: '📊', label: 'ダッシュボード', path: '/dashboard' },
    { icon: '👶', label: '在籍児童', path: '/children' },
    { icon: '📝', label: '日次実績', path: '/daily-reports' },
    { icon: '📈', label: 'レポート', path: '/reports' },
  ];

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: sidebarCollapsed ? '80px' : '280px',
    background: 'linear-gradient(180deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    overflow: 'hidden',
  };

  const mainContentStyle: React.CSSProperties = {
    marginLeft: sidebarCollapsed ? '80px' : '280px',
    minHeight: '100vh',
    transition: 'margin-left 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, #f9fafb 0%, #eff6ff 100%)',
  };

  const headerStyle: React.CSSProperties = {
    height: '80px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  return (
    <div style={{ display: 'flex', fontFamily: 'var(--font-family-sans)' }}>
      {/* Modern Sidebar */}
      <div style={sidebarStyle}>
        {/* Logo Section */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #ffffff, #e0f2fe)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
          }}>
            🏥
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 style={{
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: 0,
                lineHeight: 1.2,
              }}>
                福祉管理
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                margin: 0,
              }}>
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarCollapsed ? '12px 24px' : '12px 24px',
                  background: isActive 
                    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
                    : 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  borderRight: isActive ? '3px solid white' : '3px solid transparent',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.25rem',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        {/* Modern Header */}
        <header style={headerStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1d4ed8',
            }}>
              {userData?.role === 'HQ' ? 'HQ管理者' : 'FC管理者'}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'rgba(107, 114, 128, 0.1)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: '#4b5563',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
              }}></div>
              {userData?.email}
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
              }}
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          padding: '2rem',
          minHeight: 'calc(100vh - 80px)',
        }}>
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};