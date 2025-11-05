'use client';

import { useState, useEffect } from 'react';
import { Badge } from './Badge';

interface RATDocument {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';
  uploadDate: string;
  reviewDate?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  koperasi: {
    id: string;
    name: string;
    type: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail?: string;
    address: string;
  };
}

interface RATDocumentTableProps {
  isAdmin?: boolean;
  koperasiId?: string;
  onRefresh?: () => void;
}

export function RATDocumentTable({ isAdmin = false, koperasiId, onRefresh }: RATDocumentTableProps) {
  const [documents, setDocuments] = useState<RATDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<RATDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [koperasiId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (koperasiId) {
        params.append('koperasiId', koperasiId);
      }

      const response = await fetch(`/api/koperasi/rat?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data');
      }

      setDocuments(data.documents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (doc: RATDocument) => {
    // Open in new tab for preview
    window.open(`/api/koperasi/rat/view/${doc.id}`, '_blank');
  };

  const handleDownload = (doc: RATDocument) => {
    // Download file
    window.location.href = `/api/koperasi/rat/download/${doc.id}`;
  };

  const handleReview = (doc: RATDocument) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.status);
    setReviewNotes(doc.reviewNotes || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDoc || !reviewStatus) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/koperasi/rat', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          status: reviewStatus,
          reviewNotes,
          reviewedBy: 'Admin', // TODO: Get from session
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate status');
      }

      // Refresh list
      await fetchDocuments();
      setShowModal(false);
      setSelectedDoc(null);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      RESUBMIT: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Dokumen RAT {!isAdmin && '- Koperasi Saya'}
        </h3>
        <button
          onClick={fetchDocuments}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Belum ada dokumen RAT yang diupload
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama File
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koperasi
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ukuran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Upload
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
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doc.originalName}</div>
                    {doc.reviewNotes && (
                      <div className="text-xs text-gray-500 mt-1">
                        Catatan: {doc.reviewNotes}
                      </div>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{doc.koperasi.name}</div>
                      <div className="text-xs text-gray-500">{doc.koperasi.contactPerson}</div>
                      <div className="text-xs text-gray-500">{doc.koperasi.contactPhone}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploadDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                    {doc.reviewDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Review: {formatDate(doc.reviewDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-green-600 hover:text-green-900"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleReview(doc)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Review"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Review Dokumen RAT</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Koperasi:</strong> {selectedDoc.koperasi.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>File:</strong> {selectedDoc.originalName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="RESUBMIT">RESUBMIT</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Review
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tambahkan catatan review..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={updating}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
