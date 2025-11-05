// // src/pages/Questions.jsx (FINAL VERSION: Enhanced Teacher Controls)
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCompetition } from '../context/CompetitionContext';

// // Simple Timer Component (FR6)
// const Timer = ({ onTimerEnd }) => {
//     const defaultTime = 60;
//     const [timeLeft, setTimeLeft] = useState(defaultTime);

//     useEffect(() => {
//         if (timeLeft <= 0) {
//             onTimerEnd(true); // Signal timeout
//             return;
//         }

//         const intervalId = setInterval(() => {
//             setTimeLeft(prevTime => prevTime - 1);
//         }, 1000);

//         return () => clearInterval(intervalId);
//     }, [timeLeft, onTimerEnd]);
    
//     useEffect(() => {
//         setTimeLeft(defaultTime); // Reset timer when question starts
//     }, []);

//     const timeColor = timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400';

//     return (
//         <div className="flex justify-center items-center my-4">
//             <div className={`text-4xl font-extrabold ${timeColor} bg-gray-900 p-4 rounded-full shadow-lg border-4 border-yellow-500`}>
//                 {timeLeft}s
//             </div>
//         </div>
//     );
// };


// const Questions = () => {
//     const { 
//         competitionData, 
//         questionBank, 
//         startQuestion, 
//         submitAnswer, 
//         finalizeCompetition // Used for End Competition button
//     } = useCompetition();
    
//     const navigate = useNavigate();

//     const { 
//         teams, 
//         currentTurnIndex, 
//         currentQuestionId, 
//         answeredQuestionIds,
//         isRoundOver 
//     } = competitionData;

//     const [feedback, setFeedback] = useState(null); 
//     const [revealAnswer, setRevealAnswer] = useState(false); // State for answer reveal button

//     const currentTeam = teams[currentTurnIndex];
//     const currentQuestion = questionBank.find(q => q.id === currentQuestionId);
    
//     // Check for end of game and redirect
//     useEffect(() => {
//         if (isRoundOver) {
//             // No alert, just auto-redirect after the last scoring action
//             navigate('/results');
//         }
//     }, [isRoundOver, navigate]);


//     const handleQuestionSelection = (questionId) => {
//         if (currentQuestionId !== null) {
//             alert('A question is already active. Score the current one first.');
//             return;
//         }
//         startQuestion(questionId);
//         setFeedback(null);
//         setRevealAnswer(false); // Reset reveal state
//     };

//     // New Scoring Logic (Triggered by Teacher Buttons)
//     const handleScoring = (isCorrect) => {
//         if (!currentQuestion) return;

//         // 1. Provide Feedback
//         const message = isCorrect ? 'Congratulations! Correct.' : 'Wrong. Incorrect.';
//         setFeedback({ message, isCorrect });
        
//         // 2. Score and Advance Turn
//         submitAnswer(currentTeam.name, currentQuestionId, isCorrect);
        
//         // 3. Close question/Reset
//         setRevealAnswer(false);
//         setTimeout(() => setFeedback(null), 3000); 
//     };

//     // Handles Timer End (automatically scores wrong and advances)
//     const handleTimerEnd = (isTimedOut) => {
//         if (isTimedOut && currentQuestionId) {
//             alert(`Time's up for ${currentTeam.name}! Answer: ${currentQuestion.correct_answer}. Turn advances.`);
//             handleScoring(false); // Scores the question as incorrect/0 points
//         }
//     }
    
//     // Teacher Control: End Competition Now
//     const handleEndCompetition = () => {
//         if (window.confirm("Are you sure you want to end the competition and calculate the winner now?")) {
//             // finalizeCompetition will calculate winner, save to leaderboard, and reset
//             finalizeCompetition();
//             navigate('/results');
//         }
//     };


//     // Safety check (using similar logic as before)
//     if (teams.length === 0 || questionBank.length === 0) {
//         return (
//             <div className="p-8 max-w-xl mx-auto mt-10 bg-red-800 rounded-lg shadow-xl text-white text-center">
//                 <h2 className="text-2xl font-bold mb-4">Game Setup Error</h2>
//                 <p className="mb-6">Competition not properly initialized.</p>
//                 <button 
//                     onClick={() => navigate('/create')}
//                     className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
//                 >
//                     Setup Competition
//                 </button>
//             </div>
//         );
//     }
    
//     return (
//         <div className="p-4">
//             <h2 className="text-4xl font-extrabold text-indigo-400 mb-6 text-center">GAME PLAY</h2>

