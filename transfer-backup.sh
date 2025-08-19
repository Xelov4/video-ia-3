#!/bin/bash

# ============================================================================
# 🚀 SCRIPT DE TRANSFERT BACKUP VERS VPS PRODUCTION
# ============================================================================

VPS_IP="46.202.129.104"
VPS_USER="root" 
VPS_PATH="/root/video-ia-3/"
BACKUP_FILE="video_ia_backup_production_20250818_233327.sql"

echo "📦 === TRANSFERT BACKUP VERS VPS PRODUCTION ==="
echo "🎯 VPS: $VPS_IP"
echo "📁 Destination: $VPS_PATH"
echo "📄 Fichier: $BACKUP_FILE (114M)"
echo ""

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erreur: Fichier $BACKUP_FILE non trouvé"
    exit 1
fi

echo "🔄 Transfert en cours..."
echo "⚠️  Tu vas être invité à saisir le mot de passe root du VPS"
echo ""

# Option 1: SCP avec mot de passe (recommandé)
echo "🚀 Méthode 1: SCP avec mot de passe"
echo "Commande à exécuter:"
echo "scp $BACKUP_FILE $VPS_USER@$VPS_IP:$VPS_PATH"
echo ""

# Option 2: Générer les commandes alternatives
echo "📋 MÉTHODES ALTERNATIVES:"
echo ""

echo "🔧 Option 1 - SCP avec mot de passe:"
echo "scp $BACKUP_FILE $VPS_USER@$VPS_IP:$VPS_PATH"
echo ""

echo "🔧 Option 2 - RSYNC avec mot de passe:"
echo "rsync -avz --progress $BACKUP_FILE $VPS_USER@$VPS_IP:$VPS_PATH"
echo ""

echo "🔧 Option 3 - Via GitHub (si fichier < 100MB):"
echo "# Compresser d'abord:"
echo "gzip $BACKUP_FILE"
echo "# Puis uploader manuellement sur GitHub/Google Drive"
echo ""

echo "🔧 Option 4 - Configuration SSH (une fois pour toutes):"
echo "# Sur le VPS, éditer /etc/ssh/sshd_config:"
echo "# PasswordAuthentication yes"
echo "# PubkeyAuthentication yes"
echo "# Puis: systemctl reload sshd"
echo ""

echo "💡 RECOMMANDATION:"
echo "Utilise la méthode SCP avec ton mot de passe root VPS"
echo ""

# Tenter le transfert automatiquement
echo "🚀 Tentative de transfert automatique..."
scp -o ConnectTimeout=30 "$BACKUP_FILE" "$VPS_USER@$VPS_IP:$VPS_PATH" && {
    echo "✅ Transfert réussi !"
    echo "📊 Vérification sur le VPS:"
    echo "ssh $VPS_USER@$VPS_IP 'ls -la $VPS_PATH$BACKUP_FILE'"
} || {
    echo "❌ Transfert automatique échoué"
    echo "🔐 Utilise une des méthodes manuelles ci-dessus"
}

echo ""
echo "📝 APRÈS LE TRANSFERT:"
echo "1. Se connecter au VPS: ssh $VPS_USER@$VPS_IP"
echo "2. Aller dans le dossier: cd $VPS_PATH"
echo "3. Vérifier le fichier: ls -la $BACKUP_FILE"
echo "4. Décompresser si nécessaire: gunzip $BACKUP_FILE.gz"
echo "5. Suivre le DEPLOYMENT_PLAN.md pour l'import"