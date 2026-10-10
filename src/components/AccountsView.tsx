import React, { useState } from 'react';
import {
  Wallet,
  Building,
  CreditCard,
  Smartphone,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Archive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Account, AccountType, CurrencyCode, Organization } from '../types/finance';
import { formatCurrency, convertCurrency } from '../lib/financialMath';

interface AccountsViewProps {
  accounts: Account[];
  activeOrg: Organization;
  onOpenNewAccountModal: () => void;
  onOpenTransferModal: () => void;
  onArchiveAccount: (id: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  activeOrg,
  onOpenNewAccountModal,
  onOpenTransferModal,
  onArchiveAccount,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAccounts = accounts.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building className="h-5 w-5" />;
      case 'cash':
        return <DollarSign className="h-5 w-5" />;
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'digital_wallet':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Accounts & Liquidity</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-currency bank accounts, cash vaults, wallets, and credit facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
            <span>Account Transfer</span>
          </button>
          <button
            onClick={onOpenNewAccountModal}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'bank', 'cash', 'savings', 'credit_card', 'digital_wallet'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 font-semibold capitalize transition ${
              filterType === t
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isNegative = acc.balance < 0;
          const isCredit = acc.type === 'credit_card';

          return (
            <div
              key={acc.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur hover:border-slate-700 transition group flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow"
                      style={{ backgroundColor: acc.colorHex }}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{acc.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {acc.institutionName} • {acc.accountNumberMask}
                      </p>
                    </div>
                  </div>

                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 uppercase">
                    {acc.currency}
                  </span>
                </div>

                {/* Balance display */}
                <div className="mt-5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                    {isCredit ? 'Current Outstanding Balance' : 'Available Liquidity'}
                  </span>
                  <div
                    className={`mt-1 text-2xl font-black font-mono tracking-tight ${
                      isNegative ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                  {acc.currency !== activeOrg.baseCurrency && (
                    <div className="mt-1 text-xs text-slate-400 font-mono">
                      ≈ {formatCurrency(convertCurrency(acc.balance, acc.currency, activeOrg.baseCurrency), activeOrg.baseCurrency)}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer details & actions */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">{acc.type.replace('_', ' ')}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onArchiveAccount(acc.id)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition"
                    title="Archive account"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
