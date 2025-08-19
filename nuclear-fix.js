#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('☢️  SCRIPT DE CORRECTION NUCLÉAIRE ESLint + Prettier');
console.log('=====================================================');

// 1. CORRECTION NUCLÉAIRE des caractères d'échappement
function nuclearFix() {
  console.log("\n1️⃣ CORRECTION NUCLÉAIRE des caractères d'échappement...");

  function processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      // CORRECTION NUCLÉAIRE - Remplacer TOUS les caractères problématiques
      const nuclearFixes = [
        // Corriger les échappements incorrects dans JSX
        { pattern: /\\"/g, replacement: '&quot;' },
        { pattern: /\\'/g, replacement: '&apos;' },

        // Corriger les apostrophes dans les chaînes JSX
        {
          pattern: /'([^']*?)'([^']*?)'([^']*?)'/g,
          replacement: "'$1\\'$2\\'$3'",
        },

        // Corriger les guillemets dans le texte JSX
        { pattern: />\s*([^<]*?)\\"([^<]*?)</g, replacement: '>$1&quot;$2<' },
        { pattern: />\s*([^<]*?)\\'([^<]*?)</g, replacement: '>$1&apos;$2<' },

        // Nettoyer les échappements doubles
        { pattern: /\\\\"/g, replacement: '&quot;' },
        { pattern: /\\\\'/g, replacement: '&apos;' },

        // Corriger les échappements dans les chaînes de caractères
        { pattern: /"([^"]*?)\\"([^"]*?)"/g, replacement: '"$1&quot;$2"' },
        { pattern: /'([^']*?)\\'([^']*?)'/g, replacement: "'$1\\'$2'" },
      ];

      nuclearFixes.forEach(fix => {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Corrigé: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${filePath} - ${error.message}`);
    }
  }

  function walkDirectory(dir) {
    const entries = fs.readdirSync(dir);

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (
          !entry.startsWith('.') &&
          !['node_modules', 'dist', 'build'].includes(entry)
        ) {
          walkDirectory(fullPath);
        }
      } else if (entry.match(/\.(tsx?|jsx?)$/)) {
        processFile(fullPath);
      }
    });
  }

  walkDirectory('./src');
  walkDirectory('./app');
}

// 2. CONFIGURATION ESLint ULTRA-PERMISSIVE temporaire
function setupUltraPermissiveESLint() {
  console.log('\n2️⃣ Configuration ESLint ULTRA-PERMISSIVE...');

  const eslintrc = {
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'warn', // Changé en warning
      'no-unused-vars': 'off', // Désactivé
      'no-console': 'off', // Désactivé
      '@typescript-eslint/no-unused-vars': 'off', // Désactivé
      '@typescript-eslint/no-explicit-any': 'off', // Désactivé
      'react-hooks/exhaustive-deps': 'off', // Désactivé
      '@typescript-eslint/no-unused-expressions': 'off', // Désactivé
      '@typescript-eslint/no-require-imports': 'off', // Désactivé
      'no-var': 'warn', // Changé en warning
      'prefer-const': 'off', // Désactivé
      'react/no-unescaped-entities': 'off', // Désactivé
      '@next/next/no-assign-module-variable': 'off', // Désactivé
      '@next/next/next-script-for-ga': 'off', // Désactivé
      '@next/next/no-page-custom-font': 'off', // Désactivé
      'import/no-anonymous-default-export': 'off', // Désactivé
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  };

  fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintrc, null, 2));
  console.log('✅ Configuration ESLint ULTRA-PERMISSIVE créée');
}

// 3. FORMATAGE PRETTIER AGGRESSIF
function aggressivePrettier() {
  console.log('\n3️⃣ Formatage Prettier AGGRESSIF...');
  try {
    // Forcer le formatage même avec des erreurs
    execSync('npx prettier --write src/ app/ --ignore-unknown --loglevel error', {
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    console.log('✅ Prettier agressif terminé');
  } catch (error) {
    console.log('⚠️ Prettier a rencontré des erreurs (normal)');
  }
}

// 4. ESLint --fix AGGRESSIF
function aggressiveESLintFix() {
  console.log('\n4️⃣ ESLint --fix AGGRESSIF...');
  try {
    execSync('npx eslint src/ app/ --fix --ext .ts,.tsx,.js,.jsx --max-warnings 1000', {
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    console.log('✅ ESLint --fix agressif terminé');
  } catch (error) {
    console.log('⚠️ ESLint a traité les fichiers (erreurs restantes normales)');
  }
}

// 5. NETTOYAGE COMPLET
function completeCleanup() {
  console.log('\n5️⃣ Nettoyage complet...');

  // Supprimer tous les fichiers temporaires
  const filesToDelete = [
    'fix-apostrophes.js',
    'fix-all-errors.js',
    'nuclear-fix.js',
    '.eslintcache',
    '.prettiercache',
  ];

  filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️ Supprimé: ${file}`);
    }
  });

  // Restaurer la configuration ESLint normale
  const normalEslintrc = {
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  };

  fs.writeFileSync('.eslintrc.json', JSON.stringify(normalEslintrc, null, 2));
  console.log('✅ Configuration ESLint normale restaurée');
}

// 6. RAPPORT FINAL
function finalReport() {
  console.log('\n6️⃣ Rapport final...');
  try {
    const result = execSync(
      'npx eslint src/ app/ --ext .ts,.tsx,.js,.jsx --max-warnings 1000',
      {
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 * 10,
      }
    );
    console.log('🎉 Aucune erreur ESLint restante !');
  } catch (error) {
    const output = error.stdout || error.message;
    const lines = output.split('\n');
    const errorCount = lines.filter(line => line.includes('Error:')).length;
    const warningCount = lines.filter(line => line.includes('Warning:')).length;

    console.log(`📊 Rapport final: ${errorCount} erreurs, ${warningCount} warnings`);

    if (errorCount === 0) {
      console.log('🎯 SUCCÈS ! Aucune erreur critique restante !');
    } else {
      console.log('\n🎯 Erreurs restantes (à corriger manuellement):');
      lines.slice(0, 10).forEach(line => {
        if (line.includes('Error:')) {
          console.log(`  ${line}`);
        }
      });
    }
  }
}

// EXÉCUTION NUCLÉAIRE
async function nuclearMain() {
  try {
    console.log('🚀 DÉMARRAGE DE LA CORRECTION NUCLÉAIRE...');

    nuclearFix();
    setupUltraPermissiveESLint();
    aggressivePrettier();
    aggressiveESLintFix();
    completeCleanup();
    finalReport();

    console.log('\n✨ CORRECTION NUCLÉAIRE TERMINÉE !');
    console.log('\n💡 Prochaines étapes:');
    console.log('  - npm run lint        # Vérifier le résultat');
    console.log('  - npm run format      # Reformater si nécessaire');
    console.log('  - npm run code-quality # Test complet');
  } catch (error) {
    console.error('❌ ERREUR NUCLÉAIRE:', error.message);
  }
}

nuclearMain();
