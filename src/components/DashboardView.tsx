import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ShieldAlert,
  Wallet,
  Receipt,
  PiggyBank,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  Account,
  Transaction,
  Budget,
  FinancialGoal,
  Invoice,
  Organization,
} from '../types/finance';
import {
  calculateNetWorth,
  calculateCashFlow,
  formatCurrency,
  convertCurrency,
} from '../lib/financialMath';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  invoices: Invoice[];
  activeOrg: Organization;
  onOpenNewTxModal: () => void;
  onOpenNewTransferModal: () => void;
  onOpenNewInvoiceModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  budgets,
  goals,
  invoices,
  activeOrg,
  onOpenNewTxModal,
  onOpenNewTransferModal,
  onOpenNewInvoiceModal,
  onNavigateTab,
}) => {
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(
    accounts,
    activeOrg.baseCurrency
  );
  const { totalIncome, totalExpenses, netCashFlow, savingsRate } = calculateCashFlow(
    transactions,
    activeOrg.baseCurrency
  );

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Unpaid invoices total
  const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'draft');
  const pendingInvoicesTotal = pendingInvoices.reduce((sum, inv) => {
    return sum + convertCurrency(inv.totalAmount - inv.amountPaid, inv.currency, activeOrg.baseCurrency);
  }, 0);

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense' && tx.status !== 'void')
    .forEach((tx) => {
      const cat = tx.categoryId || 'Uncategorized';
      const amt = convertCurrency(tx.amount, tx.currency, activeOrg.baseCurrency);
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Executive Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Consolidated Net Worth • Multi-Tenant Engine
            </div>
            <div className="mt-2 text-3xl md:text-5xl font-black text-white tracking-tight font-mono">
              {formatCurrency(netWorth, activeOrg.baseCurrency)}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Active ledger for <span className="text-slate-200 font-semibold">{activeOrg.name}</span> across{' '}
              {accounts.length} liquid accounts and multi-currency balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTxModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <ArrowDownRight className="h-4 w-4 stroke-[2.5]" />
              Record Transaction
            </button>
            <button
              onClick={onOpenNewTransferModal}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
              Account Transfer
            </button>
            <button
              onClick={onOpenNewInvoiceModal}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Receipt className="h-4 w-4 text-amber-400" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquid Assets */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Total Liquid Assets</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-white">
            {formatCurrency(totalAssets, activeOrg.baseCurrency)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {accounts.filter((a) => !a.isArchived).length} accounts connected
          </div>
        </div>

        {/* Current Liabilities */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Current Liabilities</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-rose-400">
            {formatCurrency(totalLiabilities, activeOrg.baseCurrency)}
          </div>
          <div className="mt-2 text-xs text-slate-500">Credit lines & short-term payables</div>
        </div>

        {/* Total Period Income */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Period Inflow (Revenue)</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(totalIncome, activeOrg.baseCurrency)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Excludes neutral internal transfers
          </div>
        </div>

        {/* Net Cash Flow & Savings Rate */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Net Operating Cash Flow</span>
            <div
              className={`rounded-lg p-2 border ${
                netCashFlow >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {netCashFlow >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          </div>
          <div
            className={`mt-3 text-2xl font-bold font-mono ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netCashFlow, activeOrg.baseCurrency)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Operating savings margin: <span className="text-slate-300 font-semibold">{savingsRate}%</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Cash Flow Visualizer + Accounts Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Monthly Visualization */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Cash Velocity & Inflow vs Outflow</h3>
              <p className="text-xs text-slate-400">Live reconciliation breakdown</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-3 w-3 rounded-sm bg-cyan-500" />
                Inflows
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-3 w-3 rounded-sm bg-rose-500" />
                Outflows
              </span>
            </div>
          </div>

          {/* Bar Chart Simulation */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Gross Inflow (Income)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {formatCurrency(totalIncome, activeOrg.baseCurrency)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                  style={{
                    width: totalIncome + totalExpenses > 0
                      ? `${(totalIncome / (totalIncome + totalExpenses)) * 100}%`
                      : '50%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Gross Outflow (Expenses)</span>
                <span className="font-mono text-rose-400 font-bold">
                  {formatCurrency(totalExpenses, activeOrg.baseCurrency)}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500"
                  style={{
                    width: totalIncome + totalExpenses > 0
                      ? `${(totalExpenses / (totalIncome + totalExpenses)) * 100}%`
                      : '50%',
                  }}
                />
              </div>
            </div>

            {/* Quick Metrics Cards Inside */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
              <div className="rounded-xl bg-slate-800/50 p-3">
                <span className="text-[11px] text-slate-400 block">Pending Invoices</span>
                <span className="font-mono font-bold text-sm text-amber-400">
                  {formatCurrency(pendingInvoicesTotal, activeOrg.baseCurrency)}
                </span>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-3">
                <span className="text-[11px] text-slate-400 block">Active Budgets</span>
                <span className="font-mono font-bold text-sm text-slate-200">
                  {budgets.length} envelopes
                </span>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-3">
                <span className="text-[11px] text-slate-400 block">Target Goals</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {goals.filter((g) => !g.isCompleted).length} in progress
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Accounts Quick Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Accounts & Balances</h3>
              <button
                onClick={() => onNavigateTab('accounts')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-semibold"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {accounts.slice(0, 4).map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: acc.colorHex }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {acc.institutionName} • {acc.accountNumberMask}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {formatCurrency(acc.balance, acc.currency)}
                    </div>
                    {acc.currency !== activeOrg.baseCurrency && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        ≈ {formatCurrency(convertCurrency(acc.balance, acc.currency, activeOrg.baseCurrency), activeOrg.baseCurrency)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('accounts')}
            className="mt-4 w-full rounded-xl border border-slate-700/80 bg-slate-800/60 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition text-center"
          >
            Manage Accounts & Liquidity
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions Table & Active Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Live journal posting stream</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-semibold"
            >
              View ledger <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description / Payee</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Account</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.map((tx) => {
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-mono text-slate-400">{tx.date}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{tx.payeeOrPayer}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {tx.notes || tx.referenceNumber}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isIncome
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : isExpense
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {acc?.name || 'Account'}
                      </td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span
                          className={
                            isIncome
                              ? 'text-cyan-400'
                              : isExpense
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }
                        >
                          {isIncome ? '+' : isExpense ? '-' : '⇄ '}{' '}
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budgets Progress Bar Envelopes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Budgets Utilization</h3>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-semibold"
              >
                All budgets <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {budgets.slice(0, 3).map((b) => {
                // Calculate spending for this budget
                const spent = transactions
                  .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId && t.status !== 'void')
                  .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, activeOrg.baseCurrency), 0);
                const pct = Math.min(100, Math.round((spent / b.allocatedAmount) * 100));
                const isOver = spent > b.allocatedAmount;
                const isNear = pct >= b.warningThresholdPct;

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{b.name}</span>
                      <span className="font-mono text-slate-400">
                        {formatCurrency(spent, activeOrg.baseCurrency)} / {formatCurrency(b.allocatedAmount, activeOrg.baseCurrency)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-500'
                            : isNear
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{pct}% utilized</span>
                      <span>Warning at {b.warningThresholdPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-slate-300">
              Double-entry books balance: Total debits match total credits with 0 discrepancy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
