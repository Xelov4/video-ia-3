# 🧠 Hiérarchie Gemini 2025 - Guide d'Utilisation

*Video-IA.net - Système de Recommencement Complet*

## 🚀 Installation et Configuration

### 1. **Variables d'Environnement**
```bash
# Ajouter dans votre .env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. **Dépendances**
```bash
npm install @google/genai
# ou
yarn add @google/genai
```

## 🏆 Hiérarchie des Modèles

### **Ordre de Priorité (8 Modèles)**
```typescript
const GEMINI_MODELS = [
  'gemini-2.5-pro',        // 🥇 Premium - Qualité maximale
  'gemini-2.5-flash',      // 🥈 Flash 2.5 - Équilibre parfait
  'gemini-2.5-flash-lite', // 🥉 Flash-Lite 2.5 - Performance optimisée
  'gemini-2.0-flash',      // 🏅 Flash 2.0 - Stabilité éprouvée
  'gemini-2.0-flash-lite', // 🏅 Flash-Lite 2.0 - Économique
  'gemini-1.5-flash',      // 🏅 Flash 1.5 - Fiable et rapide
  'gemini-1.5-pro',        // 🏅 Pro 1.5 - Qualité professionnelle
  'gemini-1.5-flash-8b'   // 🏅 Flash 8B - Dernier recours
]
```

## 🔄 Système de Recommencement Complet

### **Principe de Fonctionnement**
- **Chaque appel** recommence TOUTE la hiérarchie depuis Gemini 2.5 Pro
- **Maximum 3 tentatives** complètes de la hiérarchie
- **Fallback progressif** vers des modèles plus légers
- **Gestion intelligente** des rate limits et erreurs

### **Exemple de Logs**
```
🔄 TENTATIVE COMPLÈTE 1/3 - Recommencement de toute la hiérarchie
📋 Ordre des modèles: gemini-2.5-pro → gemini-2.5-flash → ... → gemini-1.5-flash-8b

  🔄 [1/8] Test avec gemini-2.5-pro...
  ❌ Échec avec gemini-2.5-pro: Model overloaded
  
  🔄 [2/8] Test avec gemini-2.5-flash...
  ✅ SUCCÈS avec gemini-2.5-flash (1250 caractères)
  🏆 Modèle gagnant: gemini-2.5-flash (position 2/8)
  📊 Tentative complète: 1/3
```

## 💻 Utilisation dans le Code

### **1. Import du Service**
```typescript
import { ToolContentUpdaterServiceOptimized } from '@/src/lib/services/toolContentUpdaterOptimized'
```

### **2. Génération de Contenu Simple**
```typescript
// Le service utilise automatiquement la hiérarchie complète
const result = await ToolContentUpdaterServiceOptimized.updateToolContent(toolId, false)
```

### **3. Génération avec Traductions Multilangues**
```typescript
// Utilise la hiérarchie pour 11 étapes anglaises + 6 langues
const result = await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(toolId, false)
```

### **4. Appel Direct Gemini (Avancé)**
```typescript
// Pour des appels personnalisés, utilisez la fonction privée
const service = ToolContentUpdaterServiceOptimized as any
const response = await service.callGeminiWithFallback.call(service, yourPrompt)
```

## 🧪 Tests et Validation

### **1. Test de la Hiérarchie**
```bash
# Test spécifique de la hiérarchie Gemini
npx ts-node scripts/test-gemini-hierarchy-2025.ts
```

### **2. Test Multilingue Complet**
```bash
# Test du système complet avec traductions
npx ts-node scripts/test-multilingual-optimized.ts
```

### **3. Test avec un Outil Spécifique**
```typescript
// Dans votre code
const toolId = 6669 // Visualizee
const result = await ToolContentUpdaterServiceOptimized.updateToolContentWithTranslations(toolId, true)
```

## ⚡ Configuration Avancée

### **1. Rate Limiting**
```typescript
// Délai entre appels (90 secondes par défaut)
private static readonly RATE_LIMIT_DELAY_MS = 90000

// Délai supplémentaire si rate limit détecté
const additionalDelay = 5000 // 5 secondes

