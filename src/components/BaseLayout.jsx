// src/components/BaseLayout.jsx (Styled)
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const BaseLayout = () => {
  return (
    // Main container: Dark background, minimum full screen height, white text
    <div className="min-h-screen bg-gray-900 text-gray-100"> 

      {/* 1. Navbar (Sticky Header) */}
      <header className="bg-indigo-900 shadow-xl sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-wider hover:text-pink-300 transition duration-300">
            🥇 Class Comp System
          </Link>
          <div className="space-x-4 flex items-center">
            {/* Navigation Links */}
            <Link to="/" className="text-sm font-medium hover:text-pink-400 transition duration-200">
              Dashboard
            </Link>
            <Link to="/leaderboard" className="text-sm font-medium hover:text-pink-400 transition duration-200">
              Leaderboard
            </Link>
            <Link to="/manage-questions" className="text-sm font-medium hover:text-pink-400 transition duration-200">
              Manage Questions
            </Link>
            
            {/* CTA Button */}
            <Link to="/create">
                <button className="bg-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-pink-700 transition duration-300">
                    Create New Comp
                </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 min-h-[calc(100vh-140px)]">
        {/* The Outlet shows the content of the matched route (Dashboard, Create, etc.) */}
        <Outlet /> 
      </main>
      
      {/* 3. Footer */}
      <footer className="w-full py-4 border-t border-gray-700 text-center text-xs text-gray-400 bg-gray-800">
        <p>
          © 2025 Class Competition System | Built with React & Tailwind CDN
        </p>
      </footer>
    </div>
  );
};

export default BaseLayout;