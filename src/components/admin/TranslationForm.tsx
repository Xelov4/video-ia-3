/**
 * Translation Form Component for Multilingual Tool Editing
 * Handles form fields for each language with smart features
 */

'use client';

import { useState, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Language } from './LanguageTabs';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { RichTextEditor } from './RichTextEditor';

export interface ToolTranslation {
  id?: number;
  toolId: number;
  languageCode: string;
  name: string;
  overview: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  translationSource: 'auto' | 'human' | 'imported' | 'ai';
  quality_score: number;
  humanReviewed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseToolData {
  id: number;
  toolName: string;
  toolCategory: string;
  toolLink: string;
  overview: string;
  toolDescription: string;
  targetAudience: string;
  keyFeatures: string;
  useCases: string;
  tags: string;
  imageUrl: string;
  slug: string;
  isActive: boolean;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string;
}

interface TranslationFormProps {
  language: Language;
  translation: ToolTranslation | null;
  baseData?: BaseToolData | null;
  onTranslationChange: (translation: ToolTranslation) => void;
  onAutoTranslate?: (targetLanguage: string) => Promise<void>;
  onCopyFromBase?: (targetLanguage: string) => void;
  loading?: boolean;
  className?: string;
}

export function TranslationForm({
  language,
  translation,
  baseData,
  onTranslationChange,
  onAutoTranslate,
  onCopyFromBase,
  loading = false,
  className = '',
}: TranslationFormProps) {
  const [localTranslation, setLocalTranslation] = useState<ToolTranslation | null>(
    translation
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoTranslating, setAutoTranslating] = useState(false);

  // Update local state when translation prop changes
  useEffect(() => {
    setLocalTranslation(translation);
    setHasChanges(false);
  }, [translation]);

  // Create default translation if none exists
  useEffect(() => {
    if (!localTranslation && baseData && language.code !== 'en') {
      const defaultTranslation: ToolTranslation = {
        toolId: baseData.id,
        languageCode: language.code,
        name: baseData.toolName,
        overview: baseData.overview || '',
        description: baseData.toolDescription || '',
        metaTitle: baseData.metaTitle || '',
        metaDescription: baseData.metaDescription || '',
        translationSource: 'auto',
        humanReviewed: false,
      };
      setLocalTranslation(defaultTranslation);
    }
  }, [localTranslation, baseData, language.code]);

  // Handle field changes
  const handleFieldChange = (
    field: keyof ToolTranslation,
    value: string | number | boolean
  ) => {
    if (!localTranslation) return;

    const updatedTranslation = { ...localTranslation, [field]: value };

    // Mark as human-reviewed if user is editing content fields
    if (
      ['name', 'overview', 'description', 'metaTitle', 'metaDescription'].includes(
        field
      )
    ) {
      updatedTranslation.humanReviewed = true;
      updatedTranslation.translationSource = 'human';
    }

    setLocalTranslation(updatedTranslation);
    setHasChanges(true);
    onTranslationChange(updatedTranslation);

    // Basic validation
    validateField(field, value);
  };

  const validateField = (
    field: keyof ToolTranslation,
    value: string | number | boolean
  ) => {
    const errors = { ...validationErrors };

    if (field === 'name' && typeof value === 'string') {
      if (value.trim().length === 0) {
        errors.name = 'Le nom est requis';
      } else if (value.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères';
      } else {
        delete errors.name;
      }
    }

    if (field === 'metaTitle' && typeof value === 'string' && value.length > 60) {
      errors.metaTitle =
        'Le titre SEO devrait faire moins de 60 caractères pour un meilleur référencement';
    } else if (field === 'metaTitle') {
      delete errors.metaTitle;
    }

    if (
      field === 'metaDescription' &&
      typeof value === 'string' &&
      (value.length < 120 || value.length > 160)
    ) {
      errors.metaDescription =
        'La description SEO devrait faire entre 120 et 160 caractères';
    } else if (
      field === 'metaDescription' &&
      typeof value === 'string' &&
      value.length === 0
    ) {
      delete errors.metaDescription;
    }

    setValidationErrors(errors);
  };

  const handleAutoTranslate = async () => {
    if (!onAutoTranslate) return;

    setAutoTranslating(true);
    try {
      await onAutoTranslate(language.code);
    } catch (error) {
      console.error('Auto-translation failed:', error);
    } finally {
      setAutoTranslating(false);
    }
  };

  const handleCopyFromBase = () => {
    if (!onCopyFromBase) return;
    onCopyFromBase(language.code);
  };

  const getCompletionPercentage = () => {
    if (!localTranslation) return 0;

    const fields = ['name', 'overview', 'description', 'metaTitle', 'metaDescription'];
    const filledFields = fields.filter(field => {
      const value = localTranslation[field as keyof ToolTranslation];
      return typeof value === 'string' && value.trim().length > 0;
    });

    return Math.round((filledFields.length / fields.length) * 100);
  };

  const getStatusInfo = () => {
    if (!localTranslation)
      return { status: 'empty', color: 'gray', text: 'Non commencé' };

    if (localTranslation.humanReviewed && getCompletionPercentage() === 100) {
      return { status: 'complete', color: 'green', text: 'Vérifié par un humain' };
    }

    if (getCompletionPercentage() === 100) {
      return {
        status: 'auto-complete',
        color: 'blue',
        text: 'Traduction automatique complète',
      };
    }

    if (getCompletionPercentage() > 0) {
      return { status: 'in-progress', color: 'yellow', text: 'En cours' };
    }

    return { status: 'empty', color: 'gray', text: 'Non commencé' };
  };

  if (!localTranslation && language.isBase && baseData) {
    // For base language (English), show the base data
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Base Language Info */}
        <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4'>
          <div className='flex items-center'>
            <div className='mr-2 text-lg'>{language.flag}</div>
            <div>
              <h3 className='text-sm font-medium text-indigo-800'>
                Langue de base ({language.nativeName})
              </h3>
              <p className='text-xs text-indigo-600'>
                Les modifications de cette langue affecteront l'outil principal
              </p>
            </div>
          </div>
        </div>

        {/* Base Tool Form - Reference to main form */}
        <div className='py-8 text-center text-gray-500'>
          <GlobeAltIcon className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p>Les champs de la langue de base sont gérés dans les sections ci-dessus.</p>
          <p className='mt-1 text-sm'>
            Utilisez les onglets d'autres langues pour gérer les traductions.
          </p>
        </div>
      </div>
    );
  }

  if (!localTranslation) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='py-12 text-center'>
          <div className='mb-4 text-gray-400'>
            <DocumentDuplicateIcon className='mx-auto h-16 w-16' />
          </div>
          <h3 className='mb-2 text-lg font-medium text-gray-900'>
            Traduction non disponible
          </h3>
          <p className='text-gray-500'>Aucune traduction n'existe pour cette langue.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Translation Header */}
      <div className='rounded-lg border border-gray-200 bg-white p-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='text-2xl'>{language.flag}</div>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                {language.nativeName}
              </h3>
              <div className='mt-1 flex items-center space-x-3'>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                >
                  {statusInfo.status === 'complete' && (
                    <CheckIcon className='mr-1 h-3 w-3' />
                  )}
                  {statusInfo.status === 'in-progress' && (
                    <ClockIcon className='mr-1 h-3 w-3' />
                  )}
                  {statusInfo.text}
                </span>
                <span className='text-sm text-gray-500'>
                  {completionPercentage}% complété
                </span>
                {hasChanges && (
                  <span className='inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800'>
                    <ExclamationTriangleIcon className='mr-1 h-3 w-3' />
                    Modifications non sauvegardées
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Translation Actions */}
          <div className='flex items-center space-x-2'>
            {onCopyFromBase && language.code !== 'en' && (
              <button
                onClick={handleCopyFromBase}
                className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                type='button'
              >
                <DocumentDuplicateIcon className='mr-1.5 h-4 w-4' />
                Copier depuis EN
              </button>
            )}

            {onAutoTranslate && language.code !== 'en' && (
              <button
                onClick={handleAutoTranslate}
                disabled={autoTranslating}
                className='inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
                type='button'
              >
                <SparklesIcon className='mr-1.5 h-4 w-4' />
                {autoTranslating ? 'Traduction...' : 'Traduction IA'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mt-4'>
          <div className='mb-1 flex justify-between text-xs text-gray-600'>
            <span>Progression de la traduction</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                completionPercentage === 100
                  ? statusInfo.status === 'complete'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Translation Form Fields */}
      <div className='space-y-6'>
        {/* Name Field */}
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Nom de l'outil *
            </label>
            <Input
              type='text'
              value={localTranslation.name}
              onChange={e => handleFieldChange('name', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nom traduit de l'outil"
              disabled={loading}
            />
            {validationErrors.name && (
              <p className='mt-1 text-sm text-red-600'>{validationErrors.name}</p>
            )}
          </div>
        </div>

        {/* Overview Field */}
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Aperçu
            </label>
            <RichTextEditor
              content={localTranslation.overview}
              onChange={content => handleFieldChange('overview', content)}
            />
            <p className='mt-1 text-xs text-gray-500'>
              {localTranslation.overview.length} caractères
            </p>
          </div>
        </div>

        {/* Description Field */}
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Description complète
            </label>
            <RichTextEditor
              content={localTranslation.description}
              onChange={content => handleFieldChange('description', content)}
            />
            <p className='mt-1 text-xs text-gray-500'>
              {localTranslation.description.length} caractères
            </p>
          </div>
        </div>

        {/* SEO Fields */}
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-medium text-gray-900'>SEO et métadonnées</h3>

          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Titre SEO
              </label>
              <Input
                type='text'
                value={localTranslation.metaTitle}
                onChange={e => handleFieldChange('metaTitle', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.metaTitle ? 'border-yellow-300' : 'border-gray-300'
                }`}
                placeholder='Titre SEO traduit'
                disabled={loading}
              />
              <div className='mt-1 flex justify-between'>
                <span
                  className={`text-xs ${validationErrors.metaTitle ? 'text-yellow-600' : 'text-gray-500'}`}
                >
                  {validationErrors.metaTitle ||
                    `${(localTranslation.metaTitle || '').length} caractères (optimal: <60)`}
                </span>
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Description SEO
              </label>
              <textarea
                value={localTranslation.metaDescription}
                onChange={e => handleFieldChange('metaDescription', e.target.value)}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.metaDescription
                    ? 'border-yellow-300'
                    : 'border-gray-300'
                }`}
                placeholder='Description SEO traduite'
                disabled={loading}
              />
              <div className='mt-1 flex justify-between'>
                <span
                  className={`text-xs ${validationErrors.metaDescription ? 'text-yellow-600' : 'text-gray-500'}`}
                >
                  {validationErrors.metaDescription ||
                    `${(localTranslation.metaDescription || '').length} caractères (optimal: <160)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Source */}
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-medium text-gray-900'>
            Source de la traduction
          </h3>

          <div className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Source de traduction
              </label>
              <select
                value={localTranslation.translationSource}
                onChange={e =>
                  handleFieldChange(
                    'translationSource',
                    e.target.value as 'auto' | 'human' | 'imported' | 'ai'
                  )
                }
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              >
                <option value='human'>Humain</option>
                <option value='ai'>Intelligence Artificielle</option>
                <option value='auto'>Automatique</option>
                <option value='imported'>Importé</option>
              </select>
            </div>

            <div>
              <label className='flex items-center'>
                <Switch
                  checked={localTranslation.humanReviewed}
                  onCheckedChange={checked =>
                    handleFieldChange('humanReviewed', checked)
                  }
                  disabled={loading}
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Vérifié par un humain
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
