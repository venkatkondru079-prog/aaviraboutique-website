// Store and synchronization helper for Venkata Rao Kondru's PhonePe UPI QR Code
import { safeSetLocalStorage, saveToIndexedDb } from './productImageStore';

const DEFAULT_QR_URL = '/assets/qr/venkata-rao-kondru-upi-qr.svg';
const QR_STORAGE_KEY = 'aavira_upi_qr_custom';

export interface UpiPayeeDetails {
  name: string;
  upiId: string;
  secondaryUpiId: string;
  bankName: string;
  qrImageUrl: string;
  isCustomUploaded: boolean;
}

export const getUpiPayeeDetails = (): UpiPayeeDetails => {
  let qrImageUrl = DEFAULT_QR_URL;
  let isCustomUploaded = false;

  try {
    const custom = localStorage.getItem(QR_STORAGE_KEY);
    if (custom && custom.length > 50) {
      qrImageUrl = custom;
      isCustomUploaded = true;
    }
  } catch {
    // ignore
  }

  return {
    name: 'VENKATA RAO KONDRU',
    upiId: 'venkatkondru079@ybl',
    secondaryUpiId: 'venkatkondru079@ibl',
    bankName: 'PhonePe (YES Bank / ICICI)',
    qrImageUrl,
    isCustomUploaded,
  };
};

export const saveCustomQrCodeImage = async (dataUrl: string): Promise<boolean> => {
  try {
    // 1. Save to local storage & IndexedDB for persistent cross-tab loading
    safeSetLocalStorage(QR_STORAGE_KEY, dataUrl);
    saveToIndexedDb(QR_STORAGE_KEY, dataUrl).catch(() => {});

    // 2. Broadcast event
    window.dispatchEvent(
      new CustomEvent('aavira:qr-code-updated', {
        detail: { qrImageUrl: dataUrl },
      })
    );

    // 3. Sync to server filesystem
    try {
      await fetch('/api/upload-qr-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: dataUrl,
          filename: 'venkata-rao-kondru-upi-qr.png',
        }),
      });
    } catch (e) {
      console.warn('Could not sync custom QR to server filesystem:', e);
    }

    return true;
  } catch (err) {
    console.error('Failed to save custom QR code image:', err);
    return false;
  }
};

export const resetCustomQrCodeImage = () => {
  try {
    localStorage.removeItem(QR_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('aavira:qr-code-updated', {
        detail: { qrImageUrl: DEFAULT_QR_URL },
      })
    );
  } catch {
    // ignore
  }
};
