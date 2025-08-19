'use client';

import { SupportedLanguage } from '@/src/lib/i18n/types';
import GlobalBreadcrumb from '@/src/components/common/GlobalBreadcrumb';

interface BreadcrumbWrapperProps {
  lang: SupportedLanguage;
  toolName?: string;
  categoryName?: string;
  className?: string;
  showOnMobile?: boolean;
}

/**
 * Wrapper de breadcrumb pour les layouts - Version simplifiée pour intégration facile
 */
export default function BreadcrumbWrapper({
  lang,
  toolName,
  categoryName,
  className = '',
  showOnMobile = false,
}: BreadcrumbWrapperProps) {
  return (
    <div
      className={`w-full border-b border-border/50 bg-muted/30 ${showOnMobile ? '' : 'hidden sm:block'} ${className} `}
    >
      <div className='container mx-auto px-4 py-3'>
        <GlobalBreadcrumb lang={lang} toolName={toolName} categoryName={categoryName} />
      </div>
    </div>
  );
}
