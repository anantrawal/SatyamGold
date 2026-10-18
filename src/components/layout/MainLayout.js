import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Building2, LayoutDashboard, Map, BarChart3,
  Users, Image, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
       ${isActive
         ? 'bg-primary-500 text-white shadow-md'
         : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`
    }>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
  </NavLink>
);

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
          <Building2 size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">SatyamGold</h1>
          <p className="text-xs text-gray-400">Housing Management</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
          <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userProfile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{userProfile?.name || 'User'}</p>
            <p className="text-xs text-primary-600 capitalize">{userProfile?.role || 'Staff'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Main</p>
        <NavItem to="/"         icon={LayoutDashboard} label="Dashboard"  onClick={closeSidebar} />
        <NavItem to="/plots"    icon={Map}             label="Plot Map"   onClick={closeSidebar} />

        {isOwner && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mt-4 mb-2">Owner</p>
            <NavItem to="/reports"    icon={BarChart3} label="Reports"    onClick={closeSidebar} />
            <NavItem to="/elevations" icon={Image}     label="Elevations" onClick={closeSidebar} />
            <NavItem to="/users"      icon={Users}     label="Staff"      onClick={closeSidebar} />
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={closeSidebar} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl slide-in">
            <button onClick={closeSidebar} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X size={22} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg">SatyamGold</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
