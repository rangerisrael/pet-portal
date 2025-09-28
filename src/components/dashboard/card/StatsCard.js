import { ArrowUpRight } from "lucide-react";

export function StatCard({ stat }) {
  const IconComponent = stat.icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${stat.bgColor} rounded-xl`}>
            <IconComponent size={24} className={stat.color} />
          </div>
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              stat.trend === "up"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <ArrowUpRight
              size={12}
              className={
                stat.trend === "up"
                  ? "text-emerald-600"
                  : "text-red-600 rotate-90"
              }
            />
            <span>{stat.change}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {stat.title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
          <p className="text-xs text-gray-500">vs last month</p>
        </div>
      </div>
    </div>
  );
}
