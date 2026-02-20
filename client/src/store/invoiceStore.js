import { create } from 'zustand';

export const useInvoiceStore = create((set, get) => ({
  // State
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',       // 'all' | 'invoice' | 'estimate'
    status: 'all',     // 'all' | 'draft' | 'sent' | 'paid'
    sortBy: 'newest',  // 'newest' | 'oldest' | 'amount_high' | 'amount_low'
  },

  // Draft management (auto-save)
  draft: null,

  // === SETTERS ===
  setInvoices: (invoices) => set({ invoices }),
  setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  setFilters: (filterUpdate) => set((state) => ({
    filters: { ...state.filters, ...filterUpdate },
  })),

  resetFilters: () => set({
    filters: {
      search: '',
      type: 'all',
      status: 'all',
      sortBy: 'newest',
    },
  }),

  // === DRAFT AUTO-SAVE ===
  saveDraft: (draftData) => {
    set({ draft: draftData });
    try {
      localStorage.setItem('invoice-draft', JSON.stringify(draftData));
    } catch (e) {
      console.warn('Failed to save draft to localStorage:', e);
    }
  },

  loadDraft: () => {
    try {
      const saved = localStorage.getItem('invoice-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        set({ draft });
        return draft;
      }
    } catch (e) {
      console.warn('Failed to load draft from localStorage:', e);
    }
    return null;
  },

  clearDraft: () => {
    set({ draft: null });
    localStorage.removeItem('invoice-draft');
  },

  // === COMPUTED ===
  getFilteredInvoices: () => {
    const { invoices, filters } = get();
    if (!Array.isArray(invoices)) return [];
    let filtered = [...invoices];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.customer_name?.toLowerCase().includes(search) ||
          inv.invoice_number?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((inv) => inv.document_type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'amount_high':
        filtered.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
        break;
      case 'amount_low':
        filtered.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));
        break;
      default:
        break;
    }

    return filtered;
  },
}));
