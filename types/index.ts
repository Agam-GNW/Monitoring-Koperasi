export type UserRole = 'HIGH' | 'LOW';

export type KoperasiType = 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';

export type KoperasiStatus = 
  | 'PENDING_VERIFICATION'    // Menunggu verifikasi dokumen
  | 'PENDING_SURVEY'          // Menunggu survei lokasi
  | 'SURVEY_SCHEDULED'        // Survei dijadwalkan
  | 'SURVEY_COMPLETED'        // Survei selesai
  | 'PENDING_APPROVAL'        // Menunggu persetujuan akhir
  | 'AKTIF_SEHAT'             // Disetujui dan sehat
  | 'AKTIF_TIDAK_SEHAT'       // Disetujui tapi tidak sehat
  | 'DITOLAK';                // Ditolak

export type LegalStatus = 'LEGAL' | 'PENDING_REVIEW' | 'REJECTED' | 'NOT_SUBMITTED';

export type DocumentType = 
  | 'AKTA_PENDIRIAN'    // Akta Pendirian Koperasi (AD/ART)
  | 'BERITA_ACARA'      // Berita Acara Rapat Pendirian
  | 'DAFTAR_PENDIRI'    // Daftar Nama & KTP Pendiri
  | 'BUKTI_SETORAN'     // Bukti Setoran Modal Awal
  | 'SURAT_DOMISILI'    // Surat Keterangan Domisili
  | 'NPWP'              // NPWP Koperasi
  | 'OTHER';            // Dokumen Lainnya

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';

export interface DocumentRequirement {
  id: string;
  documentType: DocumentType;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadDate: Date;
  reviewDate?: Date;
  reviewNotes?: string;
  reviewedBy?: string;
  isRequired: boolean;
  koperasiId: string;
}

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
