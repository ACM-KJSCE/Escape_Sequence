import React, { useEffect, useState } from 'react';

const ThankYou = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <div 
        className={`transform transition-all duration-700 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="p-8 rounded-xl text-center max-w-md mx-4">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
            <div className="w-16 h-1 bg-blue-400 mx-auto mb-4 rounded-full"></div>
          </div>
          
          <p className="text-lg text-white mb-6">Please wait for the results to be declared.</p>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;