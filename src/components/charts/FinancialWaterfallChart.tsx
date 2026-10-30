import React from 'react';
import { MarketCalculationResult } from '../../types/agriculture';
import { formatINR } from '../../utils/currency';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, HelpCircle } from 'lucide-react';

interface FinancialWaterfallChartProps {
  bestMarket: MarketCalculationResult | null;
}

export const FinancialWaterfallChart: React.FC<FinancialWaterfallChartProps> = ({ bestMarket }) => {
  if (!bestMarket) return null;

  const data = [
    {
      category: 'Expected Sales',
      amount: bestMarket.grossRevenue,
      type: 'revenue',
      fill: '#123D2C', // rural-forest
    },
    {
      category: 'Transport Cost',
      amount: -bestMarket.transportationCost,
      type: 'expense',
      fill: '#B96F4B', // rural-terracotta
    },
    {
      category: 'Market Fees',
      amount: -bestMarket.totalMarketFees,
      type: 'expense',
      fill: '#D97706', // warm ochre / amber
    },
    {
      category: 'Money You Keep',
      amount: bestMarket.netReturn,
      type: bestMarket.netReturn >= 0 ? 'profit' : 'loss',
      fill: bestMarket.netReturn >= 0 ? '#279565' : '#991B1B', // rural-fresh or rose-800
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-rural-border shadow-rural-card p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5 border-b border-rural-border/70 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rural-mint text-rural-primary flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-rural-forest">
              Where Your Money Goes ({bestMarket.market.name})
            </h3>
            <p className="text-xs sm:text-sm text-rural-muted font-sans">
              How total selling proceeds are reduced by travel costs and market charges to give your final take-home earnings.
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="category"
              tick={{ fill: '#24352C', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}
              axisLine={{ stroke: '#DCE5DA' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              tick={{ fill: '#68776D', fontSize: 11, fontFamily: 'Inter' }}
              axisLine={{ stroke: '#DCE5DA' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Amount']}
              contentStyle={{
                backgroundColor: '#123D2C',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'Inter',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Summary Footers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-rural-border/70 text-center font-sans">
        <div className="bg-rural-cream p-3 rounded-2xl border border-rural-border/60">
          <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
            Expected Sales
          </span>
          <span className="font-bold text-rural-forest text-sm sm:text-base">
            {formatINR(bestMarket.grossRevenue)}
          </span>
        </div>
        <div className="bg-rural-cream p-3 rounded-2xl border border-rural-border/60">
          <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
            Transport Cost
          </span>
          <span className="font-bold text-rural-terracotta text-sm sm:text-base">
            -{formatINR(bestMarket.transportationCost)}
          </span>
        </div>
        <div className="bg-rural-cream p-3 rounded-2xl border border-rural-border/60">
          <span className="text-[10px] text-rural-muted uppercase font-bold tracking-wider block">
            Market Fees
          </span>
          <span className="font-bold text-amber-700 text-sm sm:text-base">
            -{formatINR(bestMarket.totalMarketFees)}
          </span>
        </div>
        <div className="bg-rural-mint/60 p-3 rounded-2xl border border-rural-fresh/40">
          <span className="text-[10px] text-rural-forest uppercase font-bold tracking-wider block">
            Money You Keep
          </span>
          <span className={`font-black text-sm sm:text-base ${bestMarket.netReturn >= 0 ? 'text-rural-forest' : 'text-rose-700'}`}>
            {formatINR(bestMarket.netReturn)}
          </span>
        </div>
      </div>

      {/* Simple Text Summary for Farmers */}
      <div className="mt-4 p-3.5 bg-rural-sage/60 rounded-2xl border border-rural-border text-xs text-rural-charcoal leading-relaxed font-sans flex items-start space-x-2">
        <HelpCircle className="w-4 h-4 text-rural-primary shrink-0 mt-0.5" />
        <p>
          <strong>Plain English Summary: </strong>
          You start with <strong>{formatINR(bestMarket.grossRevenue)}</strong> in total crop sales at {bestMarket.market.name}.
          After subtracting <strong>{formatINR(bestMarket.transportationCost)}</strong> for vehicle delivery and{' '}
          <strong>{formatINR(bestMarket.totalMarketFees)}</strong> for mandi charges, you take home{' '}
          <strong className="text-rural-forest font-bold">{formatINR(bestMarket.netReturn)}</strong> in cash.
        </p>
      </div>
    </div>
  );
};
