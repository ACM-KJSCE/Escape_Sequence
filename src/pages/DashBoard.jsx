import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import QuestionArea from "../components/QuestionArea";
import Timer from "../components/Timer";
import Leaderboard from "../components/LeaderBoard";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import Hints from "../components/Hints";
import QuizRestrictions from "../components/QuizRestrictions";
import { questions, quizStartTime } from "../configs/config";
import ThankYou from "./ThankYou";

function Dashboard() {
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [points, setPoints] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState("");
  const [bonusQuestionShown, setBonusQuestionShown] = useState(false);
  const [bonusTime, setBonusTime] = useState(0);
  const [HintsOn, setHintsOn] = useState(false);
  const [warnings, setWarnings] = useState([]);


  const quizStartEpoch = new Date();
  quizStartEpoch.setHours(quizStartTime.hour, quizStartTime.minute, quizStartTime.second);


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
        // Set the quiz active indicators for QuizRestrictions component
        window.isContestActive = true;
        document.body.classList.add('quiz-active');
        sessionStorage.setItem('quizActive', 'true');
      } else {
        const diffMs = startTime - now;
        const diffHrs = Math.floor((diffMs / (1000 * 60 * 60)) % 60);
        const diffMins = Math.floor((diffMs /(1000 * 60)) % 60);
        const diffSecs = Math.floor((diffMs / 1000) % 60);
        
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
        const userData = userDoc.data();
        setCompletedQuestions(userData.completedQuestions || []);
        setBonusQuestionShown(userData.bonusQuestionShown || false);
        setBonusTime(userData.bonusTime || 0);
      }
    };

    fetchUserData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isQuizActive && timeRemaining > 0 && completedQuestions.length < questions.length) {
      setIsTimerRunning(true);
    } else if (!isQuizActive || timeRemaining <= 0 || completedQuestions.length === questions.length) {
      setIsTimerRunning(false);
    }
  }, [activeQuestion, isQuizActive, timeRemaining, completedQuestions, questions.length]);

  useEffect(() => {
    if (timeRemaining <= 0 || completedQuestions.length === questions.length) {
      setActiveQuestion("leaderboard");
      setIsTimerRunning(false);
    }
  }, [timeRemaining, completedQuestions]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "allowed_users", userEmail), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setPoints(userData.points || 0);
        setBonusTime(userData.bonusTime || 0);
        setBonusQuestionShown(userData.bonusQuestionShown || false);
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  const handleBonusQuestionShown = async () => {
    if (userEmail) {
      try {
        const userRef = doc(db, "allowed_users", userEmail);
        await updateDoc(userRef, {
          bonusQuestionShown: true
        });
        setBonusQuestionShown(true);
      } catch (error) {
        console.error("Error updating bonus question shown status:", error);
      }
    }
  };

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

  useEffect(() => {
    const k = async () => {
      try {
        const completedQuestionsRef =await getDoc(
          doc(db, "allowed_users", userEmail)
        );
        const currentUserQuestions = completedQuestionsRef.data().completedQuestions.length || 0;
        
        if(isQuizActive)
          setActiveQuestion(currentUserQuestions+1);



        console.log("Current User Questions:", currentUserQuestions);
      } catch (error) {
        console.error("Error fetching completed questions:", error);
      }
    };
    k();
  }, [isQuizActive]);


  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const handleViolation = (violation) => {
    // Add warning
    const warning = {
      id: Date.now(),
      message: `Warning: ${violation.reason}`,
    };
    
    setWarnings(prev => [...prev, warning]);
    
    // Auto-remove warning after 5 seconds
    setTimeout(() => {
      setWarnings(prev => prev.filter(w => w.id !== warning.id));
    }, 5000);
    
    // Display special warning for tab switch violations
    if (violation.isTabSwitch) {
      const tabSwitchWarning = {
        id: Date.now() + 1,
        message: `Tab switch detected (${violation.count} total)`,
      };
      setWarnings(prev => [...prev, tabSwitchWarning]);

      setTimeout(() => {
        setWarnings(prev => prev.filter(w => w.id !== tabSwitchWarning.id));
      }
      , 5000);
    }
  };

  const currentQuestion = questions.find((q) => q.id === activeQuestion);

  return (
    <QuizRestrictions onViolation={handleViolation}>
      <div className="flex h-screen">
        <Sidebar
          activeQuestion={activeQuestion}
          completedQuestions={completedQuestions}
          onQuestionChange={handleQuestionChange}
          onLogout={handleLogout}
          isQuizActive={isQuizActive}
          setHintsOn={setHintsOn}
        />
      
        <main className="flex-1 p-6 overflow-auto text-white">
          {/* Warning toasts */}
          <div className="fixed top-4 right-4 z-50">
            {warnings.map(warning => (
              <div key={warning.id} className="bg-red-500 text-white px-4 py-2 rounded mb-2 shadow-lg">
                {warning.message}
              </div>
            ))}
          </div>
          
          {completedQuestions.length === questions.length ? (
              <ThankYou />
          ) : (activeQuestion === "leaderboard" || timeRemaining <= 0) ? (
              <Leaderboard 
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
                isTimerRunning={isTimerRunning}
                startTime={quizStartEpoch}
                bonusTime={bonusTime}
              />
          ) : !isQuizActive ? (
              <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                  <h1 className="text-3xl font-bold mb-6">Quiz Not Started Yet</h1>
                  <p className="text-xl mb-6">
                  The quiz will start at {quizStartTime.hour}:{String(quizStartTime.minute).padStart(2, '0')}
                  </p>
                  <div className="text-4xl font-mono mb-8 text-purple-400">{timeUntilStart}</div>
                  <p className="text-gray-400">Please wait until the scheduled time to begin the quiz.</p>
              </div>
              </div>
          ) : (
              <>
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">{currentQuestion?.title}</h1>
                  <h1 className="text-2xl font-bold">Points: {points}</h1>
                  <Timer 
                    timeRemaining={timeRemaining} 
                    setTimeRemaining={setTimeRemaining} 
                    isRunning={isTimerRunning} 
                    startTime={quizStartEpoch}
                    bonusTime={bonusTime}
                  />
              </div>
              <QuestionArea 
                question={currentQuestion} 
                onSubmit={handleAnswerSubmit} 
                userId={userEmail} 
                startTime={quizStartEpoch} 
                compq={completedQuestions} 
                bonusShown={bonusQuestionShown}
                onBonusShown={handleBonusQuestionShown}
                bonusTime={bonusTime}
              />
              </>
          )}
          <Hints HintsOn={HintsOn} setHintsOn={setHintsOn}/>
        </main>
      </div>
    </QuizRestrictions>
  );
}

export default Dashboard;