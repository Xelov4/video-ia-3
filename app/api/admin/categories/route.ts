import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/database/client'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.flatten() }, { status: 400 })
    }

    const { name, slug, description, metaTitle, metaDescription, displayOrder, isFeatured } = validation.data

    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    })

    if (existingCategory) {
      return NextResponse.json({ success: false, error: 'Category with this name or slug already exists' }, { status: 409 })
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        metaTitle,
        metaDescription,
        displayOrder,
        isFeatured,
      },
    })

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        _count: {
          select: { tools: true },
        },
      },
    })

    const categoriesWithToolCount = categories.map(category => ({
      ...category,
      toolCount: category._count.tools,
    }))

    return NextResponse.json({ success: true, categories: categoriesWithToolCount })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
} 
