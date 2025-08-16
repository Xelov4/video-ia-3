'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { ExternalLink, Star, Users, Eye, Calendar, Tag, Heart, Bookmark, Share2, Download, Play, CheckCircle, AlertCircle, Info, TrendingUp, Award, Zap, Globe, Shield, Clock, DollarSign } from 'lucide-react'
import { SupportedLocale } from '@/middleware'
import Image from 'next/image'

import { Button } from '@/src/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Separator } from '@/src/components/ui/separator'
import { cn } from '@/src/lib/utils'

import { ToolWithTranslation } from '@/src/lib/database/services/multilingual-tools'
import BreadcrumbWrapper from '@/src/components/layout/BreadcrumbWrapper'

interface ToolDetailClientProps {
  tool: ToolWithTranslation
  lang: SupportedLocale
  relatedTools?: ToolWithTranslation[]
  similarTools?: ToolWithTranslation[]
}

// Hero Stats Component
const HeroStats = ({ tool, t }: { tool: ToolWithTranslation; t: any }) => {
  const stats = [
    {
      icon: Star,
      label: t.qualityScore,
      value: tool.quality_score ? `${tool.quality_score.toFixed(1)}/10` : 'N/A',
      color: 'text-yellow-500'
    },
    {
      icon: Users,
      label: t.userCount,
      value: tool.view_count ? tool.view_count.toLocaleString() : '0',
      color: 'text-blue-500'
    },
    {
      icon: Eye,
      label: t.views,
      value: tool.view_count ? `${Math.floor(tool.view_count / 100)}k+` : '0',
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      label: t.trending,
      value: tool.is_featured ? t.featured : t.standard,
      color: tool.is_featured ? 'text-purple-500' : 'text-gray-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <Icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, accent = false }: {
  icon: any;
  title: string;
  description: string;
  accent?: boolean;
}) => (
  <Card className={cn("border-0 shadow-sm h-full", accent && "border-l-4 border-l-primary")}>
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div className={cn("p-2 rounded-lg", accent ? "bg-primary/10" : "bg-gray-100")}>
          <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-gray-600")} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

// Tool Card Component for recommendations
const ToolCard = ({ tool, lang, onClick }: { 
  tool: ToolWithTranslation; 
  lang: SupportedLocale; 
  onClick: () => void;
}) => (
  <Card 
    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm hover:-translate-y-1"
    onClick={onClick}
  >
    <CardContent className="p-0">
      <div className="relative w-full h-32 bg-gray-100 overflow-hidden rounded-t-lg">
        <Image 
          src={tool.image_url || "/images/placeholders/ai-placeholder.jpg"}
          alt={tool.displayName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-xs">
            {tool.toolCategory}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-sm">
          {tool.displayName}
        </h4>
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
          {tool.displayDescription}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-xs text-gray-500">
            <Star className="h-3 w-3 mr-1 text-yellow-400" />
            <span>{tool.quality_score?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            <span>{tool.view_count || 0}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function ToolDetailClient({
  tool,
  lang,
  relatedTools = [],
  similarTools = []
}: ToolDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  // Traductions pour l'interface
  const getTranslations = (lang: SupportedLocale) => {
    const translations = {
      'en': {
        // Navigation
        home: 'Home',
        tools: 'Tools',
        
        // Actions
        visitTool: 'Visit Tool',
        viewPricing: 'View Pricing',
        shareThis: 'Share This',
        bookmark: 'Bookmark',
        like: 'Like',
        download: 'Download',
        watchDemo: 'Watch Demo',
        
        // Stats
        qualityScore: 'Quality',
        userCount: 'Users',
        views: 'Views',
        trending: 'Status',
        featured: 'Featured',
        standard: 'Standard',
        
        // Sections
        overview: 'Overview',
        features: 'Features',
        pricing: 'Pricing',
        reviews: 'Reviews',
        alternatives: 'Alternatives',
        details: 'Details',
        
        // Content
        description: 'Description',
        keyFeatures: 'Key Features',
        targetAudience: 'Target Audience',
        useCases: 'Use Cases',
        tags: 'Tags',
        category: 'Category',
        pricingType: 'Pricing',
        lastUpdated: 'Last Updated',
        website: 'Website',
        support: 'Support',
        
        // Related
        relatedTools: 'Related Tools',
        similarTools: 'Similar Tools',
        recommendedFor: 'Recommended for you',
        
        // Feature highlights
        highlights: 'Highlights',
        pros: 'Pros',
        cons: 'Cons',
        verifiedTool: 'Verified Tool',
        popularChoice: 'Popular Choice',
        editorsPick: 'Editor\'s Pick',
        
        // Placeholders
        noDescription: 'No description available',
        noFeatures: 'No features listed',
        noTags: 'No tags available',
        loadingReviews: 'Loading reviews...',
        
        // Actions feedback
        bookmarked: 'Bookmarked!',
        liked: 'Liked!',
        shared: 'Link copied!'
      },
      'fr': {
        // Navigation
        home: 'Accueil',
        tools: 'Outils',
        
        // Actions
        visitTool: 'Visiter l\'outil',
        viewPricing: 'Voir la tarification',
        shareThis: 'Partager',
        bookmark: 'Sauvegarder',
        like: 'J\'aime',
        download: 'Télécharger',
        watchDemo: 'Voir la démo',
        
        // Stats
        qualityScore: 'Qualité',
        userCount: 'Utilisateurs',
        views: 'Vues',
        trending: 'Statut',
        featured: 'Vedette',
        standard: 'Standard',
        
        // Sections
        overview: 'Aperçu',
        features: 'Fonctionnalités',
        pricing: 'Tarification',
        reviews: 'Avis',
        alternatives: 'Alternatives',
        details: 'Détails',
        
        // Content
        description: 'Description',
        keyFeatures: 'Fonctionnalités clés',
        targetAudience: 'Public cible',
        useCases: 'Cas d\'usage',
        tags: 'Tags',
        category: 'Catégorie',
        pricingType: 'Tarification',
        lastUpdated: 'Dernière mise à jour',
        website: 'Site web',
        support: 'Support',
        
        // Related
        relatedTools: 'Outils connexes',
        similarTools: 'Outils similaires',
        recommendedFor: 'Recommandé pour vous',
        
        // Feature highlights
        highlights: 'Points forts',
        pros: 'Avantages',
        cons: 'Inconvénients',
        verifiedTool: 'Outil vérifié',
        popularChoice: 'Choix populaire',
        editorsPick: 'Choix de l\'éditeur',
        
        // Placeholders
        noDescription: 'Aucune description disponible',
        noFeatures: 'Aucune fonctionnalité listée',
        noTags: 'Aucun tag disponible',
        loadingReviews: 'Chargement des avis...',
        
        // Actions feedback
        bookmarked: 'Sauvegardé !',
        liked: 'Aimé !',
        shared: 'Lien copié !'
      },
      'es': {
        // Navigation
        home: 'Inicio',
        tools: 'Herramientas',
        
        // Actions
        visitTool: 'Visitar herramienta',
        viewPricing: 'Ver precios',
        shareThis: 'Compartir',
        bookmark: 'Guardar',
        like: 'Me gusta',
        download: 'Descargar',
        watchDemo: 'Ver demo',
        
        // Stats
        qualityScore: 'Calidad',
        userCount: 'Usuarios',
        views: 'Vistas',
        trending: 'Estado',
        featured: 'Destacado',
        standard: 'Estándar',
        
        // Sections
        overview: 'Resumen',
        features: 'Características',
        pricing: 'Precios',
        reviews: 'Reseñas',
        alternatives: 'Alternativas',
        details: 'Detalles',
        
        // Content
        description: 'Descripción',
        keyFeatures: 'Características clave',
        targetAudience: 'Público objetivo',
        useCases: 'Casos de uso',
        tags: 'Etiquetas',
        category: 'Categoría',
        pricingType: 'Precios',
        lastUpdated: 'Última actualización',
        website: 'Sitio web',
        support: 'Soporte',
        
        // Related
        relatedTools: 'Herramientas relacionadas',
        similarTools: 'Herramientas similares',
        recommendedFor: 'Recomendado para ti',
        
        // Feature highlights
        highlights: 'Destacados',
        pros: 'Ventajas',
        cons: 'Desventajas',
        verifiedTool: 'Herramienta verificada',
        popularChoice: 'Opción popular',
        editorsPick: 'Elección del editor',
        
        // Placeholders
        noDescription: 'Sin descripción disponible',
        noFeatures: 'Sin características listadas',
        noTags: 'Sin etiquetas disponibles',
        loadingReviews: 'Cargando reseñas...',
        
        // Actions feedback
        bookmarked: '¡Guardado!',
        liked: '¡Me gusta!',
        shared: '¡Enlace copiado!'
      },
      'de': {
        // Navigation
        home: 'Startseite',
        tools: 'Tools',
        
        // Actions
        visitTool: 'Tool besuchen',
        viewPricing: 'Preise anzeigen',
        shareThis: 'Teilen',
        bookmark: 'Merken',
        like: 'Gefällt mir',
        download: 'Herunterladen',
        watchDemo: 'Demo ansehen',
        
        // Stats
        qualityScore: 'Qualität',
        userCount: 'Nutzer',
        views: 'Aufrufe',
        trending: 'Status',
        featured: 'Hervorgehoben',
        standard: 'Standard',
        
        // Sections
        overview: 'Übersicht',
        features: 'Funktionen',
        pricing: 'Preise',
        reviews: 'Bewertungen',
        alternatives: 'Alternativen',
        details: 'Details',
        
        // Content
        description: 'Beschreibung',
        keyFeatures: 'Hauptfunktionen',
        targetAudience: 'Zielgruppe',
        useCases: 'Anwendungsfälle',
        tags: 'Tags',
        category: 'Kategorie',
        pricingType: 'Preise',
        lastUpdated: 'Zuletzt aktualisiert',
        website: 'Website',
        support: 'Support',
        
        // Related
        relatedTools: 'Verwandte Tools',
        similarTools: 'Ähnliche Tools',
        recommendedFor: 'Empfohlen für Sie',
        
        // Feature highlights
        highlights: 'Highlights',
        pros: 'Vorteile',
        cons: 'Nachteile',
        verifiedTool: 'Verifiziertes Tool',
        popularChoice: 'Beliebte Wahl',
        editorsPick: 'Redaktionsempfehlung',
        
        // Placeholders
        noDescription: 'Keine Beschreibung verfügbar',
        noFeatures: 'Keine Funktionen aufgelistet',
        noTags: 'Keine Tags verfügbar',
        loadingReviews: 'Bewertungen werden geladen...',
        
        // Actions feedback
        bookmarked: 'Gemerkt!',
        liked: 'Gefällt mir!',
        shared: 'Link kopiert!'
      },
      'it': {
        // Navigation
        home: 'Home',
        tools: 'Strumenti',
        
        // Actions
        visitTool: 'Visita strumento',
        viewPricing: 'Vedi prezzi',
        shareThis: 'Condividi',
        bookmark: 'Segnalibro',
        like: 'Mi piace',
        download: 'Scarica',
        watchDemo: 'Guarda demo',
        
        // Stats
        qualityScore: 'Qualità',
        userCount: 'Utenti',
        views: 'Visualizzazioni',
        trending: 'Stato',
        featured: 'In evidenza',
        standard: 'Standard',
        
        // Sections
        overview: 'Panoramica',
        features: 'Funzionalità',
        pricing: 'Prezzi',
        reviews: 'Recensioni',
        alternatives: 'Alternative',
        details: 'Dettagli',
        
        // Content
        description: 'Descrizione',
        keyFeatures: 'Funzionalità chiave',
        targetAudience: 'Pubblico target',
        useCases: 'Casi d\'uso',
        tags: 'Tag',
        category: 'Categoria',
        pricingType: 'Prezzi',
        lastUpdated: 'Ultimo aggiornamento',
        website: 'Sito web',
        support: 'Supporto',
        
        // Related
        relatedTools: 'Strumenti correlati',
        similarTools: 'Strumenti simili',
        recommendedFor: 'Consigliato per te',
        
        // Feature highlights
        highlights: 'Caratteristiche',
        pros: 'Pro',
        cons: 'Contro',
        verifiedTool: 'Strumento verificato',
        popularChoice: 'Scelta popolare',
        editorsPick: 'Scelta dell\'editore',
        
        // Placeholders
        noDescription: 'Nessuna descrizione disponibile',
        noFeatures: 'Nessuna funzionalità elencata',
        noTags: 'Nessun tag disponibile',
        loadingReviews: 'Caricamento recensioni...',
        
        // Actions feedback
        bookmarked: 'Salvato!',
        liked: 'Mi piace!',
        shared: 'Link copiato!'
      },
      'nl': {
        // Navigation
        home: 'Home',
        tools: 'Tools',
        
        // Actions
        visitTool: 'Bezoek tool',
        viewPricing: 'Bekijk prijzen',
        shareThis: 'Delen',
        bookmark: 'Bladwijzer',
        like: 'Vind ik leuk',
        download: 'Downloaden',
        watchDemo: 'Bekijk demo',
        
        // Stats
        qualityScore: 'Kwaliteit',
        userCount: 'Gebruikers',
        views: 'Weergaven',
        trending: 'Status',
        featured: 'Uitgelicht',
        standard: 'Standaard',
        
        // Sections
        overview: 'Overzicht',
        features: 'Functies',
        pricing: 'Prijzen',
        reviews: 'Beoordelingen',
        alternatives: 'Alternatieven',
        details: 'Details',
        
        // Content
        description: 'Beschrijving',
        keyFeatures: 'Belangrijkste functies',
        targetAudience: 'Doelgroep',
        useCases: 'Use cases',
        tags: 'Tags',
        category: 'Categorie',
        pricingType: 'Prijzen',
        lastUpdated: 'Laatst bijgewerkt',
        website: 'Website',
        support: 'Ondersteuning',
        
        // Related
        relatedTools: 'Gerelateerde tools',
        similarTools: 'Vergelijkbare tools',
        recommendedFor: 'Aanbevolen voor jou',
        
        // Feature highlights
        highlights: 'Hoogtepunten',
        pros: 'Voordelen',
        cons: 'Nadelen',
        verifiedTool: 'Geverifieerde tool',
        popularChoice: 'Populaire keuze',
        editorsPick: 'Redactiekeuze',
        
        // Placeholders
        noDescription: 'Geen beschrijving beschikbaar',
        noFeatures: 'Geen functies vermeld',
        noTags: 'Geen tags beschikbaar',
        loadingReviews: 'Beoordelingen laden...',
        
        // Actions feedback
        bookmarked: 'Opgeslagen!',
        liked: 'Leuk gevonden!',
        shared: 'Link gekopieerd!'
      },
      'pt': {
        // Navigation
        home: 'Início',
        tools: 'Ferramentas',
        
        // Actions
        visitTool: 'Visitar ferramenta',
        viewPricing: 'Ver preços',
        shareThis: 'Compartilhar',
        bookmark: 'Favoritar',
        like: 'Curtir',
        download: 'Baixar',
        watchDemo: 'Ver demo',
        
        // Stats
        qualityScore: 'Qualidade',
        userCount: 'Usuários',
        views: 'Visualizações',
        trending: 'Status',
        featured: 'Destaque',
        standard: 'Padrão',
        
        // Sections
        overview: 'Visão geral',
        features: 'Recursos',
        pricing: 'Preços',
        reviews: 'Avaliações',
        alternatives: 'Alternativas',
        details: 'Detalhes',
        
        // Content
        description: 'Descrição',
        keyFeatures: 'Recursos principais',
        targetAudience: 'Público-alvo',
        useCases: 'Casos de uso',
        tags: 'Tags',
        category: 'Categoria',
        pricingType: 'Preços',
        lastUpdated: 'Última atualização',
        website: 'Site',
        support: 'Suporte',
        
        // Related
        relatedTools: 'Ferramentas relacionadas',
        similarTools: 'Ferramentas similares',
        recommendedFor: 'Recomendado para você',
        
        // Feature highlights
        highlights: 'Destaques',
        pros: 'Prós',
        cons: 'Contras',
        verifiedTool: 'Ferramenta verificada',
        popularChoice: 'Escolha popular',
        editorsPick: 'Escolha do editor',
        
        // Placeholders
        noDescription: 'Nenhuma descrição disponível',
        noFeatures: 'Nenhum recurso listado',
        noTags: 'Nenhuma tag disponível',
        loadingReviews: 'Carregando avaliações...',
        
        // Actions feedback
        bookmarked: 'Favoritado!',
        liked: 'Curtido!',
        shared: 'Link copiado!'
      }
    }
    return translations[lang] || translations['en']
  }

  const t = getTranslations(lang)

  // Fonction pour obtenir le lien localisé
  const getLocalizedHref = (path: string) => {
    return lang === 'en' ? path : `/${lang}${path}`
  }

  // Handler pour navigation des outils recommandés
  const handleToolClick = (clickedTool: ToolWithTranslation) => {
    const slug = clickedTool.slug || clickedTool.toolName.toLowerCase().replace(/\s+/g, '-')
    const href = getLocalizedHref(`/t/${slug}`)
    window.location.href = href
  }

  // Actions handlers
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: Implement actual bookmark functionality
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implement actual like functionality
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: tool.displayName,
        text: tool.displayDescription,
        url: window.location.href
      })
    } catch (err) {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      {/* Breadcrumb Navigation */}
      <BreadcrumbWrapper lang={lang} toolName={tool.displayName} />
      
      <div className="container mx-auto px-4 py-8 md:py-12">

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Tool Image */}
                  <div className="md:w-1/3">
                    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                      <Image 
                        src={tool.image_url || "/images/placeholders/ai-placeholder.jpg"}
                        alt={tool.displayName}
                        fill
                        className="object-cover"
                      />
                      {tool.is_featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Award className="h-3 w-3 mr-1" />
                            {t.featured}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tool Info */}
                  <div className="md:w-2/3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                          {tool.displayName}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          {tool.displayDescription || t.noDescription}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <HeroStats tool={tool} t={t} />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <Button asChild size="lg" className="flex-1 sm:flex-none">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t.visitTool}
                        </a>
                      </Button>
                      
                      {tool.pricing_url && (
                        <Button asChild variant="outline" size="lg">
                          <a
                            href={tool.pricing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            {t.viewPricing}
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={cn(isLiked && "text-red-500")}
                      >
                        <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                        {t.like}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmark}
                        className={cn(isBookmarked && "text-blue-500")}
                      >
                        <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} />
                        {t.bookmark}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t.shareThis}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                <TabsTrigger value="features">{t.features}</TabsTrigger>
                <TabsTrigger value="pricing">{t.pricing}</TabsTrigger>
                <TabsTrigger value="reviews">{t.reviews}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                {tool.displayOverview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        {t.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {tool.displayOverview}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Target Audience */}
                {tool.target_audience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {t.targetAudience}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {tool.target_audience}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Use Cases */}
                {tool.use_cases && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        {t.useCases}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {tool.use_cases}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {tool.tags && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        {t.tags}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.split(',').map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                {tool.key_features ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {t.keyFeatures}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {tool.key_features}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{t.noFeatures}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureCard
                    icon={Shield}
                    title={t.verifiedTool}
                    description="This tool has been verified by our team"
                    accent={tool.is_featured}
                  />
                  <FeatureCard
                    icon={Globe}
                    title={t.website}
                    description="Available worldwide with multiple language support"
                  />
                  <FeatureCard
                    icon={Clock}
                    title={t.lastUpdated}
                    description="Regularly updated with new features and improvements"
                  />
                  <FeatureCard
                    icon={TrendingUp}
                    title={t.popularChoice}
                    description="Trusted by thousands of users globally"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {t.pricingType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {tool.pricing_type || 'Contact for pricing'}
                    </div>
                    {tool.pricing_url && (
                      <Button asChild>
                        <a 
                          href={tool.pricing_url}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {t.viewPricing}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{t.loadingReviews}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tool Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t.details}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tool.tool_category && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {t.category}
                    </div>
                    <Badge variant="outline">{tool.tool_category}</Badge>
                  </div>
                )}

                {tool.quality_score && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {t.qualityScore}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{tool.quality_score.toFixed(1)}/10</span>
                    </div>
                  </div>
                )}

                {tool.view_count && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {t.views}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="font-medium">{tool.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.relatedTools}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedTools.slice(0, 3).map((relatedTool) => (
                    <ToolCard
                      key={relatedTool.id}
                      tool={relatedTool}
                      lang={lang}
                      onClick={() => handleToolClick(relatedTool)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Similar Tools */}
            {similarTools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.similarTools}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarTools.slice(0, 3).map((similarTool) => (
                    <ToolCard
                      key={similarTool.id}
                      tool={similarTool}
                      lang={lang}
                      onClick={() => handleToolClick(similarTool)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Tools Carousel */}
        {(relatedTools.length > 3 || similarTools.length > 3) && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>{t.recommendedFor}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...relatedTools, ...similarTools].slice(0, 8).map((recommendedTool) => (
                    <ToolCard
                      key={recommendedTool.id}
                      tool={recommendedTool}
                      lang={lang}
                      onClick={() => handleToolClick(recommendedTool)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}