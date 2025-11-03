import { Activity } from '../../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from './Badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface ActivityListProps {
  activities: Activity[];
  koperasiData: { id: string; name: string }[];
  userRole: 'HIGH' | 'LOW';
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityList({ 
  activities, 
  koperasiData, 
  userRole, 
  onActivityClick 
}: ActivityListProps) {
  const getKoperasiName = (koperasiId: string) => {
    const koperasi = koperasiData.find(k => k.id === koperasiId);
    return koperasi?.name || 'Unknown';
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      MEETING: 'Rapat',
      TRAINING: 'Pelatihan',
      AUDIT: 'Audit',
      EVENT: 'Acara',
      OTHER: 'Lainnya'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActivityTypeColor = (type: string) => {
    const colors = {
      MEETING: 'bg-blue-100 text-blue-800',
      TRAINING: 'bg-green-100 text-green-800',
      AUDIT: 'bg-yellow-100 text-yellow-800',
      EVENT: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PLANNED: 'Direncanakan',
      IN_PROGRESS: 'Berlangsung',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Filter upcoming activities (future dates)
  const upcomingActivities = activities.filter(activity => 
    new Date(activity.date) >= new Date() && activity.status !== 'CANCELLED'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Jadwal Kegiatan Mendatang
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {upcomingActivities.length} kegiatan yang akan datang
        </p>
      </div>
      
      <div className="p-6">
        {upcomingActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada kegiatan yang dijadwalkan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className={clsx(
                  "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",
                  onActivityClick && "cursor-pointer"
                )}
                onClick={() => onActivityClick?.(activity)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getActivityTypeColor(activity.type)}>
                      {getActivityTypeLabel(activity.type)}
                    </Badge>
                    <Badge className={getStatusColor(activity.status)}>
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(activity.date, 'dd MMM yyyy', { locale: id })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {format(activity.date, 'HH:mm')}
                    </div>
                  </div>
                  {userRole === 'HIGH' && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getKoperasiName(activity.koperasiId)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {upcomingActivities.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Lihat {upcomingActivities.length - 5} kegiatan lainnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
