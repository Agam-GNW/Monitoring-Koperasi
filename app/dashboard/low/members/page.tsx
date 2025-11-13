'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '../../../../components/layout/LayoutWrapper';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
  ownedKoperasi?: {
    id: string;
    name: string;
    status: string;
    legalStatus: string;
  };
}

interface Member {
  id: string;
  name: string;
  nik?: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  gender?: string;
  address: string;
  phone?: string;
  email?: string;
  joinDate: string;
  memberNumber?: string;
  isActive: boolean;
}

interface MemberFormData {
  name: string;
  nik?: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  gender?: string;
  address: string;
  phone?: string;
  email?: string;
  memberNumber?: string;
}

export default function MembersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    nik: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    memberNumber: ''
  });
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
          if (!userData.user.ownedKoperasi) {
            router.push('/dashboard/low/koperasi');
            return;
          }
          setUser(userData.user);
          await fetchMembers();
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

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/koperasi/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMember 
        ? `/api/koperasi/members?memberId=${editingMember.id}`
        : '/api/koperasi/members';
      
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchMembers();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data anggota');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/koperasi/members?memberId=${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus anggota');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Terjadi kesalahan saat menghapus anggota');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      nik: member.nik || '',
      dateOfBirth: member.dateOfBirth.split('T')[0],
      placeOfBirth: member.placeOfBirth || '',
      gender: member.gender || '',
      address: member.address,
      phone: member.phone || '',
      email: member.email || '',
      memberNumber: member.memberNumber || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nik: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      email: '',
      memberNumber: ''
    });
    setEditingMember(null);
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

  return (
    <LayoutWrapper 
      userRole="LOW" 
      onRoleChange={() => {}} 
      activeSection="anggota-koperasi" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anggota Koperasi</h1>
            <p className="text-gray-600 mt-1">
              Kelola data anggota {user.ownedKoperasi?.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total: {members.length} anggota</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Tambah Anggota
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIK
                      </label>
                      <input
                        type="text"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        maxLength={16}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Anggota
                      </label>
                      <input
                        type="text"
                        value={formData.memberNumber}
                        onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        value={formData.placeOfBirth}
                        onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingMember ? 'Simpan Perubahan' : 'Tambah Anggota'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TTL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data anggota. Klik tombol &quot;Tambah Anggota&quot; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.memberNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.gender || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.nik || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{member.placeOfBirth || '-'}</div>
                        <div>{new Date(member.dateOfBirth).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{member.phone || '-'}</div>
                        <div className="text-xs">{member.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {member.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
