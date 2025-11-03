'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../components/layout/LayoutWrapper';
import { StatCard } from '../../../components/ui/StatCard';
import { KoperasiForm, KoperasiFormData } from '../../../components/ui/KoperasiForm';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  Plus,
  ArrowLeft,
  AlertTriangle,
  Info,
  Users,
  MapPin,
  FileText,
  Edit
} from 'lucide-react';
import { KoperasiTable } from '../../../components/ui/KoperasiTable';
import { ActivityList } from '../../../components/ui/ActivityList';
import { TypeDistributionChart, StatusOverviewChart } from '../../../components/ui/Charts';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
  ownedKoperasi?: {
    id: string;
    name: string;
    status: 'PENDING' | 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT' | 'TIDAK_DISETUJUI';
    submissionDate?: Date;
    approvalDate?: Date;
    rejectionReason?: string;
    approvalNotes?: string;
  };
}

export default function LowDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [koperasiData, setKoperasiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKoperasiForm, setShowKoperasiForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'LOW') {
            // Redirect if not LOW role
            router.push('/dashboard/high');
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
    console.log('handleLogout function called in LOW dashboard');
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

  const handleKoperasiSubmit = async (formData: KoperasiFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/koperasi/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowKoperasiForm(false);
          setSubmitSuccess(false);
          // Refresh data atau update state sesuai kebutuhan
        }, 2000);
      } else {
        alert(result.error || 'Terjadi kesalahan saat mendaftarkan koperasi');
      }
    } catch (error) {
      console.error('Error submitting koperasi:', error);
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowForm = () => {
    setShowKoperasiForm(true);
  };

  const handleCancelForm = () => {
    setShowKoperasiForm(false);
    setSubmitSuccess(false);
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

  // Show success message
  if (submitSuccess) {
    return (
      <LayoutWrapper 
        userRole="LOW" 
        onRoleChange={() => {}} 
        activeSection="dashboard" 
        onSectionChange={() => {}}
        userName={user.name}
        onLogout={handleLogout}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Koperasi Berhasil Didaftarkan!
            </h2>
            <p className="text-gray-600 mb-6">
              Koperasi telah berhasil didaftarkan dan langsung aktif. Anda dapat mulai mengelola koperasi Anda sekarang.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
            <p className="text-sm text-gray-500">
              Mengalihkan ke dashboard...
            </p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Show registration form
  if (showKoperasiForm) {
    return (
      <LayoutWrapper 
        userRole="LOW" 
        onRoleChange={() => {}} 
        activeSection="dashboard" 
        onSectionChange={() => {}}
        userName={user.name}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          {/* Header dengan tombol kembali */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pendaftaran Koperasi Baru
              </h1>
              <p className="text-gray-600">
                Daftarkan koperasi baru di wilayah {user.ownedKoperasi?.name || 'Jakarta Barat'}
              </p>
            </div>
          </div>

          {/* Form Pendaftaran */}
          <KoperasiForm
            onSubmit={handleKoperasiSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </LayoutWrapper>
    );
  }

  // Mock data untuk dashboard LOW (Registrar)
  const stats = [
    {
      title: 'Koperasi Wilayah',
      value: '47',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Building2,
    },
    {
      title: 'Koperasi Aktif',
      value: '42',
      change: '+3%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
    {
      title: 'Total Anggota',
      value: '1,892',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Koperasi Aktif',
      value: '47',
      change: '+8%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
  ];

  // Mock data for charts and tables (limited scope for registrar)
  const registrarData = [
    { type: 'KONSUMSI' as const, count: 15, percentage: 31.9 },
    { type: 'SIMPAN_PINJAM' as const, count: 12, percentage: 25.5 },
    { type: 'PRODUKSI' as const, count: 8, percentage: 17.0 },
    { type: 'JASA' as const, count: 7, percentage: 14.9 },
    { type: 'SERBA_USAHA' as const, count: 5, percentage: 10.6 },
  ];

  const activities = [
    {
      id: '1',
      title: 'Pendaftaran Koperasi Baru',
      description: 'Koperasi yang Anda daftarkan berhasil diaktifkan',
      date: new Date('2024-03-15T10:30:00Z'),
      type: 'EVENT' as const,
      status: 'COMPLETED' as const,
      koperasiId: user?.ownedKoperasi?.id || '1',
    },
    {
      id: '2',
      title: 'Update Data Anggota',
      description: 'Data anggota koperasi Anda telah diperbarui',
      date: new Date('2024-03-14T14:20:00Z'),
      type: 'OTHER' as const,
      status: 'COMPLETED' as const,
      koperasiId: user?.ownedKoperasi?.id || '1',
    },
  ];

  return (
    <LayoutWrapper 
      userRole="LOW" 
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
              <MapPin className="w-6 h-6 text-green-600" />
              Dashboard Pengelola Koperasi
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola dan daftarkan koperasi langsung tanpa approval
            </p>
            <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-flex items-center">
              ✅ Akses langsung untuk pengelolaan koperasi
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleShowForm}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Koperasi Langsung
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload RAT
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Jenis Koperasi (Wilayah)
            </h3>
            <TypeDistributionChart data={registrarData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Koperasi Wilayah
            </h3>
            <StatusOverviewChart 
              activeCount={47}
              inactiveCount={0}
              legalCount={47}
              pendingLegalCount={0}
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
                    Koperasi di Wilayah Anda
                  </h3>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium"
                    onClick={() => router.push('/dashboard/low/koperasi/manage')}
                  >
                    Kelola Semua
                  </button>
                </div>
              </div>
              <KoperasiTable data={koperasiData || []} userRole="LOW" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Aktivitas Terbaru
                </h3>
              </div>
            </div>
            <ActivityList 
              activities={activities}
              koperasiData={koperasiData || []}
              userRole="LOW"
            />
          </div>
        </div>

        {/* Quick Actions for Registrar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleShowForm}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Plus className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Daftarkan Koperasi Langsung</h4>
              <p className="text-sm text-gray-600">Tambahkan koperasi baru tanpa menunggu approval</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Edit className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Update Data</h4>
              <p className="text-sm text-gray-600">Edit informasi koperasi existing</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FileText className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Upload Dokumen</h4>
              <p className="text-sm text-gray-600">Upload RAT dan dokumen legal</p>
            </button>
          </div>
        </div>

        {/* Regional Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <MapPin className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pengelolaan Koperasi Mandiri
              </h3>
              <p className="text-gray-600">
                Sebagai role <strong>LOW</strong>, Anda dapat mendaftarkan dan mengelola koperasi secara langsung tanpa perlu approval dari administrator pusat
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Semua koperasi yang Anda daftarkan akan langsung aktif dan dapat dioperasikan
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
