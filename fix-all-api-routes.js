const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Finding and fixing ALL API routes with params...');

// Find tous les fichiers route.ts dans les dossiers avec des paramètres dynamiques
const files = execSync('find app/api -name "route.ts" -path "*/\\[*\\]/*"', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files to check:`);
files.forEach(f => console.log(`  - ${f}`));

files.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Fix function signatures - plus précis
    const functionPatterns = [
      // Pattern pour { params }: { params: { ... } }
      {
        pattern: /(\{ params \}: \{ params: )(\{[^}]+\})( \})/g,
        replacement: '$1Promise<$2>$3'
      }
    ];
    
    functionPatterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Si on a modifié la signature, on doit ajouter await params
    if (content !== originalContent) {
      // Chercher les fonctions HTTP et ajouter await params
      const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      httpMethods.forEach(method => {
        // Pattern pour capturer la fonction complète
        const methodPattern = new RegExp(
          `(export async function ${method}\\([^)]+\\) \\{\\s*)(\\s*)`,
          'g'
        );
        
        content = content.replace(methodPattern, (match, start, whitespace) => {
          return `${start}${whitespace}const resolvedParams = await params;\n  `;
        });
      });
      
      // Remplacer tous les params.xxx par resolvedParams.xxx
      content = content.replace(/\bparams\.([a-zA-Z_][a-zA-Z0-9_]*)/g, 'resolvedParams.$1');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`➡️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('🎉 API routes fix completed!');