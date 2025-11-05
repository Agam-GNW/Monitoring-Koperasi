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
  Edit
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
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (!selectedKoperasi || !action) return;

    if (action === 'REJECT') {
      if (!rejectionReason.trim()) {
        alert('Alasan penolakan wajib diisi');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {action === 'REJECT' ? 'Tolak Pengajuan' : 
               action === 'APPROVE_SEHAT' ? 'Setujui - Status Sehat' :
               action === 'APPROVE_TIDAK_SEHAT' ? 'Setujui - Status Tidak Sehat' :
               'Ubah Status Kesehatan'}
            </h3>
            
            {action === 'REJECT' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Jelaskan alasan penolakan..."
                  />
                </div>
              </div>
            ) : action === 'UPDATE_HEALTH' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Pilih status kesehatan baru untuk koperasi ini:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: newHealthStatus === 'AKTIF_SEHAT' ? '#10b981' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="healthStatus"
                      value="AKTIF_SEHAT"
                      checked={newHealthStatus === 'AKTIF_SEHAT'}
                      onChange={(e) => setNewHealthStatus(e.target.value as 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT')}
                      className="mr-3"
                    />
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900">Koperasi Sehat</span>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: newHealthStatus === 'AKTIF_TIDAK_SEHAT' ? '#f59e0b' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="healthStatus"
                      value="AKTIF_TIDAK_SEHAT"
                      checked={newHealthStatus === 'AKTIF_TIDAK_SEHAT'}
                      onChange={(e) => setNewHealthStatus(e.target.value as 'AKTIF_SEHAT' | 'AKTIF_TIDAK_SEHAT')}
                      className="mr-3"
                    />
                    <XCircle className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-gray-900">Koperasi Tidak Sehat</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Tambahkan catatan untuk pengaju..."
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSubmitAction}
                className={`flex-1 ${
                  action === 'REJECT' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : action === 'UPDATE_HEALTH'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {action === 'REJECT' ? 'Tolak' : action === 'UPDATE_HEALTH' ? 'Update Status' : 'Setujui'}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
