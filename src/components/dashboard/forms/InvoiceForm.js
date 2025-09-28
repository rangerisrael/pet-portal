import React, { useState } from "react";
import { Plus, Trash2, XCircle } from "lucide-react";
import { toast } from 'react-toastify';

const InvoiceForm = ({
  invoice,
  onSubmit,
  onCancel,
  isEdit = false,
  pets = [],
  appointments = []
}) => {
  const [formData, setFormData] = useState({
    pet_id: invoice?.pet_id || "",
    appointment_id: invoice?.appointment_id || "",
    invoice_date: invoice?.invoice_date || new Date().toISOString().split("T")[0],
    due_date: invoice?.due_date ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    payment_terms: invoice?.payment_terms || "30 days",
    tax_rate: invoice?.tax_rate || 0,
    discount_amount: invoice?.discount_amount || 0,
    notes: invoice?.notes || "",
  });

  const [items, setItems] = useState([
    {
      description: "",
      service_type: "consultation",
      quantity: 1,
      unit_price: 0,
    },
  ]);

  const serviceTypes = [
    { value: "consultation", label: "Consultation" },
    { value: "examination", label: "Examination" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" },
    { value: "medication", label: "Medication" },
    { value: "laboratory", label: "Laboratory" },
    { value: "imaging", label: "Imaging" },
    { value: "dental", label: "Dental" },
    { value: "grooming", label: "Grooming" },
    { value: "boarding", label: "Boarding" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.invoice_date || !formData.due_date) {
      toast.error("Please fill in invoice date and due date");
      return;
    }

    const validItems = items.filter(
      (item) => item.description && item.description.trim() !== ""
    );
    if (validItems.length === 0) {
      toast.error("Please add at least one invoice item with a description");
      return;
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unit_price),
      0
    );
    const taxAmount =
      ((subtotal - (parseFloat(formData.discount_amount) || 0)) *
        (parseFloat(formData.tax_rate) || 0)) / 100;
    const total = subtotal - (parseFloat(formData.discount_amount) || 0) + taxAmount;

    const invoiceData = {
      ...formData,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
      balance_due: total,
      items: validItems,
    };

    onSubmit(invoiceData);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        service_type: "consultation",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] =
      field === "quantity" || field === "unit_price"
        ? parseFloat(value) || 0
        : value;
    setItems(newItems);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxAmount =
    ((subtotal - (formData.discount_amount || 0)) * (formData.tax_rate || 0)) / 100;
  const total = subtotal - (formData.discount_amount || 0) + taxAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Invoice" : "Create New Invoice"}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pet (Optional)
              </label>
              <select
                value={formData.pet_id}
                onChange={(e) =>
                  setFormData({ ...formData, pet_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">No specific pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Related Appointment (Optional)
              </label>
              <select
                value={formData.appointment_id}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">No specific appointment</option>
                {appointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {new Date(apt.appointment_date).toLocaleDateString()} - {apt.pet_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({ ...formData, payment_terms: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 30 days"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Invoice Items</h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Service description"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type
                      </label>
                      <select
                        value={item.service_type}
                        onChange={(e) =>
                          updateItem(index, "service_type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {serviceTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (₱)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <p className="text-sm font-semibold text-gray-900 py-2">
                        ₱{(item.quantity * item.unit_price).toLocaleString()}
                      </p>
                    </div>
                    <div className="md:col-span-1">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Amount (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4">Invoice Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                {formData.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₱{formData.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                {formData.tax_rate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax_rate}%):</span>
                    <span>₱{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
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
              placeholder="Additional notes or instructions..."
            />
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
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20"
            >
              {isEdit ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;