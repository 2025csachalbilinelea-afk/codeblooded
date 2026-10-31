import React, { useState } from 'react';
import {
  DynamicMandiEvaluation,
  FarmerLocation,
  MandiFilterOptions,
  MandiSortOption,
  PriceFreshnessStatus,
  PriceSourceType,
  PriceCategory,
  InternalPriceStatus,
  DiscoveryLevel,
  ApiErrorCategory,
} from '../../types/marketDiscovery';
import { MarketLocationMap } from '../markets/MarketLocationMap';
import { formatINR } from '../../utils/currency';
import { auditAndEnforceConsistency } from '../../services/priceValidationService';
import {
  Award,
  TrendingUp,
  MapPin,
  Clock,
  Truck,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  ChevronRight,
  Sparkles,
  Globe,
  ExternalLink,
  Info,
  X,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DynamicMarketSectionProps {
  farmerLocation: FarmerLocation;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  closestFeasibleMarket: DynamicMandiEvaluation | null;
  totalCandidatesFound: number;
  sortOption: MandiSortOption;
  filters: MandiFilterOptions;
  onSortChange: (sort: MandiSortOption) => void;
  onFilterChange: (filters: Partial<MandiFilterOptions>) => void;
  onSelectBreakdown: (mandi: DynamicMandiEvaluation) => void;
  apiStatus?: { isAvailable: boolean; lastError?: string; lastSyncTime?: string };
  cropName?: string;
  discoveryLevel?: DiscoveryLevel;
  apiErrorCategory?: ApiErrorCategory;
}

/**
 * PHASE 6, 7 & 8: HUMAN-READABLE PRICE SOURCE BADGES & PROVENANCE
 * - Category A / Live: "Verified quotation" (Live / fresh direct APMC quote <= 2 days)
 * - Category B / Historical: "Historical quotation" (Historical APMC quote > 2 days and <= 30 days)
 * - Web-Discovered: "Web-discovered" / "Official e-NAM" (Multi-source agricultural discovery with provenance)
 * - Category C: "Reference price" (Regional/State APMC reference price for planning)
 * - Missing/Zero: "Price Unavailable"
 */
function renderPriceSourceBadge(
  sourceType: PriceSourceType,
  hasVerifiedPrice?: boolean,
  modalPrice?: number,
  fallbackTier?: 1 | 2 | 3 | 4 | 5,
  attributedMarketName?: string,
  priceCategory?: PriceCategory,
  internalPriceStatus?: InternalPriceStatus,
  sourceUrl?: string,
  sourceName?: string,
  onOpenProvenance?: () => void
) {
  let resolvedType = sourceType;

  // Invariant 1: If numerical price is present, resolve away from UNAVAILABLE
  if (hasVerifiedPrice && modalPrice && modalPrice > 0 && resolvedType === 'UNAVAILABLE') {
    resolvedType = 'HISTORICAL';
  }

  // Invariant 2: If price is missing or 0, status must strictly be UNAVAILABLE
  if ((!hasVerifiedPrice || !modalPrice || modalPrice <= 0) && resolvedType !== 'UNAVAILABLE') {
    resolvedType = 'UNAVAILABLE';
  }

  // Web-Discovered Price (Tier 2 e-NAM, Tier 3 Portals, Tier 4 Web Search)
  if (internalPriceStatus === 'WEB-DISCOVERED PRICE' || resolvedType === 'WEB_DISCOVERED') {
    const isEnam = Boolean(sourceName?.toLowerCase().includes('enam'));
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvenance?.();
        }}
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 transition-colors cursor-pointer"
        title="Click to view external quotation provenance and source URL"
      >
        <Globe className="w-3 h-3 text-sky-600" />
        <span>{isEnam ? 'Official e-NAM' : 'Web-discovered'}</span>
        <Info className="w-2.5 h-2.5 text-sky-500 ml-0.5 opacity-70" />
      </button>
    );
  }

  // Category A: Verified quotation (Live or fresh <= 2 days)
  if (priceCategory === 'CATEGORY_A' || resolvedType === 'LIVE' || internalPriceStatus === 'LIVE OFFICIAL QUOTE') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvenance?.();
        }}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
        title="Click to view AGMARKNET quotation provenance"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse" />
        <span>Verified quotation</span>
        <Info className="w-2.5 h-2.5 text-emerald-600 ml-1 opacity-70" />
      </button>
    );
  }

  // Category B: Historical quotation (direct quote > 2 days <= 30 days)
  if (priceCategory === 'CATEGORY_B' || resolvedType === 'HISTORICAL' || internalPriceStatus === 'HISTORICAL OFFICIAL QUOTE') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvenance?.();
        }}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200 transition-colors cursor-pointer"
        title="Click to view AGMARKNET historical quotation provenance"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-1" />
        <span>Historical quotation</span>
        <Info className="w-2.5 h-2.5 text-indigo-600 ml-1 opacity-70" />
      </button>
    );
  }

  // Category C: Reference price (Regional reference or State Benchmark)
  if (
    priceCategory === 'CATEGORY_C' ||
    resolvedType === 'NEARBY_REFERENCE' ||
    resolvedType === 'REGIONAL_BENCHMARK' ||
    internalPriceStatus === 'REGIONAL REFERENCE PRICE'
  ) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvenance?.();
        }}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
        title={
          attributedMarketName
            ? `Regional reference price from ${attributedMarketName}`
            : 'State/Regional APMC Reference Price'
        }
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1" />
        <span>Reference price</span>
        <Info className="w-2.5 h-2.5 text-amber-600 ml-1 opacity-70" />
      </button>
    );
  }

  if (resolvedType === 'CACHED') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenProvenance?.();
        }}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200 transition-colors cursor-pointer"
        title="Click to view quotation provenance"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-1" />
        <span>Historical quotation</span>
        <Info className="w-2.5 h-2.5 text-indigo-600 ml-1 opacity-70" />
      </button>
    );
  }

  // Unavailable / unquoted
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
      Price Unavailable
    </span>
  );
}

