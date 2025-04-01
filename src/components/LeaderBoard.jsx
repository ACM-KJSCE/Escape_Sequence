import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";


function parseTimeStr(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let hours = 0, minutes = 0, seconds = 0;
  if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  }
  return hours * 3600 + minutes * 60 + seconds;
}

function formatTime(totalSeconds) {
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function Leaderboard() {
  const [users, setUsers] = useState([]);

  const processData = (querySnapshot) => {
    const leaderboardData = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      const timestamps = userData.timestamps || {};

      let latestTimestamp = null;
      if (timestamps) {
        const questionIds = Object.keys(timestamps)
          .map(Number)
          .sort((a, b) => b - a);
        if (questionIds.length > 0) {
          latestTimestamp = timestamps[questionIds[0]];
        }
      }

      return {
        email: doc.id,
        name: userData.name || doc.id.split("@")[0],
        points: userData.points || 0,
        originalTimestamp: latestTimestamp,
        bonusTime: userData.bonusTime || 0,
        isAdmin: userData.isAdmin || false
      };
    });

    const filteredUsers = leaderboardData.filter(user => !user.isAdmin);

    const sortedUsers = filteredUsers
      .map(user => {
        let adjustedTimestamp = user.originalTimestamp;
        if (user.originalTimestamp && user.bonusTime !== 0) {
          const totalSeconds = parseTimeStr(user.originalTimestamp);
          const adjustedTotalSeconds = totalSeconds + (user.bonusTime * 60);
          adjustedTimestamp = formatTime(adjustedTotalSeconds);
        }
        return { ...user, latestTimestamp: adjustedTimestamp };
      })
      .sort((a, b) => {
        if (b.points === a.points) {
          const parseDisplayTime = (timeStr) => {
            if (!timeStr) return Infinity;
            return parseTimeStr(timeStr);
          };
          return parseDisplayTime(a.latestTimestamp) - parseDisplayTime(b.latestTimestamp);
        }
        return b.points - a.points;
      });

    setUsers(sortedUsers);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "allowed_users"));
        processData(querySnapshot);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "allowed_users"), (querySnapshot) => {
      processData(querySnapshot);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="rounded-xl p-6 shadow-lg border-2 border-white">
      <h2 className="text-4xl font-bold mb-4 text-red-600">Leaderboard</h2>
      <ul className="space-y-3">
        {users.map((user, index) => (
          <li
            key={user.email}
            className="flex justify-between items-center px-4 py-2 rounded-lg text-white border text-xl"
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">
                {index + 1}. {user.name}
              </span>
              {user.latestTimestamp && (
                <span className={`text-gray-400 text-sm ${
                  user.bonusTime > 0 ? 'text-yellow-400' : 
                  user.bonusTime < 0 ? 'text-green-400' : ''
                }`}>
                  Last: {user.latestTimestamp}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-green-400 font-bold">{user.points} pts</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
