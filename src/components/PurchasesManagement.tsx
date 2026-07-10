/**
 * Gaza Cash - Purchases Management & Vendor Supply Operations Dashboard
 * Copyright (c) 2026 Gaza Cash Team. All rights reserved.
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
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
  ArrowLeftRight
} from 'lucide-react';
import { Purchase, PurchaseReturn, CustomerSupplier, Branch, Item, TransactionItem } from '../types';

interface PurchasesManagementProps {
  purchases: Purchase[];
  purchaseReturns: PurchaseReturn[];
  contacts: CustomerSupplier[];
  branches: Branch[];
  items: Item[];
  userRole: 'admin' | 'cashier';
  onUpdatePurchase: (id: string, updatedPurchase: Purchase) => void;
  onUpdatePurchaseReturn: (id: string, updatedReturn: PurchaseReturn) => void;
  onDeletePurchase: (invoiceNo: string, reason: string) => void;
  onDeletePurchaseReturn: (id: string, reason: string) => void;
  onSavePurchaseReturn: (ret: Omit<PurchaseReturn, 'id' | 'returnNo' | 'date'>) => void;
}

export default function PurchasesManagement({
  purchases = [],
  purchaseReturns = [],
  contacts = [],
  branches = [],
  items = [],
  userRole,
  onUpdatePurchase,
  onUpdatePurchaseReturn,
  onDeletePurchase,
  onDeletePurchaseReturn,
  onSavePurchaseReturn
}: PurchasesManagementProps) {
  
  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  // Tab states: 'purchases' | 'returns'
  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'returns'>('purchases');

  // Smart Search States
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'cash' | 'credit'>('all');
  const [searchAmount, setSearchAmount] = useState('');
  const [amountCriteria, setAmountCriteria] = useState<'eq' | 'gte' | 'lte'>('gte');
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');

  // Editing States
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingReturn, setEditingReturn] = useState<PurchaseReturn | null>(null);

  // New Purchase Return form state
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [newReturnSupplierId, setNewReturnSupplierId] = useState('');
  const [newReturnBranchId, setNewReturnBranchId] = useState('branch_main');
  const [newReturnOriginalInvoice, setNewReturnOriginalInvoice] = useState('');
  const [newReturnNotes, setNewReturnNotes] = useState('');
  const [newReturnCart, setNewReturnCart] = useState<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
    unitName: string;
  }[]>([]);
  const [newReturnItemSearch, setNewReturnItemSearch] = useState('');

  // Quick deletion modal states
  const [deletingInvoice, setDeletingInvoice] = useState<{ id: string; no: string; type: 'purchase' | 'return' } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Items search state for editing
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Filtered Items for autocomplete in Edit modal
  const filteredSearchProducts = useMemo(() => {
    if (itemSearchQuery.trim() === '') return [];
    return items.filter(
      (it) => 
        it.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || 
        it.barcode.includes(itemSearchQuery)
    );
  }, [itemSearchQuery, items]);

  // Filtered Items for new return search
  const filteredReturnProducts = useMemo(() => {
    if (newReturnItemSearch.trim() === '') return [];
    return items.filter(
      (it) => 
        it.name.toLowerCase().includes(newReturnItemSearch.toLowerCase()) || 
        it.barcode.includes(newReturnItemSearch)
    );
  }, [newReturnItemSearch, items]);

  // Filtering Logic
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      // 1. Supplier
      if (searchSupplier && !purchase.supplierName.toLowerCase().includes(searchSupplier.toLowerCase())) {
        return false;
      }
      // 2. Invoice No
      if (searchInvoiceNo && !purchase.invoiceNo.toLowerCase().includes(searchInvoiceNo.toLowerCase())) {
        return false;
      }
      // 3. Payment Type
      if (searchType !== 'all' && purchase.paymentType !== searchType) {
        return false;
      }
      // 4. Amount
      if (searchAmount.trim() !== '') {
        const amt = parseFloat(searchAmount);
        if (!isNaN(amt)) {
          if (amountCriteria === 'eq' && Math.abs(purchase.total - amt) > 0.01) return false;
          if (amountCriteria === 'gte' && purchase.total < amt) return false;
          if (amountCriteria === 'lte' && purchase.total > amt) return false;
        }
      }
      return true;
    });
  }, [purchases, searchSupplier, searchInvoiceNo, searchType, searchAmount, amountCriteria]);

  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter(ret => {
      // 1. Supplier
      if (searchSupplier && !ret.supplierName.toLowerCase().includes(searchSupplier.toLowerCase())) {
        return false;
      }
      // 2. Return No
      if (searchInvoiceNo && !ret.returnNo.toLowerCase().includes(searchInvoiceNo.toLowerCase())) {
        return false;
      }
      // 3. Amount
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
  }, [purchaseReturns, searchSupplier, searchInvoiceNo, searchAmount, amountCriteria]);

  // Helper for suppliers
  const supplierContacts = contacts.filter(c => c.type === 'supplier' || c.type === 'both');

  // --- Handlers for Editing Purchase ---
  const handleAddProductToPurchase = (item: Item) => {
    if (!editingPurchase) return;
    
    const existsIdx = editingPurchase.items.findIndex(it => it.itemId === item.id);
    let updatedItems = [...editingPurchase.items];

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
        price: item.purchasePrice,
        total: item.purchasePrice
      });
    }

    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingPurchase.discount);

    setEditingPurchase({
      ...editingPurchase,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingPurchase.paymentType === 'cash' ? total : editingPurchase.paidAmount
    });
    setItemSearchQuery('');
  };

  const handleUpdatePurchaseItemQty = (index: number, qty: number) => {
    if (!editingPurchase || qty <= 0) return;
    const updatedItems = [...editingPurchase.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      quantity: qty,
      total: qty * item.price
    };

    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingPurchase.discount);

    setEditingPurchase({
      ...editingPurchase,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingPurchase.paymentType === 'cash' ? total : editingPurchase.paidAmount
    });
  };

  const handleUpdatePurchaseItemPrice = (index: number, price: number) => {
    if (!editingPurchase || price < 0) return;
    const updatedItems = [...editingPurchase.items];
    const item = updatedItems[index];
    updatedItems[index] = {
      ...item,
      price,
      total: item.quantity * price
    };

    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingPurchase.discount);

    setEditingPurchase({
      ...editingPurchase,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingPurchase.paymentType === 'cash' ? total : editingPurchase.paidAmount
    });
  };

  const handleRemoveItemFromPurchase = (index: number) => {
    if (!editingPurchase) return;
    const updatedItems = editingPurchase.items.filter((_, idx) => idx !== index);
    
    const subTotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
    const total = Math.max(0, subTotal - editingPurchase.discount);

    setEditingPurchase({
      ...editingPurchase,
      items: updatedItems,
      subTotal,
      total,
      paidAmount: editingPurchase.paymentType === 'cash' ? total : editingPurchase.paidAmount
    });
  };

  const handleSaveEditedPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase) return;
    if (editingPurchase.items.length === 0) {
      toast('السند لا يحتوي على أصناف!', 'warning');
      return;
    }
    onUpdatePurchase(editingPurchase.id, editingPurchase);
    setEditingPurchase(null);
    toast('تم تعديل وتصحيح فاتورة الشراء بنجاح وتحديث الكميات والأرصدة في المخزن! 📦', 'success');
  };

  // --- Handlers for Purchase Return ---
  const handleAddNewReturnItem = (item: Item) => {
    const existsIdx = newReturnCart.findIndex(it => it.itemId === item.id);
    let updated = [...newReturnCart];

    if (existsIdx > -1) {
      updated[existsIdx].quantity += 1;
    } else {
      updated.push({
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: item.purchasePrice,
        unitName: item.mainUnit
      });
    }
    setNewReturnCart(updated);
    setNewReturnItemSearch('');
  };

  const handleRemoveNewReturnItem = (index: number) => {
    setNewReturnCart(newReturnCart.filter((_, i) => i !== index));
  };

  const handleUpdateNewReturnItemQty = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const updated = [...newReturnCart];
    updated[index].quantity = quantity;
    setNewReturnCart(updated);
  };

  const handleUpdateNewReturnItemPrice = (index: number, price: number) => {
    if (price < 0) return;
    const updated = [...newReturnCart];
    updated[index].price = price;
    setNewReturnCart(updated);
  };

  const handleSubmitNewReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturnSupplierId) {
      toast('الرجاء اختيار المورد أولاً', 'warning');
      return;
    }
    if (newReturnCart.length === 0) {
      toast('الرجاء إضافة أصناف للمرتجع', 'warning');
      return;
    }

    const supplier = contacts.find(c => c.id === newReturnSupplierId);
    const total = newReturnCart.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    const formattedItems: TransactionItem[] = newReturnCart.map(it => ({
      itemId: it.itemId,
      itemName: it.itemName,
      isSubUnitUsed: false,
      quantity: it.quantity,
      unitName: it.unitName,
      price: it.price,
      total: it.price * it.quantity
    }));

    onSavePurchaseReturn({
      supplierId: newReturnSupplierId,
      supplierName: supplier ? supplier.name : 'مورد غير معروف',
      branchId: newReturnBranchId,
      originalInvoiceNo: newReturnOriginalInvoice || undefined,
      items: formattedItems,
      total,
      notes: newReturnNotes
    });

    // Reset Return form
    setNewReturnSupplierId('');
    setNewReturnNotes('');
    setNewReturnOriginalInvoice('');
    setNewReturnCart([]);
    setShowAddReturn(false);
    toast('تم تسجيل سند مرتجع المشتريات وإخراج الكميات من المستودع وتخفيض رصيد المورد بنجاح! 🔄', 'success');
  };

  // --- Edit Return Handlers ---
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
        price: item.purchasePrice,
        total: item.purchasePrice
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
      price,
      total: item.quantity * price
    };

    const total = updatedItems.reduce((sum, it) => sum + it.total, 0);

    setEditingReturn({
      ...editingReturn,
      items: updatedItems,
      total
    });
  };

  const handleRemoveItemFromReturn = (index: number) => {
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
      toast('السند لا يحتوي على أصناف!', 'warning');
      return;
    }
    onUpdatePurchaseReturn(editingReturn.id, editingReturn);
    setEditingReturn(null);
    toast('تم تعديل وتصحيح سند مرتجع المشتريات بنجاح وتحديث الحسابات والمستودعات! 🔄', 'success');
  };

  // --- Delete Handler ---
  const handleTriggerDelete = (id: string, no: string, type: 'purchase' | 'return') => {
    if (userRole === 'cashier') {
      toast('🔒 عذراً! صلاحيات الحساب الحالي لا تسمح بحذف المستندات والعمليات المالية المؤرشفة. يرجى المراجعة كمدير للنظام.', 'error');
      return;
    }
    setDeletingInvoice({ id, no, type });
    setDeleteReason('');
  };

  const handleConfirmDelete = () => {
    if (!deletingInvoice) return;
    if (deletingInvoice.type === 'purchase') {
      onDeletePurchase(deletingInvoice.no, deleteReason);
    } else {
      onDeletePurchaseReturn(deletingInvoice.id, deleteReason);
    }
    setDeletingInvoice(null);
    toast('تم إلغاء وحذف السند المالي بنجاح وإعادة رصيد المستودعات والذمم المالية للحالة السابقة. 🗑️', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="space-y-1 relative z-10 text-right w-full md:w-auto">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 justify-end">
             إدارة فواتير الشراء والمرتجعات (Suppliers & Purchases Log)
          </h2>
          <p className="text-xs text-slate-300">ابحث، فتش وعقّب على قيود الشراء والتوريد وتعديلها وإصدار المرتجعات المعتمدة.</p>
        </div>
        
        <button
          onClick={() => setShowAddReturn(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 self-end md:self-auto cursor-pointer"
        >
          <ArrowLeftRight size={14} /> تسجيل سند مرتجع مشتريات للمورد 🔄
        </button>
      </div>

      {/* SEARCH AND FILTERING PANEL */}
      <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2.5">
          <SlidersHorizontal size={16} className="text-emerald-500" />
          <span className="text-xs font-black">أدوات الفلترة الذكية والبحث المتقدم</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-right">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">اسم المورد</label>
            <div className="relative">
              <Search className="absolute right-3 top-3.5 text-slate-400" size={12} />
              <input
                type="text"
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
                placeholder="ابحث باسم المورد هنا..."
                className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">رقم الفاتورة / المرجع</label>
            <div className="relative">
              <Search className="absolute right-3 top-3.5 text-slate-400" size={12} />
              <input
                type="text"
                value={searchInvoiceNo}
                onChange={(e) => setSearchInvoiceNo(e.target.value)}
                placeholder="ابحث عن رقم المستند PUR-..."
                className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-950 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">نوع الدفع</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-950 dark:text-white"
            >
              <option value="all">الكل (نقدي ومؤجل)</option>
              <option value="cash">نقدي (Cash)</option>
              <option value="credit">ذمم وآجل (Credit)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500">القيمة الإجمالية للمستند</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setAmountCriteria('gte')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${amountCriteria === 'gte' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  أكبر
                </button>
                <button
                  onClick={() => setAmountCriteria('eq')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${amountCriteria === 'eq' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  يساوي
                </button>
                <button
                  onClick={() => setAmountCriteria('lte')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${amountCriteria === 'lte' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  أصغر
                </button>
              </div>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={12} />
              <input
                type="number"
                value={searchAmount}
                onChange={(e) => setSearchAmount(e.target.value)}
                placeholder="أدخل قيمة الفحص هنا..."
                className="w-full p-2.5 pl-9 rounded-xl glass-input text-xs text-slate-950 dark:text-white text-left font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CORE LOGS LIST */}
      <div className="rounded-2xl glass-panel-card border border-white/25 shadow-md overflow-hidden">
        
        {/* Tab Selection */}
        <div className="flex bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 p-2 gap-2">
          <button
            onClick={() => { setActiveSubTab('purchases'); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'purchases' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            <ShoppingBag size={14} className={activeSubTab === 'purchases' ? 'text-emerald-500' : ''} />
            سجل فواتير المشتريات والتوريد (Purchases Invoices)
          </button>
          
          <button
            onClick={() => { setActiveSubTab('returns'); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === 'returns' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            <RotateCcw size={14} className={activeSubTab === 'returns' ? 'text-amber-500' : ''} />
            سجل مرتجعات المشتريات للموردين (Purchase Returns)
          </button>
        </div>

        {activeSubTab === 'purchases' ? (
          <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">سجل عمليات وفواتير المشتريات النشطة</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1 rounded-full">
                تم العثور على: {filteredPurchases.length} فاتورة شراء
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] font-extrabold uppercase border-b border-slate-100 dark:border-slate-850">
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">تاريخ ووقت الفاتورة</th>
                    <th className="p-3">المورد / الحساب</th>
                    <th className="p-3">مستودع الاستلام</th>
                    <th className="p-3">نوع العملية</th>
                    <th className="p-3">قيمة الفاتورة</th>
                    <th className="p-3">المبلغ المدفوع</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                        لا توجد أي فواتير شراء وتوريد مطابقة لمعايير البحث حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      return (
                        <tr key={purchase.id} className="hover:bg-slate-500/5 transition text-slate-900 dark:text-white text-xs">
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{purchase.invoiceNo}</td>
                          <td className="p-3 text-slate-500">{new Date(purchase.date).toLocaleString('ar-EG')}</td>
                          <td className="p-3 font-black">{purchase.supplierName}</td>
                          <td className="p-3 text-slate-500">{purchase.branchName}</td>
                          <td className="p-3">
                            {purchase.paymentType === 'cash' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">نقدي</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px]">آجل</span>
                            )}
                          </td>
                          <td className="p-3 font-extrabold">{purchase.total.toFixed(2)} ₪</td>
                          <td className="p-3 font-bold text-slate-400">
                            {purchase.paidAmount.toFixed(2)} ₪
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => setEditingPurchase(purchase)}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                                title="تعديل الفاتورة وتحديث الحسابات والمخزن"
                              >
                                <Pencil size={13} />
                              </button>
                              
                              <button
                                onClick={() => handleTriggerDelete(purchase.id, purchase.invoiceNo, 'purchase')}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="حذف وإلغاء الفاتورة بالكامل"
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
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">سجل مرتجعات المشتريات للموردين</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-2.5 py-1 rounded-full">
                تم العثور على: {filteredReturns.length} حركة ارتجاع
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 text-[10px] font-extrabold uppercase border-b border-slate-100 dark:border-slate-850">
                    <th className="p-3">رقم سند الارتجاع</th>
                    <th className="p-3">تاريخ ووقت الارتجاع</th>
                    <th className="p-3">المورد / الحساب</th>
                    <th className="p-3">المستودع المصدر</th>
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
                        لا توجد أي حركات ارتجاع مشتريات مطابقة لمعايير البحث حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns.map((ret) => {
                      return (
                        <tr key={ret.id} className="hover:bg-slate-500/5 transition text-slate-900 dark:text-white text-xs">
                          <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{ret.returnNo}</td>
                          <td className="p-3 text-slate-500">{new Date(ret.date).toLocaleString('ar-EG')}</td>
                          <td className="p-3 font-black">{ret.supplierName}</td>
                          <td className="p-3 text-slate-500">
                            {branches.find(b => b.id === ret.branchId)?.name || 'الفرع الرئيسي'}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{ret.originalInvoiceNo || 'غير محدد'}</td>
                          <td className="p-3 font-extrabold text-red-500">{ret.total.toFixed(2)} ₪</td>
                          <td className="p-3 text-slate-400 text-[11px] leading-relaxed max-w-[200px] truncate">{ret.notes || '-'}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="inline-flex gap-2">
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

      {/* MODAL 1: EDITING PURCHASE INVOICE */}
      {editingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingPurchase(null)}
          />
          <form 
            onSubmit={handleSaveEditedPurchase}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh] overflow-hidden text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-blue-500">
                <Pencil size={18} />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">تعديل وإعادة صياغة فاتورة المشتريات رقم: {editingPurchase.invoiceNo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPurchase(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              
              {/* Top meta card */}
              <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">المورد النشط</span>
                  <select
                    value={editingPurchase.supplierId}
                    onChange={(e) => {
                      const supp = contacts.find(c => c.id === e.target.value);
                      if (supp) {
                        setEditingPurchase({ ...editingPurchase, supplierId: supp.id, supplierName: supp.name });
                      }
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    {supplierContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">مستودع الاستلام</span>
                  <select
                    value={editingPurchase.branchId}
                    onChange={(e) => {
                      const br = branches.find(b => b.id === e.target.value);
                      if (br) {
                        setEditingPurchase({ ...editingPurchase, branchId: br.id, branchName: br.name });
                      }
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">نوع دفع الفاتورة</span>
                  <select
                    value={editingPurchase.paymentType}
                    onChange={(e) => {
                      const payType = e.target.value as 'cash' | 'credit';
                      setEditingPurchase({ 
                        ...editingPurchase, 
                        paymentType: payType,
                        paidAmount: payType === 'cash' ? editingPurchase.total : 0
                      });
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="cash">نقدي (Cash)</option>
                    <option value="credit">آجل / ذمة (Credit)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">تعديل مبلغ الدفع النقدي</span>
                  <input
                    type="number"
                    disabled={editingPurchase.paymentType === 'cash'}
                    value={editingPurchase.paidAmount}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setEditingPurchase({ ...editingPurchase, paidAmount: Math.min(editingPurchase.total, v) });
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-left disabled:bg-slate-100 dark:disabled:bg-slate-850"
                  />
                </div>
              </div>

              {/* Product search box inside Edit */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">إضافة أو توريد أصناف جديدة للفاتورة</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 text-slate-400" size={13} />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الصنف أو الباركود لإضافة الصنف لقائمة المشتريات..."
                    className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {itemSearchQuery && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-950 rounded-xl shadow-2xl p-2 max-h-48 overflow-y-auto border border-blue-500/20">
                    {filteredSearchProducts.length === 0 ? (
                      <p className="text-center text-xs py-3 text-slate-400">لا توجد أصناف مطابقة للبحث</p>
                    ) : (
                      filteredSearchProducts.map(it => (
                        <div
                          key={it.id}
                          onClick={() => handleAddProductToPurchase(it)}
                          className="p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-950 dark:text-white cursor-pointer rounded-lg flex justify-between"
                        >
                          <span>{it.name}</span>
                          <span className="font-bold text-emerald-500">{it.purchasePrice.toFixed(2)} ₪</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Editing Cart Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">اسم الصنف</th>
                      <th className="p-3">وحدة القياس</th>
                      <th className="p-3 text-center">الكمية المسلمة</th>
                      <th className="p-3 text-center">سعر الشراء المعتمد</th>
                      <th className="p-3 text-left">الإجمالي</th>
                      <th className="p-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {editingPurchase.items.map((cartItem, idx) => (
                      <tr key={`${cartItem.itemId}_${idx}`} className="text-slate-900 dark:text-white">
                        <td className="p-3 font-semibold">{cartItem.itemName}</td>
                        <td className="p-3 text-slate-400">{cartItem.unitName}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={cartItem.quantity}
                            onChange={(e) => handleUpdatePurchaseItemQty(idx, parseFloat(e.target.value) || 1)}
                            className="w-16 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={cartItem.price}
                            onChange={(e) => handleUpdatePurchaseItemPrice(idx, parseFloat(e.target.value) || 0)}
                            className="w-20 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                          />
                        </td>
                        <td className="p-3 text-left font-bold font-mono text-slate-500">{(cartItem.price * cartItem.quantity).toFixed(2)} ₪</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromPurchase(idx)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Discount and Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500">خصم إضافي على الفاتورة (₪):</span>
                    <input
                      type="number"
                      min="0"
                      value={editingPurchase.discount}
                      onChange={(e) => {
                        const disc = parseFloat(e.target.value) || 0;
                        const sub = editingPurchase.subTotal;
                        const tot = Math.max(0, sub - disc);
                        setEditingPurchase({
                          ...editingPurchase,
                          discount: disc,
                          total: tot,
                          paidAmount: editingPurchase.paymentType === 'cash' ? tot : editingPurchase.paidAmount
                        });
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-left text-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500">ملاحظات الفاتورة:</span>
                    <textarea
                      value={editingPurchase.notes || ''}
                      onChange={(e) => setEditingPurchase({ ...editingPurchase, notes: e.target.value })}
                      rows={2}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-950 dark:text-white"
                      placeholder="أضف ملاحظات تصحيح الفاتورة..."
                    />
                  </div>
                </div>

                <div className="bg-slate-500/5 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-center space-y-2 text-slate-900 dark:text-white">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">المجموع الفرعي الأصلي:</span>
                    <span className="font-mono">{editingPurchase.subTotal.toFixed(2)} ₪</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-red-500">
                    <span>خصم معتمد:</span>
                    <span className="font-mono">-{editingPurchase.discount.toFixed(2)} ₪</span>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-850" />
                  <div className="flex justify-between text-sm font-black text-emerald-500">
                    <span>القيمة الكلية المعدلة للفاتورة:</span>
                    <span className="font-mono text-md">{editingPurchase.total.toFixed(2)} ₪</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>المبلغ المستحق كذمة مالية:</span>
                    <span className="font-mono">{(editingPurchase.total - editingPurchase.paidAmount).toFixed(2)} ₪</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Actions Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setEditingPurchase(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                إلغاء الأمر
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                حفظ وإقرار التعديل بالفاتورة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDITING PURCHASE RETURN */}
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
              <div className="flex items-center gap-2 text-amber-500">
                <Pencil size={18} />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">تعديل سند مرتجع المشتريات رقم: {editingReturn.returnNo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReturn(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              
              {/* Meta Card */}
              <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">المورد المرتجع له</span>
                  <select
                    value={editingReturn.supplierId}
                    onChange={(e) => {
                      const supp = contacts.find(c => c.id === e.target.value);
                      if (supp) {
                        setEditingReturn({ ...editingReturn, supplierId: supp.id, supplierName: supp.name });
                      }
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    {supplierContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">المستودع المصدر</span>
                  <select
                    value={editingReturn.branchId}
                    onChange={(e) => {
                      setEditingReturn({ ...editingReturn, branchId: e.target.value });
                    }}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">رقم الفاتورة الأصلية (إن وجد)</span>
                  <input
                    type="text"
                    value={editingReturn.originalInvoiceNo || ''}
                    onChange={(e) => setEditingReturn({ ...editingReturn, originalInvoiceNo: e.target.value || undefined })}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Product search box inside Edit */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">إضافة بضائع جديدة للمرتجع</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 text-slate-400" size={13} />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الصنف لإدراجه لمرتجع المشتريات الحالي..."
                    className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {itemSearchQuery && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-950 rounded-xl shadow-2xl p-2 max-h-48 overflow-y-auto border border-blue-500/20">
                    {filteredSearchProducts.length === 0 ? (
                      <p className="text-center text-xs py-3 text-slate-400">لا توجد أصناف مطابقة للبحث</p>
                    ) : (
                      filteredSearchProducts.map(it => (
                        <div
                          key={it.id}
                          onClick={() => handleAddProductToReturn(it)}
                          className="p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-950 dark:text-white cursor-pointer rounded-lg flex justify-between"
                        >
                          <span>{it.name}</span>
                          <span className="font-bold text-amber-500">{it.purchasePrice.toFixed(2)} ₪</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Editing Return Cart Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">اسم الصنف</th>
                      <th className="p-3">وحدة القياس</th>
                      <th className="p-3 text-center">الكمية المرجوعة</th>
                      <th className="p-3 text-center">سعر المرتجع</th>
                      <th className="p-3 text-left">الإجمالي</th>
                      <th className="p-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {editingReturn.items.map((cartItem, idx) => (
                      <tr key={`${cartItem.itemId}_${idx}`} className="text-slate-900 dark:text-white">
                        <td className="p-3 font-semibold">{cartItem.itemName}</td>
                        <td className="p-3 text-slate-400">{cartItem.unitName}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={cartItem.quantity}
                            onChange={(e) => handleUpdateReturnItemQty(idx, parseFloat(e.target.value) || 1)}
                            className="w-16 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={cartItem.price}
                            onChange={(e) => handleUpdateReturnItemPrice(idx, parseFloat(e.target.value) || 0)}
                            className="w-20 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                          />
                        </td>
                        <td className="p-3 text-left font-bold font-mono text-slate-500">{(cartItem.price * cartItem.quantity).toFixed(2)} ₪</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromReturn(idx)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes and Total banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">ملاحظات مرتجع الشراء:</span>
                  <textarea
                    value={editingReturn.notes || ''}
                    onChange={(e) => setEditingReturn({ ...editingReturn, notes: e.target.value })}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-950 dark:text-white"
                    placeholder="ملاحظات توضح سبب الإرجاع للمورد..."
                  />
                </div>

                <div className="bg-slate-500/5 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-center space-y-2 text-slate-900 dark:text-white">
                  <div className="flex justify-between text-sm font-black text-amber-500">
                    <span>قيمة المرتجع المالي الكلية:</span>
                    <span className="font-mono text-md">{editingReturn.total.toFixed(2)} ₪</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    * سيتم خصم هذه القيمة من الرصيد والذمة المالية المستحقة للمورد بشكل دقيق.
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setEditingReturn(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                إلغاء الأمر
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shadow-md shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                حفظ وإقرار التعديل بالمرتجع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATING NEW PURCHASE RETURN */}
      {showAddReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAddReturn(false)}
          />
          <form 
            onSubmit={handleSubmitNewReturn}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 flex flex-col max-h-[90vh] overflow-hidden text-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-emerald-500">
                <ArrowLeftRight size={18} />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">تسجيل سند مرتجع مشتريات للمورد (إخراج مخزني)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReturn(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              
              <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">اختر المورد المراد إرجاع البضاعة له</span>
                  <select
                    value={newReturnSupplierId}
                    onChange={(e) => setNewReturnSupplierId(e.target.value)}
                    required
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- اختر المورد النشط --</option>
                    {supplierContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">المستودع المخرج منه</span>
                  <select
                    value={newReturnBranchId}
                    onChange={(e) => setNewReturnBranchId(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">رقم الفاتورة الأصلية (اختياري)</span>
                  <input
                    type="text"
                    value={newReturnOriginalInvoice}
                    onChange={(e) => setNewReturnOriginalInvoice(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                    placeholder="رقم الفاتورة الأصلية للرجوع..."
                  />
                </div>
              </div>

              {/* Search product to return */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ابحث عن الأصناف المراد إرجاعها</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 text-slate-400" size={13} />
                  <input
                    type="text"
                    value={newReturnItemSearch}
                    onChange={(e) => setNewReturnItemSearch(e.target.value)}
                    placeholder="ابحث باسم الصنف أو الباركود لإدراجه لسلة المرتجع..."
                    className="w-full p-2.5 pr-9 rounded-xl glass-input text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {newReturnItemSearch && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-950 rounded-xl shadow-2xl p-2 max-h-48 overflow-y-auto border border-emerald-500/20">
                    {filteredReturnProducts.length === 0 ? (
                      <p className="text-center text-xs py-3 text-slate-400">لا توجد أصناف مطابقة للبحث</p>
                    ) : (
                      filteredReturnProducts.map(it => (
                        <div
                          key={it.id}
                          onClick={() => handleAddNewReturnItem(it)}
                          className="p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-950 dark:text-white cursor-pointer rounded-lg flex justify-between"
                        >
                          <span>{it.name}</span>
                          <span className="font-bold text-emerald-500">{it.purchasePrice.toFixed(2)} ₪</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Cart for Return */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">اسم الصنف المرتجع</th>
                      <th className="p-3">وحدة القياس</th>
                      <th className="p-3 text-center">الكمية المرجوعة</th>
                      <th className="p-3 text-center">سعر المرتجع للوحدة</th>
                      <th className="p-3 text-left">المجموع</th>
                      <th className="p-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {newReturnCart.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                          سلة مرتجع المشتريات فارغة، ابحث وأضف الأصناف أعلاه.
                        </td>
                      </tr>
                    ) : (
                      newReturnCart.map((cartItem, idx) => (
                        <tr key={`${cartItem.itemId}_${idx}`} className="text-slate-900 dark:text-white">
                          <td className="p-3 font-semibold">{cartItem.itemName}</td>
                          <td className="p-3 text-slate-400">{cartItem.unitName}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={cartItem.quantity}
                              onChange={(e) => handleUpdateNewReturnItemQty(idx, parseFloat(e.target.value) || 1)}
                              className="w-16 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={cartItem.price}
                              onChange={(e) => handleUpdateNewReturnItemPrice(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 p-1 text-center font-mono rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                            />
                          </td>
                          <td className="p-3 text-left font-bold font-mono text-slate-500">{(cartItem.price * cartItem.quantity).toFixed(2)} ₪</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveNewReturnItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">ملاحظات مرتجع المشتريات:</span>
                  <textarea
                    value={newReturnNotes}
                    onChange={(e) => setNewReturnNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-950 dark:text-white"
                    placeholder="ملاحظات وسياق إرجاع البضاعة للمورد..."
                  />
                </div>

                <div className="bg-slate-500/5 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-center space-y-2 text-slate-900 dark:text-white">
                  <div className="flex justify-between text-sm font-black text-emerald-500">
                    <span>قيمة المرتجع المالي الكلية:</span>
                    <span className="font-mono text-md">
                      {newReturnCart.reduce((sum, it) => sum + (it.price * it.quantity), 0).toFixed(2)} ₪
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    * سيتم إخراج كمية البضائع من مستودع الاستلام وتعديل رصيد كشف حساب المورد.
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setShowAddReturn(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                إلغاء الأمر
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                حفظ وإقرار مرتجع الشراء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETION CONFIRMATION DIALOGUE */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDeletingInvoice(null)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative z-10 space-y-4 text-right">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-md text-red-500 flex items-center gap-1.5 justify-end">
              ⚠️ تأكيد عملية الحذف والإلغاء النهائي للمستند المالي
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              هل أنت متأكد حقاً من حذف وإبطال مفعول مستند الشراء/المرتجع رقم <span className="font-mono font-bold text-red-500">{deletingInvoice.no}</span>؟
              سيؤدي هذا الإجراء لإلغاء كافة الآثار المحاسبية والمستودعية الناتجة عن الحركة فوراً.
            </p>

            <div className="space-y-1 text-right">
              <span className="text-[11px] font-bold text-slate-400">سبب الحذف والتراجع:</span>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="توضيح مبرر الإلغاء لمدير النظام (ضروري للتدقيق)"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingInvoice(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition text-xs font-bold cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!deleteReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
