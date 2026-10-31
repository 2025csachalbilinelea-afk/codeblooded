import React from 'react';
import { CropProfile, FarmerInputs } from '../../../types/agriculture';
import { FarmerLocation, DynamicMandiEvaluation } from '../../../types/marketDiscovery';
import { formatINR } from '../../../utils/currency';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Truck,
  Scale,
  ShieldCheck,
  Building2,
  Store,
  FileText,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface Step1OverviewProps {
  currentCrop: CropProfile;
  farmerLocation: FarmerLocation;
  totalQuintals: number;
  recommendedMarket: DynamicMandiEvaluation | null;
  onStartHarvest: () => void;
  onGoToMandiDiscovery: () => void;
  onGoToMarketplace: () => void;
  onGoToReports: () => void;
  onGoToStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

export const Step1Overview: React.FC<Step1OverviewProps> = ({
  currentCrop,
  farmerLocation,
  totalQuintals,
  recommendedMarket,
  onStartHarvest,
  onGoToMandiDiscovery,
  onGoToMarketplace,
  onGoToReports,
  onGoToStep,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Hero Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden bg-rural-deep text-white shadow-rural-card border border-rural-border/30">
        {/* Background Agricultural Photograph with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=80"
            alt="Indian agricultural farmland"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rural-deep via-rural-forest/95 to-rural-forest/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-rural-mint/20 border border-rural-mint/40 text-rural-mint px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-rural-fresh" />
            <span>Smart Agricultural Decision Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Good morning! Let's find the best market for your harvest.
          </h1>

          <p className="text-base sm:text-lg text-rural-mint/90 font-light mt-3 leading-relaxed">
            Compare real mandi prices, transport expenses and expected earnings before deciding where to sell.
          </p>

          {/* Consignment Snapshot */}
          <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-rural-mint/80">Active Crop:</span>
              <span className="font-bold text-white bg-rural-forest/80 px-2.5 py-1 rounded-lg border border-rural-fresh/30">
                {currentCrop.name} ({totalQuintals.toFixed(1)} Qtl)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-rural-fresh shrink-0" />
              <span className="text-white font-medium truncate max-w-xs">
                {farmerLocation.villageOrTown || farmerLocation.district}, {farmerLocation.state}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartHarvest}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-rural-fresh hover:bg-rural-fresh/90 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start New Harvest</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onGoToMandiDiscovery}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20 backdrop-blur-sm cursor-pointer"
            >
              <Store className="w-4 h-4 text-rural-mint" />
              <span>Discover Live Mandis</span>
            </button>

            <button
              type="button"
              onClick={onGoToMarketplace}
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/15 text-rural-mint font-medium text-xs transition-all border border-white/10 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Bulk Buyer Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-rural-border shadow-rural-soft hover:shadow-rural-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rural-sage text-rural-forest flex items-center justify-center mb-4">
            <Truck className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Real Road Mileage & Transit Spoilage
          </h3>
          <p className="text-xs sm:text-sm text-rural-muted mt-2 leading-relaxed font-sans">
            Calculated via real OSRM road routes from your farm gate. Deterioration and transit losses adapt to road conditions, vehicle protection, and crop perishability.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rural-border shadow-rural-soft hover:shadow-rural-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center mb-4">
            <Store className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Authentic Daily Wholesale Rates
          </h3>
          <p className="text-xs sm:text-sm text-rural-muted mt-2 leading-relaxed font-sans">
            Directly querying daily APMC arrivals from official AGMARKNET feeds and verified multi-source agricultural market reports. Zero fabricated prices.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-rural-border shadow-rural-soft hover:shadow-rural-card transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-rural-forest">
            Maximum Take-Home Profit
          </h3>
          <p className="text-xs sm:text-sm text-rural-muted mt-2 leading-relaxed font-sans">
            Highest price is not always the best deal. We rank markets by money kept in your pocket: Net Revenue = Gross Sales − Transport − Mandi Fees.
          </p>
        </div>
      </div>

      {/* 3. Quick Guided Workflow Navigation Hub */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-rural-border/70 gap-2 mb-6">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-rural-forest">
              Guided Harvest Route Workflow
            </h2>
            <p className="text-xs sm:text-sm text-rural-muted font-sans mt-0.5">
              Follow our structured 6-step roadmap or jump directly to any stage.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rural-sage text-rural-forest border border-rural-border self-start sm:self-auto">
            Interactive Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="p-5 rounded-2xl bg-rural-cream/60 hover:bg-rural-sage/70 border border-rural-border text-left transition-all hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-mint px-2 py-0.5 rounded-md">
                Step 2
              </span>
              <ArrowRight className="w-4 h-4 text-rural-muted group-hover:text-rural-forest group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-rural-forest">Crop & Harvest Details</h4>
            <p className="text-xs text-rural-muted mt-1 font-sans">
              Produce type, consignment quantity, harvest date, and dispatch freshness.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="p-5 rounded-2xl bg-rural-cream/60 hover:bg-rural-sage/70 border border-rural-border text-left transition-all hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-mint px-2 py-0.5 rounded-md">
                Step 3
              </span>
              <ArrowRight className="w-4 h-4 text-rural-muted group-hover:text-rural-forest group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-rural-forest">Farm Location & Discovery Map</h4>
            <p className="text-xs text-rural-muted mt-1 font-sans">
              GPS farm-gate detection, agricultural district presets, and map radius.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="p-5 rounded-2xl bg-rural-cream/60 hover:bg-rural-sage/70 border border-rural-border text-left transition-all hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-mint px-2 py-0.5 rounded-md">
                Step 4
              </span>
              <ArrowRight className="w-4 h-4 text-rural-muted group-hover:text-rural-forest group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-rural-forest">Harvest Loss & Logistics</h4>
            <p className="text-xs text-rural-muted mt-1 font-sans">
              Own vs rented vehicle costing, capacity trips, weather, and spoilage.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(5)}
            className="p-5 rounded-2xl bg-rural-cream/60 hover:bg-rural-sage/70 border border-rural-border text-left transition-all hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-primary bg-rural-mint px-2 py-0.5 rounded-md">
                Step 5
              </span>
              <ArrowRight className="w-4 h-4 text-rural-muted group-hover:text-rural-forest group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-rural-forest">Live Mandi Intelligence</h4>
            <p className="text-xs text-rural-muted mt-1 font-sans">
              Official AGMARKNET prices, road travel hours, distance filters, and cards.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(6)}
            className="p-5 rounded-2xl bg-rural-forest text-white border border-rural-deep text-left transition-all hover:scale-[1.01] cursor-pointer group shadow-rural-soft"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-mint bg-white/10 px-2 py-0.5 rounded-md">
                Step 6
              </span>
              <ArrowRight className="w-4 h-4 text-rural-mint group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-white">Profit Decision & Split Plan</h4>
            <p className="text-xs text-rural-mint/80 mt-1 font-sans">
              Recommended market hero, signature comparison, split-harvest optimization, and waterfall.
            </p>
          </button>

          <button
            type="button"
            onClick={onGoToReports}
            className="p-5 rounded-2xl bg-rural-cream/60 hover:bg-rural-sage/70 border border-rural-border text-left transition-all hover:scale-[1.01] cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rural-charcoal bg-rural-beige px-2 py-0.5 rounded-md">
                Reports
              </span>
              <FileText className="w-4 h-4 text-rural-muted group-hover:text-rural-forest transition-all" />
            </div>
            <h4 className="font-serif font-bold text-base text-rural-forest">Printable Reports & Export</h4>
            <p className="text-xs text-rural-muted mt-1 font-sans">
              Print official consignment market assessment reports for banks and traders.
            </p>
          </button>
        </div>
      </div>

      {/* 4. Educational Editorial Section: How HarvestRoute Works */}
      <div className="bg-rural-sage/40 rounded-3xl border border-rural-border p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3 h-52 rounded-2xl overflow-hidden shrink-0 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80"
            alt="Indian farmer in agricultural field"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-2/3 space-y-2.5">
          <span className="text-[11px] uppercase font-bold tracking-wider text-rural-forest bg-rural-mint px-2.5 py-0.5 rounded-full border border-rural-fresh/30">
            Farmer First Philosophy
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-rural-forest">
            Built for Real Rural Economics, Not Speculation
          </h3>
          <p className="text-xs sm:text-sm text-rural-muted leading-relaxed font-sans">
            Agricultural pricing in India varies greatly from district to district. A mandi 120 km away might advertise ₹300 more per quintal, but 2 extra hours under the sun causes delicate produce to soften, while two return diesel trips consume all potential profit. HarvestRoute brings transparent geospatial mathematics to help farmers keep the highest possible income.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-rural-forest">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-rural-primary" />
              <span>Government AGMARKNET Integration</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-rural-primary" />
              <span>Real Road Mileage via OSRM</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-rural-primary" />
              <span>Zero Fabricated Prices</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

