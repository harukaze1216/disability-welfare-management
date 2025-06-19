import React, { useState } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import type { Child, Organization } from '../types';
import '../styles/design-system.css';

export const ChildrenManagement: React.FC = () => {
  const { userData } = useAuth();
  const { data: children, loading, error, addData, updateData, deleteData } = useFirestore<Child>('children');
  const { data: organizations } = useFirestore<Organization>('organizations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    orgId: userData?.orgId || '',
    defaultPickup: false,
    defaultDrop: false
  });

  // Filter children based on user role
  const filteredChildren = userData?.role === 'HQ' 
    ? children 
    : children.filter(child => child.orgId === userData?.orgId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const childData = {
        ...formData,
        childId: editingChild?.childId || `child_${Date.now()}`,
        orgId: userData?.role === 'HQ' ? formData.orgId : userData?.orgId || ''
      };

      if (editingChild) {
        await updateData(editingChild.childId, childData);
      } else {
        await addData(childData);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('児童の保存に失敗しました:', error);
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      orgId: child.orgId,
      defaultPickup: child.defaultPickup,
      defaultDrop: child.defaultDrop
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (childId: string) => {
    if (window.confirm('この児童を削除してもよろしいですか？')) {
      try {
        await deleteData(childId);
      } catch (error) {
        console.error('児童の削除に失敗しました:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChild(null);
    setFormData({
      name: '',
      orgId: userData?.orgId || '',
      defaultPickup: false,
      defaultDrop: false
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
              在籍児童管理
            </h1>
            <p style={{
              color: 'var(--neutral-600)',
              fontSize: 'var(--font-size-lg)',
            }}>
              {userData?.role === 'HQ' ? '全事業所の' : '所属事業所の'}在籍児童の管理を行います
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
            <span style={{ fontSize: '1.25rem' }}>👶</span>
            新規児童追加
          </button>
        </div>

        {/* Stats Card */}
        <div className="card-glass fade-in" style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-2xl)',
          marginBottom: 'var(--space-8)',
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
              👶
            </div>
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: '700',
                color: 'var(--neutral-900)',
                marginBottom: 'var(--space-1)',
              }}>
                {filteredChildren.length}名
              </h3>
              <p style={{
                color: 'var(--neutral-600)',
                fontSize: 'var(--font-size-sm)',
              }}>
                在籍児童数
              </p>
            </div>
          </div>
        </div>

        {/* Children Grid */}
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
              在籍児童一覧
            </h2>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, var(--success-500), var(--success-300))',
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
              <h3 style={{ marginBottom: 'var(--space-2)' }}>児童が登録されていません</h3>
              <p>「新規児童追加」ボタンから最初の児童を追加してください。</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {filteredChildren.map((child) => (
                <div key={child.childId} className="card fade-in" style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '2px solid var(--success-200)',
                  transition: 'all var(--transition-normal)',
                }}>
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
                      background: 'linear-gradient(135deg, var(--success-200), var(--success-100))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      👶
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
                      {userData?.role === 'HQ' && (
                        <p style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--neutral-600)',
                        }}>
                          {getOrganizationName(child.orgId)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transport Info */}
                  <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h4 style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      color: 'var(--neutral-700)',
                      marginBottom: 'var(--space-3)',
                    }}>
                      送迎設定
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--space-3)',
                    }}>
                      <div style={{
                        padding: 'var(--space-3)',
                        background: child.defaultPickup ? 'var(--success-50)' : 'var(--neutral-50)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                        border: `2px solid ${child.defaultPickup ? 'var(--success-200)' : 'var(--neutral-200)'}`,
                      }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: 'var(--space-1)' }}>
                          {child.defaultPickup ? '🚐' : '🚫'}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600',
                          color: child.defaultPickup ? 'var(--success-700)' : 'var(--neutral-600)',
                        }}>
                          行き送迎
                        </div>
                      </div>
                      <div style={{
                        padding: 'var(--space-3)',
                        background: child.defaultDrop ? 'var(--success-50)' : 'var(--neutral-50)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                        border: `2px solid ${child.defaultDrop ? 'var(--success-200)' : 'var(--neutral-200)'}`,
                      }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: 'var(--space-1)' }}>
                          {child.defaultDrop ? '🏠' : '🚫'}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '600',
                          color: child.defaultDrop ? 'var(--success-700)' : 'var(--neutral-600)',
                        }}>
                          帰り送迎
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                      onClick={() => handleEdit(child)}
                      className="btn"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={() => handleDelete(child.childId)}
                      className="btn btn-danger"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
              ))}
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
                  {editingChild ? '児童情報編集' : '新規児童追加'}
                </h2>
                <div style={{
                  width: '40px',
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--success-500), var(--success-300))',
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
                    児童名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                    placeholder="山田 太郎"
                  />
                </div>

                {userData?.role === 'HQ' && (
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
                )}

                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: '600',
                    color: 'var(--neutral-700)',
                    marginBottom: 'var(--space-4)',
                  }}>
                    デフォルト送迎設定
                  </h3>
                  
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      cursor: 'pointer',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.defaultPickup}
                        onChange={(e) => setFormData({ ...formData, defaultPickup: e.target.checked })}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: 'var(--success-500)',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: '1.25rem' }}>🚐</span>
                        <span style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          color: 'var(--neutral-700)',
                        }}>
                          行き送迎を行う
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      cursor: 'pointer',
                      padding: 'var(--space-3)',
                      border: '2px solid var(--neutral-200)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)',
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.defaultDrop}
                        onChange={(e) => setFormData({ ...formData, defaultDrop: e.target.checked })}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: 'var(--success-500)',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: '1.25rem' }}>🏠</span>
                        <span style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: '600',
                          color: 'var(--neutral-700)',
                        }}>
                          帰り送迎を行う
                        </span>
                      </div>
                    </label>
                  </div>
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
                    className="btn btn-success"
                  >
                    {editingChild ? '更新' : '追加'}
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