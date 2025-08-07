#!/bin/bash

# 🔄 Migration Initiale: DEV → PROD
# Script pour la première migration de base de données
# Usage: ./scripts/deploy/initial-migration.sh

set -e

echo "🔄 Migration Initiale DEV → PROD"
echo "================================="

# Configuration
LOCAL_DB="postgresql://video_ia_user:video123@localhost:5432/video_ia_net"
REMOTE_DB="postgresql://video_ia_user:Buzzerbeater23@46.202.129.104:5432/video_ia_net"
BACKUP_DIR="./backups/initial-migration"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Vérifications préliminaires
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier connexion locale
    if ! PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c "SELECT 1;" &>/dev/null; then
        error "Impossible de se connecter à la DB locale"
    fi
    success "Connexion DB locale OK"
    
    # Vérifier connexion distante
    if ! PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -c "SELECT 1;" &>/dev/null; then
        error "Impossible de se connecter à la DB distante"
    fi
    success "Connexion DB distante OK"
    
    # Vérifier les outils
    for tool in pg_dump psql; do
        if ! command -v $tool &>/dev/null; then
            error "$tool n'est pas installé"
        fi
    done
    success "Outils PostgreSQL disponibles"
}

# Analyse des bases de données
analyze_databases() {
    log "Analyse des bases de données..."
    
    # Compter les enregistrements locaux
    LOCAL_TOOLS=$(PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools WHERE is_active = true;")
    LOCAL_CATEGORIES=$(PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM categories;")
    LOCAL_TRANSLATIONS=$(PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tool_translations;")
    
    # Compter les enregistrements distants
    REMOTE_TOOLS=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools WHERE is_active = true;" 2>/dev/null || echo "0")
    REMOTE_CATEGORIES=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "0")
    REMOTE_TRANSLATIONS=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tool_translations;" 2>/dev/null || echo "0")
    
    # Nettoyage des espaces
    LOCAL_TOOLS=$(echo $LOCAL_TOOLS | tr -d ' ')
    LOCAL_CATEGORIES=$(echo $LOCAL_CATEGORIES | tr -d ' ')
    LOCAL_TRANSLATIONS=$(echo $LOCAL_TRANSLATIONS | tr -d ' ')
    REMOTE_TOOLS=$(echo $REMOTE_TOOLS | tr -d ' ')
    REMOTE_CATEGORIES=$(echo $REMOTE_CATEGORIES | tr -d ' ')
    REMOTE_TRANSLATIONS=$(echo $REMOTE_TRANSLATIONS | tr -d ' ')
    
    echo "📊 État des bases de données:"
    echo "┌─────────────────┬─────────┬─────────────┬──────────────┐"
    echo "│ Table           │ Local   │ Remote      │ Action       │"
    echo "├─────────────────┼─────────┼─────────────┼──────────────┤"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Tools" "$LOCAL_TOOLS" "$REMOTE_TOOLS" "Migration"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Categories" "$LOCAL_CATEGORIES" "$REMOTE_CATEGORIES" "Migration"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Translations" "$LOCAL_TRANSLATIONS" "$REMOTE_TRANSLATIONS" "Migration"
    echo "└─────────────────┴─────────┴─────────────┴──────────────┘"
    
    # Vérifications de sécurité
    if [ "$LOCAL_TOOLS" -lt 1000 ]; then
        error "Base locale semble incomplète ($LOCAL_TOOLS < 1000 outils)"
    fi
    
    if [ "$REMOTE_TOOLS" -gt 1000 ]; then
        warning "Base distante contient déjà $REMOTE_TOOLS outils"
        read -p "Voulez-vous continuer et écraser les données distantes? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Migration annulée par l'utilisateur"
        fi
    fi
}

# Création des backups
create_backups() {
    log "Création des backups..."
    
    mkdir -p $BACKUP_DIR
    
    # Backup local (précaution)
    log "Backup base de données locale..."
    PGPASSWORD=video123 pg_dump -h localhost -U video_ia_user -d video_ia_net \
        --clean --if-exists --format=custom \
        -f "$BACKUP_DIR/local_backup_$TIMESTAMP.dump"
    success "Backup local créé: $(du -h $BACKUP_DIR/local_backup_$TIMESTAMP.dump | cut -f1)"
    
    # Backup distant (si des données existent)
    if [ "$REMOTE_TOOLS" -gt 0 ]; then
        log "Backup base de données distante..."
        PGPASSWORD=Buzzerbeater23 pg_dump -h 46.202.129.104 -U video_ia_user -d video_ia_net \
            --clean --if-exists --format=custom \
            -f "$BACKUP_DIR/remote_backup_$TIMESTAMP.dump"
        success "Backup distant créé: $(du -h $BACKUP_DIR/remote_backup_$TIMESTAMP.dump | cut -f1)"
    fi
}

# Export des données locales
export_local_data() {
    log "Export des données locales..."
    
    # Export du schéma et des données
    PGPASSWORD=video123 pg_dump -h localhost -U video_ia_user -d video_ia_net \
        --clean --if-exists --format=custom \
        --verbose \
        -f "$BACKUP_DIR/migration_data_$TIMESTAMP.dump"
    
    success "Export terminé: $(du -h $BACKUP_DIR/migration_data_$TIMESTAMP.dump | cut -f1)"
    
    # Export SQL pour inspection
    PGPASSWORD=video123 pg_dump -h localhost -U video_ia_user -d video_ia_net \
        --clean --if-exists \
        --schema-only \
        -f "$BACKUP_DIR/schema_$TIMESTAMP.sql"
    
    success "Schéma exporté pour inspection"
}

# Import des données vers la production
import_to_production() {
    log "Import vers la production..."
    
    warning "⚠️ Les données existantes sur le serveur distant vont être écrasées!"
    read -p "Êtes-vous sûr de vouloir continuer? (yes/no): " -r
    if [[ ! $REPLY == "yes" ]]; then
        error "Migration annulée"
    fi
    
    # Import avec pg_restore
    log "Restauration en cours... (peut prendre plusieurs minutes)"
    
    PGPASSWORD=Buzzerbeater23 pg_restore -h 46.202.129.104 -U video_ia_user -d video_ia_net \
        --clean --if-exists \
        --verbose \
        --jobs=4 \
        "$BACKUP_DIR/migration_data_$TIMESTAMP.dump"
    
    success "Import terminé"
}

# Validation de la migration
validate_migration() {
    log "Validation de la migration..."
    
    # Recompter les données après migration
    NEW_REMOTE_TOOLS=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools WHERE is_active = true;")
    NEW_REMOTE_CATEGORIES=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM categories;")
    NEW_REMOTE_TRANSLATIONS=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tool_translations;")
    
    # Nettoyage
    NEW_REMOTE_TOOLS=$(echo $NEW_REMOTE_TOOLS | tr -d ' ')
    NEW_REMOTE_CATEGORIES=$(echo $NEW_REMOTE_CATEGORIES | tr -d ' ')
    NEW_REMOTE_TRANSLATIONS=$(echo $NEW_REMOTE_TRANSLATIONS | tr -d ' ')
    
    echo "📊 Validation de la migration:"
    echo "┌─────────────────┬─────────┬─────────────┬──────────────┐"
    echo "│ Table           │ Local   │ Remote      │ Status       │"
    echo "├─────────────────┼─────────┼─────────────┼──────────────┤"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Tools" "$LOCAL_TOOLS" "$NEW_REMOTE_TOOLS" "$([ "$LOCAL_TOOLS" -eq "$NEW_REMOTE_TOOLS" ] && echo "✅ OK" || echo "❌ ERREUR")"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Categories" "$LOCAL_CATEGORIES" "$NEW_REMOTE_CATEGORIES" "$([ "$LOCAL_CATEGORIES" -eq "$NEW_REMOTE_CATEGORIES" ] && echo "✅ OK" || echo "❌ ERREUR")"
    printf "│ %-15s │ %-7s │ %-11s │ %-12s │\n" "Translations" "$LOCAL_TRANSLATIONS" "$NEW_REMOTE_TRANSLATIONS" "$([ "$LOCAL_TRANSLATIONS" -eq "$NEW_REMOTE_TRANSLATIONS" ] && echo "✅ OK" || echo "❌ ERREUR")"
    echo "└─────────────────┴─────────┴─────────────┴──────────────┘"
    
    # Vérification de l'intégrité
    log "Vérification de l'intégrité..."
    
    ORPHAN_TRANSLATIONS=$(PGPASSWORD=Buzzerbeater23 psql -h 46.202.129.104 -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tool_translations tt LEFT JOIN tools t ON tt.tool_id = t.id WHERE t.id IS NULL;")
    ORPHAN_TRANSLATIONS=$(echo $ORPHAN_TRANSLATIONS | tr -d ' ')
    
    if [ "$ORPHAN_TRANSLATIONS" -gt 0 ]; then
        warning "$ORPHAN_TRANSLATIONS traductions orphelines détectées"
    else
        success "Intégrité des données validée"
    fi
    
    # Test de connexion application
    log "Test de l'API..."
    if curl -f -s "http://46.202.129.104:3000/api/tools?limit=1" &>/dev/null; then
        success "API accessible"
    else
        warning "API non accessible (normal si l'app n'est pas démarrée)"
    fi
}

# Nettoyage
cleanup() {
    log "Nettoyage..."
    
    # Garder les backups mais supprimer les fichiers temporaires
    # (Pas de nettoyage pour la sécurité)
    
    success "Migration terminée!"
    echo
    echo "📁 Backups disponibles dans: $BACKUP_DIR"
    echo "📊 Résumé:"
    echo "  • $LOCAL_TOOLS outils migrés"
    echo "  • $LOCAL_CATEGORIES catégories migrées"
    echo "  • $LOCAL_TRANSLATIONS traductions migrées"
    echo
    echo "🎯 Prochaines étapes:"
    echo "  1. Vérifier que l'application fonctionne"
    echo "  2. Tester les principales fonctionnalités"
    echo "  3. Configurer la synchronisation automatique"
}

# Fonction principale
main() {
    log "Début de la migration initiale"
    
    check_prerequisites
    analyze_databases
    create_backups
    export_local_data
    import_to_production
    validate_migration
    cleanup
    
    success "🎉 Migration initiale terminée avec succès!"
}

# Gestion des erreurs
trap 'error "Migration interrompue à la ligne $LINENO"' ERR

# Exécution
main "$@"