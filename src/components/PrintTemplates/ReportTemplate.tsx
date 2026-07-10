import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
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
    fontSize: 9,
    padding: 30,
    backgroundColor: '#ffffff',
    direction: 'rtl',
  },
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 12,
    marginBottom: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopInfo: {
    alignItems: 'flex-end',
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  shopDetails: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  reportTitleContainer: {
    alignItems: 'flex-start',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  reportSubtitle: {
    fontSize: 8,
    color: '#4b5563',
    marginTop: 2,
  },
  metaBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 15,
  },
  metaItem: {
    fontSize: 8,
    color: '#374151',
  },
  table: {
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 8,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCellText: {
    fontSize: 8,
    color: '#374151',
    paddingHorizontal: 2,
  },
  totalsSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  totalsContainer: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  totalRowFinal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#1e3a8a',
  },
  totalLabel: {
    fontSize: 8,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalLabelFinal: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  totalValueFinal: {
    fontSize: 10,
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
    fontSize: 7,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 7,
    color: '#9ca3af',
  }
});

interface ReportTemplateProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  colWidths: string[];
  totals?: { label: string; value: string; isFinal?: boolean }[];
  settings: {
    name: string;
    address: string;
    phone: string;
  };
  printDate: string;
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({
  title,
  subtitle,
  headers,
  rows,
  colWidths,
  totals = [],
  settings,
  printDate
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>
              {reshapeArabic(settings.name || 'غزة كاش ERP')}
            </Text>
            <Text style={styles.shopDetails}>
              {reshapeArabic(settings.address || 'غزة، فلسطين')} | {settings.phone || ''}
            </Text>
          </View>
          <View style={styles.reportTitleContainer}>
            <Text style={styles.reportTitle}>
              {reshapeArabic(title)}
            </Text>
            {subtitle ? (
              <Text style={styles.reportSubtitle}>
                {reshapeArabic(subtitle)}
              </Text>
            ) : (
              <View style={{ width: 0, height: 0 }} />
            )}
          </View>
        </View>

        {/* Meta Bar */}
        <View style={styles.metaBar}>
          <Text style={styles.metaItem}>
            {reshapeArabic('تاريخ الطباعة:')} {printDate}
          </Text>
          <Text style={styles.metaItem}>
            {reshapeArabic('حالة التقرير: تقرير رسمي معتمد من النظام')}
          </Text>
        </View>

        {/* Tabular Data */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            {headers.map((header, i) => (
              <Text 
                key={i} 
                style={[
                  styles.tableHeaderCell, 
                  { 
                    width: colWidths[i] || '20%',
                    textAlign: i === 0 ? 'right' : 'center'
                  }
                ]}
              >
                {reshapeArabic(header)}
              </Text>
            ))}
          </View>

          {/* Body Rows */}
          {rows.map((row, rIdx) => (
            <View 
              key={rIdx} 
              style={[
                styles.tableRow, 
                rIdx % 2 === 1 ? styles.tableRowEven : {}
              ]}
              wrap={false}
            >
              {row.map((cell, cIdx) => (
                <Text 
                  key={cIdx} 
                  style={[
                    styles.tableCellText, 
                    { 
                      width: colWidths[cIdx] || '20%',
                      textAlign: cIdx === 0 ? 'right' : 'center',
                      fontWeight: cIdx === row.length - 1 ? 'bold' : 'normal'
                    }
                  ]}
                >
                  {reshapeArabic(cell)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Aggregate Totals (if any) */}
        {totals && totals.length > 0 ? (
          <View style={styles.totalsSection} wrap={false}>
            <View style={styles.totalsContainer}>
              {totals.map((total, tIdx) => (
                <View 
                  key={tIdx} 
                  style={total.isFinal ? styles.totalRowFinal : styles.totalRow}
                >
                  <Text style={total.isFinal ? styles.totalLabelFinal : styles.totalLabel}>
                    {reshapeArabic(total.label)}
                  </Text>
                  <Text style={total.isFinal ? styles.totalValueFinal : styles.totalValue}>
                    {reshapeArabic(total.value)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ width: 0, height: 0 }} />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {reshapeArabic('تم التوليد بنجاح عبر بوابة التقارير لـ غزة كاش')}
          </Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};
