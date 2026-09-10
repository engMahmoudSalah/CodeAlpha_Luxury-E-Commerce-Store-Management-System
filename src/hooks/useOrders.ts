import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { CreateOrderPayload } from '../types';
import { commerceStore } from '../shared/store/commerceStore';

export function useOrders(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
    enabled,
    staleTime: 0,
  });
}

export function useOrder(id: number | string | undefined, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['trackOrder', id] });
    });
  }, [queryClient, id]);

  return useQuery({
    queryKey: ['order', id],
    queryFn: () => (id ? orderApi.getOrderById(id) : Promise.reject('No Order ID')),
    enabled: enabled && !!id,
    staleTime: 0,
  });
}

export function useTrackOrder(orderId: number | string | undefined, enabled = false) {
  const queryClient = useQueryClient();

  useEffect(() => {
    return commerceStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['trackOrder', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    });
  }, [queryClient, orderId]);

  return useQuery({
    queryKey: ['trackOrder', orderId],
    queryFn: () => (orderId ? orderApi.trackOrder(orderId) : Promise.reject('No Order ID')),
    enabled: enabled && !!orderId,
    retry: false,
    staleTime: 0,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
