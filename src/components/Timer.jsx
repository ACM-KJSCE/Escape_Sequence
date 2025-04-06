import { useEffect } from "react"

function Timer({ timeRemaining, setTimeRemaining, isRunning, startTime }) {
  const CONTEST_DURATION = 3600;
  
  useEffect(() => {
    if (startTime) {
      const quizStartEpoch = startTime.getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - quizStartEpoch) / 1000);
      const remainingTime = Math.max(0, CONTEST_DURATION - elapsedSeconds);
      setTimeRemaining(remainingTime);
    } else {
      setTimeRemaining(CONTEST_DURATION);
      localStorage.setItem("quizStartTime", Date.now().toString());
    }
  }, []);

  useEffect(() => {
    let interval

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      console.log("Time's up!");
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, setTimeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  let timerColor = "text-green-500";
  if (timeRemaining < 60) {
    timerColor = "text-red-400";
  } else if (timeRemaining < 300) { 
    timerColor = "text-yellow-400";
  }

  return <div className={`text-3xl font-mono font-bold bg-white p-2 rounded-xl ${timerColor}`}>{formattedTime}</div>;
}

export default Timer;