import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

export const useDashboard = () => {
  // UI State
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [chartData, setChartData] = useState({
    appointmentTrends: [],
    petTypeDistribution: []
  });
  const [stats, setStats] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    appointments: false,
    pets: false,
    medicalRecords: false,
    invoices: false,
    stats: false
  });
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [showEditPetForm, setShowEditPetForm] = useState(false);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  
  // Selected Items
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Color selection for appointments
  const [selectedColor, setSelectedColor] = useState('#F97316');
  const [colorPalette, setColorPalette] = useState([]);
  
  // Notification states
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Initialize dashboard data
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        setUser({
          ...authUser,
          profile,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'User',
          role: profile?.role || 'pet_owner',
          branch: profile?.clinic_name || 'Pet Portal'
        });

        // Load all dashboard data
        await Promise.all([
          loadAppointments(authUser.id),
          loadPets(authUser.id),
          loadMedicalRecords(authUser.id),
          loadVaccinations(authUser.id),
          loadInvoices(authUser.id),
          loadPayments(authUser.id),
          loadColorPalette(),
          loadStats(authUser.id)
        ]);
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load appointments
  const loadAppointments = async (userId) => {
    try {
      setDataLoading(prev => ({ ...prev, appointments: true }));
      const { data } = await supabase
        .from('appointment_details')
        .select('*')
        .eq('owner_id', userId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  // Load pets
  const loadPets = async (userId) => {
    try {
      setDataLoading(prev => ({ ...prev, pets: true }));
      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, pets: false }));
    }
  };

  // Load medical records
  const loadMedicalRecords = async (userId) => {
    try {
      setDataLoading(prev => ({ ...prev, medicalRecords: true }));
      const { data } = await supabase
        .from('medical_record_details')
        .select('*')
        .eq('owner_id', userId)
        .order('record_date', { ascending: false });
      
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, medicalRecords: false }));
    }
  };

  // Load vaccinations
  const loadVaccinations = async (userId) => {
    try {
      const { data } = await supabase
        .from('vaccination_details')
        .select('*')
        .eq('owner_id', userId)
        .order('vaccination_date', { ascending: false });
      
      setVaccinations(data || []);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  // Load invoices
  const loadInvoices = async (userId) => {
    try {
      setDataLoading(prev => ({ ...prev, invoices: true }));
      const { data } = await supabase
        .from('invoice_details')
        .select('*')
        .eq('owner_id', userId)
        .order('invoice_date', { ascending: false });
      
      setInvoices(data || []);
      
      // Calculate billing summary
      if (data) {
        const summary = data.reduce((acc, invoice) => {
          acc.total_invoiced += invoice.total_amount || 0;
          acc.total_paid += (invoice.total_amount - invoice.balance_due) || 0;
          acc.total_outstanding += invoice.balance_due || 0;
          return acc;
        }, { total_invoiced: 0, total_paid: 0, total_outstanding: 0 });
        
        setBillingSummary(summary);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, invoices: false }));
    }
  };

  // Load payments
  const loadPayments = async (userId) => {
    try {
      const { data } = await supabase
        .from('payment_details')
        .select('*')
        .eq('owner_id', userId)
        .order('payment_date', { ascending: false });
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  // Load color palette
  const loadColorPalette = async () => {
    try {
      const { data } = await supabase
        .from('color_palette')
        .select('*')
        .order('display_order');
      
      setColorPalette(data || []);
    } catch (error) {
      console.error('Error loading color palette:', error);
    }
  };

  // Calculate dashboard statistics
  const loadStats = async (userId) => {
    try {
      setDataLoading(prev => ({ ...prev, stats: true }));
      
      // Get current data for calculations
      const [appointmentsData, petsData, invoicesData] = await Promise.all([
        supabase.from('appointments').select('*').eq('owner_id', userId),
        supabase.from('pets').select('*').eq('owner_id', userId),
        supabase.from('invoices').select('*').eq('owner_id', userId)
      ]);

      const totalPets = petsData.data?.length || 0;
      const totalAppointments = appointmentsData.data?.length || 0;
      const upcomingAppointments = appointmentsData.data?.filter(apt => 
        new Date(apt.appointment_date) >= new Date()
      ).length || 0;
      const totalInvoiced = invoicesData.data?.reduce((sum, inv) => 
        sum + (inv.total_amount || 0), 0
      ) || 0;

      const dashboardStats = [
        {
          label: "Total Pets",
          value: totalPets.toString(),
          change: "+0%",
          trend: "up",
          subtitle: "Registered pets",
          icon: "Heart",
          color: "text-orange-600",
          bgColor: "bg-orange-100"
        },
        {
          label: "Appointments",
          value: totalAppointments.toString(),
          change: "+12%",
          trend: "up", 
          subtitle: "Total appointments",
          icon: "Calendar",
          color: "text-blue-600",
          bgColor: "bg-blue-100"
        },
        {
          label: "Upcoming",
          value: upcomingAppointments.toString(),
          change: "+8%",
          trend: "up",
          subtitle: "Scheduled visits",
          icon: "Clock",
          color: "text-green-600",
          bgColor: "bg-green-100"
        },
        {
          label: "Total Spent",
          value: `₱${totalInvoiced.toLocaleString()}`,
          change: "+15%",
          trend: "up",
          subtitle: "All time",
          icon: "DollarSign",
          color: "text-purple-600",
          bgColor: "bg-purple-100"
        }
      ];

      setStats(dashboardStats);

      // Generate chart data
      generateChartData(appointmentsData.data || []);
      
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setDataLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Generate chart data for trends
  const generateChartData = (appointmentData) => {
    // Generate appointment trends (last 6 months)
    const monthlyData = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    // Initialize months with 0
    last6Months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Count appointments by month
    appointmentData.forEach(apt => {
      const month = new Date(apt.appointment_date).toLocaleString('default', { month: 'short' });
      if (monthlyData.hasOwnProperty(month)) {
        monthlyData[month]++;
      }
    });

    const appointmentTrends = Object.entries(monthlyData).map(([month, appointments]) => ({
      month,
      appointments
    }));

    setChartData({ appointmentTrends });
  };

  // Refresh all data
  const refreshDashboard = async () => {
    if (user?.id) {
      await Promise.all([
        loadAppointments(user.id),
        loadPets(user.id),
        loadMedicalRecords(user.id),
        loadVaccinations(user.id),
        loadInvoices(user.id),
        loadPayments(user.id),
        loadStats(user.id)
      ]);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeDashboard();
  }, []);

  return {
    // UI State
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    
    // Data
    user,
    appointments,
    pets,
    medicalRecords,
    vaccinations,
    invoices,
    payments,
    billingSummary,
    chartData,
    stats,
    colorPalette,
    
    // Loading States
    loading,
    dataLoading,
    
    // Filters
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    searchTerm,
    setSearchTerm,
    
    // Modals
    showCreateForm,
    setShowCreateForm,
    showEditForm,
    setShowEditForm,
    showPetForm,
    setShowPetForm,
    showEditPetForm,
    setShowEditPetForm,
    showMedicalRecordForm,
    setShowMedicalRecordForm,
    showVaccinationForm,
    setShowVaccinationForm,
    showCreateInvoice,
    setShowCreateInvoice,
    showEditInvoice,
    setShowEditInvoice,
    showPaymentForm,
    setShowPaymentForm,
    showInvoiceDetails,
    setShowInvoiceDetails,
    
    // Selected Items
    selectedAppointment,
    setSelectedAppointment,
    selectedPet,
    setSelectedPet,
    selectedInvoice,
    setSelectedInvoice,
    
    // Color Selection
    selectedColor,
    setSelectedColor,
    
    // Notifications
    unreadNotificationCount,
    setUnreadNotificationCount,
    
    // Actions
    refreshDashboard,
    loadAppointments: () => loadAppointments(user?.id),
    loadPets: () => loadPets(user?.id),
    loadMedicalRecords: () => loadMedicalRecords(user?.id),
    loadInvoices: () => loadInvoices(user?.id),
    loadStats: () => loadStats(user?.id)
  };
};