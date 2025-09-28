-- Create vet_owner_branches table
CREATE TABLE vet_owner_branches (
  staff_id SERIAL PRIMARY KEY,
  staff_type VARCHAR(50) UNIQUE NOT NULL,
  vet_owner_id REFFERENCE auth user
  assigned_id REFFERENCE auth user
  designated_branch_id REFFERENCE auth vet_owner_branches
  invitation_accepted BOOLEAN 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_vet_owner_staff_id ON vet_owner_branches(staff_id);
CREATE INDEX idx_vet_owner_staff_type ON vet_owner_branches(staff_type);

-- Insert sample data
INSERT INTO vet_owner_branches (staff_type, vet_owner_id, assigned_id,designated_branch_id,invitation_accepted) VALUES
('resident', 'Naga', 'e7c1bad6-f683-4c03-8ee2-3a856774c951','dd0986eb-40a1-429c-86c2-74c814887781','1','false'),
