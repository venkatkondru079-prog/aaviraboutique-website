import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Printer,
  Download,
  MessageCircle,
  ShieldCheck,
  Package,
  Truck,
  CreditCard,
  Building,
  Building2,
  Sparkles,
  ExternalLink,
  Star,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { Order, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { AAVIRA_BANK_DETAILS } from '../utils/bankDetails';
import {
  generateOrderPdf,
  sendPaymentReceivedWhatsAppToCustomer,
  sendOrderDeliveredWhatsAppToCustomer,
  sendOrderWhatsAppToAtelier,
  sendOrderReceivedWhatsAppToAtelier,
  copyMessageToClipboard,
  cleanPhoneNumber,
  generatePaymentReceivedWhatsAppMessage,
  generateAtelierOrderAlertWhatsAppMessage,
  triggerFileDownload,
  getAppPublicDomain,
} from '../utils/orderPdfGenerator';

interface OrderPaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  currency: Currency;
  onConfirmDelivery?: (orderId: string, rating?: number, feedback?: string) => void;
}

export const OrderPaymentReceiptModal: React.FC<OrderPaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  currency,
  onConfirmDelivery,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [deliveryFeedback, setDeliveryFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [sentToast, setSentToast] = useState(false);
  const [atelierToast, setAtelierToast] = useState(false);

  if (!isOpen || !order) return null;

  const isCod = order.paymentMethod.toLowerCase().includes('cash on delivery');
  const isDelivered = order.status === 'Delivered' || order.customerConfirmedDelivery;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const result = await generateOrderPdf(order, currency);
      triggerFileDownload(result.file, result.filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.open(`/api/orders/${order.id}/pdf`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendWhatsAppReceipt = async () => {
    try {
      const result = await generateOrderPdf(order, currency);
      sendPaymentReceivedWhatsAppToCustomer(
        order,
        result.publicPdfUrl,
        currency,
        result.viewUrl
      );
      const msg = generatePaymentReceivedWhatsAppMessage(
        order,
        result.publicPdfUrl,
        currency,
        result.viewUrl
      );
      copyMessageToClipboard(msg);
      setSentToast(true);
      setTimeout(() => setSentToast(false), 3500);
    } catch {
      sendPaymentReceivedWhatsAppToCustomer(order, undefined, currency);
      const msg = generatePaymentReceivedWhatsAppMessage(order, undefined, currency);
      copyMessageToClipboard(msg);
      setSentToast(true);
      setTimeout(() => setSentToast(false), 3500);
    }
  };

  const handleSendAtelierWhatsApp = async () => {
    try {
      const result = await generateOrderPdf(order, currency);
      sendOrderReceivedWhatsAppToAtelier(
        order,
        result.publicPdfUrl,
        currency,
        result.viewUrl
      );
      const msg = generateAtelierOrderAlertWhatsAppMessage(
        order,
        result.publicPdfUrl,
        currency,
        result.viewUrl
      );
      copyMessageToClipboard(msg);
      setAtelierToast(true);
      setTimeout(() => setAtelierToast(false), 3500);
    } catch {
      sendOrderReceivedWhatsAppToAtelier(order, undefined, currency);
      const msg = generateAtelierOrderAlertWhatsAppMessage(order, undefined, currency);
      copyMessageToClipboard(msg);
      setAtelierToast(true);
      setTimeout(() => setAtelierToast(false), 3500);
    }
  };

  const handleCopyReceiptText = async () => {
    try {
      const result = await generateOrderPdf(order, currency);
      const msg = generatePaymentReceivedWhatsAppMessage(
        order,
        result.publicPdfUrl,
        currency,
        result.viewUrl
      );
      copyMessageToClipboard(msg);
    } catch {
      const msg = generatePaymentReceivedWhatsAppMessage(order, undefined, currency);
      copyMessageToClipboard(msg);
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleAcknowledgeDelivery = () => {
    if (onConfirmDelivery) {
      onConfirmDelivery(order.id, rating, deliveryFeedback);
      setShowConfirmSuccess(true);
      setTimeout(() => setShowConfirmSuccess(false), 3500);

      // Also send completion WhatsApp message
      sendOrderDeliveredWhatsAppToCustomer(order);
    }
  };

  const baseDomain = getAppPublicDomain();
  const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const webLookbookUrl = `${baseDomain}/order-view/${safeOrderId}`;

  return (
    <div
      id="order-receipt-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto"
    >
      <div
        id="order-receipt-card"
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-xl shadow-2xl border border-[#D9D0C1] overflow-hidden max-h-[94vh] flex flex-col animate-scaleUp text-[#1A1510]"
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-[#1A1510] text-[#F5EEE0] flex items-center justify-between border-b border-[#B8860B] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#B8860B]" />
            <span className="font-serif tracking-[0.15em] text-sm uppercase">
              Official Payment & Consignment Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="receipt-print-btn"
              type="button"
              onClick={handlePrint}
              className="p-1.5 hover:bg-[#332920] rounded-md text-[#D4B98C] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 px-2.5 bg-[#2A221B] border border-[#4A3C30]"
              title="Print Official Tax Receipt"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              id="receipt-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="p-1.5 hover:bg-[#332920] rounded-md text-[#D4B98C] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 px-2.5 bg-[#2A221B] border border-[#4A3C30]"
              title="Download PDF Invoice & Saree Lookbook"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{isDownloading ? 'Exporting...' : 'PDF'}</span>
            </button>

            <button
              id="receipt-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-[#332920] rounded-full text-[#D4B98C] hover:text-white transition-colors cursor-pointer ml-1"
              aria-label="Close Receipt"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          {/* Official Letterhead */}
          <div className="border-b border-[#E0D7C6] pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold tracking-[0.25em] text-xl sm:text-2xl text-[#1A1510] uppercase">
                    AAVIRA HAUTE COUTURE
                  </span>
                </div>
                <p className="text-xs text-[#8C6D2B] font-medium tracking-wide uppercase mt-0.5">
                  VISAKHAPATNAM ATELIER • MANAGING DIRECTOR: MRS. K. RAMANI
                </p>
                <p className="text-[11px] text-[#7A6A58] mt-1">
                  GSTIN: 37AAHCA9821M1ZF • CIN: U18101AP2026PTC109842 • Flagship Boutique, Visakhapatnam, AP
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-[#5E4F41] bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-[#E8E0D2] w-full sm:w-auto">
                <div className="font-serif font-bold text-base text-[#B8860B]">
                  TAX INVOICE & RECEIPT
                </div>
                <div className="font-mono text-xs font-semibold text-[#1A1510]">
                  #{order.id}
                </div>
                <div className="text-[11px] text-[#7A6A58]">
                  Date: {order.date}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div
            className={`p-4 rounded-xl border ${
              isCod
                ? 'bg-[#FFF9EE] border-[#E8C888] text-[#855B14]'
                : 'bg-[#F2F8F4] border-[#B7DFC6] text-[#1E5631]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    isCod
                      ? 'bg-[#FBE8C4] text-[#855B14]'
                      : order.paymentMethod.toLowerCase().includes('kotak') || order.paymentMethod.toLowerCase().includes('bank')
                      ? 'bg-[#FAF2EB] text-[#800020]'
                      : 'bg-[#D4EDDA] text-[#1E5631]'
                  }`}
                >
                  {isCod ? (
                    <CreditCard size={20} />
                  ) : order.paymentMethod.toLowerCase().includes('kotak') || order.paymentMethod.toLowerCase().includes('bank') ? (
                    <Building2 size={20} />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>
                      {isCod
                        ? 'PAYMENT MODE: CASH ON DELIVERY (COD ACKNOWLEDGED)'
                        : 'PAYMENT STATUS: RECEIVED & RECONCILED IN FULL'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                      {isCod ? 'Advance Confirmed' : 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    {isCod
                      ? 'Atelier reservation confirmed. Balance amount payable upon doorstep delivery & inspection.'
                      : `Amount of ${formatPrice(
                          order.totalINR,
                          currency
                        )} received via ${order.paymentMethod}. Reconciled at Atelier Finance.`}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] opacity-85 font-mono">
                    <span>
                      <strong>Payment Ref:</strong> {order.paymentRef || `TXN-UPI-${order.id.replace('AAV-ORD-', '')}-VERIFIED`}
                    </span>
                    <span>
                      <strong>Timestamp:</strong> {order.paymentReceivedAt || `${order.date} 11:45 AM IST`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 bg-white/70 px-3 py-2 rounded-lg border border-black/5">
                <div className="text-[10px] uppercase tracking-wider text-[#6E5E4E]">
                  Grand Total Paid
                </div>
                <div className="font-serif font-bold text-lg text-[#1A1510]">
                  {formatPrice(order.totalINR, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Consignment Lifecycle Stepper */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E0D2]">
            <div className="text-xs font-bold text-[#8C6D2B] tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Package size={14} />
              <span>Consignment & Fulfillment Lifecycle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {/* Step 1 */}
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E0D2]">
                <div className="w-5 h-5 mx-auto mb-1.5 rounded-full bg-[#1A1510] text-[#F5EEE0] flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="font-bold text-[#1A1510] text-[11px]">Order Received</div>
                <div className="text-[10px] text-[#7A6A58] mt-0.5">Logged in Atelier</div>
              </div>

              {/* Step 2 */}
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E0D2]">
                <div className="w-5 h-5 mx-auto mb-1.5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="font-bold text-[#1A1510] text-[11px]">Payment Verified</div>
                <div className="text-[10px] text-[#2E7D32] font-medium mt-0.5">Reconciled</div>
              </div>

              {/* Step 3 */}
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E0D2]">
                <div className="w-5 h-5 mx-auto mb-1.5 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="font-bold text-[#1A1510] text-[11px]">Artisan Handcraft</div>
                <div className="text-[10px] text-[#8C6D2B] font-medium mt-0.5">Zari Inspected</div>
              </div>

              {/* Step 4 */}
              <div
                className={`p-2.5 rounded-lg border ${
                  order.status === 'Shipped' || isDelivered
                    ? 'bg-[#FAF8F5] border-[#E8E0D2]'
                    : 'bg-white border-dashed border-[#D9D0C1] opacity-75'
                }`}
              >
                <div
                  className={`w-5 h-5 mx-auto mb-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    order.status === 'Shipped' || isDelivered
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-[#E8E0D2] text-[#7A6A58]'
                  }`}
                >
                  {order.status === 'Shipped' || isDelivered ? '✓' : '4'}
                </div>
                <div className="font-bold text-[#1A1510] text-[11px]">Insured Courier</div>
                <div className="text-[10px] text-[#7A6A58] mt-0.5 font-mono">
                  {order.awbNumber ? `AWB: ${order.awbNumber}` : 'BlueDart Express'}
                </div>
              </div>

              {/* Step 5 */}
              <div
                className={`p-2.5 rounded-lg border col-span-2 sm:col-span-1 ${
                  isDelivered
                    ? 'bg-[#F2F8F4] border-[#B7DFC6] text-[#1E5631]'
                    : 'bg-white border-dashed border-[#D9D0C1] opacity-75'
                }`}
              >
                <div
                  className={`w-5 h-5 mx-auto mb-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDelivered ? 'bg-[#2E7D32] text-white' : 'bg-[#E8E0D2] text-[#7A6A58]'
                  }`}
                >
                  {isDelivered ? '✓' : '5'}
                </div>
                <div className="font-bold text-[11px]">
                  {isDelivered ? 'Delivered & Received' : 'Doorstep Handover'}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {isDelivered ? order.deliveredAt || 'Safely Received' : 'In Transit'}
                </div>
              </div>
            </div>

            {/* Customer Delivery Acknowledgment Action (If not yet delivered) */}
            {!isDelivered && onConfirmDelivery && (
              <div className="mt-4 pt-3 border-t border-[#E8E0D2] bg-[#FAF8F5] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#5E4F41]">
                  <strong className="text-[#1A1510]">Have you received this saree parcel?</strong>
                  <p className="text-[11px]">Confirm receipt to activate your Silk Mark Warranty & Certificate.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-0.5 mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-[#B8860B] hover:scale-110 transition-transform p-0.5"
                      >
                        <Star
                          size={14}
                          className={star <= rating ? 'fill-[#B8860B]' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    id="confirm-order-received-btn"
                    type="button"
                    onClick={handleAcknowledgeDelivery}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <CheckCircle2 size={13} />
                    <span>Confirm Order Received</span>
                  </button>
                </div>
              </div>
            )}

            {showConfirmSuccess && (
              <div className="mt-2 p-2 bg-[#D4EDDA] border border-[#C3E6CB] text-[#155724] text-xs rounded-lg text-center font-medium animate-fadeIn">
                🎉 Order successfully marked as Received & Completed! Thank you for choosing Aavira Haute Couture.
              </div>
            )}
          </div>

          {/* Consignee & Order Metadata 2-Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-[#E8E0D2] space-y-1.5">
              <div className="font-bold text-[#8C6D2B] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Building size={13} />
                <span>Consignee & Delivery Address</span>
              </div>
              <p className="font-bold text-sm text-[#1A1510]">{order.customerName}</p>
              <p className="text-[#5E4F41]">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <div className="pt-2 border-t border-[#F0EBE1] text-[#7A6A58] space-y-0.5">
                <p>Phone: <strong className="text-[#1A1510]">{order.phone}</strong></p>
                <p>Email: <strong className="text-[#1A1510]">{order.email}</strong></p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E0D2] space-y-1.5">
              <div className="font-bold text-[#8C6D2B] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Truck size={13} />
                <span>Dispatch & Concierge Record</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A58]">Payment Method:</span>
                <span className="font-semibold text-[#1A1510] text-right">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A58]">Consignment Status:</span>
                <span className="font-bold text-[#2E7D32]">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A58]">Courier Service:</span>
                <span className="font-medium text-[#1A1510]">BlueDart Insured Air Express</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A58]">Managing Concierge:</span>
                <span className="font-medium text-[#1A1510]">Mrs. K. Ramani (+91 93471 59353)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#F0EBE1]">
                <span className="text-[#7A6A58]">Digital Lookbook:</span>
                <a
                  href={webLookbookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B8860B] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Open Lookbook</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Kotak Bank Transfer Reconciliation Box */}
          {(order.paymentMethod.toLowerCase().includes('kotak') ||
            order.paymentMethod.toLowerCase().includes('bank') ||
            order.paymentMethod.toLowerCase().includes('online payment')) && (
            <div className="bg-[#FAF7F0] border border-[#E8DFC8] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#800020]" />
                  <span className="font-serif font-bold text-xs text-[#1A1510] tracking-wide">
                    KOTAK MAHENDRA BANK ONLINE SETTLEMENT DETAILS
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-[#FAF2EB] text-[#800020] border border-[#E8DAC8] px-2 py-0.5 rounded-full">
                  Direct Bank Wire
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#524436]">
                <div>
                  <span className="text-[10px] text-[#8C7A65] block uppercase tracking-wider">Account Name:</span>
                  <span className="font-semibold text-[#1A1510]">{AAVIRA_BANK_DETAILS.accountName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A65] block uppercase tracking-wider">Beneficiary / Holder:</span>
                  <span className="font-semibold text-[#1A1510]">{AAVIRA_BANK_DETAILS.beneficiaryName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A65] block uppercase tracking-wider">Account Number:</span>
                  <span className="font-mono font-bold text-[#1A1510]">{AAVIRA_BANK_DETAILS.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A65] block uppercase tracking-wider">IFSC Code & Branch:</span>
                  <span className="font-mono font-bold text-[#1A1510]">{AAVIRA_BANK_DETAILS.ifscCode}</span>
                  <span className="text-[11px] text-[#7A6A58] ml-1">({AAVIRA_BANK_DETAILS.branch}, {AAVIRA_BANK_DETAILS.country})</span>
                </div>
              </div>
            </div>
          )}

          {/* Itemized Order Table */}
          <div className="bg-white rounded-xl border border-[#E8E0D2] overflow-hidden">
            <div className="bg-[#1A1510] text-[#F5EEE0] px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
              <span>ORDERED HANDCRAFTED CREATIONS</span>
              <span className="text-[11px] text-[#D4B98C] font-normal">
                Silk Mark Certified Authentic
              </span>
            </div>

            <div className="divide-y divide-[#E8E0D2]">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-md border border-[#D9D0C1] shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#1A1510]">{item.productName}</div>
                      <div className="text-[11px] text-[#7A6A58]">
                        Size / Tailoring: <span className="font-medium text-[#1A1510]">{item.size}</span>
                      </div>
                      <div className="text-[10px] text-[#8C6D2B] flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Hand-inspected & steam-finished in Visakhapatnam</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#7A6A58]">
                      {item.quantity} × {formatPrice(item.priceINR, currency)}
                    </div>
                    <div className="font-serif font-bold text-sm text-[#1A1510]">
                      {formatPrice(item.quantity * item.priceINR, currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="bg-[#FAF8F5] p-4 border-t border-[#E8E0D2] space-y-2 text-xs">
              <div className="flex justify-between text-[#5E4F41]">
                <span>Items Subtotal:</span>
                <span className="font-medium text-[#1A1510]">
                  {formatPrice(order.totalINR, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#5E4F41]">
                <span>Applicable GST (CGST 2.5% + SGST 2.5%):</span>
                <span className="font-medium text-[#1A1510]">Included</span>
              </div>
              <div className="flex justify-between text-[#2E7D32]">
                <span>Insured Doorstep Air Dispatch:</span>
                <span className="font-bold">FREE (Complimentary)</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#E0D7C6] text-sm sm:text-base font-bold text-[#1A1510]">
                <div>
                  <span>Total Amount Received:</span>
                  <p className="text-[10px] font-normal text-[#7A6A58]">
                    {isCod ? 'Balance Due on Delivery' : 'Fully Paid & Reconciled'}
                  </p>
                </div>
                <div className="font-serif text-lg sm:text-xl text-[#B8860B]">
                  {formatPrice(order.totalINR, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Authenticity & Artisan Sign-off */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8DFC8] space-y-2">
              <div className="flex items-center gap-2 text-[#B8860B] font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck size={16} />
                <span>Authentic Silk Mark India Guarantee</span>
              </div>
              <p className="text-[11px] text-[#6E5E4E] leading-relaxed">
                This certifies that your ensemble has been crafted with 100% pure certified mulberry silk and genuine metallic zari under the direct curation of Mrs. K. Ramani. Hand-loomed on traditional looms with interlocked Korvai weaving.
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8DFC8] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#1A1510] uppercase tracking-wider">
                  Authorised Signatory
                </div>
                <p className="text-[10px] text-[#7A6A58] mt-0.5">Aavira Haute Couture Atelier</p>
              </div>

              <div className="pt-4 border-t border-[#E8E0D2] flex items-center justify-between">
                <div>
                  <div className="font-serif italic text-sm text-[#1A1510]">K. Ramani</div>
                  <div className="text-[10px] text-[#8C6D2B] font-medium">Mrs. K. Ramani (Managing Director)</div>
                </div>
                <div className="text-[9px] px-2 py-1 rounded bg-[#F5EEE0] border border-[#D9D0C1] text-[#8C6D2B] uppercase font-bold tracking-wider">
                  Atelier Digital Seal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E0D2] flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-[#7A6A58] flex items-center gap-1.5">
            <Clock size={13} className="text-[#8C6D2B]" />
            <span>Need tailoring or delivery adjustments? Contact Mrs. Ramani anytime.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              id="send-atelier-whatsapp-receipt-btn"
              type="button"
              onClick={handleSendAtelierWhatsApp}
              className="px-3 py-2 bg-[#FAF4E6] hover:bg-[#F2E8D4] border border-[#E8DCC4] text-[#634E26] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Send order received notification to Aavira Haute Couture Atelier (+91 9347159353)"
            >
              <MessageCircle size={14} className="text-[#25D366]" />
              <span>
                {atelierToast ? '✓ Alert Sent to Atelier!' : 'Atelier Alert (+91 93471 59353)'}
              </span>
            </button>

            <button
              id="copy-receipt-text-btn"
              type="button"
              onClick={handleCopyReceiptText}
              className="px-3 py-2 bg-white hover:bg-[#FAF8F5] border border-[#D9D0C1] rounded-lg text-xs font-medium text-[#1A1510] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy receipt message to clipboard"
            >
              {copiedToast ? (
                <>
                  <Check size={14} className="text-[#25D366]" />
                  <span className="text-[#25D366] font-semibold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-[#8C6D2B]" />
                  <span>Copy Receipt</span>
                </>
              )}
            </button>

            <button
              id="send-receipt-whatsapp-btn"
              type="button"
              onClick={handleSendWhatsAppReceipt}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>
                {sentToast
                  ? '✓ Dispatched to WhatsApp & Copied!'
                  : `Send Receipt to Customer WhatsApp (+${cleanPhoneNumber(order.phone)})`}
              </span>
            </button>

            <button
              id="receipt-done-btn"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#1A1510] hover:bg-[#332920] text-[#F3EBD4] rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
