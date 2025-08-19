import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/src/lib/database/client';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { toolId, toolLink } = await request.json();

    if (!toolId || !toolLink) {
      return NextResponse.json({ error: 'toolId et toolLink requis' }, { status: 400 });
    }

    // Récupérer l'outil depuis la base de données
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 });
    }

    let httpStatusCode = 0;
    let screenshotUrl = null;
    let error = null;

    try {
      // Lancer Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();

      // Configuration de la page
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.setViewport({ width: 1920, height: 1080 });

      // Aller sur la page avec timeout
      await page.goto(toolLink, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Attendre 5 secondes comme demandé
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Récupérer le code de statut HTTP
      const response = await page.goto(toolLink, { waitUntil: 'networkidle2' });
      httpStatusCode = response?.status() || 0;

      // Prendre le screenshot
      const screenshot = await page.screenshot({
        fullPage: false,
        type: 'png',
        quality: 85,
      });

      // Sauvegarder le screenshot
      const screenshotsDir = path.join(process.cwd(), 'public', 'images', 'tools');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Nommer le fichier avec le nom de l'outil
      const safeToolName = tool.toolName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const timestamp = Date.now();
      const filename = `${safeToolName}_${timestamp}.png`;
      const filepath = path.join(screenshotsDir, filename);

      fs.writeFileSync(filepath, screenshot);
      screenshotUrl = `/images/tools/${filename}`;

      await browser.close();
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      error =
        puppeteerError instanceof Error ? puppeteerError.message : 'Erreur Puppeteer';

      // En cas d'erreur, essayer de récupérer le code de statut avec fetch
      try {
        const fetchResponse = await fetch(toolLink, {
          method: 'HEAD',
          timeout: 10000,
        });
        httpStatusCode = fetchResponse.status;
      } catch (fetchError) {
        httpStatusCode = 0;
        error = 'Erreur de connexion';
      }
    }

    // Déterminer si l'outil doit être actif
    const isActive = httpStatusCode >= 200 && httpStatusCode < 400;

    // Mettre à jour l'outil dans la base de données
    await prisma.tool.update({
      where: { id: toolId },
      data: {
        httpStatusCode,
        isActive,
        lastCheckedAt: new Date(),
        last_optimized_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        toolId,
        httpStatusCode,
        isActive,
        screenshotUrl,
        error,
      },
    });
  } catch (error) {
    console.error('Error in image-http check:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
