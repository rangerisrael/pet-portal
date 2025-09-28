import React from 'react';

const AppointmentFilters = ({ 
  filterStatus, 
  setFilterStatus, 
  sortBy, 
  setSortBy, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="status">Sort by Status</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>
      
      <input
        type="text"
        placeholder="Search appointments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm w-48"
      />
    </div>
  );
};

export default AppointmentFilters;