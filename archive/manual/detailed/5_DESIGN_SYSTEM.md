# Design System et Guidelines de Style de VideoIA.net

*Date de dernière mise à jour : 16 août 2025*

## Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Système de Couleurs](#système-de-couleurs)
3. [Typographie](#typographie)
4. [Espacement et Layout](#espacement-et-layout)
5. [Composants UI](#composants-ui)
6. [Iconographie](#iconographie)
7. [Responsive Design](#responsive-design)
8. [Dark Mode](#dark-mode)
9. [Accessibilité](#accessibilité)
10. [Implémentation TailwindCSS](#implémentation-tailwindcss)

## Vue d'Ensemble

Le design system de VideoIA.net est conçu pour offrir une expérience utilisateur cohérente, moderne et accessible. Il est basé sur TailwindCSS et suit les principes du design atomique, avec une hiérarchie claire de composants allant des éléments de base aux composants complexes.

Ce système vise à :
- Assurer la cohérence visuelle sur l'ensemble du site
- Accélérer le développement de nouvelles fonctionnalités
- Faciliter la maintenance à long terme
- Garantir l'accessibilité pour tous les utilisateurs
- S'adapter à différentes tailles d'écran et modes d'affichage

## Système de Couleurs

### Palette Principale

VideoIA.net utilise une palette de couleurs moderne centrée autour du bleu comme couleur primaire, avec des accents et des teintes neutres soigneusement sélectionnés.

#### Couleurs Primaires
- **Bleu Principal** : `#0066FF` (tailwind: `blue-600`)
  - Utilisé pour les éléments primaires d'action, liens principaux, boutons primaires
- **Bleu Foncé** : `#0047B3` (tailwind: `blue-800`)
  - Utilisé pour les états hover, focus des éléments bleus
- **Bleu Clair** : `#CCE0FF` (tailwind: `blue-100`)
  - Utilisé pour les arrière-plans, badges, alertes informatives

#### Couleurs Secondaires
- **Ambre** : `#FFC107` (tailwind: `amber-500`)
  - Utilisé pour les éléments mis en avant, badges featured
- **Vert** : `#10B981` (tailwind: `green-500`)
  - Utilisé pour les succès, validations, éléments positifs
- **Rouge** : `#EF4444` (tailwind: `red-500`)
  - Utilisé pour les erreurs, alertes, actions destructives

#### Couleurs Neutres
- **Gris Foncé** : `#111827` (tailwind: `gray-900`)
  - Texte principal
- **Gris Moyen** : `#6B7280` (tailwind: `gray-500`)
  - Texte secondaire, icônes
- **Gris Clair** : `#F3F4F6` (tailwind: `gray-100`)
  - Arrière-plans, séparateurs
- **Blanc** : `#FFFFFF` (tailwind: `white`)
  - Arrière-plan principal, texte sur fond sombre

### Variables CSS

Les couleurs sont définies dans le fichier `/src/styles/variables.css` :

```css
:root {
  --color-primary: #0066FF;
  --color-primary-dark: #0047B3;
  --color-primary-light: #CCE0FF;
  
  --color-secondary: #FFC107;
  --color-success: #10B981;
  --color-error: #EF4444;
  
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-background: #FFFFFF;
  --color-background-alt: #F3F4F6;
}

.dark {
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-background: #111827;
  --color-background-alt: #1F2937;
}
```

### Utilisation des Couleurs

- **Texte** : Utiliser les couleurs de texte primaire et secondaire pour assurer une bonne lisibilité
- **Arrière-plans** : Utiliser des arrière-plans subtils pour créer une hiérarchie visuelle
- **Actions** : Utiliser la couleur primaire pour les actions principales
- **Feedback** : Utiliser les couleurs de succès, d'erreur et d'information pour le feedback

## Typographie

VideoIA.net utilise une typographie claire et lisible basée sur la famille de polices Inter.

### Familles de Polices
- **Titre** : Inter, sans-serif
- **Corps** : Inter, sans-serif
- **Monospace** : Consolas, monospace (pour le code)

### Hiérarchie Typographique

| Élément | Taille | Poids | Classe Tailwind |
|---------|--------|-------|-----------------|
| H1 | 2.25rem (36px) | 700 | `text-4xl font-bold` |
| H2 | 1.875rem (30px) | 700 | `text-3xl font-bold` |
| H3 | 1.5rem (24px) | 600 | `text-2xl font-semibold` |
| H4 | 1.25rem (20px) | 600 | `text-xl font-semibold` |
| Body | 1rem (16px) | 400 | `text-base` |
| Small | 0.875rem (14px) | 400 | `text-sm` |
| XSmall | 0.75rem (12px) | 400 | `text-xs` |

### Configuration

La configuration typographique est définie dans le fichier `/tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
    },
  },
}
```

### Bonnes Pratiques Typographiques

- Utiliser la hiérarchie typographique pour créer une structure visuelle claire
- Maintenir un contraste suffisant entre le texte et l'arrière-plan
- Limiter les lignes à 70-80 caractères pour une meilleure lisibilité
- Utiliser un interlignage suffisant (généralement 1.5x la taille de la police)

## Espacement et Layout

VideoIA.net utilise un système d'espacement cohérent basé sur une unité de base de 4px (0.25rem).

### Grille d'Espacement

| Taille | Valeur | Classe Tailwind | Utilisation |
|--------|--------|-----------------|-------------|
| XS | 0.25rem (4px) | `p-1`, `m-1` | Espacement minimal entre éléments |
| SM | 0.5rem (8px) | `p-2`, `m-2` | Espacement entre éléments liés |
| MD | 1rem (16px) | `p-4`, `m-4` | Espacement standard |
| LG | 1.5rem (24px) | `p-6`, `m-6` | Espacement entre sections |
| XL | 2rem (32px) | `p-8`, `m-8` | Espacement entre blocs majeurs |
| 2XL | 3rem (48px) | `p-12`, `m-12` | Espacement de page |

### Système de Grille

VideoIA.net utilise le système de grille de Tailwind CSS basé sur Flexbox et CSS Grid.

#### Grille Responsive

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Contenu */}
}
```

#### Conteneurs

Le site utilise des conteneurs avec des largeurs maximales pour assurer une bonne lisibilité :

```jsx
<div className="container mx-auto px-4 max-w-7xl">
  {/* Contenu */}
}
```

### Breakpoints Responsive

| Nom | Taille | Classe Tailwind |
|-----|--------|-----------------|
| SM | 640px | `sm:` |
| MD | 768px | `md:` |
| LG | 1024px | `lg:` |
| XL | 1280px | `xl:` |
| 2XL | 1536px | `2xl:` |

## Composants UI

VideoIA.net utilise un ensemble de composants UI standardisés pour maintenir la cohérence visuelle.

### Boutons

Les boutons suivent une hiérarchie claire pour guider l'utilisateur :

#### Variantes de Boutons

- **Primary** : Actions principales, appels à l'action
  ```jsx
  <Button variant="default">Rechercher</Button>
  ```

- **Secondary** : Actions secondaires, alternatives
  ```jsx
  <Button variant="outline">Annuler</Button>
  ```

- **Ghost** : Actions tertiaires, contextuelles
  ```jsx
  <Button variant="ghost">En savoir plus</Button>
  ```

- **Link** : Liens stylisés comme des boutons
  ```jsx
  <Button variant="link">Voir tous</Button>
  ```

#### Tailles de Boutons

- **Small** : Utilisé dans les espaces restreints
  ```jsx
  <Button size="sm">Filtrer</Button>
  ```

- **Default** : Taille standard
  ```jsx
  <Button>Soumettre</Button>
  ```

- **Large** : Pour les actions importantes
  ```jsx
  <Button size="lg">S'inscrire</Button>
  ```

### Cartes

Les cartes sont utilisées pour présenter des informations structurées :

```jsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal de la carte
  </CardContent>
  <CardFooter>
    Actions ou informations supplémentaires
  </CardFooter>
</Card>
```

### Formulaires

Les éléments de formulaire sont stylisés de manière cohérente :

```jsx
<div className="space-y-4">
  <div>
    <Label htmlFor="name">Nom</Label>
    <Input id="name" placeholder="Votre nom" />
  </div>
  
  <div>
    <Label htmlFor="category">Catégorie</Label>
    <Select id="category">
      <option value="video">Vidéo</option>
      <option value="audio">Audio</option>
    </Select>
  </div>
  
  <Button type="submit">Envoyer</Button>
</div>
```

## Iconographie

VideoIA.net utilise la bibliothèque Lucide React pour les icônes.

### Utilisation des Icônes

```jsx
import { Search, Filter, ArrowRight } from 'lucide-react'

// Dans un composant
<Button>
  <Search className="w-4 h-4 mr-2" />
  Rechercher
</Button>
```

### Tailles d'Icônes Standardisées

| Contexte | Taille | Classe |
|----------|--------|--------|
| Petit | 16x16px | `w-4 h-4` |
| Standard | 20x20px | `w-5 h-5` |
| Grand | 24x24px | `w-6 h-6` |
| Extra large | 32x32px | `w-8 h-8` |

### Icônes de Catégories

Pour les catégories d'outils, VideoIA.net utilise un système d'émojis mappés aux catégories dans le fichier `/src/lib/services/emojiMapping.ts` :

```typescript
export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'video-editing': '🎬',
  'audio-processing': '🎵',
  'image-generation': '🖼️',
  'text-to-speech': '🗣️',
  'speech-to-text': '👂',
  'translation': '🌐',
  'content-writing': '✍️',
  'code-generation': '💻',
  // ...autres catégories
}

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI_MAP[category] || '🔧'
}

export function getCategoryEmojiString(category: string): string {
  return `${getCategoryEmoji(category)} `
}
```

## Responsive Design

VideoIA.net est conçu avec une approche "mobile-first" pour assurer une expérience optimale sur tous les appareils.

### Principes de Responsive Design

1. **Design Mobile-First** : Commencer par concevoir pour les petits écrans, puis ajouter des améliorations pour les écrans plus grands
2. **Grilles Flexibles** : Utiliser des grilles qui s'adaptent à la taille de l'écran
3. **Media Queries** : Utiliser les préfixes de Tailwind (`sm:`, `md:`, `lg:`, etc.)
4. **Images Responsives** : Utiliser le composant `next/image` avec des tailles appropriées

### Exemples de Patterns Responsives

#### Navigation Responsive

```jsx
// src/components/layout/ModernHeader.tsx
<header>
  {/* Navigation desktop */}
  <nav className="hidden lg:flex">
    {/* Liens de navigation */}
  </nav>
  
  {/* Navigation mobile avec menu hamburger */}
  <div className="lg:hidden">
    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
      <Menu className="w-6 h-6" />
    </button>
    
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 bg-white">
        {/* Contenu du menu mobile */}
      </div>
    )}
  </div>
</header>
```

#### Grille d'Outils Responsive

```jsx
// src/components/tools/ToolsGrid.tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {tools.map(tool => (
    <ToolCard key={tool.id} tool={tool} lang={lang} />
  ))}
