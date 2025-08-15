# Technical Architecture
**Version 2.0 - August 2025**

---

## 🏗️ Technical Architecture

### Current Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: CSV → PostgreSQL + Prisma ORM transition
- **Hosting**: Vercel (frontend) + cloud database
- **Cache**: Redis (to implement)

### Target Architecture (Post-Refactoring)
```
Frontend (Next.js 14)
├── Static pages (SSG) for SEO
├── Dynamic pages (SSR) for interaction
├── API Routes for CRUD and search
└── Redis cache for performance

Backend (Prisma + PostgreSQL)
├── Centralized database (16,827 tools)
├── Complete RESTful API
├── Authentication system (NextAuth.js)
└── Secure admin interface

Infrastructure
├──  dedicated VPS
├── PostgreSQL 
├── Redis Cloud (Upstash)
└── CDN and image optimization
```

---

## 💾 Data Model

### Tool Entity
```typescript
interface Tool {
  id: string
  name: string                    // Tool name
  slug: string                    // URL-friendly identifier
  category: string                // Primary category
  subcategory?: string            // Sub-category
  link: string                    // Official URL
  overview: string                // Short description (150 words)
  description: string             // Detailed description
  keyFeatures: string[]           // Key functionalities
  useCases: string[]             // Use cases
  targetUsers: string[]          // Target audiences
  pricing: string                // Pricing model
  tags: string[]                 // Search tags
  logoUrl?: string               // Extracted logo URL
  socialLinks?: {                // Social networks
    // Professional Networks
    linkedin?: string              // LinkedIn company page
    xing?: string                  // Xing business profile
    
    // Social Media Platforms
    twitter?: string               // Twitter/X profile
    facebook?: string              // Facebook page
    instagram?: string             // Instagram profile
    tiktok?: string               // TikTok account
    snapchat?: string              // Snapchat profile
    pinterest?: string             // Pinterest board/profile
    reddit?: string                // Reddit community/subreddit
    
    // Video Platforms
    youtube?: string               // YouTube channel
    vimeo?: string                 // Vimeo channel
    twitch?: string                // Twitch channel
    dailymotion?: string           // Dailymotion channel
    
    // Developer/Technical Platforms
    github?: string                // GitHub repository/organization
    gitlab?: string                // GitLab repository
    bitbucket?: string             // Bitbucket repository
    stackoverflow?: string         // Stack Overflow company tag
    devpost?: string               // Devpost hackathon projects
    
    // Business Platforms
    crunchbase?: string            // Crunchbase company profile
    angellist?: string             // AngelList startup profile
    producthunt?: string           // Product Hunt listing
    
    // Professional Communities
    discord?: string               // Discord server
    slack?: string                 // Slack workspace
    telegram?: string              // Telegram channel
    whatsapp?: string              // WhatsApp business
    
    // Content Platforms
    medium?: string                // Medium blog
    substack?: string              // Substack newsletter
    behance?: string               // Behance portfolio
    dribbble?: string              // Dribbble portfolio
    
    // Regional Platforms
    weibo?: string                 // Weibo (China)
    wechat?: string                // WeChat official account
    qq?: string                    // QQ space
    vk?: string                    // VKontakte (Russia)
    odnoklassniki?: string         // Odnoklassniki (Russia)
    
    // Specialized Platforms
    mastodon?: string              // Mastodon instance
    bluesky?: string               // Bluesky profile
    threads?: string               // Threads profile
    tumblr?: string                // Tumblr blog
    
    // Additional Platforms
    flickr?: string                // Flickr photostream
    deviantart?: string            // DeviantArt gallery
    artstation?: string            // ArtStation portfolio
    soundcloud?: string            // SoundCloud profile
    spotify?: string               // Spotify artist/playlist
    apple?: string                 // Apple App Store
    google?: string                // Google Play Store
    microsoft?: string             // Microsoft Store
  }
  featured: boolean              // Featured tool
  verified: boolean              // Verified tool
  createdAt: Date
  updatedAt: Date
}
```

### Category Entity
```typescript
interface Category {
  id: string
  name: string                   // Category name
  slug: string                   // URL-friendly
  description: string            // Description
  toolCount: number              // Number of tools
  featured: boolean              // Featured category
  createdAt: Date
  updatedAt: Date
}
```

