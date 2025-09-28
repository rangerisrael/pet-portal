import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Camera
} from "lucide-react";
import { toast } from "react-toastify";
import useUserManagement from "@/hooks/useUserManagement";
import UserForm from "@/components/dashboard/forms/UserForm";

const UserManagementContent = ({ user }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const {
    users,
    filteredUsers,
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    sortOrder,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    uploadAvatar,
    setFilters,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    loadUsers,
    stats
  } = useUserManagement();

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      toast.success("User created successfully!");
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Error creating user: " + error.message);
    }
  };

  // Handle update user
  const handleUpdateUser = async (userData) => {
    try {
      if (userData.avatar_file && selectedUser) {
        await uploadAvatar(selectedUser.id, userData.avatar_file);
      }
      await updateUser(selectedUser.id, userData);
      toast.success("User updated successfully!");
      setShowEditForm(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Error updating user: " + error.message);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete.id);
      toast.success("User deleted successfully!");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Error deleting user: " + error.message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, currentStatus);
      const action = currentStatus === "active" ? "deactivated" : "activated";
      toast.success(`User ${action} successfully!`);
    } catch (error) {
      toast.error("Error updating user status: " + error.message);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role, staffType) => {
    // Use staff_type specific colors if available
    if (staffType) {
      const staffColors = {
        "resident": "bg-green-100 text-green-800",
        "assistant": "bg-blue-100 text-blue-800"
      };
      return staffColors[staffType] || "bg-purple-100 text-purple-800";
    }

    // Default role colors
    const colors = {
      "pet-owner": "bg-blue-100 text-blue-800",
      "veterinary": "bg-green-100 text-green-800",
      "vet-owner": "bg-purple-100 text-purple-800",
      "main-branch": "bg-orange-100 text-orange-800",
      "sub-branch": "bg-cyan-100 text-cyan-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  // Format role display text
  const formatRoleText = (role, staffType, branchInfo) => {
    if (staffType) {
      const branchText = branchInfo?.branch_name ? ` - ${branchInfo.branch_name}` : '';
      return `${staffType.charAt(0).toUpperCase() + staffType.slice(1)}${branchText}`;
    }
    return role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get status badge
  const getStatusBadge = (status, emailVerified) => {
    if (status === "inactive") {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    if (!emailVerified) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Unverified</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="pet-owner">Pet Owner</option>
              <option value="veterinary">Veterinary</option>
              <option value="vet-owner">Vet Owner</option>
              <option value="resident">Resident</option>
              <option value="assistant">Assistant</option>
              <option value="main-branch">Main Branch</option>
              <option value="sub-branch">Sub Branch</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.emailVerified === null ? "" : filters.emailVerified.toString()}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                emailVerified: e.target.value === "" ? null : e.target.value === "true"
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h3>
            <div className="flex items-center space-x-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="first_name-asc">Name A-Z</option>
                <option value="first_name-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="last_sign_in_at-desc">Last Login</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No users found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {userItem.avatar_url ? (
                            <img
                              src={userItem.avatar_url}
                              alt={`${userItem.first_name} ${userItem.last_name}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {userItem.email}
                          </div>
                          {userItem.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {userItem.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userItem.role, userItem.staff_type)}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {formatRoleText(userItem.role, userItem.staff_type, userItem.branch_info)}
                        </span>
                        {userItem.branch_info && userItem.branch_info.branch_name && (
                          <span className="text-xs text-gray-500 mt-1">
                            Branch: {userItem.branch_info.branch_name}
                            {!userItem.branch_info.invitation_accepted && (
                              <span className="text-orange-500 ml-1">(Pending)</span>
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(userItem.status, userItem.email_verified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(userItem.last_sign_in_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userItem.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowEditForm(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(userItem.id, userItem.status)}
                          className={`p-1 rounded ${
                            userItem.status === "active"
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={userItem.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {userItem.status === "active" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(userItem);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create User Form */}
      {showCreateForm && (
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateForm(false)}
          loading={loading}
        />
      )}

      {/* Edit User Form */}
      {showEditForm && selectedUser && (
        <UserForm
          user={selectedUser}
          onSubmit={handleUpdateUser}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedUser(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
              This will permanently remove their account and all associated data.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementContent;