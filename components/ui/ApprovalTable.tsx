'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
  FileText,
  Edit,
  AlertCircle
} from 'lucide-react';
import { Button } from './Button';

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

interface ApprovalTableProps {
  data: KoperasiPending[];
  onApprove: (koperasiId: string, action: 'APPROVE_SEHAT' | 'APPROVE_TIDAK_SEHAT', notes?: string) => void;
  onReject: (koperasiId: string, reason: string) => void;
  onView: (koperasi: KoperasiPending) => void;
  onUpdateHealthStatus?: (koperasiId: string, newStatus: 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT') => void;
}

export function ApprovalTable({ data, onApprove, onReject, onView, onUpdateHealthStatus }: ApprovalTableProps) {
  const [selectedKoperasi, setSelectedKoperasi] = useState<string | null>(null);
  const [action, setAction] = useState<'APPROVE_SEHAT' | 'APPROVE_TIDAK_SEHAT' | 'REJECT' | 'UPDATE_HEALTH' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newHealthStatus, setNewHealthStatus] = useState<'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT'>('AKTIF_SEHAT');
  const [showModal, setShowModal] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </span>
        );
      case 'AKTIF_SEHAT':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif - Sehat
          </span>
        );
      case 'AKTIF_TIDAK_SEHAT':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif - Tidak Sehat
          </span>
        );
      case 'TIDAK_DISETUJUI':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const handleActionClick = (koperasiId: string, actionType: 'APPROVE_SEHAT' | 'APPROVE_TIDAK_SEHAT' | 'REJECT' | 'UPDATE_HEALTH') => {
    setSelectedKoperasi(koperasiId);
    setAction(actionType);
    setNotes('');
    setRejectionReason('');
    setValidationError('');
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (!selectedKoperasi || !action) return;

    if (action === 'REJECT') {
      if (!rejectionReason.trim()) {
        setValidationError('Alasan penolakan wajib diisi');
        return;
      }
      if (rejectionReason.trim().length < 20) {
        setValidationError('Alasan penolakan minimal 20 karakter');
        return;
      }
      onReject(selectedKoperasi, rejectionReason);
    } else if (action === 'UPDATE_HEALTH') {
      if (onUpdateHealthStatus) {
        onUpdateHealthStatus(selectedKoperasi, newHealthStatus);
      }
    } else {
      onApprove(selectedKoperasi, action, notes);
    }

    setShowModal(false);
    setSelectedKoperasi(null);
    setAction(null);
    setNotes('');
    setRejectionReason('');
    setNewHealthStatus('AKTIF_SEHAT');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Pengajuan Koperasi
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total {data.length} pengajuan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Koperasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengaju
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((koperasi) => (
                <tr key={koperasi.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {koperasi.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {koperasi.type.replace('_', ' ')} • {koperasi.totalMembers} anggota
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {koperasi.ownerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {koperasi.ownerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(koperasi.submissionDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(koperasi.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(koperasi)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {koperasi.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleActionClick(koperasi.id, 'APPROVE_SEHAT')}
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                          >
                            Setujui Sehat
                          </button>
                          <button
                            onClick={() => handleActionClick(koperasi.id, 'APPROVE_TIDAK_SEHAT')}
                            className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 rounded border border-orange-300 hover:bg-orange-50"
                          >
                            Setujui T. Sehat
                          </button>
                          <button
                            onClick={() => handleActionClick(koperasi.id, 'REJECT')}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-300 hover:bg-red-50"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      {(koperasi.status === 'AKTIF_SEHAT' || koperasi.status === 'AKTIF_TIDAK_SEHAT') && onUpdateHealthStatus && (
                        <button
                          onClick={() => {
                            setSelectedKoperasi(koperasi.id);
                            setNewHealthStatus(koperasi.status === 'AKTIF_SEHAT' ? 'AKTIF_TIDAK_SEHAT' : 'AKTIF_SEHAT');
                            setAction('UPDATE_HEALTH');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-300 hover:bg-blue-50 flex items-center gap-1"
                          title="Ubah Status Kesehatan"
                        >
                          <Edit className="w-3 h-3" />
                          Ubah Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada pengajuan
            </h3>
            <p className="text-gray-600">
              Belum ada pengajuan koperasi yang perlu direview
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header with gradient */}
            <div className={`p-6 ${
              action === 'REJECT' 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : action === 'APPROVE_SEHAT'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : action === 'APPROVE_TIDAK_SEHAT'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <div className="flex items-center gap-3 text-white">
                {action === 'REJECT' ? (
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6" />
                  </div>
                ) : action === 'APPROVE_SEHAT' ? (
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                ) : action === 'APPROVE_TIDAK_SEHAT' ? (
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {action === 'REJECT' ? 'Tolak Pengajuan Koperasi' : 
                     action === 'APPROVE_SEHAT' ? 'Setujui Koperasi - Status Sehat' :
                     action === 'APPROVE_TIDAK_SEHAT' ? 'Setujui Koperasi - Status Tidak Sehat' :
                     'Ubah Status Kesehatan Koperasi'}
                  </h3>
                  <p className="text-sm text-white text-opacity-90 mt-1">
                    {selectedKoperasi?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {action === 'REJECT' ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Perhatian!</p>
                        <p className="text-xs text-red-700 mt-1">
                          Pengajuan yang ditolak tidak dapat dikembalikan. Pastikan alasan penolakan jelas dan detail.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {validationError && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800">{validationError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setValidationError('');
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 transition-colors text-gray-900 ${
                        validationError ? 'border-red-500' : 'border-gray-200 focus:border-red-500'
                      }`}
                      rows={5}
                      placeholder="Contoh: Dokumen yang diupload tidak lengkap atau tidak sesuai dengan persyaratan..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Minimal 20 karakter. Jelaskan secara detail alasan penolakan.
                      </p>
                      <p className={`text-xs font-medium ${
                        rejectionReason.length >= 20 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {rejectionReason.length}/20
                      </p>
                    </div>
                  </div>
                </div>
              ) : action === 'UPDATE_HEALTH' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    💡 Pilih status kesehatan baru untuk koperasi ini berdasarkan evaluasi Anda
                  </p>
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      newHealthStatus === 'AKTIF_SEHAT' 
                        ? 'border-green-500 bg-green-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="healthStatus"
                        value="AKTIF_SEHAT"
                        checked={newHealthStatus === 'AKTIF_SEHAT'}
                        onChange={(e) => setNewHealthStatus(e.target.value as 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Koperasi Sehat</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-7">
                          Koperasi memenuhi semua standar dan berjalan dengan baik
                        </p>
                      </div>
                    </label>
                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      newHealthStatus === 'AKTIF_TIDAK_SEHAT' 
                        ? 'border-orange-500 bg-orange-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="healthStatus"
                        value="AKTIF_TIDAK_SEHAT"
                        checked={newHealthStatus === 'AKTIF_TIDAK_SEHAT'}
                        onChange={(e) => setNewHealthStatus(e.target.value as 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-gray-900">Koperasi Tidak Sehat</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-7">
                          Koperasi memiliki masalah atau tidak memenuhi standar tertentu
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 mb-4 ${
                    action === 'APPROVE_SEHAT' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        action === 'APPROVE_SEHAT' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          action === 'APPROVE_SEHAT' ? 'text-green-800' : 'text-orange-800'
                        }`}>
                          {action === 'APPROVE_SEHAT' 
                            ? 'Koperasi akan disetujui dengan status SEHAT' 
                            : 'Koperasi akan disetujui dengan status TIDAK SEHAT'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          action === 'APPROVE_SEHAT' ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {action === 'APPROVE_SEHAT'
                            ? 'Koperasi memenuhi semua persyaratan dan dapat beroperasi dengan baik'
                            : 'Koperasi disetujui namun perlu perbaikan di beberapa aspek'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Catatan untuk Pengaju (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      rows={4}
                      placeholder="Tambahkan catatan atau saran untuk pengaju koperasi..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 border-2 hover:bg-gray-100"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitAction}
                disabled={action === 'REJECT' && rejectionReason.trim().length < 20}
                className={`flex-1 ${
                  action === 'REJECT' 
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300' 
                    : action === 'APPROVE_SEHAT'
                    ? 'bg-green-600 hover:bg-green-700'
                    : action === 'APPROVE_TIDAK_SEHAT'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold disabled:cursor-not-allowed transition-colors`}
              >
                {action === 'REJECT' ? '✕ Tolak Pengajuan' : 
                 action === 'UPDATE_HEALTH' ? '✓ Update Status' : 
                 action === 'APPROVE_SEHAT' ? '✓ Setujui Sehat' :
                 '✓ Setujui Tidak Sehat'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
