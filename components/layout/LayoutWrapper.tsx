'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
  userRole: 'HIGH' | 'LOW';
  onRoleChange: (role: 'HIGH' | 'LOW') => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
  onLogout?: () => void;
}

export default function LayoutWrapper({ 
  children, 
  userRole, 
  onRoleChange, 
  activeSection, 
  onSectionChange,
  userName,
  onLogout
}: LayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  console.log('LayoutWrapper props:', { userName, onLogout: typeof onLogout });
  
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    
    // Handle navigation based on section
    if (userRole === 'LOW') {
      switch (section) {
        case 'dashboard':
          router.push('/dashboard/low');
          break;
        case 'koperasi':
          router.push('/dashboard/low/koperasi/manage');
          break;
        case 'anggota-koperasi':
          router.push('/dashboard/low/members');
          break;
        case 'pengaturan':
          router.push('/dashboard/low/profile');
          break;
        // Add more navigation cases as needed
        default:
          break;
      }
    } else if (userRole === 'HIGH') {
      switch (section) {
        case 'dashboard':
          router.push('/dashboard/high');
          break;
        // Add more navigation cases as needed
        default:
          break;
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        userRole={userRole}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          userRole={userRole}
          onRoleChange={onRoleChange}
          userName={userName}
          onLogout={onLogout}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
