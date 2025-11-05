'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { RATDocumentTable } from '@/components/ui/RATDocumentTable';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminRATPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchUserData();
  }, [refreshKey]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (response.ok && data.user) {
        setUserName(data.user.name);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/koperasi/rat');
      const data = await response.json();

      if (response.ok && data.documents) {
        const documents = data.documents;
        setStats({
          total: documents.length,
          pending: documents.filter((d: any) => d.status === 'PENDING').length,
          approved: documents.filter((d: any) => d.status === 'APPROVED').length,
          rejected: documents.filter((d: any) => d.status === 'REJECTED').length,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  return (
    <LayoutWrapper 
      userRole="HIGH" 
      onRoleChange={() => {}} 
      activeSection="dokumen" 
      onSectionChange={() => {}}
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Dokumen RAT</h1>
        <p className="mt-2 text-gray-600">
          Kelola dan review dokumen Rapat Anggota Tahunan dari semua koperasi
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Dokumen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {loading ? '...' : stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {loading ? '...' : stats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {loading ? '...' : stats.rejected}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div>
        <RATDocumentTable
          key={refreshKey}
          isAdmin={true}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Information Card */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">
          Panduan Review Dokumen RAT
        </h3>
        <div className="text-sm text-purple-800 space-y-2">
          <p><strong>Hal yang perlu diperiksa saat review:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Kelengkapan dokumen (laporan pertanggungjawaban, laporan keuangan, dll)</li>
            <li>Kejelasan dan kualitas dokumen yang diupload</li>
            <li>Kesesuaian dengan format dan ketentuan yang berlaku</li>
            <li>Tanggal pelaksanaan RAT (harus dalam 1 tahun terakhir)</li>
            <li>Tanda tangan dan cap koperasi pada berita acara</li>
          </ul>
          <p className="mt-3"><strong>Status Review:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>PENDING:</strong> Dokumen belum direview</li>
            <li><strong>APPROVED:</strong> Dokumen lengkap dan sesuai</li>
            <li><strong>REJECTED:</strong> Dokumen ditolak (berikan alasan)</li>
            <li><strong>RESUBMIT:</strong> Perlu perbaikan dan upload ulang</li>
          </ul>
        </div>
      </div>
      </div>
    </LayoutWrapper>
  );
}
