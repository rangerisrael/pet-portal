import React from 'react';
import {
  Package,
  Pill,
  Shield,
  Scissors,
  Stethoscope,
  Apple,
  Spray,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Thermometer,
  Edit,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

const InventoryCard = ({
  item,
  onEdit,
  onDelete,
  onUpdateStock,
  onRecordUsage,
  compact = false
}) => {
  const getItemTypeIcon = (itemType) => {
    switch (itemType) {
      case 'medicine': return Pill;
      case 'vaccine': return Shield;
      case 'supply': return Scissors;
      case 'equipment': return Stethoscope;
      case 'food': return Apple;
      default: return Package;
    }
  };

  const getStockStatusColor = () => {
    if (item.current_stock === 0) return 'text-red-600 bg-red-100';
    if (item.current_stock <= item.reorder_point) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockStatusText = () => {
    if (item.current_stock === 0) return 'Out of Stock';
    if (item.current_stock <= item.reorder_point) return 'Low Stock';
    return 'In Stock';
  };

  const getExpirationStatus = () => {
    if (!item.has_expiration) return null;

    // This would normally come from expiration data
    const daysUntilExpiry = 90; // Mock data

    if (daysUntilExpiry <= 0) return { status: 'expired', color: 'text-red-600', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'text-orange-600', text: `Expires in ${daysUntilExpiry} days` };
    return null;
  };

  const IconComponent = getItemTypeIcon(item.item_type);
  const expirationStatus = getExpirationStatus();

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <IconComponent size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.item_code}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor()}`}>
              {item.current_stock} {item.unit_of_measure}
            </div>
            <p className="text-xs text-gray-500 mt-1">{getStockStatusText()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <IconComponent size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{item.item_code}</span>
                {item.brand && (
                  <span className="text-sm text-orange-600 font-medium">{item.brand}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusColor()}`}>
            {getStockStatusText()}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {item.active_ingredient && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Active Ingredient</p>
              <p className="text-sm text-gray-900">{item.active_ingredient}</p>
            </div>
          )}

          {item.concentration && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Concentration</p>
              <p className="text-sm text-gray-900">{item.concentration}</p>
            </div>
          )}

          {item.dosage_form && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Form</p>
              <p className="text-sm text-gray-900 capitalize">{item.dosage_form}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Category</p>
            <p className="text-sm text-gray-900">{item.category}</p>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{item.current_stock}</div>
              <div className="text-xs text-gray-600">Current Stock</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{item.available_stock}</div>
              <div className="text-xs text-gray-600">Available</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{item.reorder_point}</div>
              <div className="text-xs text-gray-600">Reorder Point</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">${(item.current_stock * item.unit_cost).toFixed(2)}</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
          </div>

          {/* Stock Level Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Stock Level</span>
              <span>{item.current_stock} / {item.maximum_stock} {item.unit_of_measure}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  item.current_stock <= item.reorder_point
                    ? item.current_stock === 0 ? 'bg-red-500' : 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((item.current_stock / item.maximum_stock) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alerts and Warnings */}
        <div className="space-y-2 mb-4">
          {item.current_stock <= item.reorder_point && item.reorder_point > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {item.current_stock === 0 ? 'Out of stock - reorder immediately' : 'Stock low - consider reordering'}
              </span>
            </div>
          )}

          {expirationStatus && (
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
              <Clock size={16} className={expirationStatus.color} />
              <span className={`text-sm ${expirationStatus.color}`}>
                {expirationStatus.text}
              </span>
            </div>
          )}

          {item.storage_requirements && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
              <Thermometer size={16} className="text-blue-600" />
              <span className="text-sm text-blue-800">{item.storage_requirements}</span>
            </div>
          )}
        </div>

        {/* Supplier and Cost Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Supplier</p>
            <p className="font-medium text-gray-900">{item.supplier}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Unit Cost</p>
            <p className="font-medium text-gray-900">${item.unit_cost}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStock(item, 'decrease')}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Decrease Stock"
            >
              <Minus size={16} />
            </button>

            <span className="text-sm font-medium text-gray-700">
              {item.current_stock} {item.unit_of_measure}
            </span>

            <button
              onClick={() => onUpdateStock(item, 'increase')}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Increase Stock"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRecordUsage(item)}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Record Usage
            </button>

            <button
              onClick={() => onEdit(item)}
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Edit Item"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={() => onDelete(item)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;