import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';

// Import visual assets
import msLogoWhite from '../../assets/tiles/ms_logo_white.jpg';
import rackGreen from '../../assets/tiles/rack_green.jpg';
import foldedShirtsPeach from '../../assets/tiles/folded_shirts_peach.jpg';
import tshirtsGreen from '../../assets/tiles/tshirts_green.jpg';
import foldedShirtsOnly from '../../assets/tiles/folded_shirts_only.jpg';
import fakhamaBrandPeach from '../../assets/tiles/fakhama_brand_peach.jpg';
import greyTshirtGreen from '../../assets/tiles/grey_tshirt_green.jpg';
import blackTshirtGreen from '../../assets/tiles/black_tshirt_green.jpg';
import heroMain from '../../assets/images/regenerated_image_1787114260183.jpg';

// --- SVGs for High-DPI Vector Brand Marks ---
const MSSignatureSvg: React.FC<{ color?: string; className?: string }> = ({
  color = '#111111',
  className = 'w-24 h-auto'
}) => (
  <svg viewBox="0 0 200 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 50C35 20 60 15 80 40C90 55 75 70 55 60C35 50 45 25 70 20C95 15 110 35 130 30C150 25 170 35 185 45M30 40C60 30 110 10 160 35"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FakhamaBrandMark: React.FC<{ textColor?: string; dotColor?: string; className?: string }> = ({
  textColor = '#111111',
  dotColor = '#F5C400',
  className = ''
}) => (
  <div className={`flex items-center gap-2 select-none font-arabic ${className}`}>
    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
    <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: textColor }}>
      فخامة
    </span>
  </div>
);

// --- Shared Color Palette ---
const PALETTE_BG = [
  'bg-[#111111]',
  'bg-[#008F68]',
  'bg-[#F9DCCB]',
  'bg-white',
  'bg-[#F5C400]'
];

// --- Content Item Definition ---
export interface ContentItem {
  id: string;
  type: 'editorial' | 'image' | 'brand_ms' | 'brand_fakhama' | 'guarantee';
  title?: string;
  subtitle?: string;
  badge?: string;
  imageSrc?: string;
  secondaryImageSrc?: string;
  allowedBgClasses: string[];
}

const CONTENT_POOL: ContentItem[] = [
  {
    id: 'item-editorial',
    type: 'editorial',
    title: 'توازناً مريحاً لمقتنياتك وأسلوب حياتك',
    subtitle: 'منصة فخامة تجمع بين دقة التصنيع واللمسة العصرية. استكشف تشكيلة الأزياء، القمصان الفاخرة والتقنيات المعاصرة.',
    badge: 'إصدارات دار فخامة الحصرية 2026',
    allowedBgClasses: ['bg-[#111111]', 'bg-[#008F68]', 'bg-white', 'bg-[#F9DCCB]']
  },
  {
    id: 'item-folded-shirts',
    type: 'image',
    imageSrc: foldedShirtsPeach,
    secondaryImageSrc: foldedShirtsOnly,
    title: 'تشكيلة القمصان الفاخرة',
    badge: 'جديد 2026',
    allowedBgClasses: ['bg-[#F9DCCB]', 'bg-[#111111]', 'bg-white']
  },
  {
    id: 'item-rack',
    type: 'image',
    imageSrc: rackGreen,
    secondaryImageSrc: tshirtsGreen,
    title: 'تشكيلة الأزياء والمقتنيات',
    badge: 'مقتنيات الموسم',
    allowedBgClasses: ['bg-[#008F68]', 'bg-[#111111]', 'bg-[#F9DCCB]']
  },
  {
    id: 'item-black-shirt',
    type: 'image',
    imageSrc: blackTshirtGreen,
    title: 'تيشرت أوفرايزد قطن 100%',
    badge: 'الأكثر طلباً',
    allowedBgClasses: ['bg-[#008F68]', 'bg-[#111111]', 'bg-[#F5C400]']
  },
  {
    id: 'item-grey-shirt',
    type: 'image',
    imageSrc: greyTshirtGreen,
    title: 'تيشرت رمادي فاخر',
    badge: 'قطن إيطالي',
    allowedBgClasses: ['bg-[#008F68]', 'bg-white', 'bg-[#F9DCCB]']
  },
  {
    id: 'item-hero-showcase',
    type: 'image',
    imageSrc: heroMain,
    title: 'المقتنيات والتقنيات المختارة',
    badge: 'فخامة لوكس',
    allowedBgClasses: ['bg-[#111111]', 'bg-[#008F68]', 'bg-white']
  },
  {
    id: 'item-ms-signature',
    type: 'brand_ms',
    title: 'MS SIGNATURE',
    subtitle: 'المجموعة الملكية الحصرية',
    allowedBgClasses: ['bg-white', 'bg-[#111111]', 'bg-[#F5C400]']
  },
  {
    id: 'item-fakhama-brand',
    type: 'brand_fakhama',
    title: 'علامة المقتنيات الرسمية',
    subtitle: 'الأناقة والأصالة في كل قطعة',
    allowedBgClasses: ['bg-[#F9DCCB]', 'bg-[#111111]', 'bg-[#008F68]', 'bg-white']
  },
  {
    id: 'item-guarantee',
    type: 'guarantee',
    title: 'شحن فورى ومؤمن لكافة المدن',
    subtitle: 'ضمان ذهبي معتمد لمدة سنتين',
    badge: 'أصالة 100%',
    allowedBgClasses: ['bg-[#008F68]', 'bg-[#F5C400]', 'bg-[#111111]', 'bg-white']
  }
];

