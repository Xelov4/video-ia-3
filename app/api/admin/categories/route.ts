/**
 * Admin Categories API
 * CRUD operations for categories management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth/auth-options'

const mockCategories = [
  { id: 1, name: 'G�n�ration d\'images', slug: 'ai-image', description: 'Outils de cr�ation d\'images IA', emoji: '<�', toolCount: 45, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-15' },
  { id: 2, name: 'G�n�ration de texte', slug: 'ai-text', description: 'Outils de r�daction automatique', emoji: '', toolCount: 38, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-10' },
  { id: 3, name: 'G�n�ration de vid�os', slug: 'ai-video', description: 'Cr�ation de vid�os avec IA', emoji: '<�', toolCount: 23, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-12' },
  { id: 4, name: 'Synth�se vocale', slug: 'ai-voice', description: 'G�n�ration de voix artificielle', emoji: '<�', toolCount: 19, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-08' },
  { id: 5, name: 'Analyse de donn�es', slug: 'ai-analysis', description: 'Outils d\'analyse intelligente', emoji: '=�', toolCount: 31, isActive: true, parentId: null, createdAt: '2024-01-01', updatedAt: '2024-01-14' }
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