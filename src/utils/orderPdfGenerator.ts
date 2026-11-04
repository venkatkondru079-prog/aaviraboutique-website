import { jsPDF } from 'jspdf';
import { Order, Currency } from '../types';
import { formatPrice } from './currency';

/**
 * Loads any image path (local relative path or data URL) and converts it to a clean JPEG base64 DataURL
 * suitable for embedding directly inside jsPDF.
 */
export async function loadImageAsDataUrl(src: string): Promise<string | null> {
  if (!src) return null;

  // If it's already a base64 JPEG/PNG, return directly
  if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/png')) {
    return src;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Set a timeout of 3.5 seconds so PDF generation is never blocked
    const timer = setTimeout(() => {
      resolve(null);
    }, 3500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        // Scale to max width 800px for crisp quality while keeping PDF size lightweight
        const maxDim = 800;
        let w = img.naturalWidth || img.width || 400;
        let h = img.naturalHeight || img.height || 500;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Fill white background in case of transparent pngs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = src;
  });
}

export interface GeneratedPdfResult {
  doc: jsPDF;
  blob: Blob;
  dataUrl: string;
  file: File;
  publicPdfUrl: string;
  viewUrl?: string;
  filename: string;
}

/**
 * Returns the true public domain for the applet so WhatsApp links work globally on mobile and desktop.
 */
export function getAppPublicDomain(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // If running in local container preview without domain, fallback to the public Cloud Run dev URL
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'https://ais-dev-zepchstfhkydbdukvryifd-936761872105.asia-east1.run.app';
    }
    return window.location.origin;
  }
  return 'https://ais-dev-zepchstfhkydbdukvryifd-936761872105.asia-east1.run.app';
}

/**
 * Generates an haute couture Order Invoice & Lookbook PDF with embedded product images.
 */
