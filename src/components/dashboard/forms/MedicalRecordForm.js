import { toast } from 'react-toastify';

// Medical Record Form Component
const MedicalRecordForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    pet_id: "",
    record_date: new Date().toISOString().split("T")[0],
    record_type: "other",
    chief_complaint: "",
    examination_findings: "",
    diagnosis: "",
    treatment_provided: "",
    medications_prescribed: "",
    recommendations: "",
    veterinarian_notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.record_type) {
      toast.error("Please fill in required fields");
      return;
    }
    onSubmit(formData);
  };

  const recordTypes = [
    { value: "examination", label: "General Examination" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" },
    { value: "medication", label: "Medication" },
    { value: "laboratory", label: "Laboratory Test" },
    { value: "diagnostic_imaging", label: "Diagnostic Imaging" },
    { value: "dental", label: "Dental Care" },
    { value: "emergency", label: "Emergency" },
    { value: "behavioral", label: "Behavioral" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              Add Medical Record
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
                Date *
              </label>
              <input
                type="date"
                value={formData.record_date}
                onChange={(e) =>
                  setFormData({ ...formData, record_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Record Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Record Type *
            </label>
            <select
              value={formData.record_type}
              onChange={(e) =>
                setFormData({ ...formData, record_type: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chief Complaint / Reason for Visit
            </label>
            <textarea
              value={formData.chief_complaint}
              onChange={(e) =>
                setFormData({ ...formData, chief_complaint: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="What brought you to the vet today?"
            />
          </div>

          {/* Examination Findings */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Examination Findings
            </label>
            <textarea
              value={formData.examination_findings}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  examination_findings: e.target.value,
                })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Physical examination findings..."
            />
          </div>

          {/* Diagnosis and Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Veterinary diagnosis..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Provided
              </label>
              <textarea
                value={formData.treatment_provided}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    treatment_provided: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Treatments given..."
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medications Prescribed
            </label>
            <textarea
              value={formData.medications_prescribed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medications_prescribed: e.target.value,
                })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Medications, dosages, and instructions..."
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recommendations & Follow-up
            </label>
            <textarea
              value={formData.recommendations}
              onChange={(e) =>
                setFormData({ ...formData, recommendations: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Care recommendations and follow-up instructions..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.veterinarian_notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  veterinarian_notes: e.target.value,
                })
              }
              rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Any additional notes or observations..."
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
              Add Medical Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
