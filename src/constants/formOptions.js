export const APPOINTMENT_TYPES = [
  { value: 'annual_checkup', label: 'Annual Checkup' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgical_consultation', label: 'Surgical Consultation' },
  { value: 'emergency_care', label: 'Emergency Care' },
  { value: 'dental_care', label: 'Dental Care' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'behavioral_consultation', label: 'Behavioral Consultation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'other', label: 'Other' }
];

export const PRIORITY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'guinea_pig', label: 'Guinea Pig' },
  { value: 'ferret', label: 'Ferret' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' }
];

export const GENDER_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
];

export const SERVICE_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'dental', label: 'Dental Care' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'medication', label: 'Medication' },
  { value: 'other', label: 'Other' }
];

export const ADOPTION_STATUS = [
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'adopted', label: 'Adopted' },
  { value: 'unavailable', label: 'Unavailable' }
];

export const AGE_CATEGORIES = [
  { value: 'puppy_kitten', label: 'Puppy/Kitten (0-1 year)' },
  { value: 'young', label: 'Young (1-3 years)' },
  { value: 'adult', label: 'Adult (3-7 years)' },
  { value: 'senior', label: 'Senior (7+ years)' }
];

export const SIZE_CATEGORIES = [
  { value: 'small', label: 'Small (0-25 lbs)' },
  { value: 'medium', label: 'Medium (25-60 lbs)' },
  { value: 'large', label: 'Large (60-100 lbs)' },
  { value: 'extra_large', label: 'Extra Large (100+ lbs)' }
];

export const ENERGY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very High' }
];

export const GOOD_WITH = [
  { value: 'children', label: 'Children' },
  { value: 'cats', label: 'Cats' },
  { value: 'dogs', label: 'Dogs' },
  { value: 'seniors', label: 'Seniors' }
];

export const APPLICATION_STATUS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
];

// =====================================================
// INVENTORY MANAGEMENT CONSTANTS
// =====================================================

export const INVENTORY_ITEM_TYPES = [
  { value: 'medicine', label: 'Medicine' },
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'supply', label: 'Medical Supply' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'food', label: 'Food & Nutrition' },
  { value: 'other', label: 'Other' }
];

export const DOSAGE_FORMS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'powder', label: 'Powder' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'other', label: 'Other' }
];

export const ADMINISTRATION_ROUTES = [
  { value: 'oral', label: 'Oral' },
  { value: 'injection', label: 'Injection' },
  { value: 'topical', label: 'Topical' },
  { value: 'intravenous', label: 'Intravenous' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'other', label: 'Other' }
];

export const UNITS_OF_MEASURE = [
  { value: 'units', label: 'Units' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'capsules', label: 'Capsules' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'l', label: 'Liters (L)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'vials', label: 'Vials' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packs', label: 'Packs' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'cans', label: 'Cans' }
];

export const TRANSACTION_TYPES = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'used', label: 'Used in Treatment' },
  { value: 'adjustment', label: 'Stock Adjustment' },
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'returned', label: 'Returned' },
  { value: 'transfer', label: 'Transfer' }
];

export const ALERT_TYPES = [
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'expired', label: 'Expired' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'overstock', label: 'Overstock' },
  { value: 'discontinued', label: 'Discontinued' }
];

export const ALERT_SEVERITY = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export const PURCHASE_ORDER_STATUS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent to Supplier' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'partially_received', label: 'Partially Received' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const STORAGE_CONDITIONS = [
  { value: 'room_temperature', label: 'Room Temperature (15-25°C)' },
  { value: 'refrigerated', label: 'Refrigerated (2-8°C)' },
  { value: 'frozen', label: 'Frozen (-20°C)' },
  { value: 'controlled_room_temperature', label: 'Controlled Room Temperature' },
  { value: 'dry_place', label: 'Store in Dry Place' },
  { value: 'dark_place', label: 'Store Away from Light' }
];

export const MEDICINE_SUBTYPES = [
  { value: 'antibiotic', label: 'Antibiotic' },
  { value: 'anti-inflammatory', label: 'Anti-inflammatory' },
  { value: 'pain_reliever', label: 'Pain Reliever' },
  { value: 'antihistamine', label: 'Antihistamine' },
  { value: 'sedative', label: 'Sedative' },
  { value: 'vitamin', label: 'Vitamin/Supplement' },
  { value: 'hormone', label: 'Hormone' },
  { value: 'cardiac', label: 'Cardiac Medication' },
  { value: 'antifungal', label: 'Antifungal' },
  { value: 'antiparasitic', label: 'Antiparasitic' },
  { value: 'other', label: 'Other' }
];

export const VACCINE_SUBTYPES = [
  { value: 'core', label: 'Core Vaccine' },
  { value: 'non_core', label: 'Non-Core Vaccine' },
  { value: 'combination', label: 'Combination Vaccine' },
  { value: 'rabies', label: 'Rabies Vaccine' },
  { value: 'other', label: 'Other' }
];

export const SUPPLIER_PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15 Days' },
  { value: 'net_30', label: 'Net 30 Days' },
  { value: 'net_45', label: 'Net 45 Days' },
  { value: 'net_60', label: 'Net 60 Days' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'other', label: 'Other Terms' }
];