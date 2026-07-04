/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Search, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowDownLeft, AlertOctagon, HelpCircle, X } from 'lucide-react';
import { Sale, Purchase, CustomerSupplier, Item, Branch, Currency } from '../types';

interface ReportsProps {
  sales: Sale[];
  purchases: Purchase[];
  contacts: CustomerSupplier[];
  items: Item[];
  branches: Branch[];
  activeCurrency?: Currency;
  currencies?: Currency[];
  initialTab?: 'sales' | 'purchases' | 'accounts' | 'stock';
  logoUrl?: string;
}

export default function Reports({ sales, purchases, contacts, items, branches, activeCurrency, currencies, initialTab, logoUrl }: ReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'purchases' | 'accounts' | 'stock'>('sales');

  useEffect(() => {
    if (initialTab) {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  // View invoice/transaction modal states
  const [selectedTx, setSelectedTx] = useState<Sale | Purchase | null>(null);
  const [selectedTxType, setSelectedTxType] = useState<'sale' | 'purchase' | null>(null);

  const currList = currencies || [];
  const baseCurrency = currList.find(c => c.isBase) || { id: 'ILS', symbol: '₪' };

  // Filters - Sales
  const [salesDateFrom, setSalesDateFrom] = useState('');
  const [salesDateTo, setSalesDateTo] = useState('');
  const [salesPaymentType, setSalesPaymentType] = useState('all');
  const [salesBranchId, setSalesBranchId] = useState('all');
  const [salesCurrencyId, setSalesCurrencyId] = useState('all');

  // Filters - Purchases
  const [purchDateFrom, setPurchDateFrom] = useState('');
  const [purchDateTo, setPurchDateTo] = useState('');
  const [purchSupplierId, setPurchSupplierId] = useState('all');
  const [purchCurrencyId, setPurchCurrencyId] = useState('all');

  // Utility to determine exact currency id of invoice or purchase
  const getSaleCurrencyId = (s: Sale) => s.currencyId || baseCurrency.id;
  const getPurchCurrencyId = (p: Purchase) => p.currencyId || baseCurrency.id;

  // Calculations for financial overview cards
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total, 0);
  
  // Total money owed to us by customers (active negative balances in DB)
  const totalOwedByCustomers = Math.abs(
    contacts
      .filter(c => c.type === 'customer' || c.type === 'both')
      .filter(c => c.currentBalance < 0)
      .reduce((sum, c) => sum + c.currentBalance, 0)
  );

  // Total money we owe to suppliers (active positive balances in DB)
  const totalOwedToSuppliers = contacts
    .filter(c => c.type === 'supplier' || c.type === 'both')
    .filter(c => c.currentBalance > 0)
    .reduce((sum, c) => sum + c.currentBalance, 0);

  // --- Filtered Data Retrievals ---
  const filteredSales = sales.filter(s => {
    if (salesDateFrom && new Date(s.date) < new Date(salesDateFrom)) return false;
    if (salesDateTo && new Date(s.date) > new Date(salesDateTo + 'T23:59:59')) return false;
    if (salesPaymentType !== 'all' && s.paymentType !== salesPaymentType) return false;
    if (salesBranchId !== 'all' && s.branchId !== salesBranchId) return false;
    if (salesCurrencyId !== 'all' && getSaleCurrencyId(s) !== salesCurrencyId) return false;
    return true;
  });

  const filteredPurchases = purchases.filter(p => {
    if (purchDateFrom && new Date(p.date) < new Date(purchDateFrom)) return false;
    if (purchDateTo && new Date(p.date) > new Date(purchDateTo + 'T23:59:59')) return false;
    if (purchSupplierId !== 'all' && p.supplierId !== purchSupplierId) return false;
    if (purchCurrencyId !== 'all' && getPurchCurrencyId(p) !== purchCurrencyId) return false;
    return true;
  });

  // --- Export Excel (UTF-8 CSV with BOM for full Arabic Excel support) ---
  const exportToCSV = (data: any[], filename: string, headers: string[], rowMapper: (item: any) => string[]) => {
    // UTF-8 BOM to force Excel to render Arabic correctly
    const BOM = '\uFEFF';
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = rowMapper(item).map(val => `"${val.replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSales = () => {
    const headers = ['رقم الفاتورة', 'التاريخ والوقت', 'الزبون المستلم', 'موقع البيع', 'قيمة المبيعات', 'المبلغ المدفوع', 'نوع الدفع', 'ملاحظات الفاتورة'];
    exportToCSV(
      filteredSales,
      'تقارير_المبيعات_غزة_كاش',
      headers,
      (s) => [
        s.invoiceNo,
        new Date(s.date).toLocaleString('ar-EG'),
        s.customerName,
        s.branchName,
        s.total.toFixed(2),
        s.paidAmount.toFixed(2),
        s.paymentType === 'cash' ? 'نقدي كاش' : 'ذمم آجل',
        s.notes || ''
      ]
    );
  };

  const handleExportPurchases = () => {
    const headers = ['رقم الفاتورة المشتراة', 'التاريخ والوقت', 'اسم المورد الرئيسي', 'موقع الاستلام', 'إجمالي الفاتورة', 'المدفوع للمورد', 'نوع الدفع'];
    exportToCSV(
      filteredPurchases,
      'تقارير_المشتريات_غزة_كاش',
      headers,
      (p) => [
        p.invoiceNo,
        new Date(p.date).toLocaleString('ar-EG'),
        p.supplierName,
        p.branchName,
        p.total.toFixed(2),
        p.paidAmount.toFixed(2),
        p.paymentType === 'cash' ? 'نقدي' : 'آجل',
        p.notes || ''
      ]
    );
  };

  const handleExportAccounts = () => {
    const headers = ['اسم الحساب', 'النوع', 'رقم الهاتف', 'العنوان الجغرافي', 'الحالة الحالية', 'الأرصدة المستحقة شيكل'];
    exportToCSV(
      contacts,
      'أرصدة_الحسابات_غزة_كاش',
      headers,
      (c) => [
        c.name,
        c.type === 'customer' ? 'عميل' : c.type === 'supplier' ? 'مورد' : 'عميل ومورد',
        c.phone,
        c.address,
        c.currentBalance < 0 ? 'عليه ذمة لنا' : c.currentBalance > 0 ? 'له علينا' : 'خالص ومتعادل',
        Math.abs(c.currentBalance).toFixed(2)
      ]
    );
  };

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Dynamic Glass KPI dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Sales KPI */}
        <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات المحققة</span>
            <h2 className="font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 font-mono">
              {totalSalesAmount.toFixed(2)}
            </h2>
            <p className="text-[10px] text-slate-400">جميع مبيعات المجموعة الفعالة</p>
          </div>
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-3 rounded-xl text-emerald-500">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Purchases KPI */}
        <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">مشتريات وتوريد بضائع</span>
            <h2 className="font-extrabold text-2xl text-red-500 font-mono">
              {totalPurchasesAmount.toFixed(2)}
            </h2>
            <p className="text-[10px] text-slate-400">إجمالي مبالغ الشراء من الموردين</p>
          </div>
          <div className="bg-red-500/10 dark:bg-red-500/5 p-3 rounded-xl text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Customer Debits KPI */}
        <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">أرصدة ذمم العملاء الموقوفة</span>
            <h2 className="font-extrabold text-2xl text-amber-500 font-mono">
              {totalOwedByCustomers.toFixed(2)}
            </h2>
            <p className="text-[10px] text-slate-400">مستحقات ديون التاجر لدى الزبائن</p>
          </div>
          <div className="bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-xl text-amber-500">
            <Wallet size={24} />
          </div>
        </div>

        {/* Supplier Credits KPI */}
        <div className="rounded-2xl glass-panel-card p-4 border border-white/25 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">ديون علينا للموردين</span>
            <h2 className="font-extrabold text-2xl text-indigo-500 font-mono">
              {totalOwedToSuppliers.toFixed(2)}
            </h2>
            <p className="text-[10px] text-slate-400">مستحقات واجبة السداد للشركات</p>
          </div>
          <div className="bg-indigo-500/10 dark:bg-indigo-500/5 p-3 rounded-xl text-indigo-500">
            <ArrowDownLeft size={24} />
          </div>
        </div>
      </div>

      {/* Reports tab navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar pb-1 no-print">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${activeReportTab === 'sales' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          كشف المبيعات وفلترتها
        </button>
        <button
          onClick={() => setActiveReportTab('purchases')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${activeReportTab === 'purchases' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          جرد وتدقيق المشتريات
        </button>
        <button
          onClick={() => setActiveReportTab('accounts')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${activeReportTab === 'accounts' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          ميزان أرصدة الحسابات الإجمالية
        </button>
        <button
          onClick={() => setActiveReportTab('stock')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${activeReportTab === 'stock' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          أصناف تحت حد الطلب والنفاذ
        </button>
      </div>

      {/* 1. REPORT: SALES */}
      {activeReportTab === 'sales' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-500/5 p-4 rounded-xl border border-white/10 no-print">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تاريخ البداية</label>
              <input
                type="date"
                value={salesDateFrom}
                onChange={(e) => setSalesDateFrom(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تاريخ النهاية</label>
              <input
                type="date"
                value={salesDateTo}
                onChange={(e) => setSalesDateTo(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">طريقة الدفع</label>
              <select
                value={salesPaymentType}
                onChange={(e) => setSalesPaymentType(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">كل الطرق</option>
                <option value="cash">نقدي (كاش)</option>
                <option value="credit">ذمم (آجل)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">الفرع أو المستودع</label>
              <select
                value={salesBranchId}
                onChange={(e) => setSalesBranchId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">كل الفروع</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تصفية حسب العملة</label>
              <select
                value={salesCurrencyId}
                onChange={(e) => setSalesCurrencyId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">كل العملات</option>
                {currList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleExportSales}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download size={14} /> إكسل
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer size={14} /> طباعة
              </button>
            </div>
          </div>

          <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800/80">سجل حركات الفواتير والمبيعات الجارية</h3>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-3 pr-2">رقم الفاتورة والتاريخ</th>
                  <th className="pb-3">العميل والموقع</th>
                  <th className="pb-3 text-center">طريقة الدفع</th>
                  <th className="pb-3 text-center">الصافي والعملة</th>
                  <th className="pb-3 text-center">المدفوع كاش</th>
                  <th className="pb-3 pl-2 text-left">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                {filteredSales.map(s => {
                  const saleCurr = currList.find(c => c.id === getSaleCurrencyId(s)) || baseCurrency;
                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => { setSelectedTx(s); setSelectedTxType('sale'); }}
                      className="hover:bg-slate-500/10 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      title="اضغط لفتح وعرض تفاصيل الفاتورة كاملة"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="font-bold">{s.invoiceNo}</div>
                        <div className="text-[10px] text-slate-500">{new Date(s.date).toLocaleString('ar-EG')}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold">{s.customerName}</div>
                        <div className="text-[10px] text-slate-400">{s.branchName}</div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${s.paymentType === 'cash' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40'}`}>
                          {s.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">{s.total.toFixed(2)} {saleCurr.symbol}</td>
                      <td className="py-2.5 text-center font-mono text-slate-500">{s.paidAmount.toFixed(2)} {saleCurr.symbol}</td>
                      <td className="py-2.5 pl-2 text-left text-slate-500 italic max-w-xs truncate">{s.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. REPORT: PURCHASES */}
      {activeReportTab === 'purchases' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-500/5 p-4 rounded-xl border border-white/10 no-print">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تاريخ البداية</label>
              <input
                type="date"
                value={purchDateFrom}
                onChange={(e) => setPurchDateFrom(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تاريخ النهاية</label>
              <input
                type="date"
                value={purchDateTo}
                onChange={(e) => setPurchDateTo(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">حساب المورد</label>
              <select
                value={purchSupplierId}
                onChange={(e) => setPurchSupplierId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">كل الموردين</option>
                {contacts.filter(c => c.type === 'supplier' || c.type === 'both').map(supp => (
                  <option key={supp.id} value={supp.id}>{supp.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">تصفية حسب العملة</label>
              <select
                value={purchCurrencyId}
                onChange={(e) => setPurchCurrencyId(e.target.value)}
                className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="all">كل العملات</option>
                {currList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleExportPurchases}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download size={14} /> إكسل
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer size={14} /> طباعة
              </button>
            </div>
          </div>

          <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800/80">سجل فواتير توريد السلع وحركات المشتريات</h3>

          {/* Purchases Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-3 pr-2">رقم فاتورة الشراء</th>
                  <th className="pb-3">اسم المورد</th>
                  <th className="pb-3 text-center">موقع الاستلام في الفروع</th>
                  <th className="pb-3 text-center">نوع الدفع</th>
                  <th className="pb-3 text-center">قيمة الفاتورة والعملة</th>
                  <th className="pb-3 pl-2 text-left">المدفوع النقدي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                {filteredPurchases.map(p => {
                  const purchCurr = currList.find(c => c.id === getPurchCurrencyId(p)) || baseCurrency;
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => { setSelectedTx(p); setSelectedTxType('purchase'); }}
                      className="hover:bg-slate-500/10 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      title="اضغط لفتح وعرض تفاصيل الفاتورة كاملة"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="font-bold">{p.invoiceNo}</div>
                        <div className="text-[10px] text-slate-500">{new Date(p.date).toLocaleString('ar-EG')}</div>
                      </td>
                      <td className="py-2.5 font-semibold">{p.supplierName}</td>
                      <td className="py-2.5 text-center text-slate-500">{p.branchName}</td>
                      <td className="py-2.5 text-center font-bold">
                        {p.paymentType === 'cash' ? 'نقدي كامل' : 'آجل ذمة'}
                      </td>
                      <td className="py-2.5 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">{p.total.toFixed(2)} {purchCurr.symbol}</td>
                      <td className="py-2.5 pl-2 text-left font-mono text-slate-500">{p.paidAmount.toFixed(2)} {purchCurr.symbol}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REPORT: ACCOUNTS BALANCE */}
      {activeReportTab === 'accounts' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100">ميزان مراجعة أرصدة الذمم الإجمالية</h3>
            <button
              onClick={handleExportAccounts}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer no-print"
            >
              <Download size={12} /> تصدير ميزان الأرصدة كملف إكسل CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-3 pr-2">الاسم والاتصال</th>
                  <th className="pb-3">نوع الحساب التجاري</th>
                  <th className="pb-3 text-center">أرصدة مدين (عليه لنا - شيكل)</th>
                  <th className="pb-3 text-center">أرصدة دائن (له علينا - شيكل)</th>
                  <th className="pb-3 text-left pl-2">توصيات السيولة والتحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                {contacts.map(c => {
                  const val = c.currentBalance;
                  const isDebit = val < 0; // عليه
                  const isCredit = val > 0; // له
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-3 pr-2">
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">الهاتف: {c.phone}</div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${c.type === 'customer' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40' : c.type === 'supplier' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/40'}`}>
                          {c.type === 'customer' ? 'عميل' : c.type === 'supplier' ? 'مورد' : 'عميل ومورد'}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold font-mono text-red-600">{isDebit ? Math.abs(val).toFixed(2) : '-'}</td>
                      <td className="py-3 text-center font-bold font-mono text-emerald-600">{isCredit ? Math.abs(val).toFixed(2) : '-'}</td>
                      <td className="py-3 text-left pl-2 text-xs font-medium">
                        {isDebit ? (
                          <span className="text-amber-600">⚠️ يتطلب تحصيل ديون جارية بأسرع وقت</span>
                        ) : isCredit ? (
                          <span className="text-slate-500">دفعة استحقاق سداد مجدولة</span>
                        ) : (
                          <span className="text-slate-400">متعادل ومصفر</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REPORT: STOCK ALERT */}
      {activeReportTab === 'stock' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
          <h3 className="font-bold text-md text-red-500 flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <AlertOctagon size={18} /> قائمة إنذار وتنبيهات نفاد المخزون الجاري
          </h3>
          <p className="text-xs text-slate-500">الأصناف الموضحة أدناه انخفض رصيدها المتوفر في المخزن الإجمالي عن حد الأمان الموصى به لضمان سير حركة المبيعات وتجنب الانقطاع.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="pb-3 pr-2">اسم الصنف وقسمه</th>
                  <th className="pb-3 text-center">الرمز والباركود</th>
                  <th className="pb-3 text-center">حد الأمان الموصى به</th>
                  <th className="pb-3 text-center text-red-600">الكمية المتوفرة الإجمالية</th>
                  <th className="pb-3 text-left pl-2">توصية المستودع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white font-medium">
                {items.filter(item => {
                  const stock = items.length > 0 ? contacts.length > 0 ? sales.length >= 0 ? purchases.length >= 0 ? 
                    sales.reduce((acc, s) => {
                      const entry = s.items.find(x => x.itemId === item.id);
                      if (!entry) return acc;
                      // Convert to main unit equivalent
                      let qty = entry.quantity;
                      if (entry.isSubUnitUsed && item.conversionRate) {
                        qty = qty / item.conversionRate;
                      }
                      return acc - qty;
                    }, purchases.reduce((acc, p) => {
                      const entry = p.items.find(x => x.itemId === item.id);
                      if (!entry) return acc;
                      return acc + entry.quantity;
                    }, 25)) : 25 : 25 : 25 : 25; // simple fallback
                  return stock <= item.minStockAlert;
                }).map(item => {
                  const stock = sales.reduce((acc, s) => {
                    const entry = s.items.find(x => x.itemId === item.id);
                    if (!entry) return acc;
                    let qty = entry.quantity;
                    if (entry.isSubUnitUsed && item.conversionRate) {
                      qty = qty / item.conversionRate;
                    }
                    return acc - qty;
                  }, purchases.reduce((acc, p) => {
                    const entry = p.items.find(x => x.itemId === item.id);
                    if (!entry) return acc;
                    return acc + entry.quantity;
                  }, 25));

                  return (
                    <tr key={item.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-2.5 pr-2">
                        <div className="font-bold text-red-500">{item.name}</div>
                        <div className="text-[10px] text-slate-500">تصنيف القسم: {item.category}</div>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold">{item.barcode}</td>
                      <td className="py-2.5 text-center font-mono">{item.minStockAlert} {item.mainUnit}</td>
                      <td className="py-2.5 text-center font-mono font-extrabold text-red-600 bg-red-500/5 rounded-lg px-2">{stock.toFixed(1)} {item.mainUnit}</td>
                      <td className="py-2.5 text-left pl-2 font-bold text-red-500 text-[10px] uppercase">
                        📢 يتطلب إصدار أمر شراء وتوريد بضائع فوري!
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <style>{`
            @media print {
              body > *:not(.print-invoice-wrapper) {
                display: none !important;
              }
              .print-invoice-wrapper {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: white !important;
                color: black !important;
                z-index: 99999 !important;
                padding: 20px !important;
              }
            }
          `}</style>
          <div className="print-invoice-wrapper bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => { setSelectedTx(null); setSelectedTxType(null); }}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer no-print transition"
            >
              <X size={16} />
            </button>

            {/* Invoice Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-right space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                    {selectedTxType === 'sale' ? 'فاتورة مبيعات معتمدة' : 'سند توريد مشتريات'}
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">
                    رقم الفاتورة: <span className="font-mono">{selectedTx.invoiceNo}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{new Date(selectedTx.date).toLocaleString('ar-EG')}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-slate-200 dark:border-slate-800 p-0.5 bg-white" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                      غك
                    </div>
                  )}
                  <div className="text-left font-bold text-xs text-slate-400">غزة كاش ERP</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">موقع المستودع / الفرع:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTx.branchName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">{selectedTxType === 'sale' ? 'العميل المستلم:' : 'المورد المورد:'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedTxType === 'sale' ? (selectedTx as Sale).customerName : (selectedTx as Purchase).supplierName}
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
                      <th className="p-2.5">اسم الصنف</th>
                      <th className="p-2.5 text-center">الوحدة المستخدمة</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-center">سعر الوحدة</th>
                      <th className="p-2.5 text-left pl-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {selectedTx.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-500/5 transition">
                        <td className="p-2.5 font-semibold">{item.itemName}</td>
                        <td className="p-2.5 text-center text-slate-500">{item.unitName}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-center font-mono">{item.price.toFixed(2)}</td>
                        <td className="p-2.5 text-left pl-3 font-mono font-bold text-slate-900 dark:text-white">{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary and Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5 text-xs text-slate-500 italic">
                <span className="font-bold text-slate-400 block not-italic">ملاحظات الفاتورة:</span>
                {selectedTx.notes || 'لا يوجد ملاحظات إضافية مسجلة على هذه الحركة.'}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>المجموع قبل الخصم:</span>
                  <span className="font-mono">{selectedTx.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>قيمة الخصم الممنوح:</span>
                  <span className="font-mono text-red-500">-{selectedTx.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white border-t border-dashed border-slate-200 dark:border-slate-800 pt-2">
                  <span>صافي قيمة الفاتورة النهائي:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedTx.total.toFixed(2)} {(currList.find(c => c.id === getSaleCurrencyId(selectedTx)) || baseCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>المبلغ المدفوع (نقداً):</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedTx.paidAmount.toFixed(2)} {(currList.find(c => c.id === getSaleCurrencyId(selectedTx)) || baseCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs text-slate-500">
                  <span>المتبقي في حساب الذمم:</span>
                  <span className={`font-mono ${selectedTx.total - selectedTx.paidAmount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {(selectedTx.total - selectedTx.paidAmount).toFixed(2)} {(currList.find(c => c.id === getSaleCurrencyId(selectedTx)) || baseCurrency).symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-xs text-slate-500">
                  <span>طريقة دفع الفاتورة:</span>
                  <span className={`px-2 py-0.5 rounded-full ${selectedTx.paymentType === 'cash' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40'}`}>
                    {selectedTx.paymentType === 'cash' ? 'نقدي كامل' : 'آجل على الحساب'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Print */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
              <button
                onClick={() => { setSelectedTx(null); setSelectedTxType(null); }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                إغلاق النافذة
              </button>
              <button
                onClick={() => window.print()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Printer size={14} /> طباعة الفاتورة أو التقرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