export async function generateOrderPdf(
  order: Order,
  currency: Currency = 'INR'
): Promise<GeneratedPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Pre-load all item product images concurrently
  const itemImages = await Promise.all(
    order.items.map(async (item) => {
      const dataUrl = await loadImageAsDataUrl(item.image);
      return { item, dataUrl };
    })
  );

  let currentY = margin;

  // 1. ATELIER HEADER
  // Header background bar
  doc.setFillColor(26, 21, 16); // #1A1510
  doc.rect(margin, currentY, contentWidth, 24, 'F');

  // Gold accent band on top
  doc.setFillColor(184, 134, 11); // #B8860B
  doc.rect(margin, currentY, contentWidth, 1.8, 'F');

  // Brand Name
  doc.setTextColor(245, 238, 224); // #F5EEE0
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('AAVIRA HAUTE COUTURE', margin + 6, currentY + 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(212, 185, 140); // Soft Champagne
  doc.text(
    'VISAKHAPATNAM ATELIER  •  FOUNDED & DIRECTED BY MRS. K. RAMANI',
    margin + 6,
    currentY + 17
  );

  // Contact info on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(230, 220, 205);
  doc.text('WhatsApp: +91 9347159353', pageWidth - margin - 6, currentY + 10, { align: 'right' });
  doc.text('Email: aavira.bo@gmail.com', pageWidth - margin - 6, currentY + 14, { align: 'right' });
  doc.text('Web: aavira.boutique', pageWidth - margin - 6, currentY + 18, { align: 'right' });

  currentY += 28;

  // 2. ORDER META & CLIENT DETAILS (2-Column Grid)
  const colWidth = (contentWidth - 4) / 2;

  // Left Box: Order Summary & Payment Receipt
  doc.setFillColor(248, 246, 242);
  doc.setDrawColor(225, 216, 200);
  doc.roundedRect(margin, currentY, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(184, 134, 11);
  doc.text('OFFICIAL TAX INVOICE & PAYMENT RECEIPT', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 21, 16);
  doc.text(`Ref: ${order.id}`, margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 60, 50);
  doc.text(`Date of Consignment: ${order.date}`, margin + 4, currentY + 17);
  doc.text(`Consignment Status: ${order.status}`, margin + 4, currentY + 22);

  const isCod = order.paymentMethod.toLowerCase().includes('cash on delivery');
  doc.setFont('helvetica', 'bold');
  if (isCod) {
    doc.setTextColor(180, 100, 20);
    doc.text('Payment Status: COD ADVANCE ACKNOWLEDGED', margin + 4, currentY + 27);
  } else {
    doc.setTextColor(32, 90, 50); // Verified Green
    doc.text('Payment Status: RECEIVED & VERIFIED', margin + 4, currentY + 27);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 70, 60);
  const paymentRefText = order.paymentRef ? `Ref: ${order.paymentRef}` : 'Txn: Verified by Atelier';
  doc.text(`Mode: ${order.paymentMethod} • ${paymentRefText}`, margin + 4, currentY + 32);

  // Right Box: Delivery & Client Destination
  const rightX = margin + colWidth + 4;
  doc.setFillColor(248, 246, 242);
  doc.setDrawColor(225, 216, 200);
  doc.roundedRect(rightX, currentY, colWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(184, 134, 11);
  doc.text('DISPATCH & CLIENT DESTINATION', rightX + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(26, 21, 16);
  doc.text(order.customerName || 'Valued Patron', rightX + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 60, 50);
  doc.text(`Phone: ${order.phone}`, rightX + 4, currentY + 17);
  doc.text(`Email: ${order.email}`, rightX + 4, currentY + 22);

  const addressLine = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`;
  const splitAddress = doc.splitTextToSize(addressLine, colWidth - 8);
  doc.text(splitAddress, rightX + 4, currentY + 27);

  if (order.awbNumber) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(184, 134, 11);
    doc.text(`Express Courier AWB: ${order.awbNumber}`, rightX + 4, currentY + 34);
  }

  currentY += 42;

  // 3. PRODUCT CATALOG LOOKBOOK & ITEMS SECTION
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 21, 16);
  doc.text('ORDERED SAREES & ATELIER ENSEMBLES', margin, currentY);

  // Table header background
  currentY += 3;
  doc.setFillColor(35, 27, 20);
  doc.rect(margin, currentY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 238, 224);
  doc.text('LOOKBOOK IMAGE', margin + 3, currentY + 4.8);
  doc.text('PRODUCT / WEAVE DETAILS', margin + 36, currentY + 4.8);
  doc.text('STYLING / SIZE', margin + 112, currentY + 4.8);
  doc.text('QTY', margin + 148, currentY + 4.8, { align: 'center' });
  doc.text('UNIT PRICE', margin + 164, currentY + 4.8, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 3, currentY + 4.8, { align: 'right' });

  currentY += 7;

  // Render each item row
  const rowHeight = 28;

  for (let i = 0; i < itemImages.length; i++) {
    const { item, dataUrl } = itemImages[i];

    // Check if we need a new page
    if (currentY + rowHeight > pageHeight - 45) {
      doc.addPage();
      currentY = margin;

      // Repeat Table Header
      doc.setFillColor(35, 27, 20);
      doc.rect(margin, currentY, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 238, 224);
      doc.text('LOOKBOOK IMAGE', margin + 3, currentY + 4.8);
      doc.text('PRODUCT / WEAVE DETAILS', margin + 36, currentY + 4.8);
      doc.text('STYLING / SIZE', margin + 112, currentY + 4.8);
      doc.text('QTY', margin + 148, currentY + 4.8, { align: 'center' });
      doc.text('UNIT PRICE', margin + 164, currentY + 4.8, { align: 'right' });
      doc.text('TOTAL', pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
      currentY += 7;
    }

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(252, 250, 247);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.setDrawColor(235, 228, 218);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'FD');

    // 1. EMBED PRODUCT IMAGE
    const imgX = margin + 3;
    const imgY = currentY + 2.5;
    const imgW = 18;
    const imgH = 23;

    if (dataUrl) {
      try {
        // Render image thumbnail
        doc.addImage(dataUrl, 'JPEG', imgX, imgY, imgW, imgH);
        // Border frame around image
        doc.setDrawColor(184, 134, 11);
        doc.setLineWidth(0.3);
        doc.rect(imgX, imgY, imgW, imgH, 'D');
      } catch {
        // Fallback placeholder box
        doc.setFillColor(240, 235, 225);
        doc.rect(imgX, imgY, imgW, imgH, 'F');
        doc.setFontSize(6);
        doc.setTextColor(100, 90, 80);
        doc.text('Image Attached', imgX + 1, imgY + 11);
      }
    } else {
      doc.setFillColor(240, 235, 225);
      doc.rect(imgX, imgY, imgW, imgH, 'F');
      doc.setFontSize(6);
      doc.setTextColor(100, 90, 80);
      doc.text('Pure Silk', imgX + 3, imgY + 11);
    }

    // 2. PRODUCT NAME & DETAILS
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(26, 21, 16);
    const titleLines = doc.splitTextToSize(item.productName, 72);
    doc.text(titleLines, margin + 26, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 90, 80);
    doc.text(`Product Code: ${item.productId.toUpperCase()}`, margin + 26, currentY + 14);
    doc.text(
      'Authentic Handloom Silk • 3-Point Artisan Inspection',
      margin + 26,
      currentY + 18.5
    );
    doc.text('Complimentary Silk Care Bag Included', margin + 26, currentY + 23);

    // 3. SIZE & STYLING
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 40, 30);
    const sizeLines = doc.splitTextToSize(item.size || 'Standard Drape', 32);
    doc.text(sizeLines, margin + 104, currentY + 8);

    // 4. QTY
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(26, 21, 16);
    doc.text(String(item.quantity), margin + 148, currentY + 14, { align: 'center' });

    // 5. UNIT PRICE
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 50, 40);
    doc.text(`₹${item.priceINR.toLocaleString('en-IN')}`, margin + 164, currentY + 14, {
      align: 'right',
    });

    // 6. LINE TOTAL
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(184, 134, 11); // Gold
    const lineTotal = item.priceINR * item.quantity;
    doc.text(`₹${lineTotal.toLocaleString('en-IN')}`, pageWidth - margin - 3, currentY + 14, {
      align: 'right',
    });

    currentY += rowHeight;
  }

  currentY += 4;

  // 4. FINANCIAL SUMMARY & ATELIER ASSURANCE BOX
  if (currentY + 45 > pageHeight - 30) {
    doc.addPage();
    currentY = margin;
  }

  const summaryWidth = 85;
  const summaryX = pageWidth - margin - summaryWidth;

  // Financials
  doc.setFillColor(250, 248, 244);
  doc.setDrawColor(220, 210, 195);
  doc.roundedRect(summaryX, currentY, summaryWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 70, 60);

  doc.text('Subtotal:', summaryX + 4, currentY + 7);
  doc.text(`₹${order.totalINR.toLocaleString('en-IN')}`, pageWidth - margin - 4, currentY + 7, {
    align: 'right',
  });

  doc.text('Insured Atelier Express Dispatch:', summaryX + 4, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(32, 90, 50); // Forest Green
  doc.text('FREE (Complimentary)', pageWidth - margin - 4, currentY + 14, { align: 'right' });

  // Gold Divider inside summary
  doc.setDrawColor(184, 134, 11);
  doc.line(summaryX + 4, currentY + 19, pageWidth - margin - 4, currentY + 19);

  // Grand Total
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 21, 16);
  doc.text('Grand Total:', summaryX + 4, currentY + 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(184, 134, 11);
  doc.text(`₹${order.totalINR.toLocaleString('en-IN')}`, pageWidth - margin - 4, currentY + 26, {
    align: 'right',
  });

  // Assurance Badge on Left
  const badgeWidth = contentWidth - summaryWidth - 6;
  doc.setFillColor(248, 245, 238);
  doc.setDrawColor(215, 202, 182);
  doc.roundedRect(margin, currentY, badgeWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(184, 134, 11);
  doc.text('CERTIFIED ATELIER AUTHENTICITY & DISPATCH PROMISE', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 70, 60);
  doc.text(
    '• 100% Certified Mulberry & Handloom Silk with Silk Mark Assurance.',
    margin + 4,
    currentY + 12
  );
  doc.text(
    '• Hand-inspected, steam-finished, and folded in archival muslin covers.',
    margin + 4,
    currentY + 17
  );
  doc.text(
    '• For tailored blouse alteration or matching jewelry, message Mrs. K. Ramani.',
    margin + 4,
    currentY + 22
  );
  doc.text('• Dedicated Concierge WhatsApp: +91 9347159353', margin + 4, currentY + 27);

  currentY += 38;

  // 5. FOOTER NOTICE
  const footerY = pageHeight - 14;
  doc.setDrawColor(210, 200, 185);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const copyrightText = '© 2026 AAVIRA HAUTE COUTURE. All Rights Reserved. Founded & Directed by Mrs. K. Ramani. | ';
  const creditText = 'Designed by Byteboostai';
  const totalW = doc.getTextWidth(copyrightText + creditText);
  const startX = (pageWidth - totalW) / 2;
  doc.setTextColor(120, 105, 85);
  doc.text(copyrightText, startX, footerY + 1);
  doc.setTextColor(184, 134, 11);
  doc.setFont('helvetica', 'bold');
  doc.text(creditText, startX + doc.getTextWidth(copyrightText), footerY + 1);

  // Generate output artifacts
  const pdfBlob = doc.output('blob');
  const pdfDataUrl = doc.output('datauristring');
  const safeOrderId = order.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Aavira-Order-${safeOrderId}.pdf`;
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  // Sync with backend server to generate permanent public link
  const domain = getAppPublicDomain();
  let publicPdfUrl = `${domain}/api/orders/${safeOrderId}/pdf`;
  let viewUrl = `${domain}/order-view/${safeOrderId}`;

  try {
    const res = await fetch('/api/save-order-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: safeOrderId,
        pdfBase64: pdfDataUrl,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.publicPdfUrl || data.downloadUrl) {
        publicPdfUrl = data.publicPdfUrl || data.downloadUrl;
      }
      if (data.viewUrl) {
        viewUrl = data.viewUrl;
      }
    }
  } catch (err) {
    console.warn('Could not sync order PDF with server filesystem:', err);
  }

  return {
    doc,
    blob: pdfBlob,
    dataUrl: pdfDataUrl,
    file: pdfFile,
    publicPdfUrl,
    viewUrl,
    filename,
  };
}

/**
 * Creates the formatted WhatsApp message text with order details, direct PDF link, and mobile lookbook link.
 */
export function generateOrderWhatsAppMessage(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): string {
  const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseDomain = getAppPublicDomain();

  const fullPdfUrl = pdfPublicUrl && pdfPublicUrl.startsWith('http')
    ? pdfPublicUrl
    : `${baseDomain}/api/orders/${safeOrderId}/pdf`;

  const fullViewUrl = viewUrl && viewUrl.startsWith('http')
    ? viewUrl
    : `${baseDomain}/order-view/${safeOrderId}`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   • Size/Tailoring: ${item.size}\n   • Qty: ${item.quantity} × ₹${item.priceINR.toLocaleString('en-IN')}`
    )
    .join('\n');

  return [
    `👑 *AAVIRA HAUTE COUTURE — ORDER CONFIRMATION*`,
    `Ref: *#${order.id}* | Date: ${order.date}`,
    ``,
    `Dear *${order.customerName}*,`,
    `Thank you for patronizing Aavira Haute Couture. Your couture order has been registered at our Visakhapatnam atelier and is now being prepared for artisan hand-inspection and dispatch.`,
    ``,
    `🛍️ *ORDERED ENSEMBLES & SAREES:*`,
    itemsList,
    ``,
    `💰 *Total Amount:* ${formatPrice(order.totalINR, currency)}`,
    `💳 *Payment Method:* ${order.paymentMethod}`,
    `📦 *Order Status:* ${order.status}`,
    ``,
    `📍 *Delivery Destination:*`,
    `${order.customerName}`,
    `Phone: ${order.phone}`,
    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    ``,
    `📄 *OFFICIAL ORDER LOOKBOOK & INVOICE PDF (With Saree Photos):*`,
    `👉 Tap to open & download PDF directly:`,
    fullPdfUrl,
    ``,
    `📱 *Mobile Lookbook & Web Invoice View:*`,
    fullViewUrl,
    ``,
    `🪡 *Bespoke Tailoring & Concierge Inquiries:*`,
    `Mrs. K. Ramani (Managing Director): +91 9347159353`,
    `Email: aavira.bo@gmail.com`,
    `Atelier: Visakhapatnam, Andhra Pradesh`,
    ``,
    `_© 2026 Aavira Haute Couture. Handcrafted Pure Silk Assurance._`,
  ].join('\n');
}

/**
 * Normalizes phone numbers for WhatsApp & SMS with automatic India (+91) prefixing and zero-stripping.
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '919347159353';
  let digits = phone.replace(/[^0-9]/g, '');
  // If user entered with leading 0 (e.g. 09347159353), strip the 0
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Standard 10-digit Indian mobile number
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  if (!digits || digits.length < 8) {
    return '919347159353';
  }
  return digits;
}

/**
 * Returns multi-channel messaging URLs (WhatsApp API, Web, Native App, SMS, and Mailto)
 */
export function getMessageUrls(phone: string, text: string, subject = 'Aavira Haute Couture Order Receipt') {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const encodedSubject = encodeURIComponent(subject);

  return {
    cleanPhone,
    apiUrl: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`,
    webUrl: `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`,
    waMeUrl: `https://wa.me/${cleanPhone}?text=${encodedText}`,
    nativeAppUrl: `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`,
    smsUrl: `sms:${cleanPhone}?body=${encodedText}`,
    mailtoUrl: `mailto:?subject=${encodedSubject}&body=${encodedText}`,
  };
}

/**
 * Copies message text to clipboard with fallback.
 */
export async function copyMessageToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Opens WhatsApp with the specified phone number and encoded message.
 * Uses a direct DOM anchor trigger with target="_blank" which reliably bypasses iframe popup blockers.
 */
export function openWhatsApp(phone: string, text: string): boolean {
  const { apiUrl, nativeAppUrl } = getMessageUrls(phone, text);

  // Also pre-copy the message into clipboard so user can immediately paste if needed
  copyMessageToClipboard(text);

  try {
    const a = document.createElement('a');
    a.href = apiUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 400);
    return true;
  } catch {
    try {
      window.open(apiUrl, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      window.location.href = nativeAppUrl;
      return true;
    }
  }
}

/**
 * Creates specialized WhatsApp alert confirming new order received to Aavira Haute Couture Atelier (+91 9347159353).
 */
export function generateAtelierOrderAlertWhatsAppMessage(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): string {
  const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseDomain = getAppPublicDomain();
  const fullPdfUrl = pdfPublicUrl && pdfPublicUrl.startsWith('http')
    ? pdfPublicUrl
    : `${baseDomain}/api/orders/${safeOrderId}/pdf`;
  const fullViewUrl = viewUrl && viewUrl.startsWith('http')
    ? viewUrl
    : `${baseDomain}/order-view/${safeOrderId}`;

  const isCod = (order.paymentMethod || '').toLowerCase().includes('cash on delivery');
  const paymentHeader = isCod
    ? `💰 *Payment Mode:* Cash on Delivery (COD Verified — Collect balance at doorstep)`
    : `✅ *Payment Status:* RECEIVED & VERIFIED IN FULL`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `   ${idx + 1}. *${item.productName}*\n      • Tailoring/Size: ${item.size} | Qty: ${item.quantity} [₹${item.priceINR.toLocaleString('en-IN')}]`
    )
    .join('\n');

  return [
    `👑 *AAVIRA HAUTE COUTURE ATELIER — NEW ORDER RECEIVED ALERT*`,
    `Order Ref: *#${order.id}* | Placed: ${order.date}`,
    `ATTN: *Mrs. K. Ramani (Managing Director) & Production Team*`,
    ``,
    paymentHeader,
    order.paymentRef ? `🔢 *Transaction UTR Ref:* ${order.paymentRef}` : '',
    `💵 *Total Order Value:* ${formatPrice(order.totalINR, currency)}`,
    `💳 *Payment Method:* ${order.paymentMethod}`,
    order.awbNumber ? `🚚 *Insured Courier AWB:* ${order.awbNumber} (${order.courierPartner || 'BlueDart Air'})` : '',
    `📦 *Action Required:* Handcrafting, Zari Quality Inspection & Dispatch Preparation`,
    ``,
    `👤 *CUSTOMER PROFILE:*`,
    `• Patron: *${order.customerName}*`,
    `• Phone: +${cleanPhoneNumber(order.phone)}`,
    `• Email: ${order.email || 'N/A'}`,
    ``,
    `📍 *SHIPPING DESTINATION:*`,
    `${order.customerName}`,
    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    ``,
    `🛍️ *ORDERED ENSEMBLES & SAREES:*`,
    itemsList,
    ``,
    `📄 *Official Lookbook & Invoice PDF (With Saree Photos):*`,
    `👉 View & Download: ${fullPdfUrl}`,
    ``,
    `📱 *Digital Consignment Certificate:*`,
    fullViewUrl,
    ``,
    `_Aavira Haute Couture Atelier Internal Notification • +91 9347159353_`,
  ].filter(Boolean).join('\n');
}

