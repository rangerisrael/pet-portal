import React from "react";
import { Package, Clock, CheckCircle } from "lucide-react";

const InventoryTabs = ({ activeTab, setActiveTab, stockRequestsCount = 0 }) => {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Package,
    },
    {
      id: "stock-requests",
      label: "Stock Requests",
      icon: Clock,
      badge: stockRequestsCount,
    },
    {
      id: "approved-requests",
      label: "Approved Requests",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default InventoryTabs;