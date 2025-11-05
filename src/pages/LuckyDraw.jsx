import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

// Helper function for shuffling the array (Random pairing logic)
const shuffleArray = (array) => {
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const LuckyDraw = () => {
    const { competitionData, setCompetitionData } = useCompetition(); 
    const navigate = useNavigate();

    const [pairingStatus, setPairingStatus] = useState('pending'); // pending, drawing, complete
    const [drawMessage, setDrawMessage] = useState('Teams loaded. Ready for the draw.');
    
    // Destructure data with defaults
    const { 
        teams = [],
        currentRound = 1, 
        currentMatch = 1, 
        currentPair = [], 
        matchWinners = [],
        competition = {},
        round1Matches: existingRound1Matches,
        byeTeam: existingByeTeam,
    } = competitionData || {};
    
    const round1Matches = existingRound1Matches || [];
    const byeTeam = existingByeTeam || null;
    
    const activeTeams = teams.filter(t => !t?.isEliminated && t?.status !== 'Final Waiting');
    const competitionName = competition?.name || 'Competition';
    
    const completedRound1Matches = matchWinners.filter(w => w?.round === 1).length;
    const maxMatchesRound1 = round1Matches.length; 
    const nextMatchIndex = completedRound1Matches;

    // --- FINAL ROUND SETUP ---
    const setupFinalMatch = useCallback(() => {
        setPairingStatus('drawing');

        const finalistTeams = teams.filter(t => !t?.isEliminated && t?.status !== 'Eliminated');
        
        if (finalistTeams.length !== 2) {
            setDrawMessage(`Final Match setup error: Expected 2 teams, found ${finalistTeams.length}.`);
            setPairingStatus('complete');
            return;
        }
        
        const finalPair = finalistTeams.map(t => t?.name || 'Unknown');

        setDrawMessage(`The two teams for the Grand Final are ${finalPair[0]} vs ${finalPair[1]}!`);

        setCompetitionData(prev => ({
            ...prev,
            currentRound: 3,
            currentMatch: 1,
            currentPair: finalPair,
            isRoundOver: false,
            currentTurnIndex: 0,
            answeredQuestionIds: []
        }));

        setTimeout(() => setPairingStatus('complete'), 2000);
    }, [teams, setCompetitionData]);

    // --- SEMIFINAL / ROUND 2 DRAW ---
    const runRound2Draw = useCallback(() => {
        setPairingStatus('drawing');
        
        const round1Winners = teams.filter(t => !t?.isEliminated && t?.status !== 'Final Waiting' && t?.status !== 'Eliminated');
        
        if (round1Winners.length !== 3) {
             setDrawMessage(`Error in Round 2 setup: Expected 3 winners, found ${round1Winners.length}.`);
             setPairingStatus('complete');
             return;
        }

        const shuffledWinners = shuffleArray(round1Winners);
        
        const finalWaitingTeam = shuffledWinners[0];
        const semiFinalist1 = shuffledWinners[1];
        const semiFinalist2 = shuffledWinners[2];
        
        const finalWaitingTeamName = finalWaitingTeam?.name || 'Unknown';
        const round2Teams = [semiFinalist1?.name || 'Team A', semiFinalist2?.name || 'Team B']; 

        setDrawMessage(`LUCKY DRAW WINNER: ${finalWaitingTeamName} goes directly to the Final!`);
        
        setCompetitionData(prev => ({
            ...prev,
            currentRound: 2,
            currentMatch: 1,
            currentPair: round2Teams,
            teams: prev.teams.map(t => 
                t.name === finalWaitingTeamName ? { ...t, status: 'Final Waiting' } : t
            ),
            isRoundOver: false,
            currentTurnIndex: 0,
            answeredQuestionIds: [],
        }));

        setTimeout(() => {
            setDrawMessage(`Round 2 Semifinal: ${round2Teams[0]} vs ${round2Teams[1]} — Ready to play!`);
            setPairingStatus('complete');
        }, 3000);
    }, [teams, setCompetitionData]);

    // --- ROUND 1 & 2 UPDATE ---
    const updateMatchForRound = useCallback(() => {
        if (currentRound === 1 && nextMatchIndex < maxMatchesRound1) {
            const nextPair = round1Matches[nextMatchIndex];
            const nextMatchNum = nextMatchIndex + 1;
            
            if (!nextPair || nextPair.length !== 2) {
                setDrawMessage("Error: Missing match pair data.");
                setPairingStatus('complete');
                return;
            }
            
            setCompetitionData(prev => ({
                ...prev,
                currentRound: 1,
                currentMatch: nextMatchNum,
                currentPair: nextPair,
                isRoundOver: false,
                currentTurnIndex: 0,
                answeredQuestionIds: [],
            }));
            
            setDrawMessage(`Ready for Round 1 Match ${nextMatchNum}: ${nextPair[0]} vs ${nextPair[1]}.`);
            setPairingStatus('complete');
        } 
        else if (currentRound === 2 && matchWinners.filter(w => w.round === 2).length === 0 && currentPair.length === 2) {
            setDrawMessage(`Resume Round 2 Semifinal: ${currentPair[0]} vs ${currentPair[1]}.`);
            setPairingStatus('complete');
        } 
        else if (currentRound === 3 && matchWinners.filter(w => w.round === 3).length === 0 && currentPair.length === 2) {
            setDrawMessage(`Resume Grand Final: ${currentPair[0]} vs ${currentPair[1]}.`);
            setPairingStatus('complete');
        }
    }, [currentRound, nextMatchIndex, maxMatchesRound1, round1Matches, setCompetitionData, currentPair, matchWinners]);

    // --- ROUND 1 INITIAL DRAW ---
    const runInitialRound1Draw = useCallback(() => {
        if (activeTeams.length < 2 || round1Matches.length > 0) return;
        
        setPairingStatus('drawing');
        setDrawMessage(`Shuffling ${activeTeams.length} teams for Round 1 pairings...`);

        const teamNames = activeTeams.map(t => t?.name || 'Unknown');
        let shuffledTeams = shuffleArray(teamNames);

        const allPairs = [];
        let newByeTeam = null; 

        if (shuffledTeams.length % 2 !== 0) {
             newByeTeam = shuffledTeams.pop(); 
             setCompetitionData(prev => ({
                 ...prev,
                 teams: prev.teams.map(t => 
                     t.name === newByeTeam ? { ...t, status: 'Bye', isEliminated: false } : t
                 ),
                 byeTeam: newByeTeam,
             }));
        }

        for (let i = 0; i < shuffledTeams.length; i += 2) {
             allPairs.push([shuffledTeams[i], shuffledTeams[i + 1]]);
        }
        
        const firstPair = allPairs[0];
        
        setTimeout(() => {
            setCompetitionData(prev => ({
                ...prev,
                currentRound: 1,
                currentMatch: 1,
                currentPair: firstPair || [],
                round1Matches: allPairs,
                isRoundOver: false,
                currentTurnIndex: 0,
                answeredQuestionIds: [],
            }));
            
            let message = `Round 1 pairings are ready!`;
            if (firstPair) message += ` Match 1: ${firstPair[0]} vs ${firstPair[1]}.`;
            if (newByeTeam) message += ` ${newByeTeam} gets a BYE and advances!`;

            setDrawMessage(message);
            setPairingStatus('complete');
        }, 1500);
    }, [activeTeams.length, round1Matches.length, setCompetitionData]);

    // --- MAIN FLOW ---
    useEffect(() => {
        if (teams.length < 2 || pairingStatus === 'drawing') return;
        
        const currentActiveTeams = teams.filter(t => !t?.isEliminated && t?.status !== 'Final Waiting');

        if (currentRound === 1 && round1Matches.length === 0) {
            runInitialRound1Draw();
            return;
        }

        if (currentRound === 1 && completedRound1Matches === maxMatchesRound1) {
            if (currentActiveTeams.length === 3) {
                 runRound2Draw();
                 return;
            } else {
                setDrawMessage(`Error after Round 1: Expected 3 teams, found ${currentActiveTeams.length}.`);
                setPairingStatus('complete');
                return;
            }
        }
        
        if (currentRound === 2 && matchWinners.filter(w => w.round === 2).length === 1) {
            if (currentActiveTeams.length === 1 && teams.filter(t => t?.status === 'Final Waiting').length === 1) {
                setupFinalMatch();
                return;
            } else {
                 setDrawMessage(`Error after Round 2: Team counts incorrect.`);
                 setPairingStatus('complete');
                 return;
            }
        }

        const currentMatchCompleted = matchWinners.some(w => w?.round === currentRound && w?.match === currentMatch);

        if (currentPair.length === 0 || currentMatchCompleted) {
             updateMatchForRound();
        }

    }, [teams.length, currentRound, round1Matches.length, currentPair.length, completedRound1Matches, nextMatchIndex, runInitialRound1Draw, updateMatchForRound, currentMatch, matchWinners, pairingStatus, runRound2Draw, setupFinalMatch, teams, maxMatchesRound1]);

    // --- BUTTON HANDLER ---
    const handleProceed = () => {
        if (pairingStatus === 'complete' && currentPair.length === 2) { 
            navigate('/questions');
        }
    };

    // --- SAFETY: NO TEAMS ---
    if (teams.length < 2) {
        return (
            <div className="p-8 text-center max-w-3xl mx-auto mt-10 bg-gray-900 min-h-screen text-white">
                <h2 className="text-4xl font-extrabold text-red-400 mb-4">ERROR: Teams Missing</h2>
                <p className="text-lg text-gray-300">Please go back and register at least 2 teams.</p>
                <button 
                    onClick={() => navigate('/create')} 
                    className="mt-6 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300"
                >
                    Go to Setup
                </button>
            </div>
        );
    }

    // --- TITLE INFO ---
    let pageTitle = '';
    let matchInfo = '';

    if (currentRound === 1) {
        pageTitle = 'ROUND 1 MATCH SETUP';
        matchInfo = `(Completed: ${completedRound1Matches} / ${maxMatchesRound1})`;
    } else if (currentRound === 2) {
        pageTitle = 'ROUND 2: SEMIFINAL DRAW';
        matchInfo = matchWinners.filter(w => w.round === 2).length === 1 ? '(Semifinal Complete)' : '(1 Match Remaining)';
    } else if (currentRound === 3) {
        pageTitle = 'GRAND FINAL MATCH SETUP';
        matchInfo = matchWinners.filter(w => w.round === 3).length === 1 ? '(Final Complete)' : '(1 Match Remaining)';
    }

    return (
        <div className="p-8 text-center max-w-3xl mx-auto mt-10 bg-gray-900 min-h-screen text-white">
            <h2 className="text-4xl font-extrabold text-pink-400 mb-2">{pageTitle}</h2>
            <p className="text-lg text-gray-300 mb-6 font-semibold">{competitionName} {matchInfo}</p>
            
            <div className={`p-4 mb-8 rounded-lg font-semibold ${pairingStatus === 'drawing' ? 'bg-yellow-800' : 'bg-blue-800'}`}>
                {drawMessage}
            </div>

            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl inline-block w-full">
                {pairingStatus === 'drawing' ? (
                    <div className="text-xl text-white py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400 mx-auto mb-4"></div>
                        Generating Match Pairings...
                    </div>
                ) : (
                    <div>
                        <p className="text-2xl font-bold mb-6 text-indigo-400">NEXT MATCH TO PLAY (Match {currentMatch})</p>
                        {currentPair.length === 2 && ( 
                            <div className="bg-purple-700 p-6 rounded-lg shadow-md flex justify-between items-center border-l-4 border-yellow-300">
                                <span className="text-3xl font-extrabold text-white mx-auto">
                                    {currentPair[0]} <span className="text-yellow-300 mx-5">VS</span> {currentPair[1]}
                                </span>
                            </div>
                        )}

                        {currentRound === 1 && round1Matches.length > 0 && (
                            <div className="mt-8">
                                <p className="text-xl font-semibold text-gray-400 mb-4">ALL ROUND 1 MATCHES:</p>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {round1Matches.map((pair, index) => {
                                         if (!pair || pair.length !== 2) return null;
                                         const isCompleted = matchWinners.some(w => w.round === 1 && w.match === index + 1);
                                         const isCurrent = index + 1 === currentMatch && currentPair.length > 0;
                                         return (
                                             <div 
                                                 key={index} 
                                                 className={`p-3 rounded-lg flex justify-between items-center text-sm font-medium ${
                                                     isCompleted ? 'bg-green-900 text-green-300 opacity-60' : 
                                                     isCurrent ? 'bg-purple-900 border border-yellow-300 text-white font-bold' : 
                                                     'bg-gray-700 text-gray-300'
                                                 }`}
                                             >
                                                 <span>Match {index + 1}:</span>
                                                 <span className="text-base">
                                                     {pair[0]} vs {pair[1]}
                                                 </span>
                                                 <span className={`text-xs ${isCompleted ? 'text-green-300' : isCurrent ? 'text-yellow-300' : 'text-gray-500'}`}>
                                                     {isCompleted ? 'COMPLETED' : isCurrent ? 'NEXT' : 'PENDING'}
                                                 </span>
                                             </div>
                                         );
                                     })}
                                </div>
                            </div>
                        )}
                        
                        {byeTeam && (
                             <div className="bg-green-800 mt-4 p-3 rounded-lg shadow-md font-extrabold text-white text-xl">
                                 ADVANCED (BYE): {byeTeam}
                             </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="mt-10">
                <button 
                    onClick={handleProceed}
                    disabled={pairingStatus !== 'complete' || currentPair.length !== 2}
                    className={`w-full py-4 text-xl font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01]
                        ${(pairingStatus === 'complete' && currentPair.length === 2) 
                            ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {pairingStatus === 'drawing' ? 'Drawing Matches...' : currentPair.length === 2 ? `Start Match ${currentMatch}` : 'Waiting...'}
                </button>
            </div>
        </div>
    );
};

export default LuckyDraw;
