// Database Schema for Pet Adoption System
// This file contains the SQL schema definitions for adoption-related tables

export const adoptionTables = {
  // Main adoption pets table
  adoption_pets: `
    CREATE TABLE adoption_pets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      species VARCHAR(50) NOT NULL, -- dog, cat, bird, etc.
      breed VARCHAR(100),
      age INTEGER, -- in years
      age_category VARCHAR(50) NOT NULL, -- puppy_kitten, young, adult, senior
      size VARCHAR(50) NOT NULL, -- small, medium, large, extra_large
      gender VARCHAR(20) NOT NULL, -- male, female, unknown
      description TEXT,
      image_url TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'available', -- available, pending, adopted, unavailable
      adoption_fee DECIMAL(10,2),
      location VARCHAR(200),
      energy_level VARCHAR(50), -- low, moderate, high, very_high
      good_with TEXT[], -- array of traits: children, cats, dogs, seniors
      vaccinated BOOLEAN DEFAULT FALSE,
      microchipped BOOLEAN DEFAULT FALSE,
      spayed_neutered BOOLEAN DEFAULT FALSE,
      special_needs BOOLEAN DEFAULT FALSE,
      special_needs_description TEXT,
      urgent BOOLEAN DEFAULT FALSE,
      urgent_reason TEXT,
      medical_history TEXT,
      behavioral_notes TEXT,
      house_trained BOOLEAN DEFAULT FALSE,

      -- Contact and shelter info
      contact_phone VARCHAR(20),
      contact_email VARCHAR(255),
      shelter_id UUID REFERENCES shelters(id),
      foster_home_id UUID REFERENCES foster_homes(id),

      -- Metadata
      listed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID REFERENCES profiles(id),

      -- Constraints
      CONSTRAINT valid_status CHECK (status IN ('available', 'pending', 'adopted', 'unavailable')),
      CONSTRAINT valid_age_category CHECK (age_category IN ('puppy_kitten', 'young', 'adult', 'senior')),
      CONSTRAINT valid_size CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
      CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'unknown')),
      CONSTRAINT valid_energy_level CHECK (energy_level IN ('low', 'moderate', 'high', 'very_high'))
    );
  `,

  // Adoption applications table
  adoption_applications: `
    CREATE TABLE adoption_applications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      pet_id UUID NOT NULL REFERENCES adoption_pets(id),
      applicant_id UUID REFERENCES profiles(id),

      -- Personal Information
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      date_of_birth DATE,

      -- Address Information
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(50) NOT NULL,
      zip_code VARCHAR(20) NOT NULL,
      residence_type VARCHAR(50) NOT NULL, -- house, apartment, condo, other
      own_or_rent VARCHAR(20) NOT NULL, -- own, rent
      landlord_contact VARCHAR(255),

      -- Household Information
      household_members INTEGER DEFAULT 0,
      children_ages TEXT, -- comma-separated ages
      has_allergies BOOLEAN DEFAULT FALSE,
      allergy_details TEXT,

      -- Pet Experience
      previous_pets BOOLEAN DEFAULT FALSE,
      current_pets TEXT,
      pet_experience TEXT,
      veterinarian_contact VARCHAR(255),

      -- Care Plans
      exercise_plan TEXT NOT NULL,
      work_schedule TEXT NOT NULL,
      vacation_plans TEXT,
      budget_for_pet_care DECIMAL(10,2),

      -- Housing & Safety
      has_yard BOOLEAN DEFAULT FALSE,
      yard_fenced BOOLEAN DEFAULT FALSE,
      indoor_outdoor VARCHAR(20) DEFAULT 'both', -- indoor, outdoor, both
      pet_proofing TEXT,

      -- Motivation
      why_adopt TEXT NOT NULL,
      expectations TEXT,

      -- References (stored as JSON)
      personal_references JSONB, -- [{name, relationship, phone, email}, ...]
      emergency_contact JSONB, -- {name, relationship, phone, email}

      -- Agreements
      agrees_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
      agrees_to_home_visit BOOLEAN DEFAULT FALSE,
      understands_commitment BOOLEAN NOT NULL DEFAULT FALSE,

      -- Application Status
      status VARCHAR(50) NOT NULL DEFAULT 'submitted',
      application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      review_date TIMESTAMP WITH TIME ZONE,
      decision_date TIMESTAMP WITH TIME ZONE,
      reviewer_id UUID REFERENCES profiles(id),
      reviewer_notes TEXT,
      rejection_reason TEXT,

      -- Metadata
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      -- Constraints
      CONSTRAINT valid_application_status CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
      CONSTRAINT valid_residence_type CHECK (residence_type IN ('house', 'apartment', 'condo', 'other')),
      CONSTRAINT valid_own_or_rent CHECK (own_or_rent IN ('own', 'rent')),
      CONSTRAINT valid_indoor_outdoor CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both'))
    );
  `,

  // Adoption favorites/watchlist
  adoption_favorites: `
    CREATE TABLE adoption_favorites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES profiles(id),
      pet_id UUID NOT NULL REFERENCES adoption_pets(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      -- Ensure unique favorites per user/pet
      UNIQUE(user_id, pet_id)
    );
  `,

  // Shelters and rescue organizations
  shelters: `
    CREATE TABLE shelters (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      type VARCHAR(50) NOT NULL, -- shelter, rescue, foster_network
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      phone VARCHAR(20),
      email VARCHAR(255),
      website VARCHAR(255),
      description TEXT,
      license_number VARCHAR(100),
      capacity INTEGER,

      -- Contact person
      contact_person_name VARCHAR(200),
      contact_person_phone VARCHAR(20),
      contact_person_email VARCHAR(255),

      -- Operating info
      operating_hours JSONB, -- {monday: "9-5", tuesday: "9-5", ...}
      services TEXT[], -- array: adoption, fostering, veterinary, etc.

      -- Status
      active BOOLEAN DEFAULT TRUE,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT valid_shelter_type CHECK (type IN ('shelter', 'rescue', 'foster_network'))
    );
  `,

  // Foster homes
  foster_homes: `
    CREATE TABLE foster_homes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      foster_parent_id UUID REFERENCES profiles(id),
      shelter_id UUID REFERENCES shelters(id),

      -- Foster home details
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      home_type VARCHAR(50), -- house, apartment, farm, etc.
      yard_size VARCHAR(50), -- none, small, medium, large
      fenced_yard BOOLEAN DEFAULT FALSE,

      -- Capacity and preferences
      max_pets INTEGER DEFAULT 1,
      preferred_species TEXT[], -- dog, cat, etc.
      preferred_ages TEXT[], -- puppy_kitten, young, adult, senior
      can_handle_special_needs BOOLEAN DEFAULT FALSE,

      -- Experience and qualifications
      years_experience INTEGER DEFAULT 0,
      previous_fosters INTEGER DEFAULT 0,
      veterinarian_reference VARCHAR(255),

      -- Status
      active BOOLEAN DEFAULT TRUE,
      available BOOLEAN DEFAULT TRUE,
      current_pets INTEGER DEFAULT 0,

      -- Metadata
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT valid_home_type CHECK (home_type IN ('house', 'apartment', 'condo', 'farm', 'other')),
      CONSTRAINT valid_yard_size CHECK (yard_size IN ('none', 'small', 'medium', 'large'))
    );
  `,

  // Adoption events
  adoption_events: `
    CREATE TABLE adoption_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shelter_id UUID REFERENCES shelters(id),
      name VARCHAR(200) NOT NULL,
      description TEXT,
      event_type VARCHAR(50) NOT NULL, -- adoption_fair, meet_and_greet, fundraiser

      -- Event details
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      location TEXT NOT NULL,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      zip_code VARCHAR(20),

      -- Event info
      max_attendees INTEGER,
      registration_required BOOLEAN DEFAULT FALSE,
      fee DECIMAL(10,2) DEFAULT 0,
      pets_featured UUID[], -- array of pet IDs

      -- Status
      status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT valid_event_type CHECK (event_type IN ('adoption_fair', 'meet_and_greet', 'fundraiser', 'volunteer_training')),
      CONSTRAINT valid_event_status CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled'))
    );
  `,

  // Application status history/audit trail
  adoption_application_history: `
    CREATE TABLE adoption_application_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      application_id UUID NOT NULL REFERENCES adoption_applications(id),
      previous_status VARCHAR(50),
      new_status VARCHAR(50) NOT NULL,
      changed_by UUID REFERENCES profiles(id),
      change_reason TEXT,
      notes TEXT,
      changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

      CONSTRAINT valid_previous_status CHECK (previous_status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
      CONSTRAINT valid_new_status CHECK (new_status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn'))
    );
  `
};

