import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompetition } from "../context/CompetitionContext";

// 🎉 Fireworks Component (extra glow & fast)
const Fireworks = () => (
  <div className="fireworks-container">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="firework"
        style={{
          left: `${Math.random() * 100}vw`,
          top: `${Math.random() * 80}vh`,
          animationDelay: `${Math.random() * 0.8}s`,
        }}
      >
        <div className="cracker"></div>
        {[...Array(6)].map((_, j) => (
          <div key={j} className="spark"></div>
        ))}
      </div>
    ))}
  </div>
);

// 🎈 Balloons Component (faster floating + colorful)
const Balloons = () => (
  <div className="balloons-container">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="balloon"
        style={{
          left: `${Math.random() * 100}vw`,
          animationDelay: `${Math.random() * 2}s`,
          backgroundColor: `hsl(${Math.random() * 360}, 80%, 65%)`,
        }}
      />
    ))}
  </div>
);

// 🎊 Confetti Component (new effect)
const Confetti = () => (
  <div className="confetti-container">
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}vw`,
          backgroundColor: `hsl(${Math.random() * 360}, 100%, 60%)`,
          animationDelay: `${Math.random() * 1}s`,
        }}
      />
    ))}
  </div>
);

const Results = () => {
  const { competitionData, finalizeCompetition, resetCompetition } = useCompetition();
  const navigate = useNavigate();

  const { teams, winner, competition, isCompetitionActive } = competitionData;
  const finalWinnerName = winner || [...teams].sort((a, b) => b.score - a.score)[0]?.name;
  const competitionName = competition?.name || "Competition";

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (finalWinnerName && isCompetitionActive) {
      finalizeCompetition(finalWinnerName);
      setShowCelebration(true);
    }

    if (teams.length === 0 && !finalWinnerName) navigate("/");
  }, [finalWinnerName, teams.length, isCompetitionActive, finalizeCompetition, navigate]);

  const handleReset = () => {
    resetCompetition();
    navigate("/create");
  };

  const finalLeaderboard = [...teams].sort((a, b) => b.score - a.score);

  const motivationalMessages = [
    "Guulaystaha dhabta ah waa qofka isku dayay! 🏅 🚀",
    ,
  ];
  const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  if (!finalWinnerName && teams.length === 0) {
    return (
      <div className="text-center mt-20 text-base text-gray-400">
        Loading results or competition not complete...
        <div className="mt-6">
          <button
            onClick={() => navigate("/create")}
            className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-base shadow-md transition"
          >
            Go To Create Competition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-gray-900 rounded-lg shadow-2xl text-white mt-10 min-h-[80vh] overflow-hidden">
      {showCelebration && (
        <>
          <Fireworks />
          <Balloons />
          <Confetti />
        </>
      )}

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-4xl font-extrabold text-pink-400 mb-4 uppercase tracking-wider animate-pulse-fast glow-text">
          🎉 Competition Complete!
        </h1>
        <p className="text-lg text-gray-300">
          Natiijooyinka kama dambeysta ah ee{" "}
          <span className="font-semibold text-white">{competitionName}</span>
        </p>
      </div>

      <div className="text-center mb-10 p-8 rounded-xl bg-yellow-500 shadow-2xl relative z-10 animate-bounce-in border-4 border-white transform rotate-2 scale-105 glow-card">
        <p className="text-xl font-extrabold text-gray-900 mb-2">🏆 Guuleystaha Waa...</p>
        <h2 className="text-6xl font-black text-white uppercase animate-winner-pop-fast drop-shadow-lg glow-text">
          {finalWinnerName}
        </h2>
        <p className="text-lg text-gray-900 mt-2 font-bold">Hambalyo!</p>
      </div>

      <p className="text-center text-xl text-indigo-300 font-medium mb-8 relative z-10 animate-fade-in italic">
        "{randomMotivation}"
      </p>

      <h3 className="text-2xl font-bold text-gray-200 mb-4 border-b pb-2 border-gray-700 text-center relative z-10">
        Final Scoreboard
      </h3>

      <div className="shadow-lg rounded-lg overflow-hidden text-sm relative z-10">
        <div className="flex bg-indigo-700 font-bold text-white">
          <span className="w-1/6 p-3 text-center">Darajo</span>
          <span className="w-4/6 p-3">Magaca Kooxda</span>
          <span className="w-1/6 p-3 text-center">Dhibco</span>
        </div>

        {finalLeaderboard.map((team, index) => (
          <div
            key={team.name}
            className={`flex items-center transition border-b border-gray-700 ${
              index === 0
                ? "bg-yellow-500 text-gray-900 font-extrabold animate-pulse-winner-fast"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            <span className="w-1/6 p-3 text-center text-lg">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
            </span>
            <span className="w-4/6 p-3 uppercase font-semibold">{team.name}</span>
            <span
              className={`w-1/6 p-3 text-center font-bold text-lg ${
                index === 0 ? "text-gray-900" : "text-green-400"
              }`}
            >
              {team.score}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center relative z-10">
        <button
          onClick={handleReset}
          className="py-3 px-8 bg-pink-600 hover:bg-pink-700 text-white font-black text-xl rounded-full shadow-2xl transition duration-300 transform hover:scale-110 border-2 border-pink-300"
        >
          Create a new competition 
        </button>
      </div>
    </div>
  );
};

export default Results;