</div>
```

## Dark Mode

VideoIA.net prend en charge un mode sombre complet qui peut être activé manuellement ou suivre les préférences du système.

### Implémentation

Le mode sombre est implémenté à l'aide de la fonctionnalité de dark mode de Tailwind CSS et de classes CSS personnalisées.

#### Configuration Tailwind

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...reste de la configuration
}
```

#### Gestion du Mode Sombre

```jsx
// src/components/ThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    
    localStorage.setItem('theme', theme)
  }, [theme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

#### Utilisation dans les Composants

```jsx
// src/components/ThemeToggle.tsx
'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/src/components/ThemeProvider'
import { Button } from '@/src/components/ui/Button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4" />
      </Button>
      
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

## Accessibilité

VideoIA.net est conçu pour être accessible à tous les utilisateurs, y compris ceux utilisant des technologies d'assistance.

### Principes d'Accessibilité

1. **Contraste** : Maintenir un rapport de contraste d'au moins 4.5:1 pour le texte normal et 3:1 pour le texte large
2. **Navigation au clavier** : Assurer que tous les éléments interactifs sont accessibles au clavier
3. **Attributs ARIA** : Utiliser les attributs ARIA appropriés pour améliorer l'accessibilité
4. **Structure sémantique** : Utiliser des éléments HTML sémantiques appropriés

