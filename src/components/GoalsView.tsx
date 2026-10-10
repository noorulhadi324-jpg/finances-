import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { FinancialGoal, Organization } from '../types/finance';
import { formatCurrency } from '../lib/financialMath';

interface GoalsViewProps {
  goals: FinancialGoal[];
  activeOrg: Organization;
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'isCompleted'>) => void;
  onContributeToGoal: (goalId: string, amount: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  activeOrg,
  onAddGoal,
  onContributeToGoal,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000000');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [categoryTag, setCategoryTag] = useState('Treasury Reserve');

  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('50000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      orgId: activeOrg.id,
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: 0,
      targetDate,
      categoryTag,
    });
    setName('');
    setShowModal(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (contributeGoalId) {
      onContributeToGoal(contributeGoalId, parseFloat(contributionAmount) || 0);
      setContributeGoalId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Savings Goals & Sinking Funds</h2>
          <p className="text-xs text-slate-400 mt-1">
            Target capital milestones, emergency buffers, and strategic equipment allocations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Target Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <div
              key={g.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
                    {g.categoryTag}
                  </span>
                  {g.isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reached
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-bold text-slate-100 text-sm">{g.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">Target Date: {g.targetDate}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(g.currentAmount, activeOrg.baseCurrency)}
                    </span>
                    <span className="text-slate-400">
                      {formatCurrency(g.targetAmount, activeOrg.baseCurrency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">{pct}% achieved</span>
                </div>
              </div>

              {!g.isCompleted && (
                <button
                  onClick={() => setContributeGoalId(g.id)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  + Add Deposit
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Set Financial Target Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Goal Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Compute Cluster Reserve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Amount ({activeOrg.baseCurrency})</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Deposit to Goal</h3>
            <form onSubmit={handleContribute} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Deposit Amount ({activeOrg.baseCurrency})</label>
                <input
                  type="number"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Record Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
