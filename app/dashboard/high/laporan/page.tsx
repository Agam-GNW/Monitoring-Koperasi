'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../../components/layout/LayoutWrapper';
import { TypeDistributionChart, StatusOverviewChart } from '../../../../components/ui/Charts';
import { 
  BarChart3,
  TrendingUp,
  Building2,
  FileText,
  Download
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
}

export default function LaporanAnalitikPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [koperasiList, setKoperasiList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'HIGH') {
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

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/koperasi/dashboard-stats');
        if (response.ok) {
          const result = await response.json();
          console.log('Dashboard stats:', result);
          setDashboardStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch koperasi list
  useEffect(() => {
    const fetchKoperasiList = async () => {
      try {
        const response = await fetch('/api/koperasi/approval');
        if (response.ok) {
          const result = await response.json();
          setKoperasiList(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching koperasi list:', error);
      }
    };

    fetchKoperasiList();
  }, []);

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
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <LayoutWrapper 
      userRole="HIGH" 
      onRoleChange={() => {}} 
      activeSection="laporan" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-red-600" />
              Laporan & Analitik
            </h1>
            <p className="text-gray-600 mt-1">
              Visualisasi data dan statistik koperasi secara menyeluruh
            </p>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Laporan
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Koperasi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardStats?.total || 0}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Sehat</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {dashboardStats?.status.aktifSehat || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Legal</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {dashboardStats?.legal.legal || 0}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {dashboardStats?.status.pending || 0}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Jenis Koperasi
            </h3>
            {!dashboardStats ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : dashboardStats.typeDistribution.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                Belum ada data koperasi
              </div>
            ) : (
              <TypeDistributionChart data={dashboardStats.typeDistribution} />
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Overview Status Koperasi
            </h3>
            {!dashboardStats ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <StatusOverviewChart 
                activeCount={dashboardStats.status.aktifSehat}
                inactiveCount={dashboardStats.status.aktifTidakSehat}
                legalCount={dashboardStats.legal.legal}
                pendingLegalCount={dashboardStats.legal.pendingLegal}
              />
            )}
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistik Koperasi
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Koperasi</span>
                <span className="font-semibold text-gray-900">{dashboardStats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Aktif Sehat</span>
                <span className="font-semibold text-green-600">{dashboardStats?.status.aktifSehat || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Aktif Tidak Sehat</span>
                <span className="font-semibold text-yellow-600">{dashboardStats?.status.aktifTidakSehat || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Approval</span>
                <span className="font-semibold text-blue-600">{dashboardStats?.status.pending || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Legal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Legal</span>
                <span className="font-semibold text-blue-600">{dashboardStats?.legal.legal || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="font-semibold text-yellow-600">{dashboardStats?.legal.pendingLegal || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Persentase Legal</span>
                <span className="font-semibold text-gray-900">
                  {dashboardStats?.total > 0 
                    ? ((dashboardStats.legal.legal / dashboardStats.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Persentase
            </h3>
            <div className="space-y-4">
              {dashboardStats?.typeDistribution.map((item: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.type}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Koperasi Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daftar Koperasi</h3>
                <p className="text-sm text-gray-600 mt-1">Total {koperasiList.length} koperasi terdaftar</p>
              </div>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Koperasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Legal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {koperasiList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p>Belum ada koperasi terdaftar</p>
                    </td>
                  </tr>
                ) : (
                  koperasiList.map((koperasi) => (
                    <tr key={koperasi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{koperasi.name}</div>
                        <div className="text-xs text-gray-500">{koperasi.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {koperasi.type === 'SIMPAN_PINJAM' ? 'Simpan Pinjam' :
                           koperasi.type === 'KONSUMSI' ? 'Konsumsi' :
                           koperasi.type === 'PRODUKSI' ? 'Produksi' :
                           koperasi.type === 'JASA' ? 'Jasa' :
                           koperasi.type === 'SERBA_USAHA' ? 'Serba Usaha' :
                           koperasi.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          koperasi.status === 'AKTIF_SEHAT' ? 'bg-green-100 text-green-800' :
                          koperasi.status === 'AKTIF_TIDAK_SEHAT' ? 'bg-yellow-100 text-yellow-800' :
                          koperasi.status === 'DITOLAK' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {koperasi.status === 'AKTIF_SEHAT' ? 'Aktif Sehat' :
                           koperasi.status === 'AKTIF_TIDAK_SEHAT' ? 'Aktif Tidak Sehat' :
                           koperasi.status === 'DITOLAK' ? 'Ditolak' :
                           'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          koperasi.legalStatus === 'LEGAL' ? 'bg-blue-100 text-blue-800' :
                          koperasi.legalStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          koperasi.legalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {koperasi.legalStatus === 'LEGAL' ? 'Legal' :
                           koperasi.legalStatus === 'PENDING_REVIEW' ? 'Pending' :
                           koperasi.legalStatus === 'REJECTED' ? 'Ditolak' :
                           'Belum Submit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {koperasi.totalMembers || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{koperasi.contactPerson}</div>
                        <div className="text-xs text-gray-500">{koperasi.contactPhone}</div>
                        {koperasi.contactEmail && (
                          <div className="text-xs text-gray-500">{koperasi.contactEmail}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
