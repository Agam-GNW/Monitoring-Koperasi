'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../components/layout/LayoutWrapper';
import { StatCard } from '../../../components/ui/StatCard';
import { TypeDistributionChart, StatusOverviewChart } from '../../../components/ui/Charts';
import { KoperasiTable } from '../../../components/ui/KoperasiTable';
import { ActivityList } from '../../../components/ui/ActivityList';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  FileText,
  Plus,
  UserCheck,
  Shield
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
  koperasi?: {
    id: string;
    name: string;
    status: string;
    legalStatus: string;
  };
}

export default function HighDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'HIGH') {
            // Redirect if not HIGH role
            router.push('/dashboard/low');
            return;
          }
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    console.log('handleLogout function called in HIGH dashboard');
    try {
      console.log('Calling logout API');
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('Logout API response:', response.status);
      
      if (response.ok) {
        console.log('Logout successful, clearing data and redirecting');
        // Clear any local storage or state
        localStorage.removeItem('user');
        // Clear user state
        setUser(null);
        // Redirect to login
        router.replace('/login');
        return;
      } else {
        console.error('Logout failed with status:', response.status);
        // Force redirect anyway
        setUser(null);
        router.replace('/login');
        return;
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      setUser(null);
      router.replace('/login');
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock data untuk dashboard HIGH (Pusat)
  const stats = [
    {
      title: 'Total Koperasi',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Building2,
    },
    {
      title: 'Koperasi Aktif',
      value: '1,156',
      change: '+8%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
    {
      title: 'Total Anggota',
      value: '45,891',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Menunggu Verifikasi',
      value: '23',
      change: '-5%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
    },
    {
      title: 'Registrar Aktif',
      value: '89',
      change: '+3%',
      changeType: 'positive' as const,
      icon: UserCheck,
    },
    {
      title: 'Dokumen RAT',
      value: '892',
      change: '+25%',
      changeType: 'positive' as const,
      icon: FileText,
    },
  ];

  // Mock data for charts and tables
  const typeDistributionData = [
    { type: 'KONSUMSI' as const, count: 425, percentage: 34.1 },
    { type: 'SIMPAN_PINJAM' as const, count: 312, percentage: 25.0 },
    { type: 'PRODUKSI' as const, count: 298, percentage: 23.9 },
    { type: 'JASA' as const, count: 134, percentage: 10.7 },
    { type: 'SERBA_USAHA' as const, count: 78, percentage: 6.3 },
  ];

  const koperasiData = [
    {
      id: '1',
      name: 'Koperasi Makmur Jaya',
      type: 'SIMPAN_PINJAM' as const,
      status: 'AKTIF' as const,
      legalStatus: 'LEGAL' as const,
      totalMembers: 234,
      registrationDate: new Date('2024-01-15'),
      lastActivity: new Date('2024-03-15T10:30:00Z'),
      address: 'Jakarta Barat',
      contactPerson: 'Ahmad Suripto',
      contactPhone: '081234567890',
    },
    {
      id: '2',
      name: 'Koperasi Tani Sejahtera',
      type: 'PRODUKSI' as const,
      status: 'AKTIF' as const,
      legalStatus: 'LEGAL' as const,
      totalMembers: 156,
      registrationDate: new Date('2024-02-20'),
      lastActivity: new Date('2024-03-14T14:20:00Z'),
      address: 'Bogor',
      contactPerson: 'Siti Aminah',
      contactPhone: '081234567891',
    },
    {
      id: '3',
      name: 'Koperasi Konsumen Mandiri',
      type: 'KONSUMSI' as const,
      status: 'PENDING' as const,
      legalStatus: 'PENDING_REVIEW' as const,
      totalMembers: 89,
      registrationDate: new Date('2024-03-10'),
      lastActivity: new Date('2024-03-10T09:15:00Z'),
      address: 'Bandung',
      contactPerson: 'Budi Santoso',
      contactPhone: '081234567892',
    },
  ];

  const activities = [
    {
      id: '1',
      title: 'Pendaftaran Koperasi Baru',
      description: 'Koperasi Makmur Jaya berhasil didaftarkan',
      date: new Date('2024-03-15T10:30:00Z'),
      type: 'EVENT' as const,
      status: 'COMPLETED' as const,
      koperasiId: '1',
    },
    {
      id: '2',
      title: 'Update Data Anggota',
      description: 'Data anggota Koperasi Tani Sejahtera diperbarui',
      date: new Date('2024-03-14T14:20:00Z'),
      type: 'OTHER' as const,
      status: 'COMPLETED' as const,
      koperasiId: '2',
    },
    {
      id: '3',
      title: 'Verifikasi Dokumen RAT',
      description: 'RAT Koperasi Konsumen Mandiri menunggu verifikasi',
      date: new Date('2024-03-13T11:45:00Z'),
      type: 'AUDIT' as const,
      status: 'IN_PROGRESS' as const,
      koperasiId: '3',
    },
  ];

  return (
    <LayoutWrapper 
      userRole="HIGH" 
      onRoleChange={() => {}} 
      activeSection="dashboard" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Dashboard Pusat
            </h1>
            <p className="text-gray-600 mt-1">
              Monitoring dan manajemen koperasi seluruh Indonesia
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Registrar
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Laporan Bulanan
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Jenis Koperasi
            </h3>
            <TypeDistributionChart data={typeDistributionData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Overview
            </h3>
            <StatusOverviewChart 
              activeCount={1156}
              inactiveCount={91}
              legalCount={1089}
              pendingLegalCount={67}
            />
          </div>
        </div>

        {/* Recent Activities & Koperasi Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Koperasi Terbaru
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Lihat Semua
                  </button>
                </div>
              </div>
              <KoperasiTable data={koperasiData} userRole="HIGH" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Aktivitas Sistem
                </h3>
              </div>
            </div>
            <ActivityList 
              activities={activities}
              koperasiData={koperasiData}
              userRole="HIGH"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Building2 className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Verifikasi Koperasi</h4>
              <p className="text-sm text-gray-600">Review dan approve koperasi baru</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <UserCheck className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Kelola Registrar</h4>
              <p className="text-sm text-gray-600">Tambah atau edit registrar daerah</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Laporan Analitik</h4>
              <p className="text-sm text-gray-600">Generate laporan komprehensif</p>
            </button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
