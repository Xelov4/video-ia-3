#!/bin/bash

# ===================================================================
# 🚀 VIDEO-IA.NET - SCRIPT DE DÉPLOIEMENT DOCKER COMPLET
# ===================================================================
# Script automatisé pour déployer l'application complète avec migration
# ===================================================================

set -e

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="video-ia-complete"
IMAGE_NAME="video-ia:latest"
BACKUP_DIR="./data/migration-backup"
DATA_DIR="./data"

# ===================================================================
# FONCTIONS UTILITAIRES
# ===================================================================

print_header() {
    echo -e "\n${BLUE}====================================================================="
    echo -e "🐳 VIDEO-IA.NET - DÉPLOIEMENT DOCKER COMPLET"
    echo -e "=====================================================================${NC}\n"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    print_step "Vérification des prérequis..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé !"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé !"
        exit 1
    fi
    
    # Git (pour auto-update)
    if ! command -v git &> /dev/null; then
        print_warning "Git n'est pas installé - fonctionnalité auto-update désactivée"
    fi
    
    echo "✅ Prérequis OK"
}

prepare_environment() {
    print_step "Préparation de l'environnement..."
    
    # Création répertoires données
    mkdir -p "${DATA_DIR}/postgres"
    mkdir -p "${DATA_DIR}/app"  
    mkdir -p "${DATA_DIR}/logs"
    mkdir -p "${DATA_DIR}/assets"
    mkdir -p "${BACKUP_DIR}"
    
    # Configuration .env si n'existe pas
    if [ ! -f .env ]; then
        print_warning "Fichier .env manquant, copie depuis .env.docker"
        cp .env.docker .env
        
        # Génération secrets automatiques
        NEW_SECRET=$(openssl rand -base64 32)
        NEW_DB_PASSWORD=$(openssl rand -base64 16)
        
        sed -i "s/CHANGE_ME_COMPLEX_SECRET_KEY_FOR_PRODUCTION_256_BITS/${NEW_SECRET}/g" .env
        sed -i "s/CHANGE_ME_SECURE_PASSWORD_123!/${NEW_DB_PASSWORD}/g" .env
        
        print_warning "⚠️  IMPORTANT: Editez le fichier .env avec vos vraies clés API !"
        print_warning "⚠️  Particulièrement GEMINI_API_KEY et NEXTAUTH_URL"
    fi
    
    echo "✅ Environnement préparé"
}

backup_existing_data() {
    print_step "Sauvegarde des données existantes..."
    
    # Si container existe déjà
    if docker ps -a --format 'table {{.Names}}' | grep -q "${CONTAINER_NAME}"; then
        print_step "Container existant détecté, création backup..."
        
        # Backup base de données
        docker exec ${CONTAINER_NAME} /app/scripts/backup-database.sh 2>/dev/null || echo "Backup automatique échoué"
        
        # Copie manuelle des volumes
        docker cp ${CONTAINER_NAME}:/var/lib/postgresql ${BACKUP_DIR}/postgres-backup 2>/dev/null || echo "Copie PostgreSQL échouée"
        docker cp ${CONTAINER_NAME}:/app/data ${BACKUP_DIR}/app-data-backup 2>/dev/null || echo "Copie données app échouée"
        
        echo "✅ Backup terminé"
    else
        print_step "Aucun container existant - pas de backup nécessaire"
    fi
}

stop_existing_container() {
    print_step "Arrêt des containers existants..."
    
    # Arrêt graceful
    if docker ps --format 'table {{.Names}}' | grep -q "${CONTAINER_NAME}"; then
        docker-compose down --timeout 30
        echo "✅ Containers arrêtés"
    else
        echo "✅ Aucun container à arrêter"
    fi
}

build_image() {
    print_step "Build de l'image Docker..."
    
    # Nettoyage des images orphelines
    docker system prune -f
    
    # Build avec cache si possible
    docker build \
        --tag ${IMAGE_NAME} \
        --build-arg NODE_ENV=production \
        --progress=plain \
        .
    
    echo "✅ Image buildée: ${IMAGE_NAME}"
}

start_application() {
    print_step "Démarrage de l'application..."
    
    # Démarrage avec docker-compose
    docker-compose up -d
    
    # Attendre que l'application soit prête
    print_step "Attente du démarrage complet (peut prendre 2-3 minutes)..."
    
    timeout=300  # 5 minutes max
    elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if docker exec ${CONTAINER_NAME} /app/scripts/health-check.sh &>/dev/null; then
            echo "✅ Application démarrée avec succès !"
            break
        fi
        
        echo -n "."
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    if [ $elapsed -ge $timeout ]; then
        print_error "Timeout - l'application n'a pas démarré dans les temps"
        print_warning "Vérifiez les logs: docker-compose logs -f"
        exit 1
    fi
}

