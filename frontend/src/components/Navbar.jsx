import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">ELIMUCORE</h1>
          <span className="text-sm text-blue-100">School Management System</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={onLogout}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
