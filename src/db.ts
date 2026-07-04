/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Group, Item, Branch, BranchStock, CustomerSupplier, Sale, Purchase, SalesReturn, Quotation, BranchTransfer, ItemMovement, AuditLogEntry, Currency } from './types';

export interface GroupData {
  items: Item[];
  branches: Branch[];
  branchStock: BranchStock[];
  contacts: CustomerSupplier[];
  sales: Sale[];
  purchases: Purchase[];
  returns: SalesReturn[];
  quotations: Quotation[];
  transfers: BranchTransfer[];
  movements: ItemMovement[];
  auditLogs?: AuditLogEntry[];
  currencies?: Currency[];
  selectedCurrencyId?: string;
}

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'group_foods',
    name: 'مجموعة غزة للمواد الغذائية',
    settings: {
      name: 'محلات غزة للمواد الغذائية',
      address: 'غزة، شارع عمر المختار، مقابل ساحة السرايا',
      phone: '059-9123456',
      logoText: 'غزة كاش مسبق',
      logoColor: 'emerald'
    }
  },
  {
    id: 'group_electrical',
    name: 'شركة الشمال للأجهزة الكهربائية والتكنولوجيا',
    settings: {
      name: 'شركة الشمال للكهرباء والإنارة',
      address: 'جباليا، الشارع العام، قرب الدوار الرئيسي',
      phone: '059-8765432',
      logoText: 'الشمال تيك',
      logoColor: 'blue'
    }
  }
];