/**
 * Dispatches WhatsApp order received alert directly to Aavira Haute Couture Atelier (+91 9347159353).
 */
export function sendOrderReceivedWhatsAppToAtelier(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
) {
  const message = generateAtelierOrderAlertWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);
  openWhatsApp('919347159353', message);
}

/**
 * Dispatches WhatsApp order confirmation to Mrs. K. Ramani (+91 9347159353) at the atelier.
 */
export function sendOrderWhatsAppToAtelier(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
) {
  return sendOrderReceivedWhatsAppToAtelier(order, pdfPublicUrl, currency, viewUrl);
}

/**
 * Dispatches WhatsApp order confirmation to the customer's phone number.
 */
export function sendOrderWhatsAppToCustomer(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
) {
  const message = generateOrderWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);
  const customerPhone = order.phone || '919347159353';
  openWhatsApp(customerPhone, message);
}

/**
 * Creates specialized WhatsApp text confirming payment and order received with full receipt to the customer.
 */
export function generatePaymentReceivedWhatsAppMessage(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): string {
  const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseDomain = getAppPublicDomain();
  const fullPdfUrl = pdfPublicUrl && pdfPublicUrl.startsWith('http')
    ? pdfPublicUrl
    : `${baseDomain}/api/orders/${safeOrderId}/pdf`;
  const fullViewUrl = viewUrl && viewUrl.startsWith('http')
    ? viewUrl
    : `${baseDomain}/order-view/${safeOrderId}`;

  const isCod = order.paymentMethod.toLowerCase().includes('cash on delivery');
  const paymentStatusLine = isCod
    ? `💰 *Payment Mode:* Cash on Delivery (COD Verified — Doorstep Collection Authorized)`
    : `✅ *Payment Status:* RECEIVED & VERIFIED IN FULL`;
  const txnRefLine = order.paymentRef ? `🔢 *Transaction UTR Ref:* ${order.paymentRef}\n` : '';
  const awbLine = order.awbNumber ? `🚚 *Insured Courier AWB:* ${order.awbNumber} (${order.courierPartner || 'BlueDart Air'})\n` : '';

  const itemsList = order.items
    .map(
      (item, idx) =>
        `   ${idx + 1}. *${item.productName}*\n      • Tailoring/Size: ${item.size} | Qty: ${item.quantity} [₹${item.priceINR.toLocaleString('en-IN')}]`
    )
    .join('\n');

  return [
    `👑 *AAVIRA HAUTE COUTURE — PAYMENT & ORDER RECEIVED*`,
    `🧾 *OFFICIAL ORDER RECEIPT #${order.id}*`,
    `Date: ${order.date}`,
    ``,
    `Dear *${order.customerName}*,`,
    `Namaste! We are pleased to confirm that your payment has been received and your couture order is officially registered at our atelier.`,
    ``,
    paymentStatusLine,
    txnRefLine + `💵 *Total Amount Paid:* ${formatPrice(order.totalINR, currency)}`,
    `💳 *Payment Method:* ${order.paymentMethod}`,
    awbLine + `📦 *Order Status:* Handcrafting & Zari Quality Inspection Underway`,
    ``,
    `🛍️ *ORDERED ENSEMBLES & SAREES:*`,
    itemsList,
    ``,
    `📍 *Delivery Destination:*`,
    `${order.customerName}`,
    `WhatsApp / Phone: +${cleanPhoneNumber(order.phone)}`,
    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    ``,
    `📄 *Official Tax Invoice & Saree Lookbook PDF:*`,
    `👉 View & Download: ${fullPdfUrl}`,
    ``,
    `📱 *Digital Consignment Certificate:*`,
    `${fullViewUrl}`,
    ``,
    `🪡 *Bespoke Atelier Concierge Contact:*`,
    `Mrs. K. Ramani (Managing Director): +91 9347159353`,
    `Executive Concierge: +91 9347842535`,
    `Email: aavira.bo@gmail.com`,
    `Ateliers: Hyderabad & Visakhapatnam, India`,
    ``,
    `_Thank you for patronizing authentic Indian handloom couture._`,
  ].filter(Boolean).join('\n');
}

