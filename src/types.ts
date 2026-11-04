export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type ProductCategory =
  | 'daily-wear'
  | 'dharmavaram-silk'
  | 'venkatagiri-silk'
  | 'venkatagiri-vintage'
  | 'bridal-sarees';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'daily-wear': 'Daily wear sarees',
  'dharmavaram-silk': 'Dharmavaram Silk Sarees',
  'venkatagiri-silk': 'VenkataGiri Silk Sarees',
  'venkatagiri-vintage': 'VenkataGiri Vintage Sarees',
  'bridal-sarees': 'Bridal Sarees',
};

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  priceINR: number;
  originalPriceINR?: number;
  fabric: string;
  color: string;
  colorHex: string;
  tag?: 'Bestseller' | 'Heritage Weave' | 'New Season' | 'Bridal Exclusive' | 'Limited Edition' | string;
  inStock: boolean;
  stockCount: number;
  images: string[];
  description: string;
  artisanNote: string;
  pattern?: string;
  specifications: {
    weaveType: string;
    zariType: string;
    origin: string;
    blousePiece: string;
    careInstructions: string;
    pattern?: string;
  };
  sizes: string[];
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    priceINR: number;
    image: string;
  }[];
  totalINR: number;
  status: 'Paid' | 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus?: 'Received' | 'Pending' | 'COD Acknowledged' | 'Reconciled';
  paymentRef?: string;
  paymentReceivedAt?: string;
  awbNumber?: string;
  courierPartner?: string;
  deliveredAt?: string;
  customerConfirmedDelivery?: boolean;
  customerRating?: number;
  customerFeedback?: string;
}

export type PageTab = 'home' | 'shop' | 'about' | 'contact' | 'admin' | 'account' | 'returns';

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  sareeCategory?: string;
  itemPriceINR?: number;
  reason: 'manufacturing_defect' | 'wrong_item' | 'damaged_in_transit' | 'size_exchange' | 'other';
  reasonDetails: string;
  preferredResolution: 'refund' | 'store_credit' | 'exchange';
  exchangePreferences?: string;
  photoEvidence?: string;
  status: 'Pending Approval' | 'Approved' | 'Pickup Scheduled' | 'Inspected' | 'Refund Completed' | 'Rejected';
  createdAt: string;
  notes?: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  preferredDate?: string;
  message: string;
  createdAt: string;
}

export interface WorkSchedule {
  id: string;
  title: string;
  category: 'loom_production' | 'bridal_fitting' | 'artisan_shift' | 'qc_dispatch';
  assignee: string;
  role: string;
  date: string;
  timeSlot: string;
  targetItem?: string;
  clientName?: string;
  priority: 'Urgent' | 'High' | 'Normal';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending Review';
  notes: string;
  location: string;
}
