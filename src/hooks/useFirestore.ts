import { useState, useEffect } from 'react';
import { 
  demoOrganizations, 
  demoUsers, 
  demoAddOnMasters, 
  demoChildren, 
  demoDailyReports 
} from '../data/demoData';

interface FirestoreItem {
  id?: string;
  [key: string]: any;
}

// デモデータのマップ
const demoDataMap: Record<string, any[]> = {
  'organizations': demoOrganizations,
  'users': demoUsers,
  'addOnMasters': demoAddOnMasters,
  'children': demoChildren,
  'dailyReports': demoDailyReports
};

export const useFirestore = <T extends FirestoreItem>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // デモデータを取得
      const demoData = demoDataMap[collectionName] || [];
      setData(demoData as T[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addData = async (newData: Omit<T, 'id'>) => {
    try {
      const id = `${collectionName}-${Date.now()}`;
      const newItem = { id, ...newData } as T;
      
      // メモリ内でデータを追加
      demoDataMap[collectionName] = [...(demoDataMap[collectionName] || []), newItem];
      setData(prev => [...prev, newItem]);
      
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの追加に失敗しました');
      throw err;
    }
  };

  const updateData = async (id: string, updatedData: Partial<Omit<T, 'id'>>) => {
    try {
      // メモリ内でデータを更新
      demoDataMap[collectionName] = demoDataMap[collectionName].map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      );
      
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの更新に失敗しました');
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      // メモリ内でデータを削除
      demoDataMap[collectionName] = demoDataMap[collectionName].filter(item => item.id !== id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの削除に失敗しました');
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionName]);

  return {
    data,
    loading,
    error,
    fetchData,
    addData,
    updateData,
    deleteData,
    refetch: fetchData
  };
};