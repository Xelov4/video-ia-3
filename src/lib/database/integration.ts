/**
 * Module d'intégration pour insérer les données du scraper dans la base de données multilingue
 * Support pour: Allemand, Néerlandais, Italien, Anglais, Portugais, Français, Espagnol
 */

import { Pool, PoolClient } from 'pg';
import {
  AITool,
  AIToolTranslation,
  AIToolFeature,
  AIToolAudience,
  AIToolTag,
  AIToolMetadata,
  AIToolSocialLink,
  AIToolContactInfo,
  AIToolPricingPlan,
  AIToolPricingFeature,
  AIToolAffiliateInfo,
  AIToolRecommendedAction,
  AIToolUpdateHistory,
  ScrapingResultDB,
  LanguageCode,
  ContactType,
  BillingCycle,
  SocialPlatform,
  LANGUAGE_MAPPINGS,
} from './types';

// Interface pour les données du scraper existant
interface ExistingScrapingResult {
  url: string;
  title: string;
  content: string;
  metadata: {
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  socialLinks: Record<string, string>;
  contactInfo: {
    email?: string;
    contactFormUrl?: string;
    supportUrl?: string;
    phone?: string;
    address?: string;
  };
  pricing: string[];
  features: string[];
  screenshotUrl?: string;
  logoUrl?: string;
}

interface ExistingToolAnalysis {
  toolName: string;
  slug: string;
  primaryFunction: string;
  keyFeatures: string[];
  targetAudience: string[];
  pricingModel: string;
  category: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  confidence: number;
  dataCompleteness: number;
  recommendedActions: string[];
  socialLinks: Record<string, string>;
  contactInfo: {
    email?: string;
    contactFormUrl?: string;
    supportUrl?: string;
    phone?: string;
    address?: string;
  };
  pricingDetails: {
    model: string;
    plans: Array<{
      name: string;
      price: string;
      features: string[];
      billing: 'monthly' | 'yearly' | 'one-time';
    }>;
    freeTier: boolean;
    paidPlans: boolean;
    enterpriseAvailable: boolean;
    pricingNotes: string;
  };
  pricingSummary: string;
  affiliateInfo: {
    affiliateProgramUrl?: string;
    affiliateContactEmail?: string;
    affiliateContactForm?: string;
    hasAffiliateProgram: boolean;
    notes: string;
  };
  translations?: {
    toolName: string;
    primaryFunction: string;
    keyFeatures: string[];
    targetAudience: string[];
    description: string;
    metaTitle: string;
    metaDescription: string;
    pricingSummary: string;
  };
  logoUrl?: string;
}

export class DatabaseIntegration {
  private pool: Pool;

  constructor(connectionConfig: any) {
    this.pool = new Pool(connectionConfig);
  }

  /**
   * Fonction principale pour intégrer les données du scraper existant
   */
  async integrateScrapingResult(
    scrapingData: ExistingScrapingResult,
    analysis: ExistingToolAnalysis
  ): Promise<number> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Insérer ou mettre à jour l'outil principal
      const toolId = await this.insertOrUpdateTool(client, scrapingData, analysis);

      // 2. Insérer les métadonnées originales
      await this.insertMetadata(client, toolId, scrapingData, analysis);

      // 3. Insérer les traductions pour toutes les langues
      await this.insertTranslations(client, toolId, analysis);

      // 4. Insérer les caractéristiques multilingues
      await this.insertFeatures(client, toolId, analysis);

      // 5. Insérer les audiences cibles multilingues
      await this.insertAudiences(client, toolId, analysis);

      // 6. Insérer les tags multilingues
      await this.insertTags(client, toolId, analysis);

      // 7. Insérer les liens sociaux
      await this.insertSocialLinks(client, toolId, analysis.socialLinks);

      // 8. Insérer les informations de contact
      await this.insertContactInfo(client, toolId, analysis.contactInfo);

      // 9. Insérer les plans de tarification
      await this.insertPricingPlans(client, toolId, analysis);

      // 10. Insérer les informations d'affiliation
      await this.insertAffiliateInfo(client, toolId, analysis.affiliateInfo);

      // 11. Insérer les actions recommandées
      await this.insertRecommendedActions(client, toolId, analysis);

      // 12. Enregistrer l'historique de mise à jour
      await this.insertUpdateHistory(
        client,
        toolId,
        'scrape',
        [
          'tool_info',
          'translations',
          'features',
          'audiences',
          'tags',
          'social_links',
          'contact_info',
          'pricing_plans',
          'affiliate_info',
        ],
        analysis.confidence
      );

