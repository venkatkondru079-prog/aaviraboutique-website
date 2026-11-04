import React, { useState } from 'react';
import { Sparkles, ArrowRight, MessageCircle, Clock, ChevronDown, ChevronUp, Bell, Check, Tag } from 'lucide-react';
import { PageTab } from '../types';

interface FestiveAdPosterProps {
  onNavigate: (tab: PageTab) => void;
  onSelectCategory?: (category: string) => void;
}

export const FestiveAdPoster: React.FC<FestiveAdPosterProps> = ({ onNavigate, onSelectCategory }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  const handleStoreClick = () => {
    if (onSelectCategory) {
      onSelectCategory('all');
    }
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDailyWearClick = () => {
    if (onSelectCategory) {
      onSelectCategory('daily-wear');
    }
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyReminder = () => {
    const text = 'Aavira Boutique Dusshera Offer: Sarees starting from Rs. 200/- only! Sale starts 12th October (Limited Offer). Visit: ' + window.location.origin;
    navigator.clipboard?.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 3000);
  };

  const whatsappInquiryUrl = `https://wa.me/919347159353?text=${encodeURIComponent(
    'Hello Aavira Boutique! I saw the Dusshera Offer poster (Sale starts 12th October, Sarees from Rs. 200/-). Please share catalog details and offer terms.'
  )}`;

  if (isMinimized) {
    return (
      <aside aria-label="Festive Announcement" className="relative z-30 bg-gradient-to-r from-[#3B0710] via-[#5C0A1A] to-[#3B0710] text-[#FFF6E5] border-b border-[#D4AF37]/50 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-base select-none" role="img" aria-label="Festive Diya">🪔</span>
            <div className="flex items-center gap-2 font-medium tracking-wide truncate">
              <span className="bg-[#D4AF37] text-[#2A050B] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap">
                DUSSHERA OFFER
              </span>
              <span className="font-semibold text-[#FFD700] truncate">
                SALE STARTS FROM 12th OCTOBER: SAREE STARTS FROM Rs. 200/- ONLY
              </span>
              <span className="text-[#FF9EAA] font-bold text-[10px] hidden sm:inline uppercase">
                (LIMITED OFFER)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDailyWearClick}
              className="bg-[#5C0A1A] hover:bg-[#720D20] text-[#FFD700] border border-[#D4AF37]/40 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors hidden sm:flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Daily Wear (₹200 - ₹400)</span>
            </button>
            <button
              onClick={handleStoreClick}
              className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#2A050B] px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Explore Store</span>
              <ArrowRight size={12} />
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-[#720D20] text-[#E8DCC4] rounded transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
              title="Expand Poster"
            >
              <span className="hidden md:inline">View Poster</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <section 
      aria-label="Dusshera Mega Sale Advertisement"
      className="relative z-30 bg-[#2D060D] text-[#FFF8EB] border-b-2 border-[#D4AF37] shadow-xl overflow-hidden font-sans"
    >
      {/* Background Decorative Gradient & Festive Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-90 bg-gradient-to-r from-[#2B050B] via-[#5C0A1A] to-[#2B050B]" 
        aria-hidden="true" 
      />

      {/* Decorative Traditional Golden Arch / Radial Glows */}
      <div 
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[180px] bg-[#FFD700]/15 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-10 left-10 w-48 h-48 bg-[#E65100]/20 rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -top-10 right-10 w-48 h-48 bg-[#FFD700]/15 rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Traditional Zari Gold Border Accent Lines */}
      <div className="h-1 w-full bg-gradient-to-r from-[#800020] via-[#FFD700] via-[#F4C430] to-[#800020] opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          
          {/* Left / Center Festive Ad Poster Core Content */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4 flex-1">
            {/* Traditional Auspicious Diya / Festive Medallion */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#800020] to-[#45050F] border-2 border-[#FFD700]/70 flex items-center justify-center shrink-0 shadow-lg relative group">
              <span className="text-2xl sm:text-3xl select-none animate-pulse" role="img" aria-label="Festive Flame">🪔</span>
              <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#2A050B] text-[9px] font-extrabold px-1 rounded uppercase tracking-tighter">
                FESTIVE
              </div>
            </div>

            {/* Poster Typography & Headings */}
            <div className="space-y-1.5 min-w-0">
              {/* Kicker Tagline */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.2em] uppercase text-[#FFD700]">
                  <Sparkles size={12} className="text-[#FFD700]" />
                  AAVIRA ATELIER • DUSSHERA CELEBRATIONS
                </span>
                <span className="inline-block bg-[#E53935] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider animate-pulse">
                  LIMITED OFFER
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#F3E5AB] font-medium">
                  <Clock size={12} className="text-[#FFD700]" />
                  <span>Starts 12th October</span>
                </span>
              </div>

              {/* Grand Main Headline */}
              <div className="space-y-0.5">
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wide text-white uppercase drop-shadow-sm">
                  SALE STARTS FROM <span className="text-[#FFD700] underline decoration-[#D4AF37]/60 underline-offset-4">12th OCTOBER</span>
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                  <span className="text-sm sm:text-base lg:text-lg font-serif tracking-wider text-[#FFE8B8] font-bold">
                    WITH DUSSHERA OFFER:
                  </span>
                  <span className="inline-block bg-gradient-to-r from-[#FFD700] via-[#FFF3B0] to-[#FFD700] text-[#33050C] font-black text-base sm:text-xl lg:text-2xl px-2.5 py-0.5 rounded shadow-md tracking-wide uppercase border border-[#FFE082]">
                    SAREE STARTS FROM Rs. 200/- ONLY
                  </span>
                </div>
              </div>

              {/* Informational Subtext */}
              <p className="text-[11px] sm:text-xs text-[#EAD8BD] font-light max-w-2xl leading-relaxed">
                Auspicious Vijayadashami festive drapes, daily wear cottons, fancy festive weaves & designer sarees at unprecedented celebration prices. Limited quantities available per patron.
              </p>
            </div>
          </div>

          {/* Right Action Controls & Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t border-[#7A1527] lg:border-t-0">
            {/* Primary Action Button: Explore Store */}
            <button
              onClick={handleStoreClick}
              id="festive-banner-shop-btn"
              className="bg-gradient-to-r from-[#FFD700] via-[#F4C430] to-[#E5B520] hover:from-[#FFE066] hover:to-[#FFD700] text-[#29050B] font-bold text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer border border-[#FFF3B0]"
            >
              <Tag size={14} className="text-[#29050B]" />
              <span>EXPLORE STORE</span>
              <ArrowRight size={14} />
            </button>

            {/* Direct Daily Wear Saree Offer (Rs. 200 - 400) Button */}
            <button
              onClick={handleDailyWearClick}
              id="festive-banner-daily-wear-btn"
              className="bg-[#660C1D] hover:bg-[#851328] text-[#FFD700] hover:text-white border border-[#FFD700]/50 font-bold text-xs uppercase tracking-wider px-3.5 sm:px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>DAILY WEAR (₹200 – ₹400)</span>
              <ArrowRight size={13} />
            </button>

            {/* WhatsApp Inquiry Button */}
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="festive-banner-whatsapp-btn"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Chat with Concierge about Dusshera Offer"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Chat</span>
            </a>

            {/* Copy / Remind Button */}
            <button
              onClick={handleCopyReminder}
              className="bg-[#480A16] hover:bg-[#630E1F] text-[#F3E5AB] text-xs font-medium px-3 py-2.5 rounded-lg border border-[#D4AF37]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy offer details to clipboard"
            >
              {copiedReminder ? (
                <>
                  <Check size={14} className="text-[#A7F3D0]" />
                  <span className="text-[#A7F3D0] text-[11px]">Saved!</span>
                </>
              ) : (
                <>
                  <Bell size={14} className="text-[#FFD700]" />
                  <span className="text-[11px] hidden md:inline">Remind Me</span>
                </>
              )}
            </button>

            {/* Minimize Toggle */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-[#E8DCC4]/70 hover:text-white hover:bg-[#5C0A1A] rounded-lg transition-colors cursor-pointer"
              title="Minimize banner"
              aria-label="Minimize festive poster banner"
            >
              <ChevronUp size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Traditional Zari Gold Border Bottom Accent Lines */}
      <div className="h-1 w-full bg-gradient-to-r from-[#800020] via-[#FFD700] via-[#F4C430] to-[#800020] opacity-80" />
    </section>
  );
};
