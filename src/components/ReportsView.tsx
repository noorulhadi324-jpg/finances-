import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { Transaction, Account, Category, Organization } from '../types/finance';
import { formatCurrency, convertCurrency, calculateCashFlow, calculateNetWorth } from '../lib/financialMath';

interface ReportsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  activeOrg: Organization;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  accounts,
  categories,
  activeOrg,
}) => {
  const [reportType, setReportType] = useState<'income_statement' | 'balance_sheet' | 'category_breakdown'>('income_statement');

  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts, activeOrg.baseCurrency);
  const { totalIncome, totalExpenses, netCashFlow, savingsRate } = calculateCashFlow(transactions, activeOrg.baseCurrency);

  // Group expenses by category
  const expensesByCat: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' && t.status !== 'void')
    .forEach((t) => {
      const catObj = categories.find((c) => c.id === t.categoryId);
      const name = catObj?.name || 'General Expense';
      const amt = convertCurrency(t.amount, t.currency, activeOrg.baseCurrency);
      expensesByCat[name] = (expensesByCat[name] || 0) + amt;
    });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Statements & Reports</h2>
          <p className="text-xs text-slate-400 mt-1">
            Certified accounting reports generated from verified ledger transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setReportType('income_statement')}
          className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
            reportType === 'income_statement'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Income Statement (Profit & Loss)
        </button>
        <button
          onClick={() => setReportType('balance_sheet')}
          className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
            reportType === 'balance_sheet'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setReportType('category_breakdown')}
          className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
            reportType === 'category_breakdown'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Expense Classification Breakdown
        </button>
      </div>

      {/* REPORT 1: INCOME STATEMENT */}
      {reportType === 'income_statement' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 backdrop-blur max-w-3xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              Standard Financial Report
            </span>
            <h3 className="text-xl font-black text-white mt-1">Statement of Profit and Loss</h3>
            <p className="text-xs text-slate-400">{activeOrg.name} • Currency: {activeOrg.baseCurrency}</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue Section */}
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                1. Operating Revenue & Inflow
              </h4>
              <div className="divide-y divide-slate-800/60 pl-2">
                <div className="flex justify-between py-2 text-slate-300">
                  <span>Gross Operating Collections</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(totalIncome, activeOrg.baseCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-cyan-400 font-bold">
                  <span>Total Operating Revenue</span>
                  <span className="font-mono">
                    {formatCurrency(totalIncome, activeOrg.baseCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                2. Operating Expenses
              </h4>
              <div className="divide-y divide-slate-800/60 pl-2">
                {Object.entries(expensesByCat).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between py-2 text-slate-300">
                    <span>{cat}</span>
                    <span className="font-mono text-slate-300">
                      {formatCurrency(amt, activeOrg.baseCurrency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-rose-400 font-bold">
                  <span>Total Operating Expenses</span>
                  <span className="font-mono">
                    ({formatCurrency(totalExpenses, activeOrg.baseCurrency)})
                  </span>
                </div>
              </div>
            </div>

            {/* Net Operating Income */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex justify-between items-center text-sm font-bold font-mono">
              <span className="text-white">Net Operating Profit / (Loss)</span>
              <span className={netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(netCashFlow, activeOrg.baseCurrency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: BALANCE SHEET */}
      {reportType === 'balance_sheet' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 backdrop-blur max-w-3xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              Balance Sheet Statement
            </span>
            <h3 className="text-xl font-black text-white mt-1">Consolidated Statement of Financial Position</h3>
            <p className="text-xs text-slate-400">{activeOrg.name} • Currency: {activeOrg.baseCurrency}</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                Assets
              </h4>
              <div className="divide-y divide-slate-800/60 pl-2">
                {accounts.filter((a) => a.balance >= 0 && a.type !== 'credit_card').map((acc) => (
                  <div key={acc.id} className="flex justify-between py-2 text-slate-300">
                    <span>{acc.name} ({acc.institutionName})</span>
                    <span className="font-mono text-white">
                      {formatCurrency(convertCurrency(acc.balance, acc.currency, activeOrg.baseCurrency), activeOrg.baseCurrency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-emerald-400 font-bold">
                  <span>Total Liquid Assets</span>
                  <span className="font-mono">
                    {formatCurrency(totalAssets, activeOrg.baseCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                Liabilities & Short-Term Obligations
              </h4>
              <div className="divide-y divide-slate-800/60 pl-2">
                <div className="flex justify-between py-2 text-slate-300">
                  <span>Current Credit Lines & Short-term Payables</span>
                  <span className="font-mono text-rose-400">
                    {formatCurrency(totalLiabilities, activeOrg.baseCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-rose-400 font-bold">
                  <span>Total Liabilities</span>
                  <span className="font-mono">
                    {formatCurrency(totalLiabilities, activeOrg.baseCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 flex justify-between items-center text-sm font-bold font-mono">
              <span className="text-white">Net Equity / Net Worth (Assets - Liabilities)</span>
              <span className="text-cyan-400 font-black">
                {formatCurrency(netWorth, activeOrg.baseCurrency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: CATEGORY BREAKDOWN */}
      {reportType === 'category_breakdown' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white">Expenditure Allocation by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(expensesByCat).map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={cat} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat}</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(amt, activeOrg.baseCurrency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 block">{pct}% of total period expenses</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
