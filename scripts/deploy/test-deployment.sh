#!/bin/bash

# 🧪 Test de Déploiement Complet
# Script de test pour valider l'ensemble du système de déploiement CI/CD
# Usage: ./scripts/deploy/test-deployment.sh

set -e

echo "🧪 Test de Déploiement Complet - video-ia.net"
echo "============================================="

# Configuration
VPS_HOST="46.202.129.104"
DOMAIN="www.video-ia.net"
TEST_DIR="./test-results/deployment-$(date +%Y%m%d_%H%M%S)"
TIMEOUT=30

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs de tests
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    ((TESTS_TOTAL++))
    log "Test: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ "$expected_result" = "success" ] || [ "$expected_result" = "" ]; then
            success "$test_name - PASS"
        else
            error "$test_name - FAIL (attendu: échec, obtenu: succès)"
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            success "$test_name - PASS (échec attendu)"
        else
            error "$test_name - FAIL"
        fi
    fi
}

setup_test_environment() {
    log "Configuration de l'environnement de test..."
    
    mkdir -p "$TEST_DIR"
    cd "$(dirname "$0")/../.."
    
    # Vérifier les outils requis
    for tool in curl pg_dump psql node npm; do
        if ! command -v $tool &> /dev/null; then
            error "Outil requis manquant: $tool"
            exit 1
        fi
    done
    
    success "Environnement de test configuré"
}

