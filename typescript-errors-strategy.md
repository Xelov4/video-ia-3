# 🎯 STRATÉGIE DE CORRECTION TYPESCRIPT - PHASE 2

## 📊 ANALYSE DES PATTERNS D'ERREURS

### **🔥 Catégorie 1 : Erreurs de propriétés snake_case vs camelCase** (Impact: ÉLEVÉ, Fréquence: TRÈS ÉLEVÉE)
- `tool_count` → `toolCount`
- `view_count` → `viewCount` 
- `is_featured` → `featured`
- `image_url` → `imageUrl`

**Solution :** Utiliser les adaptateurs créés en Phase 1

### **⚡ Catégorie 2 : Types unknown vers ReactNode** (Impact: ÉLEVÉ, Fréquence: ÉLEVÉE)
- `Type 'unknown' is not assignable to type 'ReactNode'`
- `Type 'unknown' is not assignable to type 'Key'`

**Solution :** Utiliser parseUnknownAsString + type assertions safe

### **🔧 Catégorie 3 : Props mismatch composants** (Impact: MOYEN, Fréquence: MOYENNE)
- `lang` vs `_lang` dans CategoryCard
- Props interface incompatibles

**Solution :** Correction d'interfaces + harmonisation

### **🛡️ Catégorie 4 : Null/undefined handling** (Impact: MOYEN, Fréquence: MOYENNE)
- `Type 'string | null' is not assignable to type 'string'`
- `Object is possibly 'undefined'`

**Solution :** Guards + null coalescing

---

## 🎯 PLAN DE CORRECTION PRIORISÉ

### **Phase 2.2 : Correction des propriétés (30-40 erreurs résolues)**
1. **app/[lang]/c/[slug]/page.tsx** - 7 erreurs tool_count
2. **app/[lang]/t/[slug]/ToolDetailClient.tsx** - 8 erreurs propriétés
3. Autres fichiers avec propriétés snake_case

### **Phase 2.3 : Props de composants (5-10 erreurs résolues)**
1. **CategoriesPageClient.tsx** - lang vs _lang
2. **DiscoverPageClient.tsx** - props variants

### **Phase 2.4 : Types unknown (15-20 erreurs résolues)**
1. **c/[slug]/page.tsx** - unknown vers ReactNode
2. Autres conversions unknown

### **Phase 2.5 : Null/undefined (10-15 erreurs résolues)**
1. Ajout de guards appropriés
2. Null coalescing operator

---

## 🛠️ OUTILS PHASE 1 À UTILISER

- ✅ `adaptCategoryResponse` pour les catégories
- ✅ `adaptToolResponse` pour les outils  
- ✅ `parseUnknownAsString` pour les conversions safe
- ✅ Type guards `isCategory`, `isTool`