import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <h1>ダッシュボード</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>
            {userData?.role === 'HQ' ? 'HQ管理者' : 'FC管理者'} - {userData?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {userData?.role === 'HQ' ? (
          <>
            <div style={{ 
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2>HQ管理者メニュー</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', cursor: 'pointer' }}>
                  事業所管理
                </button>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', cursor: 'pointer' }}>
                  ユーザー管理
                </button>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', cursor: 'pointer' }}>
                  加算マスタ管理
                </button>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', cursor: 'pointer' }}>
                  全体ダッシュボード
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2>FC管理者メニュー</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #28a745', backgroundColor: 'white', color: '#28a745', cursor: 'pointer' }}>
                  日報入力
                </button>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #28a745', backgroundColor: 'white', color: '#28a745', cursor: 'pointer' }}>
                  在籍児童管理
                </button>
                <button style={{ padding: '1rem', borderRadius: '4px', border: '1px solid #28a745', backgroundColor: 'white', color: '#28a745', cursor: 'pointer' }}>
                  事業所ダッシュボード
                </button>
              </div>
            </div>
          </>
        )}
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>今日の実績（サンプル）</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>12</div>
              <div>今日の利用者数</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>¥45,600</div>
              <div>今日の売上</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>4.2h</div>
              <div>平均支援時間</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};