import React, { useState } from 'react';
import { DOCUMENT_BRANDING, OFFICIAL_LETTERHEAD } from '../config/documentBranding';
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

  const orgColor = theme === 'navy' ? 'text-[#1E3A8A]' : 'text-slate-900';
  const housingColor = 'text-[#166534]';

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

      {/* Official Letterhead Flex Layout (Logo on Left, Text on Right, Height Aligned) */}
      <div className="official-letterhead w-full min-h-[100px] flex items-center box-border gap-4 sm:gap-6">
        {/* Official Logo Container (Locked 82x98 px) */}
        <div className="official-logo-container w-[82px] h-[98px] min-w-[82px] flex-[0_0_82px] flex items-center justify-center box-border shrink-0">
          {!imageError ? (
            <img
              src={OFFICIAL_LETTERHEAD.logoPath}
              alt={DOCUMENT_BRANDING.logoAlt}
              width={OFFICIAL_LETTERHEAD.logoWidth}
              height={OFFICIAL_LETTERHEAD.logoHeight}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="official-logo w-[82px] h-[98px] object-contain object-center block shrink-0 flex-[0_0_82px]"
              style={{
                width: '82px',
                height: '98px',
                objectFit: 'contain',
                objectPosition: 'center',
                flex: '0 0 82px'
              }}
            />
          ) : (
            <div className="w-[82px] h-[98px] border border-dashed border-red-300 bg-red-50/50 rounded flex flex-col items-center justify-center p-1 text-[9px] text-red-600 text-center font-sans">
              <AlertCircle className="w-4 h-4 text-red-500 mb-0.5" />
              <span>Logo Error</span>
            </div>
          )}
        </div>

        {/* Official Text Block (Centered Text Hierarchy) */}
        <div className="official-text-block min-h-[98px] flex-[1_1_auto] flex flex-col justify-center text-center box-border select-text">
          {/* Baris 1: Bold, Dominan */}
          <h1 className={`font-bold text-sm sm:text-lg md:text-xl tracking-tight ${orgColor} uppercase leading-tight font-serif`}>
            {DOCUMENT_BRANDING.organizationName}
          </h1>
          {/* Baris 2: Bold, Hijau */}
          <h2 className={`font-bold text-xs sm:text-base md:text-lg tracking-wide ${housingColor} uppercase leading-tight mt-0.5 font-serif`}>
            {DOCUMENT_BRANDING.housingName}
          </h2>
          {/* Baris 3: Bold */}
          <p className="text-[11px] sm:text-sm md:text-base font-bold text-slate-800 uppercase leading-tight mt-0.5 font-serif">
            {DOCUMENT_BRANDING.district} • {DOCUMENT_BRANDING.regency}
          </p>
          {/* Baris 4: Italic, Ukuran Lebih Kecil */}
          <p className="text-[10px] sm:text-xs text-slate-600 font-sans italic mt-1 leading-snug">
            {DOCUMENT_BRANDING.fullAddress}
          </p>
        </div>
      </div>

      {/* Official Header Double Line (2px top, 2px bottom, #1E3A8A) */}
      <div
        className="official-header-line w-full h-[4px] mt-2 mb-4 box-border"
        style={{
          borderTop: '2px solid #1E3A8A',
          borderBottom: '2px solid #1E3A8A',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};
