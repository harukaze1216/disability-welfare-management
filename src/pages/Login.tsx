import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // デモ用認証
    if (email === 'demo@hq.com' && password === 'demo12345') {
      try {
        // HQ管理者としてログイン
        await login(email, password);
      } catch (err) {
        setError('デモログインに失敗しました。');
      }
    } else if (email === 'demo@fc.com' && password === 'demo12345') {
      try {
        // FC管理者としてログイン
        await login(email, password);
      } catch (err) {
        setError('デモログインに失敗しました。');
      }
    } else {
      if (password.length < 8) {
        setError('パスワードは8文字以上で入力してください');
        setIsLoading(false);
        return;
      }

      try {
        await login(email, password);
      } catch (err) {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          フランチャイズ実績管理システム
        </h1>
        
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '2rem',
          fontSize: '0.9rem',
          border: '1px solid #90caf9'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1565c0' }}>
            📋 デモアカウント
          </div>
          <div style={{ marginBottom: '0.3rem' }}>
            <strong>HQ管理者:</strong> demo@hq.com / demo12345
          </div>
          <div>
            <strong>FC管理者:</strong> demo@fc.com / demo12345
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
};