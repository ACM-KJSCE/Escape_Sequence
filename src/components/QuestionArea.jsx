import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState, useEffect } from "react";
import BonusQuestion from "./BonusQuestion";

function QuestionArea({ question, onSubmit, userId, startTime, compq }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showBonusQuestion, setShowBonusQuestion] = useState(false);
  const [bonusQuestion, setBonusQuestion] = useState(null);
  const [bonusQuestionAttempted, setBonusQuestionAttempted] = useState(false);
  const [showBonusQuestionPrompt, setShowBonusQuestionPrompt] = useState(false);

  useEffect(() => {
    const fetchBonusAttemptStatus = async () => {
      try {
        const userRef = doc(db, "allowed_users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const bonusAttempted = userDoc.data().bonusQuestionAttempted || false;
          setBonusQuestionAttempted(bonusAttempted);
        }
      } catch (error) {
        console.error("Error fetching bonus question attempt status:", error);
      }
    };

    fetchBonusAttemptStatus();

    const checkBonusQuestionTime = () => {
      const currentTime = new Date();
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime >= 3 * 60 * 1000 && elapsedTime < 12 * 60 * 1000 && compq.length >= 2 && !bonusQuestionAttempted) {
        const mockBonusQuestion = {
          content: "What is my Pointer?",
          correctAnswer: "9.75"
        };
        setBonusQuestion(mockBonusQuestion);
        setShowBonusQuestionPrompt(true);
      }
    };

    const timer = setInterval(checkBonusQuestionTime, 1000);

    return () => clearInterval(timer);
  }, [startTime, compq.length, bonusQuestionAttempted]);

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
            const elapsedTime = currentTime - startTime;
            console.log(elapsedTime);
            const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 60).toString().padStart(2, '0');
            const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60).toString().padStart(2, '0');
            const seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, '0');
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

  const handleBonusQuestionContinue = () => {
    setShowBonusQuestionPrompt(false);
    setShowBonusQuestion(true);
  };

  const handleBonusQuestionSkip = async () => {
    try {
      const userRef = doc(db, "allowed_users", userId);
      await updateDoc(userRef, {
        bonusTime: 0,
        bonusQuestionAttempted: true,
      });
    } catch (error) {
      console.error("Error updating bonus question skip status:", error);
    }

    setShowBonusQuestionPrompt(false);
    setBonusQuestionAttempted(true);
  };

  const handleBonusQuestionSubmit = async (bonusAnswer) => {
    const correct = bonusAnswer.trim().toLowerCase() === bonusQuestion.correctAnswer.toLowerCase();
    
    try {
      const userRef = doc(db, "allowed_users", userId);
      await updateDoc(userRef, {
        bonusTime: correct 
          ? -2
          : +2,
        bonusQuestionAttempted: true,
      });
    } catch (error) {
      console.error("Error updating bonus question submit status:", error);
    }

    setShowBonusQuestion(false);
    setBonusQuestionAttempted(true);
  };

  const handleBonusQuestionTimeUp = async () => {
    try {
      const userRef = doc(db, "allowed_users", userId);
      await updateDoc(userRef, {
        bonusTime: 12000,
        bonusQuestionAttempted: true,
      });
    } catch (error) {
      console.error("Error updating bonus question time-up status:", error);
    }

    setShowBonusQuestion(false);
    setBonusQuestionAttempted(true);
  };

  return (
    <>
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

      {showBonusQuestionPrompt && !bonusQuestionAttempted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Bonus Question Opportunity!</h3>
            <p className="text-gray-600 mb-6">A bonus question is available. Would you like to attempt it?</p>
            <div className="flex space-x-4">
              <button 
                onClick={handleBonusQuestionContinue}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Continue
              </button>
              <button 
                onClick={handleBonusQuestionSkip}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showBonusQuestion && (
        <BonusQuestion
          question={bonusQuestion}
          onClose={() => {
            setShowBonusQuestion(false);
            setBonusQuestionAttempted(true);
          }}
          onSubmit={handleBonusQuestionSubmit}
          onTimeUp={handleBonusQuestionTimeUp}
        />
      )}
    </>
  );
}

export default QuestionArea;