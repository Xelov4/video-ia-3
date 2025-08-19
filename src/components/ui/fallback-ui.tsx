import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface FallbackUIProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export const FallbackUI: React.FC<FallbackUIProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showRetry = true,
}) => {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-8 text-center'>
      <div className='mb-6'>
        <AlertTriangle className='mx-auto mb-4 h-16 w-16 text-red-500' />
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>{title}</h2>
        <p className='max-w-md text-gray-600'>{message}</p>
        {error && (
          <details className='mt-4 text-left'>
            <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
              Error details
            </summary>
            <pre className='mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-600'>
              {error.message}
            </pre>
          </details>
        )}
      </div>

      {showRetry && resetError && (
        <Button onClick={resetError} className='flex items-center gap-2'>
          <RefreshCw className='h-4 w-4' />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default FallbackUI;
