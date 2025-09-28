-- Create veterinary_staff table
CREATE TABLE veterinary_staff (
  staff_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_code VARCHAR(50) UNIQUE NOT NULL,
  staff_name VARCHAR(200) NOT NULL,
  staff_email VARCHAR(255) UNIQUE NOT NULL,
  staff_type VARCHAR(20) NOT NULL CHECK (staff_type IN ('resident', 'assistant')),
  vet_owner_id UUID NOT NULL,
  assigned_id UUID,
  designated_branch_id SERIAL NOT NULL,
  invitation_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_veterinary_staff_branch
    FOREIGN KEY (designated_branch_id)
    REFERENCES vet_owner_branches(branch_id)
    ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_veterinary_staff_staff_code ON veterinary_staff(staff_code);
CREATE INDEX idx_veterinary_staff_email ON veterinary_staff(staff_email);
CREATE INDEX idx_veterinary_staff_type ON veterinary_staff(staff_type);
CREATE INDEX idx_veterinary_staff_branch ON veterinary_staff(designated_branch_id);
CREATE INDEX idx_veterinary_staff_owner ON veterinary_staff(vet_owner_id);
CREATE INDEX idx_veterinary_staff_invitation ON veterinary_staff(invitation_accepted);

-- Insert sample data
INSERT INTO veterinary_staff (staff_code, staff_name, staff_email, staff_type, vet_owner_id, assigned_id, designated_branch_id, invitation_accepted) VALUES
('VS001', 'Dr. Maria Santos', 'maria.santos@example.com', 'resident', 'e7c1bad6-f683-4c03-8ee2-3a856774c951', 'e7c1bad6-f683-4c03-8ee2-3a856774c951', 1, true),
('VS002', 'John Dela Cruz', 'john.delacruz@example.com', 'assistant', 'e7c1bad6-f683-4c03-8ee2-3a856774c951', 'dd0986eb-40a1-429c-86c2-74c814887781', 2, false),
('VS003', 'Dr. Ana Reyes', 'ana.reyes@example.com', 'resident', 'e7c1bad6-f683-4c03-8ee2-3a856774c951', 'dd0986eb-40a1-429c-86c2-74c814887781', 3, true);