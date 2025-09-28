import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
import InvoiceDetailsModal from "../modal/InvoiceModal";

const BillingContent = ({
  billingSummary,
  invoices,
  payments,
  showInvoiceDetails,
  selectedInvoice,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Billing & Payments
          </h3>
          <p className="text-gray-600">
            View your invoices, payment history, and billing summary
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateInvoice(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/20 transition-all duration-200"
          >
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Total Invoiced
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ₱{billingSummary?.total_invoiced?.toLocaleString() || "0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-green-700">
                ₱{billingSummary?.total_paid?.toLocaleString() || "0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Outstanding
              </p>
              <p className="text-3xl font-bold text-red-700">
                ₱{billingSummary?.total_outstanding?.toLocaleString() || "0.00"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign size={20} className="mr-2 text-orange-600" />
            Recent Invoices
          </h4>
        </div>

        {invoices?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No invoices found</p>
            <p>Your invoices will appear here after veterinary services.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Pet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices?.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900">
                          #{invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Heart size={14} className="text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {invoice.pet_name || "General Service"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900">
                          ₱{invoice.total_amount?.toLocaleString()}
                        </div>
                        {invoice.balance_due > 0 && (
                          <div className="text-sm text-red-600">
                            ₱{invoice.balance_due?.toLocaleString()} due
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          invoice.actual_status
                        )}`}
                      >
                        {invoice.actual_status?.charAt(0).toUpperCase() +
                          invoice.actual_status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceDetails(true);
                          }}
                          className="text-orange-600 hover:text-orange-800 font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowEditInvoice(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        {invoice.balance_due > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentForm(true);
                            }}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      {payments?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle size={20} className="mr-2 text-green-600" />
              Recent Payments
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.slice(0, 5).map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        #
                        {
                          invoices.find((inv) => inv.id === payment.invoice_id)
                            ?.invoice_number
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-green-700">
                        ₱{payment.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {payment.payment_method
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.reference_number || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceDetails(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default BillingContent;
