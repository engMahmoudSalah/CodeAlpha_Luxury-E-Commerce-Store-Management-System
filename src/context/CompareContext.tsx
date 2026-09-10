import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const COMPARE_STORAGE_KEY = 'luxestore_compare';
const MAX_COMPARE_ITEMS = 4;

interface CompareContextType {
  compareList: number[];
  isInCompare: (productId: number) => boolean;
  toggleCompare: (productId: number) => boolean;
  addToCompare: (productId: number) => boolean;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function readStoredCompare(): number[] {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean).slice(0, MAX_COMPARE_ITEMS) : [];
  } catch {
    return [];
  }
}

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<number[]>(readStoredCompare);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
    } catch {}
  }, [compareList]);

  const isInCompare = useCallback((productId: number) => {
    return compareList.includes(Number(productId));
  }, [compareList]);

  const addToCompare = useCallback((productId: number): boolean => {
    const pId = Number(productId);
    if (!pId) return false;

    if (compareList.includes(pId)) return true;

    if (compareList.length >= MAX_COMPARE_ITEMS) {
      showToast(`Comparison list full (maximum ${MAX_COMPARE_ITEMS} items).`, 'warning');
      return false;
    }

    setCompareList(prev => [...prev, pId]);
    showToast('Added to comparison matrix', 'success');
    return true;
  }, [compareList, showToast]);

  const removeFromCompare = useCallback((productId: number) => {
    const pId = Number(productId);
    setCompareList(prev => prev.filter(id => id !== pId));
    showToast('Removed from comparison', 'info');
  }, [showToast]);

  const toggleCompare = useCallback((productId: number): boolean => {
    const pId = Number(productId);
    if (!pId) return false;

    if (compareList.includes(pId)) {
      removeFromCompare(pId);
      return false;
    } else {
      return addToCompare(pId);
    }
  }, [compareList, removeFromCompare, addToCompare]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        isInCompare,
        toggleCompare,
        addToCompare,
        removeFromCompare,
        clearCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export function useCompare(): CompareContextType {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return ctx;
}
