import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Receipt,
  BookOpenCheck,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { Organization, UserRole } from '../types/finance';

export type NavTab =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'invoices'
  | 'accounting'
  | 'reports'
  | 'architecture'
  | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeOrg: Organization;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  activeOrg,
  userRole,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as NavTab, label: 'Accounts & Liquidity', icon: WalletCards },
    { id: 'transactions' as NavTab, label: 'Transactions & Transfers', icon: ArrowLeftRight },
    { id: 'budgets' as NavTab, label: 'Budgets & Limits', icon: PiggyBank },
    { id: 'goals' as NavTab, label: 'Savings Goals', icon: Target },
    { id: 'invoices' as NavTab, label: 'Invoicing & Receivables', icon: Receipt },
    { id: 'accounting' as NavTab, label: 'General Ledger (Double-Entry)', icon: BookOpenCheck },
    { id: 'reports' as NavTab, label: 'Financial Statements', icon: FileSpreadsheet },
    { id: 'architecture' as NavTab, label: 'Clean Arch & REST API Hub', icon: Layers, badge: 'REST' },
    { id: 'audit' as NavTab, label: 'Audit Trail & Security', icon: ShieldCheck },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Coins className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-lg font-['Plus_Jakarta_Sans']">
                  FINOVA
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Cross-Platform Core</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className={`px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Core Financial Modules'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform ${
                  isActive ? 'text-emerald-400 scale-105' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tenant / Organization Card */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Active Workspace</span>
              <span className="font-mono text-emerald-400 font-bold">{activeOrg.baseCurrency}</span>
            </div>
            <div className="font-semibold text-slate-200 text-xs truncate">{activeOrg.name}</div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 font-mono">
                {activeOrg.taxIdentifier}
              </span>
              <span className="capitalize text-emerald-400 font-semibold">{userRole}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 text-center">
          <span className="text-[10px] font-mono text-emerald-400 font-bold">{activeOrg.baseCurrency}</span>
        </div>
      )}
    </aside>
  );
};
