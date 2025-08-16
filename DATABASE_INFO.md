# 📍 BASE DE DONNÉES - VIDEO-IA.NET

## ⚠️ INFORMATION CRITIQUE

Cette documentation est **LA RÉFÉRENCE ABSOLUE** pour la configuration de la base de données du projet Video-IA.net.

---

## 🏠 LOCALISATION

**Serveur PostgreSQL :**
- **Version :** PostgreSQL 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
- **Host :** `localhost` (127.0.0.1)
- **Port :** `5432`
- **Chemin physique :** `/var/lib/postgresql/16/main/`

**Base de données :**
- **Nom :** `video_ia_net`
- **Utilisateur :** `video_ia_user`  
- **Mot de passe :** `video123`
- **Schéma :** `public` (principal)

**URL de connexion complète :**
```
postgresql://video_ia_user:video123@localhost:5432/video_ia_net?schema=public
```

---

## 📊 CONTENU DE LA BASE (vérifié le 16/08/2025)

### **Tables principales :**
| Table | Nombre d'enregistrements | Description |
|-------|-------------------------|-------------|
| `tools` | **16,765** | Outils IA avec métadonnées complètes |
| `categories` | **140** | Catégories d'outils |
| `languages` | **7** | Langues supportées (EN, FR, IT, ES, DE, NL, PT) |
| `tool_translations` | **117,355** | Traductions des outils |
| `category_translations` | **980** | Traductions des catégories |
| `tags` | **0** | Tags (table vide) |

### **Top catégories par nombre d'outils :**
1. **AI Assistant** - 939 outils
2. **Content creation** - 775 outils  
3. **Image generation** - 598 outils
4. **Data analysis** - 581 outils
5. **Automation** - 546 outils

### **Langues supportées :**
- 🇺🇸 **EN** - English (langue par défaut)
- 🇫🇷 **FR** - Français
- 🇮🇹 **IT** - Italiano
- 🇪🇸 **ES** - Español
- 🇩🇪 **DE** - Deutsch
- 🇳🇱 **NL** - Nederlands
- 🇵🇹 **PT** - Português

---

## 🔧 CONFIGURATION DANS LE CODE

### **Fichiers importants :**
- **`.env.local`** - Configuration principale (développement)
- **`src/lib/database/client.ts`** - Client Prisma singleton
- **`prisma/schema.prisma`** - Schéma de base de données

### **Variables d'environnement à vérifier :**
```bash
DATABASE_URL="postgresql://video_ia_user:video123@localhost:5432/video_ia_net?schema=public"
```

---

## 📋 HISTORIQUE

### **Restauration depuis backup :**
- **Date :** 16 août 2025
- **Source :** `video_ia_net_backup_20250812_164525.sql`
- **Méthode :** Drop/Create database + restauration complète
- **Résultat :** ✅ Succès complet

### **Migrations antérieures :**
- Schéma `test_multilingual` (ancien) → `public` (actuel)
- Migration Prisma vers architecture multilingue
- Ajout des traductions automatiques pour toutes les langues

---

## ⚡ TESTS DE CONNECTIVITÉ

### **Test rapide depuis le terminal :**
```bash
PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT COUNT(*) FROM tools;"
```

### **Test depuis l'application :**
```bash
DATABASE_URL="postgresql://video_ia_user:video123@localhost:5432/video_ia_net?schema=public" npx tsx -e "
import { checkDatabaseConnection } from './src/lib/database/index.ts';
const status = await checkDatabaseConnection();
console.log('✅ Connected:', status.connected, '| Tools:', status.stats?.toolCount);
"
```

---

## 🚨 AVERTISSEMENTS

1. **NE PAS MODIFIER** les informations de connexion sans mettre à jour cette documentation
2. **NE PAS SUPPRIMER** la base sans backup complet
3. **VÉRIFIER TOUJOURS** que `DATABASE_URL` pointe vers cette base
4. En cas de problème, **RÉFÉREZ-VOUS À CE FICHIER EN PREMIER**

---

## 📞 DÉPANNAGE

### **Si la connexion échoue :**
1. Vérifier que PostgreSQL est démarré : `sudo systemctl status postgresql`
2. Vérifier l'utilisateur : `sudo -u postgres psql -c "\du"`
3. Vérifier la base : `sudo -u postgres psql -c "\l"`

### **Si les données semblent manquantes :**
1. Vérifier le schéma : `PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "\dt"`
2. Compter les enregistrements avec les commandes de test ci-dessus

---

**📅 Dernière mise à jour :** 16 août 2025  
**✅ Statut :** Base de données opérationnelle avec 16,765 outils IA