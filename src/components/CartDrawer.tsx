import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Banknote, Smartphone } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { getCustomProductImage } from '../utils/productImageStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: () => void;
  discountPercentage: number;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  couponCode: string;
  onClearBag?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discountPercentage,
  onApplyCoupon,
  couponCode,
  onClearBag,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const rawSubtotalINR = items.reduce((acc, item) => acc + item.product.priceINR * item.quantity, 0);
  const discountINR = (rawSubtotalINR * discountPercentage) / 100;
  const finalTotalINR = rawSubtotalINR - discountINR;

  const freeShippingThresholdINR = 50000;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdINR - rawSubtotalINR);
  const shippingProgress = Math.min(100, (rawSubtotalINR / freeShippingThresholdINR) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = onApplyCoupon(promoInput.trim());
    setPromoFeedback({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#E2DACB]">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E0D2] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#B8860B]" />
              <h2 className="font-serif text-lg tracking-wider uppercase text-[#1A1510]">
                Your Shopping Bag ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {onClearBag && items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearBag}
                  className="text-xs text-[#8C7A65] hover:text-[#800020] underline transition-colors cursor-pointer font-medium"
                  id="clear-bag-btn"
                >
                  Clear Bag
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-[#736453] hover:text-[#1A1510] rounded-full hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                id="cart-drawer-close-btn"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Shipping Progress Bar */}
          <div className="bg-[#FAF4E8] px-5 py-3 border-b border-[#EBDDBF] text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#69542E] mb-1.5">
                Add <strong className="text-[#1A1510]">{formatPrice(remainingForFreeShipping, currency)}</strong> more for complimentary insured worldwide shipping.
              </p>
            ) : (
              <p className="text-[#205A32] font-semibold flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={16} /> Complimentary worldwide shipping unlocked!
              </p>
            )}
            <div className="w-full bg-[#E5D5B8] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B8860B] h-full transition-all duration-500 rounded-full"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0EBE0] flex items-center justify-center mx-auto text-[#A3927B]">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif text-lg text-[#1A1510]">Your bag is presently empty</h3>
                <p className="text-xs text-[#786857] max-w-xs mx-auto">
                  Explore our handcrafted daily wear, soft silk, designer, and bridal wedding sarees.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#1C1814] text-[#F3EBD4] px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 p-3 bg-white rounded-lg border border-[#EDE5D8] shadow-xs"
                >
                  <img
                    src={getCustomProductImage(item.product.id, item.product.images[0])}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded bg-[#F2EFE9] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-medium text-[#1A1510] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.size)}
                          className="text-[#968676] hover:text-[#800020] p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#736352] mt-0.5">Size: {item.size}</p>
                      <p className="text-xs font-semibold text-[#1A1510] mt-1">
                        {formatPrice(item.product.priceINR, currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-[#DDD3C2] rounded bg-[#FAF8F5]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#524436] hover:bg-[#EBE2D3]"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-medium text-[#1A1510]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#524436] hover:bg-[#EBE2D3]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8E0D2] bg-white space-y-3">
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C7A65]" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. AAVIRA10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-2.5 pl-8 py-1.5 text-xs text-[#1A1510] uppercase tracking-wider focus:outline-none focus:border-[#B8860B]"
                      id="cart-promo-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#2D241C] text-[#F3EBD4] px-3.5 py-1.5 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#42362B] transition-colors"
                    id="cart-apply-promo-btn"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p className={`text-[11px] ${promoFeedback.isError ? 'text-[#800020]' : 'text-[#205A32]'}`}>
                    {promoFeedback.text}
                  </p>
                )}
                {couponCode && (
                  <div className="flex items-center justify-between text-[11px] text-[#205A32] bg-[#EFF8F1] px-2 py-1 rounded">
                    <span>Active code: <strong>{couponCode}</strong> ({discountPercentage}% OFF)</span>
                    <button
                      type="button"
                      onClick={() => onApplyCoupon('')}
                      className="text-[#800020] hover:underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Cost Lines */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#EFE8DC]">
                <div className="flex justify-between text-[#736352]">
                  <span>Subtotal</span>
                  <span>{formatPrice(rawSubtotalINR, currency)}</span>
                </div>
                {discountINR > 0 && (
                  <div className="flex justify-between text-[#205A32] font-medium">
                    <span>VIP Privilege Discount</span>
                    <span>-{formatPrice(discountINR, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#736352]">
                  <span>Insured Global Delivery</span>
                  <span>{remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at step 2'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1A1510] pt-1.5 border-t border-[#EFE8DC]">
                  <span>Grand Total</span>
                  <span className="font-serif text-base text-[#1A1510]">
                    {formatPrice(finalTotalINR, currency)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#1C1814] text-[#F3EBD4] py-3.5 rounded text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#332920] transition-colors flex items-center justify-center gap-2 shadow-md"
                id="cart-checkout-btn"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={15} />
              </button>

              {/* Payment Methods Available */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#736352]">
                <span className="flex items-center gap-1 font-medium text-[#205A32]">
                  <Banknote size={13} />
                  <span>Cash on Delivery</span>
                </span>
                <span className="text-[#D9D0C1]">•</span>
                <span className="flex items-center gap-1 font-medium text-[#8C6D2B]">
                  <Smartphone size={13} />
                  <span>Instant UPI</span>
                </span>
                <span className="text-[#D9D0C1]">•</span>
                <span className="flex items-center gap-1 text-[#5A4B3C]">
                  <ShieldCheck size={13} />
                  <span>Insured</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
