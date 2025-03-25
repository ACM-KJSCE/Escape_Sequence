import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import QuestionArea from "../components/QuestionArea";
import Timer from "../components/Timer";
import Leaderboard from "../components/LeaderBoard";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Dashboard() {
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(2700);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [points, setPoints] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState("");

  // Start time (24-hour format)
  const quizStartTime = {
    hour: 22,
    minute: 36,
    second: 0
  };

  const quizStartEpoch = new Date();
  quizStartEpoch.setHours(quizStartTime.hour, quizStartTime.minute, quizStartTime.second);

  const questions = [
    { id: 1, title: "Question 1", content: "X follows normal distribution with mean 33 and Standard deviation 3 then P(25<X< 30) is  (Input answered up to  four decimal place) ", correctAnswer: import.meta.env.VITE_APP_ANSWER_1_KEY },
    { id: 2, title: "Question 2", content: "If X is uniformly distributed in (-2 <= x <= 2) Then  P (X < 1) = ", correctAnswer: import.meta.env.VITE_APP_ANSWER_2_KEY },
    { id: 3, title: "Question 3", content: "What is 2 + 2?", correctAnswer: import.meta.env.VITE_APP_ANSWER_3_KEY },
  ];

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      window.location.href = '/';
    }
    const checkQuizTime = () => {
      const now = new Date();
      const startTime = new Date();
      startTime.setHours(quizStartTime.hour, quizStartTime.minute, quizStartTime.second);
      
      if (now >= startTime) {
        setIsQuizActive(true);
      } else {
        const diffMs = startTime - now;
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
        const diffMins = Math.floor(((diffMs % 86400000) % 3600000) / 60000);
        const diffSecs = Math.floor((((diffMs % 86400000) % 3600000) % 60000) / 1000);
        
        setTimeUntilStart(`${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`);
      }
    };

    checkQuizTime();
    const interval = setInterval(checkQuizTime, 1000);

    const fetchUserData = async () => {
      if (!userEmail) return;

      const userRef = doc(db, "allowed_users", userEmail);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setPoints(userDoc.data().points || 0);
        setCompletedQuestions(userDoc.data().completedQuestions || []);
      }
    };

    fetchUserData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeQuestion !== "leaderboard" && isQuizActive) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [activeQuestion, isQuizActive]);

  useEffect(() => {
    if (timeRemaining <= 0 || completedQuestions.length === questions.length) {
      setActiveQuestion("leaderboard");
      setIsTimerRunning(false);
    }
  }, [timeRemaining, completedQuestions]);
  

  const handleQuestionChange = (questionId) => {
    if (questionId === "leaderboard") {
      setActiveQuestion("leaderboard");
      return;
    }
    
    if (!isQuizActive) return;

    if (
      completedQuestions.includes(questionId) ||
      questionId === 1 ||
      (typeof questionId === "number" && completedQuestions.includes(questionId - 1))
    ) {
      setActiveQuestion(questionId);
    } else {
      alert("Please complete the previous question first!");
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (!isQuizActive || activeQuestion === "leaderboard") return;

    const currentQuestion = questions.find((q) => q.id === activeQuestion);
    if (!currentQuestion || completedQuestions.includes(activeQuestion)) return;

    if (answer === currentQuestion.correctAnswer) {
      setCompletedQuestions([...completedQuestions, activeQuestion]);

      const nextQuestionId = activeQuestion + 1;
      const hasNextQuestion = questions.some((q) => q.id === nextQuestionId);

      if (hasNextQuestion) {
        setActiveQuestion(nextQuestionId);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const currentQuestion = questions.find((q) => q.id === activeQuestion);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar
        activeQuestion={activeQuestion}
        completedQuestions={completedQuestions}
        onQuestionChange={handleQuestionChange}
        onLogout={handleLogout}
        isQuizActive={isQuizActive}
        />
    
        <main className="flex-1 p-6 overflow-auto">
        {(activeQuestion === "leaderboard" || timeRemaining <= 0 || completedQuestions.length === questions.length) ? (
            <Leaderboard />
        ) : !isQuizActive ? (
            <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-6">Quiz Not Started Yet</h1>
                <p className="text-xl mb-6">
                The quiz will start at {quizStartTime.hour}:{String(quizStartTime.minute).padStart(2, '0')}
                </p>
                <div className="text-4xl font-mono mb-8 text-purple-400">{timeUntilStart}</div>
                <p className="text-gray-400">Please wait until the scheduled time to begin the quiz.</p>
                <p className="mt-4 text-purple-300">
                You can view the <button 
                    onClick={() => setActiveQuestion("leaderboard")} 
                    className="underline hover:text-purple-400">
                    leaderboard
                </button> while you wait.
                </p>
            </div>
            </div>
        ) : (
            <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{currentQuestion?.title}</h1>
                <h1 className="text-2xl font-bold">Points: {points}</h1>
                <Timer timeRemaining={timeRemaining} setTimeRemaining={setTimeRemaining} isRunning={isTimerRunning} startTime={quizStartEpoch} />
            </div>
            <QuestionArea question={currentQuestion} onSubmit={handleAnswerSubmit} userId={userEmail} startTime={quizStartEpoch} />
            </>
        )}
        </main>
    </div>      
  );
}

export default Dashboard;