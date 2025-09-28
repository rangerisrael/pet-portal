-- Adoption Tables for Pet Portal
-- This file contains all the necessary tables for managing pet adoptions

-- Table for pets available for adoption
CREATE TABLE IF NOT EXISTS adoption_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
    breed VARCHAR(100),
    age INTEGER NOT NULL CHECK (age >= 0),
    age_category VARCHAR(20) NOT NULL CHECK (age_category IN ('puppy_kitten', 'young', 'adult', 'senior')),
    size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large', 'extra_large')),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'unknown')),
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted', 'on_hold', 'withdrawn')),
    adoption_fee DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(200),
    energy_level VARCHAR(20) CHECK (energy_level IN ('very_low', 'low', 'moderate', 'high', 'very_high')),
    good_with JSONB, -- Array of traits like ['children', 'dogs', 'cats', 'seniors']
    vaccinated BOOLEAN DEFAULT false,
    microchipped BOOLEAN DEFAULT false,
    spayed_neutered BOOLEAN DEFAULT false,
    special_needs BOOLEAN DEFAULT false,
    special_needs_description TEXT,
    urgent BOOLEAN DEFAULT false,
    urgent_reason TEXT,
    medical_history TEXT,
    behavioral_notes TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    shelter_id INTEGER,
    listed_by UUID,
    listed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    adoption_date TIMESTAMP WITH TIME ZONE,
    adopted_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for adoption applications
CREATE TABLE IF NOT EXISTS adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES adoption_pets(id) ON DELETE CASCADE,
    applicant_name VARCHAR(200) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    applicant_address TEXT,
    applicant_city VARCHAR(100),
    applicant_state VARCHAR(50),
    applicant_zip VARCHAR(20),
    household_type VARCHAR(50), -- 'house', 'apartment', 'condo', 'other'
    has_yard BOOLEAN DEFAULT false,
    yard_fenced BOOLEAN DEFAULT false,
    household_members INTEGER DEFAULT 1,
    children_ages TEXT, -- JSON array or comma-separated
    other_pets TEXT, -- Description of other pets
    previous_pet_experience TEXT,
    veterinarian_name VARCHAR(200),
    veterinarian_phone VARCHAR(20),
    why_adopt TEXT,
    pet_care_plan TEXT,
    work_schedule TEXT,
    housing_owned BOOLEAN DEFAULT false,
    landlord_approval BOOLEAN DEFAULT true,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    reference_contacts TEXT, -- JSON array of references
    application_status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (application_status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
    review_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    approval_notes TEXT,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for adoption favorites/watchlist
CREATE TABLE IF NOT EXISTS adoption_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pet_id UUID NOT NULL REFERENCES adoption_pets(id) ON DELETE CASCADE,
    added_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pet_id)
);

-- Table for adoption inquiries/messages
CREATE TABLE IF NOT EXISTS adoption_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES adoption_pets(id) ON DELETE CASCADE,
    inquirer_name VARCHAR(200) NOT NULL,
    inquirer_email VARCHAR(255) NOT NULL,
    inquirer_phone VARCHAR(20),
    message TEXT NOT NULL,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'adoption', 'medical', 'behavior')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
    reply_message TEXT,
    replied_by UUID,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for adoption events
CREATE TABLE IF NOT EXISTS adoption_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    featured_pets JSONB, -- Array of pet IDs
    event_type VARCHAR(50) DEFAULT 'adoption_fair' CHECK (event_type IN ('adoption_fair', 'meet_greet', 'fundraiser', 'education')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    branch_id INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for adoption success stories
CREATE TABLE IF NOT EXISTS adoption_success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES adoption_pets(id),
    adopter_name VARCHAR(200),
    story_title VARCHAR(200),
    story_content TEXT NOT NULL,
    photos JSONB, -- Array of photo URLs
    permission_to_share BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_adoption_pets_status ON adoption_pets(status);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_species ON adoption_pets(species);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_shelter ON adoption_pets(shelter_id);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_listed_date ON adoption_pets(listed_date);
CREATE INDEX IF NOT EXISTS idx_adoption_pets_urgent ON adoption_pets(urgent);

CREATE INDEX IF NOT EXISTS idx_adoption_applications_pet ON adoption_applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_status ON adoption_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_adoption_applications_date ON adoption_applications(application_date);

CREATE INDEX IF NOT EXISTS idx_adoption_favorites_user ON adoption_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_favorites_pet ON adoption_favorites(pet_id);

CREATE INDEX IF NOT EXISTS idx_adoption_inquiries_pet ON adoption_inquiries(pet_id);
CREATE INDEX IF NOT EXISTS idx_adoption_inquiries_status ON adoption_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_adoption_events_date ON adoption_events(event_date);
CREATE INDEX IF NOT EXISTS idx_adoption_events_branch ON adoption_events(branch_id);
CREATE INDEX IF NOT EXISTS idx_adoption_events_status ON adoption_events(status);



-- Sample data for testing
INSERT INTO adoption_pets (
    name, species, breed, age, age_category, size, gender, description,
    adoption_fee, location, energy_level, good_with, vaccinated, microchipped,
    spayed_neutered, urgent, contact_email, contact_phone
) VALUES
(
    'Max', 'dog', 'Golden Retriever', 3, 'adult', 'large', 'male',
    'Max is a friendly and energetic Golden Retriever who loves to play fetch and swim. He''s great with children and other dogs, making him the perfect family companion.',
    350.00, 'San Francisco, CA', 'high', '["children", "dogs"]'::jsonb,
    true, true, true, false, 'adopt@shelter.org', '(555) 123-4567'
),
(
    'Luna', 'cat', 'Domestic Shorthair', 2, 'young', 'medium', 'female',
    'Luna is a sweet and gentle cat who loves to curl up in sunny spots and purr contentedly. She would do well in a quiet home and gets along with other cats.',
    125.00, 'San Francisco, CA', 'moderate', '["cats"]'::jsonb,
    true, true, true, false, 'adopt@shelter.org', '(555) 123-4567'
),
(
    'Buddy', 'dog', 'Beagle Mix', 5, 'adult', 'medium', 'male',
    'Buddy is a calm and loving senior dog who enjoys gentle walks and lots of belly rubs. He''s perfect for someone looking for a laid-back companion.',
    200.00, 'Oakland, CA', 'low', '["children", "seniors"]'::jsonb,
    true, true, true, true, 'help@rescue.org', '(555) 987-6543'
),
(
    'Whiskers', 'cat', 'Maine Coon', 1, 'puppy_kitten', 'large', 'male',
    'Whiskers is a playful kitten with a big personality. He loves to explore, climb, and play with toys. He would thrive in an active household.',
    175.00, 'Berkeley, CA', 'very_high', '["children"]'::jsonb,
    true, false, false, false, 'info@petrescue.org', '(555) 456-7890'
),
(
    'Bella', 'dog', 'Pit Bull Terrier', 4, 'adult', 'large', 'female',
    'Bella is a strong and loyal dog who forms deep bonds with her family. She''s great with older children and would love to have a yard to run in.',
    275.00, 'San Jose, CA', 'high', '["children"]'::jsonb,
    true, true, true, true, 'adopt@animalshelter.org', '(555) 321-0987'
);