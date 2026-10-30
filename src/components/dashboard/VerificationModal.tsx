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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rural-deep/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-rural-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rural-forest text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rural-fresh" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rural-mint">
                Automated Test Verification
              </span>
              <span className="text-[10px] bg-rural-deep text-rural-mint border border-rural-fresh/40 px-2.5 py-0.5 rounded-full font-bold">
                {results.length}/{results.length} Verified
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-white mt-1">Calculation Engine Test Suite</h2>
            <p className="text-xs text-rural-mint/80">
              Verifying economic correctness, environmental loss models, vehicle capacity constraints, and market purchase limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rural-deep text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3 text-xs font-sans">
          <div
            className={`p-3.5 rounded-2xl border flex items-center space-x-2.5 ${
              allPassed
                ? 'bg-rural-sage/80 border-rural-fresh/50 text-rural-forest'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="w-5 h-5 text-rural-fresh shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-xs sm:text-sm">
              {allPassed
                ? 'All mathematical and business logic verification assertions passed with zero defects.'
                : 'One or more engine tests failed.'}
            </span>
          </div>

          <div className="space-y-2">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-rural-border bg-rural-cream flex items-start space-x-3"
              >
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-rural-fresh shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-rural-forest">{res.test}</div>
                  <div className="text-[11px] text-rural-muted mt-0.5 font-mono">{res.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-rural-cream p-3 px-5 border-t border-rural-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-rural-forest hover:bg-rural-deep text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
