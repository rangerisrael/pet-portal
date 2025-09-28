import { toast } from 'react-toastify';

// Invoice Details Modal Component
const InvoiceDetailsModal = ({ invoice, onClose }) => {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoicePayments, setInvoicePayments] = useState([]);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      // Fetch invoice items
      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);

      setInvoiceItems(itemsData || []);

      // Fetch invoice payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("payment_date", { ascending: false });

      setInvoicePayments(paymentsData || []);
    };

    fetchInvoiceDetails();
  }, [invoice.id]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              Invoice #{invoice.invoice_number}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  try {
                    await downloadInvoicePDF(
                      invoice,
                      invoiceItems,
                      {
                        first_name: invoice.owner_first_name,
                        last_name: invoice.owner_last_name,
                        phone: invoice.owner_phone,
                        email: user?.email,
                      },
                      {
                        name: invoice.pet_name,
                        species: invoice.species,
                      }
                    );
                  } catch (error) {
                    toast.error("Error generating PDF: " + error.message);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await printInvoicePDF(
                      invoice,
                      invoiceItems,
                      {
                        first_name: invoice.owner_first_name,
                        last_name: invoice.owner_last_name,
                        phone: invoice.owner_phone,
                        email: user?.email,
                      },
                      {
                        name: invoice.pet_name,
                        species: invoice.species,
                      }
                    );

                    // Log the print action
                    await auditInvoicePrint(invoice);
                  } catch (error) {
                    toast.error("Error printing PDF: " + error.message);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg font-medium text-sm transition-colors"
              >
                <Printer size={16} />
                <span>Print PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <XCircle size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                Invoice Details
              </h4>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Due Date:</span>{" "}
                  {new Date(invoice.due_date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Pet:</span>{" "}
                  {invoice.pet_name || "General Service"}
                </p>
                {invoice.appointment_date && (
                  <p>
                    <span className="font-medium">Appointment:</span>{" "}
                    {new Date(invoice.appointment_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                Amount Summary
              </h4>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Subtotal:</span> ₱
                  {invoice.subtotal?.toLocaleString()}
                </p>
                {invoice.discount_amount > 0 && (
                  <p>
                    <span className="font-medium">Discount:</span> -₱
                    {invoice.discount_amount?.toLocaleString()}
                  </p>
                )}
                {invoice.tax_amount > 0 && (
                  <p>
                    <span className="font-medium">Tax:</span> ₱
                    {invoice.tax_amount?.toLocaleString()}
                  </p>
                )}
                <p className="text-lg">
                  <span className="font-bold">Total:</span>{" "}
                  <span className="font-bold">
                    ₱{invoice.total_amount?.toLocaleString()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Paid:</span> ₱
                  {invoice.paid_amount?.toLocaleString()}
                </p>
                <p className="text-lg">
                  <span className="font-bold text-red-600">Balance Due:</span>{" "}
                  <span className="font-bold text-red-600">
                    ₱{invoice.balance_due?.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoiceItems.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 text-lg">
                  Services & Items
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-orange-900">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-orange-900">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-orange-900">
                        Unit Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-orange-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoiceItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">
                          ₱{item.unit_price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                          ₱{item.line_total?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoicePayments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Payment History
              </h4>
              <div className="space-y-2">
                {invoicePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        ₱{payment.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString()} •{" "}
                        {payment.payment_method
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      {payment.reference_number && (
                        <p className="text-sm text-gray-500">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deletePayment(payment.id, invoice.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete payment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Notes</h4>
              <p className="text-blue-800 text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
