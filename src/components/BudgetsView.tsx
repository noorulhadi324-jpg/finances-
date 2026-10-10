import React, { useState } from 'react';
import { PiggyBank, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Budget, Category, Transaction, Organization } from '../types/finance';
import { formatCurrency, convertCurrency } from '../lib/financialMath';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  activeOrg: Organization;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  activeOrg,
  onAddBudget,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [allocatedAmount, setAllocatedAmount] = useState('100000');
  const [warningThresholdPct, setWarningThresholdPct] = useState('80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBudget({
      orgId: activeOrg.id,
      name,
      categoryId,
      allocatedAmount: parseFloat(allocatedAmount) || 0,
      period: 'monthly',
      warningThresholdPct: parseFloat(warningThresholdPct) || 80,
    });
    setName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Budgets & Limits</h2>
          <p className="text-xs text-slate-400 mt-1">
            Envelope budgeting with real-time expenditure monitoring and threshold warnings.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Budget Envelope</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = transactions
            .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId && t.status !== 'void')
            .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, activeOrg.baseCurrency), 0);
          const pct = Math.round((spent / b.allocatedAmount) * 100);
          const remaining = Math.max(0, b.allocatedAmount - spent);
          const isOver = spent > b.allocatedAmount;
          const isWarning = pct >= b.warningThresholdPct;

          return (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{b.name}</h3>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {b.period} cycle • Warning threshold {b.warningThresholdPct}%
                  </span>
                </div>
                {isOver ? (
                  <span className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="h-3 w-3" /> Over Budget
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-3 w-3" /> High Burn
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-3 w-3" /> Healthy
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-400">
                    Spent: <strong className="text-white">{formatCurrency(spent, activeOrg.baseCurrency)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Limit: <strong className="text-white">{formatCurrency(b.allocatedAmount, activeOrg.baseCurrency)}</strong>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                <span>{pct}% utilized</span>
                <span>
                  Remaining:{' '}
                  <strong className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                    {formatCurrency(remaining, activeOrg.baseCurrency)}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Budget Envelope</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Budget Envelope Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing & Digital Ads"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Allocated Limit ({activeOrg.baseCurrency})
                </label>
                <input
                  type="number"
                  required
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
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
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
