import React, { useState, useMemo } from 'react';
import { Filter, X, Search, SlidersHorizontal, Sparkles, Check, Tag, LayoutGrid, Layers, ArrowRight, Pencil } from 'lucide-react';
import { Product, Currency, ProductCategory, CATEGORY_LABELS } from '../types';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../utils/currency';

interface ShopViewProps {
  products: Product[];
  currency: Currency;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

interface CategoryMeta {
  id: ProductCategory;
  label: string;
  icon: string;
  priceRange?: string;
  badge?: string;
  description: string;
  patternHighlight: string;
  fabricHighlight: string;
}

const CATEGORY_METADATA: CategoryMeta[] = [
  {
    id: 'daily-wear',
    label: 'Daily Wear Sarees (30 Sarees)',
    icon: '🪔',
    priceRange: '₹200 – ₹400',
    badge: 'Offer: Low to High • ₹200–₹400',
    description: 'Daily wear saree without blouse. Curated collection of 30 daily wear sarees presented with authentic images and rates only, arranged low to high from ₹200 to ₹400.',
    patternHighlight: 'Minimalist Temple Selvedge, Botanical Floral Jaal & Kalamkari Motifs',
    fabricHighlight: '100% Organic Mulmul Cotton & Fine Linen Blends',
  },
  {
    id: 'dharmavaram-silk',
    label: 'Dharmavaram Silk Sarees (4 Sarees)',
    icon: '👑',
    badge: 'Rayalaseema Heritage',
    description: 'World-renowned handloom sarees of Andhra Pradesh featuring opulent broad temple borders, heavy 24K electroplated gold zari brocade, and vibrant double-warp contrast pallus.',
    patternHighlight: 'Broad Temple Border, Sacred Kalash Motifs & Mayura Brocade',
    fabricHighlight: 'Pure Dharmavaram Handloom Mulberry Silk & Tissue Silk',
  },
  {
    id: 'venkatagiri-silk',
    label: 'VenkataGiri Silk Sarees (10 Sarees)',
    icon: '✨',
    badge: 'Royal Jamdani Weave',
    description: 'Featherlight unstarched handloom silks celebrated for centuries by Nellore royalty. Famous for delicate Jamdani zari buttas, pure mulberry softness, and breezy body-contouring drapes.',
    patternHighlight: 'Jamdani Floral Buttas, Micro-Zari Accents & Scalloped Selvedge',
    fabricHighlight: '100-Count Fine Venkatagiri Silk, Organza-Silk & Silk Blends',
  },
  {
    id: 'venkatagiri-vintage',
    label: 'VenkataGiri Vintage Sarees (6 Sarees)',
    icon: '🏛️',
    badge: 'Heirloom Revival',
    description: 'Rare archive-grade revivals woven on traditional heritage pit looms. Features authentic Kadwa butti interlocking, 18th-century Asavali vines, and heirloom double-ikat precision.',
    patternHighlight: 'Revived Asavali Vine & Peacock, Antique Kadwa & 300-Khat Doria',
    fabricHighlight: 'Pure Vintage Pit-Loom Silk, Katan Silk & Antique Tested Zari',
  },
  {
    id: 'bridal-sarees',
    label: 'Bridal Sarees (5 Sarees)',
    icon: '💍',
    badge: 'Bridal Exclusive',
    description: 'The pinnacle of Southern Indian bridal grandeur: heavyweight 3-ply pure silk handloomed using authentic 3-shuttle Korvai interlock and certified 24K electroplated gold zari.',
    patternHighlight: '3-Shuttle Korvai Kalash, 22-Inch Temple Gopuram & Metallic Gold Tissue',
    fabricHighlight: 'Heavy 3-Ply Pure Silk Pattu & Pure Metallic Gold Tissue',
  },
];

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  currency,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onEditProduct,
  onDeleteProduct,
  initialCategory,
  initialSearch = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [browseMode, setBrowseMode] = useState<'category-sections' | 'catalog-grid'>(
    (initialCategory && initialCategory !== 'all') ? 'catalog-grid' : 'category-sections'
  );

