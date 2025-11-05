'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { RATUpload } from '@/components/ui/RATUpload';
import { RATDocumentTable } from '@/components/ui/RATDocumentTable';

export default function RATPage() {
  const [koperasiId, setKoperasiId] = useState<string>('');
  const [koperasiName, setKoperasiName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchKoperasiData();
  }, []);

  const fetchKoperasiData = async () => {
    try {
      setLoading(true);
      // Get current user's koperasi
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error('Gagal mengambil data user');
      }

      setUserName(data.user.name);

      // Get koperasi details
      if (data.user.ownedKoperasi) {
        setKoperasiId(data.user.ownedKoperasi.id);
        setKoperasiName(data.user.ownedKoperasi.name);
      } else {
        setError('Anda belum terdaftar sebagai pemilik koperasi');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/login');
    }
  };

  const handleUploadSuccess = () => {
    // Refresh the table
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <LayoutWrapper 
        userRole="LOW" 
        onRoleChange={() => {}} 
        activeSection="upload-rat" 
        onSectionChange={() => {}}
        userName={userName}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper 
        userRole="LOW" 
        onRoleChange={() => {}} 
        activeSection="upload-rat" 
        onSectionChange={() => {}}
        userName={userName}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchKoperasiData}
              className="text-blue-600 hover:text-blue-800"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper 
      userRole="LOW" 
      onRoleChange={() => {}} 
      activeSection="upload-rat" 
      onSectionChange={() => {}}
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dokumen RAT</h1>
        <p className="mt-2 text-gray-600">
          Upload dan kelola dokumen Rapat Anggota Tahunan (RAT) koperasi Anda
        </p>
      </div>

      {/* Upload Section */}
      <RATUpload
        koperasiId={koperasiId}
        koperasiName={koperasiName}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Riwayat Upload RAT</h2>
        <RATDocumentTable
          key={refreshKey}
          isAdmin={false}
          koperasiId={koperasiId}
        />
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Tentang Dokumen RAT
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Rapat Anggota Tahunan (RAT)</strong> adalah rapat tertinggi dalam struktur 
            organisasi koperasi yang wajib diadakan minimal sekali dalam setahun.
          </p>
          <p className="mt-3"><strong>Dokumen yang perlu diupload meliputi:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Laporan pertanggungjawaban pengurus</li>
            <li>Laporan keuangan tahunan</li>
            <li>Rencana kerja dan anggaran tahun berikutnya</li>
            <li>Berita acara hasil RAT</li>
            <li>Daftar hadir peserta RAT</li>
          </ul>
          <p className="mt-3">
            <strong>Catatan:</strong> Semua dokumen yang diupload akan direview oleh admin. 
            Pastikan dokumen lengkap dan jelas.
          </p>
        </div>
      </div>
      </div>
    </LayoutWrapper>
  );
}
