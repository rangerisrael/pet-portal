import { User, Mail, Phone, Calendar, Users, Edit, Trash2, Plus } from "lucide-react";

const PetOwnerContent = ({
  petOwners,
  loading,
  error,
  onAddOwner,
  onEditOwner,
  onDeleteOwner
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Pet Owners Registry</h3>
            <p className="text-gray-600">Loading registered pet owners...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Pet Owners Registry</h3>
          <p className="text-gray-600">
            View all registered pet owners and their information
          </p>
          {error && (
            <p className="text-orange-600 text-sm mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-800 rounded-xl">
            <Users size={18} />
            <span className="font-semibold">{petOwners?.length || 0} Registered</span>
          </div>
          <button
            onClick={onAddOwner}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/20"
          >
            <Plus size={18} />
            <span>Add New Owner</span>
          </button>
        </div>
      </div>

      {petOwners?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No pet owners found</p>
          <p className="mb-6">No registered pet owners in the system yet</p>
          <button
            onClick={onAddOwner}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20"
          >
            <Plus size={18} className="inline mr-2" />
            Add Your First Owner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {petOwners?.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Owner Avatar */}
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto">
                  <User size={24} className="text-orange-600" />
                </div>
              </div>

              {/* Owner Information */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {owner.full_name || owner.first_name + ' ' + owner.last_name || 'Unknown Name'}
                </h3>
                <p className="text-gray-600 font-medium capitalize">
                  {owner.role || 'pet-owner'}
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-2 text-gray-400" />
                  <span className="truncate">{owner.email}</span>
                </div>

                {owner.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="mr-2 text-gray-400" />
                    <span>{owner.phone}</span>
                  </div>
                )}

                {owner.created_at && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2 text-gray-400" />
                    <span>Joined {new Date(owner.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Username/ID Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Username/ID</div>
                <div className="text-sm font-mono text-gray-700 break-all">
                  {owner.email.split('@')[0]}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 mt-4 border-t border-gray-100">
                <button className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                  View Pets
                </button>
                <button
                  onClick={() => onEditOwner(owner)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit size={14} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDeleteOwner(owner.id)}
                  className="px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetOwnerContent;