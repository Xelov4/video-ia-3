#!/bin/bash

# Script de test API avec curl pour video-ia.net
# Usage: ./test-api-curl.sh

BASE_URL="http://localhost:3000"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}🚀 Tests API pour video-ia.net${NC}"
echo -e "${YELLOW}Base URL: $BASE_URL${NC}\n"

# Fonction pour tester une API
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    
    echo -e "${CYAN}🧪 Test: $name${NC}"
    echo -e "${BLUE}ℹ️  $method $url${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$url")
    fi
    
    # Extraire le body et le status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
        echo -e "${GREEN}✅ Status: $status${NC}"
        echo -e "${BLUE}Response: $body${NC}"
    else
        echo -e "${RED}❌ Status: $status${NC}"
        echo -e "${RED}Error: $body${NC}"
    fi
    echo ""
}

# Test de santé du serveur
echo -e "${CYAN}🧪 Test: Vérification de santé du serveur${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Serveur accessible${NC}"
else
    echo -e "${RED}❌ Serveur non accessible${NC}"
    exit 1
fi
echo ""

# Tests API Catégories
test_api "API Catégories - Toutes les catégories" "GET" "/api/categories"
test_api "API Catégories - Catégories en vedette" "GET" "/api/categories?featured=true"

# Tests API Outils
test_api "API Outils - Tous les outils (page 1)" "GET" "/api/tools"
test_api "API Outils - Pagination (page 2, 10 par page)" "GET" "/api/tools?page=2&per_page=10"
test_api "API Outils - Recherche par mot-clé" "GET" "/api/tools?q=video"
test_api "API Outils - Filtrage par catégorie" "GET" "/api/tools?category=video-editing"
test_api "API Outils - Outils en vedette" "GET" "/api/tools?featured=true"
test_api "API Outils - Combinaison de filtres" "GET" "/api/tools?q=ai&category=video-editing&featured=true"

# Tests API Détail d'outil
test_api "API Détail d'outil - Slug existant" "GET" "/api/tools/example-tool-slug"
test_api "API Détail d'outil - Slug inexistant" "GET" "/api/tools/non-existent-tool"

# Tests API Scraping
test_api "API Scraping - Analyse d'un site" "POST" "/api/scrape" '{"url":"https://example-ai-tool.com"}'
test_api "API Scraping - URL invalide" "POST" "/api/scrape" '{"url":"invalid-url"}'
test_api "API Scraping - Sans URL" "POST" "/api/scrape" '{}'

echo -e "${MAGENTA}✨ Tests terminés !${NC}" 