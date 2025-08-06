#!/usr/bin/env node

/**
 * Script to fix import paths for formatNumber
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function findFiles() {
  try {
    // Find all files that contain the import
    const result = execSync('grep -r "@/lib/utils/formatNumbers" src/ app/', { encoding: 'utf8' })
    return result.split('\n').filter(line => line.trim()).map(line => line.split(':')[0])
  } catch (error) {
    return []
  }
}

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Replace incorrect import path
    const updatedContent = content.replace(
      /@\/lib\/utils\/formatNumbers/g,
      '@/src/lib/utils/formatNumbers'
    )
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`🔧 Fixed import in: ${filePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
    return false
  }
}

console.log('🚀 Fixing import paths...\n')

const files = findFiles()
let fixedCount = 0

files.forEach(file => {
  if (fixImports(file)) {
    fixedCount++
  }
})

console.log(`\n✅ Fixed ${fixedCount} import paths`)

if (fixedCount > 0) {
  console.log('🎉 All import paths are now correct!')
}