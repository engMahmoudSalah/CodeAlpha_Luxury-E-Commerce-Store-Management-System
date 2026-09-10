import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { SearchAutocomplete } from '../product/SearchAutocomplete';
import { commerceStore } from '../../shared/store/commerceStore';
import { commerceEventBus } from '../../shared/events/commerceEvents';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  GitCompare,
  Truck,
  Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { cartCount, openMiniCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [settings, setSettings] = useState(() => commerceStore.getStoreSettings());
  const [dbCategories, setDbCategories] = useState(() => commerceStore.getCategories());

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(true);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync settings and categories via commerceEventBus
  useEffect(() => {
    const unsubSettings = commerceEventBus.subscribe('SETTINGS_UPDATED', (newSettings) => {
      setSettings(newSettings);
    });
    const unsubCat = commerceEventBus.subscribe('CATEGORY_CREATED', () => {
      setDbCategories(commerceStore.getCategories());
    });
    const unsubCatUpdate = commerceEventBus.subscribe('CATEGORY_UPDATED', () => {
      setDbCategories(commerceStore.getCategories());
    });
    const unsubCatDel = commerceEventBus.subscribe('CATEGORY_DELETED', () => {
      setDbCategories(commerceStore.getCategories());
    });

    return () => {
      unsubSettings();
      unsubCat();
      unsubCatUpdate();
      unsubCatDel();
    };
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  // Close all menus on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDesktopMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to accurately check active state including query params
  const isPathActive = (targetPath: string) => {
    const currentFullPath = location.pathname + location.search;
    if (targetPath === '/') {
      return location.pathname === '/' && !location.search;
    }
    if (targetPath.includes('?')) {
      return currentFullPath === targetPath;
    }
    if (targetPath === '/products') {
      return location.pathname === '/products' && (!location.search || location.search === '');
    }
    return location.pathname === targetPath;
  };

  const isProductsActive =
    location.pathname === '/products' ||
    location.pathname.startsWith('/products/');

  const productSubLinks = [
    { label: 'جميع المقتنيات', path: '/products', desc: 'استكشف كافة الابتكارات والمقتنيات الفاخرة' },
    ...(dbCategories.length > 0
      ? dbCategories.slice(0, 5).map((c) => ({
          label: c.name,
          path: `/products?category=${encodeURIComponent(c.name)}`,
          desc: c.description || `استكشف مقتنيات ${c.name}`,
        }))
      : [
          { label: 'الأنظمة الصوتية', path: '/products?category=Audio', desc: 'سماعات ومكبرات صوت فائقة النقاء' },
          { label: 'الساعات الفاخرة', path: '/products?category=Wearables', desc: 'تصاميم هجينة وتقنيات ارتداء نادرة' },
        ]),
  ];

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const announcementText = settings?.announcementText || 'شحن مؤمّن وسريع لكافة مقتنيات نادي فخامة | ضمان الأصالة والرد الفوري';
  const showAnnouncement = settings?.announcementEnabled !== false;

  return (
    <>
      {/* Top Announcement Ribbon with Original Brand Background - Scrolls away */}
      {showAnnouncement && (
        <div className="bg-[#00875A] text-[#FAF8F3] text-[11px] sm:text-xs font-bold py-1.5 border-b border-[#00704A] select-none relative z-40 w-full" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-center overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC700] shrink-0 animate-pulse" />
            <span className="truncate">{announcementText}</span>
            <span className="hidden md:inline-block text-[#FFC700] font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
              {settings?.storeName ? settings.storeName.toUpperCase() : 'LUXE CLUB'}
            </span>
          </div>
        </div>
      )}

      {/* Main Nav Bar Header - Sticky at top-0 */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent border-b border-transparent shadow-none'
            : 'bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E8E3D8] shadow-xs'
        }`}
        dir="rtl"
      >
        
        {/* DESKTOP HEADER (lg and up) */}
        <div className="hidden lg:grid grid-cols-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 items-center gap-4">
          
          {/* Right Section (RTL Right): Openable Navigation Menu Bar */}
          <div className="flex items-center justify-start">
            <div ref={desktopMenuRef} className="relative">
              {/* Menu Trigger Capsule */}
              <button
                type="button"
                onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all cursor-pointer font-extrabold text-xs shadow-2xs ${
                  isDesktopMenuOpen
                    ? isTransparent
                      ? 'bg-[#00E676] text-[#021811] border-[#00E676]'
                      : 'bg-[#00875A] text-white border-[#00875A]'
                    : isTransparent
                      ? 'bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20'
                      : 'bg-white text-[#181818] border-[#E8E3D8] hover:bg-[#EFECE5]'
                }`}
              >
                <Menu className={`w-4 h-4 transition-colors ${
                  isDesktopMenuOpen 
                    ? (isTransparent ? 'text-[#021811]' : 'text-white') 
                    : (isTransparent ? 'text-[#00E676]' : 'text-[#00875A]')
                }`} />
                <span>القائمة</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDesktopMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Expandable Dropdown Popover */}
              {isDesktopMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white border border-[#E8E3D8] shadow-2xl p-2.5 z-50 animate-fadeIn text-xs font-bold text-[#181818]" dir="rtl">
                  <div className="px-3 py-2 border-b border-[#E8E3D8] mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8C887F] uppercase tracking-wider">تصفح أقسام فخامة</span>
                    <span className="w-2 h-2 rounded-full bg-[#00875A]" />
                  </div>

                  <div className="flex flex-col gap-1">
                    {/* الرئيسية */}
                    <Link
                      to="/"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isPathActive('/')
                          ? 'bg-[#00875A] text-white font-extrabold'
                          : 'hover:bg-[#FAF8F3] text-[#181818]'
                      }`}
                    >
                      <span>الرئيسية</span>
                      {isPathActive('/') && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>

                    {/* المنتجات (With Expandable Sub-items) */}
                    <div className="flex flex-col rounded-xl border border-[#E8E3D8] bg-[#FAF8F3] overflow-hidden my-0.5">
                      <button
                        type="button"
                        onClick={() => setIsProductsDropdownOpen((prev) => !prev)}
                        className="w-full p-2.5 text-right flex items-center justify-between text-[#181818] font-extrabold cursor-pointer hover:bg-white transition-colors"
                      >
                        <span>المنتجات</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#8C887F] transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isProductsDropdownOpen && (
                        <div className="p-1.5 pt-0 flex flex-col gap-1 border-t border-[#E8E3D8] bg-white">
                          {productSubLinks.map((sub) => {
                            const active = isPathActive(sub.path);
                            return (
                              <Link
                                key={`desktop-${sub.path}`}
                                to={sub.path}
                                onClick={() => setIsDesktopMenuOpen(false)}
                                className={`p-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                                  active
                                    ? 'bg-[#00875A] text-white font-extrabold'
                                    : 'text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F3]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{sub.label}</span>
                                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className={`text-[10px] ${active ? 'text-white/80' : 'text-[#8C887F]'}`}>
                                  {sub.desc}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* دليل المقارنة */}
                    <Link
                      to="/compare"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isPathActive('/compare')
                          ? 'bg-[#00875A] text-white font-extrabold'
                          : 'hover:bg-[#FAF8F3] text-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-[#00875A]" />
                        <span>دليل المقارنة</span>
                      </div>
                      {isPathActive('/compare') && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>

                    {/* تتبع الشحنة */}
                    <Link
                      to="/track-order"
                      onClick={() => setIsDesktopMenuOpen(false)}
                      className={`p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isPathActive('/track-order')
                          ? 'bg-[#00875A] text-white font-extrabold'
                          : 'hover:bg-[#FAF8F3] text-[#181818]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#00875A]" />
                        <span>تتبع الشحنة</span>
                      </div>
                      {isPathActive('/track-order') && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Section: Logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center gap-2 group select-none shrink-0">
              <span className={`text-3xl font-black tracking-tight font-arabic flex items-center gap-1.5 transition-colors duration-300 ${
                isTransparent ? 'text-white group-hover:text-[#00E676]' : 'text-[#181818]'
              }`}>
                <span>فخامة</span>
                <span className={`w-2.5 h-2.5 rounded-full inline-block shadow-xs transition-colors duration-300 ${
                  isTransparent ? 'bg-[#00E676]' : 'bg-[#FFC700]'
                }`} />
              </span>
            </Link>
          </div>

          {/* Left Section (RTL Left): Action Icons & Profile */}
          <div className="flex items-center justify-end gap-2.5">
            
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="بحث"
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isSearchOpen
                    ? isTransparent
                      ? 'bg-[#00E676] text-[#021811]'
                      : 'bg-[#00875A] text-white'
                    : isTransparent
                      ? 'text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20'
                      : 'text-[#181818] bg-white hover:bg-[#EFECE5] border border-[#E8E3D8]'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white border border-[#E8E3D8] rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn" dir="rtl">
                  <SearchAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={(q) => {
                      navigate(`/products?search=${encodeURIComponent(q.trim())}`);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    placeholder="ابحث عن مقتنى فاخر..."
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="المفضلة"
              className={`relative p-2.5 rounded-full transition-all cursor-pointer border ${
                isTransparent
                  ? 'text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20'
                  : 'text-[#181818] bg-white hover:bg-[#EFECE5] border-[#E8E3D8]'
              }`}
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border transition-colors ${
                  isTransparent
                    ? 'bg-[#00E676] text-[#021811] border-black/10'
                    : 'bg-[#00875A] text-white border-white/30'
                }`}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Bag */}
            <button
              type="button"
              onClick={openMiniCart}
              aria-label="الحقيبة"
              className={`relative p-2.5 rounded-full transition-all cursor-pointer border ${
                isTransparent
                  ? 'text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20'
                  : 'text-[#181818] bg-white hover:bg-[#EFECE5] border-[#E8E3D8]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border transition-colors ${
                  isTransparent
                    ? 'bg-[#00E676] text-[#021811] border-black/10'
                    : 'bg-[#00875A] text-white border-white/30'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            <div className={`w-px h-5 mx-1 transition-colors ${isTransparent ? 'bg-white/20' : 'bg-[#E8E3D8]'}`} />

            {/* User Account */}
            <div ref={userDropdownRef} className="relative">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                    isTransparent
                      ? 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                      : 'bg-white hover:bg-[#F3EFE6] border-[#E8E3D8] text-[#181818]'
                  }`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 border border-white/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                      isTransparent
                        ? 'bg-[#00E676] text-[#021811]'
                        : 'bg-[#00875A] text-white'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                    isTransparent
                      ? 'bg-[#00E676] hover:bg-[#00c853] text-[#021811]'
                      : 'bg-[#00875A] hover:bg-[#00704A] text-white'
                  }`}
                >
                  <User className={`w-3.5 h-3.5 transition-colors ${isTransparent ? 'text-[#021811]' : 'text-white'}`} />
                  <span>الدخول</span>
                </button>
              )}

              {/* User Dropdown */}
              {isUserDropdownOpen && isAuthenticated && user && (
                <div className="absolute left-0 mt-3 w-52 rounded-2xl bg-white border border-[#E8E3D8] shadow-2xl py-1.5 z-50 animate-fadeIn text-xs">
                  <div className="px-4 py-2 border-b border-[#E8E3D8] bg-[#FAF8F3] rounded-t-2xl">
                    <p className="font-extrabold text-[#181818] truncate">{user.name}</p>
                    <p className="text-[#8C887F] truncate text-[11px] mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#00875A] hover:bg-[#FAF8F3] transition-colors font-bold border-b border-[#E8E3D8]"
                      >
                        <Shield className="w-4 h-4 text-[#00875A]" />
                        <span>لوحة تحكم الإدارة</span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F3] transition-colors font-semibold"
                    >
                      <User className="w-4 h-4 text-[#181818]" />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F3] transition-colors font-semibold"
                    >
                      <Package className="w-4 h-4 text-[#181818]" />
                      <span>طلباتي السابقة</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F3] transition-colors font-semibold"
                    >
                      <Heart className="w-4 h-4 text-[#181818]" />
                      <span>قائمة الرغبات ({wishlistCount})</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#E8E3D8] pt-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-right cursor-pointer font-bold rounded-b-2xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* MOBILE HEADER (lg:hidden) */}
        <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          
          {/* Right Side (RTL Right): Menu Toggle Button */}
          <div className="flex items-center z-10">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="القائمة"
              className={`p-2 rounded-full active:scale-95 transition-all cursor-pointer shadow-2xs border ${
                isTransparent
                  ? 'text-white bg-white/10 backdrop-blur-md border-white/20'
                  : 'text-[#181818] bg-white border-[#E8E3D8]'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link to="/" className="flex items-center gap-1.5 select-none">
              <span className={`text-2xl font-black tracking-tight font-arabic flex items-center gap-1 transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-[#181818]'
              }`}>
                <span>فخامة</span>
                <span className={`w-2 h-2 rounded-full inline-block shadow-xs transition-colors duration-300 ${
                  isTransparent ? 'bg-[#00E676]' : 'bg-[#FFC700]'
                }`} />
              </span>
            </Link>
          </div>

          {/* Left Side (RTL Left): Shopping Bag Icon */}
          <div className="flex items-center z-10">
            <button
              type="button"
              onClick={openMiniCart}
              aria-label="حقيبة التسوق"
              className={`relative p-2 rounded-full transition-colors cursor-pointer shadow-2xs border ${
                isTransparent
                  ? 'text-white bg-white/10 backdrop-blur-md border-white/20'
                  : 'text-[#181818] bg-white border-[#E8E3D8]'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -left-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border transition-colors ${
                  isTransparent
                    ? 'bg-[#00E676] text-[#021811] border-black/10'
                    : 'bg-[#00875A] text-white border-white/30'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#FAF8F3] border-b border-[#E8E3D8] shadow-2xl p-4 z-50 flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-slideDown text-[#181818]" dir="rtl">
            
            {/* Search Bar in Mobile Menu */}
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={(q) => {
                navigate(`/products?search=${encodeURIComponent(q.trim())}`);
                setIsMobileMenuOpen(false);
                setSearchQuery('');
              }}
              placeholder="ابحث عن مقتنى فاخر..."
            />

            {/* Main Mobile Navigation */}
            <nav className="flex flex-col gap-1 text-xs font-bold">
              {/* الرئيسية */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                  isPathActive('/')
                    ? 'bg-[#00875A] text-white font-extrabold'
                    : 'text-[#181818] hover:bg-[#EFECE5]'
                }`}
              >
                <span>الرئيسية</span>
                <ArrowLeft className="w-3.5 h-3.5 opacity-60" />
              </Link>

              {/* المنتجات (Accordion / Expandable) */}
              <div className="flex flex-col rounded-xl border border-[#E8E3D8] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileProductsOpen((prev) => !prev)}
                  className="w-full px-4 py-3 text-right flex items-center justify-between text-[#181818] font-extrabold cursor-pointer"
                >
                  <span>المنتجات</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileProductsOpen && (
                  <div className="p-2 pt-0 flex flex-col gap-1 bg-[#FAF8F3] border-t border-[#E8E3D8]">
                    {productSubLinks.map((sub) => {
                      const active = isPathActive(sub.path);
                      return (
                        <Link
                          key={`mobile-${sub.path}`}
                          to={sub.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            active
                              ? 'bg-[#00875A] text-white font-extrabold'
                              : 'text-[#5A5852] hover:text-[#181818] hover:bg-white'
                          }`}
                        >
                          <span>{sub.label}</span>
                          <span className="text-[10px] opacity-75">{sub.desc.split(' ')[0]}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* دليل المقارنة */}
              <Link
                to="/compare"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                  isPathActive('/compare')
                    ? 'bg-[#00875A] text-white font-extrabold'
                    : 'text-[#181818] hover:bg-[#EFECE5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4" />
                  <span>دليل المقارنة</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 opacity-60" />
              </Link>

              {/* تتبع الشحنة */}
              <Link
                to="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                  isPathActive('/track-order')
                    ? 'bg-[#00875A] text-white font-extrabold'
                    : 'text-[#181818] hover:bg-[#EFECE5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>تتبع الشحنة</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </nav>

            {/* Quick Action Buttons Grid inside Mobile Drawer */}
            <div className="pt-3 border-t border-[#E8E3D8] flex flex-col gap-2">
              <p className="text-[10px] font-extrabold text-[#8C887F] uppercase tracking-wider px-1">الحساب والتفضيلات</p>

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E3D8] text-[#181818] font-bold text-xs flex items-center justify-between hover:bg-[#EFECE5] transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                  <span>المفضلة</span>
                </div>
                {wishlistCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#00875A] text-white text-[10px] font-extrabold">
                    {wishlistCount} مقتنى
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8C887F]">فارغة</span>
                )}
              </Link>

              {/* Auth / Profile Area */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-[#E8E3D8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-[#181818]">{user.name}</p>
                      <p className="text-[11px] text-[#8C887F]">{user.email}</p>
                    </div>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E8E3D8]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2 px-3 rounded-lg bg-[#00875A]/10 border border-[#00875A]/30 text-center text-xs font-bold text-[#00875A] hover:bg-[#00875A]/20 flex items-center justify-center gap-1.5 mt-1"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>لوحة تحكم الإدارة</span>
                    </Link>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E3D8]">
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1.5 px-3 rounded-lg bg-[#FAF8F3] text-center text-xs font-bold text-[#181818] hover:bg-[#EFECE5]"
                    >
                      الملف الشخصي
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1.5 px-3 rounded-lg bg-[#FAF8F3] text-center text-xs font-bold text-[#181818] hover:bg-[#EFECE5]"
                    >
                      طلباتي
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-center mt-1 cursor-pointer"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-3 bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-extrabold rounded-xl text-center cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