  const colors = [
    { label: 'All Colors', hex: '' },
    { label: 'Crimson & Gold', hex: '#800020' },
    { label: 'Emerald Peacock', hex: '#004953' },
    { label: 'Midnight Navy', hex: '#0B192C' },
    { label: 'Champagne Gold', hex: '#D4AF37' },
    { label: 'Rose Pink', hex: '#DE99A3' },
    { label: 'Royal Purple', hex: '#4B0082' },
    { label: 'Teal & Rani Pink', hex: '#008080' },
    { label: 'Lavender Lilac', hex: '#B57EDC' },
    { label: 'Olive & Linen', hex: '#6B8E23' },
    { label: 'Rust Madder', hex: '#B7410E' },
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: '200-400', label: '₹200 - ₹400 (Daily Wear Offer)' },
    { id: 'under-1000', label: 'Under 1000/-' },
    { id: '1000-2000', label: '1000/- to 2000/-' },
    { id: '2000-3000', label: '2000/- to 3000/-' },
    { id: 'above-3000', label: 'Above 3000/-' },
  ];

  const categories = [
    { id: 'all', label: 'All Saree Types', icon: '✨' },
    ...CATEGORY_METADATA.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
  ];

  // Unique fabrics for filter
  const uniqueFabrics = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) set.add(p.fabric);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Fabric filter
      if (selectedFabric !== 'all' && p.fabric !== selectedFabric) return false;

      // Color filter
      if (selectedColor !== 'all' && !p.color.toLowerCase().includes(selectedColor.toLowerCase()) && p.color !== selectedColor) return false;

      // In stock
      if (onlyInStock && !p.inStock) return false;

      // Price range
      if (selectedPriceRange === '200-400' && (p.priceINR < 200 || p.priceINR > 400)) return false;
      if ((selectedPriceRange === 'under-1000' || selectedPriceRange === 'under-1k') && p.priceINR >= 1000) return false;
      if ((selectedPriceRange === '1000-2000' || selectedPriceRange === '1k-2k') && (p.priceINR < 1000 || p.priceINR > 2000)) return false;
      if ((selectedPriceRange === '2000-3000' || selectedPriceRange === '2k-3k') && (p.priceINR < 2000 || p.priceINR > 3000)) return false;
      if ((selectedPriceRange === 'above-3000' || selectedPriceRange === 'above-3k') && p.priceINR <= 3000) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          (p.pattern && p.pattern.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.artisanNote.toLowerCase().includes(q) ||
          (p.specifications?.origin && p.specifications.origin.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceINR - b.priceINR;
      if (sortBy === 'price-desc') return b.priceINR - a.priceINR;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (selectedCategory === 'daily-wear' || (a.category === 'daily-wear' && b.category === 'daily-wear')) {
        return a.priceINR - b.priceINR;
      }
      return 0; // featured default
    });
  }, [products, selectedCategory, selectedFabric, selectedColor, selectedPriceRange, searchQuery, sortBy, onlyInStock]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedFabric('all');
    setSelectedColor('all');
    setSelectedPriceRange('all');
    setSearchQuery('');
    setOnlyInStock(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedFabric !== 'all' ||
    selectedColor !== 'all' ||
    selectedPriceRange !== 'all' ||
    searchQuery.trim() !== '' ||
    onlyInStock;

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      setBrowseMode('category-sections');
    } else {
      setBrowseMode('catalog-grid');
    }
    // Scroll smoothly to catalog
    const heading = document.getElementById('store-catalog-anchor');
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans space-y-10">
      {/* Grand Storefront Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3" id="store-catalog-anchor">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF4E8] border border-[#E8DCC4] text-[#B8860B] text-xs uppercase tracking-widest font-semibold shadow-2xs">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Authentic Boutique Handloom Catalog</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1510] tracking-tight">
          The Grand Aavira Store
        </h1>
        <p className="text-xs sm:text-sm text-[#736352] max-w-2xl mx-auto leading-relaxed font-light">
          Explore our complete collection placed according to category: from everyday breathable mulmul and linen daily wear (starting ₹200 to ₹400) to imperial bridal silks and heirloom vintage revivals.
        </p>
      </div>

      {/* Category Quick-Navigation Pills Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8C7A65]">
          <span className="font-medium uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers size={13} className="text-[#B8860B]" />
            <span>Browse by Saree Category</span>
          </span>
          <span className="text-[11px]">{products.length} Authenticated Sarees</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {CATEGORY_METADATA.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            const isDaily = cat.id === 'daily-wear';

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1C1814] text-[#F3EBD4] border-[#1C1814] shadow-md scale-102 ring-2 ring-[#D4AF37]/50'
                    : isDaily
                    ? 'bg-gradient-to-b from-[#FFFDF5] to-[#FBF4E2] border-[#D4AF37] text-[#2C070F] hover:shadow-md'
                    : 'bg-white border-[#EADDCD] text-[#2D2319] hover:border-[#C5A059] hover:bg-[#FAF6F0]'
                }`}
              >
                <span className="text-2xl mb-1 select-none">{cat.icon}</span>
                <span className="text-xs font-serif font-semibold leading-tight line-clamp-1">
                  {cat.label.replace(' Sarees', '')}
                </span>
                {cat.priceRange ? (
                  <span className={`text-[10px] mt-1 font-medium ${
                    isSelected
                      ? 'text-[#FFD700]'
                      : isDaily
                      ? 'text-[#800020] font-bold'
                      : 'text-[#8C7A65]'
                  }`}>
                    {cat.priceRange}
                  </span>
                ) : (
                  <span className={`text-[10px] mt-1 font-medium ${
                    isSelected ? 'text-[#FFD700]' : 'text-[#8C7A65]'
                  }`}>
                    {count} Sarees
                  </span>
                )}
                {isDaily && !isSelected && (
                  <span className="mt-1 text-[9px] uppercase tracking-wider bg-[#800020] text-white px-1.5 py-0.2 rounded font-bold">
                    Offer
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Festive Offer Banner: Daily Wear Sarees (₹200 - ₹400) */}
      <div className="bg-gradient-to-r from-[#2C070F] via-[#4A0A17] to-[#2C070F] rounded-2xl p-6 sm:p-8 text-[#FFF8EB] border-2 border-[#D4AF37]/70 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base select-none">🪔</span>
              <span className="bg-[#D4AF37] text-[#2C070F] text-[10px] sm:text-xs uppercase font-extrabold px-2.5 py-0.5 rounded tracking-widest shadow-xs">
                DUSSHERA FESTIVE OFFER
              </span>
              <span className="bg-white/15 text-[#FFD700] text-[11px] font-semibold px-2.5 py-0.5 rounded border border-[#FFD700]/30">
                PRICE RANGE: ₹200/- TO ₹400/- ONLY
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">
                • All Photoshoots Attached
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#FFF8EB] tracking-wide">
              Daily Wear Handcrafted Sarees Collection
            </h2>

            <p className="text-xs sm:text-sm text-[#E8DCC4] leading-relaxed font-light">
              Crafted for effortless daily poise: 30 curated daily wear sarees priced from ₹200 to ₹400 (arranged low to high), without blouse (5.5m pure saree length), featuring authentic photography and rates only.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[#F3EBD4]">
              <span className="bg-black/30 px-2.5 py-1 rounded border border-[#D4AF37]/30">
                🎨 Patterns: Minimalist Temple, Floral Jaal & Kalamkari Motifs
              </span>
              <span className="bg-black/30 px-2.5 py-1 rounded border border-[#D4AF37]/30">
                🧵 Fabrics: 100% Organic Mulmul Cotton & Fine Linen
              </span>
            </div>
          </div>

          <div className="shrink-0 flex lg:flex-col items-center gap-2 bg-black/40 px-6 py-4 rounded-xl border border-[#D4AF37]/40 text-center w-full lg:w-auto justify-between lg:justify-center">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] block font-semibold">Festive Pricing</span>
              <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#FFD700]">₹200 – ₹400</span>
            </div>
            <button
              onClick={() => handleSelectCategory('daily-wear')}
              className="bg-[#D4AF37] hover:bg-[#E5BF4A] text-[#2C070F] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              View Daily Wear ({products.filter(p => p.category === 'daily-wear').length})
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Bar & Sorting */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E0D2] shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: View Mode selection */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setBrowseMode('category-sections');
              setSelectedCategory('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              browseMode === 'category-sections' && selectedCategory === 'all'
                ? 'bg-[#1C1814] text-[#F3EBD4]'
                : 'bg-[#FAF6F0] text-[#5C4D3E] hover:bg-[#EDE3D3]'
            }`}
          >
            <Layers size={14} />
            <span>Grouped by Category</span>
          </button>

          <button
            onClick={() => setBrowseMode('catalog-grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              browseMode === 'catalog-grid' || selectedCategory !== 'all'
                ? 'bg-[#1C1814] text-[#F3EBD4]'
                : 'bg-[#FAF6F0] text-[#5C4D3E] hover:bg-[#EDE3D3]'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Filter Grid ({filteredProducts.length})</span>
          </button>

          {onEditProduct && (
            <button
              onClick={() => {
                if (filteredProducts.length > 0) {
                  onEditProduct(filteredProducts[0]);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[#FAF4E8] hover:bg-[#800020] text-[#800020] hover:text-white border border-[#E8DCC4] transition-colors cursor-pointer shadow-xs ml-auto sm:ml-0"
              title="Click to edit saree creations or click ✏️ directly on any card"
            >
              <Pencil size={13} />
              <span>Edit Saree</span>
            </button>
          )}
        </div>

        {/* Center / Right: Filter summary & Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
          <span className="text-[#8C7A65] hidden md:inline">
            Showing <strong className="text-[#1A1510]">{filteredProducts.length}</strong> items
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[#8C7A65]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3 py-1.5 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B] cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="price-asc">Price: Low to High (₹200 first)</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog View with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E0D2]">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#1A1510] cursor-pointer"
          >
            <SlidersHorizontal size={16} className="text-[#B8860B]" />
            <span>Filter Catalog ({filteredProducts.length} Items)</span>
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs text-[#800020] underline cursor-pointer">
              Reset Filters
            </button>
          )}
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`lg:w-72 w-full shrink-0 space-y-6 ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-[#FAF8F5] p-6 overflow-y-auto block'
              : 'hidden lg:block sticky top-24'
          }`}
        >
          <div className="bg-white p-5 rounded-xl border border-[#E8E0D2] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DC]">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[#B8860B]" />
                <h3 className="font-serif text-sm uppercase tracking-wider font-semibold text-[#1A1510]">
                  Filter Catalog
                </h3>
              </div>
              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-[#6E5E4E] hover:text-[#1A1510] cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Search filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E33] mb-1.5 uppercase tracking-wider">
                Search Catalog
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#948472]" />
                <input
                  type="text"
                  placeholder="e.g. Mulmul, Kalamkari, Brocade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-2.5 pl-8 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E33] mb-2 uppercase tracking-wider">
                Saree Category
              </label>
              <div className="space-y-1 text-xs">
                {categories.map((c) => {
                  const count = c.id === 'all'
                    ? products.length
                    : products.filter((p) => p.category === c.id).length;
                  const isDaily = c.id === 'daily-wear';

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCategory(c.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === c.id
                          ? 'bg-[#1C1814] text-[#F3EBD4] font-semibold'
                          : isDaily
                          ? 'text-[#800020] bg-[#FAF3E8] font-medium hover:bg-[#F3E5D0]'
                          : 'text-[#5C4D3E] hover:bg-[#F5EFE4]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        selectedCategory === c.id ? 'bg-white/20 text-[#F3EBD4]' : 'bg-[#EFE8DC] text-[#736352]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E33] mb-2 uppercase tracking-wider">
                Price Range
              </label>
              <div className="space-y-1 text-xs">
                {priceRanges.map((r) => {
                  const isSpecial = r.id === '200-400';
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedPriceRange(r.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer ${
                        selectedPriceRange === r.id
                          ? 'bg-[#B8860B] text-white font-semibold'
                          : isSpecial
                          ? 'text-[#800020] bg-[#FAF3E8] font-medium hover:bg-[#F3E5D0]'
                          : 'text-[#5C4D3E] hover:bg-[#F5EFE4]'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabric Filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E33] mb-2 uppercase tracking-wider">
                Fabric Type
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-2.5 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B] cursor-pointer"
              >
                <option value="all">All Fabrics ({uniqueFabrics.length})</option>
                {uniqueFabrics.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Color Palette Filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A3E33] mb-2 uppercase tracking-wider">
                Palette
              </label>
              <div className="space-y-1 text-xs max-h-40 overflow-y-auto pr-1">
                {colors.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedColor(c.label === 'All Colors' ? 'all' : c.label)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      (selectedColor === 'all' && c.label === 'All Colors') || selectedColor === c.label
                        ? 'bg-[#1C1814] text-[#F3EBD4] font-medium'
                        : 'text-[#5C4D3E] hover:bg-[#F5EFE4]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {c.hex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                      )}
                      <span>{c.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-[#EFE8DC]">
              <label className="flex items-center gap-2 text-xs text-[#4A3E33] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#B8860B] focus:ring-[#B8860B]"
                />
                <span>Only In-Stock Creations</span>
              </label>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full text-center py-2 text-xs text-[#800020] border border-[#800020]/30 rounded-lg hover:bg-[#800020]/5 transition-colors font-semibold cursor-pointer"
              >
                Clear All Filters
              </button>
            )}

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#1C1814] text-[#F3EBD4] py-3 rounded-lg text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Apply & View Creations ({filteredProducts.length})
              </button>
            )}
          </div>
        </aside>

        {/* Catalog Main Content */}
        <main className="flex-1 w-full space-y-8">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs bg-white p-3 rounded-xl border border-[#E8E0D2]">
              <span className="text-[#8C7A65] text-[11px] font-medium">Active Filters:</span>
              {selectedCategory !== 'all' && (
                <span className="bg-[#FAF4E8] text-[#800020] border border-[#EADBBD] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Category: {CATEGORY_LABELS[selectedCategory as ProductCategory] || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {selectedPriceRange !== 'all' && (
                <span className="bg-[#FAF4E8] text-[#800020] border border-[#EADBBD] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                  <button onClick={() => setSelectedPriceRange('all')} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {selectedFabric !== 'all' && (
                <span className="bg-[#FAF4E8] text-[#800020] border border-[#EADBBD] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Fabric: {selectedFabric}
                  <button onClick={() => setSelectedFabric('all')} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {selectedColor !== 'all' && (
                <span className="bg-[#FAF4E8] text-[#800020] border border-[#EADBBD] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Color: {selectedColor}
                  <button onClick={() => setSelectedColor('all')} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="bg-[#FAF4E8] text-[#800020] border border-[#EADBBD] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#800020] underline hover:text-[#4A0012] ml-1 font-semibold cursor-pointer"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Conditional Display: Grouped by Category vs Catalog Grid */}
          {browseMode === 'category-sections' && selectedCategory === 'all' && !hasActiveFilters ? (
            /* Grouped by Category Showcase View */
            <div className="space-y-14">
              {CATEGORY_METADATA.map((catMeta) => {
                const isDaily = catMeta.id === 'daily-wear';
                const categoryProducts = isDaily
                  ? products.filter((p) => p.category === catMeta.id).sort((a, b) => a.priceINR - b.priceINR)
                  : products.filter((p) => p.category === catMeta.id);
                if (categoryProducts.length === 0) return null;

                return (
                  <section
                    key={catMeta.id}
                    id={`category-section-${catMeta.id}`}
                    className="space-y-6 pt-2"
                  >
                    {/* Category Header Card */}
                    <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                      isDaily
                        ? 'bg-gradient-to-r from-[#FFFDF8] via-[#FAF4E6] to-[#FFFDF8] border-[#D4AF37] shadow-sm'
                        : 'bg-white border-[#EADDCD] shadow-2xs'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl select-none">{catMeta.icon}</span>
                            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1510] font-semibold">
                              {catMeta.label}
                            </h2>
                            {catMeta.badge && (
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                                isDaily ? 'bg-[#800020] text-white' : 'bg-[#FAF2DE] text-[#A66F00] border border-[#E9D9B5]'
                              }`}>
                                {catMeta.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#736352] max-w-2xl leading-relaxed font-light">
                            {catMeta.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#695438] pt-1">
                            <span className="bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EDE2CF]">
                              🎨 <strong>Pattern:</strong> {catMeta.patternHighlight}
                            </span>
                            <span className="bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EDE2CF]">
                              🧵 <strong>Fabric:</strong> {catMeta.fabricHighlight}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center gap-2 bg-[#FAF7F0] p-3 rounded-xl border border-[#EDE2CF] text-center">
                          <div>
                            <span className="text-[10px] uppercase text-[#8C7A65] tracking-wider block">
                              {catMeta.priceRange ? 'Price Range' : 'Curated Catalog'}
                            </span>
                            <span className="font-serif text-base sm:text-lg font-bold text-[#1A1510]">
                              {catMeta.priceRange || `${categoryProducts.length} Handloom Sarees`}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSelectCategory(catMeta.id)}
                            className="text-[11px] font-semibold text-[#800020] hover:text-[#4A0012] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Filter Only</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Category Products Grid */}
                    <div className={
                      isDaily
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    }>
                      {categoryProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={onToggleWishlist}
                          onQuickView={onQuickView}
                          onAddToCart={onAddToCart}
                          onEdit={onEditProduct}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Filter Grid View */
            <div>
              {/* Category Active Header when a single category is selected */}
              {selectedCategory !== 'all' && (
                (() => {
                  const meta = CATEGORY_METADATA.find(c => c.id === selectedCategory);
                  if (!meta) return null;
                  const isDaily = meta.id === 'daily-wear';

                  return (
                    <div className={`p-5 rounded-2xl border mb-6 ${
                      isDaily
                        ? 'bg-gradient-to-r from-[#FFFDF8] via-[#FAF4E6] to-[#FFFDF8] border-[#D4AF37]'
                        : 'bg-white border-[#EADDCD]'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl select-none">{meta.icon}</span>
                            <h2 className="font-serif text-xl sm:text-2xl text-[#1A1510] font-semibold">
                              {meta.label}
                            </h2>
                            {meta.badge && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider bg-[#800020] text-white">
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#736352] max-w-2xl leading-relaxed font-light">
                            {meta.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#695438] pt-1">
                            <span className="bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EDE2CF]">
                              🎨 <strong>Pattern:</strong> {meta.patternHighlight}
                            </span>
                            <span className="bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EDE2CF]">
                              🧵 <strong>Fabric:</strong> {meta.fabricHighlight}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 bg-[#FAF7F0] px-4 py-2.5 rounded-xl border border-[#EDE2CF] text-center">
                          <span className="text-[10px] uppercase text-[#8C7A65] tracking-wider block">
                            {meta.priceRange ? 'Price Range' : 'Curated Catalog'}
                          </span>
                          <span className="font-serif text-base sm:text-lg font-bold text-[#1A1510]">
                            {meta.priceRange || `${products.filter(p => p.category === meta.id).length} Handloom Sarees`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E0D2] p-16 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#FAF4E8] text-[#B8860B] flex items-center justify-center mx-auto">
                    <Search size={28} />
                  </div>
                  <h3 className="font-serif text-xl text-[#1A1510]">No creations match your active filters</h3>
                  <p className="text-xs text-[#736352] max-w-sm mx-auto">
                    Try widening your price range or exploring all categories to discover our available handcrafted pieces.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-[#1C1814] text-[#F3EBD4] px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] transition-colors cursor-pointer"
                  >
                    Show All Creations
                  </button>
                </div>
              ) : (
                <div className={
                  selectedCategory === 'daily-wear'
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                      onQuickView={onQuickView}
                      onAddToCart={onAddToCart}
                      onEdit={onEditProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
