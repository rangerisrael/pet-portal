import {
  Calendar,
  Heart,
  Plus,
  TrendingUp,
  PieChart,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";
import { StatCard } from "../card/StatsCard";
import { AppointmentCard } from "../card/AppointmetnCard";

// Content Components with enhanced professional design
const DashboardContent = ({
  user,
  stats,
  appointments,
  revenueData,
  colors,
  petTypeData,
  appointmentsData,
  setShowCreateForm,
}) => (
  <div className="space-y-8">
    {/* Welcome Section */}
    <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white shadow-xl shadow-orange-600/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2">
            Welcome back,{" "}
            {user?.user_metadata?.first_name?.split(" ")[0] ||
             user?.email?.split("@")[0] ||
             "Pet Owner"}!
          </h3>

          <p className="text-orange-100 text-lg">
            You have{" "}
            {
              appointments.filter(
                (apt) =>
                  apt.appointment_date ===
                  new Date().toISOString().split("T")[0]
              ).length
            }{" "}
            appointments scheduled for today
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart size={32} className="text-white" />
          </div>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Revenue Analytics
            </h3>
            <p className="text-gray-600 mt-1">Monthly performance overview</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-semibold">
            <TrendingUp size={18} />
            <span>+18.7% growth</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              formatter={(value) => [`₱${value.toLocaleString()}`, "Revenue"]}
              labelFormatter={(label) => `${label} 2025`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={colors?.primary}
              strokeWidth={4}
              dot={{ fill: colors?.primary, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: colors?.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pet Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Patient Distribution
            </h3>
            <p className="text-gray-600 mt-1">By animal type</p>
          </div>
          <PieChart size={18} className="text-gray-600" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RechartsPieChart
            data={petTypeData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
          >
            <Tooltip
              formatter={(value) => [`${value}%`, "Percentage"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            />
            {petTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {petTypeData.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <div>
                <span className="font-semibold text-gray-900">{item.name}</span>
                <p className="text-sm text-gray-600">
                  {item.value}% of patients
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Today's Appointments */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
          <p className="text-gray-600 mt-1">Manage your daily appointments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg shadow-orange-600/20"
        >
          <Plus size={18} />
          <span>New Appointment</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointmentsData.slice(0, 4).map((appointment, index) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
      {appointmentsData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No appointments scheduled</p>
          <p>Schedule your first appointment to get started!</p>
        </div>
      )}
    </div>
  </div>
);

export default DashboardContent;
