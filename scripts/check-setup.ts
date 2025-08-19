/**
 * Script de vérification de configuration
 *
 * Vérifie:
 * - Connexion à la base de données
 * - Existence des dossiers d'images
 * - Fichiers de placeholders
 */

import { prisma } from '../src/lib/database/client';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkDatabaseConnection() {
  console.log('🔍 Vérification de la connexion à la base de données...');
  try {
    // Test simple de requête
    const toolCount = await prisma.tool.count();
    const categoryCount = await prisma.category.count();

    console.log(`✅ Connexion à la base de données établie!`);
    console.log(`📊 ${toolCount} outils et ${categoryCount} catégories trouvés.`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error(error);
    return false;
  }
}

async function createImageDirectories() {
  console.log("🔍 Vérification des dossiers d'images...");

  const directories = [
    'public/images',
    'public/images/tools',
    'public/images/placeholders',
    'public/images/categories',
  ];

  for (const dir of directories) {
    const fullPath = path.resolve(process.cwd(), dir);

    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Dossier créé: ${dir}`);
      } else {
        console.log(`✅ Dossier existant: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création du dossier ${dir}:`, error);
    }
  }
}

async function createPlaceholderImages() {
  console.log('🔍 Vérification des images placeholder...');

  const placeholdersDir = path.resolve(process.cwd(), 'public/images/placeholders');
  const placeholders = [
    'tool-1.jpg',
    'tool-2.jpg',
    'tool-3.jpg',
    'tool-4.jpg',
    'tool-5.jpg',
  ];

  for (const placeholder of placeholders) {
    const fullPath = path.join(placeholdersDir, placeholder);

    if (!fs.existsSync(fullPath)) {
      try {
        // Create a placeholder image
        const width = 800;
        const height = 450;

        // If we have ImageMagick installed, use it to create a nice placeholder
        try {
          await execAsync(
            `convert -size ${width}x${height} plasma:blue-purple ${fullPath}`
          );
          console.log(`✅ Placeholder créé: ${placeholder}`);
        } catch (error) {
          // Fallback: Create an empty file if ImageMagick is not available
          fs.writeFileSync(fullPath, '');
          console.log(
            `⚠️ Placeholder vide créé (ImageMagick non disponible): ${placeholder}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la création du placeholder ${placeholder}:`,
          error
        );
      }
    } else {
      console.log(`✅ Placeholder existant: ${placeholder}`);
    }
  }
}

async function createOgImages() {
  console.log('🔍 Vérification des images OG...');

  const imagesDir = path.resolve(process.cwd(), 'public/images');
  const supportedLanguages = ['en', 'fr', 'it', 'es', 'de', 'nl', 'pt'];

  for (const lang of supportedLanguages) {
    const ogImage = `og-image-${lang}.jpg`;
    const fullPath = path.join(imagesDir, ogImage);

    if (!fs.existsSync(fullPath)) {
      try {
        // Create a placeholder OG image
        const width = 1200;
        const height = 630;

        // If we have ImageMagick installed, use it to create a nice OG image
        try {
          await execAsync(
            `convert -size ${width}x${height} gradient:blue-purple -gravity Center -pointsize 40 -fill white -annotate 0 "Video-IA.net (${lang.toUpperCase()})" ${fullPath}`
          );
          console.log(`✅ OG image créée: ${ogImage}`);
        } catch (error) {
          // Fallback: Create an empty file if ImageMagick is not available
          fs.writeFileSync(fullPath, '');
          console.log(
            `⚠️ OG image vide créée (ImageMagick non disponible): ${ogImage}`
          );
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de l'OG image ${ogImage}:`, error);
      }
    } else {
      console.log(`✅ OG image existante: ${ogImage}`);
    }
  }
}

async function main() {
  console.log('🚀 Démarrage de la vérification du système...');

  // Vérifier la base de données
  const dbConnected = await checkDatabaseConnection();

  // Créer les dossiers d'images (même si DB échoue)
  await createImageDirectories();

  // Créer les placeholders
  await createPlaceholderImages();

  // Créer les OG images
  await createOgImages();

  // Message final
  if (dbConnected) {
    console.log('\n✅ Le système est prêt!');
    console.log("📝 Vous pouvez maintenant lancer l'application avec:");
    console.log('   npm run dev');
  } else {
    console.log("\n⚠️ La base de données n'est pas accessible!");
    console.log(
      '📝 Vérifiez que PostgreSQL est démarré et que les identifiants dans .env.local sont corrects.'
    );
  }

  // Fermeture propre
  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ Erreur lors de la vérification du système:', error);
  prisma.$disconnect();
  process.exit(1);
});
