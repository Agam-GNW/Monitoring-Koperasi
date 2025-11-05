'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LayoutWrapper from '../../../../../components/layout/LayoutWrapper';
import { KoperasiTable } from '../../../../../components/ui/KoperasiTable';
import { KoperasiRegistration } from '../../../../../components/ui/KoperasiRegistration';
import { 
  Building2, 
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { Koperasi } from '../../../../../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
  ownedKoperasi?: Koperasi;
}

export default function ManageKoperasiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKoperasiForm, setShowKoperasiForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'LOW') {
            router.push('/dashboard/high');
            return;
          }
          console.log('User data fetched:', userData.user);
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
  }, [router, pathname]); // Re-fetch when pathname changes

  // Re-fetch user data when window becomes visible/focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch user data when page becomes visible
        fetch('/api/auth/me')
          .then(response => response.json())
          .then(userData => {
            if (userData.user) {
              console.log('User data refreshed on visibility change');
              setUser(userData.user);
            }
          })
          .catch(error => console.error('Error refreshing user:', error));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleKoperasiRegistrationComplete = () => {
    setSubmitSuccess(true);
    setShowKoperasiForm(false);
    
    // Refresh user data to get the newly registered koperasi
    fetch('/api/auth/me')
      .then(response => response.json())
      .then(userData => {
        if (userData.user) {
          setUser(userData.user);
        }
      })
      .catch(error => console.error('Error refreshing user:', error));
  };

  const handleCancelForm = () => {
    setShowKoperasiForm(false);
  };

  const handleShowForm = () => {
    setShowKoperasiForm(true);
    setSubmitSuccess(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        localStorage.removeItem('user');
        setUser(null);
        router.replace('/login');
      } else {
        setUser(null);
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.replace('/login');
    }
  };

  const handleBack = () => {
    router.push('/dashboard/low');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'Menunggu Persetujuan',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock
        };
      case 'AKTIF_SEHAT':
        return {
          text: 'Aktif - Sehat',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle
        };
      case 'AKTIF_TIDAK_SEHAT':
        return {
          text: 'Aktif - Tidak Sehat',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: CheckCircle
        };
      case 'TIDAK_DISETUJUI':
        return {
          text: 'Tidak Disetujui',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle
        };
      default:
        return {
          text: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: Clock
        };
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

  // Show success message after submission
  if (submitSuccess) {
    return (
      <LayoutWrapper 
        userRole="LOW" 
        onRoleChange={() => {}} 
        activeSection="koperasi" 
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
              Pengajuan Berhasil Dikirim!
            </h2>
            <p className="text-gray-700 mb-6">
              Pengajuan koperasi Anda telah berhasil dikirim dan sedang menunggu persetujuan dari supervisor.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-yellow-600 h-2 rounded-full w-1/3"></div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Status: Menunggu Persetujuan
            </p>
            <button
              onClick={handleBack}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Kembali ke Dashboard
            </button>
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
        activeSection="koperasi" 
        onSectionChange={() => {}}
        userName={user.name}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ajukan Koperasi Baru
              </h1>
              <p className="text-gray-700">
                Isi form di bawah untuk mengajukan pendaftaran koperasi baru
              </p>
            </div>
          </div>

          {/* Form Pendaftaran */}
          <KoperasiRegistration
            onBack={handleCancelForm}
            onSuccess={handleKoperasiRegistrationComplete}
          />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper 
      userRole="LOW" 
      onRoleChange={() => {}} 
      activeSection="koperasi" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Koperasi Saya
            </h1>
            <p className="text-gray-700 mt-1">
              Kelola koperasi yang telah Anda daftarkan
            </p>
          </div>
        </div>

        {/* Show user's koperasi if exists */}
        {user.ownedKoperasi ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Main Info */}
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`rounded-xl p-6 shadow-sm ${(() => {
                const statusInfo = getStatusInfo(user.ownedKoperasi.status);
                return statusInfo.bgColor;
              })()}`}>
                <div className="flex items-start gap-4">
                  {(() => {
                    const statusInfo = getStatusInfo(user.ownedKoperasi.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                          <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                            {statusInfo.text}
                          </h3>
                          <p className="text-gray-700 text-sm mt-1">
                            {user.ownedKoperasi.status === 'PENDING' && 
                              'Pengajuan Anda sedang dalam proses review oleh admin'}
                            {user.ownedKoperasi.status === 'AKTIF_SEHAT' && 
                              'Koperasi Anda telah aktif dan dapat beroperasi dengan baik'}
                            {user.ownedKoperasi.status === 'AKTIF_TIDAK_SEHAT' && 
                              'Koperasi aktif namun memerlukan perhatian khusus'}
                            {user.ownedKoperasi.status === 'TIDAK_DISETUJUI' && 
                              'Pengajuan ditolak, silakan periksa catatan penolakan'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Koperasi Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{user.ownedKoperasi.name}</h2>
                  {user.ownedKoperasi.description && (
                    <p className="text-gray-600 mt-2">{user.ownedKoperasi.description}</p>
                  )}
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Jenis Koperasi
                      </label>
                      <div className="text-gray-900 font-semibold">{user.ownedKoperasi.type}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Total Anggota
                      </label>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-semibold">
                          {user.ownedKoperasi.totalMembers.toLocaleString()} orang
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tanggal Pendaftaran
                      </label>
                      <div className="text-gray-900 font-medium">
                        {user.ownedKoperasi.registrationDate 
                          ? new Date(user.ownedKoperasi.registrationDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alamat Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Alamat Koperasi
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Edit
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-900 leading-relaxed">
                      {user.ownedKoperasi.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* Show empty state when user has no koperasi */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Anda Belum Memiliki Koperasi Terdaftar
            </h3>
            <p className="text-gray-700 mb-8 max-w-md mx-auto">
              Mulai perjalanan koperasi Anda dengan mengajukan pendaftaran koperasi baru. 
              Proses pengajuan memerlukan persetujuan dari supervisor.
            </p>
            <button
              onClick={handleShowForm}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto text-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Ajukan Koperasi
            </button>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-800">Informasi Pengajuan</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Setiap pengguna hanya dapat memiliki satu koperasi. 
                    Pengajuan akan diproses oleh supervisor dalam 1-3 hari kerja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
