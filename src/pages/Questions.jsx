import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../context/CompetitionContext';

// ⏳ Timer Component (Halkan waxba kama beddelayo)
const Timer = ({ onTimerEnd, isPaused, currentQuestionId }) => {
    const defaultTime = 60;
    const [timeLeft, setTimeLeft] = useState(defaultTime);
    const [timerActive, setTimerActive] = useState(true);

    useEffect(() => {
        if (currentQuestionId) {
            setTimeLeft(defaultTime);
            setTimerActive(true);
        } else {
            setTimeLeft(defaultTime);
            setTimerActive(false);
        }
    }, [currentQuestionId]);

    useEffect(() => {
        if (!timerActive || isPaused || timeLeft <= 0) {
            if (timeLeft === 0 && timerActive) {
                onTimerEnd(true);
                setTimerActive(false);
            }
            return;
        }
        const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimerEnd, timerActive, isPaused]);

    useEffect(() => {
        if (isPaused) setTimerActive(false);
        else if (currentQuestionId && timeLeft > 0) setTimerActive(true);
    }, [isPaused, currentQuestionId, timeLeft]);

    const timeColor = timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400';
    return (
        <div className="flex justify-center items-center my-4">
            <div className={`text-4xl font-extrabold ${timeColor} bg-gray-900 p-4 rounded-full shadow-lg border-4 border-yellow-500`}>
                {timeLeft}s
            </div>
        </div>
    );
};

// 🧹 Clean up question text (Halkan waxba kama beddelayo)
const cleanQuestionText = (text) => {
    if (!text) return '';
    const regex = /^(?:question\s*\d+\s*:|q\s*\d+\s*:|\d+\.|\d+\))\s*/i;
    let cleanedText = text.replace(regex, '').trim();
    cleanedText = cleanedText.replace(/[\?]+$/, '?');
    return cleanedText;
};

