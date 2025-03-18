import { useEffect } from "react"

function Timer({ timeRemaining, setTimeRemaining, isRunning, startTime }) {
  const CONTEST_DURATION = 2700;
  
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

  let timerColor = "text-green-400";
  if (timeRemaining < 60) {
    timerColor = "text-red-400";
  } else if (timeRemaining < 300) { // Less than 5 minutes
    timerColor = "text-yellow-400";
  }

  return <div className={`text-xl font-mono font-bold ${timerColor}`}>{formattedTime}</div>;
}

export default Timer;