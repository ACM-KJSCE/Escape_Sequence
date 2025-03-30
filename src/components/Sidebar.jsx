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
    <aside className="w-64 p-4 flex flex-col text-whtie mt-4 border-2 border-white m-2 rounded-xl h-[70vh] font-bold">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white"><span className="text-red-600">Escape</span> Sequence</h2>
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
                  disabled={!isAvailable || isCompleted}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between border-2 border-black hover:scale-105 hover:bg-gray-50 transition-all duration-300
                    ${
                      activeQuestion === item.id
                        ? "bg-red-600 text-white"
                        : isAvailable ? isCompleted ? "cursor-not-allowed" : "text-white hover:bg-gray-700" : "text-gray-500"
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
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:scale-105 cursor-pointer transition-all duration-300 border-2 border-black"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar