/**
 * Admin Categories API
 * CRUD operations for categories management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth/auth-options'

const mockCategories = [
  { id: 1, name: 'Génération d\'images', slug: 'ai-image', description: 'Outils de création d\'images IA', emoji: '<¨', toolCount: 45, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
  { id: 2, name: 'Génération de texte', slug: 'ai-text', description: 'Outils de rédaction automatique', emoji: '', toolCount: 38, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-10' },
  { id: 3, name: 'Génération de vidéos', slug: 'ai-video', description: 'Création de vidéos avec IA', emoji: '<¬', toolCount: 23, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-12' },
  { id: 4, name: 'Synthèse vocale', slug: 'ai-voice', description: 'Génération de voix artificielle', emoji: '<¤', toolCount: 19, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-08' },
  { id: 5, name: 'Analyse de données', slug: 'ai-analysis', description: 'Outils d\'analyse intelligente', emoji: '=Ê', toolCount: 31, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-14' }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      categories: mockCategories,
      totalCount: mockCategories.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const newCategory = {
      id: mockCategories.length + 1,
      ...body,
      toolCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockCategories.push(newCategory)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}