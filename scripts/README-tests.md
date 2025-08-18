# 🧪 Scripts de Test - Système Multilangue Video-IA.net

Ce dossier contient les scripts de test pour valider le **cœur réacteur** de l'application : le système de génération de contenu multilangue automatisé.

## 📚 Scripts Disponibles

### 🌍 `test-multilingual.ts` - **TEST PRINCIPAL COMPLET**
**🎯 Script de référence pour validation complète du système**

```bash
npx tsx scripts/test-multilingual.ts
```

**Fonctionnalités:**
- ✅ Test des 11 étapes de génération anglaise
- ✅ Test des traductions vers 6 langues (fr, it, es, de, nl, pt)
- ✅ Validation de 53 contenus générés au total
- ✅ Métriques de performance et qualité
- ✅ Scores détaillés par phase et langue
- ✅ Rapport JSON complet exporté
- ✅ Verdicts et recommandations production

**Résultat attendu:** 
- Phase 1: 11/11 étapes réussies
- Phase 2: 6 langues × 7 champs = 42 traductions
- Score global: >85% = Production Ready

---

### 🔥 `test-11-steps.ts` - Test Anglais Uniquement
**Validation des 11 étapes de génération de contenu anglais**

```bash
npx tsx scripts/test-11-steps.ts
```

**Fonctionnalités:**
- HTTP status check + screenshot WebP
- Crawling jusqu'à 50 pages + validation Gemini
- Génération contenu complet + meta données
- Pricing model + use cases + target audience

---

### 🌐 `test-translations-only.ts` - Test Traductions Seules
**Test isolé du système de traduction avec contenu anglais simulé**

```bash
npx tsx scripts/test-translations-only.ts
```

**Fonctionnalités:**
- Utilise contenu anglais de référence (Visualizee)
- Test traductions 6 langues en mode isolé
- Validation qualité sans dépendance crawling
- Idéal pour debug problèmes traduction spécifiques

---

### 🎯 `test-8-steps.ts` - Version Historique
**Version antérieure pour compatibilité et comparaison**

```bash
npx tsx scripts/test-8-steps.ts
```

**Utilité:** Validation rétro-compatibilité et comparaison performances.

## 📊 Métriques et Scoring

### 🏆 Critères de Succès Globaux
- **Performance:** < 300 secondes (5 minutes)
- **Phase 1:** 11/11 étapes réussies
- **Phase 2:** ≥80% langues traduites avec succès
- **Qualité:** Meta titles avec "- Video-IA.net", overviews 2 phrases exactement

### 📈 Système de Scores

**Phase 1 (Anglais) - Poids 60%:**
- 11 étapes validées individuellement
- Score = nombre étapes réussies / 11 × 100

**Phase 2 (Traductions) - Poids 40%:**
- 6 langues × 8 critères qualité par langue
- Score = moyenne scores langues

**Score Global:**
- `(Score Phase 1 × 0.6) + (Score Phase 2 × 0.4)`
- ≥85% = 🏆 EXCELLENT (Production immédiate)
- ≥70% = ✅ BON (Tests supplémentaires)
- ≥50% = ⚠️ MOYEN (Optimisations requises)
- <50% = ❌ CRITIQUE (Debug majeur)

## 🔬 Outil de Test: Visualizee

**ID:** 6669  
**URL:** https://visualizee.ai/  
**Choix justifié:**
- Site riche en contenu technique
- Présence sociale établie (LinkedIn, X, Instagram, TikTok)
- Cas d'usage B2B diversifiés
- Public cible professionnel défini
- Pricing freemium détectable

## 📁 Rapports Générés

Chaque test génère un rapport JSON détaillé:
- `multilingual-system-test-[timestamp].json` - Rapport complet
- `complete-11-steps-final-test-[timestamp].json` - Rapport anglais seul
- `translations-only-test-[timestamp].json` - Rapport traductions seules

**Contenu des rapports:**
- Timestamps et durées par phase
- Scores détaillés par étape/langue
- Contenus générés (aperçus)
- Métriques qualité et validation
- Diagnostics d'erreurs

## 🚀 Workflow Recommandé

### 1. **Développement Initial**
```bash
# Test traductions seules (rapide, ~30s)
npx tsx scripts/test-translations-only.ts
```

### 2. **Validation Intégration**
```bash
# Test anglais complet (~90s)
npx tsx scripts/test-11-steps.ts
```

### 3. **Validation Finale**
```bash
# Test système complet (~300s)
npx tsx scripts/test-multilingual.ts
```

### 4. **Production**
```bash
# Si score ≥85%, passage mode production
# Modifier testMode: false dans les scripts
```

## 🛡️ Gestion d'Erreurs

### Erreurs Courantes et Solutions

**1. Limite Rate Gemini API:**
- Erreur: `429 Too Many Requests`
- Solution: Attendre 24h ou upgrade plan Gemini

**2. Échec Crawling:**
- Erreur: `Pages crawlées: 0`
- Solution: Vérifier connexion internet + URL tool

**3. Traductions Incomplètes:**
- Erreur: Meta title sans "- Video-IA.net"
- Solution: Vérifier fonction `cleanTranslationResponse`

**4. Timeout Performance:**
- Erreur: Durée > 300s
- Solution: Optimiser prompts ou parallélisme

## 💡 Best Practices

### ✅ Avant de Tester
1. Vérifier connexion internet stable
2. S'assurer quota Gemini API disponible
3. Confirmer base de données accessible
4. Nettoyer fichiers temporaires précédents

### ✅ Pendant les Tests
1. Ne pas interrompre (perte progression)
2. Monitorer logs pour détecter problèmes
3. Vérifier usage mémoire si lenteur

### ✅ Après les Tests
1. Analyser rapports JSON générés
2. Vérifier échantillons contenu manuellement
3. Valider conformité SEO (meta tags)
4. Tester avec différents outils si nécessaire

## 🔧 Customisation

### Changer l'Outil de Test
Modifier `const toolId = 6669` avec l'ID souhaité dans les scripts.

### Ajouter une Langue
1. Ajouter code langue dans `languagesToTranslate`
2. Mettre à jour `languageNames` mapping
3. Ajouter traduction équivalent "helps you" dans prompts

### Modifier Critères Qualité
Ajuster les validations dans les fonctions de scoring.

---

**🎯 L'objectif:** Valider que Video-IA.net peut générer automatiquement du contenu professionnel dans 7 langues, transformant la plateforme en solution internationale scalable.

**⚡ Performance cible:** Moins de 5 minutes pour générer 53 contenus de qualité professionnelle.

**🌍 Impact:** Expansion internationale automatisée de Video-IA.net sans intervention humaine.