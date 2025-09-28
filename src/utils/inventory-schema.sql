
  -- 1. Create inventory_items table (Master catalog)
  CREATE TABLE inventory_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('vaccine', 'medication', 'supplies', 'equipment')),
      description TEXT,
      unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'pieces',
      minimum_stock_level INTEGER NOT NULL DEFAULT 10,
      unit_cost DECIMAL(10,2),
      supplier_info JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 2. Create branch_inventory table (Stock levels per branch)
  CREATE TABLE branch_inventory (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      branch_id UUID NOT NULL REFERENCES vet_owner_branches(branch_id) ON DELETE CASCADE,
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      current_stock INTEGER NOT NULL DEFAULT 0,
      reserved_stock INTEGER NOT NULL DEFAULT 0, -- Stock allocated but not yet used
      minimum_threshold INTEGER NOT NULL DEFAULT 10,
      maximum_threshold INTEGER NOT NULL DEFAULT 100,
      last_restocked_at TIMESTAMP WITH TIME ZONE,
      expiry_date DATE,
      batch_number VARCHAR(100),
      storage_location VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(branch_id, inventory_item_id, batch_number)
  );

  -- 3. Create stock_requests table (Requests from sub-branches to main branch)
  CREATE TABLE stock_requests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      request_number VARCHAR(50) UNIQUE NOT NULL,
      requesting_branch_id UUID NOT NULL REFERENCES vet_owner_branches(branch_id) ON DELETE CASCADE,
      target_branch_id UUID REFERENCES vet_owner_branches(branch_id), -- Usually main branch
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
      approved_quantity INTEGER DEFAULT 0,
      reason TEXT,
      urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled',
  'cancelled')),
      requested_by UUID NOT NULL REFERENCES auth.users(id),
      reviewed_by UUID REFERENCES auth.users(id),
      notes TEXT,
      requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      fulfilled_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. Create stock_transactions table (Track all inventory movements)
  CREATE TABLE stock_transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      transaction_number VARCHAR(50) UNIQUE NOT NULL,
      branch_id UUID NOT NULL REFERENCES vet_owner_branches(branch_id) ON DELETE CASCADE,
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'transfer',
  'adjustment', 'expired', 'damaged')),
      quantity INTEGER NOT NULL,
      remaining_stock INTEGER NOT NULL,
      unit_cost DECIMAL(10,2),
      total_cost DECIMAL(10,2),
      reference_type VARCHAR(50), -- 'stock_request', 'appointment', 'manual_adjustment', etc.
      reference_id UUID,
      batch_number VARCHAR(100),
      expiry_date DATE,
      performed_by UUID NOT NULL REFERENCES auth.users(id),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 5. Create inventory_alerts table (Low stock and expiry alerts)
  CREATE TABLE inventory_alerts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      branch_id UUID NOT NULL REFERENCES vet_owner_branches(branch_id) ON DELETE CASCADE,
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon',
  'expired')),
      alert_level VARCHAR(20) DEFAULT 'warning' CHECK (alert_level IN ('info', 'warning', 'critical')),
      message TEXT NOT NULL,
      is_acknowledged BOOLEAN DEFAULT false,
      acknowledged_by UUID REFERENCES auth.users(id),
      acknowledged_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 6. Add indexes for better performance
  CREATE INDEX idx_branch_inventory_branch_id ON branch_inventory(branch_id);
  CREATE INDEX idx_branch_inventory_item_id ON branch_inventory(inventory_item_id);
  CREATE INDEX idx_branch_inventory_stock ON branch_inventory(current_stock);
  CREATE INDEX idx_stock_requests_branch_id ON stock_requests(requesting_branch_id);
  CREATE INDEX idx_stock_requests_status ON stock_requests(status);
  CREATE INDEX idx_stock_requests_created_at ON stock_requests(requested_at);
  CREATE INDEX idx_stock_transactions_branch_id ON stock_transactions(branch_id);
  CREATE INDEX idx_stock_transactions_type ON stock_transactions(transaction_type);
  CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);
  CREATE INDEX idx_inventory_alerts_branch_id ON inventory_alerts(branch_id);
  CREATE INDEX idx_inventory_alerts_acknowledged ON inventory_alerts(is_acknowledged);

  -- 7. Create functions for auto-generating numbers
  CREATE OR REPLACE FUNCTION generate_request_number()
  RETURNS VARCHAR(50) AS $$
  DECLARE
      new_number VARCHAR(50);
      counter INTEGER;
  BEGIN
      -- Get current date in YYYYMMDD format
      SELECT COUNT(*) + 1 INTO counter
      FROM stock_requests
      WHERE DATE(requested_at) = CURRENT_DATE;

      new_number := 'REQ-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');

      RETURN new_number;
  END;
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE FUNCTION generate_transaction_number()
  RETURNS VARCHAR(50) AS $$
  DECLARE
      new_number VARCHAR(50);
      counter INTEGER;
  BEGIN
      -- Get current date in YYYYMMDD format
      SELECT COUNT(*) + 1 INTO counter
      FROM stock_transactions
      WHERE DATE(created_at) = CURRENT_DATE;

      new_number := 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');

      RETURN new_number;
  END;
  $$ LANGUAGE plpgsql;

  -- 8. Create triggers to auto-populate numbers and update timestamps
  CREATE OR REPLACE FUNCTION set_request_number()
  RETURNS TRIGGER AS $$
  BEGIN
      IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
          NEW.request_number := generate_request_number();
      END IF;
      NEW.updated_at := NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE FUNCTION set_transaction_number()
  RETURNS TRIGGER AS $$
  BEGIN
      IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
          NEW.transaction_number := generate_transaction_number();
      END IF;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE OR REPLACE FUNCTION update_inventory_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create triggers
  CREATE TRIGGER trigger_set_request_number
      BEFORE INSERT ON stock_requests
      FOR EACH ROW EXECUTE FUNCTION set_request_number();

  CREATE TRIGGER trigger_update_stock_request_timestamp
      BEFORE UPDATE ON stock_requests
      FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

  CREATE TRIGGER trigger_set_transaction_number
      BEFORE INSERT ON stock_transactions
      FOR EACH ROW EXECUTE FUNCTION set_transaction_number();

  CREATE TRIGGER trigger_update_branch_inventory_timestamp
      BEFORE UPDATE ON branch_inventory
      FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

  CREATE TRIGGER trigger_update_inventory_items_timestamp
      BEFORE UPDATE ON inventory_items
      FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

  -- 9. Create function to check and create alerts
  CREATE OR REPLACE FUNCTION check_inventory_alerts()
  RETURNS VOID AS $$
  DECLARE
      inventory_record RECORD;
      alert_message TEXT;
  BEGIN
      -- Clear old alerts that are no longer relevant
      DELETE FROM inventory_alerts
      WHERE alert_type IN ('low_stock', 'out_of_stock')
      AND created_at < NOW() - INTERVAL '1 day';

      -- Check for low stock and out of stock
      FOR inventory_record IN
          SELECT
              bi.branch_id,
              bi.inventory_item_id,
              bi.current_stock,
              bi.minimum_threshold,
              ii.item_name,
              vob.branch_name
          FROM branch_inventory bi
          JOIN inventory_items ii ON bi.inventory_item_id = ii.id
          JOIN vet_owner_branches vob ON bi.branch_id = vob.branch_id
          WHERE bi.current_stock <= bi.minimum_threshold
      LOOP
          IF inventory_record.current_stock = 0 THEN
              alert_message := 'Out of stock: ' || inventory_record.item_name || ' at ' ||
  inventory_record.branch_name;

              INSERT INTO inventory_alerts (branch_id, inventory_item_id, alert_type, alert_level, message)
              VALUES (inventory_record.branch_id, inventory_record.inventory_item_id, 'out_of_stock', 'critical',
  alert_message)
              ON CONFLICT DO NOTHING;
          ELSE
              alert_message := 'Low stock alert: ' || inventory_record.item_name || ' (' ||
  inventory_record.current_stock || ' remaining) at ' || inventory_record.branch_name;

              INSERT INTO inventory_alerts (branch_id, inventory_item_id, alert_type, alert_level, message)
              VALUES (inventory_record.branch_id, inventory_record.inventory_item_id, 'low_stock', 'warning',
  alert_message)
              ON CONFLICT DO NOTHING;
          END IF;
      END LOOP;

      -- Check for expiring items (within 30 days)
      FOR inventory_record IN
          SELECT
              bi.branch_id,
              bi.inventory_item_id,
              bi.expiry_date,
              ii.item_name,
              vob.branch_name
          FROM branch_inventory bi
          JOIN inventory_items ii ON bi.inventory_item_id = ii.id
          JOIN vet_owner_branches vob ON bi.branch_id = vob.branch_id
          WHERE bi.expiry_date IS NOT NULL
          AND bi.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
          AND bi.current_stock > 0
      LOOP
          IF inventory_record.expiry_date <= CURRENT_DATE THEN
              alert_message := 'Expired: ' || inventory_record.item_name || ' at ' || inventory_record.branch_name
  || ' (expired on ' || inventory_record.expiry_date || ')';

              INSERT INTO inventory_alerts (branch_id, inventory_item_id, alert_type, alert_level, message)
              VALUES (inventory_record.branch_id, inventory_record.inventory_item_id, 'expired', 'critical',
  alert_message)
              ON CONFLICT DO NOTHING;
          ELSE
              alert_message := 'Expiring soon: ' || inventory_record.item_name || ' at ' ||
  inventory_record.branch_name || ' (expires on ' || inventory_record.expiry_date || ')';

              INSERT INTO inventory_alerts (branch_id, inventory_item_id, alert_type, alert_level, message)
              VALUES (inventory_record.branch_id, inventory_record.inventory_item_id, 'expiring_soon', 'warning',
  alert_message)
              ON CONFLICT DO NOTHING;
          END IF;
      END LOOP;
  END;
  $$ LANGUAGE plpgsql;

  -- 10. Insert sample inventory items
  INSERT INTO inventory_items (item_name, item_type, description, unit_of_measure, minimum_stock_level, unit_cost)
  VALUES
  ('Rabies Vaccine', 'vaccine', 'Annual rabies vaccination for dogs and cats', 'vials', 20, 15.50),
  ('DHPP Vaccine', 'vaccine', 'Distemper, Hepatitis, Parvovirus, Parainfluenza vaccine', 'vials', 15, 25.00),
  ('Amoxicillin 250mg', 'medication', 'Antibiotic for bacterial infections', 'tablets', 50, 0.75),
  ('Metacam 1.5mg/ml', 'medication', 'Anti-inflammatory for dogs', 'bottles', 10, 35.00),
  ('Disposable Syringes 3ml', 'supplies', 'Single-use syringes for injections', 'pieces', 100, 0.25),
  ('Examination Gloves', 'supplies', 'Latex-free examination gloves', 'boxes', 20, 8.50),
  ('Digital Thermometer', 'equipment', 'Pet digital thermometer', 'pieces', 5, 25.00),
  ('Bandages 2-inch', 'supplies', 'Self-adhesive bandages', 'rolls', 30, 3.50);

  -- 11. RLS Policies
  ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

  -- Policies for inventory_items (readable by all authenticated users)
  CREATE POLICY "inventory_items_read" ON inventory_items FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "inventory_items_insert" ON inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "inventory_items_update" ON inventory_items FOR UPDATE USING (auth.role() = 'authenticated');

  -- Policies for branch_inventory (users can only see their branch inventory)
  CREATE POLICY "branch_inventory_read" ON branch_inventory FOR SELECT USING (
      EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = branch_inventory.branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = branch_inventory.branch_id
      )
  );

  CREATE POLICY "branch_inventory_insert" ON branch_inventory FOR INSERT WITH CHECK (
      EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = branch_inventory.branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = branch_inventory.branch_id
      )
  );

  CREATE POLICY "branch_inventory_update" ON branch_inventory FOR UPDATE USING (
      EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = branch_inventory.branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = branch_inventory.branch_id
      )
  );

  -- Policies for stock_requests
  CREATE POLICY "stock_requests_read" ON stock_requests FOR SELECT USING (
      requested_by = auth.uid()
      OR EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND (vs.designated_branch_id = stock_requests.requesting_branch_id
               OR vs.designated_branch_id = stock_requests.target_branch_id)
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND (vob.branch_id = stock_requests.requesting_branch_id
               OR vob.branch_id = stock_requests.target_branch_id)
      )
  );

  CREATE POLICY "stock_requests_insert" ON stock_requests FOR INSERT WITH CHECK (
      requested_by = auth.uid()
      AND EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = stock_requests.requesting_branch_id
      )
  );

  CREATE POLICY "stock_requests_update" ON stock_requests FOR UPDATE USING (
      requested_by = auth.uid()
      OR EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = stock_requests.target_branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = stock_requests.target_branch_id
      )
  );

  -- Similar policies for stock_transactions and inventory_alerts
  CREATE POLICY "stock_transactions_read" ON stock_transactions FOR SELECT USING (
      EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = stock_transactions.branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = stock_transactions.branch_id
      )
  );

  CREATE POLICY "inventory_alerts_read" ON inventory_alerts FOR SELECT USING (
      EXISTS (
          SELECT 1 FROM veterinary_staff vs
          WHERE vs.assigned_id = auth.uid()
          AND vs.designated_branch_id = inventory_alerts.branch_id
      )
      OR EXISTS (
          SELECT 1 FROM vet_owner_branches vob
          WHERE vob.vet_owner_id = auth.uid()
          AND vob.branch_id = inventory_alerts.branch_id
      )
  );