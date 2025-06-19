import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { Layout } from '../components/Layout';
import type { Organization } from '../types';

export const OrganizationManagement: React.FC = () => {
  const { data: organizations, loading, error, addData, updateData, deleteData } = useFirestore<Organization>('organizations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    prefecture: '',
    address: '',
    facilityType: '児発' as Organization['facilityType'],
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orgData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      if (editingOrg) {
        await updateData(editingOrg.id!, orgData);
      } else {
        await addData(orgData);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('事業所の保存に失敗しました:', error);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      prefecture: org.prefecture,
      address: org.address,
      facilityType: org.facilityType,
      startDate: org.startDate instanceof Date ? org.startDate.toISOString().split('T')[0] : '',
      endDate: org.endDate instanceof Date ? org.endDate.toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('この事業所を削除してもよろしいですか？')) {
      try {
        await deleteData(id);
      } catch (error) {
        console.error('事業所の削除に失敗しました:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrg(null);
    setFormData({
      name: '',
      prefecture: '',
      address: '',
      facilityType: '児発',
      startDate: '',
      endDate: ''
    });
  };

  if (loading) return <Layout title="事業所管理"><div>読み込み中...</div></Layout>;
  if (error) return <Layout title="事業所管理"><div style={{ color: 'red' }}>エラー: {error}</div></Layout>;

  return (
    <Layout title="事業所管理">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div></div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          新規事業所追加
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>事業所名</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>都道府県</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>施設種別</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>開始日</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{org.name}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{org.prefecture}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>{org.facilityType}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                  {org.startDate instanceof Date ? org.startDate.toLocaleDateString() : org.startDate}
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>
                  <button
                    onClick={() => handleEdit(org)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(org.id!)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2>{editingOrg ? '事業所編集' : '新規事業所追加'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>事業所名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>都道府県</label>
                <input
                  type="text"
                  value={formData.prefecture}
                  onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>住所</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>施設種別</label>
                <select
                  value={formData.facilityType}
                  onChange={(e) => setFormData({ ...formData, facilityType: e.target.value as Organization['facilityType'] })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="児発">児童発達支援</option>
                  <option value="放デイ">放課後等デイサービス</option>
                  <option value="就労B">就労支援B型</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>開始日</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>終了日（任意）</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingOrg ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};