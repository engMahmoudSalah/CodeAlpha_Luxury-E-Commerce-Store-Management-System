import { useState, useCallback, useEffect } from 'react';
import { PaginatedResult, FilterParams } from '../types';
import { useDebounce } from './useDebounce';

interface UseDataTableOptions<T, F extends FilterParams = FilterParams> {
  fetchData: (params: F) => Promise<PaginatedResult<T>>;
  initialParams?: Partial<F>;
  initialPageSize?: number;
  autoFetch?: boolean;
}

export function useDataTable<T extends { id: string | number }, F extends FilterParams = FilterParams>({
  fetchData,
  initialParams = {},
  initialPageSize = 10,
  autoFetch = true,
}: UseDataTableOptions<T, F>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [sortBy, setSortBy] = useState<string | undefined>(initialParams.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(initialParams.sortOrder);
  const [filters, setFilters] = useState<Partial<F>>(initialParams);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Fetch Execution
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        ...filters,
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      } as F;

      const result = await fetchData(queryParams);
      const items = result.data || result.items || [];
      setData(items);
      setTotalCount(result.pagination?.total ?? result.totalCount ?? items.length);
      setTotalPages(result.pagination?.totalPages ?? result.totalPages ?? 1);
    } catch (err: unknown) {
      console.error('Error fetching data for table:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [fetchData, filters, page, limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    if (autoFetch) {
      loadData();
    }
  }, [loadData, autoFetch]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const updateFilter = (key: keyof F, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialParams);
    setSearchQuery('');
    setSortBy(undefined);
    setSortOrder(undefined);
    setPage(1);
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    totalCount,
    totalPages,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    filters,
    updateFilter,
    resetFilters,
    selectedIds,
    setSelectedIds,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    isAllSelected: data.length > 0 && selectedIds.length === data.length,
    isSomeSelected: selectedIds.length > 0 && selectedIds.length < data.length,
    refresh: loadData,
  };
}
