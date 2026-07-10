import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { reshapeArabic } from '../../utils/pdfArabicHelper';

// Register Cairo Font for Arabic support in PDF
Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v20/SLX_1OatgH96tV091b-6vSOf_bM.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/cairo/v20/SLX-1OatgH96tV090b_S_bA.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Cairo',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
    direction: 'rtl',
  },
  headerContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 15,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  shopSubtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  invoiceTitleContainer: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  metaGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 20,
  },
  metaColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '45%',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: 9,
  },
  metaValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  table: {
    marginTop: 10,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  cellNo: { width: '10%', textAlign: 'center' },
  cellItem: { width: '45%', textAlign: 'right' },
  cellQty: { width: '15%', textAlign: 'center' },
  cellPrice: { width: '15%', textAlign: 'center' },
  cellTotal: { width: '15%', textAlign: 'center' },
  
  tableCellText: {
    fontSize: 9,
    color: '#374151',
  },
  totalsSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
  },
  notesBox: {
    width: '50%',
    padding: 10,
    backgroundColor: '#fbfbfb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minHeight: 60,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: '#6b7280',
  },
  totalsBox: {
    width: '40%',
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    paddingVertical: 2,
  },
  totalRowFinal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#1e3a8a',
  },
  totalLabel: {
    fontSize: 9,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalLabelFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  }
});

interface InvoiceTemplateProps {
  invoice: any;
  type: 'sale' | 'purchase' | 'return_in' | 'return_out' | 'quotation';
  settings: {
    name: string;
    address: string;
    phone: string;
    logoText?: string;
  };
  currencySymbol?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  type,
  settings,
  currencySymbol = '₪'
}) => {
  const getTitle = () => {
    switch (type) {
      case 'sale':
        return 'فاتورة مبيعات رسمية';
      case 'purchase':
        return 'فاتورة مشتريات رسمية';
      case 'return_in':
        return 'مرتجع مبيعات';
      case 'return_out':
        return 'مرتجع مشتريات';
      case 'quotation':
        return 'عرض سعر معتمد';
      default:
        return 'مستند مالي';
    }
  };

  const getPartnerLabel = () => {
    return type === 'purchase' || type === 'return_out' ? 'المورد' : 'العميل';
  };

  const partnerName = invoice.customerName || invoice.supplierName || 'عميل عام';
  const paymentText = invoice.paymentType === 'cash' ? 'نقدي' : 'آجل';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRight}>
            <Text style={styles.shopName}>
              {reshapeArabic(settings.name || 'غزة كاش ERP')}
            </Text>
            <Text style={styles.shopSubtitle}>
              {reshapeArabic(settings.address || 'غزة، فلسطين')} | {settings.phone || ''}
            </Text>
          </View>
          <View style={styles.headerLeft}>
            <View style={styles.invoiceTitleContainer}>
              <Text style={styles.invoiceTitle}>
                {reshapeArabic(getTitle())}
              </Text>
            </View>
            <Text style={{ fontSize: 9, color: '#4b5563' }}>
              {reshapeArabic('رقم المستند:')} {invoice.invoiceNo || invoice.returnNo || invoice.quotationNo || invoice.id?.substring(0, 8)}
            </Text>
          </View>
        </View>

        {/* Metadata Details */}
        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{reshapeArabic(`${getPartnerLabel()}:`)}</Text>
              <Text style={styles.metaValue}>{reshapeArabic(partnerName)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{reshapeArabic('طريقة الدفع:')}</Text>
              <Text style={styles.metaValue}>{reshapeArabic(paymentText)}</Text>
            </View>
            {invoice.branchName ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{reshapeArabic('الفرع:')}</Text>
                <Text style={styles.metaValue}>{reshapeArabic(invoice.branchName)}</Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
          </View>

          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{reshapeArabic('تاريخ الإصدار:')}</Text>
              <Text style={styles.metaValue}>{invoice.date ? invoice.date.substring(0, 10) : ''}</Text>
            </View>
            {invoice.validUntil ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{reshapeArabic('صالح لغاية:')}</Text>
                <Text style={styles.metaValue}>{invoice.validUntil.substring(0, 10)}</Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{reshapeArabic('حالة السند:')}</Text>
              <Text style={[styles.metaValue, { color: '#16a34a' }]}>{reshapeArabic('معتمد ومسجل')}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.cellItem]}>{reshapeArabic('اسم الصنف / البيان')}</Text>
            <Text style={[styles.tableHeaderCell, styles.cellQty]}>{reshapeArabic('الكمية')}</Text>
            <Text style={[styles.tableHeaderCell, styles.cellPrice]}>{reshapeArabic('السعر')}</Text>
            <Text style={[styles.tableHeaderCell, styles.cellTotal]}>{reshapeArabic('الإجمالي')}</Text>
          </View>

          {/* Rows */}
          {(invoice.items || []).map((item: any, idx: number) => (
            <View 
              key={idx} 
              style={[
                styles.tableRow, 
                idx % 2 === 1 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={[styles.tableCellText, styles.cellNo]}>{idx + 1}</Text>
              <Text style={[styles.tableCellText, styles.cellItem]}>
                {reshapeArabic(item.itemName || 'صنف غير محدد')}
              </Text>
              <Text style={[styles.tableCellText, styles.cellQty]}>
                {item.quantity} {reshapeArabic(item.unitName || '')}
              </Text>
              <Text style={[styles.tableCellText, styles.cellPrice]}>
                {Number(item.price).toFixed(2)} {currencySymbol}
              </Text>
              <Text style={[styles.tableCellText, styles.cellTotal, { fontWeight: 'bold' }]}>
                {Number(item.total || (item.quantity * item.price)).toFixed(2)} {currencySymbol}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals & Notes */}
        <View style={styles.totalsSection}>
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>{reshapeArabic('ملاحظات وشروط:')}</Text>
            <Text style={styles.notesText}>
              {invoice.notes ? reshapeArabic(invoice.notes) : reshapeArabic('البضاعة المباعة لا ترد ولا تستبدل بعد مضي 3 أيام. شكراً لثقتكم بنا.')}
            </Text>
          </View>

          <View style={styles.totalsBox}>
            {invoice.subTotal !== undefined ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{reshapeArabic('المجموع الفرعي:')}</Text>
                <Text style={styles.totalValue}>{Number(invoice.subTotal).toFixed(2)} {currencySymbol}</Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
            {invoice.discount !== undefined && invoice.discount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{reshapeArabic('الخصم الممنوح:')}</Text>
                <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{Number(invoice.discount).toFixed(2)} {currencySymbol}</Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>{reshapeArabic('الإجمالي النهائي:')}</Text>
              <Text style={styles.totalValueFinal}>{Number(invoice.total).toFixed(2)} {currencySymbol}</Text>
            </View>
            {invoice.paidAmount !== undefined ? (
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={styles.totalLabel}>{reshapeArabic('المبلغ المدفوع:')}</Text>
                <Text style={styles.totalValue}>{Number(invoice.paidAmount).toFixed(2)} {currencySymbol}</Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
            {invoice.total !== undefined && invoice.paidAmount !== undefined && (invoice.total - invoice.paidAmount) > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{reshapeArabic('المتبقي (آجل):')}</Text>
                <Text style={[styles.totalValue, { color: '#b45309', fontWeight: 'bold' }]}>
                  {Number(invoice.total - invoice.paidAmount).toFixed(2)} {currencySymbol}
                </Text>
              </View>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {reshapeArabic('أنشئ بواسطة نظام غزة كاش المالي الذكي - Gaza Cash ERP')}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};