// Helper to generate initial dummy data for Foods Group
const getInitialFoodsData = (): GroupData => {
  const items: Item[] = [
    {
      id: 'item_1',
      barcode: '6251001011',
      name: 'أرز الياسمين فاخر 5 كجم',
      category: 'أرز وحبوب',
      mainUnit: 'شوال',
      hasSubUnit: true,
      subUnitName: 'كيلو',
      conversionRate: 5,
      purchasePrice: 150, // per bag (شوال)
      salePrice: 180,     // per bag
      subUnitSalePrice: 40, // per kg
      minStockAlert: 10
    },
    {
      id: 'item_2',
      barcode: '6251001022',
      name: 'زيت طهي نباتي ممتاز 3 لتر',
      category: 'زيوت ودهون',
      mainUnit: 'كرتونة',
      hasSubUnit: true,
      subUnitName: 'عبوة',
      conversionRate: 4,  // 4 bottles in a box
      purchasePrice: 100, // per box
      salePrice: 120,     // per box
      subUnitSalePrice: 32, // per bottle
      minStockAlert: 15
    },
    {
      id: 'item_3',
      barcode: '6251001033',
      name: 'طحين القمح البلدي 25 كجم',
      category: 'أرز وحبوب',
      mainUnit: 'شوال',
      hasSubUnit: true,
      subUnitName: 'كيلو',
      conversionRate: 25,
      purchasePrice: 60,
      salePrice: 75,
      subUnitSalePrice: 3.5,
      minStockAlert: 5
    },
    {
      id: 'item_4',
      barcode: '6251001044',
      name: 'علبة تونة بالزيت 185 جرام',
      category: 'معلبات',
      mainUnit: 'كرتونة',
      hasSubUnit: true,
      subUnitName: 'علبة',
      conversionRate: 48, // 48 cans in a box
      purchasePrice: 140,
      salePrice: 168,
      subUnitSalePrice: 4,
      minStockAlert: 8
    },
    {
      id: 'item_5',
      barcode: '6251001055',
      name: 'سكر أبيض ناعم 10 كجم',
      category: 'أرز وحبوب',
      mainUnit: 'شوال',
      hasSubUnit: true,
      subUnitName: 'كيلو',
      conversionRate: 10,
      purchasePrice: 40,
      salePrice: 50,
      subUnitSalePrice: 5.5,
      minStockAlert: 12
    }
  ];

  const branches: Branch[] = [
    { id: 'branch_main', name: 'الفرع الرئيسي - المعرض', location: 'غزة، الرمال' },
    { id: 'branch_store', name: 'مستودع جباليا المركزي', location: 'جباليا، حي السلام' }
  ];

  const branchStock: BranchStock[] = [
    { itemId: 'item_1', branchId: 'branch_main', quantity: 25 }, // 25 boxes/bags
    { itemId: 'item_1', branchId: 'branch_store', quantity: 50 },
    { itemId: 'item_2', branchId: 'branch_main', quantity: 8 },  // low stock alert (8 < 15)
    { itemId: 'item_2', branchId: 'branch_store', quantity: 12 },
    { itemId: 'item_3', branchId: 'branch_main', quantity: 4 },  // low stock alert (4 < 5)
    { itemId: 'item_3', branchId: 'branch_store', quantity: 15 },
    { itemId: 'item_4', branchId: 'branch_main', quantity: 12 },
    { itemId: 'item_4', branchId: 'branch_store', quantity: 30 },
    { itemId: 'item_5', branchId: 'branch_main', quantity: 3 },  // low stock alert
    { itemId: 'item_5', branchId: 'branch_store', quantity: 20 }
  ];

  const contacts: CustomerSupplier[] = [
    {
      id: 'cust_1',
      name: 'سوبرماركت الأمل النموذجي',
      type: 'customer',
      phone: '059-1112223',
      address: 'غزة، النصر',
      initialBalance: 0,
      currentBalance: -450 // Customer owes 450 NIS (debit)
    },
    {
      id: 'cust_2',
      name: 'شركة القدس للتوزيع والمبيعات',
      type: 'both',
      phone: '059-3334445',
      address: 'غزة، الرمال الجنوبي',
      initialBalance: 0,
      currentBalance: 120 // We owe them 120 NIS (credit)
    },
    {
      id: 'supp_1',
      name: 'شركة السلام لاستيراد المواد الغذائية',
      type: 'supplier',
      phone: '059-5556667',
      address: 'المنطقة الصناعية، غزة',
      initialBalance: 0,
      currentBalance: -2300 // We owe supplier 2300 NIS
    },
    {
      id: 'supp_2',
      name: 'مصانع غزة للزيوت والمسابك',
      type: 'supplier',
      phone: '059-7778889',
      address: 'غزة، الشجاعية',
      initialBalance: 0,
      currentBalance: 0
    }
  ];

  // Past transactions for reports
  const sales: Sale[] = [
    {
      id: 'sale_1',
      invoiceNo: 'INV-2026-0001',
      date: '2026-07-02T10:15:00',
      customerId: 'cust_1',
      customerName: 'سوبرماركت الأمل النموذجي',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      items: [
        { itemId: 'item_1', itemName: 'أرز الياسمين فاخر 5 كجم', isSubUnitUsed: false, quantity: 2, unitName: 'شوال', price: 180, total: 360 },
        { itemId: 'item_2', itemName: 'زيت طهي نباتي ممتاز 3 لتر', isSubUnitUsed: true, quantity: 3, unitName: 'عبوة', price: 32, total: 96 }
      ],
      subTotal: 456,
      discount: 6,
      total: 450,
      paidAmount: 0, // آجل كامل
      paymentType: 'credit',
      notes: 'تسليم يدوي معتمد الفاتورة'
    },
    {
      id: 'sale_2',
      invoiceNo: 'INV-2026-0002',
      date: '2026-07-03T14:30:00',
      customerId: 'cust_2',
      customerName: 'شركة القدس للتوزيع والمبيعات',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      items: [
        { itemId: 'item_4', itemName: 'علبة تونة بالزيت 185 جرام', isSubUnitUsed: false, quantity: 1, unitName: 'كرتونة', price: 168, total: 168 }
      ],
      subTotal: 168,
      discount: 0,
      total: 168,
      paidAmount: 168, // نقدي كامل
      paymentType: 'cash',
      notes: 'بيع نقدي مباشر'
    }
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur_1',
      invoiceNo: 'PUR-2026-0001',
      date: '2026-07-01T09:00:00',
      supplierId: 'supp_1',
      supplierName: 'شركة السلام لاستيراد المواد الغذائية',
      branchId: 'branch_store',
      branchName: 'مستودع جباليا المركزي',
      items: [
        { itemId: 'item_1', itemName: 'أرز الياسمين فاخر 5 كجم', isSubUnitUsed: false, quantity: 10, unitName: 'شوال', price: 150, total: 1500 },
        { itemId: 'item_2', itemName: 'زيت طهي نباتي ممتاز 3 لتر', isSubUnitUsed: false, quantity: 10, unitName: 'كرتونة', price: 100, total: 1000 }
      ],
      subTotal: 2500,
      discount: 200,
      total: 2300,
      paidAmount: 0, // آجل كامل
      paymentType: 'credit',
      notes: 'توريد مخازن جباليا'
    }
  ];

  const returns: SalesReturn[] = [
    {
      id: 'ret_1',
      returnNo: 'RET-2026-0001',
      date: '2026-07-03T11:00:00',
      originalInvoiceNo: 'INV-2026-0001',
      customerId: 'cust_1',
      customerName: 'سوبرماركت الأمل النموذجي',
      branchId: 'branch_main',
      items: [
        { itemId: 'item_2', itemName: 'زيت طهي نباتي ممتاز 3 لتر', isSubUnitUsed: true, quantity: 1, unitName: 'عبوة', price: 32, total: 32 }
      ],
      total: 32,
      notes: 'عبوة مرتجعة لوجود عيب تعبئة'
    }
  ];

  const quotations: Quotation[] = [
    {
      id: 'quot_1',
      quotationNo: 'QUO-2026-0001',
      date: '2026-07-04T10:00:00',
      validUntil: '2026-07-15',
      customerId: 'cust_1',
      customerName: 'سوبرماركت الأمل النموذجي',
      items: [
        { itemId: 'item_1', itemName: 'أرز الياسمين فاخر 5 كجم', isSubUnitUsed: false, quantity: 15, unitName: 'شوال', price: 175, total: 2625 },
        { itemId: 'item_3', itemName: 'طحين القمح البلدي 25 كجم', isSubUnitUsed: false, quantity: 10, unitName: 'شوال', price: 72, total: 720 }
      ],
      subTotal: 3345,
      discount: 45,
      total: 3300,
      notes: 'عرض أسعار خاص لفترة محدودة'
    }
  ];

  const transfers: BranchTransfer[] = [
    {
      id: 'trsf_1',
      transferNo: 'TRSF-2026-0001',
      date: '2026-07-02T16:00:00',
      fromBranchId: 'branch_store',
      fromBranchName: 'مستودع جباليا المركزي',
      toBranchId: 'branch_main',
      toBranchName: 'الفرع الرئيسي - المعرض',
      items: [
        { itemId: 'item_1', itemName: 'أرز الياسمين فاخر 5 كجم', quantity: 5, unitName: 'شوال' }
      ],
      notes: 'تغذية صالة العرض الرئيسية بنقص الصنف'
    }
  ];

  const movements: ItemMovement[] = [
    {
      id: 'mov_1',
      itemId: 'item_1',
      itemName: 'أرز الياسمين فاخر 5 كجم',
      date: '2026-07-01T09:00:00',
      type: 'purchase',
      referenceNo: 'PUR-2026-0001',
      branchId: 'branch_store',
      branchName: 'مستودع جباليا المركزي',
      quantityChange: 10,
      unitName: 'شوال',
      description: 'شراء فاتورة رقم PUR-2026-0001'
    },
    {
      id: 'mov_2',
      itemId: 'item_1',
      itemName: 'أرز الياسمين فاخر 5 كجم',
      date: '2026-07-02T10:15:00',
      type: 'sale',
      referenceNo: 'INV-2026-0001',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      quantityChange: -2,
      unitName: 'شوال',
      description: 'بيع فاتورة رقم INV-2026-0001'
    },
    {
      id: 'mov_3',
      itemId: 'item_1',
      itemName: 'أرز الياسمين فاخر 5 كجم',
      date: '2026-07-02T16:00:00',
      type: 'transfer_out',
      referenceNo: 'TRSF-2026-0001',
      branchId: 'branch_store',
      branchName: 'مستودع جباليا المركزي',
      quantityChange: -5,
      unitName: 'شوال',
      description: 'تحويل إلى الفرع الرئيسي - المعرض'
    },
    {
      id: 'mov_4',
      itemId: 'item_1',
      itemName: 'أرز الياسمين فاخر 5 كجم',
      date: '2026-07-02T16:00:00',
      type: 'transfer_in',
      referenceNo: 'TRSF-2026-0001',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      quantityChange: 5,
      unitName: 'شوال',
      description: 'تحويل وارد من مستودع جباليا'
    },
    {
      id: 'mov_5',
      itemId: 'item_2',
      itemName: 'زيت طهي نباتي ممتاز 3 لتر',
      date: '2026-07-02T10:15:00',
      type: 'sale',
      referenceNo: 'INV-2026-0001',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      quantityChange: -0.75, // 3 bottles = 3/4 box = 0.75
      unitName: 'عبوة',
      description: 'بيع 3 عبوات فاتورة INV-2026-0001'
    },
    {
      id: 'mov_6',
      itemId: 'item_2',
      itemName: 'زيت طهي نباتي ممتاز 3 لتر',
      date: '2026-07-03T11:00:00',
      type: 'return_in',
      referenceNo: 'RET-2026-0001',
      branchId: 'branch_main',
      branchName: 'الفرع الرئيسي - المعرض',
      quantityChange: 0.25, // 1 bottle returned
      unitName: 'عبوة',
      description: 'مرتجع مبيعات عبوة واحدة'
    }
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'log_foods_1',
      timestamp: '2026-07-01T09:05:00.000Z',
      action: 'فاتورة مشتريات',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'اعتماد فاتورة مشتريات رقم PUR-2026-0001 بقيمة 2300.00 شيكل من "شركة السلام لاستيراد المواد الغذائية"',
      severity: 'info'
    },
    {
      id: 'log_foods_2',
      timestamp: '2026-07-02T10:20:00.000Z',
      action: 'فاتورة مبيعات',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'إصدار فاتورة مبيعات رقم INV-2026-0001 بقيمة 450.00 شيكل للعميل "سوبرماركت الأمل النموذجي"',
      severity: 'info'
    },
    {
      id: 'log_foods_3',
      timestamp: '2026-07-03T11:05:00.000Z',
      action: 'مرتجع مبيعات',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'تسجيل مرتجع مبيعات رقم RET-2026-0001 بقيمة 32.00 شيكل للفاتورة الأصلية INV-2026-0001',
      severity: 'warning'
    },
    {
      id: 'log_foods_4',
      timestamp: '2026-07-03T15:10:00.000Z',
      action: 'تعديل مخزون يدوي',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'تعديل رصيد صنف "أرز الياسمين فاخر 5 كجم" يدوياً في مستودع جباليا المركزي من 45 إلى 50 قطعة',
      severity: 'warning'
    }
  ];

  return { items, branches, branchStock, contacts, sales, purchases, returns, quotations, transfers, movements, auditLogs };
};

