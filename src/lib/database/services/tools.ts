/**
 * Database service for tools management
 * Handles CRUD operations for tools in the database
 */

import { getPool } from '../postgres';
import { ToolAnalysis } from '@/src/types/analysis';

export interface DatabaseTool {
  id: number;
  tool_name: string;
  tool_category: string;
  tool_link: string;
  overview: string;
  tool_description: string;
  target_audience: string;
  key_features: string;
  use_cases: string;
  tags: string;
  image_url: string;
  slug: string;
  is_active: boolean;
  featured: boolean;
  quality_score: number;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  view_count: number;
  click_count: number;
  favorite_count: number;
  created_at: Date;
  updated_at: Date;
  last_checked_at: Date;
  last_optimized_at?: Date;
}

export interface ToolsSearchParams {
  query?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  filter?: 'never_optimized' | 'needs_update' | 'all';
}

export interface PaginatedToolsResponse {
  tools: DatabaseTool[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hasMore: boolean;
}

export interface ToolData {
  tool_name: string;
  tool_category: string;
  tool_link: string;
  overview: string;
  tool_description: string;
  target_audience: string;
  key_features: string;
  use_cases: string;
  tags: string;
  image_url: string;
}

export interface ToolUpdateData {
  tool_name?: string;
  tool_category?: string;
  tool_link?: string;
  overview?: string;
  tool_description?: string;
  target_audience?: string;
  key_features?: string;
  use_cases?: string;
  tags?: string;
  image_url?: string;
  slug?: string;
  is_active?: boolean;
  featured?: boolean;
  quality_score?: number;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string;
  last_checked_at?: Date;
  last_optimized_at?: Date;
}

export class ToolsService {
  /**
   * Get all tools with pagination
   */
  async getAllTools(page: number = 1, limit: number = 20, category?: string): Promise<{ tools: DatabaseTool[], total: number }> {
    try {
      let query = 'SELECT * FROM tools WHERE is_active = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (category) {
        query += ` AND tool_category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await getPool().query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, (page - 1) * limit);

      const result = await getPool().query(query, params);
      
      return {
        tools: result.rows.map(row => ({
          ...row,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          last_checked_at: new Date(row.last_checked_at)
        })),
        total
      };
    } catch (error) {
      console.error('Error getting tools:', error);
      throw new Error('Failed to get tools from database');
    }
  }

  /**
   * Get tool by ID
   */
  async getToolById(id: number): Promise<DatabaseTool | null> {
    try {
      const result = await getPool().query('SELECT * FROM tools WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at)
      };
    } catch (error) {
      console.error('Error getting tool by ID:', error);
      throw new Error('Failed to get tool from database');
    }
  }

  /**
   * Get tool by slug
   */
  async getToolBySlug(slug: string): Promise<DatabaseTool | null> {
    try {
      const result = await getPool().query('SELECT * FROM tools WHERE slug = $1', [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at)
      };
    } catch (error) {
      console.error('Error getting tool by slug:', error);
      throw new Error('Failed to get tool from database');
    }
  }

  /**
   * Update tool with new analysis data
   */
  async updateTool(id: number, updateData: ToolUpdateData): Promise<DatabaseTool> {
    try {
      // Filter out system fields to avoid conflicts
      const { id: _, created_at, updated_at, last_checked_at, ...filteredData } = updateData as any;
      
      const fields = Object.keys(filteredData).map((key, index) => `${key} = $${index + 2}`);
      const values = Object.values(filteredData);
      
      const query = `
        UPDATE tools 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP, last_checked_at = CURRENT_TIMESTAMP
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await getPool().query(query, [id, ...values]);
      
      if (result.rows.length === 0) {
        throw new Error('Tool not found');
      }

      const row = result.rows[0];
      return {
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at)
      };
    } catch (error) {
      console.error('Error updating tool:', error);
      throw new Error('Failed to update tool in database');
    }
  }

