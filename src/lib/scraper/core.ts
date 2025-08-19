/**
 * Core scraping functionality
 * Handles website scraping, screenshot capture, and logo extraction
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { ScrapingResult, SocialLinks, ContactInfo } from '@/src/types/scraper';

/**
 * Main scraping function
 */
export async function scrapeWebsite(url: string): Promise<ScrapingResult> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForSelector('body', { timeout: 3000 }).catch(() => {});
    await page.setViewport({ width: 1920, height: 1080 });

    const screenshot = await page.screenshot({
      fullPage: false,
      type: 'webp',
      quality: 85,
      optimizeForSpeed: true,
    });

    const screenshotUrl = await saveScreenshot(Buffer.from(screenshot), url);
    const logoUrl = await extractLogo(page, url);

    const content = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script, style, nav, footer, header');
      scripts.forEach(el => el.remove());

      const mainContent =
        document.querySelector('main') ||
        document.querySelector('#main') ||
        document.querySelector('.main') ||
        document.body;

      return {
        title: document.title,
        content: mainContent.innerText,
        html: mainContent.innerHTML,
      };
    });

    const metadata = await extractMetadata(page);
    const socialLinks = await extractSocialLinks(page);
    const contactInfo = await extractContactInfo(page);
    const pricing = await extractPricing(page);
    const features = await extractFeatures(page);

    await browser.close();

    return {
      url,
      title: content.title,
      description: metadata.description || metadata.ogDescription || content.title,
      content: content.content,
      metadata,
      socialLinks,
      contactInfo,
      pricing: pricing.slice(0, 10),
      features: features.slice(0, 20),
      screenshotUrl,
      logoUrl,
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape website: ${error}`);
  }
}

async function extractMetadata(page: any) {
  return await page.evaluate(() => {
    const metaDescription =
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords =
      document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const ogTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      '';
    const ogDescription =
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') || '';

    return {
      description: metaDescription,
      keywords: metaKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k),
      ogTitle,
      ogDescription,
    };
  });
}

async function extractSocialLinks(page: any): Promise<SocialLinks> {
  return await page.evaluate(() => {
    const links = document.querySelectorAll('a[href]');
    const social: any = {};

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      if (href.includes('linkedin.com')) social.linkedin = href;
      if (href.includes('twitter.com') || href.includes('x.com')) social.twitter = href;
      if (href.includes('facebook.com') || href.includes('fb.com'))
        social.facebook = href;
      if (href.includes('instagram.com')) social.instagram = href;
      if (href.includes('github.com')) social.github = href;
      if (href.includes('youtube.com') || href.includes('youtu.be'))
        social.youtube = href;
      if (href.includes('tiktok.com')) social.tiktok = href;
      if (href.includes('discord.gg') || href.includes('discord.com'))
        social.discord = href;
      if (href.includes('t.me')) social.telegram = href;
      if (href.includes('reddit.com')) social.reddit = href;
    });

    return social;
  });
}

async function extractContactInfo(page: any): Promise<ContactInfo> {
  return await page.evaluate(() => {
    const contact: any = {};

    const contactLinks = document.querySelectorAll(
      'a[href*="contact"], a[href*="support"], a[href*="help"]'
    );
    contactLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href?.includes('contact')) contact.contactFormUrl = href;
      if (href?.includes('support') || href?.includes('help'))
        contact.supportUrl = href;
    });

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = document.body.innerText.match(emailRegex);
    if (emails && emails.length > 0) {
      contact.email = emails[0];
    }

    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = document.body.innerText.match(phoneRegex);
    if (phones && phones.length > 0) {
      contact.phone = phones[0];
    }

    return contact;
  });
}

async function extractPricing(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    const pricingElements = document.querySelectorAll('*');
    const pricing: string[] = [];

    pricingElements.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (
        text.length < 100 &&
        (text.includes('$') || text.toLowerCase().includes('pricing'))
      ) {
        pricing.push(text);
      }
    });

    return pricing;
  });
}

async function extractFeatures(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    const features: string[] = [];

    const elements = document.querySelectorAll('li, p, div');
    elements.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (
        text.length > 10 &&
        text.length < 200 &&
        (text.includes('feature') ||
          text.includes('function') ||
          text.includes('capability'))
      ) {
        features.push(text);
      }
    });

    return features;
  });
}

async function saveScreenshot(screenshot: Buffer, url: string): Promise<string> {
  try {
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const filename = `screenshot_${urlSlug}_${timestamp}.webp`;
    const filepath = path.join(screenshotsDir, filename);

    fs.writeFileSync(filepath, screenshot);
    return `/screenshots/${filename}`;
  } catch (error) {
    console.error('Screenshot save error:', error);
    return '';
  }
}

async function extractLogo(page: any, url: string): Promise<string> {
  try {
    const logoSelectors = [
      'img[src*="logo"]',
      'img[alt*="logo" i]',
      'img[alt*="brand" i]',
      '.logo img',
      '.brand img',
      '.header img',
      '.navbar img',
      'header img',
      'nav img',
      'img[src*="brand"]',
      'link[rel="icon"][sizes="32x32"]',
      'link[rel="icon"][sizes="16x16"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="icon"]',
    ];

    let logoUrl = '';

    for (const selector of logoSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const src = await element.getAttribute('src');
          if (src) {
            logoUrl = src;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!logoUrl) {
      logoUrl = await page.evaluate(() => {
        const ogImage = document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content');
        if (ogImage) return ogImage;

        const twitterImage = document
          .querySelector('meta[name="twitter:image"]')
          ?.getAttribute('content');
        if (twitterImage) return twitterImage;

        const favicon = document
          .querySelector('link[rel="icon"]')
          ?.getAttribute('href');
        if (favicon) return favicon;

        return '';
      });
    }

    if (logoUrl) {
      if (logoUrl.startsWith('/')) {
        const baseUrl = new URL(url);
        logoUrl = `${baseUrl.protocol}//${baseUrl.host}${logoUrl}`;
      } else if (logoUrl.startsWith('./')) {
        const baseUrl = new URL(url);
        logoUrl = `${baseUrl.protocol}//${baseUrl.host}${logoUrl.substring(1)}`;
      } else if (!logoUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        logoUrl = `${baseUrl.protocol}//${baseUrl.host}/${logoUrl}`;
      }

      const response = await fetch(logoUrl);
      if (response.ok) {
        const logoBuffer = Buffer.from(await response.arrayBuffer());

        const logosDir = path.join(process.cwd(), 'public', 'logos');
        if (!fs.existsSync(logosDir)) {
          fs.mkdirSync(logosDir, { recursive: true });
        }

        const timestamp = Date.now();
        const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const filename = `logo_${urlSlug}_${timestamp}.webp`;
        const filepath = path.join(logosDir, filename);

        fs.writeFileSync(filepath, logoBuffer);
        return `/logos/${filename}`;
      }
    }

    return '';
  } catch (error) {
    console.error('Logo extraction error:', error);
    return '';
  }
}
