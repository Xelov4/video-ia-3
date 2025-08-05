/**
 * Types TypeScript pour le modèle de base de données multilingue
 * Support pour: Allemand, Néerlandais, Italien, Anglais, Portugais, Français, Espagnol
 */

export type LanguageCode = 'de' | 'nl' | 'it' | 'en' | 'pt' | 'fr' | 'es';

export interface Language {
  id: number;
  code: LanguageCode;
  name: string;
  native_name: string;
  is_active: boolean;
  created_at: Date;
}

export interface AITool {
  id: number;
  url: string;
  slug: string;
  primary_language_code: LanguageCode;
  is_active: boolean;
  confidence_score: number;
  data_completeness: number;
  screenshot_url?: string;
  logo_url?: string;
  pricing_model?: string;
  category?: string;
  has_free_tier: boolean;
  has_paid_plans: boolean;
  has_enterprise: boolean;
  has_affiliate_program: boolean;
  first_scraped_at: Date;
  last_updated_at: Date;
  created_at: Date;
}

export interface AIToolTranslation {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  tool_name: string;
  primary_function?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  pricing_summary?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AIToolFeature {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  feature_text: string;
  feature_order: number;
  created_at: Date;
}

export interface AIToolAudience {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  audience_text: string;
  audience_order: number;
  created_at: Date;
}

export interface AIToolTag {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  tag_text: string;
  created_at: Date;
}

export interface AIToolMetadata {
  id: number;
  tool_id: number;
  original_title?: string;
  original_content?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  raw_pricing_text?: string[];
  raw_features_text?: string[];
  created_at: Date;
}

export interface AIToolSocialLink {
  id: number;
  tool_id: number;
  platform: string;
  url: string;
  is_verified: boolean;
  created_at: Date;
}

export type ContactType = 'email' | 'phone' | 'address' | 'contact_form' | 'support';

export interface AIToolContactInfo {
  id: number;
  tool_id: number;
  contact_type: ContactType;
  contact_value: string;
  is_verified: boolean;
  created_at: Date;
}

export type BillingCycle = 'monthly' | 'yearly' | 'one-time';

export interface AIToolPricingPlan {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  plan_name: string;
  plan_price?: string;
  billing_cycle?: BillingCycle;
  plan_order: number;
  created_at: Date;
}

export interface AIToolPricingFeature {
  id: number;
  pricing_plan_id: number;
  feature_text: string;
  feature_order: number;
  created_at: Date;
}

export interface AIToolAffiliateInfo {
  id: number;
  tool_id: number;
  affiliate_program_url?: string;
  affiliate_contact_email?: string;
  affiliate_contact_form?: string;
  affiliate_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type ActionPriority = 'low' | 'medium' | 'high';

export interface AIToolRecommendedAction {
  id: number;
  tool_id: number;
  language_code: LanguageCode;
  action_text: string;
  action_priority: ActionPriority;
  is_completed: boolean;
  created_at: Date;
}

export type UpdateType = 'scrape' | 'translation' | 'manual';

export interface AIToolUpdateHistory {
  id: number;
  tool_id: number;
  update_type: UpdateType;
  updated_fields?: string[];
  update_notes?: string;
  confidence_before?: number;
  confidence_after?: number;
  created_at: Date;
}

// Vues combinées pour faciliter les requêtes
export interface AIToolWithTranslation {
  id: number;
  url: string;
  slug: string;
  category?: string;
  pricing_model?: string;
  screenshot_url?: string;
  logo_url?: string;
  confidence_score: number;
  data_completeness: number;
  language_code: LanguageCode;
  tool_name: string;
  primary_function?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  pricing_summary?: string;
}

export interface AIToolCompleteInfo extends AITool {
  language_code: LanguageCode;
  tool_name: string;
  primary_function?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  pricing_summary?: string;
  features: string[];
  target_audiences: string[];
  tags: string[];
}

// Types pour l'insertion de données depuis le scraper
export interface ScrapingResultDB {
  // Données principales
  url: string;
  slug: string;
  primary_language_code: LanguageCode;
  confidence_score: number;
  data_completeness: number;
  screenshot_url?: string;
  logo_url?: string;
  pricing_model?: string;
  category?: string;
  has_free_tier: boolean;
  has_paid_plans: boolean;
  has_enterprise: boolean;
  has_affiliate_program: boolean;
  
  // Métadonnées originales
  metadata: {
    original_title?: string;
    original_content?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_title?: string;
    og_description?: string;
    raw_pricing_text?: string[];
    raw_features_text?: string[];
  };
  
  // Traductions par langue
  translations: Record<LanguageCode, {
    tool_name: string;
    primary_function?: string;
    description?: string;
    meta_title?: string;
    meta_description?: string;
    pricing_summary?: string;
    features: string[];
    target_audiences: string[];
    tags: string[];
    recommended_actions: string[];
  }>;
  
  // Liens sociaux
  social_links: Record<string, string>;
  
  // Informations de contact
  contact_info: Record<ContactType, string>;
  
  // Plans de tarification par langue
  pricing_plans: Record<LanguageCode, Array<{
    plan_name: string;
    plan_price?: string;
    billing_cycle?: BillingCycle;
    features: string[];
    plan_order: number;
  }>>;
  
  // Informations d'affiliation
  affiliate_info: {
    affiliate_program_url?: string;
    affiliate_contact_email?: string;
    affiliate_contact_form?: string;
    affiliate_notes?: string;
  };
}

// Types pour les requêtes API
export interface GetAIToolsQuery {
  language?: LanguageCode;
  category?: string;
  pricing_model?: string;
  has_free_tier?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetAIToolResponse {
  tool: AIToolCompleteInfo;
  social_links: AIToolSocialLink[];
  contact_info: AIToolContactInfo[];
  pricing_plans: (AIToolPricingPlan & { features: AIToolPricingFeature[] })[];
  affiliate_info?: AIToolAffiliateInfo;
  recommended_actions: AIToolRecommendedAction[];
}

export interface GetAIToolsResponse {
  tools: AIToolWithTranslation[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Constantes pour les mappings
export const LANGUAGE_MAPPINGS: Record<LanguageCode, { name: string; native_name: string }> = {
  'de': { name: 'German', native_name: 'Deutsch' },
  'nl': { name: 'Dutch', native_name: 'Nederlands' },
  'it': { name: 'Italian', native_name: 'Italiano' },
  'en': { name: 'English', native_name: 'English' },
  'pt': { name: 'Portuguese', native_name: 'Português' },
  'fr': { name: 'French', native_name: 'Français' },
  'es': { name: 'Spanish', native_name: 'Español' }
};

export const SOCIAL_PLATFORMS = [
  'linkedin', 'twitter', 'facebook', 'instagram', 'github', 'youtube', 'tiktok',
  'discord', 'telegram', 'reddit', 'xing', 'snapchat', 'pinterest', 'vimeo',
  'twitch', 'dailymotion', 'gitlab', 'bitbucket', 'stackoverflow', 'devpost',
  'crunchbase', 'angellist', 'producthunt', 'slack', 'whatsapp', 'medium',
  'substack', 'behance', 'dribbble', 'weibo', 'wechat', 'qq', 'vk',
  'odnoklassniki', 'mastodon', 'bluesky', 'threads', 'tumblr', 'flickr',
  'deviantart', 'artstation', 'soundcloud', 'spotify', 'apple', 'google', 'microsoft'
] as const;

export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];