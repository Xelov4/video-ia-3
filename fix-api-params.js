const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const files = [
  'app/api/sitemap/[lang]/route.ts',
  'app/api/blog/posts/[slug]/route.ts', 
  'app/api/tools/[id]/analyze/route.ts',
  'app/api/tools/[id]/route.ts',
  'app/api/tools/[id]/translations/auto-translate/route.ts',
  'app/api/tools/[id]/translations/route.ts',
  'app/api/tools/[id]/translations/[translationId]/route.ts',
  'app/api/admin/posts/[id]/publish/route.ts',
  'app/api/admin/posts/[id]/route.ts',
  'app/api/admin/posts/[id]/translations/route.ts',
  'app/api/admin/posts/[id]/translations/[translationId]/route.ts',
  'app/api/admin/tools/[id]/route.ts',
  'app/api/admin/tools/[id]/translations/route.ts'
];

console.log('🔧 Fixing Next.js 15 params compatibility...');

files.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Pattern pour les fonctions avec params
    const patterns = [
      // GET function
      {
        old: /export async function GET\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\s*\}\s*\)/g,
        new: 'export async function GET($1, { params }: { params: Promise<$2> })'
      },
      // POST function  
      {
        old: /export async function POST\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\s*\}\s*\)/g,
        new: 'export async function POST($1, { params }: { params: Promise<$2> })'
      },
      // PUT function
      {
        old: /export async function PUT\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\s*\}\s*\)/g,
        new: 'export async function PUT($1, { params }: { params: Promise<$2> })'
      },
      // DELETE function
      {
        old: /export async function DELETE\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\s*\}\s*\)/g,
        new: 'export async function DELETE($1, { params }: { params: Promise<$2> })'
      },
      // PATCH function
      {
        old: /export async function PATCH\(\s*([^,]+),\s*\{\s*params\s*\}:\s*\{\s*params:\s*([^}]+)\s*\}\s*\)/g,
        new: 'export async function PATCH($1, { params }: { params: Promise<$2> })'
      }
    ];
    
    let modified = false;
    
    patterns.forEach(pattern => {
      if (pattern.old.test(content)) {
        content = content.replace(pattern.old, pattern.new);
        modified = true;
      }
    });
    
    // Ajouter await params au début de chaque fonction si nécessaire
    if (modified) {
      // Patterns pour injecter await params
      const awaitPatterns = [
        /(\) \{\s*)(try \{)/g,
        /(\) \{\s*)([^t])/g  // cas où il n'y a pas de try catch
      ];
      
      awaitPatterns.forEach(pattern => {
        content = content.replace(pattern, (match, start, after) => {
          if (after === 'try {') {
            return `${start}const resolvedParams = await params;\n  try {`;
          } else {
            return `${start}const resolvedParams = await params;\n  ${after}`;
          }
        });
      });
      
      // Remplacer params.xxx par resolvedParams.xxx
      content = content.replace(/params\.([a-zA-Z_][a-zA-Z0-9_]*)/g, 'resolvedParams.$1');
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`➡️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('🎉 API params fix completed!');