/**
 * Gaza Cash - Interactive Point of Sale (POS) Cashier Terminal
 * Copyright (c) 2026 Gaza Cash Team. All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, CreditCard, Ticket, Plus, Minus, Trash2, Printer, Keyboard, AlertCircle, X, Calendar, Clock, Sparkles, UserPlus, Layers } from 'lucide-react';
import { Item, CustomerSupplier, Sale, TransactionItem, Branch, Currency, Appointment } from '../types';

interface POSProps {
  items: Item[];
  contacts: CustomerSupplier[];
  branches: Branch[];
  activeBranchId: string;
  onSaveSale: (sale: Omit<Sale, 'id' | 'invoiceNo' | 'date'>) => Sale;
  onPrintInvoice: (sale: Sale) => void;
  shopName: string;
  activeCurrency?: Currency;
  currencies?: Currency[];
  onAddItem?: (item: Omit<Item, 'id'>, initialQty?: number, branchId?: string) => void;
  onAddContact?: (contact: Omit<CustomerSupplier, 'id' | 'currentBalance'>) => void;
  onAddAppointment?: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  appointments?: Appointment[];
}

export default function POS({ 
  items, 
  contacts, 
  branches, 
  activeBranchId, 
  onSaveSale, 
  onPrintInvoice, 
  shopName, 
  activeCurrency, 
  currencies,
  onAddItem,
  onAddContact,
  onAddAppointment,
  appointments = []
}: POSProps) {
  const currency = activeCurrency || { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true };

  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  // POS States
  const [cart, setCart] = useState<{
    item: Item;
    isSubUnit: boolean;
    quantity: number;
    price: number;
  }[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [activeBranch, setActiveBranch] = useState(activeBranchId || 'branch_main');

  // Popup Modals toggle states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);

  // Fast Add Item form states
  const [itemName, setItemName] = useState('');
  const [itemBarcode, setItemBarcode] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPurchasePrice, setItemPurchasePrice] = useState<number | ''>('');
  const [itemSalePrice, setItemSalePrice] = useState<number | ''>('');
  const [itemMainUnit, setItemMainUnit] = useState('شوال');
  const [itemHasSubUnit, setItemHasSubUnit] = useState(false);
  const [itemSubUnitName, setItemSubUnitName] = useState('كيلو');
  const [itemConversionRate, setItemConversionRate] = useState<number | ''>(10);
  const [itemSubUnitSalePrice, setItemSubUnitSalePrice] = useState<number | ''>('');
  const [itemInitialStock, setItemInitialStock] = useState<number | ''>(10);
  const [itemMinStock, setItemMinStock] = useState<number | ''>(5);

  // Fast Add Customer form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerInitialBalance, setCustomerInitialBalance] = useState<number | ''>(0);

  // Fast Add Appointment form states
  const [appCustomerId, setAppCustomerId] = useState('');
  const [appCustomerName, setAppCustomerName] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState('10:00');
  const [appNotes, setAppNotes] = useState('');
  const [appType, setAppType] = useState<'delivery' | 'payment' | 'visit' | 'other'>('delivery');

  // Submit Fast Add Item
  const handleFastAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) {
      toast('يرجى إدخال اسم الصنف', 'warning');
      return;
    }
    const finalBarcode = itemBarcode.trim() || `625${Math.floor(1000000 + Math.random() * 9000000)}`;
    const finalCategory = itemCategory.trim() || 'عام';
    const purchase = +(itemPurchasePrice || 0);
    const sale = +(itemSalePrice || 0);
    const subSale = itemHasSubUnit ? +(itemSubUnitSalePrice || (sale / +(itemConversionRate || 1))) : undefined;
    
    if (onAddItem) {
      onAddItem({
        barcode: finalBarcode,
        name: itemName,
        category: finalCategory,
        mainUnit: itemMainUnit,
        hasSubUnit: itemHasSubUnit,
        subUnitName: itemHasSubUnit ? itemSubUnitName : undefined,
        conversionRate: itemHasSubUnit ? +(itemConversionRate || 1) : undefined,
        purchasePrice: purchase,
        salePrice: sale,
        subUnitSalePrice: subSale,
        minStockAlert: +(itemMinStock || 5)
      }, +(itemInitialStock || 0), activeBranch);

      toast(`تم إضافة الصنف الجديد "${itemName}" بنجاح وتغذيته للمستودع! 📦`, 'success');
      // Reset Item form
      setItemName('');
      setItemBarcode('');
      setItemCategory('');
      setItemPurchasePrice('');
      setItemSalePrice('');
      setItemMainUnit('شوال');
      setItemHasSubUnit(false);
      setItemSubUnitName('كيلو');
      setItemConversionRate(10);
      setItemSubUnitSalePrice('');
      setItemInitialStock(10);
      setItemMinStock(5);
      setShowAddItemModal(false);
    }
  };

  // Submit Fast Add Customer
  const handleFastAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      toast('يرجى كتابة اسم العميل', 'warning');
      return;
    }
    if (onAddContact) {
      onAddContact({
        name: customerName,
        type: 'customer',
        phone: customerPhone,
        address: customerAddress,
        initialBalance: +(customerInitialBalance || 0)
      });
      toast(`تم إضافة العميل الجديد "${customerName}" بنجاح! 👤`, 'success');
      // Reset Customer form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerInitialBalance(0);
      setShowAddCustomerModal(false);
    }
  };

  // Submit Fast Add Appointment
  const handleFastAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCustId = appCustomerId;
    let finalCustName = '';

    if (!finalCustId) {
      if (selectedCustomerId) {
        finalCustId = selectedCustomerId;
        const custObj = contacts.find(c => c.id === selectedCustomerId);
        finalCustName = custObj ? custObj.name : 'زبون عام';
      } else {
        if (!appCustomerName) {
          toast('يرجى كتابة اسم العميل للموعد أو اختيار عميل مسجل', 'warning');
          return;
        }
        finalCustId = 'cust_anonymous';
        finalCustName = appCustomerName;
      }
    } else {
      const custObj = contacts.find(c => c.id === finalCustId);
      finalCustName = custObj ? custObj.name : 'زبون عام';
    }

    if (onAddAppointment) {
      onAddAppointment({
        customerId: finalCustId,
        customerName: finalCustName,
        date: appDate,
        time: appTime,
        notes: appNotes,
        type: appType
      });
      toast(`تم تسجيل وجدولة الموعد للعميل "${finalCustName}" بنجاح! 🗓️`, 'success');
      // Reset Appointment form
      setAppCustomerId('');
      setAppCustomerName('');
      setAppNotes('');
      setAppType('delivery');
      setShowAddAppointmentModal(false);
    }
  };

  // Re-scale cart prices when currency changes
  const prevCurrencyIdRef = useRef(currency.id);
  useEffect(() => {
    if (prevCurrencyIdRef.current !== currency.id) {
      const prevId = prevCurrencyIdRef.current;
      const prevCurr = (currencies || []).find(c => c.id === prevId) || { exchangeRate: 1 };
      
      const updated = cart.map(entry => {
        const priceInBase = entry.price * prevCurr.exchangeRate;
        const newPrice = +(priceInBase / currency.exchangeRate).toFixed(2);
        return { ...entry, price: newPrice };
      });
      setCart(updated);
      prevCurrencyIdRef.current = currency.id;
    }
  }, [currency.id, currencies, cart]);

  // Input Focus Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paidInputRef = useRef<HTMLInputElement>(null);

  // Filter items based on query (by name or barcode)
  const filteredItems = searchQuery.trim() === '' 
    ? [] 
    : items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.barcode.includes(searchQuery)
      );

  // Load hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 or F3: Focus Search
      if (e.key === 'F1' || e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F2: Complete & Print Invoice / Save
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
      }
      // F4: Toggle Payment Type (Cash/Credit)
      if (e.key === 'F4') {
        e.preventDefault();
        setPaymentType(prev => prev === 'cash' ? 'credit' : 'cash');
      }
      // F9: Focus Paid Input
      if (e.key === 'F9') {
        e.preventDefault();
        paidInputRef.current?.focus();
        paidInputRef.current?.select();
      }
      // Escape: Clear Search
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, selectedCustomerId, paymentType, discount, paidAmount, notes, activeBranch]);

  // Sync paid amount when payment type changes
  const subTotal = cart.reduce((sum, entry) => sum + (entry.price * entry.quantity), 0);
  const total = Math.max(0, subTotal - discount);

  useEffect(() => {
    if (paymentType === 'cash') {
      setPaidAmount(total);
    } else {
      setPaidAmount(0);
    }
  }, [paymentType, total]);

  const addToCart = (item: Item, isSubUnit: boolean) => {
    const existingIndex = cart.findIndex(
      entry => entry.item.id === item.id && entry.isSubUnit === isSubUnit
    );

    const basePrice = isSubUnit 
      ? (item.subUnitSalePrice || item.salePrice / (item.conversionRate || 1))
      : item.salePrice;

    const price = +(basePrice / currency.exchangeRate).toFixed(2);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { item, isSubUnit, quantity: 1, price }]);
    }
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(0.1, +(updated[index].quantity + delta).toFixed(2));
    setCart(updated);
  };

  const updatePrice = (index: number, priceStr: string) => {
    const price = Math.max(0, parseFloat(priceStr) || 0);
    const updated = [...cart];
    updated[index].price = price;
    setCart(updated);
  };

  const updateEntryQuantity = (index: number, qtyStr: string) => {
    const qty = Math.max(0.01, parseFloat(qtyStr) || 0);
    const updated = [...cart];
    updated[index].quantity = qty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, idx) => idx !== index));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setNotes('');
    setSelectedCustomerId('');
    setPaymentType('cash');
  };

  // Barcode quick enter handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredItems.length > 0) {
      // If exact barcode match, add it immediately
      const exactMatch = items.find(item => item.barcode === searchQuery.trim());
      if (exactMatch) {
        addToCart(exactMatch, false);
      } else {
        // Add the first matching item
        addToCart(filteredItems[0], false);
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast('السلة فارغة! الرجاء إضافة أصناف أولاً.', 'warning');
      return;
    }

    const currentBranch = branches.find(b => b.id === activeBranch);
    const customer = contacts.find(c => c.id === selectedCustomerId);

    if (paymentType === 'credit' && !selectedCustomerId) {
      toast('الرجاء اختيار عميل لعمليات البيع الآجل.', 'warning');
      return;
    }

    const invoiceItems: TransactionItem[] = cart.map(entry => {
      const isSub = entry.isSubUnit;
      const unitLabel = isSub ? (entry.item.subUnitName || 'حبة') : entry.item.mainUnit;
      // Stored quantity in actual entry items:
      // If big unit: 1. If small unit: 1 but represented in stock calculations as 1/conversionRate
      return {
        itemId: entry.item.id,
        itemName: entry.item.name,
        isSubUnitUsed: isSub,
        quantity: entry.quantity,
        unitName: unitLabel,
        price: entry.price,
        total: entry.price * entry.quantity
      };
    });

    const saleData = {
      customerId: selectedCustomerId || 'cust_anonymous',
      customerName: customer ? customer.name : 'زبون نقدي عام',
      branchId: activeBranch,
      branchName: currentBranch ? currentBranch.name : 'الفرع الرئيسي',
      items: invoiceItems,
      subTotal,
      discount,
      total,
      paidAmount,
      paymentType,
      notes,
      currencyId: currency.id,
      currencyRate: currency.exchangeRate
    };

    // Save transaction and trigger printing
    const savedSale = onSaveSale(saleData);
    onPrintInvoice(savedSale);
    clearCart();
    searchInputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full" id="pos_module">
      {/* Keyboard Shortcuts Bar */}
      <div className="lg:col-span-12 flex flex-wrap gap-3 p-3 rounded-2xl glass-panel-card text-xs text-slate-700 dark:text-slate-300 select-none no-print">
        <span className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <Keyboard size={14} /> اختصارات لوحة المفاتيح النشطة:
        </span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F3 / F1]</strong> البحث عن صنف</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F2]</strong> حفظ وإتمام الفاتورة</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F4]</strong> تبديل طريقة الدفع (نقدي/آجل)</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F9]</strong> تعديل المبلغ المدفوع</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[Esc]</strong> مسح البحث</span>
      </div>

      {/* ⚡ Quick Popup Creation Actions Bar */}
      <div className="lg:col-span-12 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-purple-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200 shadow-md no-print">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold mr-1 text-sm">
          <Sparkles size={16} /> الإجراءات السريعة للفاتورة (دون خروج):
        </span>
        <button 
          type="button"
          onClick={() => setShowAddItemModal(true)} 
          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <Layers size={14} /> إضافة صنف جديد
        </button>
        <button 
          type="button"
          onClick={() => setShowAddCustomerModal(true)} 
          className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/10 cursor-pointer"
        >
          <UserPlus size={14} /> إضافة عميل جديد
        </button>
        <button 
          type="button"
          onClick={() => setShowAddAppointmentModal(true)} 
          className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/10 cursor-pointer"
        >
          <Calendar size={14} /> جدولة موعد/مراجعة
        </button>
      </div>

      {/* Cart and Checkout Panel */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-4 no-print">
        {/* Search & Barcode Header */}
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الصنف أو امسح الباركود مباشرة... [F1]"
              className="w-full pl-10 pr-12 py-3.5 rounded-2xl glass-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md transition-all"
              id="barcode_search"
            />
            <Search className="absolute right-4 top-4 text-slate-400 dark:text-slate-500" size={20} />
            
            {/* Quick barcode indicator */}
            <span className="absolute left-4 top-4 text-xs font-mono text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 select-none">
              BARCODE
            </span>
          </div>
          
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="w-48 py-3.5 px-3 rounded-2xl glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm shadow-md transition-all"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </form>

        {/* Dropdown with filtered items search */}
        {searchQuery && (
          <div className="absolute z-50 left-4 right-4 lg:left-auto lg:w-3/5 xl:w-2/5 mt-16 rounded-2xl shadow-xl glass-panel-card p-3 max-h-96 overflow-y-auto no-scrollbar border border-emerald-500/30">
            {filteredItems.length === 0 ? (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                لا توجد أصناف مطابقة للبحث..
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(item => (
                  <div key={item.id} className="py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-900 dark:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition">
                    <div>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">الباركود: {item.barcode} | القسم: {item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Option 1: Major Unit */}
                      <button
                        type="button"
                        onClick={() => addToCart(item, false)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        + كبرى ({item.mainUnit}) <span className="font-mono">{(item.salePrice / currency.exchangeRate).toFixed(2)} {currency.symbol}</span>
                      </button>
                      {/* Option 2: Minor Unit if available */}
                      {item.hasSubUnit && (
                        <button
                          type="button"
                          onClick={() => addToCart(item, true)}
                          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                        >
                          + صغرى ({item.subUnitName}) <span className="font-mono">{((item.subUnitSalePrice || (item.salePrice / (item.conversionRate || 1))) / currency.exchangeRate).toFixed(2)} {currency.symbol}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sales Cart Table */}
        <div className="flex-1 rounded-2xl glass-panel-card overflow-hidden flex flex-col shadow-lg border border-white/25">
          <div className="p-4 border-b border-white/20 flex justify-between items-center bg-emerald-500/10 dark:bg-emerald-500/5">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShoppingCart className="text-emerald-500" /> سلة المبيعات المباشرة
            </h3>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="text-red-500 hover:text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition"
            >
              تفريع السلة
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-20">
                <ShoppingCart size={48} className="mb-3 opacity-30" />
                <p className="font-semibold text-md">سلة الفاتورة فارغة حالياً</p>
                <p className="text-xs">امسح باركود صنف أو ابحث عنه للبدء بالبيع</p>
              </div>
            ) : (
              cart.map((entry, index) => (
                <div 
                  key={`${entry.item.id}-${entry.isSubUnit ? 'sub' : 'main'}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl glass-panel border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${entry.isSubUnit ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                      {entry.isSubUnit ? `وحدة صغرى: ${entry.item.subUnitName}` : `وحدة كبرى: ${entry.item.mainUnit}`}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{entry.item.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">رمز: {entry.item.barcode}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 sm:mt-0">
                    {/* Price editor */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">سعر الوحدة:</span>
                      <input
                        type="number"
                        value={entry.price}
                        onChange={(e) => updatePrice(index, e.target.value)}
                        className="w-20 text-center py-1 px-1.5 rounded-lg text-sm font-semibold font-mono glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Quantity control */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                        className="text-slate-500 hover:text-red-500 p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={entry.quantity}
                        onChange={(e) => updateEntryQuantity(index, e.target.value)}
                        className="w-16 text-center bg-transparent font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                        className="text-slate-500 hover:text-emerald-500 p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total item cost */}
                    <div className="w-24 text-left">
                      <p className="text-xs text-slate-400">الإجمالي</p>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {(entry.price * entry.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bill Checkout Summary Sidepanel */}
      <div className="lg:col-span-4 h-full no-print">
        <div className="rounded-2xl glass-panel-card p-5 shadow-lg border border-white/25 flex flex-col h-full space-y-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 border-b border-white/20 pb-3 flex items-center gap-2">
            <CreditCard className="text-emerald-500" /> ملخص وحساب الفاتورة
          </h3>

          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">العميل / الزبون</label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full py-2.5 pr-8 pl-3 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">-- زبون نقدي عام مباشر --</option>
                  {contacts.filter(c => c.type === 'customer' || c.type === 'both').map(cust => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.currentBalance < 0 ? `عليه: ${Math.abs(cust.currentBalance)}` : cust.currentBalance > 0 ? `له: ${cust.currentBalance}` : 'خالص'})
                    </option>
                  ))}
                </select>
                <User className="absolute right-2.5 top-3.5 text-slate-400" size={16} />
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="px-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title="إضافة عميل جديد سريعاً"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Payment Type selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">طريقة الدفع [F2]</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('cash')}
                className={`py-2 px-3 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentType === 'cash' ? 'bg-emerald-500 text-white ring-2 ring-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                نقدي (كاش)
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('credit')}
                className={`py-2 px-3 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentType === 'credit' ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                ذمم (آجل)
              </button>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="bg-slate-500/5 rounded-xl p-4 space-y-3.5 border border-white/10">
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
              <span>المجموع قبل الخصم:</span>
              <span className="font-semibold font-mono text-slate-950 dark:text-white">{subTotal.toFixed(2)} {currency.symbol}</span>
            </div>

            {/* Discount Editor */}
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1"><Ticket size={14} /> خصم إضافي:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, +e.target.value))}
                  placeholder="0.00"
                  className="w-24 text-center py-1 px-1.5 rounded-lg font-bold font-mono text-sm glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs font-mono text-slate-500">{currency.symbol}</span>
              </div>
            </div>

            <div className="border-t border-slate-300 dark:border-slate-800 pt-3.5 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-slate-100">المطلوب الصافي:</span>
              <span className="font-extrabold text-xl font-mono text-emerald-600 dark:text-emerald-400">
                {total.toFixed(2)} {currency.symbol}
              </span>
            </div>

            {/* Paid Amount Input */}
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300 pt-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">المبلغ المدفوع [F9]:</span>
              <div className="flex items-center gap-1">
                <input
                  ref={paidInputRef}
                  type="number"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Math.max(0, +e.target.value))}
                  placeholder="0.00"
                  disabled={paymentType === 'cash'}
                  className="w-24 text-center py-1 px-1.5 rounded-lg font-bold font-mono text-sm glass-input text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-75"
                />
                <span className="text-xs font-mono text-slate-500">{currency.symbol}</span>
              </div>
            </div>

            {/* Credit remaining info */}
            {paymentType === 'credit' && (
              <div className="flex justify-between items-center text-xs text-amber-600 dark:text-amber-400 pt-1 border-t border-amber-500/10">
                <span>المتبقي في ذمة العميل:</span>
                <span className="font-bold font-mono">{(total - paidAmount).toFixed(2)} {currency.symbol}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">ملاحظات الفاتورة</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات أو شروط على الفاتورة هنا..."
              className="w-full p-2.5 rounded-xl glass-input text-slate-900 dark:text-white text-xs h-16 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-auto"
          >
            <Printer size={20} /> حفظ وطباعة الفاتورة [F4]
          </button>

          {/* 📅 Sidebar Upcoming Appointments list widget */}
          {appointments && appointments.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-500/5 border border-white/10 space-y-2.5 mt-2 text-right" dir="rtl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Calendar size={13} className="text-purple-500 animate-pulse" /> المراجعات والمواعيد القادمة:
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono">
                  {appointments.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {appointments.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-xs flex flex-col space-y-1 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{app.customerName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        app.type === 'delivery' ? 'bg-sky-500/10 text-sky-600' :
                        app.type === 'payment' ? 'bg-emerald-500/10 text-emerald-600' :
                        app.type === 'visit' ? 'bg-purple-500/10 text-purple-600' : 'bg-slate-500/10 text-slate-600'
                      }`}>
                        {app.type === 'delivery' ? 'توصيل' : app.type === 'payment' ? 'سداد' : app.type === 'visit' ? 'زيارة' : 'أخرى'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                      <span className="flex items-center gap-0.5"><Calendar size={10} /> {app.date}</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {app.time}</span>
                    </div>
                    {app.notes && <p className="text-[10px] text-slate-500 italic truncate">{app.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📦 Modal: Fast Add Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-500 text-white">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Layers size={20} /> إضافة صنف جديد سريعاً
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddItemModal(false)} 
                className="hover:bg-white/10 p-1.5 rounded-xl transition-all text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleFastAddItem} className="p-6 space-y-4 overflow-y-auto flex-1 text-right" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Item Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الصنف الجديد *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="مثال: شوال دقيق القمح الفاخر 25ك"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* Barcode */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الباركود (اختياري)</label>
                  <input
                    type="text"
                    value={itemBarcode}
                    onChange={(e) => setItemBarcode(e.target.value)}
                    placeholder="توليد تلقائي إن ترك فارغاً"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">التصنيف/القسم</label>
                  <input
                    type="text"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="مثال: البقوليات"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* Purchase Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">سعر الشراء (كاش)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemPurchasePrice}
                    onChange={(e) => setItemPurchasePrice(e.target.value === '' ? '' : +e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Sale Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">سعر البيع (الكبرى)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemSalePrice}
                    onChange={(e) => setItemSalePrice(e.target.value === '' ? '' : +e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Main Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوحدة الكبرى</label>
                  <select
                    value={itemMainUnit}
                    onChange={(e) => setItemMainUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="شوال">شوال</option>
                    <option value="كرتونة">كرتونة</option>
                    <option value="صندوق">صندوق</option>
                    <option value="علبة">علبة</option>
                    <option value="حبة">حبة</option>
                    <option value="رزمة">رزمة</option>
                    <option value="كيلو">كيلو</option>
                  </select>
                </div>

                {/* Initial Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">الكمية الافتتاحية بالمستودع</label>
                  <input
                    type="number"
                    value={itemInitialStock}
                    onChange={(e) => setItemInitialStock(e.target.value === '' ? '' : +e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-emerald-50/20 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Sub-unit option toggle */}
                <div className="col-span-2 flex items-center gap-2 py-1.5 border-t border-b border-slate-100 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="fast_item_subunit"
                    checked={itemHasSubUnit}
                    onChange={(e) => setItemHasSubUnit(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="fast_item_subunit" className="text-xs font-extrabold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                    يحتوي على تعبئة كرتونة/تجزئة (وحدة صغرى للتفتيت)
                  </label>
                </div>

                {/* Conditional Sub-unit options */}
                {itemHasSubUnit && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الوحدة الصغرى</label>
                      <input
                        type="text"
                        value={itemSubUnitName}
                        onChange={(e) => setItemSubUnitName(e.target.value)}
                        placeholder="كيلو / علبة صغيرة"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">معدل التحويل (النسبة)</label>
                      <input
                        type="number"
                        value={itemConversionRate}
                        onChange={(e) => setItemConversionRate(e.target.value === '' ? '' : +e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">سعر بيع الوحدة الصغرى (التجزئة)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemSubUnitSalePrice}
                        onChange={(e) => setItemSubUnitSalePrice(e.target.value === '' ? '' : +e.target.value)}
                        placeholder="حساب تلقائي إن بقي فارغاً"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Min Stock Alert */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حد إنذار نقص المخزون (تحذير المخازن)</label>
                  <input
                    type="number"
                    value={itemMinStock}
                    onChange={(e) => setItemMinStock(e.target.value === '' ? '' : +e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  حفظ الصنف وتغذيته
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👤 Modal: Fast Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-sky-500 text-white">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <UserPlus size={20} /> إضافة حساب عميل جديد
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddCustomerModal(false)} 
                className="hover:bg-white/10 p-1.5 rounded-xl transition-all text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleFastAddCustomer} className="p-6 space-y-4 text-right" dir="rtl">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم العميل بالكامل *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: شركة القدس للتجارة"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رقم الهاتف/الجوال</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="مثال: 0599000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-left"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العنوان / الملاحظات</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="مثال: غزة، الرمال - شارع عمر المختار"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                />
              </div>

              {/* Initial Balance */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الرصيد الافتتاحي المالي (شيكل)</label>
                <input
                  type="number"
                  value={customerInitialBalance}
                  onChange={(e) => setCustomerInitialBalance(e.target.value === '' ? '' : +e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">أدخل قيمة سالبة إذا كان العميل عليه ديون سابقة.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📅 Modal: Fast Add Appointment */}
      {showAddAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-purple-500 text-white">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Calendar size={20} /> تسجيل وجدولة موعد مراجعة
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddAppointmentModal(false)} 
                className="hover:bg-white/10 p-1.5 rounded-xl transition-all text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleFastAddAppointment} className="p-6 space-y-4 text-right" dir="rtl">
              
              {/* Registered Customer Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ربط مع عميل مسجل (اختياري)</label>
                <select
                  value={appCustomerId}
                  onChange={(e) => {
                    setAppCustomerId(e.target.value);
                    if (e.target.value) setAppCustomerName('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- اكتب اسماً مخصصاً بالأسفل --</option>
                  {contacts.filter(c => c.type === 'customer' || c.type === 'both').map(cust => (
                    <option key={cust.id} value={cust.id}>{cust.name}</option>
                  ))}
                </select>
              </div>

              {/* Manual Customer Name (if none selected above) */}
              {!appCustomerId && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم العميل المباشر *</label>
                  <input
                    type="text"
                    value={appCustomerName}
                    onChange={(e) => setAppCustomerName(e.target.value)}
                    placeholder="اكتب اسم العميل صاحب الموعد"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">التاريخ</label>
                  <input
                    type="date"
                    required
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوقت</label>
                  <input
                    type="time"
                    required
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                  />
                </div>
              </div>

              {/* Appointment Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نوع الإجراء / المراجعة</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="delivery">توصيل طلبيات أو شحنة بضاعة</option>
                  <option value="payment">مراجعة حساب / سداد دفعة مالية</option>
                  <option value="visit">زيارة فحص ومتابعة فنية</option>
                  <option value="other">أخرى / مراجعة دورية عامة</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تفاصيل / ملاحظات الموعد</label>
                <textarea
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="مثال: يرجى إحضار عينات من بضائع الفاخرة لتجربتها..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAppointmentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  جدولة الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
