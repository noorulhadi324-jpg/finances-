import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Scale,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ChartOfAccount,
  JournalEntry,
  Organization,
} from '../types/finance';
import { formatCurrency, isJournalEntryBalanced } from '../lib/financialMath';

interface AccountingViewProps {
  chartOfAccounts: ChartOfAccount[];
  journalEntries: JournalEntry[];
  activeOrg: Organization;
  onOpenNewJournalModal: () => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  chartOfAccounts,
  journalEntries,
  activeOrg,
  onOpenNewJournalModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'journal' | 'trial_balance' | 'chart'>('journal');

  // Compute trial balance
  const trialBalanceMap: Record<string, { code: string; name: string; type: string; debit: number; credit: number }> = {};

  chartOfAccounts.forEach((coa) => {
    trialBalanceMap[coa.id] = {
      code: coa.code,
      name: coa.name,
      type: coa.type,
      debit: 0,
      credit: 0,
    };
  });

  journalEntries.forEach((je) => {
    if (!je.isPosted) return;
    je.lines.forEach((l) => {
      if (trialBalanceMap[l.chartOfAccountId]) {
        trialBalanceMap[l.chartOfAccountId].debit += l.debit;
        trialBalanceMap[l.chartOfAccountId].credit += l.credit;
      }
    });
  });

  const trialBalanceRows = Object.values(trialBalanceMap).filter((r) => r.debit > 0 || r.credit > 0);
  const totalDebits = trialBalanceRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredits = trialBalanceRows.reduce((sum, r) => sum + r.credit, 0);
  const difference = Math.abs(totalDebits - totalCredits);
  const isBalanced = difference < 0.01;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Double-Entry General Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise double-entry bookkeeping with strict Debits = Credits mathematical guarantee.
          </p>
        </div>

        <button
          onClick={onOpenNewJournalModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Post Journal Entry</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('journal')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeSubTab === 'journal'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpenCheck className="h-4 w-4" />
          <span>Journal Entries ({journalEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trial_balance')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeSubTab === 'trial_balance'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Trial Balance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chart')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeSubTab === 'chart'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Chart of Accounts ({chartOfAccounts.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: JOURNAL ENTRIES */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          {journalEntries.map((je) => {
            const entryCheck = isJournalEntryBalanced(je.lines);
            return (
              <div
                key={je.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
                      {je.entryNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{je.memo}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Date: {je.entryDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Posted & Locked
                    </span>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 font-semibold border-b border-slate-800/60">
                        <th className="pb-2">Account</th>
                        <th className="pb-2">Description</th>
                        <th className="pb-2 text-right">Debit ({activeOrg.baseCurrency})</th>
                        <th className="pb-2 text-right">Credit ({activeOrg.baseCurrency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {je.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-2.5 font-semibold text-slate-200">{l.accountName}</td>
                          <td className="py-2.5 text-slate-400">{l.description || '—'}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                            {l.debit > 0 ? formatCurrency(l.debit, activeOrg.baseCurrency) : '—'}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-cyan-400">
                            {l.credit > 0 ? formatCurrency(l.credit, activeOrg.baseCurrency) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-800 font-mono font-bold text-white">
                        <td colSpan={2} className="pt-3 text-slate-400">
                          Total (Debits = Credits)
                        </td>
                        <td className="pt-3 text-right text-emerald-400">
                          {formatCurrency(entryCheck.totalDebits, activeOrg.baseCurrency)}
                        </td>
                        <td className="pt-3 text-right text-cyan-400">
                          {formatCurrency(entryCheck.totalCredits, activeOrg.baseCurrency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: TRIAL BALANCE */}
      {activeSubTab === 'trial_balance' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Trial Balance Statement</h3>
                <p className="text-xs text-slate-400">
                  Verification of mathematical equilibrium in double-entry books.
                </p>
              </div>

              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border ${
                  isBalanced
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}
              >
                {isBalanced ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{isBalanced ? 'Books in Perfect Balance' : 'Out of Balance Warning'}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Account Code</th>
                    <th className="py-3 px-3">Account Name</th>
                    <th className="py-3 px-3">Classification</th>
                    <th className="py-3 px-3 text-right">Debit Balance</th>
                    <th className="py-3 px-3 text-right">Credit Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {trialBalanceRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{r.code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{r.name}</td>
                      <td className="py-3 px-3 capitalize text-slate-400">{r.type}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {r.debit > 0 ? formatCurrency(r.debit, activeOrg.baseCurrency) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                        {r.credit > 0 ? formatCurrency(r.credit, activeOrg.baseCurrency) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-700 bg-slate-950/60 font-mono font-bold text-sm text-white">
                    <td colSpan={3} className="py-3 px-3 text-slate-300">
                      Consolidated Balance Totals
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400">
                      {formatCurrency(totalDebits, activeOrg.baseCurrency)}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-400">
                      {formatCurrency(totalCredits, activeOrg.baseCurrency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CHART OF ACCOUNTS */}
      {activeSubTab === 'chart' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur">
          <h3 className="text-lg font-bold text-white mb-1">Standard Chart of Accounts (COA)</h3>
          <p className="text-xs text-slate-400 mb-4">
            Structured GAAP / IFRS classification for asset, liability, equity, revenue, and expense ledgers.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Account Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Sub-Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {chartOfAccounts.map((coa) => (
                  <tr key={coa.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{coa.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{coa.name}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-semibold text-slate-400">{coa.type}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{coa.subType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
