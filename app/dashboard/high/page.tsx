'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../components/layout/LayoutWrapper';
import { StatCard } from '../../../components/ui/StatCard';
import { ApprovalTable } from '../../../components/ui/ApprovalTable';
import { 
  Building2, 
  Clock,
  CheckCircle, 
  XCircle,
  Users,
  Shield,
  AlertTriangle,
  Eye,
  Download,
  FileText,
  Filter
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
}

interface KoperasiPending {
  id: string;
  name: string;
  type: string;
  status: 'PENDING' | 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT' | 'TIDAK_DISETUJUI';
  totalMembers: number;
  submissionDate: Date;
  approvalDate?: Date;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  description?: string;
  ownerName: string;
  ownerEmail: string;
  approvalNotes?: string;
  rejectionReason?: string;
}

export default function HighDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [koperasiList, setKoperasiList] = useState<KoperasiPending[]>([]);
  const [filteredData, setFilteredData] = useState<KoperasiPending[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedKoperasi, setSelectedKoperasi] = useState<KoperasiPending | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [koperasiDocuments, setKoperasiDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [summary, setSummary] = useState({
    pending: 0,
    approved_sehat: 0,
    approved_tidak_sehat: 0,
    rejected: 0
  });
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
        setKoperasiList(result.data);
        setFilteredData(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Error fetching koperasi data:', error);
    }
  };

  useEffect(() => {
    if (selectedStatus === 'ALL') {
      setFilteredData(koperasiList);
    } else {
      setFilteredData(koperasiList.filter(k => k.status === selectedStatus));
    }
  }, [selectedStatus, koperasiList]);

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

  const handleApprove = async (koperasiId: string, action: 'APPROVE_SEHAT' | 'APPROVE_TIDAK_SEHAT', notes?: string) => {
    try {
      const response = await fetch('/api/koperasi/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          koperasiId,
          action,
          notes
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        await fetchKoperasiData(); // Refresh data
      } else {
        alert(result.error || 'Terjadi kesalahan saat memproses approval');
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleReject = async (koperasiId: string, reason: string) => {
    try {
      const response = await fetch('/api/koperasi/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          koperasiId,
          action: 'REJECT',
          rejectionReason: reason
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        await fetchKoperasiData(); // Refresh data
      } else {
        alert(result.error || 'Terjadi kesalahan saat menolak pengajuan');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleViewDetail = (koperasi: KoperasiPending) => {
    setSelectedKoperasi(koperasi);
    setShowDetailModal(true);
    fetchKoperasiDocuments(koperasi.id);
  };

  const fetchKoperasiDocuments = async (koperasiId: string) => {
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/koperasi/documents/upload?koperasiId=${koperasiId}`);
      if (response.ok) {
        const data = await response.json();
        setKoperasiDocuments(data.documents || []);
      } else {
        setKoperasiDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setKoperasiDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handlePreviewDocument = (doc: any) => {
    setPreviewDoc(doc);
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const response = await fetch(`/api/koperasi/documents/download/${doc.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Gagal mengunduh dokumen');
    }
  };

  const handleUpdateHealthStatus = async (koperasiId: string, newStatus: 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT') => {
    try {
      const response = await fetch('/api/koperasi/health-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          koperasiId,
          status: newStatus
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Status kesehatan berhasil diubah menjadi ${newStatus === 'AKTIF_SEHAT' ? 'Sehat' : 'Tidak Sehat'}`);
        await fetchKoperasiData(); // Refresh data
      } else {
        alert(result.error || 'Terjadi kesalahan saat mengubah status kesehatan');
      }
    } catch (error) {
      console.error('Error updating health status:', error);
      alert('Terjadi kesalahan jaringan');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const stats = [
    {
      title: 'Menunggu Approval',
      value: summary.pending.toString(),
      change: '+0%',
      changeType: 'neutral' as const,
      icon: Clock,
    },
    {
      title: 'Disetujui Sehat',
      value: summary.approved_sehat.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
    {
      title: 'Disetujui T. Sehat',
      value: summary.approved_tidak_sehat.toString(),
      change: '+2%',
      changeType: 'positive' as const,
      icon: AlertTriangle,
    },
    {
      title: 'Ditolak',
      value: summary.rejected.toString(),
      change: '0%',
      changeType: 'neutral' as const,
      icon: XCircle,
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            Dashboard Administrator
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola persetujuan pengajuan koperasi dari seluruh wilayah
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filter and Table */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Pengajuan
              </h3>
              <div className="flex items-center gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu Approval</option>
                  <option value="AKTIF_SEHAT">Disetujui - Sehat</option>
                  <option value="AKTIF_TIDAK_SEHAT">Disetujui - Tidak Sehat</option>
                  <option value="TIDAK_DISETUJUI">Ditolak</option>
                </select>
                <span className="text-sm text-gray-600">
                  Menampilkan {filteredData.length} dari {koperasiList.length} pengajuan
                </span>
              </div>
            </div>
          </div>

          <ApprovalTable
            data={filteredData}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleViewDetail}
            onUpdateHealthStatus={handleUpdateHealthStatus}
          />
        </div>

        {/* Information Panel */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Panduan Approval
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• <strong>Aktif - Sehat:</strong> Koperasi memenuhi semua persyaratan dan dalam kondisi baik</li>
                <li>• <strong>Aktif - Tidak Sehat:</strong> Koperasi disetujui tapi perlu perbaikan/monitoring</li>
                <li>• <strong>Tidak Disetujui:</strong> Koperasi tidak memenuhi persyaratan minimum</li>
                <li>• Berikan catatan yang jelas untuk setiap keputusan approval</li>
                <li>• Pastikan semua dokumen telah diperiksa sebelum membuat keputusan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedKoperasi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Detail Pengajuan Koperasi
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Koperasi</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Koperasi</label>
                    <p className="text-gray-900 font-medium">{selectedKoperasi.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Jenis</label>
                    <p className="text-gray-900">{selectedKoperasi.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Anggota</label>
                    <p className="text-gray-900">{selectedKoperasi.totalMembers.toLocaleString()} orang</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alamat</label>
                    <p className="text-gray-900">{selectedKoperasi.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                    <p className="text-gray-900">{selectedKoperasi.description || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Pengaju</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Pengaju</label>
                    <p className="text-gray-900 font-medium">{selectedKoperasi.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedKoperasi.ownerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Penanggung Jawab</label>
                    <p className="text-gray-900">{selectedKoperasi.contactPerson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">No. Telepon</label>
                    <p className="text-gray-900">{selectedKoperasi.contactPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                    <p className="text-gray-900">{formatDate(selectedKoperasi.submissionDate)}</p>
                  </div>
                  {selectedKoperasi.approvalDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tanggal Approval</label>
                      <p className="text-gray-900">{formatDate(selectedKoperasi.approvalDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedKoperasi.approvalNotes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Catatan Approval</h4>
                  <p className="text-blue-800 text-sm">{selectedKoperasi.approvalNotes}</p>
                </div>
              )}

              {selectedKoperasi.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Alasan Penolakan</h4>
                  <p className="text-red-800 text-sm">{selectedKoperasi.rejectionReason}</p>
                </div>
              )}

              {/* Documents Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Dokumen Persyaratan ({koperasiDocuments.length})
                </h4>
                
                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-gray-600 mt-2">Memuat dokumen...</p>
                  </div>
                ) : koperasiDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {koperasiDocuments.map((doc: any) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {doc.documentType === 'AKTA_PENDIRIAN' && '1. Akta Pendirian Koperasi'}
                              {doc.documentType === 'BERITA_ACARA' && '2. Berita Acara Rapat'}
                              {doc.documentType === 'DAFTAR_PENDIRI' && '3. Daftar Nama & KTP'}
                              {doc.documentType === 'BUKTI_SETORAN' && '4. Bukti Setoran Modal'}
                            </h5>
                            <p className="text-xs text-gray-500 mt-1">{doc.originalName}</p>
                            <p className="text-xs text-gray-400">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreviewDocument(doc)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          {doc.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Menunggu Verifikasi
                            </span>
                          )}
                          {doc.status === 'APPROVED' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Disetujui
                            </span>
                          )}
                          {doc.status === 'REJECTED' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Ditolak
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Belum ada dokumen yang diupload</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedKoperasi.status !== 'AKTIF_SEHAT' && selectedKoperasi.status !== 'AKTIF_TIDAK_SEHAT' && selectedKoperasi.status !== 'DITOLAK' && (
                <div className="border-t pt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      const reason = prompt('Alasan penolakan:');
                      if (reason && reason.trim()) {
                        handleReject(selectedKoperasi.id, reason);
                        setShowDetailModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Setujui dengan status Tidak Sehat?')) {
                        handleApprove(selectedKoperasi.id, 'APPROVE_TIDAK_SEHAT');
                        setShowDetailModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Setujui - Tidak Sehat
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Setujui pengajuan ini dengan status Sehat?')) {
                        handleApprove(selectedKoperasi.id, 'APPROVE_SEHAT');
                        setShowDetailModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Setujui - Sehat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{previewDoc.originalName}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {previewDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={`/api/koperasi/documents/view/${previewDoc.id}`}
                  className="w-full h-full min-h-[600px] bg-white rounded"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={`/api/koperasi/documents/view/${previewDoc.id}`}
                  alt={previewDoc.originalName}
                  className="max-w-full h-auto mx-auto rounded shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
