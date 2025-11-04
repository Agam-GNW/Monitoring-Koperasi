'use client';

import { useState, useEffect } from 'react';
import { KoperasiForm, KoperasiFormData } from './KoperasiForm';
import { DocumentUpload } from './DocumentUpload';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KoperasiRegistrationProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function KoperasiRegistration({ onBack, onSuccess }: KoperasiRegistrationProps) {
  const router = useRouter();
  
  // Use sessionStorage to persist state across re-renders
  const [step, setStepState] = useState<'form' | 'documents' | 'success'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('registrationStep') as any) || 'form';
    }
    return 'form';
  });
  
  const setStep = (newStep: 'form' | 'documents' | 'success') => {
    setStepState(newStep);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('registrationStep', newStep);
    }
  };
  
  const [createdKoperasiId, setCreatedKoperasiIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('registrationKoperasiId');
    }
    return null;
  });
  
  const setCreatedKoperasiId = (id: string | null) => {
    setCreatedKoperasiIdState(id);
    if (typeof window !== 'undefined') {
      if (id) {
        sessionStorage.setItem('registrationKoperasiId', id);
      } else {
        sessionStorage.removeItem('registrationKoperasiId');
      }
    }
  };
  
  const [koperasiName, setKoperasiNameState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('registrationKoperasiName') || '';
    }
    return '';
  });
  
  const setKoperasiName = (name: string) => {
    setKoperasiNameState(name);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('registrationKoperasiName', name);
    }
  };
  
  const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocuments = async () => {
    if (!createdKoperasiId) return;
    
    try {
      const response = await fetch(`/api/koperasi/documents/upload?koperasiId=${createdKoperasiId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    if (step === 'documents' && createdKoperasiId) {
      fetchDocuments();
    }
  }, [step, createdKoperasiId]);

  const handleFormSubmit = async (formData: KoperasiFormData) => {
    try {
      const response = await fetch('/api/koperasi/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Registration result:', result);
        
        // API returns { koperasi: { id, name, ... } }
        if (result.koperasi) {
          setCreatedKoperasiId(result.koperasi.id);
          setKoperasiName(result.koperasi.name);
          setStep('documents');
        } else {
          alert('Error: Response tidak memiliki data koperasi');
        }
      } else {
        const error = await response.json();
        alert(`Gagal mendaftarkan koperasi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat mendaftarkan koperasi');
    }
  };

  const handleDocumentsComplete = () => {
    // Refresh documents list instead of redirecting
    fetchDocuments();
  };

  const handleFinish = () => {
    setStep('success');
    
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('registrationStep');
      sessionStorage.removeItem('registrationKoperasiId');
      sessionStorage.removeItem('registrationKoperasiName');
    }
    
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/low');
      }
    }, 2000);
  };

  if (step === 'form') {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            // Clear sessionStorage when going back
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('registrationStep');
              sessionStorage.removeItem('registrationKoperasiId');
              sessionStorage.removeItem('registrationKoperasiName');
            }
            onBack();
          }}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pendaftaran Koperasi Baru
          </h2>
          <KoperasiForm onSubmit={handleFormSubmit} onCancel={onBack} />
        </div>
      </div>
    );
  }

  if (step === 'documents') {
    const allDocumentsUploaded = documents.length >= 4;

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Upload Dokumen Persyaratan
          </h2>
          <div className="text-sm text-gray-600">
            Koperasi: <span className="font-semibold">{koperasiName}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Dokumen yang Diperlukan
              </h3>
              <p className="text-sm text-blue-800">
                Silakan upload 4 dokumen berikut untuk melengkapi pendaftaran koperasi:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Akta Pendirian Koperasi (AD/ART)</li>
                <li>• Berita Acara Rapat Pendirian</li>
                <li>• Daftar Nama & KTP Pendiri</li>
                <li>• Bukti Setoran Modal Awal</li>
              </ul>
            </div>
          </div>
        </div>

        {createdKoperasiId && (
          <DocumentUpload
            koperasiId={createdKoperasiId}
            onUploadComplete={handleDocumentsComplete}
            documents={documents}
          />
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/dashboard/low')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kembali ke Dashboard
          </button>
          
          {allDocumentsUploaded && (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Selesai & Lihat Status
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pendaftaran Berhasil!
          </h2>
          <p className="text-gray-600 mb-6">
            Koperasi {koperasiName} telah berhasil didaftarkan dan menunggu verifikasi dari admin.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
