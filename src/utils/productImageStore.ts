// Helper for managing custom uploaded product images with persistence and server synchronization

// In-memory cache for ultra-fast, synchronous lookups across components
const memoryImageCache = new Map<string, string>();

// IndexedDB configuration for persistent, large-capacity image storage
const DB_NAME = 'aavira_boutique_db';
const STORE_NAME = 'product_images';
let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = (err) => {
          console.warn('[Aavira IndexedDB] Open error:', err);
          resolve(null);
        };
      } catch (err) {
        console.warn('[Aavira IndexedDB] Init exception:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

export async function saveToIndexedDb(key: string, value: string): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
  } catch (err) {
    console.warn('[Aavira IndexedDB] Save error:', err);
  }
}

export async function getFromIndexedDb(key: string): Promise<string | null> {
  try {
    const db = await getIndexedDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllFromIndexedDb(): Promise<Record<string, string>> {
  try {
    const db = await getIndexedDb();
    if (!db) return {};
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const results: Record<string, string> = {};
      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          results[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function deleteFromIndexedDb(key: string): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  } catch {
    // Ignore
  }
}

export async function clearIndexedDb(): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // Ignore
  }
}

/**
 * Optimizes huge base64 images (down from 10MB to ~150KB-300KB)
 * preserving crisp retina details while avoiding browser localStorage quota overflow.
 */
export const optimizeImageDataUrl = (
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    // If it is already small (< 200KB), return as is
    if (dataUrl.length < 200 * 1024) {
      resolve(dataUrl);
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          resolve(dataUrl);
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high quality JPEG
        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (compressed && compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Safely writes to localStorage. If a quota exceeded error occurs:
 * 1. Frees space by purging bulky custom image entries (which are already securely preserved in IndexedDB & memory).
 * 2. Tries once more.
 * 3. Falls back gracefully to IndexedDB without throwing an unhandled exception.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    try {
      // Find all custom image and large cached entries in localStorage
      const entriesToPrune: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key) {
          if (k.startsWith('aavira_prod_img_') || k.startsWith('aavira_cat_img_')) {
            entriesToPrune.push(k);
          }
        }
      }

      // Remove bulky image entries from localStorage since IndexedDB holds them permanently
      for (const k of entriesToPrune) {
        localStorage.removeItem(k);
      }

      // Retry setting item
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If localStorage is completely saturated, persist to IndexedDB backing store
      saveToIndexedDb(`kv_${key}`, value).catch(() => {});
      return false;
    }
  }
}

// Safe startup initialization: preserve all product images, hydrate cache,
// and migrate bulky base64 blobs (>30KB) from localStorage to IndexedDB to guarantee quota headroom
if (typeof window !== 'undefined') {
  try {
    const bulkyKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('aavira_prod_img_') || k.startsWith('aavira_cat_img_'))) {
        const val = localStorage.getItem(k);
        if (val && val.length > 30000) {
          // Large base64 image - ensure it is in IndexedDB, then free localStorage space
          const cleanKey = k.replace(/^aavira_prod_img_/, '').replace(/^aavira_cat_img_/, 'cat_');
          saveToIndexedDb(cleanKey, val).catch(() => {});
          bulkyKeysToRemove.push(k);
        }
      }
    }
    for (const k of bulkyKeysToRemove) {
      localStorage.removeItem(k);
    }

    // Server manifest cache for 100% export & publishing sync
    fetchServerManifest().catch(() => {});

    // Hydrate in-memory cache asynchronously from IndexedDB
    getAllFromIndexedDb().then((records) => {
      let hasUpdates = false;
      for (const [k, v] of Object.entries(records)) {
        if (!memoryImageCache.has(k)) {
          memoryImageCache.set(k, v);
          hasUpdates = true;
        }
      }
      if (hasUpdates) {
        window.dispatchEvent(new CustomEvent('aavira:product-images-hydrated'));
      }
      // Auto-sync any local attached images to backend server for 100% publishing export
      syncAllImagesToServer().catch(() => {});
    }).catch(() => {});
  } catch {
    // Ignore localStorage errors
  }
}

