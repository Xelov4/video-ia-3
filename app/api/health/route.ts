import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/src/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test de base
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'video-ia.net',
      version: '1.0.0'
    };

    // Test connexion base de données
    try {
      const dbStatus = await checkDatabaseConnection();
      
      return NextResponse.json({
        ...healthStatus,
        database: {
          connected: dbStatus.connected,
          stats: dbStatus.stats
        }
      }, { status: 200 });
      
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      
      return NextResponse.json({
        ...healthStatus,
        status: 'degraded',
        database: {
          connected: false,
          error: 'Database connection failed'
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service health check failed'
    }, { status: 503 });
  }
}