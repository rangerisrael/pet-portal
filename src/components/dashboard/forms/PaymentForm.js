import { toast } from 'react-toastify';

// Payment Form Component
export function PaymentForm({ invoice, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    invoice_id: invoice?.id || "",
    payment_method: "cash",
    payment_date: new Date().toISOString().split("T")[0],
    amount: invoice?.balance_due || 0,
    reference_number: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    onSubmit(formData);
  };

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Record Payment</h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
          {invoice && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900">
                Invoice #{invoice.invoice_number}
              </p>
              <p className="text-blue-800">
                Balance Due: ₱{invoice.balance_due?.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Amount (₱) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reference_number: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Transaction reference, check number, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Additional payment notes..."
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all duration-200 shadow-lg shadow-green-600/20"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
