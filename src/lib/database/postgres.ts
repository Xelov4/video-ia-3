/**
 * Configuration PostgreSQL directe pour VPS
 * Alternative à Supabase pour contrôle total
 */

import { Pool, PoolClient } from 'pg';

// Configuration de la base de données depuis les variables d'environnement
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Configuration SSL (désactivée pour VPS local)
  ssl: false,
  // Pool de connexions optimisé
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de connexions global
let pool: Pool | null = null;

/**
 * Obtenir le pool de connexions (singleton)
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Gestion des erreurs de pool
    pool.on('error', (err) => {
      console.error('Erreur PostgreSQL Pool:', err);
    });
    
    pool.on('connect', () => {
      console.log('Nouvelle connexion PostgreSQL établie');
    });
  }
  
  return pool;
}

/**
 * Tester la connexion à la base de données
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    client.release();
    
    console.log('✅ Connexion PostgreSQL OK:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion PostgreSQL:', error);
    return false;
  }
}

/**
 * Exécuter une requête simple
 */
export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Exécuter une transaction
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Types pour nos données (identiques à Supabase)
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
    let queryText = `
      SELECT 
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, is_active, featured
      FROM tools 
      WHERE is_active = true
    `;
    
    const queryParams: any[] = [];
    let paramCount = 0;

    // Filtre par catégorie
    if (filters.category) {
      queryText += ` AND tool_category = $${++paramCount}`;
      queryParams.push(filters.category);
    }

    // Filtre par featured
    if (filters.featured) {
      queryText += ` AND featured = true`;
    }

    // Recherche textuelle
    if (filters.query) {
      queryText += ` AND (
        tool_name ILIKE $${++paramCount} OR 
        tool_description ILIKE $${paramCount} OR 
        overview ILIKE $${paramCount}
      )`;
      queryParams.push(`%${filters.query}%`);
    }

    // Compter le total
    const countQuery = queryText.replace(
      'SELECT id, tool_name, tool_category, tool_link, overview, image_url, slug, quality_score, view_count, is_active, featured FROM tools',
      'SELECT COUNT(*) as total FROM tools'
    );
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Ajouter pagination et tri
    queryText += `
      ORDER BY quality_score DESC, view_count DESC, tool_name
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    const offset = (page - 1) * perPage;
    queryParams.push(perPage, offset);

    // Exécuter la requête
    const result = await query(queryText, queryParams);
    const totalPages = Math.ceil(total / perPage);

    return {
      tools: result.rows,
      total,
      page,
      per_page: perPage,
      total_pages: totalPages
    };
  }

  /**
   * Récupérer un outil par son slug
   */
  static async getToolBySlug(slug: string): Promise<AITool | null> {
    const result = await query(
      'SELECT * FROM tools WHERE slug = $1 AND is_active = true',
      [slug]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Récupérer les outils populaires
   */
  static async getPopularTools(limit: number = 10): Promise<AITool[]> {
    const result = await query(`
      SELECT 
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, featured
      FROM tools 
      WHERE is_active = true
      ORDER BY view_count DESC, quality_score DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Récupérer les outils mis en avant
   */
  static async getFeaturedTools(limit: number = 6): Promise<AITool[]> {
    const result = await query(`
      SELECT 
        id, tool_name, tool_category, tool_link, overview, image_url, 
        slug, quality_score, view_count, featured
      FROM tools 
      WHERE is_active = true AND featured = true
      ORDER BY quality_score DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViewCount(toolId: number): Promise<void> {
    try {
      await query(
        'UPDATE tools SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [toolId]
      );
    } catch (error) {
      console.warn('Erreur incrémentation vues:', error);
    }
  }

  /**
   * Incrémenter le compteur de clics
   */
  static async incrementClickCount(toolId: number): Promise<void> {
    try {
      await query(
        'UPDATE tools SET click_count = click_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [toolId]
      );
    } catch (error) {
      console.warn('Erreur incrémentation clics:', error);
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
    const result = await query(`
      SELECT * FROM categories 
      ORDER BY tool_count DESC, name
    `);

    return result.rows;
  }

  /**
   * Récupérer les catégories principales
   */
  static async getFeaturedCategories(): Promise<Category[]> {
    const result = await query(`
      SELECT * FROM categories 
      WHERE is_featured = true
      ORDER BY tool_count DESC, name
    `);

    return result.rows;
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
    const result = await query(`
      SELECT * FROM tags 
      ORDER BY usage_count DESC, name
      LIMIT $1
    `, [limit]);

    return result.rows;
  }
}

/**
 * Obtenir les statistiques globales
 */
export async function getGlobalStats() {
  const result = await query(`
    SELECT 
      (SELECT COUNT(*) FROM tools WHERE is_active = true) as total_tools,
      (SELECT COUNT(*) FROM categories) as total_categories,
      (SELECT COUNT(*) FROM tags) as total_tags,
      (SELECT COALESCE(SUM(view_count), 0) FROM tools WHERE is_active = true) as total_views,
      (SELECT COALESCE(SUM(click_count), 0) FROM tools WHERE is_active = true) as total_clicks,
      (SELECT tool_category 
       FROM tools 
       WHERE is_active = true 
       GROUP BY tool_category 
       ORDER BY COUNT(*) DESC 
       LIMIT 1) as top_category
  `);

  return result.rows[0];
}

/**
 * Fermer le pool de connexions (pour les tests ou l'arrêt de l'app)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}