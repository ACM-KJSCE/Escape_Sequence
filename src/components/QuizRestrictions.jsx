import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, arrayUnion, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

const QuizRestrictions = ({ children, onViolation }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const timeOffScreenRef = useRef(0);
  const lastHiddenTimeRef = useRef(null);
  const userEmail = localStorage.getItem("userEmail");
  const tabSwitchCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const isUpdatingRef = useRef(false);

  // Load tab switch count on mount
  useEffect(() => {
    const loadTabSwitchCount = async () => {
      if (userEmail) {
        try {
          const userRef = doc(db, "allowed_users", userEmail);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.tabSwitchCount !== undefined) {
              tabSwitchCountRef.current = userData.tabSwitchCount;
              setTabSwitches(userData.tabSwitchCount);
              console.log(`Initial tab switch count loaded: ${userData.tabSwitchCount}`);
            }
          }
        } catch (error) {
          console.error("Error loading tab switch count:", error);
        }
      }
    };

    loadTabSwitchCount();

    return () => {
      isMountedRef.current = false;
    };
  }, [userEmail]);

  // Track tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isQuizActive = document.body.classList.contains('quiz-active') || 
                           sessionStorage.getItem('quizActive') === 'true' ||
                           window.isContestActive;

      if (!isQuizActive) return;

      if (document.hidden) {
        // Record the time when user left the tab
        lastHiddenTimeRef.current = new Date();
        handleViolation('Tab switching detected', true);
      } else if (lastHiddenTimeRef.current) {
        // Calculate time spent off screen when the tab becomes visible again
        const timeAway = new Date() - lastHiddenTimeRef.current;
        timeOffScreenRef.current += timeAway;
        
        // Log the return without incrementing tab switch count
        logTimeAway(Math.round(timeAway/1000));
        
        lastHiddenTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track focus changes
  useEffect(() => {
    const handleFocusChange = (e) => {
      const isQuizActive = document.body.classList.contains('quiz-active') || 
                          sessionStorage.getItem('quizActive') === 'true' ||
                          window.isContestActive;

      if (!isQuizActive) return;

      if (e.type === 'blur') {
        lastHiddenTimeRef.current = new Date();
        handleViolation('Window focus lost', true);
      } else if (e.type === 'focus' && lastHiddenTimeRef.current) {
        const timeAway = new Date() - lastHiddenTimeRef.current;
        timeOffScreenRef.current += timeAway;
        
        // Log the return without incrementing tab switch count
        logTimeAway(Math.round(timeAway/1000));
        
        lastHiddenTimeRef.current = null;
      }
    };

    window.addEventListener('blur', handleFocusChange);
    window.addEventListener('focus', handleFocusChange);
    return () => {
      window.removeEventListener('blur', handleFocusChange);
      window.removeEventListener('focus', handleFocusChange);
    };
  }, []);

  // Monitor fullscreen state
  useEffect(() => {
    const handleFullScreenChange = () => {
      const isDocFullScreen = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement;

      setIsFullScreen(!!isDocFullScreen);

      const isQuizActive = document.body.classList.contains('quiz-active') || 
                          sessionStorage.getItem('quizActive') === 'true' ||
                          window.isContestActive;

      if (!isDocFullScreen && isFullScreen && isQuizActive) {
        handleViolation('Full-screen mode exited', true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, [isFullScreen]);

  // Function to log time spent away from the quiz
  const logTimeAway = async (secondsAway) => {
    if (!userEmail || secondsAway <= 0) return;
    
    try {
      const userRef = doc(db, "allowed_users", userEmail);
      await updateDoc(userRef, {
        timeOffscreen: increment(secondsAway),
        violations: arrayUnion({
          reason: `Returned after ${secondsAway} seconds away`,
          timestamp: new Date().toISOString(),
          secondsAway: secondsAway
        })
      });
      console.log(`Logged ${secondsAway} seconds away from quiz`);
    } catch (error) {
      console.error("Error logging time away:", error);
    }
  };

  // Handle violation - just for tab switches
  const handleViolation = async (reason, isTabSwitch = false) => {
    const isQuizActive = document.body.classList.contains('quiz-active') || 
                         sessionStorage.getItem('quizActive') === 'true' ||
                         window.isContestActive;

    if (!isQuizActive) return;

    // Handle tab switch count update
    if (isTabSwitch && !isUpdatingRef.current && userEmail) {
      isUpdatingRef.current = true; // Lock to prevent concurrent updates
      
      try {
        // Use Firestore's increment for atomic updates
        const userRef = doc(db, "allowed_users", userEmail);
        
        console.log(`Incrementing tab switch count for user: ${userEmail}`);
        
        await updateDoc(userRef, {
          tabSwitchCount: increment(1),
          violations: arrayUnion({
            reason,
            timestamp: new Date().toISOString()
          })
        });
        
        // Get the updated value
        const updatedDoc = await getDoc(userRef);
        if (updatedDoc.exists()) {
          const newCount = updatedDoc.data().tabSwitchCount || 0;
          console.log(`Tab switch count after update: ${newCount}`);
          
          // Update our local reference
          tabSwitchCountRef.current = newCount;
          
          // Update state if component is still mounted
          if (isMountedRef.current) {
            setTabSwitches(newCount);
          }
        }
      } catch (error) {
        console.error("Error logging tab switch:", error);
        console.error("Error details:", error.code, error.message);
      } finally {
        isUpdatingRef.current = false;
      }
    }

    // Notify parent component
    if (onViolation) {
      onViolation({
        reason,
        count: tabSwitchCountRef.current,
        timestamp: new Date(),
        isTabSwitch
      });
    }
  };

  // Request fullscreen
  const requestFullScreen = () => {
    const docEl = document.documentElement;

    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen();
    }
  };

  // Auto-request fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFullScreen) {
        requestFullScreen();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {!isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md border-2 border-red-500">
            <h2 className="text-2xl font-bold mb-4 text-white">Full-Screen Required</h2>
            <p className="text-gray-300 mb-6">This quiz must be taken in full-screen mode for security reasons.</p>
            <button 
              onClick={requestFullScreen} 
              className="px-6 py-3 bg-red-600 text-white font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
            >
              Enter Full-Screen Mode
            </button>
            <p className="mt-4 text-yellow-400 text-sm">
              Warning: Tab switches and time spent away are being monitored.
            </p>
          </div>
        </div>
      )}

      {isFullScreen && children}
    </div>
  );
};

export default QuizRestrictions;