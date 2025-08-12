#!/bin/bash

# 🚀 Quick Deploy Script pour video-ia.net
# Script simplifié pour déploiement rapide depuis WSL vers VPS
# Usage: ./scripts/deploy/quick-deploy.sh [options]

set -e

# Configuration
VPS_HOST="46.202.129.104"
VPS_USER="root"
VPS_PASSWORD="Buzzerbeater23"
APP_PATH="/var/www/video-ia.net"
DOMAIN="www.video-ia.net"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Parse arguments
SYNC_DB=true
SKIP_BUILD=false
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-db)
      SYNC_DB=false
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    -h|--help)
      echo "🚀 Quick Deploy Script pour video-ia.net"
      echo ""
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --skip-db      Ne pas synchroniser la base de données"
      echo "  --skip-build   Ne pas rebuilder l'application"
      echo "  --dry-run      Afficher ce qui serait fait sans l'exécuter"
      echo "  --force        Forcer le déploiement même avec des changements non commités"
      echo "  -h, --help     Afficher cette aide"
      echo ""
      echo "Exemples:"
      echo "  $0                    # Déploiement complet"
      echo "  $0 --skip-db          # Déploiement code seulement"
      echo "  $0 --dry-run          # Preview des actions"
      exit 0
      ;;
    *)
      error "Option inconnue: $1. Utilisez --help pour voir les options disponibles."
      ;;
  esac
done

# Banner
echo -e "${BLUE}"
echo "════════════════════════════════════════"
echo "🚀 QUICK DEPLOY - video-ia.net"
echo "════════════════════════════════════════"
echo -e "${NC}"

# Vérifications préliminaires
check_prerequisites() {
  log "Vérification des prérequis..."
  
  # Vérifier sshpass
  if ! command -v sshpass &> /dev/null; then
    log "Installation de sshpass..."
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y sshpass > /dev/null 2>&1
  fi
  
  # Vérifier Git
  if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    error "Ce script doit être exécuté dans un repository Git"
  fi
  
  # Vérifier les changements non commités (ignorer les fichiers de build)
  ALL_CHANGES=$(git status --porcelain)
  UNCOMMITTED_CHANGES=$(echo "$ALL_CHANGES" | grep -v "^.M .next/" | grep -v "^.M tsconfig.tsbuildinfo" | head -10)
  
  if ! $FORCE && [[ -n "$UNCOMMITTED_CHANGES" ]]; then
    warning "Des changements non commités ont été détectés:"
    echo "$UNCOMMITTED_CHANGES"
    echo ""
    echo "Options:"
    echo "  1. Commiter vos changements avec: git add . && git commit -m 'Deploy changes'"
    echo "  2. Utiliser --force pour ignorer cette vérification"
    echo "  3. Stash vos changements avec: git stash"
    exit 1
  fi
  
  # Informer si seuls les fichiers de build ont changé
  if [[ -n "$ALL_CHANGES" && -z "$UNCOMMITTED_CHANGES" ]]; then
    log "Seuls les fichiers de build Next.js ont changé (ignorés pour le déploiement)"
  fi
  
  success "Prérequis vérifiés"
}

# Test de connectivité VPS
test_vps_connection() {
  log "Test de connectivité VPS..."
  
  if $DRY_RUN; then
    log "[DRY RUN] Test de connexion SSH vers $VPS_HOST"
    return
  fi
  
  if sshpass -p "$VPS_PASSWORD" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo 'Connection OK'" > /dev/null 2>&1; then
    success "Connexion VPS OK"
  else
    error "Impossible de se connecter au VPS $VPS_HOST"
  fi
}

# Push du code vers GitHub
push_code() {
  log "Push du code vers GitHub..."
  
  if $DRY_RUN; then
    log "[DRY RUN] git push origin main"
    return
  fi
  
  # Add, commit, push
  if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "Quick deploy: $(date +'%Y-%m-%d %H:%M:%S')" || true
  fi
  
  git push origin main
  success "Code pushé vers GitHub"
}

