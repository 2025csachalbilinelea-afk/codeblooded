import React from 'react';
import { DemoScenario, DEMO_SCENARIOS } from '../../data/demoScenarios';
import { FarmerInputs } from '../../types/agriculture';
import { FlaskConical, RotateCcw, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoScenariosBarProps {
  currentInputs: FarmerInputs;
  activeScenarioId: string | null;
  onSelectScenario: (scenario: DemoScenario) => void;
  onResetDefaults: () => void;
}

export const DemoScenariosBar: React.FC<DemoScenariosBarProps> = ({
  activeScenarioId,
  onSelectScenario,
  onResetDefaults,
}) => {
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || null;

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-md p-4 sm:p-5 mb-6 no-print">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Hackathon Demo Scenarios
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                Live Engine Execution
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Quick-load realistic agricultural test cases to verify core econometric behaviors.
            </p>
          </div>
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors self-start sm:self-auto"
          title="Restore standard 20 Quintal tomato defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Scenario Pill Buttons */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = activeScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario)}
              className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-stone-800/60 border-stone-700/70 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  {scenario.badge}
                </span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>
              <div className="text-xs font-bold leading-tight line-clamp-1">
                {scenario.title.split(' (')[0]}
              </div>
              <div className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                {scenario.inputs.cropId === 'spinach' ? 'Spinach' : 'Tomato'} • {scenario.inputs.quantity} Qtl
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Insight Drawer */}
      {activeScenario && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-stone-800/80 border border-emerald-900/60 text-xs text-stone-200 animate-in fade-in duration-200">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-white flex items-center space-x-2">
                <span>{activeScenario.title}</span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.2 rounded border border-emerald-800">
                  Active Demo Test
                </span>
              </div>
              <p className="mt-1 text-stone-300 leading-relaxed">{activeScenario.summary}</p>
              <div className="mt-2 pt-2 border-t border-stone-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400 block font-medium">Core Principle Tested:</span>
                  <span className="text-emerald-300">{activeScenario.keyInsight}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Expected Result:</span>
                  <span className="text-amber-300">{activeScenario.expectedOutcome}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

