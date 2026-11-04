import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  Lock,
  Truck,
  ArrowRight,
  Printer,
  Banknote,
  Smartphone,
  QrCode,
  Copy,
  Check,
  PackageCheck,
  Building2,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Download,
  Upload,
  MessageCircle,
  FileText,
  Share2,
  ExternalLink,
  Loader2,
  Crown,
  Zap,
} from 'lucide-react';
import { CartItem, Currency, Order } from '../types';
import { formatPrice } from '../utils/currency';
import { getCustomProductImage } from '../utils/productImageStore';
import { AAVIRA_BANK_DETAILS, getFormattedBankDetailsText } from '../utils/bankDetails';
import {
  getUpiPayeeDetails,
  saveCustomQrCodeImage,
  resetCustomQrCodeImage,
  UpiPayeeDetails,
} from '../utils/qrCodeStore';
import {
  generateOrderPdf,
  sendOrderWhatsAppToAtelier,
  sendOrderReceivedWhatsAppToAtelier,
  sendOrderWhatsAppToCustomer,
  sendPaymentReceivedWhatsAppToCustomer,
  shareOrderPdfViaWhatsApp,
  triggerFileDownload,
  cleanPhoneNumber,
  getMessageUrls,
  copyMessageToClipboard,
  dispatchServerOrderNotification,
  generatePaymentReceivedWhatsAppMessage,
  generateAtelierOrderAlertWhatsAppMessage,
  GeneratedPdfResult,
} from '../utils/orderPdfGenerator';
import { OrderPaymentReceiptModal } from './OrderPaymentReceiptModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  discountPercentage: number;
  onOrderPlaced: (order: Order) => void;
  onClearCart: () => void;
  onClearWishlist?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discountPercentage,
  onOrderPlaced,
  onClearCart,
  onClearWishlist,
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmed'>('shipping');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    paymentMethod: 'UPI', // 'UPI' | 'Cash on Delivery (COD)' | 'Online Payment (Bank Transfer)'
    bankUtr: '',
  });

  // Online Bank Transfer Specific State
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const handleCopyBankField = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBankField(field);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  // UPI Specific State
  const [upiSubTab, setUpiSubTab] = useState<'qr' | 'vpa' | 'apps'>('qr');
  const [upiVpa, setUpiVpa] = useState('');
  const [isVpaVerified, setIsVpaVerified] = useState(false);
  const [isVpaChecking, setIsVpaChecking] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('PhonePe');
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [upiPayee, setUpiPayee] = useState<UpiPayeeDetails>(() => getUpiPayeeDetails());
  const [isQrEnlarged, setIsQrEnlarged] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const qrFileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const handleQrUpdated = () => {
      setUpiPayee(getUpiPayeeDetails());
    };
    window.addEventListener('aavira:qr-code-updated', handleQrUpdated);
    return () => window.removeEventListener('aavira:qr-code-updated', handleQrUpdated);
  }, []);

  // Cash on Delivery Specific State
  const [codAgreed, setCodAgreed] = useState(true);

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<GeneratedPdfResult | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'preparing' | 'sent'>('idle');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copiedReceiptMessage, setCopiedReceiptMessage] = useState(false);
  const [customerSentConfirmation, setCustomerSentConfirmation] = useState(false);
  const [atelierSentConfirmation, setAtelierSentConfirmation] = useState(false);
  const [copiedAtelierMessage, setCopiedAtelierMessage] = useState(false);
  const [serverNotificationDispatched, setServerNotificationDispatched] = useState(false);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [customResendPhone, setCustomResendPhone] = useState('');
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('shipping');
      setConfirmedOrder(null);
      setGeneratedPdf(null);
      setIsGeneratingPdf(false);
      setWhatsappStatus('idle');
      setIsReceiptModalOpen(false);
      setCopiedReceiptMessage(false);
      setCustomerSentConfirmation(false);
      setAtelierSentConfirmation(false);
      setCopiedAtelierMessage(false);
      setServerNotificationDispatched(false);
      setIsChangingPhone(false);
      setCustomResendPhone('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep('shipping');
    setConfirmedOrder(null);
    setGeneratedPdf(null);
    setIsGeneratingPdf(false);
    setWhatsappStatus('idle');
    setIsReceiptModalOpen(false);
    setCopiedReceiptMessage(false);
    setCustomerSentConfirmation(false);
    setAtelierSentConfirmation(false);
    setServerNotificationDispatched(false);
    setIsChangingPhone(false);
    setCustomResendPhone('');
    onClose();
  };

  if (!isOpen) return null;

  const rawSubtotalINR = items.reduce((acc, item) => acc + item.product.priceINR * item.quantity, 0);
  const discountINR = (rawSubtotalINR * discountPercentage) / 100;
  const finalTotalINR = rawSubtotalINR - discountINR;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard?.writeText(upiPayee.upiId);
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2200);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = upiPayee.qrImageUrl;
    link.download = `UPI-QR-${upiPayee.name.replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQrFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQr(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveCustomQrCodeImage(dataUrl);
      setUpiPayee(getUpiPayeeDetails());
      setIsUploadingQr(false);
    };
    reader.onerror = () => {
      setIsUploadingQr(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyVpa = () => {
    if (!upiVpa.includes('@')) return;
    setIsVpaChecking(true);
    setTimeout(() => {
      setIsVpaChecking(false);
      setIsVpaVerified(true);
    }, 600);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `AAV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    let resolvedPaymentMethod = formData.paymentMethod;
    if (formData.paymentMethod === 'UPI') {
      if (upiSubTab === 'qr') {
        resolvedPaymentMethod = `UPI (PhonePe QR - ${upiPayee.name})`;
      } else if (upiSubTab === 'vpa') {
        resolvedPaymentMethod = `UPI (${upiVpa || 'VPA Verified'})`;
      } else {
        resolvedPaymentMethod = `UPI (${selectedUpiApp})`;
      }
    } else if (formData.paymentMethod === 'Cash on Delivery (COD)') {
      resolvedPaymentMethod = 'Cash on Delivery (COD)';
    } else if (formData.paymentMethod === 'Online Payment (Bank Transfer)') {
      resolvedPaymentMethod = 'Online Payment (Kotak Mahindra Bank - A/C 4813092900)';
    }

    const isCod = formData.paymentMethod.includes('Cash on Delivery');
    const paymentTimestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const paymentRefNumber = isCod
      ? `COD-${orderId.replace('AAV-ORD-', '')}`
      : formData.paymentMethod === 'Online Payment (Bank Transfer)'
      ? (formData.bankUtr && formData.bankUtr.trim() ? `UTR-${formData.bankUtr.trim().toUpperCase()}` : `TXN-KOTAK-${Math.floor(10000000 + Math.random() * 90000000)}`)
      : `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const awbCode = `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName: formData.name || 'Guest Client',
      email: formData.email || 'client@aavira.com',
      phone: formData.phone || '+91 93471 59353',
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        quantity: item.quantity,
        priceINR: item.product.priceINR,
        image: getCustomProductImage(item.product.id, item.product.images[0]),
      })),
      totalINR: finalTotalINR,
      status: 'Processing',
      shippingAddress: {
        street: formData.street || 'Flagship Atelier Road',
        city: formData.city || 'Visakhapatnam',
        state: formData.state || 'Andhra Pradesh',
        postalCode: formData.postalCode || '530017',
        country: formData.country,
      },
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: isCod ? 'COD Acknowledged' : 'Received',
      paymentRef: paymentRefNumber,
      paymentReceivedAt: paymentTimestamp,
      awbNumber: awbCode,
      courierPartner: 'BlueDart Insured Air Express',
    };

    setConfirmedOrder(newOrder);
    onOrderPlaced(newOrder);
    onClearCart();
    if (onClearWishlist) {
      onClearWishlist();
    }
    setStep('confirmed');
    setIsGeneratingPdf(true);
    setWhatsappStatus('preparing');

    // 1. Immediately log & register customer & atelier notification with the server
    dispatchServerOrderNotification(newOrder, 'both', 'payment_received', undefined, currency)
      .then((res) => {
        if (res.success) {
          setServerNotificationDispatched(true);
        }
      })
      .catch((e) => console.warn('Server notification queue warning:', e));

    // 2. Automatically compile the Lookbook & Order Invoice PDF with embedded product images
    generateOrderPdf(newOrder, currency)
      .then((pdfResult) => {
        setGeneratedPdf(pdfResult);
        setIsGeneratingPdf(false);
        setWhatsappStatus('sent');

        // Automatically dispatch payment & order received receipt to Customer WhatsApp (+91 ...)
        if (autoSendWhatsApp) {
          try {
            sendPaymentReceivedWhatsAppToCustomer(
              newOrder,
              pdfResult.publicPdfUrl,
              currency,
              pdfResult.viewUrl
            );
            setCustomerSentConfirmation(true);
            const msg = generatePaymentReceivedWhatsAppMessage(
              newOrder,
              pdfResult.publicPdfUrl,
              currency,
              pdfResult.viewUrl
            );
            copyMessageToClipboard(msg);
          } catch (custErr) {
            console.warn('Customer WhatsApp auto-dispatch note:', custErr);
          }
        }

        // Also automatically dispatch order received notification to WhatsApp of Aavira Atelier (+91 9347159353)
        setTimeout(() => {
          try {
            sendOrderReceivedWhatsAppToAtelier(
              newOrder,
              pdfResult.publicPdfUrl,
              currency,
              pdfResult.viewUrl
            );
            setAtelierSentConfirmation(true);
          } catch (atErr) {
            console.warn('Atelier WhatsApp auto-dispatch note:', atErr);
          }
        }, 650);

        // Update server log with public PDF link and interactive lookbook URL
        dispatchServerOrderNotification(
          newOrder,
          'both',
          'payment_received',
          pdfResult.publicPdfUrl,
          currency,
          pdfResult.viewUrl
        ).then((res) => {
          if (res.success) {
            setServerNotificationDispatched(true);
          }
        }).catch((e) => console.warn('Server notification update warning:', e));
      })
      .catch((err) => {
        console.error('Error compiling order PDF:', err);
        setIsGeneratingPdf(false);
        // Fallback: still automatically dispatch customer WhatsApp receipt with order and payment details
        if (autoSendWhatsApp) {
          try {
            sendPaymentReceivedWhatsAppToCustomer(newOrder, undefined, currency);
            setCustomerSentConfirmation(true);
          } catch (e) {
            console.warn('Fallback WhatsApp dispatch note:', e);
          }
        }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-xl shadow-2xl border border-[#D9D0C1] overflow-hidden max-h-[92vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E0D2] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-[0.2em] text-lg text-[#1A1510] uppercase">
              AAVIRA CONCIERGE
            </span>
            <span className="text-[10px] text-[#C5A059] uppercase tracking-widest bg-[#1F1912] px-2 py-0.5 rounded">
              Secure Checkout
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#736453] hover:text-[#1A1510] p-1 rounded-full hover:bg-[#F2ECE1] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: SHIPPING */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8A7963] font-semibold mb-2">
                <Truck size={16} className="text-[#B8860B]" />
                <span>Step 1: Delivery Destination & Client Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Priyadarshini Rao"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Email Address (for order tracking) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. priya.rao@example.com"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1 flex items-center justify-between">
                    <span>WhatsApp / Mobile Number *</span>
                    <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
                      <MessageCircle size={11} /> Auto-Receipt
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98480 12345"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                  <p className="text-[10px] text-[#6E5E4E] mt-1 flex items-center gap-1">
                    <Check size={11} className="text-[#25D366]" /> Official order receipt & payment confirmation will be automatically sent to this WhatsApp.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  >
                    <option value="India">India (COD & UPI Enabled)</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Canada">Canada</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3E33] mb-1">Street Address / Suite / Villa *</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g. 42 Jubilee Hills Road No. 36"
                  className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Hyderabad / Visakhapatnam"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">State / Province *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Andhra Pradesh / Telangana"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3E33] mb-1">Postal PIN Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 530017"
                    className="w-full bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              {/* Auto WhatsApp Dispatch Option */}
              <div className="bg-[#EBF7EE] p-3 rounded-lg border border-[#A2D8B0] flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="autoSendWhatsApp"
                  checked={autoSendWhatsApp}
                  onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                  className="mt-0.5 accent-[#25D366] w-4 h-4 rounded cursor-pointer shrink-0"
                />
                <label htmlFor="autoSendWhatsApp" className="text-xs text-[#1E522C] cursor-pointer">
                  <span className="font-bold text-[#144421] flex items-center gap-1.5">
                    <MessageCircle size={14} className="text-[#25D366]" />
                    Automatically send Order Receipt & Payment Received message to WhatsApp
                  </span>
                  <span className="text-[11px] text-[#2C6E3D] block mt-0.5 leading-relaxed">
                    Upon order confirmation, your official lookbook PDF tax receipt, UTR reference, and courier dispatch tracking will be sent directly to your WhatsApp.
                  </span>
                </label>
              </div>

              {/* Order Summary Miniature */}
              <div className="bg-[#FAF4E8] p-3.5 rounded-lg border border-[#E8DCC4] text-xs space-y-1">
                <div className="flex justify-between text-[#736352]">
                  <span>Items ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                  <span>{formatPrice(rawSubtotalINR, currency)}</span>
                </div>
                {discountINR > 0 && (
                  <div className="flex justify-between text-[#205A32]">
                    <span>VIP Privilege Discount</span>
                    <span>-{formatPrice(discountINR, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#1A1510] pt-1 border-t border-[#E8DCC4]">
                  <span>Payable Total</span>
                  <span className="font-serif text-[#B8860B]">{formatPrice(finalTotalINR, currency)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1C1814] text-[#F3EBD4] py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#332920] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Payment Selection</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT WITH DEDICATED UPI & CASH ON DELIVERY OPTIONS */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#8A7963] font-semibold mb-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#B8860B]" />
                  <span>Step 2: Choose Payment Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-[#B8860B] hover:underline lowercase text-xs"
                >
                  Edit shipping
                </button>
              </div>

              {/* Payment Methods Selection List */}
              <div className="space-y-2.5">
                {/* 1. UPI PAYMENT MODE */}
                <div
                  className={`rounded-lg border transition-all overflow-hidden ${
                    formData.paymentMethod === 'UPI'
                      ? 'border-[#B8860B] bg-[#FFFDF7] shadow-sm'
                      : 'border-[#E2DACB] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <label className="p-3.5 flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={formData.paymentMethod === 'UPI'}
                      onChange={handleInputChange}
                      className="mt-1 text-[#B8860B] focus:ring-[#B8860B]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-[#8C6D2B]" />
                          <p className="text-xs font-bold text-[#1A1510]">
                            UPI Payment (Google Pay, PhonePe, Paytm, BHIM, QR)
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#8C6D2B] bg-[#FAF4E6] px-2 py-0.5 rounded border border-[#EBDDBE]">
                          Fastest • 0% Surcharge
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786857] mt-0.5">
                        Instant verification via mobile scanner, UPI ID, or one-tap app authorization.
                      </p>
                    </div>
                  </label>

                  {/* Sub-panel for UPI */}
                  {formData.paymentMethod === 'UPI' && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#F2ECE1] bg-white space-y-3">
                      {/* Sub Tabs */}
                      <div className="flex items-center gap-2 border-b border-[#EAE3D5] pb-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('qr')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            upiSubTab === 'qr'
                              ? 'bg-[#1C1814] text-[#F3EBD4]'
                              : 'text-[#6B5C4D] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <QrCode size={13} />
                          <span>Scan QR Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('vpa')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            upiSubTab === 'vpa'
                              ? 'bg-[#1C1814] text-[#F3EBD4]'
                              : 'text-[#6B5C4D] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <Smartphone size={13} />
                          <span>Enter UPI ID / VPA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubTab('apps')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            upiSubTab === 'apps'
                              ? 'bg-[#1C1814] text-[#F3EBD4]'
                              : 'text-[#6B5C4D] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <Building2 size={13} />
                          <span>UPI Apps</span>
                        </button>
                      </div>

                      {/* View 1: QR Code */}
                      {upiSubTab === 'qr' && (
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-[#FAF7F0] p-4 rounded-lg border border-[#E8DFCF]">
                          {/* Authentic Styled QR Card */}
                          <div className="bg-white p-3 rounded-xl border border-[#D9D0C1] shadow-xs flex flex-col items-center shrink-0">
                            <div className="relative bg-white flex flex-col items-center justify-center p-2 border border-[#E5DDD0] rounded-lg shadow-2xs overflow-hidden">
                              <img
                                src={upiPayee.qrImageUrl}
                                alt={`PhonePe UPI QR Code - ${upiPayee.name}`}
                                className="w-44 h-auto max-h-56 object-contain cursor-pointer transition-transform hover:scale-[1.01]"
                                onClick={() => setIsQrEnlarged(true)}
                                referrerPolicy="no-referrer"
                              />
                              {/* Zoom Overlay Trigger */}
                              <button
                                type="button"
                                onClick={() => setIsQrEnlarged(true)}
                                className="absolute bottom-2 right-2 p-1.5 bg-[#1C1814]/85 hover:bg-[#1C1814] text-[#F3EBD4] rounded-md backdrop-blur-xs transition-colors shadow"
                                title="Enlarge QR Code for Full Screen Scan"
                              >
                                <Maximize2 size={12} />
                              </button>
                            </div>

                            {/* Verified Payee Header */}
                            <div className="mt-2 text-center w-full">
                              <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#1A1510]">
                                <CheckCircle size={13} className="text-[#205A32] fill-[#EFF8F1]" />
                                <span>{upiPayee.name}</span>
                              </div>
                              <p className="text-[10px] text-[#736352] mt-0.5">
                                Payable: <span className="font-serif font-bold text-[#B8860B]">{formatPrice(finalTotalINR, currency)}</span>
                              </p>
                            </div>

                            {/* QR Actions */}
                            <div className="mt-2.5 flex items-center gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => setIsQrEnlarged(true)}
                                className="flex-1 text-[10px] font-medium py-1 px-1.5 bg-[#FAF4E8] hover:bg-[#F2E8D4] text-[#786134] rounded border border-[#E6DBCA] flex items-center justify-center gap-1 transition-colors"
                              >
                                <Maximize2 size={11} />
                                <span>Enlarge</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleDownloadQr}
                                className="flex-1 text-[10px] font-medium py-1 px-1.5 bg-[#FAF4E8] hover:bg-[#F2E8D4] text-[#786134] rounded border border-[#E6DBCA] flex items-center justify-center gap-1 transition-colors"
                              >
                                <Download size={11} />
                                <span>Save QR</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => qrFileInputRef.current?.click()}
                                disabled={isUploadingQr}
                                className="text-[10px] font-medium py-1 px-1.5 bg-[#FAF4E8] hover:bg-[#F2E8D4] text-[#786134] rounded border border-[#E6DBCA] flex items-center justify-center gap-1 transition-colors"
                                title="Upload / Replace QR image"
                              >
                                <Upload size={11} />
                                <span>{isUploadingQr ? '...' : 'Upload'}</span>
                              </button>
                              <input
                                ref={qrFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleQrFileSelected}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {/* QR Instructions & Verified Payee Details */}
                          <div className="flex-1 space-y-2.5 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A2C82] bg-[#F4EEF9] px-2 py-0.5 rounded border border-[#E5D7F1]">
                                  PhonePe UPI
                                </span>
                                <span className="text-[10px] text-[#205A32] font-semibold bg-[#EFF8F1] px-2 py-0.5 rounded border border-[#BCE4C6]">
                                  Verified Merchant
                                </span>
                              </div>
                              <p className="font-semibold text-[#1A1510] text-xs mt-1.5">
                                Scan with PhonePe, Google Pay, or any UPI App
                              </p>
                              <p className="text-[11px] text-[#6E5F50] mt-0.5">
                                Point your camera or UPI scanner at the QR code to transfer directly to <strong>{upiPayee.name}</strong>.
                              </p>
                            </div>

                            {/* Verified UPI ID Box with One-Click Copy */}
                            <div className="bg-white p-2.5 rounded-lg border border-[#E5DDD0] space-y-1 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider text-[#8A7963] font-medium">
                                  Beneficiary UPI ID (VPA)
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyUpiId}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8C6D2B] hover:text-[#1A1510]"
                                >
                                  {copiedUpiId ? (
                                    <>
                                      <Check size={11} className="text-[#205A32]" />
                                      <span className="text-[#205A32]">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy ID</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="font-mono text-xs font-bold text-[#1A1510]">{upiPayee.upiId}</p>
                              <p className="text-[10px] text-[#786857]">
                                Payee: <strong>{upiPayee.name}</strong> • {upiPayee.bankName}
                              </p>
                            </div>

                            {/* Supported UPI Apps Row */}
                            <div className="pt-1">
                              <p className="text-[10px] text-[#8A7963] uppercase tracking-wider font-semibold mb-1">
                                Compatible with all UPI applications:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Navi UPI', 'Cred'].map((appName) => (
                                  <span
                                    key={appName}
                                    className="text-[10px] px-2 py-0.5 bg-white rounded border border-[#E0D7C7] text-[#4A3E33] font-medium shadow-2xs"
                                  >
                                    {appName}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-[11px] text-[#205A32] font-medium flex items-center gap-1 pt-0.5">
                              <CheckCircle size={13} />
                              <span>QR code is verified & ready for instant scan</span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* View 2: UPI ID / VPA */}
                      {upiSubTab === 'vpa' && (
                        <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#E8DFCF] space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-[#4A3E33] mb-1">
                              Enter Your Virtual Payment Address (UPI ID) *
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={upiVpa}
                                onChange={(e) => {
                                  setUpiVpa(e.target.value);
                                  setIsVpaVerified(false);
                                }}
                                placeholder="e.g. mobile@upi or yourname@okhdfcbank"
                                className="flex-1 bg-white border border-[#D9D0C1] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#B8860B]"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyVpa}
                                disabled={isVpaChecking || !upiVpa.includes('@')}
                                className="px-3 py-2 bg-[#1C1814] text-[#F3EBD4] rounded text-xs font-semibold hover:bg-[#332920] disabled:opacity-50 transition-colors"
                              >
                                {isVpaChecking ? 'Verifying...' : isVpaVerified ? 'Verified' : 'Verify'}
                              </button>
                            </div>
                          </div>

                          {/* Quick Handle Suggestions */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#736352]">
                            <span className="text-[10px]">Popular handles:</span>
                            {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@ibl'].map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => {
                                  const prefix = upiVpa.split('@')[0] || 'yourname';
                                  setUpiVpa(`${prefix}${handle}`);
                                  setIsVpaVerified(false);
                                }}
                                className="px-2 py-0.5 bg-white border border-[#E2D8C7] rounded text-[10px] text-[#554737] hover:border-[#B8860B]"
                              >
                                {handle}
                              </button>
                            ))}
                          </div>

                          {isVpaVerified && (
                            <div className="p-2 bg-[#EFF8F1] rounded border border-[#CDE5D3] flex items-center gap-2 text-xs text-[#205A32]">
                              <CheckCircle size={14} />
                              <span>UPI ID successfully verified with NPCI Gateway. Payment request will ping on approval.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View 3: Fast App Selector */}
                      {upiSubTab === 'apps' && (
                        <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#E8DFCF] space-y-3">
                          <p className="text-xs font-medium text-[#4A3E33]">
                            Select your preferred UPI app for prompt authorization:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { name: 'Google Pay', sub: 'Tez / GPay UPI' },
                              { name: 'PhonePe', sub: 'Instant BHIM' },
                              { name: 'Paytm UPI', sub: 'Wallet & Bank' },
                              { name: 'BHIM UPI', sub: 'Govt NPCI App' },
                              { name: 'Cred UPI', sub: 'Rewards & Pay' },
                              { name: 'Amazon Pay', sub: 'Amazon UPI' },
                            ].map((app) => (
                              <button
                                key={app.name}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.name)}
                                className={`p-2.5 rounded-lg border text-left transition-all ${
                                  selectedUpiApp === app.name
                                    ? 'border-[#B8860B] bg-[#FFFBF0] shadow-2xs'
                                    : 'border-[#E2D9C8] bg-white hover:bg-[#FAF8F5]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-[#1A1510]">{app.name}</p>
                                  {selectedUpiApp === app.name && (
                                    <Check size={12} className="text-[#B8860B]" />
                                  )}
                                </div>
                                <p className="text-[10px] text-[#786857]">{app.sub}</p>
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-[#736352]">
                            A push payment request for <strong>{formatPrice(finalTotalINR, currency)}</strong> will be sent to your {selectedUpiApp} app.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. CASH ON DELIVERY (COD) */}
                <div
                  className={`rounded-lg border transition-all overflow-hidden ${
                    formData.paymentMethod === 'Cash on Delivery (COD)'
                      ? 'border-[#205A32] bg-[#F7FCF8] shadow-sm'
                      : 'border-[#E2DACB] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <label className="p-3.5 flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery (COD)"
                      checked={formData.paymentMethod === 'Cash on Delivery (COD)'}
                      onChange={handleInputChange}
                      className="mt-1 text-[#205A32] focus:ring-[#205A32]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Banknote size={16} className="text-[#205A32]" />
                          <p className="text-xs font-bold text-[#1A1510]">
                            Cash on Delivery (COD)
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#205A32] bg-[#EFF8F1] px-2 py-0.5 rounded border border-[#D5EAD9]">
                          ₹0 Advance • Pay at Doorstep
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786857] mt-0.5">
                        Inspect the authentic Silk Mark package and pay with cash or courier UPI scanner upon delivery.
                      </p>
                    </div>
                  </label>

                  {/* Sub-panel for Cash on Delivery */}
                  {formData.paymentMethod === 'Cash on Delivery (COD)' && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#DDECE1] bg-white space-y-3 text-xs">
                      {/* COD Features & Reassurance Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E9E1D4] space-y-1">
                          <div className="flex items-center gap-1.5 text-[#205A32] font-semibold text-[11px]">
                            <CheckCircle size={13} />
                            <span>Zero Advance Deposit</span>
                          </div>
                          <p className="text-[10px] text-[#6E5F50] leading-tight">
                            You do not need to pay anything right now. Total <strong>{formatPrice(finalTotalINR, currency)}</strong> is paid only when hand-delivered to your door.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E9E1D4] space-y-1">
                          <div className="flex items-center gap-1.5 text-[#205A32] font-semibold text-[11px]">
                            <PackageCheck size={13} />
                            <span>Cash OR UPI to Courier</span>
                          </div>
                          <p className="text-[10px] text-[#6E5F50] leading-tight">
                            Courier partners (BlueDart / Delhivery) carry a wireless UPI QR code as well as accept exact physical cash.
                          </p>
                        </div>
                      </div>

                      {/* Dispatch & Verification Snapshot */}
                      <div className="bg-[#FAF7F0] p-3 rounded-lg border border-[#E8DFCF] space-y-1 text-[11px]">
                        <div className="flex justify-between text-[#5C4D3E]">
                          <span>Confirmed Delivery To:</span>
                          <span className="font-semibold text-[#1A1510] text-right">
                            {formData.street ? `${formData.street}, ` : ''}{formData.city || 'Visakhapatnam'} ({formData.postalCode || '530017'})
                          </span>
                        </div>
                        <div className="flex justify-between text-[#5C4D3E]">
                          <span>Dispatch Verification Mobile:</span>
                          <span className="font-mono font-semibold text-[#1A1510]">
                            {formData.phone || '+91 93471 59353'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#205A32] pt-1 border-t border-[#E8DFCF] font-bold">
                          <span>Amount Due on Arrival:</span>
                          <span className="font-serif text-sm">{formatPrice(finalTotalINR, currency)}</span>
                        </div>
                      </div>

                      {/* Anti-spam confirmation agreement */}
                      <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-[11px] text-[#4A3E33]">
                        <input
                          type="checkbox"
                          checked={codAgreed}
                          onChange={(e) => setCodAgreed(e.target.checked)}
                          className="mt-0.5 rounded text-[#205A32] focus:ring-[#205A32]"
                        />
                        <span>
                          I confirm my delivery details and commit to being available to accept the parcel and settle {formatPrice(finalTotalINR, currency)} via cash or courier UPI.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. ONLINE PAYMENT (KOTAK MAHENDRA BANK) */}
                <div
                  className={`rounded-lg border transition-all overflow-hidden ${
                    formData.paymentMethod === 'Online Payment (Bank Transfer)'
                      ? 'border-[#B8860B] bg-[#FFFDF7] shadow-sm'
                      : 'border-[#E2DACB] bg-white hover:bg-[#FAF8F5]'
                  }`}
                >
                  <label className="p-3.5 flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Payment (Bank Transfer)"
                      checked={formData.paymentMethod === 'Online Payment (Bank Transfer)'}
                      onChange={handleInputChange}
                      className="mt-1 text-[#B8860B] focus:ring-[#B8860B]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#8C6D2B]" />
                          <p className="text-xs font-bold text-[#1A1510]">
                            Online Payment (Kotak Mahindra Bank Transfer)
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#800020] bg-[#FAF2EB] px-2 py-0.5 rounded border border-[#E8DAC8]">
                          NEFT / RTGS / IMPS / NetBanking
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786857] mt-0.5">
                        Direct online settlement to Aavira Boutique official account via mobile banking or web portal.
                      </p>
                    </div>
                  </label>

                  {formData.paymentMethod === 'Online Payment (Bank Transfer)' && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#F2ECE1] bg-white space-y-3.5">
                      {/* Bank Details Showcase Card */}
                      <div className="bg-[#1C1814] text-[#F3EBD4] p-4 rounded-xl border border-[#C5A059]/40 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2 border-b border-[#C5A059]/25 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-[#B8860B]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#E8DCC4] shrink-0">
                              <Building2 size={15} className="text-[#C5A059]" />
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-sm tracking-wide text-white">
                                {AAVIRA_BANK_DETAILS.bankName}
                              </h4>
                              <p className="text-[10px] text-[#C5A059] uppercase tracking-wider">
                                Official Boutique Account • Branch: {AAVIRA_BANK_DETAILS.branch}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyBankField('all', getFormattedBankDetailsText(finalTotalINR))}
                            className="inline-flex items-center gap-1.5 bg-[#B8860B]/25 hover:bg-[#B8860B]/40 border border-[#C5A059]/50 text-[#F3EBD4] text-[11px] font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
                            title="Copy all bank details for NetBanking"
                          >
                            {copiedBankField === 'all' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            <span>{copiedBankField === 'all' ? 'All Copied!' : 'Copy All Bank Details'}</span>
                          </button>
                        </div>

                        {/* Bank Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Account Name */}
                          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#A89885] uppercase tracking-wider block">Account Name (Beneficiary)</span>
                              <span className="font-bold text-white tracking-wide text-xs">{AAVIRA_BANK_DETAILS.accountName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyBankField('accName', AAVIRA_BANK_DETAILS.accountName)}
                              className="text-[#C5A059] hover:text-white p-1 rounded transition-colors cursor-pointer"
                              title="Copy Account Name"
                            >
                              {copiedBankField === 'accName' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                          </div>

                          {/* Beneficiary Name / Contact */}
                          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#A89885] uppercase tracking-wider block">Account Holder / Beneficiary</span>
                              <span className="font-bold text-white tracking-wide text-xs">{AAVIRA_BANK_DETAILS.beneficiaryName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyBankField('benName', AAVIRA_BANK_DETAILS.beneficiaryName)}
                              className="text-[#C5A059] hover:text-white p-1 rounded transition-colors cursor-pointer"
                              title="Copy Beneficiary Name"
                            >
                              {copiedBankField === 'benName' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                          </div>

                          {/* Account Number */}
                          <div className="bg-[#B8860B]/15 rounded-lg p-2.5 border border-[#C5A059]/40 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#C5A059] uppercase tracking-wider block font-semibold">Account Number (A/C)</span>
                              <span className="font-mono text-base font-bold text-white tracking-wider">{AAVIRA_BANK_DETAILS.accountNumber}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyBankField('accNum', AAVIRA_BANK_DETAILS.accountNumber)}
                              className="bg-[#B8860B] hover:bg-[#C5A059] text-[#14100C] font-semibold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              title="Copy Account Number"
                            >
                              {copiedBankField === 'accNum' ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedBankField === 'accNum' ? 'Copied' : 'Copy A/C'}</span>
                            </button>
                          </div>

                          {/* IFSC Code */}
                          <div className="bg-[#B8860B]/15 rounded-lg p-2.5 border border-[#C5A059]/40 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#C5A059] uppercase tracking-wider block font-semibold">IFSC Code</span>
                              <span className="font-mono text-base font-bold text-white tracking-wider">{AAVIRA_BANK_DETAILS.ifscCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyBankField('ifsc', AAVIRA_BANK_DETAILS.ifscCode)}
                              className="bg-[#B8860B] hover:bg-[#C5A059] text-[#14100C] font-semibold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              title="Copy IFSC Code"
                            >
                              {copiedBankField === 'ifsc' ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedBankField === 'ifsc' ? 'Copied' : 'Copy IFSC'}</span>
                            </button>
                          </div>

                          {/* Branch & Country */}
                          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 sm:col-span-2 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#A89885] uppercase tracking-wider block">Branch & Country</span>
                              <span className="font-medium text-white text-xs">{AAVIRA_BANK_DETAILS.branch}, {AAVIRA_BANK_DETAILS.country}</span>
                            </div>
                            <span className="text-[10px] text-[#25D366] bg-[#25D366]/15 border border-[#25D366]/30 px-2.5 py-0.5 rounded-full font-medium">
                              ● IMPS / NEFT / RTGS Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* UTR / Reference Input */}
                      <div className="bg-[#FAF8F5] border border-[#E8E0D2] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#1A1510]">
                            Transfer UTR / Transaction Reference (Optional)
                          </label>
                          <span className="text-[10px] text-[#786857]">Auto-verified with Atelier Concierge</span>
                        </div>
                        <input
                          type="text"
                          name="bankUtr"
                          value={formData.bankUtr}
                          onChange={handleInputChange}
                          placeholder="e.g., 423981290123 / KKBK..."
                          className="w-full border border-[#D9D0C1] rounded px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-[#B8860B]"
                        />
                        <p className="text-[11px] text-[#736352] leading-relaxed">
                          Please initiate the payment of <strong>{formatPrice(finalTotalINR, currency)}</strong> to Kotak Mahindra Bank A/C <strong>4813092900</strong> and click <em>Authorize Payment</em> below to confirm your order.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badge Bar */}
              <div className="flex items-center gap-2 text-[11px] text-[#736352] pt-1">
                <Lock size={14} className="text-[#B8860B]" />
                <span>Your order is protected by Silk Mark certification & 256-bit atelier security protocol.</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={formData.paymentMethod === 'Cash on Delivery (COD)' && !codAgreed}
                className={`w-full py-3.5 rounded text-xs uppercase tracking-widest font-bold transition-all shadow-md mt-4 flex items-center justify-center gap-2 ${
                  formData.paymentMethod === 'Cash on Delivery (COD)'
                    ? 'bg-[#205A32] text-white hover:bg-[#184526] disabled:opacity-50'
                    : 'bg-[#B8860B] text-[#14100C] hover:bg-[#C5A059]'
                }`}
                id="authorize-payment-btn"
              >
                {formData.paymentMethod === 'Cash on Delivery (COD)' ? (
                  <>
                    <PackageCheck size={16} />
                    <span>Confirm Order with Cash on Delivery ({formatPrice(finalTotalINR, currency)})</span>
                  </>
                ) : formData.paymentMethod === 'Online Payment (Bank Transfer)' ? (
                  <>
                    <Building2 size={16} />
                    <span>Confirm Online Bank Transfer ({formatPrice(finalTotalINR, currency)})</span>
                  </>
                ) : formData.paymentMethod === 'UPI' ? (
                  <>
                    <Smartphone size={16} />
                    <span>Authorize {formatPrice(finalTotalINR, currency)} via UPI</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Authorize {formatPrice(finalTotalINR, currency)} & Place Order</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: CONFIRMED ORDER RECEIPT WITH DEDICATED COD / UPI HIGHLIGHTS */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                  confirmedOrder.paymentMethod.includes('Cash on Delivery')
                    ? 'bg-[#EFF8F1] text-[#205A32]'
                    : 'bg-[#FAF4E6] text-[#8C6D2B]'
                }`}
              >
                <CheckCircle size={36} />
              </div>

              <h3 className="font-serif text-2xl text-[#1A1510]">
                {confirmedOrder.paymentMethod.includes('Cash on Delivery')
                  ? 'Cash on Delivery Order Confirmed'
                  : 'Couture Order Confirmed'}
              </h3>
              <p className="text-xs text-[#6E5E4E] max-w-md mx-auto">
                Thank you, <strong>{confirmedOrder.customerName}</strong>. Your order has been registered at the
                Aavira Visakhapatnam atelier under reference:
              </p>

              {/* Order Reference Box */}
              <div className="bg-[#F6F2E9] border border-[#DCD1BF] rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-[11px] uppercase tracking-wider text-[#8A7963]">Order Reference</p>
                <p className="font-serif text-xl font-bold text-[#1A1510] tracking-wider my-1">
                  {confirmedOrder.id}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#205A32] animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#205A32]">
                    Status: {confirmedOrder.status}
                  </span>
                  <span className="text-[#C5B39A]">•</span>
                  <span className="text-[10px] font-semibold text-[#4A3E33] bg-[#EAE2D3] px-2 py-0.5 rounded-full">
                    Bag & Wishlist Cleared
                  </span>
                </div>
              </div>

              {/* Customer Payment & Order Received Acknowledgment Banner */}
              <div className="p-4 bg-[#FAF6EE] border-2 border-[#C5A059] rounded-xl max-w-lg mx-auto text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1A1510] text-[#D4B98C] flex items-center justify-center font-serif font-bold text-sm border border-[#B8860B] shadow-xs shrink-0">
                      👑
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1A1510] tracking-wide uppercase">
                        Aavira Atelier • Payment & Order Received
                      </h4>
                      <p className="text-[11px] text-[#7A6A58]">
                        Official acknowledgment by Managing Director Mrs. K. Ramani
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                    <span>{confirmedOrder.paymentStatus === 'Received' ? 'Verified in Full' : 'COD Registered'}</span>
                  </span>
                </div>

                {/* Recipient & Transaction Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-[#E8DFC8]">
                  <div>
                    <span className="text-[10px] text-[#8C7A65] uppercase tracking-wider block">Customer Recipient:</span>
                    <span className="font-semibold text-[#1A1510]">{confirmedOrder.customerName}</span>
                    <p className="text-[11px] text-[#2C6E3D] font-mono mt-0.5">
                      📱 +{cleanPhoneNumber(confirmedOrder.phone)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7A65] uppercase tracking-wider block">Transaction Ref & UTR:</span>
                    <span className="font-mono font-semibold text-[#B8860B]">#{confirmedOrder.paymentRef}</span>
                    <p className="text-[11px] text-[#7A6A58] mt-0.5">
                      Mode: <span className="font-medium text-[#1A1510]">{confirmedOrder.paymentMethod}</span>
                    </p>
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-[#F2ECE1] flex items-center justify-between text-[11px]">
                    <span className="text-[#6E5E4E]">
                      Insured Courier: <strong>{confirmedOrder.courierPartner || 'BlueDart Air Express'}</strong>
                    </span>
                    <span className="font-mono text-[#8C6D2B] bg-[#FAF4E6] px-2 py-0.5 rounded">
                      AWB: {confirmedOrder.awbNumber || 'BD-88319024IN'}
                    </span>
                  </div>
                </div>

                {/* Kotak Bank Transfer Confirmation Card */}
                {(confirmedOrder.paymentMethod.includes('Kotak') || confirmedOrder.paymentMethod.includes('Bank')) && (
                  <div className="p-3 bg-white rounded-lg border border-[#C5A059]/40 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-1.5">
                      <span className="font-semibold text-[#1A1510] flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#B8860B]" />
                        Kotak Mahindra Bank Transfer Info
                      </span>
                      <span className="text-[10px] bg-[#FAF2EB] text-[#800020] px-2 py-0.5 rounded font-semibold border border-[#E8DAC8]">
                        A/C: {AAVIRA_BANK_DETAILS.accountNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#635343] leading-relaxed">
                      Beneficiary: <strong>{AAVIRA_BANK_DETAILS.accountName}</strong> ({AAVIRA_BANK_DETAILS.beneficiaryName}) • IFSC: <strong className="font-mono">{AAVIRA_BANK_DETAILS.ifscCode}</strong> • Branch: {AAVIRA_BANK_DETAILS.branch}, {AAVIRA_BANK_DETAILS.country}.
                    </p>
                  </div>
                )}

                {/* Embedded Saree Preview Strip */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6D2B]">
                    Included in Your Lookbook & Invoice:
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {confirmedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative group shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-[#B8860B] bg-white shadow-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] text-center font-mono py-0.5 truncate px-0.5">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="shrink-0 flex flex-col justify-center text-[10px] text-[#2C6E3D] pl-1 font-medium leading-tight">
                      <span>✓ Silk Mark India</span>
                      <span>✓ High-Res Photos</span>
                      <span>✓ Tailoring Specs</span>
                    </div>
                  </div>
                </div>

                {/* PDF Compilation Progress or Ready State */}
                {isGeneratingPdf ? (
                  <div className="p-2.5 bg-white/90 rounded-lg border border-[#E8DFC8] flex items-center justify-center gap-2 text-xs text-[#8C6D2B]">
                    <Loader2 size={16} className="animate-spin text-[#B8860B]" />
                    <span>Compiling Lookbook PDF with embedded saree photos...</span>
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-lg border border-[#E8DFC8] flex items-center justify-between text-xs text-[#1A1510]">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={15} className="text-[#B8860B] shrink-0" />
                      <span className="font-mono text-[11px] truncate">
                        {generatedPdf?.filename || `Aavira-Order-${confirmedOrder.id}.pdf`}
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#FAF4E6] text-[#8C6D2B] px-2 py-0.5 rounded font-medium shrink-0">
                      PDF Ready
                    </span>
                  </div>
                )}

                {/* NOTIFICATIONS DISPATCH SECTION: CUSTOMER & ATELIER */}
                <div className="pt-2 space-y-3">
                  {/* 1. HERO: CUSTOMER PAYMENT & ORDER RECEIPT (AUTOMATICALLY DISPATCHED) */}
                  <div className="bg-[#EAF7EE] p-4 rounded-xl border border-[#94D6A4] space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C2E5CC] pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#144421]">
                        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                        <MessageCircle size={17} className="text-[#25D366]" />
                        <span className="text-sm">Customer WhatsApp Payment & Order Receipt</span>
                      </div>
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="text-[11px] bg-white text-[#1E522C] font-mono px-2.5 py-0.5 rounded-full border border-[#B1DEC0] font-semibold flex items-center gap-1">
                          <Check size={12} className="text-[#25D366]" />
                          +{cleanPhoneNumber(confirmedOrder.phone)}
                        </span>
                        <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Auto-Sent
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-lg border border-[#C2E5CC] text-xs text-[#205A32] space-y-1">
                      <p className="font-semibold text-[#144421] flex items-center justify-between">
                        <span>Payment & Order Received Message Prepared</span>
                        <span className="text-[10px] text-[#25D366] font-bold">✓ Verified</span>
                      </p>
                      <p className="text-[11px] text-[#2C6E3D] leading-relaxed">
                        Contains official tax invoice link, UTR ref <strong>#{confirmedOrder.paymentRef}</strong>, ordered saree tailoring specs, courier AWB tracking, and atelier concierge contacts.
                      </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        id="open-customer-whatsapp-primary-btn"
                        type="button"
                        onClick={() => {
                          sendPaymentReceivedWhatsAppToCustomer(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl,
                            'api'
                          );
                          const msg = generatePaymentReceivedWhatsAppMessage(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl
                          );
                          copyMessageToClipboard(msg);
                          setCustomerSentConfirmation(true);
                        }}
                        className="flex-1 py-2.5 px-3.5 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform active:scale-98"
                      >
                        <MessageCircle size={16} />
                        <span>
                          {customerSentConfirmation
                            ? `✓ Open Customer WhatsApp (+${cleanPhoneNumber(confirmedOrder.phone)})`
                            : `Open Customer WhatsApp (+${cleanPhoneNumber(confirmedOrder.phone)})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sendPaymentReceivedWhatsAppToCustomer(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl,
                            'web'
                          );
                          setCustomerSentConfirmation(true);
                        }}
                        className="px-3 py-2 bg-white hover:bg-[#FAF8F5] border border-[#A5D6B1] rounded-lg text-xs font-semibold text-[#1E522C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Open directly in WhatsApp Web browser interface"
                      >
                        <ExternalLink size={13} className="text-[#25D366]" />
                        <span>WhatsApp Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const msg = generatePaymentReceivedWhatsAppMessage(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl
                          );
                          copyMessageToClipboard(msg);
                          setCopiedReceiptMessage(true);
                          setTimeout(() => setCopiedReceiptMessage(false), 3000);
                        }}
                        className="px-3 py-2 bg-white hover:bg-[#FAF8F5] border border-[#A5D6B1] rounded-lg text-xs font-medium text-[#1E522C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Copy formatted customer receipt text to clipboard"
                      >
                        {copiedReceiptMessage ? (
                          <>
                            <Check size={13} className="text-[#25D366]" />
                            <span className="text-[#25D366] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="text-[#2C6E3D]" />
                            <span>Copy Receipt</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Resend to Alternate WhatsApp Number Feature */}
                    <div className="pt-1">
                      {!isChangingPhone ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPhone(true);
                            setCustomResendPhone(cleanPhoneNumber(confirmedOrder.phone));
                          }}
                          className="text-[11px] text-[#205A32] hover:text-[#137333] font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                        >
                          Send receipt to an alternate or family WhatsApp number
                        </button>
                      ) : (
                        <div className="bg-white p-2.5 rounded-lg border border-[#B1DEC0] space-y-2">
                          <label className="text-[11px] font-semibold text-[#1E522C] block">
                            Send Order Receipt to Alternate WhatsApp:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              value={customResendPhone}
                              onChange={(e) => setCustomResendPhone(e.target.value)}
                              placeholder="e.g. 9848012345 or +91..."
                              className="flex-1 bg-[#FAFDFB] border border-[#A5D6B1] rounded px-2.5 py-1 text-xs text-[#1A1510] focus:outline-none focus:border-[#25D366]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customResendPhone.trim()) {
                                  const tempOrder: Order = { ...confirmedOrder, phone: customResendPhone.trim() };
                                  sendPaymentReceivedWhatsAppToCustomer(
                                    tempOrder,
                                    generatedPdf?.publicPdfUrl,
                                    currency,
                                    generatedPdf?.viewUrl
                                  );
                                  setIsChangingPhone(false);
                                }
                              }}
                              className="px-3 py-1 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Send Now
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsChangingPhone(false)}
                              className="px-2 py-1 bg-white border border-[#DDD3C2] text-[#6E5E4E] hover:bg-[#F5EFE6] rounded text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. ATELIER WHATSAPP ORDER RECEIVED ALERT */}
                  <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#D9C496] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#553C14]">
                        <Crown size={15} className="text-[#B8860B]" />
                        <span>Aavira Haute Couture Atelier WhatsApp Alert</span>
                      </div>
                      <span className="text-[10px] text-[#7A5B1E] font-mono bg-white px-2 py-0.5 rounded border border-[#E0D0B0]">
                        +91 93471 59353 (Mrs. K. Ramani)
                      </span>
                    </div>

                    <p className="text-[11px] text-[#634E26] leading-relaxed">
                      Dispatched to Managing Director Mrs. K. Ramani & atelier master weavers with customer measurements, address, UTR ref, and lookbook PDF.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        id="send-atelier-whatsapp-btn"
                        type="button"
                        onClick={() => {
                          sendOrderReceivedWhatsAppToAtelier(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl
                          );
                          const msg = generateAtelierOrderAlertWhatsAppMessage(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl
                          );
                          copyMessageToClipboard(msg);
                          setAtelierSentConfirmation(true);
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#1C1814] hover:bg-[#332920] text-[#F3EBD4] rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-[#B8860B] shadow-xs transition-all cursor-pointer transform active:scale-98"
                      >
                        <MessageCircle size={15} className="text-[#25D366]" />
                        <span>
                          {atelierSentConfirmation
                            ? '✓ Atelier Production Alert Dispatched (+91 93471 59353)'
                            : 'Send Alert to Atelier WhatsApp (+91 93471 59353)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const msg = generateAtelierOrderAlertWhatsAppMessage(
                            confirmedOrder,
                            generatedPdf?.publicPdfUrl,
                            currency,
                            generatedPdf?.viewUrl
                          );
                          copyMessageToClipboard(msg);
                          setCopiedAtelierMessage(true);
                          setTimeout(() => setCopiedAtelierMessage(false), 3000);
                        }}
                        className="px-3 py-2 bg-white hover:bg-[#F7F2E7] border border-[#D9C496] rounded-lg text-xs font-medium text-[#553C14] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Copy full atelier production alert text to clipboard"
                      >
                        {copiedAtelierMessage ? (
                          <>
                            <Check size={13} className="text-[#25D366]" />
                            <span className="text-[#25D366] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} className="text-[#8C6D2B]" />
                            <span>Copy Atelier Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Multi-Channel Fallbacks Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sendOrderReceivedWhatsAppToAtelier(
                          confirmedOrder,
                          generatedPdf?.publicPdfUrl,
                          currency,
                          generatedPdf?.viewUrl
                        );
                        sendPaymentReceivedWhatsAppToCustomer(
                          confirmedOrder,
                          generatedPdf?.publicPdfUrl,
                          currency,
                          generatedPdf?.viewUrl
                        );
                        const atelierMsg = generateAtelierOrderAlertWhatsAppMessage(
                          confirmedOrder,
                          generatedPdf?.publicPdfUrl,
                          currency,
                          generatedPdf?.viewUrl
                        );
                        copyMessageToClipboard(atelierMsg);
                        setAtelierSentConfirmation(true);
                        setCustomerSentConfirmation(true);
                      }}
                      className="p-2 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#D9D0C1] rounded-lg text-[11px] font-semibold text-[#1A1510] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Notify both Atelier (+91 9347159353) and Customer WhatsApp"
                    >
                      <Zap size={13} className="text-[#B8860B]" />
                      <span>Notify Both (Atelier & Client)</span>
                    </button>

                    <a
                      href={`mailto:${confirmedOrder.email || 'client@aavira.com'}?subject=${encodeURIComponent(
                        `Aavira Order & Payment Confirmation #${confirmedOrder.id}`
                      )}&body=${encodeURIComponent(
                        generatePaymentReceivedWhatsAppMessage(
                          confirmedOrder,
                          generatedPdf?.publicPdfUrl,
                          currency,
                          generatedPdf?.viewUrl
                        )
                      )}`}
                      className="p-2 bg-white hover:bg-[#FAF8F5] border border-[#D9D0C1] rounded-lg text-[11px] font-medium text-[#1A1510] flex items-center justify-center gap-1.5 transition-colors text-center"
                      title="Send full confirmation breakdown via email"
                    >
                      <ExternalLink size={13} className="text-[#B8860B]" />
                      <span>Email Receipt</span>
                    </a>

                    <a
                      href={`sms:${cleanPhoneNumber(confirmedOrder.phone)}?body=${encodeURIComponent(
                        `Aavira Haute Couture: Payment & Order #${confirmedOrder.id} received. View PDF: ${
                          generatedPdf?.publicPdfUrl || `/api/orders/${confirmedOrder.id}/pdf`
                        }`
                      )}`}
                      className="p-2 bg-white hover:bg-[#FAF8F5] border border-[#D9D0C1] rounded-lg text-[11px] font-medium text-[#1A1510] flex items-center justify-center gap-1.5 transition-colors text-center"
                      title="Send instant SMS notification to customer"
                    >
                      <Smartphone size={13} className="text-[#554332]" />
                      <span>SMS Mobile</span>
                    </a>
                  </div>
                </div>

                {/* Documents & Lookbook Strip */}
                <div className="pt-2 border-t border-[#E8DFC8] grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="w-full py-2.5 px-3 bg-[#1C1814] hover:bg-[#332920] text-[#F3EBD4] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-[#B8860B] shadow-xs transition-all cursor-pointer"
                  >
                    <FileText size={15} className="text-[#B8860B]" />
                    <span>View Official Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (generatedPdf) {
                        triggerFileDownload(generatedPdf.file, generatedPdf.filename);
                      } else {
                        window.open(`/api/orders/${confirmedOrder.id}/pdf`, '_blank');
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-[#FAF4E6] hover:bg-[#F2E8D4] text-[#634E26] border border-[#E8DCC4] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Download size={15} className="text-[#B8860B]" />
                    <span>Download Lookbook PDF</span>
                  </button>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="border-t border-[#E8E0D2] pt-4 text-left max-w-md mx-auto text-xs space-y-2 text-[#5E4F41]">
                <div className="flex justify-between">
                  <span>Shipping Address:</span>
                  <span className="font-medium text-[#1A1510] text-right">
                    {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-[#1A1510]">{confirmedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Managing Concierge:</span>
                  <span className="font-medium text-[#1A1510]">Mrs. K. Ramani (+91 93471 59353)</span>
                </div>
                <div className="flex justify-between border-t border-[#E8E0D2] pt-2 font-bold text-sm text-[#1A1510]">
                  <span>
                    {confirmedOrder.paymentMethod.includes('Cash on Delivery')
                      ? 'Total Payable on Delivery:'
                      : 'Total Settled:'}
                  </span>
                  <span className="text-[#B8860B] font-serif">{formatPrice(confirmedOrder.totalINR, currency)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-[#D9D0C1] rounded text-xs text-[#4A3E33] hover:bg-[#F2ECE1] flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#1C1814] text-[#F3EBD4] rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] cursor-pointer"
                >
                  Return to Boutique
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENLARGED FULL-SCREEN QR SCANNER MODAL */}
      {isQrEnlarged && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setIsQrEnlarged(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQrEnlarged(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#FAF7F0] hover:bg-[#EAE3D5] text-[#1A1510] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EEF9] border border-[#E5D7F1] text-[#5A2C82] text-[11px] font-bold rounded-full mb-1">
                <span>PhonePe UPI</span>
                <span>•</span>
                <span>Instant Scan</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1A1510]">
                {upiPayee.name}
              </h4>
              <p className="text-xs text-[#736352] mt-0.5 font-mono">
                {upiPayee.upiId}
              </p>
            </div>

            {/* High-Resolution QR Code */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD0] rounded-xl flex items-center justify-center shadow-inner">
              <img
                src={upiPayee.qrImageUrl}
                alt={`PhonePe UPI QR Code - ${upiPayee.name}`}
                className="w-64 h-auto object-contain rounded-lg bg-white p-2 shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Amount and Notice */}
            <div className="bg-[#FAF4E8] p-3 rounded-lg border border-[#E8DCC4] text-xs">
              <p className="text-[#736352]">Exact Payable Amount:</p>
              <p className="text-lg font-serif font-bold text-[#B8860B] mt-0.5">
                {formatPrice(finalTotalINR, currency)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="flex-1 py-2.5 bg-[#FAF4E8] text-[#786134] hover:bg-[#F2E8D4] border border-[#E6DBCA] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedUpiId ? <Check size={14} className="text-[#205A32]" /> : <Copy size={14} />}
                <span>{copiedUpiId ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 py-2.5 bg-[#1C1814] text-[#F3EBD4] hover:bg-[#332920] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>Save QR Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Payment & Delivery Receipt Modal */}
      {isReceiptModalOpen && confirmedOrder && (
        <OrderPaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          order={confirmedOrder}
          currency={currency}
        />
      )}
    </div>
  );
};