### Article Entity (Blog)
```typescript
interface Article {
  id: string
  title: string                  // H1 title
  slug: string                   // URL-friendly
  excerpt: string                // Excerpt
  content: string                // Rich content (Markdown/HTML)
  author: string                 // Author
  category: string               // Blog category
  tags: string[]                 // Tags
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl?: string
  }
  featured: boolean
  published: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 🚨 Critical Technical Issues to Resolve

### 1. Architecture Inconsistency (CRITICAL)
**Current Problem**:
- Frontend uses `/lib/data.ts` (3 fake tools)
- API reads `/data/raw/working_database_clean.csv` (16,827 real tools)
- Prisma system configured but unused
- Two disconnected data sources

**Immediate Solution**:
1. Connect frontend to existing API (`/api/tools`)
2. Replace hardcoded data with API calls
3. Migrate CSV to PostgreSQL via Prisma
4. Unify TypeScript types

### 2. Performance and Scalability
**Problems**:
- Synchronous CSV reading on each request
- No cache (Redis)
- Non-optimized client-side pagination

**Solutions**:
- Redis cache with appropriate TTL
- Server-side pagination
- Prisma query optimization

### 3. Security
**Problems**:
- Unprotected admin interface
- No authentication
- Missing input validation

**Solutions**:
- NextAuth.js with user roles
- Zod validation on all forms
- CSRF protection and security headers

---

## 📈 Development Plan by Phases

### 🚀 Phase 1: Stabilization (3-4 weeks)
**Priority: Resolve critical issues**

**Week 1-2: Architecture**
- [ ] CSV → PostgreSQL + Prisma migration
- [ ] Frontend/API connection
- [ ] TypeScript types unification
- [ ] Testing display of 16,827 tools

**Week 3-4: Performance**
- [ ] Redis cache implementation
- [ ] Query and pagination optimization
- [ ] Monitoring and logging

### 🎯 Phase 2: Core Features (4-6 weeks)
**Priority: Functional and secure product**

**Week 1-2: Authentication**
- [ ] NextAuth.js with roles
- [ ] Admin interface protection
- [ ] Session and security management

**Week 3-4: Admin Interface**
- [ ] Functional tools CRUD
- [ ] Articles editor (Gutenberg-like)
- [ ] Media upload and management

**Week 5-6: UX/UI**
- [ ] Advanced search system
- [ ] Filters and sorting
- [ ] Responsive design and accessibility

### 🌟 Phase 3: Evolution (6-8 weeks)
**Priority: Differentiation and growth**

**Week 1-3: User Features**
- [ ] Favorites system
- [ ] User accounts
- [ ] Notifications and alerts
- [ ] Navigation history

**Week 4-6: Advanced Content**
- [ ] Rating/reviews system
- [ ] Tool comparison
- [ ] AI recommendations
- [ ] Newsletter and automation

**Week 7-8: Analytics and Optimization**
- [ ] Google Analytics + events
- [ ] A/B testing framework
- [ ] Performance monitoring (Sentry)
- [ ] SEO and Core Web Vitals

---

## 📊 Metrics and KPIs

### Technical Performance
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: > 90 in all categories
- **Uptime**: > 99.9%
- **TTFB**: < 200ms

### Business Metrics
- **Traffic**: Unique visitors, page views, sources
- **Engagement**: Time on site, bounce rate, pages/session
- **Conversion**: Clicks to external tools, newsletter signup
- **Content**: Articles viewed, social shares, comments
- **SEO**: Rankings, impressions, CTR

### Product Metrics
- **Tools**: Additions/month, updates, popularity
- **Search**: Queries, zero results, filters used
- **Admin**: Actions per week, editing time

---

## 🔄 Key User Flows

### 1. Tool Discovery
```
Homepage → Category → Tool → External Site
   ↓
Search Bar → Results → Tool → Conversion
```

### 2. Specific Search
```
Search → Filters → Comparison → Selection → Tool → Action
```

### 3. Content Exploration
```
Homepage → Blog → Article → Mentioned Tools → Conversion
```

### 4. Administration
```
Login → Dashboard → Management (CRUD) → Publication → Cache Refresh
```

---

## ✅ Acceptance Criteria

### Definition of Done
A feature is considered complete when:
- [ ] Code reviewed and tested
- [ ] Unit and integration tests passed
- [ ] Documentation updated
- [ ] Accessibility validated
- [ ] Performance benchmarked
- [ ] Security audited
- [ ] Deployed to production

### Success Metrics by Phase
**Phase 1**: Functional site with 16,827 tools displayed
**Phase 2**: Complete and secure admin interface
**Phase 3**: 10k visitors/month and measured engagement

---

*Living document - Last updated: August 5, 2025*
*Next review: Phase 1 completion* 