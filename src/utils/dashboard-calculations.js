import { isEmpty, isUndefined } from "lodash";
import { Heart, Calendar, Activity, DollarSign, Users } from "lucide-react";

export const calculateStats = (appointments = [], pets = []) => {
  // Ensure we have valid arrays
  const validAppointments = Array.isArray(appointments) ? appointments : [];
  const validPets = Array.isArray(pets) ? pets : [];

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = validAppointments.filter(
    (apt) => apt.appointment_date === today
  );
  const completedAppointments = validAppointments.filter(
    (apt) => apt.status === "completed"
  );
  const totalRevenue = validAppointments.reduce(
    (sum, apt) => sum + (apt.actual_cost || 0),
    0
  );

  return [
    {
      title: "Active Pets",
      value: validPets.length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Heart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length.toString(),
      change: "+8.3%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Procedures",
      value: completedAppointments.length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Spent",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: "+18.7%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];
};

export const getFilteredAppointments = (
  appointments = [],
  filterStatus = "all",
  searchTerm = "",
  sortBy = "date"
) => {
  // Ensure we have a valid array
  const validAppointments = Array.isArray(appointments) ? appointments : [];

  let filtered = validAppointments.filter((appointment) => {
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      appointment.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.owner_first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.owner_last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Sort appointments
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(a.appointment_date + " " + a.appointment_time) -
          new Date(b.appointment_date + " " + b.appointment_time)
        );
      case "status":
        return a.status.localeCompare(b.status);
      case "priority":
        const priorityOrder = { critical: 0, high: 1, routine: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });

  return filtered;
};

export const calculateRevenueData = (appointments = []) => {
  // Ensure we have a valid array
  const validAppointments = Array.isArray(appointments) ? appointments : [];

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayRevenue = validAppointments
      .filter(
        (apt) => apt.appointment_date === dateStr && apt.status === "completed"
      )
      .reduce((sum, apt) => sum + (apt.actual_cost || apt.estimated_cost || 0), 0);

    last7Days.push({
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: dayRevenue,
    });
  }

  // If no real data, return some demo data for better visualization
  if (last7Days.every(day => day.revenue === 0)) {
    return last7Days.map((day, index) => ({
      ...day,
      revenue: Math.floor(Math.random() * 5000) + 1000 // Demo revenue between 1000-6000
    }));
  }

  return last7Days;
};

export const calculatePetTypeData = (pets = []) => {
  // Ensure we have a valid array
  const validPets = Array.isArray(pets) ? pets : [];

  const typeCount = validPets.reduce((acc, pet) => {
    const type = pet.species || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const colors = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

  // If no pets, return demo data
  if (validPets.length === 0) {
    return [
      { name: "Dogs", value: 45, color: colors[0] },
      { name: "Cats", value: 35, color: colors[1] },
      { name: "Birds", value: 15, color: colors[2] },
      { name: "Others", value: 5, color: colors[3] }
    ];
  }

  return Object.entries(typeCount).map(([type, count], index) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: colors[index % colors.length],
  }));
};

export const calculateVetStats = (appointments = [], pets = [], users = []) => {
  // Ensure we have valid arrays
  const validAppointments = Array.isArray(appointments) ? appointments : [];
  const validPets = Array.isArray(pets) ? pets : [];
  const validUsers = Array.isArray(users) ? users : [];

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = validAppointments.filter(
    (apt) => apt.appointment_date === today
  );
  const completedAppointments = validAppointments.filter(
    (apt) => apt.status === "completed"
  );
  const totalRevenue = validAppointments.reduce(
    (sum, apt) => sum + (apt.actual_cost || apt.estimated_cost || 0),
    0
  );

  // Count pet owners (users with pet-owner role)
  const petOwners = validUsers.filter(user =>
    user.role === 'pet-owner' || user.user_metadata?.role === 'pet-owner'
  );

  return [
    {
      title: "Total Pets",
      value: validPets.length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Heart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pet Owners",
      value: petOwners.length.toString(),
      change: "+8.3%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: Calendar,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: "+18.7%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];
};
