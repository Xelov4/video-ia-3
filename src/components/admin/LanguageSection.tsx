/**
 * Language Section Component
 * Displays translation fields for a specific language in a dedicated section
 */

'use client';

import { useState, useEffect } from 'react';
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Language } from './LanguageTabs';
import type { ToolTranslation, BaseToolData } from './TranslationForm';

interface LanguageSectionProps {
  language: Language;
  translation: ToolTranslation | null;
  baseData?: BaseToolData | null;
  onTranslationChange: (translation: ToolTranslation) => void;
  onAutoTranslate?: (targetLanguage: string) => Promise<void>;
  onCopyFromBase?: (targetLanguage: string) => void;
  loading?: boolean;
  className?: string;
}

export function LanguageSection({
  language,
  translation,
  baseData,
  onTranslationChange,
  onAutoTranslate,
  onCopyFromBase,
  loading = false,
  className = '',
}: LanguageSectionProps) {
  const [localTranslation, setLocalTranslation] = useState<ToolTranslation | null>(
    translation
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoTranslating, setAutoTranslating] = useState(false);

  // Update local state when translation prop changes
  useEffect(() => {
    setLocalTranslation(translation);
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
      errors.metaTitle = 'Le titre SEO devrait faire moins de 60 caractères';
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

    const completion = getCompletionPercentage();

    if (localTranslation.humanReviewed && completion === 100) {
      return { status: 'complete', color: 'green', text: 'Vérifié par un humain' };
    }

    if (completion === 100) {
      return {
        status: 'auto-complete',
        color: 'blue',
        text: 'Traduction automatique complète',
      };
    }

    if (completion > 0) {
      return { status: 'in-progress', color: 'yellow', text: 'En cours' };
    }

    return { status: 'empty', color: 'gray', text: 'Non commencé' };
  };

  // For base language (English), show base data info
  if (language.isBase && baseData) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='flex items-center text-xl font-semibold text-gray-900'>
            <span className='mr-3 text-2xl'>{language.flag}</span>
            <div>
              <div className='flex items-center space-x-3'>
                <span>{language.nativeName}</span>
                <span className='inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800'>
                  Langue de base
                </span>
              </div>
              <p className='mt-1 text-sm text-gray-600'>
                Les modifications de cette langue affecteront l'outil principal
              </p>
            </div>
          </h2>
        </div>

        <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4'>
          <div className='flex items-center'>
            <GlobeAltIcon className='mr-4 h-12 w-12 text-indigo-400' />
            <div>
              <h3 className='text-sm font-medium text-indigo-800'>
                Contenu principal géré ci-dessus
              </h3>
              <p className='text-xs text-indigo-600'>
                Les champs de la langue de base sont modifiés dans les sections
                principales de cette page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!localTranslation) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='flex items-center text-xl font-semibold text-gray-900'>
            <span className='mr-3 text-2xl'>{language.flag}</span>
            {language.nativeName}
          </h2>
        </div>

        <div className='py-8 text-center'>
          <div className='mb-4 text-gray-400'>
            <DocumentDuplicateIcon className='mx-auto h-16 w-16' />
          </div>
          <h3 className='mb-2 text-lg font-medium text-gray-900'>
            Traduction non disponible
          </h3>
          <p className='mb-4 text-gray-500'>
            Aucune traduction n'existe pour cette langue.
          </p>

          <div className='flex justify-center space-x-3'>
            {onCopyFromBase && (
              <button
                onClick={handleCopyFromBase}
                className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
                type='button'
              >
                <DocumentDuplicateIcon className='mr-2 h-4 w-4' />
                Copier depuis EN
              </button>
            )}

            {onAutoTranslate && (
              <button
                onClick={handleAutoTranslate}
                disabled={autoTranslating}
                className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
                type='button'
              >
                <SparklesIcon className='mr-2 h-4 w-4' />
                {autoTranslating ? 'Traduction...' : 'Traduction IA'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className={`rounded-lg bg-white p-6 shadow ${className}`}>
      {/* Language Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='text-2xl'>{language.flag}</div>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              {language.nativeName}
            </h2>
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
            </div>
          </div>
        </div>

        {/* Translation Actions */}
        <div className='flex items-center space-x-2'>
          {onCopyFromBase && (
            <button
              onClick={handleCopyFromBase}
              className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
              type='button'
            >
              <DocumentDuplicateIcon className='mr-1.5 h-4 w-4' />
              Copier depuis EN
            </button>
          )}

          {onAutoTranslate && (
            <button
              onClick={handleAutoTranslate}
              disabled={autoTranslating}
              className='inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
              type='button'
            >
              <SparklesIcon className='mr-1.5 h-4 w-4' />
              {autoTranslating ? 'Traduction...' : 'Traduction IA'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-6'>
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

      {/* Translation Form Fields */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Name Field */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Nom de l'outil *
          </label>
          <input
            type='text'
            value={localTranslation.name}
            onChange={e => handleFieldChange('name', e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
              validationErrors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nom traduit de l'outil"
            disabled={loading}
          />
          {validationErrors.name && (
            <p className='mt-1 text-sm text-red-600'>{validationErrors.name}</p>
          )}
        </div>

        {/* Meta Title Field */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Titre SEO
          </label>
          <input
            type='text'
            value={localTranslation.metaTitle}
            onChange={e => handleFieldChange('metaTitle', e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
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
                `${localTranslation.metaTitle.length} caractères (optimal: <60)`}
            </span>
          </div>
        </div>

        {/* Overview Field - Full Width */}
        <div className='lg:col-span-2'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>Aperçu</label>
          <textarea
            value={localTranslation.overview}
            onChange={e => handleFieldChange('overview', e.target.value)}
            rows={3}
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            placeholder='Description courte traduite...'
            disabled={loading}
          />
          <p className='mt-1 text-xs text-gray-500'>
            {localTranslation.overview.length} caractères
          </p>
        </div>

        {/* Description Field - Full Width */}
        <div className='lg:col-span-2'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Description complète
          </label>
          <textarea
            value={localTranslation.description}
            onChange={e => handleFieldChange('description', e.target.value)}
            rows={4}
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            placeholder='Description détaillée traduite...'
            disabled={loading}
          />
          <p className='mt-1 text-xs text-gray-500'>
            {localTranslation.description.length} caractères
          </p>
        </div>

        {/* Meta Description Field - Full Width */}
        <div className='lg:col-span-2'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Description SEO
          </label>
          <textarea
            value={localTranslation.metaDescription}
            onChange={e => handleFieldChange('metaDescription', e.target.value)}
            rows={3}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
              validationErrors.metaDescription ? 'border-yellow-300' : 'border-gray-300'
            }`}
            placeholder='Description SEO traduite'
            disabled={loading}
          />
          <div className='mt-1 flex justify-between'>
            <span
              className={`text-xs ${validationErrors.metaDescription ? 'text-yellow-600' : 'text-gray-500'}`}
            >
              {validationErrors.metaDescription ||
                `${localTranslation.metaDescription.length} caractères (optimal: 120-160)`}
            </span>
          </div>
        </div>

        {/* Translation Source Section */}
        <div className='mt-2 border-t pt-4 lg:col-span-2'>
          <h3 className='mb-3 text-sm font-semibold text-gray-900'>
            Source de la traduction
          </h3>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Source
              </label>
              <select
                value={localTranslation.translationSource}
                onChange={e =>
                  handleFieldChange(
                    'translationSource',
                    e.target.value as 'auto' | 'human' | 'imported' | 'ai'
                  )
                }
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              >
                <option value='human'>Humain</option>
                <option value='ai'>IA</option>
                <option value='auto'>Auto</option>
                <option value='imported'>Importé</option>
              </select>
            </div>

            <div className='flex items-center pt-6'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={localTranslation.humanReviewed}
                  onChange={e => handleFieldChange('humanReviewed', e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
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
