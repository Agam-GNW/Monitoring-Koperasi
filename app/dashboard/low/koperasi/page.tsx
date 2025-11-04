'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../../components/layout/LayoutWrapper';
import { KoperasiForm, KoperasiFormData } from '../../../../components/ui/KoperasiForm';
import { Button } from '../../../../components/ui/Button';
import { 
  Building2, 
  Plus,
  ArrowLeft,
  CheckIcon,
  Filter,
  Search,
  Eye,
  Edit,
  FileText,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail
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

interface Koperasi {
  id: string;
  name: string;
  type: 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';
  status: 'AKTIF' | 'NONAKTIF' | 'PENDING';
  legalStatus: 'LEGAL' | 'PENDING_REVIEW' | 'REJECTED' | 'NOT_SUBMITTED';
  totalMembers: number;
  registrationDate: Date;
  lastActivity: Date;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  description?: string;
  registrarId: string;
}

export default function KoperasiManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [koperasiList, setKoperasiList] = useState<Koperasi[]>([]);
  const [selectedKoperasi, setSelectedKoperasi] = useState<Koperasi | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const router = useRouter();

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
          setUser(userData.user);
          await fetchKoperasiList();
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

  const fetchKoperasiList = async () => {
    try {
      const response = await fetch('/api/koperasi/register');
      if (response.ok) {
        const result = await response.json();
        // Ensure we always set an array
        const dataArray = Array.isArray(result.data) ? result.data : 
                         Array.isArray(result) ? result : [];
        setKoperasiList(dataArray);
      } else {
        setKoperasiList([]);
      }
    } catch (error) {
      console.error('Error fetching koperasi list:', error);
      setKoperasiList([]);
    }
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
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.replace('/login');
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
          setShowForm(false);
          setSubmitSuccess(false);
          fetchKoperasiList(); // Refresh list
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AKTIF: 'bg-green-100 text-green-800',
      NONAKTIF: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getLegalStatusBadge = (status: string) => {
    const statusConfig = {
      LEGAL: 'bg-green-100 text-green-800',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      NOT_SUBMITTED: 'bg-gray-100 text-gray-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      SIMPAN_PINJAM: 'Simpan Pinjam',
      KONSUMSI: 'Konsumsi',
      PRODUKSI: 'Produksi',
      JASA: 'Jasa',
      SERBA_USAHA: 'Serba Usaha',
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const filteredKoperasi = (koperasiList || []).filter(koperasi => {
    const matchesSearch = koperasi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         koperasi.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || koperasi.status === statusFilter;
    const matchesType = typeFilter === 'all' || koperasi.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
        activeSection="koperasi" 
        onSectionChange={() => {}}
        userName={user.name}
        onLogout={handleLogout}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Koperasi Berhasil Didaftarkan!
            </h2>
            <p className="text-gray-600 mb-6">
              Pendaftaran koperasi telah berhasil disubmit dan akan diproses untuk review.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
            <p className="text-sm text-gray-500">
              Mengalihkan ke daftar koperasi...
            </p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Show registration form
  if (showForm) {
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
              onClick={() => setShowForm(false)}
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
                Daftarkan koperasi baru di wilayah {user.koperasi?.name || 'Jakarta Barat'}
              </p>
            </div>
          </div>

          <KoperasiForm
            onSubmit={handleKoperasiSubmit}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </LayoutWrapper>
    );
  }

  // Show detail modal
  if (selectedKoperasi) {
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
              onClick={() => setSelectedKoperasi(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Koperasi
              </h1>
              <p className="text-gray-600">
                Informasi lengkap koperasi {selectedKoperasi.name}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Koperasi
                  </label>
                  <p className="text-gray-900">{selectedKoperasi.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Koperasi
                  </label>
                  <p className="text-gray-900">{getTypeLabel(selectedKoperasi.type)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedKoperasi.status)}`}>
                    {selectedKoperasi.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Legal
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLegalStatusBadge(selectedKoperasi.legalStatus)}`}>
                    {selectedKoperasi.legalStatus.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Anggota
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedKoperasi.totalMembers.toLocaleString()} orang
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <p className="text-gray-900 flex items-start gap-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {selectedKoperasi.address}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penanggung Jawab
                  </label>
                  <p className="text-gray-900">{selectedKoperasi.contactPerson}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kontak
                  </label>
                  <div className="space-y-1">
                    <p className="text-gray-900 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedKoperasi.contactPhone}
                    </p>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedKoperasi.contactEmail}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pendaftaran
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedKoperasi.registrationDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <Button variant="outline">
                  <Edit className="w-4 h-4" />
                  Edit Data
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4" />
                  Lihat Dokumen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Main koperasi list view
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-600" />
              Manajemen Koperasi
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola koperasi yang Anda daftarkan di wilayah {user.koperasi?.name || 'Jakarta Barat'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Daftar Koperasi Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Koperasi
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama koperasi atau penanggung jawab"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="PENDING">Pending</option>
                <option value="NONAKTIF">Non-aktif</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Koperasi
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Jenis</option>
                <option value="SIMPAN_PINJAM">Simpan Pinjam</option>
                <option value="KONSUMSI">Konsumsi</option>
                <option value="PRODUKSI">Produksi</option>
                <option value="JASA">Jasa</option>
                <option value="SERBA_USAHA">Serba Usaha</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4" />
                Reset Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Koperasi List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Daftar Koperasi ({filteredKoperasi.length})
            </h3>
          </div>
          
          {filteredKoperasi.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada koperasi
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan mendaftarkan koperasi pertama di wilayah Anda
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Daftar Koperasi Pertama
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredKoperasi.map((koperasi) => (
                <div key={koperasi.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {koperasi.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(koperasi.status)}`}>
                          {koperasi.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLegalStatusBadge(koperasi.legalStatus)}`}>
                          {koperasi.legalStatus.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {getTypeLabel(koperasi.type)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {koperasi.totalMembers.toLocaleString()} anggota
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(koperasi.registrationDate).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {koperasi.address}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedKoperasi(koperasi)}
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/low/members')}
                      >
                        <Users className="w-4 h-4" />
                        Anggota
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
