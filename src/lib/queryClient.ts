import { QueryClient } from '@tanstack/react-query';
import { commerceEventBus } from '../shared/events/commerceEvents';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes (data remains fresh since events handle invalidation)
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection time
    },
  },
});

// Setup continuous live synchronization between Commerce Store events and React Query cache
if (typeof window !== 'undefined') {
  commerceEventBus.subscribe('ORDER_CREATED', () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  });

  commerceEventBus.subscribe('ORDER_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
  });

  commerceEventBus.subscribe('PRODUCT_CREATED', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['category-counts'] });
    queryClient.invalidateQueries({ queryKey: ['price-range'] });
    queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
  });

  commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['category-counts'] });
    queryClient.invalidateQueries({ queryKey: ['price-range'] });
    queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
  });

  commerceEventBus.subscribe('PRODUCT_DELETED', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['category-counts'] });
    queryClient.invalidateQueries({ queryKey: ['price-range'] });
    queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
  });

  commerceEventBus.subscribe('CATEGORY_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['category-counts'] });
  });

  commerceEventBus.subscribe('COLLECTION_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['collections'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });

  commerceEventBus.subscribe('INVENTORY_LOG_CREATED', () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });

  commerceEventBus.subscribe('REVIEW_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });

  commerceEventBus.subscribe('CUSTOMER_UPDATED', () => {
    queryClient.invalidateQueries({ queryKey: ['account'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
  });
}
