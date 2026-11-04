import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { getCustomProductImage } from '../utils/productImageStore';

interface DeleteConfirmModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (productId: string) => void;
  currency: Currency;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmDelete,
  currency,
}) => {
  if (!isOpen || !product) return null;

  const frontImage = getCustomProductImage(product.id, product.images[0] || '', 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id="delete-product-confirm-modal"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="bg-[#FFF5F5] px-6 py-5 border-b border-[#F5D5D5] flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-serif text-lg font-semibold text-[#1A1510]">
              Delete Product from Catalog?
            </h3>
            <p className="text-xs text-[#736352] mt-0.5">
              This will remove the product from all shop pages, bestsellers, and atelier listings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#736352] hover:text-[#1A1510] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E0D2]">
            <img
              src={frontImage}
              alt={product.name}
              className="w-16 h-20 object-cover rounded-md border border-[#E8E0D2] shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-[#B8860B] tracking-wider">
                {product.category}
              </span>
              <h4 className="font-serif text-sm font-semibold text-[#1A1510] truncate">
                {product.name}
              </h4>
              <p className="text-xs text-[#736352] truncate mt-0.5">
                {product.fabric}
              </p>
              <p className="font-serif text-sm font-bold text-[#800020] mt-1">
                {formatPrice(product.priceINR, currency)}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#524436] bg-[#FFF8F0] p-3 rounded-lg border border-[#F2E0CE] leading-relaxed">
            <strong>Note:</strong> Patrons will no longer be able to browse or purchase this creation. Any pending orders containing this product will remain archived in the order history.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#4A3E33] hover:text-[#1A1510] hover:bg-[#FAF8F5] rounded-lg border border-[#D9D0C1] transition-colors cursor-pointer"
            >
              Keep Product
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(product.id);
                onClose();
              }}
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#800020] hover:bg-[#600018] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
