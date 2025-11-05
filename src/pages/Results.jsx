import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

const Results = () => {
    const { competitionData, finalizeCompetition, resetCompetition } = useCompetition(); 
    const navigate = useNavigate();

    const { teams, winner, competition, isCompetitionActive } = competitionData;
    const finalWinnerName = winner || [...teams].sort((a, b) => b.score - a.score)[0]?.name;
    const competitionName = competition?.name || 'Competition';

    useEffect(() => {
        if (finalWinnerName && isCompetitionActive) {
            console.log(`Saving winner: ${finalWinnerName}`);
            finalizeCompetition(finalWinnerName);
        }

        if (teams.length === 0 && !finalWinnerName) navigate('/');
    }, [finalWinnerName, teams.length, isCompetitionActive, finalizeCompetition, navigate]);

    const handleReset = () => {
        resetCompetition();
        navigate('/create');
    };

    const finalLeaderboard = [...teams].sort((a, b) => b.score - a.score);

    if (!finalWinnerName && teams.length === 0) {
        return (
            <div className="text-center mt-20 text-base text-gray-400">
                Loading results or competition not complete...
                <div className="mt-6">
                    <button
                        onClick={() => navigate('/create')}
                        className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-base shadow-md transition"
                    >
                        Go To Create Competition
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-lg shadow-2xl text-white mt-10 min-h-[80vh]">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-pink-400 mb-4 uppercase tracking-wide">
                    Competition Complete!
                </h1>
                <p className="text-lg text-gray-400">
                    Final results for <span className="font-semibold text-white">{competitionName}</span>
                </p>
            </div>

            <div className="text-center mb-10 p-8 rounded-xl bg-yellow-500 shadow-2xl">
                <p className="text-xl font-bold text-gray-900 mb-2">The Winner Is...</p>
                <h2 className="text-5xl font-black text-white uppercase">{finalWinnerName}</h2>
                <p className="text-sm text-gray-900 mt-2 font-medium">Congratulations!</p>
            </div>

            <h3 className="text-2xl font-bold text-gray-200 mb-4 border-b pb-2 border-gray-700 text-center">
                Final Scoreboard
            </h3>

            <div className="shadow-lg rounded-lg overflow-hidden text-sm">
                <div className="flex bg-indigo-700 font-bold text-white">
                    <span className="w-1/6 p-3 text-center">Rank</span>
                    <span className="w-4/6 p-3">Team Name</span>
                    <span className="w-1/6 p-3 text-center">Score</span>
                </div>

                {finalLeaderboard.map((team, index) => (
                    <div
                        key={team.name}
                        className={`flex items-center transition border-b border-gray-700 ${
                            index === 0
                                ? 'bg-yellow-500 text-gray-900 font-extrabold'
                                : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                        }`}
                    >
                        <span className="w-1/6 p-3 text-center">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </span>
                        <span className="w-4/6 p-3 uppercase">{team.name}</span>
                        <span className={`w-1/6 p-3 text-center font-bold ${index === 0 ? 'text-gray-900' : 'text-green-400'}`}>
                            {team.score}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={handleReset}
                    className="py-2 px-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg text-base shadow-md transition"
                >
                    Create New Competition
                </button>
            </div>
        </div>
    );
};

export default Results;
