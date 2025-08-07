#!/usr/bin/env python3
"""
Script de configuration pour la connexion à la base de données
Aide à détecter et configurer les paramètres de connexion PostgreSQL
"""

import os
import sys
from pathlib import Path
import json

def read_env_file():
    """Lit le fichier .env pour extraire les paramètres de connexion"""
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        print(f"📁 Lecture du fichier .env: {env_path}")
        with open(env_path, 'r') as f:
            content = f.read()
        
        # Extraire DATABASE_URL
        for line in content.split('\n'):
            if line.startswith('DATABASE_URL='):
                db_url = line.split('=', 1)[1].strip('"')
                print(f"🔗 URL de base de données trouvée: {db_url}")
                return parse_database_url(db_url)
    
    return None

def parse_database_url(url):
    """Parse l'URL de base de données Prisma pour extraire les paramètres"""
    try:
        # Format: prisma+postgres://localhost:51213/?api_key=...
        if url.startswith('prisma+postgres://'):
            # Extraire la partie host:port
            parts = url.replace('prisma+postgres://', '').split('/')[0]
            if ':' in parts:
                host, port = parts.split(':')
                # Utiliser le port 5432 par défaut si le port dans l'URL n'est pas accessible
                return {
                    'host': host,
                    'port': 5432,  # Port PostgreSQL standard
                    'database': 'template1',  # Base par défaut
                    'user': 'postgres',
                    'password': None
                }
    except Exception as e:
        print(f"⚠️ Erreur lors du parsing de l'URL: {e}")
    
    return None

def test_connection(host, port, database, user, password=None):
    """Teste la connexion à la base de données"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password
        )
        conn.close()
        return True
    except ImportError:
        print("❌ psycopg2 n'est pas installé. Installez-le avec: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ Échec de connexion: {e}")
        return False

def find_database_name(host, port, user, password=None):
    """Trouve le nom de la base de données principale"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=host,
            port=port,
            database='template1',
            user=user,
            password=password
        )
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false")
            databases = [row[0] for row in cursor.fetchall()]
            
            # Chercher une base de données qui pourrait être la nôtre
            for db in databases:
                if 'video' in db.lower() or 'ia' in db.lower() or 'net' in db.lower():
                    return db
            
            # Si aucune correspondance, retourner la première base non-template
            if databases:
                return databases[0]
        
        conn.close()
        return 'template1'
        
    except Exception as e:
        print(f"⚠️ Erreur lors de la recherche de la base de données: {e}")
        return 'template1'

def create_config_file(config):
    """Crée un fichier de configuration pour les scripts d'export"""
    config_path = Path(__file__).parent / 'db_config.json'
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Configuration sauvegardée dans: {config_path}")
    return config_path

def main():
    """Fonction principale de configuration"""
    print("🔧 Configuration de la connexion à la base de données")
    print("=" * 50)
    
    # Essayer de lire depuis .env
    config = read_env_file()
    
    if not config:
        print("❌ Impossible de lire la configuration depuis .env")
        print("💡 Configuration manuelle requise")
        
        config = {
            'host': input("Host (localhost): ").strip() or 'localhost',
            'port': int(input("Port (51214): ").strip() or '51214'),
            'database': input("Database (template1): ").strip() or 'template1',
            'user': input("User (postgres): ").strip() or 'postgres',
            'password': input("Password (optionnel): ").strip() or None
        }
    
    print(f"\n📋 Configuration détectée:")
    print(f"   Host: {config['host']}")
    print(f"   Port: {config['port']}")
    print(f"   Database: {config['database']}")
    print(f"   User: {config['user']}")
    print(f"   Password: {'*' * len(config['password']) if config['password'] else 'None'}")
    
    # Tester la connexion
    print(f"\n🔄 Test de connexion...")
    if test_connection(**config):
        print("✅ Connexion réussie!")
        
        # Essayer de trouver la vraie base de données
        if config['database'] == 'template1':
            real_db = find_database_name(config['host'], config['port'], config['user'], config['password'])
            if real_db != 'template1':
                config['database'] = real_db
                print(f"🎯 Base de données trouvée: {real_db}")
        
        # Sauvegarder la configuration
        config_path = create_config_file(config)
        
        print(f"\n✅ Configuration terminée!")
        print(f"📁 Fichier de configuration: {config_path}")
        print(f"\n💡 Pour exporter la base de données, utilisez:")
        print(f"   py scripts/export-database.py")
        print(f"   ou")
        print(f"   node scripts/export-database.js")
        
    else:
        print("❌ Impossible de se connecter à la base de données")
        print("💡 Vérifiez que:")
        print("   - PostgreSQL est en cours d'exécution")
        print("   - Les paramètres de connexion sont corrects")
        print("   - Le port est accessible")

if __name__ == "__main__":
    main() 