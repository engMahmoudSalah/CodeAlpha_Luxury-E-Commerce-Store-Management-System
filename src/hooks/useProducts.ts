import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { ProductFilters } from '../types';
import { commerceStore } from '../shared/store/commerceStore';

export function useProducts(filters: ProductFilters = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
    staleTime: 0,
  });
}

export function useProduct(id: number | string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    });
  }, [queryClient, id]);

  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? productApi.getProductById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
    staleTime: 0,
  });
}

export function useCategoryCounts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['category-counts'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['category-counts'],
    queryFn: () => productApi.getCategoryCounts(),
    staleTime: 0,
  });
}

export function usePriceRange() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['price-range'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['price-range'],
    queryFn: () => productApi.getPriceRange(),
    staleTime: 0,
  });
}

export function useSearchSuggestions(query: string) {
  const clean = query.trim();
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['search-suggestions', clean],
    queryFn: () => productApi.getSearchSuggestions(clean),
    enabled: clean.length >= 2,
    staleTime: 0,
  });
}
