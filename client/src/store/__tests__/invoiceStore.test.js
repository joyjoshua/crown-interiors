import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInvoiceStore } from '../../store/invoiceStore';

// Sample test data
const mockInvoices = [
  {
    id: '1',
    customer_name: 'Rajan Kumar',
    invoice_number: 'INV-001',
    document_type: 'invoice',
    status: 'paid',
    total_amount: 50000,
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: '2',
    customer_name: 'Priya Sharma',
    invoice_number: 'INV-002',
    document_type: 'invoice',
    status: 'sent',
    total_amount: 25000,
    created_at: '2025-12-15T10:00:00Z',
  },
  {
    id: '3',
    customer_name: 'Arun Moorthy',
    invoice_number: 'EST-001',
    document_type: 'estimate',
    status: 'draft',
    total_amount: 75000,
    created_at: '2025-12-20T10:00:00Z',
  },
];

describe('invoiceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useInvoiceStore.setState({
      invoices: [],
      currentInvoice: null,
      isLoading: false,
      error: null,
      filters: {
        search: '',
        type: 'all',
        status: 'all',
        sortBy: 'newest',
      },
      draft: null,
    });
  });

  describe('setters', () => {
    it('setInvoices sets the invoices array', () => {
      useInvoiceStore.getState().setInvoices(mockInvoices);
      expect(useInvoiceStore.getState().invoices).toEqual(mockInvoices);
    });

    it('setCurrentInvoice sets the current invoice', () => {
      useInvoiceStore.getState().setCurrentInvoice(mockInvoices[0]);
      expect(useInvoiceStore.getState().currentInvoice).toEqual(mockInvoices[0]);
    });

    it('setLoading sets the loading state', () => {
      useInvoiceStore.getState().setLoading(true);
      expect(useInvoiceStore.getState().isLoading).toBe(true);
    });

    it('setError sets the error state', () => {
      useInvoiceStore.getState().setError('Something went wrong');
      expect(useInvoiceStore.getState().error).toBe('Something went wrong');
    });
  });

  describe('setFilters', () => {
    it('updates individual filters', () => {
      useInvoiceStore.getState().setFilters({ search: 'Rajan' });
      expect(useInvoiceStore.getState().filters.search).toBe('Rajan');
      // Other filters should remain unchanged
      expect(useInvoiceStore.getState().filters.type).toBe('all');
    });

    it('updates multiple filters at once', () => {
      useInvoiceStore.getState().setFilters({ status: 'paid', type: 'invoice' });
      expect(useInvoiceStore.getState().filters.status).toBe('paid');
      expect(useInvoiceStore.getState().filters.type).toBe('invoice');
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to defaults', () => {
      useInvoiceStore.getState().setFilters({ search: 'test', status: 'paid' });
      useInvoiceStore.getState().resetFilters();
      expect(useInvoiceStore.getState().filters).toEqual({
        search: '',
        type: 'all',
        status: 'all',
        sortBy: 'newest',
      });
    });
  });

  describe('getFilteredInvoices', () => {
    beforeEach(() => {
      useInvoiceStore.getState().setInvoices(mockInvoices);
    });

    it('returns all invoices when no filters are applied', () => {
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(3);
    });

    it('filters by search (customer name)', () => {
      useInvoiceStore.getState().setFilters({ search: 'Rajan' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toBe('Rajan Kumar');
    });

    it('filters by search (invoice number)', () => {
      useInvoiceStore.getState().setFilters({ search: 'EST-001' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
      expect(result[0].invoice_number).toBe('EST-001');
    });

    it('search is case-insensitive', () => {
      useInvoiceStore.getState().setFilters({ search: 'rajan' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
    });

    it('filters by document type', () => {
      useInvoiceStore.getState().setFilters({ type: 'estimate' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
      expect(result[0].document_type).toBe('estimate');
    });

    it('filters by status', () => {
      useInvoiceStore.getState().setFilters({ status: 'paid' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('paid');
    });

    it('sorts by newest first (default)', () => {
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result[0].id).toBe('3'); // Dec 20
      expect(result[1].id).toBe('2'); // Dec 15
      expect(result[2].id).toBe('1'); // Dec 1
    });

    it('sorts by oldest first', () => {
      useInvoiceStore.getState().setFilters({ sortBy: 'oldest' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result[0].id).toBe('1'); // Dec 1
      expect(result[2].id).toBe('3'); // Dec 20
    });

    it('sorts by amount high to low', () => {
      useInvoiceStore.getState().setFilters({ sortBy: 'amount_high' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result[0].total_amount).toBe(75000);
      expect(result[2].total_amount).toBe(25000);
    });

    it('sorts by amount low to high', () => {
      useInvoiceStore.getState().setFilters({ sortBy: 'amount_low' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result[0].total_amount).toBe(25000);
      expect(result[2].total_amount).toBe(75000);
    });

    it('combines multiple filters', () => {
      useInvoiceStore.getState().setFilters({ type: 'invoice', status: 'paid' });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toBe('Rajan Kumar');
    });

    it('returns empty array when invoices is not an array', () => {
      useInvoiceStore.setState({ invoices: null });
      const result = useInvoiceStore.getState().getFilteredInvoices();
      expect(result).toEqual([]);
    });
  });

  describe('draft management', () => {
    const mockDraft = { customer_name: 'Test', services: [] };

    it('saveDraft saves to state and localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      useInvoiceStore.getState().saveDraft(mockDraft);
      expect(useInvoiceStore.getState().draft).toEqual(mockDraft);
      expect(setItemSpy).toHaveBeenCalledWith('invoice-draft', JSON.stringify(mockDraft));
      setItemSpy.mockRestore();
    });

    it('loadDraft loads from localStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockDraft));
      const result = useInvoiceStore.getState().loadDraft();
      expect(result).toEqual(mockDraft);
      expect(useInvoiceStore.getState().draft).toEqual(mockDraft);
      vi.restoreAllMocks();
    });

    it('loadDraft returns null when nothing is saved', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      const result = useInvoiceStore.getState().loadDraft();
      expect(result).toBeNull();
      vi.restoreAllMocks();
    });

    it('clearDraft clears state and localStorage', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      useInvoiceStore.getState().saveDraft(mockDraft);
      useInvoiceStore.getState().clearDraft();
      expect(useInvoiceStore.getState().draft).toBeNull();
      expect(removeItemSpy).toHaveBeenCalledWith('invoice-draft');
      removeItemSpy.mockRestore();
    });
  });
});
