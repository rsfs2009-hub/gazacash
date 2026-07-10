import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoiceTemplate } from '../components/PrintTemplates/InvoiceTemplate';
import { ReportTemplate } from '../components/PrintTemplates/ReportTemplate';

// Custom universal toast trigger
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  if ((window as any).showToast) {
    (window as any).showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export const usePrint = () => {
  /**
   * Generates and exports an Invoice (Sale / Purchase / Quotation / Return) as a professional PDF.
   */
  const exportInvoiceToPDF = async (
    invoice: any,
    type: 'sale' | 'purchase' | 'return_in' | 'return_out' | 'quotation',
    settings: any,
    currencySymbol: string = '₪'
  ) => {
    try {
      showToast('جاري تحضير وتوليد ملف PDF احترافي للفاتورة...', 'info');

      // Call template function directly to get Document primitive root for react-pdf React 19 compatibility
      const element = (InvoiceTemplate as any)({
        invoice,
        type,
        settings,
        currencySymbol
      });

      // Render to PDF Blob
      const pdfInstance = pdf(element);
      const blob = await pdfInstance.toBlob();

      const documentNo = invoice.invoiceNo || invoice.returnNo || invoice.quotationNo || invoice.id?.substring(0, 8) || 'doc';
      const filename = `GazaCash_Invoice_${documentNo}.pdf`;

      // Check if Electron native save is available
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && typeof electronAPI.generatePDF === 'function') {
        const arrayBuffer = await blob.arrayBuffer();
        const response = await electronAPI.generatePDF(filename, arrayBuffer);

        if (response?.success) {
          showToast(`✓ تم تصدير الفاتورة بنجاح وحفظها في: ${response.filePath}`, 'success');
        } else if (response?.canceled) {
          showToast('تم إلغاء عملية تصدير وحفظ ملف الـ PDF.', 'info');
        } else {
          showToast(`⚠️ فشل تصدير الملف: ${response?.error || 'خطأ غير معروف'}`, 'error');
        }
      } else {
        // Fallback for Web Browser (Preview environment)
        const fileURL = URL.createObjectURL(blob);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.download = filename;
        fileLink.click();
        
        // Clean up URL object
        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
        showToast('✓ تم توليد وتصدير فاتورة الـ PDF بنجاح عبر المتصفح!', 'success');
      }
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      showToast(`⚠️ حدث خطأ أثناء إعداد مستند الـ PDF: ${error.message || String(error)}`, 'error');
    }
  };

  /**
   * Generates and exports a dynamic tabular report as a professional PDF.
   */
  const exportReportToPDF = async (
    title: string,
    subtitle: string,
    headers: string[],
    rows: string[][],
    colWidths: string[],
    totals: { label: string; value: string; isFinal?: boolean }[] = [],
    settings: any
  ) => {
    try {
      showToast('جاري توليد وإعداد تقرير الـ PDF الاحترافي...', 'info');

      const printDate = new Date().toLocaleString('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      // Call template function directly to get Document primitive root for react-pdf React 19 compatibility
      const element = (ReportTemplate as any)({
        title,
        subtitle,
        headers,
        rows,
        colWidths,
        totals,
        settings,
        printDate
      });

      // Render to PDF Blob
      const pdfInstance = pdf(element);
      const blob = await pdfInstance.toBlob();

      const safeTitle = title.replace(/\s+/g, '_');
      const filename = `GazaCash_Report_${safeTitle}.pdf`;

      // Check if Electron native save is available
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && typeof electronAPI.generatePDF === 'function') {
        const arrayBuffer = await blob.arrayBuffer();
        const response = await electronAPI.generatePDF(filename, arrayBuffer);

        if (response?.success) {
          showToast(`✓ تم تصدير وحفظ التقرير بنجاح في: ${response.filePath}`, 'success');
        } else if (response?.canceled) {
          showToast('تم إلغاء عملية تصدير وحفظ ملف الـ PDF.', 'info');
        } else {
          showToast(`⚠️ فشل تصدير التقرير: ${response?.error || 'خطأ غير معروف'}`, 'error');
        }
      } else {
        // Fallback for Web Browser (Preview environment)
        const fileURL = URL.createObjectURL(blob);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.download = filename;
        fileLink.click();
        
        // Clean up URL object
        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
        showToast('✓ تم توليد وتصدير تقرير الـ PDF بنجاح عبر المتصفح!', 'success');
      }
    } catch (error: any) {
      console.error('PDF Report Export Error:', error);
      showToast(`⚠️ حدث خطأ أثناء توليد التقرير المالي: ${error.message || String(error)}`, 'error');
    }
  };

  return {
    exportInvoiceToPDF,
    exportReportToPDF
  };
};
