import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const languagesData: Prisma.LanguageCreateInput[] = [
  { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flagEmoji: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flagEmoji: '🇳🇱' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagEmoji: '🇵🇹' },
];

const categoriesData = [
  {
    name: 'Video Generation',
    slug: 'video-generation',
    translations: {
      fr: {
        name: 'Génération de Vidéo',
        description: "Outils pour créer et éditer des vidéos avec l'IA.",
      },
      en: {
        name: 'Video Generation',
        description: 'Tools for creating and editing videos with AI.',
      },
    },
  },
  {
    name: 'AI Chatbot',
    slug: 'ai-chatbot',
    translations: {
      fr: {
        name: 'Chatbot IA',
        description: 'Assistants conversationnels intelligents.',
      },
      en: { name: 'AI Chatbot', description: 'Intelligent conversational assistants.' },
    },
  },
  {
    name: 'Image Generation',
    slug: 'image-generation',
    translations: {
      fr: {
        name: "Génération d'Image",
        description: 'Créez des images uniques à partir de texte.',
      },
      en: { name: 'Image Generation', description: 'Create unique images from text.' },
    },
  },
  {
    name: 'Voice Synthesis',
    slug: 'voice-synthesis',
    translations: {
      fr: {
        name: 'Synthèse Vocale',
        description: 'Générez des voix humaines réalistes.',
      },
      en: { name: 'Voice Synthesis', description: 'Generate realistic human voices.' },
    },
  },
];

const tagsData = [
  { name: 'Free', slug: 'free' },
  { name: 'Freemium', slug: 'freemium' },
  { name: 'API', slug: 'api' },
  { name: 'Productivity', slug: 'productivity' },
];

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Clean up database
  console.log('🧹 Cleaning up existing data...');
  await prisma.toolCategoryLink.deleteMany({});
  await prisma.toolTagLink.deleteMany({});
  await prisma.toolTranslation.deleteMany({});
  await prisma.categoryTranslation.deleteMany({});
  await prisma.tagTranslation.deleteMany({});
  await prisma.tool.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.language.deleteMany({});

  // 2. Seed Languages
  console.log('🌍 Seeding languages...');
  await prisma.language.createMany({
    data: languagesData,
    skipDuplicates: true,
  });

  // 3. Seed Categories with translations
  console.log('📂 Seeding categories...');
  const createdCategories: Record<string, { id: number }> = {};
  for (const cat of categoriesData) {
    const newCategory = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        translations: {
          create: [
            {
              languageCode: 'fr',
              name: cat.translations.fr.name,
              description: cat.translations.fr.description,
            },
            {
              languageCode: 'en',
              name: cat.translations.en.name,
              description: cat.translations.en.description,
            },
          ],
        },
      },
    });
    createdCategories[cat.slug] = { id: newCategory.id };
    console.log(`   Created category: ${cat.name}`);
  }

  // 4. Seed Tags
  console.log('🏷️ Seeding tags...');
  const createdTags: Record<string, { id: number }> = {};
  for (const tag of tagsData) {
    const newTag = await prisma.tag.create({ data: tag });
    createdTags[tag.slug] = { id: newTag.id };
    console.log(`   Created tag: ${tag.name}`);
  }

  // 5. Seed Tools
  console.log('🤖 Seeding tools...');

  // Tool 1
  await prisma.tool.create({
    data: {
      toolName: 'AI Video Wizard',
      slug: 'ai-video-wizard',
      toolLink: 'https://example.com/ai-video-wizard',
      imageUrl: '/images/placeholders/tool-1.jpg',
      overview:
        'An AI-powered video creation platform to generate stunning videos from text prompts.',
      toolDescription:
        'Full description of AI Video Wizard, detailing its features like multiple languages, styles, and high-resolution output.',
      isActive: true,
      featured: true,
      quality_score: 4.8,
      translations: {
        create: [
          {
            languageCode: 'fr',
            name: 'Magicien Vidéo IA',
            overview:
              'Une plateforme de création vidéo IA pour générer des vidéos époustouflantes à partir de textes.',
            description:
              'Description complète de Magicien Vidéo IA, détaillant ses fonctionnalités comme le support multilingue, les styles variés et la sortie haute résolution.',
          },
        ],
      },
      toolCategories: {
        create: {
          categoryId: createdCategories['video-generation'].id,
        },
      },
      toolTags: {
        create: [
          { tagId: createdTags['freemium'].id },
          { tagId: createdTags['productivity'].id },
        ],
      },
    },
  });
  console.log('   Created tool: AI Video Wizard');

  // Tool 2
  await prisma.tool.create({
    data: {
      toolName: 'Pixel Perfect',
      slug: 'pixel-perfect',
      toolLink: 'https://example.com/pixel-perfect',
      imageUrl: '/images/placeholders/tool-2.jpg',
      overview:
        'Generate high-quality, royalty-free images in seconds with our advanced AI model.',
      toolDescription:
        'Pixel Perfect is a state-of-the-art image generator. You can use it for social media, marketing materials, or personal projects.',
      isActive: true,
      featured: false,
      quality_score: 4.5,
      translations: {
        create: [
          {
            languageCode: 'fr',
            name: 'Pixel Parfait',
            overview:
              'Générez des images de haute qualité, libres de droits, en quelques secondes avec notre modèle IA avancé.',
            description:
              "Pixel Parfait est un générateur d'images de pointe. Vous pouvez l'utiliser pour les réseaux sociaux, le marketing ou vos projets personnels.",
          },
        ],
      },
      toolCategories: {
        create: {
          categoryId: createdCategories['image-generation'].id,
        },
      },
      toolTags: {
        create: [{ tagId: createdTags['free'].id }],
      },
    },
  });
  console.log('   Created tool: Pixel Perfect');

  // Tool 3
  await prisma.tool.create({
    data: {
      toolName: 'VoiceGen',
      slug: 'voice-gen',
      toolLink: 'https://example.com/voicegen',
      imageUrl: '/images/placeholders/tool-3.jpg',
      overview: 'Realistic Text-to-Speech (TTS) for your applications.',
      toolDescription:
        'VoiceGen provides an API to convert text into natural-sounding speech in over 30 languages and accents.',
      isActive: false,
      featured: true,
      quality_score: 4.9,
      translations: {
        create: [
          {
            languageCode: 'fr',
            name: 'Générateur de Voix',
            overview: 'Synthèse vocale (TTS) réaliste pour vos applications.',
            description:
              'VoiceGen fournit une API pour convertir du texte en parole naturelle dans plus de 30 langues et accents.',
          },
        ],
      },
      toolCategories: {
        create: {
          categoryId: createdCategories['voice-synthesis'].id,
        },
      },
      toolTags: {
        create: [{ tagId: createdTags['api'].id }],
      },
    },
  });
  console.log('   Created tool: VoiceGen');

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch(e => {
    console.error('❌ An error occurred while seeding the database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
