import React, { useState, useEffect } from 'react';
import { Currency, PageTab, Product, CartItem, Order, CustomerInquiry, WorkSchedule } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_WORK_SCHEDULES } from './data/products';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';
import { AccountView } from './views/AccountView';
import { ReturnPolicyView } from './views/ReturnPolicyView';
import { FestiveAdPoster } from './components/FestiveAdPoster';
import { MessageCircle, Instagram } from 'lucide-react';
import { AiChatbot } from './components/AiChatbot';
import { EditProductModal } from './components/EditProductModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import {
  getCustomProductImage,
  getCustomProductImages,
  safeSetLocalStorage,
  saveToIndexedDb,
  getFromIndexedDb,
  getProductFilename,
} from './utils/productImageStore';

const CART_STORAGE_KEY = 'aavira_cart_items_v2';
const WISHLIST_STORAGE_KEY = 'aavira_wishlist_ids_v2';
const ORDERS_STORAGE_KEY = 'aavira_orders_v2';
const PRODUCTS_STORAGE_KEY = 'aavira_products_catalog_v8';

// Helper to sanitize product objects before storage by stripping any heavy base64 data URLs
// Custom images are already preserved in IndexedDB, memory cache, and server assets
const sanitizeProductsForStorage = (productList: Product[]): Product[] => {
  return productList.map((p) => ({
    ...p,
    images: p.images.map((img, idx) => {
      if (img && img.startsWith('data:image/')) {
        const initialProd = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
        if (initialProd && initialProd.images[idx]) {
          return initialProd.images[idx];
        }
        return `/assets/sarees/${getProductFilename(p.id, idx)}`;
      }
      return img;
    }),
  }));
};

const sanitizeCartForStorage = (items: CartItem[]): CartItem[] => {
  return items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      images: item.product.images.map((img, idx) => {
        if (img && img.startsWith('data:image/')) {
          const initialProd = INITIAL_PRODUCTS.find((ip) => ip.id === item.product.id);
          if (initialProd && initialProd.images[idx]) {
            return initialProd.images[idx];
          }
          return `/assets/sarees/${getProductFilename(item.product.id, idx)}`;
        }
        return img;
      }),
    },
  }));
};