### Exemples d'Implémentation

#### Bouton Accessible

```jsx
<button
  className="..."
  aria-label="Rechercher"
  disabled={isLoading}
>
  {isLoading ? 'Chargement...' : 'Rechercher'}
</button>
```

#### Image Accessible

```jsx
<Image
  src={tool.image_url || '/images/placeholders/tool-1.jpg'}
  alt={`Capture d'écran de ${tool.displayName}`}
  width={300}
  height={200}
/>
```

#### Formulaire Accessible

```jsx
<form>
  <div>
    <label htmlFor="search" className="sr-only">Rechercher</label>
    <input
      id="search"
      type="search"
      placeholder="Rechercher des outils..."
      aria-label="Rechercher des outils"
    />
  </div>
  
  <button type="submit" aria-label="Lancer la recherche">
    <Search className="w-4 h-4" />
  </button>
</form>
```

## Implémentation TailwindCSS

VideoIA.net utilise TailwindCSS comme framework CSS principal, avec quelques personnalisations.

### Configuration

La configuration complète se trouve dans le fichier `/tailwind.config.js` :

```javascript
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.amber,
        success: colors.green,
        error: colors.red,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'monospace'],
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}
```

### Classes Utilitaires Personnalisées

Des classes utilitaires personnalisées sont définies dans le fichier `/src/styles/utilities.css` :

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

### Plugins Tailwind Utilisés

- **@tailwindcss/forms** : Styles de base pour les éléments de formulaire
- **@tailwindcss/typography** : Styles typographiques pour le contenu riche
- **@tailwindcss/aspect-ratio** : Utilitaires pour gérer les ratios d'aspect
- **@tailwindcss/line-clamp** : Utilitaires pour limiter le nombre de lignes de texte

---

*Cette documentation est maintenue par l'équipe de développement VideoIA.net. Pour toute question ou suggestion concernant le design system, veuillez contacter l'équipe de design.*
