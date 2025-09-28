import { XCircle, Upload, Camera, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from 'react-toastify';
import Image from 'next/image';

// Pet Form Component
export function PetForm({ onSubmit, onCancel, pet = null, isEdit = false }) {
  const [localFormData, setLocalFormData] = useState({
    name: pet?.name || "",
    species: pet?.species || "dog",
    breed: pet?.breed || "",
    age_years: pet?.age_years || "",
    age_months: pet?.age_months || "",
    gender: pet?.gender || "unknown",
    weight_kg: pet?.weight_kg || "",
    color: pet?.color || "",
    medical_notes: pet?.medical_notes || "",
    emergency_contact_name: pet?.emergency_contact_name || "",
    emergency_contact_phone: pet?.emergency_contact_phone || "",
    image_url: pet?.image_url || "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(pet?.image_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('petId', pet?.id || 'temp-' + Date.now());

      const response = await fetch('/api/upload/pet-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localFormData.name || !localFormData.species) {
      toast.error("Please fill in required fields (Name and Species)");
      return;
    }

    let finalFormData = { ...localFormData };

    // Upload image if a new one was selected
    if (imageFile) {
      const uploadedImageUrl = await handleImageUpload(imageFile);
      if (uploadedImageUrl) {
        finalFormData.image_url = uploadedImageUrl;
      }
    }

    onSubmit(finalFormData);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image file must be smaller than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setLocalFormData({ ...localFormData, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const speciesOptions = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "rabbit", label: "Rabbit" },
    { value: "hamster", label: "Hamster" },
    { value: "guinea_pig", label: "Guinea Pig" },
    { value: "ferret", label: "Ferret" },
    { value: "reptile", label: "Reptile" },
    { value: "fish", label: "Fish" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Pet" : "Add New Pet"}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-gray-50 space-y-6">
          {/* Pet Image Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Pet Photo
            </h4>
            <div className="flex flex-col items-center space-y-4">
              {/* Image Preview */}
              <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="Pet preview"
                      fill
                      className="object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No image selected</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                >
                  <Upload size={16} />
                  <span>{uploadingImage ? 'Uploading...' : 'Select Image'}</span>
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Supported formats: JPEG, PNG, WebP • Max size: 5MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={localFormData.name}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter pet's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Species *
                </label>
                <select
                  value={localFormData.species}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      species: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  required
                >
                  {speciesOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Breed and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  value={localFormData.breed}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      breed: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter breed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={localFormData.gender}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      gender: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Age and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={localFormData.age_years}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      age_years: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Years"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={localFormData.age_months}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      age_months: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Months"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={localFormData.weight_kg}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      weight_kg: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Weight"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color/Markings
              </label>
              <input
                type="text"
                value={localFormData.color}
                onChange={(e) =>
                  setLocalFormData({
                    ...localFormData,
                    color: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Describe pet's color and markings"
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={localFormData.emergency_contact_name}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      emergency_contact_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={localFormData.emergency_contact_phone}
                  onChange={(e) =>
                    setLocalFormData({
                      ...localFormData,
                      emergency_contact_phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">
              Medical Information
            </h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medical Notes
              </label>
              <textarea
                value={localFormData.medical_notes}
                onChange={(e) =>
                  setLocalFormData({
                    ...localFormData,
                    medical_notes: e.target.value,
                  })
                }
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                placeholder="Any medical conditions, allergies, or special notes..."
              />
            </div>
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
              disabled={uploadingImage}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:bg-gray-400 font-semibold transition-all duration-200 shadow-lg shadow-orange-600/20"
            >
              {uploadingImage ? 'Uploading...' : (isEdit ? "Update Pet" : "Add Pet")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