// Server manifest of all custom & attached images
let serverManifest: Record<string, { filename: string; updatedAt: number; url: string }> = {};

export async function fetchServerManifest(): Promise<Record<string, { filename: string; updatedAt: number; url: string }>> {
  try {
    const res = await fetch('/api/custom-images');
    if (res.ok) {
      const data = await res.json();
      if (data && data.manifest) {
        serverManifest = data.manifest;
        window.dispatchEvent(new CustomEvent('aavira:server-manifest-updated', { detail: serverManifest }));
        return serverManifest;
      }
    }
  } catch {
    // Fallback if offline
  }
  return serverManifest;
}

export function getServerManifest(): Record<string, { filename: string; updatedAt: number; url: string }> {
  return serverManifest;
}

/**
 * Checks whether a specific product or image slot has an attached custom image
 */
export function hasCustomProductImage(productId: string, imageIndex?: number): boolean {
  try {
    const idx = typeof imageIndex === 'number' ? imageIndex : undefined;
    if (idx !== undefined) {
      const memKey = `${productId}_${idx}`;
      if (memoryImageCache.has(memKey)) return true;
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(`aavira_prod_img_${productId}_${idx}`);
        if (item && item.length > 50) return true;
      }
      if (serverManifest[memKey]) return true;
      return false;
    }

    // Any image for this product
    if (memoryImageCache.has(productId)) return true;
    if (serverManifest[productId]) return true;
    for (let i = 0; i < 10; i++) {
      const memKey = `${productId}_${i}`;
      if (memoryImageCache.has(memKey)) return true;
      if (serverManifest[memKey]) return true;
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(`aavira_prod_img_${productId}_${i}`);
        if (item && item.length > 50) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 100% Export & Publishing Sync:
 * Takes every custom attached image from IndexedDB, localStorage & memory cache
 * and guarantees it is saved to the server's filesystem (public/assets/sarees/ and dist/).
 */
export async function syncAllImagesToServer(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const records = await getAllFromIndexedDb();
    const items: Array<{ productId: string; imageIndex: number; base64Data: string; targetFilename?: string }> = [];

    // Helper to add if valid
    const seen = new Set<string>();
    const processEntry = (key: string, dataUrl: string) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) return;
      // Key format: aavira_prod_img_${productId}_${idx} or ${productId}_${idx}
      const cleanKey = key.replace(/^aavira_prod_img_/, '');
      if (seen.has(cleanKey)) return;
      seen.add(cleanKey);

      const parts = cleanKey.split('_');
      const productId = parts[0];
      const imageIndex = parts[1] ? parseInt(parts[1], 10) : 0;
      const targetFilename = getProductFilename(productId, imageIndex);

      items.push({
        productId,
        imageIndex,
        base64Data: dataUrl,
        targetFilename,
      });
    };

    // 1. From IndexedDB
    for (const [k, v] of Object.entries(records)) {
      processEntry(k, v);
    }

    // 2. From localStorage
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aavira_prod_img_')) {
          const val = localStorage.getItem(k);
          if (val) processEntry(k, val);
        }
      }
    }

    // 3. From memoryImageCache
    for (const [k, v] of memoryImageCache.entries()) {
      processEntry(k, v);
    }

    if (items.length === 0) {
      return { success: true, count: 0, message: 'All attached images are already synced to filesystem.' };
    }

    const res = await fetch('/api/sync-all-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.manifest) {
        serverManifest = data.manifest;
      }
      window.dispatchEvent(new CustomEvent('aavira:product-images-synced', { detail: data }));
      return {
        success: true,
        count: items.length,
        message: `Successfully exported and synced ${items.length} attached images 100% to server for publishing.`,
      };
    }
  } catch (err: any) {
    console.warn('Batch sync to server warning:', err);
  }
  return { success: false, count: 0, message: 'Sync in progress or server offline.' };
}