// Initial dummy data for Electrical Group
const getInitialElectricalData = (): GroupData => {
  const items: Item[] = [
    {
      id: 'item_e1',
      barcode: '7251002011',
      name: 'مروحة عمودية شحن 16 بوصة مع بطارية سفاري',
      category: 'مراوح وتبريد',
      mainUnit: 'حبة',
      hasSubUnit: false,
      purchasePrice: 90,
      salePrice: 120,
      minStockAlert: 5
    },
    {
      id: 'item_e2',
      barcode: '7251002022',
      name: 'شاحن بطاريات ذكي 20 أمبير كوشان',
      category: 'طاقة بديلة',
      mainUnit: 'حبة',
      hasSubUnit: false,
      purchasePrice: 32,
      salePrice: 45,
      minStockAlert: 8
    },
    {
      id: 'item_e3',
      barcode: '7251002033',
      name: 'مصباح إنارة ليد توفير ذكي 12 وات',
      category: 'إنارة ولمبات',
      mainUnit: 'كرتونة',
      hasSubUnit: true,
      subUnitName: 'حبة',
      conversionRate: 10, // 10 bulbs in box
      purchasePrice: 12,
      salePrice: 15,
      subUnitSalePrice: 1.8,
      minStockAlert: 10
    },
    {
      id: 'item_e4',
      barcode: '7251002044',
      name: 'بطارية ليثيوم 100 أمبير 12 فولت عميقة التفريغ',
      category: 'طاقة بديلة',
      mainUnit: 'حبة',
      hasSubUnit: false,
      purchasePrice: 280,
      salePrice: 350,
      minStockAlert: 3
    }
  ];

  const branches: Branch[] = [
    { id: 'branch_e_main', name: 'معرض غزة الرئيسي للكهربائيات', location: 'غزة، الجلاء' },
    { id: 'branch_e_sub', name: 'فرع رفح التجاري', location: 'رفح، البلد' }
  ];

  const branchStock: BranchStock[] = [
    { itemId: 'item_e1', branchId: 'branch_e_main', quantity: 15 },
    { itemId: 'item_e1', branchId: 'branch_e_sub', quantity: 4 }, // alert (4 < 5)
    { itemId: 'item_e2', branchId: 'branch_e_main', quantity: 12 },
    { itemId: 'item_e2', branchId: 'branch_e_sub', quantity: 15 },
    { itemId: 'item_e3', branchId: 'branch_e_main', quantity: 8 }, // alert (8 < 10)
    { itemId: 'item_e3', branchId: 'branch_e_sub', quantity: 20 },
    { itemId: 'item_e4', branchId: 'branch_e_main', quantity: 2 }, // alert (2 < 3)
    { itemId: 'item_e4', branchId: 'branch_e_sub', quantity: 5 }
  ];

  const contacts: CustomerSupplier[] = [
    {
      id: 'cust_e1',
      name: 'القدس للأجهزة الكهربائية',
      type: 'customer',
      phone: '059-9988776',
      address: 'خان يونس، جلال',
      initialBalance: 0,
      currentBalance: -1500 // owes 1500 USD
    },
    {
      id: 'supp_e1',
      name: 'الشركة المتكاملة للاستيراد والتصدير',
      type: 'supplier',
      phone: '059-4455663',
      address: 'المعبر الصناعي، رفح',
      initialBalance: 0,
      currentBalance: -5000 // We owe them 5000 USD
    }
  ];

  const sales: Sale[] = [
    {
      id: 'sale_e1',
      invoiceNo: 'INV-ELE-0001',
      date: '2026-07-03T11:30:00',
      customerId: 'cust_e1',
      customerName: 'القدس للأجهزة الكهربائية',
      branchId: 'branch_e_main',
      branchName: 'معرض غزة الرئيسي للكهربائيات',
      items: [
        { itemId: 'item_e1', itemName: 'مروحة عمودية شحن 16 بوصة مع بطارية سفاري', isSubUnitUsed: false, quantity: 10, unitName: 'حبة', price: 120, total: 1200 },
        { itemId: 'item_e3', itemName: 'مصباح إنارة ليد توفير ذكي 12 وات', isSubUnitUsed: false, quantity: 20, unitName: 'كرتونة', price: 15, total: 300 }
      ],
      subTotal: 1500,
      discount: 0,
      total: 1500,
      paidAmount: 0,
      paymentType: 'credit',
      notes: 'توصيل عبر نقليات السلام'
    }
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur_e1',
      invoiceNo: 'PUR-ELE-0001',
      date: '2026-07-02T10:00:00',
      supplierId: 'supp_e1',
      supplierName: 'الشركة المتكاملة للاستيراد والتصدير',
      branchId: 'branch_e_main',
      branchName: 'معرض غزة الرئيسي للكهربائيات',
      items: [
        { itemId: 'item_e4', itemName: 'بطارية ليثيوم 100 أمبير 12 فولت عميقة التفريغ', isSubUnitUsed: false, quantity: 20, unitName: 'حبة', price: 280, total: 5600 }
      ],
      subTotal: 5600,
      discount: 600,
      total: 5000,
      paidAmount: 0,
      paymentType: 'credit',
      notes: 'شحنة بطاريات مستوردة'
    }
  ];

  const returns: SalesReturn[] = [];
  const quotations: Quotation[] = [];
  const transfers: BranchTransfer[] = [];
  const movements: ItemMovement[] = [
    {
      id: 'mov_e1',
      itemId: 'item_e4',
      itemName: 'بطارية ليثيوم 100 أمبير 12 فولت عميقة التفريغ',
      date: '2026-07-02T10:00:00',
      type: 'purchase',
      referenceNo: 'PUR-ELE-0001',
      branchId: 'branch_e_main',
      branchName: 'معرض غزة الرئيسي للكهربائيات',
      quantityChange: 20,
      unitName: 'حبة',
      description: 'شراء فاتورة رقم PUR-ELE-0001'
    },
    {
      id: 'mov_e2',
      itemId: 'item_e1',
      itemName: 'مروحة عمودية شحن 16 بوصة مع بطارية سفاري',
      date: '2026-07-03T11:30:00',
      type: 'sale',
      referenceNo: 'INV-ELE-0001',
      branchId: 'branch_e_main',
      branchName: 'معرض غزة الرئيسي للكهربائيات',
      quantityChange: -10,
      unitName: 'حبة',
      description: 'بيع فاتورة رقم INV-ELE-0001'
    }
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'log_ele_1',
      timestamp: '2026-07-02T10:05:00.000Z',
      action: 'فاتورة مشتريات',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'اعتماد فاتورة مشتريات رقم PUR-ELE-0001 بقيمة 5000.00 شيكل من "الشركة المتكاملة للاستيراد والتصدير"',
      severity: 'info'
    },
    {
      id: 'log_ele_2',
      timestamp: '2026-07-03T11:35:00.000Z',
      action: 'فاتورة مبيعات',
      operator: 'أحمد المحترف (مدير النظام)',
      details: 'إصدار فاتورة مبيعات رقم INV-ELE-0001 بقيمة 1500.00 شيكل للعميل "القدس للأجهزة الكهربائية"',
      severity: 'info'
    }
  ];

  return { items, branches, branchStock, contacts, sales, purchases, returns, quotations, transfers, movements, auditLogs };
};