      await client.query('COMMIT');
      return toolId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertOrUpdateTool(
    client: PoolClient,
    scrapingData: ExistingScrapingResult,
    analysis: ExistingToolAnalysis
  ): Promise<number> {
    const query = `
      INSERT INTO ai_tools (
        url, slug, primary_language_code, confidence_score, data_completeness,
        screenshot_url, logo_url, pricing_model, category, has_free_tier,
        has_paid_plans, has_enterprise, has_affiliate_program, last_updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
      ON CONFLICT (url) DO UPDATE SET
        slug = EXCLUDED.slug,
        confidence_score = EXCLUDED.confidence_score,
        data_completeness = EXCLUDED.data_completeness,
        screenshot_url = EXCLUDED.screenshot_url,
        logo_url = EXCLUDED.logo_url,
        pricing_model = EXCLUDED.pricing_model,
        category = EXCLUDED.category,
        has_free_tier = EXCLUDED.has_free_tier,
        has_paid_plans = EXCLUDED.has_paid_plans,
        has_enterprise = EXCLUDED.has_enterprise,
        has_affiliate_program = EXCLUDED.has_affiliate_program,
        last_updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      scrapingData.url,
      analysis.slug,
      'en', // Langue primaire par défaut
      analysis.confidence,
      analysis.dataCompleteness,
      scrapingData.screenshotUrl,
      analysis.logoUrl,
      analysis.pricingModel,
      analysis.category,
      analysis.pricingDetails.freeTier,
      analysis.pricingDetails.paidPlans,
      analysis.pricingDetails.enterpriseAvailable,
      analysis.affiliateInfo.hasAffiliateProgram,
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  }

  private async insertMetadata(
    client: PoolClient,
    toolId: number,
    scrapingData: ExistingScrapingResult,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    const query = `
      INSERT INTO ai_tool_metadata (
        tool_id, original_title, original_content, meta_description,
        meta_keywords, og_title, og_description, raw_pricing_text, raw_features_text
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (tool_id) DO UPDATE SET
        original_title = EXCLUDED.original_title,
        original_content = EXCLUDED.original_content,
        meta_description = EXCLUDED.meta_description,
        meta_keywords = EXCLUDED.meta_keywords,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        raw_pricing_text = EXCLUDED.raw_pricing_text,
        raw_features_text = EXCLUDED.raw_features_text;
    `;

    const values = [
      toolId,
      scrapingData.title,
      scrapingData.content,
      scrapingData.metadata.description,
      scrapingData.metadata.keywords.join(','),
      scrapingData.metadata.ogTitle,
      scrapingData.metadata.ogDescription,
      scrapingData.pricing,
      scrapingData.features,
    ];

    await client.query(query, values);
  }

  private async insertTranslations(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les traductions existantes
    await client.query('DELETE FROM ai_tool_translations WHERE tool_id = $1', [toolId]);

    // Insérer la version anglaise (langue source)
    const englishQuery = `
      INSERT INTO ai_tool_translations (
        tool_id, language_code, tool_name, primary_function, description,
        meta_title, meta_description, pricing_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    await client.query(englishQuery, [
      toolId,
      'en',
      analysis.toolName,
      analysis.primaryFunction,
      analysis.description,
      analysis.metaTitle,
      analysis.metaDescription,
      analysis.pricingSummary,
    ]);

    // Insérer la traduction française si disponible
    if (analysis.translations) {
      await client.query(englishQuery, [
        toolId,
        'fr',
        analysis.translations.toolName,
        analysis.translations.primaryFunction,
        analysis.translations.description,
        analysis.translations.metaTitle,
        analysis.translations.metaDescription,
        analysis.translations.pricingSummary,
      ]);
    }

    // TODO: Intégrer ici l'API de traduction pour les autres langues
    // Pour l'instant, nous créons des entrées avec des valeurs par défaut
    const otherLanguages: LanguageCode[] = ['de', 'nl', 'it', 'pt', 'es'];

    for (const lang of otherLanguages) {
      if (lang !== 'fr') {
        // Français déjà traité
        await client.query(englishQuery, [
          toolId,
          lang,
          analysis.toolName,
          analysis.primaryFunction,
          analysis.description,
          analysis.metaTitle,
          analysis.metaDescription,
          analysis.pricingSummary,
        ]);
      }
    }
  }

  private async insertFeatures(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les caractéristiques existantes
    await client.query('DELETE FROM ai_tool_features WHERE tool_id = $1', [toolId]);

    const query = `
      INSERT INTO ai_tool_features (tool_id, language_code, feature_text, feature_order)
      VALUES ($1, $2, $3, $4);
    `;

    // Insérer les caractéristiques en anglais
    for (let i = 0; i < analysis.keyFeatures.length; i++) {
      await client.query(query, [toolId, 'en', analysis.keyFeatures[i], i]);
    }

    // Insérer les caractéristiques en français si disponible
    if (analysis.translations?.keyFeatures) {
      for (let i = 0; i < analysis.translations.keyFeatures.length; i++) {
        await client.query(query, [
          toolId,
          'fr',
          analysis.translations.keyFeatures[i],
          i,
        ]);
      }
    }

    // Pour les autres langues, utiliser temporairement les versions anglaises
    const otherLanguages: LanguageCode[] = ['de', 'nl', 'it', 'pt', 'es'];
    for (const lang of otherLanguages) {
      if (lang !== 'fr') {
        for (let i = 0; i < analysis.keyFeatures.length; i++) {
          await client.query(query, [toolId, lang, analysis.keyFeatures[i], i]);
        }
      }
    }
  }

  private async insertAudiences(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les audiences existantes
    await client.query('DELETE FROM ai_tool_audiences WHERE tool_id = $1', [toolId]);

    const query = `
      INSERT INTO ai_tool_audiences (tool_id, language_code, audience_text, audience_order)
      VALUES ($1, $2, $3, $4);
    `;

    // Insérer les audiences en anglais
    for (let i = 0; i < analysis.targetAudience.length; i++) {
      await client.query(query, [toolId, 'en', analysis.targetAudience[i], i]);
    }

    // Insérer les audiences en français si disponible
    if (analysis.translations?.targetAudience) {
      for (let i = 0; i < analysis.translations.targetAudience.length; i++) {
        await client.query(query, [
          toolId,
          'fr',
          analysis.translations.targetAudience[i],
          i,
        ]);
      }
    }

    // Pour les autres langues, utiliser temporairement les versions anglaises
    const otherLanguages: LanguageCode[] = ['de', 'nl', 'it', 'pt', 'es'];
    for (const lang of otherLanguages) {
      if (lang !== 'fr') {
        for (let i = 0; i < analysis.targetAudience.length; i++) {
          await client.query(query, [toolId, lang, analysis.targetAudience[i], i]);
        }
      }
    }
  }

  private async insertTags(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les tags existants
    await client.query('DELETE FROM ai_tool_tags WHERE tool_id = $1', [toolId]);

    const query = `
      INSERT INTO ai_tool_tags (tool_id, language_code, tag_text)
      VALUES ($1, $2, $3);
    `;

    // Insérer les tags pour toutes les langues (les tags sont généralement universels)
    const allLanguages: LanguageCode[] = ['en', 'fr', 'de', 'nl', 'it', 'pt', 'es'];

    for (const lang of allLanguages) {
      for (const tag of analysis.tags) {
        await client.query(query, [toolId, lang, tag]);
      }
    }
  }

  private async insertSocialLinks(
    client: PoolClient,
    toolId: number,
    socialLinks: Record<string, string>
  ): Promise<void> {
    // Supprimer les liens sociaux existants
    await client.query('DELETE FROM ai_tool_social_links WHERE tool_id = $1', [toolId]);

    const query = `
      INSERT INTO ai_tool_social_links (tool_id, platform, url)
      VALUES ($1, $2, $3);
    `;

    for (const [platform, url] of Object.entries(socialLinks)) {
      if (url) {
        await client.query(query, [toolId, platform, url]);
      }
    }
  }

  private async insertContactInfo(
    client: PoolClient,
    toolId: number,
    contactInfo: any
  ): Promise<void> {
    // Supprimer les informations de contact existantes
    await client.query('DELETE FROM ai_tool_contact_info WHERE tool_id = $1', [toolId]);

    const query = `
      INSERT INTO ai_tool_contact_info (tool_id, contact_type, contact_value)
      VALUES ($1, $2, $3);
    `;

    if (contactInfo.email) {
      await client.query(query, [toolId, 'email', contactInfo.email]);
    }
    if (contactInfo.phone) {
      await client.query(query, [toolId, 'phone', contactInfo.phone]);
    }
    if (contactInfo.address) {
      await client.query(query, [toolId, 'address', contactInfo.address]);
    }
    if (contactInfo.contactFormUrl) {
      await client.query(query, [toolId, 'contact_form', contactInfo.contactFormUrl]);
    }
    if (contactInfo.supportUrl) {
      await client.query(query, [toolId, 'support', contactInfo.supportUrl]);
    }
  }

  private async insertPricingPlans(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les plans existants
    await client.query('DELETE FROM ai_tool_pricing_plans WHERE tool_id = $1', [
      toolId,
    ]);

    if (!analysis.pricingDetails.plans.length) return;

    const planQuery = `
      INSERT INTO ai_tool_pricing_plans (
        tool_id, language_code, plan_name, plan_price, billing_cycle, plan_order
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
    `;

    const featureQuery = `
      INSERT INTO ai_tool_pricing_features (pricing_plan_id, feature_text, feature_order)
      VALUES ($1, $2, $3);
    `;

    // Insérer les plans pour toutes les langues
    const allLanguages: LanguageCode[] = ['en', 'fr', 'de', 'nl', 'it', 'pt', 'es'];

    for (const lang of allLanguages) {
      for (let i = 0; i < analysis.pricingDetails.plans.length; i++) {
        const plan = analysis.pricingDetails.plans[i];

        const planResult = await client.query(planQuery, [
          toolId,
          lang,
          plan.name,
          plan.price,
          plan.billing,
          i,
        ]);

        const planId = planResult.rows[0].id;

        // Insérer les caractéristiques du plan
        for (let j = 0; j < plan.features.length; j++) {
          await client.query(featureQuery, [planId, plan.features[j], j]);
        }
      }
    }
  }

  private async insertAffiliateInfo(
    client: PoolClient,
    toolId: number,
    affiliateInfo: any
  ): Promise<void> {
    const query = `
      INSERT INTO ai_tool_affiliate_info (
        tool_id, affiliate_program_url, affiliate_contact_email,
        affiliate_contact_form, affiliate_notes
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tool_id) DO UPDATE SET
        affiliate_program_url = EXCLUDED.affiliate_program_url,
        affiliate_contact_email = EXCLUDED.affiliate_contact_email,
        affiliate_contact_form = EXCLUDED.affiliate_contact_form,
        affiliate_notes = EXCLUDED.affiliate_notes,
        updated_at = CURRENT_TIMESTAMP;
    `;

    await client.query(query, [
      toolId,
      affiliateInfo.affiliateProgramUrl,
      affiliateInfo.affiliateContactEmail,
      affiliateInfo.affiliateContactForm,
      affiliateInfo.notes,
    ]);
  }

  private async insertRecommendedActions(
    client: PoolClient,
    toolId: number,
    analysis: ExistingToolAnalysis
  ): Promise<void> {
    // Supprimer les actions existantes
    await client.query('DELETE FROM ai_tool_recommended_actions WHERE tool_id = $1', [
      toolId,
    ]);

    if (!analysis.recommendedActions.length) return;

    const query = `
      INSERT INTO ai_tool_recommended_actions (tool_id, language_code, action_text, action_priority)
      VALUES ($1, $2, $3, $4);
    `;

    // Insérer les actions pour toutes les langues
    const allLanguages: LanguageCode[] = ['en', 'fr', 'de', 'nl', 'it', 'pt', 'es'];

    for (const lang of allLanguages) {
      for (const action of analysis.recommendedActions) {
        await client.query(query, [toolId, lang, action, 'medium']);
      }
    }
  }

  private async insertUpdateHistory(
    client: PoolClient,
    toolId: number,
    updateType: 'scrape' | 'translation' | 'manual',
    updatedFields: string[],
    confidenceAfter: number
  ): Promise<void> {
    const query = `
      INSERT INTO ai_tool_update_history (
        tool_id, update_type, updated_fields, confidence_after
      ) VALUES ($1, $2, $3, $4);
    `;

    await client.query(query, [toolId, updateType, updatedFields, confidenceAfter]);
  }

  /**
   * Récupérer un outil avec toutes ses traductions
   */
  async getToolWithTranslations(toolId: number, languageCode?: LanguageCode) {
    const query = `
      SELECT * FROM ai_tools_complete_info 
      WHERE id = $1 ${languageCode ? 'AND language_code = $2' : ''}
      ORDER BY language_code;
    `;

    const params = languageCode ? [toolId, languageCode] : [toolId];
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Rechercher des outils par critères
   */
  async searchTools(criteria: {
    language?: LanguageCode;
    category?: string;
    pricingModel?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = `
      SELECT * FROM ai_tools_with_translations 
      WHERE is_active = true
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (criteria.language) {
      query += ` AND language_code = $${++paramCount}`;
      params.push(criteria.language);
    }

    if (criteria.category) {
      query += ` AND category = $${++paramCount}`;
      params.push(criteria.category);
    }

    if (criteria.pricingModel) {
      query += ` AND pricing_model = $${++paramCount}`;
      params.push(criteria.pricingModel);
    }

    if (criteria.search) {
      query += ` AND (tool_name ILIKE $${++paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${criteria.search}%`);
    }

    query += ` ORDER BY confidence_score DESC, data_completeness DESC`;

    if (criteria.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(criteria.limit);
    }

    if (criteria.offset) {
      query += ` OFFSET $${++paramCount}`;
      params.push(criteria.offset);
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async close() {
    await this.pool.end();
  }
}

// Fonction utilitaire pour créer une instance de la base de données
export function createDatabaseIntegration(config?: any) {
  const defaultConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'video_ia_net',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
  };

  return new DatabaseIntegration(config || defaultConfig);
}
