/**
 * Système de Fallback UI Gracieux - Video-IA.net
 *
 * Composants pour gérer les cas d'échec avec élégance :
 * - Traductions manquantes
 * - Erreurs de chargement
 * - Contenus indisponibles
 * - Dégradation progressive
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { ReactNode, Component, ErrorInfo } from 'react';
import { useTranslation } from '@/src/hooks/useTranslation';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Hook pour gérer les fallbacks de traduction
 */
export function useFallbackTranslation() {
  const { t, currentLanguage } = useTranslation();

  const tWithFallback = (
    key: string,
    fallback?: string,
    variables?: Record<string, string | number>
  ): string => {
    try {
      const translated = t(key, variables);

      // Si la traduction retourne la clé (pas de traduction trouvée)
      if (translated === key && fallback) {
        return fallback;
      }

      return translated;
    } catch (error) {
      console.warn(`Translation fallback for key: ${key}`, error);
      return fallback || key;
    }
  };

  return { tWithFallback, currentLanguage };
}

/**
 * Composant pour texte avec fallback
 */
interface FallbackTextProps {
  translationKey: string;
  fallback: string;
  variables?: Record<string, string | number>;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export function FallbackText({
  translationKey,
  fallback,
  variables,
  className = '',
  tag: Tag = 'span',
}: FallbackTextProps) {
  const { tWithFallback } = useFallbackTranslation();

  return (
    <Tag className={className}>
      {tWithFallback(translationKey, fallback, variables)}
    </Tag>
  );
}

/**
 * Error Boundary avec messages multilingues
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Callback pour logging externe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log pour développement
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI personnalisé ou par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Composant de fallback pour les erreurs
 */
function ErrorFallback({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
      <ExclamationTriangleIcon className='mb-4 h-12 w-12 text-red-400' />

      <h3 className='mb-2 text-lg font-semibold text-white'>
        {t('messages.error_generic')}
      </h3>

      <p className='mb-6 max-w-md text-gray-400'>
        Une erreur inattendue s'est produite. Veuillez réessayer.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <details className='mb-4 max-w-full overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-300'>
          <summary className='mb-2 cursor-pointer font-medium text-red-400'>
            Détails technique (dev only)
          </summary>
          <pre className='whitespace-pre-wrap'>{error.toString()}</pre>
        </details>
      )}

      <button
        onClick={onRetry}
        className='flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
      >
        <ArrowPathIcon className='h-4 w-4' />
        <span>{t('messages.try_again')}</span>
      </button>
    </div>
  );
}

/**
 * Composant pour contenu avec chargement progressif
 */
interface ProgressiveContentProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

export function ProgressiveContent({
  isLoading,
  error,
  isEmpty = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  children,
}: ProgressiveContentProps) {
  const { t } = useTranslation();

  // État de chargement
  if (isLoading) {
    return (
      loadingComponent || (
        <div className='flex items-center justify-center p-8'>
          <div className='flex flex-col items-center space-y-3'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600' />
            <p className='text-sm text-gray-400'>{t('messages.loading')}</p>
          </div>
        </div>
      )
    );
  }

  // État d'erreur
  if (error) {
    return (
      errorComponent || (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <ExclamationTriangleIcon className='mb-3 h-8 w-8 text-red-400' />
          <p className='mb-3 text-sm text-gray-400'>{t('messages.error_generic')}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className='text-sm text-purple-400 transition-colors hover:text-purple-300'
            >
              {t('messages.try_again')}
            </button>
          )}
        </div>
      )
    );
  }

  // État vide
  if (isEmpty) {
    return (
      emptyComponent || (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <div className='mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600'>
            <span className='text-xs text-gray-400'>∅</span>
          </div>
          <p className='text-sm text-gray-400'>{t('messages.no_results')}</p>
        </div>
      )
    );
  }

  // Contenu principal
  return <>{children}</>;
}

/**
 * HOC pour ajouter des fallbacks automatiques
 */
export function withFallback<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: ReactNode
) {
  return function FallbackWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Composant pour image avec fallback
 */
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  className = '',
  onError,
}: ImageWithFallbackProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc;
      if (onError) onError();
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      loading='lazy'
    />
  );
}

/**
 * Composant pour lien externe avec validation
 */
interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  fallbackText?: string;
}

export function SafeLink({
  href,
  children,
  className = '',
  fallbackText = 'Lien non disponible',
}: SafeLinkProps) {
  const { t } = useTranslation();

  // Valider l'URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!href || !isValidUrl(href)) {
    return (
      <span
        className={`cursor-not-allowed text-gray-500 ${className}`}
        title={t('messages.error_invalid_url')}
      >
        {fallbackText}
      </span>
    );
  }

  return (
    <a href={href} target='_blank' rel='noopener noreferrer' className={className}>
      {children}
    </a>
  );
}

/**
 * Composant pour données avec fallback de formatage
 */
interface FormattedDataProps {
  data: any;
  formatter: (data: any) => string;
  fallback: string;
  className?: string;
}

export function FormattedData({
  data,
  formatter,
  fallback,
  className = '',
}: FormattedDataProps) {
  try {
    const formatted = formatter(data);
    return <span className={className}>{formatted}</span>;
  } catch (error) {
    console.warn('Data formatting error:', error);
    return <span className={`text-gray-500 ${className}`}>{fallback}</span>;
  }
}
