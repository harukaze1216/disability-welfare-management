import React, { useState } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import type { User, Organization } from '../types';
import '../styles/design-system.css';

export const UserManagement: React.FC = () => {
  const { data: users, loading, error, addData, updateData, deleteData } = useFirestore<User>('users');
  const { data: organizations } = useFirestore<Organization>('organizations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    orgId: '',
    role: 'FC' as User['role'],
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        uid: editingUser?.uid || `user_${Date.now()}`
      };

      if (editingUser) {
        await updateData(editingUser.uid, userData);
      } else {
        await addData(userData);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('ユーザーの保存に失敗しました:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      orgId: user.orgId,
      role: user.role,
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('このユーザーを削除してもよろしいですか？')) {
      try {
        await deleteData(uid);
      } catch (error) {
        console.error('ユーザーの削除に失敗しました:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      orgId: '',
      role: 'FC',
      isActive: true
    });
  };

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId || o.orgId === orgId);
    return org?.name || '不明';
  };

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

  if (error) {
    return (
      <ModernLayout>
        <div className="card" style={{ 
          padding: '2rem', 
          background: 'linear-gradient(135deg, var(--error-50), var(--error-100))',
          border: '1px solid var(--error-200)',
          color: 'var(--error-700)'
        }}>
          <h2>⚠️ エラーが発生しました</h2>
          <p>{error}</p>
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
              ユーザー管理
            </h1>
            <p style={{
              color: 'var(--neutral-600)',
              fontSize: 'var(--font-size-lg)',
            }}>
              システムユーザーの追加・編集・削除を行います
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary bounce-in"
            style={{
              padding: 'var(--space-4) var(--space-6)',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>👤</span>
            新規ユーザー追加
          </button>
        </div>

        {/* Users Table */}
        <div className="card-glass" style={{ 
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
              登録ユーザー一覧
            </h2>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, var(--primary-500), var(--primary-300))',
              borderRadius: '2px',
            }}></div>
          </div>

          {users.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-12)',
              color: 'var(--neutral-500)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>👥</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>ユーザーが登録されていません</h3>
              <p>「新規ユーザー追加」ボタンから最初のユーザーを追加してください。</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>メールアドレス</th>
                    <th>所属事業所</th>
                    <th>権限</th>
                    <th>ステータス</th>
                    <th style={{ width: '150px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="fade-in">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                          }}>
                            👤
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--neutral-900)' }}>
                              {user.email}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--neutral-500)' }}>
                              ID: {user.uid}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{getOrganizationName(user.orgId)}</td>
                      <td>
                        <span style={{
                          padding: 'var(--space-1) var(--space-3)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          background: user.role === 'HQ' 
                            ? 'linear-gradient(135deg, var(--primary-100), var(--primary-200))'
                            : 'linear-gradient(135deg, var(--success-100), var(--success-200))',
                          color: user.role === 'HQ' ? 'var(--primary-700)' : 'var(--success-700)',
                        }}>
                          {user.role === 'HQ' ? 'HQ管理者' : 'FC管理者'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: 'var(--space-1) var(--space-3)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          background: user.isActive 
                            ? 'linear-gradient(135deg, var(--success-100), var(--success-200))'
                            : 'linear-gradient(135deg, var(--neutral-100), var(--neutral-200))',
                          color: user.isActive ? 'var(--success-700)' : 'var(--neutral-600)',
                        }}>
                          {user.isActive ? '有効' : '無効'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn"
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
                              color: 'white',
                              fontSize: 'var(--font-size-sm)',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(user.uid)}
                            className="btn btn-danger"
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              fontSize: 'var(--font-size-sm)',
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modern Modal */}
        {isModalOpen && (
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
              maxWidth: '500px',
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-3xl)',
              background: 'white',
              boxShadow: 'var(--shadow-2xl)',
            }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {editingUser ? 'ユーザー編集' : '新規ユーザー追加'}
                </h2>
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--primary-500), var(--primary-300))',
                  borderRadius: '2px',
                }}></div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                  }}>
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input"
                    placeholder="user@example.com"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                  }}>
                    所属事業所
                  </label>
                  <select
                    value={formData.orgId}
                    onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                    required
                    className="input"
                  >
                    <option value="">事業所を選択してください</option>
                    {organizations.map((org) => (
                      <option key={org.id || org.orgId} value={org.id || org.orgId}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                  }}>
                    権限
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="input"
                  >
                    <option value="FC">FC管理者</option>
                    <option value="HQ">HQ管理者</option>
                  </select>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: 'var(--primary-500)',
                      }}
                    />
                    <span style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      color: 'var(--neutral-700)',
                    }}>
                      アクティブユーザー
                    </span>
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-4)',
                }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingUser ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
};