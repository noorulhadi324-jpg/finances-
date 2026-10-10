import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Account, Category, CurrencyCode, TransactionType, Organization } from '../types/finance';

interface NewTransactionModalProps {
  accounts: Account[];
  categories: Category[];
  activeOrg: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    currency: CurrencyCode;
    accountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    payeeOrPayer: string;
    referenceNumber: string;
    notes: string;
    date: string;
  }) => void;
  initialType?: TransactionType;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  accounts,
  categories,
  activeOrg,
  isOpen,
  onClose,
  onSubmit,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(activeOrg.baseCurrency);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [payeeOrPayer, setPayeeOrPayer] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onSubmit({
      type,
      amount: parsedAmount,
      currency,
      accountId,
      destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
      categoryId: type === 'transfer' ? undefined : categoryId,
      payeeOrPayer: payeeOrPayer || (type === 'transfer' ? 'Internal Account Transfer' : 'General Transaction'),
      referenceNumber,
      notes,
      date,
    });
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">Record Financial Transaction</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Transaction Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition ${
                type === 'income'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" /> Income
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition ${
                type === 'transfer'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" /> Transfer
            </button>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1 font-semibold">Amount</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-base font-bold text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="PKR">PKR (Rs)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
          </div>

          {/* Accounts */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Debit Source Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Credit Destination Account</label>
                <select
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                >
                  {accounts.filter((a) => a.id !== accountId).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Payee / Description & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">
                {type === 'income' ? 'Payer / Client' : type === 'expense' ? 'Payee / Merchant' : 'Reference'}
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? 'Client Name' : 'Merchant Name'}
                value={payeeOrPayer}
                onChange={(e) => setPayeeOrPayer(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>
          </div>

          {/* Notes & Reference Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Reference / Invoice #</label>
              <input
                type="text"
                placeholder="e.g. CHQ-9921 / WIRE"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Notes / Memo</label>
              <input
                type="text"
                placeholder="Optional description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
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
              className="rounded-lg bg-emerald-500 px-5 py-2 font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Post Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
