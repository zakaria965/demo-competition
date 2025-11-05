// Waa Create.jsx oo magaca loo beddelay CreateCompetition.jsx (sida aad rabto)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

const CreateCompetition = () => {
    const { createCompetition, competitionData } = useCompetition();
    const navigate = useNavigate();

    const [teamInput, setTeamInput] = useState('');
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState(null);
    
    // Auto-navigate if active competition is detected
    useEffect(() => {
        if (competitionData.isCompetitionActive) {
            navigate('/lucky-draw'); // Hadda ku xidh LuckyDraw si loo dejiyo wareegga
        }
    }, [competitionData.isCompetitionActive, navigate]);

    const handleAddTeam = () => {
        const name = teamInput.trim();
        if (!name) return;
        
        if (teams.length >= 16) {
          setError('Inta kooxood ee ugu badan (16) ayaa la gaaray.');
          return;
        }
        if (teams.includes(name)) {
          setError('Magaca kooxda ayaa horay u jiray.');
          return;
        }
        
        setTeams([...teams, name]);
        setTeamInput('');
        setError(null);
    };

    const handleRemoveTeam = (nameToRemove) => {
        setTeams(teams.filter(name => name !== nameToRemove));
    };

    const handleStartCompetition = () => {
        if (teams.length < 2) {
          setError('Waa in aad haysataa ugu yaraan 2 kooxood si aad u bilowdo ciyaarta.');
          return;
        }
        
        createCompetition(teams);
        navigate('/lucky-draw'); // Bilow isku-darka wareegga 1
    };

    if (competitionData.isCompetitionActive) return null;

    return (
        <div className="p-8 max-w-2xl mx-auto mt-10 bg-gray-800 rounded-xl shadow-2xl text-white">
          <h2 className="text-4xl font-extrabold text-indigo-400 mb-8 text-center">
            Dejinta Tartanka 📝
          </h2>
    
          {/* Team Input Section */}
          <div className="mb-8 p-6 border border-gray-700 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3 text-pink-400">
              Ku Dar Kooxaha ({teams.length} / 16)
            </h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={teamInput}
                onChange={(e) => {
                    setTeamInput(e.target.value);
                    setError(null);
                }}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddTeam();
                }}
                placeholder="Gali magaca kooxda..."
                className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                maxLength={25}
                disabled={teams.length >= 16}
              />
              <button
                onClick={handleAddTeam}
                disabled={!teamInput.trim() || teams.length >= 16}
                className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition"
              >
                Ku Dar Koox
              </button>
            </div>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
    
          {/* Team List Section */}
          <h3 className="text-2xl font-semibold mb-4 text-yellow-400">
            Kooxaha Ka Qaybgalaya
          </h3>
          {teams.length === 0 ? (
            <p className="text-gray-400 italic mb-6">Wali lama darin wax koox ah.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 mb-8">
              {teams.map((name, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <span className="font-medium text-lg">{name}</span>
                  <button
                    onClick={() => handleRemoveTeam(name)}
                    className="text-red-400 hover:text-red-500 font-bold text-sm ml-4"
                  >
                    (X)
                  </button>
                </li>
              ))}
            </ul>
          )}
    
          {/* Start Button */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleStartCompetition}
              disabled={teams.length < 2}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white text-xl font-bold rounded-xl transition transform hover:scale-[1.01] shadow-lg"
            >
              Bilow Isku-Darka Wareegga 1
            </button>
            {teams.length < 2 && (
              <p className="text-red-400 mt-3 text-center">
                Waxaad u baahan tahay ugu yaraan 2 kooxood si aad u bilowdo ciyaarta.
              </p>
            )}
          </div>
        </div>
      );
};

export default CreateCompetition;