import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

const AdoptionPetForm = ({
  pet = null,
  onSubmit,
  onCancel,
  shelterBranches = [],
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    ageCategory: 'adult',
    size: 'medium',
    gender: 'male',
    description: '',
    imageUrl: '',
    adoptionFee: '',
    location: '',
    energyLevel: 'moderate',
    goodWith: [],
    vaccinated: false,
    microchipped: false,
    spayedNeutered: false,
    specialNeeds: false,
    specialNeedsDescription: '',
    urgent: false,
    urgentReason: '',
    medicalHistory: '',
    behavioralNotes: '',
    contactPhone: '',
    contactEmail: '',
    shelterId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || 'dog',
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        ageCategory: pet.age_category || 'adult',
        size: pet.size || 'medium',
        gender: pet.gender || 'male',
        description: pet.description || '',
        imageUrl: pet.image_url || '',
        adoptionFee: pet.adoption_fee?.toString() || '',
        location: pet.location || '',
        energyLevel: pet.energy_level || 'moderate',
        goodWith: pet.good_with || [],
        vaccinated: pet.vaccinated || false,
        microchipped: pet.microchipped || false,
        spayedNeutered: pet.spayed_neutered || false,
        specialNeeds: pet.special_needs || false,
        specialNeedsDescription: pet.special_needs_description || '',
        urgent: pet.urgent || false,
        urgentReason: pet.urgent_reason || '',
        medicalHistory: pet.medical_history || '',
        behavioralNotes: pet.behavioral_notes || '',
        contactPhone: pet.contact_phone || '',
        contactEmail: pet.contact_email || '',
        shelterId: pet.shelter_id || ''
      });
    }
  }, [pet]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.age || formData.age < 0) newErrors.age = 'Valid age is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.adoptionFee || formData.adoptionFee < 0) newErrors.adoptionFee = 'Valid adoption fee is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';

    if (formData.specialNeeds && !formData.specialNeedsDescription.trim()) {
      newErrors.specialNeedsDescription = 'Special needs description is required';
    }

    if (formData.urgent && !formData.urgentReason.trim()) {
      newErrors.urgentReason = 'Urgent reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        age: parseInt(formData.age),
        adoptionFee: parseFloat(formData.adoptionFee) || 0
      };
      onSubmit(submissionData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleTraitToggle = (trait) => {
    setFormData(prev => ({
      ...prev,
      goodWith: prev.goodWith.includes(trait)
        ? prev.goodWith.filter(t => t !== trait)
        : [...prev.goodWith, trait]
    }));
  };

  const speciesOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'rabbit', label: 'Rabbit' },
    { value: 'other', label: 'Other' }
  ];

  const ageCategoryOptions = [
    { value: 'puppy_kitten', label: 'Puppy/Kitten' },
    { value: 'young', label: 'Young' },
    { value: 'adult', label: 'Adult' },
    { value: 'senior', label: 'Senior' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra_large', label: 'Extra Large' }
  ];

  const energyLevelOptions = [
    { value: 'very_low', label: 'Very Low' },
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' }
  ];

  const goodWithOptions = [
    'children',
    'dogs',
    'cats',
    'seniors',
    'other_pets'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {pet ? 'Edit Pet' : 'Add New Pet for Adoption'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter pet's name"
              />
              {errors.name && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species *
              </label>
              <select
                value={formData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {speciesOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed *
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.breed ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter breed"
              />
              {errors.breed && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.breed}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years) *
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter age"
              />
              {errors.age && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.age}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Category
              </label>
              <select
                value={formData.ageCategory}
                onChange={(e) => handleInputChange('ageCategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {ageCategoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {sizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level
              </label>
              <select
                value={formData.energyLevel}
                onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {energyLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the pet's personality, behavior, and what makes them special..."
            />
            {errors.description && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Image and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com/pet-photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adoption Fee ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.adoptionFee}
                onChange={(e) => handleInputChange('adoptionFee', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.adoptionFee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.adoptionFee && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.adoptionFee}
                </div>
              )}
            </div>
          </div>

          {/* Good With */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Good With
            </label>
            <div className="flex flex-wrap gap-3">
              {goodWithOptions.map(trait => (
                <label key={trait} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.goodWith.includes(trait)}
                    onChange={() => handleTraitToggle(trait)}
                    className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {trait.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Health Status
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vaccinated}
                  onChange={(e) => handleInputChange('vaccinated', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Vaccinated</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.microchipped}
                  onChange={(e) => handleInputChange('microchipped', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Microchipped</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.spayedNeutered}
                  onChange={(e) => handleInputChange('spayedNeutered', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Spayed/Neutered</span>
              </label>
            </div>
          </div>

          {/* Special Needs */}
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.specialNeeds}
                onChange={(e) => handleInputChange('specialNeeds', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Special Needs</span>
            </label>

            {formData.specialNeeds && (
              <textarea
                value={formData.specialNeedsDescription}
                onChange={(e) => handleInputChange('specialNeedsDescription', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.specialNeedsDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the special needs..."
              />
            )}
            {errors.specialNeedsDescription && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.specialNeedsDescription}
              </div>
            )}
          </div>

          {/* Urgent */}
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.urgent}
                onChange={(e) => handleInputChange('urgent', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Urgent Adoption Needed</span>
            </label>

            {formData.urgent && (
              <textarea
                value={formData.urgentReason}
                onChange={(e) => handleInputChange('urgentReason', e.target.value)}
                rows={2}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.urgentReason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explain why urgent adoption is needed..."
              />
            )}
            {errors.urgentReason && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                {errors.urgentReason}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Any relevant medical history..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Behavioral Notes
              </label>
              <textarea
                value={formData.behavioralNotes}
                onChange={(e) => handleInputChange('behavioralNotes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Behavioral notes, training status, etc..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.contactPhone && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.contactPhone}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="contact@shelter.org"
              />
              {errors.contactEmail && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.contactEmail}
                </div>
              )}
            </div>
          </div>

          {/* Location and Shelter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="City, State"
              />
            </div>

            {shelterBranches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelter Branch
                </label>
                <select
                  value={formData.shelterId}
                  onChange={(e) => handleInputChange('shelterId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a branch</option>
                  {shelterBranches.map(branch => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (pet ? 'Update Pet' : 'Add Pet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionPetForm;