import React, { useState } from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR, formatPercent } from '../../utils/currency';
import { Trophy, ArrowUpDown, Eye, ShieldCheck, MapPin, Truck } from 'lucide-react';

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
      setSortAsc(false); // default descending for most
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
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
            <span>Feasible Single-Market Ranking</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {feasibleMarkets.length} Destinations Qualified
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Ranked by estimated net return after physical transit loss, transport expenses, and statutory market deductions.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Rank / Destination</th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-stone-100"
                onClick={() => handleSort('distance')}
              >
                <div className="flex items-center space-x-1">
                  <span>Distance</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-stone-100"
                onClick={() => handleSort('priceA')}
              >
                <div className="flex items-center space-x-1">
                  <span>Grade A Price</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="py-3 px-3">Capacity</th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-stone-100"
                onClick={() => handleSort('spoilage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Spoilage</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-stone-100"
                onClick={() => handleSort('transportCost')}
              >
                <div className="flex items-center space-x-1">
                  <span>Transport</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="py-3 px-3">Mandi Fees</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:bg-stone-100"
                onClick={() => handleSort('netReturn')}
              >
                <div className="flex items-center justify-end space-x-1 text-emerald-800">
                  <span>Est. Net Return</span>
                  <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-medium">
            {sorted.map((res, idx) => {
              const isBest = idx === 0 && sortField === 'netReturn' && !sortAsc;
              return (
                <tr
                  key={res.market.id}
                  className={`hover:bg-warmbg-50 transition-colors ${
                    isBest ? 'bg-emerald-50/40 font-semibold' : ''
                  }`}
                >
                  {/* Market info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isBest
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                          <span>{res.market.name}</span>
                          {isBest && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{res.market.locationName}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-3.5 px-3 text-stone-700 whitespace-nowrap">
                    <div>{res.market.distanceKm} km</div>
                    <div className="text-[10px] text-stone-400">{res.market.estimatedTravelTimeHours} hrs</div>
                  </td>

                  {/* Grade A Price */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-stone-800">
                      {formatINR(res.market.pricesPerQuintal.A)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      B: {formatINR(res.market.pricesPerQuintal.B)} • C: {formatINR(res.market.pricesPerQuintal.C)}
                    </div>
                  </td>

                  {/* Capacity */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-stone-700">
                    <div>{res.market.maxCapacityQuintals} Qtl Max</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {res.capacityUtilizationPercent}% Utilized
                    </div>
                  </td>

                  {/* Spoilage */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-stone-800">
                      {formatPercent(res.estimatedLossPercent)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {res.physicalLossQuintals.toFixed(1)} Qtl loss
                    </div>
                  </td>

                  {/* Transport */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-stone-700">
                    <div>{formatINR(res.transportationCost)}</div>
                    <div className="text-[10px] text-stone-400">
                      {res.transportTrips} {res.transportTrips === 1 ? 'Trip' : 'Trips'}
                    </div>
                  </td>

                  {/* Fees */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-stone-700">
                    <div>{formatINR(res.totalMarketFees)}</div>
                    <div className="text-[10px] text-stone-400">
                      {res.market.commissionFeePercent}% Comm + Cess
                    </div>
                  </td>

                  {/* Net Return */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div
                      className={`text-sm font-bold ${
                        res.netReturn >= 0 ? 'text-emerald-800' : 'text-rose-700'
                      }`}
                    >
                      {formatINR(res.netReturn)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {formatINR(res.netReturnPerQuintal)} / Qtl
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectMarket(res)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 text-stone-600 transition-colors"
                      title="Inspect full itemized ledger breakdown"
                    >
                      <Eye className="w-3.5 h-3.5" />
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

