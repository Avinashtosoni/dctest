import jsPDF from 'jspdf';
import { supabase } from './supabase';

export interface InvoiceData {
    invoiceNumber: string;
    orderNumber: string;
    orderId: string;
    date: Date;
    dueDate?: Date;

    // Customer info
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    // Company info
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    companyGST?: string;

    // Items
    items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];

    // Totals
    subtotal: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    currency: string;

    // Payment info
    paymentStatus: 'paid' | 'pending' | 'failed';
    paymentMethod?: string;
    paymentId?: string;
}

const COMPANY_INFO = {
    name: 'Digital Comrade',
    address: 'Your Business Address, City, State - PIN',
    email: 'contact@digitalcomrade.com',
    phone: '+91 XXXXX XXXXX',
    gst: 'GSTIN: XXXXXXXXXXXXXXX'
};

/**
 * Generate a PDF invoice and upload to Supabase Storage
 * Returns the public URL of the stored invoice
 */
export async function generateAndStoreInvoice(data: InvoiceData): Promise<string | null> {
    try {
        // Generate PDF
        const pdfBlob = generateInvoicePDF(data);

        // Create filename
        const filename = `invoices/${data.orderId}/${data.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filename, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            console.error('[Invoice] Upload failed:', uploadError);
            // If bucket doesn't exist, try to create it
            if (uploadError.message.includes('not found')) {
                console.log('[Invoice] Creating documents bucket...');
                await supabase.storage.createBucket('documents', { public: true });
                // Retry upload
                const { error: retryError } = await supabase.storage
                    .from('documents')
                    .upload(filename, pdfBlob, { contentType: 'application/pdf', upsert: true });
                if (retryError) throw retryError;
            } else {
                throw uploadError;
            }
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filename);

        const pdfUrl = urlData.publicUrl;
        console.log('[Invoice] PDF stored at:', pdfUrl);

        return pdfUrl;
    } catch (error) {
        console.error('[Invoice] Error generating/storing invoice:', error);
        return null;
    }
}

/**
 * Generate invoice PDF using jsPDF
 */
export function generateInvoicePDF(data: InvoiceData): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Helper functions
    const formatCurrency = (amount: number) => {
        return '₹' + (amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Header - Company Info
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 71, 140); // Blue color
    doc.text(data.companyName || COMPANY_INFO.name, 20, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(data.companyAddress || COMPANY_INFO.address, 20, y);
    y += 5;
    doc.text(`Email: ${data.companyEmail || COMPANY_INFO.email}`, 20, y);
    y += 5;
    doc.text(`Phone: ${data.companyPhone || COMPANY_INFO.phone}`, 20, y);
    if (data.companyGST || COMPANY_INFO.gst) {
        y += 5;
        doc.text(data.companyGST || COMPANY_INFO.gst, 20, y);
    }

    // Invoice Title & Number (right side)
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 71, 140);
    doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(`#${data.invoiceNumber}`, pageWidth - 20, 35, { align: 'right' });
    doc.text(`Order: ${data.orderNumber}`, pageWidth - 20, 42, { align: 'right' });

    // Date
    doc.setFontSize(10);
    doc.text(`Date: ${formatDate(data.date)}`, pageWidth - 20, 52, { align: 'right' });
    if (data.dueDate) {
        doc.text(`Due Date: ${formatDate(data.dueDate)}`, pageWidth - 20, 59, { align: 'right' });
    }

    // Payment Status Badge
    y = 70;
    const statusColors: Record<string, [number, number, number]> = {
        paid: [34, 197, 94],    // Green
        pending: [234, 179, 8], // Yellow
        failed: [239, 68, 68]   // Red
    };
    const statusColor = statusColors[data.paymentStatus] || [100, 100, 100];
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageWidth - 50, y - 5, 30, 10, 2, 2, 'F');
    doc.setTextColor(255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(data.paymentStatus.toUpperCase(), pageWidth - 35, y + 2, { align: 'center' });

    // Divider
    y = 80;
    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);

    // Bill To Section
    y = 95;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('BILL TO', 20, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.setFontSize(12);
    doc.text(data.customerName, 20, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(data.customerEmail, 20, y);

    if (data.customerPhone) {
        y += 5;
        doc.text(data.customerPhone, 20, y);
    }

    if (data.customerAddress) {
        y += 5;
        doc.text(data.customerAddress.line1, 20, y);
        if (data.customerAddress.line2) {
            y += 5;
            doc.text(data.customerAddress.line2, 20, y);
        }
        y += 5;
        doc.text(`${data.customerAddress.city}, ${data.customerAddress.state} - ${data.customerAddress.postalCode}`, 20, y);
        y += 5;
        doc.text(data.customerAddress.country, 20, y);
    }

    // Items Table
    y = 150;

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y - 5, pageWidth - 40, 12, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60);
    doc.text('ITEM', 25, y + 3);
    doc.text('QTY', 120, y + 3);
    doc.text('PRICE', 145, y + 3);
    doc.text('TOTAL', pageWidth - 25, y + 3, { align: 'right' });

    // Table Rows
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    data.items.forEach((item) => {
        doc.setFontSize(10);
        doc.text(item.name, 25, y);
        if (item.description) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            y += 4;
            doc.text(item.description.substring(0, 50), 25, y);
            doc.setTextColor(40);
        }
        doc.setFontSize(10);
        doc.text(item.quantity.toString(), 125, y - (item.description ? 4 : 0));
        doc.text(formatCurrency(item.unitPrice), 145, y - (item.description ? 4 : 0));
        doc.text(formatCurrency(item.total), pageWidth - 25, y - (item.description ? 4 : 0), { align: 'right' });
        y += 12;
    });

    // Totals Section
    y += 10;
    doc.setDrawColor(220);
    doc.line(110, y, pageWidth - 20, y);

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);

    doc.text('Subtotal:', 120, y);
    doc.text(formatCurrency(data.subtotal), pageWidth - 25, y, { align: 'right' });

    if (data.discount > 0) {
        y += 8;
        doc.setTextColor(34, 197, 94);
        doc.text('Discount:', 120, y);
        doc.text(`-${formatCurrency(data.discount)}`, pageWidth - 25, y, { align: 'right' });
        doc.setTextColor(80);
    }

    if (data.taxAmount > 0) {
        y += 8;
        doc.text(`Tax (${data.taxRate}%):`, 120, y);
        doc.text(formatCurrency(data.taxAmount), pageWidth - 25, y, { align: 'right' });
    }

    // Total
    y += 12;
    doc.setDrawColor(0, 71, 140);
    doc.setLineWidth(0.5);
    doc.line(110, y - 3, pageWidth - 20, y - 3);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 71, 140);
    doc.text('TOTAL:', 120, y + 5);
    doc.text(formatCurrency(data.total), pageWidth - 25, y + 5, { align: 'right' });

    // Payment Info
    if (data.paymentMethod || data.paymentId) {
        y += 25;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        if (data.paymentMethod) {
            doc.text(`Payment Method: ${data.paymentMethod}`, 20, y);
        }
        if (data.paymentId) {
            y += 5;
            doc.text(`Transaction ID: ${data.paymentId}`, 20, y);
        }
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('This is a computer-generated invoice.', pageWidth / 2, footerY + 5, { align: 'center' });

    return doc.output('blob');
}

