'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Settings, User, ChevronDown, Shield, Building2, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  userRole: 'HIGH' | 'LOW';
  onRoleChange: (role: 'HIGH' | 'LOW') => void;
  userName?: string;
  onLogout?: () => void | Promise<void>;
}

export default function Header({ userRole, onRoleChange, userName = 'Administrator', onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  console.log('Header component props:', { userName, onLogout: typeof onLogout });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Koperasi</h1>
            <p className="text-sm text-gray-500">Sistem Monitoring & Manajemen</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari koperasi, kegiatan, atau anggota..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={clsx(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                userRole === 'HIGH' 
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              )}
            >
              <Shield className="w-4 h-4" />
              <span>{userRole === 'HIGH' ? 'Pusat' : 'Koperasi'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    onRoleChange('HIGH');
                    setShowRoleMenu(false);
                  }}
                  className={clsx(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2",
                    userRole === 'HIGH' && "bg-red-50 text-red-800"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Pusat (HIGH)</div>
                    <div className="text-xs text-gray-500">Monitoring semua koperasi</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onRoleChange('LOW');
                    setShowRoleMenu(false);
                  }}
                  className={clsx(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2",
                    userRole === 'LOW' && "bg-blue-50 text-blue-800"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Koperasi (LOW)</div>
                    <div className="text-xs text-gray-500">Pendaftar koperasi</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{userName}</div>
                  <div className="text-xs text-gray-500">
                    {userRole === 'HIGH' ? 'Administrator Pusat' : 'Pengelola Koperasi'}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    if (userRole === 'LOW') {
                      router.push('/dashboard/low/profile');
                    } else {
                      router.push('/dashboard/high/profile');
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profil</span>
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    if (userRole === 'LOW') {
                      router.push('/dashboard/low/profile');
                    } else {
                      router.push('/dashboard/high/profile');
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => {
                    console.log('Logout button clicked');
                    setShowUserMenu(false);
                    if (onLogout) {
                      console.log('Calling onLogout function');
                      onLogout();
                    } else {
                      console.log('onLogout function not available');
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
