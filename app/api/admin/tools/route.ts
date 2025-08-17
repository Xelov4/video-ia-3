/**
 * Admin Tools API
 * CRUD operations for tools management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth/auth-options'

// Mock data for rapid development
const mockTools = Array.from({ length: 156 }, (_, i) => ({
  id: i + 1,
  toolName: `AI Tool ${i + 1}`,
  toolCategory: ['ai-image', 'ai-text', 'ai-video', 'ai-voice', 'ai-analysis'][i % 5],
  toolLink: `https://example.com/tool-${i + 1}`,
  imageUrl: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : null,
  overview: `Advanced AI tool for ${['image generation', 'text processing', 'video creation', 'voice synthesis', 'data analysis'][i % 5]}. Powerful features and easy to use interface.`,
  featured: i % 8 === 0,
  isActive: i % 15 !== 14,
  viewCount: Math.floor(Math.random() * 50000) + 1000,
  createdAt: new Date(Date.now() - Math.random() * 100000000000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  metaTitle: `${`AI Tool ${i + 1}`} - Advanced AI Solution`,
  metaDescription: `Discover ${`AI Tool ${i + 1}`}, a powerful AI tool for modern workflows. Try it today!`
}))

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') === 'true'
    const active = searchParams.get('active') === 'true'
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const minViews = parseInt(searchParams.get('minViews') || '0')

    // Filter tools
    let filteredTools = mockTools.filter(tool => {
      if (search && !tool.toolName.toLowerCase().includes(search.toLowerCase()) && 
          !tool.toolCategory.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (category && tool.toolCategory !== category) return false
      if (featured && !tool.featured) return false
      if (active && !tool.isActive) return false
      if (minViews && tool.viewCount < minViews) return false
      return true
    })

    // Sort tools
    filteredTools.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'toolName':
          aValue = a.toolName.toLowerCase()
          bValue = b.toolName.toLowerCase()
          break
        case 'viewCount':
          aValue = a.viewCount
          bValue = b.viewCount
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })

    // Paginate
    const totalCount = filteredTools.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedTools = filteredTools.slice(startIndex, endIndex)

    return NextResponse.json({
      tools: paginatedTools,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize)
    })

  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { toolName, toolCategory, toolLink } = body
    if (!toolName || !toolCategory || !toolLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new tool
    const newTool = {
      id: mockTools.length + 1,
      toolName,
      toolCategory,
      toolLink,
      imageUrl: body.imageUrl || null,
      overview: body.overview || '',
      featured: body.featured || false,
      isActive: body.isActive !== undefined ? body.isActive : true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metaTitle: body.metaTitle || toolName,
      metaDescription: body.metaDescription || ''
    }

    mockTools.push(newTool)

    return NextResponse.json(newTool, { status: 201 })

  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const toolIndex = mockTools.findIndex(tool => tool.id === id)
    if (toolIndex === -1) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Update tool
    mockTools[toolIndex] = {
      ...mockTools[toolIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockTools[toolIndex])

  } catch (error) {
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    const toolIndex = mockTools.findIndex(tool => tool.id === id)
    if (toolIndex === -1) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Remove tool
    mockTools.splice(toolIndex, 1)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