/**
 * Create invoice record in database and store PDF
 */
export async function createInvoiceForOrder(
    orderId: string,
    userId: string | null,
    paymentId: string | null,
    billingInfo: any,
    productName: string,
    amounts: { subtotal: number; discount: number; tax: number; total: number }
): Promise<{ invoiceId: string; pdfUrl: string } | null> {
    try {
        // Generate invoice number
        const year = new Date().getFullYear();
        const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${year}-01-01`);

        const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

        // Get order number
        const { data: order } = await supabase
            .from('orders')
            .select('order_number')
            .eq('id', orderId)
            .single();

        // Prepare invoice data
        const invoiceData: InvoiceData = {
            invoiceNumber,
            orderNumber: order?.order_number || orderId,
            orderId,
            date: new Date(),
            customerName: billingInfo.full_name || 'Customer',
            customerEmail: billingInfo.email || '',
            customerPhone: billingInfo.phone,
            customerAddress: billingInfo.address_line1 ? {
                line1: billingInfo.address_line1,
                line2: billingInfo.address_line2,
                city: billingInfo.city,
                state: billingInfo.state,
                postalCode: billingInfo.postal_code,
                country: billingInfo.country
            } : undefined,
            companyName: COMPANY_INFO.name,
            companyAddress: COMPANY_INFO.address,
            companyEmail: COMPANY_INFO.email,
            companyPhone: COMPANY_INFO.phone,
            companyGST: COMPANY_INFO.gst,
            items: [{
                name: productName,
                quantity: 1,
                unitPrice: amounts.subtotal,
                total: amounts.subtotal
            }],
            subtotal: amounts.subtotal,
            discount: amounts.discount,
            taxRate: 0,
            taxAmount: amounts.tax,
            total: amounts.total,
            currency: 'INR',
            paymentStatus: paymentId ? 'paid' : 'pending',
            paymentId: paymentId || undefined
        };

        // Generate and store PDF (may fail if storage bucket doesn't exist)
        let pdfUrl: string | null = null;
        try {
            pdfUrl = await generateAndStoreInvoice(invoiceData);
            console.log('[Invoice] PDF generation result:', pdfUrl ? 'success' : 'failed');
        } catch (pdfError) {
            console.warn('[Invoice] PDF storage failed, continuing without PDF:', pdfError);
        }

        // Create invoice record in database
        console.log('[Invoice] Inserting invoice record for order:', orderId);
        const { data: invoice, error } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                user_id: userId,
                order_id: orderId,
                payment_id: paymentId,
                billing_name: billingInfo.full_name,
                billing_email: billingInfo.email,
                billing_address: billingInfo.address_line1 ? {
                    line1: billingInfo.address_line1,
                    line2: billingInfo.address_line2,
                    city: billingInfo.city,
                    state: billingInfo.state,
                    postal_code: billingInfo.postal_code,
                    country: billingInfo.country
                } : null,
                subtotal: amounts.subtotal,
                discount_amount: amounts.discount,
                tax_amount: amounts.tax,
                total_amount: amounts.total,
                status: paymentId ? 'paid' : 'draft',
                pdf_url: pdfUrl,
                line_items: invoiceData.items
            })
            .select()
            .single();

        if (error) {
            console.error('[Invoice] DB insert failed:', error.message, error.details, error.hint);
            return null;
        }

        console.log('[Invoice] Created invoice:', invoice.id, 'PDF:', pdfUrl ? 'yes' : 'no');
        return { invoiceId: invoice.id, pdfUrl: pdfUrl || '' };
    } catch (error: any) {
        console.error('[Invoice] Error creating invoice:', error.message || error);
        return null;
    }
}

/**
 * Download invoice PDF for an order
 */
export async function downloadInvoice(orderId: string): Promise<string | null> {
    try {
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('pdf_url, invoice_number')
            .eq('order_id', orderId)
            .single();

        if (error || !invoice?.pdf_url) {
            console.error('[Invoice] Not found for order:', orderId);
            return null;
        }

        return invoice.pdf_url;
    } catch (error) {
        console.error('[Invoice] Error fetching invoice:', error);
        return null;
    }
}
