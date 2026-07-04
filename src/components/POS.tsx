/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, CreditCard, Ticket, Plus, Minus, Trash2, Printer, Keyboard, AlertCircle } from 'lucide-react';
import { Item, CustomerSupplier, Sale, TransactionItem, Branch, Currency } from '../types';

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
}

export default function POS({ items, contacts, branches, activeBranchId, onSaveSale, onPrintInvoice, shopName, activeCurrency, currencies }: POSProps) {
  const currency = activeCurrency || { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true };

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
      // F1: Focus Search
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F2: Toggle Payment Type (Cash/Credit)
      if (e.key === 'F2') {
        e.preventDefault();
        setPaymentType(prev => prev === 'cash' ? 'credit' : 'cash');
      }
      // F4: Complete & Print Invoice
      if (e.key === 'F4') {
        e.preventDefault();
        handleCheckout();
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
      alert('السلة فارغة! الرجاء إضافة أصناف أولاً.');
      return;
    }

    const currentBranch = branches.find(b => b.id === activeBranch);
    const customer = contacts.find(c => c.id === selectedCustomerId);

    if (paymentType === 'credit' && !selectedCustomerId) {
      alert('الرجاء اختيار عميل لعمليات البيع الآجل.');
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
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F1]</strong> التركيز على البحث</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F2]</strong> تبديل نقدي/آجل</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F9]</strong> تعديل المبلغ المدفوع</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[F4]</strong> إتمام الفاتورة والطباعة</span>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded"><strong>[Esc]</strong> مسح البحث</span>
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
            <div className="relative">
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
              <User className="absolute right-2.5 top-3 text-slate-400" size={16} />
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
        </div>
      </div>
    </div>
  );
}
