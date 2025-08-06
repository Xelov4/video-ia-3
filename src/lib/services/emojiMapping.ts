/**
 * Category Emoji Mapping Service
 * Professional emoji mapping for categories with fallback system
 */

export interface CategoryEmoji {
  name: string
  emoji: string
  description?: string
}

/**
 * Comprehensive emoji mapping for AI tool categories
 * Using Unicode emojis for universal compatibility
 */
export const CATEGORY_EMOJI_MAP: Record<string, CategoryEmoji> = {
  // Primary AI Categories
  'AI Assistant': {
    name: 'AI Assistant',
    emoji: '🤖',
    description: 'AI-powered virtual assistants and chatbots'
  },
  'Content Creation': {
    name: 'Content Creation',
    emoji: '✨',
    description: 'Tools for creating digital content'
  },
  'Content creation': {
    name: 'Content creation',
    emoji: '✨',
    description: 'Tools for creating digital content'
  },
  'Image Generation': {
    name: 'Image Generation',
    emoji: '🎨',
    description: 'AI-powered image creation and generation'
  },
  'Image generation': {
    name: 'Image generation',
    emoji: '🎨',
    description: 'AI-powered image creation and generation'
  },
  'Data Analysis': {
    name: 'Data Analysis',
    emoji: '📊',
    description: 'Tools for analyzing and visualizing data'
  },
  'Data analysis': {
    name: 'Data analysis',
    emoji: '📊',
    description: 'Tools for analyzing and visualizing data'
  },
  'Automation': {
    name: 'Automation',
    emoji: '⚙️',
    description: 'Process automation and workflow tools'
  },
  'Chat': {
    name: 'Chat',
    emoji: '💬',
    description: 'Chat and messaging tools'
  },
  'Developer Tools': {
    name: 'Developer Tools',
    emoji: '👨‍💻',
    description: 'Programming and development tools'
  },
  'Developer tools': {
    name: 'Developer tools',
    emoji: '👨‍💻',
    description: 'Programming and development tools'
  },
  'Art Generation': {
    name: 'Art Generation',
    emoji: '🖼️',
    description: 'Artistic content generation tools'
  },
  'Image Editing': {
    name: 'Image Editing',
    emoji: '🖌️',
    description: 'Photo and image editing tools'
  },
  'Image editing': {
    name: 'Image editing',
    emoji: '🖌️',
    description: 'Photo and image editing tools'
  },
  'Chatbot Builder': {
    name: 'Chatbot Builder',
    emoji: '🤖',
    description: 'Tools for building chatbots'
  },
  'Chatbot builder': {
    name: 'Chatbot builder',
    emoji: '🤖',
    description: 'Tools for building chatbots'
  },

  // Video & Audio
  'Video Generation': {
    name: 'Video Generation',
    emoji: '🎬',
    description: 'AI video creation and editing'
  },
  'Video generation': {
    name: 'Video generation',
    emoji: '🎬',
    description: 'AI video creation and editing'
  },
  'Video Editing': {
    name: 'Video Editing',
    emoji: '📹',
    description: 'Video editing and post-production'
  },
  'Video editing': {
    name: 'Video editing',
    emoji: '📹',
    description: 'Video editing and post-production'
  },
  'Audio Generation': {
    name: 'Audio Generation',
    emoji: '🎵',
    description: 'AI audio and music generation'
  },
  'Audio generation': {
    name: 'Audio generation',
    emoji: '🎵',
    description: 'AI audio and music generation'
  },
  'Music Generation': {
    name: 'Music Generation',
    emoji: '🎼',
    description: 'AI music composition tools'
  },
  'Voice': {
    name: 'Voice',
    emoji: '🎤',
    description: 'Voice synthesis and processing'
  },
  
  // Text & Language
  'Writing': {
    name: 'Writing',
    emoji: '📝',
    description: 'Writing assistance and tools'
  },
  'Copywriting': {
    name: 'Copywriting',
    emoji: '✍️',
    description: 'Marketing and sales copy generation'
  },
  'Translation': {
    name: 'Translation',
    emoji: '🌐',
    description: 'Language translation tools'
  },
  'Text to Speech': {
    name: 'Text to Speech',
    emoji: '🗣️',
    description: 'Convert text to spoken audio'
  },
  'Speech to Text': {
    name: 'Speech to Text',
    emoji: '📢',
    description: 'Convert speech to written text'
  },

  // Business & Marketing
  'Marketing': {
    name: 'Marketing',
    emoji: '📈',
    description: 'Marketing and promotion tools'
  },
  'Sales': {
    name: 'Sales',
    emoji: '💰',
    description: 'Sales optimization tools'
  },
  'E-commerce': {
    name: 'E-commerce',
    emoji: '🛒',
    description: 'Online store and shopping tools'
  },
  'Analytics': {
    name: 'Analytics',
    emoji: '📊',
    description: 'Business analytics and insights'
  },
  'SEO': {
    name: 'SEO',
    emoji: '🔍',
    description: 'Search engine optimization tools'
  },
  'Social Media': {
    name: 'Social Media',
    emoji: '📱',
    description: 'Social media management tools'
  },

  // Design & Creative
  'Design': {
    name: 'Design',
    emoji: '🎨',
    description: 'Graphic design and visual tools'
  },
  '3D Generation': {
    name: '3D Generation',
    emoji: '🧊',
    description: '3D modeling and generation'
  },
  'Logo Generation': {
    name: 'Logo Generation',
    emoji: '🏷️',
    description: 'Logo design and branding tools'
  },
  'Avatar Generation': {
    name: 'Avatar Generation',
    emoji: '👤',
    description: 'Profile picture and avatar creation'
  },

  // Productivity & Tools
  'Productivity': {
    name: 'Productivity',
    emoji: '⚡',
    description: 'Productivity enhancement tools'
  },
  'Email': {
    name: 'Email',
    emoji: '📧',
    description: 'Email management and automation'
  },
  'Spreadsheets': {
    name: 'Spreadsheets',
    emoji: '📋',
    description: 'Spreadsheet tools and automation'
  },
  'Project Management': {
    name: 'Project Management',
    emoji: '📅',
    description: 'Project planning and management'
  },
  'Organization': {
    name: 'Organization',
    emoji: '📁',
    description: 'Organization and file management'
  },

  // Education & Learning
  'Education': {
    name: 'Education',
    emoji: '🎓',
    description: 'Learning and educational tools'
  },
  'Research': {
    name: 'Research',
    emoji: '🔬',
    description: 'Research and analysis tools'
  },
  'Summarization': {
    name: 'Summarization',
    emoji: '📄',
    description: 'Text and content summarization'
  },

  // Healthcare & Fitness
  'Healthcare': {
    name: 'Healthcare',
    emoji: '🏥',
    description: 'Health and medical tools'
  },
  'Fitness': {
    name: 'Fitness',
    emoji: '💪',
    description: 'Fitness and wellness tools'
  },

  // Gaming & Entertainment
  'Gaming': {
    name: 'Gaming',
    emoji: '🎮',
    description: 'Game development and gaming tools'
  },
  'Entertainment': {
    name: 'Entertainment',
    emoji: '🎭',
    description: 'Entertainment and media tools'
  },

  // Finance & Legal
  'Finance': {
    name: 'Finance',
    emoji: '💳',
    description: 'Financial tools and services'
  },
  'Legal': {
    name: 'Legal',
    emoji: '⚖️',
    description: 'Legal assistance and tools'
  },

  // Miscellaneous
  'Other': {
    name: 'Other',
    emoji: '🔧',
    description: 'Miscellaneous tools'
  },
  'General': {
    name: 'General',
    emoji: '📦',
    description: 'General purpose tools'
  }
}

