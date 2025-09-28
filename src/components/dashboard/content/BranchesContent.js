import React, { useState } from "react";
import { Plus, Edit, Trash2, Building, MapPin } from "lucide-react";

const BranchesContent = ({
  branches,
  loading,
  error,
  onCreateBranch,
  onEditBranch,
  onDeleteBranch
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = (branches || []).filter(
    (branch) =>
      branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.displayId || branch.branch_code)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branch_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Branch Management
          </h1>
          <p className="text-gray-600">
            Manage your veterinary clinic branches
          </p>
        </div>
        <button
          onClick={onCreateBranch}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Branches Grid */}
      {filteredBranches.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No branches found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "No branches match your search."
              : "Get started by adding your first branch."}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateBranch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Branch
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Branch Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {branch.branch_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {branch.displayId || branch.branch_code}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditBranch(branch)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit branch"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBranch(branch.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete branch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Branch Type */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    branch.branch_type === "main-branch"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {branch.branch_type === "main-branch"
                    ? "Main Branch"
                    : "Sub Branch"}
                </span>
              </div>

              {/* Branch Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Branch Location</span>
                </div>
                <div>
                  Created: {new Date(branch.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {(branches || []).length}
          </div>
          <div className="text-gray-600">Total Branches</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {(branches || []).filter((b) => b.branch_type === "main-branch").length}
          </div>
          <div className="text-gray-600">Main Branches</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {(branches || []).filter((b) => b.branch_type === "sub-branch").length}
          </div>
          <div className="text-gray-600">Sub Branches</div>
        </div>
      </div>
    </div>
  );
};

export default BranchesContent;
