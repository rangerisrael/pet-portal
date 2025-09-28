import React from "react";
import { Package, AlertTriangle, TrendingDown } from "lucide-react";

const InventoryStats = ({ stats = {} }) => {
  const {
    totalItems = 0,
    lowStockItems = 0,
    outOfStockItems = 0,
    totalValue = 0,
  } = stats;

  const statCards = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      icon: AlertTriangle,
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgLight: "bg-yellow-50",
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingDown,
      bgColor: "bg-red-500",
      textColor: "text-red-600",
      bgLight: "bg-red-50",
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: Package,
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${stat.bgLight} rounded-lg p-6`}>
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-md p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStats;