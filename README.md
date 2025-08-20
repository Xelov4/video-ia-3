# 🐳 Video-IA.net - Dockerized AI Tools Directory

Complete Next.js application with PostgreSQL database containing 16,000+ AI tools.
**Now fully containerized with Docker for easy deployment and migration.**

## 🏗️ Structure du Projet

```
video-ia.net/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── scrape/
│   │       └── route.ts         # API endpoint principal
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Page d'accueil
│
├── src/                         # Code source principal
│   ├── components/              # Composants React
│   │   ├── ui/                  # Composants d'interface
│   │   │   ├── ScraperForm.tsx  # Formulaire de scraping
│   │   │   ├── ResultsDisplay.tsx # Affichage des résultats
│   │   │   └── LoadingSpinner.tsx # Indicateur de chargement
│   │   ├── forms/               # Composants de formulaires
│   │   ├── display/             # Composants d'affichage
│   │   └── common/              # Composants communs
│   │
│   ├── lib/                     # Librairies et utilitaires
│   │   ├── scraper/            # Logique de scraping
│   │   │   └── core.ts         # Fonctions de scraping principales
│   │   ├── ai/                 # Intégration IA
│   │   │   └── analyzer.ts     # Analyse avec Gemini AI
│   │   ├── database/           # Base de données
│   │   │   ├── schema.sql      # Schéma PostgreSQL multilingue
│   │   │   ├── types.ts        # Types TypeScript
│   │   │   └── integration.ts  # Intégration DB
│   │   └── translations/       # Gestion des traductions
│   │
│   ├── types/                  # Définitions TypeScript
│   │   ├── index.ts           # Export principal
│   │   ├── scraper.ts         # Types pour le scraping
│   │   └── analysis.ts        # Types pour l'analyse
│   │
│   ├── services/              # Services métier
│   │   └── scraper.ts         # Service principal de scraping
│   │
│   ├── utils/                 # Utilitaires
│   │   └── content.ts         # Génération de contenu
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── constants/             # Constantes
│   └── context/               # Contextes React
│
├── docs/                      # Documentation
│   ├── api/                   # Documentation API
│   ├── components/           # Documentation composants
│   └── database/             # Documentation base de données
│
├── public/                   # Fichiers statiques
│   ├── assets/              # Assets généraux
│   ├── screenshots/         # Screenshots capturés
│   └── logos/               # Logos extraits
│
├── scripts/                 # Scripts utilitaires
├── tests/                   # Tests unitaires et d'intégration
└── Specifications/         # Spécifications du projet
    └── prd2.md             # Product Requirements Document
```

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Actuelles

- **Scraping Web Avancé**: Extraction automatique de contenu avec Puppeteer
- **Capture d'Écrans**: Screenshots en 1920x1080 format WebP optimisé
- **Extraction de Logos**: Détection automatique des logos avec 15+ sélecteurs
- **Analyse IA**: Utilisation de Google Gemini pour l'analyse de contenu
- **Données Multilingues**: Support pour 7 langues (DE, NL, IT, EN, PT, FR, ES)
- **Liens Sociaux**: Extraction de 40+ plateformes sociales
- **Informations de Contact**: Email, téléphone, formulaires, support
- **Analyse de Prix**: Détection automatique des modèles de tarification
- **Programmes d'Affiliation**: Détection et extraction d'informations
- **Contenu SEO**: Génération automatique de meta-titres et descriptions
- **Base de Données**: Modèle PostgreSQL complet et normalisé

### 🎯 Données Extraites

| Catégorie | Données |
|-----------|---------|
| **Informations de Base** | URL, titre, contenu, metadata, screenshots, logos |
| **Contact** | Email, téléphone, adresse, formulaires de contact, support |
| **Réseaux Sociaux** | LinkedIn, Twitter, GitHub, YouTube, Discord, etc. (40+ plateformes) |
| **Analyse IA** | Fonctions principales, caractéristiques, audiences cibles, catégories |
| **Tarification** | Plans, prix, cycles de facturation, niveaux gratuits/payants |
| **Affiliation** | Programmes partenaires, contacts, formulaires |
| **SEO** | Meta-titres, descriptions, tags, contenu HTML optimisé |
| **Traductions** | Support complet multilingue pour 7 langues |

## 🛠️ Technologies

- **Framework**: Next.js 14 avec App Router
- **Language**: TypeScript
- **Scraping**: Puppeteer + Cheerio
- **IA**: Google Gemini AI
- **Base de Données**: PostgreSQL avec types TypeScript
- **Styles**: Tailwind CSS
- **Tests**: À implémenter