const Questions = () => {
    const {
        competitionData,
        questionBank, 
        startQuestion,
        submitAnswer,
        recordMatchWinner,
        finalizeCompetition,
    } = useCompetition();

    const navigate = useNavigate();

    const {
        teams,
        currentTurnIndex,
        currentQuestionId,
        isRoundOver,
        currentRound,
        currentMatch,
        currentPair,
    } = competitionData;

    const [feedback, setFeedback] = useState(null);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [winnerMessage, setWinnerMessage] = useState('');
    const availableQuestions = questionBank; 


    const playingTeams = teams.filter(t => currentPair.includes(t.name));
    const currentTeam = playingTeams[currentTurnIndex];

    const currentQuestion = questionBank.find(q => q.id === currentQuestionId);

    // ✅ Handle choosing a question 
    const handleQuestionSelection = (questionId) => {
        if (currentQuestionId !== null) {
            alert('A question is already active. Finish scoring first.');
            return;
        }

        startQuestion(questionId);
        setFeedback(null);
        setRevealAnswer(false);
        setIsTimerPaused(false);
    };

    const handleScoring = (isCorrect) => {
        if (!currentQuestion) return;
        setIsTimerPaused(true);
        const scorePoints = isCorrect ? 10 : 0;
        const message = isCorrect
            ? `✅ ${currentTeam.name} scored +${scorePoints} points!`
            : `❌ ${currentTeam.name} missed the question.`;
        setFeedback({
            message,
            isCorrect,
            style: isCorrect ? 'bg-green-600' : 'bg-red-600',
        });

        // Submit answer wuxuu sameeyaa: 1) Score, 2) U gudbi turn-ka, 3) Xidh currentQuestionId, 4) Tirtir su'aasha.
        submitAnswer(currentTeam.name, currentQuestionId, isCorrect);

        setTimeout(() => setFeedback(null), 3000);
    };

    const handleTimerEnd = (isTimedOut) => {
        if (isTimedOut && currentQuestionId) {
            alert(`⏰ Time's up for ${currentTeam.name}!`);
            handleScoring(false);
        }
    };

    // 🏆 Manual match winner selection (Halkan ayaan ka saaray alert-kii si loogu isticmaalo winnerMessage)
    const handleWhoWinsMatch = () => {
        if (currentPair.length < 2) {
            alert('Match not ready yet!');
            return;
        }
        const team1 = teams.find(t => t.name === currentPair[0]);
        const team2 = teams.find(t => t.name === currentPair[1]);
        if (!team1 || !team2) {
            alert('Teams not found for this match.');
            return;
        }

        let winnerName;
        if (team1.score > team2.score) {
            winnerName = team1.name;
        } else if (team2.score > team1.score) {
            winnerName = team2.name;
        } else {
            winnerName = team1.name;
            // Waa inaad u sheegtaa dadka in tie-ka uu jiro, laakiin ha isticmaalin alert()
            // Waxaan u isticmaalayaa winnerMessage si aan u muujiyo
            setWinnerMessage(`⚠️ Scores are tied! Defaulting to "${team1.name}" winning.`); 
        }

        const loserName = winnerName === team1.name ? team2.name : team1.name;

        // Haddii uu yahay Final Round: Isticmaal Finalize Competition
        const remainingTeams = teams.filter(t => !t.isEliminated).length;
        if (remainingTeams <= 2 && currentRound > 1) { 
             finalizeCompetition(winnerName);
             setWinnerMessage(`🎊 FINAL CHAMPION: ${winnerName}! Competition is over.`);
        } else {
             recordMatchWinner(winnerName, loserName, currentRound, currentMatch);
             const message = `🏆 Match ${currentMatch} won by "${winnerName}" between ${team1.name} and ${team2.name}`;
             setWinnerMessage(message); // Muuji fariinta guusha.
        }
    };

    const handleNextMatch = () => {
        navigate('/lucky-draw');
    };

    const handleShowResults = () => {
        navigate('/results');
    };

    if (teams.length === 0 || questionBank.length === 0) {
        return (
            <div className="p-8 max-w-xl mx-auto mt-10 bg-red-800 rounded-lg shadow-xl text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Game Setup Error or Questions Finished</h2>
                <p className="mb-6">Please set up the competition again.</p>
                <button
                    onClick={() => navigate('/create')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
                >
                    Set Up Competition
                </button>
            </div>
        );
    }

    if (currentPair.length === 0 && !isRoundOver) {
        return (
            <div className="p-8 max-w-xl mx-auto mt-10 bg-indigo-800 rounded-lg shadow-xl text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Match Not Ready</h2>
                <p className="mb-6">Please return to Lucky Draw page.</p>
                <button
                    onClick={() => navigate('/lucky-draw')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
                >
                    Go to Lucky Draw
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-900 min-h-screen text-white">
            <h2 className="text-4xl font-extrabold text-indigo-400 mb-6 text-center">
                ROUND {currentRound} - MATCH {currentMatch}
                <span className="text-xl block text-pink-400 mt-1">
                    Playing: {currentPair.join(' VS ')}
                </span>
            </h2>

            {/* Scoreboard */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg shadow-xl max-w-7xl mx-auto">
                <div className="text-2xl font-semibold text-gray-300">
                    CURRENT TURN:
                    <span className="ml-2 font-extrabold text-pink-400">
                        {currentTeam ? currentTeam.name : 'Waiting...'}
                    </span>
                </div>

                <div className="flex flex-wrap justify-center space-x-2 md:space-x-4 mt-4 md:mt-0">
                    {playingTeams.map(team => (
                        <div
                            key={team.name}
                            className={`px-4 py-2 rounded-full text-lg font-bold shadow-lg ${
                                team.name === currentTeam?.name
                                    ? 'bg-pink-600 text-white border-2 border-white'
                                    : 'bg-gray-600 text-gray-100'
                            }`}
                        >
                            {team.name}: {team.score} Points
                        </div>
                    ))}
                </div>
            </div>

            {feedback && (
                <div
                    className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-xl shadow-2xl text-white text-center animate-pulse ${feedback.style}`}
                >
                    <p className="text-4xl font-black">{feedback.message}</p>
                </div>
            )}

            {!currentQuestion ? (
                <>
                    {/* 🔔 Message-ka Guusha waxaan ku arkaynaa halkan */}
                    {winnerMessage && (
                        <div className="text-center text-xl font-bold mb-4 p-3 bg-green-900 border border-green-400 text-green-400 rounded-lg max-w-lg mx-auto animate-fadeIn">
                            {winnerMessage}
                            {/* Haddii ay dhamaatay ciyaartu oo Final Champion la hayo, navigate */}
                            {winnerMessage.includes("FINAL CHAMPION") && (
                                <button
                                    onClick={handleShowResults}
                                    className="block w-full py-2 mt-3 bg-green-700 hover:bg-green-800 text-white rounded transition"
                                >
                                    View Final Results
                                </button>
                            )}
                        </div>
                    )}
                    {/* Dhammaadka Message-ka Guusha */}

                    <div className="max-w-4xl mx-auto p-4">
                        <h3 className="text-2xl font-bold text-gray-300 mb-4 text-center">
                            Select Next Question for {currentTeam ? currentTeam.name : 'Next Team'}:
                        </h3>

                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {availableQuestions.map((q, index) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleQuestionSelection(q.id)}
                                    className="py-4 px-2 text-lg font-bold rounded-lg shadow-lg transition duration-300 transform bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                                >
                                    {`Q ${index + 1}`} 
                                </button>
                            ))}
                        </div>

                        {availableQuestions.length === 0 && (
                            <p className="text-center text-red-400 text-lg p-4 bg-gray-700 rounded-lg">
                                ❌ All questions have been used and removed.
                            </p>
                        )}
                    </div>

                    
                </>
            ) : (
                <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border-t-4 border-pink-500 text-center">
                    <Timer onTimerEnd={handleTimerEnd} isPaused={isTimerPaused} currentQuestionId={currentQuestionId} />
                    <button
                        onClick={() => setIsTimerPaused(prev => !prev)}
                        className={`text-white text-sm py-1 px-3 rounded-full mb-4 transition ${
                            isTimerPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                    >
                        {isTimerPaused ? '▶️ Resume Timer' : '⏸️ Pause Timer'}
                    </button>

                    <p className="text-xl font-medium text-gray-200 mb-4">
                        Question Type:{' '}
                        <span className="font-bold text-pink-400">{currentQuestion.type.toUpperCase()}</span>
                    </p>

                    <p className="text-3xl font-extrabold text-white mb-6 p-4 bg-gray-900 rounded-lg shadow-inner">
                        {cleanQuestionText(currentQuestion.text)}
                    </p>

                    {currentQuestion.type === 'picture' && currentQuestion.image_data && (
                        <div className="mb-6 p-4 bg-gray-900 rounded-lg max-w-lg mx-auto border border-indigo-500">
                            <img
                                src={currentQuestion.image_data}
                                alt="Question"
                                className="w-full h-auto max-h-80 object-contain rounded-lg"
                            />
                        </div>
                    )}

                    {currentQuestion.type === 'multiple_choice' && (
                        <div className="text-left space-y-2 mb-6 max-w-md mx-auto text-gray-300">
                            <p className="text-lg bg-gray-700 p-2 rounded">A: {currentQuestion.option_a}</p>
                            <p className="text-lg bg-gray-700 p-2 rounded">B: {currentQuestion.option_b}</p>
                            <p className="text-lg bg-gray-700 p-2 rounded">C: {currentQuestion.option_c}</p>
                            <p className="text-lg bg-gray-700 p-2 rounded">D: {currentQuestion.option_d}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <button
                            onClick={() => setRevealAnswer(prev => !prev)}
                            className="text-white text-sm bg-gray-600 hover:bg-gray-500 py-1 px-3 rounded-full flex items-center mx-auto transition"
                        >
                            {revealAnswer ? <>👁️ Hide Answer</> : <>👁️‍🗨️ Reveal Correct Answer</>}
                        </button>
                        {revealAnswer && (
                            <p className="mt-3 text-2xl font-extrabold text-green-400 bg-gray-900 p-3 rounded">
                                Correct Answer: {currentQuestion.correct_answer}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-center space-x-6">
                        <button
                            onClick={() => handleScoring(true)}
                            className="py-4 px-8 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition duration-300 shadow-lg"
                        >
                            ✅ Correct
                        </button>
                        <button
                            onClick={() => handleScoring(false)}
                            className="py-4 px-8 bg-red-600 text-white text-xl font-bold rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
                        >
                            ❌ Incorrect
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Buttons */}
            <div className="mt-8 text-center flex flex-wrap justify-center space-x-4 max-w-4xl mx-auto">
                <button
                    onClick={handleWhoWinsMatch}
                    className="py-3 px-6 bg-pink-700 text-white font-bold rounded-lg hover:bg-pink-800 transition duration-300 text-sm shadow-md"
                >
                    🏆 WHO WINS THIS MATCH
                </button>
                <button
                    onClick={handleNextMatch}
                    className="py-3 px-6 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 transition duration-300 text-sm shadow-md"
                >
                    ➡️ GO NEXT MATCH
                </button>
                <button
                    onClick={handleShowResults}
                    className="py-3 px-6 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition duration-300 text-sm shadow-md"
                >
                    📊 RESULT
                </button>
            </div>
        </div>
    );
};

export default Questions;