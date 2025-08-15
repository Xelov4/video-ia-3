# 🔐 Identifiants d'Administration - Video-IA.net

Ce document contient les identifiants de connexion pour l'interface d'administration.

## ⚠️ IMPORTANT - Sécurité

- **Ne partagez jamais** ces identifiants publiquement
- Changez les mots de passe régulièrement
- Utilisez des mots de passe forts et uniques
- Activez l'authentification à deux facteurs si possible

## 👤 Comptes d'Administration

### 1. Compte Principal (Super Admin)
- **Email**: `admin@video-ia.net`
- **Mot de passe**: `VideoIA2024!`
- **Rôle**: `super_admin`
- **Permissions**: Accès complet à toutes les fonctionnalités
- **Créé le**: 5 août 2025

### 2. Compte Secondaire (Admin)
- **Email**: `admin2@video-ia.net`
- **Mot de passe**: `SecurePass2024!`
- **Rôle**: `admin`
- **Permissions**: Accès administrateur standard
- **Créé le**: 14 août 2025

## 🛠️ Scripts de Gestion

### Réinitialiser un mot de passe
```bash
# Réinitialiser le mot de passe du compte principal
node scripts/reset-admin-password.js "NouveauMotDePasse123!"

# Réinitialiser le mot de passe d'un compte spécifique
node scripts/reset-admin-password.js "admin2@video-ia.net" "NouveauMotDePasse123!"
```

### Créer un nouvel utilisateur admin
```bash
# Créer un utilisateur avec paramètres par défaut
node scripts/create-admin-user.js

# Créer un utilisateur personnalisé
node scripts/create-admin-user.js "email@example.com" "MotDePasse123!" "Nom Utilisateur" "role"
```

### Tester les identifiants
```bash
# Vérifier que tous les identifiants fonctionnent
node scripts/test-admin-login.js
```

## 🔒 Bonnes Pratiques de Sécurité

1. **Mots de passe forts** : Utilisez au moins 12 caractères avec majuscules, minuscules, chiffres et symboles
2. **Rotation régulière** : Changez les mots de passe tous les 3-6 mois
3. **Accès limité** : N'accordez que les permissions nécessaires
4. **Surveillance** : Surveillez les tentatives de connexion échouées
5. **Sauvegarde** : Gardez une copie sécurisée de ces identifiants

## 📝 Historique des Modifications

- **14 août 2025** : Création du compte secondaire `admin2@video-ia.net`
- **14 août 2025** : Mise à jour du mot de passe principal vers `VideoIA2024!`
- **5 août 2025** : Création du compte principal `admin@video-ia.net`

## 🆘 En cas de Problème

Si vous ne pouvez plus vous connecter :

1. Vérifiez que la base de données est accessible
2. Utilisez le script de réinitialisation de mot de passe
3. Vérifiez les logs d'erreur dans la console
4. Contactez l'équipe technique si nécessaire

---

**Dernière mise à jour** : 14 août 2025  
**Maintenu par** : Équipe Technique Video-IA.net
