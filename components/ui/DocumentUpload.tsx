'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Eye, Download, Trash2, AlertCircle } from 'lucide-react';

interface UploadedDocument {
  id: string;
  documentType: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: string;
  uploadDate: string;
}

interface DocumentUploadProps {
  koperasiId: string;
  onUploadComplete?: () => void;
  documents?: UploadedDocument[];
}

const DOCUMENT_TYPES = [
  { value: 'AKTA_PENDIRIAN', label: 'Akta Pendirian Koperasi (AD/ART)', required: true },
  { value: 'BERITA_ACARA', label: 'Berita Acara Rapat Pendirian', required: true },
  { value: 'DAFTAR_PENDIRI', label: 'Daftar Nama & KTP Pendiri', required: true },
  { value: 'BUKTI_SETORAN', label: 'Bukti Setoran Modal Awal', required: true },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export function DocumentUpload({ koperasiId, onUploadComplete, documents = [] }: DocumentUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const getDocumentByType = (type: string) => {
    return documents.find(doc => doc.documentType === type);
  };

  const handleFileSelect = async (type: string, file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Hanya file PDF, JPG, atau PNG yang diperbolehkan');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);
    formData.append('koperasiId', koperasiId);

    try {
      const response = await fetch('/api/koperasi/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        const error = await response.json();
        alert(`Gagal upload: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Terjadi kesalahan saat upload file');
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(type, file);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
    // Reset input
    e.target.value = '';
  };

  const handlePreview = (doc: UploadedDocument) => {
    setPreviewDoc(doc);
  };

  const handleDownload = async (doc: UploadedDocument) => {
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
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Gagal download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Menunggu Verifikasi</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Disetujui</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Ditolak</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const uploadedDoc = getDocumentByType(docType.value);
          const isUploading = uploading === docType.value;
          const isDragging = dragOver === docType.value;

          return (
            <div
              key={docType.value}
              className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : uploadedDoc
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={(e) => handleDrop(e, docType.value)}
              onDragOver={(e) => handleDragOver(e, docType.value)}
              onDragLeave={handleDragLeave}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${uploadedDoc ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {uploadedDoc ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">{docType.label}</h4>
                  
                  {uploadedDoc ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium truncate">{uploadedDoc.originalName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(uploadedDoc.fileSize)} • Diupload {new Date(uploadedDoc.uploadDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(uploadedDoc.status)}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(uploadedDoc)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(uploadedDoc)}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>

                      <button
                        onClick={() => fileInputRefs.current[docType.value]?.click()}
                        disabled={isUploading}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Upload Ulang
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {docType.required && <span className="text-red-600">* </span>}
                        Drag & drop file atau klik untuk upload
                      </p>

                      {isUploading ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRefs.current[docType.value]?.click()}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Pilih File
                        </button>
                      )}

                      <p className="text-xs text-gray-500">
                        Format: PDF, JPG, PNG (Max. 5MB)
                      </p>
                    </div>
                  )}

                  <input
                    ref={(el) => {
                      fileInputRefs.current[docType.value] = el;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileInputChange(e, docType.value)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Status Upload</h4>
              <p className="text-sm text-gray-600">
                {documents.length} dari {DOCUMENT_TYPES.length} dokumen telah diupload
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((documents.length / DOCUMENT_TYPES.length) * 100)}%
            </div>
            <p className="text-xs text-gray-500">Kelengkapan</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(documents.length / DOCUMENT_TYPES.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {documents.length === DOCUMENT_TYPES.length && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">Semua dokumen telah diupload!</p>
              <p className="text-xs text-green-700 mt-1">
                Koperasi Anda akan segera diverifikasi oleh admin.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDoc.originalName}</h3>
                <p className="text-sm text-gray-600">{formatFileSize(previewDoc.fileSize)}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {previewDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={`/api/koperasi/documents/view/${previewDoc.id}`}
                  className="w-full h-full min-h-[600px] border rounded-lg"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={`/api/koperasi/documents/view/${previewDoc.id}`}
                  alt={previewDoc.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => handleDownload(previewDoc)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