/**
 * Dispatches Payment & Order Received confirmation directly to customer's WhatsApp.
 */
export function sendPaymentReceivedWhatsAppToCustomer(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string,
  targetMode: 'api' | 'web' | 'wa_me' = 'api'
): boolean {
  const message = generatePaymentReceivedWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);
  const customerPhone = order.phone || '919347159353';
  const cleanPhone = cleanPhoneNumber(customerPhone);
  const urls = getMessageUrls(cleanPhone, message);

  copyMessageToClipboard(message);

  let targetUrl = urls.apiUrl;
  if (targetMode === 'web') targetUrl = urls.webUrl;
  if (targetMode === 'wa_me') targetUrl = urls.waMeUrl;

  try {
    const a = document.createElement('a');
    a.href = targetUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 400);
    return true;
  } catch {
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      window.location.href = urls.nativeAppUrl;
      return true;
    }
  }
}

/**
 * Automatically dispatches both Customer WhatsApp Receipt and Atelier Production Alert.
 */
export function autoDispatchOrderReceiptToWhatsApp(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): { customerMessage: string; atelierMessage: string; customerUrls: ReturnType<typeof getMessageUrls>; atelierUrls: ReturnType<typeof getMessageUrls> } {
  const customerMessage = generatePaymentReceivedWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);
  const atelierMessage = generateAtelierOrderAlertWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);

  const customerUrls = getMessageUrls(order.phone, customerMessage);
  const atelierUrls = getMessageUrls('919347159353', atelierMessage);

  // 1. Immediately send to customer WhatsApp
  sendPaymentReceivedWhatsAppToCustomer(order, pdfPublicUrl, currency, viewUrl);

  // 2. Slightly staggered (600ms) notification to atelier WhatsApp so browser tab handling doesn't conflict
  setTimeout(() => {
    try {
      sendOrderReceivedWhatsAppToAtelier(order, pdfPublicUrl, currency, viewUrl);
    } catch (e) {
      console.warn('Atelier WhatsApp auto-trigger note:', e);
    }
  }, 600);

  return { customerMessage, atelierMessage, customerUrls, atelierUrls };
}

