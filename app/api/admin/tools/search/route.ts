import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/database/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        toolName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        toolName: true,
      },
      take: 10,
    });
    return NextResponse.json({ success: true, tools });
  } catch (error) {
    console.error('Error searching tools:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
