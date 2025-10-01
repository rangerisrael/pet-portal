import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import {
  auditPetCreation,
  auditPetUpdate,
  auditPetDeletion,
} from "@/utils/auditLogger";
import { VetPetShowForm } from "@/utils/global-state/dashboard/vet-owner.glb";

// Mock data for fallback when database is not available
const mockPets = [
  {
    id: "pet-1",
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    age_years: 3,
    age_months: 6,
    gender: "male",
    weight_kg: 25.5,
    color: "Golden",
    image_url: null,
    medical_notes: "Regular checkups, no known allergies",
    emergency_contact_name: "John Smith",
    emergency_contact_phone: "(555) 123-4567",
    status: "active",
    created_at: new Date().toISOString(),
    owner_id: "owner-1",
    owner_name: "John Smith",
    owner_email: "john.smith@email.com",
    owner_phone: "(555) 123-4567",
  },
  {
    id: "pet-2",
    name: "Luna",
    species: "cat",
    breed: "Persian",
    age_years: 2,
    age_months: 3,
    gender: "female",
    weight_kg: 4.2,
    color: "White",
    image_url: null,
    medical_notes: "Indoor cat, vaccinated",
    emergency_contact_name: "Jane Doe",
    emergency_contact_phone: "(555) 987-6543",
    status: "active",
    created_at: new Date().toISOString(),
    owner_id: "owner-2",
    owner_name: "Jane Doe",
    owner_email: "jane.doe@email.com",
    owner_phone: "(555) 987-6543",
  },
  {
    id: "pet-3",
    name: "Whiskers",
    species: "cat",
    breed: "Maine Coon",
    age_years: 1,
    age_months: 8,
    gender: "male",
    weight_kg: 6.8,
    color: "Gray Tabby",
    image_url: null,
    medical_notes: "Young cat, very playful",
    emergency_contact_name: "Mike Johnson",
    emergency_contact_phone: "(555) 456-7890",
    status: "active",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-3",
    owner_name: "Mike Johnson",
    owner_email: "mike.johnson@email.com",
    owner_phone: "(555) 456-7890",
  },
  {
    id: "pet-4",
    name: "Bella",
    species: "dog",
    breed: "Labrador Mix",
    age_years: 5,
    age_months: 2,
    gender: "female",
    weight_kg: 22.3,
    color: "Black",
    image_url: null,
    medical_notes: "Senior dog, hip issues monitoring",
    emergency_contact_name: "Sarah Wilson",
    emergency_contact_phone: "(555) 321-0987",
    status: "active",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-4",
    owner_name: "Sarah Wilson",
    owner_email: "sarah.wilson@email.com",
    owner_phone: "(555) 321-0987",
  },
  {
    id: "pet-5",
    name: "Mittens",
    species: "cat",
    breed: "Siamese",
    age_years: 3,
    age_months: 0,
    gender: "female",
    weight_kg: 4.5,
    color: "Cream and Brown",
    image_url: null,
    medical_notes: "Indoor cat, regular dental cleanings",
    emergency_contact_name: "Emily Chen",
    emergency_contact_phone: "(555) 654-3210",
    status: "active",
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    owner_id: "owner-5",
    owner_name: "Emily Chen",
    owner_email: "emily.chen@email.com",
    owner_phone: "(555) 654-3210",
  },
];

