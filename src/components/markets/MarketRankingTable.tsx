import React, { useState } from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { ArrowUpDown, Eye, MapPin, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

interface MarketRankingTableProps {
  feasibleMarkets: MarketCalculationResult[];
  onSelectMarket: (market: MarketCalculationResult) => void;
}

type SortField = 'netReturn' | 'priceA' | 'distance' | 'transportCost' | 'spoilage';

export const MarketRankingTable: React.FC<MarketRankingTableProps> = ({
  feasibleMarkets,
  onSelectMarket,
}) => {
  const [sortField, setSortField] = useState<SortField>('netReturn');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sorted = [...feasibleMarkets].sort((a, b) => {
    let diff = 0;
    switch (sortField) {
      case 'netReturn':
        diff = b.netReturn - a.netReturn;
        break;
      case 'priceA':
        diff = b.market.pricesPerQuintal.A - a.market.pricesPerQuintal.A;
        break;
      case 'distance':
        diff = b.market.distanceKm - a.market.distanceKm;
        break;
      case 'transportCost':
        diff = b.transportationCost - a.transportationCost;
        break;
      case 'spoilage':
        diff = b.estimatedLossPercent - a.estimatedLossPercent;
        break;
    }
    return sortAsc ? -diff : diff;
  });

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-rural-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rural-cream/60">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-serif font-bold text-rural-forest">
              Markets Compared
            </h3>
            <span className="text-xs bg-rural-mint text-rural-forest font-semibold px-2.5 py-0.5 rounded-full border border-rural-fresh/40">
              {feasibleMarkets.length} Destinations Available
            </span>
          </div>
          <p className="text-xs sm:text-sm text-rural-muted mt-1 font-sans">
            Markets are ranked by estimated earnings after costs, subject to market limits and other constraints.
          </p>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-rural-sage/60 border-b border-rural-border text-rural-forest font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-sans">Rank & Market</th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-rural-sage transition-colors font-sans"
                onClick={() => handleSort('distance')}
              >
                <div className="flex items-center space-x-1">
                  <span>Distance</span>
                  <ArrowUpDown className="w-3 h-3 text-rural-muted" />
                </div>
              </th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-rural-sage transition-colors font-sans"
                onClick={() => handleSort('priceA')}
              >
                <div className="flex items-center space-x-1">
                  <span>Offered Price</span>
                  <ArrowUpDown className="w-3 h-3 text-rural-muted" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-sans">Max Accepted</th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-rural-sage transition-colors font-sans"
                onClick={() => handleSort('spoilage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Loss on Way</span>
                  <ArrowUpDown className="w-3 h-3 text-rural-muted" />
                </div>
              </th>
              <th
                className="py-3.5 px-3 cursor-pointer hover:bg-rural-sage transition-colors font-sans"
                onClick={() => handleSort('transportCost')}
              >
                <div className="flex items-center space-x-1">
                  <span>Transport Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-rural-muted" />
                </div>
              </th>
              <th className="py-3.5 px-3 font-sans">Market Fees</th>
              <th
                className="py-3.5 px-4 text-right cursor-pointer hover:bg-rural-sage transition-colors font-sans"
                onClick={() => handleSort('netReturn')}
              >
                <div className="flex items-center justify-end space-x-1 text-rural-forest font-bold">
                  <span>Money You Keep</span>
                  <ArrowUpDown className="w-3 h-3 text-rural-fresh" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-center font-sans">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rural-border/50 font-medium">
            {sorted.map((res, idx) => {
              const isBest = idx === 0 && sortField === 'netReturn' && !sortAsc;
              return (
                <tr
                  key={res.market.id}
                  className={`transition-colors ${
                    isBest
                      ? 'bg-rural-mint/30 font-semibold'
                      : 'hover:bg-rural-cream/60'
                  }`}
                >
                  {/* Market info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isBest
                            ? 'bg-rural-forest text-white shadow-sm'
                            : 'bg-rural-sage text-rural-forest'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-serif font-bold text-rural-forest text-sm sm:text-base flex items-center space-x-2">
                          <span>{res.market.name}</span>
                          {isBest && (
                            <span className="text-[10px] bg-rural-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-rural-muted flex items-center space-x-1 mt-0.5 font-sans">
                          <MapPin className="w-3 h-3 text-rural-muted shrink-0" />
                          <span>{res.market.locationName}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-4 px-3 text-rural-charcoal whitespace-nowrap font-sans">
                    <div className="font-semibold">{res.market.distanceKm} km</div>
                    <div className="text-[11px] text-rural-muted font-normal">{res.market.estimatedTravelTimeHours} hrs travel</div>
                  </td>

                  {/* Offered Price */}
                  <td className="py-4 px-3 whitespace-nowrap font-sans">
                    <div className="font-bold text-rural-forest">
                      {formatINR(res.market.pricesPerQuintal.A)}
                    </div>
                    <div className="text-[11px] text-rural-muted font-normal">
                      per Quintal
                    </div>
                  </td>

                  {/* Maximum Quantity Accepted */}
                  <td className="py-4 px-3 whitespace-nowrap text-rural-charcoal font-sans">
                    <div className="font-semibold">{res.market.maxCapacityQuintals} Qtl Max</div>
                    <div className="text-[11px] text-rural-primary font-normal">
                      {res.capacityUtilizationPercent}% Utilized
                    </div>
                  </td>

                  {/* Spoilage Loss */}
                  <td className="py-4 px-3 whitespace-nowrap font-sans">
                    <div className="font-semibold text-rural-charcoal">
                      {res.physicalLossQuintals.toFixed(1)} Qtl
                    </div>
                    <div className="text-[11px] text-amber-800 font-normal">
                      ({formatPercent(res.estimatedLossPercent)} loss)
                    </div>
                  </td>

                  {/* Transport */}
                  <td className="py-4 px-3 whitespace-nowrap text-rural-charcoal font-sans">
                    <div className="font-semibold">{formatINR(res.transportationCost)}</div>
                    <div className="text-[11px] text-rural-muted font-normal">
                      {res.transportTrips} {res.transportTrips === 1 ? 'Trip' : 'Trips'}
                    </div>
                  </td>

                  {/* Market Fees */}
                  <td className="py-4 px-3 whitespace-nowrap text-rural-charcoal font-sans">
                    <div className="font-semibold">{formatINR(res.totalMarketFees)}</div>
                    <div className="text-[11px] text-rural-muted font-normal">
                      {res.market.commissionFeePercent}% APMC fee
                    </div>
                  </td>

                  {/* Money You Keep */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-sans">
                    <div
                      className={`text-base font-black ${
                        res.netReturn >= 0 ? 'text-rural-forest' : 'text-rose-700'
                      }`}
                    >
                      {formatINR(res.netReturn)}
                    </div>
                    <div className="text-[11px] text-rural-muted font-medium">
                      {formatINR(res.netReturnPerQuintal)} / Qtl
                    </div>
                  </td>

                  {/* Details Action Button */}
                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectMarket(res)}
                      className="p-2 rounded-xl bg-rural-cream hover:bg-rural-mint hover:text-rural-forest text-rural-charcoal border border-rural-border transition-colors cursor-pointer"
                      title="View complete itemized breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
