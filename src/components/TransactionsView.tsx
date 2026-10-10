import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Transaction, Account, Category, Organization, TransactionType } from '../types/finance';
import { formatCurrency, convertCurrency } from '../lib/financialMath';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  activeOrg: Organization;
  onOpenNewTxModal: () => void;
  onOpenTransferModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  activeOrg,
  onOpenNewTxModal,
  onOpenTransferModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (selectedAccount !== 'all' && tx.accountId !== selectedAccount && tx.destinationAccountId !== selectedAccount)
      return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const payeeMatch = tx.payeeOrPayer?.toLowerCase().includes(q);
      const notesMatch = tx.notes?.toLowerCase().includes(q);
      const refMatch = tx.referenceNumber?.toLowerCase().includes(q);
      if (!payeeMatch && !notesMatch && !refMatch) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Payee/Payer', 'Category', 'Account', 'Amount', 'Currency', 'Status', 'Reference'];
    const rows = filteredTransactions.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId)?.name || tx.accountId;
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || 'N/A';
      return [
        tx.date,
        tx.type,
        `"${tx.payeeOrPayer || ''}"`,
        `"${cat}"`,
        `"${acc}"`,
        tx.amount,
        tx.currency,
        tx.status,
        `"${tx.referenceNumber || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finova_transactions_${activeOrg.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Transactions & Transfers</h2>
          <p className="text-xs text-slate-400 mt-1">
            General transaction journal with multi-currency conversion and atomic account balance reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
            <span>Transfer</span>
          </button>
          <button
            onClick={onOpenNewTxModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search payee, ref, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payee / Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                  const destAcc = tx.destinationAccountId
                    ? accounts.find((a) => a.id === tx.destinationAccountId)
                    : null;
                  const cat = categories.find((c) => c.id === tx.categoryId);

                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{tx.payeeOrPayer}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tx.referenceNumber ? `Ref: ${tx.referenceNumber}` : tx.notes}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        {isTransfer ? (
                          <span className="text-xs">
                            {sourceAcc?.name} → {destAcc?.name}
                          </span>
                        ) : (
                          sourceAcc?.name || 'Unknown'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 capitalize">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
