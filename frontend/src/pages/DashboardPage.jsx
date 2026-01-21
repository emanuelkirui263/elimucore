import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { FaBook, FaUsers, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const modules = [
    {
      title: 'Academic Module',
      description: 'Manage exams, marks, and student results',
      icon: FaBook,
      color: 'bg-blue-100 text-blue-600',
      link: '/academics',
    },
    {
      title: 'Student Management',
      description: 'Register and manage students',
      icon: FaUsers,
      color: 'bg-green-100 text-green-600',
      link: '/students',
    },
    {
      title: 'Finance Module',
      description: 'Track fees and payments',
      icon: FaMoneyBillWave,
      color: 'bg-purple-100 text-purple-600',
      link: '/finance',
    },
    {
      title: 'Attendance',
      description: 'Record student attendance',
      icon: FaClipboardList,
      color: 'bg-orange-100 text-orange-600',
      link: '/attendance',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold">{user?.role.replace(/_/g, ' ').toUpperCase()}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">--</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Active Exams</p>
            <p className="text-3xl font-bold text-green-600">--</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Outstanding Fees</p>
            <p className="text-3xl font-bold text-red-600">--</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Attendance Rate</p>
            <p className="text-3xl font-bold text-orange-600">--</p>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="card hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(module.link)}
                >
                  <div className={`inline-block p-4 rounded-lg ${module.color} mb-4`}>
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 Coming Soon</h3>
          <p className="text-blue-800">
            Phase 2 & 3 features: Payroll Management, Communication System, Advanced Analytics, Mobile App, and National Integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