// Délai entre tentatives complètes
const retryDelay = 10000 // 10 secondes
```

### **2. Nombre de Tentatives**
```typescript
// Maximum 3 tentatives complètes de la hiérarchie
const maxAttempts = 3
```

### **3. Validation de Réponse**
```typescript
// Longueur minimale acceptée
if (!text || text.length < 200) {
  throw new Error('Réponse trop courte ou vide')
}
```

## 📊 Monitoring et Logs

### **1. Logs Détaillés**
Le système génère des logs complets pour chaque tentative :
- **Position du modèle** dans la hiérarchie
- **Tentative complète** en cours
- **Modèle gagnant** identifié
- **Temps de réponse** mesuré

### **2. Métriques de Performance**
- **Taux de succès** par modèle
- **Distribution** des modèles utilisés
- **Performance** par type de contenu
- **Coût** par requête

### **3. Gestion des Erreurs**
- **Erreurs isolées** par modèle
- **Fallback automatique** vers le modèle suivant
- **Recommencement complet** si toute la hiérarchie échoue
- **Diagnostic détaillé** en cas d'échec

## 🛡️ Gestion des Erreurs

### **Types d'Erreurs Gérées**
1. **Rate Limits** : Attente supplémentaire de 5 secondes
2. **Modèle surchargé** : Passage automatique au modèle suivant
3. **Réponses trop courtes** : Validation de la qualité du contenu
4. **Erreurs réseau** : Retry automatique avec modèle différent

### **Stratégies de Récupération**
1. **Fallback immédiat** vers le modèle suivant
2. **Attente intelligente** selon le type d'erreur
3. **Recommencement complet** de la hiérarchie
4. **Erreur définitive** après 3 tentatives complètes

## 🔧 Personnalisation

### **1. Ajouter de Nouveaux Modèles**
```typescript
private static readonly GEMINI_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-8b',
  'votre-nouveau-modele' // Ajouter ici
]
```

### **2. Modifier les Délais**
```typescript
// Délai entre appels
private static readonly RATE_LIMIT_DELAY_MS = 120000 // 2 minutes

// Délai entre tentatives complètes
const retryDelay = 15000 // 15 secondes
```

### **3. Ajuster la Validation**
```typescript
// Longueur minimale personnalisée
if (!text || text.length < 100) { // Au lieu de 200
  throw new Error('Réponse trop courte')
}
```

## 📈 Performance et Optimisation

### **1. Objectifs de Performance**
- **Taux de succès** : >99%
- **Temps de réponse** : <60 secondes pour une tentative complète
- **Coût API** : -20% vs utilisation fixe
- **Résilience** : 8 niveaux de fallback

### **2. Optimisations Intégrées**
- **Rate limiting intelligent** : Respect des limites API
- **Fallback progressif** : Qualité maximale privilégiée
- **Gestion d'erreurs** : Isolation et récupération automatique
- **Monitoring temps réel** : Logs détaillés et métriques

### **3. Recommandations d'Usage**
- **Production** : Utiliser `testMode: false` pour sauvegarde DB
- **Développement** : Utiliser `testMode: true` pour tests sans DB
- **Batch processing** : Respecter les délais entre outils
- **Monitoring** : Surveiller les logs pour optimisation

## 🚨 Dépannage

### **1. Erreur "Tous les modèles Gemini ont échoué"**
```bash
# Vérifications à effectuer :
✅ Clé API Gemini valide
✅ Quotas et limites du compte
✅ Connectivité réseau
✅ Disponibilité des modèles
```

### **2. Rate Limiting Excessif**
```typescript
// Augmenter le délai entre appels
private static readonly RATE_LIMIT_DELAY_MS = 120000 // 2 minutes
```

### **3. Modèles Indisponibles**
```typescript
// Vérifier la disponibilité des modèles
// Certains modèles peuvent être temporairement indisponibles
// Le système bascule automatiquement vers les modèles disponibles
```

## 🔮 Évolutions Futures

### **1. Modèles Gemini 3.0**
- **Intégration automatique** des nouveaux modèles
- **Mise à jour** de la hiérarchie
- **Optimisation** des performances

### **2. IA Adaptative**
- **Apprentissage** des patterns de succès
- **Optimisation** automatique de l'ordre
- **Prédiction** des disponibilités

### **3. Gestion Avancée des Coûts**
- **Budget dynamique** par modèle
- **Optimisation** coût/qualité
- **Reporting** financier détaillé

---

## 📞 Support et Contact

Pour toute question concernant la hiérarchie Gemini 2025 :
- **Documentation technique** : `docs/gemini-hierarchy-2025.md`
- **Tests** : `scripts/test-gemini-hierarchy-2025.ts`
- **Équipe technique** : Contactez l'équipe Video-IA.net

---

*Cette documentation est maintenue par l'équipe de développement Video-IA.net. Dernière mise à jour : 16 août 2025*
