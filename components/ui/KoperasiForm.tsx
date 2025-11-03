'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, MapPin, Phone, Mail, FileText, User, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from './Button';

// Interfaces for location data
interface Province {
  code: string;
  name: string;
}

interface Regency {
  code: string;
  name: string;
  province_code: string;
}

interface District {
  code: string;
  name: string;
  regency_code: string;
}

export interface KoperasiFormData {
  name: string;
  type: 'SIMPAN_PINJAM' | 'KONSUMSI' | 'PRODUKSI' | 'JASA' | 'SERBA_USAHA';
  province: string;
  regency: string;
  district: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  totalMembers: number;
  description: string;
  establishmentDate: string;
  fundingSource: string;
  initialCapital: number;
  legalDocuments: File[];
}

interface KoperasiFormProps {
  onSubmit: (data: KoperasiFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function KoperasiForm({ onSubmit, onCancel, isSubmitting = false }: KoperasiFormProps) {
  const [formData, setFormData] = useState<KoperasiFormData>({
    name: '',
    type: 'SIMPAN_PINJAM',
    province: '',
    regency: '',
    district: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    totalMembers: 0,
    description: '',
    establishmentDate: '',
    fundingSource: '',
    initialCapital: 0,
    legalDocuments: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const koperasiTypes = [
    { value: 'SIMPAN_PINJAM', label: 'Simpan Pinjam' },
    { value: 'KONSUMSI', label: 'Konsumsi' },
    { value: 'PRODUKSI', label: 'Produksi' },
    { value: 'JASA', label: 'Jasa' },
    { value: 'SERBA_USAHA', label: 'Serba Usaha' },
  ];

  const fundingSourceOptions = [
    { value: 'SIMPANAN_ANGGOTA', label: 'Simpanan Pokok Anggota' },
    { value: 'SIMPANAN_WAJIB', label: 'Simpanan Wajib Anggota' },
    { value: 'SIMPANAN_SUKARELA', label: 'Simpanan Sukarela Anggota' },
    { value: 'HIBAH_PEMERINTAH', label: 'Hibah Pemerintah' },
    { value: 'PINJAMAN_BANK', label: 'Pinjaman Bank' },
    { value: 'PINJAMAN_KOPERASI_LAIN', label: 'Pinjaman dari Koperasi Lain' },
    { value: 'DANA_CADANGAN', label: 'Dana Cadangan' },
    { value: 'MODAL_PENYERTAAN', label: 'Modal Penyertaan' },
    { value: 'LAINNYA', label: 'Lainnya' },
  ];

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLocationError('');
        const response = await fetch('/api/location/provinces');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProvinces(data.data || []);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setProvinces([]);
        setLocationError('Gagal memuat data provinsi. Silakan coba lagi.');
      }
    };

    fetchProvinces();
  }, []);

