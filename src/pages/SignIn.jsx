import React, { useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [outputLines, setOutputLines] = useState([
    { text: "You need to authenticate to continue!", color: "text-gray-500" },
    { text: "Please enter your teamId:", color: "text-sky-300" },
  ]);
  const navigate = useNavigate();

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!email.trim()) {
        addOutputLine("Please enter a valid teamId!", "text-red-500");
        return;
      }

      addOutputLine(`Authenticating: ${email}`, "text-amber-400");

      try {
        const userRef = doc(db, "allowed_users", email);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error("Access denied. Your email is not authorized.");
        }

        const userData = userDoc.data();
        const isAdmin = userData && userData.isAdmin === true;

        localStorage.setItem("userEmail", email);

        addOutputLine("Authentication successful!", "text-green-500");

        setTimeout(() => {
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } catch (err) {
        addOutputLine(err.message, "text-red-500");
        setError(err.message);
      }

      setEmail("");
    }
  };

  const addOutputLine = (text, color) => {
    setOutputLines((prev) => [...prev, { text, color }]);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div>
        <img className="h-24 mb-5" src="logo_withoutbg.png" alt="" />
      </div>
      <div>
        <img className="h-24" src="esc.png" alt="" />
      </div>
      <div className="terminal p-5 rounded-lg font-mono">
        <div className="terminal-header bg-zinc-700 text-white p-2 rounded-t-lg flex items-center">
          <span className="text-red-500 text-5xl leading-[0px] align-middle -mt-2">
            •
          </span>
          <span className="text-yellow-500 text-5xl leading-[0px] align-middle -mt-2 ml-1">
            •
          </span>
          <span className="text-green-500 text-5xl leading-[0px] align-middle -mt-2 ml-1">
            •
          </span>
          <span className="ml-4 align-baseline">
            Do you have what it takes to Escape? -- bash -- zsh
          </span>
        </div>
        <div
          className="pl-4 pt-2 bg-gray-900 max-h-[500px] overflow-auto"
          id="output"
          style={{ minHeight: "200px" }}
        >
          {outputLines.map((line, index) => (
            <p key={index} className={line.color}>
              {line.text}
            </p>
          ))}
        </div>
        <div
          className="input flex pl-4 bg-gray-900 pb-4 rounded-b-lg items-center"
          id="terminal-input-container"
        >
          <span className="text-green-500">➝</span>
          <span className="text-sky-300 ml-2">~</span>
          <input
            className="bg-transparent border-none outline-none ring-0 focus:ring-0 text-amber-400 ml-2 w-full"
            id="terminal-input"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
