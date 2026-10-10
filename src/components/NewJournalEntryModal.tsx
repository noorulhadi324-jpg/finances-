import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChartOfAccount, Organization } from '../types/finance';
import { formatCurrency, isJournalEntryBalanced } from '../lib/financialMath';

interface NewJournalEntryModalProps {
  chartOfAccounts: ChartOfAccount[];
  activeOrg: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    entryNumber: string;
    memo: string;
    entryDate: string;
    lines: {
      chartOfAccountId: string;
      accountName: string;
      debit: number;
      credit: number;
      description?: string;
    }[];
  }) => void;
}

export const NewJournalEntryModal: React.FC<NewJournalEntryModalProps> = ({
  chartOfAccounts,
  activeOrg,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [memo, setMemo] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryNumber, setEntryNumber] = useState(
    `JE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );

  const [lines, setLines] = useState<
    { id: string; chartOfAccountId: string; debit: number; credit: number; description: string }[]
  >([
    {
      id: '1',
      chartOfAccountId: chartOfAccounts[0]?.id || '',
      debit: 50000,
      credit: 0,
      description: 'Debit allocation',
    },
    {
      id: '2',
      chartOfAccountId: chartOfAccounts[1]?.id || '',
      debit: 0,
      credit: 50000,
      description: 'Credit balancing',
    },
  ]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        chartOfAccountId: chartOfAccounts[0]?.id || '',
        debit: 0,
        credit: 0,
        description: '',
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const handleLineChange = (
    id: string,
    field: 'chartOfAccountId' | 'debit' | 'credit' | 'description',
    val: any
  ) => {
    setLines(
      lines.map((l) => {
        if (l.id !== id) return l;
        if (field === 'debit') {
          return { ...l, debit: Number(val) || 0, credit: 0 }; // one-sided per line standard
        }
        if (field === 'credit') {
          return { ...l, credit: Number(val) || 0, debit: 0 };
        }
        return { ...l, [field]: val };
      })
    );
  };

  const balanceCheck = isJournalEntryBalanced(lines);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceCheck.isBalanced) return;

    const formattedLines = lines.map((l) => {
      const coa = chartOfAccounts.find((c) => c.id === l.chartOfAccountId);
      return {
        chartOfAccountId: l.chartOfAccountId,
        accountName: coa ? `${coa.code} ${coa.name}` : 'Unknown Account',
        debit: l.debit,
        credit: l.credit,
        description: l.description,
      };
    });

    onSubmit({
      entryNumber,
      memo,
      entryDate,
      lines: formattedLines,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Post Double-Entry Journal Entry</h3>
            <p className="text-xs text-slate-400">
              Strict accounting invariant: Total Debits must mathematically equal Total Credits.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Entry Number</label>
              <input
                type="text"
                required
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Posting Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Description / Memo</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Cloud Hosting Settlement"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>
          </div>

          {/* Ledger Lines */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">Journal Lines</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line) => (
                <div key={line.id} className="flex gap-2 items-center">
                  <select
                    value={line.chartOfAccountId}
                    onChange={(e) => handleLineChange(line.id, 'chartOfAccountId', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                  >
                    {chartOfAccounts.map((coa) => (
                      <option key={coa.id} value={coa.id}>
                        {coa.code} - {coa.name} ({coa.type})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Debit"
                    value={line.debit || ''}
                    onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                    className="w-24 rounded-lg border border-slate-800 bg-slate-950 p-2 text-right font-mono text-emerald-400"
                  />

                  <input
                    type="number"
                    placeholder="Credit"
                    value={line.credit || ''}
                    onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                    className="w-24 rounded-lg border border-slate-800 bg-slate-950 p-2 text-right font-mono text-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(line.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Balance Equilibrium Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex justify-between font-mono font-bold text-xs">
              <span className="text-slate-400">
                Total Debits: <strong className="text-emerald-400">{formatCurrency(balanceCheck.totalDebits, activeOrg.baseCurrency)}</strong>
              </span>
              <span className="text-slate-400">
                Total Credits: <strong className="text-cyan-400">{formatCurrency(balanceCheck.totalCredits, activeOrg.baseCurrency)}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                {balanceCheck.isBalanced ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Entry is perfectly balanced
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <AlertCircle className="h-4 w-4" /> Discrepancy: {formatCurrency(balanceCheck.difference, activeOrg.baseCurrency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!balanceCheck.isBalanced}
              className={`rounded-lg px-5 py-2 font-bold transition ${
                balanceCheck.isBalanced
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Post to General Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
