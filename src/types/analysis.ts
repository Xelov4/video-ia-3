/**
 * Types for AI analysis functionality
 */

import { SocialLinks, ContactInfo } from './scraper';

export interface ToolAnalysis {
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
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  pricingDetails: PricingDetails;
  pricingSummary: string;
  affiliateInfo: AffiliateInfo;
  translations?: FrenchTranslation;
  logoUrl?: string;
  // Enhanced analysis fields
  qualityScore?: number;
  completenessScore?: number;
  competitiveAdvantages?: string[];
  useCases?: string[];
  limitations?: string[];
  integrations?: string[];
  languages?: string[];
  platforms?: string[];
}

export interface PricingDetails {
  model: string;
  plans: PricingPlan[];
  freeTier: boolean;
  paidPlans: boolean;
  enterpriseAvailable: boolean;
  pricingNotes: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  billing: 'monthly' | 'yearly' | 'one-time';
}

export interface AffiliateInfo {
  affiliateProgramUrl?: string;
  affiliateContactEmail?: string;
  affiliateContactForm?: string;
  hasAffiliateProgram: boolean;
  notes: string;
}

export interface FrenchTranslation {
  toolName: string;
  primaryFunction: string;
  keyFeatures: string[];
  targetAudience: string[];
  description: string;
  metaTitle: string;
  metaDescription: string;
  pricingSummary: string;
}