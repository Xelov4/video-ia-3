/**
 * Hook pour la gestion universelle des filtres de recherche
 * Gère l'état, la synchronisation URL, localStorage et les API calls
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import type {
  FilterState,
  SearchFiltersMetadata,
  UseSearchFiltersOptions,
  UseSearchFiltersReturn,
} from '@/src/types/search';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  tags: [],
  featured: '',
  status: '',
  qualityScore: '',
  toolCount: '',
  hasTools: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export function useSearchFilters(
  options: UseSearchFiltersOptions
): UseSearchFiltersReturn {
  const {
    context,
    initialFilters = {},
    enableUrlSync = true,
    enableLocalStorage = true,
    debounceMs = 300,
    onFiltersChange,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // État des filtres
  const [filters, setFilters] = useState<FilterState>(() => {
    const merged = { ...DEFAULT_FILTERS, ...initialFilters };

    // Charger depuis l'URL si activé
    if (enableUrlSync && searchParams) {
      Object.keys(merged).forEach(key => {
        const value = searchParams.get(key);
        if (value !== null) {
          if (key === 'tags') {
            merged[key] = value.split(',').filter(Boolean);
          } else {
            merged[key] = value;
          }
        }
      });
    }

    // Charger depuis localStorage si activé
    if (enableLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`searchFilters_${context}`);
        if (stored) {
          const parsedStored = JSON.parse(stored);
          Object.assign(merged, parsedStored);
        }
      } catch (error) {
        console.warn('Error loading filters from localStorage:', error);
      }
    }

    return merged;
  });

  // Métadonnées et état de chargement
  const [metadata, setMetadata] = useState<SearchFiltersMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les métadonnées depuis l'API
  const fetchMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metadata?context=${context}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMetadata(data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(
        err instanceof Error ? err.message : 'Erreur de chargement des métadonnées'
      );
    } finally {
      setLoading(false);
    }
  }, [context]);

  // Charger les métadonnées au montage
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Sauvegarder dans localStorage
  const saveToLocalStorage = useCallback(
    (newFilters: FilterState) => {
      if (!enableLocalStorage || typeof window === 'undefined') return;

      try {
        localStorage.setItem(`searchFilters_${context}`, JSON.stringify(newFilters));
      } catch (error) {
        console.warn('Error saving filters to localStorage:', error);
      }
    },
    [context, enableLocalStorage]
  );

  // Synchroniser avec l'URL
  const syncToUrl = useCallback(
    (newFilters: FilterState) => {
      if (!enableUrlSync) return;

      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else if (value !== DEFAULT_FILTERS[key as keyof FilterState]) {
            params.set(key, value.toString());
          }
        }
      });

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      router.push(newUrl, { scroll: false });
    },
    [router, enableUrlSync]
  );

  // Callback debouncé pour les changements
  const debouncedOnChange = useDebouncedCallback((newFilters: FilterState) => {
    saveToLocalStorage(newFilters);
    syncToUrl(newFilters);
    onFiltersChange?.(newFilters);
  }, debounceMs);

  // Action: Mettre à jour un filtre
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | string[]) => {
      setFilters(prev => {
        const newFilters = { ...prev, [key]: value };

        // Réinitialiser la page si on change les filtres
        if (key !== 'sortBy' && key !== 'sortOrder') {
          delete newFilters.page;
        }

        debouncedOnChange(newFilters);
        return newFilters;
      });
    },
    [debouncedOnChange]
  );

  // Action: Mettre à jour plusieurs filtres
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      setFilters(prev => {
        const newFilters = { ...prev, ...updates };

        // Réinitialiser la page si on change les filtres
        const hasContentChange = Object.keys(updates).some(
          key => key !== 'sortBy' && key !== 'sortOrder' && key !== 'page'
        );
        if (hasContentChange) {
          delete newFilters.page;
        }

        debouncedOnChange(newFilters);
        return newFilters;
      });
    },
    [debouncedOnChange]
  );

  // Action: Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    const resetState = { ...DEFAULT_FILTERS, ...initialFilters };
    setFilters(resetState);

    // Sauvegarder et synchroniser immédiatement
    saveToLocalStorage(resetState);
    syncToUrl(resetState);
    onFiltersChange?.(resetState);
  }, [initialFilters, saveToLocalStorage, syncToUrl, onFiltersChange]);

  // Action: Appliquer les filtres (pour forcer le déclenchement)
  const applyFilters = useCallback(() => {
    saveToLocalStorage(filters);
    syncToUrl(filters);
    onFiltersChange?.(filters);
  }, [filters, saveToLocalStorage, syncToUrl, onFiltersChange]);

  // Action: Charger depuis l'URL
  const loadFromUrl = useCallback(() => {
    if (!enableUrlSync || !searchParams) return;

    const newFilters = { ...filters };
    let hasChanges = false;

    Object.keys(DEFAULT_FILTERS).forEach(key => {
      const value = searchParams.get(key);
      if (value !== null) {
        if (key === 'tags') {
          newFilters[key] = value.split(',').filter(Boolean);
        } else {
          newFilters[key] = value;
        }
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFilters(newFilters);
      saveToLocalStorage(newFilters);
      onFiltersChange?.(newFilters);
    }
  }, [filters, searchParams, enableUrlSync, saveToLocalStorage, onFiltersChange]);

  // Action: Nettoyer l'URL
  const clearUrl = useCallback(() => {
    if (enableUrlSync) {
      router.push(window.location.pathname, { scroll: false });
    }
  }, [router, enableUrlSync]);

  // Calculer les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key as keyof FilterState];
      if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value && value !== defaultValue) {
        count++;
      }
    });
    return count;
  }, [filters]);

  return {
    filters,
    metadata,
    loading,
    error,
    updateFilter,
    updateFilters,
    resetFilters,
    applyFilters,
    syncToUrl: () => syncToUrl(filters),
    loadFromUrl,
    clearUrl,
    refreshMetadata: fetchMetadata,
    activeFiltersCount,
  };
}

export default useSearchFilters;