# Déploiement sur le VPS
deploy_to_vps() {
  log "Déploiement sur le VPS..."
  
  if $DRY_RUN; then
    log "[DRY RUN] Déploiement vers $VPS_HOST:$APP_PATH"
    return
  fi
  
  # Script de déploiement à exécuter sur le VPS
  DEPLOY_SCRIPT="
    set -e
    echo '🔄 Starting deployment...'
    
    # Aller dans le répertoire de l'app
    cd $APP_PATH || { echo 'App directory not found'; exit 1; }
    
    # Pull du code depuis GitHub
    echo '📥 Pulling code from GitHub...'
    git pull origin main
    
    # Installation des dépendances
    echo '📦 Installing dependencies...'
    npm ci --production --silent
    
    # Build de l'application
    if [ '$SKIP_BUILD' = 'false' ]; then
      echo '🏗️  Building application...'
      npm run build
    else
      echo '⏭️  Build skipped'
    fi
    
    # Restart PM2
    echo '🔄 Restarting application...'
    pm2 reload video-ia-net --update-env || pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo '✅ Deployment completed successfully'
  "
  
  # Exécuter le script sur le VPS
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "$DEPLOY_SCRIPT"
  
  success "Application déployée sur le VPS"
}

# Synchronisation de la base de données
sync_database() {
  if ! $SYNC_DB; then
    log "Synchronisation DB ignorée (--skip-db)"
    return
  fi
  
  log "Synchronisation de la base de données DEV → PROD..."
  
  if $DRY_RUN; then
    log "[DRY RUN] Synchronisation base de données"
    return
  fi
  
  # Exécuter la synchronisation DB
  if [[ -f "scripts/deploy/sync-to-prod.js" ]]; then
    node scripts/deploy/sync-to-prod.js --mode=content_only --preserve-analytics
    success "Base de données synchronisée"
  else
    warning "Script de synchronisation DB introuvable"
  fi
}

# Health check
health_check() {
  log "Vérification de l'état de l'application..."
  
  if $DRY_RUN; then
    log "[DRY RUN] Health check de https://$DOMAIN"
    return
  fi
  
  # Attendre que l'application redémarre
  sleep 10
  
  # Test de l'endpoint
  for i in {1..5}; do
    if curl -f -s "https://$DOMAIN/api/tools?limit=1" > /dev/null; then
      success "Application accessible (tentative $i)"
      return
    else
      warning "Application non accessible, retry... (tentative $i)"
      sleep 5
    fi
  done
  
  error "Application non accessible après 5 tentatives"
}

# Affichage du résumé
show_summary() {
  echo ""
  echo -e "${GREEN}"
  echo "════════════════════════════════════════"
  echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
  echo "════════════════════════════════════════"
  echo -e "${NC}"
  echo ""
  echo "📊 Résumé:"
  echo "  • Code: Déployé depuis GitHub"
  echo "  • VPS: $VPS_HOST"
  echo "  • App: $APP_PATH"
  if $SYNC_DB; then
    echo "  • DB: Synchronisée DEV → PROD"
  else
    echo "  • DB: Non synchronisée (--skip-db)"
  fi
  echo "  • URL: https://$DOMAIN"
  echo ""
  echo "🔧 Commandes utiles:"
  echo "  • Logs PM2: sshpass -p '$VPS_PASSWORD' ssh $VPS_USER@$VPS_HOST 'pm2 logs video-ia-net'"
  echo "  • Status PM2: sshpass -p '$VPS_PASSWORD' ssh $VPS_USER@$VPS_HOST 'pm2 status'"
  echo "  • Restart: sshpass -p '$VPS_PASSWORD' ssh $VPS_USER@$VPS_HOST 'pm2 restart video-ia-net'"
  echo ""
}

# Fonction principale
main() {
  if $DRY_RUN; then
    warning "MODE DRY RUN - Aucune modification ne sera effectuée"
    echo ""
  fi
  
  check_prerequisites
  test_vps_connection
  push_code
  deploy_to_vps
  sync_database
  health_check
  show_summary
}

# Gestion des erreurs
trap 'error "Déploiement interrompu"' ERR

# Exécution
main "$@"