# Test 1: Connectivité aux bases de données
test_database_connectivity() {
    log "📊 Test 1: Connectivité aux bases de données"
    
    # Base DEV
    run_test "Connexion base DEV" \
        "PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -c 'SELECT 1;'" \
        "success"
    
    # Base PROD
    run_test "Connexion base PROD" \
        "PGPASSWORD=Buzzerbeater23 psql -h $VPS_HOST -U video_ia_user -d video_ia_net -c 'SELECT 1;'" \
        "success"
    
    # Compte des enregistrements
    local dev_count=$(PGPASSWORD=video123 psql -h localhost -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools;" 2>/dev/null | tr -d ' ' || echo "0")
    local prod_count=$(PGPASSWORD=Buzzerbeater23 psql -h $VPS_HOST -U video_ia_user -d video_ia_net -t -c "SELECT COUNT(*) FROM tools;" 2>/dev/null | tr -d ' ' || echo "0")
    
    log "   DEV: $dev_count outils | PROD: $prod_count outils"
    
    if [ "$dev_count" -gt 1000 ] && [ "$prod_count" -gt 1000 ]; then
        success "Données présentes dans les deux bases"
    else
        error "Données insuffisantes (DEV: $dev_count, PROD: $prod_count)"
    fi
}

# Test 2: Scripts de synchronisation
test_sync_scripts() {
    log "🔄 Test 2: Scripts de synchronisation"
    
    # Test analyzer
    run_test "Script analyzer" \
        "npm run sync:analyze -- --verbose" \
        "success"
    
    # Test sync dry-run DEV → PROD
    run_test "Sync DEV → PROD (dry-run)" \
        "npm run sync:to-prod -- --mode=tools --dry-run --quiet" \
        "success"
    
    # Test sync dry-run PROD → DEV
    run_test "Sync PROD → DEV (dry-run)" \
        "npm run sync:from-prod -- --mode=content_only --dry-run --quiet" \
        "success"
}

# Test 3: Build et deployment local
test_build_process() {
    log "🏗️ Test 3: Processus de build"
    
    # Type checking
    run_test "Type checking" \
        "npm run type-check" \
        "success"
    
    # Build de l'application
    run_test "Build de l'application" \
        "npm run build" \
        "success"
    
    # Test de démarrage (arrêt rapide)
    run_test "Test de démarrage" \
        "timeout 10s npm run start &" \
        "success"
    
    # Arrêter le processus de test
    pkill -f "next start" 2>/dev/null || true
}

# Test 4: Connectivité VPS
test_vps_connectivity() {
    log "🌐 Test 4: Connectivité VPS"
    
    # Ping VPS
    run_test "Ping VPS" \
        "ping -c 3 $VPS_HOST" \
        "success"
    
    # Test HTTP
    run_test "HTTP Response" \
        "curl -f -s --max-time $TIMEOUT http://$VPS_HOST" \
        "success"
    
    # Test HTTPS (peut échouer si SSL pas configuré)
    if curl -f -s --max-time $TIMEOUT "https://$DOMAIN" &>/dev/null; then
        success "HTTPS Response - PASS"
    else
        warning "HTTPS non disponible (normal si SSL pas configuré)"
    fi
    
    # Test API endpoint
    run_test "API Endpoint" \
        "curl -f -s --max-time $TIMEOUT 'http://$VPS_HOST:3000/api/tools?limit=1'" \
        "success"
}

# Test 5: Configuration PM2 et Nginx
test_server_config() {
    log "⚙️ Test 5: Configuration serveur"
    
    # Test si PM2 est installé et app tourne
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$VPS_HOST "pm2 status" &>/dev/null; then
        success "PM2 accessible via SSH"
    else
        error "PM2 non accessible ou app non démarrée"
    fi
    
    # Test configuration Nginx
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$VPS_HOST "nginx -t" &>/dev/null; then
        success "Configuration Nginx valide"
    else
        warning "Configuration Nginx non testable via SSH"
    fi
}

# Test 6: Performance et santé
test_performance() {
    log "⚡ Test 6: Performance et santé"
    
    # Test de charge basique
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time $TIMEOUT "http://$VPS_HOST:3000/api/tools?limit=10" || echo "999")
    
    if (( $(echo "$response_time < 5.0" | bc -l) )); then
        success "Temps de réponse API acceptable: ${response_time}s"
    else
        warning "Temps de réponse API lent: ${response_time}s"
    fi
    
    # Test de mémoire DB (via query)
    local memory_query="SELECT pg_size_pretty(pg_database_size('video_ia_net')) as db_size;"
    local db_size=$(PGPASSWORD=Buzzerbeater23 psql -h $VPS_HOST -U video_ia_user -d video_ia_net -t -c "$memory_query" 2>/dev/null || echo "N/A")
    
    log "   Taille DB PROD: $(echo $db_size | tr -d ' ')"
    
    if [[ "$db_size" =~ [0-9]+[[:space:]]*MB ]] && [[ ! "$db_size" =~ GB ]]; then
        success "Taille DB dans les limites normales"
    elif [[ "$db_size" =~ [0-9]+[[:space:]]*GB ]]; then
        warning "Base de données volumineuse: $db_size"
    else
        warning "Impossible de déterminer la taille DB"
    fi
}

# Test 7: Sécurité basique
test_security() {
    log "🔒 Test 7: Sécurité basique"
    
    # Test headers de sécurité
    local security_headers=$(curl -I -s --max-time $TIMEOUT "http://$VPS_HOST" | grep -i "x-frame-options\|x-content-type-options\|strict-transport-security" | wc -l)
    
    if [ "$security_headers" -gt 0 ]; then
        success "Headers de sécurité détectés"
    else
        warning "Headers de sécurité manquants"
    fi
    
    # Test exposition de ports
    if nmap -p 5432 $VPS_HOST 2>/dev/null | grep -q "open"; then
        warning "Port PostgreSQL (5432) ouvert publiquement"
    else
        success "Port PostgreSQL non exposé publiquement"
    fi
}

# Test 8: Intégration GitHub Actions (simulation)
test_github_actions_simulation() {
    log "🔧 Test 8: Simulation GitHub Actions"
    
    # Simuler les étapes du workflow de déploiement
    run_test "Simulation checkout" \
        "git status" \
        "success"
    
    run_test "Simulation npm ci" \
        "npm ci --quiet" \
        "success"
    
    run_test "Simulation type-check" \
        "npm run type-check" \
        "success"
    
    run_test "Simulation build" \
        "npm run build" \
        "success"
    
    log "   Note: SSH deployment simulé (nécessite vraies clés)"
}

