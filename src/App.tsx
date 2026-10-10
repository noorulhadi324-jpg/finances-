/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_INVOICES,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_AUDIT_LOGS,
} from './lib/mockDatabase';
import {
  Organization,
  Account,
  Category,
  Transaction,
  Budget,
  FinancialGoal,
  Invoice,
  ChartOfAccount,
  JournalEntry,
  AuditLog,
  UserRole,
  TransactionType,
  CurrencyCode,
} from './types/finance';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { InvoicesView } from './components/InvoicesView';
import { AccountingView } from './components/AccountingView';
import { ReportsView } from './components/ReportsView';
import { ArchitectureView } from './components/ArchitectureView';
import { AuditView } from './components/AuditView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { NewAccountModal } from './components/NewAccountModal';
import { NewJournalEntryModal } from './components/NewJournalEntryModal';
import { ApiConfigModal, getStoredApiConfig } from './components/ApiConfigModal';
import { convertCurrency } from './lib/financialMath';

export default function App() {
  // Navigation & Layout
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tenant & Session state
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('finova_orgs');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS;
  });
  const [activeOrg, setActiveOrg] = useState<Organization>(organizations[0]);
  const [userRole, setUserRole] = useState<UserRole>('owner');

  // Backend API state
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Financial Datasets
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('finova_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finova_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finova_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finova_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('finova_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('finova_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(() => {
    const saved = localStorage.getItem('finova_coa');
    return saved ? JSON.parse(saved) : INITIAL_CHART_OF_ACCOUNTS;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('finova_journal');
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('finova_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [txModalInitialType, setTxModalInitialType] = useState<TransactionType>('expense');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isNewJournalModalOpen, setIsNewJournalModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Sync API status on mount
  useEffect(() => {
    const cfg = getStoredApiConfig();
    setIsBackendConnected(cfg.isConnected);
  }, []);

  // Save changes to localStorage for persistent state across refreshes
  useEffect(() => {
    localStorage.setItem('finova_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finova_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finova_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finova_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finova_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('finova_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('finova_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Record a general transaction (Income, Expense, or Transfer) with atomic balance reconciliation
  const handleCreateTransaction = (data: {
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
  }) => {
    const baseAmount = convertCurrency(data.amount, data.currency, activeOrg.baseCurrency);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      orgId: activeOrg.id,
      accountId: data.accountId,
      destinationAccountId: data.destinationAccountId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      exchangeRate: 1,
      baseCurrencyAmount: baseAmount,
      feeAmount: 0,
      date: data.date,
      payeeOrPayer: data.payeeOrPayer,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      status: 'cleared',
      createdAt: new Date().toISOString(),
    };

    // Reconcile account balances atomically
    setAccounts((prev) =>
      prev.map((acc) => {
        if (data.type === 'income' && acc.id === data.accountId) {
          const delta = convertCurrency(data.amount, data.currency, acc.currency);
          return { ...acc, balance: acc.balance + delta };
        }
        if (data.type === 'expense' && acc.id === data.accountId) {
          const delta = convertCurrency(data.amount, data.currency, acc.currency);
          return { ...acc, balance: acc.balance - delta };
        }
        if (data.type === 'transfer') {
          if (acc.id === data.accountId) {
            const delta = convertCurrency(data.amount, data.currency, acc.currency);
            return { ...acc, balance: acc.balance - delta };
          }
          if (acc.id === data.destinationAccountId) {
            const delta = convertCurrency(data.amount, data.currency, acc.currency);
            return { ...acc, balance: acc.balance + delta };
          }
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

    // Record audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      orgId: activeOrg.id,
      action: data.type === 'transfer' ? 'EXECUTE_TRANSFER' : 'CREATE_TRANSACTION',
      entityName: 'transactions',
      entityId: newTx.id,
      details: `${data.type.toUpperCase()}: ${data.currency} ${data.amount} (${data.payeeOrPayer})`,
      timestamp: new Date().toISOString(),
      userEmail: 'noorulhadi324@gmail.com',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Add Account
  const handleAddAccount = (data: Omit<Account, 'id' | 'balance' | 'isArchived'>) => {
    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      ...data,
      balance: data.initialBalance,
      isArchived: false,
    };
    setAccounts((prev) => [...prev, newAcc]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        orgId: activeOrg.id,
        action: 'CREATE_ACCOUNT',
        entityName: 'accounts',
        entityId: newAcc.id,
        details: `Opened ${newAcc.name} (${newAcc.currency}) with initial balance ${newAcc.initialBalance}`,
        timestamp: new Date().toISOString(),
        userEmail: 'noorulhadi324@gmail.com',
      },
      ...prev,
    ]);
  };

  const handleArchiveAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isArchived: !a.isArchived } : a))
    );
  };

  // Post Journal Entry
  const handlePostJournalEntry = (data: {
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
  }) => {
    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      orgId: activeOrg.id,
      entryNumber: data.entryNumber,
      entryDate: data.entryDate,
      memo: data.memo,
      isPosted: true,
      lines: data.lines.map((l, idx) => ({ id: `jel-${Date.now()}-${idx}`, ...l })),
      createdAt: new Date().toISOString(),
    };

    setJournalEntries((prev) => [newJE, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        orgId: activeOrg.id,
        action: 'POST_JOURNAL_ENTRY',
        entityName: 'journal_entries',
        entityId: newJE.id,
        details: `Posted balanced journal entry ${newJE.entryNumber}: "${newJE.memo}"`,
        timestamp: new Date().toISOString(),
        userEmail: 'noorulhadi324@gmail.com',
      },
      ...prev,
    ]);
  };

  // Add Budget
  const handleAddBudget = (b: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      id: `bud-${Date.now()}`,
      ...b,
    };
    setBudgets((prev) => [...prev, newB]);
  };

  // Add Goal & Contribution
  const handleAddGoal = (g: Omit<FinancialGoal, 'id' | 'isCompleted'>) => {
    const newG: FinancialGoal = {
      id: `goal-${Date.now()}`,
      ...g,
      isCompleted: false,
    };
    setGoals((prev) => [...prev, newG]);
  };

  const handleContributeToGoal = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newTotal = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: newTotal,
          isCompleted: newTotal >= g.targetAmount,
        };
      })
    );
  };

  // Add Invoice & Mark Paid
  const handleAddInvoice = (inv: Omit<Invoice, 'id'>) => {
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      ...inv,
    };
    setInvoices((prev) => [newInv, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        orgId: activeOrg.id,
        action: 'CREATE_INVOICE',
        entityName: 'invoices',
        entityId: newInv.id,
        details: `Issued invoice ${newInv.invoiceNumber} to ${newInv.clientName} for ${newInv.currency} ${newInv.totalAmount}`,
        timestamp: new Date().toISOString(),
        userEmail: 'noorulhadi324@gmail.com',
      },
      ...prev,
    ]);
  };

  const handleMarkInvoicePaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'paid', amountPaid: i.totalAmount } : i))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeOrg={activeOrg}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Executive Header */}
        <Header
          organizations={organizations}
          activeOrg={activeOrg}
          onSelectOrg={setActiveOrg}
          userRole={userRole}
          onChangeRole={setUserRole}
          onOpenNewTxModal={() => {
            setTxModalInitialType('expense');
            setIsNewTxModalOpen(true);
          }}
          onOpenNewTransferModal={() => {
            setTxModalInitialType('transfer');
            setIsNewTxModalOpen(true);
          }}
          onOpenJournalModal={() => setIsNewJournalModalOpen(true)}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          isBackendConnected={isBackendConnected}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 scrollbar-thin scrollbar-thumb-slate-800">
          {currentTab === 'dashboard' && (
            <DashboardView
              accounts={accounts}
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              invoices={invoices}
              activeOrg={activeOrg}
              onOpenNewTxModal={() => {
                setTxModalInitialType('expense');
                setIsNewTxModalOpen(true);
              }}
              onOpenNewTransferModal={() => {
                setTxModalInitialType('transfer');
                setIsNewTxModalOpen(true);
              }}
              onOpenNewInvoiceModal={() => setCurrentTab('invoices')}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              activeOrg={activeOrg}
              onOpenNewAccountModal={() => setIsNewAccountModalOpen(true)}
              onOpenTransferModal={() => {
                setTxModalInitialType('transfer');
                setIsNewTxModalOpen(true);
              }}
              onArchiveAccount={handleArchiveAccount}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              activeOrg={activeOrg}
              onOpenNewTxModal={() => {
                setTxModalInitialType('expense');
                setIsNewTxModalOpen(true);
              }}
              onOpenTransferModal={() => {
                setTxModalInitialType('transfer');
                setIsNewTxModalOpen(true);
              }}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              activeOrg={activeOrg}
              onAddBudget={handleAddBudget}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              goals={goals}
              activeOrg={activeOrg}
              onAddGoal={handleAddGoal}
              onContributeToGoal={handleContributeToGoal}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              activeOrg={activeOrg}
              onAddInvoice={handleAddInvoice}
              onMarkPaid={handleMarkInvoicePaid}
            />
          )}

          {currentTab === 'accounting' && (
            <AccountingView
              chartOfAccounts={chartOfAccounts}
              journalEntries={journalEntries}
              activeOrg={activeOrg}
              onOpenNewJournalModal={() => setIsNewJournalModalOpen(true)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              activeOrg={activeOrg}
            />
          )}

          {currentTab === 'architecture' && <ArchitectureView />}

          {currentTab === 'audit' && (
            <AuditView auditLogs={auditLogs} activeOrg={activeOrg} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewTransactionModal
        accounts={accounts}
        categories={categories}
        activeOrg={activeOrg}
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
        initialType={txModalInitialType}
      />

      <NewAccountModal
        activeOrg={activeOrg}
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      <NewJournalEntryModal
        chartOfAccounts={chartOfAccounts}
        activeOrg={activeOrg}
        isOpen={isNewJournalModalOpen}
        onClose={() => setIsNewJournalModalOpen(false)}
        onSubmit={handlePostJournalEntry}
      />

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onConfigUpdated={() => {
          const cfg = getStoredApiConfig();
          setIsBackendConnected(cfg.isConnected);
        }}
      />
    </div>
  );
}
