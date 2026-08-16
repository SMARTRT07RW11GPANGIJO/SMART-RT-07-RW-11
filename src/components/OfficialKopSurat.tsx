import React, { useState } from 'react';
import { DOCUMENT_BRANDING } from '../config/documentBranding';
import { AlertCircle } from 'lucide-react';

interface OfficialKopSuratProps {
  className?: string;
  theme?: 'navy' | 'classic' | 'slate';
  onImageLoadStatusChange?: (isReady: boolean) => void;
  showAdminWarning?: boolean;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  className = '',
  theme = 'navy',
  onImageLoadStatusChange,
  showAdminWarning = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    if (onImageLoadStatusChange) {
      onImageLoadStatusChange(false);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoaded(true);
    if (onImageLoadStatusChange) {
      onImageLoadStatusChange(true);
    }
  };

  const borderColor = theme === 'navy' ? 'border-[#123B5D]' : 'border-slate-900';
  const orgColor = theme === 'navy' ? 'text-[#123B5D]' : 'text-slate-900';
  const housingColor = 'text-[#2E7D52]';

  return (
    <div className={`w-full ${className}`}>
      {/* Admin Error Warning if Image Fails */}
      {imageError && showAdminWarning && (
        <div className="no-print mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-sans">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">
            Logo kop surat belum tersedia atau gagal dimuat. Dokumen belum siap cetak resmi.
          </span>
        </div>
      )}

      {/* Kop Surat Header Layout */}
      <div className={`border-b-4 border-double ${borderColor} pb-3.5 mb-5 flex items-center justify-center gap-3 sm:gap-6 text-center`}>
        {/* Logo Kabupaten Malang */}
        <div className="shrink-0 flex items-center justify-center">
          {!imageError ? (
            <img
              src={DOCUMENT_BRANDING.logoKabupaten}
              alt={DOCUMENT_BRANDING.logoAlt}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="w-[64px] h-[76px] sm:w-[82px] sm:h-[98px] object-contain shrink-0"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div className="w-[64px] h-[76px] sm:w-[82px] sm:h-[98px] border border-dashed border-red-300 bg-red-50/50 rounded flex flex-col items-center justify-center p-1 text-[9px] text-red-600 text-center font-sans">
              <AlertCircle className="w-4 h-4 text-red-500 mb-0.5" />
              <span>Logo Error</span>
            </div>
          )}
        </div>

        {/* Official Header Text Hierarchy */}
        <div className="text-center select-text">
          <h1 className={`font-bold text-sm sm:text-lg md:text-xl tracking-wider ${orgColor} uppercase leading-tight font-serif`}>
            {DOCUMENT_BRANDING.organizationName}
          </h1>
          <h2 className={`font-bold text-xs sm:text-base md:text-lg tracking-wide ${housingColor} uppercase leading-tight mt-0.5 font-serif`}>
            {DOCUMENT_BRANDING.housingName}
          </h2>
          <p className="text-[11px] sm:text-sm md:text-base font-semibold text-slate-800 uppercase leading-tight mt-0.5 font-serif">
            {DOCUMENT_BRANDING.district}
          </p>
          <p className="text-[11px] sm:text-sm md:text-base font-semibold text-slate-800 uppercase leading-tight mt-0.5 font-serif">
            {DOCUMENT_BRANDING.regency}
          </p>
          <p className="text-[11px] sm:text-sm md:text-base font-semibold text-slate-800 uppercase leading-tight mt-0.5 font-serif">
            {DOCUMENT_BRANDING.province}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600 font-sans italic mt-1 leading-snug">
            {DOCUMENT_BRANDING.fullAddress}
          </p>
        </div>
      </div>
    </div>
  );
};
