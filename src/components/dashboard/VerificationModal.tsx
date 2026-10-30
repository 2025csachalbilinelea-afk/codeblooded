import React, { useMemo } from 'react';
import { runEngineVerification } from '../../engine/verification';
import { ShieldCheck, CheckCircle2, XCircle, X, Terminal } from 'lucide-react';

interface VerificationModalProps {
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose }) => {
  const results = useMemo(() => runEngineVerification(), []);
  const allPassed = results.every((r) => r.passed);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Automated Test Runner
              </span>
              <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-600 px-2 py-0.5 rounded-full font-bold">
                {results.length}/{results.length} Verified
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Calculation Engine Test Suite</h2>
            <p className="text-xs text-stone-400">
              Verifying econometric correctness, bounded environmental losses, logistics constraints, and quota feasibility.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3 text-xs">
          <div
            className={`p-3 rounded-lg border flex items-center space-x-2 ${
              allPassed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-xs">
              {allPassed
                ? 'All mathematical and business logic verification assertions passed with zero defects.'
                : 'One or more engine tests failed.'}
            </span>
          </div>

          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-lg p-3 border border-stone-200 flex items-start space-x-2.5"
              >
                {r.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 text-xs">{r.test}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-mono mt-1 bg-white p-1.5 rounded border border-stone-200/80">
                    {r.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-3 px-5 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Dismiss Test Suite
          </button>
        </div>
      </div>
    </div>
  );
};

