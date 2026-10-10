import React from 'react';
import {
  Building2,
  Shield,
  Activity,
  Plus,
  ArrowLeftRight,
  BookPlus,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Organization, UserRole, CurrencyCode } from '../types/finance';
import { EXCHANGE_RATES_TO_USD } from '../lib/financialMath';

interface HeaderProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenNewTxModal: () => void;
  onOpenNewTransferModal: () => void;
  onOpenJournalModal: () => void;
  onOpenApiModal: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  userRole,
  onChangeRole,
  onOpenNewTxModal,
  onOpenNewTransferModal,
  onOpenJournalModal,
  onOpenApiModal,
  isBackendConnected,
}) => {
  const roles: UserRole[] = ['owner', 'admin', 'accountant', 'manager', 'member', 'readonly'];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 md:px-6 backdrop-blur-xl">
      {/* Left: Organization Switcher & Role Selector */}
      <div className="flex items-center gap-3">
        {/* Workspace Dropdown */}
        <div className="relative">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Organization (Tenant)
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-slate-600 transition">
            <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <select
              value={activeOrg.id}
              onChange={(e) => {
                const found = organizations.find((o) => o.id === e.target.value);
                if (found) onSelectOrg(found);
              }}
              className="bg-transparent pr-4 font-semibold text-white focus:outline-none cursor-pointer"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-slate-900 text-white">
                  {org.name} ({org.baseCurrency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Simulator (RLS Testing) */}
        <div className="hidden sm:block">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Active Role (RLS Policy)
          </label>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/70 bg-slate-800/80 px-2.5 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <select
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="bg-transparent font-medium capitalize text-slate-200 focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-white capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Middle: Currency Rates ticker (desktop) */}
      <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          FOREX:
        </span>
        <span>1 USD = {EXCHANGE_RATES_TO_USD.PKR} PKR</span>
        <span className="text-slate-600">|</span>
        <span>1 USD = {EXCHANGE_RATES_TO_USD.EUR} EUR</span>
        <span className="text-slate-600">|</span>
        <span>1 USD = {EXCHANGE_RATES_TO_USD.AED} AED</span>
      </div>

      {/* Right: Actions & System Status */}
      <div className="flex items-center gap-2">
        {/* Generic System Status Badge */}
        <button
          onClick={onOpenApiModal}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
            isBackendConnected
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
          }`}
          title="System Status — API Service"
        >
          <Activity className={`h-3.5 w-3.5 ${isBackendConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">
            {isBackendConnected ? 'System Status: Operational' : 'System Status: Offline'}
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
        </button>

        {/* Quick Add Dropdown / Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewTxModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-teal-500 transition"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Transaction</span>
          </button>

          <button
            onClick={onOpenNewTransferModal}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            title="Transfer between accounts"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
            <span>Transfer</span>
          </button>

          <button
            onClick={onOpenJournalModal}
            className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            title="Post double-entry journal entry"
          >
            <BookPlus className="h-3.5 w-3.5 text-amber-400" />
            <span>Journal</span>
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-[11px] font-black text-white shadow">
            NH
          </div>
        </div>
      </div>
    </header>
  );
};
