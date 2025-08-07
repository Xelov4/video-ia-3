#!/usr/bin/env python3
"""
Script d'exportation de la base de données video-ia.net
Exporte toutes les données en JSON et SQL pour utilisation dans d'autres projets
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
import argparse

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'port': 51214,  # Port PostgreSQL standard
    'database': 'template1',  # Base de données par défaut
    'user': 'postgres',
    'password': None  # À configurer selon votre setup
}

def get_db_connection():
    """Établit une connexion à la base de données PostgreSQL"""
    try:
        # Essayer de se connecter avec les paramètres par défaut
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG.get('password')
        )
        print("✅ Connexion à la base de données établie")
        return conn
    except psycopg2.OperationalError as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        print("💡 Vérifiez que PostgreSQL est en cours d'exécution et que les paramètres de connexion sont corrects")
        return None

def get_all_tables(conn):
    """Récupère la liste de toutes les tables de la base de données"""
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        return [row[0] for row in cursor.fetchall()]

def export_table_data(conn, table_name):
    """Exporte toutes les données d'une table spécifique"""
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def create_json_export(conn, export_dir):
    """Crée un export JSON complet de la base de données"""
    print("🔄 Création de l'export JSON...")
    
    # Récupérer toutes les tables
    tables = get_all_tables(conn)
    print(f"📊 Tables trouvées: {', '.join(tables)}")
    
    # Structure des données d'export
    export_data = {
        'exportDate': datetime.now().isoformat(),
        'database': 'video-ia.net',
        'tables': {}
    }
    
    # Exporter chaque table
    for table in tables:
        print(f"📊 Exportation de la table: {table}")
        try:
            data = export_table_data(conn, table)
            export_data['tables'][table] = data
            print(f"   ✅ {len(data)} enregistrements exportés")
        except Exception as e:
            print(f"   ❌ Erreur lors de l'export de {table}: {e}")
    
    # Créer le fichier JSON
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    json_path = export_dir / f"database-export-{timestamp}.json"
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"✅ Export JSON créé: {json_path}")
    return json_path

def create_sql_export(conn, export_dir):
    """Crée un export SQL avec les instructions INSERT"""
    print("🔄 Création de l'export SQL...")
    
    tables = get_all_tables(conn)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    sql_path = export_dir / f"database-export-{timestamp}.sql"
    
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write(f"-- Export de la base de données video-ia.net\n")
        f.write(f"-- Date: {datetime.now().isoformat()}\n")
        f.write(f"-- Généré automatiquement\n\n")
        
        # Réinitialisation des tables
        f.write("-- Réinitialisation des tables\n")
        for table in reversed(tables):  # Ordre inverse pour éviter les contraintes de clés étrangères
            f.write(f"TRUNCATE TABLE {table} CASCADE;\n")
        f.write("\n")
        
        # Export des données de chaque table
        for table in tables:
            print(f"📊 Génération SQL pour: {table}")
            try:
                data = export_table_data(conn, table)
                if data:
                    f.write(f"-- Insertion des données de {table}\n")
                    
                    # Récupérer les noms des colonnes
                    with conn.cursor() as cursor:
                        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position")
                        columns = [row[0] for row in cursor.fetchall()]
                    
                    # Générer les INSERT statements
                    for row in data:
                        values = []
                        for col in columns:
                            value = row.get(col)
                            if value is None:
                                values.append('NULL')
                            elif isinstance(value, (int, float)):
                                values.append(str(value))
                            elif isinstance(value, bool):
                                values.append('TRUE' if value else 'FALSE')
                            else:
                                # Échapper les apostrophes dans les chaînes
                                escaped_value = str(value).replace("'", "''")
                                values.append(f"'{escaped_value}'")
                        
                        f.write(f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(values)});\n")
                    
                    f.write("\n")
                    print(f"   ✅ {len(data)} INSERT statements générés")
                
            except Exception as e:
                print(f"   ❌ Erreur lors de la génération SQL pour {table}: {e}")
        
        # Réinitialisation des séquences
        f.write("-- Réinitialisation des séquences\n")
        for table in tables:
            f.write(f"SELECT setval('{table}_id_seq', (SELECT MAX(id) FROM {table}));\n")
    
    print(f"✅ Export SQL créé: {sql_path}")
    return sql_path

def create_csv_exports(conn, export_dir):
    """Crée des exports CSV pour chaque table"""
    print("🔄 Création des exports CSV...")
    
    import csv
    tables = get_all_tables(conn)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_dir = export_dir / f"csv-export-{timestamp}"
    csv_dir.mkdir(exist_ok=True)
    
    for table in tables:
        print(f"📊 Export CSV pour: {table}")
        try:
            data = export_table_data(conn, table)
            if data:
                csv_path = csv_dir / f"{table}.csv"
                
                with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                    if data:
                        writer = csv.DictWriter(f, fieldnames=data[0].keys())
                        writer.writeheader()
                        writer.writerows(data)
                
                print(f"   ✅ {len(data)} lignes exportées vers {csv_path}")
        
        except Exception as e:
            print(f"   ❌ Erreur lors de l'export CSV pour {table}: {e}")
    
    print(f"✅ Exports CSV créés dans: {csv_dir}")
    return csv_dir

def main():
    """Fonction principale d'exportation"""
    parser = argparse.ArgumentParser(description='Export de la base de données video-ia.net')
    parser.add_argument('--format', choices=['json', 'sql', 'csv', 'all'], default='all',
                       help='Format d\'export (json, sql, csv, all)')
    parser.add_argument('--output-dir', default='../data-exports',
                       help='Répertoire de sortie pour les exports')
    
    args = parser.parse_args()
    
    # Créer le répertoire d'export
    export_dir = Path(args.output_dir)
    export_dir.mkdir(exist_ok=True)
    
    print("🔄 Début de l'exportation de la base de données...")
    
    # Connexion à la base de données
    conn = get_db_connection()
    if not conn:
        sys.exit(1)
    
    try:
        # Exécuter les exports selon le format demandé
        if args.format in ['json', 'all']:
            create_json_export(conn, export_dir)
        
        if args.format in ['sql', 'all']:
            create_sql_export(conn, export_dir)
        
        if args.format in ['csv', 'all']:
            create_csv_exports(conn, export_dir)
        
        print("✅ Exportation terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'exportation: {e}")
        sys.exit(1)
    
    finally:
        conn.close()
        print("🔌 Connexion à la base de données fermée")

if __name__ == "__main__":
    main() 