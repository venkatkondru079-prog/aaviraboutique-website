import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  Globe,
  Scissors,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, Currency, PageTab } from '../types';
import { ProductCard } from '../components/ProductCard';
import { RamaniPortrait } from '../components/common/RamaniPortrait';
import {
  getCustomProductImage,
  getCategoryCustomImage,
} from '../utils/productImageStore';

interface EditorialSlide {
  image: string;
  caption: string;
  tag: string;
}

interface HomeViewProps {
  products: Product[];
  currency: Currency;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onNavigate: (tab: PageTab) => void;
  onSelectCategory: (category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  currency,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onNavigate,
  onSelectCategory,
}) => {
  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  // Listen for real-time image updates across components
  useEffect(() => {
    const handleUpdate = () => setImageRefreshKey((k) => k + 1);
    window.addEventListener('aavira:product-image-updated', handleUpdate);
    return () => window.removeEventListener('aavira:product-image-updated', handleUpdate);
  }, []);

  // Curate highlighted creations across the 5 saree categories
  const dharmavaramProd =
    products.find((p) => p.category === 'dharmavaram-silk') ||
    products.find((p) => p.id === 'sar-dvs-001');
  const venkatagiriSilkProd =
    products.find((p) => p.category === 'venkatagiri-silk') ||
    products.find((p) => p.id === 'sar-vgs-001');
  const dailyWearProd =
    products.find((p) => p.category === 'daily-wear') ||
    products.find((p) => p.id === 'sar-dw-001');
  const dailyWearProducts = products
    .filter((p) => p.category === 'daily-wear')
    .sort((a, b) => a.priceINR - b.priceINR);
  const bridalProd =
    products.find((p) => p.category === 'bridal-sarees') ||
    products.find((p) => p.id === 'sar-br-001');

  const featuredCreations = [
    ...(dharmavaramProd ? [dharmavaramProd] : []),
    ...(venkatagiriSilkProd ? [venkatagiriSilkProd] : []),
    ...(dailyWearProd ? [dailyWearProd] : []),
    ...(bridalProd ? [bridalProd] : []),
  ];
  const displayedCreations =
    featuredCreations.length === 4 ? featuredCreations : products.slice(0, 4);

  // Dynamic editorial slides with reactive image overrides
  const editorialSlides: EditorialSlide[] = [
    {
      image: '/assets/sarees/wedding-bridal-1-a.jpg',
      caption: 'Pure 3-Shuttle Korvai Wedding Bridal Pattu & 24K Gilded Zari',
      tag: 'Look 01 • Bridal Sarees (5 Sarees)',
    },
    {
      image: getCustomProductImage('sar-dvs-001', '/assets/sarees/semi-pattu-1-a.jpg'),
      caption: 'Royal Broad Temple Borders & Opulent Double-Shuttle Brocade',
      tag: 'Look 02 • Dharmavaram Silk Sarees (4 Sarees)',
    },
    {
      image: getCustomProductImage('sar-vgs-001', '/assets/sarees/soft-silk-2-a.jpg'),
      caption: 'Featherlight 100-Count Handloom Silk with Jamdani Zari Buttas',
      tag: 'Look 03 • VenkataGiri Silk Sarees (10 Sarees)',
    },
    {
      image: getCustomProductImage('sar-vgv-001', '/assets/sarees/vintage-1-a.jpg'),
      caption: 'Heirloom Pit-Loom Tapestry Weaves & Revived Historic Motifs',
      tag: 'Look 04 • VenkataGiri Vintage Sarees (6 Sarees)',
    },
    {
      image: getCustomProductImage('sar-dw-002', '/assets/sarees/Dail wear sarees 02.webp'),
      caption: 'Breathable Organic Mulmul Cotton & Linen Weaves • ₹200 to ₹400',
      tag: 'Look 05 • Daily Wear Sarees (30 Sarees)',
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Automatically advance background slideshow every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % editorialSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [editorialSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + editorialSlides.length) % editorialSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % editorialSlides.length);
  };


  return (
    <div className="font-sans space-y-20 pb-20">
      {/* 1. Hero Editorial Section with Automatic Background Image Slideshow */}
      <section 
        className="relative min-h-[85vh] flex items-center justify-center bg-[#18130E] text-white overflow-hidden"
        id="hero-editorial-section"
      >
        {/* Background Image Slideshow with smooth crossfade & Ken Burns effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {editorialSlides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            return (
              <div
                key={slide.tag}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-40 z-0' : 'opacity-0 -z-10 pointer-events-none'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.caption}
                  className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
          {/* Luxury dark gradient overlays for typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14100C] via-[#14100C]/60 to-[#14100C]/40 z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#14100C]/30 to-[#14100C]/70 z-[1] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF4E8]/10 backdrop-blur-md border border-[#C5A059]/40 text-[#E8DCC4] text-xs uppercase tracking-[0.25em] mb-6 transition-all duration-300">
            <Sparkles size={13} className="text-[#C5A059] animate-pulse" />
            <span>Autumn / Winter Couture Editorial</span>
            <span className="text-[#C5A059]/60 hidden sm:inline">•</span>
            <span className="text-[#E0D2BD] font-serif italic capitalize tracking-normal text-[11px] hidden sm:inline">
              {editorialSlides[currentSlideIndex]?.tag}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-wide text-[#FAF8F5] leading-tight mb-6 drop-shadow-md text-center">
            Clothing That Defines <span className="italic font-normal text-[#C5A059]">Your Legacy</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#D4C8B5] leading-relaxed font-light mb-10 drop-shadow-xs">
            Immerse yourself in authentic handcrafted luxury. Hand-spun mulberry silks, tested 24K gold zari,
            and bespoke silhouettes masterminded in our Visakhapatnam atelier.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto bg-[#C5A059] text-[#14100C] hover:bg-[#D9B774] px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
              id="hero-explore-collection-btn"
            >
              <span>Explore Collection</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="w-full sm:w-auto border border-[#E8DCC4]/50 hover:border-[#E8DCC4] text-[#FAF8F5] hover:bg-white/10 px-8 py-4 rounded-sm text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="hero-our-heritage-btn"
            >
              <span>Our Heritage & Guilds</span>
            </button>
          </div>
        </div>

        {/* Subtle Slide Navigation Controls & Indicators */}
        <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrevSlide}
            className="w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous editorial slide"
            title="Previous slide"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="flex items-center gap-2">
            {editorialSlides.map((slide, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all duration-500 cursor-pointer rounded-full ${
                  idx === currentSlideIndex 
                    ? 'w-7 h-1.5 bg-[#C5A059] shadow-sm' 
                    : 'w-2 h-1.5 bg-[#FAF4E8]/40 hover:bg-[#FAF4E8]/70'
                }`}
                aria-label={`Switch to slide ${idx + 1}: ${slide.caption}`}
                title={slide.caption}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextSlide}
            className="w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next editorial slide"
            title="Next slide"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* 2. Pillars of Excellence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-white rounded-xl border border-[#E8E0D2] shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#FAF4E8] text-[#B8860B] shrink-0 border border-[#EEDBBA]">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#1A1510] uppercase tracking-wider">Handcrafted Zari</h3>
              <p className="text-xs text-[#736352] mt-1 leading-relaxed">
                Woven on traditional Korvai pit looms with verified pure gold & silver electroplating.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#FAF4E8] text-[#B8860B] shrink-0 border border-[#EEDBBA]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#1A1510] uppercase tracking-wider">Certified Silk Mark</h3>
              <p className="text-xs text-[#736352] mt-1 leading-relaxed">
                100% natural Mulberry & Tussar silk verified by the Central Silk Board of India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#FAF4E8] text-[#B8860B] shrink-0 border border-[#EEDBBA]">
              <Globe size={22} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#1A1510] uppercase tracking-wider">Global Express</h3>
              <p className="text-xs text-[#736352] mt-1 leading-relaxed">
                Complimentary insured delivery to 45+ countries on couture orders exceeding ₹50,000.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#FAF4E8] text-[#B8860B] shrink-0 border border-[#EEDBBA]">
              <Scissors size={22} />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#1A1510] uppercase tracking-wider">Concierge Fitting</h3>
              <p className="text-xs text-[#736352] mt-1 leading-relaxed">
                Personalized virtual and in-person bridal consultations with Managing Director Mrs. K. Ramani.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Haute Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2" id="home-portfolios-heading">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">Curation of Grandeur</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1510]">
            The Saree Portfolios
          </h2>
          <p className="text-xs text-[#736352]">
            Explore all 5 curated saree categories crafted for daily comfort, Andhra handloom heritage, and royal bridal muhurthams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[
            {
              title: 'Daily Wear Sarees',
              subtitle: '30 Sarees',
              cat: 'daily-wear',
              img: getCategoryCustomImage('daily-wear', getCustomProductImage('sar-dw-001', '/assets/sarees/Dail wear sarees 02.webp')),
              desc: 'Featherlight mulmul cotton & linen drapes. Low to High: ₹200 to ₹400.',
              product: dailyWearProd,
              badge: '₹200 – ₹400 OFFER',
            },
            {
              title: 'Dharmavaram Silk Sarees',
              subtitle: '4 Sarees',
              cat: 'dharmavaram-silk',
              img: getCategoryCustomImage('dharmavaram-silk', getCustomProductImage('sar-dvs-001', '/assets/sarees/semi-pattu-1-a.jpg')),
              desc: 'Opulent broad temple borders, Mayura motifs & heavy double-shuttle gold brocade.',
              product: dharmavaramProd,
              badge: 'Rayalaseema Heritage',
            },
            {
              title: 'VenkataGiri Silk Sarees',
              subtitle: '10 Sarees',
              cat: 'venkatagiri-silk',
              img: getCategoryCustomImage('venkatagiri-silk', getCustomProductImage('sar-vgs-001', '/assets/sarees/soft-silk-2-a.jpg')),
              desc: 'Featherlight 100-count unstarched silks with delicate Jamdani gold buttas.',
              product: venkatagiriSilkProd,
              badge: 'Royal Jamdani Weave',
            },
            {
              title: 'VenkataGiri Vintage Sarees',
              subtitle: '6 Sarees',
              cat: 'venkatagiri-vintage',
              img: getCategoryCustomImage('venkatagiri-vintage', getCustomProductImage('sar-vgv-001', '/assets/sarees/vintage-1-a.jpg')),
              desc: 'Heirloom pit-loom revivals, Kadwa interlocking & antique gold zari borders.',
              product: products.find((p) => p.category === 'venkatagiri-vintage'),
              badge: 'Heirloom Pit-Loom',
            },
            {
              title: 'Bridal Sarees',
              subtitle: '5 Sarees',
              cat: 'bridal-sarees',
              img: getCategoryCustomImage('bridal-sarees', getCustomProductImage('sar-br-001', '/assets/sarees/wedding-bridal-1-a.jpg')),
              desc: 'Heavy 3-ply pure silk with 24K electroplated gold zari & sacred Kalash motifs.',
              product: bridalProd,
              badge: 'Bridal Exclusive',
            },
          ].map((catItem) => (
            <div
              key={catItem.cat}
              onClick={() => {
                onSelectCategory(catItem.cat);
                onNavigate('shop');
              }}
              className="group relative h-96 rounded-lg overflow-hidden cursor-pointer shadow-sm border border-[#EADBCE]"
            >
              <img
                src={catItem.img}
                alt={catItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 text-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">Explore Collection</span>
                  {catItem.badge && (
                    <span className="bg-[#800020] text-[#FFD700] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#FFD700]/50 tracking-wider shadow-sm">
                      {catItem.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg text-white font-medium group-hover:text-[#C5A059] transition-colors">
                  {catItem.title}
                </h3>
                <p className="text-xs text-[#D9CEBA] font-light">{catItem.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 Dusshera Special • Daily Wear Saree Spotlight Collection (₹200 - ₹400) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-daily-wear-spotlight">
        <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] rounded-2xl border-2 border-[#D4AF37]/50 p-6 sm:p-10 shadow-md relative overflow-hidden">
          {/* Subtle decorative background watermark */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#B8860B]/5 pointer-events-none blur-2xl" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-[#E8DFC8] pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020] text-[#FFD700] text-xs uppercase tracking-widest font-bold shadow-xs">
                <span>🪔 DUSSHERA FESTIVE OFFER</span>
                <span>•</span>
                <span>PRICING FROM ₹200/- TO ₹400/- ONLY</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1510] font-normal">
                Daily Wear Sarees Collection
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5A49] leading-relaxed">
                Daily wear saree without blouse. Specially curated for effortless daily comfort and grace. Handcrafted in 100% organic mulmul cotton, breathable flax-linen blends, and authentic Kalamkari block prints. All pieces are eligible for Cash on Delivery.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  onSelectCategory('daily-wear');
                  onNavigate('shop');
                }}
                className="bg-[#1C1814] hover:bg-[#800020] text-[#F3EBD4] hover:text-white px-5 py-3 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>View All 30 Daily Wear Sarees In Store (₹200 – ₹400)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Daily Wear Sarees Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dailyWearProducts.slice(0, 6).map((prod) => {
              const discountPercent =
                prod.originalPriceINR && prod.originalPriceINR > prod.priceINR
                  ? Math.round(((prod.originalPriceINR - prod.priceINR) / prod.originalPriceINR) * 100)
                  : null;
              const isWishlisted = wishlistIds.includes(prod.id);
              const displayImg = getCustomProductImage(prod.id, prod.images[0], 0);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border-2 border-[#EADBBD] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Main Image Stage */}
                    <div
                      className="relative aspect-3/4 overflow-hidden bg-[#F6F2EB] cursor-pointer"
                      onClick={() => onQuickView(prod)}
                    >
                      <img
                        src={displayImg}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (prod.images[0] && target.src !== prod.images[0]) {
                            target.src = prod.images[0];
                          } else {
                            target.src = '/assets/sarees/daily-wear-1-a.jpg';
                          }
                        }}
                      />

                      {/* Tag Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        <span className="bg-[#800020] text-[#FFD700] text-[10px] uppercase font-bold px-2.5 py-1 rounded shadow-sm">
                          {prod.tag || 'Dussehra Offer'}
                        </span>
                        {discountPercent && (
                          <span className="bg-[#2C070F]/90 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-xs">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Action Buttons (Wishlist) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(prod.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-xs cursor-pointer ${
                            isWishlisted
                              ? 'bg-white text-[#800020]'
                              : 'bg-white/80 hover:bg-white text-[#4A3E33]'
                          }`}
                          title="Wishlist"
                          aria-label="Wishlist"
                        >
                          <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-[#8C7A65] uppercase tracking-wider">
                        <span className="bg-[#F5EDE0] text-[#7A5B30] px-2 py-0.5 rounded font-medium border border-[#EADBBD]">
                          {prod.fabric}
                        </span>
                        <span className="text-[#205A32] font-semibold">In Stock ({prod.stockCount})</span>
                      </div>

                      <h3
                        onClick={() => onQuickView(prod)}
                        className="font-serif text-base sm:text-lg text-[#1A1510] group-hover:text-[#B8860B] transition-colors cursor-pointer font-medium leading-snug"
                      >
                        {prod.name}
                      </h3>

                      <p className="text-xs text-[#736352] line-clamp-2 leading-relaxed font-light">
                        {prod.description}
                      </p>

                      {/* Saree Pattern Highlight Box */}
                      <div className="bg-[#FFFDF9] p-2.5 rounded-lg border border-[#EDE4D5] text-[11px] space-y-1 text-[#5C4D3D]">
                        <div className="flex items-start gap-1.5">
                          <Sparkles size={13} className="text-[#B8860B] mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-[#800020]">Pattern: </span>
                            <span className="font-medium text-[#2C2115]">
                              {prod.pattern || prod.specifications?.pattern || prod.specifications?.weaveType}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comprehensive Specifications Matrix */}
                      <div className="bg-[#FAF7F0] p-2.5 rounded-lg border border-[#EDE4D5] text-[11px] space-y-1 text-[#5C4D3D]">
                        <div className="flex justify-between">
                          <span className="text-[#8C7A65]">Weave:</span>
                          <span className="font-medium text-[#1A1510] truncate max-w-[170px]">
                            {prod.specifications.weaveType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A65]">Zari / Border:</span>
                          <span className="font-medium text-[#1A1510] truncate max-w-[170px]">
                            {prod.specifications.zariType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A65]">Blouse Piece:</span>
                          <span className="font-medium text-[#1A1510] truncate max-w-[170px]">
                            {prod.specifications.blousePiece}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A65]">Guild Origin:</span>
                          <span className="font-medium text-[#1A1510] truncate max-w-[170px]">
                            {prod.specifications.origin}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C7A65]">Care:</span>
                          <span className="font-medium text-[#1A1510] truncate max-w-[170px]">
                            {prod.specifications.careInstructions}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="p-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between bg-[#FDFCFA]">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-xl font-bold text-[#800020]">
                          ₹{prod.priceINR}/-
                        </span>
                        {prod.originalPriceINR && (
                          <span className="text-xs text-[#A1917E] line-through">
                            ₹{prod.originalPriceINR}/-
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#205A32] font-semibold">COD Available • Without Blouse</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuickView(prod)}
                        className="px-2.5 py-1.5 text-xs text-[#1A1510] bg-[#F5EFE4] hover:bg-[#EADBCE] rounded-lg font-medium transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onAddToCart(prod, prod.sizes[0] || 'Standard', 1)}
                        className="px-3 py-1.5 text-xs rounded-lg font-semibold bg-[#1C1814] hover:bg-[#800020] text-[#F3EBD4] hover:text-white transition-all cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Most Coveted Best Sellers & Featured Creations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">Seasonal Highlights</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1510] mt-1">Most Coveted Creations</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs uppercase tracking-wider text-[#1A1510] hover:text-[#B8860B] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Creations</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCreations.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              isWishlisted={wishlistIds.includes(prod.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* 5. Managing Director Spotlight Quote */}
      <section className="bg-[#1C1814] text-[#E8DCC4] py-18 px-4 sm:px-6 lg:px-8 border-y border-[#33271C]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full overflow-hidden shrink-0 border-4 border-[#C5A059]/40 shadow-2xl">
            <RamaniPortrait
              alt="Mrs. K. Ramani, Founder & Managing Director"
              className="w-full h-full object-cover"
              id="home-ramani-portrait"
            />
          </div>

          <div className="space-y-4 text-center md:text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
              Leadership Excellence
            </span>
            <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#FAF8F5] leading-relaxed italic">
              “Every thread woven into an Aavira garment tells a story of generations, heritage, and unapologetic grace. We don’t manufacture clothes; we preserve living Indian civilizations.”
            </blockquote>
            <div>
              <p className="font-serif text-base text-[#FAF8F5] font-semibold">Mrs. K. Ramani</p>
              <p className="text-xs text-[#A89882] tracking-wider uppercase">
                Founder & Managing Director • Aavira Haute Couture
              </p>
              <p className="text-xs text-[#C5A059] mt-1 font-mono">
                aavira.bo@gmail.com • +91 9347159353
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VIP Client Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2" id="home-testimonials-heading">
          <p className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">Patron Testimonials</p>
          <h2 className="font-serif text-3xl text-[#1A1510]">Voices of Aavira Brides & Connoisseurs</h2>
          <p className="text-xs text-[#736352]">
            Honored words from brides, connoisseurs, and textile historians who treasure Aavira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The Amari Zari saree took my wedding ceremony in Bangalore to celestial heights. The weight of the pure gold zari drape felt regal, soft, and authentic.",
              author: "Priyadarshini Rao",
              city: "Hyderabad & Bangalore",
              role: "Bride & Art Collector",
            },
            {
              quote: "Having my bridal lehenga custom-fitted through video consultations with Mrs. K. Ramani was flawless. Delivery arrived at my London residence ahead of schedule.",
              author: "Eleanor & Aisha Vance",
              city: "London & Chelsea",
              role: "Bespoke Couture Patron",
            },
            {
              quote: "Visakhapatnam now houses an atelier rivaling Paris and Milan. The silk mark verification and pit loom artistry make Aavira an unmatched Indian treasure.",
              author: "Dr. Meenakshi Sundaram",
              city: "Chennai",
              role: "Senior Silk Historian",
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-[#E8E0D2] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex text-[#B8860B] gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-[#4A3E33] leading-relaxed italic">“{t.quote}”</p>
              <div className="border-t border-[#F2ECE1] pt-3">
                <p className="font-serif text-sm font-semibold text-[#1A1510]">{t.author}</p>
                <p className="text-[11px] text-[#8C7A65]">{t.role} • {t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
