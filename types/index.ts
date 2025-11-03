export type UserRole = 'HIGH' | 'LOW';

export type KoperasiType = 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';

export type KoperasiStatus = 'PENDING' | 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT' | 'TIDAK_DISETUJUI';

export type LegalStatus = 'LEGAL' | 'PENDING_REVIEW' | 'REJECTED' | 'NOT_SUBMITTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ownedKoperasi?: Koperasi; // One user can only own one koperasi
}

export interface Koperasi {
  id: string;
  name: string;
  type: KoperasiType;
  status: KoperasiStatus;
  legalStatus: LegalStatus;
  totalMembers: number;
  registrationDate: Date;
  lastActivity: Date;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  description?: string;
  fundingSource: string;
  initialCapital: number;
  
  // Approval process fields
  submissionDate?: Date;
  approvalDate?: Date;
  approvalNotes?: string;
  rejectionReason?: string;
  
  // Owner relation
  ownerId: string;
  
  ratDocument?: {
    fileName: string;
    uploadDate: Date;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
  };
}

export interface Activity {
  id: string;
  koperasiId: string;
  title: string;
  description: string;
  date: Date;
  type: 'MEETING' | 'TRAINING' | 'AUDIT' | 'EVENT' | 'OTHER';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface DashboardStats {
  totalKoperasi: number;
  activeKoperasi: number;
  inactiveKoperasi: number;
  totalMembers: number;
  legalKoperasi: number;
  pendingLegal: number;
  monthlyGrowth: number;
  typeDistribution: {
    type: KoperasiType;
    count: number;
    percentage: number;
  }[];
}
