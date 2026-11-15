import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export function ProductImage({ src, alt, className = '', iconClassName = 'h-6 w-6' }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const trimmedSrc = typeof src === 'string' ? src.trim() : '';
  const hasError = !trimmedSrc || failedSrc === trimmedSrc;

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt || 'Product placeholder'}
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 select-none ${className}`}
      >
        <ImageOff className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt}
      onError={() => setFailedSrc(trimmedSrc)}
      className={className}
    />
  );
}