// DB API functions with LocalStorage caching
export const getGroups = (): Group[] => {
  const cached = localStorage.getItem('gaza_cash_groups');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem('gaza_cash_groups', JSON.stringify(DEFAULT_GROUPS));
  return DEFAULT_GROUPS;
};

export const saveGroups = (groups: Group[]) => {
  localStorage.setItem('gaza_cash_groups', JSON.stringify(groups));
};

export const getActiveGroupId = (): string => {
  const cached = localStorage.getItem('gaza_cash_active_group_id');
  if (cached) return cached;
  const groups = getGroups();
  const defaultId = groups[0]?.id || 'group_foods';
  localStorage.setItem('gaza_cash_active_group_id', defaultId);
  return defaultId;
};

export const setActiveGroupId = (groupId: string) => {
  localStorage.setItem('gaza_cash_active_group_id', groupId);
};

export const getGroupData = (groupId: string): GroupData => {
  const DEFAULT_CURRENCIES: Currency[] = [
    { id: 'ILS', name: 'شيكل', symbol: '₪', exchangeRate: 1, isBase: true },
    { id: 'USD', name: 'دولار أمريكي', symbol: '$', exchangeRate: 3.7, isBase: false },
    { id: 'JOD', name: 'دينار أردني', symbol: 'د.أ', exchangeRate: 5.2, isBase: false },
  ];

  const cached = localStorage.getItem(`gaza_cash_data_${groupId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as GroupData;
      if (!parsed.currencies || parsed.currencies.length === 0) {
        parsed.currencies = DEFAULT_CURRENCIES;
      }
      if (!parsed.selectedCurrencyId) {
        parsed.selectedCurrencyId = parsed.currencies.find(c => c.isBase)?.id || 'ILS';
      }
      return parsed;
    } catch (e) {
      // fallback
    }
  }
  
  // Default data depending on group
  let defaultData: GroupData;
  if (groupId === 'group_foods') {
    defaultData = getInitialFoodsData();
  } else if (groupId === 'group_electrical') {
    defaultData = getInitialElectricalData();
  } else {
    // Empty data structure for new custom groups
    defaultData = {
      items: [],
      branches: [{ id: `branch_${groupId}_1`, name: 'المستودع الرئيسي', location: 'الموقع الافتراضي' }],
      branchStock: [],
      contacts: [],
      sales: [],
      purchases: [],
      returns: [],
      quotations: [],
      transfers: [],
      movements: [],
      auditLogs: []
    };
  }
  
  if (!defaultData.currencies || defaultData.currencies.length === 0) {
    defaultData.currencies = DEFAULT_CURRENCIES;
  }
  if (!defaultData.selectedCurrencyId) {
    defaultData.selectedCurrencyId = defaultData.currencies.find(c => c.isBase)?.id || 'ILS';
  }

  localStorage.setItem(`gaza_cash_data_${groupId}`, JSON.stringify(defaultData));
  return defaultData;
};

export const saveGroupData = (groupId: string, data: GroupData) => {
  localStorage.setItem(`gaza_cash_data_${groupId}`, JSON.stringify(data));
};

export const getTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem('gaza_cash_theme');
  return (theme as 'light' | 'dark') || 'dark';
};

export const setTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem('gaza_cash_theme', theme);
};

// Global backup / restore JSON structures
export interface BackupFileStructure {
  version: string;
  timestamp: string;
  groups: Group[];
  activeGroupId: string;
  theme: 'light' | 'dark';
  groupData: Record<string, GroupData>;
}

export const exportAllData = (): string => {
  const groups = getGroups();
  const activeGroupId = getActiveGroupId();
  const theme = getTheme();
  
  const groupData: Record<string, GroupData> = {};
  groups.forEach(g => {
    groupData[g.id] = getGroupData(g.id);
  });
  
  const backup: BackupFileStructure = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    groups,
    activeGroupId,
    theme,
    groupData
  };
  
  return JSON.stringify(backup, null, 2);
};

export const importAllData = (backupStr: string): boolean => {
  try {
    const backup: BackupFileStructure = JSON.parse(backupStr);
    if (!backup.groups || !Array.isArray(backup.groups)) {
      return false;
    }
    
    // Save groups
    localStorage.setItem('gaza_cash_groups', JSON.stringify(backup.groups));
    
    // Save active group ID
    if (backup.activeGroupId) {
      localStorage.setItem('gaza_cash_active_group_id', backup.activeGroupId);
    }
    
    // Save theme
    if (backup.theme) {
      localStorage.setItem('gaza_cash_theme', backup.theme);
    }
    
    // Save detailed data for each group
    if (backup.groupData) {
      Object.entries(backup.groupData).forEach(([gId, data]) => {
        localStorage.setItem(`gaza_cash_data_${gId}`, JSON.stringify(data));
      });
    }
    
    return true;
  } catch (e) {
    console.error('Failed to import backup', e);
    return false;
  }
};
