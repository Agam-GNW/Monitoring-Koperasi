import { Koperasi, Activity, DashboardStats, KoperasiType, KoperasiStatus, LegalStatus } from '../types';

export const mockKoperasi: Koperasi[] = [
  {
    id: '1',
    name: 'Koperasi Maju Bersama',
    type: 'SIMPAN_PINJAM',
    status: 'AKTIF_SEHAT',
    legalStatus: 'LEGAL',
    totalMembers: 125,
    registrationDate: new Date('2023-01-15'),
    lastActivity: new Date('2024-08-15'),
    address: 'Jl. Sudirman No. 123, Jakarta',
    contactPerson: 'Ahmad Wijaya',
    contactPhone: '+62 812-3456-7890',
    fundingSource: 'SIMPANAN_ANGGOTA',
    initialCapital: 50000000,
    ratDocument: {
      fileName: 'RAT_2024_MajuBersama.pdf',
      uploadDate: new Date('2024-06-15'),
      status: 'APPROVED'
    },
    ownerId: 'user1'
  },
  {
    id: '2',
    name: 'Koperasi Berkah Mandiri',
    type: 'KONSUMSI',
    status: 'AKTIF_SEHAT',
    legalStatus: 'LEGAL',
    totalMembers: 89,
    registrationDate: new Date('2023-03-20'),
    lastActivity: new Date('2024-08-10'),
    address: 'Jl. Pemuda No. 45, Bandung',
    contactPerson: 'Siti Nurhaliza',
    contactPhone: '+62 813-9876-5432',
    fundingSource: 'HIBAH_PEMERINTAH',
    initialCapital: 25000000,
    ratDocument: {
      fileName: 'RAT_2024_BerkahMandiri.pdf',
      uploadDate: new Date('2024-07-01'),
      status: 'APPROVED'
    },
    ownerId: 'user2'
  },
  {
    id: '3',
    name: 'Koperasi Sejahtera Produktif',
    type: 'PRODUKSI',
    status: 'AKTIF_TIDAK_SEHAT',
    legalStatus: 'PENDING_REVIEW',
    totalMembers: 67,
    registrationDate: new Date('2023-06-10'),
    lastActivity: new Date('2024-08-12'),
    address: 'Jl. Industri No. 78, Surabaya',
    contactPerson: 'Budi Santoso',
    contactPhone: '+62 814-5678-9012',
    fundingSource: 'PINJAMAN_BANK',
    initialCapital: 75000000,
    ratDocument: {
      fileName: 'RAT_2024_SejahteraProduk.pdf',
      uploadDate: new Date('2024-08-01'),
      status: 'PENDING'
    },
    ownerId: 'user3'
  },
  {
    id: '4',
    name: 'Koperasi Pelayanan Prima',
    type: 'JASA',
    status: 'TIDAK_DISETUJUI',
    legalStatus: 'REJECTED',
    totalMembers: 45,
    registrationDate: new Date('2023-09-05'),
    lastActivity: new Date('2024-06-20'),
    address: 'Jl. Service No. 99, Medan',
    contactPerson: 'Dewi Lestari',
    contactPhone: '+62 815-1234-5678',
    fundingSource: 'SIMPANAN_WAJIB',
    initialCapital: 15000000,
    ratDocument: {
      fileName: 'RAT_2024_PelayananPrima.pdf',
      uploadDate: new Date('2024-05-15'),
      status: 'REJECTED'
    },
    ownerId: 'user4'
  },
  {
    id: '5',
    name: 'Koperasi Multi Usaha Nusantara',
    type: 'SERBA_USAHA',
    status: 'AKTIF_SEHAT',
    legalStatus: 'LEGAL',
    totalMembers: 203,
    registrationDate: new Date('2022-11-30'),
    lastActivity: new Date('2024-08-17'),
    address: 'Jl. Nusantara No. 156, Yogyakarta',
    contactPerson: 'Eko Prasetyo',
    contactPhone: '+62 816-7890-1234',
    fundingSource: 'MODAL_PENYERTAAN',
    initialCapital: 100000000,
    ratDocument: {
      fileName: 'RAT_2024_MultiUsaha.pdf',
      uploadDate: new Date('2024-07-20'),
      status: 'APPROVED'
    },
    ownerId: 'user5'
  },
  {
    id: '6',
    name: 'Koperasi Tani Makmur',
    type: 'PRODUKSI',
    status: 'AKTIF_SEHAT',
    legalStatus: 'LEGAL',
    totalMembers: 156,
    registrationDate: new Date('2023-02-28'),
    lastActivity: new Date('2024-08-14'),
    address: 'Jl. Pertanian No. 321, Malang',
    contactPerson: 'Suryadi',
    contactPhone: '+62 817-2468-1357',
    fundingSource: 'SIMPANAN_SUKARELA',
    initialCapital: 40000000,
    ratDocument: {
      fileName: 'RAT_2024_TaniMakmur.pdf',
      uploadDate: new Date('2024-06-30'),
      status: 'APPROVED'
    },
    ownerId: 'user6'
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    koperasiId: '1',
    title: 'Rapat Anggota Tahunan (RAT) 2024',
    description: 'Rapat evaluasi kinerja tahun 2024 dan perencanaan strategis 2025',
    date: new Date('2024-12-15'),
    type: 'MEETING',
    status: 'PLANNED'
  },
  {
    id: '2',
    koperasiId: '2',
    title: 'Pelatihan Manajemen Keuangan',
    description: 'Workshop pengelolaan keuangan koperasi untuk pengurus',
    date: new Date('2024-09-20'),
    type: 'TRAINING',
    status: 'PLANNED'
  },
  {
    id: '3',
    koperasiId: '3',
    title: 'Audit Internal Semester 2',
    description: 'Pemeriksaan internal operasional dan keuangan',
    date: new Date('2024-09-10'),
    type: 'AUDIT',
    status: 'PLANNED'
  },
  {
    id: '4',
    koperasiId: '5',
    title: 'Pameran Produk UMKM',
    description: 'Partisipasi dalam pameran produk unggulan anggota',
    date: new Date('2024-10-05'),
    type: 'EVENT',
    status: 'PLANNED'
  },
  {
    id: '5',
    koperasiId: '6',
    title: 'Sosialisasi Program Baru',
    description: 'Pengenalan program simpan pinjam dengan bunga kompetitif',
    date: new Date('2024-08-25'),
    type: 'OTHER',
    status: 'COMPLETED'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalKoperasi: 6,
  activeKoperasi: 5,
  inactiveKoperasi: 1,
  totalMembers: 685,
  legalKoperasi: 4,
  pendingLegal: 1,
  monthlyGrowth: 12.5,
  typeDistribution: [
    { type: 'SIMPAN_PINJAM', count: 1, percentage: 16.7 },
    { type: 'KONSUMSI', count: 1, percentage: 16.7 },
    { type: 'PRODUKSI', count: 2, percentage: 33.3 },
    { type: 'JASA', count: 1, percentage: 16.7 },
    { type: 'SERBA_USAHA', count: 1, percentage: 16.7 }
  ]
};

export const getKoperasiTypeLabel = (type: KoperasiType): string => {
  const labels = {
    SIMPAN_PINJAM: 'Simpan Pinjam',
    KONSUMSI: 'Konsumsi',
    PRODUKSI: 'Produksi', 
    JASA: 'Jasa',
    SERBA_USAHA: 'Serba Usaha'
  };
  return labels[type];
};

export const getStatusLabel = (status: KoperasiStatus): string => {
  const labels = {
    PENDING: 'Pending',
    AKTIF_SEHAT: 'Aktif Sehat',
    AKTIF_TIDAK_SEHAT: 'Aktif Tidak Sehat',
    TIDAK_DISETUJUI: 'Tidak Disetujui'
  };
  return labels[status];
};

export const getLegalStatusLabel = (status: LegalStatus): string => {
  const labels = {
    LEGAL: 'Legal',
    PENDING_REVIEW: 'Menunggu Review',
    REJECTED: 'Ditolak',
    NOT_SUBMITTED: 'Belum Submit'
  };
  return labels[status];
};
