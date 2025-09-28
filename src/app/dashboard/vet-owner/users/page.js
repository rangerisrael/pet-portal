"use client";

import React, { useState } from "react";
import DashboardMainLayout from "@/components/common/dashboard/MainLayout";
import { vetOwnerItems } from "@/components/utils/link-data";
import useAuth from "@/hooks/useAuth";
import UserManagementContent from "@/components/dashboard/content/UserManagementContent";

const Users = () => {
  const [activeTab, setActiveTab] = useState("users");

  // Use Redux for authentication
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  console.log(user, "get users");

  //   if (isLoading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
  //           <p className="text-gray-600">Loading...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardMainLayout
      navList={vetOwnerItems}
      selectedPageRender={<UserManagementContent user={user} />}
      role={"vet-owner"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default Users;
