import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  MapPin,
  Users,
  Link,
} from "lucide-react";

const VeterinaryContent = ({
  veterinaryStaff,
  loading,
  error,
  onCreateStaff,
  onEditStaff,
  onDeleteStaff,
  onGenerateInvitation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredStaff = (veterinaryStaff || []).filter((staff) => {
    const matchesSearch =
      staff.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.displayId || staff.staff_code)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      staff.staff_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.branch_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || staff.staff_type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "accepted" && staff.invitation_accepted) ||
      (filterStatus === "pending" && !staff.invitation_accepted);

    return matchesSearch && matchesType && matchesStatus;
  });

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center p-8">
  //       <div className="text-gray-600">Loading veterinary staff...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Veterinary Staff Management
          </h1>
          <p className="text-gray-600">
            Manage veterinary residents and assistants
          </p>
        </div>
        <button
          onClick={onCreateStaff}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="resident">Residents</option>
          <option value="assistant">Assistants</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="accepted">Accepted</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No staff found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== "all" || filterStatus !== "all"
              ? "No staff match your filters."
              : "Get started by adding your first staff member."}
          </p>
          {!searchTerm && filterType === "all" && filterStatus === "all" && (
            <button
              onClick={onCreateStaff}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Staff Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      staff.staff_type === "resident"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <UserCheck
                      className={`w-5 h-5 ${
                        staff.staff_type === "resident"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {staff.staff_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {staff.displayId || staff.staff_code}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditStaff(staff)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit staff"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onGenerateInvitation(staff)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Generate invitation link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteStaff(staff.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Staff Type & Status */}
              <div className="mb-4 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    staff.staff_type === "resident"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {staff.staff_type === "resident" ? "Resident" : "Assistant"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    staff.invitation_accepted
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {staff.invitation_accepted ? "Accepted" : "Pending"}
                </span>
              </div>

              {/* Staff Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{staff.staff_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{staff.branch_name}</span>
                </div>
                <div>
                  Created: {new Date(staff.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {(veterinaryStaff || []).length}
          </div>
          <div className="text-gray-600">Total Staff</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {
              (veterinaryStaff || []).filter((s) => s.staff_type === "resident")
                .length
            }
          </div>
          <div className="text-gray-600">Residents</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {
              (veterinaryStaff || []).filter(
                (s) => s.staff_type === "assistant"
              ).length
            }
          </div>
          <div className="text-gray-600">Assistants</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {
              (veterinaryStaff || []).filter((s) => !s.invitation_accepted)
                .length
            }
          </div>
          <div className="text-gray-600">Pending Invitations</div>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryContent;
