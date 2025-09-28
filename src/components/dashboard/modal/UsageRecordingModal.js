import React, { useState } from 'react';
import { X, Stethoscope, Save, AlertTriangle } from 'lucide-react';

const UsageRecordingModal = ({
  item,
  onRecord,
  onCancel,
  appointments = [],
  pets = []
}) => {
  const [formData, setFormData] = useState({
    appointment_id: '',
    pet_id: '',
    patient_name: '',
    quantity_used: '',
    diagnosis: '',
    treatment_notes: '',
    dosage_given: '',
    administration_route: '',
    administered_by: '',
    batch_number: '',
    lot_number: '',
    billable: true,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate pet name when pet is selected
    if (field === 'pet_id' && value) {
      const selectedPet = pets.find(pet => pet.id === value);
      if (selectedPet) {
        setFormData(prev => ({
          ...prev,
          patient_name: selectedPet.name
        }));
      }
    }

    // Auto-populate appointment info when appointment is selected
    if (field === 'appointment_id' && value) {
      const selectedAppointment = appointments.find(apt => apt.id === value);
      if (selectedAppointment) {
        setFormData(prev => ({
          ...prev,
          pet_id: selectedAppointment.pet_id,
          patient_name: selectedAppointment.pet_name,
          diagnosis: selectedAppointment.reason_for_visit || ''
        }));
      }
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity_used || parseFloat(formData.quantity_used) <= 0) {
      newErrors.quantity_used = 'Valid quantity is required';
    }

    if (parseFloat(formData.quantity_used) > item.available_stock) {
      newErrors.quantity_used = `Cannot use more than available stock (${item.available_stock})`;
    }

    if (!formData.patient_name.trim() && !formData.pet_id) {
      newErrors.patient_name = 'Patient name or pet selection is required';
    }

    if (!formData.treatment_notes.trim()) {
      newErrors.treatment_notes = 'Treatment notes are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const usageData = {
        ...formData,
        item_id: item.id,
        item_name: item.name,
        quantity_used: parseFloat(formData.quantity_used),
        unit_cost: item.unit_cost,
        total_cost: parseFloat(formData.quantity_used) * item.unit_cost,
        usage_date: new Date().toISOString(),
        recorded_by: 'Current User' // This should come from auth context
      };

      await onRecord(usageData);
    } catch (error) {
      console.error('Usage recording error:', error);
      setErrors({ submit: 'Failed to record usage. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    const quantity = parseFloat(formData.quantity_used) || 0;
    return (quantity * item.unit_cost).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Stethoscope size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Record Usage</h2>
                <p className="text-gray-600 mt-1">Record usage of {item.name}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{item.current_stock}</div>
                <div className="text-sm text-gray-600">Current Stock</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{item.available_stock}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">${item.unit_cost}</div>
                <div className="text-sm text-gray-600">Unit Cost</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{item.unit_of_measure}</div>
                <div className="text-sm text-gray-600">Unit</div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment (Optional)
                </label>
                <select
                  value={formData.appointment_id}
                  onChange={(e) => handleInputChange('appointment_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select appointment</option>
                  {appointments.map(appointment => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.pet_name} - {new Date(appointment.appointment_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pet (Optional)
                </label>
                <select
                  value={formData.pet_id}
                  onChange={(e) => handleInputChange('pet_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => handleInputChange('patient_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.patient_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter patient name"
              />
              {errors.patient_name && <p className="text-red-600 text-sm mt-1">{errors.patient_name}</p>}
            </div>
          </div>

          {/* Usage Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity Used *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.quantity_used}
                    onChange={(e) => handleInputChange('quantity_used', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.quantity_used ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max={item.available_stock}
                  />
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    {item.unit_of_measure}
                  </div>
                </div>
                {errors.quantity_used && <p className="text-red-600 text-sm mt-1">{errors.quantity_used}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dosage Given
                </label>
                <input
                  type="text"
                  value={formData.dosage_given}
                  onChange={(e) => handleInputChange('dosage_given', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 1 tablet, 5ml"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Administration Route
                </label>
                <select
                  value={formData.administration_route}
                  onChange={(e) => handleInputChange('administration_route', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select route</option>
                  <option value="oral">Oral</option>
                  <option value="injection">Injection</option>
                  <option value="topical">Topical</option>
                  <option value="intravenous">Intravenous</option>
                  <option value="subcutaneous">Subcutaneous</option>
                  <option value="intramuscular">Intramuscular</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Administered By
                </label>
                <input
                  type="text"
                  value={formData.administered_by}
                  onChange={(e) => handleInputChange('administered_by', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Veterinarian or staff name"
                />
              </div>
            </div>

            {/* Cost Calculation */}
            {formData.quantity_used && (
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Cost:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${getTotalCost()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>{formData.quantity_used} {item.unit_of_measure} × ${item.unit_cost}</span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.billable}
                      onChange={(e) => handleInputChange('billable', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span>Billable to client</span>
                  </label>
                </div>
              </div>
            )}

            {/* Stock Warning */}
            {formData.quantity_used &&
             (item.available_stock - parseFloat(formData.quantity_used)) <= item.reorder_point && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                <p className="text-yellow-700 text-sm">
                  Stock will be at or below reorder point ({item.reorder_point}) after this usage
                </p>
              </div>
            )}
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Primary diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Notes *
              </label>
              <textarea
                value={formData.treatment_notes}
                onChange={(e) => handleInputChange('treatment_notes', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.treatment_notes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the treatment and reason for using this item"
              />
              {errors.treatment_notes && <p className="text-red-600 text-sm mt-1">{errors.treatment_notes}</p>}
            </div>
          </div>

          {/* Batch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Batch Information (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => handleInputChange('batch_number', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Batch number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lot Number
                </label>
                <input
                  type="text"
                  value={formData.lot_number}
                  onChange={(e) => handleInputChange('lot_number', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Lot number"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Any additional notes about this usage"
            />
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20'
              }`}
            >
              <Save size={18} />
              <span>{loading ? 'Recording...' : 'Record Usage'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsageRecordingModal;