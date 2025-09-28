-- Create vet_owner_branches table
CREATE TABLE vet_owner_branches (
  branch_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_code VARCHAR(50) UNIQUE NOT NULL,
  branch_name VARCHAR(200) NOT NULL,
  branch_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (branch_id already has PRIMARY KEY index)
CREATE INDEX idx_vet_owner_branches_branch_code ON vet_owner_branches(branch_code);
CREATE INDEX idx_vet_owner_branches_name ON vet_owner_branches(branch_name);
CREATE INDEX idx_vet_owner_branches_type ON vet_owner_branches(branch_type);

-- Insert sample data
INSERT INTO vet_owner_branches (branch_code, branch_name, branch_type) VALUES
('BR001', 'Naga', 'main-branch'),
('BR002', 'Pili', 'sub-branch'),
('BR003', 'Legazpi', 'sub-branch');