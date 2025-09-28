import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export const useFilters = (data, initialFilters = {}) => {
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'date',
    searchTerm: '',
    dateRange: null,
    petId: null,
    ...initialFilters
  });

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Filter and sort data based on current filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }

    // Filter by pet ID
    if (filters.petId) {
      result = result.filter(item => item.pet_id === filters.petId);
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(item => {
        return (
          (item.pet_name && item.pet_name.toLowerCase().includes(searchLower)) ||
          (item.owner_name && item.owner_name.toLowerCase().includes(searchLower)) ||
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.appointment_type && item.appointment_type.toLowerCase().includes(searchLower)) ||
          (item.reason_for_visit && item.reason_for_visit.toLowerCase().includes(searchLower)) ||
          (item.invoice_number && item.invoice_number.toLowerCase().includes(searchLower)) ||
          (item.diagnosis && item.diagnosis.toLowerCase().includes(searchLower)) ||
          (item.treatment && item.treatment.toLowerCase().includes(searchLower))
        );
      });
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter(item => {
        const itemDate = new Date(item.appointment_date || item.record_date || item.invoice_date || item.created_at);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sort data
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.appointment_date || a.record_date || a.invoice_date || a.created_at);
          const dateB = new Date(b.appointment_date || b.record_date || b.invoice_date || b.created_at);
          return dateB - dateA; // Newest first
        
        case 'name':
          const nameA = (a.pet_name || a.name || '').toLowerCase();
          const nameB = (b.pet_name || b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        
        case 'priority':
          const priorityOrder = { critical: 3, high: 2, routine: 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;
          return priorityB - priorityA; // Highest priority first
        
        case 'amount':
          const amountA = a.total_amount || a.amount || 0;
          const amountB = b.total_amount || b.amount || 0;
          return amountB - amountA; // Highest amount first
        
        default:
          return 0;
      }
    });

    return result;
  }, [data, filters, debouncedSearchTerm]);

  // Update individual filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Update multiple filters at once
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      sortBy: 'date',
      searchTerm: '',
      dateRange: null,
      petId: null,
      ...initialFilters
    });
  };

  // Get filter counts for status badges
  const getFilterCounts = () => {
    const counts = {
      all: data.length,
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      paid: 0,
      overdue: 0
    };

    data.forEach(item => {
      if (item.status && counts.hasOwnProperty(item.status)) {
        counts[item.status]++;
      }
    });

    return counts;
  };

  return {
    filters,
    filteredData,
    updateFilter,
    updateFilters,
    resetFilters,
    getFilterCounts,
    // Expose individual filter setters for convenience
    setStatus: (status) => updateFilter('status', status),
    setSortBy: (sortBy) => updateFilter('sortBy', sortBy),
    setSearchTerm: (searchTerm) => updateFilter('searchTerm', searchTerm),
    setDateRange: (dateRange) => updateFilter('dateRange', dateRange),
    setPetId: (petId) => updateFilter('petId', petId)
  };
};