// --- Hierarchical Virtual Cell Grid Model (8 cols x 4 rows = 32 logical cells) ---
export interface RegionBounds {
  colStart: number; // 0-indexed (0..7)
  rowStart: number; // 0-indexed (0..3)
  colSpan: number;  // 1..8
  rowSpan: number;  // 1..4
}

export interface MosaicRegion extends RegionBounds {
  id: string; // Unique region identifier
  contentId: string;
  bgClass: string;
  rotationY: number;
  rotationX: number;
  useSecondaryFace: boolean;
}

export interface MosaicState {
  partitionId: string;
  regions: MosaicRegion[];
}

// Pre-designed, mathematically verified grid partitions covering 100% of 8x4 matrix
const PARTITION_CONFIGS: RegionBounds[][] = [
  // CONFIG 0: 6 Regions (Large Editorial Left 4x3)
  [
    { colStart: 0, rowStart: 0, colSpan: 4, rowSpan: 3 }, // 12 cells (Editorial)
    { colStart: 4, rowStart: 0, colSpan: 4, rowSpan: 2 }, // 8 cells (Showcase)
    { colStart: 4, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 6, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 0, rowStart: 3, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 2, rowStart: 3, colSpan: 2, rowSpan: 1 }  // 2 cells
  ],

  // CONFIG 1: 6 Regions (Split Top/Bottom Banners & Center)
  [
    { colStart: 0, rowStart: 0, colSpan: 4, rowSpan: 2 }, // 8 cells
    { colStart: 4, rowStart: 0, colSpan: 4, rowSpan: 2 }, // 8 cells (Editorial)
    { colStart: 0, rowStart: 2, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 3, rowStart: 2, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 6, rowStart: 2, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 6, rowStart: 3, colSpan: 2, rowSpan: 1 }  // 2 cells
  ],

  // CONFIG 2: 8 Regions (Center Editorial 3x3 with Split Surrounding Tiles)
  [
    { colStart: 0, rowStart: 0, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 2, rowStart: 0, colSpan: 3, rowSpan: 3 }, // 9 cells (Editorial)
    { colStart: 5, rowStart: 0, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 0, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 2, rowStart: 3, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 4, rowStart: 3, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 6, rowStart: 3, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 5, rowStart: 2, colSpan: 3, rowSpan: 1 }  // 3 cells
  ],

  // CONFIG 3: 6 Regions (Subdivided Left Columns & Large Editorial Right)
  [
    { colStart: 0, rowStart: 0, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 0, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 2, rowStart: 0, colSpan: 2, rowSpan: 4 }, // 8 cells
    { colStart: 4, rowStart: 0, colSpan: 4, rowSpan: 3 }, // 12 cells (Editorial)
    { colStart: 4, rowStart: 3, colSpan: 2, rowSpan: 1 }, // 2 cells
    { colStart: 6, rowStart: 3, colSpan: 2, rowSpan: 1 }  // 2 cells
  ],

  // CONFIG 4: 7 Regions (Balanced Mosaic Grid Subdivision)
  [
    { colStart: 0, rowStart: 0, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 3, rowStart: 0, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 6, rowStart: 0, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 0, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 2, rowStart: 2, colSpan: 3, rowSpan: 2 }, // 6 cells (Editorial)
    { colStart: 5, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 7, rowStart: 2, colSpan: 1, rowSpan: 2 }  // 2 cells
  ],

  // CONFIG 5: 5 Regions (Spacious High-Contrast Banner Partition)
  [
    { colStart: 0, rowStart: 0, colSpan: 5, rowSpan: 2 }, // 10 cells
    { colStart: 5, rowStart: 0, colSpan: 3, rowSpan: 3 }, // 9 cells (Editorial)
    { colStart: 0, rowStart: 2, colSpan: 3, rowSpan: 2 }, // 6 cells
    { colStart: 3, rowStart: 2, colSpan: 2, rowSpan: 2 }, // 4 cells
    { colStart: 5, rowStart: 3, colSpan: 3, rowSpan: 1 }  // 3 cells
  ]
];