/**
 * Get emoji for a category name with fuzzy matching
 * @param categoryName - Name of the category
 * @returns CategoryEmoji object or default
 */
export function getCategoryEmoji(categoryName: string): CategoryEmoji {
  // Direct match
  if (CATEGORY_EMOJI_MAP[categoryName]) {
    return CATEGORY_EMOJI_MAP[categoryName]
  }

  // Case-insensitive match
  const lowerCaseName = categoryName.toLowerCase()
  for (const [key, value] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (key.toLowerCase() === lowerCaseName) {
      return value
    }
  }

  // Fuzzy matching for common variations
  const fuzzyMatches: Record<string, string> = {
    'ai': '🤖',
    'assistant': '🤖',
    'chat': '💬',
    'image': '🎨',
    'video': '🎬',
    'audio': '🎵',
    'text': '📝',
    'data': '📊',
    'analysis': '📊',
    'design': '🎨',
    'marketing': '📈',
    'business': '💼',
    'productivity': '⚡',
    'development': '👨‍💻',
    'code': '👨‍💻',
    'automation': '⚙️',
    'email': '📧',
    'social': '📱',
    'finance': '💳',
    'education': '🎓',
    'health': '🏥',
    'gaming': '🎮',
    'translation': '🌐',
    'voice': '🎤',
    'music': '🎼',
    'writing': '📝'
  }

  // Check if category name contains any fuzzy match keywords
  for (const [keyword, emoji] of Object.entries(fuzzyMatches)) {
    if (lowerCaseName.includes(keyword)) {
      return {
        name: categoryName,
        emoji,
        description: `Tools related to ${categoryName}`
      }
    }
  }

  // Default fallback
  return {
    name: categoryName,
    emoji: '🔧',
    description: `Tools in ${categoryName} category`
  }
}

/**
 * Get all category emojis as a sorted array
 */
export function getAllCategoryEmojis(): CategoryEmoji[] {
  return Object.values(CATEGORY_EMOJI_MAP).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get emoji string only
 */
export function getCategoryEmojiString(categoryName: string): string {
  return getCategoryEmoji(categoryName).emoji
}

/**
 * Update categories service to include emoji data
 */
export function enrichCategoryWithEmoji<T extends { name: string }>(category: T): T & { emoji: string } {
  return {
    ...category,
    emoji: getCategoryEmojiString(category.name)
  }
}