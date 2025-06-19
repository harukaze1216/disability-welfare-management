import React, { useState } from 'react';
import { ModernLayout } from '../components/ModernLayout';
import { useFirestore } from '../hooks/useFirestore';
import type { AddOnMaster } from '../types';
import '../styles/design-system.css';

export const AddOnMasterPage: React.FC = () => {
  const { data: addOns, loading, error, addData, updateData, deleteData } = useFirestore<AddOnMaster>('addOnMaster');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOnMaster | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unitValue: 0,
    isBasic: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addOnData = {
        ...formData,
        addOnId: editingAddOn?.addOnId || `addon_${Date.now()}`
      };

      if (editingAddOn) {
        await updateData(editingAddOn.addOnId, addOnData);
      } else {
        await addData(addOnData);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('加算の保存に失敗しました:', error);
    }
  };

  const handleEdit = (addOn: AddOnMaster) => {
    setEditingAddOn(addOn);
    setFormData({
      name: addOn.name,
      unitValue: addOn.unitValue,
      isBasic: addOn.isBasic
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (addOnId: string) => {
    if (window.confirm('この加算を削除してもよろしいですか？')) {
      try {
        await deleteData(addOnId);
      } catch (error) {
        console.error('加算の削除に失敗しました:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddOn(null);
    setFormData({
      name: '',
      unitValue: 0,
      isBasic: false
    });
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

  const basicAddOns = addOns.filter(addon => addon.isBasic);
  const optionalAddOns = addOns.filter(addon => !addon.isBasic);

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
              加算マスタ管理
            </h1>
            <p style={{
              color: 'var(--neutral-600)',
              fontSize: 'var(--font-size-lg)',
            }}>
              基本加算と随時加算の設定・管理を行います
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
            <span style={{ fontSize: '1.25rem' }}>💰</span>
            新規加算追加
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
                🏷️
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {basicAddOns.length}
                </h3>
                <p style={{
                  color: 'var(--neutral-600)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  基本加算
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
                ⭐
              </div>
              <div>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--neutral-900)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {optionalAddOns.length}
                </h3>
                <p style={{
                  color: 'var(--neutral-600)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  随時加算
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Add-ons Section */}
        <div className="card-glass slide-in" style={{ 
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-3xl)',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '700',
              color: 'var(--neutral-800)',
              marginBottom: 'var(--space-2)',
            }}>
              🏷️ 基本加算
            </h2>
            <p style={{ color: 'var(--neutral-600)', marginBottom: 'var(--space-4)' }}>
              常時適用される基本的な加算項目
            </p>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, var(--primary-500), var(--primary-300))',
              borderRadius: '2px',
            }}></div>
          </div>

          {basicAddOns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--neutral-500)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🏷️</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>基本加算が登録されていません</h3>
              <p>新規加算を追加して基本加算を設定してください。</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              {basicAddOns.map((addOn) => (
                <div key={addOn.addOnId} className="card fade-in" style={{
                  padding: 'var(--space-5)',
                  border: '2px solid var(--primary-200)',
                  borderRadius: 'var(--radius-xl)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-4)',
                  }}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '600',
                      color: 'var(--neutral-900)',
                    }}>
                      {addOn.name}
                    </h3>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600',
                    }}>
                      基本
                    </span>
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: '700',
                    color: 'var(--primary-600)',
                    marginBottom: 'var(--space-4)',
                  }}>
                    {addOn.unitValue.toLocaleString()}単位
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => handleEdit(addOn)}
                      className="btn"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(addOn.addOnId)}
                      className="btn btn-danger"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Add-ons Section */}
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
              ⭐ 随時加算
            </h2>
            <p style={{ color: 'var(--neutral-600)', marginBottom: 'var(--space-4)' }}>
              児童ごとに個別に選択する加算項目
            </p>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, var(--success-500), var(--success-300))',
              borderRadius: '2px',
            }}></div>
          </div>

          {optionalAddOns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--neutral-500)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⭐</div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>随時加算が登録されていません</h3>
              <p>新規加算を追加して随時加算を設定してください。</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              {optionalAddOns.map((addOn) => (
                <div key={addOn.addOnId} className="card fade-in" style={{
                  padding: 'var(--space-5)',
                  border: '2px solid var(--success-200)',
                  borderRadius: 'var(--radius-xl)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-4)',
                  }}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '600',
                      color: 'var(--neutral-900)',
                    }}>
                      {addOn.name}
                    </h3>
                    <span style={{
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--success-100)',
                      color: 'var(--success-700)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '600',
                    }}>
                      随時
                    </span>
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: '700',
                    color: 'var(--success-600)',
                    marginBottom: 'var(--space-4)',
                  }}>
                    {addOn.unitValue.toLocaleString()}単位
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => handleEdit(addOn)}
                      className="btn"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(addOn.addOnId)}
                      className="btn btn-danger"
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--font-size-sm)',
                        flex: 1,
                      }}
                    >
                      削除
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
                  {editingAddOn ? '加算編集' : '新規加算追加'}
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
                    加算名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                    placeholder="例：療育支援加算"
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
                    単位数
                  </label>
                  <input
                    type="number"
                    value={formData.unitValue}
                    onChange={(e) => setFormData({ ...formData, unitValue: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    className="input"
                    placeholder="100"
                  />
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
                      checked={formData.isBasic}
                      onChange={(e) => setFormData({ ...formData, isBasic: e.target.checked })}
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
                      基本加算（常時適用）
                    </span>
                  </label>
                  <p style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--neutral-500)',
                  }}>
                    チェックを外すと随時加算として設定されます
                  </p>
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
                    {editingAddOn ? '更新' : '追加'}
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