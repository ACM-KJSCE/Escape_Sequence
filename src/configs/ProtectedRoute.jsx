import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      const userEmail = localStorage.getItem("userEmail");
      
      if (!userEmail) {
        setIsAuth(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const userRef = doc(db, "allowed_users", userEmail);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.isAdmin === true) {
            setShowPasswordPrompt(true);
          } else {
            setIsAuth(false);
          }
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAuth(false);
      }
      
      setIsLoading(false);
    };
    
    checkAdminAccess();
  }, []);
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      setShowPasswordPrompt(false);
      sessionStorage.setItem("adminAuthenticated", "true");
    } else {
      setPasswordError("Incorrect password");
    }
  };
  
  useEffect(() => {
    if (showPasswordPrompt && sessionStorage.getItem("adminAuthenticated") === "true") {
      setIsAuth(true);
      setShowPasswordPrompt(false);
    }
  }, [showPasswordPrompt]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (showPasswordPrompt) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Authentication</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Enter Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-purple-500"
                placeholder="Password"
              />
              {passwordError && <p className="text-red-500 mt-2">{passwordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Authenticate
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-gray-300"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
