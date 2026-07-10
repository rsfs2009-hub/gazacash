/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserPlus, FileText, Printer, ShieldAlert, DollarSign, ArrowUpRight, ArrowDownLeft, Trash2, Plus, Pencil, X } from 'lucide-react';
import { CustomerSupplier, CustomerSupplierStatement, Sale, Purchase, SalesReturn } from '../types';

interface ContactsProps {
  contacts: CustomerSupplier[];
  sales: Sale[];
  purchases: Purchase[];
  returns: SalesReturn[];
  onAddContact: (contact: Omit<CustomerSupplier, 'id' | 'currentBalance'>) => void;
  onUpdateContact: (id: string, contact: Partial<CustomerSupplier>) => void;
  onRecordPayment: (contactId: string, amount: number, type: 'receipt' | 'payment', notes: string) => void; // Receipt = customer pays us (reduces debit), Payment = we pay supplier (reduces credit)
  initialTab?: 'list' | 'ledger';
  onTabChange?: (tab: 'list' | 'ledger') => void;
}

export default function Contacts({ contacts, sales, purchases, returns, onAddContact, onUpdateContact, onRecordPayment, initialTab, onTabChange }: ContactsProps) {
  const [activeTab, setActiveTab] = React.useState<'list' | 'ledger'>(initialTab || 'list');

  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'list' | 'ledger') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // View transaction state for detailed account statement
  const [viewingTx, setViewingTx] = useState<any | null>(null);
  const [viewingTxType, setViewingTxType] = useState<'sale' | 'purchase' | 'return' | null>(null);

  // Helper function to handle statement row clicks
  const handleStatementLineClick = (line: CustomerSupplierStatement) => {
    if (line.referenceNo === 'START') return;

    if (line.type.includes('مبيعات')) {
      const sale = sales.find(s => s.invoiceNo === line.referenceNo);
      if (sale) {
        setViewingTx(sale);
        setViewingTxType('sale');
      }
    } else if (line.type.includes('مشتريات')) {
      const purchase = purchases.find(p => p.invoiceNo === line.referenceNo);
      if (purchase) {
        setViewingTx(purchase);
        setViewingTxType('purchase');
      }
    } else if (line.type.includes('دفعة')) {
      // Find the associated invoice
      const sale = sales.find(s => s.invoiceNo === line.referenceNo);
      if (sale) {
        setViewingTx(sale);
        setViewingTxType('sale');
      } else {
        const purchase = purchases.find(p => p.invoiceNo === line.referenceNo);
        if (purchase) {
          setViewingTx(purchase);
          setViewingTxType('purchase');
        }
      }
    } else if (line.type.includes('مرتجع')) {
      const ret = returns.find(r => r.returnNo === line.referenceNo);
      if (ret) {
        setViewingTx(ret);
        setViewingTxType('return');
      }
    }
  };

  // Add contact form states
  const [contactName, setContactName] = useState('');
  const [contactType, setContactType] = useState<'customer' | 'supplier' | 'both'>('customer');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [selectedEditContactId, setSelectedEditContactId] = useState<string | null>(null);

  // Register payment form states
  const [selectedContactId, setSelectedContactId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'receipt' | 'payment'>('receipt'); // Receipt = قبض, Payment = صرف
  const [paymentNotes, setPaymentNotes] = useState('');

  // Account Statement (كشف الحساب) states
  const [ledgerContactId, setLedgerContactId] = useState(contacts[0]?.id || '');

  const handleEditContact = (contact: CustomerSupplier) => {
    setSelectedEditContactId(contact.id);
    setContactName(contact.name);
    setContactType(contact.type);
    setContactPhone(contact.phone || '');
    setContactAddress(contact.address || '');
    setInitialBalance(contact.initialBalance);
    handleTabChange('list');

    // Smooth scroll to the form container with slight delay to ensure tab switch is complete
    setTimeout(() => {
      const element = document.getElementById('contact-form-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName) return;

    const contactPayload = {
      name: contactName,
      type: contactType,
      phone: contactPhone,
      address: contactAddress,
      initialBalance: +initialBalance
    };

    if (selectedEditContactId) {
      onUpdateContact(selectedEditContactId, contactPayload);
      setSelectedEditContactId(null);
      toast('تم تحديث بيانات الحساب التجاري بنجاح! 💾', 'success');
    } else {
      onAddContact(contactPayload);
      toast('تم إضافة الحساب التجاري الجديد للمجموعة بنجاح! 🎉', 'success');
    }

    setContactName('');
    setContactPhone('');
    setContactAddress('');
    setInitialBalance(0);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId || paymentAmount <= 0) {
      toast('الرجاء تعبئة قيمة السند واختيار الاسم', 'warning');
      return;
    }

    onRecordPayment(selectedContactId, paymentAmount, paymentType, paymentNotes);
    
    // reset
    setSelectedContactId('');
    setPaymentAmount(0);
    setPaymentNotes('');
    toast('تم تسجيل سند القبض/الصرف المالي وتحديث أرصدة الحسابات بنجاح! 💵', 'success');
  };

  // Helper: Build the detailed account statement for the selected ledger contact
  const buildAccountStatement = (contactId: string): CustomerSupplierStatement[] => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return [];

    const statement: CustomerSupplierStatement[] = [];
    let runningBalance = contact.initialBalance; // Initial balance

    // Add initial balance line
    statement.push({
      date: '2026-01-01T00:00:00', // standard start
      type: 'رصيد افتتاحي',
      referenceNo: 'START',
      amount: contact.initialBalance,
      debit: contact.initialBalance < 0 ? Math.abs(contact.initialBalance) : 0, // عليه (Negative in DB)
      credit: contact.initialBalance > 0 ? contact.initialBalance : 0,  // له (Positive in DB)
      runningBalance
    });

    // 1. Add Credit Sales (only sales where paymentType is 'credit' OR there's unpaid amount)
    sales
      .filter(s => s.customerId === contactId)
      .forEach(s => {
        const debitVal = s.total - s.paidAmount; // Customer owes this remaining amount
        if (debitVal > 0) {
          statement.push({
            date: s.date,
            type: 'فاتورة مبيعات آجل',
            referenceNo: s.invoiceNo,
            amount: s.total,
            debit: debitVal, // عليه
            credit: 0,
            runningBalance: 0 // calculated later after sorting
          });
        }
        
        if (s.paidAmount > 0) {
          // If there was a cash payment inside the sale, record it as a cash receipt
          statement.push({
            date: s.date,
            type: 'دفعة نقدية مع الفاتورة',
            referenceNo: s.invoiceNo,
            amount: s.paidAmount,
            debit: 0,
            credit: s.paidAmount, // له
            runningBalance: 0
          });
        }
      });

    // 2. Add Credit Purchases
    purchases
      .filter(p => p.supplierId === contactId)
      .forEach(p => {
        const creditVal = p.total - p.paidAmount; // We owe supplier this remaining amount
        if (creditVal > 0) {
          statement.push({
            date: p.date,
            type: 'فاتورة مشتريات آجل',
            referenceNo: p.invoiceNo,
            amount: p.total,
            debit: 0,
            credit: creditVal, // له
            runningBalance: 0
          });
        }
        
        if (p.paidAmount > 0) {
          statement.push({
            date: p.date,
            type: 'دفعة نقدية مع فاتورة الشراء',
            referenceNo: p.invoiceNo,
            amount: p.paidAmount,
            debit: p.paidAmount, // عليه
            credit: 0,
            runningBalance: 0
          });
        }
      });

    // 3. Add Returns
    returns
      .filter(r => r.customerId === contactId)
      .forEach(r => {
        statement.push({
          date: r.date,
          type: 'سند مرتجع مبيعات',
          referenceNo: r.returnNo,
          amount: r.total,
          debit: 0,
          credit: r.total, // Customer gets credit back
          runningBalance: 0
        });
      });

    // Sort statement items by date
    statement.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    // In our system: + is "له" (credit), - is "عليه" (debit)
    // Credit (له) increases balance, Debit (عليه) decreases balance.
    let balance = contact.initialBalance;
    
    // Skip the first item since it already has initial running balance set
    for (let i = 1; i < statement.length; i++) {
      const line = statement[i];
      if (line.credit > 0) {
        balance += line.credit;
      }
      if (line.debit > 0) {
        balance -= line.debit;
      }
      line.runningBalance = balance;
    }

    return statement;
  };

  const ledgerContact = contacts.find(c => c.id === ledgerContactId);
  const statementLines = buildAccountStatement(ledgerContactId);

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Navigation subtabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar pb-1 no-print">
        <button
          onClick={() => handleTabChange('list')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'list' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <Users size={16} /> قائمة العملاء والموردين والحسابات
        </button>
        <button
          onClick={() => handleTabChange('ledger')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'ledger' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          id="account_statement_card"
        >
          <FileText size={16} /> كشف حساب تفصيلي
        </button>
      </div>

      {/* 1. TAB: CONTACTS LIST & PAYMENT REGISTRATION */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 no-print">
          {/* Quick Registration Form */}
          <div className="xl:col-span-4 flex flex-col space-y-6">
            {/* Form: Add Contact */}
            <div 
              id="contact-form-container"
              className={`rounded-2xl glass-panel-card p-5 border shadow-md space-y-4 transition-all duration-300 ${selectedEditContactId ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-500/5 dark:bg-sky-500/5' : 'border-white/25'}`}
            >
              <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserPlus size={18} className="text-emerald-500" />
                  {selectedEditContactId ? 'تعديل بيانات الحساب التجاري' : 'تسجيل حساب تجاري جديد'}
                </span>
                {selectedEditContactId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEditContactId(null);
                      setContactName('');
                      setContactPhone('');
                      setContactAddress('');
                      setInitialBalance(0);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </h3>
              
              <form onSubmit={handleAddContactSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">الاسم التجاري أو الشخصي</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="سوبر ماركت الياسمين، شركة الشمال..."
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">نوع الحساب</label>
                    <select
                      value={contactType}
                      onChange={(e) => setContactType(e.target.value as any)}
                      className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                    >
                      <option value="customer">عميل / زبون</option>
                      <option value="supplier">مورد بضائع</option>
                      <option value="both">كلاهما (عميل ومورد)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">رقم الهاتف</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="059-XXXXXXX"
                      className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">العنوان الجغرافي</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="غزة، شارع الثلاثيني..."
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">الرصيد الافتتاحي المالي للذمة</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={initialBalance || ''}
                      onChange={(e) => setInitialBalance(+e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 rounded-xl glass-input text-sm font-bold font-mono text-slate-900 dark:text-white pl-16"
                    />
                    <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      + دائن، - مدين
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm shadow transition cursor-pointer"
                >
                  {selectedEditContactId ? 'تحديث الحساب' : 'حفظ الحساب الجديد'}
                </button>
              </form>
            </div>

            {/* Form: Record Payment (قبض أو صرف) */}
            <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
              <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <DollarSign size={18} className="text-emerald-500" /> سند مالي (قبض وصرف نقد)
              </h3>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">نوع السند</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                    >
                      <option value="receipt">سند قبض (من زبون)</option>
                      <option value="payment">سند صرف (إلى مورد)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">القيمة المالية (شيكل)</label>
                    <input
                      type="number"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Math.max(0, +e.target.value))}
                      placeholder="0.00"
                      className="w-full p-2 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">الحساب المالي المستهدف</label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-semibold"
                    required
                  >
                    <option value="">-- اختر الحساب المالي --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type === 'customer' ? 'عميل' : c.type === 'supplier' ? 'مورد' : 'عميل ومورد'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">البيان / الوصف السند</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="مثال: دفعة تحت الحساب للفاتورة رقم..."
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm shadow transition cursor-pointer"
                >
                  تسجيل السند وتحديث الرصيد
                </button>
              </form>
            </div>
          </div>

          {/* Accounts Database Table */}
          <div className="xl:col-span-8 rounded-2xl glass-panel-card border border-white/25 p-5 shadow-md flex flex-col space-y-4">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex justify-between items-center">
              <span>الحسابات المالية والأرصدة المستحقة</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
                إجمالي الحسابات: {contacts.length}
              </span>
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    <th className="pb-3 pr-2">الاسم والاتصال</th>
                    <th className="pb-3">النوع</th>
                    <th className="pb-3">العنوان</th>
                    <th className="pb-3 text-center">الرصيد الحالي</th>
                    <th className="pb-3 text-left pl-2">الحالة المالية</th>
                    <th className="pb-3 text-center pl-2">تعديل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contacts.map(c => {
                    const balance = c.currentBalance;
                    const isOwedToUs = balance < 0; // Customer owes us (عليه)
                    const isOwedByUs = balance > 0; // We owe them (له)
                    
                    return (
                      <tr key={c.id} className="text-slate-900 dark:text-white hover:bg-slate-500/5 transition">
                        <td className="py-3.5 pr-2">
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-xs text-slate-500 font-mono">الهاتف: {c.phone || 'غير مدرج'}</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'customer' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : c.type === 'supplier' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/40'}`}>
                            {c.type === 'customer' ? 'عميل' : c.type === 'supplier' ? 'مورد' : 'كلاهما'}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 text-xs">{c.address || 'غير محدد'}</td>
                        <td className="py-3.5 text-center font-bold font-mono">
                          <span className={isOwedToUs ? 'text-red-600' : isOwedByUs ? 'text-emerald-600' : 'text-slate-500'}>
                            {Math.abs(balance).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 text-left pl-2 text-xs">
                          {isOwedToUs ? (
                            <span className="text-red-600 font-bold flex items-center gap-1 justify-end">
                              <ArrowDownLeft size={12} /> عليه (مستحق لنا)
                            </span>
                          ) : isOwedByUs ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 justify-end">
                              <ArrowUpRight size={12} /> له (مستحق له علينا)
                            </span>
                          ) : (
                            <span className="text-slate-500">خالص ومتوازن</span>
                          )}
                        </td>
                        <td className="py-3.5 text-center pl-2">
                          <button
                            onClick={() => handleEditContact(c)}
                            className="p-1.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 transition-all cursor-pointer"
                            title="تعديل بيانات الحساب"
                          >
                            <Pencil size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: ACCOUNT STATEMENT (كشف حساب تفصيلي) */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 no-print">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-1.5">
                <FileText size={18} className="text-emerald-500" /> كشف حساب مالي مفصل للذمم
              </h3>
              <p className="text-xs text-slate-500">اختر اسم العميل أو المورد لتوليد كشف حركة حسابه وحركاته المالية الجارية والمتبقية</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-64">
                <select
                  value={ledgerContactId}
                  onChange={(e) => setLedgerContactId(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">-- اختر العميل أو المورد --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  (window as any)._printTargetSelector = '.print-report-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer flex items-center gap-1"
              >
                <Printer size={12} /> طباعة الكشف
              </button>
            </div>
          </div>

          {/* Account Ledger report presentation */}
          {ledgerContact ? (
            <div className="print-report-wrapper space-y-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">كشف حساب مفصل ومعتمد</span>
                  <h2 className="font-extrabold text-xl text-slate-950 dark:text-white mt-1.5">{ledgerContact.name}</h2>
                  <p className="text-xs text-slate-500">الهاتف: {ledgerContact.phone || 'غير مسجل'} | العنوان: {ledgerContact.address || 'غير محدد'}</p>
                </div>
                
                <div className="text-left bg-slate-500/5 p-3 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-500">الرصيد المالي الحالي والمستحق:</p>
                  <span className={`font-extrabold text-xl font-mono ${ledgerContact.currentBalance < 0 ? 'text-red-600' : ledgerContact.currentBalance > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {Math.abs(ledgerContact.currentBalance).toFixed(2)} شيكل
                  </span>
                  <div className="text-[10px] font-bold text-slate-500 mt-1">
                    {ledgerContact.currentBalance < 0 ? 'عليه (مطلوب منه الدفع لنا)' : ledgerContact.currentBalance > 0 ? 'له (مستحق له في ذمتنا)' : 'خالص تماماً ومصفر'}
                  </div>
                </div>
              </div>

              {statementLines.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  لا توجد حركات تجارية أو سندات مسجلة لهذا الحساب.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="pb-3 pr-2">التاريخ</th>
                        <th className="pb-3">العملية / المستند</th>
                        <th className="pb-3 text-center">الرقم المرجعي</th>
                        <th className="pb-3 text-center text-red-600">مدين (سحب عليه - شيكل)</th>
                        <th className="pb-3 text-center text-emerald-600">دائن (دفعة له - شيكل)</th>
                        <th className="pb-3 text-left pl-2">الرصيد التراكمي المستحق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                      {statementLines.map((line, idx) => {
                        const lineIsDebit = line.runningBalance < 0;
                        const formattedBalance = Math.abs(line.runningBalance).toFixed(2);
                        
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => handleStatementLineClick(line)}
                            className={`transition ${line.referenceNo !== 'START' ? 'cursor-pointer hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400' : 'hover:bg-slate-500/5'}`}
                            title={line.referenceNo !== 'START' ? 'اضغط لعرض تفاصيل المستند والحركة بالكامل 🔍' : ''}
                          >
                            <td className="py-2.5 pr-2 font-mono text-slate-500">
                              {line.referenceNo === 'START' ? 'بداية النشاط' : new Date(line.date).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="py-2.5 font-bold">{line.type}</td>
                            <td className="py-2.5 text-center font-mono font-bold">{line.referenceNo}</td>
                            <td className="py-2.5 text-center font-mono font-bold text-red-600">
                              {line.debit > 0 ? line.debit.toFixed(2) : '-'}
                            </td>
                            <td className="py-2.5 text-center font-mono font-bold text-emerald-600">
                              {line.credit > 0 ? line.credit.toFixed(2) : '-'}
                            </td>
                            <td className="py-2.5 text-left pl-2 font-mono font-bold">
                              <span className={lineIsDebit ? 'text-red-600' : line.runningBalance > 0 ? 'text-emerald-600' : 'text-slate-500'}>
                                {formattedBalance} {lineIsDebit ? 'عليه' : line.runningBalance > 0 ? 'له' : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              يرجى إضافة حساب عميل أو مورد لاستعراض كشف الحساب المفصل له.
            </div>
          )}
        </div>
      )}

      {/* Transaction details modal in Contacts */}
      {viewingTx && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="print-invoice-wrapper bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setViewingTx(null); setViewingTxType(null); }}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer no-print transition"
            >
              <X size={16} />
            </button>

            {/* Invoice Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-right space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                    {viewingTxType === 'sale' ? 'فاتورة مبيعات معتمدة' : viewingTxType === 'purchase' ? 'سند توريد مشتريات' : 'سند مرتجع مبيعات'}
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">
                    {viewingTxType === 'return' ? 'رقم السند: ' : 'رقم الفاتورة: '}<span className="font-mono">{viewingTxType === 'return' ? viewingTx.returnNo : viewingTx.invoiceNo}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{new Date(viewingTx.date).toLocaleString('ar-EG')}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                    غك
                  </div>
                  <div className="text-left font-bold text-xs text-slate-400">غزة كاش ERP</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">موقع المستودع / الفرع:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{viewingTx.branchName || 'الفرع الرئيسي'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">{viewingTxType === 'sale' || viewingTxType === 'return' ? 'العميل المستلم:' : 'المورد المورد:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {viewingTxType === 'sale' || viewingTxType === 'return' ? viewingTx.customerName : viewingTx.supplierName}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-500">تفاصيل السلع والأصناف المدرجة:</h4>
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-2.5 font-bold">اسم الصنف</th>
                      <th className="p-2.5 text-center font-bold">الوحدة المستخدمة</th>
                      <th className="p-2.5 text-center font-bold">الكمية</th>
                      <th className="p-2.5 text-center font-bold">سعر الوحدة</th>
                      <th className="p-2.5 text-left pl-3 font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {viewingTx.items && viewingTx.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-500/5 transition">
                        <td className="p-2.5 font-semibold">{item.itemName}</td>
                        <td className="p-2.5 text-center text-slate-500">{item.unitName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-center font-mono">{item.price.toFixed(2)}</td>
                        <td className="p-2.5 text-left pl-3 font-mono font-bold text-slate-900 dark:text-white">{(item.quantity * item.price).toFixed(2)} ₪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary and Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5 text-xs text-slate-500 italic">
                <span className="font-bold text-slate-400 block not-italic">ملاحظات الحركة:</span>
                {viewingTx.notes || 'لا يوجد ملاحظات إضافية مسجلة على هذه الحركة.'}
              </div>

              <div className="space-y-2 text-xs">
                {viewingTxType !== 'return' && (
                  <>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>المجموع قبل الخصم:</span>
                      <span className="font-mono">{viewingTx.subTotal ? viewingTx.subTotal.toFixed(2) : viewingTx.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>قيمة الخصم الممنوح:</span>
                      <span className="font-mono text-red-500">-{viewingTx.discount ? viewingTx.discount.toFixed(2) : '0.00'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                  <span>صافي قيمة الحركة النهائي:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {viewingTx.total.toFixed(2)} ₪
                  </span>
                </div>
                {viewingTxType !== 'return' && (
                  <>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>المبلغ المدفوع (نقداً):</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {viewingTx.paidAmount ? viewingTx.paidAmount.toFixed(2) : viewingTx.total.toFixed(2)} ₪
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-xs text-slate-500">
                      <span>المتبقي في حساب الذمم:</span>
                      <span className={`font-mono ${viewingTx.total - (viewingTx.paidAmount || viewingTx.total) > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {(viewingTx.total - (viewingTx.paidAmount || viewingTx.total)).toFixed(2)} ₪
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
              <button
                onClick={() => { setViewingTx(null); setViewingTxType(null); }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                إغلاق النافذة
              </button>
              <button
                onClick={() => {
                  (window as any)._printTargetSelector = '.fixed .print-invoice-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Printer size={14} /> طباعة المستند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