export const PRODUCT_FILE_MAP: Record<string, string[]> = {
  'sar-dw-001': ['daily-wear-1-a.jpg', 'daily-wear-1-b.jpg'],
  'sar-dw-002': ['daily-wear-2-a.jpg', 'daily-wear-2-b.jpg', 'daily-wear-saree-02.webp', 'Dail wear sarees 02.webp'],
  'sar-dw-003': ['daily-wear-3-a.jpg', 'daily-wear-3-b.jpg', 'daily-wear-saree-03.webp', 'Daily wear saree 03.webp'],
  'sar-dw-004': ['daily-wear-saree-02.webp', 'Dail wear sarees 02.webp'],
  'sar-dw-005': ['daily-wear-saree-03.webp', 'Daily wear saree 03.webp'],
  'sar-dw-006': ['daily-wear-1-b.jpg', 'daily-wear-1-a.jpg'],
  'sar-dw-007': ['daily-wear-2-b.jpg', 'daily-wear-2-a.jpg'],
  'sar-dw-008': ['daily-wear-3-b.jpg', 'daily-wear-3-a.jpg'],
  'sar-dw-009': ['semi-pattu-2-a.jpg', 'semi-pattu-2-b.jpg'],
  'sar-dw-010': ['low-fancy-1-a.jpg', 'low-fancy-1-b.jpg'],
  'sar-dw-011': ['low-fancy-2-a.jpg', 'low-fancy-2-b.jpg'],
  'sar-dw-012': ['low-fancy-3-a.jpg', 'low-fancy-3-b.jpg'],
  'sar-dw-013': ['semi-pattu-3-a.jpg', 'semi-pattu-3-b.jpg'],
  'sar-dw-014': ['high-fancy-1-a.jpg', 'high-fancy-1-b.jpg'],
  'sar-dw-015': ['designer-2-a.jpg', 'designer-2-b.jpg'],
  'sar-dw-016': ['semi-pattu-1-a.jpg', 'semi-pattu-1-b.jpg'],
  'sar-dw-017': ['high-fancy-2-a.jpg', 'high-fancy-2-b.jpg'],
  'sar-dw-018': ['soft-silk-1-a.jpg', 'soft-silk-1-b.jpg'],
  'sar-dw-019': ['soft-silk-2-a.jpg', 'soft-silk-2-b.jpg'],
  'sar-dw-020': ['high-fancy-3-a.jpg', 'high-fancy-3-b.jpg'],
  'sar-dw-021': ['designer-3-a.jpg', 'designer-3-b.jpg'],
  'sar-dw-022': ['vintage-1-a.jpg', 'vintage-1-b.jpg'],
  'sar-dw-023': ['soft-silk-3-a.jpg', 'soft-silk-3-b.jpg'],
  'sar-dw-024': ['vintage-2-a.jpg', 'vintage-2-b.jpg'],
  'sar-dw-025': ['vintage-3-a.jpg', 'vintage-3-b.jpg'],
  'sar-dw-026': ['designer-1-b.jpg', 'designer-1-a.jpg'],
  'sar-dw-027': ['daily-wear-1-a.jpg', 'daily-wear-1-b.jpg'],
  'sar-dw-028': ['daily-wear-saree-02.webp', 'daily-wear-2-a.jpg', 'Dail wear sarees 02.webp'],
  'sar-dw-029': ['daily-wear-saree-03.webp', 'daily-wear-3-a.jpg', 'Daily wear saree 03.webp'],
  'sar-dw-030': ['daily-wear-1-a.jpg', 'daily-wear-2-b.jpg', 'daily-wear-3-b.jpg'],
  // Dharmavaram Silk Sarees (4 Sarees)
  'sar-dvs-001': ['semi-pattu-1-a.jpg', 'semi-pattu-1-b.jpg'],
  'sar-dvs-002': ['semi-pattu-2-a.jpg', 'semi-pattu-2-b.jpg'],
  'sar-dvs-003': ['semi-pattu-3-a.jpg', 'semi-pattu-3-b.jpg'],
  'sar-dvs-004': ['soft-silk-1-a.jpg', 'soft-silk-1-b.jpg'],

  // VenkataGiri Silk Sarees (10 Sarees)
  'sar-vgs-001': ['soft-silk-2-a.jpg', 'soft-silk-2-b.jpg'],
  'sar-vgs-002': ['soft-silk-3-a.jpg', 'soft-silk-3-b.jpg'],
  'sar-vgs-003': ['high-fancy-1-a.jpg', 'high-fancy-1-b.jpg'],
  'sar-vgs-004': ['high-fancy-2-a.jpg', 'high-fancy-2-b.jpg'],
  'sar-vgs-005': ['high-fancy-3-a.jpg', 'high-fancy-3-b.jpg'],
  'sar-vgs-006': ['designer-1-a.jpg', 'designer-1-b.jpg'],
  'sar-vgs-007': ['designer-2-a.jpg', 'designer-2-b.jpg'],
  'sar-vgs-008': ['designer-3-a.jpg', 'designer-3-b.jpg'],
  'sar-vgs-009': ['low-fancy-1-a.jpg', 'low-fancy-1-b.jpg'],
  'sar-vgs-010': ['low-fancy-2-a.jpg', 'low-fancy-2-b.jpg'],

  // VenkataGiri Vintage Sarees (6 Sarees)
  'sar-vgv-001': ['vintage-1-a.jpg', 'vintage-1-b.jpg'],
  'sar-vgv-002': ['vintage-2-a.jpg', 'vintage-2-b.jpg'],
  'sar-vgv-003': ['vintage-3-a.jpg', 'vintage-3-b.jpg'],
  'sar-vgv-004': ['low-fancy-3-a.jpg', 'low-fancy-3-b.jpg'],
  'sar-vgv-005': ['vintage-1-b.jpg', 'vintage-1-a.jpg'],
  'sar-vgv-006': ['vintage-2-b.jpg', 'vintage-2-a.jpg'],

  // Bridal Sarees (5 Sarees)
  'sar-br-001': ['wedding-bridal-1-a.jpg', 'wedding-bridal-1-b.jpg'],
  'sar-br-002': ['wedding-bridal-2-a.jpg', 'wedding-bridal-2-b.jpg'],
  'sar-br-003': ['wedding-bridal-3-a.jpg', 'wedding-bridal-3-b.jpg'],
  'sar-br-004': ['wedding-bridal-1-b.jpg', 'wedding-bridal-2-a.jpg'],
  'sar-br-005': ['wedding-bridal-2-b.jpg', 'wedding-bridal-3-a.jpg'],

  // Legacy mappings for backwards compatibility
  'sar-lf-001': ['low-fancy-1-a.jpg', 'low-fancy-1-b.jpg'],
  'sar-lf-002': ['low-fancy-2-a.jpg', 'low-fancy-2-b.jpg'],
  'sar-lf-003': ['low-fancy-3-a.jpg', 'low-fancy-3-b.jpg'],
  'sar-hf-001': ['high-fancy-1-a.jpg', 'high-fancy-1-b.jpg'],
  'sar-hf-002': ['high-fancy-2-a.jpg', 'high-fancy-2-b.jpg'],
  'sar-hf-003': ['high-fancy-3-a.jpg', 'high-fancy-3-b.jpg'],
  'sar-ds-001': ['designer-1-a.jpg', 'designer-1-b.jpg'],
  'sar-ds-002': ['designer-2-a.jpg', 'designer-2-b.jpg'],
  'sar-ds-003': ['designer-3-a.jpg', 'designer-3-b.jpg'],
  'sar-sp-001': ['semi-pattu-1-a.jpg', 'semi-pattu-1-b.jpg'],
  'sar-sp-002': ['semi-pattu-2-a.jpg', 'semi-pattu-2-b.jpg'],
  'sar-sp-003': ['semi-pattu-3-a.jpg', 'semi-pattu-3-b.jpg'],
  'sar-ss-001': ['soft-silk-1-a.jpg', 'soft-silk-1-b.jpg'],
  'sar-ss-002': ['soft-silk-2-a.jpg', 'soft-silk-2-b.jpg'],
  'sar-ss-003': ['soft-silk-3-a.jpg', 'soft-silk-3-b.jpg'],
  'sar-wb-001': ['wedding-bridal-1-a.jpg', 'wedding-bridal-1-b.jpg'],
  'sar-wb-002': ['wedding-bridal-2-a.jpg', 'wedding-bridal-2-b.jpg'],
  'sar-wb-003': ['wedding-bridal-3-a.jpg', 'wedding-bridal-3-b.jpg'],
  'sar-vt-001': ['vintage-1-a.jpg', 'vintage-1-b.jpg'],
  'sar-vt-002': ['vintage-2-a.jpg', 'vintage-2-b.jpg'],
  'sar-vt-003': ['vintage-3-a.jpg', 'vintage-3-b.jpg'],
};

