# Dashboard Owner Hooks

A comprehensive set of React hooks for managing the pet portal dashboard owner functionality.

## Main Hook: `useDashboardOwner`

The primary hook that combines all dashboard functionality into a single, easy-to-use interface.

### Basic Usage

```javascript
import { useDashboardOwner } from '../hooks/useDashboardOwner';

function DashboardPage() {
  const {
    // Core data
    user,
    appointments,
    pets,
    invoices,
    medicalRecords,
    
    // UI state
    activeSection,
    setActiveSection,
    loading,
    
    // CRUD operations
    appointments: appointmentOps,
    pets: petOps,
    invoices: invoiceOps,
    medicalRecords: medicalOps,
    
    // Filtering
    appointmentFilters,
    
    // Navigation helpers
    navigation,
    
    // Utilities
    utils
  } = useDashboardOwner();

  // Your component logic here
}
```

## Individual Hooks

### 1. `useDashboard`
Core dashboard state and data management.

```javascript
import { useDashboard } from '../hooks/useDashboard';

const {
  user,
  appointments,
  pets,
  loading,
  activeSection,
  setActiveSection,
  refreshDashboard
} = useDashboard();
```

### 2. `useAppointments`
Appointment CRUD operations.

```javascript
import { useAppointments } from '../hooks/useAppointments';

const {
  loading,
  error,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus
} = useAppointments(userId, onSuccess);

// Create appointment
const handleCreateAppointment = async (data) => {
  const result = await createAppointment(data);
  if (result.success) {
    console.log('Appointment created:', result.data);
  }
};
```

### 3. `usePets`
Pet management operations.

```javascript
import { usePets } from '../hooks/usePets';

const {
  loading,
  error,
  createPet,
  updatePet,
  deletePet,
  updatePetMedicalNotes
} = usePets(userId, onSuccess);

// Create pet
const handleCreatePet = async (petData) => {
  const result = await createPet(petData);
  if (result.success) {
    console.log('Pet created:', result.data);
  }
};
```

### 4. `useInvoices`
Invoice and payment management.

```javascript
import { useInvoices } from '../hooks/useInvoices';

const {
  loading,
  error,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment
} = useInvoices(userId, onSuccess);

// Create invoice with items
const handleCreateInvoice = async (invoiceData, items) => {
  const result = await createInvoice(invoiceData, items);
  if (result.success) {
    console.log('Invoice created:', result.data);
  }
};
```

### 5. `useMedicalRecords`
Medical records and vaccination management.

```javascript
import { useMedicalRecords } from '../hooks/useMedicalRecords';

const {
  loading,
  error,
  createMedicalRecord,
  createVaccination,
  getVaccinationReminders
} = useMedicalRecords(userId, onSuccess);

// Create medical record
const handleCreateRecord = async (recordData) => {
  const result = await createMedicalRecord(recordData);
  if (result.success) {
    console.log('Medical record created:', result.data);
  }
};
```

### 6. `useNotifications`
Real-time notifications management.

```javascript
import { useNotifications } from '../hooks/useNotifications';

const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  createNotification
} = useNotifications(userId);

// Mark notification as read
const handleNotificationClick = async (notificationId) => {
  await markAsRead(notificationId);
};
```

### 7. `useFilters`
Data filtering and search functionality.

```javascript
import { useFilters } from '../hooks/useFilters';

const {
  filters,
  filteredData,
  updateFilter,
  resetFilters,
  getFilterCounts
} = useFilters(appointments, { 
  status: 'all',
  sortBy: 'date' 
});

// Update filter
const handleStatusFilter = (status) => {
  updateFilter('status', status);
};
```

### 8. `useRealTimeUpdates`
Real-time database updates.

```javascript
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

useRealTimeUpdates(userId, {
  onAppointmentChange: (payload) => {
    console.log('Appointment updated:', payload);
    refreshAppointments();
  },
  onPetChange: (payload) => {
    console.log('Pet updated:', payload);
    refreshPets();
  }
});
```

## Advanced Usage Examples

### Complete Dashboard Component

