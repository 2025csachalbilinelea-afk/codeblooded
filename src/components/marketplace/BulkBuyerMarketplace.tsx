import React, { useState, useEffect } from 'react';
import { CropProfile } from '../../types/agriculture';
import { CROP_PROFILES } from '../../data/crops';
import { formatINR } from '../../utils/currency';
import {
  Building2,
  Store,
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
  X,
  Send,
  Eye,
  Info,
} from 'lucide-react';
import {
  BulkBuyerRequirement,
  SAMPLE_BUYER_REQUIREMENTS,
} from '../../data/sampleMarketplaceRequirements';

const STORAGE_KEY = 'harvestroute_bulk_buyer_requirements_v1';

export type { BulkBuyerRequirement };
export { SAMPLE_BUYER_REQUIREMENTS };

interface BulkBuyerMarketplaceProps {
  currentCrop?: CropProfile;
  onGoToDashboard?: () => void;
}

export const BulkBuyerMarketplace: React.FC<BulkBuyerMarketplaceProps> = ({
  currentCrop,
  onGoToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'farmer' | 'buyer'>('farmer');
  const [requirements, setRequirements] = useState<BulkBuyerRequirement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load bulk requirements:', e);
      }
    }
    return [];
  });

  // Filter state for farmer view
  const [filterCommodity, setFilterCommodity] = useState<string>('all');
  const [selectedRequirementToContact, setSelectedRequirementToContact] = useState<BulkBuyerRequirement | null>(null);
  const [responseOfferSent, setResponseOfferSent] = useState<boolean>(false);

  // New buyer requirement form state (completely preserved)
  const [companyName, setCompanyName] = useState('');
  const [organizationType, setOrganizationType] = useState<BulkBuyerRequirement['organizationType']>('Hotel & Hospitality');
  const [commodity, setCommodity] = useState(currentCrop?.name || 'Tomato');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(50);
  const [qualityRequirement, setQualityRequirement] = useState<BulkBuyerRequirement['qualityRequirement']>('Standard FAQ');
  const [deliveryLocation, setDeliveryLocation] = useState('Yeshwanthpur Distribution Hub, Bengaluru');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [targetPricePerQuintal, setTargetPricePerQuintal] = useState<number>(2400);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Farmer response modal state
  const [farmerOfferPrice, setFarmerOfferPrice] = useState<number>(2400);
  const [farmerOfferQuantity, setFarmerOfferQuantity] = useState<number>(20);
  const [farmerPhone, setFarmerPhone] = useState<string>('');

  const handlePublishRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !contactPhone.trim()) {
      alert('Please fill out all required company and contact information.');
      return;
    }

    const newReq: BulkBuyerRequirement = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      companyName: companyName.trim(),
      organizationType,
      commodity,
      quantityQuintals: Number(quantityQuintals) || 10,
      qualityRequirement,
      deliveryLocation: deliveryLocation.trim(),
      deliveryDate,
      targetPricePerQuintal: Number(targetPricePerQuintal) || 2000,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      notes: notes.trim(),
      publishedAt: new Date().toISOString(),
      isSample: false,
    };

    const updated = [newReq, ...requirements];
    setRequirements(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist requirement:', err);
    }

    setPublishSuccess(`Requirement ${newReq.id} published successfully! Local farmers can now view and respond to your order.`);
    // Reset form fields
    setCompanyName('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setNotes('');

    setTimeout(() => {
      setPublishSuccess(null);
      setActiveTab('farmer');
    }, 2500);
  };

  const handleSendFarmerOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setResponseOfferSent(true);
    setTimeout(() => {
      setResponseOfferSent(false);
      setSelectedRequirementToContact(null);
    }, 2000);
  };

  // Filter both genuine and sample datasets
  const filteredGenuineRequirements = requirements.filter((r) => {
    if (filterCommodity === 'all') return true;
    return r.commodity.toLowerCase() === filterCommodity.toLowerCase();
  });

  const filteredSampleRequirements = SAMPLE_BUYER_REQUIREMENTS.filter((r) => {
    if (filterCommodity === 'all') return true;
    return r.commodity.toLowerCase() === filterCommodity.toLowerCase();
  });

  const totalFilteredCount = filteredGenuineRequirements.length + filteredSampleRequirements.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-rural-deep text-white shadow-rural-card border border-rural-border/40 p-6 sm:p-10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
            alt="Fresh agricultural harvest"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rural-deep via-rural-forest/90 to-rural-forest/80" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-rural-mint/20 border border-rural-mint/40 text-rural-mint px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm">
            <Building2 className="w-3.5 h-3.5 text-rural-fresh" />
            <span>B2B Institutional Sourcing Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            Bulk Buyer Marketplace
          </h1>

          <p className="text-sm sm:text-base text-rural-mint/90 font-light mt-2 leading-relaxed">
            Connecting verified hotels, catering companies, commercial kitchens, and wholesale buyers directly with farm-gate producers.
          </p>

          {/* Differentiated Tab Switcher */}
          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab('farmer')}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'farmer'
                  ? 'bg-rural-fresh text-white shadow-md'
                  : 'text-rural-mint hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Farmer View: Find Buyers for Your Harvest</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buyer')}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'buyer'
                  ? 'bg-rural-fresh text-white shadow-md'
                  : 'text-rural-mint hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buyer View: Post Produce Requirement</span>
            </button>
          </div>
        </div>
      </div>

      {/* FARMER VIEW */}
      {activeTab === 'farmer' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-rural-border p-4 shadow-rural-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-rural-forest uppercase tracking-wider">
                Filter by Crop:
              </span>
              <select
                value={filterCommodity}
                onChange={(e) => setFilterCommodity(e.target.value)}
                className="text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-1.5 font-medium text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
              >
                <option value="all">All Commodities ({totalFilteredCount})</option>
                {CROP_PROFILES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-rural-muted flex items-center space-x-2">
              <span>Available Requirements:</span>
              <span className="font-semibold text-rural-forest">
                {filteredGenuineRequirements.length > 0
                  ? `${filteredGenuineRequirements.length} Active Posts • ${filteredSampleRequirements.length} Sample Listings`
                  : `${filteredSampleRequirements.length} Sample Listings`}
              </span>
            </div>
          </div>

          {/* Genuine Buyer Posts (if any published by user) */}
          {filteredGenuineRequirements.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-1 border-b border-rural-border/70">
                <CheckCircle2 className="w-4 h-4 text-rural-primary" />
                <h2 className="font-serif font-bold text-base text-rural-forest">
                  Active Verified Buyer Posts ({filteredGenuineRequirements.length})
                </h2>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Published Requirements
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGenuineRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border-2 border-rural-fresh/40 p-6 shadow-rural-soft hover:shadow-rural-card transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rural-forest bg-rural-mint px-2.5 py-0.5 rounded-md border border-rural-fresh/30">
                              {req.organizationType}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                              Active Post
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-rural-forest mt-1.5">
                            {req.companyName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-rural-muted uppercase tracking-wider block">Target Price</span>
                          <span className="font-bold text-emerald-800 text-base">
                            {formatINR(req.targetPricePerQuintal)} / Qtl
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-rural-cream border border-rural-border text-xs my-3">
                        <div>
                          <span className="text-rural-muted text-[10px] block">Required Produce</span>
                          <strong className="text-rural-forest font-serif">{req.commodity}</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Consignment Volume</span>
                          <strong className="text-rural-forest">{req.quantityQuintals} Quintals</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Quality Grade</span>
                          <strong className="text-rural-forest">{req.qualityRequirement}</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Target Date</span>
                          <strong className="text-rural-forest">{req.deliveryDate}</strong>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-rural-charcoal">
                        <div className="flex items-center space-x-1.5 text-rural-muted">
                          <MapPin className="w-3.5 h-3.5 text-rural-primary shrink-0" />
                          <span className="truncate">{req.deliveryLocation}</span>
                        </div>
                        {req.notes && (
                          <p className="text-[11px] text-rural-muted italic pt-1 border-t border-rural-border/50">
                            "{req.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rural-border flex items-center justify-between">
                      <span className="text-[10px] text-rural-muted">
                        Order ID: {req.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequirementToContact(req);
                          setFarmerOfferPrice(req.targetPricePerQuintal);
                        }}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Connect with Buyer</span>
                        <ArrowRight className="w-3.5 h-3.5 text-rural-fresh" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample / Hardcoded Institutional Buyer Requirements */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-rural-border/70">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-amber-700" />
                <h2 className="font-serif font-bold text-base text-rural-forest">
                  Sample Institutional Buyer Requirements ({filteredSampleRequirements.length})
                </h2>
                <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Demo Listings
                </span>
              </div>
              <span className="text-[11px] text-rural-muted font-normal">
                Illustrative procurement orders from typical commercial buyers
              </span>
            </div>

            {/* Informative Demo Notice Strip */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Marketplace Demonstration:</strong> The cards below represent typical demand from bulk buyers (hotels, catering services, restaurants, food processors, and canteens). These sample listings showcase pricing and consignment specs. To publish a live requirement, switch to the <strong>Buyer View</strong> tab.
              </p>
            </div>

            {filteredSampleRequirements.length === 0 ? (
              <div className="bg-white rounded-3xl border border-rural-border p-10 text-center shadow-rural-soft space-y-2">
                <p className="text-xs text-rural-muted">
                  No sample listings matching the selected crop filter "{filterCommodity}".
                </p>
                <button
                  type="button"
                  onClick={() => setFilterCommodity('all')}
                  className="text-xs text-rural-primary font-semibold underline cursor-pointer"
                >
                  Show All Commodities
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSampleRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-rural-border p-6 shadow-rural-soft hover:shadow-rural-card transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rural-forest bg-rural-mint px-2.5 py-0.5 rounded-md border border-rural-fresh/30">
                              {req.organizationType}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                              Demo Listing
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-rural-forest mt-1.5">
                            {req.companyName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-rural-muted uppercase tracking-wider block">Target Price</span>
                          <span className="font-bold text-emerald-800 text-base">
                            {formatINR(req.targetPricePerQuintal)} / Qtl
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-rural-cream border border-rural-border text-xs my-3">
                        <div>
                          <span className="text-rural-muted text-[10px] block">Required Crop</span>
                          <strong className="text-rural-forest font-serif">{req.commodity}</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Quantity Required</span>
                          <strong className="text-rural-forest">{req.quantityQuintals} Quintals</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Quality Grade</span>
                          <strong className="text-rural-forest">{req.qualityRequirement}</strong>
                        </div>
                        <div>
                          <span className="text-rural-muted text-[10px] block">Delivery Date</span>
                          <strong className="text-rural-forest">{req.deliveryDate}</strong>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-rural-charcoal">
                        <div className="flex items-center space-x-1.5 text-rural-muted">
                          <MapPin className="w-3.5 h-3.5 text-rural-primary shrink-0" />
                          <span className="truncate">Destination: {req.deliveryLocation}</span>
                        </div>
                        {req.notes && (
                          <p className="text-[11px] text-rural-muted italic pt-1 border-t border-rural-border/50">
                            "{req.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rural-border flex items-center justify-between">
                      <span className="text-[10px] text-rural-muted">
                        Sample Ref: {req.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedRequirementToContact(req)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-rural-fresh" />
                        <span>View Requirement</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BUYER VIEW (COMPLETELY UNCHANGED & FULLY FUNCTIONAL) */}
      {activeTab === 'buyer' && (
        <div className="bg-white rounded-3xl border border-rural-border p-6 sm:p-8 shadow-rural-card max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 pb-5 border-b border-rural-border/70 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-rural-forest">
                Post Your Fresh Produce Requirement
              </h2>
              <p className="text-xs text-rural-muted font-sans mt-0.5">
                Publish your bulk demand directly to local agricultural producers and farm collectives.
              </p>
            </div>
          </div>

          {publishSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-start space-x-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{publishSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePublishRequirement} className="space-y-5 text-xs sm:text-sm font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Radisson Blu Hotel Kitchens"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Business Category *
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value as any)}
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-medium"
                >
                  <option value="Hotel & Hospitality">Hotel & Hospitality</option>
                  <option value="Catering Service">Catering Service</option>
                  <option value="Restaurant & Kitchen">Restaurant & Kitchen</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Institutional Canteen">Institutional Canteen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Required Produce *
                </label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-medium"
                >
                  {CROP_PROFILES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Consignment Quantity (Quintals) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={quantityQuintals || ''}
                  onChange={(e) => setQuantityQuintals(Math.max(1, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 50"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Target Price (₹/Quintal) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={targetPricePerQuintal || ''}
                  onChange={(e) => setTargetPricePerQuintal(Math.max(100, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 2400"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Delivery Destination / Depot *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Yeshwanthpur Wholesale Hub, Bengaluru"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Target Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Procurement Manager *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Suresh Hegde"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Contact Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98450 12345"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="procurement@hotel.com"
                  className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2.5 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rural-charcoal mb-1.5">
                Special Quality or Packaging Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Crates preferred over sacks; produce must be harvested within 24 hours of dispatch."
                className="w-full text-xs sm:text-sm bg-rural-cream border border-rural-border rounded-xl px-3.5 py-2 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-rural-fresh" />
                <span>Publish Requirement to Farm Gate Producers</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requirement Details / Contact Modal */}
      {selectedRequirementToContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="bg-rural-forest text-white p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rural-mint bg-white/10 px-2.5 py-0.5 rounded-full">
                  {selectedRequirementToContact.isSample ? 'Sample Buyer Requirement' : 'Direct Institutional Order'}
                </span>
                <h3 className="font-serif font-bold text-lg text-white mt-1">
                  {selectedRequirementToContact.companyName}
                </h3>
                <p className="text-xs text-rural-mint/80 mt-0.5">
                  Ref: {selectedRequirementToContact.id} • {selectedRequirementToContact.commodity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequirementToContact(null)}
                className="p-1 rounded-xl bg-rural-deep text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* If it's a sample requirement, show educational explanation */}
              {selectedRequirementToContact.isSample ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <Info className="w-4 h-4 text-amber-700" />
                      <span>Demonstration Order Specification</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      This sample requirement illustrates how institutional buyers like hotels, catering companies, and food processors publish direct procurement demands on HarvestRoute.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rural-cream border border-rural-border space-y-2.5">
                    <div className="flex justify-between items-center pb-1.5 border-b border-rural-border/60">
                      <span className="text-rural-muted">Buyer Category:</span>
                      <strong className="text-rural-forest font-semibold">{selectedRequirementToContact.organizationType}</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-rural-border/60">
                      <span className="text-rural-muted">Produce & Grade:</span>
                      <strong className="text-rural-forest font-semibold">
                        {selectedRequirementToContact.commodity} ({selectedRequirementToContact.qualityRequirement})
                      </strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-rural-border/60">
                      <span className="text-rural-muted">Required Consignment:</span>
                      <strong className="text-rural-forest font-semibold">{selectedRequirementToContact.quantityQuintals} Quintals</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-rural-border/60">
                      <span className="text-rural-muted">Offered Target Price:</span>
                      <strong className="text-emerald-800 font-bold text-sm">₹{selectedRequirementToContact.targetPricePerQuintal} / Quintal</strong>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-rural-border/60">
                      <span className="text-rural-muted">Delivery Destination:</span>
                      <strong className="text-rural-forest font-semibold">{selectedRequirementToContact.deliveryLocation}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rural-muted">Required Delivery Date:</span>
                      <strong className="text-rural-forest font-semibold">{selectedRequirementToContact.deliveryDate}</strong>
                    </div>
                  </div>

                  {selectedRequirementToContact.notes && (
                    <div className="p-3 rounded-xl bg-white border border-rural-border text-rural-charcoal">
                      <span className="text-[10px] font-bold uppercase text-rural-muted block mb-0.5">Special Quality Notes:</span>
                      <p className="italic text-xs">"{selectedRequirementToContact.notes}"</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRequirementToContact(null)}
                      className="px-4 py-2.5 rounded-xl bg-rural-cream text-rural-muted hover:text-rural-charcoal font-semibold text-xs cursor-pointer"
                    >
                      Close Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequirementToContact(null);
                        setActiveTab('buyer');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-rural-fresh" />
                      <span>Post Genuine Requirement</span>
                    </button>
                  </div>
                </div>
              ) : responseOfferSent ? (
                /* Genuine requirement response sent */
                <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-base text-emerald-950">Consignment Offer Submitted!</h4>
                  <p className="text-emerald-800 text-xs">
                    The buyer's procurement team has been notified with your offer details and contact number.
                  </p>
                </div>
              ) : (
                /* Genuine requirement contact form */
                <form onSubmit={handleSendFarmerOffer} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-rural-cream border border-rural-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Buyer Contact Person:</span>
                      <strong className="text-rural-forest">{selectedRequirementToContact.contactPerson}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Phone Number:</span>
                      <strong className="text-rural-forest">{selectedRequirementToContact.contactPhone}</strong>
                    </div>
                    {selectedRequirementToContact.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-rural-muted">Email:</span>
                        <strong className="text-rural-forest">{selectedRequirementToContact.contactEmail}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Target Offered Rate:</span>
                      <strong className="text-emerald-800">₹{selectedRequirementToContact.targetPricePerQuintal}/Qtl</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                      Your Contact Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:outline-none focus:ring-2 focus:ring-rural-fresh"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                        Offered Volume (Qtl)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={farmerOfferQuantity}
                        onChange={(e) => setFarmerOfferQuantity(parseFloat(e.target.value) || 1)}
                        className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-rural-charcoal mb-1">
                        Offered Rate (₹/Qtl)
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={farmerOfferPrice}
                        onChange={(e) => setFarmerOfferPrice(parseFloat(e.target.value) || 100)}
                        className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRequirementToContact(null)}
                      className="px-4 py-2 rounded-xl bg-rural-cream text-rural-muted hover:text-rural-charcoal font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-rural-forest hover:bg-rural-deep text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5 text-rural-fresh" />
                      <span>Send Direct Consignment Offer</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