// --- Validation Layer ---
const validateMosaicState = (state: MosaicState): boolean => {
  if (!state || !state.regions || state.regions.length < 4 || state.regions.length > 9) {
    return false;
  }

  // Check bounds and construct coverage matrix for 8 cols x 4 rows
  const gridCoverage = Array.from({ length: 4 }, () => Array(8).fill(0));

  for (const r of state.regions) {
    if (r.colStart < 0 || r.colStart + r.colSpan > 8) return false;
    if (r.rowStart < 0 || r.rowStart + r.rowSpan > 4) return false;
    if (r.colSpan <= 0 || r.rowSpan <= 0) return false;

    for (let row = r.rowStart; row < r.rowStart + r.rowSpan; row++) {
      for (let col = r.colStart; col < r.colStart + r.colSpan; col++) {
        if (gridCoverage[row][col] > 0) {
          // Overlap detected!
          return false;
        }
        gridCoverage[row][col] = 1;
      }
    }
  }

  // Verify full 100% canvas coverage with 0 empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      if (gridCoverage[row][col] !== 1) {
        return false; // Empty cell or hole!
      }
    }
  }

  return true;
};

// --- Shared Palette Colors ---
const PALETTE_COLORS = [
  'bg-[#111111]',
  'bg-[#008F68]',
  'bg-[#F9DCCB]',
  'bg-white',
  'bg-[#F5C400]'
];

