// src/pages/Dashboard.jsx (Styled)
import React from 'react';
import { Link } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

const Dashboard = () => {
  const { competitionData } = useCompetition();

  return (
    <div className="text-center pt-10">
      
      {/* Hero Section */}
      <h1 className="text-6xl font-extrabold text-white">
        Welcome to the <span className="text-indigo-400">Sem 7 Competition App</span>
      </h1>
      <p className="mt-4 text-xl text-gray-300">
        The simplest way to run engaging and competitive classroom games.
      </p>

      {/* Status Card (Conditional Display) */}
      {competitionData.isCompetitionActive && (
        <div className="bg-yellow-800 p-4 mt-8 rounded-lg shadow-2xl inline-block text-yellow-100">
          <p className="text-lg font-semibold">
            🔔 Active Competition: {competitionData.competition.name}
          </p>
          <Link to="/questions" className="text-sm underline hover:text-white transition">
            Continue Game Play
          </Link>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-12 flex justify-center space-x-6">
        
        {/* Card 1: Create Competition */}
        <Link 
          to="/create" 
          className="bg-indigo-700 p-8 rounded-xl shadow-2xl hover:bg-indigo-600 transition duration-300 w-80 block"
        >
          <span className="text-5xl mb-3 block">⚙️</span>
          <h3 className="text-2xl font-bold">Start New Competition</h3>
          <p className="mt-2 text-sm text-gray-300">
            Register teams and generate pairings.
          </p>
        </Link>

        {/* Card 2: Manage Questions */}
        <Link 
          to="/manage-questions" 
          className="bg-green-700 p-8 rounded-xl shadow-2xl hover:bg-green-600 transition duration-300 w-80 block"
        >
          <span className="text-5xl mb-3 block">📚</span>
          <h3 className="text-2xl font-bold">Manage Question Bank</h3>
          <p className="mt-2 text-sm text-gray-300">
            Add, edit, or delete questions for the next game.
          </p>
        </Link>
        
      </div>
      
      {/* Link to Leaderboard */}
      <div className="mt-10">
         <Link to="/leaderboard" className="text-indigo-300 hover:text-indigo-200 underline">
            View Past Competition Leaderboard
         </Link>
      </div>

    </div>
  );
};
export default Dashboard;