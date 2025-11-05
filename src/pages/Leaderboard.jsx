import React, { useState } from 'react';
import { useCompetition } from '../context/CompetitionContext';

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-5 rounded-xl shadow-2xl max-w-md w-full border border-red-700">
                <h3 className="text-2xl font-bold text-red-400 mb-3">{title}</h3>
                <p className="text-gray-300 mb-5 text-base leading-relaxed">{message}</p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="py-2 px-5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2 px-5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow-md transition"
                    >
                        Yes, Delete All
                    </button>
                </div>
            </div>
        </div>
    );
};

const Leaderboard = () => {
    const { leaderboard = [], removeLeaderboardData } = useCompetition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRemoveAllClick = () => setIsModalOpen(true);

    const handleConfirmDelete = () => {
        setIsModalOpen(false);
        setIsLoading(true);
        removeLeaderboardData();
        console.log("✅ Leaderboard data cleared.");

        setTimeout(() => setIsLoading(false), 500);
    };

    const shouldShowEmptyMessage = !Array.isArray(leaderboard) || leaderboard.length === 0;

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-white">
            <ConfirmationModal
                isOpen={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete ALL competition results? This cannot be undone."
            />

            <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">
                Historical Leaderboard
            </h2>

            <div className="flex justify-end max-w-4xl mx-auto mb-4">
                <button
                    onClick={handleRemoveAllClick}
                    disabled={shouldShowEmptyMessage || isLoading}
                    className={`py-2 px-5 text-sm font-semibold rounded-lg transition duration-200 ${
                        shouldShowEmptyMessage
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    {isLoading ? 'Deleting...' : '❌ Remove All Scores'}
                </button>
            </div>

            {shouldShowEmptyMessage ? (
                <div className="p-8 bg-gray-800 rounded-xl shadow-lg text-center max-w-4xl mx-auto">
                    <p className="text-gray-400 text-base">
                        No previous results found. Complete a competition to record results!
                    </p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto bg-gray-800 p-5 rounded-xl shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700 text-sm">
                            <thead className="bg-indigo-900 text-left text-white uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Competition</th>
                                    <th className="px-4 py-3">Winner</th>
                                    <th className="px-4 py-3">Final Scores</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {leaderboard.map((comp) => (
                                    <tr key={comp.id} className="hover:bg-gray-700">
                                        <td className="px-4 py-3 text-gray-400">{comp.date}</td>
                                        <td className="px-4 py-3 font-semibold text-white">{comp.name}</td>
                                        <td className="px-4 py-3 font-bold text-green-400">{comp.winner}</td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {Array.isArray(comp.finalScores) &&
                                                comp.finalScores.map((s, i) => (
                                                    <span
                                                        key={i}
                                                        className={`mr-3 ${i === 0 ? 'text-yellow-400 font-bold' : ''}`}
                                                    >
                                                        {s.name} ({s.score})
                                                    </span>
                                                ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
