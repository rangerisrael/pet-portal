import {
  Edit,
  Heart,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  Users,
  Search,
  Filter,
  X,
  Building,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuthUsers } from "@/hooks/useAuthUsers";
import DatabaseDebug from "../../debug/DatabaseDebug";

// Simplified versions of other content components for space
const PetContent = ({
  pets,
  setShowCreateForm,
  setSelectedPet,
  setShowPetForm,
  setShowEditPetForm,
  deletePet,
  userRole,
}) => {
  // Get registered users data
  const { users: registeredUsers = [], loading: usersLoading } = useAuthUsers();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique species and owners for filter options
  const uniqueSpecies = [...new Set(pets?.map((pet) => pet.species) || [])];
  const uniqueOwners = [
    ...new Set(pets?.map((pet) => pet.owner_name).filter(Boolean) || []),
  ];

  // Filter pets based on search and filters
  const filteredPets =
    pets?.filter((pet) => {
      const matchesSearch =
        !searchTerm ||
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.owner_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies = !speciesFilter || pet.species === speciesFilter;
      const matchesOwner = !ownerFilter || pet.owner_name === ownerFilter;

      return matchesSearch && matchesSpecies && matchesOwner;
    }) || [];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSpeciesFilter("");
    setOwnerFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Database Debug Info */}
      {/* <DatabaseDebug /> */}

      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Pet Registry</h3>
          <p className="text-gray-600">
            View all registered pets and their owner information
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Heart size={16} className="text-orange-500" />
              <span>
                {filteredPets.length} of {pets?.length || 0} Pets
              </span>
            </div>
            {(searchTerm || speciesFilter || ownerFilter) && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Filter size={16} />
                <span>Filtered</span>
                <button
                  onClick={clearFilters}
                  className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowPetForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/20"
        >
          <Plus size={18} />
          <span>Add New Pet</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search pets by name, breed, owner name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters || speciesFilter || ownerFilter
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            {(speciesFilter || ownerFilter) && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {[speciesFilter, ownerFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Species Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Species</option>
                  {uniqueSpecies.map((species) => (
                    <option key={species} value={species}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner
                </label>
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Owners</option>
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registered Users Section */}
      {/* {registeredUsers && registeredUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users size={20} className="mr-2 text-blue-600" />
              Registered Users ({registeredUsers.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.full_name ||
                        `${user.first_name} ${user.last_name}` ||
                        "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                        {user.role || "pet-owner"}
                      </span>
                      {user.phone && (
                        <span className="text-xs text-gray-500">
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
      {pets?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No pets added yet</p>
          <p className="mb-6">
            Add your first pet to start booking appointments
          </p>
          <button
            onClick={() => setShowPetForm(true)}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20"
          >
            <Plus size={18} className="inline mr-2" />
            Add Your First Pet
          </button>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Filter size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No pets match your filters</p>
          <p className="mb-6">
            Try adjusting your search terms or clearing the filters
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-all duration-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Pet Image */}
              <div className="mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl overflow-hidden relative">
                  {pet.image_url ? (
                    <Image
                      src={pet.image_url}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart size={48} className="text-orange-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {pet.name}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                    {pet.breed && ` • ${pet.breed}`}
                  </p>
                </div>
              </div>

              {/* Registered Owner Information */}
              {!userRole.includes("pet-owner") && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User size={16} className="text-green-600 mr-2" />
                      <span className="text-sm font-semibold text-green-800">
                        Registered Owner
                      </span>
                    </div>
                    {pet.owner_role && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                        {pet.owner_role}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {pet.owner_name || "Unknown Owner"}
                      </span>
                    </div>
                    {pet.owner_email && pet.owner_email !== "No email" && (
                      <div className="flex items-center">
                        <Mail size={12} className="mr-1" />
                        <span>{pet.owner_email}</span>
                        <span className="text-xs text-green-600 ml-2">
                          (@{pet.owner_email.split("@")[0]})
                        </span>
                      </div>
                    )}
                    {pet.owner_phone && pet.owner_phone !== "No phone" && (
                      <div className="flex items-center">
                        <Phone size={12} className="mr-1" />
                        <span>{pet.owner_phone}</span>
                      </div>
                    )}
                    {pet.owner_preferred_clinicName && (
                      <div className="flex items-center">
                        <Building size={12} className="mr-1" />
                        <span>{pet.owner_preferred_clinicName}</span>
                      </div>
                    )}
                    {pet.owner_registered && (
                      <div className="flex items-center text-xs text-green-600">
                        <span>
                          Registered:{" "}
                          {new Date(pet.owner_registered).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {(pet.age_years || pet.age_months) && (
                  <p>
                    <strong>Age:</strong>
                    {pet.age_years ? `${pet.age_years} years` : ""}
                    {pet.age_years && pet.age_months ? " " : ""}
                    {pet.age_months ? `${pet.age_months} months` : ""}
                  </p>
                )}
                {pet.gender && pet.gender !== "unknown" && (
                  <p>
                    <strong>Gender:</strong>{" "}
                    {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                  </p>
                )}
                {pet.weight_kg && (
                  <p>
                    <strong>Weight:</strong> {pet.weight_kg} kg
                  </p>
                )}
                {pet.color && (
                  <p>
                    <strong>Color:</strong> {pet.color}
                  </p>
                )}
              </div>

              {pet.medical_notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Medical Notes:</strong> {pet.medical_notes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-4 mt-4 border-t border-gray-100">
                {userRole.includes("pet-owner") && (
                  <button
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowCreateForm(true);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPet(pet);
                    setShowEditPetForm(true);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit size={14} className="inline mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => deletePet(pet.id)}
                  className="px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-2" />
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

export default PetContent;