// Indexes for better performance
export const adoptionIndexes = [
  'CREATE INDEX idx_adoption_pets_status ON adoption_pets(status);',
  'CREATE INDEX idx_adoption_pets_species ON adoption_pets(species);',
  'CREATE INDEX idx_adoption_pets_location ON adoption_pets(location);',
  'CREATE INDEX idx_adoption_pets_size ON adoption_pets(size);',
  'CREATE INDEX idx_adoption_pets_age_category ON adoption_pets(age_category);',
  'CREATE INDEX idx_adoption_pets_listed_date ON adoption_pets(listed_date);',
  'CREATE INDEX idx_adoption_pets_shelter ON adoption_pets(shelter_id);',

  'CREATE INDEX idx_adoption_applications_pet ON adoption_applications(pet_id);',
  'CREATE INDEX idx_adoption_applications_applicant ON adoption_applications(applicant_id);',
  'CREATE INDEX idx_adoption_applications_status ON adoption_applications(status);',
  'CREATE INDEX idx_adoption_applications_date ON adoption_applications(application_date);',

  'CREATE INDEX idx_adoption_favorites_user ON adoption_favorites(user_id);',
  'CREATE INDEX idx_adoption_favorites_pet ON adoption_favorites(pet_id);',

  'CREATE INDEX idx_shelters_active ON shelters(active);',
  'CREATE INDEX idx_shelters_type ON shelters(type);',
  'CREATE INDEX idx_shelters_city_state ON shelters(city, state);'
];

