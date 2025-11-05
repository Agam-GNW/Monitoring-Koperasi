'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus,
  ChevronRight,
  Home,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  userRole: 'HIGH' | 'LOW';
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ userRole, activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const highRoleMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'koperasi', label: 'Data Koperasi', icon: Building2 },
    { id: 'anggota', label: 'Total Anggota', icon: Users },
    { id: 'kegiatan', label: 'Jadwal Kegiatan', icon: Calendar },
    { id: 'dokumen', label: 'Dokumen RAT', icon: FileText },
    { id: 'laporan', label: 'Laporan & Analitik', icon: BarChart3 },
    { id: 'pengaturan', label: 'Profile', icon: User },
  ];

  const lowRoleMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'koperasi', label: 'Kelola Koperasi', icon: Building2 },
    { id: 'anggota-koperasi', label: 'Anggota Koperasi', icon: Users },
    { id: 'upload-rat', label: 'Upload RAT', icon: FileText },
    { id: 'pengaturan', label: 'Profile', icon: User },
  ];

  const menuItems = userRole === 'HIGH' ? highRoleMenuItems : lowRoleMenuItems;

  return (
    <aside className={clsx(
      "bg-white border-r border-gray-200 transition-all duration-300 h-screen flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between text-gray-600 hover:text-gray-900"
        >
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {userRole === 'HIGH' ? 'Menu Pusat' : 'Menu Koperasi'}
            </span>
          )}
          <ChevronRight className={clsx(
            "w-4 h-4 transition-transform",
            isCollapsed ? "rotate-0" : "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={clsx(
                    "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={clsx(
                    "w-5 h-5",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className={clsx(
            "px-3 py-2 rounded-lg text-xs font-medium",
            userRole === 'HIGH' 
              ? "bg-red-100 text-red-800" 
              : "bg-blue-100 text-blue-800"
          )}>
            <div className="flex items-center">
              {userRole === 'HIGH' ? (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Administrator Pusat
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Pengelola Koperasi
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
