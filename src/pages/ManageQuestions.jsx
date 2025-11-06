import React, { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';

// Define the available question types
const QUESTION_TYPES = [
    { value: 'direct', label: 'Direct Question (Text Answer)' },
    { value: 'true/false', label: 'True/False (Radio Buttons)' },
    { value: 'multiple_choice', label: 'Multiple Choice (4 Options)' },
    { value: 'picture', label: 'Picture Guess (Image File)' }, // Updated Label
];

// Initial state for a new question with a default type and necessary fields
const emptyQuestion = {
    text: '',
    correct_answer: '',
    type: 'direct', // Default type
    image_data: null, // NEW: For storing Base64 string of the image
    // Specific fields for Multiple Choice
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
};

const ManageQuestions = () => {
    const { questionBank, addQuestion, editQuestion, deleteQuestion } = useCompetition();
    
    const [currentQuestion, setCurrentQuestion] = useState(emptyQuestion);
    const [isEditing, setIsEditing] = useState(false);
    
    // 🔔 NEW: State for success message
    const [successMessage, setSuccessMessage] = useState(null); 

    // 🔔 NEW: Function to display the message and clear it after a delay
    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        // Clear the message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000); 
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));
    };
    
    // 🖼️ NEW FUNCTION: Handle Image File Upload and convert to Base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Store the Base64 string in image_data
                setCurrentQuestion(prev => ({ ...prev, image_data: reader.result }));
            };
            reader.readAsDataURL(file); // This reads the file as a Base64 string
        }
    };

    const handleMultipleChoiceChange = (e) => {
        const { name, value } = e.target;
        // Special handling for the correct answer field in MCQs
        if (name === 'correct_answer' && currentQuestion.type === 'multiple_choice') {
            setCurrentQuestion(prev => ({ ...prev, correct_answer: value.toUpperCase() }));
            return;
        }
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));
    };
    
    // Resets options when switching types
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setCurrentQuestion({
            ...emptyQuestion,
            type: newType,
            // Preserve ID and text if editing, but clear old options
            id: isEditing ? currentQuestion.id : null,
            text: currentQuestion.text,
            image_data: currentQuestion.image_data, // Preserve image data if applicable
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. Basic Validation
        if (currentQuestion.text.trim() === '' || currentQuestion.correct_answer.toString().trim() === '') {
            alert('Question text and correct answer are required.');
            return;
        }
        
        // 2. Multiple Choice Validation (Waa sidii hore)
        if (currentQuestion.type === 'multiple_choice') {
            const options = [currentQuestion.option_a, currentQuestion.option_b, currentQuestion.option_c, currentQuestion.option_d];
            if (options.some(opt => opt.trim() === '')) {
                alert('All four options (A, B, C, D) are required for Multiple Choice.');
                return;
            }
            if (!['A', 'B', 'C', 'D'].includes(currentQuestion.correct_answer.toUpperCase())) {
                alert('Multiple Choice correct answer must be A, B, C, or D.');
                return;
            }
        }
        
        // 3. Picture Validation (NEW: Ensure image_data is present)
        if (currentQuestion.type === 'picture' && !currentQuestion.image_data) {
             alert('Please upload an image file for the Picture Guess question type.');
             return;
        }

        // 4. Save Logic
        let questionToSave = { ...currentQuestion };
        
        // Clean up unnecessary fields based on type before saving
        if (questionToSave.type !== 'multiple_choice') {
            delete questionToSave.option_a;
            delete questionToSave.option_b;
            delete questionToSave.option_c;
            delete questionToSave.option_d;
        }
        
        if (questionToSave.type !== 'picture') {
             delete questionToSave.image_data; // Clean up image data if not a picture question
        }


        if (isEditing) {
            editQuestion(questionToSave);
            // 🔔 NEW: Use showSuccessMessage instead of alert()
            showSuccessMessage('Question updated successfully!'); 
        } else {
            addQuestion(questionToSave);
            // 🔔 NEW: Use showSuccessMessage instead of alert()
            showSuccessMessage('Question added successfully!'); 
        }

        // Reset the form after submission
        setCurrentQuestion(emptyQuestion);
        setIsEditing(false);
    };

    const handleEdit = (question) => {
        // Ensure all possible fields are present when editing (important for correct type switching)
        const questionToEdit = { ...emptyQuestion, ...question }; 
        setCurrentQuestion(questionToEdit);
        setIsEditing(true);
    };
    
    const handleCancelEdit = () => {
        setCurrentQuestion(emptyQuestion);
        setIsEditing(false);
    };

    // Helper to format the type string for display
    const formatType = (type) => {
        switch(type) {
            case 'direct': return 'Direct 📝';
            case 'true/false': return 'T/F ✅';
            case 'multiple_choice': return 'MCQ ⭕';
            case 'picture': return 'Picture 🖼️';
            default: return type;
        }
    };


    return (
        <div className="p-4 relative"> {/* Added relative for message positioning */}
             {/* 🔔 NEW: Success Message Component */}
            {successMessage && (
                <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
                    <div className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
                        <span>{successMessage}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            )}
            {/* END: Success Message Component */}

            <h2 className="text-4xl font-extrabold text-indigo-400 mb-8 text-center">
                MANAGE QUESTION BANK
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                
                {/* Left Panel: Add/Edit Question Form */}
                <div className="md:w-1/3 bg-gray-800 p-6 rounded-xl shadow-2xl h-fit">
                    <h3 className="text-2xl font-bold mb-4 text-pink-400">
                        {isEditing ? 'Edit Question' : 'Add New Question'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 1. Question Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Question Type
                            </label>
                            <select
                                name="type"
                                value={currentQuestion.type}
                                onChange={handleTypeChange}
                                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isEditing} // Prevent type change while editing existing question
                            >
                                {QUESTION_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* 2. Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Question Text:
                            </label>
                            <textarea
                                name="text"
                                value={currentQuestion.text}
                                onChange={handleChange}
                                required
                                rows="4"
                                placeholder={currentQuestion.type === 'picture' ? "Enter Text Hint for Picture Question (e.g. 'Guess the Landmark')" : "Enter the question text"}
                                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        
                        {/* 🎨 NEW: Picture Input Field (File Uploader) */}
                          {currentQuestion.type === 'picture' && (
                            <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
                                <p className="text-pink-300 font-semibold text-sm">Upload Image File (JPG/PNG):</p>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {currentQuestion.image_data && (
                                    <div className="mt-4 border border-gray-600 p-2 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">Preview:</p>
                                        <img 
                                            src={currentQuestion.image_data} 
                                            alt="Uploaded Preview" 
                                            className="w-full h-auto max-h-40 object-contain rounded-md" 
                                        />
                                    </div>
                                )}
                            </div>
                        )}


                        {/* 3. Dynamic Inputs based on Type (Multiple Choice Options) */}
                        {currentQuestion.type === 'multiple_choice' && (
                            <div className="space-y-3 p-4 bg-gray-700 rounded-lg">
                                <p className="text-pink-300 font-semibold text-sm">Multiple Choice Options (Required):</p>
                                {/* Input A */}
                                <input type="text" name="option_a" value={currentQuestion.option_a} onChange={handleMultipleChoiceChange} required placeholder="Option A Text" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white focus:ring-pink-500" />
                                {/* Input B */}
                                <input type="text" name="option_b" value={currentQuestion.option_b} onChange={handleMultipleChoiceChange} required placeholder="Option B Text" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white focus:ring-pink-500" />
                                {/* Input C */}
                                <input type="text" name="option_c" value={currentQuestion.option_c} onChange={handleMultipleChoiceChange} required placeholder="Option C Text" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white focus:ring-pink-500" />
                                {/* Input D */}
                                <input type="text" name="option_d" value={currentQuestion.option_d} onChange={handleMultipleChoiceChange} required placeholder="Option D Text" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white focus:ring-pink-500" />
                            </div>
                        )}
                        
                        {/* 4. Correct Answer Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Correct Answer:
                            </label>
                            {/* TRUE/FALSE TYPE */}
                            {currentQuestion.type === 'true/false' ? (
                                <div className="flex space-x-4">
                                    <label className="flex items-center text-white">
                                        <input type="radio" name="correct_answer" value="True" checked={currentQuestion.correct_answer === 'True'} onChange={handleChange} required className="mr-2 text-pink-500" />
                                        True
                                    </label>
                                    <label className="flex items-center text-white">
                                        <input type="radio" name="correct_answer" value="False" checked={currentQuestion.correct_answer === 'False'} onChange={handleChange} required className="mr-2 text-pink-500" />
                                        False
                                    </label>
                                </div>
                            ) : currentQuestion.type === 'multiple_choice' ? (
                                /* MULTIPLE CHOICE TYPE */
                                <input
                                    type="text"
                                    name="correct_answer"
                                    value={currentQuestion.correct_answer}
                                    onChange={handleMultipleChoiceChange}
                                    required
                                    placeholder="Enter A, B, C, or D"
                                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 uppercase font-bold"
                                />
                            ) : (
                                /* DIRECT / PICTURE TYPE */
                                <input
                                    type="text"
                                    name="correct_answer"
                                    value={currentQuestion.correct_answer}
                                    onChange={handleChange}
                                    required
                                    placeholder={currentQuestion.type === 'picture' ? "Enter the single correct name/word for the image" : "Enter the single correct answer"}
                                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <button 
                                type="submit" 
                                className={`py-2 px-4 font-bold rounded-lg transition duration-300 
                                    ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white flex-grow`}
                            >
                                {isEditing ? '💾 Save Changes' : '➕ Add Question'}
                            </button>
                            
                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit} 
                                    className="py-2 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Panel: Question Bank List */}
                <div className="md:w-2/3 bg-gray-800 p-6 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-white">
                        Question Bank ({questionBank.length} Items)
                    </h3>

                    {questionBank.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">
                            No questions added yet. Use the form on the left to start building your bank.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-10">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/2">Question/Content</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5">Answer</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {questionBank.map((question, index) => (
                                        <tr key={question.id} className="hover:bg-gray-700 transition duration-150">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-400">{index + 1}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-400">
                                                {formatType(question.type)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300 max-w-xs truncate">
                                                <span className="font-semibold block">{question.text}</span>
                                                {question.type === 'multiple_choice' && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        A:{question.option_a} | B:{question.option_b} | C:{question.option_c} | D:{question.option_d}
                                                    </div>
                                                )}
                                                {question.type === 'picture' && question.image_data && (
                                                        <img 
                                                             src={question.image_data} 
                                                             alt="Question Preview" 
                                                             className="h-10 w-auto object-cover rounded-md mt-1 border border-gray-600" 
                                                         />
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                                                {question.correct_answer}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleEdit(question)} 
                                                    className="text-indigo-400 hover:text-indigo-600 mr-3 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this question?')) {
                                                            deleteQuestion(question.id);
                                                            // Optional: Show a message for deletion as well
                                                            showSuccessMessage('Question deleted successfully!'); 
                                                        }
                                                    }} 
                                                    className="text-red-400 hover:text-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageQuestions;