import React, { useState } from 'react';
import { ZoomIn, Sparkles, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

interface ProductGalleryProps {
  product: Product;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const realImages = (product as any).galleryImages && (product as any).galleryImages.length > 0
    ? (product as any).galleryImages.map((img: string, idx: number) => ({ url: img, label: `صورة ${idx + 1}` }))
    : [
        { url: product.image_url, label: 'الواجهة الرئيسية' },
      ];

  const galleryImages = realImages;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none font-arabic" dir="rtl">
      {/* Main Image Stage */}
      <div
        className="relative aspect-square w-full rounded-3xl bg-[#FCFAF7] border border-[#F0EAE1] p-6 sm:p-10 flex items-center justify-center overflow-hidden shadow-2xs group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Luxury Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-xs border border-[#E8E3D8] rounded-full text-xs font-black text-[#111111] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#008F68]" />
            <span>مقتنى ملكي مختار</span>
          </span>
        </div>

        {/* Zoom Hint Icon */}
        <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-2 rounded-full border border-[#E8E3D8] text-neutral-600 shadow-2xs">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Image element with zoom capability */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={galleryImages[selectedImageIndex].url}
            alt={product.name}
            className={`max-h-full max-w-full object-contain transition-all duration-300 ${
              isZoomed ? 'scale-125' : 'scale-100'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Gallery Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[#E8E3D8] flex items-center justify-center text-neutral-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
          title="الصورة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-[#E8E3D8] flex items-center justify-center text-neutral-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
          title="الصورة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Authenticity Watermark */}
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E8E3D8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008F68]" />
          <span>أصالة معتمدة 100%</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 gap-3">
        {galleryImages.map((img, idx) => {
          const isSelected = selectedImageIndex === idx;
          return (
            <button
              key={`thumb-${idx}`}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative aspect-square rounded-2xl bg-[#FCFAF7] border p-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#008F68] ring-2 ring-[#008F68]/20 bg-white shadow-2xs'
                  : 'border-[#F0EAE1] hover:border-neutral-400 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.label}
                className="w-full h-full object-contain mix-blend-multiply"
              />
              <span className="sr-only">{img.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
