# Guide du Développeur - VideoIA.net

Ce document fournit des directives techniques détaillées pour les développeurs travaillant sur le projet VideoIA.net. Il complète les règles générales définies dans GUIDELINES.md avec des informations spécifiques sur l'implémentation, les patterns à suivre et les pièges à éviter.

## 📋 Table des Matières
1. [Environnement de Développement](#environnement-de-développement)
2. [Architecture Next.js](#architecture-nextjs)
3. [Gestion d'État](#gestion-détat)
4. [Patterns React](#patterns-react)
5. [Optimisation des Performances](#optimisation-des-performances)
6. [Accès à la Base de Données](#accès-à-la-base-de-données)
7. [Gestion des Erreurs](#gestion-des-erreurs)
8. [Tests](#tests)
9. [Débogage](#débogage)
10. [Ressources et Exemples](#ressources-et-exemples)

## Environnement de Développement

### Configuration Requise
- Node.js v18+ (LTS recommandé)
- PostgreSQL 16+
- npm ou yarn
- VSCode recommandé avec les extensions suivantes :
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Installation
```bash
# Cloner le dépôt
git clone <repo-url>
cd video-ia.net

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos paramètres locaux

# Générer le client Prisma
npx prisma generate

# Démarrer le serveur de développement
npm run dev
```

### Scripts Utiles
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer l'application construite
- `npm run lint` - Vérifier le code avec ESLint
- `npm run type-check` - Vérifier les types TypeScript
- `npx prisma studio` - Interface visuelle pour explorer la base de données

## Architecture Next.js

### Structure App Router
VideoIA.net utilise l'architecture App Router de Next.js 15, qui diffère significativement du Pages Router. Points clés :

1. **Routes basées sur les dossiers** :
   - `app/[lang]/page.tsx` - Page d'accueil multilingue
   - `app/[lang]/layout.tsx` - Layout commun à toutes les pages de cette langue
   - `app/[lang]/tools/[slug]/page.tsx` - Page détaillée d'un outil

2. **Composants Server vs Client** :
   - Par défaut, tous les composants sont des Server Components
   - Ajoutez `'use client'` en haut du fichier pour créer un Client Component
   - Les Server Components ne peuvent pas utiliser les hooks React ou gérer l'état

3. **Chargement des données** :
   - Utilisez des fonctions asynchrones directement dans les Server Components
   - Pas besoin de getServerSideProps/getStaticProps comme dans Pages Router

### Exemple de Server Component
```tsx
// app/[lang]/categories/page.tsx
import { multilingualCategoriesService } from '@/src/lib/database/services/multilingual-categories'
import { CategoryGrid } from '@/src/components/categories/CategoryGrid'

export default async function CategoriesPage({ params }: { params: { lang: string } }) {
  const { lang } = params
  
  // Chargement des données directement dans le composant serveur
  const categories = await multilingualCategoriesService.getAllCategories(lang)
  
  return (
    <div className="container mx-auto py-8">
      <h1>Toutes les catégories</h1>
      <CategoryGrid categories={categories} lang={lang} />
    </div>
  )
}
```

### Exemple de Client Component
```tsx
// src/components/categories/CategoryFilter.tsx
'use client'

import { useState } from 'react'

export function CategoryFilter({ categories, onFilterChange }) {
  const [filter, setFilter] = useState('')
  
  const handleChange = (e) => {
    const newFilter = e.target.value
    setFilter(newFilter)
    onFilterChange(newFilter)
  }
  
  return (
    <input 
      type="text" 
      value={filter} 
      onChange={handleChange} 
      placeholder="Filtrer les catégories..." 
    />
  )
}
```

## Gestion d'État

### Principes Fondamentaux
1. **Minimalisme** - Gardez l'état aussi minimal que possible
2. **Localisation** - Gardez l'état aussi proche que possible de son utilisation
3. **Dérivation** - Dérivez l'état calculé plutôt que de le stocker
4. **Immutabilité** - Ne modifiez jamais l'état directement

### Patterns Recommandés
- **État local** - `useState` pour l'état spécifique à un composant
- **État complexe** - `useReducer` pour la logique d'état complexe
- **État partagé** - Context API pour l'état partagé entre composants
- **État serveur** - Server Components pour l'état initial

### Anti-patterns à Éviter
- **Prop drilling excessif** - Utilisez Context API si vous passez des props à travers plus de 3 niveaux
- **État global excessif** - Ne mettez pas tout dans un contexte global
- **Dépendances circulaires** - Évitez les références circulaires entre hooks

### Exemple de Context API
```tsx
// src/lib/i18n/context.tsx
'use client'

import { createContext, useContext, useState } from 'react'
import type { SupportedLanguage } from './types'

interface I18nContextType {
  currentLanguage: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children, initialLang }) {
  const [currentLanguage, setLanguage] = useState<SupportedLanguage>(initialLang)
  
  return (
    <I18nContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
```

## Patterns React

### Composition vs Héritage
Privilégiez la composition plutôt que l'héritage pour la réutilisation du code :

```tsx
// ❌ Évitez l'héritage
class SpecialButton extends Button {
  // ...
}

// ✅ Utilisez la composition
function SpecialButton(props) {
  return <Button className="special" {...props} />
}
```

### Hooks Personnalisés
Créez des hooks personnalisés pour extraire la logique réutilisable :

```tsx
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}
```

### Render Props
Utilisez le pattern render props pour partager la logique entre composants :

```tsx
function DataFetcher({ url, render }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  return render({ data, loading })
}

// Utilisation
<DataFetcher 
  url="/api/tools" 
  render={({ data, loading }) => (
    loading ? <Spinner /> : <ToolsList tools={data} />
  )} 
/>
```

## Optimisation des Performances

### Memoization
Utilisez `React.memo`, `useMemo` et `useCallback` pour éviter les rendus inutiles :

```tsx
// Composant memoizé
const ToolCard = React.memo(function ToolCard({ tool }) {
  return <div>{/* ... */}</div>
})

// Valeur memoizée
const filteredTools = useMemo(() => {
  return tools.filter(tool => tool.category === selectedCategory)
}, [tools, selectedCategory])

// Fonction memoizée
const handleToolClick = useCallback((toolId) => {
  console.log(`Tool clicked: ${toolId}`)
}, [])
```

### Lazy Loading
Utilisez le chargement différé pour les composants lourds :

```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Pagination et Virtualisation
- Limitez le nombre d'éléments affichés à la fois (24 par page)
- Utilisez la virtualisation pour les listes très longues

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }) {
  const parentRef = useRef(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })
  
  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Images Optimisées
Utilisez toujours le composant `next/image` pour les images :

```tsx
import Image from 'next/image'

function ToolImage({ tool }) {
  return (
    <Image
      src={tool.imageUrl || '/images/placeholders/tool-1.jpg'}
      alt={tool.name}
      width={300}
      height={200}
      priority={tool.featured}
      loading="lazy"
    />
  )
}
```

## Accès à la Base de Données

### Utilisation de Prisma
Utilisez toujours le client Prisma pour accéder à la base de données :

```tsx
import { prisma } from '@/src/lib/database/client'

async function getToolById(id: string) {
  return prisma.tool.findUnique({
    where: { id },
    include: {
      translations: true
    }
  })
}
```

### Sérialisation des Objets Decimal
Utilisez toujours `serializePrismaObject` pour convertir les objets Decimal :

```tsx
import { serializePrismaObject } from '@/src/lib/utils/prismaHelpers'

async function getToolsWithRatings() {
  const tools = await prisma.tool.findMany({
    where: { quality_score: { gte: 4.0 } }
  })
  
  // Convertir les objets Decimal en nombres JavaScript
  return serializePrismaObject(tools)
}
```

### Transactions
Utilisez les transactions pour les opérations multiples :

```tsx
async function createToolWithTranslations(toolData, translations) {
  return prisma.$transaction(async (tx) => {
    const tool = await tx.tool.create({
      data: toolData
    })
    
    for (const translation of translations) {
      await tx.toolTranslation.create({
        data: {
          ...translation,
          tool_id: tool.id
        }
      })
    }
    
    return tool
  })
}
```

### Requêtes Optimisées
Évitez les requêtes N+1 en utilisant `include` et `select` :

```tsx
// ❌ Problème N+1
const tools = await prisma.tool.findMany()
for (const tool of tools) {
  tool.translations = await prisma.toolTranslation.findMany({
    where: { tool_id: tool.id }
  })
}

// ✅ Requête optimisée
const tools = await prisma.tool.findMany({
  include: {
    translations: true
  }
})
```

## Gestion des Erreurs

### Erreurs Côté Serveur
Utilisez les fonctions d'erreur de Next.js pour gérer les erreurs côté serveur :

```tsx
// app/[lang]/tools/[slug]/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error('Tool page error:', error)
  }, [error])

  return (
    <div className="error-container">
      <h2>Une erreur est survenue</h2>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  )
}
```

### Gestion des Erreurs API
Standardisez la gestion des erreurs dans les routes API :

```tsx
// app/api/tools/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Logique de récupération des outils
    const tools = await getTools()
    
    return NextResponse.json({
      success: true,
      data: tools
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tools',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
```

### Boundary Components
Créez des composants boundary pour isoler les erreurs :

```tsx
'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Component error:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
```

## Tests

### Types de Tests
- **Tests unitaires** - Tester des fonctions et composants isolés
- **Tests d'intégration** - Tester l'interaction entre plusieurs composants
- **Tests e2e** - Tester l'application de bout en bout

### Outils Recommandés
- Jest pour les tests unitaires et d'intégration
- React Testing Library pour tester les composants
- Cypress pour les tests e2e

### Exemple de Test Unitaire
```tsx
// src/lib/utils/__tests__/prismaHelpers.test.ts
import { serializePrismaObject } from '../prismaHelpers'
import { Prisma } from '@prisma/client'

describe('serializePrismaObject', () => {
  it('should convert Decimal to number', () => {
    const decimal = new Prisma.Decimal(4.5)
    const obj = { score: decimal }
    
    const result = serializePrismaObject(obj)
    
    expect(result.score).toBe(4.5)
    expect(typeof result.score).toBe('number')
  })
  
  it('should handle nested objects', () => {
    const obj = {
      tool: {
        score: new Prisma.Decimal(4.5)
      }
    }
    
    const result = serializePrismaObject(obj)
    
    expect(result.tool.score).toBe(4.5)
    expect(typeof result.tool.score).toBe('number')
  })
})
```

### Exemple de Test de Composant
```tsx
// src/components/tools/__tests__/ToolCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ToolCard } from '../ToolCard'

describe('ToolCard', () => {
  const mockTool = {
    id: '1',
    name: 'Test Tool',
    displayName: 'Test Tool',
    slug: 'test-tool',
    description: 'A test tool',
    displayDescription: 'A test tool',
    url: 'https://example.com',
    image_url: '/test.jpg',
    quality_score: 4.5,
    resolvedLanguage: 'en',
    translationSource: 'original'
  }
  
  it('should render tool name', () => {
    render(<ToolCard tool={mockTool} lang="en" />)
    expect(screen.getByText('Test Tool')).toBeInTheDocument()
  })
  
  it('should render tool description', () => {
    render(<ToolCard tool={mockTool} lang="en" />)
    expect(screen.getByText('A test tool')).toBeInTheDocument()
  })
})
```

## Débogage

### Outils de Débogage
- **Console du navigateur** - Pour les erreurs côté client
- **Logs serveur** - Pour les erreurs côté serveur
- **React DevTools** - Pour inspecter les composants React
- **Prisma Studio** - Pour explorer la base de données

### Techniques de Débogage
1. **Logs structurés** - Utilisez des logs structurés avec des niveaux de sévérité
2. **Points d'arrêt** - Utilisez `debugger` ou les points d'arrêt de VSCode
3. **Tests isolés** - Créez des tests isolés pour reproduire les bugs
4. **Environnement de développement** - Utilisez l'environnement de développement pour des messages d'erreur détaillés

### Exemple de Logs Structurés
```tsx
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error)
}

// Utilisation
try {
  const result = await complexOperation()
  logger.info('Operation completed', { result })
} catch (error) {
  logger.error('Operation failed', error)
}
```

## Ressources et Exemples

### Composants Exemplaires
Étudiez ces composants comme références de bonnes pratiques :
- `src/components/tools/ToolCard.tsx` - Composant client avec gestion d'image et fallbacks
- `app/[lang]/tools/page.tsx` - Page serveur avec chargement de données et SEO
- `src/lib/database/services/multilingual-tools.ts` - Service avec cache et gestion des erreurs

### Documentation Externe
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation TailwindCSS](https://tailwindcss.com/docs)
- [React Patterns](https://reactpatterns.com/)

### Tutoriels Internes
- [Ajouter une nouvelle page](./docs/tutorials/add-new-page.md)
- [Créer un nouveau service de données](./docs/tutorials/create-data-service.md)
- [Implémenter l'internationalisation](./docs/tutorials/implement-i18n.md)

---

Ce guide est évolutif et sera mis à jour au fur et à mesure que le projet évolue. N'hésitez pas à suggérer des améliorations ou des ajouts.