const sanitizeOrdersForStorage = (ordersList: Order[]): Order[] => {
  return ordersList.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      let image = item.image;
      if (image && image.startsWith('data:image/')) {
        const initialProd = INITIAL_PRODUCTS.find((ip) => ip.id === item.productId);
        image = (initialProd && initialProd.images[0]) ? initialProd.images[0] : `/assets/sarees/${getProductFilename(item.productId, 0)}`;
      }
      return {
        ...item,
        image,
      };
    }),
  }));
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('home');
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
          const parsedIds = new Set(parsed.map((p: Product) => p.id));

          const mapped = parsed
            .map((p: Product) => {
              const initial = initialMap.get(p.id);
              if (!initial) return null;
              if (p.category === 'daily-wear' && initial) {
                return {
                  ...initial,
                  ...p,
                  category: 'daily-wear' as const,
                  priceINR: initial.priceINR,
                  originalPriceINR: initial.originalPriceINR,
                  tag: initial.tag,
                  description: initial.description,
                  specifications: {
                    ...initial.specifications,
                    ...p.specifications,
                    blousePiece: initial.specifications?.blousePiece || 'Without blouse (5.5m pure saree length)',
                  },
                  sizes: initial.sizes,
                  images: getCustomProductImages(
                    p.id,
                    p.images?.length && !p.images.some((img) => img.includes('NaN'))
                      ? p.images
                      : initial.images
                  ),
                };
              }
              return {
                ...initial,
                ...p,
                category: initial.category,
                images: getCustomProductImages(
                  p.id,
                  p.images?.length && !p.images.some((img) => img.includes('NaN'))
                    ? p.images
                    : initial.images
                ),
              };
            })
            .filter((p): p is Product => p !== null);

          // Ensure any new products from INITIAL_PRODUCTS are merged
          const newProducts = INITIAL_PRODUCTS.filter((ip) => !parsedIds.has(ip.id)).map((ip) => ({
            ...ip,
            images: getCustomProductImages(ip.id, ip.images),
          }));

          return [...mapped, ...newProducts];
        }
      }
    } catch (e) {
      console.error('Error loading saved products catalog:', e);
    }
    return INITIAL_PRODUCTS.map((p) => ({
      ...p,
      images: getCustomProductImages(p.id, p.images),
    }));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(INITIAL_WORK_SCHEDULES);
  const [customerInquiries, setCustomerInquiries] = useState<CustomerInquiry[]>([]);
  const [currency, setCurrency] = useState<Currency>('INR');

  // Cart & Wishlist state with persistent localStorage sync
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [accountSubTab, setAccountSubTab] = useState<'orders' | 'wishlist' | 'measurements'>('orders');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Sync products catalog to localStorage and IndexedDB whenever modified
  useEffect(() => {
    try {
      const cleanCatalog = sanitizeProductsForStorage(products);
      const jsonStr = JSON.stringify(cleanCatalog);
      safeSetLocalStorage(PRODUCTS_STORAGE_KEY, jsonStr);
      saveToIndexedDb('aavira_products_catalog_db_v8', jsonStr).catch(() => {});
    } catch (e) {
      console.warn('Could not persist products catalog:', e);
    }
  }, [products]);

  // Hydrate products catalog from IndexedDB fallback if available
  useEffect(() => {
    getFromIndexedDb('aavira_products_catalog_db_v8').then((savedDb) => {
      if (savedDb) {
        try {
          const parsed = JSON.parse(savedDb);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts((prev) => {
              const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
              const validProducts = parsed
                .filter((p: Product) => initialMap.has(p.id) || p.id.startsWith('custom-'))
                .map((p: Product) => {
                  const init = initialMap.get(p.id);
                  return {
                    ...(init || {}),
                    ...p,
                    category: init ? init.category : p.category,
                    images: getCustomProductImages(p.id, p.images),
                  };
                });
              if (validProducts.length >= INITIAL_PRODUCTS.length) {
                return validProducts;
              }
              return prev;
            });
          }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Discount / Coupons
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Navigation props
  const [shopCategory, setShopCategory] = useState<string>('all');
  const [shopSearch, setShopSearch] = useState<string>('');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle URL hash or tab query parameters (e.g. ?tab=returns or #returns)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as PageTab | null;
      const hash = window.location.hash.replace('#', '') as PageTab;
      if (tabParam && ['home', 'shop', 'about', 'contact', 'admin', 'account', 'returns'].includes(tabParam)) {
        setCurrentTab(tabParam);
      } else if (hash && ['home', 'shop', 'about', 'contact', 'admin', 'account', 'returns'].includes(hash)) {
        setCurrentTab(hash);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Listen to product image update events
  useEffect(() => {
    const handleProductImageUpdated = (e: any) => {
      const { productId, dataUrl, imageIndex = 0 } = e.detail || {};
      const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;
      if (productId) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            const updatedImages = [...p.images];
            if (dataUrl) {
              if (idx < updatedImages.length) {
                updatedImages[idx] = dataUrl;
              } else {
                updatedImages.push(dataUrl);
              }
            } else {
              const defaultP = INITIAL_PRODUCTS.find((ip) => ip.id === productId);
              if (defaultP && defaultP.images[idx]) {
                updatedImages[idx] = defaultP.images[idx];
              }
            }
            return {
              ...p,
              images: updatedImages,
            };
          })
        );
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.product.id !== productId) return item;
            const updatedImages = [...item.product.images];
            if (dataUrl) {
              if (idx < updatedImages.length) {
                updatedImages[idx] = dataUrl;
              } else {
                updatedImages.push(dataUrl);
              }
            }
            return {
              ...item,
              product: {
                ...item.product,
                images: updatedImages,
              },
            };
          })
        );
        setQuickViewProduct((prev) => {
          if (!prev || prev.id !== productId) return prev;
          const updatedImages = [...prev.images];
          if (dataUrl) {
            if (idx < updatedImages.length) {
              updatedImages[idx] = dataUrl;
            } else {
              updatedImages.push(dataUrl);
            }
          }
          return {
            ...prev,
            images: updatedImages,
          };
        });
      }
    };

    const handleHydrated = () => {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          images: getCustomProductImages(p.id, p.images),
        }))
      );
    };

    window.addEventListener('aavira:product-image-updated', handleProductImageUpdated);
    window.addEventListener('aavira:product-images-hydrated', handleHydrated);
    return () => {
      window.removeEventListener('aavira:product-image-updated', handleProductImageUpdated);
      window.removeEventListener('aavira:product-images-hydrated', handleHydrated);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      const cleanCart = sanitizeCartForStorage(cartItems);
      safeSetLocalStorage(CART_STORAGE_KEY, JSON.stringify(cleanCart));
    } catch (e) {
      console.warn('Could not persist cart items:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      safeSetLocalStorage(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn('Could not persist wishlist:', e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      const cleanOrders = sanitizeOrdersForStorage(orders);
      const jsonStr = JSON.stringify(cleanOrders);
      safeSetLocalStorage(ORDERS_STORAGE_KEY, jsonStr);
      saveToIndexedDb('aavira_orders_db', jsonStr).catch(() => {});
    } catch (e) {
      console.warn('Could not persist orders:', e);
    }
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Cart actions
  const handleAddToCart = (product: Product, size: string, quantity: number) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id && item.size === size);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, size, quantity }];
    });
    showToast(`Added "${product.name}" to your couture bag.`);
  };

  const handleUpdateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountPercentage(0);
    try {
      safeSetLocalStorage(CART_STORAGE_KEY, '[]');
    } catch (e) {
      console.warn(e);
    }
    showToast('Shopping bag cleared.');
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
    try {
      safeSetLocalStorage(WISHLIST_STORAGE_KEY, '[]');
    } catch (e) {
      console.warn(e);
    }
    showToast('Wishlist cleared.');
  };

  // Wishlist actions
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from your wishlist.');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist.');
        return [...prev, productId];
      }
    });
  };

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    if (!code) {
      setCouponCode('');
      setDiscountPercentage(0);
      return { success: true, message: 'Coupon removed' };
    }
    if (code === 'AAVIRA10') {
      setCouponCode('AAVIRA10');
      setDiscountPercentage(10);
      return { success: true, message: 'Privilege code applied: 10% VIP reduction applied to your bag.' };
    }
    if (code === 'RAMANI20') {
      setCouponCode('RAMANI20');
      setDiscountPercentage(20);
      return { success: true, message: 'Founder VIP code applied: 20% privilege deduction!' };
    }
    return { success: false, message: 'Invalid or expired privilege coupon code.' };
  };

  // Order Placement
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Clear product details in the shopping bag
    setCartItems([]);
    setCouponCode('');
    setDiscountPercentage(0);
    // Clear product details in the wishlist
    setWishlistIds([]);
    try {
      safeSetLocalStorage(CART_STORAGE_KEY, '[]');
      safeSetLocalStorage(WISHLIST_STORAGE_KEY, '[]');
    } catch (e) {
      console.warn(e);
    }
    showToast(`Order ${newOrder.id} registered! Shopping bag and wishlist cleared.`);
  };

  // Admin Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return {
          ...ord,
          status: newStatus,
          paymentStatus: newStatus === 'Paid' ? 'Received' : ord.paymentStatus,
          paymentReceivedAt: newStatus === 'Paid' ? (ord.paymentReceivedAt || todayStr) : ord.paymentReceivedAt,
          deliveredAt: newStatus === 'Delivered' ? (ord.deliveredAt || todayStr) : ord.deliveredAt,
          customerConfirmedDelivery: newStatus === 'Delivered' ? true : ord.customerConfirmedDelivery,
        };
      })
    );
    showToast(`Order ${orderId} marked as ${newStatus}.`);
  };

  const handleConfirmDelivery = (orderId: string, rating?: number, feedback?: string) => {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'Delivered',
              deliveredAt: ord.deliveredAt || todayStr,
              customerConfirmedDelivery: true,
              customerRating: rating || 5,
              customerFeedback: feedback || 'Received in pristine heirloom condition.',
            }
          : ord
      )
    );
    showToast(`Delivery confirmed for ${orderId}! Thank you for choosing Aavira Haute Couture.`);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" registered in the live catalog.`);
  };

  const handleToggleStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const handleStartEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleStartDeleteProduct = (productOrId: Product | string) => {
    if (typeof productOrId === 'string') {
      const found = products.find((p) => p.id === productOrId);
      if (found) {
        setDeletingProduct(found);
      }
    } else {
      setDeletingProduct(productOrId);
    }
  };

  const handleSaveEditedProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
    if (quickViewProduct?.id === updatedProduct.id) {
      setQuickViewProduct(updatedProduct);
    }
    window.dispatchEvent(
      new CustomEvent('aavira:product-updated', {
        detail: { productId: updatedProduct.id, product: updatedProduct },
      })
    );
    showToast(`Creation "${updatedProduct.name}" updated successfully.`);
  };

  const handleConfirmDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const prodName = prod ? prod.name : 'Creation';

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlistIds((prev) => prev.filter((id) => id !== productId));

    if (quickViewProduct?.id === productId) {
      setQuickViewProduct(null);
    }
    showToast(`"${prodName}" has been removed from the boutique catalog.`);
  };

  // Work Schedule & Inquiries Handlers
  const handleInquirySubmitted = (inquiry: CustomerInquiry) => {
    setCustomerInquiries((prev) => [inquiry, ...prev]);
    const newSchedule: WorkSchedule = {
      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      title: `Consultation: ${inquiry.inquiryType}`,
      category: 'bridal_fitting',
      assignee: 'Mrs. K. Ramani (Managing Director)',
      role: 'Founder & Managing Director',
      date: inquiry.preferredDate || new Date().toISOString().split('T')[0],
      timeSlot: '02:00 PM – 03:30 PM',
      clientName: inquiry.name,
      priority: 'High',
      status: 'Scheduled',
      location: 'VIP Bridal Salon / Video Suite',
      notes: `Direct inquiry from ${inquiry.name}. Contact: ${inquiry.phone}, ${inquiry.email}. Message: "${inquiry.message}"`,
    };
    setWorkSchedules((prev) => [newSchedule, ...prev]);
    showToast(`Bridal consultation for ${inquiry.name} added to Mrs. K. Ramani's schedule.`);
  };

  const handleUpdateScheduleStatus = (scheduleId: string, newStatus: WorkSchedule['status']) => {
    setWorkSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s))
    );
    showToast(`Schedule ${scheduleId} marked as ${newStatus}.`);
  };

  const handleAddSchedule = (schedule: WorkSchedule) => {
    setWorkSchedules((prev) => [schedule, ...prev]);
    showToast(`New work schedule "${schedule.title}" assigned.`);
  };

  // Search submit from header
  const handleHeaderSearch = (query: string) => {
    setShopSearch(query);
    setShopCategory('all');
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelectFromHome = (category: string) => {
    setShopCategory(category);
    setShopSearch('');
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: PageTab) => {
    // When coming out from admin panel to outside pages, terminate admin authentication immediately
    if (tab !== 'admin' || currentTab === 'admin') {
      try {
        sessionStorage.removeItem('aavira_admin_authenticated');
      } catch {}
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1E1E]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-36 right-6 z-50 bg-[#1C1814] text-[#F3EBD4] text-xs px-4 py-3 rounded-lg shadow-2xl border border-[#C5A059]/40 flex items-center gap-2 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          setAccountSubTab('wishlist');
          handleNavigate('account');
        }}
        onSearchSubmit={handleHeaderSearch}
      />

      {/* Dusshera Sale Ad Poster on All Pages Below Main Menu Bar */}
      <FestiveAdPoster
        onNavigate={handleNavigate}
        onSelectCategory={handleCategorySelectFromHome}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            products={products}
            currency={currency}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            onSelectCategory={handleCategorySelectFromHome}
          />
        )}

        {currentTab === 'shop' && (
          <ShopView
            products={products}
            currency={currency}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onEditProduct={handleStartEditProduct}
            onDeleteProduct={handleStartDeleteProduct}
            initialCategory={shopCategory}
            initialSearch={shopSearch}
          />
        )}

        {currentTab === 'about' && <AboutView onNavigate={handleNavigate} />}

        {currentTab === 'contact' && (
          <ContactView
            onInquirySubmitted={handleInquirySubmitted}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView
            products={products}
            orders={orders}
            currency={currency}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddProduct={handleAddProduct}
            onToggleStock={handleToggleStock}
            workSchedules={workSchedules}
            inquiries={customerInquiries}
            onUpdateScheduleStatus={handleUpdateScheduleStatus}
            onAddSchedule={handleAddSchedule}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'returns' && (
          <ReturnPolicyView
            onNavigate={handleNavigate}
            orders={orders}
            onSelectCategory={handleCategorySelectFromHome}
          />
        )}

        {currentTab === 'account' && (
          <AccountView
            orders={orders}
            products={products}
            wishlistIds={wishlistIds}
            currency={currency}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleToggleWishlist}
            onNavigate={handleNavigate}
            initialSubTab={accountSubTab}
            onClearWishlist={handleClearWishlist}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}
      </main>

      {/* Footer */}
      {currentTab !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onSelectCategory={handleCategorySelectFromHome}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(productId, size) => handleRemoveFromCart(productId, size)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        discountPercentage={discountPercentage}
        onApplyCoupon={handleApplyCoupon}
        couponCode={couponCode}
        onClearBag={handleClearCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        discountPercentage={discountPercentage}
        onOrderPlaced={handleOrderPlaced}
        onClearCart={handleClearCart}
        onClearWishlist={handleClearWishlist}
      />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          currency={currency}
          isWishlisted={wishlistIds.includes(quickViewProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onEdit={handleStartEditProduct}
        />
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEditedProduct}
        onDelete={handleStartDeleteProduct}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        currency={currency}
        onClose={() => setDeletingProduct(null)}
        onConfirmDelete={handleConfirmDeleteProduct}
      />

      {/* Floating Social & Concierge Actions (Right Bottom on All Pages) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3" id="floating-concierge-stack">
        {/* AI Chatbot Floating Trigger & Conversation Window */}
        <AiChatbot />

        {/* WhatsApp Chat Floating Circular Button */}
        <a
          href="https://wa.me/919347159353?text=Hello%20Aavira%20Haute%20Couture,%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="relative group w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-[#25D366]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer"
          title="Chat with us on WhatsApp: +91 9347159353"
          id="floating-whatsapp-btn"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle size={22} className="fill-white text-white group-hover:scale-110 transition-transform" />

          {/* Pulsing online badge */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-[#25D366] rounded-full"></span>

          {/* Hover Tooltip */}
          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1C1814] text-[#FAF6ED] text-[11px] font-medium rounded-md border border-[#25D366]/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
            WhatsApp Concierge
          </span>
        </a>

        {/* Instagram Follow Us Floating Circular Button */}
        <a
          href="https://www.instagram.com/aavira.boutique/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#F56040] text-white shadow-xl hover:shadow-[#E1306C]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer"
          title="Follow Us on Instagram: @aavira.boutique"
          id="floating-instagram-btn"
          aria-label="Follow Us on Instagram"
        >
          <Instagram size={22} strokeWidth={2.2} className="group-hover:rotate-6 transition-transform" />

          {/* Hover Tooltip */}
          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1C1814] text-[#FAF6ED] text-[11px] font-medium rounded-md border border-[#E1306C]/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
            Follow on Instagram
          </span>
        </a>
      </div>
    </div>
  );
}
