export interface Staff {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  phone: string;
  locationId: string;
  joinDate: string;
  status: "active" | "inactive" | "on-leave";
  salary: number;
  dressSize: "S" | "M" | "L" | "XL" | "XXL";
  dressIssued: boolean;
  dressIssuedDate?: string;
  avatar?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radius: number;
  contactPerson: string;
  contactPhone: string;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  locationId: string;
  locationName: string;
  date: string;
  checkIn?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkOut?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  status: "present" | "absent" | "late" | "half-day";
  verifiedByLocation: boolean;
}

export interface DressItem {
  id: string;
  staffId: string;
  staffName: string;
  itemType: "Shirt" | "Trousers" | "Boots" | "Belt" | "Cap" | "Jacket" | "ID Card";
  size: string;
  issuedDate: string;
  condition: "New" | "Good" | "Worn" | "Damaged";
  nextReplacement?: string;
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paidDate?: string;
  status: "pending" | "paid";
}
