/**
 * Language Tabs Component for Multilingual Tool Editing
 * Responsive tab navigation with language flags and indicators
 */

'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
  isBase?: boolean;
}

interface LanguageTabsProps {
  languages: Language[];
  activeLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  translationStatus?: Record<string, TranslationStatus>;
  className?: string;
}

export interface TranslationStatus {
  isComplete: boolean;
  completionPercentage: number;
  hasChanges: boolean;
  isHumanReviewed: boolean;
  qualityScore: number;
}

const DEFAULT_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    enabled: true,
    isBase: true,
  },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true },
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

export function LanguageTabs({
  languages = DEFAULT_LANGUAGES,
  activeLanguage,
  onLanguageChange,
  translationStatus = {},
  className = '',
}: LanguageTabsProps) {
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  const enabledLanguages = languages.filter(lang => lang.enabled);
  const activeLanguageObj =
    enabledLanguages.find(lang => lang.code === activeLanguage) || enabledLanguages[0];

  const getStatusIndicator = (languageCode: string) => {
    const status = translationStatus[languageCode];
    if (!status) return null;

    if (status.isComplete && status.isHumanReviewed) {
      return (
        <div className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500'>
          <CheckCircleIcon className='h-3 w-3 text-white' />
        </div>
      );
    }

    if (status.isComplete) {
      return (
        <div className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500'></div>
      );
    }

    if (status.completionPercentage > 0) {
      return (
        <div className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-500'></div>
      );
    }

    return (
      <div className='absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gray-400'></div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Tabs */}
      <div className='hidden lg:block'>
        <div className='rounded-t-lg border-b border-gray-200 bg-white'>
          <nav className='flex space-x-1 px-6 pt-4' aria-label='Tabs'>
            {enabledLanguages.map(language => (
              <button
                key={language.code}
                onClick={() => onLanguageChange(language.code)}
                className={`group relative flex items-center rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeLanguage === language.code
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
                type='button'
              >
                <span className='mr-2 text-lg'>{language.flag}</span>
                <span className='mr-2'>{language.nativeName}</span>
                {language.isBase && (
                  <span className='mr-2 inline-flex items-center rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-800'>
                    Base
                  </span>
                )}
                {getStatusIndicator(language.code)}

                {/* Tooltip */}
                <div className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
                  {language.name} ({language.code.toUpperCase()})
                  {translationStatus[language.code] && (
                    <div className='mt-1 text-xs'>
                      {Math.round(
                        translationStatus[language.code].completionPercentage
                      )}
                      % complete
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile/Tablet Dropdown */}
      <div className='relative lg:hidden'>
        <button
          onClick={() => setShowMobileDropdown(!showMobileDropdown)}
          className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
          type='button'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <GlobeAltIcon className='mr-3 h-5 w-5 text-gray-400' />
              <span className='mr-2 text-lg'>{activeLanguageObj.flag}</span>
              <div className='flex flex-col'>
                <span className='text-sm font-medium text-gray-900'>
                  {activeLanguageObj.nativeName}
                </span>
                <span className='text-xs text-gray-500'>
                  {activeLanguageObj.name} ({activeLanguageObj.code.toUpperCase()})
                  {activeLanguageObj.isBase && ' - Base Language'}
                </span>
              </div>
            </div>
            <div className='flex items-center'>
              {getStatusIndicator(activeLanguageObj.code)}
              <ChevronDownIcon
                className={`h-5 w-5 transform text-gray-400 transition-transform ${showMobileDropdown ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </button>

        {/* Mobile Dropdown Menu */}
        {showMobileDropdown && (
          <div className='absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg'>
            <div className='py-1'>
              {enabledLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => {
                    onLanguageChange(language.code);
                    setShowMobileDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                    activeLanguage === language.code
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700'
                  }`}
                  type='button'
                >
                  <div className='flex items-center'>
                    <span className='mr-3 text-lg'>{language.flag}</span>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{language.nativeName}</span>
                      <span className='text-xs text-gray-500'>
                        {language.name} ({language.code.toUpperCase()})
                        {language.isBase && ' - Base'}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getStatusIndicator(language.code)}
                    <div className='relative'>{getStatusIndicator(language.code)}</div>
                    {translationStatus[language.code] && (
                      <span className='text-xs text-gray-400'>
                        {Math.round(
                          translationStatus[language.code].completionPercentage
                        )}
                        %
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Translation Legend */}
            <div className='border-t border-gray-200 bg-gray-50 px-4 py-3'>
              <div className='text-xs text-gray-600'>
                <div className='mb-2 font-medium'>Status Legend:</div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='flex items-center'>
                    <div className='mr-2 h-2 w-2 rounded-full bg-green-500'></div>
                    <span>Human Reviewed</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='mr-2 h-2 w-2 rounded-full bg-blue-500'></div>
                    <span>Auto Complete</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='mr-2 h-2 w-2 rounded-full bg-yellow-500'></div>
                    <span>In Progress</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='mr-2 h-2 w-2 rounded-full bg-gray-400'></div>
                    <span>Not Started</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown on click outside */}
      {showMobileDropdown && (
        <div
          className='fixed inset-0 z-10'
          onClick={() => setShowMobileDropdown(false)}
        />
      )}
    </div>
  );
}
