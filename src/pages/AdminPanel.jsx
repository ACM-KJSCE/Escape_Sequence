import { useState, useEffect } from "react";
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedPoints, setUpdatedPoints] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "allowed_users"));
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail.trim()) return alert("Enter a valid email!");
    const userRef = doc(db, "allowed_users", newUserEmail);

    try {
      await setDoc(userRef, {
        name: newUserName || newUserEmail.split("@")[0],
        answer1: "",
        answer2: "",
        answer3: "",
        points: 0,
        completedQuestions: [],
        timestamps: {},
        tabSwitchCount: 0
      }, { merge: true });
      alert("User Created Successfully!");
      setNewUserEmail("");
      setNewUserName("");
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete ${userId}?`)) return;
    try {
      await deleteDoc(doc(db, "allowed_users", userId));
      alert("User Deleted!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Update a user's points using updateDoc
  const handleUpdateUser = async () => {
    if (!selectedUser) return alert("Select a user to update!");
    try {
      const userRef = doc(db, "allowed_users", selectedUser.id);
      await updateDoc(userRef, { points: updatedPoints });
      alert("User Updated!");
      setSelectedUser(null);
      setUpdatedPoints(0);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Reset a user's progress (without overwriting other fields)
  const handleResetUser = async (userId) => {
    if (!window.confirm(`Reset ${userId}'s progress?`)) return;
    try {
      const userRef = doc(db, "allowed_users", userId);
      await updateDoc(userRef, { 
        points: 0, 
        completedQuestions: [], 
        timestamps: {},
        tabSwitchCount: 0
      });
      alert("User Progress Reset!");
      fetchUsers();
    } catch (error) {
      console.error("Error resetting user:", error);
    }
  };

  // Reset tab switch count only
  const handleResetTabSwitches = async (userId) => {
    try {
      const userRef = doc(db, "allowed_users", userId);
      await updateDoc(userRef, { tabSwitchCount: 0 });
      alert("Tab switch count reset!");
      fetchUsers();
    } catch (error) {
      console.error("Error resetting tab switches:", error);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* Create User */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Create User</h3>
        <input
          type="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          placeholder="User Email"
          className="p-2 rounded bg-gray-700 border border-gray-600 w-full mb-2"
        />
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="User Name (Optional)"
          className="p-2 rounded bg-gray-700 border border-gray-600 w-full mb-2"
        />
        <button onClick={handleCreateUser} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
          Create User
        </button>
      </div>

      {/* Update User */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Update User Points</h3>
        <select
          value={selectedUser?.id || ""}
          onChange={(e) => {
            const user = users.find((u) => u.id === e.target.value);
            setSelectedUser(user);
            setUpdatedPoints(user?.points || 0);
          }}
          className="p-2 rounded bg-gray-700 border border-gray-600 w-full mb-2"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.id})
            </option>
          ))}
        </select>
        {selectedUser && (
          <>
            <input
              type="number"
              value={updatedPoints}
              onChange={(e) => setUpdatedPoints(Number(e.target.value))}
              className="p-2 rounded bg-gray-700 border border-gray-600 w-full mb-2"
            />
            <button onClick={handleUpdateUser} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Update Points
            </button>
          </>
        )}
      </div>

      {/* User List with Tab Switch Count */}
      <h3 className="text-xl mb-2">Manage Users</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="bg-gray-800 px-4 py-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span>
                {user.name} ({user.id}) - <strong>{user.points} pts</strong>
              </span>
              <div>
                <button
                  onClick={() => handleResetUser(user.id)}
                  className="bg-yellow-500 px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                >
                  Reset
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className={`${user.tabSwitchCount > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                Tab switches: <strong>{user.tabSwitchCount || 0}</strong>
              </span>
              {user.tabSwitchCount > 0 && (
                <button
                  onClick={() => handleResetTabSwitches(user.id)}
                  className="bg-indigo-600 px-2 py-1 text-xs rounded hover:bg-indigo-700"
                >
                  Reset Tab Switches
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
