import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Package,
  Truck,
  ArrowRight,
  FileText,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { PageTab, Order, ReturnRequest } from '../types';
import { safeSetLocalStorage } from '../utils/productImageStore';
import {
  RETURN_REASONS,
  RESOLUTION_OPTIONS,
  sendReturnRequestWhatsApp,
  generateReturnWhatsAppMessage,
} from '../utils/returnHelper';

interface ReturnPolicyViewProps {
  onNavigate: (tab: PageTab) => void;
  orders?: Order[];
  prefilledOrderId?: string;
  onSelectCategory?: (category: string) => void;
}

export const ReturnPolicyView: React.FC<ReturnPolicyViewProps> = ({
  onNavigate,
  orders = [],
  prefilledOrderId,
}) => {
  const [activeTab, setActiveTab] = useState<'clauses' | 'form'>('clauses');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeClause, setActiveClause] = useState<string | null>('window');
  const [returnSuccessRma, setReturnSuccessRma] = useState<ReturnRequest | null>(null);

  // Form State
  const [orderId, setOrderId] = useState(prefilledOrderId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [itemPriceINR, setItemPriceINR] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState<ReturnRequest['reason']>('manufacturing_defect');
  const [reasonDetails, setReasonDetails] = useState('');
  const [preferredResolution, setPreferredResolution] = useState<ReturnRequest['preferredResolution']>('refund');
  const [exchangePreferences, setExchangePreferences] = useState('');
  const [hasPhotoProof, setHasPhotoProof] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from orders if available
  useEffect(() => {
    if (orderId && orders.length > 0) {
      const match = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (match) {
        if (!customerName) setCustomerName(match.customerName);
        if (!customerPhone) setCustomerPhone(match.phone);
        if (!customerEmail && match.email) setCustomerEmail(match.email);
        if (match.items && match.items.length > 0 && !productName) {
          setProductName(match.items[0].productName);
          setItemPriceINR(match.items[0].priceINR);
        }
      }
    }
  }, [orderId, orders]);

  // If prefilledOrderId passed, switch directly to form tab
  useEffect(() => {
    if (prefilledOrderId) {
      setOrderId(prefilledOrderId);
      setActiveTab('form');
    }
  }, [prefilledOrderId]);

  const termsUrl = typeof window !== 'undefined' ? `${window.location.origin}/terms-and-conditions.html` : 'https://aavira-boutique.com/terms-and-conditions.html';

  const handleCopyTermsLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(termsUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      });
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleSelectOrder = (selectedOrder: Order) => {
    setOrderId(selectedOrder.id);
    setCustomerName(selectedOrder.customerName);
    setCustomerPhone(selectedOrder.phone);
    if (selectedOrder.email) setCustomerEmail(selectedOrder.email);
    if (selectedOrder.items && selectedOrder.items.length > 0) {
      setProductName(selectedOrder.items[0].productName);
      setItemPriceINR(selectedOrder.items[0].priceINR);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert('Please acknowledge and agree to the Terms & Conditions of AAVIRA BOUTIQUE to continue.');
      return;
    }
    if (!orderId || !customerName || !customerPhone || !productName || !reasonDetails) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const rmaId = `AAV-RET-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReturn: ReturnRequest = {
      id: rmaId,
      orderId: orderId.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      productName: productName.trim(),
      itemPriceINR,
      reason,
      reasonDetails: reasonDetails.trim(),
      preferredResolution,
      exchangePreferences: exchangePreferences.trim(),
      photoEvidence: hasPhotoProof ? 'Customer indicated photos/videos ready' : undefined,
      status: 'Pending Approval',
      createdAt: new Date().toISOString(),
    };

    try {
      // Post to backend if available
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn),
      }).catch(() => null);

      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem('aavira_returns_catalog') || '[]');
        existing.unshift(newReturn);
        safeSetLocalStorage('aavira_returns_catalog', JSON.stringify(existing));
      } catch (err) {
        console.warn('Could not save return locally:', err);
      }

      setReturnSuccessRma(newReturn);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clauses = [
    {
      id: 'window',
      num: 1,
      title: 'Return Window',
      summary: '7 Days from Delivery or Purchase',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>
            You can request a return or exchange within <strong>7 days</strong> of delivery for online orders, or from the date of purchase for in-store orders at our flagship salon.
          </p>
          <p>
            Requests received after this 7-day period will not be accepted, other than for documented latent manufacturing defects verified by our master weavers under Clause 4.
          </p>
        </div>
      ),
    },
    {
      id: 'condition',
      num: 2,
      title: 'Condition of the Item',
      summary: 'Unworn, Unwashed, Original Tags & Silk Mark Labels',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>For an easy, no-fuss return, the handloom saree or couture ensemble must be returned in pristine original condition:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#4A3B30]">
            <li><strong>Unused, unworn, unwashed, and unaltered</strong>.</li>
            <li>With all original tags, Silk Mark certification label, and luxury presentation box intact.</li>
            <li>Completely free of perfumes, deodorants, makeup residue, or fabric creasing.</li>
          </ul>
          <p className="text-[#8C6D2B] bg-[#FAF5EB] p-2.5 rounded-lg border border-[#E8DFC8] text-xs">
            <strong>Custom Tailoring Exclusion:</strong> Sarees with custom-stitched blouses, tailored fall/pico edging, or bespoke adjustments executed at your request cannot be returned.
          </p>
        </div>
      ),
    },
    {
      id: 'excluded',
      num: 3,
      title: "What's Not Eligible",
      summary: 'Clearance Sales (30%+), Custom Tailoring & Hygiene Items',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>To preserve our artisanal hygiene and bespoke standards, the following items are strictly non-returnable:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#4A3B30]">
            <li>Items acquired on clearance or flat-discount promotional sales (30% discount or greater).</li>
            <li>Custom-stitched blouse pieces, tailored petticoats, or bespoke bridal trousseau garments.</li>
            <li>Innerwear, shaping wear, and other intimate hygiene-sensitive garments.</li>
            <li>Gift sets and combo packages — these must be returned in their complete original bundle only.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'valid',
      num: 4,
      title: 'Valid Reasons for a Return',
      summary: 'Defects, Wrong Item, or Transit Damage',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <ul className="space-y-2 text-[#4A3B30]">
            <li>
              <strong>1. Manufacturing Defect:</strong> Genuine structural flaws in the silk warp/weft, unstitched zari breaks, or faulty hand-block print misregistration.
            </li>
            <li>
              <strong>2. Wrong Item Received:</strong> A discrepancy where the dispatched saree shade, border motif, or design model differs from your confirmed tax invoice.
            </li>
            <li>
              <strong>3. Damaged in Transit:</strong> Tampered package or physical carton damage incurred during express transit — must be reported within <strong>48 hours of delivery</strong> accompanied by an unboxing photo or video clip.
            </li>
          </ul>
          <p className="text-xs text-[#7A6A58] italic">
            * Note: Subjective changes of mind after wearing, or slight natural variations in pure pit-loom handloom weave texture and screen monitor calibration are hallmarks of authentic handmade crafts and are not considered defects.
          </p>
        </div>
      ),
    },
    {
      id: 'howto',
      num: 5,
      title: 'How to Request a Return',
      summary: 'Fast 5-Step Process via WhatsApp or Online Form',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>We keep the return initiation seamless and transparent:</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-[#4A3B30]">
            <li>
              <strong>Initiate:</strong> Submit the online form below or message our atelier on <strong>WhatsApp (+91 93471 59353)</strong> with your Order ID.
            </li>
            <li>
              <strong>Submit Photos:</strong> Share 1–2 photos or a short clip showcasing the saree and any specific flaw or packaging issue.
            </li>
            <li>
              <strong>Concierge Approval:</strong> Our team reviews and confirms return approval within <strong>2 business days</strong>.
            </li>
            <li>
              <strong>Doorstep Pickup / Store Drop:</strong> Insured BlueDart courier pickup is scheduled directly from your doorstep, or you may drop the parcel at our Visakhapatnam flagship boutique.
            </li>
            <li>
              <strong>Final Resolution:</strong> Upon boutique arrival and quality inspection, you will receive confirmation and refund/exchange dispatch within <strong>3–5 business days</strong>.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'refunds',
      num: 6,
      title: 'Refunds & Store Credit',
      summary: '7–10 Business Days or Instant Credit with +5% Bonus',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>
            Once the returned saree passes quality inspection, refunds are credited directly to your original payment mode (Bank Wire, UPI, or Credit/Debit Card) within <strong>7–10 business days</strong>.
          </p>
          <div className="bg-[#FAF4E6] p-3 rounded-lg border border-[#D9C496] text-xs text-[#634E26] space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-[#553C14]">
              <Sparkles size={14} className="text-[#B8860B]" />
              <span>Opt for Aavira Boutique Store Credit &amp; Get +5% Bonus!</span>
            </p>
            <p>
              Choose boutique credit for immediate availability on your account, loaded with an extra 5% courtesy bonus valid for lifetime heirloom purchases.
            </p>
          </div>
          <p className="text-xs text-[#7A6A58]">
            * Note: Original delivery charges are non-refundable, unless the return arises from an Aavira atelier mistake or transit damage.
          </p>
        </div>
      ),
    },
    {
      id: 'exchange',
      num: 7,
      title: 'Exchanges',
      summary: '1 Free Exchange per Order for Different Color / Weave',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>
            We are pleased to swap your saree for another color, weave variant, or design, subject to current atelier stock. If your chosen piece is currently out of stock, you may select any other creation of equal or higher value, or receive a refund.
          </p>
          <p className="text-xs text-[#7A6A58]">
            A maximum of <strong>one exchange</strong> is permitted per order.
          </p>
        </div>
      ),
    },
    {
      id: 'shipping',
      num: 8,
      title: 'Shipping Costs',
      summary: '100% Free if Boutique Error; Customer-Borne if Preference',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>
            If the return or exchange is due to an Aavira error (e.g., incorrect saree dispatched, transit damage, or genuine fabric defect), <strong>AAVIRA BOUTIQUE covers 100% of the return courier shipping costs</strong>.
          </p>
          <p>
            If the return is initiated by customer personal preference (e.g., opting for a different shade or weave), the nominal reverse shipping fee is borne by the customer.
          </p>
        </div>
      ),
    },
    {
      id: 'check',
      num: 9,
      title: 'Quality Check & Inspection',
      summary: 'Inspection on Arrival by Master Silk Weavers',
      body: (
        <div className="space-y-2 text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
          <p>
            Every return is meticulously inspected by our senior master weavers upon arrival at our Visakhapatnam atelier. If the item does not meet the pristine criteria specified in Clause 2, it will be securely repackaged and dispatched back to the customer, and the return cannot be honored.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 font-sans space-y-10">
      {/* Hero Heading Banner */}
      <div className="bg-gradient-to-b from-[#FAF5F0] to-[#F4ECE2] border border-[#E8DFC8] rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#D9C496] text-[#8C6D2B] text-xs font-semibold uppercase tracking-wider">
            <RotateCcw size={13} className="text-[#A8543A]" />
            <span>AAVIRA BOUTIQUE GUARANTEE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#2B2521] tracking-tight leading-tight">
            Easy Return Policy &amp; Terms
          </h1>

          <p className="text-sm sm:text-base text-[#6B5F55] leading-relaxed max-w-2xl font-light">
            We want you to feel complete confidence and joy with every heirloom handloom piece. If something is not quite right, our transparent, customer-first return and exchange process is here to help.
          </p>

          {/* Value Badges */}
          <div className="pt-2 flex flex-wrap gap-2 sm:gap-3 text-xs text-[#2B2521]">
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E0D0B8] shadow-2xs font-medium">
              <CheckCircle2 size={14} className="text-[#2E7D32]" />
              7-Day Easy Return Window
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E0D0B8] shadow-2xs font-medium">
              <Truck size={14} className="text-[#8C6D2B]" />
              Doorstep Courier Pickup
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E0D0B8] shadow-2xs font-medium">
              <RefreshCw size={14} className="text-[#A8543A]" />
              1 Free Exchange or 100% Refund
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E0D0B8] shadow-2xs font-medium">
              <ShieldCheck size={14} className="text-[#2E7D32]" />
              Silk Mark Pure Heritage
            </span>
          </div>

          {/* Main Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeTab === 'form'
                  ? 'bg-[#A8543A] text-white hover:bg-[#7E3C29]'
                  : 'bg-[#2B2521] text-[#FAF5F0] hover:bg-[#443831]'
              }`}
            >
              <Package size={15} />
              <span>Submit Return Request Online</span>
            </button>

            <a
              href="https://wa.me/919347159353?text=Hello%20Aavira%20Boutique,%20I%20would%20like%20to%20request%20a%20return%20/%20exchange%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Concierge (+91 93471 59353)</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setActiveTab('clauses');
                document.getElementById('terms-clauses-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#D9C496] text-[#553C14] rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileText size={14} className="text-[#8C6D2B]" />
              <span>Read 9 Terms &amp; Conditions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Terms & Conditions Attached Link Card (Explicitly requested by user) */}
      <div className="bg-[#FAF4E8] border-2 border-[#D9C496] rounded-xl p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCC4] pb-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#A8543A] uppercase tracking-wider block">
              Official Legal Documentation
            </span>
            <h3 className="font-serif text-lg sm:text-xl text-[#2B2521]">
              Attached Terms &amp; Conditions of AAVIRA BOUTIQUE
            </h3>
            <p className="text-xs text-[#6B5F55]">
              Every order placed with AAVIRA BOUTIQUE, in-store or online, is governed by these official terms.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/terms-and-conditions.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#2B2521] hover:bg-[#443831] text-[#FAF5F0] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Open Terms &amp; Conditions Link</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Copyable Link Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#553C14] block">
            Direct Shareable URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={termsUrl}
              className="flex-1 bg-white border border-[#D9C496] rounded px-3 py-2 text-xs font-mono text-[#2B2521] select-all focus:outline-none focus:border-[#A8543A]"
            />
            <button
              type="button"
              onClick={handleCopyTermsLink}
              className="px-4 py-2 bg-[#A8543A] hover:bg-[#7E3C29] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-[#25D366]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {copiedLink && (
            <p className="text-[11px] text-[#2E7D32] font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} />
              Terms &amp; conditions link copied to clipboard. You can paste and share it with customers anytime.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Switcher: [1. Terms & Conditions Clauses] vs [2. Submit Return Form] */}
      <div className="flex border-b border-[#E8DFC8] text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('clauses')}
          className={`pb-3 px-4 font-serif text-base transition-colors relative cursor-pointer ${
            activeTab === 'clauses'
              ? 'text-[#A8543A] font-bold border-b-2 border-[#A8543A]'
              : 'text-[#6B5F55] hover:text-[#2B2521]'
          }`}
        >
          <span>9 Official Terms &amp; Conditions Clauses</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`pb-3 px-4 font-serif text-base transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === 'form'
              ? 'text-[#A8543A] font-bold border-b-2 border-[#A8543A]'
              : 'text-[#6B5F55] hover:text-[#2B2521]'
          }`}
        >
          <span>Online Return &amp; Exchange Request Form</span>
          <span className="text-[10px] bg-[#FAF0E6] text-[#A8543A] font-sans font-bold px-2 py-0.5 rounded-full border border-[#D9C496]">
            Easy
          </span>
        </button>
      </div>

      {/* VIEW 1: 9 OFFICIAL CLAUSES */}
      {activeTab === 'clauses' && (
        <div id="terms-clauses-section" className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E8DFC8] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EBE1] pb-3">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#2B2521]">
                  Terms &amp; Conditions of AAVIRA BOUTIQUE for Easy Returns
                </h2>
                <p className="text-xs text-[#6B5F55] mt-0.5">
                  Click any clause below to expand the detailed rules and conditions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveClause(activeClause ? null : 'window')}
                  className="text-xs text-[#A8543A] hover:underline font-semibold"
                >
                  {activeClause ? 'Collapse All' : 'Expand Clauses'}
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="space-y-3 pt-1">
              {clauses.map((clause) => {
                const isOpen = activeClause === clause.id;
                return (
                  <div
                    key={clause.id}
                    id={`clause-${clause.id}`}
                    className="border border-[#E8DFC8] rounded-xl overflow-hidden transition-all bg-[#FAF8F5]/50"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveClause(isOpen ? null : clause.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF4E8] transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#A8543A] font-serif font-bold text-sm flex items-center justify-center border border-[#D9C496] shrink-0">
                          {clause.num}
                        </span>
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-[#2B2521]">
                            {clause.num}. {clause.title}
                          </h3>
                          <p className="text-xs text-[#7A6A58] font-normal">{clause.summary}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-[#8C6D2B] mt-1 sm:mt-0">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-[#F0EBE1] bg-white">
                        {clause.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Return Assistance Box */}
          <div className="bg-[#FAF4E8] border border-[#D9C496] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-bold text-base text-[#2B2521]">
                Ready to submit your return request?
              </h4>
              <p className="text-xs text-[#6B5F55]">
                Fill in the 2-minute online request form, or connect with our atelier team directly on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className="px-5 py-2.5 bg-[#A8543A] hover:bg-[#7E3C29] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>Go to Return Form</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE RETURN REQUEST FORM */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {returnSuccessRma ? (
            /* Return Submission Success State */
            <div className="bg-[#EBF7EE] border-2 border-[#A2D8B0] rounded-2xl p-6 sm:p-8 space-y-5 text-center">
              <div className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] bg-white px-3 py-1 rounded-full border border-[#A2D8B0]">
                  RMA Return Request Logged
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#144421]">
                  Return Request #{returnSuccessRma.id} Received
                </h3>
                <p className="text-xs sm:text-sm text-[#2C6E3D] max-w-xl mx-auto">
                  Thank you, <strong>{returnSuccessRma.customerName}</strong>. Your return request for{' '}
                  <strong>{returnSuccessRma.productName}</strong> (Order #{returnSuccessRma.orderId}) has been registered with the Aavira Atelier Concierge.
                </p>
              </div>

              {/* What Happens Next Checklist */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#C2E5CC] text-left max-w-xl mx-auto space-y-3 text-xs text-[#205A32]">
                <h4 className="font-bold text-sm text-[#144421] border-b border-[#E0F2E5] pb-2">
                  What Happens Next (Easy 3-Step Resolution):
                </h4>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold flex items-center justify-center shrink-0">1</div>
                  <p>
                    <strong>Approval in 2 Business Days:</strong> Managing Director Mrs. K. Ramani and our team will review the details and confirm approval via WhatsApp.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold flex items-center justify-center shrink-0">2</div>
                  <p>
                    <strong>Doorstep Courier Pickup:</strong> We schedule BlueDart to collect the package from your address, or you can drop it at our Visakhapatnam store.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold flex items-center justify-center shrink-0">3</div>
                  <p>
                    <strong>Inspection &amp; Resolution:</strong> Once received, quality inspection takes 3–5 days, after which your chosen resolution (
                    <strong>{returnSuccessRma.preferredResolution === 'refund' ? 'Full Refund' : returnSuccessRma.preferredResolution === 'store_credit' ? 'Store Credit + 5% Bonus' : 'Product Exchange'}</strong>
                    ) will be processed immediately.
                  </p>
                </div>
              </div>

              {/* Instant WhatsApp Dispatch Button */}
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => sendReturnRequestWhatsApp(returnSuccessRma)}
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Send Return Details to Atelier WhatsApp (+91 93471 59353)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReturnSuccessRma(null);
                    setOrderId('');
                    setProductName('');
                    setReasonDetails('');
                  }}
                  className="px-5 py-3 bg-white hover:bg-[#F5F5F5] border border-[#C2E5CC] text-[#205A32] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Submit Another Return
                </button>
              </div>
            </div>
          ) : (
            /* Return Request Form */
            <form onSubmit={handleSubmitReturn} className="bg-white p-5 sm:p-8 rounded-xl border border-[#E8DFC8] space-y-6 shadow-xs">
              <div className="border-b border-[#F0EBE1] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl text-[#2B2521]">
                  Submit an Easy Return or Exchange Request
                </h2>
                <p className="text-xs text-[#6B5F55] mt-1">
                  Please provide your order details. All returns are processed under the 7-day AAVIRA BOUTIQUE return terms.
                </p>
              </div>

              {/* Quick Select from Past Orders if Available */}
              {orders.length > 0 && (
                <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E8DFC8] space-y-2">
                  <label className="text-xs font-semibold text-[#553C14] block">
                    Quick-Fill from Your Recent Orders:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {orders.slice(0, 4).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handleSelectOrder(o)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          orderId === o.id
                            ? 'bg-[#A8543A] text-white border-[#A8543A]'
                            : 'bg-white text-[#2B2521] border-[#D9C496] hover:bg-[#FAF4E8]'
                        }`}
                      >
                        Order #{o.id} ({o.items?.[0]?.productName?.slice(0, 20)}...)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Customer & Order Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Order Reference ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ORD-17489 or 1042"
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                  <span className="text-[10px] text-[#7A6A58] mt-0.5 block">
                    Found on your Tax Invoice or Order Confirmation WhatsApp.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                  <span className="text-[10px] text-[#25D366] font-medium mt-0.5 block">
                    We will send pickup tracking and refund updates to this WhatsApp.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                </div>
              </div>

              {/* Step 2: Saree & Return Reason */}
              <div className="space-y-4 pt-2 border-t border-[#F0EBE1]">
                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Saree / Product Name to Return *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Royal Rani Pink Kanchipuram Pure Silk Saree"
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Reason for Return / Exchange *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnRequest['reason'])}
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  >
                    {RETURN_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 p-2.5 bg-[#FAF4E8] rounded-lg border border-[#E8DFC8] text-xs text-[#6B5F55] flex items-center justify-between">
                    <span>
                      {RETURN_REASONS.find((r) => r.id === reason)?.description}
                    </span>
                    <span className="text-[11px] font-bold text-[#A8543A] shrink-0 ml-2">
                      {RETURN_REASONS.find((r) => r.id === reason)?.badge}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2521] mb-1">
                    Detailed Explanation of the Issue *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    placeholder="Describe any flaws, mismatched colors, or reasons for requesting an exchange..."
                    className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                  />
                </div>
              </div>

              {/* Step 3: Desired Resolution */}
              <div className="space-y-3 pt-2 border-t border-[#F0EBE1]">
                <label className="block text-xs font-bold text-[#2B2521]">
                  Desired Resolution *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        preferredResolution === opt.id
                          ? 'bg-[#FAF0E6] border-[#A8543A] ring-1 ring-[#A8543A]'
                          : 'bg-[#FAF8F5] border-[#E8DFC8] hover:bg-[#FAF4E8]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <input
                            type="radio"
                            name="preferredResolution"
                            checked={preferredResolution === opt.id}
                            onChange={() => setPreferredResolution(opt.id as ReturnRequest['preferredResolution'])}
                            className="accent-[#A8543A]"
                          />
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded font-bold text-[#A8543A] border border-[#E0D0B8]">
                            {opt.highlight}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-[#2B2521] pt-1">{opt.title}</p>
                        <p className="text-[11px] text-[#6B5F55] leading-normal">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {preferredResolution === 'exchange' && (
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-[#2B2521] mb-1">
                      Exchange Preferences (Desired Color, Motif, or Model):
                    </label>
                    <input
                      type="text"
                      value={exchangePreferences}
                      onChange={(e) => setExchangePreferences(e.target.value)}
                      placeholder="e.g. Would like to exchange for Royal Navy Blue Semi-Pattu or larger border"
                      className="w-full bg-[#FAF8F5] border border-[#D9C496] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#A8543A]"
                    />
                  </div>
                )}
              </div>

              {/* Photo Proof Checkbox */}
              <div className="space-y-2 pt-2 border-t border-[#F0EBE1]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPhotoProof}
                    onChange={(e) => setHasPhotoProof(e.target.checked)}
                    className="mt-0.5 accent-[#A8543A] w-4 h-4 rounded cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-[#553C14]">
                    <span className="font-semibold text-[#2B2521]">
                      I have photos / video of the saree and packaging ready to send via WhatsApp.
                    </span>
                    <p className="text-[11px] text-[#7A6A58]">
                      Under Clause 4, defect and transit damage requests require a quick photo or unboxing video to facilitate instantaneous approval.
                    </p>
                  </div>
                </label>

                {/* Terms Agreement Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-[#FAF4E8] p-3 rounded-lg border border-[#D9C496]">
                  <input
                    type="checkbox"
                    required
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 accent-[#A8543A] w-4 h-4 rounded cursor-pointer shrink-0"
                  />
                  <div className="text-xs text-[#2B2521]">
                    <span className="font-bold">
                      I have read and agree to the{' '}
                      <a
                        href="/terms-and-conditions.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#A8543A] underline underline-offset-2 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions of AAVIRA BOUTIQUE
                      </a>{' '}
                      for Easy Returns. *
                    </span>
                    <p className="text-[11px] text-[#6B5F55] mt-0.5">
                      I confirm the item is unstitched, unworn, unwashed, and within the 7-day return period.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#A8543A] hover:bg-[#7E3C29] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Return Request...</span>
                  ) : (
                    <>
                      <span>Submit Easy Return Request</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Flagship Atelier Contact Card */}
      <div className="bg-[#FAF5F0] rounded-xl border border-[#E8DFC8] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E8DFC8] pb-3">
          <Phone size={17} className="text-[#A8543A]" />
          <h3 className="font-serif text-lg text-[#2B2521]">
            Need Personal Assistance with a Return or Exchange?
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#4A3B30]">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#A8543A] block">
              WhatsApp &amp; Direct Call
            </span>
            <p className="font-bold text-sm text-[#2B2521]">+91 93471 59353</p>
            <p className="text-[11px] text-[#7A6A58]">Managing Director: Mrs. K. Ramani</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#A8543A] block">
              Concierge Email
            </span>
            <p className="font-bold text-sm text-[#2B2521]">aavira.bo@gmail.com</p>
            <p className="text-[11px] text-[#7A6A58]">Replies within 24 hours</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#A8543A] block">
              Flagship Boutique
            </span>
            <p className="font-bold text-[#2B2521]">Ushodhya Junction, MVP Colony</p>
            <p className="text-[11px] text-[#7A6A58]">Visakhapatnam, Andhra Pradesh 530017</p>
          </div>
        </div>
      </div>
    </div>
  );
};
