/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  RotateCcw, 
  Search, 
  Trash2, 
  Pencil, 
  DollarSign, 
  Calendar, 
  Plus, 
  X, 
  Save, 
  Filter, 
  Eye, 
  Store,
  SlidersHorizontal,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Sale, SalesReturn, CustomerSupplier, Branch, Item, TransactionItem, Currency, ShopSettings } from '../types';

interface SalesManagementProps {
  sales: Sale[];
  returns: SalesReturn[];
  contacts: CustomerSupplier[];
  branches: Branch[];
  items: Item[];
  userRole: 'admin' | 'cashier';
  onUpdateSale: (id: string, updatedSale: Sale) => void;
  onUpdateReturn: (id: string, updatedReturn: SalesReturn) => void;
  onDeleteSale: (invoiceNo: string, reason: string) => void;
  onDeleteReturn: (id: string, reason: string) => void;
  activeCurrency?: Currency;
  currencies?: Currency[];
  shopSettings?: ShopSettings;
}

export default function SalesManagement({
  sales,
  returns,
  contacts,
  branches,
  items,
  userRole,
  onUpdateSale,
  onUpdateReturn,
  onDeleteSale,
  onDeleteReturn,
  activeCurrency,
  currencies = [],
  shopSettings
}: SalesManagementProps) {
  
  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    const sale = sales.find(s => s.id === invoiceId);
    if (!sale) {
      toast('لم يتم العثور على الفاتورة المطلوبة!', 'error');
      return;
    }

    try {
      const { usePrint } = await import('../utils/usePrint');
      const { exportInvoiceToPDF } = usePrint();
      
      const settings = {
        name: shopSettings?.name || 'غزة كاش ERP',
        address: shopSettings?.address || 'غزة، فلسطين',
        phone: shopSettings?.phone || '',
        logoText: shopSettings?.logoText || 'غك'
      };

      const saleCurrencySymbol = currencies.find(c => c.id === sale.currencyId)?.symbol || activeCurrency?.symbol || '₪';

      await exportInvoiceToPDF(
        sale,
        'sale',
        settings,
        saleCurrencySymbol
      );
    } catch (error: any) {
      console.error('Error printing previous invoice:', error);
      toast(`⚠️ حدث خطأ أثناء إعداد وطباعة الفاتورة: ${error.message || String(error)}`, 'error');
    }
  };

  const handlePrintReturn = async (returnId: string) => {
    const ret = returns.find(r => r.id === returnId);
    if (!ret) {
      toast('لم يتم العثور على مستند المرتجع المطلوب!', 'error');
      return;
    }

    try {
      const { usePrint } = await import('../utils/usePrint');
      const { exportInvoiceToPDF } = usePrint();
      
      const settings = {
        name: shopSettings?.name || 'غزة كاش ERP',
        address: shopSettings?.address || 'غزة، فلسطين',
        phone: shopSettings?.phone || '',
        logoText: shopSettings?.logoText || 'غك'
      };

      await exportInvoiceToPDF(
        ret,
        'return_in',
        settings,
        activeCurrency?.symbol || '₪'
      );
    } catch (error: any) {
      console.error('Error printing return invoice:', error);
      toast(`⚠️ حدث خطأ أثناء إعداد وطباعة مستند المرتجع: ${error.message || String(error)}`, 'error');
    }
  };

  // Tab states: 'sales' | 'returns'
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'returns'>('sales');

  // Smart Search States
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'cash' | 'credit'>('all');
  const [searchAmount, setSearchAmount] = useState('');
  const [amountCriteria, setAmountCriteria] = useState<'eq' | 'gte' | 'lte'>('gte');
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');

  // Editing States
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingReturn, setEditingReturn] = useState<SalesReturn | null>(null);

  // Quick deletion modal states
  const [deletingInvoice, setDeletingInvoice] = useState<{ id: string; no: string; type: 'sale' | 'return' } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Items search state for adding items to invoice/return while editing
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Filtered Items for autocomplete inside editing modal
  const filteredSearchProducts = useMemo(() => {
    if (itemSearchQuery.trim() === '') return [];
    return items.filter(
      (it) => 
        it.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || 
        it.barcode.includes(itemSearchQuery)
    );
  }, [itemSearchQuery, items]);

  // Filtering Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // 1. Customer
      if (searchCustomer && !sale.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) {
        return false;
      }
      // 2. Invoice No
      if (searchInvoiceNo && !sale.invoiceNo.toLowerCase().includes(searchInvoiceNo.toLowerCase())) {
        return false;
      }
      // 3. Payment Type
      if (searchType !== 'all' && sale.paymentType !== searchType) {
        return false;
      }
      // 4. Amount
      if (searchAmount.trim() !== '') {
        const amt = parseFloat(searchAmount);
        if (!isNaN(amt)) {
          if (amountCriteria === 'eq' && Math.abs(sale.total - amt) > 0.01) return false;
          if (amountCriteria === 'gte' && sale.total < amt) return false;
          if (amountCriteria === 'lte' && sale.total > amt) return false;
        }
      }
      return true;
    });
  }, [sales, searchCustomer, searchInvoiceNo, searchType, searchAmount, amountCriteria]);

  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      // 1. Customer
      if (searchCustomer && !ret.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) {
        return false;
      }
      // 2. Return No
      if (searchInvoiceNo && !ret.returnNo.toLowerCase().includes(searchInvoiceNo.toLowerCase())) {
        return false;
      }
      // 3. Amount (Returns do not have payment type, they are just cash or account adjustment)
      if (searchAmount.trim() !== '') {
        const amt = parseFloat(searchAmount);
        if (!isNaN(amt)) {
          if (amountCriteria === 'eq' && Math.abs(ret.total - amt) > 0.01) return false;
          if (amountCriteria === 'gte' && ret.total < amt) return false;
          if (amountCriteria === 'lte' && ret.total > amt) return false;
        }
      }
      return true;
    });
  }, [returns, searchCustomer, searchInvoiceNo, searchAmount, amountCriteria]);

  // Helper for contact query
  const customerContacts = contacts.filter(c => c.type === 'customer' || c.type === 'both');

  // --- Handlers for Editing Sale ---
  const handleAddProductToSale = (item: Item) => {
    if (!editingSale) return;
    
    // Check if item already exists in the cart
    const existsIdx = editingSale.items.findIndex(it => it.itemId === item.id);
    let updatedItems = [...editingSale.items];

    if (existsIdx > -1) {
      const existing = updatedItems[existsIdx];
      const newQty = existing.quantity + 1;
      updatedItems[existsIdx] = {
        ...existing,
        quantity: newQty,
        total: newQty * existing.price
      };
    } else {
      updatedItems.push({
        itemId: item.id,
        itemName: item.name,
        isSubUnitUsed: false,
        quantity: 1,
        unitName: item.mainUnit,
        price: item.salePrice,
        total: item.salePrice
      });
    }

    // Recalculate
    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingSale.paymentType === 'cash' ? total : editingSale.paidAmount
    });
    setItemSearchQuery('');
  };

  const handleUpdateSaleItemQty = (index: number, qty: number) => {
    if (!editingSale || qty <= 0) return;
    const updatedItems = [...editingSale.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      quantity: qty,
      total: qty * item.price
    };

    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingSale.paymentType === 'cash' ? total : editingSale.paidAmount
    });
  };

  const handleUpdateSaleItemPrice = (index: number, price: number) => {
    if (!editingSale || price < 0) return;
    const updatedItems = [...editingSale.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      price: price,
      total: item.quantity * price
    };

    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingSale.paymentType === 'cash' ? total : editingSale.paidAmount
    });
  };

  const handleRemoveSaleItem = (index: number) => {
    if (!editingSale) return;
    const updatedItems = editingSale.items.filter((_, idx) => idx !== index);
    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingSale.discount);

    setEditingSale({
      ...editingSale,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingSale.paymentType === 'cash' ? total : editingSale.paidAmount
    });
  };

  const handleSaveEditedSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    if (editingSale.items.length === 0) {
      toast('لا يمكن حفظ الفاتورة بدون أي أصناف!', 'warning');
      return;
    }

    onUpdateSale(editingSale.id, editingSale);
    setEditingSale(null);
    toast('تم تعديل وحفظ فاتورة المبيعات بنجاح وتحديث أرصدة المخازن والعميل! 🛒', 'success');
  };


  // --- Handlers for Editing Return ---
  const handleAddProductToReturn = (item: Item) => {
    if (!editingReturn) return;
    
    const existsIdx = editingReturn.items.findIndex(it => it.itemId === item.id);
    let updatedItems = [...editingReturn.items];

    if (existsIdx > -1) {
      const existing = updatedItems[existsIdx];
      const newQty = existing.quantity + 1;
      updatedItems[existsIdx] = {
        ...existing,
        quantity: newQty,
        total: newQty * existing.price
      };
    } else {
      updatedItems.push({
        itemId: item.id,
        itemName: item.name,
        isSubUnitUsed: false,
        quantity: 1,
        unitName: item.mainUnit,
        price: item.salePrice,
        total: item.salePrice
      });
    }

    const total = updatedItems.reduce((sum, it) => sum + it.total, 0);

    setEditingReturn({
      ...editingReturn,
      items: updatedItems,
      total
    });
    setItemSearchQuery('');
  };

  const handleUpdateReturnItemQty = (index: number, qty: number) => {
    if (!editingReturn || qty <= 0) return;
    const updatedItems = [...editingReturn.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      quantity: qty,
      total: qty * item.price
    };

    const total = updatedItems.reduce((sum, it) => sum + it.total, 0);

    setEditingReturn({
      ...editingReturn,
      items: updatedItems,
      total
    });
  };

  const handleUpdateReturnItemPrice = (index: number, price: number) => {
    if (!editingReturn || price < 0) return;
    const updatedItems = [...editingReturn.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      price: price,
      total: item.quantity * price
    };

    const total = updatedItems.reduce((sum, it) => sum + it.total, 0);

    setEditingReturn({
      ...editingReturn,
      items: updatedItems,
      total
    });
  };

  const handleRemoveReturnItem = (index: number) => {
    if (!editingReturn) return;
    const updatedItems = editingReturn.items.filter((_, idx) => idx !== index);
    const total = updatedItems.reduce((sum, it) => sum + it.total, 0);

    setEditingReturn({
      ...editingReturn,
      items: updatedItems,
      total
    });
  };

  const handleSaveEditedReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReturn) return;
    if (editingReturn.items.length === 0) {
      toast('لا يمكن حفظ المرتجع بدون أي أصناف!', 'warning');
      return;
    }

    onUpdateReturn(editingReturn.id, editingReturn);
    setEditingReturn(null);
    toast('تم تعديل وحفظ مرتجع المبيعات بنجاح وتحديث أرصدة المخازن والعميل! 🔄', 'success');
  };

  const handleTriggerDelete = (id: string, no: string, type: 'sale' | 'return') => {
    if (userRole === 'cashier') {
      toast('🔒 عذراً! تم إلغاء العملية. دور "كاشير مبيعات" غير مخوّل بحذف أو تعديل الفواتير المعتمدة. يرجى مراجعة مدير النظام.', 'error');
      return;
    }
    setDeletingInvoice({ id, no, type });
    setDeleteReason('');
  };

  const handleConfirmDelete = () => {
    if (!deletingInvoice) return;
    if (!deleteReason.trim()) {
      toast('يرجى كتابة سبب الحذف للإجراءات التدقيقية والأمنية', 'warning');
      return;
    }

    if (deletingInvoice.type === 'sale') {
      onDeleteSale(deletingInvoice.no, deleteReason);
    } else {
      onDeleteReturn(deletingInvoice.id, deleteReason);
    }

    setDeletingInvoice(null);
    toast('تم إلغاء وحذف العملية وسجلاتها بالكامل! 🗑️', 'success');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500">
            <Receipt size={24} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">إدارة مبيعات ومرتجع المجموعات</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">تدقيق الفواتير الصادرة، إدارة عمليات الارتجاع، الفلاتر الذكية وتعديل البيانات المعتمَدة</p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'sales'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-500/5'
            }`}
          >
            <Receipt size={14} />
            <span>سجل الفواتير الصادرة ({sales.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'returns'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-500/5'
            }`}
          >
            <RotateCcw size={14} />
            <span>سجل مرتجعات المبيعات ({returns.length})</span>
          </button>
        </div>
      </div>

      {/* Smart Search Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <Filter size={16} className="text-emerald-500" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">صندوق الفلاتر والبحث المتقدم الذكي</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {/* Search by customer */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">اسم العميل:</label>
            <div className="relative">
              <Search size={13} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full p-2 pr-8 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Search by Invoice number */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">رقم الفاتورة / السند:</label>
            <div className="relative">
              <Search size={13} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="مثال: INV-2026-0001"
                value={searchInvoiceNo}
                onChange={(e) => setSearchInvoiceNo(e.target.value)}
                className="w-full p-2 pr-8 rounded-xl glass-input text-xs font-mono tracking-wider text-center"
              />
            </div>
          </div>

          {/* Filter by Payment Type (Sales Invoices only) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">نوع الفاتورة:</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
              disabled={activeSubTab === 'returns'}
            >
              <option value="all">الكل (نقدي وآجل)</option>
              <option value="cash">نقدي (Cash)</option>
              <option value="credit">آجل (Credit)</option>
            </select>
          </div>

          {/* Smart Search by Value - amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">القيمة الإجمالية:</label>
            <div className="relative">
              <DollarSign size={13} className="absolute right-3 top-3 text-slate-400" />
              <input
                type="number"
                placeholder="أدخل المبلغ..."
                value={searchAmount}
                onChange={(e) => setSearchAmount(e.target.value)}
                className="w-full p-2 pr-8 rounded-xl glass-input text-xs text-center font-bold"
              />
            </div>
          </div>

          {/* Smart Search by Value - criteria */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">مقياس القيمة مقارنة بـ:</label>
            <select
              value={amountCriteria}
              onChange={(e) => setAmountCriteria(e.target.value as any)}
              className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer font-bold"
            >
              <option value="gte">أكبر من أو يساوي (≥</option>
              <option value="lte">أقل من أو يساوي (≤)</option>
              <option value="eq">يساوي تماماً (=)</option>
            </select>
          </div>

        </div>

        {/* Clear filters shortcut */}
        {(searchCustomer || searchInvoiceNo || searchType !== 'all' || searchAmount) && (
          <div className="flex justify-start">
            <button
              onClick={() => {
                setSearchCustomer('');
                setSearchInvoiceNo('');
                setSearchType('all');
                setSearchAmount('');
              }}
              className="text-[10px] font-extrabold text-red-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
            >
              <span>✕ تصفية وإعادة تعيين البحث</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {activeSubTab === 'sales' ? (
          <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">سجل الفواتير الصادرة للفلاتر المدخلة</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-full">
                تم العثور على: {filteredSales.length} فاتورة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] font-extrabold uppercase border-b border-slate-100 dark:border-slate-850">
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">تاريخ ووقت الإصدار</th>
                    <th className="p-3">الزبون / الحساب</th>
                    <th className="p-3">مستودع الصرف</th>
                    <th className="p-3 text-center">النوع</th>
                    <th className="p-3">المجموع الكلي</th>
                    <th className="p-3">المدفوع</th>
                    <th className="p-3">المتبقي الآجل</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-10 text-center text-slate-400 text-xs">
                        لا توجد أي فواتير مبيعات مطابقة لمعايير البحث المدخلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => {
                      const outstanding = sale.total - sale.paidAmount;
                      return (
                        <tr key={sale.id} className="hover:bg-slate-500/5 transition text-slate-900 dark:text-white text-xs">
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{sale.invoiceNo}</td>
                          <td className="p-3 text-slate-500">{new Date(sale.date).toLocaleString('ar-EG')}</td>
                          <td className="p-3 font-black">{sale.customerName}</td>
                          <td className="p-3 text-slate-500">{sale.branchName}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full ${
                              sale.paymentType === 'cash' 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10' 
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/10'
                            }`}>
                              {sale.paymentType === 'cash' ? 'نقدي Cash' : 'آجل Credit'}
                            </span>
                          </td>
                          <td className="p-3 font-extrabold text-slate-900 dark:text-white">{sale.total.toFixed(2)} ₪</td>
                          <td className="p-3 text-emerald-500 font-bold">{sale.paidAmount.toFixed(2)} ₪</td>
                          <td className="p-3 text-red-500 font-bold">
                            {outstanding > 0.05 ? `${outstanding.toFixed(2)} ₪` : '0.00 ₪'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handlePrintInvoice(sale.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                                title="طباعة الفاتورة وتصديرها كـ PDF"
                              >
                                <Printer size={13} />
                              </button>

                              <button
                                onClick={() => setEditingSale(sale)}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                                title="تعديل الفاتورة بالكامل وتحديث الحسابات والمخزن"
                              >
                                <Pencil size={13} />
                              </button>
                              
                              <button
                                onClick={() => handleTriggerDelete(sale.id, sale.invoiceNo, 'sale')}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="حذف الفاتورة وإلغاؤها بالكامل"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">سجل مرتجعات المبيعات</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-full">
                تم العثور على: {filteredReturns.length} حركة ارتجاع
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] font-extrabold uppercase border-b border-slate-100 dark:border-slate-850">
                    <th className="p-3">رقم سند الارتجاع</th>
                    <th className="p-3">تاريخ ووقت الارتجاع</th>
                    <th className="p-3">الزبون / الحساب</th>
                    <th className="p-3">المستودع المستقبل</th>
                    <th className="p-3">الفاتورة الأصلية (إن وجدت)</th>
                    <th className="p-3">قيمة المرتجع</th>
                    <th className="p-3">الملاحظات</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                        لا توجد أي حركات ارتجاع مبيعات مطابقة لمعايير البحث حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => {
                      return (
                        <tr key={ret.id} className="hover:bg-slate-500/5 transition text-slate-900 dark:text-white text-xs">
                          <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{ret.returnNo}</td>
                          <td className="p-3 text-slate-500">{new Date(ret.date).toLocaleString('ar-EG')}</td>
                          <td className="p-3 font-black">{ret.customerName}</td>
                          <td className="p-3 text-slate-500">
                            {branches.find(b => b.id === ret.branchId)?.name || 'الفرع الرئيسي'}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{ret.originalInvoiceNo || 'غير محدد'}</td>
                          <td className="p-3 font-extrabold text-red-500">{ret.total.toFixed(2)} ₪</td>
                          <td className="p-3 text-slate-400 text-[11px] leading-relaxed max-w-[200px] truncate">{ret.notes || '-'}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handlePrintReturn(ret.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                                title="طباعة سند المرتجع وتصديره كـ PDF"
                              >
                                <Printer size={13} />
                              </button>

                              <button
                                onClick={() => setEditingReturn(ret)}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                                title="تعديل المرتجع وتحديث الحسابات والمخزن"
                              >
                                <Pencil size={13} />
                              </button>
                              
                              <button
                                onClick={() => handleTriggerDelete(ret.id, ret.returnNo, 'return')}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="حذف وإلغاء سند المرتجع بالكامل"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: EDITING SALES INVOICE */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingSale(null)}
          />
          <form 
            onSubmit={handleSaveEditedSale}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh] overflow-hidden text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-blue-500">
                <Pencil size={18} />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">تعديل وإعادة صياغة فاتورة المبيعات رقم: {editingSale.invoiceNo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSale(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="space-y-5 overflow-y-auto pr-1 no-scrollbar flex-1 pb-4">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Customer */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">الزبون / الحساب التجاري</label>
                  <select
                    value={editingSale.customerId}
                    onChange={(e) => {
                      const selected = customerContacts.find(c => c.id === e.target.value);
                      setEditingSale({
                        ...editingSale,
                        customerId: e.target.value,
                        customerName: selected ? selected.name : 'زبون عام نقدي'
                      });
                    }}
                    className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    {customerContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">مستودع صرف المواد</label>
                  <select
                    value={editingSale.branchId}
                    onChange={(e) => {
                      const selected = branches.find(b => b.id === e.target.value);
                      setEditingSale({
                        ...editingSale,
                        branchId: e.target.value,
                        branchName: selected ? selected.name : 'الفرع الرئيسي'
                      });
                    }}
                    className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">طريقة الدفع</label>
                  <select
                    value={editingSale.paymentType}
                    onChange={(e) => {
                      const payType = e.target.value as 'cash' | 'credit';
                      setEditingSale({
                        ...editingSale,
                        paymentType: payType,
                        paidAmount: payType === 'cash' ? editingSale.total : 0
                      });
                    }}
                    className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    <option value="cash">نقدي Cash (دفع فوري كامل)</option>
                    <option value="credit">آجل Credit (إضافة لذمة العميل)</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">تاريخ الفاتورة</label>
                  <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                    {new Date(editingSale.date).toLocaleString('ar-EG')}
                  </div>
                </div>

              </div>

              {/* Add New Product Shortcut to invoice */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">إضافة صنف جديد للفاتورة الصادرة:</label>
                <div className="relative">
                  <Plus size={14} className="absolute right-3 top-3 text-emerald-500" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الباركود لإضافة الصنف فوراً..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-full p-2 pr-8 rounded-xl glass-input text-xs"
                  />
                  
                  {filteredSearchProducts.length > 0 && (
                    <div className="absolute top-full right-0 left-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto z-20 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredSearchProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleAddProductToSale(p)}
                          className="p-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between transition"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                          <span className="font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                            {p.salePrice.toFixed(2)} ₪
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table inside editing modal */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">الأصناف الحالية المدرجة في الفاتورة:</span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-850">
                      <tr>
                        <th className="p-2.5">اسم الصنف</th>
                        <th className="p-2.5 text-center">الكمية</th>
                        <th className="p-2.5">الوحدة</th>
                        <th className="p-2.5">سعر الوحدة</th>
                        <th className="p-2.5">الإجمالي</th>
                        <th className="p-2.5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {editingSale.items.map((item, idx) => (
                        <tr key={idx} className="text-slate-900 dark:text-white">
                          <td className="p-2.5 font-bold">{item.itemName}</td>
                          <td className="p-2.5 text-center w-28">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateSaleItemQty(idx, parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-bold text-xs bg-transparent"
                              min="0.1"
                              step="any"
                            />
                          </td>
                          <td className="p-2.5 text-slate-400 font-bold">{item.unitName}</td>
                          <td className="p-2.5 w-28">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateSaleItemPrice(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-bold text-xs bg-transparent"
                              min="0"
                              step="any"
                            />
                          </td>
                          <td className="p-2.5 font-black text-slate-700 dark:text-slate-300">
                            {item.total.toFixed(2)} ₪
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSaleItem(idx)}
                              className="p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                
                {/* Discount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">خصم إضافي من الفاتورة (₪)</label>
                  <input
                    type="number"
                    value={editingSale.discount}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      const total = Math.max(0, editingSale.subTotal - disc);
                      setEditingSale({
                        ...editingSale,
                        discount: disc,
                        total,
                        paidAmount: editingSale.paymentType === 'cash' ? total : editingSale.paidAmount
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs bg-white dark:bg-slate-900 text-center"
                    min="0"
                  />
                </div>

                {/* Paid Amount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">المبلغ المدفوع كاش (₪)</label>
                  <input
                    type="number"
                    value={editingSale.paidAmount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      setEditingSale({
                        ...editingSale,
                        paidAmount: Math.min(editingSale.total, paid)
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs bg-white dark:bg-slate-900 text-center"
                    min="0"
                    disabled={editingSale.paymentType === 'cash'}
                  />
                </div>

                {/* Totals Summary Card */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex flex-col justify-between text-left">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>مجموع المنتجات:</span>
                    <span className="font-bold">{editingSale.subTotal.toFixed(2)} ₪</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    <span>المجموع الصافي النهائي:</span>
                    <span className="text-sm">{editingSale.total.toFixed(2)} ₪</span>
                  </div>
                </div>

              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">ملاحظات الفاتورة وتفاصيل التعديل الإدارية</label>
                <textarea
                  value={editingSale.notes || ''}
                  onChange={(e) => setEditingSale({ ...editingSale, notes: e.target.value })}
                  placeholder="اكتب أي ملاحظات للرجوع إليها لاحقاً..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 bg-transparent min-h-[60px]"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSale(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>حفظ التعديلات والتثبيت</span>
              </button>
            </div>

          </form>
        </div>
      )}


      {/* MODAL 2: EDITING SALES RETURN */}
      {editingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingReturn(null)}
          />
          <form 
            onSubmit={handleSaveEditedReturn}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh] overflow-hidden text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-blue-500">
                <Pencil size={18} />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">تعديل وإعادة صياغة مرتجع المبيعات رقم: {editingReturn.returnNo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReturn(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="space-y-5 overflow-y-auto pr-1 no-scrollbar flex-1 pb-4">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Customer */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">الزبون / الحساب المرتجع منه</label>
                  <select
                    value={editingReturn.customerId}
                    onChange={(e) => {
                      const selected = customerContacts.find(c => c.id === e.target.value);
                      setEditingReturn({
                        ...editingReturn,
                        customerId: e.target.value,
                        customerName: selected ? selected.name : 'زبون عام نقدي'
                      });
                    }}
                    className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    {customerContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">المستودع المستقبل للمرتجع</label>
                  <select
                    value={editingReturn.branchId}
                    onChange={(e) => {
                      setEditingReturn({
                        ...editingReturn,
                        branchId: e.target.value
                      });
                    }}
                    className="w-full p-2 rounded-xl glass-input text-xs cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Original Invoice No */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">الفاتورة الأصلية المستند عليها</label>
                  <input
                    type="text"
                    value={editingReturn.originalInvoiceNo || ''}
                    onChange={(e) => setEditingReturn({ ...editingReturn, originalInvoiceNo: e.target.value })}
                    placeholder="مثال: INV-2026-0005"
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-center tracking-wider"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">تاريخ المرتجع</label>
                  <div className="p-2 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                    {new Date(editingReturn.date).toLocaleString('ar-EG')}
                  </div>
                </div>

              </div>

              {/* Add New Product Shortcut to return */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">إضافة صنف جديد لمرتجع المبيعات:</label>
                <div className="relative">
                  <Plus size={14} className="absolute right-3 top-3 text-emerald-500" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الباركود لإضافة الصنف فوراً..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-full p-2 pr-8 rounded-xl glass-input text-xs"
                  />
                  
                  {filteredSearchProducts.length > 0 && (
                    <div className="absolute top-full right-0 left-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto z-20 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredSearchProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleAddProductToReturn(p)}
                          className="p-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between transition"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                          <span className="font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                            {p.salePrice.toFixed(2)} ₪
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table inside editing modal */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">الأصناف الحالية المرتجعة:</span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100 dark:border-slate-850">
                      <tr>
                        <th className="p-2.5">اسم الصنف</th>
                        <th className="p-2.5 text-center">الكمية المستردة</th>
                        <th className="p-2.5">الوحدة</th>
                        <th className="p-2.5">سعر الاسترداد المتفق عليه</th>
                        <th className="p-2.5">الإجمالي المسترد</th>
                        <th className="p-2.5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {editingReturn.items.map((item, idx) => (
                        <tr key={idx} className="text-slate-900 dark:text-white">
                          <td className="p-2.5 font-bold">{item.itemName}</td>
                          <td className="p-2.5 text-center w-28">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateReturnItemQty(idx, parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-bold text-xs bg-transparent"
                              min="0.1"
                              step="any"
                            />
                          </td>
                          <td className="p-2.5 text-slate-400 font-bold">{item.unitName}</td>
                          <td className="p-2.5 w-28">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateReturnItemPrice(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-center font-bold text-xs bg-transparent"
                              min="0"
                              step="any"
                            />
                          </td>
                          <td className="p-2.5 font-black text-red-500">
                            {item.total.toFixed(2)} ₪
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveReturnItem(idx)}
                              className="p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end bg-red-500/5 dark:bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-left max-w-xs mr-auto">
                <div className="w-full flex items-center justify-between text-xs font-black text-red-600 dark:text-red-400">
                  <span>إجمالي قيمة المرتجع المسترد للزبون:</span>
                  <span className="text-base">{editingReturn.total.toFixed(2)} ₪</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">سبب الارتجاع والملاحظات</label>
                <textarea
                  value={editingReturn.notes || ''}
                  onChange={(e) => setEditingReturn({ ...editingReturn, notes: e.target.value })}
                  placeholder="مثال: بضاعة تالفة أو غير مطابقة للمواصفات..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 bg-transparent min-h-[60px]"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingReturn(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                <span>حفظ التعديلات والتثبيت</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* MODAL 3: DELETE / REVERT CONFIRMATION WITH REASON */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDeletingInvoice(null)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 text-right">
            
            <div className="space-y-3">
              <span className="text-xs font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full inline-block">تحذير أمني وإداري حرج</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                تأكيد حذف {deletingInvoice.type === 'sale' ? 'فاتورة مبيعات' : 'سند مرتجع مبيعات'} رقم: <span className="font-mono text-red-600">{deletingInvoice.no}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                هذا الإجراء سيقوم بالتراجع عن كامل الأثر المالي على ذمة الزبون، وسيتم تصحيح أرصدة المواد المستردة أو المصروفة في مستودعات المجموعة تلقائياً. يرجى تزويد المنظومة بسبب الإلغاء لتسجيله في سجل الأمان.
              </p>
            </div>

            <div className="my-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">سبب إلغاء وحذف الفاتورة:</label>
              <input
                type="text"
                placeholder="مثال: فاتورة مكررة، إدخال خاطئ في الأصناف..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء الإجراء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold transition shadow-md cursor-pointer"
              >
                تأكيد حذف وإلغاء العملية
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
