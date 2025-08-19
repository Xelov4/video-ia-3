/**
 * Posts Service - Prisma Implementation
 *
 * Service de gestion des articles/posts du blog utilisant Prisma ORM.
 * Fournit toutes les opérations CRUD et de recherche pour les posts.
 *
 * @author Video-IA.net Development Team
 */

import { prisma } from '../client';
import { Post, PostTranslation, Prisma, PostStatus, PostType } from '@prisma/client';

export interface PostsSearchParams {
  query?: string;
  category?: string;
  status?: PostStatus;
  postType?: PostType;
  featured?: boolean;
  authorId?: number;
  language?: string; // Support multilingue
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPostsResponse {
  posts: PostWithDetails[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PostWithDetails extends Post {
  author: {
    id: number;
    name: string;
    email: string;
  };
  translations: PostTranslation[];
  postCategories: {
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  postTags: {
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  _count: {
    comments: number;
  };
}

export interface PostData {
  slug: string;
  authorId: number;
  status?: PostStatus;
  postType?: PostType;
  featuredImageUrl?: string;
  publishedAt?: Date;
  isFeatured?: boolean;
  allowComments?: boolean;
  readingTimeMinutes?: number;
  // Relations
  categoryIds?: number[];
  tagIds?: number[];
}

export interface PostTranslationData {
  languageCode: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  translationSource?: string;
  humanReviewed?: boolean;
}

export class PostsService {
  /**
   * Rechercher des posts avec filtres et pagination
   */
  static async searchPosts(
    params: PostsSearchParams = {}
  ): Promise<PaginatedPostsResponse> {
    const {
      query,
      category,
      status,
      postType,
      featured,
      authorId,
      language = 'fr',
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = params;

    // Construction des conditions WHERE
    const where: Prisma.PostWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (postType) {
      where.postType = postType;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (category) {
      where.postCategories = {
        some: {
          category: {
            OR: [
              { name: { contains: category, mode: 'insensitive' } },
              { slug: category },
            ],
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { slug: { contains: query, mode: 'insensitive' } },
        { translations: { some: { title: { contains: query, mode: 'insensitive' } } } },
        {
          translations: { some: { content: { contains: query, mode: 'insensitive' } } },
        },
        {
          translations: { some: { excerpt: { contains: query, mode: 'insensitive' } } },
        },
      ];
    }

    // Construction de l'ordre
    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    if (sortBy === 'createdAt' || sortBy === 'created_at')
      orderBy.createdAt = sortOrder;
    else if (sortBy === 'updatedAt' || sortBy === 'updated_at')
      orderBy.updatedAt = sortOrder;
    else if (sortBy === 'publishedAt' || sortBy === 'published_at')
      orderBy.publishedAt = sortOrder;
    else if (sortBy === 'viewCount' || sortBy === 'view_count')
      orderBy.viewCount = sortOrder;
    else orderBy.updatedAt = sortOrder;

    const skip = (page - 1) * limit;

    // Relations à inclure - filtrer les traductions par langue pour l'affichage
    const include = {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      translations: {
        where: {
          languageCode: language,
        },
      },
      postCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      postTags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    };

    // Exécution des requêtes en parallèle
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      posts: posts as PostWithDetails[],
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Obtenir un post par ID avec toutes ses relations (toutes les traductions)
   */
  static async getPostById(id: number): Promise<PostWithDetails | null> {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: {
          orderBy: {
            languageCode: 'asc',
          },
        },
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }) as Promise<PostWithDetails | null>;
  }

  /**
   * Obtenir un post par slug
   */
  static async getPostBySlug(slug: string): Promise<PostWithDetails | null> {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: true,
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }) as Promise<PostWithDetails | null>;
  }

  /**
   * Créer un nouveau post
   */
  static async createPost(data: PostData): Promise<Post> {
    const { categoryIds, tagIds, ...postData } = data;

    const post = await prisma.post.create({
      data: {
        ...postData,
        // Gérer les relations many-to-many
        ...(categoryIds && {
          postCategories: {
            create: categoryIds.map(categoryId => ({ categoryId })),
          },
        }),
        ...(tagIds && {
          postTags: {
            create: tagIds.map(tagId => ({ tagId })),
          },
        }),
      },
    });

    return post;
  }

  /**
   * Mettre à jour un post
   */
  static async updatePost(id: number, data: Partial<PostData>): Promise<Post> {
    const { categoryIds, tagIds, ...postData } = data;

    // Si les catégories ou tags sont fournis, on les met à jour
    if (categoryIds !== undefined || tagIds !== undefined) {
      return prisma.$transaction(async tx => {
        // Supprimer les relations existantes si de nouvelles sont fournies
        if (categoryIds !== undefined) {
          await tx.postCategoryLink.deleteMany({
            where: { postId: id },
          });
          if (categoryIds.length > 0) {
            await tx.postCategoryLink.createMany({
              data: categoryIds.map(categoryId => ({ postId: id, categoryId })),
            });
          }
        }

        if (tagIds !== undefined) {
          await tx.postTagLink.deleteMany({
            where: { postId: id },
          });
          if (tagIds.length > 0) {
            await tx.postTagLink.createMany({
              data: tagIds.map(tagId => ({ postId: id, tagId })),
            });
          }
        }

        // Mettre à jour le post
        return tx.post.update({
          where: { id },
          data: {
            ...postData,
            updatedAt: new Date(),
          },
        });
      });
    }

    return prisma.post.update({
      where: { id },
      data: {
        ...postData,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Supprimer un post
   */
  static async deletePost(id: number): Promise<Post> {
    return prisma.post.delete({
      where: { id },
    });
  }

  /**
   * Publier un post
   */
  static async publishPost(id: number): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Mettre en brouillon un post
   */
  static async unpublishPost(id: number): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data: {
        status: 'DRAFT',
        publishedAt: null,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Incrémenter le compteur de vues
   */
  static async incrementViewCount(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Obtenir les posts en vedette
   */
  static async getFeaturedPosts(limit: number = 5): Promise<PostWithDetails[]> {
    return prisma.post.findMany({
      where: {
        isFeatured: true,
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: true,
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }) as Promise<PostWithDetails[]>;
  }

  /**
   * Obtenir les posts récents
   */
  static async getRecentPosts(limit: number = 10): Promise<PostWithDetails[]> {
    return prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: true,
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }) as Promise<PostWithDetails[]>;
  }

  /**
   * Obtenir les posts d'un auteur
   */
  static async getPostsByAuthor(
    authorId: number,
    limit: number = 10
  ): Promise<PostWithDetails[]> {
    return prisma.post.findMany({
      where: {
        authorId,
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: true,
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }) as Promise<PostWithDetails[]>;
  }

  /**
   * Obtenir les statistiques des posts
   */
  static async getPostsStats() {
    const [totalPosts, publishedPosts, draftPosts, featuredPosts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { isFeatured: true } }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
    };
  }
}

/**
 * Service pour les traductions de posts
 */
export class PostTranslationsService {
  /**
   * Obtenir toutes les traductions d'un post
   */
  static async getPostTranslations(postId: number): Promise<PostTranslation[]> {
    return prisma.postTranslation.findMany({
      where: { postId },
      include: {
        language: true,
      },
      orderBy: {
        languageCode: 'asc',
      },
    });
  }

  /**
   * Obtenir une traduction spécifique
   */
  static async getPostTranslation(
    postId: number,
    languageCode: string
  ): Promise<PostTranslation | null> {
    return prisma.postTranslation.findUnique({
      where: {
        postId_languageCode: {
          postId,
          languageCode,
        },
      },
      include: {
        language: true,
      },
    });
  }

  /**
   * Créer ou mettre à jour une traduction
   */
  static async upsertPostTranslation(
    postId: number,
    data: PostTranslationData
  ): Promise<PostTranslation> {
    return prisma.postTranslation.upsert({
      where: {
        postId_languageCode: {
          postId,
          languageCode: data.languageCode,
        },
      },
      create: {
        postId,
        ...data,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Supprimer une traduction
   */
  static async deletePostTranslation(
    postId: number,
    languageCode: string
  ): Promise<PostTranslation> {
    return prisma.postTranslation.delete({
      where: {
        postId_languageCode: {
          postId,
          languageCode,
        },
      },
    });
  }
}
