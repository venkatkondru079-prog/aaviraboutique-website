import React, { useState, useEffect } from 'react';
import { Heart, Eye, ShoppingBag, Check, Banknote, Smartphone, Sparkles, Layers, Pencil } from 'lucide-react';
import { Product, Currency, CATEGORY_LABELS, ProductCategory } from '../types';
import { formatPrice } from '../utils/currency';
import { getCustomProductImage } from '../utils/productImageStore';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  // Compute resolved images
  const resolvedImages = product.images.map((img, idx) =>
    getCustomProductImage(product.id, img, idx)
  );

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.productId === product.id) {
        // Trigger re-render
        setSelectedImgIndex((prev) => prev);
      }
    };
    const handleHydrated = () => {
      setSelectedImgIndex(0);
    };

    window.addEventListener('aavira:product-image-updated', handleUpdate);
    window.addEventListener('aavira:product-images-hydrated', handleHydrated);
    window.addEventListener('aavira:product-images-cleared', handleHydrated);
    return () => {
      window.removeEventListener('aavira:product-image-updated', handleUpdate);
      window.removeEventListener('aavira:product-images-hydrated', handleHydrated);
      window.removeEventListener('aavira:product-images-cleared', handleHydrated);
    };
  }, [product.id]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, product.sizes[0] || 'Standard', 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Determine current active image based on hover / user thumbnail selection
  const currentImage = isHovered && selectedImgIndex === 0 && resolvedImages.length > 1
    ? resolvedImages[1]
    : resolvedImages[selectedImgIndex] || resolvedImages[0];

  const discountPercent = product.originalPriceINR && product.originalPriceINR > product.priceINR
    ? Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100)
    : null;

  const categoryLabel = CATEGORY_LABELS[product.category as ProductCategory] || product.category;

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl border border-[#EADBCE] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#C5A059]/70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSelectedImgIndex(0);
      }}
      id={`product-card-${product.id}`}
    >
      {/* Image Stage */}
      <div
        className="relative aspect-3/4 overflow-hidden bg-[#F6F2EB] cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={currentImage}
          alt={`${product.name} - View ${selectedImgIndex + 1}`}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (product.images[0] && target.src !== product.images[0]) {
              target.src = product.images[0];
            } else {
              target.src = '/assets/sarees/daily-wear-1-a.jpg';
            }
          }}
        />

        {/* Tag badge top-left */}
        {product.category === 'daily-wear' ? (
          <span className="absolute top-3 left-3 bg-[#1C1814]/90 backdrop-blur-xs text-[#F3EBD4] text-[11px] font-serif font-bold px-2 py-0.5 rounded shadow-xs z-10">
            Rate: {formatPrice(product.priceINR, currency)}
          </span>
        ) : product.tag ? (
          <span className="absolute top-3 left-3 bg-[#1C1814]/90 backdrop-blur-xs text-[#F3EBD4] text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded shadow-xs z-10">
            {product.tag}
          </span>
        ) : discountPercent ? (
          <span className="absolute top-3 left-3 bg-[#800020] text-white text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded shadow-xs z-10">
            {discountPercent}% OFF
          </span>
        ) : null}

        {/* Multi-Photo Count Badge */}
        {resolvedImages.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
            <span className="inline-flex items-center gap-1 bg-black/65 backdrop-blur-xs text-[#FFF8EB] text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
              <Layers size={10} className="text-[#FFD700]" />
              <span>{resolvedImages.length} Photos</span>
            </span>

            {/* Thumbnail dots */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs p-1 rounded-full">
              {resolvedImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImgIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    (isHovered && selectedImgIndex === 0 && resolvedImages.length > 1 ? 1 : selectedImgIndex) === i
                      ? 'bg-[#FFD700] scale-125'
                      : 'bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`View photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons top-right */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-xs cursor-pointer ${
              isWishlisted
                ? 'bg-white text-[#800020]'
                : 'bg-white/85 hover:bg-white text-[#4A3E33] hover:text-[#800020]'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-2 rounded-full bg-white/90 hover:bg-[#800020] text-[#4A3E33] hover:text-white backdrop-blur-md transition-all shadow-xs cursor-pointer group/editbtn"
              title="Edit saree details & pricing"
              aria-label="Edit Saree"
            >
              <Pencil size={14} className="group-hover/editbtn:rotate-12 transition-transform" />
            </button>
          )}
        </div>

        {/* Quick View Action Bar on Hover */}
        <div className="absolute inset-x-3 bottom-12 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white/95 backdrop-blur-xs hover:bg-[#1C1814] hover:text-[#F3EBD4] text-[#1A1510] text-xs font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="bg-[#D4AF37] hover:bg-[#800020] text-[#1C1814] hover:text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer border border-[#B8860B]/40"
              title="Edit saree details"
            >
              <Pencil size={13} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      {product.category === 'daily-wear' ? (
        /* Daily Wear Saree: Only Images and Rate Only */
        <div className="p-3 sm:p-3.5 bg-white border-t border-[#F0E9DC] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A66F00] bg-[#FAF5EC] px-1.5 py-0.5 rounded border border-[#EDE2CF]">
                Rate
              </span>
              {discountPercent && (
                <span className="text-[10px] font-semibold text-[#800020] bg-[#FAF0F2] px-1.5 py-0.5 rounded border border-[#F3D5DB]">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-serif text-lg sm:text-xl font-bold text-[#1A1510]">
                {formatPrice(product.priceINR, currency)}
              </span>
              {product.originalPriceINR && (
                <span className="text-xs text-[#A1917E] line-through font-light">
                  {formatPrice(product.originalPriceINR, currency)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#205A32] font-medium pt-0.5">Daily wear saree without blouse</p>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="p-2 sm:p-2.5 rounded-full bg-[#FAF4E8] hover:bg-[#800020] text-[#736352] hover:text-white border border-[#E8DCC4] transition-all cursor-pointer shadow-xs"
                title="Edit Daily Wear Saree"
                aria-label="Edit Daily Wear Saree"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={handleQuickAdd}
              className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer shadow-xs ${
                justAdded
                  ? 'bg-[#205A32] text-white scale-110'
                  : 'bg-[#FAF6ED] border border-[#D9CEBA] text-[#4A3E33] hover:bg-[#1C1814] hover:text-[#F3EBD4] hover:border-[#1C1814]'
              }`}
              title="Add to bag immediately"
              aria-label="Add to Bag"
            >
              {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
            </button>
          </div>
        </div>
      ) : (
        /* Full Detailed Card for Other Categories */
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Fabric badge row */}
          <div className="flex items-center justify-between text-[11px] text-[#8C7A65]">
            <span className="uppercase tracking-wider font-medium text-[#A66F00] bg-[#FAF5EC] px-2 py-0.5 rounded border border-[#EDE2CF]">
              {categoryLabel}
            </span>
            <span className="text-[#6E5D4B] font-medium truncate max-w-[140px]">
              {product.fabric}
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-base sm:text-lg text-[#1A1510] group-hover:text-[#B8860B] transition-colors line-clamp-1 cursor-pointer font-medium"
          >
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-[#736352] line-clamp-1 font-light">
            {product.subtitle}
          </p>

          {/* Saree Pattern Highlight Box */}
          <div className="bg-[#FAF6F0] border border-[#EDE4D5] rounded-md px-2.5 py-1.5 text-xs text-[#5C4524]">
            <div className="flex items-start gap-1.5">
              <Sparkles size={12} className="text-[#B8860B] mt-0.5 shrink-0" />
              <div className="leading-snug">
                <span className="font-semibold text-[#3D2E16]">Pattern: </span>
                <span className="text-[#695438]">
                  {product.pattern || product.specifications?.pattern || product.specifications?.weaveType}
                </span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-[#6B5B49] line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Specifications highlights */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-[#6E5D4B]">
            {product.specifications?.origin && (
              <span className="bg-[#F6F2EA] px-2 py-0.5 rounded border border-[#E8DEC9]">
                📍 {product.specifications.origin.split(',')[0]}
              </span>
            )}
            {product.specifications?.blousePiece && (
              <span className="bg-[#F6F2EA] px-2 py-0.5 rounded border border-[#E8DEC9]">
                🧵 {product.specifications.blousePiece.toLowerCase().includes('without blouse') || product.specifications.blousePiece.toLowerCase().includes('no blouse')
                  ? 'Without Blouse (5.5m)'
                  : 'Blouse Piece Included'}
              </span>
            )}
          </div>

          {/* Payment & Delivery Highlights */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-[#205A32] bg-[#EFF8F1] px-1.5 py-0.5 rounded font-medium border border-[#D5EAD9]">
              <Banknote size={11} />
              <span>COD Available</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#7A5B18] bg-[#FAF4E6] px-1.5 py-0.5 rounded font-medium border border-[#EBDDBE]">
              <Smartphone size={11} />
              <span>Fast UPI</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-medium ml-auto">
              Ready to Ship
            </span>
          </div>
        </div>

        {/* Pricing & Add to Bag footer */}
        <div className="pt-2.5 border-t border-[#F2ECE1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-base sm:text-lg font-bold text-[#1A1510]">
                {formatPrice(product.priceINR, currency)}
              </span>
              {product.originalPriceINR && (
                <span className="text-xs text-[#A1917E] line-through font-light">
                  {formatPrice(product.originalPriceINR, currency)}
                </span>
              )}
              {discountPercent && (
                <span className="text-[10px] font-semibold text-[#800020] bg-[#FAF0F2] px-1.5 py-0.2 rounded border border-[#F3D5DB]">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            {product.stockCount <= 4 ? (
              <p className="text-[10px] text-[#800020] font-medium">Only {product.stockCount} bespoke pieces left</p>
            ) : (
              <p className="text-[10px] text-[#205A32]">In Stock • Certified Pure Handloom</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="p-2.5 rounded-full bg-[#FAF4E8] hover:bg-[#800020] text-[#736352] hover:text-white border border-[#E8DCC4] transition-all cursor-pointer shadow-xs"
                title="Edit Saree Details & Pricing"
                aria-label="Edit Saree"
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              onClick={handleQuickAdd}
              className={`p-2.5 rounded-full transition-all cursor-pointer shadow-xs ${
                justAdded
                  ? 'bg-[#205A32] text-white scale-110'
                  : 'bg-[#FAF6ED] border border-[#D9CEBA] text-[#4A3E33] hover:bg-[#1C1814] hover:text-[#F3EBD4] hover:border-[#1C1814]'
              }`}
              title="Add to bag immediately"
              aria-label="Add to Bag"
            >
              {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
