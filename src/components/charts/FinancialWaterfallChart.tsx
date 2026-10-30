import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface FinancialWaterfallChartProps {
  bestMarket: MarketCalculationResult | null;
}

export const FinancialWaterfallChart: React.FC<FinancialWaterfallChartProps> = ({ bestMarket }) => {
  if (!bestMarket) return null;

  const data = [
    {
      category: 'Total Selling Money',
      amount: bestMarket.grossRevenue,
      type: 'revenue',
      fill: '#15803d', // emerald-700
    },
    {
      category: 'Transport Cost',
      amount: -bestMarket.transportationCost,
      type: 'expense',
      fill: '#dc2626', // rose-600
    },
    {
      category: 'Market Charges',
      amount: -bestMarket.totalMarketFees,
      type: 'expense',
      fill: '#d97706', // amber-600
    },
    {
      category: 'Money You Keep',
      amount: bestMarket.netReturn,
      type: bestMarket.netReturn >= 0 ? 'profit' : 'loss',
      fill: bestMarket.netReturn >= 0 ? '#1b4332' : '#991b1b', // forest green or dark red
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 shadow-sm p-5 mt-6">
      <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Where Your Selling Money Goes ({bestMarket.market.name})
            </h3>
            <p className="text-xs text-stone-500">
              How total selling money is reduced by travel costs and market charges to give your actual take-home earnings.
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="category"
              tick={{ fill: '#44403c', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#e7e5e4' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              tick={{ fill: '#78716c', fontSize: 11 }}
              axisLine={{ stroke: '#e7e5e4' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Amount']}
              contentStyle={{
                backgroundColor: '#1c1917',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-stone-100 text-center text-xs">
        <div>
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Selling Money</span>
          <span className="font-bold text-emerald-700">{formatINR(bestMarket.grossRevenue)}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Transport Cost</span>
          <span className="font-bold text-rose-600">-{formatINR(bestMarket.transportationCost)}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Market Charges</span>
          <span className="font-bold text-amber-600">-{formatINR(bestMarket.totalMarketFees)}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Money You Keep</span>
          <span className={`font-bold ${bestMarket.netReturn >= 0 ? 'text-emerald-900' : 'text-rose-700'}`}>
            {formatINR(bestMarket.netReturn)}
          </span>
        </div>
      </div>
    </div>
  );
};
