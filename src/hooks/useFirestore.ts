import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  QueryConstraint
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FirestoreItem extends DocumentData {
  id?: string;
}

export const useFirestore = <T extends FirestoreItem>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (constraints: QueryConstraint[] = []) => {
    try {
      setLoading(true);
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addData = async (newData: Omit<T, 'id'>) => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, newData);
      const newItem = { id: docRef.id, ...newData } as T;
      setData(prev => [...prev, newItem]);
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの追加に失敗しました');
      throw err;
    }
  };

  const updateData = async (id: string, updatedData: Partial<Omit<T, 'id'>>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedData);
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
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
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