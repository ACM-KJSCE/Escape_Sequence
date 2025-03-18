import { CheckCircle, Lock, Clock } from "lucide-react"

function Sidebar({ activeQuestion, completedQuestions, onQuestionChange, onLogout, isQuizActive }) {
  const menuItems = [
    { id: 1, label: "Q1" },
    { id: 2, label: "Q2" },
    { id: 3, label: "Q3" },
    { id: "leaderboard", label: "Leaderboard" },
  ]
  
  const isQuestionAvailable = (questionId) => {
    if (questionId === "leaderboard") return true
    if (!isQuizActive) return false
    if (questionId === 1) return true
    return completedQuestions.includes(questionId - 1)
  }

  const isQuestionCompleted = (questionId) => {
    return typeof questionId === "number" && completedQuestions.includes(questionId)
  }

  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-purple-400">Code Red</h2>
      </div>

      <nav className="flex-1">
        {!isQuizActive && (
          <div className="mb-4 px-4 py-2 bg-gray-700 rounded-lg text-yellow-300 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Quiz not started yet</span>
          </div>
        )}
        
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isAvailable = isQuestionAvailable(item.id)
            const isCompleted = isQuestionCompleted(item.id)

            return (
              <li key={item.id}>
                <button
                  onClick={() => onQuestionChange(item.id)}
                  disabled={!isAvailable}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between
                    ${
                      activeQuestion === item.id
                        ? "bg-purple-600 text-white"
                        : isAvailable
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-500 bg-gray-700 cursor-not-allowed"
                    }`}
                >
                  <span>{item.label}</span>

                  {item.id !== "leaderboard" && (
                    <span className="ml-2">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : !isQuizActive ? (
                        <Clock className="h-4 w-4 text-yellow-300" />
                      ) : !isAvailable ? (
                        <Lock className="h-4 w-4 text-gray-500" />
                      ) : null}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar