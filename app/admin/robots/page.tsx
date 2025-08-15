/**
 * Page Admin Robots.txt
 * Permet de consulter, modifier et mettre à jour le fichier robots.txt
 */

'use client'

import { useState, useEffect } from 'react'

interface RobotsData {
  content: string
  environment: string
  crawlingAllowed: boolean
  lastModified?: string
}

export default function RobotsAdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestion Robots.txt</h1>
      <p className="text-gray-600">Page de test pour la gestion du robots.txt</p>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">Cette page devrait s'afficher correctement.</p>
      </div>
    </div>
  )
}
