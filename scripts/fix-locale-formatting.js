#!/usr/bin/env node

/**
 * Script to fix locale formatting inconsistencies
 * Replaces .toLocaleString() with formatNumber() for consistent formatting
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Files to process (from our grep search results)
const filesToFix = [
  'src/components/admin/ToolsTable.tsx',
  'src/components/home/FeaturedTools.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/tools/ToolCard.tsx',
  'src/components/tools/ToolsListing.tsx',
  'src/components/tools/ToolsGrid.tsx',
  'app/admin/page.tsx',
  'app/admin/tools/page.tsx',
  'app/tools/[slug]/page.tsx',
  'app/tools/page.tsx',
  'app/categories/page.tsx'
]

function addImportIfNeeded(content, filePath) {
  // Check if formatNumber import already exists
  if (content.includes('formatNumber')) {
    return content
  }

  // Check if there are existing imports from @/ or relative paths
  const importRegex = /import\s+.*from\s+['"][@./]/g
  const imports = content.match(importRegex)
  
  if (!imports) {
    // No imports found, add after 'use client' if it exists, otherwise at the top
    const useClientMatch = content.match(/'use client'\n/)
    if (useClientMatch) {
      const insertIndex = useClientMatch.index + useClientMatch[0].length
      return content.slice(0, insertIndex) + 
        "import { formatNumber } from '@/src/lib/utils/formatNumbers'\n" + 
        content.slice(insertIndex)
    } else {
      return "import { formatNumber } from '@/src/lib/utils/formatNumbers'\n" + content
    }
  }

  // Add import after the last existing import
  const lastImportIndex = content.lastIndexOf(imports[imports.length - 1])
  const lastImportEndIndex = content.indexOf('\n', lastImportIndex) + 1
  
  return content.slice(0, lastImportEndIndex) +
    "import { formatNumber } from '@/src/lib/utils/formatNumbers'\n" +
    content.slice(lastImportEndIndex)
}

function replaceToLocaleString(content) {
  // Replace various patterns of .toLocaleString()
  return content
    .replace(/(\w+)\.toLocaleString\(\)/g, 'formatNumber($1)')
    .replace(/\(([^)]+)\)\.toLocaleString\(\)/g, 'formatNumber($1)')
}

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return false
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Check if file needs processing
    if (!content.includes('toLocaleString')) {
      console.log(`✅ ${filePath} - No changes needed`)
      return false
    }

    // Add import if needed
    content = addImportIfNeeded(content, filePath)
    
    // Replace toLocaleString calls
    content = replaceToLocaleString(content)
    
    // Write back to file
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`🔧 ${filePath} - Fixed locale formatting`)
    return true
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return false
  }
}

console.log('🚀 Fixing locale formatting inconsistencies...\n')

let totalFixed = 0
let totalErrors = 0

filesToFix.forEach(file => {
  try {
    const fixed = processFile(file)
    if (fixed) totalFixed++
  } catch (error) {
    console.error(`❌ ${file}:`, error.message)
    totalErrors++
  }
})

console.log(`\n✨ Summary:`)
console.log(`   Fixed: ${totalFixed} files`)
console.log(`   Errors: ${totalErrors} files`)

if (totalFixed > 0) {
  console.log(`\n🎉 Locale formatting fixed! All numbers will now display consistently.`)
} else if (totalErrors === 0) {
  console.log(`\n✅ All files already use consistent formatting.`)
}

process.exit(totalErrors > 0 ? 1 : 0)