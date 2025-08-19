'use client';

import { useState, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fill = false,
  sizes,
  className = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (imageSrc !== '/images/placeholder-tool.png') {
      setImageSrc('/images/placeholder-tool.png');
      setIsLoading(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className} ${fill ? 'absolute inset-0' : 'h-full w-full'}`}
      >
        <span className='text-sm text-gray-400'>Image indisponible</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className} ${fill ? 'absolute inset-0 h-full w-full' : ''}`}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
      onLoad={() => setIsLoading(false)}
    />
  );
};
