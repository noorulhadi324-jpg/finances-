import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  Building,
} from 'lucide-react';
import { Invoice, InvoiceItem, CurrencyCode, Organization } from '../types/finance';
import { formatCurrency } from '../lib/financialMath';

interface InvoicesViewProps {
  invoices: Invoice[];
  activeOrg: Organization;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onMarkPaid: (invoiceId: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  activeOrg,
  onAddInvoice,
  onMarkPaid,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [currency, setCurrency] = useState<CurrencyCode>(activeOrg.baseCurrency);
  const [taxRatePct, setTaxRatePct] = useState('5');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Financial Software Engineering & Consulting', quantity: 1, unitPrice: 250000, totalPrice: 250000 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = Number(field === 'quantity' ? val : updated.quantity) || 0;
          const p = Number(field === 'unitPrice' ? val : updated.unitPrice) || 0;
          updated.totalPrice = q * p;
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const taxAmount = Math.round(((subtotal * (Number(taxRatePct) || 0)) / 100) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceNum = `FIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    onAddInvoice({
      orgId: activeOrg.id,
      invoiceNumber: invoiceNum,
      clientName,
      clientEmail,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      currency,
      items,
      subtotal,
      taxRatePct: Number(taxRatePct) || 0,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      amountPaid: 0,
      status: 'sent',
      notes: 'Payment terms: Net 30. Wire instructions included on receipt.',
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Invoicing & Receivables</h2>
          <p className="text-xs text-slate-400 mt-1">
            Issue client invoices, track collection schedules, and generate printable audit receipts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-500">{inv.clientEmail}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : inv.status === 'sent'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 transition"
                      >
                        Receipt
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => onMarkPaid(inv.id)}
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-4">Create Commercial Invoice</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Client Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Labs"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Client Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="accounts@acme.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="PKR">PKR (Pakistani Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300">Invoice Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Description of deliverables"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-white"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-16 rounded-lg border border-slate-800 bg-slate-950 p-2 text-white text-center"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className="w-28 rounded-lg border border-slate-800 bg-slate-950 p-2 text-white font-mono text-right"
                      />
                      <span className="w-24 text-right font-mono font-bold text-white">
                        {formatCurrency(item.totalPrice, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-slate-800 pt-3 flex flex-col items-end gap-1 font-mono text-right">
                <div className="text-slate-400">
                  Subtotal: <span className="text-white font-bold">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Sales Tax Rate (%):</span>
                  <input
                    type="number"
                    value={taxRatePct}
                    onChange={(e) => setTaxRatePct(e.target.value)}
                    className="w-14 rounded border border-slate-800 bg-slate-950 p-1 text-center text-white"
                  />
                  <span className="text-white">{formatCurrency(taxAmount, currency)}</span>
                </div>
                <div className="text-sm font-black text-emerald-400 pt-1 border-t border-slate-800">
                  Total Payable: {formatCurrency(totalAmount, currency)}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-5 py-2 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  Commercial Invoice
                </span>
                <h3 className="text-xl font-black text-white">{previewInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-400 mt-1">{activeOrg.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">Tax ID: {activeOrg.taxIdentifier}</p>
              </div>

              <div className="text-right">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 uppercase">
                  {previewInvoice.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">Due: {previewInvoice.dueDate}</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Billed To</span>
              <p className="text-sm font-bold text-white">{previewInvoice.clientName}</p>
              <p className="text-xs text-slate-400">{previewInvoice.clientEmail}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {previewInvoice.items.map((i) => (
                    <tr key={i.id}>
                      <td className="p-3 font-sans text-slate-200">{i.description}</td>
                      <td className="p-3 text-center">{i.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(i.unitPrice, previewInvoice.currency)}</td>
                      <td className="p-3 text-right font-bold text-white">
                        {formatCurrency(i.totalPrice, previewInvoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-slate-500">{previewInvoice.notes}</span>
              <div className="text-right font-mono font-bold space-y-1">
                <div className="text-slate-400">
                  Subtotal: {formatCurrency(previewInvoice.subtotal, previewInvoice.currency)}
                </div>
                <div className="text-slate-400">
                  Tax ({previewInvoice.taxRatePct}%): {formatCurrency(previewInvoice.taxAmount, previewInvoice.currency)}
                </div>
                <div className="text-base text-emerald-400 font-black">
                  Total: {formatCurrency(previewInvoice.totalAmount, previewInvoice.currency)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="rounded-lg px-4 py-2 text-xs text-slate-400 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
