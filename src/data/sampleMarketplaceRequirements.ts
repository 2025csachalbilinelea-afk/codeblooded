export interface BulkBuyerRequirement {
  id: string;
  companyName: string;
  organizationType: 'Hotel & Hospitality' | 'Catering Service' | 'Restaurant & Kitchen' | 'Food Processing' | 'Institutional Canteen';
  commodity: string;
  quantityQuintals: number;
  qualityRequirement: 'Grade A Premium' | 'Standard FAQ' | 'Processing Grade';
  deliveryLocation: string;
  deliveryDate: string;
  targetPricePerQuintal: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
  publishedAt: string;
  isSample?: boolean;
}

/**
 * Dedicated Sample Dataset: Institutional Procurement Orders for Demonstration
 * Clearly segregated as sample/demo listings so farmers can explore marketplace features.
 */
export const SAMPLE_BUYER_REQUIREMENTS: BulkBuyerRequirement[] = [
  {
    id: 'DEMO-REQ-101',
    isSample: true,
    companyName: 'Grand Chola Banquet Kitchens (Demo)',
    organizationType: 'Hotel & Hospitality',
    commodity: 'Tomato',
    quantityQuintals: 35,
    qualityRequirement: 'Grade A Premium',
    deliveryLocation: 'Yeshwanthpur Wholesale Depot, Bengaluru',
    deliveryDate: '2026-11-05',
    targetPricePerQuintal: 2550,
    contactPerson: 'Institutional Procurement Desk (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Firm red tomatoes preferred in 25-kg plastic crates. Maximum 24-hr field-to-kitchen transit.',
    publishedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'DEMO-REQ-102',
    isSample: true,
    companyName: 'Sahyadri Agri Food Processors (Demo)',
    organizationType: 'Food Processing',
    commodity: 'Onion',
    quantityQuintals: 80,
    qualityRequirement: 'Standard FAQ',
    deliveryLocation: 'APMC Cold Storage Cluster, Pune',
    deliveryDate: '2026-11-07',
    targetPricePerQuintal: 2200,
    contactPerson: 'Raw Material Procurement Division (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Medium to large bulb size (45mm+), well-cured and dry outer skin in mesh sacks.',
    publishedAt: '2026-10-29T14:30:00Z',
  },
  {
    id: 'DEMO-REQ-103',
    isSample: true,
    companyName: 'Apex Institutional Canteen Services (Demo)',
    organizationType: 'Institutional Canteen',
    commodity: 'Potato',
    quantityQuintals: 60,
    qualityRequirement: 'Standard FAQ',
    deliveryLocation: 'Bawana Food Logistics Park, Delhi',
    deliveryDate: '2026-11-06',
    targetPricePerQuintal: 1750,
    contactPerson: 'Central Canteen Supply Chain (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Kufri Jyoti or Pukhraj varieties preferred. Unwashed, soil-free, zero greening.',
    publishedAt: '2026-10-30T08:15:00Z',
  },
  {
    id: 'DEMO-REQ-104',
    isSample: true,
    companyName: 'GreenLeaf Cloud Kitchens Network (Demo)',
    organizationType: 'Restaurant & Kitchen',
    commodity: 'Cabbage',
    quantityQuintals: 25,
    qualityRequirement: 'Grade A Premium',
    deliveryLocation: 'Whitefield Commercial Hub, Bengaluru',
    deliveryDate: '2026-11-04',
    targetPricePerQuintal: 1550,
    contactPerson: 'Kitchen Ingredients Procurement (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Tight, solid heads without outer leaf blemishes. Delivered in ventilated crates.',
    publishedAt: '2026-10-31T09:00:00Z',
  },
  {
    id: 'DEMO-REQ-105',
    isSample: true,
    companyName: 'SpiceRoute Regional Caterers (Demo)',
    organizationType: 'Catering Service',
    commodity: 'Green Chilli',
    quantityQuintals: 15,
    qualityRequirement: 'Grade A Premium',
    deliveryLocation: 'Kalyan Wholesale Terminal, Mumbai MMR',
    deliveryDate: '2026-11-03',
    targetPricePerQuintal: 4400,
    contactPerson: 'Event Catering Materials Team (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Dark green pungent variety (G4 / Bullet). Packed in 10-kg aerated corrugated boxes.',
    publishedAt: '2026-10-30T16:45:00Z',
  },
  {
    id: 'DEMO-REQ-106',
    isSample: true,
    companyName: 'Dakshin Culinary Consortia (Demo)',
    organizationType: 'Restaurant & Kitchen',
    commodity: 'Coriander',
    quantityQuintals: 12,
    qualityRequirement: 'Grade A Premium',
    deliveryLocation: 'Koyambedu Wholesale Market, Chennai',
    deliveryDate: '2026-11-03',
    targetPricePerQuintal: 3850,
    contactPerson: 'Perishables Purchase Desk (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Freshly harvested with roots intact. Morning delivery preferred to preserve aroma.',
    publishedAt: '2026-10-31T07:30:00Z',
  },
  {
    id: 'DEMO-REQ-107',
    isSample: true,
    companyName: 'NutriPulse Protein Millers (Demo)',
    organizationType: 'Food Processing',
    commodity: 'Green Gram',
    quantityQuintals: 50,
    qualityRequirement: 'Processing Grade',
    deliveryLocation: 'APMC Agro Processing Hub, Hubballi',
    deliveryDate: '2026-11-08',
    targetPricePerQuintal: 7400,
    contactPerson: 'Grain & Pulse Procurement Cell (Demo)',
    contactPhone: 'Demo Listing — Non-Commercial Inquiry',
    contactEmail: 'demo-procurement@harvestroute.org',
    notes: 'Moisture content under 12%. Machine-cleaned seed grade with zero foreign seeds.',
    publishedAt: '2026-10-28T11:20:00Z',
  },
];

