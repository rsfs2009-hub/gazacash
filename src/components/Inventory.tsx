/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Plus, MapPin, ArrowRightLeft, FileText, ClipboardList, AlertTriangle, Save, RefreshCw, Trash, Upload, FileSpreadsheet, Pencil, Search, X, SlidersHorizontal, Filter } from 'lucide-react';
import { Item, Branch, BranchStock, BranchTransfer, ItemMovement, Currency } from '../types';

interface InventoryProps {
  items: Item[];
  branches: Branch[];
  branchStock: BranchStock[];
  movements: ItemMovement[];
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onUpdateItem: (id: string, item: Partial<Item>) => void;
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
  onUpdateBranch?: (id: string, branch: Partial<Branch>) => void;
  onTransferStock: (transfer: Omit<BranchTransfer, 'id' | 'transferNo' | 'date'>) => void;
  onImportItemsAndStock?: (imported: Array<{ item: Omit<Item, 'id'>, qty: number }>) => void;
  onAdjustStock?: (itemId: string, branchId: string, actualQty: number, notes: string) => void;
  activeCurrency?: Currency;
  initialTab?: 'items' | 'branches' | 'transfers' | 'ledger' | 'import' | 'adjust';
  onTabChange?: (tab: 'items' | 'branches' | 'transfers' | 'ledger' | 'import' | 'adjust') => void;
}