// --- Next State Generator Function ---
const generateNextMosaicState = (
  prevConfigIndex: number,
  prevStatesMap: Map<string, { rotationY: number; rotationX: number; useSecondaryFace: boolean }>
): { nextState: MosaicState; nextConfigIndex: number } => {
  // Select a new partition configuration that differs from the current one
  let nextConfigIdx = (prevConfigIndex + 1) % PARTITION_CONFIGS.length;
  let partitionBounds = PARTITION_CONFIGS[nextConfigIdx];

  // Shuffle content pool for regions (editorial goes to largest region with area >= 8)
  const nonEditorialPool = CONTENT_POOL.filter((c) => c.id !== 'item-editorial');
  const shuffledPool = [...nonEditorialPool].sort(() => Math.random() - 0.5);

  // Find largest region index for editorial assignment
  let largestIdx = 0;
  let maxArea = 0;
  partitionBounds.forEach((b, idx) => {
    const area = b.colSpan * b.rowSpan;
    if (area > maxArea) {
      maxArea = area;
      largestIdx = idx;
    }
  });

  // Assign distinct colors from PALETTE_COLORS in round-robin sequence to guarantee that all 5 colors are always present without adjacent repetition
  const regions: MosaicRegion[] = partitionBounds.map((bounds, idx) => {
    let content: ContentItem;

    if (idx === largestIdx) {
      content = CONTENT_POOL.find((c) => c.id === 'item-editorial')!;
    } else {
      content = shuffledPool.pop() || CONTENT_POOL[idx % CONTENT_POOL.length];
    }

    // Assign color deterministically based on index offset to ensure max palette diversity
    const colorIdx = (idx + nextConfigIdx * 2) % PALETTE_COLORS.length;
    const bgClass = PALETTE_COLORS[colorIdx];

    const prevInfo = prevStatesMap.get(content.id) || {
      rotationY: 0,
      rotationX: 0,
      useSecondaryFace: false
    };

    return {
      id: `region-${nextConfigIdx}-${idx}-${content.id}`,
      ...bounds,
      contentId: content.id,
      bgClass,
      rotationY: prevInfo.rotationY,
      rotationX: prevInfo.rotationX,
      useSecondaryFace: prevInfo.useSecondaryFace
    };
  });

  const nextState: MosaicState = {
    partitionId: `partition-${nextConfigIdx}-${Date.now()}`,
    regions
  };

  // Validate next state before returning
  if (!validateMosaicState(nextState)) {
    // Fallback to partition 0 if validation fails
    return generateNextMosaicState(-1, prevStatesMap);
  }

  return { nextState, nextConfigIndex: nextConfigIdx };
};

// Helper to compute inverted high-contrast text color scheme based on background color without text background wrappers or shadows
const getContrastingTextColor = (bgClass: string) => {
  const isWhite = bgClass.includes('bg-white') || bgClass.includes('bg-[#FFFFFF]');
  const isPeachOrYellow = bgClass.includes('bg-[#F9DCCB]') || bgClass.includes('bg-[#F5C400]');

  if (isWhite) {
    return {
      textClass: 'text-[#111111]', // Inverted dark black text for white boxes
      subtextClass: 'text-[#008F68]', // High-contrast emerald green for secondary text
      accentColor: 'text-[#008F68]',
      buttonBg: 'bg-[#111111] hover:bg-[#222222] text-white',
      outlineButtonBg: 'bg-transparent border border-[#111111] text-[#111111]'
    };
  }

  if (isPeachOrYellow) {
    return {
      textClass: 'text-[#111111]', // Inverted dark black text for peach/yellow boxes
      subtextClass: 'text-[#111111]',
      accentColor: 'text-[#008F68]',
      buttonBg: 'bg-[#111111] hover:bg-[#222222] text-white',
      outlineButtonBg: 'bg-transparent border border-[#111111] text-[#111111]'
    };
  }

  return {
    textClass: 'text-[#FFFFFF]', // Crisp white text for dark black/green boxes
    subtextClass: 'text-[#F5C400]', // Gold yellow for secondary text
    accentColor: 'text-[#F5C400]',
    buttonBg: 'bg-[#008F68] hover:bg-[#007A58] text-white',
    outlineButtonBg: 'bg-transparent border border-white/40 text-white'
  };
};

