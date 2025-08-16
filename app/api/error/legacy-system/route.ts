import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    error: 'Legacy system deprecated',
    message: 'This API endpoint has been migrated to Prisma ORM',
    status: 'deprecated',
    timestamp: new Date().toISOString()
  }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({
    error: 'Legacy system deprecated',
    message: 'This API endpoint has been migrated to Prisma ORM',
    status: 'deprecated',
    timestamp: new Date().toISOString()
  }, { status: 410 })
}
