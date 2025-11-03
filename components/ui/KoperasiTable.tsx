import { Koperasi } from '../../types';
import { getKoperasiTypeLabel, getStatusLabel, getLegalStatusLabel } from '../../lib/mockData';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from './Badge';
import { Eye, Edit, FileText, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface KoperasiTableProps {
  data: Koperasi[];
  userRole: 'HIGH' | 'LOW';
  onView?: (koperasi: Koperasi) => void;
  onEdit?: (koperasi: Koperasi) => void;
  onViewDocument?: (koperasi: Koperasi) => void;
}

export function KoperasiTable({ 
  data, 
  userRole, 
  onView, 
  onEdit, 
  onViewDocument 
}: KoperasiTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800';
      case 'NONAKTIF': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLegalStatusColor = (status: string) => {
    switch (status) {
      case 'LEGAL': return 'bg-blue-100 text-blue-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'NOT_SUBMITTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Daftar Koperasi
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Total {data.length} koperasi terdaftar
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Koperasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Legal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Anggota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktivitas Terakhir
              </th>
              {userRole === 'HIGH' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((koperasi) => (
              <tr key={koperasi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {koperasi.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {koperasi.contactPerson}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {getKoperasiTypeLabel(koperasi.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={koperasi.status === 'AKTIF' ? 'success' : 'error'}
                    className={getStatusColor(koperasi.status)}
                  >
                    {getStatusLabel(koperasi.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={koperasi.legalStatus === 'LEGAL' ? 'success' : 'warning'}
                    className={getLegalStatusColor(koperasi.legalStatus)}
                  >
                    {getLegalStatusLabel(koperasi.legalStatus)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="w-4 h-4 mr-1 text-gray-500" />
                    {koperasi.totalMembers}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {koperasi.contactPhone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(koperasi.lastActivity, 'dd MMM yyyy', { locale: id })}
                </td>
                {userRole === 'HIGH' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView?.(koperasi)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit?.(koperasi)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {koperasi.ratDocument && (
                        <button
                          onClick={() => onViewDocument?.(koperasi)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Lihat Dokumen RAT"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
