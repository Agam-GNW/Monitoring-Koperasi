'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../components/layout/LayoutWrapper';
import { StatCard } from '../../components/ui/StatCard';
import { TypeDistributionChart, StatusOverviewChart } from '../../components/ui/Charts';
import { KoperasiTable } from '../../components/ui/KoperasiTable';
import { ActivityList } from '../../components/ui/ActivityList';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  FileText,
  Plus
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user info from token or API call
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = async () => {
    console.log('handleLogout function called');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  const renderDashboardContent = () => {
    if (user.role === 'HIGH') {
      return (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Pusat
            </h1>
            <p className="text-gray-600">
              Selamat datang, {user.name}. Monitoring dan manajemen seluruh koperasi di Indonesia
            </p>
          </div>

          {/* Stats akan diambil dari API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Koperasi"
              value="6"
              subtitle="5 aktif"
              icon={Building2}
              trend={{
                value: 12.5,
                label: "bulan ini",
                isPositive: true
              }}
            />
            <StatCard
              title="Total Anggota"
              value="685"
              subtitle="Seluruh koperasi"
              icon={Users}
              trend={{
                value: 8.2,
                label: "bulan ini",
                isPositive: true
              }}
            />
            <StatCard
              title="Koperasi Legal"
              value="4"
              subtitle="1 pending review"
              icon={CheckCircle}
            />
            <StatCard
              title="Kegiatan Mendatang"
              value="3"
              subtitle="Dalam 30 hari"
              icon={Calendar}
            />
          </div>

          {/* Placeholder untuk charts dan tables */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Data Koperasi & Statistik
            </h3>
            <p className="text-gray-600">
              Charts dan tabel data akan ditampilkan di sini setelah integrasi dengan database.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Koperasi
            </h1>
            <p className="text-gray-600">
              Selamat datang, {user.name}. 
              {user.koperasi ? `Kelola ${user.koperasi.name}` : 'Kelola koperasi Anda'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <div className="flex items-center">
                <Plus className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-blue-900">Daftarkan Koperasi Baru</div>
                  <div className="text-sm text-blue-600">Mulai proses pendaftaran</div>
                </div>
              </div>
            </button>
            <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-green-900">Upload Dokumen RAT</div>
                  <div className="text-sm text-green-600">Pastikan status legal</div>
                </div>
              </div>
            </button>
            <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium text-purple-900">Jadwalkan Kegiatan</div>
                  <div className="text-sm text-purple-600">Rapat, pelatihan, dll</div>
                </div>
              </div>
            </button>
          </div>

          {user.koperasi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Status Koperasi"
                value={user.koperasi.status === 'AKTIF' ? 'Aktif' : 'Pending'}
                icon={Building2}
                className={user.koperasi.status === 'AKTIF' ? 'border-green-200' : 'border-yellow-200'}
              />
              <StatCard
                title="Status Legal"
                value={user.koperasi.legalStatus === 'LEGAL' ? 'Legal' : 'Pending'}
                icon={user.koperasi.legalStatus === 'LEGAL' ? CheckCircle : AlertTriangle}
                className={user.koperasi.legalStatus === 'LEGAL' ? 'border-blue-200' : 'border-yellow-200'}
              />
              <StatCard
                title="Total Anggota"
                value="0"
                icon={Users}
              />
              <StatCard
                title="Kegiatan Mendatang"
                value="0"
                icon={Calendar}
              />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Belum Terdaftar pada Koperasi
              </h3>
              <p className="text-yellow-700 mb-4">
                Anda belum terdaftar pada koperasi manapun. Silakan daftarkan koperasi baru atau hubungi administrator.
              </p>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                Daftar Koperasi Baru
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Fitur dalam Pengembangan
            </h2>
            <p className="text-gray-600">
              Halaman {activeSection} sedang dalam tahap pengembangan dan integrasi database.
            </p>
          </div>
        );
    }
  };

  return (
    <LayoutWrapper
      userRole={user.role}
      onRoleChange={() => {}} // Role tidak bisa diubah setelah login
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      userName={user.name}
      onLogout={handleLogout}
    >
      {renderContent()}
    </LayoutWrapper>
  );
}
