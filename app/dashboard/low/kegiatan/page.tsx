'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  X,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'HIGH' | 'LOW';
}

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  maxParticipants?: number;
}

export default function EventViewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('UPCOMING');
  
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
          setUser(userData.user);
          await fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?upcoming=true');
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data);
        setFilteredEvents(result.data.filter((e: Event) => e.status === 'UPCOMING'));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    if (filterStatus === 'ALL') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(e => e.status === filterStatus));
    }
  }, [filterStatus, events]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      UPCOMING: 'Akan Datang',
      ONGOING: 'Berlangsung',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan'
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getDaysUntil = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays < 0) return 'Sudah lewat';
    return `${diffDays} hari lagi`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
  const ongoingEvents = events.filter(e => e.status === 'ONGOING');

  return (
    <LayoutWrapper 
      userRole="LOW" 
      onRoleChange={() => {}} 
      activeSection="kegiatan" 
      onSectionChange={() => {}}
      userName={user.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Jadwal Kegiatan
          </h1>
          <p className="text-gray-600 mt-1">
            Lihat jadwal kegiatan yang akan dilaksanakan
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Akan Datang</p>
                <p className="text-3xl font-bold mt-1">{upcomingEvents.length}</p>
                <p className="text-sm text-blue-100 mt-2">Kegiatan dijadwalkan</p>
              </div>
              <Calendar className="w-12 h-12 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Berlangsung</p>
                <p className="text-3xl font-bold mt-1">{ongoingEvents.length}</p>
                <p className="text-sm text-green-100 mt-2">Kegiatan aktif</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Kegiatan</p>
                <p className="text-3xl font-bold mt-1">{events.length}</p>
                <p className="text-sm text-purple-100 mt-2">Keseluruhan</p>
              </div>
              <Users className="w-12 h-12 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Kegiatan</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="UPCOMING">Akan Datang</option>
              <option value="ONGOING">Berlangsung</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada kegiatan dijadwalkan</p>
              <p className="text-gray-400 text-sm mt-2">Kegiatan akan muncul di sini setelah admin menambahkannya</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      {event.status === 'UPCOMING' && (
                        <p className="text-blue-600 font-medium text-sm">
                          {getDaysUntil(event.eventDate)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-4">{event.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Tanggal</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Waktu</p>
                        <p className="text-sm font-medium text-gray-900">{event.startTime} - {event.endTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Lokasi</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Penyelenggara</p>
                        <p className="text-sm font-medium text-gray-900">{event.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {event.maxParticipants && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Kuota Peserta:</span> {event.maxParticipants} orang
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Detail Kegiatan</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedEvent.status)}
                {selectedEvent.status === 'UPCOMING' && (
                  <span className="text-blue-600 font-semibold">
                    {getDaysUntil(selectedEvent.eventDate)}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h4>
                {selectedEvent.description && (
                  <p className="text-gray-700">{selectedEvent.description}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Tanggal
                  </label>
                  <p className="text-gray-900 font-medium">{formatFullDate(selectedEvent.eventDate)}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Waktu
                  </label>
                  <p className="text-gray-900 font-medium">{selectedEvent.startTime} - {selectedEvent.endTime} WIB</p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Lokasi
                  </label>
                  <p className="text-gray-900 font-medium">{selectedEvent.location}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Penyelenggara
                  </label>
                  <p className="text-gray-900 font-medium">{selectedEvent.organizer}</p>
                </div>

                {selectedEvent.maxParticipants && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Kuota Peserta
                    </label>
                    <p className="text-gray-900 font-medium">{selectedEvent.maxParticipants} orang</p>
                  </div>
                )}
              </div>

              {/* Important Note */}
              {selectedEvent.status === 'UPCOMING' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm">
                    <span className="font-semibold">📌 Catatan:</span> Pastikan untuk hadir tepat waktu. Untuk informasi lebih lanjut, hubungi penyelenggara.
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedEvent(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
