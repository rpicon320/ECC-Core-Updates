// ✅ Master Category List for ECC Resource Directory
// Cleaned, consistent, and grouped

export const RESOURCE_CATEGORIES = [
  // 1️⃣ Living & Housing Options
  'Independent Living Communities (IL)',
  'Assisted Living Facilities (ALF)',
  'Memory Care Facilities',
  'Continuing Care Retirement Communities (CCRC)',
  'Other Living & Housing Options',

  // 2️⃣ Medical Facilities
  'Local Hospitals',
  'Skilled Nursing Facilities (SNF)',
  'Inpatient Rehabilitation Centers',
  'Rehabilitation Hospitals',
  'Other Medical Facilities',

  // 3️⃣ In-Home & Community-Based Care
  'In-Home Care Providers (Non-Medical)',
  'Home Health Agencies (Skilled Nursing)',
  'Hospice & Palliative Care Providers',
  'Respite Care Services',
  'Patient Advocacy Services',
  'Volunteer & Companion Services',
  'Volunteer Driver Programs',
  'Other In-Home & Community-Based Care',

  // 4️⃣ Support Services & Programs
  'Adult Day Care Centers',
  'Senior Centers with Workshops',
  'Senior Visitor Programs',
  'Family Caregiver Training Programs',
  'Caregiver Support Groups',
  'Bereavement & Grief Support Groups',
  'Dementia & Alzheimer\'s Support Groups',
  'Faith-Based Support Services',
  'Support Hotlines & Helplines',
  'Other Support Services & Programs',

  // 5️⃣ Medical & Clinical Providers
  'Primary Care Physicians (Geriatricians)',
  'Specialty Physicians',
  'Cardiologists',
  'Dentists',
  'Dermatologists',
  'Endocrinologists',
  'Eye Care Providers',
  'Gastroenterologists',
  'Neurologists',
  'Oncologists',
  'Orthopedic Surgeons',
  'Pharmacies',
  'Podiatrists',
  'Pulmonologists',
  'Rheumatologists',
  'Urologists',
  'Other Specialty Physicians',
  'Specialty Treatment Centers',
  'Memory Clinics',
  'Mental Health & Counseling Services',
  'Occupational Therapy Providers',
  'Physical Therapy Providers',
  'Speech Therapy Providers',
  'Other Medical & Clinical Providers',

  // 6️⃣ Financial, Legal & Insurance
  'Attorneys',
  'Elder Law Attorneys',
  'Estate Planning Attorneys',
  'Guardianship & Conservatorship',
  'Other Attorneys',
  'Financial Planners for Seniors',
  'Medicaid & Medicare Advisors',
  'Medicare Counselors',
  'Medicaid Application Assistance',
  'Long-Term Care Insurance Providers',
  'Veteran\'s Benefit Navigators',
  'Veterans\' Benefits Counselors',
  'Other Financial, Legal & Insurance',

  // 7️⃣ Equipment & Home Safety
  'Durable Medical Equipment (DME)',
  'Mobility Equipment Suppliers',
  'Medical Alert & Monitoring Systems',
  'Safety & Fall Prevention Equipment',
  'Home Modification Contractors',
  'Other Equipment & Home Safety',

  // 8️⃣ Transportation & Delivery
  'Non-Emergency Medical Transportation (NEMT)',
  'Senior Ride Programs',
  'Grocery Delivery Programs',
  'Meal Delivery Services',
  'Other Transportation & Delivery',

  // 9️⃣ Community Resources & Government Programs
  'Area Agency on Aging Programs',
  'Other Community Resources & Government Programs'
] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];

