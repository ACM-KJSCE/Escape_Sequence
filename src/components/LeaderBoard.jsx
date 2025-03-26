import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { onSnapshot } from "firebase/firestore";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "allowed_users"));
        const leaderboardData = querySnapshot.docs.map((doc) => {
          const userData = doc.data();
          const timestamps = userData.timestamps || {};
          
          // Find the latest timestamp (highest question number)
          let latestTimestamp = null;
          if (timestamps) {
            const questionIds = Object.keys(timestamps).map(Number).sort((a, b) => b - a);
            if (questionIds.length > 0) {
              latestTimestamp = timestamps[questionIds[0]];
            }
          }
          
          return {
            email: doc.id,
            name: userData.name || doc.id.split("@")[0],
            points: userData.points || 0,
            latestTimestamp: latestTimestamp,
          };
        });

        const sortedUsers = leaderboardData.sort((a, b) => {
          if (b.points === a.points) {
            if (a.latestTimestamp && b.latestTimestamp) {
              const parseTime = (timeStr) => {
                if (!timeStr) return Infinity;
                const [hours, minutes, seconds] = timeStr.split(":").map(Number);
                return hours * 3600 + minutes * 60 + seconds;
              };
              
              return parseTime(a.latestTimestamp) - parseTime(b.latestTimestamp);
            }
            
            return a.latestTimestamp ? -1 : b.latestTimestamp ? 1 : 0;
          }
          return b.points - a.points;
        });
        
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "allowed_users"), (querySnapshot) => {
      // console.log(querySnapshot)
      // console.log(querySnapshot.docs)
      // console.log(querySnapshot.docs[0])
      const leaderboardData = querySnapshot.docs.map((doc) => {
        const userData = doc.data();
        const timestamps = userData.timestamps || {};
        
        let latestTimestamp = null;
        if (timestamps) {
          const questionIds = Object.keys(timestamps).map(Number).sort((a, b) => b - a);
          if (questionIds.length > 0) {
            latestTimestamp = timestamps[questionIds[0]];
          }
        }
        
        return {
          email: doc.id,
          name: userData.name || doc.id.split("@")[0],
          points: userData.points || 0,
          latestTimestamp: latestTimestamp,
        };
      });

      const sortedUsers = leaderboardData.sort((a, b) => {
        if (b.points === a.points) {
          if (a.latestTimestamp && b.latestTimestamp) {
            const parseTime = (timeStr) => {
              if (!timeStr) return Infinity;
              const [hours, minutes, seconds] = timeStr.split(":").map(Number);
              return hours * 3600 + minutes * 60 + seconds;
            };
            
            return parseTime(a.latestTimestamp) - parseTime(b.latestTimestamp);
          }
          return a.latestTimestamp ? -1 : b.latestTimestamp ? 1 : 0;
        }
        return b.points - a.points;
      });
      
      setUsers(sortedUsers);
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
      <ul className="space-y-3">
        {users.map((user, index) => (
          <li
            key={user.email}
            className="flex justify-between bg-gray-700 px-4 py-2 rounded-lg"
          >
            <span className="text-white font-medium">
              {index + 1}. {user.name}
            </span>
            {user.latestTimestamp && (
                <span className="text-gray-400">Last: {user.latestTimestamp}</span>
              )}
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