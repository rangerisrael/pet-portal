import { FileText, Heart, Plus } from "lucide-react";

const MedicalRecordsContent = ({
  pets,
  medicalRecords,
  vaccinations,
  setShowVaccinationForm,
  setShowMedicalRecordForm,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Medical Records</h3>
        <p className="text-gray-600">
          View your pets' complete medical history and vaccination records
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowVaccinationForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-lg shadow-green-600/20 transition-all duration-200"
        >
          <Plus size={16} />
          <span>Add Vaccination</span>
        </button>
        <button
          onClick={() => setShowMedicalRecordForm(true)}
          className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/20 transition-all duration-200"
        >
          <Plus size={16} />
          <span>Add Medical Record</span>
        </button>
      </div>
    </div>

    {/* Pet Selection Filter */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Filter by Pet
      </h4>
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">
          All Pets
        </button>
        {pets?.map((pet) => (
          <button
            key={pet.id}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {pet.name}
          </button>
        ))}
      </div>
    </div>

    {/* Medical History Section */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText size={20} className="mr-2 text-orange-600" />
          Medical History
        </h4>
      </div>

      {medicalRecords?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No medical records found</p>
          <p>Medical records will appear here after veterinary visits.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {medicalRecords?.map((record) => (
            <div
              key={record.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      {record.pet_name} -{" "}
                      {record.record_type
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {new Date(record.record_date).toLocaleDateString()}
                      {record.vet_first_name && (
                        <span>
                          {" "}
                          • Dr. {record.vet_first_name} {record.vet_last_name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    record.record_type === "emergency"
                      ? "bg-red-100 text-red-800"
                      : record.record_type === "vaccination"
                      ? "bg-green-100 text-green-800"
                      : record.record_type === "surgery"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {record.record_type
                    ?.replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {record.chief_complaint && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Chief Complaint:
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.chief_complaint}
                    </p>
                  </div>
                )}
                {record.diagnosis && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Diagnosis:
                    </p>
                    <p className="text-sm text-gray-600">{record.diagnosis}</p>
                  </div>
                )}
                {record.treatment_provided && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Treatment:
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.treatment_provided}
                    </p>
                  </div>
                )}
                {record.medications_prescribed && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Medications:
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.medications_prescribed}
                    </p>
                  </div>
                )}
              </div>

              {record.recommendations && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Recommendations:
                  </p>
                  <p className="text-sm text-blue-700">
                    {record.recommendations}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Vaccination History Section */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Heart size={20} className="mr-2 text-green-600" />
          Vaccination History
        </h4>
      </div>

      {vaccinations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">
            No vaccination records found
          </p>
          <p>Vaccination history will appear here after immunizations.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pet
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Vaccine
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date Given
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Next Due
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vaccinations?.map((vaccination) => {
                const pet = pets.find((p) => p.id === vaccination.pet_id);
                const isOverdue =
                  vaccination.next_due_date &&
                  new Date(vaccination.next_due_date) < new Date();
                const isDueSoon =
                  vaccination.next_due_date &&
                  new Date(vaccination.next_due_date) <
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr
                    key={vaccination.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart size={14} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {pet?.name || "Unknown Pet"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {vaccination.vaccine_name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {vaccination.vaccine_type?.replace("_", " ")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(
                        vaccination.vaccination_date
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {vaccination.next_due_date
                        ? new Date(
                            vaccination.next_due_date
                          ).toLocaleDateString()
                        : "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isOverdue
                            ? "bg-red-100 text-red-800"
                            : isDueSoon
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isOverdue
                          ? "Overdue"
                          : isDueSoon
                          ? "Due Soon"
                          : "Current"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default MedicalRecordsContent;
