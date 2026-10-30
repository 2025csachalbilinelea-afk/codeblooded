import React from 'react';
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onOpenDashboard: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenDashboard }) => {
  return (
    <section className="py-20 sm:py-28 bg-rural-forest text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rural-fresh/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rural-primary/30 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle organic watermark */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 text-rural-deep opacity-40 pointer-events-none">
        <Leaf className="w-full h-full stroke-[0.8]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rural-mint/15 border border-rural-mint/30 text-rural-mint text-xs sm:text-sm font-medium uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4 text-rural-fresh" />
          <span>Interactive Market Optimizer</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
          Ready to Find the Right Market for <span className="italic font-normal text-rural-mint">Your Harvest?</span>
        </h2>

        <p className="mt-5 text-base sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-sans font-light">
          Enter your harvest details and compare estimated earnings across available markets.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-rural-fresh text-white font-semibold text-base hover:bg-rural-fresh/90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer group"
          >
            <span>Open HarvestRoute Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-xs sm:text-sm text-rural-mint/75 font-medium">
          <ShieldCheck className="w-4 h-4 text-rural-fresh" />
          <span>Simple inputs. Clear costs. Better-informed decisions.</span>
        </div>
      </div>
    </section>
  );
};