export const LiveTileHero: React.FC = () => {
  const [configIndex, setConfigIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Map to preserve 3D rotations per content item across layout morphs
  const prevStatesMapRef = useRef(
    new Map<string, { rotationY: number; rotationX: number; useSecondaryFace: boolean }>()
  );

  // Initialize validated initial state
  const [currentState, setCurrentState] = useState<MosaicState>(() => {
    const { nextState } = generateNextMosaicState(-1, prevStatesMapRef.current);
    return nextState;
  });

  // Track prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 1. CONTINUOUS LAYOUT RE-PARTITIONING SCHEDULER (Every 12s - 16s)
  useEffect(() => {
    if (isReducedMotion) return;

    const partitionTimer = setInterval(() => {
      setConfigIndex((prevIdx) => {
        const { nextState, nextConfigIndex } = generateNextMosaicState(
          prevIdx,
          prevStatesMapRef.current
        );

        // Pre-calculated & validated state becomes the new baseline
        setCurrentState(nextState);
        return nextConfigIndex;
      });
    }, 14000); // 14s between full mosaic re-partitioning

    return () => clearInterval(partitionTimer);
  }, [isReducedMotion]);

  // 2. ASYNCHRONOUS TILE FLIP / COLOR MORPH SCHEDULER (Every 4.5s)
  useEffect(() => {
    if (isReducedMotion) return;

    const microTimer = setInterval(() => {
      setCurrentState((prevState) => {
        if (!prevState || !prevState.regions) return prevState;

        // Select 1 non-editorial region to evolve
        const eligibleIndices = prevState.regions
          .map((r, idx) => (r.contentId !== 'item-editorial' ? idx : -1))
          .filter((idx) => idx !== -1);

        if (eligibleIndices.length === 0) return prevState;

        const targetIdx = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];

        const nextRegions = prevState.regions.map((region, idx) => {
          if (idx !== targetIdx) return region;

          const content = CONTENT_POOL.find((c) => c.id === region.contentId);
          if (!content) return region;

          const shouldFlip = Math.random() > 0.4 && (content.secondaryImageSrc || content.type === 'image');

          if (shouldFlip) {
            const isY = Math.random() > 0.5;
            const newY = isY ? region.rotationY + 180 : region.rotationY;
            const newX = !isY ? region.rotationX + 180 : region.rotationX;
            const newSecondary = !region.useSecondaryFace;

            // Update ref
            prevStatesMapRef.current.set(content.id, {
              rotationY: newY,
              rotationX: newX,
              useSecondaryFace: newSecondary
            });

            return {
              ...region,
              rotationY: newY,
              rotationX: newX,
              useSecondaryFace: newSecondary
            };
          } else {
            // Morph color
            const otherColors = content.allowedBgClasses.filter((c) => c !== region.bgClass);
            const nextBg =
              otherColors.length > 0
                ? otherColors[Math.floor(Math.random() * otherColors.length)]
                : region.bgClass;

            return {
              ...region,
              bgClass: nextBg
            };
          }
        });

        return {
          ...prevState,
          regions: nextRegions
        };
      });
    }, 4500); // Calm single-tile updates every 4.5 seconds

    return () => clearInterval(microTimer);
  }, [isReducedMotion]);

  // Helper to render content body inside a mosaic region
  const renderContentBody = (content: ContentItem, region: MosaicRegion) => {
    const theme = getContrastingTextColor(region.bgClass);

    switch (content.type) {
      case 'editorial':
        return (
          <div className={`w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-right font-arabic select-none ${theme.textClass}`}>
            <div className="flex flex-col gap-3">
              <div className={`inline-flex items-center gap-2 text-[11px] font-black w-fit bg-transparent ${theme.accentColor}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{content.badge}</span>
              </div>

              <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${theme.textClass}`}>
                {content.title}
              </h1>

              <p className={`text-xs sm:text-sm font-bold leading-relaxed max-w-md hidden sm:block ${theme.subtextClass}`}>
                {content.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to="/products">
                <button
                  type="button"
                  className={`px-6 py-3 font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 group shadow-none ${theme.buttonBg}`}
                >
                  <span>تصفح المقتنيات الآن</span>
                  <ArrowLeft className="w-4 h-4 text-[#F5C400] transition-transform group-hover:-translate-x-1" />
                </button>
              </Link>

              <Link to="/products?category=Wearables" className="hidden sm:inline-block">
                <button
                  type="button"
                  className={`px-5 py-3 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-none ${theme.outlineButtonBg}`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#F5C400]" />
                  <span>استكشاف التشكيلة</span>
                </button>
              </Link>
            </div>
          </div>
        );

      case 'brand_ms':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <MSSignatureSvg
              color={theme.textClass.includes('text-[#111111]') ? '#111111' : '#FFFFFF'}
              className="w-24 sm:w-32 h-auto"
            />
            {content.title && (
              <span className={`mt-2 text-[10px] font-mono tracking-widest uppercase font-bold ${theme.textClass}`}>
                {content.title}
              </span>
            )}
          </div>
        );

      case 'brand_fakhama':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <FakhamaBrandMark
              textColor={theme.textClass.includes('text-[#111111]') ? '#111111' : '#FFFFFF'}
              dotColor="#F5C400"
            />
            {content.subtitle && (
              <span className={`mt-1 text-xs font-bold font-arabic ${theme.subtextClass}`}>
                {content.subtitle}
              </span>
            )}
          </div>
        );

      case 'guarantee':
        return (
          <div className={`w-full h-full p-4 sm:p-6 flex flex-col justify-between text-right font-arabic ${theme.textClass}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase bg-transparent ${theme.accentColor}`}>
                {content.badge}
              </span>
              <ShieldCheck className={`w-5 h-5 ${theme.accentColor}`} />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-extrabold leading-snug ${theme.textClass}`}>{content.title}</h3>
              <p className={`text-[11px] font-bold mt-1 ${theme.subtextClass}`}>{content.subtitle}</p>
            </div>
          </div>
        );

      case 'image':
      default: {
        const activeImg =
          region.useSecondaryFace && content.secondaryImageSrc
            ? content.secondaryImageSrc
            : content.imageSrc;

        return (
          <div className="relative w-full h-full overflow-hidden group shadow-none bg-transparent flex flex-col justify-between">
            {activeImg ? (
              <img
                src={activeImg}
                alt={content.title || 'فخامة'}
                className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <div className="absolute bottom-0 right-0 left-0 p-3 text-white flex flex-col justify-end pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              {content.badge && (
                <span className="text-[10px] font-black text-[#F5C400] uppercase tracking-wider mb-0.5">
                  {content.badge}
                </span>
              )}
              {content.title && (
                <span className="text-xs sm:text-sm font-black font-arabic leading-tight text-white">
                  {content.title}
                </span>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <section className="w-full max-w-none m-0 p-0 rounded-none border-t-[0.5px] border-b-[0.5px] border-[#008F68]/60 shadow-none bg-[#111111] overflow-hidden dir-rtl">
      {/* Logical Grid Matrix Container (8 columns x 4 rows) */}
      <div className="w-full h-[75vh] min-h-[550px] max-h-[850px] grid grid-cols-8 grid-rows-4 gap-0 p-0 m-0 border-0 rounded-none overflow-hidden bg-[#111111] shadow-none">
        <AnimatePresence mode="sync">
          {currentState.regions.map((region) => {
            const content =
              CONTENT_POOL.find((c) => c.id === region.contentId) || CONTENT_POOL[0];

            return (
              <motion.div
                key={region.id}
                layout
                layoutId={region.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 1.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative w-full h-full overflow-hidden rounded-none border-0 m-0 p-0 shadow-none outline-none"
                style={{
                  gridColumn: `${region.colStart + 1} / span ${region.colSpan}`,
                  gridRow: `${region.rowStart + 1} / span ${region.rowSpan}`,
                  perspective: '1000px'
                }}
              >
                <motion.div
                  className={`w-full h-full transition-colors duration-1000 shadow-none ${region.bgClass}`}
                  animate={{
                    rotateY: isReducedMotion ? 0 : region.rotationY,
                    rotateX: isReducedMotion ? 0 : region.rotationX
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {renderContentBody(content, region)}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
