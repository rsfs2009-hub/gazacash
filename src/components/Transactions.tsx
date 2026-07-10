/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, ArrowLeftRight, FileCode, Plus, Trash2, Printer, Search, ClipboardList, AlertCircle, Save, X } from 'lucide-react';
import { Item, CustomerSupplier, Purchase, SalesReturn, Quotation, TransactionItem, Branch, Currency } from '../types';

interface TransactionsProps {
  items: Item[];
  contacts: CustomerSupplier[];
  branches: Branch[];
  purchases: Purchase[];
  returns: SalesReturn[];
  quotations: Quotation[];
  onSavePurchase: (purchase: Omit<Purchase, 'id' | 'invoiceNo' | 'date'>) => void;
  onSaveReturn: (ret: Omit<SalesReturn, 'id' | 'returnNo' | 'date'>) => void;
  onSaveQuotation: (quo: Omit<Quotation, 'id' | 'quotationNo' | 'date'>) => void;
  onAddContact?: (contact: Omit<CustomerSupplier, 'id' | 'currentBalance'>) => void;
  activeCurrency?: Currency;
  initialTab?: 'purchase' | 'return' | 'quotation';
}

export default function Transactions({
  items,
  contacts,
  branches,
  purchases,
  returns,
  quotations,
  onSavePurchase,
  onSaveReturn,
  onSaveQuotation,
  onAddContact,
  activeCurrency,
  initialTab
}: TransactionsProps) {
  const currency = activeCurrency || { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true };

  const [activeTab, setActiveTab] = React.useState<'purchase' | 'return' | 'quotation'>(initialTab || 'purchase');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Supplier Purchase states
  const [purchaseCart, setPurchaseCart] = useState<{
    itemId: string;
    itemName: string;
    quantity: number;
    purchasePrice: number;
    unitName: string;
  }[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseBranch, setPurchaseBranch] = useState('branch_main');
  const [purchaseItemSearch, setPurchaseItemSearch] = useState('');
  const [purchasePaymentType, setPurchasePaymentType] = useState<'cash' | 'credit'>('cash');
  const [purchaseDiscount, setPurchaseDiscount] = useState<number>(0);
  const [purchasePaidAmount, setPurchasePaidAmount] = useState<number>(0);
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  // Quick Add Supplier States
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierInitialBalance, setNewSupplierInitialBalance] = useState<number>(0);
  const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit'); // credit: له (+), debit: عليه (-)
  const [shouldSelectLastAdded, setShouldSelectLastAdded] = useState(false);

  // Monitor contacts to auto-select newly added supplier
  React.useEffect(() => {
    if (shouldSelectLastAdded && contacts.length > 0) {
      const suppliers = contacts.filter(c => c.type === 'supplier' || c.type === 'both');
      if (suppliers.length > 0) {
        const lastSupplier = suppliers[suppliers.length - 1];
        setSelectedSupplierId(lastSupplier.id);
      }
      setShouldSelectLastAdded(false);
    }
  }, [contacts, shouldSelectLastAdded]);

  const handleQuickAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      toast('يرجى كتابة اسم المورد المالي الجديد', 'warning');
      return;
    }
    
    if (!onAddContact) {
      toast('ميزة إضافة الموردين غير متاحة حالياً', 'error');
      return;
    }

    const calculatedBalance = balanceType === 'credit' ? Math.abs(newSupplierInitialBalance) : -Math.abs(newSupplierInitialBalance);
    
    onAddContact({
      name: newSupplierName,
      type: 'supplier',
      phone: newSupplierPhone || 'بدون رقم',
      address: newSupplierAddress || 'العنوان الافتراضي',
      initialBalance: calculatedBalance,
    });

    setShouldSelectLastAdded(true);

    // Clean up
    setNewSupplierName('');
    setNewSupplierPhone('');
    setNewSupplierAddress('');
    setNewSupplierInitialBalance(0);
    setBalanceType('credit');
    setShowAddSupplierModal(false);

    toast('تم تسجيل المورد الجديد بنجاح وجاري اختياره تلقائياً! 🎉', 'success');
  };

  // Customer Return states
  const [returnItemId, setReturnItemId] = useState('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnItemIsSub, setReturnItemIsSub] = useState(false);
  const [returnCustomerId, setReturnCustomerId] = useState('');
  const [returnBranch, setReturnBranch] = useState('branch_main');
  const [originalInv, setOriginalInv] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  // Price Quotation states
  const [quotationCart, setQuotationCart] = useState<{
    itemId: string;
    itemName: string;
    quantity: number;
    salePrice: number;
    unitName: string;
  }[]>([]);
  const [selectedQuotationCustomerId, setSelectedQuotationCustomerId] = useState('');
  const [quotationItemSearch, setQuotationItemSearch] = useState('');
  const [quotationValidDays, setQuotationValidDays] = useState<number>(7);
  const [quotationDiscount, setQuotationDiscount] = useState<number>(0);
  const [quotationNotes, setQuotationNotes] = useState('');

  // Helpers - Filter items
  const filteredPurchaseItems = purchaseItemSearch.trim() === ''
    ? []
    : items.filter(item => item.name.toLowerCase().includes(purchaseItemSearch.toLowerCase()) || item.barcode.includes(purchaseItemSearch));

  const filteredQuotationItems = quotationItemSearch.trim() === ''
    ? []
    : items.filter(item => item.name.toLowerCase().includes(quotationItemSearch.toLowerCase()) || item.barcode.includes(quotationItemSearch));

  // --- Purchase Cart Actions ---
  const addPurchaseItem = (item: Item) => {
    const existingIndex = purchaseCart.findIndex(entry => entry.itemId === item.id);
    if (existingIndex > -1) {
      const updated = [...purchaseCart];
      updated[existingIndex].quantity += 1;
      setPurchaseCart(updated);
    } else {
      setPurchaseCart([...purchaseCart, {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        purchasePrice: item.purchasePrice,
        unitName: item.mainUnit
      }]);
    }
    setPurchaseItemSearch('');
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseCart(purchaseCart.filter((_, idx) => idx !== index));
  };

  const submitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast('الرجاء اختيار المورد أولاً', 'warning');
      return;
    }
    if (purchaseCart.length === 0) {
      toast('السلة فارغة! لا توجد مواد شراء', 'warning');
      return;
    }

    const supplier = contacts.find(c => c.id === selectedSupplierId);
    const branch = branches.find(b => b.id === purchaseBranch);

    const subTotal = purchaseCart.reduce((sum, entry) => sum + (entry.purchasePrice * entry.quantity), 0);
    const total = Math.max(0, subTotal - purchaseDiscount);

    const purchaseItems: TransactionItem[] = purchaseCart.map(entry => ({
      itemId: entry.itemId,
      itemName: entry.itemName,
      isSubUnitUsed: false,
      quantity: entry.quantity,
      unitName: entry.unitName,
      price: entry.purchasePrice,
      total: entry.purchasePrice * entry.quantity
    }));

    onSavePurchase({
      supplierId: selectedSupplierId,
      supplierName: supplier ? supplier.name : 'مورد عام مجهول',
      branchId: purchaseBranch,
      branchName: branch ? branch.name : 'الفرع الرئيسي',
      items: purchaseItems,
      subTotal,
      discount: purchaseDiscount,
      total,
      paidAmount: purchasePaymentType === 'cash' ? total : purchasePaidAmount,
      paymentType: purchasePaymentType,
      notes: purchaseNotes,
      currencyId: currency.id,
      currencyRate: currency.exchangeRate
    });

    // Reset Form
    setPurchaseCart([]);
    setSelectedSupplierId('');
    setPurchaseNotes('');
    setPurchaseDiscount(0);
    setPurchasePaidAmount(0);
    toast('تم حفظ فاتورة شراء المخزون وتحديث الكميات وحسابات المورد المعتمدة! 📦', 'success');
  };

  // --- Return Action ---
  const submitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnCustomerId) {
      toast('الرجاء اختيار حساب العميل المرتجع منه', 'warning');
      return;
    }
    if (!returnItemId) {
      toast('الرجاء تحديد الصنف المرتجع', 'warning');
      return;
    }
    if (returnQty <= 0) {
      toast('الكمية المرجوعة يجب أن تفوق الصفر', 'warning');
      return;
    }

    const customer = contacts.find(c => c.id === returnCustomerId);
    const item = items.find(i => i.id === returnItemId);

    if (!item) return;

    const returnPrice = returnItemIsSub
      ? (item.subUnitSalePrice || item.salePrice / (item.conversionRate || 1))
      : item.salePrice;

    const returnItemTotal = returnPrice * returnQty;

    const returnItems: TransactionItem[] = [{
      itemId: returnItemId,
      itemName: item.name,
      isSubUnitUsed: returnItemIsSub,
      quantity: returnQty,
      unitName: returnItemIsSub ? (item.subUnitName || 'حبة') : item.mainUnit,
      price: returnPrice,
      total: returnItemTotal
    }];

    onSaveReturn({
      originalInvoiceNo: originalInv || undefined,
      customerId: returnCustomerId,
      customerName: customer ? customer.name : 'زبون غير معروف',
      branchId: returnBranch,
      items: returnItems,
      total: returnItemTotal,
      notes: returnNotes
    });

    // Reset Form
    setReturnItemId('');
    setReturnQty(1);
    setReturnCustomerId('');
    setOriginalInv('');
    setReturnNotes('');
    toast('تم تسجيل سند مرتجع المبيعات وإدخال الكمية للمستودع وإعادة قيمة الذمة المالية للعميل! 🔄', 'success');
  };

  // --- Quotation Cart Actions ---
  const addQuotationItem = (item: Item) => {
    const existingIndex = quotationCart.findIndex(entry => entry.itemId === item.id);
    if (existingIndex > -1) {
      const updated = [...quotationCart];
      updated[existingIndex].quantity += 1;
      setQuotationCart(updated);
    } else {
      setQuotationCart([...quotationCart, {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        salePrice: item.salePrice,
        unitName: item.mainUnit
      }]);
    }
    setQuotationItemSearch('');
  };

  const removeQuotationItem = (index: number) => {
    setQuotationCart(quotationCart.filter((_, idx) => idx !== index));
  };

  const submitQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotationCustomerId) {
      toast('يرجى اختيار العميل لعرض الأسعار أولاً', 'warning');
      return;
    }
    if (quotationCart.length === 0) {
      toast('سلة العرض فارغة، يرجى إضافة أصناف', 'warning');
      return;
    }

    const customer = contacts.find(c => c.id === selectedQuotationCustomerId);
    const subTotal = quotationCart.reduce((sum, entry) => sum + (entry.salePrice * entry.quantity), 0);
    const total = Math.max(0, subTotal - quotationDiscount);

    const quotationItems: TransactionItem[] = quotationCart.map(entry => ({
      itemId: entry.itemId,
      itemName: entry.itemName,
      isSubUnitUsed: false,
      quantity: entry.quantity,
      unitName: entry.unitName,
      price: entry.salePrice,
      total: entry.salePrice * entry.quantity
    }));

    // Calculate dynamic valid until date
    const today = new Date();
    today.setDate(today.getDate() + quotationValidDays);
    const validUntilDateStr = today.toISOString().split('T')[0];

    onSaveQuotation({
      validUntil: validUntilDateStr,
      customerId: selectedQuotationCustomerId,
      customerName: customer ? customer.name : 'عميل غير محدد',
      items: quotationItems,
      subTotal,
      discount: quotationDiscount,
      total,
      notes: quotationNotes
    });

    // Reset Form
    setQuotationCart([]);
    setSelectedQuotationCustomerId('');
    setQuotationNotes('');
    setQuotationDiscount(0);
    toast('تم حفظ وتحديث عرض الأسعار بنجاح! جاهز للتصدير أو المراجعة الطباعية. 📄', 'success');
  };

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('purchase')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'purchase' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <ShoppingBag size={16} /> تسجيل فواتير المشتريات (تأمين المخزن)
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'return' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <ArrowLeftRight size={16} /> مرتجع المبيعات (نقض بضائع)
        </button>
        <button
          onClick={() => setActiveTab('quotation')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'quotation' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <FileCode size={16} /> نظام عروض الأسعار المقترحة
        </button>
      </div>

      {/* 1. TAB: PURCHASES */}
      {activeTab === 'purchase' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Purchase Builder */}
          <div className="xl:col-span-8 space-y-4">
            <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
              <h3 className="font-bold text-md text-slate-800 dark:text-slate-100">بناء قائمة أصناف الشراء والتوريد</h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={purchaseItemSearch}
                  onChange={(e) => setPurchaseItemSearch(e.target.value)}
                  placeholder="ابحث باسم الصنف أو باركود الصنف لتوريده للمخزن..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                />
                
                {purchaseItemSearch && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-950 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto border border-emerald-500/20">
                    {filteredPurchaseItems.length === 0 ? (
                      <p className="text-center text-xs py-3 text-slate-400">لا توجد أصناف مطابقة للبحث</p>
                    ) : (
                      filteredPurchaseItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => addPurchaseItem(item)}
                          className="p-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-950 dark:text-white cursor-pointer rounded-lg flex justify-between"
                        >
                          <span>{item.name} ({item.mainUnit})</span>
                          <span className="font-mono text-slate-500">سعر الشراء الافتراضي: {item.purchasePrice}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Purchase Cart Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="pb-2">اسم صنف التوريد</th>
                      <th className="pb-2 text-center">الكمية المشتراة</th>
                      <th className="pb-2 text-center">تكلفة الشراء (للكبرى)</th>
                      <th className="pb-2 text-center">الإجمالي الفرعي</th>
                      <th className="pb-2 pl-2">إزالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white font-medium">
                    {purchaseCart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">السلة فارغة، أضف بضاعة شراء لتوريدها</td>
                      </tr>
                    ) : (
                      purchaseCart.map((entry, index) => (
                        <tr key={entry.itemId}>
                          <td className="py-2.5">
                            <div>{entry.itemName}</div>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
                              الوحدة: {entry.unitName}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <input
                              type="number"
                              value={entry.quantity}
                              onChange={(e) => {
                                const updated = [...purchaseCart];
                                updated[index].quantity = Math.max(1, +e.target.value);
                                setPurchaseCart(updated);
                              }}
                              className="w-16 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-center">
                            <input
                              type="number"
                              value={entry.purchasePrice}
                              onChange={(e) => {
                                const updated = [...purchaseCart];
                                updated[index].purchasePrice = Math.max(0, +e.target.value);
                                setPurchaseCart(updated);
                              }}
                              className="w-20 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {(entry.purchasePrice * entry.quantity).toFixed(2)}
                          </td>
                          <td className="py-2.5 pl-2 text-center">
                            <button type="button" onClick={() => removePurchaseItem(index)} className="text-red-500 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Checkout Purchase details panel */}
          <div className="xl:col-span-4 rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md flex flex-col space-y-4">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 pb-2 border-b border-white/10">سند الفاتورة والحساب الجاري</h3>
            
            <form onSubmit={submitPurchase} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">اختر حساب المورد المالي</label>
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(true)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={12} /> مورد جديد؟
                  </button>
                </div>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  required
                >
                  <option value="">-- حدد المورد --</option>
                  {contacts.filter(c => c.type === 'supplier' || c.type === 'both').map(supp => (
                    <option key={supp.id} value={supp.id}>{supp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">مستودع الاستلام والترصيد</label>
                <select
                  value={purchaseBranch}
                  onChange={(e) => setPurchaseBranch(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">طريقة الدفع للمورد</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPurchasePaymentType('cash')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${purchasePaymentType === 'cash' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    نقدي كامل (كاش)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchasePaymentType('credit')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${purchasePaymentType === 'credit' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    آجل (حساب ذمة)
                  </button>
                </div>
              </div>

              <div className="bg-slate-500/5 rounded-xl p-3 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>إجمالي الشراء الفرعي:</span>
                  <span className="font-mono font-bold">
                    {purchaseCart.reduce((sum, entry) => sum + (entry.purchasePrice * entry.quantity), 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>خصم المشتريات المكتسب:</span>
                  <input
                    type="number"
                    value={purchaseDiscount || ''}
                    onChange={(e) => setPurchaseDiscount(Math.max(0, +e.target.value))}
                    placeholder="0.00"
                    className="w-20 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-300 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span>الصافي النهائي للمورد:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {Math.max(0, purchaseCart.reduce((sum, entry) => sum + (entry.purchasePrice * entry.quantity), 0) - purchaseDiscount).toFixed(2)}
                  </span>
                </div>

                {purchasePaymentType === 'credit' && (
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-300 dark:border-slate-800">
                    <span>المدفوع مقدماً للمورد:</span>
                    <input
                      type="number"
                      value={purchasePaidAmount || ''}
                      onChange={(e) => setPurchasePaidAmount(Math.max(0, +e.target.value))}
                      placeholder="0.00"
                      className="w-20 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ملاحظات الفاتورة للشراء</label>
                <textarea
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl glass-input h-16 resize-none"
                  placeholder="رقم الفاتورة اليدوية للمورد أو أي شروط..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm shadow transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Save size={16} /> اعتماد الفاتورة وتوريد المخزن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TAB: SALES RETURN */}
      {activeTab === 'return' && (
        <div className="max-w-2xl mx-auto rounded-2xl glass-panel-card p-6 border border-white/25 shadow-md space-y-4">
          <h3 className="font-bold text-lg text-slate-950 dark:text-white flex items-center gap-1.5">
            <ArrowLeftRight className="text-emerald-500" /> تسجيل سند مرتجع المبيعات
          </h3>
          <p className="text-xs text-slate-500">يقوم هذا المستند بإرجاع كمية مباعة للمستودع، وخصم قيمتها الإجمالية من ذمة العميل المالي بصورة تلقائية دقيقة.</p>

          <form onSubmit={submitReturn} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">العميل المرجوع البضاعة منه</label>
                <select
                  value={returnCustomerId}
                  onChange={(e) => setReturnCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  required
                >
                  <option value="">-- اختر العميل --</option>
                  {contacts.filter(c => c.type === 'customer' || c.type === 'both').map(cust => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">رقم الفاتورة الأصلية (اختياري)</label>
                <input
                  type="text"
                  value={originalInv}
                  onChange={(e) => setOriginalInv(e.target.value)}
                  placeholder="مثال: INV-2026-0001"
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-500/5 p-4 rounded-xl border border-white/10">
              <div className="col-span-3 space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">اختر الصنف المسترجع</label>
                <select
                  value={returnItemId}
                  onChange={(e) => setReturnItemId(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  required
                >
                  <option value="">-- حدد الصنف --</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 mt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">الكمية المسترجعة</label>
                <input
                  type="number"
                  value={returnQty || ''}
                  onChange={(e) => setReturnQty(Math.max(1, +e.target.value))}
                  placeholder="1"
                  className="w-full p-2 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1 mt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">المستوى المسترجع</label>
                <select
                  value={returnItemIsSub ? 'sub' : 'main'}
                  onChange={(e) => setReturnItemIsSub(e.target.value === 'sub')}
                  className="w-full p-2 rounded-xl glass-input text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="main">وحدة كبرى</option>
                  <option value="sub">وحدة صغرى</option>
                </select>
              </div>

              <div className="space-y-1 mt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">المستودع المستقبل للمرتجع</label>
                <select
                  value={returnBranch}
                  onChange={(e) => setReturnBranch(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">سبب الإرجاع أو الملاحظات</label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="مثال: وجود عطب مصنعي، انتهاء مدة الحاجة..."
                className="w-full p-2 rounded-xl glass-input text-xs h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow transition cursor-pointer"
            >
              تسجيل المرتجع المالي والسلعي
            </button>
          </form>
        </div>
      )}

      {/* 3. TAB: PRICE QUOTATIONS (عروض الأسعار) */}
      {activeTab === 'quotation' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">
            <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
              <h3 className="font-bold text-md text-slate-800 dark:text-slate-100">بناء قائمة عرض السعر للعميل</h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={quotationItemSearch}
                  onChange={(e) => setQuotationItemSearch(e.target.value)}
                  placeholder="ابحث باسم الصنف أو باركود الصنف لتوريد عرض الأسعار له..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                />
                
                {quotationItemSearch && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-950 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto border border-emerald-500/20">
                    {filteredQuotationItems.length === 0 ? (
                      <p className="text-center text-xs py-3 text-slate-400">لا توجد أصناف مطابقة للبحث</p>
                    ) : (
                      filteredQuotationItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => addQuotationItem(item)}
                          className="p-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-950 dark:text-white cursor-pointer rounded-lg flex justify-between"
                        >
                          <span>{item.name} ({item.mainUnit})</span>
                          <span className="font-mono text-slate-500">سعر البيع الافتراضي: {item.salePrice}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Quotation table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="pb-2">اسم صنف العرض</th>
                      <th className="pb-2 text-center">الكمية المقترحة</th>
                      <th className="pb-2 text-center">السعر المقترح</th>
                      <th className="pb-2 text-center">الإجمالي الفرعي</th>
                      <th className="pb-2 pl-2">إزالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white font-medium">
                    {quotationCart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">عرض الأسعار فارغ، أضف أصناف لبنائه</td>
                      </tr>
                    ) : (
                      quotationCart.map((entry, index) => (
                        <tr key={entry.itemId}>
                          <td className="py-2.5">
                            <div>{entry.itemName}</div>
                            <span className="text-xs text-slate-400">({entry.unitName})</span>
                          </td>
                          <td className="py-2.5 text-center">
                            <input
                              type="number"
                              value={entry.quantity}
                              onChange={(e) => {
                                const updated = [...quotationCart];
                                updated[index].quantity = Math.max(1, +e.target.value);
                                setQuotationCart(updated);
                              }}
                              className="w-16 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-center">
                            <input
                              type="number"
                              value={entry.salePrice}
                              onChange={(e) => {
                                const updated = [...quotationCart];
                                updated[index].salePrice = Math.max(0, +e.target.value);
                                setQuotationCart(updated);
                              }}
                              className="w-20 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {(entry.salePrice * entry.quantity).toFixed(2)}
                          </td>
                          <td className="py-2.5 pl-2 text-center">
                            <button type="button" onClick={() => removeQuotationItem(index)} className="text-red-500 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md flex flex-col space-y-4">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 pb-2 border-b border-white/10">شروط وصلاحية العرض للزبون</h3>
            
            <form onSubmit={submitQuotation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">اختر حساب الزبون المستهدف</label>
                <select
                  value={selectedQuotationCustomerId}
                  onChange={(e) => setSelectedQuotationCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  required
                >
                  <option value="">-- حدد الزبون المستفيد --</option>
                  {contacts.filter(c => c.type === 'customer' || c.type === 'both').map(cust => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">صلاحية العرض الحالي (بالأيام)</label>
                <input
                  type="number"
                  value={quotationValidDays}
                  onChange={(e) => setQuotationValidDays(Math.max(1, +e.target.value))}
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-950 dark:text-white font-mono font-bold"
                  required
                />
              </div>

              <div className="bg-slate-500/5 rounded-xl p-3 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>المجموع الإجمالي الفرعي:</span>
                  <span className="font-mono font-bold">
                    {quotationCart.reduce((sum, entry) => sum + (entry.salePrice * entry.quantity), 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>خصم تشجيعي مقترح:</span>
                  <input
                    type="number"
                    value={quotationDiscount || ''}
                    onChange={(e) => setQuotationDiscount(Math.max(0, +e.target.value))}
                    placeholder="0.00"
                    className="w-20 text-center rounded bg-slate-100 dark:bg-slate-800 p-1 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-300 dark:border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span>الصافي المقترح للزبون:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {Math.max(0, quotationCart.reduce((sum, entry) => sum + (entry.salePrice * entry.quantity), 0) - quotationDiscount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ملاحظات وشروط العرض</label>
                <textarea
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl glass-input h-20 resize-none"
                  placeholder="مثال: الأسعار سارية المفعول حتى انتهاء المخزون..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm shadow transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Save size={16} /> حفظ وتصدير عرض الأسعار
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" dir="rtl">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAddSupplierModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">➕ إضافة حساب مورد جديد للمنظومة</h3>
              <button 
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddSupplierSubmit} className="space-y-4 text-right">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم المورد / الشركة *</label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="مثال: شركة القدس للاستيراد والشركاء..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">رقم الهاتف</label>
                <input
                  type="text"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  placeholder="مثال: 059XXXXXXX"
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-mono font-bold text-left"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">عنوان المقر أو المستودع الرئيسي</label>
                <input
                  type="text"
                  value={newSupplierAddress}
                  onChange={(e) => setNewSupplierAddress(e.target.value)}
                  placeholder="مثال: غزة، شارع عمر المختار..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Initial Balance */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">الرصيد الافتتاحي ({currency.symbol})</label>
                  <input
                    type="number"
                    value={newSupplierInitialBalance || ''}
                    onChange={(e) => setNewSupplierInitialBalance(Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">طبيعة الرصيد</label>
                  <select
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value as 'credit' | 'debit')}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="credit">دائن - له رصيد علينا (+)</option>
                    <option value="debit">مدين - عليه التزام لنا (-)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> إضافة واعتماد المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
