import React, { useState } from 'react';
import { X, Building2, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { Account, AccountType, CurrencyCode, Organization } from '../types/finance';

interface NewAccountModalProps {
  activeOrg: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: Omit<Account, 'id' | 'balance' | 'isArchived'>) => void;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  activeOrg,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [institutionName, setInstitutionName] = useState('');
  const [accountNumberMask, setAccountNumberMask] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(activeOrg.baseCurrency);
  const [initialBalance, setInitialBalance] = useState('0');
  const [colorHex, setColorHex] = useState('#059669');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      orgId: activeOrg.id,
      name,
      type,
      institutionName: institutionName || 'Internal Treasury',
      accountNumberMask: accountNumberMask ? `•••• ${accountNumberMask}` : '•••• 0000',
      currency,
      initialBalance: parseFloat(initialBalance) || 0,
      colorHex,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">Create Financial Account</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Account Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Meezan Escrow Reserve"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Classification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              >
                <option value="bank">Commercial Bank</option>
                <option value="cash">Petty Cash / Vault</option>
                <option value="savings">Treasury Savings</option>
                <option value="credit_card">Corporate Credit Line</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-white"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Financial Institution</label>
              <input
                type="text"
                placeholder="e.g. Standard Chartered / HBL"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Last 4 Digits</label>
              <input
                type="text"
                maxLength={4}
                placeholder="9102"
                value={accountNumberMask}
                onChange={(e) => setAccountNumberMask(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white font-mono text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">
              Opening Initial Balance ({currency})
            </label>
            <input
              type="number"
              step="any"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Accent Tag Color</label>
            <div className="flex gap-2 items-center">
              {['#059669', '#2563eb', '#8b5cf6', '#dc2626', '#f59e0b', '#06b6d4'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorHex(c)}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    colorHex === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
