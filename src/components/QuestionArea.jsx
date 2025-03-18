import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState, useEffect } from "react";

function QuestionArea({ question, onSubmit, userId, startTime }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
    setIsFadingOut(false);
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitted) return;
  
    const correct = answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
  
    if (correct) {
      try {
        const userRef = doc(db, "allowed_users", userId);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const completedQuestions = userData.completedQuestions || [];
  
          if (!completedQuestions.includes(question.id)) {
            const currentTime = new Date();
            const elapsedTime = currentTime - new Date(startTime);
            const hours = Math.floor(elapsedTime / 3600000).toString().padStart(2, '0');
            const minutes = Math.floor((elapsedTime % 3600000) / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((elapsedTime % 60000) / 1000).toString().padStart(2, '0');
            const relativeTime = `${hours}:${minutes}:${seconds}`;
            
            await updateDoc(userRef, {
              points: (userData.points || 0) + 100,
              [`answers.${question.id}`]: answer,
              completedQuestions: arrayUnion(question.id),
              [`timestamps.${question.id}`]: relativeTime,
            });
          }
        }
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
  
      onSubmit(answer);
    }
  };
  
  const handleTryAgain = () => {
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 shadow-lg transition-opacity duration-700 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
      <h2 className="text-xl font-medium mb-4">{question.content}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted && isCorrect}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-purple-500"
            placeholder="Type your answer here..."
          />
        </div>

        <div className="flex space-x-4">
          {!submitted ? (
            <button
              type="submit"
              disabled={!answer.trim()}
              className={`px-4 py-2 rounded-lg ${
                answer.trim() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 cursor-not-allowed"
              } transition-colors`}
            >
              Submit Answer
            </button>
          ) : isCorrect ? (
            <div className="px-4 py-2 rounded-lg bg-green-600 transition-opacity duration-500">Correct! Moving to next question...</div>
          ) : (
            <div className="flex space-x-4">
              <div className="px-4 py-2 rounded-lg bg-red-600">Incorrect! Try Again.</div>
              <button
                type="button"
                onClick={handleTryAgain}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default QuestionArea;