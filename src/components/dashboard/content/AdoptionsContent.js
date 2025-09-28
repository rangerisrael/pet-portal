import React, { useState } from "react";
import {
  Plus,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  Heart,
  Users,
  Clock,
  AlertTriangle,
  Star,
  CheckCircle,
  X,
} from "lucide-react";
import AdoptionApplicationForm from "../forms/AdoptionApplicationForm";
import AdoptionCard from "../card/AdoptionCard";
import AdoptionFilters from "@/components/ui/AdoptionFilters";
import AdoptionPetForm from "../forms/AdoptionPetForm";
import useAdoptions from "@/hooks/useAdoptions";
import useBranches from "@/hooks/useBranches";
import { toast } from "react-toastify";

const AdoptionsContent = ({
  userRole = "pet-owner",
  user = null,
  profile = null,
  filteredPets = [],
  loading = false,
  error = null,
  filters = {},
  searchTerm = "",
  sortBy = "newest",
  stats = {},
  toggleFavorite = () => {},
  submitApplication = () => {},
  updateFilter = () => {},
  clearFilters = () => {},
  setSearchTerm = () => {},
  setSortBy = () => {},
  isFavorited = () => false,
  createAdoptionPet = () => {},
  updateAdoptionPet = () => {},
  deleteAdoptionPet = () => {},
  updatePetStatus = () => {},
  reviewApplication = () => {},
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedPet, setSelectedPet] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Vet-owner specific state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [petToManage, setPetToManage] = useState(null);

  // Get branches for vet-owner
  const { branches } = useBranches(user) || { branches: [] };

  const handleApplyToPet = (pet) => {
    setSelectedPet(pet);
    setShowApplicationForm(true);
  };

  const handleBookAppointment = (pet) => {
    // For now, show a notification - in a real app this would open appointment booking
    toast.info(`Booking appointment for ${pet.name}. This feature will redirect to appointment booking.`);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      await submitApplication(applicationData);
      setShowApplicationForm(false);
      setSelectedPet(null);
      // Show success message
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  // Vet-owner handlers
  const handleCreatePet = async (petData) => {
    try {
      await createAdoptionPet(petData);
      setShowCreateForm(false);
      toast.success("Pet added to adoption listings successfully!");
    } catch (error) {
      toast.error("Failed to add pet. Please try again.");
    }
  };

  const handleEditPet = (pet) => {
    setPetToEdit(pet);
    setShowEditForm(true);
  };

  const handleUpdatePet = async (petData) => {
    try {
      await updateAdoptionPet(petToEdit.id, petData);
      setShowEditForm(false);
      setPetToEdit(null);
      toast.success("Pet updated successfully!");
    } catch (error) {
      toast.error("Failed to update pet. Please try again.");
    }
  };

  const handleDeletePet = async (petId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this pet from adoption listings?"
      )
    ) {
      try {
        await deleteAdoptionPet(petId);
        toast.success("Pet removed from listings successfully!");
      } catch (error) {
        toast.error("Failed to remove pet. Please try again.");
      }
    }
  };

  const handleManagePet = (pet) => {
    setPetToManage(pet);
    setShowManageModal(true);
  };

  const handleStatusChange = async (petId, newStatus, adoptedBy = null) => {
    try {
      await updatePetStatus(petId, newStatus, adoptedBy);
      setShowManageModal(false);
      setPetToManage(null);
      toast.success(`Pet status updated to ${newStatus}!`);
    } catch (error) {
      toast.error("Failed to update pet status. Please try again.");
    }
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "name_az", label: "Name: A to Z" },
    { value: "name_za", label: "Name: Z to A" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading adoption listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {userRole === "vet-owner"
              ? "Manage Pet Adoptions"
              : "Pet Adoptions"}
          </h3>
          <p className="text-gray-600 mt-1">
            {userRole === "vet-owner"
              ? `Manage your adoption listings - ${filteredPets.length} pets listed`
              : `Find your perfect companion - ${filteredPets.length} pets available`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {userRole === "vet-owner" && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-all duration-200"
            >
              <Plus size={18} />
              <span>Add Pet</span>
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              showFilters
                ? "bg-orange-100 text-orange-700 border border-orange-300"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>

          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-orange-100 text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-orange-100 text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalPets}
          </div>
          <div className="text-sm text-gray-600">Total Pets</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.available}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          <div className="text-sm text-gray-600">Urgent</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {stats.favorites}
          </div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.myApplications}
          </div>
          <div className="text-sm text-gray-600">My Apps</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {stats.adopted}
          </div>
          <div className="text-sm text-gray-600">Adopted</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <AdoptionFilters
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SortAsc size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredPets.length} of {stats.totalPets} pets
        </div>
      </div>

      {/* Pet Listings */}
      {filteredPets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <Heart size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pets found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or clearing filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredPets.map((pet) => (
            <AdoptionCard
              key={pet.id}
              pet={pet}
              userRole={userRole}
              onApply={handleApplyToPet}
              onFavorite={toggleFavorite}
              isFavorited={isFavorited(pet.id)}
              onEdit={userRole === "vet-owner" ? handleEditPet : undefined}
              onDelete={userRole === "vet-owner" ? handleDeletePet : undefined}
              onManage={userRole === "vet-owner" ? handleManagePet : undefined}
              onBookAppointment={userRole === "pet-owner" ? handleBookAppointment : undefined}
            />
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredPets.length > 0 && (
        <div className="text-center pt-8">
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200">
            Load More Pets
          </button>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedPet && (
        <AdoptionApplicationForm
          pet={selectedPet}
          onSubmit={handleSubmitApplication}
          onCancel={() => {
            setShowApplicationForm(false);
            setSelectedPet(null);
          }}
        />
      )}

      {/* Vet-Owner Modals */}
      {userRole === "vet-owner" && (
        <>
          {/* Create Pet Form */}
          {showCreateForm && (
            <AdoptionPetForm
              onSubmit={handleCreatePet}
              onCancel={() => setShowCreateForm(false)}
              shelterBranches={branches}
            />
          )}

          {/* Edit Pet Form */}
          {showEditForm && petToEdit && (
            <AdoptionPetForm
              pet={petToEdit}
              onSubmit={handleUpdatePet}
              onCancel={() => {
                setShowEditForm(false);
                setPetToEdit(null);
              }}
              shelterBranches={branches}
            />
          )}

          {/* Manage Pet Modal */}
          {showManageModal && petToManage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Manage {petToManage.name}
                    </h2>
                    <button
                      onClick={() => {
                        setShowManageModal(false);
                        setPetToManage(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Pet Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-4">
                        {petToManage.image_url && (
                          <img
                            src={petToManage.image_url}
                            alt={petToManage.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {petToManage.name}
                          </h3>
                          <p className="text-gray-600">
                            {petToManage.breed} • {petToManage.age} years old
                          </p>
                          <p className="text-sm text-gray-500">
                            Current Status:{" "}
                            <span className="font-medium capitalize">
                              {petToManage.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Update Status
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            handleStatusChange(petToManage.id, "available")
                          }
                          className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
                        >
                          Mark Available
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(petToManage.id, "pending")
                          }
                          className="px-4 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-medium transition-colors"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(petToManage.id, "adopted")
                          }
                          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
                        >
                          Mark Adopted
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(petToManage.id, "on_hold")
                          }
                          className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
                        >
                          Put On Hold
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                      </h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setShowManageModal(false);
                            handleEditPet(petToManage);
                          }}
                          className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors text-left"
                        >
                          Edit Pet Details
                        </button>
                        <button
                          onClick={() => {
                            setShowManageModal(false);
                            handleDeletePet(petToManage.id);
                          }}
                          className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors text-left"
                        >
                          Remove from Listings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdoptionsContent;