//             {/* Current Turn & Scores (Always visible) */}
//             <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg shadow-xl">
//                 <div className="text-2xl font-semibold text-gray-300">
//                     CURRENT TURN: 
//                     <span className="ml-2 font-extrabold text-pink-400">
//                         {currentTeam ? currentTeam.name : 'Waiting...'}
//                     </span>
//                 </div>
                
//                 {/* Score Cards (Showing Current Points) */}
//                 <div className="flex space-x-4 mt-4 md:mt-0">
//                     {teams.map(team => (
//                         <div key={team.name} className={`px-4 py-2 rounded-full text-lg font-bold shadow-lg ${team.name === currentTeam?.name ? 'bg-pink-600 text-white border-2 border-white' : 'bg-gray-600 text-gray-100'}`}>
//                             {team.name}: {team.score} Pts
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Question Grid (Only available when no question is active) */}
//             <div className="grid grid-cols-5 gap-4 mb-8">
//                 {questionBank.map((q, index) => {
//                     const isAnswered = answeredQuestionIds.includes(q.id);
//                     return (
//                         <button
//                             key={q.id}
//                             onClick={() => handleQuestionSelection(q.id)}
//                             disabled={isAnswered || currentQuestionId !== null}
//                             className={`
//                                 py-4 px-2 text-lg font-bold rounded-lg shadow-lg transition duration-300 transform hover:scale-105
//                                 ${isAnswered ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
//                             `}
//                         >
//                             Q {index + 1}
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* Active Question Panel */}
//             {currentQuestion ? (
//                 <div className="bg-gray-700 p-8 rounded-xl shadow-2xl border-t-4 border-pink-500 text-center">
                    
//                     {/* Timer (FR6) - Timer calls handleTimerEnd on completion */}
//                     <Timer onTimerEnd={handleTimerEnd} />
                    
//                     <p className="text-xl font-medium text-gray-200 mb-4">
//                         Question Type: <span className="font-bold text-pink-400">{currentQuestion.type.toUpperCase()}</span>
//                     </p>
                    
//                     <p className="text-3xl font-extrabold text-white mb-6 p-4 bg-gray-900 rounded-lg shadow-inner">
//                         {currentQuestion.text}
//                     </p>
                    
//                     {/* Answer Reveal Feature */}
//                     <div className="mb-6">
//                          <button 
//                             onClick={() => setRevealAnswer(prev => !prev)}
//                             className="text-white text-sm bg-gray-600 hover:bg-gray-500 py-1 px-3 rounded-full flex items-center mx-auto transition"
//                          >
//                             {revealAnswer ? (
//                                 <>👁️ Hide Answer</>
//                             ) : (
//                                 <>👁️‍🗨️ Show Correct Answer</>
//                             )}
//                          </button>
//                         {revealAnswer && (
//                             <p className="mt-3 text-2xl font-extrabold text-green-400 bg-gray-800 p-3 rounded">
//                                 Answer: {currentQuestion.correct_answer}
//                             </p>
//                         )}
//                     </div>
                    
//                     {/* Teacher Scoring Buttons (Replaces student text input) */}
//                     <div className="flex justify-center space-x-6">
//                         <button 
//                             onClick={() => handleScoring(true)}
//                             className="py-4 px-8 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition duration-300 shadow-lg"
//                         >
//                             ✅ Correct
//                         </button>
//                         <button 
//                             onClick={() => handleScoring(false)}
//                             className="py-4 px-8 bg-red-600 text-white text-xl font-bold rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
//                         >
//                             ❌ Wrong / Incorrect
//                         </button>
//                     </div>

//                     {/* Feedback */}
//                     {feedback && (
//                         <p className={`mt-6 text-2xl font-bold ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
//                             {feedback.message} (Turn Advancing...)
//                         </p>
//                     )}
//                 </div>
//             ) : (
//                 <div className="p-10 bg-gray-800 rounded-xl text-center shadow-inner">
//                     <p className="text-xl text-gray-400 font-semibold">
//                         <span className="font-extrabold text-white">{currentTeam.name}</span>, please select an available question from the grid above to start your turn.
//                     </p>
//                 </div>
//             )}
            
//             {/* Competition End Button */}
//             <div className="mt-8 text-center">
//                 <button
//                     onClick={handleEndCompetition}
//                     className="py-2 px-6 bg-pink-800 text-white font-bold rounded-lg hover:bg-pink-900 transition duration-300 text-sm shadow-md"
//                 >
//                     FINISH COMPETITION NOW 🏁
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Questions;