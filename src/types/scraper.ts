/**
 * Types for scraping functionality
 */

export interface ScrapingResult {
  url: string;
  title: string;
  description: string;
  content: string;
  metadata: {
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  pricing: string[];
  features: string[];
  screenshotUrl?: string;
  logoUrl?: string;
}

export interface SocialLinks {
  // Professional Networks
  linkedin?: string;
  xing?: string;
  
  // Social Media Platforms
  twitter?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  pinterest?: string;
  reddit?: string;
  
  // Video Platforms
  youtube?: string;
  vimeo?: string;
  twitch?: string;
  dailymotion?: string;
  
  // Developer/Technical Platforms
  github?: string;
  gitlab?: string;
  bitbucket?: string;
  stackoverflow?: string;
  devpost?: string;
  
  // Business Platforms
  crunchbase?: string;
  angellist?: string;
  producthunt?: string;
  
  // Professional Communities
  discord?: string;
  slack?: string;
  telegram?: string;
  whatsapp?: string;
  
  // Content Platforms
  medium?: string;
  substack?: string;
  behance?: string;
  dribbble?: string;
  
  // Regional Platforms
  weibo?: string;
  wechat?: string;
  qq?: string;
  vk?: string;
  odnoklassniki?: string;
  
  // Specialized Platforms
  mastodon?: string;
  bluesky?: string;
  threads?: string;
  tumblr?: string;
  
  // Additional Platforms
  flickr?: string;
  deviantart?: string;
  artstation?: string;
  soundcloud?: string;
  spotify?: string;
  apple?: string;
  google?: string;
  microsoft?: string;
}

export interface ContactInfo {
  email?: string;
  contactFormUrl?: string;
  supportUrl?: string;
  phone?: string;
  address?: string;
}