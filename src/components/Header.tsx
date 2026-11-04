import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ShieldCheck, ChevronDown, User, Sparkles } from 'lucide-react';
import { Currency, PageTab } from '../types';

interface HeaderProps {
  currentTab: PageTab;
  onNavigate: (tab: PageTab) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSearchSubmit: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  currency,
  onCurrencyChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onSearchSubmit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    if (currencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currencyDropdownOpen]);

  const currencies: { code: Currency; label: string; symbol: string }[] = [
    { code: 'INR', label: 'INR (₹)', symbol: '₹' },
    { code: 'USD', label: 'USD ($)', symbol: 'US$' },
    { code: 'EUR', label: 'EUR (€)', symbol: '€' },
    { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  ];

  const navLinks: { id: PageTab; label: string; fullLabel?: string; shortLabel?: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'STORE', fullLabel: 'STORE', shortLabel: 'STORE' },
    { id: 'about', label: 'About Us', shortLabel: 'About' },
    { id: 'contact', label: 'Contact', fullLabel: 'Contact & Concierge' },
    { id: 'returns', label: 'Return & Policy', fullLabel: 'Return & Policy', shortLabel: 'Return & Policy', badge: '7-Day' },
    { id: 'admin', label: 'Admin Portal', shortLabel: 'Admin', badge: 'Secure' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D5] transition-all">
      {/* Top Banner Announcement */}
      <div className="bg-[#1C1814] text-[#E8DCC4] text-[11px] sm:text-[12px] py-1.5 sm:py-2 px-3 sm:px-4 border-b border-[#352D26] w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2 tracking-wide font-sans">
          <div className="flex items-center gap-2 text-center sm:text-left truncate max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] inline-block shrink-0 animate-pulse" />
            <span className="truncate">Flagship Atelier: Ushodhya Junction</span>
            <span className="hidden md:inline text-[#C5A059]">•</span>
            <span className="hidden md:inline truncate">Complimentary insured worldwide delivery on orders over ₹50,000</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-1 text-[#C5A059]">
              <ShieldCheck size={13} className="shrink-0" />
              <span className="hidden sm:inline">100% Certified Pure Silk Mark</span>
              <span className="sm:hidden">Pure Silk</span>
            </div>

            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 bg-[#2C241D] hover:bg-[#382F26] px-2 py-0.5 rounded text-[#E8DCC4] hover:text-white border border-[#44372D] transition-colors cursor-pointer"
                id="currency-selector-btn"
                aria-expanded={currencyDropdownOpen}
                aria-label="Select currency"
              >
                <span>{currency}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-[#251E17] border border-[#4A3B2F] rounded-lg shadow-xl py-1 z-50 animate-fadeIn">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        currency === c.code ? 'text-[#C5A059] font-bold bg-[#332920]' : 'text-[#D2C5B2] hover:bg-[#332920]'
                      }`}
                    >
                      <span>{c.code}</span>
                      <span className="text-[#A3927B]">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-3 lg:gap-4 w-full">
          {/* Mobile & Tablet Menu Toggle Button */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-[#2D241E] hover:text-[#B8860B] focus:outline-none rounded-xl hover:bg-[#F2ECE1] border border-transparent hover:border-[#E8E2D5] transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div 
            className="shrink-0 cursor-pointer text-left py-1 select-none flex items-center gap-2 sm:gap-3 group" 
            onClick={() => onNavigate('home')}
            id="brand-logo-btn"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border border-[#E0D0C0] shadow-xs group-hover:border-[#C5A059] transition-all bg-[#FAF0EC] shrink-0">
              <img
                src="/aavira-logo.svg"
                alt="Aavira Haute Couture Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <span className="font-serif tracking-[0.14em] sm:tracking-[0.18em] text-lg sm:text-xl md:text-2xl font-normal text-[#1A1510] uppercase block whitespace-nowrap leading-none">
                AAVIRA
              </span>
              <span className="text-[7.5px] sm:text-[8.5px] md:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.26em] text-[#8C7A65] font-sans block mt-1 whitespace-nowrap">
                <span className="inline sm:hidden">ATELIER</span>
                <span className="hidden sm:inline">HAUTE COUTURE ATELIER</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3 shrink min-w-0">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  id={`nav-link-${link.id}`}
                  className={`text-[11px] xl:text-[12px] 2xl:text-[13px] tracking-wider uppercase transition-all py-1.5 px-2 xl:px-2.5 whitespace-nowrap shrink-0 relative rounded-md cursor-pointer ${
                    isActive
                      ? 'text-[#B8860B] font-semibold bg-[#F5EFE6]/80'
                      : 'text-[#4A3E33] hover:text-[#1A1510] hover:bg-[#F2ECE1]/70 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="hidden 2xl:inline">{link.fullLabel || link.label}</span>
                    <span className="hidden xl:inline 2xl:hidden">{link.label}</span>
                    <span className="xl:hidden">{link.shortLabel || link.label}</span>
                    {link.badge && (
                      <span className="bg-[#1C1814] text-[#C5A059] text-[8.5px] xl:text-[9px] px-1.5 py-0.5 rounded-full font-sans tracking-normal border border-[#C5A059]/40 whitespace-nowrap font-normal">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#B8860B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons Group (Clean, Isolated & Non-Overlapping) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                searchOpen
                  ? 'bg-[#B8860B] text-white shadow-xs'
                  : 'text-[#4A3E33] hover:text-[#B8860B] hover:bg-[#F2ECE1] border border-transparent hover:border-[#E8E2D5]'
              }`}
              title="Search Catalog"
              id="search-toggle-btn"
              aria-label="Search Catalog"
            >
              <Search size={18} />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#4A3E33] hover:text-[#B8860B] hover:bg-[#F2ECE1] border border-transparent hover:border-[#E8E2D5] transition-all relative shrink-0 cursor-pointer"
              title="Wishlist"
              id="wishlist-btn"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-[#FAF8F5] shadow-xs pointer-events-none">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#1C1814] text-[#F3EBD4] hover:bg-[#2C241D] hover:text-[#C5A059] border border-[#352D26] transition-all relative shrink-0 shadow-sm cursor-pointer"
              title="Shopping Bag"
              id="cart-bag-btn"
              aria-label={`Shopping Bag (${cartCount} items)`}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C5A059] text-[#1C1814] text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-[#FAF8F5] shadow-xs pointer-events-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* VIP Client Account Button */}
            <button
              onClick={() => onNavigate('account')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                currentTab === 'account'
                  ? 'bg-[#B8860B] text-white shadow-xs'
                  : 'text-[#4A3E33] hover:text-[#B8860B] hover:bg-[#F2ECE1] border border-transparent hover:border-[#E8E2D5]'
              }`}
              title="VIP Client Account"
              id="user-account-btn"
              aria-label="VIP Client Account"
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="py-3 px-3 sm:px-4 border-t border-[#E8E2D5] bg-[#FAF8F5] animate-fadeIn shadow-xs">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A65] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search daily wear, designer, soft silk, wedding bridal sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-[#D9D0C1] rounded-lg pl-10 pr-4 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-all shadow-2xs"
                  id="header-search-input"
                />
              </div>
              <button
                type="submit"
                className="bg-[#1C1814] text-[#F3EBD4] px-4 sm:px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] hover:text-[#C5A059] transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
                id="header-search-submit-btn"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#736352] hover:text-[#1A1510] hover:bg-[#EAE2D5] transition-colors shrink-0 cursor-pointer"
                title="Close Search"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile & Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E2D5] py-3 px-2 bg-[#FAF8F5] shadow-inner animate-fadeIn">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    id={`mobile-nav-${link.id}`}
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'text-[#B8860B] font-bold bg-[#F2ECE1] border-l-3 border-[#B8860B]'
                        : 'text-[#4A3E33] hover:bg-[#F5F0E6] hover:text-[#1A1510] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{link.fullLabel || link.label}</span>
                    </span>
                    {link.badge && (
                      <span className="bg-[#1C1814] text-[#C5A059] text-[9.5px] px-2 py-0.5 rounded-full border border-[#C5A059]/40 shrink-0 font-normal">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick customer action shortcuts in mobile drawer */}
            <div className="mt-3 pt-3 border-t border-[#E8E2D5] px-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenWishlist();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-white border border-[#E0D5C5] text-xs text-[#4A3E33] hover:text-[#B8860B] hover:border-[#B8860B] transition-colors cursor-pointer"
              >
                <Heart size={14} className="text-[#800020]" />
                <span>Wishlist ({wishlistCount})</span>
              </button>
              <button
                onClick={() => {
                  onOpenCart();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#1C1814] text-white text-xs hover:bg-[#332920] transition-colors cursor-pointer"
              >
                <ShoppingBag size={14} className="text-[#C5A059]" />
                <span>Cart Bag ({cartCount})</span>
              </button>
            </div>

            <div className="pt-3 mt-3 border-t border-[#E8E2D5] px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div>
                <p className="text-[11px] text-[#8C7A65] font-serif italic">Bespoke Couture Inquiries:</p>
                <p className="font-semibold text-[#1A1510]">+91 9347159353 • aavira.bo@gmail.com</p>
              </div>
              <div className="text-[11px] text-[#736352]">
                100% Certified Pure Silk Mark
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
