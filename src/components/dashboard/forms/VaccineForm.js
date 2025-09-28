import { XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';

// Vaccination Form Component
export function VaccinationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    pet_id: "",
    vaccine_name: "",
    vaccine_type: "core",
    manufacturer: "",
    lot_number: "",
    vaccination_date: new Date().toISOString().split("T")[0],
    next_due_date: "",
    notes: "",
    reaction_notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.pet_id ||
      !formData.vaccine_name ||
      !formData.vaccination_date
    ) {
      toast.error("Please fill in required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              Add Vaccination Record
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
          {/* Pet Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Pet *
              </label>
              <select
                value={formData.pet_id}
                onChange={(e) =>
                  setFormData({ ...formData, pet_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Choose a pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} (
                    {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vaccine Type
              </label>
              <select
                value={formData.vaccine_type}
                onChange={(e) =>
                  setFormData({ ...formData, vaccine_type: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="core">Core Vaccine</option>
                <option value="non_core">Non-Core Vaccine</option>
                <option value="lifestyle">Lifestyle Vaccine</option>
                <option value="therapeutic">Therapeutic Vaccine</option>
              </select>
            </div>
          </div>

          {/* Vaccine Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vaccine Name *
              </label>
              <input
                type="text"
                value={formData.vaccine_name}
                onChange={(e) =>
                  setFormData({ ...formData, vaccine_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., DHPP, Rabies, Bordetella"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Vaccine manufacturer"
              />
            </div>
          </div>

          {/* Dates and Lot Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vaccination Date *
              </label>
              <input
                type="date"
                value={formData.vaccination_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vaccination_date: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.next_due_date}
                onChange={(e) =>
                  setFormData({ ...formData, next_due_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lot Number
              </label>
              <input
                type="text"
                value={formData.lot_number}
                onChange={(e) =>
                  setFormData({ ...formData, lot_number: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Vaccine lot number"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="General notes about this vaccination..."
            />
          </div>

          {/* Reaction Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reaction Notes
            </label>
            <textarea
              value={formData.reaction_notes}
              onChange={(e) =>
                setFormData({ ...formData, reaction_notes: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Any reactions or side effects observed..."
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all duration-200 shadow-lg shadow-green-600/20"
            >
              Add Vaccination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
