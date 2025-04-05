import React, { useState, useEffect } from 'react'

function BonusQuestion({ question, onClose, onSubmit, onTimeUp,handleBonusQuestionContinue, handleBonusQuestionSkip,setShowBonusQuestion,showBonusQuestion }) {
  const [answer, setAnswer] = useState("");
  const [remainingTime, setRemainingTime] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    onSubmit(answer);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 w-full max-w-2xl p-6 rounded-xl shadow-2xl border-2 border-purple-500 animate-bounce-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">⭐ Choo-Choo Cipher (BonusQuestion) ⭐</h2>
          <div className="text-xl font-mono font-bold text-red-400">
            {remainingTime.toString().padStart(2, '0')} seconds
          </div>
        </div>
        
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          {/* <p className="text-white">{question?.content || "Bonus question content"}</p> */}
         
          <img src="https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/Bonus%20(1).png?alt=media&token=b8753282-7c8b-4e77-9802-145421f951f7" alt="Bonus" className='' />
          <img src="https://firebasestorage.googleapis.com/v0/b/acm-fy-rep-login.appspot.com/o/Bonus%20(2).png?alt=media&token=271d9acf-d980-4bff-9beb-c08ee2e235a5" alt="hint" />
          
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm text-gray-300 mb-1">Reward: -2 minutes | Penalty: +2 minutes</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-purple-500 mb-4"
              placeholder="Type your answer here..."
              autoFocus
            />
            
            <div className="flex space-x-2">
              {showBonusQuestion && <button
                type="submit"
                disabled={!answer.trim() || isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  answer.trim() && !isSubmitting ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"
                } transition-colors`}
              >
                Submit
              </button>}
              
              {!showBonusQuestion &&(
                <>
                 <button
                type="button"
                onClick={handleBonusQuestionContinue}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={()=>{
                  handleBonusQuestionSkip();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                Skip
              </button>
              </>
              )}
            
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BonusQuestion;