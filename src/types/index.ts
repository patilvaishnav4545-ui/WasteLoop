export type Role = 'ROLE_CITIZEN' | 'ROLE_COLLECTOR' | 'ROLE_FACILITY' | 'ROLE_ADMIN';

export type WasteCategory =
  | 'Plastic'
  | 'Paper'
  | 'Metal'
  | 'Glass'
  | 'Organic'
  | 'E-Waste'
  | 'Mixed'
  | 'Other';

export type ReportStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'SUSPICIOUS'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'COLLECTED'
  | 'RECEIVED_AT_FACILITY'
  | 'SORTING'
  | 'PROCESSING'
  | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  activeTasksCount?: number;
  status?: 'Available' | 'Busy' | 'Offline';
  facilityType?: string;
  address?: string;
}

export interface WastePoint {
  id: string;
  imageUrl: string;
  lat: number;
  lng: number;
  address: string;
  predictedCategory: WasteCategory;
  confidence: number;
  notes?: string;
}

export interface WasteReport {
  id: string; // e.g. WR-1025
  areaCleanupId?: string; // e.g. AREA-101
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  points: WastePoint[];
  primaryCategory: WasteCategory;
  aiValidation: {
    isValid: boolean;
    confidence: number;
    reasoning: string;
    isDuplicateRisk: boolean;
    duplicateReferenceId?: string;
  };
  location: {
    address: string;
    lat: number;
    lng: number;
    cityArea: string;
  };
  status: ReportStatus;
  createdAt: string; // ISO string
  updatedAt: string;
  collectorId?: string;
  collectorName?: string;
  facilityId?: string;
  facilityName?: string;
  collectionProof?: {
    beforeImageUrl: string;
    afterImageUrl: string;
    collectedKg?: number;
    collectedAt?: string;
    notes?: string;
  };
  facilityProcessing?: {
    receivedKg: number;
    receivedAt: string;
    sortingBreakdown: Record<WasteCategory, number>; // kg per category
    processingDestinations: Array<{
      category: WasteCategory;
      quantityKg: number;
      destination: string; // e.g., 'EcoPlastic Recycling Pvt Ltd'
      method: string; // e.g. 'Mechanical Recycling', 'Composting', 'Refuse Derived Fuel'
    }>;
    recoveredKg: number;
    residualKg: number;
    completedAt?: string;
  };
}

export interface Facility {
  id: string;
  name: string;
  type: 'Material Recovery Facility' | 'Plastic Recycler' | 'Paper Recycler' | 'Composting Facility' | 'E-Waste Processor';
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  acceptedMaterials: WasteCategory[];
  capacityKgPerDay: number;
  currentStockKg: number;
  operatorName: string;
}

export interface Hotspot {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  reportCount30Days: number;
  topCategory: WasteCategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
}

export interface NotificationItem {
  id: string;
  targetRole: Role | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  reportId?: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  reportId?: string;
  details: string;
}
