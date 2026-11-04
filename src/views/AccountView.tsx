import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  Ruler,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  CreditCard,
  Building2,
  Truck,
  Star,
  RotateCcw,
} from 'lucide-react';
import { Product, Order, Currency, PageTab } from '../types';
import { formatPrice } from '../utils/currency';
import {
  generateOrderPdf,
  sendOrderWhatsAppToAtelier,
  sendPaymentReceivedWhatsAppToCustomer,
  triggerFileDownload,
} from '../utils/orderPdfGenerator';
import { OrderPaymentReceiptModal } from '../components/OrderPaymentReceiptModal';
import { getCustomProductImage } from '../utils/productImageStore';

interface AccountViewProps {
  orders: Order[];
  products: Product[];
  wishlistIds: string[];
  currency: Currency;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onRemoveFromWishlist: (productId: string) => void;
  onNavigate: (tab: PageTab) => void;
  initialSubTab?: 'orders' | 'wishlist' | 'measurements';
  onClearWishlist?: () => void;
  onConfirmDelivery?: (orderId: string, rating?: number, feedback?: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  products,
  wishlistIds,
  currency,
  onAddToCart,
  onRemoveFromWishlist,
  onNavigate,
  initialSubTab,
  onClearWishlist,
  onConfirmDelivery,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'wishlist' | 'measurements'>(
    initialSubTab || 'orders'
  );
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [measurements, setMeasurements] = useState({
    bust: '36',
    waist: '29',
    hip: '39',
    blouseLength: '14.5',
    sleeveLength: '11',
    armhole: '16',
    shoulder: '14',
    lehengaLength: '42',
    height: "5'6\"",
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">
      {/* Top Page Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2" id="account-page-heading">
        <p className="text-xs uppercase tracking-[0.3em] text-[#B8860B] font-semibold">Private Salon Access</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1510]">Patron Sanctuary</h1>
        <p className="text-xs text-[#736352]">
          Manage your private haute couture commissions, saved heirloom wishlists, and bespoke measurement dossier.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#1C1814] text-[#E8DCC4] p-6 sm:p-8 rounded-2xl border border-[#3A2E22] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF4E8] text-[#1C1814] font-serif text-2xl font-bold flex items-center justify-center border-2 border-[#C5A059] shrink-0">
            PR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl text-[#FAF8F5]">Priyadarshini Rao</h2>
              <span className="bg-[#C5A059] text-[#14100C] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
                Heritage Gold Patron
              </span>
            </div>
            <p className="text-xs text-[#B5A591] mt-0.5">priya.rao@heritagecorp.in • Visakhapatnam & Hyderabad</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#D9CEBA] bg-[#292017] px-4 py-2.5 rounded-lg border border-[#423324]">
          <div>
            <span className="text-[10px] text-[#A3927B] uppercase block">Atelier Concierge:</span>
            <span className="font-medium text-[#FAF8F5]">Mrs. K. Ramani</span>
          </div>
          <span className="text-[#C5A059]">•</span>
          <div>
            <span className="text-[10px] text-[#A3927B] uppercase block">Lifetime Purchases:</span>
            <span className="font-serif text-[#C5A059] font-bold">₹2,45,000</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex md:flex-nowrap flex-wrap gap-2 border-b border-[#E2DACB] pb-3 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'orders', label: 'Consignment History', icon: Package, count: orders.length },
          { id: 'wishlist', label: 'Saved Haute Wishlist', icon: Heart, count: wishlistedProducts.length },
          { id: 'measurements', label: 'Bespoke Measurement Dossier', icon: Ruler },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#1C1814] text-[#F3EBD4]'
                  : 'bg-white text-[#524436] hover:bg-[#F2ECE1] border border-[#E2DACB]'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-[#C5A059]' : 'text-[#8A7963]'} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-[#FAF4E8] text-[#1A1510] text-[10px] px-1.5 py-0.2 rounded-full font-bold whitespace-nowrap">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Easy Return Policy Notice Banner */}
          <div className="bg-[#FAF5F0] border border-[#E8DFC8] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#A8543A] flex items-center justify-center shrink-0 border border-[#D9C496]">
                <RotateCcw size={15} />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-[#2B2521]">
                  AAVIRA BOUTIQUE 7-Day Easy Return &amp; Exchange Guarantee
                </p>
                <p className="text-[#6B5F55]">
                  Not completely delighted with your saree? Request an easy return or exchange within 7 days.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/terms-and-conditions.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8C6D2B] hover:text-[#553C14] underline text-xs font-medium"
              >
                Terms &amp; Conditions
              </a>
              <button
                type="button"
                onClick={() => onNavigate('returns')}
                className="px-3 py-1.5 bg-[#A8543A] hover:bg-[#7E3C29] text-white rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Return Policy &amp; Form
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#E8E0D2] space-y-3">
              <Package size={32} className="mx-auto text-[#A3927B]" />
              <h3 className="font-serif text-lg text-[#1A1510]">No prior consignments recorded</h3>
              <p className="text-xs text-[#736352]">Discover our handcrafted creations in the Store catalog.</p>
              <button
                onClick={() => onNavigate('shop')}
                className="bg-[#1C1814] text-[#F3EBD4] px-5 py-2 rounded text-xs uppercase tracking-wider font-semibold"
              >
                Explore Store
              </button>
            </div>
          ) : (
            orders.map((ord) => {
              const isPaid = ord.paymentStatus === 'Received' || ord.status === 'Paid' || (!ord.paymentMethod.includes('Cash on Delivery') && ord.paymentStatus !== 'COD Acknowledged');
              const isDelivered = ord.status === 'Delivered' || ord.customerConfirmedDelivery;

              return (
                <div key={ord.id} className="bg-white rounded-xl border border-[#E8E0D2] p-6 shadow-xs space-y-4">
                  {/* Top Order Bar */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#F2ECE1] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1A1510]">{ord.id}</span>
                        {isDelivered && (
                          <span className="bg-[#EFF8F1] text-[#205A32] border border-[#BCE4C6] px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle size={11} />
                            Delivered & Received
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#8C7A65]">Placed on {ord.date}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded font-medium border ${
                        ord.status === 'Delivered'
                          ? 'bg-[#EFF8F1] text-[#205A32] border-[#BCE4C6]'
                          : ord.status === 'Shipped'
                          ? 'bg-[#FAF4E8] text-[#B8860B] border-[#E8DCC4]'
                          : 'bg-[#FFF8E6] text-[#9E6D00] border-[#F3DE9C]'
                      }`}>
                        Fulfillment: {ord.status}
                      </span>
                      <span className="font-serif font-bold text-[#1A1510] text-sm">
                        {formatPrice(ord.totalINR, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Consignment Live Telemetry Bar */}
                  <div className="p-3 bg-[#FAF8F5] border border-[#EBE4D5] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      {ord.paymentMethod.toLowerCase().includes('kotak') || ord.paymentMethod.toLowerCase().includes('bank') ? (
                        <Building2 size={15} className="text-[#800020] shrink-0" />
                      ) : (
                        <CreditCard size={15} className="text-[#B8860B] shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#1A1510]">
                            {isPaid ? 'Payment: Received & Settled' : 'Payment: Cash on Delivery (Due)'}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-[#25D366]' : 'bg-[#E59819]'}`} />
                        </div>
                        <p className="text-[10px] text-[#736352] font-mono">
                          Method: {ord.paymentMethod} • Ref: {ord.paymentRef || 'TXN-UPI-VERIFIED'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-[#8C6D2B] shrink-0" />
                      <div>
                        <span className="font-medium text-[#1A1510]">
                          {ord.courierPartner || 'BlueDart Insured Air Express'}
                        </span>
                        <p className="text-[10px] text-[#736352] font-mono">
                          AWB: {ord.awbNumber || 'BD-77491024IN'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-14 h-16 object-cover rounded bg-[#FAF8F5] border border-[#E8E0D2]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h4 className="font-serif text-sm font-medium text-[#1A1510]">{item.productName}</h4>
                          <p className="text-[#736352]">Size: {item.size} • Qty: {item.quantity}</p>
                          <p className="font-serif font-semibold text-[#1A1510] mt-0.5">
                            {formatPrice(item.priceINR, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipped Address and Action Buttons */}
                  <div className="border-t border-[#F2ECE1] pt-3 flex flex-col md:flex-row justify-between items-start md:items-center text-[11px] text-[#736352] gap-3">
                    <span>Shipped to: {ord.shippingAddress.street}, {ord.shippingAddress.city}, {ord.shippingAddress.country}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(ord)}
                        className="px-3 py-1.5 bg-[#1C1814] hover:bg-[#332920] text-[#F3EBD4] rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="View Official Payment Receipt & Consignment Certificate"
                      >
                        <FileText size={13} className="text-[#C5A059]" />
                        <span>View Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const res = await generateOrderPdf(ord, currency);
                          sendPaymentReceivedWhatsAppToCustomer(ord, res.publicPdfUrl, currency, res.viewUrl);
                        }}
                        className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20BA5C] text-white rounded text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Send WhatsApp Payment Receipt with direct PDF & Lookbook link"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const res = await generateOrderPdf(ord, currency);
                          sendOrderWhatsAppToAtelier(ord, res.publicPdfUrl, currency, res.viewUrl);
                        }}
                        className="px-2.5 py-1.5 bg-[#FAF4E6] hover:bg-[#F2E8D4] text-[#634E26] border border-[#E8DCC4] rounded text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Send order received alert to Aavira Haute Couture Atelier WhatsApp (+91 93471 59353)"
                      >
                        <MessageCircle size={13} className="text-[#25D366]" />
                        <span>Atelier (+91 93471)</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const res = await generateOrderPdf(ord, currency);
                          triggerFileDownload(res.file, res.filename);
                        }}
                        className="px-2.5 py-1.5 bg-[#FAF4E8] hover:bg-[#F2E8D4] text-[#634E26] border border-[#E8DCC4] rounded text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Download PDF Lookbook & Invoice"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate('returns')}
                        className="px-2.5 py-1.5 bg-[#FAF0E6] hover:bg-[#F2E4D6] text-[#A8543A] border border-[#D9C496] rounded text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Request Return or Exchange under AAVIRA BOUTIQUE 7-Day Policy"
                      >
                        <RotateCcw size={13} />
                        <span>Easy Return</span>
                      </button>

                      {!isDelivered ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="px-3 py-1.5 bg-[#205A32] hover:bg-[#164323] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          title="Confirm that you have safely received this order"
                        >
                          <CheckCircle size={13} />
                          <span>Confirm Received</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF8F1] text-[#205A32] rounded text-[11px] font-semibold border border-[#BCE4C6]">
                          <CheckCircle size={12} />
                          <span>Delivered</span>
                          {ord.customerRating && (
                            <span className="flex items-center ml-1 text-[#B8860B]">
                              <Star size={10} className="fill-[#B8860B]" />
                              <span className="text-[10px] ml-0.5">{ord.customerRating}/5</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-4 animate-fadeIn">
          {wishlistedProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#E8E0D2] space-y-3">
              <Heart size={32} className="mx-auto text-[#A3927B]" />
              <h3 className="font-serif text-lg text-[#1A1510]">Your saved wishlist is empty</h3>
              <p className="text-xs text-[#736352]">Save your favored daily wear, soft silk, and wedding bridal sarees while browsing.</p>
              <button
                onClick={() => onNavigate('shop')}
                className="bg-[#1C1814] text-[#F3EBD4] px-5 py-2 rounded text-xs uppercase tracking-wider font-semibold"
              >
                Browse Creations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E0D2] gap-2">
                <span className="text-xs text-[#6E5E4E]">
                  You have <strong>{wishlistedProducts.length}</strong> heirloom creation{wishlistedProducts.length > 1 ? 's' : ''} saved in your private sanctuary.
                </span>
                {onClearWishlist && (
                  <button
                    type="button"
                    onClick={onClearWishlist}
                    className="text-xs text-[#800020] hover:underline font-medium cursor-pointer"
                    id="clear-all-wishlist-btn"
                  >
                    Clear All Wishlist
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedProducts.map((prod) => (
                <div key={prod.id} className="group bg-white rounded-xl border border-[#E8E0D2] overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="relative aspect-3/4 overflow-hidden bg-[#F6F2EB]">
                    <img
                      src={getCustomProductImage(prod.id, prod.images[0], 0)}
                      alt={`${prod.name} - Front View`}
                      className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                        prod.images[1] ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                      }`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (prod.images[0] && target.src !== prod.images[0]) {
                          target.src = prod.images[0];
                        } else {
                          target.src = '/assets/sarees/daily-wear-1-a.jpg';
                        }
                      }}
                    />
                    {prod.images[1] && (
                      <img
                        src={getCustomProductImage(prod.id, prod.images[1], 1)}
                        alt={`${prod.name} - Second View`}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (prod.images[1] && target.src !== prod.images[1]) {
                            target.src = prod.images[1];
                          }
                        }}
                      />
                    )}
                    <div className="absolute top-3 right-3 flex flex-col items-center gap-1.5 z-10">
                      <button
                        onClick={() => onRemoveFromWishlist(prod.id)}
                        className="p-1.5 bg-white/90 text-[#800020] rounded-full hover:bg-white shadow-xs cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-serif text-base text-[#1A1510]">{prod.name}</h4>
                      <p className="font-serif font-bold text-sm text-[#1A1510] mt-1">{formatPrice(prod.priceINR, currency)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAddToCart(prod, prod.sizes[0] || 'Standard', 1)}
                        className="flex-1 bg-[#1C1814] text-[#F3EBD4] py-2 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-[#736352] border-t border-[#E8E0D2]/60">
            <span>Curated items reserved for 14 days</span>
            <span>Managed by Visakhapatnam Aavira Boutique</span>
          </div>
        </div>
      )}

      {/* Tab 3: Bespoke Measurements */}
      {activeSubTab === 'measurements' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E0D2] shadow-xs space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="font-serif text-xl text-[#1A1510]">Bespoke Tailoring Profile</h3>
            <p className="text-xs text-[#736352]">
              Your saved dimensions are directly utilized by our Visakhapatnam pattern masters when crafting bespoke designer blouses, maggam embroidered necklines, and inskirts.
            </p>
          </div>

          <form onSubmit={handleSaveMeasurements} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Bust Circumference (inches)</label>
                <input
                  type="text"
                  value={measurements.bust}
                  onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Waist Circumference (inches)</label>
                <input
                  type="text"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Hip Circumference (inches)</label>
                <input
                  type="text"
                  value={measurements.hip}
                  onChange={(e) => setMeasurements({ ...measurements, hip: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Blouse Length (inches)</label>
                <input
                  type="text"
                  value={measurements.blouseLength}
                  onChange={(e) => setMeasurements({ ...measurements, blouseLength: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Sleeve Length (inches)</label>
                <input
                  type="text"
                  value={measurements.sleeveLength}
                  onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Shoulder Width (inches)</label>
                <input
                  type="text"
                  value={measurements.shoulder}
                  onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Lehenga / Skirt Length</label>
                <input
                  type="text"
                  value={measurements.lehengaLength}
                  onChange={(e) => setMeasurements({ ...measurements, lehengaLength: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[#4A3E33] mb-1 font-medium">Client Height</label>
                <input
                  type="text"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-[#1C1814] text-[#F3EBD4] px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold hover:bg-[#332920] transition-colors"
              >
                Save Measurements Profile
              </button>
              {isSaved && (
                <span className="text-xs text-[#205A32] font-semibold flex items-center gap-1">
                  <ShieldCheck size={16} /> Saved to Visakhapatnam Atelier Dossier
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Official Payment Receipt & Delivery Confirmation Modal */}
      {selectedReceiptOrder && (
        <OrderPaymentReceiptModal
          isOpen={Boolean(selectedReceiptOrder)}
          onClose={() => setSelectedReceiptOrder(null)}
          order={selectedReceiptOrder}
          currency={currency}
          onConfirmDelivery={onConfirmDelivery}
        />
      )}
    </div>
  );
};
