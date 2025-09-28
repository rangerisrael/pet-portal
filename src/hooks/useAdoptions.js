import { useState, useEffect } from 'react';

// Safe import of supabase with error handling
let supabase = null;
try {
  const supabaseModule = require('@/lib/supabase');
  supabase = supabaseModule.supabase;
} catch (error) {
  console.log('Supabase not available, using mock data only:', error.message);
}
const mockAdoptionPets = [
  {
    id: 'adopt-1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    age_category: 'adult',
    size: 'large',
    gender: 'male',
    description: 'Max is a friendly and energetic Golden Retriever who loves to play fetch and swim. He\'s great with children and other dogs, making him the perfect family companion.',
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500',
    status: 'available',
    adoption_fee: 350,
    location: 'San Francisco, CA',
    energy_level: 'high',
    good_with: ['children', 'dogs'],
    vaccinated: true,
    microchipped: true,
    spayed_neutered: true,
    special_needs: false,
    urgent: false,
    contact_info: {
      phone: '(555) 123-4567',
      email: 'adopt@shelter.org'
    },
    shelter_id: 'shelter-1',
    listed_date: '2024-01-15T00:00:00Z',
    last_updated: '2024-01-20T00:00:00Z'
  },
  {
    id: 'adopt-2',
    name: 'Luna',
    species: 'cat',
    breed: 'Domestic Shorthair',
    age: 2,
    age_category: 'young',
    size: 'medium',
    gender: 'female',
    description: 'Luna is a sweet and gentle cat who loves to curl up in sunny spots and purr contentedly. She would do well in a quiet home and gets along with other cats.',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500',
    status: 'available',
    adoption_fee: 125,
    location: 'San Francisco, CA',
    energy_level: 'moderate',
    good_with: ['cats'],
    vaccinated: true,
    microchipped: true,
    spayed_neutered: true,
    special_needs: false,
    urgent: false,
    contact_info: {
      phone: '(555) 123-4567',
      email: 'adopt@shelter.org'
    },
    shelter_id: 'shelter-1',
    listed_date: '2024-01-12T00:00:00Z',
    last_updated: '2024-01-18T00:00:00Z'
  },
  {
    id: 'adopt-3',
    name: 'Buddy',
    species: 'dog',
    breed: 'Beagle Mix',
    age: 5,
    age_category: 'adult',
    size: 'medium',
    gender: 'male',
    description: 'Buddy is a calm and loving senior dog who enjoys gentle walks and lots of belly rubs. He\'s perfect for someone looking for a laid-back companion.',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
    status: 'pending',
    adoption_fee: 200,
    location: 'Oakland, CA',
    energy_level: 'low',
    good_with: ['children', 'seniors'],
    vaccinated: true,
    microchipped: true,
    spayed_neutered: true,
    special_needs: true,
    urgent: true,
    contact_info: {
      phone: '(555) 987-6543',
      email: 'help@rescue.org'
    },
    shelter_id: 'shelter-2',
    listed_date: '2024-01-10T00:00:00Z',
    last_updated: '2024-01-15T00:00:00Z'
  },
  {
    id: 'adopt-4',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Maine Coon',
    age: 1,
    age_category: 'puppy_kitten',
    size: 'large',
    gender: 'male',
    description: 'Whiskers is a playful kitten with a big personality. He loves to explore, climb, and play with toys. He would thrive in an active household.',
    image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
    status: 'available',
    adoption_fee: 175,
    location: 'Berkeley, CA',
    energy_level: 'very_high',
    good_with: ['children'],
    vaccinated: true,
    microchipped: false,
    spayed_neutered: false,
    special_needs: false,
    urgent: false,
    contact_info: {
      phone: '(555) 456-7890',
      email: 'info@petrescue.org'
    },
    shelter_id: 'shelter-3',
    listed_date: '2024-01-18T00:00:00Z',
    last_updated: '2024-01-22T00:00:00Z'
  },
  {
    id: 'adopt-5',
    name: 'Bella',
    species: 'dog',
    breed: 'Pit Bull Terrier',
    age: 4,
    age_category: 'adult',
    size: 'large',
    gender: 'female',
    description: 'Bella is a strong and loyal dog who forms deep bonds with her family. She\'s great with older children and would love to have a yard to run in.',
    image_url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=500',
    status: 'available',
    adoption_fee: 275,
    location: 'San Jose, CA',
    energy_level: 'high',
    good_with: ['children'],
    vaccinated: true,
    microchipped: true,
    spayed_neutered: true,
    special_needs: false,
    urgent: true,
    contact_info: {
      phone: '(555) 321-0987',
      email: 'adopt@animalshelter.org'
    },
    shelter_id: 'shelter-4',
    listed_date: '2024-01-05T00:00:00Z',
    last_updated: '2024-01-12T00:00:00Z'
  }
];

