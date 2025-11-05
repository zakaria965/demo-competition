import React, { createContext, useContext, useState, useEffect } from 'react';

const CompetitionContext = createContext();

// Constants for Local Storage Keys
const QUESTION_BANK_STORAGE_KEY = 'quizApp_questionBank';
const COMPETITION_DATA_STORAGE_KEY = 'quizApp_competitionData';
// 🏆 KEY CUSUB: Leaderboard-ka taariikhiga ah
const LEADERBOARD_STORAGE_KEY = 'quizApp_leaderboardHistory'; 

// Helper function for shuffling the array (looma baahna in la saaro)
const shuffleArray = (array) => {
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Initial state for Competition Data
const initialCompetitionState = {
    teams: [], 
    currentRound: 1,
    currentMatch: 1,
    currentPair: [],
    matchWinners: [],
    round1Matches: [],
    byeTeam: null,
    currentTurnIndex: 0,
    currentQuestionId: null,
    answeredQuestionIds: [], 
    isRoundOver: false,
    competition: null, 
    winner: null, // Waxaan ku daray winner si loogu isticmaalo Results page-ka
    isCompetitionActive: false, // Muhiim si loo ogaado in tartan socdo
};

export const CompetitionProvider = ({ children }) => {
    const [competitionData, setCompetitionData] = useState(initialCompetitionState);
    const [questionBank, setQuestionBank] = useState([]);
    // 🏆 STATE CUSUB: Leaderboard-ka taariikhiga ah
    const [leaderboard, setLeaderboard] = useState([]); 


    // 1. useEffect: Load Data from Local Storage (marka la bilaabayo)
    useEffect(() => {
        // Load Competition Data 
        const storedCompData = localStorage.getItem(COMPETITION_DATA_STORAGE_KEY);
        if (storedCompData) {
            try {
                const parsedData = JSON.parse(storedCompData);
                setCompetitionData({ ...initialCompetitionState, ...parsedData }); // Hubi inuu ku jiro format-kii hore
            } catch (e) {
                console.error("Error loading competition data from storage:", e);
                setCompetitionData(initialCompetitionState);
            }
        }
        
        // Load Question Bank (MUHIIM)
        const storedQuestions = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
        if (storedQuestions) {
            try {
                setQuestionBank(JSON.parse(storedQuestions));
            } catch (e) {
                console.error("Error loading question bank from storage:", e);
                setQuestionBank([]);
            }
        }

        // 🏆 Load Leaderboard Data (Hagaajinta Leaderboard-ka)
        const storedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        if (storedLeaderboard) {
            try {
                setLeaderboard(JSON.parse(storedLeaderboard));
            } catch (e) {
                console.error("Error loading leaderboard data from storage:", e);
                setLeaderboard([]);
            }
        }
    }, []);


    // 2. useEffect: Save Data to Local Storage (marka ay isbeddesho)

    // A. Kaydi Question Bank
    useEffect(() => {
        if (questionBank.length > 0) {
            localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(questionBank));
        } else {
            localStorage.removeItem(QUESTION_BANK_STORAGE_KEY);
        }
    }, [questionBank]);

    // B. Kaydi Competition Data
    useEffect(() => {
        // Kaydi xogta haddii tartan socdo, ama haddii la isku dayay in la bilaabo
        if (competitionData.isCompetitionActive || competitionData.teams.length > 0) {
            localStorage.setItem(COMPETITION_DATA_STORAGE_KEY, JSON.stringify(competitionData));
        } else {
            localStorage.removeItem(COMPETITION_DATA_STORAGE_KEY);
        }
    }, [competitionData]);

    // C. Kaydi Leaderboard Data (Hagaajinta Leaderboard-ka)
    useEffect(() => {
        if (leaderboard.length > 0) {
            localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
        } else {
            localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
        }
    }, [leaderboard]);


    // 🧠 Start a new competition
    const startCompetition = (competitionName, teamsList, roundDetails, questions = []) => {
        // Hubi in koox kasta lagu daro 'isEliminated' & 'status'
        const initialTeams = teamsList.map((t, idx) => ({
            id: t.id ?? idx + 1,
            name: t.name ?? `Team ${idx + 1}`,
            score: 0,
            isEliminated: false,
            status: 'Active', 
        }));

        setCompetitionData({
            ...initialCompetitionState, // Reset the rest of the state
            competition: { name: competitionName, roundDetails }, 
            teams: initialTeams,
            isCompetitionActive: true, // Hadda waa muhiim: Tartanku waa bilaabmay
        });
        
        if (questions && questions.length > 0) {
            setQuestionBank(questions);
        }
    };


    // =========================================================
    // 🏆 LEADERBOARD FUNCTIONS (KUWA CUSUB)
    // =========================================================

    // ➕ FUNCTION CUSUB: Ku dar natiijada tartanka Leaderboard-ka
    const addLeaderboardResult = (result) => {
        setLeaderboard(prevLeaderboard => {
            const newEntry = {
                ...result,
                id: Date.now(), // ID u gaar ah
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            };
            return [newEntry, ...prevLeaderboard]; // Ku dar kan ugu horreeya
        });
        console.log("✅ Competition result saved to historical leaderboard.");
    };

    // 🗑️ FUNCTION CUSUB: Tirtir dhammaan Leaderboard-ka
    const removeLeaderboardData = () => {
        setLeaderboard([]);
        // Local Storage-ka waxaa ka tirtiraya useEffect-ka sare
    };

    // =========================================================
    // ➕ MAAREYNA SU'AALAHA (Sidii hore)
    // =========================================================
    // ... [AddQuestion, editQuestion, deleteQuestion, removeQuestionFromBank waa sidii hore]

    const addQuestion = (newQuestion) => {
        setQuestionBank(prevBank => {
            const newId = prevBank.length > 0 
                ? Math.max(...prevBank.map(q => q.id || 0)) + 1 
                : 1;
            return [...prevBank, { ...newQuestion, id: newId }];
        });
    };

    const editQuestion = (updatedQuestion) => {
        setQuestionBank(prevBank => prevBank.map(q => 
            q.id === updatedQuestion.id ? updatedQuestion : q
        ));
    };

    const deleteQuestion = (questionId) => {
        setQuestionBank(prevBank => prevBank.filter(q => q.id !== questionId));
    };

    const removeQuestionFromBank = (questionId) => {
        setQuestionBank(prevBank => {
            const updatedBank = prevBank.filter(q => q.id !== questionId);
            return updatedBank;
        });
    };


    // =========================================================
    // ⚙️ INTA KALE EE FUNCTIONS (Sidii hore)
    // =========================================================
    
    // ... [updateTeamStatus, startQuestion, submitAnswer, recordMatchWinner, goToNextMatch waa sidii hore]

    const updateTeamStatus = (teamName, statusUpdate, isEliminated = false) => {
        setCompetitionData(prev => ({
            ...prev,
            teams: prev.teams.map(team => 
                team.name === teamName 
                    ? { ...team, status: statusUpdate, isEliminated: isEliminated }
                    : team
            ),
        }));
    };

    const startQuestion = (questionId) => {
        setCompetitionData(prev => ({
            ...prev,
            currentQuestionId: questionId,
            isRoundOver: false,
        }));
    };

    const submitAnswer = (teamName, questionId, isCorrect) => {
        setCompetitionData(prev => {
            const updatedTeams = prev.teams.map(team => {
                if (team.name === teamName) {
                    return { ...team, score: isCorrect ? team.score + 10 : team.score };
                }
                return team;
            });

            const nextTurn = (prev.currentTurnIndex + 1) % prev.currentPair.length;
            
            return {
                ...prev,
                teams: updatedTeams,
                currentTurnIndex: nextTurn,
                currentQuestionId: null,
            };
        });
        removeQuestionFromBank(questionId);
    };

    const recordMatchWinner = (winnerName, loserName, round, match) => {
        setCompetitionData(prev => {
            const newWinnerEntry = { round, match, winner: winnerName, loser: loserName };
            const updatedWinners = [...prev.matchWinners, newWinnerEntry];

            const updatedTeams = prev.teams.map(team => {
                if (team.name === loserName) {
                    return { ...team, isEliminated: true, status: 'Eliminated' }; 
                }
                return team;
            });

            return { 
                ...prev, 
                matchWinners: updatedWinners, 
                teams: updatedTeams, 
                isRoundOver: true,
            };
        });
    };

    const goToNextMatch = () => {
        setCompetitionData(prev => ({
            ...prev,
            currentTurnIndex: 0,
            isRoundOver: false,
            currentQuestionId: null,
            currentPair: [],
        }));
    };

    // 🏆 Finalize competition - Halkan waxaannu ku darnay keydinta natiijada Leaderboard-ka!
    const finalizeCompetition = (finalWinnerName) => {
        setCompetitionData(prev => {
            const finalTeams = prev.teams.map(t => 
                t.name === finalWinnerName ? { ...t, status: 'Champion' } : t
            );

            // 1. Keydi natiijada Leaderboard-ka taariikhiga ah
            addLeaderboardResult({
                name: prev.competition?.name || 'Unknown Competition',
                winner: finalWinnerName,
                finalScores: finalTeams
                    .map(t => ({ name: t.name, score: t.score }))
                    .sort((a, b) => b.score - a.score), // U kala horree kooxaha Score-ka ugu badan
            });

            // 2. Nadiifi xogta tartanka hadda socda
            return { 
                ...initialCompetitionState, // Waxaanu ku nadiifiyay initial state
                isCompetitionActive: false,
                winner: finalWinnerName,
                teams: finalTeams, // Waxaanu ku hayn doonaa kaliya si loo isticmaalo page-ka Results
            };
        });
    };

    // 🧹 Reset everything (oo ay ku jirto Local Storage)
    const resetCompetition = () => {
        setCompetitionData(initialCompetitionState);
        setQuestionBank([]); 
        // Sidoo kale tirtir Local Storage
        localStorage.removeItem(COMPETITION_DATA_STORAGE_KEY);
        localStorage.removeItem(QUESTION_BANK_STORAGE_KEY);
        // Tirtir leaderboard-ka laakiin maaha xogta taariikhiga ah ee Leaderboard-ka
    };

    return (
        <CompetitionContext.Provider
            value={{
                competitionData,
                setCompetitionData, 
                questionBank,
                // 🏆 KUWA CUSUB
                leaderboard, 
                addLeaderboardResult,
                removeLeaderboardData,
                // Question Management
                addQuestion,
                editQuestion,
                deleteQuestion,
                removeQuestionFromBank, 
                // Competition Flow
                startCompetition,
                startQuestion,
                submitAnswer, 
                recordMatchWinner,
                finalizeCompetition,
                goToNextMatch,
                resetCompetition,
                updateTeamStatus,
            }}
        >
            {children}
        </CompetitionContext.Provider>
    );
};

export const useCompetition = () => useContext(CompetitionContext);