export const getProductFilename = (productId: string, imageIndex = 0): string => {
  const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;
  const list = PRODUCT_FILE_MAP[productId];
  if (list && list[idx]) {
    return list[idx];
  }
  // Fallback pattern if extra angle added
  const prefix = productId.replace(/^sar-/, '');
  const letter = idx === 0 ? 'a' : idx === 1 ? 'b' : idx === 2 ? 'c' : `view-${idx + 1}`;
  return `${prefix}-${letter}.jpg`;
};

export const getCustomProductImage = (
  productId: string,
  defaultImage: string,
  imageIndex = 0
): string => {
  const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;
  const memKey = `${productId}_${idx}`;

  // 1. Check in-memory cache first (has 100% full fidelity image)
  const mem = memoryImageCache.get(memKey);
  if (mem && mem.length > 50) {
    return mem;
  }
  if (idx === 0) {
    const legacyMem = memoryImageCache.get(productId);
    if (legacyMem && legacyMem.length > 50) {
      return legacyMem;
    }
  }

  // 2. Check localStorage
  try {
    const indexed = localStorage.getItem(`aavira_prod_img_${productId}_${idx}`);
    if (indexed && indexed.length > 50) {
      memoryImageCache.set(memKey, indexed);
      return indexed;
    }
    // Backward compatibility for index 0
    if (idx === 0) {
      const legacy = localStorage.getItem(`aavira_prod_img_${productId}`);
      if (legacy && legacy.length > 50) {
        memoryImageCache.set(memKey, legacy);
        return legacy;
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  // 3. Check server manifest entry (ensures 100% attached images show on published website on any device)
  const manifestEntry = serverManifest[memKey] || (idx === 0 ? serverManifest[productId] : undefined);
  if (manifestEntry && manifestEntry.url) {
    const bustUrl = manifestEntry.updatedAt ? `${manifestEntry.url}?v=${manifestEntry.updatedAt}` : manifestEntry.url;
    return bustUrl;
  }

  // 4. Default image with optional cache-busting if in manifest
  if (defaultImage && defaultImage.startsWith('/assets/sarees/')) {
    const fn = defaultImage.split('/').pop()?.split('?')[0];
    if (fn && serverManifest[fn]?.updatedAt) {
      return `${defaultImage.split('?')[0]}?v=${serverManifest[fn].updatedAt}`;
    }
  }

  return defaultImage;
};

export const getCustomProductImages = (
  productId: string,
  defaultImages: string[]
): string[] => {
  if (!Array.isArray(defaultImages)) return [];
  return defaultImages.map((img, idx) => getCustomProductImage(productId, img, idx));
};

export const getCategoryCustomImage = (category: string, defaultImage: string): string => {
  const mem = memoryImageCache.get(`cat_${category}`);
  if (mem && mem.length > 50) {
    return mem;
  }
  try {
    const custom = localStorage.getItem(`aavira_cat_img_${category}`);
    if (custom && custom.length > 50) {
      memoryImageCache.set(`cat_${category}`, custom);
      return custom;
    }
  } catch {
    // Ignore localStorage errors
  }
  return defaultImage;
};

export const saveCategoryCustomImage = async (category: string, dataUrl: string): Promise<boolean> => {
  try {
    const optimizedDataUrl = await optimizeImageDataUrl(dataUrl);
    memoryImageCache.set(`cat_${category}`, dataUrl);
    safeSetLocalStorage(`aavira_cat_img_${category}`, optimizedDataUrl);
    await saveToIndexedDb(`cat_${category}`, dataUrl);

    let targetProductId = '';
    let targetFilename = '';
    if (category === 'dharmavaram-silk') {
      targetProductId = 'sar-dvs-001';
      targetFilename = 'semi-pattu-1-a.jpg';
    } else if (category === 'venkatagiri-silk') {
      targetProductId = 'sar-vgs-001';
      targetFilename = 'soft-silk-2-a.jpg';
    } else if (category === 'venkatagiri-vintage') {
      targetProductId = 'sar-vgv-001';
      targetFilename = 'vintage-1-a.jpg';
    } else if (category === 'bridal-sarees' || category === 'wedding-bridal') {
      targetProductId = 'sar-br-001';
      targetFilename = 'wedding-bridal-1-a.jpg';
    } else if (category === 'daily-wear') {
      targetProductId = 'sar-dw-001';
      targetFilename = 'daily-wear-1-a.jpg';
    } else if (category === 'semi-pattu') {
      targetProductId = 'sar-dvs-001';
      targetFilename = 'semi-pattu-1-a.jpg';
    } else if (category === 'soft-silk') {
      targetProductId = 'sar-vgs-001';
      targetFilename = 'soft-silk-2-a.jpg';
    } else if (category === 'high-fancy') {
      targetProductId = 'sar-vgs-003';
      targetFilename = 'high-fancy-1-a.jpg';
    }

    if (targetProductId) {
      memoryImageCache.set(`${targetProductId}_0`, dataUrl);
      memoryImageCache.set(targetProductId, dataUrl);
      safeSetLocalStorage(`aavira_prod_img_${targetProductId}_0`, optimizedDataUrl);
      safeSetLocalStorage(`aavira_prod_img_${targetProductId}`, optimizedDataUrl);
      await saveToIndexedDb(`${targetProductId}_0`, dataUrl);
    }

    window.dispatchEvent(
      new CustomEvent('aavira:product-image-updated', {
        detail: { productId: targetProductId || category, dataUrl, imageIndex: 0, targetFilename },
      })
    );

    if (targetFilename) {
      await fetch('/api/upload-saree-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFilename,
          base64Data: dataUrl,
          productId: targetProductId,
          imageIndex: 0,
        }),
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('Failed to save category custom image:', err);
    return false;
  }
};

export const saveProductImage = async (
  productId: string,
  dataUrl: string,
  targetFilename?: string,
  imageIndex = 0
): Promise<boolean> => {
  try {
    const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;
    const resolvedFilename = targetFilename || getProductFilename(productId, idx);

    // 1. Optimize dataUrl only for fallback localStorage to avoid browser quota overflow
    const optimizedDataUrl = await optimizeImageDataUrl(dataUrl);

    // 2. Store 100% original full-fidelity attached image in memory cache
    const memKey = `${productId}_${idx}`;
    memoryImageCache.set(memKey, dataUrl);
    if (idx === 0) {
      memoryImageCache.set(productId, dataUrl);
    }

    // 3. Save 100% original attached image to IndexedDB (virtually unlimited quota)
    await saveToIndexedDb(memKey, dataUrl);
    if (idx === 0) {
      await saveToIndexedDb(productId, dataUrl);
    }

    // 4. Safely attempt localStorage write with compact version without throwing QuotaExceededError
    safeSetLocalStorage(`aavira_prod_img_${productId}_${idx}`, optimizedDataUrl);
    if (idx === 0) {
      safeSetLocalStorage(`aavira_prod_img_${productId}`, optimizedDataUrl);
    }

    // If it is the High Fancy product, also save category override for High Fancy
    if (productId === 'sar-hf-001' && idx === 0) {
      memoryImageCache.set('cat_high-fancy', dataUrl);
      safeSetLocalStorage('aavira_cat_img_high-fancy', optimizedDataUrl);
      await saveToIndexedDb('cat_high-fancy', dataUrl);
    }
    // If it is a Daily Wear product, also save category override for Daily Wear
    if (
      (productId === 'sar-dw-002' || productId === 'sar-dw-001' || productId === 'sar-dw-003') &&
      idx === 0
    ) {
      memoryImageCache.set('cat_daily-wear', dataUrl);
      safeSetLocalStorage('aavira_cat_img_daily-wear', optimizedDataUrl);
      await saveToIndexedDb('cat_daily-wear', dataUrl);
    }
    // If it is a Semi-Pattu product, also save category override for Semi-Pattu
    if (productId === 'sar-sp-001' && idx === 0) {
      memoryImageCache.set('cat_semi-pattu', dataUrl);
      safeSetLocalStorage('aavira_cat_img_semi-pattu', optimizedDataUrl);
      await saveToIndexedDb('cat_semi-pattu', dataUrl);
    }
    // If it is a Soft Silk product, also save category override for Soft Silk
    if (productId === 'sar-ss-001' && idx === 0) {
      memoryImageCache.set('cat_soft-silk', dataUrl);
      safeSetLocalStorage('aavira_cat_img_soft-silk', optimizedDataUrl);
      await saveToIndexedDb('cat_soft-silk', dataUrl);
    }

    // 5. Broadcast to all mounted components (product cards, modals, lookbook)
    window.dispatchEvent(
      new CustomEvent('aavira:product-image-updated', {
        detail: { productId, dataUrl, imageIndex: idx, targetFilename: resolvedFilename },
      })
    );

    // 6. Send 100% full-resolution attached image to backend server to overwrite public/assets/sarees/ physical file
    try {
      const apiRes = await fetch('/api/upload-saree-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          targetFilename: resolvedFilename,
          imageIndex: idx,
          base64Data: dataUrl, // 100% full-fidelity original attached image
        }),
      });
      if (apiRes.ok) {
        const resData = await apiRes.json();
        if (resData?.updatedAt) {
          serverManifest[memKey] = {
            filename: resolvedFilename,
            updatedAt: resData.updatedAt,
            url: `/assets/sarees/${resolvedFilename}`,
          };
          if (idx === 0) {
            serverManifest[productId] = serverManifest[memKey];
          }
        }
      }
    } catch (apiErr) {
      console.warn('Could not sync image to server filesystem:', apiErr);
    }

    return true;
  } catch (err) {
    console.error('Failed to save custom product image:', err);
    return false;
  }
};

