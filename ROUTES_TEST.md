# Test des Nouvelles Routes - VideoIA.net

## Routes à Tester

### ✅ **Pages de Listing (Nouvelles)**
1. **Catégories** : `/[lang]/c` - Liste de toutes les catégories
2. **Audiences** : `/[lang]/p` - Liste de tous les publics cibles
3. **Cas d'usage** : `/[lang]/u` - Liste de tous les cas d'usage
4. **Outils** : `/[lang]/tools` - Liste de tous les outils (inchangé)

### ✅ **Pages de Détail (Nouvelles)**
1. **Catégorie** : `/[lang]/c/[slug]` - Détail d'une catégorie
2. **Audience** : `/[lang]/p/[slug]` - Outils pour un public spécifique
3. **Cas d'usage** : `/[lang]/u/[slug]` - Outils pour un cas d'usage
4. **Outil** : `/[lang]/t/[slug]` - Détail d'un outil

## URLs de Test

### Français
- `http://localhost:3000/fr/c` - Liste des catégories
- `http://localhost:3000/fr/p` - Liste des audiences
- `http://localhost:3000/fr/u` - Liste des cas d'usage
- `http://localhost:3000/fr/tools` - Liste des outils
- `http://localhost:3000/fr/c/video-editing` - Catégorie vidéo
- `http://localhost:3000/fr/p/content-creators` - Audience créateurs
- `http://localhost:3000/fr/u/video-creation` - Cas d'usage création vidéo
- `http://localhost:3000/fr/t/chatgpt` - Outil ChatGPT

### Anglais
- `http://localhost:3000/c` - Liste des catégories
- `http://localhost:3000/p` - Liste des audiences
- `http://localhost:3000/u` - Liste des cas d'usage
- `http://localhost:3000/tools` - Liste des outils
- `http://localhost:3000/c/video-editing` - Catégorie vidéo
- `http://localhost:3000/p/content-creators` - Audience créateurs
- `http://localhost:3000/u/video-creation` - Cas d'usage création vidéo
- `http://localhost:3000/t/chatgpt` - Outil ChatGPT

## Vérifications à Effectuer

### 1. **Pages de Listing**
- [ ] `/fr/c` - Affiche la liste des catégories
- [ ] `/fr/p` - Affiche la liste des audiences
- [ ] `/fr/u` - Affiche la liste des cas d'usage
- [ ] `/fr/tools` - Affiche la liste des outils

### 2. **Pages de Détail**
- [ ] `/fr/c/video-editing` - Affiche les outils de la catégorie vidéo
- [ ] `/fr/p/content-creators` - Affiche les outils pour créateurs de contenu
- [ ] `/fr/u/video-creation` - Affiche les outils pour création vidéo
- [ ] `/fr/t/chatgpt` - Affiche les détails de ChatGPT

### 3. **Navigation**
- [ ] Les liens dans le header pointent vers les bonnes URLs
- [ ] Les liens dans le footer pointent vers les bonnes URLs
- [ ] Les liens dans les composants pointent vers les bonnes URLs

### 4. **SEO et Métadonnées**
- [ ] Les titres sont corrects
- [ ] Les descriptions sont correctes
- [ ] Les URLs canoniques sont correctes
- [ ] Les balises hreflang sont correctes

### 5. **Redirections**
- [ ] `/fr/categories` → `/fr/c` (301)
- [ ] `/fr/tools/chatgpt` → `/fr/t/chatgpt` (301)
- [ ] `/categories` → `/c` (301)
- [ ] `/tools/chatgpt` → `/t/chatgpt` (301)

## Problèmes Potentiels

### 1. **Routes Manquantes**
- Vérifier que toutes les pages de listing existent
- Vérifier que toutes les pages de détail existent

### 2. **Services de Base de Données**
- Vérifier que `multilingualCategoriesService.getAllCategories()` fonctionne
- Vérifier que `multilingualToolsService.searchTools()` fonctionne
- Vérifier que `multilingualToolsService.getToolBySlug()` fonctionne

### 3. **Composants**
- Vérifier que tous les composants utilisent les nouvelles URLs
- Vérifier que les liens sont corrects

### 4. **Métadonnées**
- Vérifier que les titres et descriptions sont corrects
- Vérifier que les URLs canoniques sont correctes

## Commandes de Test

```bash
# Démarrer le serveur
npm run dev

# Tester les routes
curl http://localhost:3000/fr/c
curl http://localhost:3000/fr/p
curl http://localhost:3000/fr/u
curl http://localhost:3000/fr/tools

# Tester les redirections
curl -I http://localhost:3000/fr/categories
curl -I http://localhost:3000/fr/tools/chatgpt
```

## Résolution des Problèmes

### Si une page retourne 404
1. Vérifier que le fichier de route existe
2. Vérifier que le composant est correctement exporté
3. Vérifier que les services de base de données fonctionnent

### Si les liens sont incorrects
1. Vérifier que les composants utilisent les nouvelles fonctions d'URL
2. Vérifier que les hooks sont correctement importés
3. Vérifier que les utilitaires d'URL sont corrects

### Si les redirections ne fonctionnent pas
1. Vérifier la configuration dans `next.config.js`
2. Vérifier que le serveur a été redémarré
3. Vérifier les logs du serveur