// ✅ Hierarchy: main category → subcategories
export const CATEGORY_HIERARCHY: Record<string, readonly string[]> = {
  'Living & Housing Options': [
    'Independent Living Communities (IL)',
    'Assisted Living Facilities (ALF)',
    'Memory Care Facilities',
    'Continuing Care Retirement Communities (CCRC)',
    'Other Living & Housing Options',
  ],
  'Medical Facilities': [
    'Local Hospitals',
    'Skilled Nursing Facilities (SNF)',
    'Inpatient Rehabilitation Centers',
    'Rehabilitation Hospitals',
    'Other Medical Facilities',
  ],
  'In-Home & Community-Based Care': [
    'In-Home Care Providers (Non-Medical)',
    'Home Health Agencies (Skilled Nursing)',
    'Hospice & Palliative Care Providers',
    'Respite Care Services',
    'Patient Advocacy Services',
    'Volunteer & Companion Services',
    'Volunteer Driver Programs',
    'Other In-Home & Community-Based Care',
  ],
  'Support Services & Programs': [
    'Adult Day Care Centers',
    'Senior Centers with Workshops',
    'Senior Visitor Programs',
    'Family Caregiver Training Programs',
    'Caregiver Support Groups',
    'Bereavement & Grief Support Groups',
    'Dementia & Alzheimer\'s Support Groups',
    'Faith-Based Support Services',
    'Support Hotlines & Helplines',
    'Other Support Services & Programs',
  ],
  'Medical & Clinical Providers': [
    'Primary Care Physicians (Geriatricians)',
    'Specialty Physicians',
    'Cardiologists',
    'Dentists',
    'Dermatologists',
    'Endocrinologists',
    'Eye Care Providers',
    'Gastroenterologists',
    'Neurologists',
    'Oncologists',
    'Orthopedic Surgeons',
    'Pharmacies',
    'Podiatrists',
    'Pulmonologists',
    'Rheumatologists',
    'Urologists',
    'Other Specialty Physicians',
    'Specialty Treatment Centers',
    'Memory Clinics',
    'Mental Health & Counseling Services',
    'Occupational Therapy Providers',
    'Physical Therapy Providers',
    'Speech Therapy Providers',
    'Other Medical & Clinical Providers',
  ],
  'Financial, Legal & Insurance': [
    'Attorneys',
    'Elder Law Attorneys',
    'Estate Planning Attorneys',
    'Guardianship & Conservatorship',
    'Other Attorneys',
    'Financial Planners for Seniors',
    'Medicaid & Medicare Advisors',
    'Medicare Counselors',
    'Medicaid Application Assistance',
    'Long-Term Care Insurance Providers',
    'Veteran\'s Benefit Navigators',
    'Veterans\' Benefits Counselors',
    'Other Financial, Legal & Insurance',
  ],
  'Equipment & Home Safety': [
    'Durable Medical Equipment (DME)',
    'Mobility Equipment Suppliers',
    'Medical Alert & Monitoring Systems',
    'Safety & Fall Prevention Equipment',
    'Home Modification Contractors',
    'Other Equipment & Home Safety',
  ],
  'Transportation & Delivery': [
    'Non-Emergency Medical Transportation (NEMT)',
    'Senior Ride Programs',
    'Grocery Delivery Programs',
    'Meal Delivery Services',
    'Other Transportation & Delivery',
  ],
  'Community Resources & Government Programs': [
    'Area Agency on Aging Programs',
    'Other Community Resources & Government Programs',
  ],
} as const;

// ✅ User-added custom categories
export const getCustomCategories = (): string[] => {
  const stored = localStorage.getItem('customCategories');
  return stored ? JSON.parse(stored) : [];
};

export const addCustomCategory = (category: string): void => {
  const existing = getCustomCategories();
  if (!existing.includes(category)) {
    const updated = [...existing, category];
    localStorage.setItem('customCategories', JSON.stringify(updated));
  }
};

export const removeCustomCategory = (category: string): void => {
  const existing = getCustomCategories();
  const updated = existing.filter(cat => cat !== category);
  localStorage.setItem('customCategories', JSON.stringify(updated));
};

// ✅ Get all categories (predefined + custom)
export const getAllCategories = (): string[] => {
  return [...RESOURCE_CATEGORIES, ...getCustomCategories()];
};

// ✅ Get category hierarchy including custom categories
export const getCategoryHierarchy = (): Record<string, string[]> => {
  const customCategories = getCustomCategories();
  const hierarchy = { ...CATEGORY_HIERARCHY };
  
  if (customCategories.length > 0) {
    hierarchy['Custom Categories'] = customCategories;
  }
  
  return hierarchy;
};

// ✅ Check if a category is custom
export const isCustomCategory = (category: string): boolean => {
  return getCustomCategories().includes(category);
};