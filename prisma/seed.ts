import { PrismaClient, KoperasiType, KoperasiStatus, LegalStatus, ActivityType, ActivityStatus } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'HIGH' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@koperasi.gov.id';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Super Administrator';

  const hashedPassword = await hashPassword(adminPassword);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'HIGH',
      emailVerified: new Date(),
    },
  });

  console.log('Admin user created:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  // Create sample LOW users (pengelola koperasi)
  const lowUsers = [];
  const lowUserData = [
    { name: 'Ahmad Wijaya', email: 'ahmad@majubersama.com' },
    { name: 'Siti Nurhaliza', email: 'siti@berkahmandiri.com' },
    { name: 'Budi Santoso', email: 'budi@sejahterproduktif.com' },
  ];

  for (const userData of lowUserData) {
    const hashedPw = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPw,
        role: 'LOW',
        emailVerified: new Date(),
      },
    });
    lowUsers.push(user);
    console.log('LOW user created:', user.email);
  }

  // Create some sample koperasi data
  const sampleKoperasi = [
    {
      name: 'Koperasi Maju Bersama',
      type: KoperasiType.SIMPAN_PINJAM,
      status: KoperasiStatus.AKTIF_SEHAT,
      legalStatus: LegalStatus.LEGAL,
      totalMembers: 125,
      address: 'Jl. Sudirman No. 123, Jakarta',
      contactPerson: 'Ahmad Wijaya',
      contactPhone: '+62 812-3456-7890',
      contactEmail: 'ahmad@majubersama.com',
      description: 'Koperasi simpan pinjam untuk kesejahteraan anggota',
      submissionDate: new Date('2024-01-15'),
      approvalDate: new Date('2024-01-20'),
      approvalNotes: 'Semua dokumen lengkap dan memenuhi persyaratan',
      ownerId: lowUsers[0].id,
    },
    {
      name: 'Koperasi Berkah Mandiri',
      type: KoperasiType.KONSUMSI,
      status: KoperasiStatus.AKTIF_SEHAT,
      legalStatus: LegalStatus.LEGAL,
      totalMembers: 89,
      address: 'Jl. Pemuda No. 45, Bandung',
      contactPerson: 'Siti Nurhaliza',
      contactPhone: '+62 813-9876-5432',
      contactEmail: 'siti@berkahmandiri.com',
      description: 'Koperasi konsumsi kebutuhan pokok anggota',
      submissionDate: new Date('2024-02-10'),
      approvalDate: new Date('2024-02-15'),
      approvalNotes: 'Disetujui dengan catatan untuk melengkapi dokumen RAT',
      ownerId: lowUsers[1].id,
    },
    {
      name: 'Koperasi Sejahtera Produktif',
      type: KoperasiType.PRODUKSI,
      status: KoperasiStatus.PENDING,
      legalStatus: LegalStatus.PENDING_REVIEW,
      totalMembers: 67,
      address: 'Jl. Industri No. 78, Surabaya',
      contactPerson: 'Budi Santoso',
      contactPhone: '+62 814-5678-9012',
      contactEmail: 'budi@sejahterproduktif.com',
      description: 'Koperasi produksi hasil pertanian dan kerajinan',
      submissionDate: new Date('2024-03-01'),
      ownerId: lowUsers[2].id,
    },
  ];

  for (const koperasiData of sampleKoperasi) {
    await prisma.koperasi.create({
      data: koperasiData,
    });
  }

  console.log('Sample koperasi data created');

  // Create sample activities
  const koperasiList = await prisma.koperasi.findMany();
  
  const sampleActivities = [
    {
      title: 'Rapat Anggota Tahunan (RAT) 2024',
      description: 'Rapat evaluasi kinerja tahun 2024 dan perencanaan strategis 2025',
      date: new Date('2024-12-15'),
      type: ActivityType.MEETING,
      status: ActivityStatus.PLANNED,
      location: 'Gedung Serbaguna Koperasi',
      koperasiId: koperasiList[0]?.id,
    },
    {
      title: 'Pelatihan Manajemen Keuangan',
      description: 'Workshop pengelolaan keuangan koperasi untuk pengurus',
      date: new Date('2024-09-20'),
      type: ActivityType.TRAINING,
      status: ActivityStatus.PLANNED,
      location: 'Ruang Pelatihan Lt. 2',
      koperasiId: koperasiList[1]?.id,
    },
    {
      title: 'Audit Internal Semester 2',
      description: 'Pemeriksaan internal operasional dan keuangan',
      date: new Date('2024-09-10'),
      type: ActivityType.AUDIT,
      status: ActivityStatus.PLANNED,
      location: 'Kantor Koperasi',
      koperasiId: koperasiList[2]?.id,
    },
  ];

  for (const activityData of sampleActivities) {
    if (activityData.koperasiId) {
      await prisma.activity.create({
        data: activityData,
      });
    }
  }

  console.log('Sample activities created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
