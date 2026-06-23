import '@google/model-viewer';
import { useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        exposure?: string;
        loading?: string;
        class?: string;
      };
    }
  }
}

interface ModelViewerProps {
  src: string;
  iosSrc?: string;
  alt: string;
}

export function ModelViewer({ src, iosSrc, alt }: ModelViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-gray-500">Memuat model 3D...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100">
          <div className="text-center p-4">
            <p className="text-sm text-red-600 mb-2">Gagal memuat model 3D</p>
            <p className="text-xs text-gray-500">Pastikan koneksi internet stabil</p>
          </div>
        </div>
      ) : (
        <model-viewer
          src={src}
          ios-src={iosSrc}
          alt={alt}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          loading="eager"
          class="w-full h-full"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}
