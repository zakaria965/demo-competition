import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

const Home = () => {
    const { competitionData, resetGame } = useCompetition();
    const navigate = useNavigate();

    const { isCompetitionActive, winner, currentRound, teams } = competitionData;

    const handleContinue = () => {
        if (isCompetitionActive) {
            navigate('/questions');
        } else if (winner) {
            navigate('/results');
        } else {
            navigate('/create-competition');
        }
    };
    
    let title = "Nidaamka Maareynta Ciyaarta";
    let message = "Diyaar u ah in la bilaabo tartan cusub oo isku-dhafan. ";
    let buttonText = "Bilow Ciyaar Cusub";
    let buttonColor = "bg-green-600 hover:bg-green-700";

    if (isCompetitionActive) {
        title = `Tartan Socda: Wareegga ${currentRound}`;
        message = `Ciyaartu way socotaa. ${teams.length} kooxood ayaa ka qeyb galaya.`;
        buttonText = "Ku Laabo Ciyaarta";
        buttonColor = "bg-pink-600 hover:bg-pink-700";
    } else if (winner) {
        title = `Tartan Dhammaaday! Guuleyste: ${winner}`;
        message = "Eeg natiijooyinka ugu dambeeyay ama dib u bilow ciyaarta.";
        buttonText = "Eeg Natiijada";
        buttonColor = "bg-indigo-600 hover:bg-indigo-700";
    }

    return (
        <div className="p-8 max-w-xl mx-auto mt-20 bg-gray-800 rounded-xl shadow-2xl text-white text-center">
            <h1 className="text-5xl font-extrabold text-indigo-400 mb-4">{title}</h1>
            <p className="text-xl text-gray-300 mb-8">{message}</p>

            <button
                onClick={handleContinue}
                className={`w-full py-4 ${buttonColor} text-white text-xl font-bold rounded-xl transition transform hover:scale-[1.01] shadow-lg`}
            >
                {buttonText}
            </button>
            
            {winner && (
                <button
                    onClick={resetGame}
                    className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                >
                    Nadiifi Ciyaarta (Reset)
                </button>
            )}
        </div>
    );
};

export default Home;