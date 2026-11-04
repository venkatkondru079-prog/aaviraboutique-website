import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Info,
  DollarSign,
  Layers,
  Plus,
} from 'lucide-react';
import { Product, ProductCategory, CATEGORY_LABELS } from '../types';
import { saveProductImage, getCustomProductImage } from '../utils/productImageStore';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  onDelete?: (productId: string) => void;
}

const ALL_CATEGORIES: ProductCategory[] = [
  'daily-wear',
  'dharmavaram-silk',
  'venkatagiri-silk',
  'venkatagiri-vintage',
  'bridal-sarees',
];

const PRESET_TAGS: Array<'Bestseller' | 'Heritage Weave' | 'New Season' | 'Bridal Exclusive' | 'Limited Edition' | 'None'> = [
  'None',
  'Bestseller',
  'Heritage Weave',
  'New Season',
  'Bridal Exclusive',
  'Limited Edition',
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'specifications'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      // Clone product
      setFormData({
        ...product,
        images: [...product.images],
        sizes: [...product.sizes],
        specifications: { ...product.specifications },
      });
      setActiveTab('basic');
      setSaveSuccess(false);
      setFormError(null);
    }
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (
    field: keyof Product,
    value: any
  ) => {
    setFormError(null);
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSpecChange = (field: string, value: string) => {
    setFormError(null);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            specifications: {
              ...prev.specifications,
              [field]: value,
            },
          }
        : null
    );
  };

  const handleImageFileChange = async (index: number, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      // Save to image store for this product slot
      await saveProductImage(formData.id, dataUrl, undefined, index);

      // Update formData images array
      const nextImages = [...formData.images];
      nextImages[index] = dataUrl;
      setFormData({ ...formData, images: nextImages });
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData({
      ...formData,
      images: [...formData.images, newImageUrl.trim()],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      setFormError('A creation must have at least one product photo.');
      return;
    }
    const nextImages = formData.images.filter((_, idx) => idx !== index);
    setFormData({ ...formData, images: nextImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter a valid product name.');
      return;
    }
    if (formData.priceINR <= 0) {
      setFormError('Please enter a valid price in INR.');
      return;
    }

    setFormError(null);
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id="edit-product-modal"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#EADBCE] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E8E0D2] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold text-[#B8860B] tracking-wider px-2 py-0.5 rounded bg-[#FAF4E8] border border-[#EADBB8]">
                Editing Product
              </span>
              <span className="text-xs text-[#736352] font-mono">ID: {formData.id}</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1510] truncate mt-1">
              {formData.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#736352] hover:text-[#1A1510] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8E0D2] bg-[#FDFBF7] px-6 shrink-0 gap-6 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'basic'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-[#736352] hover:text-[#1A1510]'
            }`}
          >
            Basic & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'images'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-[#736352] hover:text-[#1A1510]'
            }`}
          >
            <ImageIcon size={14} />
            <span>Photos & Angles ({formData.images.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specifications')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specifications'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-[#736352] hover:text-[#1A1510]'
            }`}
          >
            <Layers size={14} />
            <span>Specifications & Note</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-6">
          {formError && (
            <div className="p-3 bg-[#FAF0F2] border border-[#F3D5DB] text-[#800020] rounded-xl text-xs flex items-center justify-between">
              <span className="font-medium">⚠️ {formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-[#800020] hover:text-[#4A0012] font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: Basic & Pricing */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Creation Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]"
                    placeholder="e.g. Royal Korvai Kanchipuram Bridal Saree"
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Subtitle / Motif Description
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Pure Mulberry Silk with 24K Gold Zari Temple Borders"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Saree Portfolio Type *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value as ProductCategory)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Badge */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Spotlight Tag
                  </label>
                  <select
                    value={formData.tag || 'None'}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleInputChange('tag', val === 'None' ? undefined : val);
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  >
                    {PRESET_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag === 'None' ? 'No Tag (Standard)' : tag}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price (INR) */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.priceINR}
                    onChange={(e) => handleInputChange('priceINR', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] font-mono focus:outline-none focus:border-[#B8860B]"
                    placeholder="18500"
                  />
                </div>

                {/* Original Price / MRP (INR) */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Original Price / MRP (₹) (Optional Strikethrough)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPriceINR || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      handleInputChange('originalPriceINR', val);
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] font-mono focus:outline-none focus:border-[#B8860B]"
                    placeholder="24500"
                  />
                </div>

                {/* Fabric */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => handleInputChange('fabric', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Pure Mulberry Silk"
                  />
                </div>

                {/* Saree Pattern & Motifs */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Saree Pattern / Motifs
                  </label>
                  <input
                    type="text"
                    value={formData.pattern || formData.specifications?.pattern || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              pattern: val,
                              specifications: {
                                ...prev.specifications,
                                pattern: val,
                              },
                            }
                          : null
                      );
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Kalamkari Hand Block Print & Floral Jaal"
                  />
                </div>

                {/* Color Name & Hex */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Color Name & Swatch
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="flex-1 bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                      placeholder="e.g. Crimson & Gold"
                    />
                    <input
                      type="color"
                      value={formData.colorHex || '#800020'}
                      onChange={(e) => handleInputChange('colorHex', e.target.value)}
                      className="w-10 h-10 rounded border border-[#DDD3C2] cursor-pointer p-0.5 bg-white"
                      title="Select shade hex"
                    />
                  </div>
                </div>

                {/* Inventory: Stock Count */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Stock Available (Quantity)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => {
                      const count = Math.max(0, Number(e.target.value));
                      handleInputChange('stockCount', count);
                      if (count === 0) handleInputChange('inStock', false);
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] font-mono focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => handleInputChange('inStock', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#205A32]"></div>
                    <span className="ml-3 text-xs font-semibold text-[#1A1510]">
                      {formData.inStock ? 'In Stock (Available)' : 'Out of Stock'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider">
                    Product Description
                  </label>
                  {formData.category === 'daily-wear' && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('description', 'Daily wear saree without blouse.')}
                      className="text-[11px] text-[#800020] hover:underline font-medium cursor-pointer"
                    >
                      Use standard: "Daily wear saree without blouse."
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg p-3 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  placeholder={
                    formData.category === 'daily-wear'
                      ? 'Daily wear saree without blouse.'
                      : 'Detailed aesthetic description of the saree weave, drape feel, and pallu detailing...'
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 2: Images & Angles */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E0D2] flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1A1510]">
                    Catalog Angles & Drag-Drop Photos
                  </h4>
                  <p className="text-xs text-[#736352] mt-0.5">
                    Image 1 serves as the Front View. Image 2 serves as the Hover Drape View.
                  </p>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-[#E8E0D2] rounded-xl overflow-hidden shadow-xs flex flex-col"
                  >
                    <div className="relative aspect-3/4 bg-[#FAF8F5] overflow-hidden group">
                      <img
                        src={getCustomProductImage(formData.id, img, idx)}
                        alt={`Slot ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <label className="px-3 py-1.5 bg-white text-[#1A1510] hover:bg-[#C5A059] hover:text-white rounded-md text-xs font-semibold tracking-wider uppercase cursor-pointer flex items-center gap-1.5 shadow-md transition-colors">
                          <Upload size={13} />
                          <span>Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFileChange(idx, file);
                            }}
                          />
                        </label>
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="px-3 py-1.5 bg-[#800020] text-white hover:bg-red-700 rounded-md text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Remove Slot</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-white border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1A1510]">
                        {idx === 0 ? 'Front View (Primary)' : idx === 1 ? 'Hover View (Second)' : `Angle ${idx + 1}`}
                      </span>
                      <label className="text-[11px] text-[#800020] hover:underline cursor-pointer flex items-center gap-1 font-medium">
                        <Upload size={11} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageFileChange(idx, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Image by URL */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D2] space-y-3">
                <h5 className="text-xs font-semibold text-[#4A3E33] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} className="text-[#800020]" />
                  <span>Add Additional Angle via URL</span>
                </h5>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/saree-detail-angle.jpg"
                    className="flex-1 bg-white border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-xs text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-[#1C1814] text-[#F3EBD4] rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#332920] cursor-pointer"
                  >
                    Add Angle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Specifications & Note */}
          {activeTab === 'specifications' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Artisan Note */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                  Artisan / Master Weaver Note
                </label>
                <textarea
                  rows={2}
                  value={formData.artisanNote}
                  onChange={(e) => handleInputChange('artisanNote', e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg p-3 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                  placeholder="e.g. Loomed by 4th-generation master weavers in Kanchipuram using heritage pit looms."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Weave Technique
                  </label>
                  <input
                    type="text"
                    value={formData.specifications?.weaveType || ''}
                    onChange={(e) => handleSpecChange('weaveType', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. 3-Ply Pit Loom Korvai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Zari Type
                  </label>
                  <input
                    type="text"
                    value={formData.specifications?.zariType || ''}
                    onChange={(e) => handleSpecChange('zariType', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Certified Pure 24K Gold Plated Zari"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Handloom Origin
                  </label>
                  <input
                    type="text"
                    value={formData.specifications?.origin || ''}
                    onChange={(e) => handleSpecChange('origin', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Kanchipuram, Tamil Nadu"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider">
                      Blouse Piece Specification
                    </label>
                    {formData.category === 'daily-wear' && (
                      <button
                        type="button"
                        onClick={() => handleSpecChange('blousePiece', 'Without blouse (5.5m pure saree length)')}
                        className="text-[11px] text-[#800020] hover:underline font-medium cursor-pointer"
                      >
                        Set: "Without blouse"
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.specifications?.blousePiece || ''}
                    onChange={(e) => handleSpecChange('blousePiece', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder={
                      formData.category === 'daily-wear'
                        ? 'Without blouse (5.5m pure saree length)'
                        : 'e.g. Contrast Crimson Brocade (0.8m Included)'
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Saree Pattern / Motif Detailing
                  </label>
                  <input
                    type="text"
                    value={formData.pattern || formData.specifications?.pattern || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              pattern: val,
                              specifications: {
                                ...prev.specifications,
                                pattern: val,
                              },
                            }
                          : null
                      );
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Korvai Temple Gopuram Borders with Kalash Buttas"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3E33] uppercase tracking-wider mb-1">
                    Care & Preservation Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.specifications?.careInstructions || ''}
                    onChange={(e) => handleSpecChange('careInstructions', e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-lg px-3.5 py-2 text-sm text-[#1A1510] focus:outline-none focus:border-[#B8860B]"
                    placeholder="e.g. Strictly dry clean only. Wrap in breathable muslin cloth."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#E8E0D2] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(formData.id);
                  }}
                  className="text-xs text-[#800020] hover:text-red-700 font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-[#800020]/5 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Product from Boutique</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#4A3E33] hover:text-[#1A1510] hover:bg-[#FAF8F5] rounded-lg border border-[#D9D0C1] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#1C1814] text-[#F3EBD4] hover:bg-[#332920] rounded-lg text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} className="text-[#55E685]" />
                    <span>Saved Successfully!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Check size={14} className="text-[#C5A059]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
