'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../components/layout/LayoutWrapper';
import { StatCard } from '../../../components/ui/StatCard';
import { KoperasiRegistration } from '../../../components/ui/KoperasiRegistration';
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
  AlertCircle,
  Info,
  Users,
  MapPin,
  FileText,
  Edit,
  DollarSign,
  TrendingUp,
  Save,
  X as XIcon
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
    status: 'PENDING' | 'PENDING_VERIFICATION' | 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT' | 'DITOLAK';
    submissionDate?: Date;
    approvalDate?: Date;
    rejectionReason?: string;
    approvalNotes?: string;
    resubmissionCount?: number;
  };
}

export default function LowDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [koperasiData, setKoperasiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showKoperasiForm, setShowKoperasiForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState({
    totalFunds: 0,
    activeMembers: 0,
    monthlyTransactions: 0
  });
  const [statsForm, setStatsForm] = useState({
    totalFunds: 0,
    activeMembers: 0,
    monthlyTransactions: 0
  });
  const [savingStats, setSavingStats] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
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

  // Fetch statistics data
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.ownedKoperasi) return;
      
      try {
        const response = await fetch(`/api/koperasi/stats?koperasiId=${user.ownedKoperasi.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setStatsForm(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const handleEditStats = () => {
    setStatsForm({ ...stats });
    setShowStatsModal(true);
  };

  const handleSaveStats = async () => {
    setSavingStats(true);
    try {
      const response = await fetch('/api/koperasi/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsForm),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setShowStatsModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menyimpan statistik');
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      alert('Terjadi kesalahan saat menyimpan statistik');
    } finally {
      setSavingStats(false);
    }
  };

  const handleCancelStats = () => {
    setStatsForm({ ...stats });
    setShowStatsModal(false);
  };

  const handleResubmit = async () => {
    if (!user?.ownedKoperasi?.id) return;

    const rejectionReason = user.ownedKoperasi.rejectionReason || 'Tidak ada alasan yang diberikan';
    
    const confirmResubmit = confirm(
      '⚠️ PERHATIAN: DAFTAR ULANG KOPERASI ⚠️\n\n' +
      'Dengan mengklik OK, maka:\n' +
      '✓ Data koperasi yang ditolak akan DIHAPUS PERMANEN\n' +
      '✓ Semua dokumen yang sudah diupload akan DIHAPUS\n' +
      '✓ Anda akan mengisi FORM BARU dari awal\n\n' +
      '📋 Alasan Penolakan:\n' +
      rejectionReason + '\n\n' +
      'Pastikan Anda memperbaiki data sesuai alasan penolakan di atas.\n\n' +
      'Lanjutkan?'
    );

    if (!confirmResubmit) return;

    setResubmitting(true);
    try {
      // Delete old rejected koperasi
      const response = await fetch(`/api/koperasi/delete/${user.ownedKoperasi.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Data koperasi yang ditolak berhasil dihapus.\n\nSilakan isi form pendaftaran baru dengan data yang benar.');
        // Open registration form
        setShowKoperasiForm(true);
        // Reload to refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Gagal menghapus koperasi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting koperasi:', error);
      alert('Terjadi kesalahan saat menghapus koperasi');
    } finally {
      setResubmitting(false);
    }
  };

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

  const fetchKoperasiData = async () => {
    // Refresh user data to get updated koperasi info
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleRegistrationComplete = () => {
    // This is called ONLY after the entire registration flow is complete
    // (form submission + document upload + success screen)
    setShowKoperasiForm(false);
    setSubmitSuccess(true);
    
    // Refresh koperasi data to show the newly created koperasi
    fetchKoperasiData();
    
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  const handleShowForm = () => {
    // Redirect to /dashboard/low/koperasi/manage instead of showing form inline
    router.push('/dashboard/low/koperasi/manage');
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
          <KoperasiRegistration
            onBack={handleCancelForm}
            onSuccess={handleRegistrationComplete}
          />
        </div>
      </LayoutWrapper>
    );
  }

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
            {!user.ownedKoperasi ? (
              <button 
                onClick={handleShowForm}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Koperasi Langsung
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {user.ownedKoperasi.status === 'AKTIF_SEHAT' ? (
                  <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-green-300">
                    <CheckCircle className="w-5 h-5" />
                    Koperasi Sehat
                  </div>
                ) : user.ownedKoperasi.status === 'AKTIF_TIDAK_SEHAT' ? (
                  <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-red-300">
                    <AlertCircle className="w-5 h-5" />
                    Koperasi Tidak Sehat
                  </div>
                ) : (user.ownedKoperasi.status === 'PENDING' || user.ownedKoperasi.status === 'PENDING_VERIFICATION') ? (
                  <div className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-yellow-300">
                    <Clock className="w-5 h-5" />
                    Menunggu Persetujuan
                  </div>
                ) : user.ownedKoperasi.status === 'DITOLAK' ? (
                  <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-red-300">
                    <XCircle className="w-5 h-5" />
                    Ditolak
                  </div>
                ) : (
                  <div className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold flex items-center gap-2 border-2 border-gray-300">
                    <XCircle className="w-5 h-5" />
                    Status Tidak Diketahui
                  </div>
                )}
              </div>
            )}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload RAT
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Dana Koperasi */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Dana Koperasi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats.totalFunds.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditStats}
              className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Edit Statistik
            </button>
          </div>

          {/* Jumlah Anggota Aktif */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Anggota Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeMembers}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditStats}
              className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Edit Statistik
            </button>
          </div>

          {/* Transaksi Bulan Ini */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaksi Bulan Ini</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {stats.monthlyTransactions.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditStats}
              className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Edit Statistik
            </button>
          </div>
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
            {!user.ownedKoperasi ? (
              <button 
                onClick={handleShowForm}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Plus className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Daftarkan Koperasi Langsung</h4>
                <p className="text-sm text-gray-600">Tambahkan koperasi baru tanpa menunggu approval</p>
              </button>
            ) : (
              <div className="p-4 border-2 rounded-lg text-left bg-gradient-to-br from-blue-50 to-green-50">
                {user.ownedKoperasi.status === 'AKTIF_SEHAT' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Status: Koperasi Sehat</h4>
                    <p className="text-sm text-gray-600">Koperasi Anda dalam kondisi sehat</p>
                  </>
                ) : user.ownedKoperasi.status === 'AKTIF_TIDAK_SEHAT' ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Status: Koperasi Tidak Sehat</h4>
                    <p className="text-sm text-gray-600">Perlu perbaikan manajemen koperasi</p>
                  </>
                ) : (user.ownedKoperasi.status === 'PENDING' || user.ownedKoperasi.status === 'PENDING_VERIFICATION') ? (
                  <>
                    <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Status: Menunggu Persetujuan</h4>
                    <p className="text-sm text-gray-600">Sedang dalam proses review admin</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Status: Ditolak</h4>
                    <p className="text-sm text-gray-600">Pengajuan ditolak oleh admin</p>
                    {user.ownedKoperasi.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-900 mb-1">Alasan Penolakan:</p>
                        <p className="text-sm text-red-800">{user.ownedKoperasi.rejectionReason}</p>
                      </div>
                    )}
                    <button
                      onClick={handleResubmit}
                      disabled={resubmitting}
                      className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {resubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menghapus Data...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Daftar Ulang (Hapus & Isi Baru)</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Data lama akan dihapus dan Anda mengisi form baru
                    </p>
                  </>
                )}
              </div>
            )}
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

      {/* Statistics Edit Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Statistik Koperasi
              </h3>
              <button
                onClick={handleCancelStats}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Total Dana Koperasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Dana Koperasi (Rp)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={statsForm.totalFunds}
                    onChange={(e) => setStatsForm({ ...statsForm, totalFunds: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* Jumlah Anggota Aktif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Anggota Aktif
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={statsForm.activeMembers}
                    onChange={(e) => setStatsForm({ ...statsForm, activeMembers: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Transaksi Bulan Ini */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaksi Bulan Ini (Rp)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={statsForm.monthlyTransactions}
                    onChange={(e) => setStatsForm({ ...statsForm, monthlyTransactions: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelStats}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={savingStats}
              >
                Batal
              </button>
              <button
                onClick={handleSaveStats}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={savingStats}
              >
                {savingStats ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