show_status() {
    print_step "Statut final de l'application..."
    
    echo -e "\n${GREEN}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}\n"
    
    # Informations utiles
    echo -e "${BLUE}📊 INFORMATIONS UTILES:${NC}"
    echo "• URL Application: http://localhost:3000"
    echo "• Container Name: ${CONTAINER_NAME}"
    echo "• Image: ${IMAGE_NAME}"
    
    # Statut des services
    echo -e "\n${BLUE}📈 STATUT DES SERVICES:${NC}"
    docker exec ${CONTAINER_NAME} /app/scripts/health-check.sh || echo "Health check échoué"
    
    # Logs récents
    echo -e "\n${BLUE}📝 LOGS RÉCENTS:${NC}"
    docker-compose logs --tail=10
    
    # Commandes utiles
    echo -e "\n${BLUE}🔧 COMMANDES UTILES:${NC}"
    echo "• Voir logs: docker-compose logs -f"
    echo "• Entrer dans container: docker exec -it ${CONTAINER_NAME} bash"
    echo "• Redémarrer: docker-compose restart"
    echo "• Arrêter: docker-compose down"
    echo "• Health check: docker exec ${CONTAINER_NAME} /app/scripts/health-check.sh"
    echo "• Backup manuel: docker exec ${CONTAINER_NAME} /app/scripts/backup-database.sh"
}

# ===================================================================
# MENU INTERACTIF
# ===================================================================

show_menu() {
    echo -e "${BLUE}Choisissez une action:${NC}"
    echo "1) Déploiement complet (recommandé)"
    echo "2) Build seulement"
    echo "3) Démarrage seulement" 
    echo "4) Backup + arrêt"
    echo "5) Statut et logs"
    echo "6) Nettoyage complet"
    echo "0) Quitter"
    echo
    read -p "Votre choix [1]: " choice
    choice=${choice:-1}
}

deploy_complete() {
    print_header
    check_requirements
    prepare_environment
    backup_existing_data
    stop_existing_container
    build_image
    start_application
    show_status
}

build_only() {
    print_header
    check_requirements
    build_image
    echo "✅ Build terminé"
}

start_only() {
    print_header
    check_requirements
    start_application
    show_status
}

backup_and_stop() {
    print_header
    backup_existing_data
    stop_existing_container
    echo "✅ Backup et arrêt terminés"
}

show_current_status() {
    print_header
    
    echo -e "${BLUE}🔍 STATUT ACTUEL:${NC}"
    
    # Status containers
    if docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -q "${CONTAINER_NAME}"; then
        echo "✅ Container actif: ${CONTAINER_NAME}"
        docker exec ${CONTAINER_NAME} /app/scripts/health-check.sh 2>/dev/null || echo "❌ Health check échoué"
    else
        echo "❌ Aucun container actif"
    fi
    
    # Logs récents
    echo -e "\n${BLUE}📝 LOGS RÉCENTS:${NC}"
    docker-compose logs --tail=20
}

cleanup_all() {
    print_header
    print_warning "⚠️  ATTENTION: Cette action va supprimer TOUS les containers et images Video-IA !"
    read -p "Êtes-vous sûr ? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_step "Nettoyage en cours..."
        
        # Arrêt et suppression
        docker-compose down --volumes --remove-orphans
        docker image rm ${IMAGE_NAME} 2>/dev/null || echo "Image déjà supprimée"
        docker system prune -f
        
        echo "✅ Nettoyage terminé"
    else
        echo "Opération annulée"
    fi
}

# ===================================================================
# MAIN SCRIPT
# ===================================================================

main() {
    # Si arguments fournis, exécution directe
    if [ $# -gt 0 ]; then
        case $1 in
            "deploy"|"full") deploy_complete ;;
            "build") build_only ;;
            "start") start_only ;;
            "backup") backup_and_stop ;;
            "status") show_current_status ;;
            "clean") cleanup_all ;;
            *)
                echo "Usage: $0 [deploy|build|start|backup|status|clean]"
                exit 1
                ;;
        esac
        exit 0
    fi
    
    # Menu interactif
    while true; do
        show_menu
        
        case $choice in
            1) deploy_complete; break ;;
            2) build_only; break ;;
            3) start_only; break ;;
            4) backup_and_stop; break ;;
            5) show_current_status; break ;;
            6) cleanup_all; break ;;
            0) echo "Au revoir !"; exit 0 ;;
            *) echo "Choix invalide" ;;
        esac
        
        echo
        read -p "Appuyez sur Entrée pour continuer..."
        clear
    done
}

# Vérification si script lancé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi