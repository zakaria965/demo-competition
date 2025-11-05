// ✅ src/App.js (Final Optimized Version)
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import { CompetitionProvider } from './context/CompetitionContext.jsx';

// 🧩 Import All Pages
import Dashboard from './pages/Dashboard.jsx';
import CreateCompetition from './pages/CreateCompetition.jsx';
import LuckyDraw from './pages/LuckyDraw.jsx';
import Questions from './pages/Questions.jsx';
import Results from './pages/Results.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import ManageQuestions from './pages/ManageQuestions.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    // 🏆 Wrap entire app with CompetitionProvider so context works globally
    <CompetitionProvider>
      <BrowserRouter>
        <Routes>
          {/* ✅ Base layout that wraps all pages */}
          <Route path="/" element={<BaseLayout />}>
            {/* Default page */}
            <Route index element={<Dashboard />} />

            {/* Main competition flow */}
            <Route path="create" element={<CreateCompetition />} />
            <Route path="lucky-draw" element={<LuckyDraw />} />
            <Route path="questions" element={<Questions />} />
            <Route path="results" element={<Results />} />

            {/* Extra features */}
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="manage-questions" element={<ManageQuestions />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompetitionProvider>
  );
}

export default App;
