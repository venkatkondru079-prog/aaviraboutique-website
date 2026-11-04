import { ReturnRequest } from '../types';

export const RETURN_REASONS = [
  {
    id: 'manufacturing_defect',
    label: '1. Manufacturing Defect (Fabric flaw, weave defect, zari irregularity)',
    badge: 'Clause 4: Covered by Aavira',
    description: 'Weave discontinuity, print misregistration, or genuine silk loom imperfection.',
    shippingPaidBy: 'Aavira Boutique (Free Courier Pickup)',
  },
  {
    id: 'wrong_item',
    label: '2. Wrong Saree or Item Received (Mismatched design / color)',
    badge: 'Clause 4: Covered by Aavira',
    description: 'Received a different saree model, color shade, or product than ordered.',
    shippingPaidBy: 'Aavira Boutique (Free Courier Pickup)',
  },
  {
    id: 'damaged_in_transit',
    label: '3. Damaged in Transit (Tampered box or transit damage)',
    badge: 'Clause 4: Reported within 48h',
    description: 'Outer carton or luxury box damaged upon courier arrival (with unboxing photos/video).',
    shippingPaidBy: 'Aavira Boutique (Free Courier Pickup)',
  },
  {
    id: 'size_exchange',
    label: '4. Exchange Request (Prefer another color, weave or design)',
    badge: 'Clause 7: 1 Exchange Allowed',
    description: 'Saree is brand new, unstitched & unused, but you wish to swap for another exquisite design.',
    shippingPaidBy: 'Customer (Standard Courier Fee)',
  },
  {
    id: 'other',
    label: '5. Other Valid Concern',
    badge: 'Subject to Atelier QC',
    description: 'Any other specific inquiry evaluated on case-by-case basis under boutique terms.',
    shippingPaidBy: 'Evaluated upon QC inspection',
  },
] as const;

export const RESOLUTION_OPTIONS = [
  {
    id: 'refund',
    title: 'Full Refund to Original Payment Method',
    description: '100% refund credited back to your bank account, UPI, or card within 7–10 business days of QC inspection.',
    highlight: 'Standard 7–10 Days',
  },
  {
    id: 'store_credit',
    title: 'Aavira Boutique Store Credit (+ 5% Loyalty Bonus)',
    description: 'Immediate store wallet credit with an extra 5% courtesy bonus for your next heirloom purchase. Never expires.',
    highlight: 'Instant + 5% Bonus',
  },
  {
    id: 'exchange',
    title: 'Direct Product Exchange (Same / Different Saree)',
    description: 'Exchange for an alternative color, weave category, or design of equal or higher value. One exchange per order.',
    highlight: '1 Free Exchange / Order',
  },
] as const;

export function getReturnReasonLabel(reason: string): string {
  const found = RETURN_REASONS.find((r) => r.id === reason);
  return found ? found.label : reason;
}

export function getResolutionLabel(resolution: string): string {
  const found = RESOLUTION_OPTIONS.find((r) => r.id === resolution);
  return found ? found.title : resolution;
}

/**
 * Generate formatted WhatsApp message for Customer & Atelier Return Request
 */
export function generateReturnWhatsAppMessage(returnReq: ReturnRequest): string {
  const reasonObj = RETURN_REASONS.find((r) => r.id === returnReq.reason);
  const reasonText = reasonObj ? reasonObj.label : returnReq.reason;
  const resolutionText = getResolutionLabel(returnReq.preferredResolution);

  return (
    `*AAVIRA HAUTE COUTURE — RETURN & EXCHANGE REQUEST*\n` +
    `*RMA Reference:* ${returnReq.id}\n` +
    `*Date:* ${new Date(returnReq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n` +
    `-----------------------------------------\n` +
    `*CUSTOMER DETAILS*\n` +
    `• Name: ${returnReq.customerName}\n` +
    `• WhatsApp / Phone: ${returnReq.customerPhone}\n` +
    `• Email: ${returnReq.customerEmail || 'Not provided'}\n\n` +
    `*ORDER INFORMATION*\n` +
    `• Order Reference: #${returnReq.orderId}\n` +
    `• Product to Return: *${returnReq.productName}*\n` +
    (returnReq.itemPriceINR ? `• Value: ₹${returnReq.itemPriceINR.toLocaleString('en-IN')}\n` : '') +
    (returnReq.sareeCategory ? `• Category: ${returnReq.sareeCategory}\n` : '') +
    `\n*RETURN DETAILS*\n` +
    `• Reason: ${reasonText}\n` +
    `• Description: "${returnReq.reasonDetails}"\n` +
    `• Preferred Resolution: *${resolutionText}*\n` +
    (returnReq.exchangePreferences ? `• Exchange Preference: "${returnReq.exchangePreferences}"\n` : '') +
    (returnReq.photoEvidence ? `• Photo/Video Proof Attached: Yes\n` : '') +
    `\n*APPLICABLE BOUTIQUE TERMS*\n` +
    `• Return Window: 7 Days from Delivery\n` +
    `• Condition: Unworn, unwashed, original tags & packaging\n` +
    `• Terms & Conditions Link: https://aavira-boutique.com/terms-and-conditions.html\n` +
    `-----------------------------------------\n` +
    `Kindly confirm the pickup schedule and inspection approval. Thank you!`
  );
}

/**
 * Dispatches return request directly to Aavira Concierge WhatsApp (+91 93471 59353)
 */
export function sendReturnRequestWhatsApp(
  returnReq: ReturnRequest,
  targetPhone = '919347159353'
): void {
  const text = generateReturnWhatsAppMessage(returnReq);
  const encodedText = encodeURIComponent(text);
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
