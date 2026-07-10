/**
 * Gaza Cash - Financial Reports, Analytics & Auditing Engines
 * Copyright (c) 2026 Gaza Cash Team. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Search, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowDownLeft, AlertOctagon, HelpCircle, X, Scale, Calculator, FileSpreadsheet, Layers, FileText } from 'lucide-react';
import { Sale, Purchase, CustomerSupplier, Item, Branch, Currency, ShopSettings } from '../types';

interface ReportsProps {
  sales: Sale[];
  purchases: Purchase[];
  contacts: CustomerSupplier[];
  items: Item[];
  branches: Branch[];
  activeCurrency?: Currency;
  currencies?: Currency[];
  initialTab?: 'sales' | 'purchases' | 'accounts' | 'stock' | 'trial-balance' | 'final-accounts' | 'profits';
  logoUrl?: string;
  returns?: any[];
  branchStock?: any[];
  movements?: any[];
  showInvoiceDate?: boolean;
  showInvoiceBranch?: boolean;
  showInvoiceLogo?: boolean;
  shopSettings?: ShopSettings;
  onTabChange?: (tab: 'sales' | 'purchases' | 'accounts' | 'stock' | 'trial-balance' | 'final-accounts' | 'profits') => void;
}

export default function Reports({
  sales,
  purchases,
  contacts,
  items,
  branches,
  activeCurrency,
  currencies,
  initialTab,
  logoUrl,
  returns = [],
  branchStock = [],
  movements = [],
  showInvoiceDate = true,
  showInvoiceBranch = true,
  showInvoiceLogo = true,
  shopSettings,
  onTabChange
}: ReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'purchases' | 'accounts' | 'stock' | 'trial-balance' | 'final-accounts' | 'profits'>('sales');

  useEffect(() => {
    if (initialTab) {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'sales' | 'purchases' | 'accounts' | 'stock' | 'trial-balance' | 'final-accounts' | 'profits') => {
    setActiveReportTab(tab);
    onTabChange?.(tab);
  };

  // View invoice/transaction modal states
  const [selectedTx, setSelectedTx] = useState<Sale | Purchase | null>(null);
  const [selectedTxType, setSelectedTxType] = useState<'sale' | 'purchase' | null>(null);
  const [showSalesReportPrintModal, setShowSalesReportPrintModal] = useState(false);

  // Search state for profits per item and detailed drill-down modals
  const [profitsSearchQuery, setProfitsSearchQuery] = useState('');
  const [selectedContactForLedger, setSelectedContactForLedger] = useState<CustomerSupplier | null>(null);
  const [selectedItemForLedger, setSelectedItemForLedger] = useState<Item | null>(null);

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
          onClick={() => handleTabChange('sales')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'sales' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          كشف المبيعات وفلترتها
        </button>
        <button
          onClick={() => handleTabChange('purchases')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'purchases' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          جرد وتدقيق المشتريات
        </button>
        <button
          onClick={() => handleTabChange('accounts')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'accounts' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          ميزان أرصدة الحسابات الإجمالية
        </button>
        <button
          onClick={() => handleTabChange('trial-balance')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'trial-balance' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          ميزان المراجعة (Trial Balance)
        </button>
         <button
          onClick={() => handleTabChange('profits')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'profits' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          تقرير الأرباح والتحليلات الاحترافي
        </button>
        <button
          onClick={() => handleTabChange('final-accounts')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'final-accounts' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          الميزانية الختامية والأصول
        </button>
        <button
          onClick={() => handleTabChange('stock')}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer whitespace-nowrap ${activeReportTab === 'stock' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          أصناف تحت حد الطلب والنفاذ
        </button>
      </div>

      {/* 1. REPORT: SALES */}
      {activeReportTab === 'sales' && (
        <div className="print-report-wrapper rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
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
                onClick={() => setShowSalesReportPrintModal(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                title="عرض وتصميم تقرير مبيعات مفصل ومحسن للطباعة أو الحفظ كـ PDF"
              >
                <Printer size={14} /> تقرير PDF محسن
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
        <div className="print-report-wrapper rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
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
                onClick={() => {
                  (window as any)._printTargetSelector = '.print-report-wrapper';
                  window.print();
                }}
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
        <div className="print-report-wrapper rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
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
        <div className="print-report-wrapper rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
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

      {/* 3. REPORT: PROFITS & ANALYTICS (تقرير الأرباح والتحليلات الاحترافي) */}
      {activeReportTab === 'profits' && (() => {
        // Compute overall profits
        const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
        const totalSalesDiscounts = sales.reduce((acc, s) => acc + s.discount, 0);
        const totalPurchasesDiscounts = purchases.reduce((acc, p) => acc + p.discount, 0);

        let totalCOGS = 0;
        sales.forEach(s => {
          s.items.forEach(si => {
            const item = items.find(i => i.id === si.itemId);
            if (item) {
              let qty = si.quantity;
              if (si.isSubUnitUsed && item.conversionRate) {
                qty = qty / item.conversionRate;
              }
              totalCOGS += qty * item.purchasePrice;
            }
          });
        });

        const grossProfit = totalSales - totalCOGS;
        const netProfit = grossProfit + totalPurchasesDiscounts - totalSalesDiscounts;
        const grossMarginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
        const netMarginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        // Compute profit per item
        const itemStats: { [itemId: string]: { qtySold: number; revenue: number; cost: number; profit: number } } = {};
        
        sales.forEach(s => {
          s.items.forEach(si => {
            const item = items.find(i => i.id === si.itemId);
            if (!item) return;
            
            let qty = si.quantity;
            if (si.isSubUnitUsed && item.conversionRate) {
              qty = qty / item.conversionRate;
            }
            
            if (!itemStats[item.id]) {
              itemStats[item.id] = { qtySold: 0, revenue: 0, cost: 0, profit: 0 };
            }
            
            const costVal = qty * item.purchasePrice;
            itemStats[item.id].qtySold += qty;
            itemStats[item.id].revenue += si.total;
            itemStats[item.id].cost += costVal;
            itemStats[item.id].profit += (si.total - costVal);
          });
        });

        // Filter items based on search query
        const profitItemsList = items.map(item => {
          const stats = itemStats[item.id] || { qtySold: 0, revenue: 0, cost: 0, profit: 0 };
          const margin = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0;
          return {
            ...item,
            ...stats,
            margin
          };
        }).filter(item => {
          if (!profitsSearchQuery) return true;
          return item.name.toLowerCase().includes(profitsSearchQuery.toLowerCase()) || 
                 item.category.toLowerCase().includes(profitsSearchQuery.toLowerCase()) ||
                 item.barcode.includes(profitsSearchQuery);
        }).sort((a, b) => b.profit - a.profit);

        // Group profits by Category
        const categoryStats: { [cat: string]: { qtySold: number; revenue: number; cost: number; profit: number; itemsCount: number } } = {};
        items.forEach(item => {
          const cat = item.category || 'عام';
          const stats = itemStats[item.id] || { qtySold: 0, revenue: 0, cost: 0, profit: 0 };
          if (!categoryStats[cat]) {
            categoryStats[cat] = { qtySold: 0, revenue: 0, cost: 0, profit: 0, itemsCount: 0 };
          }
          categoryStats[cat].itemsCount += 1;
          categoryStats[cat].qtySold += stats.qtySold;
          categoryStats[cat].revenue += stats.revenue;
          categoryStats[cat].cost += stats.cost;
          categoryStats[cat].profit += stats.profit;
        });

        const categoryList = Object.keys(categoryStats).map(cat => {
          const s = categoryStats[cat];
          const margin = s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;
          return {
            category: cat,
            ...s,
            margin
          };
        }).sort((a, b) => b.profit - a.profit);

        // Customer contribution to profits
        const customerProfitStats: { [custId: string]: { name: string; salesCount: number; revenue: number; profit: number } } = {};
        sales.forEach(s => {
          const custId = s.customerId || 'walk_in';
          const custName = s.customerName || 'زبون نقدي عام';
          if (!customerProfitStats[custId]) {
            customerProfitStats[custId] = { name: custName, salesCount: 0, revenue: 0, profit: 0 };
          }
          
          let saleCost = 0;
          s.items.forEach(si => {
            const item = items.find(i => i.id === si.itemId);
            if (item) {
              let qty = si.quantity;
              if (si.isSubUnitUsed && item.conversionRate) {
                qty = qty / item.conversionRate;
              }
              saleCost += qty * item.purchasePrice;
            }
          });

          customerProfitStats[custId].salesCount += 1;
          customerProfitStats[custId].revenue += s.total;
          customerProfitStats[custId].profit += (s.total - saleCost);
        });

        const customerProfitList = Object.keys(customerProfitStats).map(id => ({
          id,
          ...customerProfitStats[id]
        })).sort((a, b) => b.profit - a.profit).slice(0, 5);

        return (
          <div className="print-report-wrapper space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/20 dark:to-emerald-900/10 p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">إجمالي المبيعات (الخام)</span>
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <h4 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {totalSales.toFixed(2)} <span className="text-xs">{baseCurrency.symbol}</span>
                </h4>
                <p className="text-[10px] text-slate-400">القيمة الإجمالية للمبيعات قبل خصم التكاليف</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100/40 dark:from-red-950/20 dark:to-red-900/10 p-5 rounded-2xl border border-red-200/50 dark:border-red-800/40 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">تكلفة البضاعة المباعة (COGS)</span>
                  <div className="p-1.5 bg-red-100 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400">
                    <TrendingDown size={16} />
                  </div>
                </div>
                <h4 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {totalCOGS.toFixed(2)} <span className="text-xs">{baseCurrency.symbol}</span>
                </h4>
                <p className="text-[10px] text-slate-400">تكلفة شراء السلع التي تم بيعها فعلياً</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/20 dark:to-indigo-900/10 p-5 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/40 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الربح الإجمالي (Gross Profit)</span>
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <h4 className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {grossProfit.toFixed(2)} <span className="text-xs">{baseCurrency.symbol}</span>
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>هامش الربح الإجمالي:</span>
                  <span className="font-bold font-mono text-indigo-600">{grossMarginPercent.toFixed(1)}%</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-violet-100/40 dark:from-violet-950/20 dark:to-violet-900/10 p-5 rounded-2xl border border-violet-200/50 dark:border-violet-800/40 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">صافي الأرباح التشغيلية</span>
                  <div className="p-1.5 bg-violet-100 dark:bg-violet-950 rounded-lg text-violet-600 dark:text-violet-400">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <h4 className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">
                  {netProfit.toFixed(2)} <span className="text-xs">{baseCurrency.symbol}</span>
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>هامش الربح الصافي:</span>
                  <span className="font-bold font-mono text-violet-600">{netMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Sub-discounts detail and visual progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" /> ملخص موازنة الخصومات وهوامش الكفاءة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>الخصم الممنوح للزبائن (عبء مالي):</span>
                    <strong className="font-mono text-red-500">-{totalSalesDiscounts.toFixed(2)} {baseCurrency.symbol}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>الخصم المكتسب من الموردين (إيراد إضافي):</span>
                    <strong className="font-mono text-emerald-600">+{totalPurchasesDiscounts.toFixed(2)} {baseCurrency.symbol}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 font-bold">
                    <span>مجموع تأثير الخصومات المتبادلة:</span>
                    <span className={`font-mono ${(totalPurchasesDiscounts - totalSalesDiscounts) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {(totalPurchasesDiscounts - totalSalesDiscounts).toFixed(2)} {baseCurrency.symbol}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>كفاءة هامش الربح الصافي (نسبة مئوية)</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{netMarginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(0, netMarginPercent))}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">المعدل القياسي المقبول تجارياً لهامش الربح الصافي هو 15% - 25% لتجارة التجزئة والمقاولات الخدمية في قطاع التوريدات.</p>
                </div>
              </div>
            </div>

            {/* Items Profits & Search */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Profits per item */}
              <div className="xl:col-span-8 rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>ربحية الأصناف ومبيعاتها بالتفصيل</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500">
                      مرتبة حسب الأكثر ربحاً (اضغط على الصنف لفتح كارت حركاته)
                    </span>
                  </h3>
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="ابحث عن صنف أو قسم..."
                      value={profitsSearchQuery}
                      onChange={(e) => setProfitsSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 rounded-xl text-xs glass-input focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                        <th className="pb-3 pr-2">الصنف والقسم</th>
                        <th className="pb-3 text-center">الكمية المباعة</th>
                        <th className="pb-3 text-center">قيمة المبيعات</th>
                        <th className="pb-3 text-center">تكلفة الشراء</th>
                        <th className="pb-3 text-center">الأرباح المحققة</th>
                        <th className="pb-3 text-left pl-2">هامش الربح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {profitItemsList.map(item => (
                        <tr 
                          key={item.id} 
                          onClick={() => setSelectedItemForLedger(item)}
                          className="hover:bg-slate-500/5 transition cursor-pointer"
                          title="اضغط لفتح حركة كارت الصنف المخزنية بالكامل"
                        >
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-slate-900 dark:text-white hover:text-emerald-500 transition">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">القسم: {item.category} | {item.barcode}</div>
                          </td>
                          <td className="py-2.5 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                            {item.qtySold.toFixed(1)} {item.mainUnit}
                          </td>
                          <td className="py-2.5 text-center font-bold font-mono text-slate-900 dark:text-white">
                            {item.revenue.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-center font-bold font-mono text-slate-500">
                            {item.cost.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-center font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {item.profit.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-left pl-2 font-mono">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${item.margin > 30 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : item.margin > 15 ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40' : item.margin > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' : 'bg-red-100 text-red-700 dark:bg-red-950/40'}`}>
                              {item.margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {profitItemsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400">
                            لا يوجد نتائج تطابق بحثك حالياً.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Profits by Category & Top Customers */}
              <div className="xl:col-span-4 space-y-6">
                {/* Category Profitability */}
                <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Layers size={16} className="text-emerald-500" /> الربحية حسب الأقسام والتصنيفات
                  </h3>
                  <div className="space-y-3.5">
                    {categoryList.map(cat => (
                      <div key={cat.category} className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {cat.profit.toFixed(2)} {baseCurrency.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>المبيعات: {cat.revenue.toFixed(1)} {baseCurrency.symbol}</span>
                          <span>الهامش: <strong className="text-slate-600 dark:text-slate-300 font-mono">{cat.margin.toFixed(1)}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Profit Contribution */}
                <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <BarChart3 size={16} className="text-emerald-500" /> أكثر العملاء مساهمة في الأرباح
                  </h3>
                  <div className="space-y-3">
                    {customerProfitList.map((cust, idx) => {
                      const percentageOfProfit = netProfit > 0 ? (cust.profit / netProfit) * 100 : 0;
                      return (
                        <div 
                          key={cust.id} 
                          onClick={() => {
                            const found = contacts.find(c => c.id === cust.id);
                            if (found) setSelectedContactForLedger(found);
                          }}
                          className="space-y-1 cursor-pointer hover:bg-slate-500/5 p-1 rounded transition"
                          title="اضغط لفتح كشف الذمة والعمليات المالية للعميل"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition">{idx + 1}. {cust.name}</span>
                            <strong className="font-mono text-emerald-600">{cust.profit.toFixed(2)} {baseCurrency.symbol}</strong>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(0, percentageOfProfit))}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>عدد فواتيره: {cust.salesCount}</span>
                            <span>المساهمة في الأرباح: {percentageOfProfit.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. REPORT: TRIAL BALANCE (ميزان المراجعة) */}
      {activeReportTab === 'trial-balance' && (() => {
        let totalOpeningDebit = 0;
        let totalOpeningCredit = 0;
        let totalMovementDebit = 0;
        let totalMovementCredit = 0;
        let totalEndingDebit = 0;
        let totalEndingCredit = 0;

        const rows = contacts.map(c => {
          let openingDebit = 0;
          let openingCredit = 0;
          if (c.initialBalance < 0) {
            openingDebit = Math.abs(c.initialBalance);
          } else {
            openingCredit = c.initialBalance;
          }

          let debitMovements = 0;
          let creditMovements = 0;

          sales
            .filter(s => s.customerId === c.id)
            .forEach(s => {
              const debitVal = s.total - s.paidAmount;
              if (debitVal > 0) debitMovements += debitVal;
              if (s.paidAmount > 0) creditMovements += s.paidAmount;
            });

          purchases
            .filter(p => p.supplierId === c.id)
            .forEach(p => {
              const creditVal = p.total - p.paidAmount;
              if (creditVal > 0) creditMovements += creditVal;
              if (p.paidAmount > 0) debitMovements += p.paidAmount;
            });

          returns
            .filter(r => r.customerId === c.id)
            .forEach(r => {
              creditMovements += r.total;
            });

          const expectedBalance = c.initialBalance + creditMovements - debitMovements;
          const diff = c.currentBalance - expectedBalance;
          if (diff > 0) {
            creditMovements += diff;
          } else if (diff < 0) {
            debitMovements += Math.abs(diff);
          }

          let endingDebit = 0;
          let endingCredit = 0;
          if (c.currentBalance < 0) {
            endingDebit = Math.abs(c.currentBalance);
          } else {
            endingCredit = c.currentBalance;
          }

          totalOpeningDebit += openingDebit;
          totalOpeningCredit += openingCredit;
          totalMovementDebit += debitMovements;
          totalMovementCredit += creditMovements;
          totalEndingDebit += endingDebit;
          totalEndingCredit += endingCredit;

          return {
            id: c.id,
            name: c.name,
            type: c.type === 'customer' ? 'عميل' : c.type === 'supplier' ? 'مورد' : 'عميل ومورد',
            openingDebit,
            openingCredit,
            debitMovements,
            creditMovements,
            endingDebit,
            endingCredit
          };
        });

        let cashOpeningDebit = 0;
        let cashOpeningCredit = 0;
        let cashDebitMovements = 0;
        let cashCreditMovements = 0;

        sales.forEach(s => {
          if (s.paidAmount > 0) cashDebitMovements += s.paidAmount;
        });
        purchases.forEach(p => {
          if (p.paidAmount > 0) cashCreditMovements += p.paidAmount;
        });

        contacts.forEach(c => {
          let debitMovements = 0;
          let creditMovements = 0;
          sales
            .filter(s => s.customerId === c.id)
            .forEach(s => {
              const debitVal = s.total - s.paidAmount;
              if (debitVal > 0) debitMovements += debitVal;
              if (s.paidAmount > 0) creditMovements += s.paidAmount;
            });
          purchases
            .filter(p => p.supplierId === c.id)
            .forEach(p => {
              const creditVal = p.total - p.paidAmount;
              if (creditVal > 0) creditMovements += creditVal;
              if (p.paidAmount > 0) debitMovements += p.paidAmount;
            });
          returns
            .filter(r => r.customerId === c.id)
            .forEach(r => {
              creditMovements += r.total;
            });

          const expectedBalance = c.initialBalance + creditMovements - debitMovements;
          const diff = c.currentBalance - expectedBalance;
          if (diff > 0) {
            cashDebitMovements += diff;
          } else if (diff < 0) {
            cashCreditMovements += Math.abs(diff);
          }
        });

        const cashBalance = cashDebitMovements - cashCreditMovements;
        let cashEndingDebit = cashBalance > 0 ? cashBalance : 0;
        let cashEndingCredit = cashBalance < 0 ? Math.abs(cashBalance) : 0;

        totalOpeningDebit += cashOpeningDebit;
        totalOpeningCredit += cashOpeningCredit;
        totalMovementDebit += cashDebitMovements;
        totalMovementCredit += cashCreditMovements;
        totalEndingDebit += cashEndingDebit;
        totalEndingCredit += cashEndingCredit;

        let invOpeningDebit = 0;
        items.forEach(item => {
          invOpeningDebit += 25 * item.purchasePrice;
        });

        let invDebitMovements = purchases.reduce((acc, p) => acc + p.total, 0);
        let invCreditMovements = 0;
        sales.forEach(s => {
          s.items.forEach(si => {
            const item = items.find(i => i.id === si.itemId);
            if (item) {
              let qty = si.quantity;
              if (si.isSubUnitUsed && item.conversionRate) {
                qty = qty / item.conversionRate;
              }
              invCreditMovements += qty * item.purchasePrice;
            }
          });
        });

        const invBalance = invOpeningDebit + invDebitMovements - invCreditMovements;
        let invEndingDebit = invBalance > 0 ? invBalance : 0;
        let invEndingCredit = invBalance < 0 ? Math.abs(invBalance) : 0;

        totalOpeningDebit += invOpeningDebit;
        totalOpeningCredit += 0;
        totalMovementDebit += invDebitMovements;
        totalMovementCredit += invCreditMovements;
        totalEndingDebit += invEndingDebit;
        totalEndingCredit += invEndingCredit;

        return (
          <div className="print-report-wrapper rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-bold text-md text-emerald-500 flex items-center gap-1.5">
                <Scale size={18} /> ميزان المراجعة المحاسبي العام للأرصدة والحركات
              </h3>
              <button
                onClick={() => {
                  (window as any)._printTargetSelector = '.print-report-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 no-print"
              >
                <Printer size={12} /> طباعة ميزان المراجعة
              </button>
            </div>
            <p className="text-xs text-slate-500">يعرض هذا التقرير الأرصدة الافتتاحية والحركات الدائنة والمدينة للفترة الجارية لكل من الحسابات التجارية (العملاء والموردين)، بالإضافة لحساب الصندوق وحساب تقييم بضاعة المخازن لتسهيل التدقيق والمطابقة السريعة.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-500/5 font-bold">
                    <th className="p-3 text-right" rowSpan={2}>اسم الحساب المالي / الأصل</th>
                    <th className="p-3 text-center" rowSpan={2}>نوع الحساب</th>
                    <th className="p-1.5 text-center border-b border-slate-200 dark:border-slate-800" colSpan={2}>الرصيد الافتتاحي</th>
                    <th className="p-1.5 text-center border-b border-slate-200 dark:border-slate-800" colSpan={2}>حركات الفترة الحالية</th>
                    <th className="p-1.5 text-center border-b border-slate-200 dark:border-slate-800" colSpan={2}>الرصيد الختامي</th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-500/5 text-[10px]">
                    <th className="p-1.5 text-center font-mono">مدين (عليه)</th>
                    <th className="p-1.5 text-center font-mono">دائن (له)</th>
                    <th className="p-1.5 text-center font-mono">مدين (+)</th>
                    <th className="p-1.5 text-center font-mono">دائن (-)</th>
                    <th className="p-1.5 text-center font-mono">مدين (عليه)</th>
                    <th className="p-1.5 text-center font-mono">دائن (له)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white font-medium">
                  {/* Row: Cash */}
                  <tr className="hover:bg-slate-500/5 transition bg-emerald-500/5">
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">💵 حساب الصندوق والجرود النقدية</td>
                    <td className="p-3 text-center text-slate-500">نقدية وأصول</td>
                    <td className="p-2 text-center font-mono">{cashOpeningDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono">{cashOpeningCredit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-emerald-500 font-bold">+{cashDebitMovements.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-red-500">-{cashCreditMovements.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono bg-emerald-500/10 font-extrabold">{cashEndingDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono">{cashEndingCredit.toFixed(2)}</td>
                  </tr>

                  {/* Row: Inventory */}
                  <tr className="hover:bg-slate-500/5 transition bg-amber-500/5">
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">📦 حساب مخزون البضائع المتاحة</td>
                    <td className="p-3 text-center text-slate-500">مخزون وأصول</td>
                    <td className="p-2 text-center font-mono">{invOpeningDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono">0.00</td>
                    <td className="p-2 text-center font-mono text-emerald-500 font-bold">+{invDebitMovements.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-red-500">-{invCreditMovements.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono bg-amber-500/10 font-extrabold">{invEndingDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono">{invEndingCredit.toFixed(2)}</td>
                  </tr>

                  {/* Account Rows */}
                  {rows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-500/5 transition">
                      <td className="p-3 font-semibold">{row.name}</td>
                      <td className="p-3 text-center text-slate-500 text-[10px]">{row.type}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{row.openingDebit > 0 ? row.openingDebit.toFixed(2) : '-'}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{row.openingCredit > 0 ? row.openingCredit.toFixed(2) : '-'}</td>
                      <td className="p-2 text-center font-mono text-slate-600 dark:text-slate-300">{row.debitMovements > 0 ? row.debitMovements.toFixed(2) : '-'}</td>
                      <td className="p-2 text-center font-mono text-slate-600 dark:text-slate-300">{row.creditMovements > 0 ? row.creditMovements.toFixed(2) : '-'}</td>
                      <td className={`p-2 text-center font-mono font-bold ${row.endingDebit > 0 ? 'text-amber-500' : ''}`}>{row.endingDebit > 0 ? row.endingDebit.toFixed(2) : '-'}</td>
                      <td className={`p-2 text-center font-mono font-bold ${row.endingCredit > 0 ? 'text-emerald-500' : ''}`}>{row.endingCredit > 0 ? row.endingCredit.toFixed(2) : '-'}</td>
                    </tr>
                  ))}

                  {/* Total row */}
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-500/10 font-extrabold text-slate-900 dark:text-white">
                    <td className="p-3 font-black text-right" colSpan={2}>المجموع الإجمالي العام المتوازن</td>
                    <td className="p-2 text-center font-mono">{totalOpeningDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono">{totalOpeningCredit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-emerald-600 dark:text-emerald-400">{totalMovementDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-red-500">{totalMovementCredit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-amber-500">{totalEndingDebit.toFixed(2)}</td>
                    <td className="p-2 text-center font-mono text-emerald-500">{totalEndingCredit.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-2 items-center text-[10px] bg-slate-500/5 p-3 rounded-xl border border-white/5 text-slate-400">
              <HelpCircle size={14} className="text-emerald-500" />
              <span>ملاحظة تدقيقية محاسبية: يتساوى إجمالي المدين والدائن في الأرصدة الافتتاحية والختامية والحركات عند إدخال كافة الحسابات المزدوجة، ويتم إدراج الصندوق والمخازن لضمان المطابقة المتوازنة.</span>
            </div>
          </div>
        );
      })()}

      {/* 6. REPORT: CLOSING FINANCIAL STATEMENTS & PROFITS */}
      {activeReportTab === 'final-accounts' && (() => {
        const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
        const totalPurchases = purchases.reduce((acc, p) => acc + p.total, 0);
        const totalSalesDiscounts = sales.reduce((acc, s) => acc + s.discount, 0);
        const totalPurchasesDiscounts = purchases.reduce((acc, p) => acc + p.discount, 0);

        let totalCOGS = 0;
        sales.forEach(s => {
          s.items.forEach(si => {
            const item = items.find(i => i.id === si.itemId);
            if (item) {
              let qty = si.quantity;
              if (si.isSubUnitUsed && item.conversionRate) {
                qty = qty / item.conversionRate;
              }
              totalCOGS += qty * item.purchasePrice;
            }
          });
        });

        const grossProfit = totalSales - totalCOGS;
        const netProfit = grossProfit + totalPurchasesDiscounts - totalSalesDiscounts;

        let cashInflows = sales.reduce((acc, s) => acc + s.paidAmount, 0);
        let cashOutflows = purchases.reduce((acc, p) => acc + p.paidAmount, 0);

        contacts.forEach(c => {
          let debitMovements = 0;
          let creditMovements = 0;
          sales.filter(s => s.customerId === c.id).forEach(s => {
            const debitVal = s.total - s.paidAmount;
            if (debitVal > 0) debitMovements += debitVal;
            if (s.paidAmount > 0) creditMovements += s.paidAmount;
          });
          purchases.filter(p => p.supplierId === c.id).forEach(p => {
            const creditVal = p.total - p.paidAmount;
            if (creditVal > 0) creditMovements += creditVal;
            if (p.paidAmount > 0) debitMovements += p.paidAmount;
          });
          returns.filter(r => r.customerId === c.id).forEach(r => {
            creditMovements += r.total;
          });

          const expectedBalance = c.initialBalance + creditMovements - debitMovements;
          const diff = c.currentBalance - expectedBalance;
          if (diff > 0) {
            cashInflows += diff;
          } else if (diff < 0) {
            cashOutflows += Math.abs(diff);
          }
        });

        const cashAsset = Math.max(0, cashInflows - cashOutflows);
        
        let inventoryAsset = 0;
        if (branchStock && branchStock.length > 0) {
          branchStock.forEach(bs => {
            const item = items.find(i => i.id === bs.itemId);
            if (item) {
              inventoryAsset += bs.quantity * item.purchasePrice;
            }
          });
        } else {
          let invOpeningDebit = 0;
          items.forEach(item => {
            invOpeningDebit += 25 * item.purchasePrice;
          });
          inventoryAsset = invOpeningDebit + totalPurchases - totalCOGS;
        }

        const accountsReceivable = contacts
          .filter(c => c.currentBalance < 0)
          .reduce((acc, c) => acc + Math.abs(c.currentBalance), 0);

        const totalAssets = cashAsset + inventoryAsset + accountsReceivable;

        const accountsPayable = contacts
          .filter(c => c.currentBalance > 0)
          .reduce((acc, c) => acc + c.currentBalance, 0);

        const initialCapital = Math.max(0, totalAssets - accountsPayable - netProfit);
        const totalLiabilitiesAndEquity = accountsPayable + initialCapital + netProfit;

        return (
          <div className="print-report-wrapper grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Statement */}
            <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
              <h3 className="font-bold text-md text-emerald-500 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <Calculator size={18} /> قائمة الدخل والأرباح الختامية الجارية
              </h3>
              
              <div className="space-y-3 text-xs pt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="font-bold text-slate-800 dark:text-slate-200">إجمالي إيرادات المبيعات المحققة</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{totalSales.toFixed(2)} شيكل</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 pl-4 bg-red-500/5 rounded-lg">
                  <span className="text-red-500 font-semibold">يخصم: تكلفة البضائع والسلع المباعة (COGS)</span>
                  <span className="font-mono font-bold text-red-500">-{totalCOGS.toFixed(2)} شيكل</span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-500/10 rounded-lg px-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">إجمالي مجمل الربح التشغيلي (Gross Profit)</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{grossProfit.toFixed(2)} شيكل</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-slate-600 dark:text-slate-300">يضاف: الخصومات المكتسبة من الموردين</span>
                  <span className="font-mono font-bold text-emerald-500">+{totalPurchasesDiscounts.toFixed(2)} شيكل</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40 pl-4">
                  <span className="text-slate-600 dark:text-slate-300">يخصم: الخصومات الممنوحة للعملاء والزبائن</span>
                  <span className="font-mono font-bold text-red-400">-{totalSalesDiscounts.toFixed(2)} شيكل</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t-2 border-emerald-500/30 bg-emerald-500/10 rounded-xl px-3 mt-4">
                  <span className="font-black text-sm text-slate-950 dark:text-white">صافي الأرباح النهائية للمجموعة</span>
                  <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {netProfit.toFixed(2)} شيكل
                  </span>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 italic pt-2">
                * يتم احتساب تكلفة البضاعة المباعة تلقائياً وبدقة بالرجوع لأسعار التوريد والشراء المسجلة لكل صنف لضمان حقيقة الربح التشغيلي.
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
              <h3 className="font-bold text-md text-amber-500 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <FileSpreadsheet size={18} /> الميزانية العمومية والمركز المالي الختامي
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Assets Column */}
                <div className="space-y-3 bg-slate-500/5 p-3 rounded-xl border border-white/5">
                  <h4 className="font-bold text-emerald-500 border-b border-slate-200 dark:border-slate-800 pb-1.5">الأصول المتداولة (Assets)</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">نقدية الصندوق</span>
                    <span className="font-mono font-semibold">{cashAsset.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">تقييم البضاعة المخزنة</span>
                    <span className="font-mono font-semibold">{inventoryAsset.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">ذمم العملاء المدينة</span>
                    <span className="font-mono font-semibold">{accountsReceivable.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 font-bold text-slate-900 dark:text-white">
                    <span>إجمالي الأصول</span>
                    <span className="font-mono">{totalAssets.toFixed(2)}</span>
                  </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-3 bg-slate-500/5 p-3 rounded-xl border border-white/5">
                  <h4 className="font-bold text-amber-500 border-b border-slate-200 dark:border-slate-800 pb-1.5">الالتزامات وحقوق الملكية</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">ذمم الموردين الدائنة</span>
                    <span className="font-mono font-semibold">{accountsPayable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">رأس المال الافتتاحي</span>
                    <span className="font-mono font-semibold">{initialCapital.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-bold">الأرباح النهائية الجارية</span>
                    <span className="font-mono font-bold">{netProfit.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 font-bold text-slate-900 dark:text-white">
                    <span>إجمالي الخصوم والملكيات</span>
                    <span className="font-mono">{totalLiabilitiesAndEquity.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.1 ? (
                <div className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg border border-emerald-500/20 text-center font-bold">
                  ✓ ميزان المركز المالي متوازن محاسبياً بالكامل بنسبة 100%!
                </div>
              ) : (
                <div className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2.5 rounded-lg border border-amber-500/20 text-center font-bold">
                  ⚠ جاري تسوية القيد المزدوج لتوازن حسابات المخزون المحدثة.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
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
                  {showInvoiceDate && (
                    <p className="text-xs text-slate-500">{new Date(selectedTx.date).toLocaleString('ar-EG')}</p>
                  )}
                </div>
                
                {showInvoiceLogo && (
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
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                {showInvoiceBranch ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-1 col-span-2">
                    <span className="text-slate-400 block font-bold">{selectedTxType === 'sale' ? 'العميل المستلم:' : 'المورد المورد:'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {selectedTxType === 'sale' ? (selectedTx as Sale).customerName : (selectedTx as Purchase).supplierName}
                    </span>
                  </div>
                )}
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
                onClick={() => {
                  (window as any)._printTargetSelector = '.fixed .print-invoice-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Printer size={14} /> طباعة الفاتورة أو التقرير
              </button>
              <button
                onClick={async () => {
                  const { usePrint } = await import('../utils/usePrint');
                  const { exportInvoiceToPDF } = usePrint();
                  const settings = {
                    name: shopSettings?.name || 'غزة كاش ERP',
                    address: shopSettings?.address || 'غزة، فلسطين',
                    phone: shopSettings?.phone || '',
                    logoText: shopSettings?.logoText || 'غك'
                  };
                  await exportInvoiceToPDF(
                    selectedTx,
                    selectedTxType as any,
                    settings,
                    activeCurrency?.symbol || '₪'
                  );
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <FileText size={14} /> تصدير PDF رسمي 📄
              </button>
            </div>
          </div>
        </div>
      )}

      {showSalesReportPrintModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="print-report-wrapper bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close / Action controls (no-print) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 no-print">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Printer size={18} className="text-emerald-500" /> معاينة تقرير المبيعات المطبوع (PDF)
              </h3>
              <button
                onClick={() => setShowSalesReportPrintModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Document Body (Printed part) */}
            <div className="space-y-6 text-right text-slate-900 dark:text-slate-100">
              {/* Header: Logo & Info */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <h1 className="font-extrabold text-xl text-slate-900 dark:text-white">كشف حركة المبيعات التفصيلي</h1>
                  <p className="text-xs text-slate-500 font-bold">نظام غزة كاش المحاسبي المتكامل</p>
                  <p className="text-[10px] text-slate-400">تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</p>
                </div>

                <div className="flex flex-col items-end text-left space-y-1 text-xs">
                  {showInvoiceLogo && logoUrl && (
                    <img src={logoUrl} alt="Company Logo" className="w-14 h-14 rounded-xl object-contain border border-slate-200 dark:border-slate-800 p-1 bg-white mb-1" referrerPolicy="no-referrer" />
                  )}
                  <span className="font-bold text-slate-800 dark:text-slate-200">الشركة/المجموعة الحالية</span>
                  <span className="text-slate-500 text-[10px]">
                    المستودع المختار: {salesBranchId === 'all' ? 'جميع المستودعات والعمليات' : (branches.find(b => b.id === salesBranchId)?.name || 'محدد')}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    نطاق فلترة التاريخ: {salesDateFrom || 'البداية'} وحتى {salesDateTo || 'النهاية'}
                  </span>
                </div>
              </div>

              {/* KPI Summary Rows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-500 block">إجمالي المبيعات</span>
                  <strong className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {filteredSales.reduce((acc, s) => acc + s.total, 0).toFixed(2)} {baseCurrency.symbol}
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-500 block">المقبوض نقداً (كاش)</span>
                  <strong className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">
                    {filteredSales.reduce((acc, s) => acc + s.paidAmount, 0).toFixed(2)} {baseCurrency.symbol}
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-500 block">الذمم الآجلة المتبقية</span>
                  <strong className="text-sm font-black font-mono text-amber-500">
                    {(filteredSales.reduce((acc, s) => acc + s.total, 0) - filteredSales.reduce((acc, s) => acc + s.paidAmount, 0)).toFixed(2)} {baseCurrency.symbol}
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-500 block">عدد الفواتير الصادرة</span>
                  <strong className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                    {filteredSales.length} فاتورة
                  </strong>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-700 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/40">
                      <th className="py-2 px-2">رقم الفاتورة</th>
                      {showInvoiceDate && <th className="py-2 px-1">تاريخ ووقت المعاملة</th>}
                      <th className="py-2 px-1">العميل المستلم</th>
                      {showInvoiceBranch && <th className="py-2 px-1">موقع الفرع</th>}
                      <th className="py-2 px-1 text-center">نوع الدفع</th>
                      <th className="py-2 px-1 text-center">الصافي</th>
                      <th className="py-2 px-1 text-center">المدفوع كاش</th>
                      <th className="py-2 px-1 text-left">المتبقي ذمم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredSales.length > 0 ? (
                      filteredSales.map(s => {
                        const remaining = s.total - s.paidAmount;
                        const saleCurr = currList.find(c => c.id === getSaleCurrencyId(s)) || baseCurrency;
                        return (
                          <tr key={s.id} className="hover:bg-slate-500/5">
                            <td className="py-2.5 px-2 font-bold font-mono">{s.invoiceNo}</td>
                            {showInvoiceDate && (
                              <td className="py-2.5 px-1 text-slate-500">
                                {new Date(s.date).toLocaleString('ar-EG')}
                              </td>
                            )}
                            <td className="py-2.5 px-1 font-semibold">{s.customerName}</td>
                            {showInvoiceBranch && (
                              <td className="py-2.5 px-1 text-slate-500">{s.branchName}</td>
                            )}
                            <td className="py-2.5 px-1 text-center">
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${s.paymentType === 'cash' ? 'bg-emerald-50/80 text-emerald-700' : 'bg-amber-50/80 text-amber-700'}`}>
                                {s.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                              </span>
                            </td>
                            <td className="py-2.5 px-1 text-center font-bold font-mono text-emerald-600">
                              {s.total.toFixed(2)} {saleCurr.symbol}
                            </td>
                            <td className="py-2.5 px-1 text-center font-mono text-slate-500">
                              {s.paidAmount.toFixed(2)} {saleCurr.symbol}
                            </td>
                            <td className="py-2.5 px-1 text-left font-bold font-mono text-amber-600">
                              {remaining > 0 ? `${remaining.toFixed(2)} ${saleCurr.symbol}` : 'خالص ✓'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                          لا يوجد فواتير مبيعات تطابق التصفية الحالية لتضمينها في هذا الكشف.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold">توقيع المحاسب المختص</span>
                  <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32"></div>
                </div>
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold">ختم المنشأة الرسمي</span>
                  <div className="h-10 w-20 border border-dashed border-slate-300 dark:border-slate-700 rounded-full mx-auto flex items-center justify-center text-[8px] text-slate-300 italic">الختم هنا</div>
                </div>
                <div className="space-y-4">
                  <span className="text-slate-400 block font-bold">توقيع واعتماد الإدارة</span>
                  <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32"></div>
                </div>
              </div>
            </div>

            {/* Print Action Row (no-print) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
              <button
                onClick={() => setShowSalesReportPrintModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                إغلاق المعاينة
              </button>
              <button
                onClick={() => {
                  (window as any)._printTargetSelector = '.fixed .print-report-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Printer size={14} /> طباعة الكشف الآن
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { usePrint } = await import('../utils/usePrint');
                  const { exportReportToPDF } = usePrint();
                  
                  // Construct Headers
                  const reportHeaders: string[] = ['رقم الفاتورة'];
                  const widths: string[] = ['15%'];
                  
                  if (showInvoiceDate) {
                    reportHeaders.push('تاريخ ووقت المعاملة');
                    widths.push('20%');
                  }
                  
                  reportHeaders.push('العميل المستلم');
                  widths.push('20%');
                  
                  if (showInvoiceBranch) {
                    reportHeaders.push('موقع الفرع');
                    widths.push('15%');
                  }
                  
                  reportHeaders.push('نوع الدفع', 'الصافي', 'المدفوع كاش', 'المتبقي ذمم');
                  widths.push('10%', '10%', '10%', '10%');
                  
                  // Construct Rows
                  const reportRows = filteredSales.map(s => {
                    const remaining = s.total - s.paidAmount;
                    const saleCurr = currList.find(c => c.id === getSaleCurrencyId(s)) || baseCurrency;
                    const row: string[] = [s.invoiceNo];
                    
                    if (showInvoiceDate) {
                      row.push(new Date(s.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }));
                    }
                    
                    row.push(s.customerName || 'زبون نقدي عام');
                    
                    if (showInvoiceBranch) {
                      row.push(s.branchName || 'الفرع الرئيسي');
                    }
                    
                    row.push(
                      s.paymentType === 'cash' ? 'نقدي' : 'آجل',
                      `${s.total.toFixed(2)} ${saleCurr.symbol}`,
                      `${s.paidAmount.toFixed(2)} ${saleCurr.symbol}`,
                      remaining > 0 ? `${remaining.toFixed(2)} ${saleCurr.symbol}` : 'خالص'
                    );
                    
                    return row;
                  });
                  
                  // Aggregate totals
                  const totalSum = filteredSales.reduce((acc, s) => acc + s.total, 0);
                  const paidSum = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
                  const remainingSum = totalSum - paidSum;
                  
                  const reportTotals = [
                    { label: 'إجمالي المبيعات:', value: `${totalSum.toFixed(2)} ${baseCurrency.symbol}` },
                    { label: 'المقبوض كاش:', value: `${paidSum.toFixed(2)} ${baseCurrency.symbol}` },
                    { label: 'المتبقي ذمم:', value: `${remainingSum.toFixed(2)} ${baseCurrency.symbol}`, isFinal: true }
                  ];
                  
                  const settings = {
                    name: shopSettings?.name || 'غزة كاش ERP',
                    address: shopSettings?.address || 'غزة، فلسطين',
                    phone: shopSettings?.phone || ''
                  };
                  
                  await exportReportToPDF(
                    'تقرير حركة المبيعات وتفاصيل الفواتير',
                    `كشف للفترة الحالية يضم ${filteredSales.length} فواتير مبيعات صادرة`,
                    reportHeaders,
                    reportRows,
                    widths,
                    reportTotals,
                    settings
                  );
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <FileText size={14} /> تصدير الكشف كـ PDF 📄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
