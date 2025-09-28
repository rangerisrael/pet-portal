import React from 'react';
import { Search, Filter, X, AlertTriangle, Package } from 'lucide-react';
import {
  INVENTORY_ITEM_TYPES,
  TRANSACTION_TYPES,
  ALERT_TYPES
} from '../../constants/formOptions';

const InventoryFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchChange,
  suppliers = [],
  categories = []
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

  // Get unique categories from items
  const itemCategories = [
    'Medicines', 'Vaccines', 'Surgical Supplies', 'Diagnostic Equipment',
    'Food & Nutrition', 'Cleaning Supplies', 'Office Supplies', 'Equipment'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter Inventory</h3>
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
            placeholder="Search by name, code, ingredient, or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Item Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Item Type
          </label>
          <div className="space-y-2">
            {INVENTORY_ITEM_TYPES.map(type => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.itemType?.includes(type.value) || false}
                  onChange={() => handleFilterChange('itemType', type.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Category
          </label>
          <div className="space-y-2">
            {itemCategories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(category) || false}
                  onChange={() => handleFilterChange('category', category)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock Level Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Stock Level
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="stockLevel"
                value=""
                checked={filters.stockLevel === ''}
                onChange={(e) => onFilterChange('stockLevel', e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">All Items</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stockLevel"
                value="in_stock"
                checked={filters.stockLevel === 'in_stock'}
                onChange={(e) => onFilterChange('stockLevel', e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stockLevel"
                value="low_stock"
                checked={filters.stockLevel === 'low_stock'}
                onChange={(e) => onFilterChange('stockLevel', e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-orange-700 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                Low Stock
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stockLevel"
                value="out_of_stock"
                checked={filters.stockLevel === 'out_of_stock'}
                onChange={(e) => onFilterChange('stockLevel', e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-red-700">Out of Stock</span>
            </label>
          </div>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Supplier
          </label>
          <select
            value={filters.supplier || ''}
            onChange={(e) => onFilterChange('supplier', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.company_name}>
                {supplier.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['active', 'low_stock', 'discontinued'].map(status => (
              <button
                key={status}
                onClick={() => handleFilterChange('status', status)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.status?.includes(status)
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Expiration Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Expiration
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExpiration"
                value=""
                checked={filters.hasExpiration === null}
                onChange={() => onFilterChange('hasExpiration', null)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">All Items</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExpiration"
                value="true"
                checked={filters.hasExpiration === true}
                onChange={() => onFilterChange('hasExpiration', true)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">With Expiration</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExpiration"
                value="false"
                checked={filters.hasExpiration === false}
                onChange={() => onFilterChange('hasExpiration', false)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">No Expiration</span>
            </label>
          </div>
        </div>

        {/* Value Range Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Unit Cost Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min cost"
              value={filters.minCost || ''}
              onChange={(e) => onFilterChange('minCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Max cost"
              value={filters.maxCost || ''}
              onChange={(e) => onFilterChange('maxCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Special Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Special Options
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.requiresReorder || false}
                onChange={() => onFilterChange('requiresReorder', !filters.requiresReorder)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Requires Reorder</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.prescriptionRequired || false}
                onChange={() => onFilterChange('prescriptionRequired', !filters.prescriptionRequired)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Prescription Required</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.controlledSubstance || false}
                onChange={() => onFilterChange('controlledSubstance', !filters.controlledSubstance)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Controlled Substance</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              onFilterChange('stockLevel', 'low_stock');
              onFilterChange('requiresReorder', true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <AlertTriangle size={16} />
            <span>Needs Attention</span>
          </button>

          <button
            onClick={() => {
              onFilterChange('itemType', ['medicine']);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Package size={16} />
            <span>Medicines Only</span>
          </button>

          <button
            onClick={() => {
              onFilterChange('itemType', ['vaccine']);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Package size={16} />
            <span>Vaccines Only</span>
          </button>

          <button
            onClick={() => {
              onFilterChange('hasExpiration', true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <Package size={16} />
            <span>Expires</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;