const mockApplications = [
  {
    id: 'app-1',
    petId: 'adopt-1',
    petName: 'Max',
    applicantName: 'John Smith',
    applicationDate: '2024-01-20T00:00:00Z',
    status: 'under_review',
    email: 'john@example.com',
    phone: '(555) 111-2222'
  }
];

export const useAdoptions = (user = null) => {
  const [adoptionPets, setAdoptionPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    species: [],
    ageCategory: [],
    size: [],
    energyLevel: [],
    goodWith: [],
    status: '',
    minFee: '',
    maxFee: '',
    urgent: false,
    specialNeeds: false,
    microchipped: false,
    vaccinated: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price_low, price_high, name_az, name_za

  // Load initial data
  useEffect(() => {
    loadAdoptionPets();
    loadApplications();
    loadFavorites();
  }, []);

  const loadAdoptionPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, skip database and use mock data directly
      // This ensures the system works while debugging database issues
      console.log('Loading adoption pets from mock data for stable demo');
      setAdoptionPets(mockAdoptionPets);
      return;

      // Check if supabase is available
      if (!supabase) {
        console.log('Supabase client not available, using mock data');
        setAdoptionPets(mockAdoptionPets);
        return;
      }

      // Check if adoption_pets table exists
      console.log('Attempting to query adoption_pets table...');
      const { data: testPets, error: testError } = await supabase
        .from('adoption_pets')
        .select('id')
        .limit(1);

      if (testError) {
        console.log('Database query error:', testError);
        if (testError.code === '42P01') {
          console.log('Table adoption_pets does not exist - using mock data');
        } else {
          console.log('Other database error:', testError.message || 'Unknown error');
        }
        setAdoptionPets(mockAdoptionPets);
        return;
      }

      // Fetch pets from database
      const { data: pets, error: petsError } = await supabase
        .from('adoption_pets')
        .select(`
          *,
          shelter:vet_owner_branches(branch_name),
          applications:adoption_applications(id, application_status)
        `)
        .in('status', ['available', 'pending'])
        .order('listed_date', { ascending: false });

      if (petsError) throw petsError;

      // Transform the data to match the expected format
      const transformedPets = pets?.map(pet => ({
        ...pet,
        // Ensure compatibility with existing component structure
        location: pet.location || `${pet.shelter?.branch_name || 'Unknown Location'}`,
        contact_info: {
          phone: pet.contact_phone,
          email: pet.contact_email
        },
        shelter_id: pet.shelter_id,
        applications_count: pet.applications?.length || 0
      })) || [];

      setAdoptionPets(transformedPets);
    } catch (err) {
      console.error('Error loading adoption pets:', err);
      console.error('Error details:', {
        message: err?.message || 'Unknown error',
        code: err?.code || 'No code',
        details: err?.details || 'No details',
        hint: err?.hint || 'No hint'
      });

      setError('Using sample data - database connection issue');
      // Fallback to mock data
      setAdoptionPets(mockAdoptionPets);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      // Use mock applications for demo
      console.log('Loading applications from mock data');
      setApplications(mockApplications);
    } catch (err) {
      console.error('Error loading applications:', err);
      setApplications(mockApplications);
    }
  };

  const loadFavorites = async () => {
    try {
      // Use localStorage for favorites in demo mode
      console.log('Loading favorites from localStorage');
      const saved = localStorage.getItem('adoption_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
    }
  };

  // Filter and sort pets
  const getFilteredPets = () => {
    let filtered = [...adoptionPets];

    // Text search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(search) ||
        pet.breed.toLowerCase().includes(search) ||
        pet.description.toLowerCase().includes(search) ||
        pet.location.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filters.species.length > 0) {
      filtered = filtered.filter(pet => filters.species.includes(pet.species));
    }

    if (filters.ageCategory.length > 0) {
      filtered = filtered.filter(pet => filters.ageCategory.includes(pet.age_category));
    }

    if (filters.size.length > 0) {
      filtered = filtered.filter(pet => filters.size.includes(pet.size));
    }

    if (filters.energyLevel.length > 0) {
      filtered = filtered.filter(pet => filters.energyLevel.includes(pet.energy_level));
    }

    if (filters.goodWith.length > 0) {
      filtered = filtered.filter(pet =>
        filters.goodWith.some(trait => pet.good_with?.includes(trait))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(pet => pet.status === filters.status);
    }

    if (filters.minFee) {
      filtered = filtered.filter(pet => pet.adoption_fee >= Number(filters.minFee));
    }

    if (filters.maxFee) {
      filtered = filtered.filter(pet => pet.adoption_fee <= Number(filters.maxFee));
    }

    if (filters.urgent) {
      filtered = filtered.filter(pet => pet.urgent);
    }

    if (filters.specialNeeds) {
      filtered = filtered.filter(pet => pet.special_needs);
    }

    if (filters.microchipped) {
      filtered = filtered.filter(pet => pet.microchipped);
    }

    if (filters.vaccinated) {
      filtered = filtered.filter(pet => pet.vaccinated);
    }

    // Sort results
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.listed_date) - new Date(b.listed_date));
        break;
      case 'price_low':
        filtered.sort((a, b) => a.adoption_fee - b.adoption_fee);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.adoption_fee - a.adoption_fee);
        break;
      case 'name_az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.listed_date) - new Date(a.listed_date));
        break;
    }

    return filtered;
  };

  // Actions
  const toggleFavorite = async (petId) => {
    try {
      const isCurrentlyFavorited = favorites.includes(petId);
      const updatedFavorites = isCurrentlyFavorited
        ? favorites.filter(id => id !== petId)
        : [...favorites, petId];

      // Update local state immediately for better UX
      setFavorites(updatedFavorites);
      localStorage.setItem('adoption_favorites', JSON.stringify(updatedFavorites));

      // If user is authenticated, also update database
      if (user) {
        if (isCurrentlyFavorited) {
          // Remove from favorites
          const { error } = await supabase
            .from('adoption_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('pet_id', petId);

          if (error && error.code !== '42P01') {
            console.error('Error removing favorite:', error);
          }
        } else {
          // Add to favorites
          const { error } = await supabase
            .from('adoption_favorites')
            .insert({
              user_id: user.id,
              pet_id: petId
            });

          if (error && error.code !== '42P01') {
            console.error('Error adding favorite:', error);
          }
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const submitApplication = async (applicationData) => {
    try {
      // Create application for demo with proper form data mapping
      const mockApplication = {
        id: `app-${Date.now()}`,
        petId: applicationData.petId,
        petName: applicationData.petName,
        applicantName: `${applicationData.firstName} ${applicationData.lastName}`,
        applicantEmail: applicationData.email,
        applicantPhone: applicationData.phone,
        applicantAddress: applicationData.address,
        applicantCity: applicationData.city,
        applicantState: applicationData.state,
        applicantZip: applicationData.zipCode,
        householdType: applicationData.residenceType,
        hasYard: applicationData.hasYard,
        yardFenced: applicationData.yardFenced,
        householdMembers: applicationData.householdMembers,
        childrenAges: applicationData.childrenAges,
        petExperience: applicationData.petExperience,
        whyAdopt: applicationData.whyAdopt,
        exercisePlan: applicationData.exercisePlan,
        workSchedule: applicationData.workSchedule,
        housingOwned: applicationData.ownOrRent === 'own',
        landlordContact: applicationData.landlordContact,
        emergencyContactName: applicationData.emergencyContact?.name,
        emergencyContactPhone: applicationData.emergencyContact?.phone,
        references: [applicationData.personalReference1, applicationData.personalReference2],
        applicationStatus: 'submitted',
        applicationDate: applicationData.applicationDate,
        agreesToTerms: applicationData.agreesToTerms,
        agreesToHomeVisit: applicationData.agreesToHomeVisit,
        understandsCommitment: applicationData.understandsCommitment,
        status: 'submitted'
      };

      console.log('Submitting adoption application:', mockApplication);
      setApplications(prev => [mockApplication, ...prev]);
      return { success: true, application: mockApplication };
    } catch (err) {
      console.error('Error submitting application:', err);
      throw new Error('Failed to submit application: ' + err.message);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      species: [],
      ageCategory: [],
      size: [],
      energyLevel: [],
      goodWith: [],
      status: '',
      minFee: '',
      maxFee: '',
      urgent: false,
      specialNeeds: false,
      microchipped: false,
      vaccinated: false
    });
    setSearchTerm('');
  };

  // CRUD operations for vet-owners
  const createAdoptionPet = async (petData) => {
    try {
      // Create mock pet for demo
      const newPet = {
        id: `adopt-${Date.now()}`,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        age_category: petData.ageCategory,
        size: petData.size,
        gender: petData.gender,
        description: petData.description,
        image_url: petData.imageUrl || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
        adoption_fee: petData.adoptionFee,
        location: petData.location,
        energy_level: petData.energyLevel,
        good_with: petData.goodWith,
        vaccinated: petData.vaccinated,
        microchipped: petData.microchipped,
        spayed_neutered: petData.spayedNeutered,
        special_needs: petData.specialNeeds,
        special_needs_description: petData.specialNeedsDescription,
        urgent: petData.urgent,
        urgent_reason: petData.urgentReason,
        medical_history: petData.medicalHistory,
        behavioral_notes: petData.behavioralNotes,
        contact_phone: petData.contactPhone,
        contact_email: petData.contactEmail,
        shelter_id: petData.shelterId,
        listed_by: user?.id,
        status: 'available',
        listed_date: new Date().toISOString(),
        contact_info: {
          phone: petData.contactPhone,
          email: petData.contactEmail
        }
      };

      setAdoptionPets(prev => [newPet, ...prev]);
      return { success: true, pet: newPet };
    } catch (err) {
      console.error('Error creating adoption pet:', err);
      throw new Error('Failed to create adoption pet: ' + err.message);
    }
  };

  const updateAdoptionPet = async (petId, updates) => {
    try {
      // Update mock pet for demo
      setAdoptionPets(prev => prev.map(pet =>
        pet.id === petId
          ? {
              ...pet,
              ...updates,
              last_updated: new Date().toISOString(),
              contact_info: {
                phone: updates.contact_phone || pet.contact_phone,
                email: updates.contact_email || pet.contact_email
              }
            }
          : pet
      ));

      return { success: true, pet: { id: petId, ...updates } };
    } catch (err) {
      console.error('Error updating adoption pet:', err);
      throw new Error('Failed to update adoption pet: ' + err.message);
    }
  };

  const deleteAdoptionPet = async (petId) => {
    try {
      // Remove from mock data for demo
      setAdoptionPets(prev => prev.filter(pet => pet.id !== petId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting adoption pet:', err);
      throw new Error('Failed to delete adoption pet: ' + err.message);
    }
  };

  const updatePetStatus = async (petId, status, adoptedBy = null) => {
    try {
      const updates = {
        status,
        last_updated: new Date().toISOString()
      };

      if (status === 'adopted' && adoptedBy) {
        updates.adoption_date = new Date().toISOString();
        updates.adopted_by = adoptedBy;
      }

      // Update mock data for demo
      setAdoptionPets(prev => prev.map(pet =>
        pet.id === petId ? { ...pet, ...updates } : pet
      ));

      return { success: true, pet: { id: petId, ...updates } };
    } catch (err) {
      console.error('Error updating pet status:', err);
      throw new Error('Failed to update pet status: ' + err.message);
    }
  };

  const reviewApplication = async (applicationId, status, notes = '') => {
    try {
      const { data: updatedApplication, error: updateError } = await supabase
        .from('adoption_applications')
        .update({
          application_status: status,
          review_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local applications if this user's
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, ...updatedApplication, status: updatedApplication.application_status } : app
      ));

      return { success: true, application: updatedApplication };
    } catch (err) {
      console.error('Error reviewing application:', err);
      throw new Error('Failed to review application: ' + err.message);
    }
  };

  // Get statistics
  const getStats = () => {
    const available = adoptionPets.filter(pet => pet.status === 'available').length;
    const pending = adoptionPets.filter(pet => pet.status === 'pending').length;
    const urgent = adoptionPets.filter(pet => pet.urgent).length;
    const myApplications = applications.length;

    return {
      totalPets: adoptionPets.length,
      available,
      pending,
      adopted: adoptionPets.filter(pet => pet.status === 'adopted').length,
      urgent,
      favorites: favorites.length,
      myApplications
    };
  };

  return {
    // Data
    adoptionPets,
    applications,
    favorites,
    filteredPets: getFilteredPets(),

    // State
    loading,
    error,
    filters,
    searchTerm,
    sortBy,

    // Actions
    toggleFavorite,
    submitApplication,
    updateFilter,
    clearFilters,
    setSearchTerm,
    setSortBy,
    loadAdoptionPets,

    // CRUD operations for vet-owners
    createAdoptionPet,
    updateAdoptionPet,
    deleteAdoptionPet,
    updatePetStatus,
    reviewApplication,

    // Computed
    stats: getStats(),

    // Utils
    isFavorited: (petId) => favorites.includes(petId)
  };
};

export default useAdoptions;