#!/usr/bin/env node

// Script pour nettoyer la mémoire et optimiser le build
const fs = require('fs')
const path = require('path')

console.log('🧹 Nettoyage de la mémoire...')

// Nettoyer les caches
const cacheDirs = [
  'node_modules/.vite',
  'node_modules/.cache',
  'dist',
  '.vite'
]

cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🗑️  Suppression de ${dir}`)
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// Forcer le garbage collection si disponible
if (global.gc) {
  console.log('♻️  Garbage collection forcé')
  global.gc()
}

console.log('✅ Nettoyage terminé!')