// Views for common queries
export const adoptionViews = [
  // Available pets with shelter info
  `CREATE VIEW available_pets_with_shelter AS
   SELECT
     ap.*,
     s.name as shelter_name,
     s.phone as shelter_phone,
     s.email as shelter_email,
     s.city as shelter_city,
     s.state as shelter_state
   FROM adoption_pets ap
   LEFT JOIN shelters s ON ap.shelter_id = s.id
   WHERE ap.status = 'available';`,

  // Application summary view
  `CREATE VIEW adoption_application_summary AS
   SELECT
     aa.id,
     aa.pet_id,
     ap.name as pet_name,
     ap.species,
     ap.breed,
     aa.first_name,
     aa.last_name,
     aa.email,
     aa.phone,
     aa.status,
     aa.application_date,
     aa.review_date,
     aa.decision_date
   FROM adoption_applications aa
   JOIN adoption_pets ap ON aa.pet_id = ap.id;`
];

// Sample data insertion functions
export const sampleAdoptionData = {
  shelters: [
    {
      name: 'Happy Paws Animal Shelter',
      type: 'shelter',
      city: 'San Francisco',
      state: 'CA',
      phone: '(555) 123-4567',
      email: 'adopt@happypaws.org'
    },
    {
      name: 'Golden Gate Rescue',
      type: 'rescue',
      city: 'Oakland',
      state: 'CA',
      phone: '(555) 987-6543',
      email: 'help@ggrescue.org'
    }
  ],

  pets: [
    {
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      age_category: 'adult',
      size: 'large',
      gender: 'male',
      description: 'Friendly and energetic Golden Retriever',
      adoption_fee: 350.00,
      location: 'San Francisco, CA',
      energy_level: 'high',
      good_with: ['children', 'dogs'],
      vaccinated: true,
      microchipped: true,
      spayed_neutered: true
    }
  ]
};

export default {
  tables: adoptionTables,
  indexes: adoptionIndexes,
  views: adoptionViews,
  sampleData: sampleAdoptionData
};