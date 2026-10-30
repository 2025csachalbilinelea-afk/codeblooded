import React from 'react';
import { GradeDistribution } from '../../types/agriculture';
import { Award, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface GradeDistributionProps {
  gradeDistribution: GradeDistribution;
  totalQuintals: number;
  onChange: (dist: GradeDistribution) => void;
  error?: string;
}

export const GradeDistributionForm: React.FC<GradeDistributionProps> = ({
  gradeDistribution,
  totalQuintals,
  onChange,
  error,
}) => {
  const sum = (gradeDistribution.A || 0) + (gradeDistribution.B || 0) + (gradeDistribution.C || 0);
  const isValid = Math.abs(sum - 100) <= 0.5;

  const handleGradeChange = (grade: 'A' | 'B' | 'C', val: number) => {
    onChange({
      ...gradeDistribution,
      [grade]: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
    });
  };

  const applyPreset = (A: number, B: number, C: number) => {
    onChange({ A, B, C });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-stone-100 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
              3. Produce Quality & Grade Sorting
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total: 100%</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Total: {sum}% (Must equal 100%)</span>
              </>
            )}
          </span>
        </div>
      </div>

      <p className="text-xs text-stone-500 mb-3">
        Enter the percentage distribution for each grade, or select a quick profile below.
      </p>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] font-semibold text-stone-500 mr-1 flex items-center">
          <Layers className="w-3 h-3 mr-1" /> Presets:
        </span>
        <button
          type="button"
          onClick={() => applyPreset(50, 35, 15)}
          className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          Standard (50/35/15)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(70, 20, 10)}
          className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          Prime Lot (70/20/10)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(100, 0, 0)}
          className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          100% Grade A
        </button>
        <button
          type="button"
          onClick={() => applyPreset(0, 100, 0)}
          className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          100% Grade B
        </button>
        <button
          type="button"
          onClick={() => applyPreset(0, 0, 100)}
          className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          100% Grade C
        </button>
      </div>

      {/* Grade Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Grade A */}
        <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-emerald-900 text-xs flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Grade A (Premium)</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {((totalQuintals * (gradeDistribution.A || 0)) / 100).toFixed(1)} Qtl
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="100"
              value={gradeDistribution.A}
              onChange={(e) => handleGradeChange('A', parseFloat(e.target.value))}
              className="w-full text-sm bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-xs font-semibold text-stone-600">%</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Export / supermarket quality; unblemished.</p>
        </div>

        {/* Grade B */}
        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-amber-900 text-xs flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Grade B (Fair Avg)</span>
            </span>
            <span className="text-[11px] font-bold text-amber-800">
              {((totalQuintals * (gradeDistribution.B || 0)) / 100).toFixed(1)} Qtl
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="100"
              value={gradeDistribution.B}
              onChange={(e) => handleGradeChange('B', parseFloat(e.target.value))}
              className="w-full text-sm bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-xs font-semibold text-stone-600">%</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Standard market produce; minor cosmetic variation.</p>
        </div>

        {/* Grade C */}
        <div className="bg-stone-100/70 rounded-lg p-3 border border-stone-300/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-stone-800 text-xs flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-stone-500 inline-block"></span>
              <span>Grade C (Processing)</span>
            </span>
            <span className="text-[11px] font-bold text-stone-700">
              {((totalQuintals * (gradeDistribution.C || 0)) / 100).toFixed(1)} Qtl
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="100"
              value={gradeDistribution.C}
              onChange={(e) => handleGradeChange('C', parseFloat(e.target.value))}
              className="w-full text-sm bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-xs font-semibold text-stone-600">%</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">Smaller size or minor spots; factory/bulk processing.</p>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>}
    </div>
  );
};
