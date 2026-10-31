import React, { useState, useMemo } from 'react';
import {
  CropProfile,
  TransportConfig,
} from '../../types/agriculture';
import {
  DynamicMandiEvaluation,
  SellNowVsLaterComparison,
} from '../../types/marketDiscovery';
import { evaluateSellNowVsLater } from '../../engine/sellNowVsLater';
import { formatINR } from '../../utils/currency';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Warehouse,
  Scale,
  DollarSign,
  HelpCircle,
  Info,
} from 'lucide-react';

interface CropPriceForecastSectionProps {
  currentCrop: CropProfile;
  totalQuintals: number;
  evaluations: DynamicMandiEvaluation[];
  recommendedMarket: DynamicMandiEvaluation | null;
  transportConfig: TransportConfig;
}

export const CropPriceForecastSection: React.FC<CropPriceForecastSectionProps> = ({
  currentCrop,
  totalQuintals,
  evaluations,
  recommendedMarket,
  transportConfig,
}) => {
  // Focus mandi selection for forecast analysis (defaults to recommended or first discovered)
  const [selectedMandiId, setSelectedMandiId] = useState<string>(() => {
    return recommendedMarket?.market.marketId || evaluations[0]?.market.marketId || 'ka-hubballi-apmc';
  });

  const [storageType, setStorageType] = useState<'ambient' | 'ventilated' | 'cold_storage'>('ambient');
  const [customStorageRate, setCustomStorageRate] = useState<number>(2.5);

  // Active evaluation object
  const activeEval = useMemo(() => {
    return (
      evaluations.find((e) => e.market.marketId === selectedMandiId) ||
      recommendedMarket ||
      evaluations[0] ||
      null
    );
  }, [evaluations, selectedMandiId, recommendedMarket]);

  const forecast = activeEval?.forecast || null;
  const currentActualPrice = activeEval?.priceRecord?.modalPrice || 0;
  const arrivalDate = activeEval?.priceRecord?.arrivalDate || '2026-10-30';

  // Financial comparison for Sell Now vs Sell Later
  const comparison: SellNowVsLaterComparison = useMemo(() => {
    return evaluateSellNowVsLater(
      currentCrop,
      totalQuintals,
      currentActualPrice,
      forecast,
      activeEval?.transportCost || 1500,
      activeEval?.market.commissionPercent || 1.5,
      activeEval?.market.cessPercent || 0.5,
      activeEval?.market.handlingChargePerQuintal || 18,
      {
        dailyRatePerQuintal: customStorageRate,
        storageType,
      }
    );
  }, [
    currentCrop,
    totalQuintals,
    currentActualPrice,
    forecast,
    activeEval,
    customStorageRate,
    storageType,
  ]);

  // Combined chart dataset: Historical Actuals + Latest Spot + Future ML Projections with 80% CI
  const chartData = useMemo(() => {
    const rawHistory = forecast?.historicalPoints || [];
    const points: any[] = [];

    // Historical Points (Solid Line)
    rawHistory.forEach((h) => {
      points.push({
        date: h.date.slice(5), // MM-DD
        fullDate: h.date,
        actualPrice: h.modalPrice,
        predictedPrice: null,
        lowerConfidence: null,
        upperConfidence: null,
        isForecast: false,
      });
    });

    // Anchor: Today's Latest Actual Spot Price
    if (currentActualPrice > 0) {
      const todayLabel = arrivalDate.slice(5);
      // If already present, update anchor, else push
      const existingToday = points.find((p) => p.fullDate === arrivalDate);
      if (existingToday) {
        existingToday.predictedPrice = currentActualPrice;
        existingToday.lowerConfidence = currentActualPrice;
        existingToday.upperConfidence = currentActualPrice;
      } else {
        points.push({
          date: todayLabel,
          fullDate: arrivalDate,
          actualPrice: currentActualPrice,
          predictedPrice: currentActualPrice,
          lowerConfidence: currentActualPrice,
          upperConfidence: currentActualPrice,
          isForecast: false,
        });
      }
    }

    // Future ML Horizons (Dashed Line & Uncertainty Band)
    if (forecast?.available && forecast.forecasts) {
      const d3 = forecast.forecasts.d3;
      const d7 = forecast.forecasts.d7;
      const d14 = forecast.forecasts.d14;

      points.push({
        date: d3.targetDate.slice(5),
        fullDate: d3.targetDate,
        actualPrice: null,
        predictedPrice: d3.predictedPrice,
        lowerConfidence: d3.minConfidencePrice,
        upperConfidence: d3.maxConfidencePrice,
        confidenceBand: [d3.minConfidencePrice, d3.maxConfidencePrice],
        isForecast: true,
        horizon: '3 Days',
      });

      points.push({
        date: d7.targetDate.slice(5),
        fullDate: d7.targetDate,
        actualPrice: null,
        predictedPrice: d7.predictedPrice,
        lowerConfidence: d7.minConfidencePrice,
        upperConfidence: d7.maxConfidencePrice,
        confidenceBand: [d7.minConfidencePrice, d7.maxConfidencePrice],
        isForecast: true,
        horizon: '7 Days',
      });

      points.push({
        date: d14.targetDate.slice(5),
        fullDate: d14.targetDate,
        actualPrice: null,
        predictedPrice: d14.predictedPrice,
        lowerConfidence: d14.minConfidencePrice,
        upperConfidence: d14.maxConfidencePrice,
        confidenceBand: [d14.minConfidencePrice, d14.maxConfidencePrice],
        isForecast: true,
        horizon: '14 Days',
      });
    }

    return points;
  }, [forecast, currentActualPrice, arrivalDate]);

  if (!activeEval) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-soft p-5 sm:p-7 space-y-7">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-rural-border/70 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>Phase 5B Machine Learning Intelligence</span>
            </span>
            <span className="text-xs text-rural-muted">•</span>
            <span className="text-xs text-rural-forest font-semibold">
              XGBoost Regressor v1.0.0
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-rural-forest mt-1.5 flex items-center gap-2">
            AI Crop Price Forecast
          </h2>
          <p className="text-xs sm:text-sm text-rural-muted mt-0.5">
            Statistical multi-horizon wholesale price predictions trained on multi-year AGMARKNET records & agro-meteorological data.
          </p>
        </div>

        {/* Mandi Selector for Deep Dive */}
        <div className="flex items-center space-x-3 self-start lg:self-center">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rural-muted">
              Select APMC Mandi:
            </span>
            <select
              value={selectedMandiId}
              onChange={(e) => setSelectedMandiId(e.target.value)}
              className="text-xs font-semibold bg-rural-cream border border-rural-border rounded-xl px-3 py-1.5 text-rural-forest focus:outline-none focus:ring-2 focus:ring-rural-primary"
            >
              {evaluations.map((e) => (
                <option key={e.market.marketId} value={e.market.marketId}>
                  {e.market.marketName} ({e.market.district}, {e.market.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Focus Mandi Headline Banner */}
      <div className="bg-rural-sage/40 rounded-2xl p-4 border border-rural-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-rural-muted uppercase tracking-wider">
            Active Market & Commodity Focus
          </div>
          <div className="text-lg font-bold text-rural-forest">
            {currentCrop.name} at {activeEval.market.marketName}
          </div>
          <div className="text-xs text-rural-muted mt-0.5">
            {activeEval.market.district}, {activeEval.market.state} • Road Distance: {activeEval.route.roadDistanceKm} km
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-white px-4 py-2.5 rounded-xl border border-rural-border shadow-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rural-muted">
              Latest Reported Spot Price
            </div>
            <div className="text-xl font-bold font-serif text-rural-forest">
              {formatINR(currentActualPrice)}
              <span className="text-xs font-sans font-normal text-rural-muted">/Qtl</span>
            </div>
          </div>
          <div className="border-l border-rural-border pl-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rural-muted">
              Reported Arrival
            </div>
            <div className="text-xs font-semibold text-emerald-800">
              {arrivalDate}
            </div>
          </div>
        </div>
      </div>

      {/* 3, 7, 14-Day Horizon Forecast Cards */}
      {forecast?.available && forecast.forecasts ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 3-Day Forecast */}
          <div className="bg-gradient-to-br from-white to-rural-cream rounded-2xl p-4 border border-rural-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rural-forest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rural-primary" />
                <span>3-Day Horizon</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  forecast.forecasts.d3.trendDirection === 'INCREASING'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : forecast.forecasts.d3.trendDirection === 'DECREASING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {forecast.forecasts.d3.trendDirection === 'INCREASING' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-700" />
                ) : forecast.forecasts.d3.trendDirection === 'DECREASING' ? (
                  <TrendingDown className="w-3 h-3 text-amber-700" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-600" />
                )}
                <span>
                  {forecast.forecasts.d3.priceDeltaVsCurrent >= 0 ? '+' : ''}
                  {forecast.forecasts.d3.priceDeltaVsCurrent} ₹
                </span>
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold font-serif text-rural-forest">
                {formatINR(forecast.forecasts.d3.predictedPrice)}
                <span className="text-xs font-sans font-normal text-rural-muted">/Qtl</span>
              </div>
              <div className="text-xs text-rural-muted mt-1">
                80% Confidence: {formatINR(forecast.forecasts.d3.minConfidencePrice)} – {formatINR(forecast.forecasts.d3.maxConfidencePrice)}
              </div>
            </div>

            <div className="text-[11px] text-rural-muted border-t border-rural-border/60 pt-2 flex items-center justify-between">
              <span>Target: {forecast.forecasts.d3.targetDate}</span>
              <span className="font-semibold text-rural-forest">MAE: ₹44/Qtl</span>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-gradient-to-br from-white to-rural-cream rounded-2xl p-4 border border-rural-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rural-forest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rural-primary" />
                <span>7-Day Horizon</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  forecast.forecasts.d7.trendDirection === 'INCREASING'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : forecast.forecasts.d7.trendDirection === 'DECREASING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {forecast.forecasts.d7.trendDirection === 'INCREASING' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-700" />
                ) : forecast.forecasts.d7.trendDirection === 'DECREASING' ? (
                  <TrendingDown className="w-3 h-3 text-amber-700" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-600" />
                )}
                <span>
                  {forecast.forecasts.d7.priceDeltaVsCurrent >= 0 ? '+' : ''}
                  {forecast.forecasts.d7.priceDeltaVsCurrent} ₹
                </span>
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold font-serif text-rural-forest">
                {formatINR(forecast.forecasts.d7.predictedPrice)}
                <span className="text-xs font-sans font-normal text-rural-muted">/Qtl</span>
              </div>
              <div className="text-xs text-rural-muted mt-1">
                80% Confidence: {formatINR(forecast.forecasts.d7.minConfidencePrice)} – {formatINR(forecast.forecasts.d7.maxConfidencePrice)}
              </div>
            </div>

            <div className="text-[11px] text-rural-muted border-t border-rural-border/60 pt-2 flex items-center justify-between">
              <span>Target: {forecast.forecasts.d7.targetDate}</span>
              <span className="font-semibold text-rural-forest">MAE: ₹54/Qtl</span>
            </div>
          </div>

          {/* 14-Day Forecast */}
          <div className="bg-gradient-to-br from-white to-rural-cream rounded-2xl p-4 border border-rural-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rural-forest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rural-primary" />
                <span>14-Day Horizon</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  forecast.forecasts.d14.trendDirection === 'INCREASING'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : forecast.forecasts.d14.trendDirection === 'DECREASING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {forecast.forecasts.d14.trendDirection === 'INCREASING' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-700" />
                ) : forecast.forecasts.d14.trendDirection === 'DECREASING' ? (
                  <TrendingDown className="w-3 h-3 text-amber-700" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-600" />
                )}
                <span>
                  {forecast.forecasts.d14.priceDeltaVsCurrent >= 0 ? '+' : ''}
                  {forecast.forecasts.d14.priceDeltaVsCurrent} ₹
                </span>
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-bold font-serif text-rural-forest">
                {formatINR(forecast.forecasts.d14.predictedPrice)}
                <span className="text-xs font-sans font-normal text-rural-muted">/Qtl</span>
              </div>
              <div className="text-xs text-rural-muted mt-1">
                80% Confidence: {formatINR(forecast.forecasts.d14.minConfidencePrice)} – {formatINR(forecast.forecasts.d14.maxConfidencePrice)}
              </div>
            </div>

            <div className="text-[11px] text-rural-muted border-t border-rural-border/60 pt-2 flex items-center justify-between">
              <span>Target: {forecast.forecasts.d14.targetDate}</span>
              <span className="font-semibold text-rural-forest">MAE: ₹97/Qtl</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {forecast?.unavailabilityReason || 'Price prediction currently unavailable for this crop and mandi combination.'}
          </span>
        </div>
      )}

      {/* Historical vs Forecast Price Trajectory Chart */}
      <div className="bg-rural-sage/20 rounded-2xl p-5 border border-rural-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-rural-forest">
              Price Trajectory & Probabilistic Uncertainty Band
            </h3>
            <p className="text-xs text-rural-muted">
              Solid emerald line = Historical actual spot prices. Dashed neon line with shaded corridor = Machine learning forecast & 80% confidence interval.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 text-rural-forest">
              <span className="w-3 h-0.5 bg-emerald-700 inline-block"></span>
              <span>Historical Actual</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-800">
              <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed border-emerald-700 inline-block"></span>
              <span>ML Forecast</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rural-muted">
              <span className="w-3 h-2 bg-emerald-200/50 inline-block rounded-xs"></span>
              <span>80% Interval</span>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE5DA" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#68776D' }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#68776D' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-rural-border shadow-md text-xs space-y-1">
                        <div className="font-bold text-rural-forest">Date: {data.fullDate}</div>
                        {data.actualPrice && (
                          <div className="text-emerald-700 font-semibold">
                            Actual Reported Price: ₹{data.actualPrice}/Qtl
                          </div>
                        )}
                        {data.isForecast && (
                          <>
                            <div className="text-emerald-800 font-semibold">
                              ML Forecast ({data.horizon}): ₹{data.predictedPrice}/Qtl
                            </div>
                            <div className="text-rural-muted">
                              80% Range: ₹{data.lowerConfidence} – ₹{data.upperConfidence}/Qtl
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded 80% Confidence Area */}
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="transparent"
                fill="#bbf7d0"
                fillOpacity={0.4}
              />

              {/* Historical Actual Price Line */}
              <Line
                type="monotone"
                dataKey="actualPrice"
                stroke="#123D2C"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#123D2C' }}
                isAnimationActive={false}
              />

              {/* Predicted Price Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="predictedPrice"
                stroke="#279565"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#279565' }}
                isAnimationActive={false}
              />

              {/* Highlight anchor dot for today's reported price */}
              <ReferenceDot
                x={arrivalDate.slice(5)}
                y={currentActualPrice}
                r={6}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SELL NOW VS SELL LATER DECISION MATRIX */}
      <div className="pt-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-rural-border/70 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rural-primary bg-rural-mint px-2.5 py-0.5 rounded-full">
                Financial Strategy
              </span>
              <span className="text-xs text-rural-forest font-semibold">
                Decision Support
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-rural-forest mt-1">
              Sell Now vs Sell Later: Take-Home Profit Analysis
            </h3>
            <p className="text-xs text-rural-muted">
              Financial breakdown incorporating storage expenses, physical spoilage losses, APMC fees, and vehicle transport.
            </p>
          </div>

          {/* Storage Configuration Switcher */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-rural-muted font-medium">Storage Model:</span>
            <select
              value={storageType}
              onChange={(e) => setStorageType(e.target.value as any)}
              className="bg-rural-cream border border-rural-border rounded-xl px-2.5 py-1 text-xs font-semibold text-rural-forest focus:outline-none"
            >
              <option value="ambient">Standard Ambient Farm Store (₹2.5/Qtl/day)</option>
              <option value="ventilated">Ventilated Shed (₹2.5/Qtl/day)</option>
              <option value="cold_storage">Refrigerated Cold Chain (₹6.0/Qtl/day)</option>
            </select>
          </div>
        </div>

        {/* Perishability Alert Banner */}
        {comparison.perishabilityWarning && (
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 ${
              comparison.perishabilityClass === 1
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {comparison.perishabilityClass === 1 ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className="font-bold">Crop Perishability Risk: </span>
              {comparison.perishabilityWarning}
            </div>
          </div>
        )}

        {/* 4-Column Decision Cards (Today vs 3d vs 7d vs 14d) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparison.options.map((opt) => {
            const isOptimal = opt.decision === 'OPTIMAL';
            const isNotRec = opt.decision === 'NOT_RECOMMENDED';

            return (
              <div
                key={opt.horizonDays}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isOptimal
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                    : isNotRec
                    ? 'bg-slate-50/60 border-slate-200 opacity-90'
                    : 'bg-white border-rural-border shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-rural-border/50">
                    <span className="text-xs font-bold text-rural-forest">{opt.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOptimal
                          ? 'bg-emerald-600 text-white'
                          : opt.decision === 'ACCEPTABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : opt.decision === 'RISKY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {opt.decision}
                    </span>
                  </div>

                  {/* Net Take-Home Revenue Headline */}
                  <div className="my-3">
                    <div className="text-[11px] font-semibold text-rural-muted uppercase tracking-wider">
                      Est. Take-Home Net Return
                    </div>
                    <div className="text-xl font-bold font-serif text-rural-forest mt-0.5">
                      {formatINR(opt.netRevenue)}
                    </div>
                    {opt.horizonDays > 0 && (
                      <div
                        className={`text-xs font-bold mt-1 flex items-center space-x-1 ${
                          opt.netGainVsSellNow > 0
                            ? 'text-emerald-700'
                            : opt.netGainVsSellNow < 0
                            ? 'text-rose-700'
                            : 'text-rural-muted'
                        }`}
                      >
                        <span>
                          {opt.netGainVsSellNow >= 0 ? '+' : ''}
                          {formatINR(opt.netGainVsSellNow)} ({opt.netGainPercent}%)
                        </span>
                        <span className="text-[10px] text-rural-muted font-normal">vs Sell Today</span>
                      </div>
                    )}
                  </div>

                  {/* Deductions & Assumptions Ledger */}
                  <div className="space-y-1.5 text-xs border-t border-rural-border/50 pt-2.5 text-rural-charcoal">
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Expected Price:</span>
                      <span className="font-semibold">₹{opt.pricePerQuintal}/Qtl</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Saleable Volume:</span>
                      <span className="font-semibold">{opt.saleableQuintals} Qtl</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Spoilage Loss:</span>
                      <span className={opt.spoilagePercent > 5 ? 'text-amber-700 font-semibold' : ''}>
                        {opt.spoilageLossQuintals} Qtl ({opt.spoilagePercent}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Storage Cost:</span>
                      <span>{opt.storageCost > 0 ? formatINR(opt.storageCost) : '₹0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Transport Cost:</span>
                      <span>{formatINR(opt.transportCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rural-muted">Mandi Fees & Labor:</span>
                      <span>{formatINR(opt.mandiFees + opt.handlingCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Risk / Advisory Note */}
                <div className="mt-3 pt-2 border-t border-rural-border/40 text-[11px] text-rural-muted">
                  {opt.riskFactors[0] || 'Standard spot dispatch assumptions.'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Farmer Summary Guidance Card */}
        <div className="bg-rural-cream p-4 rounded-2xl border border-rural-border flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-rural-forest flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rural-forest">
            <span className="font-bold">Advisor Summary: </span>
            {comparison.summaryGuidance}
            <div className="text-rural-muted mt-1">
              Note: Machine learning projections are probabilistic estimates and cannot guarantee market prices. Storage costs and weight loss accumulate daily.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