```javascript
import React from 'react';
import { useDashboardOwner } from '../hooks/useDashboardOwner';
import DashboardContent from '../components/dashboard/DashboardContent';
import AppointmentsContent from '../components/dashboard/AppointmentsContent';

function OwnerDashboard() {
  const {
    // Data
    user,
    appointments,
    pets,
    chartData,
    stats,
    
    // UI State
    activeSection,
    loading,
    
    // Filters
    appointmentFilters,
    
    // Operations
    appointments: appointmentOps,
    pets: petOps,
    
    // Navigation
    navigation,
    
    // Utils
    utils
  } = useDashboardOwner();

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardContent
            stats={stats}
            appointments={appointments}
            pets={pets}
            chartData={chartData}
          />
        );
      
      case 'appointments':
        return (
          <AppointmentsContent
            appointments={appointmentFilters.filteredData}
            filters={appointmentFilters.filters}
            updateFilter={appointmentFilters.updateFilter}
            onCreateAppointment={appointmentOps.createAppointment}
            onUpdateAppointment={appointmentOps.updateAppointment}
            onDeleteAppointment={appointmentOps.deleteAppointment}
          />
        );
      
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={navigation.goToSection}
      />
      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
}
```

### Custom Hook Composition

```javascript
// Create your own custom hook for specific functionality
function useAppointmentManagement() {
  const { 
    appointments, 
    pets, 
    appointmentFilters,
    appointments: appointmentOps 
  } = useDashboardOwner();

  const createAppointmentWithValidation = async (data) => {
    // Custom validation logic
    if (!data.pet_id) {
      throw new Error('Pet selection is required');
    }

    // Check for conflicts
    const conflicts = appointments.filter(apt => 
      apt.appointment_date === data.appointment_date &&
      apt.appointment_time === data.appointment_time &&
      apt.status !== 'cancelled'
    );

    if (conflicts.length > 0) {
      throw new Error('Time slot already booked');
    }

    return await appointmentOps.createAppointment(data);
  };

  return {
    appointments: appointmentFilters.filteredData,
    pets,
    filters: appointmentFilters,
    createAppointment: createAppointmentWithValidation,
    updateAppointment: appointmentOps.updateAppointment,
    deleteAppointment: appointmentOps.deleteAppointment
  };
}
```

## Error Handling

All hooks return consistent error handling:

```javascript
const { createAppointment, error } = useAppointments(userId);

const handleSubmit = async (data) => {
  const result = await createAppointment(data);
  
  if (!result.success) {
    // Handle error
    console.error('Error:', result.error);
    showNotification('Error creating appointment: ' + result.error, 'error');
    return;
  }
  
  // Handle success
  showNotification('Appointment created successfully!', 'success');
};

// Or use the error state directly
if (error) {
  return <ErrorMessage message={error} />;
}
```

## Loading States

```javascript
const { loading, dataLoading, utils } = useDashboardOwner();

// Global loading state
if (loading) {
  return <LoadingSpinner />;
}

// Specific operation loading states
if (dataLoading.appointments) {
  return <AppointmentsLoading />;
}

// Combined loading state
if (utils.isLoading) {
  return <LoadingOverlay />;
}
```

## Real-time Updates

The hooks automatically handle real-time updates:

```javascript
// No additional setup needed - updates happen automatically
const { appointments } = useDashboardOwner();

// appointments will automatically update when changes occur in the database
```

## Performance Optimization

The hooks are optimized for performance:

- Data is memoized to prevent unnecessary re-renders
- Debounced search for filtering
- Efficient real-time subscriptions
- Lazy loading of non-critical data

```javascript
// Filters are debounced automatically
const { appointmentFilters } = useDashboardOwner();

// This won't cause excessive API calls
appointmentFilters.setSearchTerm('search query');
```

## TypeScript Support

All hooks include TypeScript definitions:

```typescript
interface AppointmentData {
  pet_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  reason_for_visit: string;
}

const { createAppointment } = useAppointments(userId);
const result = await createAppointment(appointmentData);
```