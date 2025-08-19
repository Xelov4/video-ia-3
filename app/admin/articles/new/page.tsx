/**
 * New Article Page - Création d'un nouvel article
 *
 * Page de création d'un nouvel article dans l'interface admin.
 * Basée sur la page d'édition des tools, adaptée pour les articles.
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  LanguageTabs,
  type Language,
  type TranslationStatus,
} from '@/src/components/admin/LanguageTabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Switch } from '@/src/components/ui/switch';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Toaster } from '@/src/components/ui/sonner';
import { toast } from 'sonner';
import { RichTextEditor } from '@/src/components/admin/RichTextEditor';

// Types
interface PostFormData {
  slug: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'TRASHED';
  postType: 'ARTICLE' | 'NEWS' | 'PAGE';
  featuredImageUrl?: string;
  isFeatured: boolean;
  allowComments: boolean;
  readingTimeMinutes?: number;
  categoryIds: number[];
  tagIds: number[];
}

interface PostTranslationFormData {
  languageCode: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  translationSource: string;
  humanReviewed: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Langues supportées
const LANGUAGES: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    enabled: true,
    isBase: true,
  },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', enabled: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', enabled: true },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    enabled: true,
  },
];

export default function NewArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [_categories, setCategories] = useState<Category[]>([]);
  const [_tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Données du post
  const [postData, setPostData] = useState<PostFormData>({
    slug: '',
    status: 'DRAFT',
    postType: 'ARTICLE',
    featuredImageUrl: '',
    isFeatured: false,
    allowComments: true,
    readingTimeMinutes: undefined,
    categoryIds: [],
    tagIds: [],
  });

  // Traductions
  const [translations, setTranslations] = useState<
    Record<string, PostTranslationFormData>
  >({});
  const [activeLanguage, setActiveLanguage] = useState<string>('fr');
  const [translationStatus, setTranslationStatus] = useState<
    Record<string, TranslationStatus>
  >({});

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const cats = Array.isArray(data?.data) ? data.data : [];
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        const tagsList = Array.isArray(data?.data) ? data.data : [];
        setTags(tagsList);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    if (session) {
      Promise.all([fetchCategories(), fetchTags()]).finally(() => setLoading(false));
    }
  }, [session]);

  // Générer un slug à partir du titre français
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Supprimer tirets multiples
      .trim();
  };

  const handleTranslationChange = useCallback(
    (translation: PostTranslationFormData) => {
      setTranslations(prev => ({ ...prev, [translation.languageCode]: translation }));

      // Générer automatiquement le slug si c'est le français et qu'il n'est pas encore défini
      if (translation.languageCode === 'fr' && translation.title && !postData.slug) {
        const newSlug = generateSlug(translation.title);
        setPostData(prev => ({ ...prev, slug: newSlug }));
      }
    },
    [postData.slug]
  );

  const updateTranslationStatus = useCallback(() => {
    const status: Record<string, TranslationStatus> = {};
    LANGUAGES.forEach(language => {
      const translation = translations[language.code];
      if (translation) {
        const fields = ['title', 'content', 'excerpt', 'metaTitle', 'metaDescription'];
        const filledFields = fields.filter(field => {
          const value = translation[field as keyof PostTranslationFormData];
          return (
            typeof value === 'string' &&
            value.trim().length > 0 &&
            value.trim() !== '<p><br></p>'
          );
        });
        const completionPercentage = Math.round(
          (filledFields.length / fields.length) * 100
        );
        status[language.code] = {
          isComplete: completionPercentage >= 60, // 60% pour être considéré comme complet
          completionPercentage,
          hasChanges: true,
          isHumanReviewed: translation.humanReviewed,
          qualityScore: translation.humanReviewed ? 9 : 7,
        };
      } else {
        status[language.code] = {
          isComplete: false,
          completionPercentage: 0,
          hasChanges: false,
          isHumanReviewed: false,
          qualityScore: 0,
        };
      }
    });
    setTranslationStatus(status);
  }, [translations]);

  useEffect(() => {
    updateTranslationStatus();
  }, [translations, updateTranslationStatus]);

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast.error('Session expirée, veuillez vous reconnecter');
      return;
    }

    // Validation
    if (!postData.slug) {
      toast.error('Le slug est requis');
      return;
    }

    const frTranslation = translations['fr'];
    if (!frTranslation?.title || !frTranslation?.content) {
      toast.error('Le titre et le contenu en français sont requis');
      return;
    }

    setSaving(true);
    try {
      // Créer le post
      const postPayload = {
        ...postData,
        authorId: parseInt(session.user.id as string),
      };

      const postResponse = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (!postResponse.ok) {
        const error = await postResponse.json();
        throw new Error(error.error || 'Erreur lors de la création du post');
      }

      const postResult = await postResponse.json();
      const newPost = postResult.data;

      // Créer les traductions
      const translationPromises = Object.values(translations).map(translation =>
        fetch(`/api/admin/posts/${newPost.id}/translations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(translation),
        })
      );

      const translationResults = await Promise.allSettled(translationPromises);
      const failedTranslations = translationResults.filter(
        r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok)
      ).length;

      if (failedTranslations > 0) {
        toast.warning(
          `Article créé, mais ${failedTranslations} traduction(s) ont échoué`
        );
      } else {
        toast.success('Article créé avec succès !');
      }

      // Rediriger vers la page d'édition
      router.push(`/admin/articles/${newPost.id}/edit`);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyFromBase = (targetLanguage: string) => {
    const baseTranslation = translations['fr'];
    if (!baseTranslation) {
      toast.error("Créez d'abord le contenu en français");
      return;
    }

    const newTranslation: PostTranslationFormData = {
      languageCode: targetLanguage,
      title: baseTranslation.title,
      content: baseTranslation.content,
      excerpt: baseTranslation.excerpt || '',
      metaTitle: baseTranslation.metaTitle || '',
      metaDescription: baseTranslation.metaDescription || '',
      translationSource: 'imported',
      humanReviewed: false,
    };

    handleTranslationChange(newTranslation);
    toast.info(`Contenu copié vers ${targetLanguage.toUpperCase()}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>Chargement...</div>
    );
  }

  if (!session) return null;

  return (
    <div className='min-h-screen bg-gray-50'>
      <Toaster richColors position='top-right' />
      <div className='mx-auto max-w-5xl p-4 sm:p-6 lg:p-8'>
        {/* Header */}
        <div className='mb-8 rounded-lg bg-white p-6 shadow-md'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <Link
                href='/admin/articles'
                className='mb-2 inline-flex items-center text-gray-600 hover:text-gray-900'
              >
                <ArrowLeftIcon className='mr-2 h-5 w-5' />
                Retour aux articles
              </Link>
              <h1 className='flex items-center text-3xl font-bold text-gray-900'>
                <DocumentTextIcon className='mr-3 h-8 w-8 text-blue-600' />
                Nouvel Article
              </h1>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <CloudArrowUpIcon className='mr-2 h-4 w-4' />
              {saving ? 'Création...' : "Créer l'article"}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <div className='space-y-8'>
          {/* Informations générales */}
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Configuration de base de l'article</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='general'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='general'>Général</TabsTrigger>
                  <TabsTrigger value='seo'>SEO</TabsTrigger>
                  <TabsTrigger value='settings'>Paramètres</TabsTrigger>
                </TabsList>

                <TabsContent value='general' className='pt-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div>
                      <label className='font-medium'>Slug URL *</label>
                      <Input
                        value={postData.slug}
                        onChange={e =>
                          setPostData(prev => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder='mon-super-article'
                        className='bg-slate-50'
                      />
                      <p className='mt-1 text-sm text-gray-500'>
                        URL finale: /blog/{postData.slug}
                      </p>
                    </div>
                    <div>
                      <label className='font-medium'>Type d'article</label>
                      <Select
                        value={postData.postType}
                        onValueChange={value =>
                          setPostData(prev => ({ ...prev, postType: value as 'ARTICLE' | 'PAGE' | 'TUTORIAL' | 'REVIEW' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='ARTICLE'>Article</SelectItem>
                          <SelectItem value='NEWS'>Actualité</SelectItem>
                          <SelectItem value='PAGE'>Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='font-medium'>Statut</label>
                      <Select
                        value={postData.status}
                        onValueChange={value =>
                          setPostData(prev => ({ ...prev, status: value as 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'TRASHED' }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='DRAFT'>Brouillon</SelectItem>
                          <SelectItem value='PENDING_REVIEW'>
                            En attente de révision
                          </SelectItem>
                          <SelectItem value='PUBLISHED'>Publié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='font-medium'>Temps de lecture (minutes)</label>
                      <Input
                        type='number'
                        value={postData.readingTimeMinutes || ''}
                        onChange={e =>
                          setPostData(prev => ({
                            ...prev,
                            readingTimeMinutes: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        placeholder='5'
                        className='bg-slate-50'
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='seo' className='pt-6'>
                  <div className='space-y-6'>
                    <div>
                      <label className='font-medium'>Image mise en avant</label>
                      <Input
                        value={postData.featuredImageUrl || ''}
                        onChange={e =>
                          setPostData(prev => ({
                            ...prev,
                            featuredImageUrl: e.target.value,
                          }))
                        }
                        placeholder='https://example.com/image.jpg'
                        className='bg-slate-50'
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='settings' className='pt-6'>
                  <div className='space-y-6'>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='featured'
                        checked={postData.isFeatured}
                        onCheckedChange={checked =>
                          setPostData(prev => ({ ...prev, isFeatured: checked }))
                        }
                      />
                      <label htmlFor='featured'>Article en vedette</label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='comments'
                        checked={postData.allowComments}
                        onCheckedChange={checked =>
                          setPostData(prev => ({ ...prev, allowComments: checked }))
                        }
                      />
                      <label htmlFor='comments'>Autoriser les commentaires</label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Traductions */}
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle>Contenu et Traductions</CardTitle>
              <CardDescription>
                Ajoutez le contenu de votre article dans différentes langues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageTabs
                languages={LANGUAGES}
                activeLanguage={activeLanguage}
                onLanguageChange={setActiveLanguage}
                translationStatus={translationStatus}
              />

              <div className='mt-6'>
                <PostTranslationForm
                  key={activeLanguage}
                  language={LANGUAGES.find(l => l.code === activeLanguage)!}
                  translation={translations[activeLanguage]}
                  onTranslationChange={handleTranslationChange}
                  onCopyFromBase={handleCopyFromBase}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Composant pour le formulaire de traduction
interface PostTranslationFormProps {
  language: Language;
  translation?: PostTranslationFormData;
  onTranslationChange: (translation: PostTranslationFormData) => void;
  onCopyFromBase: (languageCode: string) => void;
}

function PostTranslationForm({
  language,
  translation,
  onTranslationChange,
  onCopyFromBase,
}: PostTranslationFormProps) {
  const [formData, setFormData] = useState<PostTranslationFormData>(
    translation || {
      languageCode: language.code,
      title: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      translationSource: 'manual',
      humanReviewed: false,
    }
  );

  useEffect(() => {
    if (translation) {
      setFormData(translation);
    } else {
      setFormData({
        languageCode: language.code,
        title: '',
        content: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        translationSource: 'manual',
        humanReviewed: false,
      });
    }
  }, [translation, language.code]);

  const handleChange = (
    field: keyof PostTranslationFormData,
    value: string | boolean
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onTranslationChange(updated);
  };

  return (
    <div className='space-y-6'>
      {!language.isBase && !translation && (
        <div className='rounded-lg bg-gray-50 py-8 text-center'>
          <GlobeAltIcon className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <h3 className='mb-2 text-lg font-medium text-gray-900'>
            Traduction {language.nativeName} {language.flag}
          </h3>
          <p className='mb-4 text-gray-500'>Aucun contenu pour cette langue</p>
          <Button onClick={() => onCopyFromBase(language.code)} variant='outline'>
            Copier depuis le français
          </Button>
        </div>
      )}

      {(language.isBase || translation) && (
        <>
          <div>
            <label className='font-medium'>Titre *</label>
            <Input
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Titre de l'article"
              className='bg-slate-50'
            />
          </div>

          <div>
            <label className='font-medium'>Contenu *</label>
            <RichTextEditor
              content={formData.content}
              onChange={content => handleChange('content', content)}
              className='bg-slate-50'
            />
          </div>

          <div>
            <label className='font-medium'>Extrait</label>
            <Textarea
              value={formData.excerpt}
              onChange={e => handleChange('excerpt', e.target.value)}
              placeholder="Résumé de l'article..."
              rows={3}
              className='bg-slate-50'
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <label className='font-medium'>Meta Titre</label>
              <Input
                value={formData.metaTitle}
                onChange={e => handleChange('metaTitle', e.target.value)}
                placeholder='Titre SEO'
                className='bg-slate-50'
              />
            </div>
            <div>
              <label className='font-medium'>Meta Description</label>
              <Input
                value={formData.metaDescription}
                onChange={e => handleChange('metaDescription', e.target.value)}
                placeholder='Description SEO'
                className='bg-slate-50'
              />
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id={`human-${language.code}`}
              checked={formData.humanReviewed}
              onCheckedChange={checked => handleChange('humanReviewed', checked)}
            />
            <label htmlFor={`human-${language.code}`}>Révisé par un humain</label>
          </div>
        </>
      )}
    </div>
  );
}