/**
 * Calls backend server endpoint to register and log official notification dispatch.
 */
export async function dispatchServerOrderNotification(
  order: Order,
  recipient: 'customer' | 'atelier' | 'both' = 'both',
  notificationType: 'payment_received' | 'order_placed' | 'order_delivered' = 'payment_received',
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): Promise<{ success: boolean; data?: any }> {
  try {
    const res = await fetch('/api/send-order-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order,
        recipient,
        notificationType,
        pdfUrl: pdfPublicUrl,
        currency,
        viewUrl,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false };
  } catch (err) {
    console.warn('Backend notification dispatch error:', err);
    return { success: false };
  }
}

/**
 * Creates specialized WhatsApp message confirming delivery & completion to the customer.
 */
export function generateOrderDeliveredWhatsAppMessage(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
): string {
  const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseDomain = getAppPublicDomain();
  const fullPdfUrl = pdfPublicUrl && pdfPublicUrl.startsWith('http')
    ? pdfPublicUrl
    : `${baseDomain}/api/orders/${safeOrderId}/pdf`;

  return [
    `🎉 *AAVIRA HAUTE COUTURE — CONSIGNMENT DELIVERED*`,
    `Order Ref: *#${order.id}*`,
    ``,
    `Dear *${order.customerName}*,`,
    `Your handcrafted heirloom silk ensemble from Aavira Haute Couture has been safely delivered to your doorstep!`,
    ``,
    `✨ *Silk Mark Certified Guarantee:*`,
    `Every fold carries the sacred legacy of authentic Indian handloom artistry and pure metallic zari.`,
    ``,
    `📄 *Download Final Receipt & Provenance Certificate:*`,
    fullPdfUrl,
    ``,
    `We would be honored to see you in your Aavira creation! Tag us on Instagram @aavira.boutique or share your photos directly with Mrs. K. Ramani on WhatsApp (+91 9347159353).`,
    ``,
    `With heartfelt regards,`,
    `Mrs. K. Ramani & Master Looms Atelier`,
    `Aavira Haute Couture, Visakhapatnam`,
  ].join('\n');
}