export const usePets = (user, userRole = "pet-owner") => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [, setShowPetForm] = VetPetShowForm();

  const fetchPets = async () => {
    // For vet-owner and main-branch, we don't need a specific user ID to view pets
    if (!user?.id && userRole !== "vet-owner" && userRole !== "main-branch") {
      console.log("❌ No user ID and not vet-owner/main-branch, cannot fetch pets");
      setPets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log("🔍 Fetching pets for user:", user?.id, "Role:", userRole);

      // Check if supabase client is available
      if (!supabase) {
        console.log("❌ Supabase not available, using mock data");
        const filteredMockPets =
          userRole === "vet-owner"
            ? mockPets
            : mockPets.filter((pet) => pet.owner_id === user?.id);
        console.log(
          `🔒 Mock data filtered: ${filteredMockPets.length} pets for ${userRole}`
        );
        setPets(filteredMockPets);
        setUsingMockData(true);
        return;
      }

      console.log("✅ Supabase client available, attempting database query...");

      // Test basic connection first
      try {
        const testResult = await supabase
          .from("pets")
          .select("count", { count: "exact" });
        console.log("🔍 Pets table test:", testResult);
      } catch (testError) {
        console.log("❌ Pets table connection test failed:", testError);
      }

      // Get pets from database - filter by user for pet-owner role
      let query = supabase.from("pets").select("*");
      let mainBranchId = null;

      // For pet-owner role, only show pets they own
      if (userRole === "pet-owner" && user?.id) {
        query = query.eq("owner_id", user.id);
        console.log("🔒 Filtering pets for pet-owner:", user.id);
      }
      // For main-branch, get branch_id from veterinary_staff table
      else if (userRole === "main-branch" && user?.id) {
        console.log("🏥 Fetching branch for main-branch user:", user.id);

        // Get staff record to find designated_branch_id
        const { data: staffData, error: staffError } = await supabase
          .from("veterinary_staff")
          .select("designated_branch_id, staff_name")
          .eq("assigned_id", user.id)
          .single();

        if (staffError) {
          console.log("❌ Error fetching staff data:", staffError);
        } else if (staffData?.designated_branch_id) {
          mainBranchId = staffData.designated_branch_id;
          console.log("🏥 Found designated branch:", mainBranchId, "for staff:", staffData.staff_name);
          // Will filter after fetching all pets and their owner data
        } else {
          console.log("⚠️ No designated branch found for user, showing no pets");
          setPets([]);
          setLoading(false);
          return;
        }
      }
      else if (userRole === "vet-owner") {
        console.log("👨‍⚕️ Showing all pets for vet-owner");
      }

      const result = await query.order("created_at", { ascending: false });

      let data = result.data;
      let error = result.error;

      console.log("📊 Database query result:", {
        data: data?.length,
        error: error?.message,
      });

      if (error) {
        // Handle specific database errors
        if (error.code === "42P01") {
          console.log("❌ Pets table does not exist, using mock data");
          console.log(
            "💡 To fix: Run the database migration in Supabase SQL Editor"
          );
          console.log(
            "📄 File: supabase_migrations/complete_pet_portal_setup.sql"
          );
          const filteredMockPets =
            userRole === "vet-owner"
              ? mockPets
              : mockPets.filter((pet) => pet.owner_id === user?.id);
          setPets(filteredMockPets);
          setUsingMockData(true);
        } else if (error.code === "42703") {
          console.log("❌ Column does not exist, using mock data");
          console.log("💡 To fix: Update your database schema");
          const filteredMockPets =
            userRole === "vet-owner"
              ? mockPets
              : mockPets.filter((pet) => pet.owner_id === user?.id);
          setPets(filteredMockPets);
          setUsingMockData(true);
        } else {
          console.error("❌ Database error:", error);
          console.log("🔄 Falling back to mock data");
          const filteredMockPets =
            userRole === "vet-owner"
              ? mockPets
              : mockPets.filter((pet) => pet.owner_id === user?.id);
          setPets(filteredMockPets);
          setUsingMockData(true);
        }
      } else {
        console.log(
          "✅ Successfully loaded real data from database:",
          data?.length,
          "pets"
        );

        // Get all authenticated users via API to match with pet owners
        let apiUsers = [];
        try {
          const response = await fetch("/api/users");
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data) {
              apiUsers = userData.data;
              console.log("👥 API users:", apiUsers.length);
            }
          }
        } catch (apiError) {
          console.log("⚠️ Failed to fetch users from API:", apiError.message);
        }

        // Process the data to include owner information from API users
        let processedPets =
          data?.map((pet) => {
            // Find the API user that matches this pet's owner_id
            const apiUser = apiUsers.find((user) => user.id === pet.owner_id);

            console.log(`🐾 Pet: ${pet.name}, Owner ID: ${pet.owner_id}, Owner clinicName: ${apiUser?.clinicName}`);

            return {
              ...pet,
              // Add owner details for display from API user
              owner_name:
                apiUser?.first_name && apiUser?.last_name
                  ? `${apiUser.first_name} ${apiUser.last_name}`.trim()
                  : apiUser?.email?.split("@")[0] ||
                    pet.emergency_contact_name ||
                    "Unknown Owner",
              owner_email:
                apiUser?.email || pet.emergency_contact_name || "No email",
              owner_phone:
                apiUser?.phone || pet.emergency_contact_phone || "No phone",
              owner_role: apiUser?.role || "pet-owner",
              owner_preferred_clinicName: apiUser?.clinicName || "",
              owner_registered: apiUser?.created_at || null,
              // Keep original API user data
              api_user: apiUser,
            };
          }) || [];

        // For main-branch, filter pets by branch_name from owner's metadata
        if (userRole === "main-branch" && mainBranchId) {
          // Get branch name from branch_id
          const { data: branchData } = await supabase
            .from("vet_owner_branches")
            .select("branch_name")
            .eq("branch_id", mainBranchId)
            .single();

          const branchName = branchData?.branch_name;
          console.log("🏥 Main-branch designated branch_id:", mainBranchId, "branch_name:", branchName);
          console.log("🔍 Available pets and their owner clinic preferences:", processedPets.map(p => ({
            petName: p.name,
            ownerEmail: p.owner_email,
            ownerClinicName: p.api_user?.clinicName
          })));

          // Filter pets where owner's clinicName (from user metadata) matches main-branch's branch_name
          if (branchName) {
            processedPets = processedPets.filter(
              (pet) => {
                const ownerClinic = pet.api_user?.clinicName?.toLowerCase()?.trim() || "";
                const staffBranch = branchName?.toLowerCase()?.trim() || "";
                return ownerClinic === staffBranch;
              }
            );

            console.log(
              `🏥 Filtered to ${processedPets.length} pets for branch: ${branchName}`
            );
          }
        }

        console.log("📋 Processed pets with auth users:", processedPets);
        setPets(processedPets);
        setUsingMockData(false);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      console.log("Falling back to mock data");
      const filteredMockPets =
        userRole === "vet-owner"
          ? mockPets
          : mockPets.filter((pet) => pet.owner_id === user?.id);
      setPets(filteredMockPets);
      setUsingMockData(true);
    } finally {
      setLoading(false);
      setShowPetForm(false);
    }
  };

  const createPet = async (petData) => {
    if (!user?.id) {
      toast.error("User not authenticated. Please log in to add pets.");
      return;
    }

    console.log("Creating pet with data:", petData);

    // Validate required fields
    if (!petData.name || !petData.species) {
      toast.error("Pet name and species are required");
      return;
    }

    try {
      const cleanedData = {
        ...petData,
        owner_id: user.id,
        weight_kg:
          petData.weight_kg === "" ? null : parseFloat(petData.weight_kg),
        age_years:
          petData.age_years === "" ? null : parseInt(petData.age_years),
        age_months:
          petData.age_months === "" ? null : parseInt(petData.age_months),
        image_url: petData.image_url || null,
      };

      // If using mock data or supabase unavailable, handle locally
      if (usingMockData || !supabase) {
        const newPet = {
          ...cleanedData,
          id: "pet-" + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "active",
        };

        setPets((prev) => [newPet, ...prev]);
        setShowPetForm(false);
        toast.success("Pet created successfully! (Demo mode)");
        return newPet;
      }

      // Try database insertion
      const { data, error } = await supabase
        .from("pets")
        .insert([cleanedData])
        .select();

      if (error) {
        // Handle database errors by falling back to mock mode
        if (error.code === "42P01" || error.code === "42703") {
          console.log("Database table issue, creating pet in demo mode");
          const newPet = {
            ...cleanedData,
            id: "pet-" + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: "active",
          };

          setPets((prev) => [newPet, ...prev]);
          setUsingMockData(true);
          setShowPetForm(false);
          toast.success("Pet created successfully! (Demo mode)");
          return newPet;
        }
        throw error;
      }

      // Successful database insertion
      await fetchPets();

      if (data?.[0]) {
        try {
          await auditPetCreation(data[0]);
        } catch (auditError) {
          console.warn("Audit logging failed:", auditError);
        }
        setShowPetForm(false);
      }

      toast.success("Pet created successfully!");
      return data[0];
    } catch (error) {
      console.error("Error creating pet:", error);

      // Final fallback to mock mode
      const newPet = {
        ...petData,
        owner_id: user.id,
        id: "pet-" + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "active",
        weight_kg:
          petData.weight_kg === "" ? null : parseFloat(petData.weight_kg),
        age_years:
          petData.age_years === "" ? null : parseInt(petData.age_years),
        age_months:
          petData.age_months === "" ? null : parseInt(petData.age_months),
        image_url: petData.image_url || null,
      };

      setPets((prev) => [newPet, ...prev]);
      setUsingMockData(true);
      setShowPetForm(false);
      toast.success("Pet created successfully! (Demo mode)");
      return newPet;
    }
  };

  const updatePet = async (petId, petData) => {
    try {
      const cleanedData = {
        ...petData,
        weight_kg:
          petData.weight_kg === "" ? null : parseFloat(petData.weight_kg),
        age_years:
          petData.age_years === "" ? null : parseInt(petData.age_years),
        age_months:
          petData.age_months === "" ? null : parseInt(petData.age_months),
        image_url: petData.image_url || null,
      };

      if (usingMockData || !supabase) {
        // Update in mock data
        setPets((prev) =>
          prev.map((pet) =>
            pet.id === petId
              ? { ...pet, ...cleanedData, updated_at: new Date().toISOString() }
              : pet
          )
        );
        toast.success("Pet updated successfully! (Demo mode)");
        return;
      }

      const { error } = await supabase
        .from("pets")
        .update(cleanedData)
        .eq("id", petId);

      if (error) {
        if (error.code === "42P01" || error.code === "42703") {
          // Fall back to mock update
          setPets((prev) =>
            prev.map((pet) =>
              pet.id === petId
                ? {
                    ...pet,
                    ...cleanedData,
                    updated_at: new Date().toISOString(),
                  }
                : pet
            )
          );
          setUsingMockData(true);
          toast.success("Pet updated successfully! (Demo mode)");
          return;
        }
        throw error;
      }

      await fetchPets();
      try {
        await auditPetUpdate(petId, petData);
      } catch (auditError) {
        console.warn("Audit logging failed:", auditError);
      }

      toast.success("Pet updated successfully!");
    } catch (error) {
      console.error("Error updating pet:", error);
      toast.error("Error updating pet: " + error.message);
    }
  };

  const deletePet = async (petId) => {
    try {
      if (usingMockData || !supabase) {
        // Delete from mock data
        setPets((prev) => prev.filter((pet) => pet.id !== petId));
        toast.success("Pet deleted successfully! (Demo mode)");
        return;
      }

      // Check for related appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id")
        .eq("pet_id", petId)
        .eq("status", "scheduled");

      if (appointments && appointments.length > 0) {
        toast.error(
          "Cannot delete pet with scheduled appointments. Please cancel or complete appointments first."
        );
        return;
      }

      const { error } = await supabase.from("pets").delete().eq("id", petId);

      if (error) {
        if (error.code === "42P01" || error.code === "42703") {
          // Fall back to mock delete
          setPets((prev) => prev.filter((pet) => pet.id !== petId));
          setUsingMockData(true);
          toast.success("Pet deleted successfully! (Demo mode)");
          return;
        }
        throw error;
      }

      await fetchPets();
      try {
        await auditPetDeletion(petId);
      } catch (auditError) {
        console.warn("Audit logging failed:", auditError);
      }

      toast.success("Pet deleted successfully!");
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Error deleting pet: " + error.message);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [user]);

  // Separate effect for real-time subscriptions
  useEffect(() => {
    // Set up real-time subscription for pets
    if (!user?.id && userRole !== "vet-owner" && userRole !== "main-branch") {
      return;
    }

    console.log("🔌 Setting up real-time subscription for pets");

    const channel = supabase
      .channel("pets-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pets",
        },
        (payload) => {
          console.log("🔄 Real-time pet update:", payload.eventType, payload);

          // For all events, refetch to get complete data with owner info
          // This ensures proper filtering for main-branch role
          switch (payload.eventType) {
            case "INSERT":
              // For pet-owner, only add if it belongs to them
              if (
                userRole === "pet-owner" &&
                payload.new.owner_id !== user.id
              ) {
                return;
              }
              // For main-branch and vet-owner, refetch to get owner metadata for filtering
              console.log("➕ New pet detected, refetching...");
              fetchPets();
              break;

            case "UPDATE":
              // For pet-owner, only update if it belongs to them
              if (
                userRole === "pet-owner" &&
                payload.new.owner_id !== user.id
              ) {
                return;
              }
              // For main-branch and vet-owner, refetch to get updated owner metadata
              console.log("✏️ Pet updated, refetching...");
              fetchPets();
              break;

            case "DELETE":
              // For pet-owner, only delete if it belongs to them
              if (
                userRole === "pet-owner" &&
                payload.old.owner_id !== user.id
              ) {
                return;
              }
              console.log("🗑️ Pet deleted, updating list...");
              setPets((oldPets) =>
                oldPets.filter((item) => item.id !== payload.old.id)
              );
              break;

            default:
              break;
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log("🔌 Unsubscribing from pet changes");
      channel.unsubscribe();
    };
  }, [user?.id, user?.user_metadata?.clinicName, userRole]);

  return {
    pets,
    loading,
    usingMockData,
    createPet,
    updatePet,
    deletePet,
    refreshPets: fetchPets,
  };
};
