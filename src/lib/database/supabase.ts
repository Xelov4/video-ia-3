/**
 * Supabase configuration and client setup
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client public (pour les opérations côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (pour les opérations côté serveur avec privilèges élevés)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Types pour nos données
export interface AITool {
  id: number;
  tool_name: string;
  tool_category: string;
  tool_link: string;
  overview?: string;
  tool_description?: string;
  target_audience?: string;
  key_features?: string;
  use_cases?: string;
  tags?: string;
  image_url?: string;
  slug: string;
  is_active: boolean;
  featured: boolean;
  quality_score: number;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string;
  view_count: number;
  click_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  last_checked_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  tool_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  featured?: boolean;
  query?: string;
}

export interface SearchResults {
  tools: AITool[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Service pour les opérations sur les outils IA
 */
export class ToolsService {
  /**
   * Rechercher des outils avec filtres et pagination
   */
  static async searchTools(
    filters: SearchFilters = {},
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchResults> {
    let query = supabase
      .from('ai_tools')
      .select(`
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, is_active, featured
      `)
      .eq('is_active', true);

    // Filtre par catégorie
    if (filters.category) {
      query = query.eq('tool_category', filters.category);
    }

    // Filtre par featured
    if (filters.featured) {
      query = query.eq('featured', true);
    }

    // Recherche textuelle
    if (filters.query) {
      query = query.or(`tool_name.ilike.%${filters.query}%,tool_description.ilike.%${filters.query}%,overview.ilike.%${filters.query}%`);
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Exécuter la requête avec pagination et tri
    const { data, error, count } = await query
      .order('quality_score', { ascending: false })
      .order('view_count', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Erreur recherche outils: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / perPage) : 0;

    return {
      tools: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: totalPages
    };
  }

  /**
   * Récupérer un outil par son slug
   */
  static async getToolBySlug(slug: string): Promise<AITool | null> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Outil non trouvé
      }
      throw new Error(`Erreur récupération outil: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupérer les outils populaires
   */
  static async getPopularTools(limit: number = 10): Promise<AITool[]> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, featured
      `)
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .order('quality_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur récupération outils populaires: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Récupérer les outils mis en avant
   */
  static async getFeaturedTools(limit: number = 6): Promise<AITool[]> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, featured
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .order('quality_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur récupération outils mis en avant: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViewCount(toolId: number): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', {
      tool_id: toolId
    });

    if (error) {
      console.warn('Erreur incrémentation vues:', error.message);
    }
  }

  /**
   * Incrémenter le compteur de clics
   */
  static async incrementClickCount(toolId: number): Promise<void> {
    const { error } = await supabase.rpc('increment_click_count', {
      tool_id: toolId
    });

    if (error) {
      console.warn('Erreur incrémentation clics:', error.message);
    }
  }
}

/**
 * Service pour les catégories
 */
export class CategoriesService {
  /**
   * Récupérer toutes les catégories avec compteurs
   */
  static async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('tool_count', { ascending: false });

    if (error) {
      throw new Error(`Erreur récupération catégories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Récupérer les catégories principales
   */
  static async getFeaturedCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_featured', true)
      .order('tool_count', { ascending: false });

    if (error) {
      throw new Error(`Erreur récupération catégories principales: ${error.message}`);
    }

    return data || [];
  }
}

/**
 * Service pour les tags
 */
export class TagsService {
  /**
   * Récupérer les tags les plus utilisés
   */
  static async getPopularTags(limit: number = 20): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur récupération tags populaires: ${error.message}`);
    }

    return data || [];
  }
}