  /**
   * Update specific fields of a tool
   */
  async updateToolFields(id: number, fields: Partial<ToolUpdateData>, updateOptimizedAt?: boolean): Promise<DatabaseTool> {
    try {
      const updateFields = Object.keys(fields).map((key, index) => `${key} = $${index + 2}`);
      const values = Object.values(fields);
      
      // Add last_optimized_at update if requested
      if (updateOptimizedAt) {
        updateFields.push('last_optimized_at = CURRENT_TIMESTAMP');
      }
      
      const query = `
        UPDATE tools 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await getPool().query(query, [id, ...values]);
      
      if (result.rows.length === 0) {
        throw new Error('Tool not found');
      }

      const row = result.rows[0];
      return {
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at),
        last_optimized_at: row.last_optimized_at ? new Date(row.last_optimized_at) : null
      };
    } catch (error) {
      console.error('Error updating tool fields:', error);
      throw new Error('Failed to update tool fields in database');
    }
  }

  /**
   * Convert ToolAnalysis to database format
   */
  convertAnalysisToDatabase(analysis: ToolAnalysis): ToolUpdateData {
    return {
      tool_name: analysis.toolName,
      tool_category: analysis.category,
      tool_link: '', // URL will be set from database tool
      overview: analysis.primaryFunction,
      tool_description: analysis.description,
      target_audience: analysis.targetAudience?.join(', ') || '',
      key_features: analysis.keyFeatures?.join(', ') || '',
      use_cases: '', // Not available in analysis
      tags: analysis.tags?.join(', ') || '',
      image_url: analysis.logoUrl || '',
      slug: analysis.slug,
      meta_title: analysis.metaTitle,
      meta_description: analysis.metaDescription,
      seo_keywords: analysis.tags?.join(', ') || '',
      quality_score: analysis.confidence || 0,
      last_checked_at: new Date()
    };
  }

  /**
   * Convert database tool to ToolAnalysis format
   */
  convertDatabaseToAnalysis(tool: DatabaseTool): ToolAnalysis {
    return {
      toolName: tool.tool_name,
      slug: tool.slug,
      primaryFunction: tool.overview || '',
      keyFeatures: tool.key_features ? tool.key_features.split(', ') : [],
      targetAudience: tool.target_audience ? tool.target_audience.split(', ') : [],
      pricingModel: 'Unknown', // Not stored in database
      category: tool.tool_category,
      description: tool.tool_description || '',
      metaTitle: tool.meta_title || '',
      metaDescription: tool.meta_description || '',
      tags: tool.tags ? tool.tags.split(', ') : [],
      confidence: tool.quality_score,
      dataCompleteness: 80, // Default value
      recommendedActions: [],
      socialLinks: {},
      contactInfo: {},
      logoUrl: tool.image_url || '',
      pricingDetails: {
        model: 'Unknown',
        plans: [],
        freeTier: false,
        paidPlans: false,
        enterpriseAvailable: false,
        pricingNotes: 'Pricing information not available'
      },
      pricingSummary: 'Pricing information not available',
      affiliateInfo: {
        affiliateProgramUrl: undefined,
        affiliateContactEmail: undefined,
        affiliateContactForm: undefined,
        hasAffiliateProgram: false,
        notes: 'No affiliate information available'
      }
    };
  }

  /**
   * Get tools that need updating (not checked recently)
   */
  async getToolsNeedingUpdate(limit: number = 10): Promise<DatabaseTool[]> {
    try {
      const query = `
        SELECT * FROM tools 
        WHERE is_active = true 
        AND (last_checked_at IS NULL OR last_checked_at < NOW() - INTERVAL '7 days')
        ORDER BY last_checked_at ASC NULLS FIRST
        LIMIT $1
      `;
      
      const result = await getPool().query(query, [limit]);
      
      return result.rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: row.last_checked_at ? new Date(row.last_checked_at) : null
      }));
    } catch (error) {
      console.error('Error getting tools needing update:', error);
      throw new Error('Failed to get tools needing update');
    }
  }

  /**
   * Get featured tools for homepage display
   */
  async getFeaturedTools(limit: number = 8): Promise<DatabaseTool[]> {
    try {
      const query = `
        SELECT * FROM tools 
        WHERE is_active = true AND featured = true
        ORDER BY quality_score DESC, view_count DESC
        LIMIT $1
      `;
      
      const result = await getPool().query(query, [limit]);
      
      return result.rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at)
      }));
    } catch (error) {
      console.error('Error getting featured tools:', error);
      throw new Error('Failed to get featured tools');
    }
  }

  /**
   * Get tool statistics
   */
  async getToolStatistics(): Promise<{
    totalTools: number;
    activeTools: number;
    featuredTools: number;
    totalViews: number;
    totalClicks: number;
    categories: number;
  }> {
    try {
      const [toolsResult, categoriesResult] = await Promise.all([
        getPool().query(`
          SELECT 
            COUNT(*) as total_tools,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_tools,
            COUNT(CASE WHEN featured = true THEN 1 END) as featured_tools,
            COALESCE(SUM(view_count), 0) as total_views,
            COALESCE(SUM(click_count), 0) as total_clicks
          FROM tools
        `),
        getPool().query('SELECT COUNT(DISTINCT tool_category) as categories FROM tools')
      ]);

      const stats = toolsResult.rows[0];
      const categoryCount = categoriesResult.rows[0];

      return {
        totalTools: parseInt(stats.total_tools),
        activeTools: parseInt(stats.active_tools),
        featuredTools: parseInt(stats.featured_tools),
        totalViews: parseInt(stats.total_views),
        totalClicks: parseInt(stats.total_clicks),
        categories: parseInt(categoryCount.categories)
      };
    } catch (error) {
      console.error('Error getting tool statistics:', error);
      throw new Error('Failed to get tool statistics');
    }
  }

  /**
   * Increment view count for a tool
   */
  async incrementViewCount(id: number): Promise<void> {
    try {
      await getPool().query(
        'UPDATE tools SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Get related tools based on category and similarity
   */
  async getRelatedTools(toolId: number, category: string, limit: number = 4): Promise<DatabaseTool[]> {
    try {
      const result = await getPool().query(`
        SELECT * FROM tools 
        WHERE tool_category = $1 
          AND id != $2 
          AND is_active = true
        ORDER BY view_count DESC, created_at DESC
        LIMIT $3
      `, [category, toolId, limit]);

      return result.rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at)
      }));
    } catch (error) {
      console.error('Error getting related tools:', error);
      return [];
    }
  }

  /**
   * Search tools with advanced filtering (for compatibility with old interface)
   */
  async searchTools(params: {
    query?: string;
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    filter?: 'never_optimized' | 'needs_update' | 'all';
  } = {}): Promise<{
    tools: DatabaseTool[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    hasMore: boolean;
  }> {
    try {
      const {
        query,
        category,
        featured,
        page = 1,
        limit = 12,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filter
      } = params;

      let whereConditions = ['is_active = true'];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (query) {
        whereConditions.push(`(tool_name ILIKE $${paramIndex} OR tool_description ILIKE $${paramIndex} OR overview ILIKE $${paramIndex})`);
        queryParams.push(`%${query}%`);
        paramIndex++;
      }

      if (category) {
        whereConditions.push(`tool_category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }

      if (featured !== undefined) {
        whereConditions.push(`featured = $${paramIndex}`);
        queryParams.push(featured);
        paramIndex++;
      }

      if (filter) {
        if (filter === 'never_optimized') {
          whereConditions.push('last_optimized_at IS NULL');
        } else if (filter === 'needs_update') {
          whereConditions.push(`last_optimized_at IS NOT NULL AND last_optimized_at < NOW() - INTERVAL '30 days'`);
        }
        // 'all' filter doesn't add any conditions
      }

      const whereClause = whereConditions.join(' AND ');

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM tools WHERE ${whereClause}`;
      const countResult = await getPool().query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results
      const offset = (page - 1) * limit;
      const orderBy = sortBy === 'createdAt' ? 'created_at' : 
                     sortBy === 'updatedAt' ? 'updated_at' : 
                     sortBy === 'viewCount' ? 'view_count' : 
                     sortBy === 'qualityScore' ? 'quality_score' : 'created_at';
      
      const dataQuery = `
        SELECT * FROM tools 
        WHERE ${whereClause}
        ORDER BY ${orderBy} ${sortOrder.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const result = await getPool().query(dataQuery, [...queryParams, limit, offset]);
      
      const tools = result.rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_checked_at: new Date(row.last_checked_at),
        last_optimized_at: row.last_optimized_at ? new Date(row.last_optimized_at) : null
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        tools,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        hasMore: page < totalPages
      };
    } catch (error) {
      console.error('Error searching tools:', error);
      throw new Error('Failed to search tools');
    }
  }
}

export const toolsService = new ToolsService();