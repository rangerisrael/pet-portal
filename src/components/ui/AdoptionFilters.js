import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  SPECIES_OPTIONS,
  AGE_CATEGORIES,
  SIZE_CATEGORIES,
  ENERGY_LEVELS,
  GOOD_WITH,
  ADOPTION_STATUS
} from '../../constants/formOptions';

const AdoptionFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchChange
}) => {
  const hasActiveFilters = () => {
    return Object.keys(filters).some(key =>
      Array.isArray(filters[key]) ? filters[key].length > 0 : filters[key]
    ) || searchTerm;
  };

  const handleFilterChange = (key, value) => {
    if (Array.isArray(filters[key])) {
      const updatedArray = filters[key].includes(value)
        ? filters[key].filter(item => item !== value)
        : [...filters[key], value];
      onFilterChange(key, updatedArray);
    } else {
      onFilterChange(key, value === filters[key] ? '' : value);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, breed, or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Species Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Species
          </label>
          <div className="space-y-2">
            {SPECIES_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.species?.includes(option.value) || false}
                  onChange={() => handleFilterChange('species', option.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Age Group
          </label>
          <div className="space-y-2">
            {AGE_CATEGORIES.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.ageCategory?.includes(option.value) || false}
                  onChange={() => handleFilterChange('ageCategory', option.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Size
          </label>
          <div className="space-y-2">
            {SIZE_CATEGORIES.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.size?.includes(option.value) || false}
                  onChange={() => handleFilterChange('size', option.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Energy Level Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Energy Level
          </label>
          <div className="space-y-2">
            {ENERGY_LEVELS.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.energyLevel?.includes(option.value) || false}
                  onChange={() => handleFilterChange('energyLevel', option.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
        {/* Good With Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Good With
          </label>
          <div className="flex flex-wrap gap-2">
            {GOOD_WITH.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('goodWith', option.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.goodWith?.includes(option.value)
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Availability Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Status</option>
            {ADOPTION_STATUS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Adoption Fee Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Adoption Fee Range
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minFee || ''}
              onChange={(e) => onFilterChange('minFee', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxFee || ''}
              onChange={(e) => onFilterChange('maxFee', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Special Options */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Special Options
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.urgent || false}
              onChange={() => onFilterChange('urgent', !filters.urgent)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">Urgent Adoption</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.specialNeeds || false}
              onChange={() => onFilterChange('specialNeeds', !filters.specialNeeds)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">Special Needs</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.microchipped || false}
              onChange={() => onFilterChange('microchipped', !filters.microchipped)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">Microchipped</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.vaccinated || false}
              onChange={() => onFilterChange('vaccinated', !filters.vaccinated)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">Vaccinated</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdoptionFilters;