'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { 
  Building2, 
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  FileText,
  Search,
  Filter,
  X
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
}

interface Koperasi {
  id: string;
  name: string;
  type: string;
  status: 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT';
  legalStatus: string;
  totalMembers: number;
  registrationDate: Date;
  approvalDate: Date;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  description?: string;
  ownerName: string;
  ownerEmail: string;
  approvalNotes?: string;
  province?: string;
  regency?: string;
  district?: string;
}

export default function KoperasiListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [koperasiList, setKoperasiList] = useState<Koperasi[]>([]);
  const [filteredData, setFilteredData] = useState<Koperasi[]>([]);
  const [selectedKoperasi, setSelectedKoperasi] = useState<Koperasi | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
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
          await fetchKoperasiData();
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

  const fetchKoperasiData = async () => {
    try {
      const response = await fetch('/api/koperasi/approval');
      if (response.ok) {
        const result = await response.json();
        // Filter hanya koperasi yang sudah disetujui
        const approvedKoperasi = result.data.filter((k: Koperasi) => 
          k.status === 'AKTIF_SEHAT' || k.status === 'AKTIF_TIDAK_SEHAT'
        );
        setKoperasiList(approvedKoperasi);
        setFilteredData(approvedKoperasi);
      }
    } catch (error) {
      console.error('Error fetching koperasi data:', error);
    }
  };

  useEffect(() => {
    let filtered = koperasiList;

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(k => k.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(k => k.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(k => 
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, filterStatus, filterType, koperasiList]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem('user');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.replace('/login');
    }
  };

  const handleViewDetail = (koperasi: Koperasi) => {
    setSelectedKoperasi(koperasi);
    setShowDetailModal(true);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'AKTIF_SEHAT') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Aktif - Sehat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3" />
        Aktif - Tidak Sehat
      </span>
    );
  };

  const getTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'KONSUMSI': 'Konsumsi',
      'SIMPAN_PINJAM': 'Simpan Pinjam',
      'PRODUKSI': 'Produksi',
      'JASA': 'Jasa',
      'SERBA_USAHA': 'Serba Usaha'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = {
    total: koperasiList.length,
    sehat: koperasiList.filter(k => k.status === 'AKTIF_SEHAT').length,
    tidakSehat: koperasiList.filter(k => k.status === 'AKTIF_TIDAK_SEHAT').length,
    totalMembers: koperasiList.reduce((sum, k) => sum + (k.totalMembers || 0), 0)
  };

  return (
    <LayoutWrapper 
      userRole="HIGH" 
      onRoleChange={() => {}} 
      activeSection="koperasi" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Data Koperasi Terdaftar
          </h1>
          <p className="text-gray-600 mt-1">
            Daftar koperasi yang telah disetujui dan aktif
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Koperasi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Building2 className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Sehat</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.sehat}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif T. Sehat</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.tidakSehat}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Anggota</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalMembers.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama koperasi, penanggung jawab, atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                />
              </div>
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF_SEHAT">Aktif Sehat</option>
              <option value="AKTIF_TIDAK_SEHAT">Aktif Tidak Sehat</option>
            </select>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="KONSUMSI">Konsumsi</option>
              <option value="SIMPAN_PINJAM">Simpan Pinjam</option>
              <option value="PRODUKSI">Produksi</option>
              <option value="JASA">Jasa</option>
              <option value="SERBA_USAHA">Serba Usaha</option>
            </select>

            {/* Reset */}
            {(searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setFilterType('ALL');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {koperasiList.length} koperasi
          </div>
        </div>

        {/* Koperasi Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koperasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data koperasi
                    </td>
                  </tr>
                ) : (
                  filteredData.map((koperasi) => (
                    <tr key={koperasi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{koperasi.name}</div>
                          <div className="text-sm text-gray-500">{koperasi.contactPerson}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{getTypeName(koperasi.type)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(koperasi.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{koperasi.totalMembers || 0} orang</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {koperasi.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{formatDate(koperasi.approvalDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(koperasi)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedKoperasi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detail Koperasi</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedKoperasi.status)}
                <span className="text-sm text-gray-500">ID: {selectedKoperasi.id}</span>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Koperasi</label>
                  <p className="text-gray-900 font-medium mt-1">{selectedKoperasi.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jenis Koperasi</label>
                  <p className="text-gray-900 mt-1">{getTypeName(selectedKoperasi.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status Badan Hukum</label>
                  <p className="text-gray-900 mt-1">{selectedKoperasi.legalStatus || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jumlah Anggota</label>
                  <p className="text-gray-900 mt-1">{selectedKoperasi.totalMembers || 0} orang</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  Informasi Kontak
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Penanggung Jawab</label>
                    <p className="text-gray-900 mt-1">{selectedKoperasi.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">No. Telepon</label>
                    <p className="text-gray-900 mt-1">{selectedKoperasi.contactPhone}</p>
                  </div>
                  {selectedKoperasi.contactEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 mt-1">{selectedKoperasi.contactEmail}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Owner</label>
                    <p className="text-gray-900 mt-1">{selectedKoperasi.ownerName}</p>
                    <p className="text-sm text-gray-500">{selectedKoperasi.ownerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Alamat
                </h4>
                <p className="text-gray-900">{selectedKoperasi.address}</p>
              </div>

              {/* Description */}
              {selectedKoperasi.description && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Deskripsi</h4>
                  <p className="text-gray-700 text-sm">{selectedKoperasi.description}</p>
                </div>
              )}

              {/* Dates */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  Informasi Tanggal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Registrasi</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedKoperasi.registrationDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Approval</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedKoperasi.approvalDate)}</p>
                  </div>
                </div>
              </div>

              {/* Approval Notes */}
              {selectedKoperasi.approvalNotes && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Catatan Approval</h4>
                  <p className="text-green-800 text-sm">{selectedKoperasi.approvalNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