export const DynamicMarketSection: React.FC<DynamicMarketSectionProps> = ({
  farmerLocation,
  evaluations,
  recommendedMarket,
  closestFeasibleMarket,
  totalCandidatesFound,
  sortOption,
  filters,
  onSortChange,
  onFilterChange,
  onSelectBreakdown,
  apiStatus,
  cropName,
  discoveryLevel,
  apiErrorCategory,
}) => {
  const { language, t } = useLanguage();
  const [viewTab, setViewTab] = useState<'cards' | 'table' | 'map'>('cards');
  const [selectedProvenanceMandi, setSelectedProvenanceMandi] = useState<DynamicMandiEvaluation | null>(null);

  // Pre-render consistency audit and automatic invariant healing
  auditAndEnforceConsistency(evaluations);

  // Available unique states in current evaluated list
  const availableStates = Array.from(new Set(evaluations.map((e) => e.market.state))).sort();

  const isApiDown = Boolean(apiStatus && apiStatus.isAvailable === false);
  const quotedEvaluations = evaluations.filter((e) => e.hasVerifiedPrice);
  const hasNoQuotedMandis = quotedEvaluations.length === 0;

  return (
    <div className="space-y-6">
      {/* Header with Title, Mode Switcher, and View Switcher */}
      <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-rural-border/70 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                Phase 5 Dynamic Discovery
              </span>
              <span className="text-xs text-rural-muted">•</span>
              {discoveryLevel === 'NEARBY' ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Level 1: Nearby APMCs
                </span>
              ) : discoveryLevel === 'REGIONAL' ? (
                <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-300">
                  Level 2: Regional Discovery
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Level 3: National Terminal Discovery
                </span>
              )}
              <span className="text-xs text-rural-muted">•</span>
              <span className="text-xs text-rural-forest font-semibold">
                {totalCandidatesFound} Agricultural Mandis Discovered
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest mt-1">
              National APMC Mandi Discovery & Live Market Prices
            </h2>
            <p className="text-xs sm:text-sm text-rural-muted mt-0.5">
              Real road distances via OSRM and official daily wholesale rates from AGMARKNET / Data.gov.in.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-3 self-start lg:self-center">
            <div className="flex items-center bg-rural-cream p-1 rounded-2xl border border-rural-border text-xs">
              <button
                type="button"
                onClick={() => setViewTab('cards')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'cards' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Card View"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewTab('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'table' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Table View"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewTab('map')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewTab === 'map' ? 'bg-white shadow-sm text-rural-forest' : 'text-rural-muted'
                }`}
                title="Geographic Radar Map"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <ArrowUpDown className="w-3 h-3 text-rural-primary" />
              <span>
                {language === 'kn' ? 'ಮಂಡಿಗಳನ್ನು ವಿಂಗಡಿಸಿ' : language === 'hi' ? 'मंडियों को क्रमबद्ध करें' : 'Sort Mandis By'}
              </span>
            </label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as MandiSortOption)}
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="netRevenue">{t('step2.sortNetRevenue')}</option>
              <option value="cropPrice">{t('step2.sortGrossPrice')}</option>
              <option value="roadDistance">{t('step2.sortDistance')}</option>
              <option value="transportCost">
                {language === 'kn' ? 'ಕನಿಷ್ಠ ಸಾರಿಗೆ ವೆಚ್ಚ' : language === 'hi' ? 'न्यूनतम परिवहन खर्च' : 'Lowest Transport Expense (₹)'}
              </option>
            </select>
          </div>

          {/* Filter State */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-rural-primary" />
              <span>
                {language === 'kn' ? 'ರಾಜ್ಯ ಫಿಲ್ಟರ್' : language === 'hi' ? 'राज्य फ़िल्टर' : 'State Filter'}
              </span>
            </label>
            <select
              value={filters.state || 'ALL'}
              onChange={(e) => onFilterChange({ state: e.target.value })}
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="ALL">{t('step2.allStates')}</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Truck className="w-3 h-3 text-rural-primary" />
              <span>{t('step2.searchRadiusLabel')}</span>
            </label>
            <select
              value={filters.maxDistanceKm || 0}
              onChange={(e) =>
                onFilterChange({ maxDistanceKm: Number(e.target.value) || undefined })
              }
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value={0}>
                {language === 'kn' ? 'ಯಾವುದೇ ದೂರ' : language === 'hi' ? 'कोई भी दूरी' : 'Any Distance'}
              </option>
              <option value={100}>
                {language === 'kn' ? '೧೦೦ ಕಿಮೀ ಒಳಗಡೆ (ಸ್ಥಳೀಯ)' : language === 'hi' ? '१०० किमी के भीतर (स्थानीय)' : 'Within 100 km (Local)'}
              </option>
              <option value={250}>
                {language === 'kn' ? '೨೫೦ ಕಿಮೀ ಒಳಗಡೆ (ಪ್ರಾದೇಶಿಕ)' : language === 'hi' ? '२५० किमी के भीतर (क्षेत्रीय)' : 'Within 250 km (Regional)'}
              </option>
              <option value={500}>
                {language === 'kn' ? '೫೦೦ ಕಿಮೀ ಒಳಗಡೆ (ಅಂತರ-ಜಿಲ್ಲೆ)' : language === 'hi' ? '५०० किमी के भीतर (अंतर-जिला)' : 'Within 500 km (Inter-District)'}
              </option>
              <option value={1000}>
                {language === 'kn' ? '೧,೦೦೦ ಕಿಮೀ ಒಳಗಡೆ (ಅಂತರ-ರಾಜ್ಯ)' : language === 'hi' ? '१,००० किमी के भीतर (अंतर-राज्य)' : 'Within 1,000 km (Inter-State)'}
              </option>
            </select>
          </div>

          {/* Price Freshness */}
          <div>
            <label className="block text-[11px] font-semibold text-rural-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-rural-primary" />
              <span>Price Freshness</span>
            </label>
            <select
              value={filters.minFreshness || 'ALL'}
              onChange={(e) =>
                onFilterChange({ minFreshness: e.target.value as PriceFreshnessStatus | 'ALL' })
              }
              className="w-full text-xs bg-rural-cream border border-rural-border rounded-xl px-3 py-2 text-rural-charcoal focus:ring-2 focus:ring-rural-fresh font-medium"
            >
              <option value="ALL">All Available Quotes</option>
              <option value="CURRENT">Current Only (≤ 2 days)</option>
              <option value="RECENT">Recent or Better (≤ 7 days)</option>
            </select>
          </div>
        </div>
      </div>

      {hasNoQuotedMandis ? (
        isApiDown ||
        apiErrorCategory === 'AUTH_FAILURE' ||
        apiErrorCategory === 'RATE_LIMITED' ||
        apiErrorCategory === 'TAVILY_AUTH_FAILURE' ||
        apiErrorCategory === 'TAVILY_RATE_LIMITED' ||
        apiErrorCategory === 'TAVILY_API_ERROR' ||
        apiErrorCategory === 'NETWORK_UNREACHABLE' ||
        apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED' ||
        apiErrorCategory === 'TIMEOUT' ? (
          /* Technical API error with specific category diagnostic */
          <div className="bg-amber-50/90 border border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm text-amber-950 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300 mb-1">
                  <span>API Diagnostic: {apiErrorCategory || 'COMMUNICATION_ERROR'}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-amber-950">
                  {apiErrorCategory === 'TAVILY_AUTH_FAILURE'
                    ? 'Tavily Search API Authentication Failure'
                    : apiErrorCategory === 'TAVILY_RATE_LIMITED'
                    ? 'Tavily Search API Rate Limit Exceeded'
                    : apiErrorCategory === 'TAVILY_API_ERROR'
                    ? 'Tavily Search API Error'
                    : apiErrorCategory === 'AUTH_FAILURE'
                    ? 'AGMARKNET API Authentication Failure'
                    : apiErrorCategory === 'RATE_LIMITED'
                    ? 'AGMARKNET API Rate Limit Exceeded'
                    : apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED'
                    ? 'Backend Search Service Not Configured'
                    : 'Government Market Price API Temporarily Unavailable'}
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed max-w-3xl">
                  {apiErrorCategory === 'TAVILY_AUTH_FAILURE'
                    ? 'Tavily rejected the configured TAVILY_API_KEY. Verify that the backend .env contains a valid key and restart the API server.'
                    : apiErrorCategory === 'TAVILY_RATE_LIMITED'
                    ? 'Tavily rejected the search because the API rate limit was reached. Wait before retrying.'
                    : apiErrorCategory === 'TAVILY_API_ERROR'
                    ? 'Tavily returned an unsuccessful response. Check the backend API diagnostic and try again.'
                    : apiErrorCategory === 'AUTH_FAILURE'
                    ? 'The configured API key for the Data.gov.in AGMARKNET feed is invalid, expired, or missing permissions. Please verify your API key in settings.'
                    : apiErrorCategory === 'RATE_LIMITED'
                    ? 'Hourly query quota for Data.gov.in agricultural API was reached. Please wait a few moments before re-querying.'
                    : apiErrorCategory === 'SEARCH_API_NOT_CONFIGURED'
                    ? 'Official AGMARKNET reported 0 quotations for this crop, and the backend search service (TAVILY_API_KEY) is not configured in your environment.'
                    : 'The external Government of India AGMARKNET / Data.gov.in service is currently unreachable or experiencing connection timeouts. This is an external API communication interruption and does not indicate that your local mandis have no prices.'}
                </p>
                {apiStatus?.lastError && (
                  <div className="text-[11px] font-mono bg-amber-100/70 p-2.5 rounded-xl text-amber-900 border border-amber-200 mt-2">
                    Diagnostic: {apiStatus.lastError}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Legitimate empty state after 3-level search across 30-day lookback */
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm text-slate-800 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300 mb-1">
                  <span>3-Level National Search Completed (30-Day Lookback)</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-rural-forest">
                  No Verified Market Quotations Found for {cropName || 'Selected Crop'}
                </h3>
                <p className="text-xs sm:text-sm text-rural-muted leading-relaxed max-w-3xl">
                  A comprehensive search across Level 1 (Nearby District APMCs), Level 2 (Regional Neighbouring States), and Level 3 (National Terminal Wholesale Hubs) was conducted. No official AGMARKNET wholesale arrival records were reported for <strong>{cropName || 'this crop'}</strong> across Indian APMC mandis within the 30-day lookback window.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-rural-forest uppercase tracking-wider block">
                Farmer Guidance & Recommended Actions:
              </span>
              <ul className="text-xs space-y-1.5 text-rural-charcoal list-disc list-inside">
                <li>
                  Daily wholesale arrivals for this commodity may be off-season or not actively auctioned at APMC yards today.
                </li>
                <li>
                  Check back during peak mandi auction hours (10:00 AM – 3:00 PM IST) when market secretaries upload daily modal arrivals.
                </li>
                <li>
                  Try selecting a related agricultural commodity or staple crop from the crop selector.
                </li>
              </ul>
            </div>
          </div>
        )
      ) : (
        <>
          {/* 🏆 HERO CARD: Recommended Mandi */}
          {recommendedMarket ? (
        <div className="bg-gradient-to-br from-rural-forest to-rural-deep text-white rounded-3xl p-6 sm:p-7 shadow-rural-soft border-2 border-rural-fresh/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-rural-fresh/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 bg-rural-mint text-rural-forest px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <Award className="w-4 h-4 text-rural-primary" />
                  <span>🏆 Recommended Agricultural Market</span>
                </div>
                {renderPriceSourceBadge(
                  recommendedMarket.priceSourceType,
                  recommendedMarket.hasVerifiedPrice,
                  recommendedMarket.priceRecord?.modalPrice,
                  recommendedMarket.fallbackTier,
                  recommendedMarket.attributedMarketName,
                  recommendedMarket.priceCategory,
                  recommendedMarket.internalPriceStatus,
                  recommendedMarket.sourceUrl,
                  recommendedMarket.priceRecord?.source,
                  () => setSelectedProvenanceMandi(recommendedMarket)
                )}
              </div>

              {recommendedMarket.additionalEarnings > 0 && (
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-amber-400/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    +₹{recommendedMarket.additionalEarnings.toLocaleString('en-IN')} Extra Profit vs Closest Mandi
                  </span>
                </div>
              )}
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                    {recommendedMarket.market.marketName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-rural-mint/90 font-medium">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rural-fresh" />
                    <span>
                      {recommendedMarket.market.district}, {recommendedMarket.market.state}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-rural-fresh" />
                    <span>
                      {recommendedMarket.route.roadDistanceKm} km road drive ({recommendedMarket.route.estimatedTravelTimeHours} hrs)
                    </span>
                  </span>
                  <span>•</span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded">
                    Routing: {recommendedMarket.route.routeSource}
                  </span>
                </div>

                {/* Key Rationale */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rural-mint block">
                    Why This Market Is Recommended:
                  </span>
                  <ul className="text-xs space-y-1.5 text-white/95">
                    {recommendedMarket.recommendationReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rural-fresh shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Financial Box */}
              <div className="lg:col-span-5 bg-white text-rural-charcoal rounded-2xl p-5 shadow-lg border border-rural-border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-rural-muted uppercase tracking-wider">
                      Estimated Net Take-Home
                    </span>
                    <div className="text-3xl font-serif font-bold text-rural-forest mt-0.5">
                      {formatINR(recommendedMarket.netSellingRevenue)}
                    </div>
                    <span className="text-xs font-semibold text-rural-primary">
                      ₹{recommendedMarket.netRevenuePerQuintal} per harvested Quintal
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                      Reported Modal Price
                    </span>
                    <span className="text-base font-bold text-emerald-700">
                      ₹{recommendedMarket.priceRecord?.modalPrice || 0}/Qtl
                    </span>
                    {recommendedMarket.forecast?.available && (
                      <div className="mt-1 inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                        <span>7d: ₹{recommendedMarket.forecast.forecasts.d7.predictedPrice}/Qtl</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Micro Waterfall Summary */}
                <div className="space-y-1.5 pt-3 border-t border-rural-border/70 text-xs">
                  <div className="flex justify-between text-rural-charcoal font-medium">
                    <span>Gross Produce Sales:</span>
                    <span className="font-bold">{formatINR(recommendedMarket.grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Road Transport Expense:</span>
                    <span>- {formatINR(recommendedMarket.transportCost)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Mandi Commission & Hamali:</span>
                    <span>- {formatINR(recommendedMarket.marketFees)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBreakdown(recommendedMarket)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rural-forest text-white hover:bg-rural-deep transition-all font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <span>View Complete Cost Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-rural-mint/80 flex flex-wrap items-center justify-between gap-2">
              <span>
                Source: {recommendedMarket.priceRecord?.source || 'Verified APMC Yard Bulletin'}
              </span>
              <span className="italic">
                * Indicative wholesale price from daily arrivals; not a guaranteed buyer contract.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center text-amber-900">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm">No Feasible Mandis Found Within Filter Criteria</h3>
          <p className="text-xs text-amber-800 mt-1">
            Try expanding your maximum distance filter or adjusting your consignment quantity.
          </p>
        </div>
      )}

      {/* Main Content Area based on View Tab */}
      {viewTab === 'map' ? (
        <MarketLocationMap
          farmerLocation={farmerLocation}
          evaluations={evaluations}
          recommendedMarket={recommendedMarket}
          onSelectMarket={(m) => onSelectBreakdown(m)}
        />
      ) : viewTab === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rural-sage/60 text-rural-forest uppercase font-bold text-[10px] tracking-wider border-b border-rural-border">
                <tr>
                  <th className="py-3 px-4">Rank & Mandi</th>
                  <th className="py-3 px-3">State & District</th>
                  <th className="py-3 px-3">Road Dist.</th>
                  <th className="py-3 px-3">Modal Price</th>
                  <th className="py-3 px-3">Gross Sales</th>
                  <th className="py-3 px-3">Transport</th>
                  <th className="py-3 px-3">Market Fees</th>
                  <th className="py-3 px-4">Est. Net Take-Home</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rural-border/70 font-medium">
                {evaluations.map((mandi) => {
                  const isRec = recommendedMarket?.market.marketId === mandi.market.marketId;
                  const isDistanceAvailable = mandi.isDistanceVerified && mandi.route.routingStatus !== 'UNAVAILABLE' && mandi.route.roadDistanceKm > 0;

                  return (
                    <tr
                      key={mandi.market.marketId}
                      className={`hover:bg-rural-cream/60 transition-colors ${
                        isRec ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-rural-cream border border-rural-border flex items-center justify-center text-[10px] font-bold text-rural-forest">
                            #{mandi.rank}
                          </span>
                          <div>
                            <div className="font-bold text-rural-charcoal">{mandi.market.marketName}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {renderPriceSourceBadge(
                                mandi.priceSourceType,
                                mandi.hasVerifiedPrice,
                                mandi.priceRecord?.modalPrice,
                                mandi.fallbackTier,
                                mandi.attributedMarketName,
                                mandi.priceCategory,
                                mandi.internalPriceStatus,
                                mandi.sourceUrl,
                                mandi.priceRecord?.source,
                                () => setSelectedProvenanceMandi(mandi)
                              )}
                              {isRec && (
                                <span className="text-[10px] text-amber-700 font-bold">
                                  🏆 Top Choice
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-rural-muted">
                        {mandi.market.district}, {mandi.market.state}
                      </td>
                      <td className="py-3 px-3">
                        {isDistanceAvailable ? (
                          <>
                            <div className="font-bold text-rural-charcoal">{mandi.route.roadDistanceKm} km</div>
                            <div className="text-[10px] text-rural-muted">~{mandi.route.estimatedTravelTimeHours} hrs</div>
                          </>
                        ) : (
                          <div className="text-[11px] text-rural-muted italic">Distance unavailable</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {mandi.hasVerifiedPrice && mandi.priceRecord && mandi.priceRecord.modalPrice > 0 ? (
                          <div className="font-bold text-emerald-700">₹{mandi.priceRecord.modalPrice.toLocaleString('en-IN')}/Qtl</div>
                        ) : (
                          <div className="text-[11px] font-semibold text-rose-700">Price Unavailable</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {mandi.hasVerifiedPrice ? formatINR(mandi.grossRevenue) : <span className="text-rural-muted italic">Unquoted</span>}
                      </td>
                      <td className="py-3 px-3 text-rose-700">
                        {isDistanceAvailable ? `- ${formatINR(mandi.transportCost)}` : <span className="text-rural-muted italic">Uncalculated</span>}
                      </td>
                      <td className="py-3 px-3 text-rose-700">
                        {mandi.hasVerifiedPrice ? `- ${formatINR(mandi.marketFees)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {mandi.hasVerifiedPrice ? (
                          <>
                            <div className="font-serif font-bold text-rural-forest text-sm">
                              {formatINR(mandi.netSellingRevenue)}
                            </div>
                            <div className="text-[10px] text-rural-muted">
                              ₹{mandi.netRevenuePerQuintal}/Qtl
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-rural-muted italic font-medium">Unquoted</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onSelectBreakdown(mandi)}
                          className="px-2.5 py-1 rounded-lg bg-rural-sage text-rural-forest hover:bg-rural-mint text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluations.map((mandi) => {
            const isRec = recommendedMarket?.market.marketId === mandi.market.marketId;
            const isDistanceAvailable = mandi.isDistanceVerified && mandi.route.routingStatus !== 'UNAVAILABLE' && mandi.route.roadDistanceKm > 0;

            return (
              <div
                key={mandi.market.marketId}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all bg-white ${
                  isRec
                    ? 'border-amber-400 ring-2 ring-amber-200/60 shadow-md'
                    : 'border-rural-border shadow-rural-soft hover:border-rural-primary/40'
                }`}
              >
                <div>
                  {/* Card Top Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-bold text-rural-muted bg-rural-cream px-2 py-0.5 rounded-full border border-rural-border">
                        Rank #{mandi.rank}
                      </span>
                      {renderPriceSourceBadge(
                        mandi.priceSourceType,
                        mandi.hasVerifiedPrice,
                        mandi.priceRecord?.modalPrice,
                        mandi.fallbackTier,
                        mandi.attributedMarketName,
                        mandi.priceCategory,
                        mandi.internalPriceStatus,
                        mandi.sourceUrl,
                        mandi.priceRecord?.source,
                        () => setSelectedProvenanceMandi(mandi)
                      )}
                    </div>
                    {isRec ? (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Recommended</span>
                      </span>
                    ) : mandi.isFeasible ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Feasible APMC
                      </span>
                    ) : !mandi.hasVerifiedPrice ? (
                      <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                        Price Unquoted
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                        Infeasible Quota
                      </span>
                    )}
                  </div>

                  {/* Market Title */}
                  <h4 className="text-base font-serif font-bold text-rural-forest leading-snug">
                    {mandi.market.marketName}
                  </h4>
                  <p className="text-xs text-rural-muted mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rural-primary shrink-0" />
                    <span>
                      {mandi.market.district}, {mandi.market.state}
                    </span>
                  </p>

                  {/* Road Distance and Travel Time */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 bg-rural-cream p-2.5 rounded-xl border border-rural-border text-xs">
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Road Distance
                      </span>
                      <span className="font-bold text-rural-charcoal">
                        {isDistanceAvailable ? `${mandi.route.roadDistanceKm} km` : 'Distance unavailable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Est. Travel Time
                      </span>
                      <span className="font-bold text-rural-charcoal">
                        {isDistanceAvailable ? `~${mandi.route.estimatedTravelTimeHours} hrs` : 'Time unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Reported Price */}
                  <div className="mt-3 flex items-center justify-between py-2 border-b border-rural-border/70 text-xs">
                    <div>
                      <span className="text-[10px] text-rural-muted uppercase tracking-wider block">
                        Daily Modal Price
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {mandi.hasVerifiedPrice && mandi.priceRecord && mandi.priceRecord.modalPrice > 0
                          ? `₹${mandi.priceRecord.modalPrice.toLocaleString('en-IN')}/Qtl`
                          : 'Price Unavailable'}
                      </span>
                    </div>
                    {mandi.forecast?.available && (
                      <div className="text-right">
                        <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          7d: ₹{mandi.forecast.forecasts.d7.predictedPrice}
                        </span>
                      </div>
                    )}
                  </div>

                  {mandi.forecast?.available && mandi.forecast.forecasts && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-2.5 py-1 text-[11px]">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>7d ML Forecast:</span>
                      </span>
                      <span className="font-bold text-emerald-900">
                        ₹{mandi.forecast.forecasts.d7.predictedPrice}/Qtl ({mandi.forecast.forecasts.d7.priceDeltaVsCurrent >= 0 ? '+' : ''}{mandi.forecast.forecasts.d7.priceDeltaVsCurrent}₹)
                      </span>
                    </div>
                  )}

                  {/* Financial Metrics */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-rural-muted">
                      <span>Transport Expense:</span>
                      <span className="font-medium text-rose-700">
                        {isDistanceAvailable ? `- ${formatINR(mandi.transportCost)}` : 'Uncalculated'}
                      </span>
                    </div>
                    <div className="flex justify-between text-rural-muted">
                      <span>Mandi Hamali & Fees:</span>
                      <span className="font-medium text-rose-700">
                        {mandi.hasVerifiedPrice ? `- ${formatINR(mandi.marketFees)}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Return Bottom Box */}
                <div className="mt-4 pt-3 border-t border-rural-border">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rural-muted block">
                        Est. Net Take-Home
                      </span>
                      <div className="text-xl font-serif font-bold text-rural-forest">
                        {mandi.hasVerifiedPrice ? (
                          formatINR(mandi.netSellingRevenue)
                        ) : (
                          <span className="text-sm font-sans text-rural-muted italic">Price Unquoted</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-rural-primary">
                      {mandi.hasVerifiedPrice ? `₹${mandi.netRevenuePerQuintal}/Qtl` : 'Requires spot quotation'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBreakdown(mandi)}
                    className="w-full py-2 px-3 rounded-xl bg-rural-sage hover:bg-rural-mint text-rural-forest text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>View Financial Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Quotation Source & Verification Provenance Modal */}
      {selectedProvenanceMandi && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
            {/* Modal Header */}
            <div className="bg-rural-forest text-white p-5 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rural-mint text-rural-forest mb-1.5">
                  <Globe className="w-3 h-3 text-rural-primary" />
                  <span>Quotation Source & Verification</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {selectedProvenanceMandi.market.marketName}
                </h3>
                <p className="text-xs text-rural-mint/80">
                  {selectedProvenanceMandi.market.district}, {selectedProvenanceMandi.market.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvenanceMandi(null)}
                className="p-1.5 rounded-xl bg-rural-deep text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-rural-charcoal">
              <div className="grid grid-cols-2 gap-3 bg-rural-cream p-3 rounded-2xl border border-rural-border">
                <div>
                  <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
                    Quotation Status
                  </span>
                  <span className="font-bold text-rural-forest text-xs mt-0.5 block">
                    {selectedProvenanceMandi.internalPriceStatus || 'VERIFIED QUOTE'}
                  </span>
                  <span className="text-[10px] text-rural-muted block">
                    {selectedProvenanceMandi.priceCategory ? `Category: ${selectedProvenanceMandi.priceCategory}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
                    Quotation Date
                  </span>
                  <span className="font-bold text-rural-forest text-xs mt-0.5 block">
                    {selectedProvenanceMandi.priceRecord?.arrivalDate || 'N/A'}
                  </span>
                  <span className="text-[10px] text-rural-muted block">
                    Freshness: {selectedProvenanceMandi.priceRecord?.freshnessStatus || 'CURRENT'}
                  </span>
                </div>
              </div>

              {/* Pricing details */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                  Reported Wholesale Rate
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif font-bold text-emerald-900">
                    ₹{selectedProvenanceMandi.priceRecord?.modalPrice?.toLocaleString('en-IN') || 0}/Qtl
                  </span>
                  {selectedProvenanceMandi.priceRecord?.minPrice && selectedProvenanceMandi.priceRecord?.maxPrice && (
                    <span className="text-xs text-emerald-700">
                      (Range: ₹{selectedProvenanceMandi.priceRecord.minPrice.toLocaleString('en-IN')} - ₹{selectedProvenanceMandi.priceRecord.maxPrice.toLocaleString('en-IN')})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-800 block">
                  Crop: {selectedProvenanceMandi.priceRecord?.commodity || 'Standard Produce'} • Variety: {selectedProvenanceMandi.priceRecord?.variety || 'FAQ'}
                </span>
              </div>

              {/* Provenance Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
                  Source & Provenance
                </span>
                <div className="p-3 bg-rural-cream rounded-xl border border-rural-border space-y-1">
                  <div className="font-bold text-rural-forest">
                    {selectedProvenanceMandi.priceRecord?.source || 'Verified APMC Bulletin'}
                  </div>
                  <p className="text-[11px] text-rural-muted leading-relaxed">
                    {selectedProvenanceMandi.internalPriceStatus === 'WEB-DISCOVERED PRICE'
                      ? 'Discovered via agricultural market price discovery from verified national trading portals or electronic mandi networks (e-NAM / CommodityOnline / Krishi Jagran) with structured price and date extraction.'
                      : selectedProvenanceMandi.internalPriceStatus === 'LIVE OFFICIAL QUOTE'
                      ? 'Directly retrieved from the Government of India AGMARKNET daily wholesale arrivals feed via Data.gov.in official API.'
                      : selectedProvenanceMandi.internalPriceStatus === 'HISTORICAL OFFICIAL QUOTE'
                      ? 'Official APMC yard daily trading record retrieved from historical government arrivals bulletin within the past 30 days.'
                      : 'Regional reference price calibrated for transport planning and comparative profit analysis.'}
                  </p>
                </div>
              </div>

              {/* Source URL if available */}
              {selectedProvenanceMandi.sourceUrl && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
                    Verified Source Link
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-rural-cream rounded-xl border border-rural-border gap-2">
                    <span className="text-[11px] font-mono text-rural-muted truncate max-w-xs">
                      {selectedProvenanceMandi.sourceUrl}
                    </span>
                    <a
                      href={selectedProvenanceMandi.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rural-forest text-white hover:bg-rural-deep text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-rural-cream p-3 px-5 border-t border-rural-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProvenanceMandi(null)}
                className="px-5 py-2 bg-rural-forest hover:bg-rural-deep text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