## 🚀 Quick Start with Docker

### One-Command Deployment
```bash
# Complete deployment (recommended)
./deploy-docker.sh

# Access application
http://localhost:3000
```

### Manual Docker Setup
```bash
# Build and start
docker compose up -d

# Check status
docker compose ps
```

### Traditional Development
```bash
npm install
npm run dev
```

## ⚙️ Configuration

### Variables d'Environnement

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Base de Données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=video_ia_net
DB_USER=postgres
DB_PASSWORD=your_password

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Base de Données

```bash
# Créer la base de données
createdb video_ia_net

# Exécuter le schéma
psql -d video_ia_net -f src/lib/database/schema.sql
```

## 🎨 Architecture

### Principe de Séparation des Responsabilités

- **`app/`**: Interface utilisateur et API routes (Next.js App Router)
- **`src/lib/`**: Logique métier et intégrations externes
- **`src/components/`**: Composants React réutilisables
- **`src/types/`**: Définitions TypeScript centralisées
- **`src/services/`**: Services métier de haut niveau
- **`src/utils/`**: Fonctions utilitaires pures

### Flux de Données

1. **Input**: URL soumise via `ScraperForm`
2. **Scraping**: `ScraperService` → `scrapeWebsite()` avec Puppeteer
3. **Analyse IA**: `analyzeWithGemini()` pour l'analyse de contenu
4. **Traduction**: `translateToFrench()` pour le contenu multilingue
5. **Stockage**: `DatabaseIntegration` pour la persistance
6. **Affichage**: `ResultsDisplay` avec onglets multilingues

## 📚 Utilisation de l'API

### POST /api/scrape

```typescript
// Request
{
  "url": "https://example-ai-tool.com"
}

// Response
{
  "toolName": "Example AI Tool",
  "slug": "example-ai-tool",
  "primaryFunction": "AI-powered content generation",
  "keyFeatures": ["Feature 1", "Feature 2"],
  "targetAudience": ["Content creators", "Businesses"],
  "pricingModel": "Freemium",
  "category": "Content Creation",
  "confidence": 85,
  "dataCompleteness": 90,
  "logoUrl": "/logos/logo_example_123456.webp",
  "screenshotUrl": "/screenshots/screenshot_example_123456.webp",
  // ... plus de données
}
```

## 🔧 Développement

### Ajouter un Nouveau Composant

```bash
# Créer dans le bon dossier
touch src/components/ui/NewComponent.tsx
```

### Ajouter un Nouveau Service

```bash
# Créer le service
touch src/services/newService.ts

# Ajouter les types associés
touch src/types/newService.ts
```

### Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # Linter
npm run type-check   # Vérification TypeScript
```

## 🌐 Support Multilingue

Le système supporte nativement 7 langues :

- 🇩🇪 **Allemand** (de)
- 🇳🇱 **Néerlandais** (nl)  
- 🇮🇹 **Italien** (it)
- 🇬🇧 **Anglais** (en)
- 🇵🇹 **Portugais** (pt)
- 🇫🇷 **Français** (fr)
- 🇪🇸 **Espagnol** (es)

### Structure Base de Données Multilingue

- Tables normalisées par langue
- Traductions automatiques via IA
- Support des caractéristiques, audiences et tags multilingues
- API de recherche par langue

## 📈 Performance

- **Screenshots**: Format WebP avec compression optimisée
- **Caching**: Mise en cache des résultats d'analyse
- **Database**: Index optimisés pour les requêtes multilingues
- **Scraping**: Timeouts et retry logic configurables

## 🔒 Sécurité

- Validation des URLs
- Sanitisation des contenus HTML
- Rate limiting sur l'API IA
- Variables d'environnement sécurisées

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Vérification des types
npm run type-check

# Déploiement (exemple Vercel)
vercel --prod
```

## 🤝 Contribution

1. Créer une branche feature
2. Suivre les conventions TypeScript
3. Ajouter des tests si nécessaire
4. Mettre à jour la documentation
5. Créer une Pull Request

## 📝 TODO

- [ ] Tests unitaires et d'intégration
- [ ] API de traduction pour toutes les langues
- [ ] Interface d'administration
- [ ] Export en formats multiples (PDF, DOCX)
- [ ] API publique avec authentification
- [ ] Dashboard analytics
- [ ] Intégration webhooks

---

**Créé avec ❤️ pour Video-IA.net**