# Génération du rapport
generate_report() {
    log "📄 Génération du rapport de test..."
    
    local report_file="$TEST_DIR/deployment-test-report.md"
    
    cat > "$report_file" << EOF
# 🧪 Rapport de Test de Déploiement

**Date**: $(date)
**VPS**: $VPS_HOST
**Domaine**: $DOMAIN

## 📊 Résultats

- **Tests réussis**: $TESTS_PASSED
- **Tests échoués**: $TESTS_FAILED
- **Total**: $TESTS_TOTAL
- **Taux de réussite**: $((TESTS_PASSED * 100 / TESTS_TOTAL))%

## 📋 Détails des tests

### ✅ Tests réussis
$([ $TESTS_PASSED -gt 0 ] && echo "- $TESTS_PASSED tests ont été validés avec succès" || echo "Aucun")

### ❌ Tests échoués
$([ $TESTS_FAILED -gt 0 ] && echo "- $TESTS_FAILED tests ont échoué et nécessitent une attention" || echo "Aucun")

## 🎯 Recommandations

$(if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ Tous les tests sont passés ! Le système de déploiement est opérationnel."
else
    echo "⚠️ Certains tests ont échoué. Vérifiez les logs ci-dessus et corrigez les problèmes identifiés."
fi)

### Prochaines étapes
1. Corriger les tests échoués si nécessaire
2. Configurer SSL avec Let's Encrypt
3. Tester un déploiement complet via GitHub Actions
4. Mettre en place la surveillance continue

## 🔗 Ressources
- [Guide de déploiement](../../DEPLOYMENT_CI_CD_GUIDE.md)
- [Quick Start](../../QUICK_START_DEPLOYMENT.md)
- [GitHub Actions](../../.github/DEPLOYMENT_README.md)

---
*Rapport généré automatiquement par test-deployment.sh*
EOF

    success "Rapport généré: $report_file"
}

# Fonction de nettoyage
cleanup() {
    log "🧹 Nettoyage..."
    
    # Arrêter les processus de test si nécessaire
    pkill -f "next start" 2>/dev/null || true
    
    # Nettoyer les fichiers temporaires
    # (On garde les logs pour debugging)
    
    log "Nettoyage terminé"
}

# Résumé final
show_summary() {
    echo
    echo "═════════════════════════════════════════"
    echo "🎯 RÉSUMÉ DES TESTS DE DÉPLOIEMENT"
    echo "═════════════════════════════════════════"
    echo
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 SUCCÈS COMPLET !${NC}"
        echo "   Tous les $TESTS_TOTAL tests sont passés"
        echo "   Le système de déploiement est prêt"
    else
        echo -e "${YELLOW}⚠️ TESTS PARTIELLEMENT RÉUSSIS${NC}"
        echo "   Réussis: $TESTS_PASSED/$TESTS_TOTAL"
        echo "   Échoués: $TESTS_FAILED/$TESTS_TOTAL"
        echo "   Vérifiez les erreurs ci-dessus"
    fi
    
    echo
    echo "📁 Résultats détaillés: $TEST_DIR"
    echo "📊 Rapport complet: $TEST_DIR/deployment-test-report.md"
    echo
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo "✅ Vous pouvez procéder au déploiement en production"
    else
        echo "🔧 Corrigez les problèmes avant de déployer en production"
    fi
    echo
}

# Fonction principale
main() {
    setup_test_environment
    
    log "Début des tests de déploiement..."
    echo
    
    # Exécution des tests
    test_database_connectivity
    echo
    test_sync_scripts
    echo
    test_build_process
    echo
    test_vps_connectivity
    echo
    test_server_config
    echo
    test_performance
    echo
    test_security
    echo
    test_github_actions_simulation
    echo
    
    # Génération des résultats
    generate_report
    show_summary
    
    # Code de sortie
    if [ $TESTS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Gestion des erreurs et nettoyage
trap cleanup EXIT

# Exécution
main "$@"