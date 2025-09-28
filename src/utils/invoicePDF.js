import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = async (invoice, invoiceItems = [], ownerProfile = {}, petProfile = {}) => {
  try {
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text('Pet Portal Veterinary Clinic', 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Veterinary Street, Pet City, PC 12345', 20, 35);
    doc.text('Phone: (555) 123-PETS | Email: info@petportal.com', 20, 42);
    
    // Invoice Title
    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text('INVOICE', 150, 25);
    
    // Invoice Details Box
    doc.setFontSize(10);
    doc.setTextColor(100);
    const invoiceDetailsY = 50;
    doc.text('Invoice Number:', 150, invoiceDetailsY);
    doc.text('Invoice Date:', 150, invoiceDetailsY + 7);
    doc.text('Due Date:', 150, invoiceDetailsY + 14);
    doc.text('Status:', 150, invoiceDetailsY + 21);
    
    doc.setTextColor(0);
    doc.text(invoice.invoice_number || 'N/A', 185, invoiceDetailsY);
    doc.text(formatDate(invoice.invoice_date), 185, invoiceDetailsY + 7);
    doc.text(formatDate(invoice.due_date), 185, invoiceDetailsY + 14);
    doc.text(capitalizeFirst(invoice.status || 'pending'), 185, invoiceDetailsY + 21);
    
    // Bill To Section
    doc.setFontSize(12);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text('Bill To:', 20, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    const billToY = 65;
    doc.text(`${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`, 20, billToY);
    doc.text(`Phone: ${ownerProfile.phone || 'N/A'}`, 20, billToY + 7);
    doc.text(`Email: ${ownerProfile.email || 'N/A'}`, 20, billToY + 14);
    
    // Pet Information (if applicable)
    if (petProfile && petProfile.name) {
      doc.setTextColor(234, 88, 12); // Orange-600
      doc.text('Pet Information:', 20, billToY + 28);
      doc.setTextColor(0);
      doc.text(`Name: ${petProfile.name}`, 20, billToY + 38);
      doc.text(`Species: ${petProfile.species || 'N/A'}`, 20, billToY + 45);
      doc.text(`Breed: ${petProfile.breed || 'N/A'}`, 20, billToY + 52);
    }
    
    // Invoice Items Table
    const tableStartY = petProfile && petProfile.name ? 130 : 100;
    
    const tableData = invoiceItems.map(item => [
      item.description || 'N/A',
      item.service_type ? capitalizeFirst(item.service_type) : 'General',
      item.quantity?.toString() || '1',
      `$${parseFloat(item.unit_price || 0).toFixed(2)}`,
      `$${parseFloat(item.line_total || 0).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Description', 'Service Type', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [234, 88, 12], // Orange-600
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 40,
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Calculate totals section position - use autoTable's return value
    const finalY = (doc.lastAutoTable?.finalY || tableStartY + (tableData.length * 10) + 40) + 20;
    const totalsX = 130;
    
    // Totals Section
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Subtotal:', totalsX, finalY);
    doc.text('Tax Rate:', totalsX, finalY + 7);
    doc.text('Tax Amount:', totalsX, finalY + 14);
    if (invoice.discount_amount > 0) {
      doc.text('Discount:', totalsX, finalY + 21);
      doc.text('Total Amount:', totalsX, finalY + 28);
      doc.text('Amount Paid:', totalsX, finalY + 35);
      doc.text('Balance Due:', totalsX, finalY + 42);
    } else {
      doc.text('Total Amount:', totalsX, finalY + 21);
      doc.text('Amount Paid:', totalsX, finalY + 28);
      doc.text('Balance Due:', totalsX, finalY + 35);
    }
    
    // Totals Values
    doc.setTextColor(0);
    const valueX = 175;
    doc.text(`$${parseFloat(invoice.subtotal || 0).toFixed(2)}`, valueX, finalY);
    doc.text(`${parseFloat(invoice.tax_rate || 0).toFixed(1)}%`, valueX, finalY + 7);
    doc.text(`$${parseFloat(invoice.tax_amount || 0).toFixed(2)}`, valueX, finalY + 14);
    
    let balanceDueY;
    if (invoice.discount_amount > 0) {
      doc.text(`$${parseFloat(invoice.discount_amount || 0).toFixed(2)}`, valueX, finalY + 21);
      doc.text(`$${parseFloat(invoice.total_amount || 0).toFixed(2)}`, valueX, finalY + 28);
      doc.text(`$${parseFloat(invoice.paid_amount || 0).toFixed(2)}`, valueX, finalY + 35);
      balanceDueY = finalY + 42;
    } else {
      doc.text(`$${parseFloat(invoice.total_amount || 0).toFixed(2)}`, valueX, finalY + 21);
      doc.text(`$${parseFloat(invoice.paid_amount || 0).toFixed(2)}`, valueX, finalY + 28);
      balanceDueY = finalY + 35;
    }
    
    // Highlight balance due
    doc.setFontSize(12);
    doc.setTextColor(invoice.balance_due > 0 ? 220 : 0, invoice.balance_due > 0 ? 53 : 150, invoice.balance_due > 0 ? 69 : 0);
    doc.text(`$${parseFloat(invoice.balance_due || 0).toFixed(2)}`, valueX, balanceDueY);
    
    // Payment Terms & Notes
    if (invoice.payment_terms || invoice.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      const notesY = balanceDueY + 20;
      
      if (invoice.payment_terms) {
        doc.text(`Payment Terms: ${invoice.payment_terms}`, 20, notesY);
      }
      
      if (invoice.notes) {
        doc.text('Notes:', 20, notesY + 10);
        doc.setTextColor(0);
        const splitNotes = doc.splitTextToSize(invoice.notes, 170);
        doc.text(splitNotes, 20, notesY + 17);
      }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    const footerY = doc.internal.pageSize.height - 30;
    doc.text('Thank you for choosing Pet Portal Veterinary Clinic!', 20, footerY);
    doc.text('For questions about this invoice, please contact us at billing@petportal.com', 20, footerY + 7);
    
    return doc;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Export functions for different actions
export const downloadInvoicePDF = async (invoice, invoiceItems, ownerProfile, petProfile) => {
  try {
    const doc = await generateInvoicePDF(invoice, invoiceItems, ownerProfile, petProfile);
    const fileName = `invoice-${invoice.invoice_number || 'unknown'}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

export const printInvoicePDF = async (invoice, invoiceItems, ownerProfile, petProfile) => {
  try {
    const doc = await generateInvoicePDF(invoice, invoiceItems, ownerProfile, petProfile);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error('Error printing PDF:', error);
    throw error;
  }
};