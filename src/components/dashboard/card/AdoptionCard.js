import React from 'react';
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Settings,
  CalendarPlus
} from 'lucide-react';

const AdoptionCard = ({
  pet,
  userRole = "pet-owner",
  onApply,
  onFavorite,
  isFavorited = false,
  onEdit,
  onDelete,
  onManage,
  onBookAppointment
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'adopted':
        return 'bg-gray-100 text-gray-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgeDisplay = (age, ageCategory) => {
    if (age) return `${age} years old`;
    return ageCategory?.replace('_', '/') || 'Age unknown';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Pet Image */}
      <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200">
        {pet.image_url ? (
          <img
            src={pet.image_url}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart size={48} className="text-orange-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pet.status)}`}>
            {pet.status?.charAt(0).toUpperCase() + pet.status?.slice(1)}
          </span>
        </div>

        {/* Management Badge for Vet-owners */}
        {userRole === "vet-owner" && (
          <div className="absolute top-4 left-4 mt-8">
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
              Your Listing
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onFavorite(pet.id)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Heart
            size={20}
            className={isFavorited ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"}
          />
        </button>

        {/* Urgent Badge */}
        {pet.urgent && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
              Urgent
            </span>
          </div>
        )}
      </div>

      {/* Pet Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
            <p className="text-gray-600 text-sm">
              {pet.breed} • {getAgeDisplay(pet.age, pet.age_category)}
            </p>
          </div>
          {pet.adoption_fee && (
            <div className="text-right">
              <p className="text-lg font-bold text-orange-600">
                ${pet.adoption_fee}
              </p>
              <p className="text-xs text-gray-500">Adoption Fee</p>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {pet.size && (
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              {pet.size}
            </span>
          )}
          {pet.location && (
            <span className="flex items-center">
              <MapPin size={14} className="mr-1" />
              {pet.location}
            </span>
          )}
        </div>

        {/* Description */}
        {pet.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {pet.description}
          </p>
        )}

        {/* Special Traits */}
        {pet.good_with && pet.good_with.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Good with:</p>
            <div className="flex flex-wrap gap-1">
              {pet.good_with.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Energy Level */}
        {pet.energy_level && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Energy Level</span>
              <span className="text-orange-600 font-semibold capitalize">
                {pet.energy_level.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Vet-owner specific info */}
        {userRole === "vet-owner" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-700 space-y-1">
              {pet.listed_date && (
                <div className="flex justify-between">
                  <span>Listed:</span>
                  <span>{new Date(pet.listed_date).toLocaleDateString()}</span>
                </div>
              )}
              {pet.last_updated && (
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{new Date(pet.last_updated).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono">{pet.id.slice(-8)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          {userRole === "vet-owner" ? (
            // Vet-owner management buttons
            <>
              <button
                onClick={() => onEdit && onEdit(pet)}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => onManage && onManage(pet)}
                className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Settings size={16} />
                Manage
              </button>
              <button
                onClick={() => onDelete && onDelete(pet.id)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            // Pet-owner adoption buttons
            <>
              <button
                onClick={() => onApply(pet)}
                disabled={pet.status !== 'available'}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  pet.status === 'available'
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {pet.status === 'available' ? 'Apply to Adopt' : 'Not Available'}
              </button>

              <button
                onClick={() => onBookAppointment && onBookAppointment(pet)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                title="Book Appointment"
              >
                <CalendarPlus size={18} />
              </button>

              <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <MessageCircle size={18} className="text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Contact Info */}
        {pet.contact_info && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Contact:</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {pet.contact_info.phone && (
                <a
                  href={`tel:${pet.contact_info.phone}`}
                  className="flex items-center hover:text-orange-600 transition-colors"
                >
                  <Phone size={14} className="mr-1" />
                  {pet.contact_info.phone}
                </a>
              )}
              {pet.contact_info.email && (
                <a
                  href={`mailto:${pet.contact_info.email}`}
                  className="flex items-center hover:text-orange-600 transition-colors"
                >
                  <Mail size={14} className="mr-1" />
                  Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptionCard;