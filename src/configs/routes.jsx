import { createBrowserRouter } from "react-router-dom";
import DashBoard from "../pages/DashBoard.jsx";
import SignIn from "../pages/SignIn.jsx";
import AdminPanel from "../pages/AdminPanel.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const routes=createBrowserRouter([
    {
        path: '/',
        element: <SignIn />
    },
    {
        path: '/dashboard',
        element: <DashBoard />
    },
    {
        path: '/admin',
        element: <ProtectedRoute><AdminPanel /></ProtectedRoute>
    }
])

export default routes;