/**
 * Dispatches Order Delivered completion notification to customer's WhatsApp.
 */
export function sendOrderDeliveredWhatsAppToCustomer(
  order: Order,
  pdfPublicUrl?: string,
  currency: Currency = 'INR',
  viewUrl?: string
) {
  const message = generateOrderDeliveredWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);
  const customerPhone = order.phone || '919347159353';
  openWhatsApp(customerPhone, message);
}

/**
 * Shares the generated Order PDF directly via the Web Share API (which attaches the actual PDF file)
 * when supported, or falls back to downloading the PDF and opening WhatsApp.
 */
export async function shareOrderPdfViaWhatsApp(
  order: Order,
  pdfFile: File,
  pdfPublicUrl: string,
  currency: Currency = 'INR',
  viewUrl?: string
): Promise<boolean> {
  const messageText = generateOrderWhatsAppMessage(order, pdfPublicUrl, currency, viewUrl);

  // Check if Web Share API with file attachments is supported (e.g. mobile Chrome / Safari)
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        title: `Aavira Order ${order.id} Lookbook & Invoice`,
        text: messageText,
        files: [pdfFile],
      });
      return true;
    } catch (err: any) {
      // If user aborted the share sheet, return false
      if (err.name === 'AbortError') {
        return false;
      }
      console.warn('Web Share API failed, falling back to download and WhatsApp link:', err);
    }
  }

  // Fallback: Trigger download of the PDF file so user has it, and open WhatsApp chat
  triggerFileDownload(pdfFile);
  openWhatsApp('919347159353', messageText);
  return true;
}

/**
 * Triggers a browser file download of the PDF.
 */
export function triggerFileDownload(file: File | Blob, filename = 'Aavira-Order-Confirmation.pdf') {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file instanceof File ? file.name : filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
