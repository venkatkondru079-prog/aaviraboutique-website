import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Sparkles, Check, Ruler, Banknote, Smartphone, Pencil } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { getCustomProductImages } from '../utils/productImageStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onEdit?: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  currency,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onEdit,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Free Size');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(() =>
    product ? getCustomProductImages(product.id, product.images) : []
  );

  // Reset to initial image ONLY when a new product is selected
  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    setSelectedSize(product.sizes?.[0] || 'Free Size');
    setGalleryImages(getCustomProductImages(product.id, product.images));
  }, [product?.id]);

  // Sync gallery images when product.images updates or on real-time broadcast
  useEffect(() => {
    if (!product) return;
    setGalleryImages(getCustomProductImages(product.id, product.images));

    const handleUpdate = (e: any) => {
      if (e.detail?.productId === product.id) {
        const { dataUrl, imageIndex = 0 } = e.detail;
        const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;
        setGalleryImages((prev) => {
          const next = [...prev];
          if (dataUrl) {
            if (idx < next.length) {
              next[idx] = dataUrl;
            } else {
              next.push(dataUrl);
            }
          } else {
            next[idx] = product.images[idx] || next[idx];
          }
          return next;
        });
        if (dataUrl) {
          setActiveImageIndex(idx);
        }
      }
    };
    window.addEventListener('aavira:product-image-updated', handleUpdate);
    return () => window.removeEventListener('aavira:product-image-updated', handleUpdate);
  }, [product?.id, product?.images]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const currentDisplayImage = galleryImages[activeImageIndex] || product.images[activeImageIndex] || galleryImages[0];

  const getImageRoleLabel = (idx: number) => {
    if (idx === 0) return 'Image 1 (Front View)';
    if (idx === 1) return 'Image 2 (Back / Drape View)';
    if (idx === 2) return 'Image 3 (Pallu / Border Detail)';
    return `Image ${idx + 1} (Detail)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-xl shadow-2xl border border-[#D9D0C1] overflow-hidden max-h-[92vh] flex flex-col md:flex-row relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-[#4A3E33] hover:text-[#1A1510] rounded-full shadow-sm transition-colors"
          id="quick-view-close-btn"
        >
          <X size={18} />
        </button>

        {/* Left: Image Gallery */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between bg-[#F4EFE6] border-b md:border-b-0 md:border-r border-[#E8E0D2]">
          <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-white shadow-sm border border-[#E8DFC9] group/stage">
            <img
              src={currentDisplayImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-all duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (product.images[0] && target.src !== product.images[0]) {
                  target.src = product.images[0];
                } else {
                  target.src = '/assets/sarees/daily-wear-1-a.jpg';
                }
              }}
            />
            {product.tag && (
              <span className="absolute top-3 left-3 bg-[#1C1814] text-[#E8DCC4] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded">
                {product.tag}
              </span>
            )}

            {/* Stage overlay badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
              <span>{getImageRoleLabel(activeImageIndex)}</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A65]">
                Product Photos ({galleryImages.length}) • Click to View Angle:
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 items-center">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative group/thumb shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 rounded overflow-hidden border-2 transition-all block relative ${
                      activeImageIndex === idx ? 'border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-xs' : 'border-[#E0D8C8] opacity-75 hover:opacity-100'
                    }`}
                    title={`View ${getImageRoleLabel(idx)}`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (product.images[0] && target.src !== product.images[0]) {
                          target.src = product.images[0];
                        }
                      }}
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5 leading-none">
                      #{idx + 1}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[75vh] md:max-h-[92vh] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#B8860B] font-semibold">
              <Sparkles size={13} />
              <span>{product.category} • Handcrafted Masterpiece</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1510] leading-snug">
              {product.name}
            </h2>

            <p className="text-xs text-[#786857] leading-relaxed">
              {product.subtitle}
            </p>

            {/* Price display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-serif text-2xl font-bold text-[#1A1510]">
                {formatPrice(product.priceINR, currency)}
              </span>
              {product.originalPriceINR && (
                <span className="text-sm text-[#9C8D7B] line-through">
                  {formatPrice(product.originalPriceINR, currency)}
                </span>
              )}
              <span className="text-[11px] text-[#205A32] font-semibold bg-[#EFF8F1] px-2 py-0.5 rounded">
                Inclusive of all custom duties & GST
              </span>
            </div>

            {/* Pattern & Fabric Highlight Banner */}
            <div className="bg-[#FAF6F0] border border-[#EADBBD] rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-[#3D2E16] shrink-0">🎨 Saree Pattern:</span>
                <span className="text-[#695438] font-medium">{product.pattern || product.specifications?.pattern || product.specifications?.weaveType}</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-[#E8DEC9]">
                <span className="font-semibold text-[#3D2E16] shrink-0">🧵 Fabric Details:</span>
                <span className="text-[#695438] font-medium">{product.fabric}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#524436] leading-relaxed border-t border-[#E8E0D2] pt-3">
              {product.description}
            </p>

            {/* Artisan Note */}
            <div className="bg-[#FAF4E8] border border-[#EADBBD] p-3 rounded-lg text-xs space-y-1">
              <span className="font-serif text-[11px] uppercase tracking-wider text-[#966B08] font-bold block">
                Artisan Provenance
              </span>
              <p className="text-[#594833] italic">{product.artisanNote}</p>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#1A1510]">Select Size / Silhouette:</span>
                <span className="text-[#8C7A65] flex items-center gap-1 text-[11px]">
                  <Ruler size={13} /> Bespoke Tailoring Available
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      selectedSize === sz
                        ? 'bg-[#1C1814] text-[#F3EBD4] shadow-xs'
                        : 'bg-white border border-[#D9D0C1] text-[#4A3E33] hover:border-[#B8860B]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="border-t border-[#E8E0D2] pt-3 text-xs space-y-2 text-[#5C4D3D]">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2 bg-[#FAF7F0] p-2 rounded border border-[#EDE4D5]">
                  <span className="text-[#948472] text-[11px] block">Pattern Design:</span>
                  <p className="font-medium text-[#1A1510]">{product.pattern || product.specifications?.pattern || product.specifications?.weaveType}</p>
                </div>
                <div>
                  <span className="text-[#948472] text-[11px] block">Fabric Composition:</span>
                  <p className="font-medium text-[#1A1510]">{product.fabric}</p>
                </div>
                <div>
                  <span className="text-[#948472] text-[11px] block">Weave Technique:</span>
                  <p className="font-medium text-[#1A1510]">{product.specifications.weaveType}</p>
                </div>
                <div>
                  <span className="text-[#948472] text-[11px] block">Zari Certification:</span>
                  <p className="font-medium text-[#1A1510]">{product.specifications.zariType}</p>
                </div>
                <div>
                  <span className="text-[#948472] text-[11px] block">Origin Guild:</span>
                  <p className="font-medium text-[#1A1510]">{product.specifications.origin}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#948472] text-[11px] block">Blouse Piece:</span>
                  <p className="font-medium text-[#1A1510]">{product.specifications.blousePiece}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#948472] text-[11px] block">Care Protocol:</span>
                  <p className="font-medium text-[#1A1510]">{product.specifications.careInstructions}</p>
                </div>
              </div>
            </div>

            {/* Payment Modes & Delivery Assurances */}
            <div className="rounded-lg bg-[#FAF7F0] border border-[#E8DFCF] p-3 space-y-2 mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#736352]">
                <span className="uppercase tracking-wider">Available Payment Modes</span>
                <span className="text-[#205A32] font-medium normal-case flex items-center gap-1">
                  <ShieldCheck size={13} />
                  Silk Mark Certified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded bg-white border border-[#EFE8DC]">
                  <div className="p-1 rounded bg-[#EFF8F1] text-[#205A32] shrink-0 mt-0.5">
                    <Banknote size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1510] text-[11px]">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-[#736352] leading-tight mt-0.5">
                      Pay cash or courier QR at doorstep. ₹0 advance required.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-white border border-[#EFE8DC]">
                  <div className="p-1 rounded bg-[#FAF4E6] text-[#8C6D2B] shrink-0 mt-0.5">
                    <Smartphone size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1510] text-[11px]">Instant UPI Payment</p>
                    <p className="text-[10px] text-[#736352] leading-tight mt-0.5">
                      GPay, PhonePe, Paytm, BHIM & QR code with instant receipt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#E8E0D2] flex items-center gap-3">
            <div className="flex items-center border border-[#D9D0C1] rounded bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-sm text-[#4A3E33] hover:bg-[#F2ECE1]"
              >
                -
              </button>
              <span className="px-3 py-2 text-xs font-bold text-[#1A1510]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-sm text-[#4A3E33] hover:bg-[#F2ECE1]"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`flex-1 py-3 px-4 rounded text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                addedAnimation
                  ? 'bg-[#205A32] text-white'
                  : 'bg-[#1C1814] text-[#F3EBD4] hover:bg-[#332920]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check size={16} />
                  <span>Added to Couture Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-3 rounded border transition-colors ${
                isWishlisted
                  ? 'border-[#800020] bg-[#800020]/10 text-[#800020]'
                  : 'border-[#D9D0C1] bg-white text-[#524436] hover:text-[#800020]'
              }`}
              title="Save to Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="py-3 px-3.5 rounded border border-[#C5A059] bg-[#FAF5EC] text-[#7A5A19] hover:bg-[#800020] hover:text-white hover:border-[#800020] transition-colors flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-semibold cursor-pointer shadow-xs"
                title="Edit saree details & photos"
              >
                <Pencil size={15} />
                <span className="hidden sm:inline">Edit Saree</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
