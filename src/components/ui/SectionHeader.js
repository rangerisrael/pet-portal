import React from 'react';
import { Plus } from 'lucide-react';

const SectionHeader = ({ 
  title, 
  description, 
  buttonText, 
  onButtonClick, 
  children 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {children}
        {buttonText && (
          <button 
            onClick={onButtonClick}
            className="flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold shadow-lg shadow-orange-600/20"
          >
            <Plus size={16} />
            <span>{buttonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;