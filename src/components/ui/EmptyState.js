import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  iconSize = 48,
  iconClassName = "mx-auto mb-4 text-gray-300",
  children
}) => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Icon size={iconSize} className={iconClassName} />
      <p className="text-lg font-medium mb-2">{title}</p>
      <p className="mb-6">{description}</p>
      {children}
    </div>
  );
};

export default EmptyState;