import React from 'react';
import { Heart, Edit, Trash2, Plus } from 'lucide-react';

const PetCard = ({ 
  pet, 
  onBookAppointment, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          <p className="text-gray-600 font-medium">
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
            {pet.breed && ` • ${pet.breed}`}
          </p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Heart size={20} className="text-orange-600" />
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {(pet.age_years || pet.age_months) && (
          <p>
            <strong>Age:</strong> 
            {pet.age_years ? `${pet.age_years} years` : ''}
            {pet.age_years && pet.age_months ? ' ' : ''}
            {pet.age_months ? `${pet.age_months} months` : ''}
          </p>
        )}
        {pet.gender && pet.gender !== 'unknown' && (
          <p><strong>Gender:</strong> {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}</p>
        )}
        {pet.weight_kg && (
          <p><strong>Weight:</strong> {pet.weight_kg} kg</p>
        )}
        {pet.color && (
          <p><strong>Color:</strong> {pet.color}</p>
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
        <button 
          onClick={onBookAppointment}
          className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
        >
          Book Appointment
        </button>
        <button 
          onClick={onEdit}
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit size={14} className="inline mr-2" />
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} className="inline mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default PetCard;