export default function Inventory({
  items,
  branches,
  branchStock,
  movements,
  onAddItem,
  onUpdateItem,
  onAddBranch,
  onUpdateBranch,
  onTransferStock,
  onImportItemsAndStock,
  onAdjustStock,
  activeCurrency,
  initialTab,
  onTabChange
}: InventoryProps) {
  const currency = activeCurrency || { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true };

  // Helper for dynamic premium toasts
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if ((window as any).showToast) {
      (window as any).showToast(message, type);
    } else {
      alert(message);
    }
  };

  // Navigation Tabs within Inventory module
  const [activeTab, setActiveTab] = React.useState<'items' | 'branches' | 'transfers' | 'ledger' | 'import' | 'adjust'>(initialTab || 'items');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'items' | 'branches' | 'transfers' | 'ledger' | 'import' | 'adjust') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Form states - Add Item
  const [itemName, setItemName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [mainUnit, setMainUnit] = useState('حبة');
  const [hasSubUnit, setHasSubUnit] = useState(false);
  const [subUnitName, setSubUnitName] = useState('');
  const [conversionRate, setConversionRate] = useState<number>(12);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [subUnitSalePrice, setSubUnitSalePrice] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [selectedEditItemId, setSelectedEditItemId] = useState<string | null>(null);

  // Form states - Add Branch
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [selectedEditBranchId, setSelectedEditBranchId] = useState<string | null>(null);

  // Form states - Stock Transfer
  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [transferItemId, setTransferItemId] = useState('');
  const [transferQty, setTransferQty] = useState<number>(0);
  const [transferNotes, setTransferNotes] = useState('');

  // Form states - Item movement ledger (كشف حركات الصنف لوحده)
  const [selectedLedgerItemId, setSelectedLedgerItemId] = useState(items[0]?.id || '');
  const [selectedLedgerBranchId, setSelectedLedgerBranchId] = useState('all');

  // Form states - Physical Inventory Count & Adjustment
  const [adjustBranchId, setAdjustBranchId] = useState(branches[0]?.id || '');
  const [adjustSearchTerm, setAdjustSearchTerm] = useState('');
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({});
  const [adjustNotes, setAdjustNotes] = useState<Record<string, string>>({});

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchBarcode, setSearchBarcode] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal Visibility States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Helper: Get stock for item in a specific branch
  const getBranchStockQty = (itemId: string, branchId: string): number => {
    const stock = branchStock.find(s => s.itemId === itemId && s.branchId === branchId);
    return stock ? stock.quantity : 0;
  };

  // Helper: Get total stock for item (across all branches)
  const getTotalStockQty = (itemId: string): number => {
    return branchStock
      .filter(s => s.itemId === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  };

  // Categories Memo
  const categories = React.useMemo(() => {
    const cats = items.map(item => item.category || 'عام').filter(Boolean);
    return Array.from(new Set(cats));
  }, [items]);

  // Filtered items for management list
  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      // 1. Basic search (unified text field)
      const matchesBasicSearch = !searchTerm.trim() || (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 2. Multi-search criteria (discrete fields)
      const matchesName = !searchName.trim() || item.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesBarcode = !searchBarcode.trim() || item.barcode.toLowerCase().includes(searchBarcode.toLowerCase());
      const matchesCatSearch = !searchCategory.trim() || (item.category || '').toLowerCase().includes(searchCategory.toLowerCase());

      // 3. Category selector pill
      const matchesCategoryPill = 
        selectedCategory === 'all' || 
        (item.category || 'عام') === selectedCategory;

      // 4. Low stock check with optional dynamic threshold
      const stock = getTotalStockQty(item.id);
      const threshold = lowStockThreshold !== '' ? Number(lowStockThreshold) : item.minStockAlert;
      const matchesLowStock = !showLowStockOnly || (stock <= threshold);

      return matchesBasicSearch && matchesName && matchesBarcode && matchesCatSearch && matchesCategoryPill && matchesLowStock;
    });
  }, [items, searchTerm, searchName, searchBarcode, searchCategory, selectedCategory, showLowStockOnly, lowStockThreshold, branchStock]);

  const handleImportProcess = (rawText: string) => {
    if (!onImportItemsAndStock) {
      toast('ميزة الاستيراد غير متوفرة حالياً في النسخة النشطة.', 'warning');
      return;
    }

    const separator = rawText.includes('\t') ? '\t' : (rawText.includes(';') ? ';' : ',');
    const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast('الرجاء التأكد من وجود صف العناوين وصنف واحد على الأقل في الجدول.', 'warning');
      return;
    }

    const parsedRows: Array<{ item: Omit<Item, 'id'>, qty: number }> = [];

    // Skip the header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Clean and split cols
      const cols = line.split(separator).map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length < 2) continue; // Needs barcode and name at least

      const barcode = cols[0];
      const name = cols[1];
      const qty = parseFloat(cols[2]) || 0;
      const purchasePrice = parseFloat(cols[3]) || 0;
      const salePrice = parseFloat(cols[4]) || 0;
      const category = cols[5] || 'عام';
      const mainUnit = cols[6] || 'حبة';
      const subUnitName = cols[7] || '';
      const conversionRate = cols[8] ? parseInt(cols[8], 10) : undefined;
      const subUnitSalePrice = cols[9] ? parseFloat(cols[9]) : undefined;

      if (!barcode || !name) continue;

      parsedRows.push({
        item: {
          barcode,
          name,
          category,
          mainUnit,
          hasSubUnit: !!subUnitName,
          subUnitName: subUnitName || undefined,
          conversionRate: conversionRate || undefined,
          purchasePrice,
          salePrice,
          subUnitSalePrice: subUnitSalePrice || undefined,
          minStockAlert: 5
        },
        qty
      });
    }

    if (parsedRows.length === 0) {
      toast('فشل تحليل وتنسيق أي صفوف؛ يرجى مراجعة ترتيب الأعمدة ومطابقتها للمثال.', 'error');
      return;
    }

    if (confirm(`تم العثور على عدد ${parsedRows.length} صنف جاهز للاستيراد. هل تريد التأكيد والبدء الآن؟`)) {
      onImportItemsAndStock(parsedRows);
      // Clean paste input
      const el = document.getElementById('excel_paste_area') as HTMLTextAreaElement;
      if (el) el.value = '';
    }
  };

  // Format decimal stock representation to a friendly string, e.g. "2 كرتونة و 3 حبة"
  const formatStockQty = (item: Item, totalMainUnits: number): string => {
    if (!item.hasSubUnit || !item.conversionRate) {
      return `${totalMainUnits} ${item.mainUnit}`;
    }
    const wholeMain = Math.floor(totalMainUnits);
    const fraction = totalMainUnits - wholeMain;
    const subQty = Math.round(fraction * item.conversionRate);
    
    if (wholeMain > 0 && subQty > 0) {
      return `${wholeMain} ${item.mainUnit} و ${subQty} ${item.subUnitName}`;
    } else if (wholeMain > 0) {
      return `${wholeMain} ${item.mainUnit}`;
    } else {
      return `${subQty} ${item.subUnitName}`;
    }
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !barcode) {
      toast('الرجاء تعبئة اسم الصنف والباركود', 'error');
      return;
    }

    const itemPayload = {
      name: itemName,
      barcode,
      category: category || 'عام',
      mainUnit,
      hasSubUnit,
      subUnitName: hasSubUnit ? subUnitName : undefined,
      conversionRate: hasSubUnit ? conversionRate : undefined,
      purchasePrice: +purchasePrice,
      salePrice: +salePrice,
      subUnitSalePrice: hasSubUnit ? +subUnitSalePrice : undefined,
      minStockAlert: +minStockAlert
    };

    if (selectedEditItemId) {
      onUpdateItem(selectedEditItemId, itemPayload);
      setSelectedEditItemId(null);
    } else {
      onAddItem(itemPayload);
    }

    // Reset Form and close modal
    setItemName('');
    setBarcode('');
    setCategory('');
    setMainUnit('حبة');
    setHasSubUnit(false);
    setSubUnitName('');
    setConversionRate(12);
    setPurchasePrice(0);
    setSalePrice(0);
    setSubUnitSalePrice(0);
    setMinStockAlert(5);
    setIsItemModalOpen(false);
  };

  const handleEditItem = (item: Item) => {
    setSelectedEditItemId(item.id);
    setItemName(item.name);
    setBarcode(item.barcode);
    setCategory(item.category);
    setMainUnit(item.mainUnit);
    setHasSubUnit(item.hasSubUnit);
    setSubUnitName(item.subUnitName || '');
    setConversionRate(item.conversionRate || 12);
    setPurchasePrice(item.purchasePrice);
    setSalePrice(item.salePrice);
    setSubUnitSalePrice(item.subUnitSalePrice || 0);
    setMinStockAlert(item.minStockAlert);
    setIsItemModalOpen(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedEditBranchId(branch.id);
    setBranchName(branch.name);
    setBranchLocation(branch.location || '');
    setIsBranchModalOpen(true);
  };

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName) return;
    
    if (selectedEditBranchId) {
      if (onUpdateBranch) {
        onUpdateBranch(selectedEditBranchId, { name: branchName, location: branchLocation });
      }
      setSelectedEditBranchId(null);
      toast('تم تعديل بيانات المستودع بنجاح!', 'success');
    } else {
      onAddBranch({
        name: branchName,
        location: branchLocation
      });
      toast('تم إضافة المستودع بنجاح!', 'success');
    }
    setBranchName('');
    setBranchLocation('');
    setIsBranchModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromBranch || !toBranch || !transferItemId || transferQty <= 0) {
      toast('الرجاء إدخال كافة حقول التحويل بصورة صحيحة', 'error');
      return;
    }
    if (fromBranch === toBranch) {
      toast('لا يمكن التحويل لنفس الفرع!', 'warning');
      return;
    }

    const currentFromStock = getBranchStockQty(transferItemId, fromBranch);
    if (currentFromStock < transferQty) {
      toast('عذراً، الكمية المتوفرة في فرع المصدر غير كافية لإجراء التحويل!', 'error');
      return;
    }

    const item = items.find(i => i.id === transferItemId);
    if (!item) return;

    onTransferStock({
      fromBranchId: fromBranch,
      fromBranchName: branches.find(b => b.id === fromBranch)?.name || '',
      toBranchId: toBranch,
      toBranchName: branches.find(b => b.id === toBranch)?.name || '',
      items: [{
        itemId: transferItemId,
        itemName: item.name,
        quantity: transferQty,
        unitName: item.mainUnit
      }],
      notes: transferNotes
    });

    setTransferItemId('');
    setTransferQty(0);
    setTransferNotes('');
    setIsTransferModalOpen(false);
    toast('تم تسجيل عملية التحويل بين الفروع بنجاح وتحديث كميات المخزن!', 'success');
  };

  // Filtered movements for "كشف حركات الصنف لوحده" (Tab: ledger)
  const filteredLedgerMovements = movements
    .filter(m => m.itemId === selectedLedgerItemId)
    .filter(m => selectedLedgerBranchId === 'all' || m.branchId === selectedLedgerBranchId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ledgerItem = items.find(i => i.id === selectedLedgerItemId);

  const handleApplyAdjustments = () => {
    if (!onAdjustStock) {
      toast('ميزة التعديل غير متوفرة حالياً.', 'error');
      return;
    }

    const itemsToAdjust = items.filter(item => {
      const bookQty = getBranchStockQty(item.id, adjustBranchId);
      const physicalVal = physicalCounts[item.id];
      if (physicalVal === undefined || physicalVal === '') return false;
      const actualQty = parseFloat(physicalVal);
      return !isNaN(actualQty) && actualQty !== bookQty;
    });

    if (itemsToAdjust.length === 0) {
      toast('لم يتم العثور على أي تغييرات في الكميات الفعلية عن الكميات الدفترية لتسويتها.', 'warning');
      return;
    }

    const confirmMsg = `هل أنت متأكد من اعتماد تسوية الجرد الفعلي لـ (${itemsToAdjust.length}) أصناف في الفرع المحدد؟\nسيتم تعديل رصيد المخزن تلقائياً وتوليد حركات تسوية مخزنية محاسبية معتمدة.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    let successCount = 0;
    itemsToAdjust.forEach(item => {
      const actualQty = parseFloat(physicalCounts[item.id]);
      const notes = adjustNotes[item.id] || 'تسوية جرد دوري';
      onAdjustStock(item.id, adjustBranchId, actualQty, notes);
      successCount++;
    });

    toast(`تم بنجاح اعتماد تسوية جرد المستودع وتعديل المخزون لـ ${successCount} أصناف بنجاح!`, 'success');
    setPhysicalCounts({});
    setAdjustNotes({});
  };

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => handleTabChange('items')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'items' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <Package size={16} /> الأصناف والمخزون
        </button>
        <button
          onClick={() => handleTabChange('branches')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'branches' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <MapPin size={16} /> الفروع والمستودعات
        </button>
        <button
          onClick={() => handleTabChange('transfers')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'transfers' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <ArrowRightLeft size={16} /> تحويل بين الفروع
        </button>
        <button
          onClick={() => handleTabChange('ledger')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'ledger' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          id="item_movement_card"
        >
          <ClipboardList size={16} /> كشف حركات الصنف لوحده
        </button>
        <button
          onClick={() => handleTabChange('import')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'import' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <Upload size={16} /> استيراد رصيد أول المدة (إكسل)
        </button>
        <button
          onClick={() => handleTabChange('adjust')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === 'adjust' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <ClipboardList size={16} className="text-amber-500" /> جرد وتعديل المخزون الفعلي
        </button>
      </div>

      {/* 1. TAB: ITEMS MANAGEMENT */}
      {activeTab === 'items' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Advanced Search & Filtering Bar */}
          <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">🔍 محرك البحث الذكي والتصفية المتطورة</h3>
                <p className="text-[11px] text-slate-400">ابحث بمرونة تامة عن طريق حقول مخصصة أو فلاتر النواقص الذكية في ثوانٍ معدودة.</p>
              </div>

              {/* Filtering Toggles & Add Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Low Stock Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    showLowStockOnly
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 ring-2 ring-rose-500/10 font-extrabold'
                      : 'bg-slate-500/5 hover:bg-slate-500/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <AlertTriangle size={14} className={showLowStockOnly ? 'animate-pulse text-rose-500' : 'text-amber-500'} />
                  <span>النواقص فقط ({items.filter(item => getTotalStockQty(item.id) <= item.minStockAlert).length})</span>
                </button>

                {/* Add New Item Action Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEditItemId(null);
                    setItemName('');
                    setBarcode('');
                    setCategory('');
                    setMainUnit('حبة');
                    setHasSubUnit(false);
                    setSubUnitName('');
                    setConversionRate(12);
                    setPurchasePrice(0);
                    setSalePrice(0);
                    setSubUnitSalePrice(0);
                    setMinStockAlert(5);
                    setIsItemModalOpen(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span>إضافة صنف جديد</span>
                </button>
              </div>
            </div>

            {/* Grid of Specialized Inputs for Multi-Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1 text-right">
              {/* 1. Name Search */}
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">الاسم:</span>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="اسم الصنف المراد..."
                  className="w-full pr-12 pl-8 py-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
                {searchName && (
                  <button
                    onClick={() => setSearchName('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 2. Barcode Search */}
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">الباركود:</span>
                <input
                  type="text"
                  value={searchBarcode}
                  onChange={(e) => setSearchBarcode(e.target.value)}
                  placeholder="ابحث بالرمز أو امسح الباركود..."
                  className="w-full pr-14 pl-8 py-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
                {searchBarcode && (
                  <button
                    onClick={() => setSearchBarcode('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 3. Category Search */}
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">التصنيف:</span>
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="اسم القسم أو الفئة..."
                  className="w-full pr-14 pl-8 py-2 rounded-xl glass-input text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
                {searchCategory && (
                  <button
                    onClick={() => setSearchCategory('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 4. Dynamic Low Stock Custom Threshold Filter */}
              <div className="relative flex items-center gap-1.5 justify-end">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">عتبة النواقص ⚠️:</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLowStockThreshold(val === '' ? '' : Number(val));
                    }}
                    placeholder="افتراضي"
                    min="0"
                    className="w-full px-2 py-1.5 rounded-xl glass-input text-center text-xs text-rose-600 dark:text-rose-400 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                    title="تعديل قيمة الحد الأدنى لتصفية النواقص ديناميكياً بدلاً من التنبيه الافتراضي لكل صنف"
                  />
                  {lowStockThreshold !== '' && (
                    <button
                      onClick={() => setLowStockThreshold('')}
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="الرجوع للحدود الافتراضية"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Dynamic list) */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Filter size={12} /> أقسام المخازن:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-500/5 hover:bg-slate-500/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                الكل ({items.length})
              </button>
              {categories.map(cat => {
                const count = items.filter(i => (i.category || 'عام') === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-500/5 hover:bg-slate-500/10 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Inventory Table */}
          <div className="rounded-2xl glass-panel-card border border-white/25 p-5 shadow-md flex flex-col space-y-4">
            <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex justify-between items-center">
              <span>جدول الأصناف والمخزون</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal px-2.5 py-1 rounded-full">
                تم العثور على: {filteredItems.length} صنف
              </span>
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                    <th className="pb-3 pr-2">الصنف والباركود</th>
                    <th className="pb-3">القسم</th>
                    <th className="pb-3 text-center">الوحدات وسعر البيع</th>
                    <th className="pb-3 text-center">الكمية المتوفرة</th>
                    <th className="pb-3 text-left pl-2">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        لا توجد أصناف مطابقة لخيارات البحث والتصفية المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const stock = getTotalStockQty(item.id);
                      const isLowStock = stock <= item.minStockAlert;
                      
                      return (
                        <tr key={item.id} className="text-slate-900 dark:text-white hover:bg-slate-500/5 transition">
                          <td className="py-3 pr-2">
                            <div className="font-semibold flex items-center gap-1.5">
                              <span 
                                onClick={() => {
                                  setSelectedLedgerItemId(item.id);
                                  handleTabChange('ledger');
                                }}
                                className="hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer transition"
                                title="اضغط لفتح كشف حركات الصنف بالكامل 🔍"
                              >
                                {item.name}
                              </span>
                              {isLowStock && (
                                <span className="text-rose-500 inline-block animate-pulse" title="المخزون قارب على النفاد!">
                                  <AlertTriangle size={14} />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">الرمز: {item.barcode}</div>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{item.category || 'عام'}</td>
                          <td className="py-3 text-center text-xs">
                            <div>الكبرى ({item.mainUnit}): <strong className="font-mono text-emerald-600 dark:text-emerald-400">{(item.salePrice / currency.exchangeRate).toFixed(2)} {currency.symbol}</strong> {!currency.isBase && <span className="text-[10px] text-slate-500">({item.salePrice} شيكل)</span>}</div>
                            {item.hasSubUnit && (
                              <div className="text-slate-500">الصغيرة ({item.subUnitName}): <strong className="font-mono text-sky-600 dark:text-sky-400">{((item.subUnitSalePrice || (item.salePrice / (item.conversionRate || 1))) / currency.exchangeRate).toFixed(2)} {currency.symbol}</strong> {!currency.isBase && <span className="text-[10px] text-slate-400">({(item.subUnitSalePrice || (item.salePrice / (item.conversionRate || 1))).toFixed(2)} شيكل)</span>}</div>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`font-bold font-mono text-sm px-2.5 py-1 rounded-lg ${isLowStock ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-500/20' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                              {formatStockQty(item, stock)}
                            </span>
                          </td>
                          <td className="py-3 text-left pl-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-emerald-500 hover:text-emerald-600 font-bold text-xs cursor-pointer"
                            >
                              تعديل
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: BRANCHES MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="font-bold text-md text-slate-800 dark:text-slate-100">الفروع والمستودعات المعتمدة وتوفر البضائع</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">إدارة مستودعات ومنافذ توزيع غزة كاش</p>
              </div>
              <button
                onClick={() => {
                  setSelectedEditBranchId(null);
                  setBranchName('');
                  setBranchLocation('');
                  setIsBranchModalOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>إضافة مستودع / فرع جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {branches.map(b => {
                const bStock = branchStock.filter(s => s.branchId === b.id);
                const distinctItemsCount = bStock.filter(s => s.quantity > 0).length;
                
                return (
                  <div key={b.id} className="p-4 rounded-xl glass-panel border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-white text-base">{b.name}</h4>
                        <p className="text-xs text-slate-500">{b.location || 'لا يوجد موقع جغرافي محدد'}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditBranch(b)}
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer"
                          title="تعديل بيانات المستودع"
                        >
                          <Pencil size={12} />
                        </button>
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          نشط
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>الأصناف المتوفرة بالفرع:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">{distinctItemsCount} صنف</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: STOCK TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <RefreshCw size={18} className="text-emerald-500" /> سجل حركات التحويل المخزني
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">متابعة وتدقيق سندات نقل البضائع بين الفروع والمخازن</p>
              </div>
              <button
                onClick={() => {
                  setFromBranch('');
                  setToBranch('');
                  setTransferItemId('');
                  setTransferQty(0);
                  setTransferNotes('');
                  setIsTransferModalOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRightLeft size={16} />
                <span>إجراء تحويل مخزني جديد</span>
              </button>
            </div>
            
            <div className="overflow-x-auto no-scrollbar max-h-[500px]">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="pb-3 pr-2">رقم السند والتاريخ</th>
                    <th className="pb-3">من مستودع</th>
                    <th className="pb-3">إلى مستودع</th>
                    <th className="pb-3">الأصناف والكمية</th>
                    <th className="pb-3 pl-2">ملاحظات التحويل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {movements.filter(m => m.type === 'transfer_out').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        لا توجد عمليات تحويل مخزني مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    movements.filter(m => m.type === 'transfer_out').map(mov => {
                      // Match corresponding transfer in
                      const matchingIn = movements.find(x => x.referenceNo === mov.referenceNo && x.type === 'transfer_in');
                      return (
                        <tr key={mov.id} className="text-slate-900 dark:text-white hover:bg-slate-500/5 py-2">
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{mov.referenceNo}</div>
                            <div className="text-[10px] text-slate-500">{new Date(mov.date).toLocaleString('ar-EG')}</div>
                          </td>
                          <td className="py-2.5 text-rose-500 font-bold">{mov.branchName}</td>
                          <td className="py-2.5 text-emerald-500 font-bold">{matchingIn ? matchingIn.branchName : 'وجهة مجهولة'}</td>
                          <td className="py-2.5 font-extrabold text-slate-950 dark:text-white">
                            {mov.itemName} <span className="font-mono text-emerald-600 dark:text-emerald-400">({Math.abs(mov.quantityChange)} {mov.unitName})</span>
                          </td>
                          <td className="py-2.5 pl-2 text-slate-500 dark:text-slate-400">{mov.description || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: ITEM MOVEMENT LEDGER (كشف حركات الصنف لوحده) */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-500/10 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 no-print">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-950 dark:text-white flex items-center gap-1.5">
                <FileText size={18} className="text-emerald-500" /> كشف تفصيلي لحركات الصنف المستقل
              </h3>
              <p className="text-xs text-slate-500">اختر الصنف لمتابعة جرد حركاته وسجل بيعه وشرائه في جميع المستودعات</p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Item Selector */}
              <div className="flex-1 md:w-64">
                <select
                  value={selectedLedgerItemId}
                  onChange={(e) => setSelectedLedgerItemId(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">-- اختر الصنف --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Branch Selector */}
              <div className="md:w-48">
                <select
                  value={selectedLedgerBranchId}
                  onChange={(e) => setSelectedLedgerBranchId(e.target.value)}
                  className="w-full p-2 rounded-xl glass-input text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="all">كل الفروع</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  (window as any)._printTargetSelector = '.print-report-wrapper';
                  window.print();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer"
              >
                طباعة الكشف
              </button>
            </div>
          </div>

          {/* Ledger Table Print View & Screen View */}
          {ledgerItem ? (
            <div className="print-report-wrapper space-y-4 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">كشف حركة الصنف</span>
                  <h2 className="font-extrabold text-xl text-slate-950 dark:text-white">{ledgerItem.name}</h2>
                  <p className="text-xs text-slate-500">باركود: {ledgerItem.barcode} | تصنيف: {ledgerItem.category}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">الرصيد الكلي المتاح حالياً:</p>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-lg">
                    {formatStockQty(ledgerItem, getTotalStockQty(ledgerItem.id))}
                  </span>
                </div>
              </div>

              {filteredLedgerMovements.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  لا توجد حركات مسجلة لهذا الصنف تحت الخيارات المحددة.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                        <th className="pb-3 pr-2">التاريخ</th>
                        <th className="pb-3">نوع الحركة وموقعها</th>
                        <th className="pb-3">الرقم المرجعي (السند)</th>
                        <th className="pb-3 text-center">الكمية المغيرة</th>
                        <th className="pb-3 pl-2">البيان والوصف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                      {filteredLedgerMovements.map(mov => {
                        const isPositive = mov.quantityChange > 0;
                        const qtySignStr = isPositive ? `+ ${mov.quantityChange}` : `${mov.quantityChange}`;
                        
                        let typeBadgeColor = 'bg-slate-100 text-slate-700';
                        let typeLabel = 'تعديل';
                        if (mov.type === 'sale') {
                          typeBadgeColor = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
                          typeLabel = 'مبيعات مباشرة';
                        } else if (mov.type === 'purchase') {
                          typeBadgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
                          typeLabel = 'فاتورة مشتريات';
                        } else if (mov.type === 'return_in') {
                          typeBadgeColor = 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
                          typeLabel = 'مرتجع مبيعات';
                        } else if (mov.type === 'transfer_out') {
                          typeBadgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                          typeLabel = 'تحويل صادر';
                        } else if (mov.type === 'transfer_in') {
                          typeBadgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
                          typeLabel = 'تحويل وارد';
                        }

                        return (
                          <tr key={mov.id} className="hover:bg-slate-500/5 transition">
                            <td className="py-3 pr-2 text-xs font-mono text-slate-500">
                              {new Date(mov.date).toLocaleString('ar-EG')}
                            </td>
                            <td className="py-3">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5 ${typeBadgeColor}`}>
                                {typeLabel}
                              </span>
                              <div className="text-xs text-slate-500">{mov.branchName}</div>
                            </td>
                            <td className="py-3 font-semibold font-mono text-xs">{mov.referenceNo}</td>
                            <td className="py-3 text-center">
                              <span className={`font-bold font-mono text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {qtySignStr} {mov.unitName}
                              </span>
                            </td>
                            <td className="py-3 pl-2 text-xs text-slate-600 dark:text-slate-400">{mov.description}</td>
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
              الرجاء إضافة أصناف للنظام لتفعيل كشف حركات الأصناف.
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: IMPORT BEGINNING INVENTORY */}
      {activeTab === 'import' && (
        <div className="rounded-2xl glass-panel-card p-6 border border-white/25 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-md text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FileSpreadsheet className="text-emerald-500" size={20} />
                استيراد الأصناف ورصيد أول المدة من ملف إكسل / CSV
              </h3>
              <p className="text-xs text-slate-500">
                يتيح لك هذا القسم إدخال كميات كبيرة من الأصناف والسلع مع أرصدتها الافتتاحية (رصيد أول المدة) دفعة واحدة لتوفير الوقت والجهد البدني.
              </p>
            </div>
          </div>

          {/* Form instructions */}
          <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-xl p-4 text-xs space-y-3">
            <h4 className="font-extrabold text-sm">💡 صيغة الملف المطلوبة وترتيب الأعمدة:</h4>
            <p>يجب أن يحتوي الملف أو البيانات المنسوخة على الصف الأول كعناوين للأعمدة، وتكون مرتبة تماماً كالتالي من اليمين إلى اليسار:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center border border-emerald-500/20 rounded-lg overflow-hidden bg-white dark:bg-slate-900/60 font-mono text-[11px] leading-relaxed">
                <thead>
                  <tr className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                    <th className="p-1.5 border border-emerald-500/10">1. الباركود</th>
                    <th className="p-1.5 border border-emerald-500/10">2. اسم الصنف</th>
                    <th className="p-1.5 border border-emerald-500/10">3. رصيد أول المدة</th>
                    <th className="p-1.5 border border-emerald-500/10">4. سعر الشراء</th>
                    <th className="p-1.5 border border-emerald-500/10">5. سعر البيع</th>
                    <th className="p-1.5 border border-emerald-500/10">6. القسم/التصنيف</th>
                    <th className="p-1.5 border border-emerald-500/10">7. الوحدة الكبرى</th>
                    <th className="p-1.5 border border-emerald-500/10">8. الوحدة الصغرى</th>
                    <th className="p-1.5 border border-emerald-500/10">9. معامل التحويل</th>
                    <th className="p-1.5 border border-emerald-500/10">10. سعر بيع الصغرى</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-300">
                  <tr>
                    <td className="p-1.5 border border-emerald-500/10">6251234567</td>
                    <td className="p-1.5 border border-emerald-500/10 font-sans">زيت زيتون بكر ممتاز 1 لتر</td>
                    <td className="p-1.5 border border-emerald-500/10 font-bold">150</td>
                    <td className="p-1.5 border border-emerald-500/10">25.00</td>
                    <td className="p-1.5 border border-emerald-500/10 text-emerald-600 font-bold">35.00</td>
                    <td className="p-1.5 border border-emerald-500/10 font-sans">غذائيات</td>
                    <td className="p-1.5 border border-emerald-500/10 font-sans">كرتونة</td>
                    <td className="p-1.5 border border-emerald-500/10 font-sans">عبوة</td>
                    <td className="p-1.5 border border-emerald-500/10">12</td>
                    <td className="p-1.5 border border-emerald-500/10">3.50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-bold flex items-center gap-1">
              ⭐ نصيحة: حدد الأعمدة في ملف الإكسل (Excel) الخاص بك، وانسخها (Ctrl+C)، ثم الصقها مباشرة (Ctrl+V) في حقل النسخ المباشر أدناه! النظام سيتعرف عليها تلقائياً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: Paste directly */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                📝 الصق البيانات المنسوخة من إكسل هنا:
              </label>
              <textarea
                id="excel_paste_area"
                placeholder="ضع مؤشر الفأرة هنا والصق الجدول المنسوخ من ملف إكسل..."
                className="w-full h-48 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('excel_paste_area') as HTMLTextAreaElement;
                  if (!el || !el.value.trim()) {
                    toast('يرجى لصق بيانات صالحة أولاً.', 'warning');
                    return;
                  }
                  handleImportProcess(el.value);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> معالجة واستيراد البيانات الملصوقة
              </button>
            </div>

            {/* Option B: Upload file */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                  📂 أو قم برفع ملف CSV مجهز:
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition relative">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const text = evt.target?.result as string;
                        handleImportProcess(text);
                      };
                      reader.readAsText(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">اسحب وأفلت ملف الـ CSV هنا أو اضغط للتصفح</p>
                  <p className="text-[10px] text-slate-400 mt-1">امتداد الملف المعتمد: .csv (مفصول بفاصلة أو فاصلة منقوطة)</p>
                </div>
              </div>

              <div className="bg-slate-500/5 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-white/5">
                <span className="font-bold text-slate-700 dark:text-slate-300">ملاحظات هامة:</span>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>إذا كان الباركود مسجلاً مسبقاً في النظام، فسيتم تحديث أسعاره ودمج كمية رصيد أول المدة مع الرصيد الحالي.</li>
                  <li>سيتم إدخال كميات رصيد أول المدة تلقائياً في الفرع الرئيسي للمستودعات.</li>
                  <li>يرجى التأكد من أن أسعار الشراء والبيع والكميات هي أرقام صالحة وموجبة.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: PHYSICAL INVENTORY COUNT & STOCK ADJUSTMENT */}
      {activeTab === 'adjust' && (
        <div className="rounded-2xl glass-panel-card p-5 border border-white/25 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-md text-slate-900 dark:text-white flex items-center gap-1.5">
                <ClipboardList className="text-amber-500" size={20} /> جرد وتعديل مخزون المستودعات الفعلي
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                قارن بين رصيد المخزن الدفتري في النظام والجرد الفعلي على أرض الواقع، وقم بإجراء تسويات عجز أو زيادة المخزون بضغطة واحدة.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const prefilled: Record<string, string> = {};
                  items.forEach(item => {
                    const qty = getBranchStockQty(item.id, adjustBranchId);
                    prefilled[item.id] = qty.toString();
                  });
                  setPhysicalCounts(prefilled);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className="text-slate-500" /> تعبئة الكل بالرصيد الدفتري
              </button>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من مسح جميع القيم المدخلة في الجرد؟')) {
                    setPhysicalCounts({});
                    setAdjustNotes({});
                  }
                }}
                className="bg-rose-550 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash size={13} /> مسح المدخلات
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-500/5 p-4 rounded-2xl border border-white/5">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">حدد الفرع / المستودع للجرد:</label>
              <select
                value={adjustBranchId}
                onChange={(e) => {
                  setAdjustBranchId(e.target.value);
                  setPhysicalCounts({}); // Reset physical counts to avoid cross-branch confusion
                }}
                className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">ابحث عن صنف بالاسم أو الباركود لتسجيل الجرد:</label>
              <div className="relative">
                <input
                  type="text"
                  value={adjustSearchTerm}
                  onChange={(e) => setAdjustSearchTerm(e.target.value)}
                  placeholder="اكتب الباركود أو اسم الصنف للبحث السريع وتعبئة الجرد..."
                  className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                />
                <Package size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Counting Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-500/5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3.5 font-bold">الباركود</th>
                  <th className="p-3.5 font-bold">اسم الصنف والتصنيف</th>
                  <th className="p-3.5 font-bold text-center">الكمية الدفترية (الحالية)</th>
                  <th className="p-3.5 font-bold text-center w-40">الكمية الفعلية بالجرد</th>
                  <th className="p-3.5 font-bold text-center">الفارق المخزني</th>
                  <th className="p-3.5 font-bold">سبب التعديل / ملاحظات العجز والتلف</th>
                  <th className="p-3.5 font-bold text-center">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-800 dark:text-slate-200">
                {items
                  .filter(item => {
                    const term = adjustSearchTerm.toLowerCase();
                    return item.name.toLowerCase().includes(term) || (item.barcode && item.barcode.includes(term)) || (item.category && item.category.toLowerCase().includes(term));
                  })
                  .map(item => {
                    const bookQty = getBranchStockQty(item.id, adjustBranchId);
                    const physicalVal = physicalCounts[item.id] !== undefined ? physicalCounts[item.id] : '';
                    const actualQty = physicalVal !== '' ? parseFloat(physicalVal) : bookQty;
                    const diff = actualQty - bookQty;

                    return (
                      <tr key={item.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="p-3.5 font-mono text-slate-500 text-xs">{item.barcode || '—'}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                          {item.category && <div className="text-[10px] text-slate-400 mt-0.5">{item.category}</div>}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white text-sm">
                          {bookQty} <span className="text-[10px] text-slate-500 font-normal">{item.mainUnit}</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = Math.max(0, actualQty - 1);
                                setPhysicalCounts({ ...physicalCounts, [item.id]: newVal.toString() });
                              }}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="any"
                              value={physicalVal}
                              placeholder={bookQty.toString()}
                              onChange={(e) => {
                                setPhysicalCounts({ ...physicalCounts, [item.id]: e.target.value });
                              }}
                              className="w-16 p-1 rounded border border-slate-200 dark:border-slate-800 text-center font-bold text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newVal = actualQty + 1;
                                setPhysicalCounts({ ...physicalCounts, [item.id]: newVal.toString() });
                              }}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          {diff === 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              مطابق
                            </span>
                          ) : diff > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                              +{diff.toFixed(2)} زيادة
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                              {diff.toFixed(2)} عجز
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            value={adjustNotes[item.id] || ''}
                            onChange={(e) => {
                              setAdjustNotes({ ...adjustNotes, [item.id]: e.target.value });
                            }}
                            placeholder="مثال: تلف، عجز جرد، كسر..."
                            className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 focus:outline-none"
                          />
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            disabled={diff === 0}
                            onClick={() => {
                              if (!onAdjustStock) return;
                              onAdjustStock(item.id, adjustBranchId, actualQty, adjustNotes[item.id] || 'تسوية جرد يدوي منفرد');
                              toast(`تم تعديل وتسوية صنف "${item.name}" بنجاح! 👍`, 'success');
                              const pc = { ...physicalCounts };
                              delete pc[item.id];
                              setPhysicalCounts(pc);
                              const an = { ...adjustNotes };
                              delete an[item.id];
                              setAdjustNotes(an);
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 mx-auto ${diff === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'}`}
                          >
                            <Save size={10} /> حفظ البند
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Form Submit Footer */}
          <div className="bg-slate-500/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-white">إحصائيات التسوية الحالية: </span>
              الأصناف المعدلة ستدرج تلقائياً في دفتر حركات المخزون كـ "تسوية يدوية" مع احتساب فرق الأرباح/الخسائر الناتجة عن التلف والعجز.
            </div>
            <button
              onClick={handleApplyAdjustments}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={15} /> اعتماد وحفظ جميع تسويات الجرد المحددة
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================= MODAL DIALOGS ========================= */}
      {/* ========================================================= */}

      {/* 1. Add / Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 relative my-8 text-right" dir="rtl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pl-8">
              <Package size={22} className="text-emerald-500" />
              <span>{selectedEditItemId ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزن'}</span>
            </h3>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الصنف التجاري</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="مثال: أرز الياسمين 5 كيلو"
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الباركود (رمز الاستجابة)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="امسح أو اكتب الرمز"
                    className="w-full p-2.5 rounded-xl glass-input text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">التصنيف / القسم</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: مواد غذائية"
                    className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Unit Configuration */}
              <div className="bg-slate-500/5 rounded-xl p-4 border border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوحدة الأساسية الكبرى</label>
                    <input
                      type="text"
                      value={mainUnit}
                      onChange={(e) => setMainUnit(e.target.value)}
                      placeholder="كرتونة، شوال، صندوق"
                      className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="hasSubUnit"
                      checked={hasSubUnit}
                      onChange={(e) => setHasSubUnit(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="hasSubUnit" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">يحتوي وحدة صغيرة مجزأة</label>
                  </div>
                </div>

                {hasSubUnit && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الوحدة الصغيرة</label>
                      <input
                        type="text"
                        value={subUnitName}
                        onChange={(e) => setSubUnitName(e.target.value)}
                        placeholder="حبة، علبة، كيلو"
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required={hasSubUnit}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">معدل التعبئة (التحويل)</label>
                      <input
                        type="number"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(Math.max(1, +e.target.value))}
                        className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required={hasSubUnit}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost and Pricing */}
              <div className="grid grid-cols-2 gap-4 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سعر شراء الكبرى</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Math.max(0, +e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سعر بيع الكبرى</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Math.max(0, +e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {hasSubUnit && (
                  <div className="col-span-2 space-y-1.5 border-t border-emerald-500/10 pt-2">
                    <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سعر بيع الوحدة الصغيرة (المقترح: {(salePrice / (conversionRate || 1)).toFixed(2)})</label>
                    <input
                      type="number"
                      value={subUnitSalePrice}
                      onChange={(e) => setSubUnitSalePrice(Math.max(0, +e.target.value))}
                      className="w-full p-2.5 rounded-xl glass-input text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Alert limits */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حد الطلب (تنبيه قرب نفاد الصنف في المستودع)</label>
                <input
                  type="number"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Math.max(0, +e.target.value))}
                  className="w-full p-2.5 rounded-xl glass-input text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-sm shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Save size={16} /> <span>{selectedEditItemId ? 'حفظ التحديثات' : 'إضافة الصنف الجديد'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold px-6 py-3 rounded-xl text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 relative text-right" dir="rtl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pl-8">
              <MapPin size={22} className="text-emerald-500" />
              <span>{selectedEditBranchId ? 'تعديل بيانات المستودع / الفرع' : 'إضافة مستودع أو فرع جديد'}</span>
            </h3>

            <form onSubmit={handleAddBranchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الفرع / المستودع التجاري</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="مثال: معرض الرمال، مخازن الوسطى"
                  className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الموقع الجغرافي أو الوصف</label>
                <input
                  type="text"
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  placeholder="مثال: غزة، شارع الوحدة، مقابل بنك فلسطين"
                  className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-sm shadow transition-all cursor-pointer"
                >
                  {selectedEditBranchId ? 'حفظ التحديثات' : 'إضافة المستودع'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold px-6 py-3 rounded-xl text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Stock Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 relative text-right" dir="rtl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pl-8">
              <ArrowRightLeft size={22} className="text-emerald-500" />
              <span>إجراء تحويل بضائع جديد بين الفروع</span>
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">مستودع المصدر (من)</label>
                  <select
                    value={fromBranch}
                    onChange={(e) => setFromBranch(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                    required
                  >
                    <option value="">-- اختر --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">مستودع الوجهة (إلى)</label>
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranch(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white font-medium"
                    required
                  >
                    <option value="">-- اختر --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اختر الصنف المراد نقله</label>
                <select
                  value={transferItemId}
                  onChange={(e) => setTransferItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-medium"
                  required
                >
                  <option value="">-- ابحث واختر الصنف --</option>
                  {items.map(item => {
                    const sourceStock = fromBranch ? getBranchStockQty(item.id, fromBranch) : 0;
                    return (
                      <option key={item.id} value={item.id} disabled={sourceStock <= 0}>
                        {item.name} {fromBranch ? `(المتوفر بالمصدر: ${sourceStock} ${item.mainUnit})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الكمية المراد تحويلها (بالوحدة الكبرى)</label>
                <input
                  type="number"
                  step="any"
                  value={transferQty || ''}
                  onChange={(e) => setTransferQty(+e.target.value)}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl glass-input text-sm font-bold font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات التحويل</label>
                <textarea
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="مثال: نقل لتلبية طلب مستعجل للعملاء..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-sm shadow transition"
                >
                  تسجيل وتحويل الكمية
                </button>
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold px-6 py-3 rounded-xl text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