  // Fetch regencies when province changes
  useEffect(() => {
    if (formData.province) {
      const fetchRegencies = async () => {
        setLoadingRegencies(true);
        setLocationError('');
        try {
          const response = await fetch(`/api/location/regencies/${formData.province}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setRegencies(data.data || []);
          // Reset regency and district when province changes
          setFormData(prev => ({ ...prev, regency: '', district: '' }));
          setDistricts([]);
        } catch (error) {
          console.error('Error fetching regencies:', error);
          setRegencies([]);
          setLocationError('Gagal memuat data kabupaten/kota. Silakan coba lagi.');
          // Reset regency and district when province changes
          setFormData(prev => ({ ...prev, regency: '', district: '' }));
          setDistricts([]);
        } finally {
          setLoadingRegencies(false);
        }
      };

      fetchRegencies();
    } else {
      setRegencies([]);
      setDistricts([]);
      setFormData(prev => ({ ...prev, regency: '', district: '' }));
    }
  }, [formData.province]);

  // Fetch districts when regency changes
  useEffect(() => {
    if (formData.regency) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setLocationError('');
        try {
          const response = await fetch(`/api/location/districts/${formData.regency}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setDistricts(data.data || []);
          // Reset district when regency changes
          setFormData(prev => ({ ...prev, district: '' }));
        } catch (error) {
          console.error('Error fetching districts:', error);
          setDistricts([]);
          setLocationError('Gagal memuat data kecamatan. Silakan coba lagi.');
          // Reset district when regency changes
          setFormData(prev => ({ ...prev, district: '' }));
        } finally {
          setLoadingDistricts(false);
        }
      };

      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.regency]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama koperasi wajib diisi';
    }

    if (!formData.province) {
      newErrors.province = 'Provinsi wajib dipilih';
    }

    if (!formData.regency) {
      newErrors.regency = 'Kabupaten/Kota wajib dipilih';
    }

    if (!formData.district) {
      newErrors.district = 'Kecamatan wajib dipilih';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat lengkap wajib diisi';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Nama penanggung jawab wajib diisi';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Nomor telepon wajib diisi';
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Format nomor telepon tidak valid';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Format email tidak valid';
    }

    if (formData.totalMembers < 20) {
      newErrors.totalMembers = 'Minimum 20 anggota untuk mendirikan koperasi';
    }

    if (!formData.establishmentDate) {
      newErrors.establishmentDate = 'Tanggal pendirian wajib diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi koperasi wajib diisi';
    }

    if (!formData.fundingSource) {
      newErrors.fundingSource = 'Sumber dana wajib dipilih';
    }

    if (formData.initialCapital < 1000000) {
      newErrors.initialCapital = 'Modal awal minimal Rp 1.000.000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof KoperasiFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, legalDocuments: files }));
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    // Format with thousands separator
    return new Intl.NumberFormat('id-ID').format(Number(numericValue));
  };

  const parseNumber = (value: string): number => {
    // Remove all non-digit characters and convert to number
    return Number(value.replace(/\D/g, ''));
  };

  const handleCurrencyChange = (value: string) => {
    const numericValue = parseNumber(value);
    setFormData(prev => ({ ...prev, initialCapital: numericValue }));
    // Clear error when user starts typing
    if (errors.initialCapital) {
      setErrors(prev => ({ ...prev, initialCapital: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Pengajuan Koperasi Baru
        </h2>
        <p className="text-gray-800 mt-1">
          Lengkapi formulir berikut untuk mengajukan koperasi baru. Setiap user hanya dapat mengajukan satu koperasi.
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm font-medium">
            ℹ️ Pengajuan akan direview oleh admin dan akan mendapat status: Aktif-Sehat, Aktif-Tidak Sehat, atau Tidak Disetujui
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Informasi Dasar */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Informasi Dasar Koperasi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nama Koperasi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Koperasi Makmur Sejahtera"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Jenis Koperasi *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                {koperasiTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Provinsi *
              </label>
              <select
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Kabupaten/Kota *
              </label>
              <select
                value={formData.regency}
                onChange={(e) => handleInputChange('regency', e.target.value)}
                disabled={!formData.province || loadingRegencies}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.regency ? 'border-red-500' : 'border-gray-300'
                } ${(!formData.province || loadingRegencies) ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
              >
                <option value="">
                  {loadingRegencies ? 'Loading...' : 'Pilih Kabupaten/Kota'}
                </option>
                {regencies.map((regency) => (
                  <option key={regency.code} value={regency.code}>
                    {regency.name}
                  </option>
                ))}
              </select>
              {errors.regency && <p className="text-red-500 text-sm mt-1">{errors.regency}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Kecamatan *
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                disabled={!formData.regency || loadingDistricts}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                } ${(!formData.regency || loadingDistricts) ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
              >
                <option value="">
                  {loadingDistricts ? 'Loading...' : 'Pilih Kecamatan'}
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>
          </div>

          {/* Location Error Message */}
          {locationError && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-900 font-medium">{locationError}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Alamat Lengkap *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contoh: Jl. Sudirman No. 123, RT/RW 001/002, Kelurahan ABC"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tanggal Pendirian *
              </label>
              <input
                type="date"
                value={formData.establishmentDate}
                onChange={(e) => handleInputChange('establishmentDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.establishmentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.establishmentDate && <p className="text-red-500 text-sm mt-1">{errors.establishmentDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Jumlah Anggota *
              </label>
              <input
                type="number"
                min="20"
                value={formData.totalMembers || ''}
                onChange={(e) => handleInputChange('totalMembers', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.totalMembers ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Minimum 20 anggota"
              />
              {errors.totalMembers && <p className="text-red-500 text-sm mt-1">{errors.totalMembers}</p>}
            </div>
          </div>
        </div>

        {/* Informasi Keuangan */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Informasi Keuangan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Modal Awal Koperasi *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  value={formData.initialCapital > 0 ? formatNumber(formData.initialCapital.toString()) : ''}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                    errors.initialCapital ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5.000.000"
                />
              </div>
              {errors.initialCapital && <p className="text-red-500 text-sm mt-1">{errors.initialCapital}</p>}
              <p className="text-sm text-gray-700 mt-1">
                Minimal Rp 1.000.000 
                {formData.initialCapital > 0 && (
                  <span className="block text-green-600 font-medium">
                    = {formatCurrency(formData.initialCapital)}
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sumber Dana *
              </label>
              <select
                value={formData.fundingSource}
                onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.fundingSource ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Sumber Dana</option>
                {fundingSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.fundingSource && <p className="text-red-500 text-sm mt-1">{errors.fundingSource}</p>}
              <p className="text-sm text-gray-700 mt-1">Pilih sumber dana utama untuk modal awal</p>
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informasi Penanggung Jawab
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nama Penanggung Jawab *
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nama lengkap ketua/pengurus"
              />
              {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                  errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="08xxxxxxxxxx"
              />
              {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                errors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@koperasi.com"
            />
            {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Deskripsi Koperasi
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Deskripsi dan Tujuan Koperasi *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jelaskan tujuan, kegiatan utama, dan visi misi koperasi"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Upload Dokumen */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Dokumen Legal
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Dokumen Pendirian
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            />
            <p className="text-sm text-gray-700 mt-1 font-medium">
              Upload dokumen seperti: Akta Pendirian, AD/ART, Surat Keterangan Domisili, dll.
              Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
            </p>
            {formData.legalDocuments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900">File terpilih:</p>
                <ul className="text-sm text-gray-800">
                  {formData.legalDocuments.map((file, index) => (
                    <li key={index}>• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Sedang Memproses...' : 'Ajukan Koperasi'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
