import React, { useState } from 'react';
import { X, Save, FileText, Users, Home, Shield } from 'lucide-react';

const AdoptionApplicationForm = ({ pet, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',

    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    residenceType: 'house', // house, apartment, condo, other
    ownOrRent: 'own', // own, rent
    landlordContact: '',

    // Household Information
    householdMembers: '',
    childrenAges: '',
    hasAllergies: false,
    allergyDetails: '',

    // Pet Experience
    previousPets: true,
    currentPets: '',
    petExperience: '',
    veterinarianContact: '',

    // Pet Care Plans
    exercisePlan: '',
    workSchedule: '',
    vacationPlans: '',
    budgetForPetCare: '',

    // Housing & Safety
    hasYard: false,
    yardFenced: false,
    indoorOutdoor: 'both', // indoor, outdoor, both
    petProofing: '',

    // Specific Questions
    whyAdopt: '',
    expectations: '',
    returnPolicy: false,

    // References
    personalReference1: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    personalReference2: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },

    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },

    // Agreement
    agreesToTerms: false,
    agreesToHomeVisit: false,
    understandsCommitment: false
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        petId: pet.id,
        petName: pet.name,
        applicationDate: new Date().toISOString(),
        status: 'submitted'
      });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const isFormValid = () => {
    const required = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode',
      'whyAdopt', 'exercisePlan', 'workSchedule'
    ];

    return required.every(field => formData[field]?.trim()) &&
           formData.agreesToTerms &&
           formData.understandsCommitment;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Adoption Application
              </h2>
              <p className="text-gray-600">
                Application for <span className="font-semibold text-orange-600">{pet.name}</span>
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Housing Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Housing Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Residence Type
                </label>
                <select
                  value={formData.residenceType}
                  onChange={(e) => handleInputChange('residenceType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do you own or rent?
                </label>
                <select
                  value={formData.ownOrRent}
                  onChange={(e) => handleInputChange('ownOrRent', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="own">Own</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasYard}
                  onChange={(e) => handleInputChange('hasYard', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">I have a yard</span>
              </label>

              {formData.hasYard && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.yardFenced}
                    onChange={(e) => handleInputChange('yardFenced', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yard is fenced</span>
                </label>
              )}
            </div>
          </div>

          {/* Pet Experience */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Pet Experience & Care</h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why do you want to adopt {pet.name}? *
              </label>
              <textarea
                value={formData.whyAdopt}
                onChange={(e) => handleInputChange('whyAdopt', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Please explain your motivation for adoption..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Plan *
              </label>
              <textarea
                value={formData.exercisePlan}
                onChange={(e) => handleInputChange('exercisePlan', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="How will you ensure this pet gets adequate exercise?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Schedule *
              </label>
              <textarea
                value={formData.workSchedule}
                onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your typical work schedule and how you'll care for the pet..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Pet Experience
              </label>
              <textarea
                value={formData.petExperience}
                onChange={(e) => handleInputChange('petExperience', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Please describe your experience with pets..."
              />
            </div>
          </div>

          {/* References */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">References</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Personal Reference 1</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.personalReference1.name}
                    onChange={(e) => handleInputChange('personalReference1.name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={formData.personalReference1.relationship}
                    onChange={(e) => handleInputChange('personalReference1.relationship', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.personalReference1.phone}
                    onChange={(e) => handleInputChange('personalReference1.phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Personal Reference 2</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.personalReference2.name}
                    onChange={(e) => handleInputChange('personalReference2.name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={formData.personalReference2.relationship}
                    onChange={(e) => handleInputChange('personalReference2.relationship', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.personalReference2.phone}
                    onChange={(e) => handleInputChange('personalReference2.phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="space-y-4 p-6 bg-orange-50 rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900">Agreement & Consent</h3>

            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreesToTerms}
                  onChange={(e) => handleInputChange('agreesToTerms', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
                  required
                />
                <span className="ml-3 text-sm text-gray-700">
                  I agree to the adoption terms and conditions, including the adoption fee and return policy. *
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreesToHomeVisit}
                  onChange={(e) => handleInputChange('agreesToHomeVisit', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I agree to a home visit if required as part of the adoption process.
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.understandsCommitment}
                  onChange={(e) => handleInputChange('understandsCommitment', e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
                  required
                />
                <span className="ml-3 text-sm text-gray-700">
                  I understand that pet adoption is a long-term commitment and I am prepared for the responsibility. *
                </span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
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
              disabled={!isFormValid()}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isFormValid()
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={18} />
              <span>Submit Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionApplicationForm;