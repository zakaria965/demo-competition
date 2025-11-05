import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

const CreateCompetition = () => {
    // 🔑 WAXAA LAGU DARAY questionBank CONTEXT-KA
    const { startCompetition, questionBank } = useCompetition(); 
    const navigate = useNavigate();

    const [competitionName, setCompetitionName] = useState('');
    const [round, setRound] = useState('');
    const [teamInputs, setTeamInputs] = useState([]);
    const [error, setError] = useState(null);

    // Helper function si loo helo xogta round-ka
    const getRoundDetails = (roundName) => {
        if (roundName === 'Round 1') return { maxTeams: 6, roundNum: 1 };
        if (roundName === 'Round 2') return { maxTeams: 3, roundNum: 2 };
        if (roundName === 'Final Round') return { maxTeams: 2, roundNum: 3 };
        return { maxTeams: 0, roundNum: 0 };
    };

    // Handle round selection
    const handleRoundSelect = (selectedRound) => {
        setRound(selectedRound);
        setError(null);

        const details = getRoundDetails(selectedRound);
        setTeamInputs(Array(details.maxTeams).fill(''));
    };

    // Handle typing in team names
    const handleTeamNameChange = (index, value) => {
        const updated = [...teamInputs];
        updated[index] = value;
        setTeamInputs(updated);
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // --- HUBINADA XOGTA ---
        if (competitionName.trim() === '') {
            setError('⚠️ Please enter a competition name.');
            return;
        }
        if (round === '') {
            setError('⚠️ Please select a round.');
            return;
        }
        
        // Filter and map valid team names
        const teamsArray = teamInputs
            .map((name) => name.trim())
            .filter((name) => name !== '');
            
        const expectedCount = getRoundDetails(round).maxTeams;

        if (teamsArray.length !== expectedCount) {
             setError(`⚠️ You must enter exactly ${expectedCount} team names for ${round}.`);
             return;
        }

        // Hubi in su'aalo ay jiraan
        if (questionBank.length === 0) {
             setError('🛑 The Question Bank is empty! Please load questions before starting a competition.');
             return;
        }
        
        // Prepare teams data as Array of Objects
        const teamsData = teamsArray.map((name, index) => ({ 
            id: index + 1, 
            name: name
        }));

        // 🔑 SAXITAAN MUHIIM AH: Gudbi su'aalaha (questionBank) sida parameter-ka afaraad
        startCompetition(
            competitionName, 
            teamsData,
            { rounds: getRoundDetails(round).roundNum, maxTeams: expectedCount },
            questionBank // ⬅️ WAXAAN KU DARNay TAN
        );
        
        // Move to Lucky Draw page
        navigate('/lucky-draw');
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-900 rounded-xl shadow-2xl text-white mt-10">
            <h2 className="text-3xl font-extrabold text-pink-400 mb-6 text-center uppercase">
                Create New Competition
            </h2>

            <form onSubmit={handleSubmit}>
                {/* Competition Name */}
                {/* ... (ma jiro isbeddel halkan) ... */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                        Competition Name
                    </label>
                    <input
                        type="text"
                        value={competitionName}
                        onChange={(e) => setCompetitionName(e.target.value)}
                        placeholder="e.g., The Class Night Quiz"
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Round Selection */}
                {/* ... (ma jiro isbeddel halkan) ... */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                        Select Round
                    </label>
                    <select
                        value={round}
                        onChange={(e) => handleRoundSelect(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-pink-500 appearance-none"
                    >
                        <option value="">-- Choose Round --</option>
                        <option value="Round 1">Round 1 (6 Teams)</option>
                        <option value="Round 2">Round 2 (3 Teams)</option>
                        <option value="Final Round">Final Round (2 Teams)</option>
                    </select>
                </div>

                {/* Team Inputs */}
                {teamInputs.length > 0 && (
                    <div className="mb-6 border border-gray-700 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-indigo-400 mb-3 text-center">
                            Enter {teamInputs.length} Teams for {round}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {teamInputs.map((name, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    placeholder={`Team ${i + 1}`}
                                    value={name}
                                    onChange={(e) => handleTeamNameChange(i, e.target.value)}
                                    className="p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500"
                                    required
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Error Display */}
                {error && (
                    <div className="bg-red-800 border border-red-700 text-white p-3 rounded-lg text-center font-medium mb-6">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01]"
                >
                    Proceed to Lucky Draw
                </button>
            </form>
        </div>
    );
};

export default CreateCompetition;