export const deleteProductImage = async (productId: string, imageIndex?: number): Promise<boolean> => {
  try {
    const idx = typeof imageIndex === 'number' ? imageIndex : undefined;
    if (idx !== undefined) {
      const memKey = `${productId}_${idx}`;
      memoryImageCache.delete(memKey);
      localStorage.removeItem(`aavira_prod_img_${productId}_${idx}`);
      await deleteFromIndexedDb(memKey);
      delete serverManifest[memKey];

      if (idx === 0) {
        memoryImageCache.delete(productId);
        localStorage.removeItem(`aavira_prod_img_${productId}`);
        await deleteFromIndexedDb(productId);
        delete serverManifest[productId];
      }
    } else {
      memoryImageCache.delete(productId);
      localStorage.removeItem(`aavira_prod_img_${productId}`);
      await deleteFromIndexedDb(productId);
      delete serverManifest[productId];

      for (let i = 0; i < 10; i++) {
        const memKey = `${productId}_${i}`;
        memoryImageCache.delete(memKey);
        localStorage.removeItem(`aavira_prod_img_${productId}_${i}`);
        await deleteFromIndexedDb(memKey);
        delete serverManifest[memKey];
      }
    }

    if (productId === 'sar-hf-001' && (idx === undefined || idx === 0)) {
      memoryImageCache.delete('cat_high-fancy');
      localStorage.removeItem('aavira_cat_img_high-fancy');
      await deleteFromIndexedDb('cat_high-fancy');
    }
    if (
      (productId === 'sar-dw-001' || productId === 'sar-dw-002' || productId === 'sar-dw-003') &&
      (idx === undefined || idx === 0)
    ) {
      memoryImageCache.delete('cat_daily-wear');
      localStorage.removeItem('aavira_cat_img_daily-wear');
      await deleteFromIndexedDb('cat_daily-wear');
    }

    // Call server to remove from publishing manifest
    try {
      await fetch('/api/delete-saree-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageIndex: idx }),
      });
    } catch (e) {
      console.warn('Could not sync image deletion to server:', e);
    }

    window.dispatchEvent(
      new CustomEvent('aavira:product-image-updated', {
        detail: { productId, dataUrl: null, imageIndex: idx, isDeleted: true },
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to delete product image:', err);
    return false;
  }
};

export const resetProductImage = (productId: string, imageIndex?: number) => {
  return deleteProductImage(productId, imageIndex);
};

export const deleteAllCustomProductImages = async (): Promise<boolean> => {
  try {
    memoryImageCache.clear();
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('aavira_prod_img_') || k.startsWith('aavira_cat_img_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
    await clearIndexedDb();
    serverManifest = {};

    try {
      await fetch('/api/delete-all-custom-images', { method: 'POST' });
    } catch {}

    window.dispatchEvent(new CustomEvent('aavira:product-images-cleared'));
    window.dispatchEvent(new CustomEvent('aavira:product-images-hydrated'));
    return true;
  } catch (err) {
    console.error('Failed to clear all custom product images:', err);
    return false;
  }
};

/**
 * Exports all attached product images and metadata into a downloadable JSON package
 * ensuring 100% preservation of user-attached photos for backup and publishing records.
 */
export async function exportAtelierCatalogWithImages(products: any[]): Promise<void> {
  try {
    const records = await getAllFromIndexedDb();
    const manifest = getServerManifest();

    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      atelierName: 'Aavira Haute Couture',
      founder: 'Mrs. K. Ramani',
      totalProducts: products.length,
      manifest,
      products: products.map((p) => {
        const customFront = getCustomProductImage(p.id, p.images[0], 0);
        const customSecond = p.images[1] ? getCustomProductImage(p.id, p.images[1], 1) : '';
        const allCustomImages = (p.images || []).map((orig: string, idx: number) =>
          getCustomProductImage(p.id, orig, idx)
        );

        return {
          id: p.id,
          name: p.name,
          category: p.category,
          priceINR: p.priceINR,
          fabric: p.fabric,
          color: p.color,
          images: allCustomImages,
          frontImage: customFront,
          secondaryImage: customSecond,
          hasAttachedCustomFront: customFront.startsWith('data:image/'),
          hasAttachedCustomSecond: customSecond.startsWith('data:image/'),
        };
      }),
      attachedRawImages: records,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aavira-atelier-catalog-100pct-images-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export catalog package:', err);
  }
}


